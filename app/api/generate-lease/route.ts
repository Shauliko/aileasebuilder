import { NextResponse } from "next/server";
import OpenAI from "openai";

import { markdownToHtml } from "../utils/markdownToHtml";
import { createPdfFromHtml } from "../utils/createPdf";
import { createDocxFromMarkdown } from "../utils/createDocx";
import { Document, HeadingLevel, Paragraph, TextRun } from "docx";
import { canGenerateLease, recordLeaseGeneration } from "../utils/usage";

// 🔥 State compliance
import { getComplianceForState } from "@/lib/getComplianceForState";

// 🔥 Postgres (Neon) – log FREE lease events into lease_events
import { Pool } from "pg";

// Ensure Node.js runtime (needed for crypto/Postgres)
export const runtime = "nodejs";

// -----------------------------------------------------------
// Neon / Postgres pool (for FREE events into lease_events)
// -----------------------------------------------------------
const databaseUrl = process.env.DATABASE_URL || "";

const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      max: 3,
    })
  : null;

async function insertFreeLeaseEvent(params: {
  email: string | null;
  ip: string;
  state: string | null;
}) {
  if (!pool) {
    console.error(
      "insertFreeLeaseEvent: DATABASE_URL not configured; skipping lease_events insert."
    );
    return;
  }

  const client = await pool.connect();
  try {
    await client.query(
      `
      INSERT INTO lease_events (
        user_id,
        email,
        type,
        amount,
        currency,
        product,
        lease_id,
        stripe_session_id,
        stripe_customer,
        metadata
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    `,
      [
        params.email,
        params.email,
        "free", // type
        0, // amount
        "usd", // currency
        "free-generation", // product
        null, // lease_id
        null, // stripe_session_id
        null, // stripe_customer
        {
          ip: params.ip,
          state: params.state,
        },
      ]
    );
  } catch (err) {
    console.error("Neon insert error (free lease event):", err);
  } finally {
    client.release();
  }
}

// -----------------------------------------------------------
// PRIVILEGED USERS — can bypass free-tier & multilingual limits
// -----------------------------------------------------------
const privilegedUsers: string[] =
  process.env.PRIVILEGED_USERS?.split(",").map((u) => u.trim()) || [];

// -----------------------------------------------------------
// SAFE JSON PARSER — strips ```json fences & extracts JSON only
// -----------------------------------------------------------
function safeJsonParse(raw: string) {
  if (!raw) return {};

  let cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");

  if (first !== -1 && last !== -1) {
    cleaned = cleaned.substring(first, last + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("safeJsonParse FAILED:", raw);
    return {};
  }
}

// -----------------------------------------------------------
// Markdown → DOCX Paragraphs (fallback for translations)
// -----------------------------------------------------------
function convertMarkdownToDocxParagraphs(md: string) {
  const lines = md.split("\n");
  const paragraphs: Paragraph[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      paragraphs.push(new Paragraph({ children: [new TextRun("")] }));
      continue;
    }

    // # H1
    if (trimmed.startsWith("# ")) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace("# ", ""),
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        })
      );
      continue;
    }

    // ## H2
    if (trimmed.startsWith("## ")) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace("## ", ""),
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 },
        })
      );
      continue;
    }

    // Bullet list
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace(/^[-*] /, ""),
          bullet: { level: 0 },
        })
      );
      continue;
    }

    // Normal paragraph
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: trimmed, size: 24 })],
        spacing: { after: 200 },
      })
    );
  }

  return paragraphs;
}

// ==========================================================
// MAIN HANDLER
// ==========================================================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("DEBUG BODY RECEIVED:", body);

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const { languages = [] } = body;

    // -----------------------------------------------------------
    // IP for server-side enforcement
    // -----------------------------------------------------------
    const xff = req.headers.get("x-forwarded-for");
    const ip =
      (xff && xff.split(",")[0].trim()) ||
      req.headers.get("x-real-ip") ||
      "unknown";

    console.log("ADMIN DEBUG — Incoming IP:", ip);

    // -----------------------------------------------------------
    // Infer email and plan (non-breaking)
    // -----------------------------------------------------------
    const emailFromBody: string | undefined =
      body.userEmail || body.email || body.user?.email;

    const planType: string = body.planType || "free";

    const isPrivilegedUser =
      !!emailFromBody && privilegedUsers.includes(emailFromBody);

    // -----------------------------------------------------------
    // Server-side FREE-TIER enforcement (IP + email)
    // -----------------------------------------------------------
    const adminIPs = ["127.0.0.1", "::1", "192.168.1.238"];

    if (!isPrivilegedUser && planType === "free" && !adminIPs.includes(ip)) {
      const { allowed } = await canGenerateLease(
        emailFromBody || null,
        ip
      );

      if (!allowed) {
        return NextResponse.json(
          {
            error:
              "Free lease limit reached. Please upgrade to continue generating leases.",
            code: "FREE_TIER_LIMIT_REACHED",
          },
          { status: 402 }
        );
      }
    }

    // -----------------------------------------------------------
    // Multilingual restriction for FREE users (unless privileged)
    // -----------------------------------------------------------
    if (!isPrivilegedUser && planType === "free" && languages.length > 0) {
      return NextResponse.json(
        {
          error:
            "Free tier supports only English leases. Upgrade to generate multilingual leases.",
          code: "FREE_TIER_MULTILINGUAL_BLOCKED",
        },
        { status: 403 }
      );
    }

    // -----------------------------------------------------------
    // 🔥 STATE COMPLIANCE INJECTION
    // -----------------------------------------------------------
    const compliance = getComplianceForState(
      body.state || body.propertyState || "DEFAULT"
    );

    // ==========================================================
    // STEP 1 — GENERATE MAIN ENGLISH LEASE
    // ==========================================================
    const selectedClauses: string[] = body.optionalClauses || [];
    const mainPrompt = `
You are an expert U.S. real estate attorney. Generate a complete, professional, legally compliant residential lease agreement.

STATE SELECTED: ${body.state || body.propertyState}

MANDATORY COMPLIANCE REQUIREMENTS:
- Governing Law / Landlord-Tenant Act: ${compliance.landlordTenantAct}
- Required Disclosures: ${compliance.disclosures.join(", ") || "None"}
- Habitability Rules: ${compliance.habitability.join(", ") || "None"}
- Addendums to Include: ${compliance.addendums.join(", ") || "None"}
- Forbidden Clauses (DO NOT INCLUDE): ${compliance.forbiddenClauses.join(", ") || "None"}

STRICT OUTPUT RULES:
- Output only VALID JSON.
- No markdown fences.
- Must include:
  "lease_markdown": "...",
  "addendums_markdown": [],
  "checklist_markdown": "..."

Word count target: 1500–3500 words.

INPUT:
${JSON.stringify(body, null, 2)}

OUTPUT FORMAT EXAMPLE:
{
  "lease_markdown": ".",
  "addendums_markdown": [],
  "checklist_markdown": "."
}
`;

    const english = await client.responses.create({
      model: "gpt-4.1",
      input: mainPrompt,
    });

    const englishText = english.output_text || "";
    const parsed = safeJsonParse(englishText);

    const leaseMd = parsed.lease_markdown || "";
    const checklistMd = parsed.checklist_markdown || "";

    // ==========================================================
    // STEP 2 — PDF (UPGRADED)
    // ==========================================================
    const leaseHtml = await markdownToHtml(leaseMd);
    const leasePdfBuf = await createPdfFromHtml(leaseHtml);
    const leasePdfBase64 = leasePdfBuf.toString("base64");

    // ==========================================================
    // STEP 3 — DOCX (UPGRADED)
    // ==========================================================
    const leaseDocxBuf = await createDocxFromMarkdown(leaseMd);
    const leaseDocxBase64 = leaseDocxBuf.toString("base64");

    // ==========================================================
    // STEP 4 — TRANSLATIONS
    // ==========================================================
    const translated: {
      language: string;
      markdown: string;
      html: string;
      pdf_base64: string | null;
      docx_base64: string;
    }[] = [];

    const unicodeLanguages = [
      "Arabic",
      "Chinese (Simplified)",
      "Chinese (Traditional)",
      "Hebrew",
      "Hindi",
      "Japanese",
      "Korean",
      "Thai",
    ];

    for (const lang of languages as string[]) {
      const tPrompt = `
Translate the following residential lease into "${lang}".
Preserve markdown structure (### headings, - bullets).

Return ONLY VALID JSON:
{
  "language": "${lang}",
  "markdown": "."
}

LEASE TO TRANSLATE:
${leaseMd}
`;

      const tResp = await client.responses.create({
        model: "gpt-4.1",
        input: tPrompt,
      });

      const tText = tResp.output_text || "";
      const tJson = safeJsonParse(tText);

      const tMd = tJson.markdown || "";
      const tHtml = await markdownToHtml(tMd);

      // PDF: only for safer latin-languages
      let tPdfBase64: string | null = null;
      if (!unicodeLanguages.includes(lang)) {
        try {
          const tPdf = await createPdfFromHtml(tHtml);
          tPdfBase64 = tPdf.toString("base64");
        } catch (err) {
          console.error(`PDF failed for ${lang}`, err);
        }
      }

      // DOCX (fallback paragraphs)
      const tDocxBuf = await createDocxFromMarkdown(tMd);

      translated.push({
        language: lang,
        markdown: tMd,
        html: tHtml,
        pdf_base64: tPdfBase64,
        docx_base64: tDocxBuf.toString("base64"),
      });
    }

    // -----------------------------------------------------------
    // RECORD SUCCESSFUL FREE LEASE GENERATION (Neon + usage table)
    // -----------------------------------------------------------
    if (!isPrivilegedUser && planType === "free" && !adminIPs.includes(ip)) {
      await insertFreeLeaseEvent({
        email: emailFromBody || null,
        ip,
        state: body.state || body.propertyState || null,
      });

      // existing free-tier tracking
      await recordLeaseGeneration(emailFromBody || null, ip);
    }

    // ==========================================================
    // FINAL JSON RESPONSE
    // ==========================================================
    return NextResponse.json({
      success: true,
      userEmail: emailFromBody || null,
      isPrivilegedUser,
      planType,
      languages,
      lease_markdown: leaseMd,
      lease_html: leaseHtml,
      checklist_markdown: checklistMd,
      lease_pdf_base64: leasePdfBase64,
      lease_docx_base64: leaseDocxBase64,
      translated,
    });
  } catch (err: any) {
    console.error("API ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

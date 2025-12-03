import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

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
// Neon / Postgres pool
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
        "free",
        0,
        "usd",
        "free-generation",
        null,
        null,
        null,
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
// PRIVILEGED USERS
// -----------------------------------------------------------
const privilegedUsers: string[] =
  process.env.PRIVILEGED_USERS?.split(",").map((u) => u.trim()) || [];

// -----------------------------------------------------------
// SAFE JSON PARSER
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
// Claude content → plain text helper (fixes TS errors)
// -----------------------------------------------------------
function extractTextFromClaudeMessage(message: any): string {
  if (!message || !Array.isArray(message.content)) return "";

  return message.content
    .filter((block: any) => block.type === "text" && typeof block.text === "string")
    .map((block: any) => block.text)
    .join("\n")
    .trim();
}

// -----------------------------------------------------------
// Markdown → DOCX converter (kept as-is)
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

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace(/^[-*] /, ""),
          bullet: { level: 0 },
        })
      );
      continue;
    }

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

    // 🔥 Claude client
    const client = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY!,
    // forces personal-account mode, disables org inheritance
      defaultHeaders: {
        "Anthropic-Organization": ""
      }
   });

    const { languages = [] } = body;

    // -----------------------------------------------------------
    // IP capture
    // -----------------------------------------------------------
    const xff = req.headers.get("x-forwarded-for");
    const ip =
      (xff && xff.split(",")[0].trim()) ||
      req.headers.get("x-real-ip") ||
      "unknown";

    console.log("ADMIN DEBUG — Incoming IP:", ip);

    // -----------------------------------------------------------
    // Infer email + plan
    // -----------------------------------------------------------
    const emailFromBody: string | undefined =
      body.userEmail || body.email || body.user?.email;

    const planType: string = body.planType || "free";

    const isPrivilegedUser =
      !!emailFromBody && privilegedUsers.includes(emailFromBody);

    const adminIPs = ["127.0.0.1", "::1", "192.168.1.238"];

    // -----------------------------------------------------------
    // Free tier blocking
    // -----------------------------------------------------------
    if (!isPrivilegedUser && planType === "free" && !adminIPs.includes(ip)) {
      const { allowed } = await canGenerateLease(emailFromBody || null, ip);

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
    // Free tier language blocking
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
    // Compliance
    // -----------------------------------------------------------
    const compliance = getComplianceForState(
      body.state || body.propertyState || "DEFAULT"
    );

    // ==========================================================
    // STEP 1 — MAIN LEASE (Claude)
    // ==========================================================
    const mainPrompt = `
You are an expert U.S. real estate attorney. Generate a complete residential lease agreement.

STATE SELECTED: ${body.state || body.propertyState}

MANDATORY COMPLIANCE:
- Governing Law: ${compliance.landlordTenantAct}
- Required Disclosures: ${compliance.disclosures.join(", ") || "None"}
- Habitability Rules: ${compliance.habitability.join(", ") || "None"}
- Addendums Required: ${compliance.addendums.join(", ") || "None"}
- Forbidden Clauses: ${compliance.forbiddenClauses.join(", ") || "None"}

STRICT RULES:
- Output ONLY valid JSON (no markdown fences).
- Must include:
  "lease_markdown": "...",
  "addendums_markdown": [],
  "checklist_markdown": "..."

Word count target: 1500–3500 words.

INPUT:
${JSON.stringify(body, null, 2)}
`;

    const english = await client.messages.create({
      // use the latest Claude Sonnet; if this 404s, fall back to 20240620
      model: process.env.AI_MODEL!,
      max_tokens: 8000,
      messages: [
        { role: "user", content: "Return ONLY valid JSON, no backticks." },
        { role: "user", content: mainPrompt },
      ],
    });

    // 🔥 TS-safe text extraction (instead of .content?.[0]?.text)
    const englishText = extractTextFromClaudeMessage(english);
    const parsed = safeJsonParse(englishText);

    const leaseMd = parsed.lease_markdown || "";
    const checklistMd = parsed.checklist_markdown || "";

    // ==========================================================
    // STEP 2 — PDF
    // ==========================================================
    const leaseHtml = await markdownToHtml(leaseMd);
    const leasePdfBuf = await createPdfFromHtml(leaseHtml);
    const leasePdfBase64 = leasePdfBuf.toString("base64");

    // ==========================================================
    // STEP 3 — DOCX
    // ==========================================================
    const leaseDocxBuf = await createDocxFromMarkdown(leaseMd);
    const leaseDocxBase64 = leaseDocxBuf.toString("base64");

    // ==========================================================
    // STEP 4 — TRANSLATIONS (Claude)
    // ==========================================================
    // ==========================================================
// STEP 4 — TRANSLATIONS (Claude) — SURGICAL UPGRADE
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
You are a professional legal translator.

TASK:
Translate the FULL lease into the target language: "${lang}".

CRITICAL RULES:
- Translate EVERYTHING except proper nouns.
- NO English sentences in the output unless they are legally required or names of laws.
- Keep ALL markdown structure EXACTLY unchanged (headings, lists, spacing).
- Do NOT summarize, shorten, or rewrite.
- Do NOT add explanations.
- Output must be a 100% full translation.

OUTPUT FORMAT (STRICT):
Return ONLY valid JSON with NO backticks:
{
  "language": "${lang}",
  "markdown": "<THE FULL TRANSLATED MARKDOWN>"
}

SOURCE LEASE (MARKDOWN):
${leaseMd}
  `;

  const tResp = await client.messages.create({
    model: process.env.AI_MODEL!,
    max_tokens: 5000,
    messages: [
      {
        role: "user",
        content:
          "OUTPUT REQUIREMENT: Return ONLY valid JSON. NO backticks. NO commentary. NO English unless legally required or a proper noun.",
      },
      { role: "user", content: tPrompt },
    ],
  });

  const tText = extractTextFromClaudeMessage(tResp);
  const tJson = safeJsonParse(tText);

  const tMd = tJson.markdown || "";
  const tHtml = await markdownToHtml(tMd);

  let tPdfBase64: string | null = null;
  if (!unicodeLanguages.includes(lang)) {
    try {
      const tPdf = await createPdfFromHtml(tHtml);
      tPdfBase64 = tPdf.toString("base64");
    } catch (err) {
      console.error(`PDF failed for ${lang}`, err);
    }
  }

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
    // FREE TIER LOGGING
    // -----------------------------------------------------------
    if (!isPrivilegedUser && planType === "free" && !adminIPs.includes(ip)) {
      await insertFreeLeaseEvent({
        email: emailFromBody || null,
        ip,
        state: body.state || body.propertyState || null,
      });

      await recordLeaseGeneration(emailFromBody || null, ip);
    }

    // ==========================================================
    // FINAL JSON RESPONSE (kept identical to your version)
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
      files: {
        pdf: leasePdfBase64,
        docx: leaseDocxBase64,
      },
    });
  } catch (err: any) {
    console.error("API ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

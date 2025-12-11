import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { trackEventServer as trackEvent } from "@/lib/analytics/posthog-server";
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
            // ==========================================================
    // STEP 1 — MAIN LEASE (Claude)
    // ==========================================================
    const mainPrompt = `
    You are an expert U.S. landlord-tenant attorney. Draft a professional, state-compliant RESIDENTIAL LEASE AGREEMENT in clean markdown that will be converted directly to PDF.

    OBJECTIVE (CONDENSED, BUT PREMIUM):
    - Output a clear, modern lease that feels like a lawyer-drafted form.
    - Use strong headings, numbered sections, and tight bullet lists.
    - Keep it readable and practical (roughly 8–14 PDF pages when rendered), NOT a bloated 25-page monster.

    STATE SELECTED: ${body.state || body.propertyState}

    MANDATORY COMPLIANCE (THIS CONTROLS EVERYTHING):
    - Governing Law: ${compliance.landlordTenantAct}
    - Required Disclosures: ${compliance.disclosures.join(", ") || "None"}
    - Habitability Rules: ${compliance.habitability.join(", ") || "None"}
    - Required Addendums: ${compliance.addendums.join(", ") || "None"}
    - Forbidden Clauses (DO NOT INCLUDE): ${compliance.forbiddenClauses.join(", ") || "None"}

    OVERALL FORMATTING RULES (VERY IMPORTANT):
    - Use markdown headings with clear numbering. EXACTLY this pattern:
      - \`# RESIDENTIAL LEASE AGREEMENT\`
      - \`## 1. PARTIES\`
      - \`## 2. PROPERTY & LEASE TERM\`
      - \`## 3. RENT & FINANCIAL TERMS\`
      - \`## 4. UTILITIES & SERVICES\`
      - \`## 5. USE OF PREMISES\`
      - \`## 6. PETS\`
      - \`## 7. SMOKING POLICY\`
      - \`## 8. MAINTENANCE & REPAIRS\`
      - \`## 9. ALTERATIONS & IMPROVEMENTS\`
      - \`## 10. ENTRY & INSPECTION\`
      - \`## 11. ASSIGNMENT & SUBLETTING\`
      - \`## 12. INSURANCE & LIABILITY\`
      - \`## 13. RULES & COMMUNITY STANDARDS\`
      - \`## 14. DEFAULT & REMEDIES\`
      - \`## 15. EARLY TERMINATION\`
      - \`## 16. LEASE RENEWAL\`
      - \`## 17. DISCLOSURES\`
      - \`## 18. GENERAL PROVISIONS\`
      - \`## 19. MOVE-IN & MOVE-OUT\`
      - \`## 20. SPECIAL PROVISIONS\`
      - \`## 21. ACKNOWLEDGMENTS\`
      - \`## 22. SIGNATURES\`
      - \`## 23. ATTACHMENTS & EXHIBITS\`
    - Use short paragraphs and bullet lists, not long walls of text.
    - Use a blank line between paragraphs and bullet groups so the PDF has clear spacing.
    - NO page numbers, NO headers/footers, NO "Page X of Y".

    SECTION CONTENT REQUIREMENTS (MATCH THE UPGRADED LEASE STYLE, BUT CONDENSED):

    1) TITLE + INTRO
    - At the very top: \`# RESIDENTIAL LEASE AGREEMENT\`
    - Directly under it: \`State of [STATE] – [County or City if known]\`
    - Line for Agreement Date.

    2) PARTIES
    - Landlord block: name, address, phone, email.
    - Tenant(s) block: list one or more tenants with name/phone/email.

    3) PROPERTY & LEASE TERM
    - Property address (street, unit, city, state, ZIP).
    - Property type and key facts (bedrooms, bathrooms, square feet, parking spaces).
    - Lease term: start date, end date, total months.
    - One short paragraph about automatic month-to-month conversion unless written notice is given.

    4) RENT & FINANCIAL TERMS
    - Bullet list for:
      - Monthly rent, currency, due date.
      - Grace period (days).
      - Accepted payment methods.
      - Late fee rules (use INPUT; if no late fees, say they are not charged).
      - Returned/NSF fee.
      - Security deposit amount + what it can be used for.
      - Deadline and method for returning deposit, tied to state law.

    5) UTILITIES & SERVICES
    - Two bullet lists:
      - "Tenant responsible for:" (electricity, gas, water, etc. based on INPUT or defaults).
      - "Landlord responsible for:" (taxes, insurance on structure, major systems, etc.).
    - One short warning that failure to maintain utilities can be a violation, subject to state law.

    6) USE OF PREMISES
    - Short bullet list for permitted use (private residential dwelling only, max occupants).
    - Bullet list for prohibited uses (illegal activity, nuisance, commercial use without consent, etc.).
    - Guest policy (max consecutive days and total days per year; use INPUT where available).

    7) PETS
    - If INPUT says no pets: clearly state NO PETS and the consequence of unauthorized animals.
    - If pets allowed: clearly state pet deposit, monthly pet rent, max pets, behavior rules.
    - Always include a short sentence about service/assistance animals being handled per law.

    8) SMOKING POLICY
    - Clearly state whether smoking is prohibited entirely or limited to designated areas.
    - Short note on possible cleaning/damage charges and potential default.

    9) MAINTENANCE & REPAIRS
    - Split into:
      - "Landlord responsibilities" (structure, systems, code compliance, habitability).
      - "Tenant responsibilities" (cleanliness, minor upkeep, timely reporting).
    - Summarize non-emergency vs emergency procedures, using INPUT emergency contact fields.

    10) ALTERATIONS & IMPROVEMENTS
    - Brief bullets for what Tenant cannot do without written consent.
    - State that approved alterations may need restoration at move-out.

    11) ENTRY & INSPECTION
    - Bullet list for reasons landlord may enter.
    - Notice timing consistent with state law (tie back to compliance object).
    - Reasonable hours language and privacy expectations.

    12) ASSIGNMENT & SUBLETTING
    - No assignment or subletting without written consent.
    - If allowed, original tenant stays fully liable.
    - Unauthorized subletting = serious default.

    13) INSURANCE & LIABILITY
    - Clarify that landlord’s insurance covers building only.
    - Strong recommendation for renter’s insurance.
    - Liability waiver language that respects forbidden clauses (do NOT illegally waive mandatory rights).

    14) RULES & COMMUNITY STANDARDS
    - Parking rules (number of spaces, basic restrictions).
    - Trash & recycling rules.
    - Common area rules and guest behavior expectations.

    15) DEFAULT & REMEDIES
    - Concise bullet list of events of default.
    - Short list of landlord remedies, tied to state notice requirements and eviction process.

    16) EARLY TERMINATION
    - If INPUT \`earlyTerminationAllowed\` is false: clearly say early termination is not permitted except as required by law.
    - If true: describe the fee and conditions based on INPUT.
    - Always mention any key state-law exceptions (military, domestic violence, uninhabitable conditions, etc.) from the compliance object.

    17) LEASE RENEWAL
    - Short explanation of renewal or month-to-month conversion.
    - Notice required for rent increases and non-renewal.

    18) DISCLOSURES
    - Bullet list of all required disclosures for this state, using \`compliance.disclosures\`.
    - Include short sentences for things like lead-based paint, mold, bed bugs, rent control, etc. where applicable.

    19) GENERAL PROVISIONS
    - Condensed, standard boilerplate: governing law, entire agreement, severability, waiver, notices, attorney’s fees, fair housing, time is of the essence, joint and several liability.

    20) MOVE-IN & MOVE-OUT
    - Bullets for move-in expectations (checklist, documenting condition).
    - Bullets for move-out process (notice, inspection, cleaning, keys).
    - Summary of how and when the security deposit is returned and what can be deducted.

    21) SPECIAL PROVISIONS
    - A short section with either:
      - Extra negotiated terms based on INPUT, OR
      - A placeholder line where landlord can write additional terms.

    22) ACKNOWLEDGMENTS
    - Short bullet list of what tenant acknowledges (read lease, had chance for legal advice, received disclosures, etc.).

    23) SIGNATURES
    - Simple lines for:
      - Landlord signature, printed name, date.
      - One or more Tenant signatures, printed names, dates.

    24) ATTACHMENTS & EXHIBITS
    - Bullet list like:
      - Move-in/move-out condition checklist.
      - Pet agreement (if pets allowed).
      - Lead-based paint disclosure (if applicable).
      - HOA rules (if applicable).
      - Any other state-required or property-specific addendums.

    STRICT OUTPUT FORMAT (CRITICAL):
    - Output ONLY valid JSON (no backticks, no markdown fences, no extra commentary).
    - JSON MUST include:
      "lease_markdown": "<FULL lease in markdown using the sections above>",
      "addendums_markdown": ["<optional extra addendums in markdown, or leave empty>"],
      "checklist_markdown": "<separate, concise move-in/move-out checklist in markdown>"
    - Word count target for \`lease_markdown\`: roughly 1800–2800 words (condensed but complete).
    - Markdown MUST be clean: headings, short paragraphs, and bullet lists that render nicely to PDF.
    - Do NOT repeat the raw INPUT JSON inside the lease.
    DATE REQUIREMENTS:
    - You MUST use the provided lease start date exactly as given by the user:
        Start Date: ${body.startDate}
    - Never use today's date or the current year.
    - Never invent or assume dates.
    - The lease effective date MUST match the user-provided start date.


    INPUT DATA (USE THIS TO FILL IN ALL PRACTICAL DETAILS; DO NOT ECHO THE RAW JSON):
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
      trackEvent(
        "lease_generated",
        emailFromBody || ip || "unknown",
        {
          state: body.state,
          languages,
          planType,
          isPrivilegedUser,
          translatedCount: translated.length,
          timestamp: Date.now(),
        }
      );

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

// app/api/admin/generate-lease/route.ts
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { markdownToHtml } from "@/app/api/utils/markdownToHtml";
import { createPdfFromHtml } from "@/app/api/utils/createPdf";
import { createDocxFromMarkdown } from "@/app/api/utils/createDocx";
import { getComplianceForState } from "@/lib/getComplianceForState";

/* -----------------------------------------------------
   SAFE JSON PARSER — identical to main generator
----------------------------------------------------- */
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
    console.error("ADMIN safeJsonParse FAILED:", raw);
    return {};
  }
}

/* -----------------------------------------------------
   ADMIN BYPASS — unlimited lease generation
----------------------------------------------------- */
const adminEmails: string[] =
  process.env.PRIVILEGED_USERS?.split(",").map(e => e.trim().toLowerCase()) || [];

/* -----------------------------------------------------
   ROUTE HANDLER
----------------------------------------------------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const caller = body.adminEmail?.toLowerCase();
    if (!caller || !adminEmails.includes(caller)) {
      return NextResponse.json(
        { error: "Unauthorized admin access" },
        { status: 401 }
      );
    }

    /* -------------------------------
       Claude Client
    ------------------------------- */
    const client = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY!,
      defaultHeaders: { "Anthropic-Organization": "" }
    });

    /* -------------------------------
       State Compliance
    ------------------------------- */
    const compliance = getComplianceForState(body.state || body.propertyState || "DEFAULT");

    /* -----------------------------------------------------
       FULL LEASE PROMPT — identical to public generator
    ----------------------------------------------------- */
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
- Must include ALL of the following fields:
    "lease_markdown": "<FULL lease body>",
    "addendums_markdown": [],
    "checklist_markdown": "<move-in checklist>"
- lease_markdown MUST be 1500–3500 words.
- lease_markdown MUST include:
    - Definitions section
    - Payment terms
    - Utilities
    - Habitability obligations
    - Alterations
    - Liability
    - Notices
    - Renewal / termination rules
    - ALL required state disclosures for the selected state
- Format must be clean Markdown. Headings and spacing must be preserved.
- Never output explanations or commentary. JSON ONLY.
- ADMIN MODE: no usage limits, no billing, no restrictions.
DATE REQUIREMENTS:
- You MUST use the provided lease start date exactly as given by the user:
    Start Date: ${body.startDate}
- Never use today's date or the current year.
- Never invent or assume dates.
- The lease effective date MUST match the user-provided start date.

INPUT DATA:
${JSON.stringify(body, null, 2)}
`;

    /* -----------------------------------------------------
       CALL CLAUDE
    ----------------------------------------------------- */
    const resp = await client.messages.create({
      model: process.env.AI_MODEL!,
      max_tokens: 8000,
      messages: [
        { role: "user", content: "Return ONLY valid JSON. No backticks. No markdown fences." },
        { role: "user", content: mainPrompt }
      ]
    });

    const text = resp.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("\n")
      .trim();

    const json = safeJsonParse(text);

    if (!json || !json.lease_markdown) {
      console.error("ADMIN JSON FAILURE:", text);
      return NextResponse.json(
        { error: "Invalid JSON from AI (missing lease_markdown)" },
        { status: 500 }
      );
    }

    /* -----------------------------------------------------
       CONVERT TO HTML, PDF, DOCX
    ----------------------------------------------------- */
    const leaseMd = json.lease_markdown;
    // build full HTML before PDF
    let combinedMd = leaseMd;

    if (json.checklist_markdown) {
      combinedMd += "\n\n# Move-In / Move-Out Checklist\n\n";
      combinedMd += json.checklist_markdown;
    }

    if (json.addendums_markdown?.length) {
      combinedMd += "\n\n# Addendums\n\n";
      combinedMd += json.addendums_markdown.join("\n\n");
    }

    const leaseHtml = await markdownToHtml(combinedMd);


    const pdfBuf = await createPdfFromHtml(leaseHtml);
    const docxBuf = await createDocxFromMarkdown(leaseMd);

    /* -----------------------------------------------------
       RETURN SUCCESS
    ----------------------------------------------------- */
    return NextResponse.json({
      success: true,
      markdown: leaseMd,
      html: leaseHtml,
      pdf_base64: pdfBuf.toString("base64"),
      docx_base64: docxBuf.toString("base64"),
      addendums_markdown: json.addendums_markdown || [],
      checklist_markdown: json.checklist_markdown || ""
    });
  } catch (err: any) {
    console.error("ADMIN GENERATE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

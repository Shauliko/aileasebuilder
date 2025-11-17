import { NextResponse } from "next/server";
import OpenAI from "openai";
import { markdownToHtml } from "../utils/markdownToHtml";
import { createPdfFromHtml } from "../utils/createPdf";
import { Document, Packer, Paragraph } from "docx";

// -----------------------------------------------------------
// SAFE JSON PARSER — strips ```json fences & extracts JSON only
// -----------------------------------------------------------
function safeJsonParse(raw: string) {
  if (!raw) return {};

  // Remove ```json and ``` if present
  let cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  // Extract ONLY the JSON object
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");

  if (first !== -1 && last !== -1) {
    cleaned = cleaned.substring(first, last + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("safeJsonParse failed:", raw);
    return {};
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const { languages = [] } = body;

    // ========================================================
    // 🔥 STEP 1 — GENERATE THE MAIN ENGLISH LEASE
    // ========================================================
    const mainPrompt = `
You are an expert U.S. real estate attorney. Generate a complete, professional, legally compliant residential lease agreement.

STRICT OUTPUT RULES:
- Output only VALID JSON.
- No comments, no markdown fences.
- JSON must include:
  "lease_markdown": "...",
  "addendums_markdown": [],
  "checklist_markdown": "..."

Word count target: 1500–3500 words.

INPUT:
${JSON.stringify(body, null, 2)}

OUTPUT FORMAT:
{
  "lease_markdown": "...",
  "addendums_markdown": [],
  "checklist_markdown": "..."
}
`;

    const english = await client.responses.create({
      model: "gpt-4.1",
      input: mainPrompt
    });

    const englishText = english.output_text || "";
    const parsed = safeJsonParse(englishText);

    const leaseMd = parsed.lease_markdown || "";
    const checklistMd = parsed.checklist_markdown || "";

    // Convert English MD → HTML
    const leaseHtml = await markdownToHtml(leaseMd);

    // Create English PDF
    const leasePdf = await createPdfFromHtml(leaseHtml);

    // Create English DOCX
    const doc = new Document({
      sections: [{ children: [new Paragraph(leaseMd)] }]
    });
    const docxBuffer = await Packer.toBuffer(doc);

    // ========================================================
    // 🔥 STEP 2 — TRANSLATE INTO MULTIPLE LANGUAGES
    // ========================================================
    let translated: any[] = [];

    const unicodeLanguages = [
      "Arabic",
      "Chinese (Simplified)",
      "Chinese (Traditional)",
      "Hebrew",
      "Hindi",
      "Japanese",
      "Korean",
      "Thai"
    ];

    for (const lang of languages) {
      const translationPrompt = `
Translate the following residential lease into "${lang}" while preserving:

- Legal accuracy
- Structure & formatting
- Headings, lists, sections

Return ONLY valid JSON:
{
  "language": "${lang}",
  "markdown": "..."
}

LEASE TO TRANSLATE:
${leaseMd}
`;

      const translation = await client.responses.create({
        model: "gpt-4.1",
        input: translationPrompt
      });

      const tText = translation.output_text || "";
      const tJson = safeJsonParse(tText);

      const translatedMd = tJson.markdown || "";

      // Convert MD → HTML
      const tHtml = await markdownToHtml(translatedMd);

      // ---------------------------------------------
      // PDF GENERATION — ONLY FOR LATIN LANGUAGES
      // ---------------------------------------------
      let tPdfBase64: string | null = null;

      if (!unicodeLanguages.includes(lang)) {
        try {
          const tPdf = await createPdfFromHtml(tHtml);
          tPdfBase64 = tPdf.toString("base64");
        } catch (err) {
          console.warn(`PDF generation failed for ${lang}, skipping.`);
        }
      }

      // DOCX — always generates properly
      const tDoc = new Document({
        sections: [{ children: [new Paragraph(translatedMd)] }]
      });
      const tDocBuf = await Packer.toBuffer(tDoc);

      translated.push({
        language: lang,
        markdown: translatedMd,
        html: tHtml,
        pdf_base64: tPdfBase64, // null for Unicode languages
        docx_base64: tDocBuf.toString("base64")
      });
    }

    // ========================================================
    // 🔥 STEP 3 — RETURN ALL DATA
    // ========================================================
    return NextResponse.json({
      languages,
      lease_markdown: leaseMd,
      lease_html: leaseHtml,
      checklist_markdown: checklistMd,
      translated,
      lease_pdf_base64: leasePdf.toString("base64"),
      lease_docx_base64: docxBuffer.toString("base64")
    });

  } catch (error: any) {
    console.error("API ERROR:", error);
    return NextResponse.json(
      { error: "Lease generation failed", details: error.message },
      { status: 500 }
    );
  }
}

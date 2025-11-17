import { NextResponse } from "next/server";
import OpenAI from "openai";
import { markdownToHtml } from "../utils/markdownToHtml";
import { createPdfFromHtml } from "../utils/createPdf";
import { Document, Packer, Paragraph } from "docx";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // ===========================
    // 🔥 PREMIUM MULTI-PAGE PROMPT
    // ===========================
    const prompt = `
You are an expert US real estate attorney who prepares legally compliant residential lease agreements for every US state.
Your task is to generate a thorough, multi-page, professional residential lease agreement based strictly on the input provided.

IMPORTANT REQUIREMENTS:
- You MUST return valid JSON only (no markdown fences, no explanations).
- The lease must be complete, detailed, and long (minimum 1,500 words, ideally 2,500–3,500).
- Each clause must be written in full legal language — no summaries.
- The lease MUST include all required state-specific clauses, disclosures, and notices.
- Include all mandatory disclosures for the provided state (lead-based paint, mold, bed bugs, radon, etc.).
- Tailor laws, notice periods, fees, grace periods, landlord rights, and remedies to the state.

LEASE STRUCTURE (do NOT omit):
1. Introduction / Parties
2. Property Description
3. Lease Term
4. Rent & Payment Rules
5. Security Deposit Rules (state-specific)
6. Utilities & Services
7. Use of Premises
8. Guest Policy
9. Maintenance & Repairs
10. Alterations
11. Pets Policy
12. Smoking Policy
13. Parking
14. Insurance Requirements
15. Owner Entry
16. Rules & Regulations
17. Required State Disclosures
18. Lead-Based Paint Disclosure (if pre-1978)
19. Late Fees, Returned Payments, Penalties
20. Subletting
21. Governing Law
22. Default & Remedies
23. Abandonment
24. Notices
25. Joint & Several Liability
26. Military Clause (if applicable)
27. Additional Addendums
28. Signatures

INCLUDE:
- Full lease text in Markdown
- A list of addendums in Markdown array
- A Move-in/Move-out Checklist in Markdown

----------------------------------------
INPUT DATA:
${JSON.stringify(body, null, 2)}
----------------------------------------

OUTPUT FORMAT (STRICT JSON):
{
  "lease_markdown": "Full lease text as Markdown",
  "addendums_markdown": ["Addendum 1...", "Addendum 2..."],
  "checklist_markdown": "Checklist in Markdown"
}
`;

    // ===========================
    // 🔥 CALL OPENAI
    // ===========================
    const completion = await client.responses.create({
      model: "gpt-4o-mini", // temporarily use mini until quota fixed
      input: prompt
    });

    console.log("FULL AI RAW:", JSON.stringify(completion, null, 2));

    // ===========================
    // 🔥 UNIVERSAL EXTRACTION LOGIC (TypeScript-safe)
    // ===========================
    let text = "";

    if (completion.output?.length) {
      const first: any = completion.output[0];
      const possibleText =
        first?.content?.[0]?.text ||
        first?.text ||
        first?.output_text;

      if (possibleText) text = possibleText;
    }

    // fallback: output_text
    if (!text && completion.output_text) {
      text = completion.output_text;
    }

    // fallback: chat-style
    if (!text && completion.choices?.length > 0) {
      text = completion.choices[0]?.message?.content || "";
    }

    if (!text) {
      console.error("AI EMPTY RESPONSE:", completion);
      throw new Error("OpenAI returned no text.");
    }

    console.log("AI EXTRACTED TEXT:", text);

    // ===========================
    // 🔥 JSON PARSE WITH FALLBACK
    // ===========================
    let parsed: any = null;

    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.warn("JSON parse failed — treating raw text as lease_markdown.");
      parsed = {
        lease_markdown: text,
        addendums_markdown: [],
        checklist_markdown: ""
      };
    }

    let leaseMd = parsed.lease_markdown || "";
    let checklistMd = parsed.checklist_markdown || "";

    // last fallback
    if (!leaseMd && text.trim().length > 0) {
      leaseMd = text;
    }

    // ===========================
    // 🔥 CONVERSION: MD → HTML → PDF → DOCX
    // ===========================
    const leaseHtml = await markdownToHtml(leaseMd);

    const leasePdf = await createPdfFromHtml(leaseHtml);

    const doc = new Document({
      sections: [{ children: [new Paragraph(leaseMd)] }]
    });

    const docxBuffer = await Packer.toBuffer(doc);

    // ===========================
    // 🔥 SEND FINAL JSON RESULT
    // ===========================
    return NextResponse.json({
      lease_markdown: leaseMd,
      lease_html: leaseHtml,
      lease_pdf_base64: leasePdf.toString("base64"),
      lease_docx_base64: docxBuffer.toString("base64")
    });

  } catch (error: any) {
    console.error("AI ERROR:", error);
    return NextResponse.json(
      { error: "Lease generation failed", details: error.message },
      { status: 500 }
    );
  }
}

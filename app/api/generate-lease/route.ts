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

    const prompt = `
You are an expert US real estate attorney who prepares legally compliant residential lease agreements for every US state.  
Your task is to generate a thorough, multi-page, professional lease agreement based on the input provided.

IMPORTANT REQUIREMENTS:
- You MUST return valid JSON onl* (no markdown fences, no comments, no explanations).
- Your output MUST follow the exact JSON format at the bottom of this prompt.
- The lease must be complete, detailed, and long (minimum 1,500 words, ideally 2,500–3,500).
- Each section must be written in full legal language—do NOT summarize or abbreviate.
- The lease MUST include all required state-specific clauses, disclosures, and notices.
- Add any mandatory legal disclosures required by the selected state (e.g., lead-based paint for pre-1978 properties, mold disclosures, bed bug disclosures, radon disclosures, etc.).
- Tailor all laws, fees, grace periods, notice requirements, and landlord rights to the state.
- Include robust protections for both landlord and tenant.

LEASE STRUCTURE (do NOT omit sections):
1. Introduction & Parties
2. Property Description
3. Lease Term
4. Rent, Fees & Payment Rules
5. Security Deposit & Accounting Rules
6. Utilities & Services
7. Use of Premises & Guest Policy
8. Maintenance, Repairs & Alterations
9. Pets Policy
10. Smoking Policy
11. Parking & Common Areas
12. Insurance Requirements
13. Right of Entry
14. Rules & Regulations
15. Lead-Based Paint Disclosure (if applicable)
16. State-Required Disclosures
17. Late Fees, Returned Payments & Penalties
18. Subletting
19. Governing Law
20. Default & Remedies
21. Abandonment
22. Notices
23. Joint & Several Liability
24. Military Clause (if required by state)
25. Additional Addendums (if needed)
26. Signatures Section

Your writing must be precise, professional, and legally accurate.

----------------------------------------
INPUT DATA (USE EXACTLY AS PROVIDED)
${JSON.stringify(body, null, 2)}
----------------------------------------

OUTPUT FORMAT (MUST BE STRICT JSON):
{
  "lease_markdown": "Full lease in Markdown format...",
  "addendums_markdown": ["Separate addendums as needed, each as Markdown"],
  "checklist_markdown": "Move-in / move-out checklist as Markdown"
}

`;

    // 🔥 AI CALL
    const completion = await client.responses.create({
      model: "gpt-4.1",
      input: prompt
    });

    // 🔥 UNIVERSAL EXTRACTION LOGIC
    let text = "";

    // New Responses API format (most common)
    if (completion.output && completion.output.length > 0) {
      const first = completion.output[0];
      if (first.content && first.content.length > 0) {
        text = first.content[0].text || "";
      }
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

    console.log("RAW AI TEXT:", text);

    // 🔥 Parse the JSON returned by the AI
    const parsed = JSON.parse(text);

    const leaseMd = parsed.lease_markdown || "";
    const checklistMd = parsed.checklist_markdown || "";

    // Convert Markdown → HTML
    const leaseHtml = await markdownToHtml(leaseMd);
    const checklistHtml = await markdownToHtml(checklistMd);

    // PDF
    const leasePdf = await createPdfFromHtml(leaseHtml);

    // DOCX
    const doc = new Document({
      sections: [
        {
          children: [new Paragraph(leaseMd)]
        }
      ]
    });

    const docxBuffer = await Packer.toBuffer(doc);

    // Return to client
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

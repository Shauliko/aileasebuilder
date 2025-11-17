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
You are an expert US real estate attorney specializing in residential leases.
Generate a state-compliant residential lease agreement based on the provided input.

Return the result in valid JSON only.

INPUT:
${JSON.stringify(body, null, 2)}

OUTPUT FORMAT (JSON ONLY):
{
  "lease_markdown": "...",
  "addendums_markdown": [],
  "checklist_markdown": "..."
}
`;

    // AI response
    const completion = await client.responses.create({
      model: "gpt-4.1", // more reliable access
      input: prompt
    });

    const jsonText = completion.output_text;
    const parsed = JSON.parse(jsonText);

    const leaseMd = parsed.lease_markdown || "";
    const checklistMd = parsed.checklist_markdown || "";

    // Convert Markdown → HTML
    const leaseHtml = await markdownToHtml(leaseMd);
    const checklistHtml = await markdownToHtml(checklistMd);

    // Generate PDF
    const leasePdf = await createPdfFromHtml(leaseHtml);

    // Generate DOCX
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph(leaseMd)
          ]
        }
      ]
    });

    const docxBuffer = await Packer.toBuffer(doc);

    // Return files as base64 strings
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

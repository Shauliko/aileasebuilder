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

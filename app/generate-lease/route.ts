import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const prompt = `
You are an expert US real estate attorney specializing in residential leases.
Generate a state-compliant residential lease agreement based on the provided input.

Return the result in VALID JSON ONLY.

Mandatory Requirements:
- Follow the laws of the selected state.
- Use precise legal language.
- Include required disclosures for that state.
- Include all fields requested by the user.
- Avoid ambiguous language.

INPUT:
${JSON.stringify(body, null, 2)}

OUTPUT FORMAT (JSON ONLY):
{
  "lease_markdown": "...",
  "addendums_markdown": [],
  "checklist_markdown": "..."
}
`;

    const completion = await client.responses.create({
      model: "gpt-5.1",
      input: prompt
    });

    const text = completion.output_text; // raw model output

    const parsed = JSON.parse(text); // convert JSON string → JS object

    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error("AI ERROR:", error);
    return NextResponse.json(
      { error: "Lease generation failed", details: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

// CHANGE THIS to whichever AI provider you are using.
// This uses OpenAI API format as default.
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST() {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY" },
      { status: 500 }
    );
  }

  try {
    const prompt = `
You are an expert legal real estate blogger.
Write a complete blog post in high-quality Markdown.

Requirements:
- Topic: Create a strong, highly useful educational post for landlords and tenants.
- Include a clear, SEO-optimized title.
- Assign a category (examples: "legal", "guides", "landlord-tips", "tenant-tips").
- Include 3–6 relevant tags.
- Write a full, long-form Markdown article with:
  - H1 title
  - H2 sections
  - bullet lists
  - examples
  - explanations
  - formatting
Return ONLY valid JSON in this structure:
{
  "title": "...",
  "category": "...",
  "tags": ["...", "..."],
  "content": "FULL_MARKDOWN_HERE"
}
    `;

    const completion = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // or whichever you prefer
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
        }),
      }
    );

    const data = await completion.json();

    if (!data.choices?.[0]?.message?.content) {
      return NextResponse.json(
        { error: "AI returned empty response" },
        { status: 500 }
      );
    }

    // The model returns JSON — parse safely
    let parsed;
    try {
      parsed = JSON.parse(data.choices[0].message.content);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}

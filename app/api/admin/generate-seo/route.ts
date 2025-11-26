import { NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: Request) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY" },
      { status: 500 }
    );
  }

  try {
    const { title, content, category, tags } = await req.json();

    const prompt = `
You are an expert SEO copywriter specializing in legal and real estate content.

Generate SEO metadata for the following blog post:

TITLE: ${title || "(none)"}
CATEGORY: ${category || "(none)"}
TAGS: ${Array.isArray(tags) ? tags.join(", ") : tags || "(none)"}

CONTENT:
${content || "(no content provided)"}

Return ONLY valid JSON in this format:
{
  "meta_title": "...",
  "meta_description": "..."
}

Rules:
- meta_title: 55–65 characters, compelling, SEO-optimized
- meta_description: 150–160 characters, persuasive, human, not robotic
- Do not include special markdown characters
- No line breaks, no extra commentary
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
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.5,
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

    let parsed;
    try {
      parsed = JSON.parse(data.choices[0].message.content);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      meta_title: parsed.meta_title || "",
      meta_description: parsed.meta_description || "",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "SEO generation failed" },
      { status: 500 }
    );
  }
}

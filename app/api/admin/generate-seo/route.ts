import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// -----------------------------
// SIMPLE IN-MEMORY RATE LIMITER
// -----------------------------
type RateEntry = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 8; // allow more SEO calls than images/posts
const rateMap = new Map<string, RateEntry>();

function checkRateLimit(key: string) {
  const now = Date.now();
  const existing = rateMap.get(key);

  if (!existing || now > existing.resetAt) {
    rateMap.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, retryAfter: 0 };
  }

  if (existing.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfter: existing.resetAt - now };
  }

  existing.count += 1;
  rateMap.set(key, existing);
  return { allowed: true, retryAfter: 0 };
}

// -----------------------------
// POST — Generate SEO metadata
// -----------------------------
export async function POST(req: Request) {
  try {
    // 🔒 AUTH — Admin only
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 🔒 RATE LIMIT — per user
    const rateKey = `gen-seo:${userId}`;
    const { allowed, retryAfter } = checkRateLimit(rateKey);

    if (!allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Try again later.",
          retryAfterMs: retryAfter,
        },
        { status: 429 }
      );
    }

    // 🔒 ENV check
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    // Parse incoming JSON
    const { title, content, category, tags } = await req.json();

    // Build prompt safely
    const safeTitle = typeof title === "string" ? title : "";
    const safeContent = typeof content === "string" ? content : "";
    const safeCategory = typeof category === "string" ? category : "";
    const safeTags =
      Array.isArray(tags) && tags.every(t => typeof t === "string")
        ? tags
        : [];

    const prompt = `
You are an expert SEO copywriter specializing in legal and real estate content.

Generate SEO metadata for the following blog post:

TITLE: ${safeTitle || "(none)"}
CATEGORY: ${safeCategory || "(none)"}
TAGS: ${safeTags.length ? safeTags.join(", ") : "(none)"}

CONTENT:
${safeContent || "(no content provided)"}

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

    // Call OpenAI
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
          messages: [{ role: "user", content: prompt }],
          temperature: 0.5,
        }),
      }
    );

    if (!completion.ok) {
      return NextResponse.json(
        { error: "OpenAI request failed" },
        { status: 500 }
      );
    }

    const data = await completion.json();

    if (!data.choices?.[0]?.message?.content) {
      return NextResponse.json(
        { error: "AI returned empty response" },
        { status: 500 }
      );
    }

    // Safely parse JSON
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
      meta_title: typeof parsed.meta_title === "string" ? parsed.meta_title : "",
      meta_description:
        typeof parsed.meta_description === "string"
          ? parsed.meta_description
          : "",
    });
  } catch (err) {
    console.error("SEO GENERATION ERROR:", err);
    return NextResponse.json(
      { error: "SEO generation failed" },
      { status: 500 }
    );
  }
}

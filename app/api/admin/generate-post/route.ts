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
const RATE_LIMIT_MAX = 5; // max 5 requests per minute
const rateMap = new Map<string, RateEntry>();

function checkRateLimit(key: string) {
  const now = Date.now();
  const existing = rateMap.get(key);

  // First request of new window
  if (!existing || now > existing.resetAt) {
    rateMap.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, retryAfter: 0 };
  }

  // Exceeded limit
  if (existing.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfter: existing.resetAt - now };
  }

  // Within limit
  existing.count += 1;
  rateMap.set(key, existing);
  return { allowed: true, retryAfter: 0 };
}

// -----------------------------
// POST — Generate AI Blog Post
// -----------------------------
export async function POST() {
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
    const rateKey = `gen-post:${userId}`;
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

    // Prompt
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

    // Call OpenAI
    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!completion.ok) {
      return NextResponse.json(
        { error: "Failed to generate response from AI" },
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

    // Safely parse JSON returned by the model
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
    console.error("AI GENERATION ERROR:", err);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}

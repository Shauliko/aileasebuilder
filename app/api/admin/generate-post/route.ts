import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";

// Claude key
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

// -----------------------------
// SIMPLE IN-MEMORY RATE LIMITER
// -----------------------------
type RateEntry = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5;
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
// POST — Generate AI Blog Post
// -----------------------------
export async function POST() {
  try {
    // 🔒 AUTH — Admin only
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    if (!CLAUDE_API_KEY) {
      return NextResponse.json(
        { error: "Missing CLAUDE_API_KEY" },
        { status: 500 }
      );
    }

    // Claude client
    const client = new Anthropic({
      apiKey: CLAUDE_API_KEY,
      defaultHeaders: { "Anthropic-Organization": "" },
    });

    // Prompt
    const prompt = `
You are an expert legal real estate blogger.
Write a complete blog post in high-quality Markdown.

Requirements:
- Topic: Create a strong, highly useful educational post for landlords and tenants.
- Include a clear, SEO-optimized title.
- Assign a category (examples: "legal", "guides", "landlord-tips", "tenant-tips").
- Include 3–6 relevant tags.
- Write a long-form Markdown article with:
  - H1 title
  - H2 sections
  - bullet lists
  - examples
  - explanations
Return ONLY valid JSON like:
{
  "title": "...",
  "category": "...",
  "tags": ["...", "..."],
  "content": "FULL_MARKDOWN_HERE"
}
`;

    // Claude call
    const completion = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [
        { role: "user", content: "Return ONLY valid JSON. No backticks." },
        { role: "user", content: prompt },
      ],
    });

    // Extract text safely
    const text = completion.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
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

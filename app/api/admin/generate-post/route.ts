// app/api/admin/generate-post/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";
import { sql } from "@/lib/db";

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
// SYSTEM PROMPT (Claude)
// -----------------------------
const SYSTEM_PROMPT = `
You are a senior U.S. real-estate attorney & SEO strategist writing for AI Lease Builder.

Audience: small landlords, property managers, and tenants in the U.S.
Goal: attract organic traffic and drive readers to generate a state-specific lease.

Writing Style:
- authoritative but simple
- extremely practical
- no fluff
- U.S. English
- include examples, steps, lists
- avoid repeating ANY existing blog post topics

SEO Requirements:
- One H1 (the title)
- Strong H2/H3 structure
- 3–6 FAQs at bottom
- Keyword-rich but natural
- CTA to AI Lease Builder at the end

OUTPUT FORMAT (STRICT):
{
  "title": "",
  "slug": "",
  "category": "",
  "tags": [],
  "meta_title": "",
  "meta_description": "",
  "content": ""
}

Rules:
- Output MUST be valid JSON.
- Do NOT include backticks.
- Do NOT include commentary.
- Do NOT repeat topics from the provided existing posts list.
`;

// -----------------------------
// POST — Generate AI Blog Post
// -----------------------------
export async function POST(_req: Request) {
  try {
    // AUTH
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // RATE LIMIT
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

    if (!CLAUDE_API_KEY) {
      return NextResponse.json(
        { error: "Missing CLAUDE_API_KEY" },
        { status: 500 }
      );
    }

    // -----------------------------
    // FETCH EXISTING POSTS (limit 30)
    // -----------------------------
    const existing = await sql`
      SELECT slug, title
      FROM blog_posts
      ORDER BY date DESC
      LIMIT 30
    `;

    const existingSummary = existing
      .map((row: any) => `- ${row.title} (slug: ${row.slug})`)
      .join("\n");

    // -----------------------------
    // BUILD USER PROMPT
    // -----------------------------
    const USER_PROMPT = `
Existing posts (do NOT duplicate or closely copy ANY of these):
${existingSummary}

Generate a **completely new**, non-overlapping, highly practical, SEO-optimized blog post
for U.S. landlords and tenants.

Rules:
- The topic must be NEW.
- If similar, choose a different angle (e.g. deeper scenario, variations).
- Must include CTA to AI Lease Builder.
- Must output ONLY the JSON object described above.
`;

    // -----------------------------
    // CALL CLAUDE
    // -----------------------------
    const client = new Anthropic({
      apiKey: CLAUDE_API_KEY,
      defaultHeaders: { "Anthropic-Organization": "" },
    });

    const completion = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      temperature: 0.7,
      system: SYSTEM_PROMPT,  // ← System prompt goes here
      messages: [
        { role: "user", content: USER_PROMPT },
      ],
    });

    const text = completion.content
      .filter((part: any) => part.type === "text")
      .map((part: any) => part.text)
      .join("")
      .trim();

    // -----------------------------
    // PARSE JSON SAFELY
    // -----------------------------
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.error("JSON PARSE ERROR:", text);
      return NextResponse.json(
        { error: "Claude returned invalid JSON" },
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

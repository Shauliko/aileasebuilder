import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";
import { trackEvent } from "@/lib/analytics/posthog";

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

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
// POST — Generate SEO metadata (Claude)
// -----------------------------
export async function POST(req: Request) {
  try {
    // 🔒 AUTH — Admin only
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔒 RATE LIMIT
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
    if (!CLAUDE_API_KEY) {
      return NextResponse.json(
        { error: "Missing CLAUDE_API_KEY" },
        { status: 500 }
      );
    }

    // Parse incoming JSON
    const { title, content, category, tags } = await req.json();

    const safeTitle = typeof title === "string" ? title : "";
    const safeContent = typeof content === "string" ? content : "";
    const safeCategory = typeof category === "string" ? category : "";
    const safeTags =
      Array.isArray(tags) && tags.every((t) => typeof t === "string")
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

Return ONLY valid JSON:
{
  "meta_title": "...",
  "meta_description": "..."
}

Rules:
- meta_title: 55–65 characters
- meta_description: 150–160 characters
- No markdown, no line breaks, no extra commentary
- Plain strings only
`;

    // Claude client
    const client = new Anthropic({
      apiKey: CLAUDE_API_KEY,
      defaultHeaders: { "Anthropic-Organization": "" },
    });

    // Claude call
    const completion = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        { role: "user", content: "Return ONLY valid JSON. No backticks." },
        { role: "user", content: prompt },
      ],
    });

    // Extract raw text from Claude
    const text = completion.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("")
      .trim();

    // Safely parse JSON
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON" },
        { status: 500 }
      );
    }
      trackEvent(
        "admin_seo_generated",
        userId,
        {
          title: safeTitle,
          category: safeCategory,
          tags: safeTags,
          timestamp: Date.now(),
        }
      );

    return NextResponse.json({
      meta_title:
        typeof parsed.meta_title === "string" ? parsed.meta_title : "",
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

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { trackEvent } from "@/lib/analytics/posthog";

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

// -----------------------------
// SIMPLE IN-MEMORY RATE LIMITER
// -----------------------------
type RateEntry = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 60_000;
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
// POST — Generate AI Image (ADMIN ONLY) — CLAUDE VERSION
// -----------------------------
export async function POST(req: Request) {
  try {
    // 🔒 AUTH — Admin only
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔒 RATE LIMIT
    const rateKey = `gen-image:${userId}`;
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

    // Parse body
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 5) {
      return NextResponse.json({ error: "Prompt too short" }, { status: 400 });
    }

    // -----------------------------
    // CLAUDE IMAGE GENERATION
    // -----------------------------
    const imgRes = await fetch("https://api.anthropic.com/v1/images/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20250219", // Claude image model
        prompt,
        size: "1024x1024",
        output_format: "png",
      }),
    });

    if (!imgRes.ok) {
      return NextResponse.json(
        { error: "Claude image generation failed" },
        { status: 500 }
      );
    }

    const data = await imgRes.json();

    if (!data?.image_base64) {
      return NextResponse.json(
        { error: "Claude returned no image" },
        { status: 500 }
      );
    }
    trackEvent(
      "admin_image_generated",
      userId,
      {
        prompt,
        size: "1024x1024",
        timestamp: Date.now(),
      }
    );

    // Return base64 as data URL for easy display
    return NextResponse.json({
      url: `data:image/png;base64,${data.image_base64}`,
    });
  } catch (err) {
    console.error("IMAGE ERROR:", err);
    return NextResponse.json(
      { error: "AI image generation failed" },
      { status: 500 }
    );
  }
}

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
const RATE_LIMIT_MAX = 5; // max 5 image requests per minute
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
// POST — Generate AI Image (ADMIN ONLY)
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
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    // Parse JSON body
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 5) {
      return NextResponse.json(
        { error: "Prompt too short" },
        { status: 400 }
      );
    }

    // Call OpenAI (DALL•E / gpt-image-1)
    const dalleRes = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt,
          size: "1024x1024",
        }),
      }
    );

    if (!dalleRes.ok) {
      return NextResponse.json(
        { error: "OpenAI image generation failed" },
        { status: 500 }
      );
    }

    const dalleData = await dalleRes.json();

    if (
      !dalleData ||
      !Array.isArray(dalleData.data) ||
      !dalleData.data[0]?.url
    ) {
      return NextResponse.json(
        { error: "Image generation failed" },
        { status: 500 }
      );
    }

    // Return image URL
    return NextResponse.json({
      url: dalleData.data[0].url,
    });
  } catch (err) {
    console.error("IMAGE ERROR:", err);
    return NextResponse.json(
      { error: "AI image generation failed" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const postsDir = path.join(process.cwd(), "content/posts");

// -----------------------------
// SIMPLE IN-MEMORY RATE LIMITER (PER IP)
// -----------------------------
type RateEntry = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 30; // up to 30 searches per minute per IP
const rateMap = new Map<string, RateEntry>();

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",");
    if (parts.length > 0) return parts[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

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

function isPublished(post: any): boolean {
  const now = new Date();

  if (!post || !post.published_at) return false;

  const publishedAt = new Date(post.published_at);
  if (isNaN(publishedAt.getTime())) return false;
  if (publishedAt > now) return false;

  return true;
}

// -----------------------------
// GET — /api/blog/search?q=keyword
// -----------------------------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim().toLowerCase();

    // Rate limit by IP
    const ip = getClientIp(req);
    const rateKey = `blog-search:${ip}`;
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

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    if (!fs.existsSync(postsDir)) {
      return NextResponse.json({ results: [] });
    }

    const files = fs
      .readdirSync(postsDir)
      .filter((file) => file.endsWith(".json"));

    const results: any[] = [];

    for (const file of files) {
      const fullPath = path.join(postsDir, file);
      const raw = fs.readFileSync(fullPath, "utf-8");
      let post: any;

      try {
        post = JSON.parse(raw);
      } catch {
        continue;
      }

      if (!isPublished(post)) continue;

      const slug = file.replace(/\.json$/, "");
      const title = String(post.title || "");
      const content = String(post.content || "");
      const tags = Array.isArray(post.tags) ? post.tags : [];

      const haystack =
        `${title}\n${content}\n${tags.join(" ")}`.toLowerCase();

      if (haystack.includes(q)) {
        results.push({
          slug,
          title,
          date: post.date || null,
          category: post.category || "",
          tags,
          featured: !!post.featured,
          meta_title: post.meta_title || "",
          meta_description: post.meta_description || "",
        });
      }
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error("BLOG SEARCH ERROR:", err);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}

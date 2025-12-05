import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { auth } from "@clerk/nextjs/server";
import { trackEventServer as trackEvent } from "@/lib/analytics/posthog-server";


const postsDir = path.join(process.cwd(), "content/posts");

function isValidSlug(slug: string) {
  return /^[a-zA-Z0-9-_]+$/.test(slug);
}

// -------------------------------------------------------
// GET — Fetch a single post: /api/admin/blog?slug=abc
// -------------------------------------------------------
export async function GET(req: Request) {
  try {
    const { userId } = await auth(); // FIXED
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    if (!isValidSlug(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const file = path.join(postsDir, `${slug}.json`);

    if (!fs.existsSync(file)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const post = JSON.parse(fs.readFileSync(file, "utf-8"));
    trackEvent("admin_blog_fetched", userId, {
      slug,
      timestamp: Date.now(),
    });

    return NextResponse.json({ post });
  } catch (err) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// -------------------------------------------------------
// POST — Create a new post
// -------------------------------------------------------
export async function POST(req: Request) {
  try {
    const { userId } = await auth(); // FIXED
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      slug,
      title,
      date,
      category,
      tags,
      featured,
      publish_at,
      published_at,
      content,
      meta_title,
      meta_description,
    } = body;

    if (!slug || !title || !date || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!isValidSlug(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const file = path.join(postsDir, `${slug}.json`);

    const postData = {
      title,
      date,
      category: category || "",
      tags: Array.isArray(tags) ? tags : [],
      featured: !!featured,

      published_at: published_at ?? null,
      publish_at: publish_at ?? null,

      content,
      meta_title: meta_title ?? "",
      meta_description: meta_description ?? "",
    };

    fs.writeFileSync(file, JSON.stringify(postData, null, 2));
    
    trackEvent("admin_blog_created", userId, {
      slug,
      title,
      category: category || "",
      timestamp: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// -------------------------------------------------------
// PUT — Update post
// -------------------------------------------------------
export async function PUT(req: Request) {
  try {
    const { userId } = await auth(); // FIXED
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      slug,
      title,
      date,
      category,
      tags,
      featured,
      publish_at,
      published_at,
      content,
      meta_title,
      meta_description,
    } = body;

    if (!slug || !title || !date || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!isValidSlug(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const file = path.join(postsDir, `${slug}.json`);

    if (!fs.existsSync(file)) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const postData = {
      title,
      date,
      category: category || "",
      tags: Array.isArray(tags) ? tags : [],
      featured: !!featured,

      published_at: published_at ?? null,
      publish_at: publish_at ?? null,

      content,
      meta_title: meta_title ?? "",
      meta_description: meta_description ?? "",
    };

    fs.writeFileSync(file, JSON.stringify(postData, null, 2));
      trackEvent("admin_blog_updated", userId, {
        slug,
        title,
        category: category || "",
        timestamp: Date.now(),
      });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

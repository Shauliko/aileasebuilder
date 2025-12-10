import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { trackEventServer as trackEvent } from "@/lib/analytics/posthog-server";

type BlogPostRow = {
  slug: string;
  title: string;
  date: string;
  category: string | null;
  tags: string[] | null;
  featured: boolean | null;
  publish_at: string | null;
  published_at: string | null;
  content: string;
  meta_title: string | null;
  meta_description: string | null;
};

function isValidSlug(slug: string) {
  return /^[a-zA-Z0-9-_]+$/.test(slug);
}

// -------------------------------------------------------
// GET — Fetch a single post: /api/admin/blog?slug=abc
// -------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
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

    const rows = (await sql`
      SELECT slug, title, date, category, tags, featured,
             publish_at, published_at, content, meta_title, meta_description
      FROM blog_posts
      WHERE slug = ${slug}
      LIMIT 1
    `) as BlogPostRow[];

    if (rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const post = rows[0];

    trackEvent("admin_blog_fetched", userId, {
      slug,
      timestamp: Date.now(),
    });

    return NextResponse.json({ post });

  } catch (err) {
    console.error("GET /api/admin/blog error", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// -------------------------------------------------------
// POST — Create (or overwrite) a post
// -------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
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

    const tagsArray = Array.isArray(tags) ? tags : [];

    await sql`
      INSERT INTO blog_posts (
        slug, title, date, category, tags, featured,
        publish_at, published_at, content, meta_title, meta_description
      )
      VALUES (
        ${slug},
        ${title},
        ${date},
        ${category || ""},
        ${tagsArray},
        ${!!featured},
        ${publish_at || null},
        ${published_at || null},
        ${content},
        ${meta_title || ""},
        ${meta_description || ""}
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        date  = EXCLUDED.date,
        category = EXCLUDED.category,
        tags = EXCLUDED.tags,
        featured = EXCLUDED.featured,
        publish_at = EXCLUDED.publish_at,
        published_at = EXCLUDED.published_at,
        content = EXCLUDED.content,
        meta_title = EXCLUDED.meta_title,
        meta_description = EXCLUDED.meta_description,
        updated_at = NOW()
    `;

    trackEvent("admin_blog_created", userId, {
      slug,
      title,
      category: category || "",
      timestamp: Date.now(),
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("POST /api/admin/blog error", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// -------------------------------------------------------
// PUT — Update existing post
// -------------------------------------------------------
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
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

    const tagsArray = Array.isArray(tags) ? tags : [];

    const result = (await sql`
      UPDATE blog_posts
      SET
        title = ${title},
        date = ${date},
        category = ${category || ""},
        tags = ${tagsArray},
        featured = ${!!featured},
        publish_at = ${publish_at || null},
        published_at = ${published_at || null},
        content = ${content},
        meta_title = ${meta_title || ""},
        meta_description = ${meta_description || ""},
        updated_at = NOW()
      WHERE slug = ${slug}
      RETURNING slug
    `) as { slug: string }[];

    if (result.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    trackEvent("admin_blog_updated", userId, {
      slug,
      title,
      category: category || "",
      timestamp: Date.now(),
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("PUT /api/admin/blog error", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

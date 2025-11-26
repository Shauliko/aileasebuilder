import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const postsDir = path.join(process.cwd(), "content/posts");

// -------------------------------------------------------
// GET — Fetch a single post: /api/admin/blog?slug=abc
// -------------------------------------------------------
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const file = path.join(postsDir, `${slug}.json`);
  if (!fs.existsSync(file)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const post = JSON.parse(fs.readFileSync(file, "utf-8"));
  return NextResponse.json({ post });
}

// -------------------------------------------------------
// POST — Create a new post
// -------------------------------------------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      slug,
      title,
      date,
      category,
      tags,
      featured,
      publish_at,            // ✅ NEW
      content,
      meta_title,            // ✅ NEW
      meta_description,      // ✅ NEW
    } = body;

    if (!slug || !title || !date || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const file = path.join(postsDir, `${slug}.json`);

    const postData = {
      title,
      date,
      category: category || "",
      tags: Array.isArray(tags) ? tags : [],
      featured: !!featured,
      publish_at: publish_at || null,        // ✅ NEW
      content,
      meta_title: meta_title || "",          // ✅ NEW
      meta_description: meta_description || "" // ✅ NEW
    };

    fs.writeFileSync(file, JSON.stringify(postData, null, 2));

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
    const body = await req.json();
    const {
      slug,
      title,
      date,
      category,
      tags,
      featured,
      publish_at,            // ✅ NEW
      content,
      meta_title,            // ✅ NEW
      meta_description,      // ✅ NEW
    } = body;

    if (!slug || !title || !date || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const file = path.join(postsDir, `${slug}.json`);

    if (!fs.existsSync(file)) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const postData = {
      title,
      date,
      category: category || "",
      tags: Array.isArray(tags) ? tags : [],
      featured: !!featured,
      publish_at: publish_at || null,        // NEW
      content,
      meta_title: meta_title || "",          // NEW
      meta_description: meta_description || "" // NEW
    };

    fs.writeFileSync(file, JSON.stringify(postData, null, 2));

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

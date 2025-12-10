import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import fs from "fs";
import path from "path";

const postsDir = path.join(process.cwd(), "content/posts");

// Slug validation
function isValidSlug(slug: string) {
  return /^[a-zA-Z0-9-_]+$/.test(slug);
}

// --------------------------------------------------
// GET — Load a post for editing
// /api/admin/blog-edit/[slug]
// --------------------------------------------------
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params; // ✅ Next 16 requires awaiting params

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!slug || !isValidSlug(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const filePath = path.join(postsDir, `${slug}.json`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const post = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    return NextResponse.json({ post });
  } catch (err) {
    console.error("BLOG EDIT GET ERROR:", err);
    return NextResponse.json(
      { error: "Failed to load post" },
      { status: 500 }
    );
  }
}

// --------------------------------------------------
// PUT — Save edited post
// --------------------------------------------------
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params; // ✅ unwrap params Promise

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!slug || !isValidSlug(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const filePath = path.join(postsDir, `${slug}.json`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const body = await req.json();

    const {
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

    if (!title || !date || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
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

    fs.writeFileSync(filePath, JSON.stringify(postData, null, 2));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("BLOG EDIT PUT ERROR:", err);
    return NextResponse.json(
      { error: "Failed to save post" },
      { status: 500 }
    );
  }
}

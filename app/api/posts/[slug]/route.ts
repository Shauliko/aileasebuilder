import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { marked } from "marked";

export async function GET(
  _req: NextRequest,
  context: { params: { slug: string } }
) {
  const { slug } = await context.params;

  // Fetch from database
  const result =
    await sql`SELECT * FROM blog_posts WHERE slug = ${slug} LIMIT 1`;

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const post = result.rows[0];

  const normalized = {
    slug,
    title: post.title,
    content: post.content,
    category: post.category,
    tags: Array.isArray(post.tags) ? post.tags : [],
    featured: post.featured ?? false,
    publish_at: post.publish_at,
    published_at: post.published_at,
    meta_title: post.meta_title ?? "",
    meta_description: post.meta_description ?? "",
    html: marked.parse(post.content || ""),
  };

  // Hide drafts + future scheduled posts
  const now = Date.now();

  const isDraft =
    normalized.published_at === null &&
    (!normalized.publish_at || normalized.publish_at === "");

  const isScheduledFuture =
    normalized.published_at === null &&
    normalized.publish_at &&
    new Date(normalized.publish_at).getTime() > now;

  if (isDraft || isScheduledFuture) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ post: normalized });
}
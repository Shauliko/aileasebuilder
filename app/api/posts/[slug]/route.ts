import { NextResponse, NextRequest } from "next/server";
import { getAllPosts } from "@/lib/getPost";

/**
 * PUBLIC — SINGLE POST ENDPOINT
 * Returns ONE post only if:
 * - It exists
 * - It is NOT scheduled for the future
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  const all = getAllPosts();
  const post = all.find((p: any) => p.slug === slug);

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Block scheduled posts
  if (post.publish_at) {
    const ts = new Date(post.publish_at).getTime();
    if (ts > Date.now()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  return NextResponse.json({ post });
}

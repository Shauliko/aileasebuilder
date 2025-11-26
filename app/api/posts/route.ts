import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/getPost";

/**
 * PUBLIC POSTS API
 * Returns ONLY posts that should be visible publicly:
 * - publish_at <= now OR publish_at not set
 * - NOT scheduled in the future
 */
export async function GET() {
  const all = getAllPosts();

  const now = Date.now();

  const visible = all.filter((post: any) => {
    // If scheduled and future → hide
    if (post.publish_at) {
      const ts = new Date(post.publish_at).getTime();
      if (ts > now) return false;
    }

    return true;
  });

  return NextResponse.json({ posts: visible });
}

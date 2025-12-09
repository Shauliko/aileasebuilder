// app/api/posts/route.ts
import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/getPost";

export async function GET() {
  const now = Date.now();
  const all = await getAllPosts();

  const posts = all
    .map((p) => {
      if (p.published_at === null && p.publish_at) {
        const ts = new Date(p.publish_at).getTime();
        if (ts <= now) {
          return {
            ...p,
            published_at: p.publish_at,
            publish_at: null,
          };
        }
      }
      return p;
    })
    .filter((p) => {
      const isDraft =
        p.published_at === null &&
        (p.publish_at === null || p.publish_at === "");

      const isScheduledFuture =
        p.published_at === null &&
        p.publish_at &&
        new Date(p.publish_at).getTime() > now;

      if (isDraft || isScheduledFuture) return false;
      return true;
    });

  return NextResponse.json({ posts });
}

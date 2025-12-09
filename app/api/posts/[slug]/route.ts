// app/api/posts/[slug]/route.ts
import { NextResponse } from "next/server";
import { getPost } from "@/lib/getPost";

type RouteParams = {
  params: { slug: string };
};

export async function GET(_req: Request, { params }: RouteParams) {
  const post = await getPost(params.slug);

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = Date.now();

  const isDraft =
    post.published_at === null &&
    (post.publish_at === null || post.publish_at === "");

  const isScheduledFuture =
    post.published_at === null &&
    post.publish_at &&
    new Date(post.publish_at).getTime() > now;

  if (isDraft || isScheduledFuture) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ post });
}

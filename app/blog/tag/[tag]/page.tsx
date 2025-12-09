// app/blog/tag/[tag]/page.tsx
export const revalidate = 10;

import Link from "next/link";
import { getAllPosts } from "@/lib/getPost";

type PageParams = {
  params: Promise<{ tag: string }>;
};

export async function generateStaticParams() {
  const posts = await getAllPosts();
  const tags = Array.from(
    new Set(
      posts.flatMap((p) => (Array.isArray(p.tags) ? p.tags : []))
    )
  ) as string[];

  return tags.map((t) => ({ tag: t }));
}

export default async function TagPage({ params }: PageParams) {
  const { tag } = await params; // Next 16 fix
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
      if (!Array.isArray(p.tags)) return false;
      if (!p.tags.includes(tag)) return false;

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

  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-8">Tag: #{tag}</h1>

      {posts.length === 0 && (
        <p className="text-gray-400">No posts found for this tag.</p>
      )}

      <ul className="space-y-6">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="text-xl font-semibold underline"
            >
              {post.title}
            </Link>
            <p className="text-gray-600 text-sm">{post.date}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}

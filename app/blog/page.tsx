// app/blog/page.tsx
export const revalidate = 10;

import Link from "next/link";
import { getAllPosts } from "@/lib/getPost";

export default async function BlogPage() {
  const now = Date.now();
  const all = await getAllPosts();

  // Auto-publish if publish_at is in the past
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

      // Hide drafts + future scheduled
      if (isDraft || isScheduledFuture) return false;

      return true;
    });

  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>

      {posts.length === 0 && (
        <p className="text-gray-400">No published posts yet.</p>
      )}

      <ul className="space-y-8">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="text-2xl font-semibold underline"
            >
              {post.title}
            </Link>
            <p className="text-gray-500 text-sm">
              {post.date} ·{" "}
              {post.category ? `Category: ${post.category}` : "General"}
            </p>
            {post.meta_description && (
              <p className="text-gray-400 mt-2">{post.meta_description}</p>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}

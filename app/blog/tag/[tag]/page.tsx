import { getAllPosts } from "@/lib/getPost";
import Link from "next/link";

export function generateStaticParams() {
  const posts = getAllPosts();
  const tags = Array.from(
    new Set(
      posts.flatMap((p) =>
        Array.isArray(p.tags) ? p.tags : []
      )
    )
  );
  return tags.map((t) => ({ tag: t }));
}

export default function TagPage({ params }: { params: { tag: string } }) {
  const now = Date.now();

  const all = getAllPosts();

  const posts = all
    .map((p: any) => {
      // Auto-publish scheduled posts whose time has passed
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
    .filter((p: any) => {
      // Must contain the tag
      if (!Array.isArray(p.tags)) return false;
      if (!p.tags.includes(params.tag)) return false;

      // Draft check
      const isDraft =
        p.published_at === null &&
        (p.publish_at === null || p.publish_at === "");

      // Future scheduled check
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
      <h1 className="text-4xl font-bold mb-8">Tag: #{params.tag}</h1>

      {posts.length === 0 && (
        <p className="text-gray-400">No posts found for this tag.</p>
      )}

      <ul className="space-y-6">
        {posts.map((post: any) => (
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

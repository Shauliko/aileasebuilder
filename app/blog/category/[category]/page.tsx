import { getAllPosts } from "@/lib/getPost";
import Link from "next/link";

export function generateStaticParams() {
  const posts = getAllPosts();
  const categories = Array.from(new Set(posts.map((p) => p.category)));
  return categories.map((c) => ({ category: c }));
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const now = Date.now();

  // Load everything
  const all = getAllPosts();

  // ================================
  // FILTER: Only show published posts
  // ================================
  const posts = all
    .map((p: any) => {
      // Auto-publish scheduled posts that have passed
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
    .filter((p: any) => p.category === params.category)
    .filter((p: any) => {
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
      <h1 className="text-4xl font-bold mb-8">
        Category: {params.category}
      </h1>

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

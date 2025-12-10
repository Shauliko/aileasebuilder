export const revalidate = 10;

import Link from "next/link";
import { getAllPosts } from "@/lib/getPost";

export default async function BlogPage() {
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

  const categories = Array.from(new Set(posts.map((p) => p.category).filter(Boolean)));
  const tags = Array.from(new Set(posts.flatMap((p) => p.tags || [])));

  return (
    <main className="max-w-7xl mx-auto py-20 px-6 grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-12">

      {/* SIDEBAR */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-10">

          {/* CATEGORY LIST */}
          <section>
            <h3 className="text-gray-300 font-semibold mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/blog/category/${cat}`}
                  className="block text-gray-400 hover:text-white transition"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </section>

          {/* TAG LIST */}
          <section>
            <h3 className="text-gray-300 font-semibold mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog/tag/${tag}`}
                  className="px-3 py-1 rounded-full bg-white/10 text-gray-300 text-xs hover:bg-blue-600/20 hover:text-blue-300 transition"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <section>
        {/* HEADER */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold tracking-tight text-white mb-4">
            Real Estate Knowledge Hub
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Expert guides for landlords & tenants — backed by legal clarity, accuracy, and AI enhancements.
          </p>
        </div>

        {posts.length === 0 && (
          <p className="text-gray-400 text-center mt-20">No published posts yet.</p>
        )}

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-xl border border-white/10 bg-white/5 backdrop-blur p-6
                         hover:border-blue-500/40 hover:bg-white/10 transition-all duration-300 shadow-lg"
            >
              {/* CATEGORY */}
              <div className="mb-3">
                <span className="text-xs px-3 py-1 rounded-full bg-blue-600/20 text-blue-300">
                  {post.category || "General"}
                </span>
              </div>

              {/* TITLE */}
              <h2 className="text-2xl font-semibold text-white group-hover:text-blue-300 transition-colors">
                {post.title}
              </h2>

              {/* DATE */}
              <p className="text-gray-500 text-sm mt-1">{post.date}</p>

              {/* DESCRIPTION */}
              {post.meta_description && (
                <p className="text-gray-400 mt-4 line-clamp-3">{post.meta_description}</p>
              )}

              {/* TAGS */}
              {post.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs rounded-md bg-gray-700/40 text-gray-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* READ MORE */}
              <div className="mt-6 text-blue-400 font-medium group-hover:underline">
                Read more →
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

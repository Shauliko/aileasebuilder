export const revalidate = 10;

import { getAllPosts } from "@/lib/getPost";
import BlogSearchClient from "./BlogSearchClient";
import Link from "next/link";

export default async function BlogPage() {
  const posts = getAllPosts().sort((a: any, b: any) => {
    const da = new Date(a.date || "").getTime();
    const db = new Date(b.date || "").getTime();
    return db - da;
  });

  const featured = posts.filter((p) => p.featured);
  const regular = posts.filter((p) => !p.featured);

  return (
    <main className="max-w-3xl mx-auto py-16 px-4">

      <h1 className="text-4xl font-bold mb-4">Blog</h1>
      <p className="text-sm text-gray-400 mb-8">
        Search all posts by title, category, tags, or content.
      </p>

      {/* FEATURED POSTS */}
      {featured.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Featured Posts</h2>

          <ul className="space-y-6">
            {featured.map((post) => (
              <li
                key={post.slug}
                className="border border-yellow-500/30 rounded-lg p-4 bg-yellow-500/5"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-xl font-semibold underline"
                >
                  {post.title}
                </Link>

                <p className="text-gray-500 text-xs mt-1">
                  {post.date}
                  {post.category && <> · {post.category}</>}
                </p>

                {post.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {post.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-[10px] bg-yellow-600/20 text-yellow-300 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* SEARCH + ALL POSTS LIST (still includes featured internally but UI separates them) */}
      <BlogSearchClient posts={posts as any} />
    </main>
  );
}

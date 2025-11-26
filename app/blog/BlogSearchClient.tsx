"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Post = {
  slug: string;
  title: string;
  date: string;
  category?: string;
  tags?: string[];
  content?: string;
};

export default function BlogSearchClient({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return posts;

    return posts.filter((post) => {
      const haystack = [
        post.title,
        post.category,
        (post.tags || []).join(" "),
        post.content,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [posts, query]);

  return (
    <div className="space-y-6">
      <input
        className="border border-white/10 bg-transparent rounded-md px-3 py-2 w-full text-sm"
        placeholder="Search posts by title, category, tag, or content..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <p className="text-xs text-gray-500">
        Showing {filtered.length} of {posts.length} posts
      </p>

      <ul className="space-y-6">
        {filtered.map((post) => (
          <li
            key={post.slug}
            className="border border-white/10 rounded-lg p-4"
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

            {/* TAGS */}
            {post.tags?.length ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tag/${tag}`}
                    className="px-2 py-1 text-[10px] bg-blue-600/20 text-blue-300 rounded-md"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

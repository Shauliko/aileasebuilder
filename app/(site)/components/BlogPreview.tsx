"use client";

import SectionWrapper from "./SectionWrapper";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function BlogPreview() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/blog?limit=3")
      .then((res) => res.json())
      .then((data) => setPosts(data.posts || []));
  }, []);

  return (
    <SectionWrapper className="py-24 px-6 max-w-3xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
        Latest from Our Blog
      </h2>

      <div className="mt-12 space-y-8">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block bg-[#0d1220] p-6 rounded-xl border border-white/10 hover:border-blue-500/40 transition"
          >
            <h3 className="text-xl font-semibold text-blue-400">{post.title}</h3>
            <p className="mt-3 text-gray-300 line-clamp-2">{post.excerpt}</p>
          </Link>
        ))}
      </div>

      <div className="text-center mt-10">
        <Link
          href="/blog"
          className="text-blue-400 hover:text-blue-300 transition"
        >
          View All Posts →
        </Link>
      </div>
    </SectionWrapper>
  );
}

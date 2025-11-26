import { getAllPosts } from "@/lib/getPost";
import Link from "next/link";

export function generateStaticParams() {
  const posts = getAllPosts();
  const tags = new Set<string>();

  posts.forEach((post) => {
    (post.tags || []).forEach((t: string) => tags.add(t));
  });

  return [...tags].map((tag) => ({ tag }));
}

export default function TagPage({ params }: { params: { tag: string } }) {
  const posts = getAllPosts().filter((post) =>
    (post.tags || []).includes(params.tag)
  );

  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-8">
        Tag: #{params.tag}
      </h1>

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

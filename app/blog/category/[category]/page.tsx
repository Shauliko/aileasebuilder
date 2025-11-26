import { getAllPosts } from "@/lib/getPost";
import Link from "next/link";

export function generateStaticParams() {
  const posts = getAllPosts();
  const categories = Array.from(new Set(posts.map((p) => p.category)));
  return categories.map((c) => ({ category: c }));
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const posts = getAllPosts().filter(
    (post) => post.category === params.category
  );

  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-8">
        Category: {params.category}
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

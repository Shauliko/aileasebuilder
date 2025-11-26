import { getAllPosts } from "@/lib/getPost";
import Link from "next/link";

export default function BlogListPage() {
  const posts = getAllPosts();

  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8">Blog Posts</h1>

      <Link
        href="/admin/blog-new"
        className="inline-block mb-6 bg-black text-white px-4 py-2"
      >
        + New Post
      </Link>

      <ul className="space-y-6">
        {posts.map((post) => {
          const isScheduled =
            post.publish_at &&
            new Date(post.publish_at).getTime() > Date.now();

          return (
            <li
              key={post.slug}
              className="border p-4 rounded bg-white"
            >
              <h2 className="text-xl font-semibold">{post.title}</h2>

              <p className="text-sm text-gray-500">{post.date}</p>

              {/* STATUS BADGES */}
              <div className="mt-2 flex gap-2 text-xs">
                {isScheduled && (
                  <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded">
                    Scheduled: {post.publish_at}
                  </span>
                )}

                {!isScheduled && (
                  <span className="px-2 py-1 bg-green-200 text-green-800 rounded">
                    Published
                  </span>
                )}

                {post.featured && (
                  <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded">
                    Featured
                  </span>
                )}
              </div>

              <div className="flex gap-4 mt-4">
                <Link
                  href={`/admin/blog-edit/${post.slug}`}
                  className="text-blue-500 underline"
                >
                  Edit
                </Link>

                <Link
                  href={`/admin/blog-delete/${post.slug}`}
                  className="text-red-500 underline"
                >
                  Delete
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

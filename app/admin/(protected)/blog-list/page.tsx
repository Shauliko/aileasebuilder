// app/admin/(protected)/blog-list/page.tsx
import Link from "next/link";
import { getAllPosts } from "@/lib/getPost";

export const revalidate = 0;

export default async function AdminBlogListPage() {
  const now = Date.now();
  const posts = await getAllPosts();

  return (
    <main className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Link
          href="/admin/blog-new"
          className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm"
        >
          + New Post
        </Link>
      </div>

      <table className="w-full text-sm border border-white/10">
        <thead className="bg-white/5">
          <tr>
            <th className="text-left px-3 py-2">Title</th>
            <th className="text-left px-3 py-2">Slug</th>
            <th className="text-left px-3 py-2">Status</th>
            <th className="text-left px-3 py-2">Publish At</th>
            <th className="text-right px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => {
            const isDraft =
              p.published_at === null &&
              (p.publish_at === null || p.publish_at === "");

            const isScheduledFuture =
              p.published_at === null &&
              p.publish_at &&
              new Date(p.publish_at).getTime() > now;

            let status = "Published";
            if (isDraft) status = "Draft";
            else if (isScheduledFuture) status = "Scheduled";

            return (
              <tr key={p.slug} className="border-t border-white/10">
                <td className="px-3 py-2">{p.title}</td>
                <td className="px-3 py-2 text-xs text-gray-400">{p.slug}</td>
                <td className="px-3 py-2">{status}</td>
                <td className="px-3 py-2 text-xs text-gray-400">
                  {p.publish_at || "-"}
                </td>
                <td className="px-3 py-2 text-right space-x-2">
                  <Link
                    href={`/admin/blog-edit/${p.slug}`}
                    className="text-blue-400 underline"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/admin/blog-delete/${p.slug}`}
                    className="text-red-400 underline"
                  >
                    Delete
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}

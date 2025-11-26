import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser(); // Clerk v6 compliant

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen flex bg-[#050816] text-gray-200">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0a0f1e] border-r border-white/10 p-6 space-y-6">
        <div className="text-xl font-semibold mb-6">Admin Panel</div>

        <nav className="flex flex-col space-y-3 text-sm">

          <a href="/admin/settings" className="text-gray-300 hover:text-white transition">
            ⚙️ Settings
          </a>

          <a href="/admin/users" className="text-gray-300 hover:text-white transition">
            👥 Users
          </a>

          {/* ✅ Added BLOG section */}
          <a href="/admin/blog-list" className="text-gray-300 hover:text-white transition">
            📝 Blog
          </a>

          <a href="/admin/blog-new" className="text-gray-300 hover:text-white transition pl-6">
            ➕ New Post
          </a>

          <a href="/admin/blog-list" className="text-gray-300 hover:text-white transition pl-6">
            📄 All Posts
          </a>

          {/* Back link */}
          <a href="/" className="text-gray-500 hover:text-white/80 transition mt-10 text-xs">
            ← Back to Site
          </a>
        </nav>
      </aside>

      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}

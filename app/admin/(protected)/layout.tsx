import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) redirect("/sign-in");

  return (
    <div className="min-h-screen flex bg-[#050816] text-gray-200">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0a0f1e] border-r border-white/10 p-6 space-y-6">

        {/* HEADER */}
        <div className="text-xl font-semibold mb-4">Admin Panel</div>

        {/* ---- COLLAPSIBLE MENU GROUPS ---- */}
        <NavSection title="Orders" icon="📦">
          <NavItem href="/admin/orders" icon="📦" label="All Orders" />
        </NavSection>

        <NavSection title="Blog" icon="📝">
          <NavItem href="/admin/blog-list" icon="📄" label="All Posts" indent />
          <NavItem href="/admin/blog-new" icon="➕" label="New Post" indent />
        </NavSection>

        <NavSection title="Management" icon="⚙️">
          <NavItem href="/admin/settings" icon="⚙️" label="Settings" />
          <NavItem href="/admin/users" icon="👥" label="Users" />
        </NavSection>

        {/* BACK TO SITE */}
        <a
          href="/"
          className="text-gray-500 hover:text-white/80 transition mt-10 text-xs block"
        >
          ← Back to Site
        </a>
      </aside>

      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}

/* ------------------------------
   COMPONENT: Nav Section 
   collapsible with animation
------------------------------ */
function NavSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group">
      <summary className="cursor-pointer flex items-center justify-between py-2 px-2 rounded hover:bg-white/5 text-gray-300">
        <span className="flex items-center gap-2">
          <span>{icon}</span> {title}
        </span>
        <span className="transition-transform group-open:rotate-90 text-gray-400">
          ▶
        </span>
      </summary>

      <div className="mt-2 pl-2 space-y-1">{children}</div>
    </details>
  );
}

/* ------------------------------
   COMPONENT: Nav Item
------------------------------ */
function NavItem({
  href,
  icon,
  label,
  indent = false,
}: {
  href: string;
  icon: string;
  label: string;
  indent?: boolean;
}) {
  return (
    <a
      href={href}
      className={`flex items-center gap-2 py-2 px-2 rounded hover:bg-white/10 text-gray-400 hover:text-white transition ${
        indent ? "pl-6" : ""
      }`}
    >
      <span>{icon}</span> {label}
    </a>
  );
}

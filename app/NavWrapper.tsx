"use client";

import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function NavWrapper() {
  const pathname = usePathname();

  // Hide navbar completely on admin routes
  const isAdminRoute = pathname?.startsWith("/admin");
  if (isAdminRoute) return null;

  return (
    <nav className="w-full border-b border-white/10 bg-[#050816]/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-500 via-cyan-400 to-purple-500 flex items-center justify-center text-xs font-bold">
            AI
          </div>
          <span className="font-semibold tracking-tight">AI Lease Builder</span>
        </a>

        {/* Right Side Navigation */}
        <div className="flex items-center gap-6 text-sm">

          <a href="/generate-lease" className="text-gray-300 hover:text-white transition">
            Generate Lease
          </a>
          <a href="/pricing" className="text-gray-300 hover:text-white transition">
            Pricing
          </a>
          <a href="/faq" className="text-gray-300 hover:text-white transition">
            FAQ
          </a>

          {/* Logged OUT */}
          <SignedOut>
            <a
              href="/sign-in"
              className="px-3 py-1 rounded-md border border-white/20 text-gray-200 hover:bg-white/10 transition"
            >
              Sign in
            </a>
            <a
              href="/sign-up"
              className="px-3 py-1 rounded-md border border-blue-500/50 text-blue-300 hover:bg-blue-500/10 transition"
            >
              Sign up
            </a>
          </SignedOut>

          {/* Logged IN */}
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

        </div>
      </div>
    </nav>
  );
}

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

export default function NavWrapper() {
  const pathname = usePathname();
  const hideNav = pathname.startsWith("/admin");

  if (hideNav) return null;

  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "/generate-lease", label: "Generate Lease" },
    { href: "/pricing", label: "Pricing" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="w-full bg-[#050816] border-b border-white/10 fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">

        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-white">
          AI Lease Builder
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-gray-300 hover:text-white transition"
            >
              {item.label}
            </Link>
          ))}

          <SignedIn>
            <UserButton />
          </SignedIn>

          <SignedOut>
            <Link
              href="/sign-in"
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 text-white"
            >
              Sign In
            </Link>
          </SignedOut>
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-gray-300 text-2xl"
          onClick={() => setOpen(true)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Slide-Out Menu */}
      {open && (
        <div className="fixed inset-0 z-50 flex">

          {/* Dark background overlay */}
          <div
            className="flex-1 bg-black/50"
            onClick={() => setOpen(false)}
          />

          {/* Slide-out panel */}
          <div className="w-64 bg-[#0a0f1e] border-l border-white/10 p-6 animate-slideLeft">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-semibold">Menu</span>
              <button
                className="text-gray-300 text-2xl"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>

            <nav className="flex flex-col gap-4">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-300 hover:text-white transition text-lg"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <SignedIn>
                <div className="mt-4">
                  <UserButton />
                </div>
              </SignedIn>

              <SignedOut>
                <Link
                  href="/sign-in"
                  className="mt-6 px-4 py-2 text-center bg-blue-600 rounded hover:bg-blue-500 text-white"
                  onClick={() => setOpen(false)}
                >
                  Sign In
                </Link>
              </SignedOut>
            </nav>
          </div>
        </div>
      )}

      {/* Animation for slide-out */}
      <style jsx global>{`
        @keyframes slideLeft {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slideLeft {
          animation: slideLeft 0.25s ease-out forwards;
        }
      `}</style>
    </header>
  );
}

// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Lease Builder",
  description: "Generate state-compliant residential lease agreements in minutes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-[#050816] text-white min-h-screen`}
      >
        {/* Top nav */}
        <nav className="w-full border-b border-white/10 bg-[#050816]/90 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-500 via-cyan-400 to-purple-500 flex items-center justify-center text-xs font-bold">
                AI
              </div>
              <span className="font-semibold tracking-tight">
                AI Lease Builder
              </span>
            </a>

            <div className="flex items-center gap-6 text-sm">
              <a
                href="/generate-lease"
                className="text-gray-300 hover:text-white transition"
              >
                Generate Lease
              </a>
              <a
                href="/pricing"
                className="text-gray-300 hover:text-white transition"
              >
                Pricing
              </a>
              <a
                href="/faq"
                className="text-gray-300 hover:text-white transition"
              >
                FAQ
              </a>
            </div>
          </div>
        </nav>

        <main>{children}</main>
      </body>
    </html>
  );
}

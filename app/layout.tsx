import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import NavWrapper from "./NavWrapper"; // <-- added

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
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-[#050816] text-white min-h-screen`}>
          
          {/* Navbar automatically hides on /admin routes */}
          <NavWrapper />

          <main className="w-full min-h-screen bg-[#050816] text-gray-300">
            {children}
          </main>

          {/* FOOTER (still visible on public pages, hidden on admin pages via NavWrapper) */}
          <footer className="w-full border-t border-white/10 bg-[#050816]/90 backdrop-blur mt-10">
            <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-center gap-6 text-sm text-gray-400">
              <a href="/legal/terms" className="hover:text-white transition">Terms</a>
              <a href="/legal/privacy" className="hover:text-white transition">Privacy</a>
              <a href="/legal/disclaimer" className="hover:text-white transition">Disclaimer</a>
            </div>
          </footer>

        </body>
      </html>
    </ClerkProvider>
  );
}

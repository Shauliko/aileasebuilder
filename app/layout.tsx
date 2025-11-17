import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Lease Builder",
  description: "Generate legally compliant residential leases instantly with AI."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        {/* NAVBAR */}
        <nav className="w-full border-b bg-white">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-semibold text-blue-600">
              AI Lease Builder
            </a>
            <div className="flex gap-6 text-sm">
              <a href="/generate-lease" className="hover:text-blue-600">Generate Lease</a>
              <a href="/pricing" className="hover:text-blue-600">Pricing</a>
              <a href="/faq" className="hover:text-blue-600">FAQ</a>
            </div>
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <main className="max-w-6xl mx-auto px-6 py-10">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="w-full border-t mt-20 py-6 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} AI Lease Builder — All rights reserved.
        </footer>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import NavWrapper from "./NavWrapper";
import Script from "next/script";
import CookieBanner from "./components/CookieBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://aileasebuilder.com"),
  title: {
    default: "AI Lease Builder",
    template: "%s – AI Lease Builder",
  },
  description:
    "Generate state-compliant residential lease agreements in minutes. The only AI-driven lease generator tailored to your property and your state laws.",
  keywords: [
    "lease generator",
    "AI lease builder",
    "residential lease",
    "state compliant lease",
    "rental agreement",
    "AI real estate tools",
  ],
  openGraph: {
    title: "AI Lease Builder",
    description:
      "Generate state-compliant residential leases instantly with AI.",
    type: "website",
    url: "https://aileasebuilder.com",
    siteName: "AI Lease Builder",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Lease Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Lease Builder",
    description:
      "Generate state-compliant residential leases instantly with AI.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icon-192.png",
  },
  alternates: {
    canonical: "https://aileasebuilder.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <Script
            id="org-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "AI Lease Builder",
                url: "https://aileasebuilder.com",
                logo: "https://aileasebuilder.com/og-image.png",
                sameAs: [],
                description:
                  "AI platform that generates state-specific, lawyer-grade residential leases instantly.",
              }),
            }}
          />
          {/* GOOGLE ADS TAG */}
            <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17780439036"></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'AW-17780439036');
                `,
              }}
            />
            
        </head>
      <body
          className={`${inter.className} bg-[#050816] text-white min-h-screen`}
        >
          <NavWrapper />

          <main className="w-full min-h-screen bg-[#050816] text-gray-300 pt-24">
            {children}
          </main>

          <footer className="w-full border-t border-white/10 bg-[#050816]/90 backdrop-blur mt-10">
            <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-center gap-6 text-sm text-gray-400">
              <a href="/blog" className="hover:text-white transition">
                Blog
              </a>
              <a href="/about" className="hover:text-white transition">
                About
              </a>
              <a href="/contact" className="hover:text-white transition">
                Contact
              </a>
              <a
                href="/legal/terms"
                className="hover:text-white transition"
              >
                Terms
              </a>
              <a
                href="/legal/privacy"
                className="hover:text-white transition"
              >
                Privacy
              </a>
              <a
                href="/legal/disclaimer"
                className="hover:text-white transition"
              >
                Disclaimer
              </a>
            </div>
          </footer>

          <CookieBanner />
        </body>
      </html>
    </ClerkProvider>
  );
}

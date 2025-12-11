import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import NavWrapper from "./NavWrapper";
import Script from "next/script";
import CookieBanner from "./components/CookieBanner";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://aileasebuilder.com"),
  title: {
    default: "AI Lease Builder – State-Specific AI Lease Generator",
    template: "%s – AI Lease Builder",
  },
  description:
    "Generate state-specific, lawyer-grade residential leases in minutes. No templates — a fully automated AI lease generator built for US landlords and property managers.",
  keywords: [
    "lease generator",
    "AI lease builder",
    "residential lease",
    "state compliant lease",
    "state-specific lease agreement",
    "rental agreement",
    "rental contract",
    "landlord tools",
    "AI real estate tools",
  ],
  applicationName: "AI Lease Builder",
  creator: "AI Lease Builder",
  publisher: "AI Lease Builder",
  category: "Real Estate",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "AI Lease Builder – State-Specific AI Lease Generator",
    description:
      "Generate state-compliant, lawyer-grade residential leases instantly with AI. Tailored to your property, your tenants, and your state laws.",
    type: "website",
    url: "https://aileasebuilder.com",
    siteName: "AI Lease Builder",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Lease Builder – Generate state-specific AI-powered lease agreements",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Lease Builder – State-Specific AI Lease Generator",
    description:
      "Generate state-compliant, lawyer-grade residential leases instantly with AI.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icon-192.png",
  },
  alternates: {
    canonical: "https://aileasebuilder.com",
    languages: {
      "en-US": "https://aileasebuilder.com",
      "x-default": "https://aileasebuilder.com",
    },
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
            id="org-website-product-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "Organization",
                    "@id": "https://aileasebuilder.com#organization",
                    name: "AI Lease Builder",
                    url: "https://aileasebuilder.com",
                    logo: "https://aileasebuilder.com/og-image.png",
                    sameAs: [],
                    description:
                      "AI platform that generates state-specific, lawyer-grade residential leases instantly.",
                  },
                  {
                    "@type": "WebSite",
                    "@id": "https://aileasebuilder.com#website",
                    url: "https://aileasebuilder.com",
                    name: "AI Lease Builder",
                    inLanguage: "en-US",
                    description:
                      "AI-driven lease generator for US landlords and property managers. Create state-compliant leases in minutes.",
                    publisher: {
                      "@id": "https://aileasebuilder.com#organization",
                    },
                    potentialAction: {
                      "@type": "SearchAction",
                      target:
                        "https://aileasebuilder.com/blog?q={search_term_string}",
                      "query-input": "required name=search_term_string",
                    },
                  },
                  {
                    "@type": "SoftwareApplication",
                    "@id": "https://aileasebuilder.com#app",
                    name: "AI Lease Builder",
                    applicationCategory: "BusinessApplication",
                    operatingSystem: "Web",
                    url: "https://aileasebuilder.com",
                    description:
                      "Web-based AI lease generator that creates state-specific residential leases tailored to your property and tenants.",
                    offers: {
                      "@type": "Offer",
                      availability: "https://schema.org/InStock",
                      price: "8.00",
                      priceCurrency: "USD",
                    },
                  },
                ],
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
          <Providers>
            <>
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
            </>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}

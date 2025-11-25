// app/(public)/legal/privacy/page.tsx
// (Surgical SEO injection added: JSON-LD + internal link)

import Script from "next/script";

const FALLBACK_PRIVACY_HTML = `
<h2>Privacy Policy</h2>
<p>This policy describes how AI Lease Builder collects, uses, and stores information when you use the service.</p>
<p>We may collect account information (such as email), usage data, and the content you submit to generate lease documents. We use this information to operate and improve the service, provide support, and comply with legal obligations.</p>
`;

async function getSettings() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const res = await fetch(`${baseUrl}/api/admin/settings`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

export default async function PrivacyPage() {
  const data = await getSettings();
  const html =
    data?.legal?.privacyUrl && data.legal.privacyUrl.trim().length > 0
      ? data.legal.privacyUrl
      : FALLBACK_PRIVACY_HTML;

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Privacy Policy",
    url: "https://aileasebuilder.com/legal/privacy",
    description:
      "Read the AI Lease Builder privacy policy. Learn how we collect, use, and protect your information when generating residential lease documents.",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-gray-200">
      
      {/* SEO Structured Data */}
      <Script
        id="privacy-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <div
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* ✅ INTERNAL LINK ADDED (surgical) */}
      <p className="text-gray-400 text-sm mt-8">
        Return to{" "}
        <a
          href="/"
          className="text-cyan-300 hover:underline underline-offset-2"
        >
          Home
        </a>
        .
      </p>
    </div>
  );
}

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

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-gray-200">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

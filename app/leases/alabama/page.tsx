import StateLeasePage from "../_components/StateLeasePage";
import { STATE_CONFIGS } from "../stateConfigs";
import type { Metadata } from "next";
import Script from "next/script";

export const dynamic = "force-static";

const CONFIG = STATE_CONFIGS.find((s) => s.slug === "alabama")!;
const { stateName, abbreviation, slug } = CONFIG;

const pageUrl = `https://aileasebuilder.com/leases/${slug}`;

export const metadata: Metadata = {
  title: `${stateName} Residential Lease Agreement (${abbreviation}) – State-Compliant Rental Contract`,
  description: `Generate a ${stateName}-specific residential lease agreement that follows ${stateName} landlord–tenant laws. Lawyer-grade, enforceable rental contract for landlords and property managers.`,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: `${stateName} Residential Lease Agreement (${abbreviation})`,
    description: `Create a state-compliant ${stateName} residential lease. AI builds a lawyer-style rental agreement aligned with ${stateName} landlord–tenant rules.`,
    url: pageUrl,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: `${stateName} Residential Lease Agreement (${abbreviation})`,
    description: `Generate a ${stateName}-compliant residential lease in minutes with the AI Lease Builder.`,
  },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: `${stateName} Residential Lease Agreement`,
    description: `AI-generated residential lease agreement tailored to ${stateName} landlord–tenant law.`,
    areaServed: { "@type": "State", name: stateName },
    provider: {
      "@type": "Organization",
      name: "AI Lease Builder",
      url: "https://aileasebuilder.com",
    },
    url: pageUrl,
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://aileasebuilder.com" },
      { "@type": "ListItem", position: 2, name: "Leases", item: "https://aileasebuilder.com/leases" },
      { "@type": "ListItem", position: 3, name: `${stateName} Residential Lease Agreement`, item: pageUrl },
    ],
  };

  const relatedStates = [
    { slug: "mississippi", label: "Mississippi" },
    { slug: "georgia", label: "Georgia" },
    { slug: "california", label: "California" },
    { slug: "new-york", label: "New York" },
  ];

  return (
    <>
      <Script
        id="lease-legalservice-jsonld-al"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Script
        id="breadcrumbs-jsonld-al"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <section className="mb-10 space-y-3 text-sm">
        <a href="/leases" className="inline-block text-emerald-400 underline-offset-2 hover:underline">
          ← Back to All States
        </a>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-300">
          <span className="font-semibold text-white">Related States:</span>
          {relatedStates.map((st) => (
            <a
              key={st.slug}
              href={`/leases/${st.slug}`}
              className="text-emerald-400 underline-offset-2 hover:underline"
            >
              {st.label}
            </a>
          ))}
        </div>
      </section>
      <StateLeasePage config={CONFIG} />
    </>
  );
}

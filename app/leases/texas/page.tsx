import StateLeasePage from "../_components/StateLeasePage";
import { STATE_CONFIGS } from "../stateConfigs";
import type { Metadata } from "next";
import Script from "next/script";

export const dynamic = "force-static";

const CONFIG = STATE_CONFIGS.find((s) => s.slug === "texas")!;
const { stateName, abbreviation, slug } = CONFIG;

const pageUrl = `https://aileasebuilder.com/leases/${slug}`;

export const metadata: Metadata = {
  title: `${stateName} Residential Lease Agreement (${abbreviation}) – State-Compliant Rental Contract`,
  description: `Generate a ${stateName}-specific residential lease agreement aligned with ${stateName} landlord-tenant laws. Create a lawyer-grade, enforceable rental contract in minutes.`,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: `${stateName} Residential Lease Agreement (${abbreviation})`,
    description: `Create a ${stateName} residential lease that follows all ${stateName} landlord-tenant regulations. Built by AI. Lawyer-style. Fully state-compliant.`,
    url: pageUrl,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: `${stateName} Residential Lease Agreement (${abbreviation})`,
    description: `Instantly generate a ${stateName}-compliant residential lease with the AI Lease Builder.`,
  },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: `${stateName} Residential Lease Agreement`,
    description: `State-specific residential lease drafted using AI, tailored to ${stateName} landlord-tenant law.`,
    areaServed: {
      "@type": "State",
      name: stateName,
    },
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
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://aileasebuilder.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Leases",
        item: "https://aileasebuilder.com/leases",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${stateName} Residential Lease Agreement`,
        item: pageUrl,
      },
    ],
  };

  // Option 3 (Hybrid): 2 neighbors + 2 high-value states
  const relatedStates = [
    { slug: "oklahoma", label: "Oklahoma" }, // neighbor
    { slug: "louisiana", label: "Louisiana" }, // neighbor
    { slug: "california", label: "California" }, // high-value
    { slug: "new-york", label: "New York" }, // high-value
  ];

  return (
    <>
      {/* JSON-LD: LegalService */}
      <Script
        id="lease-legalservice-jsonld-tx"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* JSON-LD: Breadcrumbs */}
      <Script
        id="breadcrumbs-jsonld-tx"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      {/* Internal Linking Booster */}
      <section className="mb-10 space-y-3 text-sm">
        <a
          href="/leases"
          className="inline-block text-emerald-400 underline-offset-2 hover:underline"
        >
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

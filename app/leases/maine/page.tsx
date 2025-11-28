import StateLeasePage from "../_components/StateLeasePage";
import { STATE_CONFIGS } from "../stateConfigs";
import type { Metadata } from "next";
import Script from "next/script";

export const dynamic = "force-static";

const CONFIG = STATE_CONFIGS.find((s) => s.slug === "maine")!;
const { stateName, abbreviation, slug } = CONFIG;
const pageUrl = `https://aileasebuilder.com/leases/${slug}`;

export const metadata: Metadata = {
  title:`${stateName} Residential Lease Agreement (${abbreviation})`,
  description:`Generate a ${stateName} residential lease compliant with ${stateName} landlord–tenant rules.`,
  alternates:{ canonical:pageUrl },
  openGraph:{
    title:`${stateName} Residential Lease Agreement`,
    description:`Create a ${stateName}-specific rental lease with AI Lease Builder.`,
    url:pageUrl,
    type:"article",
  },
  twitter:{
    card:"summary_large_image",
    title:`${stateName} Residential Lease Agreement`,
    description:`Generate your ${stateName} lease with AI.`,
  },
};

export default function Page() {
  const jsonLd = {
    "@context":"https://schema.org",
    "@type":"LegalService",
    name:`${stateName} Residential Lease Agreement`,
    description:`AI-crafted ${stateName} lease following state law.`,
    areaServed:{ "@type":"State", name:stateName },
    provider:{ "@type":"Organization", name:"AI Lease Builder", url:"https://aileasebuilder.com" },
    url:pageUrl,
  };

  const breadcrumbs = {
    "@context":"https://schema.org",
    "@type":"BreadcrumbList",
    itemListElement:[
      { "@type":"ListItem", position:1, name:"Home", item:"https://aileasebuilder.com" },
      { "@type":"ListItem", position:2, name:"Leases", item:"https://aileasebuilder.com/leases" },
      { "@type":"ListItem", position:3, name:stateName, item:pageUrl },
    ],
  };

  const relatedStates = [
    { slug:"new-hampshire", label:"New Hampshire" },
    { slug:"massachusetts", label:"Massachusetts" },
    { slug:"new-york", label:"New York" },
    { slug:"california", label:"California" },
  ];

  return (
    <>
      <Script id="me-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html:JSON.stringify(jsonLd) }} />
      <Script id="me-breadcrumbs" type="application/ld+json" dangerouslySetInnerHTML={{ __html:JSON.stringify(breadcrumbs) }} />

      <section className="mb-10 space-y-3 text-sm">
        <a href="/leases" className="text-emerald-400 hover:underline underline-offset-2">← Back to All States</a>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-300">
          <span className="font-semibold text-white">Related States:</span>
          {relatedStates.map(st => (
            <a key={st.slug} href={`/leases/${st.slug}`} className="text-emerald-400 hover:underline underline-offset-2">{st.label}</a>
          ))}
        </div>
      </section>

      <StateLeasePage config={CONFIG} />
    </>
  );
}

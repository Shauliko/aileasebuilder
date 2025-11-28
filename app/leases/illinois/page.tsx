import StateLeasePage from "../_components/StateLeasePage";
import { STATE_CONFIGS } from "../stateConfigs";
import type { Metadata } from "next";
import Script from "next/script";

export const dynamic = "force-static";

const CONFIG = STATE_CONFIGS.find((s) => s.slug === "illinois")!;
const { stateName, abbreviation, slug } = CONFIG;
const pageUrl = `https://aileasebuilder.com/leases/${slug}`;

export const metadata: Metadata = {
  title:`${stateName} Residential Lease Agreement (${abbreviation})`,
  description:`Generate a ${stateName}-specific residential lease that meets ${stateName} rental law. AI-built, lawyer-grade.`,
  alternates:{ canonical:pageUrl },
  openGraph:{
    title:`${stateName} Residential Lease Agreement`,
    description:`Create a ${stateName} residential lease aligned with landlord–tenant rules.`,
    url:pageUrl,
    type:"article",
  },
  twitter:{
    card:"summary_large_image",
    title:`${stateName} Residential Lease Agreement`,
    description:`Generate a ${stateName} lease in minutes.`,
  },
};

export default function Page() {
  const jsonLd = {
    "@context":"https://schema.org",
    "@type":"LegalService",
    name:`${stateName} Residential Lease Agreement`,
    description:`AI-created residential lease compliant with ${stateName} statutes.`,
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
    { slug:"indiana", label:"Indiana" },
    { slug:"wisconsin", label:"Wisconsin" },
    { slug:"new-york", label:"New York" },
    { slug:"california", label:"California" },
  ];

  return (
    <>
      <Script id="il-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html:JSON.stringify(jsonLd) }}/>
      <Script id="il-breadcrumbs" type="application/ld+json" dangerouslySetInnerHTML={{ __html:JSON.stringify(breadcrumbs) }}/>

      <section className="mb-10 space-y-3 text-sm">
        <a href="/leases" className="text-emerald-400 hover:underline underline-offset-2">← Back to All States</a>

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-300">
          <span className="font-semibold text-white">Related States:</span>
          {relatedStates.map(st=>(
            <a key={st.slug} href={`/leases/${st.slug}`} className="text-emerald-400 hover:underline underline-offset-2">
              {st.label}
            </a>
          ))}
        </div>
      </section>

      <StateLeasePage config={CONFIG}/>
    </>
  );
}

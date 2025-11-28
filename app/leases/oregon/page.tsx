import StateLeasePage from "../_components/StateLeasePage";
import { STATE_CONFIGS } from "../stateConfigs";
import type { Metadata } from "next";
import Script from "next/script";

export const dynamic = "force-static";

const CONFIG = STATE_CONFIGS.find(s => s.slug === "oregon")!;
const { stateName, abbreviation, slug } = CONFIG;
const pageUrl = `https://aileasebuilder.com/leases/${slug}`;

export const metadata: Metadata = {
  title:`${stateName} Residential Lease Agreement (${abbreviation})`,
  description:`Create a ${stateName}-compliant residential lease aligned with ${stateName} rental law. Lawyer-grade, AI-built.`,
  alternates:{canonical:pageUrl},
  openGraph:{
    title:`${stateName} Residential Lease Agreement`,
    description:`Generate a ${stateName}-compliant lease instantly.`,
    url:pageUrl,
    type:"article",
  },
  twitter:{
    card:"summary_large_image",
    title:`${stateName} Residential Lease Agreement`,
    description:`Build your ${stateName} lease in minutes with AI.`,
  },
};

export default function Page(){
  const jsonLd={
    "@context":"https://schema.org",
    "@type":"LegalService",
    name:`${stateName} Residential Lease Agreement`,
    description:`AI-generated ${stateName} rental lease aligned with state laws.`,
    areaServed:{ "@type":"State", name:stateName},
    provider:{ "@type":"Organization", name:"AI Lease Builder", url:"https://aileasebuilder.com"},
    url:pageUrl
  };

  const breadcrumbs={
    "@context":"https://schema.org",
    "@type":"BreadcrumbList",
    itemListElement:[
      {"@type":"ListItem",position:1,name:"Home",item:"https://aileasebuilder.com"},
      {"@type":"ListItem",position:2,name:"Leases",item:"https://aileasebuilder.com/leases"},
      {"@type":"ListItem",position:3,name:stateName,item:pageUrl},
    ]
  };

  const relatedStates=[
    { slug:"washington", label:"Washington" },
    { slug:"idaho", label:"Idaho" },
    { slug:"california", label:"California" },
    { slug:"texas", label:"Texas" },
  ];

  return(
    <>
      <Script id="or-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
      <Script id="or-breadcrumbs" type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumbs)}}/>

      <section className="mb-10 space-y-3 text-sm">
        <a href="/leases" className="text-emerald-400 underline-offset-2 hover:underline">← Back to All States</a>
        <div className="flex flex-wrap gap-3 mt-4 text-xs text-gray-300">
          <span className="font-semibold text-white">Related States:</span>
          {relatedStates.map(st=>(
            <a key={st.slug}
               href={`/leases/${st.slug}`}
               className="text-emerald-400 underline-offset-2 hover:underline">{st.label}</a>
          ))}
        </div>
      </section>

      <StateLeasePage config={CONFIG}/>
    </>
  );
}

"use client";

import Script from "next/script";
import StripePricingTable from "./StripePricingTable";

export default function PricingPage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script
        id="pricing-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "AI Lease Builder",
            description:
              "Generate state-specific, lawyer-grade residential leases instantly. Your first English lease is free. Additional leases cost $8.",
            offers: {
              "@type": "Offer",
              price: "8.00",
              priceCurrency: "USD",
              url: "https://aileasebuilder.com/pricing",
              availability: "https://schema.org/InStock",
            },
          }),
        }}
      />

      <div className="min-h-screen bg-[#050816] text-white px-6 py-20">
        <h1 className="text-4xl font-bold text-center mb-8">
          Simple, Transparent Pricing
        </h1>

        <p className="text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          Generate your{" "}
          <span className="text-white font-semibold">first English lease for free</span>.  
          Every additional, full state-compliant lease—English or multilingual—
          costs just <span className="text-white font-semibold">$8</span>.
          No subscriptions. No hidden fees. Only pay when you need a new lease.{" "}
          <a
            href="/generate-lease"
            className="text-cyan-300 hover:underline underline-offset-2"
          >
            Try generating a lease now
          </a>.
        </p>

        {/* One-time $8 purchase CTA */}
        <div className="max-w-md mx-auto mt-14 text-center">
          <button
            onClick={async () => {
              const res = await fetch("/api/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  leaseData: {},     // Empty: user fills form after payment
                  planType: "payg",
                  languages: [],     // No languages selected here; user picks later
                  email: "",         // Stripe will collect
                }),
              });

              const data = await res.json();
              if (data?.url) {
                window.location.href = data.url;
              } else {
                alert("Unable to start checkout. Please try again.");
              }
            }}
            className="px-8 py-4 rounded-full bg-cyan-600 hover:bg-cyan-500 text-black font-semibold text-lg shadow-lg transition"
          >
            Purchase a Lease – $8
          </button>

          <p className="text-gray-400 text-sm mt-4">
            One-time payment. No subscriptions.  
            Your free English lease remains available anytime.
          </p>
        </div>


        <p className="text-gray-400 text-center mt-10 text-sm max-w-xl mx-auto">
          AI Lease Builder creates legally-structured residential leases tailored to your property type,
          your state laws, and your custom rules—far more accurate and compliant than templates or generic forms.{" "}
          <a
            href="/faq"
            className="text-cyan-300 hover:underline underline-offset-2"
          >
            Read the FAQ
          </a>{" "}
          for details.
        </p>
      </div>
    </>
  );
}

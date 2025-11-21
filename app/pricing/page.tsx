"use client";

import Script from "next/script";
import StripePricingTable from "./StripePricingTable";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#050816] text-white px-6 py-20">
      <h1 className="text-4xl font-bold text-center mb-8">Choose Your Plan</h1>

      <p className="text-gray-300 text-center mb-12 max-w-2xl mx-auto">
        Get instant access to AI-powered lease generation. Your first English lease is free.
        Multilingual and unlimited generation requires a paid plan.
      </p>

      {/* Stripe Pricing Component */}
      <div className="max-w-4xl mx-auto mt-10">
        <StripePricingTable />
      </div>
    </div>
  );
}

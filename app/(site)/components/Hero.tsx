"use client";

import SectionWrapper from "./SectionWrapper";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-[#050816] pt-32 pb-24">
      {/* Glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full"></div>
      </div>

      <SectionWrapper className="relative z-10 max-w-3xl mx-auto text-center px-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-white drop-shadow-lg">
          Generate Lawyer-Grade Lease Agreements  
          <span className="block text-blue-400">In Seconds. Not Hours.</span>
        </h1>

        <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
          AI Lease Builder creates state-specific, legally accurate lease agreements instantly—
          no templates, no guesswork, no lawyers required.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/generate-lease"
            className="px-6 py-4 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-lg font-medium w-full sm:w-auto"
          >
            Generate Lease
          </Link>

          <Link
            href="/pricing"
            className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-lg text-white text-lg font-medium border border-white/10 w-full sm:w-auto"
          >
            View Pricing
          </Link>
        </div>

        {/* AI Code Visual */}
        <div className="mt-16 max-w-3xl mx-auto bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl">
          <pre className="text-left text-sm md:text-base text-blue-300 overflow-auto whitespace-pre-wrap">
{`{
  "lease_state": "California",
  "rent": 2500,
  "term_months": 12,
  "pets_allowed": false,
  "late_fee_policy": "10% after 5 days",
  "legal_review": "automated",
  "status": "ready_to_generate"
}`}
          </pre>
        </div>
      </SectionWrapper>
    </section>
  );
}

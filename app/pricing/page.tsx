// app/pricing/page.tsx
"use client";

export default function PricingPage() {
  return (
    <div className="relative min-h-screen bg-[#050816] text-white px-4 py-10">
      {/* Glowing background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-10 h-64 w-64 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 h-72 w-72 bg-purple-600/25 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-60 w-60 bg-cyan-400/25 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-400/40 bg-emerald-900/30 text-xs font-medium text-emerald-200 mb-4">
            ✅ 1 Free Lease — English Only
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Simple, Transparent Pricing
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-sm md:text-base">
            Generate your first <span className="font-semibold">English</span>{" "}
            lease for free. Multilingual leases and ongoing usage are available
            on our paid plans.
          </p>
        </header>

        {/* Billing note */}
        <div className="max-w-3xl mx-auto text-center text-xs text-gray-400 mb-6">
          <p>
            ⚖️ AI Lease Builder helps you draft state-compliant residential
            leases quickly. We recommend that a qualified attorney review any
            lease before it&apos;s signed.
          </p>
        </div>

        {/* Pricing grid */}
        <section className="grid gap-5 md:grid-cols-4 mt-4">
          {/* Free / Trial card */}
          <div className="border border-emerald-400/50 bg-[#0a122b]/90 rounded-2xl p-5 flex flex-col shadow-lg shadow-emerald-900/40">
            <h2 className="text-sm font-semibold text-emerald-300">
              Free Starter
            </h2>
            <p className="mt-1 text-xs text-gray-300">
              Try the product with zero risk.
            </p>
            <div className="mt-4 mb-4">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-gray-400 text-xs ml-1">one-time</span>
            </div>
            <ul className="text-xs text-gray-200 space-y-2 flex-1">
              <li>• 1 full English lease — free</li>
              <li>• All U.S. states supported</li>
              <li>• PDF & DOCX download</li>
              <li>• No credit card required</li>
            </ul>
            <a
              href="/generate-lease"
              className="mt-4 inline-flex items-center justify-center w-full rounded-xl bg-emerald-500 text-[#050816] text-sm font-semibold py-2 hover:bg-emerald-400 transition"
            >
              Start Free
            </a>
          </div>

          {/* Pay-As-You-Go */}
          <div className="border border-white/15 bg-[#0b1024]/90 rounded-2xl p-5 flex flex-col">
            <h2 className="text-sm font-semibold text-gray-100">
              Pay As You Go
            </h2>
            <p className="mt-1 text-xs text-gray-300">
              Perfect if you only need a few leases per year.
            </p>
            <div className="mt-4 mb-4">
              <span className="text-3xl font-bold">$8</span>
              <span className="text-gray-400 text-xs ml-1">per lease</span>
            </div>
            <ul className="text-xs text-gray-200 space-y-2 flex-1">
              <li>• English + multilingual leases</li>
              <li>• Unlimited regenerations per lease</li>
              <li>• PDF & DOCX downloads</li>
              <li>• Basic email support</li>
            </ul>
            <a
              href="/generate-lease"
              className="mt-4 inline-flex items-center justify-center w-full rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-500 text-sm font-semibold py-2 hover:opacity-90 transition"
            >
              Generate a Lease
            </a>
          </div>

          {/* Pro (Most Popular) */}
          <div className="relative border border-blue-400/60 bg-[#0d1633]/95 rounded-2xl p-5 flex flex-col shadow-xl shadow-blue-900/50">
            <div className="absolute -top-3 right-4 text-[10px] px-2 py-1 rounded-full bg-blue-500 text-[#050816] font-semibold">
              Most Popular
            </div>
            <h2 className="text-sm font-semibold text-blue-200">Pro</h2>
            <p className="mt-1 text-xs text-gray-300">
              Ideal for active landlords and property managers.
            </p>
            <div className="mt-4 mb-4">
              <span className="text-3xl font-bold">$29</span>
              <span className="text-gray-400 text-xs ml-1">/ month</span>
            </div>
            <ul className="text-xs text-gray-200 space-y-2 flex-1">
              <li>• Unlimited English leases</li>
              <li>• Unlimited multilingual leases</li>
              <li>• Saved templates & presets (coming soon)</li>
              <li>• Priority support</li>
            </ul>
            <button
              type="button"
              className="mt-4 inline-flex items-center justify-center w-full rounded-xl bg-white text-[#050816] text-sm font-semibold py-2 cursor-default opacity-80"
            >
              Subscription Coming Soon
            </button>
          </div>

          {/* Business / Enterprise */}
          <div className="border border-purple-400/50 bg-[#140f2b]/90 rounded-2xl p-5 flex flex-col">
            <h2 className="text-sm font-semibold text-purple-200">
              Business & Enterprise
            </h2>
            <p className="mt-1 text-xs text-gray-300">
              For larger portfolios, brokerages, and SaaS integrations.
            </p>
            <div className="mt-4 mb-4">
              <span className="text-3xl font-bold">Custom</span>
            </div>
            <ul className="text-xs text-gray-200 space-y-2 flex-1">
              <li>• High-volume usage</li>
              <li>• Team accounts & permissions</li>
              <li>• White-label + API access</li>
              <li>• SLAs & legal review workflows</li>
            </ul>
            <a
              href="mailto:support@aileasebuilder.com?subject=Enterprise%20Inquiry"
              className="mt-4 inline-flex items-center justify-center w-full rounded-xl border border-purple-300 text-purple-100 text-sm font-semibold py-2 hover:bg-purple-500/10 transition"
            >
              Contact Sales
            </a>
          </div>
        </section>

        {/* Legal note */}
        <section className="max-w-4xl mx-auto mt-10 text-[11px] text-gray-400 space-y-2">
          <p>
            ⚠️ AI Lease Builder is not a law firm and does not provide legal
            advice. We generate draft documents based on your inputs and public
            legal standards. You are responsible for ensuring that any document
            you use is appropriate for your situation and compliant with local
            law.
          </p>
          <p>
            The <span className="font-semibold">free lease</span> is limited to{" "}
            <span className="font-semibold">English-only</span>. Multilingual
            lease generation (Spanish, French, etc.) requires a paid plan.
          </p>
        </section>
      </div>
    </div>
  );
}

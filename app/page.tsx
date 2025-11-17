"use client";

export default function HomePage() {
  return (
    <div className="relative min-h-[100vh] bg-[#050816] text-white overflow-hidden">
      {/* GLOW BACKGROUND */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-72 w-72 rounded-full bg-blue-600/30 blur-3xl" />
        <div className="absolute top-10 right-[-6rem] h-80 w-80 rounded-full bg-purple-500/25 blur-3xl" />
        <div className="absolute bottom-[-6rem] left-1/4 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      </div>

      {/* CONTENT WRAPPER */}
      <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-24">
        {/* HERO */}
        <section className="text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs font-medium text-gray-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            AI-native legal infra for landlords & property managers
          </p>

          <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
              Generate bulletproof leases
            </span>
            <br />
            with one simple form.
          </h1>

          <p className="mt-5 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            AI Lease Builder turns your property details into a full, state-specific lease agreement.
            No templates, no back-and-forth. Just download, sign, and move in.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/generate-lease"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-500 hover:opacity-90 shadow-lg shadow-blue-500/40 transition"
            >
              Generate My Lease
            </a>
            <a
              href="/pricing"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-lg font-semibold border border-white/25 bg-white/5 hover:bg-white/10 transition"
            >
              View Pricing
            </a>
          </div>

          <p className="mt-4 text-sm text-gray-400">
            No account required · PDF & DOCX · Optimized for US residential leases
          </p>
        </section>

        {/* HERO CARD */}
        <section className="mt-16">
          <div className="rounded-2xl border border-white/10 bg-[#090d1f]/90 shadow-2xl shadow-blue-900/40 p-6 md:p-8 flex flex-col md:flex-row gap-8">
            <div className="flex-1 text-left">
              <h2 className="text-xl font-semibold text-white">
                Designed for landlords, managers & operators
              </h2>
              <p className="mt-3 text-gray-300 text-sm md:text-base">
                From single-family units to multi-property portfolios, AI Lease Builder gives you
                consistent, professional agreements that reduce disputes and protect your interests.
              </p>

              <ul className="mt-5 space-y-3 text-sm text-gray-200">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  State-specific clauses, disclosures & notices.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  Full legal language — not a generic template.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  Instant export to PDF and DOCX for signing.
                </li>
              </ul>
            </div>

            {/* Fake preview */}
            <div className="flex-1">
              <div className="rounded-xl border border-white/10 bg-[#050816] p-4 text-left text-xs text-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <div className="h-2 w-2 rounded-full bg-amber-400" />
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">
                  LEASE PREVIEW · CA · RESIDENTIAL
                </p>
                <p className="text-sm font-semibold mb-2">Residential Lease Agreement</p>
                <p className="text-xs text-gray-300 mb-1">
                  This Residential Lease Agreement ("Agreement") is entered into on{" "}
                  <span className="text-cyan-300">August 1, 2025</span> between{" "}
                  <span className="text-cyan-300">Landlord</span> and{" "}
                  <span className="text-cyan-300">Tenant</span> for the property located at{" "}
                  <span className="text-cyan-300">123 Main Street, Los Angeles, CA</span>.
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Section 1. Term · Section 2. Rent · Section 3. Deposit · Section 4. Utilities ·
                  Section 5. Use of Premises · Section 6. Pets · Section 7. Default · …
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="mt-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Built for real-world leases, not theory.
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[ 
              {
                title: "State-aware engine",
                desc: "We take your state selection and adjust clauses, notice periods and disclosures accordingly.",
              },
              {
                title: "Real legal structure",
                desc: "Full sections for term, rent, deposits, maintenance, rules, remedies and more.",
              },
              {
                title: "Ready-to-sign output",
                desc: "Get clean PDF & DOCX files ready for signature or your favorite e-signing tool.",
              }
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-[#0b1024] p-6 shadow-lg shadow-black/30"
              >
                <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                <p className="text-sm text-gray-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA STRIP */}
        <section className="mt-20">
          <div className="rounded-2xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-purple-500/20 px-6 py-8 md:px-10 md:py-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">
                Ready to generate your first AI-powered lease?
              </h3>
              <p className="text-sm text-gray-200 mt-2">
                It takes less than 2 minutes. No signup required for your first agreement.
              </p>
            </div>
            <a
              href="/generate-lease"
              className="px-8 py-3 rounded-xl bg-white text-[#050816] font-semibold text-sm md:text-base hover:bg-gray-100 transition"
            >
              Generate a Lease Now
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

// app/page.tsx (SERVER COMPONENT — DO NOT ADD "use client")

import Link from "next/link";

export const metadata = {
  title: "AI Lease Builder – Generate Legally-Compliant Leases in Seconds",
  description:
    "The only AI-powered lease generator that creates state-specific, lawyer-grade agreements instantly. No templates, no guesswork. Just download, sign, and move in.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0A0F1F] text-white">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-500/20 blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-6 pt-28 pb-20 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-lg">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
              Generate state-compliant, lawyer-grade leases
            </span>
            <br />
            in seconds — not hours.
          </h1>

          <p className="text-lg md:text-xl text-gray-300 mt-6 max-w-2xl mx-auto">
            AI Lease Builder instantly turns your property details into a
            legally-sound, state-specific residential lease. No templates, no
            guesswork — just a precise, enforceable agreement ready to sign.{" "}
            <Link
              href="/faq"
              className="text-cyan-300 hover:underline underline-offset-2"
            >
              Read FAQs
            </Link>{" "}
            or{" "}
            <Link
              href="/pricing"
              className="text-cyan-300 hover:underline underline-offset-2"
            >
              view pricing
            </Link>
            .
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/generate-lease"
              className="px-8 py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 shadow-lg shadow-blue-500/30 transition"
            >
              Generate My Lease
            </Link>

            <Link
              href="/pricing"
              className="px-8 py-4 rounded-xl text-lg font-semibold border border-white/20 hover:bg-white/10 transition"
            >
              View Pricing
            </Link>
          </div>

          <p className="mt-6 text-sm text-gray-400">
            No account required · State-specific clauses · PDF & DOCX included
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 bg-[#0F162E]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">
            <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              The Only AI Lease Generator Built for Real Legal Compliance
            </span>
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "State-Specific Compliance",
                desc: (
                  <>
                    Automatically adapts to your state's landlord-tenant laws,
                    required disclosures, notice rules, and addenda.{" "}
                    <Link
                      href="/generate-lease"
                      className="text-cyan-300 hover:underline underline-offset-2"
                    >
                      Generate your compliant lease
                    </Link>
                    .
                  </>
                ),
              },
              {
                title: "Lawyer-Grade Language",
                desc: (
                  <>
                    Real legal clauses written in clean, enforceable
                    attorney-style wording.{" "}
                    <Link
                      href="/faq"
                      className="text-cyan-300 hover:underline underline-offset-2"
                    >
                      Learn more
                    </Link>
                    .
                  </>
                ),
              },
              {
                title: "Instant Download",
                desc: (
                  <>
                    Generate a complete multi-page lease and download it
                    instantly in PDF or DOCX formats.{" "}
                    <Link
                      href="/pricing"
                      className="text-cyan-300 hover:underline underline-offset-2"
                    >
                      See pricing
                    </Link>
                    .
                  </>
                ),
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl bg-[#11182F] border border-white/10 hover:border-cyan-400/40 transition shadow-lg shadow-black/30"
              >
                <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>
                <p className="text-gray-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-14 bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
            How AI Lease Builder Creates Your Lease
          </h2>

          <div className="grid md:grid-cols-3 gap-14">
            {[
              {
                number: "1",
                title: "Fill In Property Details",
                desc: "Enter your state, rent amount, lease dates, property details, and rules.",
              },
              {
                number: "2",
                title: "AI Generates a Legal-Grade Lease",
                desc: (
                  <>
                    A complete, compliant agreement tailored to your state and
                    your property.{" "}
                    <Link
                      href="/faq"
                      className="text-cyan-300 hover:underline underline-offset-2"
                    >
                      Learn how it works
                    </Link>
                    .
                  </>
                ),
              },
              {
                number: "3",
                title: "Download Instantly",
                desc: (
                  <>
                    PDF + DOCX versions ready to sign or upload to your
                    e-signature platform.{" "}
                    <Link
                      href="/generate-lease"
                      className="text-cyan-300 hover:underline underline-offset-2"
                    >
                      Create your lease
                    </Link>
                    .
                  </>
                ),
              },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="text-5xl font-extrabold bg-gradient-to-br from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                  {step.number}
                </div>
                <h3 className="text-2xl font-semibold mt-4">{step.title}</h3>
                <p className="text-gray-400 mt-3">{step.desc}</p>
              </div>
            ))}
          </div>

          <Link
            href="/generate-lease"
            className="inline-block mt-16 px-10 py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-lg font-semibold hover:opacity-90 shadow-xl shadow-purple-500/30"
          >
            Start Now
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 border-t border-white/10 text-center text-gray-400 bg-[#0A0F1F]">
        © {new Date().getFullYear()} AI Lease Builder — The fastest way to
        generate a compliant residential lease.
      </footer>
    </main>
  );
}

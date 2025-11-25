// app/about/page.tsx

import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white px-6 py-20">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
          About Us
        </h1>

        <p className="text-gray-300 text-lg leading-relaxed mb-8">
          AI Lease Builder was created from a simple but serious problem:
          <strong> no online service generated leases that were actually tailored to real properties or real state laws.</strong>
          Landlords were stuck with outdated templates, generic clauses, and documents that often failed to meet legal requirements.
        </p>

        <p className="text-gray-300 text-lg leading-relaxed mb-8">
          With modern AI, we saw the opportunity to build something better—a system that produces
          <strong> fully customized, state-compliant residential leases</strong> in minutes, not hours.
          Instead of reusing old forms, AI Lease Builder analyzes your inputs and creates a lease designed for <em>your</em> property,
          <em>your</em> rules, and <em>your</em> state’s housing regulations.
          {" "}
          <Link
            href="/generate-lease"
            className="text-cyan-300 hover:underline underline-offset-2"
          >
            Generate your first lease for free
          </Link>.
        </p>

        <p className="text-gray-300 text-lg leading-relaxed mb-8">
          Traditional templates are one-size-fits-nobody. Our generator produces
          <strong> lawyer-style language</strong>,
          embeds required disclosures, and structures the agreement the way a legal professional would—only faster, clearer, and more accessible.
        </p>

        <p className="text-gray-300 text-lg leading-relaxed mb-8">
          Our mission is simple: make high-quality, legally-structured residential leases accessible to everyone.
          Whether you manage one rental or dozens, you should have access to state-specific, attorney-grade documents without spending thousands on legal fees.
          {" "}
          <Link
            href="/pricing"
            className="text-cyan-300 hover:underline underline-offset-2"
          >
            See pricing options
          </Link>.
        </p>

        <p className="text-gray-400 text-sm mt-12 text-center">
          © {new Date().getFullYear()} AI Lease Builder – All rights reserved.
        </p>

      </div>
    </main>
  );
}

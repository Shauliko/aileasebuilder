import type { StateConfig } from "../stateConfigs";

type Props = {
  config: StateConfig;
};

export default function StateLeasePage({ config }: Props) {
  const { stateName, abbreviation, landlordTerm, tenantTerm, exampleCities } =
    config;

  const cities = exampleCities.join(", ");

  const title = `${stateName} Residential Lease Agreement – State-Specific, Lawyer-Grade Rental Contract`;
  const metaDescription = `Create a ${stateName} residential lease agreement that follows ${stateName} landlord–tenant law. Fully customized, lawyer-grade lease for rentals in ${cities} and throughout ${stateName}.`;

  return (
    <article className="space-y-10">
      {/* SEO TITLE */}
      <header className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold">
          {stateName} Residential Lease Agreement ({abbreviation}) – Complete
          Landlord & Tenant Guide
        </h1>
        <p className="text-gray-300 text-base md:text-lg">
          Generate a {stateName}-compliant, lawyer-grade residential lease in
          minutes. AI Lease Builder instantly applies {stateName} landlord–
          tenant rules so your rental contract is clear, enforceable, and ready
          to sign for properties in {cities} and across the state.
        </p>
        <p className="text-xs text-gray-500">
          SEO Title: {title}
          <br />
          Meta Description: {metaDescription}
        </p>
      </header>

      {/* SECTION: WHY STATE-SPECIFIC LEASES MATTER */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Why You Need a {stateName}-Specific Lease (Not a Generic Template)
        </h2>
        <p className="text-gray-300">
          Most “free lease templates” on the internet are generic, recycled
          documents that ignore {stateName} law. That might be fine—until
          there’s a dispute, the {tenantTerm} stops paying rent, or the{" "}
          {landlordTerm} needs to enforce a rule. At that moment, an
          out-of-state or poorly drafted lease becomes a liability.
        </p>
        <p className="text-gray-300">
          A proper {stateName} residential lease should be drafted around local
          statutes, court expectations, and practical realities in markets like{" "}
          {cities}. AI Lease Builder focuses on exactly that: state-specific,
          lawyer-style language tuned for real-world {landlordTerm}/{tenantTerm}{" "}
          relationships—not one-size-fits-all boilerplate.
        </p>
      </section>

      {/* SECTION: WHAT OUR {stateName} LEASE COVERS */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          What Your {stateName} Lease Agreement Covers
        </h2>
        <p className="text-gray-300">
          Your {stateName} lease isn’t just a “rent form.” It is the operating
          manual for the rental. AI Lease Builder walks you through each
          decision and converts it into clear written terms that reflect{" "}
          {stateName} law and standard practice.
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>
            <strong>Parties & Property:</strong> Clearly identifies the{" "}
            {landlordTerm}, {tenantTerm}(s), and rental property located in{" "}
            {stateName}, including unit details and parking/storage if needed.
          </li>
          <li>
            <strong>Rent Amount & Due Date:</strong> Sets the base rent, due
            date, allowable payment methods, and late-fee logic consistent with{" "}
            {stateName} expectations.
          </li>
          <li>
            <strong>Security Deposit Terms:</strong> Solid structure for deposit
            handling, permissible deductions, and return timelines under{" "}
            {stateName} norms.
          </li>
          <li>
            <strong>Term & Renewal:</strong> Fixed-term, month-to-month, or
            custom structure with clear rules on renewals and rate increases.
          </li>
          <li>
            <strong>Utilities & Services:</strong> Who pays what, how shared
            utilities are handled, and what happens if services are interrupted.
          </li>
          <li>
            <strong>Use of Property & Occupancy:</strong> Limits on occupants,
            guests, business use, short-term rentals, and illegal activity.
          </li>
          <li>
            <strong>Maintenance & Repairs:</strong> Allocation of responsibility
            between {landlordTerm} and {tenantTerm} with clear reporting
            procedures.
          </li>
          <li>
            <strong>Rules & Addendums:</strong> Pet rules, smoking policy,
            parking rules, HOA rules, and addendums for things like pools,
            storage, or shared spaces.
          </li>
          <li>
            <strong>Default & Remedies:</strong> What happens if rent is late,
            rules are violated, or the {tenantTerm} stops paying entirely.
          </li>
        </ul>
      </section>

      {/* SECTION: DEPOSITS, FEES, AND MONEY TERMS */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Security Deposits, Late Fees, and Money Rules in {stateName}
        </h2>
        <p className="text-gray-300">
          One of the fastest ways a {landlordTerm} loses in court is by getting
          money rules wrong—especially security deposits and fees. AI Lease
          Builder structures the deposit and fee language so it matches common{" "}
          {stateName} practices, and it reminds you of issues that often trip up{" "}
          {landlordTerm}s and {tenantTerm}s.
        </p>
        <p className="text-gray-300">
          The goal is simple: your {stateName} lease should make it obvious when
          money is due, what happens if it isn’t paid, and how deposits are
          accounted for when the tenancy ends.
        </p>
      </section>

      {/* SECTION: INSPECTIONS, CONDITION, AND ENTRY RIGHTS */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Move-In Condition, Inspections, and Landlord Entry in {stateName}
        </h2>
        <p className="text-gray-300">
          Many disputes hinge on “who damaged what” and “who had the right to
          enter.” Your {stateName} lease generated by AI Lease Builder includes
          structured language around:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>Move-in and move-out inspection expectations.</li>
          <li>
            How existing damage or wear is documented at the start of the lease.
          </li>
          <li>
            When and how the {landlordTerm} may enter the property (with notice
            expectations consistent with {stateName} norms).
          </li>
          <li>
            How emergency situations are treated differently from routine
            maintenance.
          </li>
        </ul>
      </section>

      {/* SECTION: EVICTION AND DEFAULT BASICS */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Eviction and Default Basics in {stateName}
        </h2>
        <p className="text-gray-300">
          No one signs a lease hoping for an eviction. But a serious lease must
          make the path clear if the relationship breaks down. Your{" "}
          {stateName} lease includes:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>Nonpayment of rent handling and notice expectations.</li>
          <li>
            Material violations of the lease and opportunity to cure (if
            applicable).
          </li>
          <li>
            Language that supports a clean narrative if the matter ever reaches
            a {stateName} court.
          </li>
        </ul>
        <p className="text-gray-300">
          AI Lease Builder does not replace local legal counsel, but it gives{" "}
          {landlordTerm}s and {tenantTerm}s a professionally structured starting
          point that respects how {stateName} rentals actually operate.
        </p>
      </section>

      {/* SECTION: HOW AI LEASE BUILDER WORKS FOR {stateName} */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          How AI Lease Builder Generates Your {stateName} Lease
        </h2>
        <ol className="list-decimal list-inside text-gray-300 space-y-2">
          <li>
            <strong>Tell us about the property:</strong> Single-family home,
            apartment, condo, or other unit in {stateName}. You answer in plain
            language.
          </li>
          <li>
            <strong>Set your rules:</strong> Pets, smoking, parking, guest
            limits, late fees, and more. You decide the business terms; the AI
            turns them into contract language.
          </li>
          <li>
            <strong>AI builds the lease:</strong> The system generates a{" "}
            {stateName}-focused lease that translates your inputs into clear
            clauses using consistent formatting and structure.
          </li>
          <li>
            <strong>Download and sign:</strong> Export to PDF or Word, send for
            e-signature, or print and sign in person.
          </li>
        </ol>
        <p className="text-gray-300">
          The result: a lease that reads like a modern, lawyer-drafted document
          instead of a patched-together template.
        </p>
      </section>

      {/* SECTION: FAQ */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          {stateName} Lease Agreement – Frequently Asked Questions
        </h2>
        <div className="space-y-3 text-gray-300">
          <details className="bg-[#050816] border border-white/10 rounded-lg p-3">
            <summary className="font-semibold cursor-pointer">
              Do I really need a {stateName}-specific lease?
            </summary>
            <p className="mt-2 text-sm">
              Yes. {stateName} has its own landlord–tenant rules, expectations,
              and disclosure requirements. A generic lease pulled from another
              state can fail in court or leave important issues unclear. AI
              Lease Builder focuses your lease language on {stateName} rentals
              by default.
            </p>
          </details>

          <details className="bg-[#050816] border border-white/10 rounded-lg p-3">
            <summary className="font-semibold cursor-pointer">
              Can this replace a {stateName} real estate attorney?
            </summary>
            <p className="mt-2 text-sm">
              AI Lease Builder is designed to help {landlordTerm}s and{" "}
              {tenantTerm}s generate a clear, detailed, {stateName}-focused
              lease quickly. It does not replace personalized legal advice.
              Complex situations, multi-unit portfolios, or unusual terms should
              always be reviewed by a licensed {stateName} attorney.
            </p>
          </details>

          <details className="bg-[#050816] border border-white/10 rounded-lg p-3">
            <summary className="font-semibold cursor-pointer">
              Does this work for properties outside of {stateName}?
            </summary>
            <p className="mt-2 text-sm">
              This page is specifically focused on rental properties located in{" "}
              {stateName}. AI Lease Builder supports other states as well—each
              with its own state-specific logic and content—through separate
              pages in the system.
            </p>
          </details>

          <details className="bg-[#050816] border border-white/10 rounded-lg p-3">
            <summary className="font-semibold cursor-pointer">
              How fast can I generate my {stateName} lease?
            </summary>
            <p className="mt-2 text-sm">
              In most cases, {landlordTerm}s can answer the guided questions and
              generate a full {stateName} lease in under 10 minutes. You can
              then review, tweak any details, and download the final version.
            </p>
          </details>
        </div>
      </section>

      {/* SECTION: CTA */}
      <section className="space-y-3 border-t border-white/10 pt-6">
        <h2 className="text-2xl font-semibold">
          Generate Your {stateName} Residential Lease Now
        </h2>
        <p className="text-gray-300">
          Stop relying on generic templates that ignore {stateName} rules. AI
          Lease Builder helps you create a professional, state-specific lease
          that reflects how you actually want to manage your rental.
        </p>
        <a
          href="/generate-lease"
          className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-500 font-semibold text-white shadow-lg shadow-blue-500/40 mt-2"
        >
          Start Your {stateName} Lease
        </a>
      </section>
    </article>
  );
}

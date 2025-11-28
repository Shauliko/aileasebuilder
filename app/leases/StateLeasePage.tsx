import type { StateConfig } from "./stateConfigs";

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

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Why You Need a {stateName}-Specific Lease
        </h2>
        <p className="text-gray-300">
          Most “free lease templates” you find online are generic documents that
          ignore {stateName} law entirely. That might be fine—until a rent
          dispute, a rule violation, or a court hearing. At that point, an
          out-of-state lease becomes a legal disadvantage.
        </p>
        <p className="text-gray-300">
          AI Lease Builder generates a lease built around {stateName} statutes,
          expectations, and court-tested language. It gives both the{" "}
          {landlordTerm} and the {tenantTerm} a clear, enforceable agreement
          aligned with how real rentals work in {stateName}.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          What Your {stateName} Lease Agreement Covers
        </h2>
        <p className="text-gray-300">
          Your {stateName} lease is a complete framework for your rental—not a
          generic form. It includes:
        </p>

        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>Parties & property details</li>
          <li>Rent structure & due dates</li>
          <li>Security deposit terms compliant with {stateName} standards</li>
          <li>Utilities & services responsibilities</li>
          <li>Maintenance duties for both {landlordTerm} and {tenantTerm}</li>
          <li>Pet rules, smoking rules, guest limits</li>
          <li>Parking, storage, HOA requirements</li>
          <li>Violations, notices, and legal remedies</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Money Rules in {stateName}: Deposits, Fees & Rent
        </h2>
        <p className="text-gray-300">
          Financial terms are where many rental disputes start. Your lease
          clarifies:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>Security deposit limits and return rules</li>
          <li>Late fees, grace periods, and accepted payment methods</li>
          <li>Rent increases and renewal expectations</li>
          <li>How deductions are handled legally</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Move-In Condition, Inspections & Entry Rights
        </h2>
        <p className="text-gray-300">
          Move-in documentation and access rules are essential in{" "}
          {stateName} rentals. Your lease includes:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>Move-in inspection expectations</li>
          <li>How existing damage is recorded</li>
          <li>Landlord entry rights consistent with {stateName} norms</li>
          <li>Emergency vs. routine maintenance access</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Evictions & Default Rules in {stateName}
        </h2>
        <p className="text-gray-300">
          No lease is complete without clear rules for violations. Your{" "}
          {stateName} lease includes:
        </p>

        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>Nonpayment procedures</li>
          <li>Material lease violations</li>
          <li>Opportunity to cure (if applicable)</li>
          <li>Language designed to support clarity in court</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          How AI Lease Builder Generates a {stateName} Lease
        </h2>
        <ol className="list-decimal list-inside text-gray-300 space-y-2">
          <li>Tell us about the property & occupants</li>
          <li>Set your rules (pets, smoking, parking, etc.)</li>
          <li>The AI assembles a {stateName}-tuned lease</li>
          <li>Download, sign, or export instantly</li>
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          {stateName} Lease Agreement – FAQ
        </h2>

        <details className="bg-[#0a0f25] border border-white/10 rounded-lg p-3">
          <summary className="font-semibold cursor-pointer">
            Do I need a {stateName}-specific lease?
          </summary>
          <p className="mt-2 text-sm text-gray-300">
            Yes. {stateName} has its own rental laws, expectations, and
            disclosure rules. Generic documents do not hold up when disputes
            arise.
          </p>
        </details>

        <details className="bg-[#0a0f25] border border-white/10 rounded-lg p-3">
          <summary className="font-semibold cursor-pointer">
            Does this replace a lawyer?
          </summary>
          <p className="mt-2 text-sm text-gray-300">
            AI Lease Builder provides structured, lawyer-style language that
            aligns with {stateName} rules. For unusual situations or disputes,
            local legal advice is recommended.
          </p>
        </details>

        <details className="bg-[#0a0f25] border border-white/10 rounded-lg p-3">
          <summary className="font-semibold cursor-pointer">
            How fast can I create my lease?
          </summary>
          <p className="mt-2 text-sm text-gray-300">
            Most users generate a complete {stateName} lease in under 10
            minutes.
          </p>
        </details>
      </section>

      <section className="space-y-3 border-t border-white/10 pt-6">
        <h2 className="text-2xl font-semibold">
          Generate Your {stateName} Lease Now
        </h2>
        <p className="text-gray-300">
          Create a {stateName}-compliant residential lease in minutes—accurate,
          clear, and tailored to your rental.
        </p>
        <a
          href="/generate-lease"
          className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-500 font-semibold text-white shadow-lg shadow-blue-500/40 mt-2"
        >
          Create Your Lease
        </a>
      </section>
    </article>
  );
}

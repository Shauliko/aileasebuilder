import Image from "next/image";

export default function Home() {
  return (
    <div className="text-center mt-16">
      <h1 className="text-5xl font-bold text-gray-900">
        Generate Legally-Compliant Leases in Minutes
      </h1>
      <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
        AI Lease Builder instantly creates personalized, state-compliant residential lease agreements.
        No templates. No lawyers. No waiting.
      </p>

      <div className="mt-10">
        <a
          href="/generate-lease"
          className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition"
        >
          Generate Your Lease
        </a>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <h3 className="text-xl font-semibold">State Compliant</h3>
          <p className="text-gray-600 mt-3">AI tailors each lease to your state’s laws and requirements.</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold">Full Legal Language</h3>
          <p className="text-gray-600 mt-3">No shortcuts — your lease includes full-length legal clauses.</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold">Instant Download</h3>
          <p className="text-gray-600 mt-3">Receive your PDF and DOCX immediately after generation.</p>
        </div>
      </div>
    </div>
  );
}

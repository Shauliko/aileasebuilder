"use client";

import { FormEvent, useState } from "react";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS",
  "KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY",
  "NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV",
  "WI","WY"
];

export default function GenerateLeasePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    state: "",
    propertyType: "",
    rent: "",
    term: "",
    startDate: "",
    pets: "no",
    smoking: "no",
    lateFees: "no",
    deposit: "",
    extraClauses: ""
  });

  const updateField = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.state || !form.rent || !form.term || !form.startDate) {
      setError("Please fill in state, rent, lease duration, and start date.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/generate-lease", {
        method: "POST",
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        throw new Error("Server error while generating lease.");
      }

      const data = await res.json();
      localStorage.setItem("lease-result", JSON.stringify(data));
      window.location.href = "/download";
    } catch (err) {
      console.error(err);
      setError("Error generating lease. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative -mx-6 -mt-10 min-h-[calc(100vh-4rem)] bg-[#050816] text-white">
      {/* Glow background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-10 h-64 w-64 rounded-full bg-blue-600/30 blur-3xl" />
        <div className="absolute top-10 right-[-6rem] h-72 w-72 rounded-full bg-purple-500/25 blur-3xl" />
        <div className="absolute bottom-[-6rem] left-1/3 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 pt-16 pb-24">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold">
            Generate Your Lease Agreement
          </h1>
          <p className="mt-3 text-gray-300 max-w-2xl mx-auto">
            Fill in your property details once. AI Lease Builder will generate a
            full, state-specific residential lease ready for signing.
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-[#090d1f]/95 shadow-2xl shadow-blue-900/40 p-6 md:p-8 space-y-10"
        >
          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {/* Section 1: Property Info */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-white">
              Property Information
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              {/* State */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  State <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#050816] px-3 py-3 text-sm text-gray-100 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                >
                  <option value="">Select a state</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Property Type */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Property Type
                </label>
                <input
                  value={form.propertyType}
                  onChange={(e) => updateField("propertyType", e.target.value)}
                  placeholder="Apartment, House, Condo..."
                  className="w-full rounded-lg border border-white/15 bg-[#050816] px-3 py-3 text-sm text-gray-100 placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Lease Terms */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-white">
              Lease Terms
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Rent */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Monthly Rent ($) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={form.rent}
                  onChange={(e) => updateField("rent", e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#050816] px-3 py-3 text-sm text-gray-100 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Lease Duration (months){" "}
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={form.term}
                  onChange={(e) => updateField("term", e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#050816] px-3 py-3 text-sm text-gray-100 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>
            </div>

            {/* Start Date */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Lease Start Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#050816] px-3 py-3 text-sm text-gray-100 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>
          </section>

          {/* Section 3: Policies */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-white">
              Rules & Policies
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Pets */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Pets Allowed?
                </label>
                <select
                  value={form.pets}
                  onChange={(e) => updateField("pets", e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#050816] px-3 py-3 text-sm text-gray-100 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>

              {/* Smoking */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Smoking Allowed?
                </label>
                <select
                  value={form.smoking}
                  onChange={(e) => updateField("smoking", e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#050816] px-3 py-3 text-sm text-gray-100 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>

              {/* Late Fees */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Late Fees?
                </label>
                <select
                  value={form.lateFees}
                  onChange={(e) => updateField("lateFees", e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#050816] px-3 py-3 text-sm text-gray-100 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </div>

            {/* Deposit */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Security Deposit ($)
              </label>
              <input
                type="number"
                value={form.deposit}
                onChange={(e) => updateField("deposit", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#050816] px-3 py-3 text-sm text-gray-100 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>
          </section>

          {/* Section 4: Additional Clauses */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-white">
              Additional Clauses (optional)
            </h2>
            <textarea
              value={form.extraClauses}
              onChange={(e) => updateField("extraClauses", e.target.value)}
              placeholder="Any specific terms, obligations, or restrictions you want the lease to include."
              className="w-full rounded-lg border border-white/15 bg-[#050816] px-3 py-3 text-sm text-gray-100 min-h-[96px] placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
          </section>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl text-sm md:text-base font-semibold shadow-lg transition ${
                loading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-500 hover:opacity-90 shadow-blue-500/40"
              }`}
            >
              {loading ? "Generating your lease..." : "Generate Lease"}
            </button>
            <p className="mt-3 text-xs text-center text-gray-400">
              Your lease will be generated as a multi-page agreement with PDF & DOCX ready to
              download.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

export default function GenerateLeasePage() {
  const [loading, setLoading] = useState(false);

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

  const updateField = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/generate-lease", {
        method: "POST",
        body: JSON.stringify(form)
      });

      const data = await res.json();
      localStorage.setItem("lease-result", JSON.stringify(data));
      window.location.href = "/download";
    } catch (err) {
      alert("Error generating lease");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* HEADER */}
      <div className="text-center mb-12 mt-10">
        <h1 className="text-4xl font-bold text-gray-900">
          Generate Your Lease Agreement
        </h1>
        <p className="text-gray-600 mt-4 text-lg">
          Enter your property details and create a fully compliant lease in minutes.
        </p>
      </div>

      {/* CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 space-y-10">

        {/* SECTION 1 — BASIC INFO */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Property Information
          </h2>

          <div className="space-y-6">

            {/* State */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                State
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-600"
                onChange={(e) => updateField("state", e.target.value)}
              >
                <option value="">Select a state</option>
                {[
                  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS",
                  "KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY",
                  "NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV",
                  "WI","WY"
                ].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Property Type
              </label>
              <input
                placeholder="Apartment, House, Condo..."
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-600"
                onChange={(e) => updateField("propertyType", e.target.value)}
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* SECTION 2 — LEASE TERMS */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Lease Terms
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Rent */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Monthly Rent ($)
              </label>
              <input
                type="number"
                className="w-full border rounded-lg p-3 border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-600"
                onChange={(e) => updateField("rent", e.target.value)}
              />
            </div>

            {/* Lease Term */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Lease Duration (months)
              </label>
              <input
                type="number"
                className="w-full border rounded-lg p-3 border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-600"
                onChange={(e) => updateField("term", e.target.value)}
              />
            </div>
          </div>

          {/* Start Date */}
          <div className="mt-6">
            <label className="block text-gray-700 font-medium mb-1">
              Start Date
            </label>
            <input
              type="date"
              className="w-full border rounded-lg p-3 border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-600"
              onChange={(e) => updateField("startDate", e.target.value)}
            />
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* SECTION 3 — POLICIES */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Rules & Policies
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pets */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Pets Allowed?
              </label>
              <select
                className="w-full border rounded-lg p-3 border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-600"
                onChange={(e) => updateField("pets", e.target.value)}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            {/* Smoking */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Smoking Allowed?
              </label>
              <select
                className="w-full border rounded-lg p-3 border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-600"
                onChange={(e) => updateField("smoking", e.target.value)}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            {/* Late Fees */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Late Fees?
              </label>
              <select
                className="w-full border rounded-lg p-3 border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-600"
                onChange={(e) => updateField("lateFees", e.target.value)}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          </div>

          {/* Deposit */}
          <div className="mt-6">
            <label className="block text-gray-700 font-medium mb-1">
              Security Deposit ($)
            </label>
            <input
              type="number"
              className="w-full border rounded-lg p-3 border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-600"
              onChange={(e) => updateField("deposit", e.target.value)}
            />
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* SECTION 4 — EXTRA CLAUSES */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Additional Clauses (optional)
          </h2>
          <textarea
            placeholder="Any extra terms or specific instructions..."
            className="w-full border rounded-lg p-4 h-28 border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-600"
            onChange={(e) => updateField("extraClauses", e.target.value)}
          />
        </div>

        {/* SUBMIT BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-4 text-lg font-semibold rounded-xl text-white transition-all ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow-sm"
          }`}
        >
          {loading ? "Generating Lease..." : "Generate Lease"}
        </button>

        <p className="text-center text-gray-500 text-sm mt-2">
          Your files will be ready instantly (PDF + DOCX)
        </p>
      </div>
    </div>
  );
}

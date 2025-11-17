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

  function updateField(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setLoading(true);

    try {
      const res = await fetch("/api/generate-lease", {
        method: "POST",
        body: JSON.stringify(form)
      });

      const data = await res.json();
      console.log("AI RESPONSE:", data);

      alert("Lease generated! Check console output.");
    } catch (e) {
      console.error(e);
      alert("Error generating lease");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-2xl mx-auto py-16 px-6">
        <h1 className="text-4xl font-semibold text-blue-600 mb-8">
          AI Lease Builder
        </h1>

        <div className="space-y-6">
          {/* State */}
          <div>
            <label className="block mb-2 text-sm font-medium">State</label>
            <select
              className="border rounded-md w-full p-3"
              onChange={(e) => updateField("state", e.target.value)}
            >
              <option value="">Select a state</option>
              {[
                "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
                "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
                "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
                "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
                "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
              ].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label className="block mb-2 text-sm font-medium">Property Type</label>
            <input
              className="border rounded-md w-full p-3"
              placeholder="Apartment, House, Condo..."
              onChange={(e) => updateField("propertyType", e.target.value)}
            />
          </div>

          {/* Rent + Term */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Rent ($)</label>
              <input
                className="border rounded-md w-full p-3"
                type="number"
                onChange={(e) => updateField("rent", e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Term (months)</label>
              <input
                className="border rounded-md w-full p-3"
                type="number"
                onChange={(e) => updateField("term", e.target.value)}
              />
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block mb-2 text-sm font-medium">Lease Start Date</label>
            <input
              type="date"
              className="border rounded-md w-full p-3"
              onChange={(e) => updateField("startDate", e.target.value)}
            />
          </div>

          {/* Pets / Smoking / Late Fees */}
          <div className="grid grid-cols-3 gap-4">
            {/* Pets */}
            <div>
              <label className="block mb-2 text-sm font-medium">Pets Allowed?</label>
              <select
                className="border rounded-md w-full p-3"
                onChange={(e) => updateField("pets", e.target.value)}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            {/* Smoking */}
            <div>
              <label className="block mb-2 text-sm font-medium">Smoking?</label>
              <select
                className="border rounded-md w-full p-3"
                onChange={(e) => updateField("smoking", e.target.value)}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            {/* Late Fees */}
            <div>
              <label className="block mb-2 text-sm font-medium">Late Fees?</label>
              <select
                className="border rounded-md w-full p-3"
                onChange={(e) => updateField("lateFees", e.target.value)}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          </div>

          {/* Deposit */}
          <div>
            <label className="block mb-2 text-sm font-medium">Security Deposit ($)</label>
            <input
              className="border rounded-md w-full p-3"
              type="number"
              onChange={(e) => updateField("deposit", e.target.value)}
            />
          </div>

          {/* Extra Clauses */}
          <div>
            <label className="block mb-2 text-sm font-medium">Additional Clauses (optional)</label>
            <textarea
              className="border rounded-md w-full p-3 h-24"
              onChange={(e) => updateField("extraClauses", e.target.value)}
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white rounded-md px-6 py-3 w-full text-lg hover:bg-blue-700"
          >
            {loading ? "Generating..." : "Generate Lease"}
          </button>
        </div>
      </div>
    </div>
  );
}

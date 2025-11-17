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
      localStorage.setItem("lease-result", JSON.stringify(data));
      window.location.href = "/download";

    } catch (e) {
      console.error(e);
      alert("Error generating lease");
    }

    setLoading(false);
  }

  return (
    <div className="flex justify-center">
      <div className="bg-white shadow-lg rounded-xl p-10 w-full max-w-2xl border border-gray-200">
        
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Generate Your Lease
        </h1>
        <p className="text-gray-600 text-center mb-10">
          Fill in the details below and let AI create a complete,
          state-compliant residential lease agreement for you.
        </p>

        <div className="space-y-6">

          {/* State */}
          <div>
            <label className="block mb-2 font-medium">State</label>
            <select
              className="border rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500"
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
            <label className="block mb-2 font-medium">Property Type</label>
            <input
              className="border rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500"
              placeholder="Apartment, House, Condo..."
              onChange={(e) => updateField("propertyType", e.target.value)}
            />
          </div>

          {/* Rent + Term */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium">Rent ($)</label>
              <input
                className="border rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500"
                type="number"
                onChange={(e) => updateField("rent", e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Lease Term (months)</label>
              <input
                className="border rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500"
                type="number"
                onChange={(e) => updateField("term", e.target.value)}
              />
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block mb-2 font-medium">Lease Start Date</label>
            <input
              type="date"
              className="border rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500"
              onChange={(e) => updateField("startDate", e.target.value)}
            />
          </div>

          {/* Pets / Smoking / Late Fees */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div>
              <label className="block mb-2 font-medium">Pets Allowed?</label>
              <select
                className="border rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500"
                onChange={(e) => updateField("pets", e.target.value)}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Smoking Allowed?</label>
              <select
                className="border rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500"
                onChange={(e) => updateField("smoking", e.target.value)}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Late Fees?</label>
              <select
                className="border rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500"
                onChange={(e) => updateField("lateFees", e.target.value)}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

          </div>

          {/* Deposit */}
          <div>
            <label className="block mb-2 font-medium">Security Deposit ($)</label>
            <input
              className="border rounded-lg w-full p-3 focus:ring-2 focus:ring-blue-500"
              type="number"
              onChange={(e) => updateField("deposit", e.target.value)}
            />
          </div>

          {/* Extra Clauses */}
          <div>
            <label className="block mb-2 font-medium">Additional Clauses (optional)</label>
            <textarea
              className="border rounded-lg w-full p-3 h-24 focus:ring-2 focus:ring-blue-500"
              placeholder="Any extra terms or special conditions..."
              onChange={(e) => updateField("extraClauses", e.target.value)}
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-4 text-lg font-medium text-white rounded-lg transition ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Generating Lease..." : "Generate Lease"}
          </button>
        </div>

      </div>
    </div>
  );
}

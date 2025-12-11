// app/admin/(protected)/dashboard/page.tsx
"use client";

import { useState } from "react";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const adminEmail =
    process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    process.env.NEXT_PUBLIC_PRIVILEGED_EMAIL ||
    ""; // fallback if needed

  async function generateTestLease() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/generate-lease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail,
          state: "CA",
          rent: "2000",
          term: "12",
          startDate: "2025-01-01",
          propertyAddress: "123 Test St",
          city: "Los Angeles",
          zip: "90001",
          bedrooms: "2",
          bathrooms: "1",
          landlordName: "Admin Tester",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Lease generation failed.");
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>

      <button
        onClick={generateTestLease}
        disabled={loading}
        className="px-6 py-3 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold"
      >
        {loading ? "Generating..." : "Generate Lease (Admin Mode)"}
      </button>

      {error && (
        <p className="text-red-500 mt-4 text-sm">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-6 p-4 bg-black/20 rounded border border-white/20">
          <h3 className="text-lg mb-2 font-semibold">Lease Generated:</h3>
          <a
            href={`data:application/pdf;base64,${result.pdf_base64}`}
            download="admin-lease.pdf"
            className="text-cyan-400 underline"
          >
            Download PDF
          </a>
        </div>
      )}
    </div>
  );
}

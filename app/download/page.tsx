"use client";

import { useEffect, useState } from "react";

export default function DownloadPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const json = localStorage.getItem("lease-result");
    if (json) {
      setData(JSON.parse(json));
    }
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050816] text-white px-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Lease Found</h2>
          <p className="text-gray-400 mt-2">
            Please generate a lease first.
          </p>

          <a
            href="/generate-lease"
            className="inline-block mt-6 px-6 py-3 rounded-xl bg-gradient-to-r 
            from-blue-600 via-cyan-500 to-purple-500 text-white font-semibold shadow-lg"
          >
            Generate Lease
          </a>
        </div>
      </div>
    );
  }

  const downloadBase64 = (base64: string, filename: string, mime: string) => {
    const link = document.createElement("a");
    link.href = `data:${mime};base64,${base64}`;
    link.download = filename;
    link.click();
  };

  return (
    <div className="relative min-h-screen bg-[#050816] text-white px-6 py-10">
      {/* Glowing Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-20 h-60 w-60 bg-purple-600/30 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-10 h-72 w-72 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-1/2 h-64 w-64 bg-cyan-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold">Your Lease Is Ready</h1>
          <p className="text-gray-300 mt-2">
            Download your fully generated, state-compliant lease agreement.
          </p>
        </div>

        {/* Preview */}
        <div className="rounded-2xl border border-white/10 bg-[#0c1127]/90 shadow-xl p-6 md:p-8 mb-10">
          <h2 className="text-lg font-semibold text-white mb-4">Lease Preview</h2>

          <div
            className="prose prose-invert max-w-none bg-[#0a0f24] border border-white/10 p-5 rounded-xl overflow-auto max-h-[440px] text-gray-100"
            dangerouslySetInnerHTML={{ __html: data.lease_html || "<p>No preview available.</p>" }}
          />
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          {/* PDF */}
          <button
            onClick={() =>
              downloadBase64(
                data.lease_pdf_base64,
                "lease-agreement.pdf",
                "application/pdf"
              )
            }
            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-500 
                       font-semibold shadow-lg shadow-blue-900/40 hover:opacity-90 transition"
          >
            Download PDF
          </button>

          {/* DOCX */}
          <button
            onClick={() =>
              downloadBase64(
                data.lease_docx_base64,
                "lease-agreement.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              )
            }
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 
                       font-semibold shadow-lg shadow-purple-900/40 hover:opacity-90 transition"
          >
            Download DOCX
          </button>

          {/* secondary actions */}
          <div className="flex items-center justify-between text-sm text-gray-400 pt-4">
            <a href="/generate-lease" className="hover:text-white transition">
              ← Edit Details
            </a>
            <a href="/" className="hover:text-white transition">
              Return to Home →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

export default function DownloadPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("lease-result");
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, []);

  if (!data) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-3xl font-bold">No lease data found.</h1>
        <p>Please go back and generate a lease.</p>
      </div>
    );
  }

  function downloadBase64File(base64: string, filename: string, mime: string) {
    const link = document.createElement("a");
    link.href = `data:${mime};base64,${base64}`;
    link.download = filename;
    link.click();
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-blue-600 mb-6">Your Lease Is Ready</h1>

      {/* Preview */}
      <div className="border p-4 rounded bg-gray-50 mb-8 max-h-[400px] overflow-auto">
       {data.lease_html?.trim() ? (
        <div dangerouslySetInnerHTML={{ __html: data.lease_html }} />
       ) : (
         <p className="text-gray-500 italic">No preview available — lease_html is empty.</p>
       )}
      </div>

      <pre className="bg-gray-100 p-4 text-sm overflow-auto mt-4">
        {data.lease_markdown || "⚠️ No markdown returned from AI."}
      </pre>

      {/* Download Buttons */}
      <div className="space-y-4">
        <button
          className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg text-lg"
          onClick={() =>
            downloadBase64File(
              data.lease_pdf_base64,
              "lease-agreement.pdf",
              "application/pdf"
            )
          }
        >
          Download PDF
        </button>

        <button
          className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg text-lg"
          onClick={() =>
            downloadBase64File(
              data.lease_docx_base64,
              "lease-agreement.docx",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            )
          }
        >
          Download DOCX
        </button>
      </div>
    </div>
  );
}

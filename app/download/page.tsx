"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

type LeaseResult = {
  success?: boolean;
  userEmail?: string | null;
  isPrivilegedUser?: boolean;
  planType?: string;
  languages?: string[];
  lease_markdown?: string;
  lease_html?: string;
  checklist_markdown?: string;
  translated?: any[];
  lease_pdf_base64?: string | null;
  lease_docx_base64?: string | null;
};

function base64ToBlob(base64: string, mime: string): Blob {
  const byteChars = typeof atob === "function" ? atob(base64) : "";
  const byteNumbers = new Array(byteChars.length);

  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mime });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function DownloadLeasePage() {
  const router = useRouter();
  const [leaseData, setLeaseData] = useState<LeaseResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Download Your Residential Lease",
    url: "https://aileasebuilder.com/download",
    description:
      "Download your generated residential lease in PDF, DOCX, HTML, or Markdown format. Includes a printable tenant checklist.",
  };

  useEffect(() => {
    try {
      const stored =
        typeof window !== "undefined"
          ? sessionStorage.getItem("lease-result") ??
            localStorage.getItem("lease-result")
          : null;

      if (!stored) {
        setError("No lease found. Please generate a lease first.");
        setLoading(false);
        return;
      }

      const parsed: LeaseResult = JSON.parse(stored);

      if (!parsed || !parsed.lease_markdown) {
        setError("Saved lease is incomplete. Please generate a new lease.");
        setLoading(false);
        return;
      }

      setLeaseData(parsed);
      setLoading(false);
    } catch (err) {
      console.error("Failed to read lease from storage:", err);
      setError("Could not load saved lease. Please generate a new lease.");
      setLoading(false);
    }
  }, []);

  const handleDownloadPdf = () => {
    if (!leaseData?.lease_pdf_base64) {
      alert("PDF file is not available. Please regenerate the lease.");
      return;
    }
    const blob = base64ToBlob(leaseData.lease_pdf_base64, "application/pdf");
    triggerDownload(blob, "Residential-Lease.pdf");
  };

  const handleDownloadDocx = () => {
    if (!leaseData?.lease_docx_base64) {
      alert("DOCX file is not available. Please regenerate the lease.");
      return;
    }
    const blob = base64ToBlob(
      leaseData.lease_docx_base64,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    triggerDownload(blob, "Residential-Lease.docx");
  };

  const handleDownloadHtml = () => {
    if (!leaseData?.lease_html) {
      alert("HTML content is not available.");
      return;
    }
    const blob = new Blob([leaseData.lease_html], {
      type: "text/html;charset=utf-8",
    });
    triggerDownload(blob, "Residential-Lease.html");
  };

  const handleDownloadMarkdown = () => {
    if (!leaseData?.lease_markdown) {
      alert("Markdown content is not available.");
      return;
    }
    const blob = new Blob([leaseData.lease_markdown], {
      type: "text/markdown;charset=utf-8",
    });
    triggerDownload(blob, "Residential-Lease.md");
  };

  const handleDownloadChecklistMarkdown = () => {
    if (!leaseData?.checklist_markdown) {
      alert("Checklist markdown is not available.");
      return;
    }
    const blob = new Blob([leaseData.checklist_markdown], {
      type: "text/markdown;charset=utf-8",
    });
    triggerDownload(blob, "Tenant-Checklist.md");
  };

  const handleOpenChecklistPdfView = () => {
    if (!leaseData?.checklist_markdown) {
      alert("Checklist content is not available.");
      return;
    }

    const win = window.open("", "_blank");
    if (!win) return;

    const checklistHtml =
      "<html><head><title>Tenant Checklist</title></head><body>" +
      `<pre style='white-space:pre-wrap;font-family:system-ui'>${leaseData.checklist_markdown}</pre>` +
      "<script>window.onload = function() { window.print(); }</script>" +
      "</body></html>";

    win.document.open();
    win.document.write(checklistHtml);
    win.document.close();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] max-w-3xl mx-auto px-4 py-20 text-gray-300">
        <Script
          id="download-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        <h1 className="text-3xl font-bold mb-4 text-white">
          Preparing your lease…
        </h1>
        <p className="text-gray-400">Please wait a moment.</p>
      </main>
    );
  }

  if (error || !leaseData) {
    return (
      <main className="min-h-screen bg-[#020617] max-w-3xl mx-auto px-4 py-20 text-gray-300">
        <Script
          id="download-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        <div className="bg-[#111827] border border-white/10 rounded-xl p-8 shadow-xl backdrop-blur">
          <h1 className="text-3xl font-bold mb-4 text-white">No Lease Found</h1>
          <p className="text-red-400 mb-6">
            {error || "Please generate a lease before visiting this page."}
          </p>
          <button
            onClick={() => router.push("/generate-lease")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 rounded-md text-white font-semibold hover:opacity-90"
          >
            Go to Generate Lease
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] max-w-4xl mx-auto px-4 py-16 text-gray-300">
      <Script
        id="download-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="bg-[#111827] border border-white/10 rounded-xl p-10 shadow-xl backdrop-blur">

        <h1 className="text-4xl font-bold text-white mb-3">Your Lease Is Ready</h1>

        <p className="text-gray-400 mb-3">
          Your residential lease has been generated successfully.
        </p>

        {/* ✅ INTERNAL LINK ADDED */}
        <p className="text-gray-400 mb-10">
          Need another lease?{" "}
          <a
            href="/generate-lease"
            className="text-cyan-300 hover:underline underline-offset-2"
          >
            Generate a new one
          </a>.
        </p>

        {/* Downloads Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Lease Downloads
          </h2>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleDownloadPdf}
              className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-md text-white font-semibold hover:opacity-90"
            >
              Download Lease (PDF)
            </button>

            <button
              onClick={handleDownloadDocx}
              className="bg-white/10 px-4 py-2 rounded-md text-gray-200 border border-white/10 hover:bg-white/20"
            >
              Download Lease (DOCX)
            </button>

            <button
              onClick={handleDownloadHtml}
              className="bg-white/10 px-4 py-2 rounded-md text-gray-200 border border-white/10 hover:bg-white/20"
            >
              Download Lease (HTML)
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="bg-white/10 px-4 py-2 rounded-md text-gray-200 border border-white/10 hover:bg-white/20"
            >
              Download Lease (Markdown)
            </button>
          </div>
        </section>

      {/* ====================================================== */}
      {/* TRANSLATED LEASES (NEW) */}
      {/* ====================================================== */}
      {leaseData?.translated && leaseData.translated.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Translated Leases
          </h2>

          <p className="text-gray-400 mb-6">
            You selected additional languages. Download each translated lease below.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {leaseData.translated.map((t, idx) => (
              <div
                key={idx}
                className="bg-[#0B0F19] border border-white/10 rounded-lg p-5"
              >
                <h3 className="text-lg font-semibold text-white mb-2">
                  {t.language}
                </h3>
                <p className="text-gray-400 mb-4 text-sm">
                  Fully translated version of your state-compliant lease.
                </p>

                <div className="flex flex-wrap gap-3">
                  {/* PDF only shown when available */}
                  {t.pdf_base64 && (
                    <button
                      onClick={() => {
                        const blob = base64ToBlob(
                          t.pdf_base64,
                          "application/pdf"
                        );
                        triggerDownload(
                          blob,
                          `Residential-Lease-${t.language}.pdf`
                        );
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-md text-white font-semibold hover:opacity-90 text-sm"
                    >
                      Download PDF
                    </button>
                  )}

                  <button
                    onClick={() => {
                      const blob = base64ToBlob(
                        t.docx_base64,
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      );
                      triggerDownload(
                        blob,
                        `Residential-Lease-${t.language}.docx`
                      );
                    }}
                    className="bg-white/10 px-4 py-2 rounded-md text-gray-200 border border-white/10 hover:bg-white/20 text-sm"
                  >
                    Download Word (.docx)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}


        {/* Checklist Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-2">
            Tenant Checklist
          </h2>
          <p className="text-gray-400 mb-4">
            The move-in / execution checklist is available separately:
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleDownloadChecklistMarkdown}
              className="bg-white/10 px-4 py-2 rounded-md text-gray-200 border border-white/10 hover:bg-white/20"
            >
              Download Checklist (Markdown)
            </button>

            <button
              onClick={handleOpenChecklistPdfView}
              className="bg-white/10 px-4 py-2 rounded-md text-gray-200 border border-white/10 hover:bg-white/20"
            >
              Open Checklist as PDF (Print)
            </button>
          </div>
        </section>

        {/* Preview Section */}
        <section className="pt-6 border-t border-white/10">
          <h2 className="text-2xl font-semibold text-white mb-3">
            Quick Preview (Read-Only)
          </h2>
          <p className="text-gray-400 mb-4">
            This is a plain-text preview. Your downloaded PDF/DOCX will be the
            formatted version.
          </p>

          <div className="border border-white/10 bg-[#0B0F19] rounded-lg p-4 max-h-96 overflow-y-auto text-sm whitespace-pre-wrap font-mono shadow-inner">
            {leaseData.lease_markdown}
          </div>
        </section>
      </div>
    </main>
  );
}

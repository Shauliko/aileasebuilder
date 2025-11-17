"use client";

import { useEffect, useState } from "react";

type TranslatedLease = {
  language: string;
  markdown: string;
  html: string;
  pdf_base64: string;
  docx_base64: string;
};

type LeaseResult = {
  lease_html?: string;
  lease_markdown?: string;
  lease_pdf_base64?: string;
  lease_docx_base64?: string;
  checklist_markdown?: string;
  translated?: TranslatedLease[];
};

const languageLabels: Record<string, { en: string; native: string }> = {
  Spanish: { en: "Spanish", native: "Español" },
  French: { en: "French", native: "Français" },
  Portuguese: { en: "Portuguese", native: "Português" },
  "Chinese (Simplified)": { en: "Chinese", native: "中文" },
  Arabic: { en: "Arabic", native: "العربية" },
  Hindi: { en: "Hindi", native: "हिन्दी" }
};

function getLanguageLabel(lang: string): string {
  if (lang === "English") return "English (English)";
  const meta = languageLabels[lang];
  if (!meta) return lang;
  return `${meta.en} (${meta.native})`;
}

export default function DownloadPage() {
  const [data, setData] = useState<LeaseResult | null>(null);
  const [activeLang, setActiveLang] = useState<string>("English");
  const [openAccordion, setOpenAccordion] = useState<string | null>("English");

  useEffect(() => {
    const json = localStorage.getItem("lease-result");
    if (json) {
      const parsed: LeaseResult = JSON.parse(json);
      setData(parsed);
      setActiveLang("English");
      setOpenAccordion("English");
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

  const allLanguages: string[] = [
    "English",
    ...(data.translated?.map((t) => t.language) || [])
  ];

  const getHtmlForLanguage = (lang: string): string => {
    if (lang === "English") {
      return data.lease_html || "<p>No preview available.</p>";
    }
    const match = data.translated?.find((t) => t.language === lang);
    return match?.html || "<p>No preview available for this language.</p>";
  };

  const downloadBase64 = (base64: string, filename: string, mime: string) => {
    const link = document.createElement("a");
    link.href = `data:${mime};base64,${base64}`;
    link.download = filename;
    link.click();
  };

  const activeHtml = getHtmlForLanguage(activeLang);

  const accordionItems = [
    {
      id: "English",
      label: getLanguageLabel("English"),
      pdf_base64: data.lease_pdf_base64,
      docx_base64: data.lease_docx_base64,
      isTranslation: false
    },
    ...(data.translated || []).map((t) => ({
      id: t.language,
      label: getLanguageLabel(t.language),
      pdf_base64: t.pdf_base64,
      docx_base64: t.docx_base64,
      isTranslation: true
    }))
  ];

  return (
    <div className="relative min-h-screen bg-[#050816] text-white px-6 py-10">
      {/* Glowing Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-20 h-60 w-60 bg-purple-600/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 h-72 w-72 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/2 h-64 w-64 bg-cyan-400/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold">Your Lease Is Ready</h1>
          <p className="text-gray-300 mt-2">
            Preview your lease and download language-specific files.
          </p>
        </div>

        {/* Language Tabs for Preview */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-white/10 pb-3">
          {allLanguages.map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-4 py-1.5 text-sm rounded-full border transition ${
                activeLang === lang
                  ? "bg-white text-[#050816] border-white"
                  : "border-white/20 text-gray-300 hover:border-cyan-400 hover:text-white"
              }`}
            >
              {getLanguageLabel(lang)}
            </button>
          ))}
        </div>

        {/* Preview Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0c1127]/90 shadow-xl p-6 md:p-8 mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Lease Preview — {getLanguageLabel(activeLang)}
            </h2>
            {activeLang !== "English" && (
              <p className="text-xs text-gray-400">
                Translation generated by AI. Review before signing.
              </p>
            )}
          </div>

          <div
            className="prose prose-invert max-w-none bg-[#0a0f24] border border-white/10 p-5 rounded-xl overflow-auto max-h-[460px] text-gray-100 text-sm"
            dangerouslySetInnerHTML={{ __html: activeHtml }}
          />
        </div>

        {/* Accordion Downloads */}
        <div className="space-y-3">
          {accordionItems.map((item) => {
            const isOpen = openAccordion === item.id;
            const hasPdf = !!item.pdf_base64;
            const hasDocx = !!item.docx_base64;

            return (
              <div
                key={item.id}
                className="border border-white/10 rounded-xl bg-[#0c1127]/80 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenAccordion(isOpen ? null : item.id)
                  }
                  className="w-full flex items-center justify-between px-4 py-3 text-sm md:text-base"
                >
                  <div>
                    <div className="font-semibold">
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-400">
                      {item.isTranslation
                        ? "Translated lease files"
                        : "Original English lease files"}
                    </div>
                  </div>
                  <span className="text-gray-300">
                    {isOpen ? "▲" : "▼"}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 flex flex-col md:flex-row gap-3">
                    <button
                      onClick={() =>
                        hasPdf &&
                        downloadBase64(
                          item.pdf_base64!,
                          `${item.id.toLowerCase()}-lease.pdf`,
                          "application/pdf"
                        )
                      }
                      disabled={!hasPdf}
                      className={`flex-1 py-3 rounded-lg text-sm font-semibold shadow-md transition ${
                        hasPdf
                          ? "bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-500 shadow-blue-900/40 hover:opacity-90"
                          : "bg-gray-600 cursor-not-allowed"
                      }`}
                    >
                      Download PDF
                    </button>

                    <button
                      onClick={() =>
                        hasDocx &&
                        downloadBase64(
                          item.docx_base64!,
                          `${item.id.toLowerCase()}-lease.docx`,
                          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        )
                      }
                      disabled={!hasDocx}
                      className={`flex-1 py-3 rounded-lg text-sm font-semibold shadow-md transition ${
                        hasDocx
                          ? "bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 shadow-purple-900/40 hover:opacity-90"
                          : "bg-gray-600 cursor-not-allowed"
                      }`}
                    >
                      Download DOCX
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between text-sm text-gray-400 pt-6">
          <a href="/generate-lease" className="hover:text-white transition">
            ← Edit Details
          </a>
          <a href="/" className="hover:text-white transition">
            Return to Home →
          </a>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { trackEventClient } from "@/lib/analytics/posthog";
import Script from "next/script";

type LeaseResult = {
  success: boolean;
  userEmail: string | null;
  isPrivilegedUser: boolean;
  planType: string;
  languages: string[];

  lease_markdown: string;
  lease_html: string;
  checklist_markdown: string;
  lease_pdf_base64: string;
  lease_docx_base64: string;
  translated: {
    language: string;
    markdown: string;
    html: string;
    pdf_base64: string | null;
    docx_base64: string;
  }[];
};

type SessionData = {
  success: boolean;
  email: string | null;
  leaseData: any;
  planType?: string;
  languages?: string[];
};

function PaymentSuccessPageInner() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<
    "idle" | "loading" | "generating" | "done" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [lease, setLease] = useState<LeaseResult | null>(null);
  const [sessionMeta, setSessionMeta] = useState<SessionData | null>(null);

  // ---------------------------------------
  // UTIL: download helper
  // ---------------------------------------
  function downloadBase64File(
    base64: string,
    fileName: string,
    mimeType: string
  ) {
    try {
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error", err);
      alert("Could not download file. Please contact support.");
    }
  }

  // ---------------------------------------
  // MAIN EFFECT: Stripe → Generate Lease
  // ---------------------------------------
  useEffect(() => {
    async function run() {
      if (!sessionId) {
        setStatus("error");
        setError("Missing Stripe session ID. Please contact support.");
        return;
      }

      try {
        setStatus("loading");

        // 1) Get session metadata from our API
        const sessionRes = await fetch("/api/stripe/get-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        if (!sessionRes.ok) {
          const text = await sessionRes.text();
          console.error("get-session failed:", text);
          throw new Error("Could not retrieve payment session.");
        }

        const sessionJson: SessionData = await sessionRes.json();
        setSessionMeta(sessionJson);

        if (!sessionJson.success) {
          throw new Error(
            "Payment session not marked as success. Please contact support."
          );
        }

        // 2) Generate the lease using the stored leaseData
        const leaseBody = {
          ...(sessionJson.leaseData || {}),
          userEmail: sessionJson.email,
          planType: sessionJson.planType || "payg",
          languages: sessionJson.languages || [],
        };

        setStatus("generating");

        const leaseRes = await fetch("/api/generate-lease", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leaseBody),
        });

        if (!leaseRes.ok) {
          const text = await leaseRes.text();
          console.error("generate-lease failed:", text);
          throw new Error("Lease generation failed. Please contact support.");
        }

        const leaseJson: LeaseResult = await leaseRes.json();

        if (!leaseJson.success) {
          throw new Error(
            leaseJson as any as string ||
              "Lease generation failed. Please contact support."
          );
        }

        setLease(leaseJson);
        setStatus("done");
        
        // ---- GOOGLE ADS CONVERSION TRACKING ----
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'conversion', {
            'send_to': 'AW-17780439036/fLKoCK6vwNAbEPzvr55C',
            'transaction_id': sessionId || ''
          });
        }

        // ---- POSTHOG ANALYTICS (client) ----
        trackEventClient("payment_success_and_lease_generated", {
          amount: 8,
          email: sessionJson.email || "unknown",
          languages: leaseJson.languages,
          planType: leaseJson.planType,
          state: sessionJson.leaseData?.state,
          translatedCount: leaseJson.translated?.length || 0,
          timestamp: Date.now(),
        });
      } catch (err: any) {
        console.error("PaymentSuccess error:", err);
        setError(
          err?.message ||
            "Lease generation failed. Please contact support."
        );
        setStatus("error");
      }
    }

    run();
  }, [sessionId]);

  // ---------------------------------------
  // LAYOUT HELPERS
  // ---------------------------------------
  const isLoading = status === "loading" || status === "generating";

  // Main wrapper matches the new homepage tone
  return (
    <main className="min-h-screen bg-[#050816] text-gray-100 flex flex-col">
      {/* TOP BAR */}
      <header className="w-full border-b border-white/10 bg-[#050816]/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent"
          >
            AI Lease Builder
          </Link>

          <nav className="hidden sm:flex gap-6 text-sm text-gray-300">
            <Link href="/generate-lease" className="hover:text-white">
              Generate Lease
            </Link>
            <Link href="/pricing" className="hover:text-white">
              Pricing
            </Link>
            <Link href="/blog" className="hover:text-white">
              Blog
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
          </nav>
        </div>
      </header>

      {/* CONTENT */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl">
          {/* STATES */}
          {isLoading && (
            <div className="text-center space-y-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/40">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold">
                Generating your lease…
              </h1>
              <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
                We’ve received your payment and are now drafting your
                state-specific, lawyer-grade lease. This usually takes just a
                few seconds.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-6">
              <h1 className="text-2xl sm:text-3xl font-semibold text-red-400">
                Something went wrong
              </h1>
              <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
                {error ||
                  "Lease generation failed. Please contact support."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                <Link
                  href="/generate-lease"
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-sm font-medium text-black"
                >
                  Try Again
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-full border border-gray-600 text-sm font-medium text-gray-200 hover:border-gray-400"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          )}

          {status === "done" && lease && (
            console.log("DEBUG TRANSLATED:", lease.translated, "LANG:", lease.languages),
            <div className="space-y-8">
              {/* SUCCESS HERO */}
              <section className="text-center space-y-4">
                <div className="inline-flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300 px-3 py-1 text-xs font-medium">
                  Lease ready
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold">
                  Your lease is ready to download
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
                  We&apos;ve drafted your{" "}
                  <span className="font-medium text-gray-100">
                    state-compliant residential lease
                  </span>{" "}
                  based on the details you provided. Download it, review with
                  your tenant, and you&apos;re ready to sign.
                </p>
              </section>

              {/* PRIMARY DOWNLOAD CARD */}
              <section className="grid gap-6 md:grid-cols-[2fr,1.3fr]">
                <div className="bg-[#070C1A] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">
                        Main English Lease
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-400">
                        Lawyer-grade, state-compliant residential lease in
                        English.
                      </p>
                    </div>
                    <span className="hidden sm:inline-flex text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      Recommended
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() =>
                        downloadBase64File(
                          lease.lease_pdf_base64,
                          "lease-en.pdf",
                          "application/pdf"
                        )
                      }
                      className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-sm font-medium text-black"
                    >
                      Download PDF
                    </button>

                    <button
                      onClick={() =>
                        downloadBase64File(
                          lease.lease_docx_base64,
                          "lease-en.docx",
                          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        )
                      }
                      className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-gray-600 text-sm font-medium text-gray-200 hover:border-gray-400"
                    >
                      Download Word (.docx)
                    </button>
                  </div>

                  <div className="border-t border-white/10 pt-4 mt-2 text-xs sm:text-sm text-gray-400 text-left">
                    <p>
                      Need to tweak a clause? Open the Word file, adjust the
                      text, and you&apos;re done. The structure, headings, and
                      state-required language are all in place.
                    </p>
                  </div>
                </div>

                {/* SIDEBAR SUMMARY */}
                <aside className="bg-[#070C1A] border border-white/10 rounded-2xl p-5 sm:p-6 text-sm space-y-3">
                  <h3 className="font-semibold text-gray-100">
                    Order summary
                  </h3>

                  {sessionMeta?.leaseData && (
                    <dl className="space-y-2 text-gray-300 text-xs sm:text-sm">
                      {sessionMeta.leaseData.state && (
                        <div className="flex justify-between gap-3">
                          <dt className="text-gray-400">State</dt>
                          <dd className="font-medium">
                            {sessionMeta.leaseData.state}
                          </dd>
                        </div>
                      )}
                      {sessionMeta.leaseData.propertyType && (
                        <div className="flex justify-between gap-3">
                          <dt className="text-gray-400">Property type</dt>
                          <dd className="font-medium">
                            {sessionMeta.leaseData.propertyType}
                          </dd>
                        </div>
                      )}
                      {sessionMeta.leaseData.rent && (
                        <div className="flex justify-between gap-3">
                          <dt className="text-gray-400">Monthly rent</dt>
                          <dd className="font-medium">
                            ${sessionMeta.leaseData.rent}
                          </dd>
                        </div>
                      )}
                      {sessionMeta.leaseData.term && (
                        <div className="flex justify-between gap-3">
                          <dt className="text-gray-400">Term</dt>
                          <dd className="font-medium">
                            {sessionMeta.leaseData.term} months
                          </dd>
                        </div>
                      )}
                      {sessionMeta.email && (
                        <div className="flex justify-between gap-3">
                          <dt className="text-gray-400">Receipt sent to</dt>
                          <dd className="font-medium break-all">
                            {sessionMeta.email}
                          </dd>
                        </div>
                      )}
                    </dl>
                  )}

                  <div className="pt-2 text-xs text-gray-500">
                    A copy of your Stripe receipt will be sent to your email.
                  </div>
                </aside>
              </section>

              {/* TRANSLATIONS */}
              {lease.translated && lease.translated.length > 0 && (
                <section className="bg-[#070C1A] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="text-base sm:text-lg font-semibold">
                      Translated copies
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
                      These versions are for tenant clarity only. When in doubt,
                      the English lease should control in case of conflict.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {lease.translated.map((t) => (
                      <div
                        key={t.language}
                        className="border border-white/10 rounded-xl p-4 space-y-3 text-sm"
                      >
                        <div className="font-medium text-gray-100">
                          {t.language}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {t.pdf_base64 && (
                            <button
                              onClick={() =>
                                downloadBase64File(
                                  t.pdf_base64!,
                                  `lease-${t.language.toLowerCase()}.pdf`,
                                  "application/pdf"
                                )
                              }
                              className="px-3 py-1.5 rounded-full bg-cyan-500/90 hover:bg-cyan-400 text-xs font-medium text-black"
                            >
                              PDF
                            </button>
                          )}

                          <button
                            onClick={() =>
                              downloadBase64File(
                                t.docx_base64,
                                `lease-${t.language.toLowerCase()}.docx`,
                                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                              )
                            }
                            className="px-3 py-1.5 rounded-full border border-gray-600 text-xs font-medium text-gray-200 hover:border-gray-400"
                          >
                            Word (.docx)
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* CTA */}
              <section className="text-center pt-4">
                <p className="text-gray-400 text-sm sm:text-base mb-4">
                  Need another lease for a different unit or state?
                </p>
                <Link
                  href="/generate-lease"
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-sm font-medium text-black"
                >
                  Generate another lease
                </Link>
              </section>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="py-6 border-t border-white/10 text-center text-xs sm:text-sm text-gray-500 bg-[#050816]">
        © {new Date().getFullYear()} AI Lease Builder. All rights reserved.
      </footer>
    </main>
  );
}
    export default function PaymentSuccessPage() {
      return (
        <Suspense
          fallback={
            <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center">
              <p className="text-gray-300 text-sm">Loading payment details…</p>
            </div>
          }
        >
          <PaymentSuccessPageInner />
        </Suspense>
    );
  }
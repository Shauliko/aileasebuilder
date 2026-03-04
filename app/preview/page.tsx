"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type LeaseResult = {
  success?: boolean;
  lease_markdown?: string;
  lease_html?: string;
  checklist_markdown?: string;
  lease_pdf_base64?: string | null;
  lease_docx_base64?: string | null;
  translated?: any[];
};

// Split markdown into preview portion and locked portion.
// We show sections 1–5 (up to and including ## 5.) then lock the rest.
function splitMarkdown(md: string): { preview: string; locked: string } {
  const lines = md.split("\n");

  // Find the line index where ## 6. begins
  let splitIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^## 6\./.test(lines[i].trim())) {
      splitIndex = i;
      break;
    }
  }

  // Fallback: if no ## 6. found, split at 35% of lines
  if (splitIndex === -1) {
    splitIndex = Math.floor(lines.length * 0.35);
  }

  return {
    preview: lines.slice(0, splitIndex).join("\n"),
    locked: lines.slice(splitIndex).join("\n"),
  };
}

// Very simple markdown → readable text renderer for the preview area.
// Keeps headings, bullets, and paragraphs legible without a full md library.
function MarkdownDisplay({ md }: { md: string }) {
  const lines = md.split("\n");

  return (
    <div className="space-y-1 font-mono text-sm leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={i} className="h-2" />;
        }

        if (trimmed.startsWith("# ")) {
          return (
            <h1 key={i} className="text-lg font-bold text-white mt-4 mb-2">
              {trimmed.replace(/^# /, "")}
            </h1>
          );
        }

        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={i}
              className="text-base font-semibold text-cyan-300 mt-4 mb-1 border-b border-white/10 pb-1"
            >
              {trimmed.replace(/^## /, "")}
            </h2>
          );
        }

        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={i} className="flex gap-2 text-gray-300 pl-3">
              <span className="text-cyan-500 mt-0.5">•</span>
              <span>{trimmed.replace(/^[-*] /, "")}</span>
            </div>
          );
        }

        if (/^\d+\.\s/.test(trimmed)) {
          return (
            <div key={i} className="text-gray-300 pl-3">
              {trimmed}
            </div>
          );
        }

        return (
          <p key={i} className="text-gray-300">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

export default function PreviewPage() {
  const router = useRouter();

  const [leaseData, setLeaseData] = useState<LeaseResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ----------------------------
  // Load lease from sessionStorage
  // ----------------------------
  useEffect(() => {
    try {
      const stored =
        typeof window !== "undefined"
          ? sessionStorage.getItem("lease-result")
          : null;

      if (!stored) {
        setError("No lease found. Please generate a lease first.");
        setLoading(false);
        return;
      }

      const parsed: LeaseResult = JSON.parse(stored);

      if (!parsed?.lease_markdown) {
        setError("Lease data is incomplete. Please generate a new lease.");
        setLoading(false);
        return;
      }

      setLeaseData(parsed);
      setLoading(false);
    } catch (err) {
      console.error("Failed to read lease from sessionStorage:", err);
      setError("Could not load lease. Please generate a new lease.");
      setLoading(false);
    }
  }, []);

  // ----------------------------
  // Unlock: send to Stripe checkout
  // ----------------------------
  const handleUnlock = async () => {
    if (!leaseData) return;

    try {
      setCheckoutLoading(true);

      // Retrieve original form data stored alongside lease result
      const stored = sessionStorage.getItem("lease-result");
      const parsed = stored ? JSON.parse(stored) : {};

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaseData: parsed,
          email: parsed.userEmail || null,
          planType: "single",
          languages: [],
        }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }

      setError("Unable to start payment. Please try again.");
      setCheckoutLoading(false);
    } catch (err) {
      console.error("Checkout error:", err);
      setError("Unexpected error. Please try again.");
      setCheckoutLoading(false);
    }
  };

  // ----------------------------
  // Loading state
  // ----------------------------
  if (loading) {
    return (
      <main className="min-h-screen bg-[#050816] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/40">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          </div>
          <p className="text-gray-400 text-sm">Loading your lease preview…</p>
        </div>
      </main>
    );
  }

  // ----------------------------
  // Error state
  // ----------------------------
  if (error || !leaseData) {
    return (
      <main className="min-h-screen bg-[#050816] text-white flex items-center justify-center px-4">
        <div className="bg-[#0B0F19] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center space-y-4">
          <h1 className="text-xl font-semibold text-red-400">
            Something went wrong
          </h1>
          <p className="text-gray-400 text-sm">
            {error || "Please generate a lease before visiting this page."}
          </p>
          <button
            onClick={() => router.push("/generate-lease")}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold text-white"
          >
            Generate a Lease
          </button>
        </div>
      </main>
    );
  }

  const { preview, locked } = splitMarkdown(leaseData.lease_markdown!);

  // ----------------------------
  // Main render
  // ----------------------------
  return (
    <main className="min-h-screen bg-[#050816] text-white">

      {/* TOP BAR */}
      <header className="w-full border-b border-white/10 bg-[#050816]/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent"
          >
            AI Lease Builder
          </Link>

          <button
            onClick={handleUnlock}
            disabled={checkoutLoading}
            className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold shadow-lg shadow-blue-500/30 disabled:opacity-60"
          >
            {checkoutLoading ? "Redirecting…" : "Unlock Full Lease — $14.95"}
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">

        {/* PAGE HEADER */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
            ✓ Lease generated
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Your lease preview is ready
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl">
            Here are the first sections of your state-compliant lease. Unlock
            the full document to download the complete PDF and Word file.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* LEASE PREVIEW + PAYWALL */}
        <div className="bg-[#0B0F19] border border-white/10 rounded-2xl overflow-hidden">

          {/* VISIBLE PREVIEW */}
          <div className="p-6 sm:p-8">
            <MarkdownDisplay md={preview} />
          </div>

          {/* BLURRED LOCKED SECTION */}
          <div className="relative">

            {/* Blurred text */}
            <div
              className="p-6 sm:p-8 select-none pointer-events-none"
              style={{ filter: "blur(6px)", opacity: 0.45 }}
              aria-hidden="true"
            >
              <MarkdownDisplay md={locked} />
            </div>

            {/* Gradient fade from visible → blurred */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#0B0F19] to-transparent pointer-events-none" />

            {/* Paywall overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-[#050816]/90 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 mx-4 max-w-md w-full text-center space-y-4 shadow-2xl">

                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 mx-auto">
                  <svg
                    className="h-5 w-5 text-cyan-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>

                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-white">
                    Unlock your full lease
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Get the complete document — all sections, signatures, and
                    disclosures — ready to download as PDF and Word.
                  </p>
                </div>

                <ul className="text-left text-sm text-gray-300 space-y-2">
                  {[
                    "All 23 sections fully drafted",
                    "State-compliant disclosures included",
                    "Download as PDF + Word (.docx)",
                    "Move-in / move-out checklist included",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="text-cyan-400 text-xs">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleUnlock}
                  disabled={checkoutLoading}
                  className="w-full inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-500 text-sm font-semibold shadow-lg shadow-blue-500/40 disabled:opacity-60"
                >
                  {checkoutLoading
                    ? "Redirecting to payment…"
                    : "Unlock Full Lease — $14.95"}
                </button>

                <p className="text-xs text-gray-500">
                  One-time payment. No subscription. Instant download after
                  payment.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="text-center pt-2">
          <p className="text-gray-500 text-xs">
            Want to make changes first?{" "}
            <Link
              href="/generate-lease"
              className="text-cyan-400 hover:underline underline-offset-2"
            >
              Go back and regenerate
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Generating your lease…");

  useEffect(() => {
    if (!sessionId) return;

    const generateLease = async () => {
      try {
        // 1️⃣ Fetch checkout session from your backend
        const stripeRes = await fetch("/api/stripe/get-session", {
          method: "POST",
          body: JSON.stringify({ sessionId }),
        });

        const sessionData = await stripeRes.json();

        if (!sessionData.success) {
          setStatus("error");
          setMessage("Payment verified, but we could not read lease details.");
          return;
        }

        const leaseData = sessionData.leaseData;

        // 2️⃣ Call generate-lease API
        const genRes = await fetch("/api/generate-lease", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leaseData),
        });

        const genData = await genRes.json();

        if (genRes.ok) {
          // Store generated lease data temporarily in sessionStorage
          sessionStorage.setItem("generatedLease", JSON.stringify(genData));

          // 3️⃣ Redirect to download page
          router.push("/download");
        } else {
          setStatus("error");
          setMessage("Lease generation failed. Please contact support.");
        }

      } catch (error) {
        console.error(error);
        setStatus("error");
        setMessage("Unexpected issue generating your lease.");
      }
    };

    generateLease();
  }, [sessionId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050816] text-white px-6">
      <div className="text-center">
        {status === "loading" && (
          <>
            <h1 className="text-3xl font-bold mb-4">Payment Successful 🎉</h1>
            <p className="text-lg mb-8">{message}</p>

            {/* Loading animation */}
            <div className="flex justify-center">
              <div className="h-10 w-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-3xl font-bold text-red-400">Something went wrong</h1>
            <p className="text-lg mt-4">{message}</p>
            <button
              onClick={() => router.push("/generate-lease")}
              className="mt-8 px-6 py-3 bg-cyan-500 rounded-xl text-black font-semibold hover:bg-cyan-400 transition"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="text-white p-10">Loading…</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}

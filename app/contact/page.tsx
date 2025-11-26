"use client";

import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.target);
    const email = form.get("email");
    const message = form.get("message");

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, message, name: "Contact Form User" }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }

    setSent(true);
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white px-6 py-20">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>

        <p className="text-gray-300 text-lg mb-10">
          AI Lease Builder is the only online platform that generates a fully
          customized, state-compliant, lawyer-grade residential lease—tailored
          to your property, your rules, and your state’s housing regulations. If
          you have questions, need help, or want guidance, our team is here.
        </p>

        <div className="bg-[#0b1024] border border-white/10 rounded-2xl p-8 text-left">
          <p className="text-gray-300 mb-3">Email our support team:</p>

          <a
            href="mailto:support@aileasebuilder.com"
            className="text-cyan-300 hover:text-cyan-200 text-lg"
          >
            support@aileasebuilder.com
          </a>

          <p className="text-gray-400 text-sm mt-4">
            Support Hours: Monday–Friday  
            <br />
            Response Time: Within 1 business day
          </p>

          <p className="text-gray-300 text-sm mt-6">
            Need a lease right now?{" "}
            <Link
              href="/generate-lease"
              className="text-cyan-300 hover:underline underline-offset-2"
            >
              Start generating your lease
            </Link>.
          </p>

          {/* CONTACT FORM */}
          {!sent ? (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="block text-sm mb-1">Your Email</label>
                <input
                  type="email"
                  required
                  name="email"
                  className="w-full px-3 py-2 rounded-lg bg-[#050816] border border-white/15 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Message</label>
                <textarea
                  required
                  name="message"
                  className="w-full px-3 py-2 rounded-lg bg-[#050816] border border-white/15 text-sm h-32 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                ></textarea>
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-500 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/40 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          ) : (
            <p className="text-green-400 text-lg mt-8">
              ✅ Your message was sent successfully!
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

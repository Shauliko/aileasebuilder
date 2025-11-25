// app/contact/page.tsx

import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white px-6 py-20">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Contact Us
        </h1>

        <p className="text-gray-300 text-lg mb-10">
          AI Lease Builder is the only online platform that generates a fully customized, 
          state-compliant, lawyer-grade residential lease—tailored to your property, your 
          rules, and your state’s housing regulations. If you have questions, need help, 
          or want guidance using the generator, our team is here for you.
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

          {/* ✅ Internal link added */}
          <p className="text-gray-300 text-sm mt-6">
            Need a lease right now?{" "}
            <Link
              href="/generate-lease"
              className="text-cyan-300 hover:underline underline-offset-2"
            >
              Start generating your lease
            </Link>.
          </p>

          {/* Contact Form */}
          <form
            action="mailto:support@aileasebuilder.com"
            method="POST"
            encType="text/plain"
            className="mt-8 space-y-4"
          >
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

            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-500 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/40"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

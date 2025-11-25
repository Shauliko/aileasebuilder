// app/head.tsx

export default function Head() {
  return (
    <>
      <title>AI Lease Builder – Generate Legally-Compliant Leases in Seconds</title>

      <meta
        name="description"
        content="Generate a state-specific, lawyer-grade residential lease instantly. No templates — full AI automation tailored to your property and your state laws."
      />

      <link rel="canonical" href="https://aileasebuilder.com" />

      {/* Open Graph */}
      <meta property="og:title" content="AI Lease Builder – Generate Legally-Compliant Leases in Seconds" />
      <meta
        property="og:description"
        content="Generate a custom, state-compliant residential lease in minutes. Lawyer-grade clauses. Instant PDF & DOCX downloads."
      />
      <meta property="og:url" content="https://aileasebuilder.com" />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="/og-image.png" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="AI Lease Builder – Generate Legally-Compliant Leases in Seconds" />
      <meta
        name="twitter:description"
        content="The only AI that creates real, enforceable, state-specific lease agreements tailored to your property."
      />
      <meta name="twitter:image" content="/og-image.png" />
    </>
  );
}

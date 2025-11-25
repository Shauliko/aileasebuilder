// app/faq/head.tsx

export default function Head() {
  return (
    <>
      <title>FAQ – AI Lease Builder | Common Questions Answered</title>
      <meta
        name="description"
        content="Get answers to common questions about AI Lease Builder, pricing, legal considerations, data usage, and how AI-generated residential leases work."
      />
      <link rel="canonical" href="https://aileasebuilder.com/faq" />

      {/* Open Graph */}
      <meta property="og:title" content="FAQ – AI Lease Builder" />
      <meta
        property="og:description"
        content="Everything you need to know about AI Lease Builder, including pricing, legal details, and technical information."
      />
      <meta property="og:url" content="https://aileasebuilder.com/faq" />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="FAQ – AI Lease Builder" />
      <meta
        name="twitter:description"
        content="Answers to common questions about AI Lease Builder, pricing, legal info, and technical details."
      />
    </>
  );
}

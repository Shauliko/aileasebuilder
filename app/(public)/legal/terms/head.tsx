// app/(public)/legal/terms/head.tsx

export default function Head() {
  return (
    <>
      <title>Terms of Service – AI Lease Builder</title>

      <meta
        name="description"
        content="Review the Terms of Service for AI Lease Builder. Understand your rights and responsibilities when using our state-compliant residential lease generator."
      />

      <link rel="canonical" href="https://aileasebuilder.com/legal/terms" />

      {/* Open Graph */}
      <meta property="og:title" content="Terms of Service – AI Lease Builder" />
      <meta
        property="og:description"
        content="Read the Terms that govern your use of the AI Lease Builder platform."
      />
      <meta property="og:url" content="https://aileasebuilder.com/legal/terms" />
      <meta property="og:type" content="article" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="Terms of Service – AI Lease Builder" />
      <meta
        name="twitter:description"
        content="Review the Terms and conditions for using AI Lease Builder."
      />
    </>
  );
}

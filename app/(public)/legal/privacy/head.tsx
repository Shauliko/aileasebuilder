// app/(public)/legal/privacy/head.tsx

export default function Head() {
  return (
    <>
      <title>Privacy Policy – AI Lease Builder</title>

      <meta
        name="description"
        content="Read the AI Lease Builder privacy policy. Learn how your data is collected, used, and protected when generating state-compliant residential leases."
      />

      <link rel="canonical" href="https://aileasebuilder.com/legal/privacy" />

      {/* Open Graph */}
      <meta property="og:title" content="Privacy Policy – AI Lease Builder" />
      <meta
        property="og:description"
        content="Learn how AI Lease Builder collects, uses, and protects your personal information."
      />
      <meta property="og:url" content="https://aileasebuilder.com/legal/privacy" />
      <meta property="og:type" content="article" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="Privacy Policy – AI Lease Builder" />
      <meta
        name="twitter:description"
        content="Read our privacy practices and how we protect your data."
      />
    </>
  );
}

export default function Head() {
  return (
    <>
      <title>Payment Successful – AI Lease Builder</title>

      <meta
        name="description"
        content="Your payment was successful. AI Lease Builder is now generating your customized residential lease."
      />

      <link rel="canonical" href="https://aileasebuilder.com/payment-success" />

      {/* Open Graph */}
      <meta property="og:title" content="Payment Successful – AI Lease Builder" />
      <meta
        property="og:description"
        content="Payment confirmed. Your lease is being generated now."
      />
      <meta property="og:url" content="https://aileasebuilder.com/payment-success" />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="Payment Successful – AI Lease Builder" />
      <meta
        name="twitter:description"
        content="We are generating your residential lease now."
      />
    </>
  );
}

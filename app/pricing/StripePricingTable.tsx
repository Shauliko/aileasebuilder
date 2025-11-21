"use client";

export default function StripePricingTable() {
  return (
    <>
      <script async src="https://js.stripe.com/v3/pricing-table.js"></script>

      <div
        dangerouslySetInnerHTML={{
          __html: `
            <stripe-pricing-table
              pricing-table-id="prctbl_1SUckXFg5QvfiKQBFPNFEKmB"
              publishable-key="pk_live_51SUbsUFg5QvfiKQB2BtuVY1NObNBqv3kGQSPwzZOOZw8zgJ66Ae9jDNJpnLi7MZCJ0Abf76u2NFpxtYowQpYdZwU00hR399Q4g"
            ></stripe-pricing-table>
          `,
        }}
      />
    </>
  );
}

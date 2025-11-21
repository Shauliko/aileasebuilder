// global.d.ts – custom JSX tags

declare namespace JSX {
  interface IntrinsicElements {
    "stripe-pricing-table": {
      "pricing-table-id"?: string;
      "publishable-key"?: string;
      className?: string;
    };
  }
}

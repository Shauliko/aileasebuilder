// app/api/create-checkout-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---------------- ENV LOADING ----------------
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const priceId = process.env.STRIPE_PRICE_PAYG || "";
const domain =
  process.env.NEXT_PUBLIC_DOMAIN || "https://aileasebuilder.com";

// Detect mode from secret key prefix
const stripeMode = stripeSecretKey.startsWith("sk_test_")
  ? "test"
  : stripeSecretKey.startsWith("sk_live_")
  ? "live"
  : "unknown";

// Log once at cold start (sanitized)
console.log("[CHECKOUT-ENV]", {
  mode: stripeMode,
  keyPrefix: stripeSecretKey ? stripeSecretKey.slice(0, 7) : null,
  pricePrefix: priceId ? priceId.slice(0, 10) : null,
  domain,
});

// Create Stripe client only if we have a key
const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2025-10-29.clover",
    })
  : null;

export async function POST(req: NextRequest) {
  try {
    // Runtime safety checks
    if (!stripeSecretKey || !stripe) {
      console.error("[CHECKOUT] Missing STRIPE_SECRET_KEY at runtime");
      return NextResponse.json(
        { error: "Server misconfigured: STRIPE_SECRET_KEY missing" },
        { status: 500 }
      );
    }

    if (!priceId) {
      console.error("[CHECKOUT] Missing STRIPE_PRICE_PAYG at runtime");
      return NextResponse.json(
        { error: "Server misconfigured: STRIPE_PRICE_PAYG missing" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const leaseData = body.leaseData || {};

    // Extra debug log for each call
    console.log("[CHECKOUT] Creating session", {
      mode: stripeMode,
      keyPrefix: stripeSecretKey.slice(0, 7),
      pricePrefix: priceId.slice(0, 10),
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId, // $8 product (test price)
          quantity: 1,
        },
      ],
      success_url: `${domain}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/generate-lease`,
      metadata: {
        leaseData: JSON.stringify(leaseData),
        languages: JSON.stringify(body.languages || []),
        planType: body.planType || "payg",
        email: body.email || "",
        type: "payg",
      },

    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("[CHECKOUT ERROR]", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Checkout failed" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { Pool } from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────
// ENV VARIABLES (NO BUILD-TIME THROWS)
// ─────────────────────────────────────────────
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
const databaseUrl = process.env.DATABASE_URL || "";

// ─────────────────────────────────────────────
// STRIPE INIT
// ─────────────────────────────────────────────
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-10-29.clover",
});

// ─────────────────────────────────────────────
// POSTGRES INIT (NEON)
// ─────────────────────────────────────────────
const pool = new Pool({
  connectionString: databaseUrl,
  max: 3,
});

// Insert helper
async function insertLeaseEvent(params: {
  user_id: string | null;
  email: string | null;
  type: "paid" | "free";
  amount: number;
  currency: string;
  product: string | null;
  lease_id: string | null;
  stripe_session_id: string | null;
  stripe_customer: string | null;
  metadata: Record<string, any> | null;
}) {
  const client = await pool.connect();
  try {
    await client.query(
      `
      INSERT INTO lease_events (
        user_id,
        email,
        type,
        amount,
        currency,
        product,
        lease_id,
        stripe_session_id,
        stripe_customer,
        metadata
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    `,
      [
        params.user_id,
        params.email,
        params.type,
        params.amount,
        params.currency,
        params.product,
        params.lease_id,
        params.stripe_session_id,
        params.stripe_customer,
        params.metadata ?? {},
      ]
    );
  } finally {
    client.release();
  }
}

// ─────────────────────────────────────────────
// MAIN WEBHOOK HANDLER
// ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Validate env at runtime (NOT build-time)
  if (!stripeSecretKey || !stripeWebhookSecret) {
    console.error("Missing Stripe environment variables");
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  if (!databaseUrl) {
    console.error("Missing DATABASE_URL");
    return NextResponse.json(
      { error: "Database is not configured" },
      { status: 500 }
    );
  }

  // Stripe requires raw body
  const rawBody = Buffer.from(await req.arrayBuffer());
  const h = await headers();
  const sig = h.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  // ───────────── STRIPE SIGNATURE VALIDATION ─────────────
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      stripeWebhookSecret
    );
  } catch (err: any) {
    console.error("Stripe signature error:", err?.message || err);
    return NextResponse.json(
      { error: "Invalid Stripe signature" },
      { status: 400 }
    );
  }

  // ───────────── HANDLE EVENTS ─────────────
  try {
    switch (event.type) {
      // PAYMENT COMPLETE
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const email =
          session.customer_details?.email ??
          (session.customer_email as string | null) ??
          null;

        const customerId = (session.customer as string) || null;
        const amountTotal = session.amount_total ?? 0;
        const currency = session.currency ?? "usd";

        const stripeSessionId = session.id;

        const productMeta =
          (session.metadata && (session.metadata.product as string)) ||
          (session.metadata && (session.metadata.plan as string)) ||
          "lease-purchase";

        const userIdMeta =
          (session.metadata && (session.metadata.user_id as string)) || null;

        await insertLeaseEvent({
          user_id: userIdMeta,
          email,
          type: "paid",
          amount: amountTotal,
          currency,
          product: productMeta,
          lease_id: null,
          stripe_session_id: stripeSessionId,
          stripe_customer: customerId,
          metadata: session.metadata ?? {},
        });

        break;
      }

      // OPTIONAL: SUBSCRIPTIONS
      case "invoice.payment_succeeded": {
        // implement if needed
        break;
      }

      default:
        // ignore everything else
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error("Webhook handler error:", err?.message || err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

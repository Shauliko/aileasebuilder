import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { Pool } from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────
// ENV (LOG AT COLD START)
// ─────────────────────────────────────────────
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
const databaseUrl = process.env.DATABASE_URL || "";

console.log("[WEBHOOK_INIT]", {
  stripeSecretKey: stripeSecretKey ? stripeSecretKey.slice(0, 10) + "..." : "MISSING",
  stripeWebhookSecret: stripeWebhookSecret ? "present" : "MISSING",
  databaseUrl: databaseUrl ? "present" : "MISSING",
});

// ─────────────────────────────────────────────
// STRIPE INIT
// ─────────────────────────────────────────────
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-10-29.clover",
});

// ─────────────────────────────────────────────
// DB INIT
// ─────────────────────────────────────────────
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
  max: 3,
});

// ─────────────────────────────────────────────
// DB INSERT WITH LOGGING
// ─────────────────────────────────────────────
async function insertLeaseEvent(params: any) {
  console.log("[DB] INSERT ATTEMPT", {
    email: params.email,
    amount: params.amount,
    currency: params.currency,
    session: params.stripe_session_id,
  });

  const client = await pool.connect();

  try {
    const result = await client.query(
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
      RETURNING id
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

    console.log("[DB] INSERT SUCCESS", result.rows[0]);
  } catch (err: any) {
    console.error("[DB_ERROR]", err?.message || err);
    throw err;
  } finally {
    client.release();
  }
}

// ─────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  console.log("[WEBHOOK] REQUEST RECEIVED");

  // Soft env validation
  if (!stripeSecretKey || !stripeWebhookSecret || !databaseUrl) {
    console.error("[WEBHOOK] Missing env vars", {
      stripeSecretKey: !!stripeSecretKey,
      stripeWebhookSecret: !!stripeWebhookSecret,
      databaseUrl: !!databaseUrl,
    });

    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // Stripe requires raw body
  const rawBody = Buffer.from(await req.arrayBuffer());
  const h = await headers();
  const sig = h.get("stripe-signature");

  if (!sig) {
    console.error("[WEBHOOK] Missing signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  // Signature verification
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, stripeWebhookSecret);
  } catch (err: any) {
    console.error("[WEBHOOK] Signature error:", err?.message || err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("[WEBHOOK] EventType:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log("[WEBHOOK] Checkout Session:", {
          email:
            session.customer_details?.email ||
            session.customer_email ||
            null,
          amount: session.amount_total,
          currency: session.currency,
          sessionId: session.id,
        });

        await insertLeaseEvent({
          user_id: session.metadata?.user_id ?? null,
          email:
            session.customer_details?.email ||
            (session.customer_email as string | null) ||
            null,
          type: "paid",
          amount: session.amount_total ?? 0,
          currency: session.currency ?? "usd",
          product:
            session.metadata?.product ||
            session.metadata?.plan ||
            "lease-purchase",
          lease_id: null,
          stripe_session_id: session.id,
          stripe_customer: (session.customer as string) || null,
          metadata: session.metadata ?? {},
        });
        break;
      }

      default:
        console.log("[WEBHOOK] Ignored event", event.type);
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error("[WEBHOOK_HANDLER_ERROR]", err?.message || err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

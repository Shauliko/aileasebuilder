import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---------- ENV ----------
const databaseUrl = process.env.DATABASE_URL;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";

if (!databaseUrl) console.error("Missing DATABASE_URL");
if (!stripeSecretKey) console.error("Missing STRIPE_SECRET_KEY");

// ---------- DB ----------
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
  max: 3,
});

// ---------- STRIPE ----------
const stripe = new Stripe(stripeSecretKey);

// ============================================================
// GET /api/admin/orders/[id]
// ============================================================
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM lease_events WHERE id = $1 LIMIT 1`,
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, order: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("[ADMIN ORDER GET ERROR]:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ============================================================
// POST /api/admin/orders/[id]
// ============================================================
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { action } = await req.json();

    const client = await pool.connect();

    try {
      const result = await client.query(
        `SELECT * FROM lease_events WHERE id = $1 LIMIT 1`,
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const evt = result.rows[0];

      // -------------------------
      // DELETE ENTRY
      // -------------------------
      if (action === "delete") {
        await client.query(`DELETE FROM lease_events WHERE id = $1`, [id]);
        return NextResponse.json({ success: true });
      }

      if (!evt.stripe_session_id) {
        return NextResponse.json(
          { error: "Missing stripe_session_id" },
          { status: 400 }
        );
      }

      // -------------------------
      // REFUND PAYMENT
      // -------------------------
      if (action === "refund") {
        if (evt.type !== "paid") {
          return NextResponse.json(
            { error: "Cannot refund free events" },
            { status: 400 }
          );
        }

        const session = await stripe.checkout.sessions.retrieve(
          evt.stripe_session_id,
          { expand: ["payment_intent"] }
        );

        if (!session.payment_intent) {
          return NextResponse.json(
            { error: "PaymentIntent not found" },
            { status: 400 }
          );
        }

        const piId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent.id;

        await stripe.refunds.create({ payment_intent: piId });

        return NextResponse.json({ success: true });
      }

      // -------------------------
      // RECEIPT LINK
      // -------------------------
      if (action === "receipt_link") {
        const session = await stripe.checkout.sessions.retrieve(
          evt.stripe_session_id,
          { expand: ["payment_intent", "payment_intent.charges"] }
        );

        if (!session.payment_intent) {
          return NextResponse.json(
            { error: "PaymentIntent not found" },
            { status: 400 }
          );
        }

        const pi =
          typeof session.payment_intent === "string"
            ? await stripe.paymentIntents.retrieve(session.payment_intent, {
                expand: ["charges"],
              })
            : session.payment_intent;

            // Convert PI into a type that includes charges
            const piWithCharges = pi as Stripe.PaymentIntent & {
              charges?: Stripe.ApiList<Stripe.Charge>;
            };

            // Get charges array
            const charges = piWithCharges.charges?.data || [];
            const charge = charges[0];


        if (!charge?.receipt_url) {
          return NextResponse.json(
            { error: "No receipt URL available" },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          receipt_url: charge.receipt_url,
        });
      }

      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("[ADMIN ORDER POST ERROR]:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

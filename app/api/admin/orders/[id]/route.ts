import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// -----------------------
// DATABASE INIT
// -----------------------
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL in environment variables");
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: 3,
});

// -----------------------
// GET /api/admin/orders/[id]
// -----------------------
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const orderId = params.id;

  if (!orderId || orderId.trim() === "") {
    return NextResponse.json(
      { error: "Missing order ID" },
      { status: 400 }
    );
  }

  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      SELECT
        id,
        user_id,
        email,
        type,
        amount,
        currency,
        product,
        lease_id,
        stripe_session_id,
        stripe_customer,
        metadata,
        created_at
      FROM lease_events
      WHERE id = $1
      LIMIT 1
      `,
      [orderId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const order = result.rows[0];

    return NextResponse.json(
      {
        success: true,
        order,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error fetching order:", err);

    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

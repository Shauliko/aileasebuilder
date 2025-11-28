// app/api/admin/orders/route.ts

import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---------------------------
// Postgres pool
// ---------------------------
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("[ADMIN ORDERS] Missing DATABASE_URL env var");
}

// Use the same style of config Neon needs (SSL on)
const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 3,
    })
  : null;


function misconfigured(message: string) {
  console.error("[ADMIN ORDERS] Misconfigured:", message);
  return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
}

// ============================================================
// GET /api/admin/orders
// Query params:
//   page   = page number (1-based)
//   type   = "all" | "paid" | "free"
//   search = text (email / product / stripe_session_id)
// ============================================================
export async function GET(req: NextRequest) {
  try {
    if (!pool) return misconfigured("DATABASE_URL is missing");

    const { searchParams } = new URL(req.url);

    // pagination
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = 20;
    const offset = (page - 1) * limit;

    const type = (searchParams.get("type") || "all").toLowerCase();
    const search = (searchParams.get("search") || "").trim();

    // ------------------------------
    // Build WHERE clause safely
    // ------------------------------
    const conditions: string[] = [];
    const params: any[] = [];

    // type filter
    if (type === "paid") {
      conditions.push(`type = 'paid'`);
    } else if (type === "free") {
      conditions.push(`type = 'free'`);
    }

    // search filter
    if (search.length > 0) {
      params.push(`%${search}%`);
      const idx = params.length; // same index used 3 times
      conditions.push(
        `(email ILIKE $${idx} OR product ILIKE $${idx} OR stripe_session_id ILIKE $${idx})`
      );
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // ------------------------------
    // Main query
    // ------------------------------
    const query = `
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
      ${whereClause}
      ORDER BY created_at DESC, id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    // ------------------------------
    // Count query (same WHERE, same params)
    // ------------------------------
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM lease_events
      ${whereClause}
    `;

    const client = await pool.connect();

    try {
      const [result, countResult] = await Promise.all([
        client.query(query, params),
        client.query(countQuery, params),
      ]);

      const totalRows = Number(countResult.rows[0].total ?? 0);
      const totalPages = Math.max(1, Math.ceil(totalRows / limit));

      return NextResponse.json({
        success: true,
        page,
        totalPages,
        totalRows,
        results: result.rows,
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("[ADMIN ORDERS] GET ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

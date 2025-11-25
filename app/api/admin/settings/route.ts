import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export const runtime = "nodejs";

// ensure table exists (runs automatically on first call)
async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS app_settings (
      id INT PRIMARY KEY,
      data JSONB
    );
  `;
}

// GET /api/admin/settings
export async function GET() {
  await ensureTable();

  const { rows } = await sql`SELECT data FROM app_settings WHERE id = 1`;

  if (rows.length === 0) {
    return NextResponse.json({});
  }

  return NextResponse.json(rows[0].data);
}

// PUT /api/admin/settings
export async function PUT(req: NextRequest) {
  await ensureTable();

  const body = await req.json();

  await sql`
    INSERT INTO app_settings (id, data)
    VALUES (1, ${body})
    ON CONFLICT (id)
    DO UPDATE SET data = EXCLUDED.data;
  `;

  return NextResponse.json({ success: true });
}

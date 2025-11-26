import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { auth } from "@clerk/nextjs/server";

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

// --------------------------------------------
// GET /api/admin/settings
// --------------------------------------------
export async function GET() {
  try {
    // 🔒 AUTH — Admin only
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureTable();

    const { rows } = await sql`SELECT data FROM app_settings WHERE id = 1`;

    if (rows.length === 0) {
      return NextResponse.json({});
    }

    return NextResponse.json(rows[0].data);
  } catch (err) {
    console.error("SETTINGS GET ERROR:", err);
    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 }
    );
  }
}

// --------------------------------------------
// PUT /api/admin/settings
// --------------------------------------------
export async function PUT(req: NextRequest) {
  try {
    // 🔒 AUTH — Admin only
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureTable();

    // Parse and validate body
    const body = await req.json();

    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { error: "Invalid settings payload" },
        { status: 400 }
      );
    }

    // Save into DB (UPSERT)
    await sql`
      INSERT INTO app_settings (id, data)
      VALUES (1, ${body})
      ON CONFLICT (id)
      DO UPDATE SET data = EXCLUDED.data;
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("SETTINGS PUT ERROR:", err);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}

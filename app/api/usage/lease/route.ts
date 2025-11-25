import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export const runtime = "nodejs";

async function ensureUsageTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS lease_usage (
      user_email TEXT PRIMARY KEY,
      used INT NOT NULL DEFAULT 0
    );
  `;
}

async function getAppSettings() {
  const { rows } =
    await sql`SELECT data FROM app_settings WHERE id = 1`;
  const data = (rows[0]?.data as any) || {};
  const freeLimit = data.freeTier?.limit ?? 3;
  const privilegedEmails: string[] =
    data.privilegedUsers?.emails ?? [];
  return { freeLimit, privilegedEmails };
}

// POST /api/usage/lease
// body: { userEmail: string }
export async function POST(req: NextRequest) {
  await ensureUsageTable();
  const { freeLimit, privilegedEmails } = await getAppSettings();

  const body = await req.json();
  const userEmail: string | undefined = body.userEmail;

  if (!userEmail) {
    return NextResponse.json(
      { error: "userEmail required" },
      { status: 400 }
    );
  }

  // privileged users: unlimited
  if (privilegedEmails.includes(userEmail)) {
    return NextResponse.json({
      allowed: true,
      reason: "privileged",
      used: 0,
      limit: freeLimit,
      remaining: Infinity,
    });
  }

  const { rows } =
    await sql`SELECT used FROM lease_usage WHERE user_email = ${userEmail}`;
  const used = rows[0]?.used ?? 0;

  if (used >= freeLimit) {
    return NextResponse.json(
      {
        allowed: false,
        reason: "limit_reached",
        used,
        limit: freeLimit,
        remaining: 0,
      },
      { status: 403 }
    );
  }

  const newUsed = used + 1;

  await sql`
    INSERT INTO lease_usage (user_email, used)
    VALUES (${userEmail}, ${newUsed})
    ON CONFLICT (user_email)
    DO UPDATE SET used = EXCLUDED.used
  `;

  return NextResponse.json({
    allowed: true,
    reason: "ok",
    used: newUsed,
    limit: freeLimit,
    remaining: Math.max(freeLimit - newUsed, 0),
  });
}

// app/api/utils/usage.ts
import { sql } from '@vercel/postgres';
import crypto from 'crypto';

const FREE_LEASE_LIMIT = 1; // 1 free lease per IP

function hashIp(ip: string): string {
  const salt = process.env.IP_SALT || 'change-me';
  return crypto.createHash('sha256').update(ip + salt).digest('hex');
}

function isPrivileged(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = process.env.PRIVILEGED_USERS || '';
  const allowed = list.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  return allowed.includes(email.toLowerCase());
}

async function ensureUsageTable() {
  // Called on every request; CREATE TABLE IF NOT EXISTS is cheap/safe
  await sql`
    CREATE TABLE IF NOT EXISTS usage (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      email text,
      ip_hash text NOT NULL UNIQUE,
      free_leases_used integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `;
}

export async function canGenerateLease(email: string | null | undefined, rawIp: string) {
  await ensureUsageTable();

  const ip = rawIp || 'unknown';
  const ipHash = hashIp(ip);

  if (isPrivileged(email)) {
    return { allowed: true, privileged: true, used: 0 };
  }

  const result = await sql`
    SELECT free_leases_used
    FROM usage
    WHERE ip_hash = ${ipHash}
    LIMIT 1;
  `;

  const used = result.rows[0]?.free_leases_used ?? 0;
  const allowed = used < FREE_LEASE_LIMIT;

  return { allowed, privileged: false, used };
}

export async function recordLeaseGeneration(email: string | null | undefined, rawIp: string) {
  await ensureUsageTable();

  const ip = rawIp || 'unknown';
  const ipHash = hashIp(ip);
  const now = new Date();

  // Upsert by ip_hash
  await sql`
    INSERT INTO usage (email, ip_hash, free_leases_used, created_at, updated_at)
    VALUES (${email}, ${ipHash}, 1, ${now.toISOString()}, ${now.toISOString()})
    ON CONFLICT (ip_hash)
    DO UPDATE SET
      free_leases_used = usage.free_leases_used + 1,
      email = COALESCE(${email}, usage.email),
      updated_at = ${now.toISOString()};
  `;
}

import { sql } from "@vercel/postgres";

export async function getAppSettings() {
  const { rows } = await sql`SELECT data FROM app_settings WHERE id = 1`;
  return (rows[0]?.data as any) || {};
}

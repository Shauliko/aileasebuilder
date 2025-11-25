import { NextRequest, NextResponse } from "next/server";
import { STATE_CLAUSES } from "@/lib/stateClauses";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ state: string }> }
) {
  const resolved = await context.params; // ← FIX
  const state = resolved.state.toUpperCase();

  const clauses = STATE_CLAUSES[state] || STATE_CLAUSES.DEFAULT;

  return NextResponse.json(clauses);
}

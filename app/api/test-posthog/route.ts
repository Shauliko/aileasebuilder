import { NextResponse } from "next/server";
import { trackEventServer } from "@/lib/analytics/posthog-server";

export async function GET() {
  try {
    await trackEventServer("test_event", "server_test", {
      source: "manual_test",
      timestamp: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("PostHog test route error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

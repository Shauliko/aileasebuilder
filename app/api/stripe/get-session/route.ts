// app/api/stripe/get-session/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Missing sessionId" },
        { status: 400 }
      );
    }

    // 1️⃣ Retrieve Stripe checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Extract data from metadata
    let leaseData: any = {};
    let languages: string[] = [];
    let planType: string | null = null;
    let metaEmail: string | null = null;

    if (session.metadata) {
      // Lease form JSON
      if (session.metadata.leaseData) {
        try {
          leaseData = JSON.parse(session.metadata.leaseData);
        } catch (err) {
          console.warn("[get-session] Failed to parse leaseData metadata");
        }
      }

      // Selected languages
      if (session.metadata.languages) {
        try {
          languages = JSON.parse(session.metadata.languages);
        } catch (err) {
          console.warn("[get-session] Failed to parse languages metadata");
        }
      }

      // Plan type
      if (session.metadata.planType) {
        planType = session.metadata.planType;
      }

      // Stored email from checkout
      if (session.metadata.email) {
        metaEmail = session.metadata.email;
      }
    }

    // 3️⃣ Return normalized session payload
    return NextResponse.json({
      success: true,

      // Email: metadata first → then Stripe’s email → fallback to null
      email: metaEmail || session.customer_details?.email || null,

      leaseData,
      languages,
      planType,

      // Keep session for debugging / compatibility
      session,
    });
  } catch (err: any) {
    console.error("[get-session] ERROR:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}

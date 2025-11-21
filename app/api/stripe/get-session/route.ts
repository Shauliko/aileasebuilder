import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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

    // 1️⃣ Fetch checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Extract metadata, including form data
    let leaseData = {};
    if (session.metadata?.leaseData) {
      try {
        leaseData = JSON.parse(session.metadata.leaseData);
      } catch (e) {
        console.warn("Failed to parse leaseData metadata");
      }
    }

    return NextResponse.json({
      success: true,
      email: session.customer_details?.email ?? null,
      leaseData,
      session
    });

  } catch (error: any) {
    console.error("GET SESSION ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

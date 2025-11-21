import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover"
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // This contains all the lease input fields the user filled out
    const leaseData = body.leaseData || {};

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_PAYG!, // $8 product
          quantity: 1
        }
      ],
      success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/generate-lease`,
      metadata: {
        leaseData: JSON.stringify(leaseData),
        type: "payg"
      }
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("CHECKOUT ERROR:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

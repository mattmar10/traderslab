import { getStripeUserIdByEmail } from "@/actions/data/user/user-actions";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json(
      { error: "Missing email in request body" },
      { status: 400 }
    );
  }

  try {
    const usersStripeId = await getStripeUserIdByEmail(email);

    if (!usersStripeId) {
      return NextResponse.json(
        { error: "Unable to find Stripe user ID for the provided email" },
        { status: 404 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: usersStripeId,
      return_url: `${process.env.FRONTEND_URL}/home`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating billing portal session:", error);
    return NextResponse.json({
      error: "Failed to create billing portal session",
    });
  }
}

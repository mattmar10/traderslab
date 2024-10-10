import {
  cancelSubscription,
  insertSubscription,
  updateSubscription,
  upsertSubscription,
} from "@/actions/data/subscriptions/subscriptionActions";
import { getUserByEmail } from "@/actions/data/user/user-actions";
import { NewSubscription, usersTable } from "@/drizzle/schema";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET() {
  try {
    return NextResponse.json(
      { status: "OK", message: "Service is healthy" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      { status: "ERROR", message: "Service is unhealthy" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const reqText = await req.text();
  return webhooksHandler(reqText, req);
}

async function getCustomerEmail(customerId: string): Promise<string | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return (customer as Stripe.Customer).email;
  } catch (error) {
    console.error("Error fetching customer:", error);
    return null;
  }
}

async function handleSubscriptionEvent(
  event: Stripe.Event,
  type: "created" | "updated" | "deleted"
) {
  const subscription = event.data.object as Stripe.Subscription;
  const customerEmail = await getCustomerEmail(subscription.customer as string);

  if (!customerEmail) {
    return NextResponse.json({
      status: 500,
      error: "Customer email could not be fetched",
    });
  }

  const user = await getUserByEmail(customerEmail);

  if (!user) {
    return NextResponse.json({
      status: 500,
      error: "Could not fetch user by email",
    });
  }

  const subscriptionData: NewSubscription = {
    subscriptionId: subscription.id,
    stripeUserId: extractCustomerId(subscription.customer),
    status: subscription.status,
    startDate: new Date(subscription.created * 1000).toISOString(),
    planId: subscription.items.data[0]?.price.id,
    userId: user.id,
    email: customerEmail,
  };

  const eventCreatedDate = new Date(event.created * 1000);

  try {
    let result;

    if (type === "deleted") {
      result = await cancelSubscription(subscription.id, customerEmail);
    } else if (type === "created") {
      result = insertSubscription(subscriptionData);
    } else {
      result = await upsertSubscription(subscriptionData, eventCreatedDate);
    }

    // Return a success response
    return NextResponse.json({
      status: 200,
      message: `Subscription ${type} success`,
      data: result,
    });
  } catch (error) {
    console.error(`Error during subscription ${type}:`, error);
    return NextResponse.json({
      status: 500,
      error: `Error during subscription ${type}`,
    });
  }
}

async function handleInvoiceEvent(
  event: Stripe.Event,
  status: "succeeded" | "failed"
) {
  const invoice = event.data.object as Stripe.Invoice;
  const customerEmail = await getCustomerEmail(invoice.customer as string);

  if (!customerEmail) {
    return NextResponse.json({
      status: 500,
      error: "Customer email could not be fetched",
    });
  }

  const invoiceData = {
    invoice_id: invoice.id,
    subscription_id: invoice.subscription as string,
    amount_paid: status === "succeeded" ? invoice.amount_paid / 100 : undefined,
    amount_due: status === "failed" ? invoice.amount_due / 100 : undefined,
    currency: invoice.currency,
    status,
    user_id: invoice.metadata?.userId,
    email: customerEmail,
  };

  let error, data;
  if (error) {
    console.error(`Error inserting invoice (payment ${status}):`, error);
    return NextResponse.json({
      status: 500,
      error: `Error inserting invoice (payment ${status})`,
    });
  }

  return NextResponse.json({
    status: 200,
    message: `Invoice payment ${status}`,
    data,
  });
}

async function webhooksHandler(
  reqText: string,
  request: NextRequest
): Promise<NextResponse> {
  const sig = request.headers.get("Stripe-Signature");

  try {
    const event = await stripe.webhooks.constructEventAsync(
      reqText,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case "customer.subscription.created":
        return handleSubscriptionEvent(event, "created");
      case "customer.subscription.updated":
        return handleSubscriptionEvent(event, "updated");
      case "customer.subscription.deleted":
        return handleSubscriptionEvent(event, "deleted");
      case "invoice.payment_succeeded":
        return handleInvoiceEvent(event, "succeeded");
      case "invoice.payment_failed":
        return handleInvoiceEvent(event, "failed");

      default:
        return NextResponse.json({
          status: 400,
          error: "Unhandled event type",
        });
    }
  } catch (err) {
    console.error("Error constructing Stripe event:", err);
    return NextResponse.json({
      status: 500,
      error: "Webhook Error: Invalid Signature",
    });
  }
}

function extractCustomerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer
): string {
  // If it's a string, it's already the customer ID
  if (typeof customer === "string") {
    return customer;
  }

  // If it's a Customer object, return the ID
  if ("id" in customer) {
    return customer.id;
  }

  // Handle DeletedCustomer (if you need a different behavior, adjust here)
  throw new Error("Unexpected customer type");
}

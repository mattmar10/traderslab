// subscriptionActions.ts

"server only";

import { and, eq, sql } from "drizzle-orm";

import { getDatabaseInstance } from "@/lib/db";
import {
  ExistingSubscription,
  NewSubscription,
  subscriptionsTable,
} from "@/drizzle/schema";

// Insert a new subscription
export async function insertSubscription(
  subscriptionData: NewSubscription
): Promise<ExistingSubscription> {
  const db = await getDatabaseInstance();

  const existingSubscription = await db
    .select()
    .from(subscriptionsTable)
    .where(
      eq(subscriptionsTable.subscriptionId, subscriptionData.subscriptionId)
    )
    .limit(1);

  if (existingSubscription.length > 0) {
    return existingSubscription[0];
  }

  const [newSubscription] = await db
    .insert(subscriptionsTable)
    .values(subscriptionData)
    .returning();

  console.log("Subscription inserted:", newSubscription);
  return newSubscription;
}

// Update an existing subscription by subscriptionId
export async function updateSubscription(
  subscriptionId: string,
  subscriptionData: Partial<NewSubscription>
): Promise<ExistingSubscription> {
  const db = await getDatabaseInstance();

  const [updatedSubscription] = await db
    .update(subscriptionsTable)
    .set(subscriptionData)
    .where(eq(subscriptionsTable.subscriptionId, subscriptionId))
    .returning();

  if (!updatedSubscription) {
    throw new Error("Subscription not found");
  }

  console.log("Subscription updated:", updatedSubscription);
  return updatedSubscription;
}

export async function upsertSubscription(
  subscriptionData: NewSubscription,
  webhookTimestamp: Date
): Promise<ExistingSubscription | null> {
  const db = await getDatabaseInstance();

  // Check if a subscription with this ID already exists
  const existingSubscription = await db
    .select()
    .from(subscriptionsTable)
    .where(
      eq(subscriptionsTable.subscriptionId, subscriptionData.subscriptionId)
    )
    .limit(1);

  if (existingSubscription.length > 0) {
    const existing = existingSubscription[0];

    // Compare webhook timestamp with the existing record's updatedAt
    // If updatedAt is null, treat it as if it's older than the webhook
    console.log(`handling update of subscription ${existing.subscriptionId}`);
    const formattedWebhookTimestamp = webhookTimestamp.toISOString();
    const [updatedSubscription] = await db
      .update(subscriptionsTable)
      .set({
        ...subscriptionData,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(
        //and(
        eq(subscriptionsTable.subscriptionId, subscriptionData.subscriptionId)
        //sql`${subscriptionsTable.updatedAt} IS NULL OR ${subscriptionsTable.updatedAt} < ${formattedWebhookTimestamp}`
      )
      //)
      .returning();

    console.log("Subscription updated:", updatedSubscription);
    return updatedSubscription;
  } else {
    // If it doesn't exist, insert a new record
    const [newSubscription] = await db
      .insert(subscriptionsTable)
      .values({
        ...subscriptionData,
        createdAt: webhookTimestamp,
        updatedAt: webhookTimestamp,
      })
      .returning();

    console.log("Subscription inserted:", newSubscription);
    return newSubscription;
  }
}

// Set the subscription status to "cancelled" when deleting
export async function cancelSubscription(
  subscriptionId: string,
  email: string
): Promise<ExistingSubscription> {
  const db = await getDatabaseInstance();

  const [cancelledSubscription] = await db
    .update(subscriptionsTable)
    .set({ status: "cancelled", email })
    .where(eq(subscriptionsTable.subscriptionId, subscriptionId))
    .returning();

  if (!cancelledSubscription) {
    throw new Error("Subscription not found");
  }

  console.log("Subscription cancelled:", cancelledSubscription);
  return cancelledSubscription;
}

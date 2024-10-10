"server only";

import { subscriptionsTable, usersTable } from "@/drizzle/schema";
import { getDatabaseInstance } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
export const isAuthorized = async (
  userId: string
): Promise<{ authorized: boolean; message: string }> => {
  try {
    const user = await clerkClient().users.getUser(userId);

    if (!user) {
      return { authorized: false, message: "User not found" };
    }

    // Get the database instance
    const db = await getDatabaseInstance();

    // Select the user and subscription details, including subscription status
    const userWithSubscription = await db
      .select({
        id: usersTable.id,
        subscriptionId: subscriptionsTable.id,
        subscriptionStatus: subscriptionsTable.status, // Include status in the selection
      })
      .from(usersTable)
      .leftJoin(
        subscriptionsTable,
        eq(usersTable.id, subscriptionsTable.userId)
      )
      .where(eq(usersTable.externalId, userId))
      .limit(1);

    // Check if the user is registered in the system
    if (userWithSubscription.length === 0) {
      return {
        authorized: false,
        message: "User is not registered in the system",
      };
    }

    // Check if the user has a subscription and if it's active
    const subscription = userWithSubscription[0];
    const isSubscribed =
      subscription.subscriptionId !== null &&
      subscription.subscriptionStatus === "active";

    return {
      authorized: isSubscribed,
      message: isSubscribed
        ? "User is actively subscribed"
        : "User does not have an active subscription",
    };
  } catch (error: any) {
    return { authorized: false, message: error.message };
  }
};

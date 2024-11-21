"server only";

import {
  ExistingUser,
  NewUser,
  subscriptionsTable,
  usersTable,
} from "@/drizzle/schema";
import { getDatabaseInstance } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function insertUser(user: NewUser): Promise<NewUser> {
  const db = await getDatabaseInstance();

  const existingUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, user.email))
    .limit(1);

  if (existingUsers.length > 0) {
    throw new Error("Email already exists");
  } else {
    const [insertedUser] = await db.insert(usersTable).values(user).returning();

    console.log("User created:", insertedUser);
    return insertedUser;
  }
}

export async function findOrCreateUser(user: NewUser): Promise<NewUser> {
  const db = await getDatabaseInstance();

  const existingUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.externalId, user.externalId))
    .limit(1);

  if (existingUsers.length === 0) {
    const [insertedUser] = await db.insert(usersTable).values(user).returning();

    console.log("User created:", insertedUser);
    return insertedUser;
  } else {
    return existingUsers[0];
  }
}

export async function getUserByEmail(
  email: string
): Promise<ExistingUser | undefined> {
  const db = await getDatabaseInstance();

  const existingUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (existingUsers.length === 0) {
    return undefined;
  } else {
    return existingUsers[0];
  }
}

export const getStripeUserIdByEmail = async (
  email: string
): Promise<string | undefined> => {
  const db = await getDatabaseInstance();
  const result = await db
    .select({
      email: usersTable.email,
      stripeUserId: subscriptionsTable.stripeUserId,
    })
    .from(usersTable)
    .innerJoin(subscriptionsTable, eq(usersTable.id, subscriptionsTable.userId))
    .where(eq(usersTable.email, email))
    .limit(1);

  return result[0]?.stripeUserId || undefined;
};

type Condition = ReturnType<typeof eq>; // Define a type for the condition based on your query builder

async function updateUserByCondition(
  condition: Condition, // Use the defined type for the `condition` parameter
  userData: Partial<NewUser>
): Promise<NewUser> {
  const db = await getDatabaseInstance();

  const [updatedUser] = await db
    .update(usersTable)
    .set({
      ...userData,
      updatedAt: new Date(),
    })
    .where(condition)
    .returning();

  if (!updatedUser) {
    throw new Error("User not found");
  }

  console.log("User updated:", updatedUser);
  return updatedUser;
}

// Update by user ID
export async function updateUser(
  id: string,
  userData: Partial<NewUser>
): Promise<NewUser> {
  return updateUserByCondition(eq(usersTable.id, id), userData);
}

// Update by external ID
export async function updateUserByExternalId(
  externalId: string,
  userData: Partial<NewUser>
): Promise<NewUser> {
  return updateUserByCondition(eq(usersTable.externalId, externalId), userData);
}


export const getCurrentUserIdFromSession = async (clerkId: string): Promise<string | undefined> => {
  try {
    const db = await getDatabaseInstance();

    // Convert Drizzle result to plain object
    const user = await db
      .select({
        id: usersTable.id  // explicitly select only the fields you need
      })
      .from(usersTable)
      .where(eq(usersTable.externalId, clerkId))
      .limit(1)
      .then(users => users[0] ? { id: users[0].id } : undefined); // Convert to plain object

    return user?.id;
  } catch (error) {
    console.error("Error getting user:", error);
    return undefined;
  }
};
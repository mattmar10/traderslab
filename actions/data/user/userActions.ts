"server only";

import { NewUser, usersTable } from "@/drizzle/schema";
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

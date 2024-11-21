"use server";

import { getDatabaseInstance } from "@/lib/db";
import { NewPrereleaseUser, prereleaseUsersTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function createPrereleaseUser(email: string): Promise<{ success: boolean; message: string }> {
    const db = await getDatabaseInstance();

    try {
        // Check if email already exists
        const existingUser = await db
            .select()
            .from(prereleaseUsersTable)
            .where(eq(prereleaseUsersTable.email, email))
            .limit(1);

        if (existingUser.length > 0) {
            return {
                success: false,
                message: "This email is already registered for updates!"
            };
        }

        // Insert new pre-release user
        const newUser: NewPrereleaseUser = {
            email: email.toLowerCase().trim()
        };

        await db.insert(prereleaseUsersTable).values(newUser);

        return {
            success: true,
            message: "Thank you for your interest! We'll notify you when we launch."
        };

    } catch (error) {
        console.error("Error creating pre-release user:", error);
        return {
            success: false,
            message: "Sorry, something went wrong. Please try again later."
        };
    }
}
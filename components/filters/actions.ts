"use server"
import { NewFilterGroup, usersTable } from "@/drizzle/schema";
import { FilterGroup } from "@/lib/types/screener-types";
import { eq } from "drizzle-orm";
import { auth } from '@clerk/nextjs/server'
import { FiltersService } from "@/services/filters-service";
import { getDatabaseInstance } from "@/lib/db";
export type FilterGroupPermissionType = "PRIVATE" | "SHARED" | "SYSTEM";

export async function saveFilterGroup(
    filterGroup: FilterGroup,
    description: string,
    permission: "PRIVATE" | "SHARED" | "SYSTEM"
) {
    try {
        const { userId: clerkUserId } = await auth()

        if (!clerkUserId) {
            throw new Error("User must be signed in to create a filter group")
        }

        const db = await getDatabaseInstance();
        const filterService = new FiltersService(db);
        const drizzleUser = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.externalId, clerkUserId))
            .limit(1);

        const newFG: NewFilterGroup = {
            name: filterGroup.name,
            permissionType: permission,
            payload: JSON.stringify(filterGroup),
            userId: drizzleUser[0].id,
            description: description,
        };

        const savedFilterGroup = await filterService.createFilterGroup(newFG);
        return { success: true, data: savedFilterGroup };
    } catch (error) {
        console.error("Error saving filter group:", error);
        return { success: false, error: "Failed to save filter group" };
    }
}

export async function updateFilterGroup(
    filterGroupId: string,
    updatedFilterGroup: FilterGroup,
    description: string,
    permission: "PRIVATE" | "SHARED" | "SYSTEM"
) {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) {
            throw new Error("User must be signed in to create a filter group")
        }
        const db = await getDatabaseInstance();
        const filterService = new FiltersService(db);

        const drizzleUser = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.externalId, clerkUserId))
            .limit(1);

        const existingFilterGroup = await filterService.getFilterGroupById(
            filterGroupId
        );

        if (!existingFilterGroup) {
            return { success: false, error: "Filter group not found" };
        }

        if (existingFilterGroup.userId! !== drizzleUser[0].id) {
            return {
                success: false,
                error: "User does not have permission to update this filter group",
            };
        }

        const updatedFG: NewFilterGroup = {
            ...existingFilterGroup, // Keep the existing fields
            name: updatedFilterGroup.name, // Update the name
            permissionType: permission, // Update the permission
            payload: JSON.stringify(updatedFilterGroup), // Update the payload
            description: description, // Update the description
        };

        const updatedFilterGroupResult = await filterService.updateFilterGroup(
            filterGroupId,
            updatedFG
        );

        return { success: true, data: updatedFilterGroupResult };
    } catch (error) {
        console.error("Error updating filter group:", error);
        return { success: false, error: "Failed to update filter group" };
    }

}



export async function getFilterGroupsForUser() {
    console.log("loading user filters");
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
        throw new Error("User must be signed in to create a filter group")
    }

    const db = await getDatabaseInstance();
    const filterService = new FiltersService(db);

    const drizzleUser = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.externalId, clerkUserId))
        .limit(1);

    const userFilters = filterService.getFilterGroupsByUserId(drizzleUser[0].id);
    return userFilters;
}

export async function getSharedFilterGroups() {
    const db = await getDatabaseInstance();
    const filterService = new FiltersService(db);
    return filterService.getAllSharedFilterGroups();
}


export async function getUserFavoriteFilterGroupIds() {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
        throw new Error("User must be signed in to create a filter group")
    }
    const db = await getDatabaseInstance();
    const filterService = new FiltersService(db);
    return filterService.getUserFavoriteFilterGroupIds(clerkUserId);
}

export async function getUserFavoriteFilterGroups() {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
        throw new Error("User must be signed in to create a filter group")
    }
    const db = await getDatabaseInstance();
    const filterService = new FiltersService(db);
    return filterService.getUserFavoriteFilterGroups(clerkUserId);
}

export async function removeFavoriteFilterGroup(filterGroupId: string) {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
        throw new Error("User must be signed in to create a filter group")
    }
    const db = await getDatabaseInstance();
    const filterService = new FiltersService(db);
    filterService.removeFavoriteFilterGroup(clerkUserId, filterGroupId);
}

export async function addFavoriteFilterGroup(filterGroupId: string) {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
        throw new Error("User must be signed in to create a filter group")
    }
    const db = await getDatabaseInstance();
    const filterService = new FiltersService(db);
    filterService.addFavoriteFilterGroup(clerkUserId, filterGroupId);
}

export async function deleteFilter(id: string) {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
        throw new Error("User must be signed in to create a filter group")
    }
    const db = await getDatabaseInstance();
    const filterService = new FiltersService(db);

    // You might want to add an additional check here to ensure the user owns this filter
    return filterService.deleteFilterGroup(id);
}

import {
  ExistingFilterGroupWithTags,
  filterGroups,
  filterGroupTags,
  tags,
  userFavoriteFilterGroups,
  usersTable,
} from "@/drizzle/schema";
import { eq, desc, or, and, inArray } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export type FilterGroupResponse =
  | {
      success: true;
      data: (typeof filterGroups.$inferSelect)[];
      error?: never;
    }
  | { success: false; data: never[]; error: string };
export class FiltersService {
  constructor(private db: NodePgDatabase) {}

  async createFilterGroup(
    data: typeof filterGroups.$inferInsert & { tags?: string[] }
  ): Promise<FilterGroupResponse> {
    try {
      const { tags: tagNames, ...filterGroupData } = data;

      const filterGroup = await this.db.transaction(async (tx) => {
        // Create the filter group first
        const [fg] = await tx
          .insert(filterGroups)
          .values(filterGroupData)
          .returning();

        // If tags were provided, process them
        if (tagNames && tagNames.length > 0) {
          // Get or create tags using the transaction
          const tagResults = await Promise.all(
            tagNames.map(async (tagName) => {
              const [existingTag] = await tx
                .select()
                .from(tags)
                .where(eq(tags.name, tagName));

              if (existingTag) {
                return existingTag;
              }

              const [newTag] = await tx
                .insert(tags)
                .values({ name: tagName })
                .returning();

              return newTag;
            })
          );

          // Associate tags with filter group using the transaction
          await Promise.all(
            tagResults.map((tag) =>
              tx.insert(filterGroupTags).values({
                filterGroupId: fg.id,
                tagId: tag.id,
              })
            )
          );
        }

        return fg;
      });

      return { success: true, data: [filterGroup] };
    } catch (error) {
      console.error("Error in createFilterGroup:", error);
      return {
        success: false,
        data: [],
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
  async updateFilterGroup(
    id: string,
    data: Partial<
      Omit<
        ExistingFilterGroupWithTags["filterGroup"],
        "id" | "createdAt" | "updatedAt"
      >
    > & { tags?: string[] }
  ): Promise<FilterGroupResponse> {
    try {
      const { tags: tagNames, ...filterGroupData } = data;

      const updatedFilterGroup = await this.db.transaction(async (tx) => {
        // Update the filter group first
        const [fg] = await tx
          .update(filterGroups)
          .set({ ...filterGroupData, updatedAt: new Date() })
          .where(eq(filterGroups.id, id))
          .returning();

        // If tags were provided (even as empty array), update them
        if (tagNames !== undefined) {
          // Remove existing tags
          await this.removeFilterGroupTags(id);

          // Add new tags if any were provided
          if (tagNames.length > 0) {
            const tagIds = await this.getOrCreateTags(tagNames);
            await this.associateFilterGroupWithTags(id, tagIds);
          }
        }

        return fg;
      });

      return { success: true, data: [updatedFilterGroup] };
    } catch (error) {
      return {
        success: false,
        data: [],
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  private async associateFilterGroupWithTags(
    filterGroupId: string,
    tagIds: string[]
  ) {
    // Create the associations
    return this.db
      .insert(filterGroupTags)
      .values(
        tagIds.map((tagId) => ({
          filterGroupId,
          tagId,
        }))
      )
      .onConflictDoNothing()
      .returning();
  }

  private async getOrCreateTags(tagNames: string[]) {
    // First, try to find existing tags
    const existingTags = await this.db
      .select()
      .from(tags)
      .where(inArray(tags.name, tagNames));

    // Create a map of existing tag names
    const existingTagMap = new Map(existingTags.map((tag) => [tag.name, tag]));

    // Identify which tags need to be created
    const tagsToCreate = tagNames.filter((name) => !existingTagMap.has(name));

    // Create new tags if needed
    if (tagsToCreate.length > 0) {
      const newTags = await this.db
        .insert(tags)
        .values(tagsToCreate.map((name) => ({ name })))
        .returning();

      // Add new tags to our map
      newTags.forEach((tag) => existingTagMap.set(tag.name, tag));
    }

    // Return all tag IDs in the original order
    return tagNames.map((name) => existingTagMap.get(name)!.id);
  }

  private async removeFilterGroupTags(filterGroupId: string) {
    return this.db
      .delete(filterGroupTags)
      .where(eq(filterGroupTags.filterGroupId, filterGroupId));
  }

  async getFilterGroupById(id: string) {
    const result = await this.db
      .select()
      .from(filterGroups)
      .where(eq(filterGroups.id, id))
      .limit(1);

    // Return the first item in the array, or null if no items are found
    return result.length > 0 ? result[0] : null;
  }
  async getAllFilterGroups() {
    return this.db.select().from(filterGroups);
  }

  async deleteFilterGroup(id: string) {
    return this.db
      .delete(filterGroups)
      .where(eq(filterGroups.id, id))
      .returning();
  }

  async getFilterGroupsByUserId(userId: string) {
    return this.db
      .select()
      .from(filterGroups)
      .where(eq(filterGroups.userId, userId))
      .orderBy(desc(filterGroups.updatedAt));
  }

  async getAllSharedFilterGroups() {
    return this.db
      .select({
        filterGroup: filterGroups,
      })
      .from(filterGroups)
      .leftJoin(usersTable, eq(filterGroups.userId, usersTable.id))
      .where(
        or(
          eq(filterGroups.permissionType, "SHARED"),
          eq(filterGroups.permissionType, "SYSTEM")
        )
      )
      .orderBy(desc(filterGroups.updatedAt));
  }

  async getFilterGroupsByTag(tagName: string) {
    return this.db
      .select({
        filterGroup: filterGroups,
      })
      .from(filterGroups)
      .innerJoin(
        filterGroupTags,
        eq(filterGroups.id, filterGroupTags.filterGroupId)
      )
      .innerJoin(tags, eq(filterGroupTags.tagId, tags.id))
      .where(eq(tags.name, tagName))
      .orderBy(desc(filterGroups.updatedAt));
  }

  async getUserFavoriteFilterGroupIds(externalId: string) {
    const user = await this.db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.externalId, externalId))
      .limit(1);

    if (!user.length) {
      throw new Error("User not found");
    }

    const userId = user[0].id;

    const favorites = await this.db
      .select({ filterGroupId: userFavoriteFilterGroups.filterGroupId })
      .from(userFavoriteFilterGroups)
      .where(eq(userFavoriteFilterGroups.userId, userId));

    return favorites.map((fav) => fav.filterGroupId);
  }

  async addFavoriteFilterGroup(externalId: string, filterGroupId: string) {
    const user = await this.db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.externalId, externalId))
      .limit(1);

    if (!user.length) {
      throw new Error("User not found");
    }

    const userId = user[0].id;

    return this.db
      .insert(userFavoriteFilterGroups)
      .values({ userId, filterGroupId })
      .onConflictDoNothing()
      .returning();
  }

  async removeFavoriteFilterGroup(externalId: string, filterGroupId: string) {
    const user = await this.db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.externalId, externalId))
      .limit(1);

    if (!user.length) {
      throw new Error("User not found");
    }

    const userId = user[0].id;

    return this.db
      .delete(userFavoriteFilterGroups)
      .where(
        and(
          eq(userFavoriteFilterGroups.userId, userId),
          eq(userFavoriteFilterGroups.filterGroupId, filterGroupId)
        )
      )
      .returning();
  }

  async getUserFavoriteFilterGroups(externalId: string) {
    // Resolve the `id` first
    const user = await this.db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.externalId, externalId))
      .limit(1);

    if (!user.length) {
      throw new Error("User not found");
    }

    const userId = user[0].id;

    // Use the resolved `id` in the main query
    return this.db
      .select({
        filterGroup: filterGroups,
      })
      .from(userFavoriteFilterGroups)
      .innerJoin(
        filterGroups,
        eq(userFavoriteFilterGroups.filterGroupId, filterGroups.id)
      )
      .innerJoin(usersTable, eq(filterGroups.userId, usersTable.id))
      .where(eq(userFavoriteFilterGroups.userId, userId))
      .orderBy(desc(filterGroups.updatedAt));
  }
}

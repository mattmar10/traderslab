import {
  filterGroups,
  filterGroupTags,
  tags,
  userFavoriteFilterGroups,
  usersTable,
} from "@/drizzle/schema";
import { eq, desc, or, and } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export class FiltersService {
  constructor(private db: NodePgDatabase) { }

  async createFilterGroup(data: typeof filterGroups.$inferInsert) {
    return this.db.insert(filterGroups).values(data).returning();
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

  async updateFilterGroup(
    id: string,
    data: Partial<typeof filterGroups.$inferInsert>
  ) {
    return this.db
      .update(filterGroups)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(filterGroups.id, id))
      .returning();
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
        filterGroup: filterGroups
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
        filterGroup: filterGroups
      })
      .from(filterGroups)
      .innerJoin(
        filterGroupTags,
        eq(filterGroups.id, filterGroupTags.filterGroupId)
      )
      .innerJoin(
        tags,
        eq(filterGroupTags.tagId, tags.id)
      )
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

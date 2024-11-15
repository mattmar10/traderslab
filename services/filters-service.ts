import {
  filterGroups,
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

  async getUserFavoriteFilterGroupIds(userId: string) {
    const favorites = await this.db
      .select({ filterGroupId: userFavoriteFilterGroups.filterGroupId })
      .from(userFavoriteFilterGroups)
      .where(eq(userFavoriteFilterGroups.userId, userId));

    return favorites.map((fav) => fav.filterGroupId);
  }

  async addFavoriteFilterGroup(userId: string, filterGroupId: string) {
    return this.db
      .insert(userFavoriteFilterGroups)
      .values({ userId, filterGroupId })
      .onConflictDoNothing()
      .returning();
  }

  async removeFavoriteFilterGroup(userId: string, filterGroupId: string) {
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

  async getUserFavoriteFilterGroups(userId: string) {
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

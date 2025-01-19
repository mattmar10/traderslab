import { relations } from "drizzle-orm";
import {
  text,
  timestamp,
  pgTable,
  uuid,
  varchar,
  jsonb,
  bigint,
  uniqueIndex,
  doublePrecision,
  integer,
  decimal,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  externalId: varchar("external_id", { length: 255 }).unique().notNull(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).unique().notNull(),
  profileImageURL: varchar("profile_image_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type NewUser = typeof usersTable.$inferInsert;
export type ExistingUser = typeof usersTable.$inferSelect;

export const paymentsTable = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  stripeId: varchar("stripe_id", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  amount: varchar("amount", { length: 255 }).notNull(),
  paymentTime: varchar("payment_time", { length: 255 }).notNull(),
  paymentDate: varchar("payment_date", { length: 255 }).notNull(),
  currency: varchar("currency", { length: 10 }).notNull(),
  userId: uuid("user_id")
    .references(() => usersTable.id)
    .notNull(), // Foreign key to `usersTable`
  customerDetails: text("customer_details"),
  paymentIntent: varchar("payment_intent", { length: 255 }).notNull(),
});

export type NewPayment = typeof paymentsTable.$inferInsert;
export type ExistingPayment = typeof paymentsTable.$inferSelect & {
  user?: ExistingUser; // One-to-one relation back to User
};

export const subscriptionsTable = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  subscriptionId: varchar("subscription_id", { length: 255 }).notNull(),
  stripeUserId: varchar("stripe_user_id", { length: 255 }).notNull(),
  status: varchar("status", { length: 255 }).notNull(),
  startDate: varchar("start_date", { length: 255 }).notNull(),
  endDate: varchar("end_date", { length: 255 }), // Nullable end date
  planId: varchar("plan_id", { length: 255 }).notNull(),
  defaultPaymentMethodId: varchar("default_payment_method_id", { length: 255 }), // Nullable
  email: varchar("email", { length: 320 }).notNull(),
  userId: uuid("user_id").references(() => usersTable.id), // Foreign key to `usersTable`
});

export type NewSubscription = typeof subscriptionsTable.$inferInsert;
export type ExistingSubscription = typeof subscriptionsTable.$inferSelect & {
  user?: ExistingUser; // One-to-one optional relation back to User
};

export const subscriptionPlansTable = pgTable("subscriptions_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  planId: varchar("plan_id", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  amount: varchar("amount", { length: 255 }).notNull(),
  currency: varchar("currency", { length: 10 }).notNull(),
  interval: varchar("interval", { length: 255 }).notNull(),
});

export type NewSubscriptionPlan = typeof subscriptionPlansTable.$inferInsert;
export type ExistingSubscriptionPlan =
  typeof subscriptionPlansTable.$inferSelect;

export const invoicesTable = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  invoiceId: varchar("invoice_id", { length: 255 }).notNull(),
  subscriptionId: varchar("subscription_id", { length: 255 }).notNull(),
  amountPaid: varchar("amount_paid", { length: 255 }).notNull(),
  amountDue: varchar("amount_due", { length: 255 }), // Nullable amount due
  currency: varchar("currency", { length: 10 }).notNull(),
  status: varchar("status", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  userId: uuid("user_id").references(() => usersTable.id), // Foreign key to `usersTable`
});

export type NewInvoice = typeof invoicesTable.$inferInsert;
export type ExistingInvoice = typeof invoicesTable.$inferSelect & {
  user?: ExistingUser; // One-to-one relation back to User
};

export const filterGroups = pgTable("filter_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
  description: text("description"),
  createdDate: timestamp("created_date").defaultNow(),
  modifiedDate: timestamp("modified_date").defaultNow(),
  payload: jsonb("payload"),
  permissionType: text("permission_type").$type<
    "PRIVATE" | "SHARED" | "SYSTEM"
  >(),
  userId: uuid("user_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type NewFilterGroup = typeof filterGroups.$inferInsert;

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const filterGroupTags = pgTable("filter_group_tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  filterGroupId: uuid("filter_group_id")
    .notNull()
    .references(() => filterGroups.id, { onDelete: "cascade" }),
  tagId: uuid("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export type NewFilterGroupTag = typeof filterGroupTags.$inferInsert;
export type ExistingFilterGroupTag = typeof filterGroupTags.$inferSelect;
export type ExistingFilterGroup = typeof filterGroups.$inferSelect;
export type ExistingFilterGroupWithTags = {
  filterGroup: ExistingFilterGroup;
  tags: string[];
};

export const userFavoriteFilterGroups = pgTable("user_favorite_filter_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  filterGroupId: uuid("filter_group_id")
    .notNull()
    .references(() => filterGroups.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const userRelations = relations(usersTable, ({ many, one }) => ({
  filterGroups: many(filterGroups),
  favoriteFilterGroups: many(userFavoriteFilterGroups),
  subscription: one(subscriptionsTable, {
    fields: [usersTable.id],
    references: [subscriptionsTable.userId],
  }),
  payments: many(paymentsTable), // Corrected `many` relation without `fields` and `references`
  invoices: many(invoicesTable), // Corrected `many` relation without `fields` and `references`
}));

// Relations for `subscriptionsTable`
export const subscriptionRelations = relations(
  subscriptionsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [subscriptionsTable.userId],
      references: [usersTable.id],
    }),
  })
);

export const paymentRelations = relations(paymentsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [paymentsTable.userId],
    references: [usersTable.id],
  }),
}));

export const invoiceRelations = relations(invoicesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [invoicesTable.userId],
    references: [usersTable.id],
  }),
}));

export const filterGroupRelations = relations(
  filterGroups,
  ({ one, many }) => ({
    user: one(usersTable, {
      fields: [filterGroups.userId],
      references: [usersTable.id],
    }),
    filterGroupTags: many(filterGroupTags),
    favoritedBy: many(userFavoriteFilterGroups),
  })
);

export const tagRelations = relations(tags, ({ many }) => ({
  filterGroupTags: many(filterGroupTags),
}));

export const filterGroupTagRelations = relations(
  filterGroupTags,
  ({ one }) => ({
    filterGroup: one(filterGroups, {
      fields: [filterGroupTags.filterGroupId],
      references: [filterGroups.id],
    }),
    tag: one(tags, {
      fields: [filterGroupTags.tagId],
      references: [tags.id],
    }),
  })
);

export const userFavoriteFilterGroupRelations = relations(
  userFavoriteFilterGroups,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [userFavoriteFilterGroups.userId],
      references: [usersTable.id],
    }),
    filterGroup: one(filterGroups, {
      fields: [userFavoriteFilterGroups.filterGroupId],
      references: [filterGroups.id],
    }),
  })
);

export const prereleaseUsersTable = pgTable("prerelease_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 320 }).unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type NewPrereleaseUser = typeof prereleaseUsersTable.$inferInsert;
export type ExistingPrereleaseUser = typeof prereleaseUsersTable.$inferSelect;

//market breadth snapshots
export const marketBreadthSnapshotsTable = pgTable(
  "market_breadth_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    timestamp: bigint("timestamp", { mode: "number" }).notNull(),
    data: jsonb("data").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    timestampIdx: uniqueIndex("market_breadth_snapshots_timestamp_idx").on(
      table.timestamp
    ),
  })
);

export type NewMarketBreadthSnapshot = typeof marketBreadthSnapshotsTable.$inferInsert;
export type ExistingMarketBreadthSnapshot = typeof marketBreadthSnapshotsTable.$inferSelect;

export const quotesTable = pgTable('quotes', {
  // Primary identifier
  symbol: varchar('symbol', { length: 20 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),

  // Price-related fields
  price: decimal('price', { precision: 18, scale: 4 }).notNull(),
  changesPercentage: decimal('changes_percentage', { precision: 10, scale: 4 }).notNull(),
  change: decimal('change', { precision: 18, scale: 4 }).notNull(),
  dayLow: decimal('day_low', { precision: 18, scale: 4 }).notNull(),
  dayHigh: decimal('day_high', { precision: 18, scale: 4 }).notNull(),
  yearHigh: decimal('year_high', { precision: 18, scale: 4 }).notNull(),
  yearLow: decimal('year_low', { precision: 18, scale: 4 }).notNull(),

  // Market data
  marketCap: decimal('market_cap', { precision: 24, scale: 4 }),
  exchange: varchar('exchange', { length: 20 }),
  volume: decimal('volume', { precision: 18, scale: 4 }).notNull(),
  avgVolume: decimal('avg_volume', { precision: 18, scale: 4 }),
  open: decimal('open', { precision: 18, scale: 4 }).notNull(),
  previousClose: decimal('previous_close', { precision: 18, scale: 4 }).notNull(),

  // Additional data
  earningsAnnouncement: varchar('earnings_announcement', { length: 30 }),
  sharesOutstanding: decimal('shares_outstanding', { precision: 18, scale: 4 }),
  timestamp: bigint('timestamp', { mode: 'number' }).notNull()
});

export type ExistingQuote = typeof quotesTable.$inferSelect;

import { pgTable, text, serial, decimal, boolean, timestamp } from "drizzle-orm/pg-core";

export const settingsTable = pgTable("store_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Setting = typeof settingsTable.$inferSelect;

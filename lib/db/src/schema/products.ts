import { pgTable, text, serial, decimal, integer, boolean, jsonb, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  nameFr: text("name_fr"),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  icon: text("icon"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCategorySchema = createInsertSchema(categoriesTable).omit({ id: true, createdAt: true });
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categoriesTable.$inferSelect;

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  nameFr: text("name_fr"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  descriptionFr: text("description_fr"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  images: text("images").array().notNull().default([]),
  categoryId: integer("category_id").references(() => categoriesTable.id),
  stock: integer("stock").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  onSale: boolean("on_sale").notNull().default(false),
  discount: decimal("discount", { precision: 5, scale: 2 }),
  brand: text("brand"),
  model: text("model"),
  specs: jsonb("specs"),
  descriptionMedia: jsonb("description_media"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;

import { pgTable, text, serial, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  costPrice: numeric("cost_price", { precision: 12, scale: 2 }),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  status: text("status").notNull().default("In Stock"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(productsTable);
export type InsertProduct = typeof productsTable.$inferInsert;
export type Product = typeof productsTable.$inferSelect;

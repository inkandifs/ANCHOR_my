import { pgTable, text, serial, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const contactsTable = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull().default("Customer"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  balance: numeric("balance", { precision: 12, scale: 2 }).notNull().default("0.00"),
  status: text("status").notNull().default("Active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactSchema = createInsertSchema(contactsTable);
export type InsertContact = typeof contactsTable.$inferInsert;
export type Contact = typeof contactsTable.$inferSelect;

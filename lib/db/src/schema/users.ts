import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  loginId: text("login_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("User"),
  companyName: text("company_name"),
  billingAddress: text("billing_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable);
export type InsertUser = typeof usersTable.$inferInsert;
export type User = typeof usersTable.$inferSelect;

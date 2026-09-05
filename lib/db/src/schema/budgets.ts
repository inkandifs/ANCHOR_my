import { pgTable, text, serial, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const budgetsTable = pgTable("budgets", {
  id: serial("id").primaryKey(),
  budgetId: text("budget_id").notNull().unique(),
  name: text("name").notNull(),
  period: text("period").notNull(),
  owner: text("owner").notNull(),
  analytic: text("analytic").notNull(),
  type: text("type").notNull().default("Expense"),
  target: numeric("target", { precision: 12, scale: 2 }).notNull(),
  committed: numeric("committed", { precision: 12, scale: 2 }).notNull(),
  achieved: numeric("achieved", { precision: 12, scale: 2 }).notNull(),
  pct: integer("pct").notNull().default(0),
  status: text("status").notNull().default("Confirmed"),
  linked: text("linked"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Budget = typeof budgetsTable.$inferSelect;

import { pgTable, text, serial, numeric, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const accountsTable = pgTable("chart_of_accounts", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  balance: numeric("balance", { precision: 12, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const journalsTable = pgTable("journals", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const journalEntriesTable = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  entryNo: text("entry_no").notNull().unique(),
  journalName: text("journal_name").notNull(),
  date: text("date").notNull(),
  reference: text("reference"),
  partner: text("partner"),
  debitTotal: numeric("debit_total", { precision: 12, scale: 2 }).notNull(),
  creditTotal: numeric("credit_total", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default("Posted"),
  lines: jsonb("lines"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Account = typeof accountsTable.$inferSelect;
export type Journal = typeof journalsTable.$inferSelect;
export type JournalEntry = typeof journalEntriesTable.$inferSelect;

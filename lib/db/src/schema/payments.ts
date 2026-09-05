import { pgTable, text, serial, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  paymentNo: text("payment_no").notNull().unique(),
  type: text("type").notNull(),
  partnerName: text("partner_name").notNull(),
  docId: text("doc_id"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  paymentDate: text("payment_date").notNull(),
  method: text("method").notNull().default("Bank"),
  note: text("note"),
  status: text("status").notNull().default("Confirmed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({ id: true, createdAt: true });
export type Payment = typeof paymentsTable.$inferSelect;

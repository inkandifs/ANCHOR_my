import { pgTable, text, serial, numeric, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { contactsTable } from "./contacts";

export const purchaseOrdersTable = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  orderNo: text("order_no").notNull().unique(),
  vendorId: integer("vendor_id").references(() => contactsTable.id),
  vendorName: text("vendor_name").notNull(),
  orderDate: text("order_date").notNull(),
  expectedDate: text("expected_date"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default("Confirmed"),
  items: jsonb("items"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vendorBillsTable = pgTable("vendor_bills", {
  id: serial("id").primaryKey(),
  billId: text("bill_id").notNull().unique(),
  refNo: text("ref_no"),
  vendorId: integer("vendor_id").references(() => contactsTable.id),
  vendorName: text("vendor_name").notNull(),
  date: text("date").notNull(),
  dueDate: text("due_date").notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: numeric("paid_amount", { precision: 12, scale: 2 }).notNull().default("0.00"),
  status: text("status").notNull().default("Not Paid"),
  items: jsonb("items"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrdersTable).omit({ id: true, createdAt: true });
export const insertVendorBillSchema = createInsertSchema(vendorBillsTable).omit({ id: true, createdAt: true });
export type PurchaseOrder = typeof purchaseOrdersTable.$inferSelect;
export type VendorBill = typeof vendorBillsTable.$inferSelect;

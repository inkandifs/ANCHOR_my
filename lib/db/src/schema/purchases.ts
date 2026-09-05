import { pgTable, text, serial, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const purchaseOrdersTable = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  orderNo: text("order_no").notNull().unique(),
  vendorName: text("vendor_name").notNull(),
  orderDate: text("order_date").notNull(),
  expectedDate: text("expected_date"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default("Confirmed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vendorBillsTable = pgTable("vendor_bills", {
  id: serial("id").primaryKey(),
  billId: text("bill_id").notNull().unique(),
  refNo: text("ref_no"),
  vendorName: text("vendor_name").notNull(),
  date: text("date").notNull(),
  dueDate: text("due_date").notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: numeric("paid_amount", { precision: 12, scale: 2 }).notNull().default("0.00"),
  status: text("status").notNull().default("Not Paid"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrdersTable).omit({ id: true, createdAt: true });
export const insertVendorBillSchema = createInsertSchema(vendorBillsTable).omit({ id: true, createdAt: true });
export type PurchaseOrder = typeof purchaseOrdersTable.$inferSelect;
export type VendorBill = typeof vendorBillsTable.$inferSelect;

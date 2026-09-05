import { pgTable, text, serial, numeric, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { contactsTable } from "./contacts";

export const salesOrdersTable = pgTable("sales_orders", {
  id: serial("id").primaryKey(),
  orderNo: text("order_no").notNull().unique(),
  customerId: integer("customer_id").references(() => contactsTable.id),
  customerName: text("customer_name").notNull(),
  orderDate: text("order_date").notNull(),
  expectedDate: text("expected_date"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default("Confirmed"),
  items: jsonb("items"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customerInvoicesTable = pgTable("customer_invoices", {
  id: serial("id").primaryKey(),
  invoiceId: text("invoice_id").notNull().unique(),
  refNo: text("ref_no"),
  customerId: integer("customer_id").references(() => contactsTable.id),
  customerName: text("customer_name").notNull(),
  date: text("date").notNull(),
  dueDate: text("due_date").notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: numeric("paid_amount", { precision: 12, scale: 2 }).notNull().default("0.00"),
  status: text("status").notNull().default("Not Paid"),
  items: jsonb("items"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSalesOrderSchema = createInsertSchema(salesOrdersTable).omit({ id: true, createdAt: true });
export const insertCustomerInvoiceSchema = createInsertSchema(customerInvoicesTable).omit({ id: true, createdAt: true });
export type SalesOrder = typeof salesOrdersTable.$inferSelect;
export type CustomerInvoice = typeof customerInvoicesTable.$inferSelect;

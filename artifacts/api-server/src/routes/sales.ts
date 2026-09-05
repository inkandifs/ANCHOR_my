import { Router, type IRouter } from "express";
import { memoryStore } from "../lib/store";

const router: IRouter = Router();

router.get("/sales-orders", (_req, res) => {
  res.json({ success: true, salesOrders: memoryStore.salesOrders });
});

router.post("/sales-orders", (req, res) => {
  const { customerName, orderDate, expectedDate, totalAmount, status } = req.body;
  const newOrder = {
    id: memoryStore.salesOrders.length ? Math.max(...memoryStore.salesOrders.map(o => o.id)) + 1 : 1,
    orderNo: `SO-${String(memoryStore.salesOrders.length + 43).padStart(4, "0")}`,
    customerName: customerName || "Customer",
    orderDate: orderDate || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    expectedDate: expectedDate || "Net 30",
    totalAmount: String(totalAmount || "0.00"),
    status: status || "Draft"
  };
  memoryStore.salesOrders.unshift(newOrder);
  res.status(201).json({ success: true, salesOrder: newOrder });
});

router.get("/customer-invoices", (_req, res) => {
  res.json({ success: true, customerInvoices: memoryStore.customerInvoices });
});

router.post("/customer-invoices", (req, res) => {
  const { customerName, date, dueDate, refNo, totalAmount, status } = req.body;
  const count = memoryStore.customerInvoices.length + 13;
  const newInvoice = {
    id: memoryStore.customerInvoices.length ? Math.max(...memoryStore.customerInvoices.map(i => i.id)) + 1 : 1,
    invoiceId: `INV/2026/${String(count).padStart(4, "0")}`,
    refNo: refNo || `REF-${count}`,
    customerName: customerName || "Customer",
    date: date || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    dueDate: dueDate || "Net 30",
    totalAmount: String(totalAmount || "0.00"),
    paidAmount: "0.00",
    status: status || "Not Paid"
  };
  memoryStore.customerInvoices.unshift(newInvoice);
  res.status(201).json({ success: true, customerInvoice: newInvoice });
});

export default router;

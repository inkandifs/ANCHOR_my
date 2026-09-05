import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, salesOrdersTable, customerInvoicesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/sales-orders", async (_req, res) => {
  try {
    const salesOrders = await db.select().from(salesOrdersTable).orderBy(desc(salesOrdersTable.id));
    return res.json({ success: true, salesOrders });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching sales orders" });
  }
});

router.post("/sales-orders", async (req, res) => {
  try {
    const { customerId, customerName, orderDate, expectedDate, totalAmount, status, items } = req.body;
    const countRes = await db.select().from(salesOrdersTable);
    const count = countRes.length + 40;
    const orderNo = `S000${count}`;

    const [salesOrder] = await db
      .insert(salesOrdersTable)
      .values({
        orderNo,
        customerId: customerId ? Number(customerId) : null,
        customerName: customerName || "Customer",
        orderDate: orderDate || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        expectedDate: expectedDate || "Net 30",
        totalAmount: String(totalAmount || "0.00"),
        status: status || "Confirmed",
        items: items || null
      })
      .returning();

    return res.status(201).json({ success: true, salesOrder });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Error creating sales order" });
  }
});

router.get("/customer-invoices", async (_req, res) => {
  try {
    const customerInvoices = await db.select().from(customerInvoicesTable).orderBy(desc(customerInvoicesTable.id));
    return res.json({ success: true, customerInvoices });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching customer invoices" });
  }
});

router.post("/customer-invoices", async (req, res) => {
  try {
    const { customerId, customerName, date, dueDate, refNo, totalAmount, status, items } = req.body;
    const countRes = await db.select().from(customerInvoicesTable);
    const count = countRes.length + 14;
    const invoiceId = `INV/2026/00${count}`;

    const [customerInvoice] = await db
      .insert(customerInvoicesTable)
      .values({
        invoiceId,
        refNo: refNo || `INV-26-${count}`,
        customerId: customerId ? Number(customerId) : null,
        customerName: customerName || "Customer",
        date: date || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        dueDate: dueDate || "Net 30",
        totalAmount: String(totalAmount || "0.00"),
        paidAmount: "0.00",
        status: status || "Not Paid",
        items: items || null
      })
      .returning();

    return res.status(201).json({ success: true, customerInvoice });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Error creating customer invoice" });
  }
});

export default router;

import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, purchaseOrdersTable, vendorBillsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/purchase-orders", async (_req, res) => {
  try {
    const purchaseOrders = await db.select().from(purchaseOrdersTable).orderBy(desc(purchaseOrdersTable.id));
    return res.json({ success: true, purchaseOrders });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching purchase orders" });
  }
});

router.post("/purchase-orders", async (req, res) => {
  try {
    const { vendorId, vendorName, orderDate, expectedDate, totalAmount, status, items } = req.body;
    const countRes = await db.select().from(purchaseOrdersTable);
    const count = countRes.length + 44;
    const orderNo = `P000${count}`;

    const [purchaseOrder] = await db
      .insert(purchaseOrdersTable)
      .values({
        orderNo,
        vendorId: vendorId ? Number(vendorId) : null,
        vendorName: vendorName || "Vendor",
        orderDate: orderDate || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        expectedDate: expectedDate || "Net 30",
        totalAmount: String(totalAmount || "0.00"),
        status: status || "Confirmed",
        items: items || null
      })
      .returning();

    return res.status(201).json({ success: true, purchaseOrder });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error creating purchase order" });
  }
});

router.get("/vendor-bills", async (_req, res) => {
  try {
    const vendorBills = await db.select().from(vendorBillsTable).orderBy(desc(vendorBillsTable.id));
    return res.json({ success: true, vendorBills });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching vendor bills" });
  }
});

router.post("/vendor-bills", async (req, res) => {
  try {
    const { vendorId, vendorName, date, dueDate, refNo, totalAmount, status, items } = req.body;
    const countRes = await db.select().from(vendorBillsTable);
    const count = countRes.length + 9;
    const billId = `Bill/2026/000${count}`;

    const [vendorBill] = await db
      .insert(vendorBillsTable)
      .values({
        billId,
        refNo: refNo || `VB-26-0${count}`,
        vendorId: vendorId ? Number(vendorId) : null,
        vendorName: vendorName || "Vendor",
        date: date || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        dueDate: dueDate || "Net 30",
        totalAmount: String(totalAmount || "0.00"),
        paidAmount: "0.00",
        status: status || "Not Paid",
        items: items || null
      })
      .returning();

    return res.status(201).json({ success: true, vendorBill });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error creating vendor bill" });
  }
});

export default router;

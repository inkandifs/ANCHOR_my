import { Router, type IRouter } from "express";
import { memoryStore } from "../lib/store";

const router: IRouter = Router();

router.get("/purchase-orders", (_req, res) => {
  res.json({ success: true, purchaseOrders: memoryStore.purchaseOrders });
});

router.post("/purchase-orders", (req, res) => {
  const { vendorName, orderDate, expectedDate, totalAmount, status } = req.body;
  const count = memoryStore.purchaseOrders.length + 19;
  const newOrder = {
    id: memoryStore.purchaseOrders.length ? Math.max(...memoryStore.purchaseOrders.map(o => o.id)) + 1 : 1,
    orderNo: `PO-${String(count).padStart(4, "0")}`,
    vendorName: vendorName || "Vendor",
    orderDate: orderDate || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    expectedDate: expectedDate || "Net 30",
    totalAmount: String(totalAmount || "0.00"),
    status: status || "Draft"
  };
  memoryStore.purchaseOrders.unshift(newOrder);
  res.status(201).json({ success: true, purchaseOrder: newOrder });
});

router.get("/vendor-bills", (_req, res) => {
  res.json({ success: true, vendorBills: memoryStore.vendorBills });
});

router.post("/vendor-bills", (req, res) => {
  const { vendorName, date, dueDate, refNo, totalAmount, status } = req.body;
  const count = memoryStore.vendorBills.length + 5;
  const newBill = {
    id: memoryStore.vendorBills.length ? Math.max(...memoryStore.vendorBills.map(b => b.id)) + 1 : 1,
    billId: `BILL/2026/${String(count).padStart(4, "0")}`,
    refNo: refNo || `REF-${count}`,
    vendorName: vendorName || "Vendor",
    date: date || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    dueDate: dueDate || "Net 30",
    totalAmount: String(totalAmount || "0.00"),
    paidAmount: "0.00",
    status: status || "Not Paid"
  };
  memoryStore.vendorBills.unshift(newBill);
  res.status(201).json({ success: true, vendorBill: newBill });
});

export default router;

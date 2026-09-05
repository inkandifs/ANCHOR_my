import { Router, type IRouter } from "express";
import { memoryStore } from "../lib/store";

const router: IRouter = Router();

router.get("/payments", (_req, res) => {
  res.json({ success: true, payments: memoryStore.payments });
});

router.post("/payments", (req, res) => {
  const { type, partnerName, docId, amount, paymentDate, method, note } = req.body;
  const numAmount = parseFloat(amount || "0");
  const count = memoryStore.payments.length + 33;
  
  const newPayment = {
    id: memoryStore.payments.length ? Math.max(...memoryStore.payments.map(p => p.id)) + 1 : 1,
    paymentNo: `PAY-${String(count).padStart(4, "0")}`,
    type: type || "Receive",
    partnerName: partnerName || "Partner",
    docId: docId || "",
    amount: numAmount.toFixed(2),
    paymentDate: paymentDate || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    method: method || "Bank Transfer",
    note: note || "",
    status: "Confirmed"
  };

  // If docId matches a customer invoice or vendor bill, update its paidAmount and status
  if (docId) {
    const inv = memoryStore.customerInvoices.find(i => i.invoiceId === docId || i.id === Number(docId));
    if (inv) {
      const currentPaid = parseFloat(inv.paidAmount || "0");
      const total = parseFloat(inv.totalAmount || "0");
      const updatedPaid = currentPaid + numAmount;
      inv.paidAmount = updatedPaid.toFixed(2);
      if (updatedPaid >= total) {
        inv.status = "Paid";
      } else if (updatedPaid > 0) {
        inv.status = "Partial";
      }
    }

    const bill = memoryStore.vendorBills.find(b => b.billId === docId || b.id === Number(docId));
    if (bill) {
      const currentPaid = parseFloat(bill.paidAmount || "0");
      const total = parseFloat(bill.totalAmount || "0");
      const updatedPaid = currentPaid + numAmount;
      bill.paidAmount = updatedPaid.toFixed(2);
      if (updatedPaid >= total) {
        bill.status = "Paid";
      } else if (updatedPaid > 0) {
        bill.status = "Partial";
      }
    }
  }

  memoryStore.payments.unshift(newPayment);
  res.status(201).json({ success: true, payment: newPayment });
});

export default router;

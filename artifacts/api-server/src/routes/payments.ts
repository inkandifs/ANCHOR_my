import { Router, type IRouter } from "express";
import { eq, desc, or } from "drizzle-orm";
import { db, paymentsTable, customerInvoicesTable, vendorBillsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/payments", async (_req, res) => {
  try {
    const payments = await db.select().from(paymentsTable).orderBy(desc(paymentsTable.id));
    return res.json({ success: true, payments });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching payments" });
  }
});

router.post("/payments", async (req, res) => {
  try {
    const { type, partnerName, docId, amount, paymentDate, method, note } = req.body;
    const numAmount = parseFloat(amount || "0");
    const countRes = await db.select().from(paymentsTable);
    const count = countRes.length + 33;
    const paymentNo = `PAY-${String(count).padStart(4, "0")}`;

    const [newPayment] = await db
      .insert(paymentsTable)
      .values({
        paymentNo,
        type: type || "Receive",
        partnerName: partnerName || "Partner",
        docId: docId ? String(docId) : "",
        amount: numAmount.toFixed(2),
        paymentDate: paymentDate || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        method: method || "Bank Transfer",
        note: note || "",
        status: "Confirmed"
      })
      .returning();

    if (docId) {
      const docStr = String(docId);
      // Update customer invoice if matching
      const invoices = await db
        .select()
        .from(customerInvoicesTable)
        .where(or(eq(customerInvoicesTable.invoiceId, docStr), eq(customerInvoicesTable.id, isNaN(Number(docStr)) ? -1 : Number(docStr))));

      if (invoices.length > 0) {
        const inv = invoices[0];
        const currentPaid = parseFloat(inv.paidAmount || "0");
        const total = parseFloat(inv.totalAmount || "0");
        const updatedPaid = currentPaid + numAmount;
        const newStatus = updatedPaid >= total ? "Paid" : updatedPaid > 0 ? "Partial" : inv.status;

        await db
          .update(customerInvoicesTable)
          .set({ paidAmount: updatedPaid.toFixed(2), status: newStatus })
          .where(eq(customerInvoicesTable.id, inv.id));
      }

      // Update vendor bill if matching
      const bills = await db
        .select()
        .from(vendorBillsTable)
        .where(or(eq(vendorBillsTable.billId, docStr), eq(vendorBillsTable.id, isNaN(Number(docStr)) ? -1 : Number(docStr))));

      if (bills.length > 0) {
        const bill = bills[0];
        const currentPaid = parseFloat(bill.paidAmount || "0");
        const total = parseFloat(bill.totalAmount || "0");
        const updatedPaid = currentPaid + numAmount;
        const newStatus = updatedPaid >= total ? "Paid" : updatedPaid > 0 ? "Partial" : bill.status;

        await db
          .update(vendorBillsTable)
          .set({ paidAmount: updatedPaid.toFixed(2), status: newStatus })
          .where(eq(vendorBillsTable.id, bill.id));
      }
    }

    return res.status(201).json({ success: true, payment: newPayment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Error recording payment" });
  }
});

export default router;

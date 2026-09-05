import { Router, type IRouter } from "express";
import { db, customerInvoicesTable, vendorBillsTable, accountsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/reports/profit-loss", async (_req, res) => {
  try {
    const customerInvoices = await db.select().from(customerInvoicesTable);
    const vendorBills = await db.select().from(vendorBillsTable);

    const totalRevenue = customerInvoices.reduce((sum: number, inv: any) => sum + parseFloat(inv.totalAmount || "0"), 0);
    const totalExpenses = vendorBills.reduce((sum: number, bill: any) => sum + parseFloat(bill.totalAmount || "0"), 0);
    const netIncome = totalRevenue - totalExpenses;

    return res.json({
      success: true,
      report: {
        title: "Profit & Loss Statement",
        period: "Year to Date (2026)",
        totalRevenue: totalRevenue.toFixed(2),
        totalExpenses: totalExpenses.toFixed(2),
        netIncome: netIncome.toFixed(2),
        revenueItems: [
          { account: "4000 Professional Services", amount: totalRevenue.toFixed(2) }
        ],
        expenseItems: [
          { account: "5000 Contractor & Supplies Expense", amount: totalExpenses.toFixed(2) }
        ]
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error generating Profit & Loss report" });
  }
});

router.get("/reports/balance-sheet", async (_req, res) => {
  try {
    const accounts = await db.select().from(accountsTable);

    const assets = accounts.filter((a: any) => a.type === "Asset" || a.type === "Bank" || a.type === "Cash");
    const liabilities = accounts.filter((a: any) => a.type === "Liability");
    const equity = accounts.filter((a: any) => a.type === "Equity" || a.type === "Capital");

    const totalAssets = assets.reduce((sum: number, a: any) => sum + parseFloat(a.balance || "0"), 0);
    const totalLiabilities = liabilities.reduce((sum: number, a: any) => sum + parseFloat(a.balance || "0"), 0);
    const totalEquity = equity.reduce((sum: number, a: any) => sum + parseFloat(a.balance || "0"), 0);

    return res.json({
      success: true,
      report: {
        title: "Balance Sheet",
        asOf: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        totalAssets: totalAssets.toFixed(2),
        totalLiabilities: totalLiabilities.toFixed(2),
        totalEquity: totalEquity.toFixed(2),
        assets,
        liabilities,
        equity
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error generating Balance Sheet report" });
  }
});

router.get("/reports/analytics", async (_req, res) => {
  return res.json({
    success: true,
    analytics: [
      { code: "ANC-001", name: "Studio Operations", balance: "42,180.00", budget: "96,000.00" },
      { code: "ANC-002", name: "Client Growth & Marketing", balance: "16,220.00", budget: "45,000.00" }
    ]
  });
});

export default router;

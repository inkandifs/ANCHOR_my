import { Router, type IRouter } from "express";
import { memoryStore } from "../lib/store";

const router: IRouter = Router();

router.get("/reports/profit-loss", (_req, res) => {
  const totalRevenue = memoryStore.customerInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || "0"), 0);
  const totalExpenses = memoryStore.vendorBills.reduce((sum, bill) => sum + parseFloat(bill.totalAmount || "0"), 0);
  const netIncome = totalRevenue - totalExpenses;

  res.json({
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
});

router.get("/reports/balance-sheet", (_req, res) => {
  const assets = memoryStore.accounts.filter(a => a.type === "Asset");
  const liabilities = memoryStore.accounts.filter(a => a.type === "Liability");
  const equity = memoryStore.accounts.filter(a => a.type === "Equity");

  const totalAssets = assets.reduce((sum, a) => sum + parseFloat(a.balance || "0"), 0);
  const totalLiabilities = liabilities.reduce((sum, a) => sum + parseFloat(a.balance || "0"), 0);
  const totalEquity = equity.reduce((sum, a) => sum + parseFloat(a.balance || "0"), 0);

  res.json({
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
});

router.get("/reports/analytics", (_req, res) => {
  res.json({
    success: true,
    analytics: [
      { code: "ANC-001", name: "Studio Operations", balance: "42,180.00", budget: "96,000.00" },
      { code: "ANC-002", name: "Client Growth & Marketing", balance: "16,220.00", budget: "45,000.00" }
    ]
  });
});

export default router;

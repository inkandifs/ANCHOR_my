import { Router, type IRouter } from "express";
import { memoryStore } from "../lib/store";

const router: IRouter = Router();

router.get("/budgets", (_req, res) => {
  res.json({ success: true, budgets: memoryStore.budgets });
});

router.post("/budgets", (req, res) => {
  const { name, period, owner, analytic, type, target, committed, achieved, pct, status } = req.body;
  const count = memoryStore.budgets.length + 1;
  const newBudget = {
    id: memoryStore.budgets.length ? Math.max(...memoryStore.budgets.map(b => b.id)) + 1 : 1,
    budgetId: `BDG-2026-${String(count).padStart(2, "0")}`,
    name: name || "New Budget",
    period: period || "Q1 2026",
    owner: owner || "Mara Chen",
    analytic: analytic || "ANC-001 Operations",
    type: type || "Expense",
    target: target || "$50,000.00",
    committed: committed || "$0.00",
    achieved: achieved || "$0.00",
    pct: pct || 0,
    status: status || "Draft"
  };
  memoryStore.budgets.unshift(newBudget);
  res.status(201).json({ success: true, budget: newBudget });
});

router.post("/budgets/:id/revise", (req, res) => {
  const id = Number(req.params.id);
  const index = memoryStore.budgets.findIndex(b => b.id === id);
  if (index !== -1) {
    memoryStore.budgets[index] = { ...memoryStore.budgets[index], ...req.body, status: "Revised" };
    return res.json({ success: true, budget: memoryStore.budgets[index] });
  }
  return res.status(404).json({ success: false, message: "Budget not found" });
});

export default router;

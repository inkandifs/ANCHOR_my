import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, budgetsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/budgets", async (_req, res) => {
  try {
    const budgets = await db.select().from(budgetsTable).orderBy(desc(budgetsTable.id));
    return res.json({ success: true, budgets });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching budgets" });
  }
});

router.post("/budgets", async (req, res) => {
  try {
    const { name, period, owner, analytic, type, target, committed, achieved, pct, status } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Budget title is required" });
    const countRes = await db.select().from(budgetsTable);
    const count = countRes.length + 1;
    const budgetId = `BDG-${count + 10}`;

    const [budget] = await db
      .insert(budgetsTable)
      .values({
        budgetId,
        name,
        period: period || "Q1 2026",
        owner: owner || "Mara Chen",
        analytic: analytic || "ANC-001 Operations",
        type: type || "Expense",
        target: String(target || "50000.00").replace(/[^0-9.]/g, ""),
        committed: String(committed || "0.00").replace(/[^0-9.]/g, ""),
        achieved: String(achieved || "0.00").replace(/[^0-9.]/g, ""),
        pct: Number(pct || 0),
        status: status || "Draft"
      })
      .returning();

    return res.status(201).json({ success: true, budget });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error creating budget" });
  }
});

router.post("/budgets/:id/revise", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db.update(budgetsTable).set({ status: "Revised" }).where(eq(budgetsTable.id, id)).returning();
    if (updated) return res.json({ success: true, budget: updated });
    return res.status(404).json({ success: false, message: "Budget not found" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error revising budget" });
  }
});

export default router;

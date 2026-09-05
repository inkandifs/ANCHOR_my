import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, accountsTable, journalsTable, journalEntriesTable } from "@workspace/db";

const router: IRouter = Router();

// Chart of Accounts
router.get("/chart-of-accounts", async (_req, res) => {
  try {
    const accounts = await db.select().from(accountsTable).orderBy(desc(accountsTable.id));
    return res.json({ success: true, accounts });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching accounts" });
  }
});

router.post("/chart-of-accounts", async (req, res) => {
  try {
    const { code, name, type, balance } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Account name is required" });
    const countRes = await db.select().from(accountsTable);
    const accountCode = code || `ACC-${countRes.length + 100}`;
    const [account] = await db
      .insert(accountsTable)
      .values({
        code: accountCode,
        name,
        type: type || "Asset",
        balance: String(balance || "0.00")
      })
      .returning();
    return res.status(201).json({ success: true, account });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error creating account" });
  }
});

router.put("/chart-of-accounts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db.update(accountsTable).set(req.body).where(eq(accountsTable.id, id)).returning();
    if (updated) return res.json({ success: true, account: updated });
    return res.status(404).json({ success: false, message: "Account not found" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error updating account" });
  }
});

router.delete("/chart-of-accounts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [deleted] = await db.delete(accountsTable).where(eq(accountsTable.id, id)).returning();
    if (deleted) return res.json({ success: true, message: "Account deleted" });
    return res.status(404).json({ success: false, message: "Account not found" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error deleting account" });
  }
});

// Journals
router.get("/journals", async (_req, res) => {
  try {
    const journals = await db.select().from(journalsTable).orderBy(desc(journalsTable.id));
    return res.json({ success: true, journals });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching journals" });
  }
});

router.post("/journals", async (req, res) => {
  try {
    const { code, name, type } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Journal name is required" });
    const countRes = await db.select().from(journalsTable);
    const journalCode = code || `J-0${countRes.length + 1}`;
    const [journal] = await db
      .insert(journalsTable)
      .values({
        code: journalCode,
        name,
        type: type || "General"
      })
      .returning();
    return res.status(201).json({ success: true, journal });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error creating journal" });
  }
});

router.delete("/journals/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [deleted] = await db.delete(journalsTable).where(eq(journalsTable.id, id)).returning();
    if (deleted) return res.json({ success: true, message: "Journal deleted" });
    return res.status(404).json({ success: false, message: "Journal not found" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error deleting journal" });
  }
});

// Journal Entries
router.get("/journal-entries", async (_req, res) => {
  try {
    const journalEntries = await db.select().from(journalEntriesTable).orderBy(desc(journalEntriesTable.id));
    return res.json({ success: true, journalEntries });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching journal entries" });
  }
});

router.post("/journal-entries", async (req, res) => {
  try {
    const { journalName, date, reference, partner, debitTotal, creditTotal, status, lines } = req.body;
    const countRes = await db.select().from(journalEntriesTable);
    const count = countRes.length + 21;
    const entryNo = `JE-2026-0${count}`;

    const [journalEntry] = await db
      .insert(journalEntriesTable)
      .values({
        entryNo,
        journalName: journalName || "General Journal",
        date: date || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        reference: reference || "",
        partner: partner || "",
        debitTotal: String(debitTotal || "0.00"),
        creditTotal: String(creditTotal || "0.00"),
        status: status || "Posted",
        lines: lines || null
      })
      .returning();
    return res.status(201).json({ success: true, journalEntry });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error creating journal entry" });
  }
});

router.delete("/journal-entries/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [deleted] = await db.delete(journalEntriesTable).where(eq(journalEntriesTable.id, id)).returning();
    if (deleted) return res.json({ success: true, message: "Journal entry deleted" });
    return res.status(404).json({ success: false, message: "Journal entry not found" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error deleting journal entry" });
  }
});

export default router;

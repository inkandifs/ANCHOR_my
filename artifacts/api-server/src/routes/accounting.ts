import { Router, type IRouter } from "express";
import { memoryStore } from "../lib/store";

const router: IRouter = Router();

router.get("/chart-of-accounts", (_req, res) => {
  res.json({ success: true, accounts: memoryStore.accounts });
});

router.post("/chart-of-accounts", (req, res) => {
  const { code, name, type, balance } = req.body;
  const newAccount = {
    id: memoryStore.accounts.length ? Math.max(...memoryStore.accounts.map(a => a.id)) + 1 : 1,
    code: code || `ACC-${memoryStore.accounts.length + 100}`,
    name: name || "New Account",
    type: type || "Asset",
    balance: String(balance || "0.00")
  };
  memoryStore.accounts.push(newAccount);
  res.status(201).json({ success: true, account: newAccount });
});

router.get("/journals", (_req, res) => {
  res.json({ success: true, journals: memoryStore.journals });
});

router.post("/journals", (req, res) => {
  const { code, name, type } = req.body;
  const newJournal = {
    id: memoryStore.journals.length ? Math.max(...memoryStore.journals.map(j => j.id)) + 1 : 1,
    code: code || "MISC",
    name: name || "Miscellaneous Journal",
    type: type || "General"
  };
  memoryStore.journals.push(newJournal);
  res.status(201).json({ success: true, journal: newJournal });
});

router.get("/journal-entries", (_req, res) => {
  res.json({ success: true, journalEntries: memoryStore.journalEntries });
});

router.post("/journal-entries", (req, res) => {
  const { journalName, date, reference, partner, debitTotal, creditTotal, status, lines } = req.body;
  const count = memoryStore.journalEntries.length + 49;
  const newEntry = {
    id: memoryStore.journalEntries.length ? Math.max(...memoryStore.journalEntries.map(e => e.id)) + 1 : 1,
    entryNo: `JRN/2026/${String(count).padStart(4, "0")}`,
    journalName: journalName || "General Journal",
    date: date || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    reference: reference || "",
    partner: partner || "",
    debitTotal: String(debitTotal || "0.00"),
    creditTotal: String(creditTotal || "0.00"),
    status: status || "Posted",
    lines: lines || []
  };
  memoryStore.journalEntries.unshift(newEntry);
  res.status(201).json({ success: true, journalEntry: newEntry });
});

export default router;

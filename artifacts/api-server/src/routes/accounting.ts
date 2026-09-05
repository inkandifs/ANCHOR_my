import { Router, type IRouter } from "express";
import { memoryStore, saveStore } from "../lib/store";

const router: IRouter = Router();

router.get("/chart-of-accounts", (_req, res) => {
  res.json({ success: true, accounts: memoryStore.accounts });
});

router.post("/chart-of-accounts", (req, res) => {
  const { code, name, type, balance } = req.body;
  const newAccount = {
    id: memoryStore.accounts.length ? Math.max(...memoryStore.accounts.map((a: any) => a.id)) + 1 : 1,
    code: code || `ACC-${memoryStore.accounts.length + 100}`,
    name: name || "New Account",
    type: type || "Asset",
    balance: String(balance || "0.00")
  };
  memoryStore.accounts.push(newAccount);
  saveStore();
  res.status(201).json({ success: true, account: newAccount });
});

router.put("/chart-of-accounts/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = memoryStore.accounts.findIndex((a: any) => a.id === id);
  if (index !== -1) {
    memoryStore.accounts[index] = { ...memoryStore.accounts[index], ...req.body };
    saveStore();
    return res.json({ success: true, account: memoryStore.accounts[index] });
  }
  return res.status(404).json({ success: false, message: "Account not found" });
});

router.delete("/chart-of-accounts/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = memoryStore.accounts.findIndex((a: any) => a.id === id);
  if (index !== -1) {
    memoryStore.accounts.splice(index, 1);
    saveStore();
    return res.json({ success: true, message: "Account deleted" });
  }
  return res.status(404).json({ success: false, message: "Account not found" });
});

router.get("/journals", (_req, res) => {
  res.json({ success: true, journals: memoryStore.journals });
});

router.post("/journals", (req, res) => {
  const { code, name, type } = req.body;
  const newJournal = {
    id: memoryStore.journals.length ? Math.max(...memoryStore.journals.map((j: any) => j.id)) + 1 : 1,
    code: code || "MISC",
    name: name || "Miscellaneous Journal",
    type: type || "General"
  };
  memoryStore.journals.push(newJournal);
  saveStore();
  res.status(201).json({ success: true, journal: newJournal });
});

router.delete("/journals/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = memoryStore.journals.findIndex((j: any) => j.id === id);
  if (index !== -1) {
    memoryStore.journals.splice(index, 1);
    saveStore();
    return res.json({ success: true, message: "Journal deleted" });
  }
  return res.status(404).json({ success: false, message: "Journal not found" });
});

router.get("/journal-entries", (_req, res) => {
  res.json({ success: true, journalEntries: memoryStore.journalEntries });
});

router.post("/journal-entries", (req, res) => {
  const { journalName, date, reference, partner, debitTotal, creditTotal, status, lines } = req.body;
  const count = memoryStore.journalEntries.length + 49;
  const newEntry = {
    id: memoryStore.journalEntries.length ? Math.max(...memoryStore.journalEntries.map((e: any) => e.id)) + 1 : 1,
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
  saveStore();
  res.status(201).json({ success: true, journalEntry: newEntry });
});

router.delete("/journal-entries/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = memoryStore.journalEntries.findIndex((e: any) => e.id === id);
  if (index !== -1) {
    memoryStore.journalEntries.splice(index, 1);
    saveStore();
    return res.json({ success: true, message: "Journal entry deleted" });
  }
  return res.status(404).json({ success: false, message: "Journal entry not found" });
});

export default router;

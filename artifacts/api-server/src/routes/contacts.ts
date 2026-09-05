import { Router, type IRouter } from "express";
import { memoryStore, saveStore } from "../lib/store";

const router: IRouter = Router();

router.get("/contacts", (_req, res) => {
  res.json({ success: true, contacts: memoryStore.contacts });
});

router.post("/contacts", (req, res) => {
  const { name, type, email, phone, address, status } = req.body;
  const newContact = {
    id: memoryStore.contacts.length ? Math.max(...memoryStore.contacts.map((c: any) => c.id)) + 1 : 1,
    name: name || "New Contact",
    type: type || "Customer",
    email: email || "",
    phone: phone || "",
    address: address || "",
    status: status || "Active"
  };
  memoryStore.contacts.unshift(newContact);
  saveStore();
  res.status(201).json({ success: true, contact: newContact });
});

router.put("/contacts/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = memoryStore.contacts.findIndex((c: any) => c.id === id);
  if (index !== -1) {
    memoryStore.contacts[index] = { ...memoryStore.contacts[index], ...req.body };
    saveStore();
    return res.json({ success: true, contact: memoryStore.contacts[index] });
  }
  return res.status(404).json({ success: false, message: "Contact not found" });
});

router.delete("/contacts/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = memoryStore.contacts.findIndex((c: any) => c.id === id);
  if (index !== -1) {
    memoryStore.contacts.splice(index, 1);
    saveStore();
    return res.json({ success: true, message: "Contact deleted" });
  }
  return res.status(404).json({ success: false, message: "Contact not found" });
});

export default router;

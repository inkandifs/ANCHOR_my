import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, contactsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/contacts", async (_req, res) => {
  try {
    const contacts = await db.select().from(contactsTable).orderBy(desc(contactsTable.id));
    return res.json({ success: true, contacts });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching contacts" });
  }
});

router.post("/contacts", async (req, res) => {
  try {
    const { name, type, email, phone, address, city, balance, status } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Contact name is required" });
    }
    const [contact] = await db
      .insert(contactsTable)
      .values({
        name,
        type: type || "Customer",
        email: email || "",
        phone: phone || "",
        address: address || "",
        city: city || "Local",
        balance: String(balance || "0.00"),
        status: status || "Active"
      })
      .returning();

    return res.status(201).json({ success: true, contact });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error creating contact" });
  }
});

router.put("/contacts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db.update(contactsTable).set(req.body).where(eq(contactsTable.id, id)).returning();
    if (updated) return res.json({ success: true, contact: updated });
    return res.status(404).json({ success: false, message: "Contact not found" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error updating contact" });
  }
});

router.delete("/contacts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [deleted] = await db.delete(contactsTable).where(eq(contactsTable.id, id)).returning();
    if (deleted) return res.json({ success: true, message: "Contact deleted" });
    return res.status(404).json({ success: false, message: "Contact not found" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error deleting contact" });
  }
});

export default router;

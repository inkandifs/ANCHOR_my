import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/products", async (_req, res) => {
  try {
    const products = await db.select().from(productsTable).orderBy(desc(productsTable.id));
    return res.json({ success: true, products });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching products" });
  }
});

router.post("/products", async (req, res) => {
  try {
    const { code, name, category, unitPrice, costPrice, stockQuantity, status } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Product name is required" });
    }
    const productCode = code || `PRD-${Math.floor(1000 + Math.random() * 9000)}`;
    const [product] = await db
      .insert(productsTable)
      .values({
        code: productCode,
        name,
        category: category || "Goods",
        unitPrice: String(unitPrice || "0.00"),
        costPrice: String(costPrice || "0.00"),
        stockQuantity: Number(stockQuantity || 0),
        status: status || "In Stock"
      })
      .returning();

    return res.status(201).json({ success: true, product });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error creating product" });
  }
});

router.put("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db.update(productsTable).set(req.body).where(eq(productsTable.id, id)).returning();
    if (updated) return res.json({ success: true, product: updated });
    return res.status(404).json({ success: false, message: "Product not found" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error updating product" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [deleted] = await db.delete(productsTable).where(eq(productsTable.id, id)).returning();
    if (deleted) return res.json({ success: true, message: "Product deleted" });
    return res.status(404).json({ success: false, message: "Product not found" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error deleting product" });
  }
});

export default router;

import { Router, type IRouter } from "express";
import { memoryStore, saveStore } from "../lib/store";

const router: IRouter = Router();

router.get("/products", (_req, res) => {
  res.json({ success: true, products: memoryStore.products });
});

router.post("/products", (req, res) => {
  const { code, name, category, unitPrice, costPrice, stockQuantity, status } = req.body;
  const newProduct = {
    id: memoryStore.products.length ? Math.max(...memoryStore.products.map((p: any) => p.id)) + 1 : 1,
    code: code || `PRD-${String(Date.now()).slice(-4)}`,
    name: name || "New Product",
    category: category || "Goods",
    unitPrice: String(unitPrice || "0.00"),
    costPrice: String(costPrice || "0.00"),
    stockQuantity: Number(stockQuantity || 0),
    status: status || "In Stock"
  };
  memoryStore.products.unshift(newProduct);
  saveStore();
  res.status(201).json({ success: true, product: newProduct });
});

router.put("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = memoryStore.products.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    memoryStore.products[index] = { ...memoryStore.products[index], ...req.body };
    saveStore();
    return res.json({ success: true, product: memoryStore.products[index] });
  }
  return res.status(404).json({ success: false, message: "Product not found" });
});

router.delete("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = memoryStore.products.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    memoryStore.products.splice(index, 1);
    saveStore();
    return res.json({ success: true, message: "Product deleted" });
  }
  return res.status(404).json({ success: false, message: "Product not found" });
});

export default router;

import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, productsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { CreateCategoryBody } from "@workspace/api-zod";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const categories = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
    const counts = await db
      .select({ categoryId: productsTable.categoryId, count: count() })
      .from(productsTable)
      .groupBy(productsTable.categoryId);

    const countMap = new Map(counts.map(c => [c.categoryId, Number(c.count)]));

    const result = categories.map(c => ({
      ...c,
      productCount: countMap.get(c.id) ?? 0,
    }));

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: "Bad request", message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreateCategoryBody.parse(req.body);
    const [category] = await db.insert(categoriesTable).values(body).returning();
    res.status(201).json({ ...category, productCount: 0 });
  } catch (err: any) {
    res.status(400).json({ error: "Bad request", message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const body = CreateCategoryBody.parse(req.body);
    const [category] = await db.update(categoriesTable)
      .set(body)
      .where(eq(categoriesTable.id, id))
      .returning();
    if (!category) return res.status(404).json({ error: "Category not found" });
    
    // Assume product count doesn't change on edit
    const [{ count }] = await db
      .select({ count: count() })
      .from(productsTable)
      .where(eq(productsTable.categoryId, id));
      
    res.json({ ...category, productCount: Number(count) });
  } catch (err: any) {
    res.status(400).json({ error: "Bad request", message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const [category] = await db.delete(categoriesTable)
      .where(eq(categoriesTable.id, id))
      .returning();
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json({ success: true, message: "Category deleted" });
  } catch (err: any) {
    res.status(400).json({ error: "Bad request", message: err.message });
  }
});

export default router;

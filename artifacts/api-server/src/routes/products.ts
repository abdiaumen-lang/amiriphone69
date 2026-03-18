import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable } from "@workspace/db";
import { reviewsTable } from "@workspace/db";
import { eq, ilike, gte, lte, and, sql, count, avg } from "drizzle-orm";
import { CreateProductBody, ListProductsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const query = ListProductsQueryParams.parse(req.query);
    const { category, search, minPrice, maxPrice, featured, onSale, limit = 20, offset = 0 } = query;

    const conditions: any[] = [];
    if (category) {
      const cat = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, category)).limit(1);
      if (cat.length > 0) {
        conditions.push(eq(productsTable.categoryId, cat[0].id));
      }
    }
    if (search) {
      conditions.push(ilike(productsTable.name, `%${search}%`));
    }
    if (minPrice !== undefined) {
      conditions.push(gte(productsTable.price, String(minPrice)));
    }
    if (maxPrice !== undefined) {
      conditions.push(lte(productsTable.price, String(maxPrice)));
    }
    if (featured !== undefined) {
      conditions.push(eq(productsTable.featured, featured));
    }
    if (onSale !== undefined) {
      conditions.push(eq(productsTable.onSale, onSale));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const products = await db
      .select()
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(productsTable.createdAt);

    const totalResult = await db
      .select({ count: count() })
      .from(productsTable)
      .where(whereClause);
    const total = totalResult[0]?.count ?? 0;

    const productIds = products.map(p => p.products.id);
    const reviewStats = productIds.length > 0
      ? await db
          .select({
            productId: reviewsTable.productId,
            avgRating: avg(reviewsTable.rating),
            reviewCount: count(),
          })
          .from(reviewsTable)
          .where(sql`${reviewsTable.productId} = ANY(${sql.raw(`ARRAY[${productIds.join(",")}]`)}::int[])`)
          .groupBy(reviewsTable.productId)
      : [];

    const statsMap = new Map(reviewStats.map(r => [r.productId, r]));

    const formattedProducts = products.map(({ products: p, categories: c }) => {
      const stats = statsMap.get(p.id);
      return {
        id: p.id,
        name: p.name,
        nameAr: p.nameAr,
        nameFr: p.nameFr,
        description: p.description,
        descriptionAr: p.descriptionAr,
        descriptionFr: p.descriptionFr,
        price: Number(p.price),
        originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
        images: p.images || [],
        categoryId: p.categoryId,
        category: c ? {
          id: c.id, name: c.name, nameAr: c.nameAr, nameFr: c.nameFr,
          slug: c.slug, icon: c.icon, productCount: 0
        } : null,
        stock: p.stock,
        featured: p.featured,
        onSale: p.onSale,
        discount: p.discount ? Number(p.discount) : null,
        brand: p.brand,
        model: p.model,
        specs: p.specs,
        averageRating: stats?.avgRating ? Number(stats.avgRating) : null,
        reviewCount: Number(stats?.reviewCount ?? 0),
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

    res.json({ products: formattedProducts, total: Number(total), limit, offset });
  } catch (err: any) {
    res.status(400).json({ error: "Bad request", message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db
      .select()
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.id, id))
      .limit(1);

    if (!result.length) {
      return res.status(404).json({ error: "Not found", message: "Product not found" });
    }

    const { products: p, categories: c } = result[0];
    const stats = await db
      .select({ avgRating: avg(reviewsTable.rating), reviewCount: count() })
      .from(reviewsTable)
      .where(eq(reviewsTable.productId, id));

    const product = {
      id: p.id,
      name: p.name,
      nameAr: p.nameAr,
      nameFr: p.nameFr,
      description: p.description,
      descriptionAr: p.descriptionAr,
      descriptionFr: p.descriptionFr,
      price: Number(p.price),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
      images: p.images || [],
      categoryId: p.categoryId,
      category: c ? {
        id: c.id, name: c.name, nameAr: c.nameAr, nameFr: c.nameFr,
        slug: c.slug, icon: c.icon, productCount: 0
      } : null,
      stock: p.stock,
      featured: p.featured,
      onSale: p.onSale,
      discount: p.discount ? Number(p.discount) : null,
      brand: p.brand,
      model: p.model,
      specs: p.specs,
      averageRating: stats[0]?.avgRating ? Number(stats[0].avgRating) : null,
      reviewCount: Number(stats[0]?.reviewCount ?? 0),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };

    res.json(product);
  } catch (err: any) {
    res.status(400).json({ error: "Bad request", message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreateProductBody.parse(req.body);
    const [product] = await db.insert(productsTable).values({
      ...body,
      price: String(body.price),
      originalPrice: body.originalPrice ? String(body.originalPrice) : null,
      discount: body.discount ? String(body.discount) : null,
      images: body.images || [],
      featured: body.featured ?? false,
      onSale: body.onSale ?? false,
    }).returning();

    res.status(201).json({
      ...product,
      price: Number(product.price),
      originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
      discount: product.discount ? Number(product.discount) : null,
      reviewCount: 0,
    });
  } catch (err: any) {
    res.status(400).json({ error: "Bad request", message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = CreateProductBody.parse(req.body);
    const [product] = await db.update(productsTable)
      .set({
        ...body,
        price: String(body.price),
        originalPrice: body.originalPrice ? String(body.originalPrice) : null,
        discount: body.discount ? String(body.discount) : null,
        images: body.images || [],
        featured: body.featured ?? false,
        onSale: body.onSale ?? false,
        updatedAt: new Date(),
      })
      .where(eq(productsTable.id, id))
      .returning();

    if (!product) {
      return res.status(404).json({ error: "Not found", message: "Product not found" });
    }

    res.json({
      ...product,
      price: Number(product.price),
      originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
      discount: product.discount ? Number(product.discount) : null,
      reviewCount: 0,
    });
  } catch (err: any) {
    res.status(400).json({ error: "Bad request", message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.json({ success: true, message: "Product deleted" });
  } catch (err: any) {
    res.status(400).json({ error: "Bad request", message: err.message });
  }
});

export default router;

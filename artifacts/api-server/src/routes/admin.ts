import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, productsTable } from "@workspace/db";
import { eq, count, sum, desc, gte, sql } from "drizzle-orm";
import { AdminLoginBody } from "@workspace/api-zod";
import jwt from "jsonwebtoken";

const router = Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "amiri2024";
const JWT_SECRET = process.env.JWT_SECRET ?? "amiri-phone-secret-2024";

router.post("/login", async (req, res) => {
  try {
    const body = AdminLoginBody.parse(req.body);

    if (body.username !== ADMIN_USERNAME || body.password !== ADMIN_PASSWORD) {
      res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ username: body.username, role: "admin" }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, username: body.username });
  } catch (err: any) {
    res.status(400).json({ error: "Bad request", message: err.message });
  }
});

router.get("/stats", async (_req, res) => {
  try {
    const [totalOrdersResult] = await db.select({ count: count() }).from(ordersTable);
    const [totalRevenueResult] = await db
      .select({ sum: sum(ordersTable.total) })
      .from(ordersTable)
      .where(eq(ordersTable.status, "delivered"));

    const [pendingResult] = await db
      .select({ count: count() })
      .from(ordersTable)
      .where(eq(ordersTable.status, "pending"));

    const [deliveredResult] = await db
      .select({ count: count() })
      .from(ordersTable)
      .where(eq(ordersTable.status, "delivered"));

    const [totalProductsResult] = await db.select({ count: count() }).from(productsTable);

    const lowStockProducts = await db
      .select({ count: count() })
      .from(productsTable)
      .where(sql`${productsTable.stock} < 5`);

    const recentOrders = await db
      .select()
      .from(ordersTable)
      .orderBy(desc(ordersTable.createdAt))
      .limit(10);

    const recentOrderIds = recentOrders.map(o => o.id);
    const recentItems = recentOrderIds.length > 0
      ? await db.select().from(orderItemsTable)
          .where(sql`${orderItemsTable.orderId} = ANY(ARRAY[${sql.join(recentOrderIds.map(id => sql`${id}`), sql`, `)}]::int[])`)
      : [];
    const itemsMap = new Map<number, typeof recentItems>();
    for (const item of recentItems) {
      if (!itemsMap.has(item.orderId)) itemsMap.set(item.orderId, []);
      itemsMap.get(item.orderId)!.push(item);
    }

    const ordersByStatus = await db
      .select({ status: ordersTable.status, count: count() })
      .from(ordersTable)
      .groupBy(ordersTable.status);

    const ordersByWilaya = await db
      .select({
        wilaya: ordersTable.wilayaName,
        count: count(),
        revenue: sum(ordersTable.total),
      })
      .from(ordersTable)
      .groupBy(ordersTable.wilayaName)
      .orderBy(desc(count()))
      .limit(10);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailySalesRaw = await db
      .select({
        date: sql<string>`DATE(${ordersTable.createdAt})`,
        orders: count(),
        revenue: sum(ordersTable.total),
      })
      .from(ordersTable)
      .where(gte(ordersTable.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${ordersTable.createdAt})`)
      .orderBy(sql`DATE(${ordersTable.createdAt})`);

    res.json({
      totalOrders: Number(totalOrdersResult.count),
      totalRevenue: Number(totalRevenueResult.sum ?? 0),
      pendingOrders: Number(pendingResult.count),
      deliveredOrders: Number(deliveredResult.count),
      totalProducts: Number(totalProductsResult.count),
      lowStockProducts: Number(lowStockProducts[0]?.count ?? 0),
      recentOrders: recentOrders.map(o => ({
        ...o,
        subtotal: Number(o.subtotal),
        shippingCost: Number(o.shippingCost),
        total: Number(o.total),
        items: (itemsMap.get(o.id) ?? []).map(i => ({
          ...i, price: Number(i.price), total: Number(i.total),
        })),
      })),
      ordersByStatus: ordersByStatus.map(s => ({ status: s.status, count: Number(s.count) })),
      ordersByWilaya: ordersByWilaya.map(w => ({
        wilaya: w.wilaya,
        count: Number(w.count),
        revenue: Number(w.revenue ?? 0),
      })),
      dailySales: dailySalesRaw.map(d => ({
        date: d.date,
        orders: Number(d.orders),
        revenue: Number(d.revenue ?? 0),
      })),
    });
  } catch (err: any) {
    res.status(400).json({ error: "Bad request", message: err.message });
  }
});

export default router;

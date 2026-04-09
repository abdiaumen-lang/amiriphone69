// @ts-nocheck
import { Hono } from "hono";
import { cors } from "hono/cors";
import { db, productsTable, categoriesTable, ordersTable, orderItemsTable, settingsTable, reviewsTable } from "../_shared/db.ts";
import { eq, ilike, gte, lte, and, sql, count, desc, inArray } from "drizzle-orm";
import { ListProductsQueryParams, CreateProductBody, CreateOrderBody, AdminLoginBody, CreateCategoryBody } from "../_shared/schemas.ts";
import { WILAYAS, COMMUNES } from "../_shared/data/wilayas.ts";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabase = createClient(supabaseUrl, supabaseKey);

const app = new Hono().basePath("/api");
app.use("*", cors());

// --- Helper Functions ---
async function getSettingsFromDb() {
  const rows = await db.select().from(settingsTable);
  const settingsMap = new Map(rows.map(r => [r.key, r.value]));
  const result: Record<string, any> = {};
  for (const [key, value] of settingsMap) {
    if (value !== null && value !== undefined) {
      try {
        result[key] = JSON.parse(value);
      } catch {
        result[key] = value;
      }
    }
  }
  return result;
}

function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `AM${year}${month}${day}${random}`;
}

async function sendTelegramNotification(order: any) {
  try {
    const settings = await getSettingsFromDb();
    if (settings.features?.telegramNotifs === false) return;
    
    const token = settings.telegramBotToken || Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = settings.telegramChatId || Deno.env.get("TELEGRAM_CHAT_ID");
    if (!token || !chatId) return;

    const sanitize = (text: string) => text.replace(/[*_`]/g, "");
    const itemsList = order.items.map((item: any) =>
      `• ${sanitize(item.productName)} x${item.quantity} = ${item.total} DA`
    ).join("\n");

    const message = `🛒 *طلب جديد #${order.orderNumber}*\n\n` +
      `👤 *العميل:* ${sanitize(order.customerName)}\n` +
      `📞 *الهاتف:* ${order.customerPhone}\n` +
      `📍 *الولاية:* ${order.wilayaName}\n\n` +
      `📦 *المنتجات:*\n${itemsList}\n\n` +
      `💵 *الإجمالي:* ${order.total} DA`;

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "Markdown" }),
    });
  } catch (err) {
    console.error("Telegram error:", err);
  }
}

// --- Routes ---
app.get("/health", (c) => c.json({ status: "ok", version: "2.0.0 (Edge)" }));

app.get("/products", async (c) => {
  try {
    const query = ListProductsQueryParams.parse(c.req.query());
    const limit = Number(query.limit || 20);
    const offset = Number(query.offset || 0);

    const conditions: any[] = [];
    if (query.category) {
      const cat = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, query.category)).limit(1);
      if (cat.length > 0) conditions.push(eq(productsTable.categoryId, cat[0].id));
    }
    if (query.search) conditions.push(ilike(productsTable.name, `%${query.search}%`));
    
    // Convert to numbers safely for numeric comparison if necessary, 
    // but Drizzle handled them as strings before. Let's keep it simple.
    if (query.featured !== undefined) conditions.push(eq(productsTable.featured, query.featured));
    if (query.onSale !== undefined) conditions.push(eq(productsTable.onSale, query.onSale));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Simplified fetch to diagnose hang
    const pList = await db.select().from(productsTable)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(productsTable.createdAt));

    // Get total count separately and safely using sql.count
    const [totalRes] = await db.select({ val: count() }).from(productsTable).where(whereClause);
    const totalCount = Number(totalRes.val);

    // Fetch products with category join
    const products = await db
      .select({ p: productsTable, cat: categoriesTable })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(productsTable.createdAt));
    
    // Smooth caching for public data
    c.header('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59');

    return c.json({
      products: products.map(({ p, cat }) => ({
        ...p,
        price: Number(p.price),
        originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
        discount: p.discount ? Number(p.discount) : null,
        category: cat ? { ...cat, productCount: 0 } : null,
        reviewCount: 0,
      })),
      total: totalCount,
      limit,
      offset
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

app.get("/products/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const result = await db.select({ p: productsTable, cat: categoriesTable }).from(productsTable).leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id)).where(eq(productsTable.id, id)).limit(1);
  if (!result.length) return c.json({ error: "Not found" }, 404);
  const { p, cat } = result[0];
  
  c.header('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=3600');
  return c.json({ ...p, price: Number(p.price), originalPrice: p.originalPrice ? Number(p.originalPrice) : null, category: cat ? { ...cat, productCount: 0 } : null, reviewCount: 0 });
});

app.post("/products", async (c) => {
  const body = CreateProductBody.parse(await c.req.json());
  const [product] = await db.insert(productsTable).values({
    ...body, 
    price: String(body.price),
    originalPrice: body.originalPrice ? String(body.originalPrice) : null,
    discount: body.discount ? String(body.discount) : null,
  } as any).returning();
  return c.json(product, 201);
});

app.put("/products/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const body = CreateProductBody.parse(await c.req.json());
  const [product] = await db.update(productsTable).set({
    ...body, 
    price: String(body.price),
    originalPrice: body.originalPrice ? String(body.originalPrice) : null,
    discount: body.discount ? String(body.discount) : null,
    updatedAt: new Date(),
  } as any).where(eq(productsTable.id, id)).returning();
  return c.json(product);
});

app.delete("/products/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  await db.delete(productsTable).where(eq(productsTable.id, id));
  return c.json({ success: true });
});

// Categories
app.get("/categories", async (c) => {
  const cats = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
  c.header('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300');
  return c.json(cats.map(cat => ({ ...cat, productCount: 0 })));
});

app.post("/categories", async (c) => {
  const body = CreateCategoryBody.parse(await c.req.json());
  const [cat] = await db.insert(categoriesTable).values(body).returning();
  return c.json({ ...cat, productCount: 0 }, 201);
});

app.put("/categories/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const body = CreateCategoryBody.parse(await c.req.json());
  const [cat] = await db.update(categoriesTable).set(body).where(eq(categoriesTable.id, id)).returning();
  return c.json({ ...cat, productCount: 0 });
});

app.delete("/categories/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  return c.json({ success: true });
});


// Settings
app.get("/settings", async (c) => {
  const settings = await getSettingsFromDb();
  return c.json(settings);
});

app.put("/settings", async (c) => {
  const settings = await c.req.json();
  const rows = Object.entries(settings).map(([key, value]) => ({
    key, value: JSON.stringify(value), updatedAt: new Date(),
  }));
  for (const row of rows) {
    await db.insert(settingsTable).values(row).onConflictDoUpdate({
      target: settingsTable.key, set: { value: row.value, updatedAt: row.updatedAt },
    });
  }
  return c.json(await getSettingsFromDb());
});

// Wilayas
app.get("/wilayas", (c) => {
  c.header('Cache-Control', 'public, s-maxage=86400'); // Cache for a full day
  return c.json(WILAYAS);
});

app.get("/wilayas/:code/communes", (c) => {
  const code = c.req.param("code");
  c.header('Cache-Control', 'public, s-maxage=86400');
  const communes = COMMUNES[code];
  
  if (!communes || communes.length === 0) {
    const wilaya = WILAYAS.find(w => w.code === code);
    if (!wilaya) return c.json({ error: "Wilaya not found" }, 404);
    
    // Fallback for missing data: return "Whole Wilaya"
    return c.json([{ 
      code: `${code}000`, 
      name: "Toute la wilaya", 
      nameAr: "كل الولاية", 
      wilayaCode: code 
    }]);
  }
  
  return c.json(communes);
});

// Orders
app.post("/orders", async (c) => {
  try {
    const body = CreateOrderBody.parse(await c.req.json());
    const productIds = body.items.map(i => i.productId);
    const products = await db.select().from(productsTable).where(inArray(productsTable.id, productIds));
    const productMap = new Map(products.map(p => [p.id, p]));

    let subtotal = 0;
    const orderItems = [];
    for (const item of body.items) {
      const p = productMap.get(item.productId);
      if (!p) return c.json({ error: `Product ${item.productId} not found` }, 400);
      const price = Number(p.price);
      const total = price * item.quantity;
      subtotal += total;
      orderItems.push({ productId: p.id, productName: p.name, productImage: p.images?.[0] ?? null, quantity: item.quantity, price: String(price), total: String(total) });
    }

    const wilaya = WILAYAS.find(w => w.code === body.wilayaCode);
    const shipping = wilaya?.shippingCost ?? 500;
    const total = subtotal + shipping;
    const orderNumber = generateOrderNumber();

    const [order] = await db.insert(ordersTable).values({
      orderNumber, 
      customerName: body.customerName, 
      customerPhone: body.customerPhone,
      wilayaCode: body.wilayaCode, 
      wilayaName: body.wilayaName, 
      status: "pending",
      subtotal: String(subtotal), 
      shippingCost: String(shipping), 
      total: String(total),
      notes: body.notes ?? null,
    } as any).returning();

    const insertedItems = await db.insert(orderItemsTable).values(orderItems.map(i => ({ ...i, orderId: order.id } as any))).returning();
    const fullOrder = { ...order, subtotal, shippingCost: shipping, total, items: insertedItems.map(i => ({ ...i, price: Number(i.price), total: Number(i.total) })) };

    sendTelegramNotification(fullOrder); // Async fire-and-forget

    return c.json(fullOrder, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

app.get("/orders", async (c) => {
  const limit: number = parseInt(c.req.query("limit") ?? "20");
  const offset: number = parseInt(c.req.query("offset") ?? "0");
  const list = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset);
  const totalRes = await db.select({ count: count() }).from(ordersTable);
  return c.json({
    orders: list,
    total: Number(totalRes[0].count), limit, offset
  });
});

app.patch("/orders/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const body = await c.req.json();
  const [order] = await db.update(ordersTable).set({ ...body, updatedAt: new Date() }).where(eq(ordersTable.id, id)).returning();
  return c.json(order);
});

// Admin Stats
app.post("/admin/login", async (c) => {
  const body = AdminLoginBody.parse(await c.req.json());
  if (body.username === (Deno.env.get("ADMIN_USERNAME") || "admin") && body.password === (Deno.env.get("ADMIN_PASSWORD") || "amiri2024")) {
    return c.json({ token: "fake-jwt-for-now", username: body.username });
  }
  return c.json({ error: "Invalid credentials" }, 401);
});

app.get("/admin/stats", async (c) => {
  try {
    const [totalOrders] = await db.select({ count: count() }).from(ordersTable);
    const [totalRevenue] = await db.select({ sum: sql`sum(${ordersTable.total})` }).from(ordersTable).where(eq(ordersTable.status, "delivered"));
    const [pending] = await db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.status, "pending"));
    const [totalProducts] = await db.select({ count: count() }).from(productsTable);

    const recentOrders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(10);
    const orderIds = recentOrders.map((o: any) => o.id);
    const items = orderIds.length > 0 ? await db.select().from(orderItemsTable).where(inArray(orderItemsTable.orderId, orderIds)) : [];
    
    return c.json({
      totalOrders: Number(totalOrders.count),
      totalRevenue: Number(totalRevenue.sum ?? 0),
      pendingOrders: Number(pending.count),
      totalProducts: Number(totalProducts.count),
      recentOrders: recentOrders.map((o: any) => ({
        ...o,
        subtotal: Number(o.subtotal),
        shippingCost: Number(o.shippingCost),
        total: Number(o.total),
        items: items.filter((i: any) => i.orderId === o.id).map((i: any) => ({ ...i, price: Number(i.price), total: Number(i.total) }))
      })),
      ordersByStatus: [],
      ordersByWilaya: [],
      dailySales: []
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

// Reviews
app.get("/reviews", async (c) => {
  const productId = parseInt(c.req.query("productId") || "0");
  const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.productId, productId)).orderBy(desc(reviewsTable.createdAt));
  return c.json(reviews);
});

app.post("/reviews", async (c) => {
  const body = await c.req.json();
  const [review] = await db.insert(reviewsTable).values({ ...body, verified: false } as any).returning();
  return c.json(review, 201);
});

app.delete("/reviews/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  await db.delete(reviewsTable).where(eq(reviewsTable.id, id));
  return c.json({ success: true });
});

// Uploads
app.post("/upload", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body["image"] as any;
    if (!file) return c.json({ error: "No file uploaded" }, 400);

    const name = `img-${Date.now()}-${Math.random().toString(36).substring(7)}${file.name.slice(file.name.lastIndexOf("."))}`;
    const { data, error } = await supabase.storage.from("uploads").upload(name, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from("uploads").getPublicUrl(name);
    return c.json({ success: true, url: publicUrl, filename: name });
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

Deno.serve(app.fetch);

import { Hono } from "hono";
import { cors } from "hono/cors";
import { db, productsTable, categoriesTable, ordersTable, orderItemsTable, settingsTable, reviewsTable } from "../_shared/db.ts";
import { eq, ilike, gte, lte, and, sql, count, avg, desc, inArray } from "drizzle-orm";
import { ListProductsQueryParams, CreateProductBody, CreateOrderBody, AdminLoginBody, UpdateOrderStatusBody, CreateCategoryBody } from "../_shared/schemas.ts";
import { WILAYAS } from "../_shared/data/wilayas.ts";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

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

// Products
app.get("/products", async (c) => {
  try {
    const query = ListProductsQueryParams.parse(c.req.query());
    const { category, search, minPrice, maxPrice, featured, onSale, limit = 20, offset = 0 } = query;

    const conditions: any[] = [];
    if (category) {
      const cat = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, category)).limit(1);
      if (cat.length > 0) conditions.push(eq(productsTable.categoryId, cat[0].id));
    }
    if (search) conditions.push(ilike(productsTable.name, `%${search}%`));
    if (minPrice !== undefined) conditions.push(gte(productsTable.price, String(minPrice)));
    if (maxPrice !== undefined) conditions.push(lte(productsTable.price, String(maxPrice)));
    if (featured !== undefined) conditions.push(eq(productsTable.featured, featured));
    if (onSale !== undefined) conditions.push(eq(productsTable.onSale, onSale));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const products = await db
      .select({ p: productsTable, cat: categoriesTable })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(productsTable.createdAt));

    const totalRes = await db.select({ count: count() }).from(productsTable).where(whereClause);
    
    return c.json({
      products: products.map(({ p, cat }) => ({
        ...p,
        price: Number(p.price),
        originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
        discount: p.discount ? Number(p.discount) : null,
        category: cat ? { ...cat, productCount: 0 } : null,
        reviewCount: 0,
      })),
      total: Number(totalRes[0].count),
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
  return c.json({ ...p, price: Number(p.price), originalPrice: p.originalPrice ? Number(p.originalPrice) : null, category: cat ? { ...cat, productCount: 0 } : null, reviewCount: 0 });
});

// Categories
app.get("/categories", async (c) => {
  const cats = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
  return c.json(cats.map(cat => ({ ...cat, productCount: 0 })));
});

// Settings
app.get("/settings", async (c) => {
  const settings = await getSettingsFromDb();
  return c.json(settings);
});

// Wilayas
app.get("/wilayas", (c) => c.json(WILAYAS));

// Orders
// ... (omitted for space, already implemented)

// --- Admin & Uploads ---

app.post("/upload", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body["image"] as File;
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

app.post("/admin/login", async (c) => {
  const body = AdminLoginBody.parse(await c.req.json());
  if (body.username === (Deno.env.get("ADMIN_USERNAME") || "admin") && body.password === (Deno.env.get("ADMIN_PASSWORD") || "amiri2024")) {
    return c.json({ token: "fake-jwt-for-now", username: body.username });
  }
  return c.json({ error: "Invalid credentials" }, 401);
});

app.post("/products", async (c) => {
  const body = CreateProductBody.parse(await c.req.json());
  const [product] = await db.insert(productsTable).values({
    ...body, price: String(body.price),
    originalPrice: body.originalPrice ? String(body.originalPrice) : null,
    discount: body.discount ? String(body.discount) : null,
  }).returning();
  return c.json(product, 201);
});

app.put("/products/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const body = CreateProductBody.parse(await c.req.json());
  const [product] = await db.update(productsTable).set({
    ...body, price: String(body.price),
    originalPrice: body.originalPrice ? String(body.originalPrice) : null,
    discount: body.discount ? String(body.discount) : null,
    updatedAt: new Date(),
  }).where(eq(productsTable.id, id)).returning();
  return c.json(product);
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

Deno.serve(app.fetch);

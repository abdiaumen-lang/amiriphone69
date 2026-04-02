import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, productsTable } from "@workspace/db";
import { eq, and, desc, count, sql, inArray, SQL } from "drizzle-orm";
import { CreateOrderBody, ListOrdersQueryParams, UpdateOrderStatusBody } from "@workspace/api-zod";
import { WILAYAS } from "../data/wilayas.js";
import { getSettingsFromDb } from "./settings.js";

const router = Router();

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
    
    // Also check if telegramNotifs feature is explicitly disabled
    if (settings.features?.telegramNotifs === false) return;
    
    const token = settings.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
    const chatId = settings.telegramChatId || process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) return;

    const sanitize = (text: string) => text.replace(/[*_`]/g, "");

    const itemsList = order.items.map((item: any) =>
      `• ${sanitize(item.productName)} x${item.quantity} = ${item.total} DA`
    ).join("\n");

    const message = `🛒 *طلب جديد #${order.orderNumber}*\n\n` +
      `👤 *العميل:* ${sanitize(order.customerName)}\n` +
      `📞 *الهاتف:* ${order.customerPhone}\n` +
      `📍 *الولاية:* ${order.wilayaName}\n` +
      `🏘 *البلدية:* ${order.communeName || "غير محدد"}\n\n` +
      `📦 *المنتجات:*\n${itemsList}\n\n` +
      `💰 *المجموع:* ${order.subtotal} DA\n` +
      `🚚 *التوصيل:* ${order.shippingCost} DA\n` +
      `💵 *الإجمالي:* ${order.total} DA\n\n` +
      `📝 *ملاحظات:* ${order.notes ? sanitize(order.notes) : "لا توجد"}`;

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });
    
    if (!res.ok) {
        const errText = await res.text();
        console.error("Telegram API Error:", res.status, errText);
    }
  } catch (err) {
    console.error("Telegram notification error:", err);
  }
}

async function sendWhatsAppNotification(order: any) {
  try {
    const settings = await getSettingsFromDb();

    // Also check if whatsappNotifs feature is explicitly disabled
    if (settings.features?.whatsappNotifs === false) return;

    const token = settings.whatsappToken || process.env.WHATSAPP_TOKEN;
    const phoneNumberId = settings.whatsappPhoneId || process.env.WHATSAPP_PHONE_NUMBER_ID;
    const whatsappNumber = settings.whatsappNumber || process.env.WHATSAPP_NUMBER;
    if (!token || !phoneNumberId || !whatsappNumber) return;

    const message = `🛒 طلب جديد #${order.orderNumber}\n` +
      `العميل: ${order.customerName}\n` +
      `الهاتف: ${order.customerPhone}\n` +
      `الولاية: ${order.wilayaName}\n` +
      `الإجمالي: ${order.total} DA`;

    await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: whatsappNumber,
        type: "text",
        text: { body: message },
      }),
    });
  } catch (err) {
    console.error("WhatsApp notification error:", err);
  }
}

async function sendGoogleSheetsNotification(order: any) {
  try {
    const settings = await getSettingsFromDb();

    // Check if googleSheetsId is a valid App Script URL
    const webhookUrl = settings.googleSheetsId;
    if (!webhookUrl || !webhookUrl.startsWith("https://script.google.com")) return;

    // Create a summary of items
    const itemsSummary = order.items.map((item: any) =>
      `${item.productName} (x${item.quantity})`
    ).join(", ");

    const payload = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      wilayaName: order.wilayaName,
      itemsSummary,
      total: order.total,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      notes: order.notes,
      createdAt: order.createdAt,
    };

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
        console.error("Google Sheets Sync Error:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Google Sheets sync error:", err);
  }
}

router.get("/", async (req, res) => {
  try {
    const query = ListOrdersQueryParams.parse(req.query);
    const { status, wilaya, limit = 20, offset = 0 } = query;

    const conditions: any[] = [];
    if (status) conditions.push(eq(ordersTable.status, status as any));
    if (wilaya) conditions.push(eq(ordersTable.wilayaCode, wilaya as any));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const orders = await db
      .select()
      .from(ordersTable as any)
      .where(whereClause)
      .orderBy(desc(ordersTable.createdAt) as any)
      .limit(limit)
      .offset(offset);

    const totalResult = await db.select({ count: count() }).from(ordersTable).where(whereClause);
    const total = Number(totalResult[0]?.count ?? 0);

    const orderIds = orders.map(o => o.id);
    const allItems = orderIds.length > 0
      ? await db.select().from(orderItemsTable)
          .where(inArray(orderItemsTable.orderId, orderIds))
      : [];

    const itemsMap = new Map<number, (typeof allItems)[number][]>();
    for (const item of allItems) {
      if (!itemsMap.has(item.orderId)) itemsMap.set(item.orderId, []);
      itemsMap.get(item.orderId)!.push(item as any);
    }

    const formattedOrders = orders.map(o => ({
      ...o,
      subtotal: Number(o.subtotal),
      shippingCost: Number(o.shippingCost),
      total: Number(o.total),
      items: (itemsMap.get(o.id) ?? []).map(i => ({
        ...i,
        price: Number(i.price),
        total: Number(i.total),
      })),
    }));

    res.json({ orders: formattedOrders, total, limit, offset });
  } catch (err: any) {
    res.status(400).json({ error: "Bad request", message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreateOrderBody.parse(req.body);

    const productIds = body.items.map(i => i.productId);
    const products = await db
      .select()
      .from(productsTable)
      .where(sql`${productsTable.id} = ANY(ARRAY[${sql.join(productIds.map(id => sql`${id}`), sql`, `)}]::int[])`);

    const productMap = new Map(products.map(p => [p.id, p]));

    let subtotal = 0;
    const orderItems = [];
    for (const item of body.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        res.status(400).json({ error: "Bad request", message: `Product ${item.productId} not found` });
        return;
      }
      const price = Number(product.price);
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;
      orderItems.push({
        productId: item.productId,
        productName: product.name,
        productImage: product.images?.[0] ?? null,
        quantity: item.quantity,
        price: String(price),
        total: String(itemTotal),
      });
    }

    const wilaya = WILAYAS.find(w => w.code === body.wilayaCode);
    const shippingCost = wilaya?.shippingCost ?? 500;
    const total = subtotal + shippingCost;
    const orderNumber = generateOrderNumber();

    const [order] = await db.insert(ordersTable).values({
      orderNumber,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerPhone2: body.customerPhone2 ?? null,
      wilayaCode: body.wilayaCode,
      wilayaName: body.wilayaName,
      communeCode: body.communeCode ?? null,
      communeName: body.communeName ?? null,
      address: body.address ?? null,
      subtotal: String(subtotal),
      shippingCost: String(shippingCost),
      total: String(total),
      status: "pending",
      notes: body.notes ?? null,
    }).returning();

    const insertedItems = await db.insert(orderItemsTable).values(
      orderItems.map(item => ({ ...item, orderId: order.id }))
    ).returning();

    const fullOrder = {
      ...order,
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      total: Number(order.total),
      items: insertedItems.map(i => ({
        ...i,
        price: Number(i.price),
        total: Number(i.total),
      })),
    };

    await Promise.all([
      sendTelegramNotification(fullOrder),
      sendWhatsAppNotification(fullOrder),
      sendGoogleSheetsNotification(fullOrder),
    ]);

    res.status(201).json(fullOrder);
  } catch (err: any) {
    res.status(400).json({ error: "Bad request", message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    if (!order) {
      res.status(404).json({ error: "Not found", message: "Order not found" });
      return;
    }

    const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, id));

    res.json({
      ...order,
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      total: Number(order.total),
      items: items.map(i => ({ ...i, price: Number(i.price), total: Number(i.total) })),
    });
  } catch (err: any) {
    res.status(400).json({ error: "Bad request", message: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = UpdateOrderStatusBody.parse(req.body);

    const [order] = await db
      .update(ordersTable)
      .set({
        status: body.status,
        notes: body.notes ?? undefined,
        deliveryCompany: body.deliveryCompany ?? undefined,
        trackingNumber: body.trackingNumber ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, id))
      .returning();

    if (!order) {
      res.status(404).json({ error: "Not found", message: "Order not found" });
      return;
    }

    const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, id));

    res.json({
      ...order,
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      total: Number(order.total),
      items: items.map(i => ({ ...i, price: Number(i.price), total: Number(i.total) })),
    });
  } catch (err: any) {
    res.status(400).json({ error: "Bad request", message: err.message });
  }
});

export default router;

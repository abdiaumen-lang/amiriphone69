import { Router } from "express";
import { db } from "@workspace/db";
import { settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const DEFAULT_SETTINGS = {
  storeName: "Amiri Phone",
  storeNameAr: "أميري فون",
  storePhone: "0557325417",
  storePhone2: null,
  storeAddress: "89 Rue Mahmoud KHODJAT EL DJELD, Bir Mourad Raïs, Alger",
  storeAddressAr: "89 شارع محمود خوجة الجلد، بئر مراد رايس، الجزائر",
  storeLogo: null,
  primaryColor: "#007AFF",
  telegramBotToken: null,
  telegramChatId: null,
  whatsappNumber: "213557325417",
  facebookPixelId: null,
  tiktokPixelId: null,
  googleSheetsId: null,
  defaultShippingCost: 500,
  freeShippingThreshold: null,
  maintenanceMode: false,
  seoTitle: "Amiri Phone - Meilleurs Smartphones en Algérie",
  seoDescription: "Achetez les meilleurs smartphones iPhone, Samsung, Xiaomi au meilleur prix en Algérie. Livraison rapide, paiement à la livraison.",
};

async function getSettingsFromDb() {
  const rows = await db.select().from(settingsTable);
  const settingsMap = new Map(rows.map(r => [r.key, r.value]));

  const result: Record<string, any> = { ...DEFAULT_SETTINGS };
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

router.get("/", async (_req, res) => {
  try {
    const settings = await getSettingsFromDb();
    res.json(settings);
  } catch (err: any) {
    res.status(400).json({ error: "Bad request", message: err.message });
  }
});

router.put("/", async (req, res) => {
  try {
    const settings = req.body;
    const rows = Object.entries(settings).map(([key, value]) => ({
      key,
      value: JSON.stringify(value),
      updatedAt: new Date(),
    }));

    for (const row of rows) {
      await db
        .insert(settingsTable)
        .values(row)
        .onConflictDoUpdate({
          target: settingsTable.key,
          set: { value: row.value, updatedAt: row.updatedAt },
        });
    }

    const updatedSettings = await getSettingsFromDb();
    res.json(updatedSettings);
  } catch (err: any) {
    res.status(400).json({ error: "Bad request", message: err.message });
  }
});

export default router;

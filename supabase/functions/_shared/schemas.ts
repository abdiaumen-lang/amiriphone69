// @ts-nocheck
import * as zod from "npm:zod";

export const ListProductsQueryParams = zod.object({
  category: zod.coerce.string().optional(),
  search: zod.coerce.string().optional(),
  minPrice: zod.coerce.number().optional(),
  maxPrice: zod.coerce.number().optional(),
  featured: zod.coerce.boolean().optional(),
  onSale: zod.coerce.boolean().optional(),
  limit: zod.coerce.number().optional(),
  offset: zod.coerce.number().optional(),
});

export const CreateProductBody = zod.object({
  name: zod.string(),
  nameAr: zod.string().optional(),
  nameFr: zod.string().optional(),
  description: zod.string().optional(),
  descriptionAr: zod.string().optional(),
  descriptionFr: zod.string().optional(),
  price: zod.number(),
  originalPrice: zod.number().nullish(),
  images: zod.array(zod.string()),
  categoryId: zod.number().nullish(),
  stock: zod.number(),
  featured: zod.boolean().optional(),
  onSale: zod.boolean().optional(),
  discount: zod.number().nullish(),
  brand: zod.string().nullish(),
  model: zod.string().nullish(),
  specs: zod.record(zod.string(), zod.unknown()).nullish(),
  descriptionMedia: zod.array(zod.object({ type: zod.enum(["image", "video"]), url: zod.string() })).nullish(),
});

export const CreateCategoryBody = zod.object({
  name: zod.string(),
  nameAr: zod.string().optional(),
  nameFr: zod.string().optional(),
  slug: zod.string(),
  icon: zod.string().optional(),
});

export const CreateOrderBody = zod.object({
  customerName: zod.string(),
  customerPhone: zod.string(),
  customerPhone2: zod.string().optional(),
  wilayaCode: zod.string(),
  wilayaName: zod.string(),
  communeCode: zod.string().optional(),
  communeName: zod.string().optional(),
  address: zod.string().optional(),
  items: zod.array(
    zod.object({
      productId: zod.number(),
      quantity: zod.number(),
    }),
  ),
  notes: zod.string().optional(),
});

export const UpdateOrderStatusBody = zod.object({
  status: zod.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "returned",
    "cancelled",
  ]),
  notes: zod.string().optional(),
  deliveryCompany: zod.string().optional(),
  trackingNumber: zod.string().optional(),
});

export const AdminLoginBody = zod.object({
  username: zod.string(),
  password: zod.string(),
});

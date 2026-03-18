# Amiri Phone - Algeria Ecommerce

## Overview

متجر إلكتروني احترافي كامل لمتجر Amiri Phone لبيع الهواتف الذكية في الجزائر.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (port 8080 → /api)
│   ├── amiri-phone/        # React+Vite frontend (port 18251 → /)
│   └── mockup-sandbox/     # Design sandbox
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
│   └── src/seed.ts         # Database seeding script
```

## Store Info

- **Store Name**: Amiri Phone (أميري فون)
- **Location**: 89 Rue Mahmoud KHODJAT EL DJELD, Bir Mourad Raïs, Alger (inside MANTIZI)
- **Phone**: 0557 32 54 17
- **Hours**: Open daily until 23:30

## Admin Access

- URL: `/admin/login`
- Username: `admin`
- Password: `amiri2024`

## Features

### Frontend (React + Vite)
- **Home Page**: Hero section, featured products, categories, countdown timer, reviews
- **Products Page**: Product grid with filter (category, price) + search
- **Product Detail**: Images, specs, reviews, related products, countdown timer
- **Cart**: React Context, localStorage persistence, cart badge
- **Checkout**: Customer form + 48 Wilaya selector + Commune selector + COD only
- **Order Success**: Confirmation with order number
- **Admin Dashboard**: Login, stats, products CRUD, order management

### Backend (Express + PostgreSQL)
- **Products API**: CRUD with category filter, search, pagination
- **Categories API**: CRUD
- **Orders API**: Create orders, update status (pending/confirmed/shipped/delivered/returned)
- **Wilayas API**: 48 wilayas with shipping costs + communes
- **Reviews API**: Create/list reviews
- **Admin API**: Login (JWT), dashboard stats
- **Settings API**: Store settings management

### Algeria System
- 48 Wilayas with individual shipping costs
- Commune database for major wilayas
- Paiement à la livraison (COD) only
- Arabic + French UI support

### Integrations (via env vars)
- **Telegram Bot**: Order notifications via `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`
- **WhatsApp**: Order notifications via `WHATSAPP_TOKEN` + `WHATSAPP_PHONE_NUMBER_ID` + `WHATSAPP_NUMBER`
- **Facebook Pixel**: Configurable via admin settings
- **TikTok Pixel**: Configurable via admin settings
- **Google Sheets**: Store ID configurable via admin settings

## Environment Variables

```env
# Database (auto-provisioned by Replit)
DATABASE_URL=...

# Admin Auth
ADMIN_USERNAME=admin
ADMIN_PASSWORD=amiri2024
JWT_SECRET=amiri-phone-secret-2024

# Telegram Bot Notifications
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_CHAT_ID=your_chat_id

# WhatsApp Notifications
WHATSAPP_TOKEN=your_token
WHATSAPP_PHONE_NUMBER_ID=your_id
WHATSAPP_NUMBER=213XXXXXXXXX
```

## Running the Seed

```bash
pnpm --filter @workspace/scripts run seed
```

## API Codegen

After changing `lib/api-spec/openapi.yaml`:
```bash
pnpm --filter @workspace/api-spec run codegen
```

## DB Schema Push

```bash
pnpm --filter @workspace/db run push
```

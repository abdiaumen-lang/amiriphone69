# Amiri Phone - Algeria Ecommerce

## Overview

متجر إلكتروني احترافي كامل لمتجر Amiri Phone لبيع الهواتف الذكية في الجزائر.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod, drizzle-zod
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Image Upload**: Multer (local storage)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (port 8080 → /api)
│   │   ├── public/uploads/ # Uploaded product images
│   │   ├── Dockerfile       # For Railway/Render deployment
│   │   └── railway.toml    # Railway deployment config
│   ├── amiri-phone/        # React+Vite frontend (port 18251 → /)
│   │   ├── vercel.json     # Vercel deployment config
│   │   └── vite.config.prod.ts  # Production build (no Replit plugins)
│   └── mockup-sandbox/     # Design sandbox
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
│   └── src/seed.ts         # Database seeding script
└── DEPLOY.md               # Full deployment guide
```

## Store Info

- **Store Name**: Amiri Phone (أميري فون)
- **Location**: 89 Rue Mahmoud KHODJAT EL DJELD, Bir Mourad Raïs, Alger
- **Phone**: 0557 32 54 17

## Admin Access

- URL: `/admin/login`
- Username: `admin`
- Password: `amiri2024`

## Admin Panel Features

### Products Management (`/admin/products`)
- Full CRUD with tabbed form (Informations, Images & Specs, Avancé)
- Image upload with drag & drop + folder picker (+ button)
- Image reordering, max 8 images per product
- Specs editor in key: value format
- Arabic/French/English name support

### Orders Management (`/admin/orders`)
- Order list with status filter tabs
- Order detail modal with status update
- Delivery company + tracking number tracking
- Internal notes

### Settings (`/admin/settings`)
- **Apparence**: Logo, colors (primary, accent, success, danger), fonts, border radius, live preview
- **Boutique**: Store name (FR/AR), phone, address, SEO title/description, shipping config
- **Contenu**: Edit hero section, trust badges, reviews section, popup, footer
- **Fonctionnalités**: Toggle 14 features (WhatsApp widget, countdown timer, popups, tracking pixels, etc.)
- **Intégrations**: Telegram Bot, WhatsApp API, Facebook Pixel, TikTok Pixel, Google Analytics, Google Sheets, delivery APIs (Yalidine, ZR Express, Maystro)
- **Langues**: Edit all UI text labels

## API Endpoints

- `GET/PUT /api/settings` — Store settings (flexible, any key-value)
- `POST /api/upload` — Image upload (multipart/form-data, field: "image")
- `DELETE /api/upload/:filename` — Delete uploaded image
- `GET /uploads/:filename` — Static file serving for uploaded images
- Full products/categories/orders/wilayas/reviews CRUD

## Deployment

### For Vercel (Frontend)
See `DEPLOY.md` for full instructions.
- `artifacts/amiri-phone/vercel.json` — Vercel config with API proxy
- `artifacts/amiri-phone/vite.config.prod.ts` — Production Vite config
- Build command: `pnpm run build:prod`
- Output: `dist/`

### For Railway/Render (Backend)
- `artifacts/api-server/Dockerfile` — Docker deployment
- `artifacts/api-server/railway.toml` — Railway config
- `artifacts/api-server/.env.example` — Required env vars

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

# WhatsApp Cloud API
WHATSAPP_TOKEN=your_token
WHATSAPP_PHONE_NUMBER_ID=your_id
WHATSAPP_NUMBER=213XXXXXXXXX
```

## Commands

```bash
# Regenerate API client after OpenAPI changes
pnpm --filter @workspace/api-spec run codegen

# Push DB schema changes
pnpm --filter @workspace/db run push

# Seed database
pnpm --filter @workspace/scripts run seed

# Production build (frontend)
cd artifacts/amiri-phone && pnpm run build:prod
```

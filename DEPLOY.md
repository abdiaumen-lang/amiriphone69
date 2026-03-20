# Déploiement Amiri Phone

## Architecture

- **Frontend**: Vercel (React + Vite)
- **Backend API**: Railway ou Render (Express + Node.js)
- **Base de données**: Neon PostgreSQL (ou Supabase)
- **Images**: Stockage local (ou Cloudinary en production)

---

## 1. Base de données (Neon PostgreSQL)

1. Créer un compte sur [neon.tech](https://neon.tech)
2. Créer une base de données `amiri_phone`
3. Copier la `DATABASE_URL`
4. Exécuter les migrations:
   ```bash
   DATABASE_URL=... pnpm --filter @workspace/db run migrate
   DATABASE_URL=... pnpm --filter @workspace/db run seed
   ```

---

## 2. API Backend (Railway)

1. Créer un compte sur [railway.app](https://railway.app)
2. Créer un nouveau projet depuis GitHub
3. Configurer les variables d'environnement:
   ```
   PORT=8080
   NODE_ENV=production
   DATABASE_URL=postgresql://...
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=votre_mot_de_passe_fort
   JWT_SECRET=votre_secret_jwt_fort
   TELEGRAM_BOT_TOKEN=   (optionnel)
   TELEGRAM_CHAT_ID=     (optionnel)
   WHATSAPP_TOKEN=       (optionnel)
   ```
4. Le `railway.toml` est déjà configuré pour le build et le démarrage.
5. Copier l'URL du déploiement Railway (ex: `https://amiri-api.railway.app`)

---

## 3. Frontend (Vercel)

1. Créer un compte sur [vercel.com](https://vercel.com)
2. Importer le projet GitHub
3. Configurer:
   - **Root Directory**: `artifacts/amiri-phone`
   - **Build Command**: `pnpm run build:prod`
   - **Output Directory**: `dist`
4. Dans `vercel.json`, remplacer `REPLACE_WITH_YOUR_API_URL` par l'URL Railway:
   ```json
   "destination": "https://amiri-api.railway.app/api/:path*"
   ```
5. Ajouter les variables d'environnement Vercel:
   ```
   VITE_API_URL=https://amiri-api.railway.app
   ```

---

## 4. Admin Panel

- URL Admin: `https://votre-site.vercel.app/admin`
- Identifiants par défaut: `admin` / `amiri2024`
- **Changez le mot de passe** via la variable `ADMIN_PASSWORD` sur Railway.

---

## 5. Images en production (Cloudinary)

Pour les images des produits en production, il est recommandé d'utiliser Cloudinary:
1. Créer un compte gratuit sur [cloudinary.com](https://cloudinary.com)
2. Ajouter dans les variables Railway:
   ```
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```
3. Modifier `artifacts/api-server/src/routes/upload.ts` pour utiliser Cloudinary.

---

## Checklist avant déploiement

- [ ] DATABASE_URL configuré sur Railway
- [ ] Migrations exécutées
- [ ] ADMIN_PASSWORD changé (sécurité)
- [ ] JWT_SECRET fort (min 32 caractères aléatoires)
- [ ] URL Railway mise dans vercel.json
- [ ] CORS configuré pour votre domaine Vercel dans app.ts

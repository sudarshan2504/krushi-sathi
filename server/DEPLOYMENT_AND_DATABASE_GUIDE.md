# Krushi Sathi — Mobile Deployment & Hosted Database Migration Guide

This guide documents how to deploy the Krushi Sathi backend and client, package the mobile app, and migrate from local SQLite + local `/uploads` to hosted PostgreSQL + Object Storage (e.g., Supabase, Neon, AWS S3 / Cloudflare R2).

---

## 1. Environment & Architecture Overview

| Component | Development | Production Recommended |
|---|---|---|
| **Database** | SQLite (`server/krishi_sathi.db`) | Hosted PostgreSQL (Neon / Supabase / Railway) |
| **Media Uploads** | Local Disk (`server/uploads`) | S3-compatible Object Storage (Cloudflare R2 / AWS S3) |
| **Backend API** | Node.js Express (`localhost:5000`) | Render, Railway, Fly.io, or VPS (Docker) |
| **Frontend Web** | Vite Dev Server (`localhost:5173`) | Cloudflare Pages, Vercel, or Firebase App Hosting |
| **Mobile App** | Web Browser / PWA | Android APK (Capacitor) or Installed PWA |

---

## 2. Configurable CORS & API Base URL

### Frontend (`client`)
The client dynamically resolves the backend URL in this order:
1. `localStorage.getItem('krishi_api_base')` (Allows entering `http://192.168.1.X:5000` directly on a test device).
2. `import.meta.env.VITE_API_BASE_URL` (Set at build time e.g., in `.env.production`).
3. Default: `/api` (Relative path when proxied or hosted under the same domain).

### Backend (`server`)
The server dynamically validates CORS for:
- Configured URLs in `ALLOWED_ORIGINS` (comma-separated).
- `CLIENT_URL` (e.g., `https://krushisathi.web.app` or `https://krushisathi.com`).
- Local LAN IP addresses (`192.168.x.x`, `10.x.x.x`, `172.16-31.x.x`) for phone testing.
- Secure tunneling services (`*.ngrok-free.app`, `*.trycloudflare.com`, `*.loca.lt`).
- Capacitor Android native webviews (`capacitor://localhost`, `http://localhost`, `https://localhost`).

---

## 3. SQLite Limitations on Cloud Hosts & The PostgreSQL Migration Path

### Why SQLite Doesn't Persist on Free Hosts
Most cloud container hosts (Render, Railway, Fly.io free tiers, Google Cloud Run) use **ephemeral filesystems**. When the server container sleeps, scales down, or redeploys:
- Local SQLite database files (`krishi_sathi.db`) are wiped or reset.
- Avatar images stored in `server/uploads/` are erased.

### Step-by-Step PostgreSQL Migration via Prisma

Prisma makes PostgreSQL migration seamless because all schema models in `server/prisma/schema.prisma` use UUID primary keys (`@id @default(uuid())`), which are 100% native to PostgreSQL.

#### Step 1: Provision a Free Cloud PostgreSQL Instance
Recommended free providers:
- **Neon** (neon.tech) — Serverless Postgres with automatic branching.
- **Supabase** (supabase.com) — Managed Postgres with built-in storage.
- **Railway** (railway.app) — One-click Postgres instance.

#### Step 2: Update `server/prisma/schema.prisma`
Change lines 1-4:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### Step 3: Set `DATABASE_URL` in `.env`
```env
DATABASE_URL="postgresql://username:password@ep-sample-pooler.us-east-2.aws.neon.tech/krushisathi?sslmode=require"
```

#### Step 4: Deploy the Schema
```bash
cd server
npx prisma db push
```

#### Step 5: Data Migration (SQLite to Postgres)
To transfer existing farmer accounts, soil assessments, and crop plans:
```bash
# Export from SQLite to JSON:
node scripts/export-sqlite.js

# Import JSON into Postgres:
node scripts/import-postgres.js
```

---

## 4. Object Storage Migration for User Uploads

Currently, uploaded farmer avatars are saved to `server/uploads/`.
To persist uploads across server restarts, use S3-compatible cloud object storage:

1. Create a Cloudflare R2 bucket or AWS S3 bucket `krushi-sathi-uploads`.
2. Use `@aws-sdk/client-s3` in `server/src/services/storageService.ts`:
```ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
```
3. Store the public CDN URL in the database rather than the local file path.

---

## 5. Building and Running the Capacitor Android App

### Prerequisites
- **Android Studio** (Koala or newer)
- **Java Development Kit (JDK)**: JDK 17 or JDK 21
- **Android SDK Platform-Tools**: API 34+

### Build Steps
1. Build the production React PWA:
   ```bash
   cd client
   npm run build
   ```
2. Sync the web assets into the Android native project:
   ```bash
   npm run cap:sync
   ```
3. Open in Android Studio:
   ```bash
   npm run cap:open
   ```
4. In Android Studio:
   - Select your target device or emulator.
   - Click **Run** (Green play button) to run the app.
   - To export an APK: go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

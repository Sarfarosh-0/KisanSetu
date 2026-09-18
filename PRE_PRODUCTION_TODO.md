# 🛠️ KisanSetu: Pre-Hosting & Pre-Production Action Items

This document tracks **all completed milestones and remaining actionable requirements** before hosting and launching **KisanSetu** to public production.

Tasks are prioritized using the **Production Readiness Risk Classification Matrix**:
* 🔴 **P0 — Pre-Hosting Blockers**: Must be configured in cloud platforms for the application to be deployed and live.
* 🟡 **P1 — Launch Hardening**: Immediate security and stability fixes needed before opening access to users.
* 🟢 **P2 — Post-Hosting Sprint**: Operational improvements scheduled right after initial deployment.
* ⚪ **P3 — Future Enhancements**: Advanced production roadmap items.

---

## ✅ Completed Pre-Production Milestones (Codebase Ready)

* [x] **PostgreSQL & Cloudinary Drivers**: Added `psycopg2-binary>=2.9.9` and `cloudinary>=1.38.0` in `backend/requirements.txt`.
* [x] **Crop RFQ System**: Fully implemented `CropRfq` SQLAlchemy model (`backend/models.py`), Pydantic schemas (`backend/schemas.py`), and REST endpoints `POST /api/rfqs`, `GET /api/rfqs` (`backend/main.py`).
* [x] **Server-Side Authentication & JWT**: Implemented `bcrypt` password hashing, JWT bearer token verification (`backend/auth.py`), and object-level IDOR ownership guards. Verified 100% with automated test suite (`backend/test_auth_flow.py`).
* [x] **Strict CORS Controls**: Restricted API origins in `backend/main.py` using `ALLOWED_ORIGINS` environment variables plus local dev origins, with explicit HTTP methods and headers.
* [x] **Rate Limiting**: Added `slowapi` brute-force protection to sensitive endpoints (`10/minute` on `/api/auth/register` and `/api/auth/login`).
* [x] **Application Crash Reporting**: Integrated `sentry-sdk` into FastAPI with GDPR privacy settings (`send_default_pii=False`).
* [x] **SPA Routing Fallback**: Configured `vercel.json` with `/api/*` proxy rewrite to Render and `/(.*)` rewrite to `index.html`.
* [x] **Dynamic Frontend API Base**: Configured `src/api.ts` with `VITE_API_BASE_URL` resolver and automated Bearer token attachment.
* [x] **Automated Database Backups**: Created `.github/workflows/db-backup.yml` for scheduled weekly `pg_dump` + gzip + GPG AES-256 encryption + 90-day GitHub Artifact retention.
* [x] **SEO Discovery Files**: Created `public/robots.txt` and `public/sitemap.xml`.
* [x] **Console Output Sanitization**: Removed all unnecessary `console.log` statements across `src/`.
* [x] **Production Compilation**: Verified `npm run build` succeeds cleanly with zero TypeScript errors.

---

## 🔴 Priority P0 — Pre-Hosting Blockers (Required for Deployment)

### 1. Provision Production PostgreSQL Database (Neon.tech)
* **Status**: ⏳ Pending User Action
* **Why Required**: Cloud container platforms (like Render) have ephemeral local filesystems; SQLite (`agrimarket.db`) resets on reboot. A persistent cloud database is mandatory.
* **Steps**:
  1. Sign in to [Neon.tech](https://neon.tech/) and create a free PostgreSQL project (e.g., `kisansetu-db`).
  2. Open the **SQL Editor** in Neon and paste the contents of [`backend/neon_schema.sql`](file:///c:/Users/Sarfarosh%20Alam/Work%20Space/My%20Projects/SIH-2026/SIH-26033-KisanSetu/backend/neon_schema.sql) to create all tables and indexes.
  3. Copy your Neon PostgreSQL connection string (ensure it ends with `?sslmode=require`).

---

### 2. Set Up Cloudinary Account for Crop Photo Storage
* **Status**: ⏳ Pending User Action
* **Why Required**: Uploaded crop images in `backend/uploads/` will be deleted on Render restart without persistent cloud storage.
* **Steps**:
  1. Register for a free account at [Cloudinary.com](https://cloudinary.com/) (₹0 / no credit card required).
  2. Copy the **API Environment variable** from your dashboard (format: `cloudinary://<api_key>:<api_secret>@<cloud_name>`).
  3. Save this value to inject into Render environment variables.

---

### 3. Deploy FastAPI Backend to Render
* **Status**: ⏳ Pending User Action
* **Why Required**: The backend must be live on HTTPS before the frontend can connect.
* **Steps**:
  1. Go to [Render Dashboard](https://dashboard.render.com/) ➔ **New +** ➔ **Web Service**.
  2. Connect your `SIH-26033-KisanSetu` GitHub repository.
  3. Configure deployment settings:
     * **Root Directory**: `backend`
     * **Runtime**: `Python 3`
     * **Build Command**: `pip install -r requirements.txt`
     * **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
  4. Add the following **Environment Variables** in Render:
     * `DATABASE_URL`: *(Your Neon PostgreSQL connection string)*
     * `CLOUDINARY_URL`: *(Your Cloudinary credentials string)*
     * `ALLOWED_ORIGINS`: `https://kisansetu.vercel.app,http://localhost:3000`
     * `JWT_SECRET_KEY`: *(Generate a secure 64-char string)*
     * `SENTRY_DSN`: *(Optional — from Sentry project settings)*
  5. Click **Deploy Web Service** and note your assigned URL (e.g., `https://kisansetu-backend.onrender.com`).

---

### 4. Update Vercel Proxy & Deploy Frontend
* **Status**: ⏳ Pending User Action
* **Why Required**: The frontend needs the live Render URL to proxy API requests without CORS issues.
* **Steps**:
  1. Open [`vercel.json`](file:///c:/Users/Sarfarosh%20Alam/Work%20Space/My%20Projects/SIH-2026/SIH-26033-KisanSetu/vercel.json) in the project root:
     ```json
     {
       "source": "/api/:path*",
       "destination": "https://YOUR-ACTUAL-RENDER-URL.onrender.com/api/:path*"
     }
     ```
     Replace with your actual Render service URL.
  2. Commit and push this change to GitHub.
  3. Go to [Vercel Dashboard](https://vercel.com/) ➔ **Add New Project** ➔ Import `SIH-26033-KisanSetu`.
  4. Framework Preset: **Vite** | Build Command: `npm run build` | Output Directory: `dist`.
  5. Click **Deploy**.

---

### 5. Configure GitHub Actions Backup Secrets
* **Status**: ⏳ Pending User Action
* **Why Required**: The automated backup workflow ([`.github/workflows/db-backup.yml`](file:///c:/Users/Sarfarosh%20Alam/Work%20Space/My%20Projects/SIH-2026/SIH-26033-KisanSetu/.github/workflows/db-backup.yml)) will fail unless GitHub Actions has access to the database and encryption passphrase.
* **Steps**:
  1. Go to your GitHub repository ➔ **Settings** ➔ **Secrets and variables** ➔ **Actions**.
  2. Add New Repository Secret:
     * `DATABASE_URL`: *(Neon connection string)*
     * `BACKUP_PASSPHRASE`: *(A strong passphrase used to encrypt weekly `.sql.gz` dumps via GPG)*

---

## 🟡 Priority P1 — Pre-Launch Hardening (Fix Before Opening to Users)

### 1. Configure Uptime Keep-Alive Ping (UptimeRobot)
* **Problem**: Render's free tier spins down after 15 minutes of inactivity, causing ~50-second cold starts for visitors.
* **Action Required**: Create a free HTTP monitor at [UptimeRobot.com](https://uptimerobot.com/) pinging `https://<YOUR-RENDER-URL>/api/health` every 10 minutes.

---

### 2. Guard or Disable Demo Seed Reset in Production
* **Problem**: In [`src/App.tsx`](file:///c:/Users/Sarfarosh%20Alam/Work%20Space/My%20Projects/SIH-2026/SIH-26033-KisanSetu/src/App.tsx#L220), `handleResetData()` allows any user to restore baseline catalog data via `API.resetSeedData()`, which would wipe active production transactions.
* **Action Required**: Hide or disable the reset data button in production mode (`import.meta.env.PROD`), or restrict the endpoint to admin roles.

---

### 3. Add HTTP Security Headers
* **Problem**: Standard security headers are currently missing.
* **Action Required**: Add security headers in FastAPI middleware or Vercel config:
  * `X-Content-Type-Options: nosniff`
  * `X-Frame-Options: DENY`
  * `Strict-Transport-Security: max-age=31536000; includeSubDomains`

---

### 4. Concurrency Protection for Stock Deduction
* **Problem**: In [`backend/main.py`](file:///c:/Users/Sarfarosh%20Alam/Work%20Space/My%20Projects/SIH-2026/SIH-26033-KisanSetu/backend/main.py#L650), stock decrement (`listing.quantity_quintals -= payload.quantity_ordered`) lacks row locking (`with_for_update()`), creating a race condition if two buyers purchase simultaneously.
* **Action Required**: Use `db.query(CropListing).with_for_update().filter(...)` inside the order transaction.

---

### 5. Final Production Smoke Test
* **Action Required**: Immediately upon deployment, verify the live checklist:
  - [ ] Homepage loads over HTTPS without mixed-content warnings.
  - [ ] User registration and login succeed with JWT stored.
  - [ ] Farmer creates crop listing with photo uploaded to Cloudinary.
  - [ ] Buyer places order; escrow state updates to `ESCROW_HELD`.
  - [ ] 4-digit OTP releases escrow to farmer.
  - [ ] Browser console has zero errors.

---

## 🟢 Priority P2 — Post-Hosting Sprint (First Week Post-Launch)

- [ ] **Automated CI Workflow**: Add `.github/workflows/ci.yml` running `npm run build` and `python backend/test_auth_flow.py` on push/PR.
- [ ] **Self-Service Password Reset**: Add forgot-password flow with expiring single-use reset tokens.
- [ ] **Browser History Routing**: Synchronize `activeTab` with browser History API (`window.history.pushState`) so browser Back/Forward buttons navigate between tabs.
- [ ] **Form Dirty-State Protection**: Warn users before leaving `FarmerCropForm` or `CropRfqModal` with unsaved changes.
- [ ] **User Account Deletion**: Add self-service data and account deletion endpoint for privacy compliance.

---

## ⚪ Priority P3 — Future Enhancements

- [ ] **Real Carrier SMS Gateway**: Hook up Fast2SMS or Twilio API for real mobile OTP delivery across India.
- [ ] **Live Payment Gateway**: Integrate Razorpay or Cashfree webhooks for direct bank-to-bank UPI transfers.
- [ ] **Custom Domain**: Connect `kisansetu.in` via DNS CNAME records to replace free subdomains.
- [ ] **Magic-Byte File Inspection**: Add `python-magic` to inspect image binary headers before storage.

---

## 📋 Quick Execution Summary Matrix

| Task | Target Service / File | Priority | Action Type | Status |
| :--- | :--- | :---: | :---: | :---: |
| **Neon PostgreSQL** | Neon.tech ➔ `backend/neon_schema.sql` | 🔴 P0 | Cloud Setup | ⏳ Pending User |
| **Cloudinary Storage** | Cloudinary.com ➔ Render Env | 🔴 P0 | Cloud Setup | ⏳ Pending User |
| **FastAPI Backend Deploy** | Render Dashboard ➔ `backend/` | 🔴 P0 | Deployment | ⏳ Pending User |
| **Vercel Frontend Deploy** | `vercel.json` ➔ Vercel Dashboard | 🔴 P0 | Deployment | ⏳ Pending User |
| **GitHub Backup Secrets** | GitHub Repo ➔ Settings ➔ Secrets | 🔴 P0 | Configuration | ⏳ Pending User |
| **Keep-Alive Monitor** | UptimeRobot ➔ `/api/health` | 🟡 P1 | Monitoring | ⏳ Pending User |
| **Disable Demo Reset in Prod** | `src/App.tsx` | 🟡 P1 | Code Tweak | ⏳ Pending Code |
| **HTTP Security Headers** | `backend/main.py` / `vercel.json` | 🟡 P1 | Code Tweak | ⏳ Pending Code |
| **Stock Row Locking** | `backend/main.py` | 🟡 P1 | Code Tweak | ⏳ Pending Code |
| **Live Smoke Test** | Production URL | 🟡 P1 | Verification | ⏳ Pending Live |

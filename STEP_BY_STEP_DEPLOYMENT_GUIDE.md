# 🚀 KisanSetu: Step-by-Step Production Deployment Guide

This guide provides a direct, chronological, and simple step-by-step walkthrough to deploy **KisanSetu** to the public internet with full functionality, persistent storage, and production security at **₹0/month recurring cost**.

---

### Free Accounts Required (All 100% Free, No Credit Card Required):
1. **[Neon.tech](https://neon.tech/)** $\rightarrow$ Serverless PostgreSQL Database (0.5 GB storage)
2. **[Cloudinary.com](https://cloudinary.com/)** $\rightarrow$ Persistent Crop Photo Storage & Media CDN
3. **[Render.com](https://render.com/)** $\rightarrow$ Python FastAPI Backend Service (750 free hours/mo)
4. **[Vercel.com](https://vercel.com/)** $\rightarrow$ React 19 Frontend & Global Edge CDN (100 GB bandwidth/mo)
5. **[UptimeRobot.com](https://uptimerobot.com/)** $\rightarrow$ 10-Minute Keep-Alive Ping (prevents cold starts)

---

## Phase 1: Provision Cloud Database (Neon PostgreSQL)

### Step 1.1: Create your database
1. Go to **[Neon.tech](https://neon.tech/)** and click **Sign Up** (use your GitHub account).
2. Click **Create Project**:
   * **Project Name**: `kisansetu-db`
   * **Region**: Select `AWS ap-southeast-1 (Singapore)` (closest to India).
   * **PostgreSQL Version**: `16`
3. Click **Create Project**.

### Step 1.2: Initialize the schema
1. In the Neon dashboard, click **SQL Editor** from the left sidebar.
2. Open `backend/neon_schema.sql` in your project workspace.
3. Copy the entire contents of `backend/neon_schema.sql`, paste it into the Neon SQL Editor, and click **Run**.
4. You will see confirmation that all 6 tables (`users`, `crop_listings`, `orders`, `crop_rfqs`, `mandi_prices`, `logistics_batches`) and their indexes have been created.

### Step 1.3: Copy your connection string
1. Go back to the **Dashboard** tab in Neon.
2. Under **Connection Details**, ensure **Connection string** is selected.
3. It will look like this:
   ```text
   postgresql://neondb_owner:npg_AbCd123xyz@ep-sparkling-leaf-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Save this string in a secure notepad—you will need it for Render and GitHub Actions.

---

## Phase 2: Set Up Cloud Photo Storage (Cloudinary)

Cloud hosts like Render use ephemeral filesystems (any files saved to local folders get wiped on reboot). Cloudinary ensures crop pictures uploaded by farmers stay permanently accessible.

1. Go to **[Cloudinary.com](https://cloudinary.com/)** and click **Sign Up for Free**.
2. Once inside your Cloudinary Dashboard, locate the **API Environment variable** box:
   ```text
   cloudinary://123456789012345:abcdefghijklmnopqrstuvwxyz@dxyzkisan
   ```
3. Copy this string and save it for Render.

---

## Phase 3: Apply Launch Security Hardening to the Code

Before deploying to the cloud, apply two security fixes in your codebase:

### Step 3.1: Add HTTP Security Headers
Open `backend/main.py` and add this middleware right after the CORS middleware (around line 162):

```python
# ---------------------------------------------------------------------------
# HTTP Security Headers Middleware
# ---------------------------------------------------------------------------
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response
```

### Step 3.2: Prevent Stock Race Conditions
In `backend/main.py` inside the `create_order` endpoint (around line 650), add `.with_for_update()` so two simultaneous buyers cannot purchase the same lot:

```python
# Change from:
listing = db.query(CropListing).filter(CropListing.id == payload.listing_id, CropListing.status == ListingStatus.ACTIVE).first()

# To:
listing = db.query(CropListing).with_for_update().filter(CropListing.id == payload.listing_id, CropListing.status == ListingStatus.ACTIVE).first()
```

### Step 3.3: Commit your changes
In PowerShell:
```powershell
git add backend/main.py
git commit -m "feat: add security headers and stock row locking"
git push origin main
```

---

## Phase 4: Deploy the FastAPI Backend (Render)

### Step 4.1: Create Web Service
1. Go to **[Render.com](https://render.com/)** and sign in with GitHub.
2. Click **New +** (top right) $\rightarrow$ **Web Service**.
3. Select **Build and deploy from a Git repository** and pick your `SIH-26033-KisanSetu` repo.
4. Configure the settings:
   * **Name**: `kisansetu-backend`
   * **Region**: `Singapore` (or `Frankfurt`)
   * **Branch**: `main`
   * **Root Directory**: `backend`
   * **Runtime**: `Python 3`
   * **Build Command**:
     ```bash
     pip install --no-cache-dir -r requirements.txt
     ```
   * **Start Command**:
     ```bash
     uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1
     ```
   * **Instance Type**: Select **Free** (512 MB RAM, 0.1 CPU).

### Step 4.2: Add Environment Variables
Scroll down to the **Environment Variables** section and add:

| Key | Value |
| :--- | :--- |
| `DATABASE_URL` | *(Your Neon PostgreSQL connection string from Step 1.3)* |
| `CLOUDINARY_URL` | *(Your Cloudinary credentials string from Phase 2)* |
| `JWT_SECRET_KEY` | *(Run `python -c "import secrets; print(secrets.token_hex(32))"` in your terminal and paste the generated 64-char key)* |
| `ALLOWED_ORIGINS` | `https://kisansetu.vercel.app,http://localhost:3000` *(You will update this with your actual Vercel URL in Phase 6)* |
| `PYTHONUNBUFFERED` | `1` |

5. Click **Deploy Web Service**.
6. Wait 3–4 minutes while Render installs requirements and boots the server.
7. Once finished, copy the public URL generated by Render at the top of the page:
   ```text
   https://kisansetu-backend.onrender.com
   ```
8. Test it in your browser by visiting: `https://kisansetu-backend.onrender.com/api/health`. You should see:
   ```json
   {
     "status": "healthy",
     "service": "KisanSetu Agri-Marketplace API",
     "version": "1.0.0",
     "image_storage": "cloudinary"
   }
   ```

---

## Phase 5: Seed the Production Database

Now populate the live PostgreSQL database with the verified agricultural catalog (mandi benchmarks, verified sample farmers, and initial produce listings):

1. In your local terminal, activate your backend virtual environment:
   ```powershell
   cd backend
   venv\Scripts\activate
   ```
2. Set the remote database URL temporarily:
   ```powershell
   $env:DATABASE_URL="YOUR_NEON_POSTGRESQL_CONNECTION_STRING"
   ```
3. Run the seeder:
   ```powershell
   python seed_data.py
   ```
4. Reset your local environment back to SQLite:
   ```powershell
   $env:DATABASE_URL=""
   cd ..
   ```

---

## Phase 6: Configure and Deploy Frontend (Vercel)

### Step 6.1: Update the Vercel Proxy Rewrite
1. Open `vercel.json` in your project root.
2. Replace the placeholder URL with your actual Render URL:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://YOUR-ACTUAL-RENDER-URL.onrender.com/api/:path*"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
3. Commit and push:
   ```powershell
   git add vercel.json
   git commit -m "chore: connect frontend proxy to live backend"
   git push origin main
   ```

### Step 6.2: Deploy on Vercel
1. Go to **[Vercel.com](https://vercel.com/)** and sign in with GitHub.
2. Click **Add New Project** $\rightarrow$ Import `SIH-26033-KisanSetu`.
3. In project settings:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `./` (leave default)
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. In **Environment Variables**, leave `VITE_API_BASE_URL` empty (this enables relative `/api/*` calls that Vercel routes through the secure proxy in `vercel.json`).
5. Click **Deploy**.
6. In ~45 seconds, your site is live! Note your Vercel URL (e.g., `https://kisansetu-sih.vercel.app`).

### Step 6.3: Synchronize CORS on Render
1. Go back to your **Render Dashboard** $\rightarrow$ your backend web service $\rightarrow$ **Environment**.
2. Edit `ALLOWED_ORIGINS` to include your new Vercel URL:
   ```text
   https://kisansetu-sih.vercel.app,http://localhost:3000
   ```
3. Click **Save Changes** (Render will automatically redeploy with the updated CORS policy).

---

## Phase 7: Eliminate Cold Starts (UptimeRobot)

Render's free tier sleeps after 15 minutes of inactivity, causing a 45-second delay for visitors. A free 10-minute HTTP ping keeps it warm.

1. Go to **[UptimeRobot.com](https://uptimerobot.com/)** and sign up for a free account.
2. Click **+ Add New Monitor**:
   * **Monitor Type**: `HTTP(s)`
   * **Friendly Name**: `KisanSetu Backend Warmup`
   * **URL (or IP)**: `https://YOUR-RENDER-URL.onrender.com/api/health`
   * **Monitoring Interval**: `Every 10 minutes`
3. Click **Create Monitor**. Render will now stay active and responsive.

---

## Phase 8: Configure Automated Encrypted Backups

Your codebase includes an automated backup pipeline in `.github/workflows/db-backup.yml`.

1. Go to your repository on **GitHub** $\rightarrow$ **Settings** $\rightarrow$ **Secrets and variables** $\rightarrow$ **Actions**.
2. Click **New repository secret** and add:
   * `DATABASE_URL`: *(Your Neon PostgreSQL connection string)*
   * `BACKUP_PASSPHRASE`: *(Any strong secret password used to AES-256 encrypt your database dumps)*
3. To test it immediately:
   * Go to the **Actions** tab in GitHub.
   * Click **Weekly Database Backup** in the left sidebar.
   * Click **Run workflow** $\rightarrow$ **Run workflow**.
   * It will run `pg_dump`, compress it, encrypt it with GPG, and store it in GitHub Artifacts (retained for 90 days).

---

## Phase 9: Live Production Smoke Test

Open your public Vercel URL on your phone or desktop and run through the verification checklist:

- [ ] **Home & Discovery**: The marketplace loads with real crops, photos, and live APMC benchmark prices.
- [ ] **Language Toggle**: Click **हिंदी** $\rightarrow$ interface changes language $\rightarrow$ refresh page $\rightarrow$ Hindi state persists.
- [ ] **Farmer Authentication**: Register a new farmer account with your phone number and password. Confirm instant JWT token creation.
- [ ] **Listing Creation & Photo Upload**: Create a new crop listing with 1–2 photos. Verify that the photos upload to Cloudinary and display with high-resolution thumbnails.
- [ ] **AI Fair Price Band**: Run the AI pricing tool and confirm the calculated `[Min, Target, Max]` price range appears.
- [ ] **Institutional Buyer Order**: Switch to the Buyer role, locate the crop listing, and place an order. Verify that available stock decreases accordingly.
- [ ] **Escrow UPI Simulation**: Pay via the simulated UPI QR code. Confirm the order transitions to `ESCROW_HELD`.
- [ ] **Delivery Handshake**: Enter delivery OTP `4829`. Confirm that escrow funds release to the farmer (`RELEASED_TO_FARMER`).

---

## Quick Reference: Most Common Traps & Fixes

| Issue | Cause | Fix |
| :--- | :--- | :--- |
| **API calls return 404 on Vercel** | Missing rewrite path | In `vercel.json`, verify destination has `/api/:path*` at the end of the URL. |
| **CORS Error in Browser** | Mismatched domain in backend | Update `ALLOWED_ORIGINS` in Render dashboard to match your exact Vercel URL. |
| **Neon SSL Connection Error** | Missing SSL mode query parameter | Make sure `DATABASE_URL` ends with `?sslmode=require`. |
| **Image Upload fails with 502** | Invalid Cloudinary string | Double-check `CLOUDINARY_URL` in Render starts with `cloudinary://`. |
| **Page refresh returns 404** | Missing SPA rewrite | Ensure `"source": "/(.*)", "destination": "/index.html"` is present in `vercel.json`. |

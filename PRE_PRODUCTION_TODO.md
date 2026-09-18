# 🛠️ KisanSetu: Pre-Production Action Items & Missing Requirements

This document provides a prioritized, actionable checklist of **everything that is missing, incomplete, or required before deploying KisanSetu to public production**.

Tasks are ranked by severity using the **Production Readiness Risk Classification Matrix**:
* 🔴 **P0 — Blocking**: Must be resolved before the application can function live in production.
* 🟡 **P1 — High Priority**: Must be completed immediately before or at launch for security and stability.
* 🟢 **P2 — Medium Priority**: Essential operational tasks scheduled for the first post-launch sprint.
* ⚪ **P3 — Low Priority / Future**: Nice-to-have enhancements once initial user traffic begins.

---

## 🔴 Priority P0 — Blocking (Must Complete Before Production Launch)

### 1. Add Missing Drivers to `backend/requirements.txt` ✅ (COMPLETED)
* **Status**: Resolved. Added `psycopg2-binary>=2.9.9` and `cloudinary>=1.38.0` to `backend/requirements.txt`.

---

### 2. Implement Missing `CropRfq` Model & Endpoints in FastAPI
* **Problem**: The Request for Quotation (RFQ) workflow exists in the React frontend and `server.ts`, but is completely missing from the Python FastAPI backend (`backend/models.py` and `backend/main.py`). In Full-Stack mode, submitting an RFQ currently fails or falls back to in-memory storage.
* **Action Required**:
  1. In `backend/models.py`, define the `CropRfq` SQLAlchemy table:
     ```python
     class CropRfq(Base):
         __tablename__ = "crop_rfqs"
         id = Column(String(50), primary_key=True, index=True)
         listing_id = Column(Integer, ForeignKey("crop_listings.id"), nullable=False)
         buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
         farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
         crop_name = Column(String(100), nullable=False)
         variety = Column(String(100), nullable=False)
         required_quantity_quintals = Column(Float, nullable=False)
         expected_price_per_quintal = Column(Float, nullable=False)
         delivery_location = Column(String(255), nullable=False)
         delivery_pincode = Column(String(20), nullable=False)
         delivery_timeline = Column(String(100), nullable=False)
         message = Column(Text, nullable=True)
         status = Column(String(30), default="SUBMITTED")
         created_at = Column(DateTime, default=datetime.utcnow)
     ```
  2. In `backend/schemas.py`, add `CropRfqCreate` and `CropRfqResponse` Pydantic schemas.
  3. In `backend/main.py`, implement:
     * `POST /api/rfqs` (Submit new RFQ)
     * `GET /api/rfqs` (Retrieve RFQs filtered by buyer/farmer/listing)

---

### 3. Connect Cloudinary for Persistent Image Storage
* **Problem**: Currently, uploaded crop photos are saved to local disk (`backend/uploads/`). Free cloud hosts (like Render) have **ephemeral filesystems**, meaning all uploaded photos will be deleted whenever the server restarts, sleeps, or redeploys.
* **Action Required**:
  1. Register a free account at [Cloudinary.com](https://cloudinary.com/) (₹0 / no credit card required).
  2. Obtain your `CLOUDINARY_URL` from the Cloudinary dashboard.
  3. Set `CLOUDINARY_URL` in your Render Web Service environment variables.
  4. Ensure `backend/main.py` utilizes Cloudinary whenever `CLOUDINARY_URL` is detected.

---

### 4. Provision Production PostgreSQL Database (Neon)
* **Problem**: The backend currently defaults to a local SQLite file (`agrimarket.db`), which will reset on ephemeral cloud containers.
* **Action Required**:
  1. Create a free serverless PostgreSQL instance on [Neon.tech](https://neon.tech/) (0.5 GB permanent free tier).
  2. Run the DDL schema migration script (from `DEPLOYMENT_ROADMAP.md` Section 4) in the Neon SQL Editor.
  3. Update `backend/database.py` to enforce `connect_args={"sslmode": "require"}` for PostgreSQL connections.
  4. Copy the Neon connection string and assign it as `DATABASE_URL` in the Render environment settings.

---

### 5. Restrict Backend CORS Origins
* **Problem**: `backend/main.py` currently has `allow_origins=["*"]`, allowing any external website to make cross-origin requests to your API.
* **Action Required**: Update CORS middleware in `backend/main.py` to restrict access strictly to:
  - Your production frontend domain (e.g. `https://kisansetu.vercel.app`)
  - Local development ports (`http://localhost:3000`, `http://localhost:5173`)

---

### 6. Create SPA Routing Configuration (`vercel.json`)
* **Problem**: Without a rewrite configuration, refreshing deep routes (like `/farmer/inventory` or direct listing URLs) on Vercel will trigger an HTTP 404 error because the static server tries to locate a physical directory.
* **Action Required**: Create `vercel.json` in the project root:
  ```json
  {
    "rewrites": [
      {
        "source": "/api/:path*",
        "destination": "https://kisansetu-backend.onrender.com/api/:path*"
      },
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  }
  ```

---

## 🟡 Priority P1 — High Priority (Resolve Immediately Before/At Launch)

### 1. Wire Dynamic Backend Base URL in `src/api.ts`
* **Problem**: `src/api.ts` currently sends API requests to relative paths (`/api/...`). When deployed on Vercel separately from Render, it must know how to reach the Render backend.
* **Action Required**: Add an environment variable resolver in `src/api.ts`:
  ```typescript
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
  ```
  Set `VITE_API_BASE_URL="https://kisansetu-backend.onrender.com"` in your Vercel project settings (or rely on `vercel.json` rewrites).

---

### 2. Implement Server-Side Authentication & JWT Verification
* **Problem**: The authentication flow in `backend/main.py` is currently in demo mode: any phone number and role creates a session without password verification, and API endpoints do not validate JWT bearer tokens.
* **Action Required**:
  1. Create `backend/auth.py` using `python-jose` and `passlib[bcrypt]` (already declared in `requirements.txt`).
  2. Require `Depends(get_current_user)` on mutating endpoints (`POST /api/listings`, `PUT /api/listings/{id}`, `POST /api/orders`).
  3. Verify that the user modifying a listing or order is the actual owner.

---

### 3. Configure Automated Keep-Alive Ping (UptimeRobot)
* **Problem**: Render's free tier spins down into sleep mode after 15 minutes of inactivity. The first visitor during a demonstration could experience a ~50-second cold start.
* **Action Required**: Set up a free HTTP monitor at [UptimeRobot.com](https://uptimerobot.com/) pinging `https://kisansetu-backend.onrender.com/api/health` every 10 minutes.

---

### 4. Remove Debug Console Statements
* **Problem**: `src/api.ts` and UI views contain lingering `console.log` and unhandled `console.warn` statements.
* **Action Required**: Clean up non-essential console outputs before running the production build.

---

## 🟢 Priority P2 — Medium Priority (First Post-Launch Sprint)

- [ ] **Automated Database Backups**: Set up a scheduled GitHub Action (`.github/workflows/db-backup.yml`) to run weekly `pg_dump` exports and save them as encrypted GitHub Artifacts.
- [ ] **SEO Optimization Files**: Add `public/robots.txt` and `public/sitemap.xml` to allow search engines to crawl public produce catalog pages.
- [ ] **Application Crash Reporting**: Integrate a free tier error tracker like [Sentry.io](https://sentry.io/) to capture client-side and server-side runtime exceptions in real time.
- [ ] **Rate Limiting**: Add `slowapi` or FastAPI rate-limiting middleware to protect public endpoints (`/api/pricing/recommend`) against denial-of-service abuse.

---

## ⚪ Priority P3 — Low Priority / Future Enhancements

- [ ] **Real Carrier SMS Gateway**: Replace the simulated 4-digit OTP delivery system with real SMS delivery via Fast2SMS or Twilio for Indian mobile numbers when funding allows.
- [ ] **Custom Domain Binding**: Purchase and link `kisansetu.in` via DNS CNAME records to replace the free `.vercel.app` and `.onrender.com` subdomains.
- [ ] **Redis Rate Caching**: Add an Upstash Redis cache for APMC daily mandi rates to reduce database queries.

---

## Quick Execution Summary Checklist

| Task | Target File / Service | Priority | Status |
| :--- | :--- | :---: | :---: |
| Add `psycopg2-binary` & `cloudinary` | `backend/requirements.txt` | 🔴 P0 | ✅ Completed |
| Add `CropRfq` table & REST routes | `backend/models.py`, `backend/main.py` | 🔴 P0 | ⏳ Pending |
| Configure Cloudinary credentials | Cloudinary Dashboard ➔ Render | 🔴 P0 | ⏳ Pending |
| Provision PostgreSQL & execute schema | Neon.tech ➔ Render `DATABASE_URL` | 🔴 P0 | ⏳ Pending |
| Restrict CORS origins | `backend/main.py` | 🔴 P0 | ⏳ Pending |
| Add SPA rewrite rule | `vercel.json` | 🔴 P0 | ⏳ Pending |
| Add `VITE_API_BASE_URL` | `src/api.ts` ➔ Vercel Settings | 🟡 P1 | ⏳ Pending |
| Wire JWT auth guards | `backend/auth.py` | 🟡 P1 | ⏳ Pending |
| Configure 10-min keep-alive ping | UptimeRobot | 🟡 P1 | ⏳ Pending |
| Clean debug console logs | `src/api.ts`, `src/components/` | 🟡 P1 | ⏳ Pending |

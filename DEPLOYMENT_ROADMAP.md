# 🌾 KisanSetu: Production Deployment & Zero-Cost Infrastructure Roadmap

This document outlines the step-by-step roadmap to take **KisanSetu (SIH-26033: Direct Farmer-to-Consumer Digital Agri-Marketplace)** from its current local development environment to a **secure, hardened, fully functional production application available over the public internet at ₹0/month ($0/month) recurring cost** using reliable free tiers.

---

## 1. Current Application Assessment

### 1.1 Technology Stack Inventory
| Layer | Current Implementation | Files / Location |
| :--- | :--- | :--- |
| **Frontend Core** | React 19, TypeScript 5.8, Vite 6 | `src/`, `package.json`, `tsconfig.json` |
| **Styling & UI** | Tailwind CSS v4, Lucide React icons, Framer Motion | `src/index.css`, `src/components/` |
| **Internationalization** | Bilingual English & Hindi (`en` / `hi`) with `localStorage` persistence | `src/i18n/`, `src/App.tsx` |
| **Frontend API Layer** | Centralized `API` object with `fetch` wrapper & JWT interceptor | `src/api.ts` |
| **Local Node Proxy** | Express dev server (`server.ts`) with disk uploads and Vite middleware | `server.ts` (used via `npm run dev`) |
| **Production Backend** | Python 3.10+ FastAPI framework with asynchronous endpoints | `backend/main.py` |
| **Database ORM** | SQLAlchemy 2.0 with unified SQLite / PostgreSQL engine | `backend/database.py`, `backend/models.py` |
| **Auth & Security** | Passlib (bcrypt) password hashing, Python-Jose JWT tokens, SlowAPI rate limiting | `backend/auth.py`, `backend/main.py` |
| **AI / ML Pricing** | Scikit-Learn `RandomForestRegressor` with deterministic fallback math | `backend/ml_engine.py` |
| **Smart Logistics** | 2-Stage Geodetic Traveling Salesperson Problem (TSP) heuristic | `backend/route_optimizer.py` |
| **Image Storage** | Dual-mode: Cloudinary cloud storage or local disk (`uploads/`) | `backend/main.py` lines 95–116, 258–338 |
| **Error Monitoring** | Sentry SDK integrated into React frontend and FastAPI backend | `package.json`, `backend/requirements.txt` |

---

### 1.2 Implemented vs. Pending Classification

```
┌────────────────────────────────────────────────────────────────────────┐
│                        KISANSETU STATUS MATRIX                         │
├──────────────────────────┬──────────────────────┬──────────────────────┤
│   ✅ FULLY IMPLEMENTED   │ ⚠️ REQUIRED FOR PROD │  🔮 FUTURE / SPRINT  │
├──────────────────────────┼──────────────────────┼──────────────────────┤
│ • React 19 UI & i18n     │ • Provision Cloud DB │ • Real SMS Gateway   │
│ • FastAPI Backend API    │ • Provision Cloud    │   (Fast2SMS/Twilio)  │
│ • SQLAlchemy Data Models │   Image Storage      │ • Live Razorpay UPI  │
│ • JWT + Bcrypt Auth Flow │ • Deploy Web Service │   Bank Settlement    │
│ • AI Pricing Engine      │ • Update Reverse     │ • Custom `.in`       │
│ • Logistics TSP Solver   │   Proxy Rewrite      │   Domain             │
│ • SlowAPI Rate Limiting  │ • Row-level lock for │ • History API Tab    │
│ • Crop RFQ Workflow      │   inventory deduction│   URL Synchronization│
│ • SQL Schema Script      │ • Keep-alive ping to │                      │
│ • GPG Encrypted Backups  │   prevent cold start │                      │
└──────────────────────────┴──────────────────────┴──────────────────────┘
```

#### What Must Change Before Live Deployment:
1. **Database Decoupling**: The backend defaults to `sqlite:///./agrimarket.db`. On cloud platforms with ephemeral containers (e.g., Render), any file written to disk is deleted upon container restart or idle spindown. A managed cloud PostgreSQL instance is mandatory.
2. **Persistent Image Storage**: Images saved to `backend/uploads/` vanish on server reboot. The application's existing Cloudinary driver (`CLOUDINARY_URL`) must be activated with live credentials.
3. **Frontend API Proxy Target**: `vercel.json` contains a placeholder destination (`https://kisansetu-backend.onrender.com/api/:path*`) that must be updated with the live backend URL once provisioned.
4. **Race Condition Protection**: The stock decrement endpoint in `backend/main.py` (`POST /api/orders`) needs a database row lock (`.with_for_update()`) to prevent overselling if two buyers purchase the same lot concurrently.
5. **Production Seed Guard**: In `src/App.tsx`, the `handleResetData()` function must be restricted in production so public users cannot wipe production orders.

---

## 2. Zero-Cost Infrastructure Constraint & Services

To satisfy the **₹0/month recurring infrastructure cost** constraint without relying on expiring trials, the following providers are selected:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     VERCEL      │       │     RENDER      │       │    NEON.TECH    │
│  Frontend & CDN │       │ Python Backend  │       │  PostgreSQL DB  │
│  Free Hobby Tier│       │  Free Web Tier  │       │ Serverless Free │
└────────┬────────┘       └────────▲────────┘       └────────▲────────┘
         │                         │                         │
         │ HTTPS /api/* Rewrite    │ SQL Queries (SSL)       │
         └─────────────────────────┴─────────────────────────┘
                                   │
                                   ├───────────────► ┌─────────────────┐
                                   │ HTTPS Upload    │   CLOUDINARY    │
                                   │                 │  Image Storage  │
                                   │                 │   Free Tier     │
                                   │                 └─────────────────┘
                                   │ Keep-Alive Ping
                          ┌────────┴────────┐
                          │   UPTIMEROBOT   │
                          │ Uptime Monitor  │
                          │   Free 50 Pings │
                          └─────────────────┘
```

### Free Tier Specifications & Failure Modes

| Service | Role | Free Tier Specifications | Strict Limits | Behavior When Limit Exceeded | Credit Card Required? |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Vercel** | Frontend Hosting & Global Edge CDN | • 100 GB Bandwidth/mo<br>• Unlimited static deployments<br>• Automated SSL certificates<br>• Edge routing & rewrites | 100 GB bandwidth per rolling 30 days | Site returns HTTP 402 / temporarily paused until cycle resets. (100 GB supports ~150,000 page visits/month for this app). | **No** |
| **Render** | FastAPI Backend Container | • 750 free instance hours/mo (sufficient for 1 continuous web service)<br>• 512 MB RAM, 0.1 CPU<br>• Automated HTTPS & custom subdomains | • Spindown after 15 minutes of inactivity<br>• 512 MB RAM ceiling | Container sleeps. Next incoming request triggers a **40–50 second cold start** delay. OOM crash if RAM exceeds 512 MB. | **No** |
| **Neon.tech** | Managed Serverless PostgreSQL 16 | • 0.5 GiB (500 MB) storage<br>• Connection pooling built-in<br>• SSL/TLS enforced transit<br>• Point-in-time recovery (24h) | • 500 MB disk space<br>• Compute autosuspends after 5 min idle | Database enters read-only mode if 500 MB exceeded. Compute wakes up within 500ms–1s upon incoming SQL query. | **No** |
| **Cloudinary** | Crop Photo Storage & Media CDN | • 25 Monthly Credits (~25,000 image transformations or 25 GB storage / net bandwidth)<br>• Global fast CDN distribution | 25 Credits per month | Further uploads return HTTP 400/403. Existing hosted images continue serving. | **No** |
| **UptimeRobot**| Keep-Alive & Availability Monitor | • 50 monitors<br>• 5-minute HTTP check intervals<br>• SSL certificate alerting | 50 monitor entries | Stops adding monitors; alerts continue to fire via email. | **No** |
| **GitHub Actions** | Automated Encrypted Backups & CI | • 2,000 execution minutes/month for private repos (unlimited for public repos) | 2,000 build minutes | Scheduled workflow runs queue or pause until monthly reset. | **No** |
| **Sentry** | Frontend & Backend Crash Tracking | • 5,000 error events/month<br>• 10,000 performance transactions | 5,000 errors | Drops excess error reports until monthly cycle renewal. Application is completely unaffected. | **No** |

---

## 3. Target Production Architecture

```
[ Visitor / Farmer / Buyer Browser ]
              │
              │ HTTPS (TLS 1.3)
              ▼
    ┌────────────────────────────────────────────────────────┐
    │              VERCEL GLOBAL EDGE NETWORK                │
    │  • Serves React Single Page Application (HTML/JS/CSS)  │
    │  • Handles SPA Client Fallbacks (/(.*) ➔ /index.html)  │
    │  • Reverse Proxy Rule: /api/:path* ➔ Render Backend    │
    └─────────────────────────┬──────────────────────────────┘
                              │
                              │ Internal HTTPS Reverse Proxy
                              ▼
    ┌────────────────────────────────────────────────────────┐
    │             RENDER FASTAPI WEB SERVICE                 │
    │  • Uvicorn ASGI Server (Port 10000 / $PORT)            │
    │  • SlowAPI Rate Limiting (10 req/min on Auth)          │
    │  • JWT Bearer Token Authentication & RBAC Guard        │
    │  • Scikit-Learn AI Fair Price Regressor                │
    │  • Logistics TSP Heuristic Route Optimizer             │
    │  • Row-Level Transaction Locking on Crop Stock         │
    └──────────────┬──────────────────────────┬──────────────┘
                   │                          │
       SQL (Port 5432 with SSL)     HTTPS Multipart Upload
                   │                          │
                   ▼                          ▼
    ┌─────────────────────────┐    ┌─────────────────────────┐
    │     NEON POSTGRESQL     │    │    CLOUDINARY MEDIA     │
    │  • Normalized Schema    │    │  • Direct Cloud Storage │
    │  • Foreign Key Cascades │    │  • Auto WebP/AVIF CDN   │
    │  • B-Tree Search Indexes│    │  • 5MB Hard Upload Cap  │
    │  • Connection Recycling │    │  • UUID-based Public IDs│
    └─────────────────────────┘    └─────────────────────────┘
```

### Architectural Responsibilities:
1. **Frontend**: Static bundle delivery over Vercel Edge CDN. Zero node runtime required in production.
2. **Reverse Proxying**: Vercel acts as a reverse proxy for API routes. The browser makes requests to `https://your-app.vercel.app/api/...`, which Vercel forwards to Render. This eliminates browser CORS preflight overhead and prevents third-party tracking blocks.
3. **Backend**: Pure stateless FastAPI server. Manages session authentication, cryptographic verification, business logic, algorithmic intelligence, and database transactions.
4. **Database**: Managed cloud PostgreSQL instance at Neon. Handles relational integrity, foreign key cascades, transaction atomicity, and persistent state.
5. **Storage**: Cloudinary acts as an external object store. The backend streams validated multipart image files directly to Cloudinary and stores only the resulting HTTPS CDN URL in PostgreSQL.

---

## 4. Database Architecture & Management

### 4.1 Relational Schema Design

```mermaid
erDiagram
    users ||--o{ crop_listings : "farms"
    users ||--o{ orders : "places (buyer) / fulfills (farmer)"
    users ||--o{ crop_rfqs : "submits (buyer) / reviews (farmer)"
    crop_listings ||--o{ orders : "ordered from"
    crop_listings ||--o{ crop_rfqs : "quoted against"

    users {
        int id PK
        string phone UK "Unique Index"
        string name
        string hashed_password
        string role "FARMER | BUYER | LOGISTICS"
        string district
        string state
        float trust_score
        string kyc_status
        timestamp created_at
    }

    crop_listings {
        int id PK
        int farmer_id FK
        string crop_name "B-Tree Index"
        string variety
        float quantity_quintals
        string quality_grade "Grade A | B | C"
        float expected_price_per_quintal
        float mandi_benchmark_price
        string status "ACTIVE | SOLD | EXPIRED"
        text images "JSON Array of Cloudinary URLs"
        timestamp created_at
    }

    orders {
        int id PK
        string order_number UK "Unique Index"
        int listing_id FK
        int buyer_id FK
        int farmer_id FK
        float quantity_ordered
        float total_amount
        string status "PLACED | CONFIRMED | DELIVERED"
        string payment_status "PENDING | ESCROW_HELD | RELEASED"
        string delivery_otp "4-Digit Handshake"
        timestamp created_at
    }

    crop_rfqs {
        string id PK "RFQ-YYYY-XXXX"
        int listing_id FK
        int buyer_id FK
        int farmer_id FK
        float required_quantity_quintals
        float expected_price_per_quintal
        string status "SUBMITTED | ACCEPTED | REJECTED"
        timestamp created_at
    }

    mandi_prices {
        int id PK
        string crop_name "B-Tree Index"
        string market_name
        float modal_price
        string arrival_date
    }

    logistics_batches {
        int id PK
        string batch_code UK
        string driver_name
        float distance_saved_pct
        string status
        text route_data_json
    }
```

---

### 4.2 Production DDL Script

The production database is initialized using `backend/neon_schema.sql`.

> [!IMPORTANT]
> Verify that the `users` table definition in PostgreSQL explicitly includes `hashed_password VARCHAR(255)`. Execute the following verified DDL in the **Neon SQL Editor**:

```sql
-- Ensure UUID and crypto extensions are ready
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(100)    NOT NULL,
    phone               VARCHAR(20)     NOT NULL UNIQUE,
    hashed_password     VARCHAR(255),
    email               VARCHAR(100),
    role                VARCHAR(30)     NOT NULL DEFAULT 'FARMER',
    fpo_name            VARCHAR(150),
    district            VARCHAR(100)    NOT NULL,
    state               VARCHAR(100)    NOT NULL,
    lat                 FLOAT,
    lng                 FLOAT,
    trust_score         FLOAT           NOT NULL DEFAULT 4.8,
    verified            BOOLEAN         NOT NULL DEFAULT TRUE,
    kyc_status          VARCHAR(50)     NOT NULL DEFAULT 'KYC_VERIFIED',
    total_trades        INTEGER         NOT NULL DEFAULT 12,
    rating_count        INTEGER         NOT NULL DEFAULT 10,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_users_phone ON users (phone);

-- 2. CROP LISTINGS TABLE
CREATE TABLE IF NOT EXISTS crop_listings (
    id                          SERIAL PRIMARY KEY,
    farmer_id                   INTEGER         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop_name                   VARCHAR(100)    NOT NULL,
    variety                     VARCHAR(100)    NOT NULL,
    quantity_quintals           FLOAT           NOT NULL,
    quality_grade               VARCHAR(20)     NOT NULL DEFAULT 'Grade A',
    harvest_date                VARCHAR(50)     NOT NULL,
    district                    VARCHAR(100)    NOT NULL,
    state                       VARCHAR(100)    NOT NULL,
    pincode                     VARCHAR(20)     NOT NULL,
    lat                         FLOAT           NOT NULL,
    lng                         FLOAT           NOT NULL,
    is_organic                  BOOLEAN         NOT NULL DEFAULT FALSE,
    expected_price_per_quintal  FLOAT           NOT NULL,
    mandi_benchmark_price       FLOAT           NOT NULL,
    ai_recommended_min          FLOAT           NOT NULL,
    ai_recommended_max          FLOAT           NOT NULL,
    ai_recommended_target       FLOAT           NOT NULL,
    status                      VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    notes                       TEXT,
    image_url                   VARCHAR(255),
    images                      TEXT,           -- JSON serialized list of image URLs
    created_at                  TIMESTAMP       NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_crop_listings_crop_name ON crop_listings (crop_name);
CREATE INDEX IF NOT EXISTS ix_crop_listings_farmer_id  ON crop_listings (farmer_id);
CREATE INDEX IF NOT EXISTS ix_crop_listings_status     ON crop_listings (status);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id                      SERIAL PRIMARY KEY,
    order_number            VARCHAR(50)     NOT NULL UNIQUE,
    listing_id              INTEGER         NOT NULL REFERENCES crop_listings(id),
    buyer_id                INTEGER         NOT NULL REFERENCES users(id),
    farmer_id               INTEGER         NOT NULL REFERENCES users(id),
    quantity_ordered        FLOAT           NOT NULL,
    price_per_quintal       FLOAT           NOT NULL,
    total_produce_amount    FLOAT           NOT NULL,
    logistics_fee           FLOAT           NOT NULL DEFAULT 0.0,
    platform_fee            FLOAT           NOT NULL DEFAULT 0.0,
    total_amount            FLOAT           NOT NULL,
    status                  VARCHAR(30)     NOT NULL DEFAULT 'PLACED',
    payment_status          VARCHAR(30)     NOT NULL DEFAULT 'PENDING',
    payment_ref             VARCHAR(100),
    delivery_address        TEXT            NOT NULL,
    delivery_pincode        VARCHAR(20)     NOT NULL,
    delivery_lat            FLOAT,
    delivery_lng            FLOAT,
    delivery_otp            VARCHAR(10)     NOT NULL DEFAULT '4829',
    created_at              TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP       NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_orders_order_number ON orders (order_number);
CREATE INDEX IF NOT EXISTS ix_orders_buyer_id     ON orders (buyer_id);
CREATE INDEX IF NOT EXISTS ix_orders_farmer_id    ON orders (farmer_id);

-- 4. CROP RFQS (REQUEST FOR QUOTATIONS)
CREATE TABLE IF NOT EXISTS crop_rfqs (
    id                          VARCHAR(50)     PRIMARY KEY,
    listing_id                  INTEGER         NOT NULL REFERENCES crop_listings(id),
    buyer_id                    INTEGER         NOT NULL REFERENCES users(id),
    farmer_id                   INTEGER         NOT NULL REFERENCES users(id),
    crop_name                   VARCHAR(100)    NOT NULL,
    variety                     VARCHAR(100)    NOT NULL,
    farmer_name                 VARCHAR(100),
    fpo_name                    VARCHAR(150),
    buyer_name                  VARCHAR(100),
    buyer_company               VARCHAR(150),
    buyer_phone                 VARCHAR(30),
    required_quantity_quintals  FLOAT           NOT NULL,
    expected_price_per_quintal  FLOAT           NOT NULL,
    delivery_location           VARCHAR(255)    NOT NULL,
    delivery_pincode            VARCHAR(20)     NOT NULL,
    delivery_timeline           VARCHAR(100)    NOT NULL,
    message                     TEXT,
    status                      VARCHAR(30)     NOT NULL DEFAULT 'SUBMITTED',
    created_at                  TIMESTAMP       NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_crop_rfqs_buyer_id   ON crop_rfqs (buyer_id);
CREATE INDEX IF NOT EXISTS ix_crop_rfqs_farmer_id  ON crop_rfqs (farmer_id);
CREATE INDEX IF NOT EXISTS ix_crop_rfqs_listing_id ON crop_rfqs (listing_id);

-- 5. MANDI PRICES BENCHMARK
CREATE TABLE IF NOT EXISTS mandi_prices (
    id              SERIAL PRIMARY KEY,
    crop_name       VARCHAR(100)    NOT NULL,
    market_name     VARCHAR(150)    NOT NULL,
    district        VARCHAR(100)    NOT NULL,
    state           VARCHAR(100)    NOT NULL,
    min_price       FLOAT           NOT NULL,
    max_price       FLOAT           NOT NULL,
    modal_price     FLOAT           NOT NULL,
    arrival_date    VARCHAR(50)     NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_mandi_prices_crop_name ON mandi_prices (crop_name);

-- 6. LOGISTICS BATCHES
CREATE TABLE IF NOT EXISTS logistics_batches (
    id                      SERIAL PRIMARY KEY,
    batch_code              VARCHAR(50)     NOT NULL UNIQUE,
    driver_name             VARCHAR(100)    NOT NULL,
    vehicle_number          VARCHAR(50)     NOT NULL,
    total_distance_km       FLOAT           NOT NULL,
    naive_distance_km       FLOAT           NOT NULL,
    distance_saved_pct      FLOAT           NOT NULL,
    transit_time_saved_hrs  FLOAT           NOT NULL,
    status                  VARCHAR(30)     NOT NULL DEFAULT 'SCHEDULED',
    route_data_json         TEXT,
    created_at              TIMESTAMP       NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_logistics_batches_batch_code ON logistics_batches (batch_code);
```

---

### 4.3 Database Connection Pool Configuration
Because Neon suspends compute instances after 5 minutes of idle time and enforces connection limits, `backend/database.py` includes production settings:

```python
connect_args = {"sslmode": "require"}
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_recycle=300,       # Recycles connections every 5 minutes to prevent stale sockets
    pool_pre_ping=True,     # Executes 'SELECT 1' before checkout to drop dead sockets silently
    pool_size=5,            # Neon Free Tier allows 20 concurrent connections; 5 is optimal
    max_overflow=2,         # Allows short bursts of up to 7 concurrent operations
)
```

---

### 4.4 Data Seeding & Migration to Production
To populate the production PostgreSQL database with the verified agricultural catalog (mandi rates, initial verified farmers, buyers, and sample listings):

1. Set the production connection string locally in a temporary environment variable:
   ```powershell
   $env:DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-xyz.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
   ```
2. Run the seeding script:
   ```powershell
   cd backend
   python seed_data.py
   ```
3. Remove the local override to return to SQLite for local development:
   ```powershell
   $env:DATABASE_URL=""
   ```

---

## 5. Authentication & Authorization

### 5.1 Architecture & Token Lifecycle

```
┌──────────────┐                 ┌──────────────┐                 ┌──────────────┐
│    Client    │                 │   FastAPI    │                 │  PostgreSQL  │
│ (React/Vite) │                 │   Backend    │                 │  (Neon DB)   │
└──────┬───────┘                 └──────┬───────┘                 └──────┬───────┘
       │                                │                                │
       │ 1. POST /api/auth/login        │                                │
       │    { phone, password }         │                                │
       ├───────────────────────────────►│                                │
       │                                │ 2. Query user by phone         │
       │                                ├───────────────────────────────►│
       │                                │◄───────────────────────────────┤
       │                                │ 3. Verify bcrypt hash          │
       │                                │ 4. Generate JWT Bearer Token   │
       │                                │    (Signed with HS256 secret)  │
       │ 5. Return User + access_token  │                                │
       │◄───────────────────────────────┤                                │
       │                                │                                │
       │ 6. Store token in localStorage │                                │
       │    Attach to headers:          │                                │
       │    Authorization: Bearer <JWT> │                                │
       │                                │                                │
       │ 7. Protected Route Request     │                                │
       │    POST /api/listings          │                                │
       ├───────────────────────────────►│                                │
       │                                │ 8. Decode JWT & verify expiry  │
       │                                │ 9. Enforce Role (e.g. FARMER)  │
       │                                │ 10. Execute Transaction       │
       │                                ├───────────────────────────────►│
       │                                │◄───────────────────────────────┤
       │ 11. Return 200 OK / 201 Created│                                │
       │◄───────────────────────────────┤                                │
```

### 5.2 Division of Security Responsibilities

| Responsibility | Handled By | Implementation Details |
| :--- | :--- | :--- |
| **Password Hashing** | Backend | `passlib[bcrypt]` with dynamic 12-round salt generation. Raw passwords are never written to disk, logs, or database. |
| **Session Identification** | Shared | Cryptographic JWT signed with `HS256`, 7-day expiration (`ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7`), stored in browser `localStorage`. |
| **UI Routing Guard** | Frontend | `src/App.tsx` role switchers prevent a Farmer from viewing Buyer checkout tabs or an unauthenticated user from accessing edit buttons. |
| **API Route Guard** | Backend | Dependency injection `Depends(get_current_user)` decodes the token; checks user ID against listing ownership (`verify_ownership(current_user, listing.farmer_id)`). |
| **IDOR Defense** | Backend | Direct Object Reference check: a user cannot update/delete an inventory item unless `current_user.id == listing.farmer_id`. |
| **Brute-Force Defense** | Backend | `slowapi` rate limiter caps `/api/auth/login` and `/api/auth/register` at **10 requests per minute per IP address**. |

---

## 6. KisanSetu-Specific Workflows

### 6.1 Farmer Workflow
* **Registration & Profile**: Farmer signs up with phone, full name, district, state, and optional FPO affiliation. KYC status defaults to `AADHAAR_KYC_VERIFIED`.
* **Crop Inventory**: Farmers can view all published harvest lots, active stock, quality grades, and pricing status.
* **Creating a Listing**: Form captures crop name, variety, harvest date, location coordinates, organic status, moisture level, and expected price.
* **Photo Upload**: Supports up to 10 photos per listing. Photos are uploaded as multipart formData to `/api/upload`. The backend saves them to Cloudinary and returns CDN URLs, which are stored in the listing's `images` JSON column.
* **AI Pricing Engine**: Before publishing, the farmer can call `/api/pricing/recommend`. The backend runs `ml_engine.py` (Random Forest model trained on APMC mandi data) to calculate a fair price range (`[min, target, max]`), accounting for quality grade premiums (+15% for Grade A) and middleman disintermediation margin (+18.5%).
* **Payout & Escrow**: Displays escrow balances for fulfilled orders.

### 6.2 Institutional Buyer Workflow
* **Marketplace & Filters**: Real-time filtering by crop name, district, quality grade, organic certification, and max price.
* **Granular Crop Modal**: Image gallery with full-resolution previews, farmer trust rating, and origin details.
* **Order Placement & Stock Row Locking**: When a buyer submits an order via `/api/orders`:
  1. Backend starts an atomic transaction.
  2. The listing row is locked (`with_for_update()`).
  3. Validates that requested quantity $\le$ available quantity.
  4. Deducts the quantity and creates an `Order` record in `PLACED` status.
* **Escrow UPI Simulation**: Generates a simulated UPI payment intent with dynamic QR code. Once confirmed, payment status shifts to `ESCROW_HELD`.
* **Physical Delivery & 4-Digit OTP**: The buyer inspects the delivered shipment at the warehouse, verifies produce quality, and supplies a 4-digit OTP. The backend validates the OTP, updates order status to `COMPLETED`, and releases funds (`RELEASED_TO_FARMER`).
* **Request for Quotation (RFQ)**: For large custom bulk orders, buyers submit an RFQ (`/api/rfqs`) specifying target quantity, expected rate, delivery location, and custom terms. The farmer can accept or reject the proposal from their dashboard.

---

## 7. Image & File Storage Architecture

```
[ User selects photos in browser ]
                │
                │ 1. Validate on client (MIME type, size ≤ 5MB, max 10 files)
                ▼
[ POST /api/upload (Multipart FormData) ]
                │
                │ 2. Backend validation (Content-Type header, byte length inspection)
                ▼
[ Cloudinary API: uploader.upload() ]
                │
                │ 3. Cloudinary generates public ID: 'kisansetu_crops/<uuid>_<filename>'
                │    Applies auto-compression (quality=auto, format=auto)
                ▼
[ Cloudinary CDN: https://res.cloudinary.com/.../image.webp ]
                │
                │ 4. Backend returns JSON: { "urls": ["https://res.cloudinary.com/..."] }
                ▼
[ React Form embeds URL into Listing payload ]
                │
                │ 5. POST /api/listings saves URLs into PostgreSQL `images` text column
                ▼
[ Browser displays image directly from Cloudinary Global CDN ]
```

### Storage Rules:
* **Max Size**: 5 MB per file.
* **Allowed MIME Types**: `image/jpeg`, `image/png`, `image/webp`.
* **Compression**: Cloudinary automatically converts uploads to modern WebP/AVIF format based on the client's `Accept` header.
* **Fallback Behavior**: If `CLOUDINARY_URL` is omitted (local development), `backend/main.py` automatically falls back to saving files locally in `backend/uploads/` and serves them from `/static/uploads/`.

---

## 8. Backend Deployment (Render)

### 8.1 Render Web Service Settings

```text
Service Type:        Web Service
Environment:         Python 3
Region:              Singapore (ap-southeast-1) or Frankfurt (closest to users)
Branch:              main
Root Directory:      backend
Build Command:       pip install --no-cache-dir -r requirements.txt
Start Command:       uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1
Instance Type:       Free (512 MB RAM, 0.1 vCPU)
Auto-Deploy:         Yes (deploys on push to main)
```

> [!NOTE]
> Render dynamically binds external traffic to an internal port assigned via the `$PORT` environment variable. Never hardcode port 8000 in your production start command; always use `--port $PORT`.

### 8.2 Backend Environment Variables on Render
Configure these in **Render Dashboard** $\rightarrow$ **Environment Variables**:

| Variable Name | Required Value / Source |
| :--- | :--- |
| `DATABASE_URL` | `postgresql://user:pass@ep-xyz.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` |
| `CLOUDINARY_URL` | `cloudinary://<api_key>:<api_secret>@<cloud_name>` |
| `JWT_SECRET_KEY` | *(Generate via `python -c "import secrets; print(secrets.token_hex(32))"`)* |
| `ALLOWED_ORIGINS` | `https://your-frontend.vercel.app,http://localhost:3000` |
| `SENTRY_DSN` | *(Optional — from your Sentry project dashboard)* |
| `PYTHONUNBUFFERED` | `1` (ensures logs appear in Render console in real time) |

---

## 9. Frontend Deployment (Vercel)

### 9.1 Vercel Project Settings

```text
Framework Preset:    Vite
Root Directory:      ./ (Project root)
Build Command:       npm run build
Output Directory:    dist
Install Command:     npm install
Node Version:        18.x or 20.x
```

### 9.2 Reverse Proxy Configuration (`vercel.json`)
Ensure your `vercel.json` contains the production proxy target:

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

### 9.3 Frontend Environment Variables on Vercel
Configure in **Vercel Dashboard** $\rightarrow$ **Settings** $\rightarrow$ **Environment Variables**:

| Variable | Value | Purpose |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `""` *(leave empty)* | Leaving this empty allows relative API calls (`/api/...`). Vercel's edge network proxies them directly to Render, eliminating CORS issues. |
| `VITE_SENTRY_DSN` | *(Optional Sentry DSN)* | Frontend client-side error reporting |

---

## 10. Domain, DNS & HTTPS

### Option A: Free Provider-Generated Subdomains (Default ₹0 Setup)
* **Frontend**: `https://kisansetu.vercel.app` (Free automated Let's Encrypt TLS certificate managed by Vercel)
* **Backend**: `https://kisansetu-backend.onrender.com` (Free automated Cloudflare/Let's Encrypt certificate managed by Render)
* **API Routing**: Handled seamlessly via the Vercel `/api/*` reverse proxy rewrite rule.

### Option B: Custom Domain (Optional — e.g., `kisansetu.in`)
If you purchase or own a custom domain, configure DNS records at your registrar:

| Type | Name / Host | Value / Target | Purpose |
| :--- | :--- | :--- | :--- |
| **A Record** | `@` (root) | `76.76.21.21` | Points root apex domain to Vercel Edge CDN |
| **CNAME** | `www` | `cname.vercel-dns.com` | Points www subdomain to Vercel Edge CDN |
| **CNAME** | `api` | `kisansetu-backend.onrender.com` | Directly maps `api.kisansetu.in` to Render |

After adding a custom domain:
1. Update `ALLOWED_ORIGINS` in Render: `https://kisansetu.in,https://www.kisansetu.in`
2. Update `destination` in `vercel.json` if proxying to the new subdomain: `https://api.kisansetu.in/api/:path*`

---

## 11. Environment Variables & Secrets Management

```text
┌──────────────────────────────────────────────────────────────────────┐
│                  ENVIRONMENT VARIABLES CLASSIFICATION                │
├──────────────────────────────────┬───────────────────────────────────┤
│    PUBLIC (Exposed to Client)    │     PRIVATE (Backend Secrets)     │
│   • Prefixed with VITE_          │   • Injected in Render / Neon     │
│   • Bundled into static JS       │   • NEVER commit to Git           │
├──────────────────────────────────┼───────────────────────────────────┤
│ • VITE_API_BASE_URL              │ • DATABASE_URL                    │
│ • VITE_SENTRY_DSN                │ • CLOUDINARY_URL                  │
│ • VITE_APP_VERSION               │ • JWT_SECRET_KEY                  │
│                                  │ • SENTRY_DSN                      │
│                                  │ • BACKUP_PASSPHRASE               │
└──────────────────────────────────┴───────────────────────────────────┘
```

### Git Exclusion Verification
Ensure `.gitignore` in the project root includes:
```gitignore
# Environment variables
.env
.env.local
.env.*.local
backend/.env

# Local database & storage
backend/agrimarket.db
backend/uploads/
uploads/
```

---

## 12. Security Hardening Checklist

### Immediate Essential Protections
* [x] **SQL Injection Defense**: 100% of queries use SQLAlchemy parameterization (`db.query(...)`). No raw SQL string formatting.
* [x] **Cross-Site Scripting (XSS)**: React JSX automatically escapes dynamic values before DOM rendering.
* [x] **Brute-Force Rate Limiting**: `slowapi` enforces a hard limit of 10 attempts per minute on `/api/auth/register` and `/api/auth/login`.
* [x] **Input Payload Validation**: Pydantic v2 schemas (`backend/schemas.py`) enforce type safety, bounds checks, and regex validation on all request bodies.
* [x] **Secure Image Uploads**: 5 MB file size limit and explicit MIME type whitelisting (`image/jpeg`, `image/png`, `image/webp`).
* [x] **Strict CORS Headers**: FastAPI explicitly lists authorized origins, allowed HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`), and required headers (`Authorization`, `Content-Type`).

### Production Code Enhancements
To complete launch hardening, apply two small updates:

#### 1. Add HTTP Security Headers in `backend/main.py`
```python
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response
```

#### 2. Stock Row Locking in `backend/main.py` (Line 650)
```python
# Use with_for_update() to prevent race conditions during checkout:
listing = db.query(CropListing).with_for_update().filter(
    CropListing.id == payload.listing_id, 
    CropListing.status == ListingStatus.ACTIVE
).first()
```

---

## 13. Database Backup & Disaster Recovery

An automated, encrypted backup pipeline is pre-configured in `.github/workflows/db-backup.yml`.

```mermaid
sequenceDiagram
    participant GH as GitHub Actions Cron (Weekly)
    participant Neon as Neon PostgreSQL
    participant Runner as Ubuntu Runner
    participant Art as GitHub Artifact Storage (90 Days)

    GH->>Runner: Trigger job: db-backup.yml
    Runner->>Neon: pg_dump (Plain SQL dump)
    Neon-->>Runner: Stream table schemas & records
    Runner->>Runner: gzip -9 (Max compression)
    Runner->>Runner: gpg --symmetric --cipher-algo AES256 (Passphrase Encrypt)
    Runner->>Art: Upload encrypted .sql.gz.gpg
```

### 13.1 Restoring From a Backup
If you ever need to restore a backup:

1. Download the encrypted artifact file `kisansetu_backup_YYYYMMDD_HHMMSS.sql.gz.gpg` from GitHub Actions.
2. Decrypt the file using your `BACKUP_PASSPHRASE`:
   ```bash
   gpg --decrypt --output backup.sql.gz kisansetu_backup_YYYYMMDD_HHMMSS.sql.gz.gpg
   ```
3. Decompress the gzip archive:
   ```bash
   gzip -d backup.sql.gz
   ```
4. Restore into the target PostgreSQL database:
   ```bash
   psql "$DATABASE_URL" < backup.sql
   ```

---

## 14. Monitoring & Cold-Start Mitigation

### 14.1 Cold-Start Mitigation via UptimeRobot
Render's free tier spins down services after 15 minutes of inactivity. To keep the service warm and responsive:

1. Register a free account at [UptimeRobot.com](https://uptimerobot.com/).
2. Click **Add New Monitor**:
   * **Monitor Type**: `HTTP(s)`
   * **Friendly Name**: `KisanSetu Backend Keep-Alive`
   * **URL (or IP)**: `https://YOUR-BACKEND.onrender.com/api/health`
   * **Monitoring Interval**: `Every 10 minutes`
3. Click **Create Monitor**.
4. UptimeRobot will ping the `/api/health` endpoint every 10 minutes, keeping the Render container active and preventing cold starts during daytime hours.

---

## 15. Continuous Integration & Deployment (CI/CD)

```mermaid
gitGraph
    commit id: "Feature Work"
    commit id: "Local Tests Pass"
    branch feature
    checkout feature
    commit id: "Refactor / Fix"
    checkout main
    merge feature id: "Push to main"
    commit id: "CI Validation"
```

* **Vercel**: Automatically tracks the `main` branch. Every push triggers an automated build (`npm run build`). If compilation succeeds, the new build is promoted to production in under 60 seconds with zero downtime.
* **Render**: Automatically tracks the `backend` directory on the `main` branch. It pulls the latest commits, runs `pip install -r requirements.txt`, and restarts Uvicorn gracefully.
* **Rollbacks**: Both Vercel and Render allow instant, one-click rollbacks to any previous successful deployment via their web dashboards.

---

## 16. Local Development vs. Production Setup

| Aspect | Local Development | Production Environment |
| :--- | :--- | :--- |
| **Frontend Server** | Vite HMR (`http://localhost:3000`) | Vercel Edge CDN (`https://kisansetu.vercel.app`) |
| **Backend API** | Uvicorn (`http://localhost:8000`) | Render Container (`https://kisansetu-backend.onrender.com`) |
| **Database** | SQLite file (`backend/agrimarket.db`) | Serverless PostgreSQL (`Neon.tech`) |
| **Media Storage** | Local folder (`backend/uploads/`) | Cloudinary Media CDN |
| **CORS Origins** | `localhost:3000`, `localhost:5173` | Exact Vercel domain |
| **Logging** | Detailed verbose console output | Sentry aggregated telemetry & Render logs |

To run the full stack locally:
* **Terminal 1 (Frontend)**: `npm run dev`
* **Terminal 2 (Backend)**: `cd backend && venv\Scripts\activate && uvicorn main:app --reload --port 8000`

---

## 17. Pre-Launch Testing Strategy

### 17.1 Functional Verification Matrix
Execute these end-to-end tests before publishing the application:

- [ ] **Farmer Registration**: Register with a new phone number. Confirm instant token creation and redirect to `/inventory`.
- [ ] **AI Price Estimate**: Open the listing creation form. Request an AI price recommendation and verify that the calculated price band displays correctly.
- [ ] **Photo Upload**: Upload 2 photos. Verify that Cloudinary returns HTTPS URLs (`https://res.cloudinary.com/...`) and that thumbnails render properly.
- [ ] **Produce Discovery**: Switch role to Institutional Buyer. Search for the newly created crop; test district and grade filters.
- [ ] **Bulk Order Checkout**: Place an order for produce. Verify that the listed quantity decreases by the ordered amount.
- [ ] **Escrow UPI Simulation**: Click "Pay via UPI". Verify that the modal generates a payment reference and transitions to `ESCROW_HELD`.
- [ ] **OTP Delivery Handshake**: Enter delivery OTP `4829`. Verify that the order transitions to `DELIVERED` and escrow updates to `RELEASED_TO_FARMER`.
- [ ] **Bilingual i18n**: Click the language toggle to switch between **English** and **हिंदी**. Refresh the browser and confirm that the language setting persists.

---

## 18. Performance Optimization for Free Tiers

1. **Vite Dynamic Splitting**: Heavy dependencies like `@sentry/react` and `lucide-react` are bundled efficiently.
2. **Cloudinary Automatic Format**: Cloudinary converts images to modern `.webp` or `.avif` formats on the fly, reducing image payload sizes by ~65%.
3. **Database Connection Recycling**: `pool_recycle=300` and `pool_pre_ping=True` prevent application timeouts caused by stale connections after idle periods.
4. **Relational B-Tree Indexes**: Indexes on `users(phone)`, `crop_listings(crop_name)`, and `orders(order_number)` keep query lookups fast ($O(\log N)$) even as data grows.

---

## 19. Exact Step-by-Step Deployment Process

Follow these steps in order:

### Step 1: Provision Cloud Database on Neon
1. Visit [Neon.tech](https://neon.tech/) and sign up with your GitHub account.
2. Create a project named `kisansetu-prod` in your preferred cloud region (e.g., `AWS ap-southeast-1 Singapore`).
3. In the left navigation, click **SQL Editor**.
4. Paste the full DDL script from [Section 4.2](#42-production-ddl-script) and click **Run**.
5. Click **Dashboard**, switch the connection string dropdown to **PostgreSQL**, and copy the connection URI:
   ```text
   postgresql://neondb_owner:YOUR_PASSWORD@ep-XYZ.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

---

### Step 2: Set Up Image Storage on Cloudinary
1. Visit [Cloudinary.com](https://cloudinary.com/) and register a free account.
2. In your dashboard, find the **API Environment variable**:
   ```text
   cloudinary://<api_key>:<api_secret>@<cloud_name>
   ```
3. Copy this string for use in the Render backend configuration.

---

### Step 3: Deploy Backend to Render
1. Visit [Render Dashboard](https://dashboard.render.com/) and click **New +** $\rightarrow$ **Web Service**.
2. Connect your `SIH-26033-KisanSetu` GitHub repository.
3. Set the service configuration:
   * **Name**: `kisansetu-backend`
   * **Root Directory**: `backend`
   * **Runtime**: `Python 3`
   * **Build Command**: `pip install --no-cache-dir -r requirements.txt`
   * **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   * **Instance Type**: `Free`
4. Add the **Environment Variables**:
   * `DATABASE_URL`: *(Your Neon PostgreSQL URI)*
   * `CLOUDINARY_URL`: *(Your Cloudinary URI)*
   * `JWT_SECRET_KEY`: *(Generate via `python -c "import secrets; print(secrets.token_hex(32))"`)*
   * `ALLOWED_ORIGINS`: `https://kisansetu.vercel.app,http://localhost:3000`
5. Click **Create Web Service**. Wait 3–4 minutes for the build to finish.
6. Copy your assigned service URL (e.g., `https://kisansetu-backend.onrender.com`).
7. Test the health endpoint in your browser: `https://kisansetu-backend.onrender.com/api/health`. It should return:
   ```json
   { "status": "healthy", "service": "KisanSetu Agri-Marketplace API", "image_storage": "cloudinary" }
   ```

---

### Step 4: Update Vercel Proxy and Deploy Frontend
1. Open `vercel.json` in your code editor.
2. Replace `https://kisansetu-backend.onrender.com` with your actual Render URL:
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
3. Commit and push the updated `vercel.json` to GitHub:
   ```bash
   git add vercel.json
   git commit -m "chore: configure production Render proxy URL"
   git push origin main
   ```
4. Open [Vercel Dashboard](https://vercel.com/) $\rightarrow$ **Add New Project** $\rightarrow$ Import your repo.
5. Keep the defaults (**Framework Preset**: Vite, **Output Directory**: `dist`).
6. Click **Deploy**. Vercel will build and assign your production URL (e.g., `https://kisansetu.vercel.app`).

---

### Step 5: Configure Keep-Alive Monitor
1. Open [UptimeRobot.com](https://uptimerobot.com/).
2. Create an **HTTP(s)** monitor pointing to `https://YOUR-RENDER-URL.onrender.com/api/health` with a **10-minute interval**.
3. Save the monitor to keep the Render free-tier container warm.

---

### Step 6: Configure GitHub Actions Backup Secrets
1. Go to your GitHub repository $\rightarrow$ **Settings** $\rightarrow$ **Secrets and variables** $\rightarrow$ **Actions**.
2. Add the following repository secrets:
   * `DATABASE_URL`: *(Your Neon PostgreSQL URI)*
   * `BACKUP_PASSPHRASE`: *(A strong passphrase used to encrypt weekly database dumps)*
3. To verify the workflow, go to the **Actions** tab, select **Weekly Database Backup**, and click **Run workflow**. Verify that the run completes successfully and generates an encrypted artifact.

---

## 20. Troubleshooting Guide

```
┌──────────────────────────────┬────────────────────────────────────────────────────────┐
│ SYMPTOM                      │ RESOLUTION                                             │
├──────────────────────────────┼────────────────────────────────────────────────────────┤
│ API returns 404 on Vercel    │ In vercel.json, check that destination includes        │
│                              │ /api/:path* at the end of your Render URL.             │
├──────────────────────────────┼────────────────────────────────────────────────────────┤
│ Browser CORS Error           │ Update ALLOWED_ORIGINS in Render to include your exact │
│                              │ Vercel URL (e.g., https://kisansetu.vercel.app).       │
├──────────────────────────────┼────────────────────────────────────────────────────────┤
│ Neon SSL Connection Error    │ Ensure DATABASE_URL ends with ?sslmode=require.        │
├──────────────────────────────┼────────────────────────────────────────────────────────┤
│ Image Upload Returns 502     │ Verify that CLOUDINARY_URL in Render is correct and    │
│                              │ starts with cloudinary://.                             │
├──────────────────────────────┼────────────────────────────────────────────────────────┤
│ 40-Second Delay on First Req │ Render free tier is waking up from cold sleep. Verify  │
│                              │ your UptimeRobot monitor is actively pinging.          │
├──────────────────────────────┼────────────────────────────────────────────────────────┤
│ Refreshing page shows 404    │ Ensure the SPA rewrite rule (/(.*) ➔ /index.html)      │
│                              │ is present in vercel.json.                             │
└──────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 21. Future Scaling Path

If the platform grows beyond free-tier capacity, upgrade components incrementally as needed:

```
[ Free MVP Tier: ₹0/month ]
  • Vercel Hobby + Render Free + Neon Free + Cloudinary Free
  │
  │ ~5,000 active farmers/buyers
  ▼
[ Growth Tier: ~₹1,200 – ₹2,500/month ]
  • Custom domain: kisansetu.in (~₹800/year)
  • Render Starter Web Service ($7/mo): Dedicated CPU, zero cold starts
  • Neon Launch Tier ($19/mo): Autoscaling storage and compute
  │
  │ Enterprise / Government Integration
  ▼
[ Full Production Tier: ~₹8,000/month ]
  • Dedicated PostgreSQL with read replicas
  • Razorpay live payment gateway with webhook verification
  • Fast2SMS / Twilio transactional SMS delivery for feature phones
  • Redis cache for live APMC mandi price feeds
```

---

## 22. Final Production Checklist

- [ ] **Cloud Database**: Neon PostgreSQL project created and tables initialized with `backend/neon_schema.sql`.
- [ ] **Cloud Storage**: Cloudinary account registered and `CLOUDINARY_URL` generated.
- [ ] **Backend Deployed**: FastAPI running on Render; `/api/health` returns `200 OK`.
- [ ] **Environment Secrets Injected**: `DATABASE_URL`, `CLOUDINARY_URL`, `JWT_SECRET_KEY`, and `ALLOWED_ORIGINS` configured on Render.
- [ ] **Reverse Proxy Updated**: `vercel.json` points to the live Render backend URL.
- [ ] **Frontend Deployed**: React/Vite app live on Vercel over HTTPS.
- [ ] **Keep-Alive Configured**: UptimeRobot monitor pinging `/api/health` every 10 minutes.
- [ ] **Backups Configured**: GitHub Secrets (`DATABASE_URL`, `BACKUP_PASSPHRASE`) set; test workflow executed.
- [ ] **Security Verified**: Passwords hashed with bcrypt; rate limiting active on `/api/auth/*`.
- [ ] **End-to-End Workflow Tested**: Created listing with photo, simulated buyer order, verified escrow lifecycle, and tested delivery OTP handshake.

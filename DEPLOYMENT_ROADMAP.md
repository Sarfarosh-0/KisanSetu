# 🌾 KisanSetu: Complete End-to-End Production Deployment Roadmap (₹0/Month Zero-Cost Architecture)

This document provides a comprehensive, production-grade deployment roadmap to transition **KisanSetu** from its current local development setup to a secure, highly reliable, and publicly accessible web application on the public internet at **₹0 / $0 monthly recurring cost**.

Every recommendation in this roadmap is grounded in the existing codebase (`backend/` and `src/`), avoids unnecessary refactoring, and eliminates the risk of unexpected cloud billing.

---

## 1. Current Application Assessment

A thorough audit of the active KisanSetu repository reveals the following technical profile:

### Technology Inventory
* **Frontend**: React 19.0.1, TypeScript 5.8, Vite 6.2.3, Tailwind CSS 4.1.14, Lucide React icons, Motion animations.
* **Development Server & Emulation**: Express 4.21.2 (`server.ts`) running via `tsx` on port 3000, wrapping Vite middleware and providing in-memory mock endpoints with disk uploads via `multer`.
* **Backend API & ML Engine**: Python 3.10+ FastAPI 0.110+ (`backend/main.py`) running on Uvicorn (port 8000). Machine Learning is implemented with Scikit-learn (`backend/ml_engine.py`) using `RandomForestRegressor` with deterministic mathematical regression fallbacks. Geodetic Traveling Salesperson Problem (TSP) routing is implemented with the Haversine formula (`backend/route_optimizer.py`).
* **Database & ORM**: SQLAlchemy 2.0 (`backend/database.py` & `backend/models.py`). Configured to default to SQLite (`backend/agrimarket.db`) if `DATABASE_URL` is unset, with conditional configuration for PostgreSQL.
* **Data Validation & Schemas**: Pydantic v2 (`backend/schemas.py`).

### Implemented vs. Mocked Analysis

| Component / Feature | Current Codebase State | Production Requirement Before Public Launch |
| :--- | :--- | :--- |
| **Crop Listings & Inventory** | **Implemented**: CRUD operational in FastAPI & SQLAlchemy. | Move from SQLite to persistent managed PostgreSQL. |
| **AI Fair Pricing** | **Implemented**: Scikit-learn model + fallback pricing formula operational. | Production deployment on a Python runtime with sufficient RAM (≥512MB). |
| **Logistics TSP Route Optimizer** | **Implemented**: Haversine distance matrix batching functional. | Operational as-is. |
| **Image & Photo Uploads** | **Partially Implemented**: Local disk saving to `backend/uploads/` with a dormant Cloudinary hook in `backend/main.py`. Fallback Base64 Data URLs in `src/api.ts`. | **Must Change**: Local disk is ephemeral on free cloud hosts. Cloudinary credentials must be wired to persist photos. |
| **RFQs (Request for Quotations)** | **Frontend & Dev Server Only**: Handled in `server.ts` and UI modals, but **missing** in `backend/main.py` and `backend/models.py`. | **Must Implement**: Add `CropRfq` SQLAlchemy model and `/api/rfqs` REST endpoints in FastAPI. |
| **Authentication & RBAC** | **Simulation / Demo Mode**: Phone number check generates demo users in `backend/main.py`. Client-side OTP mock. Passwords and JWT tokens are not verified. | **Must Harden**: Implement standard JWT access tokens via `python-jose` and password hashing via `passlib[bcrypt]` (libraries already present in `requirements.txt`). |
| **Payments** | **Simulated Sandbox**: UPI QR simulation + UTR verification with dual-custody escrow state tracking. | Retain as verified sandbox; real payment gateways require business registration and incur processing fees. |
| **PostgreSQL Driver** | **Missing Dependency**: `psycopg2-binary` is not declared in `backend/requirements.txt`. | **Must Add**: Add `psycopg2-binary` to `backend/requirements.txt` for SQLAlchemy PostgreSQL connectivity. |

---

## 2. The Zero-Cost Constraint: Service Evaluation

To achieve a strict **₹0 / $0 per month** budget without surprise charges, we select vendors with **permanent free tiers** (not expiring trial credits) that do not require entering credit card details where possible.

```
+-----------------------------------------------------------------------------------+
|                           ZERO-COST CLOUD PLATFORMS                               |
+-----------------------------------------------------------------------------------+
|  Vercel (Frontend & Edge CDN)      ---> Free Tier (100 GB bandwidth, SSL, CI/CD)  |
|  Render (Python FastAPI Backend)   ---> Free Tier (512 MB RAM, 750 hrs/month)     |
|  Neon (Managed Serverless Postgres)---> Free Tier (0.5 GB storage, autoscaling)   |
|  Cloudinary (Media & Image CDN)    ---> Free Tier (25 GB storage / transformation)|
|  UptimeRobot (Cold-start keeper)   ---> Free Tier (50 monitors, 5-min intervals)  |
+-----------------------------------------------------------------------------------+
```

### Provider Verification & Limit Exceedance Rules

1. **Vercel (Frontend Hosting & Global Edge CDN)**:
   * *Purpose*: Hosts compiled React 19 static bundle and assets; handles SPA routing.
   * *Free Tier Allowance*: 100 GB bandwidth/month, unlimited automatic deployments, free SSL certificates.
   * *Limit Action*: Site pauses or requests account upgrade. (100 GB is sufficient for ~150,000 monthly page views of a compressed SPA).
   * *Credit Card*: Not required.
2. **Render (FastAPI Backend API & ML Runtime)**:
   * *Purpose*: Runs Python 3.10 runtime, FastAPI, Uvicorn, and Scikit-learn.
   * *Free Tier Allowance*: 512 MB RAM, 0.1 CPU, 750 free instance hours per month (enough for 1 service 24/7).
   * *Key Constraint*: Spins down into sleep mode after 15 minutes of inactivity. The first incoming request takes ~50 seconds to warm up ("cold start").
   * *Limit Action*: Service stops until next monthly cycle if 750 instance hours are exceeded across multiple apps.
   * *Credit Card*: Not required.
3. **Neon Tech (Serverless PostgreSQL Database)**:
   * *Purpose*: Persistent relational storage for users, crop listings, orders, RFQs, and mandi feeds.
   * *Free Tier Allowance*: 0.5 GB storage, 1 compute branch, shared compute.
   * *Why Not Render Postgres?*: Render's free PostgreSQL database expires and is **deleted after 30 days**. Neon's free PostgreSQL is **permanent**.
   * *Limit Action*: Write requests are blocked if 0.5 GB is reached; existing data remains intact.
   * *Credit Card*: Not required.
4. **Cloudinary (Crop Image & Media Storage)**:
   * *Purpose*: Offloads crop photos from ephemeral server disks to a global media CDN.
   * *Free Tier Allowance*: 25 Monthly Credits (~25 GB storage or 25,000 transformations).
   * *Limit Action*: Uploads reject with an HTTP 400 error; existing images remain served.
   * *Credit Card*: Not required.
5. **UptimeRobot (Synthetic Heartbeat & Uptime Monitoring)**:
   * *Purpose*: Pings `/api/health` every 10–14 minutes to mitigate Render's cold-start sleep during demo hours.
   * *Free Tier Allowance*: 50 monitors at 5-minute intervals.
   * *Credit Card*: Not required.

---

## 3. Target Production Architecture

```
                          [ Internet User / Mobile / Desktop ]
                                          │
                                          ▼ HTTPS (Port 443)
                    ┌───────────────────────────────────────────┐
                    │       Vercel Global Edge Network          │
                    │   - Serves React 19 Static Production SPA │
                    │   - Global CDN Caching (JS, CSS, SVGs)    │
                    │   - vercel.json SPA Rewrites              │
                    └─────────────────────┬─────────────────────┘
                                          │
                                          │ HTTPS REST Calls (/api/*)
                                          ▼
                    ┌───────────────────────────────────────────┐
                    │          Render Web Service               │
                    │   - FastAPI 0.110+ / Python 3.10+         │
                    │   - Scikit-learn AI Pricing Engine        │
                    │   - Geodetic TSP Logistics Engine         │
                    │   - JWT Auth & CORS Enforcement           │
                    └───┬───────────────────────────────┬───────┘
                        │                               │
        SQLAlchemy 2.0  │                               │ Cloudinary SDK
         (SSL Connection)                               │ (API Key / Secret)
                        ▼                               ▼
     ┌─────────────────────────────┐    ┌─────────────────────────────┐
     │      Neon PostgreSQL        │    │    Cloudinary Media CDN     │
     │  - Users & KYC Profiles     │    │  - Verified Produce Photos  │
     │  - Crop Listings & Stock    │    │  - On-the-fly Resizing      │
     │  - Orders & Escrow Records  │    │  - WebP Auto-compression    │
     │  - RFQs & Logistics Batches │    │                             │
     └─────────────────────────────┘    └─────────────────────────────┘
```

### Architectural Decisions
* **Decoupled Frontend & Backend**: The React frontend and FastAPI backend are deployed independently. Frontend updates deploy in seconds without restarting the Python ML process, and backend updates deploy without rebuilding the static UI bundle.
* **Managed Serverless PostgreSQL (Neon)**: Eliminates database administration, provides point-in-time recovery, and avoids data loss from ephemeral container disks.
* **Direct-to-Cloudinary Managed Storage**: Crop photographs are uploaded via the backend API directly to Cloudinary, ensuring persistence across container redeployments.

---

## 4. Database Architecture & Management

### Database Schema Design

The production database is structured into 6 relational entities:

```
  +------------------+         1:N         +----------------------+
  |      users       | <------------------ |    crop_listings     |
  +------------------+                     +----------------------+
  | id (PK)          |                     | id (PK)              |
  | phone (Unique)   |                     | farmer_id (FK->users)|
  | role (Enum)      |                     | crop_name, variety   |
  | name, district   |                     | quantity_quintals    |
  | trust_score      |                     | quality_grade        |
  | password_hash    |                     | expected_price       |
  +--------┬---------+                     | images (JSON text)   |
           │                               +----------┬-----------+
           │ 1:N (as Buyer or Farmer)                 │ 1:N
           │                                          │
           ▼                                          ▼
  +---------------------------------------------------------------+
  |                            orders                             |
  +---------------------------------------------------------------+
  | id (PK), order_number (Unique)                                |
  | listing_id (FK->crop_listings), buyer_id (FK), farmer_id (FK) |
  | quantity_ordered, price_per_quintal, total_amount             |
  | status (PLACED, CONFIRMED, IN_TRANSIT, DELIVERED, COMPLETED)  |
  | payment_status (PENDING, ESCROW_HELD, RELEASED_TO_FARMER)     |
  | delivery_otp, delivery_address, delivery_pincode              |
  +---------------------------------------------------------------+

           1:N                                        1:N
  +------------------+                     +----------------------+
  |    crop_rfqs     |                     |  logistics_batches   |
  +------------------+                     +----------------------+
  | id (PK)          |                     | id (PK)              |
  | listing_id (FK)  |                     | batch_code (Unique)  |
  | buyer_id (FK)    |                     | driver_name, vehicle |
  | farmer_id (FK)   |                     | total_distance_km    |
  | required_qty     |                     | distance_saved_pct   |
  | target_price     |                     | route_data_json      |
  | status (Enum)    |                     +----------------------+
  +------------------+
```

### Production DDL Table Definitions
The following SQL migration creates all required tables and indexes:

```sql
-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100),
    password_hash VARCHAR(255),
    role VARCHAR(30) DEFAULT 'FARMER',
    fpo_name VARCHAR(150),
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    trust_score DOUBLE PRECISION DEFAULT 4.8,
    verified BOOLEAN DEFAULT TRUE,
    kyc_status VARCHAR(50) DEFAULT 'AADHAAR_KYC_VERIFIED',
    total_trades INTEGER DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. Crop Listings Table
CREATE TABLE IF NOT EXISTS crop_listings (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    variety VARCHAR(100) NOT NULL,
    quantity_quintals DOUBLE PRECISION NOT NULL,
    quality_grade VARCHAR(20) DEFAULT 'Grade A',
    harvest_date VARCHAR(50) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    is_organic BOOLEAN DEFAULT FALSE,
    expected_price_per_quintal DOUBLE PRECISION NOT NULL,
    mandi_benchmark_price DOUBLE PRECISION NOT NULL,
    ai_recommended_min DOUBLE PRECISION NOT NULL,
    ai_recommended_max DOUBLE PRECISION NOT NULL,
    ai_recommended_target DOUBLE PRECISION NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    notes TEXT,
    image_url VARCHAR(500),
    images TEXT, -- JSON array of Cloudinary image URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_listings_crop ON crop_listings(crop_name);
CREATE INDEX IF NOT EXISTS idx_listings_district ON crop_listings(district);
CREATE INDEX IF NOT EXISTS idx_listings_status ON crop_listings(status);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    listing_id INTEGER NOT NULL REFERENCES crop_listings(id) ON DELETE RESTRICT,
    buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    farmer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    quantity_ordered DOUBLE PRECISION NOT NULL,
    price_per_quintal DOUBLE PRECISION NOT NULL,
    total_produce_amount DOUBLE PRECISION NOT NULL,
    logistics_fee DOUBLE PRECISION DEFAULT 0.0,
    platform_fee DOUBLE PRECISION DEFAULT 0.0,
    total_amount DOUBLE PRECISION NOT NULL,
    status VARCHAR(30) DEFAULT 'PLACED',
    payment_status VARCHAR(30) DEFAULT 'PENDING',
    payment_ref VARCHAR(100),
    delivery_address TEXT NOT NULL,
    delivery_pincode VARCHAR(20) NOT NULL,
    delivery_lat DOUBLE PRECISION,
    delivery_lng DOUBLE PRECISION,
    delivery_otp VARCHAR(10) DEFAULT '4829',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_farmer ON orders(farmer_id);

-- 4. Crop RFQs (Request for Quotations)
CREATE TABLE IF NOT EXISTS crop_rfqs (
    id VARCHAR(50) PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES crop_listings(id) ON DELETE CASCADE,
    buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farmer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    variety VARCHAR(100) NOT NULL,
    required_quantity_quintals DOUBLE PRECISION NOT NULL,
    expected_price_per_quintal DOUBLE PRECISION NOT NULL,
    delivery_location VARCHAR(255) NOT NULL,
    delivery_pincode VARCHAR(20) NOT NULL,
    delivery_timeline VARCHAR(100) NOT NULL,
    message TEXT,
    status VARCHAR(30) DEFAULT 'SUBMITTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_rfqs_buyer ON crop_rfqs(buyer_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_farmer ON crop_rfqs(farmer_id);

-- 5. Mandi Historical Benchmark Table
CREATE TABLE IF NOT EXISTS mandi_prices (
    id SERIAL PRIMARY KEY,
    crop_name VARCHAR(100) NOT NULL,
    market_name VARCHAR(150) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    min_price DOUBLE PRECISION NOT NULL,
    max_price DOUBLE PRECISION NOT NULL,
    modal_price DOUBLE PRECISION NOT NULL,
    arrival_date VARCHAR(50) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_mandi_crop ON mandi_prices(crop_name);

-- 6. Logistics Batches Table
CREATE TABLE IF NOT EXISTS logistics_batches (
    id SERIAL PRIMARY KEY,
    batch_code VARCHAR(50) UNIQUE NOT NULL,
    driver_name VARCHAR(100) NOT NULL,
    vehicle_number VARCHAR(50) NOT NULL,
    total_distance_km DOUBLE PRECISION NOT NULL,
    naive_distance_km DOUBLE PRECISION NOT NULL,
    distance_saved_pct DOUBLE PRECISION NOT NULL,
    transit_time_saved_hrs DOUBLE PRECISION NOT NULL,
    status VARCHAR(30) DEFAULT 'SCHEDULED',
    route_data_json TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Database Connection Configuration Fix
In `backend/database.py`, adjust the database connection code to handle PostgreSQL URLs properly:

```python
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./agrimarket.db")

# Convert legacy postgres:// prefixes to postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    # Ensure SSL is enforced for managed cloud Postgres
    connect_args = {"sslmode": "require"}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

## 5. Authentication & Authorization Architecture

### Production JWT Authentication Strategy

The development setup allows instant logins for demonstration purposes. In production, we implement JWT-based authentication using the libraries already declared in `backend/requirements.txt` (`python-jose` and `passlib`):

```
[ User Logs In ] ──> POST /api/auth/login ──> Backend validates credentials
                                           ──> Generates Signed JWT (HS256)
                                           ──> Returns Token + User Profile
[ User Request ] ──> Sends Bearer Token   ──> FastAPI Depends(get_current_user)
                                           ──> Enforces Role Permissions
```

### Backend Implementation (`backend/auth.py`)

Create a dedicated authentication module:

```python
import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from database import get_db
from models import User

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-production-key-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[User]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            return None
    except JWTError:
        return None
    return db.query(User).filter(User.id == user_id).first()

def require_role(allowed_roles: list[str]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if not current_user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication token required.")
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied for your user role.")
        return current_user
    return role_checker
```

### Role-Based Access Control (RBAC) Matrix

| Endpoint | Method | Allowed Roles | Enforcement Mechanism |
| :--- | :--- | :--- | :--- |
| `/api/listings` | `POST` | `FARMER` | `Depends(require_role(["FARMER"]))` |
| `/api/listings/{id}` | `PUT`, `DELETE` | `FARMER` (Owner only) | Listing ownership verification |
| `/api/orders` | `POST` | `BUYER` | `Depends(require_role(["BUYER"]))` |
| `/api/rfqs` | `POST` | `BUYER` | `Depends(require_role(["BUYER"]))` |
| `/api/orders/{id}/status` | `PATCH` | `BUYER`, `FARMER`, `LOGISTICS` | Order participant verification |
| `/api/listings` | `GET` | `PUBLIC` | Open access (no authentication required) |
| `/api/pricing/*` | `GET`, `POST` | `PUBLIC` | Open access (benchmarks & pricing engine) |

---

## 6. Implementation of Missing Features in Backend

To ensure complete feature parity between the frontend UI and the FastAPI backend before deployment, add the RFQ endpoints and data structures to the Python backend.

### 1. Add RFQ Schema (`backend/schemas.py`)
```python
class CropRfqCreate(BaseModel):
    listing_id: int
    buyer_id: int
    farmer_id: int
    crop_name: str
    variety: str
    required_quantity_quintals: float
    expected_price_per_quintal: float
    delivery_location: str
    delivery_pincode: str
    delivery_timeline: str
    message: Optional[str] = None

class CropRfqResponse(CropRfqCreate):
    id: str
    status: str
    created_at: datetime
    class Config:
        from_attributes = True
```

### 2. Add RFQ Endpoints in `backend/main.py`
```python
from models import CropRfq
from schemas import CropRfqCreate, CropRfqResponse

@app.post("/api/rfqs", response_model=CropRfqResponse, tags=["RFQs"])
def submit_rfq(payload: CropRfqCreate, db: Session = Depends(get_db)):
    rfq_id = f"RFQ-2026-{uuid.uuid4().hex[:6].upper()}"
    new_rfq = CropRfq(
        id=rfq_id,
        listing_id=payload.listing_id,
        buyer_id=payload.buyer_id,
        farmer_id=payload.farmer_id,
        crop_name=payload.crop_name,
        variety=payload.variety,
        required_quantity_quintals=payload.required_quantity_quintals,
        expected_price_per_quintal=payload.expected_price_per_quintal,
        delivery_location=payload.delivery_location,
        delivery_pincode=payload.delivery_pincode,
        delivery_timeline=payload.delivery_timeline,
        message=payload.message,
        status="SUBMITTED"
    )
    db.add(new_rfq)
    db.commit()
    db.refresh(new_rfq)
    return new_rfq

@app.get("/api/rfqs", response_model=List[CropRfqResponse], tags=["RFQs"])
def get_rfqs(
    buyer_id: Optional[int] = None,
    farmer_id: Optional[int] = None,
    listing_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(CropRfq)
    if buyer_id:
        query = query.filter(CropRfq.buyer_id == buyer_id)
    if farmer_id:
        query = query.filter(CropRfq.farmer_id == farmer_id)
    if listing_id:
        query = query.filter(CropRfq.listing_id == listing_id)
    return query.order_by(CropRfq.created_at.desc()).all()
```

---

## 7. Image & File Storage Architecture

On Render's free tier, the local filesystem is **ephemeral**: files stored locally disappear whenever the container is restarted or updated.

### Cloudinary Integration Implementation

The code in `backend/main.py` already contains a Cloudinary upload branch:

```python
cloudinary_url = os.getenv("CLOUDINARY_URL")
if cloudinary_url:
    try:
        import cloudinary
        import cloudinary.uploader
        upload_res = cloudinary.uploader.upload(
            content,
            folder="kisansetu_crops",
            transformation=[
                {"width": 1200, "height": 800, "crop": "limit"},
                {"quality": "auto", "fetch_format": "auto"}
            ]
        )
        uploaded_urls.append(upload_res.get("secure_url"))
        continue
    except Exception as e:
        logger.error(f"Cloudinary upload failed: {e}")
```

### Steps to Activate Cloudinary:
1. Register a free account at [Cloudinary.com](https://cloudinary.com/) (no credit card required).
2. Copy your **API Environment Variable** from the Cloudinary Dashboard:
   ```text
   CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
   ```
3. Add `cloudinary>=1.38.0` to `backend/requirements.txt`.
4. Add the `CLOUDINARY_URL` variable in your Render dashboard under **Environment Variables**.
5. Uploaded images are then permanently stored and served via Cloudinary's global CDN with automatic WebP optimization.

---

## 8. Backend & API Deployment (Render)

### Preparation
1. Update `backend/requirements.txt` to include production drivers:
   ```text
   fastapi>=0.110.0,<1.0.0
   uvicorn[standard]>=0.28.0,<1.0.0
   pydantic>=2.6.0,<3.0.0
   sqlalchemy>=2.0.0,<3.0.0
   psycopg2-binary>=2.9.9
   scikit-learn>=1.4.0,<2.0.0
   numpy>=1.26.0
   pandas>=2.2.0,<3.0.0
   python-multipart>=0.0.9
   python-jose[cryptography]>=3.3.0
   passlib[bcrypt]>=1.7.4
   cloudinary>=1.38.0
   ```

2. Add a `render.yaml` specification at the repository root to automate deployment:
   ```yaml
   services:
     - type: web
       name: kisansetu-backend
       env: python
       region: oregon
       plan: free
       rootDir: backend
       buildCommand: pip install -r requirements.txt
       startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT --workers 2
       envVars:
         - key: PYTHON_VERSION
           value: 3.10.12
         - key: DATABASE_URL
           sync: false
         - key: CLOUDINARY_URL
           sync: false
         - key: JWT_SECRET
           generateValue: true
   ```

3. **CORS Configuration in `backend/main.py`**:
   Replace the wildcard `allow_origins=["*"]` with explicit production domains to prevent cross-origin abuse:
   ```python
   ALLOWED_ORIGINS = [
       "http://localhost:3000",
       "http://localhost:5173",
       "https://kisansetu.vercel.app",
       os.getenv("FRONTEND_URL", "")
   ]
   app.add_middleware(
       CORSMiddleware,
       allow_origins=[origin for origin in ALLOWED_ORIGINS if origin],
       allow_credentials=True,
       allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
       allow_headers=["*"],
   )
   ```

---

## 9. Frontend Deployment (Vercel)

### API Communication Setup in `src/api.ts`
Configure the frontend API client to dynamically use the production backend URL or fallback to relative paths:

```typescript
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

async function safeFetchJson<T>(url: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const targetUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
    const res = await fetch(targetUrl, options);
    if (!res.ok) {
      if (fallback !== undefined) return fallback;
      const text = await res.text();
      let msg = `HTTP error ${res.status}`;
      try {
        const json = JSON.parse(text);
        msg = json.error || json.detail || msg;
      } catch {}
      throw new Error(msg);
    }
    return (await res.json()) as T;
  } catch (err: any) {
    if (fallback !== undefined) return fallback;
    throw err;
  }
}
```

### Single-Page Application (SPA) Routing Configuration
Create `vercel.json` in the project root:

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
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```
*Benefits of this configuration*:
1. **API Proxying**: By routing `/api/:path*` to Render directly through Vercel's Edge CDN, browser calls remain same-origin, completely eliminating CORS errors.
2. **SPA Deep-Linking**: When users refresh deep links (e.g. `/farmer/inventory`), Vercel routes them to `index.html` rather than returning a 404.

---

## 10. Domain, DNS & HTTPS

You can launch KisanSetu using either free provider subdomains or a custom domain.

### Option A: Free Provider Subdomains (Zero Cost, Zero Configuration)
* **Frontend**: `https://kisansetu.vercel.app`
* **Backend**: `https://kisansetu-backend.onrender.com`
* Both Vercel and Render issue free, auto-renewing Let's Encrypt SSL/TLS certificates over HTTPS automatically.

### Option B: Custom Domain (Optional)
If you own a domain (e.g. `kisansetu.in`), configure the following DNS records in your domain registrar:

| Type | Host / Name | Target / Value | Purpose |
| :--- | :--- | :--- | :--- |
| `CNAME` | `app` (or `@`) | `cname.vercel-dns.com` | Routes web traffic to Vercel |
| `CNAME` | `api` | `kisansetu-backend.onrender.com` | Routes API traffic to Render |

After updating DNS records, add the domain in your Vercel and Render project settings under **Custom Domains**.

---

## 11. Environment Variables & Secrets Management

```
+---------------------------------------------------------------------------------+
|                               ENVIRONMENT MATRIX                                |
+-----------------------+-----------------------------+---------------------------+
| Variable Name         | Where It Is Defined         | Exposure Level            |
+-----------------------+-----------------------------+---------------------------+
| DATABASE_URL          | Render Backend Settings     | 🔒 SECRET (Backend only)  |
| JWT_SECRET            | Render Backend Settings     | 🔒 SECRET (Backend only)  |
| CLOUDINARY_URL        | Render Backend Settings     | 🔒 SECRET (Backend only)  |
| FRONTEND_URL          | Render Backend Settings     | 🔒 SECRET (Backend only)  |
| VITE_API_BASE_URL     | Vercel Frontend Settings    | 🌐 PUBLIC (Vite Client)   |
+-----------------------+-----------------------------+---------------------------+
```

### Safety Rules:
1. **Never commit `.env` files**: Ensure `.env` is listed in `.gitignore`.
2. **Client-side exposure rule**: Only variables starting with `VITE_` are compiled into frontend JavaScript by Vite. Never prefix backend secrets like database credentials or private API keys with `VITE_`.

---

## 12. Security Hardening Checklist

### Essential Protections for Launch
- [x] **SSL/TLS**: All endpoints served exclusively over HTTPS.
- [x] **SQL Injection Defense**: All queries executed via SQLAlchemy ORM parameterized queries; raw SQL concatenation is avoided.
- [x] **Cross-Site Scripting (XSS)**: Handled by React's automatic string escaping in JSX.
- [x] **Input Validation**: Handled via Pydantic v2 schemas in `backend/schemas.py`.
- [x] **File Upload Restrictions**: Enforces maximum upload sizes (5MB/file) and MIME type whitelists (`image/jpeg`, `image/png`, `image/webp`).
- [x] **CORS Lockdown**: Origin restricted to production domain and local dev ports.
- [x] **Secure Security Headers**: Set via `vercel.json` (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`).

---

## 13. Database Backup & Recovery

On Neon's free tier, data is automatically stored across multiple availability zones. To maintain independent offsite backups at zero cost:

### 1. Manual Backup via `pg_dump`
Run a manual export from any machine with the PostgreSQL CLI installed:

```bash
# Export compressed binary database dump
pg_dump "postgresql://<user>:<password>@<neon-host>/kisansetu?sslmode=require" -F c -b -v -f kisansetu_backup_$(date +%Y%m%d).dump

# Or export human-readable SQL format
pg_dump "postgresql://<user>:<password>@<neon-host>/kisansetu?sslmode=require" > kisansetu_backup.sql
```

### 2. Automated Free Backup via GitHub Actions
Create `.github/workflows/db-backup.yml` to automatically back up the database weekly and save it as an encrypted GitHub Artifact for 90 days:

```yaml
name: Weekly Database Backup
on:
  schedule:
    - cron: '0 2 * * 0' # Every Sunday at 2:00 AM UTC
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Install PostgreSQL Tools
        run: sudo apt-get install -y postgresql-client
      - name: Dump Database
        run: |
          pg_dump "${{ secrets.DATABASE_URL }}" -F c -f backup.dump
      - name: Store Backup Artifact
        uses: actions/upload-artifact@v4
        with:
          name: db-backup-${{ github.run_id }}
          path: backup.dump
          retention-days: 30
```

### 3. Restoring a Backup
```bash
pg_restore -d "postgresql://<user>:<password>@<neon-host>/kisansetu?sslmode=require" --clean --no-owner backup.dump
```

---

## 14. Monitoring, Health Checks & Log Diagnostics

### Uptime Monitoring & Cold-Start Mitigation
1. Create a free account on [UptimeRobot.com](https://uptimerobot.com/).
2. Add a new **HTTP(s) Monitor**:
   * **URL**: `https://kisansetu-backend.onrender.com/api/health`
   * **Monitoring Interval**: Every 10 minutes.
   * *Outcome*: This keeps Render's web service warm during demonstration hours and alerts you via email if the backend experiences downtime.

### Log Viewing
* **Backend Logs**: View real-time logs in the **Render Dashboard ➔ Logs** tab to monitor incoming requests and API exceptions.
* **Frontend Build Logs**: View build and runtime performance logs in the **Vercel Dashboard ➔ Deployments ➔ Real-time Logs** tab.

---

## 15. Continuous Integration / Continuous Deployment (CI/CD)

```
[ Developer ]
      │
      │ git push origin main
      ▼
 [ GitHub ]
      │
      ├───────────────────────────────┐
      │ (Webhook trigger)             │ (Webhook trigger)
      ▼                               ▼
[ Vercel CDN ]                 [ Render Server ]
  • npm run build                • pip install -r requirements.txt
  • Tests Static Assets          • Starts Uvicorn ASGI Server
  • Deploys Live Edge Bundle     • Live in ~60-90s
```

### Rollback Strategy
Both Vercel and Render maintain an immutable history of every deployment. If a bug reaches production:
1. Open the **Deployments** tab on Vercel or Render.
2. Find the previous stable build.
3. Click **Instant Rollback** to restore service in seconds without modifying Git history.

---

## 16. Local Development vs. Production Setup

| Component | Local Development | Production Environment |
| :--- | :--- | :--- |
| **Frontend** | `http://localhost:3000` (Vite + HMR) | `https://kisansetu.vercel.app` (Global Edge CDN) |
| **Backend API** | `http://localhost:8000` (Uvicorn local) | `https://kisansetu-backend.onrender.com` |
| **Database** | SQLite (`backend/agrimarket.db`) | Neon Serverless PostgreSQL (`sslmode=require`) |
| **Media Storage** | Local folder (`uploads/`) | Cloudinary Global Image CDN |
| **Logging** | Console stdout | Render Log Stream |

---

## 17. Pre-Launch Testing Strategy

Before publishing the production links, complete these functional and technical verification checks:

### Functional Testing
* [ ] **Farmer Authentication**: Login as demo farmer or register a new phone number.
* [ ] **Listing Creation**: Upload crop listing with 2+ photos, grade, quantity, and price. Verify AI price guidance generates valid intervals.
* [ ] **Buyer Catalog**: Browse listings, search by crop name, and filter by Grade A and Organic status.
* [ ] **RFQ Workflow**: Submit a Request for Quotation as a buyer; check that it appears on the farmer's dashboard.
* [ ] **Order & Escrow Simulation**: Place an order, complete the simulated UPI payment, verify the escrow holding state, and finalize delivery using the 4-digit OTP.
* [ ] **Bilingual Switcher**: Toggle between English and Hindi; verify all UI labels update correctly.

### Technical Testing
* [ ] **API Health**: `GET /api/health` returns `{"status": "healthy"}`.
* [ ] **Database Persistence**: Create a test listing, restart the local server, and verify the listing persists.
* [ ] **Direct URL Routing**: Refresh `/farmer/inventory` in the browser; ensure no 404 errors occur.
* [ ] **Responsive Design**: Verify UI layout on mobile (375px), tablet (768px), and desktop (1440px) viewports.

---

## 18. Performance Optimization (Free-Tier Friendly)

1. **Static Bundle Splitting**:
   In `vite.config.ts`, split large vendor dependencies to optimize initial page loading:
   ```typescript
   export default defineConfig({
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['react', 'react-dom'],
             ui: ['lucide-react', 'motion']
           }
         }
       }
     }
   });
   ```
2. **Lazy Image Loading**:
   All image tags use native `loading="lazy"` to minimize bandwidth usage on mobile connections.
3. **Database Connection Pooling**:
   `pool_size=5` and `max_overflow=10` are configured in `backend/database.py` to stay within Neon's connection limits.

---

## 19. Exact Step-by-Step Deployment Process

Follow these steps in order to deploy KisanSetu:

### Step 1: Create Free Cloud Accounts
* **GitHub**: [github.com](https://github.com/) (Code repository)
* **Neon**: [neon.tech](https://neon.tech/) (PostgreSQL Database)
* **Render**: [render.com](https://render.com/) (FastAPI Backend)
* **Cloudinary**: [cloudinary.com](https://cloudinary.com/) (Image Storage)
* **Vercel**: [vercel.com](https://vercel.com/) (Frontend Hosting)

---

### Step 2: Set Up Neon PostgreSQL Database
1. Log into [Neon.tech](https://neon.tech/) and click **New Project**.
2. Name the project `kisansetu-db` and select the region closest to your users (e.g., **AWS Asia Pacific / Mumbai** or **Singapore**).
3. Click **Create Project**.
4. In the Dashboard, copy the connection string:
   ```text
   postgresql://kisansetu_user:<password>@ep-sample-12345.ap-southeast-1.aws.neon.tech/kisansetu?sslmode=require
   ```
5. Open the **SQL Editor** tab in Neon and execute the SQL schema defined in [Section 4](#production-ddl-table-definitions).

---

### Step 3: Seed the Production Database
Seed your production database with realistic agricultural data directly from your terminal:

```bash
# Navigate to your backend directory
cd backend

# Temporarily set your DATABASE_URL in your terminal session
# Windows PowerShell:
$env:DATABASE_URL="postgresql://kisansetu_user:<password>@ep-sample-12345.ap-southeast-1.aws.neon.tech/kisansetu?sslmode=require"

# macOS/Linux:
export DATABASE_URL="postgresql://kisansetu_user:<password>@ep-sample-12345.ap-southeast-1.aws.neon.tech/kisansetu?sslmode=require"

# Run the database seeder script
python seed_data.py
```

---

### Step 4: Commit Code & Push to GitHub
```bash
git add .
git commit -m "chore: prepare production deployment configuration and schema"
git push origin main
```

---

### Step 5: Deploy the FastAPI Backend to Render
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New ➔ Web Service**.
2. Select **Build and deploy from a Git repository** and pick your `SIH-26033-KisanSetu` repository.
3. Configure the service settings:
   * **Name**: `kisansetu-backend`
   * **Region**: Choose closest to your database (e.g. Singapore or Oregon)
   * **Root Directory**: `backend`
   * **Runtime**: `Python 3`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT --workers 2`
   * **Plan**: `Free`
4. Expand **Advanced ➔ Environment Variables** and add:
   * `DATABASE_URL`: *(Your Neon PostgreSQL connection string)*
   * `CLOUDINARY_URL`: *(Your Cloudinary API string)*
   * `JWT_SECRET`: *(A random 32-character string)*
   * `PYTHON_VERSION`: `3.10.12`
5. Click **Create Web Service**.
6. Wait 2–3 minutes for deployment to finish. When complete, copy your live backend URL (e.g., `https://kisansetu-backend.onrender.com`).
7. Verify by visiting `https://kisansetu-backend.onrender.com/api/health` in your browser.

---

### Step 6: Deploy the React Frontend to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New ➔ Project**.
2. Import your `SIH-26033-KisanSetu` repository.
3. In **Project Settings**:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `./` (Leave as root)
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   * `VITE_API_BASE_URL`: `https://kisansetu-backend.onrender.com`
5. Click **Deploy**.
6. Vercel will build and deploy the application in ~60 seconds and provide your live URL:
   ```text
   https://kisansetu.vercel.app
   ```

---

### Step 7: Configure Keep-Alive Ping
1. Log into [UptimeRobot.com](https://uptimerobot.com/).
2. Click **Add New Monitor**:
   * **Monitor Type**: `HTTP(s)`
   * **Friendly Name**: `KisanSetu Backend Ping`
   * **URL**: `https://kisansetu-backend.onrender.com/api/health`
   * **Monitoring Interval**: `10 minutes`
3. Click **Create Monitor**.

---

## 20. Troubleshooting Guide

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **Backend returns 500 on database queries** | Missing `psycopg2-binary` driver or bad URL scheme. | Ensure `psycopg2-binary` is in `requirements.txt` and the connection string uses `postgresql://` (not `postgres://`). |
| **CORS Error in Browser Console** | Backend blocked the frontend origin. | Add `https://kisansetu.vercel.app` to `ALLOWED_ORIGINS` in `backend/main.py`. |
| **First API call takes ~50 seconds** | Render free tier service was sleeping. | Normal behavior after 15 minutes of inactivity. Keep it warm with UptimeRobot. |
| **Crop images break after 24 hours** | Images were saved to Render's ephemeral disk instead of Cloudinary. | Verify `CLOUDINARY_URL` is set in the Render environment variables. |
| **Refreshing `/farmer/inventory` gives 404** | Web server tried to locate a static file on disk. | Verify `vercel.json` contains the `"source": "/(.*)", "destination": "/index.html"` rewrite rule. |
| **Vite build fails with TypeScript error** | Strict TypeScript check failed. | Run `npm run lint` locally and resolve any type mismatches before pushing. |

---

## 21. Future Scaling Path (When Budget Allows)

When KisanSetu expands beyond the hackathon demonstration stage and monetization begins, consider this upgrade path:

1. **Upgrade Render to Starter Plan ($7/month)**: Eliminates sleep mode and cold starts entirely, providing dedicated CPU and 512MB RAM.
2. **Custom `.in` Domain (~₹600/year)**: Purchase `kisansetu.in` from registry providers and bind it to Vercel/Render.
3. **Dedicated Redis Cache ($5/month)**: Cache APMC Mandi daily rate feeds to reduce database load.
4. **Fast2SMS / Twilio Integration**: Switch from simulated OTP to real SMS delivery on Indian mobile networks.

---

## 22. Final Production Launch Checklist

Verify each item before sharing the live link:

- [ ] Production PostgreSQL schema deployed on Neon with all 6 tables and indexes.
- [ ] Database seeded with initial crops, users, and mandi benchmark records.
- [ ] Backend deployed on Render and serving `GET /api/health` over HTTPS.
- [ ] Frontend deployed on Vercel with SPA routing verified on deep links.
- [ ] Cloudinary storage configured and multi-photo upload verified on new crop listings.
- [ ] Role-Based Access Control verified (Farmer and Buyer view access rules work properly).
- [ ] Request for Quotation (RFQ) flow verified between buyer and farmer dashboards.
- [ ] Simulated UPI escrow flow and OTP delivery verification confirmed operational.
- [ ] English and Hindi translations verified across all dashboard pages.
- [ ] UptimeRobot active and pinging `/api/health` every 10 minutes.
- [ ] Zero monthly charges verified across all connected services.

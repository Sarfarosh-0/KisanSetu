# 🌾 किसानSetu (KisanSetu)
### Direct Farmer-to-Consumer Digital Agri-Marketplace
**Smart India Hackathon (SIH 2026) | Problem Statement: SIH26033**

[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite%206-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%204-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.110%2B-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Express](https://img.shields.io/badge/DevServer-Express%20%2B%20tsx-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Machine Learning](https://img.shields.io/badge/ML-Scikit--Learn-F7931E?logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Database](https://img.shields.io/badge/Database-SQLite%20%2F%20PostgreSQL-336791?logo=postgresql&logoColor=white)](https://www.sqlalchemy.org/)

---

## 📌 Overview

**KisanSetu** ("Farmer's Bridge") is a digital agricultural marketplace built to eliminate multi-layered intermediaries between Indian agricultural producers and commercial/institutional buyers.

In traditional agricultural supply chains, farm produce passes through 4 to 6 layers of middlemen (village aggregators, commission agents / *arhatiyas*, wholesale mandis, transport brokers, and local retailers). As a result:
- **Farmers** receive only **30% to 50%** of the final retail price and frequently face distress selling due to information asymmetry.
- **Buyers** (institutional buyers, retail consumers, FPOs, hotels, restaurants, and food processors) pay inflated prices to cover intermediary commissions and handling markups.
- **Perishable food crops** suffer **15% to 25% post-harvest transit wastage** due to uncoordinated, individual farm transport.

**KisanSetu bridges this gap** through direct farm-gate listing, an AI-assisted fair pricing engine benchmarked against APMC mandis, multi-pickup logistics route optimization, and milestone-based escrow payments verified via dual-OTP handshakes.

---

## 🔍 Implementation Status & Architecture Tiers

To provide full clarity on platform maturity, features are classified into three operational categories:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        KISANSETU PLATFORM TIERS                        │
├─────────────────────┬──────────────────────────┬───────────────────────┤
│ ✅ FULLY IMPLEMENTED│ 🧪 DEMO / SIMULATED      │ 🔮 PLANNED / ROADMAP  │
├─────────────────────┼──────────────────────────┼───────────────────────┤
│ • Farmer Inventory  │ • UPI Payment Sandbox    │ • Dedicated Logistics │
│ • Multi-Image Upload│   (Mock UTR validation)  │   & Govt Portals      │
│ • Buyer Marketplace │ • Phone / OTP Auth       │ • Live Agmarknet /    │
│ • AI Pricing Engine │   (Simulated SMS delivery)│   e-NAM API Feeds     │
│ • Geodetic TSP Route│ • Static Mandi Database  │ • Real Banking Gate-  │
│   Optimization      │   (Curated APMC rates)   │   ways (Razorpay/eRUPI│
│ • Vernacular (Hi/En)│ • Agro-Advisories/Weather│ • Production Telecom  │
│ • Dual-Run Modes    │   (Curated mock data)    │   DLT SMS Gateways    │
│   (Full-Stack/Node) │ • Logistics Tracking     │ • IoT Truck Telematics│
│ • RBAC Navigation   │   (Static coordinate TSP)│   & Cold-Chain Sensors│
└─────────────────────┴──────────────────────────┴───────────────────────┘
```

---

## 🚀 Key Features & Workflows

### 🌾 1. Role-Based Marketplace Workflows (RBAC)

KisanSetu provides role-tailored workspaces with strict route guarding, deep-link query parameter synchronization (`?tab=...`), and automatic redirection:

- **Farmer Workspace**:
  - **Produce Inventory (`FarmerInventory.tsx`)**: Monitor active listings, stock availability, quality grades, harvest dates, and packaging specs with search and status filtering.
  - **Listing Creation & Photo Management (`FarmerCropForm.tsx`)**: Create and update crop listings with quality grade (Grade A/B/C), organic certification, harvest date, location, moisture %, packaging type, shelf life, and multi-image photo uploads (supports up to 10 photos, ≤5MB each, stored via local disk or Cloudinary).
  - **Automated AI Price Fetching**: Automatically calculates fair price targets and min-max boundaries when creating listings.
  - **Buyer RFQs (`FarmerBuyerRequests.tsx`)**: Review incoming Requests for Quotation (RFQs) and purchase requests directly from wholesale buyers.
  - **Payouts & Escrow Tracking (`FarmerPayouts.tsx`)**: Monitor escrow holdings, completed transactions, and payout history.
  - **Weather & Agronomy Insights (`FarmerWeatherInsights.tsx`)**: View localized weather alerts, harvest forecasts, and soil-specific advisories (curated demo dataset).

- **Buyer Workspace**:
  - **Catalog Discovery (`BuyerMarketplace.tsx` / `BuyerDashboard.tsx`)**: Browse available farm produce with real-time multi-parameter filters (crop, grade, district, organic certification, max price, and global text search).
  - **Crop Details Modal (`CropDetailsPage.tsx`)**: Granular lot specifications, farm origin coordinates, harvest dates, seller trust score, and packaging info.
  - **Bulk Orders & RFQs (`BuyerBulkOrders.tsx`)**: Submit Requests for Quotation for bulk volume procurement directly to producers.
  - **Contracts & Purchase Orders (`BuyerContracts.tsx`)**: Review binding farm-gate purchase orders and fulfillment milestones.
  - **Payment & Escrow Management (`BuyerPaymentEscrow.tsx`)**: Track escrow milestones and verify order settlements.

- **Authentication & Role Switching (`components/auth/`)**:
  - Full-screen login and registration (`LoginPage.tsx`, `RegistrationForm.tsx`) supporting phone, password, and simulated OTP verification.
  - Smooth role switcher between Farmer and Buyer accounts with automatic RBAC tab correction.
  - User profiles backed by JWT tokens stored securely in `localStorage`.
  - Unsupported role safeguards: Users logged in as `LOGISTICS` or `GOVT_OFFICIAL` receive a "Portal Coming Soon" notification with one-click role switching.

---

### 🤖 2. AI Fair Price Recommendation Engine

- **Data-Driven Valuation**: Powered by a Scikit-Learn regression engine (`RandomForestRegressor` in `backend/ml_engine.py` with automatic mathematical fallback if scikit-learn is not installed) trained on historical APMC mandi trading data.
- **Dynamic Price Band**: Recommends an equitable target price along with confidence bands `[Min, Target, Max]` per quintal, protecting farmers from distress underpricing.
- **Transparent Factor Breakdown**: Visualizes exact valuation adjustments:
  - **Quality Grade Premium**: Grade A (+15%), Grade B (baseline), Grade C (-12%)
  - **Disintermediation Margin**: +18.5% captured from bypassed middleman commissions
  - **Organic Certification**: +22% premium for certified natural cultivation
  - **Seasonal Supply-Demand Index**: Adjusted based on harvest peak and lean cycles
- **Mandi vs. Retail Spread**: Side-by-side comparison between local APMC mandi modal rates, AI fair price, and consumer retail prices.

---

### 📊 3. APMC Mandi Comparison & Market Analytics

- **Market Benchmarking (`/api/pricing/mandi-compare/{crop_name}`)**: Evaluates current mandi rates against platform price recommendations, buyer offers, and end-consumer prices.
- **Platform Impact Metrics (`/api/analytics/summary`)**: Aggregates macro platform metrics including:
  - Farmer price realization uplift (61.8% vs. 32.4% traditional mandi baseline)
  - Consumer price savings (19.5%)
  - Intermediary tiers eliminated (4 out of 5 layers)
  - Logistics distance and carbon emissions saved via batching

---

### 🚚 4. Smart Logistics & Route Optimization

- **2-Stage Geodetic TSP Solver (`backend/route_optimizer.py`)**: Uses the Haversine formula to compute great-circle distance matrices across farm pickup locations and market destinations.
- **Multi-Farm Batching**: Groups nearby farm pickups into consolidated logistics batches, reducing vehicle kilometers traveled by up to 33.5%.
- **Route Visualization Dashboard (`RouteOptimizationView.tsx`)**:
  - Sequential stop ordering for drivers (Origin ➔ Farm Pickups ➔ Distribution Center / Mandi)
  - Distance comparison: Batched consolidated route vs. naive uncoordinated trips
  - Estimated transit duration, fuel savings, and CO₂ emissions reduction
  - Perishable post-harvest transit spoilage reduction estimate (~24.5%)

---

### 🛡️ 5. Escrow Payments & Dual-OTP Delivery Verification

- **Order State Machine**: Strict progression through tracked states:  
  `PLACED` ➔ `CONFIRMED` ➔ `BATCH_ASSIGNED` ➔ `IN_TRANSIT` ➔ `DELIVERED` ➔ `COMPLETED`
- **Simulated UPI Escrow Sandbox (`/api/payments/upi-verify`)**:  
  Simulates digital UPI payment verification with UTR reference generation, holding funds in escrow (`PENDING` ➔ `ESCROW_HELD` ➔ `RELEASED_TO_FARMER`).
- **Cryptographic Delivery OTP**:  
  Custody handover and escrow fund release require entering a secure 4-digit OTP provided by the buyer upon physical inspection and acceptance at the delivery point.

---

### 🌐 6. Vernacular & Rural-First Accessibility

- **Bilingual Internationalization (`src/i18n/`)**: Complete translation support for **Hindi (हिंदी)** and **English**, with instant switching and persistent `localStorage` preference.
- **Responsive Design**: Mobile-first interface built with Tailwind CSS 4, optimized for low-bandwidth rural networks and handheld devices.
- **In-App API Documentation (`ApiDocsModal.tsx`)**: Interactive REST API reference accessible directly from the application header and footer.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose & Implementation |
| :--- | :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript 5.8](https://www.typescriptlang.org/) | Component-driven, strongly typed user interface |
| **Frontend Bundler** | [Vite 6](https://vitejs.dev/) | High-speed Hot Module Replacement (HMR) and production bundling |
| **Styling & Icons** | [Tailwind CSS 4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/), [Motion](https://motion.dev/) | Utility-first responsive styling, icons, and micro-interactions |
| **Dev Server & API Fallback** | [Express 4](https://expressjs.com/), [tsx](https://github.com/privatenumber/tsx), [esbuild](https://esbuild.github.io/) | Standalone dev server (`server.ts`) with Vite integration & complete mock APIs |
| **Backend API Framework** | [FastAPI 0.110+](https://fastapi.tiangolo.com/) (Python 3.10+) | High-performance async REST backend with OpenAPI/Swagger |
| **ASGI Server** | [Uvicorn](https://www.uvicorn.org/) | Asynchronous server running FastAPI on port 8000 |
| **Database & ORM** | [SQLAlchemy 2.0](https://www.sqlalchemy.org/) | SQLite (`backend/agrimarket.db`) by default; PostgreSQL ready via `DATABASE_URL` |
| **Data Validation** | [Pydantic v2](https://docs.pydantic.dev/) | Strict request and response schema validation |
| **Machine Learning** | [Scikit-learn](https://scikit-learn.org/), [NumPy](https://numpy.org/), [Pandas](https://pandas.pydata.org/) | RandomForest price predictor with deterministic mathematical fallback |
| **Authentication & Security** | [Passlib](https://passlib.readthedocs.io/) (bcrypt), [Python-JOSE](https://python-jose.readthedocs.io/) (JWT), [SlowAPI](https://slowapi.readthedocs.io/) | Password hashing, JWT token handling, rate limiting & HTTP security headers |
| **Media Storage** | [Cloudinary](https://cloudinary.com/) & Local Disk | Cloud storage when `CLOUDINARY_URL` is configured, with local disk fallback |
| **Monitoring** | [Sentry](https://sentry.io/) (FastAPI & React) | Crash and error reporting when `SENTRY_DSN` is configured |

---

## 📁 Repository Structure

```text
SIH-26033-KisanSetu/
│
├── backend/                              # Python FastAPI Backend & ML Services
│   ├── main.py                           # FastAPI app entrypoint, CORS, security & REST routes
│   ├── auth.py                           # JWT generation, password hashing & RBAC dependencies
│   ├── ml_engine.py                      # Scikit-learn AI fair price model & baseline mandi rates
│   ├── route_optimizer.py                # Haversine geodetic matrix & nearest-neighbor TSP optimizer
│   ├── database.py                       # SQLAlchemy engine, session maker & SQLite/Postgres config
│   ├── models.py                         # SQLAlchemy ORM models (Users, CropListing, Order, etc.)
│   ├── schemas.py                        # Pydantic validation schemas for requests and responses
│   ├── seed_data.py                      # Database seeder script with realistic agricultural data
│   ├── requirements.txt                  # Python dependencies
│   └── README.md                         # Backend architecture documentation
│
├── src/                                  # React 19 + TypeScript Frontend
│   ├── components/                       # Core UI component tree
│   │   ├── auth/                         # Authentication & login screens
│   │   │   ├── LoginPage.tsx             # Full-screen login with phone/OTP and role selector
│   │   │   ├── OtpVerification.tsx       # 4-digit OTP input and timer
│   │   │   ├── RegistrationForm.tsx      # New farmer/buyer onboarding form
│   │   │   └── RoleSelectionModal.tsx    # Role switching dialog
│   │   ├── farmer/                       # Farmer-specific sub-components
│   │   │   ├── FarmerInventory.tsx       # Produce stock & status manager
│   │   │   ├── FarmerCropForm.tsx        # Multi-photo listing creation modal
│   │   │   ├── FarmerBuyerRequests.tsx   # Inbound RFQs and buyer inquiries
│   │   │   ├── FarmerPayouts.tsx         # Escrow balance and transaction logs
│   │   │   └── FarmerWeatherInsights.tsx # Weather advisory and harvest forecasts
│   │   ├── buyer/                        # Buyer-specific sub-components
│   │   │   ├── BuyerDashboard.tsx        # Buyer container & tab coordinator
│   │   │   ├── BuyerBulkOrders.tsx       # Bulk procurement and RFQ creator
│   │   │   ├── BuyerContracts.tsx        # Contract commitments and milestone view
│   │   │   ├── BuyerPaymentEscrow.tsx    # Escrow release and UPI sandbox view
│   │   │   └── CropDetailsPage.tsx       # Detailed produce lot specifications modal
│   │   ├── AIPricingDashboard.tsx        # Live AI pricing & mandi comparison dashboard
│   │   ├── BuyerMarketplace.tsx          # Produce catalog, filtering & ordering for buyers
│   │   ├── FarmerView.tsx                # Main farmer management container view
│   │   ├── RouteOptimizationView.tsx     # Logistics batching & multi-farm route map viewer
│   │   ├── OrdersAndPaymentModal.tsx     # Direct order placement & escrow modal
│   │   ├── ApiDocsModal.tsx              # In-app interactive REST API documentation viewer
│   │   ├── Layout.tsx / Header.tsx       # Responsive layout, topbar & search synchronization
│   │   ├── Footer.tsx / Sidebar.tsx      # Policy modals, quick navigation & language toggles
│   │   └── ErrorBoundary.tsx             # React runtime error boundary container
│   ├── data/                             # Mock feeds & fallback constants
│   │   └── mockAgriData.ts               # Static mandi, crop, and advisory datasets
│   ├── i18n/                             # Vernacular localization dictionaries
│   │   ├── index.ts                      # Translation helper hook (`t`) & language detector
│   │   └── translations.ts               # English and Hindi dictionary strings
│   ├── types/ & types.ts                 # TypeScript interfaces and domain types
│   ├── api.ts                            # API client service (`safeFetchJson` with JWT headers)
│   ├── App.tsx                           # Top-level router, state management & RBAC controllers
│   ├── main.tsx                          # React DOM entrypoint
│   └── index.css                         # Global styles & Tailwind CSS 4 directives
│
├── setup_guide/                          # Execution manuals and references
│   ├── Manual.txt                        # Daily runtime commands quick-reference
│   └── SetupManual.txt                   # Detailed full-stack setup instructions
│
├── server.ts                             # Node/Express dev server with Vite integration & fallback APIs
├── package.json                          # Frontend dependencies & run scripts
├── vite.config.ts                        # Vite configuration with Tailwind CSS plugin
├── tsconfig.json                         # TypeScript compiler configuration
├── .env.example                          # Environment variable configuration template
└── README.md                             # Main project documentation (this file)
```

---

## ⚙️ Setup & Installation Guide

> [!TIP]
> **Detailed Execution Manuals:**  
> Refer to the [`setup_guide/`](setup_guide/) directory for detailed manuals:
> - 📄 **[`setup_guide/SetupManual.txt`](setup_guide/SetupManual.txt)** — Comprehensive walkthrough for Full-Stack, Frontend-Only, and Backend-Only configurations.
> - 📄 **[`setup_guide/Manual.txt`](setup_guide/Manual.txt)** — Daily reference commands for starting services.

### 📋 Prerequisites

Ensure the following runtimes are installed:
- **Node.js**: Version `18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **Python**: Version `3.10` or higher ([Download Python](https://www.python.org/))
- **Git**: ([Download Git](https://git-scm.com/))

Verify your environment:
```bash
node -v
npm -v
python --version
```

---

### 🚀 Option A: Full-Stack Setup (Recommended)

Running in Full-Stack mode connects the React frontend to the Python FastAPI backend on port 8000 for live ML model inference and SQLite/PostgreSQL persistence.

#### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/SIH-26033-KisanSetu.git
cd SIH-26033-KisanSetu
```

#### Step 2: Start the Backend Server (Terminal 1)
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
     venv\Scripts\activate
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Seed the database with sample agricultural listings and mandi rates:
   ```bash
   python seed_data.py
   ```
5. Launch the FastAPI server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   > 💡 Backend API is now running at **http://localhost:8000**  
   > 📖 Interactive Swagger docs are available at **http://localhost:8000/docs**

#### Step 3: Start the Frontend Application (Terminal 2)
1. Open a **second terminal window** in the project root (`SIH-26033-KisanSetu`).
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   > 🌐 Open your browser at **http://localhost:3000**

---

### ⚡ Option B: Standalone / Frontend-Only Mode

For offline development, UI testing, or environments without Python, KisanSetu includes a complete Express dev server (`server.ts`) with built-in mock endpoints that mirror all FastAPI routes:

```bash
# 1. Install dependencies
npm install

# 2. Launch standalone server
npm run dev

# 3. Open in browser: http://localhost:3000
```

---

## 📡 API Endpoints Reference

The FastAPI backend exposes the following REST endpoints (also mirrored in `server.ts` for standalone mode):

| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Health** | `GET` | `/api/health` | Health check, service status, and storage engine info |
| **Auth** | `POST` | `/api/auth/register` | Register a new user with bcrypt password hashing |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user via phone/password and issue JWT token |
| **Auth** | `GET` | `/api/auth/me` | Fetch authenticated user profile via Bearer token |
| **Auth** | `GET` | `/api/auth/users` | List registered demo users with optional role filtering |
| **Marketplace** | `GET` | `/api/listings` | Fetch crop listings with filters (crop, district, grade, organic) |
| **Marketplace** | `POST` | `/api/listings` | Create a new crop listing with automated fair-price tagging |
| **Marketplace** | `PUT` | `/api/listings/{id}` | Update existing crop listing details and photos |
| **Marketplace** | `DELETE` | `/api/listings/{id}` | Delete a crop listing by ID |
| **Uploads** | `POST` | `/api/upload` | Upload produce photos (max 10 files, ≤5MB each, JPEG/PNG/WEBP) |
| **AI Pricing** | `POST` | `/api/pricing/recommend` | Calculate AI fair price band `[Min, Target, Max]` per quintal |
| **AI Pricing** | `GET` | `/api/pricing/mandi-compare/{crop}` | Compare APMC Mandi rate vs. AI Fair Price vs. Retail price |
| **Orders** | `GET` | `/api/orders` | List purchase orders filtered by user ID and role |
| **Orders** | `POST` | `/api/orders` | Place a farm-gate purchase order with dual-OTP generation |
| **Orders** | `PATCH` | `/api/orders/{id}/status` | Update order state (`CONFIRMED`, `IN_TRANSIT`, `DELIVERED` with OTP) |
| **Payments** | `POST` | `/api/payments/upi-verify` | Verify simulated UPI payment and lock funds in escrow |
| **RFQs** | `POST` | `/api/rfqs` | Submit Request for Quotation (RFQ) for bulk procurement |
| **RFQs** | `GET` | `/api/rfqs` | Retrieve submitted RFQs filtered by buyer/farmer/listing |
| **Logistics** | `GET` | `/api/logistics/routes` | Compute multi-farm pickup batches and geodetic TSP route order |
| **Analytics** | `GET` | `/api/analytics/summary` | Real-time disintermediation, price realization & savings metrics |
| **Dev Utility** | `POST` | `/api/dev/reset-seed` | Reset database with fresh baseline demo listings and mandi prices |

Interactive API documentation can be explored live at **http://localhost:8000/docs** or inside the web application via the **API Docs** tab.

---

## 🔐 Environment Variables

Template configuration is provided in `.env.example`:

```bash
# Backend Configuration
PORT=8000
DATABASE_URL=sqlite:///./agrimarket.db    # Or postgresql://user:pass@host:5432/kisansetu
SECRET_KEY=your-secret-key-for-jwt-signing
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Optional Services (Safe to leave blank in development)
CLOUDINARY_URL=                           # Persistent image storage (cloudinary://api_key:secret@cloud)
SENTRY_DSN=                               # Crash and error monitoring
SENTRY_TRACES_SAMPLE_RATE=0.1

# Frontend Configuration
VITE_API_BASE_URL=                        # Leave blank for local proxy to port 3000
```

---

## ❓ Frequently Asked Questions & Troubleshooting

<details>
<summary><b>1. PowerShell script execution error when activating virtual environment on Windows?</b></summary>
<p>
Windows PowerShell restricts script execution by default. Run the following command in your terminal session before activating:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
venv\Scripts\activate
```
This temporarily bypasses the script execution restriction for the current terminal window.
</p>
</details>

<details>
<summary><b>2. How does KisanSetu handle dual execution modes (Full-Stack vs. Standalone)?</b></summary>
<p>
KisanSetu is built with a resilient dual-mode architecture:
- <b>Full-Stack Mode</b>: Runs the FastAPI backend (`http://localhost:8000`) for Scikit-learn ML inference, ORM database persistence, and logistics TSP algorithms.
- <b>Standalone Mode</b>: The Express server in `server.ts` includes built-in fallback implementations of all API endpoints. If the FastAPI backend is not running, the frontend seamlessly uses fallback data without crashing.
</p>
</details>

<details>
<summary><b>3. How do I switch from local SQLite to PostgreSQL?</b></summary>
<p>
By default, the backend uses a local SQLite database (`backend/agrimarket.db`). To connect to PostgreSQL:
Set the <code>DATABASE_URL</code> environment variable before launching the backend:

```bash
export DATABASE_URL="postgresql://username:password@localhost:5432/kisansetu"
```
SQLAlchemy automatically initializes all required table schemas upon application startup.
</p>
</details>

<details>
<summary><b>4. How do image uploads work?</b></summary>
<p>
Produce photo uploads support up to 10 images per listing (max 5MB per file, JPEG/PNG/WEBP). In Full-Stack mode, uploaded files are stored in `backend/uploads/` (or Cloudinary if `CLOUDINARY_URL` is set). In Standalone mode, files are saved in `./uploads` or encoded as base64 Data URLs.
</p>
</details>

<details>
<summary><b>5. How do I switch languages in the application?</b></summary>
<p>
Click the language selector in the top navigation header to toggle between <b>English</b> and <b>हिंदी (Hindi)</b>. Your language preference is automatically saved to browser <code>localStorage</code>.
</p>
</details>

---

## 👥 Contributors & Acknowledgments

- Developed for **Smart India Hackathon (SIH 2026)** — Problem Statement: **SIH26033**.
- Built with a mission to empower Indian farmers with direct market access, AI-backed price discovery, transparent escrow payments, and optimized agri-logistics.

- Build by Team Sinister Six
    - 
    -
    - Rabiya 
    - Kaushlesh kumar
    -
    -


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

**KisanSetu** ("Farmer's Bridge") is an open, transparent digital agricultural marketplace designed to transform how produce moves from Indian farms directly to buyers.

In traditional agricultural supply chains, farm produce passes through 4 to 6 layers of intermediaries—including village aggregators, commission agents (*arhatiyas*), wholesale mandis, transport brokers, and local retailers. Because of this fragmented chain:
- **Farmers** receive only **30% to 50%** of the final retail price and frequently face distress selling due to lack of market information.
- **Buyers** (institutional buyers, retail consumers, FPOs, hotels, restaurants, and food processors) pay inflated prices to cover middleman margins.
- **Perishable food crops** suffer **15% to 25% post-harvest transit wastage** due to unoptimized, uncoordinated logistics.

**KisanSetu bridges this gap** by empowering farmers to list and sell produce directly to verified institutional and retail buyers. Built-in Machine Learning fair-pricing algorithms ensure farmers receive fair, market-tested rates, while smart logistics route optimization minimizes transit costs and food spoilage.

---

## 🚀 Key Features & Workflows

### 🌾 1. Role-Based Marketplace Workflows (RBAC)
KisanSetu provides dedicated user interfaces and access controls tailored to specific market participants:
- **Farmer Workspace**:
  - **Produce Inventory**: View active crop listings, available stock, quality grade badges, and harvest dates.
  - **Listing Creation & Photo Management**: Publish crop listings with quality grade (Grade A/B/C), organic certification, harvest date, location, moisture %, packaging, shelf life, and multi-image photo uploads (supports up to 10 photos with local disk storage / Cloudinary / Data URL fallbacks).
  - **Buyer RFQs & Direct Orders**: Review Requests for Quotation (RFQs) and accept or track incoming buyer purchase orders.
  - **Payouts & Financials**: Monitor escrow balances, completed trades, and instant payouts upon delivery verification.
- **Buyer Workspace**:
  - **Produce Catalog & Discovery**: Browse available produce with search and multi-parameter filters (crop name, district, quality grade, organic badge, max price).
  - **Crop Details Page**: View granular lot specifications, farm origin coordinates, harvest dates, seller trust score, and packaging info.
  - **RFQ Submission & Direct Ordering**: Submit custom RFQs or place instant purchase orders with quantity selection and shipping address details.
  - **Contracts & Payment Management**: Track active orders, simulate UPI escrow payments, and manage contract status.
- **Authentication & Role Switching**: Full-screen login with phone/OTP simulation (`LoginPage.tsx`) and smooth demo role switching between Farmer and Buyer accounts with automatic RBAC route guarding.

### 🤖 2. AI Fair Price Recommendation Engine
- **Data-Driven Valuation**: Powered by a Scikit-Learn regression model (`RandomForestRegressor` with fallback to deterministic regression formulas when scikit-learn is not installed) trained on historical APMC mandi feeds.
- **Dynamic Price Band**: Automatically calculates a recommended target fair price along with a confidence interval `[Min, Recommended Target, Max]` per quintal to guard farmers against predatory underpricing.
- **Factor Breakdown**: Displays transparent pricing factors including Quality Grade premiums (e.g. +15% for Grade A), direct disintermediation margin (+18.5%), certified organic premium (+22%), and seasonal supply-demand indices.
- **Retail & Mandi Spread**: Visualizes retail markup vs. farm-gate realization so both sides trade with confidence.

### 📊 3. Live APMC Mandi Comparison & Market Analytics
- **Market Benchmarking**: Instant side-by-side comparison between local government APMC mandi rates, AI fair price targets, average platform buyer offers, and retail consumer rates (`/api/pricing/mandi-compare/{crop_name}`).
- **Public Impact Summary**: Real-time market disintermediation analytics (`/api/analytics/summary`) showcasing farmer price realization uplift (61.8% vs. 32.4% baseline mandi), consumer savings (19.5%), middlemen layers bypassed (4 of 5), and logistics savings.

### 🚚 4. Smart Logistics & Route Optimization
- **2-Stage Geodetic TSP Solver**: Employs a nearest-neighbor Traveling Salesperson Problem (TSP) algorithm with Haversine distance matrix clustering (`route_optimizer.py`).
- **Multi-Farm Pickup Batching**: Groups nearby farm pickups into consolidated transit batches, reducing transportation distance by up to 33.5% and cutting CO2 carbon emissions.
- **Transit & Spoilage Metrics**: Interactive routing dashboard displaying stop sequences, distance comparison (batched vs. naive individual trips), estimated transit time, CO2 savings, and post-harvest spoilage reduction stats (~24.5%).

### 🛡️ 5. Escrow Payments & Dual-OTP Delivery Verification
- **Order Lifecycle**: Tracks progression through strict order states: `PLACED` ➔ `CONFIRMED` ➔ `BATCH_ASSIGNED` ➔ `IN_TRANSIT` ➔ `DELIVERED` ➔ `COMPLETED`.
- **UPI Payment Sandbox**: Simulated UPI digital payment verification with UTR reference generation and RBI-aligned escrow holding (`PENDING` ➔ `ESCROW_HELD` ➔ `RELEASED_TO_FARMER`).
- **Cryptographic Delivery OTP**: Custody transfer and escrow payment release require a 4-digit OTP provided by the buyer upon physical inspection at destination delivery.

### 🌐 6. Vernacular & Rural-First Accessibility (i18n)
- **Multi-Language Support**: Full internationalization for **Hindi (हिंदी)** and **English** with persistent selection saved in `localStorage`.
- **Mobile-Responsive UI**: Fast, modern interface built with Tailwind CSS 4 designed for low-bandwidth rural networks and mobile screen sizes.
- **Interactive In-App API Reference**: Built-in API documentation viewer (`ApiDocsModal.tsx`) for exploring backend REST endpoints directly inside the web UI.

---

## 🛠️ Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript 5.8](https://www.typescriptlang.org/) | Component-driven UI with strict type safety |
| **Build Tool & Bundler** | [Vite 6](https://vitejs.dev/) | Ultra-fast HMR frontend bundler |
| **UI Styling & Icons** | [Tailwind CSS 4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/), [Motion](https://motion.dev/) | Modern styling, icon set, and smooth animations |
| **Dev Server & Integration** | [Express](https://expressjs.com/), [tsx](https://github.com/privatenumber/tsx), [esbuild](https://esbuild.github.io/) | Full-stack Node dev server (`server.ts`) with Vite integration & fallback API endpoints |
| **Backend API Framework** | [FastAPI 0.110+](https://fastapi.tiangolo.com/) (Python 3.10+) | High-performance Python REST API backend |
| **ASGI Web Server** | [Uvicorn](https://www.uvicorn.org/) | Async server for FastAPI running on port 8000 |
| **Database & ORM** | [SQLAlchemy 2.0](https://www.sqlalchemy.org/) | SQLite (`backend/agrimarket.db`) by default; PostgreSQL ready via `DATABASE_URL` |
| **Machine Learning / AI** | [Scikit-learn](https://scikit-learn.org/), [NumPy](https://numpy.org/), [Pandas](https://pandas.pydata.org/) | RandomForestRegressor fair-price recommendation model & deterministic fallbacks |
| **Data Validation** | [Pydantic v2](https://docs.pydantic.dev/) | API request/response schema validation |

---

## 📁 Directory Structure

```text
SIH-26033-KisanSetu/
│
├── backend/                      # Python FastAPI Backend & AI Engines
│   ├── main.py                   # FastAPI application entrypoint & REST endpoints
│   ├── ml_engine.py              # Scikit-learn AI fair price recommendation model
│   ├── route_optimizer.py        # Logistics Haversine & nearest-neighbor TSP route optimizer
│   ├── database.py               # Database engine, session maker & SQLite/PostgreSQL config
│   ├── models.py                 # SQLAlchemy ORM database models (Users, CropListing, Order, etc.)
│   ├── schemas.py                # Pydantic validation schemas for API endpoints
│   ├── seed_data.py              # Database seeder script with sample crops, mandis, and orders
│   ├── requirements.txt          # Python dependencies
│   └── README.md                 # Backend-specific architecture documentation
│
├── src/                          # React + TypeScript Frontend
│   ├── components/               # Core UI components & views
│   │   ├── auth/                 # Full-screen Login & OTP components (LoginPage, OtpVerification, etc.)
│   │   ├── farmer/               # Farmer sub-components (FarmerInventory, FarmerCropForm, FarmerPayouts, etc.)
│   │   ├── buyer/                # Buyer sub-components (BuyerDashboard, BuyerBulkOrders, CropDetailsPage, etc.)
│   │   ├── AIPricingDashboard.tsx    # Live AI pricing & mandi comparison dashboard
│   │   ├── BuyerMarketplace.tsx      # Produce catalog, filtering & ordering for buyers
│   │   ├── FarmerView.tsx            # Main farmer management container view
│   │   ├── RouteOptimizationView.tsx # Logistics batching & multi-farm route map viewer
│   │   ├── OrdersAndPaymentModal.tsx # Order tracking, escrow payment & OTP verification modal
│   │   ├── ApiDocsModal.tsx          # In-app interactive REST API documentation viewer
│   │   ├── Layout.tsx / Header.tsx   # Responsive application layout, header & role switcher
│   │   ├── Footer.tsx / Sidebar.tsx  # Application footer with policy modals & navigation sidebar
│   │   └── ErrorBoundary.tsx         # React runtime error boundary container
│   ├── data/                     # Data constants & fallback feeds
│   ├── i18n/                     # Localization dictionaries (Hindi & English)
│   │   ├── index.ts              # Translation helper hook & initial language resolver
│   │   └── translations.ts       # English & Hindi translation mappings
│   ├── types/ & types.ts         # TypeScript interfaces & domain types
│   ├── api.ts                    # Frontend API client service (safeFetchJson wrapper)
│   ├── App.tsx                   # Top-level router, state management & RBAC controllers
│   ├── main.tsx                  # React DOM entrypoint
│   └── index.css                 # Global CSS stylesheet & Tailwind directives
│
├── setup_guide/                  # Detailed execution manuals
│   ├── Manual.txt                # Daily runtime reference commands
│   └── SetupManual.txt           # Step-by-step setup walkthrough for full-stack, frontend, and backend modes
│
├── server.ts                     # Full-stack Node/Express dev server with Vite integration & fallback APIs
├── package.json                  # Frontend scripts & Node dependencies
├── vite.config.ts                # Vite frontend bundler configuration
├── tsconfig.json                 # TypeScript compiler configuration
├── .env.example                  # Environment variable configuration template
└── README.md                     # Main project documentation (this file)
```

---

## ⚙️ Setup & Installation Guide

> [!TIP]
> **Detailed Execution Manuals:**  
> Refer to the [`setup_guide/`](setup_guide/) directory for detailed manuals:
> - 📄 **[`setup_guide/SetupManual.txt`](setup_guide/SetupManual.txt)** — Step-by-step setup guide for Full-Stack, Frontend-Only, and Backend-Only configurations.
> - 📄 **[`setup_guide/Manual.txt`](setup_guide/Manual.txt)** — Daily reference commands for starting the servers.

### 📋 Prerequisites
Ensure the following software is installed on your machine:
- **Node.js**: Version `18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **Python**: Version `3.10` or higher ([Download Python](https://www.python.org/))
- **Git**: ([Download Git](https://git-scm.com/))

Verify installed versions:
```bash
node -v
npm -v
python --version
```

---

### 🚀 Option A: Full-Stack Setup (Recommended)

Running in Full-Stack mode connects the React frontend to the Python FastAPI backend on port 8000.

#### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/SIH-26033-KisanSetu.git
cd SIH-26033-KisanSetu
```

#### Step 2: Set Up & Start the Backend Server (Terminal 1)
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create a Python virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - **Windows (PowerShell / Command Prompt)**:
     ```powershell
     venv\Scripts\activate
     ```
     *(If PowerShell blocks script execution, run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`)*
   - **macOS / Linux**:
     ```bash
     source venv/bin/activate
     ```
4. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Seed the database with sample data:
   ```bash
   python seed_data.py
   ```
6. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   > 💡 Backend API is now live at **http://localhost:8000**  
   > 📖 View interactive Swagger API docs at **http://localhost:8000/docs**

#### Step 3: Set Up & Start the Frontend (Terminal 2)
1. Open a **new terminal window** in the project root directory (`SIH-26033-KisanSetu`).
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   > 🌐 Open your browser at **http://localhost:3000**

---

### ⚡ Option B: Standalone / Frontend-Only Mode

KisanSetu features a built-in Express server (`server.ts`) equipped with complete fallback API implementations for offline development or quick UI exploration without Python:

```bash
# 1. Install dependencies
npm install

# 2. Launch dev server
npm run dev

# 3. Open in browser: http://localhost:3000
```

---

## 📡 API Endpoints Reference

The FastAPI backend exposes comprehensive REST endpoints (mirrored in `server.ts` for standalone mode):

| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Health** | `GET` | `/api/health` | Service health status and timestamp |
| **Auth** | `POST` | `/api/auth/login` | Login or register demo user by phone and role |
| **Auth** | `GET` | `/api/auth/users` | List registered users with optional role filtering |
| **Marketplace** | `GET` | `/api/listings` | Fetch active crop listings with crop, grade, district & organic filters |
| **Marketplace** | `POST` | `/api/listings` | Create a new crop listing with automated AI price calculation |
| **Marketplace** | `PUT` | `/api/listings/{id}` | Update existing crop listing details and photos |
| **Marketplace** | `DELETE` | `/api/listings/{id}` | Delete a crop listing by ID |
| **Upload** | `POST` | `/api/upload` | Upload produce photos (max 10 files, ≤5MB each, JPEG/PNG/WEBP) |
| **AI Pricing** | `POST` | `/api/pricing/recommend` | **AI Price Engine**: Calculates fair price range `[Min, Target, Max]` |
| **AI Pricing** | `GET` | `/api/pricing/mandi-compare/{crop}` | Compare APMC Mandi price vs. AI Fair Price vs. Retail rate |
| **Orders** | `GET` | `/api/orders` | List purchase orders filtered by user ID and role |
| **Orders** | `POST` | `/api/orders` | Place a direct farm-to-buyer purchase order |
| **Orders** | `PATCH` | `/api/orders/{id}/status` | Progress order status (`CONFIRMED`, `IN_TRANSIT`, `DELIVERED` with OTP) |
| **Payments** | `POST` | `/api/payments/upi-verify` | Verify simulated UPI payment and hold funds in escrow |
| **RFQs** | `POST` | `/api/rfqs` | Submit Request for Quotation (RFQ) for bulk produce procurement |
| **RFQs** | `GET` | `/api/rfqs` | Retrieve submitted RFQs filtered by buyer/farmer/listing |
| **Logistics** | `GET` | `/api/logistics/routes` | **Logistics Engine**: Multi-pickup route batching & distance savings |
| **Analytics** | `GET` | `/api/analytics/summary` | Real-time market disintermediation metrics & traded volume |

Explore interactive Swagger documentation live at **http://localhost:8000/docs** or inside the web app via the **API Docs** tab.

---

## ❓ Frequently Asked Questions & Troubleshooting

<details>
<summary><b>1. PowerShell script execution error when activating virtual environment on Windows?</b></summary>
<p>
Windows PowerShell blocks script execution by default. Run the following command in your terminal session before activating:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
venv\Scripts\activate
```
This temporarily bypasses the script execution restriction for the active terminal window.
</p>
</details>

<details>
<summary><b>2. How does KisanSetu handle dual execution modes (Full-Stack vs. Standalone)?</b></summary>
<p>
KisanSetu is built with a resilient architecture:
- <b>Full-Stack Mode</b>: Runs FastAPI backend (`http://localhost:8000`) for ML model predictions, ORM database persistence, and logistics algorithms.
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

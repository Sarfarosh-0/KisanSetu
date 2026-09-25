# 🚀 KisanSetu - First-Time Setup Guide

## 📋 Prerequisites
Before starting, ensure you have the following installed on your system:
- **Node.js** (v18 or higher recommended)
- **npm** (bundled with Node.js)
- **Python** (v3.9 or higher recommended)
- **pip** (bundled with Python)

---

## 🛠️ Setup Options

### Option A: Full-Stack Setup & Run (Recommended)

1. **Install Frontend Dependencies**  
   Navigate to the project root directory and run:
   ```bash
   npm install
   ```

2. **Navigate to the Backend Directory**
   ```bash
   cd backend
   ```

3. **Create & Activate Python Virtual Environment**
   - **Create environment:**
     ```bash
     python -m venv venv
     ```
   - **Activate environment:**
     - *Windows (CMD/PowerShell):*
       ```cmd
       venv\Scripts\activate
       ```
     - *macOS / Linux:*
       ```bash
       source venv/bin/activate
       ```

4. **Install Backend Dependencies & Seed Database**
   ```bash
   pip install -r requirements.txt
   python seed_data.py
   ```

5. **Start Backend API Server**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

6. **Start Frontend Development Server** *(In a new terminal window)*  
   Navigate to the project root directory and run:
   ```bash
   npm run dev
   ```

---

### Option B: Frontend Only

1. **Install Dependencies** *(from root directory)*:
   ```bash
   npm install
   ```

2. **Start Frontend Server** (runs on [http://localhost:3000](http://localhost:3000)):
   ```bash
   npm run dev
   ```

---

### Option C: Backend Only

1. **Navigate to the Backend Directory:**
   ```bash
   cd backend
   ```

2. **Activate Virtual Environment:**
   - *Windows:*
     ```cmd
     venv\Scripts\activate
     ```
   - *macOS / Linux:*
     ```bash
     source venv/bin/activate
     ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Seed Database** *(optional/recommended for demo data)*:
   ```bash
   python seed_data.py
   ```

5. **Start Backend Server** (runs on [http://localhost:8000](http://localhost:8000)):
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
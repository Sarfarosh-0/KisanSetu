# ⚡ KisanSetu - Runtime Manual

## 📌 Prerequisites
- **Node.js** (v18+)
- **Python** (v3.9+)

> ⚠️ **Important:** 
> - Ensure you have completed the initial setup steps outlined in [`SETUP.md`](./SETUP.md) before running these commands.
> - Open **two separate terminal windows/tabs** to run the full stack simultaneously.

---

## 🖥️ Terminal 1: Frontend Development Server (Port 3000)

1. **Navigate to the project root directory and start Vite:**
   ```bash
   npm run dev
   ```

2. **Access the application in your browser:**
   👉 [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Terminal 2: Backend FastAPI Server (Port 8000)

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Activate the virtual environment:**
   - **Windows (Command Prompt/PowerShell):**
     ```cmd
     venv\Scripts\activate
     ```
   - **macOS / Linux:**
     ```bash
     source venv/bin/activate
     ```

3. **Start the FastAPI API server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
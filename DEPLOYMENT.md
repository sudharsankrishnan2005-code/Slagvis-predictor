# Deploy SlagVis Predictor Online

This guide publishes the app so **anyone on the internet** can predict slag viscosity.

**Recommended stack (free tier):**
- **Frontend** → [Vercel](https://vercel.com) (Next.js)
- **Backend** → [Render](https://render.com) (FastAPI)
- **Database** → Render PostgreSQL (keeps prediction history)

---

## Overview

```
User browser  →  Vercel (frontend)  →  Render API (backend)  →  PostgreSQL
     https://your-app.vercel.app          https://slagvis-api.onrender.com
```

---

## Step 1 — Put code on GitHub

1. Install Git: https://git-scm.com/download/win  
2. Create a repo at https://github.com/new (name: `slagvis-predictor`, **Private** or Public)
3. In PowerShell:

```powershell
cd C:\Users\sudha\Projects\slagvis-predictor
git init
git add .
git commit -m "Initial SlagVis Predictor release"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/slagvis-predictor.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## Step 2 — Deploy the backend (Render)

1. Sign up at https://render.com (use “Sign in with GitHub”)
2. Click **New +** → **Blueprint**
3. Connect your `slagvis-predictor` repository
4. Render reads `render.yaml` and creates:
   - `slagvis-api` (Python web service)
   - `slagvis-db` (PostgreSQL, free)
   - `slagvis-web` (optional — skip if using Vercel for frontend)

**Or deploy API only manually:**

1. **New +** → **Web Service** → connect repo
2. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. **New +** → **PostgreSQL** (free) → copy **Internal Database URL**
4. On the web service, add environment variables:

| Key | Value |
|-----|--------|
| `DATABASE_URL` | *(paste PostgreSQL Internal URL)* |
| `ALLOWED_ORIGINS` | `https://YOUR-APP.vercel.app` *(set after Step 3)* |

5. Deploy and note your API URL, e.g. `https://slagvis-api.onrender.com`
6. Test: open `https://slagvis-api.onrender.com/health` — should show `{"status":"ok",...}`

> **Note:** Render free tier sleeps after ~15 min idle. First request may take 30–60 seconds to wake up.

---

## Step 3 — Deploy the frontend (Vercel)

1. Sign up at https://vercel.com (GitHub login)
2. **Add New** → **Project** → import `slagvis-predictor`
3. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Next.js
4. **Environment Variables:**

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_API_URL` | `https://slagvis-api.onrender.com/api/v1` |

5. Click **Deploy**
6. Copy your live URL, e.g. `https://slagvis-predictor.vercel.app`

---

## Step 4 — Connect frontend and backend

1. In **Render** → `slagvis-api` → **Environment**
2. Set `ALLOWED_ORIGINS` to your Vercel URL (no trailing slash):

```
https://slagvis-predictor.vercel.app
```

3. Save → Render redeploys automatically
4. Open your Vercel URL and run a test prediction on **Single Prediction**

---

## Step 5 — Custom domain (optional)

**Vercel:** Project → Settings → Domains → add e.g. `slagvis.yourdomain.com`  
**Render:** Service → Settings → Custom Domain → add e.g. `api.yourdomain.com`

Update `ALLOWED_ORIGINS` and `NEXT_PUBLIC_API_URL` to match.

---

## Environment variables reference

### Backend (`slagvis-api`)

| Variable | Example | Purpose |
|----------|---------|---------|
| `ALLOWED_ORIGINS` | `https://app.vercel.app,http://localhost:3000` | CORS |
| `DATABASE_URL` | `postgresql://...` | Prediction history |
| `PORT` | *(set by Render)* | Server port |

### Frontend (`slagvis-web` or Vercel)

| Variable | Example | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | `https://slagvis-api.onrender.com/api/v1` | API base URL |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Dashboard says “Backend unavailable” | Check `NEXT_PUBLIC_API_URL` and that API `/health` works |
| CORS error in browser console | Add exact Vercel URL to `ALLOWED_ORIGINS` on Render |
| History empty after redeploy | Use PostgreSQL (`DATABASE_URL`), not SQLite alone |
| Slow first load | Render free tier waking from sleep — normal |
| Build fails on Vercel | Ensure **Root Directory** is `frontend` |

---

## Costs

| Service | Free tier |
|---------|-----------|
| Vercel | Hobby — sufficient for research apps |
| Render Web + Postgres | Free with sleep + 750 hrs/month |
| Custom domain | ~$10–15/year (optional) |

For production traffic or always-on service, upgrade Render to a paid plan (~$7/month).

---

## Quick redeploy after code changes

```powershell
git add .
git commit -m "Update app"
git push
```

Vercel and Render redeploy automatically from GitHub.

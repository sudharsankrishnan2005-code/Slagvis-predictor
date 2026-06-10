# SlagVis Predictor

Professional web application for predicting metallurgical slag viscosity using empirical models.

## Architecture

```
slagvis-predictor/
├── backend/          # FastAPI + SQLAlchemy + ReportLab
│   ├── api/          # REST endpoints
│   ├── database/     # SQLite (PostgreSQL-ready)
│   ├── models/       # Viscosity calculation engines
│   └── reports/      # PDF generation
└── frontend/         # Next.js + React + Shadcn UI
```

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy Online

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for publishing to Vercel + Render so anyone can use the app.

## Phase-II Model

```
log10(η) = 1.777 + 0.0333(SiO2) + 0.0303(Al2O3) - 0.0036(MgO)
           - 0.0047(MnO) + 0.0074(K2O) + 0.0055(TiO2) - 0.00263(T)
η = 10^(log10 η)  [Pa·s]
```

## PostgreSQL Migration

Set environment variable:

```
DATABASE_URL=postgresql://user:password@localhost/slagvis
```

## License

Research and publication use.

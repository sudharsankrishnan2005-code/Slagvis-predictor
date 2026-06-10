@echo off
REM SlagVis Predictor — start both servers (requires Python + Node.js)

echo Starting FastAPI backend on port 8000...
start "SlagVis Backend" cmd /k "cd /d %~dp0backend && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && uvicorn main:app --reload --port 8000"

echo Starting Next.js frontend on port 3000...
start "SlagVis Frontend" cmd /k "cd /d %~dp0frontend && npm install && npm run dev"

echo.
echo SlagVis Predictor starting...
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000/docs

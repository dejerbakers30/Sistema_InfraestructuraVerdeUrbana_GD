@echo off
TITLE Gemelo Digital - Inicio de Servicios

echo ===================================================
echo   Gemelo Digital de Infraestructura Verde Urbana
echo ===================================================
echo.

echo [1/2] Iniciando servidor Backend (FastAPI)...
start "Gemelo Digital - Backend" cmd /k "cd /d "%~dp0..\backend" && venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo [2/2] Iniciando servidor Frontend (Next.js)...
start "Gemelo Digital - Frontend" cmd /k "cd /d "%~dp0..\frontend" && npm run dev"

echo.
echo ===================================================
echo Servicios en ejecución:
echo   - Backend API: http://localhost:8000 (Docs: http://localhost:8000/docs)
echo   - Frontend:    http://localhost:3000
echo ===================================================
echo.

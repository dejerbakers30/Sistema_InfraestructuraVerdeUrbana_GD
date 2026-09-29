#!/usr/bin/env bash
# ==============================================================================
# Gemelo Digital de Infraestructura Verde Urbana - Inicio de Servicios (Linux)
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================================="
echo "  Gemelo Digital de Infraestructura Verde Urbana"
echo "  Iniciando Backend (FastAPI) y Frontend (Next.js)..."
echo "=========================================================="
echo ""

# 1. Iniciar Backend
echo "[1/2] Iniciando Backend API en http://localhost:8000 ..."
cd "${SCRIPT_DIR}/backend"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# 2. Iniciar Frontend
echo "[2/2] Iniciando Frontend Web en http://localhost:3000 ..."
cd "${SCRIPT_DIR}/frontend"
npm run dev &
FRONTEND_PID=$!

trap "echo 'Deteniendo servicios...'; kill ${BACKEND_PID} ${FRONTEND_PID} 2>/dev/null; exit 0" SIGINT SIGTERM

echo ""
echo "=========================================================="
echo "  ¡Servicios activos en ejecución!"
echo "  • Frontend Web: http://localhost:3000"
echo "  • Backend API:  http://localhost:8000 (Docs: http://localhost:8000/docs)"
echo "  Presiona CTRL+C para detener ambos servidores."
echo "=========================================================="

wait

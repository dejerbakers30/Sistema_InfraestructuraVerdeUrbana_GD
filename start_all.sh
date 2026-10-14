#!/usr/bin/env bash
# ==============================================================================
# Gemelo Digital de Infraestructura Verde Urbana - Inicio Completo de Servicios
# Inicia: PostgreSQL (Docker) + Redis (Docker) + Backend + Frontend + Streamlit
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================================="
echo "  🌿 Gemelo Digital de Infraestructura Verde Urbana"
echo "  Iniciando los 4 componentes del sistema..."
echo "=========================================================="
echo ""

# 1. Base de Datos PostgreSQL y Redis (Docker)
echo "[1/4] Iniciando Base de Datos PostgreSQL (5432) y Redis (6379) en Docker..."
cd "${SCRIPT_DIR}"
docker compose up -d db redis

echo "      Esperando que la base de datos esté lista..."
until docker exec gemelo_digital_db pg_isready -U postgres -d bd_gemelodigital >/dev/null 2>&1; do
    sleep 1
done
echo "      ✓ Base de datos y Redis listos."
echo ""

# 2. Iniciar Backend FastAPI
echo "[2/4] Iniciando Backend FastAPI en http://localhost:8000 ..."
cd "${SCRIPT_DIR}/backend"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "      ✓ Backend iniciado (PID: ${BACKEND_PID})."
echo ""

# 3. Iniciar Streamlit (Motor Científico ML)
echo "[3/4] Iniciando Streamlit en http://localhost:8501 ..."
cd "${SCRIPT_DIR}"
streamlit run streamlit_app/app.py --server.port 8501 --server.headless true &
STREAMLIT_PID=$!
echo "      ✓ Streamlit iniciado (PID: ${STREAMLIT_PID})."
echo ""

# 4. Iniciar Frontend Web (Next.js)
echo "[4/4] Iniciando Frontend Web en http://localhost:3000 ..."
cd "${SCRIPT_DIR}/frontend"
npm run dev &
FRONTEND_PID=$!
echo "      ✓ Frontend iniciado (PID: ${FRONTEND_PID})."
echo ""

# Manejo de cierre con CTRL+C
trap "echo ''; echo 'Deteniendo todos los servicios...'; kill ${BACKEND_PID} ${STREAMLIT_PID} ${FRONTEND_PID} 2>/dev/null; docker compose stop db redis; echo 'Servicios detenidos correctamente.'; exit 0" SIGINT SIGTERM

echo "=========================================================="
echo "  🚀 ¡Todos los servicios están activos y listos!"
echo "=========================================================="
echo "  • Frontend Web:      http://localhost:3000"
echo "  • Backend API (Docs):http://localhost:8000/docs"
echo "  • Streamlit ML Q1:   http://localhost:8501"
echo "  • Base de Datos:     PostgreSQL (localhost:5432 / bd_gemelodigital)"
echo "  • Credenciales:      admin@gemelodigital.com / admin123"
echo "----------------------------------------------------------"
echo "  Presiona CTRL+C en esta terminal para detener todo el stack."
echo "=========================================================="

# Esperar a que terminen los procesos
wait

#!/usr/bin/env bash
# ==============================================================================
# Gemelo Digital de Infraestructura Verde Urbana - Linux Startup Script (Docker)
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "=========================================================="
echo "  Gemelo Digital de Infraestructura Verde Urbana"
echo "  Iniciando servicios en Docker..."
echo "=========================================================="

cd "${ROOT_DIR}"

# Iniciar todos los contenedores Docker
docker compose up -d --build

echo ""
echo "Esperando que los servicios estén listos..."

# Esperar DB y Redis
until docker exec gemelo_digital_db pg_isready -U postgres -d bd_gemelodigital >/dev/null 2>&1; do
    sleep 1
done

until docker exec gemelo_digital_redis redis-cli ping >/dev/null 2>&1; do
    sleep 1
done

# Esperar Backend
echo "Verificando Backend..."
for i in {1..30}; do
    if curl -s http://127.0.0.1:8000/health >/dev/null 2>&1; then
        break
    fi
    sleep 2
done

# Esperar Frontend
echo "Verificando Frontend..."
for i in {1..30}; do
    if curl -s http://127.0.0.1:3000 >/dev/null 2>&1; then
        break
    fi
    sleep 2
done

echo ""
echo "=========================================================="
echo "  ¡Sistema Gemelo Digital iniciado con éxito en Docker!"
echo "=========================================================="
echo "  • Frontend Web:      http://localhost:3000"
echo "  • Backend API:       http://localhost:8000"
echo "  • Swagger Docs:      http://localhost:8000/docs"
echo "  • ReDoc:             http://localhost:8000/redoc"
echo "  • Usuario inicial:   admin@gemelodigital.com"
echo "  • Contraseña:        admin123"
echo "=========================================================="

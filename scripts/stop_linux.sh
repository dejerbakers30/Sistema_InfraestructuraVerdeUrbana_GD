#!/usr/bin/env bash
# ==============================================================================
# Gemelo Digital de Infraestructura Verde Urbana - Linux Stop Script (Docker)
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "Deteniendo servicios de Gemelo Digital en Docker..."

cd "${ROOT_DIR}"
docker compose stop

echo "✔ Contenedores Docker detenidos correctamente."

# Gemelo Digital de Infraestructura Verde Urbana

Aplicación de Gemelos Digitales para simular y visualizar el impacto de la infraestructura verde en microclima, biodiversidad y gestión hídrica bajo diferentes escenarios climáticos.

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Datos Reales y Reproducibilidad Científica](#-datos-reales-y-reproducibilidad-científica-trujillo-perú)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura Modular](#arquitectura-modular)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Despliegue](#despliegue)
- [Uso](#uso)
- [API Documentation](#api-documentation)
- [Desarrollo](#desarrollo)
- [Testing](#testing)
- [Contribución](#contribución)

## 📖 Descripción

Esta aplicación permite a planificadores urbanos e investigadores:
- Simular escenarios de infraestructura verde usando ENVI-met
- Visualizar resultados en mapas interactivos y gráficos dinámicos
- Generar reportes en PDF, Word y Excel
- Gestionar proyectos y escenarios con control de acceso
- Analizar impacto en microclima, biodiversidad y gestión hídrica

## ✨ Características

### Dashboard Interactivo
- Mapas interactivos con capas múltiples (infraestructura verde, edificios, islas de calor)
- Gráficos dinámicos de series temporales
- KPIs en tiempo real (PET, áreas verdes, escorrentía, reducción de temperatura)
- Selector de escenarios con comparativa split-view

### Simulación y Escenarios
- Integración con ENVI-met para simulaciones de alta resolución
- Ejecución en background con notificaciones en tiempo real
- Configuración de parámetros de vegetación, superficies y clima
- Post-procesamiento automático de resultados

### Gestión de Usuarios
- Autenticación JWT con roles (Administrador, Investigador, Visitante)
- Perfiles personalizables
- Compartir proyectos entre usuarios
- Historial de simulaciones

### Generador de Reportes
- Exportación a PDF (ReportLab/WeasyPrint)
- Exportación a Word (python-docx)
- Exportación a Excel (openpyxl)
- Personalización de variables y formatos

## 🛰️ Datos Reales y Reproducibilidad Científica (Trujillo, Perú)

El gemelo digital integra un **dataset empírico real satelital y biofísico** de la ciudad de Trujillo, Perú (periodo 2023–2025), estructurado para entrenar y validar 5 arquitecturas de metamodelado microclimático:

- **Fuentes Satelitales**: Landsat 8-9 (USGS/NASA), Sentinel-2 (Copernicus ESA), reanálisis ERA5-Land (ECMWF), cobertura del suelo ESA WorldCover 10 m y topografía digital SRTM (NASA/USGS).
- **Control de Calidad (QC)**: 15,862 píxeles válidos tras eliminar nubes, niebla costera, agua y valores extremos (23 escenas satelitales completas, 728 puntos de muestreo en 145 bloques espaciales independientes de 500 m).
- **Metamodelo Óptimo**: *Stacking Ensemble Regressor* ($RMSE = 1.907$ °C, $R^2 = 0.873$, latencia $4.60$ ms por 100 puntos espaciales) con significancia confirmada mediante tests de Friedman ($\chi^2 = 71.48$, $p = 1.09 \times 10^{-14}$) y Nemenyi post-hoc ($CD = 1.272$).

### Estructura Modular de Archivos

```
Sistema_InfraestructuraVerdeUrbana_GD/
├── data/                                         # Capa de datos empíricos
│   ├── dataset_real_LST_Trujillo.csv            # Datos crudos exportados de GEE (18,078 filas, 29 escenas)
│   ├── clean.csv                                # Filtrado sin agua y con bloques espaciales
│   └── final.csv                                # Dataset final validado tras QC (15,862 filas, 23 escenas)
│
├── scripts/
│   ├── earth_engine/
│   │   └── export_dataset_LST_Trujillo.js       # Script reproducible en Google Earth Engine
│   └── ml_pipeline/                             # Pipeline offline de Machine Learning
│       ├── requirements.txt                     # Dependencias científicas (Optuna, Scikit-learn, etc.)
│       ├── clean.py                             # Limpieza y partición en bloques de 500 m
│       ├── qc.py                                # Filtros de calidad atmosférica y nubosidad
│       ├── train.py                             # Optimización y validación espacial/temporal
│       ├── cnnlstm.py                           # Red Neuronal CNN-LSTM
│       ├── stats_figs.py                        # Contrastes estadísticos y generación de figuras 2 a 7
│       └── random_cv.py                         # Comparación entre validación aleatoria y espacial
│
├── backend/app/data/real_results/               # Resultados y figuras servidos por FastAPI
│   ├── clean_log.json                           # Métricas del control de calidad
│   ├── descriptivos.csv                         # Estadísticas descriptivas de los datos
│   ├── estadistica.json                         # Friedman, Nemenyi, Wilcoxon-Holm y residuos
│   ├── hiperparametros.json                     # Hiperparámetros óptimos hallados por Optuna
│   ├── oof_espacial.csv                         # Predicciones fuera de pliegue (espacial)
│   ├── oof_temporal.csv                         # Predicciones fuera de pliegue (temporal)
│   ├── random_vs_spatial.json                   # Análisis de sesgo de autocorrelación espacial
│   ├── resultados.json                          # Métricas consolidadas (RMSE, MAE, R², latencia)
│   └── fig2_obs_pred.png ... fig7_importancia.png # Figuras científicas de alta resolución
│
├── frontend/public/figures/real_results/        # Copia estática de figuras para Next.js
└── streamlit_app/app.py                         # Aplicación interactiva con datos reales
```

### Reproducción Paso a Paso

Para reproducir el pipeline completo desde la terminal:

```bash
# 1. Instalar dependencias del pipeline científico
pip install -r scripts/ml_pipeline/requirements.txt

# 2. Ejecutar limpieza inicial y control de calidad
python scripts/ml_pipeline/clean.py
python scripts/ml_pipeline/qc.py

# 3. Entrenar y evaluar metamodelos con validación cruzada espacial (GroupKFold)
python scripts/ml_pipeline/train.py

# 4. Generar contrastes de hipótesis (Demšar, 2006) y figuras de publicación
python scripts/ml_pipeline/stats_figs.py

# 5. Comparar validación aleatoria vs. validación espacial
python scripts/ml_pipeline/random_cv.py
```

> **Licencias**: Código liberado bajo licencia MIT (`LICENSE`). Datos derivados bajo licencia Creative Commons Atribución 4.0 Internacional (CC BY 4.0).

## 🛠 Stack Tecnológico

### Backend
- **Framework**: FastAPI 0.104+
- **Base de Datos**: PostgreSQL 15+ con PostGIS 3.3+ y TimescaleDB 2.11+
- **ORM**: SQLAlchemy 2.0+ con async/await
- **Autenticación**: JWT (python-jose[cryptography])
- **Tareas en Background**: Celery + Redis
- **Procesamiento Geoespacial**: GeoPandas, Shapely, Rasterio
- **Reportes**: ReportLab, python-docx, openpyxl
- **Validación**: Pydantic v2

### Frontend
- **Framework**: Next.js 14+ con App Router
- **Lenguaje**: TypeScript
- **State Management**: Zustand
- **Mapas**: Leaflet o MapLibre GL
- **Gráficos**: Chart.js o D3.js
- **UI Components**: shadcn/ui
- **Styling**: TailwindCSS

### Infraestructura
- **Servidor Web**: IIS (opcional, para reverse proxy)
- **Process Manager**: Windows Services (backend) + PM2 (frontend)
- **Reverse Proxy**: IIS URL Rewrite (opcional)
- **Logs**: Windows Event Log

## 🏗 Arquitectura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   IIS (Opcional)│────▶│   Backend       │
│   (Next.js)     │     │   (Proxy)       │     │   (FastAPI)     │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   PostgreSQL    │◀────│   Backend       │────▶│   Redis         │
│   + PostGIS     │     │   (FastAPI)     │     │   (Celery)      │
│   (Windows)     │     └─────────────────┘     └────────┬────────┘
└─────────────────┘                                      │
                                                          ▼
                                                  ┌─────────────────┐
                                                  │   ENVI-met      │
                                                  │   (Simulations) │
                                                  └─────────────────┘
```

## 📦 Requisitos Previos

### Sistema Operativo
- **Windows 10/11**
- Mínimo 8 GB RAM (16 GB recomendado)
- 50 GB de espacio en disco

### Software Requerido
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ con extensiones PostGIS (debe estar instalado y ejecutándose)
- Redis 7+ (o Memurai para Windows)
- ENVI-met (opcional, para simulaciones locales)

## 🚀 Instalación

### 1. Ejecutar Script de Instalación Automática

Abre PowerShell como Administrador y ejecuta:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\scripts\install_windows.ps1
```

Este script instalará automáticamente:
- Python 3.11
- Node.js LTS
- Redis (Memurai)
- Git
- Dependencias del backend y frontend

**Nota**: PostgreSQL debe estar instalado y ejecutándose antes de ejecutar este script.

### 2. Configurar Variables de Entorno

```bash
# Backend
cd backend
copy .env.example .env
# Editar .env con tus configuraciones (DATABASE_URL, SECRET_KEY, etc.)
# IMPORTANTE: Configura DATABASE_URL con tu usuario y password de PostgreSQL

# Frontend
cd ..\frontend
copy .env.local.example .env.local
# Editar .env.local con tu API_URL
```

### 3. Configurar Base de Datos

```bash
# Ejecutar script de configuración de base de datos
.\scripts\setup_db_windows.bat
```

### 4. Iniciar Servicios

**En Linux:**
```bash
./start_linux.sh
```

**En Windows:**
```bash
.\start_windows.bat
```

Esto iniciará:
- Backend API en http://localhost:8000 (Swagger: http://localhost:8000/docs)
- Frontend en http://localhost:3000
- Celery Worker (opcional)

## ⚙️ Configuración

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/bd_gemelodigital
TEST_DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/bd_gemelodigital_test

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Redis
REDIS_URL=redis://localhost:6379/0

# ENVI-met
ENVI_MET_PATH=/path/to/envi-met
ENVI_MET_LICENSE=/path/to/license

# File Storage
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=524288000  # 500MB in bytes

# CORS
CORS_ORIGINS=["http://localhost:3000","http://localhost:8000"]

# Logging
LOG_LEVEL=INFO
LOG_FILE=./logs/app.log
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token-here
NEXT_PUBLIC_APP_NAME=Gemelo Digital Infraestructura Verde
```

## 🌐 Despliegue en Producción (Windows)

### Opción A: Windows Services (Recomendado)

#### 1. Instalar Backend como Windows Service

Ejecuta PowerShell como Administrador:

```powershell
.\scripts\install_windows_service.ps1
```

Luego instala el servicio:

```bash
cd backend
venv\Scripts\activate
python service.py install
python service.py start
```

#### 2. Configurar Frontend con PM2

```bash
cd frontend
npm install -g pm2
npm run build
pm2 start npm --name "gemelo-digital-frontend" -- start
pm2 save
pm2 startup
```

#### 3. Configurar IIS como Reverse Proxy (Opcional)

Si necesitas exponer la aplicación públicamente, configura IIS:

1. Instalar IIS y URL Rewrite Module
2. Crear reglas de reverse proxy para:
   - `/api/*` → `http://localhost:8000/api/*`
   - `/*` → `http://localhost:3000/*`

### Opción B: Ejecución Manual (Desarrollo)

Simplemente ejecuta:

```bash
.\scripts\start_windows.bat
```

## 📖 Uso

### Iniciar en Desarrollo

#### Backend
```bash
cd backend
venv\Scripts\activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
> **Nota para Windows**: Se utiliza `python -m uvicorn` para evitar errores del lanzador `.exe` en rutas de directorio con espacios.

#### Frontend
```bash
cd frontend
npm run dev
```

#### Celery Worker
```bash
cd backend
venv\Scripts\activate
python -m celery -A app.tasks.background_tasks worker --loglevel=info
```

### Iniciar en Producción (Windows Services)

```bash
# Backend
python service.py start

# Worker (manual)
cd backend
venv\Scripts\activate
python -m celery -A app.tasks.background_tasks worker --loglevel=info

# Frontend
pm2 start gemelo-digital-frontend
```

### Iniciar Todo (Script Automático en Terminales Separadas)

Puedes ejecutar el script desde la raíz o desde la carpeta `scripts`:

```bash
# Desde la raíz del proyecto
.\start_windows.bat

# O desde la carpeta scripts
.\scripts\start_windows.bat
```

Este script abrirá automáticamente **dos ventanas de consola/terminal independientes**:
1. **Gemelo Digital - Backend**: Ejecuta FastAPI (`uvicorn`) en `http://localhost:8000`.
2. **Gemelo Digital - Frontend**: Ejecuta Next.js (`npm run dev`) en `http://localhost:3000`.

### Acceder a la Aplicación

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Admin Panel: http://localhost:8000/admin

## 📚 API Documentation

La documentación automática de la API está disponible en:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Endpoints Principales

#### Autenticación
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/register` - Registrar usuario
- `POST /api/v1/auth/refresh` - Refrescar token
- `POST /api/v1/auth/forgot-password` - Recuperar contraseña

#### Proyectos
- `GET /api/v1/projects/` - Listar proyectos
- `POST /api/v1/projects/` - Crear proyecto
- `GET /api/v1/projects/{id}` - Obtener proyecto
- `PUT /api/v1/projects/{id}` - Actualizar proyecto
- `DELETE /api/v1/projects/{id}` - Eliminar proyecto

#### Simulaciones
- `POST /api/v1/simulations/` - Crear simulación
- `GET /api/v1/simulations/{id}` - Obtener simulación
- `GET /api/v1/simulations/{id}/status` - Estado de simulación
- `GET /api/v1/simulations/{id}/results` - Resultados de simulación

#### Reportes
- `POST /api/v1/reports/` - Generar reporte
- `GET /api/v1/reports/{id}` - Descargar reporte
- `GET /api/v1/reports/` - Listar reportes

## 🧪 Testing

### Backend Tests
```bash
cd backend
venv\Scripts\activate
python -m pytest tests/ -v --cov=app
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Integration Tests
```bash
cd backend
venv\Scripts\activate
python -m pytest tests/integration/ -v
```

## 👥 Contribución

1. Fork el repositorio
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para detalles.

## 📞 Contacto

- Proyecto para Tesis de Ingeniería de Software II
- Universidad Nacional de Trujillo

## 🙏 Agradecimientos

- ENVI-met por el software de simulación
- Comunidad de FastAPI y Next.js
- Contribuidores de librerías open source utilizadas

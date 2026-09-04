# Gemelo Digital de Infraestructura Verde Urbana

Aplicación de Gemelos Digitales para simular y visualizar el impacto de la infraestructura verde en microclima, biodiversidad y gestión hídrica bajo diferentes escenarios climáticos.

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
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

```bash
# Ejecutar script de inicio
.\scripts\start_windows.bat
```

Esto iniciará:
- Backend API en http://localhost:8000
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
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd frontend
npm run dev
```

#### Celery Worker
```bash
cd backend
venv\Scripts\activate
celery -A app.tasks.background_tasks worker --loglevel=info
```

### Iniciar en Producción (Windows Services)

```bash
# Backend
python service.py start

# Worker (manual)
cd backend
venv\Scripts\activate
celery -A app.tasks.background_tasks worker --loglevel=info

# Frontend
pm2 start gemelo-digital-frontend
```

### Iniciar Todo (Script Automático)

```bash
.\scripts\start_windows.bat
```

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
source venv/bin/activate
pytest tests/ -v --cov=app
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Integration Tests
```bash
cd backend
source venv/bin/activate
pytest tests/integration/ -v
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

# Architecture Documentation

## Gemelo Digital de Infraestructura Verde Urbana

## System Overview

The Gemelo Digital platform is a full-stack web application for simulating and visualizing the impact of urban green infrastructure on microclimate, biodiversity, and water management. The system follows a traditional three-tier architecture with separate backend, frontend, and database layers.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Browser    │  │   Mobile     │  │   Desktop    │        │
│  │  (Next.js)   │  │   (Future)   │  │  (Future)    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Web Server (Nginx)                          │
│              - SSL Termination                                  │
│              - Static File Serving                              │
│              - Reverse Proxy                                    │
│              - Load Balancing (Future)                           │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│   Frontend Server        │    │   Backend API Server     │
│   (Next.js + PM2)        │    │   (FastAPI + Gunicorn)   │
│   - Static Build         │    │   - REST API             │
│   - Client-side Routing  │    │   - Async Processing     │
│   - State Management     │    │   - JWT Auth             │
│   (Zustand)              │    │   - CORS & GZip          │
└──────────────────────────┘    └──────────────────────────┘
              │                               │
              │                               │
              ▼                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Message Queue (Redis)                       │
│              - Task Queue                                        │
│              - Result Backend                                    │
│              - Caching Layer                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Background Worker                             │
│              (Celery + Python)                                   │
│   - ENVI-met Simulation Execution                                │
│   - Result Processing                                            │
│   - Report Generation                                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Database Layer (PostgreSQL)                     │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│   │  PostgreSQL  │  │   PostGIS    │  │  TimescaleDB │        │
│   │  (Core DB)   │  │  (Spatial)   │  │  (Time-Series)│       │
│   └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  External Services                                │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│   │  ENVI-met    │  │   File       │  │   Email      │        │
│   │  (Simulation)│  │   Storage    │  │   Service    │        │
│   └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend

- **Framework**: FastAPI 0.104+
- **Python Version**: 3.11+
- **ASGI Server**: Uvicorn
- **Production Server**: Gunicorn with Uvicorn workers
- **Database**: PostgreSQL 15 with PostGIS 3 and TimescaleDB 2
- **ORM**: SQLAlchemy 2.0 (async)
- **Authentication**: JWT (PyJWT) with bcrypt password hashing
- **Task Queue**: Celery with Redis broker
- **Simulation Engine**: ENVI-met (external)
- **Data Processing**:
  - xarray (NetCDF)
  - pandas (CSV)
  - geopandas (GeoJSON)
  - numpy (numerical)
- **Report Generation**:
  - ReportLab (PDF)
  - python-docx (Word)
  - openpyxl (Excel)

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Maps**: Leaflet with react-leaflet
- **Charts**: Chart.js with react-chartjs-2
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Production**: PM2 process manager

### Infrastructure

- **Web Server**: Nginx
- **Process Manager**: systemd (backend), PM2 (frontend)
- **Reverse Proxy**: Nginx
- **SSL**: Let's Encrypt (certbot)
- **Logging**: Structured logging with logrotate
- **Monitoring**: (Future - Prometheus/Grafana)

## Backend Architecture

### Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── api/v1/
│   │   ├── api.py             # API router aggregation
│   │   └── endpoints/
│   │       ├── auth.py        # Authentication endpoints
│   │       ├── projects.py    # Project management
│   │       ├── simulations.py # Simulation management
│   │       ├── reports.py     # Report generation
│   │       └── dashboard.py    # Dashboard data
│   ├── core/
│   │   ├── config.py          # Configuration management
│   │   ├── database.py        # Database connection
│   │   └── security.py        # JWT and password hashing
│   ├── models/
│   │   ├── user.py            # User model
│   │   ├── project.py         # Project model
│   │   ├── scenario.py        # Scenario model
│   │   ├── simulation.py      # Simulation model
│   │   ├── report.py          # Report model
│   │   └── green_infrastructure.py
│   ├── schemas/
│   │   ├── user.py            # User Pydantic schemas
│   │   ├── project.py         # Project Pydantic schemas
│   │   ├── simulation.py      # Simulation Pydantic schemas
│   │   ├── report.py          # Report Pydantic schemas
│   │   └── dashboard.py       # Dashboard Pydantic schemas
│   ├── services/
│   │   ├── envi_met_orchestrator.py  # ENVI-met integration
│   │   ├── simulation_processor.py   # Result processing
│   │   ├── geo_processor.py          # Geospatial operations
│   │   └── report_generator.py       # Report generation
│   └── utils/
│       ├── logging_config.py  # Logging configuration
│       ├── file_handler.py    # File upload handling
│       └── validators.py      # Input validation
├── alembic/
│   ├── env.py                 # Alembic environment
│   ├── script.py.mako         # Migration template
│   └── versions/              # Migration files
├── alembic.ini                # Alembic configuration
├── requirements.txt           # Python dependencies
├── pyproject.toml             # Project metadata
└── .env.example               # Environment variables template
```

### Key Components

#### FastAPI Application (`main.py`)
- Lifespan events for database connection
- CORS middleware configuration
- GZip compression
- API router inclusion
- Health check endpoints

#### Database Layer (`core/database.py`)
- Async SQLAlchemy engine
- Session management
- Connection pooling
- Dependency injection for sessions

#### Security (`core/security.py`)
- JWT token creation and validation
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Authentication dependencies

#### API Endpoints
- **Auth**: Register, login, token refresh, password recovery
- **Projects**: CRUD operations, sharing, file uploads
- **Simulations**: Scenario management, simulation execution, status monitoring
- **Reports**: Generation, download, management
- **Dashboard**: KPIs, time series, spatial data, comparisons

#### Services Layer
- **ENVI-met Orchestrator**: Input file generation, simulation execution, process monitoring
- **Simulation Processor**: NetCDF/CSV parsing, data extraction, index calculation
- **Geo Processor**: GeoJSON validation, spatial operations, coordinate transformations
- **Report Generator**: PDF/Word/Excel generation with charts and tables

## Frontend Architecture

### Directory Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # Global styles
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx  # Login page
│   │   │   └── register/page.tsx
│   │   └── (dashboard)/
│   │       └── dashboard/page.tsx
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── KPIPanel.tsx
│   │   │   └── ScenarioSelector.tsx
│   │   ├── maps/
│   │   │   ├── MapContainer.tsx
│   │   │   └── LeafletMap.tsx
│   │   └── charts/
│   │       └── TemperatureChart.tsx
│   └── lib/
│       └── api.ts              # API client (future)
├── package.json                # Dependencies
├── tsconfig.json              # TypeScript config
├── tailwind.config.ts         # Tailwind config
├── next.config.js             # Next.js config
└── .env.local.example         # Environment variables
```

### Key Components

#### Pages
- **Home**: Landing page with feature overview
- **Login/Register**: Authentication pages
- **Dashboard**: Main application interface

#### Components
- **KPIPanel**: Displays key performance indicators
- **ScenarioSelector**: Dropdown for scenario selection
- **MapContainer**: Interactive map with Leaflet
- **LeafletMap**: Leaflet map component (SSR-safe)
- **TemperatureChart**: Time series temperature chart

#### State Management
- Zustand for global state
- Local component state for UI interactions
- React hooks for data fetching

## Database Architecture

### Schema Overview

**Users**
- id (UUID, PK)
- email (VARCHAR, unique)
- hashed_password (VARCHAR)
- role (ENUM: admin, researcher, visitor)
- full_name, institution
- is_active, is_verified
- preferences (JSONB)

**Projects**
- id (UUID, PK)
- name, description
- location_name
- bounds_geojson (JSONB)
- owner_id (FK → users)
- is_public (BOOLEAN)

**Green Infrastructure**
- id (UUID, PK)
- project_id (FK → projects)
- geometry (GEOMETRY)
- type, species
- height_meters, crown_diameter_meters
- leaf_area_index
- properties (JSONB)

**Scenarios**
- id (UUID, PK)
- project_id (FK → projects)
- name, description
- vegetation_config (JSONB)
- surfaces_config (JSONB)
- buildings_config (JSONB)
- climate_data (JSONB)

**Simulations**
- id (UUID, PK)
- scenario_id (FK → scenarios)
- user_id (FK → users)
- status (ENUM: pending, running, completed, failed, cancelled)
- progress_percent
- duration_hours
- envi_met_input_path, envi_met_output_path
- started_at, completed_at

**Simulation Results** (TimescaleDB Hypertable)
- id (UUID, PK)
- simulation_id (FK → simulations)
- time (TIMESTAMP)
- temperature, humidity, wind_speed, wind_direction
- pet, radiation, surface_temperature
- thermal_comfort_index, runoff_coefficient, biodiversity_index
- spatial_data (JSONB)

**Reports**
- id (UUID, PK)
- simulation_id (FK → simulations)
- user_id (FK → users)
- name, format (ENUM: pdf, word, excel)
- status (ENUM: pending, generating, completed, failed)
- content_config (JSONB)
- data_selection (JSONB)
- file_path, file_size_bytes
- generated_at

### Indexes

- Spatial index on green_infrastructure.geometry
- B-tree indexes on foreign keys
- GIN indexes on JSONB fields
- Time-series index on simulation_results.time

### Extensions

- **uuid-ossp**: UUID generation
- **postgis**: Spatial data support
- **timescaledb**: Time-series optimization

## Data Flow

### Simulation Flow

```
User Request → API Endpoint → Scenario Validation
                                    ↓
                          Create Simulation Record
                                    ↓
                          Generate ENVI-met Input Files
                                    ↓
                          Queue Background Task
                                    ↓
                          Celery Worker Picks Up Task
                                    ↓
                          Execute ENVI-met Simulation
                                    ↓
                          Monitor Progress
                                    ↓
                          Process Results (NetCDF/CSV)
                                    ↓
                          Calculate Derived Indices
                                    ↓
                          Store in Database (TimescaleDB)
                                    ↓
                          Update Simulation Status
                                    ↓
                          Notify User (WebSocket)
```

### Report Generation Flow

```
User Request → API Endpoint → Validate Simulation
                                    ↓
                          Create Report Record
                                    ↓
                          Queue Background Task
                                    ↓
                          Celery Worker Picks Up Task
                                    ↓
                          Fetch Simulation Results
                                    ↓
                          Generate Report (PDF/Word/Excel)
                                    ↓
                          Save File to Storage
                                    ↓
                          Update Report Status
                                    ↓
                          Notify User
```

## Security Architecture

### Authentication
- JWT access tokens (15 min expiration)
- JWT refresh tokens (7 day expiration)
- Password hashing with bcrypt
- Secure cookie settings

### Authorization
- Role-based access control (RBAC)
- Three roles: admin, researcher, visitor
- Permission checks on protected endpoints
- Project ownership verification

### Data Protection
- Input validation with Pydantic
- SQL injection prevention (ORM)
- XSS protection (React escaping)
- CSRF protection (FastAPI middleware)
- File upload validation
- Rate limiting

### Network Security
- CORS configuration
- HTTPS enforcement (production)
- Nginx security headers
- Firewall rules (production)

## Performance Considerations

### Backend
- Async I/O with FastAPI
- Database connection pooling
- Query optimization with indexes
- Caching with Redis (future)
- GZip compression
- Static file serving via Nginx

### Frontend
- Static build with Next.js
- Code splitting
- Lazy loading for maps
- Image optimization
- Client-side caching

### Database
- TimescaleDB for time-series data
- Spatial indexes for geospatial queries
- Connection pooling
- Query result caching (future)

## Scalability

### Horizontal Scaling
- Stateless API design
- Load balancer ready (Nginx)
- Multiple Gunicorn workers
- Celery worker scaling
- Database read replicas (future)

### Vertical Scaling
- Configurable worker counts
- Adjustable connection pool size
- Memory optimization
- CPU-intensive task isolation

## Deployment Architecture

### Production Environment
- Ubuntu Server 22.04 LTS
- PostgreSQL 15 with PostGIS and TimescaleDB
- Redis 7
- Python 3.11
- Node.js 20 LTS
- Nginx 1.24

### Process Management
- systemd for backend services
- PM2 for frontend
- systemd for Celery workers
- logrotate for log management

### Monitoring (Future)
- Application logs
- Error tracking (Sentry)
- Performance monitoring (Prometheus)
- Uptime monitoring
- Alerting

## Development Workflow

### Backend
- Virtual environment isolation
- Alembic for database migrations
- pytest for testing
- Black for code formatting
- mypy for type checking

### Frontend
- npm for dependency management
- TypeScript for type safety
- ESLint for linting
- Prettier for formatting

### Git Workflow
- Feature branches
- Pull request reviews
- Semantic versioning
- Tagged releases

## Future Enhancements

### Planned Features
- Real-time WebSocket notifications
- Advanced scenario templates
- Machine learning predictions
- Mobile application
- API rate limiting dashboard
- Advanced caching strategies
- Database read replicas
- Microservices architecture (long-term)

### Technical Improvements
- GraphQL API (alternative to REST)
- GraphQL subscriptions for real-time
- Event-driven architecture
- Containerization (optional)
- CI/CD pipeline
- Automated testing
- Performance benchmarking

# API Documentation

## Gemelo Digital de Infraestructura Verde Urbana

Base URL: `http://localhost:8000/api/v1`

## Authentication

Most endpoints require JWT authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe",
  "institution": "University"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

Response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

## Projects

### Create Project
```http
POST /projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Urban Green Infrastructure Study",
  "description": "Analysis of green infrastructure impact",
  "location_name": "Lima, Peru",
  "bounds_geojson": {
    "type": "Polygon",
    "coordinates": [[...]]
  }
}
```

### List Projects
```http
GET /projects
Authorization: Bearer <token>
```

### Get Project
```http
GET /projects/{project_id}
Authorization: Bearer <token>
```

### Update Project
```http
PUT /projects/{project_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

### Delete Project
```http
DELETE /projects/{project_id}
Authorization: Bearer <token>
```

### Share Project
```http
POST /projects/{project_id}/share
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_emails": ["user2@example.com"],
  "permission": "read"
}
```

## Scenarios & Simulations

### Create Scenario
```http
POST /simulations/scenarios
Authorization: Bearer <token>
Content-Type: application/json

{
  "project_id": "uuid",
  "name": "Baseline Scenario",
  "description": "Current state without interventions",
  "vegetation_config": [...],
  "surfaces_config": {...},
  "buildings_config": [...],
  "climate_data": {...}
}
```

### List Scenarios
```http
GET /simulations/scenarios?project_id={project_id}
Authorization: Bearer <token>
```

### Create Simulation
```http
POST /simulations
Authorization: Bearer <token>
Content-Type: application/json

{
  "scenario_id": "uuid",
  "duration_hours": 24
}
```

### Get Simulation Status
```http
GET /simulations/{simulation_id}/status
Authorization: Bearer <token>
```

Response:
```json
{
  "simulation_id": "uuid",
  "status": "running",
  "progress_percent": 45,
  "started_at": "2024-01-01T00:00:00Z"
}
```

### Get Simulation Results
```http
GET /simulations/{simulation_id}/results
Authorization: Bearer <token>
```

### Cancel Simulation
```http
POST /simulations/{simulation_id}/cancel
Authorization: Bearer <token>
```

## Reports

### Create Report
```http
POST /reports
Authorization: Bearer <token>
Content-Type: application/json

{
  "simulation_id": "uuid",
  "name": "Simulation Report",
  "format": "pdf",
  "content_config": {
    "include_methodology": true,
    "include_tables": true,
    "include_charts": true
  },
  "data_selection": {
    "variables": ["temperature", "humidity", "pet"],
    "time_range": ["2024-01-01T00:00:00Z", "2024-01-02T00:00:00Z"]
  }
}
```

### List Reports
```http
GET /reports?simulation_id={simulation_id}
Authorization: Bearer <token>
```

### Get Report
```http
GET /reports/{report_id}
Authorization: Bearer <token>
```

### Download Report
```http
GET /reports/{report_id}/download
Authorization: Bearer <token>
```

### Delete Report
```http
DELETE /reports/{report_id}
Authorization: Bearer <token>
```

## Dashboard

### Get KPIs
```http
GET /dashboard/kpis?simulation_id={simulation_id}
Authorization: Bearer <token>
```

Response:
```json
{
  "avg_pet": 28.5,
  "green_area_ha": 15.3,
  "runoff_coefficient": 0.35,
  "temperature_reduction": 2.4,
  "biodiversity_index": 2.1
}
```

### Get Time Series Data
```http
GET /dashboard/timeseries?simulation_id={simulation_id}&variable=temperature
Authorization: Bearer <token>
```

### Get Spatial Data
```http
GET /dashboard/spatial?simulation_id={simulation_id}&variable=temperature
Authorization: Bearer <token>
```

### Get Scenario List
```http
GET /dashboard/scenarios?project_id={project_id}
Authorization: Bearer <token>
```

### Compare Scenarios
```http
GET /dashboard/compare?scenario_ids={id1},{id2}
Authorization: Bearer <token>
```

### Get Heatmap Data
```http
GET /dashboard/heatmap?simulation_id={simulation_id}&variable=temperature
Authorization: Bearer <token>
```

### Get Wind Rose Data
```http
GET /dashboard/windrose?simulation_id={simulation_id}
Authorization: Bearer <token>
```

### Get Recent Activity
```http
GET /dashboard/activity?limit=10
Authorization: Bearer <token>
```

## Error Responses

All endpoints may return error responses:

```json
{
  "detail": "Error message description"
}
```

Common HTTP status codes:
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting

API requests are rate limited to 100 requests per minute per user.

## File Uploads

For file uploads (GeoJSON, Shapefile, CSV), use multipart/form-data:

```http
POST /projects/{project_id}/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file>
file_type: geojson
```

Maximum file sizes:
- GeoJSON: 10MB
- Shapefile: 50MB
- CSV: 100MB
- NetCDF: 500MB

"""
Report generation endpoints.
Handles PDF, Word, and Excel report generation, preview, and download.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID, uuid4
from datetime import datetime
from enum import Enum
import os

from app.core.database import get_db
from app.services.report_generator import report_generator, DEFAULT_GREEN_INFRASTRUCTURE, DEFAULT_ML_MODELS

router = APIRouter()


class ReportFormat(str, Enum):
    PDF = "pdf"
    WORD = "word"
    EXCEL = "excel"


class ReportType(str, Enum):
    SIMULATION = "simulation"
    GREEN_INFRASTRUCTURE = "green_infrastructure"
    ML_EVALUATION = "ml_evaluation"
    PROJECTS = "projects"


class ReportCreate(BaseModel):
    name: str = Field(default="Reporte de Infraestructura Verde Urbana", min_length=1, max_length=200)
    description: Optional[str] = "Informe descriptivo y listados de infraestructura verde y microclima."
    format: ReportFormat = ReportFormat.PDF
    report_type: ReportType = ReportType.GREEN_INFRASTRUCTURE
    simulation_id: Optional[UUID] = None
    project_id: Optional[UUID] = None
    
    include_maps: bool = True
    include_charts: bool = True
    include_tables: bool = True
    include_methodology: bool = True
    variables: List[str] = Field(
        default_factory=lambda: ["temperature", "humidity", "wind_speed", "pet"]
    )


@router.post("/preview")
async def preview_report(report_data: ReportCreate):
    """
    Generate structured preview data and content representation
    for live modal preview in the web interface BEFORE downloading.
    """
    sample_simulation_data = {
        "time_series": [
            {"time": "08:00:00", "temperature": 22.1, "humidity": 72.0, "pet": 23.5, "wind_speed": 2.1},
            {"time": "10:00:00", "temperature": 24.5, "humidity": 68.0, "pet": 26.2, "wind_speed": 2.3},
            {"time": "12:00:00", "temperature": 27.8, "humidity": 60.0, "pet": 30.1, "wind_speed": 2.8},
            {"time": "14:00:00", "temperature": 28.5, "humidity": 58.0, "pet": 31.4, "wind_speed": 3.0},
            {"time": "16:00:00", "temperature": 26.9, "humidity": 63.0, "pet": 29.0, "wind_speed": 2.5},
            {"time": "18:00:00", "temperature": 24.2, "humidity": 70.0, "pet": 25.3, "wind_speed": 2.0},
        ],
        "green_infrastructure": DEFAULT_GREEN_INFRASTRUCTURE,
        "ml_models": DEFAULT_ML_MODELS
    }

    summary = (
        "El área de estudio cuenta con 5 áreas principales de infraestructura verde evaluadas. "
        "Se registró una temperatura promedio de 25.4 °C y un confort térmico PET de 27.8 °C. "
        "Las estrategias de arbolado urbano y techos verdes demuestran una reducción máxima de "
        "temperatura de -3.8 °C en horas pico."
    )

    kpis = [
        {"metric": "Temperatura Promedio", "value": "25.4 °C", "status": "Óptimo"},
        {"metric": "Humedad Relativa Promedio", "value": "64.5 %", "status": "Normal"},
        {"metric": "Velocidad de Viento Media", "value": "2.4 m/s", "status": "Favorable"},
        {"metric": "Índice PET (Confort)", "value": "27.8 °C", "status": "Confortable"},
        {"metric": "Reducción Máx. Temperatura", "value": "-3.8 °C", "status": "Significativo"},
        {"metric": "Coeficiente de Escorrentía", "value": "0.32", "status": "Reducido"}
    ]

    return {
        "preview_id": str(uuid4()),
        "title": report_data.name,
        "report_type": report_data.report_type,
        "format": report_data.format,
        "generated_at": datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
        "summary": summary,
        "kpis": kpis,
        "green_infrastructure_list": DEFAULT_GREEN_INFRASTRUCTURE,
        "ml_models": DEFAULT_ML_MODELS,
        "time_series_sample": sample_simulation_data["time_series"],
        "supported_formats": ["pdf", "excel", "word"],
        "export_url": f"/api/v1/reports/export?format={report_data.format.value}&report_type={report_data.report_type.value}"
    }


@router.post("/export")
@router.get("/export")
async def export_report(
    format: str = Query("pdf", description="pdf, excel, or word"),
    report_type: str = Query("green_infrastructure", description="simulation, green_infrastructure, ml_evaluation, projects"),
    name: Optional[str] = Query("Reporte_Infraestructura_Verde", description="Nombre del reporte")
):
    """
    Generate and stream the report file directly (PDF, Excel, or Word)
    for instant download.
    """
    fmt = (format or "pdf").lower()
    if fmt == "docx":
        fmt = "word"
    elif fmt == "xlsx":
        fmt = "excel"

    report_config = {
        "report_id": f"export_{int(datetime.now().timestamp())}",
        "name": name.replace("_", " "),
        "include_tables": True,
        "include_methodology": True
    }

    simulation_data = {
        "time_series": [
            {"time": "08:00:00", "temperature": 22.1, "humidity": 72.0, "pet": 23.5},
            {"time": "12:00:00", "temperature": 27.8, "humidity": 60.0, "pet": 30.1},
            {"time": "16:00:00", "temperature": 26.9, "humidity": 63.0, "pet": 29.0},
        ],
        "green_infrastructure": DEFAULT_GREEN_INFRASTRUCTURE,
        "ml_models": DEFAULT_ML_MODELS
    }

    try:
        generated_path = report_generator.generate_report(
            report_config=report_config,
            simulation_data=simulation_data,
            format=fmt
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generando reporte ({fmt}): {str(e)}"
        )

    if not os.path.exists(generated_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Archivo de reporte no encontrado."
        )

    if fmt == "pdf":
        media_type = "application/pdf"
        ext = "pdf"
    elif fmt == "excel":
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ext = "xlsx"
    elif fmt == "word":
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ext = "docx"
    else:
        media_type = "application/octet-stream"
        ext = fmt

    filename = f"{name}.{ext}"

    return FileResponse(
        path=generated_path,
        media_type=media_type,
        filename=filename,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )


@router.get("/")
async def list_reports():
    """List available report templates and recent reports."""
    return [
        {
            "id": str(uuid4()),
            "name": "Listado de Infraestructura Verde Urbana",
            "format": "pdf",
            "status": "completed",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid4()),
            "name": "Resumen Microclimático y Simulaciones",
            "format": "excel",
            "status": "completed",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid4()),
            "name": "Evaluación Comparativa de Modelos ML",
            "format": "word",
            "status": "completed",
            "created_at": datetime.now().isoformat()
        }
    ]

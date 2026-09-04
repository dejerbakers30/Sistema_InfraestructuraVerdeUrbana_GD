"""
Dashboard endpoints.
Provides aggregated data for the main dashboard including KPIs, charts, and map data.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user

router = APIRouter()


# Pydantic schemas
class KPIResponse(BaseModel):
    """Key Performance Indicators for dashboard"""
    avg_pet: Optional[float]  # Physiological Equivalent Temperature
    green_area_ha: float  # Effective green area in hectares
    runoff_coefficient: float  # Average runoff coefficient
    temperature_reduction: float  # Average temperature reduction in °C
    biodiversity_index: Optional[float]  # Shannon-Wiener index
    thermal_comfort_zones: Dict[str, int]  # Zones by comfort level


class TimeSeriesData(BaseModel):
    """Time series data for charts"""
    timestamps: List[str]
    temperature: List[float]
    humidity: List[float]
    wind_speed: List[float]
    pet: List[float]


class SpatialData(BaseModel):
    """Spatial data for maps"""
    geojson: Dict[str, Any]
    variable: str
    timestamp: Optional[str]
    min_value: float
    max_value: float


class ScenarioComparison(BaseModel):
    """Comparison between scenarios"""
    scenario_a_id: UUID
    scenario_b_id: UUID
    differences: Dict[str, Any]


@router.get("/kpi", response_model=KPIResponse)
async def get_dashboard_kpis(
    project_id: Optional[UUID] = None,
    simulation_id: Optional[UUID] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get Key Performance Indicators for the dashboard.
    Can filter by project_id or simulation_id.
    """
    # TODO: Query simulation results from database
    # TODO: Calculate KPIs from results
    # TODO: Apply filters if provided
    
    return KPIResponse(
        avg_pet=28.5,
        green_area_ha=15.3,
        runoff_coefficient=0.35,
        temperature_reduction=2.4,
        biodiversity_index=2.1,
        thermal_comfort_zones={
            "comfortable": 45,
            "slightly_uncomfortable": 30,
            "uncomfortable": 20,
            "very_uncomfortable": 5
        }
    )


@router.get("/timeseries", response_model=TimeSeriesData)
async def get_timeseries_data(
    simulation_id: UUID,
    variable: str = Query("temperature", regex="^(temperature|humidity|wind_speed|pet|radiation)$"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get time series data for a specific simulation and variable.
    Used for dynamic charts in the dashboard.
    """
    # TODO: Query time series data from TimescaleDB
    # TODO: Filter by simulation_id and variable
    # TODO: Check user access to simulation
    
    return TimeSeriesData(
        timestamps=[],
        temperature=[],
        humidity=[],
        wind_speed=[],
        pet=[]
    )


@router.get("/spatial", response_model=SpatialData)
async def get_spatial_data(
    simulation_id: UUID,
    variable: str = Query("temperature", regex="^(temperature|humidity|wind_speed|pet|surface_temp)$"),
    timestamp: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get spatial data for map visualization.
    Returns GeoJSON with the specified variable values at grid points.
    """
    # TODO: Query spatial data from PostGIS
    # TODO: Filter by simulation_id, variable, and timestamp
    # TODO: Convert to GeoJSON format
    # TODO: Check user access to simulation
    
    return SpatialData(
        geojson={"type": "FeatureCollection", "features": []},
        variable=variable,
        timestamp=timestamp,
        min_value=20.0,
        max_value=35.0
    )


@router.get("/scenarios")
async def list_scenarios(
    project_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all scenarios for a project.
    Used in the scenario selector dropdown.
    """
    # TODO: Query scenarios from database
    # TODO: Filter by project_id
    # TODO: Check user access to project
    
    return {
        "scenarios": [
            {
                "id": str(uuid4()),
                "name": "Baseline Scenario",
                "description": "Current state without interventions",
                "created_at": "2024-01-01T00:00:00"
            },
            {
                "id": str(uuid4()),
                "name": "Green Roof Scenario",
                "description": "Add green roofs to 50% of buildings",
                "created_at": "2024-01-02T00:00:00"
            }
        ]
    }


@router.post("/compare", response_model=ScenarioComparison)
async def compare_scenarios(
    scenario_a_id: UUID,
    scenario_b_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Compare two scenarios and their simulation results.
    Returns differences in key metrics.
    """
    # TODO: Fetch both scenarios and their latest simulations
    # TODO: Compare results and calculate differences
    # TODO: Check user access to both scenarios
    
    return ScenarioComparison(
        scenario_a_id=scenario_a_id,
        scenario_b_id=scenario_b_id,
        differences={
            "temperature_delta": -1.5,
            "humidity_delta": 0.05,
            "pet_delta": -2.0,
            "runoff_delta": -0.1
        }
    )


@router.get("/heatmap")
async def get_heatmap_data(
    simulation_id: UUID,
    variable: str = Query("temperature"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get heatmap data for a specific variable.
    Returns grid data suitable for heatmap visualization.
    """
    # TODO: Query grid data from database
    # TODO: Format as 2D array for heatmap
    # TODO: Check user access
    
    return {
        "simulation_id": str(simulation_id),
        "variable": variable,
        "grid": [],
        "x_coords": [],
        "y_coords": [],
        "min": 20.0,
        "max": 35.0
    }


@router.get("/wind-rose")
async def get_wind_rose_data(
    simulation_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get wind rose data for wind visualization.
    Returns wind direction and speed distribution.
    """
    # TODO: Query wind data from database
    # TODO: Aggregate by direction sectors
    # TODO: Check user access
    
    return {
        "simulation_id": str(simulation_id),
        "directions": [],
        "speeds": [],
        "frequencies": []
    }


@router.get("/recent-activity")
async def get_recent_activity(
    limit: int = Query(10, ge=1, le=50),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get recent activity for the current user.
    Includes recent simulations, report generations, and project updates.
    """
    # TODO: Query recent activity from database
    # TODO: Filter by user_id
    # TODO: Return ordered by date descending
    
    return {
        "activities": [
            {
                "type": "simulation_completed",
                "message": "Simulation 'Urban Heat Island' completed",
                "timestamp": "2024-01-15T10:30:00",
                "link": f"/simulations/{uuid4()}"
            },
            {
                "type": "report_generated",
                "message": "Report 'Q1 Analysis' generated",
                "timestamp": "2024-01-15T09:15:00",
                "link": f"/reports/{uuid4()}"
            }
        ]
    }

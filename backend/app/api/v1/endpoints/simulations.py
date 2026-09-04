"""
Simulation endpoints.
Manages ENVI-met simulations, scenarios, and results.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID, uuid4
from datetime import datetime
from enum import Enum

from app.core.database import get_db
from app.core.security import get_current_user, require_roles, ROLE_ADMIN, ROLE_RESEARCHER

router = APIRouter()


# Enums
class SimulationStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class VegetationType(str, Enum):
    TREE = "tree"
    GREEN_ROOF = "green_roof"
    GREEN_WALL = "green_wall"
    PARK = "park"


# Pydantic schemas
class ScenarioCreate(BaseModel):
    project_id: UUID
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    
    # Vegetation parameters
    vegetation: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Surface parameters
    surfaces: Dict[str, Any] = Field(default_factory=dict)
    
    # Building parameters
    buildings: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Climate parameters
    climate_file: Optional[str] = None  # Path to .epw file
    climate_data: Optional[Dict[str, Any]] = None  # Manual climate data


class SimulationCreate(BaseModel):
    scenario_id: UUID
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    duration_hours: int = Field(default=24, ge=1, le=168)


class SimulationResponse(BaseModel):
    id: UUID
    scenario_id: UUID
    name: str
    description: Optional[str]
    status: SimulationStatus
    progress: float
    duration_hours: int
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    error_message: Optional[str]
    created_by: str
    
    class Config:
        from_attributes = True


class ScenarioResponse(BaseModel):
    id: UUID
    project_id: UUID
    name: str
    description: Optional[str]
    vegetation: List[Dict[str, Any]]
    surfaces: Dict[str, Any]
    buildings: List[Dict[str, Any]]
    climate_file: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


@router.post("/scenarios", response_model=ScenarioResponse, status_code=status.HTTP_201_CREATED)
async def create_scenario(
    scenario_data: ScenarioCreate,
    current_user: dict = Depends(require_roles(ROLE_ADMIN, ROLE_RESEARCHER)),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new simulation scenario.
    Defines vegetation, surfaces, buildings, and climate parameters.
    """
    # TODO: Validate project exists and user has access
    # TODO: Create scenario in database
    # TODO: Store vegetation, surfaces, buildings as JSONB
    
    scenario_id = uuid4()
    
    return ScenarioResponse(
        id=scenario_id,
        project_id=scenario_data.project_id,
        name=scenario_data.name,
        description=scenario_data.description,
        vegetation=scenario_data.vegetation,
        surfaces=scenario_data.surfaces,
        buildings=scenario_data.buildings,
        climate_file=scenario_data.climate_file,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )


@router.get("/scenarios/{scenario_id}", response_model=ScenarioResponse)
async def get_scenario(
    scenario_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific scenario by ID.
    """
    # TODO: Fetch scenario from database
    # TODO: Check user access
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Scenario not found"
    )


@router.post("/", response_model=SimulationResponse, status_code=status.HTTP_201_CREATED)
async def create_simulation(
    simulation_data: SimulationCreate,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(require_roles(ROLE_ADMIN, ROLE_RESEARCHER)),
    db: AsyncSession = Depends(get_db)
):
    """
    Create and queue a new simulation.
    Generates ENVI-met input files and starts background processing.
    """
    # TODO: Validate scenario exists
    # TODO: Check concurrent simulation limit
    # TODO: Generate ENVI-met input files (.inx, .simx)
    # TODO: Create simulation record in database with status QUEUED
    # TODO: Add background task to process simulation
    
    simulation_id = uuid4()
    
    # Schedule background task
    # background_tasks.add_task(process_simulation, simulation_id)
    
    return SimulationResponse(
        id=simulation_id,
        scenario_id=simulation_data.scenario_id,
        name=simulation_data.name,
        description=simulation_data.description,
        status=SimulationStatus.QUEUED,
        progress=0.0,
        duration_hours=simulation_data.duration_hours,
        started_at=None,
        completed_at=None,
        error_message=None,
        created_by=current_user["user_id"]
    )


@router.get("/{simulation_id}", response_model=SimulationResponse)
async def get_simulation(
    simulation_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get simulation details and current status.
    """
    # TODO: Fetch simulation from database
    # TODO: Check user access
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Simulation not found"
    )


@router.get("/{simulation_id}/status")
async def get_simulation_status(
    simulation_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get real-time simulation status and progress.
    """
    # TODO: Fetch simulation status from database or Redis
    # TODO: Return progress percentage and current step
    
    return {
        "simulation_id": str(simulation_id),
        "status": "queued",
        "progress": 0.0,
        "current_step": "Initializing",
        "estimated_time_remaining": None
    }


@router.post("/{simulation_id}/cancel")
async def cancel_simulation(
    simulation_id: UUID,
    current_user: dict = Depends(require_roles(ROLE_ADMIN, ROLE_RESEARCHER)),
    db: AsyncSession = Depends(get_db)
):
    """
    Cancel a running or queued simulation.
    Only the creator or admin can cancel.
    """
    # TODO: Fetch simulation from database
    # TODO: Check if user is creator or admin
    # TODO: Update status to CANCELLED
    # TODO: Stop ENVI-met process if running
    
    return {"message": "Simulation cancelled"}


@router.get("/{simulation_id}/results")
async def get_simulation_results(
    simulation_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get simulation results.
    Returns processed data for visualization (temperature, humidity, wind, PET, etc.).
    """
    # TODO: Check if simulation is completed
    # TODO: Fetch results from database (PostgreSQL with TimescaleDB)
    # TODO: Return time series and spatial data
    
    return {
        "simulation_id": str(simulation_id),
        "time_series": [],
        "spatial_data": {},
        "metadata": {}
    }


@router.get("/{simulation_id}/results/download")
async def download_simulation_results(
    simulation_id: UUID,
    format: str = Query("netcdf", regex="^(netcdf|csv|geojson)$"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Download raw simulation results in various formats.
    """
    # TODO: Check if simulation is completed
    # TODO: Generate file in requested format
    # TODO: Return file for download
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Results not available"
    )


@router.get("/projects/{project_id}/simulations")
async def list_project_simulations(
    project_id: UUID,
    status: Optional[SimulationStatus] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all simulations for a specific project.
    """
    # TODO: Fetch simulations for project
    # TODO: Apply status filter if provided
    # TODO: Check user access to project
    
    return {"simulations": [], "total": 0}

"""
Simulation-related Pydantic schemas for request/response validation.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from enum import Enum


class SimulationStatus(str, Enum):
    """Simulation status enumeration"""
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ScenarioBase(BaseModel):
    """Base scenario schema with common fields"""
    project_id: UUID
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None


class ScenarioCreate(ScenarioBase):
    """Schema for scenario creation"""
    vegetation: List[Dict[str, Any]] = Field(default_factory=list)
    surfaces: Dict[str, Any] = Field(default_factory=dict)
    buildings: List[Dict[str, Any]] = Field(default_factory=list)
    climate_file: Optional[str] = Field(None, max_length=500)
    climate_data: Optional[Dict[str, Any]] = None


class ScenarioUpdate(BaseModel):
    """Schema for scenario update"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    vegetation: Optional[List[Dict[str, Any]]] = None
    surfaces: Optional[Dict[str, Any]] = None
    buildings: Optional[List[Dict[str, Any]]] = None
    climate_file: Optional[str] = Field(None, max_length=500)
    climate_data: Optional[Dict[str, Any]] = None


class ScenarioInDBBase(ScenarioBase):
    """Base schema for scenario data from database"""
    id: UUID
    vegetation: List[Dict[str, Any]]
    surfaces: Dict[str, Any]
    buildings: List[Dict[str, Any]]
    climate_file: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class Scenario(ScenarioInDBBase):
    """Schema for scenario response"""
    pass


class SimulationBase(BaseModel):
    """Base simulation schema with common fields"""
    scenario_id: UUID
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None


class SimulationCreate(SimulationBase):
    """Schema for simulation creation"""
    duration_hours: int = Field(default=24, ge=1, le=168)


class SimulationInDBBase(SimulationBase):
    """Base schema for simulation data from database"""
    id: UUID
    status: SimulationStatus
    progress: float
    duration_hours: float
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    error_message: Optional[str]
    created_by: Optional[UUID]
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class Simulation(SimulationInDBBase):
    """Schema for simulation response"""
    pass


class SimulationStatusResponse(BaseModel):
    """Schema for simulation status endpoint"""
    simulation_id: UUID
    status: SimulationStatus
    progress: float
    current_step: Optional[str]
    estimated_time_remaining: Optional[int]


class SimulationResults(BaseModel):
    """Schema for simulation results response"""
    simulation_id: UUID
    time_series: List[Dict[str, Any]]
    spatial_data: Dict[str, Any]
    metadata: Dict[str, Any]


class SimulationResultData(BaseModel):
    """Schema for individual simulation result data point"""
    time: datetime
    temperature: Optional[float]
    humidity: Optional[float]
    wind_speed: Optional[float]
    wind_direction: Optional[float]
    pet: Optional[float]
    radiation: Optional[float]
    surface_temp: Optional[float]
    runoff_coefficient: Optional[float]
    soil_moisture: Optional[float]

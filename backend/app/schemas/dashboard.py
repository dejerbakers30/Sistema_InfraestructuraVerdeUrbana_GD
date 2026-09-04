"""
Dashboard-related Pydantic schemas for API validation.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID


class KPIResponse(BaseModel):
    """Key Performance Indicators for dashboard"""
    avg_pet: Optional[float] = Field(None, description="Physiological Equivalent Temperature")
    green_area_ha: float = Field(..., description="Effective green area in hectares")
    runoff_coefficient: float = Field(..., description="Average runoff coefficient")
    temperature_reduction: float = Field(..., description="Average temperature reduction in °C")
    biodiversity_index: Optional[float] = Field(None, description="Shannon-Wiener index")
    thermal_comfort_zones: Dict[str, int] = Field(
        default_factory=dict,
        description="Zones by comfort level"
    )


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


class ScenarioListItem(BaseModel):
    """Schema for scenario list item"""
    id: UUID
    name: str
    description: Optional[str]
    created_at: str


class ScenariosResponse(BaseModel):
    """Schema for scenarios list response"""
    scenarios: List[ScenarioListItem]


class ScenarioComparison(BaseModel):
    """Comparison between scenarios"""
    scenario_a_id: UUID
    scenario_b_id: UUID
    differences: Dict[str, Any]


class HeatmapData(BaseModel):
    """Heatmap data for visualization"""
    simulation_id: UUID
    variable: str
    grid: List[List[float]]
    x_coords: List[float]
    y_coords: List[float]
    min: float
    max: float


class WindRoseData(BaseModel):
    """Wind rose data for wind visualization"""
    simulation_id: UUID
    directions: List[float]
    speeds: List[float]
    frequencies: List[float]


class ActivityItem(BaseModel):
    """Schema for activity item"""
    type: str
    message: str
    timestamp: str
    link: Optional[str] = None


class RecentActivityResponse(BaseModel):
    """Schema for recent activity response"""
    activities: List[ActivityItem]

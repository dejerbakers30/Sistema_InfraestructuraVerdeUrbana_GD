"""
Project-related Pydantic schemas for request/response validation.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class ProjectBase(BaseModel):
    """Base project schema with common fields"""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    location_name: Optional[str] = Field(None, max_length=255)
    bounds: Optional[dict] = None  # GeoJSON bounds


class ProjectCreate(ProjectBase):
    """Schema for project creation"""
    is_public: bool = False


class ProjectUpdate(BaseModel):
    """Schema for project update"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    location_name: Optional[str] = Field(None, max_length=255)
    bounds: Optional[dict] = None
    is_public: Optional[bool] = None


class ProjectInDBBase(ProjectBase):
    """Base schema for project data from database"""
    id: UUID
    owner_id: UUID
    is_public: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class Project(ProjectInDBBase):
    """Schema for project response"""
    pass


class ProjectList(BaseModel):
    """Schema for paginated project list"""
    projects: List[Project]
    total: int
    page: int
    page_size: int


class ProjectShare(BaseModel):
    """Schema for sharing project with another user"""
    email: str


class GreenInfrastructureBase(BaseModel):
    """Base green infrastructure schema"""
    type: str = Field(..., regex="^(tree|green_roof|green_wall|park)$")
    species: Optional[str] = Field(None, max_length=100)
    height: Optional[float] = Field(None, ge=0)
    crown_diameter: Optional[float] = Field(None, ge=0)
    leaf_area_index: Optional[float] = Field(None, ge=0)
    properties: Optional[dict] = None


class GreenInfrastructureCreate(GreenInfrastructureBase):
    """Schema for creating green infrastructure"""
    project_id: UUID
    # geom would be GeoJSON geometry (simplified here)


class GreenInfrastructure(GreenInfrastructureBase):
    """Schema for green infrastructure response"""
    id: UUID
    project_id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

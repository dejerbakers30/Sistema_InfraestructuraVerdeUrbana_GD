"""
Report-related Pydantic schemas for request/response validation.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum


class ReportFormat(str, Enum):
    """Report format enumeration"""
    PDF = "pdf"
    WORD = "word"
    EXCEL = "excel"


class ReportStatus(str, Enum):
    """Report generation status enumeration"""
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"


class ReportBase(BaseModel):
    """Base report schema with common fields"""
    simulation_id: UUID
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None


class ReportCreate(ReportBase):
    """Schema for report creation"""
    format: ReportFormat = ReportFormat.PDF
    include_maps: bool = True
    include_charts: bool = True
    include_tables: bool = True
    include_methodology: bool = True
    variables: List[str] = Field(
        default_factory=lambda: ["temperature", "humidity", "wind_speed", "pet"]
    )
    time_range: Optional[dict] = None
    compare_with_simulation_id: Optional[UUID] = None


class ReportUpdate(BaseModel):
    """Schema for report update"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None


class ReportInDBBase(ReportBase):
    """Base schema for report data from database"""
    id: UUID
    format: ReportFormat
    status: ReportStatus
    include_maps: bool
    include_charts: bool
    include_tables: bool
    include_methodology: bool
    variables: List[str]
    time_range: Optional[dict]
    compare_with_simulation_id: Optional[UUID]
    file_path: Optional[str]
    file_size: Optional[int]
    generated_at: Optional[datetime]
    error_message: Optional[str]
    created_by: Optional[UUID]
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class Report(ReportInDBBase):
    """Schema for report response"""
    pass


class ReportTemplate(BaseModel):
    """Schema for report template"""
    id: str
    name: str
    description: str


class ReportTemplatesResponse(BaseModel):
    """Schema for report templates list"""
    templates: List[ReportTemplate]

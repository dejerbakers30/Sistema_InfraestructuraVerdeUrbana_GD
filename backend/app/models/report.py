"""
Report model for generated simulation reports.
"""

from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4
import enum

from app.core.database import Base


class ReportFormat(str, enum.Enum):
    """Report format enumeration"""
    PDF = "pdf"
    WORD = "word"
    EXCEL = "excel"


class ReportStatus(str, enum.Enum):
    """Report generation status enumeration"""
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"


class Report(Base):
    """
    Report model for generated simulation reports.
    Supports PDF, Word, and Excel formats.
    """
    __tablename__ = "reports"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, index=True)
    simulation_id = Column(UUID(as_uuid=True), ForeignKey("simulations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    
    # Report configuration
    format = Column(SQLEnum(ReportFormat), nullable=False)
    status = Column(SQLEnum(ReportStatus), default=ReportStatus.GENERATING, nullable=False, index=True)
    
    # Report content configuration
    include_maps = Column(Boolean, default=True, nullable=False)
    include_charts = Column(Boolean, default=True, nullable=False)
    include_tables = Column(Boolean, default=True, nullable=False)
    include_methodology = Column(Boolean, default=True, nullable=False)
    
    # Data selection (stored as JSON)
    variables = Column(JSON, default=list, nullable=False)
    time_range = Column(JSON, nullable=True)  # {"start": "...", "end": "..."}
    
    # Comparison
    compare_with_simulation_id = Column(UUID(as_uuid=True), ForeignKey("simulations.id", ondelete="SET NULL"), nullable=True)
    
    # File information
    file_path = Column(String(500), nullable=True)
    file_size = Column(Integer, nullable=True)  # File size in bytes
    
    # Generation details
    generated_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Created by
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    simulation = relationship("Simulation", foreign_keys=[simulation_id])
    compare_with_simulation = relationship("Simulation", foreign_keys=[compare_with_simulation_id])
    created_by_user = relationship("User", back_populates="reports")
    
    def __repr__(self):
        return f"<Report(id={self.id}, name='{self.name}', format={self.format}, status={self.status})>"

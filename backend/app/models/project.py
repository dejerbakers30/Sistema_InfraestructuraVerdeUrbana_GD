"""
Project model for managing urban green infrastructure projects.
"""

from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.core.database import Base


class Project(Base):
    """
    Project model representing a study area for green infrastructure analysis.
    Contains spatial bounds and project metadata.
    """
    __tablename__ = "projects"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, index=True)
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    location_name = Column(String(255), nullable=True)
    
    # GeoJSON bounds for the study area
    bounds = Column(JSON, nullable=True)
    
    # Access control
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    is_public = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    owner = relationship("User", back_populates="projects")
    scenarios = relationship("Scenario", back_populates="project", cascade="all, delete-orphan")
    green_infrastructure = relationship("GreenInfrastructure", back_populates="project", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Project(id={self.id}, name='{self.name}', owner_id={self.owner_id})>"

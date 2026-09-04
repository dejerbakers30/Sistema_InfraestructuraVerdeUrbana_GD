"""
Scenario model defining simulation parameters for green infrastructure.
"""

from sqlalchemy import Column, String, DateTime, Text, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.core.database import Base


class Scenario(Base):
    """
    Scenario model defining parameters for ENVI-met simulations.
    Includes vegetation, surfaces, buildings, and climate configurations.
    """
    __tablename__ = "scenarios"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, index=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Vegetation parameters (array of vegetation objects)
    vegetation = Column(JSON, default=list, nullable=False)
    
    # Surface parameters (permeability, albedo, materials)
    surfaces = Column(JSON, default=dict, nullable=False)
    
    # Building parameters (height, orientation, materials)
    buildings = Column(JSON, default=list, nullable=False)
    
    # Climate parameters
    climate_file = Column(String(500), nullable=True)  # Path to .epw file
    climate_data = Column(JSON, nullable=True)  # Manual climate data
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="scenarios")
    simulations = relationship("Simulation", back_populates="scenario", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Scenario(id={self.id}, name='{self.name}', project_id={self.project_id})>"

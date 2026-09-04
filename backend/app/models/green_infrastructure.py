"""
Green Infrastructure model for spatial data storage.
"""

from sqlalchemy import Column, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.core.database import Base


class GreenInfrastructure(Base):
    """
    Green Infrastructure model storing spatial data for vegetation elements.
    Uses PostGIS for geospatial queries.
    """
    __tablename__ = "green_infrastructure"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, index=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Spatial data (PostGIS geometry - to be added with GeoAlchemy2)
    # geom = Column(Geometry('Geometry', 4326), nullable=True)
    
    # Infrastructure type
    type = Column(String(50), nullable=False, index=True)  # 'tree', 'green_roof', 'green_wall', 'park'
    
    # Vegetation properties
    species = Column(String(100), nullable=True)
    height = Column(Float, nullable=True)  # Height in meters
    crown_diameter = Column(Float, nullable=True)  # Crown diameter in meters
    leaf_area_index = Column(Float, nullable=True)  # LAI value
    
    # Additional properties (stored as JSON)
    properties = Column(JSON, default=dict, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="green_infrastructure")
    
    def __repr__(self):
        return f"<GreenInfrastructure(id={self.id}, type='{self.type}', project_id={self.project_id})>"

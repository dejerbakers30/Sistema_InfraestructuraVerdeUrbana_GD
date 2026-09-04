"""
Simulation model for ENVI-met simulation runs and results.
"""

from sqlalchemy import Column, String, Float, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4
import enum

from app.core.database import Base


class SimulationStatus(str, enum.Enum):
    """Simulation status enumeration"""
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class Simulation(Base):
    """
    Simulation model representing an ENVI-met simulation run.
    Tracks status, progress, and links to results.
    """
    __tablename__ = "simulations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, index=True)
    scenario_id = Column(UUID(as_uuid=True), ForeignKey("scenarios.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    
    # Simulation configuration
    status = Column(SQLEnum(SimulationStatus), default=SimulationStatus.QUEUED, nullable=False, index=True)
    progress = Column(Float, default=0.0, nullable=False)  # 0.0 to 100.0
    duration_hours = Column(Float, nullable=False)
    
    # ENVI-met specific
    envi_met_version = Column(String(50), nullable=True)
    input_files_path = Column(String(500), nullable=True)  # Path to .inx, .simx files
    output_files_path = Column(String(500), nullable=True)  # Path to output directory
    
    # Execution details
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Created by
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    scenario = relationship("Scenario", back_populates="simulations")
    created_by_user = relationship("User", back_populates="simulations")
    results = relationship("SimulationResult", back_populates="simulation", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Simulation(id={self.id}, name='{self.name}', status={self.status})>"


class SimulationResult(Base):
    """
    Simulation result model storing time-series and spatial data.
    Uses TimescaleDB for efficient time-series queries.
    """
    __tablename__ = "simulation_results"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, index=True)
    simulation_id = Column(UUID(as_uuid=True), ForeignKey("simulations.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Time series data (TimescaleDB hypertable)
    time = Column(DateTime(timezone=True), nullable=False, index=True)
    
    # Spatial data (PostGIS geometry)
    # grid_point = Column(Geometry('POINT', 4326), nullable=True)
    
    # Environmental variables
    temperature = Column(Float, nullable=True)  # Air temperature in °C
    humidity = Column(Float, nullable=True)  # Relative humidity in %
    wind_speed = Column(Float, nullable=True)  # Wind speed in m/s
    wind_direction = Column(Float, nullable=True)  # Wind direction in degrees
    pet = Column(Float, nullable=True)  # Physiological Equivalent Temperature in °C
    radiation = Column(Float, nullable=True)  # Solar radiation in W/m²
    surface_temp = Column(Float, nullable=True)  # Surface temperature in °C
    runoff_coefficient = Column(Float, nullable=True)  # Runoff coefficient (0-1)
    soil_moisture = Column(Float, nullable=True)  # Soil moisture in %
    
    # Additional calculated indices
    thermal_comfort_index = Column(Float, nullable=True)
    biodiversity_index = Column(Float, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    simulation = relationship("Simulation", back_populates="results")
    
    def __repr__(self):
        return f"<SimulationResult(id={self.id}, simulation_id={self.simulation_id}, time={self.time})>"

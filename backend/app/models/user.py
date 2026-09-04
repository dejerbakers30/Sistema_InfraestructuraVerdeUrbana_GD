"""
User model with authentication and role-based access control.
"""

from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.core.database import Base


class User(Base):
    """
    User model for authentication and authorization.
    Supports multiple roles and user preferences.
    """
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    institution = Column(String(255), nullable=True)
    
    # Role: admin, researcher, visitor
    role = Column(String(50), default="visitor", nullable=False)
    
    @property
    def roles(self):
        return [self.role] if self.role else ["visitor"]
    
    # Account status
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    # User preferences (stored as JSON)
    preferences = Column(JSON, default=dict, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")
    simulations = relationship("Simulation", back_populates="created_by_user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="created_by_user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role={self.role})>"

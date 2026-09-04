"""
User-related Pydantic schemas for request/response validation.
"""

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class UserBase(BaseModel):
    """Base user schema with common fields"""
    email: EmailStr
    full_name: Optional[str] = Field(None, max_length=255)
    institution: Optional[str] = Field(None, max_length=255)


class UserCreate(UserBase):
    """Schema for user registration"""
    password: str = Field(..., min_length=8, max_length=100)


class UserUpdate(BaseModel):
    """Schema for user profile update"""
    full_name: Optional[str] = Field(None, max_length=255)
    institution: Optional[str] = Field(None, max_length=255)
    preferences: Optional[dict] = None


class UserInDBBase(UserBase):
    """Base schema for user data from database"""
    id: UUID
    roles: List[str]
    is_active: bool
    is_verified: bool
    preferences: Optional[dict] = None
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class User(UserInDBBase):
    """Schema for user response (without sensitive data)"""
    pass


class UserInDB(UserInDBBase):
    """Schema for user data with hashed password (internal use)"""
    hashed_password: str


class Token(BaseModel):
    """Schema for JWT token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenPayload(BaseModel):
    """Schema for JWT token payload"""
    sub: Optional[str] = None
    roles: List[str] = []
    exp: Optional[int] = None


class LoginRequest(BaseModel):
    """Schema for login request"""
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    """Schema for password reset request"""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Schema for password reset with token"""
    token: str
    new_password: str = Field(..., min_length=8, max_length=100)

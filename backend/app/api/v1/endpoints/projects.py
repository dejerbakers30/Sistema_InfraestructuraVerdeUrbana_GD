"""
Project management endpoints.
CRUD operations for urban green infrastructure projects.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user, require_roles, ROLE_ADMIN, ROLE_RESEARCHER

router = APIRouter()


# Pydantic schemas
class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    location_name: Optional[str] = None
    bounds: Optional[dict] = None  # GeoJSON bounds for the study area
    is_public: bool = False


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    location_name: Optional[str] = None
    bounds: Optional[dict] = None
    is_public: Optional[bool] = None


class ProjectResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    location_name: Optional[str]
    bounds: Optional[dict]
    is_public: bool
    owner_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    projects: List[ProjectResponse]
    total: int
    page: int
    page_size: int


@router.get("/", response_model=ProjectListResponse)
async def list_projects(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    is_public: Optional[bool] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all projects accessible to the current user.
    Supports pagination and filtering.
    """
    # TODO: Query projects from database
    # TODO: Apply filters (search, is_public, user ownership)
    # TODO: Implement pagination
    
    # Mock response
    return ProjectListResponse(
        projects=[],
        total=0,
        page=page,
        page_size=page_size
    )


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    current_user: dict = Depends(require_roles(ROLE_ADMIN, ROLE_RESEARCHER)),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new project.
    Requires admin or researcher role.
    """
    # TODO: Create project in database
    # TODO: Set owner_id to current_user["user_id"]
    # TODO: Generate UUID for project
    
    project_id = uuid4()
    
    return ProjectResponse(
        id=project_id,
        name=project_data.name,
        description=project_data.description,
        location_name=project_data.location_name,
        bounds=project_data.bounds,
        is_public=project_data.is_public,
        owner_id=current_user["user_id"],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific project by ID.
    User must have access to the project (owner or public).
    """
    # TODO: Fetch project from database
    # TODO: Check if user has access (owner or is_public)
    # TODO: Return 404 if not found or no access
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Project not found"
    )


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: UUID,
    project_data: ProjectUpdate,
    current_user: dict = Depends(require_roles(ROLE_ADMIN, ROLE_RESEARCHER)),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a project.
    Only project owner or admin can update.
    """
    # TODO: Fetch project from database
    # TODO: Check if user is owner or admin
    # TODO: Update project fields
    # TODO: Update updated_at timestamp
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Project not found"
    )


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: UUID,
    current_user: dict = Depends(require_roles(ROLE_ADMIN, ROLE_RESEARCHER)),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a project.
    Only project owner or admin can delete.
    """
    # TODO: Fetch project from database
    # TODO: Check if user is owner or admin
    # TODO: Delete project and related data (scenarios, simulations)
    # TODO: Return 204 No Content
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Project not found"
    )


@router.post("/{project_id}/share")
async def share_project(
    project_id: UUID,
    email: EmailStr,
    current_user: dict = Depends(require_roles(ROLE_ADMIN, ROLE_RESEARCHER)),
    db: AsyncSession = Depends(get_db)
):
    """
    Share a project with another user by email.
    Only project owner can share.
    """
    # TODO: Fetch project from database
    # TODO: Check if user is owner
    # TODO: Find user by email
    # TODO: Add user to project collaborators
    # TODO: Send notification email
    
    return {"message": "Project shared successfully"}


@router.get("/{project_id}/collaborators")
async def get_project_collaborators(
    project_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of collaborators for a project.
    """
    # TODO: Fetch project collaborators from database
    # TODO: Check if user has access to project
    
    return {"collaborators": []}

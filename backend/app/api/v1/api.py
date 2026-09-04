"""
Main API router that aggregates all endpoint routers.
"""

from fastapi import APIRouter
from app.api.v1.endpoints import auth, projects, simulations, reports, dashboard, ml

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(simulations.router, prefix="/simulations", tags=["simulations"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(ml.router, prefix="/ml", tags=["machine-learning"])


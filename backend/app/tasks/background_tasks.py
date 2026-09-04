"""
Background tasks for Celery.
Handles long-running operations like simulations and report generation.
"""

import logging
from datetime import datetime
from typing import Optional
from celery import shared_task
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.core.database import get_db
from app.models.simulation import Simulation, SimulationStatus
from app.models.report import Report, ReportStatus, ReportFormat
from app.services.envi_met_orchestrator import ENVI_METOrchestrator
from app.services.simulation_processor import SimulationProcessor
from app.services.report_generator import ReportGenerator

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def run_simulation_task(self, simulation_id: str) -> dict:
    """
    Execute ENVI-met simulation in the background.
    
    Args:
        simulation_id: UUID of the simulation
        
    Returns:
        Dict with simulation result status
    """
    logger.info(f"Starting simulation task for {simulation_id}")
    
    # Get database session
    db_gen = get_db()
    db: AsyncSession = next(db_gen)
    
    try:
        # Get simulation record
        result = db.execute(
            select(Simulation).where(Simulation.id == simulation_id)
        )
        simulation = result.scalar_one_or_none()
        
        if not simulation:
            logger.error(f"Simulation {simulation_id} not found")
            return {"status": "error", "message": "Simulation not found"}
        
        # Update status to running
        await db.execute(
            update(Simulation)
            .where(Simulation.id == simulation_id)
            .values(
                status=SimulationStatus.RUNNING,
                started_at=datetime.utcnow()
            )
        )
        await db.commit()
        
        # Initialize orchestrator
        orchestrator = ENVI_METOrchestrator()
        
        # Generate input files
        input_path = orchestrator.generate_input_files(
            simulation_id=simulation_id,
            scenario_config=simulation.scenario.vegetation_config
        )
        
        # Run simulation
        success = orchestrator.run_simulation(
            simulation_id=simulation_id,
            input_path=input_path
        )
        
        if success:
            # Process results
            processor = SimulationProcessor()
            processor.process_simulation_results(
                simulation_id=simulation_id,
                output_path=orchestrator.get_output_path(simulation_id)
            )
            
            # Update status to completed
            await db.execute(
                update(Simulation)
                .where(Simulation.id == simulation_id)
                .values(
                    status=SimulationStatus.COMPLETED,
                    completed_at=datetime.utcnow(),
                    progress_percent=100
                )
            )
            await db.commit()
            
            logger.info(f"Simulation {simulation_id} completed successfully")
            return {"status": "success", "simulation_id": simulation_id}
        else:
            # Update status to failed
            await db.execute(
                update(Simulation)
                .where(Simulation.id == simulation_id)
                .values(
                    status=SimulationStatus.FAILED,
                    error_message="Simulation execution failed",
                    completed_at=datetime.utcnow()
                )
            )
            await db.commit()
            
            logger.error(f"Simulation {simulation_id} failed")
            return {"status": "error", "message": "Simulation execution failed"}
            
    except Exception as e:
        logger.error(f"Error in simulation task: {e}")
        
        # Update status to failed
        await db.execute(
            update(Simulation)
            .where(Simulation.id == simulation_id)
            .values(
                status=SimulationStatus.FAILED,
                error_message=str(e),
                completed_at=datetime.utcnow()
            )
        )
        await db.commit()
        
        # Retry if possible
        raise self.retry(exc=e, countdown=60)
        
    finally:
        await db.close()


@shared_task(bind=True, max_retries=2)
def generate_report_task(self, report_id: str) -> dict:
    """
    Generate report in the background.
    
    Args:
        report_id: UUID of the report
        
    Returns:
        Dict with report generation status
    """
    logger.info(f"Starting report generation task for {report_id}")
    
    # Get database session
    db_gen = get_db()
    db: AsyncSession = next(db_gen)
    
    try:
        # Get report record
        result = db.execute(
            select(Report).where(Report.id == report_id)
        )
        report = result.scalar_one_or_none()
        
        if not report:
            logger.error(f"Report {report_id} not found")
            return {"status": "error", "message": "Report not found"}
        
        # Update status to generating
        await db.execute(
            update(Report)
            .where(Report.id == report_id)
            .values(status=ReportStatus.GENERATING)
        )
        await db.commit()
        
        # Initialize report generator
        generator = ReportGenerator()
        
        # Generate report based on format
        if report.format == ReportFormat.PDF:
            file_path = generator.generate_pdf_report(
                simulation_id=report.simulation_id,
                output_path=f"temp/reports/{report_id}.pdf",
                content_config=report.content_config,
                data_selection=report.data_selection
            )
        elif report.format == ReportFormat.WORD:
            file_path = generator.generate_word_report(
                simulation_id=report.simulation_id,
                output_path=f"temp/reports/{report_id}.docx",
                content_config=report.content_config,
                data_selection=report.data_selection
            )
        elif report.format == ReportFormat.EXCEL:
            file_path = generator.generate_excel_report(
                simulation_id=report.simulation_id,
                output_path=f"temp/reports/{report_id}.xlsx",
                content_config=report.content_config,
                data_selection=report.data_selection
            )
        else:
            raise ValueError(f"Unsupported report format: {report.format}")
        
        # Update status to completed
        await db.execute(
            update(Report)
            .where(Report.id == report_id)
            .values(
                status=ReportStatus.COMPLETED,
                file_path=file_path,
                generated_at=datetime.utcnow()
            )
        )
        await db.commit()
        
        logger.info(f"Report {report_id} generated successfully")
        return {"status": "success", "report_id": report_id, "file_path": file_path}
        
    except Exception as e:
        logger.error(f"Error in report generation task: {e}")
        
        # Update status to failed
        await db.execute(
            update(Report)
            .where(Report.id == report_id)
            .values(
                status=ReportStatus.FAILED,
                generated_at=datetime.utcnow()
            )
        )
        await db.commit()
        
        # Retry if possible
        raise self.retry(exc=e, countdown=30)
        
    finally:
        await db.close()


@shared_task
def cleanup_old_files_task(days: int = 30) -> int:
    """
    Clean up old temporary files.
    
    Args:
        days: Number of days to keep files
        
    Returns:
        Number of files deleted
    """
    from app.utils.file_handler import file_handler
    
    logger.info(f"Starting cleanup task for files older than {days} days")
    
    deleted_count = file_handler.cleanup_old_files(days=days)
    
    logger.info(f"Cleanup completed: {deleted_count} files deleted")
    return deleted_count


@shared_task
def update_simulation_progress_task(simulation_id: str, progress: int) -> dict:
    """
    Update simulation progress in the background.
    
    Args:
        simulation_id: UUID of the simulation
        progress: Progress percentage (0-100)
        
    Returns:
        Dict with update status
    """
    logger.info(f"Updating progress for simulation {simulation_id}: {progress}%")
    
    # Get database session
    db_gen = get_db()
    db: AsyncSession = next(db_gen)
    
    try:
        await db.execute(
            update(Simulation)
            .where(Simulation.id == simulation_id)
            .values(progress_percent=progress)
        )
        await db.commit()
        
        return {"status": "success", "simulation_id": simulation_id, "progress": progress}
        
    except Exception as e:
        logger.error(f"Error updating simulation progress: {e}")
        return {"status": "error", "message": str(e)}
        
    finally:
        await db.close()

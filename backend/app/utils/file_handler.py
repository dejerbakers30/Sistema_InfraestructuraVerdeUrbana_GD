"""
File Handler Utility.
Handles file uploads, validation, and storage operations.
"""

import os
import shutil
import logging
from pathlib import Path
from typing import Optional, Tuple
import uuid
from fastapi import UploadFile, HTTPException
from app.core.config import settings

logger = logging.getLogger(__name__)


class FileHandler:
    """
    Handler for file operations including uploads, validation, and cleanup.
    """
    
    ALLOWED_EXTENSIONS = {
        'geojson': ['.geojson', '.json'],
        'shapefile': ['.shp', '.shx', '.dbf', '.prj', '.cpg'],
        'csv': ['.csv'],
        'netcdf': ['.nc', '.nc4'],
        'image': ['.png', '.jpg', '.jpeg', '.gif'],
        'document': ['.pdf', '.doc', '.docx', '.xlsx']
    }
    
    MAX_FILE_SIZES = {
        'geojson': 10 * 1024 * 1024,  # 10MB
        'shapefile': 50 * 1024 * 1024,  # 50MB
        'csv': 100 * 1024 * 1024,  # 100MB
        'netcdf': 500 * 1024 * 1024,  # 500MB
        'image': 5 * 1024 * 1024,  # 5MB
        'document': 10 * 1024 * 1024  # 10MB
    }
    
    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
    
    def validate_file(
        self,
        file: UploadFile,
        file_type: str
    ) -> Tuple[bool, Optional[str]]:
        """
        Validate file type and size.
        
        Args:
            file: UploadFile object
            file_type: Type of file (geojson, shapefile, csv, etc.)
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check file extension
        file_ext = Path(file.filename).suffix.lower()
        allowed_extensions = self.ALLOWED_EXTENSIONS.get(file_type, [])
        
        if file_ext not in allowed_extensions:
            return False, f"Invalid file extension. Allowed: {', '.join(allowed_extensions)}"
        
        # Check file size
        max_size = self.MAX_FILE_SIZES.get(file_type, 10 * 1024 * 1024)
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Seek back to beginning
        
        if file_size > max_size:
            return False, f"File too large. Maximum size: {max_size / (1024*1024):.1f}MB"
        
        return True, None
    
    async def save_upload_file(
        self,
        file: UploadFile,
        file_type: str,
        subfolder: Optional[str] = None
    ) -> Path:
        """
        Save uploaded file to disk.
        
        Args:
            file: UploadFile object
            file_type: Type of file
            subfolder: Optional subfolder within upload directory
            
        Returns:
            Path to saved file
        """
        # Validate file
        is_valid, error_msg = self.validate_file(file, file_type)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_msg)
        
        # Create target directory
        target_dir = self.upload_dir
        if subfolder:
            target_dir = target_dir / subfolder
        target_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        file_ext = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = target_dir / unique_filename
        
        # Save file
        try:
            with file_path.open("wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            logger.info(f"File saved: {file_path}")
            return file_path
        except Exception as e:
            logger.error(f"Error saving file: {e}")
            raise HTTPException(status_code=500, detail="Error saving file")
    
    def delete_file(self, file_path: Path) -> bool:
        """
        Delete a file from disk.
        
        Args:
            file_path: Path to file
            
        Returns:
            True if deleted successfully
        """
        try:
            if file_path.exists():
                file_path.unlink()
                logger.info(f"File deleted: {file_path}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting file: {e}")
            return False
    
    def get_file_size(self, file_path: Path) -> int:
        """
        Get file size in bytes.
        
        Args:
            file_path: Path to file
            
        Returns:
            File size in bytes
        """
        return file_path.stat().st_size if file_path.exists() else 0
    
    def cleanup_old_files(self, days: int = 30) -> int:
        """
        Delete files older than specified days.
        
        Args:
            days: Number of days to keep files
            
        Returns:
            Number of files deleted
        """
        import time
        from datetime import datetime, timedelta
        
        cutoff_time = time.time() - (days * 86400)
        deleted_count = 0
        
        for file_path in self.upload_dir.rglob("*"):
            if file_path.is_file():
                if file_path.stat().st_mtime < cutoff_time:
                    try:
                        file_path.unlink()
                        deleted_count += 1
                        logger.info(f"Deleted old file: {file_path}")
                    except Exception as e:
                        logger.error(f"Error deleting old file {file_path}: {e}")
        
        logger.info(f"Cleanup completed: {deleted_count} files deleted")
        return deleted_count


# Global file handler instance
file_handler = FileHandler()

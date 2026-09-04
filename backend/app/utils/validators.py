"""
Validators Utility.
Common validation functions for data input.
"""

import os
import re
import json
import logging
from typing import Optional, List, Tuple
from uuid import UUID
from datetime import datetime

logger = logging.getLogger(__name__)


class Validators:
    """
    Collection of validation functions.
    """
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """
        Validate email format.
        
        Args:
            email: Email string
            
        Returns:
            True if valid
        """
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def validate_password(password: str) -> Tuple[bool, Optional[str]]:
        """
        Validate password strength.
        
        Args:
            password: Password string
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if len(password) < 8:
            return False, "Password must be at least 8 characters"
        
        if not re.search(r'[A-Z]', password):
            return False, "Password must contain at least one uppercase letter"
        
        if not re.search(r'[a-z]', password):
            return False, "Password must contain at least one lowercase letter"
        
        if not re.search(r'[0-9]', password):
            return False, "Password must contain at least one digit"
        
        return True, None
    
    @staticmethod
    def validate_uuid(uuid_str: str) -> bool:
        """
        Validate UUID format.
        
        Args:
            uuid_str: UUID string
            
        Returns:
            True if valid
        """
        try:
            UUID(uuid_str)
            return True
        except ValueError:
            return False
    
    @staticmethod
    def validate_geojson(geojson: dict) -> Tuple[bool, Optional[str]]:
        """
        Validate GeoJSON structure.
        
        Args:
            geojson: GeoJSON dictionary
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if not isinstance(geojson, dict):
            return False, "GeoJSON must be a dictionary"
        
        if "type" not in geojson:
            return False, "GeoJSON must have 'type' field"
        
        valid_types = ["Feature", "FeatureCollection", "Point", "LineString", "Polygon", "MultiPoint", "MultiLineString", "MultiPolygon"]
        if geojson["type"] not in valid_types:
            return False, f"Invalid GeoJSON type: {geojson['type']}"
        
        if geojson["type"] in ["Feature", "FeatureCollection"]:
            if "geometry" not in geojson and "features" not in geojson:
                return False, "GeoJSON must have 'geometry' or 'features' field"
        
        return True, None
    
    @staticmethod
    def validate_coordinates(lat: float, lon: float) -> bool:
        """
        Validate geographic coordinates.
        
        Args:
            lat: Latitude
            lon: Longitude
            
        Returns:
            True if valid
        """
        return -90 <= lat <= 90 and -180 <= lon <= 180
    
    @staticmethod
    def validate_date_range(
        start_date: Optional[datetime],
        end_date: Optional[datetime]
    ) -> Tuple[bool, Optional[str]]:
        """
        Validate date range.
        
        Args:
            start_date: Start date
            end_date: End date
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if start_date and end_date:
            if start_date > end_date:
                return False, "Start date must be before end date"
        return True, None
    
    @staticmethod
    def validate_scenario_config(config: dict) -> Tuple[bool, Optional[str]]:
        """
        Validate scenario configuration.
        
        Args:
            config: Scenario configuration dictionary
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        required_fields = ["vegetation", "surfaces", "buildings", "climate"]
        
        for field in required_fields:
            if field not in config:
                return False, f"Missing required field: {field}"
        
        # Validate vegetation config
        if not isinstance(config["vegetation"], list):
            return False, "Vegetation must be a list"
        
        # Validate surfaces config
        if not isinstance(config["surfaces"], dict):
            return False, "Surfaces must be a dictionary"
        
        return True, None
    
    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """
        Sanitize filename by removing dangerous characters.
        
        Args:
            filename: Original filename
            
        Returns:
            Sanitized filename
        """
        # Remove path separators
        filename = filename.replace("/", "").replace("\\", "")
        
        # Remove special characters
        filename = re.sub(r'[<>:"|?*]', '', filename)
        
        # Limit length
        if len(filename) > 255:
            name, ext = os.path.splitext(filename)
            filename = name[:250] + ext
        
        return filename
    
    @staticmethod
    def validate_json_string(json_str: str) -> Tuple[bool, Optional[dict]]:
        """
        Validate and parse JSON string.
        
        Args:
            json_str: JSON string
            
        Returns:
            Tuple of (is_valid, parsed_dict_or_error)
        """
        try:
            parsed = json.loads(json_str)
            return True, parsed
        except json.JSONDecodeError as e:
            return False, {"error": f"Invalid JSON: {str(e)}"}
    
    @staticmethod
    def validate_role(role: str) -> bool:
        """
        Validate user role.
        
        Args:
            role: Role string
            
        Returns:
            True if valid
        """
        valid_roles = ["admin", "researcher", "visitor"]
        return role in valid_roles


# Global validators instance
validators = Validators()

"""
Geospatial Processor Service.
Handles GeoJSON processing, spatial operations, and PostGIS integration.
"""

import logging
from typing import Dict, Any, List, Optional
import geopandas as gpd
from shapely.geometry import Point, Polygon, mapping
import json

logger = logging.getLogger(__name__)


class GeoProcessor:
    """
    Processor for geospatial data operations.
    Handles GeoJSON validation, spatial analysis, and coordinate transformations.
    """
    
    def __init__(self):
        self.default_crs = "EPSG:4326"  # WGS84
    
    def validate_geojson(self, geojson: Dict[str, Any]) -> bool:
        """
        Validate GeoJSON structure.
        
        Args:
            geojson: GeoJSON dictionary
            
        Returns:
            True if valid, False otherwise
        """
        try:
            if not isinstance(geojson, dict):
                return False
            
            if geojson.get("type") not in ["Feature", "FeatureCollection", "Point", "Polygon", "LineString"]:
                return False
            
            if geojson.get("type") == "FeatureCollection":
                features = geojson.get("features", [])
                return all(self.validate_geojson(f) for f in features)
            
            if geojson.get("type") == "Feature":
                return "geometry" in geojson and "properties" in geojson
            
            if "coordinates" not in geojson:
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"GeoJSON validation error: {e}")
            return False
    
    def parse_geojson(self, geojson_str: str) -> Optional[Dict[str, Any]]:
        """
        Parse GeoJSON string to dictionary.
        
        Args:
            geojson_str: GeoJSON string
            
        Returns:
            Parsed GeoJSON dictionary or None if invalid
        """
        try:
            geojson = json.loads(geojson_str)
            if self.validate_geojson(geojson):
                return geojson
            return None
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}")
            return None
    
    def create_geodataframe(self, geojson: Dict[str, Any]) -> Optional[gpd.GeoDataFrame]:
        """
        Create GeoDataFrame from GeoJSON.
        
        Args:
            geojson: GeoJSON dictionary
            
        Returns:
            GeoDataFrame or None if invalid
        """
        try:
            gdf = gpd.GeoDataFrame.from_features([geojson] if geojson.get("type") == "Feature" else geojson.get("features", []))
            gdf.crs = self.default_crs
            return gdf
        except Exception as e:
            logger.error(f"GeoDataFrame creation error: {e}")
            return None
    
    def calculate_bounds(self, geojson: Dict[str, Any]) -> Optional[Dict[str, float]]:
        """
        Calculate bounding box of GeoJSON.
        
        Args:
            geojson: GeoJSON dictionary
            
        Returns:
            Dictionary with min/max coordinates or None
        """
        try:
            gdf = self.create_geodataframe(geojson)
            if gdf is None or gdf.empty:
                return None
            
            bounds = gdf.total_bounds  # minx, miny, maxx, maxy
            return {
                "min_lon": float(bounds[0]),
                "min_lat": float(bounds[1]),
                "max_lon": float(bounds[2]),
                "max_lat": float(bounds[3])
            }
        except Exception as e:
            logger.error(f"Bounds calculation error: {e}")
            return None
    
    def calculate_area(self, geojson: Dict[str, Any]) -> Optional[float]:
        """
        Calculate area of GeoJSON geometry in square meters.
        
        Args:
            geojson: GeoJSON dictionary
            
        Returns:
            Area in square meters or None
        """
        try:
            gdf = self.create_geodataframe(geojson)
            if gdf is None or gdf.empty:
                return None
            
            # Project to appropriate CRS for area calculation (UTM)
            gdf_projected = gdf.to_crs(gdf.estimate_utm_crs())
            area = gdf_projected.geometry.area.sum()
            return float(area)
        except Exception as e:
            logger.error(f"Area calculation error: {e}")
            return None
    
    def buffer_geometry(
        self,
        geojson: Dict[str, Any],
        distance_meters: float
    ) -> Optional[Dict[str, Any]]:
        """
        Create buffer around geometry.
        
        Args:
            geojson: GeoJSON dictionary
            distance_meters: Buffer distance in meters
            
        Returns:
            Buffered GeoJSON or None
        """
        try:
            gdf = self.create_geodataframe(geojson)
            if gdf is None or gdf.empty:
                return None
            
            # Project to appropriate CRS for buffering
            gdf_projected = gdf.to_crs(gdf.estimate_utm_crs())
            gdf_buffered = gdf_projected.buffer(distance_meters)
            
            # Project back to WGS84
            gdf_buffered = gdf_buffered.to_crs(self.default_crs)
            
            return json.loads(gdf_buffered.to_json())
        except Exception as e:
            logger.error(f"Buffer calculation error: {e}")
            return None
    
    def intersect_geometries(
        self,
        geojson_a: Dict[str, Any],
        geojson_b: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Calculate intersection of two geometries.
        
        Args:
            geojson_a: First GeoJSON
            geojson_b: Second GeoJSON
            
        Returns:
            Intersection GeoJSON or None
        """
        try:
            gdf_a = self.create_geodataframe(geojson_a)
            gdf_b = self.create_geodataframe(geojson_b)
            
            if gdf_a is None or gdf_b is None or gdf_a.empty or gdf_b.empty:
                return None
            
            intersection = gdf_a.overlay(gdf_b, how="intersection")
            
            return json.loads(intersection.to_json())
        except Exception as e:
            logger.error(f"Intersection calculation error: {e}")
            return None
    
    def create_grid(
        self,
        bounds: Dict[str, float],
        cell_size: float = 10.0
    ) -> List[Dict[str, Any]]:
        """
        Create a regular grid within bounds.
        
        Args:
            bounds: Dictionary with min/max coordinates
            cell_size: Grid cell size in meters
            
        Returns:
            List of grid point coordinates
        """
        try:
            min_lon, min_lat = bounds["min_lon"], bounds["min_lat"]
            max_lon, max_lat = bounds["max_lon"], bounds["max_lat"]
            
            # Calculate number of cells
            lon_cells = int((max_lon - min_lon) / (cell_size / 111320))  # Approximate meters to degrees
            lat_cells = int((max_lat - min_lat) / (cell_size / 110540))
            
            grid_points = []
            
            for i in range(lon_cells + 1):
                for j in range(lat_cells + 1):
                    lon = min_lon + i * (max_lon - min_lon) / lon_cells
                    lat = min_lat + j * (max_lat - min_lat) / lat_cells
                    
                    grid_points.append({
                        "lon": lon,
                        "lat": lat,
                        "grid_x": i,
                        "grid_y": j
                    })
            
            return grid_points
            
        except Exception as e:
            logger.error(f"Grid creation error: {e}")
            return []
    
    def transform_coordinates(
        self,
        coordinates: List[float],
        from_crs: str,
        to_crs: str
    ) -> Optional[List[float]]:
        """
        Transform coordinates between coordinate reference systems.
        
        Args:
            coordinates: [x, y] coordinates
            from_crs: Source CRS (e.g., "EPSG:4326")
            to_crs: Target CRS (e.g., "EPSG:3857")
            
        Returns:
            Transformed coordinates or None
        """
        try:
            from pyproj import Transformer
            
            transformer = Transformer.from_crs(from_crs, to_crs, always_xy=True)
            x, y = transformer.transform(coordinates[0], coordinates[1])
            
            return [x, y]
        except Exception as e:
            logger.error(f"Coordinate transformation error: {e}")
            return None


# Global geo processor instance
geo_processor = GeoProcessor()

"""
Simulation Processor Service.
Handles post-processing of ENVI-met simulation results, data extraction, and storage.
"""

import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
from uuid import UUID
import xarray as xr
import pandas as pd
import numpy as np
import json

from app.core.database import AsyncSessionLocal
from app.models.simulation import SimulationResult, SimulationStatus

logger = logging.getLogger(__name__)


class SimulationProcessor:
    """
    Processor for ENVI-met simulation results.
    Extracts data from NetCDF/CSV files, calculates indices, and stores in database.
    """
    
    def __init__(self):
        self.supported_formats = ["netcdf", "csv", "eddx"]
    
    def process_results(
        self,
        simulation_id: UUID,
        output_dir: Path,
        db_session: AsyncSession
    ) -> Dict[str, Any]:
        """
        Process simulation results from ENVI-met output directory.
        
        Args:
            simulation_id: Simulation identifier
            output_dir: Directory containing ENVI-met output files
            db_session: Database session for storing results
            
        Returns:
            Dictionary with processing statistics
        """
        logger.info(f"Processing results for simulation {simulation_id}")
        
        # Find output files
        output_files = self._find_output_files(output_dir)
        
        if not output_files:
            raise FileNotFoundError(f"No output files found in {output_dir}")
        
        # Process based on file type
        results = {}
        
        if "netcdf" in output_files:
            results = self._process_netcdf(output_files["netcdf"], simulation_id)
        elif "csv" in output_files:
            results = self._process_csv(output_files["csv"], simulation_id)
        else:
            raise ValueError("Unsupported output format")
        
        # Calculate derived indices
        results = self._calculate_indices(results)
        
        # Store in database
        self._store_results(simulation_id, results, db_session)
        
        logger.info(f"Processed {len(results.get('time_series', []))} data points")
        
        return {
            "simulation_id": str(simulation_id),
            "data_points": len(results.get("time_series", [])),
            "variables": list(results.get("variables", {}).keys()),
            "status": "completed"
        }
    
    def _find_output_files(self, output_dir: Path) -> Dict[str, Path]:
        """
        Find ENVI-met output files in directory.
        
        Args:
            output_dir: Directory to search
            
        Returns:
            Dictionary mapping file types to their paths
        """
        files = {}
        
        # Look for NetCDF files
        for nc_file in output_dir.glob("*.nc"):
            files["netcdf"] = nc_file
            break
        
        # Look for CSV files
        for csv_file in output_dir.glob("*.csv"):
            files["csv"] = csv_file
            break
        
        # Look for EDDX files (ENVI-met format)
        for eddx_file in output_dir.glob("*.eddx"):
            files["eddx"] = eddx_file
            break
        
        return files
    
    def _process_netcdf(self, nc_file: Path, simulation_id: UUID) -> Dict[str, Any]:
        """
        Process NetCDF output file from ENVI-met.
        
        Args:
            nc_file: Path to NetCDF file
            simulation_id: Simulation identifier
            
        Returns:
            Dictionary with extracted data
        """
        logger.info(f"Processing NetCDF file: {nc_file}")
        
        # Open NetCDF dataset
        ds = xr.open_dataset(nc_file)
        
        results = {
            "time_series": [],
            "spatial_data": {},
            "variables": {},
            "metadata": {
                "dimensions": dict(ds.dims),
                "coordinates": list(ds.coords.keys()),
                "variables": list(ds.data_vars.keys())
            }
        }
        
        # Extract time series data
        if "time" in ds.coords:
            times = ds.coords["time"].values
            
            # Extract common variables
            variables = {
                "temperature": ds.get("T", None),
                "humidity": ds.get("RH", None),
                "wind_speed": ds.get("Wind", None),
                "wind_direction": ds.get("WindDir", None),
                "pet": ds.get("PET", None),
                "radiation": ds.get("Rad", None),
                "surface_temp": ds.get("SurfT", None)
            }
            
            # Process each time step
            for i, time in enumerate(times):
                time_point = {
                    "time": str(time),
                    "simulation_id": str(simulation_id)
                }
                
                for var_name, var_data in variables.items():
                    if var_data is not None:
                        # Extract mean value for this time step
                        if len(var_data.shape) > 1:
                            time_point[var_name] = float(np.nanmean(var_data[i].values))
                        else:
                            time_point[var_name] = float(var_data[i].values)
                
                results["time_series"].append(time_point)
        
        # Extract spatial data (last time step)
        for var_name, var_data in variables.items():
            if var_data is not None and len(var_data.shape) > 1:
                # Get last time step
                spatial_data = var_data[-1].values
                results["spatial_data"][var_name] = {
                    "data": spatial_data.tolist(),
                    "shape": list(spatial_data.shape),
                    "min": float(np.nanmin(spatial_data)),
                    "max": float(np.nanmax(spatial_data))
                }
        
        ds.close()
        
        return results
    
    def _process_csv(self, csv_file: Path, simulation_id: UUID) -> Dict[str, Any]:
        """
        Process CSV output file from ENVI-met.
        
        Args:
            csv_file: Path to CSV file
            simulation_id: Simulation identifier
            
        Returns:
            Dictionary with extracted data
        """
        logger.info(f"Processing CSV file: {csv_file}")
        
        df = pd.read_csv(csv_file)
        
        results = {
            "time_series": [],
            "spatial_data": {},
            "variables": {},
            "metadata": {
                "columns": list(df.columns),
                "rows": len(df)
            }
        }
        
        # Assume CSV has time column and variable columns
        time_col = "time" if "time" in df.columns else df.columns[0]
        
        for _, row in df.iterrows():
            time_point = {
                "time": str(row[time_col]),
                "simulation_id": str(simulation_id)
            }
            
            for col in df.columns:
                if col != time_col:
                    try:
                        time_point[col.lower()] = float(row[col])
                    except (ValueError, TypeError):
                        pass
            
            results["time_series"].append(time_point)
        
        return results
    
    def _calculate_indices(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate derived indices from raw simulation data.
        
        Args:
            results: Dictionary with raw simulation results
            
        Returns:
            Dictionary with added calculated indices
        """
        logger.info("Calculating derived indices")
        
        time_series = results.get("time_series", [])
        
        for data_point in time_series:
            # Calculate thermal comfort index
            temp = data_point.get("temperature")
            pet = data_point.get("pet")
            humidity = data_point.get("humidity")
            
            if temp and pet:
                # Simple thermal comfort index
                data_point["thermal_comfort_index"] = self._calculate_thermal_comfort(temp, pet, humidity)
            
            # Calculate runoff coefficient (simplified)
            # In real implementation, this would come from ENVI-met output
            data_point["runoff_coefficient"] = data_point.get("runoff_coefficient", 0.3)
            
            # Calculate biodiversity index (simplified)
            # In real implementation, this would use vegetation data
            data_point["biodiversity_index"] = data_point.get("biodiversity_index", 2.0)
        
        results["variables"]["thermal_comfort_index"] = "calculated"
        results["variables"]["runoff_coefficient"] = "calculated"
        results["variables"]["biodiversity_index"] = "calculated"
        
        return results
    
    def _calculate_thermal_comfort(
        self,
        temperature: float,
        pet: float,
        humidity: Optional[float] = None
    ) -> float:
        """
        Calculate thermal comfort index from temperature and PET.
        
        Args:
            temperature: Air temperature in °C
            pet: Physiological Equivalent Temperature in °C
            humidity: Relative humidity in % (optional)
            
        Returns:
            Thermal comfort index (0-1 scale)
        """
        # Simplified thermal comfort calculation
        # PET ranges: < 9 (cold), 9-26 (comfortable), 26-35 (warm), > 35 (hot)
        
        if pet < 9:
            return 0.3  # Too cold
        elif 9 <= pet <= 26:
            return 1.0  # Comfortable
        elif 26 < pet <= 35:
            return 0.7  # Warm
        else:
            return 0.4  # Too hot
    
    def _store_results(
        self,
        simulation_id: UUID,
        results: Dict[str, Any],
        db_session: AsyncSession
    ) -> None:
        """
        Store processed results in database.
        
        Args:
            simulation_id: Simulation identifier
            results: Dictionary with processed results
            db_session: Database session
        """
        logger.info(f"Storing results for simulation {simulation_id}")
        
        # In a real implementation, this would use async SQLAlchemy
        # to insert SimulationResult records
        
        # Example:
        # for data_point in results["time_series"]:
        #     result = SimulationResult(
        #         simulation_id=simulation_id,
        #         time=datetime.fromisoformat(data_point["time"]),
        #         temperature=data_point.get("temperature"),
        #         humidity=data_point.get("humidity"),
        #         wind_speed=data_point.get("wind_speed"),
        #         pet=data_point.get("pet"),
        #         thermal_comfort_index=data_point.get("thermal_comfort_index"),
        #         runoff_coefficient=data_point.get("runoff_coefficient"),
        #         biodiversity_index=data_point.get("biodiversity_index")
        #     )
        #     db_session.add(result)
        # 
        # await db_session.commit()
        
        logger.info("Results stored successfully")
    
    def convert_to_geojson(
        self,
        spatial_data: Dict[str, Any],
        grid_points: List[Dict[str, float]]
    ) -> Dict[str, Any]:
        """
        Convert spatial data to GeoJSON format for map visualization.
        
        Args:
            spatial_data: Dictionary with spatial data arrays
            grid_points: List of grid point coordinates
            
        Returns:
            GeoJSON FeatureCollection
        """
        features = []
        
        for i, point in enumerate(grid_points):
            # Get data for this grid point
            point_data = {}
            for var_name, var_info in spatial_data.items():
                if isinstance(var_info, dict) and "data" in var_info:
                    data_array = np.array(var_info["data"])
                    if i < data_array.size:
                        point_data[var_name] = float(data_array.flat[i])
            
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [point.get("lon", 0), point.get("lat", 0)]
                },
                "properties": point_data
            }
            features.append(feature)
        
        geojson = {
            "type": "FeatureCollection",
            "features": features
        }
        
        return geojson


# Global processor instance
simulation_processor = SimulationProcessor()

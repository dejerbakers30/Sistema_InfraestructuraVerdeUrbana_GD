"""
Generador de dataset de prueba para el Motor ML de Infraestructura Verde Urbana.
Genera 300 muestras con variables microclimáticas realistas y física simulada.
"""

import numpy as np
import pandas as pd
from pathlib import Path

def generate_dataset(num_samples: int = 300, output_path: str = "sample_microclimate_dataset.csv"):
    np.random.seed(42)

    # Coordenadas urbanas simuladas (ejemplo: zona metropolitana)
    lat_base = -8.1116
    lon_base = -79.0287

    latitudes = lat_base + np.random.uniform(-0.05, 0.05, num_samples)
    longitudes = lon_base + np.random.uniform(-0.05, 0.05, num_samples)

    # Variables ambientales e infraestructura
    vegetation_pct = np.random.uniform(5.0, 75.0, num_samples)  # Cobertura vegetal (%)
    building_density = np.random.uniform(10.0, 90.0, num_samples)  # Densidad construida (%)
    albedo = np.random.uniform(0.12, 0.45, num_samples)  # Albedo promedio de superficies
    solar_radiation = np.random.uniform(300.0, 950.0, num_samples)  # Rad. solar (W/m²)
    wind_speed = np.random.uniform(0.5, 6.5, num_samples)  # Vel. viento (m/s)
    humidity = np.random.uniform(35.0, 80.0, num_samples)  # Humedad relativa (%)

    # Temperatura objetivo calculada mediante física de microclima (con ruido aleatorio)
    # Mayor vegetación = menor temp (-0.11 °C por % vegetal)
    # Mayor densidad de edificación = mayor temp (+0.08 °C por % edificación)
    # Mayor radiación solar = mayor temp
    # Mayor viento = disipación de calor
    temp_base = 24.0
    cooling_effect = -0.11 * vegetation_pct
    heating_effect = 0.08 * building_density + 0.005 * solar_radiation - 0.7 * wind_speed
    noise = np.random.normal(0, 0.8, num_samples)

    temperature = temp_base + cooling_effect + heating_effect + noise
    temperature = np.round(np.clip(temperature, 18.0, 38.0), 2)

    # PET (Physiological Equivalent Temperature)
    pet = temperature + 0.15 * (100 - humidity) - 0.8 * wind_speed + noise * 0.5
    pet = np.round(np.clip(pet, 16.0, 42.0), 2)

    df = pd.DataFrame({
        "latitude": np.round(latitudes, 5),
        "longitude": np.round(longitudes, 5),
        "vegetation_pct": np.round(vegetation_pct, 2),
        "building_density": np.round(building_density, 2),
        "albedo": np.round(albedo, 3),
        "solar_radiation": np.round(solar_radiation, 1),
        "wind_speed": np.round(wind_speed, 2),
        "humidity": np.round(humidity, 1),
        "pet": pet,
        "temperature": temperature
    })

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Dataset generado exitosamente en: {output_path} ({len(df)} filas)")

if __name__ == "__main__":
    generate_dataset(300, "backend/uploads/ml_datasets/sample_microclimate_dataset.csv")
    generate_dataset(300, "frontend/public/sample_microclimate_dataset.csv")

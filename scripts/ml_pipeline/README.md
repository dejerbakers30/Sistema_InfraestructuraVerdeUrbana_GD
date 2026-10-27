# Datos reales de LST de Trujillo y metamodelos del GD-IVU

Esta carpeta reproduce los resultados del artículo *"Gemelo digital de infraestructura verde urbana: metamodelos de aprendizaje automático de la temperatura de superficie entrenados con datos satelitales en Trujillo, Perú"*.

## Contenido

| Ruta | Qué es |
|---|---|
| `scripts/earth_engine/export_dataset_LST_Trujillo.js` | Script de Google Earth Engine que genera el CSV (Landsat 8-9, Sentinel-2, ESA WorldCover, SRTM, ERA5-Land). |
| `data/dataset_real_LST_Trujillo.csv` | CSV exportado de Earth Engine (datos crudos, 29 escenas 2023–2025). |
| `data/clean.csv` | Dataset intermedio filtrado sin agua ni valores fuera de rango. |
| `data/final.csv` | Dataset final con control de calidad (15.862 filas, 23 fechas, 728 puntos). |
| `scripts/ml_pipeline/clean.py` | Elimina agua y valores fuera de rango; crea bloques espaciales de 500 m. |
| `scripts/ml_pipeline/qc.py` | Control de calidad: escenas con nubes/niebla, escenas con poca cobertura y píxeles atípicos. |
| `scripts/ml_pipeline/train.py` | Ajuste de hiperparámetros (Optuna), validación espacial y por escenas de los 5 metamodelos, latencia e importancia de variables. |
| `scripts/ml_pipeline/cnnlstm.py` | Arquitectura CNN-LSTM en TensorFlow/Keras para inferencia espaciotemporal. |
| `scripts/ml_pipeline/stats_figs.py` | Friedman, Wilcoxon-Holm, Nemenyi y generación de las figuras 2–7 del artículo. |
| `scripts/ml_pipeline/random_cv.py` | Compara validación aleatoria y espacial (usado en la Discusión). |
| `backend/app/data/real_results/` | Resultados calculados (JSON, CSV de predicciones y figuras PNG de alta resolución). |

## Cómo reproducir el pipeline completo

Desde la raíz del repositorio:

```bash
pip install -r scripts/ml_pipeline/requirements.txt
python scripts/ml_pipeline/clean.py
python scripts/ml_pipeline/qc.py
python scripts/ml_pipeline/train.py        # ~45 min en 2 vCPU
python scripts/ml_pipeline/stats_figs.py
python scripts/ml_pipeline/random_cv.py    # comparación validación aleatoria vs. espacial (Discusión)
```

Semilla aleatoria: 42 en todos los pasos.

## Licencias

- Código: MIT (ver `LICENSE`).
- Datos derivados: CC BY 4.0. Fuentes: Landsat (USGS, dominio público), Sentinel-2 y ERA5-Land (Copernicus), ESA WorldCover (CC BY 4.0), SRTM (dominio público).

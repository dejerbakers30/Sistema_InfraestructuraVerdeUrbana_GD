# Datos reales de LST de Trujillo y metamodelos del GD-IVU

Esta carpeta reproduce los resultados del artículo *"Gemelo digital de infraestructura verde urbana: metamodelos de aprendizaje automático de la temperatura de superficie entrenados con datos satelitales en Trujillo, Perú"*.

## Contenido

| Ruta | Qué es |
|---|---|
| `earth_engine/export_dataset_LST_Trujillo.js` | Script de Google Earth Engine que genera el CSV (Landsat 8-9, Sentinel-2, ESA WorldCover, SRTM, ERA5-Land). |
| `data/dataset_real_LST_Trujillo.csv` | CSV exportado de Earth Engine (datos crudos, 29 escenas 2023–2025). |
| `scripts/clean.py` | Elimina agua y valores fuera de rango; crea bloques espaciales de 500 m. |
| `scripts/qc.py` | Control de calidad: escenas con nubes/niebla, escenas con poca cobertura y píxeles atípicos. |
| `scripts/train.py` | Ajuste de hiperparámetros (Optuna), validación espacial y por escenas de los 5 metamodelos, latencia e importancia de variables. |
| `scripts/cnnlstm.py` | Arquitectura CNN-LSTM (misma que `backend/app/services/ml_engine.py`) en TensorFlow/Keras. |
| `scripts/stats_figs.py` | Friedman, Wilcoxon-Holm, Nemenyi y las figuras 2–7 del artículo. |
| `scripts/random_cv.py` | Compara validación aleatoria y espacial (usado en la Discusión). |
| `out/` | Resultados (JSON, CSV de predicciones y figuras PNG). |

## Cómo reproducir

```bash
pip install -r requirements.txt
python scripts/clean.py
python scripts/qc.py
python scripts/train.py        # ~45 min en 2 vCPU
python scripts/stats_figs.py
python scripts/random_cv.py    # comparación validación aleatoria vs. espacial (Discusión)
```

Semilla aleatoria: 42 en todos los pasos.

## Licencias

- Código: MIT (ver `LICENSE`).
- Datos derivados: CC BY 4.0. Fuentes: Landsat (USGS, dominio público), Sentinel-2 y ERA5-Land (Copernicus), ESA WorldCover (CC BY 4.0), SRTM (dominio público).

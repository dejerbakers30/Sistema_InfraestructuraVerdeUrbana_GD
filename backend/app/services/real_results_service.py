"""
Service for loading, caching, and serving empirical real results from
the LST research dataset (Trujillo, Peru) located in `backend/app/data/real_results`.
"""

import os
import json
import logging
from typing import Dict, Any, Optional
from pathlib import Path
import pandas as pd

from app.core.config import settings

logger = logging.getLogger(__name__)

ALLOWED_FIGURES = {
    "fig2_obs_pred.png": "fig2_obs_pred.png",
    "fig2.png": "fig2_obs_pred.png",
    "fig2": "fig2_obs_pred.png",
    "fig3_residuos.png": "fig3_residuos.png",
    "fig3.png": "fig3_residuos.png",
    "fig3": "fig3_residuos.png",
    "fig4_cd.png": "fig4_cd.png",
    "fig4.png": "fig4_cd.png",
    "fig4": "fig4_cd.png",
    "fig5_boxplot.png": "fig5_boxplot.png",
    "fig5.png": "fig5_boxplot.png",
    "fig5": "fig5_boxplot.png",
    "fig6_multicriterio.png": "fig6_multicriterio.png",
    "fig6.png": "fig6_multicriterio.png",
    "fig6": "fig6_multicriterio.png",
    "fig7_importancia.png": "fig7_importancia.png",
    "fig7.png": "fig7_importancia.png",
    "fig7": "fig7_importancia.png",
}


class RealResultsService:
    def __init__(self):
        self._cache: Optional[Dict[str, Any]] = None
        self._cache_mtime: float = 0.0

    def get_real_data_dir(self) -> str:
        """Resolves the real data / results directory path with fallbacks."""
        configured_path = settings.REAL_DATA_DIR
        candidates = [
            configured_path,
            os.path.abspath(configured_path),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "real_results")),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "backend", "app", "data", "real_results")),
            os.path.abspath(os.path.join(os.getcwd(), "backend", "app", "data", "real_results")),
            os.path.abspath(os.path.join(os.getcwd(), "data")),
            "/app/backend/app/data/real_results",
            "/app/data"
        ]
        for c in candidates:
            if c and os.path.exists(c) and os.path.isdir(c):
                return c
        return configured_path

    def get_out_dir(self) -> str:
        """Returns the directory containing computed JSONs and figures."""
        data_dir = self.get_real_data_dir()
        if os.path.exists(os.path.join(data_dir, "resultados.json")):
            return data_dir
        if os.path.exists(os.path.join(data_dir, "out", "resultados.json")):
            return os.path.join(data_dir, "out")
        # Direct check for backend/app/data/real_results
        modular_results = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "real_results"))
        if os.path.exists(modular_results):
            return modular_results
        return data_dir

    def _should_reload_cache(self, out_dir: str) -> bool:
        if self._cache is None:
            return True
        resultados_path = os.path.join(out_dir, "resultados.json")
        if os.path.exists(resultados_path):
            mtime = os.path.getmtime(resultados_path)
            if mtime > self._cache_mtime:
                return True
        return False

    def load_all_results(self, force_reload: bool = False) -> Dict[str, Any]:
        """Loads all output JSON and CSV files with caching."""
        out_dir = self.get_out_dir()

        if not force_reload and not self._should_reload_cache(out_dir):
            return self._cache or {}

        logger.info(f"Loading real research results from {out_dir}")

        resultados_file = os.path.join(out_dir, "resultados.json")
        estadistica_file = os.path.join(out_dir, "estadistica.json")
        clean_log_file = os.path.join(out_dir, "clean_log.json")
        hiperparametros_file = os.path.join(out_dir, "hiperparametros.json")
        random_vs_spatial_file = os.path.join(out_dir, "random_vs_spatial.json")
        descriptivos_file = os.path.join(out_dir, "descriptivos.csv")

        resultados = {}
        if os.path.exists(resultados_file):
            try:
                with open(resultados_file, "r", encoding="utf-8") as f:
                    resultados = json.load(f)
                self._cache_mtime = os.path.getmtime(resultados_file)
            except Exception as e:
                logger.error(f"Error loading {resultados_file}: {e}")

        estadistica = {}
        if os.path.exists(estadistica_file):
            try:
                with open(estadistica_file, "r", encoding="utf-8") as f:
                    estadistica = json.load(f)
            except Exception as e:
                logger.error(f"Error loading {estadistica_file}: {e}")

        clean_log = {}
        if os.path.exists(clean_log_file):
            try:
                with open(clean_log_file, "r", encoding="utf-8") as f:
                    clean_log = json.load(f)
            except Exception as e:
                logger.error(f"Error loading {clean_log_file}: {e}")

        hiperparametros = {}
        if os.path.exists(hiperparametros_file):
            try:
                with open(hiperparametros_file, "r", encoding="utf-8") as f:
                    hiperparametros = json.load(f)
            except Exception as e:
                logger.error(f"Error loading {hiperparametros_file}: {e}")

        random_vs_spatial = {}
        if os.path.exists(random_vs_spatial_file):
            try:
                with open(random_vs_spatial_file, "r", encoding="utf-8") as f:
                    random_vs_spatial = json.load(f)
            except Exception as e:
                logger.error(f"Error loading {random_vs_spatial_file}: {e}")

        descriptivos = []
        if os.path.exists(descriptivos_file):
            try:
                df_desc = pd.read_csv(descriptivos_file, index_col=0)
                descriptivos = df_desc.round(4).reset_index().to_dict(orient="records")
            except Exception as e:
                logger.error(f"Error loading {descriptivos_file}: {e}")

        # Structured summary for fast API frontend consumption
        spatial_metrics = resultados.get("espacial", {})
        temporal_metrics = resultados.get("temporal", {})
        latencies = resultados.get("latencia_ms_100", {})
        importances = resultados.get("importancia", {})
        importances_sd = resultados.get("importancia_sd", {})
        importances_pct = estadistica.get("importancia_pct", {})
        stat_espacial = estadistica.get("espacial", {})
        stat_temporal = estadistica.get("temporal", {})

        payload: Dict[str, Any] = {
            "source": "LST Trujillo Dataset (Landsat 8-9, Sentinel-2, ERA5-Land, WorldCover, SRTM)",
            "city": "Trujillo, Perú",
            "period": "2023–2025",
            "target": "lst",
            "target_label": "Temperatura de superficie LST (°C)",
            "features": resultados.get("features", [
                "ndvi", "ndbi", "albedo", "veg_frac", "built_frac", "elevation", "t2m", "rh", "wind", "ssrd"
            ]),
            "backend_cnn": resultados.get("backend_cnn", "tensorflow-keras"),
            "hardware": resultados.get("hardware", ""),
            "clean_log": clean_log,
            "descriptivos": descriptivos,
            "metricas": {
                "espacial": spatial_metrics,
                "temporal": temporal_metrics,
                "nota_temporal": "Con fechas no vistas (validación temporal por escenas) el modelo tiene R² < 0 debido al sesgo estacional no representable sin historia temporal completa en el punto."
            },
            "latencia_ms_100": latencies,
            "estadistica": {
                "friedman_chi2": stat_espacial.get("friedman_chi2"),
                "friedman_p": stat_espacial.get("friedman_p"),
                "CD_nemenyi": stat_espacial.get("CD"),
                "rangos_espacial": stat_espacial.get("rangos", {}),
                "wilcoxon_holm": stat_espacial.get("wilcoxon_holm", []),
                "calor_extremo": estadistica.get("calor", {}),
                "residuos": estadistica.get("residuos", {}),
                "iqr_por_fecha": estadistica.get("iqr_por_fecha", {})
            },
            "importancia_variables": {
                "valores_brutos": importances,
                "desviacion_estandar": importances_sd,
                "porcentajes": importances_pct
            },
            "hiperparametros": hiperparametros,
            "random_vs_spatial": random_vs_spatial,
            "figuras_disponibles": [
                "fig2_obs_pred.png",
                "fig3_residuos.png",
                "fig4_cd.png",
                "fig5_boxplot.png",
                "fig6_multicriterio.png",
                "fig7_importancia.png"
            ]
        }

        self._cache = payload
        return payload

    def get_figure_path(self, figure_name: str) -> Optional[str]:
        """
        Validates figure name against whitelist and returns absolute path if exists.
        Prevents path traversal.
        """
        cleaned_name = os.path.basename(figure_name).lower()
        target_filename = ALLOWED_FIGURES.get(cleaned_name)
        if not target_filename:
            return None

        out_dir = self.get_out_dir()
        file_path = os.path.join(out_dir, target_filename)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return file_path
        return None


real_results_service = RealResultsService()

"""
Statistical Signficance & Robustness Testing Service for ML Models.
Executes:
1. Friedman Test (Global non-parametric difference test)
2. Wilcoxon Signed-Rank Test (Pairwise post-hoc comparison)
3. Nemenyi Post-Hoc Test (Average ranks & Critical Difference CD diagram)
"""

import numpy as np
import scipy.stats as stats
from typing import Dict, List, Any, Tuple


class StatisticalTesterService:
    """
    Executes rigorous statistical tests (Friedman, Wilcoxon, Nemenyi) across trained models.
    """

    @staticmethod
    def run_tests(
        y_true: List[float],
        models_preds: Dict[str, List[float]]
    ) -> Dict[str, Any]:
        """
        Runs Friedman, Wilcoxon, and Nemenyi tests on model prediction absolute errors.
        """
        y_arr = np.array(y_true)
        model_names = list(models_preds.keys())
        k = len(model_names)  # 5 models
        n = len(y_arr)        # Number of samples

        if n < 5:
            # Fallback for tiny test sets
            return {
                "friedman_statistic": 0.0,
                "friedman_p_value": 1.0,
                "friedman_significant": False,
                "wilcoxon_results": {},
                "nemenyi_results": {
                    "average_ranks": {m: i + 1 for i, m in enumerate(model_names)},
                    "critical_difference": 0.0,
                    "model_names": model_names
                },
                "winning_model_name": model_names[0],
                "conclusion_text": "Muestra de prueba muy pequeña para significancia estadística."
            }

        # Calculate Absolute Errors for each model: |y_true - y_pred|
        abs_errors = {}
        for name in model_names:
            preds = np.array(models_preds[name])
            if len(preds) != n:
                # Match lengths if needed
                min_len = min(n, len(preds))
                y_arr = y_arr[:min_len]
                preds = preds[:min_len]
            abs_errors[name] = np.abs(y_arr - preds)

        # Prepare error matrix for scipy (shape: n_samples x k_models)
        error_matrix = np.column_stack([abs_errors[name] for name in model_names])

        # 1. Friedman Test
        friedman_stat, friedman_p = stats.friedmanchisquare(*[error_matrix[:, i] for i in range(k)])
        friedman_significant = bool(friedman_p < 0.05)

        # Calculate Average Ranks per sample across models
        # Rank 1 = smallest error (best performance)
        sample_ranks = np.zeros_like(error_matrix)
        for i in range(len(error_matrix)):
            # stats.rankdata assigns rank 1 to lowest value
            sample_ranks[i, :] = stats.rankdata(error_matrix[i, :])

        mean_ranks = np.mean(sample_ranks, axis=0)
        avg_ranks_dict = {model_names[i]: round(float(mean_ranks[i]), 4) for i in range(k)}

        # Find best model (model with lowest average rank)
        best_model_idx = int(np.argmin(mean_ranks))
        best_model_name = model_names[best_model_idx]

        # 2. Wilcoxon Signed-Rank Test (Pairwise comparison between best model and all other models)
        wilcoxon_results = {}
        for i, name in enumerate(model_names):
            if name == best_model_name:
                continue
            diff = error_matrix[:, best_model_idx] - error_matrix[:, i]
            # Handle zero differences
            non_zero_diff = diff[diff != 0]
            if len(non_zero_diff) > 0:
                stat, p_val = stats.wilcoxon(non_zero_diff)
                wilcoxon_results[f"{best_model_name}_vs_{name}"] = {
                    "statistic": round(float(stat), 4),
                    "p_value": round(float(p_val), 6),
                    "significant": bool(p_val < 0.05)
                }
            else:
                wilcoxon_results[f"{best_model_name}_vs_{name}"] = {
                    "statistic": 0.0,
                    "p_value": 1.0,
                    "significant": False
                }

        # 3. Nemenyi Post-Hoc Test & Critical Difference (CD)
        # Formula for Critical Difference at alpha = 0.05:
        # CD = q_alpha * sqrt(k * (k + 1) / (6 * N))
        # For k=5 models at alpha=0.05, q_alpha approx = 2.728
        q_alpha = 2.728
        cd_value = float(q_alpha * np.sqrt((k * (k + 1)) / (6.0 * max(n, 1))))

        nemenyi_results = {
            "average_ranks": avg_ranks_dict,
            "critical_difference": round(cd_value, 4),
            "model_names": model_names,
            "alpha": 0.05
        }

        # Generate Conclusion Text
        sig_text = "existen diferencias estadísticamente significativas" if friedman_significant else "no se detectaron diferencias estadísticamente significativas"
        conclusion = (
            f"Basado en la prueba global de Friedman (F={friedman_stat:.2f}, p={friedman_p:.4e}), {sig_text} "
            f"entre el rendimiento de los {k} modelos evaluados. El modelo seleccionado como ganador es '{best_model_name}' "
            f"al obtener el menor rango promedio de error ({avg_ranks_dict[best_model_name]:.2f}) y un valor de Diferencia Crítica (CD) "
            f"Nemenyi de {cd_value:.4f} a un nivel de significancia del 95%."
        )

        return {
            "friedman_statistic": round(float(friedman_stat), 4),
            "friedman_p_value": round(float(friedman_p), 6),
            "friedman_significant": friedman_significant,
            "wilcoxon_results": wilcoxon_results,
            "nemenyi_results": nemenyi_results,
            "winning_model_name": best_model_name,
            "conclusion_text": conclusion
        }


statistical_tester_service = StatisticalTesterService()

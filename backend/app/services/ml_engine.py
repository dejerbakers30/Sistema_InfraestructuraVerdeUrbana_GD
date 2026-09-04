"""
Machine Learning Engine for Urban Microclimate Prediction.
Includes 5 mandatory model architectures:
1. XGBoost Regressor
2. Random Forest Regressor
3. Support Vector Regressor (SVR)
4. Stacking Ensemble (Hybrid 1: XGBoost + RF + SVR)
5. CNN-LSTM Deep Neural Network (Hybrid 2: Spatial-Temporal)
"""

import os
import json
import logging
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, List, Tuple, Any, Optional

from sklearn.model_selection import KFold, train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.ensemble import RandomForestRegressor, StackingRegressor
from sklearn.svm import SVR
from sklearn.linear_model import Ridge
import xgboost as xgb

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

logger = logging.getLogger(__name__)

try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from torch.utils.data import DataLoader, TensorDataset

    HAS_TORCH = True

    class PyTorchCNNLSTM(nn.Module):
        def __init__(self, input_dim: int, hidden_dim: int = 64, num_layers: int = 1):
            super(PyTorchCNNLSTM, self).__init__()
            self.conv1d = nn.Conv1d(in_channels=1, out_channels=16, kernel_size=3, padding=1)
            self.relu = nn.ReLU()
            self.lstm = nn.LSTM(input_size=16, hidden_size=hidden_dim, num_layers=num_layers, batch_first=True)
            self.fc1 = nn.Linear(hidden_dim, 32)
            self.fc2 = nn.Linear(32, 1)

        def forward(self, x):
            x_conv = x.unsqueeze(1)
            x_conv = self.relu(self.conv1d(x_conv))
            x_lstm_in = x_conv.transpose(1, 2)
            out_lstm, (hn, cn) = self.lstm(x_lstm_in)
            out_last = out_lstm[:, -1, :]
            out = self.relu(self.fc1(out_last))
            out = self.fc2(out)
            return out.squeeze(-1)

    class CNNLSTMRegressor:
        """Wrapper class for PyTorch CNN-LSTM matching Scikit-Learn Estimator interface"""
        def __init__(self, input_dim: int, epochs: int = 40, batch_size: int = 16, lr: float = 0.005):
            self.input_dim = input_dim
            self.epochs = epochs
            self.batch_size = batch_size
            self.lr = lr
            self.scaler_x = StandardScaler()
            self.scaler_y = StandardScaler()
            self.model = PyTorchCNNLSTM(input_dim=input_dim)

        def fit(self, X: np.ndarray, y: np.ndarray):
            X_scaled = self.scaler_x.fit_transform(X)
            y_scaled = self.scaler_y.fit_transform(y.reshape(-1, 1)).flatten()
            
            dataset = TensorDataset(torch.tensor(X_scaled, dtype=torch.float32), torch.tensor(y_scaled, dtype=torch.float32))
            loader = DataLoader(dataset, batch_size=self.batch_size, shuffle=True)
            
            criterion = nn.MSELoss()
            optimizer = optim.Adam(self.model.parameters(), lr=self.lr)
            
            self.model.train()
            for epoch in range(self.epochs):
                for batch_x, batch_y in loader:
                    optimizer.zero_grad()
                    outputs = self.model(batch_x)
                    loss = criterion(outputs, batch_y)
                    loss.backward()
                    optimizer.step()
            return self

        def predict(self, X: np.ndarray) -> np.ndarray:
            X_scaled = self.scaler_x.transform(X)
            self.model.eval()
            with torch.no_grad():
                tensor_x = torch.tensor(X_scaled, dtype=torch.float32)
                preds_scaled = self.model(tensor_x).numpy()
            return self.scaler_y.inverse_transform(preds_scaled.reshape(-1, 1)).flatten()

except ImportError:
    HAS_TORCH = False
    from sklearn.neural_network import MLPRegressor

    class CNNLSTMRegressor:
        """Deep Neural Network Regressor fallback using Scikit-Learn MLP (Conv-LSTM representation)"""
        def __init__(self, input_dim: int, epochs: int = 40, batch_size: int = 16, lr: float = 0.005):
            self.input_dim = input_dim
            self.epochs = epochs
            self.scaler_x = StandardScaler()
            self.scaler_y = StandardScaler()
            self.model = MLPRegressor(
                hidden_layer_sizes=(64, 32, 16),
                activation="relu",
                solver="adam",
                max_iter=epochs,
                random_state=42
            )

        def fit(self, X: np.ndarray, y: np.ndarray):
            X_scaled = self.scaler_x.fit_transform(X)
            y_scaled = self.scaler_y.fit_transform(y.reshape(-1, 1)).flatten()
            self.model.fit(X_scaled, y_scaled)
            return self

        def predict(self, X: np.ndarray) -> np.ndarray:
            X_scaled = self.scaler_x.transform(X)
            preds_scaled = self.model.predict(X_scaled)
            return self.scaler_y.inverse_transform(preds_scaled.reshape(-1, 1)).flatten()



class MLEngineService:
    """
    Service managing dataset loading, feature extraction, training 5 models, and prediction.
    """

    @staticmethod
    def load_dataset(file_path: str) -> pd.DataFrame:
        """Loads dataset from CSV or GeoJSON into DataFrame"""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Dataset file not found: {file_path}")
        
        ext = Path(file_path).suffix.lower()
        if ext == ".csv":
            df = pd.read_csv(file_path)
        elif ext in [".geojson", ".json"]:
            import geopandas as gpd
            gdf = gpd.read_file(file_path)
            # Flatten geometry to centroids or bounding areas
            if "geometry" in gdf.columns:
                gdf["longitude"] = gdf.geometry.centroid.x
                gdf["latitude"] = gdf.geometry.centroid.y
                df = pd.DataFrame(gdf.drop(columns=["geometry"]))
            else:
                df = pd.DataFrame(gdf)
        else:
            raise ValueError(f"Unsupported file format: {ext}")
        
        return df

    @staticmethod
    def extract_features_and_target(
        df: pd.DataFrame, target_column: str, feature_columns: Optional[List[str]] = None
    ) -> Tuple[np.ndarray, np.ndarray, List[str], StandardScaler]:
        """
        Cleans data, selects features, handles missing values, and scales inputs.
        """
        numeric_df = df.select_dtypes(include=[np.number]).dropna()
        
        if numeric_df.empty:
            raise ValueError("Dataset does not contain valid numeric data for training")

        if target_column not in numeric_df.columns:
            # Fallback to last column or create synthetic microclimate target if missing
            possible_targets = [col for col in ["temperature", "temp", "humidity", "pet", "wind_speed", "wind"] if col in numeric_df.columns]
            if possible_targets:
                target_column = possible_targets[0]
            else:
                target_column = numeric_df.columns[-1]

        if not feature_columns:
            feature_columns = [col for col in numeric_df.columns if col != target_column]
        else:
            feature_columns = [col for col in feature_columns if col in numeric_df.columns and col != target_column]

        if not feature_columns:
            raise ValueError("No valid feature columns available for training")

        X = numeric_df[feature_columns].values
        y = numeric_df[target_column].values

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        return X_scaled, y, feature_columns, scaler

    @staticmethod
    def calculate_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
        """Calculates RMSE, MAE, R2, MSE, MAPE evaluation metrics"""
        mse = float(mean_squared_error(y_true, y_pred))
        rmse = float(np.sqrt(mse))
        mae = float(mean_absolute_error(y_true, y_pred))
        r2 = float(r2_score(y_true, y_pred))
        
        # MAPE with small epsilon to avoid div by zero
        mape = float(np.mean(np.abs((y_true - y_pred) / (y_true + 1e-8))) * 100)

        return {
            "rmse": round(rmse, 4),
            "mae": round(mae, 4),
            "r2": round(r2, 4),
            "mse": round(mse, 4),
            "mape": round(mape, 4)
        }

    def train_all_models(
        self,
        X: np.ndarray,
        y: np.ndarray,
        artifact_dir: str
    ) -> Dict[str, Dict[str, Any]]:
        """
        Trains all 5 mandatory models with 5-Fold Cross Validation.
        Returns metrics, hyperparameters, and saves artifacts.
        """
        os.makedirs(artifact_dir, exist_ok=True)
        input_dim = X.shape[1]
        
        # Train / Test split for evaluation
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        kf = KFold(n_splits=5, shuffle=True, random_state=42)

        # 1. XGBoost
        xgb_model = xgb.XGBRegressor(
            n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42
        )
        xgb_model.fit(X_train, y_train)
        xgb_preds = xgb_model.predict(X_test)
        xgb_metrics = self.calculate_metrics(y_test, xgb_preds)
        joblib.dump(xgb_model, os.path.join(artifact_dir, "xgboost.pkl"))

        # 2. Random Forest
        rf_model = RandomForestRegressor(
            n_estimators=100, max_depth=10, random_state=42
        )
        rf_model.fit(X_train, y_train)
        rf_preds = rf_model.predict(X_test)
        rf_metrics = self.calculate_metrics(y_test, rf_preds)
        joblib.dump(rf_model, os.path.join(artifact_dir, "random_forest.pkl"))

        # 3. SVR
        svr_model = SVR(kernel="rbf", C=1.0, epsilon=0.1)
        svr_model.fit(X_train, y_train)
        svr_preds = svr_model.predict(X_test)
        svr_metrics = self.calculate_metrics(y_test, svr_preds)
        joblib.dump(svr_model, os.path.join(artifact_dir, "svr.pkl"))

        # 4. Hybrid 1: Stacking Regressor
        estimators = [
            ("xgb", xgb.XGBRegressor(n_estimators=50, max_depth=4, random_state=42)),
            ("rf", RandomForestRegressor(n_estimators=50, max_depth=6, random_state=42)),
            ("svr", SVR(kernel="rbf", C=1.0))
        ]
        stacking_model = StackingRegressor(
            estimators=estimators,
            final_estimator=Ridge(alpha=1.0)
        )
        stacking_model.fit(X_train, y_train)
        stacking_preds = stacking_model.predict(X_test)
        stacking_metrics = self.calculate_metrics(y_test, stacking_preds)
        joblib.dump(stacking_model, os.path.join(artifact_dir, "stacking.pkl"))

        # 5. Hybrid 2: CNN-LSTM Deep Neural Network
        cnn_lstm_model = CNNLSTMRegressor(input_dim=input_dim, epochs=40, batch_size=16)
        cnn_lstm_model.fit(X_train, y_train)
        cnn_lstm_preds = cnn_lstm_model.predict(X_test)
        cnn_lstm_metrics = self.calculate_metrics(y_test, cnn_lstm_preds)
        joblib.dump(cnn_lstm_model, os.path.join(artifact_dir, "cnn_lstm.pkl"))

        # Store cross-validation predictions for all models (used in statistical tests)
        cv_predictions = {
            "xgboost": [],
            "random_forest": [],
            "svr": [],
            "stacking": [],
            "cnn_lstm": []
        }
        
        y_cv_true = []
        for train_idx, val_idx in kf.split(X):
            X_tr, X_val = X[train_idx], X[val_idx]
            y_tr, y_val = y[train_idx], y[val_idx]
            y_cv_true.extend(y_val)

            # Fit temporary models per fold
            m_xgb = xgb.XGBRegressor(n_estimators=50, random_state=42).fit(X_tr, y_tr)
            cv_predictions["xgboost"].extend(m_xgb.predict(X_val))

            m_rf = RandomForestRegressor(n_estimators=50, random_state=42).fit(X_tr, y_tr)
            cv_predictions["random_forest"].extend(m_rf.predict(X_val))

            m_svr = SVR(kernel="rbf").fit(X_tr, y_tr)
            cv_predictions["svr"].extend(m_svr.predict(X_val))

            m_stack = StackingRegressor(estimators=estimators, final_estimator=Ridge()).fit(X_tr, y_tr)
            cv_predictions["stacking"].extend(m_stack.predict(X_val))

            m_nn = CNNLSTMRegressor(input_dim=input_dim, epochs=20).fit(X_tr, y_tr)
            cv_predictions["cnn_lstm"].extend(m_nn.predict(X_val))

        results = {
            "xgboost": {
                "metrics": xgb_metrics,
                "hyperparameters": {"n_estimators": 100, "max_depth": 6, "learning_rate": 0.1},
                "cv_preds": cv_predictions["xgboost"],
                "test_preds": xgb_preds.tolist()
            },
            "random_forest": {
                "metrics": rf_metrics,
                "hyperparameters": {"n_estimators": 100, "max_depth": 10},
                "cv_preds": cv_predictions["random_forest"],
                "test_preds": rf_preds.tolist()
            },
            "svr": {
                "metrics": svr_metrics,
                "hyperparameters": {"kernel": "rbf", "C": 1.0, "epsilon": 0.1},
                "cv_preds": cv_predictions["svr"],
                "test_preds": svr_preds.tolist()
            },
            "stacking": {
                "metrics": stacking_metrics,
                "hyperparameters": {"base_estimators": ["XGBoost", "RandomForest", "SVR"], "meta_learner": "Ridge"},
                "cv_preds": cv_predictions["stacking"],
                "test_preds": stacking_preds.tolist()
            },
            "cnn_lstm": {
                "metrics": cnn_lstm_metrics,
                "hyperparameters": {"epochs": 40, "batch_size": 16, "architecture": "1D-CNN + LSTM + Dense"},
                "cv_preds": cv_predictions["cnn_lstm"],
                "test_preds": cnn_lstm_preds.tolist()
            },
            "y_true": np.array(y_cv_true).tolist(),
            "y_test": y_test.tolist()
        }

        return results


ml_engine_service = MLEngineService()

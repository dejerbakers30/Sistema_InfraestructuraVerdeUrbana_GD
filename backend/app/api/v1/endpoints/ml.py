"""
API v1 Endpoints for Machine Learning Engine.
Datasets, Training Jobs, Model Comparison, Statistical Significance Tests, and Predictions.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional, Dict, Any
import os
import shutil
import uuid
from pathlib import Path

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User
from app.models.ml_models import (
    MLDataset, MLTrainingJob, MLModel, MLStatisticalTest, MLPrediction,
    MLJobStatus, MLModelType
)
from app.api.v1.endpoints.auth import get_current_user
from app.services.ml_engine import ml_engine_service
from app.services.statistical_tester import statistical_tester_service
from app.services.real_results_service import real_results_service

router = APIRouter()

# Directory for ML uploads and trained model artifacts
ML_UPLOAD_DIR = os.path.join(settings.UPLOAD_DIR, "ml_datasets")
ML_ARTIFACT_DIR = os.path.join(settings.UPLOAD_DIR, "ml_artifacts")
os.makedirs(ML_UPLOAD_DIR, exist_ok=True)
os.makedirs(ML_ARTIFACT_DIR, exist_ok=True)


async def run_training_background_task(
    job_id: str,
    dataset_path: str,
    target_variable: str,
    feature_columns: Optional[List[str]],
    db_url: str
):
    """
    Background worker function executing feature extraction, 5-model training, and statistical testing.
    """
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
    engine = create_async_engine(db_url)
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with session_factory() as db:
        try:
            # Fetch job
            job_uuid = uuid.UUID(job_id)
            result = await db.execute(select(MLTrainingJob).where(MLTrainingJob.id == job_uuid))
            job = result.scalar_one_or_none()
            if not job:
                return

            job.status = MLJobStatus.RUNNING
            job.progress = 10.0
            await db.commit()

            # Load dataset and extract features
            if not os.path.exists(dataset_path):
                candidates = [
                    os.path.join(ML_UPLOAD_DIR, os.path.basename(dataset_path)),
                    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "data", os.path.basename(dataset_path))),
                    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "data", "final.csv")),
                    os.path.abspath(os.path.join(os.getcwd(), "data", os.path.basename(dataset_path))),
                    os.path.abspath(os.path.join(os.getcwd(), "data", "final.csv")),
                    os.path.join(real_results_service.get_real_data_dir(), os.path.basename(dataset_path)),
                ]
                for c in candidates:
                    if os.path.exists(c) and os.path.isfile(c):
                        dataset_path = c
                        break
                if not os.path.exists(dataset_path):
                    raise FileNotFoundError(f"Dataset path no encontrado: {dataset_path}")

            df = ml_engine_service.load_dataset(dataset_path)
            groups = df['block'].values if 'block' in df.columns else None
            X, y, selected_features, scaler = ml_engine_service.extract_features_and_target(
                df, target_column=target_variable, feature_columns=feature_columns
            )
            print(f"Features seleccionadas para entrenamiento ({len(selected_features)}): {selected_features}")
            
            job.selected_features = selected_features
            job.progress = 25.0
            await db.commit()

            # Create model artifact sub-directory
            artifact_dir = os.path.join(ML_ARTIFACT_DIR, job_id)

            # Train all 5 models with rich publication telemetry
            job.progress = 40.0
            await db.commit()
            
            results = ml_engine_service.train_all_models(
                X, y, artifact_dir=artifact_dir, feature_names=selected_features, groups=groups
            )

            job.progress = 75.0
            await db.commit()

            # Save MLModel instances in database with comprehensive scientific metrics
            created_models = {}
            for m_type_str, m_data in results.items():
                if m_type_str in ["y_true", "y_test", "heatwave_threshold", "feature_names"]:
                    continue
                
                metrics_payload = {
                    **m_data["metrics"],
                    "fold_metrics": m_data.get("fold_metrics", []),
                    "fold_stats": m_data.get("fold_stats", {}),
                    "feature_importance": m_data.get("feature_importance", {}),
                    "residuals": m_data.get("residuals", {}),
                    "scatter": m_data.get("scatter", {}),
                    "heatwave_rmse": m_data.get("heatwave_rmse", 0.0),
                    "latency_ms": m_data.get("latency_ms", 0.0),
                    "train_time_ms": m_data.get("train_time_ms", 0.0)
                }

                model_obj = MLModel(
                    job_id=job.id,
                    model_type=MLModelType(m_type_str),
                    name=m_type_str.replace("_", " ").title(),
                    hyperparameters=m_data["hyperparameters"],
                    metrics=metrics_payload,
                    model_artifact_path=os.path.join(artifact_dir, f"{m_type_str}.pkl"),
                    is_active=False
                )
                db.add(model_obj)
                await db.flush()
                created_models[m_type_str] = model_obj

            # Execute Statistical Significance Tests (Friedman, Wilcoxon, Nemenyi CD)
            y_cv_true = results["y_true"]
            cv_preds_dict = {
                m_type: results[m_type]["cv_preds"]
                for m_type in ["xgboost", "random_forest", "svr", "stacking", "cnn_lstm"]
            }

            stats_res = statistical_tester_service.run_tests(y_cv_true, cv_preds_dict)

            winning_model_name = stats_res["winning_model_name"]
            winning_model_obj = created_models.get(winning_model_name)
            if winning_model_obj:
                winning_model_obj.is_active = True

            stat_test_obj = MLStatisticalTest(
                job_id=job.id,
                friedman_statistic=stats_res["friedman_statistic"],
                friedman_p_value=stats_res["friedman_p_value"],
                friedman_significant=stats_res["friedman_significant"],
                wilcoxon_results={
                    "pairs": stats_res["wilcoxon_results"],
                    "matrix": stats_res.get("wilcoxon_matrix", {})
                },
                nemenyi_results=stats_res["nemenyi_results"],
                winning_model_id=winning_model_obj.id if winning_model_obj else None,
                conclusion_text=stats_res["conclusion_text"]
            )
            db.add(stat_test_obj)

            job.status = MLJobStatus.COMPLETED
            job.progress = 100.0
            await db.commit()

        except Exception as e:
            await db.rollback()
            result = await db.execute(select(MLTrainingJob).where(MLTrainingJob.id == uuid.UUID(job_id)))
            err_job = result.scalar_one_or_none()
            if err_job:
                err_job.status = MLJobStatus.FAILED
                err_job.error_message = str(e)
                await db.commit()
        finally:
            await engine.dispose()


@router.post("/datasets/upload", response_model=Dict[str, Any])
async def upload_dataset(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Upload a CSV or GeoJSON dataset for ML model training and predictions.
    """
    try:
        filename = file.filename or "dataset.csv"
        ext = Path(filename).suffix.lower()
        if ext not in [".csv", ".geojson", ".json"]:
            raise HTTPException(status_code=400, detail="Solo se admiten archivos .csv y .geojson")

        saved_filename = f"{uuid.uuid4()}_{filename}"
        os.makedirs(ML_UPLOAD_DIR, exist_ok=True)
        saved_path = os.path.join(ML_UPLOAD_DIR, saved_filename)

        with open(saved_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Read dataset metadata
        df = ml_engine_service.load_dataset(saved_path)
        columns_list = df.columns.tolist()
        rows_count = len(df)

        user_id_str = current_user.get("user_id") if isinstance(current_user, dict) else getattr(current_user, "id", None)
        user_uuid = uuid.UUID(str(user_id_str)) if user_id_str else None
        user_email = (current_user.get("email") if isinstance(current_user, dict) else getattr(current_user, "email", None)) or "usuario"

        dataset_obj = MLDataset(
            name=name or filename,
            description=description or f"Dataset subido por {user_email}",
            filename=filename,
            file_path=saved_path,
            file_type="geojson" if ext in [".geojson", ".json"] else "csv",
            rows_count=rows_count,
            columns_list=columns_list,
            created_by=user_uuid
        )

        db.add(dataset_obj)
        await db.commit()
        await db.refresh(dataset_obj)

        return {
            "id": str(dataset_obj.id),
            "name": dataset_obj.name,
            "filename": dataset_obj.filename,
            "rows_count": dataset_obj.rows_count,
            "columns_list": dataset_obj.columns_list,
            "file_type": dataset_obj.file_type,
            "message": "Dataset subido correctamente"
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Error procesando dataset: {str(e)}")


@router.post("/datasets/seed-benchmark", response_model=Dict[str, Any])
async def seed_benchmark_dataset(
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Registra el dataset empírico real satelital y meteorológico de Trujillo (Landsat/Sentinel-2/ERA5-Land, 2023–2025)
    en la base de datos para pruebas y modelamiento reproducible.
    """
    benchmark_filename = "final.csv"
    
    # Candidate paths for data/final.csv
    candidates = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "data", "final.csv")),
        os.path.abspath(os.path.join(os.getcwd(), "data", "final.csv")),
        os.path.join(ML_UPLOAD_DIR, "final.csv"),
        "/app/data/final.csv"
    ]
    benchmark_path = None
    for c in candidates:
        if os.path.exists(c) and os.path.isfile(c):
            benchmark_path = c
            break

    if not benchmark_path:
        raise HTTPException(
            status_code=404,
            detail="El archivo 'data/final.csv' no existe en el sistema. Ejecute primero scripts/ml_pipeline/clean.py y qc.py para generarlo."
        )

    # Check if already in DB
    existing = await db.execute(select(MLDataset).where(MLDataset.filename == benchmark_filename))
    ds = existing.scalar_one_or_none()
    if ds:
        return {
            "id": str(ds.id),
            "name": ds.name,
            "filename": ds.filename,
            "rows_count": ds.rows_count,
            "columns_list": ds.columns_list,
            "file_type": ds.file_type,
            "message": "Dataset LST real Trujillo ya disponible en el sistema"
        }

    df = ml_engine_service.load_dataset(benchmark_path)
    user_id_str = current_user.get("user_id") if isinstance(current_user, dict) else getattr(current_user, "id", None)
    user_uuid = uuid.UUID(str(user_id_str)) if user_id_str else None

    dataset_obj = MLDataset(
        name="LST real Trujillo — Landsat/Sentinel-2/ERA5-Land (2023–2025)",
        description="Dataset empírico real multiespectral y meteorológico de Trujillo, Perú (15.862 registros tras control de calidad, 23 escenas satelitales, 728 puntos)",
        filename=benchmark_filename,
        file_path=benchmark_path,
        file_type="csv",
        rows_count=len(df),
        columns_list=df.columns.tolist(),
        created_by=user_uuid
    )
    db.add(dataset_obj)
    await db.commit()
    await db.refresh(dataset_obj)

    return {
        "id": str(dataset_obj.id),
        "name": dataset_obj.name,
        "filename": dataset_obj.filename,
        "rows_count": dataset_obj.rows_count,
        "columns_list": dataset_obj.columns_list,
        "file_type": dataset_obj.file_type,
        "message": "Dataset LST real Trujillo registrado exitosamente en el sistema"
    }


@router.get("/datasets", response_model=List[Dict[str, Any]])
async def list_datasets(
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Lists all uploaded datasets available for training"""
    stmt = select(MLDataset).order_by(MLDataset.created_at.desc())
    result = await db.execute(stmt)
    datasets = result.scalars().all()
    
    return [
        {
            "id": str(d.id),
            "name": d.name,
            "filename": d.filename,
            "rows_count": d.rows_count,
            "columns_list": d.columns_list,
            "file_type": d.file_type,
            "created_at": d.created_at.isoformat() if d.created_at else None
        }
        for d in datasets
    ]


@router.post("/train", response_model=Dict[str, Any])
async def start_training_job(
    dataset_id: str = Form(...),
    name: str = Form("Entrenamiento de 5 Modelos ML"),
    target_variable: str = Form("temperature"),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Launches asynchronous training of all 5 mandatory models (XGBoost, RF, SVR, Stacking, CNN-LSTM)
    and executes Friedman, Wilcoxon, and Nemenyi statistical tests.
    """
    dataset_uuid = uuid.UUID(dataset_id)
    result = await db.execute(select(MLDataset).where(MLDataset.id == dataset_uuid))
    dataset = result.scalar_one_or_none()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    user_id_str = current_user.get("user_id") if isinstance(current_user, dict) else getattr(current_user, "id", None)
    user_uuid = uuid.UUID(str(user_id_str)) if user_id_str else None

    job = MLTrainingJob(
        dataset_id=dataset.id,
        name=name,
        target_variable=target_variable,
        status=MLJobStatus.QUEUED,
        progress=0.0,
        created_by=user_uuid
    )

    db.add(job)
    await db.commit()
    await db.refresh(job)

    # Trigger background training worker
    background_tasks.add_task(
        run_training_background_task,
        job_id=str(job.id),
        dataset_path=dataset.file_path,
        target_variable=target_variable,
        feature_columns=None,
        db_url=settings.DATABASE_URL
    )

    return {
        "job_id": str(job.id),
        "name": job.name,
        "status": job.status,
        "progress": job.progress,
        "message": "Entrenamiento de 5 modelos de ML iniciado en segundo plano"
    }


@router.get("/jobs/{job_id}", response_model=Dict[str, Any])
async def get_job_status(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get real-time training progress and status of an ML job"""
    job_uuid = uuid.UUID(job_id)
    stmt = select(MLTrainingJob).where(MLTrainingJob.id == job_uuid)
    result = await db.execute(stmt)
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "job_id": str(job.id),
        "name": job.name,
        "status": job.status,
        "progress": job.progress,
        "target_variable": job.target_variable,
        "error_message": job.error_message,
        "created_at": job.created_at.isoformat() if job.created_at else None
    }


@router.get("/jobs/{job_id}/results", response_model=Dict[str, Any])
async def get_job_results(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Returns full metrics comparison for the 5 trained models and statistical test results.
    """
    job_uuid = uuid.UUID(job_id)
    stmt = select(MLTrainingJob).where(MLTrainingJob.id == job_uuid)
    res = await db.execute(stmt)
    job = res.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Fetch models
    m_stmt = select(MLModel).where(MLModel.job_id == job_uuid)
    m_res = await db.execute(m_stmt)
    models = m_res.scalars().all()

    # Fetch statistical test
    s_stmt = select(MLStatisticalTest).where(MLStatisticalTest.job_id == job_uuid)
    s_res = await db.execute(s_stmt)
    stat_test = s_res.scalar_one_or_none()

    models_data = [
        {
            "id": str(m.id),
            "model_type": m.model_type,
            "name": m.name,
            "hyperparameters": m.hyperparameters,
            "metrics": m.metrics,
            "is_active": m.is_active
        }
        for m in models
    ]

    stat_data = None
    if stat_test:
        stat_data = {
            "friedman_statistic": stat_test.friedman_statistic,
            "friedman_p_value": stat_test.friedman_p_value,
            "friedman_significant": stat_test.friedman_significant,
            "wilcoxon_results": stat_test.wilcoxon_results,
            "nemenyi_results": stat_test.nemenyi_results,
            "winning_model_id": str(stat_test.winning_model_id) if stat_test.winning_model_id else None,
            "conclusion_text": stat_test.conclusion_text
        }

    return {
        "job_id": str(job.id),
        "target_variable": job.target_variable,
        "models": models_data,
        "statistical_tests": stat_data
    }


@router.post("/models/{model_id}/activate", response_model=Dict[str, Any])
async def activate_model(
    model_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Activates a selected trained model for official predictions"""
    m_uuid = uuid.UUID(model_id)
    result = await db.execute(select(MLModel).where(MLModel.id == m_uuid))
    target_model = result.scalar_one_or_none()
    
    if not target_model:
        raise HTTPException(status_code=404, detail="Model not found")

    # Deactivate other models of the same job
    all_models = await db.execute(select(MLModel).where(MLModel.job_id == target_model.job_id))
    for m in all_models.scalars().all():
        m.is_active = (m.id == target_model.id)

    await db.commit()

    return {
        "model_id": str(target_model.id),
        "name": target_model.name,
        "is_active": True,
        "message": f"Modelo '{target_model.name}' activado oficialmente"
    }


@router.post("/predict", response_model=Dict[str, Any])
async def run_prediction(
    model_id: str = Form(...),
    dataset_id: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Generates microclimate predictions using an active trained model.
    Strictly uses the features with which the model was trained, returning 400/404 on missing inputs.
    """
    m_uuid = uuid.UUID(model_id)
    res_m = await db.execute(select(MLModel).where(MLModel.id == m_uuid))
    model_obj = res_m.scalar_one_or_none()
    
    if not model_obj:
        raise HTTPException(status_code=404, detail="Modelo no encontrado")

    # Load trained artifact
    if not os.path.exists(model_obj.model_artifact_path):
        raise HTTPException(status_code=404, detail="Archivo binario del modelo no encontrado en el servidor")

    if not dataset_id:
        raise HTTPException(status_code=400, detail="dataset_id es requerido para realizar predicciones")

    d_uuid = uuid.UUID(dataset_id)
    res_d = await db.execute(select(MLDataset).where(MLDataset.id == d_uuid))
    dataset_obj = res_d.scalar_one_or_none()
    if not dataset_obj:
        raise HTTPException(status_code=404, detail="Dataset no encontrado")

    if not os.path.exists(dataset_obj.file_path):
        raise HTTPException(status_code=404, detail=f"Archivo del dataset no encontrado en disco: {dataset_obj.file_path}")

    # Determine required features from features.json or model_obj.job.selected_features
    artifact_dir = os.path.dirname(model_obj.model_artifact_path)
    features_file = os.path.join(artifact_dir, "features.json")
    required_features = None
    if os.path.exists(features_file):
        try:
            import json
            with open(features_file, "r", encoding="utf-8") as f:
                required_features = json.load(f)
        except Exception:
            pass

    if not required_features and model_obj.job and model_obj.job.selected_features:
        required_features = model_obj.job.selected_features

    df = ml_engine_service.load_dataset(dataset_obj.file_path)

    if not required_features:
        standard_features = ["ndvi", "ndbi", "albedo", "veg_frac", "built_frac", "elevation", "t2m", "rh", "wind", "ssrd"]
        if all(col in df.columns for col in standard_features):
            required_features = standard_features
        else:
            raise HTTPException(status_code=400, detail="No se pudieron determinar las variables predictoras (features) exactas del modelo")

    # Validate presence of required features
    missing_cols = [c for c in required_features if c not in df.columns]
    if missing_cols:
        raise HTTPException(
            status_code=400,
            detail=f"El dataset no contiene las variables predictoras requeridas con las que se entrenó el modelo: {missing_cols}"
        )

    df_clean = df[required_features].dropna()
    if df_clean.empty:
        raise HTTPException(status_code=400, detail="El dataset no contiene registros válidos sin valores nulos para las variables requeridas")

    import joblib
    model_artifact = joblib.load(model_obj.model_artifact_path)
    X = df_clean.values
    preds = model_artifact.predict(X).tolist()

    prediction_obj = MLPrediction(
        model_id=model_obj.id,
        dataset_id=dataset_obj.id,
        target_variable=model_obj.job.target_variable if model_obj.job else "lst",
        predictions_data={"predictions": preds, "count": len(preds)},
        metrics_summary=model_obj.metrics
    )
    db.add(prediction_obj)
    await db.commit()

    return {
        "prediction_id": str(prediction_obj.id),
        "model_name": model_obj.name,
        "predictions_count": len(preds),
        "sample_predictions": preds[:10]
    }


@router.get("/real-results", response_model=Dict[str, Any])
async def get_real_results():
    """
    Returns empirical experimental results from the real satellite/climate LST dataset in Trujillo, Peru.
    Includes model metrics (spatial and temporal), latency, Friedman/Nemenyi/Wilcoxon tests,
    permutation feature importance, descriptives, and QC log.
    """
    return real_results_service.load_all_results()


@router.get("/real-results/figures/{name}")
async def get_real_figure(name: str):
    """
    Serves official publication figures (fig2 to fig7) generated during the empirical research.
    Validates figure name to prevent directory traversal.
    """
    file_path = real_results_service.get_figure_path(name)
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Figura '{name}' no encontrada o no autorizada")
    return FileResponse(file_path, media_type="image/png")


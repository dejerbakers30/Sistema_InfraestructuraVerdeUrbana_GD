"""
SQLAlchemy models for Machine Learning Engine, models, training jobs, statistical tests, and predictions.
"""

from sqlalchemy import Column, String, Float, DateTime, Text, ForeignKey, Boolean, JSON, Integer, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4
import enum

from app.core.database import Base


class MLJobStatus(str, enum.Enum):
    """Status for ML training jobs"""
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class MLModelType(str, enum.Enum):
    """Supported ML Model types"""
    XGBOOST = "xgboost"
    RANDOM_FOREST = "random_forest"
    SVR = "svr"
    STACKING = "stacking"
    CNN_LSTM = "cnn_lstm"


class MLDataset(Base):
    """
    Dataset uploaded by users (CSV or GeoJSON) for ML training and predictions.
    """
    __tablename__ = "ml_datasets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, index=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False, default="csv")  # csv | geojson
    rows_count = Column(Integer, default=0)
    columns_list = Column(JSON, default=list)  # List of column names
    extracted_features = Column(JSON, default=dict)  # Urban features extracted
    
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    jobs = relationship("MLTrainingJob", back_populates="dataset", cascade="all, delete-orphan")


class MLTrainingJob(Base):
    """
    Background ML training job training 5 models on a dataset.
    """
    __tablename__ = "ml_training_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, index=True)
    dataset_id = Column(UUID(as_uuid=True), ForeignKey("ml_datasets.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False)
    status = Column(SQLEnum(MLJobStatus), default=MLJobStatus.QUEUED, nullable=False, index=True)
    progress = Column(Float, default=0.0, nullable=False)  # 0.0 to 100.0
    target_variable = Column(String(100), nullable=False, default="temperature")  # temperature, humidity, pet, wind_speed
    selected_features = Column(JSON, default=list)
    
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)
    
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    dataset = relationship("MLDataset", back_populates="jobs")
    models = relationship("MLModel", back_populates="job", cascade="all, delete-orphan")
    statistical_tests = relationship("MLStatisticalTest", back_populates="job", cascade="all, delete-orphan", uselist=False)


class MLModel(Base):
    """
    Trained Machine Learning Model instance (XGBoost, RF, SVR, Stacking, CNN-LSTM).
    """
    __tablename__ = "ml_models"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, index=True)
    job_id = Column(UUID(as_uuid=True), ForeignKey("ml_training_jobs.id", ondelete="CASCADE"), nullable=False)
    model_type = Column(SQLEnum(MLModelType), nullable=False)
    name = Column(String(200), nullable=False)
    hyperparameters = Column(JSON, default=dict)
    metrics = Column(JSON, default=dict)  # {rmse, mae, r2, mse, mape, cv_scores}
    is_active = Column(Boolean, default=False)
    model_artifact_path = Column(String(500), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    job = relationship("MLTrainingJob", back_populates="models")
    predictions = relationship("MLPrediction", back_populates="model", cascade="all, delete-orphan")


class MLStatisticalTest(Base):
    """
    Results of statistical significance tests (Friedman, Wilcoxon, Nemenyi CD).
    """
    __tablename__ = "ml_statistical_tests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, index=True)
    job_id = Column(UUID(as_uuid=True), ForeignKey("ml_training_jobs.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    friedman_statistic = Column(Float, nullable=True)
    friedman_p_value = Column(Float, nullable=True)
    friedman_significant = Column(Boolean, default=False)
    
    wilcoxon_results = Column(JSON, default=dict)  # Pairwise p-values matrix
    nemenyi_results = Column(JSON, default=dict)   # Average ranks & CD value
    
    winning_model_id = Column(UUID(as_uuid=True), ForeignKey("ml_models.id", ondelete="SET NULL"), nullable=True)
    conclusion_text = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    job = relationship("MLTrainingJob", back_populates="statistical_tests")
    winning_model = relationship("MLModel")


class MLPrediction(Base):
    """
    Microclimate prediction generated by a trained ML model.
    """
    __tablename__ = "ml_predictions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, index=True)
    model_id = Column(UUID(as_uuid=True), ForeignKey("ml_models.id", ondelete="CASCADE"), nullable=False)
    dataset_id = Column(UUID(as_uuid=True), ForeignKey("ml_datasets.id", ondelete="SET NULL"), nullable=True)
    target_variable = Column(String(100), nullable=False)
    
    predictions_data = Column(JSON, default=list)  # Predicted values & points
    metrics_summary = Column(JSON, default=dict)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    model = relationship("MLModel", back_populates="predictions")

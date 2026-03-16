from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from beanie import Document
from pydantic import BaseModel, Field


class MLModelType(str, Enum):
    LSTM_PRICE = "lstm_price"
    LINEAR_REGRESSION = "linear_regression"
    SVM = "svm"
    RANDOM_FOREST = "random_forest"
    XGBOOST = "xgboost"
    TRANSFORMER = "transformer"
    ENSEMBLE = "ensemble"


class MLModelStatus(str, Enum):
    TRAINING = "training"
    TRAINED = "trained"
    DEPLOYED = "deployed"
    DEPRECATED = "deprecated"
    FAILED = "failed"


class PredictionSignal(str, Enum):
    STRONG_BUY = "strong_buy"
    BUY = "buy"
    HOLD = "hold"
    SELL = "sell"
    STRONG_SELL = "strong_sell"


class AccuracyMetrics(BaseModel):
    rmse: Optional[float] = None
    mae: Optional[float] = None
    mape: Optional[float] = None
    directional_accuracy: Optional[float] = None


class RiskAssessment(BaseModel):
    daily_return_mean: Optional[float] = None
    annual_return: Optional[float] = None
    volatility: Optional[float] = None
    sharpe_ratio: Optional[float] = None


class PricePrediction(BaseModel):
    date: str
    price: float


class MLModel(Document):
    name: str
    model_type: MLModelType
    status: MLModelStatus = MLModelStatus.TRAINING
    version: str = "1.0.0"
    security_id: Optional[str] = None
    accuracy_metrics: AccuracyMetrics = Field(default_factory=AccuracyMetrics)
    trained_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "ml_models"
        indexes = ["model_type", "status", "security_id"]


class MLPrediction(Document):
    model_id: str
    security_id: str
    symbol: str
    predicted_prices: list[PricePrediction] = []
    confidence: float = 0.0
    signal: PredictionSignal = PredictionSignal.HOLD
    risk_assessment: RiskAssessment = Field(default_factory=RiskAssessment)
    actual_prices: list[PricePrediction] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "ml_predictions"
        indexes = ["model_id", "security_id", "symbol"]

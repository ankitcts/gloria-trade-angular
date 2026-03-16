from typing import Annotated

from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.models.ml import MLPrediction
from app.models.user import User

router = APIRouter()


@router.get("")
async def list_predictions(
    _current_user: Annotated[User, Depends(get_current_user)],
):
    predictions = await MLPrediction.find_all().sort(-MLPrediction.created_at).limit(50).to_list()
    return [
        {
            "id": str(p.id),
            "model_id": p.model_id,
            "security_id": p.security_id,
            "symbol": p.symbol,
            "confidence": p.confidence,
            "signal": p.signal.value,
            "predicted_prices": [pp.model_dump() for pp in p.predicted_prices],
            "risk_assessment": p.risk_assessment.model_dump(),
            "created_at": p.created_at.isoformat(),
        }
        for p in predictions
    ]


@router.get("/{prediction_id}")
async def get_prediction(
    prediction_id: str,
    _current_user: Annotated[User, Depends(get_current_user)],
):
    from fastapi import HTTPException
    prediction = await MLPrediction.get(prediction_id)
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")

    return {
        "id": str(prediction.id),
        "model_id": prediction.model_id,
        "security_id": prediction.security_id,
        "symbol": prediction.symbol,
        "predicted_prices": [pp.model_dump() for pp in prediction.predicted_prices],
        "confidence": prediction.confidence,
        "signal": prediction.signal.value,
        "risk_assessment": prediction.risk_assessment.model_dump(),
        "actual_prices": [pp.model_dump() for pp in prediction.actual_prices],
        "created_at": prediction.created_at.isoformat(),
    }

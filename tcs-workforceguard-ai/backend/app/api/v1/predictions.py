from fastapi import APIRouter, Depends, Query
from typing import List
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.ml_service import MLService
from app.schemas.ml import (
    SinglePredictionRequest, SinglePredictionResponse, BatchPredictionItem
)

router = APIRouter()

@router.post("/single", response_model=SinglePredictionResponse)
def predict_single_employee(req: SinglePredictionRequest, db: Session = Depends(get_db)):
    """Computes attrition probability, local risk contributors, protective factors, and retention guidance."""
    return MLService.predict_single(req, db)

@router.get("/batch", response_model=List[BatchPredictionItem])
def get_batch_risk_assessment(limit: int = Query(default=50, ge=5, le=200), db: Session = Depends(get_db)):
    """Generates employee-level risk scores across active dataset."""
    return MLService.get_batch_predictions(db, limit=limit)

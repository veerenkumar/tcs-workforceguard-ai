from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.ml_service import MLService
from app.schemas.ml import ModelTrainRequest, ModelTrainResponse
from app.db.models import ModelMetadata

router = APIRouter()

@router.post("/train", response_model=ModelTrainResponse)
def train_models(req: ModelTrainRequest = ModelTrainRequest(), db: Session = Depends(get_db)):
    """Trains Logistic Regression baseline and Random Forest candidate, evaluating on holdout test set."""
    try:
        return MLService.train_models(
            db=db,
            test_size=req.test_size,
            random_state=req.random_state,
            exclude_demographics=req.exclude_demographics
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model training failed: {str(e)}")

@router.get("/active")
def get_active_model(db: Session = Depends(get_db)):
    active_rec = db.query(ModelMetadata).filter(ModelMetadata.is_active == True).order_by(ModelMetadata.id.desc()).first()
    if not active_rec:
        bundle = MLService.get_active_model()
        if bundle:
            return bundle.get("evaluation")
        raise HTTPException(status_code=404, detail="No active model trained yet.")
    return {
        "id": active_rec.id,
        "model_name": active_rec.model_name,
        "accuracy": active_rec.accuracy,
        "precision": active_rec.precision,
        "recall": active_rec.recall,
        "f1_score": active_rec.f1_score,
        "roc_auc": active_rec.roc_auc,
        "pr_auc": active_rec.pr_auc,
        "train_size": active_rec.train_size,
        "test_size": active_rec.test_size,
        "feature_importances": active_rec.feature_importances,
        "created_at": active_rec.created_at
    }

@router.get("/history")
def get_model_history(db: Session = Depends(get_db)):
    records = db.query(ModelMetadata).order_by(ModelMetadata.id.desc()).all()
    return records

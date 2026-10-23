from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.root_cause_service import RootCauseService

router = APIRouter()

@router.get("")
def get_root_cause_analysis(db: Session = Depends(get_db)):
    """Provides statistical driver analysis, relative risk metrics, and cohort vulnerability factors."""
    return RootCauseService.get_root_cause_analysis(db)

@router.get("/recommendations")
def get_retention_recommendations(db: Session = Depends(get_db)):
    rc = RootCauseService.get_root_cause_analysis(db)
    return rc.get("recommendation_cards", [])

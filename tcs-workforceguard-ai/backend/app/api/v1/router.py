from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.datasets import router as datasets_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.models import router as models_router
from app.api.v1.predictions import router as predictions_router
from app.api.v1.root_cause import router as root_cause_router
from app.api.v1.interventions import router as interventions_router
from app.api.v1.assistant import router as assistant_router
from app.api.v1.governance import router as governance_router

api_router = APIRouter()

api_router.include_router(health_router, tags=["Health"])
api_router.include_router(datasets_router, prefix="/datasets", tags=["Datasets"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(models_router, prefix="/models", tags=["Machine Learning"])
api_router.include_router(predictions_router, prefix="/predictions", tags=["Predictions"])
api_router.include_router(root_cause_router, prefix="/root-cause", tags=["Root Cause & Recommendations"])
api_router.include_router(interventions_router, prefix="/interventions", tags=["Interventions"])
api_router.include_router(assistant_router, prefix="/assistant", tags=["AI Assistant"])
api_router.include_router(governance_router, prefix="/governance", tags=["Governance"])

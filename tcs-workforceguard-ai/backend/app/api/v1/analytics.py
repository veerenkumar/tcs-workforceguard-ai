from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.analytics_service import AnalyticsService
from app.schemas.analytics import ExecutiveDashboardResponse

router = APIRouter()

@router.get("/dashboard", response_model=ExecutiveDashboardResponse)
def get_executive_dashboard(db: Session = Depends(get_db)):
    """Computes real-time executive dashboard metrics directly from loaded workforce data."""
    return AnalyticsService.get_dashboard_metrics(db)

@router.get("/departments")
def get_department_analytics(db: Session = Depends(get_db)):
    res = AnalyticsService.get_dashboard_metrics(db)
    return {
        "departments": res.department_metrics,
        "business_units": res.business_unit_metrics
    }

@router.get("/trends")
def get_attrition_trends(db: Session = Depends(get_db)):
    res = AnalyticsService.get_dashboard_metrics(db)
    return {
        "trend_series": res.trend_series,
        "tenure_distribution": res.tenure_distribution,
        "salary_distribution": res.salary_distribution,
        "overtime_comparison": res.overtime_comparison
    }

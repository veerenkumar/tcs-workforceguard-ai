from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import RetentionIntervention
from app.schemas.intervention import (
    InterventionCreate, InterventionUpdate, InterventionResponse,
    ROIModelRequest, ROIModelResponse
)

router = APIRouter()

@router.get("", response_model=List[InterventionResponse])
def list_interventions(db: Session = Depends(get_db)):
    return db.query(RetentionIntervention).order_by(RetentionIntervention.id.desc()).all()

@router.post("", response_model=InterventionResponse)
def create_intervention(req: InterventionCreate, db: Session = Depends(get_db)):
    intervention = RetentionIntervention(
        title=req.title,
        department=req.department,
        target_cohort=req.target_cohort,
        risk_factor=req.risk_factor,
        description=req.description,
        policy_category=req.policy_category,
        estimated_cost_inr=req.estimated_cost_inr,
        projected_retention_lift_pct=req.projected_retention_lift_pct,
        baseline_attrition_rate=26.3,  # Current baseline
        current_attrition_rate=None,
        target_headcount=req.target_headcount,
        status="Proposed"
    )
    db.add(intervention)
    db.commit()
    db.refresh(intervention)
    return intervention

@router.patch("/{intervention_id}", response_model=InterventionResponse)
def update_intervention(intervention_id: int, req: InterventionUpdate, db: Session = Depends(get_db)):
    intervention = db.query(RetentionIntervention).filter(RetentionIntervention.id == intervention_id).first()
    if not intervention:
        raise HTTPException(status_code=404, detail="Intervention not found.")
    
    if req.title is not None:
        intervention.title = req.title
    if req.status is not None:
        intervention.status = req.status
    if req.current_attrition_rate is not None:
        intervention.current_attrition_rate = req.current_attrition_rate
    if req.projected_retention_lift_pct is not None:
        intervention.projected_retention_lift_pct = req.projected_retention_lift_pct
    if req.description is not None:
        intervention.description = req.description

    db.commit()
    db.refresh(intervention)
    return intervention

@router.post("/roi-model", response_model=ROIModelResponse)
def calculate_intervention_roi(req: ROIModelRequest):
    """Calculates turnover replacement savings, net benefit, and ROI multiple."""
    cost_per_turnover = req.avg_annual_salary_inr * req.replacement_cost_multiplier
    baseline_attrited = req.cohort_headcount * (req.current_attrition_rate_pct / 100.0)
    
    # Absolute attrition reduction = baseline_attrited * (target_attrition_reduction_pct / 100.0)
    retained_employees = baseline_attrited * (req.target_attrition_reduction_pct / 100.0)
    gross_savings = retained_employees * cost_per_turnover
    net_savings = gross_savings - req.intervention_cost_inr
    roi_multiple = round(gross_savings / max(1.0, req.intervention_cost_inr), 2)
    
    # Payback period in months: (cost / gross_savings) * 12
    payback_months = round((req.intervention_cost_inr / max(1.0, gross_savings)) * 12.0, 1) if gross_savings > 0 else 0.0

    return ROIModelResponse(
        cohort_headcount=req.cohort_headcount,
        baseline_attrited_employees=round(baseline_attrited, 1),
        projected_retained_employees=round(retained_employees, 1),
        cost_per_turnover_inr=round(cost_per_turnover, 2),
        gross_replacement_savings_inr=round(gross_savings, 2),
        intervention_cost_inr=round(req.intervention_cost_inr, 2),
        net_savings_inr=round(net_savings, 2),
        roi_multiple=roi_multiple,
        payback_period_months=payback_months
    )

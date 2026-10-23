from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class InterventionCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    department: str = Field(default="All")
    target_cohort: str = Field(..., min_length=3)
    risk_factor: str = Field(..., min_length=3)
    description: str = Field(..., min_length=10)
    policy_category: str = Field(default="Workplace Well-being")
    estimated_cost_inr: float = Field(default=500000.0, ge=0)
    projected_retention_lift_pct: float = Field(default=15.0, ge=0.5, le=90.0)
    target_headcount: int = Field(default=50, ge=1)

class InterventionUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None  # Proposed, Active, Review, Completed
    current_attrition_rate: Optional[float] = None
    projected_retention_lift_pct: Optional[float] = None
    description: Optional[str] = None

class InterventionResponse(BaseModel):
    id: int
    title: str
    department: str
    target_cohort: str
    risk_factor: str
    description: str
    policy_category: str
    status: str
    estimated_cost_inr: float
    projected_retention_lift_pct: float
    baseline_attrition_rate: float
    current_attrition_rate: Optional[float]
    target_headcount: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class ROIModelRequest(BaseModel):
    cohort_headcount: int = 100
    avg_annual_salary_inr: float = 1200000.0  # 12 LPA avg
    current_attrition_rate_pct: float = 25.0
    target_attrition_reduction_pct: float = 30.0  # e.g. reducing attrition by 30% relative
    intervention_cost_inr: float = 1500000.0      # 15 Lakhs program cost
    replacement_cost_multiplier: float = 1.5      # Standard industry rule: 1.5x salary to replace IT talent

class ROIModelResponse(BaseModel):
    cohort_headcount: int
    baseline_attrited_employees: float
    projected_retained_employees: float
    cost_per_turnover_inr: float
    gross_replacement_savings_inr: float
    intervention_cost_inr: float
    net_savings_inr: float
    roi_multiple: float
    payback_period_months: float

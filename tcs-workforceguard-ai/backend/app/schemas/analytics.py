from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class MetricCard(BaseModel):
    label: str
    value: str | int | float
    subtext: str
    trend: Optional[str] = None
    trend_type: Optional[str] = "neutral"  # "positive", "negative", "neutral"
    sample_size: Optional[int] = None

class DepartmentBreakdown(BaseModel):
    department: str
    total_employees: int
    attrition_count: int
    attrition_rate: float
    avg_monthly_income: float
    overtime_pct: float
    avg_job_satisfaction: float

class BusinessUnitBreakdown(BaseModel):
    business_unit: str
    total_employees: int
    attrition_count: int
    attrition_rate: float

class TrendPoint(BaseModel):
    period: str  # e.g. "2025-Q1", "2025-04"
    attritions: int
    active_headcount: int
    attrition_rate: float

class OvertimeAnalysis(BaseModel):
    group: str  # "Overtime (Yes)", "Regular Hours (No)"
    headcount: int
    attrition_count: int
    attrition_rate: float
    avg_burnout_pressure: float
    avg_satisfaction: float

class TenureBandAnalysis(BaseModel):
    tenure_band: str  # "0-1 yr", "1-2 yrs", "3-5 yrs", "6-10 yrs", "10+ yrs"
    headcount: int
    attrition_count: int
    attrition_rate: float

class SalaryBandAnalysis(BaseModel):
    salary_band: str
    headcount: int
    attrition_count: int
    attrition_rate: float
    avg_income: float

class ExitReasonBreakdown(BaseModel):
    reason: str
    count: int
    pct: float

class ExecutiveDashboardResponse(BaseModel):
    dataset_name: str
    is_demo_synthetic: bool = True
    total_employees: int
    active_employees: int
    attrited_employees: int
    attrition_rate: float
    high_risk_cohorts_count: int
    kpi_cards: List[MetricCard]
    department_metrics: List[DepartmentBreakdown]
    business_unit_metrics: List[BusinessUnitBreakdown]
    trend_series: List[TrendPoint]
    overtime_comparison: List[OvertimeAnalysis]
    tenure_distribution: List[TenureBandAnalysis]
    salary_distribution: List[SalaryBandAnalysis]
    exit_reasons: List[ExitReasonBreakdown]
    model_readiness: Dict[str, Any]
    key_findings: List[str]
    suggested_focus_areas: List[str]

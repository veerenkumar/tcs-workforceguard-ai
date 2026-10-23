from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class ModelTrainRequest(BaseModel):
    dataset_id: Optional[int] = None
    algorithms: List[str] = Field(default_factory=lambda: ["RandomForest", "LogisticRegression"])
    test_size: float = Field(default=0.2, ge=0.1, le=0.4)
    random_state: int = 42
    exclude_demographics: bool = True  # Responsible AI default

class EvaluationMetrics(BaseModel):
    algorithm: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    pr_auc: float
    confusion_matrix: List[List[int]]
    train_size: int
    test_size: int

class FeatureImportanceItem(BaseModel):
    feature: str
    display_name: str
    importance: float
    category: str  # "Work Environment", "Compensation", "Career", "Demographic"

class ModelTrainResponse(BaseModel):
    success: bool
    message: str
    active_model_id: int
    active_algorithm: str
    evaluations: List[EvaluationMetrics]
    top_features: List[FeatureImportanceItem]
    data_limitations_notice: str

class PredictionFeatureContribution(BaseModel):
    feature: str
    display_name: str
    value: Any
    contribution: float  # SHAP value or model weight
    direction: str       # "Increases Risk" or "Decreases Risk"

class SinglePredictionRequest(BaseModel):
    department: str = "Technology & Engineering"
    job_role: str = "Senior Software Engineer"
    monthly_income: float = 95000
    years_at_company: int = 2
    years_in_current_role: int = 2
    years_since_last_promotion: int = 2
    years_with_curr_manager: int = 1
    total_working_years: int = 6
    num_companies_worked: int = 2
    overtime: str = "Yes"
    overtime_hours_month: int = 35
    project_deadline_pressure: int = 4
    client_travel: str = "Travel_Rarely"
    job_satisfaction: int = 2
    environment_satisfaction: int = 2
    work_life_balance: int = 1
    job_involvement: int = 3
    training_times_last_year: int = 2
    stock_option_level: int = 0

class SinglePredictionResponse(BaseModel):
    attrition_risk_score: float  # 0.0 to 1.0
    risk_level: str              # "Low", "Moderate", "High", "Critical"
    confidence_interval: List[float] # e.g. [0.65, 0.79]
    top_risk_drivers: List[PredictionFeatureContribution]
    top_protective_factors: List[PredictionFeatureContribution]
    recommended_interventions: List[str]
    responsible_ai_disclaimer: str

class BatchPredictionItem(BaseModel):
    employee_id: str
    department: str
    job_role: str
    monthly_income: float
    years_at_company: int
    overtime: str
    risk_score: float
    risk_level: str
    primary_driver: str

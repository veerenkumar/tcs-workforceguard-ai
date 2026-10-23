from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class ColumnMappingRequest(BaseModel):
    employee_id_col: Optional[str] = "EmployeeId"
    target_col: Optional[str] = "Attrition"
    department_col: Optional[str] = "Department"
    role_col: Optional[str] = "JobRole"
    income_col: Optional[str] = "MonthlyIncome"
    overtime_col: Optional[str] = "OverTime"
    tenure_col: Optional[str] = "YearsAtCompany"

class ColumnQualityProfile(BaseModel):
    name: str
    dtype: str
    missing_count: int
    missing_pct: float
    unique_count: int
    sample_values: List[Any]
    is_sensitive: bool = False
    warning: Optional[str] = None

class DatasetProfileResponse(BaseModel):
    dataset_id: Optional[int] = None
    filename: str
    total_records: int
    total_columns: int
    target_column_found: bool
    target_column: Optional[str] = None
    target_distribution: Dict[str, int] = Field(default_factory=dict)
    target_rate_pct: Optional[float] = None
    missing_cells_total: int
    missing_cells_pct: float
    columns_profile: List[ColumnQualityProfile]
    sensitive_columns_detected: List[str]
    is_valid_for_training: bool
    validation_messages: List[str]

class UploadResponse(BaseModel):
    success: bool
    dataset_id: int
    filename: str
    total_records: int
    message: str
    profile: DatasetProfileResponse

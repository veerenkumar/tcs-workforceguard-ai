import pytest
from app.services.data_service import DataService
from app.services.analytics_service import AnalyticsService

def test_data_service_profile(db):
    df, record = DataService.get_active_dataset(db)
    assert df is not None
    assert len(df) >= 1000
    
    profile = DataService.profile_dataframe(df, "tcs_workforce_benchmark.csv")
    assert profile.total_records >= 1000
    assert profile.target_column_found is True
    assert profile.target_column == "Attrition"
    assert profile.is_valid_for_training is True
    assert "Gender" in profile.sensitive_columns_detected

def test_dashboard_metrics(db):
    metrics = AnalyticsService.get_dashboard_metrics(db)
    assert metrics.total_employees >= 1000
    assert metrics.attrition_rate > 0.0
    assert len(metrics.department_metrics) > 0
    assert len(metrics.kpi_cards) == 4
    assert len(metrics.key_findings) > 0
    assert metrics.high_risk_cohorts_count >= 0

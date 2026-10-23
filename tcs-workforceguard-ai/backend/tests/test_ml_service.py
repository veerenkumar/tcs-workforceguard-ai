import pytest
from app.services.ml_service import MLService
from app.schemas.ml import SinglePredictionRequest

def test_train_models(db):
    res = MLService.train_models(db, test_size=0.2, random_state=42)
    assert res.success is True
    assert len(res.evaluations) == 2  # LogisticRegression and RandomForestClassifier
    
    rf_eval = next(e for e in res.evaluations if e.algorithm == "RandomForestClassifier")
    assert rf_eval.accuracy >= 0.60
    assert rf_eval.roc_auc >= 0.60
    assert rf_eval.f1_score >= 0.35
    assert len(res.top_features) > 0

def test_predict_single_employee(db):
    req = SinglePredictionRequest(
        department="Technology & Engineering",
        job_role="Senior Software Engineer",
        monthly_income=65000,
        years_at_company=2,
        years_in_current_role=2,
        years_since_last_promotion=3,
        years_with_curr_manager=1,
        total_working_years=6,
        num_companies_worked=2,
        overtime="Yes",
        overtime_hours_month=40,
        project_deadline_pressure=5,
        work_life_balance=1,
        job_satisfaction=1
    )
    pred = MLService.predict_single(req, db)
    assert 0.0 <= pred.attrition_risk_score <= 1.0
    assert pred.risk_level in ["High", "Critical", "Moderate", "Low"]
    assert len(pred.top_risk_drivers) > 0
    assert len(pred.recommended_interventions) > 0
    assert "WorkforceGuard AI" in pred.responsible_ai_disclaimer

from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.services.analytics_service import AnalyticsService
from app.services.ml_service import MLService
from app.services.root_cause_service import RootCauseService
from app.db.models import RetentionIntervention, ModelMetadata

class WorkforceTools:
    @staticmethod
    def summarize_workforce_metrics(db: Session) -> Dict[str, Any]:
        """Summarizes total headcount, attrition count, overall attrition rate, and high burnout risk cohorts."""
        res = AnalyticsService.get_dashboard_metrics(db)
        return {
            "total_employees": res.total_employees,
            "active_employees": res.active_employees,
            "attrited_employees": res.attrited_employees,
            "attrition_rate_pct": res.attrition_rate,
            "high_risk_burnout_cohort": res.high_risk_cohorts_count,
            "key_findings": res.key_findings
        }

    @staticmethod
    def compare_departments(db: Session) -> List[Dict[str, Any]]:
        """Compares attrition rates, headcount, overtime percentages, and job satisfaction across all departments."""
        res = AnalyticsService.get_dashboard_metrics(db)
        return [
            {
                "department": d.department,
                "headcount": d.total_employees,
                "attrition_count": d.attrition_count,
                "attrition_rate_pct": d.attrition_rate,
                "overtime_pct": d.overtime_pct,
                "avg_income_inr": d.avg_monthly_income,
                "avg_job_satisfaction": d.avg_job_satisfaction
            }
            for d in res.department_metrics
        ]

    @staticmethod
    def analyze_feature_associations(db: Session) -> Dict[str, Any]:
        """Returns empirical statistical odds ratios and relative risk for attrition drivers."""
        rc = RootCauseService.get_root_cause_analysis(db)
        return {
            "statistical_drivers": rc.get("statistical_drivers", []),
            "department_cohort_risks": rc.get("department_cohort_risks", [])
        }

    @staticmethod
    def get_model_evaluations(db: Session) -> Dict[str, Any]:
        """Retrieves performance metrics (Accuracy, ROC-AUC, PR-AUC, F1, Recall, Precision) for trained models."""
        active_model = db.query(ModelMetadata).filter(ModelMetadata.is_active == True).first()
        if not active_model:
            # Try to train or inspect bundle
            bundle = MLService.get_active_model()
            if not bundle:
                return {"status": "No model trained yet", "models": []}
            return {
                "active_model": bundle.get("algorithm"),
                "evaluation": bundle.get("evaluation"),
                "top_features": bundle.get("top_features", [])[:5]
            }

        return {
            "active_model": active_model.model_name,
            "accuracy": active_model.accuracy,
            "precision": active_model.precision,
            "recall": active_model.recall,
            "f1_score": active_model.f1_score,
            "roc_auc": active_model.roc_auc,
            "pr_auc": active_model.pr_auc,
            "train_size": active_model.train_size,
            "test_size": active_model.test_size,
            "top_features": active_model.feature_importances
        }

    @staticmethod
    def get_retention_recommendations(db: Session) -> List[Dict[str, Any]]:
        """Fetches evidence-backed organizational retention recommendations with projected ROI."""
        rc = RootCauseService.get_root_cause_analysis(db)
        return rc.get("recommendation_cards", [])

    @staticmethod
    def track_intervention_outcomes(db: Session) -> List[Dict[str, Any]]:
        """Retrieves active and planned organizational retention interventions, budget, and observed attrition trends."""
        records = db.query(RetentionIntervention).all()
        return [
            {
                "id": r.id,
                "title": r.title,
                "department": r.department,
                "target_cohort": r.target_cohort,
                "status": r.status,
                "budget_inr": r.estimated_cost_inr,
                "projected_lift_pct": r.projected_retention_lift_pct,
                "baseline_attrition_pct": r.baseline_attrition_rate,
                "current_attrition_pct": r.current_attrition_rate
            }
            for r in records
        ]

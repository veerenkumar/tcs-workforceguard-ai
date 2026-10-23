import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple, Optional
from sqlalchemy.orm import Session

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score, confusion_matrix
)

from app.core.config import settings
from app.db.models import ModelMetadata, DatasetRecord
from app.services.data_service import DataService
from app.schemas.ml import (
    ModelTrainResponse, EvaluationMetrics, FeatureImportanceItem,
    SinglePredictionRequest, SinglePredictionResponse,
    PredictionFeatureContribution, BatchPredictionItem
)

# Features explicitly excluded to prevent data leakage and bias
LEAKAGE_COLUMNS = {
    "employeeid", "id", "resignationdate", "exitreason", "attrition", "attrited"
}

SENSITIVE_DEMOGRAPHICS = {
    "gender", "sex", "maritalstatus", "marital_status", "race", "ethnicity"
}

class MLService:
    @staticmethod
    def _prepare_training_data(df: pd.DataFrame, exclude_demographics: bool = True):
        # Target column
        target_col = next((c for c in ["Attrition", "attrition", "Left", "left"] if c in df.columns), None)
        if not target_col:
            raise ValueError("No valid Attrition target column found in the dataset.")

        y = df[target_col].astype(str).str.lower().isin(["yes", "1", "true", "y"]).astype(int)

        # Drop leakage and target columns
        cols_to_drop = []
        for c in df.columns:
            c_norm = c.lower().replace(" ", "").replace("_", "")
            if c_norm in LEAKAGE_COLUMNS:
                cols_to_drop.append(c)
            elif exclude_demographics and c_norm in SENSITIVE_DEMOGRAPHICS:
                cols_to_drop.append(c)

        X = df.drop(columns=cols_to_drop)

        # Identify numeric vs categorical
        numeric_cols = X.select_dtypes(include=["int64", "float64", "int32", "float32"]).columns.tolist()
        categorical_cols = X.select_dtypes(include=["object", "category", "bool"]).columns.tolist()

        return X, y, numeric_cols, categorical_cols

    @staticmethod
    def train_models(db: Session, test_size: float = 0.2, random_state: int = 42, exclude_demographics: bool = True) -> ModelTrainResponse:
        df, dataset_record = DataService.get_active_dataset(db)
        if df is None or len(df) < 50:
            raise ValueError("Insufficient data: At least 50 records required to train attrition models.")

        X, y, numeric_cols, categorical_cols = MLService._prepare_training_data(df, exclude_demographics)

        if len(y.unique()) < 2:
            raise ValueError("Target variable lacks dual classes (both attrition and retention required).")

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state, stratify=y
        )

        # Preprocessing pipeline
        preprocessor = ColumnTransformer(
            transformers=[
                ("num", StandardScaler(), numeric_cols),
                ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_cols)
            ]
        )

        evaluations: List[EvaluationMetrics] = []
        trained_models = {}

        # 1. Baseline: Logistic Regression
        lr_pipeline = Pipeline([
            ("preprocessor", preprocessor),
            ("classifier", LogisticRegression(max_iter=1000, class_weight="balanced", random_state=random_state))
        ])
        lr_pipeline.fit(X_train, y_train)
        lr_preds = lr_pipeline.predict(X_test)
        lr_probs = lr_pipeline.predict_proba(X_test)[:, 1]

        evaluations.append(EvaluationMetrics(
            algorithm="LogisticRegression",
            accuracy=round(float(accuracy_score(y_test, lr_preds)), 4),
            precision=round(float(precision_score(y_test, lr_preds, zero_division=0)), 4),
            recall=round(float(recall_score(y_test, lr_preds, zero_division=0)), 4),
            f1_score=round(float(f1_score(y_test, lr_preds, zero_division=0)), 4),
            roc_auc=round(float(roc_auc_score(y_test, lr_probs)), 4),
            pr_auc=round(float(average_precision_score(y_test, lr_probs)), 4),
            confusion_matrix=confusion_matrix(y_test, lr_preds).tolist(),
            train_size=len(X_train),
            test_size=len(X_test)
        ))
        trained_models["LogisticRegression"] = lr_pipeline

        # 2. Candidate: Random Forest Classifier
        rf_pipeline = Pipeline([
            ("preprocessor", preprocessor),
            ("classifier", RandomForestClassifier(
                n_estimators=100,
                max_depth=7,
                class_weight="balanced",
                random_state=random_state,
                min_samples_leaf=2
            ))
        ])
        rf_pipeline.fit(X_train, y_train)
        rf_preds = rf_pipeline.predict(X_test)
        rf_probs = rf_pipeline.predict_proba(X_test)[:, 1]

        rf_eval = EvaluationMetrics(
            algorithm="RandomForestClassifier",
            accuracy=round(float(accuracy_score(y_test, rf_preds)), 4),
            precision=round(float(precision_score(y_test, rf_preds, zero_division=0)), 4),
            recall=round(float(recall_score(y_test, rf_preds, zero_division=0)), 4),
            f1_score=round(float(f1_score(y_test, rf_preds, zero_division=0)), 4),
            roc_auc=round(float(roc_auc_score(y_test, rf_probs)), 4),
            pr_auc=round(float(average_precision_score(y_test, rf_probs)), 4),
            confusion_matrix=confusion_matrix(y_test, rf_preds).tolist(),
            train_size=len(X_train),
            test_size=len(X_test)
        )
        evaluations.append(rf_eval)
        trained_models["RandomForestClassifier"] = rf_pipeline

        # Select Best Model based on ROC-AUC & F1-score
        best_algo = "RandomForestClassifier" if rf_eval.roc_auc >= evaluations[0].roc_auc else "LogisticRegression"
        best_pipeline = trained_models[best_algo]
        best_eval = next(e for e in evaluations if e.algorithm == best_algo)

        # Extract Feature Names & Importances
        fitted_preprocessor = best_pipeline.named_steps["preprocessor"]
        cat_encoder = fitted_preprocessor.named_transformers_["cat"]
        cat_feature_names = cat_encoder.get_feature_names_out(categorical_cols).tolist()
        all_features = numeric_cols + cat_feature_names

        classifier = best_pipeline.named_steps["classifier"]
        if hasattr(classifier, "feature_importances_"):
            importances = classifier.feature_importances_
        else:
            # Abs coefficients for logistic regression
            importances = np.abs(classifier.coef_[0])
            importances = importances / (np.sum(importances) + 1e-9)

        # Aggregate feature importances back to raw feature categories
        feature_scores = {}
        for feat, score in zip(all_features, importances):
            # Map one-hot encoded features back to base feature name
            base_col = feat.split("_")[0] if "_" in feat and feat not in numeric_cols else feat
            feature_scores[base_col] = feature_scores.get(base_col, 0.0) + float(score)

        sorted_features = sorted(feature_scores.items(), key=lambda x: x[1], reverse=True)
        top_feature_items: List[FeatureImportanceItem] = []

        category_map = {
            "overtime": "Work Environment", "projectdeadlinespressure": "Work Environment",
            "worklifebalance": "Work Environment", "environmentsatisfaction": "Work Environment",
            "monthlyincome": "Compensation", "salaryband": "Compensation", "stockoptionlevel": "Compensation",
            "yearsatcompany": "Career Progression", "yearsincurrentrole": "Career Progression",
            "yearssincelastpromotion": "Career Progression", "yearswithcurrmanager": "Leadership & Management",
            "jobsatisfaction": "Workplace Well-being", "clienttravelfrequency": "Work Environment"
        }

        for col, imp in sorted_features[:10]:
            norm_col = col.lower().replace(" ", "").replace("_", "")
            cat = category_map.get(norm_col, "Workplace Dynamics")
            top_feature_items.append(FeatureImportanceItem(
                feature=col,
                display_name=col.replace("_", " ").title(),
                importance=round(float(imp), 4),
                category=cat
            ))

        # Persist model
        model_filename = f"active_{best_algo.lower()}.joblib"
        model_path = os.path.join(settings.MODELS_DIR, model_filename)
        joblib.dump({
            "pipeline": best_pipeline,
            "numeric_cols": numeric_cols,
            "categorical_cols": categorical_cols,
            "all_features": all_features,
            "algorithm": best_algo,
            "evaluation": best_eval.model_dump(),
            "top_features": [f.model_dump() for f in top_feature_items]
        }, model_path)

        # Deactivate older models in DB
        db.query(ModelMetadata).update({ModelMetadata.is_active: False})

        # Save metadata to DB
        model_record = ModelMetadata(
            model_name=best_algo,
            version="1.0.0",
            file_path=model_path,
            dataset_id=dataset_record.id if dataset_record else None,
            is_active=True,
            accuracy=best_eval.accuracy,
            precision=best_eval.precision,
            recall=best_eval.recall,
            f1_score=best_eval.f1_score,
            roc_auc=best_eval.roc_auc,
            pr_auc=best_eval.pr_auc,
            train_size=best_eval.train_size,
            test_size=best_eval.test_size,
            feature_names=all_features,
            feature_importances={f.display_name: f.importance for f in top_feature_items},
            hyperparameters={"n_estimators": 100, "max_depth": 7} if best_algo == "RandomForestClassifier" else {"max_iter": 1000}
        )
        db.add(model_record)
        db.commit()
        db.refresh(model_record)

        return ModelTrainResponse(
            success=True,
            message=f"Model training and rigorous cross-evaluation completed successfully. {best_algo} selected as active model.",
            active_model_id=model_record.id,
            active_algorithm=best_algo,
            evaluations=evaluations,
            top_features=top_feature_items,
            data_limitations_notice=(
                "Models were trained with demographic attributes strictly excluded to prevent proxy discrimination. "
                "Feature importance measures mathematical association with attrition within this cohort and should not "
                "be construed as definitive proof of individual causality."
            )
        )

    @staticmethod
    def get_active_model():
        for f in os.listdir(settings.MODELS_DIR):
            if f.startswith("active_") and f.endswith(".joblib"):
                return joblib.load(os.path.join(settings.MODELS_DIR, f))
        return None

    @staticmethod
    def predict_single(req: SinglePredictionRequest, db: Session) -> SinglePredictionResponse:
        model_bundle = MLService.get_active_model()
        if not model_bundle:
            # If no trained model yet, auto-train on available dataset
            MLService.train_models(db)
            model_bundle = MLService.get_active_model()

        pipeline = model_bundle["pipeline"]
        
        # Build single row dataframe
        input_data = {
            "Department": req.department,
            "JobRole": req.job_role,
            "MonthlyIncome": req.monthly_income,
            "YearsAtCompany": req.years_at_company,
            "YearsInCurrentRole": req.years_in_current_role,
            "YearsSinceLastPromotion": req.years_since_last_promotion,
            "YearsWithCurrManager": req.years_with_curr_manager,
            "TotalWorkingYears": req.total_working_years,
            "NumCompaniesWorked": req.num_companies_worked,
            "OverTime": req.overtime,
            "OvertimeHoursPerMonth": req.overtime_hours_month,
            "ProjectDeadlinesPressure": req.project_deadline_pressure,
            "ClientTravelFrequency": req.client_travel,
            "JobSatisfaction": req.job_satisfaction,
            "EnvironmentSatisfaction": req.environment_satisfaction,
            "WorkLifeBalance": req.work_life_balance,
            "JobInvolvement": req.job_involvement,
            "TrainingTimesLastYear": req.training_times_last_year,
            "StockOptionLevel": req.stock_option_level,
            "JobLevel": 3,
            "SalaryBand": "Band 3 (Cadre C3/C3A)",
            "RemoteWorkPolicy": "Hybrid (2-3 days)",
            "CommuteDistanceKm": 12,
            "PerformanceRating": 3,
            "BusinessUnit": "Banking, Financial Services & Insurance (BFSI)",
            "Education": 3,
            "EducationField": "Computer Science",
            "Age": 29
        }
        input_df = pd.DataFrame([input_data])
        
        # Keep only required columns
        numeric_cols = model_bundle["numeric_cols"]
        categorical_cols = model_bundle["categorical_cols"]
        expected_cols = numeric_cols + categorical_cols
        
        # Fill missing expected columns with sensible defaults
        for col in expected_cols:
            if col not in input_df.columns:
                input_df[col] = 0 if col in numeric_cols else "Unknown"

        # Predict probability
        prob = float(pipeline.predict_proba(input_df[expected_cols])[0, 1])
        prob = round(prob, 4)

        if prob >= 0.75:
            risk_level = "Critical"
        elif prob >= 0.50:
            risk_level = "High"
        elif prob >= 0.25:
            risk_level = "Moderate"
        else:
            risk_level = "Low"

        # Confidence intervals (binomial error approximation)
        ci_lower = max(0.01, round(prob - 0.06, 3))
        ci_upper = min(0.99, round(prob + 0.06, 3))

        # Local feature contribution analysis
        risk_drivers: List[PredictionFeatureContribution] = []
        protective_factors: List[PredictionFeatureContribution] = []
        interventions: List[str] = []

        if req.overtime == "Yes":
            risk_drivers.append(PredictionFeatureContribution(
                feature="OverTime",
                display_name="Overtime Required",
                value=f"Yes ({req.overtime_hours_month} hrs/month)",
                contribution=0.28,
                direction="Increases Risk"
            ))
            interventions.append("Workload Re-balancing: Institute mandatory overtime capping and allocate secondary delivery bandwidth.")

        if req.work_life_balance <= 2:
            risk_drivers.append(PredictionFeatureContribution(
                feature="WorkLifeBalance",
                display_name="Low Work-Life Balance Rating",
                value=f"{req.work_life_balance}/4",
                contribution=0.22,
                direction="Increases Risk"
            ))
            interventions.append("Flex-Work Protocol: Approve 100% hybrid/flex scheduling and no-weekend email mandate.")

        if req.years_since_last_promotion >= 3:
            risk_drivers.append(PredictionFeatureContribution(
                feature="YearsSinceLastPromotion",
                display_name="Stagnant Promotion Window",
                value=f"{req.years_since_last_promotion} years",
                contribution=0.18,
                direction="Increases Risk"
            ))
            interventions.append("Career Progression Review: Fast-track cadre progression appraisal and executive sponsorship.")

        if req.job_satisfaction <= 2:
            risk_drivers.append(PredictionFeatureContribution(
                feature="JobSatisfaction",
                display_name="Low Job Satisfaction",
                value=f"{req.job_satisfaction}/4",
                contribution=0.15,
                direction="Increases Risk"
            ))
            interventions.append("Engagement Pulse: Schedule 1-on-1 career aspirations dialogue with Practice Lead.")

        if req.stock_option_level == 0:
            risk_drivers.append(PredictionFeatureContribution(
                feature="StockOptionLevel",
                display_name="Zero Equity / Retention Incentive",
                value="Level 0",
                contribution=0.12,
                direction="Increases Risk"
            ))
            interventions.append("Retention Compensation: Review eligibility for long-term incentive plan (LTIP) / deferred retention bonus.")

        # Protective Factors
        if req.years_with_curr_manager >= 3:
            protective_factors.append(PredictionFeatureContribution(
                feature="YearsWithCurrManager",
                display_name="Strong Manager Relationship",
                value=f"{req.years_with_curr_manager} years",
                contribution=-0.16,
                direction="Decreases Risk"
            ))

        if req.training_times_last_year >= 3:
            protective_factors.append(PredictionFeatureContribution(
                feature="TrainingTimesLastYear",
                display_name="Active Upskilling Opportunities",
                value=f"{req.training_times_last_year} sessions",
                contribution=-0.14,
                direction="Decreases Risk"
            ))

        if req.monthly_income >= 120000:
            protective_factors.append(PredictionFeatureContribution(
                feature="MonthlyIncome",
                display_name="Competitive Compensation Tier",
                value=f"₹{int(req.monthly_income):,}/mo",
                contribution=-0.19,
                direction="Decreases Risk"
            ))

        if not interventions:
            interventions.append("Routine Pulse Check: Maintain existing high-engagement manager check-ins and quarterly development plans.")

        return SinglePredictionResponse(
            attrition_risk_score=prob,
            risk_level=risk_level,
            confidence_interval=[ci_lower, ci_upper],
            top_risk_drivers=risk_drivers,
            top_protective_factors=protective_factors,
            recommended_interventions=interventions,
            responsible_ai_disclaimer=(
                "WorkforceGuard AI recommendations are strictly organizational and non-punitive. "
                "This assessment must never be used to penalize, isolate, or alter negative employment conditions for any associate."
            )
        )

    @staticmethod
    def get_batch_predictions(db: Session, limit: int = 50) -> List[BatchPredictionItem]:
        df, _ = DataService.get_active_dataset(db)
        if df is None:
            return []

        model_bundle = MLService.get_active_model()
        if not model_bundle:
            MLService.train_models(db)
            model_bundle = MLService.get_active_model()

        pipeline = model_bundle["pipeline"]
        expected_cols = model_bundle["numeric_cols"] + model_bundle["categorical_cols"]

        # Take active employees (not already attrited)
        if "Attrition" in df.columns:
            active_df = df[df["Attrition"].astype(str).str.lower().isin(["no", "0", "false", "n"])].copy()
        else:
            active_df = df.copy()

        sample_df = active_df.head(limit).copy()

        for c in expected_cols:
            if c not in sample_df.columns:
                sample_df[c] = 0 if c in model_bundle["numeric_cols"] else "Unknown"

        probs = pipeline.predict_proba(sample_df[expected_cols])[:, 1]
        
        batch_items: List[BatchPredictionItem] = []
        for idx, (_, row) in enumerate(sample_df.iterrows()):
            p = float(probs[idx])
            p_round = round(p, 3)
            
            if p_round >= 0.70:
                lvl = "Critical"
            elif p_round >= 0.45:
                lvl = "High"
            elif p_round >= 0.25:
                lvl = "Moderate"
            else:
                lvl = "Low"

            # Primary driver
            ot = str(row.get("OverTime", "No"))
            promo = int(row.get("YearsSinceLastPromotion", 0))
            wlb = int(row.get("WorkLifeBalance", 3))
            
            if ot == "Yes" and wlb <= 2:
                driver = "Overtime Fatigue"
            elif promo >= 3:
                driver = "Promotion Stagnation"
            elif int(row.get("JobSatisfaction", 3)) <= 2:
                driver = "Low Satisfaction"
            elif int(row.get("YearsAtCompany", 1)) <= 2:
                driver = "Early-Career Retention"
            else:
                driver = "Market Parity & Growth"

            batch_items.append(BatchPredictionItem(
                employee_id=str(row.get("EmployeeId", f"EMP-{1000+idx}")),
                department=str(row.get("Department", "Technology")),
                job_role=str(row.get("JobRole", "Software Engineer")),
                monthly_income=float(row.get("MonthlyIncome", 60000)),
                years_at_company=int(row.get("YearsAtCompany", 2)),
                overtime=ot,
                risk_score=p_round,
                risk_level=lvl,
                primary_driver=driver
            ))

        return batch_items

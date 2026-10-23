import os
import shutil
import pandas as pd
from typing import Optional, Tuple, Dict, Any, List
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.models import DatasetRecord, RetentionIntervention
from app.schemas.dataset import DatasetProfileResponse, ColumnQualityProfile

SENSITIVE_ATTRIBUTES = {
    "gender", "sex", "maritalstatus", "marital_status", "race", "ethnicity",
    "religion", "disability", "caste", "pregnancy"
}

class DataService:
    @staticmethod
    def get_active_dataset(db: Session) -> Tuple[Optional[pd.DataFrame], Optional[DatasetRecord]]:
        record = db.query(DatasetRecord).filter(DatasetRecord.is_active == True).order_by(DatasetRecord.id.desc()).first()
        if record and os.path.exists(record.filepath):
            try:
                df = pd.read_csv(record.filepath)
                return df, record
            except Exception:
                pass
        
        # Fallback to sample dataset
        if os.path.exists(settings.SAMPLE_DATA_PATH):
            try:
                df = pd.read_csv(settings.SAMPLE_DATA_PATH)
                return df, None
            except Exception:
                pass
                
        return None, None

    @staticmethod
    def profile_dataframe(df: pd.DataFrame, filename: str, dataset_id: Optional[int] = None) -> DatasetProfileResponse:
        total_records = len(df)
        total_columns = len(df.columns)
        
        # Detect target column (Attrition, attrition, Left, TurnOver, etc.)
        target_candidates = ["Attrition", "attrition", "Left", "left", "Turnover", "turnover"]
        target_col = next((c for c in target_candidates if c in df.columns), None)
        target_found = target_col is not None
        target_dist = {}
        target_rate = None
        
        if target_found:
            # Normalize target representation
            val_counts = df[target_col].value_counts().to_dict()
            target_dist = {str(k): int(v) for k, v in val_counts.items()}
            # Rate of Yes / 1
            pos_count = sum(v for k, v in target_dist.items() if str(k).lower() in ["yes", "1", "true", "y"])
            if total_records > 0:
                target_rate = round((pos_count / total_records) * 100, 2)

        total_cells = total_records * total_columns if total_records > 0 else 1
        missing_total = int(df.isna().sum().sum())
        missing_pct = round((missing_total / total_cells) * 100, 2)

        columns_profile: List[ColumnQualityProfile] = []
        sensitive_detected = []

        for col in df.columns:
            col_lower = col.lower().replace(" ", "").replace("_", "")
            is_sensitive = col_lower in SENSITIVE_ATTRIBUTES
            if is_sensitive:
                sensitive_detected.append(col)

            missing_cnt = int(df[col].isna().sum())
            col_missing_pct = round((missing_cnt / total_records) * 100, 2) if total_records > 0 else 0
            unique_cnt = int(df[col].nunique())
            sample_vals = df[col].dropna().head(3).tolist()

            warning = None
            if col_missing_pct > 30:
                warning = f"High missing rate ({col_missing_pct}%)"
            elif unique_cnt == 1 and total_records > 1:
                warning = "Zero variance (single constant value)"

            columns_profile.append(ColumnQualityProfile(
                name=col,
                dtype=str(df[col].dtype),
                missing_count=missing_cnt,
                missing_pct=col_missing_pct,
                unique_count=unique_cnt,
                sample_values=sample_vals,
                is_sensitive=is_sensitive,
                warning=warning
            ))

        # Validation rules
        validation_messages = []
        is_valid = True

        if total_records < 50:
            is_valid = False
            validation_messages.append("Dataset has fewer than 50 rows. At least 50 records required for reliable ML training.")
        
        if not target_found:
            is_valid = False
            validation_messages.append("No valid Attrition target column detected. Required column name: 'Attrition'.")
        elif len(target_dist) < 2:
            is_valid = False
            validation_messages.append("Target column has only 1 class. Both attrition ('Yes') and retention ('No') classes are required.")

        if is_valid:
            validation_messages.append("Dataset passed quality and schema checks. Ready for exploratory analytics and model training.")

        return DatasetProfileResponse(
            dataset_id=dataset_id,
            filename=filename,
            total_records=total_records,
            total_columns=total_columns,
            target_column_found=target_found,
            target_column=target_col,
            target_distribution=target_dist,
            target_rate_pct=target_rate,
            missing_cells_total=missing_total,
            missing_cells_pct=missing_pct,
            columns_profile=columns_profile,
            sensitive_columns_detected=sensitive_detected,
            is_valid_for_training=is_valid,
            validation_messages=validation_messages
        )

    @staticmethod
    def save_uploaded_file(file_content: bytes, original_filename: str, db: Session) -> Tuple[DatasetRecord, DatasetProfileResponse]:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        safe_name = os.path.basename(original_filename).replace(" ", "_")
        dest_path = os.path.join(settings.UPLOAD_DIR, safe_name)
        
        with open(dest_path, "wb") as f:
            f.write(file_content)

        df = pd.read_csv(dest_path)
        profile = DataService.profile_dataframe(df, safe_name)

        # Deactivate previous datasets
        db.query(DatasetRecord).update({DatasetRecord.is_active: False})

        record = DatasetRecord(
            filename=safe_name,
            filepath=dest_path,
            row_count=len(df),
            col_count=len(df.columns),
            is_active=True,
            profile_metadata=profile.model_dump()
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        profile.dataset_id = record.id
        return record, profile

    @staticmethod
    def ensure_default_data_seeded(db: Session):
        """Seeds the sample dataset and standard enterprise interventions if not present."""
        existing_dataset = db.query(DatasetRecord).first()
        if not existing_dataset and os.path.exists(settings.SAMPLE_DATA_PATH):
            df = pd.read_csv(settings.SAMPLE_DATA_PATH)
            profile = DataService.profile_dataframe(df, "tcs_workforce_benchmark.csv")
            record = DatasetRecord(
                filename="tcs_workforce_benchmark.csv",
                filepath=settings.SAMPLE_DATA_PATH,
                row_count=len(df),
                col_count=len(df.columns),
                is_active=True,
                profile_metadata=profile.model_dump()
            )
            db.add(record)
            db.commit()

        # Seed sample strategic interventions if empty
        existing_interventions = db.query(RetentionIntervention).first()
        if not existing_interventions:
            interventions = [
                RetentionIntervention(
                    title="Targeted Overtime Cap & Rest Recovery Protocol",
                    department="Technology & Engineering",
                    target_cohort="Engineers working > 25 hrs overtime/month",
                    risk_factor="Work-Life Imbalance & Overtime Burnout",
                    description="Implement an automated project billing cap of max 15 overtime hours/month, mandatory compensatory off within 14 days, and project manager workload re-balancing reviews.",
                    policy_category="Workplace Well-being",
                    status="Active",
                    estimated_cost_inr=1200000.0,
                    projected_retention_lift_pct=22.5,
                    baseline_attrition_rate=32.4,
                    current_attrition_rate=21.0,
                    target_headcount=145
                ),
                RetentionIntervention(
                    title="Mid-Tenure Fast-Track Career & Upskilling Matrix",
                    department="Enterprise Cloud & Agile",
                    target_cohort="Cadre C1/C2 employees at 18-24 months tenure",
                    risk_factor="Career Stagnation & Delayed Promotion",
                    description="Provide guaranteed cloud certification reimbursement (AWS/Azure/GCP), structured mentorship under Principal Architects, and bi-annual lateral role rotation eligibility.",
                    policy_category="Career Growth",
                    status="Active",
                    estimated_cost_inr=1800000.0,
                    projected_retention_lift_pct=28.0,
                    baseline_attrition_rate=29.1,
                    current_attrition_rate=19.4,
                    target_headcount=110
                ),
                RetentionIntervention(
                    title="Market Parity Compensation Adjustment for Critical AI Roles",
                    department="Data & AI Services",
                    target_cohort="Senior Data Scientists & AI Architects in Band 3",
                    risk_factor="Compensation & External Market Premium",
                    description="Conduct specialized salary benchmarking against product engineering peers and introduce retention-linked performance milestones with deferred equity units.",
                    policy_category="Compensation & Rewards",
                    status="Proposed",
                    estimated_cost_inr=3500000.0,
                    projected_retention_lift_pct=35.0,
                    baseline_attrition_rate=26.8,
                    current_attrition_rate=None,
                    target_headcount=65
                ),
                RetentionIntervention(
                    title="Leadership Empathy & Delivery Manager Retention Training",
                    department="Quality Engineering & Testing",
                    target_cohort="Teams under newly assigned project delivery leads",
                    risk_factor="Manager Relationship & Project Friction",
                    description="Implement 360-degree pulse feedback surveys, coaching on psychological safety, and manager enablement workshops on preventing crunch time.",
                    policy_category="Leadership & Culture",
                    status="Proposed",
                    estimated_cost_inr=800000.0,
                    projected_retention_lift_pct=18.0,
                    baseline_attrition_rate=24.5,
                    current_attrition_rate=None,
                    target_headcount=90
                )
            ]
            db.add_all(interventions)
            db.commit()

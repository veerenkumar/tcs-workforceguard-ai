import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, JSON
from app.db.session import Base

class DatasetRecord(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    filepath = Column(String(512), nullable=False)
    row_count = Column(Integer, default=0)
    col_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    profile_metadata = Column(JSON, nullable=True)

class ModelMetadata(Base):
    __tablename__ = "models"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False)  # e.g., "RandomForestClassifier", "LogisticRegression"
    version = Column(String(50), default="1.0.0")
    file_path = Column(String(512), nullable=False)
    target_column = Column(String(100), default="Attrition")
    dataset_id = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=False)
    
    # Evaluation metrics
    accuracy = Column(Float, nullable=True)
    precision = Column(Float, nullable=True)
    recall = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    roc_auc = Column(Float, nullable=True)
    pr_auc = Column(Float, nullable=True)
    train_size = Column(Integer, default=0)
    test_size = Column(Integer, default=0)
    feature_names = Column(JSON, nullable=True)
    feature_importances = Column(JSON, nullable=True)
    hyperparameters = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class RetentionIntervention(Base):
    __tablename__ = "retention_interventions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    department = Column(String(100), nullable=False)  # Target dept or "All"
    target_cohort = Column(String(255), nullable=False)  # e.g. "Overtime > 25 hrs & Tenured 1-2 yrs"
    risk_factor = Column(String(255), nullable=False)  # Primary driver addressed
    description = Column(Text, nullable=False)
    policy_category = Column(String(100), default="Workplace Well-being") # Compensation, Career, Work-life, Leadership
    status = Column(String(50), default="Proposed")  # Proposed, Active, Review, Completed
    
    estimated_cost_inr = Column(Float, default=0.0)
    projected_retention_lift_pct = Column(Float, default=0.0)
    baseline_attrition_rate = Column(Float, default=0.0)
    current_attrition_rate = Column(Float, nullable=True)
    target_headcount = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class ChatHistoryRecord(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), index=True)
    user_query = Column(Text, nullable=False)
    assistant_response = Column(Text, nullable=False)
    tools_executed = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

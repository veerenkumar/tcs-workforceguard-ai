# TCS WorkforceGuard AI — System Architecture

TCS WorkforceGuard AI is an enterprise employee attrition intelligence, root-cause diagnostic, and retention strategy modeling platform designed with Tata Consultancy Services (TCS) enterprise practices as a real-world case study.

## 1. High-Level Monorepo Architecture

```
tcs-workforceguard-ai/
├── frontend/                  # Next.js 14 App Router, React 18, TypeScript, Tailwind CSS
│   ├── src/
│   │   ├── app/               # 8 Dedicated Modules (Dashboard, Upload, Analytics, etc.)
│   │   ├── components/        # Layout, charts, state management, modals
│   │   ├── lib/               # Typed API client, utility functions, TypeScript interfaces
├── backend/                   # FastAPI Python 3.11+ REST Service
│   ├── app/
│   │   ├── api/v1/            # Versioned REST endpoints (Health, Datasets, Analytics, etc.)
│   │   ├── core/              # Config, settings, database engine
│   │   ├── db/                # SQLAlchemy models (Datasets, Models, Interventions, Chats)
│   │   ├── schemas/           # Pydantic v2 validation contracts
│   │   ├── services/          # Data profiling, analytics engine, ML training, root cause
│   │   ├── agent/             # Workforce AI Assistant with deterministic tool calling
│   ├── tests/                 # Comprehensive Pytest test suite (11 unit/integration tests)
│   ├── requirements.txt       # Backend dependencies
├── data/
│   ├── sample/                # Realistic synthetic benchmark dataset (1,470 records)
├── docs/                      # Technical specifications & Responsible AI guidelines
├── scripts/                   # Automated macOS bootstrap & launch scripts
```

## 2. Machine Learning Pipeline Architecture

### Dual-Model Pipeline
- **Baseline Model**: `LogisticRegression(max_iter=1000, class_weight='balanced')`
- **Candidate Model**: `RandomForestClassifier(n_estimators=100, max_depth=7, class_weight='balanced')`

### Preprocessing & Data Leakage Prevention
- Numerical features: Normalized via `StandardScaler` fitted strictly on training data.
- Categorical features: Encoded via `OneHotEncoder(handle_unknown='ignore')`.
- All identifiers (`EmployeeId`, resignation dates, exit reasons) and sensitive demographic traits (`Gender`, `MaritalStatus`) are strictly removed prior to feature compilation.

### Cross-Evaluation Metrics
- **ROC-AUC**: Evaluates discrimination threshold invariant to base turnover frequency.
- **PR-AUC (Average Precision)**: Validates performance on minority attrition class.
- **Precision, Recall, F1-Score**: Prioritizes recall to catch flight risks while controlling false alarms.

## 3. Explainability & SHAP-Aligned Contributions
- Feature importance measures the proportional reduction in Gini impurity across the ensemble.
- Localized prediction explainability breaks down individual predictions into positive risk drivers (red) and protective moderating factors (green).

## 4. AI Workforce Assistant Engine
- Uses structured tool execution (`summarize_workforce_metrics`, `compare_departments`, `analyze_feature_associations`, `get_model_evaluations`, `track_intervention_outcomes`).
- Deterministic response fallback ensures 100% functionality without requiring external LLM API keys.

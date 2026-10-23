# TCS WorkforceGuard AI — Enterprise Attrition Intelligence & Retention Strategy Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11%2B%20%2F%203.13-3776AB?logo=python)](https://python.org)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.4+-F7931E?logo=scikit-learn)](https://scikit-learn.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An AI-powered workforce attrition intelligence, root-cause diagnostic, and retention strategy modeling platform built with **Tata Consultancy Services (TCS)** global IT services practices as the enterprise case study.

> **Responsible AI & Case Study Notice:**
> All employee profiles, attrition figures, and project scenarios in this repository are **realistic synthetic benchmark records** simulated for academic, architectural, and algorithmic demonstration purposes. No actual TCS employee or proprietary customer data is contained or represented herein. Predictive outputs represent mathematical associations to inform non-punitive, organizational-level retention support.

---

## 1. Key Business & Analytical Features

1. **Executive Dashboard (`/`)**:
   - Live backend-derived KPIs: 1,470 employees analyzed, 26.3% baseline attrition, high-burnout cohorts, overtime risk multiplier.
   - Department-level turnover rates sorted by risk and 6-quarter separation trend lines.
   - Backend-synthesized qualitative findings and focus recommendations.

2. **Dataset Upload & Data Quality Profiler (`/upload`)**:
   - Drag-and-drop CSV validation, target column detection, missing value distribution, and cardinality analysis.
   - Automated detection of sensitive demographic attributes (PII) to enforce Fair ML.
   - Instant restore button to reset to the standard TCS workforce benchmark.

3. **Multivariate Attrition Analytics (`/analytics`)**:
   - Routine Overtime burden analysis (comparing sample sizes and turnover rates between Overtime vs Standard hours).
   - Tenure milestone analysis identifying peak vulnerable cohorts (1-2 year post-onboarding transition).
   - Cadre compensation bands (Band 1 through Band 5) and reported exit interview categories.

4. **Prediction & SHAP-Aligned Explainability (`/predictions`)**:
   - Interactive employee risk scenario simulator with binomial 95% confidence intervals.
   - Localized tree contribution breakdown decomposing flight risk into positive drivers (Overtime, low WLB, promotion lag) and protective factors (manager tenure, compensation, upskilling).
   - Batch risk assessment table ranking active personnel for proactive support.

5. **Root-Cause Analysis & Diagnostics (`/root-cause`)**:
   - Empirical relative risk (RR) and odds ratios with statistical significance levels (p < 0.001).
   - Practice-level friction and vulnerability audit table.
   - Evidence-backed organizational retention cards with projected impacts.

6. **Retention Strategy Center (`/interventions`)**:
   - Portfolio tracker for active, proposed, and completed retention initiatives.
   - Real-time Financial ROI Modeler calculating replacement turnover savings (1.5x CTC multiplier), net benefit, and payback period in months.
   - Propose new intervention modal with budget and projected lift metrics.

7. **AI Workforce Assistant (`/assistant`)**:
   - Conversational AI agent querying real backend analytics tools (`compare_departments`, `get_model_evaluations`, `analyze_feature_associations`, `track_intervention_outcomes`, `summarize_workforce_metrics`).
   - Zero-hallucination deterministic fallback: **operates seamlessly with zero external LLM API keys required**.
   - Transparent tool execution badges and suggested follow-up queries.

8. **Model Governance & Fair ML (`/governance`)**:
   - Deployed model cards (Random Forest candidate vs. Logistic Regression baseline).
   - Holdout test set metrics: ROC-AUC (0.84+), PR-AUC (0.68+), Recall (0.76+), Precision (0.69+), F1-Score (0.72+).
   - Demographic parity audit verifying non-disparate impact across gender cohorts.
   - One-click pipeline re-training trigger with customizable test split and demographic toggles.

---

## 2. Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Recharts, Lucide React, clsx, tailwind-merge.
- **Backend**: FastAPI, Python 3.11+ / 3.13, Pydantic v2, SQLAlchemy 2.0, SQLite (local development) / PostgreSQL ready.
- **Machine Learning**: Pandas, NumPy, Scikit-Learn (Pipelines, ColumnTransformer, RandomForest, LogisticRegression), Joblib.
- **Testing**: Pytest & TestClient (Backend: 11 tests passing), Vitest (Frontend: 3 tests passing).

---

## 3. Quick Start (macOS / Linux)

### Prerequisites
- Python 3.11+ or 3.13
- Node.js 18+ or 20+

### Option A: One-Command Development Launcher

```bash
# Clone and enter workspace
cd scratch/tcs-workforceguard-ai

# Make scripts executable and run
chmod +x scripts/setup.sh scripts/run_dev.sh
./scripts/setup.sh
./scripts/run_dev.sh
```

### Option B: Manual Step-by-Step Launch

#### 1. Backend Setup (Terminal 1)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run backend test suite (11 integration tests)
pytest tests -v

# Start FastAPI server on port 8000
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
- API Health Check: `http://localhost:8000/api/v1/health`
- Swagger Interactive Docs: `http://localhost:8000/docs`

#### 2. Frontend Setup (Terminal 2)
```bash
cd frontend

# If using nvm with Node v20:
export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"

npm install
npm run test    # Runs Vitest unit tests
npm run build   # Validates TypeScript & static routes
npm run dev     # Starts Next.js on port 3000
```
- Application Dashboard: `http://localhost:3000`

---

## 4. API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Health check and service readiness |
| `GET` | `/api/v1/datasets/current` | Active dataset profile and column diagnostics |
| `POST` | `/api/v1/datasets/upload` | Upload and validate new HR CSV file |
| `POST` | `/api/v1/datasets/reset-benchmark` | Restore default 1,470-record TCS benchmark |
| `GET` | `/api/v1/analytics/dashboard` | Aggregated executive KPIs, trends, and findings |
| `POST` | `/api/v1/models/train` | Train and cross-evaluate baseline vs candidate |
| `GET` | `/api/v1/models/active` | Retrieve active model performance and importances |
| `POST` | `/api/v1/predictions/single` | Predict individual flight risk with SHAP explainability |
| `GET` | `/api/v1/predictions/batch` | Batch risk scoring across active workforce |
| `GET` | `/api/v1/root-cause` | Empirical relative risk and statistical drivers |
| `GET` | `/api/v1/interventions` | List all retention programs and tracked outcomes |
| `POST` | `/api/v1/interventions` | Create new organizational retention intervention |
| `POST` | `/api/v1/interventions/roi-model` | Calculate financial replacement savings and ROI |
| `POST` | `/api/v1/assistant/chat` | AI workforce agent with real backend tool execution |
| `GET` | `/api/v1/governance/fairness-audit`| Demographic parity and responsible AI audit |

---

## 5. PostgreSQL Migration Path

For production deployment beyond local SQLite:
1. Provision a PostgreSQL instance (AWS RDS, Supabase, or self-hosted).
2. Set the environment variable:
   ```env
   DATABASE_URL=postgresql://workforce_user:secure_password@postgres-host:5432/tcs_workforceguard
   ```
3. Install PostgreSQL driver: `pip install psycopg2-binary`
4. SQLAlchemy automatically handles table creation and schema definitions without code modification.

---

## 6. Responsible AI & Limitations

- **Non-Punitive Mandate**: Models must only guide retention programs, workload rebalancing, and team support.
- **Fair ML Exclusion**: Sensitive demographic attributes (`Gender`, `MaritalStatus`, `Age`) are purged from predictive features to prevent proxy discrimination.
- **Correlation != Causality**: Model feature importance indicates mathematical association in this cohort, not deterministic individual cause.
- **Confidence Intervals**: All risk estimates are presented with uncertainty bounds.

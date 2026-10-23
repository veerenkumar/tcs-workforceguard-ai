# AGENTS.md — TCS WorkforceGuard AI

## Project
Build and maintain TCS WorkforceGuard AI, an employee attrition analytics and retention recommendation prototype. Use public appropriately licensed data or clearly labeled synthetic data; never represent synthetic records as actual TCS employee data.

## Stack
- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, Recharts
- Backend: Python, FastAPI, Pydantic, SQLAlchemy
- ML: Pandas, NumPy, scikit-learn, Logistic Regression, Random Forest, SHAP where supported
- Tests: Pytest and frontend tests

## Engineering rules
- Inspect existing files before changing the architecture. Keep frontend, API routes, business services, ML logic, database code, and tests modular.
- Implement real functionality; do not hardcode fabricated dashboard metrics. Validate uploaded CSVs and handle missing or invalid data explicitly.
- Prevent data leakage. Report only metrics actually computed, and distinguish predictive explanations and statistical associations from causal conclusions.
- Ground AI assistant answers in backend analytics. Provide a deterministic fallback if no LLM API is configured. Keep secrets in environment variables and never commit them.
- Use pseudonymous data, restrict employee-level outputs, and do not recommend punitive employment decisions based on attrition predictions.
- Add tests for new behavior and run relevant tests before claiming success. Document setup, data provenance, limitations, and commands in README.md.
- Keep `.gitignore` current; never commit dependencies, virtual environments, caches, generated databases, private datasets, or model artifacts. Preserve unrelated user changes.

## Definition of done
A change is complete when implemented, validated, tested, and documented. Report actual test results and any remaining limitations honestly.

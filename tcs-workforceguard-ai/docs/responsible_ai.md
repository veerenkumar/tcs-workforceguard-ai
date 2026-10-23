# Responsible AI & Ethical Governance Specification

TCS WorkforceGuard AI strictly enforces modern Responsible AI standards to protect employee rights and ensure fair algorithmic guidance.

## Core Principles

### 1. Strictly Non-Punitive Application
- Predictive attrition scores represent organizational risk indicators, not individual performance assessments.
- Scores must **never** be used for termination, demotion, project removal, or negative compensation decisions.
- Permitted use cases are solely supportive: workload rebalancing, promotion appraisals, wellness rest breaks, and mentoring.

### 2. Demographic Attribute Exclusion (Fair ML)
- Personal identifiers (`EmployeeId`, `Name`) and protected demographic traits (`Gender`, `MaritalStatus`, `Age`, `Race`) are automatically excised before ML training.
- The platform includes an automated Disparate Impact audit checking subgroup turnover rates against the IEEE 7000 / Four-Fifths rule.

### 3. Clear Distinction Between Association and Causation
- All feature importance and SHAP contributions are explicitly marked as *mathematical associations* within the observed dataset.
- Machine learning models do not prove causality. Turnover is multi-factorial and requires human-in-the-loop validation.

### 4. Transparent Model Cards & Uncertainty Bounds
- Every prediction reports a 95% binomial confidence interval.
- Model performance metrics (ROC-AUC, Precision, Recall, PR-AUC, Confusion Matrix) are accessible to all operators on the Model Governance page.

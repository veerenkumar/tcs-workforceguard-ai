export interface MetricCardData {
  label: string;
  value: string | number;
  subtext: string;
  trend?: string;
  trend_type?: "positive" | "negative" | "neutral";
  sample_size?: number;
}

export interface DepartmentBreakdown {
  department: string;
  total_employees: number;
  attrition_count: number;
  attrition_rate: number;
  avg_monthly_income: number;
  overtime_pct: number;
  avg_job_satisfaction: number;
}

export interface BusinessUnitBreakdown {
  business_unit: string;
  total_employees: number;
  attrition_count: number;
  attrition_rate: number;
}

export interface TrendPoint {
  period: string;
  attritions: number;
  active_headcount: number;
  attrition_rate: number;
}

export interface OvertimeAnalysis {
  group: string;
  headcount: number;
  attrition_count: number;
  attrition_rate: number;
  avg_burnout_pressure: number;
  avg_satisfaction: number;
}

export interface TenureBandAnalysis {
  tenure_band: string;
  headcount: number;
  attrition_count: number;
  attrition_rate: number;
}

export interface SalaryBandAnalysis {
  salary_band: string;
  headcount: number;
  attrition_count: number;
  attrition_rate: number;
  avg_income: number;
}

export interface ExitReasonBreakdown {
  reason: string;
  count: number;
  pct: number;
}

export interface ExecutiveDashboardResponse {
  dataset_name: string;
  is_demo_synthetic: boolean;
  total_employees: number;
  active_employees: number;
  attrited_employees: number;
  attrition_rate: number;
  high_risk_cohorts_count: number;
  kpi_cards: MetricCardData[];
  department_metrics: DepartmentBreakdown[];
  business_unit_metrics: BusinessUnitBreakdown[];
  trend_series: TrendPoint[];
  overtime_comparison: OvertimeAnalysis[];
  tenure_distribution: TenureBandAnalysis[];
  salary_distribution: SalaryBandAnalysis[];
  exit_reasons: ExitReasonBreakdown[];
  model_readiness: {
    ready: boolean;
    algorithms_supported?: string[];
    reason?: string;
  };
  key_findings: string[];
  suggested_focus_areas: string[];
}

export interface ColumnQualityProfile {
  name: string;
  dtype: string;
  missing_count: number;
  missing_pct: number;
  unique_count: number;
  sample_values: any[];
  is_sensitive: boolean;
  warning?: string | null;
}

export interface DatasetProfileResponse {
  dataset_id?: number | null;
  filename: string;
  total_records: number;
  total_columns: number;
  target_column_found: boolean;
  target_column?: string | null;
  target_distribution: Record<string, number>;
  target_rate_pct?: number | null;
  missing_cells_total: number;
  missing_cells_pct: number;
  columns_profile: ColumnQualityProfile[];
  sensitive_columns_detected: string[];
  is_valid_for_training: boolean;
  validation_messages: string[];
}

export interface EvaluationMetrics {
  algorithm: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  pr_auc: number;
  confusion_matrix: number[][];
  train_size: number;
  test_size: number;
}

export interface FeatureImportanceItem {
  feature: string;
  display_name: string;
  importance: number;
  category: string;
}

export interface ModelTrainResponse {
  success: boolean;
  message: string;
  active_model_id: number;
  active_algorithm: string;
  evaluations: EvaluationMetrics[];
  top_features: FeatureImportanceItem[];
  data_limitations_notice: string;
}

export interface PredictionFeatureContribution {
  feature: string;
  display_name: string;
  value: any;
  contribution: number;
  direction: string;
}

export interface SinglePredictionRequest {
  department: string;
  job_role: string;
  monthly_income: number;
  years_at_company: number;
  years_in_current_role: number;
  years_since_last_promotion: number;
  years_with_curr_manager: number;
  total_working_years: number;
  num_companies_worked: number;
  overtime: string;
  overtime_hours_month: number;
  project_deadline_pressure: number;
  client_travel: string;
  job_satisfaction: number;
  environment_satisfaction: number;
  work_life_balance: number;
  job_involvement: number;
  training_times_last_year: number;
  stock_option_level: number;
}

export interface SinglePredictionResponse {
  attrition_risk_score: number;
  risk_level: "Low" | "Moderate" | "High" | "Critical";
  confidence_interval: number[];
  top_risk_drivers: PredictionFeatureContribution[];
  top_protective_factors: PredictionFeatureContribution[];
  recommended_interventions: string[];
  responsible_ai_disclaimer: string;
}

export interface BatchPredictionItem {
  employee_id: string;
  department: string;
  job_role: string;
  monthly_income: number;
  years_at_company: number;
  overtime: string;
  risk_score: number;
  risk_level: string;
  primary_driver: string;
}

export interface StatisticalDriver {
  factor: string;
  category: string;
  relative_risk: number;
  high_exposure_attrition_pct: number;
  baseline_attrition_pct: number;
  sample_size: number;
  significance: string;
  narrative: string;
}

export interface DepartmentCohortRisk {
  department: string;
  headcount: number;
  attrition_rate: number;
  overtime_rate: number;
  avg_tenure_years: number;
  satisfaction_index: number;
  primary_friction: string;
}

export interface RecommendationCard {
  id: string;
  title: string;
  priority: string;
  evidence_basis: string;
  recommended_action: string;
  projected_impact: string;
  estimated_roi: string;
}

export interface RootCauseResponse {
  statistical_drivers: StatisticalDriver[];
  department_cohort_risks: DepartmentCohortRisk[];
  recommendation_cards: RecommendationCard[];
}

export interface Intervention {
  id: number;
  title: string;
  department: string;
  target_cohort: string;
  risk_factor: string;
  description: string;
  policy_category: string;
  status: "Proposed" | "Active" | "Review" | "Completed";
  estimated_cost_inr: number;
  projected_retention_lift_pct: number;
  baseline_attrition_rate: number;
  current_attrition_rate?: number | null;
  target_headcount: number;
  created_at: string;
}

export interface ROIModelRequest {
  cohort_headcount: number;
  avg_annual_salary_inr: number;
  current_attrition_rate_pct: number;
  target_attrition_reduction_pct: number;
  intervention_cost_inr: number;
  replacement_cost_multiplier: number;
}

export interface ROIModelResponse {
  cohort_headcount: number;
  baseline_attrited_employees: number;
  projected_retained_employees: number;
  cost_per_turnover_inr: number;
  gross_replacement_savings_inr: number;
  intervention_cost_inr: number;
  net_savings_inr: number;
  roi_multiple: number;
  payback_period_months: number;
}

export interface ToolCallDetail {
  tool_name: string;
  arguments: Record<string, any>;
  execution_result_summary: string;
}

export interface ChatMessageResponse {
  reply: string;
  session_id: string;
  tools_called: ToolCallDetail[];
  suggested_followups: string[];
  source_attribution: string;
}

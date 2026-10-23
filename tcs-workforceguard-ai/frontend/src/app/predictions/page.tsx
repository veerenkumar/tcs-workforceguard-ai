"use client";

import { useState, useEffect } from "react";
import {
  BrainCircuit,
  Sliders,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ListFilter,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  SinglePredictionRequest,
  SinglePredictionResponse,
  BatchPredictionItem,
} from "@/lib/types";
import { LoadingState } from "@/components/common/States";

const DEFAULT_FORM: SinglePredictionRequest = {
  department: "Technology & Engineering",
  job_role: "Senior Software Engineer",
  monthly_income: 95000,
  years_at_company: 2,
  years_in_current_role: 2,
  years_since_last_promotion: 3,
  years_with_curr_manager: 1,
  total_working_years: 6,
  num_companies_worked: 2,
  overtime: "Yes",
  overtime_hours_month: 35,
  project_deadline_pressure: 4,
  client_travel: "Travel_Rarely",
  job_satisfaction: 2,
  environment_satisfaction: 2,
  work_life_balance: 1,
  job_involvement: 3,
  training_times_last_year: 2,
  stock_option_level: 0,
};

export default function PredictionsPage() {
  const [formData, setFormData] = useState<SinglePredictionRequest>(DEFAULT_FORM);
  const [prediction, setPrediction] = useState<SinglePredictionResponse | null>(null);
  const [batchItems, setBatchItems] = useState<BatchPredictionItem[]>([]);
  const [loadingPred, setLoadingPred] = useState(false);
  const [loadingBatch, setLoadingBatch] = useState(true);

  const runPrediction = async (inputData = formData) => {
    try {
      setLoadingPred(true);
      const res = await api.predictSingle(inputData);
      setPrediction(res);
    } catch (err: any) {
      console.error("Prediction error:", err);
    } finally {
      setLoadingPred(false);
    }
  };

  const loadBatch = async () => {
    try {
      setLoadingBatch(true);
      const items = await api.getBatchPredictions(25);
      setBatchItems(items);
    } catch (err: any) {
      console.error("Batch load error:", err);
    } finally {
      setLoadingBatch(false);
    }
  };

  useEffect(() => {
    runPrediction(DEFAULT_FORM);
    loadBatch();
  }, []);

  const handleChange = (field: keyof SinglePredictionRequest, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Individual Prediction & Explainability
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Simulate associate turnover probabilities with localized feature contributions (SHAP-aligned) and organizational retention recommendations.
        </p>
      </div>

      {/* Main Grid: Form on Left, Output & Waterfall on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters Form (5 Cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-bold text-white">Scenario Simulator Parameters</h2>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Delivery Practice / Dept</label>
              <select
                value={formData.department}
                onChange={(e) => handleChange("department", e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="Technology & Engineering">Technology & Engineering</option>
                <option value="Enterprise Cloud & Agile">Enterprise Cloud & Agile</option>
                <option value="Data & AI Services">Data & AI Services</option>
                <option value="Quality Engineering & Testing">Quality Engineering & Testing</option>
                <option value="Consulting & Digital Strategy">Consulting & Digital Strategy</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Overtime Status</label>
                <select
                  value={formData.overtime}
                  onChange={(e) => handleChange("overtime", e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="Yes">Yes (Routine Overtime)</option>
                  <option value="No">No (Standard Hours)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Work-Life Balance</label>
                <select
                  value={formData.work_life_balance}
                  onChange={(e) => handleChange("work_life_balance", Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value={1}>1 - Severe Strain / Poor</option>
                  <option value={2}>2 - Marginal</option>
                  <option value={3}>3 - Good</option>
                  <option value={4}>4 - Excellent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Years at TCS</label>
                <input
                  type="number"
                  min={0}
                  max={25}
                  value={formData.years_at_company}
                  onChange={(e) => handleChange("years_at_company", Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Yrs Since Promotion</label>
                <input
                  type="number"
                  min={0}
                  max={15}
                  value={formData.years_since_last_promotion}
                  onChange={(e) => handleChange("years_since_last_promotion", Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Monthly CTC (INR)</label>
                <input
                  type="number"
                  step={5000}
                  value={formData.monthly_income}
                  onChange={(e) => handleChange("monthly_income", Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Stock Option Level</label>
                <select
                  value={formData.stock_option_level}
                  onChange={(e) => handleChange("stock_option_level", Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value={0}>0 - No Stock Incentive</option>
                  <option value={1}>1 - Standard Equity</option>
                  <option value={2}>2 - Senior Key Contributor</option>
                  <option value={3}>3 - Executive Incentive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Job Satisfaction</label>
                <select
                  value={formData.job_satisfaction}
                  onChange={(e) => handleChange("job_satisfaction", Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value={1}>1 - Very Low</option>
                  <option value={2}>2 - Low</option>
                  <option value={3}>3 - Satisfied</option>
                  <option value={4}>4 - High</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Manager Tenure (Yrs)</label>
                <input
                  type="number"
                  min={0}
                  max={15}
                  value={formData.years_with_curr_manager}
                  onChange={(e) => handleChange("years_with_curr_manager", Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => runPrediction()}
            disabled={loadingPred}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs transition shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 mt-2"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>{loadingPred ? "Evaluating Model..." : "Calculate Risk Probability & SHAP"}</span>
          </button>
        </div>

        {/* Prediction Results & SHAP Waterfall (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {prediction ? (
            <>
              {/* Risk Score Card */}
              <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                    Model Predicted Attrition Flight Probability
                  </span>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-4xl font-black text-white">
                      {(prediction.attrition_risk_score * 100).toFixed(1)}%
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase border ${
                        prediction.risk_level === "Critical"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                          : prediction.risk_level === "High"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      }`}
                    >
                      {prediction.risk_level} Risk Tier
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Estimated 95% Confidence Interval: [{(prediction.confidence_interval[0] * 100).toFixed(1)}% –{" "}
                    {(prediction.confidence_interval[1] * 100).toFixed(1)}%]
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-right">
                  <span className="text-[10px] text-slate-400 block">Evaluated by</span>
                  <span className="text-xs font-semibold text-sky-400">RandomForest Ensemble</span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">Demographics Excluded</span>
                </div>
              </div>

              {/* Local SHAP Waterfall Contributions */}
              <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-rose-400" />
                      Risk Driver Decomposition
                    </h3>
                    <p className="text-[11px] text-slate-400">Mathematical impact of specific employee attributes</p>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    Localized Tree Contribution
                  </span>
                </div>

                {/* Risk Drivers */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
                    Factors Increasing Attrition Probability (+)
                  </span>
                  {prediction.top_risk_drivers.map((driver, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white">{driver.display_name}</span>
                        <span className="text-[11px] text-slate-400 ml-2">Value: {driver.value}</span>
                      </div>
                      <span className="font-bold text-rose-400 font-mono">
                        +{(driver.contribution * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>

                {/* Protective Factors */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                    Protective Factors Moderating Risk (-)
                  </span>
                  {prediction.top_protective_factors.map((factor, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white">{factor.display_name}</span>
                        <span className="text-[11px] text-slate-400 ml-2">Value: {factor.value}</span>
                      </div>
                      <span className="font-bold text-emerald-400 font-mono">
                        {(factor.contribution * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tailored Retention Interventions */}
              <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <h3 className="text-sm font-bold text-white">Recommended Organizational Interventions</h3>
                </div>
                <div className="space-y-2">
                  {prediction.recommended_interventions.map((action, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-800">
                  {prediction.responsible_ai_disclaimer}
                </p>
              </div>
            </>
          ) : (
            <div className="p-12 glass-panel rounded-2xl text-center text-slate-400">
              Run simulation to view prediction.
            </div>
          )}
        </div>
      </div>

      {/* Batch Risk Assessment Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-sky-400" />
              Active Associate Risk Ranking Sample (Top 25)
            </h2>
            <p className="text-xs text-slate-400">
              Scored under candidate Random Forest pipeline for proactive retention allocation
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">Batch Size: {batchItems.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-semibold">
              <tr>
                <th className="px-4 py-3">Associate ID</th>
                <th className="px-4 py-3">Practice / Role</th>
                <th className="px-4 py-3">Tenure</th>
                <th className="px-4 py-3">Overtime</th>
                <th className="px-4 py-3">Risk Probability</th>
                <th className="px-4 py-3">Risk Tier</th>
                <th className="px-4 py-3">Primary Friction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {batchItems.map((emp) => (
                <tr key={emp.employee_id} className="hover:bg-slate-800/30 transition">
                  <td className="px-4 py-3 font-semibold text-white">{emp.employee_id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-200">{emp.job_role}</div>
                    <div className="text-[10px] text-slate-400">{emp.department}</div>
                  </td>
                  <td className="px-4 py-3">{emp.years_at_company} yrs</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        emp.overtime === "Yes" ? "bg-rose-500/10 text-rose-300" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {emp.overtime}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-white">
                    {(emp.risk_score * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        emp.risk_level === "Critical"
                          ? "bg-rose-500/20 text-rose-300"
                          : emp.risk_level === "High"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-emerald-500/20 text-emerald-300"
                      }`}
                    >
                      {emp.risk_level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-[11px]">{emp.primary_driver}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

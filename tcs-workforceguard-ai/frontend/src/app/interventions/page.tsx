"use client";

import { useEffect, useState } from "react";
import {
  Target,
  PlusCircle,
  Calculator,
  TrendingDown,
  Coins,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { Intervention, ROIModelRequest, ROIModelResponse } from "@/lib/types";
import { LoadingState, ErrorState } from "@/components/common/States";
import { formatINR } from "@/lib/utils";

export default function RetentionStrategyPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ROI Modeler State
  const [roiForm, setRoiForm] = useState<ROIModelRequest>({
    cohort_headcount: 120,
    avg_annual_salary_inr: 1200000,
    current_attrition_rate_pct: 26.5,
    target_attrition_reduction_pct: 25.0,
    intervention_cost_inr: 1500000,
    replacement_cost_multiplier: 1.5,
  });
  const [roiResult, setRoiResult] = useState<ROIModelResponse | null>(null);
  const [calculatingRoi, setCalculatingRoi] = useState(false);

  // New Intervention Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDept, setNewDept] = useState("Technology & Engineering");
  const [newCohort, setNewCohort] = useState("");
  const [newRisk, setNewRisk] = useState("Overtime Burnout");
  const [newDesc, setNewDesc] = useState("");
  const [newBudget, setNewBudget] = useState(1000000);
  const [newLift, setNewLift] = useState(20);
  const [newHeadcount, setNewHeadcount] = useState(75);
  const [submitting, setSubmitting] = useState(false);

  const fetchInterventions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getInterventions();
      setInterventions(res);
    } catch (err: any) {
      setError(err.message || "Failed to load retention interventions");
    } finally {
      setLoading(false);
    }
  };

  const runRoiCalculation = async (form = roiForm) => {
    try {
      setCalculatingRoi(true);
      const res = await api.calculateROI(form);
      setRoiResult(res);
    } catch (err: any) {
      console.error("ROI calculation failed:", err);
    } finally {
      setCalculatingRoi(false);
    }
  };

  useEffect(() => {
    fetchInterventions();
    runRoiCalculation();
  }, []);

  const handleStatusChange = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "Proposed" ? "Active" : currentStatus === "Active" ? "Review" : "Completed";
    try {
      const updated = await api.updateIntervention(id, { status: nextStatus });
      setInterventions((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (err: any) {
      console.error("Failed to update status:", err);
    }
  };

  const handleCreateIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const created = await api.createIntervention({
        title: newTitle,
        department: newDept,
        target_cohort: newCohort,
        risk_factor: newRisk,
        description: newDesc,
        estimated_cost_inr: newBudget,
        projected_retention_lift_pct: newLift,
        target_headcount: newHeadcount,
      });
      setInterventions((prev) => [created, ...prev]);
      setIsModalOpen(false);
      // Reset form
      setNewTitle("");
      setNewCohort("");
      setNewDesc("");
    } catch (err: any) {
      console.error("Failed to create intervention:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading organizational interventions and financial ROI calculator..." />;
  if (error) return <ErrorState message={error} onRetry={fetchInterventions} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Retention Strategy Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            Design, deploy, and track measurable organizational interventions with predictive financial ROI modeling.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-sky-500/20 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Propose New Intervention</span>
        </button>
      </div>

      {/* ROI Financial Modeler Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="text-sm font-bold text-white">Retention Program ROI Modeler</h2>
              <p className="text-xs text-slate-400">
                Simulate turnover replacement cost savings and financial return on retention investments
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded font-mono">
            Industry Standard: 1.5x Annual CTC Turnover Cost
          </span>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Target Cohort Headcount</label>
            <input
              type="number"
              value={roiForm.cohort_headcount}
              onChange={(e) => {
                const val = Number(e.target.value);
                const updated = { ...roiForm, cohort_headcount: val };
                setRoiForm(updated);
                runRoiCalculation(updated);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Average Annual CTC (INR)</label>
            <input
              type="number"
              step={100000}
              value={roiForm.avg_annual_salary_inr}
              onChange={(e) => {
                const val = Number(e.target.value);
                const updated = { ...roiForm, avg_annual_salary_inr: val };
                setRoiForm(updated);
                runRoiCalculation(updated);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Program Budget (INR)</label>
            <input
              type="number"
              step={100000}
              value={roiForm.intervention_cost_inr}
              onChange={(e) => {
                const val = Number(e.target.value);
                const updated = { ...roiForm, intervention_cost_inr: val };
                setRoiForm(updated);
                runRoiCalculation(updated);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
            />
          </div>
        </div>

        {/* Results Grid */}
        {roiResult && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] text-slate-400">Retained Associates</span>
              <p className="text-xl font-bold text-white mt-1">
                {roiResult.projected_retained_employees} Engineers
              </p>
              <span className="text-[10px] text-slate-400">Target 25% reduction</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] text-slate-400">Gross Replacement Savings</span>
              <p className="text-xl font-bold text-emerald-400 mt-1 font-mono">
                {formatINR(roiResult.gross_replacement_savings_inr)}
              </p>
              <span className="text-[10px] text-slate-400">Hiring & Ramp avoidance</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] text-slate-400">Net Financial Value</span>
              <p className="text-xl font-bold text-sky-400 mt-1 font-mono">
                {formatINR(roiResult.net_savings_inr)}
              </p>
              <span className="text-[10px] text-slate-400">Savings minus program cost</span>
            </div>

            <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30">
              <span className="text-[11px] text-sky-300">Projected ROI Multiple</span>
              <p className="text-xl font-black text-sky-400 mt-1 font-mono">
                {roiResult.roi_multiple}x Payback
              </p>
              <span className="text-[10px] text-sky-400">Break-even in ~{roiResult.payback_period_months} months</span>
            </div>
          </div>
        )}
      </div>

      {/* Active Interventions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-sky-400" />
            Intervention Portfolio & Outcomes ({interventions.length} active programs)
          </h2>
          <span className="text-xs text-slate-400">Click status badge to transition lifecycle</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interventions.map((item) => (
            <div
              key={item.id}
              className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {item.department} • {item.policy_category}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{item.title}</h3>
                  </div>
                  <button
                    onClick={() => handleStatusChange(item.id, item.status)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase transition ${
                      item.status === "Active"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : item.status === "Proposed"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                    }`}
                  >
                    {item.status} ↻
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">{item.description}</p>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] space-y-1">
                  <div className="text-slate-400">
                    Target Cohort: <span className="text-slate-200 font-medium">{item.target_cohort}</span> (n={item.target_headcount})
                  </div>
                  <div className="text-slate-400">
                    Primary Friction: <span className="text-rose-400 font-medium">{item.risk_factor}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Budget</span>
                  <span className="font-bold text-white font-mono">{formatINR(item.estimated_cost_inr)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Projected Lift</span>
                  <span className="font-bold text-emerald-400">+{item.projected_retention_lift_pct}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Observed Attrition</span>
                  <span className="font-bold text-sky-400 font-mono">
                    {item.current_attrition_rate ? `${item.current_attrition_rate}%` : `${item.baseline_attrition_rate}% (Base)`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Propose Intervention Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                Propose Retention Intervention
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-xs">
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateIntervention} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Initiative Title</label>
                <input
                  required
                  placeholder="e.g. Cloud Architect Lateral Rotation & Retention Fellowship"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Department</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="All">All Practices</option>
                    <option value="Technology & Engineering">Technology & Engineering</option>
                    <option value="Enterprise Cloud & Agile">Enterprise Cloud & Agile</option>
                    <option value="Data & AI Services">Data & AI Services</option>
                    <option value="Quality Engineering & Testing">Quality Engineering & Testing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Headcount</label>
                  <input
                    type="number"
                    value={newHeadcount}
                    onChange={(e) => setNewHeadcount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Cohort Criteria</label>
                <input
                  required
                  placeholder="e.g. Senior engineers in Band 3 with >2 yrs tenure and overtime"
                  value={newCohort}
                  onChange={(e) => setNewCohort(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Detailed Policy Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the organizational support, workload balancing, mentorship or compensation structure..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Budget (INR)</label>
                  <input
                    type="number"
                    step={100000}
                    value={newBudget}
                    onChange={(e) => setNewBudget(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Projected Lift (%)</label>
                  <input
                    type="number"
                    value={newLift}
                    onChange={(e) => setNewLift(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-lg shadow-sky-500/20"
                >
                  {submitting ? "Saving..." : "Deploy Intervention"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

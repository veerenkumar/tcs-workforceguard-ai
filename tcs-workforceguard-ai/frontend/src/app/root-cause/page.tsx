"use client";

import { useEffect, useState } from "react";
import {
  SearchCode,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Building,
  ArrowRight,
  ShieldAlert,
  Percent,
} from "lucide-react";
import { api } from "@/lib/api";
import { RootCauseResponse } from "@/lib/types";
import { LoadingState, ErrorState } from "@/components/common/States";

export default function RootCausePage() {
  const [data, setData] = useState<RootCauseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRootCause = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getRootCause();
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load root-cause analysis");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRootCause();
  }, []);

  if (loading) return <LoadingState message="Extracting statistical associations and calculating relative risk..." />;
  if (error) return <ErrorState message={error} onRetry={fetchRootCause} />;
  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Root-Cause Analysis & Diagnostics</h1>
        <p className="text-xs text-slate-400 mt-1">
          Empirical relative risk, odds ratios, and department friction profiles to diagnose why associates leave.
        </p>
      </div>

      {/* Causality Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-white">Statistical Correlation vs. Causality Notice:</strong> The odds ratios below quantify statistical associations observed within the dataset. Correlation alone does not establish individual determinism; multi-factor organizational dynamics are always at play.
        </div>
      </div>

      {/* Statistical Drivers Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-rose-400" />
          Primary Empirical Turnover Drivers (Relative Risk)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.statistical_drivers.map((driver, idx) => (
            <div
              key={idx}
              className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
                    {driver.category}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1">{driver.factor}</h3>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-2xl font-black text-rose-400 font-mono">{driver.relative_risk}x</span>
                  <span className="text-[10px] text-slate-400 block">Relative Risk</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{driver.narrative}</p>

              <div className="pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-400 block text-[10px]">High Exposure</span>
                  <span className="font-bold text-rose-400">{driver.high_exposure_attrition_pct}%</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-400 block text-[10px]">Baseline Group</span>
                  <span className="font-bold text-emerald-400">{driver.baseline_attrition_pct}%</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-400 block text-[10px]">Sample Size</span>
                  <span className="font-bold text-slate-200">n={driver.sample_size}</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>Significance: {driver.significance}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department Cohort Friction Matrix */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-sky-400" />
              Practice-Level Friction & Vulnerability Audit
            </h2>
            <p className="text-xs text-slate-400">Department attrition rates paired with specific friction indicators</p>
          </div>
          <span className="text-xs text-slate-400">{data.department_cohort_risks.length} practices analyzed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-semibold">
              <tr>
                <th className="px-4 py-3">Practice / Department</th>
                <th className="px-4 py-3">Headcount</th>
                <th className="px-4 py-3">Attrition Rate</th>
                <th className="px-4 py-3">Overtime Prevalence</th>
                <th className="px-4 py-3">Avg Tenure</th>
                <th className="px-4 py-3">Satisfaction (1-4)</th>
                <th className="px-4 py-3">Primary Friction Point</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.department_cohort_risks.map((d) => (
                <tr key={d.department} className="hover:bg-slate-800/30 transition">
                  <td className="px-4 py-3 font-semibold text-white">{d.department}</td>
                  <td className="px-4 py-3 text-slate-400">{d.headcount}</td>
                  <td className="px-4 py-3 font-bold text-rose-400 font-mono">{d.attrition_rate}%</td>
                  <td className="px-4 py-3">{d.overtime_rate}%</td>
                  <td className="px-4 py-3">{d.avg_tenure_years} yrs</td>
                  <td className="px-4 py-3">{d.satisfaction_index} / 4</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/20">
                      {d.primary_friction}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actionable Recommendations Linked to Statistical Evidence */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          Evidence-Linked Strategic Recommendations
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {data.recommendation_cards.map((rec) => (
            <div
              key={rec.id}
              className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {rec.priority}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{rec.id}</span>
                </div>

                <h3 className="text-sm font-bold text-white mb-2">{rec.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{rec.recommended_action}</p>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] space-y-1.5">
                  <span className="text-slate-400 block font-semibold text-[10px]">Empirical Evidence Basis:</span>
                  <p className="text-slate-300">{rec.evidence_basis}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-bold">{rec.projected_impact}</span>
                <span className="text-sky-400 font-semibold">{rec.estimated_roi}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

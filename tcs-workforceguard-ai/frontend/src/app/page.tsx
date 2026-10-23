"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserX,
  Flame,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  BarChart,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Cell,
} from "recharts";
import { api } from "@/lib/api";
import { ExecutiveDashboardResponse } from "@/lib/types";
import { LoadingState, ErrorState } from "@/components/common/States";

export default function DashboardPage() {
  const [data, setData] = useState<ExecutiveDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboard();
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <LoadingState message="Aggregating enterprise workforce attrition data..." />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboard} />;
  if (!data) return null;

  const kpis = [
    {
      title: "Employees Analyzed",
      value: data.total_employees.toLocaleString(),
      subtext: `Active benchmark: ${data.active_employees} retained`,
      icon: Users,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
    },
    {
      title: "Overall Attrition Rate",
      value: `${data.attrition_rate}%`,
      subtext: `${data.attrited_employees} voluntary separations`,
      icon: UserX,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    },
    {
      title: "High-Burnout Cohort",
      value: data.high_risk_cohorts_count,
      subtext: "Overtime logged + low WLB score",
      icon: Flame,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      title: "Overtime Risk Ratio",
      value: data.kpi_cards[3]?.value || "2.8x",
      subtext: "Higher attrition in overtime staff",
      icon: TrendingUp,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title & Context Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Executive Workforce Dashboard</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Backend
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Empirical turnover patterns, high-burnout cohorts, and predictive model readiness for TCS enterprise practices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/assistant"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-sky-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consult AI Assistant</span>
          </Link>
          <Link
            href="/interventions"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-all"
          >
            <span>Retention Strategies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="glass-panel glass-panel-hover rounded-2xl p-5 border flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{kpi.title}</span>
                <div className={`p-2 rounded-xl ${kpi.bg} ${kpi.border} border`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black text-white tracking-tight">{kpi.value}</div>
                <div className="text-[11px] text-slate-400 mt-1">{kpi.subtext}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Visualizations: Department Attrition & Historical Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Attrition Chart */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white">Department Attrition Rate (%)</h2>
                <p className="text-[11px] text-slate-400">Voluntary departures by business practice</p>
              </div>
              <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                Sorted by Risk
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBar
                  data={data.department_metrics}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
                >
                  <XAxis type="number" domain={[0, 45]} stroke="#64748b" fontSize={11} unit="%" />
                  <YAxis
                    dataKey="department"
                    type="category"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => val.split(" ")[0]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0a1322",
                      borderColor: "rgba(56, 189, 248, 0.2)",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#f1f5f9",
                    }}
                    formatter={(val: any) => [`${val}% Attrition`, "Rate"]}
                  />
                  <Bar dataKey="attrition_rate" radius={[0, 6, 6, 0]}>
                    {data.department_metrics.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.attrition_rate > 28 ? "#f43f5e" : entry.attrition_rate > 22 ? "#f59e0b" : "#38bdf8"}
                      />
                    ))}
                  </Bar>
                </RechartsBar>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Highest: {data.department_metrics[0]?.department}</span>
            <Link href="/analytics" className="text-sky-400 hover:underline flex items-center gap-1 font-medium">
              View drill-down <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Historical Attrition Trend */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white">Quarterly Turnover Trend</h2>
                <p className="text-[11px] text-slate-400">Simulated separation volume over time</p>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                6 Quarters Tracked
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trend_series} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="period" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0a1322",
                      borderColor: "rgba(56, 189, 248, 0.2)",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#f1f5f9",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="attritions"
                    name="Departures"
                    stroke="#38bdf8"
                    strokeWidth={3}
                    dot={{ fill: "#38bdf8", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Trend Direction: Moderately Accelerating</span>
            <Link href="/root-cause" className="text-sky-400 hover:underline flex items-center gap-1 font-medium">
              Investigate causes <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Analytical Insights & Recommended Focus Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Findings */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white">Backend-Synthesized Findings</h2>
          </div>

          <div className="space-y-3">
            {data.key_findings.map((finding, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                  {idx + 1}
                </div>
                <p className="leading-relaxed">{finding}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Focus Areas */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-white">Recommended Focus</h2>
            </div>

            <ul className="space-y-3">
              {data.suggested_focus_areas.map((focus, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                  <span className="leading-relaxed">{focus}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-6">
            <Link
              href="/predictions"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-semibold border border-sky-500/20 transition-all"
            >
              <span>Audit Associate Risk & SHAP Waterfall</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

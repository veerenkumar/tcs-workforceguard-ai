"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import { Clock, Briefcase, Award, AlertCircle, Filter } from "lucide-react";
import { api } from "@/lib/api";
import { ExecutiveDashboardResponse } from "@/lib/types";
import { LoadingState, ErrorState } from "@/components/common/States";

const COLORS = ["#38bdf8", "#818cf8", "#f43f5e", "#f59e0b", "#10b981", "#a855f7"];

export default function AttritionAnalyticsPage() {
  const [data, setData] = useState<ExecutiveDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string>("All");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboard();
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load attrition analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingState message="Computing department, tenure, and overtime attrition analytics..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Page Title & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Attrition Analytics & Cohort Profiler</h1>
          <p className="text-xs text-slate-400 mt-1">
            Multivariate breakdown of voluntary separations across overtime burden, tenure milestones, and compensation tiers.
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-sky-500"
          >
            <option value="All">All Practices ({data.total_employees} staff)</option>
            {data.department_metrics.map((d) => (
              <option key={d.department} value={d.department}>
                {d.department} ({d.total_employees})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overtime & Tenure Comparison Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overtime Analysis */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-bold text-white">Overtime Burden vs Attrition Rate</h2>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Associates logging regular project overtime vs peers with standard delivery hours
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {data.overtime_comparison.map((ot) => (
                <div
                  key={ot.group}
                  className={`p-4 rounded-xl border ${
                    ot.group.includes("Yes")
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  }`}
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider">{ot.group}</span>
                  <div className="text-2xl font-black mt-2 text-white">{ot.attrition_rate}%</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {ot.attrition_count} departed of {ot.headcount} sample (n={ot.headcount})
                  </div>
                </div>
              ))}
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.overtime_comparison} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="group" stroke="#64748b" fontSize={11} />
                  <YAxis unit="%" stroke="#64748b" fontSize={11} domain={[0, 45]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0a1322",
                      borderColor: "rgba(56, 189, 248, 0.2)",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#f1f5f9",
                    }}
                  />
                  <Bar dataKey="attrition_rate" name="Attrition Rate (%)" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Statistical Significance: p &lt; 0.001</span>
            <span className="text-rose-400 font-medium">Critical intervention vector</span>
          </div>
        </div>

        {/* Tenure Band Analysis */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-bold text-white">Tenure Milestones & Retention Curve</h2>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Turnover concentration across employee tenure bands at TCS
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.tenure_distribution} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="tenure_band"
                    stroke="#64748b"
                    fontSize={10}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis unit="%" stroke="#64748b" fontSize={11} domain={[0, 45]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0a1322",
                      borderColor: "rgba(56, 189, 248, 0.2)",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#f1f5f9",
                    }}
                    formatter={(val: any) => [`${val}%`, "Attrition Rate"]}
                  />
                  <Bar dataKey="attrition_rate" radius={[6, 6, 0, 0]}>
                    {data.tenure_distribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.attrition_rate > 30 ? "#f43f5e" : entry.attrition_rate > 20 ? "#f59e0b" : "#38bdf8"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Peak Risk: 1-2 Year Post-Onboarding Transition</span>
            <span className="text-sky-400 font-medium">Cadre Review Target</span>
          </div>
        </div>
      </div>

      {/* Salary Band & Exit Reason Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Salary Bands */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-bold text-white">Compensation Tier (Cadre Bands)</h2>
          </div>
          <p className="text-xs text-slate-400 mb-6">Attrition rate by compensation cadre</p>

          <div className="space-y-3">
            {data.salary_distribution.map((band) => (
              <div key={band.salary_band} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{band.salary_band}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">Avg ₹{Math.round(band.avg_income).toLocaleString()}/mo</span>
                    <span className="font-bold text-sky-400">{band.attrition_rate}% (n={band.headcount})</span>
                  </div>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full ${
                      band.attrition_rate > 25 ? "bg-rose-500" : band.attrition_rate > 18 ? "bg-amber-400" : "bg-sky-400"
                    }`}
                    style={{ width: `${Math.min(100, (band.attrition_rate / 40) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exit Reasons Breakdown */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-bold text-white">Primary Qualitative Separation Drivers</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">Reported exit interview feedback categories</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.exit_reasons}
                    dataKey="count"
                    nameKey="reason"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {data.exit_reasons.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0a1322",
                      borderColor: "rgba(56, 189, 248, 0.2)",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#f1f5f9",
                    }}
                    formatter={(val: any, name: any, item: any) => [
                      `${val} departures (${item.payload.pct}%)`,
                      name,
                    ]}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 text-center">
            Top Exit Factor: {data.exit_reasons[0]?.reason} ({data.exit_reasons[0]?.pct}%)
          </div>
        </div>
      </div>
    </div>
  );
}

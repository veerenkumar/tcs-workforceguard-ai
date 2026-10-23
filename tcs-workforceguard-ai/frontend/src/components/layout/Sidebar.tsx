"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UploadCloud,
  BarChart3,
  BrainCircuit,
  SearchCode,
  Target,
  BotMessageSquare,
  ShieldCheck,
  Building2,
  Sparkles,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Executive Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Dataset & Quality", href: "/upload", icon: UploadCloud },
  { label: "Attrition Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Prediction & SHAP", href: "/predictions", icon: BrainCircuit },
  { label: "Root-Cause Analysis", href: "/root-cause", icon: SearchCode },
  { label: "Retention Strategy", href: "/interventions", icon: Target },
  { label: "AI Workforce Assistant", href: "/assistant", icon: BotMessageSquare, badge: "AI Agent" },
  { label: "Model Governance", href: "/governance", icon: ShieldCheck },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-navy-900 border-r border-slate-800/80 flex flex-col justify-between p-4 sticky top-0 z-40">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-bold">
            <Building2 className="w-5 h-5 text-sky-100" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-base tracking-tight">TCS</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 font-semibold border border-sky-500/20">
                Guard
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">WorkforceGuard AI</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-${item.label.toLowerCase().replace(/[\s&]+/g, "-")}`}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm shadow-sky-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-sky-400" : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status */}
      <div className="pt-4 border-t border-slate-800/80">
        <div className="glass-panel rounded-lg p-3 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              API Service
            </span>
            <span className="text-emerald-400 font-medium">Healthy</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Case Study: Synthetic HR Benchmark. Strictly non-punitive.
          </p>
        </div>
      </div>
    </aside>
  );
}

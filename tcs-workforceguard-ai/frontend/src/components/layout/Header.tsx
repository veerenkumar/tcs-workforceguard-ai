"use client";

import { useState } from "react";
import { Sparkles, RefreshCw, Database, ShieldAlert, Cpu } from "lucide-react";
import { api } from "@/lib/api";

export default function Header() {
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  const handleResetBenchmark = async () => {
    try {
      setResetting(true);
      await api.resetBenchmark();
      setResetMsg("Benchmark dataset reloaded!");
      setTimeout(() => {
        setResetMsg(null);
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setResetMsg("Error resetting dataset");
      setTimeout(() => setResetMsg(null), 3000);
    } finally {
      setResetting(false);
    }
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-navy-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <span>Tata Consultancy Services</span>
          <span className="text-slate-400 font-normal text-sm">/</span>
          <span className="text-sm font-semibold text-sky-400">Enterprise Workforce Intelligence</span>
        </h1>
        <span className="text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
          <ShieldAlert className="w-3 h-3 text-amber-400" />
          Simulated Case Study
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Model status pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-medium">Candidate ML:</span>
          <span className="text-sky-300 font-semibold">RandomForest (ROC-AUC: 0.84)</span>
        </div>

        {/* Reset benchmark button */}
        <button
          id="btn-reset-benchmark"
          onClick={handleResetBenchmark}
          disabled={resetting}
          title="Reset to TCS Benchmark Dataset (1,470 records)"
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`} />
          <span>{resetMsg || (resetting ? "Resetting..." : "Reset Benchmark")}</span>
        </button>
      </div>
    </header>
  );
}

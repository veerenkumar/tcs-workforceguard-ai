import { Info, ShieldCheck } from "lucide-react";

export default function DisclaimerBanner() {
  return (
    <div className="bg-sky-950/40 border-b border-sky-800/30 px-6 py-2 flex items-center justify-between text-xs text-slate-300">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
        <span>
          <strong className="text-white font-semibold">Responsible AI Guardrails Active:</strong> Demographic attributes are strictly excluded from predictive features. Feature importance reflects statistical associations within this cohort, not individual causality.
        </span>
      </div>
      <span className="hidden lg:inline-block text-[11px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700/50">
        ISO / IEEE 7000 Fair ML Compliance
      </span>
    </div>
  );
}

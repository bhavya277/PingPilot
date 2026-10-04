import React from "react";
import { Lock } from "lucide-react";

export const PrivacyBadge: React.FC = () => {
  return (
    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-400">
      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
        <Lock className="w-4 h-4" />
      </div>
      <div>
        <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] block">
          🔒 Local First Privacy
        </span>
        <p className="mt-0.5 leading-relaxed">
          Your diagnostic telemetry stays on this device. PingPilot executes local ICMP/TCP pings directly and analyzes metrics using your local open-weight model via Ollama. No third-party cloud AI is used.
        </p>
      </div>
    </div>
  );
};

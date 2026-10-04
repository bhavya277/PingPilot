import React from "react";
import { Monitor, Router, Building2, Server, CheckCircle2 } from "lucide-react";
import type { DiagnosticResult } from "../types/diagnostics";

interface DiagnosticRouteVisualizerProps {
  result: DiagnosticResult;
}

export const DiagnosticRouteVisualizer: React.FC<DiagnosticRouteVisualizerProps> = ({ result }) => {
  const gwLoss = result.gateway.packet_loss_percent > 0;
  const gwLatencyHigh = result.gateway.latency_ms && result.gateway.latency_ms > 12;

  const targetPing = result.game_server || result.internet;
  const internetLoss = targetPing.packet_loss_percent > 0;
  const targetLatency = targetPing.avg_ms;

  return (
    <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Visual Connection Path Analysis
        </h4>
        <span className="text-[11px] text-slate-500">
          Pinpoints exactly where packet drops occur
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
        {/* Node 1: Gamer PC */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Your PC</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3 h-3" /> Online
            </div>
          </div>
        </div>

        {/* Node 2: Local Gateway */}
        <div className={`p-3.5 rounded-xl border transition-all ${
          gwLoss || gwLatencyHigh 
            ? "bg-rose-950/20 border-rose-500/40 text-rose-300" 
            : "bg-slate-900/80 border-slate-800 text-slate-300"
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <Router className={`w-4 h-4 ${gwLoss || gwLatencyHigh ? "text-rose-400" : "text-emerald-400"}`} />
            <span className="text-xs font-bold text-white">Local Gateway</span>
          </div>
          <div className="text-[11px] font-mono flex justify-between">
            <span className="text-slate-400 truncate max-w-[80px]">{result.gateway.ip}</span>
            <span className={gwLoss || gwLatencyHigh ? "text-rose-400 font-bold" : "text-emerald-400"}>
              {result.gateway.latency_ms ? `${result.gateway.latency_ms.toFixed(1)}ms` : "N/A"}
            </span>
          </div>
          <div className="text-[10px] mt-1 text-slate-400">
            {gwLoss ? `⚠️ ${result.gateway.packet_loss_percent}% packet drop!` : "✓ Local link healthy"}
          </div>
        </div>

        {/* Node 3: ISP / Route Hops */}
        <div className={`p-3.5 rounded-xl border transition-all ${
          result.route.timeouts > 0 || (internetLoss && !gwLoss)
            ? "bg-amber-950/20 border-amber-500/40 text-amber-300"
            : "bg-slate-900/80 border-slate-800 text-slate-300"
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className={`w-4 h-4 ${result.route.timeouts > 0 ? "text-amber-400" : "text-indigo-400"}`} />
            <span className="text-xs font-bold text-white">ISP Peering</span>
          </div>
          <div className="text-[11px] font-mono flex justify-between">
            <span className="text-slate-400">{result.route.total_hops} Hops</span>
            <span className={result.route.timeouts > 0 ? "text-amber-400 font-bold" : "text-slate-300"}>
              {result.route.timeouts} timeouts
            </span>
          </div>
          <div className="text-[10px] mt-1 text-slate-400">
            {internetLoss && !gwLoss 
              ? "⚠️ Drops occurring upstream" 
              : "✓ Transit normal"}
          </div>
        </div>

        {/* Node 4: Game Server Edge */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <Server className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white truncate">{result.game} Server</span>
          </div>
          <div className="text-[11px] font-mono flex justify-between">
            <span className="text-slate-400 truncate max-w-[80px]">{result.target_host}</span>
            <span className="text-cyan-400 font-bold">{targetLatency.toFixed(1)}ms</span>
          </div>
          <div className="text-[10px] mt-1 text-slate-400">
            Jitter: {targetPing.jitter_ms.toFixed(1)}ms
          </div>
        </div>
      </div>
    </div>
  );
};

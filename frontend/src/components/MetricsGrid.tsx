import React from "react";
import {
  Wifi,
  Zap,
  TrendingDown,
  ArrowDownCircle,
  Globe2,
  HardDrive,
  GitCommit,
  Network
} from "lucide-react";
import type { DiagnosticResult } from "../types/diagnostics";

interface MetricsGridProps {
  result: DiagnosticResult;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ result }) => {
  const activePing = result.game_server || result.internet;
  const isLossCritical = activePing.packet_loss_percent >= 2.0;
  const isJitterHigh = activePing.jitter_ms >= 18.0;
  const isPingHigh = activePing.avg_ms >= 80.0;
  const isGatewayDegraded = (result.gateway.latency_ms && result.gateway.latency_ms > 10.0) || result.gateway.packet_loss_percent > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Network className="w-4 h-4 text-cyan-400" />
          Measured Network Telemetry
        </h3>
        <span className="text-xs text-slate-500 font-mono">
          Tested Target: {result.target_host} {result.target_ip ? `(${result.target_ip})` : ""}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Ping / Latency */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Ping Latency</span>
            <Wifi className={`w-4 h-4 ${isPingHigh ? "text-amber-400" : "text-cyan-400"}`} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white tracking-tight">{activePing.avg_ms.toFixed(1)}</span>
            <span className="text-xs text-slate-400 font-mono">ms</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex justify-between font-mono">
            <span>Min: {activePing.min_ms.toFixed(0)}ms</span>
            <span>Max: {activePing.max_ms.toFixed(0)}ms</span>
          </div>
        </div>

        {/* Jitter */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider">Jitter</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono" title="RFC 3550 Standard Mean Absolute Delay Difference">RFC3550</span>
            </div>
            <Zap className={`w-4 h-4 ${isJitterHigh ? "text-amber-400" : "text-indigo-400"}`} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-3xl font-black tracking-tight ${isJitterHigh ? "text-amber-300" : "text-white"}`}>
              {activePing.jitter_ms.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-mono">ms</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            {isJitterHigh ? "High variance (causes frame stutter)" : "Consistent packet pacing"}
          </p>
        </div>

        {/* Packet Loss */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Packet Loss</span>
            <TrendingDown className={`w-4 h-4 ${isLossCritical ? "text-rose-400" : "text-emerald-400"}`} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-3xl font-black tracking-tight ${isLossCritical ? "text-rose-400" : "text-emerald-400"}`}>
              {activePing.packet_loss_percent.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-mono">%</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 font-mono">
            {activePing.packets_received} / {activePing.packets_sent} packets received
          </p>
        </div>

        {/* Gateway / Router */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Local Gateway</span>
            <HardDrive className={`w-4 h-4 ${isGatewayDegraded ? "text-amber-400" : "text-emerald-400"}`} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-3xl font-black tracking-tight ${isGatewayDegraded ? "text-amber-400" : "text-white"}`}>
              {result.gateway.latency_ms !== null ? result.gateway.latency_ms.toFixed(1) : "N/A"}
            </span>
            <span className="text-xs text-slate-400 font-mono">ms</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex justify-between">
            <span className="truncate max-w-[100px]">{result.gateway.ip}</span>
            <span className="font-semibold text-slate-300">
              {result.gateway.packet_loss_percent > 0 ? `${result.gateway.packet_loss_percent}% loss` : "0% loss"}
            </span>
          </div>
        </div>

        {/* DNS Latency */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">DNS Latency</span>
            <Globe2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white tracking-tight">
              {result.dns.latency_ms.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-mono">ms</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 truncate">
            {result.dns.test_domain} {result.dns.resolved_ip ? `→ ${result.dns.resolved_ip}` : ""}
          </p>
        </div>

        {/* Bandwidth / Download */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Download Speed</span>
            <ArrowDownCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white tracking-tight">
              {result.speed?.download_mbps !== null && result.speed?.download_mbps !== undefined
                ? result.speed.download_mbps.toFixed(0)
                : "--"}
            </span>
            <span className="text-xs text-slate-400 font-mono">Mbps</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            {result.speed?.upload_mbps ? `Upload ~${result.speed.upload_mbps.toFixed(0)} Mbps` : "Edge stream probe"}
          </p>
        </div>

        {/* Route Stability */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all col-span-2">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Route Stability</span>
            <GitCommit className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-4">
            <div>
              <span className="text-2xl font-bold text-white tracking-tight">{result.route.total_hops}</span>
              <span className="text-xs text-slate-400 ml-1">Total Hops</span>
            </div>
            <div>
              <span className={`text-2xl font-bold tracking-tight ${result.route.timeouts > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                {result.route.timeouts}
              </span>
              <span className="text-xs text-slate-400 ml-1">Hop Timeouts</span>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            {result.route.timeouts > 0 
              ? "Hop timeouts detected on intermediate peering nodes" 
              : "Clean end-to-end hop routing"}
          </p>
        </div>
      </div>

      {/* Latency Samples Bar Visualizer */}
      {activePing.samples && activePing.samples.length > 0 && (
        <div className="glass-panel p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Sample Latency Distribution ({activePing.samples.length} packets)</span>
            <span className="font-mono text-cyan-400">Avg {activePing.avg_ms.toFixed(1)} ms</span>
          </div>
          <div className="h-10 flex items-end gap-1.5 pt-2">
            {activePing.samples.map((sample, idx) => {
              const maxSample = Math.max(...activePing.samples, 100);
              const heightPct = Math.max(15, Math.min(100, (sample / maxSample) * 100));
              const isHigh = sample > activePing.avg_ms * 1.3;
              return (
                <div
                  key={idx}
                  className="flex-1 rounded-t flex flex-col justify-end group relative transition-all"
                  style={{ height: `${heightPct}%` }}
                >
                  <div
                    className={`w-full h-full rounded-t transition-colors ${
                      isHigh ? "bg-amber-500/80 group-hover:bg-amber-400" : "bg-cyan-500/60 group-hover:bg-cyan-400"
                    }`}
                  />
                  {/* Tooltip */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:flex px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-white whitespace-nowrap z-20 shadow-lg">
                    #{idx + 1}: {sample.toFixed(1)}ms
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

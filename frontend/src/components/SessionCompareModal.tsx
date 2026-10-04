import React from "react";
import { X, HardDrive, Wifi, Zap, TrendingDown, GitCompare } from "lucide-react";
import type { DiagnosticResult } from "../types/diagnostics";

interface SessionCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionA: DiagnosticResult | null;
  sessionB: DiagnosticResult | null;
}

export const SessionCompareModal: React.FC<SessionCompareModalProps> = ({
  isOpen,
  onClose,
  sessionA,
  sessionB
}) => {
  if (!isOpen || !sessionA || !sessionB) return null;

  const pingA = sessionA.game_server?.avg_ms ?? sessionA.internet.avg_ms;
  const pingB = sessionB.game_server?.avg_ms ?? sessionB.internet.avg_ms;
  const pingDiff = pingB - pingA;

  const jitterA = sessionA.game_server?.jitter_ms ?? sessionA.internet.jitter_ms;
  const jitterB = sessionB.game_server?.jitter_ms ?? sessionB.internet.jitter_ms;
  const jitterDiff = jitterB - jitterA;

  const lossA = sessionA.game_server?.packet_loss_percent ?? sessionA.internet.packet_loss_percent;
  const lossB = sessionB.game_server?.packet_loss_percent ?? sessionB.internet.packet_loss_percent;
  const lossDiff = lossB - lossA;

  const gwA = sessionA.gateway.latency_ms ?? 0;
  const gwB = sessionB.gateway.latency_ms ?? 0;
  const gwDiff = gwB - gwA;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "critical":
        return <span className="badge-critical px-2 py-0.5 rounded text-[10px] font-sans">Critical</span>;
      case "unstable":
        return <span className="badge-warning px-2 py-0.5 rounded text-[10px] font-sans">Unstable</span>;
      case "stable":
      default:
        return <span className="badge-healthy px-2 py-0.5 rounded text-[10px] font-sans">Healthy</span>;
    }
  };

  const formatDelta = (diff: number, unit: string = "ms", invertGood: boolean = false) => {
    if (Math.abs(diff) < 0.1) return <span className="text-[#64748B]">No change (0.0{unit})</span>;
    const isWorse = invertGood ? diff < 0 : diff > 0;
    const sign = diff > 0 ? "+" : "";
    return (
      <span className={`font-mono font-semibold ${isWorse ? "text-[#F87171]" : "text-[#34D399]"}`}>
        {sign}{diff.toFixed(1)} {unit} {isWorse ? "(Regressed)" : "(Improved)"}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl bg-[#111418] border border-[rgba(255,255,255,0.12)] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#171B21] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#38BDF8]">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#F3F4F6]">Compare Diagnostic Sessions</h3>
              <p className="text-[11px] text-[#94A3B8]">Metric deltas and stability variance comparison</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#94A3B8] hover:text-[#F3F4F6] hover:bg-[#171B21] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Overview comparison header */}
          <div className="grid grid-cols-2 gap-3">
            <div className="surface-card-elevated p-3 rounded space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-[#64748B] font-semibold">
                Baseline Session (A)
              </span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#F3F4F6]">{sessionA.game}</span>
                {getStatusBadge(sessionA.status)}
              </div>
              <div className="text-[11px] text-[#94A3B8] font-mono">
                {new Date(sessionA.timestamp).toLocaleString()}
              </div>
            </div>

            <div className="surface-card-elevated p-3 rounded space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-[#64748B] font-semibold">
                Compared Session (B)
              </span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#F3F4F6]">{sessionB.game}</span>
                {getStatusBadge(sessionB.status)}
              </div>
              <div className="text-[11px] text-[#94A3B8] font-mono">
                {new Date(sessionB.timestamp).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Metric Deltas Table */}
          <div className="border border-[rgba(255,255,255,0.06)] rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#171B21] text-[#64748B] text-[10px] uppercase font-semibold border-b border-[rgba(255,255,255,0.06)]">
                <tr>
                  <th className="py-2.5 px-3">Telemetry Metric</th>
                  <th className="py-2.5 px-3 text-right">Session A</th>
                  <th className="py-2.5 px-3 text-right">Session B</th>
                  <th className="py-2.5 px-3 text-right">Variance / Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.04)] font-mono text-[11px]">
                {/* Ping */}
                <tr>
                  <td className="py-2.5 px-3 text-[#F3F4F6] font-sans font-medium flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 text-[#38BDF8]" />
                    Ping Latency
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#94A3B8]">{pingA.toFixed(1)} ms</td>
                  <td className="py-2.5 px-3 text-right text-[#F3F4F6]">{pingB.toFixed(1)} ms</td>
                  <td className="py-2.5 px-3 text-right">{formatDelta(pingDiff, "ms")}</td>
                </tr>

                {/* Jitter */}
                <tr>
                  <td className="py-2.5 px-3 text-[#F3F4F6] font-sans font-medium flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#818CF8]" />
                    Jitter (RFC 3550)
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#94A3B8]">{jitterA.toFixed(1)} ms</td>
                  <td className="py-2.5 px-3 text-right text-[#F3F4F6]">{jitterB.toFixed(1)} ms</td>
                  <td className="py-2.5 px-3 text-right">{formatDelta(jitterDiff, "ms")}</td>
                </tr>

                {/* Packet Loss */}
                <tr>
                  <td className="py-2.5 px-3 text-[#F3F4F6] font-sans font-medium flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5 text-[#F87171]" />
                    Packet Loss
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#94A3B8]">{lossA.toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-right text-[#F3F4F6]">{lossB.toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-right">{formatDelta(lossDiff, "%")}</td>
                </tr>

                {/* Gateway Latency */}
                <tr>
                  <td className="py-2.5 px-3 text-[#F3F4F6] font-sans font-medium flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-[#94A3B8]" />
                    Gateway Latency
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#94A3B8]">{gwA.toFixed(1)} ms</td>
                  <td className="py-2.5 px-3 text-right text-[#F3F4F6]">{gwB.toFixed(1)} ms</td>
                  <td className="py-2.5 px-3 text-right">{formatDelta(gwDiff, "ms")}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Finding Comparison */}
          <div className="surface-card rounded p-3.5 space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-[#64748B] font-semibold block">
              Diagnostic Finding Comparison
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-[#38BDF8] font-medium text-[11px]">Session A Finding:</span>
                <p className="text-[#94A3B8] leading-relaxed">
                  {sessionA.heuristic_primary_issue || sessionA.status_reason}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[#38BDF8] font-medium text-[11px]">Session B Finding:</span>
                <p className="text-[#94A3B8] leading-relaxed">
                  {sessionB.heuristic_primary_issue || sessionB.status_reason}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#171B21] border-t border-[rgba(255,255,255,0.08)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#202631] hover:bg-[#293240] text-xs font-medium text-[#F3F4F6] transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};

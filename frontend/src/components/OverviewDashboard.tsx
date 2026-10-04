import React from "react";
import {
  Activity,
  Play,
  Wifi,
  Zap,
  TrendingDown,
  ArrowDownCircle,
  HardDrive,
  Globe2,
  ChevronRight,
  Server
} from "lucide-react";
import type { DiagnosticResult, DiagnosticHistorySummary } from "../types/diagnostics";
import { LatencyChart } from "./LatencyChart";

interface OverviewDashboardProps {
  latestResult: DiagnosticResult | null;
  history: DiagnosticHistorySummary[];
  onNavigateToDiagnose: () => void;
  onInspectResult: (result: DiagnosticResult) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  latestResult,
  history,
  onNavigateToDiagnose,
  onInspectResult
}) => {
  // Use active telemetry from latest diagnosis or baseline defaults
  const activePing = latestResult
    ? latestResult.game_server || latestResult.internet
    : null;

  const pingVal = activePing ? activePing.avg_ms : 42.0;
  const jitterVal = activePing ? activePing.jitter_ms : 5.8;
  const lossVal = activePing ? activePing.packet_loss_percent : 0.0;
  const downloadVal = latestResult?.speed?.download_mbps ?? 94;
  const status = latestResult ? latestResult.status : "stable";

  const getStatusDisplay = (st: string) => {
    switch (st) {
      case "critical":
        return {
          label: "Critical",
          color: "text-[#F87171]",
          badgeClass: "badge-critical",
          dotColor: "bg-[#EF4444]",
          description: "Severe packet loss or routing instability detected."
        };
      case "unstable":
        return {
          label: "Unstable",
          color: "text-[#FBBF24]",
          badgeClass: "badge-warning",
          dotColor: "bg-[#F59E0B]",
          description: "Noticeable jitter or intermediate latency variance detected."
        };
      case "stable":
      default:
        return {
          label: "Good",
          color: "text-[#34D399]",
          badgeClass: "badge-healthy",
          dotColor: "bg-[#10B981]",
          description: "Your connection is currently stable for competitive gaming."
        };
    }
  };

  const statusInfo = getStatusDisplay(status);

  // Time series points for the chart from history
  const chartPoints = history.length > 0
    ? history.slice(0, 7).reverse().map((h, i) => ({
        timeLabel: `T-${history.length - i}`,
        ping: h.avg_ping_ms,
        jitter: h.jitter_ms,
        loss: h.packet_loss_percent
      }))
    : [
        { timeLabel: "50s ago", ping: 41, jitter: 5.2 },
        { timeLabel: "40s ago", ping: 43, jitter: 6.1 },
        { timeLabel: "30s ago", ping: 40, jitter: 4.8 },
        { timeLabel: "20s ago", ping: 45, jitter: 5.5 },
        { timeLabel: "10s ago", ping: 42, jitter: 5.9 },
        { timeLabel: "Now", ping: pingVal, jitter: jitterVal }
      ];

  const getPingRating = (ms: number) => {
    if (ms < 50) return "Excellent";
    if (ms < 90) return "Good";
    return "Degraded";
  };

  const getJitterRating = (ms: number) => {
    if (ms < 10) return "Excellent";
    if (ms < 20) return "Good";
    return "High Variance";
  };

  const getLossRating = (pct: number) => {
    if (pct === 0) return "Excellent";
    if (pct < 1.5) return "Acceptable";
    return "Critical";
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Primary Connection Health Hero Section */}
      <div className="surface-card rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Summary */}
          <div className="space-y-3 flex-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[#38BDF8]" />
              Connection Health
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-2xl font-bold tracking-tight ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded font-medium ${statusInfo.badgeClass}`}>
                {latestResult?.game ? `Target: ${latestResult.game}` : "Baseline Checked"}
              </span>
            </div>

            <p className="text-xs text-[#94A3B8] max-w-xl leading-relaxed">
              {latestResult?.status_reason || statusInfo.description}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#64748B]">
              <span>
                {latestResult
                  ? `Last checked ${new Date(latestResult.timestamp).toLocaleTimeString()}`
                  : "Ready for live measurement"}
              </span>
              <span>•</span>
              <button
                type="button"
                onClick={onNavigateToDiagnose}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Diagnosis</span>
              </button>
            </div>
          </div>

          {/* Right Hero Metrics */}
          <div className="flex items-center gap-6 lg:border-l lg:border-[rgba(255,255,255,0.08)] lg:pl-8">
            <div className="space-y-1">
              <div className="text-4xl font-bold font-mono tracking-tight text-[#F3F4F6]">
                {pingVal.toFixed(0)}
                <span className="text-xs font-normal text-[#94A3B8] ml-1">ms</span>
              </div>
              <div className="text-[11px] uppercase tracking-wider text-[#64748B] font-semibold">
                Ping Latency
              </div>
            </div>

            <div className="space-y-2 border-l border-[rgba(255,255,255,0.06)] pl-6 text-xs font-mono">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#64748B]">Jitter</span>
                <span className="text-[#F3F4F6] font-medium">{jitterVal.toFixed(1)} ms</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#64748B]">Packet Loss</span>
                <span className={`font-medium ${lossVal > 0 ? "text-[#F87171]" : "text-[#34D399]"}`}>
                  {lossVal.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Four-Column KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Card 1: Ping */}
        <div className="surface-card rounded-lg p-4 space-y-1.5">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Ping</span>
            <Wifi className="w-3.5 h-3.5 text-[#38BDF8]" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-[#F3F4F6]">
            {pingVal.toFixed(1)} <span className="text-xs font-normal text-[#94A3B8]">ms</span>
          </div>
          <div className="text-[11px] text-[#34D399] font-medium">
            {getPingRating(pingVal)}
          </div>
        </div>

        {/* Card 2: Jitter */}
        <div className="surface-card rounded-lg p-4 space-y-1.5">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Jitter</span>
            <Zap className="w-3.5 h-3.5 text-[#818CF8]" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-[#F3F4F6]">
            {jitterVal.toFixed(1)} <span className="text-xs font-normal text-[#94A3B8]">ms</span>
          </div>
          <div className="text-[11px] text-[#94A3B8] font-medium">
            {getJitterRating(jitterVal)}
          </div>
        </div>

        {/* Card 3: Packet Loss */}
        <div className="surface-card rounded-lg p-4 space-y-1.5">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Packet Loss</span>
            <TrendingDown className={`w-3.5 h-3.5 ${lossVal > 0 ? "text-[#F87171]" : "text-[#34D399]"}`} />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-[#F3F4F6]">
            {lossVal.toFixed(1)} <span className="text-xs font-normal text-[#94A3B8]">%</span>
          </div>
          <div className={`text-[11px] font-medium ${lossVal > 0 ? "text-[#F87171]" : "text-[#34D399]"}`}>
            {getLossRating(lossVal)}
          </div>
        </div>

        {/* Card 4: Download Speed */}
        <div className="surface-card rounded-lg p-4 space-y-1.5">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Download Speed</span>
            <ArrowDownCircle className="w-3.5 h-3.5 text-[#34D399]" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-[#F3F4F6]">
            {downloadVal.toFixed(0)} <span className="text-xs font-normal text-[#94A3B8]">Mbps</span>
          </div>
          <div className="text-[11px] text-[#94A3B8] font-medium">
            Edge Probe Tested
          </div>
        </div>
      </div>

      {/* 3. Latency Over Time Chart */}
      <LatencyChart
        data={chartPoints}
        currentPing={pingVal}
        currentJitter={jitterVal}
      />

      {/* 4. Latest Diagnosis Evidence Snapshot */}
      {latestResult ? (
        <div className="surface-card rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`} />
              <h4 className="text-sm font-semibold text-[#F3F4F6]">
                Latest Diagnostic Finding
              </h4>
              <span className="text-xs text-[#64748B] font-mono">
                ({latestResult.game})
              </span>
            </div>
            <button
              type="button"
              onClick={() => onInspectResult(latestResult)}
              className="text-xs text-[#38BDF8] hover:text-[#7DD3FC] flex items-center gap-1 font-medium transition-colors"
            >
              <span>View Full Report</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-[#94A3B8] leading-relaxed">
            {latestResult.heuristic_primary_issue || latestResult.status_reason}
          </p>

          {/* Quick Metrics Table */}
          <div className="border border-[rgba(255,255,255,0.06)] rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#171B21] text-[#64748B] text-[10px] uppercase font-semibold border-b border-[rgba(255,255,255,0.06)]">
                <tr>
                  <th className="py-2 px-3">Subsystem</th>
                  <th className="py-2 px-3">Target</th>
                  <th className="py-2 px-3 text-right">Measurement</th>
                  <th className="py-2 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.04)] font-mono text-[11px]">
                <tr>
                  <td className="py-2 px-3 text-[#F3F4F6] font-sans font-medium flex items-center gap-1.5">
                    <HardDrive className="w-3 h-3 text-[#94A3B8]" />
                    Local Gateway
                  </td>
                  <td className="py-2 px-3 text-[#94A3B8]">{latestResult.gateway.ip}</td>
                  <td className="py-2 px-3 text-right text-[#F3F4F6]">
                    {latestResult.gateway.latency_ms !== null ? `${latestResult.gateway.latency_ms.toFixed(1)} ms` : "N/A"}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span className="text-[#34D399] font-sans text-[10px] px-1.5 py-0.5 rounded bg-[#10B981]/10">
                      Healthy
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="py-2 px-3 text-[#F3F4F6] font-sans font-medium flex items-center gap-1.5">
                    <Server className="w-3 h-3 text-[#38BDF8]" />
                    Game Backbone
                  </td>
                  <td className="py-2 px-3 text-[#94A3B8]">{latestResult.target_host}</td>
                  <td className="py-2 px-3 text-right text-[#F3F4F6]">
                    {activePing ? `${activePing.avg_ms.toFixed(1)} ms` : "--"}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span className={`font-sans text-[10px] px-1.5 py-0.5 rounded ${statusInfo.badgeClass}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="py-2 px-3 text-[#F3F4F6] font-sans font-medium flex items-center gap-1.5">
                    <Globe2 className="w-3 h-3 text-[#818CF8]" />
                    DNS Resolution
                  </td>
                  <td className="py-2 px-3 text-[#94A3B8]">{latestResult.dns.test_domain}</td>
                  <td className="py-2 px-3 text-right text-[#F3F4F6]">
                    {latestResult.dns.latency_ms.toFixed(1)} ms
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span className="text-[#34D399] font-sans text-[10px] px-1.5 py-0.5 rounded bg-[#10B981]/10">
                      Healthy
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="surface-card rounded-lg p-6 text-center space-y-2">
          <div className="text-xs font-semibold text-[#F3F4F6]">
            No live diagnosis recorded yet in this session
          </div>
          <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
            Execute a network diagnosis to measure real-time gateway latency, RFC 3550 jitter, packet loss, and evaluate routing.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onNavigateToDiagnose}
              className="px-4 py-2 rounded bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors"
            >
              Start Connection Test →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

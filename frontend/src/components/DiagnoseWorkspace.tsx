import React from "react";
import {
  Play,
  RotateCw,
  Crosshair,
  Target,
  Flame,
  Shield,
  Smartphone,
  Globe,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Circle,
  Sparkles,
  RefreshCw,
  HardDrive,
  Globe2,
  Server,
  Zap,
  TrendingDown,
  ArrowDownCircle,
  GitCommit,
  ShieldAlert,
  Router,
  Monitor,
  Building2
} from "lucide-react";
import type {
  DiagnosticResult,
  ProgressStep,
  ConnectionStatus
} from "../types/diagnostics";

interface DiagnoseWorkspaceProps {
  selectedGame: string;
  onSelectGame: (game: string) => void;
  customHost: string;
  onChangeCustomHost: (host: string) => void;
  runSpeedTest: boolean;
  onChangeRunSpeedTest: (val: boolean) => void;
  runTraceroute: boolean;
  onChangeRunTraceroute: (val: boolean) => void;
  isRunning: boolean;
  currentStep: ProgressStep | null;
  result: DiagnosticResult | null;
  errorMsg: string | null;
  isDemoMode: boolean;
  demoScenario: string;
  onChangeDemoScenario: (scen: string) => void;
  onRunDiagnosis: () => void;
  onRerunAi: () => void;
  isAiRerunning: boolean;
}

const PRESET_GAMES = [
  { name: "Valorant", category: "Riot Direct Backbone", icon: Crosshair },
  { name: "Counter-Strike 2", category: "Valve SDR Routing", icon: Target },
  { name: "Fortnite", category: "Epic QoS Edge", icon: Flame },
  { name: "Apex Legends", category: "EA Multiplay Backbone", icon: Shield },
  { name: "COD Mobile", category: "Activision Demonware", icon: Smartphone },
  { name: "PUBG", category: "Krafton AWS Edge", icon: Globe },
  { name: "Other / Custom", category: "Custom Target Host / IP", icon: Plus }
];

const ORDERED_STEPS = [
  { id: "detecting_interface", label: "Detecting network interface" },
  { id: "testing_gateway", label: "Testing gateway & local LAN link" },
  { id: "measuring_internet", label: "Measuring internet reference baseline" },
  { id: "measuring_game_server", label: "Measuring game server latency & jitter" },
  { id: "testing_dns", label: "Measuring DNS lookup latency" },
  { id: "checking_route", label: "Analyzing intermediate route hops" },
  { id: "testing_speed", label: "Probing bandwidth stability" },
  { id: "generating_ai", label: "Synthesizing AI diagnostic report" }
];

export const DiagnoseWorkspace: React.FC<DiagnoseWorkspaceProps> = ({
  selectedGame,
  onSelectGame,
  customHost,
  onChangeCustomHost,
  runSpeedTest,
  onChangeRunSpeedTest,
  runTraceroute,
  onChangeRunTraceroute,
  isRunning,
  currentStep,
  result,
  errorMsg,
  isDemoMode,
  demoScenario,
  onChangeDemoScenario,
  onRunDiagnosis,
  onRerunAi,
  isAiRerunning
}) => {
  const isCustom = selectedGame === "Other / Custom";

  const getStepState = (stepId: string) => {
    if (!currentStep) return "pending";
    if (currentStep.step === "completed") return "done";
    const currentIdx = ORDERED_STEPS.findIndex((s) => s.id === currentStep.step);
    const thisIdx = ORDERED_STEPS.findIndex((s) => s.id === stepId);
    if (thisIdx < currentIdx) return "done";
    if (thisIdx === currentIdx) return "active";
    return "pending";
  };

  const getStatusBadge = (st: ConnectionStatus) => {
    switch (st) {
      case "critical":
        return {
          label: "Critical",
          color: "text-[#F87171]",
          badgeClass: "badge-critical",
          dotColor: "bg-[#EF4444]"
        };
      case "unstable":
        return {
          label: "Unstable",
          color: "text-[#FBBF24]",
          badgeClass: "badge-warning",
          dotColor: "bg-[#F59E0B]"
        };
      case "stable":
      default:
        return {
          label: "Healthy",
          color: "text-[#34D399]",
          badgeClass: "badge-healthy",
          dotColor: "bg-[#10B981]"
        };
    }
  };

  const activePing = result ? (result.game_server || result.internet) : null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Page Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-[#F3F4F6]">Network Diagnosis</h2>
        <p className="text-xs text-[#94A3B8]">
          Measure your connection and identify the likely source of gaming latency.
        </p>
      </div>

      {/* Demo Scenario Picker Banner if Demo Mode */}
      {isDemoMode && (
        <div className="surface-card rounded-lg p-3.5 border-l-2 border-l-[#F59E0B] space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-medium text-[#FBBF24]">
              Demo Mode Active: Select Evaluation Scenario
            </span>
            <span className="text-[#94A3B8] text-[11px]">
              Simulates realistic real-world networking faults
            </span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { id: "wifi_jitter", label: "Wi-Fi Jitter & Congestion (Valorant)" },
              { id: "isp_packet_loss", label: "Upstream ISP Route Drops (CS2)" },
              { id: "flawless_fiber", label: "Direct Fiber Connection (Apex)" }
            ].map((scen) => (
              <button
                key={scen.id}
                type="button"
                onClick={() => onChangeDemoScenario(scen.id)}
                disabled={isRunning}
                className={`px-3 py-1.5 rounded text-xs transition-colors ${
                  demoScenario === scen.id
                    ? "bg-[#F59E0B]/20 text-[#FBBF24] border border-[#F59E0B]/40 font-medium"
                    : "bg-[#171B21] text-[#94A3B8] hover:text-[#F3F4F6] border border-[rgba(255,255,255,0.06)]"
                }`}
              >
                {scen.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Configuration & Launch Control Card */}
      <div className="surface-card rounded-lg p-5 space-y-5">
        {/* Game Target Selection */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
              Target Game / Server
            </label>
            <span className="text-[11px] text-[#64748B]">
              Measures against real gaming data backbones
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {PRESET_GAMES.map((game) => {
              const Icon = game.icon;
              const isSelected = selectedGame === game.name;
              return (
                <button
                  key={game.name}
                  type="button"
                  disabled={isRunning}
                  onClick={() => onSelectGame(game.name)}
                  className={`p-3 rounded text-left transition-all relative ${
                    isSelected
                      ? "bg-[#171B21] border border-[#38BDF8] text-[#F3F4F6]"
                      : "bg-[#111418] border border-[rgba(255,255,255,0.06)] hover:bg-[#171B21] text-[#94A3B8] hover:text-[#F3F4F6]"
                  } ${isRunning ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-[#38BDF8]" : "text-[#64748B]"}`} />
                    <span className="truncate">{game.name}</span>
                  </div>
                  <div className="text-[10px] text-[#64748B] truncate font-mono">
                    {game.category}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Host Input */}
          {isCustom && (
            <div className="pt-2">
              <input
                type="text"
                value={customHost}
                onChange={(e) => onChangeCustomHost(e.target.value)}
                disabled={isRunning}
                placeholder="Enter IP or Hostname (e.g. 1.1.1.1 or na-east.val.riotgames.com)"
                className="w-full px-3 py-2 rounded bg-[#0B0D10] border border-[rgba(255,255,255,0.1)] text-xs text-[#F3F4F6] placeholder-[#64748B] font-mono focus:outline-none focus:border-[#38BDF8]"
              />
            </div>
          )}
        </div>

        {/* Options & Action Button */}
        <div className="pt-3 border-t border-[rgba(255,255,255,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#94A3B8]">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={runTraceroute}
                onChange={(e) => onChangeRunTraceroute(e.target.checked)}
                disabled={isRunning}
                className="rounded bg-[#0B0D10] border-[rgba(255,255,255,0.15)] text-[#2563EB]"
              />
              <span>Route / Hop Analysis</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={runSpeedTest}
                onChange={(e) => onChangeRunSpeedTest(e.target.checked)}
                disabled={isRunning}
                className="rounded bg-[#0B0D10] border-[rgba(255,255,255,0.15)] text-[#2563EB]"
              />
              <span>Probe Bandwidth</span>
            </label>
          </div>

          <button
            type="button"
            onClick={onRunDiagnosis}
            disabled={isRunning}
            className={`px-5 py-2 rounded text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
              isRunning
                ? "bg-[#171B21] text-[#94A3B8] cursor-not-allowed border border-[rgba(255,255,255,0.08)]"
                : "bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer"
            }`}
          >
            {isRunning ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running network diagnosis...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Diagnosis →</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMsg && (
        <div className="surface-card rounded-lg p-4 border-l-2 border-l-[#EF4444] text-xs text-[#F87171] flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 3. Diagnostic Progress Checklist (While Running) */}
      {isRunning && (
        <div className="surface-card rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#38BDF8]">
                Executing Diagnostics
              </div>
              <h3 className="text-sm font-semibold text-[#F3F4F6] mt-0.5">
                {currentStep?.message || "Running network measurements..."}
              </h3>
            </div>
            <div className="text-base font-mono font-bold text-[#38BDF8]">
              {currentStep?.percent || 5}%
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-[#0B0D10] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2563EB] transition-all duration-300 rounded-full"
              style={{ width: `${currentStep?.percent || 5}%` }}
            />
          </div>

          {/* Step checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {ORDERED_STEPS.map((step) => {
              const state = getStepState(step.id);
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded text-xs transition-colors ${
                    state === "active"
                      ? "bg-[#171B21] text-[#F3F4F6] border border-[#38BDF8]/30 font-medium"
                      : state === "done"
                      ? "text-[#F3F4F6] bg-[#111418]"
                      : "text-[#64748B] bg-[#111418]/40"
                  }`}
                >
                  {state === "done" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
                  ) : state === "active" ? (
                    <Loader2 className="w-3.5 h-3.5 text-[#38BDF8] animate-spin shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                  )}
                  <span className="truncate">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Complete Diagnosis Report Section */}
      {result && !isRunning && (
        <div className="space-y-6">
          {/* Header Summary Banner */}
          <div className="surface-card rounded-lg p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgba(255,255,255,0.06)] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                  Diagnosis Complete
                </span>
                <span className="text-xs text-[#64748B]">•</span>
                <span className="text-xs text-[#64748B] font-mono">{result.game}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#94A3B8]">Connection status:</span>
                <span className={`text-xs px-2.5 py-0.5 rounded font-medium ${getStatusBadge(result.status).badgeClass}`}>
                  ● {getStatusBadge(result.status).label}
                </span>
              </div>
            </div>

            {/* PRIMARY FINDING Banner */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Primary Finding
              </div>
              <p className="text-base font-semibold text-[#F3F4F6] leading-snug">
                {result.heuristic_primary_issue || result.status_reason}
              </p>
            </div>

            {/* Confidence Badge */}
            <div className="flex items-center gap-2 pt-1 text-xs text-[#94A3B8]">
              <span>CONFIDENCE:</span>
              <span className="font-semibold text-[#34D399] px-2 py-0.5 rounded bg-[#10B981]/10 text-[11px]">
                {result.ai_analysis?.confidence ? result.ai_analysis.confidence.toUpperCase() : "HIGH"}
              </span>
            </div>
          </div>

          {/* 5. What We Measured (Evidence Table) */}
          <div className="surface-card rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                  What We Measured (Evidence)
                </h3>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Verified empirical measurements across physical and network hops
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#64748B]">
                Target: {result.target_host}
              </span>
            </div>

            <div className="border border-[rgba(255,255,255,0.06)] rounded overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#171B21] text-[#64748B] text-[10px] uppercase font-semibold border-b border-[rgba(255,255,255,0.06)]">
                  <tr>
                    <th className="py-2.5 px-3">Metric</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Result</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.04)] font-mono text-[11px]">
                  {/* Gateway */}
                  <tr>
                    <td className="py-2.5 px-3 text-[#F3F4F6] font-sans font-medium flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-[#94A3B8]" />
                      Gateway Latency
                    </td>
                    <td className="py-2.5 px-3 text-[#64748B] font-sans">
                      Local router ({result.gateway.ip})
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#F3F4F6]">
                      {result.gateway.latency_ms !== null ? `${result.gateway.latency_ms.toFixed(1)} ms` : "N/A"}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`font-sans text-[10px] px-2 py-0.5 rounded ${
                        (result.gateway.latency_ms && result.gateway.latency_ms > 10) || result.gateway.packet_loss_percent > 0
                          ? "badge-warning"
                          : "badge-healthy"
                      }`}>
                        {(result.gateway.latency_ms && result.gateway.latency_ms > 10) || result.gateway.packet_loss_percent > 0
                          ? "Warning"
                          : "Healthy"}
                      </span>
                    </td>
                  </tr>

                  {/* Internet Reference Latency */}
                  <tr>
                    <td className="py-2.5 px-3 text-[#F3F4F6] font-sans font-medium flex items-center gap-1.5">
                      <Globe2 className="w-3.5 h-3.5 text-[#38BDF8]" />
                      Internet Latency
                    </td>
                    <td className="py-2.5 px-3 text-[#64748B] font-sans">
                      Global reference edge ({result.internet.target})
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#F3F4F6]">
                      {result.internet.avg_ms.toFixed(1)} ms
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`font-sans text-[10px] px-2 py-0.5 rounded ${
                        result.internet.avg_ms > 90 ? "badge-warning" : "badge-healthy"
                      }`}>
                        {result.internet.avg_ms > 90 ? "Warning" : "Healthy"}
                      </span>
                    </td>
                  </tr>

                  {/* Game Server Latency */}
                  {result.game_server && (
                    <tr>
                      <td className="py-2.5 px-3 text-[#F3F4F6] font-sans font-medium flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-[#38BDF8]" />
                        Game Server Latency
                      </td>
                      <td className="py-2.5 px-3 text-[#64748B] font-sans">
                        {result.game} target ({result.target_host})
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#F3F4F6]">
                        {result.game_server.avg_ms.toFixed(1)} ms
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`font-sans text-[10px] px-2 py-0.5 rounded ${
                          result.game_server.avg_ms > 80 ? "badge-warning" : "badge-healthy"
                        }`}>
                          {result.game_server.avg_ms > 80 ? "Warning" : "Healthy"}
                        </span>
                      </td>
                    </tr>
                  )}

                  {/* Jitter */}
                  <tr>
                    <td className="py-2.5 px-3 text-[#F3F4F6] font-sans font-medium flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#818CF8]" />
                      Jitter (RFC 3550)
                    </td>
                    <td className="py-2.5 px-3 text-[#64748B] font-sans">
                      Mean absolute delay variation
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#F3F4F6]">
                      {activePing ? `${activePing.jitter_ms.toFixed(1)} ms` : "--"}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`font-sans text-[10px] px-2 py-0.5 rounded ${
                        activePing && activePing.jitter_ms > 15
                          ? "badge-critical"
                          : activePing && activePing.jitter_ms > 8
                          ? "badge-warning"
                          : "badge-healthy"
                      }`}>
                        {activePing && activePing.jitter_ms > 15
                          ? "Critical"
                          : activePing && activePing.jitter_ms > 8
                          ? "Warning"
                          : "Healthy"}
                      </span>
                    </td>
                  </tr>

                  {/* Packet Loss */}
                  <tr>
                    <td className="py-2.5 px-3 text-[#F3F4F6] font-sans font-medium flex items-center gap-1.5">
                      <TrendingDown className="w-3.5 h-3.5 text-[#F87171]" />
                      Packet Loss
                    </td>
                    <td className="py-2.5 px-3 text-[#64748B] font-sans">
                      {activePing?.packets_received} of {activePing?.packets_sent} packets received
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#F3F4F6]">
                      {activePing ? `${activePing.packet_loss_percent.toFixed(1)}%` : "0%"}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`font-sans text-[10px] px-2 py-0.5 rounded ${
                        activePing && activePing.packet_loss_percent > 1.5
                          ? "badge-critical"
                          : activePing && activePing.packet_loss_percent > 0
                          ? "badge-warning"
                          : "badge-healthy"
                      }`}>
                        {activePing && activePing.packet_loss_percent > 1.5
                          ? "Critical"
                          : activePing && activePing.packet_loss_percent > 0
                          ? "Warning"
                          : "Healthy"}
                      </span>
                    </td>
                  </tr>

                  {/* DNS Latency */}
                  <tr>
                    <td className="py-2.5 px-3 text-[#F3F4F6] font-sans font-medium flex items-center gap-1.5">
                      <Globe2 className="w-3.5 h-3.5 text-[#38BDF8]" />
                      DNS Lookup Latency
                    </td>
                    <td className="py-2.5 px-3 text-[#64748B] font-sans">
                      System resolver ({result.dns.test_domain})
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#F3F4F6]">
                      {result.dns.latency_ms.toFixed(1)} ms
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`font-sans text-[10px] px-2 py-0.5 rounded ${
                        result.dns.latency_ms > 40 ? "badge-warning" : "badge-healthy"
                      }`}>
                        {result.dns.latency_ms > 40 ? "Warning" : "Healthy"}
                      </span>
                    </td>
                  </tr>

                  {/* Bandwidth Speed */}
                  {result.speed && result.speed.download_mbps !== null && (
                    <tr>
                      <td className="py-2.5 px-3 text-[#F3F4F6] font-sans font-medium flex items-center gap-1.5">
                        <ArrowDownCircle className="w-3.5 h-3.5 text-[#34D399]" />
                        Download Speed
                      </td>
                      <td className="py-2.5 px-3 text-[#64748B] font-sans">
                        Edge throughput stream
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#F3F4F6]">
                        {result.speed.download_mbps.toFixed(0)} Mbps
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="font-sans text-[10px] px-2 py-0.5 rounded badge-healthy">
                          Healthy
                        </span>
                      </td>
                    </tr>
                  )}

                  {/* Route Hops */}
                  <tr>
                    <td className="py-2.5 px-3 text-[#F3F4F6] font-sans font-medium flex items-center gap-1.5">
                      <GitCommit className="w-3.5 h-3.5 text-[#818CF8]" />
                      Route Stability
                    </td>
                    <td className="py-2.5 px-3 text-[#64748B] font-sans">
                      {result.route.total_hops} total transit hops
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#F3F4F6]">
                      {result.route.timeouts} timeouts
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`font-sans text-[10px] px-2 py-0.5 rounded ${
                        result.route.timeouts > 0 ? "badge-warning" : "badge-healthy"
                      }`}>
                        {result.route.timeouts > 0 ? "Warning" : "Healthy"}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 6. AI Analysis Section */}
          <div className="surface-card rounded-lg p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgba(255,255,255,0.06)] pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
                  AI Analysis
                </h3>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Generated locally with an open-weight model{" "}
                  {result.ai_analysis?.model_used && (
                    <span className="font-mono text-[#38BDF8]">
                      ({result.ai_analysis.model_used})
                    </span>
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={onRerunAi}
                disabled={isAiRerunning}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#171B21] hover:bg-[#1E232B] text-xs text-[#94A3B8] hover:text-[#F3F4F6] transition-colors border border-[rgba(255,255,255,0.06)]"
                title="Re-run AI Analysis"
              >
                <RefreshCw className={`w-3 h-3 ${isAiRerunning ? "animate-spin text-[#38BDF8]" : ""}`} />
                <span>Re-analyze</span>
              </button>
            </div>

            {/* Likely Cause */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                Likely Cause
              </div>
              <div className="text-sm font-semibold text-[#F3F4F6]">
                {result.ai_analysis?.primary_issue || result.heuristic_primary_issue}
              </div>
            </div>

            {/* Why (Explanation) */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                Why
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                {result.ai_analysis?.summary || (
                  `Your gateway is responding normally (${result.gateway.latency_ms?.toFixed(1) || 2} ms) with ${result.gateway.packet_loss_percent}% packet loss, while external latency reaches ${activePing?.avg_ms.toFixed(1)} ms with ${activePing?.jitter_ms.toFixed(1)} ms jitter. This indicates the primary variance occurs in external transit rather than your local adapter.`
                )}
              </p>
            </div>

            {/* Recommended Actions (Numbered List) */}
            <div className="space-y-2 pt-2 border-t border-[rgba(255,255,255,0.06)]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                Recommended Actions
              </div>
              <div className="space-y-2">
                {(result.ai_analysis?.recommended_actions && result.ai_analysis.recommended_actions.length > 0
                  ? result.ai_analysis.recommended_actions
                  : [
                      "Test the same game using a wired Ethernet connection to verify local Wi-Fi stability.",
                      "Compare with a mobile hotspot or secondary ISP to rule out peering routing drops.",
                      "Stop background downloads, cloud backups, and streaming during competitive matches.",
                      "If packet loss persists beyond your gateway, contact your ISP with traceroute evidence."
                    ]
                ).map((action, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs text-[#F3F4F6]">
                    <span className="font-mono text-[11px] font-bold text-[#38BDF8] shrink-0">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="leading-relaxed text-[#94A3B8]">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 7. "Do Not Do This" Section (Important Warning Card) */}
          <div className="surface-card rounded-lg p-5 border-l-2 border-l-[#F59E0B] space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#FBBF24]">
              <ShieldAlert className="w-4 h-4" />
              <span>Before changing your internet plan</span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              {result.speed?.download_mbps && result.speed.download_mbps >= 40 ? (
                <>
                  Your download speed is already sufficient ({result.speed.download_mbps.toFixed(0)} Mbps). The measurements point toward connection stability and latency variance rather than bandwidth constraints. You probably don't need a faster, more expensive plan yet.
                </>
              ) : (
                <>
                  Gaming requires minimal bandwidth (usually &lt; 5 Mbps) but extremely stable packet pacing. Upgrading to a gigabit plan will not resolve packet loss caused by local Wi-Fi interference or upstream ISP peering degradation.
                </>
              )}
            </p>
          </div>

          {/* 8. Visual Hop Route Topology Inspector */}
          <div className="surface-card rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                Connection Path & Hop Isolation
              </h4>
              <span className="text-[11px] text-[#64748B]">
                Isolates where packet latency and drops originate
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              {/* Node 1: PC */}
              <div className="p-3 rounded bg-[#171B21] border border-[rgba(255,255,255,0.06)] space-y-1">
                <div className="flex items-center gap-2 text-xs text-[#F3F4F6] font-medium">
                  <Monitor className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Your PC</span>
                </div>
                <div className="text-[11px] font-mono text-[#34D399] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Online
                </div>
                <div className="text-[10px] text-[#64748B]">Interface active</div>
              </div>

              {/* Node 2: Gateway */}
              <div className="p-3 rounded bg-[#171B21] border border-[rgba(255,255,255,0.06)] space-y-1">
                <div className="flex items-center gap-2 text-xs text-[#F3F4F6] font-medium">
                  <Router className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span>Local Gateway</span>
                </div>
                <div className="text-[11px] font-mono text-[#F3F4F6]">
                  {result.gateway.latency_ms ? `${result.gateway.latency_ms.toFixed(1)} ms` : "N/A"}
                </div>
                <div className="text-[10px] text-[#64748B] truncate">
                  {result.gateway.ip}
                </div>
              </div>

              {/* Node 3: ISP Peering */}
              <div className="p-3 rounded bg-[#171B21] border border-[rgba(255,255,255,0.06)] space-y-1">
                <div className="flex items-center gap-2 text-xs text-[#F3F4F6] font-medium">
                  <Building2 className="w-3.5 h-3.5 text-[#818CF8]" />
                  <span>ISP Peering</span>
                </div>
                <div className="text-[11px] font-mono text-[#F3F4F6]">
                  {result.route.total_hops} Hops
                </div>
                <div className="text-[10px] text-[#64748B]">
                  {result.route.timeouts} timeouts
                </div>
              </div>

              {/* Node 4: Game Edge */}
              <div className="p-3 rounded bg-[#171B21] border border-[rgba(255,255,255,0.06)] space-y-1">
                <div className="flex items-center gap-2 text-xs text-[#F3F4F6] font-medium">
                  <Server className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Game Server Edge</span>
                </div>
                <div className="text-[11px] font-mono text-[#F3F4F6]">
                  {activePing ? `${activePing.avg_ms.toFixed(1)} ms` : "--"}
                </div>
                <div className="text-[10px] text-[#64748B] truncate">
                  {result.target_host}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

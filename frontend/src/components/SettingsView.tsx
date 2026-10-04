import React, { useState } from "react";
import {
  Cpu,
  Network,
  ShieldCheck,
  Palette,
  RotateCw,
  Terminal
} from "lucide-react";
import type { SystemInfo } from "../types/diagnostics";

interface SettingsViewProps {
  systemInfo: SystemInfo | null;
  onRefreshSystemInfo?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  systemInfo,
  onRefreshSystemInfo
}) => {
  const [pingSamples, setPingSamples] = useState<number>(20);
  const [packetTimeout, setPacketTimeout] = useState<number>(2);
  const [tracerouteEnabled, setTracerouteEnabled] = useState<boolean>(true);
  const [themeSelection, setThemeSelection] = useState<"dark" | "light" | "system">("dark");
  const [density, setDensity] = useState<"standard" | "compact">("standard");

  const isAiOnline = systemInfo?.ollama_online ?? false;
  const configuredModel = systemInfo?.configured_model || "llama3.2";
  const ollamaHost = systemInfo?.ollama_host || "http://127.0.0.1:11434";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-[#F3F4F6]">Settings & Parameters</h2>
        <p className="text-xs text-[#94A3B8]">
          Configure local AI inference, network diagnostic parameters, and privacy defaults.
        </p>
      </div>

      {/* 1. Local AI Configuration */}
      <div className="surface-card rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#171B21] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#38BDF8]">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#F3F4F6]">Local AI Engine</h3>
              <p className="text-[11px] text-[#94A3B8]">Open-Weight Model Inference via Ollama</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium ${
                isAiOnline ? "badge-healthy" : "badge-warning"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isAiOnline ? "bg-[#10B981]" : "bg-[#F59E0B]"}`} />
              {isAiOnline ? "Connected" : "Offline"}
            </span>

            {onRefreshSystemInfo && (
              <button
                type="button"
                onClick={onRefreshSystemInfo}
                className="p-1 rounded bg-[#171B21] text-[#94A3B8] hover:text-[#F3F4F6] border border-[rgba(255,255,255,0.06)]"
                title="Test AI Connection"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              AI Provider
            </label>
            <input
              type="text"
              value="Ollama (Local Open-Weight)"
              disabled
              className="w-full px-3 py-1.5 rounded bg-[#0B0D10] border border-[rgba(255,255,255,0.08)] text-xs text-[#F3F4F6] font-mono cursor-not-allowed"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Configured Model
            </label>
            <input
              type="text"
              value={configuredModel}
              disabled
              className="w-full px-3 py-1.5 rounded bg-[#0B0D10] border border-[rgba(255,255,255,0.08)] text-xs text-[#38BDF8] font-mono cursor-not-allowed"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Host URL Endpoint
            </label>
            <input
              type="text"
              value={ollamaHost}
              disabled
              className="w-full px-3 py-1.5 rounded bg-[#0B0D10] border border-[rgba(255,255,255,0.08)] text-xs text-[#94A3B8] font-mono cursor-not-allowed"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Cloud AI API Dependency
            </label>
            <input
              type="text"
              value="None (100% On-Device)"
              disabled
              className="w-full px-3 py-1.5 rounded bg-[#0B0D10] border border-[rgba(255,255,255,0.08)] text-xs text-[#34D399] font-mono cursor-not-allowed"
            />
          </div>
        </div>

        {!isAiOnline && (
          <div className="p-3 rounded bg-[#171B21] border border-[rgba(255,255,255,0.08)] text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#FBBF24] font-medium">
              <Terminal className="w-3.5 h-3.5" />
              <span>Ollama is currently unreachable</span>
            </div>
            <p className="text-[#94A3B8] text-[11px] leading-relaxed">
              Start Ollama locally with <code className="bg-[#0B0D10] px-1 py-0.5 rounded text-[#F3F4F6]">ollama run {configuredModel}</code> to activate the open-weight diagnostic assistant.
            </p>
          </div>
        )}
      </div>

      {/* 2. Network Diagnostics Configuration */}
      <div className="surface-card rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-[rgba(255,255,255,0.06)] pb-3">
          <div className="w-7 h-7 rounded bg-[#171B21] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#38BDF8]">
            <Network className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#F3F4F6]">Network Diagnostic Engine</h3>
            <p className="text-[11px] text-[#94A3B8]">Measurement samples and hop probe settings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Ping Samples (Packets)
            </label>
            <select
              value={pingSamples}
              onChange={(e) => setPingSamples(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded bg-[#0B0D10] border border-[rgba(255,255,255,0.08)] text-xs text-[#F3F4F6] focus:outline-none focus:border-[#38BDF8]"
            >
              <option value={10}>10 packets (Fast)</option>
              <option value={20}>20 packets (Recommended)</option>
              <option value={50}>50 packets (Deep scan)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Packet Timeout
            </label>
            <select
              value={packetTimeout}
              onChange={(e) => setPacketTimeout(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded bg-[#0B0D10] border border-[rgba(255,255,255,0.08)] text-xs text-[#F3F4F6] focus:outline-none focus:border-[#38BDF8]"
            >
              <option value={1}>1.0 second</option>
              <option value={2}>2.0 seconds (Standard)</option>
              <option value={4}>4.0 seconds</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Traceroute Hops
            </label>
            <select
              value={tracerouteEnabled ? "enabled" : "disabled"}
              onChange={(e) => setTracerouteEnabled(e.target.value === "enabled")}
              className="w-full px-3 py-1.5 rounded bg-[#0B0D10] border border-[rgba(255,255,255,0.08)] text-xs text-[#F3F4F6] focus:outline-none focus:border-[#38BDF8]"
            >
              <option value="enabled">Enabled (Max 15 hops)</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>

        {/* System info summary */}
        {systemInfo && (
          <div className="pt-2 border-t border-[rgba(255,255,255,0.06)] grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px]">
            <div>
              <span className="text-[#64748B] block text-[10px]">OS PLATFORM</span>
              <span className="text-[#F3F4F6]">{systemInfo.os_name}</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px]">HOSTNAME</span>
              <span className="text-[#F3F4F6]">{systemInfo.hostname}</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px]">LOCAL IP</span>
              <span className="text-[#F3F4F6]">{systemInfo.local_ip}</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px]">GATEWAY</span>
              <span className="text-[#F3F4F6]">{systemInfo.gateway_ip}</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Local-First Privacy */}
      <div className="surface-card rounded-lg p-5 space-y-3">
        <div className="flex items-center gap-2.5 border-b border-[rgba(255,255,255,0.06)] pb-3">
          <div className="w-7 h-7 rounded bg-[#171B21] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#10B981]">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#F3F4F6]">Local-First Privacy</h3>
            <p className="text-[11px] text-[#94A3B8]">Zero cloud AI dependency</p>
          </div>
        </div>

        <p className="text-xs text-[#94A3B8] leading-relaxed">
          Your network measurements are processed locally. Diagnostic telemetry is retained purely on your filesystem in an embedded asynchronous SQLite database (<code className="text-[#F3F4F6]">backend/data/pingpilot.db</code>). No cloud AI API keys, proprietary telemetry trackers, or external LLM endpoints are invoked.
        </p>
      </div>

      {/* 4. Appearance */}
      <div className="surface-card rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-[rgba(255,255,255,0.06)] pb-3">
          <div className="w-7 h-7 rounded bg-[#171B21] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#94A3B8]">
            <Palette className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#F3F4F6]">Appearance</h3>
            <p className="text-[11px] text-[#94A3B8]">Interface theme and visual density</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Theme
            </label>
            <div className="flex gap-2">
              {[
                { id: "dark", label: "● Dark (Default)" },
                { id: "light", label: "○ Light" },
                { id: "system", label: "○ System" }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setThemeSelection(t.id as any)}
                  className={`px-3 py-1.5 rounded text-xs transition-colors ${
                    themeSelection === t.id
                      ? "bg-[#171B21] text-[#F3F4F6] border border-[rgba(255,255,255,0.14)] font-medium"
                      : "text-[#64748B] hover:text-[#94A3B8]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Display Density
            </label>
            <div className="flex gap-2">
              {[
                { id: "standard", label: "Standard" },
                { id: "compact", label: "Compact" }
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDensity(d.id as any)}
                  className={`px-3 py-1.5 rounded text-xs transition-colors ${
                    density === d.id
                      ? "bg-[#171B21] text-[#F3F4F6] border border-[rgba(255,255,255,0.14)] font-medium"
                      : "text-[#64748B] hover:text-[#94A3B8]"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

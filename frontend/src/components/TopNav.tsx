import React from "react";
import { Cpu, Network, Play, Settings as SettingsIcon, Menu, Sun, Moon } from "lucide-react";
import type { SystemInfo } from "../types/diagnostics";
import type { NavTab } from "./Sidebar";
import { useAppearance } from "../context/AppearanceContext";

interface TopNavProps {
  activeTab: NavTab;
  systemInfo: SystemInfo | null;
  onOpenAiModal: () => void;
  onOpenSettings: () => void;
  onQuickDiagnose: () => void;
  onToggleMobileMenu?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  systemInfo,
  onOpenAiModal,
  onOpenSettings,
  onQuickDiagnose,
  onToggleMobileMenu
}) => {
  const { resolvedTheme, setTheme } = useAppearance();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const isAiOnline = systemInfo?.ollama_online ?? false;


  const tabTitles: Record<NavTab, { title: string; subtitle: string }> = {
    overview: {
      title: "Overview",
      subtitle: "Real-time network telemetry and gaming connection health"
    },
    diagnose: {
      title: "Network Diagnosis",
      subtitle: "Measure latency, jitter, packet loss & isolate bottlenecks"
    },
    history: {
      title: "Diagnostic History",
      subtitle: "Observability records and performance trends over time"
    },
    settings: {
      title: "System & AI Settings",
      subtitle: "Configure local LLM parameters, test targets and diagnostic probes"
    }
  };

  const current = tabTitles[activeTab] || tabTitles.overview;

  return (
    <header className="h-14 shrink-0 bg-[#111418] border-b border-[rgba(255,255,255,0.08)] px-5 flex items-center justify-between z-30 select-none">
      {/* Left Title & Mobile Toggle */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 rounded text-[#94A3B8] hover:text-white hover:bg-[#171B21]"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div>
          <div className="text-sm font-semibold text-[#F3F4F6]">{current.title}</div>
          <div className="text-[11px] text-[#64748B] hidden sm:block truncate max-w-md">
            {current.subtitle}
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Network status */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-[#171B21] border border-[rgba(255,255,255,0.06)] text-xs">
          <Network className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span className="text-[#94A3B8]">Adapter:</span>
          <span className="font-mono text-[#F3F4F6] text-[11px]">
            {systemInfo?.active_interface || "Detected"} ({systemInfo?.gateway_ip || "192.168.1.1"})
          </span>
        </div>

        {/* Local AI status pill */}
        <button
          type="button"
          onClick={onOpenAiModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#171B21] hover:bg-[#1E232B] border border-[rgba(255,255,255,0.06)] text-xs text-[#94A3B8] hover:text-[#F3F4F6] transition-colors"
          title="Click to view Local AI model details"
        >
          <Cpu className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span>Local AI</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isAiOnline ? "bg-[#10B981]" : "bg-[#F59E0B]"
            }`}
          />
        </button>

        {/* Quick Diagnose CTA if on other tab */}
        {activeTab !== "diagnose" && (
          <button
            type="button"
            onClick={onQuickDiagnose}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Run Diagnosis</span>
          </button>
        )}

        {/* Theme quick toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-1.5 rounded text-[#94A3B8] hover:text-[#F3F4F6] hover:bg-[#171B21] transition-colors"
          title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} theme`}
        >
          {resolvedTheme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        {/* Settings button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className={`p-1.5 rounded transition-colors ${
            activeTab === "settings"
              ? "bg-[#171B21] text-[#38BDF8]"
              : "text-[#94A3B8] hover:text-[#F3F4F6] hover:bg-[#171B21]"
          }`}
          title="System & AI Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};


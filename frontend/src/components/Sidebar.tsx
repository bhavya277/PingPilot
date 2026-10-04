import React from "react";
import {
  LayoutDashboard,
  Activity,
  History,
  Settings,
  Cpu,
  PlayCircle
} from "lucide-react";
import type { SystemInfo } from "../types/diagnostics";

export type NavTab = "overview" | "diagnose" | "history" | "settings";

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  systemInfo: SystemInfo | null;
  isDemoMode: boolean;
  onToggleDemo: () => void;
  onOpenAiModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  systemInfo,
  isDemoMode,
  onToggleDemo,
  onOpenAiModal
}) => {
  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "diagnose", label: "Diagnose", icon: Activity },
    { id: "history", label: "History", icon: History },
    { id: "settings", label: "Settings", icon: Settings }
  ] as const;

  const isAiOnline = systemInfo?.ollama_online ?? false;
  const modelName = systemInfo?.configured_model || "llama3.2";

  return (
    <aside className="w-64 shrink-0 bg-[#111418] border-r border-[rgba(255,255,255,0.08)] flex flex-col justify-between select-none">
      {/* Top Brand */}
      <div>
        <div className="p-5 border-b border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#171B21] border border-[rgba(255,255,255,0.12)] flex items-center justify-center text-[#38BDF8]">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight text-[#F3F4F6] flex items-center gap-1.5">
                PingPilot
              </div>
              <div className="text-[10px] font-medium tracking-wider uppercase text-[#64748B]">
                Network Intelligence
              </div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors text-left ${
                  isActive
                    ? "bg-[#171B21] text-[#F3F4F6] border border-[rgba(255,255,255,0.08)] font-semibold"
                    : "text-[#94A3B8] hover:text-[#F3F4F6] hover:bg-[#171B21]/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#38BDF8]" : "text-[#64748B]"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Demo Mode Switcher */}
        <div className="px-3 pt-3">
          <div className="p-2.5 rounded-md bg-[#171B21]/60 border border-[rgba(255,255,255,0.06)] space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#94A3B8] font-medium flex items-center gap-1.5">
                <PlayCircle className="w-3.5 h-3.5 text-[#F59E0B]" />
                Demo Scenarios
              </span>
              <button
                type="button"
                onClick={onToggleDemo}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-colors ${
                  isDemoMode
                    ? "bg-[#F59E0B]/20 text-[#FBBF24] border border-[#F59E0B]/40"
                    : "bg-[#0B0D10] text-[#64748B] hover:text-[#94A3B8]"
                }`}
              >
                {isDemoMode ? "Active" : "Enable"}
              </button>
            </div>
            {isDemoMode && (
              <div className="text-[10px] text-[#94A3B8] leading-tight">
                Evaluating pre-recorded network issues
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Local AI status widget */}
      <div className="p-3 border-t border-[rgba(255,255,255,0.08)]">
        <button
          type="button"
          onClick={onOpenAiModal}
          className="w-full text-left p-2.5 rounded-md bg-[#171B21] hover:bg-[#1E232B] border border-[rgba(255,255,255,0.06)] transition-all group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-[#94A3B8] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#F3F4F6]" />
              Local AI
            </span>
            <span className="text-[10px] text-[#64748B] group-hover:text-[#94A3B8]">Details →</span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isAiOnline ? "bg-[#10B981]" : "bg-[#F59E0B]"
              }`}
            />
            <span className="text-xs font-mono text-[#F3F4F6] truncate">
              {isAiOnline ? `Ollama (${modelName})` : "Ollama offline"}
            </span>
          </div>

          <div className="text-[10px] text-[#64748B] mt-1 truncate">
            {isAiOnline ? "100% On-device inference" : "Deterministic fallback active"}
          </div>
        </button>
      </div>
    </aside>
  );
};

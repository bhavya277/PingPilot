import React from "react";
import { Activity, Cpu, History, PlayCircle, Info } from "lucide-react";
import type { SystemInfo } from "../types/diagnostics";

interface HeaderProps {
  systemInfo: SystemInfo | null;
  onOpenHistory: () => void;
  onOpenAbout: () => void;
  isDemoMode: boolean;
  onToggleDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  systemInfo,
  onOpenHistory,
  onOpenAbout,
  isDemoMode,
  onToggleDemo
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-[#0d121d]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-cyan-500 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-[#0c101a] rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-wider text-white">PING<span className="text-cyan-400">PILOT</span></span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                AI Co-Pilot
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Understand your ping. Fix your game.
            </p>
          </div>
        </div>

        {/* System & Ollama Status */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-4 text-xs">
          {systemInfo && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-slate-400">Adapter:</span>
              <span className="font-mono text-slate-200">{systemInfo.gateway_ip}</span>
            </div>
          )}

          {/* Local Ollama Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400 hidden sm:inline">AI Model:</span>
            {systemInfo?.ollama_online ? (
              <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {systemInfo.configured_model}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400" title="Start Ollama locally for AI analysis">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Ollama Offline (Deterministic Fallback)
              </span>
            )}
          </div>

          {/* Demo Mode Toggle Button */}
          <button
            onClick={onToggleDemo}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 border ${
              isDemoMode
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20"
                : "bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700"
            }`}
            title="Toggle pre-recorded judge test scenarios"
          >
            <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>{isDemoMode ? "Demo Mode ON" : "Demo Mode"}</span>
          </button>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="px-3 py-1.5 rounded-lg bg-slate-900/60 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white transition-all flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span>History</span>
          </button>

          {/* About / Privacy */}
          <button
            onClick={onOpenAbout}
            className="p-1.5 rounded-lg bg-slate-900/60 text-slate-400 hover:text-cyan-400 border border-slate-800 hover:border-slate-700 transition-all"
            title="About PingPilot & Local-First Privacy"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

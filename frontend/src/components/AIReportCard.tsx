import React from "react";
import {
  Gamepad2,
  Search,
  Brain,
  Wrench,
  Ban,
  Sparkles,
  Info,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import type { AiAnalysisResult } from "../types/diagnostics";

interface AIReportCardProps {
  analysis: AiAnalysisResult | null | undefined;
  status: string;
  heuristicIssue: string;
  onRerunAi?: () => void;
  isAiLoading?: boolean;
}

export const AIReportCard: React.FC<AIReportCardProps> = ({
  analysis,
  status,
  heuristicIssue,
  onRerunAi,
  isAiLoading
}) => {
  const isAiOnline = analysis?.ai_available ?? false;

  return (
    <div className="space-y-6">
      {/* AI Header & Provenance Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              AI Diagnostic Co-Pilot
              {analysis?.model_used && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                  {analysis.model_used}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              {isAiOnline
                ? "Locally evaluated by open-weight AI model on your machine"
                : "Evaluated by local deterministic diagnostic heuristics engine"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Provenance badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] text-slate-300 font-medium">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Measured Telemetry vs AI Interpretation</span>
          </div>

          {onRerunAi && (
            <button
              onClick={onRerunAi}
              disabled={isAiLoading}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
              title="Re-run AI Analysis"
            >
              <RefreshCw className={`w-4 h-4 ${isAiLoading ? "animate-spin text-cyan-400" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* Ollama Offline Banner if applicable */}
      {!isAiOnline && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-300">
              AI Analysis Unavailable (Local Ollama Offline)
            </p>
            <p className="text-slate-300 leading-relaxed">
              Network diagnostics completed successfully using the built-in deterministic engine. To activate the open-weight LLM co-pilot, start Ollama locally (<code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">ollama run llama3.2</code>) and click the refresh button above.
            </p>
          </div>
        </div>
      )}

      {/* 🎮 1. Connection Verdict */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
          <Gamepad2 className="w-4 h-4" />
          <span>🎮 Connection Verdict</span>
        </div>
        <p className="text-base text-slate-200 leading-relaxed">
          {analysis?.summary || `Your connection is rated as ${status}. ${heuristicIssue}.`}
        </p>
      </div>

      {/* 2-Column Grid: What We Found & Most Likely Cause */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 🔎 2. What We Found */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <Search className="w-4 h-4" />
            <span>🔎 What We Found</span>
          </div>
          <div className="space-y-2">
            {analysis?.evidence && analysis.evidence.length > 0 ? (
              analysis.evidence.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">Telemetry values within baseline limits.</p>
            )}
          </div>
        </div>

        {/* 🧠 3. Most Likely Cause */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <Brain className="w-4 h-4" />
            <span>🧠 Most Likely Cause</span>
          </div>
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-sm font-bold text-white">
              {analysis?.primary_issue || heuristicIssue}
            </div>
            {analysis?.possible_causes && analysis.possible_causes.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {analysis.possible_causes.map((cause, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{cause}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🛠️ 4. What To Try & 🚫 5. Don't Do This */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 🛠️ What To Try */}
        <div className="glass-panel p-5 rounded-xl border border-emerald-500/20 bg-emerald-950/10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Wrench className="w-4 h-4" />
            <span>🛠️ What To Try (Prioritized Actions)</span>
          </div>
          <div className="space-y-2.5">
            {analysis?.recommended_actions && analysis.recommended_actions.length > 0 ? (
              analysis.recommended_actions.map((act, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed mt-0.5">{act}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">Connection is optimal; no adjustments required.</p>
            )}
          </div>
        </div>

        {/* 🚫 Don't Do This */}
        <div className="glass-panel p-5 rounded-xl border border-rose-500/20 bg-rose-950/10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
            <Ban className="w-4 h-4" />
            <span>🚫 Don't Do This (Common Pitfalls)</span>
          </div>
          <div className="space-y-2.5">
            {analysis?.what_not_to_do && analysis.what_not_to_do.length > 0 ? (
              analysis.what_not_to_do.map((mistake, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-rose-200">
                  <span className="text-rose-400 font-bold shrink-0 mt-0.5">✕</span>
                  <span className="leading-relaxed">{mistake}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">Avoid tweaking network driver registers manually without backup.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

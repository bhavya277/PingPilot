import React from "react";
import { CheckCircle2, Loader2, Circle } from "lucide-react";
import type { ProgressStep } from "../types/diagnostics";

interface RealTimeProgressProps {
  currentStep: ProgressStep | null;
}

const ORDERED_STEPS = [
  { id: "detecting_interface", label: "Detecting network interface" },
  { id: "testing_gateway", label: "Finding default gateway & testing local network" },
  { id: "measuring_internet", label: "Measuring internet reference baseline" },
  { id: "measuring_game_server", label: "Measuring game server latency, loss & RFC 3550 jitter" },
  { id: "testing_dns", label: "Testing DNS resolution query timing" },
  { id: "checking_route", label: "Checking route hops & traceroute timeouts" },
  { id: "testing_speed", label: "Probing download bandwidth" },
  { id: "generating_ai", label: "Sending measurements to local open-weight AI" }
];

export const RealTimeProgress: React.FC<RealTimeProgressProps> = ({ currentStep }) => {
  const currentStepId = currentStep?.step || "detecting_interface";
  const currentPercent = currentStep?.percent || 5;

  const getStepStatus = (stepId: string) => {
    const currentIndex = ORDERED_STEPS.findIndex((s) => s.id === currentStepId);
    const thisIndex = ORDERED_STEPS.findIndex((s) => s.id === stepId);

    if (currentStep?.step === "completed") return "done";
    if (thisIndex < currentIndex) return "done";
    if (thisIndex === currentIndex) return "active";
    return "pending";
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 shadow-xl shadow-indigo-500/5 my-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Diagnostic Engine Active</span>
          <h3 className="text-lg font-bold text-white mt-0.5">
            {currentStep?.message || "Executing network measurements..."}
          </h3>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-cyan-400">{currentPercent}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-300 rounded-full"
          style={{ width: `${currentPercent}%` }}
        />
      </div>

      {/* Operational Step Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {ORDERED_STEPS.map((step) => {
          const status = getStepStatus(step.id);
          return (
            <div
              key={step.id}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                status === "active"
                  ? "bg-indigo-500/15 border border-indigo-500/30 text-white font-medium"
                  : status === "done"
                  ? "text-slate-300 bg-slate-900/40"
                  : "text-slate-500 bg-slate-900/20"
              }`}
            >
              {status === "done" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : status === "active" ? (
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-700 shrink-0" />
              )}
              <span className="truncate">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

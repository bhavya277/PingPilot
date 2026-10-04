import React from "react";

interface DemoModeToggleProps {
  isDemo: boolean;
  selectedScenario: string;
  onSelectScenario: (scenario: string) => void;
  onCloseDemo: () => void;
}

export const DemoModeBanner: React.FC<DemoModeToggleProps> = ({
  isDemo,
  selectedScenario,
  onSelectScenario,
  onCloseDemo
}) => {
  if (!isDemo) return null;

  return (
    <div className="p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500/40 shadow-lg shadow-amber-500/10 mb-6 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider">
            DEMO MODE
          </span>
          <span className="text-xs font-semibold text-amber-200">
            Using realistic pre-recorded sample diagnostic data for evaluation
          </span>
        </div>
        <button
          onClick={onCloseDemo}
          className="text-xs text-amber-400 hover:text-white underline font-semibold transition-colors"
        >
          Switch back to Live Diagnostics
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">Select Evaluation Scenario:</span>
        {[
          { key: "wifi_jitter", label: "Severe Wi-Fi Congestion (Valorant)" },
          { key: "isp_packet_loss", label: "Upstream ISP Route Loss (CS2)" },
          { key: "flawless_fiber", label: "Tournament-Ready Fiber (Apex)" }
        ].map((scen) => (
          <button
            key={scen.key}
            onClick={() => onSelectScenario(scen.key)}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
              selectedScenario === scen.key
                ? "bg-amber-500/20 text-amber-300 border-amber-500"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700"
            }`}
          >
            {scen.label}
          </button>
        ))}
      </div>
    </div>
  );
};

import React from "react";
import { ShieldCheck, Cpu, Database, Lock, X } from "lucide-react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-[#0f1422] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">About PingPilot & Local Architecture</h3>
              <p className="text-xs text-slate-400">Zero Cloud AI API dependency • 100% Local Inference</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed">
          {/* Section: Local First */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Lock className="w-4 h-4" />
              <span>🔒 Local First Guarantee</span>
            </div>
            <p className="text-slate-300">
              Your network diagnostic data stays on this device. PingPilot uses a locally running open-weight AI model via Ollama for its AI analysis. No closed cloud AI APIs (OpenAI, Claude, or Gemini) are invoked.
            </p>
            <p className="text-xs text-slate-400">
              Telemetry requests are only sent to your specified target game servers (e.g. Riot, Valve, Epic) and local default gateway to measure actual latency and packet loss.
            </p>
          </div>

          {/* Section: Why Open AI? */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold text-base flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Why Open-Weight AI?
            </h4>
            <p>
              PingPilot is built around an open-weight model running locally. That means the AI diagnosis can happen without sending your personal network configuration, local router IP, or network jitter telemetry to a third-party AI API.
            </p>
            <p>
              The model is fully configurable (<code className="bg-slate-900 px-1.5 py-0.5 rounded text-cyan-300 text-xs">OLLAMA_MODEL</code>) and can be replaced, upgraded to smaller or larger quantized checkpoints (such as LLaMA 3.2, Mistral, Qwen 2.5, or Phi-3), or eventually fine-tuned specifically for gaming network troubleshooting.
            </p>
          </div>

          {/* Section: Architecture */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold text-base flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              Local Storage
            </h4>
            <p>
              Diagnostic sessions and historical comparisons are stored purely on your local filesystem in an asynchronous SQLite database (<code className="bg-slate-900 px-1.5 py-0.5 rounded text-indigo-300 text-xs">backend/data/pingpilot.db</code>). No cloud telemetry is transmitted.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

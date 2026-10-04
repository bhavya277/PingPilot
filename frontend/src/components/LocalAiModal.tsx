import React from "react";
import { Cpu, X, CheckCircle2, AlertTriangle, ShieldCheck, Terminal } from "lucide-react";
import type { SystemInfo } from "../types/diagnostics";

interface LocalAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemInfo: SystemInfo | null;
}

export const LocalAiModal: React.FC<LocalAiModalProps> = ({
  isOpen,
  onClose,
  systemInfo
}) => {
  if (!isOpen) return null;

  const isAiOnline = systemInfo?.ollama_online ?? false;
  const configuredModel = systemInfo?.configured_model || "llama3.2";
  const ollamaHost = systemInfo?.ollama_host || "http://127.0.0.1:11434";
  const availableModels = systemInfo?.available_models || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#111418] border border-[rgba(255,255,255,0.12)] rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#171B21] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#38BDF8]">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#F3F4F6]">Local AI Engine</h3>
              <p className="text-[11px] text-[#94A3B8]">Open-Weight Model Inference</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#94A3B8] hover:text-[#F3F4F6] hover:bg-[#171B21] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Status Row */}
          <div className="surface-card-elevated rounded-md p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8] font-medium uppercase tracking-wider text-[10px]">
                Engine Status
              </span>
              <span
                className={`flex items-center gap-1.5 font-medium px-2 py-0.5 rounded text-[11px] ${
                  isAiOnline
                    ? "bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30"
                    : "bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/30"
                }`}
              >
                {isAiOnline ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Connected & Ready
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Ollama Offline (Deterministic Fallback)
                  </>
                )}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[rgba(255,255,255,0.06)] font-mono text-[11px]">
              <div>
                <span className="text-[#64748B] block text-[10px]">PROVIDER</span>
                <span className="text-[#F3F4F6]">Ollama (Local)</span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[10px]">CONFIGURED MODEL</span>
                <span className="text-[#38BDF8]">{configuredModel}</span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[10px]">HOST ENDPOINT</span>
                <span className="text-[#F3F4F6] truncate">{ollamaHost}</span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[10px]">CLOUD DEPENDENCY</span>
                <span className="text-[#10B981]">0% (Zero Cloud APIs)</span>
              </div>
            </div>
          </div>

          {/* Installed Models list if available */}
          {availableModels.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[#94A3B8] font-medium text-[11px] block">
                Available Local Models ({availableModels.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {availableModels.map((m) => (
                  <span
                    key={m}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                      m.includes(configuredModel)
                        ? "bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/30"
                        : "bg-[#171B21] text-[#94A3B8] border-[rgba(255,255,255,0.06)]"
                    }`}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Offline quick command */}
          {!isAiOnline && (
            <div className="p-3 rounded-md bg-[#171B21] border border-[rgba(255,255,255,0.08)] space-y-2">
              <div className="flex items-center gap-1.5 text-[#FBBF24] font-medium text-[11px]">
                <Terminal className="w-3.5 h-3.5" />
                <span>Start Ollama on your system</span>
              </div>
              <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                Run the following command in terminal to enable real-time open-weight LLM telemetry synthesis:
              </p>
              <div className="bg-[#0B0D10] px-2.5 py-1.5 rounded font-mono text-[11px] text-[#F3F4F6] border border-[rgba(255,255,255,0.08)] select-all">
                ollama run {configuredModel}
              </div>
            </div>
          )}

          {/* Privacy note */}
          <div className="flex items-start gap-2 text-[#94A3B8] text-[11px] leading-relaxed bg-[#171B21]/50 p-2.5 rounded border border-[rgba(255,255,255,0.04)]">
            <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#F3F4F6] font-medium">Local-First Guarantee:</strong> Raw network measurements and routing hops are analyzed entirely within your device's memory. No telemetry or network logs are transmitted to external cloud servers.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#171B21] border-t border-[rgba(255,255,255,0.08)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded bg-[#202631] hover:bg-[#293240] text-xs font-medium text-[#F3F4F6] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

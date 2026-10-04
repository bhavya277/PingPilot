import React, { useEffect, useState } from "react";
import { X, Calendar, ChevronRight } from "lucide-react";
import type { DiagnosticHistorySummary, DiagnosticResult } from "../types/diagnostics";
import { fetchHistory, fetchDiagnosticById } from "../api/client";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (result: DiagnosticResult) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectSession
}) => {
  const [history, setHistory] = useState<DiagnosticHistorySummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      let isMounted = true;
      fetchHistory()
        .then((data) => {
          if (isMounted) {
            setHistory(data);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error("Error loading history:", err);
          if (isMounted) setLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInspect = async (id: string) => {
    try {
      const full = await fetchDiagnosticById(id);
      onSelectSession(full);
      onClose();
    } catch (e) {
      console.error("Failed to load session details", e);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "stable") return <span className="text-emerald-400 font-bold">🟢 Stable</span>;
    if (status === "unstable") return <span className="text-amber-400 font-bold">🟡 Unstable</span>;
    return <span className="text-rose-400 font-bold">🔴 Critical</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl max-h-[85vh] bg-[#0f1422] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Diagnostic Session History</h3>
              <p className="text-xs text-slate-400">
                Track and compare previous network diagnostic sessions to identify recurring trends
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Loading diagnostic records from local SQLite database...
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No diagnostic records found yet. Run your first diagnosis!
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleInspect(item.id)}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-900 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-white">{item.game}</span>
                      {getStatusBadge(item.status)}
                      {item.is_demo && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                          DEMO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{item.primary_issue}</p>
                    <div className="text-[11px] text-slate-500 font-mono">{item.timestamp}</div>
                  </div>

                  {/* Metrics summary */}
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-right">
                      <div className="text-slate-400 text-[10px] uppercase">Ping</div>
                      <div className="font-bold text-white">{item.avg_ping_ms.toFixed(1)} ms</div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400 text-[10px] uppercase">Jitter</div>
                      <div className="font-bold text-cyan-400">{item.jitter_ms.toFixed(1)} ms</div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400 text-[10px] uppercase">Loss</div>
                      <div className={`font-bold ${item.packet_loss_percent > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                        {item.packet_loss_percent.toFixed(1)}%
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Stored locally in SQLite database (<code className="text-slate-400">backend/data/pingpilot.db</code>)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

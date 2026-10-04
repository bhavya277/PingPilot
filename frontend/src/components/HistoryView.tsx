import React, { useState, useEffect } from "react";
import {
  History,
  Search,
  ChevronRight,
  GitCompare,
  RotateCw
} from "lucide-react";
import type {
  DiagnosticHistorySummary,
  DiagnosticResult
} from "../types/diagnostics";
import { fetchHistory, fetchDiagnosticById } from "../api/client";
import { SessionCompareModal } from "./SessionCompareModal";

interface HistoryViewProps {
  onInspectSession: (result: DiagnosticResult) => void;
  onNavigateToDiagnose: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  onInspectSession,
  onNavigateToDiagnose
}) => {
  const [history, setHistory] = useState<DiagnosticHistorySummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Selected IDs for comparison
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [compareSessionA, setCompareSessionA] = useState<DiagnosticResult | null>(null);
  const [compareSessionB, setCompareSessionB] = useState<DiagnosticResult | null>(null);
  const [compareLoading, setCompareLoading] = useState<boolean>(false);

  useEffect(() => {
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
  }, []);

  const handleManualReload = () => {
    setLoading(true);
    fetchHistory()
      .then((data) => setHistory(data))
      .catch((err) => console.error("Error loading history:", err))
      .finally(() => setLoading(false));
  };

  const handleToggleSelect = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((i) => i !== id));
    } else {
      if (selectedForCompare.length < 2) {
        setSelectedForCompare([...selectedForCompare, id]);
      } else {
        setSelectedForCompare([selectedForCompare[1], id]);
      }
    }
  };

  const handleTriggerCompare = async () => {
    if (selectedForCompare.length !== 2) return;
    setCompareLoading(true);
    try {
      const [resA, resB] = await Promise.all([
        fetchDiagnosticById(selectedForCompare[0]),
        fetchDiagnosticById(selectedForCompare[1])
      ]);
      setCompareSessionA(resA);
      setCompareSessionB(resB);
      setIsCompareOpen(true);
    } catch (err) {
      console.error("Failed to load comparison sessions", err);
    } finally {
      setCompareLoading(false);
    }
  };

  const handleInspect = async (id: string) => {
    try {
      const full = await fetchDiagnosticById(id);
      onInspectSession(full);
    } catch (e) {
      console.error("Failed to inspect session", e);
    }
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.game.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.primary_issue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "critical":
        return <span className="badge-critical px-2 py-0.5 rounded text-[10px] font-sans">Critical</span>;
      case "unstable":
        return <span className="badge-warning px-2 py-0.5 rounded text-[10px] font-sans">Unstable</span>;
      case "stable":
      default:
        return <span className="badge-healthy px-2 py-0.5 rounded text-[10px] font-sans">Healthy</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-[#F3F4F6]">Diagnostic History</h2>
          <p className="text-xs text-[#94A3B8]">
            Track how your connection changes over time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedForCompare.length === 2 && (
            <button
              type="button"
              onClick={handleTriggerCompare}
              disabled={compareLoading}
              className="px-3 py-1.5 rounded bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>{compareLoading ? "Loading..." : "Compare Sessions (2)"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleManualReload}
            className="p-1.5 rounded bg-[#171B21] text-[#94A3B8] hover:text-[#F3F4F6] border border-[rgba(255,255,255,0.06)] transition-colors"
            title="Refresh History"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#38BDF8]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="surface-card rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by game or issue..."
            className="w-full pl-8 pr-3 py-1.5 rounded bg-[#0B0D10] border border-[rgba(255,255,255,0.08)] text-xs text-[#F3F4F6] placeholder-[#64748B] focus:outline-none focus:border-[#38BDF8]"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto text-xs">
          <span className="text-[#64748B] text-[11px] mr-1 hidden md:inline">Filter:</span>
          {[
            { id: "all", label: "All" },
            { id: "stable", label: "Healthy" },
            { id: "unstable", label: "Unstable" },
            { id: "critical", label: "Critical" }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                statusFilter === tab.id
                  ? "bg-[#171B21] text-[#F3F4F6] border border-[rgba(255,255,255,0.12)] font-medium"
                  : "text-[#94A3B8] hover:text-[#F3F4F6]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Observability Table */}
      <div className="surface-card rounded-lg overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#94A3B8] space-y-2">
            <RotateCw className="w-5 h-5 animate-spin text-[#38BDF8] mx-auto" />
            <div>Loading records from local SQLite repository...</div>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#171B21] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#64748B] mx-auto">
              <History className="w-5 h-5" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="text-sm font-semibold text-[#F3F4F6]">No diagnostics yet</h4>
              <p className="text-xs text-[#94A3B8]">
                Run your first connection test to start building your empirical network history.
              </p>
            </div>
            <div className="pt-1">
              <button
                type="button"
                onClick={onNavigateToDiagnose}
                className="px-3.5 py-1.5 rounded bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors"
              >
                Run Diagnosis →
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#171B21] text-[#64748B] text-[10px] uppercase font-semibold border-b border-[rgba(255,255,255,0.06)]">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">Compare</th>
                  <th className="py-3 px-3">Date / Time</th>
                  <th className="py-3 px-3">Target Game</th>
                  <th className="py-3 px-3 text-right">Ping</th>
                  <th className="py-3 px-3 text-right">Jitter</th>
                  <th className="py-3 px-3 text-right">Packet Loss</th>
                  <th className="py-3 px-3 text-right">Gateway</th>
                  <th className="py-3 px-3">Primary Finding</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.04)] font-mono text-[11px]">
                {filteredHistory.map((row) => {
                  const isChecked = selectedForCompare.includes(row.id);
                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-[#171B21]/60 transition-colors group cursor-pointer"
                      onClick={() => handleInspect(row.id)}
                    >
                      {/* Checkbox */}
                      <td
                        className="py-3 px-3 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelect(row.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(row.id)}
                          className="rounded bg-[#0B0D10] border-[rgba(255,255,255,0.15)] text-[#2563EB]"
                        />
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-3 text-[#94A3B8] whitespace-nowrap">
                        {new Date(row.timestamp).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit"
                        })}{" "}
                        <span className="text-[#64748B]">
                          {new Date(row.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </td>

                      {/* Game */}
                      <td className="py-3 px-3 text-[#F3F4F6] font-sans font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{row.game}</span>
                          {row.is_demo && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-[#F59E0B]/15 text-[#FBBF24] font-mono">
                              DEMO
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Ping */}
                      <td className="py-3 px-3 text-right text-[#F3F4F6] font-semibold">
                        {row.avg_ping_ms.toFixed(1)} ms
                      </td>

                      {/* Jitter */}
                      <td className="py-3 px-3 text-right text-[#94A3B8]">
                        {row.jitter_ms.toFixed(1)} ms
                      </td>

                      {/* Loss */}
                      <td className="py-3 px-3 text-right">
                        <span className={row.packet_loss_percent > 0 ? "text-[#F87171] font-semibold" : "text-[#34D399]"}>
                          {row.packet_loss_percent.toFixed(1)}%
                        </span>
                      </td>

                      {/* Gateway */}
                      <td className="py-3 px-3 text-right text-[#94A3B8]">
                        {row.gateway_latency_ms !== null ? `${row.gateway_latency_ms.toFixed(1)} ms` : "N/A"}
                      </td>

                      {/* Primary Finding */}
                      <td className="py-3 px-3 text-[#94A3B8] font-sans text-xs truncate max-w-[200px]">
                        {row.primary_issue}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {getStatusBadge(row.status)}
                      </td>

                      {/* Inspect Action */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInspect(row.id);
                          }}
                          className="text-xs text-[#38BDF8] hover:text-[#7DD3FC] flex items-center gap-1 ml-auto font-sans font-medium"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        <div className="p-3 bg-[#171B21] border-t border-[rgba(255,255,255,0.06)] flex flex-wrap items-center justify-between text-[11px] text-[#64748B]">
          <span>
            Persisted locally in SQLite repository (<code className="text-[#94A3B8]">backend/data/pingpilot.db</code>)
          </span>
          <span>{filteredHistory.length} total recorded sessions</span>
        </div>
      </div>

      {/* Comparison Modal */}
      <SessionCompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        sessionA={compareSessionA}
        sessionB={compareSessionB}
      />
    </div>
  );
};

import React from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { ConnectionStatus } from "../types/diagnostics";

interface ConnectionStatusBadgeProps {
  status: ConnectionStatus;
  statusReason?: string;
  game: string;
}

export const ConnectionStatusBadge: React.FC<ConnectionStatusBadgeProps> = ({
  status,
  statusReason,
  game
}) => {
  const statusConfig = {
    stable: {
      label: "STABLE",
      icon: CheckCircle2,
      textColor: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      glowClass: "status-glow-stable",
      symbol: "🟢",
      tagline: "Tournament Ready"
    },
    unstable: {
      label: "UNSTABLE",
      icon: AlertTriangle,
      textColor: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      glowClass: "status-glow-unstable",
      symbol: "🟡",
      tagline: "Jitter or Latency Inconsistency"
    },
    critical: {
      label: "CRITICAL",
      icon: XCircle,
      textColor: "text-rose-400",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/30",
      glowClass: "status-glow-critical",
      symbol: "🔴",
      tagline: "Severe Packet Loss / Disconnections"
    }
  };

  const current = statusConfig[status] || statusConfig.stable;
  const Icon = current.icon;

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 ${current.bgColor} ${current.borderColor} ${current.glowClass} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${current.borderColor} bg-slate-950/60`}>
          <Icon className={`w-7 h-7 ${current.textColor}`} />
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            CONNECTION STATUS • {game}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-2xl font-black tracking-wide text-white">{current.symbol} {current.label}</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${current.borderColor} ${current.textColor} bg-slate-900/40`}>
              {current.tagline}
            </span>
          </div>
          {statusReason && (
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {statusReason}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

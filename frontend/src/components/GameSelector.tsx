import React from "react";
import { Crosshair, Shield, Flame, Target, Smartphone, Globe, Plus } from "lucide-react";

interface GameSelectorProps {
  selectedGame: string;
  onSelectGame: (game: string) => void;
  customHost: string;
  onChangeCustomHost: (host: string) => void;
  disabled?: boolean;
}

const PRESET_GAMES = [
  { name: "Valorant", category: "Riot Direct", icon: Crosshair, color: "from-rose-500/20 to-red-500/10 text-rose-400" },
  { name: "Counter-Strike 2", category: "Valve SDR", icon: Target, color: "from-amber-500/20 to-orange-500/10 text-amber-400" },
  { name: "Fortnite", category: "Epic QoS", icon: Flame, color: "from-indigo-500/20 to-purple-500/10 text-indigo-400" },
  { name: "Apex Legends", category: "EA Multiplay", icon: Shield, color: "from-red-500/20 to-pink-500/10 text-pink-400" },
  { name: "COD Mobile", category: "Activision", icon: Smartphone, color: "from-cyan-500/20 to-blue-500/10 text-cyan-400" },
  { name: "PUBG", category: "Krafton AWS", icon: Globe, color: "from-yellow-500/20 to-amber-500/10 text-yellow-400" },
  { name: "Other / Custom", category: "Custom IP/Host", icon: Plus, color: "from-slate-500/20 to-slate-700/10 text-slate-300" }
];

export const GameSelector: React.FC<GameSelectorProps> = ({
  selectedGame,
  onSelectGame,
  customHost,
  onChangeCustomHost,
  disabled
}) => {
  const isCustom = selectedGame === "Other / Custom";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Target Game / Server
        </label>
        <span className="text-xs text-slate-500">
          PingPilot targets real gaming backbones
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {PRESET_GAMES.map((game) => {
          const Icon = game.icon;
          const isSelected = selectedGame === game.name;
          return (
            <button
              key={game.name}
              type="button"
              disabled={disabled}
              onClick={() => onSelectGame(game.name)}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? "bg-slate-800/90 border-cyan-500/60 shadow-md shadow-cyan-500/10 scale-[1.02]"
                  : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${game.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-white truncate">{game.name}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono truncate">{game.category}</p>
              {isSelected && (
                <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-bl" />
              )}
            </button>
          );
        })}
      </div>

      {isCustom && (
        <div className="mt-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            Enter Custom Game Hostname or IP Address:
          </label>
          <input
            type="text"
            value={customHost}
            onChange={(e) => onChangeCustomHost(e.target.value)}
            disabled={disabled}
            placeholder="e.g. 1.1.1.1, na-east.val.riotgames.com, or your local server IP"
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
          <p className="text-[11px] text-slate-500">
            PingPilot validates host input to prevent command injection and measure latency accurately.
          </p>
        </div>
      )}
    </div>
  );
};

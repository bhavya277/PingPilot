import React, { useState } from "react";

interface LatencyDataPoint {
  timeLabel: string;
  ping: number;
  jitter?: number;
  loss?: number;
}

interface LatencyChartProps {
  data?: LatencyDataPoint[];
  currentPing?: number;
  currentJitter?: number;
}

export const LatencyChart: React.FC<LatencyChartProps> = ({
  data,
  currentPing = 42,
  currentJitter = 6
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Default sample series if no historical data provided yet
  const defaultSeries: LatencyDataPoint[] = [
    { timeLabel: "50s ago", ping: 41, jitter: 5 },
    { timeLabel: "40s ago", ping: 43, jitter: 6 },
    { timeLabel: "30s ago", ping: 40, jitter: 4 },
    { timeLabel: "20s ago", ping: 58, jitter: 12 },
    { timeLabel: "10s ago", ping: 44, jitter: 7 },
    { timeLabel: "Now", ping: currentPing, jitter: currentJitter }
  ];

  const points = data && data.length > 0 ? data : defaultSeries;

  // Chart dimensions
  const width = 680;
  const height = 180;
  const paddingX = 45;
  const paddingY = 25;

  const minVal = 0;
  const maxVal = Math.max(100, Math.ceil(Math.max(...points.map((p) => p.ping)) * 1.25));

  const getX = (index: number) => {
    if (points.length <= 1) return width / 2;
    return paddingX + (index / (points.length - 1)) * (width - paddingX * 2);
  };

  const getY = (val: number) => {
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    return height - paddingY - (clamped / (maxVal - minVal)) * (height - paddingY * 2);
  };

  // Build SVG path
  const pathD = points.reduce((acc, curr, idx) => {
    const x = getX(idx);
    const y = getY(curr.ping);
    if (idx === 0) return `M ${x} ${y}`;
    
    // Smooth bezier curve
    const prevX = getX(idx - 1);
    const prevY = getY(points[idx - 1].ping);
    const midX = (prevX + x) / 2;
    return `${acc} C ${midX} ${prevY}, ${midX} ${y}, ${x} ${y}`;
  }, "");

  // Area fill under the line
  const areaD = `${pathD} L ${getX(points.length - 1)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`;

  return (
    <div className="surface-card rounded-lg p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            Telemetry Trend
          </div>
          <h4 className="text-sm font-medium text-[#F3F4F6] mt-0.5">
            Latency over time (ms)
          </h4>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-[#94A3B8]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#3B82F6] rounded-full inline-block" />
            Ping Latency
          </span>
          <span className="text-xs text-[#64748B]">Target: Stable (&lt; 60ms)</span>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 select-none overflow-visible"
        >
          <defs>
            <linearGradient id="latencyAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y Axis labels */}
          {[0, 25, 50, 75, 100].map((level) => {
            const y = getY(level);
            return (
              <g key={level} className="text-[#64748B]">
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingX - 10}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-[#64748B]"
                >
                  {level}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill="url(#latencyAreaGrad)" />

          {/* Smooth line */}
          <path
            d={pathD}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {points.map((pt, idx) => {
            const x = getX(idx);
            const y = getY(pt.ping);
            const isHovered = hoveredIndex === idx;
            const isAbnormal = pt.ping > 75;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                {/* Hit area */}
                <circle cx={x} cy={y} r="14" fill="transparent" />

                {/* Point circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? "5" : "3.5"}
                  fill={isAbnormal ? "#F59E0B" : "#111418"}
                  stroke={isAbnormal ? "#F59E0B" : "#3B82F6"}
                  strokeWidth={isHovered ? "2.5" : "1.75"}
                  className="transition-all duration-150"
                />

                {/* X Axis Time Labels */}
                <text
                  x={x}
                  y={height - 6}
                  textAnchor="middle"
                  className="text-[10px] font-mono fill-[#64748B]"
                >
                  {pt.timeLabel}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute -top-1 pointer-events-none transform -translate-x-1/2 bg-[#171B21] border border-[rgba(255,255,255,0.12)] rounded px-2.5 py-1.5 text-xs shadow-lg z-20"
            style={{ left: `${(getX(hoveredIndex) / width) * 100}%` }}
          >
            <div className="text-[10px] text-[#94A3B8] font-mono mb-0.5">
              {points[hoveredIndex].timeLabel}
            </div>
            <div className="font-mono font-semibold text-[#F3F4F6] flex items-center gap-2">
              <span>Ping: {points[hoveredIndex].ping.toFixed(1)} ms</span>
              {points[hoveredIndex].jitter !== undefined && (
                <span className="text-[#94A3B8] font-normal">
                  Jitter: {points[hoveredIndex].jitter.toFixed(1)} ms
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

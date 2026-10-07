"use client";

import React, { useState } from "react";
import { TrendingUp } from "lucide-react";

export interface ChartDataPoint {
  label: string;
  dateKey?: string;
  volume: number; // in ETB
  revenue: number; // in ETB (commission 3.5%)
  orderCount?: number;
}

const DEFAULT_7D: ChartDataPoint[] = [
  { label: "Mon", volume: 0, revenue: 0, orderCount: 0 },
  { label: "Tue", volume: 0, revenue: 0, orderCount: 0 },
  { label: "Wed", volume: 0, revenue: 0, orderCount: 0 },
  { label: "Thu", volume: 107000, revenue: 3745, orderCount: 4 },
  { label: "Fri", volume: 0, revenue: 0, orderCount: 0 },
  { label: "Sat", volume: 0, revenue: 0, orderCount: 0 },
  { label: "Sun", volume: 471800, revenue: 16513, orderCount: 3 },
];

const DEFAULT_30D: ChartDataPoint[] = [
  { label: "Day 1-5", volume: 0, revenue: 0, orderCount: 0 },
  { label: "Day 6-10", volume: 0, revenue: 0, orderCount: 0 },
  { label: "Day 11-15", volume: 0, revenue: 0, orderCount: 0 },
  { label: "Day 16-20", volume: 0, revenue: 0, orderCount: 0 },
  { label: "Day 21-25", volume: 107000, revenue: 3745, orderCount: 4 },
  { label: "Day 26-30", volume: 471800, revenue: 16513, orderCount: 3 },
];

const DEFAULT_12M: ChartDataPoint[] = [
  { label: "Jan", volume: 0, revenue: 0, orderCount: 0 },
  { label: "Feb", volume: 0, revenue: 0, orderCount: 0 },
  { label: "Mar", volume: 0, revenue: 0, orderCount: 0 },
  { label: "Apr", volume: 0, revenue: 0, orderCount: 0 },
  { label: "May", volume: 0, revenue: 0, orderCount: 0 },
  { label: "Jun", volume: 0, revenue: 0, orderCount: 0 },
  { label: "Jul", volume: 0, revenue: 0, orderCount: 0 },
  { label: "Aug", volume: 0, revenue: 0, orderCount: 0 },
  { label: "Sep", volume: 578800, revenue: 20258, orderCount: 7 },
  { label: "Oct", volume: 0, revenue: 0, orderCount: 0 },
  { label: "Nov", volume: 0, revenue: 0, orderCount: 0 },
  { label: "Dec", volume: 0, revenue: 0, orderCount: 0 },
];

interface RevenueChartProps {
  trends?: {
    "7D"?: ChartDataPoint[];
    "30D"?: ChartDataPoint[];
    "12M"?: ChartDataPoint[];
  };
  totalGmv?: number;
  totalOrders?: number;
}

export function RevenueChart({
  trends,
  totalGmv,
  totalOrders,
}: RevenueChartProps) {
  const [period, setPeriod] = useState<"7D" | "30D" | "12M">("7D");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeData: ChartDataPoint[] =
    period === "7D"
      ? trends?.["7D"] && trends["7D"].length > 0
        ? trends["7D"]
        : DEFAULT_7D
      : period === "30D"
      ? trends?.["30D"] && trends["30D"].length > 0
        ? trends["30D"]
        : DEFAULT_30D
      : trends?.["12M"] && trends["12M"].length > 0
      ? trends["12M"]
      : DEFAULT_12M;

  const maxVolume = Math.max(
    1000,
    Math.max(...activeData.map((d) => d.volume || 0)) * 1.2
  );
  const chartWidth = 620;
  const chartHeight = 180;
  const paddingX = 40;
  const paddingY = 25;

  const points = activeData.map((d, i) => {
    const x =
      paddingX +
      (i / Math.max(1, activeData.length - 1)) * (chartWidth - paddingX * 2);
    const y =
      chartHeight -
      paddingY -
      ((d.volume || 0) / maxVolume) * (chartHeight - paddingY * 2);
    return { x, y, ...d };
  });

  const linePath = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = arr[i - 1];
    const cp1x = prev.x + (pt.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (pt.x - prev.x) / 2;
    const cp2y = pt.y;
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${pt.x},${pt.y}`;
  }, "");

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x},${
          chartHeight - paddingY
        } L ${points[0].x},${chartHeight - paddingY} Z`
      : "";

  const periodTotalVolume = activeData.reduce(
    (acc, d) => acc + (d.volume || 0),
    0
  );
  const periodTotalOrders = activeData.reduce(
    (acc, d) => acc + (d.orderCount || 0),
    0
  );

  const hoveredPoint =
    hoveredIndex !== null
      ? points[hoveredIndex]
      : points.length > 0
      ? points[points.length - 1]
      : null;

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d121f]/90 p-3.5 shadow-xl backdrop-blur-xl">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-xs font-semibold text-white">
              Platform Gross Volume & Sales Velocity
            </h3>
            <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[9.5px] font-semibold text-emerald-400 border border-emerald-500/20">
              Live Updates
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            Gross transaction volume processed in Ethiopian Birr (ETB)
          </p>
        </div>

        {/* Period Switcher */}
        <div className="flex items-center gap-1 rounded-lg bg-white/[0.04] p-0.5 border border-white/5 text-[10.5px]">
          {(["7D", "30D", "12M"] as const).map((p) => (
            <button
              key={p}
              onClick={() => {
                setPeriod(p);
                setHoveredIndex(null);
              }}
              className={`rounded-md px-2.5 py-1 font-semibold transition-all cursor-pointer ${
                period === p
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Data Point Highlight */}
      <div className="mt-2.5 flex items-baseline justify-between px-1">
        <div>
          <span className="text-[10px] font-mono uppercase text-zinc-400">
            {hoveredPoint
              ? hoveredIndex !== null
                ? `Period Point: ${hoveredPoint.label} ${
                    hoveredPoint.dateKey ? `(${hoveredPoint.dateKey})` : ""
                  }`
                : `Active Range Total (${period})`
              : `Period Volume (${period})`}
          </span>
          <div className="flex items-baseline gap-2">
            <h4 className="text-lg font-bold font-mono text-white sm:text-xl">
              ETB{" "}
              {hoveredIndex !== null && hoveredPoint
                ? (hoveredPoint.volume ?? 0).toLocaleString()
                : (periodTotalVolume ?? 0).toLocaleString()}
            </h4>
            <span className="text-[11px] font-mono text-indigo-400">
              Take: ETB{" "}
              {hoveredIndex !== null && hoveredPoint
                ? (hoveredPoint.revenue ?? 0).toLocaleString()
                : Math.round((periodTotalVolume ?? 0) * 0.035).toLocaleString()}{" "}
              (3.5%)
            </span>
            <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9.5px] font-mono text-cyan-300">
              {hoveredIndex !== null && hoveredPoint
                ? `${hoveredPoint.orderCount ?? 0} orders`
                : `${periodTotalOrders} orders`}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10.5px]">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <span className="text-zinc-300">Gross Volume (ETB)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span className="text-zinc-300">Completed Orders</span>
          </div>
        </div>
      </div>

      {/* Interactive SVG Area/Line Chart */}
      <div className="relative mt-2 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-44 overflow-visible"
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.38" />
              <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {[0.2, 0.5, 0.8].map((ratio, idx) => {
            const y =
              chartHeight -
              paddingY -
              ratio * (chartHeight - paddingY * 2);
            return (
              <line
                key={idx}
                x1={paddingX}
                y1={y}
                x2={chartWidth - paddingX}
                y2={y}
                stroke="rgba(255, 255, 255, 0.06)"
                strokeDasharray="4 4"
              />
            );
          })}

          {areaPath && <path d={areaPath} fill="url(#revenueGradient)" />}

          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
            />
          )}

          {points.map((pt, i) => {
            const isHovered = hoveredIndex === i;
            const hasData = (pt.volume || 0) > 0;
            return (
              <g key={i}>
                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={paddingY}
                    x2={pt.x}
                    y2={chartHeight - paddingY}
                    stroke="#818cf8"
                    strokeWidth="1.2"
                    strokeDasharray="2 2"
                  />
                )}

                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : hasData ? 4 : 2.5}
                  fill={hasData ? "#ffffff" : "#1e293b"}
                  stroke={hasData ? "#4f46e5" : "#475569"}
                  strokeWidth={isHovered ? "3" : "2"}
                  className="transition-all duration-150 cursor-pointer"
                />

                {hasData && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={8}
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="1"
                    className="opacity-40 animate-ping pointer-events-none"
                  />
                )}

                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={22}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(i)}
                  className="cursor-pointer"
                />

                <text
                  x={pt.x}
                  y={chartHeight - 6}
                  textAnchor="middle"
                  fill={isHovered ? "#ffffff" : hasData ? "#e2e8f0" : "#71717a"}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight={hasData ? "600" : "normal"}
                  className="select-none transition-colors"
                >
                  {pt.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

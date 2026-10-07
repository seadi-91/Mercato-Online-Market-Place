"use client";

import React, { useState } from "react";
import { stockMovementChartData } from "@/data/supplier-inventory-data";
import { ArrowDownRight, ArrowUpRight, Lock, SlidersHorizontal, TrendingUp, Calendar } from "lucide-react";
import { useThemeStore } from "@/store/theme-store";

type TimeRange = "7d" | "30d" | "3m" | "6m" | "1y";

export function SupplierInventoryChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const { theme } = useThemeStore();

  const isLight = theme === "light";
  const isSystem = theme === "system";

  const data = stockMovementChartData[timeRange];

  // Calculate totals for currently selected timeframe
  const totalIn = data.reduce((acc, d) => acc + d.stockIn, 0);
  const totalOut = data.reduce((acc, d) => acc + d.stockOut, 0);
  const totalReserved = data.reduce((acc, d) => acc + d.reserved, 0);
  const netDelta = totalIn - totalOut;

  // Max value for scale
  const maxVal = Math.max(...data.map((d) => Math.max(d.stockIn, d.stockOut, d.reserved)), 100);

  const rangeLabels: Record<TimeRange, string> = {
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    "3m": "Last 3 Months",
    "6m": "Last 6 Months",
    "1y": "Past 1 Year",
  };

  return (
    <div
      className={`rounded-2xl border p-5 shadow-xs transition-colors ${
        isLight
          ? "border-slate-200 bg-white"
          : isSystem
          ? "border-blue-500/25 bg-[#0f1b3b] shadow-md shadow-blue-950/20"
          : "border-white/10 bg-[#141418]"
      }`}
    >
      {/* Top Header & Range Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className={`font-bold text-base ${isLight ? "text-slate-900" : "text-white"}`}>
              Stock Movement Overview
            </h3>
            <span
              className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                netDelta >= 0
                  ? isLight
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-emerald-500/20 text-emerald-300"
                  : isLight
                  ? "bg-amber-100 text-amber-800"
                  : "bg-amber-500/20 text-amber-300"
              }`}
            >
              Net: {netDelta >= 0 ? `+${netDelta.toLocaleString()}` : netDelta.toLocaleString()} Units
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isLight ? "text-slate-500" : isSystem ? "text-blue-300/70" : "text-zinc-400"}`}>
            Track inbound shipments, outbound sales dispatches, escrow reservations, and reconciliation deltas
          </p>
        </div>

        {/* Time Filter Pills */}
        <div
          className={`flex items-center gap-1 p-1 rounded-xl border self-start sm:self-auto ${
            isLight ? "bg-slate-100 border-slate-200" : isSystem ? "bg-[#0c1630] border-blue-500/25" : "bg-[#0d121f] border-white/10"
          }`}
        >
          {(["7d", "30d", "3m", "6m", "1y"] as TimeRange[]).map((range) => {
            const isSelected = timeRange === range;
            return (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? isLight
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                      : isSystem
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-[#2E7D32] text-white shadow-xs"
                    : isLight
                    ? "text-slate-600 hover:text-slate-900"
                    : isSystem
                    ? "text-blue-300/70 hover:text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {range.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Metric Breakdown Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
        {/* Metric: Stock In */}
        <div
          className={`rounded-xl border p-3 flex items-center gap-3 ${
            isLight
              ? "border-emerald-200 bg-emerald-50/60"
              : isSystem
              ? "border-emerald-500/25 bg-[#0b2434]/80"
              : "border-emerald-500/20 bg-emerald-500/[0.04]"
          }`}
        >
          <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ArrowDownRight className="h-4 w-4" />
          </div>
          <div>
            <p className={`text-[11px] font-medium uppercase ${isLight ? "text-emerald-900/80" : "text-emerald-300"}`}>
              Stock In
            </p>
            <p className={`text-base font-bold font-mono ${isLight ? "text-slate-900" : "text-white"}`}>
              +{totalIn.toLocaleString()} <span className="text-[10px] font-normal">Units</span>
            </p>
          </div>
        </div>

        {/* Metric: Stock Out */}
        <div
          className={`rounded-xl border p-3 flex items-center gap-3 ${
            isLight
              ? "border-blue-200 bg-blue-50/60"
              : isSystem
              ? "border-blue-500/25 bg-[#0e1d44]/80"
              : "border-blue-500/20 bg-blue-500/[0.04]"
          }`}
        >
          <div className="h-8 w-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <ArrowUpRight className="h-4 w-4" />
          </div>
          <div>
            <p className={`text-[11px] font-medium uppercase ${isLight ? "text-blue-900/80" : "text-blue-300"}`}>
              Stock Out
            </p>
            <p className={`text-base font-bold font-mono ${isLight ? "text-slate-900" : "text-white"}`}>
              -{totalOut.toLocaleString()} <span className="text-[10px] font-normal">Units</span>
            </p>
          </div>
        </div>

        {/* Metric: Reserved */}
        <div
          className={`rounded-xl border p-3 flex items-center gap-3 ${
            isLight
              ? "border-amber-200 bg-amber-50/60"
              : isSystem
              ? "border-amber-500/25 bg-[#261c36]/80"
              : "border-amber-500/20 bg-amber-500/[0.04]"
          }`}
        >
          <div className="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <p className={`text-[11px] font-medium uppercase ${isLight ? "text-amber-900/80" : "text-amber-300"}`}>
              Escrow Reserved
            </p>
            <p className={`text-base font-bold font-mono ${isLight ? "text-slate-900" : "text-white"}`}>
              {totalReserved.toLocaleString()} <span className="text-[10px] font-normal">Units</span>
            </p>
          </div>
        </div>

        {/* Metric: Net Movement */}
        <div
          className={`rounded-xl border p-3 flex items-center gap-3 ${
            isLight
              ? "border-slate-200 bg-slate-50"
              : isSystem
              ? "border-blue-500/20 bg-[#0c1630]"
              : "border-white/10 bg-white/[0.02]"
          }`}
        >
          <div className="h-8 w-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <p className={`text-[11px] font-medium uppercase ${isLight ? "text-slate-600" : isSystem ? "text-blue-300/70" : "text-zinc-400"}`}>
              Reconciliation
            </p>
            <p className={`text-base font-bold font-mono ${isLight ? "text-slate-900" : "text-white"}`}>
              100% <span className="text-[10px] font-normal text-emerald-400">Audited</span>
            </p>
          </div>
        </div>
      </div>

      {/* SVG Bar Chart Visualization */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between text-xs font-semibold mb-3">
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#2E7D32]" />
              Stock In
            </span>
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
              Stock Out
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
              Reserved Escrow
            </span>
          </div>
          <span className={`text-[11px] ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
            {rangeLabels[timeRange]}
          </span>
        </div>

        {/* Visual Bar Columns */}
        <div className="h-48 w-full flex items-end justify-between gap-2 sm:gap-4 px-2 pt-6 pb-2 relative">
          {/* Background Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
            <div className="border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-b border-white" />
          </div>

          {data.map((point, idx) => {
            const inHeight = Math.max(12, Math.round((point.stockIn / maxVal) * 140));
            const outHeight = Math.max(8, Math.round((point.stockOut / maxVal) * 140));
            const resHeight = Math.max(6, Math.round((point.reserved / maxVal) * 140));
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="relative flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
              >
                {/* Floating Tooltip */}
                {isHovered && (
                  <div
                    className={`absolute -top-14 z-20 whitespace-nowrap rounded-lg p-2 text-[10px] font-mono shadow-xl border animate-in fade-in-50 zoom-in-95 duration-150 ${
                      isLight
                        ? "bg-slate-900 text-white border-slate-700"
                        : "bg-[#090d16] text-white border-white/20"
                    }`}
                  >
                    <p className="font-bold text-amber-300 pb-0.5 border-b border-white/10 mb-1">
                      {point.label} Metrics
                    </p>
                    <div className="space-y-0.5">
                      <p className="text-emerald-400">In: +{point.stockIn.toLocaleString()}</p>
                      <p className="text-blue-400">Out: -{point.stockOut.toLocaleString()}</p>
                      <p className="text-amber-400">Reserved: {point.reserved.toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {/* Triple Bars */}
                <div className="flex items-end justify-center gap-1 w-full max-w-[42px]">
                  {/* Stock In Bar */}
                  <div
                    style={{ height: `${inHeight}px` }}
                    className="w-1/3 rounded-t-sm bg-[#2E7D32] hover:bg-[#388E3C] transition-all"
                  />
                  {/* Stock Out Bar */}
                  <div
                    style={{ height: `${outHeight}px` }}
                    className="w-1/3 rounded-t-sm bg-blue-500 hover:bg-blue-400 transition-all"
                  />
                  {/* Reserved Bar */}
                  <div
                    style={{ height: `${resHeight}px` }}
                    className="w-1/3 rounded-t-sm bg-amber-500 hover:bg-amber-400 transition-all"
                  />
                </div>

                {/* X Axis Label */}
                <span
                  className={`mt-2 text-[11px] font-medium truncate ${
                    isHovered
                      ? "text-emerald-400 font-bold"
                      : isLight
                      ? "text-slate-600"
                      : isSystem
                      ? "text-blue-300/70"
                      : "text-zinc-400"
                  }`}
                >
                  {point.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

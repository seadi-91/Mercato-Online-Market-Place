"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Lock,
  TrendingUp,
  BarChart2,
  LineChart,
  Layers,
  Sparkles,
  Calendar,
} from "lucide-react";
import { useThemeStore } from "@/store/theme-store";
import { useSupplierStore } from "@/store/supplier-store";
import { useTranslation } from "@/store/language-store";
import {
  INVENTORY_TRANSLATIONS,
  type InventoryTranslationDictionary,
} from "@/lib/i18n/inventory-translations";

type TimeRange = "7d" | "30d" | "3m" | "6m" | "1y";
type ChartMode = "bars" | "trend" | "both";

interface ChartBucketPoint {
  label: string;
  dateSubtitle?: string;
  stockIn: number;
  stockOut: number;
  reserved: number;
  adjustments: number;
}

function parseMovementDate(dateStr?: string): Date {
  if (!dateStr) return new Date();
  const clean = dateStr.includes("T") ? dateStr : dateStr.replace(" ", "T");
  const d = new Date(clean);
  return isNaN(d.getTime()) ? new Date() : d;
}

function formatNumberShort(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

export function SupplierInventoryChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [chartMode, setChartMode] = useState<ChartMode>("both");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const { theme } = useThemeStore();
  const { language } = useTranslation();
  const { inventoryMovements, products, orders, transfers } = useSupplierStore();

  const isLight = theme === "light";
  const isSystem = theme === "system";

  const tr = (
    key: keyof InventoryTranslationDictionary,
    params?: Record<string, string | number>
  ): string => {
    const dict = INVENTORY_TRANSLATIONS[language] || INVENTORY_TRANSLATIONS.en;
    let text = dict[key] || INVENTORY_TRANSLATIONS.en[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      });
    }
    return text;
  };

  // 1. Dynamic Bucket Generation: Strictly computes from live backend ledger & store state
  const data: ChartBucketPoint[] = useMemo(() => {
    const now = new Date();

    const buckets: {
      label: string;
      dateSubtitle?: string;
      start: Date;
      end: Date;
    }[] = [];

    if (timeRange === "7d") {
      // 7 consecutive days ending today
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
        const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
        const label = d.toLocaleDateString("en-US", { weekday: "short" });
        const dateSubtitle = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        buckets.push({ label, dateSubtitle, start, end });
      }
    } else if (timeRange === "30d") {
      // 4 rolling weekly buckets
      for (let w = 0; w < 4; w++) {
        const daysBackEnd = (3 - w) * 7;
        const daysBackStart = daysBackEnd + 7;
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysBackStart, 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysBackEnd, 23, 59, 59, 999);
        const label = `Week ${w + 1}`;
        const dateSubtitle = `${start.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
        buckets.push({ label, dateSubtitle, start, end });
      }
    } else if (timeRange === "3m") {
      // 3 calendar months ending at current month
      for (let m = 2; m >= 0; m--) {
        const target = new Date(now.getFullYear(), now.getMonth() - m, 1);
        const start = new Date(target.getFullYear(), target.getMonth(), 1, 0, 0, 0, 0);
        const end = new Date(target.getFullYear(), target.getMonth() + 1, 0, 23, 59, 59, 999);
        const label = target.toLocaleDateString("en-US", { month: "short" });
        const dateSubtitle = target.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        buckets.push({ label, dateSubtitle, start, end });
      }
    } else if (timeRange === "6m") {
      // 6 calendar months
      for (let m = 5; m >= 0; m--) {
        const target = new Date(now.getFullYear(), now.getMonth() - m, 1);
        const start = new Date(target.getFullYear(), target.getMonth(), 1, 0, 0, 0, 0);
        const end = new Date(target.getFullYear(), target.getMonth() + 1, 0, 23, 59, 59, 999);
        const label = target.toLocaleDateString("en-US", { month: "short" });
        const dateSubtitle = target.toLocaleDateString("en-US", { month: "short", year: "numeric" });
        buckets.push({ label, dateSubtitle, start, end });
      }
    } else if (timeRange === "1y") {
      // 4 quarters
      for (let q = 3; q >= 0; q--) {
        const targetMonth = now.getMonth() - q * 3;
        const targetDate = new Date(now.getFullYear(), targetMonth, 1);
        const qNum = Math.floor(targetDate.getMonth() / 3) + 1;
        const qYear = String(targetDate.getFullYear()).slice(-2);
        const start = new Date(targetDate.getFullYear(), (qNum - 1) * 3, 1, 0, 0, 0, 0);
        const end = new Date(targetDate.getFullYear(), qNum * 3, 0, 23, 59, 59, 999);
        const label = `Q${qNum} '${qYear}`;
        const dateSubtitle = `Quarter ${qNum} ${targetDate.getFullYear()}`;
        buckets.push({ label, dateSubtitle, start, end });
      }
    }

    const currentLiveReserved = products.reduce(
      (acc, p) => acc + (Number(p.reservedStock) || 0),
      0
    );

    return buckets.map((bucket, bIdx) => {
      // Live movements in bucket
      const bucketMovements = inventoryMovements.filter((m) => {
        const d = parseMovementDate(m.date);
        return d >= bucket.start && d <= bucket.end;
      });

      const liveStockIn = bucketMovements
        .filter((m) => m.type === "received" || (m.quantity > 0 && m.type !== "transferred"))
        .reduce((sum, m) => sum + Math.abs(Number(m.quantity) || 0), 0);

      let liveStockOut = bucketMovements
        .filter(
          (m) =>
            m.type === "sold" ||
            m.type === "damaged" ||
            (m.quantity < 0 && m.type !== "transferred")
        )
        .reduce((sum, m) => sum + Math.abs(Number(m.quantity) || 0), 0);

      // Orders dispatched/completed in this bucket
      orders.forEach((o) => {
        if (["completed", "delivered", "shipped"].includes(o.orderStatus)) {
          const oDate = parseMovementDate(o.orderDate);
          if (oDate >= bucket.start && oDate <= bucket.end) {
            const alreadyInMovements = bucketMovements.some(
              (m) => m.type === "sold" && m.reference?.includes(o.orderNumber)
            );
            if (!alreadyInMovements) {
              liveStockOut += Number(o.quantity) || 0;
            }
          }
        }
      });

      // Escrow reservations in this bucket
      let liveReserved = 0;
      orders.forEach((o) => {
        if (
          o.paymentStatus === "escrow_secured" ||
          ["processing", "confirmed"].includes(o.orderStatus)
        ) {
          const oDate = parseMovementDate(o.orderDate);
          if (oDate >= bucket.start && oDate <= bucket.end) {
            liveReserved += Number(o.quantity) || 0;
          }
        }
      });

      // Latest bucket accounts for current active product reservations
      if (bIdx === buckets.length - 1 && liveReserved === 0 && currentLiveReserved > 0) {
        liveReserved = currentLiveReserved;
      }

      const liveAdjustments = bucketMovements
        .filter((m) => m.type === "adjusted")
        .reduce((sum, m) => sum + (Number(m.quantity) || 0), 0);

      return {
        label: bucket.label,
        dateSubtitle: bucket.dateSubtitle,
        stockIn: Math.round(liveStockIn),
        stockOut: Math.round(liveStockOut),
        reserved: Math.round(liveReserved),
        adjustments: Math.round(liveAdjustments),
      };
    });
  }, [inventoryMovements, products, orders, transfers, timeRange]);

  // Metric Breakdown
  const totalIn = useMemo(() => data.reduce((acc, d) => acc + d.stockIn, 0), [data]);
  const totalOut = useMemo(() => data.reduce((acc, d) => acc + d.stockOut, 0), [data]);
  const totalReserved = useMemo(() => {
    const sum = data.reduce((acc, d) => acc + d.reserved, 0);
    const liveRes = products.reduce((acc, p) => acc + (Number(p.reservedStock) || 0), 0);
    return Math.max(sum, liveRes);
  }, [data, products]);
  const netDelta = totalIn - totalOut;
  const auditCount = inventoryMovements.filter((m) => m.type === "adjusted").length;

  // SVG Chart Geometry Constants
  const svgWidth = 840;
  const svgHeight = 260;
  const marginLeft = 60;
  const marginRight = 25;
  const marginTop = 30;
  const marginBottom = 45;

  const plotWidth = svgWidth - marginLeft - marginRight;
  const plotHeight = svgHeight - marginTop - marginBottom;

  // Max value calculation with 15% headroom for clean breathing space
  const rawMax = Math.max(
    ...data.map((d) => Math.max(d.stockIn, d.stockOut, d.reserved)),
    0
  );
  const maxVal = rawMax > 0 ? Math.ceil(rawMax * 1.15) : 10;

  // Y-Axis Ticks (5 steps: 0%, 25%, 50%, 75%, 100%)
  const yTicks = [0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
    const val = Math.round(ratio * maxVal);
    const y = marginTop + plotHeight - ratio * plotHeight;
    return { val, y };
  });

  // Calculate coordinates for each column and bar
  const N = data.length;
  const slotWidth = plotWidth / Math.max(1, N);

  const columnLayouts = data.map((d, i) => {
    const centerX = marginLeft + i * slotWidth + slotWidth / 2;
    const barWidth = Math.min(18, Math.max(9, slotWidth * 0.22));
    const gap = 3;
    const clusterWidth = barWidth * 3 + gap * 2;

    const inH = d.stockIn > 0 ? Math.max(4, Math.round((d.stockIn / maxVal) * plotHeight)) : 0;
    const outH = d.stockOut > 0 ? Math.max(4, Math.round((d.stockOut / maxVal) * plotHeight)) : 0;
    const resH = d.reserved > 0 ? Math.max(4, Math.round((d.reserved / maxVal) * plotHeight)) : 0;

    const inX = centerX - clusterWidth / 2;
    const inY = marginTop + plotHeight - inH;

    const outX = inX + barWidth + gap;
    const outY = marginTop + plotHeight - outH;

    const resX = outX + barWidth + gap;
    const resY = marginTop + plotHeight - resH;

    // Velocity Trend Point (net intake curve)
    const netNormalized = Math.max(0, Math.min(maxVal, d.stockIn));
    const trendY = maxVal > 0 ? marginTop + plotHeight - Math.round((netNormalized / maxVal) * plotHeight) : marginTop + plotHeight;

    return {
      ...d,
      index: i,
      centerX,
      barWidth,
      inX,
      inY,
      inH,
      outX,
      outY,
      outH,
      resX,
      resY,
      resH,
      trendY,
    };
  });

  // Smooth Spline Line Path for Velocity Curve
  const splinePoints = columnLayouts.map((c) => ({ x: c.centerX, y: c.trendY }));
  const trendLinePath = splinePoints.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = arr[i - 1];
    const cp1x = prev.x + (pt.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (pt.x - prev.x) / 2;
    const cp2y = pt.y;
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${pt.x},${pt.y}`;
  }, "");

  const trendAreaPath =
    splinePoints.length > 0
      ? `${trendLinePath} L ${splinePoints[splinePoints.length - 1].x},${
          marginTop + plotHeight
        } L ${splinePoints[0].x},${marginTop + plotHeight} Z`
      : "";

  const rangeLabels: Record<TimeRange, string> = {
    "7d": "7 Days",
    "30d": "30 Days",
    "3m": "3 Months",
    "6m": "6 Months",
    "1y": "1 Year",
  };

  const hoveredItem = hoveredIdx !== null ? columnLayouts[hoveredIdx] : null;

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 shadow-xs transition-colors ${
        isLight
          ? "border-slate-200 bg-white"
          : isSystem
          ? "border-blue-500/25 bg-[#0f1b3b] shadow-md shadow-blue-950/20"
          : "border-white/10 bg-[#141418]"
      }`}
    >
      {/* 1. Header with Range Buttons & Chart Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={`font-bold text-sm sm:text-base ${isLight ? "text-slate-900" : "text-white"}`}>
            {tr("chartTitle")}
          </h3>
          <span
            className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold font-mono ${
              netDelta >= 0
                ? isLight
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-emerald-500/20 text-emerald-300"
                : isLight
                ? "bg-amber-100 text-amber-800"
                : "bg-amber-500/20 text-amber-300"
            }`}
          >
            {tr("chartNet")}{" "}
            {netDelta >= 0 ? `+${netDelta.toLocaleString()}` : netDelta.toLocaleString()} {tr("chartUnits")}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Chart Display Mode Switcher */}
          <div
            className={`flex items-center gap-1 p-1 rounded-xl border text-xs ${
              isLight
                ? "bg-slate-100 border-slate-200"
                : isSystem
                ? "bg-[#0c1630] border-blue-500/25"
                : "bg-[#0d121f] border-white/10"
            }`}
          >
            <button
              onClick={() => setChartMode("bars")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                chartMode === "bars"
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
              title="Grouped Bars View"
            >
              <BarChart2 className="h-3.5 w-3.5" />
              <span className="hidden md:inline">{tr("chartViewBars")}</span>
            </button>

            <button
              onClick={() => setChartMode("trend")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                chartMode === "trend"
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
              title="Velocity Trendline"
            >
              <LineChart className="h-3.5 w-3.5" />
              <span className="hidden md:inline">{tr("chartViewTrend")}</span>
            </button>

            <button
              onClick={() => setChartMode("both")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                chartMode === "both"
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
              title="Combined Bars & Spline"
            >
              <Layers className="h-3.5 w-3.5" />
              <span className="hidden md:inline">{tr("chartViewBoth")}</span>
            </button>
          </div>

          {/* Time Filter Pills */}
          <div
            className={`flex items-center gap-1 p-1 rounded-xl border ${
              isLight
                ? "bg-slate-100 border-slate-200"
                : isSystem
                ? "bg-[#0c1630] border-blue-500/25"
                : "bg-[#0d121f] border-white/10"
            }`}
          >
            {(["7d", "30d", "3m", "6m", "1y"] as TimeRange[]).map((range) => {
              const isSelected = timeRange === range;
              return (
                <button
                  key={range}
                  onClick={() => {
                    setTimeRange(range);
                    setHoveredIdx(null);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? isLight
                        ? "bg-white text-slate-900 shadow-xs border border-slate-200 font-bold"
                        : isSystem
                        ? "bg-blue-600 text-white shadow-xs font-bold"
                        : "bg-[#2E7D32] text-white shadow-xs font-bold"
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
      </div>

      {/* 2. Four Precision Executive Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
        {/* Metric: Stock In */}
        <div
          className={`rounded-xl border p-3 flex items-center gap-3 transition-colors ${
            isLight
              ? "border-emerald-200 bg-emerald-50/60"
              : isSystem
              ? "border-emerald-500/25 bg-[#0b2434]/80"
              : "border-emerald-500/20 bg-emerald-500/[0.04]"
          }`}
        >
          <div className="h-9 w-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ArrowDownRight className="h-4 w-4" />
          </div>
          <div>
            <p
              className={`text-[11px] font-semibold uppercase tracking-wider ${
                isLight ? "text-emerald-900/80" : "text-emerald-300"
              }`}
            >
              {tr("chartStockIn")}
            </p>
            <p className={`text-base font-bold font-mono ${isLight ? "text-slate-900" : "text-white"}`}>
              +{totalIn.toLocaleString()}{" "}
              <span className="text-[10px] font-normal opacity-70">{tr("chartUnits")}</span>
            </p>
          </div>
        </div>

        {/* Metric: Stock Out */}
        <div
          className={`rounded-xl border p-3 flex items-center gap-3 transition-colors ${
            isLight
              ? "border-blue-200 bg-blue-50/60"
              : isSystem
              ? "border-blue-500/25 bg-[#0e1d44]/80"
              : "border-blue-500/20 bg-blue-500/[0.04]"
          }`}
        >
          <div className="h-9 w-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <ArrowUpRight className="h-4 w-4" />
          </div>
          <div>
            <p
              className={`text-[11px] font-semibold uppercase tracking-wider ${
                isLight ? "text-blue-900/80" : "text-blue-300"
              }`}
            >
              {tr("chartStockOut")}
            </p>
            <p className={`text-base font-bold font-mono ${isLight ? "text-slate-900" : "text-white"}`}>
              -{totalOut.toLocaleString()}{" "}
              <span className="text-[10px] font-normal opacity-70">{tr("chartUnits")}</span>
            </p>
          </div>
        </div>

        {/* Metric: Reserved */}
        <div
          className={`rounded-xl border p-3 flex items-center gap-3 transition-colors ${
            isLight
              ? "border-amber-200 bg-amber-50/60"
              : isSystem
              ? "border-amber-500/25 bg-[#261c36]/80"
              : "border-amber-500/20 bg-amber-500/[0.04]"
          }`}
        >
          <div className="h-9 w-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <p
              className={`text-[11px] font-semibold uppercase tracking-wider ${
                isLight ? "text-amber-900/80" : "text-amber-300"
              }`}
            >
              {tr("chartReserved")}
            </p>
            <p className={`text-base font-bold font-mono ${isLight ? "text-slate-900" : "text-white"}`}>
              {totalReserved.toLocaleString()}{" "}
              <span className="text-[10px] font-normal opacity-70">{tr("chartUnits")}</span>
            </p>
          </div>
        </div>

        {/* Metric: Reconciliation & Cycle Audit */}
        <div
          className={`rounded-xl border p-3 flex items-center gap-3 transition-colors ${
            isLight
              ? "border-slate-200 bg-slate-50"
              : isSystem
              ? "border-blue-500/20 bg-[#0c1630]"
              : "border-white/10 bg-white/[0.02]"
          }`}
        >
          <div className="h-9 w-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <p
              className={`text-[11px] font-semibold uppercase tracking-wider ${
                isLight ? "text-slate-600" : isSystem ? "text-blue-300/70" : "text-zinc-400"
              }`}
            >
              {tr("chartReconciliation")}
            </p>
            <p className={`text-base font-bold font-mono ${isLight ? "text-slate-900" : "text-white"}`}>
              {auditCount}{" "}
              <span className="text-[10px] font-normal text-emerald-400">
                {tr("chartAudited")}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* 3. High-Precision Responsive SVG Chart Visualization */}
      <div className="mt-4 pt-4 border-t border-white/5 relative">
        {/* Legend Header */}
        <div className="flex flex-wrap items-center justify-between text-xs font-semibold mb-3 gap-2">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2.5 w-2.5 rounded-xs bg-[#2E7D32]" />
              <span>{tr("chartStockIn")}</span>
            </span>
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="h-2.5 w-2.5 rounded-xs bg-blue-500" />
              <span>{tr("chartStockOut")}</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="h-2.5 w-2.5 rounded-xs bg-amber-500" />
              <span>{tr("chartReserved")}</span>
            </span>
            {(chartMode === "trend" || chartMode === "both") && (
              <span className="flex items-center gap-1.5 text-cyan-400 font-mono">
                <span className="h-1 w-3 rounded-full bg-cyan-400" />
                <span>{tr("chartViewTrend")}</span>
              </span>
            )}
          </div>

          <span
            className={`text-[11px] font-medium font-mono ${
              isLight ? "text-slate-500" : "text-zinc-400"
            }`}
          >
            {rangeLabels[timeRange]}
          </span>
        </div>

        {/* SVG Canvas Area */}
        <div className="relative w-full overflow-x-auto no-scrollbar rounded-xl">
          <div className="min-w-[620px] sm:min-w-full">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto select-none overflow-visible"
              style={{ maxHeight: "310px" }}
            >
            <defs>
              {/* Gradients for bars */}
              <linearGradient id="invGreenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>

              <linearGradient id="invBlueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>

              <linearGradient id="invAmberGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>

              {/* Area gradient for spline trend */}
              <linearGradient id="invTrendAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>

              {/* Filter for glowing line effect */}
              <filter id="invGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#06b6d4" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Horizontal Grid Lines & Y-Axis Labels */}
            {yTicks.map((tick, tIdx) => (
              <g key={tIdx}>
                <line
                  x1={marginLeft}
                  y1={tick.y}
                  x2={marginLeft + plotWidth}
                  y2={tick.y}
                  stroke="currentColor"
                  strokeDasharray="4 4"
                  className={isLight ? "text-slate-200" : isSystem ? "text-blue-500/20" : "text-white/10"}
                />
                <text
                  x={marginLeft - 10}
                  y={tick.y + 3.5}
                  textAnchor="end"
                  className={`text-[10px] font-mono font-medium ${
                    isLight ? "fill-slate-400" : "fill-zinc-500"
                  }`}
                >
                  {formatNumberShort(tick.val)}
                </text>
              </g>
            ))}

            {/* Baseline X Axis */}
            <line
              x1={marginLeft}
              y1={marginTop + plotHeight}
              x2={marginLeft + plotWidth}
              y2={marginTop + plotHeight}
              stroke="currentColor"
              className={isLight ? "text-slate-300" : "text-white/20"}
              strokeWidth="1.5"
            />

            {/* Hovered Column Highlight Backdrop */}
            {hoveredIdx !== null && (
              <rect
                x={marginLeft + hoveredIdx * slotWidth}
                y={marginTop}
                width={slotWidth}
                height={plotHeight}
                className={isLight ? "fill-slate-900/[0.04]" : "fill-white/[0.04]"}
                rx="6"
              />
            )}

            {/* Grouped Bars Render (when mode is bars or both) */}
            {(chartMode === "bars" || chartMode === "both") && (
              <g>
                {columnLayouts.map((col) => {
                  const isHovered = hoveredIdx === col.index;
                  return (
                    <g key={col.index} className="transition-opacity duration-150">
                      {/* Bar 1: Stock In (Green) */}
                      <rect
                        x={col.inX}
                        y={col.inY}
                        width={col.barWidth}
                        height={col.inH}
                        rx="3"
                        fill="url(#invGreenGrad)"
                        className={`transition-all duration-200 ${
                          isHovered ? "filter brightness-125" : "opacity-90"
                        }`}
                      />

                      {/* Bar 2: Stock Out (Blue) */}
                      <rect
                        x={col.outX}
                        y={col.outY}
                        width={col.barWidth}
                        height={col.outH}
                        rx="3"
                        fill="url(#invBlueGrad)"
                        className={`transition-all duration-200 ${
                          isHovered ? "filter brightness-125" : "opacity-90"
                        }`}
                      />

                      {/* Bar 3: Reserved (Amber) */}
                      <rect
                        x={col.resX}
                        y={col.resY}
                        width={col.barWidth}
                        height={col.resH}
                        rx="3"
                        fill="url(#invAmberGrad)"
                        className={`transition-all duration-200 ${
                          isHovered ? "filter brightness-125" : "opacity-90"
                        }`}
                      />
                    </g>
                  );
                })}
              </g>
            )}

            {/* Spline Trend Area & Curve (when mode is trend or both) */}
            {(chartMode === "trend" || chartMode === "both") && (
              <g>
                {/* Gradient Area Fill */}
                <path d={trendAreaPath} fill="url(#invTrendAreaGrad)" />

                {/* Spline Line */}
                <path
                  d={trendLinePath}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  filter="url(#invGlow)"
                />

                {/* Circles at each Vertex */}
                {columnLayouts.map((col) => {
                  const isHovered = hoveredIdx === col.index;
                  return (
                    <g key={`dot-${col.index}`}>
                      <circle
                        cx={col.centerX}
                        cy={col.trendY}
                        r={isHovered ? 5.5 : 3.5}
                        fill="#06b6d4"
                        stroke={isLight ? "#ffffff" : "#0d121f"}
                        strokeWidth="2"
                        className="transition-all duration-200"
                      />
                      {isHovered && (
                        <circle
                          cx={col.centerX}
                          cy={col.trendY}
                          r="9"
                          fill="none"
                          stroke="#06b6d4"
                          strokeWidth="1.5"
                          opacity="0.6"
                          className="animate-ping"
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            )}

            {/* X-Axis Tick Labels below the chart */}
            {columnLayouts.map((col) => {
              const isHovered = hoveredIdx === col.index;
              return (
                <g key={`xlabel-${col.index}`}>
                  <text
                    x={col.centerX}
                    y={marginTop + plotHeight + 18}
                    textAnchor="middle"
                    className={`text-[11px] font-mono transition-colors ${
                      isHovered
                        ? "font-bold fill-emerald-400"
                        : isLight
                        ? "fill-slate-600 font-medium"
                        : isSystem
                        ? "fill-blue-200 font-medium"
                        : "fill-zinc-400 font-medium"
                    }`}
                  >
                    {col.label}
                  </text>
                  {col.dateSubtitle && (
                    <text
                      x={col.centerX}
                      y={marginTop + plotHeight + 30}
                      textAnchor="middle"
                      className={`text-[9px] font-sans ${
                        isLight ? "fill-slate-400" : "fill-zinc-500"
                      }`}
                    >
                      {col.dateSubtitle.split(" - ")[0]}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Interactive Full-Height Hitbox Columns for Smooth Hover */}
            {columnLayouts.map((col) => (
              <rect
                key={`hitbox-${col.index}`}
                x={marginLeft + col.index * slotWidth}
                y={marginTop}
                width={slotWidth}
                height={plotHeight + marginBottom}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(col.index)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            ))}
          </svg>

          {/* Floating High-Contrast Hover Tooltip */}
          {hoveredItem && (
            <div
              className={`absolute top-2 z-30 pointer-events-none rounded-xl p-3 text-xs font-mono shadow-2xl border transition-all duration-150 animate-in fade-in-50 zoom-in-95 ${
                isLight
                  ? "bg-slate-900 text-white border-slate-700 shadow-slate-950/20"
                  : isSystem
                  ? "bg-[#091024] text-white border-blue-500/40 shadow-blue-950/40"
                  : "bg-[#090d16] text-white border-white/20 shadow-black/80"
              }`}
              style={{
                left: `${Math.min(
                  Math.max(12, ((hoveredItem.centerX) / svgWidth) * 100),
                  72
                )}%`,
              }}
            >
              <div className="flex items-center justify-between gap-4 pb-1.5 border-b border-white/10 mb-2">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-amber-400" />
                  <span>{hoveredItem.label}</span>
                </span>
                {hoveredItem.dateSubtitle && (
                  <span className="text-[10px] text-zinc-400 font-sans font-normal">
                    {hoveredItem.dateSubtitle}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between gap-4 text-emerald-400">
                  <span className="flex items-center gap-1 text-[11px]">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Inbound Intake:</span>
                  </span>
                  <span className="font-bold">+{hoveredItem.stockIn.toLocaleString()} Units</span>
                </div>

                <div className="flex items-center justify-between gap-4 text-blue-400">
                  <span className="flex items-center gap-1 text-[11px]">
                    <span className="h-2 w-2 rounded-full bg-blue-400" />
                    <span>Outbound Sales:</span>
                  </span>
                  <span className="font-bold">-{hoveredItem.stockOut.toLocaleString()} Units</span>
                </div>

                <div className="flex items-center justify-between gap-4 text-amber-400">
                  <span className="flex items-center gap-1 text-[11px]">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span>Escrow Reserved:</span>
                  </span>
                  <span className="font-bold">{hoveredItem.reserved.toLocaleString()} Units</span>
                </div>

                <div className="pt-1 mt-1 border-t border-white/10 flex items-center justify-between gap-4 text-cyan-300 font-bold">
                  <span>Net Flow:</span>
                  <span>
                    {hoveredItem.stockIn - hoveredItem.stockOut >= 0 ? "+" : ""}
                    {(hoveredItem.stockIn - hoveredItem.stockOut).toLocaleString()} Units
                  </span>
                </div>

                {hoveredItem.adjustments !== 0 && (
                  <div className="flex items-center justify-between gap-4 text-purple-400 text-[10px]">
                    <span>Reconciliation:</span>
                    <span>
                      {hoveredItem.adjustments > 0 ? `+${hoveredItem.adjustments}` : hoveredItem.adjustments}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

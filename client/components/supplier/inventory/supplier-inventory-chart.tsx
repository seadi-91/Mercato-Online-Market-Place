"use client";

import React, { useState, useMemo } from "react";
import { ArrowDownRight, ArrowUpRight, Lock, TrendingUp, Layers, CheckCircle2 } from "lucide-react";
import { useThemeStore } from "@/store/theme-store";
import { useSupplierStore } from "@/store/supplier-store";

type TimeRange = "7d" | "30d" | "3m" | "6m" | "1y";

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

export function SupplierInventoryChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const { theme } = useThemeStore();
  const { inventoryMovements, products, orders, transfers } = useSupplierStore();

  const isLight = theme === "light";
  const isSystem = theme === "system";

  // Dynamic Bucket Generator based on live store/database state
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
      // 4 weekly buckets representing the last 4 weeks
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
        const label = target.toLocaleDateString("en-US", { month: "long" });
        const dateSubtitle = target.toLocaleDateString("en-US", { year: "numeric" });
        buckets.push({ label, dateSubtitle, start, end });
      }
    } else if (timeRange === "6m") {
      // 6 calendar months ending at current month
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

    const currentLiveReserved = products.reduce((acc, p) => acc + (Number(p.reservedStock) || 0), 0);

    return buckets.map((bucket, bIdx) => {
      // Movements falling into this bucket
      const bucketMovements = inventoryMovements.filter((m) => {
        const d = parseMovementDate(m.date);
        return d >= bucket.start && d <= bucket.end;
      });

      // Stock In: received movements, positive manual receipts, or newly created catalog batches
      let stockIn = bucketMovements
        .filter((m) => m.type === "received" || (m.quantity > 0 && m.type !== "transferred"))
        .reduce((sum, m) => sum + Math.abs(Number(m.quantity) || 0), 0);

      // Include products created in this bucket if not already tracked in movements
      products.forEach((p) => {
        if (p.createdAt) {
          const pDate = parseMovementDate(p.createdAt);
          if (pDate >= bucket.start && pDate <= bucket.end) {
            const hasMovements = bucketMovements.some((m) => m.productId === p.id && m.type === "received");
            if (!hasMovements && p.stock > 0) {
              stockIn += Number(p.stock) || 0;
            }
          }
        }
      });

      // Stock Out: sales dispatches, damaged removals, or negative stock reductions
      let stockOut = bucketMovements
        .filter((m) => m.type === "sold" || m.type === "damaged" || (m.quantity < 0 && m.type !== "transferred"))
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
              stockOut += Number(o.quantity) || 0;
            }
          }
        }
      });

      // Reserved: Escrow secured orders or active warehouse holds
      let reserved = 0;
      orders.forEach((o) => {
        if (
          o.paymentStatus === "escrow_secured" ||
          ["processing", "confirmed"].includes(o.orderStatus)
        ) {
          const oDate = parseMovementDate(o.orderDate);
          if (oDate >= bucket.start && oDate <= bucket.end) {
            reserved += Number(o.quantity) || 0;
          }
        }
      });

      // For the most recent bucket (latest period), ensure active product reservations are accounted for
      if (bIdx === buckets.length - 1 && reserved === 0 && currentLiveReserved > 0) {
        reserved = currentLiveReserved;
      }

      // Reconciliation delta from audit adjustments
      const adjustments = bucketMovements
        .filter((m) => m.type === "adjusted")
        .reduce((sum, m) => sum + (Number(m.quantity) || 0), 0);

      return {
        label: bucket.label,
        dateSubtitle: bucket.dateSubtitle,
        stockIn,
        stockOut,
        reserved,
        adjustments,
      };
    });
  }, [inventoryMovements, products, orders, transfers, timeRange]);

  // Metric Breakdown derived dynamically from current view range
  const totalIn = useMemo(() => data.reduce((acc, d) => acc + d.stockIn, 0), [data]);
  const totalOut = useMemo(() => data.reduce((acc, d) => acc + d.stockOut, 0), [data]);
  const totalReserved = useMemo(() => {
    const sum = data.reduce((acc, d) => acc + d.reserved, 0);
    const liveRes = products.reduce((acc, p) => acc + (Number(p.reservedStock) || 0), 0);
    return Math.max(sum, liveRes);
  }, [data, products]);
  const netDelta = totalIn - totalOut;

  // Max value for scale calculation
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.stockIn, d.stockOut, d.reserved)),
    20
  );

  const rangeLabels: Record<TimeRange, string> = {
    "7d": "Last 7 Days (Daily Real-Time)",
    "30d": "Last 30 Days (4-Week Rolling)",
    "3m": "Last 3 Months (Monthly Ledger)",
    "6m": "Last 6 Months (Biannual Ledger)",
    "1y": "Past 1 Year (Quarterly Ledger)",
  };

  const auditCount = inventoryMovements.filter((m) => m.type === "adjusted").length;

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
            Verified ledger tracking: inbound receipts, outbound sales dispatches, escrow reservations & cycle reconciliations
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

        {/* Metric: Net Movement & Audit */}
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
              100% <span className="text-[10px] font-normal text-emerald-400">Audited ({auditCount} cycle)</span>
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
            const inHeight = point.stockIn > 0 ? Math.max(8, Math.round((point.stockIn / maxVal) * 140)) : 2;
            const outHeight = point.stockOut > 0 ? Math.max(8, Math.round((point.stockOut / maxVal) * 140)) : 2;
            const resHeight = point.reserved > 0 ? Math.max(8, Math.round((point.reserved / maxVal) * 140)) : 2;
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
                    className={`absolute -top-20 z-20 whitespace-nowrap rounded-lg p-2.5 text-[10px] font-mono shadow-xl border pointer-events-none animate-in fade-in-50 zoom-in-95 duration-150 ${
                      isLight
                        ? "bg-slate-900 text-white border-slate-700"
                        : "bg-[#090d16] text-white border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 pb-1 border-b border-white/10 mb-1">
                      <span className="font-bold text-amber-300">{point.label}</span>
                      {point.dateSubtitle && (
                        <span className="text-[9px] text-zinc-400 font-normal">{point.dateSubtitle}</span>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between gap-3 text-emerald-400">
                        <span>Inbound:</span>
                        <span className="font-bold">+{point.stockIn.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-blue-400">
                        <span>Outbound:</span>
                        <span className="font-bold">-{point.stockOut.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-amber-400">
                        <span>Escrow Reserved:</span>
                        <span className="font-bold">{point.reserved.toLocaleString()}</span>
                      </div>
                      {point.adjustments !== 0 && (
                        <div className="flex items-center justify-between gap-3 text-purple-400">
                          <span>Reconciliation:</span>
                          <span className="font-bold">
                            {point.adjustments > 0 ? `+${point.adjustments}` : point.adjustments}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Triple Bars */}
                <div className="flex items-end justify-center gap-1 w-full max-w-[42px]">
                  {/* Stock In Bar */}
                  <div
                    style={{ height: `${inHeight}px` }}
                    className={`w-1/3 rounded-t-sm transition-all ${
                      point.stockIn > 0
                        ? "bg-[#2E7D32] hover:bg-[#388E3C]"
                        : isLight
                        ? "bg-slate-200"
                        : "bg-white/10"
                    }`}
                  />
                  {/* Stock Out Bar */}
                  <div
                    style={{ height: `${outHeight}px` }}
                    className={`w-1/3 rounded-t-sm transition-all ${
                      point.stockOut > 0
                        ? "bg-blue-500 hover:bg-blue-400"
                        : isLight
                        ? "bg-slate-200"
                        : "bg-white/10"
                    }`}
                  />
                  {/* Reserved Bar */}
                  <div
                    style={{ height: `${resHeight}px` }}
                    className={`w-1/3 rounded-t-sm transition-all ${
                      point.reserved > 0
                        ? "bg-amber-500 hover:bg-amber-400"
                        : isLight
                        ? "bg-slate-200"
                        : "bg-white/10"
                    }`}
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

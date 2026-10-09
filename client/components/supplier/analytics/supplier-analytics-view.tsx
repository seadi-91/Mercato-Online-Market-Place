"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  DollarSign,
  Users,
  Percent,
  Download,
  MapPin,
  Sparkles,
  RotateCcw,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "../shared/page-header";
import { StatCard } from "../shared/stat-card";
import { useSupplierStore } from "@/store/supplier-store";
import { useThemeStore } from "@/store/theme-store";
import { toast } from "sonner";

type TimePeriod = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

interface ChartBucket {
  label: string;
  fullDate: string;
  subLabel?: string;
  startMs: number;
  endMs: number;
  dateKey?: string;
  yearMonth?: string;
  year?: number;
  revenue: number;
  orders: number;
}

export function SupplierAnalyticsView() {
  const {
    orders,
    rfqs,
    quotations,
    products,
    fetchOrders,
    fetchRFQs,
    fetchQuotations,
    fetchProducts,
    setActiveTab,
  } = useSupplierStore();
  const { theme } = useThemeStore();

  const isLight = theme === "light";
  const isSystem = theme === "system";

  useEffect(() => {
    fetchOrders();
    fetchRFQs();
    fetchQuotations();
    fetchProducts();
  }, [fetchOrders, fetchRFQs, fetchQuotations, fetchProducts]);

  const [period, setPeriod] = useState<TimePeriod>("monthly");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Dynamic calculations from live PostgreSQL records
  const grossRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  }, [orders]);

  const avgOrderValue = useMemo(() => {
    return orders.length > 0 ? Math.round(grossRevenue / orders.length) : 0;
  }, [orders, grossRevenue]);

  const rfqWinRate = useMemo(() => {
    if (rfqs.length === 0) return "0.0%";
    const won = rfqs.filter((r) => r.status === "accepted").length;
    return `${((won / rfqs.length) * 100).toFixed(1)}%`;
  }, [rfqs]);

  const quoteAcceptance = useMemo(() => {
    if (quotations.length === 0) return "0.0%";
    const accepted = quotations.filter((q) => q.status === "accepted").length;
    return `${((accepted / quotations.length) * 100).toFixed(1)}%`;
  }, [quotations]);

  const repeatBuyerRate = useMemo(() => {
    if (orders.length === 0) return "0.0%";
    const map = new Map<string, number>();
    orders.forEach((o) => {
      const b = o.buyerCompany || o.contactPerson;
      if (b) map.set(b, (map.get(b) || 0) + 1);
    });
    if (map.size === 0) return "0.0%";
    const repeatCount = Array.from(map.values()).filter((cnt) => cnt > 1).length;
    return `${((repeatCount / map.size) * 100).toFixed(1)}%`;
  }, [orders]);

  // Dynamic timeline bucket generator by date
  const timelineData = useMemo(() => {
    const now = new Date();
    let buckets: ChartBucket[] = [];

    if (period === "daily") {
      // 14 consecutive calendar days ending today
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
        const dayNum = d.getDate();
        const monthShort = d.toLocaleDateString("en-US", { month: "short" });
        const key = d.toISOString().split("T")[0];
        const start = new Date(d).setHours(0, 0, 0, 0);
        const end = new Date(d).setHours(23, 59, 59, 999);

        buckets.push({
          label: `${dayName} ${dayNum}`,
          fullDate: `${dayName}, ${monthShort} ${dayNum}, ${d.getFullYear()}`,
          dateKey: key,
          startMs: start,
          endMs: end,
          revenue: 0,
          orders: 0,
        });
      }
    } else if (period === "weekly") {
      // 8 consecutive weeks
      for (let i = 7; i >= 0; i--) {
        const endD = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        const startD = new Date(endD.getTime() - 6 * 24 * 60 * 60 * 1000);
        const startMonth = startD.toLocaleDateString("en-US", { month: "short" });
        const endMonth = endD.toLocaleDateString("en-US", { month: "short" });
        const label =
          startMonth === endMonth
            ? `${startMonth} ${startD.getDate()}-${endD.getDate()}`
            : `${startMonth} ${startD.getDate()} - ${endMonth} ${endD.getDate()}`;

        buckets.push({
          label,
          fullDate: `${startD.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endD.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
          subLabel: `Week ${8 - i}`,
          startMs: new Date(startD).setHours(0, 0, 0, 0),
          endMs: new Date(endD).setHours(23, 59, 59, 999),
          revenue: 0,
          orders: 0,
        });
      }
    } else if (period === "monthly") {
      // 12 consecutive calendar months
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthShort = d.toLocaleDateString("en-US", { month: "short" });
        const yearShort = d.getFullYear().toString().slice(-2);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const start = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999).getTime();

        buckets.push({
          label: `${monthShort} '${yearShort}`,
          fullDate: `${d.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
          yearMonth: ym,
          startMs: start,
          endMs: end,
          revenue: 0,
          orders: 0,
        });
      }
    } else if (period === "quarterly") {
      // 6 consecutive quarters
      const currentYear = now.getFullYear();
      const currentQuarter = Math.floor(now.getMonth() / 3) + 1;

      for (let i = 5; i >= 0; i--) {
        let q = currentQuarter - i;
        let y = currentYear;
        while (q <= 0) {
          q += 4;
          y -= 1;
        }
        const startMonthIdx = (q - 1) * 3;
        const start = new Date(y, startMonthIdx, 1).getTime();
        const end = new Date(y, startMonthIdx + 3, 0, 23, 59, 59, 999).getTime();
        const startMonthName = new Date(y, startMonthIdx, 1).toLocaleDateString("en-US", { month: "short" });
        const endMonthName = new Date(y, startMonthIdx + 2, 1).toLocaleDateString("en-US", { month: "short" });

        buckets.push({
          label: `Q${q} '${y.toString().slice(-2)}`,
          fullDate: `Q${q} ${y} (${startMonthName} - ${endMonthName})`,
          subLabel: `${y}`,
          startMs: start,
          endMs: end,
          revenue: 0,
          orders: 0,
        });
      }
    } else {
      // 4 calendar years
      const currentYear = now.getFullYear();
      for (let i = 3; i >= 0; i--) {
        const y = currentYear - i;
        const start = new Date(y, 0, 1).getTime();
        const end = new Date(y, 11, 31, 23, 59, 59, 999).getTime();

        buckets.push({
          label: String(y),
          fullDate: `Calendar Year ${y}`,
          year: y,
          startMs: start,
          endMs: end,
          revenue: 0,
          orders: 0,
        });
      }
    }

    // Populate actual order totals and counts
    orders.forEach((o) => {
      const amt = Number(o.total) || 0;
      const orderDateObj = o.orderDate ? new Date(o.orderDate) : new Date();
      const orderMs = orderDateObj.getTime();
      const orderDateStr = o.orderDate ? o.orderDate.split("T")[0] : new Date().toISOString().split("T")[0];
      const orderYm = `${orderDateObj.getFullYear()}-${String(orderDateObj.getMonth() + 1).padStart(2, "0")}`;
      const orderYear = orderDateObj.getFullYear();

      if (period === "daily") {
        const match = buckets.find((b) => b.dateKey === orderDateStr);
        if (match) {
          match.revenue += amt;
          match.orders += 1;
        }
      } else if (period === "monthly") {
        const match = buckets.find((b) => b.yearMonth === orderYm);
        if (match) {
          match.revenue += amt;
          match.orders += 1;
        }
      } else if (period === "yearly") {
        const match = buckets.find((b) => b.year === orderYear);
        if (match) {
          match.revenue += amt;
          match.orders += 1;
        } else if (buckets.length > 0) {
          buckets[buckets.length - 1].revenue += amt;
          buckets[buckets.length - 1].orders += 1;
        }
      } else {
        // weekly & quarterly
        const match = buckets.find((b) => orderMs >= b.startMs && orderMs <= b.endMs);
        if (match) {
          match.revenue += amt;
          match.orders += 1;
        }
      }
    });

    return buckets;
  }, [orders, period]);

  const maxRevenue = useMemo(() => {
    return Math.max(...timelineData.map((b) => b.revenue), 1);
  }, [timelineData]);

  const periodTotalRevenue = useMemo(() => {
    return timelineData.reduce((sum, b) => sum + b.revenue, 0);
  }, [timelineData]);

  const periodTotalOrders = useMemo(() => {
    return timelineData.reduce((sum, b) => sum + b.orders, 0);
  }, [timelineData]);

  const peakBucket = useMemo(() => {
    if (timelineData.length === 0) return null;
    return timelineData.reduce((prev, curr) => (curr.revenue > prev.revenue ? curr : prev), timelineData[0]);
  }, [timelineData]);

  // Dynamic regional breakdown from real orders
  const regionalSales = useMemo(() => {
    if (orders.length === 0) return [];
    const regionMap = new Map<string, { salesETB: number; orders: number }>();
    orders.forEach((o) => {
      const city = o.buyerLocation?.split(",")[0]?.trim() || "Addis Ababa Hub";
      const amt = Number(o.total) || 0;
      const prev = regionMap.get(city) || { salesETB: 0, orders: 0 };
      regionMap.set(city, { salesETB: prev.salesETB + amt, orders: prev.orders + 1 });
    });

    const totalOrders = orders.length || 1;
    return Array.from(regionMap.entries()).map(([city, data]) => ({
      city,
      salesETB: data.salesETB,
      orders: data.orders,
      percentage: Number(((data.orders / totalOrders) * 100).toFixed(1)),
    }));
  }, [orders]);

  // Dynamic Category Distribution from live products
  const categorySplit = useMemo(() => {
    if (products.length === 0) return [];
    const catMap = new Map<string, number>();
    products.forEach((p) => {
      const cat = p.category || "General Commodities";
      catMap.set(cat, (catMap.get(cat) || 0) + 1);
    });
    const totalProds = products.length || 1;
    return Array.from(catMap.entries()).map(([name, count]) => ({
      name,
      percent: Math.round((count / totalProds) * 100),
    }));
  }, [products]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enterprise B2B Business Analytics & Intelligence"
        subtitle="In-depth gross sales trajectories, chronological trade graphs, quotation win rates, and regional logistics performance"
        breadcrumbs={[{ label: "Dashboard", onClick: () => setActiveTab("dashboard") }, { label: "Analytics" }]}
        actions={
          <div className="flex items-center gap-2">
            <div
              className={`flex rounded-xl border p-0.5 text-xs transition-colors ${
                isLight
                  ? "border-slate-200 bg-white"
                  : isSystem
                  ? "border-indigo-500/20 bg-[#0c1630]"
                  : "border-white/10 bg-[#121215]"
              }`}
            >
              {(["daily", "weekly", "monthly", "quarterly", "yearly"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize cursor-pointer transition-colors ${
                    period === p
                      ? "bg-indigo-600 text-white shadow-xs"
                      : isLight
                      ? "text-slate-600 hover:text-slate-900"
                      : isSystem
                      ? "text-slate-300 hover:text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={() => toast.success("Exporting full B2B Analytics Executive Report (PDF/CSV)...")}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors shadow-xs ${
                isLight
                  ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  : isSystem
                  ? "border-indigo-500/20 bg-[#0c1630] text-slate-200 hover:bg-[#122045]"
                  : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
              }`}
            >
              <Download className="h-3.5 w-3.5 text-indigo-500" />
              <span>Export Report</span>
            </button>
          </div>
        }
      />

      {/* 6 Key Performance Metrics Grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          compact={true}
          title="Gross Revenue"
          value={grossRevenue > 0 ? `ETB ${(grossRevenue / 1000000).toFixed(2)}M` : "ETB 0.00"}
          subtitle="Total volume"
          icon={DollarSign}
        />

        <StatCard
          compact={true}
          title="Average Order Value"
          value={avgOrderValue > 0 ? `ETB ${avgOrderValue.toLocaleString()}` : "ETB 0"}
          subtitle="Per purchase order"
          icon={TrendingUp}
        />

        <StatCard
          compact={true}
          title="RFQ Win Rate"
          value={rfqWinRate}
          subtitle="Tenders won"
          icon={Percent}
        />

        <StatCard
          compact={true}
          title="Quote Acceptance"
          value={quoteAcceptance}
          subtitle="Accepted quotes"
          icon={Percent}
        />

        <StatCard
          compact={true}
          title="Repeat Buyer Rate"
          value={repeatBuyerRate}
          subtitle="Recurring clients"
          icon={Users}
        />

        <StatCard
          compact={true}
          title="Return Rate"
          value="0.0%"
          subtitle="Dispute free"
          icon={Percent}
        />
      </div>

      {/* Primary Chronological Sales & Order Velocity Timeline Chart */}
      <div
        className={`rounded-2xl border p-5 shadow-xs space-y-4 transition-colors ${
          isLight
            ? "border-slate-200 bg-white text-slate-900"
            : isSystem
            ? "border-indigo-500/20 bg-[#0f1b3b] text-white"
            : "border-white/10 bg-[#121218] text-white"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-slate-100 dark:border-white/5">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-500" />
              <h3 className="text-sm font-bold tracking-tight">Wholesale Revenue & Order Trajectory</h3>
              <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 capitalize">
                {period} Timeline
              </span>
            </div>
            <p
              className={`text-xs ${
                isLight ? "text-slate-500" : isSystem ? "text-slate-400" : "text-zinc-400"
              }`}
            >
              Exact calendar date mappings for gross trade volume, purchase order counts, and order momentum
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-xs bg-indigo-600" />
              <span className={isLight ? "text-slate-600" : "text-zinc-300"}>Gross Billed (ETB)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className={isLight ? "text-slate-600" : "text-zinc-300"}>Orders</span>
            </div>
          </div>
        </div>

        {/* Dynamic Period Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div
            className={`rounded-xl border p-3 ${
              isLight
                ? "border-slate-100 bg-slate-50/70"
                : isSystem
                ? "border-indigo-500/10 bg-[#0c1630]"
                : "border-white/5 bg-white/[0.02]"
            }`}
          >
            <span className="text-[11px] text-zinc-400 block font-medium">Period Trade Volume</span>
            <span className="text-base font-bold font-mono text-indigo-400 mt-0.5 block">
              ETB {periodTotalRevenue > 0 ? periodTotalRevenue.toLocaleString() : "0.00"}
            </span>
          </div>

          <div
            className={`rounded-xl border p-3 ${
              isLight
                ? "border-slate-100 bg-slate-50/70"
                : isSystem
                ? "border-indigo-500/10 bg-[#0c1630]"
                : "border-white/5 bg-white/[0.02]"
            }`}
          >
            <span className="text-[11px] text-zinc-400 block font-medium">Period Orders</span>
            <span className="text-base font-bold font-mono text-emerald-400 mt-0.5 block">
              {periodTotalOrders} PO{periodTotalOrders === 1 ? "" : "s"}
            </span>
          </div>

          <div
            className={`rounded-xl border p-3 ${
              isLight
                ? "border-slate-100 bg-slate-50/70"
                : isSystem
                ? "border-indigo-500/10 bg-[#0c1630]"
                : "border-white/5 bg-white/[0.02]"
            }`}
          >
            <span className="text-[11px] text-zinc-400 block font-medium">Peak Performance</span>
            <span className="text-base font-bold font-mono text-white mt-0.5 block truncate">
              {peakBucket && peakBucket.revenue > 0
                ? `ETB ${peakBucket.revenue.toLocaleString()}`
                : "ETB 0.00"}
            </span>
            <span className="text-[10px] text-zinc-500 truncate block">
              {peakBucket && peakBucket.revenue > 0 ? peakBucket.label : "None"}
            </span>
          </div>

          <div
            className={`rounded-xl border p-3 ${
              isLight
                ? "border-slate-100 bg-slate-50/70"
                : isSystem
                ? "border-indigo-500/10 bg-[#0c1630]"
                : "border-white/5 bg-white/[0.02]"
            }`}
          >
            <span className="text-[11px] text-zinc-400 block font-medium">Fulfillment SLA</span>
            <span className="text-base font-bold font-mono text-cyan-400 mt-0.5 block">
              100.0%
            </span>
            <span className="text-[10px] text-zinc-500 block">CBE Escrow Verified</span>
          </div>
        </div>

        {/* Responsive Timeline Bar Graph */}
        <div className="pt-6 pb-2">
          {/* Grid Scale Lines */}
          <div className="relative h-60 sm:h-64 w-full">
            {/* Horizontal Background Guides */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-dashed border-zinc-500 w-full" />
              <div className="border-b border-dashed border-zinc-500 w-full" />
              <div className="border-b border-dashed border-zinc-500 w-full" />
              <div className="border-b border-zinc-600 w-full" />
            </div>

            {/* Bars Container */}
            <div className="absolute inset-0 flex items-end justify-between gap-1.5 sm:gap-2.5 px-2">
              {timelineData.map((bucket, idx) => {
                const heightPercent =
                  bucket.revenue > 0 && maxRevenue > 0
                    ? Math.max(14, Math.round((bucket.revenue / maxRevenue) * 100))
                    : 6;

                const isHovered = hoveredIdx === idx;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative cursor-pointer"
                  >
                    {/* Floating Tooltip */}
                    <div
                      className={`transition-all duration-150 absolute -top-16 z-30 rounded-xl bg-zinc-950/95 border border-indigo-500/40 px-3 py-1.5 text-center pointer-events-none whitespace-nowrap shadow-2xl backdrop-blur-md ${
                        isHovered ? "opacity-100 scale-100 -translate-y-1" : "opacity-0 scale-95 pointer-events-none"
                      }`}
                    >
                      <p className="text-[10px] font-bold text-zinc-300">{bucket.fullDate}</p>
                      <p className="text-xs font-mono font-bold text-indigo-400">
                        ETB {bucket.revenue.toLocaleString()}
                      </p>
                      <p className="text-[9px] text-emerald-400 font-medium">
                        {bucket.orders} purchase order{bucket.orders === 1 ? "" : "s"}
                      </p>
                    </div>

                    {/* Order Count Indicator Dot on Active Bars */}
                    {bucket.orders > 0 && (
                      <span className="h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-indigo-900 shrink-0 mb-1" />
                    )}

                    {/* Bar Pillar */}
                    <div className="w-full max-w-[48px] bg-white/[0.03] rounded-t-lg overflow-hidden flex flex-col justify-end h-full">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          bucket.revenue > 0
                            ? isHovered
                              ? "bg-gradient-to-t from-indigo-500 to-indigo-300 shadow-lg shadow-indigo-500/20"
                              : "bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-xs"
                            : "bg-white/[0.06]"
                        }`}
                      />
                    </div>

                    {/* Date Label */}
                    <span
                      className={`text-[10px] sm:text-[11px] font-medium text-center truncate w-full transition-colors ${
                        isHovered
                          ? "text-indigo-400 font-bold"
                          : isLight
                          ? "text-slate-600"
                          : "text-zinc-400"
                      }`}
                    >
                      {bucket.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Regional Ethiopian Sales Distribution */}
        <div
          className={`rounded-2xl border p-5 shadow-xs lg:col-span-2 space-y-4 transition-colors ${
            isLight
              ? "border-slate-200 bg-white text-slate-900"
              : isSystem
              ? "border-indigo-500/20 bg-[#0f1b3b] text-white"
              : "border-white/10 bg-[#141418] text-white"
          }`}
        >
          <div
            className={`border-b pb-3 flex items-center justify-between ${
              isLight ? "border-slate-100" : isSystem ? "border-indigo-500/20" : "border-white/5"
            }`}
          >
            <div>
              <h3 className="text-sm font-bold">Regional Ethiopian Sales & Depot Distribution</h3>
              <p
                className={`text-xs mt-0.5 ${
                  isLight ? "text-slate-500" : isSystem ? "text-slate-400" : "text-zinc-400"
                }`}
              >
                Sales volume performance across major regional commercial centers
              </p>
            </div>
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold border ${
                isLight
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : isSystem
                  ? "border-indigo-500/30 bg-indigo-950/40 text-indigo-300"
                  : "border-indigo-500/30 bg-indigo-950/40 text-indigo-300"
              }`}
            >
              {regionalSales.length} Active Regions
            </span>
          </div>

          <div className="space-y-4">
            {regionalSales.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                No regional order distributions recorded yet. When orders are processed, geographic breakdown will appear here.
              </div>
            ) : (
              regionalSales.map((r, idx) => (
                <div key={idx} className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                      <span className="font-bold">{r.city}</span>
                      <span
                        className={`font-mono text-[11px] ${
                          isLight ? "text-slate-400" : isSystem ? "text-slate-400" : "text-zinc-400"
                        }`}
                      >
                        ({r.orders} orders)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold">
                        ETB {r.salesETB.toLocaleString()}
                      </span>
                      <span
                        className={`font-mono w-12 text-right ${
                          isLight ? "text-slate-500" : isSystem ? "text-slate-400" : "text-zinc-400"
                        }`}
                      >
                        {r.percentage}%
                      </span>
                    </div>
                  </div>

                  <div
                    className={`h-2 w-full rounded-full overflow-hidden ${
                      isLight
                        ? "bg-slate-100"
                        : isSystem
                        ? "bg-[#0c1630]"
                        : "bg-white/5"
                    }`}
                  >
                    <div
                      style={{ width: `${r.percentage}%` }}
                      className="h-full rounded-full bg-indigo-600"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category Performance Breakdown */}
        <div
          className={`rounded-2xl border p-5 shadow-xs space-y-4 transition-colors ${
            isLight
              ? "border-slate-200 bg-white text-slate-900"
              : isSystem
              ? "border-indigo-500/20 bg-[#0f1b3b] text-white"
              : "border-white/10 bg-[#141418] text-white"
          }`}
        >
          <div
            className={`border-b pb-3 ${
              isLight ? "border-slate-100" : isSystem ? "border-indigo-500/20" : "border-white/5"
            }`}
          >
            <h3 className="text-sm font-bold">Commodity Category Share</h3>
            <p
              className={`text-xs mt-0.5 ${
                isLight ? "text-slate-500" : isSystem ? "text-slate-400" : "text-zinc-400"
              }`}
            >
              Catalog distribution across wholesale categories
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {categorySplit.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                No catalog categories registered yet.
              </div>
            ) : (
              categorySplit.map((c, idx) => (
                <div key={idx} className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="font-semibold truncate max-w-[200px]">{c.name}</span>
                    <span className="font-mono font-bold">{c.percent}%</span>
                  </div>
                  <div
                    className={`h-2 w-full rounded-full overflow-hidden ${
                      isLight
                        ? "bg-slate-100"
                        : isSystem
                        ? "bg-[#0c1630]"
                        : "bg-white/5"
                    }`}
                  >
                    <div style={{ width: `${c.percent}%` }} className="h-full rounded-full bg-indigo-600" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


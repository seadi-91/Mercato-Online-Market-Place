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
} from "lucide-react";
import { PageHeader } from "../shared/page-header";
import { StatCard } from "../shared/stat-card";
import { useSupplierStore } from "@/store/supplier-store";
import { useThemeStore } from "@/store/theme-store";
import { toast } from "sonner";

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

  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "quarterly" | "yearly">("monthly");

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
        subtitle="In-depth gross sales trajectories, quotation win rates, regional logistics performance, and repeat buyer retention"
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

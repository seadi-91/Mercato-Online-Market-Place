"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  Users,
  Percent,
  Download,
  MapPin,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "../shared/page-header";
import { StatCard } from "../shared/stat-card";
import { useSupplierStore } from "@/store/supplier-store";
import { useThemeStore } from "@/store/theme-store";
import { toast } from "sonner";

export function SupplierAnalyticsView() {
  const { setActiveTab } = useSupplierStore();
  const { theme } = useThemeStore();

  const isLight = theme === "light";
  const isSystem = theme === "system";
  const isDark = theme === "dark";

  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "quarterly" | "yearly">("monthly");

  // Regional Sales Performance Breakdown
  const regionalSales = [
    { city: "Addis Ababa Metropolitan", salesETB: 54200000, orders: 48, percentage: 43.4 },
    { city: "Hawassa & Sidama Corridor", salesETB: 28500000, orders: 26, percentage: 22.8 },
    { city: "Dire Dawa Free Trade Hub", salesETB: 18400000, orders: 19, percentage: 14.7 },
    { city: "Bahir Dar Industrial Zone", salesETB: 11200000, orders: 12, percentage: 9.0 },
    { city: "Gondar Northern Depot", salesETB: 8100000, orders: 8, percentage: 6.5 },
    { city: "Mekelle Regional Center", salesETB: 4400000, orders: 5, percentage: 3.5 },
  ];

  // Category Distribution
  const categorySplit = [
    { name: "Agricultural Commodities (Coffee & Spices)", percent: 38 },
    { name: "Construction & Industrial Steel/Cement", percent: 32 },
    { name: "Grains, Cereals & Magna Teff", percent: 20 },
    { name: "Oilseeds (Sesame) & Export Pulses", percent: 10 },
  ];

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

      {/* 6 Key Performance Metrics Grid - Compact Minimized Height */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          compact={true}
          title="Gross Revenue"
          value="ETB 124.8M"
          change="+24.2%"
          trend="up"
          icon={DollarSign}
        />

        <StatCard
          compact={true}
          title="Average Order Value"
          value="ETB 1.05M"
          change="+8.6%"
          trend="up"
          icon={TrendingUp}
        />

        <StatCard
          compact={true}
          title="RFQ Win Rate"
          value="68.4%"
          subtitle="Tenders won"
          trend="up"
          icon={Percent}
        />

        <StatCard
          compact={true}
          title="Quote Acceptance"
          value="74.1%"
          change="+4.2%"
          trend="up"
          icon={Percent}
        />

        <StatCard
          compact={true}
          title="Repeat Buyer Rate"
          value="82.5%"
          subtitle="Recurring clients"
          icon={Users}
        />

        <StatCard
          compact={true}
          title="Return Rate"
          value="0.38%"
          change="-0.1%"
          trend="down"
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
              6 Regional Corridors
            </span>
          </div>

          <div className="space-y-4">
            {regionalSales.map((r, idx) => (
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
                      ETB {(r.salesETB / 1000000).toFixed(1)}M
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
            ))}
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
              Revenue split across wholesale lines
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {categorySplit.map((c, idx) => (
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
            ))}
          </div>

          <div
            className={`rounded-xl border p-4 text-xs mt-4 ${
              isLight
                ? "border-indigo-200 bg-indigo-50/50 text-slate-800"
                : isSystem
                ? "border-indigo-500/20 bg-[#0c1630] text-slate-200"
                : "border-white/10 bg-white/5 text-zinc-300"
            }`}
          >
            <p className="font-bold flex items-center gap-1.5 text-indigo-500">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Agricultural Coffee Growth Spike:</span>
            </p>
            <p className="mt-1 leading-relaxed opacity-80">
              Yirgacheffe Grade 1 special washed coffee recorded a +34% quarter-on-quarter demand increase among five-star hospitality buyers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


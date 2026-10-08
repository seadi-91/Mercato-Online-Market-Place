"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  Wallet,
  Clock,
  ShoppingCart,
  FileQuestion,
  FileText,
  Package,
  Plus,
  ArrowUpRight,
  ArrowRight,
  ChevronRight,
  Star,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  BarChart3,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { PageHeader } from "../shared/page-header";
import { useSupplierStore } from "@/store/supplier-store";

export function SupplierDashboardView() {
  const {
    profile,
    products,
    orders,
    rfqs,
    quotations,
    fetchProducts,
    fetchOrders,
    fetchRFQs,
    fetchQuotations,
    fetchNegotiations,
    setActiveTab,
    setSubView,
    openModal,
  } = useSupplierStore();

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchRFQs();
    fetchQuotations();
    fetchNegotiations();
  }, [fetchProducts, fetchOrders, fetchRFQs, fetchQuotations, fetchNegotiations]);

  const [timeframe, setTimeframe] = useState<"7D" | "30D" | "12M" | "All">("30D");

  // Real Financial & Operational Figures calculated purely from live backend state
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.orderStatus === "delivered" || o.paymentStatus === "released")
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  }, [orders]);

  const availableBalance = useMemo(() => {
    return orders
      .filter((o) => o.paymentStatus === "released")
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  }, [orders]);

  const pendingPayments = useMemo(() => {
    return orders
      .filter(
        (o) =>
          o.paymentStatus === "escrow_secured" ||
          o.orderStatus === "processing" ||
          o.orderStatus === "confirmed"
      )
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  }, [orders]);

  const pendingOrders = useMemo(
    () => orders.filter((o) => o.orderStatus === "pending" || o.orderStatus === "processing").length,
    [orders]
  );
  const pendingRFQs = useMemo(
    () => rfqs.filter((r) => r.status === "new" || r.status === "negotiating").length,
    [rfqs]
  );
  const activeQuotes = useMemo(
    () => quotations.filter((q) => q.status === "sent" || q.status === "negotiating").length,
    [quotations]
  );

  const avgOrderValue = useMemo(() => {
    return orders.length > 0
      ? Math.round(orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0) / orders.length)
      : 0;
  }, [orders]);

  const settlementRate = useMemo(() => {
    if (orders.length === 0) return "0.0%";
    const settled = orders.filter((o) => o.paymentStatus === "released").length;
    return `${((settled / orders.length) * 100).toFixed(1)}%`;
  }, [orders]);

  const fulfillmentSla = useMemo(() => {
    if (orders.length === 0) return "100.0%";
    const fulfilled = orders.filter((o) => o.orderStatus === "delivered" || o.orderStatus === "shipped").length;
    return `${((fulfilled / orders.length) * 100).toFixed(1)}%`;
  }, [orders]);

  // Order Pipeline Distribution directly from live orders
  const pipeline = useMemo(() => {
    const totalCount = orders.length || 1;
    const newCount = orders.filter((o) => o.orderStatus === "pending" || o.orderStatus === "confirmed").length;
    const procCount = orders.filter((o) => o.orderStatus === "processing").length;
    const packedCount = orders.filter((o) => o.orderStatus === "packed").length;
    const shippedCount = orders.filter((o) => o.orderStatus === "shipped" || o.deliveryStatus === "in_transit").length;
    const deliveredCount = orders.filter((o) => o.orderStatus === "delivered").length;

    return [
      { label: "New & Confirmed", count: newCount, percent: orders.length > 0 ? Math.round((newCount / totalCount) * 100) : 0, color: "bg-amber-400" },
      { label: "Processing & QC", count: procCount, percent: orders.length > 0 ? Math.round((procCount / totalCount) * 100) : 0, color: "bg-blue-400" },
      { label: "Packed & Depot Ready", count: packedCount, percent: orders.length > 0 ? Math.round((packedCount / totalCount) * 100) : 0, color: "bg-indigo-400" },
      { label: "Shipped & In Transit", count: shippedCount, percent: orders.length > 0 ? Math.round((shippedCount / totalCount) * 100) : 0, color: "bg-cyan-400" },
      { label: "Delivered & Settled", count: deliveredCount, percent: orders.length > 0 ? Math.round((deliveredCount / totalCount) * 100) : 0, color: "bg-emerald-400" },
    ];
  }, [orders]);

  // Dynamic Chart Datasets based on live orders
  const chartDatasets = useMemo(() => {
    const d7 = [
      { label: "Mon", value: 0, orders: 0 },
      { label: "Tue", value: 0, orders: 0 },
      { label: "Wed", value: 0, orders: 0 },
      { label: "Thu", value: 0, orders: 0 },
      { label: "Fri", value: 0, orders: 0 },
      { label: "Sat", value: 0, orders: 0 },
      { label: "Sun", value: 0, orders: 0 },
    ];
    const d30 = [
      { label: "W1", value: 0, orders: 0 },
      { label: "W2", value: 0, orders: 0 },
      { label: "W3", value: 0, orders: 0 },
      { label: "W4", value: 0, orders: 0 },
    ];
    const d12 = [
      { label: "May", value: 0, orders: 0 },
      { label: "Jun", value: 0, orders: 0 },
      { label: "Jul", value: 0, orders: 0 },
      { label: "Aug", value: 0, orders: 0 },
      { label: "Sep", value: 0, orders: 0 },
      { label: "Oct", value: 0, orders: 0 },
    ];
    const dAll = [
      { label: "2024", value: 0, orders: 0 },
      { label: "2025", value: 0, orders: 0 },
      { label: "2026", value: 0, orders: 0 },
    ];

    orders.forEach((o) => {
      const amt = Number(o.total) || 0;
      const date = o.orderDate ? new Date(o.orderDate) : new Date();
      const day = date.getDay();
      const dayIdx = day === 0 ? 6 : day - 1;
      if (d7[dayIdx]) {
        d7[dayIdx].value += amt;
        d7[dayIdx].orders += 1;
      }
      const weekIdx = Math.min(3, Math.floor(date.getDate() / 8));
      if (d30[weekIdx]) {
        d30[weekIdx].value += amt;
        d30[weekIdx].orders += 1;
      }
      dAll[2].value += amt;
      dAll[2].orders += 1;
    });

    return { "7D": d7, "30D": d30, "12M": d12, All: dAll };
  }, [orders]);

  const chartData = chartDatasets[timeframe];
  const maxVal = Math.max(...chartData.map((d) => d.value), 1);

  // Dynamic Recent Activity Events
  const recentEvents = useMemo(() => {
    const list: Array<{
      id: string;
      type: "order" | "rfq" | "quote";
      title: string;
      subtitle: string;
      time: string;
      tab: any;
    }> = [];

    orders.slice(0, 3).forEach((o) => {
      list.push({
        id: `ord-${o.id}`,
        type: "order",
        title: `Order #${o.orderNumber || o.id.slice(0, 8)} secured`,
        subtitle: `${o.buyerCompany || "Buyer"}: ETB ${(o.total || 0).toLocaleString()}`,
        time: o.orderDate || "Recently",
        tab: "orders",
      });
    });

    rfqs.slice(0, 3).forEach((r) => {
      list.push({
        id: `rfq-${r.id}`,
        type: "rfq",
        title: `New RFQ inquiry received`,
        subtitle: `${r.buyerCompany}: ${r.requestedQty?.toLocaleString() || ""} ${r.unit || ""} ${r.productName || ""}`,
        time: r.createdAt || "Recently",
        tab: "rfqs",
      });
    });

    quotations.slice(0, 2).forEach((q) => {
      list.push({
        id: `quote-${q.id}`,
        type: "quote",
        title: `Quotation #${q.quoteNumber} issued`,
        subtitle: `${q.buyerCompany}: ETB ${(q.total || 0).toLocaleString()}`,
        time: q.createdAt || "Recently",
        tab: "quotations",
      });
    });

    return list.slice(0, 4);
  }, [orders, rfqs, quotations]);

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Supplier Dashboard"
        subtitle={`Welcome back, ${profile.businessName}. Here is your commercial trade and escrow performance.`}
        breadcrumbs={[{ label: "MercatoX B2B" }, { label: "Overview" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setActiveTab("products");
                setSubView("create-product");
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-indigo-500 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </button>

            <button
              onClick={() => openModal("create-quotation")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
            >
              <FileText className="h-4 w-4 text-zinc-400" />
              <span>Create Quote</span>
            </button>

            <button
              onClick={() => setActiveTab("rfqs")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
            >
              <FileQuestion className="h-4 w-4 text-emerald-400" />
              <span>Review RFQs ({pendingRFQs})</span>
            </button>
          </div>
        }
      />

      {/* 2. Linear-Style Minimal Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Metric 1: Revenue */}
        <div
          onClick={() => setActiveTab("analytics")}
          className="rounded-xl border border-white/[0.08] bg-[#0d121c] p-4 transition-all hover:border-white/20 cursor-pointer"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Total Revenue</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold font-mono tracking-tight text-white">
            ETB {totalRevenue > 0 ? (totalRevenue / 1000000).toFixed(2) + "M" : "0.00"}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-400">
            <span>Settled orders volume</span>
          </div>
        </div>

        {/* Metric 2: Available Escrow */}
        <div
          onClick={() => setActiveTab("payments")}
          className="rounded-xl border border-white/[0.08] bg-[#0d121c] p-4 transition-all hover:border-white/20 cursor-pointer"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Available Balance</span>
            <Wallet className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold font-mono tracking-tight text-white">
            ETB {availableBalance > 0 ? (availableBalance / 1000000).toFixed(2) + "M" : "0.00"}
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Ready for payout</span>
          </div>
        </div>

        {/* Metric 3: Held in Escrow */}
        <div
          onClick={() => setActiveTab("payments")}
          className="rounded-xl border border-white/[0.08] bg-[#0d121c] p-4 transition-all hover:border-white/20 cursor-pointer"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>In Escrow</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold font-mono tracking-tight text-white">
            ETB {pendingPayments > 0 ? (pendingPayments / 1000000).toFixed(2) + "M" : "0.00"}
          </div>
          <div className="mt-2 text-[11px] text-zinc-400">
            <span>{orders.filter((o) => o.paymentStatus === "escrow_secured").length} active orders secured</span>
          </div>
        </div>

        {/* Metric 4: Pending Orders */}
        <div
          onClick={() => setActiveTab("orders")}
          className="rounded-xl border border-white/[0.08] bg-[#0d121c] p-4 transition-all hover:border-white/20 cursor-pointer"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Pending Orders</span>
            <ShoppingCart className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold font-mono tracking-tight text-white">
            {pendingOrders}
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-blue-400">
            <span>{pendingOrders} require dispatch</span>
          </div>
        </div>

        {/* Metric 5: Active RFQs */}
        <div
          onClick={() => setActiveTab("rfqs")}
          className="rounded-xl border border-white/[0.08] bg-[#0d121c] p-4 transition-all hover:border-white/20 cursor-pointer col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Buyer RFQs</span>
            <FileQuestion className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold font-mono tracking-tight text-white">
            {pendingRFQs}
          </div>
          <div className="mt-2 text-[11px] text-zinc-400">
            <span>Awaiting quotations</span>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Revenue Chart & Order Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Revenue Chart */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0d121c] p-5 lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Wholesale Trade Volume</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Billed trade across regional warehouses</p>
            </div>

            {/* Linear-style clean timeframe toggle */}
            <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.02] p-0.5 text-xs">
              {(["7D", "30D", "12M", "All"] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                    timeframe === tf
                      ? "bg-white/10 text-white font-semibold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Minimalist Bar Chart */}
          <div className="pt-2">
            <div className="flex items-end justify-between gap-2 sm:gap-3 h-48 sm:h-52 px-1">
              {chartData.map((item, idx) => {
                const heightPercent =
                  item.value > 0 && maxVal > 0 ? Math.max(12, Math.round((item.value / maxVal) * 100)) : 6;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative">
                    {/* Minimal Hover Tag */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 z-10 rounded bg-zinc-900 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-zinc-200 pointer-events-none whitespace-nowrap shadow-md">
                      ETB {(item.value / 1000).toLocaleString()}K
                    </div>

                    <div className="w-full max-w-[36px] bg-white/[0.03] rounded-t-md overflow-hidden flex flex-col justify-end h-full">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-md transition-all ${
                          item.value > 0
                            ? "bg-indigo-500/80 group-hover:bg-indigo-400"
                            : "bg-white/[0.05]"
                        }`}
                      />
                    </div>

                    <span className="text-[11px] font-medium text-zinc-400">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Sub-metrics */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/[0.06] text-xs">
            <div>
              <span className="text-zinc-400 block">Avg. Order Value</span>
              <span className="font-mono font-semibold text-white mt-0.5 block">
                ETB {avgOrderValue.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block">Settlement Rate</span>
              <span className="font-mono font-semibold text-emerald-400 mt-0.5 block">
                {settlementRate}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block">Fulfillment SLA</span>
              <span className="font-mono font-semibold text-white mt-0.5 block">
                {fulfillmentSla}
              </span>
            </div>
          </div>
        </div>

        {/* Order Fulfillment Pipeline */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0d121c] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Order Pipeline</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Active fulfillment stages</p>
            </div>
            <button
              onClick={() => setActiveTab("orders")}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
            >
              View Orders
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {pipeline.map((p, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300">{p.label}</span>
                  <span className="font-mono font-semibold text-white">{p.count}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    style={{ width: `${p.percent}%` }}
                    className={`h-full rounded-full ${p.color}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-white/[0.06]">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>CBE Escrow Protection</span>
              </span>
              <span className="text-zinc-300 font-medium">100% Secured</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Top Products & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Top Wholesale Products */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0d121c] p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Top Performing Catalog Items</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Wholesale items with highest commercial order volume</p>
            </div>
            <button
              onClick={() => setActiveTab("products")}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
            >
              All Products ({products.length})
            </button>
          </div>

          {/* Clean Desktop Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] text-zinc-400 font-medium uppercase text-[10px] tracking-wider">
                  <th className="pb-2.5">Product</th>
                  <th className="pb-2.5">Stock</th>
                  <th className="pb-2.5">Wholesale Base</th>
                  <th className="pb-2.5">Sold</th>
                  <th className="pb-2.5">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-zinc-500">
                      No products found in catalog. Click &quot;Add Product&quot; to list your first item.
                    </td>
                  </tr>
                ) : (
                  products.slice(0, 5).map((prod) => (
                    <tr key={prod.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2.5">
                          {prod.images && prod.images.length > 0 ? (
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              className="h-9 w-9 rounded-lg object-cover border border-white/10 shrink-0"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-400 shrink-0">
                              <Package className="h-4 w-4" />
                            </div>
                          )}
                          <div className="truncate">
                            <p className="font-medium text-white truncate max-w-[220px]">{prod.name}</p>
                            <p className="text-[11px] text-zinc-400 font-mono">{prod.sku} • {prod.category}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 font-mono text-zinc-200">
                        {prod.stock.toLocaleString()} {prod.unit}
                      </td>

                      <td className="py-2.5 font-mono font-semibold text-emerald-400">
                        ETB {prod.basePrice.toLocaleString()} / {prod.unit}
                      </td>

                      <td className="py-2.5 font-mono text-zinc-300">
                        {prod.salesCount.toLocaleString()} {prod.unit}
                      </td>

                      <td className="py-2.5">
                        <div className="flex items-center gap-1 text-zinc-300 font-medium">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span>{prod.rating || "5.0"}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0d121c] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Commercial events & alerts</p>
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            {recentEvents.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                No recent activity recorded yet.
              </div>
            ) : (
              recentEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => setActiveTab(evt.tab)}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-400">
                    {evt.type === "order" ? (
                      <ShoppingCart className="h-3.5 w-3.5" />
                    ) : evt.type === "rfq" ? (
                      <FileQuestion className="h-3.5 w-3.5" />
                    ) : (
                      <FileText className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-white group-hover:text-indigo-300 transition-colors">
                      {evt.title}
                    </p>
                    <p className="text-zinc-400 text-[11px] truncate">{evt.subtitle}</p>
                    <span className="text-[10px] text-zinc-500 font-mono">{evt.time}</span>
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

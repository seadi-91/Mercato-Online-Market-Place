"use client";

import React from "react";
import { B2BInventoryItem } from "@/data/supplier-inventory-data";
import {
  X,
  Warehouse,
  Boxes,
  Lock,
  AlertTriangle,
  ArrowRightLeft,
  Plus,
  CheckCircle2,
  Building,
  ShieldCheck,
  Truck,
  Barcode,
  Calendar,
  Layers,
  MapPin,
} from "lucide-react";
import { useThemeStore } from "@/store/theme-store";

interface ProductDrawerProps {
  product: B2BInventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAddStock: (product: B2BInventoryItem) => void;
  onOpenTransfer: (product: B2BInventoryItem) => void;
}

export function SupplierProductDrawer({
  product,
  isOpen,
  onClose,
  onOpenAddStock,
  onOpenTransfer,
}: ProductDrawerProps) {
  const { theme } = useThemeStore();
  const isLight = theme === "light";
  const isSystem = theme === "system";

  if (!isOpen || !product) return null;

  const totalValue = product.totalStock * product.sellingPrice;
  const costValue = product.totalStock * product.costPrice;
  const profitMargin = Math.round(((product.sellingPrice - product.costPrice) / product.costPrice) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={`w-screen max-w-2xl border-l shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in slide-in-from-right ${isLight
              ? "bg-white border-slate-200 text-slate-900"
              : isSystem
                ? "bg-[#0c1630] border-blue-500/30 text-white"
                : "bg-[#0f141f] border-white/10 text-white"
            }`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between p-5 border-b ${isLight ? "border-slate-200 bg-slate-50/80" : isSystem ? "border-blue-500/20 bg-[#0f1b3b]" : "border-white/10 bg-[#141418]"
              }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`h-11 w-11 rounded-xl overflow-hidden border shrink-0 ${isLight ? "border-slate-200 bg-white" : "border-white/10 bg-black"
                  }`}
              >
                <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${isLight
                        ? "bg-slate-100 text-slate-700 border-slate-200"
                        : "bg-white/10 text-zinc-300 border-white/10"
                      }`}
                  >
                    {product.sku}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${product.status === "in_stock"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : product.status === "low_stock"
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          : product.status === "out_of_stock"
                            ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                            : "bg-purple-500/15 text-purple-400 border-purple-500/30"
                      }`}
                  >
                    {product.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>
                <h3 className="font-bold text-base line-clamp-1 mt-0.5">{product.name}</h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${isLight
                  ? "border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  : "border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onOpenAddStock(product)}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#2E7D32] hover:bg-[#388E3C] text-xs font-bold text-white shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>+ Add Stock</span>
              </button>

              <button
                onClick={() => onOpenTransfer(product)}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${isLight
                    ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    : "border-white/10 bg-white/[0.04] text-zinc-200 hover:bg-white/[0.08] hover:text-white"
                  }`}
              >
                <ArrowRightLeft className="h-4 w-4 text-amber-400" />
                <span>Transfer</span>
              </button>
            </div>

            {/* 1. Stock Summary KPI Grid */}
            <div className="space-y-2">
              <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                Stock Breakdown Summary
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Total */}
                <div
                  className={`rounded-xl border p-3 ${isLight ? "bg-slate-50 border-slate-200" : isSystem ? "bg-[#0f1b3b] border-blue-500/20" : "bg-[#141418] border-white/10"
                    }`}
                >
                  <span className={`text-[10px] uppercase font-semibold ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                    Total Stock
                  </span>
                  <p className="text-base font-bold font-mono mt-0.5">
                    {product.totalStock.toLocaleString()}{" "}
                    <span className="text-[10px] font-normal opacity-70">{product.unit}</span>
                  </p>
                </div>

                {/* Available */}
                <div
                  className={`rounded-xl border p-3 ${isLight ? "bg-emerald-50/70 border-emerald-200" : "bg-emerald-500/10 border-emerald-500/20"
                    }`}
                >
                  <span className="text-[10px] uppercase font-semibold text-emerald-500">Available</span>
                  <p className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                    {product.availableStock.toLocaleString()}{" "}
                    <span className="text-[10px] font-normal opacity-70">{product.unit}</span>
                  </p>
                </div>

                {/* Reserved */}
                <div
                  className={`rounded-xl border p-3 ${isLight ? "bg-blue-50/70 border-blue-200" : "bg-blue-500/10 border-blue-500/20"
                    }`}
                >
                  <span className="text-[10px] uppercase font-semibold text-blue-500">Reserved</span>
                  <p className="text-base font-bold font-mono text-blue-400 mt-0.5">
                    {product.reservedStock.toLocaleString()}{" "}
                    <span className="text-[10px] font-normal opacity-70">{product.unit}</span>
                  </p>
                </div>

                {/* Damaged */}
                <div
                  className={`rounded-xl border p-3 ${isLight ? "bg-rose-50/70 border-rose-200" : "bg-rose-500/10 border-rose-500/20"
                    }`}
                >
                  <span className="text-[10px] uppercase font-semibold text-rose-500">Damaged</span>
                  <p className="text-base font-bold font-mono text-rose-400 mt-0.5">
                    {product.damagedStock.toLocaleString()}{" "}
                    <span className="text-[10px] font-normal opacity-70">{product.unit}</span>
                  </p>
                </div>
              </div>

              {/* Secondary Buffer Levels */}
              <div
                className={`grid grid-cols-3 gap-2.5 p-3 rounded-xl border ${isLight ? "bg-slate-50/50 border-slate-200" : "bg-white/[0.02] border-white/5"
                  }`}
              >
                <div>
                  <span className={`text-[10px] ${isLight ? "text-slate-500" : "text-zinc-400"}`}>Incoming PO</span>
                  <p className="text-xs font-mono font-bold text-indigo-400">
                    +{product.incomingStock.toLocaleString()} {product.unit}
                  </p>
                </div>
                <div>
                  <span className={`text-[10px] ${isLight ? "text-slate-500" : "text-zinc-400"}`}>Min. Level Buffer</span>
                  <p className="text-xs font-mono font-bold text-amber-400">
                    {product.minimumLevel.toLocaleString()} {product.unit}
                  </p>
                </div>
                <div>
                  <span className={`text-[10px] ${isLight ? "text-slate-500" : "text-zinc-400"}`}>Max. Capacity</span>
                  <p className="text-xs font-mono font-bold text-purple-400">
                    {product.maximumLevel.toLocaleString()} {product.unit}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Valuation & Financials */}
            <div
              className={`rounded-xl border p-4 space-y-3 ${isLight ? "bg-white border-slate-200 shadow-xs" : isSystem ? "bg-[#0f1b3b] border-blue-500/20" : "bg-[#141418] border-white/10"
                }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                  Financial Valuation
                </h4>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  +{profitMargin}% Margin
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Unit Cost Price:</span>
                  <p className="font-mono font-bold text-sm">ETB {product.costPrice.toLocaleString()}</p>
                </div>
                <div>
                  <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Unit Selling Price:</span>
                  <p className="font-mono font-bold text-sm text-emerald-500">ETB {product.sellingPrice.toLocaleString()}</p>
                </div>
                <div>
                  <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Total Stock Valuation:</span>
                  <p className="font-mono font-bold text-sm text-indigo-400">ETB {totalValue.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* 3. Multi-Warehouse Stock Allocation Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  Warehouse Stock Allocation
                </h4>
                <span className={`text-[11px] ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  {product.warehouseDistribution.length} Hubs
                </span>
              </div>

              <div className="space-y-2">
                {product.warehouseDistribution.map((dist, idx) => {
                  const percentOfTotal = product.totalStock > 0 ? Math.round((dist.total / product.totalStock) * 100) : 0;
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex flex-col gap-2 ${isLight ? "bg-slate-50 border-slate-200" : isSystem ? "bg-[#0f1b3b] border-blue-500/20" : "bg-[#141418] border-white/10"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Warehouse className="h-4 w-4 text-emerald-500" />
                          <span className="font-bold text-xs">{dist.warehouseName}</span>
                        </div>
                        <span className="font-mono text-xs font-bold">
                          {dist.total.toLocaleString()} {product.unit}{" "}
                          <span className="text-[10px] font-normal opacity-60">({percentOfTotal}%)</span>
                        </span>
                      </div>

                      {/* Micro bar */}
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div style={{ width: `${percentOfTotal}%` }} className="h-full bg-[#2E7D32] rounded-full" />
                      </div>

                      <div className="flex items-center justify-between text-[11px] opacity-75 font-mono pt-1 border-t border-white/5">
                        <span className="text-emerald-400">Available: {dist.available.toLocaleString()}</span>
                        <span className="text-blue-400">Reserved: {dist.reserved.toLocaleString()}</span>
                        <span className="text-rose-400">Damaged: {dist.damaged.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Product Specs & Compliance */}
            <div
              className={`rounded-xl border p-4 space-y-3 text-xs ${isLight ? "bg-white border-slate-200" : isSystem ? "bg-[#0f1b3b] border-blue-500/20" : "bg-[#141418] border-white/10"
                }`}
            >
              <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                Specifications & Batch Traceability
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Origin:</span>
                  <p className="font-medium mt-0.5">{product.origin}</p>
                </div>
                <div>
                  <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Commercial Grade:</span>
                  <p className="font-medium mt-0.5">{product.grade}</p>
                </div>
                <div>
                  <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Batch Number:</span>
                  <p className="font-mono font-medium mt-0.5">{product.batchNumber}</p>
                </div>
                <div>
                  <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Barcode (EAN-13):</span>
                  <p className="font-mono font-medium mt-0.5">{product.barcode}</p>
                </div>
                <div>
                  <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Last Restocked:</span>
                  <p className="font-medium mt-0.5">{product.lastRestocked}</p>
                </div>
                <div>
                  <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Primary Supplier:</span>
                  <p className="font-medium mt-0.5">{product.supplier}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

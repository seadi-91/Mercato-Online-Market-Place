"use client";

import React, { useState, useMemo } from "react";
import {
  Boxes,
  Plus,
  ArrowRightLeft,
  SlidersHorizontal,
  History,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  Package,
  Search,
  CheckCircle2,
  Warehouse,
  Truck,
  FileText,
  LayoutGrid,
  List,
  Sparkles,
  ChevronRight,
  Copy,
  Check,
  Lock,
  X,
  Download,
  ShieldCheck,
  FileSpreadsheet,
  FileCheck,
  RefreshCw,
  Bell,
  Eye,
  Trash2,
  ExternalLink,
  Info,
  Calendar,
  Layers,
  BarChart3,
  CheckCheck,
} from "lucide-react";
import { PageHeader } from "../shared/page-header";
import { Pagination } from "../shared/pagination";
import { EmptyState } from "../shared/empty-state";
import { useSupplierStore } from "@/store/supplier-store";
import { useThemeStore } from "@/store/theme-store";
import { toast } from "sonner";
import {
  B2BInventoryItem,
  StockReservation,
  DamagedStockRecord,
  StockAdjustmentRecord,
  InventoryAlertItem,
  WarehouseDetail,
  initialB2BInventory,
  initialReservations,
  initialDamagedStock,
  initialAdjustments,
  initialWarehousesDetail,
  initialInventoryAlerts,
} from "@/data/supplier-inventory-data";
import { SupplierInventoryChart } from "./supplier-inventory-chart";
import { SupplierProductDrawer } from "./supplier-product-drawer";
import {
  AddStockModal,
  AdjustStockModal,
  TransferStockModal,
  DamagedWriteOffModal,
  ExportReportModal,
} from "./supplier-inventory-modals";

type InventoryTab =
  | "overview"
  | "products"
  | "warehouses"
  | "movements"
  | "transfers"
  | "reservations"
  | "damaged"
  | "adjustments"
  | "alerts"
  | "reports";

export function SupplierInventoryView() {
  const { setActiveTab } = useSupplierStore();
  const { theme } = useThemeStore();
  const isLight = theme === "light";
  const isSystem = theme === "system";

  // Tab State
  const [activeTabSub, setActiveTabSub] = useState<InventoryTab>("overview");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Data States
  const [inventory, setInventory] = useState<B2BInventoryItem[]>(initialB2BInventory);
  const [reservations, setReservations] = useState<StockReservation[]>(initialReservations);
  const [damagedStock, setDamagedStock] = useState<DamagedStockRecord[]>(initialDamagedStock);
  const [adjustments, setAdjustments] = useState<StockAdjustmentRecord[]>(initialAdjustments);
  const [warehouses, setWarehouses] = useState<WarehouseDetail[]>(initialWarehousesDetail);
  const [alerts, setAlerts] = useState<InventoryAlertItem[]>(initialInventoryAlerts);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockLevelFilter, setStockLevelFilter] = useState("all");
  const [sortOption, setSortOption] = useState<"stock_desc" | "stock_asc" | "name" | "val_desc">("stock_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Drawer & Modal States
  const [selectedProduct, setSelectedProduct] = useState<B2BInventoryItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [writeOffItem, setWriteOffItem] = useState<DamagedStockRecord | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // KPI Calculations
  const totalStockQty = useMemo(() => inventory.reduce((acc, p) => acc + p.totalStock, 0), [inventory]);
  const totalValuation = useMemo(() => inventory.reduce((acc, p) => acc + p.totalStock * p.sellingPrice, 0), [inventory]);
  const totalAvailableQty = useMemo(() => inventory.reduce((acc, p) => acc + p.availableStock, 0), [inventory]);
  const totalReservedQty = useMemo(() => inventory.reduce((acc, p) => acc + p.reservedStock, 0), [inventory]);
  const lowStockCount = useMemo(() => inventory.filter((p) => p.status === "low_stock").length, [inventory]);
  const outOfStockCount = useMemo(() => inventory.filter((p) => p.status === "out_of_stock").length, [inventory]);
  const unreadAlertsCount = useMemo(() => alerts.filter((a) => !a.read).length, [alerts]);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(id);
    toast.success("Reference copied to clipboard");
    setTimeout(() => setCopiedRef(null), 2000);
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    let list = inventory.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.primaryWarehouse.toLowerCase().includes(q);

      const matchesWarehouse =
        warehouseFilter === "all" || p.primaryWarehouse.toLowerCase().includes(warehouseFilter.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || p.category.toLowerCase().includes(categoryFilter.toLowerCase());

      const matchesStatus = statusFilter === "all" || p.status === statusFilter;

      const matchesStockLevel =
        stockLevelFilter === "all"
          ? true
          : stockLevelFilter === "available"
            ? p.availableStock > 0
            : stockLevelFilter === "low"
              ? p.status === "low_stock"
              : stockLevelFilter === "critical"
                ? p.status === "out_of_stock" || p.availableStock <= p.minimumLevel
                : true;

      return matchesSearch && matchesWarehouse && matchesCategory && matchesStatus && matchesStockLevel;
    });

    list.sort((a, b) => {
      if (sortOption === "stock_desc") return b.totalStock - a.totalStock;
      if (sortOption === "stock_asc") return a.totalStock - b.totalStock;
      if (sortOption === "name") return a.name.localeCompare(b.name);
      if (sortOption === "val_desc") return b.totalStock * b.sellingPrice - a.totalStock * a.sellingPrice;
      return 0;
    });

    return list;
  }, [inventory, searchQuery, warehouseFilter, categoryFilter, statusFilter, stockLevelFilter, sortOption]);

  const totalProductPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredProducts, currentPage]);

  // Reset Filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setWarehouseFilter("all");
    setCategoryFilter("all");
    setStatusFilter("all");
    setStockLevelFilter("all");
    setCurrentPage(1);
    toast.success("Filters cleared.");
  };

  // Handlers for B2B Operations
  const handleAddStock = (data: {
    productId: string;
    warehouse: string;
    quantity: number;
    unit: string;
    batchNumber: string;
    supplierRef: string;
    purchaseCost: number;
    expiryDate: string;
    notes: string;
  }) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === data.productId) {
          const newTotal = item.totalStock + data.quantity;
          const newAvail = newTotal - item.reservedStock - item.damagedStock;
          return {
            ...item,
            totalStock: newTotal,
            availableStock: Math.max(0, newAvail),
            status: newAvail > item.minimumLevel ? "in_stock" : "low_stock",
            lastRestocked: new Date().toISOString().split("T")[0],
          };
        }
        return item;
      })
    );
    toast.success(`Successfully added +${data.quantity} ${data.unit} to inventory (Batch ${data.batchNumber})!`);
  };

  const handleAdjustStock = (data: {
    productId: string;
    warehouse: string;
    currentQty: number;
    physicalQty: number;
    difference: number;
    unit: string;
    reason: string;
    notes: string;
  }) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === data.productId) {
          const newTotal = data.physicalQty;
          const newAvail = Math.max(0, newTotal - item.reservedStock - item.damagedStock);
          return {
            ...item,
            totalStock: newTotal,
            availableStock: newAvail,
            status: newAvail === 0 ? "out_of_stock" : newAvail < item.minimumLevel ? "low_stock" : "in_stock",
          };
        }
        return item;
      })
    );

    const newAdj: StockAdjustmentRecord = {
      id: `adj-${Date.now()}`,
      adjustmentNumber: `ADJ-2026-${Math.floor(100 + Math.random() * 900)}`,
      productId: data.productId,
      productName: inventory.find((p) => p.id === data.productId)?.name || "Commodity",
      warehouse: data.warehouse,
      systemQty: data.currentQty,
      physicalQty: data.physicalQty,
      difference: data.difference,
      unit: data.unit,
      reason: data.reason,
      notes: data.notes,
      date: new Date().toISOString().split("T")[0],
      auditor: "Warehouse Controller (Internal Audit)",
      status: "approved",
    };

    setAdjustments((prev) => [newAdj, ...prev]);
    toast.success(`Audit adjustment ${newAdj.adjustmentNumber} recorded (${data.difference >= 0 ? "+" : ""}${data.difference} ${data.unit})!`);
  };

  const handleTransferStock = (data: {
    fromWarehouse: string;
    toWarehouse: string;
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    vehiclePlate: string;
    driverName: string;
  }) => {
    toast.success(`Transfer of ${data.quantity} ${data.unit} dispatched via ${data.vehiclePlate}!`);
  };

  const handleConfirmWriteOff = (item: DamagedStockRecord) => {
    setDamagedStock((prev) =>
      prev.map((d) => (d.id === item.id ? { ...d, status: "written_off" } : d))
    );
    toast.success(`Successfully written off ${item.quantity} ${item.unit} of ${item.productName}.`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto min-w-0">
      {/* 1. Header with B2B Enterprise Actions */}
      <PageHeader
        title="Inventory Management"
        subtitle="Monitor stock levels, warehouses, reservations, movements, and inventory operations."
        breadcrumbs={[{ label: "Dashboard", onClick: () => setActiveTab("dashboard") }, { label: "Inventory" }]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Warning Alert Icon */}
            <button
              onClick={() => setActiveTabSub("alerts")}
              className={`relative p-2.5 rounded-xl border transition-colors cursor-pointer ${isLight
                  ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  : isSystem
                    ? "border-blue-500/30 bg-[#0f1b3b] text-blue-200 hover:bg-blue-500/20"
                    : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/10"
                }`}
              title="Inventory Warnings & Alerts"
            >
              <Bell className="h-4 w-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Export */}
            <button
              onClick={() => setIsExportOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs ${isLight
                  ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  : isSystem
                    ? "border-blue-500/30 bg-[#0f1b3b] text-blue-200 hover:bg-blue-500/20"
                    : "border-white/10 bg-white/[0.04] text-zinc-200 hover:bg-white/[0.08]"
                }`}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </button>

            {/* Adjust Stock */}
            <button
              onClick={() => setIsAdjustOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs ${isLight
                  ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  : isSystem
                    ? "border-blue-500/30 bg-[#0f1b3b] text-blue-200 hover:bg-blue-500/20"
                    : "border-white/10 bg-white/[0.04] text-zinc-200 hover:bg-white/[0.08]"
                }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-400" />
              <span>Adjust Stock</span>
            </button>

            {/* Transfer Stock */}
            <button
              onClick={() => setIsTransferOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs ${isLight
                  ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  : isSystem
                    ? "border-blue-500/30 bg-[#0f1b3b] text-blue-200 hover:bg-blue-500/20"
                    : "border-white/10 bg-white/[0.04] text-zinc-200 hover:bg-white/[0.08]"
                }`}
            >
              <ArrowRightLeft className="h-3.5 w-3.5 text-amber-400" />
              <span>Transfer Stock</span>
            </button>

            {/* + Add Stock (Primary Green #2E7D32) */}
            <button
              onClick={() => setIsAddStockOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2E7D32] hover:bg-[#388E3C] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-700/25 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>+ Add Stock</span>
            </button>
          </div>
        }
      />

      {/* 2. Six Professional Inventory KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1: Total Stock */}
        <div
          className={`rounded-xl border p-3 sm:p-3.5 transition-all ${isLight
              ? "border-slate-200 bg-white shadow-xs hover:border-slate-300"
              : isSystem
                ? "border-blue-500/25 bg-[#0f1b3b] shadow-md shadow-blue-950/20"
                : "border-white/10 bg-[#141418] shadow-xs"
            }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              Total Stock
            </span>
            <div className="h-6 w-6 rounded-md bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Boxes className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className={`text-base sm:text-lg font-bold font-mono mt-1 ${isLight ? "text-slate-900" : "text-white"}`}>
            {totalStockQty.toLocaleString()}{" "}
            <span className="text-[10px] font-normal opacity-70">Units</span>
          </p>
          <p className="text-[10px] text-emerald-500 font-mono font-medium truncate mt-0.5">
            ETB {(totalValuation / 1000000).toFixed(1)}M Val.
          </p>
        </div>

        {/* KPI 2: Available Stock */}
        <div
          className={`rounded-xl border p-3 sm:p-3.5 transition-all ${isLight
              ? "border-emerald-200 bg-emerald-50/70 shadow-xs"
              : isSystem
                ? "border-cyan-500/30 bg-[#0c223d]/90 shadow-md shadow-cyan-950/25"
                : "border-emerald-500/20 bg-[#141418] shadow-xs"
            }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? "text-emerald-900" : "text-cyan-300"}`}>
              Available Stock
            </span>
            <div className="h-6 w-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className={`text-base sm:text-lg font-bold font-mono mt-1 ${isLight ? "text-slate-900" : "text-white"}`}>
            {totalAvailableQty.toLocaleString()}{" "}
            <span className="text-[10px] font-normal opacity-70">Units</span>
          </p>
          <p className={`text-[10px] truncate mt-0.5 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
            Currently available for sale
          </p>
        </div>

        {/* KPI 3: Reserved Stock */}
        <div
          className={`rounded-xl border p-3 sm:p-3.5 transition-all ${isLight
              ? "border-blue-200 bg-blue-50/70 shadow-xs"
              : isSystem
                ? "border-blue-500/30 bg-[#0f1d44]/90 shadow-md shadow-blue-950/25"
                : "border-indigo-500/20 bg-[#141418] shadow-xs"
            }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? "text-blue-900" : "text-blue-300"}`}>
              Reserved Stock
            </span>
            <div className="h-6 w-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Lock className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className={`text-base sm:text-lg font-bold font-mono mt-1 ${isLight ? "text-slate-900" : "text-white"}`}>
            {totalReservedQty.toLocaleString()}{" "}
            <span className="text-[10px] font-normal opacity-70">Units</span>
          </p>
          <p className={`text-[10px] truncate mt-0.5 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
            Reserved for active orders
          </p>
        </div>

        {/* KPI 4: Low Stock */}
        <div
          onClick={() => {
            setActiveTabSub("products");
            setStatusFilter("low_stock");
          }}
          className={`rounded-xl border p-3 sm:p-3.5 transition-all cursor-pointer ${isLight
              ? "border-amber-200 bg-amber-50/70 hover:border-amber-400"
              : isSystem
                ? "border-amber-500/35 bg-[#291c38]/90 hover:border-amber-400"
                : "border-amber-500/20 bg-amber-500/[0.04] hover:border-amber-500/40"
            }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? "text-amber-900" : "text-amber-300"}`}>
              Low Stock
            </span>
            <div className="h-6 w-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className={`text-base sm:text-lg font-bold font-mono mt-1 ${isLight ? "text-slate-900" : "text-white"}`}>
            {lowStockCount} <span className="text-[10px] font-normal opacity-70">Products</span>
          </p>
          <p className={`text-[10px] truncate mt-0.5 ${isLight ? "text-amber-800" : "text-amber-300/80"}`}>
            Below minimum stock level
          </p>
        </div>

        {/* KPI 5: Out of Stock */}
        <div
          onClick={() => {
            setActiveTabSub("products");
            setStatusFilter("out_of_stock");
          }}
          className={`rounded-xl border p-3 sm:p-3.5 transition-all cursor-pointer ${isLight
              ? "border-rose-200 bg-rose-50/70 hover:border-rose-400"
              : isSystem
                ? "border-rose-500/35 bg-[#2d1625]/90 hover:border-rose-400"
                : "border-rose-500/20 bg-rose-500/[0.04] hover:border-rose-500/40"
            }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? "text-rose-900" : "text-rose-300"}`}>
              Out of Stock
            </span>
            <div className="h-6 w-6 rounded-md bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <X className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className={`text-base sm:text-lg font-bold font-mono mt-1 ${isLight ? "text-slate-900" : "text-white"}`}>
            {outOfStockCount} <span className="text-[10px] font-normal opacity-70">Products</span>
          </p>
          <p className={`text-[10px] truncate mt-0.5 ${isLight ? "text-rose-800" : "text-rose-300/80"}`}>
            No available inventory
          </p>
        </div>

        {/* KPI 6: Warehouses */}
        <div
          onClick={() => setActiveTabSub("warehouses")}
          className={`rounded-xl border p-3 sm:p-3.5 transition-all cursor-pointer ${isLight
              ? "border-purple-200 bg-purple-50/70 hover:border-purple-400"
              : isSystem
                ? "border-indigo-500/30 bg-[#1b1744]/90 hover:border-indigo-400"
                : "border-purple-500/20 bg-[#141418] hover:border-purple-500/40"
            }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? "text-purple-900" : "text-indigo-300"}`}>
              Warehouses
            </span>
            <div className="h-6 w-6 rounded-md bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Warehouse className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className={`text-base sm:text-lg font-bold font-mono mt-1 ${isLight ? "text-slate-900" : "text-white"}`}>
            {warehouses.length} <span className="text-[10px] font-normal opacity-70">Locations</span>
          </p>
          <p className={`text-[10px] truncate mt-0.5 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
            Regional logistics depots
          </p>
        </div>
      </div>

      {/* 3. Ten Professional B2B Enterprise Tabs */}
      <div
        className={`flex items-center gap-1.5 overflow-x-auto pb-1 border-b no-scrollbar ${isLight ? "border-slate-200" : isSystem ? "border-blue-500/20" : "border-white/10"
          }`}
      >
        {[
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "products", label: "Products", icon: Package, badge: inventory.length },
          { id: "warehouses", label: "Warehouses", icon: Warehouse, badge: warehouses.length },
          { id: "movements", label: "Movements", icon: History },
          { id: "transfers", label: "Transfers", icon: Truck },
          { id: "reservations", label: "Reservations", icon: Lock, badge: reservations.length },
          { id: "damaged", label: "Damaged", icon: AlertTriangle, badge: damagedStock.length },
          { id: "adjustments", label: "Adjustments", icon: SlidersHorizontal },
          { id: "alerts", label: "Alerts", icon: Bell, badge: unreadAlertsCount, alert: unreadAlertsCount > 0 },
          { id: "reports", label: "Reports", icon: FileText },
        ].map((tab) => {
          const isActive = activeTabSub === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTabSub(tab.id as InventoryTab);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${isActive
                  ? "bg-[#2E7D32] text-white border-emerald-600 shadow-sm"
                  : isLight
                    ? "bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50"
                    : isSystem
                      ? "bg-[#0f1b3b] text-blue-200/80 border-blue-500/25 hover:text-white hover:bg-blue-600/15"
                      : "bg-[#141418] text-zinc-400 border-white/10 hover:text-white hover:bg-white/[0.04]"
                }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${isActive
                      ? "bg-white/20 text-white"
                      : tab.alert
                        ? "bg-rose-500 text-white"
                        : isLight
                          ? "bg-slate-100 text-slate-700"
                          : "bg-white/10 text-zinc-400"
                    }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Tab Content Sections */}

      {/* =========================================================================
          TAB 1: OVERVIEW
         ========================================================================= */}
      {activeTabSub === "overview" && (
        <div className="space-y-6">
          {/* Section 4: Inventory Overview Chart */}
          <SupplierInventoryChart />

          {/* Quick Action Alerts Widget + Warehouse Capacity Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Quick Action Alerts Widget (2 cols) */}
            <div
              className={`lg:col-span-2 rounded-2xl border p-5 space-y-3 transition-colors ${isLight ? "bg-white border-slate-200 shadow-xs" : isSystem ? "bg-[#0f1b3b] border-blue-500/20" : "bg-[#141418] border-white/10"
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <h3 className={`font-bold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>
                    Urgent Inventory Actions & Reorder Warnings
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTabSub("alerts")}
                  className="text-xs text-emerald-500 font-semibold hover:underline cursor-pointer"
                >
                  View All ({alerts.length})
                </button>
              </div>

              <div className="space-y-2.5">
                {alerts.slice(0, 3).map((al) => (
                  <div
                    key={al.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${al.severity === "critical"
                        ? isLight
                          ? "bg-rose-50/80 border-rose-200 text-rose-900"
                          : "bg-rose-500/10 border-rose-500/25 text-rose-200"
                        : al.severity === "warning"
                          ? isLight
                            ? "bg-amber-50/80 border-amber-200 text-amber-900"
                            : "bg-amber-500/10 border-amber-500/25 text-amber-200"
                          : isLight
                            ? "bg-blue-50/80 border-blue-200 text-blue-900"
                            : "bg-blue-500/10 border-blue-500/25 text-blue-200"
                      }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{al.productName}</span>
                        <span className="text-[10px] opacity-75 font-mono">({al.warehouse.split("(")[0]})</span>
                      </div>
                      <p className="text-[11px] opacity-85 truncate mt-0.5">{al.message}</p>
                    </div>

                    <button
                      onClick={() => {
                        const matched = inventory.find((p) => p.name === al.productName);
                        if (matched) {
                          setSelectedProduct(matched);
                          setIsAddStockOpen(true);
                        } else {
                          setIsAddStockOpen(true);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#2E7D32] hover:bg-[#388E3C] text-white font-bold text-[11px] shrink-0 transition-all cursor-pointer shadow-xs"
                    >
                      {al.actionLabel}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Warehouse Capacity Utilization Gauge (1 col) */}
            <div
              className={`rounded-2xl border p-5 space-y-3 transition-colors ${isLight ? "bg-white border-slate-200 shadow-xs" : isSystem ? "bg-[#0f1b3b] border-blue-500/20" : "bg-[#141418] border-white/10"
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Warehouse className="h-4 w-4 text-purple-400" />
                  <h3 className={`font-bold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>
                    Depot Utilization
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTabSub("warehouses")}
                  className="text-xs text-emerald-500 font-semibold hover:underline cursor-pointer"
                >
                  Manage Hubs
                </button>
              </div>

              <div className="space-y-3 pt-1">
                {warehouses.map((wh) => (
                  <div key={wh.id} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between font-medium">
                      <span className="truncate max-w-[170px]">{wh.name.split("Logistics")[0]}</span>
                      <span className="font-mono text-[11px] opacity-80">{wh.capacityUsedPercent}% Cap.</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        style={{ width: `${wh.capacityUsedPercent}%` }}
                        className={`h-full rounded-full ${wh.capacityUsedPercent > 75
                            ? "bg-amber-500"
                            : wh.capacityUsedPercent > 90
                              ? "bg-rose-500"
                              : "bg-[#2E7D32]"
                          }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: PRODUCTS (Main Inventory Table)
         ========================================================================= */}
      {activeTabSub === "products" && (
        <div className="space-y-4">
          {/* Powerful Search & Filtering Toolbar */}
          <div
            className={`flex flex-col gap-3 rounded-2xl border p-3.5 shadow-xs transition-colors ${isLight ? "border-slate-200 bg-white" : isSystem ? "border-blue-500/25 bg-[#0f1b3b]" : "border-white/10 bg-[#141418]"
              }`}
          >
            {/* Search Input */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative flex-1">
                <Search
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${isLight ? "text-slate-400" : "text-zinc-400"
                    }`}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by Product Name, SKU, Barcode (e.g. CAF-YIR, 600129, Teff)..."
                  className={`w-full rounded-xl border pl-9 pr-9 py-2 text-xs sm:text-sm font-medium transition-all ${isLight
                      ? "border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32]"
                      : "border-white/10 bg-white/[0.04] text-white placeholder-zinc-500 focus:border-emerald-500"
                    }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-400 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* View Switcher (Table / Cards Grid) */}
              <div
                className={`flex items-center gap-1 p-1 rounded-xl border self-end md:self-auto ${isLight ? "bg-slate-100 border-slate-200" : "bg-[#10141e] border-white/10"
                  }`}
              >
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1.5 ${viewMode === "table"
                      ? isLight
                        ? "bg-white text-slate-900 shadow-xs"
                        : "bg-white/15 text-white"
                      : "text-zinc-400 hover:text-white"
                    }`}
                  title="Table View"
                >
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Table</span>
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1.5 ${viewMode === "grid"
                      ? isLight
                        ? "bg-white text-slate-900 shadow-xs"
                        : "bg-white/15 text-white"
                      : "text-zinc-400 hover:text-white"
                    }`}
                  title="Cards Grid"
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline">Cards</span>
                </button>
              </div>
            </div>

            {/* Filter Dropdowns Strip */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Warehouse Dropdown */}
              <select
                value={warehouseFilter}
                onChange={(e) => {
                  setWarehouseFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className={`rounded-xl border px-3 py-2 font-medium cursor-pointer ${isLight ? "border-slate-200 bg-white text-slate-800" : "border-white/10 bg-[#121824] text-zinc-200"
                  }`}
              >
                <option value="all">All Warehouses</option>
                <option value="Addis">Addis Ababa Central Hub (WH-AA)</option>
                <option value="Hawassa">Hawassa Agro Depot (WH-HW)</option>
                <option value="Dire">Dire Dawa Logistics Hub (WH-DD)</option>
                <option value="Mojo">Mojo Dry Port Depot (WH-MJ)</option>
              </select>

              {/* Category Dropdown */}
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className={`rounded-xl border px-3 py-2 font-medium cursor-pointer ${isLight ? "border-slate-200 bg-white text-slate-800" : "border-white/10 bg-[#121824] text-zinc-200"
                  }`}
              >
                <option value="all">All Categories</option>
                <option value="Coffee">Specialty Coffee & Spices</option>
                <option value="Teff">Grains, Cereals & Teff</option>
                <option value="Oilseeds">Oilseeds & Pulses</option>
                <option value="Construction">Construction Materials</option>
              </select>

              {/* Stock Status Dropdown */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className={`rounded-xl border px-3 py-2 font-medium cursor-pointer ${isLight ? "border-slate-200 bg-white text-slate-800" : "border-white/10 bg-[#121824] text-zinc-200"
                  }`}
              >
                <option value="all">All Statuses</option>
                <option value="in_stock">In Stock (Normal)</option>
                <option value="low_stock">Low Stock (Alert)</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="overstock">Overstock (&gt; Buffer)</option>
              </select>

              {/* Stock Level Filter */}
              <select
                value={stockLevelFilter}
                onChange={(e) => {
                  setStockLevelFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className={`rounded-xl border px-3 py-2 font-medium cursor-pointer ${isLight ? "border-slate-200 bg-white text-slate-800" : "border-white/10 bg-[#121824] text-zinc-200"
                  }`}
              >
                <option value="all">All Stock Levels</option>
                <option value="available">Available (&gt; 0)</option>
                <option value="low">Low Level (&lt; Buffer)</option>
                <option value="critical">Critical / Depleted</option>
              </select>

              {/* Sort Dropdown */}
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className={`rounded-xl border px-3 py-2 font-medium cursor-pointer ${isLight ? "border-slate-200 bg-white text-slate-800" : "border-white/10 bg-[#121824] text-zinc-200"
                  }`}
              >
                <option value="stock_desc">Highest Stock Quantity</option>
                <option value="stock_asc">Lowest Stock Quantity</option>
                <option value="val_desc">Highest Inventory Valuation</option>
                <option value="name">Product Name (A-Z)</option>
              </select>

              {/* Clear Filters */}
              {(searchQuery || warehouseFilter !== "all" || categoryFilter !== "all" || statusFilter !== "all" || stockLevelFilter !== "all") && (
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Product Content: Table or Grid */}
          {filteredProducts.length === 0 ? (
            <div
              className={`rounded-2xl border p-12 text-center ${isLight ? "bg-white border-slate-200" : "bg-[#141418] border-white/10"
                }`}
            >
              <EmptyState
                title="No Products Match Filters"
                description="We couldn't find any inventory commodities matching your active criteria."
                actionLabel="Clear All Filters"
                onAction={handleClearFilters}
              />
            </div>
          ) : viewMode === "table" ? (
            /* Enterprise B2B Table */
            <div
              className={`rounded-2xl border shadow-xl overflow-hidden w-full transition-colors ${isLight ? "border-slate-200 bg-white text-slate-900" : isSystem ? "border-blue-500/25 bg-[#0f1b3b]" : "border-white/10 bg-[#141418]"
                }`}
            >
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr
                      className={`border-b font-semibold uppercase text-[11px] tracking-wider select-none ${isLight ? "border-slate-200 bg-slate-50 text-slate-600" : "border-white/10 bg-white/[0.03] text-zinc-400"
                        }`}
                    >
                      <th className="py-3.5 px-5 min-w-[280px]">Product / Specification</th>
                      <th className="py-3.5 px-4 min-w-[130px]">SKU / Barcode</th>
                      <th className="py-3.5 px-4 min-w-[180px]">Warehouse</th>
                      <th className="py-3.5 px-4 min-w-[140px]">Total Stock</th>
                      <th className="py-3.5 px-4 min-w-[120px]">Reserved</th>
                      <th className="py-3.5 px-4 min-w-[130px]">Available</th>
                      <th className="py-3.5 px-4 min-w-[110px]">Min. Level</th>
                      <th className="py-3.5 px-4 min-w-[110px]">Status</th>
                      <th className="py-3.5 px-4 text-right min-w-[140px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${isLight ? "divide-slate-100" : isSystem ? "divide-blue-500/10" : "divide-white/[0.05]"
                      }`}
                  >
                    {paginatedProducts.map((prod) => {
                      const stockPercent = Math.min(100, Math.round((prod.availableStock / prod.maximumLevel) * 100));

                      return (
                        <tr
                          key={prod.id}
                          className={`transition-colors cursor-pointer group ${isLight
                              ? "hover:bg-slate-50/80"
                              : isSystem
                                ? "hover:bg-blue-500/[0.06]"
                                : "hover:bg-white/[0.02]"
                            }`}
                        >
                          {/* Product */}
                          <td
                            className="py-3.5 px-5 align-middle"
                            onClick={() => {
                              setSelectedProduct(prod);
                              setIsDrawerOpen(true);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-11 w-11 rounded-xl overflow-hidden border shrink-0 ${isLight ? "border-slate-200 bg-slate-100" : "border-white/10 bg-black/40"
                                  }`}
                              >
                                <img
                                  src={prod.images[0]}
                                  alt={prod.name}
                                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <div className="min-w-0 max-w-xs">
                                <h4
                                  className={`font-bold text-sm leading-snug line-clamp-1 transition-colors ${isLight ? "text-slate-900 group-hover:text-emerald-700" : "text-white group-hover:text-emerald-400"
                                    }`}
                                >
                                  {prod.name}
                                </h4>
                                <span className={`text-[11px] truncate block ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                                  {prod.category} • {prod.grade}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* SKU & Barcode */}
                          <td className="py-3.5 px-4 align-middle font-mono">
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded border block w-fit font-bold ${isLight ? "bg-slate-100 text-slate-800 border-slate-200" : "bg-white/5 text-zinc-300 border-white/10"
                                }`}
                            >
                              {prod.sku}
                            </span>
                            <span className="text-[10px] opacity-60 block mt-0.5">{prod.barcode}</span>
                          </td>

                          {/* Warehouse */}
                          <td className="py-3.5 px-4 align-middle">
                            <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                              <Warehouse className="h-3.5 w-3.5 opacity-60 shrink-0" />
                              <span className="truncate">{prod.primaryWarehouse.split("(")[0]}</span>
                            </div>
                          </td>

                          {/* Total Stock */}
                          <td className="py-3.5 px-4 align-middle font-mono font-bold">
                            {prod.totalStock.toLocaleString()}{" "}
                            <span className="text-[10px] font-normal opacity-70">{prod.unit}</span>
                          </td>

                          {/* Reserved */}
                          <td className="py-3.5 px-4 align-middle font-mono">
                            {prod.reservedStock > 0 ? (
                              <span className="font-bold text-blue-500">
                                {prod.reservedStock.toLocaleString()} {prod.unit}
                              </span>
                            ) : (
                              <span className="opacity-40">—</span>
                            )}
                          </td>

                          {/* Available Stock + Visual Gauge */}
                          <td className="py-3.5 px-4 align-middle">
                            <div className="space-y-1">
                              <span className="font-bold font-mono text-emerald-500">
                                {prod.availableStock.toLocaleString()} {prod.unit}
                              </span>
                              <div className="h-1.5 w-24 rounded-full bg-white/10 overflow-hidden">
                                <div
                                  style={{ width: `${stockPercent}%` }}
                                  className={`h-full rounded-full ${prod.status === "low_stock"
                                      ? "bg-amber-400"
                                      : prod.status === "out_of_stock"
                                        ? "bg-rose-500"
                                        : "bg-[#2E7D32]"
                                    }`}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Minimum Level */}
                          <td className="py-3.5 px-4 align-middle font-mono opacity-80">
                            {prod.minimumLevel.toLocaleString()} {prod.unit}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 align-middle">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${prod.status === "in_stock"
                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                  : prod.status === "low_stock"
                                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                    : prod.status === "out_of_stock"
                                      ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                                      : prod.status === "overstock"
                                        ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                                        : "bg-blue-500/15 text-blue-400 border-blue-500/30"
                                }`}
                            >
                              {prod.status.replace("_", " ").toUpperCase()}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 align-middle text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProduct(prod);
                                  setIsDrawerOpen(true);
                                }}
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${isLight ? "border-slate-200 hover:bg-slate-100" : "border-white/10 hover:bg-white/10"
                                  }`}
                                title="View Inventory Details"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProduct(prod);
                                  setIsAdjustOpen(true);
                                }}
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${isLight ? "border-slate-200 hover:bg-slate-100" : "border-white/10 hover:bg-white/10"
                                  }`}
                                title="Adjust Stock"
                              >
                                <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-400" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProduct(prod);
                                  setIsTransferOpen(true);
                                }}
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${isLight ? "border-slate-200 hover:bg-slate-100" : "border-white/10 hover:bg-white/10"
                                  }`}
                                title="Transfer Stock"
                              >
                                <ArrowRightLeft className="h-3.5 w-3.5 text-amber-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Cards Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => {
                    setSelectedProduct(prod);
                    setIsDrawerOpen(true);
                  }}
                  className={`rounded-2xl border p-4.5 flex flex-col justify-between space-y-3.5 transition-all cursor-pointer group ${isLight
                      ? "border-slate-200 bg-white hover:border-[#2E7D32] hover:shadow-md"
                      : isSystem
                        ? "border-blue-500/25 bg-[#0f1b3b] hover:border-cyan-400"
                        : "border-white/10 bg-[#141418] hover:border-white/20"
                    }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="h-16 w-16 rounded-xl object-cover border border-white/10 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[10px] font-bold opacity-75">{prod.sku}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase border ${prod.status === "in_stock"
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : prod.status === "low_stock"
                                  ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                  : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                              }`}
                          >
                            {prod.status.replace("_", " ")}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm line-clamp-1 group-hover:text-emerald-500 transition-colors">
                          {prod.name}
                        </h4>
                        <p className="text-xs opacity-75 truncate">{prod.category}</p>
                      </div>
                    </div>

                    {/* Stock Box */}
                    <div
                      className={`rounded-xl border p-3 space-y-1.5 text-xs ${isLight ? "bg-slate-50 border-slate-200" : "bg-white/[0.02] border-white/5"
                        }`}
                    >
                      <div className="flex justify-between items-baseline">
                        <span className="opacity-75">Available:</span>
                        <span className="font-bold font-mono text-emerald-500 text-sm">
                          {prod.availableStock.toLocaleString()} {prod.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline font-mono text-[11px] opacity-75">
                        <span>Total: {prod.totalStock.toLocaleString()}</span>
                        <span>Reserved: {prod.reservedStock.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(prod);
                        setIsAdjustOpen(true);
                      }}
                      className="flex-1 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-xs font-semibold text-center cursor-pointer"
                    >
                      Adjust
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(prod);
                        setIsTransferOpen(true);
                      }}
                      className="flex-1 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-xs font-semibold text-center cursor-pointer"
                    >
                      Transfer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="pt-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalProductPages}
              totalItems={filteredProducts.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: WAREHOUSES
         ========================================================================= */}
      {activeTabSub === "warehouses" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-bold text-base ${isLight ? "text-slate-900" : "text-white"}`}>
                Regional Warehouse Hubs
              </h3>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                Multi-depot facility management, manager contacts, storage capacity, and inventory distribution
              </p>
            </div>
            <button
              onClick={() => toast.info("Opening Add Warehouse request form...")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#388E3C] text-xs font-bold text-white shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>+ Add Warehouse</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {warehouses.map((wh) => (
              <div
                key={wh.id}
                className={`rounded-2xl border p-5 space-y-4 transition-all ${isLight
                    ? "bg-white border-slate-200 shadow-xs"
                    : isSystem
                      ? "bg-[#0f1b3b] border-blue-500/25 shadow-md shadow-blue-950/20"
                      : "bg-[#141418] border-white/10 shadow-xs"
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                      <Warehouse className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{wh.name}</span>
                        <span className="font-mono text-[10px] font-bold bg-white/10 px-1.5 py-0.5 rounded">
                          {wh.code}
                        </span>
                      </div>
                      <p className="text-xs opacity-75">{wh.location} • {wh.city}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {wh.status.toUpperCase()}
                  </span>
                </div>

                {/* Warehouse Stats Grid */}
                <div
                  className={`grid grid-cols-3 gap-2.5 p-3 rounded-xl border text-xs font-mono ${isLight ? "bg-slate-50 border-slate-200" : "bg-white/[0.02] border-white/5"
                    }`}
                >
                  <div>
                    <span className="text-[10px] opacity-60">Total Commodities</span>
                    <p className="font-bold text-sm mt-0.5">{wh.totalProducts} Types</p>
                  </div>
                  <div>
                    <span className="text-[10px] opacity-60">Total Units</span>
                    <p className="font-bold text-sm mt-0.5">{wh.totalStock.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[10px] opacity-60">Hub Valuation</span>
                    <p className="font-bold text-sm text-emerald-500 mt-0.5">
                      ETB {(wh.inventoryValue / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>

                {/* Capacity Bar */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="opacity-75">Capacity Utilization:</span>
                    <span className="font-mono font-bold">{wh.capacityUsedPercent}% ({wh.totalStock.toLocaleString()} / {wh.capacity.toLocaleString()} Units)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div style={{ width: `${wh.capacityUsedPercent}%` }} className="h-full bg-[#2E7D32] rounded-full" />
                  </div>
                </div>

                {/* Footer Info & Actions */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="opacity-70">Manager: {wh.manager} ({wh.phone})</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setWarehouseFilter(wh.name.split(" ")[0]);
                        setActiveTabSub("products");
                      }}
                      className="text-emerald-500 font-semibold hover:underline cursor-pointer"
                    >
                      View Inventory
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => setIsTransferOpen(true)}
                      className="text-indigo-400 font-semibold hover:underline cursor-pointer"
                    >
                      Transfer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: MOVEMENTS (Audit Ledger)
         ========================================================================= */}
      {activeTabSub === "movements" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-bold text-base ${isLight ? "text-slate-900" : "text-white"}`}>
                Stock Movement Audit Ledger
              </h3>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                Complete immutable record of all Stock In, Stock Out, Reservations, Transfers, Damaged write-offs, and Audit reconciliations
              </p>
            </div>
            <button
              onClick={() => toast.success("Exporting movement ledger CSV...")}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-xs font-semibold hover:bg-white/10 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Ledger</span>
            </button>
          </div>

          <div
            className={`rounded-2xl border shadow-xl overflow-hidden w-full ${isLight ? "border-slate-200 bg-white" : isSystem ? "border-blue-500/25 bg-[#0f1b3b]" : "border-white/10 bg-[#141418]"
              }`}
          >
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr
                    className={`border-b font-semibold uppercase text-[11px] tracking-wider select-none ${isLight ? "border-slate-200 bg-slate-50 text-slate-600" : "border-white/10 bg-white/[0.03] text-zinc-400"
                      }`}
                  >
                    <th className="py-3.5 px-5">Date & Time</th>
                    <th className="py-3.5 px-4">Commodity Product</th>
                    <th className="py-3.5 px-4">Movement Type</th>
                    <th className="py-3.5 px-4">Quantity Delta</th>
                    <th className="py-3.5 px-4">Warehouse Depot</th>
                    <th className="py-3.5 px-4">Reference / PO</th>
                    <th className="py-3.5 px-4 text-right">Performed By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { date: "2026-10-04 14:30", product: "Yirgacheffe Grade 1 Arabica Coffee", sku: "CAF-YIR-001", type: "Stock In", delta: +200, unit: "Quintal", wh: "WH-AA (Addis Ababa)", ref: "GRN-2026-9921", by: "Kassahun T." },
                    { date: "2026-10-03 11:15", product: "Magna White Teff Grain", sku: "TEF-MAG-101", type: "Stock Out", delta: -120, unit: "Quintal", wh: "WH-AA (Addis Ababa)", ref: "ORD-ETH-8650", by: "Ephrem Negash" },
                    { date: "2026-10-02 16:40", product: "Deformed Steel Rebar 16mm", sku: "STL-RBR-601", type: "Reservation", delta: -45, unit: "Tons", wh: "WH-DD (Dire Dawa)", ref: "ESCROW-9844", by: "Commercial Bank" },
                    { date: "2026-10-01 09:20", product: "Humera Sesame Seeds", sku: "SES-HUM-301", type: "Transfer", delta: -50, unit: "Quintal", wh: "WH-AA -> WH-HW", ref: "TRF-2026-088", by: "Solomon Haile" },
                    { date: "2026-09-29 17:00", product: "Portland Cement 42.5R", sku: "CEM-MUG-801", type: "Damaged", delta: -40, unit: "Bags", wh: "WH-AA (Addis Ababa)", ref: "SCRAP-9920", by: "Abebe Worku" },
                    { date: "2026-09-28 10:10", product: "Magna White Teff Grain", sku: "TEF-MAG-101", type: "Adjustment", delta: +10, unit: "Quintal", wh: "WH-AA (Addis Ababa)", ref: "ADJ-2026-088", by: "Internal Audit" },
                  ].map((m, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-5 font-mono opacity-80 whitespace-nowrap">{m.date}</td>
                      <td className="py-3.5 px-4 font-bold">{m.product}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${m.type === "Stock In"
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : m.type === "Stock Out"
                                ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                                : m.type === "Reservation"
                                  ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                  : m.type === "Transfer"
                                    ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                                    : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                            }`}
                        >
                          {m.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span className={m.delta > 0 ? "text-emerald-500" : "text-rose-500"}>
                          {m.delta > 0 ? `+${m.delta}` : m.delta} {m.unit}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 opacity-80">{m.wh}</td>
                      <td className="py-3.5 px-4 font-mono opacity-80">{m.ref}</td>
                      <td className="py-3.5 px-4 text-right font-medium">{m.by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: TRANSFERS
         ========================================================================= */}
      {activeTabSub === "transfers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-bold text-base ${isLight ? "text-slate-900" : "text-white"}`}>
                Inter-Depot Freight Transfers
              </h3>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                Manage multi-axle freight movement pipeline between central hubs and regional dry ports
              </p>
            </div>
            <button
              onClick={() => setIsTransferOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#388E3C] text-xs font-bold text-white shadow-sm cursor-pointer"
            >
              <Truck className="h-4 w-4" />
              <span>+ New Transfer</span>
            </button>
          </div>

          <div
            className={`rounded-2xl border shadow-xl overflow-hidden w-full ${isLight ? "border-slate-200 bg-white" : isSystem ? "border-blue-500/25 bg-[#0f1b3b]" : "border-white/10 bg-[#141418]"
              }`}
          >
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr
                    className={`border-b font-semibold uppercase text-[11px] tracking-wider select-none ${isLight ? "border-slate-200 bg-slate-50 text-slate-600" : "border-white/10 bg-white/[0.03] text-zinc-400"
                      }`}
                  >
                    <th className="py-3.5 px-5">Transfer #</th>
                    <th className="py-3.5 px-4">Origin & Destination</th>
                    <th className="py-3.5 px-4">Commodity</th>
                    <th className="py-3.5 px-4">Quantity</th>
                    <th className="py-3.5 px-4">Pipeline Status</th>
                    <th className="py-3.5 px-4">Dispatch Date</th>
                    <th className="py-3.5 px-4 text-right">Initiated By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { id: "TRF-2026-088", from: "WH-AA (Addis Ababa)", to: "WH-HW (Hawassa)", prod: "Humera Sesame Seeds", qty: "3,000 KG", status: "In Transit", date: "2026-10-01", by: "Solomon Haile" },
                    { id: "TRF-2026-079", from: "WH-DD (Dire Dawa)", to: "WH-AA (Addis Ababa)", prod: "Deformed Steel Rebar 16mm", qty: "30 Tons", status: "Received", date: "2026-09-24", by: "Ephrem Negash" },
                    { id: "TRF-2026-095", from: "WH-AA (Addis Ababa)", to: "WH-MJ (Mojo Port)", prod: "Magna White Teff Grain", qty: "100 Quintal", status: "Approved", date: "2026-10-04", by: "Abebe Worku" },
                  ].map((t, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-emerald-500">{t.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span>{t.from}</span>
                          <ChevronRight className="h-3 w-3 opacity-60" />
                          <span className="font-semibold">{t.to}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold">{t.prod}</td>
                      <td className="py-3.5 px-4 font-mono font-bold">{t.qty}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${t.status === "Received"
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : t.status === "In Transit"
                                ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                : "bg-blue-500/15 text-blue-400 border-blue-500/30"
                            }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 opacity-80">{t.date}</td>
                      <td className="py-3.5 px-4 text-right font-medium">{t.by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: RESERVATIONS
         ========================================================================= */}
      {activeTabSub === "reservations" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-bold text-base ${isLight ? "text-slate-900" : "text-white"}`}>
                B2B Buyer Escrow Stock Reservations
              </h3>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                Commodity stock locked for verified corporate purchase orders backed by Commercial Bank of Ethiopia escrow
              </p>
            </div>
          </div>

          <div
            className={`rounded-2xl border shadow-xl overflow-hidden w-full ${isLight ? "border-slate-200 bg-white" : isSystem ? "border-blue-500/25 bg-[#0f1b3b]" : "border-white/10 bg-[#141418]"
              }`}
          >
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr
                    className={`border-b font-semibold uppercase text-[11px] tracking-wider select-none ${isLight ? "border-slate-200 bg-slate-50 text-slate-600" : "border-white/10 bg-white/[0.03] text-zinc-400"
                      }`}
                  >
                    <th className="py-3.5 px-5">Order / Contract #</th>
                    <th className="py-3.5 px-4">B2B Buyer Company</th>
                    <th className="py-3.5 px-4">Reserved Commodity</th>
                    <th className="py-3.5 px-4">Quantity</th>
                    <th className="py-3.5 px-4">Escrow Value</th>
                    <th className="py-3.5 px-4">Reservation Status</th>
                    <th className="py-3.5 px-4 text-right">Expiry Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {reservations.map((res) => (
                    <tr key={res.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-indigo-400">{res.orderNumber}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold">{res.buyerCompany}</p>
                        <p className="text-[11px] opacity-75">{res.buyerContact}</p>
                      </td>
                      <td className="py-3.5 px-4 font-semibold">{res.productName}</td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        {res.quantity.toLocaleString()} {res.unit}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-500">
                        ETB {res.escrowAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${res.status === "confirmed"
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : res.status === "converted_to_shipment"
                                ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                                : "bg-blue-500/15 text-blue-400 border-blue-500/30"
                            }`}
                        >
                          {res.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono opacity-80">{res.expiryDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: DAMAGED STOCK
         ========================================================================= */}
      {activeTabSub === "damaged" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-bold text-base ${isLight ? "text-slate-900" : "text-white"}`}>
                Damaged Stock & Scrap Deductions
              </h3>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                Damaged commodity stock is strictly quarantined and excluded from available inventory
              </p>
            </div>
          </div>

          <div
            className={`rounded-2xl border shadow-xl overflow-hidden w-full ${isLight ? "border-slate-200 bg-white" : isSystem ? "border-blue-500/25 bg-[#0f1b3b]" : "border-white/10 bg-[#141418]"
              }`}
          >
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr
                    className={`border-b font-semibold uppercase text-[11px] tracking-wider select-none ${isLight ? "border-slate-200 bg-slate-50 text-slate-600" : "border-white/10 bg-white/[0.03] text-zinc-400"
                      }`}
                  >
                    <th className="py-3.5 px-5">Commodity Product</th>
                    <th className="py-3.5 px-4">Warehouse Depot</th>
                    <th className="py-3.5 px-4">Damaged Qty</th>
                    <th className="py-3.5 px-4">Estimated Loss</th>
                    <th className="py-3.5 px-4">Damage Reason</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {damagedStock.map((dmg) => (
                    <tr key={dmg.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-5 font-bold">
                        {dmg.productName}
                        <span className="block text-[10px] font-mono opacity-60 font-normal">{dmg.sku}</span>
                      </td>
                      <td className="py-3.5 px-4 opacity-80">{dmg.warehouse.split("(")[0]}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-500">
                        {dmg.quantity} {dmg.unit}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">ETB {dmg.lossValueETB.toLocaleString()}</td>
                      <td className="py-3.5 px-4 max-w-xs truncate opacity-85">{dmg.reason}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${dmg.status === "written_off"
                              ? "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                              : dmg.status === "approved"
                                ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                            }`}
                        >
                          {dmg.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {dmg.status !== "written_off" ? (
                          <button
                            onClick={() => setWriteOffItem(dmg)}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                          >
                            Write Off
                          </button>
                        ) : (
                          <span className="text-xs opacity-50 font-medium">Written Off</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* =========================================================================
          TAB 9: ALERTS
         ========================================================================= */}
      {activeTabSub === "alerts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-bold text-base ${isLight ? "text-slate-900" : "text-white"}`}>
                Inventory Health Alerts Center
              </h3>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                Real-time warnings for low stock buffers, stockouts, overstock capacity, and audit discrepancies
              </p>
            </div>
            <button
              onClick={() => {
                setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
                toast.success("All alerts marked as read.");
              }}
              className="text-xs font-semibold text-emerald-500 hover:underline cursor-pointer"
            >
              Mark all as read
            </button>
          </div>

          <div className="space-y-3">
            {alerts.map((al) => (
              <div
                key={al.id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all ${al.severity === "critical"
                    ? isLight
                      ? "border-rose-200 bg-rose-50/80"
                      : "border-rose-500/30 bg-rose-500/10"
                    : al.severity === "warning"
                      ? isLight
                        ? "border-amber-200 bg-amber-50/80"
                        : "border-amber-500/30 bg-amber-500/10"
                      : isLight
                        ? "border-blue-200 bg-blue-50/80"
                        : "border-blue-500/30 bg-blue-500/10"
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${al.severity === "critical"
                        ? "bg-rose-500/20 text-rose-400"
                        : al.severity === "warning"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                  >
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{al.productName}</span>
                      <span className="font-mono text-[10px] uppercase font-bold opacity-75">
                        {al.type.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="opacity-90">{al.message}</p>
                    <div className="flex items-center gap-3 text-[11px] opacity-75 pt-1">
                      <span>Warehouse: {al.warehouse.split("(")[0]}</span>
                      <span>•</span>
                      <span>Level: {al.currentLevel} (Target: {al.targetLevel})</span>
                      <span>•</span>
                      <span>{al.timestamp}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => {
                      const matched = inventory.find((p) => p.name === al.productName);
                      if (matched) {
                        setSelectedProduct(matched);
                        setIsAddStockOpen(true);
                      } else {
                        setIsAddStockOpen(true);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#388E3C] text-white font-bold text-xs cursor-pointer shadow-sm"
                  >
                    {al.actionLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 10: REPORTS
         ========================================================================= */}
      {activeTabSub === "reports" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-bold text-base ${isLight ? "text-slate-900" : "text-white"}`}>
                B2B Inventory Intelligence & Financial Reports
              </h3>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                Generate and download audit-ready commodity stock reports in CSV, Excel, or official PDF formats
              </p>
            </div>
            <button
              onClick={() => setIsExportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#388E3C] text-xs font-bold text-white shadow-sm cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Export Reports</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Stock Valuation & Cost Price", desc: "Detailed breakdown of inventory quantities, cost basis, selling price, and gross margin per depot.", format: "CSV, Excel, PDF" },
              { title: "Stock Movement Audit Ledger", desc: "Complete immutable traceability log of every Stock In, Stock Out, and transfer transaction.", format: "CSV, Excel" },
              { title: "Multi-Depot Warehouse Utilization", desc: "Square-meter and metric unit capacity breakdown across Addis Ababa, Hawassa, Mojo, and Dire Dawa.", format: "Excel, PDF" },
              { title: "Low Stock & Safety Buffer", desc: "Restock recommendations, supplier lead times, and products below safety buffer levels.", format: "CSV, PDF" },
              { title: "Damaged Stock & Scrap Deductions", desc: "Audit report of damaged items, quarantine reasons, and written-off loss valuations.", format: "CSV, Excel" },
              { title: "B2B Escrow Reserved Inventory", desc: "Active purchase order allocations secured under Commercial Bank of Ethiopia escrow.", format: "Excel, PDF" },
            ].map((rep, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 ${isLight ? "bg-white border-slate-200 shadow-xs" : isSystem ? "bg-[#0f1b3b] border-blue-500/25" : "bg-[#141418] border-white/10"
                  }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FileText className="h-5 w-5 text-emerald-500" />
                    <span className="text-[10px] font-mono font-bold bg-white/10 px-2 py-0.5 rounded">
                      {rep.format}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm">{rep.title}</h4>
                  <p className="text-xs opacity-75">{rep.desc}</p>
                </div>

                <button
                  onClick={() => setIsExportOpen(true)}
                  className={`w-full py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${isLight ? "border-slate-200 bg-slate-50 hover:bg-slate-100" : "border-white/10 bg-white/[0.04] hover:bg-white/10"
                    }`}
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Report</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Product Inventory Details Slide-out Drawer */}
      <SupplierProductDrawer
        product={selectedProduct}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenAddStock={(p) => {
          setSelectedProduct(p);
          setIsAddStockOpen(true);
        }}
        onOpenTransfer={(p) => {
          setSelectedProduct(p);
          setIsTransferOpen(true);
        }}
      />

      {/* 6. B2B Enterprise Modals */}
      <AddStockModal
        isOpen={isAddStockOpen}
        onClose={() => setIsAddStockOpen(false)}
        products={inventory}
        defaultProduct={selectedProduct}
        onAddStock={handleAddStock}
      />

      <TransferStockModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        products={inventory}
        defaultProduct={selectedProduct}
        onTransferStock={handleTransferStock}
      />

      <DamagedWriteOffModal
        item={writeOffItem}
        isOpen={!!writeOffItem}
        onClose={() => setWriteOffItem(null)}
        onConfirmWriteOff={handleConfirmWriteOff}
      />

      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
}

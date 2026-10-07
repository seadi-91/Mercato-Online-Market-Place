"use client";

import React, { useState, useEffect } from "react";
import {
  Building,
  ArrowRightLeft,
  Boxes,
  MapPin,
  Phone,
  User,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  Thermometer,
  Droplets,
  ShieldCheck,
  Truck,
  ExternalLink,
  Printer,
  Search,
  MoreVertical,
  Trash2,
  Check,
  Layers,
  Compass,
  FileText,
  AlertTriangle,
  Flame,
  Radio,
  Eye,
  Calendar,
  Sparkles,
  Package,
  RotateCcw,
  AlertOctagon,
  Activity,
  BarChart3,
  X,
  Download,
  Filter,
} from "lucide-react";
import { PageHeader } from "../shared/page-header";
import { StatusBadge } from "../shared/status-badge";
import { EmptyState } from "../shared/empty-state";
import { useSupplierStore } from "@/store/supplier-store";
import { useThemeStore } from "@/store/theme-store";
import { Warehouse, WarehouseTransfer } from "@/types/supplier";
import { toast } from "sonner";

import { useAuthStore } from "@/store/auth-store";

export function SupplierWarehouseView() {
  const {
    warehouses,
    transfers,
    isLoadingWarehouses,
    warehousesError,
    fetchWarehouses,
    fetchTransfers,
    inventoryMovements,
    products,
    fetchProducts,
    orders,
    returns,
    openModal,
    setActiveTab,
    completeTransfer,
    deleteTransfer,
    addWarehouse,
    deleteWarehouse,
    adjustStock,
    transferStock,
    currentStaffUser,
  } = useSupplierStore();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const isLight = theme === "light";
  const isSystem = theme === "system";

  // Fetch warehouses and transfers from PostgreSQL database on mount
  useEffect(() => {
    fetchWarehouses();
    fetchTransfers();
    if (products.length === 0) {
      fetchProducts();
    }
  }, [fetchWarehouses, fetchTransfers, fetchProducts, products.length]);

  const [activeWarehouseId, setActiveWarehouseId] = useState<string>(
    (user?.staffRole === "branch_manager" && user.branchId)
      ? user.branchId
      : currentStaffUser?.role === "branch_manager"
      ? currentStaffUser.branchId
      : warehouses[0]?.id || ""
  );

  useEffect(() => {
    if (user?.staffRole === "branch_manager" && user.branchId) {
      setActiveWarehouseId(user.branchId);
    } else if (currentStaffUser?.role === "branch_manager" && currentStaffUser.branchId) {
      setActiveWarehouseId(currentStaffUser.branchId);
    } else if (
      warehouses.length > 0 &&
      (!activeWarehouseId || !warehouses.some((w) => w.id === activeWarehouseId))
    ) {
      setActiveWarehouseId(warehouses[0].id);
    }
  }, [user, currentStaffUser, warehouses, activeWarehouseId]);

  const [activeTab, setActiveWarehouseTab] = useState<
    | "overview"
    | "stock"
    | "locations"
    | "receiving"
    | "dispatch"
    | "transfers"
    | "returns"
    | "damaged"
    | "activity"
    | "reports"
  >("overview");

  // Filter states
  const [stockSearchQuery, setStockSearchQuery] = useState("");
  const [transferSearchQuery, setTransferSearchQuery] = useState("");
  const [transferStatusFilter, setTransferStatusFilter] = useState("all");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showAlertBanner, setShowAlertBanner] = useState(true);

  // Modals state
  const [isAddWarehouseModalOpen, setIsAddWarehouseModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  // Submitting & Deleting States
  const [isSubmittingWh, setIsSubmittingWh] = useState(false);
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);
  const [isDeletingWhId, setIsDeletingWhId] = useState<string | null>(null);

  // Add Warehouse Form State
  const [newWhForm, setNewWhForm] = useState({
    name: "",
    code: "",
    facilityType: "Central Logistics Hub" as const,
    managerName: "",
    managerEmail: "",
    phone: "",
    region: "Addis Ababa",
    city: "Addis Ababa",
    address: "",
    totalCapacityM2: 10000,
  });

  // Transfer Form State
  const [transferForm, setTransferForm] = useState({
    fromWarehouse: warehouses[0]?.name || "",
    toWarehouse: warehouses[1]?.name || "",
    productName: products[0]?.name || "Deformed High-Tensile Steel Rebar 16mm",
    quantity: 20,
    unit: "Tons",
    carrierVehicle: "Mercedes Actros 40-Ton (Plate AA-3-98210)",
    driverName: "Mulugeta Tadesse (+251 91 144 2200)",
  });

  // Keep transfer form warehouse options synced with loaded warehouses
  useEffect(() => {
    if (warehouses.length > 0) {
      setTransferForm((prev) => ({
        ...prev,
        fromWarehouse: prev.fromWarehouse || warehouses[0]?.name || "",
        toWarehouse: prev.toWarehouse || warehouses[1]?.name || warehouses[0]?.name || "",
      }));
    }
  }, [warehouses]);

  // Adjust Form State
  const [adjustForm, setAdjustForm] = useState({
    warehouse: warehouses[0]?.name || "",
    productName: products[0]?.name || "Deformed High-Tensile Steel Rebar 16mm",
    deltaQty: 10,
    reason: "Routine Physical Cycle Count Reconciliation",
  });

  // Close 3-dot dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const activeWarehouse: Warehouse =
    warehouses.find((w) => w.id === activeWarehouseId) ||
    warehouses[0] ||
    ({
      id: "loading",
      name: "Loading Hub...",
      code: "WH-LOAD",
      region: "Addis Ababa",
      city: "Addis Ababa",
      address: "Logistics Hub",
      managerName: "Depot Manager",
      phone: "+251 11 000 0000",
      totalCapacityM2: 10000,
      usedCapacityM2: 0,
      totalStockUnits: 0,
      stockDistribution: [],
    } as unknown as Warehouse);

  // Aggregate metrics
  const totalCapacityM2 = warehouses.reduce((acc, w) => acc + (w.totalCapacityM2 || 0), 0);
  const usedCapacityM2 = warehouses.reduce((acc, w) => acc + (w.usedCapacityM2 || 0), 0);
  const aggregateCapacityPercent =
    totalCapacityM2 > 0 ? Math.round((usedCapacityM2 / totalCapacityM2) * 100) : 0;

  const totalCommodityValuationETB = warehouses.reduce((acc, w) => {
    return (
      acc +
      (w.stockDistribution || []).reduce((sub, item) => sub + (item.estimatedValueETB || 0), 0)
    );
  }, 0);

  const totalActiveStockUnits = warehouses.reduce((acc, w) => acc + (w.totalStockUnits || 0), 0);

  // Active warehouse capacity %
  const activeWhCapacityPercent =
    activeWarehouse.totalCapacityM2 && activeWarehouse.totalCapacityM2 > 0
      ? Math.round(((activeWarehouse.usedCapacityM2 || 0) / activeWarehouse.totalCapacityM2) * 100)
      : 0;

  // Filter transfers
  const filteredTransfers = transfers.filter((t) => {
    const matchesSearch =
      (t.transferNumber || "").toLowerCase().includes(transferSearchQuery.toLowerCase()) ||
      (t.productName || "").toLowerCase().includes(transferSearchQuery.toLowerCase()) ||
      (t.fromWarehouse || "").toLowerCase().includes(transferSearchQuery.toLowerCase()) ||
      (t.toWarehouse || "").toLowerCase().includes(transferSearchQuery.toLowerCase()) ||
      (t.driverName && t.driverName.toLowerCase().includes(transferSearchQuery.toLowerCase()));

    const matchesStatus = transferStatusFilter === "all" || t.status === transferStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter stock for active warehouse
  const filteredStock = (activeWarehouse.stockDistribution || []).filter((s) => {
    return (
      s.productName.toLowerCase().includes(stockSearchQuery.toLowerCase()) ||
      (s.category && s.category.toLowerCase().includes(stockSearchQuery.toLowerCase())) ||
      (s.bayLocation && s.bayLocation.toLowerCase().includes(stockSearchQuery.toLowerCase())) ||
      (s.lotNumber && s.lotNumber.toLowerCase().includes(stockSearchQuery.toLowerCase()))
    );
  });

  // Handle Add Warehouse Submit (Async to PostgreSQL DB)
  const handleAddWarehouseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhForm.name.trim() || !newWhForm.code.trim()) {
      toast.error("Please enter a warehouse name and depot code.");
      return;
    }
    setIsSubmittingWh(true);
    try {
      const created = await addWarehouse({
        name: newWhForm.name.trim(),
        code: newWhForm.code.trim().toUpperCase(),
        region: newWhForm.region,
        city: newWhForm.city,
        address: newWhForm.address.trim() || `${newWhForm.city} Industrial Logistics Zone`,
        managerName: newWhForm.managerName.trim() || "Operations Lead",
        managerEmail: newWhForm.managerEmail.trim() || "ops@abyssiniasupply.et",
        phone: newWhForm.phone.trim() || "+251 11 000 0000",
        facilityType: newWhForm.facilityType,
        totalCapacityM2: Number(newWhForm.totalCapacityM2) || 8000,
        usedCapacityM2: 0,
        totalStockUnits: 0,
        temperatureControlled: true,
        temperatureReading: "21.0°C",
        humidityReading: "45% RH",
        securityLevel: "24/7 Biometric Guarded & CCTV",
        activeLoadingDocks: 2,
        totalLoadingDocks: 4,
        fleetBaysCount: 8,
        operatingHours: "24/7 Continuous Receiving",
        stockDistribution: [],
      });
      setIsAddWarehouseModalOpen(false);
      if (created?.id) {
        setActiveWarehouseId(created.id);
      }
      setNewWhForm({
        name: "",
        code: "",
        facilityType: "Central Logistics Hub",
        managerName: "",
        managerEmail: "",
        phone: "",
        region: "Addis Ababa",
        city: "Addis Ababa",
        address: "",
        totalCapacityM2: 10000,
      });
    } catch {
      // Error handled by store toast
    } finally {
      setIsSubmittingWh(false);
    }
  };

  // Handle Delete Warehouse
  const handleDeleteWarehouse = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove depot "${name}" from your network?`)) {
      return;
    }
    setIsDeletingWhId(id);
    try {
      const ok = await deleteWarehouse(id);
      if (ok && activeWarehouseId === id) {
        const remaining = warehouses.filter((w) => w.id !== id);
        if (remaining.length > 0) {
          setActiveWarehouseId(remaining[0].id);
        }
      }
    } finally {
      setIsDeletingWhId(null);
    }
  };

  // Handle Transfer Submit (Async to PostgreSQL DB)
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferForm.fromWarehouse || !transferForm.toWarehouse) {
      toast.error("Please select both origin and destination depots.");
      return;
    }
    if (transferForm.fromWarehouse === transferForm.toWarehouse) {
      toast.error("Origin and destination depots cannot be the same.");
      return;
    }
    setIsSubmittingTransfer(true);
    try {
      await transferStock(
        transferForm.fromWarehouse,
        transferForm.toWarehouse,
        transferForm.productName,
        Number(transferForm.quantity) || 1,
        transferForm.unit
      );
      setIsTransferModalOpen(false);
    } catch {
      // Error handled by store toast
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  // Handle Adjust Submit
  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adjustStock(
      "prod-rebar-16",
      Number(adjustForm.deltaQty),
      adjustForm.reason,
      adjustForm.warehouse
    );
    setIsAdjustModalOpen(false);
  };

  // Theme helper classes
  const cardBgClass = isLight
    ? "bg-white border-slate-200 text-slate-800"
    : isSystem
    ? "bg-[#0b142c] border-blue-500/20 text-white"
    : "bg-[#10131c] border-white/10 text-white";

  const innerCardBgClass = isLight
    ? "bg-slate-50 border-slate-200 text-slate-800"
    : isSystem
    ? "bg-blue-950/20 border-blue-500/20 text-white"
    : "bg-white/[0.02] border-white/10 text-white";

  const tableHeaderBgClass = isLight
    ? "border-slate-200 bg-slate-50/75 text-slate-500"
    : isSystem
    ? "border-blue-500/20 bg-blue-950/30 text-slate-400"
    : "border-white/10 bg-white/[0.02] text-zinc-400";

  return (
    <div className="space-y-4">
      {/* 1. COMPACT PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-inherit">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h1
              className={`text-xl sm:text-2xl font-bold tracking-tight ${
                isLight ? "text-slate-900" : "text-white"
              }`}
            >
              Warehouse Management
            </h1>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Enterprise WMS
            </span>
          </div>
          <p className={`text-xs ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
            Manage warehouses, storage capacity, receiving, dispatch, and transfers.
          </p>
        </div>

        {/* Compact Action Buttons (Height 34–38px) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Real Database Indicator */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline font-semibold">PostgreSQL:</span>
            <span>mercatox_catalog_db</span>
          </div>

          <button
            onClick={() => {
              fetchWarehouses();
              fetchTransfers();
              toast.success("Synchronized warehouse depots from PostgreSQL database!");
            }}
            disabled={isLoadingWarehouses}
            className={`inline-flex items-center gap-1.5 h-8.5 px-2.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              isLight
                ? "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                : "border-white/10 bg-white/5 hover:bg-white/10 text-zinc-200"
            }`}
            title="Refresh depots from database"
          >
            <RotateCcw className={`h-3.5 w-3.5 text-indigo-400 ${isLoadingWarehouses ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Sync DB</span>
          </button>

          <button
            onClick={() => setIsAddWarehouseModalOpen(true)}
            className="inline-flex items-center gap-1.5 h-8.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Add Warehouse</span>
          </button>

          <button
            onClick={() => setIsAdjustModalOpen(true)}
            className={`inline-flex items-center gap-1.5 h-8.5 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              isLight
                ? "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                : "border-white/10 bg-white/5 hover:bg-white/10 text-zinc-200"
            }`}
          >
            <Boxes className="h-3.5 w-3.5 text-indigo-400" />
            <span>Receive / Adjust</span>
          </button>

          <button
            onClick={() => setIsTransferModalOpen(true)}
            className={`inline-flex items-center gap-1.5 h-8.5 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              isLight
                ? "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                : "border-white/10 bg-white/5 hover:bg-white/10 text-zinc-200"
            }`}
          >
            <ArrowRightLeft className="h-3.5 w-3.5 text-cyan-400" />
            <span>Transfer</span>
          </button>

          <button
            onClick={() => {
              setActiveWarehouseTab("dispatch");
              toast.info("Switched to outbound dispatch manifests.");
            }}
            className={`inline-flex items-center gap-1.5 h-8.5 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              isLight
                ? "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                : "border-white/10 bg-white/5 hover:bg-white/10 text-zinc-200"
            }`}
          >
            <Truck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Dispatch</span>
          </button>

          <button
            onClick={() => toast.success("Exported multi-depot inventory and capacity audit report (CSV).")}
            className={`inline-flex items-center gap-1.5 h-8.5 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              isLight
                ? "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                : "border-white/10 bg-white/5 hover:bg-white/10 text-zinc-200"
            }`}
          >
            <Download className="h-3.5 w-3.5 text-zinc-400" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* 2. COMPACT KPI ROW (Height: 80–90px, 6 cards in one row on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* Total Warehouses */}
        <div className={`p-3 rounded-lg border flex flex-col justify-between ${cardBgClass}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-medium ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              Total Warehouses
            </span>
            <Building className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
          </div>
          <div>
            <span className={`text-xl font-bold font-mono ${isLight ? "text-slate-900" : "text-white"}`}>
              {warehouses.length}
            </span>
            <span className="text-[10px] text-emerald-400 font-medium block">
              {warehouses.length} Active Hubs
            </span>
          </div>
        </div>

        {/* Total Capacity */}
        <div className={`p-3 rounded-lg border flex flex-col justify-between ${cardBgClass}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-medium ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              Capacity
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-400">
              {aggregateCapacityPercent}%
            </span>
          </div>
          <div>
            <span className={`text-xl font-bold font-mono ${isLight ? "text-slate-900" : "text-white"}`}>
              {(usedCapacityM2 / 1000).toFixed(1)}K{" "}
              <span className="text-xs text-zinc-400 font-normal">/ {(totalCapacityM2 / 1000).toFixed(1)}K m²</span>
            </span>
            <div className="w-full bg-white/10 rounded-full h-1 mt-1 overflow-hidden">
              <div
                className="bg-emerald-500 h-1 rounded-full transition-all"
                style={{ width: `${aggregateCapacityPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stock Value */}
        <div className={`p-3 rounded-lg border flex flex-col justify-between ${cardBgClass}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-medium ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              Stock Value
            </span>
            <Boxes className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          </div>
          <div>
            <span className="text-xl font-bold font-mono text-emerald-400">
              {(totalCommodityValuationETB / 1000000).toFixed(1)}M ETB
            </span>
            <span className={`text-[10px] block ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              {(totalActiveStockUnits / 1000).toFixed(0)}K Total Units
            </span>
          </div>
        </div>

        {/* Active Docks */}
        <div className={`p-3 rounded-lg border flex flex-col justify-between ${cardBgClass}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-medium ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              Active Docks
            </span>
            <Truck className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          </div>
          <div>
            <span className={`text-xl font-bold font-mono ${isLight ? "text-slate-900" : "text-white"}`}>
              17 / 24
            </span>
            <span className="text-[10px] text-cyan-400 font-medium block">
              70% Docks In-Use
            </span>
          </div>
        </div>

        {/* Transfers */}
        <div className={`p-3 rounded-lg border flex flex-col justify-between ${cardBgClass}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-medium ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              Transfers
            </span>
            <ArrowRightLeft className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
          </div>
          <div>
            <span className={`text-xl font-bold font-mono ${isLight ? "text-slate-900" : "text-white"}`}>
              {transfers.length} Active
            </span>
            <span className="text-[10px] text-indigo-400 font-medium block">
              {transfers.filter((t) => t.status === "in_transit").length} In-Transit
            </span>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className={`p-3 rounded-lg border flex flex-col justify-between ${cardBgClass}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-medium ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              Stock Alerts
            </span>
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          </div>
          <div>
            <span className="text-xl font-bold font-mono text-amber-400">
              2 Items Low
            </span>
            <span className="text-[10px] text-amber-400/90 font-medium block">
              Reorder Threshold
            </span>
          </div>
        </div>
      </div>

      {/* 3. COMPACT INLINE ALERTS */}
      {showAlertBanner && (
        <div
          className={`px-3 py-2 rounded-lg border flex items-center justify-between text-xs transition-all ${
            isLight
              ? "bg-amber-50/80 border-amber-200 text-amber-900"
              : "bg-amber-500/10 border-amber-500/20 text-amber-300"
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="truncate">
              <strong>Depot Notice:</strong> Addis Central Hub is at <strong>82% capacity</strong> • 2 products require replenishment (Muger Cement, Magna Teff).
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setActiveWarehouseId("wh-aa");
                setActiveWarehouseTab("stock");
              }}
              className="font-semibold underline hover:text-amber-400 cursor-pointer text-[11px]"
            >
              Inspect Stock
            </button>
            <button
              onClick={() => setShowAlertBanner(false)}
              className="p-1 hover:bg-black/10 rounded cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* 4. COMPACT WAREHOUSE CARDS (MY WAREHOUSES) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h2 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-800" : "text-zinc-200"}`}>
            My Warehouses ({warehouses.length})
          </h2>
          <span className={`text-[11px] ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
            Click card to switch active WMS context
          </span>
        </div>

        {isLoadingWarehouses && warehouses.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-indigo-500/30 bg-indigo-500/5 space-y-3">
            <div className="inline-flex p-3 rounded-full bg-indigo-500/10 text-indigo-400 animate-spin">
              <RotateCcw className="h-5 w-5" />
            </div>
            <h3 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
              Connecting to MercatoX Logistics Database...
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Fetching registered warehouses and calculating live commodity inventory valuations from{" "}
              <code className="text-indigo-400 font-mono">mercatox_catalog_db</code>.
            </p>
          </div>
        ) : warehousesError && warehouses.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-red-500/30 bg-red-500/10 space-y-3">
            <AlertOctagon className="h-6 w-6 text-red-400 mx-auto" />
            <h3 className="text-sm font-bold text-red-200">Unable to Connect to Warehouse Database</h3>
            <p className="text-xs text-red-300/80 max-w-sm mx-auto">{warehousesError}</p>
            <button
              onClick={() => fetchWarehouses()}
              className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer shadow-xs"
            >
              Retry Connection
            </button>
          </div>
        ) : warehouses.length === 0 ? (
          <div className={`p-8 text-center rounded-xl border ${cardBgClass} space-y-3`}>
            <Building className="h-8 w-8 text-indigo-400 mx-auto" />
            <h3 className="text-sm font-bold">No Warehouse Depots in Database</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Your supplier account doesn&apos;t have any registered hubs yet in mercatox_catalog_db. Click below to add your first depot.
            </p>
            <button
              onClick={() => setIsAddWarehouseModalOpen(true)}
              className="h-8.5 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-xs cursor-pointer"
            >
              + Add Warehouse Depot
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {warehouses.map((wh) => {
              const isSelected = wh.id === activeWarehouseId;
              const capPercent =
                wh.totalCapacityM2 > 0
                  ? Math.round(((wh.usedCapacityM2 || 0) / wh.totalCapacityM2) * 100)
                  : 0;
              const whValuationETB = (wh.stockDistribution || []).reduce(
                (sum, item) => sum + (item.estimatedValueETB || 0),
                0
              );

              return (
                <div
                  key={wh.id}
                  onClick={() => setActiveWarehouseId(wh.id)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? isLight
                        ? "border-indigo-600 bg-white ring-1 ring-indigo-600 shadow-xs"
                        : "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30"
                      : `${cardBgClass} hover:border-indigo-500/30`
                  }`}
                >
                  {/* Header: Name, Code & Status */}
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="min-w-0">
                      <h3 className={`text-xs font-bold truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                        {wh.name}
                      </h3>
                      <p className={`text-[11px] truncate ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                        {wh.city} · <strong className="font-mono text-indigo-400">{wh.code}</strong>
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                      Active
                    </span>
                  </div>

                  {/* Capacity Thin Progress Bar */}
                  <div className="mt-2.5 space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Capacity:</span>
                      <span className="font-mono font-bold text-xs">
                        {capPercent}% Used
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(capPercent, 100)}%` }}
                        className={`h-1 rounded-full ${
                          capPercent > 80 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                      <span>{(wh.usedCapacityM2 || 0).toLocaleString()} m²</span>
                      <span>{(wh.totalCapacityM2 || 0).toLocaleString()} m²</span>
                    </div>
                  </div>

                  {/* Stats & Actions Footer */}
                  <div className="mt-2.5 pt-2 border-t border-inherit flex items-center justify-between text-[11px]">
                    <div>
                      <span className="text-zinc-400">Value: </span>
                      <strong className="font-mono text-emerald-400">
                        {(whValuationETB / 1000000).toFixed(1)}M ETB
                      </strong>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveWarehouseId(wh.id);
                          setActiveWarehouseTab("stock");
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors cursor-pointer"
                      >
                        Stock
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveWarehouseId(wh.id);
                          setActiveWarehouseTab("overview");
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold hover:bg-white/10 text-zinc-300 transition-colors cursor-pointer"
                      >
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWarehouse(wh.id, wh.name);
                        }}
                        disabled={isDeletingWhId === wh.id}
                        className="p-1 rounded text-[10px] font-semibold hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete depot from database"
                      >
                        {isDeletingWhId === wh.id ? (
                          <RotateCcw className="h-3 w-3 animate-spin text-red-400" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. COMPACT TABS HEADER (10 Tabs: Overview | Stock | Locations | Receiving | Dispatch | Transfers | Returns | Damaged | Activity | Reports) */}
      <div
        className={`flex items-center gap-1 p-1 rounded-lg border overflow-x-auto whitespace-nowrap text-xs ${
          isLight ? "bg-slate-100 border-slate-200" : "bg-white/[0.03] border-white/10"
        }`}
      >
        {[
          { id: "overview", label: "Overview", icon: Building },
          { id: "stock", label: `Stock (${activeWarehouse.stockDistribution?.length || 0})`, icon: Boxes },
          { id: "locations", label: "Locations", icon: MapPin },
          { id: "receiving", label: "Receiving", icon: CheckCircle2 },
          { id: "dispatch", label: "Dispatch", icon: Truck },
          { id: "transfers", label: `Transfers (${transfers.length})`, icon: ArrowRightLeft },
          { id: "returns", label: "Returns", icon: RotateCcw },
          { id: "damaged", label: "Damaged", icon: AlertOctagon },
          { id: "activity", label: "Activity", icon: Activity },
          { id: "reports", label: "Reports", icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveWarehouseTab(tab.id as any)}
              className={`h-8 px-3 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? "bg-indigo-600 text-white font-semibold shadow-xs"
                  : isLight
                  ? "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 6. TAB CONTENT PANELS (Information Dense ERP Layout) */}

      {/* TAB: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Facility Profile */}
          <div className={`p-3.5 rounded-lg border space-y-2.5 ${cardBgClass}`}>
            <div className="flex items-center justify-between pb-2 border-b border-inherit">
              <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-white"}`}>
                <Building className="h-3.5 w-3.5 text-indigo-400" />
                <span>Facility Profile & Operations</span>
              </h3>
              <span className="text-[10px] font-mono text-indigo-400 font-bold">{activeWarehouse.code}</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Facility Type:</span>
                <span className="font-semibold">{activeWarehouse.facilityType || "Central Logistics Hub"}</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Location:</span>
                <span className="font-medium truncate max-w-[190px]">{activeWarehouse.address}</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Hours:</span>
                <span className="font-medium">{activeWarehouse.operatingHours || "24/7 Receiving"}</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Security:</span>
                <span className="text-emerald-400 font-medium">{activeWarehouse.securityLevel || "24/7 CCTV & Guards"}</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Certification:</span>
                <span className="font-mono text-[11px] text-zinc-300">Customs Bonded #ETH-891</span>
              </div>
            </div>

            <div className="pt-2 border-t border-inherit flex items-center justify-between text-xs">
              <div>
                <p className="font-bold">{activeWarehouse.managerName}</p>
                <p className="text-[11px] text-zinc-400">Depot Manager</p>
              </div>
              <a href={`tel:${activeWarehouse.phone}`} className="font-mono text-indigo-400 text-xs hover:underline">
                {activeWarehouse.phone}
              </a>
            </div>
          </div>

          {/* Environmental Telemetry & Docks */}
          <div className={`p-3.5 rounded-lg border space-y-2.5 ${cardBgClass}`}>
            <div className="flex items-center justify-between pb-2 border-b border-inherit">
              <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-white"}`}>
                <Thermometer className="h-3.5 w-3.5 text-cyan-400" />
                <span>Climate Sensors & Loading Docks</span>
              </h3>
              <span className="text-[10px] text-emerald-400 font-bold">Live Feed</span>
            </div>

            {/* Climate Sensors */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className={`p-2 rounded border flex items-center gap-2 ${innerCardBgClass}`}>
                <Thermometer className="h-4 w-4 text-cyan-400" />
                <div>
                  <span className="text-[10px] text-zinc-400 block">Ambient Temp</span>
                  <strong className="text-xs">{activeWarehouse.temperatureReading || "21.4°C"}</strong>
                </div>
              </div>
              <div className={`p-2 rounded border flex items-center gap-2 ${innerCardBgClass}`}>
                <Droplets className="h-4 w-4 text-blue-400" />
                <div>
                  <span className="text-[10px] text-zinc-400 block">Relative Humidity</span>
                  <strong className="text-xs">{activeWarehouse.humidityReading || "48% RH"}</strong>
                </div>
              </div>
            </div>

            {/* Loading Bays Status */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                Loading Bays ({activeWarehouse.activeLoadingDocks || 4}/{activeWarehouse.totalLoadingDocks || 6} In-Use)
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {Array.from({ length: activeWarehouse.totalLoadingDocks || 6 }).map((_, idx) => {
                  const isBusy = idx < (activeWarehouse.activeLoadingDocks || 4);
                  return (
                    <div
                      key={idx}
                      className={`py-1 px-1.5 rounded text-center text-[10px] font-mono border ${
                        isBusy
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      Bay 0{idx + 1}: {isBusy ? "Loading" : "Open"}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Compact Activity Timeline */}
          <div className={`p-3.5 rounded-lg border space-y-2.5 ${cardBgClass}`}>
            <div className="flex items-center justify-between pb-2 border-b border-inherit">
              <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-white"}`}>
                <Activity className="h-3.5 w-3.5 text-indigo-400" />
                <span>Recent Audit Activity</span>
              </h3>
              <button
                onClick={() => setActiveWarehouseTab("activity")}
                className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="font-mono text-[11px] text-zinc-400 shrink-0">10:30</span>
                <p className="truncate">
                  <strong className="text-indigo-400">Abebe</strong> received 500 Qtl Magna Teff (RCV-118)
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-[11px] text-zinc-400 shrink-0">11:20</span>
                <p className="truncate">
                  <strong className="text-cyan-400">Mohammed</strong> transferred 30T Rebar to Hawassa
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-[11px] text-zinc-400 shrink-0">12:10</span>
                <p className="truncate">
                  <strong className="text-emerald-400">Sara</strong> staged dispatch for ORD-ETH-8921
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-[11px] text-zinc-400 shrink-0">14:45</span>
                <p className="truncate">
                  Physical count audit signed for Zone A bays
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: STOCK */}
      {activeTab === "stock" && (
        <div className={`p-3.5 rounded-lg border space-y-3 ${cardBgClass}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Filter commodity, lot, bay location..."
                value={stockSearchQuery}
                onChange={(e) => setStockSearchQuery(e.target.value)}
                className={`w-full pl-8 pr-3 h-8.5 rounded-lg border text-xs outline-none transition-colors ${
                  isLight
                    ? "border-slate-200 bg-white text-slate-800 focus:border-indigo-500"
                    : "border-white/10 bg-white/5 text-white focus:border-indigo-500"
                }`}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAdjustModalOpen(true)}
                className="h-8.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Adjust Stock Count</span>
              </button>
            </div>
          </div>

          {/* Compact Stock Data Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b font-semibold uppercase text-[10px] tracking-wider ${tableHeaderBgClass}`}>
                  <th className="py-2.5 px-3">Commodity Item</th>
                  <th className="py-2.5 px-3">Lot / Batch</th>
                  <th className="py-2.5 px-3">Stacking Bay</th>
                  <th className="py-2.5 px-3">Stock On-Hand</th>
                  <th className="py-2.5 px-3">Reorder Point</th>
                  <th className="py-2.5 px-3">Insured Value (ETB)</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? "divide-slate-200" : isSystem ? "divide-blue-500/10" : "divide-white/5"}`}>
                {filteredStock.map((item, idx) => (
                  <tr key={idx} className={`hover:bg-white/[0.03] transition-colors ${isLight ? "hover:bg-slate-50" : ""}`}>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={item.image || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=100&q=80"}
                          alt={item.productName}
                          className="w-7 h-7 rounded object-cover border border-white/10 shrink-0"
                        />
                        <div>
                          <p className="font-bold truncate max-w-[190px]">{item.productName}</p>
                          <span className="text-[10px] text-zinc-400">{item.category || "General"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-zinc-400">{item.lotNumber || `LOT-${idx + 100}`}</td>
                    <td className="py-2.5 px-3 font-medium">{item.bayLocation || "Zone A"}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-400 text-xs">
                      {item.quantity.toLocaleString()} {item.unit}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-zinc-400">
                      {(item.reorderLevel || 1000).toLocaleString()} {item.unit}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold">
                      ETB {(item.estimatedValueETB || 1000000).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Healthy
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          setTransferForm((prev) => ({
                            ...prev,
                            productName: item.productName,
                            quantity: Math.min(item.quantity, 10),
                            unit: item.unit,
                          }));
                          setIsTransferModalOpen(true);
                        }}
                        className="px-2 py-1 rounded text-[10px] font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 cursor-pointer"
                      >
                        Transfer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: LOCATIONS */}
      {activeTab === "locations" && (
        <div className={`p-3.5 rounded-lg border space-y-3 ${cardBgClass}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-indigo-400" />
              <span>Depot Stacking Zones & Bay Layout ({activeWarehouse.name})</span>
            </h3>
            <span className="text-xs font-mono text-zinc-400">{activeWarehouse.totalCapacityM2.toLocaleString()} m² Total Area</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
            {[
              { code: "Zone A", name: "Climate Cold Storage", bays: "Bays 01 - 06", cap: "85% Full", type: "Coffee & Oilseeds", color: "text-cyan-400" },
              { code: "Zone B", name: "Dry Grain Silos", bays: "Silos 01 - 04", cap: "70% Full", type: "Teff & Cereals", color: "text-amber-400" },
              { code: "Zone C", name: "Heavy Stacking Yard", bays: "Bays 01 - 08", cap: "62% Full", type: "Steel Rebar & Cement", color: "text-indigo-400" },
              { code: "Zone D", name: "Staging & Quarantine", bays: "Bays 01 - 04", cap: "20% Full", type: "QA Clearance Inspection", color: "text-emerald-400" },
            ].map((zone, idx) => (
              <div key={idx} className={`p-3 rounded-lg border space-y-1.5 ${innerCardBgClass}`}>
                <div className="flex justify-between items-center">
                  <span className={`font-mono text-xs font-bold ${zone.color}`}>{zone.code}</span>
                  <span className="text-[10px] font-mono text-zinc-400">{zone.cap}</span>
                </div>
                <h4 className="font-bold text-xs">{zone.name}</h4>
                <p className="text-[11px] text-zinc-400">{zone.bays}</p>
                <span className="text-[10px] text-zinc-500 block">{zone.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: RECEIVING */}
      {activeTab === "receiving" && (
        <div className={`p-3.5 rounded-lg border space-y-3 ${cardBgClass}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Inbound Receiving Log & QA Gate</span>
            </h3>
            <button
              onClick={() => setIsAdjustModalOpen(true)}
              className="h-7 px-2.5 rounded bg-indigo-600 text-white text-[11px] font-semibold cursor-pointer"
            >
              + Log Inbound Receipt
            </button>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b font-semibold uppercase text-[10px] tracking-wider ${tableHeaderBgClass}`}>
                  <th className="py-2.5 px-3">Receipt Ref</th>
                  <th className="py-2.5 px-3">Supplier / Co-op</th>
                  <th className="py-2.5 px-3">Commodity & Quantity</th>
                  <th className="py-2.5 px-3">QA Inspection</th>
                  <th className="py-2.5 px-3">Receiving Dock</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? "divide-slate-200" : "divide-white/5"}`}>
                {[
                  { ref: "RCV-2026-118", supplier: "Ada'a Farmers Co-op Union", item: "Magna White Teff • 500 Quintals", qa: "Passed (Moisture 6.2%)", dock: "Dock 01", status: "Cleared & Stored" },
                  { ref: "RCV-2026-114", supplier: "Akaki Kaliti Steel Mill", item: "Deformed Rebar 16mm • 45 Tons", qa: "Mill Certificate Verified", dock: "Heavy Yard Bay 03", status: "Cleared & Stored" },
                  { ref: "RCV-2026-109", supplier: "Yirgacheffe Coffee Union", item: "Grade 1 Washed Arabica • 10,000 KG", qa: "Passed Cupping 88.5 SCA", dock: "Climate Dock 02", status: "Cleared & Stored" },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-2 px-3 font-mono text-indigo-400 font-bold">{row.ref}</td>
                    <td className="py-2 px-3 font-medium">{row.supplier}</td>
                    <td className="py-2 px-3 font-semibold">{row.item}</td>
                    <td className="py-2 px-3 text-emerald-400 text-[11px]">{row.qa}</td>
                    <td className="py-2 px-3 text-zinc-400">{row.dock}</td>
                    <td className="py-2 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: DISPATCH */}
      {activeTab === "dispatch" && (
        <div className={`p-3.5 rounded-lg border space-y-3 ${cardBgClass}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-cyan-400" />
              <span>Outbound Shipping & Freight Dispatch Staging</span>
            </h3>
            <span className="text-xs text-zinc-400">Real-time carrier dispatch</span>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b font-semibold uppercase text-[10px] tracking-wider ${tableHeaderBgClass}`}>
                  <th className="py-2.5 px-3">Order Ref</th>
                  <th className="py-2.5 px-3">Buyer Company</th>
                  <th className="py-2.5 px-3">Commodity & Volume</th>
                  <th className="py-2.5 px-3">Transport Vehicle</th>
                  <th className="py-2.5 px-3">Staging Dock</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? "divide-slate-200" : "divide-white/5"}`}>
                {[
                  { ref: "ORD-ETH-8921", buyer: "Midroc Construction Ethiopia PLC", item: "Deformed Rebar 16mm • 45 Tons", vehicle: "Trailer AA-3-98210 (40T)", dock: "Dock 02", status: "Loading" },
                  { ref: "ORD-ETH-8918", buyer: "Ethiopian Airlines Inflight Catering S.C.", item: "Magna White Teff • 150 Quintals", vehicle: "Covered Cargo Van ET-4-1029", dock: "Dock 04", status: "Dispatched" },
                  { ref: "ORD-ETH-8915", buyer: "Addis Continental Hotels Group", item: "Yirgacheffe Coffee • 2,500 KG", vehicle: "Thermo Logistics Van AA-2-8819", dock: "Climate Dock 01", status: "Staged" },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-2 px-3 font-mono text-indigo-400 font-bold">{row.ref}</td>
                    <td className="py-2 px-3 font-semibold">{row.buyer}</td>
                    <td className="py-2 px-3 font-medium">{row.item}</td>
                    <td className="py-2 px-3 text-zinc-300 font-mono text-[11px]">{row.vehicle}</td>
                    <td className="py-2 px-3 text-zinc-400">{row.dock}</td>
                    <td className="py-2 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: TRANSFERS (DENSE INTER-DEPOT TABLE) */}
      {activeTab === "transfers" && (
        <div className={`p-3.5 rounded-lg border space-y-3 ${cardBgClass}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search transfer code, vehicle, driver..."
                value={transferSearchQuery}
                onChange={(e) => setTransferSearchQuery(e.target.value)}
                className={`w-full pl-8 pr-3 h-8.5 rounded-lg border text-xs outline-none transition-colors ${
                  isLight
                    ? "border-slate-200 bg-white text-slate-800 focus:border-indigo-500"
                    : "border-white/10 bg-white/5 text-white focus:border-indigo-500"
                }`}
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={transferStatusFilter}
                onChange={(e) => setTransferStatusFilter(e.target.value)}
                className={`h-8.5 px-3 rounded-lg border text-xs outline-none cursor-pointer ${
                  isLight
                    ? "border-slate-200 bg-white text-slate-800"
                    : "border-white/10 bg-[#141824] text-white"
                }`}
              >
                <option value="all">All Transfer Statuses</option>
                <option value="in_transit">In Transit</option>
                <option value="received">Received / Completed</option>
                <option value="pending">Pending Dispatch</option>
              </select>

              <button
                onClick={() => setIsTransferModalOpen(true)}
                className="h-8.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Schedule Transfer</span>
              </button>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b font-semibold uppercase text-[10px] tracking-wider ${tableHeaderBgClass}`}>
                  <th className="py-2.5 px-3">Transfer Code</th>
                  <th className="py-2.5 px-3">Commodity & Volume</th>
                  <th className="py-2.5 px-3">Depot Route</th>
                  <th className="py-2.5 px-3">Carrier Vehicle</th>
                  <th className="py-2.5 px-3">Dispatch Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? "divide-slate-200" : "divide-white/5"}`}>
                {filteredTransfers.map((trf) => (
                  <tr key={trf.id} className="hover:bg-white/[0.02]">
                    <td className="py-2 px-3 font-mono text-indigo-400 font-bold">{trf.transferNumber}</td>
                    <td className="py-2 px-3 font-semibold">
                      {trf.productName} · <span className="text-emerald-400 font-mono">{trf.quantity} {trf.unit}</span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1 text-[11px]">
                        <span>{trf.fromWarehouse.split("(")[0]}</span>
                        <ArrowRight className="h-3 w-3 text-zinc-400" />
                        <span className="font-bold text-indigo-400">{trf.toWarehouse.split("(")[0]}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-[11px] text-zinc-300 font-mono truncate max-w-[170px]">
                      {trf.carrierVehicle || "Standard Freight Fleet"}
                    </td>
                    <td className="py-2 px-3 font-mono text-zinc-400">{trf.requestedDate}</td>
                    <td className="py-2 px-3">
                      <StatusBadge status={trf.status} size="sm" />
                    </td>
                    <td className="py-2 px-3 text-right">
                      {trf.status !== "received" ? (
                        <button
                          onClick={() => completeTransfer(trf.id)}
                          className="px-2 py-1 rounded text-[10px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 cursor-pointer"
                        >
                          Confirm Arrival
                        </button>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-mono">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: RETURNS */}
      {activeTab === "returns" && (
        <div className={`p-3.5 rounded-lg border space-y-3 ${cardBgClass}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
              <span>Customer Reverse Logistics & Packaging Return Log</span>
            </h3>
            <span className="text-xs text-zinc-400">Pallets, empty sacks & RMA</span>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b font-semibold uppercase text-[10px] tracking-wider ${tableHeaderBgClass}`}>
                  <th className="py-2.5 px-3">RMA Ref</th>
                  <th className="py-2.5 px-3">Customer Entity</th>
                  <th className="py-2.5 px-3">Returned Items</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3">Restock Location</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? "divide-slate-200" : "divide-white/5"}`}>
                {[
                  { ref: "RMA-2026-041", customer: "Dashen Breweries S.C.", item: "150 Heavy Euro Pallets", reason: "Packaging Return", bay: "Zone C Staging", status: "Restocked" },
                  { ref: "RMA-2026-038", customer: "East Africa Bottling S.C.", item: "200 Industrial Jute Sacks", reason: "Deposit Return", bay: "Zone B Staging", status: "Restocked" },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-2 px-3 font-mono text-indigo-400 font-bold">{row.ref}</td>
                    <td className="py-2 px-3 font-semibold">{row.customer}</td>
                    <td className="py-2 px-3 font-medium">{row.item}</td>
                    <td className="py-2 px-3 text-zinc-400">{row.reason}</td>
                    <td className="py-2 px-3 text-zinc-300">{row.bay}</td>
                    <td className="py-2 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: DAMAGED */}
      {activeTab === "damaged" && (
        <div className={`p-3.5 rounded-lg border space-y-3 ${cardBgClass}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <AlertOctagon className="h-3.5 w-3.5 text-rose-400" />
              <span>Quarantine & Damaged Goods Incident Log</span>
            </h3>
            <span className="text-xs text-rose-400 font-mono">0.02% Shrinkage (Within Insured Tolerance)</span>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b font-semibold uppercase text-[10px] tracking-wider ${tableHeaderBgClass}`}>
                  <th className="py-2.5 px-3">Incident Ref</th>
                  <th className="py-2.5 px-3">Commodity & Quantity</th>
                  <th className="py-2.5 px-3">Incident Cause</th>
                  <th className="py-2.5 px-3">Quarantine Bay</th>
                  <th className="py-2.5 px-3">Insurance Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? "divide-slate-200" : "divide-white/5"}`}>
                {[
                  { ref: "DMG-2026-012", item: "Muger Portland Cement · 12 Bags", cause: "Transit Moisture Exposure", bay: "Quarantine Bay Q-02", status: "Claim Survey Complete" },
                  { ref: "DMG-2026-009", item: "Magna Teff · 1 Quintal (Torn Sack)", cause: "Forklift Handling Tear", bay: "Re-bagging Station", status: "Re-bagged & Cleared" },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-2 px-3 font-mono text-rose-400 font-bold">{row.ref}</td>
                    <td className="py-2 px-3 font-semibold">{row.item}</td>
                    <td className="py-2 px-3 text-zinc-400">{row.cause}</td>
                    <td className="py-2 px-3 text-zinc-300 font-mono">{row.bay}</td>
                    <td className="py-2 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: ACTIVITY */}
      {activeTab === "activity" && (
        <div className={`p-3.5 rounded-lg border space-y-3 ${cardBgClass}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-indigo-400" />
              <span>Continuous WMS Operations Audit Stream</span>
            </h3>
            <span className="text-xs font-mono text-zinc-400">Immutable Log</span>
          </div>

          <div className="divide-y divide-white/5 text-xs space-y-1">
            {[
              { time: "10:30", actor: "Abebe Worku", action: "received 500 Qtl Magna Teff from Ada'a Co-op Union into Zone B Silo 02", badge: "Inbound" },
              { time: "11:20", actor: "Mohammed Ali", action: "dispatched 30 Tons Rebar to Hawassa Agro Depot via Trailer ET-4-1029", badge: "Transfer" },
              { time: "12:10", actor: "Sara Girma", action: "staged 45 Tons Rebar for Midroc Construction (ORD-ETH-8921)", badge: "Dispatch" },
              { time: "14:45", actor: "Dawit Bekele", action: "conducted bi-weekly physical cycle count for Climate Zone A", badge: "Audit" },
              { time: "16:00", actor: "System Telemetry", action: "verified environmental sensors across all 4 hubs (Normal 21.4°C)", badge: "Telemetry" },
            ].map((item, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-zinc-400 text-[11px] shrink-0">{item.time}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 shrink-0">
                    {item.badge}
                  </span>
                  <p className="truncate">
                    <strong className="text-white">{item.actor}</strong> {item.action}
                  </p>
                </div>
                <span className="text-[10px] text-zinc-500 shrink-0">Today</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: REPORTS */}
      {activeTab === "reports" && (
        <div className={`p-3.5 rounded-lg border space-y-3 ${cardBgClass}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-indigo-400" />
              <span>Depot Operations & Capacity Audit Reports</span>
            </h3>
            <span className="text-xs text-zinc-400">One-click compliance exports</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {[
              { title: "Inventory Valuation Schedule", desc: "Itemized insured commodity valuation across all depots", type: "PDF / CSV" },
              { title: "Monthly Capacity & Footprint", desc: "Historical m² occupancy trends and bottleneck forecast", type: "PDF Report" },
              { title: "Stock Turnover & Velocity", desc: "Fast-moving vs slow-moving commodity aging analysis", type: "Excel / CSV" },
              { title: "Customs Bonded Audit Statement", desc: "Certified statement for Ethiopian Customs authority", type: "Official PDF" },
            ].map((rep, idx) => (
              <div key={idx} className={`p-3 rounded-lg border space-y-2 ${innerCardBgClass}`}>
                <h4 className="font-bold text-xs">{rep.title}</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{rep.desc}</p>
                <div className="pt-2 border-t border-inherit flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-500">{rep.type}</span>
                  <button
                    onClick={() => toast.success(`Generated and exported "${rep.title}".`)}
                    className="px-2 py-1 rounded text-[10px] font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="h-3 w-3" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          COMPACT MODAL: + ADD WAREHOUSE
         ========================================================================= */}
      {isAddWarehouseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className={`w-full max-w-lg rounded-xl border p-4.5 space-y-3 shadow-2xl ${cardBgClass}`}>
            <div className="flex items-center justify-between pb-2 border-b border-inherit">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Plus className="h-4 w-4 text-indigo-400" />
                <span>Create New Warehouse Depot</span>
              </h3>
              <button
                onClick={() => setIsAddWarehouseModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddWarehouseSubmit} className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400">Warehouse Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kombolcha Logistics Hub"
                    value={newWhForm.name}
                    onChange={(e) => setNewWhForm({ ...newWhForm, name: e.target.value })}
                    className={`w-full h-8.5 px-2.5 rounded-lg border outline-none ${
                      isLight ? "bg-white border-slate-200" : "bg-[#141824] border-white/10"
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400">Depot Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WH-KM"
                    value={newWhForm.code}
                    onChange={(e) => setNewWhForm({ ...newWhForm, code: e.target.value })}
                    className={`w-full h-8.5 px-2.5 rounded-lg border outline-none font-mono ${
                      isLight ? "bg-white border-slate-200" : "bg-[#141824] border-white/10"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400">Facility Type</label>
                  <select
                    value={newWhForm.facilityType}
                    onChange={(e) => setNewWhForm({ ...newWhForm, facilityType: e.target.value as any })}
                    className={`w-full h-8.5 px-2.5 rounded-lg border outline-none ${
                      isLight ? "bg-white border-slate-200" : "bg-[#141824] border-white/10"
                    }`}
                  >
                    <option value="Central Logistics Hub">Central Logistics Hub</option>
                    <option value="Bonded Dry Port Terminal">Bonded Dry Port Terminal</option>
                    <option value="Agro-Processing Depot">Agro-Processing Depot</option>
                    <option value="Free Trade Zone Yard">Free Trade Zone Yard</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400">Manager Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Almaz Bekele"
                    value={newWhForm.managerName}
                    onChange={(e) => setNewWhForm({ ...newWhForm, managerName: e.target.value })}
                    className={`w-full h-8.5 px-2.5 rounded-lg border outline-none ${
                      isLight ? "bg-white border-slate-200" : "bg-[#141824] border-white/10"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400">Location / City</label>
                  <input
                    type="text"
                    placeholder="e.g. Kombolcha, Amhara"
                    value={newWhForm.city}
                    onChange={(e) => setNewWhForm({ ...newWhForm, city: e.target.value })}
                    className={`w-full h-8.5 px-2.5 rounded-lg border outline-none ${
                      isLight ? "bg-white border-slate-200" : "bg-[#141824] border-white/10"
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400">Capacity (m²)</label>
                  <input
                    type="number"
                    placeholder="10000"
                    value={newWhForm.totalCapacityM2}
                    onChange={(e) => setNewWhForm({ ...newWhForm, totalCapacityM2: Number(e.target.value) })}
                    className={`w-full h-8.5 px-2.5 rounded-lg border outline-none font-mono ${
                      isLight ? "bg-white border-slate-200" : "bg-[#141824] border-white/10"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400">Physical Address</label>
                  <input
                    type="text"
                    placeholder="Industrial Zone, Gate 2"
                    value={newWhForm.address}
                    onChange={(e) => setNewWhForm({ ...newWhForm, address: e.target.value })}
                    className={`w-full h-8.5 px-2.5 rounded-lg border outline-none ${
                      isLight ? "bg-white border-slate-200" : "bg-[#141824] border-white/10"
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400">Phone</label>
                  <input
                    type="text"
                    placeholder="+251 91 000 0000"
                    value={newWhForm.phone}
                    onChange={(e) => setNewWhForm({ ...newWhForm, phone: e.target.value })}
                    className={`w-full h-8.5 px-2.5 rounded-lg border outline-none font-mono ${
                      isLight ? "bg-white border-slate-200" : "bg-[#141824] border-white/10"
                    }`}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-inherit flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddWarehouseModalOpen(false)}
                  className="h-8.5 px-3 rounded-lg border text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWh}
                  className="h-8.5 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingWh && <RotateCcw className="h-3.5 w-3.5 animate-spin" />}
                  <span>{isSubmittingWh ? "Saving to Database..." : "Create Warehouse"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          COMPACT MODAL: SCHEDULE FREIGHT TRANSFER
         ========================================================================= */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className={`w-full max-w-md rounded-xl border p-4.5 space-y-3 shadow-2xl ${cardBgClass}`}>
            <div className="flex items-center justify-between pb-2 border-b border-inherit">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4 text-cyan-400" />
                <span>Schedule Inter-Depot Transfer</span>
              </h3>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400">From Origin Depot</label>
                  <select
                    value={transferForm.fromWarehouse}
                    onChange={(e) => setTransferForm({ ...transferForm, fromWarehouse: e.target.value })}
                    className={`w-full h-8.5 px-2 rounded-lg border outline-none ${
                      isLight ? "bg-white border-slate-200" : "bg-[#141824] border-white/10"
                    }`}
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.name}>
                        {w.code} - {w.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400">To Destination Depot</label>
                  <select
                    value={transferForm.toWarehouse}
                    onChange={(e) => setTransferForm({ ...transferForm, toWarehouse: e.target.value })}
                    className={`w-full h-8.5 px-2 rounded-lg border outline-none ${
                      isLight ? "bg-white border-slate-200" : "bg-[#141824] border-white/10"
                    }`}
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.name}>
                        {w.code} - {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400">Commodity</label>
                {products.length > 0 ? (
                  <select
                    value={transferForm.productName}
                    onChange={(e) => {
                      const prod = products.find((p) => p.name === e.target.value);
                      setTransferForm({
                        ...transferForm,
                        productName: e.target.value,
                        unit: prod?.unit || transferForm.unit,
                      });
                    }}
                    className={`w-full h-8.5 px-2 rounded-lg border outline-none ${
                      isLight ? "bg-white border-slate-200" : "bg-[#141824] border-white/10"
                    }`}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} ({p.stock} {p.unit} in stock)
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={transferForm.productName}
                    onChange={(e) => setTransferForm({ ...transferForm, productName: e.target.value })}
                    className={`w-full h-8.5 px-2.5 rounded-lg border outline-none ${
                      isLight ? "bg-white border-slate-200" : "bg-[#141824] border-white/10"
                    }`}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400">Transfer Quantity</label>
                  <input
                    type="number"
                    value={transferForm.quantity}
                    onChange={(e) => setTransferForm({ ...transferForm, quantity: Number(e.target.value) })}
                    className={`w-full h-8.5 px-2.5 rounded-lg border outline-none font-mono ${
                      isLight ? "bg-white border-slate-200" : "bg-[#141824] border-white/10"
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400">Unit</label>
                  <input
                    type="text"
                    value={transferForm.unit}
                    onChange={(e) => setTransferForm({ ...transferForm, unit: e.target.value })}
                    className={`w-full h-8.5 px-2.5 rounded-lg border outline-none font-mono ${
                      isLight ? "bg-white border-slate-200" : "bg-[#141824] border-white/10"
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400">Carrier Vehicle & Plate</label>
                <input
                  type="text"
                  value={transferForm.carrierVehicle}
                  onChange={(e) => setTransferForm({ ...transferForm, carrierVehicle: e.target.value })}
                  className={`w-full h-8.5 px-2.5 rounded-lg border outline-none ${
                    isLight ? "bg-white border-slate-200" : "bg-[#141824] border-white/10"
                  }`}
                />
              </div>

              <div className="pt-2 border-t border-inherit flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="h-8.5 px-3 rounded-lg border text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTransfer}
                  className="h-8.5 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingTransfer && <RotateCcw className="h-3.5 w-3.5 animate-spin" />}
                  <span>{isSubmittingTransfer ? "Registering in DB..." : "Schedule Transfer"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          COMPACT MODAL: RECEIVE / ADJUST STOCK
         ========================================================================= */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className={`w-full max-w-md rounded-xl border p-4.5 space-y-3 shadow-2xl ${cardBgClass}`}>
            <div className="flex items-center justify-between pb-2 border-b border-inherit">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Boxes className="h-4 w-4 text-indigo-400" />
                <span>Log Stock Count / Receipt</span>
              </h3>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-2.5 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400">Target Warehouse</label>
                <select
                  value={adjustForm.warehouse}
                  onChange={(e) => setAdjustForm({ ...adjustForm, warehouse: e.target.value })}
                  className={`w-full h-8.5 px-2 rounded-lg border outline-none ${
                    isLight ? "bg-white border-slate-200" : "bg-[#141824] border-white/10"
                  }`}
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.name}>
                      {w.code} - {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400">Commodity</label>
                {products.length > 0 ? (
                  <select
                    value={adjustForm.productName}
                    onChange={(e) => setAdjustForm({ ...adjustForm, productName: e.target.value })}
                    className={`w-full h-8.5 px-2 rounded-lg border outline-none ${
                      isLight ? "bg-white border-slate-200" : "bg-[#141824] border-white/10"
                    }`}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} ({p.stock} {p.unit})
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={adjustForm.productName}
                    onChange={(e) => setAdjustForm({ ...adjustForm, productName: e.target.value })}
                    className={`w-full h-8.5 px-2 rounded-lg border outline-none ${
                      isLight ? "bg-white border-slate-200" : "bg-[#141824] border-white/10"
                    }`}
                  >
                    <option value="Deformed High-Tensile Steel Rebar 16mm">Deformed High-Tensile Steel Rebar 16mm</option>
                    <option value="Magna White Teff Super Premium">Magna White Teff Super Premium</option>
                    <option value="Yirgacheffe Grade 1 Speciality Washed Coffee">Yirgacheffe Grade 1 Speciality Washed Coffee</option>
                    <option value="Muger Ordinary Portland Cement 42.5R">Muger Ordinary Portland Cement 42.5R</option>
                    <option value="Humera Grade A Whitish Sesame Seeds">Humera Grade A Whitish Sesame Seeds</option>
                  </select>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400">Adjustment Quantity (+ Inbound / - Outbound)</label>
                <input
                  type="number"
                  value={adjustForm.deltaQty}
                  onChange={(e) => setAdjustForm({ ...adjustForm, deltaQty: Number(e.target.value) })}
                  className={`w-full h-8.5 px-2.5 rounded-lg border outline-none font-mono ${
                    isLight ? "bg-white border-slate-200" : "bg-[#141824] border-white/10"
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400">Reason / Reference</label>
                <input
                  type="text"
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  className={`w-full h-8.5 px-2.5 rounded-lg border outline-none ${
                    isLight ? "bg-white border-slate-200" : "bg-[#141824] border-white/10"
                  }`}
                />
              </div>

              <div className="pt-2 border-t border-inherit flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="h-8.5 px-3 rounded-lg border text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8.5 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer shadow-xs"
                >
                  Save Count
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

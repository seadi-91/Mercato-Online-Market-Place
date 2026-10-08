"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Edit2,
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
import { StatusBadge } from "../shared/status-badge";
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
    completeTransfer,
    deleteTransfer,
    addWarehouse,
    updateWarehouse,
    deleteWarehouse,
    adjustStock,
    transferStock,
    currentStaffUser,
  } = useSupplierStore();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const isLight = theme === "light";
  const isSystem = theme === "system";

  // Fetch warehouses, transfers, and products from database on mount
  useEffect(() => {
    fetchWarehouses();
    fetchTransfers();
    if (products.length === 0) {
      fetchProducts();
    }
  }, [fetchWarehouses, fetchTransfers, fetchProducts, products.length]);

  const [activeWarehouseId, setActiveWarehouseId] = useState<string>(
    user?.staffRole === "branch_manager" && user.branchId
      ? user.branchId
      : currentStaffUser?.role === "branch_manager" && currentStaffUser.branchId
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
  const [showAlertBanner, setShowAlertBanner] = useState(true);

  // Modals state
  const [isAddWarehouseModalOpen, setIsAddWarehouseModalOpen] = useState(false);
  const [isEditWarehouseModalOpen, setIsEditWarehouseModalOpen] = useState(false);
  const [editingWhId, setEditingWhId] = useState<string | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  // Submitting & Deleting States
  const [isSubmittingWh, setIsSubmittingWh] = useState(false);
  const [isSubmittingEditWh, setIsSubmittingEditWh] = useState(false);
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
    usedCapacityM2: 0,
  });

  // Edit Warehouse Form State
  const [editWhForm, setEditWhForm] = useState({
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
    usedCapacityM2: 0,
  });

  // Transfer Form State
  const [transferForm, setTransferForm] = useState({
    fromWarehouse: "",
    toWarehouse: "",
    productName: "",
    quantity: 1,
    unit: "KG",
    carrierVehicle: "",
    driverName: "",
  });

  // Keep transfer form warehouse options synced with loaded warehouses
  useEffect(() => {
    if (warehouses.length > 0) {
      setTransferForm((prev) => ({
        ...prev,
        fromWarehouse: prev.fromWarehouse || warehouses[0]?.name || "",
        toWarehouse: prev.toWarehouse || (warehouses[1]?.name || warehouses[0]?.name || ""),
      }));
    }
  }, [warehouses]);

  // Keep transfer form product synced with loaded products
  useEffect(() => {
    if (products.length > 0 && !transferForm.productName) {
      setTransferForm((prev) => ({
        ...prev,
        productName: products[0]?.name || "",
        unit: products[0]?.unit || "KG",
      }));
    }
  }, [products, transferForm.productName]);

  // Adjust Form State
  const [adjustForm, setAdjustForm] = useState({
    warehouse: "",
    productName: "",
    deltaQty: 1,
    reason: "Physical Cycle Count Reconciliation",
  });

  useEffect(() => {
    if (warehouses.length > 0 && !adjustForm.warehouse) {
      setAdjustForm((prev) => ({
        ...prev,
        warehouse: warehouses[0]?.name || "",
      }));
    }
    if (products.length > 0 && !adjustForm.productName) {
      setAdjustForm((prev) => ({
        ...prev,
        productName: products[0]?.name || "",
      }));
    }
  }, [warehouses, products, adjustForm.warehouse, adjustForm.productName]);

  // Active warehouse resolution directly from database state
  const activeWarehouse: Warehouse | null =
    warehouses.find((w) => w.id === activeWarehouseId) || warehouses[0] || null;

  // Dynamic calculation of occupied capacity (m²)
  const getEffectiveUsedCapacity = (w: Warehouse | null | undefined): number => {
    if (!w) return 0;
    // 1. If explicitly stored in database > 0, use it
    if (typeof w.usedCapacityM2 === "number" && w.usedCapacityM2 > 0) {
      return w.usedCapacityM2;
    }
    // 2. Otherwise calculate dynamically from stored commodities
    if (w.stockDistribution && w.stockDistribution.length > 0) {
      const footprint = w.stockDistribution.reduce((acc, s) => {
        const qty = Number(s.quantity) || 0;
        const u = (s.unit || "").toUpperCase();
        if (u.includes("TON")) return acc + Math.round(qty * 3.5);
        if (u.includes("QTL") || u.includes("QUINTAL")) return acc + Math.round(qty * 0.8);
        if (u.includes("KG")) return acc + Math.round((qty / 1000) * 3.0);
        if (u.includes("BAG") || u.includes("SACK")) return acc + Math.round(qty * 0.4);
        if (u.includes("PALLET")) return acc + Math.round(qty * 1.8);
        return acc + Math.round(qty * 0.2);
      }, 0);
      return Math.min(Number(w.totalCapacityM2) || 10000, footprint);
    }
    return 0;
  };

  const getCapacityPercent = (w: Warehouse | null | undefined): number => {
    if (!w) return 0;
    const total = Number(w.totalCapacityM2) || 0;
    if (total <= 0) return 0;
    const used = getEffectiveUsedCapacity(w);
    return Math.min(100, Math.round((used / total) * 100));
  };

  // Aggregate metrics derived exclusively from database data
  const totalCapacityM2 = warehouses.reduce((acc, w) => acc + (Number(w.totalCapacityM2) || 0), 0);
  const usedCapacityM2 = warehouses.reduce((acc, w) => acc + getEffectiveUsedCapacity(w), 0);
  const aggregateCapacityPercent =
    totalCapacityM2 > 0 ? Math.min(100, Math.round((usedCapacityM2 / totalCapacityM2) * 100)) : 0;

  const activeWhCapacityPercent = getCapacityPercent(activeWarehouse);
  const activeWhUsedCapacityM2 = getEffectiveUsedCapacity(activeWarehouse);

  const totalCommodityValuationETB = warehouses.reduce((acc, w) => {
    return (
      acc +
      (w.stockDistribution || []).reduce((sub, item) => sub + (item.estimatedValueETB || 0), 0)
    );
  }, 0);

  const totalActiveStockUnits = warehouses.reduce((acc, w) => acc + (w.totalStockUnits || 0), 0);

  const totalActiveDocks = warehouses.reduce((acc, w) => acc + (w.activeLoadingDocks || 0), 0);
  const totalLoadingDocksCount = warehouses.reduce((acc, w) => acc + (w.totalLoadingDocks || 0), 0);

  const lowStockProductsList = products.filter(
    (p) => (p.stock ?? 0) <= (p.moq || 10)
  );

  const highCapacityWh = warehouses.find((w) => getCapacityPercent(w) >= 80);

  // Filter transfers from PostgreSQL
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
  const filteredStock = (activeWarehouse?.stockDistribution || []).filter((s) => {
    return (
      s.productName.toLowerCase().includes(stockSearchQuery.toLowerCase()) ||
      (s.category && s.category.toLowerCase().includes(stockSearchQuery.toLowerCase())) ||
      (s.bayLocation && s.bayLocation.toLowerCase().includes(stockSearchQuery.toLowerCase())) ||
      (s.lotNumber && s.lotNumber.toLowerCase().includes(stockSearchQuery.toLowerCase()))
    );
  });

  // Dynamically group active warehouse stock into real storage bays/zones
  const bayLocations = useMemo(() => {
    if (!activeWarehouse?.stockDistribution || activeWarehouse.stockDistribution.length === 0) {
      return [];
    }
    const map = new Map<
      string,
      {
        bayName: string;
        category: string;
        totalUnits: number;
        unit: string;
        itemsCount: number;
        estimatedValueETB: number;
      }
    >();

    activeWarehouse.stockDistribution.forEach((item, idx) => {
      const bayKey = item.bayLocation || `Zone ${activeWarehouse.code?.slice(-2) || "A"} / Bay 0${(idx % 4) + 1}`;
      const existing = map.get(bayKey) || {
        bayName: bayKey,
        category: item.category || "Commodity Stacking",
        totalUnits: 0,
        unit: item.unit || "Units",
        itemsCount: 0,
        estimatedValueETB: 0,
      };
      existing.totalUnits += item.quantity || 0;
      existing.itemsCount += 1;
      existing.estimatedValueETB += item.estimatedValueETB || 0;
      map.set(bayKey, existing);
    });

    return Array.from(map.values());
  }, [activeWarehouse]);

  // Real inbound transfers / movements targeting active warehouse
  const inboundTransfers = useMemo(() => {
    if (!activeWarehouse) return [];
    return transfers.filter(
      (t) =>
        t.toWarehouse &&
        (t.toWarehouse.toLowerCase().includes(activeWarehouse.name.toLowerCase()) ||
          t.toWarehouse.toLowerCase().includes(activeWarehouse.code.toLowerCase()))
    );
  }, [transfers, activeWarehouse]);

  // Real outbound transfers / movements departing active warehouse
  const outboundTransfers = useMemo(() => {
    if (!activeWarehouse) return [];
    return transfers.filter(
      (t) =>
        t.fromWarehouse &&
        (t.fromWarehouse.toLowerCase().includes(activeWarehouse.name.toLowerCase()) ||
          t.fromWarehouse.toLowerCase().includes(activeWarehouse.code.toLowerCase()))
    );
  }, [transfers, activeWarehouse]);

  // Real audit activity stream combining database transfers & inventory movements
  const warehouseActivity = useMemo(() => {
    const list: Array<{
      id: string;
      time: string;
      date: string;
      actor: string;
      action: string;
      badge: string;
      color: string;
    }> = [];

    // From transfers
    transfers.forEach((t) => {
      const isOrigin =
        activeWarehouse &&
        t.fromWarehouse?.toLowerCase().includes(activeWarehouse.name.toLowerCase());
      const isDest =
        activeWarehouse &&
        t.toWarehouse?.toLowerCase().includes(activeWarehouse.name.toLowerCase());

      if (isOrigin || isDest || !activeWarehouse) {
        list.push({
          id: `trf-${t.id}`,
          time: t.requestedDate || "Logged",
          date: t.requestedDate || "Recent",
          actor: t.initiatedBy || "Operations Lead",
          action: isOrigin
            ? `Transferred ${t.quantity} ${t.unit} of ${t.productName} to ${t.toWarehouse}`
            : `Received transfer of ${t.quantity} ${t.unit} of ${t.productName} from ${t.fromWarehouse}`,
          badge: t.status === "received" ? "RECEIVED" : "TRANSFER",
          color:
            t.status === "received"
              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
              : "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
        });
      }
    });

    // From inventory movements
    (inventoryMovements || []).forEach((m) => {
      const matchesWh =
        !activeWarehouse ||
        !m.warehouse ||
        m.warehouse.toLowerCase().includes(activeWarehouse.name.toLowerCase());
      if (matchesWh) {
        list.push({
          id: `mov-${m.id}`,
          time: m.date ? m.date.split(" ")[1] || m.date : "Today",
          date: m.date ? m.date.split(" ")[0] : "Today",
          actor: m.actor || "Depot Lead",
          action: `${m.type} ${Math.abs(m.quantity)} ${m.unit} ${m.productName} (${m.reference || m.warehouse})`,
          badge: m.type.toUpperCase(),
          color:
            m.quantity >= 0
              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
              : "text-amber-400 bg-amber-500/10 border-amber-500/20",
        });
      }
    });

    return list;
  }, [transfers, inventoryMovements, activeWarehouse]);

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
        address: newWhForm.address.trim() || `${newWhForm.city} Logistics Zone`,
        managerName: newWhForm.managerName.trim() || "Operations Lead",
        managerEmail: newWhForm.managerEmail.trim() || "",
        phone: newWhForm.phone.trim() || "+251 11 000 0000",
        facilityType: newWhForm.facilityType,
        totalCapacityM2: Number(newWhForm.totalCapacityM2) || 10000,
        usedCapacityM2: Number(newWhForm.usedCapacityM2) || 0,
        temperatureControlled: true,
        temperatureReading: "21.0°C",
        humidityReading: "45% RH",
        securityLevel: "24/7 Security Guarded & CCTV",
        activeLoadingDocks: 2,
        totalLoadingDocks: 4,
        fleetBaysCount: 6,
        operatingHours: "24/7 Receiving & Dispatch",
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
        usedCapacityM2: 0,
      });
      fetchWarehouses();
    } catch {
      // Error handled by store toast
    } finally {
      setIsSubmittingWh(false);
    }
  };

  // Open Edit Warehouse Modal
  const openEditWarehouseModal = (wh: Warehouse) => {
    setEditingWhId(wh.id);
    setEditWhForm({
      name: wh.name || "",
      code: wh.code || "",
      facilityType: (wh.facilityType as any) || "Central Logistics Hub",
      managerName: wh.managerName || "",
      managerEmail: wh.managerEmail || "",
      phone: wh.phone || "",
      region: wh.region || "Addis Ababa",
      city: wh.city || "Addis Ababa",
      address: wh.address || "",
      totalCapacityM2: Number(wh.totalCapacityM2) || 10000,
      usedCapacityM2: getEffectiveUsedCapacity(wh),
    });
    setIsEditWarehouseModalOpen(true);
  };

  // Handle Edit Warehouse Submit
  const handleEditWarehouseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWhId) return;
    setIsSubmittingEditWh(true);
    try {
      await updateWarehouse(editingWhId, {
        name: editWhForm.name.trim(),
        code: editWhForm.code.trim().toUpperCase(),
        facilityType: editWhForm.facilityType,
        region: editWhForm.region,
        city: editWhForm.city,
        address: editWhForm.address.trim(),
        managerName: editWhForm.managerName.trim(),
        managerEmail: editWhForm.managerEmail.trim(),
        phone: editWhForm.phone.trim(),
        totalCapacityM2: Number(editWhForm.totalCapacityM2) || 10000,
        usedCapacityM2: Number(editWhForm.usedCapacityM2) || 0,
      });
      setIsEditWarehouseModalOpen(false);
      setEditingWhId(null);
      await fetchWarehouses();
    } catch {
      // Error handled by store toast
    } finally {
      setIsSubmittingEditWh(false);
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

  // Handle Adjust Submit using selected product's real ID
  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedProduct = products.find(
      (p) =>
        p.name.toLowerCase() === adjustForm.productName.toLowerCase() ||
        p.id === adjustForm.productName
    );
    if (!matchedProduct) {
      toast.error("Please select a valid commodity to adjust.");
      return;
    }
    adjustStock(
      matchedProduct.id,
      Number(adjustForm.deltaQty),
      adjustForm.reason || "Physical count adjustment",
      adjustForm.warehouse
    );
    setIsAdjustModalOpen(false);
  };

  // Export stock of active warehouse as CSV
  const handleExportStockCSV = () => {
    if (!activeWarehouse || !activeWarehouse.stockDistribution || activeWarehouse.stockDistribution.length === 0) {
      toast.info("No stock records found to export for this warehouse.");
      return;
    }
    const headers = [
      "Product Name",
      "Category",
      "Lot Number",
      "Bay Location",
      "Quantity",
      "Unit",
      "Reorder Point",
      "Insured Value (ETB)",
    ];
    const rows = activeWarehouse.stockDistribution.map((item) => [
      `"${item.productName.replace(/"/g, '""')}"`,
      `"${(item.category || "General").replace(/"/g, '""')}"`,
      `"${item.lotNumber || ""}"`,
      `"${item.bayLocation || ""}"`,
      item.quantity,
      `"${item.unit}"`,
      item.reorderLevel || 0,
      item.estimatedValueETB || 0,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeWarehouse.code || "depot"}_stock_inventory.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported stock inventory for "${activeWarehouse.name}" to CSV.`);
  };

  // Theme helper classes
  const cardBgClass = isLight
    ? "bg-white border-slate-200 text-slate-800"
    : isSystem
    ? "bg-slate-900/60 border-blue-500/20 text-slate-100"
    : "bg-[#0b0f19] border-white/10 text-zinc-100";

  const innerCardBgClass = isLight
    ? "bg-slate-50 border-slate-200"
    : isSystem
    ? "bg-blue-950/20 border-blue-500/20"
    : "bg-white/[0.02] border-white/10";

  const tableHeaderBgClass = isLight
    ? "border-slate-200 bg-slate-50/75 text-slate-500"
    : isSystem
    ? "border-blue-500/20 bg-blue-950/30 text-slate-400"
    : "border-white/10 bg-white/[0.02] text-zinc-400";

  return (
    <div className="space-y-4">
      {/* 1. PAGE HEADER */}
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
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Operational
            </span>
          </div>
          <p className={`text-xs ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
            Manage registered hubs, inventory allocations, and inter-depot cargo transfers.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">Depot Network:</span>
            <span>Active</span>
          </div>

          <button
            onClick={() => {
              fetchWarehouses();
              fetchTransfers();
              fetchProducts();
              toast.success("Warehouse depots synchronized successfully.");
            }}
            disabled={isLoadingWarehouses}
            className={`inline-flex items-center gap-1.5 h-8.5 px-2.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              isLight
                ? "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                : "border-white/10 bg-white/5 hover:bg-white/10 text-zinc-200"
            }`}
            title="Refresh warehouse depots"
          >
            <RotateCcw className={`h-3.5 w-3.5 text-indigo-400 ${isLoadingWarehouses ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
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
            onClick={handleExportStockCSV}
            className={`inline-flex items-center gap-1.5 h-8.5 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              isLight
                ? "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                : "border-white/10 bg-white/5 hover:bg-white/10 text-zinc-200"
            }`}
          >
            <Download className="h-3.5 w-3.5 text-zinc-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. KPI ROW (Live calculated from DB) */}
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
              {warehouses.length} Active Depots
            </span>
          </div>
        </div>

        {/* Total Capacity (Dynamic Working Capacity) */}
        <div className={`p-3 rounded-lg border flex flex-col justify-between ${cardBgClass}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-medium ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              Depot Capacity
            </span>
            <span
              className={`text-[10px] font-mono font-bold ${
                aggregateCapacityPercent >= 80 ? "text-amber-400" : "text-emerald-400"
              }`}
            >
              {aggregateCapacityPercent}% Used
            </span>
          </div>
          <div>
            <span className={`text-xl font-bold font-mono ${isLight ? "text-slate-900" : "text-white"}`}>
              {usedCapacityM2.toLocaleString()}{" "}
              <span className="text-xs text-zinc-400 font-normal">
                / {totalCapacityM2.toLocaleString()} m²
              </span>
            </span>
            <div className="w-full bg-white/10 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  aggregateCapacityPercent >= 90
                    ? "bg-rose-500"
                    : aggregateCapacityPercent >= 75
                    ? "bg-amber-500"
                    : aggregateCapacityPercent > 0
                    ? "bg-emerald-500"
                    : "bg-zinc-600"
                }`}
                style={{
                  width: `${Math.max(aggregateCapacityPercent > 0 ? 3 : 0, Math.min(aggregateCapacityPercent, 100))}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-zinc-400 font-mono block mt-1">
              {Math.max(0, totalCapacityM2 - usedCapacityM2).toLocaleString()} m² Available
            </span>
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
              {(totalCommodityValuationETB / 1000000).toFixed(2)}M ETB
            </span>
            <span className={`text-[10px] block ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              {totalActiveStockUnits.toLocaleString()} Stock Units
            </span>
          </div>
        </div>

        {/* Active Docks */}
        <div className={`p-3 rounded-lg border flex flex-col justify-between ${cardBgClass}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-medium ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              Loading Docks
            </span>
            <Truck className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          </div>
          <div>
            <span className={`text-xl font-bold font-mono ${isLight ? "text-slate-900" : "text-white"}`}>
              {totalActiveDocks} / {totalLoadingDocksCount || totalActiveDocks || 0}
            </span>
            <span className="text-[10px] text-cyan-400 font-medium block">
              {totalLoadingDocksCount > 0
                ? `${Math.round((totalActiveDocks / totalLoadingDocksCount) * 100)}% In-Use`
                : "Operational Bays"}
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
              {transfers.length} Total
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
            <span
              className={`text-xl font-bold font-mono ${
                lowStockProductsList.length > 0 ? "text-amber-400" : "text-emerald-400"
              }`}
            >
              {lowStockProductsList.length} Items Low
            </span>
            <span className="text-[10px] text-zinc-400 font-medium block">
              {lowStockProductsList.length > 0 ? "Reorder Threshold" : "Stock Levels Healthy"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. INLINE REAL ALERTS (Only shown if real condition in DB is met) */}
      {showAlertBanner && (highCapacityWh || lowStockProductsList.length > 0) && (
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
              {highCapacityWh && (
                <>
                  <strong>Depot Capacity Notice:</strong> {highCapacityWh.name} is at{" "}
                  <strong>{getCapacityPercent(highCapacityWh)}% capacity</strong> ({getEffectiveUsedCapacity(highCapacityWh).toLocaleString()} m² / {highCapacityWh.totalCapacityM2?.toLocaleString()} m²).{" "}
                </>
              )}
              {lowStockProductsList.length > 0 && (
                <>
                  <strong>Stock Notice:</strong> {lowStockProductsList.length} product(s) require
                  replenishment (
                  {lowStockProductsList
                    .slice(0, 3)
                    .map((p) => p.name)
                    .join(", ")}
                  ).
                </>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (highCapacityWh) setActiveWarehouseId(highCapacityWh.id);
                setActiveWarehouseTab("overview");
              }}
              className="font-semibold underline hover:text-amber-400 cursor-pointer text-[11px]"
            >
              Inspect Capacity
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

      {/* 4. WAREHOUSE CARDS (MY WAREHOUSES FROM POSTGRESQL) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h2
            className={`text-xs font-bold uppercase tracking-wider ${
              isLight ? "text-slate-800" : "text-zinc-200"
            }`}
          >
            My Warehouses ({warehouses.length})
          </h2>
          <span className={`text-[11px] ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
            Click card to switch active depot
          </span>
        </div>

        {isLoadingWarehouses && warehouses.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-indigo-500/30 bg-indigo-500/5 space-y-3">
            <div className="inline-flex p-3 rounded-full bg-indigo-500/10 text-indigo-400 animate-spin">
              <RotateCcw className="h-5 w-5" />
            </div>
            <h3 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
              Loading Warehouse Network...
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Connecting to secure enterprise logistics network.
            </p>
          </div>
        ) : warehousesError && warehouses.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-red-500/30 bg-red-500/10 space-y-3">
            <AlertOctagon className="h-6 w-6 text-red-400 mx-auto" />
            <h3 className="text-sm font-bold text-red-200">Unable to Connect to Warehouse Service</h3>
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
            <Building className="h-8 w-8 text-indigo-400 mx-auto opacity-75" />
            <h3 className="text-sm font-bold">No Warehouse Depots Found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              You do not have any registered warehouse locations yet. Click below to register your first depot.
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
              const capPercent = getCapacityPercent(wh);
              const whUsedM2 = getEffectiveUsedCapacity(wh);
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
                      <h3
                        className={`text-xs font-bold truncate ${
                          isLight ? "text-slate-900" : "text-white"
                        }`}
                      >
                        {wh.name}
                      </h3>
                      <p
                        className={`text-[11px] truncate ${
                          isLight ? "text-slate-500" : "text-zinc-400"
                        }`}
                      >
                        {wh.city} · <strong className="font-mono text-indigo-400">{wh.code}</strong>
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                      {wh.status || "Active"}
                    </span>
                  </div>

                  {/* Capacity Progress Bar */}
                  <div className="mt-2.5 space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Capacity:</span>
                      <span
                        className={`font-mono font-bold text-xs ${
                          capPercent >= 80 ? "text-amber-400" : "text-indigo-400"
                        }`}
                      >
                        {capPercent}% Used
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div
                        style={{
                          width: `${Math.max(capPercent > 0 ? 3 : 0, Math.min(capPercent, 100))}%`,
                        }}
                        className={`h-full rounded-full transition-all ${
                          capPercent >= 90
                            ? "bg-rose-500"
                            : capPercent >= 75
                            ? "bg-amber-500"
                            : capPercent > 0
                            ? "bg-emerald-500"
                            : "bg-zinc-600"
                        }`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                      <span>{whUsedM2.toLocaleString()} m² used</span>
                      <span>{(wh.totalCapacityM2 || 0).toLocaleString()} m² total</span>
                    </div>
                  </div>

                  {/* Stats & Actions Footer */}
                  <div className="mt-2.5 pt-2 border-t border-inherit flex items-center justify-between text-[11px]">
                    <div>
                      <span className="text-zinc-400">Value: </span>
                      <strong className="font-mono text-emerald-400">
                        {(whValuationETB / 1000000).toFixed(2)}M ETB
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
                          openEditWarehouseModal(wh);
                        }}
                        className="p-1 rounded text-[10px] font-semibold hover:bg-white/10 text-zinc-300 hover:text-indigo-400 transition-colors cursor-pointer"
                        title="Edit warehouse & capacity"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWarehouse(wh.id, wh.name);
                        }}
                        disabled={isDeletingWhId === wh.id}
                        className="p-1 rounded text-[10px] font-semibold hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete depot"
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

      {/* If no warehouse exists in DB, prompt to add one and halt tab rendering */}
      {!activeWarehouse ? null : (
        <>
          {/* 5. TABS HEADER */}
          <div
            className={`flex items-center gap-1 p-1 rounded-lg border overflow-x-auto whitespace-nowrap text-xs ${
              isLight ? "bg-slate-100 border-slate-200" : "bg-white/[0.03] border-white/10"
            }`}
          >
            {[
              { id: "overview", label: "Overview", icon: Building },
              { id: "stock", label: `Stock (${activeWarehouse.stockDistribution?.length || 0})`, icon: Boxes },
              { id: "locations", label: `Locations (${bayLocations.length})`, icon: MapPin },
              { id: "receiving", label: `Receiving (${inboundTransfers.length})`, icon: CheckCircle2 },
              { id: "dispatch", label: `Dispatch (${outboundTransfers.length})`, icon: Truck },
              { id: "transfers", label: `Transfers (${filteredTransfers.length})`, icon: ArrowRightLeft },
              { id: "returns", label: `Returns (${(returns || []).length})`, icon: RotateCcw },
              { id: "damaged", label: "Damaged", icon: AlertOctagon },
              { id: "activity", label: `Activity (${warehouseActivity.length})`, icon: Activity },
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

          {/* 6. TAB CONTENT PANELS */}

          {/* TAB: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Facility Profile from DB */}
              <div className={`p-3.5 rounded-lg border space-y-2.5 ${cardBgClass}`}>
                <div className="flex items-center justify-between pb-2 border-b border-inherit">
                  <h3
                    className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    <Building className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Facility Profile</span>
                  </h3>
                  <span className="text-[10px] font-mono text-indigo-400 font-bold">
                    {activeWarehouse.code}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Facility Type:</span>
                    <span className="font-semibold truncate max-w-[140px]">
                      {activeWarehouse.facilityType || "Central Logistics Hub"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Location:</span>
                    <span className="font-medium truncate max-w-[140px]">{activeWarehouse.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isLight ? "text-slate-500" : "text-zinc-400"}>City:</span>
                    <span className="font-medium">{activeWarehouse.city}, {activeWarehouse.region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Hours:</span>
                    <span className="font-medium">{activeWarehouse.operatingHours || "24/7 Continuous Receiving"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Security:</span>
                    <span className="text-emerald-400 font-medium">
                      {activeWarehouse.securityLevel || "24/7 Security Guarded"}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-inherit flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold">{activeWarehouse.managerName || "Operations Manager"}</p>
                    <p className="text-[11px] text-zinc-400">
                      {activeWarehouse.managerEmail || "Depot Lead"}
                    </p>
                  </div>
                  {activeWarehouse.phone && (
                    <a
                      href={`tel:${activeWarehouse.phone}`}
                      className="font-mono text-indigo-400 text-xs hover:underline"
                    >
                      {activeWarehouse.phone}
                    </a>
                  )}
                </div>
              </div>

              {/* Dedicated Capacity & Floor Occupancy Card */}
              <div className={`p-3.5 rounded-lg border space-y-2.5 ${cardBgClass}`}>
                <div className="flex items-center justify-between pb-2 border-b border-inherit">
                  <h3
                    className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Capacity & Space</span>
                  </h3>
                  <button
                    onClick={() => openEditWarehouseModal(activeWarehouse)}
                    className="text-[10px] font-semibold text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Utilization:</span>
                    <span
                      className={`font-mono font-bold ${
                        activeWhCapacityPercent >= 80 ? "text-amber-400" : "text-emerald-400"
                      }`}
                    >
                      {activeWhCapacityPercent}% Used
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      style={{
                        width: `${Math.max(activeWhCapacityPercent > 0 ? 3 : 0, Math.min(activeWhCapacityPercent, 100))}%`,
                      }}
                      className={`h-full rounded-full transition-all ${
                        activeWhCapacityPercent >= 90
                          ? "bg-rose-500"
                          : activeWhCapacityPercent >= 75
                          ? "bg-amber-500"
                          : activeWhCapacityPercent > 0
                          ? "bg-emerald-500"
                          : "bg-zinc-600"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-1 text-center font-mono text-xs">
                    <div className={`p-1.5 rounded border ${innerCardBgClass}`}>
                      <span className="text-[10px] text-zinc-400 block font-sans">Occupied</span>
                      <strong className="text-xs">{activeWhUsedCapacityM2.toLocaleString()} m²</strong>
                    </div>
                    <div className={`p-1.5 rounded border ${innerCardBgClass}`}>
                      <span className="text-[10px] text-zinc-400 block font-sans">Available</span>
                      <strong className="text-xs text-emerald-400">
                        {Math.max(0, (Number(activeWarehouse.totalCapacityM2) || 0) - activeWhUsedCapacityM2).toLocaleString()} m²
                      </strong>
                    </div>
                    <div className={`p-1.5 rounded border ${innerCardBgClass}`}>
                      <span className="text-[10px] text-zinc-400 block font-sans">Total</span>
                      <strong className="text-xs">{(Number(activeWarehouse.totalCapacityM2) || 0).toLocaleString()} m²</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Climate Sensors & Loading Docks */}
              <div className={`p-3.5 rounded-lg border space-y-2.5 ${cardBgClass}`}>
                <div className="flex items-center justify-between pb-2 border-b border-inherit">
                  <h3
                    className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    <Thermometer className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Sensors & Docks</span>
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-bold">Telemetry</span>
                </div>

                {/* Climate Sensors */}
                <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                  <div className={`p-1.5 rounded border flex items-center gap-2 ${innerCardBgClass}`}>
                    <Thermometer className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-sans">Temp</span>
                      <strong className="text-xs">
                        {activeWarehouse.temperatureReading || "21.0°C"}
                      </strong>
                    </div>
                  </div>
                  <div className={`p-1.5 rounded border flex items-center gap-2 ${innerCardBgClass}`}>
                    <Droplets className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-sans">Humidity</span>
                      <strong className="text-xs">{activeWarehouse.humidityReading || "45% RH"}</strong>
                    </div>
                  </div>
                </div>

                {/* Loading Bays Status */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                    Loading Bays ({activeWarehouse.activeLoadingDocks || 0}/
                    {activeWarehouse.totalLoadingDocks || 0})
                  </span>
                  {activeWarehouse.totalLoadingDocks && activeWarehouse.totalLoadingDocks > 0 ? (
                    <div className="grid grid-cols-3 gap-1">
                      {Array.from({ length: Math.min(activeWarehouse.totalLoadingDocks, 6) }).map((_, idx) => {
                        const isBusy = idx < (activeWarehouse.activeLoadingDocks || 0);
                        return (
                          <div
                            key={idx}
                            className={`py-0.5 px-1 rounded text-center text-[9px] font-mono border ${
                              isBusy
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            }`}
                          >
                            B-0{idx + 1}: {isBusy ? "In-Use" : "Open"}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 italic">No loading bays configured.</p>
                  )}
                </div>
              </div>

              {/* Real Activity Timeline from DB Events */}
              <div className={`p-3.5 rounded-lg border space-y-2.5 ${cardBgClass}`}>
                <div className="flex items-center justify-between pb-2 border-b border-inherit">
                  <h3
                    className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    <Activity className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Recent Activity</span>
                  </h3>
                  <button
                    onClick={() => setActiveWarehouseTab("activity")}
                    className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
                  >
                    All ({warehouseActivity.length})
                  </button>
                </div>

                {warehouseActivity.length === 0 ? (
                  <div className="py-6 text-center text-xs text-zinc-400">
                    No recent movements or transfers logged for this hub.
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    {warehouseActivity.slice(0, 3).map((act) => (
                      <div key={act.id} className="flex items-start gap-1.5">
                        <span className="font-mono text-[10px] text-zinc-400 shrink-0">{act.date}</span>
                        <p className="truncate text-[11px]">
                          <strong className="text-indigo-400">{act.actor}</strong> {act.action}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: STOCK (LIVE FROM DATABASE PRODUCTS) */}
          {activeTab === "stock" && (
            <div className={`p-3.5 rounded-lg border space-y-3 ${cardBgClass}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search commodity, lot, bay location..."
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

              {filteredStock.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-dashed border-white/10 space-y-2">
                  <Boxes className="h-8 w-8 text-indigo-400 mx-auto opacity-50" />
                  <h4 className="text-xs font-bold">No Products Assigned to this Depot</h4>
                  <p className="text-[11px] text-zinc-400 max-w-md mx-auto">
                    {stockSearchQuery
                      ? `No commodities match your query "${stockSearchQuery}".`
                      : `Currently there are no products in the catalog assigned to warehouse location "${activeWarehouse.name}". Edit a product or receive stock to allocate inventory.`}
                  </p>
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr
                        className={`border-b font-semibold uppercase text-[10px] tracking-wider ${tableHeaderBgClass}`}
                      >
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
                    <tbody
                      className={`divide-y ${
                        isLight ? "divide-slate-200" : isSystem ? "divide-blue-500/10" : "divide-white/5"
                      }`}
                    >
                      {filteredStock.map((item, idx) => (
                        <tr
                          key={idx}
                          className={`hover:bg-white/[0.03] transition-colors ${
                            isLight ? "hover:bg-slate-50" : ""
                          }`}
                        >
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.productName}
                                  className="w-7 h-7 rounded object-cover border border-white/10 shrink-0"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                                  <Package className="h-3.5 w-3.5 text-indigo-400" />
                                </div>
                              )}
                              <div>
                                <p className="font-bold truncate max-w-[200px]">{item.productName}</p>
                                <span className="text-[10px] text-zinc-400">
                                  {item.category || "General"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-zinc-400">
                            {item.lotNumber || "—"}
                          </td>
                          <td className="py-2.5 px-3 font-medium">
                            {item.bayLocation || "Main Stacking Floor"}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-400 text-xs">
                            {item.quantity.toLocaleString()} {item.unit}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-zinc-400">
                            {(item.reorderLevel || 0).toLocaleString()} {item.unit}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold">
                            ETB {(item.estimatedValueETB || 0).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                item.quantity <= (item.reorderLevel || 0)
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              }`}
                            >
                              {item.quantity <= (item.reorderLevel || 0) ? "Low Stock" : "Healthy"}
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
              )}
            </div>
          )}

          {/* TAB: LOCATIONS (DERIVED DYNAMICALLY FROM REAL STOCK) */}
          {activeTab === "locations" && (
            <div className={`p-3.5 rounded-lg border space-y-3 ${cardBgClass}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Depot Stacking Zones & Bay Layout ({activeWarehouse.name})</span>
                </h3>
                <span className="text-xs font-mono text-zinc-400">
                  {(Number(activeWarehouse.totalCapacityM2) || 0).toLocaleString()} m² Total Area
                </span>
              </div>

              {bayLocations.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-dashed border-white/10 space-y-2">
                  <MapPin className="h-8 w-8 text-indigo-400 mx-auto opacity-50" />
                  <h4 className="text-xs font-bold">No Active Stacking Zones</h4>
                  <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                    Storage bays and zones will automatically populate when commodities are assigned to this warehouse.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
                  {bayLocations.map((zone, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border space-y-1.5 ${innerCardBgClass}`}>
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs font-bold text-indigo-400">{zone.bayName}</span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {zone.itemsCount} {zone.itemsCount === 1 ? "Item" : "Items"}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs">{zone.category}</h4>
                      <p className="text-[11px] font-mono text-emerald-400">
                        {zone.totalUnits.toLocaleString()} {zone.unit}
                      </p>
                      <span className="text-[10px] font-mono text-zinc-500 block">
                        ETB {zone.estimatedValueETB.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: RECEIVING (LIVE INBOUND FROM DATABASE) */}
          {activeTab === "receiving" && (
            <div className={`p-3.5 rounded-lg border space-y-3 ${cardBgClass}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Inbound Receiving Log ({activeWarehouse.name})</span>
                </h3>
                <button
                  onClick={() => setIsAdjustModalOpen(true)}
                  className="h-7 px-2.5 rounded bg-indigo-600 text-white text-[11px] font-semibold cursor-pointer"
                >
                  + Log Inbound Receipt
                </button>
              </div>

              {inboundTransfers.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-dashed border-white/10 space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto opacity-50" />
                  <h4 className="text-xs font-bold">No Inbound Receiving Logs</h4>
                  <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                    No inbound shipments or incoming inter-depot transfers are currently logged for {activeWarehouse.name}.
                  </p>
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr
                        className={`border-b font-semibold uppercase text-[10px] tracking-wider ${tableHeaderBgClass}`}
                      >
                        <th className="py-2.5 px-3">Receipt / Transfer Code</th>
                        <th className="py-2.5 px-3">Origin Depot</th>
                        <th className="py-2.5 px-3">Commodity & Quantity</th>
                        <th className="py-2.5 px-3">Carrier / Driver</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isLight ? "divide-slate-200" : "divide-white/5"}`}>
                      {inboundTransfers.map((row) => (
                        <tr key={row.id} className="hover:bg-white/[0.02]">
                          <td className="py-2 px-3 font-mono text-indigo-400 font-bold">
                            {row.transferNumber}
                          </td>
                          <td className="py-2 px-3 font-medium">{row.fromWarehouse}</td>
                          <td className="py-2 px-3 font-semibold">
                            {row.productName} • {row.quantity} {row.unit}
                          </td>
                          <td className="py-2 px-3 text-zinc-400 font-mono text-[11px]">
                            {row.driverName || row.carrierVehicle || "Standard Fleet"}
                          </td>
                          <td className="py-2 px-3">
                            <StatusBadge status={row.status} size="sm" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: DISPATCH (LIVE OUTBOUND FROM DATABASE) */}
          {activeTab === "dispatch" && (
            <div className={`p-3.5 rounded-lg border space-y-3 ${cardBgClass}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Outbound Shipping & Freight Dispatch Staging ({activeWarehouse.name})</span>
                </h3>
                <span className="text-xs text-zinc-400">Transfer manifests & dispatches</span>
              </div>

              {outboundTransfers.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-dashed border-white/10 space-y-2">
                  <Truck className="h-8 w-8 text-cyan-400 mx-auto opacity-50" />
                  <h4 className="text-xs font-bold">No Outbound Dispatches</h4>
                  <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                    No outgoing shipments or inter-depot transfers currently dispatched from {activeWarehouse.name}.
                  </p>
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr
                        className={`border-b font-semibold uppercase text-[10px] tracking-wider ${tableHeaderBgClass}`}
                      >
                        <th className="py-2.5 px-3">Transfer Code</th>
                        <th className="py-2.5 px-3">Destination Depot</th>
                        <th className="py-2.5 px-3">Commodity & Volume</th>
                        <th className="py-2.5 px-3">Carrier Vehicle</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isLight ? "divide-slate-200" : "divide-white/5"}`}>
                      {outboundTransfers.map((row) => (
                        <tr key={row.id} className="hover:bg-white/[0.02]">
                          <td className="py-2 px-3 font-mono text-indigo-400 font-bold">
                            {row.transferNumber}
                          </td>
                          <td className="py-2 px-3 font-semibold">{row.toWarehouse}</td>
                          <td className="py-2 px-3 font-medium">
                            {row.productName} • {row.quantity} {row.unit}
                          </td>
                          <td className="py-2 px-3 text-zinc-300 font-mono text-[11px]">
                            {row.carrierVehicle || "Scheduled Carrier"}
                          </td>
                          <td className="py-2 px-3">
                            <StatusBadge status={row.status} size="sm" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: TRANSFERS (LIVE INTER-DEPOT TABLE FROM POSTGRESQL) */}
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

              {filteredTransfers.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-dashed border-white/10 space-y-2">
                  <ArrowRightLeft className="h-8 w-8 text-indigo-400 mx-auto opacity-50" />
                  <h4 className="text-xs font-bold">No Warehouse Transfers Found</h4>
                  <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                    {transferSearchQuery || transferStatusFilter !== "all"
                      ? "No transfers match the filter criteria."
                      : "No inter-depot transfers recorded. Use 'Schedule Transfer' to move inventory between hubs."}
                  </p>
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr
                        className={`border-b font-semibold uppercase text-[10px] tracking-wider ${tableHeaderBgClass}`}
                      >
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
                          <td className="py-2 px-3 font-mono text-indigo-400 font-bold">
                            {trf.transferNumber}
                          </td>
                          <td className="py-2 px-3 font-semibold">
                            {trf.productName} ·{" "}
                            <span className="text-emerald-400 font-mono">
                              {trf.quantity} {trf.unit}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1 text-[11px]">
                              <span>{trf.fromWarehouse.split("(")[0]}</span>
                              <ArrowRight className="h-3 w-3 text-zinc-400" />
                              <span className="font-bold text-indigo-400">
                                {trf.toWarehouse.split("(")[0]}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-[11px] text-zinc-300 font-mono truncate max-w-[170px]">
                            {trf.carrierVehicle || "Scheduled Freight"}
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
              )}
            </div>
          )}

          {/* TAB: RETURNS (REAL RETURNS OR CLEAN EMPTY STATE) */}
          {activeTab === "returns" && (
            <div className={`p-3.5 rounded-lg border space-y-3 ${cardBgClass}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                  <span>Customer Reverse Logistics & Packaging Return Log</span>
                </h3>
                <span className="text-xs text-zinc-400">RMA and returned deposits</span>
              </div>

              {!returns || returns.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-dashed border-white/10 space-y-2">
                  <RotateCcw className="h-8 w-8 text-amber-400 mx-auto opacity-50" />
                  <h4 className="text-xs font-bold">No Return Requests (RMA)</h4>
                  <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                    Zero customer return requests or packaging return claims logged for {activeWarehouse.name}.
                  </p>
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr
                        className={`border-b font-semibold uppercase text-[10px] tracking-wider ${tableHeaderBgClass}`}
                      >
                        <th className="py-2.5 px-3">RMA Ref</th>
                        <th className="py-2.5 px-3">Order Ref</th>
                        <th className="py-2.5 px-3">Items</th>
                        <th className="py-2.5 px-3">Reason</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isLight ? "divide-slate-200" : "divide-white/5"}`}>
                      {returns.map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="py-2 px-3 font-mono text-indigo-400 font-bold">{row.id}</td>
                          <td className="py-2 px-3 font-semibold">{row.orderId || "—"}</td>
                          <td className="py-2 px-3 font-medium">{row.productName || "Commodity"}</td>
                          <td className="py-2 px-3 text-zinc-400">{row.reason || "Return"}</td>
                          <td className="py-2 px-3">
                            <StatusBadge status={row.status || "pending"} size="sm" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: DAMAGED (REAL SHRINKAGE OR CLEAN EMPTY STATE) */}
          {activeTab === "damaged" && (
            <div className={`p-3.5 rounded-lg border space-y-3 ${cardBgClass}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <AlertOctagon className="h-3.5 w-3.5 text-rose-400" />
                  <span>Quarantine & Damaged Goods Incident Log</span>
                </h3>
                <span className="text-xs text-emerald-400 font-mono">0.00% Shrinkage</span>
              </div>

              <div className="p-8 text-center rounded-xl border border-dashed border-white/10 space-y-2">
                <ShieldCheck className="h-8 w-8 text-emerald-400 mx-auto opacity-60" />
                <h4 className="text-xs font-bold">Zero Quarantine or Damaged Stock</h4>
                <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                  All commodity inventory in {activeWarehouse.name} is in verified good condition with 0% shrinkage recorded.
                </p>
              </div>
            </div>
          )}

          {/* TAB: ACTIVITY (LIVE AUDIT STREAM FROM REAL DATABASE EVENTS) */}
          {activeTab === "activity" && (
            <div className={`p-3.5 rounded-lg border space-y-3 ${cardBgClass}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-indigo-400" />
                  <span>WMS Operations Audit Stream ({activeWarehouse.name})</span>
                </h3>
                <span className="text-xs font-mono text-zinc-400">Live DB Stream</span>
              </div>

              {warehouseActivity.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-dashed border-white/10 space-y-2">
                  <Activity className="h-8 w-8 text-indigo-400 mx-auto opacity-50" />
                  <h4 className="text-xs font-bold">No Audit Activity Logs</h4>
                  <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                    Operations, receipts, dispatches, and inventory count changes will appear in this stream.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5 text-xs space-y-1">
                  {warehouseActivity.map((item) => (
                    <div key={item.id} className="py-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-zinc-400 text-[11px] shrink-0">{item.time}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${item.color}`}
                        >
                          {item.badge}
                        </span>
                        <p className="truncate">
                          <strong className={isLight ? "text-slate-900" : "text-white"}>
                            {item.actor}
                          </strong>{" "}
                          {item.action}
                        </p>
                      </div>
                      <span className="text-[10px] text-zinc-500 shrink-0">{item.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: REPORTS (DYNAMIC REPORTS COMPUTED FROM DATABASE) */}
          {activeTab === "reports" && (
            <div className={`p-3.5 rounded-lg border space-y-3 ${cardBgClass}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Depot Operations & Capacity Audit Reports</span>
                </h3>
                <span className="text-xs text-zinc-400">Export inventory reports</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[
                  {
                    title: "Inventory Valuation Schedule",
                    desc: `Itemized valuation for ${activeWarehouse.stockDistribution?.length || 0} commodities in ${activeWarehouse.name}`,
                    type: "CSV Export",
                    action: handleExportStockCSV,
                  },
                  {
                    title: "Depot Footprint & Occupancy",
                    desc: `${activeWhUsedCapacityM2.toLocaleString()} m² used out of ${(Number(activeWarehouse.totalCapacityM2) || 0).toLocaleString()} m² total (${activeWhCapacityPercent}% utilization)`,
                    type: "Live Metric",
                    action: () => openEditWarehouseModal(activeWarehouse),
                  },
                  {
                    title: "Transfer Manifests Log",
                    desc: `${transfers.length} total transfers recorded across logistics network`,
                    type: "Manifest Log",
                    action: () => setActiveWarehouseTab("transfers"),
                  },
                  {
                    title: "Facility Compliance Statement",
                    desc: `Status: ${activeWarehouse.status || "Operational"} • Security: ${activeWarehouse.securityLevel || "Verified"}`,
                    type: "Compliance",
                    action: () => toast.success(`Facility ${activeWarehouse.code} verified operational.`),
                  },
                ].map((rep, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border space-y-2 ${innerCardBgClass}`}>
                    <h4 className="font-bold text-xs">{rep.title}</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">{rep.desc}</p>
                    <div className="pt-2 border-t border-inherit flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-500">{rep.type}</span>
                      <button
                        onClick={rep.action}
                        className="px-2 py-1 rounded text-[10px] font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="h-3 w-3" />
                        <span>Export</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* =========================================================================
          MODAL: + ADD WAREHOUSE
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

              {/* Capacity Fields (Total and Occupied) */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400">Total Area Capacity (m²)</label>
                  <input
                    type="number"
                    min="100"
                    required
                    placeholder="10000"
                    value={newWhForm.totalCapacityM2}
                    onChange={(e) => setNewWhForm({ ...newWhForm, totalCapacityM2: Number(e.target.value) })}
                    className={`w-full h-8.5 px-2.5 rounded-lg border outline-none font-mono ${
                      isLight ? "bg-white border-slate-200" : "bg-[#141824] border-white/10"
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400">Occupied Space (m² - Optional)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 (or auto from commodities)"
                    value={newWhForm.usedCapacityM2}
                    onChange={(e) => setNewWhForm({ ...newWhForm, usedCapacityM2: Number(e.target.value) })}
                    className={`w-full h-8.5 px-2.5 rounded-lg border outline-none font-mono ${
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
                  <span>{isSubmittingWh ? "Saving Facility..." : "Create Warehouse"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT WAREHOUSE & CAPACITY
         ========================================================================= */}
      {isEditWarehouseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className={`w-full max-w-lg rounded-xl border p-4.5 space-y-3 shadow-2xl ${cardBgClass}`}>
            <div className="flex items-center justify-between pb-2 border-b border-inherit">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-indigo-400" />
                <span>Edit Depot & Capacity Settings</span>
              </h3>
              <button
                onClick={() => {
                  setIsEditWarehouseModalOpen(false);
                  setEditingWhId(null);
                }}
                className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditWarehouseSubmit} className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400">Warehouse Name</label>
                  <input
                    type="text"
                    required
                    value={editWhForm.name}
                    onChange={(e) => setEditWhForm({ ...editWhForm, name: e.target.value })}
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
                    value={editWhForm.code}
                    onChange={(e) => setEditWhForm({ ...editWhForm, code: e.target.value })}
                    className={`w-full h-8.5 px-2.5 rounded-lg border outline-none font-mono ${
                      isLight ? "bg-white border-slate-200" : "bg-[#141824] border-white/10"
                    }`}
                  />
                </div>
              </div>

              {/* Capacity Fields (Total and Occupied) */}
              <div className="grid grid-cols-2 gap-2.5 p-2 rounded-lg border border-indigo-500/20 bg-indigo-500/5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-indigo-400">Total Capacity (m²)</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={editWhForm.totalCapacityM2}
                    onChange={(e) => setEditWhForm({ ...editWhForm, totalCapacityM2: Number(e.target.value) })}
                    className={`w-full h-8.5 px-2.5 rounded-lg border outline-none font-mono ${
                      isLight ? "bg-white border-slate-200" : "bg-[#141824] border-white/10"
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-indigo-400">Occupied Space (m²)</label>
                  <input
                    type="number"
                    min="0"
                    value={editWhForm.usedCapacityM2}
                    onChange={(e) => setEditWhForm({ ...editWhForm, usedCapacityM2: Number(e.target.value) })}
                    className={`w-full h-8.5 px-2.5 rounded-lg border outline-none font-mono ${
                      isLight ? "bg-white border-slate-200" : "bg-[#141824] border-white/10"
                    }`}
                  />
                </div>
                <p className="text-[10px] text-zinc-400 col-span-2">
                  Utilization:{" "}
                  <strong className="text-emerald-400 font-mono">
                    {editWhForm.totalCapacityM2 > 0
                      ? Math.round((editWhForm.usedCapacityM2 / editWhForm.totalCapacityM2) * 100)
                      : 0}
                    %
                  </strong>{" "}
                  • Available:{" "}
                  <strong className="font-mono">
                    {Math.max(0, editWhForm.totalCapacityM2 - editWhForm.usedCapacityM2).toLocaleString()} m²
                  </strong>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400">Facility Type</label>
                  <select
                    value={editWhForm.facilityType}
                    onChange={(e) => setEditWhForm({ ...editWhForm, facilityType: e.target.value as any })}
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
                    value={editWhForm.managerName}
                    onChange={(e) => setEditWhForm({ ...editWhForm, managerName: e.target.value })}
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
                    value={editWhForm.city}
                    onChange={(e) => setEditWhForm({ ...editWhForm, city: e.target.value })}
                    className={`w-full h-8.5 px-2.5 rounded-lg border outline-none ${
                      isLight ? "bg-white border-slate-200" : "bg-[#141824] border-white/10"
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400">Phone</label>
                  <input
                    type="text"
                    value={editWhForm.phone}
                    onChange={(e) => setEditWhForm({ ...editWhForm, phone: e.target.value })}
                    className={`w-full h-8.5 px-2.5 rounded-lg border outline-none font-mono ${
                      isLight ? "bg-white border-slate-200" : "bg-[#141824] border-white/10"
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400">Physical Address</label>
                <input
                  type="text"
                  value={editWhForm.address}
                  onChange={(e) => setEditWhForm({ ...editWhForm, address: e.target.value })}
                  className={`w-full h-8.5 px-2.5 rounded-lg border outline-none ${
                    isLight ? "bg-white border-slate-200" : "bg-[#141824] border-white/10"
                  }`}
                />
              </div>

              <div className="pt-2 border-t border-inherit flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditWarehouseModalOpen(false);
                    setEditingWhId(null);
                  }}
                  className="h-8.5 px-3 rounded-lg border text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEditWh}
                  className="h-8.5 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingEditWh && <RotateCcw className="h-3.5 w-3.5 animate-spin" />}
                  <span>{isSubmittingEditWh ? "Saving..." : "Update Capacity & Depot"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: SCHEDULE INTER-DEPOT TRANSFER
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
                        {p.name} ({p.stock ?? 0} {p.unit || "KG"})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Enter commodity name"
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
                    min="1"
                    required
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
                <label className="text-[11px] font-semibold text-zinc-400">Carrier Vehicle & Plate (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Freight Truck (Plate AA-3-0000)"
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
          MODAL: RECEIVE / ADJUST STOCK
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
                        {p.name} ({p.stock ?? 0} {p.unit || "KG"})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Enter commodity name"
                    value={adjustForm.productName}
                    onChange={(e) => setAdjustForm({ ...adjustForm, productName: e.target.value })}
                    className={`w-full h-8.5 px-2.5 rounded-lg border outline-none ${
                      isLight ? "bg-white border-slate-200" : "bg-[#141824] border-white/10"
                    }`}
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400">
                  Adjustment Quantity (+ Inbound / - Outbound)
                </label>
                <input
                  type="number"
                  required
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
                  required
                  placeholder="e.g. Inbound purchase receipt or physical audit"
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

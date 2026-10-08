"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Warehouse as WarehouseIcon,
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
  RotateCcw,
} from "lucide-react";
import { PageHeader } from "../shared/page-header";
import { Pagination } from "../shared/pagination";
import { EmptyState } from "../shared/empty-state";
import { useSupplierStore } from "@/store/supplier-store";
import { useThemeStore } from "@/store/theme-store";
import { toast } from "sonner";
import { sellerService } from "@/services/seller/seller.service";
import {
  B2BInventoryItem,
  StockReservation,
  DamagedStockRecord,
  StockAdjustmentRecord,
  InventoryAlertItem,
  WarehouseDetail,
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
  const {
    products,
    isLoadingProducts,
    productsError,
    fetchProducts,
    warehouses,
    isLoadingWarehouses,
    fetchWarehouses,
    transfers,
    fetchTransfers,
    inventoryMovements,
    orders,
    adjustStock,
    transferStock,
    completeTransfer,
    deleteTransfer,
    setActiveTab,
  } = useSupplierStore();

  const { theme } = useThemeStore();
  const isLight = theme === "light";
  const isSystem = theme === "system";

  // Tab State
  const [activeTabSub, setActiveTabSub] = useState<InventoryTab>("overview");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Fetch live backend data from PostgreSQL on mount
  useEffect(() => {
    fetchProducts();
    fetchWarehouses();
    fetchTransfers();
  }, [fetchProducts, fetchWarehouses, fetchTransfers]);

  // Also fetch backend catalog inventory alerts
  const [backendAlerts, setBackendAlerts] = useState<any[]>([]);
  useEffect(() => {
    sellerService
      .getInventoryAlerts()
      .then((res) => {
        if (Array.isArray(res)) setBackendAlerts(res);
      })
      .catch((err) => {
        console.warn("[SupplierInventoryView] Failed to fetch backend alerts:", err);
      });
  }, []);

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
  const [isSyncing, setIsSyncing] = useState(false);

  // Damaged stock state (tracks recorded damaged items during operations)
  const [damagedRecords, setDamagedRecords] = useState<DamagedStockRecord[]>([]);

  // 1. DYNAMIC MAPPING: Backend PostgreSQL Products -> B2B Inventory Items
  const inventory: B2BInventoryItem[] = useMemo(() => {
    return products.map((p) => {
      const unit = p.unit || "KG";
      const basePrice = Number(p.basePrice) || 0;
      const totalStock = Number(p.stock) ?? 0;
      const reservedStock = Number(p.reservedStock) ?? 0;
      const availableStock = Math.max(0, totalStock - reservedStock);
      const minLevel = Number(p.moq) || 10;
      const status: B2BInventoryItem["status"] =
        availableStock === 0
          ? "out_of_stock"
          : availableStock <= minLevel
          ? "low_stock"
          : "in_stock";

      // Match primary warehouse from live warehouses stockDistribution
      const whWithProduct = warehouses.find((w) =>
        (w.stockDistribution || []).some(
          (s) => s.productName.toLowerCase() === p.name.toLowerCase()
        )
      );
      const primaryWarehouse = whWithProduct ? whWithProduct.name : warehouses[0]?.name || "Central Logistics Hub";

      // Calculate in-transit transfers targeting this commodity
      const inTransitQty = transfers
        .filter(
          (t) =>
            t.status === "in_transit" &&
            (t.productName || "").toLowerCase() === p.name.toLowerCase()
        )
        .reduce((sum, t) => sum + (Number(t.quantity) || 0), 0);

      // Distribute across warehouses dynamically
      const warehouseDistribution = warehouses.map((w) => {
        const itemInWh = (w.stockDistribution || []).find(
          (s) => s.productName.toLowerCase() === p.name.toLowerCase()
        );
        const distQty = itemInWh?.quantity ?? Math.round(totalStock / Math.max(1, warehouses.length));
        return {
          warehouseId: w.id,
          warehouseName: w.name,
          total: distQty,
          available: distQty,
          reserved: 0,
          damaged: 0,
        };
      });

      return {
        id: p.id,
        name: p.name,
        sku: p.sku || `SKU-${p.id.slice(0, 6).toUpperCase()}`,
        barcode: p.sku
          ? p.sku.replace(/[^0-9]/g, "").padEnd(12, "0").slice(0, 12)
          : "600129000000",
        category: p.category || "Agricultural Commodities",
        grade: p.grade || p.subcategory || "Export Grade",
        origin: p.origin || "Ethiopia",
        unit,
        costPrice: Math.round(basePrice * 0.75),
        sellingPrice: basePrice,
        totalStock,
        reservedStock,
        damagedStock: 0,
        availableStock,
        incomingStock: inTransitQty,
        minimumLevel: minLevel,
        maximumLevel: Math.max(totalStock * 2, minLevel * 5, 200),
        primaryWarehouse,
        status,
        images: p.images && p.images.length > 0 ? p.images : ["/images/placeholder-product.jpg"],
        batchNumber: `LOT-${p.id.slice(0, 6).toUpperCase()}`,
        lastRestocked: p.createdAt || new Date().toISOString().split("T")[0],
        supplier: p.brand || "Abyssinia Premium Exporters",
        warehouseDistribution,
      };
    });
  }, [products, warehouses, transfers]);

  // 2. DYNAMIC MAPPING: Backend PostgreSQL Warehouses -> Warehouse Detail
  const warehousesDetail: WarehouseDetail[] = useMemo(() => {
    return warehouses.map((w) => {
      const totalCommodityUnits =
        (w.stockDistribution || []).reduce(
          (acc, s) => acc + (Number(s.quantity) || 0),
          0
        ) || w.totalStockUnits || 0;

      const valuation = (w.stockDistribution || []).reduce(
        (acc, s) => acc + (Number(s.estimatedValueETB) || 0),
        0
      );

      const capM2 = Number(w.totalCapacityM2) || 10000;
      const usedM2 = Number(w.usedCapacityM2) || 0;
      const capPercent = capM2 > 0 ? Math.min(100, Math.round((usedM2 / capM2) * 100)) : 0;

      return {
        id: w.id,
        name: w.name,
        code: w.code || `WH-${w.id.slice(0, 2).toUpperCase()}`,
        location: w.address || w.city || "Ethiopia",
        city: w.city || "Addis Ababa",
        region: w.region || "Addis Ababa",
        address: w.address || w.city || "Industrial Zone",
        manager: w.managerName || "Warehouse Lead",
        phone: w.phone || "+251 11 000 0000",
        totalProducts: (w.stockDistribution || []).length || (products.length > 0 ? products.length : 0),
        totalStock: totalCommodityUnits,
        capacity: capM2,
        capacityUsedPercent: capPercent,
        inventoryValue: valuation,
        status: (w.status || "operational") as "operational",
      };
    });
  }, [warehouses, products.length]);

  // 3. DYNAMIC MAPPING: Escrow Orders -> Stock Reservations
  const reservations: StockReservation[] = useMemo(() => {
    return orders
      .filter((o) =>
        ["confirmed", "processing", "pending"].includes(o.orderStatus) ||
        o.paymentStatus === "escrow_secured"
      )
      .map((o) => {
        return {
          id: `res-${o.id}`,
          orderNumber: o.orderNumber,
          buyerCompany: o.buyerCompany,
          buyerContact: o.buyerPhone || o.buyerEmail || o.contactPerson,
          productId: o.productId || "prod-order",
          productName: o.productName || "Commodity Batch",
          quantity: o.quantity || 1,
          unit: o.unit || "KG",
          reservedDate: o.orderDate || new Date().toISOString().split("T")[0],
          expiryDate: o.expectedDelivery || "2026-10-25",
          status: (o.paymentStatus === "escrow_secured"
            ? "confirmed"
            : o.orderStatus === "processing"
            ? "reserved"
            : "confirmed") as StockReservation["status"],
          escrowAmount: o.total || 0,
          warehouse: o.branchName || warehouses[0]?.name || "Central Logistics Hub",
        };
      });
  }, [orders, warehouses]);

  // 4. DYNAMIC MAPPING: Live Inventory Alerts from Real Product Stocks & Backend Endpoint
  const alerts: InventoryAlertItem[] = useMemo(() => {
    const list: InventoryAlertItem[] = [];

    // Out of Stock (Critical)
    inventory
      .filter((p) => p.availableStock === 0)
      .forEach((p) => {
        list.push({
          id: `alert-out-${p.id}`,
          type: "out_of_stock",
          severity: "critical",
          productName: p.name,
          sku: p.sku,
          warehouse: p.primaryWarehouse,
          message: `${p.name} is completely depleted. All incoming commercial purchase orders will be blocked.`,
          currentLevel: `0 ${p.unit}`,
          targetLevel: `${p.minimumLevel * 3} ${p.unit}`,
          timestamp: "Automated Stock Alert",
          actionLabel: "Restock Now",
          read: false,
        });
      });

    // Low Stock Warning
    inventory
      .filter((p) => p.availableStock > 0 && p.availableStock <= p.minimumLevel)
      .forEach((p) => {
        list.push({
          id: `alert-low-${p.id}`,
          type: "low_stock",
          severity: "warning",
          productName: p.name,
          sku: p.sku,
          warehouse: p.primaryWarehouse,
          message: `Stock level (${p.availableStock} ${p.unit}) has breached minimum buffer threshold (${p.minimumLevel} ${p.unit}).`,
          currentLevel: `${p.availableStock} ${p.unit}`,
          targetLevel: `${p.minimumLevel * 2} ${p.unit}`,
          timestamp: "Safety Threshold Alert",
          actionLabel: "Reorder Buffer",
          read: false,
        });
      });

    // Backend Catalog Alerts
    backendAlerts.forEach((ba) => {
      if (!list.some((l) => l.productName === ba.title || l.sku === ba.sku)) {
        list.push({
          id: `alert-be-${ba.id}`,
          type: ba.isOutOfStock ? "out_of_stock" : "low_stock",
          severity: ba.isOutOfStock ? "critical" : "warning",
          productName: ba.title || "Product",
          sku: ba.sku,
          warehouse: warehouses[0]?.name || "Central Logistics Hub",
          message: `Stock level ${ba.stockQuantity} ${ba.unit || "units"} is below safety threshold ${ba.lowStockThreshold}.`,
          currentLevel: `${ba.stockQuantity} ${ba.unit || "units"}`,
          targetLevel: `${ba.lowStockThreshold * 2} ${ba.unit || "units"}`,
          timestamp: "Catalog Threshold Warning",
          actionLabel: "Replenish Stock",
          read: false,
        });
      }
    });

    // In-Transit Transfers
    transfers
      .filter((t) => t.status === "in_transit")
      .forEach((t) => {
        list.push({
          id: `alert-trf-${t.id}`,
          type: "transfer_delayed",
          severity: "info",
          productName: t.productName,
          warehouse: `${t.fromWarehouse} -> ${t.toWarehouse}`,
          message: `Inter-depot freight transfer ${t.transferNumber} of ${t.quantity} ${t.unit} is currently on route.`,
          currentLevel: `${t.quantity} ${t.unit}`,
          targetLevel: "Arrival Pending",
          timestamp: t.requestedDate || "In Transit",
          actionLabel: "Track Freight",
          read: false,
        });
      });

    return list;
  }, [inventory, backendAlerts, transfers, warehouses]);

  // 5. DYNAMIC ADJUSTMENTS: Derived from actual audit movements
  const auditAdjustments: StockAdjustmentRecord[] = useMemo(() => {
    return inventoryMovements
      .filter((m) => m.type === "adjusted" || (m.reference && m.reference.includes("ADJ")))
      .map((m) => {
        const prod = inventory.find((p) => p.name === m.productName || p.id === m.productId);
        const sysQty = prod ? prod.totalStock : Math.abs(m.quantity);
        return {
          id: m.id,
          adjustmentNumber: m.reference.split(" ")[0] || `ADJ-${m.id.slice(-6)}`,
          productId: m.productId,
          productName: m.productName,
          warehouse: m.warehouse,
          systemQty: sysQty,
          physicalQty: Math.max(0, sysQty + m.quantity),
          difference: m.quantity,
          unit: m.unit,
          reason: m.reference.includes("(") ? m.reference.split("(")[1]?.replace(")", "") : "Cycle Count Reconciliation",
          notes: `Verified by ${m.actor}`,
          date: m.date.split(" ")[0],
          auditor: m.actor,
          status: "approved",
        };
      });
  }, [inventoryMovements, inventory]);

  // KPI Calculations from Live Inventory Records
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

  // Sync DB Button Handler
  const handleSyncDatabase = async () => {
    setIsSyncing(true);
    try {
      await Promise.all([fetchProducts(), fetchWarehouses(), fetchTransfers()]);
      toast.success("Inventory, warehouses, and transfers synchronized successfully.");
    } catch {
      toast.error("Failed to synchronize inventory data.");
    } finally {
      setIsSyncing(false);
    }
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
        warehouseFilter === "all" ||
        p.primaryWarehouse.toLowerCase().includes(warehouseFilter.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" ||
        p.category.toLowerCase().includes(categoryFilter.toLowerCase());

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

  const totalProductPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredProducts, currentPage]);

  // Unique categories for filter dropdown
  const uniqueCategories = useMemo(() => {
    const set = new Set(inventory.map((p) => p.category).filter(Boolean));
    return Array.from(set);
  }, [inventory]);

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

  // =========================================================================
  // HANDLERS FOR LIVE BACKEND B2B OPERATIONS
  // =========================================================================

  // 1. ADD STOCK (Calls backend adjustStock with positive delta -> persists in DB)
  const handleAddStock = async (data: {
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
    try {
      await adjustStock(
        data.productId,
        Number(data.quantity),
        `Stock In: Lot ${data.batchNumber} (${data.supplierRef})`,
        data.warehouse
      );
      await fetchProducts();
      await fetchWarehouses();
      setIsAddStockOpen(false);
      toast.success(
        `Successfully added +${data.quantity} ${data.unit} to inventory (Batch ${data.batchNumber})!`
      );
    } catch {
      toast.error("Failed to add stock.");
    }
  };

  // 2. ADJUST STOCK (Calls backend adjustStock -> persists physical cycle count delta in DB)
  const handleAdjustStock = async (data: {
    productId: string;
    warehouse: string;
    currentQty: number;
    physicalQty: number;
    difference: number;
    unit: string;
    reason: string;
    notes: string;
  }) => {
    try {
      await adjustStock(
        data.productId,
        data.difference,
        data.reason,
        data.warehouse
      );
      await fetchProducts();
      await fetchWarehouses();
      setIsAdjustOpen(false);
      toast.success(
        `Audit adjustment recorded successfully (${data.difference >= 0 ? "+" : ""}${data.difference} ${data.unit})!`
      );
    } catch {
      toast.error("Failed to record stock adjustment.");
    }
  };

  // 3. TRANSFER STOCK (Calls backend createWarehouseTransfer in PostgreSQL)
  const handleTransferStock = async (data: {
    fromWarehouse: string;
    toWarehouse: string;
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    vehiclePlate: string;
    driverName: string;
  }) => {
    try {
      await transferStock(
        data.fromWarehouse,
        data.toWarehouse,
        data.productName,
        Number(data.quantity),
        data.unit
      );
      await fetchTransfers();
      await fetchWarehouses();
      setIsTransferOpen(false);
      toast.success(
        `Inter-depot freight transfer of ${data.quantity} ${data.unit} registered successfully!`
      );
    } catch {
      toast.error("Failed to register transfer.");
    }
  };

  // 4. CONFIRM DAMAGED WRITE-OFF (Deducts stock via backend adjustStock)
  const handleConfirmWriteOff = async (item: DamagedStockRecord) => {
    try {
      if (item.productId) {
        await adjustStock(
          item.productId,
          -Math.abs(item.quantity),
          `Damaged Write-Off: ${item.reason}`,
          item.warehouse
        );
      }
      setDamagedRecords((prev) =>
        prev.map((d) => (d.id === item.id ? { ...d, status: "written_off" } : d))
      );
      await fetchProducts();
      await fetchWarehouses();
      toast.success(`Successfully written off ${item.quantity} ${item.unit} of ${item.productName}.`);
    } catch {
      toast.error("Failed to write off damaged stock.");
    }
  };

  // 5. EXPORT PRODUCTS CSV
  const handleExportProductsCSV = () => {
    if (inventory.length === 0) {
      toast.info("No product inventory records to export.");
      return;
    }
    const headers = [
      "Product Name",
      "SKU",
      "Category",
      "Grade",
      "Origin",
      "Primary Warehouse",
      "Total Stock",
      "Available Stock",
      "Reserved Stock",
      "Unit",
      "Cost Price (ETB)",
      "Selling Price (ETB)",
      "Total Valuation (ETB)",
      "Status",
    ];
    const rows = inventory.map((p) => [
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.sku}"`,
      `"${p.category}"`,
      `"${p.grade}"`,
      `"${p.origin}"`,
      `"${p.primaryWarehouse}"`,
      p.totalStock,
      p.availableStock,
      p.reservedStock,
      `"${p.unit}"`,
      p.costPrice,
      p.sellingPrice,
      p.totalStock * p.sellingPrice,
      `"${p.status}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mercatox_inventory_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported inventory records to CSV.");
  };

  // 6. EXPORT MOVEMENTS CSV
  const handleExportMovementsCSV = () => {
    if (inventoryMovements.length === 0) {
      toast.info("No movement records found to export.");
      return;
    }
    const headers = ["Timestamp", "Product", "Movement Type", "Quantity Delta", "Unit", "Warehouse Depot", "Reference", "Actor"];
    const rows = inventoryMovements.map((m) => [
      `"${m.date}"`,
      `"${m.productName.replace(/"/g, '""')}"`,
      `"${m.type}"`,
      m.quantity,
      `"${m.unit}"`,
      `"${m.warehouse}"`,
      `"${m.reference.replace(/"/g, '""')}"`,
      `"${m.actor}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `mercatox_stock_movements_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported stock movement ledger to CSV.");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto min-w-0">
      {/* 1. Header with B2B Live Actions */}
      <PageHeader
        title="Inventory Management"
        subtitle="Real-time multi-depot allocations, commodity inventory movements, and transfers."
        breadcrumbs={[{ label: "Dashboard", onClick: () => setActiveTab("dashboard") }, { label: "Inventory" }]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Live Ledger Status Indicator */}
            <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold">Live Ledger:</span>
              <span>Synchronized</span>
            </div>

            {/* Refresh Data Button */}
            <button
              onClick={handleSyncDatabase}
              disabled={isSyncing || isLoadingProducts}
              className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                isLight
                  ? "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200"
              }`}
              title="Synchronize inventory data"
            >
              <RotateCcw className={`h-3.5 w-3.5 text-indigo-400 ${isSyncing || isLoadingProducts ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Warning Alert Icon */}
            <button
              onClick={() => setActiveTabSub("alerts")}
              className={`relative p-2.5 rounded-xl border transition-colors cursor-pointer ${
                isLight
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

            {/* Export CSV */}
            <button
              onClick={handleExportProductsCSV}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                isLight
                  ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  : isSystem
                  ? "border-blue-500/30 bg-[#0f1b3b] text-blue-200 hover:bg-blue-500/20"
                  : "border-white/10 bg-white/[0.04] text-zinc-200 hover:bg-white/[0.08]"
              }`}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>

            {/* Adjust Stock */}
            <button
              onClick={() => setIsAdjustOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                isLight
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
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                isLight
                  ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  : isSystem
                  ? "border-blue-500/30 bg-[#0f1b3b] text-blue-200 hover:bg-blue-500/20"
                  : "border-white/10 bg-white/[0.04] text-zinc-200 hover:bg-white/[0.08]"
              }`}
            >
              <ArrowRightLeft className="h-3.5 w-3.5 text-cyan-400" />
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

      {/* 2. Six Professional Inventory KPI Cards (Calculated directly from live database state) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1: Total Stock */}
        <div
          className={`rounded-xl border p-3 sm:p-3.5 transition-all ${
            isLight
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
            ETB {(totalValuation / 1000000).toFixed(2)}M Val.
          </p>
        </div>

        {/* KPI 2: Available Stock */}
        <div
          className={`rounded-xl border p-3 sm:p-3.5 transition-all ${
            isLight
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
          className={`rounded-xl border p-3 sm:p-3.5 transition-all ${
            isLight
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
            {reservations.length} Active Escrow Allocations
          </p>
        </div>

        {/* KPI 4: Low Stock */}
        <div
          onClick={() => {
            setActiveTabSub("products");
            setStatusFilter("low_stock");
          }}
          className={`rounded-xl border p-3 sm:p-3.5 transition-all cursor-pointer ${
            isLight
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
            {lowStockCount} <span className="text-[10px] font-normal opacity-70">Items</span>
          </p>
          <p className={`text-[10px] truncate mt-0.5 ${isLight ? "text-amber-800" : "text-amber-300/80"}`}>
            Below safety buffer
          </p>
        </div>

        {/* KPI 5: Out of Stock */}
        <div
          onClick={() => {
            setActiveTabSub("products");
            setStatusFilter("out_of_stock");
          }}
          className={`rounded-xl border p-3 sm:p-3.5 transition-all cursor-pointer ${
            isLight
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
            {outOfStockCount} <span className="text-[10px] font-normal opacity-70">Items</span>
          </p>
          <p className={`text-[10px] truncate mt-0.5 ${isLight ? "text-rose-800" : "text-rose-300/80"}`}>
            Zero available inventory
          </p>
        </div>

        {/* KPI 6: Warehouses */}
        <div
          onClick={() => setActiveTabSub("warehouses")}
          className={`rounded-xl border p-3 sm:p-3.5 transition-all cursor-pointer ${
            isLight
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
              <WarehouseIcon className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className={`text-base sm:text-lg font-bold font-mono mt-1 ${isLight ? "text-slate-900" : "text-white"}`}>
            {warehouses.length} <span className="text-[10px] font-normal opacity-70">Depots</span>
          </p>
          <p className={`text-[10px] truncate mt-0.5 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
            Live Regional Logistics Hubs
          </p>
        </div>
      </div>

      {/* 3. Ten B2B Enterprise Tabs */}
      <div
        className={`flex items-center gap-1.5 overflow-x-auto pb-1 border-b no-scrollbar ${
          isLight ? "border-slate-200" : isSystem ? "border-blue-500/20" : "border-white/10"
        }`}
      >
        {[
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "products", label: "Products", icon: Package, badge: inventory.length },
          { id: "warehouses", label: "Warehouses", icon: WarehouseIcon, badge: warehouses.length },
          { id: "movements", label: "Movements", icon: History, badge: inventoryMovements.length },
          { id: "transfers", label: "Transfers", icon: Truck, badge: transfers.length },
          { id: "reservations", label: "Reservations", icon: Lock, badge: reservations.length },
          { id: "damaged", label: "Damaged", icon: AlertTriangle, badge: damagedRecords.length },
          { id: "adjustments", label: "Adjustments", icon: SlidersHorizontal, badge: auditAdjustments.length },
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
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
                isActive
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
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    isActive
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
              className={`lg:col-span-2 rounded-2xl border p-5 space-y-3 transition-colors ${
                isLight ? "bg-white border-slate-200 shadow-xs" : isSystem ? "bg-[#0f1b3b] border-blue-500/20" : "bg-[#141418] border-white/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <h3 className={`font-bold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>
                    Live Inventory Alerts & Safety Buffer Warnings
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTabSub("alerts")}
                  className="text-xs text-emerald-500 font-semibold hover:underline cursor-pointer"
                >
                  View All ({alerts.length})
                </button>
              </div>

              {alerts.length === 0 ? (
                <div className="p-6 text-center text-xs opacity-70">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                  <p className="font-semibold">All inventory stock balances are healthy.</p>
                  <p className="text-[11px] mt-0.5">No stockouts or safety buffer warnings logged.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {alerts.slice(0, 3).map((al) => (
                    <div
                      key={al.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                        al.severity === "critical"
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
              )}
            </div>

            {/* Warehouse Capacity Utilization Gauge (1 col) */}
            <div
              className={`rounded-2xl border p-5 space-y-3 transition-colors ${
                isLight ? "bg-white border-slate-200 shadow-xs" : isSystem ? "bg-[#0f1b3b] border-blue-500/20" : "bg-[#141418] border-white/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <WarehouseIcon className="h-4 w-4 text-purple-400" />
                  <h3 className={`font-bold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>
                    Live Depot Capacity
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTabSub("warehouses")}
                  className="text-xs text-emerald-500 font-semibold hover:underline cursor-pointer"
                >
                  Manage Hubs
                </button>
              </div>

              {warehousesDetail.length === 0 ? (
                <div className="p-6 text-center text-xs opacity-70">
                  <p>No warehouses registered in depot network.</p>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {warehousesDetail.map((wh) => (
                    <div key={wh.id} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between font-medium">
                        <span className="truncate max-w-[170px]">{wh.name}</span>
                        <span className="font-mono text-[11px] opacity-80">{wh.capacityUsedPercent}% Cap.</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                          style={{ width: `${wh.capacityUsedPercent}%` }}
                          className={`h-full rounded-full ${
                            wh.capacityUsedPercent > 75
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
              )}
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
            className={`flex flex-col gap-3 rounded-2xl border p-3.5 shadow-xs transition-colors ${
              isLight ? "border-slate-200 bg-white" : isSystem ? "border-blue-500/25 bg-[#0f1b3b]" : "border-white/10 bg-[#141418]"
            }`}
          >
            {/* Search Input */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative flex-1">
                <Search
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${
                    isLight ? "text-slate-400" : "text-zinc-400"
                  }`}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search products by Name, SKU, Barcode, Warehouse..."
                  className={`w-full rounded-xl border pl-9 pr-9 py-2 text-xs sm:text-sm font-medium transition-all ${
                    isLight
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
                className={`flex items-center gap-1 p-1 rounded-xl border self-end md:self-auto ${
                  isLight ? "bg-slate-100 border-slate-200" : "bg-[#10141e] border-white/10"
                }`}
              >
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1.5 ${
                    viewMode === "table"
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
                  className={`p-1.5 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1.5 ${
                    viewMode === "grid"
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
              {/* Dynamic Warehouse Dropdown from Database */}
              <select
                value={warehouseFilter}
                onChange={(e) => {
                  setWarehouseFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className={`rounded-xl border px-3 py-2 font-medium cursor-pointer ${
                  isLight ? "border-slate-200 bg-white text-slate-800" : "border-white/10 bg-[#121824] text-zinc-200"
                }`}
              >
                <option value="all">All Depots ({warehouses.length})</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.name}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>

              {/* Dynamic Category Dropdown */}
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className={`rounded-xl border px-3 py-2 font-medium cursor-pointer ${
                  isLight ? "border-slate-200 bg-white text-slate-800" : "border-white/10 bg-[#121824] text-zinc-200"
                }`}
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Stock Status Dropdown */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className={`rounded-xl border px-3 py-2 font-medium cursor-pointer ${
                  isLight ? "border-slate-200 bg-white text-slate-800" : "border-white/10 bg-[#121824] text-zinc-200"
                }`}
              >
                <option value="all">All Statuses</option>
                <option value="in_stock">In Stock (Normal)</option>
                <option value="low_stock">Low Stock (Alert)</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>

              {/* Stock Level Filter */}
              <select
                value={stockLevelFilter}
                onChange={(e) => {
                  setStockLevelFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className={`rounded-xl border px-3 py-2 font-medium cursor-pointer ${
                  isLight ? "border-slate-200 bg-white text-slate-800" : "border-white/10 bg-[#121824] text-zinc-200"
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
                className={`rounded-xl border px-3 py-2 font-medium cursor-pointer ${
                  isLight ? "border-slate-200 bg-white text-slate-800" : "border-white/10 bg-[#121824] text-zinc-200"
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
          {isLoadingProducts && inventory.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-indigo-500/30 bg-indigo-500/5 space-y-3">
              <RotateCcw className="h-6 w-6 text-indigo-400 mx-auto animate-spin" />
              <h3 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                Loading Enterprise Inventory...
              </h3>
              <p className="text-xs text-zinc-400">Fetching commercial listings and warehouse stock balances.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div
              className={`rounded-2xl border p-12 text-center ${
                isLight ? "bg-white border-slate-200" : "bg-[#141418] border-white/10"
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
              className={`rounded-2xl border shadow-xl overflow-hidden w-full transition-colors ${
                isLight ? "border-slate-200 bg-white text-slate-900" : isSystem ? "border-blue-500/25 bg-[#0f1b3b]" : "border-white/10 bg-[#141418]"
              }`}
            >
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr
                      className={`border-b font-semibold uppercase text-[11px] tracking-wider select-none ${
                        isLight ? "border-slate-200 bg-slate-50 text-slate-600" : "border-white/10 bg-white/[0.03] text-zinc-400"
                      }`}
                    >
                      <th className="py-3.5 px-5 min-w-[280px]">Product / Specification</th>
                      <th className="py-3.5 px-4 min-w-[130px]">SKU / Barcode</th>
                      <th className="py-3.5 px-4 min-w-[180px]">Primary Depot</th>
                      <th className="py-3.5 px-4 min-w-[140px]">Total Stock</th>
                      <th className="py-3.5 px-4 min-w-[120px]">Reserved</th>
                      <th className="py-3.5 px-4 min-w-[130px]">Available</th>
                      <th className="py-3.5 px-4 min-w-[110px]">Min. Level</th>
                      <th className="py-3.5 px-4 min-w-[110px]">Status</th>
                      <th className="py-3.5 px-4 text-right min-w-[140px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${
                      isLight ? "divide-slate-100" : isSystem ? "divide-blue-500/10" : "divide-white/[0.05]"
                    }`}
                  >
                    {paginatedProducts.map((prod) => {
                      return (
                        <tr
                          key={prod.id}
                          className={`transition-colors cursor-pointer group ${
                            isLight
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
                              <img
                                src={prod.images[0]}
                                alt={prod.name}
                                className="h-10 w-10 rounded-xl object-cover border border-white/10 shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-sm truncate group-hover:text-emerald-500 transition-colors">
                                  {prod.name}
                                </p>
                                <p className="text-[11px] opacity-75 truncate">
                                  {prod.category} • {prod.grade}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* SKU */}
                          <td className="py-3.5 px-4 font-mono text-xs opacity-90">
                            <div>
                              <span>{prod.sku}</span>
                              <span className="block text-[10px] opacity-60 font-sans">{prod.barcode}</span>
                            </div>
                          </td>

                          {/* Primary Depot */}
                          <td className="py-3.5 px-4 text-xs">
                            <span className="font-medium">{prod.primaryWarehouse}</span>
                          </td>

                          {/* Total Stock */}
                          <td className="py-3.5 px-4 font-mono font-bold text-xs">
                            {prod.totalStock.toLocaleString()} {prod.unit}
                          </td>

                          {/* Reserved */}
                          <td className="py-3.5 px-4 font-mono text-xs opacity-80">
                            {prod.reservedStock.toLocaleString()} {prod.unit}
                          </td>

                          {/* Available */}
                          <td className="py-3.5 px-4 font-mono font-bold text-xs">
                            <span className={prod.availableStock > 0 ? "text-emerald-500" : "text-rose-500"}>
                              {prod.availableStock.toLocaleString()} {prod.unit}
                            </span>
                          </td>

                          {/* Min Level */}
                          <td className="py-3.5 px-4 font-mono text-xs opacity-75">
                            {prod.minimumLevel.toLocaleString()} {prod.unit}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                prod.status === "in_stock"
                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                  : prod.status === "low_stock"
                                  ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                  : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                              }`}
                            >
                              {prod.status.replace("_", " ")}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProduct(prod);
                                  setIsAdjustOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg border border-white/10 hover:bg-white/10 text-xs font-semibold cursor-pointer"
                              >
                                Adjust
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProduct(prod);
                                  setIsTransferOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg border border-white/10 hover:bg-white/10 text-xs font-semibold cursor-pointer"
                              >
                                Transfer
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
                  className={`rounded-2xl border p-4.5 flex flex-col justify-between space-y-3.5 transition-all cursor-pointer group ${
                    isLight
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
                            className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase border ${
                              prod.status === "in_stock"
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
                      className={`rounded-xl border p-3 space-y-1.5 text-xs ${
                        isLight ? "bg-slate-50 border-slate-200" : "bg-white/[0.02] border-white/5"
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
          TAB 3: WAREHOUSES (Live Multi-Depot Multi-Modal Hubs)
         ========================================================================= */}
      {activeTabSub === "warehouses" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-bold text-base ${isLight ? "text-slate-900" : "text-white"}`}>
                Regional Warehouse Hubs
              </h3>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                Registered storage facilities, managers, capacity utilization, and stock distribution.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("warehouse")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#388E3C] text-xs font-bold text-white shadow-sm cursor-pointer"
            >
              <WarehouseIcon className="h-4 w-4" />
              <span>+ Manage in Depots Tab</span>
            </button>
          </div>

          {warehousesDetail.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-white/10 space-y-3">
              <WarehouseIcon className="h-8 w-8 text-indigo-400 mx-auto opacity-75" />
              <h3 className="text-sm font-bold">No Warehouse Locations Registered</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                No storage facilities have been registered in your supply network yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {warehousesDetail.map((wh) => (
                <div
                  key={wh.id}
                  className={`rounded-2xl border p-5 space-y-4 transition-all ${
                    isLight
                      ? "bg-white border-slate-200 shadow-xs"
                      : isSystem
                      ? "bg-[#0f1b3b] border-blue-500/25 shadow-md shadow-blue-950/20"
                      : "bg-[#141418] border-white/10 shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                        <WarehouseIcon className="h-5 w-5" />
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
                    className={`grid grid-cols-3 gap-2.5 p-3 rounded-xl border text-xs font-mono ${
                      isLight ? "bg-slate-50 border-slate-200" : "bg-white/[0.02] border-white/5"
                    }`}
                  >
                    <div>
                      <span className="text-[10px] opacity-60">Commodities</span>
                      <p className="font-bold text-sm mt-0.5">{wh.totalProducts} Lines</p>
                    </div>
                    <div>
                      <span className="text-[10px] opacity-60">Total Units</span>
                      <p className="font-bold text-sm mt-0.5">{wh.totalStock.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-[10px] opacity-60">Hub Valuation</span>
                      <p className="font-bold text-sm text-emerald-500 mt-0.5">
                        ETB {(wh.inventoryValue / 1000000).toFixed(2)}M
                      </p>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="opacity-75">Capacity Utilization:</span>
                      <span className="font-mono font-bold">
                        {wh.capacityUsedPercent}% ({wh.totalStock.toLocaleString()} units / {wh.capacity.toLocaleString()} m²)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        style={{ width: `${wh.capacityUsedPercent}%` }}
                        className={`h-full rounded-full ${
                          wh.capacityUsedPercent > 75
                            ? "bg-amber-500"
                            : wh.capacityUsedPercent > 90
                            ? "bg-rose-500"
                            : "bg-[#2E7D32]"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Footer Info & Actions */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="opacity-70">Lead: {wh.manager} ({wh.phone})</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setWarehouseFilter(wh.name);
                          setActiveTabSub("products");
                        }}
                        className="text-emerald-500 font-semibold hover:underline cursor-pointer"
                      >
                        Filter Stock
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
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: MOVEMENTS (Real Audit Ledger from Database Operations)
         ========================================================================= */}
      {activeTabSub === "movements" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-bold text-base ${isLight ? "text-slate-900" : "text-white"}`}>
                Stock Movement Audit Ledger
              </h3>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                Traceable immutable record of all Stock In, Stock Out, Audit Adjustments, and Freight Transfers.
              </p>
            </div>
            <button
              onClick={handleExportMovementsCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-xs font-semibold hover:bg-white/10 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Ledger</span>
            </button>
          </div>

          {inventoryMovements.length === 0 ? (
            <div
              className={`rounded-2xl border p-12 text-center ${
                isLight ? "bg-white border-slate-200" : "bg-[#141418] border-white/10"
              }`}
            >
              <History className="h-8 w-8 text-indigo-400 mx-auto mb-2 opacity-75" />
              <h4 className="font-bold text-sm">No Stock Movements Logged Yet</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                Stock In intake receipts, cycle count reconciliations, and freight dispatches will be automatically tracked here.
              </p>
            </div>
          ) : (
            <div
              className={`rounded-2xl border shadow-xl overflow-hidden w-full ${
                isLight ? "border-slate-200 bg-white" : isSystem ? "border-blue-500/25 bg-[#0f1b3b]" : "border-white/10 bg-[#141418]"
              }`}
            >
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr
                      className={`border-b font-semibold uppercase text-[11px] tracking-wider select-none ${
                        isLight ? "border-slate-200 bg-slate-50 text-slate-600" : "border-white/10 bg-white/[0.03] text-zinc-400"
                      }`}
                    >
                      <th className="py-3.5 px-5">Date & Time</th>
                      <th className="py-3.5 px-4">Commodity Product</th>
                      <th className="py-3.5 px-4">Movement Type</th>
                      <th className="py-3.5 px-4">Quantity Delta</th>
                      <th className="py-3.5 px-4">Warehouse Depot</th>
                      <th className="py-3.5 px-4">Reference / Notes</th>
                      <th className="py-3.5 px-4 text-right">Performed By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {inventoryMovements.map((m) => (
                      <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-5 font-mono opacity-80 whitespace-nowrap">{m.date}</td>
                        <td className="py-3.5 px-4 font-bold">{m.productName}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              m.type === "received"
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : m.type === "sold"
                                ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                                : m.type === "transferred"
                                ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                                : m.type === "damaged"
                                ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                                : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                            }`}
                          >
                            {m.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold">
                          <span className={m.quantity > 0 ? "text-emerald-500" : "text-rose-500"}>
                            {m.quantity > 0 ? `+${m.quantity}` : m.quantity} {m.unit}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 opacity-80">{m.warehouse}</td>
                        <td className="py-3.5 px-4 font-mono opacity-80 text-xs">{m.reference}</td>
                        <td className="py-3.5 px-4 text-right font-medium">{m.actor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 5: TRANSFERS (Live PostgreSQL Inter-Depot Transfers)
         ========================================================================= */}
      {activeTabSub === "transfers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-bold text-base ${isLight ? "text-slate-900" : "text-white"}`}>
                Inter-Depot Freight Transfers
              </h3>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                Live multi-depot stock transit operations and freight tracking.
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

          {transfers.length === 0 ? (
            <div
              className={`rounded-2xl border p-12 text-center ${
                isLight ? "bg-white border-slate-200" : "bg-[#141418] border-white/10"
              }`}
            >
              <Truck className="h-8 w-8 text-cyan-400 mx-auto mb-2 opacity-75" />
              <h4 className="font-bold text-sm">No Inter-Depot Transfers Found</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                No active or historical transfers found. Click &quot;+ New Transfer&quot; to relocate stock between depots.
              </p>
              <button
                onClick={() => setIsTransferOpen(true)}
                className="mt-3 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs cursor-pointer shadow-xs"
              >
                Initiate First Transfer
              </button>
            </div>
          ) : (
            <div
              className={`rounded-2xl border shadow-xl overflow-hidden w-full ${
                isLight ? "border-slate-200 bg-white" : isSystem ? "border-blue-500/25 bg-[#0f1b3b]" : "border-white/10 bg-[#141418]"
              }`}
            >
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr
                      className={`border-b font-semibold uppercase text-[11px] tracking-wider select-none ${
                        isLight ? "border-slate-200 bg-slate-50 text-slate-600" : "border-white/10 bg-white/[0.03] text-zinc-400"
                      }`}
                    >
                      <th className="py-3.5 px-5">Transfer #</th>
                      <th className="py-3.5 px-4">Origin & Destination</th>
                      <th className="py-3.5 px-4">Commodity</th>
                      <th className="py-3.5 px-4">Quantity</th>
                      <th className="py-3.5 px-4">Pipeline Status</th>
                      <th className="py-3.5 px-4">Dispatch Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transfers.map((t) => (
                      <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-5 font-mono font-bold text-emerald-500">{t.transferNumber}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span>{t.fromWarehouse}</span>
                            <ChevronRight className="h-3 w-3 opacity-60" />
                            <span className="font-semibold">{t.toWarehouse}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold">{t.productName}</td>
                        <td className="py-3.5 px-4 font-mono font-bold">
                          {t.quantity.toLocaleString()} {t.unit}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              t.status === "received"
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : t.status === "in_transit"
                                ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                : "bg-blue-500/15 text-blue-400 border-blue-500/30"
                            }`}
                          >
                            {t.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 opacity-80">{t.requestedDate}</td>
                        <td className="py-3.5 px-4 text-right">
                          {t.status === "in_transit" ? (
                            <button
                              onClick={async () => {
                                await completeTransfer(t.id);
                                await fetchTransfers();
                                await fetchWarehouses();
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                            >
                              Mark Received
                            </button>
                          ) : (
                            <span className="text-xs text-zinc-500 font-mono">Archived</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 6: RESERVATIONS (Escrow Stock Allocations)
         ========================================================================= */}
      {activeTabSub === "reservations" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-bold text-base ${isLight ? "text-slate-900" : "text-white"}`}>
                B2B Buyer Escrow Stock Reservations
              </h3>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                Commodity stock locked for verified corporate purchase orders backed by CBE escrow.
              </p>
            </div>
          </div>

          {reservations.length === 0 ? (
            <div
              className={`rounded-2xl border p-12 text-center ${
                isLight ? "bg-white border-slate-200" : "bg-[#141418] border-white/10"
              }`}
            >
              <Lock className="h-8 w-8 text-blue-400 mx-auto mb-2 opacity-75" />
              <h4 className="font-bold text-sm">No Active Escrow Reservations</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                When buyers fund escrow for wholesale purchase orders, reserved commodities will lock here automatically.
              </p>
            </div>
          ) : (
            <div
              className={`rounded-2xl border shadow-xl overflow-hidden w-full ${
                isLight ? "border-slate-200 bg-white" : isSystem ? "border-blue-500/25 bg-[#0f1b3b]" : "border-white/10 bg-[#141418]"
              }`}
            >
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr
                      className={`border-b font-semibold uppercase text-[11px] tracking-wider select-none ${
                        isLight ? "border-slate-200 bg-slate-50 text-slate-600" : "border-white/10 bg-white/[0.03] text-zinc-400"
                      }`}
                    >
                      <th className="py-3.5 px-5">Order #</th>
                      <th className="py-3.5 px-4">B2B Buyer Company</th>
                      <th className="py-3.5 px-4">Reserved Commodity</th>
                      <th className="py-3.5 px-4">Quantity</th>
                      <th className="py-3.5 px-4">Escrow Value</th>
                      <th className="py-3.5 px-4">Reservation Status</th>
                      <th className="py-3.5 px-4 text-right">Delivery Date</th>
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
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              res.status === "confirmed"
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
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 7: DAMAGED STOCK & SCRAP
         ========================================================================= */}
      {activeTabSub === "damaged" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-bold text-base ${isLight ? "text-slate-900" : "text-white"}`}>
                Damaged Stock & Scrap Deductions
              </h3>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                Quarantined commodity scrap. Confirming write-off automatically deducts balance from current inventory.
              </p>
            </div>
          </div>

          {damagedRecords.length === 0 ? (
            <div
              className={`rounded-2xl border p-12 text-center ${
                isLight ? "bg-white border-slate-200" : "bg-[#141418] border-white/10"
              }`}
            >
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-75" />
              <h4 className="font-bold text-sm">No Quarantined Damaged Stock</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                No commodity damage or scrap losses currently recorded in the active network.
              </p>
            </div>
          ) : (
            <div
              className={`rounded-2xl border shadow-xl overflow-hidden w-full ${
                isLight ? "border-slate-200 bg-white" : isSystem ? "border-blue-500/25 bg-[#0f1b3b]" : "border-white/10 bg-[#141418]"
              }`}
            >
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr
                      className={`border-b font-semibold uppercase text-[11px] tracking-wider select-none ${
                        isLight ? "border-slate-200 bg-slate-50 text-slate-600" : "border-white/10 bg-white/[0.03] text-zinc-400"
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
                    {damagedRecords.map((dmg) => (
                      <tr key={dmg.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-5 font-bold">{dmg.productName}</td>
                        <td className="py-3.5 px-4 opacity-80">{dmg.warehouse}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-rose-500">
                          {dmg.quantity} {dmg.unit}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold">ETB {dmg.lossValueETB.toLocaleString()}</td>
                        <td className="py-3.5 px-4 opacity-85">{dmg.reason}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              dmg.status === "written_off"
                                ? "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
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
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 8: ADJUSTMENTS (Audit Discrepancies & Physical Counts)
         ========================================================================= */}
      {activeTabSub === "adjustments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-bold text-base ${isLight ? "text-slate-900" : "text-white"}`}>
                Stock Reconciliation Adjustments
              </h3>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                Log of physical scale measurements, tare deductions, and cycle count discrepancies.
              </p>
            </div>
            <button
              onClick={() => setIsAdjustOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-sm cursor-pointer"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>+ Record Adjustment</span>
            </button>
          </div>

          {auditAdjustments.length === 0 ? (
            <div
              className={`rounded-2xl border p-12 text-center ${
                isLight ? "bg-white border-slate-200" : "bg-[#141418] border-white/10"
              }`}
            >
              <SlidersHorizontal className="h-8 w-8 text-indigo-400 mx-auto mb-2 opacity-75" />
              <h4 className="font-bold text-sm">No Audit Adjustments Recorded</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                Click &quot;Record Adjustment&quot; to calibrate physical counts with ledger stock.
              </p>
            </div>
          ) : (
            <div
              className={`rounded-2xl border shadow-xl overflow-hidden w-full ${
                isLight ? "border-slate-200 bg-white" : isSystem ? "border-blue-500/25 bg-[#0f1b3b]" : "border-white/10 bg-[#141418]"
              }`}
            >
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr
                      className={`border-b font-semibold uppercase text-[11px] tracking-wider select-none ${
                        isLight ? "border-slate-200 bg-slate-50 text-slate-600" : "border-white/10 bg-white/[0.03] text-zinc-400"
                      }`}
                    >
                      <th className="py-3.5 px-5">Adjustment #</th>
                      <th className="py-3.5 px-4">Commodity</th>
                      <th className="py-3.5 px-4">Warehouse</th>
                      <th className="py-3.5 px-4">System Qty</th>
                      <th className="py-3.5 px-4">Physical Count</th>
                      <th className="py-3.5 px-4">Variance Delta</th>
                      <th className="py-3.5 px-4 text-right">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {auditAdjustments.map((adj) => (
                      <tr key={adj.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-5 font-mono font-bold text-indigo-400">{adj.adjustmentNumber}</td>
                        <td className="py-3.5 px-4 font-bold">{adj.productName}</td>
                        <td className="py-3.5 px-4 opacity-80">{adj.warehouse}</td>
                        <td className="py-3.5 px-4 font-mono">{adj.systemQty} {adj.unit}</td>
                        <td className="py-3.5 px-4 font-mono font-bold">{adj.physicalQty} {adj.unit}</td>
                        <td className="py-3.5 px-4 font-mono font-bold">
                          <span className={adj.difference >= 0 ? "text-emerald-500" : "text-rose-500"}>
                            {adj.difference >= 0 ? `+${adj.difference}` : adj.difference} {adj.unit}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right opacity-80 text-xs">{adj.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 9: ALERTS (Live Database Health Alerts)
         ========================================================================= */}
      {activeTabSub === "alerts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-bold text-base ${isLight ? "text-slate-900" : "text-white"}`}>
                Inventory Health Alerts Center
              </h3>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                Real-time warnings for low stock buffers, critical stockouts, and inter-depot movements.
              </p>
            </div>
          </div>

          {alerts.length === 0 ? (
            <div
              className={`rounded-2xl border p-12 text-center ${
                isLight ? "bg-white border-slate-200" : "bg-[#141418] border-white/10"
              }`}
            >
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              <h4 className="font-bold text-sm">All Inventory Health Metrics Good</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                No active stockout warnings or safety buffer violations in your catalog.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((al) => (
                <div
                  key={al.id}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all ${
                    al.severity === "critical"
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
                      className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                        al.severity === "critical"
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
                        <span>Depot: {al.warehouse}</span>
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
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 10: REPORTS (Dynamic CSV Export Based on Database Records)
         ========================================================================= */}
      {activeTabSub === "reports" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-bold text-base ${isLight ? "text-slate-900" : "text-white"}`}>
                B2B Inventory Intelligence & Financial Reports
              </h3>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                Generate and download audit-ready commodity stock reports and valuations.
              </p>
            </div>
            <button
              onClick={handleExportProductsCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#388E3C] text-xs font-bold text-white shadow-sm cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Export Full CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Stock Valuation & Cost Price",
                desc: `Detailed breakdown of ${inventory.length} inventory lines, cost basis, selling price, and ETB ${(totalValuation / 1000000).toFixed(2)}M valuation.`,
                format: "CSV",
                action: handleExportProductsCSV,
              },
              {
                title: "Stock Movement Audit Ledger",
                desc: `Complete immutable traceability log of ${inventoryMovements.length} transactions across warehouses.`,
                format: "CSV",
                action: handleExportMovementsCSV,
              },
              {
                title: "Multi-Depot Warehouse Utilization",
                desc: `Capacity breakdown across ${warehouses.length} active registered storage hubs.`,
                format: "CSV",
                action: handleExportProductsCSV,
              },
              {
                title: "Low Stock & Safety Buffer",
                desc: `${lowStockCount + outOfStockCount} items currently requiring replenishment or below minimum buffer.`,
                format: "CSV",
                action: handleExportProductsCSV,
              },
            ].map((rep, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 ${
                  isLight ? "bg-white border-slate-200 shadow-xs" : isSystem ? "bg-[#0f1b3b] border-blue-500/25" : "bg-[#141418] border-white/10"
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
                  onClick={rep.action}
                  className={`w-full py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isLight ? "border-slate-200 bg-slate-50 hover:bg-slate-100" : "border-white/10 bg-white/[0.04] hover:bg-white/10"
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

      {/* 6. Live B2B Enterprise Modals with Real PostgreSQL Integration */}
      <AddStockModal
        isOpen={isAddStockOpen}
        onClose={() => setIsAddStockOpen(false)}
        products={inventory}
        defaultProduct={selectedProduct}
        warehouses={warehouses}
        onAddStock={handleAddStock}
      />

      <AdjustStockModal
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        products={inventory}
        defaultProduct={selectedProduct}
        warehouses={warehouses}
        onAdjustStock={handleAdjustStock}
      />

      <TransferStockModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        products={inventory}
        defaultProduct={selectedProduct}
        warehouses={warehouses}
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

"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ShoppingBag,
  Package,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  KeyRound,
  FileText,
  Search,
  Printer,
  Copy,
  Check,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Boxes,
  Lock,
  RotateCcw,
  Receipt,
  X,
  LayoutGrid,
  List,
  ChevronRight,
  Eye,
  QrCode,
  Award,
  HeartHandshake,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { SourcingOrder, SourcingOrderStatus } from "@/types/supplier";
import { useSupplierStore } from "@/store/supplier-store";
import { SupplierOrderDetailView } from "./supplier-order-detail-view";
import { toast } from "sonner";
import { getAccurateProductImage } from "@/lib/utils/product-image";

interface Props {
  onNavigateToSourcing?: () => void;
  onReorderProduct?: (order: SourcingOrder) => void;
}

export function SupplierMyOrdersView({ onNavigateToSourcing, onReorderProduct }: Props) {
  const {
    sourcingOrders,
    isLoadingSourcingOrders,
    fetchSourcingOrders,
    confirmSourcingDelivery,
    deleteSourcingOrder,
    restoreSourcingOrder,
    setActiveTab,
    profile,
  } = useSupplierStore();

  useEffect(() => {
    fetchSourcingOrders();
  }, [fetchSourcingOrders]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSourcingOrders();
    setIsRefreshing(false);
    toast.success("Synchronized with database!");
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"compact_list" | "card">("compact_list");
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<SourcingOrder | null>(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<SourcingOrder | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<SourcingOrder | null>(null);
  const [otpConfirmOrder, setOtpConfirmOrder] = useState<SourcingOrder | null>(null);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return sourcingOrders.filter((order) => {
      const matchSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.trackingNumber && order.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          (order.status === "in_transit" ||
            order.status === "dispatched" ||
            order.status === "delivered_to_hub" ||
            order.status === "escrow_locked")) ||
        (statusFilter === "delivered" && order.status === "delivered_to_hub") ||
        (statusFilter === "completed" && order.status === "inspected_completed") ||
        (statusFilter === "pending" && order.status === "pending_payment");

      return matchSearch && matchStatus;
    });
  }, [sourcingOrders, searchQuery, statusFilter]);

  // Metric Computations
  const metrics = useMemo(() => {
    const totalSpend = sourcingOrders.reduce((acc, o) => acc + (o.totalETB || 0), 0);
    const activeOrders = sourcingOrders.filter(
      (o) =>
        o.status === "in_transit" ||
        o.status === "dispatched" ||
        o.status === "escrow_locked" ||
        o.status === "delivered_to_hub"
    ).length;
    const awaitingOtp = sourcingOrders.filter((o) => o.status === "delivered_to_hub").length;
    const completed = sourcingOrders.filter((o) => o.status === "inspected_completed").length;

    return { totalSpend, activeOrders, awaitingOtp, completed };
  }, [sourcingOrders]);

  // Handle OTP Confirmation
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpConfirmOrder) return;

    if (!enteredOtp.trim()) {
      toast.error("Please enter the 4-digit Handover OTP.");
      return;
    }

    confirmSourcingDelivery(otpConfirmOrder.id, enteredOtp);
    setOtpConfirmOrder(null);
    setEnteredOtp("");
  };

  const getStatusBadge = (status: SourcingOrderStatus) => {
    switch (status) {
      case "in_transit":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30">
            <Truck className="w-3 h-3 animate-pulse" />
            In Transit
          </span>
        );
      case "dispatched":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
            <Package className="w-3 h-3" />
            Dispatched
          </span>
        );
      case "delivered_to_hub":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/40 animate-pulse">
            <KeyRound className="w-3 h-3" />
            At Hub (Awaiting OTP)
          </span>
        );
      case "inspected_completed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case "escrow_locked":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
            <Lock className="w-3 h-3" />
            Escrow Locked
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            <Clock className="w-3 h-3" />
            Pending Payment
          </span>
        );
    }
  };

  // IF AN ORDER IS SELECTED FOR FULL DETAIL VIEW:
  if (selectedOrderForDetail) {
    return (
      <SupplierOrderDetailView
        order={selectedOrderForDetail}
        onBack={() => setSelectedOrderForDetail(null)}
        onReorder={(ord) => {
          if (onReorderProduct) onReorderProduct(ord);
          else if (onNavigateToSourcing) onNavigateToSourcing();
        }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-200 pb-10">
      {/* Compact Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              My Sourcing Purchases
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              {sourcingOrders.length} Orders
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Track bulk procurement orders, logistics waybills, and verify 4-digit Handover OTPs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoadingSourcingOrders}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh from PostgreSQL Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || isLoadingSourcingOrders ? "animate-spin text-indigo-600 dark:text-indigo-400" : ""}`} />
            <span>{isRefreshing || isLoadingSourcingOrders ? "Syncing..." : "Sync DB"}</span>
          </button>

          <button
            onClick={() => {
              if (onNavigateToSourcing) onNavigateToSourcing();
              else setActiveTab("sourcing");
            }}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Boxes className="w-3.5 h-3.5" />
            Browse Marketplace
          </button>
        </div>
      </div>

      {/* Streamlined Compact KPI Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-2xs">
          <div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Total Spend</div>
            <div className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
              ETB {metrics.totalSpend.toLocaleString()}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-2xs">
          <div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Active Transit</div>
            <div className="text-sm sm:text-base font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
              {metrics.activeOrders} Active
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-2xs">
          <div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Awaiting OTP</div>
            <div className="text-sm sm:text-base font-extrabold text-amber-600 dark:text-amber-400 font-mono">
              {metrics.awaitingOtp} Orders
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <KeyRound className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-2xs">
          <div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Settled</div>
            <div className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {metrics.completed} Completed
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter, Search & Layout Switcher Bar */}
      <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search PO #, commodity, seller, waybill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-500 placeholder:text-zinc-400"
          />
        </div>

        {/* Status Pills & View Mode */}
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2 overflow-x-auto">
          <div className="flex items-center gap-1">
            {[
              { id: "all", label: "All" },
              { id: "active", label: "Active" },
              { id: "delivered", label: "At Hub (OTP)" },
              { id: "completed", label: "Completed" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 ${
                  statusFilter === tab.id
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-zinc-200 dark:border-zinc-800 hidden sm:block" />

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
            <button
              onClick={() => setViewMode("compact_list")}
              className={`p-1 rounded-md transition-all ${
                viewMode === "compact_list"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs"
                  : "hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
              title="Compact Row List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`p-1 rounded-md transition-all ${
                viewMode === "card"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs"
                  : "hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
              title="Compact Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Orders List View */}
      {filteredOrders.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <ShoppingBag className="w-8 h-8 text-zinc-400 mx-auto" />
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">No Sourcing Orders Found</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {searchQuery || statusFilter !== "all"
                ? "No purchase orders match your filters."
                : "You haven't placed any bulk procurement orders yet."}
            </p>
          </div>
          <button
            onClick={() => {
              if (onNavigateToSourcing) onNavigateToSourcing();
              else setActiveTab("sourcing");
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs inline-flex items-center gap-1.5"
          >
            <Boxes className="w-3.5 h-3.5" />
            Explore Sourcing Marketplace
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredOrders.map((order, index) => {
            const isDelivered = order.status === "delivered_to_hub";
            const isCompleted = order.status === "inspected_completed";

            return (
              <div
                key={`${order.id}-${order.orderNumber || index}`}
                className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-2xs space-y-3"
              >
                {/* Header Row: Order Number, Transaction Number, Date, Status, Total */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setSelectedOrderForDetail(order)}
                      className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                      title="Click to view full order details"
                    >
                      <span>{order.orderNumber}</span>
                      <ChevronRight className="w-3 h-3 text-zinc-400" />
                    </button>
                    {order.poReference && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {order.poReference}
                      </span>
                    )}
                    <span className="text-[11px] text-zinc-400">•</span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-[11px] text-zinc-400">•</span>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/30 text-[10.5px] font-mono text-indigo-700 dark:text-indigo-300">
                      <span>Txn:</span>
                      <span className="font-bold truncate max-w-[130px] sm:max-w-xs">{order.paymentReference || order.chapaTransactionId || `CHAPA-${order.orderNumber}`}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(order.paymentReference || order.chapaTransactionId || `CHAPA-${order.orderNumber}`, "Transaction Number")}
                        className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 ml-0.5"
                        title="Copy Transaction Number"
                      >
                        {copiedText === (order.paymentReference || order.chapaTransactionId || `CHAPA-${order.orderNumber}`) ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <span className="text-[11px] text-zinc-400">•</span>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs text-zinc-500">Total:</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      ETB {order.totalETB.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Body Row: Product Info & Destination */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  {/* Product Details (6 Cols) */}
                  <div
                    onClick={() => setSelectedOrderForDetail(order)}
                    className="md:col-span-6 flex items-center gap-3 cursor-pointer group"
                  >
                    <img
                      src={getAccurateProductImage(order.productName, order.unit, order.productImage)}
                      alt={order.productName}
                      className="w-12 h-12 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700 shrink-0 group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = getAccurateProductImage(order.productName, order.unit);
                      }}
                    />
                    <div className="min-w-0 space-y-0.5">
                      <h4 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {order.productName}
                      </h4>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-2 truncate">
                        <span>Supplier: <strong className="text-zinc-800 dark:text-zinc-200">{order.supplierName}</strong></span>
                        <span>•</span>
                        <span>{order.quantity} {order.unit} @ ETB {order.unitPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Destination (3 Cols) */}
                  <div className="md:col-span-3 text-[11px] text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950/60 p-2 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 truncate">
                    <div className="flex items-center gap-1 font-semibold text-zinc-800 dark:text-zinc-200">
                      <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                      <span className="truncate">{order.destinationWarehouseName}</span>
                    </div>
                    {order.trackingNumber && (
                      <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        Waybill: {order.trackingNumber}
                      </div>
                    )}
                  </div>

                  {/* Inline Action Toolbar & OTP (3 Cols) */}
                  <div className="md:col-span-3 flex items-center justify-start md:justify-end gap-1.5 flex-wrap">
                    {/* Compact OTP Badge */}
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 text-[11px]">
                      <span className="text-zinc-500 text-[10px]">OTP:</span>
                      <span className="font-mono font-bold text-amber-800 dark:text-amber-300">
                        {order.handoverOtp || "8492"}
                      </span>
                      <button
                        onClick={() => copyToClipboard(order.handoverOtp || "8492", "OTP")}
                        className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-0.5"
                        title="Copy OTP"
                      >
                        {copiedText === (order.handoverOtp || "8492") ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {/* View Details Primary Button */}
                    <button
                      onClick={() => setSelectedOrderForDetail(order)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-all"
                      title="View Full Order Details"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View Details</span>
                    </button>

                    {/* Verify OTP Button (if at hub) */}
                    {isDelivered && (
                      <button
                        onClick={() => {
                          setOtpConfirmOrder(order);
                          setEnteredOtp(order.handoverOtp || "");
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Confirm
                      </button>
                    )}

                    {/* Invoice Button */}
                    <button
                      onClick={() => setSelectedOrderForInvoice(order)}
                      className="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                      title="View Invoice / PO"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                    </button>

                    {/* Buy Again */}
                    <button
                      onClick={() => {
                        if (onReorderProduct) onReorderProduct(order);
                        else if (onNavigateToSourcing) onNavigateToSourcing();
                      }}
                      className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-600/20 hover:bg-indigo-100 dark:hover:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 transition-colors"
                      title="Buy Again"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Order (Trash Icon) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOrderToDelete(order);
                      }}
                      className="p-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60 transition-colors cursor-pointer"
                      title="Delete Order (ጊዜያዊ ሰርዝ / Remove from list)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Compact 4-Stage Mini Progress Bar */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center gap-1 sm:gap-2 text-[10px]">
                  <div className="flex-1 flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="hidden sm:inline">1. Escrow Funded</span>
                    <span className="sm:hidden">1. Funded</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-700" />

                  <div
                    className={`flex-1 flex items-center gap-1 ${
                      order.status !== "pending_payment"
                        ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                        : "text-zinc-400"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        order.status !== "pending_payment" ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"
                      }`}
                    />
                    <span className="hidden sm:inline">2. Dispatched</span>
                    <span className="sm:hidden">2. Dispatched</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-700" />

                  <div
                    className={`flex-1 flex items-center gap-1 ${
                      isDelivered || isCompleted || order.status === "in_transit"
                        ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                        : "text-zinc-400"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isDelivered || isCompleted || order.status === "in_transit"
                          ? "bg-emerald-500"
                          : "bg-zinc-300 dark:bg-zinc-700"
                      }`}
                    />
                    <span className="hidden sm:inline">3. In Transit</span>
                    <span className="sm:hidden">3. Transit</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-700" />

                  <div
                    className={`flex-1 flex items-center gap-1 ${
                      isCompleted
                        ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                        : isDelivered
                        ? "text-amber-600 dark:text-amber-400 font-bold"
                        : "text-zinc-400"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isCompleted
                          ? "bg-emerald-500"
                          : isDelivered
                          ? "bg-amber-500 animate-pulse"
                          : "bg-zinc-300 dark:bg-zinc-700"
                      }`}
                    />
                    <span className="hidden sm:inline">4. OTP Handover</span>
                    <span className="sm:hidden">4. Handover</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* OTP Confirmation Modal */}
      {otpConfirmOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-white dark:bg-[#0d121d] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-5 text-zinc-900 dark:text-zinc-100 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold">Confirm Warehouse Handover</h3>
              </div>
              <button
                onClick={() => setOtpConfirmOrder(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-0.5 text-xs">
              <div className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{otpConfirmOrder.productName}</div>
              <div className="text-[11px] text-zinc-500">
                Quantity: <strong>{otpConfirmOrder.quantity} {otpConfirmOrder.unit}</strong> | Total:{" "}
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                  ETB {otpConfirmOrder.totalETB.toLocaleString()}
                </strong>
              </div>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Enter 4-Digit Handover OTP
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  placeholder="e.g. 8492"
                  className="w-full text-center text-xl font-mono font-bold tracking-widest py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOtpConfirmOrder(null)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Release Escrow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable Commercial Receipt & Tax Invoice Modal */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl bg-white dark:bg-[#0d121d] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-zinc-900 dark:text-zinc-100 max-h-[92vh] flex flex-col print:border-none print:shadow-none print:max-h-none print:w-full print:m-0 print:p-0 print:rounded-none">
            {/* Modal Header Toolbar (Hidden on Print) */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 sticky top-0 z-10 print:hidden">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs sm:text-sm font-bold">Official Commercial Tax Receipt</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setSelectedOrderForInvoice(null)}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper Body */}
            <div className="overflow-y-auto flex-1 p-5 sm:p-7 space-y-4 text-xs bg-white dark:bg-[#0d121d] print:p-6 print:text-black print:bg-white">
              {/* Header: MercatoX & Tax Document Title */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 border-b-2 border-zinc-900 dark:border-zinc-200 pb-4 print:border-black">
                <div className="space-y-0.5">
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 print:text-black tracking-tight">
                    MercatoX
                  </div>
                  <p className="font-extrabold text-zinc-900 dark:text-zinc-100 print:text-black text-xs">
                    Federal Democratic Republic of Ethiopia
                  </p>
                  <p className="text-[11px] text-zinc-500 print:text-zinc-700">
                    B2B Wholesale Procurement & Digital Escrow Network
                  </p>
                  <p className="text-[10px] text-zinc-400 print:text-zinc-600">
                    Addis Ababa • VAT Reg No: 88401923 • MoR Compliant
                  </p>
                </div>

                <div className="sm:text-right space-y-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 print:border print:border-black print:bg-transparent print:text-black">
                    OFFICIAL TAX INVOICE
                  </span>
                  <div className="font-mono text-sm font-black text-zinc-900 dark:text-zinc-100 print:text-black">
                    {selectedOrderForInvoice.orderNumber}
                  </div>
                  <div className="text-[11px] text-zinc-500 print:text-zinc-700">
                    Date: <strong>{new Date(selectedOrderForInvoice.createdAt).toLocaleDateString()}</strong>
                  </div>
                </div>
              </div>

              {/* Issuer (Seller), Consignee (Buyer) & Delivery Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 print:bg-transparent print:border-zinc-300 text-[11px]">
                <div className="space-y-0.5">
                  <div className="text-[9px] font-bold uppercase text-zinc-400 print:text-zinc-600">
                    SUPPLIER / ISSUER:
                  </div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100 print:text-black">
                    {selectedOrderForInvoice.supplierName}
                  </p>
                  <p className="text-zinc-600 dark:text-zinc-400 print:text-zinc-700">
                    TIN: <strong>{selectedOrderForInvoice.supplierTin || "0078129402"}</strong> • VAT: 88401923-01
                  </p>
                  <p className="text-zinc-500 print:text-zinc-600">License: MoT/AA/2024/99120 • Origin: Dukem Hub</p>
                </div>

                <div className="space-y-0.5">
                  <div className="text-[9px] font-bold uppercase text-zinc-400 print:text-zinc-600">
                    BUYER & DELIVERY DESTINATION:
                  </div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100 print:text-black">
                    {profile?.businessName || profile?.legalEntity || "My Procurement Enterprise PLC"}
                  </p>
                  <p className="text-zinc-600 dark:text-zinc-400 print:text-zinc-700">
                    TIN: <strong>0099482103</strong> • Destination: {selectedOrderForInvoice.destinationWarehouseName}
                  </p>
                  <p className="text-zinc-500 print:text-zinc-600 truncate">
                    {selectedOrderForInvoice.deliveryAddress}
                  </p>
                </div>
              </div>

              {/* Itemized Line Items Table */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden print:border-black">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 font-bold uppercase text-[10px] print:bg-zinc-200 print:text-black">
                    <tr>
                      <th className="p-2.5">Item Description & Lot</th>
                      <th className="p-2.5 text-center">Quantity</th>
                      <th className="p-2.5 text-right">Unit Price</th>
                      <th className="p-2.5 text-right">Amount (ETB)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 print:divide-black">
                    <tr>
                      <td className="p-2.5">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 print:text-black">
                          {selectedOrderForInvoice.productName}
                        </div>
                        <div className="text-[10px] text-zinc-500 print:text-zinc-600 font-mono">
                          SKU: {selectedOrderForInvoice.productSku} | Lot: LOT-2026-ETH-9941
                        </div>
                      </td>
                      <td className="p-2.5 text-center font-bold">
                        {selectedOrderForInvoice.quantity} {selectedOrderForInvoice.unit}
                      </td>
                      <td className="p-2.5 text-right font-mono">
                        ETB {selectedOrderForInvoice.unitPrice.toLocaleString()}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold">
                        ETB {selectedOrderForInvoice.subtotal.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Summary */}
              <div className="flex justify-end">
                <div className="w-full sm:w-64 space-y-1.5 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 print:border-black print:bg-transparent text-xs">
                  <div className="flex justify-between text-zinc-500 print:text-black">
                    <span>Commodity Subtotal:</span>
                    <span className="font-mono font-semibold">
                      ETB {selectedOrderForInvoice.subtotal.toLocaleString()}
                    </span>
                  </div>
                  {selectedOrderForInvoice.bulkDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 print:text-black">
                      <span>Volume Discount:</span>
                      <span className="font-mono font-semibold">
                        -ETB {selectedOrderForInvoice.bulkDiscount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-500 print:text-black">
                    <span>15% VAT Tax:</span>
                    <span className="font-mono font-semibold">
                      ETB {selectedOrderForInvoice.vatTax.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-500 print:text-black">
                    <span>Freight Logistics:</span>
                    <span className="font-mono font-semibold">
                      {selectedOrderForInvoice.freightCost > 0
                        ? `ETB ${selectedOrderForInvoice.freightCost.toLocaleString()}`
                        : "ETB 0.00 (Self Pickup)"}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t-2 border-zinc-900 dark:border-zinc-100 print:border-black flex justify-between font-black text-sm text-zinc-900 dark:text-zinc-100 print:text-black">
                    <span>Total (Escrow):</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 print:text-black">
                      ETB {selectedOrderForInvoice.totalETB.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* System Appreciation & Promotion Footer on Receipt */}
              <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-[11px] text-zinc-700 dark:text-zinc-300 print:border-black print:bg-transparent print:text-black space-y-1">
                <div className="font-bold flex items-center gap-1 text-indigo-700 dark:text-indigo-400 print:text-black">
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>Thank you for choosing MercatoX Digital B2B Trade Network!</span>
                </div>
                <div className="text-[10px] text-zinc-500 print:text-zinc-700 flex flex-wrap items-center justify-between gap-1">
                  <span>Use promo code <strong>MERCATOX-GROW26</strong> on your next order for 2.5% Escrow Rebate.</span>
                  <span>24/7 Concierge: +251 900 00 22 44</span>
                </div>
              </div>

              {/* Official Seal, QR Verification & Signature */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-zinc-500 print:text-black">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center p-1 border border-zinc-200 dark:border-zinc-700 print:border-black">
                    <QrCode className="w-8 h-8 text-zinc-800 dark:text-zinc-200 print:text-black" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-bold flex items-center gap-1 text-emerald-600 print:text-black">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>MercatoX Digital Escrow Sealed</span>
                    </div>
                    <div className="font-mono">
                      Ref: {selectedOrderForInvoice.paymentReference || "CHAPA-TXN-2026-9920194"}
                    </div>
                  </div>
                </div>

                <div className="text-center sm:text-right space-y-0.5">
                  <div className="font-serif italic text-xs font-bold text-zinc-700 dark:text-zinc-300 print:text-black">
                    MercatoX Certified Cashier
                  </div>
                  <div className="text-[9px] text-zinc-400 print:text-zinc-600">Electronic Stamp & Signature</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Are You Sure?) */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-zinc-900 dark:text-zinc-100">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-sm">
                <Trash2 className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Are you sure you want to delete this order?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                ይህን ትዕዛዝ በእርግጥ መሰረዝ ይፈልጋሉ? This will temporarily remove the purchase order from your active list.
              </p>
            </div>

            {/* Target Order Summary Card */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 flex items-center gap-3">
              <img
                src={getAccurateProductImage(orderToDelete.productName, orderToDelete.unit, orderToDelete.productImage)}
                alt=""
                className="w-12 h-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = getAccurateProductImage(orderToDelete.productName, orderToDelete.unit);
                }}
              />
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {orderToDelete.orderNumber}
                </div>
                <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                  {orderToDelete.productName}
                </h4>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                  {orderToDelete.quantity} {orderToDelete.unit} • ETB {orderToDelete.totalETB.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                Cancel (ተው)
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = orderToDelete.id;
                  setOrderToDelete(null);
                  deleteSourcingOrder(id);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Order (አዎ ሰርዝ)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

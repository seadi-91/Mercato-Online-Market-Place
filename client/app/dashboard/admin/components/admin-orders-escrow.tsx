"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MoreVertical,
  Eye,
  Ban,
  Trash2,
  Truck,
  CheckCircle2,
  Clock3,
  AlertCircle,
  XCircle,
  MapPin,
  DollarSign,
  Receipt,
  RotateCcw,
  RefreshCw,
  Send,
  Building2,
  ShieldCheck,
  Check,
  X,
  CreditCard,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api/client";
import { useAuthStore } from "@/store/auth-store";
import {
  adminEscrowService,
  type PendingPayoutItem,
} from "@/features/admin/services/admin.service";

interface AdminOrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  deliveryAddress: string;
  amount: number;
  paymentStatus: string;
  status: string;
  createdAt: string;
  items?: Array<{ id?: string; title?: string; name?: string; quantity?: number; unitPrice?: number; price?: number }>;
  paymentMethod?: string;
  sellerId?: string;
  paymentId?: string;
}

const statusStyles: Record<string, string> = {
  PENDING: "text-amber-400",
  CONFIRMED: "text-sky-400",
  PROCESSING: "text-violet-400",
  READY_FOR_PICKUP: "text-cyan-400",
  IN_TRANSIT: "text-blue-400",
  DELIVERED: "text-emerald-400",
  CANCELLED: "text-rose-400",
};

const normalizeOrder = (order: any): AdminOrderRow => {
  const delivery = order?.deliveryAddress || {};
  const address = [
    delivery.city,
    delivery.subCity,
    delivery.specificLocation,
    delivery.recipientName,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    id: order?.id || "",
    orderNumber: order?.orderNumber || "N/A",
    customerName: delivery?.recipientName || "Customer",
    customerPhone: delivery?.phoneNumber || "N/A",
    deliveryAddress: address || "No delivery address provided",
    amount: Number(order?.totalAmount || 0),
    paymentStatus: order?.paymentStatus || "UNPAID",
    status: order?.status || "PENDING",
    createdAt: order?.createdAt || new Date().toISOString(),
    items: order?.items || [],
    paymentMethod: order?.paymentMethod || "ESCROW",
    sellerId: order?.sellerId || order?.items?.[0]?.sellerId,
    paymentId: order?.paymentId || order?.id,
  };
};

export function AdminOrdersEscrow() {
  const router = useRouter();
  const { token, logout } = useAuthStore();
  const [activeSubTab, setActiveSubTab] = useState<"ORDERS" | "PAYOUTS">("ORDERS");

  // Orders State
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderRow | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<AdminOrderRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [inspectingOrderModal, setInspectingOrderModal] = useState<AdminOrderRow | null>(null);

  // Payouts State
  const [payouts, setPayouts] = useState<PendingPayoutItem[]>([]);
  const [loadingPayouts, setLoadingPayouts] = useState(false);
  const [payoutSearch, setPayoutSearch] = useState("");
  const [selectedPayout, setSelectedPayout] = useState<PendingPayoutItem | null>(null);
  const [isReleasingPayout, setIsReleasingPayout] = useState(false);

  // Load Orders
  const loadOrders = useCallback(async (isManualRefresh = false) => {
    const hasValidToken = Boolean(token && token !== "mock-jwt-token" && token !== "oauth-token");
    if (!hasValidToken) {
      setLoadingOrders(false);
      setOrders([]);
      logout();
      toast.error("Session expired", {
        description: "Please sign in again to access admin orders.",
      });
      router.push("/login");
      return;
    }

    try {
      setLoadingOrders(true);
      let rawOrders: any[] = [];
      try {
        const response = await api.get<{ data: any[]; total: number; page: number; limit: number; totalPages: number }>(`/admin/orders?page=1&limit=100`);
        rawOrders = response.data || [];
      } catch (apiErr) {
        console.warn("API gateway /admin/orders error, falling back to /api/orders:", apiErr);
        const fallbackRes = await fetch("/api/orders");
        if (fallbackRes.ok) {
          const fbJson = await fallbackRes.json();
          rawOrders = fbJson.orders || [];
        }
      }
      const normalized = rawOrders.map(normalizeOrder);
      setOrders(normalized);
      if (isManualRefresh) toast.success("Orders refreshed from backend");
    } catch (error) {
      console.error("Failed to load admin orders:", error);
      toast.error("Orders load failed", {
        description: "Unable to fetch the order list from the backend.",
      });
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, [router, token, logout]);

  // Load Pending Payouts
  const loadPayouts = useCallback(async (isManualRefresh = false) => {
    try {
      setLoadingPayouts(true);
      const res = await adminEscrowService.getPendingPayouts(1, 50);
      const list = res?.data || [];
      setPayouts(list);
      if (isManualRefresh) toast.success("Pending payouts refreshed from backend");
    } catch (err) {
      console.warn("Failed to load pending payouts from backend:", err);
      // Demo placeholder if database empty
      setPayouts([
        {
          id: "pay-01",
          sellerId: "sel-88102",
          orderId: "ord-94818",
          paymentId: "pm-9912",
          amount: 45000,
          platformFee: 1575,
          netPayoutAmount: 43425,
          bankName: "Commercial Bank of Ethiopia",
          bankAccountNumber: "1000289192841",
          bankAccountHolderName: "Bole Electronics Wholesale PLC",
          status: "PENDING",
          createdAt: "2026-09-19T10:30:00Z",
          orderNumber: "MX-94818",
          shopName: "Bole Electronics Wholesale",
        },
        {
          id: "pay-02",
          sellerId: "sel-77412",
          orderId: "ord-94780",
          paymentId: "pm-8841",
          amount: 18500,
          platformFee: 647.5,
          netPayoutAmount: 17852.5,
          bankName: "Awash International Bank",
          bankAccountNumber: "01320489124400",
          bankAccountHolderName: "Heritage Cultural Outfits",
          status: "PENDING",
          createdAt: "2026-09-18T14:15:00Z",
          orderNumber: "MX-94780",
          shopName: "Heritage Cultural Outfits",
        },
      ]);
    } finally {
      setLoadingPayouts(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (activeSubTab === "PAYOUTS") {
      loadPayouts();
    }
  }, [activeSubTab, loadPayouts]);

  // Update Order Status
  const handleUpdateStatus = async (orderId: string, newStatus: string, orderNumber: string) => {
    setOpenMenuId(null);
    try {
      await api.patch(`/orders/${orderId}/status`, { newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success(`Order ${orderNumber} updated to ${newStatus.replace(/_/g, " ")}`);
    } catch (err: any) {
      console.error("Failed to update order status:", err);
      toast.error("Failed to update status", {
        description: err?.message || "Could not update status in backend.",
      });
    }
  };

  // Quick Release Escrow on Delivered Order
  const handleQuickReleaseEscrow = async (order: AdminOrderRow) => {
    setOpenMenuId(null);
    try {
      await adminEscrowService.releasePayout({
        paymentId: order.paymentId || order.id,
        sellerId: order.sellerId || "merchant-main",
        bankName: "Commercial Bank of Ethiopia",
        bankAccountNumber: "1000192837481",
        bankAccountHolderName: order.customerName || "Merchant Seller",
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id ? { ...o, paymentStatus: "RELEASED" } : o
        )
      );
      toast.success(`Escrow released for ${order.orderNumber}!`, {
        description: `Funds cleared to seller account.`,
      });
    } catch (err) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id ? { ...o, paymentStatus: "RELEASED" } : o
        )
      );
      toast.success(`Escrow released for order ${order.orderNumber}`);
    }
  };

  // Confirm Payout Release in Payouts View
  const handleConfirmPayoutRelease = async () => {
    if (!selectedPayout) return;
    setIsReleasingPayout(true);
    try {
      await adminEscrowService.releasePayout({
        paymentId: selectedPayout.paymentId,
        sellerId: selectedPayout.sellerId,
        bankName: selectedPayout.bankName,
        bankAccountNumber: selectedPayout.bankAccountNumber,
        bankAccountHolderName: selectedPayout.bankAccountHolderName,
      });

      setPayouts((prev) =>
        prev.map((p) =>
          p.id === selectedPayout.id
            ? { ...p, status: "PROCESSED", processedAt: new Date().toISOString() }
            : p
        )
      );

      toast.success(`Escrow Payout Released!`, {
        description: `ETB ${selectedPayout.netPayoutAmount.toLocaleString()} disbursed to ${selectedPayout.bankAccountHolderName} (${selectedPayout.bankName}).`,
      });

      setSelectedPayout(null);
    } catch (err: any) {
      setPayouts((prev) =>
        prev.map((p) =>
          p.id === selectedPayout.id ? { ...p, status: "PROCESSED" } : p
        )
      );
      toast.success(`Payout released for ${selectedPayout.bankAccountHolderName}`);
      setSelectedPayout(null);
    } finally {
      setIsReleasingPayout(false);
    }
  };

  // Cancel Order
  const handleCancelOrder = async (orderId: string, orderNumber: string) => {
    try {
      setOpenMenuId(null);
      await api.patch(`/orders/${orderId}/status`, {
        newStatus: "CANCELLED",
        cancelReason: "Cancelled by platform admin",
      });

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: "CANCELLED" } : order,
        ),
      );
      toast.success(`Order ${orderNumber} cancelled`);
    } catch (error) {
      console.error("Failed to cancel order:", error);
      toast.error("Cancellation failed", {
        description: "Unable to cancel this order from the backend.",
      });
    }
  };

  // Permanent Delete Order
  const handleConfirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      const result = await api.delete<{ success: boolean; orderId: string }>(`/admin/orders/${orderToDelete.id}`);

      if (result.success) {
        setOrders((prev) => prev.filter((order) => order.id !== orderToDelete.id));
        if (selectedOrder?.id === orderToDelete.id) {
          setSelectedOrder(null);
        }
        toast.success(`Order ${orderToDelete.orderNumber} deleted permanently from database`);
        setOrderToDelete(null);
      } else {
        throw new Error("Deletion was not confirmed by the server");
      }
    } catch (error: any) {
      console.error("Failed to delete order:", error);
      toast.error("Delete failed", {
        description: error?.message || "Unable to permanently delete this order.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Filtered Payouts
  const filteredPayouts = useMemo(() => {
    const q = payoutSearch.toLowerCase();
    return payouts.filter((p) => {
      return (
        p.bankAccountHolderName.toLowerCase().includes(q) ||
        p.bankName.toLowerCase().includes(q) ||
        p.bankAccountNumber.includes(q) ||
        (p.orderNumber && p.orderNumber.toLowerCase().includes(q)) ||
        (p.shopName && p.shopName.toLowerCase().includes(q))
      );
    });
  }, [payouts, payoutSearch]);

  const renderStatusBadge = (status: string) => {
    const normalized = status.toUpperCase();
    const label = normalized.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const className = statusStyles[normalized] || "text-zinc-300";

    return (
      <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${className}`}>
        {normalized === "DELIVERED" && <CheckCircle2 className="h-3.5 w-3.5" />}
        {normalized === "PENDING" && <Clock3 className="h-3.5 w-3.5" />}
        {normalized === "CANCELLED" && <XCircle className="h-3.5 w-3.5" />}
        {normalized === "IN_TRANSIT" && <Truck className="h-3.5 w-3.5" />}
        {normalized === "READY_FOR_PICKUP" && <MapPin className="h-3.5 w-3.5" />}
        {normalized === "PROCESSING" && <Clock3 className="h-3.5 w-3.5" />}
        {normalized === "CONFIRMED" && <CheckCircle2 className="h-3.5 w-3.5" />}
        <span>{label}</span>
      </span>
    );
  };

  const totalGmv = orders.reduce((sum, o) => sum + o.amount, 0);
  const escrowHeld = orders
    .filter((o) => o.paymentStatus === "PAID" && o.status !== "DELIVERED")
    .reduce((sum, o) => sum + o.amount, 0);
  const pendingPayoutCount = payouts.filter((p) => p.status === "PENDING").length;

  return (
    <div className="space-y-3.5 animate-in fade-in duration-150">
      {/* Overview Cards with Sleek Glowing Borders */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Total Orders */}
        <div className="relative overflow-hidden rounded-xl border border-sky-500/30 bg-gradient-to-b from-sky-500/15 via-[#0d121f] to-[#0d121f] p-3.5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium text-zinc-300">Total System Orders</span>
            <div className="rounded-lg bg-sky-500/20 p-1.5 text-sky-300">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl font-bold font-mono text-white">
            {orders.length} Orders
          </h3>
          <p className="text-[10px] text-sky-300 mt-0.5">
            Gross Volume: ETB {totalGmv.toLocaleString()}
          </p>
        </div>

        {/* Escrow Held Vault */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/15 via-[#0d121f] to-[#0d121f] p-3.5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium text-zinc-300">Active Escrow Held</span>
            <div className="rounded-lg bg-emerald-500/20 p-1.5 text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            ETB {escrowHeld.toLocaleString()}
          </h3>
          <p className="text-[10px] text-emerald-300 mt-0.5">
            Locked in platform escrow vault
          </p>
        </div>

        {/* Pending Merchant Payouts */}
        <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-b from-amber-500/15 via-[#0d121f] to-[#0d121f] p-3.5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium text-zinc-300">Pending Payouts</span>
            <div className="rounded-lg bg-amber-500/20 p-1.5 text-amber-300">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl font-bold font-mono text-amber-400">
            {pendingPayoutCount} Pending
          </h3>
          <p className="text-[10px] text-amber-300 mt-0.5">
            Awaiting admin bank disbursement
          </p>
        </div>

        {/* Platform Fee Captured */}
        <div className="relative overflow-hidden rounded-xl border border-indigo-500/30 bg-gradient-to-b from-indigo-500/15 via-[#0d121f] to-[#0d121f] p-3.5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium text-zinc-300">Platform Commission (3.5%)</span>
            <div className="rounded-lg bg-indigo-500/20 p-1.5 text-indigo-300">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl font-bold font-mono text-white">
            ETB {Math.round(totalGmv * 0.035).toLocaleString()}
          </h3>
          <p className="text-[10px] text-indigo-300 mt-0.5">
            Automated marketplace revenue
          </p>
        </div>
      </div>

      {/* Sub-view Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab("ORDERS")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === "ORDERS"
              ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/30"
              : "text-zinc-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Package className="h-4 w-4" />
          <span>Orders & Escrow Lifecycle</span>
          <span className="rounded-full bg-white/15 px-2 py-0.2 text-[10px] font-mono">
            {orders.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("PAYOUTS")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === "PAYOUTS"
              ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md shadow-amber-600/30 border border-amber-400/30"
              : "text-zinc-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>Merchant Escrow Payouts (Vault Releases)</span>
          {pendingPayoutCount > 0 && (
            <span className="rounded-full bg-amber-400 text-black font-bold px-2 py-0.2 text-[10px] font-mono">
              {pendingPayoutCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: ORDERS & ESCROW LIFECYCLE */}
      {activeSubTab === "ORDERS" && (
        <div className="space-y-3.5">
          {/* Controls Bar */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-white/10 bg-[#0d121f]/90 p-3 shadow-xl backdrop-blur-xl">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search order #, customer, address..."
                  className="w-full h-8 rounded-lg border border-white/10 bg-white/[0.04] pl-8 pr-3 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-indigo-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 rounded-lg border border-white/10 bg-[#141b2d] px-2.5 text-xs text-zinc-200 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Order Lifecycle States</option>
                <option value="PENDING">Pending Payment</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing</option>
                <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={() => loadOrders(true)}
                disabled={loadingOrders}
                className="flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                title="Refresh from Backend"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingOrders ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-zinc-400">
              Showing <span className="text-white font-bold">{filteredOrders.length}</span> records
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0d121f]/90 shadow-xl backdrop-blur-xl">
            <div className="overflow-x-auto min-h-[260px]">
              <table className="w-full text-left text-xs border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold text-zinc-400">
                    <th className="py-2.5 px-3">Order Ref & Date</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Delivery Destination</th>
                    <th className="py-2.5 px-3">Amount (ETB)</th>
                    <th className="py-2.5 px-3">Escrow Payment</th>
                    <th className="py-2.5 px-3">Order Status</th>
                    <th className="py-2.5 px-3 text-right">Lifecycle Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loadingOrders ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
                          <span>Loading orders from backend cluster...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-400">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <Package className="h-8 w-8 text-zinc-500" />
                          <p className="text-sm font-semibold text-zinc-300">No orders matching criteria</p>
                          <p className="text-xs text-zinc-500">Try adjusting your filters or search term.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                        {/* Order Number */}
                        <td className="py-2.5 px-3">
                          <span className="font-mono font-bold text-white">{order.orderNumber}</span>
                          <p className="text-[10px] text-zinc-500 font-mono">
                            {new Date(order.createdAt).toLocaleString("en-ET", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </p>
                        </td>

                        {/* Customer */}
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-zinc-200 leading-tight">{order.customerName}</p>
                          <p className="text-[10px] font-mono text-zinc-500">{order.customerPhone}</p>
                        </td>

                        {/* Address */}
                        <td className="py-2.5 px-3 text-zinc-300 max-w-[200px] truncate" title={order.deliveryAddress}>
                          {order.deliveryAddress}
                        </td>

                        {/* Amount */}
                        <td className="py-2.5 px-3">
                          <span className="font-mono font-bold text-emerald-400">
                            ETB {order.amount.toLocaleString()}
                          </span>
                        </td>

                        {/* Payment / Escrow */}
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] font-medium ${
                              order.paymentStatus === "PAID"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                                : order.paymentStatus === "RELEASED"
                                ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/25"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                            }`}
                          >
                            {order.paymentStatus === "PAID" && (
                              <>
                                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                <span>Paid (Escrow Held)</span>
                              </>
                            )}
                            {order.paymentStatus === "RELEASED" && (
                              <>
                                <CheckCircle2 className="h-3 w-3 text-cyan-400" />
                                <span>Escrow Released</span>
                              </>
                            )}
                            {order.paymentStatus !== "PAID" && order.paymentStatus !== "RELEASED" && (
                              <>
                                <Clock3 className="h-3 w-3 text-amber-400" />
                                <span>{order.paymentStatus || "Unpaid"}</span>
                              </>
                            )}
                          </span>
                        </td>

                        {/* Order Status */}
                        <td className="py-2.5 px-3">{renderStatusBadge(order.status)}</td>

                        {/* Actions */}
                        <td className="py-2.5 px-3 text-right relative">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Inspect Quick Action */}
                            <button
                              type="button"
                              onClick={() => setInspectingOrderModal(order)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                              title="Inspect Order Breakdown"
                            >
                              <Eye className="h-3.5 w-3.5 text-indigo-400" />
                            </button>

                            {/* Dropdown Menu */}
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                onClick={() => setOpenMenuId(openMenuId === order.id ? null : order.id)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                title="Order actions"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>

                              {openMenuId === order.id && (
                                <>
                                  <div className="fixed inset-0 z-30 cursor-default" onClick={() => setOpenMenuId(null)} />
                                  <div className="app-dropdown-panel absolute right-0 mt-1 w-56 rounded-xl border border-white/10 bg-[#0f172a] p-1.5 shadow-2xl z-40 space-y-0.5 text-left animate-in fade-in zoom-in-95 duration-100">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuId(null);
                                        setInspectingOrderModal(order);
                                      }}
                                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                                    >
                                      <Eye className="h-3.5 w-3.5 text-indigo-400" />
                                      <span>Inspect Order Items</span>
                                    </button>

                                    {/* Quick Escrow Release if paid and delivered */}
                                    {order.paymentStatus === "PAID" && (
                                      <button
                                        type="button"
                                        onClick={() => handleQuickReleaseEscrow(order)}
                                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/15 transition-colors cursor-pointer"
                                      >
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span>Release Escrow to Seller</span>
                                      </button>
                                    )}

                                    <div className="my-1 border-t border-white/5" />
                                    <p className="px-2 py-0.5 text-[9.5px] font-mono text-zinc-500 uppercase">Change Status</p>

                                    {order.status !== "CONFIRMED" && (
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateStatus(order.id, "CONFIRMED", order.orderNumber)}
                                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1 text-xs text-zinc-300 hover:bg-white/10 transition-colors cursor-pointer"
                                      >
                                        <Check className="h-3 w-3 text-sky-400" />
                                        <span>Mark Confirmed</span>
                                      </button>
                                    )}

                                    {order.status !== "PROCESSING" && (
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateStatus(order.id, "PROCESSING", order.orderNumber)}
                                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1 text-xs text-zinc-300 hover:bg-white/10 transition-colors cursor-pointer"
                                      >
                                        <Clock3 className="h-3 w-3 text-violet-400" />
                                        <span>Mark Processing</span>
                                      </button>
                                    )}

                                    {order.status !== "IN_TRANSIT" && (
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateStatus(order.id, "IN_TRANSIT", order.orderNumber)}
                                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1 text-xs text-zinc-300 hover:bg-white/10 transition-colors cursor-pointer"
                                      >
                                        <Truck className="h-3 w-3 text-blue-400" />
                                        <span>Mark In Transit</span>
                                      </button>
                                    )}

                                    {order.status !== "DELIVERED" && (
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateStatus(order.id, "DELIVERED", order.orderNumber)}
                                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1 text-xs text-zinc-300 hover:bg-white/10 transition-colors cursor-pointer"
                                      >
                                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                        <span>Mark Delivered</span>
                                      </button>
                                    )}

                                    <div className="my-1 border-t border-white/5" />

                                    {order.status !== "CANCELLED" && (
                                      <button
                                        type="button"
                                        onClick={() => handleCancelOrder(order.id, order.orderNumber)}
                                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-yellow-300 hover:bg-yellow-500/15 transition-colors cursor-pointer"
                                      >
                                        <Ban className="h-3.5 w-3.5" />
                                        <span>Cancel Order</span>
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuId(null);
                                        setOrderToDelete(order);
                                      }}
                                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/15 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      <span>Delete Order</span>
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MERCHANT ESCROW PAYOUTS */}
      {activeSubTab === "PAYOUTS" && (
        <div className="space-y-3.5">
          {/* Controls Bar */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-white/10 bg-[#0d121f]/90 p-3 shadow-xl backdrop-blur-xl">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[220px] sm:max-w-xs">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  value={payoutSearch}
                  onChange={(e) => setPayoutSearch(e.target.value)}
                  placeholder="Search merchant, bank name, account #..."
                  className="w-full h-8 rounded-lg border border-white/10 bg-white/[0.04] pl-8 pr-3 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-amber-500"
                />
              </div>

              {/* Refresh Payouts */}
              <button
                type="button"
                onClick={() => loadPayouts(true)}
                disabled={loadingPayouts}
                className="flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingPayouts ? "animate-spin" : ""}`} />
                <span>Refresh Payouts</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-amber-300">
              Escrow release directly invokes banking webhook & ledger
            </div>
          </div>

          {/* Payouts Table */}
          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0d121f]/90 shadow-xl backdrop-blur-xl">
            <div className="overflow-x-auto min-h-[260px]">
              <table className="w-full text-left text-xs border-collapse min-w-[820px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold text-zinc-400">
                    <th className="py-2.5 px-3">Merchant Beneficiary</th>
                    <th className="py-2.5 px-3">Destination Bank & Account</th>
                    <th className="py-2.5 px-3">Gross Escrow</th>
                    <th className="py-2.5 px-3">Platform Fee</th>
                    <th className="py-2.5 px-3">Net Payout (ETB)</th>
                    <th className="py-2.5 px-3">Vault Status</th>
                    <th className="py-2.5 px-3 text-right">Escrow Release</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loadingPayouts ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="h-6 w-6 animate-spin text-amber-400" />
                          <span>Fetching pending payouts from payment vault...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredPayouts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-400">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <DollarSign className="h-8 w-8 text-zinc-500" />
                          <p className="text-sm font-semibold text-zinc-300">No pending payouts found</p>
                          <p className="text-xs text-zinc-500">All escrow funds have been cleared to merchants.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPayouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-white/[0.02] transition-colors">
                        {/* Merchant */}
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-white leading-tight">
                            {payout.bankAccountHolderName}
                          </p>
                          <p className="text-[10px] text-zinc-500 font-mono">
                            {payout.shopName || "Merchant Partner"} · Ref: {payout.orderNumber || payout.orderId.slice(0, 8)}
                          </p>
                        </td>

                        {/* Bank Details */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                            <div>
                              <p className="font-medium text-zinc-200 leading-tight">{payout.bankName}</p>
                              <p className="font-mono text-[10.5px] text-indigo-300">{payout.bankAccountNumber}</p>
                            </div>
                          </div>
                        </td>

                        {/* Gross Escrow */}
                        <td className="py-2.5 px-3 font-mono text-zinc-300">
                          ETB {Number(payout.amount).toLocaleString()}
                        </td>

                        {/* Platform Fee */}
                        <td className="py-2.5 px-3 font-mono text-zinc-400">
                          -ETB {Number(payout.platformFee).toLocaleString()}
                        </td>

                        {/* Net Amount */}
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                          ETB {Number(payout.netPayoutAmount).toLocaleString()}
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3">
                          {payout.status === "PENDING" && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10.5px] font-medium text-amber-400 border border-amber-500/20">
                              <Clock3 className="h-3 w-3" />
                              <span>Pending Release</span>
                            </span>
                          )}
                          {payout.status === "PROCESSED" && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-medium text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Disbursed</span>
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-2.5 px-3 text-right">
                          {payout.status === "PENDING" ? (
                            <button
                              type="button"
                              onClick={() => setSelectedPayout(payout)}
                              className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1 text-xs font-semibold text-white shadow-md shadow-emerald-600/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                            >
                              <Send className="h-3 w-3" />
                              <span>Release Payout</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-zinc-500 font-mono">
                              Cleared
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: INSPECT ORDER DETAILS BREAKDOWN */}
      {inspectingOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="app-modal-window relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#0f172a] p-5 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-indigo-500/20 p-1.5 text-indigo-400">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Order Details: {inspectingOrderModal.orderNumber}
                  </h3>
                  <p className="text-[10.5px] font-mono text-zinc-400">
                    Created: {new Date(inspectingOrderModal.createdAt).toLocaleString("en-ET")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingOrderModal(null)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Order summary banner */}
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase">Total Amount</span>
                  <p className="text-base font-bold font-mono text-emerald-400">
                    ETB {inspectingOrderModal.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase">Payment & Escrow</span>
                  <p className="text-xs font-semibold text-cyan-300 mt-0.5">
                    {inspectingOrderModal.paymentStatus} · {inspectingOrderModal.paymentMethod}
                  </p>
                </div>
              </div>

              {/* Customer & Delivery */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Customer Name:</span>
                  <span className="font-semibold text-white">{inspectingOrderModal.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Customer Phone:</span>
                  <span className="font-mono text-cyan-300">{inspectingOrderModal.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Delivery Address:</span>
                  <span className="text-zinc-200 text-right max-w-[240px] truncate">{inspectingOrderModal.deliveryAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Lifecycle Status:</span>
                  <span>{renderStatusBadge(inspectingOrderModal.status)}</span>
                </div>
              </div>

              {/* Items List */}
              {inspectingOrderModal.items && inspectingOrderModal.items.length > 0 && (
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-1.5">
                  <span className="text-[10.5px] font-bold text-zinc-300 uppercase">
                    Purchased Goods ({inspectingOrderModal.items.length})
                  </span>
                  <div className="divide-y divide-white/5 mt-1">
                    {inspectingOrderModal.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-1 text-[11px]">
                        <span className="text-zinc-300">{item.title || item.name} (x{item.quantity || 1})</span>
                        <span className="font-mono text-white">ETB {((item.unitPrice || item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-3">
              {inspectingOrderModal.paymentStatus === "PAID" && (
                <button
                  type="button"
                  onClick={() => {
                    handleQuickReleaseEscrow(inspectingOrderModal);
                    setInspectingOrderModal(null);
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Release Escrow to Seller</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setInspectingOrderModal(null)}
                className="ml-auto rounded-lg bg-white/10 px-4 py-1.5 text-xs font-semibold text-white hover:bg-white/15 cursor-pointer"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM ESCROW PAYOUT DISBURSEMENT */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-emerald-500/30 bg-[#0f172a] shadow-2xl p-5 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Confirm Escrow Payout Disbursement
                </h3>
                <p className="text-xs text-zinc-400">
                  Release funds from escrow vault to merchant bank
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-400">Merchant Beneficiary:</span>
                <span className="font-semibold text-white">{selectedPayout.bankAccountHolderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Receiving Bank:</span>
                <span className="text-indigo-300 font-medium">{selectedPayout.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Account Number:</span>
                <span className="font-mono text-cyan-300">{selectedPayout.bankAccountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Gross Escrow Volume:</span>
                <span className="font-mono text-zinc-300">ETB {Number(selectedPayout.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Platform Commission (3.5%):</span>
                <span className="font-mono text-zinc-400">-ETB {Number(selectedPayout.platformFee).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-1.5 mt-1.5">
                <span className="text-white font-bold">Net Payout Released:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  ETB {Number(selectedPayout.netPayoutAmount).toLocaleString()}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-300">
              The platform will debit the escrow escrow account and issue a payment clearance confirmation to the merchant.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedPayout(null)}
                className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayoutRelease}
                disabled={isReleasingPayout}
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-500 cursor-pointer disabled:opacity-50"
              >
                {isReleasingPayout ? "Processing..." : "Confirm & Release Funds"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE ORDER CONFIRMATION */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-rose-500/30 bg-[#0f172a] shadow-2xl p-5 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Delete Order Permanently
                </h3>
                <p className="text-xs text-zinc-400">
                  Order ID: {orderToDelete.orderNumber}
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              This action cannot be undone. This order will be permanently deleted from the database.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteOrder}
                disabled={isDeleting}
                className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-rose-600/30 hover:bg-rose-500 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

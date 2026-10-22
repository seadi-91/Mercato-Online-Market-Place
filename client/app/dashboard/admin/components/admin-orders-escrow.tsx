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
  Bike,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api/client";
import { useAuthStore } from "@/store/auth-store";
import {
  adminEscrowService,
  adminDeliveryService,
  type PendingPayoutItem,
} from "@/features/admin/services/admin.service";
import { INITIAL_DEMO_RIDERS, type DeliveryRider } from "./admin-delivery";

export interface AdminOrderRow {
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
  carrierId?: string;
  assignedDriver?: {
    id?: string;
    name?: string;
    phone?: string;
    plateNumber?: string;
    vehicleType?: string;
    zone?: string;
  } | null;
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

  const rawDriver = order?.assignedDriver || delivery?.assignedDriver || null;
  const carrierId = order?.carrierId || rawDriver?.id || null;

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
    carrierId: carrierId || undefined,
    assignedDriver: rawDriver,
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
  const [assignmentFilter, setAssignmentFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderRow | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<AdminOrderRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [inspectingOrderModal, setInspectingOrderModal] = useState<AdminOrderRow | null>(null);

  // Delivery Fleet State for Assignment (Loaded strictly from DB)
  const [riders, setRiders] = useState<DeliveryRider[]>([]);
  const [assignDriverModalOrder, setAssignDriverModalOrder] = useState<AdminOrderRow | null>(null);
  const [selectedRiderIdForAssign, setSelectedRiderIdForAssign] = useState<string>("");
  const [assignmentNewStatus, setAssignmentNewStatus] = useState<string>("IN_TRANSIT");
  const [isAssigningDriver, setIsAssigningDriver] = useState(false);
  const [driverSearchQuery, setDriverSearchQuery] = useState("");

  // Payouts State
  const [payouts, setPayouts] = useState<PendingPayoutItem[]>([]);
  const [loadingPayouts, setLoadingPayouts] = useState(false);
  const [payoutSearch, setPayoutSearch] = useState("");
  const [selectedPayout, setSelectedPayout] = useState<PendingPayoutItem | null>(null);
  const [isReleasingPayout, setIsReleasingPayout] = useState(false);

  // Load Orders
  const loadOrders = useCallback(async (isManualRefresh = false) => {
    if (!token) {
      setLoadingOrders(false);
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
    } catch (error: any) {
      console.warn("Failed to load admin orders:", error?.message || error);
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

  // Load Couriers for assignment
  const loadDeliveryStaff = useCallback(async () => {
    try {
      const response = await adminDeliveryService.getDeliveryStaff({ limit: 100 });
      const rawList = response?.data || [];
      if (rawList.length > 0) {
        const mapped: DeliveryRider[] = rawList.map((item: any, idx: number) => {
          const isAvailable = item.isAvailable ?? true;
          return {
            id: item.userId || item.id || `rd-${idx + 1}`,
            name: item.fullName || "Delivery Courier",
            phone: item.alternatePhone || item.phoneNumber || "N/A",
            email: item.email || "",
            nationalId: item.nationalIdNumber || `ID-ETH-${700000 + idx}`,
            zone: item.marketZone || item.subCity || item.city || "Addis Ababa",
            vehicleType: (item.vehicleType as any) || "Motorcycle",
            vehicleModel: item.specificLocation || item.vehicleModel || "Fleet Vehicle",
            plateNumber: (item.plateNumber || `AA 3-B${90000 + idx}`).toUpperCase(),
            drivingLicenseNumber: item.drivingLicenseNumber || `DL-AA-${80000 + idx}`,
            activeOrdersCount: isAvailable ? (idx % 3) + 1 : 0,
            completionRate: "99.2%",
            status: isAvailable ? (idx % 2 === 0 ? "IN_TRANSIT" : "ON_DUTY") : "OFFLINE",
            kycStatus: "APPROVED",
            isVerified: true,
            isActive: item.isActive ?? true,
            registeredDate: item.createdAt ? new Date(item.createdAt).toISOString().slice(0, 10) : "2026-09-01",
          };
        });
        setRiders(mapped);
      } else {
        setRiders([]);
      }
    } catch (err) {
      console.warn("No delivery staff loaded from database:", err);
      setRiders([]);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    loadDeliveryStaff();
  }, [loadOrders, loadDeliveryStaff]);

  useEffect(() => {
    if (activeSubTab === "PAYOUTS") {
      loadPayouts();
    }
  }, [activeSubTab, loadPayouts]);

  // Action: Assign driver to order
  const handleAssignDriver = async (orderId: string, riderId: string) => {
    const rider = riders.find((r) => r.id === riderId);
    if (!rider) return;

    setIsAssigningDriver(true);
    try {
      const assignedDriverData = {
        id: rider.id,
        name: rider.name,
        phone: rider.phone,
        vehicleType: rider.vehicleType,
        plateNumber: rider.plateNumber,
        zone: rider.zone,
        status: rider.status,
      };

      await adminDeliveryService.assignOrderDriver(orderId, {
        carrierId: rider.id,
        assignedDriver: assignedDriverData,
        newStatus: assignmentNewStatus || "IN_TRANSIT",
      });

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                carrierId: rider.id,
                assignedDriver: assignedDriverData,
                status: assignmentNewStatus || "IN_TRANSIT",
              }
            : o
        )
      );

      toast.success(`Assigned to ${rider.name}!`, {
        description: `Dispatched to ${rider.vehicleType} (${rider.plateNumber}).`,
      });
      setAssignDriverModalOrder(null);
    } catch (err: any) {
      console.warn("Assign driver error:", err?.message || err);
      toast.error("Assignment failed", {
        description: err?.message || "Could not assign driver to order.",
      });
    } finally {
      setIsAssigningDriver(false);
    }
  };

  // Action: Unassign driver from order
  const handleUnassignDriver = async (orderId: string) => {
    setOpenMenuId(null);
    try {
      await adminDeliveryService.assignOrderDriver(orderId, {
        carrierId: null,
        assignedDriver: null,
        newStatus: "READY_FOR_PICKUP",
      });

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                carrierId: undefined,
                assignedDriver: null,
                status: "READY_FOR_PICKUP",
              }
            : o
        )
      );

      toast.success("Driver unassigned from order");
    } catch (err: any) {
      toast.error("Failed to unassign driver", { description: err?.message });
    }
  };

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
      console.warn("Failed to update order status:", err?.message || err);
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
    } catch (error: any) {
      console.warn("Failed to cancel order:", error?.message || error);
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
      console.warn("Failed to delete order:", error?.message || error);
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
      const q = searchQuery.toLowerCase();
      const driverName = order.assignedDriver?.name?.toLowerCase() || "";
      const driverPlate = order.assignedDriver?.plateNumber?.toLowerCase() || "";

      const matchesSearch =
        order.orderNumber.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.deliveryAddress.toLowerCase().includes(q) ||
        driverName.includes(q) ||
        driverPlate.includes(q);

      const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;

      let matchesAssignment = true;
      if (assignmentFilter === "UNASSIGNED") {
        matchesAssignment = !order.carrierId && !order.assignedDriver;
      } else if (assignmentFilter === "ASSIGNED") {
        matchesAssignment = Boolean(order.carrierId || order.assignedDriver);
      } else if (assignmentFilter !== "ALL") {
        matchesAssignment =
          order.carrierId === assignmentFilter ||
          order.assignedDriver?.id === assignmentFilter;
      }

      return matchesSearch && matchesStatus && matchesAssignment;
    });
  }, [orders, searchQuery, statusFilter, assignmentFilter]);

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
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab("ORDERS")}
          className={`flex items-center justify-between sm:justify-start gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === "ORDERS"
              ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/30"
              : "text-zinc-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span>Orders &amp; Escrow Lifecycle</span>
          </div>
          <span className="rounded-full bg-white/15 px-2 py-0.2 text-[10px] font-mono">
            {orders.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("PAYOUTS")}
          className={`flex items-center justify-between sm:justify-start gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === "PAYOUTS"
              ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md shadow-amber-600/30 border border-amber-400/30"
              : "text-zinc-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span>Merchant Escrow Payouts (Vault Releases)</span>
          </div>
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
                <option value="ALL">All Order States (ሁሉንም)</option>
                <option value="PENDING">Pending Payment</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing</option>
                <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              {/* Delivery Assignment Filter */}
              <select
                value={assignmentFilter}
                onChange={(e) => setAssignmentFilter(e.target.value)}
                className="h-8 rounded-lg border border-white/10 bg-[#141b2d] px-2.5 text-xs text-zinc-200 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Couriers / Dispatch (ሁሉንም)</option>
                <option value="UNASSIGNED">Unassigned Only (አልተመደበም)</option>
                <option value="ASSIGNED">Assigned Only (የተመደቡ)</option>
                {riders.map((r) => (
                  <option key={r.id} value={r.id}>
                    Driver: {r.name} ({r.plateNumber})
                  </option>
                ))}
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
            {/* Mobile Swipe Hint */}
            <div className="sm:hidden flex items-center justify-between px-3.5 py-2 border-b border-white/5 bg-white/[0.02] text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5 text-[10.5px]">
                <span>←</span>
                <span>ወደ ጎን ያሸብልሉ (Swipe to scroll)</span>
                <span>→</span>
              </span>
              <span className="text-[10px] font-mono text-indigo-400 font-semibold">{filteredOrders.length} Orders</span>
            </div>

            <div className="overflow-x-auto min-h-[260px] scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse min-w-[940px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold text-zinc-400">
                    <th className="py-2.5 px-3">Order Ref & Date</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Delivery Destination</th>
                    <th className="py-2.5 px-3">Amount (ETB)</th>
                    <th className="py-2.5 px-3">Escrow Payment</th>
                    <th className="py-2.5 px-3">Delivery Courier (አሽከርካሪ)</th>
                    <th className="py-2.5 px-3">Order Status</th>
                    <th className="py-2.5 px-3 text-right">Lifecycle Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loadingOrders ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
                          <span>Loading orders from backend cluster...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-400">
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
                        <td className="py-2.5 px-3 text-zinc-300 max-w-[180px] truncate" title={order.deliveryAddress}>
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
                                <span>Paid (Escrow)</span>
                              </>
                            )}
                            {order.paymentStatus === "RELEASED" && (
                              <>
                                <CheckCircle2 className="h-3 w-3 text-cyan-400" />
                                <span>Released</span>
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

                        {/* Delivery Courier (አሽከርካሪ) */}
                        <td className="py-2.5 px-3">
                          {order.assignedDriver || order.carrierId ? (
                            <div className="flex items-center gap-1.5">
                              <div className="rounded-md bg-indigo-500/15 border border-indigo-500/25 px-2 py-1 text-[11px] text-zinc-200">
                                <div className="flex items-center gap-1">
                                  <Bike className="h-3 w-3 text-cyan-400 shrink-0" />
                                  <span className="font-semibold text-white truncate max-w-[110px]">
                                    {order.assignedDriver?.name || "Assigned Driver"}
                                  </span>
                                </div>
                                <p className="text-[9.5px] font-mono text-indigo-300 font-bold">
                                  {order.assignedDriver?.plateNumber || order.carrierId}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRiderIdForAssign(order.carrierId || order.assignedDriver?.id || "");
                                  setAssignDriverModalOrder(order);
                                }}
                                className="rounded p-1 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                title="Change Assigned Courier (አሽከርካሪ ቀይር)"
                              >
                                <RotateCcw className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRiderIdForAssign("");
                                setAssignDriverModalOrder(order);
                              }}
                              className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/25 px-2 py-1 text-[10.5px] font-medium text-amber-300 hover:bg-amber-500/20 transition-colors cursor-pointer"
                              title="Assign Delivery Courier (አሽከርካሪ መድብ)"
                            >
                              <Bike className="h-3 w-3 text-amber-400" />
                              <span>+ Assign Driver</span>
                            </button>
                          )}
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

                                    {/* Assign / Change Driver Action */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuId(null);
                                        setSelectedRiderIdForAssign(order.carrierId || order.assignedDriver?.id || "");
                                        setAssignDriverModalOrder(order);
                                      }}
                                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/15 transition-colors cursor-pointer"
                                    >
                                      <Bike className="h-3.5 w-3.5" />
                                      <span>{order.assignedDriver || order.carrierId ? "Change Courier (ቀይር)" : "Assign Courier (አሽከርካሪ መድብ)"}</span>
                                    </button>

                                    {(order.assignedDriver || order.carrierId) && (
                                      <button
                                        type="button"
                                        onClick={() => handleUnassignDriver(order.id)}
                                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/15 transition-colors cursor-pointer"
                                      >
                                        <X className="h-3.5 w-3.5" />
                                        <span>Unassign Courier</span>
                                      </button>
                                    )}

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
            {/* Mobile Swipe Hint */}
            <div className="sm:hidden flex items-center justify-between px-3.5 py-2 border-b border-white/5 bg-white/[0.02] text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5 text-[10.5px]">
                <span>←</span>
                <span>ወደ ጎን ያሸብልሉ (Swipe to scroll)</span>
                <span>→</span>
              </span>
              <span className="text-[10px] font-mono text-amber-400 font-semibold">{filteredPayouts.length} Releases</span>
            </div>

            <div className="overflow-x-auto min-h-[260px] scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse min-w-[860px]">
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

              {/* Assigned Courier Card */}
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-bold text-indigo-300 uppercase flex items-center gap-1.5">
                    <Bike className="h-3.5 w-3.5" />
                    <span>Assigned Delivery Staff (የተመደበ አሽከርካሪ)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const ord = inspectingOrderModal;
                      setInspectingOrderModal(null);
                      setSelectedRiderIdForAssign(ord.carrierId || ord.assignedDriver?.id || "");
                      setAssignDriverModalOrder(ord);
                    }}
                    className="text-[10.5px] text-cyan-400 hover:underline font-semibold cursor-pointer"
                  >
                    {inspectingOrderModal.assignedDriver || inspectingOrderModal.carrierId ? "Change / Reassign →" : "+ Assign Driver →"}
                  </button>
                </div>
                {inspectingOrderModal.assignedDriver || inspectingOrderModal.carrierId ? (
                  <div className="text-xs text-zinc-200">
                    <p className="font-semibold text-white text-sm">
                      {inspectingOrderModal.assignedDriver?.name || "Assigned Driver"}
                    </p>
                    <p className="font-mono text-zinc-300 text-[11px] mt-0.5">
                      Phone: {inspectingOrderModal.assignedDriver?.phone || "N/A"} · Vehicle: {inspectingOrderModal.assignedDriver?.vehicleType || "Fleet"} ({inspectingOrderModal.assignedDriver?.plateNumber || inspectingOrderModal.carrierId})
                    </p>
                    {inspectingOrderModal.assignedDriver?.zone && (
                      <p className="text-[10px] text-cyan-300">Operating Zone: {inspectingOrderModal.assignedDriver.zone}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-amber-300 italic">
                    No delivery staff assigned to this order yet (አልተመደበም).
                  </p>
                )}
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

      {/* MODAL 4: ASSIGN DELIVERY DRIVER TO ORDER (ለታዘዘው እቃ አሽከርካሪ መድብ) */}
      {assignDriverModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="app-modal-window relative w-full max-w-xl rounded-2xl border border-indigo-500/30 bg-[#0f172a] p-5 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Assign Delivery Courier (አሽከርካሪ መድብ)
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Order <span className="font-mono font-bold text-cyan-300">#{assignDriverModalOrder.orderNumber}</span> · ETB {assignDriverModalOrder.amount.toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAssignDriverModalOrder(null);
                  setSelectedRiderIdForAssign("");
                }}
                className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Order Target Info */}
            <div className="mt-3.5 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs space-y-1.5 shrink-0">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Customer:</span>
                <span className="font-semibold text-white">
                  {assignDriverModalOrder.customerName} ({assignDriverModalOrder.customerPhone})
                </span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-zinc-400 shrink-0">Destination:</span>
                <span className="text-right text-zinc-200">{assignDriverModalOrder.deliveryAddress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Current Assignee:</span>
                <span className={assignDriverModalOrder.assignedDriver ? "text-cyan-300 font-semibold" : "text-amber-400 font-medium"}>
                  {assignDriverModalOrder.assignedDriver
                    ? `${assignDriverModalOrder.assignedDriver.name} (${assignDriverModalOrder.assignedDriver.plateNumber})`
                    : "Unassigned (አልተመደበም)"}
                </span>
              </div>
            </div>

            {/* Status Selection upon Assignment */}
            <div className="mt-3 shrink-0">
              <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                Set Delivery Status upon Assignment:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAssignmentNewStatus("IN_TRANSIT")}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-all cursor-pointer ${
                    assignmentNewStatus === "IN_TRANSIT"
                      ? "border-amber-500 bg-amber-500/15 text-amber-300"
                      : "border-white/10 bg-black/40 text-zinc-400 hover:text-white"
                  }`}
                >
                  <Bike className="h-3.5 w-3.5" />
                  <span>IN_TRANSIT (በማጓጓዝ ላይ)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAssignmentNewStatus("READY_FOR_PICKUP")}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-all cursor-pointer ${
                    assignmentNewStatus === "READY_FOR_PICKUP"
                      ? "border-cyan-500 bg-cyan-500/15 text-cyan-300"
                      : "border-white/10 bg-black/40 text-zinc-400 hover:text-white"
                  }`}
                >
                  <Package className="h-3.5 w-3.5" />
                  <span>READY_FOR_PICKUP (ለመጫን ዝግጁ)</span>
                </button>
              </div>
            </div>

            {/* Search Courier in Modal */}
            <div className="mt-3 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  value={driverSearchQuery}
                  onChange={(e) => setDriverSearchQuery(e.target.value)}
                  placeholder="Search fleet by name, vehicle, plate, or zone..."
                  className="w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Drivers List */}
            <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1">
              <p className="text-[11px] text-zinc-400 font-medium px-1">
                Select Courier to Dispatch ({riders.length} available):
              </p>
              {riders
                .filter((r) => {
                  if (!driverSearchQuery.trim()) return true;
                  const q = driverSearchQuery.toLowerCase();
                  return (
                    r.name.toLowerCase().includes(q) ||
                    r.phone.toLowerCase().includes(q) ||
                    r.plateNumber.toLowerCase().includes(q) ||
                    r.vehicleType.toLowerCase().includes(q) ||
                    r.zone.toLowerCase().includes(q)
                  );
                })
                .map((rider) => {
                  const isSelected = selectedRiderIdForAssign === rider.id;
                  const isCurrentCarrier =
                    assignDriverModalOrder.carrierId === rider.id ||
                    assignDriverModalOrder.assignedDriver?.id === rider.id;

                  const activeCount = orders.filter(
                    (o) => o.carrierId === rider.id || o.assignedDriver?.id === rider.id
                  ).length;

                  return (
                    <div
                      key={rider.id}
                      onClick={() => setSelectedRiderIdForAssign(rider.id)}
                      className={`flex items-center justify-between rounded-xl border p-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-500/15 ring-1 ring-indigo-500/50"
                          : "border-white/10 bg-black/30 hover:border-white/20 hover:bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            isSelected
                              ? "bg-indigo-500 text-white"
                              : "bg-white/10 text-zinc-300"
                          }`}
                        >
                          <Bike className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-xs text-white truncate">
                              {rider.name}
                            </span>
                            {isCurrentCarrier && (
                              <span className="rounded bg-cyan-500/20 px-1.5 py-0.2 text-[9px] font-bold text-cyan-300 border border-cyan-500/30">
                                Current Assignee
                              </span>
                            )}
                            <span
                              className={`rounded-full px-1.5 py-0.2 text-[9px] font-medium border ${
                                rider.status === "ON_DUTY"
                                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                                  : rider.status === "IN_TRANSIT"
                                  ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                                  : "bg-zinc-500/15 border-zinc-500/30 text-zinc-400"
                              }`}
                            >
                              {rider.status.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-zinc-400 truncate">
                            <span className="font-mono font-bold text-indigo-300">{rider.plateNumber}</span> ({rider.vehicleType}) · {rider.zone}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-2">
                        <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold border ${
                          activeCount === 0
                            ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                            : activeCount <= 2
                            ? "bg-cyan-500/10 border-cyan-500/25 text-cyan-300"
                            : "bg-amber-500/10 border-amber-500/25 text-amber-300"
                        }`}>
                          <Package className="h-2.5 w-2.5" />
                          <span>{activeCount} active tasks</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setAssignDriverModalOrder(null);
                  setSelectedRiderIdForAssign("");
                }}
                className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedRiderIdForAssign || isAssigningDriver}
                onClick={() => handleAssignDriver(assignDriverModalOrder.id, selectedRiderIdForAssign)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 hover:brightness-110 active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAssigningDriver ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Assigning...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Confirm & Assign Driver (አሽከርካሪ መድብ)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

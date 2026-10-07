"use client";

import React, { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api/client";
import { useAuthStore } from "@/store/auth-store";

interface AdminOrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  deliveryAddress: string;
  amount: number;
  paymentStatus: string;
  status: string;
  createdAt: string;
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
    deliveryAddress: address || "No delivery address provided",
    amount: Number(order?.totalAmount || 0),
    paymentStatus: order?.paymentStatus || "UNPAID",
    status: order?.status || "PENDING",
    createdAt: order?.createdAt || new Date().toISOString(),
  };
};

export function AdminOrdersEscrow() {
  const router = useRouter();
  const { token, logout } = useAuthStore();
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderRow | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<AdminOrderRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      const hasValidToken = Boolean(token && token !== "mock-jwt-token" && token !== "oauth-token");

      if (!hasValidToken) {
        setLoading(false);
        setOrders([]);
        logout();
        toast.error("Session expired", {
          description: "Please sign in again to access admin orders.",
        });
        router.push("/login");
        return;
      }

      try {
        setLoading(true);
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
      } catch (error) {
        console.error("Failed to load admin orders:", error);
        toast.error("Orders load failed", {
          description: "Unable to fetch the order list from the backend. Please check your session or login again.",
        });
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [router, token, logout]);

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

  const handleViewOrder = (order: AdminOrderRow) => {
    setOpenMenuId(null);
    setSelectedOrder(order);
    router.push(`/dashboard/admin/orders/${encodeURIComponent(order.id)}`);
  };

  const handleCancelOrder = async (orderId: string, orderNumber: string) => {
    try {
      setOpenMenuId(null);
      await api.patch(`/orders/${orderId}/status`, {
        newStatus: "CANCELLED",
        cancelReason: "Cancelled by admin",
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
        description: error?.message || "Unable to permanently delete this order from the database.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

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
        {!["DELIVERED", "PENDING", "CANCELLED", "IN_TRANSIT", "READY_FOR_PICKUP"].includes(normalized) && (
          <AlertCircle className="h-3.5 w-3.5" />
        )}
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-white/10 bg-[#0d121f]/90 p-3 backdrop-blur-xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order #, customer, address..."
            className="w-full h-8 rounded-lg border border-white/10 bg-white/[0.04] pl-8 pr-3 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center rounded-lg bg-white/[0.04] p-0.5 border border-white/5 text-[11px]">
          {[
            { id: "ALL", label: "All Status" },
            { id: "PENDING", label: "Pending" },
            { id: "CONFIRMED", label: "Confirmed" },
            { id: "IN_TRANSIT", label: "In Transit" },
            { id: "DELIVERED", label: "Delivered" },
            { id: "CANCELLED", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer ${statusFilter === tab.id ? "bg-indigo-600 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {selectedOrder && (
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/8 p-3 text-xs text-zinc-200">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-indigo-300">Selected order</p>
              <p className="mt-1 font-semibold text-white">{selectedOrder.orderNumber}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="rounded-md border border-white/10 px-2 py-1 text-[10px] text-zinc-300 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div>
              <p className="text-[10px] text-zinc-400">Customer</p>
              <p className="font-medium text-white">{selectedOrder.customerName}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-400">Delivery address</p>
              <p className="font-medium text-white">{selectedOrder.deliveryAddress}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-400">Amount</p>
              <p className="font-medium text-emerald-400">ETB {selectedOrder.amount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0d121f]/90 shadow-xl backdrop-blur-xl">
        <div className="overflow-x-auto min-h-[260px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold text-zinc-400">
                <th className="py-2.5 px-3">Order Ref</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Customer Delivery Address</th>
                <th className="py-2.5 px-3">Amount (ETB)</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3">Delivery Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-zinc-500">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-zinc-500">
                    No orders matching criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-bold text-white">{order.orderNumber}</span>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        {new Date(order.createdAt).toLocaleString("en-ET", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </p>
                    </td>

                    <td className="py-2.5 px-3 font-medium text-zinc-200">{order.customerName}</td>

                    <td className="py-2.5 px-3 text-zinc-300 max-w-[220px] break-words">
                      {order.deliveryAddress}
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="font-mono font-semibold text-emerald-400">
                        ETB {order.amount.toLocaleString()}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${
                        order.paymentStatus === "PAID"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                      }`}>
                        {order.paymentStatus === "PAID" ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                            <span>Paid (Escrow Held)</span>
                          </>
                        ) : (
                          <>
                            <Clock3 className="h-3 w-3 text-amber-400" />
                            <span>{order.paymentStatus || "Unpaid"}</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">{renderStatusBadge(order.status)}</td>

                    <td className="py-2.5 px-3 text-right relative">
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
                            <div className="app-dropdown-panel absolute right-0 mt-1 w-52 rounded-xl border border-white/10 bg-[#0f172a] p-1.5 shadow-2xl z-40 space-y-0.5 text-left animate-in fade-in zoom-in-95 duration-100">
                              <button
                                type="button"
                                onClick={() => handleViewOrder(order)}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5 text-indigo-400" />
                                <span>View detail</span>
                              </button>

                              {order.status !== "CANCELLED" && (
                                <button
                                  type="button"
                                  onClick={() => handleCancelOrder(order.id, order.orderNumber)}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-yellow-300 hover:bg-yellow-500/15 transition-colors cursor-pointer"
                                >
                                  <Ban className="h-3.5 w-3.5" />
                                  <span>Cancel</span>
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
                                <span>Delete</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Order Confirmation Pop-Up Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-rose-500/30 bg-[#0f172a] shadow-2xl">
            <div className="flex items-center gap-3 border-b border-white/10 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Are you sure you want to delete this order?
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Order ID: {orderToDelete.orderNumber}
                </p>
              </div>
            </div>

            <div className="p-4 space-y-3 text-xs text-zinc-300">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Order Number:</span>
                  <span className="font-mono font-bold text-white">{orderToDelete.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Customer:</span>
                  <span className="font-semibold text-white">{orderToDelete.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Amount:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ETB {orderToDelete.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Delivery Address:</span>
                  <span className="text-zinc-300 text-right max-w-[200px] truncate">{orderToDelete.deliveryAddress}</span>
                </div>
              </div>
              <p className="text-rose-300/90 text-[11px] leading-relaxed">
                This action cannot be undone. This order will be permanently deleted from the database.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-white/10 bg-black/30 p-3.5">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                disabled={isDeleting}
                className="rounded-lg px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteOrder}
                disabled={isDeleting}
                className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Yes, Delete</span>
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

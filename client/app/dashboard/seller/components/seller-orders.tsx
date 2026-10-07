"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShoppingCart,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Phone,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  MoreVertical,
  Wifi,
  WifiOff,
  RefreshCw,
  Copy,
  MapPin,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { sellerService } from "@/services/seller/seller.service";

export interface SellerOrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryZone: string;
  itemsSummary: string;
  totalAmount: number;
  paymentMethod: "TELEBIRR" | "CBE_BIRR" | "CHAPA" | "COD" | string;
  escrowStatus: "HELD_IN_ESCROW" | "CLEARED_FOR_PAYOUT";
  fulfillmentStatus: "AWAITING_COURIER" | "IN_TRANSIT" | "DELIVERED";
  courierName?: string;
  courierPhone?: string;
  otpCode?: string;
  orderedAt: string;
}

export function SellerOrders() {
  const [orders, setOrders] = useState<SellerOrderItem[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      let ordersData: any[] = [];
      try {
        const res = await sellerService.getOrders({
          status: filterStatus !== "ALL" ? filterStatus : undefined,
        });
        if (res && Array.isArray(res.data)) {
          ordersData = res.data;
          setIsLiveConnected(true);
        }
      } catch {
        // Fallback to /api/orders database endpoint
        try {
          const fb = await fetch("/api/orders");
          if (fb.ok) {
            const json = await fb.json();
            if (json.success && Array.isArray(json.orders)) {
              ordersData = json.orders;
              setIsLiveConnected(true);
            }
          }
        } catch {
          setIsLiveConnected(false);
        }
      }

      if (ordersData.length > 0) {
        const mapped: SellerOrderItem[] = ordersData.map((o) => {
          let fulfillment: "AWAITING_COURIER" | "IN_TRANSIT" | "DELIVERED" = "AWAITING_COURIER";
          if (o.status === "DELIVERED") fulfillment = "DELIVERED";
          else if (o.status === "IN_TRANSIT") fulfillment = "IN_TRANSIT";

          return {
            id: o.id,
            orderNumber: o.orderNumber,
            customerName: o.deliveryAddress?.recipientName || "Customer",
            customerPhone: o.deliveryAddress?.recipientPhone || o.deliveryAddress?.phone || "+251 9...",
            deliveryZone: `${o.deliveryAddress?.subCity || ""}, ${o.deliveryAddress?.city || "Addis Ababa"}`.replace(/^,\s*/, ""),
            itemsSummary:
              o.items && o.items.length > 0
                ? o.items.map((i: any) => `${i.productTitle || i.name || "Item"} (x${i.quantity || 1})`).join(", ")
                : "Catalog Item",
            totalAmount: Number(o.totalAmount || 0),
            paymentMethod: o.paymentMethod || "CHAPA",
            escrowStatus:
              o.paymentStatus === "PAID" || o.paymentStatus === "HELD_IN_ESCROW"
                ? "CLEARED_FOR_PAYOUT"
                : "HELD_IN_ESCROW",
            fulfillmentStatus: fulfillment,
            courierName: o.carrierId ? "MercatoX Carrier" : undefined,
            orderedAt: new Date(o.createdAt || Date.now()).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        });
        setOrders(mapped);
      } else {
        setOrders([]);
      }
    } catch {
      setIsLiveConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleDispatchReady = async (orderId: string, orderNumber: string) => {
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    try {
      await sellerService.updateOrderStatus(orderId, {
        newStatus: "IN_TRANSIT",
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, fulfillmentStatus: "IN_TRANSIT", otpCode: generatedOtp }
            : o
        )
      );
      toast.success(`Order ${orderNumber} dispatched! Handover OTP: ${generatedOtp}`);
    } catch {
      toast.error("Failed to update order status on backend");
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search);
    const matchesStatus =
      filterStatus === "ALL" ||
      (filterStatus === "AWAITING_COURIER" && o.fulfillmentStatus === "AWAITING_COURIER") ||
      (filterStatus === "IN_TRANSIT" && o.fulfillmentStatus === "IN_TRANSIT") ||
      (filterStatus === "DELIVERED" && o.fulfillmentStatus === "DELIVERED");
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-3.5">
      {/* Top Header & Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-indigo-400" />
              Incoming Orders & Escrow Handover
            </h1>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                isLiveConnected
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  : "bg-amber-500/15 text-amber-300 border-amber-500/30"
              }`}
            >
              {isLiveConnected ? (
                <>
                  <Wifi className="h-2.5 w-2.5" /> Live Backend
                </>
              ) : (
                <>
                  <WifiOff className="h-2.5 w-2.5" /> Connecting...
                </>
              )}
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Fulfill store orders, generate courier handover OTPs, and release buyer funds into merchant wallet
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadOrders()}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 rounded-xl border border-white/10 bg-[#0d121f] p-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by order #, customer name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg bg-white/[0.04] border border-white/5 py-1.5 pl-9 pr-3 text-xs text-white placeholder:text-zinc-500 focus:border-indigo-500/50 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
          {[
            { label: "All Orders", val: "ALL" },
            { label: "Pickup Ready", val: "AWAITING_COURIER" },
            { label: "In Transit", val: "IN_TRANSIT" },
            { label: "Delivered", val: "DELIVERED" },
          ].map((tab) => (
            <button
              key={tab.val}
              type="button"
              onClick={() => setFilterStatus(tab.val)}
              className={`rounded-lg px-2.5 py-1.5 font-medium transition-colors cursor-pointer whitespace-nowrap ${
                filterStatus === tab.val
                  ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table or Clean Empty State */}
      {filteredOrders.length === 0 ? (
        orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#0d121f]/60 p-12 text-center">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">No Customer Orders Yet</h3>
            <p className="mt-1 text-xs text-zinc-400 max-w-sm">
              Incoming customer orders placed from your catalog will appear here in real time for fulfillment, courier handover, and escrow settlement.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#0d121f]/60 p-8 text-center text-xs text-zinc-400">
            No orders match the filter &ldquo;{filterStatus}&rdquo; or search query &ldquo;{search}&rdquo;.
          </div>
        )
      ) : (
        <>
          {/* Mobile Orders Card View (md:hidden) */}
          <div className="md:hidden space-y-3">
            <div className="flex items-center justify-between px-1 text-xs">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <ShoppingCart className="h-3.5 w-3.5 text-indigo-400" />
                <span>Orders ({filteredOrders.length})</span>
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">
                {filterStatus}
              </span>
            </div>

            {filteredOrders.map((order) => {
              const isReady = order.fulfillmentStatus === "AWAITING_COURIER";
              const isInTransit = order.fulfillmentStatus === "IN_TRANSIT";
              const isDelivered = order.fulfillmentStatus === "DELIVERED";

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-white/10 bg-[#0d121f] p-3.5 shadow-xl space-y-3"
                >
                  {/* Card Header: Order # + Date + Status */}
                  <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-xs">
                          {order.orderNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(order.orderNumber);
                            toast.success(`Copied ${order.orderNumber}`);
                          }}
                          className="text-zinc-500 hover:text-zinc-300 p-0.5"
                          title="Copy order number"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">
                        {order.orderedAt}
                      </span>
                    </div>

                    {isReady && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 text-[10px] font-bold text-indigo-300 shrink-0">
                        <Clock className="h-3 w-3" /> Ready
                      </span>
                    )}
                    {isInTransit && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300 shrink-0">
                        <Truck className="h-3 w-3" /> In Transit
                      </span>
                    )}
                    {isDelivered && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 shrink-0">
                        <CheckCircle2 className="h-3 w-3" /> Delivered
                      </span>
                    )}
                  </div>

                  {/* Customer Information */}
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate flex items-center gap-1.5">
                        <User className="h-3 w-3 text-indigo-400 shrink-0" />
                        <span>{order.customerName}</span>
                      </div>
                      <p className="text-[10.5px] text-zinc-400 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-zinc-500 shrink-0" />
                        <span>{order.deliveryZone}</span>
                      </p>
                    </div>

                    {order.customerPhone && (
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-[10.5px] font-bold hover:bg-indigo-600/30 active:scale-95 transition-all shrink-0"
                      >
                        <Phone className="h-3 w-3" />
                        <span>Call</span>
                      </a>
                    )}
                  </div>

                  {/* Items Summary */}
                  <div className="text-[11px] text-zinc-300 bg-[#090d16] p-2 rounded-xl border border-white/5">
                    <span className="text-[9.5px] text-zinc-500 block uppercase font-mono tracking-wider mb-0.5">
                      Items Ordered
                    </span>
                    <p className="line-clamp-2">{order.itemsSummary}</p>
                  </div>

                  {/* Price & Escrow Status */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                    <div>
                      <span className="text-[9.5px] text-zinc-500 block uppercase font-mono">Total Value</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        ETB {order.totalAmount.toLocaleString()}
                      </span>
                      <span className="text-[9.5px] font-mono text-zinc-500 ml-1.5">
                        ({order.paymentMethod})
                      </span>
                    </div>

                    <div>
                      {order.escrowStatus === "HELD_IN_ESCROW" ? (
                        <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                          <Lock className="h-3 w-3" /> In Escrow
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                          <Unlock className="h-3 w-3" /> Released
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Courier Handover OTP Action */}
                  <div className="pt-2 border-t border-white/5">
                    {order.otpCode ? (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                        <div>
                          <span className="text-[9.5px] uppercase font-mono text-cyan-400 font-bold block">
                            Courier Handover OTP
                          </span>
                          <span className="font-mono font-black text-cyan-300 text-base tracking-widest">
                            {order.otpCode}
                          </span>
                        </div>
                        <span className="rounded bg-cyan-500/20 px-2 py-1 text-[9.5px] font-bold text-cyan-200">
                          Show to Courier
                        </span>
                      </div>
                    ) : isReady ? (
                      <button
                        type="button"
                        onClick={() => handleDispatchReady(order.id, order.orderNumber)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-indigo-700 py-2.5 px-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                        <span>Generate Courier Handover OTP</span>
                      </button>
                    ) : isInTransit ? (
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-[11px] text-cyan-300">
                        <Truck className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Courier en route to customer location. Escrow releases on delivery.</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Delivery confirmed. Funds deposited to your available payout balance.</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Orders Table (hidden md:block) */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-white/10 bg-[#0d121f] shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.01] text-[11px] font-semibold text-zinc-400">
                    <th className="py-2.5 px-3">Order Number & Date</th>
                    <th className="py-2.5 px-3">Customer & Zone</th>
                    <th className="py-2.5 px-3">Items Summary</th>
                    <th className="py-2.5 px-3">Total Amount</th>
                    <th className="py-2.5 px-3">Escrow Status</th>
                    <th className="py-2.5 px-3">Fulfillment</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-mono font-bold text-white">
                          {order.orderNumber}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {order.orderedAt}
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-zinc-200">
                          {order.customerName}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {order.customerPhone} · {order.deliveryZone}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 max-w-[220px] truncate text-zinc-300">
                        {order.itemsSummary}
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="font-mono font-bold text-emerald-400">
                          ETB {order.totalAmount.toLocaleString()}
                        </span>
                        <p className="text-[9.5px] font-mono text-zinc-400">
                          via {order.paymentMethod}
                        </p>
                      </td>

                      <td className="py-2.5 px-3">
                        {order.escrowStatus === "HELD_IN_ESCROW" ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-cyan-400">
                            <Lock className="h-3.5 w-3.5 shrink-0" />
                            In Escrow
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                            <Unlock className="h-3.5 w-3.5 shrink-0" />
                            Released
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3">
                        {order.fulfillmentStatus === "AWAITING_COURIER" && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-indigo-400">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            Ready for Pickup
                          </span>
                        )}
                        {order.fulfillmentStatus === "IN_TRANSIT" && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-cyan-400">
                            <Truck className="h-3.5 w-3.5 shrink-0" />
                            Courier in Transit
                          </span>
                        )}
                        {order.fulfillmentStatus === "DELIVERED" && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            Completed
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right relative">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={() => setOpenMenuId(openMenuId === order.id ? null : order.id)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title="Order Actions"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {openMenuId === order.id && (
                            <>
                              <div
                                className="fixed inset-0 z-30 cursor-default"
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div className="app-dropdown-panel absolute right-0 mt-1 w-56 rounded-xl border border-white/10 bg-[#0f172a] p-1.5 shadow-2xl z-40 space-y-0.5 text-left animate-in fade-in zoom-in-95 duration-100">
                                {order.fulfillmentStatus === "AWAITING_COURIER" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      handleDispatchReady(order.id, order.orderNumber);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/15 transition-colors cursor-pointer"
                                  >
                                    <KeyRound className="h-3.5 w-3.5" />
                                    <span>Generate Pickup OTP</span>
                                  </button>
                                )}

                                {order.otpCode && (
                                  <div className="px-2.5 py-1.5 text-[11px] font-mono text-cyan-300 bg-cyan-500/10 rounded-lg">
                                    Pickup OTP: {order.otpCode}
                                  </div>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    toast.info(`Customer: ${order.customerName}`, {
                                      description: `Phone: ${order.customerPhone} | Zone: ${order.deliveryZone}`,
                                    });
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                                >
                                  <Phone className="h-3.5 w-3.5 text-indigo-400" />
                                  <span>Customer Details</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

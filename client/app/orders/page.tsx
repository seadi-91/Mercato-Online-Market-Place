"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  ShoppingBag,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Eye,
  CreditCard,
  Copy,
  X,
  RefreshCw,
  Printer,
  Trash2,
} from "lucide-react";
import { CustomerHeader } from "@/components/layout/customer-header";
import { CustomerFooter } from "@/components/layout/footer";
import { CustomerBottomNav } from "@/components/layout/customer-bottom-nav";
import { useAuthStore } from "@/store";
import { fetchCustomerOrders, CustomerOrder } from "@/lib/api/orders";
import { getAccurateProductImage } from "@/lib/utils/product-image";
import { toast } from "sonner";

function OrdersPageContent() {
  const router = useRouter();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrderForView, setSelectedOrderForView] = useState<CustomerOrder | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<CustomerOrder | null>(null);
  const [copiedTxRef, setCopiedTxRef] = useState(false);

  const { token, user } = useAuthStore();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const fetchedOrders = await fetchCustomerOrders(token, user?.id);
      setOrders(fetchedOrders);
    } catch (err) {
      console.error("Failed to load customer orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    const target = orders.find((o) => o.id === orderId);
    const updated = orders.filter((o) => o.id !== orderId);
    setOrders(updated);
    if (selectedOrderForView?.id === orderId) {
      setSelectedOrderForView(null);
    }
    toast.success(`Order #${target?.orderNumber || orderId} removed from view`, {
      description: "Order temporarily hidden. Click Undo to restore.",
      action: target
        ? {
            label: "Undo (መልስ)",
            onClick: () => {
              setOrders((prev) => [target, ...prev]);
              toast.success(`Order #${target.orderNumber} restored!`);
            },
          }
        : undefined,
    });
  };

  useEffect(() => {
    loadData();
  }, [token, user?.id]);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxRef(true);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopiedTxRef(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
            <CheckCircle2 className="h-3 w-3" />
            <span>Delivered</span>
          </span>
        );
      case "IN_TRANSIT":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">
            <Truck className="h-3 w-3" />
            <span>In Transit</span>
          </span>
        );
      case "READY_FOR_PICKUP":
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
            <Clock className="h-3 w-3" />
            <span>Processing</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            <ShieldCheck className="h-3 w-3" />
            <span>Confirmed & Paid</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100 text-zinc-900 dark:bg-[#070a12] dark:text-zinc-100 transition-colors duration-200">
      <CustomerHeader />

      <main className="flex-1 mx-auto max-w-4xl w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-8 pb-24 sm:pb-12 space-y-6">
        {/* Navigation Breadcrumb & Page Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              <Link href="/profile" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                Profile
              </Link>
              <span>/</span>
              <span className="text-zinc-800 dark:text-zinc-200 font-medium">Orders</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
              <Package className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
              <span>My Orders</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-200 dark:bg-white/10 text-zinc-700 dark:text-zinc-300">
                {orders.length}
              </span>
            </h1>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-zinc-50 dark:hover:bg-white/10 text-xs font-semibold text-zinc-700 dark:text-zinc-300 shadow-sm active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Orders List Container */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0b101f] p-12 text-center space-y-4 shadow-xl">
            <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center mx-auto text-zinc-400">
              <Package className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">No orders placed yet</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Your protected purchases will appear here sorted by order date.
              </p>
            </div>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 hover:brightness-110 active:scale-95 transition-all"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Explore Marketplace</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* 
              CLEAN ORDER CARD (User Requested):
              Only shows Order ID, Payment ID, Date, Price, and View Details button.
              Products and images are NOT listed here; they appear strictly inside the View Details modal!
            */}
            {orders.map((order) => {
              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-zinc-200/90 dark:border-white/10 bg-white dark:bg-[#0b101f] p-4 sm:p-5 shadow-md hover:shadow-lg transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Order ID, Date, and Status */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                          Order ID:
                        </span>
                        <span className="text-sm font-bold text-zinc-900 dark:text-white font-mono">
                          {order.orderNumber}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>

                      {/* Payment ID & Date Row */}
                      <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                          <span>
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <span>•</span>

                        <div className="flex items-center gap-1.5 font-mono text-[11.5px]">
                          <span className="text-zinc-400 dark:text-zinc-500 font-sans text-xs">Payment ID:</span>
                          <span className="text-zinc-700 dark:text-zinc-300 font-semibold truncate max-w-[170px] sm:max-w-xs">
                            {order.txRef}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Price & View Details Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-white/5">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
                          Total Price:
                        </span>
                        <span className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                          {order.totalAmount.toLocaleString()} ETB
                        </span>
                      </div>

                      {/* View Details Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedOrderForView(order)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Details</span>
                      </button>

                      {/* Delete Order (Trash Icon) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOrderToDelete(order);
                        }}
                        className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60 transition-colors cursor-pointer shrink-0"
                        title="Delete Order (ጊዜያዊ ሰርዝ / Remove from list)"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* COMPREHENSIVE ORDER DETAILS MODAL                                  */}
        {/* Products, images, quantities, delivery, and payments ONLY appear   */}
        {/* inside this modal as explicitly requested by user!                 */}
        {/* ------------------------------------------------------------------ */}
        {selectedOrderForView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0b101f] text-zinc-900 dark:text-zinc-100 p-6 sm:p-7 shadow-2xl space-y-6">
              {/* Modal Top Bar */}
              <div className="flex items-start justify-between border-b border-zinc-100 dark:border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Order Details
                    </span>
                    {getStatusBadge(selectedOrderForView.status)}
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10.5px] font-semibold text-indigo-600 dark:text-indigo-400">
                      <ShieldCheck className="h-3 w-3" />
                      <span>100% Buyer Protected</span>
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white font-mono">
                    {selectedOrderForView.orderNumber}
                  </h2>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      Ordered on{" "}
                      {new Date(selectedOrderForView.createdAt).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrderForView(null)}
                  className="p-1.5 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Payment & Transaction Information Block */}
              <div className="rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/5 p-4 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold border-b border-zinc-200/60 dark:border-white/5 pb-2">
                  <CreditCard className="h-4 w-4 text-indigo-500" />
                  <span>Payment & Transaction Identification</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[10.5px]">Payment Method:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {selectedOrderForView.paymentMethod || "Chapa Hosted Gateway (Telebirr / CBE / Card)"}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400 block text-[10.5px]">Payment Status:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>
                        {selectedOrderForView.paymentStatus === "PAID"
                          ? "Paid & Secured in Escrow"
                          : selectedOrderForView.paymentStatus}
                      </span>
                    </span>
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-black/30 border border-zinc-200 dark:border-white/10">
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Payment ID (Transaction Reference):</span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-white text-xs">
                        {selectedOrderForView.txRef}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText(selectedOrderForView.txRef, "Transaction reference")}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/15 text-zinc-700 dark:text-zinc-200 text-xs transition-colors cursor-pointer"
                    >
                      <Copy className="h-3 w-3" />
                      <span>{copiedTxRef ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Delivery Information Block ("delivery information hulum ymula") */}
              <div className="rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/5 p-4 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold border-b border-zinc-200/60 dark:border-white/5 pb-2">
                  <Truck className="h-4 w-4 text-cyan-500" />
                  <span>Doorstep Delivery Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[10.5px]">Recipient Full Name:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {selectedOrderForView.deliveryAddress?.recipientName || "Customer"}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400 block text-[10.5px]">Phone Number (for SMS OTP):</span>
                    <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                      {selectedOrderForView.deliveryAddress?.phone || "Phone Provided"}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400 block text-[10.5px]">City:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {selectedOrderForView.deliveryAddress?.city || "Addis Ababa"}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400 block text-[10.5px]">Addis Ababa Subcity:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {selectedOrderForView.deliveryAddress?.subCity || "Addis Ababa"}
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-zinc-400 block text-[10.5px]">Specific Address / Building / Landmark:</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      {selectedOrderForView.deliveryAddress?.specificLocation || "Specific Location Provided"}
                    </span>
                  </div>

                  {selectedOrderForView.notes && (
                    <div className="sm:col-span-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300">
                      <span className="font-bold text-[10.5px] block">Courier Instructions:</span>
                      <span>{selectedOrderForView.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 
                PRODUCTS WITH IMAGES & QUANTITIES:
                Detailed list of all products, quantities, prices, and images ONLY shown here!
              */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="h-4 w-4 text-indigo-500" />
                    <span>Ordered Products ({selectedOrderForView.items?.length || 0})</span>
                  </h4>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    Product Breakdown
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedOrderForView.items.map((it, idx) => (
                    <div
                      key={it.id || idx}
                      className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={it.image || getAccurateProductImage(it.productTitle)}
                          alt={it.productTitle}
                          className="h-14 w-14 rounded-xl object-cover border border-zinc-200 dark:border-white/10 shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = getAccurateProductImage(it.productTitle);
                          }}
                        />
                        <div className="min-w-0">
                          <h5 className="font-bold text-zinc-900 dark:text-white truncate">
                            {it.productTitle}
                          </h5>
                          {(it.selectedSize || it.selectedColor) && (
                            <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400">
                              {it.selectedSize && `Size: ${it.selectedSize} `}
                              {it.selectedColor && `Color: ${it.selectedColor}`}
                            </p>
                          )}
                          <div className="mt-1 flex items-center gap-2 font-mono text-[11.5px]">
                            <span className="px-2 py-0.5 rounded-md bg-zinc-200/70 dark:bg-white/10 text-zinc-800 dark:text-zinc-200 font-bold">
                              Quantity: {it.quantity}
                            </span>
                            <span className="text-zinc-400">
                              × {it.unitPrice.toLocaleString()} ETB
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-zinc-400 block font-medium">Subtotal</span>
                        <span className="font-mono font-bold text-zinc-900 dark:text-white text-sm">
                          {it.totalPrice.toLocaleString()} ETB
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/5 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span>Items Subtotal</span>
                  <span className="font-mono text-zinc-900 dark:text-white">
                    {selectedOrderForView.subtotalAmount.toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span>Doorstep Courier Delivery</span>
                  <span className="font-mono text-zinc-900 dark:text-white">
                    {selectedOrderForView.deliveryFee === 0 ? "FREE" : `${selectedOrderForView.deliveryFee.toLocaleString()} ETB`}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span>Escrow Protection Protocol</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    100% Covered (0 ETB)
                  </span>
                </div>
                <div className="pt-2 border-t border-zinc-200 dark:border-white/10 flex justify-between font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
                  <span>Total Amount Paid</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">
                    {selectedOrderForView.totalAmount.toLocaleString()} ETB
                  </span>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-white/10 flex-wrap">
                <div className="flex items-center gap-2">
                  {/* Receipt Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrderForView(null);
                      router.push(`/receipt/${encodeURIComponent(selectedOrderForView.id)}`);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-indigo-300 dark:border-indigo-500/30 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print Receipt</span>
                  </button>

                  {/* Delete Order Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setOrderToDelete(selectedOrderForView);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors cursor-pointer"
                    title="Delete Order (ጊዜያዊ ሰርዝ)"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrderForView(null)}
                  className="px-6 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 dark:bg-white/10 dark:hover:bg-white/15 text-zinc-800 dark:text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal (Are You Sure?) */}
        {orderToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0b101f] p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-zinc-900 dark:text-zinc-100">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-sm">
                  <Trash2 className="w-6 h-6" />
                </div>
                <button
                  type="button"
                  onClick={() => setOrderToDelete(null)}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                  Are you sure you want to delete this order?
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  ይህን ትዕዛዝ በእርግጥ መሰረዝ ይፈልጋሉ? This will temporarily remove the order from your active list.
                </p>
              </div>

              {/* Target Order Summary Card */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 flex items-center gap-3">
                <img
                  src={orderToDelete.items?.[0]?.image || getAccurateProductImage(orderToDelete.items?.[0]?.productTitle)}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover border border-zinc-200 dark:border-white/10 shrink-0"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = getAccurateProductImage(orderToDelete.items?.[0]?.productTitle);
                  }}
                />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {orderToDelete.orderNumber}
                  </div>
                  <h4 className="font-semibold text-xs text-zinc-900 dark:text-white truncate">
                    {orderToDelete.items?.[0]?.productTitle || "Commercial Item"}
                  </h4>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                    Total: ETB {orderToDelete.totalAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setOrderToDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/15 transition-colors cursor-pointer"
                >
                  Cancel (ተው)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = orderToDelete.id;
                    setOrderToDelete(null);
                    handleDeleteOrder(id);
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
      </main>

      {/* Floating Mobile Bottom Navigation Bar */}
      <CustomerBottomNav />

      <CustomerFooter />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-[#070a12] text-zinc-900 dark:text-white">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      }
    >
      <OrdersPageContent />
    </Suspense>
  );
}

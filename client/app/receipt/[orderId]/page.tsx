"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Printer,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  CreditCard,
  Calendar,
  Hash,
  Store,
} from "lucide-react";
import { fetchCustomerOrders, CustomerOrder } from "@/lib/api/orders";
import { useAuthStore } from "@/store";

function ReceiptPageContent() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;
  const receiptRef = useRef<HTMLDivElement>(null);

  const { token, user } = useAuthStore();
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      setIsLoading(true);
      try {
        const allOrders = await fetchCustomerOrders(token, user?.id);
        const found = allOrders.find(
          (o) =>
            o.id === orderId ||
            o.orderNumber === orderId ||
            o.txRef === orderId
        );
        if (found) {
          setOrder(found);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Failed to load order for receipt:", err);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    loadOrder();
  }, [orderId, token, user?.id]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-[#070a12]">
        <div className="text-center space-y-3">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Generating receipt...</p>
        </div>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-[#070a12] p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="h-16 w-16 rounded-2xl bg-zinc-200 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center mx-auto">
            <Package className="h-8 w-8 text-zinc-400" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Order Not Found</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            We could not find an order matching this ID.
          </p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-sm font-bold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const printDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }
        @media print {
          html, body {
            margin: 0; padding: 0;
            background: #fff !important;
            color: #000 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print { display: none !important; }
          .receipt-card { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease forwards; }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-zinc-100 via-indigo-50/30 to-cyan-50/20 dark:from-[#060810] dark:via-[#070a12] dark:to-[#08101a] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">

        {/* TOP BAR */}
        <div className="no-print sticky top-0 z-30 backdrop-blur-xl bg-white/80 dark:bg-[#0b101f]/90 border-b border-zinc-200 dark:border-white/10 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-zinc-50 dark:hover:bg-white/10 text-xs font-semibold text-zinc-700 dark:text-zinc-300 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Order</span>
              </button>
              <span className="hidden sm:block text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                Receipt — {order.orderNumber}
              </span>
            </div>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* RECEIPT CARD */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in-up">
          <div ref={receiptRef} className="receipt-card bg-white dark:bg-[#0b101f] rounded-3xl border border-zinc-200 dark:border-white/10 shadow-2xl overflow-hidden">

            {/* GRADIENT HEADER */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-500 to-cyan-500 px-6 sm:px-10 py-8 text-white overflow-hidden">
              <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/5 pointer-events-none" />
              <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/5 pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg">
                      <Store className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-black tracking-tight">MercatoX</h1>
                      <p className="text-[11px] text-emerald-100 font-medium">Ethiopia&apos;s Escrow-Protected Marketplace</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 bg-white/15 rounded-full px-3 py-1 w-fit">
                    <ShieldCheck className="h-3.5 w-3.5 text-indigo-200" />
                    <span className="text-xs text-indigo-100 font-semibold">100% Escrow Protected Transaction</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-0.5">Official Receipt</div>
                  <div className="text-3xl font-black tracking-tight leading-none font-mono">RECEIPT</div>
                  <div className="mt-1.5 text-[11px] text-indigo-100 font-mono">Printed: {printDate}</div>
                </div>
              </div>
            </div>

            {/* META STRIP */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-zinc-200 dark:bg-white/5">
              {[
                { icon: <Hash className="h-3.5 w-3.5 text-indigo-500" />, label: "Order ID", value: order.orderNumber, mono: true, highlight: false },
                { icon: <Calendar className="h-3.5 w-3.5 text-cyan-500" />, label: "Order Date", value: new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), mono: false, highlight: false },
                { icon: <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500" />, label: "Payment Status", value: order.paymentStatus === "PAID" ? "Paid & Secured" : order.paymentStatus, mono: false, highlight: true },
                { icon: <Truck className="h-3.5 w-3.5 text-indigo-500" />, label: "Order Status", value: order.status.replace(/_/g, " "), mono: false, highlight: false },
              ].map((item, i) => (
                <div key={i} className="bg-zinc-50 dark:bg-[#0b101f] px-4 py-3 text-xs">
                  <div className="flex items-center gap-1 text-zinc-400 mb-0.5">
                    {item.icon}
                    <span className="uppercase tracking-wider text-[9.5px] font-semibold">{item.label}</span>
                  </div>
                  <span className={`font-bold text-[11px] block truncate ${item.mono ? "font-mono" : ""} ${item.highlight ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-900 dark:text-white"}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="px-6 sm:px-10 py-6 space-y-6">

              {/* PAYMENT INFO */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-indigo-500" />
                  <h2 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest">Payment Information</h2>
                </div>
                <div className="rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-white/10">
                    <div className="px-4 py-3 bg-zinc-50 dark:bg-white/[0.02]">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-0.5">Payment Method</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {order.paymentMethod || "Chapa Hosted Gateway (Telebirr / CBE / Card)"}
                      </span>
                    </div>
                    <div className="px-4 py-3 bg-zinc-50 dark:bg-white/[0.02]">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-0.5">Transaction Reference (Payment ID)</span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-white break-all">{order.txRef}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* DELIVERY INFO */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-cyan-500" />
                  <h2 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest">Delivery Information</h2>
                </div>
                <div className="rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-white/10">
                    <div className="px-4 py-3 bg-zinc-50 dark:bg-white/[0.02]">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-0.5">Recipient</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{order.deliveryAddress?.recipientName || "Customer"}</span>
                      <span className="font-mono text-zinc-500 dark:text-zinc-400 block mt-0.5">{order.deliveryAddress?.phone || "—"}</span>
                    </div>
                    <div className="px-4 py-3 bg-zinc-50 dark:bg-white/[0.02]">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-0.5">City / Subcity</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{order.deliveryAddress?.city || "Addis Ababa"}</span>
                      <span className="text-zinc-500 dark:text-zinc-400 block mt-0.5">{order.deliveryAddress?.subCity || "—"}</span>
                    </div>
                    <div className="px-4 py-3 bg-zinc-50 dark:bg-white/[0.02]">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-0.5">Specific Address</span>
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">{order.deliveryAddress?.specificLocation || "—"}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* PRODUCTS TABLE */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-indigo-500" />
                  <h2 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest">
                    Ordered Products ({order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""})
                  </h2>
                </div>
                <div className="rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden">
                  <div className="grid grid-cols-12 bg-zinc-100 dark:bg-white/[0.04] px-3 py-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    <div className="col-span-7">Product</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-1 text-right hidden sm:block">Unit (ETB)</div>
                    <div className="col-span-2 text-right">Subtotal</div>
                  </div>
                  <div className="divide-y divide-zinc-200 dark:divide-white/5">
                    {order.items.map((item, idx) => (
                      <div key={item.id || idx} className="grid grid-cols-12 items-center px-3 py-3 text-xs bg-white dark:bg-transparent hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                        <div className="col-span-7 flex items-center gap-3 min-w-0">
                          <div className="shrink-0">
                            <img
                              src={item.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=70"}
                              alt={item.productTitle}
                              className="h-12 w-12 rounded-xl object-cover border border-zinc-200 dark:border-white/10"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=70";
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-zinc-900 dark:text-white truncate">{item.productTitle}</p>
                            {(item.selectedSize || item.selectedColor) && (
                              <p className="text-[10.5px] text-zinc-400 mt-0.5">
                                {item.selectedSize && `Size: ${item.selectedSize}`}
                                {item.selectedSize && item.selectedColor && " · "}
                                {item.selectedColor && `Color: ${item.selectedColor}`}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="col-span-2 text-center">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-white/10 font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                            × {item.quantity}
                          </span>
                        </div>
                        <div className="col-span-1 text-right font-mono text-zinc-500 dark:text-zinc-400 hidden sm:block">
                          {item.unitPrice.toLocaleString()}
                        </div>
                        <div className="col-span-2 text-right font-mono font-bold text-zinc-900 dark:text-white">
                          {item.totalPrice.toLocaleString()}
                          <span className="text-[9px] text-zinc-400 font-sans ml-0.5">ETB</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* FINANCIAL SUMMARY */}
              <section>
                <div className="rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden">
                  <div className="bg-zinc-50 dark:bg-white/[0.02] px-6 py-4 space-y-2.5 text-xs">
                    <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                      <span>Items Subtotal</span>
                      <span className="font-mono text-zinc-800 dark:text-zinc-200">{order.subtotalAmount.toLocaleString()} ETB</span>
                    </div>
                    <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                      <span>Doorstep Delivery Fee</span>
                      <span className="font-mono text-zinc-800 dark:text-zinc-200">
                        {order.deliveryFee === 0 ? "FREE" : `${order.deliveryFee.toLocaleString()} ETB`}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                      <span>Escrow Protection Fee</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">FREE (0 ETB)</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-zinc-200 dark:border-white/10 pt-3 mt-1">
                      <span className="text-base font-black text-zinc-900 dark:text-white">Total Amount Paid</span>
                      <span className="text-xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                        {order.totalAmount.toLocaleString()} ETB
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-6 py-3 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-bold text-sm">Payment Confirmed &amp; Secured in Escrow</span>
                    </div>
                    <span className="font-black text-lg border-2 border-white/50 rounded-lg px-3 py-0.5 tracking-widest">PAID</span>
                  </div>
                </div>
              </section>

              {/* ESCROW STEPS */}
              <section className="rounded-2xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/70 dark:bg-indigo-500/5 p-4 space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider text-[10px]">
                    MercatoX Escrow Protection — How It Works
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { step: "1", title: "Money Locked in Escrow", desc: "Your payment is held securely. The merchant does not receive funds until delivery is verified." },
                    { step: "2", title: "Courier Dispatched", desc: "Your merchant prepares items within Addis Ababa. You receive real-time courier updates via SMS." },
                    { step: "3", title: "Doorstep SMS OTP", desc: "Inspect items on arrival. Provide your 4-digit SMS OTP to the courier to release payment." },
                  ].map((s) => (
                    <div key={s.step} className="flex gap-2.5">
                      <div className="h-5 w-5 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                        {s.step}
                      </div>
                      <div>
                        <p className="font-bold text-indigo-800 dark:text-indigo-300">{s.title}</p>
                        <p className="text-indigo-700/80 dark:text-indigo-400/80 mt-0.5 leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* FOOTER */}
              <div className="border-t border-zinc-200 dark:border-white/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10.5px] text-zinc-400">
                <div className="space-y-0.5 text-center sm:text-left">
                  <p className="font-semibold text-zinc-600 dark:text-zinc-400">MercatoX — Ethiopia&apos;s Trusted Online Marketplace</p>
                  <p>This is an automatically generated electronic receipt. For support, visit mercatox.com/support</p>
                </div>
                <div className="text-center sm:text-right space-y-0.5 font-mono">
                  <p className="font-bold text-zinc-700 dark:text-zinc-300">{order.orderNumber}</p>
                  <p>{order.txRef}</p>
                </div>
              </div>
            </div>
          </div>

          {/* PRINT CTA */}
          <div className="no-print mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-sm font-bold shadow-xl shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print Receipt / Save as PDF</span>
            </button>
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-zinc-50 dark:hover:bg-white/10 text-zinc-800 dark:text-white text-sm font-semibold shadow-md active:scale-95 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to My Orders</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ReceiptPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-[#070a12]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      }
    >
      <ReceiptPageContent />
    </Suspense>
  );
}
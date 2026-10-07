"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  BadgeDollarSign,
  Truck,
  Calendar,
  ShieldCheck,
  CircleDashed,
  CreditCard,
  Copy,
  Check,
} from "lucide-react";
import { api } from "@/services/api/client";
import { fetchAllProducts } from "@/lib/api/catalog";

interface AdminOrderDetailItem {
  id: string;
  productId: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sellerId?: string;
  sellerName?: string;
  sellerEmail?: string;
}

const isValidUuid = (value?: string) =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const fetchSafeUserDetails = async (userId?: string) => {
  if (!isValidUuid(userId)) return null;

  try {
    return await api.get<any>(`/admin/users/${userId}/details`);
  } catch {
    return null;
  }
};

const fetchPaymentDetails = async (orderId: string) => {
  if (!isValidUuid(orderId)) return null;
  try {
    return await api.get<any>(`/payments/order/${orderId}`);
  } catch {
    try {
      const res = await fetch(`/api/payments?orderId=${encodeURIComponent(orderId)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.payments) && json.payments.length > 0) {
          return json.payments[0];
        }
      }
    } catch {}
    return null;
  }
};

interface AdminOrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  subtotalAmount: number;
  deliveryFee: number;
  createdAt: string;
  customerId: string;
  sellerId: string;
  txRef?: string;
  payment?: {
    id?: string;
    transactionReference?: string;
    amount?: number;
    currency?: string;
    provider?: string;
    status?: string;
    escrowStatus?: string;
    providerReference?: string;
    createdAt?: string;
    updatedAt?: string;
    metadata?: any;
  } | null;
  deliveryAddress?: {
    recipientName?: string;
    recipientPhone?: string;
    city?: string;
    subCity?: string;
    specificLocation?: string;
    phone?: string;
  };
  customer?: {
    id: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    alternatePhone?: string;
  };
  seller?: {
    id: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    alternatePhone?: string;
    shopName?: string;
  };
  items?: AdminOrderDetailItem[];
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId;

  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedTx, setCopiedTx] = useState(false);

  const handleCopyTx = (txRef?: string) => {
    if (!txRef) return;
    navigator.clipboard.writeText(txRef);
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  };

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setLoading(false);
        setError("Missing order ID.");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let orderList: any[] = [];
        try {
          const ordersResponse = await api.get<{ data?: any[] } | any[]>(`/admin/orders?page=1&limit=100`);
          orderList = Array.isArray(ordersResponse)
            ? ordersResponse
            : Array.isArray(ordersResponse?.data)
              ? ordersResponse.data
              : [];
        } catch (apiErr) {
          console.warn("Falling back to local /api/orders:", apiErr);
          const fb = await fetch("/api/orders");
          if (fb.ok) {
            const fbJson = await fb.json();
            orderList = fbJson.orders || [];
          }
        }

        const found = orderList.find((item) => item.id === orderId);

        if (!found) {
          setError("Order not found.");
          setOrder(null);
          return;
        }

        const customerId = found.customerId;
        const sellerId = found.sellerId;

        const [customerData, sellerData, catalogResult, paymentData] = await Promise.all([
          fetchSafeUserDetails(customerId),
          fetchSafeUserDetails(sellerId),
          fetchAllProducts({ limit: 200 }),
          fetchPaymentDetails(orderId),
        ]);

        const catalogById = new Map(
          (catalogResult.products || []).map((product: any) => [product.id, product]),
        );

        const normalizedItems = (found.items || []).map((item: any) => {
          const catalogProduct = catalogById.get(item.productId);
          const resolvedSellerId = catalogProduct?.sellerId || sellerId || item.sellerId;
          const resolvedSellerName =
            catalogProduct?.shopName ||
            sellerData?.shopName ||
            sellerData?.fullName ||
            sellerData?.name ||
            "Seller";
          const resolvedSellerEmail = sellerData?.email || "";

          return {
            id: item.id,
            productId: item.productId,
            productTitle: catalogProduct?.name || item.productTitle || "Product",
            quantity: Number(item.quantity || 0),
            unitPrice: Number(item.unitPrice || 0),
            totalPrice: Number(item.totalPrice || item.unitPrice * item.quantity || 0),
            sellerId: resolvedSellerId,
            sellerName: resolvedSellerName,
            sellerEmail: resolvedSellerEmail,
          };
        });

        const normalized: AdminOrderDetail = {
          id: found.id,
          orderNumber: found.orderNumber,
          status: found.status,
          paymentStatus: found.paymentStatus,
          subtotalAmount: Number(found.subtotalAmount || 0),
          deliveryFee: Number(found.deliveryFee || 0),
          totalAmount: Number(found.totalAmount || 0),
          createdAt: found.createdAt,
          customerId,
          sellerId,
          txRef: found.txRef || paymentData?.transactionReference,
          payment: paymentData || null,
          deliveryAddress: found.deliveryAddress,
          customer: customerData
            ? {
                id: customerData.userId || customerData.id,
                fullName: customerData.fullName || customerData.name,
                email: customerData.email,
                phoneNumber: customerData.phoneNumber || customerData.alternatePhone,
                alternatePhone: customerData.alternatePhone,
              }
            : undefined,
          seller: sellerData
            ? {
                id: sellerData.userId || sellerData.id,
                fullName: sellerData.fullName || sellerData.name,
                email: sellerData.email,
                phoneNumber: sellerData.phoneNumber || sellerData.alternatePhone,
                alternatePhone: sellerData.alternatePhone,
                shopName: sellerData.shopName || sellerData.businessName,
              }
            : undefined,
          items: normalizedItems,
        };

        setOrder(normalized);
      } catch (err) {
        console.error("Failed to load admin order detail:", err);
        setError("Unable to load order details.");
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b12] text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="mt-3 text-sm text-zinc-400">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#070b12] text-white p-6 flex items-center justify-center">
        <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-sm text-zinc-300">{error || "Order not found."}</p>
          <button
            type="button"
            onClick={() => router.push("/dashboard/admin")}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to admin dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b12] text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard/admin")}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to admin
          </button>

          <Link
            href="/dashboard/admin"
            className="text-sm text-indigo-300 hover:text-indigo-200"
          >
            Orders list
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0d121f]/90 p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-indigo-300">Order detail</p>
              <h1 className="mt-1 text-2xl font-bold text-white">{order.orderNumber}</h1>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-200">
              <ShieldCheck className="h-4 w-4" />
              {order.status}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <Calendar className="h-4 w-4" />
                <span className="text-[10px] uppercase tracking-[0.18em]">Created</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-white">
                {new Date(order.createdAt).toLocaleString("en-ET", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <BadgeDollarSign className="h-4 w-4" />
                <span className="text-[10px] uppercase tracking-[0.18em]">Total</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-emerald-400">
                ETB {Number(order.totalAmount || 0).toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <CircleDashed className="h-4 w-4" />
                <span className="text-[10px] uppercase tracking-[0.18em]">Payment</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-white">{order.paymentStatus}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <Truck className="h-4 w-4" />
                <span className="text-[10px] uppercase tracking-[0.18em]">Delivery</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-white">{order.status}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 xl:col-span-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-white">Customer info</h2>
              </div>

              <div className="mt-4 space-y-3 text-sm text-zinc-300">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">Name</p>
                  <p className="mt-1 text-white">{order.customer?.fullName || "Unknown customer"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-zinc-400" />
                  <span>{order.customer?.email || "No email"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-zinc-400" />
                  <span>{order.customer?.phoneNumber || order.customer?.alternatePhone || "No phone"}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 xl:col-span-1">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-cyan-400" />
                <h2 className="text-sm font-semibold text-white">Product owner</h2>
              </div>

              <div className="mt-4 space-y-3 text-sm text-zinc-300">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">Seller / owner</p>
                  <p className="mt-1 text-white">{order.seller?.fullName || order.seller?.shopName || "Unknown seller"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-zinc-400" />
                  <span>{order.seller?.email || "No email"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-zinc-400" />
                  <span>{order.seller?.phoneNumber || order.seller?.alternatePhone || "No phone"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                  <span>{order.seller?.shopName ? `Shop: ${order.seller.shopName}` : "Seller profile"}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 xl:col-span-1">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-white">Delivery address</h2>
              </div>

              <div className="mt-4 space-y-2 text-sm text-zinc-300">
                <p className="text-white">{order.deliveryAddress?.recipientName || "Customer"}</p>
                <p>{order.deliveryAddress?.recipientPhone || order.deliveryAddress?.phone || "No phone"}</p>
                <p>{order.deliveryAddress?.city || "City not provided"}</p>
                <p>{order.deliveryAddress?.subCity || "Subcity not provided"}</p>
                <p>{order.deliveryAddress?.specificLocation || "Specific location not provided"}</p>
              </div>
            </div>
          </div>

          {/* SECTION: Payment & Escrow Governance Information */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-400" />
                <div>
                  <h2 className="text-sm font-semibold text-white">Payment & Escrow Information</h2>
                  <p className="text-[11px] text-zinc-400">Microservice payment record from MercatoX Payment Service</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  order.payment?.escrowStatus === "RELEASED"
                    ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                }`}>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {order.payment?.escrowStatus === "RELEASED" ? "Escrow Payout Released" : "Secured in Escrow Custody"}
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-white/5 bg-[#0b1220] p-3.5">
                <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">Transaction Reference</p>
                <div className="mt-1 flex items-center justify-between gap-1">
                  <span className="font-mono text-xs font-semibold text-indigo-300 break-all select-all">
                    {order.payment?.transactionReference || order.txRef || `MX-CHAPA-${order.orderNumber}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyTx(order.payment?.transactionReference || order.txRef || `MX-CHAPA-${order.orderNumber}`)}
                    className="shrink-0 p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Copy reference"
                  >
                    {copiedTx ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {order.payment?.providerReference && (
                  <p className="mt-1 text-[10px] text-zinc-500 font-mono">
                    Provider Ref: {order.payment.providerReference}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-white/5 bg-[#0b1220] p-3.5">
                <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">Payment Gateway</p>
                <p className="mt-1 font-semibold text-white">
                  {order.payment?.provider
                    ? `${order.payment.provider} Escrow Gateway`
                    : "Chapa Hosted Escrow Gateway"}
                </p>
                <p className="mt-1 text-[10px] text-zinc-400">
                  {order.payment?.currency || "ETB"} • Electronic Escrow Settlement
                </p>
              </div>

              <div className="rounded-xl border border-white/5 bg-[#0b1220] p-3.5">
                <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">Payment Status</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${
                    (order.payment?.status || order.paymentStatus) === "COMPLETED" || (order.payment?.status || order.paymentStatus) === "PAID"
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                  }`}>
                    {(order.payment?.status || order.paymentStatus) === "COMPLETED" || (order.payment?.status || order.paymentStatus) === "PAID"
                      ? "Completed (Paid)"
                      : (order.payment?.status || order.paymentStatus)}
                  </span>
                </div>
                {order.payment?.createdAt && (
                  <p className="mt-1 text-[10px] text-zinc-500">
                    Paid at: {new Date(order.payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-white/5 bg-[#0b1220] p-3.5">
                <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">Escrow Amount Safeguarded</p>
                <p className="mt-1 text-base font-bold text-emerald-400 font-mono">
                  ETB {Number(order.payment?.amount || order.totalAmount).toLocaleString()}
                </p>
                <p className="mt-1 text-[10px] text-emerald-300/80 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 shrink-0" />
                  Buyer protection active until delivery
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">Products ordered</h2>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-white/[0.03] text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                  <tr>
                    <th className="px-3 py-2">Product & seller</th>
                    <th className="px-3 py-2">Qty</th>
                    <th className="px-3 py-2">Unit price</th>
                    <th className="px-3 py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-zinc-400">
                        No items found for this order.
                      </td>
                    </tr>
                  ) : (
                    (order.items || []).map((item) => (
                      <tr key={item.id} className="border-t border-white/10">
                        <td className="px-3 py-3 text-white">
                          <div className="font-medium">{item.productTitle}</div>
                          <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-zinc-400">
                            {item.sellerName || "Unknown seller"}
                          </div>
                          {item.sellerEmail ? (
                            <div className="mt-1 text-[10px] text-zinc-500">{item.sellerEmail}</div>
                          ) : null}
                        </td>
                        <td className="px-3 py-3">{item.quantity}</td>
                        <td className="px-3 py-3">ETB {Number(item.unitPrice || 0).toLocaleString()}</td>
                        <td className="px-3 py-3 text-emerald-400">ETB {Number(item.totalPrice || 0).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid gap-3 rounded-xl border border-white/10 bg-[#0b1220] p-3 text-xs text-zinc-300 sm:grid-cols-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Subtotal</p>
                <p className="mt-1 text-sm font-semibold text-white">ETB {Number(order.subtotalAmount || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Delivery fee</p>
                <p className="mt-1 text-sm font-semibold text-white">ETB {Number(order.deliveryFee || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Grand total</p>
                <p className="mt-1 text-sm font-semibold text-emerald-400">ETB {Number(order.totalAmount || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

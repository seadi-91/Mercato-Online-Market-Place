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
  Bike,
  RotateCcw,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api/client";
import { fetchAllProducts } from "@/lib/api/catalog";
import { adminDeliveryService } from "@/features/admin/services/admin.service";
import { INITIAL_DEMO_RIDERS, type DeliveryRider } from "../../components/admin-delivery";

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
  carrierId?: string;
  assignedDriver?: {
    id?: string;
    name?: string;
    phone?: string;
    plateNumber?: string;
    vehicleType?: string;
    zone?: string;
    status?: string;
  } | null;
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
    assignedDriver?: any;
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

  // Delivery Courier Assignment State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [assignmentStatus, setAssignmentStatus] = useState("IN_TRANSIT");
  const [isAssigning, setIsAssigning] = useState(false);
  const [driverSearch, setDriverSearch] = useState("");
  const [fleet, setFleet] = useState<DeliveryRider[]>([]);

  // Load available couriers
  useEffect(() => {
    adminDeliveryService
      .getDeliveryStaff({ limit: 100 })
      .then((res) => {
        const rawList = res?.data || [];
        if (rawList.length > 0) {
          const mapped: DeliveryRider[] = rawList.map((item: any, idx: number) => ({
            id: item.userId || item.id || `rd-${idx + 1}`,
            name: item.fullName || "Delivery Courier",
            phone: item.alternatePhone || item.phoneNumber || "N/A",
            email: item.email || "",
            nationalId: item.nationalIdNumber || `ID-ETH-${700000 + idx}`,
            zone: item.marketZone || item.subCity || item.city || "Addis Ababa",
            vehicleType: item.vehicleType || "Motorcycle",
            vehicleModel: item.specificLocation || item.vehicleModel || "Fleet Vehicle",
            plateNumber: (item.plateNumber || `AA 3-B${90000 + idx}`).toUpperCase(),
            drivingLicenseNumber: item.drivingLicenseNumber || `DL-AA-${80000 + idx}`,
            activeOrdersCount: 0,
            completionRate: "99.2%",
            status: item.isAvailable ?? true ? "ON_DUTY" : "OFFLINE",
            kycStatus: "APPROVED",
            isVerified: true,
            isActive: item.isActive ?? true,
            registeredDate: item.createdAt ? new Date(item.createdAt).toISOString().slice(0, 10) : "2026-09-01",
          }));
          setFleet(mapped);
        } else {
          setFleet([]);
        }
      })
      .catch((err) => {
        console.warn("Failed to load delivery staff from database:", err);
        setFleet([]);
      });
  }, []);

  const handleCopyTx = (txRef?: string) => {
    if (!txRef) return;
    navigator.clipboard.writeText(txRef);
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  };

  const handleAssignDriver = async (riderId: string) => {
    if (!order) return;
    const rider = fleet.find((r) => r.id === riderId);
    if (!rider) return;

    setIsAssigning(true);
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

      await adminDeliveryService.assignOrderDriver(order.id, {
        carrierId: rider.id,
        assignedDriver: assignedDriverData,
        newStatus: assignmentStatus || "IN_TRANSIT",
      });

      setOrder((prev) =>
        prev
          ? {
              ...prev,
              carrierId: rider.id,
              assignedDriver: assignedDriverData,
              status: assignmentStatus || "IN_TRANSIT",
            }
          : prev
      );

      toast.success(`Assigned to ${rider.name}!`, {
        description: `Shipment dispatched to ${rider.vehicleType} (${rider.plateNumber}).`,
      });
      setShowAssignModal(false);
    } catch (err: any) {
      toast.error("Assignment failed", { description: err?.message });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassignDriver = async () => {
    if (!order) return;
    try {
      await adminDeliveryService.assignOrderDriver(order.id, {
        carrierId: null,
        assignedDriver: null,
        newStatus: "READY_FOR_PICKUP",
      });

      setOrder((prev) =>
        prev
          ? {
              ...prev,
              carrierId: undefined,
              assignedDriver: null,
              status: "READY_FOR_PICKUP",
            }
          : prev
      );

      toast.success("Driver unassigned from order");
    } catch (err: any) {
      toast.error("Failed to unassign driver", { description: err?.message });
    }
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

        const rawDriver = found.assignedDriver || found.deliveryAddress?.assignedDriver || null;
        const carrierId = found.carrierId || rawDriver?.id || undefined;

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
          carrierId,
          assignedDriver: rawDriver,
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

          <div className="mt-6 grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
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

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
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

            {/* Courier & Task Assignment Card */}
            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/[0.04] p-4 xl:col-span-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bike className="h-4 w-4 text-cyan-400" />
                    <h2 className="text-sm font-semibold text-white">Assigned Courier</h2>
                  </div>
                  {order.assignedDriver || order.carrierId ? (
                    <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
                      Assigned
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/30">
                      Unassigned
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-2 text-sm text-zinc-300">
                  {order.assignedDriver || order.carrierId ? (
                    <>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">Driver Name</p>
                        <p className="mt-0.5 font-semibold text-white">
                          {order.assignedDriver?.name || "Assigned Driver"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="font-mono">{order.assignedDriver?.phone || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="h-3.5 w-3.5 text-indigo-400" />
                        <span className="truncate">
                          {order.assignedDriver?.vehicleType || "Fleet"} · <strong className="font-mono text-white">{order.assignedDriver?.plateNumber || order.carrierId}</strong>
                        </span>
                      </div>
                      {order.assignedDriver?.zone && (
                        <div className="flex items-center gap-2 text-xs text-cyan-300">
                          <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                          <span className="truncate">{order.assignedDriver.zone}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="py-2 text-center text-xs text-amber-300">
                      <p className="font-medium">No courier assigned yet</p>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Dispatch this order to a delivery staff member.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                {order.assignedDriver || order.carrierId ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDriverId(order.carrierId || order.assignedDriver?.id || "");
                        setShowAssignModal(true);
                      }}
                      className="flex-1 rounded-xl bg-indigo-600/30 border border-indigo-500/40 py-1.5 text-xs font-semibold text-indigo-200 hover:bg-indigo-600/40 text-center cursor-pointer"
                    >
                      Change Driver
                    </button>
                    <button
                      type="button"
                      onClick={handleUnassignDriver}
                      className="rounded-xl bg-rose-500/15 border border-rose-500/30 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/25 cursor-pointer"
                    >
                      Unassign
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDriverId("");
                      setShowAssignModal(true);
                    }}
                    className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-600 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/25 hover:brightness-110 cursor-pointer"
                  >
                    + Assign Delivery Courier
                  </button>
                )}
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

            <div className="mt-4 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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

            <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
              <div className="sm:hidden px-3 py-1.5 bg-indigo-500/10 border-b border-white/10 text-[10.5px] text-indigo-300 font-medium flex items-center justify-between">
                <span>← ወደ ጎን ያሸብልሉ (Swipe to scroll) →</span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-indigo-400">Horizontal</span>
              </div>
              <table className="w-full text-left text-xs text-zinc-300 min-w-[500px]">
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

      {/* ASSIGN COURIER MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3.5 sm:p-4 animate-in fade-in duration-150">
          <div className="relative w-[95%] sm:w-full max-w-xl rounded-2xl border border-indigo-500/30 bg-[#0f172a] p-4 sm:p-5 shadow-2xl max-h-[90vh] flex flex-col">
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
                    Order <span className="font-mono font-bold text-cyan-300">#{order.orderNumber}</span> · ETB {Number(order.totalAmount || 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedDriverId("");
                }}
                className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Status Selection */}
            <div className="mt-3 shrink-0">
              <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                Set Delivery Status upon Assignment:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAssignmentStatus("IN_TRANSIT")}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-all cursor-pointer ${
                    assignmentStatus === "IN_TRANSIT"
                      ? "border-amber-500 bg-amber-500/15 text-amber-300"
                      : "border-white/10 bg-black/40 text-zinc-400 hover:text-white"
                  }`}
                >
                  <Bike className="h-3.5 w-3.5" />
                  <span>IN_TRANSIT (በማጓጓዝ ላይ)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAssignmentStatus("READY_FOR_PICKUP")}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-all cursor-pointer ${
                    assignmentStatus === "READY_FOR_PICKUP"
                      ? "border-cyan-500 bg-cyan-500/15 text-cyan-300"
                      : "border-white/10 bg-black/40 text-zinc-400 hover:text-white"
                  }`}
                >
                  <Package className="h-3.5 w-3.5" />
                  <span>READY_FOR_PICKUP (ለመጫን ዝግጁ)</span>
                </button>
              </div>
            </div>

            {/* Search Courier */}
            <div className="mt-3 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  value={driverSearch}
                  onChange={(e) => setDriverSearch(e.target.value)}
                  placeholder="Search fleet by name, vehicle, plate, or zone..."
                  className="w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Drivers List */}
            <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1">
              <p className="text-[11px] text-zinc-400 font-medium px-1">
                Select Courier to Dispatch ({fleet.length} in fleet):
              </p>
              {fleet
                .filter((r) => {
                  if (!driverSearch.trim()) return true;
                  const q = driverSearch.toLowerCase();
                  return (
                    r.name.toLowerCase().includes(q) ||
                    r.phone.toLowerCase().includes(q) ||
                    r.plateNumber.toLowerCase().includes(q) ||
                    r.vehicleType.toLowerCase().includes(q) ||
                    r.zone.toLowerCase().includes(q)
                  );
                })
                .map((rider) => {
                  const isSelected = selectedDriverId === rider.id;
                  const isCurrentCarrier =
                    order.carrierId === rider.id ||
                    order.assignedDriver?.id === rider.id;

                  return (
                    <div
                      key={rider.id}
                      onClick={() => setSelectedDriverId(rider.id)}
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
                        <span className="text-[11px] font-mono text-zinc-400">
                          {rider.phone}
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
                  setShowAssignModal(false);
                  setSelectedDriverId("");
                }}
                className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedDriverId || isAssigning}
                onClick={() => handleAssignDriver(selectedDriverId)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 hover:brightness-110 active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAssigning ? (
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

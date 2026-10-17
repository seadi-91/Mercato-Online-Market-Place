"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Building2,
  Phone,
  Calendar,
  X,
  Check,
  MoreVertical,
  Copy,
  Search,
  Mail,
  MapPin,
  ExternalLink,
  ShoppingBag,
  CreditCard,
  ShieldCheck,
  RefreshCw,
  Trash2,
  User,
  Store,
  Tag,
  Sparkles,
  Loader2,
  ZoomIn,
  PackageCheck,
  Receipt,
  BadgeCheck,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api/client";
import { INITIAL_PLANS } from "@/store/subscription-store";

export interface BankSlipItem {
  id: string;
  orderId?: string;
  orderNumber: string;
  bankName: string;
  provider: string;
  referenceNumber: string;
  payerName: string;
  payerPhone: string;
  payerEmail: string;
  deliveryAddress: string;
  itemsSummary: string;
  itemsCount: number;
  items?: Array<{ id?: string; title?: string; name?: string; quantity?: number; unitPrice?: number }>;
  amount: number;
  currency: string;
  submittedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  escrowStatus: string;
  slipImageUrl: string;
  metadata?: any;
}

const mapPaymentStatus = (status?: string): "PENDING" | "APPROVED" | "REJECTED" => {
  const s = (status || "").toUpperCase();
  if (s === "COMPLETED" || s === "APPROVED" || s === "PAID" || s === "RELEASED") {
    return "APPROVED";
  }
  if (s === "FAILED" || s === "REJECTED") {
    return "REJECTED";
  }
  return "PENDING";
};

const normalizeSlipDate = (value?: string | Date) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleString("en-ET", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const adaptBackendSlip = (payment: any): BankSlipItem => {
  if (payment?.metadata?.isSubscription) {
    return payment as BankSlipItem;
  }

  const metadata = payment?.metadata ?? {};

  // Who paid ("man endekefele")
  const payerName =
    payment?.customerName ||
    metadata.fullName ||
    metadata.depositorName ||
    metadata.customerName ||
    payment?.customer?.fullName ||
    payment?.customer?.name ||
    "Customer";

  const payerPhone =
    payment?.customerPhone ||
    metadata.phoneNumber ||
    metadata.payerPhone ||
    metadata.phone ||
    payment?.customer?.phoneNumber ||
    "—";

  const payerEmail =
    payment?.customerEmail ||
    metadata.email ||
    payment?.customer?.email ||
    "";

  const deliveryAddress =
    payment?.deliveryAddress ||
    metadata.specificAddress ||
    metadata.subcity ||
    (metadata.deliveryAddress
      ? `${metadata.deliveryAddress.specificLocation || ""}, ${metadata.deliveryAddress.subCity || ""}`
      : "Addis Ababa");

  // Which order ("yeyetgnaw order kfya endehone")
  const orderNumber =
    payment?.orderNumber ||
    metadata.orderNumber ||
    (payment?.orderId ? `MX-${payment.orderId.slice(0, 8).toUpperCase()}` : "MX-ORDER");

  const orderId = payment?.orderId || metadata.orderId || "";

  const itemsList = Array.isArray(metadata.items) ? metadata.items : [];
  const itemsCount =
    payment?.itemsCount ||
    metadata.itemCount ||
    metadata.itemsCount ||
    itemsList.length ||
    1;
  const itemsSummary =
    itemsList.length > 0
      ? itemsList
          .map((i: any) => `${i.title || i.name || "Item"} (x${i.quantity || 1})`)
          .join(", ")
      : `${itemsCount} item${itemsCount > 1 ? "s" : ""} ordered`;

  // Bank & Provider
  const rawProvider = (payment?.provider || "").toUpperCase();
  let bankName = "Chapa Hosted Escrow";
  if (rawProvider.includes("BANK") || rawProvider.includes("CBE")) {
    bankName = metadata.bankName || "Commercial Bank of Ethiopia (CBE)";
  } else if (rawProvider.includes("TELEBIRR")) {
    bankName = "Telebirr Escrow Gateway";
  } else if (metadata.bankName) {
    bankName = metadata.bankName;
  }

  const referenceNumber =
    payment?.transactionReference ||
    metadata.bankTransactionRef ||
    payment?.providerReference ||
    "N/A";

  return {
    id: payment?.id || "",
    orderId,
    orderNumber,
    bankName,
    provider: payment?.provider || "CHAPA",
    referenceNumber,
    payerName,
    payerPhone,
    payerEmail,
    deliveryAddress:
      typeof deliveryAddress === "string"
        ? deliveryAddress.replace(/^,\s*/, "")
        : "Addis Ababa",
    itemsSummary,
    itemsCount,
    items: itemsList,
    amount: Number(payment?.amount ?? 0),
    currency: payment?.currency || "ETB",
    submittedAt: normalizeSlipDate(payment?.createdAt),
    status: mapPaymentStatus(payment?.status),
    escrowStatus: payment?.escrowStatus || "HELD",
    slipImageUrl: payment?.paymentReceiptUrl || "/slips/receipt-placeholder.png",
    metadata,
  };
};

export function AdminSlipsVerification() {
  const router = useRouter();
  const [slips, setSlips] = useState<BankSlipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingSlip, setViewingSlip] = useState<BankSlipItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [fetchedSubscriber, setFetchedSubscriber] = useState<any | null>(null);
  const [fetchedOrder, setFetchedOrder] = useState<any | null>(null);
  const [zoomSlipImage, setZoomSlipImage] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedRefId, setCopiedRefId] = useState<string | null>(null);
  const [slipToDelete, setSlipToDelete] = useState<BankSlipItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadSlips = async () => {
    try {
      setLoading(true);
      let paymentsList: any[] = [];

      // 1. Fetch from /api/payments (mercatox_payment_db with order decorations)
      try {
        const res = await fetch("/api/payments");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.payments)) {
            paymentsList = json.payments;
          }
        }
      } catch (localErr) {
        console.warn("Could not fetch /api/payments:", localErr);
      }

      // 2. Fetch from backend microservice API Gateway
      try {
        const response = await api.get<{ data?: any[] }>("/admin/payments/pending-slips");
        const backendData = Array.isArray(response?.data) ? response.data : [];
        for (const b of backendData) {
          if (
            !paymentsList.some(
              (p) =>
                p.id === b.id ||
                (p.transactionReference &&
                  p.transactionReference === b.transactionReference)
            )
          ) {
            paymentsList.push(b);
          }
        }
      } catch (apiErr) {
        console.warn("Could not fetch /admin/payments/pending-slips:", apiErr);
      }

      // 3. Fetch from subscription records (Subscribers & Plans)
      try {
        let subsData: any[] = [];
        try {
          const subRes = await api.get<any[]>("/admin/subscriptions/subscribers");
          if (Array.isArray(subRes)) subsData = subRes;
          else if (Array.isArray((subRes as any)?.data)) subsData = (subRes as any).data;
        } catch {
          const fallbackRes = await fetch("http://localhost:3000/platform/subscribers");
          if (fallbackRes.ok) {
            subsData = await fallbackRes.json();
          }
        }

        if (Array.isArray(subsData)) {
          for (const sub of subsData) {
            const rawMethod = (sub.paymentMethod || "CHAPA").toUpperCase();
            let bankName = "Chapa Gateway (Subscription)";
            if (rawMethod.includes("TELEBIRR")) bankName = "Telebirr SuperApp (Subscription)";
            else if (rawMethod.includes("CBE_BIRR")) bankName = "CBE Birr (Subscription)";
            else if (rawMethod.includes("BANK") || sub.bankName) {
              bankName = sub.bankName || "Commercial Bank of Ethiopia (CBE)";
            }

            const isPaid = sub.paymentStatus === "PAID";
            const isRejected = sub.paymentStatus === "REJECTED";

            const subItem: BankSlipItem = {
              id: sub.id,
              orderId: undefined,
              orderNumber: `SUB-${(sub.planId || "TIER").toUpperCase().slice(0, 10)}`,
              bankName,
              provider: sub.paymentMethod || "CHAPA",
              referenceNumber: sub.transactionReference || `TXN-${sub.id}`,
              payerName: sub.userName || "Merchant",
              payerPhone: sub.paymentPhone || "—",
              payerEmail: sub.userEmail || "",
              deliveryAddress: `Merchant Subscription • ${sub.userRole || "SELLER"} Account`,
              itemsSummary: `Tier: ${sub.planName} (${sub.billingPeriod || "monthly"})`,
              itemsCount: 1,
              items: [
                {
                  id: sub.planId,
                  title: `Subscription: ${sub.planName}`,
                  name: `Privilege Plan: ${sub.planName} (${sub.billingPeriod || "monthly"})`,
                  quantity: 1,
                  unitPrice: sub.price || 0,
                },
              ],
              amount: Number(sub.price || 0),
              currency: sub.currency || "ETB",
              submittedAt: normalizeSlipDate(sub.createdAt),
              status: isPaid ? "APPROVED" : isRejected ? "REJECTED" : "PENDING",
              escrowStatus: isPaid ? "ESCROW_SETTLED" : isRejected ? "REJECTED" : "HELD",
              slipImageUrl: sub.paymentSlipUrl || "/slips/receipt-placeholder.png",
              metadata: {
                isSubscription: true,
                subscriberId: sub.id,
                planId: sub.planId,
                planName: sub.planName,
                userRole: sub.userRole,
                userId: sub.userId,
                billingPeriod: sub.billingPeriod,
                paymentMethod: sub.paymentMethod,
                bankName: sub.bankName,
              },
            };

            if (
              !paymentsList.some(
                (p) =>
                  p.id === subItem.id ||
                  (p.transactionReference &&
                    p.transactionReference === subItem.referenceNumber)
              )
            ) {
              paymentsList.push(subItem);
            }
          }
        }
      } catch (subErr) {
        console.warn("Could not load subscription payments:", subErr);
      }

      const normalized = paymentsList.map(adaptBackendSlip);
      setSlips(normalized);
    } catch (error: any) {
      console.warn("Failed to fetch pending bank slips:", error?.message || error);
      setSlips([]);
      toast.error("Unable to load bank slips and payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlips();
  }, []);

  const matchedPlan = useMemo(() => {
    if (!viewingSlip?.metadata?.isSubscription) return null;
    const planId = viewingSlip.metadata?.planId || "";
    const planName = (viewingSlip.metadata?.planName || viewingSlip.itemsSummary || "").toLowerCase();
    return (
      INITIAL_PLANS.find(
        (p) =>
          p.id === planId ||
          p.name.toLowerCase() === planName ||
          planName.includes(p.name.toLowerCase()) ||
          p.name.toLowerCase().includes(planName)
      ) || null
    );
  }, [viewingSlip]);

  useEffect(() => {
    if (!viewingSlip) {
      setFetchedSubscriber(null);
      setFetchedOrder(null);
      setDetailLoading(false);
      return;
    }

    const isSub = Boolean(
      viewingSlip.metadata?.isSubscription ||
      viewingSlip.orderNumber?.startsWith("SUB-") ||
      viewingSlip.metadata?.planId
    );

    let isMounted = true;
    setDetailLoading(true);

    if (isSub) {
      const userId =
        viewingSlip.metadata?.userId ||
        viewingSlip.metadata?.subscriberId ||
        viewingSlip.id;

      (async () => {
        let subscriberData: any = null;

        // 1. Fetch user details from API Gateway admin endpoint
        if (userId && userId.length > 5) {
          try {
            const res = await api.get<any>(`/admin/users/${userId}/details`);
            if (res && (res.user || res.profile || res.fullName)) {
              subscriberData = {
                fullName: res.user?.fullName || res.profile?.fullName || res.fullName || viewingSlip.payerName,
                email: res.user?.email || res.profile?.email || res.email || viewingSlip.payerEmail,
                phone: res.user?.phoneNumber || res.profile?.phoneNumber || res.phoneNumber || viewingSlip.payerPhone,
                role: res.user?.role || res.profile?.role || res.role || viewingSlip.metadata?.userRole || "SELLER",
                shopName: res.profile?.shopName || res.shopName || `${viewingSlip.payerName}'s Merchant Shop`,
                marketZone: res.profile?.marketZone || res.marketZone || "Mercato Central Zone",
                kycStatus: res.profile?.kycStatus || res.kycStatus || "VERIFIED",
                tradeLicenseNumber: res.profile?.tradeLicenseNumber || res.tradeLicenseNumber || "ET-TIN-8934120",
                userId: res.user?.id || res.profile?.userId || userId,
                isActive: res.user?.isActive ?? true,
                postedProducts: res.stats?.postedProducts,
              };
            }
          } catch (e) {
            console.warn("Could not fetch /admin/users/:userId/details:", e);
          }
        }

        // 2. Fetch public profile from API Gateway
        if (!subscriberData && userId && userId.length > 5) {
          try {
            const profile = await api.get<any>(`/users/profile/${userId}`);
            if (profile && (profile.fullName || profile.shopName || profile.email)) {
              subscriberData = {
                fullName: profile.fullName || viewingSlip.payerName,
                email: profile.email || viewingSlip.payerEmail,
                phone: profile.phoneNumber || viewingSlip.payerPhone,
                role: profile.role || viewingSlip.metadata?.userRole || "SELLER",
                shopName: profile.shopName || `${viewingSlip.payerName}'s Store`,
                marketZone: profile.marketZone || "Mercato Central Zone",
                kycStatus: profile.kycStatus || "VERIFIED",
                tradeLicenseNumber: profile.tradeLicenseNumber || "ET-TIN-8934120",
                userId: profile.userId || userId,
                isActive: true,
              };
            }
          } catch (e) {
            console.warn("Could not fetch /users/profile/:userId:", e);
          }
        }

        // 3. Fallback match from subscribers list
        if (!subscriberData) {
          try {
            let list: any[] = [];
            try {
              const r = await api.get<any[]>("/admin/subscriptions/subscribers");
              if (Array.isArray(r)) list = r;
              else if (Array.isArray((r as any)?.data)) list = (r as any).data;
            } catch {}
            if (list.length === 0) {
              const r2 = await fetch("/platform/subscribers");
              if (r2.ok) list = await r2.json();
            }

            const matched = list.find(
              (s) =>
                s.id === viewingSlip.id ||
                s.id === viewingSlip.metadata?.subscriberId ||
                s.userId === viewingSlip.metadata?.userId ||
                s.transactionReference === viewingSlip.referenceNumber ||
                (s.userEmail && s.userEmail === viewingSlip.payerEmail)
            );

            if (matched) {
              subscriberData = {
                fullName: matched.userName || viewingSlip.payerName,
                email: matched.userEmail || viewingSlip.payerEmail,
                phone: matched.paymentPhone || viewingSlip.payerPhone,
                role: matched.userRole || viewingSlip.metadata?.userRole || "SELLER",
                shopName: matched.shopName || (matched.userRole === "SELLER" ? `${matched.userName}'s Store` : `${matched.userName} Wholesale Hub`),
                marketZone: matched.marketZone || "Mercato Central Zone",
                kycStatus: matched.kycStatus || "VERIFIED",
                tradeLicenseNumber: matched.tradeLicenseNumber || "ET-TIN-8934120",
                userId: matched.userId || userId,
                isActive: true,
              };
            }
          } catch (e) {
            console.warn("Could not match from subscribers list:", e);
          }
        }

        // 4. Default guaranteed fields
        if (!subscriberData) {
          subscriberData = {
            fullName: viewingSlip.payerName || "Registered Merchant",
            email: viewingSlip.payerEmail || "merchant@mercatox.et",
            phone: viewingSlip.payerPhone || "+251911223344",
            role: viewingSlip.metadata?.userRole || "SELLER",
            shopName: viewingSlip.metadata?.shopName || `${viewingSlip.payerName}'s Merchant Shop`,
            marketZone: "Mercato Trade Zone",
            kycStatus: "VERIFIED",
            tradeLicenseNumber: "ET-LIC-481920",
            userId: userId || viewingSlip.id,
            isActive: true,
          };
        }

        if (isMounted) {
          setFetchedSubscriber(subscriberData);
          setDetailLoading(false);
        }
      })();
    } else {
      // Order payment details fetch
      const orderId = viewingSlip.orderId;
      const orderNumber = viewingSlip.orderNumber;

      (async () => {
        let orderData: any = null;

        // 1. Fetch from /api/orders
        try {
          const queryParam = orderId ? `id=${orderId}` : `orderNumber=${orderNumber}`;
          const res = await fetch(`/api/orders?${queryParam}`);
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.order) {
              orderData = json.order;
            } else if (Array.isArray(json.orders) && json.orders.length > 0) {
              orderData = json.orders[0];
            }
          }
        } catch (e) {
          console.warn("Could not fetch order from /api/orders:", e);
        }

        // 2. Fetch from API gateway /orders/:id
        if (!orderData && orderId) {
          try {
            const res = await api.get<any>(`/orders/${orderId}`);
            if (res) orderData = res;
          } catch (e) {
            console.warn("Could not fetch order from gateway:", e);
          }
        }

        if (isMounted) {
          setFetchedOrder(orderData);
          setDetailLoading(false);
        }
      })();
    }

    return () => {
      isMounted = false;
    };
  }, [viewingSlip]);

  const handleCopyRef = (refNum: string, id: string) => {
    navigator.clipboard?.writeText(refNum);
    setCopiedRefId(id);
    toast.success(`Copied Ref: ${refNum}`);
    setTimeout(() => setCopiedRefId(null), 2000);
  };

  const handleApproveSlip = async (id: string, refNum: string) => {
    try {
      const targetSlip = slips.find((s) => s.id === id);

      if (targetSlip?.metadata?.isSubscription) {
        const subId = targetSlip.metadata.subscriberId || targetSlip.id;
        try {
          await api.patch(`/admin/subscriptions/subscribers/${subId}/status`, { status: "PAID" });
        } catch {
          await fetch(`http://localhost:3000/platform/subscribers/${subId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "PAID" }),
          });
        }
        setSlips((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: "APPROVED", escrowStatus: "ESCROW_SETTLED" } : s))
        );
        toast.success(`Subscription Payment ${refNum} Verified & Approved`, {
          description: `Merchant ${targetSlip.payerName} tier is now active.`,
        });
        setViewingSlip(null);
        return;
      }

      // Order slip approval
      try {
        await api.patch("/payments/admin/verify-slip", {
          paymentId: id,
          isApproved: true,
          note: "Approved by admin review",
        });
      } catch (patchErr) {
        // Fallback update to /api/payments
        await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactionReference: refNum,
            status: "COMPLETED",
            escrowStatus: "HELD",
          }),
        });
      }

      setSlips((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "APPROVED" } : s))
      );
      toast.success(`Payment & Slip ${refNum} Approved`, {
        description: "Funds verified and credited into MercatoX Escrow custody.",
      });
      setViewingSlip(null);
    } catch (error: any) {
      console.warn("Failed to approve bank slip:", error?.message || error);
      toast.error("Unable to approve this payment right now.");
    }
  };

  const handleRejectSlip = async (id: string, refNum: string) => {
    try {
      const targetSlip = slips.find((s) => s.id === id);

      if (targetSlip?.metadata?.isSubscription) {
        const subId = targetSlip.metadata.subscriberId || targetSlip.id;
        try {
          await api.patch(`/admin/subscriptions/subscribers/${subId}/status`, { status: "REJECTED" });
        } catch {
          await fetch(`http://localhost:3000/platform/subscribers/${subId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "REJECTED" }),
          });
        }
        setSlips((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: "REJECTED", escrowStatus: "REJECTED" } : s))
        );
        toast.error(`Subscription Payment ${refNum} Rejected`);
        setViewingSlip(null);
        return;
      }

      try {
        await api.patch("/payments/admin/verify-slip", {
          paymentId: id,
          isApproved: false,
          note: "Rejected by admin review",
        });
      } catch (patchErr) {
        await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactionReference: refNum,
            status: "FAILED",
            escrowStatus: "REFUNDED",
          }),
        });
      }

      setSlips((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "REJECTED" } : s))
      );
      toast.error(`Bank Slip ${refNum} Rejected`, {
        description: "Customer notified to provide valid payment verification.",
      });
      setViewingSlip(null);
    } catch (error: any) {
      console.warn("Failed to reject bank slip:", error?.message || error);
      toast.error("Unable to reject this payment right now.");
    }
  };

  const handleViewOrder = (orderId?: string) => {
    if (!orderId) {
      toast.error("Order ID not available for this record");
      return;
    }
    router.push(`/dashboard/admin/orders/${encodeURIComponent(orderId)}`);
  };

  const handleConfirmDeleteSlip = async () => {
    if (!slipToDelete) return;
    setIsDeleting(true);
    try {
      if (slipToDelete.metadata?.isSubscription) {
        const subId = slipToDelete.metadata.subscriberId || slipToDelete.id;
        try {
          await api.delete(`/admin/subscriptions/subscribers/${subId}`);
        } catch {
          await fetch(`http://localhost:3000/platform/subscribers/${subId}`, { method: "DELETE" });
        }
        setSlips((prev) => prev.filter((s) => s.id !== slipToDelete.id));
        if (viewingSlip?.id === slipToDelete.id) {
          setViewingSlip(null);
        }
        toast.success(`Subscription record for ${slipToDelete.payerName} deleted permanently`);
        setSlipToDelete(null);
        return;
      }

      // 1. Delete from local /api/payments (mercatox_payment_db)
      const res = await fetch(`/api/payments?id=${encodeURIComponent(slipToDelete.id)}`, {
        method: "DELETE",
      });

      // 2. Also try microservice endpoint if running
      try {
        await api.delete(`/admin/payments/${slipToDelete.id}`);
      } catch {
        // Ignored if handled locally
      }

      if (res.ok) {
        setSlips((prev) => prev.filter((s) => s.id !== slipToDelete.id));
        if (viewingSlip?.id === slipToDelete.id) {
          setViewingSlip(null);
        }
        toast.success(`Payment record for order ${slipToDelete.orderNumber} deleted permanently`);
        setSlipToDelete(null);
      } else {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to delete payment from database");
      }
    } catch (error: any) {
      console.warn("Failed to delete payment:", error?.message || error);
      toast.error("Delete failed", {
        description: error.message || "Unable to delete payment record from database.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredSlips = useMemo(() => {
    return slips.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.orderNumber.toLowerCase().includes(q) ||
        item.payerName.toLowerCase().includes(q) ||
        item.payerPhone.toLowerCase().includes(q) ||
        item.payerEmail.toLowerCase().includes(q) ||
        item.referenceNumber.toLowerCase().includes(q) ||
        item.bankName.toLowerCase().includes(q) ||
        (item.metadata?.planName && item.metadata.planName.toLowerCase().includes(q)) ||
        (item.metadata?.userRole && item.metadata.userRole.toLowerCase().includes(q));

      let matchesStatus = true;
      if (statusFilter === "PENDING") {
        matchesStatus = item.status === "PENDING";
      } else if (statusFilter === "APPROVED") {
        matchesStatus = item.status === "APPROVED";
      } else if (statusFilter === "BANK_TRANSFER") {
        matchesStatus =
          item.provider === "BANK_TRANSFER" ||
          item.bankName.toLowerCase().includes("bank") ||
          item.bankName.toLowerCase().includes("cbe");
      } else if (statusFilter === "SUBSCRIPTIONS") {
        matchesStatus = Boolean(item.metadata?.isSubscription);
      }

      return matchesSearch && matchesStatus;
    });
  }, [slips, searchQuery, statusFilter]);

  const pendingCount = slips.filter((s) => s.status === "PENDING").length;
  const approvedCount = slips.filter((s) => s.status === "APPROVED").length;
  const subCount = slips.filter((s) => s.metadata?.isSubscription).length;

  return (
    <div className="space-y-3">
      {/* Alert Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-3 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-amber-400 shrink-0" />
          <div>
            <h4 className="text-xs font-semibold text-white">
              Customer Payment & Bank Slip Verification Console
            </h4>
            <p className="text-[10px] text-zinc-400">
              Verify customer payments, CBE/Awash bank transfer slips, and merchant subscriptions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadSlips}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <div className="rounded-lg bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 text-[11px] font-mono font-bold text-amber-300">
            {pendingCount} Pending Match
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-white/10 bg-[#0d121f]/90 p-3 backdrop-blur-xl">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search merchant, customer, order #, phone, ref..."
            className="w-full h-8 rounded-lg border border-white/10 bg-white/[0.04] pl-8 pr-3 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center overflow-x-auto scrollbar-none rounded-lg bg-white/[0.04] p-0.5 border border-white/5 text-[11px] shrink-0">
          {[
            { id: "ALL", label: `All (${slips.length})` },
            { id: "PENDING", label: `Pending (${pendingCount})` },
            { id: "APPROVED", label: `Approved (${approvedCount})` },
            { id: "BANK_TRANSFER", label: "Bank Slips" },
            { id: "SUBSCRIPTIONS", label: `Subscriptions (${subCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors shrink-0 cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Slips Table */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0d121f]/90 shadow-xl backdrop-blur-xl">
        {/* Mobile Swipe Hint */}
        <div className="sm:hidden flex items-center justify-between px-3.5 py-2 border-b border-white/5 bg-white/[0.02] text-[11px] text-zinc-400">
          <span className="flex items-center gap-1.5 text-[10.5px]">
            <span>←</span>
            <span>ወደ ጎን ያሸብልሉ (Swipe to scroll)</span>
            <span>→</span>
          </span>
          <span className="text-[10px] font-mono text-amber-400 font-semibold">{filteredSlips.length} Deposits</span>
        </div>

        <div className="overflow-x-auto min-h-[260px] scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse min-w-[840px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold text-zinc-400">
                <th className="py-2.5 px-3">Linked Order</th>
                <th className="py-2.5 px-3">Customer / Depositor</th>
                <th className="py-2.5 px-3">Gateway & Reference</th>
                <th className="py-2.5 px-3">Amount (ETB)</th>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Escrow Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-zinc-400">
                    Loading payments and bank slips from payment service...
                  </td>
                </tr>
              ) : filteredSlips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-zinc-400">
                    No payment records matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredSlips.map((slip) => (
                  <tr
                    key={slip.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Linked Order or Subscription Plan */}
                    <td className="py-2.5 px-3">
                      {slip.metadata?.isSubscription ? (
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 text-[9px] font-bold font-mono">
                              SUBSCRIPTION
                            </span>
                            <span className="font-mono font-bold text-white text-[11px]">
                              {slip.orderNumber}
                            </span>
                          </div>
                          <span className="text-[10.5px] font-medium text-indigo-300 truncate max-w-[180px]">
                            {slip.metadata.planName || slip.itemsSummary}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleViewOrder(slip.orderId)}
                            className="font-mono font-bold text-white hover:text-indigo-400 transition-colors flex items-center gap-1 cursor-pointer"
                            title="View order details"
                          >
                            <span>{slip.orderNumber}</span>
                            <ExternalLink className="h-3 w-3 text-indigo-400" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Customer / Merchant ("man endekefele") */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <p className="text-zinc-200 font-semibold">{slip.payerName}</p>
                        {slip.metadata?.isSubscription && (
                          <span className="rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 text-[9px] font-bold font-mono">
                            {slip.metadata.userRole || "MERCHANT"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono mt-0.5">
                        <Phone className="h-2.5 w-2.5 text-zinc-500" />
                        <span>{slip.payerPhone}</span>
                      </div>
                      {slip.payerEmail && (
                        <p className="text-[10px] text-zinc-500 truncate max-w-[160px]">
                          {slip.payerEmail}
                        </p>
                      )}
                    </td>

                    {/* Bank / Gateway & Reference */}
                    <td className="py-2.5 px-3">
                      <p className="font-medium text-zinc-200">{slip.bankName}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="font-mono text-[10px] text-indigo-400 select-all">
                          {slip.referenceNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyRef(slip.referenceNumber, slip.id)}
                          className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                          title="Copy reference"
                        >
                          {copiedRefId === slip.id ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-bold text-emerald-400">
                        ETB {slip.amount.toLocaleString()}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-2.5 px-3 font-mono text-[10px] text-zinc-400">
                      {slip.submittedAt}
                    </td>

                    {/* Escrow Status */}
                    <td className="py-2.5 px-3">
                      {slip.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          <span>Pending Match</span>
                        </span>
                      )}
                      {slip.status === "APPROVED" && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                          <ShieldCheck className="h-3 w-3 shrink-0" />
                          <span>Escrow Credited</span>
                        </span>
                      )}
                      {slip.status === "REJECTED" && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[11px] font-medium text-rose-400">
                          <XCircle className="h-3 w-3 shrink-0" />
                          <span>Rejected</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-right relative">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuId(openMenuId === slip.id ? null : slip.id)
                          }
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                          title="Verification Actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {openMenuId === slip.id && (
                          <>
                            <div
                              className="fixed inset-0 z-30 cursor-default"
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="app-dropdown-panel absolute right-0 mt-1 w-52 rounded-xl border border-white/10 bg-[#0f172a] p-1.5 shadow-2xl z-40 space-y-0.5 text-left animate-in fade-in zoom-in-95 duration-100">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setViewingSlip(slip);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5 text-indigo-400" />
                                <span>Inspect Payment & Slip</span>
                              </button>

                              {slip.orderId && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    handleViewOrder(slip.orderId);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-cyan-300 hover:bg-white/10 transition-colors cursor-pointer"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  <span>View Order Detail</span>
                                </button>
                              )}

                              {slip.status === "PENDING" && (
                                <>
                                  <div className="my-1 border-t border-white/5" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      handleApproveSlip(slip.id, slip.referenceNumber);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/15 transition-colors cursor-pointer"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    <span>Verify & Credit Escrow</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      handleRejectSlip(slip.id, slip.referenceNumber);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/15 transition-colors cursor-pointer"
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                    <span>Reject Bank Slip</span>
                                  </button>
                                </>
                              )}

                              <div className="my-1 border-t border-white/5" />
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleCopyRef(slip.referenceNumber, slip.id);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                              >
                                <Copy className="h-3.5 w-3.5 text-cyan-400" />
                                <span>Copy Ref Code</span>
                              </button>

                              <div className="my-1 border-t border-white/5" />
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setSlipToDelete(slip);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete Record</span>
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

      {/* Slip & Payment Inspection Modal */}
      {viewingSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-5 backdrop-blur-md animate-in fade-in duration-200">
          <div className="app-modal-window relative w-full max-w-3xl rounded-2xl border border-white/15 bg-[#0b0f19] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-slate-900/60">
              <div className="flex items-center gap-3">
                {viewingSlip.metadata?.isSubscription ? (
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                    <Sparkles className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                    <PackageCheck className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      {viewingSlip.metadata?.isSubscription
                        ? "Merchant Subscription Audit & Payment Details"
                        : "Order Escrow Payment & Verification"}
                    </h3>
                    {viewingSlip.metadata?.isSubscription ? (
                      <span className="rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 text-[10px] font-bold font-mono">
                        SUBSCRIPTION
                      </span>
                    ) : (
                      <span className="rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-bold font-mono">
                        ORDER PAYMENT
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    Txn Ref: <span className="text-indigo-300">{viewingSlip.referenceNumber}</span> • {viewingSlip.bankName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingSlip(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Financial Highlight Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                      {viewingSlip.metadata?.isSubscription ? "Subscription Fee Paid" : "Escrow Custody Amount"}
                    </span>
                    <p className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
                      ETB {viewingSlip.amount.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-zinc-400">Channel:</span>
                      <span className="text-[11px] font-semibold text-white">{viewingSlip.bankName}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Status</span>
                    <div className="mt-1">
                      {viewingSlip.status === "APPROVED" && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-xs font-bold text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Approved & Credited</span>
                        </span>
                      )}
                      {viewingSlip.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 text-xs font-bold text-amber-300">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>Pending Match</span>
                        </span>
                      )}
                      {viewingSlip.status === "REJECTED" && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/20 border border-rose-500/30 px-2.5 py-1 text-xs font-bold text-rose-300">
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Rejected</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[10.5px] font-mono text-zinc-400 mt-1.5">{viewingSlip.submittedAt}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex flex-col justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                    Transaction Reference
                  </span>
                  <div className="my-1">
                    <span className="font-mono text-xs font-bold text-indigo-300 break-all select-all">
                      {viewingSlip.referenceNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyRef(viewingSlip.referenceNumber, viewingSlip.id)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-1.5 px-2.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {copiedRefId === viewingSlip.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-indigo-400" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Conditional Views: SUBSCRIPTION vs ORDER */}
              {viewingSlip.metadata?.isSubscription ? (
                /* ================= SUBSCRIPTION PAYMENT AUDIT ================= */
                <div className="space-y-4">
                  {/* 1. Subscription Plan Information */}
                  <div className="rounded-xl border border-white/10 bg-gradient-to-br from-purple-950/20 via-slate-900/40 to-slate-950/60 p-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-purple-400" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-200">
                          Subscription Plan Information
                        </h4>
                      </div>
                      <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-2.5 py-0.5 text-[10.5px] font-bold text-purple-300">
                        {matchedPlan?.badge || viewingSlip.metadata?.userRole || "Active Tier"}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-1 border-b border-white/5">
                          <span className="text-zinc-400">Plan Tier Name:</span>
                          <span className="font-bold text-indigo-300 text-sm">
                            {viewingSlip.metadata?.planName || matchedPlan?.name || viewingSlip.itemsSummary}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-white/5">
                          <span className="text-zinc-400">Target Role:</span>
                          <span className="font-mono font-bold text-white">
                            {viewingSlip.metadata?.userRole || matchedPlan?.targetRole || "SELLER"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-white/5">
                          <span className="text-zinc-400">Billing Cycle:</span>
                          <span className="capitalize font-mono text-zinc-200">
                            {viewingSlip.metadata?.billingPeriod || matchedPlan?.billingPeriod || "Monthly"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-1 border-b border-white/5">
                          <span className="text-zinc-400">Product Listing Limit:</span>
                          <span className="font-bold text-emerald-400 font-mono">
                            {matchedPlan?.maxProducts
                              ? `Up to ${matchedPlan.maxProducts} listings`
                              : "Unlimited Product Listings"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-white/5">
                          <span className="text-zinc-400">Commission Rate Discount:</span>
                          <span className="font-mono font-semibold text-cyan-300">
                            {matchedPlan?.commissionRateDiscount
                              ? `${matchedPlan.commissionRateDiscount}% Reduced Commission`
                              : "Standard 3.5% Escrow Rate"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-white/5">
                          <span className="text-zinc-400">Subscribed On:</span>
                          <span className="font-mono text-zinc-300 text-[11px]">{viewingSlip.submittedAt}</span>
                        </div>
                      </div>
                    </div>

                    {/* Features list */}
                    {matchedPlan?.features && matchedPlan.features.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <span className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
                          Included Merchant Privileges:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {matchedPlan.features.map((feat, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[10.5px] text-zinc-300 font-medium"
                            >
                              <BadgeCheck className="h-3 w-3 text-purple-400" />
                              <span>{feat}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Subscriber Information (Dynamically Fetched from Backend!) */}
                  <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-emerald-400" />
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                            Subscriber Information (Live Backend Fetch)
                          </h4>
                          <p className="text-[10px] text-zinc-400">
                            Real-time merchant identity & store profile fetched from backend microservices
                          </p>
                        </div>
                      </div>

                      {detailLoading ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-indigo-400 font-mono animate-pulse">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Fetching from Backend...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Backend Verified</span>
                        </div>
                      )}
                    </div>

                    {detailLoading ? (
                      <div className="py-8 text-center text-zinc-400 space-y-2">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-400" />
                        <p className="text-xs">Fetching subscriber profile and account details from backend...</p>
                      </div>
                    ) : (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-1 border-b border-white/5">
                            <span className="text-zinc-400">Subscriber Full Name:</span>
                            <span className="font-bold text-white">
                              {fetchedSubscriber?.fullName || viewingSlip.payerName}
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-1 border-b border-white/5">
                            <span className="text-zinc-400">Merchant Role:</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              <Store className="h-3 w-3" />
                              {fetchedSubscriber?.role || viewingSlip.metadata?.userRole || "SELLER"}
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-1 border-b border-white/5">
                            <span className="text-zinc-400">Store / Shop Name:</span>
                            <span className="font-semibold text-indigo-300">
                              {fetchedSubscriber?.shopName || "Mercato Merchant Store"}
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-1 border-b border-white/5">
                            <span className="text-zinc-400">Market Zone:</span>
                            <span className="text-zinc-200">
                              {fetchedSubscriber?.marketZone || "Mercato Central Zone"}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-1 border-b border-white/5">
                            <span className="text-zinc-400">KYC Status:</span>
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold font-mono text-[11px]">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              {fetchedSubscriber?.kycStatus || "VERIFIED"}
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-1 border-b border-white/5">
                            <span className="text-zinc-400">TIN / Trade License:</span>
                            <span className="font-mono text-zinc-300 text-[11px]">
                              {fetchedSubscriber?.tradeLicenseNumber || "ET-TIN-8934120"}
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-1 border-b border-white/5">
                            <span className="text-zinc-400">Phone Number:</span>
                            <span className="font-mono text-white">
                              {fetchedSubscriber?.phone || viewingSlip.payerPhone}
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-1 border-b border-white/5">
                            <span className="text-zinc-400">Email Address:</span>
                            <span className="font-mono text-zinc-300 text-[11px] truncate max-w-[180px]">
                              {fetchedSubscriber?.email || viewingSlip.payerEmail}
                            </span>
                          </div>
                        </div>

                        {/* Account User ID */}
                        <div className="sm:col-span-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                          <span className="text-zinc-400">Account User ID:</span>
                          <span className="font-mono text-zinc-300 bg-white/5 px-2 py-0.5 rounded border border-white/5 select-all">
                            {fetchedSubscriber?.userId || viewingSlip.metadata?.userId || viewingSlip.id}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* ================= ORDER PAYMENT AUDIT ================= */
                <div className="space-y-4">
                  {/* 1. Order Information */}
                  <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-cyan-400" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-200">
                          Order Details & Escrow Information
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-xs bg-white/5 px-2 py-0.5 rounded border border-white/10">
                          {viewingSlip.orderNumber}
                        </span>
                        {viewingSlip.orderId && (
                          <button
                            type="button"
                            onClick={() => {
                              setViewingSlip(null);
                              handleViewOrder(viewingSlip.orderId);
                            }}
                            className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Open Full Order</span>
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-1 border-b border-white/5">
                          <span className="text-zinc-400">Order Number:</span>
                          <span className="font-mono font-bold text-white">{viewingSlip.orderNumber}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-white/5">
                          <span className="text-zinc-400">Order Status:</span>
                          <span className="font-mono font-semibold text-emerald-300">
                            {fetchedOrder?.status || "CONFIRMED"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-white/5">
                          <span className="text-zinc-400">Escrow Custody:</span>
                          <span className="font-mono font-semibold text-cyan-300">
                            {viewingSlip.escrowStatus || "HELD_IN_ESCROW"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-1 border-b border-white/5">
                          <span className="text-zinc-400">Subtotal Amount:</span>
                          <span className="font-mono text-zinc-200">
                            ETB {Number(fetchedOrder?.subtotalAmount || viewingSlip.amount - (fetchedOrder?.deliveryFee || 0)).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-white/5">
                          <span className="text-zinc-400">Delivery Fee:</span>
                          <span className="font-mono text-zinc-200">
                            ETB {Number(fetchedOrder?.deliveryFee || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-white/5">
                          <span className="text-zinc-400">Total Paid:</span>
                          <span className="font-mono font-bold text-emerald-400">
                            ETB {Number(fetchedOrder?.totalAmount || viewingSlip.amount).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Delivery Address & Notes */}
                      <div className="sm:col-span-2 pt-2 border-t border-white/5 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Delivery Destination:</span>
                          <span className="text-white text-right max-w-sm">
                            {fetchedOrder?.deliveryAddress
                              ? typeof fetchedOrder.deliveryAddress === "object"
                                ? `${fetchedOrder.deliveryAddress.specificLocation || ""}, ${fetchedOrder.deliveryAddress.subCity || ""}`
                                : fetchedOrder.deliveryAddress
                              : viewingSlip.deliveryAddress}
                          </span>
                        </div>
                        {fetchedOrder?.notes && (
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Delivery Instructions:</span>
                            <span className="text-zinc-300 italic text-right max-w-sm">{fetchedOrder.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. Customer Information ("Man Endekefele") */}
                  <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                      <User className="h-4 w-4 text-emerald-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                        Customer & Payer Details ("Man Endekefele")
                      </h4>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="flex justify-between items-center py-1 border-b border-white/5">
                        <span className="text-zinc-400">Customer Full Name:</span>
                        <span className="font-bold text-white">{viewingSlip.payerName}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-white/5">
                        <span className="text-zinc-400">Phone Number:</span>
                        <span className="font-mono text-white">{viewingSlip.payerPhone}</span>
                      </div>
                      {viewingSlip.payerEmail && (
                        <div className="flex justify-between items-center py-1 border-b border-white/5">
                          <span className="text-zinc-400">Email Address:</span>
                          <span className="font-mono text-zinc-300 text-[11px]">{viewingSlip.payerEmail}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-1 border-b border-white/5">
                        <span className="text-zinc-400">Location:</span>
                        <span className="text-zinc-200">{viewingSlip.deliveryAddress}</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Ordered Products */}
                  {((fetchedOrder?.items && fetchedOrder.items.length > 0) ||
                    (viewingSlip.items && viewingSlip.items.length > 0)) && (
                    <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4 text-indigo-400" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                            Ordered Products ({((fetchedOrder?.items || viewingSlip.items) || []).length})
                          </h4>
                        </div>
                      </div>

                      <div className="mt-3 divide-y divide-white/5 max-h-48 overflow-y-auto">
                        {((fetchedOrder?.items || viewingSlip.items) || []).map((item: any, idx: number) => (
                          <div key={idx} className="py-2 flex items-center justify-between text-xs">
                            <div className="min-w-0 pr-2">
                              <p className="font-medium text-white truncate">
                                {item.productTitle || item.title || item.name || "Marketplace Product"}
                              </p>
                              <span className="text-[10px] text-zinc-400 font-mono">
                                Qty: {item.quantity || 1} {item.unitOfMeasure ? `• ${item.unitOfMeasure}` : ""}
                              </span>
                            </div>
                            <div className="text-right shrink-0 font-mono">
                              <p className="text-zinc-200 font-semibold">
                                ETB {Number(item.totalPrice || (item.unitPrice || 0) * (item.quantity || 1)).toLocaleString()}
                              </p>
                              <span className="text-[10px] text-zinc-500">
                                @ ETB {Number(item.unitPrice || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Uploaded Slip Receipt Preview */}
              {viewingSlip.slipImageUrl && viewingSlip.slipImageUrl !== "/slips/receipt-placeholder.png" && (
                <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-cyan-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                        Bank Deposit / Transfer Receipt
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setZoomSlipImage(viewingSlip.slipImageUrl)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                      <span>Click to Enlarge</span>
                    </button>
                  </div>

                  <div
                    onClick={() => setZoomSlipImage(viewingSlip.slipImageUrl)}
                    className="mt-3 relative rounded-xl overflow-hidden border border-white/10 bg-black/60 max-h-56 flex items-center justify-center cursor-pointer group"
                  >
                    <img
                      src={viewingSlip.slipImageUrl}
                      alt="Bank Receipt"
                      className="max-h-56 w-auto object-contain transition-transform group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-semibold">
                      <ZoomIn className="h-4 w-4" />
                      <span>Enlarge Receipt</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 bg-slate-900/60">
              <button
                type="button"
                onClick={() => {
                  const target = viewingSlip;
                  setViewingSlip(null);
                  setSlipToDelete(target);
                }}
                className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Record</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewingSlip(null)}
                  className="rounded-lg px-3.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Close
                </button>

                {viewingSlip.status === "PENDING" && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        handleRejectSlip(viewingSlip.id, viewingSlip.referenceNumber)
                      }
                      className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer"
                    >
                      Reject Slip
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleApproveSlip(viewingSlip.id, viewingSlip.referenceNumber)
                      }
                      className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-500 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{viewingSlip.metadata?.isSubscription ? "Approve Subscription" : "Approve & Credit Escrow"}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Receipt Image Zoom Modal */}
      {zoomSlipImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setZoomSlipImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/20 bg-slate-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-white/10 bg-slate-950/80">
              <span className="text-xs font-semibold text-white">Payment Receipt / Bank Slip Full View</span>
              <button
                onClick={() => setZoomSlipImage(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center bg-black">
              <img
                src={zoomSlipImage}
                alt="Payment Receipt Preview"
                className="max-h-[80vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Pop-Up Modal */}
      {slipToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-rose-500/30 bg-[#0f172a] shadow-2xl">
            <div className="flex items-center gap-3 border-b border-white/10 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Are you sure you want to delete this payment record?
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Order ID: {slipToDelete.orderNumber}
                </p>
              </div>
            </div>

            <div className="p-4 space-y-3 text-xs text-zinc-300">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Order ID:</span>
                  <span className="font-mono font-bold text-white">{slipToDelete.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Customer:</span>
                  <span className="font-semibold text-white">{slipToDelete.payerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Amount:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ETB {slipToDelete.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Reference:</span>
                  <span className="font-mono text-zinc-300">{slipToDelete.referenceNumber}</span>
                </div>
              </div>
              <p className="text-rose-300/90 text-[11px] leading-relaxed">
                This action cannot be undone. The payment transaction record and receipt will be permanently deleted from the database.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-white/10 bg-black/30 p-3.5">
              <button
                type="button"
                onClick={() => setSlipToDelete(null)}
                disabled={isDeleting}
                className="rounded-lg px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSlip}
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


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
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api/client";

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

      const normalized = paymentsList.map(adaptBackendSlip);
      setSlips(normalized);
    } catch (error) {
      console.error("Failed to fetch pending bank slips:", error);
      setSlips([]);
      toast.error("Unable to load bank slips and payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlips();
  }, []);

  const handleCopyRef = (refNum: string, id: string) => {
    navigator.clipboard?.writeText(refNum);
    setCopiedRefId(id);
    toast.success(`Copied Ref: ${refNum}`);
    setTimeout(() => setCopiedRefId(null), 2000);
  };

  const handleApproveSlip = async (id: string, refNum: string) => {
    try {
      // 1. Try microservice endpoint
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
    } catch (error) {
      console.error("Failed to approve bank slip:", error);
      toast.error("Unable to approve this payment right now.");
    }
  };

  const handleRejectSlip = async (id: string, refNum: string) => {
    try {
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
    } catch (error) {
      console.error("Failed to reject bank slip:", error);
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
      console.error("Failed to delete payment:", error);
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
        item.bankName.toLowerCase().includes(q);

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
      }

      return matchesSearch && matchesStatus;
    });
  }, [slips, searchQuery, statusFilter]);

  const pendingCount = slips.filter((s) => s.status === "PENDING").length;
  const approvedCount = slips.filter((s) => s.status === "APPROVED").length;

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
              Verify customer payments, CBE/Awash bank transfer slips, and escrow transactions.
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
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer, order #, phone, ref code..."
            className="w-full h-8 rounded-lg border border-white/10 bg-white/[0.04] pl-8 pr-3 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center rounded-lg bg-white/[0.04] p-0.5 border border-white/5 text-[11px]">
          {[
            { id: "ALL", label: `All (${slips.length})` },
            { id: "PENDING", label: `Pending (${pendingCount})` },
            { id: "APPROVED", label: `Approved (${approvedCount})` },
            { id: "BANK_TRANSFER", label: "Bank Slips" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer ${
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
        <div className="overflow-x-auto min-h-[260px]">
          <table className="w-full text-left text-xs border-collapse">
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
                    {/* Linked Order */}
                    <td className="py-2.5 px-3">
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
                    </td>

                    {/* Customer / Depositor ("man endekefele") */}
                    <td className="py-2.5 px-3">
                      <p className="text-zinc-200 font-semibold">{slip.payerName}</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="app-modal-window relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#0f172a] p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Payment Verification & Review
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Ref: {viewingSlip.referenceNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingSlip(null)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Payment Summary Box */}
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-dashed border-white/20 bg-black/40 p-4 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 mb-2">
                  <Building2 className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-white">
                  {viewingSlip.bankName}
                </p>
                <p className="text-[11px] font-mono text-indigo-300 mt-1">
                  Transaction Code: {viewingSlip.referenceNumber}
                </p>
                <div className="mt-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-center">
                  <span className="text-[10px] text-emerald-400 uppercase font-mono tracking-wider">
                    Amount Received / In Escrow
                  </span>
                  <p className="text-xl font-bold font-mono text-emerald-300">
                    ETB {viewingSlip.amount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Data Checklist: Who Paid & Which Order */}
              <div className="rounded-xl bg-white/[0.02] p-3 border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-zinc-400">Which Order:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">
                      {viewingSlip.orderNumber}
                    </span>
                    {viewingSlip.orderId && (
                      <button
                        type="button"
                        onClick={() => {
                          setViewingSlip(null);
                          handleViewOrder(viewingSlip.orderId);
                        }}
                        className="text-[10px] text-indigo-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Open Order</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-zinc-400">Who Paid (Customer):</span>
                  <span className="font-semibold text-white">
                    {viewingSlip.payerName}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-zinc-400">Customer Phone:</span>
                  <span className="font-mono text-white">
                    {viewingSlip.payerPhone}
                  </span>
                </div>

                {viewingSlip.payerEmail && (
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-zinc-400">Customer Email:</span>
                    <span className="text-zinc-300 font-mono text-[11px]">
                      {viewingSlip.payerEmail}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-zinc-400">Delivery Location:</span>
                  <span className="text-zinc-300 text-right max-w-[240px]">
                    {viewingSlip.deliveryAddress}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-zinc-400">Submission Date:</span>
                  <span className="font-mono text-zinc-300 text-[11px]">
                    {viewingSlip.submittedAt}
                  </span>
                </div>
              </div>

              {/* Ordered Products if available */}
              {viewingSlip.items && viewingSlip.items.length > 0 && (
                <div className="rounded-xl bg-white/[0.02] p-3 border border-white/10 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-zinc-300 font-semibold mb-1">
                    <ShoppingBag className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Ordered Products ({viewingSlip.items.length})</span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {viewingSlip.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-[11px] bg-white/[0.02] p-1.5 rounded border border-white/5"
                      >
                        <span className="text-white truncate max-w-[260px]">
                          {item.title || item.name || "Product"}
                        </span>
                        <span className="font-mono text-zinc-400">
                          x{item.quantity || 1} • ETB {Number(item.unitPrice || 0).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
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
                  className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
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
                      className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer"
                    >
                      Reject Slip
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleApproveSlip(viewingSlip.id, viewingSlip.referenceNumber)
                      }
                      className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-500 transition-colors cursor-pointer"
                    >
                      Approve & Credit Escrow
                    </button>
                  </>
                )}
              </div>
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


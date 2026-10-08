"use client";

import React, { useState, useEffect } from "react";
import {
  FileQuestion,
  FileText,
  Clock,
  MapPin,
  Calendar,
  Building,
  CheckCircle2,
  XCircle,
  Eye,
  ExternalLink,
  X,
  MessageSquare,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { PageHeader } from "../shared/page-header";
import { DataFilterBar } from "../shared/data-filter-bar";
import { StatusBadge } from "../shared/status-badge";
import { Pagination } from "../shared/pagination";
import { EmptyState } from "../shared/empty-state";
import { useSupplierStore } from "@/store/supplier-store";
import { useAuthStore } from "@/store/auth-store";
import { RFQItem, RFQStatus } from "@/types/supplier";
import { toast } from "sonner";

export function SupplierRFQView() {
  const { rfqs, isLoadingRFQs, fetchRFQs, openModal, setActiveTab, currentStaffUser } = useSupplierStore();
  const { user } = useAuthStore();
  const isBranchManager = user?.staffRole === "branch_manager" || currentStaffUser?.role === "branch_manager";

  useEffect(() => {
    fetchRFQs();
  }, [fetchRFQs]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRFQ, setSelectedRFQ] = useState<RFQItem | null>(null);

  const pageSize = 6;

  const filtered = rfqs.filter((r) => {
    const matchesSearch =
      r.rfqNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.buyerCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.deliveryLocation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleRespondWithQuote = (rfq: RFQItem) => {
    setSelectedRFQ(null);
    openModal("create-quotation", rfq);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Request for Quotations (RFQ) Inbox"
        subtitle="Review inbound commercial procurement tenders, custom specifications, and target pricing from verified corporate buyers"
        breadcrumbs={[{ label: "Dashboard", onClick: () => setActiveTab("dashboard") }, { label: "RFQs" }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchRFQs()}
              disabled={isLoadingRFQs}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-colors disabled:opacity-50"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isLoadingRFQs ? "animate-spin text-emerald-600" : "text-slate-500"}`} />
              <span>Refresh</span>
            </button>
            <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800/40 dark:text-emerald-400">
              {rfqs.filter((r) => r.status === "new").length} New Inquiries
            </span>
          </div>
        }
      />

      {/* Notice Banner for Branch Managers */}
      {isBranchManager && (
        <div className="p-3.5 rounded-2xl border border-blue-500/30 bg-blue-500/10 flex items-center gap-2.5 text-xs text-blue-300">
          <Building className="h-4 w-4 shrink-0 text-blue-400" />
          <span>
            Executive Commercial Notice: Formal RFQ negotiations, commercial quotations, and contracts are managed exclusively by <strong>Super Supplier Enterprise HQ</strong>. Branch managers hold localized fulfillment oversight.
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <DataFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter RFQs by RFQ number, buyer company, commodity, or delivery location..."
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { value: "new", label: "New / Unread" },
          { value: "viewed", label: "Viewed" },
          { value: "responded", label: "Responded" },
          { value: "negotiating", label: "In Negotiation" },
          { value: "accepted", label: "Accepted" },
          { value: "rejected", label: "Rejected" },
          { value: "expired", label: "Expired" },
        ]}
        onReset={() => {
          setSearchQuery("");
          setStatusFilter("all");
        }}
        onExport={() => toast.success("Exporting RFQ register...")}
      />

      {/* RFQ Data Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {paginated.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No RFQs Found"
                description="There are currently no RFQ inquiries matching your search criteria."
              />
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold uppercase text-[10px] tracking-wider select-none">
                  <th className="py-3 px-4">RFQ ID</th>
                  <th className="py-3 px-3">Buyer Enterprise</th>
                  <th className="py-3 px-3">Requested Commodity</th>
                  <th className="py-3 px-3">Target Volume</th>
                  <th className="py-3 px-3">Buyer Target Price</th>
                  <th className="py-3 px-3">Delivery Location</th>
                  <th className="py-3 px-3">Required Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((rfq) => {
                  return (
                    <tr
                      key={rfq.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => setSelectedRFQ(rfq)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {rfq.rfqNumber}
                      </td>

                      <td className="py-3.5 px-3">
                        <p className="font-bold text-slate-900 truncate max-w-[200px]">{rfq.buyerCompany}</p>
                        <p className="text-[11px] text-slate-500 truncate">{rfq.buyerName}</p>
                      </td>

                      <td className="py-3.5 px-3 font-semibold text-slate-800 max-w-[200px] truncate">
                        {rfq.productName}
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                        {rfq.requestedQty.toLocaleString()} {rfq.unit}
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        ETB {rfq.targetPrice.toLocaleString()} / {rfq.unit}
                      </td>

                      <td className="py-3.5 px-3 text-slate-600 truncate max-w-[180px]">
                        {rfq.deliveryLocation}
                      </td>

                      <td className="py-3.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {rfq.requiredDate}
                      </td>

                      <td className="py-3.5 px-3">
                        <StatusBadge status={rfq.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleRespondWithQuote(rfq)}
                          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-indigo-500 shadow-xs cursor-pointer"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>Quote</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* RFQ Detailed Drawer */}
      {selectedRFQ && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setSelectedRFQ(null)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col p-6 overflow-y-auto space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedRFQ.rfqNumber}</h3>
                    <StatusBadge status={selectedRFQ.status} size="sm" />
                  </div>
                  <p className="text-slate-500 mt-0.5">Received on {selectedRFQ.createdAt}</p>
                </div>
                <button
                  onClick={() => setSelectedRFQ(null)}
                  className="rounded p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Buyer Box */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Building className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Buyer Organization</span>
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Company:</span>
                    <p className="font-bold text-slate-900">{selectedRFQ.buyerCompany}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Contact Officer:</span>
                    <p className="font-bold text-slate-900">{selectedRFQ.buyerName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Delivery Site:</span>
                    <p className="font-bold text-slate-900">{selectedRFQ.deliveryLocation}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Required By:</span>
                    <p className="font-bold text-slate-900 font-mono">{selectedRFQ.requiredDate}</p>
                  </div>
                </div>
              </div>

              {/* Product & Volume Box */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                <span className="text-slate-500">Requested Commodity:</span>
                <p className="text-sm font-bold text-slate-900">{selectedRFQ.productName}</p>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-500">Requested Volume:</span>
                    <p className="font-mono font-bold text-slate-900 text-sm">
                      {selectedRFQ.requestedQty.toLocaleString()} {selectedRFQ.unit}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Buyer Target Price:</span>
                    <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                      ETB {selectedRFQ.targetPrice.toLocaleString()} / {selectedRFQ.unit}
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-slate-500 text-[11px]">
                  Estimated Contract Ceiling:{" "}
                  <span className="font-bold font-mono text-slate-900">
                    ETB {(selectedRFQ.requestedQty * selectedRFQ.targetPrice).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Custom Technical Specs */}
              {selectedRFQ.specifications && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900">Custom Quality & Packaging Specifications:</h4>
                  <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50 divide-y divide-slate-200/60">
                    {Object.entries(selectedRFQ.specifications).map(([key, val]) => (
                      <div key={key} className="py-1.5 flex justify-between">
                        <span className="text-slate-500">{key}:</span>
                        <span className="font-semibold text-slate-900 font-mono">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Buyer Notes */}
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Procurement Officer Notes:</h4>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-700 leading-relaxed">
                  {selectedRFQ.notes}
                </div>
              </div>

              {/* Drawer Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedRFQ(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>

                {!isBranchManager ? (
                  <button
                    onClick={() => handleRespondWithQuote(selectedRFQ)}
                    className="rounded-lg bg-indigo-600 px-5 py-2 font-bold text-white hover:bg-indigo-500 shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Generate Quotation</span>
                  </button>
                ) : (
                  <span className="text-xs text-slate-500 font-semibold px-3 py-2 rounded-lg bg-slate-100 border border-slate-200">
                    Negotiation Reserved for Super Supplier HQ
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

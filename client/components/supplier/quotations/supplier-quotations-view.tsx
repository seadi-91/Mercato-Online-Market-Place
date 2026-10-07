"use client";

import React, { useState } from "react";
import {
  FileText,
  Plus,
  Download,
  Copy,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  X,
  FileCheck,
  MoreVertical,
  Eye,
} from "lucide-react";
import { PageHeader } from "../shared/page-header";
import { DataFilterBar } from "../shared/data-filter-bar";
import { StatusBadge } from "../shared/status-badge";
import { Pagination } from "../shared/pagination";
import { EmptyState } from "../shared/empty-state";
import { useSupplierStore } from "@/store/supplier-store";
import { useThemeStore } from "@/store/theme-store";
import { Quotation } from "@/types/supplier";
import { toast } from "sonner";

export function SupplierQuotationsView() {
  const { quotations, openModal, setActiveTab } = useSupplierStore();
  const { theme } = useThemeStore();
  const isLight = theme === "light";
  const isSystem = theme === "system";

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  const pageSize = 6;

  const filtered = quotations.filter((q) => {
    const matchesSearch =
      q.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.buyerCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.items.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDuplicate = (quote: Quotation) => {
    openModal("create-quotation", {
      buyerCompany: quote.buyerCompany,
      buyerName: quote.buyerName,
      targetPrice: quote.items[0]?.unitPrice,
      requestedQty: quote.items[0]?.quantity,
    });
    toast.success(`Draft created based on ${quote.quoteNumber}`);
  };

  const handleDownloadPDF = (quoteNumber: string) => {
    toast.success(`Commercial Quotation PDF (${quoteNumber}.pdf) downloaded.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commercial Quotations"
        subtitle="Issue legally binding commercial proposals with Ethiopian VAT, Incoterms, and Escrow payment guarantees"
        breadcrumbs={[{ label: "Dashboard", onClick: () => setActiveTab("dashboard") }, { label: "Quotations" }]}
        actions={
          <button
            onClick={() => openModal("create-quotation")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Quotation</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <DataFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter quotes by number, buyer company, or product..."
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { value: "sent", label: "Sent / Pending" },
          { value: "accepted", label: "Accepted by Buyer" },
          { value: "negotiating", label: "Counter Negotiating" },
          { value: "rejected", label: "Rejected" },
          { value: "withdrawn", label: "Withdrawn" },
        ]}
        onReset={() => {
          setSearchQuery("");
          setStatusFilter("all");
        }}
        onExport={() => toast.success("Exporting quotation summary...")}
      />

      {/* Quotations Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {paginated.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No Quotations Found"
                description="You haven't issued any quotations matching your search criteria."
                actionLabel="Create Quotation"
                onAction={() => openModal("create-quotation")}
              />
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold uppercase text-[10px] tracking-wider select-none">
                  <th className="py-3 px-4">Quote Number</th>
                  <th className="py-3 px-3">Buyer Company</th>
                  <th className="py-3 px-3">Products & Volume</th>
                  <th className="py-3 px-3">Subtotal</th>
                  <th className="py-3 px-3">Total (inc. VAT)</th>
                  <th className="py-3 px-3">Valid Until</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((quote, idx) => {
                  const isNearBottom = idx >= paginated.length - 2 && paginated.length > 2;
                  return (
                    <tr
                      key={quote.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => setSelectedQuote(quote)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {quote.quoteNumber}
                      </td>

                      <td className="py-3.5 px-3">
                        <p className="font-bold text-slate-900">{quote.buyerCompany}</p>
                        <p className="text-[11px] text-slate-500">{quote.buyerName}</p>
                      </td>

                      <td className="py-3.5 px-3">
                        {quote.items.map((i, idx) => (
                          <div key={idx}>
                            <span className="font-medium text-slate-800">{i.productName}</span>
                            <span className="text-[11px] text-slate-500 font-mono ml-1.5">
                              ({i.quantity.toLocaleString()} {i.unit})
                            </span>
                          </div>
                        ))}
                      </td>

                      <td className="py-3.5 px-3 font-mono font-medium text-slate-600">
                        ETB {quote.subtotal.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                        ETB {quote.total.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                        {quote.validUntil}
                      </td>

                      <td className="py-3.5 px-3">
                        <StatusBadge status={quote.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => setActiveActionMenuId(activeActionMenuId === quote.id ? null : quote.id)}
                            title="More Actions"
                            className={`rounded-lg border p-1.5 transition-all cursor-pointer ${
                              activeActionMenuId === quote.id
                                ? isLight
                                  ? "bg-slate-200 border-slate-300 text-slate-900"
                                  : isSystem
                                  ? "bg-blue-600/30 border-blue-500/40 text-white"
                                  : "bg-white/20 border-white/20 text-white"
                                : isLight
                                ? "border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                : isSystem
                                ? "border-blue-500/20 text-blue-200 hover:bg-blue-500/20 hover:text-white"
                                : "border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Action Menu Dropdown */}
                        {activeActionMenuId === quote.id && (
                          <>
                            <div
                              className="fixed inset-0 z-30"
                              onClick={() => setActiveActionMenuId(null)}
                            />
                            <div
                              className={`absolute right-4 z-40 w-48 rounded-xl border p-1.5 text-left shadow-2xl animate-in fade-in zoom-in-95 ${
                                isNearBottom ? "bottom-10 mb-1" : "top-full mt-1.5"
                              } ${
                                isLight
                                  ? "border-slate-200 bg-white text-slate-800 shadow-slate-300/60"
                                  : isSystem
                                  ? "border-blue-500/30 bg-[#0f1b3b] text-blue-100 shadow-black/70"
                                  : "border-white/10 bg-[#141418] text-zinc-200 shadow-black/80"
                              }`}
                            >
                              {/* 1. View */}
                              <button
                                onClick={() => {
                                  setSelectedQuote(quote);
                                  setActiveActionMenuId(null);
                                }}
                                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                                  isLight
                                    ? "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                                    : "hover:bg-white/10 text-zinc-200 hover:text-white"
                                }`}
                              >
                                <Eye className="h-4 w-4 text-emerald-500 shrink-0" />
                                <span>View Details</span>
                              </button>

                              {/* 2. Download */}
                              <button
                                onClick={() => {
                                  handleDownloadPDF(quote.quoteNumber);
                                  setActiveActionMenuId(null);
                                }}
                                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                                  isLight
                                    ? "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                                    : "hover:bg-white/10 text-zinc-200 hover:text-white"
                                }`}
                              >
                                <Download className="h-4 w-4 text-blue-500 shrink-0" />
                                <span>Download PDF</span>
                              </button>

                              {/* 3. Copy */}
                              <button
                                onClick={() => {
                                  handleDuplicate(quote);
                                  setActiveActionMenuId(null);
                                }}
                                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                                  isLight
                                    ? "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                                    : "hover:bg-white/10 text-zinc-200 hover:text-white"
                                }`}
                              >
                                <Copy className="h-4 w-4 text-indigo-400 shrink-0" />
                                <span>Copy / Duplicate</span>
                              </button>
                            </div>
                          </>
                        )}
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

      {/* Quote Preview Drawer / Sheet */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setSelectedQuote(null)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col p-6 overflow-y-auto space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedQuote.quoteNumber}</h3>
                    <StatusBadge status={selectedQuote.status} size="sm" />
                  </div>
                  <p className="text-slate-500 mt-0.5">Created on {selectedQuote.createdAt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadPDF(selectedQuote.quoteNumber)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={() => setSelectedQuote(null)}
                    className="rounded p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Printable Invoice Header Simulation */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">ISSUED TO BUYER</span>
                    <h4 className="text-sm font-bold text-slate-900">{selectedQuote.buyerCompany}</h4>
                    <p className="text-slate-600 mt-0.5">Attn: {selectedQuote.buyerName}</p>
                    <p className="text-slate-500 text-[11px] font-mono">{selectedQuote.buyerEmail} • {selectedQuote.buyerPhone}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">ISSUING SUPPLIER</span>
                    <p className="font-bold text-slate-900">Abyssinia Agri-Commodities PLC</p>
                    <p className="text-slate-500 font-mono text-[11px]">TIN: 0048291048</p>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3">Quantity</th>
                      <th className="py-2.5 px-3">Unit Price (ETB)</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedQuote.items.map((i, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{i.productName}</td>
                        <td className="py-2.5 px-3 font-mono">{i.quantity.toLocaleString()} {i.unit}</td>
                        <td className="py-2.5 px-3 font-mono">ETB {i.unitPrice.toLocaleString()}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-right">
                          ETB {i.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Breakdown Calculation Box */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">ETB {selectedQuote.subtotal.toLocaleString()}</span>
                </div>
                {selectedQuote.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span className="font-mono">- ETB {selectedQuote.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>15% Ethiopian VAT:</span>
                  <span className="font-mono">+ ETB {selectedQuote.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Transport & Logistics:</span>
                  <span className="font-mono">+ ETB {selectedQuote.shippingCost.toLocaleString()}</span>
                </div>
                <div className="border-t border-emerald-200/80 pt-2 flex justify-between font-bold text-sm text-slate-900">
                  <span>Total Amount (ETB):</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">ETB {selectedQuote.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Commercial Terms */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                <h4 className="font-bold text-slate-900">Commercial & Legal Terms</h4>
                <div className="space-y-1 text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-800">Payment Terms:</span> {selectedQuote.paymentTerms}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">Delivery Terms:</span> {selectedQuote.deliveryTerms}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">Validity:</span> Valid until {selectedQuote.validUntil}
                  </p>
                </div>
                {selectedQuote.notes && (
                  <p className="mt-2 text-slate-500 text-[11px] pt-2 border-t border-slate-100">
                    {selectedQuote.notes}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

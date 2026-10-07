"use client";

import React, { useState } from "react";
import {
  Receipt,
  Plus,
  Download,
  Printer,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Building,
  DollarSign,
  X,
  CreditCard,
} from "lucide-react";
import { PageHeader } from "../shared/page-header";
import { DataFilterBar } from "../shared/data-filter-bar";
import { StatusBadge } from "../shared/status-badge";
import { Pagination } from "../shared/pagination";
import { EmptyState } from "../shared/empty-state";
import { useSupplierStore } from "@/store/supplier-store";
import { Invoice } from "@/types/supplier";
import { toast } from "sonner";

export function SupplierInvoicesView() {
  const { invoices, markInvoicePaid, setActiveTab } = useSupplierStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const pageSize = 6;

  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.buyerCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.buyerTIN.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDownloadInvoice = (invNum: string) => {
    toast.success(`Commercial Tax Invoice (${invNum}.pdf) generated.`);
  };

  const handlePrint = (invNum: string) => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commercial Tax Invoices & Billing"
        subtitle="Issue compliant value-added tax (15% VAT) invoices with Ministry of Revenues electronic TIN validation"
        breadcrumbs={[{ label: "Dashboard", onClick: () => setActiveTab("dashboard") }, { label: "Invoices" }]}
        actions={
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {invoices.length} Registered Invoices
            </span>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <DataFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search invoices by invoice number, order #, buyer enterprise, or TIN..."
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { value: "paid", label: "Paid in Full" },
          { value: "partially_paid", label: "Partially Paid" },
          { value: "sent", label: "Sent / Pending" },
          { value: "overdue", label: "Overdue" },
          { value: "draft", label: "Draft" },
          { value: "cancelled", label: "Cancelled" },
        ]}
        onReset={() => {
          setSearchQuery("");
          setStatusFilter("all");
        }}
        onExport={() => toast.success("Exporting tax invoices journal...")}
      />

      {/* Invoices Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {paginated.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No Invoices Found"
                description="No tax invoices match your search criteria."
              />
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold uppercase text-[10px] tracking-wider select-none">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-3">Order Ref</th>
                  <th className="py-3 px-3">Buyer Enterprise</th>
                  <th className="py-3 px-3">Buyer TIN</th>
                  <th className="py-3 px-3">Subtotal</th>
                  <th className="py-3 px-3">15% VAT</th>
                  <th className="py-3 px-3">Total Amount</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((inv) => {
                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => setSelectedInvoice(inv)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {inv.invoiceNumber}
                      </td>

                      <td className="py-3.5 px-3 font-mono text-slate-600">
                        {inv.orderNumber}
                      </td>

                      <td className="py-3.5 px-3 font-bold text-slate-900 truncate max-w-[190px]">
                        {inv.buyerCompany}
                      </td>

                      <td className="py-3.5 px-3 font-mono text-slate-500">
                        {inv.buyerTIN}
                      </td>

                      <td className="py-3.5 px-3 font-mono font-medium text-slate-700">
                        ETB {inv.subtotal.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3 font-mono text-slate-500">
                        ETB {inv.vatAmount.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                        ETB {inv.total.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                        {inv.dueDate}
                      </td>

                      <td className="py-3.5 px-3">
                        <StatusBadge status={inv.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleDownloadInvoice(inv.invoiceNumber)}
                            title="Download PDF"
                            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          {inv.status !== "paid" && (
                            <button
                              onClick={() => markInvoicePaid(inv.id)}
                              title="Mark as Settled"
                              className="rounded bg-emerald-50 px-2 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 border border-emerald-200 hover:bg-emerald-100/60 cursor-pointer"
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
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

      {/* Tax Invoice Printable Drawer */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setSelectedInvoice(null)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col p-6 overflow-y-auto space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedInvoice.invoiceNumber}</h3>
                    <StatusBadge status={selectedInvoice.status} size="sm" />
                  </div>
                  <p className="text-slate-500 mt-0.5">Order Ref: {selectedInvoice.orderNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrint(selectedInvoice.invoiceNumber)}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
                    title="Print Tax Invoice"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDownloadInvoice(selectedInvoice.invoiceNumber)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="rounded p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Tax Invoice Sheet Preview */}
              <div className="rounded-xl border border-slate-200 p-5 space-y-4 bg-slate-50/50">
                <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Abyssinia Agri-Commodities PLC</h4>
                    <p className="text-slate-600">Bole Sub-city, Africa Avenue, Addis Ababa</p>
                    <p className="text-slate-500 font-mono text-[11px]">TIN: 0048291048 • VAT Reg: 882910</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 font-mono text-sm uppercase">Tax Invoice</span>
                    <p className="text-slate-500 font-mono text-[11px]">Date: {selectedInvoice.issuedDate}</p>
                    <p className="text-slate-500 font-mono text-[11px]">Due: {selectedInvoice.dueDate}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">BILLED ENTERPRISE</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedInvoice.buyerCompany}</p>
                  <p className="text-slate-600 font-mono">TIN: {selectedInvoice.buyerTIN}</p>
                </div>

                <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Base Subtotal:</span>
                    <span className="font-mono">ETB {selectedInvoice.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Value Added Tax (15% VAT):</span>
                    <span className="font-mono">+ ETB {selectedInvoice.vatAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Freight / Shipping Fee:</span>
                    <span className="font-mono">+ ETB {selectedInvoice.shipping.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-slate-900">
                    <span>Total Amount Due (ETB):</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">ETB {selectedInvoice.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 pt-1 font-semibold">
                    <span>Amount Paid / Settled:</span>
                    <span className="font-mono">ETB {selectedInvoice.paidAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {selectedInvoice.status !== "paid" && (
                <button
                  onClick={() => {
                    markInvoicePaid(selectedInvoice.id);
                    setSelectedInvoice(null);
                  }}
                  className="w-full rounded-lg bg-indigo-600 py-2.5 font-bold text-white hover:bg-indigo-500 shadow-xs cursor-pointer"
                >
                  Mark Tax Invoice as Settled
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

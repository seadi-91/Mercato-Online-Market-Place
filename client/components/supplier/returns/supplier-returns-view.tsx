"use client";

import React, { useState } from "react";
import {
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Truck,
  FileText,
  DollarSign,
  Clock,
} from "lucide-react";
import { PageHeader } from "../shared/page-header";
import { DataFilterBar } from "../shared/data-filter-bar";
import { StatusBadge } from "../shared/status-badge";
import { Pagination } from "../shared/pagination";
import { EmptyState } from "../shared/empty-state";
import { useSupplierStore } from "@/store/supplier-store";
import { ReturnCase } from "@/types/supplier";
import { toast } from "sonner";

export function SupplierReturnsView() {
  const { returns, setActiveTab } = useSupplierStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 6;

  const filtered = returns.filter((r) => {
    const matchesSearch =
      r.returnNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.buyerCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.productName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleApprove = (retId: string) => {
    toast.success(`Return authorization approved for ${retId}. Inbound dispatch label generated.`);
  };

  const handleReject = (retId: string) => {
    toast.error(`Return request ${retId} rejected. Reason sent to buyer.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commodity Returns & Reconditioning"
        subtitle="Manage RMA return requests, moisture/grade non-conformity claims, warehouse receiving inspection, and refund settlements"
        breadcrumbs={[{ label: "Dashboard", onClick: () => setActiveTab("dashboard") }, { label: "Returns" }]}
        actions={
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
              {returns.length} Return Cases
            </span>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <DataFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search returns by Return #, Order #, buyer enterprise, or commodity..."
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { value: "requested", label: "Requested" },
          { value: "approved", label: "Approved" },
          { value: "in_transit", label: "Inbound Transit" },
          { value: "received", label: "Received at Depot" },
          { value: "refunded", label: "Refund Settled" },
          { value: "rejected", label: "Rejected" },
        ]}
        onReset={() => {
          setSearchQuery("");
          setStatusFilter("all");
        }}
        onExport={() => toast.success("Exporting returns log...")}
      />

      {/* Returns Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {paginated.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No Returns Found"
                description="No active RMA commodity return cases match your filters."
              />
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold uppercase text-[10px] tracking-wider select-none">
                  <th className="py-3 px-4">Return ID</th>
                  <th className="py-3 px-3">Order Number</th>
                  <th className="py-3 px-3">Buyer Company</th>
                  <th className="py-3 px-3">Commodity & Volume</th>
                  <th className="py-3 px-3">Return Reason</th>
                  <th className="py-3 px-3">Claimed Refund</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((r) => {
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {r.returnNumber}
                      </td>

                      <td className="py-3.5 px-3 font-mono font-semibold text-slate-700">
                        {r.orderNumber}
                      </td>

                      <td className="py-3.5 px-3 font-bold text-slate-900 truncate max-w-[190px]">
                        {r.buyerCompany}
                      </td>

                      <td className="py-3.5 px-3">
                        <p className="font-semibold text-slate-800">{r.productName}</p>
                        <p className="font-mono text-slate-500 text-[11px]">
                          {r.quantity.toLocaleString()} {r.unit}
                        </p>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 capitalize">
                          {r.reason.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold text-rose-700">
                        ETB {r.refundAmount.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                        {r.requestedDate}
                      </td>

                      <td className="py-3.5 px-3">
                        <StatusBadge status={r.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {r.status === "requested" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApprove(r.returnNumber)}
                              className="rounded bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-indigo-500 cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(r.returnNumber)}
                              className="rounded border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">Processed</span>
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
    </div>
  );
}

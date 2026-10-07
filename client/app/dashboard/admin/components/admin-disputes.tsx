"use client";

import React, { useState } from "react";
import {
  Scale,
  Search,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Shield,
  MessageSquare,
  ArrowRight,
  DollarSign,
  MoreVertical,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

export interface DisputeItem {
  id: string;
  orderNumber: string;
  customerName: string;
  merchantStore: string;
  amount: number;
  reason: string;
  openedDate: string;
  status: "OPEN" | "RESOLVED_REFUND" | "RESOLVED_RELEASED";
}

const INITIAL_DISPUTES: DisputeItem[] = [
  {
    id: "disp-01",
    orderNumber: "MX-94818",
    customerName: "Bereket Alemu",
    merchantStore: "Bole Electronics Hub",
    amount: 32000,
    reason: "Defective screen display upon unboxing; seller disputed transit liability.",
    openedDate: "2026-09-19",
    status: "OPEN",
  },
  {
    id: "disp-02",
    orderNumber: "MX-94780",
    customerName: "Tadele Mengistu",
    merchantStore: "Heritage Cultural Outfits",
    amount: 5400,
    reason: "Incorrect fabric sizing delivered; requested replacement or full refund.",
    openedDate: "2026-09-17",
    status: "OPEN",
  },
  {
    id: "disp-03",
    orderNumber: "MX-94692",
    customerName: "Sara Tesfaye",
    merchantStore: "Mercato Traditional Spices",
    amount: 1850,
    reason: "Package seal breached during courier handover.",
    openedDate: "2026-09-15",
    status: "RESOLVED_REFUND",
  },
];

export function AdminDisputes() {
  const [disputes, setDisputes] = useState<DisputeItem[]>(INITIAL_DISPUTES);
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleResolve = (
    id: string,
    action: "REFUND" | "RELEASE",
    orderNum: string
  ) => {
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
            ...d,
            status:
              action === "REFUND"
                ? "RESOLVED_REFUND"
                : "RESOLVED_RELEASED",
          }
          : d
      )
    );
    if (action === "REFUND") {
      toast.success(`Dispute ${orderNum} Resolved: Customer Refund Authorized`, {
        description: "Escrow funds credited back to customer wallet.",
      });
    } else {
      toast.success(`Dispute ${orderNum} Resolved: Merchant Escrow Released`, {
        description: "Merchant cleared after delivery confirmation verified.",
      });
    }
  };

  const openCount = disputes.filter((d) => d.status === "OPEN").length;

  return (
    <div className="space-y-3">
      {/* Alert Header */}
      <div className="flex items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/[0.05] p-3 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-rose-400" />
          <div>
            <h4 className="text-xs font-semibold text-white">
              Escrow Dispute & Arbitration Console
            </h4>
            <p className="text-[10px] text-zinc-400">
              Review contested escrow transactions and enforce final binding arbitration.
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-rose-400">
          {openCount} Open Arbitration Cases
        </span>
      </div>

      {/* Disputes Table */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0d121f]/90 shadow-xl backdrop-blur-xl">
        <div className="overflow-x-auto min-h-[260px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold text-zinc-400">
                <th className="py-2.5 px-3">Order Ref</th>
                <th className="py-2.5 px-3">Buyer vs Seller</th>
                <th className="py-2.5 px-3">Held Sum (ETB)</th>
                <th className="py-2.5 px-3">Dispute Grounds</th>
                <th className="py-2.5 px-3">Filed On</th>
                <th className="py-2.5 px-3">Resolution State</th>
                <th className="py-2.5 px-3 text-right">Arbitration Ruling</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {disputes.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-white">
                    {item.orderNumber}
                  </td>

                  <td className="py-2.5 px-3">
                    <p className="font-medium text-white">{item.customerName}</p>
                    <p className="text-[10px] text-zinc-400">vs {item.merchantStore}</p>
                  </td>

                  <td className="py-2.5 px-3 font-mono font-bold text-amber-400">
                    ETB {item.amount.toLocaleString()}
                  </td>

                  <td className="py-2.5 px-3 text-zinc-300 max-w-xs truncate">
                    {item.reason}
                  </td>

                  <td className="py-2.5 px-3 font-mono text-[10px] text-zinc-400">
                    {item.openedDate}
                  </td>

                  <td className="py-2.5 px-3">
                    {item.status === "OPEN" && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-rose-400">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        Under Review
                      </span>
                    )}
                    {item.status === "RESOLVED_REFUND" && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-purple-400">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        Refunded to Buyer
                      </span>
                    )}
                    {item.status === "RESOLVED_RELEASED" && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        Released to Seller
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-right relative">
                    <div className="relative inline-block text-left">
                      <button
                        type="button"
                        onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title="Arbitration Ruling Actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {openMenuId === item.id && (
                        <>
                          <div
                            className="fixed inset-0 z-30 cursor-default"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="app-dropdown-panel absolute right-0 mt-1 w-48 rounded-xl border border-white/10 bg-[#0f172a] p-1.5 shadow-2xl z-40 space-y-0.5 text-left animate-in fade-in zoom-in-95 duration-100">
                            {item.status === "OPEN" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    handleResolve(item.id, "REFUND", item.orderNumber);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/15 transition-colors cursor-pointer"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                  <span>Refund Buyer</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    handleResolve(item.id, "RELEASE", item.orderNumber);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/15 transition-colors cursor-pointer"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>Release to Seller</span>
                                </button>
                                <div className="my-1 border-t border-white/5" />
                              </>
                            ) : (
                              <div className="px-2.5 py-1 text-[11px] text-zinc-400 font-medium">
                                Status: {item.status === "RESOLVED_REFUND" ? "Refunded to Buyer" : "Released to Seller"}
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                toast.info(`Dispute Grounds: ${item.reason}`, {
                                  description: `Buyer: ${item.customerName} vs Seller: ${item.merchantStore}`,
                                });
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                            >
                              <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
                              <span>Dispute Grounds</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                toast.info(`Escrow Audit: Order ${item.orderNumber}`, {
                                  description: `Contested Sum: ETB ${item.amount.toLocaleString()} - Filed on ${item.openedDate}`,
                                });
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                            >
                              <Shield className="h-3.5 w-3.5 text-cyan-400" />
                              <span>Audit Escrow File</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

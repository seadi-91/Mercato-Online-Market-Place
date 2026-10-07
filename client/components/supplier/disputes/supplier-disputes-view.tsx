"use client";

import React, { useState, useMemo } from "react";
import {
  AlertTriangle,
  UploadCloud,
  FileText,
  CheckCircle2,
  X,
  Send,
  Scale,
  Search,
  Download,
  Clock,
  FileCheck,
  Gavel,
  ShieldCheck,
  Building,
} from "lucide-react";
import { PageHeader } from "../shared/page-header";
import { StatusBadge } from "../shared/status-badge";
import { ModalDialog } from "../shared/modal-dialog";
import { useSupplierStore } from "@/store/supplier-store";
import { useThemeStore } from "@/store/theme-store";
import { DisputeCase } from "@/types/supplier";
import { toast } from "sonner";

export function SupplierDisputesView() {
  const { disputes: storeDisputes, setActiveTab } = useSupplierStore();
  const { theme } = useThemeStore();

  const isLight = theme === "light";
  const isSystem = theme === "system";
  const isDark = theme === "dark";

  // Local state for disputes list
  const [disputesList, setDisputesList] = useState<DisputeCase[]>(storeDisputes);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string>(
    storeDisputes[0]?.id || ""
  );
  const [replyText, setReplyText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Counter-evidence modal
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [evidenceFileName, setEvidenceFileName] = useState("");

  const selectedDispute = useMemo(() => {
    return (
      disputesList.find((d) => d.id === selectedDisputeId) ||
      disputesList[0] ||
      null
    );
  }, [disputesList, selectedDisputeId]);

  // Statistics
  const totalClaimedAmount = useMemo(() => {
    return disputesList.reduce((acc, d) => acc + d.claimedAmount, 0);
  }, [disputesList]);

  const openCasesCount = useMemo(() => {
    return disputesList.filter(
      (d) => d.status === "open" || d.status === "under_review"
    ).length;
  }, [disputesList]);

  const resolvedCount = useMemo(() => {
    return disputesList.filter((d) => d.status === "resolved").length;
  }, [disputesList]);

  // Filtered disputes
  const filteredDisputes = useMemo(() => {
    return disputesList.filter((d) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        d.disputeNumber.toLowerCase().includes(q) ||
        d.buyerCompany.toLowerCase().includes(q) ||
        d.orderNumber.toLowerCase().includes(q) ||
        d.reason.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" || d.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [disputesList, searchQuery, statusFilter]);

  const handleSendResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedDispute) return;

    const newStatement = {
      author: "Selam Agro Legal & Arbitration Desk",
      message: replyText.trim(),
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    setDisputesList((prev) =>
      prev.map((d) => {
        if (d.id === selectedDispute.id) {
          return {
            ...d,
            status: "evidence_submitted",
            lastUpdate: "Just now",
            history: [...d.history, newStatement],
          };
        }
        return d;
      })
    );

    setReplyText("");
    toast.success("Official arbitration statement submitted to MercatoX panel.");
  };

  const handleEscalate = () => {
    if (!selectedDispute) return;
    setDisputesList((prev) =>
      prev.map((d) =>
        d.id === selectedDispute.id ? { ...d, status: "escalated" } : d
      )
    );
    toast.info(
      `Dispute ${selectedDispute.disputeNumber} escalated to Ministry of Trade & Regional Integration Commercial Arbitration Board.`
    );
  };

  const handleAcceptSettlement = () => {
    if (!selectedDispute) return;
    setDisputesList((prev) =>
      prev.map((d) =>
        d.id === selectedDispute.id ? { ...d, status: "resolved" } : d
      )
    );
    toast.success(
      `Settlement terms accepted for ${selectedDispute.disputeNumber}. Escrow balance reconciled.`
    );
  };

  const handleUploadEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceFileName.trim() || !selectedDispute) return;

    setDisputesList((prev) =>
      prev.map((d) => {
        if (d.id === selectedDispute.id) {
          return {
            ...d,
            evidenceFiles: [...d.evidenceFiles, evidenceFileName.trim()],
            history: [
              ...d.history,
              {
                author: "Selam Agro (Supplier)",
                message: `Uploaded verified test certificate: ${evidenceFileName.trim()}`,
                date: new Date().toISOString().replace("T", " ").substring(0, 16),
              },
            ],
          };
        }
        return d;
      })
    );

    setIsEvidenceModalOpen(false);
    setEvidenceFileName("");
    toast.success("Counter-evidence certificate uploaded and signed with digital seal.");
  };

  // Button active state helpers strictly using MercatoX Brand Indigo
  const getTabActiveStyle = (isActive: boolean) => {
    if (!isActive) {
      if (isLight) return "text-slate-600 hover:bg-slate-100 hover:text-slate-900";
      if (isSystem) return "text-slate-300 hover:bg-white/5 hover:text-white";
      return "text-zinc-400 hover:bg-white/5 hover:text-white";
    }
    if (isLight) return "bg-indigo-600 text-white shadow-xs font-semibold";
    if (isSystem) return "bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/50 font-semibold";
    return "bg-indigo-600 text-white shadow-xs font-semibold";
  };

  const getTabBadgeActiveStyle = (isActive: boolean) => {
    if (!isActive) {
      if (isLight) return "bg-slate-100 text-slate-600";
      if (isSystem) return "bg-white/10 text-slate-300";
      return "bg-white/10 text-zinc-300";
    }
    return "bg-white/20 text-white";
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header with Actions */}
      <PageHeader
        title="Commercial Dispute Center & Escrow Arbitration"
        subtitle="Manage buyer quality discrepancy claims, submit independent ECAE certificates, and resolve Commercial Bank of Ethiopia escrow hearings"
        breadcrumbs={[
          { label: "Dashboard", onClick: () => setActiveTab("dashboard") },
          { label: "Disputes & Mediation" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold border flex items-center gap-1.5 shadow-xs ${
                isLight
                  ? "border-slate-200 bg-slate-50 text-slate-700"
                  : isSystem
                  ? "border-indigo-500/20 bg-[#0c1630] text-slate-200"
                  : "border-white/10 bg-white/5 text-zinc-300"
              }`}
            >
              <Scale className="h-3.5 w-3.5 text-indigo-500" />
              <span>
                {openCasesCount} Active Mediation Hearing{openCasesCount !== 1 ? "s" : ""}
              </span>
            </span>

            <button
              onClick={() => {
                toast.success("Downloading arbitration rules & ECAE quality standards handbook...");
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-xs ${
                isLight
                  ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  : isSystem
                  ? "border-indigo-500/20 bg-[#0c1630] text-slate-200 hover:bg-[#122045]"
                  : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
              }`}
            >
              <FileCheck className="h-3.5 w-3.5" />
              <span>Arbitration Guidelines</span>
            </button>
          </div>
        }
      />

      {/* 2. Real-time Arbitration Telemetry Ribbon */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-2.5 text-[11px] shadow-xs ${
          isLight
            ? "border-slate-200 bg-slate-50/80 text-slate-800"
            : isSystem
            ? "border-indigo-500/20 bg-[#0c1630] text-slate-200"
            : "border-white/10 bg-[#121215] text-zinc-300"
        }`}
      >
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="h-4 w-4 text-indigo-500 shrink-0" />
            <strong>Tripartite Escrow Protection:</strong> Neutral funds held at Commercial Bank of Ethiopia
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 opacity-80">
            <Scale className="h-3.5 w-3.5" />
            ECAE National Commodity Purity Standards Enforced
          </span>
          <span className="hidden md:inline-flex items-center gap-1.5 opacity-80">
            <Clock className="h-3.5 w-3.5" />
            Mediation SLA: 48–72 hrs
          </span>
        </div>

        <span className="font-mono text-[10px] opacity-75">
          Addis Ababa Central Tribunal
        </span>
      </div>

      {/* 3. Hero Mediation & Escrow Reserve Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1 */}
        <div
          className={`rounded-2xl border p-4.5 shadow-xs transition-colors ${
            isLight
              ? "border-slate-200 bg-white text-slate-900"
              : isSystem
              ? "border-indigo-500/20 bg-[#0f1b3b] text-white"
              : "border-white/10 bg-[#141418] text-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">
              Escrow Under Dispute
            </span>
            <AlertTriangle className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono">
            ETB {totalClaimedAmount.toLocaleString()}
          </p>
          <p
            className={`text-[11px] mt-1 ${
              isLight ? "text-slate-500" : isSystem ? "text-slate-400" : "text-zinc-400"
            }`}
          >
            Held in CBE neutral escrow trust
          </p>
        </div>

        {/* Metric 2 */}
        <div
          className={`rounded-2xl border p-4.5 shadow-xs transition-colors ${
            isLight
              ? "border-slate-200 bg-white text-slate-900"
              : isSystem
              ? "border-indigo-500/20 bg-[#0f1b3b] text-white"
              : "border-white/10 bg-[#141418] text-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">
              Active Hearings
            </span>
            <Gavel className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono">{openCasesCount} Cases</p>
          <p
            className={`text-[11px] mt-1 ${
              isLight ? "text-slate-500" : isSystem ? "text-slate-400" : "text-zinc-400"
            }`}
          >
            Under joint laboratory review
          </p>
        </div>

        {/* Metric 3 */}
        <div
          className={`rounded-2xl border p-4.5 shadow-xs transition-colors ${
            isLight
              ? "border-slate-200 bg-white text-slate-900"
              : isSystem
              ? "border-indigo-500/20 bg-[#0f1b3b] text-white"
              : "border-white/10 bg-[#141418] text-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">
              Amicable Resolution Rate
            </span>
            <CheckCircle2 className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono">98.2%</p>
          <p
            className={`text-[11px] mt-1 ${
              isLight ? "text-slate-500" : isSystem ? "text-slate-400" : "text-zinc-400"
            }`}
          >
            Settled via mutual mediation
          </p>
        </div>

        {/* Metric 4 */}
        <div
          className={`rounded-2xl border p-4.5 shadow-xs transition-colors ${
            isLight
              ? "border-slate-200 bg-white text-slate-900"
              : isSystem
              ? "border-indigo-500/20 bg-[#0f1b3b] text-white"
              : "border-white/10 bg-[#141418] text-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">
              Closed / Settled
            </span>
            <ShieldCheck className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono">{resolvedCount} Records</p>
          <p
            className={`text-[11px] mt-1 ${
              isLight ? "text-slate-500" : isSystem ? "text-slate-400" : "text-zinc-400"
            }`}
          >
            Zero supplier default penalties
          </p>
        </div>
      </div>

      {/* 4. Filter Toolbar */}
      <div className="space-y-3">
        <div
          className={`flex flex-wrap items-center justify-between gap-3 border-b pb-2.5 ${
            isLight ? "border-slate-200" : isSystem ? "border-indigo-500/20" : "border-white/10"
          }`}
        >
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "All Hearings", count: disputesList.length },
              {
                id: "under_review",
                label: "Under Review",
                count: disputesList.filter((d) => d.status === "under_review").length,
              },
              {
                id: "evidence_submitted",
                label: "Evidence Submitted",
                count: disputesList.filter((d) => d.status === "evidence_submitted").length,
              },
              {
                id: "resolved",
                label: "Resolved",
                count: disputesList.filter((d) => d.status === "resolved").length,
              },
              {
                id: "escalated",
                label: "Escalated",
                count: disputesList.filter((d) => d.status === "escalated").length,
              },
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs transition-all cursor-pointer ${getTabActiveStyle(
                    isActive
                  )}`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${getTabBadgeActiveStyle(
                      isActive
                    )}`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dispute cases by Dispute #, Buyer Enterprise, Order #, or reason..."
            className={`w-full rounded-xl border pl-9 pr-8 py-2 text-xs focus:outline-hidden shadow-xs transition-colors ${
              isLight
                ? "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-600"
                : isSystem
                ? "border-indigo-500/20 bg-[#0c1630] text-white placeholder:text-slate-400 focus:border-indigo-400"
                : "border-white/10 bg-[#121215] text-white placeholder:text-zinc-500 focus:border-indigo-500"
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 5. Two-Panel Dispute Center (List & Hearing Room) */}
      <div
        className={`grid grid-cols-1 lg:grid-cols-12 rounded-2xl border shadow-xs overflow-hidden min-h-[640px] transition-colors ${
          isLight
            ? "border-slate-200 bg-white text-slate-900"
            : isSystem
            ? "border-indigo-500/20 bg-[#0f1b3b] text-white"
            : "border-white/10 bg-[#141418] text-white"
        }`}
      >
        {/* Left Panel: Dispute Cases Docket (4 columns) */}
        <div
          className={`lg:col-span-4 border-b lg:border-b-0 lg:border-r p-4 space-y-3 flex flex-col ${
            isLight
              ? "border-slate-200 bg-slate-50/60"
              : isSystem
              ? "border-indigo-500/20 bg-[#0c1630]/70"
              : "border-white/10 bg-[#09090b]/80"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
              Dispute Hearings Docket ({filteredDisputes.length})
            </span>
            <span className="text-[10px] font-mono opacity-60">CBE Escrow Node</span>
          </div>

          <div className="space-y-2.5 overflow-y-auto flex-1 max-h-[600px] pr-1">
            {filteredDisputes.length === 0 ? (
              <div className="p-6 text-center text-xs opacity-60">
                No dispute hearings match your criteria.
              </div>
            ) : (
              filteredDisputes.map((dsp) => {
                const isSelected = selectedDispute?.id === dsp.id;

                return (
                  <div
                    key={dsp.id}
                    onClick={() => setSelectedDisputeId(dsp.id)}
                    className={`rounded-2xl border p-4 transition-all cursor-pointer ${
                      isSelected
                        ? isLight
                          ? "border-indigo-600 bg-white shadow-xs ring-1 ring-indigo-600/30 text-slate-900"
                          : isSystem
                          ? "border-indigo-500 bg-[#131e3d] shadow-sm ring-1 ring-indigo-500/40 text-white"
                          : "border-indigo-500 bg-indigo-950/40 shadow-sm ring-1 ring-indigo-500/40 text-white"
                        : isLight
                        ? "border-slate-200 bg-white hover:border-slate-300 text-slate-900"
                        : isSystem
                        ? "border-indigo-500/15 bg-[#0f1b3b] hover:border-indigo-500/30 text-white"
                        : "border-white/10 bg-[#141418] hover:border-white/20 text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="font-mono font-bold text-xs">{dsp.disputeNumber}</span>
                      <StatusBadge status={dsp.status} size="sm" />
                    </div>

                    <h4 className="font-bold text-xs truncate">{dsp.buyerCompany}</h4>
                    <p className="text-[11px] font-mono opacity-70 mt-0.5">
                      Order: #{dsp.orderNumber}
                    </p>

                    <p className="text-[11px] opacity-80 line-clamp-2 mt-2 leading-relaxed">
                      {dsp.reason}
                    </p>

                    <div
                      className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[11px] ${
                        isLight ? "border-slate-100" : isSystem ? "border-indigo-500/20" : "border-white/5"
                      }`}
                    >
                      <span className="opacity-70">Disputed Claim:</span>
                      <span className="font-mono font-bold text-indigo-500">
                        ETB {dsp.claimedAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Hearing Room, Evidence Vault & History Thread (8 columns) */}
        <div className="lg:col-span-8 flex flex-col justify-between p-6 space-y-4">
          {selectedDispute ? (
            <>
              {/* Header Box */}
              <div
                className={`border-b pb-4 space-y-3.5 ${
                  isLight ? "border-slate-100" : isSystem ? "border-indigo-500/20" : "border-white/5"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold">{selectedDispute.disputeNumber}</h3>
                      <StatusBadge status={selectedDispute.status} size="sm" />
                    </div>
                    <p
                      className={`text-xs mt-0.5 ${
                        isLight ? "text-slate-500" : isSystem ? "text-slate-400" : "text-zinc-400"
                      }`}
                    >
                      Buyer Claim: <strong className="opacity-90">{selectedDispute.buyerCompany}</strong> •
                      Linked Order:{" "}
                      <strong className="font-mono opacity-90">#{selectedDispute.orderNumber}</strong>
                    </p>
                  </div>

                  {/* Hearing Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleAcceptSettlement}
                      className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs"
                    >
                      Accept Resolution
                    </button>
                    <button
                      onClick={handleEscalate}
                      className={`rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        isLight
                          ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          : isSystem
                          ? "border-indigo-500/20 bg-[#0c1630] text-slate-200 hover:bg-[#122045]"
                          : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                      }`}
                    >
                      Escalate to Ministry
                    </button>
                  </div>
                </div>

                {/* Discrepancy Reason Callout */}
                <div
                  className={`rounded-2xl border p-3.5 text-xs flex items-start gap-2.5 ${
                    isLight
                      ? "border-slate-200 bg-slate-50 text-slate-800"
                      : isSystem
                      ? "border-indigo-500/20 bg-[#0c1630] text-slate-200"
                      : "border-white/10 bg-[#121215] text-zinc-300"
                  }`}
                >
                  <AlertTriangle className="h-4 w-4 shrink-0 text-indigo-500 mt-0.5" />
                  <div>
                    <span className="font-bold block">Buyer Discrepancy Statement:</span>
                    <p className="mt-0.5 leading-relaxed">{selectedDispute.reason}</p>
                  </div>
                </div>
              </div>

              {/* Submitted Evidence Documents Vault */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider opacity-80">
                    Independent Evidence & Quality Certificates
                  </span>
                  <span className="text-[11px] opacity-60 font-mono">
                    {selectedDispute.evidenceFiles.length} Documents Attached
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedDispute.evidenceFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-mono transition-colors ${
                        isLight
                          ? "border-slate-200 bg-slate-50 text-slate-800"
                          : isSystem
                          ? "border-indigo-500/20 bg-[#0c1630] text-slate-200"
                          : "border-white/10 bg-white/5 text-zinc-300"
                      }`}
                    >
                      <FileText className="h-4 w-4 text-indigo-500" />
                      <span className="truncate max-w-[200px]">{file}</span>
                      <button
                        onClick={() => toast.success(`Downloading ${file}...`)}
                        className="hover:opacity-100 opacity-60 cursor-pointer"
                        title="Download certificate"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => setIsEvidenceModalOpen(true)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border border-dashed px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      isLight
                        ? "border-indigo-300 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-50"
                        : isSystem
                        ? "border-indigo-500/40 bg-indigo-950/30 text-indigo-200 hover:bg-indigo-950/50"
                        : "border-indigo-500/30 bg-indigo-950/20 text-indigo-300 hover:bg-indigo-950/40"
                    }`}
                  >
                    <UploadCloud className="h-4 w-4" />
                    <span>Upload Counter-Evidence</span>
                  </button>
                </div>
              </div>

              {/* Mediation Hearing History Thread */}
              <div className="space-y-2">
                <span className="font-bold text-xs uppercase tracking-wider opacity-80">
                  Hearing Record & Statement Log
                </span>

                <div
                  className={`rounded-2xl border p-4 space-y-3.5 overflow-y-auto max-h-[260px] ${
                    isLight
                      ? "border-slate-100 bg-slate-50/50"
                      : isSystem
                      ? "border-indigo-500/15 bg-[#0c1630]/50"
                      : "border-white/5 bg-white/[0.02]"
                  }`}
                >
                  {selectedDispute.history.map((h, idx) => {
                    const isMercatoAdmin = h.author.includes("Mediation") || h.author.includes("Admin");
                    const isSupplier = h.author.includes("Supplier") || h.author.includes("Selam");

                    return (
                      <div
                        key={idx}
                        className={`rounded-xl border p-3.5 text-xs space-y-1.5 ${
                          isMercatoAdmin
                            ? isLight
                              ? "border-indigo-200 bg-indigo-50/70 text-slate-900"
                              : isSystem
                              ? "border-indigo-500/30 bg-indigo-950/40 text-slate-100"
                              : "border-indigo-500/30 bg-indigo-950/30 text-zinc-100"
                            : isSupplier
                            ? isLight
                              ? "border-slate-200 bg-white text-slate-900"
                              : isSystem
                              ? "border-indigo-500/20 bg-[#0f1b3b] text-white"
                              : "border-white/10 bg-[#121215] text-white"
                            : isLight
                            ? "border-slate-200 bg-slate-50 text-slate-800"
                            : isSystem
                            ? "border-indigo-500/15 bg-[#0c1630] text-slate-200"
                            : "border-white/10 bg-[#18181c] text-zinc-300"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold flex items-center gap-1.5">
                            {isMercatoAdmin && <Gavel className="h-3.5 w-3.5 text-indigo-500" />}
                            {h.author}
                          </span>
                          <span className="text-[10px] font-mono opacity-60">{h.date}</span>
                        </div>
                        <p className="leading-relaxed opacity-90">{h.message}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Formal Statement Input */}
              <form onSubmit={handleSendResponse} className="pt-2 border-t border-current/10 flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Enter official arbitration defense statement or settlement terms..."
                  className={`flex-1 rounded-xl border p-2.5 text-xs focus:outline-hidden ${
                    isLight
                      ? "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-600"
                      : isSystem
                      ? "border-indigo-500/20 bg-[#0c1630] text-white placeholder:text-slate-400 focus:border-indigo-400"
                      : "border-white/10 bg-[#121215] text-white placeholder:text-zinc-500 focus:border-indigo-500"
                  }`}
                />
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Statement</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-xs opacity-60">
              Select a dispute hearing from the left panel.
            </div>
          )}
        </div>
      </div>

      {/* 6. Upload Counter-Evidence Modal */}
      <ModalDialog
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        title="Upload Independent Lab Counter-Evidence"
        subtitle="Attach official certificates from Ethiopian Conformity Assessment Enterprise (ECAE) or dry port weighbridge"
        maxWidth="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsEvidenceModalOpen(false)}
              className={`rounded-xl border px-4 py-2 text-xs font-semibold cursor-pointer ${
                isLight
                  ? "border-slate-200 text-slate-700 hover:bg-slate-50"
                  : isSystem
                  ? "border-indigo-500/20 text-slate-200 hover:bg-indigo-950/30"
                  : "border-white/10 text-zinc-300 hover:bg-white/5"
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUploadEvidence}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 text-xs font-semibold shadow-xs cursor-pointer"
            >
              Upload & Seal Evidence
            </button>
          </>
        }
      >
        <form onSubmit={handleUploadEvidence} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">
              Certificate Document Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. ECAE_Official_Impurity_Analysis_Batch_992.pdf"
              value={evidenceFileName}
              onChange={(e) => setEvidenceFileName(e.target.value)}
              className={`w-full rounded-xl border p-2.5 text-xs font-mono focus:outline-hidden ${
                isLight
                  ? "border-slate-200 bg-white text-slate-900 focus:border-indigo-600"
                  : isSystem
                  ? "border-indigo-500/20 bg-[#0c1630] text-white focus:border-indigo-400"
                  : "border-white/10 bg-[#121215] text-white focus:border-indigo-500"
              }`}
              required
            />
          </div>

          <div
            className={`rounded-2xl border border-dashed p-6 text-center cursor-pointer ${
              isLight
                ? "border-slate-300 bg-slate-50 hover:bg-slate-100"
                : isSystem
                ? "border-indigo-500/30 bg-[#0c1630] hover:bg-[#122045]"
                : "border-white/20 bg-white/5 hover:bg-white/10"
            }`}
          >
            <UploadCloud className="h-8 w-8 mx-auto text-indigo-500 mb-2" />
            <p className="font-semibold text-xs">Drag & drop scanned lab certificates</p>
            <p className="text-[11px] opacity-60 mt-0.5">Supports PDF, PNG, JPG up to 25MB</p>
          </div>

          <div
            className={`rounded-xl p-3 text-[11px] ${
              isLight
                ? "bg-slate-50 text-slate-600"
                : isSystem
                ? "bg-[#0c1630] text-slate-300"
                : "bg-white/5 text-zinc-400"
            }`}
          >
            Certificates are verified by MercatoX legal auditors against national accreditation databases.
          </div>
        </form>
      </ModalDialog>
    </div>
  );
}



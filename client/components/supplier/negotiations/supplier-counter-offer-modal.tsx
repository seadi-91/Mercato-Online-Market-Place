"use client";

import React, { useState, useEffect } from "react";
import { ModalDialog } from "../shared/modal-dialog";
import { useSupplierStore } from "@/store/supplier-store";
import { NegotiationSession } from "@/types/supplier";
import {
  DollarSign,
  Paperclip,
  Scale,
  Sparkles,
  ShieldCheck,
  Truck,
  Clock,
  TrendingUp,
  FileCheck,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

interface ExtendedNegotiationSession extends NegotiationSession {
  prefilledCounterPrice?: number;
}

const INCOTERM_OPTIONS = [
  "FOB Addis Ababa Logistics Hub",
  "CIF Mojo Dry Port",
  "EXW Supplier Facility",
  "DDP Project Destination",
  "DAP Bole Cargo Terminal",
];

const PAYMENT_TERMS_OPTIONS = [
  "100% Irrevocable Escrow against Goods Inspection",
  "50% Escrow Advance, 50% upon Inspection Signoff",
  "30% Advance Escrow, 70% upon Bill of Lading",
  "Irrevocable Commercial Bank L/C",
  "Direct Interbank Transfer (RTGS)",
];

const RATIONALE_SUGGESTIONS = [
  "Includes free mechanical crane offloading at project site",
  "Conditioned on 100% Escrow deposit today",
  "Includes complimentary GrainPro hermetic export packaging",
  "Guaranteed 48-hour priority dispatch from central warehouse",
  "Includes ECAA third-party laboratory tensile analysis certificate",
];

export function SupplierCounterOfferModal() {
  const { activeModal, modalData, closeModal, sendCounterOffer } = useSupplierStore();

  const isOpen = activeModal === "counter-offer" && Boolean(modalData);
  const session: ExtendedNegotiationSession = modalData;

  const defaultPrice = session
    ? session.prefilledCounterPrice || Math.round((session.originalBuyerTarget + session.supplierCurrentOffer) / 2)
    : 0;

  const [counterPrice, setCounterPrice] = useState<number>(defaultPrice);
  const [incoterm, setIncoterm] = useState<string>("");
  const [leadTimeDays, setLeadTimeDays] = useState<number>(5);
  const [paymentTerms, setPaymentTerms] = useState<string>("");
  const [message, setMessage] = useState("");
  const [attachedFile, setAttachedFile] = useState<string | null>(null);

  // Sync when session changes
  useEffect(() => {
    if (session) {
      setCounterPrice(
        session.prefilledCounterPrice || Math.round((session.originalBuyerTarget + session.supplierCurrentOffer) / 2)
      );
      setIncoterm(session.incoterm || "");
      setLeadTimeDays(session.deliveryLeadTimeDays || 3);
      setPaymentTerms(session.paymentTerms || "");
      setMessage("");
      setAttachedFile(null);
    }
  }, [session?.id, session?.prefilledCounterPrice, session?.incoterm, session?.deliveryLeadTimeDays, session?.paymentTerms]);

  if (!isOpen || !session) return null;

  const midpoint = Math.round((session.originalBuyerTarget + session.supplierCurrentOffer) / 2);
  const discount1Pct = Math.round(session.supplierCurrentOffer * 0.99);
  const discount2Pct = Math.round(session.supplierCurrentOffer * 0.98);

  const lotSubtotal = counterPrice * session.targetQty;
  const vatAmount = Math.round(lotSubtotal * 0.15); // 15% Ethiopian VAT
  const lotTotalWithVat = lotSubtotal + vatAmount;
  const priceDiff = counterPrice - session.originalBuyerTarget;

  // Margin calculation
  const unitCost = session.estimatedUnitCost || Math.round(session.originalBuyerTarget * 0.85);
  const grossProfitPerUnit = counterPrice - unitCost;
  const marginPercentage = counterPrice > 0 ? ((grossProfitPerUnit / counterPrice) * 100).toFixed(1) : "0";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterPrice || counterPrice <= 0) {
      toast.error("Please enter a valid counter offer price.");
      return;
    }

    sendCounterOffer(session.id, counterPrice, message, {
      attachmentName: attachedFile || undefined,
      incoterm,
      deliveryLeadTimeDays: leadTimeDays,
      paymentTerms,
    });
  };

  const handleApplySuggestion = (text: string) => {
    setMessage((prev) => (prev ? `${prev}. ${text}` : text));
    toast.success("Commercial rationale added to note.");
  };

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={closeModal}
      title="Submit B2B Commercial Counter Offer"
      subtitle={`Tender Negotiation for ${session.productName} • Lot: ${session.targetQty.toLocaleString()} ${session.unit} to ${session.buyerCompany}`}
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={closeModal}
            className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>Transmit Binding Counter Offer</span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        {/* Top 3-Pillar Price Comparison Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="space-y-1">
            <span className="text-zinc-400 text-[11px] font-semibold flex items-center gap-1">
              <span>Buyer Target Rate</span>
            </span>
            <p className="font-bold text-emerald-400 font-mono text-base">
              ETB {session.originalBuyerTarget.toLocaleString()}{" "}
              <span className="text-xs font-normal text-zinc-400">/ {session.unit}</span>
            </p>
            <p className="text-[10px] text-zinc-500">Buyer stated budget ceiling</p>
          </div>

          <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-white/10 sm:pl-3 pt-2 sm:pt-0">
            <span className="text-zinc-400 text-[11px] font-semibold">Your Previous Offer</span>
            <p className="font-bold text-indigo-400 font-mono text-base">
              ETB {session.supplierCurrentOffer.toLocaleString()}{" "}
              <span className="text-xs font-normal text-zinc-400">/ {session.unit}</span>
            </p>
            <p className="text-[10px] text-zinc-500">Last quote submitted</p>
          </div>

          <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-white/10 sm:pl-3 pt-2 sm:pt-0">
            <span className="text-amber-400 text-[11px] font-semibold flex items-center gap-1">
              <Scale className="h-3 w-3" />
              <span>Proposed Spread Gap</span>
            </span>
            <p
              className={`font-bold font-mono text-base ${
                priceDiff === 0 ? "text-emerald-400" : priceDiff > 0 ? "text-amber-400" : "text-rose-400"
              }`}
            >
              {priceDiff === 0
                ? "Exact Match (0 ETB)"
                : `${priceDiff > 0 ? "+" : ""}${priceDiff.toLocaleString()} ETB`}
            </p>
            <p className="text-[10px] text-zinc-500">
              Estimated Margin:{" "}
              <strong className={Number(marginPercentage) >= 12 ? "text-emerald-400" : "text-amber-400"}>
                {marginPercentage}%
              </strong>
            </p>
          </div>
        </div>

        {/* Quick Propose Shortcut Buttons */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-zinc-400 font-semibold flex items-center justify-between">
            <span>Fast Proposal Strategies:</span>
            <span className="text-[10px] text-zinc-500">Click to apply immediate benchmark</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setCounterPrice(midpoint)}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                counterPrice === midpoint
                  ? "border-amber-500 bg-amber-500/20 text-amber-300 font-bold shadow-xs"
                  : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]"
              }`}
            >
              <div className="text-[10px] opacity-75">Meet in Middle (50%)</div>
              <div className="font-mono font-bold mt-0.5 text-xs">{midpoint.toLocaleString()} ETB</div>
            </button>

            <button
              type="button"
              onClick={() => setCounterPrice(discount1Pct)}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                counterPrice === discount1Pct
                  ? "border-indigo-500 bg-indigo-500/20 text-indigo-300 font-bold shadow-xs"
                  : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]"
              }`}
            >
              <div className="text-[10px] opacity-75">-1% Fast Deal</div>
              <div className="font-mono font-bold mt-0.5 text-xs">{discount1Pct.toLocaleString()} ETB</div>
            </button>

            <button
              type="button"
              onClick={() => setCounterPrice(discount2Pct)}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                counterPrice === discount2Pct
                  ? "border-indigo-500 bg-indigo-500/20 text-indigo-300 font-bold shadow-xs"
                  : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]"
              }`}
            >
              <div className="text-[10px] opacity-75">-2% Bulk Rebate</div>
              <div className="font-mono font-bold mt-0.5 text-xs">{discount2Pct.toLocaleString()} ETB</div>
            </button>

            <button
              type="button"
              onClick={() => setCounterPrice(session.originalBuyerTarget)}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                counterPrice === session.originalBuyerTarget
                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold shadow-xs"
                  : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]"
              }`}
            >
              <div className="text-[10px] opacity-75">Match Buyer</div>
              <div className="font-mono font-bold mt-0.5 text-xs">{session.originalBuyerTarget.toLocaleString()} ETB</div>
            </button>
          </div>
        </div>

        {/* Counter Price Main Input */}
        <div>
          <label className="block text-zinc-300 mb-1.5 font-semibold text-xs">
            Revised Wholesale Counter Offer (ETB per {session.unit}) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-mono font-bold text-xs">
              ETB
            </span>
            <input
              type="number"
              min={1}
              value={counterPrice}
              onChange={(e) => setCounterPrice(Number(e.target.value))}
              className="w-full rounded-xl border border-white/15 bg-white/[0.05] pl-14 pr-24 py-3 text-white font-mono font-bold text-base focus:border-indigo-500 focus:bg-white/[0.08] focus:outline-hidden transition-colors"
              required
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">
              / {session.unit}
            </span>
          </div>

          {/* Real-time Commercial Breakdown Strip */}
          <div className="mt-2.5 rounded-xl border border-white/10 bg-white/[0.02] p-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-zinc-400">
            <div>
              <span>Lot Subtotal: </span>
              <strong className="text-white font-mono">ETB {lotSubtotal.toLocaleString()}</strong>
            </div>
            <div>
              <span>15% VAT: </span>
              <strong className="text-zinc-300 font-mono">+ETB {vatAmount.toLocaleString()}</strong>
            </div>
            <div className="sm:text-right">
              <span>Gross Payable: </span>
              <strong className="text-emerald-400 font-mono font-bold">ETB {lotTotalWithVat.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Commercial & Logistics Terms Concessions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Incoterm */}
          <div>
            <label className="block text-zinc-300 mb-1 font-semibold text-[11px] flex items-center gap-1">
              <Truck className="h-3 w-3 text-indigo-400" />
              <span>Incoterm Delivery Term</span>
            </label>
            <select
              value={incoterm}
              onChange={(e) => setIncoterm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0e1424] text-white px-3 py-2 text-xs focus:border-indigo-500 focus:outline-hidden"
            >
              {INCOTERM_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Lead Time */}
          <div>
            <label className="block text-zinc-300 mb-1 font-semibold text-[11px] flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-400" />
              <span>Dispatch Lead Time</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={60}
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-white text-xs focus:border-indigo-500 focus:outline-hidden"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[11px]">Days</span>
            </div>
          </div>

          {/* Payment Terms */}
          <div>
            <label className="block text-zinc-300 mb-1 font-semibold text-[11px] flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span>Payment Protocol</span>
            </label>
            <select
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0e1424] text-white px-3 py-2 text-xs focus:border-indigo-500 focus:outline-hidden"
            >
              {PAYMENT_TERMS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Commercial Rationale Suggestions */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-zinc-400 font-semibold flex items-center justify-between">
            <span>Commercial Value-Add Chips (Click to append):</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {RATIONALE_SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleApplySuggestion(sug)}
                className="text-[10px] px-2.5 py-1 rounded-lg border border-white/10 bg-white/[0.03] text-zinc-300 hover:border-indigo-400 hover:text-white hover:bg-indigo-600/10 transition-colors cursor-pointer text-left"
              >
                + {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Commercial Rationale Message */}
        <div>
          <label className="block text-zinc-300 mb-1.5 font-semibold text-xs">
            Commercial Rationale & Conditions Note
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Specify reason for revised rate (e.g. Free transport to Mojo dry port, included standard export sacks, or guaranteed 48h dispatch)..."
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-white placeholder-zinc-500 text-xs focus:border-indigo-500 focus:outline-hidden resize-none"
          />
        </div>

        {/* Attachment Box */}
        <div
          onClick={() => {
            const fileName =
              session.unit === "Tons"
                ? "Mill_Tensile_Certification_Rebar16mm.pdf"
                : session.unit === "KG"
                ? "Speciality_Coffee_SCA_Cupping_Lab_Report.pdf"
                : "Grade1_Quality_Conformity_Certificate.pdf";
            setAttachedFile(fileName);
            toast.success(`Attached technical specification: ${fileName}`);
          }}
          className="rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-3 text-center text-zinc-400 hover:bg-white/[0.05] hover:text-white transition-colors cursor-pointer"
        >
          <Paperclip className="h-4 w-4 mx-auto mb-1 text-indigo-400" />
          <span>
            {attachedFile ? (
              <span className="text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
                <FileCheck className="h-3.5 w-3.5" />
                <span>{attachedFile} (Ready to Transmit)</span>
              </span>
            ) : (
              "Attach Spec Sheet / Laboratory Analysis Certificate (Optional PDF)"
            )}
          </span>
        </div>
      </form>
    </ModalDialog>
  );
}

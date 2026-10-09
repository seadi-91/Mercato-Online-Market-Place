"use client";

import React, { useState } from "react";
import {
  X,
  Handshake,
  TrendingDown,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Truck,
  CreditCard,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { SourcingProduct, SourcingNegotiation } from "@/types/supplier";
import { useSupplierStore } from "@/store/supplier-store";
import { toast } from "sonner";
import { getAccurateProductImage } from "@/lib/utils/product-image";

interface Props {
  product: SourcingProduct | null;
  existingNegotiation?: SourcingNegotiation | null;
  onClose: () => void;
  onProceedToCheckout?: (negotiation: SourcingNegotiation) => void;
}

export function SupplierSourcingNegotiateModal({
  product,
  existingNegotiation,
  onClose,
  onProceedToCheckout,
}: Props) {
  const {
    warehouses,
    createSourcingNegotiation,
    sendSourcingNegotiationMessage,
    acceptSourcingNegotiation,
  } = useSupplierStore();

  const isExisting = !!existingNegotiation;
  const activeProduct = product;

  // Form states for creating new negotiation
  const [targetQty, setTargetQty] = useState(activeProduct?.moq || 10);
  const [proposedPrice, setProposedPrice] = useState(
    Math.round((activeProduct?.baseWholesalePrice || 1000) * 0.92)
  );
  const [deliveryTerms, setDeliveryTerms] = useState("CIF Destination Warehouse (Door Delivery)");
  const [paymentTerms, setPaymentTerms] = useState(
    "100% MercatoX Escrow Lock (Release upon Inspection)"
  );
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(
    warehouses[0]?.id || "wh-aa"
  );
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Message chat input for existing negotiation
  const [chatMessage, setChatMessage] = useState("");
  const [counterPriceInput, setCounterPriceInput] = useState<number | undefined>(undefined);

  if (!activeProduct && !existingNegotiation) return null;

  const basePrice = activeProduct?.baseWholesalePrice || existingNegotiation?.listedPricePerUnit || 1000;
  const unit = activeProduct?.unit || existingNegotiation?.productUnit || "Unit";
  const productName = activeProduct?.name || existingNegotiation?.productName || "Product";
  const supplierName = activeProduct?.supplierName || existingNegotiation?.supplierName || "Supplier";
  const moq = activeProduct?.moq || 5;

  const discountAmount = Math.max(0, basePrice - proposedPrice);
  const discountPct = basePrice > 0 ? ((discountAmount / basePrice) * 100).toFixed(1) : "0";
  const totalProposalETB = proposedPrice * targetQty;
  const totalBaseETB = basePrice * targetQty;
  const totalSavingsETB = Math.max(0, totalBaseETB - totalProposalETB);

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;

    if (targetQty < moq) {
      toast.error(`Minimum order quantity is ${moq} ${unit}.`);
      return;
    }

    if (proposedPrice <= 0 || proposedPrice > basePrice * 1.5) {
      toast.error("Please provide a realistic proposed price per unit.");
      return;
    }

    const targetWh = warehouses.find((w) => w.id === selectedWarehouseId);
    const destinationText = targetWh
      ? `${targetWh.name} (${targetWh.address}, ${targetWh.city})`
      : "Addis Ababa Central Logistics Hub";

    setIsSubmitting(true);
    try {
      createSourcingNegotiation({
        productId: activeProduct.id,
        targetQuantity: targetQty,
        proposedPricePerUnit: proposedPrice,
        deliveryTerms,
        paymentTerms,
        destinationWarehouse: destinationText,
        notes:
          notes ||
          `We would like to procure ${targetQty} ${unit} at ETB ${proposedPrice.toLocaleString()}/${unit}. Payment secured via Escrow.`,
      });

      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit price negotiation proposal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingNegotiation || !chatMessage.trim()) return;

    sendSourcingNegotiationMessage(
      existingNegotiation.id,
      chatMessage.trim(),
      counterPriceInput
    );
    setChatMessage("");
    setCounterPriceInput(undefined);
  };

  const handleAcceptAndCheckout = () => {
    if (!existingNegotiation) return;
    acceptSourcingNegotiation(existingNegotiation.id);
    if (onProceedToCheckout) {
      onProceedToCheckout(existingNegotiation);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#0d121d] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto text-zinc-900 dark:text-zinc-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-850 bg-zinc-50/80 dark:bg-zinc-900/60 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {isExisting
                  ? `Negotiation #${existingNegotiation.negotiationCode}`
                  : "B2B Price Bargaining & Counter-Offer"}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Negotiating with <span className="text-zinc-900 dark:text-zinc-200 font-semibold">{supplierName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Target Product Summary Banner */}
          <div className="flex items-center gap-4 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
            <img
              src={getAccurateProductImage(
                productName,
                unit,
                activeProduct?.images?.[0] || existingNegotiation?.productImage
              )}
              alt=""
              className="w-14 h-14 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700/80 shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = getAccurateProductImage(productName, unit);
              }}
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">{productName}</h4>
              <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                <span>
                  Listed Price:{" "}
                  <strong className="text-zinc-800 dark:text-zinc-200">
                    ETB {basePrice.toLocaleString()}/{unit}
                  </strong>
                </span>
                <span>•</span>
                <span>MOQ: {moq} {unit}</span>
              </div>
            </div>
            {isExisting && existingNegotiation && (
              <div className="shrink-0 text-right">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    existingNegotiation.status === "agreed"
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30"
                      : existingNegotiation.status === "counter_offered"
                      ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30"
                      : existingNegotiation.status === "declined"
                      ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30"
                      : "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-500/30"
                  }`}
                >
                  {existingNegotiation.status === "counter_offered"
                    ? "Counter-Offer Received"
                    : existingNegotiation.status.replace("_", " ").toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Form for NEW Negotiation */}
          {!isExisting ? (
            <form onSubmit={handleCreateProposal} className="space-y-5">
              {/* Target Quantity & Proposed Unit Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                    <span>Desired Order Quantity</span>
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500">Min: {moq} {unit}</span>
                  </label>
                  <div className="flex items-center rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 px-3.5 py-2.5 focus-within:border-indigo-500">
                    <input
                      type="number"
                      min={moq}
                      value={targetQty}
                      onChange={(e) => setTargetQty(Math.max(1, Number(e.target.value) || 1))}
                      required
                      className="w-full bg-transparent text-sm font-semibold text-zinc-900 dark:text-zinc-100 outline-none"
                    />
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{unit}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                    <span>Proposed Target Unit Price</span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">-{discountPct}% vs Listed</span>
                  </label>
                  <div className="flex items-center rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 px-3.5 py-2.5 focus-within:border-indigo-500">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 mr-2">ETB</span>
                    <input
                      type="number"
                      min={1}
                      value={proposedPrice}
                      onChange={(e) => setProposedPrice(Math.max(1, Number(e.target.value) || 1))}
                      required
                      className="w-full bg-transparent text-sm font-semibold text-zinc-900 dark:text-zinc-100 outline-none"
                    />
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">/{unit}</span>
                  </div>
                </div>
              </div>

              {/* Price Calculation Card */}
              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-gradient-to-r dark:from-amber-950/20 dark:to-zinc-900 border border-amber-200 dark:border-amber-500/20 grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Total Proposed Offer</div>
                  <div className="text-sm sm:text-base font-bold text-amber-700 dark:text-amber-300 mt-0.5">
                    ETB {totalProposalETB.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Wholesale Value</div>
                  <div className="text-sm sm:text-base font-semibold text-zinc-400 line-through mt-0.5">
                    ETB {totalBaseETB.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Target Savings</div>
                  <div className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    ETB {totalSavingsETB.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Commercial Terms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    Delivery & Incoterm Terms
                  </label>
                  <select
                    value={deliveryTerms}
                    onChange={(e) => setDeliveryTerms(e.target.value)}
                    className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 outline-none focus:border-indigo-500"
                  >
                    <option value="CIF Destination Warehouse (Door Delivery)">
                      CIF Destination Warehouse (Door Delivery)
                    </option>
                    <option value="FOB Seller Regional Distribution Hub">
                      FOB Seller Regional Distribution Hub
                    </option>
                    <option value="EXW Supplier Yard / Factory Gate">
                      EXW Supplier Yard / Factory Gate
                    </option>
                    <option value="Direct Freight Transfer to Mojo Dry Port">
                      Direct Freight Transfer to Mojo Dry Port
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Proposed Payment Mechanism
                  </label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 outline-none focus:border-indigo-500"
                  >
                    <option value="100% MercatoX Escrow Lock (Release upon Inspection)">
                      100% MercatoX Escrow Lock (Release upon Inspection)
                    </option>
                    <option value="50% Escrow Advance / 50% on Handover">
                      50% Escrow Advance / 50% on Handover
                    </option>
                    <option value="Chapa Secured Instant B2B Escrow">
                      Chapa Secured Instant B2B Escrow
                    </option>
                  </select>
                </div>
              </div>

              {/* Destination Warehouse */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Receiving Destination Warehouse
                </label>
                <select
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(e.target.value)}
                  className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 outline-none focus:border-indigo-500"
                >
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name} — {wh.city || wh.region} (Stock: {wh.totalStockUnits?.toLocaleString() || 0} units)
                    </option>
                  ))}
                  {warehouses.length === 0 && (
                    <option value="wh-default">
                      Addis Ababa Central Logistics Hub (Kality Hub)
                    </option>
                  )}
                </select>
              </div>

              {/* Negotiation Justification Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Negotiation Message / Note to Seller
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. We are purchasing for our regional distribution hub. If this unit price is accepted, we are prepared to fund the Escrow immediately and setup monthly recurring purchases."
                  className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 p-3 text-xs text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02] disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Submit Price Offer
                </button>
              </div>
            </form>
          ) : (
            /* EXISTING Negotiation Conversation & Counter-Offer View */
            <div className="space-y-5">
              {/* Agreed / Counter Offer Highlights */}
              {existingNegotiation && existingNegotiation.status === "counter_offered" && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/40 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      Seller Counter-Offer: ETB{" "}
                      {existingNegotiation.sellerCounterPricePerUnit?.toLocaleString()}/{unit}
                    </span>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300">
                      Total for {existingNegotiation.targetQuantity} {unit}:{" "}
                      <strong>
                        ETB{" "}
                        {(
                          (existingNegotiation.sellerCounterPricePerUnit || 0) *
                          existingNegotiation.targetQuantity
                        ).toLocaleString()}
                      </strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAcceptAndCheckout}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Accept & Place Order
                    </button>
                  </div>
                </div>
              )}

              {existingNegotiation && existingNegotiation.status === "agreed" && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Deal Agreed at ETB{" "}
                      {existingNegotiation.agreedPricePerUnit?.toLocaleString()}/{unit}!
                    </span>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-0.5">
                      Proceed to fund the order via Chapa secured Escrow.
                    </p>
                  </div>
                  <button
                    onClick={handleAcceptAndCheckout}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shrink-0"
                  >
                    Proceed to Payment
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Message Thread */}
              <div className="space-y-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 max-h-72 overflow-y-auto">
                {existingNegotiation?.messages.map((msg) => {
                  const isMe = msg.sender === "buyer";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 dark:text-zinc-400 mb-1">
                        <span>{msg.senderName}</span>
                        <span>•</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-xs ${
                          isMe
                            ? "bg-indigo-600 text-white rounded-br-xs"
                            : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 rounded-bl-xs border border-zinc-200 dark:border-zinc-700/80 shadow-xs"
                        }`}
                      >
                        <p>{msg.text}</p>
                        {msg.offeredPrice && (
                          <div className="mt-1.5 pt-1.5 border-t border-white/20 dark:border-zinc-700/50 font-mono text-[11px] font-bold">
                            Offered Price: ETB {msg.offeredPrice.toLocaleString()}/{unit}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Send Counter-Offer / Message Input */}
              {existingNegotiation && existingNegotiation.status !== "declined" && existingNegotiation.status !== "agreed" && (
                <form onSubmit={handleSendMessage} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-48 shrink-0">
                      <div className="flex items-center rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 px-3 py-2">
                        <span className="text-[11px] text-zinc-500 mr-1.5">New Offer ETB:</span>
                        <input
                          type="number"
                          placeholder="Price"
                          value={counterPriceInput || ""}
                          onChange={(e) => setCounterPriceInput(e.target.value ? Number(e.target.value) : undefined)}
                          className="w-full bg-transparent text-xs font-semibold text-zinc-900 dark:text-zinc-100 outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex-1 flex items-center rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 px-3.5 py-2">
                      <input
                        type="text"
                        placeholder="Type reply or counter justification..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        className="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-200 outline-none"
                      />
                      <button
                        type="submit"
                        disabled={!chatMessage.trim()}
                        className="ml-2 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

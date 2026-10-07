"use client";

import React, { useState } from "react";
import { ModalDialog } from "../shared/modal-dialog";
import { useSupplierStore } from "@/store/supplier-store";
import { B2BOrder } from "@/types/supplier";
import { AlertCircle, CheckCircle, Clock, Calendar, FileText } from "lucide-react";

export function SupplierOrderActionModal() {
  const { activeModal, modalData, closeModal, acceptOrder, rejectOrder, requestOrderModification } =
    useSupplierStore();

  const [actionType, setActionType] = useState<"accept" | "reject" | "modify">("accept");
  const [sellerNote, setSellerNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [newDeliveryDate, setNewDeliveryDate] = useState("");

  const isOpen = activeModal === "order-action" && Boolean(modalData);
  const order: B2BOrder = modalData;

  if (!isOpen || !order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (actionType === "accept") {
      acceptOrder(order.id, sellerNote);
    } else if (actionType === "reject") {
      if (!rejectionReason.trim()) return;
      rejectOrder(order.id, rejectionReason);
    } else if (actionType === "modify") {
      if (!newDeliveryDate) return;
      requestOrderModification(order.id, newDeliveryDate, sellerNote);
    }
  };

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={closeModal}
      title={`Order Review: ${order.orderNumber}`}
      subtitle={`Buyer: ${order.buyerCompany} • Total: ETB ${order.total.toLocaleString()}`}
      maxWidth="lg"
      footer={
        <>
          <button
            type="button"
            onClick={closeModal}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={`rounded-lg px-4 py-2 text-xs font-semibold text-white cursor-pointer ${
              actionType === "accept"
                ? "bg-indigo-600 hover:bg-indigo-500"
                : actionType === "reject"
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {actionType === "accept" && "Confirm & Accept Order"}
            {actionType === "reject" && "Confirm Rejection"}
            {actionType === "modify" && "Send Modification Request"}
          </button>
        </>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Order Summary Mini Box */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-500">Product:</span>
              <p className="font-bold text-slate-900">{order.productName}</p>
            </div>
            <div>
              <span className="text-slate-500">Quantity Ordered:</span>
              <p className="font-bold text-slate-900">
                {order.quantity.toLocaleString()} {order.unit} @ ETB {order.unitPrice.toLocaleString()}/{order.unit}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Destination:</span>
              <p className="font-bold text-slate-900">{order.buyerLocation}</p>
            </div>
            <div>
              <span className="text-slate-500">Payment Protection:</span>
              <p className="font-bold text-emerald-700">100% MercatoX Escrow Secured</p>
            </div>
          </div>
        </div>

        {/* Action Type Selection Tabs */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">Select Action</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setActionType("accept")}
              className={`flex items-center justify-center gap-1.5 rounded-lg border p-2.5 font-bold cursor-pointer transition-all ${
                actionType === "accept"
                  ? "border-indigo-600 bg-emerald-50/60 text-indigo-600 dark:text-indigo-400"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <CheckCircle className="h-4 w-4" />
              <span>Accept Order</span>
            </button>

            <button
              type="button"
              onClick={() => setActionType("modify")}
              className={`flex items-center justify-center gap-1.5 rounded-lg border p-2.5 font-bold cursor-pointer transition-all ${
                actionType === "modify"
                  ? "border-blue-600 bg-blue-50/60 text-blue-700"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Modify Delivery</span>
            </button>

            <button
              type="button"
              onClick={() => setActionType("reject")}
              className={`flex items-center justify-center gap-1.5 rounded-lg border p-2.5 font-bold cursor-pointer transition-all ${
                actionType === "reject"
                  ? "border-rose-600 bg-rose-50/60 text-rose-700"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <AlertCircle className="h-4 w-4" />
              <span>Reject Order</span>
            </button>
          </div>
        </div>

        {/* Conditional Fields based on actionType */}
        {actionType === "accept" && (
          <div className="space-y-3 pt-1">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-emerald-900 leading-relaxed">
              Accepting this order creates a legally binding contract. The buyer has secured ETB{" "}
              {order.total.toLocaleString()} in Escrow, which will be released to your balance upon verified delivery.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Seller Dispatch Note (Optional)
              </label>
              <textarea
                rows={2}
                value={sellerNote}
                onChange={(e) => setSellerNote(e.target.value)}
                placeholder="e.g., Goods are queued for packaging at Kality Hub. Dispatch scheduled for Wednesday morning."
                className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:border-indigo-600 focus:outline-hidden"
              />
            </div>
          </div>
        )}

        {actionType === "modify" && (
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Proposed New Delivery Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={newDeliveryDate}
                onChange={(e) => setNewDeliveryDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-blue-600 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason / Clarification Note for Buyer <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={sellerNote}
                onChange={(e) => setSellerNote(e.target.value)}
                placeholder="Explain the logistical reason (e.g. freight fleet scheduling, packaging queue, custom bagging time)..."
                className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:border-blue-600 focus:outline-hidden"
                required
              />
            </div>
          </div>
        )}

        {actionType === "reject" && (
          <div className="space-y-3 pt-1">
            <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-3 text-rose-800 leading-relaxed">
              Order rejection cancels the transaction and returns buyer escrow funds. MercatoX tracks supplier
              fulfillment rates. A valid business reason is mandatory.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mandatory Rejection Reason <span className="text-rose-500">*</span>
              </label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-rose-600 focus:outline-hidden mb-2"
                required
              >
                <option value="">Select reason...</option>
                <option value="Insufficient warehouse inventory for requested batch size">
                  Insufficient warehouse inventory for requested batch size
                </option>
                <option value="Inability to fulfill requested tight delivery timeline">
                  Inability to fulfill requested tight delivery timeline
                </option>
                <option value="Raw material supply disruption at processing mill">
                  Raw material supply disruption at processing mill
                </option>
                <option value="Delivery location unreachable due to regional logistics">
                  Delivery location unreachable due to regional logistics
                </option>
                <option value="Custom buyer specifications cannot be certified">
                  Custom buyer specifications cannot be certified
                </option>
              </select>

              <textarea
                rows={2}
                value={sellerNote}
                onChange={(e) => setSellerNote(e.target.value)}
                placeholder="Additional notes for buyer..."
                className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:border-rose-600 focus:outline-hidden"
              />
            </div>
          </div>
        )}
      </div>
    </ModalDialog>
  );
}

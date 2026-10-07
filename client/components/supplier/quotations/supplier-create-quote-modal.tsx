"use client";

import React, { useState } from "react";
import { ModalDialog } from "../shared/modal-dialog";
import { useSupplierStore } from "@/store/supplier-store";
import { FileText, Calculator } from "lucide-react";

export function SupplierCreateQuoteModal() {
  const { activeModal, modalData, closeModal, createQuotation, products, customers } =
    useSupplierStore();

  const isOpen = activeModal === "create-quotation";

  // Pre-fill if coming from an RFQ
  const rfq = modalData;

  const [buyerCompany, setBuyerCompany] = useState(rfq?.buyerCompany || "Addis Continental Hotels Group");
  const [buyerName, setBuyerName] = useState(rfq?.buyerName || "Meron Tadesse");
  const [buyerEmail, setBuyerEmail] = useState("procurement@buyer.et");
  const [buyerPhone, setBuyerPhone] = useState("+251 91 123 4567");
  const [selectedProductId, setSelectedProductId] = useState(rfq?.productId || products[0]?.id || "");
  const [quantity, setQuantity] = useState<number>(rfq?.requestedQty || 1000);
  const [unitPrice, setUnitPrice] = useState<number>(rfq?.targetPrice ? rfq.targetPrice * 1.05 : 450);
  const [shippingCost, setShippingCost] = useState<number>(15000);
  const [paymentTerms, setPaymentTerms] = useState("50% Escrow Advance, 50% upon QA release");
  const [deliveryTerms, setDeliveryTerms] = useState("FOB Addis Ababa Central Logistics Hub");
  const [validUntil, setValidUntil] = useState("2026-10-31");
  const [notes, setNotes] = useState("Standard moisture test under 11.5% and phytosanitary certificate included.");

  if (!isOpen) return null;

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const subtotal = quantity * unitPrice;
  const discount = subtotal > 1000000 ? subtotal * 0.02 : 0;
  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * 0.15; // 15% Ethiopian VAT
  const grandTotal = taxableAmount + tax + shippingCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createQuotation({
      quoteNumber: `QT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      rfqId: rfq?.id,
      buyerName,
      buyerCompany,
      buyerEmail,
      buyerPhone,
      items: [
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          quantity,
          unit: selectedProduct.unit,
          unitPrice,
          total: subtotal,
        },
      ],
      subtotal,
      discount,
      tax,
      shippingCost,
      total: grandTotal,
      paymentTerms,
      deliveryTerms,
      validUntil,
      status: "sent",
      notes,
    });
  };

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={closeModal}
      title="Create Formal B2B Quotation"
      subtitle="Issue a binding commercial quotation with ETB VAT calculation and payment terms"
      maxWidth="2xl"
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
            className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-xs cursor-pointer"
          >
            Issue & Send Quotation
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Buyer Information Section */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-3">
          <p className="font-bold text-slate-900 flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Buyer Details</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Buyer Company</label>
              <input
                type="text"
                value={buyerCompany}
                onChange={(e) => setBuyerCompany(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-indigo-600 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Contact Person</label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-indigo-600 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Email</label>
              <input
                type="email"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-indigo-600 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Phone</label>
              <input
                type="text"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-indigo-600 focus:outline-hidden"
                required
              />
            </div>
          </div>
        </div>

        {/* Product & Line Item Pricing */}
        <div className="rounded-xl border border-slate-200 p-3.5 space-y-3">
          <p className="font-bold text-slate-900 flex items-center gap-1.5">
            <Calculator className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Product & Wholesale Line Item</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-slate-600 mb-1 font-medium">Select Catalog Product</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-indigo-600 focus:outline-hidden"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku}) — Base: ETB {p.basePrice}/{p.unit}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">
                Quoted Quantity ({selectedProduct.unit})
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-indigo-600 focus:outline-hidden font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">
                Unit Wholesale Price (ETB)
              </label>
              <input
                type="number"
                min={1}
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-indigo-600 focus:outline-hidden font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">
                Freight & Logistics (ETB)
              </label>
              <input
                type="number"
                min={0}
                value={shippingCost}
                onChange={(e) => setShippingCost(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-indigo-600 focus:outline-hidden font-bold"
              />
            </div>
          </div>
        </div>

        {/* Commercial Terms & Validity */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-600 mb-1 font-medium">Payment Terms</label>
            <input
              type="text"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-indigo-600 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-medium">Delivery Terms (Incoterms)</label>
            <input
              type="text"
              value={deliveryTerms}
              onChange={(e) => setDeliveryTerms(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-indigo-600 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-medium">Quotation Validity</label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-indigo-600 focus:outline-hidden"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-600 mb-1 font-medium">Commercial Notes / Specifications</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-indigo-600 focus:outline-hidden"
          />
        </div>

        {/* Financial Calculation Breakdown */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal ({quantity.toLocaleString()} {selectedProduct.unit}):</span>
            <span className="font-mono font-medium">ETB {subtotal.toLocaleString()}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Bulk Volume Discount (2%):</span>
              <span className="font-mono font-medium">- ETB {discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Ethiopian VAT (15%):</span>
            <span className="font-mono font-medium">+ ETB {tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Shipping & Transport:</span>
            <span className="font-mono font-medium">+ ETB {shippingCost.toLocaleString()}</span>
          </div>
          <div className="border-t border-emerald-200/80 pt-2 flex justify-between font-bold text-sm text-slate-900">
            <span>Grand Total (ETB):</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400">ETB {grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </form>
    </ModalDialog>
  );
}

"use client";

import React, { useState } from "react";
import { ModalDialog } from "../shared/modal-dialog";
import { useSupplierStore } from "@/store/supplier-store";
import {
  ArrowRight,
  Boxes,
  Building,
  Plus,
  Minus,
  ArrowRightLeft,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Warehouse,
  Truck,
  Sparkles,
} from "lucide-react";

export function SupplierAdjustStockModal() {
  const { activeModal, modalData, closeModal, adjustStock, products, warehouses } =
    useSupplierStore();

  const isOpen = activeModal === "adjust-stock";
  const defaultProduct = modalData?.productId
    ? products.find((p) => p.id === modalData.productId)
    : products[0];

  const [productId, setProductId] = useState(defaultProduct?.id || products[0]?.id || "");
  const [deltaQty, setDeltaQty] = useState<number>(500);
  const [direction, setDirection] = useState<"add" | "remove">(
    modalData?.type === "inbound" ? "add" : "add"
  );
  const [reason, setReason] = useState("Cooperative harvest delivery");
  const [warehouse, setWarehouse] = useState(
    warehouses[0] ? `${warehouses[0].name} (${warehouses[0].code})` : "Central Logistics Hub"
  );

  React.useEffect(() => {
    if (warehouses.length > 0 && !warehouse) {
      setWarehouse(`${warehouses[0].name} (${warehouses[0].code})`);
    }
  }, [warehouses, warehouse]);

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.id === productId) || products[0];
  if (!currentProduct) {
    return (
      <ModalDialog
        isOpen={isOpen}
        onClose={closeModal}
        title="Adjust Stock Inventory"
        maxWidth="sm"
      >
        <div className="p-6 text-center text-xs text-zinc-400">
          No catalog commodities found. Please add products first.
        </div>
      </ModalDialog>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDelta = direction === "add" ? Math.abs(deltaQty) : -Math.abs(deltaQty);
    adjustStock(currentProduct.id, finalDelta, reason, warehouse);
  };

  const calculatedStock =
    direction === "add"
      ? (currentProduct.stock || 0) + deltaQty
      : Math.max(0, (currentProduct.stock || 0) - deltaQty);

  const presets = [100, 500, 1000, 5000];

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={closeModal}
      title="Quick Stock Adjustment"
      subtitle="Easily add inbound harvest deliveries or record physical reconciliations"
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5 ${
              direction === "add"
                ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30"
                : "bg-rose-600 hover:bg-rose-500 shadow-rose-600/30"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Save Adjustment</span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Commodity Selector */}
        <div>
          <label className="block text-zinc-300 mb-1.5 font-semibold">Select Product</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#121824] px-3.5 py-2.5 text-white focus:border-indigo-500 focus:outline-none transition-colors cursor-pointer"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — Current: {p.stock.toLocaleString()} {p.unit}
              </option>
            ))}
          </select>
        </div>

        {/* Direction Toggle */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setDirection("add")}
            className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              direction === "add"
                ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300 shadow-sm"
                : "border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <Plus className="h-4 w-4 text-emerald-400" />
            <span>+ Add Inbound Stock</span>
          </button>

          <button
            type="button"
            onClick={() => setDirection("remove")}
            className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              direction === "remove"
                ? "border-rose-500/50 bg-rose-500/15 text-rose-300 shadow-sm"
                : "border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <Minus className="h-4 w-4 text-rose-400" />
            <span>- Deduct / Write-off</span>
          </button>
        </div>

        {/* Quantity with Quick Presets */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-zinc-300 font-semibold">
              Quantity ({currentProduct?.unit})
            </label>
            <div className="flex items-center gap-1">
              {presets.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDeltaQty(amt)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold transition-colors cursor-pointer border ${
                    deltaQty === amt
                      ? "bg-indigo-600 text-white border-indigo-500"
                      : "bg-white/[0.04] text-zinc-400 border-white/10 hover:text-white"
                  }`}
                >
                  +{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
          <input
            type="number"
            min={1}
            value={deltaQty}
            onChange={(e) => setDeltaQty(Number(e.target.value))}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-white font-mono font-bold text-sm focus:border-indigo-500 focus:outline-none"
            required
          />
        </div>

        {/* Warehouse */}
        <div>
          <label className="block text-zinc-300 mb-1.5 font-semibold">Warehouse Depot</label>
          <select
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#121824] px-3.5 py-2.5 text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            {warehouses.map((w) => (
              <option key={w.id} value={`${w.name} (${w.code})`}>
                {w.code} - {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* Live Calculation Preview Banner */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-xs flex items-center justify-between">
          <span className="text-zinc-400">New Available Stock:</span>
          <span className="font-bold text-white font-mono text-sm">
            {calculatedStock.toLocaleString()} {currentProduct?.unit}
          </span>
        </div>
      </form>
    </ModalDialog>
  );
}

export function SupplierTransferStockModal() {
  const { activeModal, closeModal, transferStock, products, warehouses } = useSupplierStore();

  const isOpen = activeModal === "transfer-stock";

  const [fromWarehouse, setFromWarehouse] = useState(
    warehouses[0] ? `${warehouses[0].name} (${warehouses[0].code})` : "Central Logistics Hub"
  );
  const [toWarehouse, setToWarehouse] = useState(
    warehouses[1]
      ? `${warehouses[1].name} (${warehouses[1].code})`
      : warehouses[0]
      ? `${warehouses[0].name} (${warehouses[0].code})`
      : "Regional Logistics Hub"
  );
  const [productId, setProductId] = useState(products[0]?.id || "");
  const [quantity, setQuantity] = useState<number>(1000);

  React.useEffect(() => {
    if (warehouses.length > 0) {
      if (!fromWarehouse) setFromWarehouse(`${warehouses[0].name} (${warehouses[0].code})`);
      if (!toWarehouse) {
        setToWarehouse(
          warehouses[1]
            ? `${warehouses[1].name} (${warehouses[1].code})`
            : `${warehouses[0].name} (${warehouses[0].code})`
        );
      }
    }
  }, [warehouses, fromWarehouse, toWarehouse]);

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.id === productId) || products[0];
  if (!currentProduct) {
    return (
      <ModalDialog
        isOpen={isOpen}
        onClose={closeModal}
        title="Inter-Depot Stock Transfer"
        maxWidth="sm"
      >
        <div className="p-6 text-center text-xs text-zinc-400">
          No catalog commodities found to transfer. Please add products first.
        </div>
      </ModalDialog>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromWarehouse === toWarehouse) return;
    transferStock(fromWarehouse, toWarehouse, currentProduct.name, quantity, currentProduct.unit);
  };

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={closeModal}
      title="Inter-Depot Stock Transfer"
      subtitle="Relocate bulk commodity inventory between regional logistics hubs"
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={fromWarehouse === toWarehouse}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Truck className="h-4 w-4" />
            <span>Confirm Transfer</span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Origin & Destination */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-zinc-300 mb-1.5 font-semibold">From (Dispatch)</label>
            <select
              value={fromWarehouse}
              onChange={(e) => setFromWarehouse(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#121824] px-3.5 py-2.5 text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={`${w.name} (${w.code})`}>
                  {w.code} - {w.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-zinc-300 mb-1.5 font-semibold">To (Destination)</label>
            <select
              value={toWarehouse}
              onChange={(e) => setToWarehouse(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#121824] px-3.5 py-2.5 text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={`${w.name} (${w.code})`}>
                  {w.code} - {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {fromWarehouse === toWarehouse && (
          <p className="text-xs text-rose-400 font-medium">
            Origin and destination must be different depots.
          </p>
        )}

        <div>
          <label className="block text-zinc-300 mb-1.5 font-semibold">Select Commodity</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#121824] px-3.5 py-2.5 text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — Available: {p.stock.toLocaleString()} {p.unit}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-zinc-300 mb-1.5 font-semibold">
            Transfer Amount ({currentProduct?.unit})
          </label>
          <input
            type="number"
            min={1}
            max={currentProduct?.stock || 999999}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-white font-mono font-bold text-sm focus:border-indigo-500 focus:outline-none"
            required
          />
        </div>
      </form>
    </ModalDialog>
  );
}

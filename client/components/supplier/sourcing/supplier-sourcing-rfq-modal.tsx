"use client";

import React, { useState } from "react";
import {
  X,
  FileQuestion,
  Send,
  Calendar,
  MapPin,
} from "lucide-react";
import { useSupplierStore } from "@/store/supplier-store";
import { toast } from "sonner";

interface Props {
  onClose: () => void;
}

export function SupplierSourcingRFQModal({ onClose }: Props) {
  const { warehouses } = useSupplierStore();

  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("Agricultural Commodities");
  const [targetQuantity, setTargetQuantity] = useState(50);
  const [unit, setUnit] = useState("Quintal (100kg)");
  const [maxBudgetPerUnit, setMaxBudgetPerUnit] = useState(12000);
  const [deliveryWarehouseId, setDeliveryWarehouseId] = useState(warehouses[0]?.id || "wh-aa");
  const [requiredDate, setRequiredDate] = useState("2026-10-25");
  const [specifications, setSpecifications] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) {
      toast.error("Please enter the required commodity or item name.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        `Procurement RFQ for "${itemName}" broadcast to all verified suppliers!`
      );
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0d121d] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto text-zinc-900 dark:text-zinc-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-850 bg-zinc-50/80 dark:bg-zinc-900/60 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FileQuestion className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Broadcast Bulk Procurement RFQ
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Request competitive quotes from all verified suppliers on MercatoX
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Item Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Commodity / Product Name Needed
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Grade 1 Sidama Washed Arabica Coffee / Soya Beans / 12mm Rebars"
              required
              className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-500 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            />
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 outline-none focus:border-indigo-500"
              >
                <option value="Agricultural Commodities">Agricultural Commodities</option>
                <option value="Construction & Industrial">Construction & Industrial</option>
                <option value="Packaging & Logistics">Packaging & Logistics</option>
                <option value="Electronics & Energy">Electronics & Energy</option>
                <option value="Food & Groceries">Food & Groceries</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Measurement Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 outline-none focus:border-indigo-500"
              >
                <option value="Quintal (100kg)">Quintal (100kg)</option>
                <option value="Metric Ton">Metric Ton (1,000kg)</option>
                <option value="Bale (500 Bags)">Bale (500 Bags)</option>
                <option value="Carton / Box">Carton / Box</option>
                <option value="Piece / Unit">Piece / Unit</option>
                <option value="Jerrycan (20L)">Jerrycan (20L)</option>
              </select>
            </div>
          </div>

          {/* Target Quantity & Max Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Required Target Quantity
              </label>
              <div className="flex items-center rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 px-3.5 py-2.5 focus-within:border-indigo-500">
                <input
                  type="number"
                  min={1}
                  value={targetQuantity}
                  onChange={(e) => setTargetQuantity(Math.max(1, Number(e.target.value) || 1))}
                  required
                  className="w-full bg-transparent text-sm font-semibold text-zinc-900 dark:text-zinc-100 outline-none"
                />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{unit}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Maximum Target Price per Unit
              </label>
              <div className="flex items-center rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 px-3.5 py-2.5 focus-within:border-indigo-500">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 mr-2">ETB</span>
                <input
                  type="number"
                  min={1}
                  value={maxBudgetPerUnit}
                  onChange={(e) => setMaxBudgetPerUnit(Math.max(1, Number(e.target.value) || 1))}
                  required
                  className="w-full bg-transparent text-sm font-semibold text-zinc-900 dark:text-zinc-100 outline-none"
                />
                <span className="text-xs text-zinc-400 dark:text-zinc-500">/{unit}</span>
              </div>
            </div>
          </div>

          {/* Delivery Warehouse & Required Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Receiving Warehouse Destination
              </label>
              <select
                value={deliveryWarehouseId}
                onChange={(e) => setDeliveryWarehouseId(e.target.value)}
                className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 outline-none focus:border-indigo-500"
              >
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name} — {wh.city || wh.region}
                  </option>
                ))}
                {warehouses.length === 0 && (
                  <option value="wh-aa">Addis Ababa Central Logistics Hub</option>
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Required Delivery Deadline
              </label>
              <input
                type="date"
                value={requiredDate}
                onChange={(e) => setRequiredDate(e.target.value)}
                className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 px-3.5 py-2 text-xs text-zinc-800 dark:text-zinc-200 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Detailed Specifications */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Quality Specs, Packaging & Certification Requirements
            </label>
            <textarea
              rows={3}
              value={specifications}
              onChange={(e) => setSpecifications(e.target.value)}
              placeholder="e.g. Moisture level < 11%, ECX or ECAE certificates required, 50kg PP sacks, delivery with official VAT invoice."
              className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 p-3 text-xs text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
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
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 hover:scale-[1.02] disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Broadcast Procurement RFQ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

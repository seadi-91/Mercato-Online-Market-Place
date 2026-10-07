"use client";

import React, { useState } from "react";
import { ModalDialog } from "../shared/modal-dialog";
import { B2BInventoryItem, DamagedStockRecord } from "@/data/supplier-inventory-data";
import {
  Boxes,
  Plus,
  Minus,
  ArrowRightLeft,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Warehouse,
  Truck,
  Download,
  Calendar,
  Layers,
  FileSpreadsheet,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useThemeStore } from "@/store/theme-store";

// ==========================================
// 1. ADD STOCK (STOCK IN) MODAL
// ==========================================
interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: B2BInventoryItem[];
  defaultProduct?: B2BInventoryItem | null;
  onAddStock: (data: {
    productId: string;
    warehouse: string;
    quantity: number;
    unit: string;
    batchNumber: string;
    supplierRef: string;
    purchaseCost: number;
    expiryDate: string;
    notes: string;
  }) => void;
}

export function AddStockModal({
  isOpen,
  onClose,
  products,
  defaultProduct,
  onAddStock,
}: AddStockModalProps) {
  const [productId, setProductId] = useState(defaultProduct?.id || products[0]?.id || "");
  const [warehouse, setWarehouse] = useState("Addis Ababa Central Logistics Hub (WH-AA)");
  const [quantity, setQuantity] = useState<number>(100);
  const [batchNumber, setBatchNumber] = useState(`LOT-${Date.now().toString().slice(-6)}`);
  const [supplierRef, setSupplierRef] = useState("COOP-DELIVERY-2026");
  const [purchaseCost, setPurchaseCost] = useState<number>(42000);
  const [expiryDate, setExpiryDate] = useState("2027-10-01");
  const [notes, setNotes] = useState("Inbound harvest intake batch inspection verified.");
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.id === productId) || products[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddStock({
      productId: currentProduct.id,
      warehouse,
      quantity,
      unit: currentProduct.unit,
      batchNumber,
      supplierRef,
      purchaseCost,
      expiryDate,
      notes,
    });
    onClose();
  };

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      title="+ Add Inbound Stock (Stock In)"
      subtitle="Record verified inbound harvest, cooperative deliveries, or supplier batches"
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${
              isLight ? "border-slate-200 text-slate-600 hover:bg-slate-100" : "border-white/10 text-zinc-300 hover:bg-white/10"
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#388E3C] text-xs font-bold text-white shadow-md shadow-emerald-700/20 cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Confirm Stock In</span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold mb-1 opacity-80">Select Product / Commodity</label>
            <select
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                const selected = products.find((p) => p.id === e.target.value);
                if (selected) setPurchaseCost(selected.costPrice);
              }}
              className={`w-full rounded-xl border px-3.5 py-2.5 font-medium cursor-pointer ${
                isLight ? "border-slate-200 bg-slate-50 text-slate-900" : "border-white/10 bg-[#121824] text-white"
              }`}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1 opacity-80">Destination Warehouse Depot</label>
            <select
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              className={`w-full rounded-xl border px-3.5 py-2.5 font-medium cursor-pointer ${
                isLight ? "border-slate-200 bg-slate-50 text-slate-900" : "border-white/10 bg-[#121824] text-white"
              }`}
            >
              <option value="Addis Ababa Central Logistics Hub (WH-AA)">Addis Ababa Central Hub (WH-AA)</option>
              <option value="Hawassa Agro-Processing Logistics Depot (WH-HW)">Hawassa Agro Depot (WH-HW)</option>
              <option value="Mojo Dry Port Multimodal Terminal (WH-MJ)">Mojo Dry Port Depot (WH-MJ)</option>
              <option value="Dire Dawa Free Trade Logistics Depot (WH-DD)">Dire Dawa Logistics Hub (WH-DD)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold mb-1 opacity-80">Quantity ({currentProduct?.unit})</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className={`w-full rounded-xl border px-3.5 py-2.5 font-mono font-bold ${
                isLight ? "border-slate-200 bg-white text-slate-900" : "border-white/10 bg-white/[0.04] text-white"
              }`}
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 opacity-80">Batch / Lot Number</label>
            <input
              type="text"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              className={`w-full rounded-xl border px-3.5 py-2.5 font-mono ${
                isLight ? "border-slate-200 bg-white text-slate-900" : "border-white/10 bg-white/[0.04] text-white"
              }`}
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 opacity-80">Purchase Cost / Unit (ETB)</label>
            <input
              type="number"
              value={purchaseCost}
              onChange={(e) => setPurchaseCost(Number(e.target.value))}
              className={`w-full rounded-xl border px-3.5 py-2.5 font-mono ${
                isLight ? "border-slate-200 bg-white text-slate-900" : "border-white/10 bg-white/[0.04] text-white"
              }`}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold mb-1 opacity-80">Supplier / Delivery Note Ref.</label>
            <input
              type="text"
              value={supplierRef}
              onChange={(e) => setSupplierRef(e.target.value)}
              placeholder="e.g. GRN-9942 or COOP-INVOICE"
              className={`w-full rounded-xl border px-3.5 py-2.5 ${
                isLight ? "border-slate-200 bg-white text-slate-900" : "border-white/10 bg-white/[0.04] text-white"
              }`}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 opacity-80">Expiration / Harvest Date</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className={`w-full rounded-xl border px-3.5 py-2.5 ${
                isLight ? "border-slate-200 bg-white text-slate-900" : "border-white/10 bg-white/[0.04] text-white"
              }`}
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-1 opacity-80">Intake Inspection Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`w-full rounded-xl border px-3.5 py-2 text-xs ${
              isLight ? "border-slate-200 bg-white text-slate-900" : "border-white/10 bg-white/[0.04] text-white"
            }`}
          />
        </div>

        {/* Calculation Preview */}
        <div
          className={`rounded-xl border p-3 flex items-center justify-between text-xs ${
            isLight ? "bg-emerald-50/50 border-emerald-200" : "bg-emerald-500/10 border-emerald-500/20"
          }`}
        >
          <span className="text-emerald-500 font-semibold">New Available Quantity:</span>
          <span className="font-bold font-mono text-sm">
            {(currentProduct.availableStock + quantity).toLocaleString()} {currentProduct.unit}
          </span>
        </div>
      </form>
    </ModalDialog>
  );
}

// ==========================================
// 2. STOCK ADJUSTMENT MODAL
// ==========================================
interface AdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: B2BInventoryItem[];
  defaultProduct?: B2BInventoryItem | null;
  onAdjustStock: (data: {
    productId: string;
    warehouse: string;
    currentQty: number;
    physicalQty: number;
    difference: number;
    unit: string;
    reason: string;
    notes: string;
  }) => void;
}

export function AdjustStockModal({
  isOpen,
  onClose,
  products,
  defaultProduct,
  onAdjustStock,
}: AdjustModalProps) {
  const [productId, setProductId] = useState(defaultProduct?.id || products[0]?.id || "");
  const [warehouse, setWarehouse] = useState("Addis Ababa Central Logistics Hub (WH-AA)");
  const currentProduct = products.find((p) => p.id === productId) || products[0];

  const [physicalQty, setPhysicalQty] = useState<number>(currentProduct?.totalStock || 500);
  const [reason, setReason] = useState("Q3 physical cycle count reconciliation");
  const [notes, setNotes] = useState("Certified scale weighbridge reconciliation report attached.");
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  if (!isOpen) return null;

  const currentQty = currentProduct?.totalStock || 0;
  const difference = physicalQty - currentQty;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdjustStock({
      productId: currentProduct.id,
      warehouse,
      currentQty,
      physicalQty,
      difference,
      unit: currentProduct.unit,
      reason,
      notes,
    });
    onClose();
  };

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Adjust Physical Inventory (Reconciliation)"
      subtitle="Reconcile physical stock counts with system records with mandatory audit traceability"
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${
              isLight ? "border-slate-200 text-slate-600 hover:bg-slate-100" : "border-white/10 text-zinc-300 hover:bg-white/10"
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 cursor-pointer flex items-center gap-1.5"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Confirm Audit Adjustment</span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold mb-1 opacity-80">Select Product</label>
          <select
            value={productId}
            onChange={(e) => {
              setProductId(e.target.value);
              const p = products.find((x) => x.id === e.target.value);
              if (p) setPhysicalQty(p.totalStock);
            }}
            className={`w-full rounded-xl border px-3.5 py-2.5 font-medium cursor-pointer ${
              isLight ? "border-slate-200 bg-slate-50 text-slate-900" : "border-white/10 bg-[#121824] text-white"
            }`}
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — System Qty: {p.totalStock.toLocaleString()} {p.unit}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1 opacity-80">Warehouse Depot</label>
          <select
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
            className={`w-full rounded-xl border px-3.5 py-2.5 font-medium cursor-pointer ${
              isLight ? "border-slate-200 bg-slate-50 text-slate-900" : "border-white/10 bg-[#121824] text-white"
            }`}
          >
            <option value="Addis Ababa Central Logistics Hub (WH-AA)">Addis Ababa Central Hub (WH-AA)</option>
            <option value="Hawassa Agro-Processing Logistics Depot (WH-HW)">Hawassa Agro Depot (WH-HW)</option>
            <option value="Mojo Dry Port Multimodal Terminal (WH-MJ)">Mojo Dry Port Depot (WH-MJ)</option>
            <option value="Dire Dawa Free Trade Logistics Depot (WH-DD)">Dire Dawa Logistics Hub (WH-DD)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold mb-1 opacity-80">Current System Stock</label>
            <input
              type="text"
              disabled
              value={`${currentQty.toLocaleString()} ${currentProduct?.unit}`}
              className={`w-full rounded-xl border px-3.5 py-2.5 font-mono font-bold opacity-60 ${
                isLight ? "bg-slate-100 border-slate-200 text-slate-900" : "bg-white/5 border-white/10 text-white"
              }`}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 opacity-80">Actual Physical Count</label>
            <input
              type="number"
              min={0}
              value={physicalQty}
              onChange={(e) => setPhysicalQty(Number(e.target.value))}
              className={`w-full rounded-xl border px-3.5 py-2.5 font-mono font-bold text-sm ${
                isLight ? "border-slate-200 bg-white text-slate-900" : "border-white/10 bg-white/[0.04] text-white"
              }`}
              required
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-1 opacity-80">Audit Discrepancy Reason</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={`w-full rounded-xl border px-3.5 py-2.5 font-medium cursor-pointer ${
              isLight ? "border-slate-200 bg-slate-50 text-slate-900" : "border-white/10 bg-[#121824] text-white"
            }`}
          >
            <option value="Q3 physical cycle count reconciliation">Q3 physical cycle count reconciliation</option>
            <option value="Natural moisture loss drying shrinkage">Natural moisture loss drying shrinkage</option>
            <option value="Handling spillage during warehouse loading">Handling spillage during warehouse loading</option>
            <option value="Supplier delivery note surplus reconciliation">Supplier delivery note surplus reconciliation</option>
            <option value="Packaging tear & re-bagging variance">Packaging tear & re-bagging variance</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1 opacity-80">Auditor Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`w-full rounded-xl border px-3.5 py-2 text-xs ${
              isLight ? "border-slate-200 bg-white text-slate-900" : "border-white/10 bg-white/[0.04] text-white"
            }`}
          />
        </div>

        {/* Live Calculation Preview */}
        <div
          className={`rounded-xl border p-3 flex items-center justify-between text-xs ${
            difference >= 0
              ? isLight
                ? "bg-emerald-50 border-emerald-200"
                : "bg-emerald-500/10 border-emerald-500/20"
              : isLight
              ? "bg-rose-50 border-rose-200"
              : "bg-rose-500/10 border-rose-500/20"
          }`}
        >
          <span className="font-semibold">Calculated Audit Delta:</span>
          <span
            className={`font-bold font-mono text-sm ${
              difference >= 0 ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {difference >= 0 ? `+${difference.toLocaleString()}` : difference.toLocaleString()} {currentProduct?.unit}
          </span>
        </div>
      </form>
    </ModalDialog>
  );
}

// ==========================================
// 3. TRANSFER STOCK MODAL
// ==========================================
interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: B2BInventoryItem[];
  defaultProduct?: B2BInventoryItem | null;
  onTransferStock: (data: {
    fromWarehouse: string;
    toWarehouse: string;
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    vehiclePlate: string;
    driverName: string;
  }) => void;
}

export function TransferStockModal({
  isOpen,
  onClose,
  products,
  defaultProduct,
  onTransferStock,
}: TransferModalProps) {
  const [fromWarehouse, setFromWarehouse] = useState("Addis Ababa Central Logistics Hub (WH-AA)");
  const [toWarehouse, setToWarehouse] = useState("Hawassa Agro-Processing Logistics Depot (WH-HW)");
  const [productId, setProductId] = useState(defaultProduct?.id || products[0]?.id || "");
  const [quantity, setQuantity] = useState<number>(50);
  const [vehiclePlate, setVehiclePlate] = useState("ET-3-99412 (30-Ton Freight Truck)");
  const [driverName, setDriverName] = useState("Getachew Tadesse (+251 91 190 2233)");
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.id === productId) || products[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromWarehouse === toWarehouse) {
      toast.error("Origin and destination depots must be different.");
      return;
    }
    onTransferStock({
      fromWarehouse,
      toWarehouse,
      productId: currentProduct.id,
      productName: currentProduct.name,
      quantity,
      unit: currentProduct.unit,
      vehiclePlate,
      driverName,
    });
    onClose();
  };

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Inter-Depot Stock Transfer"
      subtitle="Schedule freight relocation of commodity inventory between regional logistics hubs"
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${
              isLight ? "border-slate-200 text-slate-600 hover:bg-slate-100" : "border-white/10 text-zinc-300 hover:bg-white/10"
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={fromWarehouse === toWarehouse}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
          >
            <Truck className="h-4 w-4" />
            <span>Confirm Transfer Dispatch</span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold mb-1 opacity-80">From (Origin Dispatch)</label>
            <select
              value={fromWarehouse}
              onChange={(e) => setFromWarehouse(e.target.value)}
              className={`w-full rounded-xl border px-3.5 py-2.5 font-medium cursor-pointer ${
                isLight ? "border-slate-200 bg-slate-50 text-slate-900" : "border-white/10 bg-[#121824] text-white"
              }`}
            >
              <option value="Addis Ababa Central Logistics Hub (WH-AA)">Addis Ababa Central Hub (WH-AA)</option>
              <option value="Hawassa Agro-Processing Logistics Depot (WH-HW)">Hawassa Agro Depot (WH-HW)</option>
              <option value="Mojo Dry Port Multimodal Terminal (WH-MJ)">Mojo Dry Port Depot (WH-MJ)</option>
              <option value="Dire Dawa Free Trade Logistics Depot (WH-DD)">Dire Dawa Logistics Hub (WH-DD)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1 opacity-80">To (Destination Facility)</label>
            <select
              value={toWarehouse}
              onChange={(e) => setToWarehouse(e.target.value)}
              className={`w-full rounded-xl border px-3.5 py-2.5 font-medium cursor-pointer ${
                isLight ? "border-slate-200 bg-slate-50 text-slate-900" : "border-white/10 bg-[#121824] text-white"
              }`}
            >
              <option value="Hawassa Agro-Processing Logistics Depot (WH-HW)">Hawassa Agro Depot (WH-HW)</option>
              <option value="Addis Ababa Central Logistics Hub (WH-AA)">Addis Ababa Central Hub (WH-AA)</option>
              <option value="Mojo Dry Port Multimodal Terminal (WH-MJ)">Mojo Dry Port Depot (WH-MJ)</option>
              <option value="Dire Dawa Free Trade Logistics Depot (WH-DD)">Dire Dawa Logistics Hub (WH-DD)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-1 opacity-80">Commodity</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className={`w-full rounded-xl border px-3.5 py-2.5 font-medium cursor-pointer ${
              isLight ? "border-slate-200 bg-slate-50 text-slate-900" : "border-white/10 bg-[#121824] text-white"
            }`}
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — Available: {p.availableStock.toLocaleString()} {p.unit}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1 opacity-80">
            Transfer Amount ({currentProduct?.unit})
          </label>
          <input
            type="number"
            min={1}
            max={currentProduct?.availableStock || 9999}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className={`w-full rounded-xl border px-3.5 py-2.5 font-mono font-bold text-sm ${
              isLight ? "border-slate-200 bg-white text-slate-900" : "border-white/10 bg-white/[0.04] text-white"
            }`}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold mb-1 opacity-80">Vehicle Plate / Type</label>
            <input
              type="text"
              value={vehiclePlate}
              onChange={(e) => setVehiclePlate(e.target.value)}
              className={`w-full rounded-xl border px-3.5 py-2.5 font-mono ${
                isLight ? "border-slate-200 bg-white text-slate-900" : "border-white/10 bg-white/[0.04] text-white"
              }`}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 opacity-80">Driver Lead & Contact</label>
            <input
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className={`w-full rounded-xl border px-3.5 py-2.5 ${
                isLight ? "border-slate-200 bg-white text-slate-900" : "border-white/10 bg-white/[0.04] text-white"
              }`}
            />
          </div>
        </div>
      </form>
    </ModalDialog>
  );
}

// ==========================================
// 4. DAMAGED STOCK WRITE-OFF CONFIRMATION
// ==========================================
interface WriteOffModalProps {
  item: DamagedStockRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmWriteOff: (item: DamagedStockRecord) => void;
}

export function DamagedWriteOffModal({
  item,
  isOpen,
  onClose,
  onConfirmWriteOff,
}: WriteOffModalProps) {
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  if (!isOpen || !item) return null;

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Damaged Stock Write-Off"
      subtitle="Destructive inventory adjustment requiring formal approval"
      maxWidth="sm"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${
              isLight ? "border-slate-200 text-slate-600 hover:bg-slate-100" : "border-white/10 text-zinc-300 hover:bg-white/10"
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmWriteOff(item);
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md shadow-rose-600/30 cursor-pointer flex items-center gap-1.5"
          >
            <span>Confirm Write-Off</span>
          </button>
        </div>
      }
    >
      <div className="space-y-3 text-xs">
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-2.5">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-rose-400" />
          <div>
            <p className="font-bold">Irreversible Write-Off Warning</p>
            <p className="text-[11px] opacity-90 mt-0.5">
              Are you sure you want to write off{" "}
              <strong>
                {item.quantity} {item.unit} of {item.productName}
              </strong>
              ? This stock will be permanently deducted from inventory valuation.
            </p>
          </div>
        </div>

        <div
          className={`p-3 rounded-xl border space-y-1.5 ${
            isLight ? "bg-slate-50 border-slate-200" : "bg-white/[0.02] border-white/10"
          }`}
        >
          <div className="flex justify-between">
            <span className="opacity-70">Depot Facility:</span>
            <span className="font-medium">{item.warehouse}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-70">Damage Reason:</span>
            <span className="font-medium">{item.reason}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-70">Estimated Loss:</span>
            <span className="font-bold font-mono text-rose-500">ETB {item.lossValueETB.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </ModalDialog>
  );
}

// ==========================================
// 5. EXPORT INVENTORY REPORT DIALOG
// ==========================================
interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportReportModal({ isOpen, onClose }: ExportReportModalProps) {
  const [reportType, setReportType] = useState("valuation");
  const [format, setFormat] = useState<"csv" | "excel" | "pdf">("csv");
  const [dateRange, setDateRange] = useState("30d");
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  if (!isOpen) return null;

  const handleExport = () => {
    toast.success(`Exporting ${reportType.toUpperCase()} in ${format.toUpperCase()} format...`);
    setTimeout(() => {
      toast.success("Report downloaded successfully to your device!");
      onClose();
    }, 1200);
  };

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Export Inventory Report"
      subtitle="Generate audit-ready commodity stock balances and financial reports"
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${
              isLight ? "border-slate-200 text-slate-600 hover:bg-slate-100" : "border-white/10 text-zinc-300 hover:bg-white/10"
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="px-5 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#388E3C] text-xs font-bold text-white shadow-md shadow-emerald-700/20 cursor-pointer flex items-center gap-1.5"
          >
            <Download className="h-4 w-4" />
            <span>Generate & Download</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold mb-1 opacity-80">Select Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className={`w-full rounded-xl border px-3.5 py-2.5 font-medium cursor-pointer ${
              isLight ? "border-slate-200 bg-slate-50 text-slate-900" : "border-white/10 bg-[#121824] text-white"
            }`}
          >
            <option value="valuation">Stock Valuation & Cost Price Report</option>
            <option value="movement">Comprehensive Stock Movement Audit Ledger</option>
            <option value="warehouse">Multi-Depot Warehouse Capacity & Allocation</option>
            <option value="lowstock">Low Stock & Critical Buffer Reorder Report</option>
            <option value="damaged">Damaged Stock & Scrap Write-off Log</option>
            <option value="reserved">B2B Escrow Reserved Inventory Breakdown</option>
            <option value="turnover">Inventory Velocity & Turnover Ratio</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1 opacity-80">Export File Format</label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: "csv", label: "CSV File (.csv)", icon: FileSpreadsheet },
              { id: "excel", label: "Excel (.xlsx)", icon: FileSpreadsheet },
              { id: "pdf", label: "PDF Document", icon: FileCheck },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFormat(f.id as any)}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer ${
                  format === f.id
                    ? isLight
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30"
                      : "border-emerald-500 bg-emerald-500/20 text-white ring-2 ring-emerald-500/40"
                    : isLight
                    ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    : "border-white/10 bg-white/[0.02] text-zinc-300 hover:bg-white/[0.06]"
                }`}
              >
                <f.icon className="h-5 w-5 text-emerald-500" />
                <span className="font-semibold text-xs">{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-1 opacity-80">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className={`w-full rounded-xl border px-3.5 py-2.5 font-medium cursor-pointer ${
              isLight ? "border-slate-200 bg-slate-50 text-slate-900" : "border-white/10 bg-[#121824] text-white"
            }`}
          >
            <option value="30d">Last 30 Days (Current Month)</option>
            <option value="90d">Last Quarter (Q3 2026)</option>
            <option value="ytd">Year to Date (Fiscal 2026)</option>
            <option value="all">Full Historical Lifetime Records</option>
          </select>
        </div>
      </div>
    </ModalDialog>
  );
}

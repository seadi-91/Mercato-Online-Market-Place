"use client";

import React, { useState, useEffect } from "react";
import {
  Truck,
  Package,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Phone,
  User,
  X,
  FileText,
  Navigation,
  Search,
  SlidersHorizontal,
  Download,
  Plus,
  MoreVertical,
  AlertTriangle,
  Printer,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  Eye,
  Trash2,
  Building2,
  ChevronRight,
  Info,
  Layers,
  Send,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { StatusBadge } from "../shared/status-badge";
import { Pagination } from "../shared/pagination";
import { EmptyState } from "../shared/empty-state";
import { useSupplierStore } from "@/store/supplier-store";
import { Shipment, ShipmentStatus, ShipmentItem } from "@/types/supplier";
import { toast } from "sonner";

export function SupplierShipmentsView() {
  const {
    shipments,
    setActiveTab,
    createShipment,
    updateShipmentStatus,
    updateShipmentDeliveryDate,
    deleteShipment,
  } = useSupplierStore();

  // Navigation & Detail state
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);

  // Filters & Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [carrierFilter, setCarrierFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // 3-dots action menu state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [isPodModalOpen, setIsPodModalOpen] = useState(false);
  const [modalShipmentTarget, setModalShipmentTarget] = useState<Shipment | null>(null);

  // Form states for modals
  const [statusToUpdate, setStatusToUpdate] = useState<ShipmentStatus>("in_transit");
  const [statusNote, setStatusNote] = useState("");
  const [newDeliveryDate, setNewDeliveryDate] = useState("");
  const [delayReasonInput, setDelayReasonInput] = useState("");

  // Create Shipment form state
  const [createForm, setCreateForm] = useState({
    orderNumber: "ORD-2070",
    purchaseOrderNumber: "PO-2026-9040",
    buyerCompany: "Sheba Food & Milling Industries",
    warehouse: "Addis Main Warehouse",
    destination: "Hawassa",
    destinationLocation: "Sheba Agro Milling Site, Hawassa Industrial Corridor",
    shippingMethod: "Road Freight (Heavy Curtain-Sider)",
    carrier: "Ethio Logistics Heavy Fleet",
    trackingNumber: `TRK-ET-${Math.floor(100000 + Math.random() * 900000)}`,
    expectedDelivery: "2026-10-14",
    itemsSummary: "300 Q Teff & Wheat",
    vehicleType: "Volvo FH16 35-Ton Flatbed (Plate: ET-3-99120)",
    driverName: "Kassahun Tadesse",
    driverPhone: "+251 91 144 7799",
    shippingCost: "28000",
    handlingCost: "3500",
    insuranceCost: "1500",
    notes: "Priority shipment under CBE Escrow agreement.",
  });

  const [copiedTracking, setCopiedTracking] = useState(false);

  const pageSize = 7;

  // Close 3-dots menu on document click
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Filter Logic
  const filtered = shipments.filter((s) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      s.shipmentNumber.toLowerCase().includes(query) ||
      s.orderNumber.toLowerCase().includes(query) ||
      s.buyerCompany.toLowerCase().includes(query) ||
      s.carrier.toLowerCase().includes(query) ||
      s.trackingNumber.toLowerCase().includes(query) ||
      s.destination.toLowerCase().includes(query) ||
      (s.originWarehouse && s.originWarehouse.toLowerCase().includes(query));

    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    const matchesWarehouse =
      warehouseFilter === "all" ||
      s.origin.toLowerCase().includes(warehouseFilter.toLowerCase()) ||
      (s.originWarehouse && s.originWarehouse.toLowerCase().includes(warehouseFilter.toLowerCase()));
    const matchesDestination =
      destinationFilter === "all" || s.destination.toLowerCase().includes(destinationFilter.toLowerCase());
    const matchesCarrier = carrierFilter === "all" || s.carrier.toLowerCase().includes(carrierFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesWarehouse && matchesDestination && matchesCarrier;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Selected shipment object
  const selectedShipment = shipments.find((s) => s.id === selectedShipmentId) || null;

  // KPI Calculations
  const totalCount = shipments.length;
  const pendingCount = shipments.filter((s) => s.status === "pending").length;
  const preparingCount = shipments.filter((s) => s.status === "preparing").length;
  const inTransitCount = shipments.filter(
    (s) => s.status === "in_transit" || s.status === "dispatched" || s.status === "picked_up"
  ).length;
  const deliveredCount = shipments.filter((s) => s.status === "delivered").length;
  const delayedCount = shipments.filter((s) => s.status === "delayed" || s.isDelayed).length;

  const handleCopyTracking = (tracking: string) => {
    navigator.clipboard.writeText(tracking);
    setCopiedTracking(true);
    toast.success("Tracking number copied to clipboard");
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setWarehouseFilter("all");
    setDestinationFilter("all");
    setCarrierFilter("all");
    setDateFilter("all");
    setCurrentPage(1);
    toast.info("Filters reset to default");
  };

  const handleCreateShipmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `shp-${Date.now()}`;
    const newShipmentNumber = `SHP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newShipmentObj: Shipment = {
      id: newId,
      shipmentNumber: newShipmentNumber,
      orderNumber: createForm.orderNumber,
      purchaseOrderNumber: createForm.purchaseOrderNumber,
      buyerCompany: createForm.buyerCompany,
      carrier: createForm.carrier,
      trackingNumber: createForm.trackingNumber,
      origin: createForm.warehouse,
      originWarehouse: createForm.warehouse,
      destination: createForm.destination,
      destinationLocation: createForm.destinationLocation,
      departureDate: new Date().toISOString().split("T")[0],
      dispatchDate: new Date().toISOString().split("T")[0],
      estimatedDelivery: createForm.expectedDelivery,
      status: "preparing",
      vehicleType: createForm.vehicleType,
      driverName: createForm.driverName,
      driverPhone: createForm.driverPhone,
      shippingMethod: createForm.shippingMethod,
      itemsSummary: createForm.itemsSummary,
      items: [
        {
          productName: "Agricultural Commodity Consignment",
          sku: "COMM-01",
          quantity: 300,
          unit: "Quintal",
          unitPrice: 7500,
          totalPrice: 2250000,
        },
      ],
      senderContact: {
        warehouseName: createForm.warehouse,
        location: "Kality Industrial Zone, Addis Ababa",
        contactPerson: "Eleni Hailu (Hub Ops)",
        phone: "+251 11 434 2201",
      },
      receiverContact: {
        companyName: createForm.buyerCompany,
        address: createForm.destinationLocation,
        contactPerson: "Receiving Officer",
        phone: "+251 91 144 0000",
      },
      shippingCostETB: Number(createForm.shippingCost) || 28000,
      handlingCostETB: Number(createForm.handlingCost) || 3500,
      insuranceCostETB: Number(createForm.insuranceCost) || 1500,
      totalCostETB:
        (Number(createForm.shippingCost) || 28000) +
        (Number(createForm.handlingCost) || 3500) +
        (Number(createForm.insuranceCost) || 1500),
      notes: createForm.notes,
      createdDate: new Date().toISOString().split("T")[0],
      trackingEvents: [
        {
          timestamp: "Just Now",
          status: "Shipment Created",
          location: createForm.warehouse,
          description: "Shipment manifest generated. Packaging and stage inspection queued.",
        },
      ],
      milestones: [
        {
          stage: "pending",
          label: "Order Confirmed & Route Scheduled",
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          completed: true,
        },
        { stage: "preparing", label: "Shipment Prepared & Staged", completed: true },
        { stage: "ready_for_dispatch", label: "Trailer Staged at Gate", completed: false },
        { stage: "in_transit", label: "En Route in Corridor", completed: false },
        { stage: "out_for_delivery", label: "Destination City Clearance", completed: false },
        { stage: "delivered", label: "Signed Proof of Delivery (POD)", completed: false },
      ],
    };

    createShipment(newShipmentObj);
    setIsCreateModalOpen(false);
  };

  const openStatusModal = (shipment: Shipment) => {
    setModalShipmentTarget(shipment);
    setStatusToUpdate(shipment.status);
    setStatusNote("");
    setIsUpdateStatusModalOpen(true);
  };

  const handleUpdateStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalShipmentTarget) return;
    updateShipmentStatus(modalShipmentTarget.id, statusToUpdate, statusNote || undefined);
    setIsUpdateStatusModalOpen(false);
    setModalShipmentTarget(null);
  };

  const openDelayModal = (shipment: Shipment) => {
    setModalShipmentTarget(shipment);
    setNewDeliveryDate(shipment.revisedDeliveryDate || shipment.estimatedDelivery);
    setDelayReasonInput(shipment.delayReason || "Vehicle problem / mechanical repair checkpoint hold");
    setIsDelayModalOpen(true);
  };

  const handleDelaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalShipmentTarget) return;
    updateShipmentDeliveryDate(modalShipmentTarget.id, newDeliveryDate, delayReasonInput);
    setIsDelayModalOpen(false);
    setModalShipmentTarget(null);
  };

  const openPodModal = (shipment: Shipment) => {
    setModalShipmentTarget(shipment);
    setIsPodModalOpen(true);
  };

  // ─────────────────────────────────────────────────────────────
  // VIEW: COMPACT SHIPMENT DETAILS (FULL WORKSPACE VIEW)
  // ─────────────────────────────────────────────────────────────
  if (selectedShipment) {
    const s = selectedShipment;
    const isDelayed = s.status === "delayed" || s.isDelayed;
    const isDelivered = s.status === "delivered";

    return (
      <div className="space-y-4">
        {/* Compact Detail Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedShipmentId(null)}
              className="inline-flex items-center gap-1.5 h-[34px] px-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] text-[13px] font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 text-slate-500" />
              <span>Back to Shipments</span>
            </button>
            <div className="h-4 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2">
              <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">
                Shipment #{s.shipmentNumber}
              </h2>
              <StatusBadge status={s.status} size="sm" />
              {isDelayed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  <AlertTriangle className="h-3 w-3" />
                  Delayed
                </span>
              )}
            </div>
          </div>

          {/* Header Action Buttons (height 34-36px, compact typography 12-13px) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleCopyTracking(s.trackingNumber)}
              className="inline-flex items-center gap-1.5 h-[34px] px-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] text-[12px] font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-white/[0.08] cursor-pointer"
            >
              {copiedTracking ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedTracking ? "Copied" : "Copy Tracking"}</span>
            </button>

            <button
              onClick={() => openStatusModal(s)}
              className="inline-flex items-center gap-1.5 h-[34px] px-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] text-[12px] font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-white/[0.08] cursor-pointer"
            >
              <Clock className="h-3.5 w-3.5 text-blue-500" />
              <span>Update Status</span>
            </button>

            {isDelayed && (
              <button
                onClick={() => openDelayModal(s)}
                className="inline-flex items-center gap-1.5 h-[34px] px-3 rounded-lg border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-[12px] font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-100 cursor-pointer"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Revise Date</span>
              </button>
            )}

            {isDelivered && (
              <button
                onClick={() => openPodModal(s)}
                className="inline-flex items-center gap-1.5 h-[34px] px-3 rounded-lg border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-[12px] font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>View POD</span>
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 h-[34px] px-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] text-[12px] font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-white/[0.08] cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Waybill</span>
            </button>
          </div>
        </div>

        {/* Delay Alert Banner (Section 17) */}
        {isDelayed && (
          <div className="rounded-lg border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-amber-900 dark:text-amber-300">
                    Shipment Delayed
                  </span>
                  <span className="text-[12px] text-amber-700 dark:text-amber-400">
                    · Expected Delivery:{" "}
                    <strong className="font-mono">{s.revisedDeliveryDate || s.estimatedDelivery}</strong>
                  </span>
                </div>
                <p className="text-[12px] text-amber-800 dark:text-amber-300 mt-0.5">
                  Reason: {s.delayReason || "Mechanical breakdown / corridor delay"}
                </p>
                {s.delayNotes && (
                  <p className="text-[11px] text-amber-700/90 dark:text-amber-400/80 mt-0.5">
                    Note: {s.delayNotes}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => openDelayModal(s)}
                className="h-[30px] px-2.5 rounded border border-amber-300 dark:border-amber-500/40 bg-white dark:bg-amber-900/40 text-[12px] font-medium text-amber-900 dark:text-amber-200 hover:bg-amber-50 cursor-pointer"
              >
                Update Delivery Date
              </button>
              <button
                onClick={() => openStatusModal(s)}
                className="h-[30px] px-2.5 rounded border border-amber-300 dark:border-amber-500/40 bg-white dark:bg-amber-900/40 text-[12px] font-medium text-amber-900 dark:text-amber-200 hover:bg-amber-50 cursor-pointer"
              >
                Add Note
              </button>
            </div>
          </div>
        )}

        {/* Compact Shipment Workflow Stepper (Section 19) */}
        <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d121f] p-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5 mb-3">
            <span className="text-[13px] font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Logistics Workflow Pipeline
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
              Tracking: {s.trackingNumber}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { stage: "order", label: "1. Order Confirmed", done: true },
              {
                stage: "preparing",
                label: "2. Prepare & Pack",
                done: ["preparing", "ready_for_dispatch", "dispatched", "picked_up", "in_transit", "out_for_delivery", "delivered"].includes(
                  s.status
                ),
              },
              {
                stage: "ready_for_dispatch",
                label: "3. Dispatched",
                done: ["ready_for_dispatch", "dispatched", "picked_up", "in_transit", "out_for_delivery", "delivered"].includes(
                  s.status
                ),
              },
              {
                stage: "in_transit",
                label: "4. In Transit",
                done: ["in_transit", "out_for_delivery", "delivered"].includes(s.status),
              },
              {
                stage: "out_for_delivery",
                label: "5. Out for Delivery",
                done: ["out_for_delivery", "delivered"].includes(s.status),
              },
              {
                stage: "delivered",
                label: "6. Delivered (POD)",
                done: s.status === "delivered",
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 p-2 rounded-md border text-[12px] font-medium transition-colors ${
                  step.done
                    ? "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                    : "border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-slate-400 dark:text-zinc-500"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${
                    step.done
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 dark:bg-white/10 text-slate-400"
                  }`}
                >
                  {step.done ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : <span className="text-[9px]">{idx + 1}</span>}
                </div>
                <span className="truncate">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main 2-Column Information Grid (Section 10, 11, 12, 14, 15, 16, 18) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Left Column (7 cols): Shipment, Logistics, Delivery, Products, Financials */}
          <div className="lg:col-span-7 space-y-3.5">
            {/* Shipment & Logistics Information (Two-column layout, Section 10) */}
            <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d121f] p-3.5 shadow-xs">
              <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white pb-2.5 border-b border-slate-100 dark:border-white/5 mb-3 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Shipment & Logistics Overview
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Column 1: Shipment Details */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                    Shipment
                  </span>
                  <div className="space-y-1.5 text-[13px]">
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                      <span className="text-[12px] text-slate-500 dark:text-zinc-400">Shipment ID</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{s.shipmentNumber}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                      <span className="text-[12px] text-slate-500 dark:text-zinc-400">Order ID</span>
                      <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{s.orderNumber}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                      <span className="text-[12px] text-slate-500 dark:text-zinc-400">Purchase Order</span>
                      <span className="font-mono text-slate-700 dark:text-zinc-300">{s.purchaseOrderNumber || "PO-ETH-2026"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                      <span className="text-[12px] text-slate-500 dark:text-zinc-400">Created Date</span>
                      <span className="font-mono text-slate-700 dark:text-zinc-300">{s.createdDate || s.departureDate}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                      <span className="text-[12px] text-slate-500 dark:text-zinc-400">Dispatch Date</span>
                      <span className="font-mono text-slate-700 dark:text-zinc-300">{s.dispatchDate || s.departureDate}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[12px] text-slate-500 dark:text-zinc-400">Expected Delivery</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {s.revisedDeliveryDate || s.estimatedDelivery}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Column 2: Logistics Details */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                    Logistics
                  </span>
                  <div className="space-y-1.5 text-[13px]">
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                      <span className="text-[12px] text-slate-500 dark:text-zinc-400">Origin Warehouse</span>
                      <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[170px]" title={s.originWarehouse || s.origin}>
                        {s.originWarehouse || s.origin.split("(")[0]}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                      <span className="text-[12px] text-slate-500 dark:text-zinc-400">Destination</span>
                      <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[170px]" title={s.destination}>
                        {s.destination}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                      <span className="text-[12px] text-slate-500 dark:text-zinc-400">Carrier</span>
                      <span className="font-medium text-slate-800 dark:text-zinc-200 truncate max-w-[170px]">{s.carrier}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                      <span className="text-[12px] text-slate-500 dark:text-zinc-400">Tracking Number</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{s.trackingNumber}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[12px] text-slate-500 dark:text-zinc-400">Shipping Method</span>
                      <span className="text-slate-700 dark:text-zinc-300 truncate max-w-[170px]">
                        {s.shippingMethod || "Heavy Road Freight"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Information (Section 12: From & To) */}
            <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d121f] p-3.5 shadow-xs">
              <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white pb-2.5 border-b border-slate-100 dark:border-white/5 mb-3 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Delivery Routing & Contacts
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* From Box */}
                <div className="rounded-md border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] p-3 text-[12px]">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-zinc-200 mb-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>FROM: Origin Facility</span>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white text-[13px]">
                    {s.senderContact?.warehouseName || s.originWarehouse || "Addis Main Warehouse"}
                  </p>
                  <p className="text-slate-500 dark:text-zinc-400 mt-0.5">
                    {s.senderContact?.location || s.origin}
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-200/80 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-600 dark:text-zinc-400">
                    <span>Contact: {s.senderContact?.contactPerson || "Operations Lead"}</span>
                    <span className="font-mono">{s.senderContact?.phone || "+251 11 434 2201"}</span>
                  </div>
                </div>

                {/* To Box */}
                <div className="rounded-md border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] p-3 text-[12px]">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-zinc-200 mb-1">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    <span>TO: Buyer Delivery Site</span>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white text-[13px]">
                    {s.receiverContact?.companyName || s.buyerCompany}
                  </p>
                  <p className="text-slate-500 dark:text-zinc-400 mt-0.5">
                    {s.receiverContact?.address || s.destinationLocation || s.destination}
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-200/80 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-600 dark:text-zinc-400">
                    <span>Contact: {s.receiverContact?.contactPerson || "Receiving Officer"}</span>
                    <span className="font-mono">{s.receiverContact?.phone || "+251 91 882 1199"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Consignment Table (Section 11) */}
            <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d121f] overflow-hidden shadow-xs">
              <div className="p-3 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  Shipment Cargo Contents
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                  Total: {s.itemsSummary || `${s.items?.length || 1} commodities`}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/75 dark:bg-white/[0.03] text-slate-500 dark:text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3 text-right">Quantity</th>
                      <th className="py-2.5 px-3">Unit</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Total (ETB)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {(s.items && s.items.length > 0 ? s.items : [
                      {
                        productName: "Consignment Commodity",
                        sku: "COMM-001",
                        quantity: 500,
                        unit: "Quintal",
                        unitPrice: 42000,
                        totalPrice: 21000000,
                      },
                    ]).map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                          {item.productName}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500 dark:text-zinc-400 text-[11px]">
                          {item.sku}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 dark:text-zinc-200">
                          {item.quantity.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">
                          {item.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-zinc-400">
                          {item.unitPrice ? `${item.unitPrice.toLocaleString()} ETB` : "—"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {item.totalPrice ? `${item.totalPrice.toLocaleString()} ETB` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Shipping Cost Breakdown (Section 18) */}
            <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d121f] p-3.5 shadow-xs">
              <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white pb-2.5 border-b border-slate-100 dark:border-white/5 mb-2.5 flex items-center justify-between">
                <span>Shipping & Handling Cost</span>
                <span className="text-[11px] font-normal text-slate-500">Commercial Bank of Ethiopia Escrow Verified</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-2.5 rounded-md border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02]">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Freight Transit</span>
                  <span className="text-[14px] font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">
                    {(s.shippingCostETB || 35000).toLocaleString()} ETB
                  </span>
                </div>
                <div className="p-2.5 rounded-md border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02]">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Dock Handling</span>
                  <span className="text-[14px] font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">
                    {(s.handlingCostETB || 5000).toLocaleString()} ETB
                  </span>
                </div>
                <div className="p-2.5 rounded-md border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02]">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Transit Insurance</span>
                  <span className="text-[14px] font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">
                    {(s.insuranceCostETB || 2000).toLocaleString()} ETB
                  </span>
                </div>
                <div className="p-2.5 rounded-md border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-500/10">
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold block">Total Logistics</span>
                  <span className="text-[15px] font-mono font-bold text-emerald-700 dark:text-emerald-300 mt-0.5 block">
                    {(s.totalCostETB || 42000).toLocaleString()} ETB
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Carrier Info, Live Tracking, Milestones, POD */}
          <div className="lg:col-span-5 space-y-3.5">
            {/* Carrier Information (Section 15) */}
            <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d121f] p-3.5 shadow-xs">
              <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white pb-2.5 border-b border-slate-100 dark:border-white/5 mb-2.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  Carrier & Fleet Information
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                  Assigned
                </span>
              </h3>

              <div className="space-y-2 text-[12px]">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500 dark:text-zinc-400">Carrier Fleet</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{s.carrier}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500 dark:text-zinc-400">Vehicle / Trailer</span>
                  <span className="font-mono text-slate-800 dark:text-zinc-200 text-right truncate max-w-[200px]" title={s.vehicleType}>
                    {s.vehicleType}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500 dark:text-zinc-400">Designated Driver</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{s.driverName || "Abebe Kebede"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 dark:text-zinc-400">Driver Phone</span>
                  <a
                    href={`tel:${s.driverPhone || "+251 91 190 2233"}`}
                    className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Phone className="h-3 w-3" />
                    <span>{s.driverPhone || "+251 91 190 2233"}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Tracking Events Section (Section 14) */}
            <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d121f] p-3.5 shadow-xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-white/5 mb-3">
                <div className="flex items-center gap-1.5">
                  <Navigation className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white">Corridor Telemetry</h3>
                </div>
                <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                  {s.trackingNumber}
                </span>
              </div>

              {s.trackingEvents && s.trackingEvents.length > 0 ? (
                <div className="space-y-3 relative pl-4 before:absolute before:left-1.5 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-slate-200 dark:before:bg-white/10">
                  {s.trackingEvents.map((ev, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-4 top-1 h-2.5 w-2.5 rounded-full bg-emerald-600 ring-2 ring-white dark:ring-[#0d121f]" />
                      <div className="text-[12px]">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {ev.status} — {ev.location}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{ev.timestamp}</span>
                        </div>
                        {ev.description && (
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                            {ev.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-slate-400 italic">No real-time tracking events recorded yet.</p>
              )}
            </div>

            {/* Shipment Milestones Timeline (Section 13) */}
            <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d121f] p-3.5 shadow-xs">
              <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white pb-2.5 border-b border-slate-100 dark:border-white/5 mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  Transit Milestones
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                  {s.milestones.filter((m) => m.completed).length} / {s.milestones.length} Completed
                </span>
              </h3>

              <div className="space-y-3.5 relative pl-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-white/10">
                {s.milestones.map((m, idx) => (
                  <div key={idx} className="relative text-[12px]">
                    <div
                      className={`absolute -left-5 top-0.5 h-4 w-4 rounded-full flex items-center justify-center ${
                        m.completed
                          ? "bg-emerald-600 text-white"
                          : "bg-white dark:bg-[#0d121f] border-2 border-slate-300 dark:border-zinc-600 text-transparent"
                      }`}
                    >
                      {m.completed && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-semibold ${
                            m.completed ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-zinc-500"
                          }`}
                        >
                          {m.label}
                        </span>
                        {m.timestamp && (
                          <span className="font-mono text-[10px] text-slate-400">{m.timestamp}</span>
                        )}
                      </div>
                      {m.location && (
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          <span>{m.location}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Confirmation / Proof of Delivery Box (Section 16) */}
            {isDelivered && (
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/10 p-3.5 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60 dark:border-emerald-500/20 mb-2.5">
                  <span className="text-[13px] font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Delivery Confirmation (POD)
                  </span>
                  <button
                    onClick={() => openPodModal(s)}
                    className="h-[28px] px-2.5 rounded bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700 cursor-pointer"
                  >
                    View POD
                  </button>
                </div>

                <div className="space-y-1.5 text-[12px] text-emerald-900 dark:text-emerald-200">
                  <div className="flex justify-between py-0.5">
                    <span className="text-emerald-700 dark:text-emerald-400">Delivered Date:</span>
                    <span className="font-mono font-bold">{s.deliveredDate || s.actualDeliveryDate || "2026-09-23 16:10"}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-emerald-700 dark:text-emerald-400">Received By:</span>
                    <span className="font-semibold">{s.receivedBy || "Authorized Store Manager"}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-emerald-700 dark:text-emerald-400">Receiver Phone:</span>
                    <span className="font-mono">{s.receiverPhone || "+251 91 662 0019"}</span>
                  </div>
                  {s.proofOfDeliveryNotes && (
                    <div className="mt-2 pt-2 border-t border-emerald-200/50 dark:border-emerald-500/20 text-[11px]">
                      <span className="font-semibold">Notes:</span> {s.proofOfDeliveryNotes}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // VIEW: MAIN COMPACT SHIPMENT MANAGEMENT DASHBOARD
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* 4. Page Header (Title: 22–24px, Subtitle: 12–13px, Actions: 34–36px height) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-3">
        <div>
          <h1 className="text-[22px] sm:text-[24px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
            Shipment Management
          </h1>
          <p className="text-[12px] sm:text-[13px] text-slate-500 dark:text-zinc-400 mt-0.5">
            Track deliveries, manage dispatches, and monitor shipment status.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFiltersPanel((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 h-[34px] sm:h-[36px] px-3 rounded-lg border text-[12px] sm:text-[13px] font-medium transition-colors cursor-pointer ${
              showFiltersPanel
                ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-white/[0.08]"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
          </button>

          <button
            onClick={() => toast.success("Shipments manifest exported to CSV.")}
            className="inline-flex items-center gap-1.5 h-[34px] sm:h-[36px] px-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] text-[12px] sm:text-[13px] font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 h-[34px] sm:h-[36px] px-3.5 rounded-lg bg-[#2E7D32] hover:bg-[#256629] text-white text-[12px] sm:text-[13px] font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Create Shipment</span>
          </button>
        </div>
      </div>

      {/* 5. Six Compact KPI Cards (Height 80–90px, Padding 12px, 20–22px number) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* KPI 1: Total Shipments */}
        <div className="h-[84px] p-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d121f] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 truncate">Total Shipments</span>
            <Truck className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[21px] font-bold text-slate-900 dark:text-white leading-none">
              {totalCount}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">+12 this mo</span>
          </div>
        </div>

        {/* KPI 2: Pending */}
        <div className="h-[84px] p-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d121f] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 truncate">Pending</span>
            <Clock className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[21px] font-bold text-amber-600 dark:text-amber-400 leading-none">
              {pendingCount}
            </span>
            <span className="text-[10px] text-slate-400">Awaiting routing</span>
          </div>
        </div>

        {/* KPI 3: Preparing */}
        <div className="h-[84px] p-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d121f] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 truncate">Preparing</span>
            <Package className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[21px] font-bold text-blue-600 dark:text-blue-400 leading-none">
              {preparingCount}
            </span>
            <span className="text-[10px] text-slate-400">In packaging</span>
          </div>
        </div>

        {/* KPI 4: In Transit */}
        <div className="h-[84px] p-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d121f] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 truncate">In Transit</span>
            <Navigation className="h-3.5 w-3.5 text-indigo-500" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[21px] font-bold text-indigo-600 dark:text-indigo-400 leading-none">
              {inTransitCount}
            </span>
            <span className="text-[10px] text-slate-400">On corridors</span>
          </div>
        </div>

        {/* KPI 5: Delivered */}
        <div className="h-[84px] p-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d121f] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 truncate">Delivered</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[21px] font-bold text-emerald-600 dark:text-emerald-400 leading-none">
              {deliveredCount}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">POD Verified</span>
          </div>
        </div>

        {/* KPI 6: Delayed */}
        <div className="h-[84px] p-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d121f] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 truncate">Delayed</span>
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[21px] font-bold text-rose-600 dark:text-rose-400 leading-none">
              {delayedCount}
            </span>
            <span className="text-[10px] text-rose-500 font-semibold">Action needed</span>
          </div>
        </div>
      </div>

      {/* 7. Search and Filters Toolbar (Compact single bar) */}
      <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d121f] p-2.5 shadow-xs space-y-2">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search shipment, order, buyer, tracking..."
              className="w-full h-[36px] rounded-md border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03] pl-8 pr-7 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-[#2E7D32] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Quick Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-[36px] rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 text-[12px] font-medium text-slate-700 dark:text-zinc-200 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="ready_for_dispatch">Ready for Dispatch</option>
              <option value="in_transit">In Transit</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="delayed">Delayed</option>
            </select>

            {/* Warehouse Filter */}
            <select
              value={warehouseFilter}
              onChange={(e) => {
                setWarehouseFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-[36px] rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 text-[12px] font-medium text-slate-700 dark:text-zinc-200 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Warehouses</option>
              <option value="Addis">Addis Main Warehouse</option>
              <option value="Modjo">Modjo Dry Port</option>
              <option value="Hawassa">Hawassa Agro Depot</option>
              <option value="Dire Dawa">Dire Dawa Free Trade</option>
            </select>

            {/* Clear Button */}
            {(searchQuery || statusFilter !== "all" || warehouseFilter !== "all" || destinationFilter !== "all" || carrierFilter !== "all") && (
              <button
                onClick={handleClearFilters}
                className="h-[36px] px-2.5 rounded-md border border-slate-200 dark:border-white/10 text-[12px] font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Extended Filter Panel (Toggled via "Filters" button) */}
        {showFiltersPanel && (
          <div className="pt-2.5 border-t border-slate-100 dark:border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">Destination City</label>
              <select
                value={destinationFilter}
                onChange={(e) => setDestinationFilter(e.target.value)}
                className="w-full h-[34px] rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2 text-[12px]"
              >
                <option value="all">All Destinations</option>
                <option value="Addis Ababa">Addis Ababa</option>
                <option value="Gondar">Gondar</option>
                <option value="Hawassa">Hawassa</option>
                <option value="Mekelle">Mekelle</option>
                <option value="Bahir Dar">Bahir Dar</option>
                <option value="Adama">Adama</option>
                <option value="Bole">Bole Airport</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">Carrier Fleet</label>
              <select
                value={carrierFilter}
                onChange={(e) => setCarrierFilter(e.target.value)}
                className="w-full h-[34px] rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2 text-[12px]"
              >
                <option value="all">All Freight Carriers</option>
                <option value="Ethio Logistics">Ethio Logistics Heavy Fleet</option>
                <option value="Trans-Ethiopia">Trans-Ethiopia Freight</option>
                <option value="Rift Valley">Rift Valley Express</option>
                <option value="Ethio-National">Ethio-National Freight</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">Date Period</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full h-[34px] rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2 text-[12px]"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 6. Shipment Table (Dense, Clean, Enterprise ERP WMS Style) */}
      <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d121f] overflow-hidden shadow-xs">
        <div className="px-3 py-2.5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white">Shipments</h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-zinc-300 font-mono">
              {filtered.length} records
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {paginated.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No shipments yet"
                description="Shipments created from confirmed orders will appear here."
                actionLabel="Create Shipment"
                onAction={() => setIsCreateModalOpen(true)}
              />
            </div>
          ) : (
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/75 dark:bg-white/[0.03] text-slate-500 dark:text-zinc-400 font-semibold uppercase text-[10px] tracking-wider select-none">
                  <th className="py-2.5 px-3">Shipment</th>
                  <th className="py-2.5 px-2.5">Order</th>
                  <th className="py-2.5 px-3">Buyer</th>
                  <th className="py-2.5 px-2.5">Origin</th>
                  <th className="py-2.5 px-2.5">Destination</th>
                  <th className="py-2.5 px-2.5">Items</th>
                  <th className="py-2.5 px-3">Carrier</th>
                  <th className="py-2.5 px-2.5">Expected Delivery</th>
                  <th className="py-2.5 px-2.5">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {paginated.map((shipment) => {
                  const isMenuOpen = activeMenuId === shipment.id;

                  return (
                    <tr
                      key={shipment.id}
                      onClick={() => setSelectedShipmentId(shipment.id)}
                      className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    >
                      {/* Shipment */}
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {shipment.shipmentNumber}
                      </td>

                      {/* Order */}
                      <td className="py-2.5 px-2.5 font-mono text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                        {shipment.orderNumber}
                      </td>

                      {/* Buyer */}
                      <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white truncate max-w-[170px]" title={shipment.buyerCompany}>
                        {shipment.buyerCompany}
                      </td>

                      {/* Origin */}
                      <td className="py-2.5 px-2.5 text-slate-600 dark:text-zinc-400 truncate max-w-[120px]" title={shipment.origin}>
                        {shipment.originWarehouse ? shipment.originWarehouse.split(" ")[0] : shipment.origin.split("(")[0].trim()}
                      </td>

                      {/* Destination */}
                      <td className="py-2.5 px-2.5 text-slate-700 dark:text-zinc-300 font-medium truncate max-w-[120px]" title={shipment.destination}>
                        {shipment.destination}
                      </td>

                      {/* Items */}
                      <td className="py-2.5 px-2.5 text-slate-700 dark:text-zinc-300 font-mono text-[11px] whitespace-nowrap">
                        {shipment.itemsSummary || (shipment.items?.[0] ? `${shipment.items[0].quantity} ${shipment.items[0].unit}` : "500 Q")}
                      </td>

                      {/* Carrier */}
                      <td className="py-2.5 px-3">
                        <p className="font-medium text-slate-800 dark:text-zinc-200 truncate max-w-[140px] leading-tight" title={shipment.carrier}>
                          {shipment.carrier.split(" ")[0]} {shipment.carrier.split(" ")[1] || ""}
                        </p>
                        <p className="font-mono text-slate-400 dark:text-zinc-500 text-[10px] truncate max-w-[120px]">
                          {shipment.trackingNumber}
                        </p>
                      </td>

                      {/* Expected Delivery */}
                      <td className="py-2.5 px-2.5 font-mono text-slate-700 dark:text-zinc-300 whitespace-nowrap">
                        {shipment.revisedDeliveryDate || shipment.estimatedDelivery}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-2.5 whitespace-nowrap">
                        <StatusBadge status={shipment.status} size="sm" />
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 relative">
                          <button
                            onClick={() => setSelectedShipmentId(shipment.id)}
                            className="h-[28px] px-2.5 rounded border border-slate-200 dark:border-white/10 text-[12px] font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                          >
                            View
                          </button>

                          {/* 3-dots dropdown menu */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(isMenuOpen ? null : shipment.id);
                            }}
                            className="h-[28px] w-[28px] rounded flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute right-0 top-8 z-30 w-44 rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c121e] shadow-lg py-1 text-left text-[12px]">
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setSelectedShipmentId(shipment.id);
                                }}
                                className="w-full px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-white/[0.05] flex items-center gap-2 text-slate-700 dark:text-zinc-200"
                              >
                                <Eye className="h-3.5 w-3.5 text-slate-400" />
                                <span>View Details</span>
                              </button>

                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  openStatusModal(shipment);
                                }}
                                className="w-full px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-white/[0.05] flex items-center gap-2 text-slate-700 dark:text-zinc-200"
                              >
                                <Clock className="h-3.5 w-3.5 text-blue-500" />
                                <span>Update Status</span>
                              </button>

                              {shipment.status === "delayed" && (
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    openDelayModal(shipment);
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-white/[0.05] flex items-center gap-2 text-amber-600 dark:text-amber-400"
                                >
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>Revise Date</span>
                                </button>
                              )}

                              {shipment.status === "delivered" && (
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    openPodModal(shipment);
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-white/[0.05] flex items-center gap-2 text-emerald-600 dark:text-emerald-400"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  <span>View POD</span>
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  handleCopyTracking(shipment.trackingNumber);
                                }}
                                className="w-full px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-white/[0.05] flex items-center gap-2 text-slate-700 dark:text-zinc-200"
                              >
                                <Copy className="h-3.5 w-3.5 text-slate-400" />
                                <span>Copy Tracking #</span>
                              </button>

                              <div className="my-1 border-t border-slate-100 dark:border-white/5" />

                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  deleteShipment(shipment.id);
                                }}
                                className="w-full px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2 text-rose-600 dark:text-rose-400"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete Record</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Compact Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 20. CREATE SHIPMENT MODAL (Enterprise 2-Column Form)           */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c121e] shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">Create Freight Shipment</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateShipmentSubmit} className="p-4 space-y-3.5 text-[12px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Order */}
                <div>
                  <label className="block text-[12px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Confirmed Order
                  </label>
                  <input
                    type="text"
                    value={createForm.orderNumber}
                    onChange={(e) => setCreateForm({ ...createForm, orderNumber: e.target.value })}
                    className="w-full h-[36px] rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 text-[13px] text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                    required
                  />
                </div>

                {/* Buyer */}
                <div>
                  <label className="block text-[12px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Buyer Company
                  </label>
                  <input
                    type="text"
                    value={createForm.buyerCompany}
                    onChange={(e) => setCreateForm({ ...createForm, buyerCompany: e.target.value })}
                    className="w-full h-[36px] rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 text-[13px] text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                    required
                  />
                </div>

                {/* Warehouse */}
                <div>
                  <label className="block text-[12px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Origin Warehouse
                  </label>
                  <select
                    value={createForm.warehouse}
                    onChange={(e) => setCreateForm({ ...createForm, warehouse: e.target.value })}
                    className="w-full h-[36px] rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 text-[13px] text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                  >
                    <option value="Addis Main Warehouse">Addis Main Warehouse (WH-AA)</option>
                    <option value="Modjo Dry Port Terminal">Modjo Dry Port Terminal (WH-MJ)</option>
                    <option value="Hawassa Agro-Processing Depot">Hawassa Agro Depot (WH-HW)</option>
                    <option value="Dire Dawa Free Trade Depot">Dire Dawa Free Trade (WH-DD)</option>
                  </select>
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-[12px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Destination City / Site
                  </label>
                  <input
                    type="text"
                    value={createForm.destination}
                    onChange={(e) => setCreateForm({ ...createForm, destination: e.target.value })}
                    className="w-full h-[36px] rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 text-[13px] text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                    required
                  />
                </div>

                {/* Carrier */}
                <div>
                  <label className="block text-[12px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Carrier Fleet
                  </label>
                  <input
                    type="text"
                    value={createForm.carrier}
                    onChange={(e) => setCreateForm({ ...createForm, carrier: e.target.value })}
                    className="w-full h-[36px] rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 text-[13px] text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                    required
                  />
                </div>

                {/* Shipping Method */}
                <div>
                  <label className="block text-[12px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Shipping Method
                  </label>
                  <select
                    value={createForm.shippingMethod}
                    onChange={(e) => setCreateForm({ ...createForm, shippingMethod: e.target.value })}
                    className="w-full h-[36px] rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 text-[13px] text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                  >
                    <option value="Road Freight (Heavy Curtain-Sider)">Road Freight (Heavy Curtain-Sider)</option>
                    <option value="Heavy Flatbed Multi-Axle">Heavy Flatbed Multi-Axle</option>
                    <option value="Refrigerated Direct Express">Refrigerated Direct Express</option>
                    <option value="Intermodal Dry Port Rail & Truck">Intermodal Dry Port Rail & Truck</option>
                  </select>
                </div>

                {/* Tracking Number */}
                <div>
                  <label className="block text-[12px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={createForm.trackingNumber}
                    onChange={(e) => setCreateForm({ ...createForm, trackingNumber: e.target.value })}
                    className="w-full h-[36px] rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 font-mono text-[13px] text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                    required
                  />
                </div>

                {/* Expected Delivery */}
                <div>
                  <label className="block text-[12px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    value={createForm.expectedDelivery}
                    onChange={(e) => setCreateForm({ ...createForm, expectedDelivery: e.target.value })}
                    className="w-full h-[36px] rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 text-[13px] text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[12px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Dispatch & Transit Notes
                </label>
                <textarea
                  rows={2}
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  className="w-full rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] p-2 text-[12px] text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="h-[34px] px-3.5 rounded border border-slate-200 dark:border-white/10 text-[12px] font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-[34px] px-4 rounded bg-[#2E7D32] hover:bg-[#256629] text-white text-[12px] font-semibold cursor-pointer"
                >
                  Create Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* UPDATE STATUS MODAL                                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isUpdateStatusModalOpen && modalShipmentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c121e] shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10">
              <h3 className="text-[14px] font-bold text-slate-900 dark:text-white">
                Update Status #{modalShipmentTarget.shipmentNumber}
              </h3>
              <button
                onClick={() => setIsUpdateStatusModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="p-4 space-y-3 text-[12px]">
              <div>
                <label className="block text-[12px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  New Status
                </label>
                <select
                  value={statusToUpdate}
                  onChange={(e) => setStatusToUpdate(e.target.value as ShipmentStatus)}
                  className="w-full h-[36px] rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 text-[13px] text-slate-900 dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready_for_dispatch">Ready for Dispatch</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="in_transit">In Transit</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered (Signoff & Release)</option>
                  <option value="delayed">Delayed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Checkpoint Location / Status Note
                </label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Cleared Awash weighbridge; cargo seal intact."
                  className="w-full h-[36px] rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 text-[12px] text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUpdateStatusModalOpen(false)}
                  className="h-[34px] px-3.5 rounded border border-slate-200 text-[12px] text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-[34px] px-4 rounded bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold cursor-pointer"
                >
                  Confirm Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* DELAY REVISION MODAL                                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isDelayModalOpen && modalShipmentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c121e] shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10">
              <h3 className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Manage Delay #{modalShipmentTarget.shipmentNumber}
              </h3>
              <button
                onClick={() => setIsDelayModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleDelaySubmit} className="p-4 space-y-3 text-[12px]">
              <div>
                <label className="block text-[12px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Revised Expected Delivery Date
                </label>
                <input
                  type="date"
                  value={newDeliveryDate}
                  onChange={(e) => setNewDeliveryDate(e.target.value)}
                  className="w-full h-[36px] rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 text-[13px] text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Delay Reason
                </label>
                <input
                  type="text"
                  value={delayReasonInput}
                  onChange={(e) => setDelayReasonInput(e.target.value)}
                  placeholder="e.g. Vehicle mechanical repair / Mountain pass weather hold"
                  className="w-full h-[36px] rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 text-[12px] text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDelayModalOpen(false)}
                  className="h-[34px] px-3.5 rounded border border-slate-200 text-[12px] text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-[34px] px-4 rounded bg-amber-600 hover:bg-amber-700 text-white text-[12px] font-semibold cursor-pointer"
                >
                  Save Revised Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* PROOF OF DELIVERY (POD) MODAL                                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isPodModalOpen && modalShipmentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c121e] shadow-xl overflow-hidden text-[12px]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <h3 className="text-[14px] font-bold text-slate-900 dark:text-white">
                  Proof of Delivery #{modalShipmentTarget.shipmentNumber}
                </h3>
              </div>
              <button
                onClick={() => setIsPodModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="rounded border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/10 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-emerald-900 dark:text-emerald-300">Signed & Verified Delivery</span>
                  <span className="text-[10px] font-mono font-bold bg-emerald-600 text-white px-2 py-0.5 rounded">
                    ESCROW RELEASED
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-400">
                  Commercial Bank of Ethiopia verified receipt. Funds deposited into available supplier balance.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500">Delivered Timestamp:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {modalShipmentTarget.deliveredDate || modalShipmentTarget.actualDeliveryDate || "2026-09-23 16:10"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500">Authorized Receiver:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {modalShipmentTarget.receivedBy || "Solomon Getnet (Store Lead)"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500">Receiver Phone:</span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {modalShipmentTarget.receiverPhone || "+251 91 662 0019"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500">Receiving Site:</span>
                  <span className="text-slate-900 dark:text-white text-right truncate max-w-[200px]">
                    {modalShipmentTarget.destinationLocation || modalShipmentTarget.destination}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Receiving Condition Notes:</span>
                  <p className="p-2 rounded bg-slate-50 dark:bg-white/[0.04] text-[11px] text-slate-700 dark:text-zinc-300">
                    {modalShipmentTarget.proofOfDeliveryNotes || "Goods inspected upon offloading. Packaging verified intact. Zero damaged items recorded."}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex justify-end gap-2">
                <button
                  onClick={() => {
                    toast.success("Downloading signed Proof of Delivery PDF...");
                    setIsPodModalOpen(false);
                  }}
                  className="h-[34px] px-3.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Signed PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

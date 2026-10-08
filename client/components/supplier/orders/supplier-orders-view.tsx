"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Eye,
  FileText,
  AlertCircle,
  Download,
  Building,
  User,
  X,
  CreditCard,
  MapPin,
  Calendar,
  MoreVertical,
  Trash2,
  ArrowLeft,
  Printer,
  ShieldCheck,
  Check,
  ChevronRight,
  Phone,
  Mail,
  Package,
  BadgeCheck,
  Award,
  Layers,
  Sparkles,
  ExternalLink,
  Copy,
  Star,
  Info,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { PageHeader } from "../shared/page-header";
import { DataFilterBar } from "../shared/data-filter-bar";
import { StatusBadge } from "../shared/status-badge";
import { Pagination } from "../shared/pagination";
import { EmptyState } from "../shared/empty-state";
import { useSupplierStore } from "@/store/supplier-store";
import { useAuthStore } from "@/store/auth-store";
import { useThemeStore } from "@/store/theme-store";
import { B2BOrder, B2BOrderStatus } from "@/types/supplier";
import { toast } from "sonner";

export function SupplierOrdersView() {
  const {
    orders,
    isLoadingOrders,
    ordersError,
    fetchOrders,
    openModal,
    setActiveTab,
    deleteOrder,
    setActiveChatThreadId,
    currentStaffUser,
    staffList,
    assignDriverToOrder,
    warehouses,
  } = useSupplierStore();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const isLight = theme === "light";
  const isSystem = theme === "system";

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const isBranchManager = user?.staffRole === "branch_manager" || currentStaffUser?.role === "branch_manager";
  const userBranchId = user?.branchId || currentStaffUser?.branchId;
  const userBranchName = user?.branchName || currentStaffUser?.branchName;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Driver Assignment Modal State
  const [assigningOrder, setAssigningOrder] = useState<B2BOrder | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");

  // Close 3-dot menu on click outside
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Reset active image index when order changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedOrderId]);

  // Strict Branch Isolation: Branch managers ONLY see orders for their assigned branch!
  const scopedOrders = useMemo(() => {
    if (isBranchManager && userBranchId) {
      return orders.filter((o) => o.branchId === userBranchId);
    }
    if (branchFilter !== "all") {
      return orders.filter((o) => o.branchId === branchFilter);
    }
    return orders;
  }, [orders, isBranchManager, userBranchId, branchFilter]);

  const filtered = useMemo(() => {
    return scopedOrders.filter((o) => {
      const matchesSearch =
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.buyerCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.assignedDriverName && o.assignedDriverName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (o.assignedVehiclePlate && o.assignedVehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === "all" || o.orderStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [scopedOrders, searchQuery, statusFilter]);

  const eligibleDrivers = useMemo(() => {
    if (!assigningOrder) return [];
    const targetBranch = assigningOrder.branchId || userBranchId;
    return staffList.filter(
      (s) => s.role === "driver" && (!targetBranch || s.branchId === targetBranch)
    );
  }, [staffList, assigningOrder, userBranchId]);

  const handleConfirmAssignment = () => {
    if (!assigningOrder || !selectedDriverId) return;
    const driver = staffList.find((s) => s.id === selectedDriverId);
    if (!driver) return;
    assignDriverToOrder(assigningOrder.id, {
      id: driver.id,
      fullName: driver.fullName,
      phone: driver.phone,
      assignedVehiclePlate: driver.assignedVehiclePlate,
      assignedVehicleType: driver.assignedVehicleType,
    });
    setAssigningOrder(null);
    setSelectedDriverId("");
  };

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  const orderStages: { stage: B2BOrderStatus; label: string }[] = [
    { stage: "pending", label: "Pending" },
    { stage: "confirmed", label: "Confirmed" },
    { stage: "processing", label: "Processing" },
    { stage: "packed", label: "Packed" },
    { stage: "shipped", label: "Shipped" },
    { stage: "delivered", label: "Delivered" },
    { stage: "completed", label: "Completed" },
  ];

  const getStageIndex = (status: B2BOrderStatus) => {
    return orderStages.findIndex((s) => s.stage === status);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleDeleteOrder = (orderId: string, orderNumber: string) => {
    deleteOrder(orderId);
    if (selectedOrderId === orderId) {
      setSelectedOrderId(null);
    }
  };

  // =========================================================================
  // FULL SCREEN VIEW: COMPREHENSIVE ORDER DETAIL VIEW
  // (Reuses Supplier Header & Sidebar in the Main Layout Shell)
  // =========================================================================
  if (selectedOrderId && selectedOrder) {
    const currentStageIdx = getStageIndex(selectedOrder.orderStatus);
    const productImages = selectedOrder.productImages || (selectedOrder.productImage ? [selectedOrder.productImage] : []);
    const activeImage = productImages[activeImageIndex] || selectedOrder.productImage;

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Navigation & Title Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-inherit">
          <div className="space-y-1.5">
            <button
              onClick={() => setSelectedOrderId(null)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer mb-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to All Orders</span>
            </button>

            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white">
                {selectedOrder.orderNumber}
              </h2>
              <StatusBadge status={selectedOrder.orderStatus} size="sm" />
              <StatusBadge status={selectedOrder.paymentStatus} size="sm" />
              <StatusBadge status={selectedOrder.fulfillmentStatus} size="sm" />
            </div>

            <p className="text-xs text-zinc-400">
              Placed on <strong className="text-zinc-200">{selectedOrder.orderDate}</strong> • Expected Delivery:{" "}
              <strong className="text-white font-mono">{selectedOrder.expectedDelivery}</strong>
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => toast.success(`Official invoice for ${selectedOrder.orderNumber} exported as PDF.`)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5 text-zinc-400" />
              <span>Print Invoice</span>
            </button>

            {selectedOrder.orderStatus === "pending" ? (
              <button
                onClick={() => openModal("order-action", selectedOrder)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Review & Accept Order</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab("shipments")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
              >
                <Truck className="h-4 w-4" />
                <span>Track Freight Dispatch</span>
              </button>
            )}

            <button
              onClick={() => handleDeleteOrder(selectedOrder.id, selectedOrder.orderNumber)}
              className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-400 transition-colors cursor-pointer"
              title="Delete this order"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Fulfillment Progression Timeline Card */}
        <div
          className={`p-5 rounded-2xl border ${isLight
              ? "bg-white border-slate-200"
              : isSystem
                ? "bg-[#0b142c] border-blue-500/20"
                : "bg-[#10131c] border-white/10"
            }`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Package className="h-4 w-4" />
              <span>Fulfillment Progression Lifecycle</span>
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              Waybill / Tracking:{" "}
              <strong className="text-white">{selectedOrder.trackingNumber || "Pending Logistics Booking"}</strong>
            </span>
          </div>

          <div className="relative pt-2 pb-1">
            {/* Horizontal Line */}
            <div className="absolute top-5 left-6 right-6 h-1 bg-white/10 rounded-full" />
            <div
              className="absolute top-5 left-6 h-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (currentStageIdx / (orderStages.length - 1)) * 100)}%`,
              }}
            />

            {/* Stage Nodes */}
            <div className="relative flex justify-between z-10">
              {orderStages.map((stage, idx) => {
                const isPassed = idx < currentStageIdx;
                const isCurrent = idx === currentStageIdx;

                return (
                  <div key={stage.stage} className="flex flex-col items-center gap-2">
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${isCurrent
                          ? "bg-indigo-600 text-white ring-4 ring-indigo-500/30 scale-110"
                          : isPassed
                            ? "bg-emerald-600 text-white"
                            : "bg-[#141824] border border-white/20 text-zinc-500"
                        }`}
                    >
                      {isPassed ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                    </div>

                    <span
                      className={`text-[11px] font-semibold text-center whitespace-nowrap ${isCurrent
                          ? "text-indigo-400 font-bold"
                          : isPassed
                            ? "text-white"
                            : "text-zinc-500"
                        }`}
                    >
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2-COLUMN COMPREHENSIVE DETAIL WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* =========================================================================
              LEFT COLUMN (7 cols): PRODUCT SHOWCASE & IMAGES ("የምርቱ ሙሉ ዝርዝር እና ፎቶዎች")
             ========================================================================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* Product Card with Photo Gallery */}
            <div
              className={`p-6 rounded-2xl border space-y-5 ${isLight
                  ? "bg-white border-slate-200"
                  : isSystem
                    ? "bg-[#0b142c] border-blue-500/20"
                    : "bg-[#10131c] border-white/10"
                }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Package className="h-4 w-4 text-indigo-400" />
                  <span>Ordered Commodity & Product Specification</span>
                </h3>
                {selectedOrder.productCategory && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    {selectedOrder.productCategory}
                  </span>
                )}
              </div>

              {/* Full Product Photo Preview */}
              {activeImage && (
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 h-72 sm:h-80 w-full group">
                    <img
                      src={activeImage}
                      alt={selectedOrder.productName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                      <div>
                        <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-300 font-bold block">
                          {selectedOrder.productSku || "SKU: ETH-COMMODITY-B2B"}
                        </span>
                        <h4 className="text-base sm:text-lg font-bold text-white">
                          {selectedOrder.productName}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail Selector Strip (if multiple images) */}
                  {productImages.length > 1 && (
                    <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                      {productImages.map((imgUrl, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActiveImageIndex(i)}
                          className={`relative h-16 w-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${activeImageIndex === i
                              ? "border-indigo-500 ring-2 ring-indigo-500/40 scale-105"
                              : "border-white/15 opacity-60 hover:opacity-100"
                            }`}
                        >
                          <img src={imgUrl} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Product Key Info Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Brand / Mill</span>
                  <span className="font-semibold text-white mt-0.5 block truncate">
                    {selectedOrder.productBrand || "Verified Supplier Item"}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Origin Region</span>
                  <span className="font-semibold text-white mt-0.5 block truncate">
                    {selectedOrder.productOrigin || "Ethiopia"}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Quality Grade</span>
                  <span className="font-semibold text-emerald-400 mt-0.5 block truncate">
                    {selectedOrder.productGrade || "Commercial Grade"}
                  </span>
                </div>
              </div>

              {/* Packaging Specification */}
              {selectedOrder.productPackaging && (
                <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02] text-xs">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-0.5">Packaging Standard:</span>
                  <p className="text-zinc-200">{selectedOrder.productPackaging}</p>
                </div>
              )}

              {/* Detailed Technical Specifications Table */}
              {selectedOrder.specifications && Object.keys(selectedOrder.specifications).length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <span className="text-xs font-bold text-zinc-300 block">Technical Specification Parameters:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {Object.entries(selectedOrder.specifications).map(([key, val]) => (
                      <div
                        key={key}
                        className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] flex justify-between items-center"
                      >
                        <span className="text-zinc-400 text-[11px]">{key}:</span>
                        <span className="font-mono font-semibold text-white">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications Badges */}
              {selectedOrder.certifications && selectedOrder.certifications.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <span className="text-xs font-bold text-zinc-300 block">Quality Conformity & Certifications:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedOrder.certifications.map((cert, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-300"
                      >
                        <Award className="h-3.5 w-3.5 text-emerald-400" />
                        <span>{cert}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Financial Calculation Breakdown Card */}
            <div
              className={`p-6 rounded-2xl border space-y-4 ${isLight
                  ? "bg-white border-slate-200"
                  : isSystem
                    ? "bg-[#0b142c] border-blue-500/20"
                    : "bg-[#10131c] border-white/10"
                }`}
            >
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-400" />
                <span>Commercial Invoice Financial Calculation</span>
              </h3>

              {/* Line Item Table */}
              <div className="rounded-xl border border-white/5 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02] text-[10px] uppercase font-bold text-zinc-400">
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3">Quantity</th>
                      <th className="py-2.5 px-3">Unit Rate</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                      selectedOrder.orderItems.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td className="py-3 px-3 font-semibold text-white">
                            {item.productName}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold">
                            {item.quantity.toLocaleString()} {item.unit}
                          </td>
                          <td className="py-3 px-3 font-mono text-zinc-300">
                            ETB {item.unitPrice.toLocaleString()} / {item.unit}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-right text-white">
                            ETB {item.total.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-3 px-3 font-semibold text-white">
                          {selectedOrder.productName}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold">
                          {selectedOrder.quantity.toLocaleString()} {selectedOrder.unit}
                        </td>
                        <td className="py-3 px-3 font-mono text-zinc-300">
                          ETB {selectedOrder.unitPrice.toLocaleString()} / {selectedOrder.unit}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-right text-white">
                          ETB {selectedOrder.subtotal.toLocaleString()}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Tax & Total Stack */}
              <div className="pt-3 border-t border-white/10 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span>Merchandise Subtotal:</span>
                  <span className="text-white">ETB {selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Ethiopian VAT (15% Legal Rate):</span>
                  <span className="text-white">+ ETB {selectedOrder.vat.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Freight Transit & Offloading Cranes:</span>
                  <span className="text-white">+ ETB {selectedOrder.shipping.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-base text-emerald-400 pt-2 border-t border-white/10">
                  <span>Total Payable Order Value:</span>
                  <span>ETB {selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Warehouse Dispatch Notes */}
              {selectedOrder.sellerNotes && (
                <div className="mt-4 p-3.5 rounded-xl border border-white/10 bg-white/[0.02] text-xs">
                  <span className="font-bold text-zinc-300 block mb-1">Warehouse Dispatch Instructions:</span>
                  <p className="text-zinc-400 leading-relaxed">{selectedOrder.sellerNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* =========================================================================
              RIGHT COLUMN (5 cols): BUYER DOSSIER & CBE ESCROW ("የትዕዛዝ ሰጪው ሙሉ ዝርዝር")
             ========================================================================= */}
          <div className="lg:col-span-5 space-y-6">
            {/* Full Buyer Corporation Profile Card */}
            <div
              className={`p-6 rounded-2xl border space-y-5 ${isLight
                  ? "bg-white border-slate-200"
                  : isSystem
                    ? "bg-[#0b142c] border-blue-500/20"
                    : "bg-[#10131c] border-white/10"
                }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building className="h-4 w-4 text-emerald-400" />
                  <span>Purchaser Corporation Dossier</span>
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <BadgeCheck className="h-3 w-3" />
                  <span>Verified Buyer</span>
                </span>
              </div>

              {/* Corporation Title & TIN */}
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">{selectedOrder.buyerCompany}</h4>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span>Taxpayer ID (TIN):</span>
                  {selectedOrder.buyerTinNumber ? (
                    <button
                      onClick={() => handleCopy(selectedOrder.buyerTinNumber!, "TIN")}
                      className="font-mono font-bold text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>{selectedOrder.buyerTinNumber}</span>
                      <Copy className="h-3 w-3 opacity-60" />
                    </button>
                  ) : (
                    <span className="font-mono text-zinc-400 italic">Enterprise / Individual</span>
                  )}
                </div>
              </div>

              {/* Authorized Contact Person Card */}
              <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] space-y-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {selectedOrder.contactPerson.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{selectedOrder.contactPerson}</p>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {selectedOrder.buyerRepresentativeTitle || "Authorized Procurement Officer"}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Phone:</span>
                    </span>
                    <a
                      href={`tel:${selectedOrder.buyerPhone}`}
                      className="font-mono font-semibold text-indigo-400 hover:underline"
                    >
                      {selectedOrder.buyerPhone}
                    </a>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Email:</span>
                    </span>
                    <a
                      href={`mailto:${selectedOrder.buyerEmail}`}
                      className="font-mono font-semibold text-indigo-400 hover:underline truncate max-w-[200px]"
                    >
                      {selectedOrder.buyerEmail}
                    </a>
                  </div>
                </div>
              </div>

              {/* Delivery Facility Destination */}
              <div className="space-y-1 text-xs">
                <span className="text-[11px] text-zinc-400 font-semibold flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Physical Delivery Hub / Jobsite:</span>
                </span>
                <p className="font-semibold text-white pl-5">{selectedOrder.buyerLocation}</p>
              </div>

              {/* Commercial Track Record on MercatoX */}
              {(selectedOrder.buyerTotalOrders || selectedOrder.buyerTotalSpend || selectedOrder.buyerRating) ? (
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <span className="text-xs font-bold text-zinc-300 block">Buyer Track Record on MercatoX:</span>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02]">
                      <span className="text-[10px] text-zinc-400 block">Lifetime Orders</span>
                      <span className="font-mono font-bold text-white mt-0.5 block">
                        {selectedOrder.buyerTotalOrders ? `${selectedOrder.buyerTotalOrders} Orders` : "—"}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02]">
                      <span className="text-[10px] text-zinc-400 block">Total Spend</span>
                      <span className="font-mono font-bold text-emerald-400 mt-0.5 block truncate">
                        {selectedOrder.buyerTotalSpend ? `ETB ${((selectedOrder.buyerTotalSpend) / 1000000).toFixed(1)}M` : "—"}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02]">
                      <span className="text-[10px] text-zinc-400 block">Rating</span>
                      <span className="font-mono font-bold text-amber-400 mt-0.5 block">
                        {selectedOrder.buyerRating ? `★ ${selectedOrder.buyerRating}` : "Verified Buyer"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Direct Communication Buttons */}
              <div className="pt-2 border-t border-white/10 flex gap-2">
                <button
                  onClick={() => {
                    setActiveTab("messages");
                    setActiveChatThreadId("chat-01");
                    toast.info(`Switched to secure messages desk with ${selectedOrder.buyerCompany}.`);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Mail className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Open Chat Desk</span>
                </button>

                <a
                  href={`tel:${selectedOrder.buyerPhone}`}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Phone className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Call Buyer</span>
                </a>
              </div>
            </div>

            {/* CBE Escrow Protection Security Guarantee */}
            <div
              className={`p-6 rounded-2xl border space-y-4 ${isLight
                  ? "bg-white border-slate-200"
                  : isSystem
                    ? "bg-[#0b142c] border-blue-500/20"
                    : "bg-[#10131c] border-white/10"
                }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  <span>CBE Smart Escrow Protection</span>
                </h4>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  100% Funds Secured
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-zinc-300 leading-relaxed">
                <p>
                  Escrow Guarantee Ref:{" "}
                  <strong className="text-white font-mono">
                    {selectedOrder.escrowReferenceNumber || (selectedOrder.orderNumber ? `CBE-ESC-${selectedOrder.orderNumber}` : "Pending Verification")}
                  </strong>
                </p>
                <p>
                  Terms: <strong className="text-white">{selectedOrder.paymentTerms}</strong>
                </p>
                <p className="text-[11px] text-zinc-400 pt-1">
                  Commercial Bank of Ethiopia holds full deposit in an irrevocable escrow account. Payout is automatically released to your supplier account upon destination delivery inspection signoff.
                </p>
              </div>
            </div>

            {/* Carrier Logistics & Assigned Fleet Driver Card */}
            <div
              className={`p-6 rounded-2xl border space-y-4 text-xs ${isLight
                  ? "bg-white border-slate-200"
                  : isSystem
                    ? "bg-[#0b142c] border-blue-500/20"
                    : "bg-[#10131c] border-white/10"
                }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white flex items-center gap-1.5 text-sm">
                  <Truck className="h-4 w-4 text-cyan-400" />
                  <span>Freight Logistics & Assigned Driver</span>
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setAssigningOrder(selectedOrder);
                    setSelectedDriverId(selectedOrder.assignedDriverId || "");
                  }}
                  className="px-3 py-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  {selectedOrder.assignedDriverName ? "Change Driver" : "+ Assign Driver"}
                </button>
              </div>

              {selectedOrder.assignedDriverName ? (
                <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0">
                      {selectedOrder.assignedDriverName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-white text-sm truncate">{selectedOrder.assignedDriverName}</p>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Dispatched On-Route
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Assigned Vehicle: <strong className="text-zinc-200">{selectedOrder.assignedVehicleType || "Freight Transport"}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-zinc-400 block text-[10px] uppercase font-bold">Vehicle Plate</span>
                      <span className="font-mono font-bold text-cyan-300">
                        {selectedOrder.assignedVehiclePlate || "Plate AA-3-98210"}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px] uppercase font-bold">Driver Mobile</span>
                      <a
                        href={`tel:${selectedOrder.assignedDriverPhone}`}
                        className="font-mono font-bold text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <Phone className="h-3 w-3" />
                        <span>{selectedOrder.assignedDriverPhone || "+251 91 144 2200"}</span>
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-200 text-center space-y-2">
                  <p className="font-medium text-xs">No driver assigned to this order yet.</p>
                  <p className="text-[11px] text-zinc-400">
                    Assign a fleet driver registered under {selectedOrder.branchName || "this branch"} to generate waybill and begin shipment.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAssigningOrder(selectedOrder);
                      setSelectedDriverId("");
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Truck className="h-3.5 w-3.5" />
                    <span>Assign Driver Now</span>
                  </button>
                </div>
              )}

              <div className="space-y-1.5 text-zinc-400 pt-1 border-t border-white/5">
                <p>
                  Carrier / Fleet: <strong className="text-white">{selectedOrder.carrierName || "Pending Carrier Assignment"}</strong>
                </p>
                <p>
                  Waybill Number:{" "}
                  <strong className="text-white font-mono">{selectedOrder.trackingNumber || "Pending Booking"}</strong>
                </p>
                <p>
                  Origin Depot: <strong className="text-white">{selectedOrder.branchName || "Central Logistics Hub"}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // DEFAULT VIEW: BORDERLESS & CLEAN ORDERS TABLE
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="B2B Purchase Orders Management"
        subtitle="Process commercial purchase orders, review Escrow fund guarantees, update packaging milestones, and dispatch freight carriers"
        breadcrumbs={[{ label: "Dashboard", onClick: () => setActiveTab("dashboard") }, { label: "Orders" }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrders()}
              disabled={isLoadingOrders}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh orders from database"
            >
              <RotateCcw className={`h-3.5 w-3.5 text-zinc-400 ${isLoadingOrders ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <span className="rounded-lg border border-emerald-200/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400">
              {orders.length} Active Orders
            </span>
          </div>
        }
      />

      {/* Branch Scope Banner / Super Supplier Hub Selector */}
      {isBranchManager ? (
        <div className="p-3.5 rounded-2xl border border-blue-500/30 bg-blue-500/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 text-blue-300">
            <Building className="h-4 w-4 shrink-0 text-blue-400" />
            <span>
              Branch Operations View: Managing orders strictly scoped to <strong>{userBranchName}</strong> (Logged in as {user?.name || currentStaffUser?.fullName}).
            </span>
          </div>
          <span className="rounded-md bg-blue-600/30 border border-blue-500/40 px-2.5 py-0.5 text-[10px] font-bold text-blue-200">
            Isolated Branch Scope
          </span>
        </div>
      ) : (
        /* Super Supplier Regional Hub Selector */
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-zinc-400 font-semibold flex items-center gap-1.5 text-xs mr-1">
            <Building className="h-3.5 w-3.5 text-indigo-400" />
            <span>Regional Hub Filter:</span>
          </span>
          <button
            type="button"
            onClick={() => setBranchFilter("all")}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${branchFilter === "all"
                ? "bg-indigo-600 border-indigo-500 text-white shadow-xs"
                : "border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.08]"
              }`}
          >
            All Enterprise Hubs ({orders.length})
          </button>
          {warehouses.map((wh) => {
            const count = orders.filter((o) => o.branchId === wh.id).length;
            return (
              <button
                key={wh.id}
                type="button"
                onClick={() => setBranchFilter(wh.id)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${branchFilter === wh.id
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-xs"
                    : "border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.08]"
                  }`}
              >
                {wh.code} · {wh.city || wh.name.split(" ")[0]} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Filter and Search Bar */}
      <DataFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search orders by Order ID, buyer enterprise, commodity, or contact person..."
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { value: "pending", label: "Pending Review" },
          { value: "confirmed", label: "Confirmed" },
          { value: "processing", label: "Processing & Milling" },
          { value: "packed", label: "Packed & Weighed" },
          { value: "shipped", label: "Shipped in Transit" },
          { value: "delivered", label: "Delivered" },
          { value: "completed", label: "Completed" },
          { value: "cancelled", label: "Cancelled / Rejected" },
        ]}
        onReset={() => {
          setSearchQuery("");
          setStatusFilter("all");
        }}
        onExport={() => toast.success("Exporting purchase orders register...")}
      />

      {/* Orders Data Table: Borderless, Background-less, Clean & Light */}
      <div className="w-full overflow-x-auto">
        {isLoadingOrders && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            <p className="text-xs text-zinc-400 font-medium">Fetching real purchase orders from database...</p>
          </div>
        ) : ordersError && orders.length === 0 ? (
          <div className="p-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-rose-300">Unable to load purchase orders</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">{ordersError}</p>
              </div>
            </div>
            <button
              onClick={() => fetchOrders()}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : paginated.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Orders Found"
              description="No purchase orders match your active filter parameters."
            />
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 font-semibold uppercase text-[10px] tracking-wider select-none">
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Buyer Company</th>
                <th className="py-3 px-3">Commodity & Volume</th>
                <th className="py-3 px-3">Order Total (ETB)</th>
                <th className="py-3 px-3">Branch Hub</th>
                <th className="py-3 px-3">Fleet Driver</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginated.map((order) => {
                const isMenuOpen = activeMenuId === order.id;

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    {/* Order ID */}
                    <td className="py-4 px-3 font-mono font-bold text-indigo-400">
                      {order.orderNumber}
                    </td>

                    {/* Buyer Company */}
                    <td className="py-4 px-3">
                      <p className="font-bold text-white truncate max-w-[190px]">{order.buyerCompany}</p>
                      <p className="text-[11px] text-zinc-400">{order.contactPerson}</p>
                    </td>

                    {/* Commodity & Volume */}
                    <td className="py-4 px-3">
                      <p className="font-semibold text-zinc-200 truncate max-w-[200px]">{order.productName}</p>
                      <p className="font-mono text-zinc-400 text-[11px]">
                        {order.quantity.toLocaleString()} {order.unit} @ ETB {order.unitPrice.toLocaleString()}
                      </p>
                    </td>

                    {/* Order Total */}
                    <td className="py-4 px-3 font-mono font-bold text-white text-sm">
                      ETB {order.total.toLocaleString()}
                    </td>

                    {/* Branch Hub */}
                    <td className="py-4 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/5 border border-white/10 text-zinc-300">
                        {order.branchName?.split(" ")[0] || "Hub"}
                      </span>
                    </td>

                    {/* Fleet Driver */}
                    <td className="py-4 px-3" onClick={(e) => e.stopPropagation()}>
                      {order.assignedDriverName ? (
                        <div className="flex items-center gap-1.5">
                          <div className="h-6 w-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                            <Truck className="h-3 w-3" />
                          </div>
                          <div className="min-w-0 max-w-[130px]">
                            <p className="font-semibold text-white truncate text-[11px]">{order.assignedDriverName}</p>
                            <p className="font-mono text-zinc-400 text-[9px] truncate">{order.assignedVehiclePlate || "Dispatched"}</p>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setAssigningOrder(order);
                            setSelectedDriverId("");
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold text-[10px] transition-colors cursor-pointer"
                        >
                          <Truck className="h-3 w-3" />
                          <span>Assign Driver</span>
                        </button>
                      )}
                    </td>

                    {/* Payment Status */}
                    <td className="py-4 px-3">
                      <StatusBadge status={order.paymentStatus} size="sm" />
                    </td>

                    {/* Order Status */}
                    <td className="py-4 px-3">
                      <StatusBadge status={order.orderStatus} size="sm" />
                    </td>

                    {/* Date */}
                    <td className="py-4 px-3 font-mono text-zinc-400 whitespace-nowrap">
                      {order.orderDate}
                    </td>

                    {/* Action 3-Dots Menu */}
                    <td
                      className="py-4 px-3 text-right relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : order.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="Order Actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div
                          className={`absolute right-3 top-10 w-44 rounded-xl border shadow-2xl py-1.5 z-30 animate-in zoom-in-95 duration-150 ${isLight
                              ? "bg-white border-slate-200 text-slate-800"
                              : isSystem
                                ? "bg-[#0b142c] border-blue-500/30 text-white"
                                : "bg-[#141824] border-white/15 text-white"
                            }`}
                        >
                          {/* Detail Action */}
                          <button
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-white/10 transition-colors text-left cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-indigo-400" />
                            <span>View Detail</span>
                          </button>

                          {/* Assign Driver Action */}
                          <button
                            onClick={() => {
                              setAssigningOrder(order);
                              setSelectedDriverId(order.assignedDriverId || "");
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-white/10 transition-colors text-left cursor-pointer text-cyan-400"
                          >
                            <Truck className="h-3.5 w-3.5" />
                            <span>{order.assignedDriverName ? "Re-assign Driver" : "Assign Driver"}</span>
                          </button>

                          {/* Review & Accept (if pending) */}
                          {order.orderStatus === "pending" && (
                            <button
                              onClick={() => {
                                openModal("order-action", order);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-white/10 transition-colors text-left cursor-pointer text-emerald-400"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Review & Accept</span>
                            </button>
                          )}

                          {/* Track Freight */}
                          {order.orderStatus !== "pending" && (
                            <button
                              onClick={() => {
                                setActiveTab("shipments");
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-white/10 transition-colors text-left cursor-pointer"
                            >
                              <Truck className="h-3.5 w-3.5 text-cyan-400" />
                              <span>Track Freight</span>
                            </button>
                          )}

                          <div className="my-1 border-t border-white/5" />

                          {/* Delete Order */}
                          <button
                            onClick={() => {
                              handleDeleteOrder(order.id, order.orderNumber);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-rose-500/10 text-rose-400 transition-colors text-left cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete Order</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />

      {/* Interactive Modal: Assign Fleet Driver */}
      {assigningOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`w-full max-w-lg rounded-2xl border shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200 ${isLight
                ? "bg-white border-slate-200 text-slate-800"
                : isSystem
                  ? "bg-[#0b142c] border-blue-500/30 text-white"
                  : "bg-[#101420] border-white/15 text-white"
              }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Assign Fleet Driver</h3>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Order {assigningOrder.orderNumber} · {assigningOrder.branchName || "Branch Depot"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssigningOrder(null)}
                className="p-1 rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Order Destination Strip */}
            <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02] text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Buyer Destination:</span>
                <span className="font-semibold text-white">{assigningOrder.buyerCompany}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Cargo Volume:</span>
                <span className="font-mono font-bold text-indigo-300">
                  {assigningOrder.quantity.toLocaleString()} {assigningOrder.unit} {assigningOrder.productName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Delivery Address:</span>
                <span className="font-medium text-zinc-200 truncate max-w-[260px]">{assigningOrder.buyerLocation}</span>
              </div>
            </div>

            {/* Driver Selection List */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-300">
                Select Fleet Driver from {assigningOrder.branchName || "Assigned Branch"}:
              </label>

              {eligibleDrivers.length === 0 ? (
                <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-center text-xs text-amber-300 space-y-2">
                  <AlertCircle className="h-5 w-5 mx-auto text-amber-400" />
                  <p className="font-semibold">No fleet drivers registered under this branch.</p>
                  <p className="text-[11px] text-zinc-400">
                    Go to <strong>Staff & Fleet Management</strong> to register a driver for {assigningOrder.branchName}.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {eligibleDrivers.map((driver) => {
                    const isSelected = selectedDriverId === driver.id;
                    const isOnRoute = driver.currentDriverStatus === "on_route";

                    return (
                      <div
                        key={driver.id}
                        onClick={() => setSelectedDriverId(driver.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isSelected
                            ? "border-cyan-500 bg-cyan-500/10 shadow-sm shadow-cyan-500/20"
                            : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${isSelected
                                ? "bg-cyan-500 text-white border-cyan-400"
                                : "bg-white/10 text-zinc-300 border-white/10"
                              }`}
                          >
                            {driver.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-white text-xs truncate">{driver.fullName}</p>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${isOnRoute
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  }`}
                              >
                                {isOnRoute ? "On Route" : "Available"}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 font-mono">
                              {driver.assignedVehiclePlate || "Plate Pending"} · {driver.assignedVehicleType || "Freight Trailer"}
                            </p>
                            <p className="text-[10px] text-zinc-500 font-mono">{driver.phone}</p>
                          </div>
                        </div>

                        <div
                          className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected
                              ? "border-cyan-500 bg-cyan-500 text-white"
                              : "border-white/30 bg-white/5"
                            }`}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setAssigningOrder(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-zinc-300 hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedDriverId}
                onClick={handleConfirmAssignment}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Truck className="h-3.5 w-3.5" />
                <span>Confirm Assignment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

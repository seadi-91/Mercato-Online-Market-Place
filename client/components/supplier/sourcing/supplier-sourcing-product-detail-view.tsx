"use client";

import React, { useState, useRef } from "react";
import {
  ArrowLeft,
  ShieldCheck,
  Star,
  MapPin,
  Truck,
  Building2,
  Clock,
  CheckCircle2,
  TrendingDown,
  Layers,
  Calculator,
  Handshake,
  ShoppingCart,
  FileQuestion,
  ChevronRight,
  ExternalLink,
  Package,
  Award,
  Check,
  Share2,
  Bookmark,
  Info,
  BadgePercent,
  Sparkles,
  Lock,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Calendar,
  Warehouse,
  FileText,
  HelpCircle,
  ChevronDown,
  ShieldAlert,
  PhoneCall,
  Mail,
  Compass,
  Scale,
  Thermometer,
  Shield,
  CheckCircle,
} from "lucide-react";
import { SourcingProduct } from "@/types/supplier";
import { useSupplierStore } from "@/store/supplier-store";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

interface Props {
  product: SourcingProduct;
  onBack: () => void;
  onOpenNegotiate: (product: SourcingProduct) => void;
  onOpenCheckout: (product: SourcingProduct, selectedQty: number, selectedUnitPrice: number) => void;
  onOpenRFQ?: () => void;
  onSelectProduct?: (product: SourcingProduct) => void;
}

export function SupplierSourcingProductDetailView({
  product,
  onBack,
  onOpenNegotiate,
  onOpenCheckout,
  onOpenRFQ,
  onSelectProduct,
}: Props) {
  const { user } = useAuthStore();
  const { sourcingProducts, profile, products: myOwnProducts } = useSupplierStore();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [calcQty, setCalcQty] = useState(product.moq || 10);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "supplier" | "logistics" | "guarantee">("overview");

  // Zoom Lens state
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [zoomScale, setZoomScale] = useState<number>(2.6);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // FAQ Accordion state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Handle high precision mouse tracking on image
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setMousePos({ x, y });
  };

  // Compute tier price for calcQty
  const calculateUnitPrice = (qty: number): number => {
    if (!product.tierPricing || product.tierPricing.length === 0) {
      return product.baseWholesalePrice;
    }
    const matchingTier = [...product.tierPricing]
      .sort((a, b) => b.minQty - a.minQty)
      .find((t) => qty >= t.minQty);

    return matchingTier ? matchingTier.unitPrice : product.baseWholesalePrice;
  };

  const currentUnitPrice = calculateUnitPrice(calcQty);
  const regularTotal = (product.retailPrice || product.baseWholesalePrice * 1.1) * calcQty;
  const wholesaleTotal = currentUnitPrice * calcQty;
  const totalSavings = Math.max(0, regularTotal - wholesaleTotal);
  const savingsPct = regularTotal > 0 ? ((totalSavings / regularTotal) * 100).toFixed(1) : "0";

  // Related products from similar category or supplier (excludes own products)
  const currentUserId = user?.id;
  const myBusinessName = profile?.businessName?.toLowerCase().trim();
  const relatedProducts = sourcingProducts
    .filter(
      (p) =>
        p.id !== product.id &&
        (!currentUserId || p.supplierId !== currentUserId) &&
        (!myBusinessName || p.supplierName?.toLowerCase().trim() !== myBusinessName) &&
        (!myOwnProducts ||
          !myOwnProducts.some(
            (myP) => myP.id === p.id || (myP.sku && p.sku && myP.sku.toLowerCase() === p.sku.toLowerCase())
          )) &&
        (p.category === product.category || p.supplierName === product.supplierName)
    )
    .slice(0, 4);

  // Enhanced Specifications for product deep dive
  const extendedSpecs: Record<string, string> = {
    "Commodity Grade": product.grade || "Grade 1 Export Standard",
    "Origin / Region": product.origin || "Regional Cooperative Hub, Ethiopia",
    "Harvest / Batch Year": "2025 / 2026 Prime Crop",
    "Moisture Standard": "< 11.2% Moisture Content (ECAE Certified)",
    "Purity & Cleanliness": "99.4% Machine Cleaned & Sorted",
    "Packaging Specification": `50kg Multi-wall Polypropylene Sacks (GrainPro lined)`,
    "Storage Conditions": "Ventilated, ambient temperature below 24°C, dry storage",
    "Minimum Order Quantity": `${product.moq} ${product.unit}`,
    "Total Batch Availability": `${product.stockQuantity.toLocaleString()} ${product.unit}`,
    "Batch / Lot Number": `ET-B2B-${product.sku?.replace(/[^a-zA-Z0-9]/g, "") || "9482"}`,
    ...(product.specifications || {}),
  };

  // FAQ Items
  const faqList = [
    {
      q: "How does the MercatoX Escrow protect my bulk funds?",
      a: "When you fund your order via Chapa, 100% of your funds are secured in the official MercatoX Escrow vault. The seller will not receive payment until the goods arrive at your receiving warehouse and you verify the quality specifications and provide the 4-digit Handover OTP.",
    },
    {
      q: "Can I negotiate a custom bulk rate for large volume truckloads?",
      a: "Yes! Simply click 'Negotiate Bulk Price' to submit your counter-proposal with your desired target price, delivery terms (CIF, FOB, EXW), and delivery warehouse. The seller will review and respond directly within minutes.",
    },
    {
      q: "What if the delivered batch does not match the agreed quality grade?",
      a: "You have a mandatory 72-hour inspection window upon freight delivery. If the moisture, grade, or cleanliness deviates from the agreed specifications, you can submit an ECAE sampling dispute. Funds remain locked in Escrow until resolved or fully refunded.",
    },
    {
      q: "What are the shipping and pickup options?",
      a: "You can choose 'Self Pickup (Buyer Fleet)' at ETB 0 from the seller's distribution warehouse, or select 'Seller Dispatched Multimodal Freight' where the seller coordinates certified trucks directly to your doorstep.",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Top Navigation & Action Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all flex items-center gap-2 text-xs font-semibold group shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Marketplace</span>
          </button>

          <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500">
            <span>Sourcing Hub</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-700 dark:text-zinc-300 font-medium">{product.category}</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold truncate max-w-xs">
              {product.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsSaved(!isSaved);
              toast.success(isSaved ? "Removed from Watchlist" : "Saved to Sourcing Watchlist");
            }}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
              isSaved
                ? "bg-indigo-50 dark:bg-indigo-600/20 border-indigo-300 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300"
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <Bookmark
              className={`w-3.5 h-3.5 ${
                isSaved ? "fill-indigo-600 dark:fill-indigo-400 text-indigo-600 dark:text-indigo-400" : ""
              }`}
            />
            <span>{isSaved ? "Saved in Watchlist" : "Add to Watchlist"}</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Commodity link copied to clipboard!");
            }}
            className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors shadow-xs"
            title="Share Commodity"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Two-Column Interactive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
        {/* LEFT COLUMN: Visual Showcase with Precision Zoom & Deep Info Tabs (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Showcase Image with Precision Mouse Zoom Lens */}
          <div className="space-y-3">
            <div
              ref={imageContainerRef}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onMouseMove={handleMouseMove}
              className="relative aspect-16/10 w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-md dark:shadow-2xl cursor-crosshair select-none group"
            >
              {/* Scaled Background Image */}
              <img
                src={product.images[activeImageIdx] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-100 ease-out will-change-transform"
                style={{
                  transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                  transform: isHovered ? `scale(${zoomScale})` : "scale(1)",
                }}
              />

              {/* Escrow Badge */}
              {product.isEscrowGuaranteed && (
                <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 bg-emerald-950/90 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-lg pointer-events-none">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  100% Escrow Protected
                </div>
              )}

              {/* Available Stock Indicator */}
              <div className="absolute bottom-3.5 right-3.5 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs text-zinc-100 font-mono border border-white/10 pointer-events-none shadow-md">
                Available Stock: {product.stockQuantity.toLocaleString()} {product.unit}
              </div>

              {/* Dynamic Zoom Loupe Ring Indicator (Follows cursor when hovered) */}
              {isHovered && (
                <div
                  className="absolute pointer-events-none w-28 h-28 -ml-14 -mt-14 rounded-full border-2 border-indigo-400/80 bg-indigo-500/10 backdrop-blur-[0.5px] shadow-2xl transition-opacity duration-150 ring-4 ring-indigo-500/20"
                  style={{
                    left: `${mousePos.x}%`,
                    top: `${mousePos.y}%`,
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-indigo-300 bg-black/40 rounded-full scale-75">
                    {zoomScale}x
                  </div>
                </div>
              )}

              {/* Zoom Instruction Floating Pill */}
              <div
                className={`absolute top-3.5 right-3.5 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 text-xs text-zinc-200 font-medium flex items-center gap-2 transition-all duration-200 pointer-events-none ${
                  isHovered ? "opacity-100 scale-100 text-indigo-300" : "opacity-75"
                }`}
              >
                <ZoomIn className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isHovered ? `Precision Zoom: ${zoomScale}x` : "Hover to Magnify"}</span>
              </div>
            </div>

            {/* Gallery Thumbnails & Zoom Multiplier Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              {/* Thumbnails */}
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImageIdx === idx
                        ? "border-indigo-600 dark:border-indigo-500 ring-4 ring-indigo-500/20 scale-105 shadow-md"
                        : "border-zinc-200 dark:border-zinc-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Zoom Scale Buttons */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 px-2 font-medium">Zoom:</span>
                {[2.0, 2.6, 3.5].map((scale) => (
                  <button
                    key={scale}
                    onClick={() => setZoomScale(scale)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      zoomScale === scale
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                  >
                    {scale}x
                  </button>
                ))}
                <button
                  onClick={() => setIsLightboxOpen(true)}
                  className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ml-1"
                  title="Full Screen Preview"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Specifications Highlights Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="text-[11px] text-zinc-500 flex items-center gap-1 mb-1">
                <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Quality Grade</span>
              </div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {product.grade || "Grade 1 Export"}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="text-[11px] text-zinc-500 flex items-center gap-1 mb-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Source Origin</span>
              </div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {product.origin}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="text-[11px] text-zinc-500 flex items-center gap-1 mb-1">
                <Package className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Minimum Order</span>
              </div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                {product.moq} {product.unit}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="text-[11px] text-zinc-500 flex items-center gap-1 mb-1">
                <Truck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Dispatch Time</span>
              </div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                ~{product.leadTimeDays || 2} Business Days
              </div>
            </div>
          </div>

          {/* Deep Exploration Tab Navigation */}
          <div className="border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2 sm:gap-4 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "overview"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400"
                  : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <Info className="w-4 h-4" />
              Product Overview
            </button>

            <button
              onClick={() => setActiveTab("specs")}
              className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "specs"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400"
                  : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <Layers className="w-4 h-4" />
              Technical Specs & Laboratory
            </button>

            <button
              onClick={() => setActiveTab("supplier")}
              className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "supplier"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400"
                  : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <Building2 className="w-4 h-4" />
              Verified Seller & Merchant Profile
            </button>

            <button
              onClick={() => setActiveTab("logistics")}
              className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "logistics"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400"
                  : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <Truck className="w-4 h-4" />
              Shipping & Fulfillment Hubs
            </button>

            <button
              onClick={() => setActiveTab("guarantee")}
              className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "guarantee"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400"
                  : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Escrow & Quality Guarantee
            </button>
          </div>

          {/* TAB 1: PRODUCT OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-2">
                    Commercial Commodity Description
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <span className="text-[11px] text-zinc-500 font-medium">Packaging Unit</span>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      50kg Double-Ply Sacks
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <span className="text-[11px] text-zinc-500 font-medium">Production Batch</span>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      LOT #ET-2026-981
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <span className="text-[11px] text-zinc-500 font-medium">Preservation Life</span>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      24 Months Dry Store
                    </p>
                  </div>
                </div>
              </div>

              {/* Quality Certifications Grid */}
              {product.certifications && product.certifications.length > 0 && (
                <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Official Quality Compliance & Certifications
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {product.certifications.map((cert, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/80 flex items-center gap-2.5 text-xs text-zinc-800 dark:text-zinc-200 font-medium"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TECHNICAL SPECIFICATIONS & LABORATORY */}
          {activeTab === "specs" && (
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Laboratory & Quality Parameters
                </h3>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> ECAE Laboratory Tested
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {Object.entries(extendedSpecs).map(([key, val]) => (
                  <div
                    key={key}
                    className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-center space-y-1"
                  >
                    <span className="text-[11px] text-zinc-500 font-medium">{key}</span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: VERIFIED SELLER & MERCHANT PROFILE */}
          {activeTab === "supplier" && (
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-xs">
              {/* Merchant Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl shadow-xs">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 text-base sm:text-lg">
                      <span>{product.supplierName}</span>
                      {product.supplierVerified && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Gold Verified Supplier
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-3 mt-1">
                      <span className="flex items-center text-amber-500 dark:text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                        {product.supplierRating.toFixed(1)} / 5.0 ({product.supplierRatingCount} verified ratings)
                      </span>
                      <span>•</span>
                      <span>Est. 2018</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onOpenRFQ}
                  className="px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 hover:bg-indigo-100 dark:hover:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center gap-1.5 transition-all self-start sm:self-auto"
                >
                  <FileQuestion className="w-3.5 h-3.5" />
                  Direct RFQ to Seller
                </button>
              </div>

              {/* Merchant Performance KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 text-center">
                  <div className="text-[11px] text-zinc-500">On-Time Dispatch</div>
                  <div className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    99.4%
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 text-center">
                  <div className="text-[11px] text-zinc-500">Response Speed</div>
                  <div className="text-sm sm:text-base font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {product.supplierResponseTime || "< 15 Mins"}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 text-center">
                  <div className="text-[11px] text-zinc-500">Completed Orders</div>
                  <div className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5">
                    148+ Deals
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 text-center">
                  <div className="text-[11px] text-zinc-500">Escrow Bonded</div>
                  <div className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    100% Bond
                  </div>
                </div>
              </div>

              {/* Legal Registration & Verification Details */}
              <div className="space-y-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px]">
                  Verified Business Registration & Credentials
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-zinc-500">Tax Identification (TIN):</span>
                    <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">0098471625</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-zinc-500">Ministry of Trade License:</span>
                    <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">MT/AA/2022/948</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-zinc-500">Primary Market Location:</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{product.supplierMarketZone}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-zinc-500">Trade License Category:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Grade 1 Bulk Producer</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SHIPPING & FULFILLMENT HUBS */}
          {activeTab === "logistics" && (
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-5 shadow-xs">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Logistics Routing & Freight Dispatch Hubs
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
                    <Warehouse className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Option A: Self Pickup (Buyer Fleet)</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Dispatch your own fleet or contracted trucks directly to the seller warehouse. Loading and weighbridge verification provided at zero platform freight fees.
                  </p>
                  <div className="pt-2 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    Freight Fee: ETB 0.00
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
                    <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Option B: Seller Dispatched Multimodal Freight</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Seller coordinates certified heavy trucks with GPS tracking and electronic waybills directly to your destination warehouse.
                  </p>
                  <div className="pt-2 font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                    Calculated at Checkout (ETB 6,500 - 12,000)
                  </div>
                </div>
              </div>

              {/* Transit Timeline */}
              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/20 space-y-2">
                <h4 className="font-bold text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Typical 3-Stage Fulfillment Timeline
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                  <div>
                    <strong>Day 1:</strong> Order Escrow funded & warehouse packing initiated.
                  </div>
                  <div>
                    <strong>Day 2-3:</strong> Multimodal transit via Mojo Dry Port / Kality Expressway.
                  </div>
                  <div>
                    <strong>Day 4:</strong> Arrival, 72h sample quality inspection & OTP handover.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ESCROW & QUALITY GUARANTEE */}
          {activeTab === "guarantee" && (
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-5 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    MercatoX Official Escrow Buyer Protection Program
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Zero financial risk for bulk buyers and wholesalers
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    100% Chapa Escrow Lock
                  </span>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Payment is never transferred directly to the seller upon checkout. It is safely locked in escrow until you sign the physical waybill and enter the 4-digit OTP.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    72-Hour Quality Inspection
                  </span>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    You have 72 full hours after delivery to inspect moisture levels, batch weight, and packaging integrity before releasing funds.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Interactive FAQ Accordion Section */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Frequently Asked Questions (FAQ)
            </h3>

            <div className="space-y-2.5">
              {faqList.map((faq, index) => {
                const isOpen = expandedFaq === index;
                return (
                  <div
                    key={index}
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800/80 overflow-hidden bg-zinc-50 dark:bg-zinc-950/60 transition-all"
                  >
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : index)}
                      className="w-full p-3.5 text-left flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-zinc-100 gap-3 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${
                          isOpen ? "rotate-180 text-indigo-600 dark:text-indigo-400" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-3.5 pb-3.5 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-zinc-200 dark:border-zinc-800/60 pt-2.5">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Pricing Card, Bulk Calculator & Sticky Action Bar (5 Cols) */}
        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-4">
          {/* Main Action Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/90 space-y-5 shadow-sm dark:shadow-xl">
            {/* Header Titles & Badges */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                  {product.category}
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  {product.grade}
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/50">
                  SKU: {product.sku}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 leading-snug">
                {product.name}
              </h1>

              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>
                  Origin: <strong className="text-zinc-800 dark:text-zinc-200">{product.origin}</strong>
                </span>
              </div>
            </div>

            {/* Wholesale Price Hero Box */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-gradient-to-br dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950/30 border border-zinc-200 dark:border-indigo-500/20 space-y-1">
              <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Base Wholesale Price</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                  ETB {product.baseWholesalePrice.toLocaleString()}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">/ {product.unit}</span>
              </div>
              {product.retailPrice && (
                <div className="text-xs text-zinc-400 dark:text-zinc-500 line-through">
                  Retail Reference: ETB {product.retailPrice.toLocaleString()}
                </div>
              )}
            </div>

            {/* Tiered Bulk Pricing Grid */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                  <BadgePercent className="w-4 h-4" />
                  Tiered Bulk Volume Pricing
                </span>
                <span className="text-zinc-400 font-normal">Currency: ETB</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {product.tierPricing.map((tier, idx) => {
                  const isCurrentTier =
                    calcQty >= tier.minQty && (tier.maxQty === null || calcQty <= tier.maxQty);
                  return (
                    <div
                      key={tier.id || idx}
                      onClick={() => setCalcQty(tier.minQty)}
                      className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                        isCurrentTier
                          ? "bg-indigo-50 dark:bg-indigo-600/20 border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/30 text-indigo-700 dark:text-indigo-300 shadow-xs"
                          : "bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      <div className="text-[11px] font-semibold">
                        {tier.minQty}
                        {tier.maxQty ? ` - ${tier.maxQty}` : "+"} {product.unit}
                      </div>
                      <div className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 mt-1 font-mono">
                        ETB {tier.unitPrice.toLocaleString()}
                      </div>
                      {tier.discountPercentage ? (
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                          Save {tier.discountPercentage}%
                        </div>
                      ) : (
                        <div className="text-[10px] text-zinc-400 mt-0.5">Base Tier</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Quantity & Order Value Calculator */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Order Quantity Selector
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                  Saving ~{savingsPct}% vs Retail
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2 focus-within:border-indigo-600 dark:focus-within:border-indigo-500 shadow-inner">
                      <input
                        type="number"
                        min={1}
                        value={calcQty}
                        onChange={(e) =>
                          setCalcQty(Math.max(1, Number(e.target.value) || 1))
                        }
                        className="w-full bg-transparent text-sm font-bold text-zinc-900 dark:text-zinc-100 outline-none font-mono"
                      />
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{product.unit}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] text-zinc-400">Calculated Unit Price</div>
                    <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                      ETB {currentUnitPrice.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Bulk Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10.5px] text-zinc-500 dark:text-zinc-400 font-medium">Quick Qty:</span>
                  {Array.from(
                    new Set([product.moq || 1, 25, 50, 100, 250, 500, 1000, 5000].filter((v): v is number => typeof v === "number" && v > 0))
                  )
                    .sort((a, b) => a - b)
                    .map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setCalcQty(preset)}
                        className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all ${
                          calcQty === preset
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {preset === product.moq ? `MOQ (${product.moq})` : preset.toLocaleString()}
                      </button>
                    ))}
                </div>
              </div>

              <div className="pt-2.5 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-500 dark:text-zinc-400">Total Purchase Value:</span>
                <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  ETB {wholesaleTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Buttons: Primary Buy & Prominent Bargain */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => onOpenCheckout(product, calcQty, currentUnitPrice)}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/25 hover:scale-[1.01]"
              >
                <ShoppingCart className="w-4 h-4" />
                Buy (Proceed to Checkout)
              </button>

              <button
                onClick={() => onOpenNegotiate(product)}
                className="w-full py-3 rounded-xl bg-amber-50 dark:bg-zinc-800/80 hover:bg-amber-100 dark:hover:bg-zinc-700 text-amber-800 dark:text-amber-300 font-bold text-sm border border-amber-300 dark:border-amber-500/30 hover:border-amber-500 flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <Handshake className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Negotiate Bulk Price (Submit Counter Proposal)
              </button>
            </div>

            {/* Buyer Protection Guarantee Note */}
            <div className="pt-2 flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
              <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                Protected by MercatoX Escrow via Chapa: Funds locked until warehouse OTP handover.
              </span>
            </div>
          </div>

          {/* Related Commodities from this Category / Supplier */}
          {relatedProducts.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3.5 shadow-xs">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Related Wholesale Commodities
              </h3>
              <div className="space-y-2.5">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectProduct?.(rel)}
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 bg-zinc-50/50 dark:bg-zinc-950/40 cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <img
                      src={rel.images[0]}
                      alt={rel.name}
                      className="w-12 h-12 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {rel.name}
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold mt-0.5">
                        ETB {rel.baseWholesalePrice.toLocaleString()}/{rel.unit}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal (Click to View Ultra High-Resolution Image) */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-5 right-5 p-2.5 rounded-xl bg-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-700 transition-colors z-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-zinc-700 shadow-2xl">
            <img
              src={product.images[activeImageIdx] || product.images[0]}
              alt={product.name}
              className="w-full h-auto max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

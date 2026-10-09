"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  Grid,
  List,
  Handshake,
  ShoppingCart,
  ShieldCheck,
  Building2,
  MapPin,
  Star,
  Truck,
  TrendingDown,
  Layers,
  ArrowUpDown,
  PlusCircle,
  FileQuestion,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  Package,
  Eye,
  KeyRound,
  DollarSign,
  Boxes,
  Lock,
  ArrowRight,
  BadgePercent,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X,
  RefreshCw,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  SourcingProduct,
  SourcingNegotiation,
  SourcingOrder,
} from "@/types/supplier";
import { useSupplierStore } from "@/store/supplier-store";
import { useAuthStore } from "@/store/auth-store";
import { SupplierSourcingProductDetailView } from "./supplier-sourcing-product-detail-view";
import { SupplierSourcingCheckoutView } from "./supplier-sourcing-checkout-view";
import { SupplierSourcingNegotiateModal } from "./supplier-sourcing-negotiate-modal";
import { SupplierSourcingPaymentModal } from "./supplier-sourcing-payment-modal";
import { SupplierSourcingRFQModal } from "./supplier-sourcing-rfq-modal";
import { SupplierMyOrdersView } from "./supplier-my-orders-view";
import { toast } from "sonner";
import { getAccurateProductImage } from "@/lib/utils/product-image";

export function SupplierSourcingView() {
  const { user } = useAuthStore();
  const {
    profile,
    products: myOwnProducts,
    sourcingProducts,
    isLoadingSourcingProducts,
    sourcingProductsError,
    fetchSourcingProducts,
    sourcingNegotiations,
    sourcingOrders,
    confirmSourcingDelivery,
  } = useSupplierStore();

  // Fetch real products from backend database on mount
  useEffect(() => {
    fetchSourcingProducts();
  }, [fetchSourcingProducts]);

  // Selected full-page product detail
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<SourcingProduct | null>(null);

  // Sub-tabs: "market" | "negotiations" | "orders"
  const [activeSubTab, setActiveSubTab] = useState<"market" | "negotiations" | "orders">("market");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedOrigin, setSelectedOrigin] = useState<string>("all");
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(300000);
  const [sortBy, setSortBy] = useState<"featured" | "price_low" | "price_high" | "rating" | "moq">("featured");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modals state
  const [negotiateProduct, setNegotiateProduct] = useState<SourcingProduct | null>(null);
  const [activeExistingNegotiation, setActiveExistingNegotiation] = useState<SourcingNegotiation | null>(null);

  const [checkoutData, setCheckoutData] = useState<{
    product?: SourcingProduct | null;
    negotiation?: SourcingNegotiation | null;
    qty?: number;
    unitPrice?: number;
  } | null>(null);

  const [paymentOrder, setPaymentOrder] = useState<SourcingOrder | null>(null);
  const [isRFQOpen, setIsRFQOpen] = useState(false);

  // Delivery OTP confirmation state
  const [otpConfirmOrder, setOtpConfirmOrder] = useState<SourcingOrder | null>(null);
  const [enteredOtp, setEnteredOtp] = useState("");

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    sourcingProducts.forEach((p) => set.add(p.category));
    return ["all", ...Array.from(set)];
  }, [sourcingProducts]);

  // Filtered & Sorted products (excludes own products so only other sellers' goods appear)
  const filteredProducts = useMemo(() => {
    return sourcingProducts
      .filter((p) => {
        // Exclude the current supplier's own products (only show products from other suppliers)
        const currentUserId = user?.id;
        const myBusinessName = profile?.businessName?.toLowerCase().trim();
        if (currentUserId && p.supplierId === currentUserId) return false;
        if (myBusinessName && p.supplierName?.toLowerCase().trim() === myBusinessName) return false;
        if (
          myOwnProducts?.some(
            (myP) => myP.id === p.id || (myP.sku && p.sku && myP.sku.toLowerCase() === p.sku.toLowerCase())
          )
        ) {
          return false;
        }

        if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
        if (selectedOrigin !== "all" && !p.origin.toLowerCase().includes(selectedOrigin.toLowerCase())) {
          return false;
        }
        if (p.baseWholesalePrice > maxPriceFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchSku = p.sku.toLowerCase().includes(q);
          const matchOrigin = p.origin.toLowerCase().includes(q);
          const matchSupplier = p.supplierName.toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          if (!matchName && !matchSku && !matchOrigin && !matchSupplier && !matchCat) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_low") return a.baseWholesalePrice - b.baseWholesalePrice;
        if (sortBy === "price_high") return b.baseWholesalePrice - a.baseWholesalePrice;
        if (sortBy === "rating") return b.supplierRating - a.supplierRating;
        if (sortBy === "moq") return a.moq - b.moq;
        return 0; // featured
      });
  }, [
    sourcingProducts,
    selectedCategory,
    selectedOrigin,
    maxPriceFilter,
    searchQuery,
    sortBy,
    user?.id,
    profile?.businessName,
    myOwnProducts,
  ]);

  // KPI Calculations
  const activeNegotiationsCount = sourcingNegotiations.filter(
    (n) => n.status === "pending_seller" || n.status === "counter_offered" || n.status === "agreed"
  ).length;

  const inTransitOrdersCount = sourcingOrders.filter(
    (o) => o.status === "in_transit" || o.status === "dispatched" || o.status === "processing"
  ).length;

  const totalSourcedValueETB = sourcingOrders.reduce((acc, o) => acc + o.totalETB, 0);

  const handleOpenNegotiate = (product: SourcingProduct) => {
    setNegotiateProduct(product);
  };

  const handleOpenCheckout = (product: SourcingProduct, qty: number, unitPrice: number) => {
    setCheckoutData({
      product,
      qty,
      unitPrice,
    });
  };

  const handleProceedToPayment = (order: SourcingOrder) => {
    setCheckoutData(null);
    setPaymentOrder(order);
  };

  const handleNegotiationProceedToCheckout = (neg: SourcingNegotiation) => {
    setActiveExistingNegotiation(null);
    setCheckoutData({
      negotiation: neg,
      qty: neg.targetQuantity,
      unitPrice: neg.agreedPricePerUnit || neg.sellerCounterPricePerUnit || neg.proposedPricePerUnit,
    });
  };

  const handleVerifyOtp = () => {
    if (!otpConfirmOrder) return;
    confirmSourcingDelivery(otpConfirmOrder.id, enteredOtp);
    setOtpConfirmOrder(null);
    setEnteredOtp("");
  };

  // If full-page checkout view is active, render it directly within the portal layout!
  if (checkoutData) {
    return (
      <SupplierSourcingCheckoutView
        product={checkoutData.product}
        negotiation={checkoutData.negotiation}
        initialQty={checkoutData.qty}
        initialUnitPrice={checkoutData.unitPrice}
        onBack={() => setCheckoutData(null)}
        onOrderCompleted={(order) => {
          setCheckoutData(null);
          setSelectedProductForDetail(null);
          setActiveSubTab("orders");
        }}
      />
    );
  }

  // If full-page detail view is active, render it directly within the portal layout!
  if (selectedProductForDetail) {
    return (
      <div className="space-y-6">
        <SupplierSourcingProductDetailView
          product={selectedProductForDetail}
          onBack={() => setSelectedProductForDetail(null)}
          onOpenNegotiate={(p) => setNegotiateProduct(p)}
          onOpenCheckout={(p, qty, unitPrice) =>
            setCheckoutData({ product: p, qty, unitPrice })
          }
          onOpenRFQ={() => setIsRFQOpen(true)}
          onSelectProduct={(p) => setSelectedProductForDetail(p)}
        />

        {/* Modals triggered from full product detail */}
        {negotiateProduct && (
          <SupplierSourcingNegotiateModal
            product={negotiateProduct}
            onClose={() => setNegotiateProduct(null)}
            onProceedToCheckout={handleNegotiationProceedToCheckout}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">
            <span>B2B Procurement Hub</span>
            <span>•</span>
            <span>MercatoX Verified Sourcing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-3">
            Sourcing & Procurement Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
            Discover bulk agro-commodities and industrial supplies directly from verified producers across Ethiopia,
            negotiate volume prices, and complete secure Escrow orders via Chapa.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsRFQOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 hover:scale-[1.02]"
          >
            <FileQuestion className="w-4 h-4" />
            Broadcast Custom RFQ
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 shadow-xs dark:shadow-none backdrop-blur-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Marketplace Catalog</span>
            <Boxes className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">
            {sourcingProducts.length} <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">Items</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Direct Origin Guaranteed</div>
        </div>

        <div
          onClick={() => setActiveSubTab("negotiations")}
          className="p-4 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 hover:border-amber-500/50 shadow-xs dark:shadow-none backdrop-blur-sm space-y-1 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Price Negotiations</span>
            <Handshake className="w-4 h-4 text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-300 font-mono">
            {activeNegotiationsCount}{" "}
            <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">Active</span>
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            {sourcingNegotiations.filter((n) => n.status === "counter_offered").length} Counter-Offers Received
          </div>
        </div>

        <div
          onClick={() => setActiveSubTab("orders")}
          className="p-4 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 hover:border-emerald-500/50 shadow-xs dark:shadow-none backdrop-blur-sm space-y-1 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>In-Transit Deliveries</span>
            <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-300 font-mono">
            {inTransitOrdersCount}{" "}
            <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">Shipments</span>
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">En Route to Receiving Hubs</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 shadow-xs dark:shadow-none backdrop-blur-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Protected Escrow Volume</span>
            <Lock className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-cyan-300 font-mono">
            ETB {(totalSourcedValueETB / 1000).toFixed(0)}k
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">100% Chapa Trust Vault</div>
        </div>
      </div>

      {/* Sub-Tabs Bar */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-0">
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-0">
          <button
            onClick={() => setActiveSubTab("market")}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeSubTab === "market"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Search className="w-4 h-4" />
            Explore Wholesale Market
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold">
              {filteredProducts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("negotiations")}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeSubTab === "negotiations"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <Handshake className="w-4 h-4" />
            Active Negotiations & Offers
            {activeNegotiationsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
                {activeNegotiationsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab("orders")}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeSubTab === "orders"
                ? "border-emerald-600 text-emerald-600 dark:border-emerald-500 dark:text-emerald-400"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Procurement Orders & Inbound
            {sourcingOrders.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                {sourcingOrders.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: EXPLORE WHOLESALE MARKET */}
      {activeSubTab === "market" && (
        <div className="space-y-5">
          {/* Search, Category Filter & Sorting Toolbar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 space-y-3.5 shadow-sm dark:shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by commodity name, SKU, origin, category, or supplier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-indigo-600 dark:focus:border-indigo-500 shadow-inner"
                />
              </div>

              {/* Sort, Refresh & View Mode */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => fetchSourcingProducts()}
                  disabled={isLoadingSourcingProducts}
                  className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/50 transition-colors disabled:opacity-50"
                  title="Refresh products from database"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingSourcingProducts ? "animate-spin text-indigo-600 dark:text-indigo-400" : ""}`} />
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 outline-none focus:border-indigo-500"
                >
                  <option value="featured">Sort: Recommended</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Supplier Rating</option>
                  <option value="moq">Low MOQ First</option>
                </select>

                <div className="flex items-center rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === "grid"
                        ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                        : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === "table"
                        ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                        : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-zinc-500 text-[11px] font-semibold shrink-0 uppercase">Category:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl border shrink-0 font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 font-bold"
                      : "bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  {cat === "all" ? "All Categories" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Database Loading State */}
          {isLoadingSourcingProducts && sourcingProducts.length === 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-2.5 sm:gap-3.5 lg:gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white dark:bg-[#0d121d] border border-zinc-200 dark:border-zinc-800/80 p-3 space-y-3 animate-pulse overflow-hidden"
                >
                  <div className="aspect-4/3 w-full bg-zinc-200 dark:bg-zinc-800/60 rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-3 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-3 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-5 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded pt-2" />
                    <div className="h-8 w-full bg-zinc-200 dark:bg-zinc-800 rounded-xl mt-2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Database Error Banner */}
          {!isLoadingSourcingProducts && sourcingProductsError && sourcingProducts.length === 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-rose-800 dark:text-rose-300 text-xs">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{sourcingProductsError}</span>
              </div>
              <button
                onClick={() => fetchSourcingProducts()}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shrink-0"
              >
                Retry Database Connection
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoadingSourcingProducts && filteredProducts.length === 0 && sourcingProducts.length > 0 && (
            <div className="text-center py-16 px-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-200 dark:border-indigo-800/40">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">No Matching Wholesale Commodities</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                No items match your selected filters. Try searching for a different keyword or reset filters to see all available inventory.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedOrigin("all");
                    setMaxPriceFilter(300000);
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => setIsRFQOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
                >
                  Broadcast Custom RFQ
                </button>
              </div>
            </div>
          )}

          {/* GRID VIEW: MODERN 5-COLUMN (DESKTOP) & 2-COLUMN (MOBILE) PRODUCT CARDS */}
          {viewMode === "grid" && filteredProducts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-2.5 sm:gap-3.5 lg:gap-4">
              {filteredProducts.map((p) => {
                const maxTierDiscount =
                  p.tierPricing.length > 1
                    ? p.tierPricing[p.tierPricing.length - 1].discountPercentage
                    : null;

                return (
                  <div
                    key={p.id}
                    className="group rounded-2xl bg-white dark:bg-[#0d121d] border border-zinc-200 dark:border-zinc-800/90 hover:border-indigo-500/50 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-0.5 backdrop-blur-md relative h-full"
                  >
                    {/* Product Image & Badges */}
                    <div
                      onClick={() => setSelectedProductForDetail(p)}
                      className="relative aspect-4/3 w-full bg-zinc-100 dark:bg-zinc-950 overflow-hidden cursor-pointer"
                    >
                      <img
                        src={getAccurateProductImage(p.name, p.category, p.images?.[0])}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = getAccurateProductImage(p.name, p.category);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-black/30 opacity-70 group-hover:opacity-40 transition-opacity" />

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-black/80 text-zinc-100 backdrop-blur-md border border-white/10 shadow-xs">
                          {p.category}
                        </span>
                        {p.isEscrowGuaranteed && (
                          <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-emerald-950/90 text-emerald-400 backdrop-blur-md border border-emerald-500/30 flex items-center gap-0.5 shadow-xs">
                            <ShieldCheck className="w-3 h-3" /> Escrow
                          </span>
                        )}
                      </div>

                      {/* Tier Discount Pill */}
                      {maxTierDiscount && (
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 shadow-xs">
                          -{maxTierDiscount}%
                        </div>
                      )}

                      {/* Bottom Image Overlay Tag */}
                      <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[9.5px] text-zinc-200">
                        <span className="flex items-center gap-0.5 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-zinc-200 truncate max-w-[85px] sm:max-w-[110px]">
                          <MapPin className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                          <span className="truncate">{p.origin.split(",")[0]}</span>
                        </span>
                        <span className="bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded font-mono text-zinc-200 shrink-0">
                          MOQ: {p.moq}
                        </span>
                      </div>
                    </div>

                    {/* Compact Card Body */}
                    <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between space-y-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 truncate max-w-[110px]">
                            {p.grade}
                          </span>
                          <span className="flex items-center text-amber-500 dark:text-amber-400 font-bold text-[10.5px]">
                            <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                            {p.supplierRating.toFixed(1)}
                          </span>
                        </div>

                        <h3
                          onClick={() => setSelectedProductForDetail(p)}
                          className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors leading-snug min-h-[2.1rem]"
                          title={p.name}
                        >
                          {p.name}
                        </h3>

                        <div className="flex items-center gap-1 text-[10.5px] text-zinc-500 dark:text-zinc-400">
                          <Building2 className="w-3 h-3 text-zinc-400 dark:text-zinc-500 shrink-0" />
                          <span className="truncate">{p.supplierName}</span>
                        </div>
                      </div>

                      {/* Pricing Section */}
                      <div className="pt-1.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-baseline justify-between">
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-extrabold text-indigo-600 dark:text-emerald-400 font-mono tracking-tight truncate">
                            ETB {p.baseWholesalePrice.toLocaleString()}{" "}
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">/{p.unit}</span>
                          </div>
                        </div>

                        <div className="text-right text-[10px] text-zinc-500 font-mono hidden sm:block shrink-0">
                          Stock: {p.stockQuantity.toLocaleString()}
                        </div>
                      </div>

                      {/* Single Action Button: Buy (Bargain moved to detail page) */}
                      <div className="pt-0.5">
                        <button
                          onClick={() => handleOpenCheckout(p, p.moq, p.baseWholesalePrice)}
                          className="w-full py-1.5 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 hover:scale-[1.01]"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Buy</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TABLE VIEW OF SOURCING PRODUCTS */}
          {viewMode === "table" && filteredProducts.length > 0 && (
            <div className="rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 overflow-hidden shadow-sm dark:shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
                  <thead className="bg-zinc-50 dark:bg-zinc-950/80 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="p-3.5 pl-4">Commodity / Item</th>
                      <th className="p-3.5">Origin & Grade</th>
                      <th className="p-3.5">Supplier</th>
                      <th className="p-3.5">MOQ & Stock</th>
                      <th className="p-3.5">Wholesale Price (ETB)</th>
                      <th className="p-3.5 text-right pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="p-3.5 pl-4 flex items-center gap-3">
                          <img
                            src={getAccurateProductImage(p.name, p.category, p.images?.[0])}
                            alt={p.name}
                            className="w-11 h-11 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 shrink-0 cursor-pointer hover:opacity-80"
                            onClick={() => setSelectedProductForDetail(p)}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = getAccurateProductImage(p.name, p.category);
                            }}
                          />
                          <div className="min-w-0">
                            <span
                              onClick={() => setSelectedProductForDetail(p)}
                              className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer block truncate text-sm"
                            >
                              {p.name}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">SKU: {p.sku}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-zinc-900 dark:text-zinc-200">{p.origin}</div>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{p.grade}</span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-zinc-900 dark:text-zinc-200">{p.supplierName}</div>
                          <span className="text-[10px] text-amber-500 dark:text-amber-400 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {p.supplierRating.toFixed(1)}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-zinc-900 dark:text-zinc-200">
                            MOQ: {p.moq} {p.unit}
                          </div>
                          <span className="text-[10px] text-zinc-500">
                            Stock: {p.stockQuantity.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                          ETB {p.baseWholesalePrice.toLocaleString()}/{p.unit}
                        </td>
                        <td className="p-3.5 text-right pr-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedProductForDetail(p)}
                              className="px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-medium text-xs flex items-center gap-1 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </button>
                            <button
                              onClick={() => handleOpenCheckout(p, p.moq, p.baseWholesalePrice)}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              Buy
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE PRICE NEGOTIATIONS */}
      {activeSubTab === "negotiations" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Outgoing Price Bargaining Sessions
            </h3>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {sourcingNegotiations.length} Active Sessions
            </span>
          </div>

          <div className="space-y-3">
            {sourcingNegotiations.map((neg) => (
              <div
                key={neg.id}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm dark:shadow-lg"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <img
                    src={getAccurateProductImage(neg.productName, neg.productUnit, neg.productImage)}
                    alt=""
                    className="w-14 h-14 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = getAccurateProductImage(neg.productName, neg.productUnit);
                    }}
                  />
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        #{neg.negotiationCode}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          neg.status === "counter_offered"
                            ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/40 animate-pulse"
                            : neg.status === "agreed"
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40"
                            : neg.status === "declined"
                            ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/40"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {neg.status === "counter_offered"
                          ? "Counter-Offer Received"
                          : neg.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>

                    <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                      {neg.productName}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Supplier: <strong className="text-zinc-800 dark:text-zinc-200">{neg.supplierName}</strong> • Qty:{" "}
                      <strong className="text-zinc-800 dark:text-zinc-200">
                        {neg.targetQuantity} {neg.productUnit}
                      </strong>
                    </p>
                  </div>
                </div>

                {/* Financial Comparison */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs w-full md:w-auto bg-zinc-50 dark:bg-zinc-950/60 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800/80">
                  <div>
                    <div className="text-[10px] text-zinc-500">Listed Price</div>
                    <div className="font-mono font-medium text-zinc-400 line-through">
                      ETB {neg.listedPricePerUnit.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500">Your Offer</div>
                    <div className="font-mono font-bold text-zinc-900 dark:text-zinc-200">
                      ETB {neg.proposedPricePerUnit.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                      {neg.sellerCounterPricePerUnit ? "Counter Offer" : "Status"}
                    </div>
                    <div className="font-mono font-bold text-amber-600 dark:text-amber-300">
                      {neg.sellerCounterPricePerUnit
                        ? `ETB ${neg.sellerCounterPricePerUnit.toLocaleString()}`
                        : "Pending..."}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                  <button
                    onClick={() => setActiveExistingNegotiation(neg)}
                    className="px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Chat / Thread ({neg.messages.length})
                  </button>

                  {neg.status === "counter_offered" && (
                    <button
                      onClick={() => handleNegotiationProceedToCheckout(neg)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Accept & Checkout
                    </button>
                  )}

                  {neg.status === "agreed" && (
                    <button
                      onClick={() => handleNegotiationProceedToCheckout(neg)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Checkout PO
                    </button>
                  )}
                </div>
              </div>
            ))}

            {sourcingNegotiations.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 space-y-2">
                <Handshake className="w-8 h-8 text-zinc-400 mx-auto" />
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-300">No active price negotiations</p>
                <p className="text-xs text-zinc-500">
                  Open any commodity detail page and submit a counter proposal to start a bulk negotiation session.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PROCUREMENT ORDERS & INBOUND TRACKER */}
      {activeSubTab === "orders" && (
        <SupplierMyOrdersView onNavigateToSourcing={() => setActiveSubTab("market")} />
      )}

      {/* MODAL: Negotiate Modal (New or Existing) */}
      {(negotiateProduct || activeExistingNegotiation) && (
        <SupplierSourcingNegotiateModal
          product={negotiateProduct}
          existingNegotiation={activeExistingNegotiation}
          onClose={() => {
            setNegotiateProduct(null);
            setActiveExistingNegotiation(null);
          }}
          onProceedToCheckout={handleNegotiationProceedToCheckout}
        />
      )}

      {/* MODAL: Payment Modal */}
      {paymentOrder && (
        <SupplierSourcingPaymentModal
          order={paymentOrder}
          onClose={() => setPaymentOrder(null)}
        />
      )}

      {/* MODAL: Broadcast RFQ Modal */}
      {isRFQOpen && <SupplierSourcingRFQModal onClose={() => setIsRFQOpen(false)} />}

      {/* MODAL: Handover OTP Confirmation Modal */}
      {otpConfirmOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-white dark:bg-[#0d121d] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5 text-zinc-900 dark:text-zinc-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <KeyRound className="w-5 h-5" />
                Confirm Warehouse Inspection
              </h3>
              <button
                onClick={() => setOtpConfirmOrder(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
              <p>
                Have you physically inspected and counted the shipment for{" "}
                <strong>{otpConfirmOrder.productName}</strong> at {otpConfirmOrder.destinationWarehouseName}?
              </p>
              <p className="text-zinc-500 dark:text-zinc-400">
                Enter your 4-digit Handover OTP (default <code className="text-emerald-600 dark:text-emerald-400 font-bold">8492</code> / <code className="text-emerald-600 dark:text-emerald-400 font-bold">3194</code>) to authorize the release of Escrow payment to {otpConfirmOrder.supplierName}.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Enter Handover OTP</label>
              <input
                type="text"
                maxLength={4}
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                placeholder="4-digit OTP"
                className="w-full text-center text-2xl font-mono font-bold tracking-widest rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 py-3 outline-none focus:border-indigo-600 dark:focus:border-emerald-500 text-indigo-600 dark:text-emerald-400"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setOtpConfirmOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOtp}
                disabled={enteredOtp.length < 4}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs disabled:opacity-40 transition-all shadow-md"
              >
                Authorize & Release Escrow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

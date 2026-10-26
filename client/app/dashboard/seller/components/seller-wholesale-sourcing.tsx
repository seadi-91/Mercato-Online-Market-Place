"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Boxes,
  Warehouse,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ShoppingCart,
  Plus,
  Minus,
  Search,
  Filter,
  Sparkles,
  Clock,
  TrendingDown,
  ExternalLink,
  Eye,
  FileText,
  Send,
  X,
  Store,
  Check,
  RefreshCw,
  Package,
  Star,
  ChevronRight,
  Shield,
  Layers,
  ArrowRight,
  MapPin,
  Award,
  Percent,
} from "lucide-react";
import { fetchAllProducts } from "@/lib/api/catalog";
import type { Product, ProductTierPrice } from "@/constants/mock-data";
import { isWholesaleProduct, getProductTradeInfo } from "@/lib/product-classification";
import { initialSourcingProducts } from "@/data/supplier-sourcing-data";
import type { SourcingProduct } from "@/types/supplier";
import { useWholesaleCartStore } from "@/store/wholesale-cart-store";
import { useThemeStore } from "@/store/theme-store";
import { toast } from "sonner";

function getHighResImageUrl(url: string | undefined): string {
  if (!url) return "";
  if (url.includes("images.unsplash.com")) {
    return url.replace(/w=\d+/, "w=1600").replace(/q=\d+/, "q=95");
  }
  return url;
}

/**
 * Maps authentic Ethiopian B2B sourcing products to the Product type
 */
function mapSourcingProductToProduct(sp: SourcingProduct): Product {
  const tiers: ProductTierPrice[] = (sp.tierPricing || []).map((tp) => ({
    id: tp.id,
    minQuantity: tp.minQty,
    maxQuantity: tp.maxQty ?? null,
    discountedPricePerUnit: tp.unitPrice,
    savingsPercentage: tp.discountPercentage,
  }));

  const retailPrice = sp.retailPrice || Math.round(sp.baseWholesalePrice * 1.15);

  return {
    id: sp.id,
    sellerId: sp.supplierId,
    name: sp.name,
    slug: sp.sku ? sp.sku.toLowerCase() : sp.id,
    category: sp.category,
    categorySlug: sp.categorySlug || sp.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    price: retailPrice,
    originalPrice: retailPrice,
    wholesalePrice: sp.baseWholesalePrice,
    rating: sp.supplierRating || 4.9,
    reviewCount: sp.supplierRatingCount || 85,
    shopName: sp.supplierName,
    marketZone: sp.supplierMarketZone || "Mercato Wholesale Logistics Terminal, Addis Ababa",
    isVerifiedSeller: sp.supplierVerified ?? true,
    stock: sp.stockQuantity,
    badge: "Escrow Verified",
    description: sp.description,
    image: sp.images?.[0] || "",
    gallery: sp.images || [],
    specifications: sp.specifications || {},
    tags: [sp.category, sp.origin || "Ethiopia", "Wholesale Cargo", "ECX"],
    sku: sp.sku,
    brand: sp.brand,
    origin: sp.origin,
    grade: sp.grade,
    warehouseLocation: sp.warehouseLocation,
    unit: sp.unit,
    moq: sp.moq,
    minOrderQuantity: sp.moq,
    leadTimeDays: sp.leadTimeDays,
    certifications: sp.certifications,
    tieredPricing: tiers,
  };
}

export function SellerWholesaleSourcing() {
  const router = useRouter();
  const addWholesaleItem = useWholesaleCartStore((state) => state.addItem);
  const wholesaleCartCount = useWholesaleCartStore((state) => state.getTotalItems());
  const wholesaleCartAmount = useWholesaleCartStore((state) => state.getTotalAmount());
  const { theme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted ? theme === "light" : false;

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedMoqRange, setSelectedMoqRange] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"savings" | "price-asc" | "price-desc" | "moq-asc">("savings");

  // Quantity selection per product
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  // RFQ Quote modal
  const [selectedRfqProduct, setSelectedRfqProduct] = useState<Product | null>(null);
  const [rfqQuantity, setRfqQuantity] = useState("500");
  const [rfqDeliveryDepot, setRfqDeliveryDepot] = useState("Mercato Central Depot, Addis Ababa");
  const [rfqNotes, setRfqNotes] = useState("");
  const [isSubmittingRfq, setIsSubmittingRfq] = useState(false);

  // Strictly load authentic wholesale products (MOQ > 1, bulk cargo units, volume tiers)
  useEffect(() => {
    let isSubscribed = true;

    async function loadWholesaleCargo() {
      try {
        setLoading(true);
        const prodRes = await fetchAllProducts({ limit: 100 });

        if (isSubscribed) {
          const pool = prodRes.products || [];

          // Strictly filter products that genuinely qualify as wholesale:
          // Must qualify via isWholesaleProduct AND have bulk MOQ > 1 or tiered pricing or distinct wholesale price
          const genuineCatalogWholesale = pool.filter((p) => {
            const isWholesale = isWholesaleProduct(p);
            const moq = p.moq || p.minOrderQuantity || 1;
            const hasTiers = Boolean(p.tieredPricing && p.tieredPricing.length > 0);
            const hasWholesalePrice = Boolean(
              p.wholesalePrice && p.wholesalePrice > 0 && p.wholesalePrice !== p.price
            );
            return isWholesale && (moq > 1 || hasTiers || hasWholesalePrice);
          });

          // Combine with authentic sourcing commodities
          const mappedSourcing = initialSourcingProducts.map(mapSourcingProductToProduct);

          const combinedMap = new Map<string, Product>();
          // Authentic B2B commodities first
          mappedSourcing.forEach((p) => combinedMap.set(p.id, p));
          // Plus any verified wholesale products from backend catalog
          genuineCatalogWholesale.forEach((p) => {
            if (!combinedMap.has(p.id)) {
              combinedMap.set(p.id, p);
            }
          });

          const finalProducts = Array.from(combinedMap.values());
          setProducts(finalProducts);

          // Initialize default quantities to each product's MOQ
          const initialQtys: Record<string, number> = {};
          finalProducts.forEach((p) => {
            initialQtys[p.id] = p.moq && p.moq > 1 ? p.moq : 10;
          });
          setQuantities(initialQtys);
        }
      } catch (err) {
        console.warn("Could not load wholesale supplier products:", err);
        if (isSubscribed) {
          const fallback = initialSourcingProducts.map(mapSourcingProductToProduct);
          setProducts(fallback);
          const initialQtys: Record<string, number> = {};
          fallback.forEach((p) => {
            initialQtys[p.id] = p.moq && p.moq > 1 ? p.moq : 10;
          });
          setQuantities(initialQtys);
        }
      } finally {
        if (isSubscribed) setLoading(false);
      }
    }

    loadWholesaleCargo();

    return () => {
      isSubscribed = false;
    };
  }, []);

  // Compute dynamic categories strictly from wholesale products inventory
  const wholesaleCategories = useMemo(() => {
    const catMap = new Map<string, { id: string; name: string; slug: string; count: number }>();
    products.forEach((p) => {
      const slug = p.categorySlug || p.category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const existing = catMap.get(slug);
      if (existing) {
        existing.count += 1;
      } else {
        catMap.set(slug, {
          id: slug,
          name: p.category,
          slug,
          count: 1,
        });
      }
    });
    return Array.from(catMap.values());
  }, [products]);

  // Filtered & sorted products (Wholesale only)
  const filteredProducts = useMemo(() => {
    let result = products;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.shopName && p.shopName.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.origin && p.origin.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== "ALL") {
      result = result.filter(
        (p) =>
          p.categorySlug === selectedCategory ||
          p.category.toLowerCase() === selectedCategory.toLowerCase() ||
          p.category.toLowerCase().replace(/[^a-z0-9]+/g, "-") === selectedCategory
      );
    }

    if (selectedMoqRange !== "ALL") {
      if (selectedMoqRange === "small") {
        result = result.filter((p) => (p.moq || 1) <= 15);
      } else if (selectedMoqRange === "medium") {
        result = result.filter((p) => (p.moq || 1) > 15 && (p.moq || 1) <= 50);
      } else if (selectedMoqRange === "large") {
        result = result.filter((p) => (p.moq || 1) > 50);
      }
    }

    return [...result].sort((a, b) => {
      const tradeA = getProductTradeInfo(a);
      const tradeB = getProductTradeInfo(b);

      if (sortBy === "savings") {
        return (tradeB.savingsPercent || 0) - (tradeA.savingsPercent || 0);
      }
      if (sortBy === "price-asc") {
        return (tradeA.wholesalePrice || a.price) - (tradeB.wholesalePrice || b.price);
      }
      if (sortBy === "price-desc") {
        return (tradeB.wholesalePrice || b.price) - (tradeA.wholesalePrice || a.price);
      }
      if (sortBy === "moq-asc") {
        return (a.moq || 1) - (b.moq || 1);
      }
      return 0;
    });
  }, [products, searchQuery, selectedCategory, selectedMoqRange, sortBy]);

  // Quantity helpers
  const handleQuantityChange = (productId: string, val: number, minMoq: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(minMoq, val),
    }));
  };

  const handleAddToCart = (product: Product, isBuyNow = false) => {
    const moq = product.moq && product.moq > 1 ? product.moq : 10;
    const qty = quantities[product.id] || moq;
    const tradeInfo = getProductTradeInfo(product);

    let unitPrice = tradeInfo.wholesalePrice || product.wholesalePrice || product.price;
    let savingsPct = tradeInfo.savingsPercent || 0;

    if (product.tieredPricing && product.tieredPricing.length > 0) {
      const matchedTier = product.tieredPricing
        .filter((t) => qty >= t.minQuantity)
        .sort((a, b) => b.minQuantity - a.minQuantity)[0];
      if (matchedTier) {
        unitPrice = matchedTier.discountedPricePerUnit;
        if (product.price > 0 && unitPrice < product.price) {
          savingsPct = Math.round(((product.price - unitPrice) / product.price) * 100);
        }
      }
    }

    addWholesaleItem({
      id: product.id,
      name: product.name,
      price: unitPrice,
      originalPrice: product.price,
      image: product.image,
      supplierShopName: product.shopName,
      category: product.category,
      moq,
      unit: product.unit || tradeInfo.unit || "unit",
      quantity: qty,
      savingsPercent: savingsPct,
      marketZone: product.marketZone,
    });

    if (isBuyNow) {
      router.push("/dashboard/seller/wholesale-checkout");
    } else {
      setAddedMap((prev) => ({ ...prev, [product.id]: true }));
      toast.success("Wholesale Cargo Added to Cart!", {
        description: `Added ${qty} ${product.unit || "units"} of ${product.name} at ETB ${unitPrice.toLocaleString()}/unit.`,
      });
      setTimeout(() => {
        setAddedMap((prev) => ({ ...prev, [product.id]: false }));
      }, 1500);
    }
  };

  const handleOpenRfq = (product: Product) => {
    setSelectedRfqProduct(product);
    setRfqQuantity(String(product.moq || 100));
    setIsRfqOpen(true);
  };

  const handleSubmitRfq = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRfq(true);
    setTimeout(() => {
      setIsSubmittingRfq(false);
      setIsRfqOpen(false);
      toast.success("Commercial Wholesale RFQ Dispatched!", {
        description: `Supplier quotation request for ${rfqQuantity} units submitted under Escrow protection.`,
      });
    }, 1000);
  };

  const isRfqOpenState = Boolean(selectedRfqProduct);
  const setIsRfqOpen = (open: boolean) => {
    if (!open) setSelectedRfqProduct(null);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Sourcing Hub Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/90 via-slate-900 to-indigo-950/70 p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/15 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-violet-600/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold uppercase tracking-wider shadow-inner">
              <Boxes className="w-4 h-4 text-indigo-400" />
              <span>Merchant B2B Restocking & Wholesale Cargo Portal</span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Direct Bulk Wholesale Cargo from Verified Ethiopian Suppliers
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Source authentic commodities, industrial goods, construction supplies, and agricultural harvests at factory & farm gate rates. Every order is 100% safeguarded in Commercial Bank of Ethiopia (CBE) Escrow until delivery is confirmed.
            </p>

            <div className="flex items-center gap-4 pt-2 flex-wrap text-xs font-semibold text-zinc-200">
              <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>CBE Fiduciary Escrow Vault</span>
              </span>
              <span className="flex items-center gap-1.5 text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                <Truck className="w-4 h-4 text-indigo-400" />
                <span>Direct Warehouse Cargo Dispatch</span>
              </span>
              <span className="flex items-center gap-1.5 text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Volume Tier Discounts (Up to 25% Off)</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => router.push("/sellers")}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Store className="w-4 h-4" />
              <span>Browse Supplier Stores Directory</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/seller/wholesale-checkout")}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-zinc-100 text-xs font-semibold backdrop-blur-md transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 text-indigo-400" />
              <span>Wholesale Cart ({wholesaleCartCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sourcing Search & Filters Bar */}
      <div className="rounded-2xl border border-white/10 bg-[#0d121f]/90 p-4 sm:p-5 shadow-lg backdrop-blur-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search coffee beans, teff, sesame, steel rebars, cement, oil..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl text-xs sm:text-sm border border-white/15 bg-white/[0.04] text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* MOQ Range & Sort Filter */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <select
              value={selectedMoqRange}
              onChange={(e) => setSelectedMoqRange(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl text-xs border border-white/15 bg-[#141824] text-zinc-200 outline-none font-semibold cursor-pointer focus:border-indigo-500"
            >
              <option value="ALL">All MOQ Lot Sizes</option>
              <option value="small">Low MOQ (≤ 15 units / bales)</option>
              <option value="medium">Medium Cargo (16 - 50 units)</option>
              <option value="large">High Bulk (50+ quintals / tons)</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3.5 py-2.5 rounded-xl text-xs border border-white/15 bg-[#141824] text-zinc-200 outline-none font-semibold cursor-pointer focus:border-indigo-500"
            >
              <option value="savings">Sort: Highest Volume Savings</option>
              <option value="price-asc">Wholesale Price: Low to High</option>
              <option value="price-desc">Wholesale Price: High to Low</option>
              <option value="moq-asc">MOQ: Smallest First</option>
            </select>
          </div>
        </div>

        {/* Dynamic Wholesale Categories Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === "ALL"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5"
            }`}
          >
            <span>All Wholesale Lots</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === "ALL" ? "bg-white/20 text-white font-mono" : "bg-white/10 text-zinc-400"
              }`}
            >
              {products.length}
            </span>
          </button>

          {wholesaleCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === cat.slug
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold"
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5"
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat.slug ? "bg-white/20 text-white font-mono" : "bg-white/10 text-zinc-400"
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Products Section Header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
            <span>Verified Wholesale Cargo Inventory</span>
            <span className="rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-3 py-0.5 text-xs font-mono font-bold">
              {filteredProducts.length} Lots Available
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Prices displayed are direct B2B supplier wholesale rates with volume tiered discount structures. Strictly wholesale items only.
          </p>
        </div>
      </div>

      {/* Wholesale Cargo Cards Grid */}
      {loading ? (
        <div className="p-16 rounded-3xl border border-white/10 bg-[#0d121f] text-center space-y-4">
          <RefreshCw className="w-9 h-9 animate-spin text-indigo-500 mx-auto" />
          <p className="text-sm font-semibold text-zinc-300">
            Loading wholesale supplier catalog from Mercato central network...
          </p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-16 rounded-3xl border border-white/10 bg-[#0d121f] text-center space-y-4">
          <Package className="w-12 h-12 text-zinc-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Wholesale Cargo Matches Your Search</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Try adjusting your search terms, removing MOQ constraints, or selecting a different category.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
              setSelectedMoqRange("ALL");
            }}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredProducts.map((product) => {
            const tradeInfo = getProductTradeInfo(product);
            const moq = product.moq && product.moq > 1 ? product.moq : 10;
            const currentQty = quantities[product.id] || moq;

            // Compute dynamic tier price for current quantity
            let unitPrice = tradeInfo.wholesalePrice || product.wholesalePrice || product.price;
            let activeSavingsPct = tradeInfo.savingsPercent || 0;

            if (product.tieredPricing && product.tieredPricing.length > 0) {
              const matchedTier = product.tieredPricing
                .filter((t) => currentQty >= t.minQuantity)
                .sort((a, b) => b.minQuantity - a.minQuantity)[0];
              if (matchedTier) {
                unitPrice = matchedTier.discountedPricePerUnit;
                if (product.price > 0 && unitPrice < product.price) {
                  activeSavingsPct = Math.round(((product.price - unitPrice) / product.price) * 100);
                }
              }
            }

            const totalPrice = unitPrice * currentQty;
            const isAdded = addedMap[product.id] || false;
            const unitLabel = product.unit || tradeInfo.unit || "unit";

            return (
              <div
                key={product.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-b from-[#12192a] via-[#0d1322] to-[#090d18] hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden"
              >
                {/* Product Header / High-Res Image Section */}
                <div>
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950">
                    <img
                      src={getHighResImageUrl(product.image)}
                      alt={product.name}
                      className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
                      loading="lazy"
                    />

                    {/* Ambient gradient vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d1322] via-transparent to-black/50 pointer-events-none" />

                    {/* Top Left Floating Badges */}
                    <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-lg shadow-indigo-950/60 border border-white/20 backdrop-blur-md">
                        <Boxes className="w-3 h-3" />
                        <span>Wholesale Cargo</span>
                      </span>

                      {activeSavingsPct > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-2 py-0.5 text-[9.5px] font-extrabold shadow-md shadow-emerald-950/40">
                          <Percent className="w-2.5 h-2.5" />
                          <span>Save {activeSavingsPct}%</span>
                        </span>
                      )}
                    </div>

                    {/* Top Right Floating Badges & Action */}
                    <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/80 border border-emerald-500/40 text-emerald-400 px-2 py-1 text-[9.5px] font-bold backdrop-blur-md shadow-md">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>CBE Escrow</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => router.push(`/products/${product.id}`)}
                        className="p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-white backdrop-blur-md border border-white/10 transition-colors shadow-md"
                        title="View Full Product Specifications"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Bottom Floating Glassmorphic MOQ Pill */}
                    <div className="absolute bottom-2.5 left-2.5 z-10">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 px-2.5 py-1 text-[11px] font-mono font-bold text-zinc-100 shadow-md">
                        <Package className="w-3.5 h-3.5 text-indigo-400" />
                        <span>
                          MOQ: {moq} {unitLabel}
                        </span>
                      </span>
                    </div>

                    {/* Bottom Right Grade/Origin Tag */}
                    {(product.grade || product.origin) && (
                      <div className="absolute bottom-2.5 right-2.5 z-10 max-w-[45%]">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 px-2 py-0.5 text-[9.5px] font-medium text-zinc-300 truncate">
                          {product.grade || product.origin}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Details Area */}
                  <div className="p-4 sm:p-4.5 space-y-3">
                    <div className="space-y-1.5">
                      {/* Category & Live Stock Pill */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold uppercase text-indigo-400 tracking-wider text-[11px] truncate max-w-[60%]">
                          {product.category}
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>{product.stock?.toLocaleString()} ready</span>
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        className="text-sm sm:text-base font-bold text-white line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors cursor-pointer"
                        onClick={() => router.push(`/products/${product.id}`)}
                        title={product.name}
                      >
                        {product.name}
                      </h3>

                      {/* Supplier & Review Rating Line */}
                      <div className="flex items-center justify-between gap-2 text-xs text-zinc-400 pt-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Store className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="font-medium text-zinc-200 truncate">{product.shopName}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 text-amber-400 font-bold text-[11px]">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{product.rating || 4.9}</span>
                          <span className="text-zinc-500 font-normal">({product.reviewCount || 85})</span>
                        </div>
                      </div>

                      {product.warehouseLocation && (
                        <div className="flex items-center gap-1 text-[10.5px] text-zinc-400 truncate">
                          <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                          <span className="truncate">{product.warehouseLocation}</span>
                        </div>
                      )}
                    </div>

                    {/* Interactive Volume Discount Tier Chips */}
                    {product.tieredPricing && product.tieredPricing.length > 0 && (
                      <div className="pt-1">
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                          <span>Volume Discount Tiers:</span>
                          <span className="text-indigo-400 font-normal text-[9.5px]">Tap to set qty</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {product.tieredPricing.slice(0, 4).map((tier, idx) => {
                            const isActive =
                              currentQty >= tier.minQuantity &&
                              (!tier.maxQuantity || currentQty <= tier.maxQuantity);
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleQuantityChange(product.id, tier.minQuantity, moq)}
                                className={`p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                                  isActive
                                    ? "border-indigo-500 bg-indigo-500/20 text-indigo-200 font-bold shadow-xs shadow-indigo-500/20"
                                    : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                                }`}
                              >
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="font-mono font-bold">
                                    {tier.minQuantity}+ {unitLabel}
                                  </span>
                                  {tier.savingsPercentage && tier.savingsPercentage > 0 ? (
                                    <span className="text-emerald-400 font-bold">
                                      -{tier.savingsPercentage}%
                                    </span>
                                  ) : null}
                                </div>
                                <div className="text-[11px] font-mono font-bold text-white mt-0.5">
                                  ETB {tier.discountedPricePerUnit.toLocaleString()}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Pricing & Action Section */}
                <div className="p-4 sm:p-4.5 pt-0 space-y-3">
                  {/* Live Price Calculation Box */}
                  <div className="rounded-xl border border-white/10 bg-gradient-to-r from-white/[0.04] to-white/[0.01] p-3 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                          Wholesale Unit Rate
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-black font-mono text-indigo-400">
                            ETB {unitPrice.toLocaleString()}
                          </span>
                          <span className="text-xs text-zinc-500">/{unitLabel}</span>
                          {product.price > unitPrice && (
                            <span className="text-[11px] text-zinc-500 line-through">
                              ETB {product.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                          Order Subtotal ({currentQty} {unitLabel})
                        </span>
                        <span className="text-base font-black font-mono text-emerald-400">
                          ETB {totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Ergonomic Quantity Stepper & Quick Lot Increments */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                      <div className="flex items-center rounded-xl border border-white/15 bg-white/5 p-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(product.id, currentQty - (moq >= 20 ? 5 : 1), moq)
                          }
                          disabled={currentQty <= moq}
                          className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-white/10 text-zinc-200 disabled:opacity-30 transition-colors cursor-pointer"
                          title="Decrease Quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min={moq}
                          value={currentQty}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            handleQuantityChange(product.id, isNaN(val) ? moq : val, moq);
                          }}
                          className="w-16 text-center text-xs font-bold font-mono bg-transparent outline-none text-white"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(product.id, currentQty + (moq >= 20 ? 5 : 1), moq)
                          }
                          className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-white/10 text-zinc-200 transition-colors cursor-pointer"
                          title="Increase Quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Quick Multiplier Chips */}
                      <div className="flex items-center gap-1">
                        {[moq, moq * 2, moq * 5].map((step) => (
                          <button
                            key={step}
                            type="button"
                            onClick={() => handleQuantityChange(product.id, step, moq)}
                            className={`px-2 py-1 rounded-lg text-[10.5px] font-mono transition-all cursor-pointer ${
                              currentQty === step
                                ? "bg-indigo-600 text-white font-bold shadow-xs"
                                : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5"
                            }`}
                          >
                            {step}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dual Action Buttons */}
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product, false)}
                        className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isAdded
                            ? "border-emerald-500 bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                            : "border-indigo-500/40 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white shadow-xs"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(product, true)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                      >
                        <span>Buy Cargo</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenRfq(product)}
                      className="w-full py-2 rounded-xl border border-white/10 hover:border-indigo-500/30 bg-white/[0.02] hover:bg-indigo-500/5 text-zinc-300 hover:text-white text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Request Custom Supplier Quote (RFQ)</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Wholesale Cargo Cart Bar */}
      {wholesaleCartCount > 0 && (
        <div className="sticky bottom-4 z-40 w-full animate-in slide-in-from-bottom duration-200">
          <div className="rounded-2xl border border-indigo-500/50 bg-[#0d121f]/95 backdrop-blur-xl p-3.5 shadow-2xl shadow-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-white shadow-md shrink-0">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">Wholesale Procurement Cart</span>
                  <span className="rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.2 text-[10px] font-mono font-bold">
                    {wholesaleCartCount} Lots Ready
                  </span>
                </div>
                <p className="text-xs text-zinc-300">
                  Total Cargo:{" "}
                  <span className="text-emerald-400 font-bold font-mono">
                    ETB {wholesaleCartAmount.toLocaleString()}
                  </span>{" "}
                  (Protected in CBE Escrow)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/dashboard/seller/wholesale-checkout")}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer whitespace-nowrap self-stretch sm:self-auto"
            >
              <span>Proceed to Wholesale Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Commercial RFQ Quote Modal */}
      {isRfqOpenState && selectedRfqProduct && (
        <div
          onClick={() => setIsRfqOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0d121f] p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Request Supplier Wholesale Quotation (RFQ)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRfqOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-1">
              <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                Wholesale Cargo Lot:
              </div>
              <div className="text-xs sm:text-sm font-bold text-white">{selectedRfqProduct.name}</div>
              <div className="text-xs text-zinc-400">
                Supplier: <span className="text-zinc-200">{selectedRfqProduct.shopName}</span> &bull; Base Rate:{" "}
                <span className="text-indigo-400 font-mono font-bold">
                  ETB{" "}
                  {selectedRfqProduct.wholesalePrice?.toLocaleString() ||
                    selectedRfqProduct.price.toLocaleString()}
                </span>
                /{selectedRfqProduct.unit || "unit"}
              </div>
            </div>

            <form onSubmit={handleSubmitRfq} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-200">
                  Target Quantity ({selectedRfqProduct.unit || "units"})
                </label>
                <input
                  type="number"
                  min={selectedRfqProduct.moq || 10}
                  value={rfqQuantity}
                  onChange={(e) => setRfqQuantity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white outline-none focus:border-indigo-500 font-mono text-xs"
                  required
                />
                <span className="text-[10px] text-zinc-500">
                  Minimum lot quantity for this item is {selectedRfqProduct.moq || 10}{" "}
                  {selectedRfqProduct.unit || "units"}.
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-200">
                  Destination Delivery Depot in Addis Ababa / Regional Hub
                </label>
                <input
                  type="text"
                  value={rfqDeliveryDepot}
                  onChange={(e) => setRfqDeliveryDepot(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white outline-none focus:border-indigo-500 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-200">
                  Commercial Notes & Invoicing Requirements
                </label>
                <textarea
                  rows={3}
                  value={rfqNotes}
                  onChange={(e) => setRfqNotes(e.target.value)}
                  placeholder="Specify cargo dispatch date, packaging requirements, or commercial VAT receipt details..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white outline-none focus:border-indigo-500 text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRfqOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold hover:bg-white/5 text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRfq}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingRfq ? (
                    <span>Submitting RFQ...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch RFQ to Supplier</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

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
} from "lucide-react";
import {
  fetchProducts,
  fetchAllProducts,
  fetchCategories,
} from "@/lib/api/catalog";
import type { Product, CategoryItem } from "@/constants/mock-data";
import { isWholesaleProduct, getProductTradeInfo } from "@/lib/product-classification";
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
  const [categories, setCategories] = useState<CategoryItem[]>([]);
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

  // Load wholesale products posted by suppliers
  useEffect(() => {
    let isSubscribed = true;

    async function loadWholesaleCargo() {
      try {
        setLoading(true);
        const [catData, prodRes] = await Promise.all([
          fetchCategories(),
          fetchAllProducts({ limit: 100 }),
        ]);

        if (isSubscribed) {
          setCategories(catData || []);

          // Strictly filter products that qualify as wholesale or adapt supplier products with bulk volume tiers
          const pool = prodRes.products || [];
          const wholesaleOnly = pool.filter(isWholesaleProduct);

          const finalProducts =
            wholesaleOnly.length > 0
              ? wholesaleOnly
              : pool.map((p) => {
                  const wholesalePrice =
                    p.wholesalePrice && p.wholesalePrice > 0 ? p.wholesalePrice : Math.round(p.price * 0.88);
                  const moq = p.moq && p.moq > 1 ? p.moq : 10;
                  return {
                    ...p,
                    wholesalePrice,
                    moq,
                    minOrderQuantity: moq,
                    tieredPricing:
                      p.tieredPricing && p.tieredPricing.length > 0
                        ? p.tieredPricing
                        : [
                            { minQuantity: moq, discountedPricePerUnit: p.price, savingsPercentage: 0 },
                            { minQuantity: 1000, discountedPricePerUnit: Math.round(p.price * 0.90), savingsPercentage: 10 },
                            { minQuantity: 5000, discountedPricePerUnit: Math.round(p.price * 0.80), savingsPercentage: 20 },
                          ],
                  };
                });

          setProducts(finalProducts);

          // Initialize default quantities to each product's MOQ
          const initialQtys: Record<string, number> = {};
          finalProducts.forEach((p) => {
            initialQtys[p.id] = p.moq || 10;
          });
          setQuantities(initialQtys);
        }
      } catch (err) {
        console.warn("Could not load wholesale supplier products:", err);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    }

    loadWholesaleCargo();

    return () => {
      isSubscribed = false;
    };
  }, []);

  // Filtered & sorted products
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
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== "ALL") {
      result = result.filter(
        (p) => p.categorySlug === selectedCategory || p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (selectedMoqRange !== "ALL") {
      if (selectedMoqRange === "small") {
        result = result.filter((p) => (p.moq || 1) <= 50);
      } else if (selectedMoqRange === "medium") {
        result = result.filter((p) => (p.moq || 1) > 50 && (p.moq || 1) <= 250);
      } else if (selectedMoqRange === "large") {
        result = result.filter((p) => (p.moq || 1) > 250);
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
    const moq = product.moq || 10;
    const qty = quantities[product.id] || moq;
    const tradeInfo = getProductTradeInfo(product);

    let unitPrice = tradeInfo.wholesalePrice || product.price;
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
      unit: tradeInfo.unit || "pcs",
      quantity: qty,
      savingsPercent: savingsPct,
      marketZone: product.marketZone,
    });

    if (isBuyNow) {
      router.push("/dashboard/seller/wholesale-checkout");
    } else {
      setAddedMap((prev) => ({ ...prev, [product.id]: true }));
      toast.success("Wholesale Cargo Added to Procurement Cart!", {
        description: `Added ${qty} ${tradeInfo.unit || "units"} of ${product.name} at ETB ${unitPrice.toLocaleString()}/unit.`,
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
    <div className="space-y-5 select-none">
      {/* Sourcing Hub Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/60 p-5 sm:p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10.5px] font-bold uppercase tracking-wider">
              <Boxes className="w-3.5 h-3.5 text-indigo-400" />
              <span>Merchant B2B Restocking Portal</span>
            </div>

            <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight">
              Buy Wholesale Cargo Directly from Verified Suppliers
            </h1>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Source bulk cartons, sacks, and container inventory directly from Ethiopian importers, commodity aggregators, and manufacturers. All transactions are 100% protected in Escrow with CBE & Telebirr until you physically inspect the cargo at your shop.
            </p>

            <div className="flex items-center gap-4 pt-1 flex-wrap text-xs font-semibold text-zinc-300">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>CBE Fiduciary Escrow Vault</span>
              </span>
              <span className="h-3 w-[1px] bg-white/10" />
              <span className="flex items-center gap-1.5 text-indigo-300">
                <Truck className="w-4 h-4 text-indigo-400" />
                <span>24-48h Direct Warehouse Dispatch</span>
              </span>
              <span className="h-3 w-[1px] bg-white/10" />
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Volume Tier Discounts (Up to 25% Off)</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <button
              type="button"
              onClick={() => router.push("/sellers")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Store className="w-4 h-4" />
              <span>Browse Supplier Stores Directory</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/cart")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 text-indigo-400" />
              <span>View Wholesale Cart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sourcing Search & Filters Bar */}
      <div className="rounded-2xl border border-white/10 bg-[#0d121f] p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search wholesale cartons, electronics, coffee, textiles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs border border-white/10 bg-white/[0.04] text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-white/10 text-zinc-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* MOQ Range & Sort Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedMoqRange}
              onChange={(e) => setSelectedMoqRange(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs border border-white/10 bg-[#141824] text-zinc-300 outline-none font-medium cursor-pointer"
            >
              <option value="ALL">All MOQ Lot Sizes</option>
              <option value="small">Low MOQ (≤ 50 pcs)</option>
              <option value="medium">Medium Cargo (51 - 250 pcs)</option>
              <option value="large">Container Bulk (250+ pcs)</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl text-xs border border-white/10 bg-[#141824] text-zinc-300 outline-none font-medium cursor-pointer"
            >
              <option value="savings">Sort: Highest Volume Savings</option>
              <option value="price-asc">Unit Price: Low to High</option>
              <option value="price-desc">Unit Price: High to Low</option>
              <option value="moq-asc">MOQ: Smallest First</option>
            </select>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === "ALL"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
            }`}
          >
            All Wholesale Categories ({filteredProducts.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.slug
                  ? "bg-indigo-600 text-white shadow-xs font-bold"
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Section Header */}
      <div className="flex items-center justify-between pb-0.5">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <span>Available Supplier Wholesale Cargo</span>
            <span className="rounded-full bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 text-[10px] font-mono font-bold">
              {filteredProducts.length} Lots Available
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Prices displayed are direct B2B supplier wholesale rates with volume tiered discount structures.
          </p>
        </div>
      </div>

      {/* Wholesale Cargo Cards Grid */}
      {loading ? (
        <div className="p-12 rounded-2xl border border-white/10 bg-[#0d121f] text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
          <p className="text-xs font-semibold text-zinc-400">
            Loading wholesale supplier catalog from Mercato central network...
          </p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 rounded-2xl border border-white/10 bg-[#0d121f] text-center space-y-3">
          <Package className="w-10 h-10 text-zinc-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Wholesale Cargo Matches Your Search</h3>
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
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {filteredProducts.map((product) => {
            const tradeInfo = getProductTradeInfo(product);
            const moq = product.moq || 10;
            const currentQty = quantities[product.id] || moq;

            // Compute dynamic tier price for current quantity
            let unitPrice = tradeInfo.wholesalePrice || product.price;
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

            return (
              <div
                key={product.id}
                className="group flex flex-col justify-between rounded-xl border border-white/10 bg-[#0d121f] hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all overflow-hidden"
              >
                {/* Product Header / Compact Image */}
                <div>
                  <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-slate-900">
                    <img
                      src={getHighResImageUrl(product.image)}
                      alt={product.name}
                      className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />

                    <div className="absolute top-1.5 left-1.5 z-10 flex flex-col gap-0.5 items-start">
                      <span className="inline-flex items-center gap-1 rounded bg-indigo-600/90 text-white px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs">
                        <Boxes className="w-2.5 h-2.5" />
                        Wholesale
                      </span>
                      {activeSavingsPct > 0 && (
                        <span className="rounded bg-emerald-600/90 text-white px-1 py-0.2 text-[8px] font-bold shadow-xs">
                          Save {activeSavingsPct}%
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-1.5 left-1.5 z-10">
                      <span className="inline-flex items-center gap-1 rounded bg-black/80 text-zinc-200 border border-white/10 px-1.5 py-0.5 text-[8.5px] font-mono backdrop-blur-md">
                        MOQ: {moq} {tradeInfo.unit || "pcs"}
                      </span>
                    </div>

                    <div className="absolute top-1.5 right-1.5 z-10">
                      <button
                        type="button"
                        onClick={() => router.push(`/products/${product.id}`)}
                        className="p-1 rounded-full bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-white backdrop-blur-md transition-colors"
                        title="View Full Product Page"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Compact Body Details */}
                  <div className="p-2 sm:p-2.5 space-y-1.5">
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-[9px] text-zinc-400">
                        <span className="font-semibold uppercase text-indigo-400 truncate max-w-[70%]">
                          {product.category}
                        </span>
                        <span className="flex items-center gap-0.5 font-mono text-emerald-400 text-[8.5px]">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>In Stock</span>
                        </span>
                      </div>

                      <h3
                        className="text-xs font-bold text-white line-clamp-1 hover:text-indigo-400 transition-colors cursor-pointer"
                        onClick={() => router.push(`/products/${product.id}`)}
                        title={product.name}
                      >
                        {product.name}
                      </h3>

                      <div className="flex items-center gap-1 text-[9.5px] text-zinc-400 truncate">
                        <Store className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                        <span className="truncate">{product.shopName}</span>
                      </div>
                    </div>

                    {/* Compact Volume Tiers Strip */}
                    {product.tieredPricing && product.tieredPricing.length > 0 && (
                      <div className="flex items-center gap-1 text-[8.5px] font-mono overflow-x-auto no-scrollbar py-0.5">
                        {product.tieredPricing.slice(0, 2).map((tier, idx) => (
                          <span
                            key={idx}
                            className={`px-1 py-0.5 rounded border whitespace-nowrap ${
                              currentQty >= tier.minQuantity
                                ? "border-indigo-500 bg-indigo-500/20 text-indigo-200 font-bold"
                                : "border-white/5 bg-white/[0.02] text-zinc-400"
                            }`}
                          >
                            {tier.minQuantity}+: ETB {tier.discountedPricePerUnit.toLocaleString()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Compact Pricing Row */}
                    <div className="flex items-baseline justify-between pt-1 border-t border-white/5 text-xs">
                      <div>
                        <span className="text-xs font-black font-mono text-indigo-400">
                          ETB {unitPrice.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-zinc-500 ml-0.5">/{tradeInfo.unit || "unit"}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-bold font-mono text-emerald-400">
                          ETB {totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Compact Quantity Picker */}
                    <div className="flex items-center justify-between gap-1 pt-0.5">
                      <div className="flex items-center rounded border border-white/10 bg-white/5 p-0.5">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(product.id, currentQty - 10, moq)}
                          disabled={currentQty <= moq}
                          className="h-5 w-5 rounded flex items-center justify-center hover:bg-white/10 text-zinc-300 disabled:opacity-30 transition-colors cursor-pointer"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <input
                          type="number"
                          min={moq}
                          value={currentQty}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            handleQuantityChange(product.id, isNaN(val) ? moq : val, moq);
                          }}
                          className="w-11 text-center text-[10.5px] font-bold font-mono bg-transparent outline-none text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(product.id, currentQty + 10, moq)}
                          className="h-5 w-5 rounded flex items-center justify-center hover:bg-white/10 text-zinc-300 transition-colors cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      {/* Quick +50 / +100 Chip */}
                      <div className="flex items-center gap-0.5">
                        {[100, 500].map((step) => (
                          <button
                            key={step}
                            type="button"
                            onClick={() => handleQuantityChange(product.id, step, moq)}
                            className={`px-1 py-0.5 rounded text-[8.5px] font-mono transition-colors ${
                              currentQty === step
                                ? "bg-indigo-600 text-white font-bold"
                                : "bg-white/5 text-zinc-400 hover:text-white"
                            }`}
                          >
                            {step}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compact Card Action Buttons */}
                <div className="p-2 border-t border-white/5 bg-[#0a0e1a] grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product, false)}
                    className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border text-[10.5px] font-bold transition-all cursor-pointer ${
                      isAdded
                        ? "border-emerald-500 bg-emerald-600 text-white"
                        : "border-indigo-500/40 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3 h-3" />
                        <span>Add</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(product, true)}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10.5px] font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <span>Buy Cargo</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Wholesale Cargo Cart Bar */}
      {wholesaleCartCount > 0 && (
        <div className="sticky bottom-4 z-40 w-full animate-in slide-in-from-bottom duration-200">
          <div className="rounded-2xl border border-indigo-500/50 bg-[#0d121f]/95 backdrop-blur-xl p-3 shadow-2xl shadow-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-xs shrink-0">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-white">Wholesale Procurement Cart</span>
                  <span className="rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.2 text-[10px] font-mono font-bold">
                    {wholesaleCartCount} Lots Ready
                  </span>
                </div>
                <p className="text-xs text-zinc-300">
                  Total Cargo: <span className="text-emerald-400 font-bold font-mono">ETB {wholesaleCartAmount.toLocaleString()}</span> (Protected in CBE Escrow)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/dashboard/seller/wholesale-checkout")}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer whitespace-nowrap self-stretch sm:self-auto"
            >
              <span>Proceed to Wholesale Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
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
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d121f] p-5 sm:p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Request Supplier Wholesale Quotation (RFQ)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRfqOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02] space-y-1">
              <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                Wholesale Lot:
              </div>
              <div className="text-xs font-bold text-white">{selectedRfqProduct.name}</div>
              <div className="text-[11px] text-zinc-400">
                Supplier: {selectedRfqProduct.shopName} &bull; Base Wholesale: ETB {selectedRfqProduct.wholesalePrice?.toLocaleString() || selectedRfqProduct.price.toLocaleString()}
              </div>
            </div>

            <form onSubmit={handleSubmitRfq} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">
                  Target Quantity (Units / Cartons)
                </label>
                <input
                  type="number"
                  min={selectedRfqProduct.moq || 10}
                  value={rfqQuantity}
                  onChange={(e) => setRfqQuantity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-indigo-500 font-mono text-xs"
                  required
                />
                <span className="text-[10px] text-zinc-500">
                  Minimum lot quantity for this item is {selectedRfqProduct.moq || 10} {selectedRfqProduct.unit || "units"}.
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">
                  Destination Delivery Depot in Addis Ababa / Regions
                </label>
                <input
                  type="text"
                  value={rfqDeliveryDepot}
                  onChange={(e) => setRfqDeliveryDepot(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-indigo-500 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">
                  Commercial Notes & Invoicing Requirements
                </label>
                <textarea
                  rows={3}
                  value={rfqNotes}
                  onChange={(e) => setRfqNotes(e.target.value)}
                  placeholder="Specify cargo dispatch date, packaging requirements, or commercial VAT receipt details..."
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white outline-none focus:border-indigo-500 text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
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
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
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

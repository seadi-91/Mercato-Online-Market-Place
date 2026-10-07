"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Tag,
  Trash2,
  X,
  Cpu,
  BatteryCharging,
  Eye,
  Info,
  MapPin,
  Calendar,
  MoreVertical,
  Wifi,
  WifiOff,
  RefreshCw,
  Layers,
  Table,
} from "lucide-react";
import { toast } from "sonner";
import { useSellerUIStore } from "@/store/ui-store";
import { sellerService } from "@/services/seller/seller.service";

export type ProductCategory =
  | "Computers & Electronics"
  | "Smartphones & Mobile"
  | "Fashion, Apparel & Shoes"
  | "Cosmetics & Skincare"
  | "Grains, Cereals & Groceries"
  | "Home, Kitchen & Appliances"
  | string;

export interface ProductAttributes {
  processor?: string;
  generation?: string;
  ram?: string;
  storage?: string;
  batteryLife?: string;
  screenSize?: string;
  gpu?: string;
  condition?: string;
  warranty?: string;
  sizes?: string[];
  colors?: string[];
  material?: string;
  fit?: string;
  gender?: string;
  occasion?: string;
  manufactureDate?: string;
  expiryDate?: string;
  netSize?: string;
  brand?: string;
  skinType?: string;
  ingredients?: string;
  batchNumber?: string;
  soldByUnit?: string;
  minOrderQty?: string;
  originRegion?: string;
  qualityGrade?: string;
  harvestSeason?: string;
  packagingType?: string;
  dimensions?: string;
  weight?: string;
}

export interface SellerProduct {
  id: string;
  title: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  stock: number;
  unit: string;
  sku: string;
  status: "ACTIVE" | "LOW_STOCK" | "DRAFT";
  image?: string;
  soldUnits?: number;
  revenue?: number;
  attributes: ProductAttributes;
}

export function SellerProducts() {
  const { setActiveTab } = useSellerUIStore();
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All Categories");
  const [viewMode, setViewMode] = useState<"comparison" | "table">("comparison");
  const [inspectingProduct, setInspectingProduct] = useState<SellerProduct | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadCategories = useCallback(async () => {
    try {
      const cats = await sellerService.getCategories();
      if (Array.isArray(cats) && cats.length > 0) {
        setCategories(cats.map((c) => c.name));
      }
    } catch {
      // ignore
    }
  }, []);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const [res, topProdsRes] = await Promise.allSettled([
        sellerService.getProducts({
          search: search.trim() || undefined,
        }),
        sellerService.getTopProducts(50),
      ]);

      const topMap: Record<string, { sold: number; revenue: number }> = {};
      if (topProdsRes.status === "fulfilled" && Array.isArray(topProdsRes.value)) {
        topProdsRes.value.forEach((tp) => {
          topMap[tp.title] = {
            sold: Number(tp.totalQuantitySold || 0),
            revenue: Number(tp.totalRevenue || 0),
          };
        });
      }

      if (res.status === "fulfilled" && res.value && Array.isArray(res.value.data)) {
        const mapped: SellerProduct[] = res.value.data.map((p) => {
          const stats = topMap[p.title] || { sold: 0, revenue: 0 };
          return {
            id: p.id,
            title: p.title,
            category: p.category?.name || "Uncategorized",
            price: Number(p.retailPrice || 0),
            originalPrice: p.wholesalePrice ? Number(p.wholesalePrice) : undefined,
            stock: Number(p.stockQuantity || 0),
            unit: p.unit ? p.unit.toLowerCase() : "units",
            sku: p.sku,
            image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : undefined,
            soldUnits: stats.sold,
            revenue: stats.revenue,
            status:
              p.stockQuantity === 0 || p.stockQuantity <= (p.lowStockThreshold || 5)
                ? "LOW_STOCK"
                : "ACTIVE",
            attributes: {
              condition: "Verified Merchant Listing",
              warranty: "Standard Merchant Warranty",
            },
          };
        });
        setProducts(mapped);
        setIsLiveConnected(true);
      }
    } catch {
      setIsLiveConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, [loadCategories, loadProducts]);

  const handleStockAdjust = async (id: string, amount: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = Math.max(0, p.stock + amount);
          return {
            ...p,
            stock: updated,
            status: updated === 0 ? "LOW_STOCK" : updated <= 5 ? "LOW_STOCK" : "ACTIVE",
          };
        }
        return p;
      })
    );

    try {
      const action = amount > 0 ? "REPLENISH" : "DEDUCT";
      await sellerService.updateStock(id, action, Math.abs(amount));
      toast.success("Inventory stock synced with backend");
    } catch {
      toast.error("Failed to update stock on backend");
    }
  };

  const handleDelistProduct = async (p: SellerProduct) => {
    setOpenMenuId(null);
    try {
      await sellerService.deleteProduct(p.id);
      setProducts((prev) => prev.filter((item) => item.id !== p.id));
      toast.success(`Removed "${p.title}" from catalog`);
    } catch {
      toast.error(`Could not delist product. Please retry.`);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === "All Categories" || p.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPostedUnits = products.reduce((acc, p) => acc + p.stock + (p.soldUnits || 0), 0);
  const totalSoldUnits = products.reduce((acc, p) => acc + (p.soldUnits || 0), 0);
  const totalInStock = products.reduce((acc, p) => acc + p.stock, 0);
  const overallSellThrough = totalPostedUnits > 0 ? (totalSoldUnits / totalPostedUnits) * 100 : 0;

  return (
    <div className="space-y-3.5">
      {/* Top Header & Add Product Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-indigo-400" />
              Store Catalog & Inventory
            </h1>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${isLiveConnected
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                }`}
            >
              {isLiveConnected ? (
                <>
                  <Wifi className="h-2.5 w-2.5" /> Live Backend
                </>
              ) : (
                <>
                  <WifiOff className="h-2.5 w-2.5" /> Connecting...
                </>
              )}
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Manage your store listings, ETB prices, specifications, and warehouse stock
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadProducts()}
            disabled={isLoading}
            title="Refresh Catalog from Backend"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("add-product")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* 4-Metric Correlation Ribbon: Posted vs Sold Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-xl bg-white/[0.02] border border-white/5 p-3 text-xs">
        <div className="space-y-1">
          <span className="text-[10px] text-zinc-400 flex items-center gap-1.5 font-medium">
            <span className="h-2 w-2 rounded-sm bg-sky-400" />
            Posted Products
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold font-mono text-sky-400">
              {totalPostedUnits.toLocaleString()}
            </span>
            <span className="text-[10px] text-zinc-500 font-sans">units listed</span>
          </div>
          <p className="text-[9.5px] text-zinc-500">Across {products.length} catalog item{products.length === 1 ? "" : "s"}</p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] text-zinc-400 flex items-center gap-1.5 font-medium">
            <span className="h-2 w-2 rounded-sm bg-emerald-400" />
            Products Sold
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold font-mono text-emerald-400">
              {totalSoldUnits.toLocaleString()}
            </span>
            <span className="text-[10px] text-zinc-500 font-sans">units purchased</span>
          </div>
          <p className="text-[9.5px] text-zinc-500">Via Telebirr, CBE & Chapa</p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] text-zinc-400 flex items-center gap-1.5 font-medium">
            <span className="h-2 w-2 rounded-sm bg-indigo-400" />
            In Warehouse
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold font-mono text-white">
              {totalInStock.toLocaleString()}
            </span>
            <span className="text-[10px] text-zinc-500 font-sans">units in stock</span>
          </div>
          <p className="text-[9.5px] text-zinc-500">Available for checkout</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-purple-400" />
              Sell-Through Rate
            </span>
            <span className="font-mono text-purple-300 font-bold">{overallSellThrough.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden mt-1">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(Math.max(overallSellThrough, 3), 100)}%` }}
            />
          </div>
          <p className="text-[9.5px] text-zinc-500">Ratio of posted stock sold</p>
        </div>
      </div>

      {/* Control Bar: Search, Category Filter & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 rounded-xl border border-white/10 bg-[#0d121f] p-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by title, SKU, or specs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg bg-white/[0.04] border border-white/5 py-1.5 pl-9 pr-3 text-xs text-white placeholder:text-zinc-500 focus:border-indigo-500/50 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="rounded-lg bg-[#0d121f] border border-white/10 py-1.5 px-3 text-xs text-zinc-300 focus:border-indigo-500/50 focus:outline-hidden cursor-pointer"
          >
            <option value="All Categories">All Categories ({products.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex items-center rounded-lg bg-white/[0.04] p-0.5 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("comparison")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold transition-all cursor-pointer ${viewMode === "comparison"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                : "text-zinc-400 hover:text-white"
                }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Posted vs Sold</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold transition-all cursor-pointer ${viewMode === "table"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                : "text-zinc-400 hover:text-white"
                }`}
            >
              <Table className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Inventory Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* View Content: Mobile Card Layout (sm:hidden) OR Desktop Views (hidden sm:block) */}
      {filteredProducts.length === 0 ? (
        products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#0d121f]/60 p-8 sm:p-12 text-center">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
              <Package className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">No Products in Store Catalog</h3>
            <p className="mt-1 text-xs text-zinc-400 max-w-sm">
              Your store inventory is currently empty in the database. Add your first commercial listing to start receiving customer orders.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab("add-product")}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:brightness-110 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Your First Product</span>
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#0d121f]/60 p-8 text-center text-xs text-zinc-400">
            No products match your search query &ldquo;{search}&rdquo;.
          </div>
        )
      ) : (
        <>
          {/* Mobile Dedicated Product Cards (sm:hidden) */}
          <div className="sm:hidden space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-indigo-400" />
                <span>Store Catalog Items</span>
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">
                {filteredProducts.length} listing{filteredProducts.length === 1 ? "" : "s"}
              </span>
            </div>

            {filteredProducts.map((p) => {
              const sold = p.soldUnits || 0;
              const posted = p.stock + sold;
              const isLow = p.stock <= 5;

              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-white/10 bg-[#0d121f] p-3.5 shadow-xl space-y-3"
                >
                  {/* Card Top: Image + Details + Status */}
                  <div className="flex items-start gap-3">
                    <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
                      {p.image ? (
                        <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-indigo-400">
                          <Package className="h-7 w-7" />
                        </div>
                      )}
                      {isLow && (
                        <span className="absolute bottom-0 inset-x-0 bg-rose-600/90 text-[8px] font-bold text-center text-white py-0.5 uppercase tracking-wider">
                          Low Stock
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4
                          onClick={() => setInspectingProduct(p)}
                          className="text-xs font-bold text-white line-clamp-2 leading-tight cursor-pointer hover:text-indigo-300 transition-colors"
                        >
                          {p.title}
                        </h4>
                        {isLow ? (
                          <span className="shrink-0 rounded-md bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.5 text-[9px] font-bold text-rose-300">
                            Low Stock
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-md bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
                            Active
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                        {p.category}
                      </p>

                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="font-mono font-bold text-cyan-300 text-sm">
                          ETB {p.price.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">/ {p.unit || "unit"}</span>
                        <span className="text-[9.5px] font-mono text-zinc-500 ml-auto">SKU: {p.sku}</span>
                      </div>
                    </div>
                  </div>

                  {/* 3-Pill Performance Ribbon */}
                  <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-white/[0.02] border border-white/5 p-2 text-center text-[10px]">
                    <div>
                      <span className="text-zinc-500 block text-[9px]">Posted Units</span>
                      <span className="font-mono font-semibold text-sky-300">{posted}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px]">Units Sold</span>
                      <span className="font-mono font-bold text-emerald-400">{sold}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px]">In Stock</span>
                      <span className={`font-mono font-bold ${isLow ? "text-rose-400" : "text-white"}`}>
                        {p.stock}
                      </span>
                    </div>
                  </div>

                  {/* Mobile Quick Stock & Action Controls */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                    <div className="flex items-center gap-1.5 bg-[#090d16] p-1 rounded-xl border border-white/10">
                      <button
                        type="button"
                        onClick={() => handleStockAdjust(p.id, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] text-zinc-300 font-bold hover:bg-white/10 active:scale-95 text-xs cursor-pointer"
                        title="Reduce stock by 1"
                      >
                        -1
                      </button>
                      <span className="font-mono font-bold text-xs px-2 text-white min-w-[2.2rem] text-center">
                        {p.stock}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStockAdjust(p.id, 5)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/30 text-indigo-300 font-bold hover:bg-indigo-600/40 active:scale-95 text-xs cursor-pointer"
                        title="Add 5 units"
                      >
                        +5
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStockAdjust(p.id, 10)}
                        className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1.5 text-[10.5px] font-bold text-emerald-300 active:scale-95 transition-all cursor-pointer"
                      >
                        +10 Restock
                      </button>
                      <button
                        type="button"
                        onClick={() => setInspectingProduct(p)}
                        className="rounded-lg bg-white/[0.06] border border-white/10 p-1.5 text-zinc-300 hover:text-white cursor-pointer"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelistProduct(p)}
                        className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-1.5 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                        title="Delist product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Views (hidden sm:block) */}
          <div className="hidden sm:block">
            {viewMode === "comparison" ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-indigo-400" />
                    Catalog Products: Posted vs Sold Comparison
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {filteredProducts.length} listing{filteredProducts.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
            {filteredProducts.map((p) => {
              const sold = p.soldUnits || 0;
              const posted = p.stock + sold;
              const sellThrough = posted > 0 ? (sold / posted) * 100 : 0;
              const revenue = p.revenue || 0;

              return (
                <div
                  key={p.id}
                  onClick={() => setInspectingProduct(p)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl p-3 border border-white/10 bg-[#0d121f] hover:bg-white/[0.03] transition-all cursor-pointer hover:border-indigo-500/40 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.title}
                        className="h-12 w-12 rounded-lg object-cover border border-white/10 shrink-0 bg-white/5"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                        <Package className="h-6 w-6" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate max-w-[220px] sm:max-w-sm group-hover:text-indigo-300 transition-colors">
                        {p.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                        <span className="text-zinc-400 truncate">{p.category}</span>
                        <span className="text-zinc-600">·</span>
                        <span className="font-mono text-zinc-300">
                          ETB {p.price.toLocaleString()} / {p.unit || "piece"}
                        </span>
                        <span className="text-zinc-600">·</span>
                        <span className="font-mono text-zinc-500">SKU: {p.sku}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 text-xs font-mono border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[9px] text-sky-400 block font-sans font-medium">Posted</span>
                      <span className="text-sky-300 font-semibold">{posted.toLocaleString()} units</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] text-emerald-400 block font-sans font-medium">Sold</span>
                      <span className="text-emerald-400 font-bold">{sold.toLocaleString()} units</span>
                    </div>

                    <div className="hidden sm:block text-right w-24">
                      <span className="text-[9px] text-purple-400 block font-sans font-medium">Sell-Through</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="h-1.5 w-14 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full"
                            style={{ width: `${Math.min(sellThrough, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-purple-300 font-bold">{sellThrough.toFixed(0)}%</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] text-zinc-400 block font-sans font-medium">Revenue</span>
                      <span className="text-zinc-100 font-bold">ETB {revenue.toLocaleString()}</span>
                    </div>

                    <div className="hidden md:flex items-center gap-1 text-[9px] font-sans">
                      <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-emerald-400 font-medium">
                        Telebirr
                      </span>
                      <span className="rounded bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 text-purple-400 font-medium">
                        CBE
                      </span>
                      <span className="rounded bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.5 text-sky-400 font-medium">
                        Chapa
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0d121f] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.01] text-[11px] font-semibold text-zinc-400">
                  <th className="py-2.5 px-3">Product Title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3 text-right">Price (ETB)</th>
                  <th className="py-2.5 px-3 text-center">Stock</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredProducts.map((p) => {
                  const isLow = p.stock <= 5;

                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-zinc-100 group-hover:text-indigo-300 transition-colors">
                          {p.title}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="text-[11px] font-medium text-zinc-300">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 font-mono text-zinc-400 text-[11px] whitespace-nowrap">
                        {p.sku}
                      </td>

                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="font-bold text-cyan-300 font-mono">
                          ETB {p.price.toLocaleString()}
                        </div>
                        {p.originalPrice && (
                          <div className="text-[10px] text-zinc-500 line-through font-mono">
                            ETB {p.originalPrice.toLocaleString()}
                          </div>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStockAdjust(p.id, -1)}
                            title="Decrease 1"
                            className="flex h-5 w-5 items-center justify-center rounded bg-white/[0.06] hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <span
                            className={`font-mono font-bold min-w-[2.5rem] text-center ${isLow ? "text-rose-400" : "text-emerald-400"
                              }`}
                          >
                            {p.stock} {p.unit}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleStockAdjust(p.id, 5)}
                            title="Add 5"
                            className="flex h-5 w-5 items-center justify-center rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 transition-colors cursor-pointer"
                          >
                            +5
                          </button>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-rose-400">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            Active
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right whitespace-nowrap relative">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title="Product Actions"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {openMenuId === p.id && (
                            <>
                              <div
                                className="fixed inset-0 z-30 cursor-default"
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div className="app-dropdown-panel absolute right-0 mt-1 w-52 rounded-xl border border-white/10 bg-[#0f172a] p-1.5 shadow-2xl z-40 space-y-0.5 text-left animate-in fade-in zoom-in-95 duration-100">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    setInspectingProduct(p);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-500/15 transition-colors cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  <span>View Details</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    handleStockAdjust(p.id, 10);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/15 transition-colors cursor-pointer"
                                >
                                  <Package className="h-3.5 w-3.5" />
                                  <span>Quick Restock (+10)</span>
                                </button>

                                <div className="my-1 border-t border-white/5" />

                                <button
                                  type="button"
                                  onClick={() => handleDelistProduct(p)}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/15 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Delist Product</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
          )}
        </div>
      </>
    )}

      {/* Inspect Technical Specs Modal */}
      {inspectingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs">
          <div className="app-modal-window w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0d121f] p-4 sm:p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-2.5 mb-3">
              <div>
                <span className="text-[11px] font-bold text-indigo-400">
                  {inspectingProduct.category}
                </span>
                <h3 className="text-sm font-bold text-white mt-1">{inspectingProduct.title}</h3>
                <p className="text-[10.5px] font-mono text-zinc-400">SKU: {inspectingProduct.sku}</p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingProduct(null)}
                className="rounded-lg p-1 text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#090d16] border border-white/[0.06]">
                <div>
                  <span className="text-zinc-500 text-[10px] block">Selling Price</span>
                  <span className="font-bold text-cyan-300 font-mono text-xs">
                    ETB {inspectingProduct.price.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px] block">Stock Available</span>
                  <span className="font-bold text-emerald-400 font-mono text-xs">
                    {inspectingProduct.stock} {inspectingProduct.unit}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px] block">Status</span>
                  <span className="font-semibold text-zinc-200">{inspectingProduct.status}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex justify-end">
              <button
                type="button"
                onClick={() => setInspectingProduct(null)}
                className="px-3.5 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

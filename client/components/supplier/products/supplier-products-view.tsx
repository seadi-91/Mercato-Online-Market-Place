"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Eye,
  Edit,
  Copy,
  Archive,
  Trash2,
  CheckCircle,
  XCircle,
  MoreVertical,
  Star,
  Download,
  SlidersHorizontal,
  Images,
  Package,
  Boxes,
  TrendingUp,
  Building,
  LayoutGrid,
  List,
  Search,
  X,
  ChevronRight,
  RefreshCw,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { StatusBadge } from "../shared/status-badge";
import { Pagination } from "../shared/pagination";
import { EmptyState } from "../shared/empty-state";
import { useSupplierStore } from "@/store/supplier-store";
import { useAuthStore } from "@/store/auth-store";
import { B2BProduct, ProductStatus } from "@/types/supplier";
import { ProductDetailModal } from "./supplier-product-detail-modal";
import { toast } from "sonner";

export function SupplierProductsView() {
  const {
    products,
    isLoadingProducts,
    productsError,
    fetchProducts,
    updateProductStatus,
    deleteProduct,
    setEditingProduct,
    setSubView,
    setActiveTab,
    currentStaffUser,
  } = useSupplierStore();
  const { user } = useAuthStore();

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const isBranchManager = user?.staffRole === "branch_manager" || currentStaffUser?.role === "branch_manager";
  const userBranchId = user?.branchId || currentStaffUser?.branchId;
  const userBranchName = user?.branchName || currentStaffUser?.branchName;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<B2BProduct | null>(null);

  const pageSize = 10;

  // Strict Branch Scoping: Branch manager ONLY sees products in their branch
  const scopedProducts = useMemo(() => {
    if (isBranchManager && userBranchId) {
      return products.filter((p) =>
        p.branchId === userBranchId ||
        p.warehouseLocation.toLowerCase().includes(userBranchId.replace("wh-", "")) ||
        (userBranchName && p.warehouseLocation.toLowerCase().includes(userBranchName.toLowerCase().split(" ")[0]))
      );
    }
    return products;
  }, [products, isBranchManager, userBranchId, userBranchName]);

  // Catalog quick metrics
  const stats = useMemo(() => {
    const total = scopedProducts.length;
    const published = scopedProducts.filter((p) => p.status === "published").length;
    const lowStock = scopedProducts.filter((p) => p.stock < 30000).length;
    const totalUnits = scopedProducts.reduce((acc, p) => acc + (p.stock || 0), 0);
    return { total, published, lowStock, totalUnits };
  }, [scopedProducts]);

  // Filter products
  const filtered = scopedProducts.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.origin.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || prod.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || prod.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sorting
  filtered.sort((a, b) => {
    if (sortOption === "price_asc") return a.basePrice - b.basePrice;
    if (sortOption === "price_desc") return b.basePrice - a.basePrice;
    if (sortOption === "stock_desc") return b.stock - a.stock;
    if (sortOption === "sales_desc") return b.salesCount - a.salesCount;
    return b.createdAt.localeCompare(a.createdAt);
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDuplicate = (prod: B2BProduct) => {
    toast.success(`Duplicated draft created for ${prod.name}`);
    setActiveActionMenuId(null);
  };

  const handleArchive = async (id: string) => {
    setActiveActionMenuId(null);
    await updateProductStatus(id, "archived");
  };

  const handleTogglePublish = async (prod: B2BProduct) => {
    const newStatus: ProductStatus = prod.status === "published" ? "draft" : "published";
    setActiveActionMenuId(null);
    await updateProductStatus(prod.id, newStatus);
  };

  const handleDelete = async (id: string) => {
    setActiveActionMenuId(null);
    await deleteProduct(id);
  };

  const handleEdit = (prod: B2BProduct) => {
    setActiveActionMenuId(null);
    setEditingProduct(prod);
    setSubView("create-product");
  };

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const hasActiveFilters =
    Boolean(searchQuery) ||
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    sortOption !== "newest";

  return (
    <div className="space-y-3.5 w-full">
      {/* 1. Compact Header with Breadcrumbs, View Switcher & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div>
          <nav className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium mb-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Dashboard
            </button>
            <ChevronRight className="h-3 w-3 text-zinc-600" />
            <span className="text-zinc-200">Products</span>
            <span className="ml-1 rounded-full bg-indigo-500/15 border border-indigo-500/25 px-1.5 py-0.2 text-[10px] text-indigo-300 font-mono">
              {scopedProducts.length} items
            </span>
            {isLoadingProducts && (
              <span className="inline-flex items-center gap-1 text-[10px] text-indigo-400 ml-1">
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                <span>Syncing DB...</span>
              </span>
            )}
          </nav>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Wholesale Product Catalog</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Database Catalog Button */}
          <button
            type="button"
            onClick={() => fetchProducts()}
            disabled={isLoadingProducts}
            title="Refresh from PostgreSQL Database"
            className="p-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingProducts ? "animate-spin text-indigo-400" : ""}`} />
          </button>

          {/* View Mode Toggle: Compact Table / Grid Cards */}
          <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              title="Compact Table View"
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="Grid Card View"
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Add Product Button */}
          <button
            onClick={() => {
              setEditingProduct(null);
              setSubView("create-product");
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Wholesale Product</span>
          </button>
        </div>
      </div>

      {/* 2. Slim KPI Metric Bar (Light & Non-zoomed) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="rounded-xl border border-white/[0.08] bg-[#0d121c]/80 px-3 py-2 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Catalog SKUs</p>
            <p className="text-base font-bold text-white font-mono mt-0.5">{stats.total}</p>
          </div>
          <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Package className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0d121c]/80 px-3 py-2 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Live in B2B</p>
            <p className="text-base font-bold text-emerald-400 font-mono mt-0.5">{stats.published}</p>
          </div>
          <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0d121c]/80 px-3 py-2 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Low Stock</p>
            <p className="text-base font-bold text-amber-400 font-mono mt-0.5">{stats.lowStock}</p>
          </div>
          <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Boxes className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0d121c]/80 px-3 py-2 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Total Depot Units</p>
            <p className="text-base font-bold text-zinc-200 font-mono mt-0.5">
              {stats.totalUnits >= 1000 ? `${(stats.totalUnits / 1000).toFixed(1)}k` : stats.totalUnits}
            </p>
          </div>
          <div className="h-7 w-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <TrendingUp className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      {/* Branch Manager Notice (Compact) */}
      {(user?.staffRole === "branch_manager" || currentStaffUser?.role === "branch_manager") && (
        <div className="px-3 py-2 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-blue-300">
            <Building className="h-3.5 w-3.5 shrink-0 text-blue-400" />
            <span>
              Managing inventory for <strong>{user?.branchName || currentStaffUser?.branchName}</strong>
            </span>
          </div>
          <button
            onClick={() => setSubView("create-product")}
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium px-2 py-1 text-[11px] cursor-pointer"
          >
            <Plus className="h-3 w-3" />
            <span>Add for Branch</span>
          </button>
        </div>
      )}

      {/* 3. Integrated Compact Filter Bar */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0d121c]/90 px-3 py-2 flex flex-col md:flex-row md:items-center justify-between gap-2 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, SKU, category, origin..."
            className="w-full rounded-lg border border-white/10 bg-black/30 pl-8 pr-7 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-hidden"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns in Compact Row */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-xs font-medium text-zinc-300 focus:border-indigo-500 focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="pending_approval">Pending</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-xs font-medium text-zinc-300 focus:border-indigo-500 focus:outline-hidden cursor-pointer max-w-[150px] truncate"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-xs font-medium text-zinc-300 focus:border-indigo-500 focus:outline-hidden cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="sales_desc">Top Sales</option>
            <option value="price_desc">Price: High</option>
            <option value="price_asc">Price: Low</option>
            <option value="stock_desc">Max Stock</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setCategoryFilter("all");
                setSortOption("newest");
              }}
              className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:text-white cursor-pointer"
              title="Reset Filters"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            onClick={() => toast.success("Exporting catalog CSV...")}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Export CSV"
          >
            <Download className="h-3 w-3" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* 4. Main Catalog View */}
      {isLoadingProducts && products.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0d121c] p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
          <div className="h-10 w-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
          </div>
          <h3 className="text-sm font-semibold text-white">Loading Products from Database...</h3>
          <p className="text-xs text-zinc-400 max-w-sm">
            Fetching active wholesale commodities and inventory from the database.
          </p>
        </div>
      ) : productsError && products.length === 0 ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
          <div className="h-10 w-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">Database Connection Error</h3>
          <p className="text-xs text-rose-300 max-w-md">{productsError}</p>
          <button
            onClick={() => fetchProducts()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : paginated.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0d121c] p-8 shadow-xs">
          <EmptyState
            title="No Products Found"
            description="No catalog items match your search and filter criteria. Adjust your filters or add a new wholesale product."
            actionLabel="Add New Wholesale Product"
            onAction={() => setSubView("create-product")}
          />
        </div>
      ) : viewMode === "grid" ? (
        /* GRID CARDS VIEW (Clean & Compact with 3-dot dropdown menu containing Detail) */
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {paginated.map((prod) => {
              const isMenuOpen = activeActionMenuId === prod.id;

              return (
                <div
                  key={prod.id}
                  className="rounded-xl border border-white/[0.08] bg-[#0d121c] overflow-hidden hover:border-indigo-500/40 transition-all flex flex-col group shadow-sm"
                >
                  {/* Card Thumbnail */}
                  <div
                    onClick={() => setSelectedDetailProduct(prod)}
                    className="relative h-32 w-full bg-black/40 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/75 text-zinc-300 border border-white/10">
                        {prod.sku}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <StatusBadge status={prod.status} size="sm" />
                    </div>
                    {prod.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-mono text-zinc-300 border border-white/10">
                        <Images className="h-2.5 w-2.5 text-indigo-400" />
                        <span>{prod.images.length}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[10px] text-indigo-400 font-medium">
                        {prod.category}
                      </span>
                      <h3
                        onClick={() => setSelectedDetailProduct(prod)}
                        className="font-semibold text-white text-xs leading-snug line-clamp-1 group-hover:text-indigo-300 transition-colors mt-0.5 cursor-pointer"
                      >
                        {prod.name}
                      </h3>
                      <div className="mt-1.5 flex items-baseline justify-between font-mono">
                        <span className="text-xs font-bold text-emerald-400">
                          ETB {prod.basePrice.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          MOQ: {prod.moq.toLocaleString()} {prod.unit}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1 border-t border-white/[0.06]">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-zinc-400">Stock:</span>
                        <span className="font-medium text-white">
                          {prod.stock.toLocaleString()} {prod.unit}
                        </span>
                      </div>
                      <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, (prod.stock / 250000) * 100)}%` }}
                          className={`h-full rounded-full ${
                            prod.stock < 30000 ? "bg-amber-400" : "bg-emerald-400"
                          }`}
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1 relative">
                        <div className="flex items-center gap-1 text-[11px] text-amber-400">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="font-bold">{prod.rating}</span>
                          <span className="text-zinc-500 text-[10px]">({prod.salesCount})</span>
                        </div>

                        {/* 3 DOTS MENU IN GRID VIEW */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setActiveActionMenuId(isMenuOpen ? null : prod.id)}
                            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title="More Actions"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {isMenuOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-30"
                                onClick={() => setActiveActionMenuId(null)}
                              />
                              <div className="absolute right-0 bottom-full mb-1 z-40 w-44 rounded-xl border border-white/10 bg-[#0d121f] p-1 text-left shadow-2xl animate-in fade-in zoom-in-95">
                                {/* DETAIL IN 3 DOTS */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionMenuId(null);
                                    setSelectedDetailProduct(prod);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-600/20 transition-colors cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                                  <span>View Detail</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleEdit(prod)}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                                >
                                  <Edit className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                                  <span>Edit Product</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleTogglePublish(prod)}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                                >
                                  {prod.status === "published" ? (
                                    <>
                                      <XCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                                      <span>Move to Draft</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                      <span className="text-emerald-300">Publish Live</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDuplicate(prod)}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                                >
                                  <Copy className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                                  <span>Duplicate</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleArchive(prod.id)}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                                >
                                  <Archive className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                                  <span>Archive Product</span>
                                </button>

                                <div className="my-1 border-t border-white/10" />

                                <button
                                  type="button"
                                  onClick={() => handleDelete(prod.id)}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5 shrink-0" />
                                  <span>Delete Product</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination for Grid */}
          <div className="border border-white/[0.08] rounded-xl overflow-hidden">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      ) : (
        /* COMPACT TABLE VIEW (With 3-dots containing Detail) */
        <div className="rounded-xl border border-white/[0.08] bg-[#0d121c] shadow-lg overflow-hidden w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-zinc-400 font-semibold uppercase text-[10px] tracking-wider select-none">
                  <th className="py-2.5 px-3.5 min-w-[240px]">Product & SKU</th>
                  <th className="py-2.5 px-3 min-w-[140px]">Wholesale Price & MOQ</th>
                  <th className="py-2.5 px-3 min-w-[140px]">Available Stock</th>
                  <th className="py-2.5 px-3 min-w-[120px]">Sales & Reviews</th>
                  <th className="py-2.5 px-3 min-w-[90px]">Status</th>
                  <th className="py-2.5 px-3.5 w-16 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.04]">
                {paginated.map((prod) => {
                  const isMenuOpen = activeActionMenuId === prod.id;
                  const hasMultipleImages = prod.images && prod.images.length > 1;

                  return (
                    <tr
                      key={prod.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Product Thumbnail & Titles */}
                      <td className="py-2.5 px-3.5 align-middle">
                        <div className="flex items-center gap-2.5">
                          {/* Compact Thumbnail (h-11 w-11) */}
                          <div
                            onClick={() => setSelectedDetailProduct(prod)}
                            className="relative h-11 w-11 shrink-0 rounded-lg overflow-hidden border border-white/10 bg-black/40 group-hover:border-indigo-500/40 transition-colors cursor-pointer"
                          >
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            {hasMultipleImages && (
                              <div className="absolute bottom-0.5 right-0.5 flex items-center gap-0.5 rounded bg-black/85 px-1 py-0.2 text-[8px] font-mono text-zinc-300 border border-white/10">
                                <Images className="h-2 w-2 text-indigo-400" />
                                <span>{prod.images.length}</span>
                              </div>
                            )}
                          </div>

                          {/* Titles & Specs */}
                          <div className="space-y-0.5 min-w-0 max-w-xs">
                            <h3
                              onClick={() => setSelectedDetailProduct(prod)}
                              className="font-semibold text-white text-xs leading-snug truncate group-hover:text-indigo-300 transition-colors cursor-pointer"
                            >
                              {prod.name}
                            </h3>
                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
                              <span className="rounded bg-white/[0.04] border border-white/10 px-1.5 py-0.2 text-zinc-300">
                                {prod.sku}
                              </span>
                              <span className="text-indigo-400 truncate max-w-[120px]">
                                {prod.category}
                              </span>
                              {prod.grade && (
                                <span className="text-zinc-500 hidden sm:inline">
                                  · {prod.grade}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Wholesale Pricing & MOQ */}
                      <td className="py-2.5 px-3 align-middle">
                        <div className="space-y-0.5">
                          <div className="font-mono font-bold text-emerald-400 text-xs sm:text-[13px]">
                            ETB {prod.basePrice.toLocaleString()} <span className="text-[10px] font-normal text-zinc-400">/{prod.unit}</span>
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono">
                            MOQ: <span className="text-white font-medium">{prod.moq.toLocaleString()} {prod.unit}</span>
                          </div>
                          {prod.tierPricing && prod.tierPricing.length > 1 && (
                            <span className="inline-block text-[9px] text-indigo-300 font-medium">
                              ✓ {prod.tierPricing.length} volume tiers
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock & Warehouse Health */}
                      <td className="py-2.5 px-3 align-middle">
                        <div className="space-y-1 max-w-[130px]">
                          <div className="flex items-baseline justify-between font-mono text-[11px]">
                            <span className="font-medium text-white">
                              {prod.stock.toLocaleString()} <span className="text-zinc-400 text-[10px]">{prod.unit}</span>
                            </span>
                            {prod.stock < 30000 && (
                              <span className="text-[9px] text-amber-400 font-sans font-semibold">Low</span>
                            )}
                          </div>
                          {/* Visual Stock Meter (Thin 1.5px) */}
                          <div className="h-1 w-full rounded-full bg-white/[0.08] overflow-hidden">
                            <div
                              style={{ width: `${Math.min(100, (prod.stock / 250000) * 100)}%` }}
                              className={`h-full rounded-full transition-all duration-300 ${
                                prod.stock < 30000 ? "bg-amber-400" : "bg-emerald-400"
                              }`}
                            />
                          </div>
                          {prod.reservedStock > 0 && (
                            <div className="text-[9px] text-zinc-400 font-mono">
                              Res: {prod.reservedStock.toLocaleString()} {prod.unit}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Sales & Performance */}
                      <td className="py-2.5 px-3 align-middle">
                        <div className="space-y-0.5">
                          <div className="font-mono text-white text-xs font-medium">
                            {prod.salesCount.toLocaleString()} sold
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-amber-400">
                            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                            <span className="font-bold">{prod.rating}</span>
                            <span className="text-zinc-400 text-[9px]">({prod.ratingCount})</span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 align-middle">
                        <StatusBadge status={prod.status} size="sm" />
                      </td>

                      {/* Actions: ONLY 3 DOTS MENU WITH DETAIL INSIDE */}
                      <td className="py-2.5 px-3.5 align-middle text-right relative">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => setActiveActionMenuId(isMenuOpen ? null : prod.id)}
                            title="More Actions"
                            className={`rounded-lg p-1.5 text-zinc-400 hover:text-white transition-all cursor-pointer ${
                              isMenuOpen
                                ? "bg-white/15 text-white shadow-xs ring-1 ring-white/20"
                                : "hover:bg-white/10"
                            }`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Action Menu Dropdown */}
                        {isMenuOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-30"
                              onClick={() => setActiveActionMenuId(null)}
                            />
                            <div className="absolute right-3.5 mt-1 z-40 w-48 rounded-xl border border-white/10 bg-[#0d121f] p-1 text-left shadow-2xl animate-in fade-in zoom-in-95">
                              {/* DETAIL OPTION INSIDE 3 DOTS */}
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveActionMenuId(null);
                                  setSelectedDetailProduct(prod);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-600/20 hover:text-indigo-200 transition-colors cursor-pointer"
                              >
                                <Eye className="h-4 w-4 text-indigo-400 shrink-0" />
                                <span>Product Detail</span>
                              </button>

                              {/* Edit Specifications */}
                              <button
                                type="button"
                                onClick={() => handleEdit(prod)}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                              >
                                <Edit className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                                <span>Edit Product</span>
                              </button>

                              {/* Publish / Draft Toggle */}
                              <button
                                type="button"
                                onClick={() => handleTogglePublish(prod)}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                              >
                                {prod.status === "published" ? (
                                    <>
                                      <XCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                                      <span>Move to Draft</span>
                                    </>
                                ) : (
                                    <>
                                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                      <span className="text-emerald-300">Publish Live</span>
                                    </>
                                )}
                              </button>

                              {/* Copy / Duplicate */}
                              <button
                                type="button"
                                onClick={() => handleDuplicate(prod)}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                              >
                                <Copy className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                                <span>Duplicate Draft</span>
                              </button>

                              {/* Archive */}
                              <button
                                type="button"
                                onClick={() => handleArchive(prod.id)}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                              >
                                <Archive className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                                <span>Archive Product</span>
                              </button>

                              <div className="my-1 border-t border-white/10" />

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => handleDelete(prod.id)}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5 shrink-0" />
                                <span>Delete Product</span>
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="border-t border-white/[0.08] bg-white/[0.01] px-4 py-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* 5. Comprehensive Product Detail Modal with Full Orders History */}
      <ProductDetailModal
        product={selectedDetailProduct}
        isOpen={Boolean(selectedDetailProduct)}
        onClose={() => setSelectedDetailProduct(null)}
        onEdit={(prod) => {
          setSelectedDetailProduct(null);
          setSubView("create-product");
          toast.info(`Editing ${prod.name}`);
        }}
      />
    </div>
  );
}

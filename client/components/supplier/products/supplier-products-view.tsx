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
  Layers,
  Package,
  TrendingUp,
  ExternalLink,
  Building,
} from "lucide-react";
import { PageHeader } from "../shared/page-header";
import { DataFilterBar } from "../shared/data-filter-bar";
import { StatusBadge } from "../shared/status-badge";
import { Pagination } from "../shared/pagination";
import { EmptyState } from "../shared/empty-state";
import { useSupplierStore } from "@/store/supplier-store";
import { useAuthStore } from "@/store/auth-store";
import { B2BProduct, ProductStatus } from "@/types/supplier";
import { toast } from "sonner";

export function SupplierProductsView() {
  const { products, updateProductStatus, setSubView, setActiveTab, currentStaffUser } = useSupplierStore();
  const { user } = useAuthStore();

  const isBranchManager = user?.staffRole === "branch_manager" || currentStaffUser?.role === "branch_manager";
  const userBranchId = user?.branchId || currentStaffUser?.branchId;
  const userBranchName = user?.branchName || currentStaffUser?.branchName;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  const pageSize = 8;

  // Strict Branch Scoping: Branch manager ONLY sees products in their branch!
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

  const toggleSelectAll = () => {
    if (selectedProductIds.length === paginated.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(paginated.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter((item) => item !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  const handleDuplicate = (prod: B2BProduct) => {
    toast.success(`Duplicated draft created for ${prod.name}`);
    setActiveActionMenuId(null);
  };

  const handleArchive = (id: string) => {
    updateProductStatus(id, "archived");
    setActiveActionMenuId(null);
    toast.info(`Product ${id} archived`);
  };

  const handleTogglePublish = (prod: B2BProduct) => {
    const newStatus: ProductStatus = prod.status === "published" ? "draft" : "published";
    updateProductStatus(prod.id, newStatus);
    setActiveActionMenuId(null);
    toast.success(`Status updated to ${newStatus}`);
  };

  const categories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <div className="space-y-6 w-full">
      {/* 1. Header with Breadcrumbs & Action Button */}
      <PageHeader
        title="Product Catalog"
        subtitle="Manage wholesale specifications, volume pricing schedules, inventory stock buffers, and visibility"
        breadcrumbs={[{ label: "Dashboard", onClick: () => setActiveTab("dashboard") }, { label: "Products" }]}
        actions={
          <button
            onClick={() => setSubView("create-product")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Wholesale Product</span>
          </button>
        }
      />

      {/* Branch Manager Focus Banner */}
      {(user?.staffRole === "branch_manager" || currentStaffUser?.role === "branch_manager") && (
        <div className="p-3.5 rounded-2xl border border-blue-500/30 bg-blue-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-blue-300">
            <Building className="h-4 w-4 shrink-0 text-blue-400" />
            <span>
              Branch Operations View: Managing inventory for <strong>{user?.branchName || currentStaffUser?.branchName}</strong> (Logged in as {user?.name || currentStaffUser?.fullName})
            </span>
          </div>
          <button
            onClick={() => setSubView("create-product")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 py-1.5 text-xs shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Product for this Branch</span>
          </button>
        </div>
      )}

      {/* 2. Full-Width Search & Filter Bar */}
      <DataFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter catalog items by product title, SKU code, category, or origin..."
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { value: "published", label: "Published" },
          { value: "draft", label: "Draft" },
          { value: "pending_approval", label: "Pending Approval" },
          { value: "out_of_stock", label: "Out of Stock" },
          { value: "archived", label: "Archived" },
        ]}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categoryOptions={categories.map((c) => ({ value: c, label: c }))}
        sortOption={sortOption}
        onSortChange={setSortOption}
        sortOptions={[
          { value: "newest", label: "Newest First" },
          { value: "sales_desc", label: "Highest Sales Volume" },
          { value: "price_desc", label: "Price: High to Low" },
          { value: "price_asc", label: "Price: Low to High" },
          { value: "stock_desc", label: "Highest Available Stock" },
        ]}
        onReset={() => {
          setSearchQuery("");
          setStatusFilter("all");
          setCategoryFilter("all");
          setSortOption("newest");
        }}
        onExport={() => toast.success("Exporting catalog CSV...")}
      />

      {/* 3. Bulk Selection Notification Bar */}
      {selectedProductIds.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-5 py-3.5 text-xs shadow-sm">
          <span className="font-semibold text-indigo-300">
            {selectedProductIds.length} wholesale products selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                selectedProductIds.forEach((id) => updateProductStatus(id, "published"));
                setSelectedProductIds([]);
                toast.success("Selected products published");
              }}
              className="rounded-lg bg-indigo-600 px-3.5 py-1.5 font-semibold text-white hover:bg-indigo-500 cursor-pointer transition-colors shadow-xs"
            >
              Publish Selected
            </button>
            <button
              onClick={() => {
                selectedProductIds.forEach((id) => updateProductStatus(id, "archived"));
                setSelectedProductIds([]);
                toast.info("Selected products archived");
              }}
              className="rounded-lg border border-white/15 bg-white/10 px-3.5 py-1.5 font-semibold text-zinc-200 hover:bg-white/20 cursor-pointer transition-colors"
            >
              Archive Selected
            </button>
            <button
              onClick={() => setSelectedProductIds([])}
              className="text-xs text-zinc-400 hover:text-white px-2 py-1 cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* 4. Full-Width Spacious Modern Table */}
      {paginated.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0d121f] p-10 shadow-xs">
          <EmptyState
            title="No Products Found"
            description="No catalog items match your search and filter criteria. Adjust your filters or add a new wholesale product."
            actionLabel="Add New Wholesale Product"
            onAction={() => setSubView("create-product")}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.08] bg-[#0d121c] shadow-xl overflow-hidden w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-zinc-400 font-semibold uppercase text-[11px] tracking-wider select-none">
                  {/* Select */}
                  <th className="py-4 px-5 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={selectedProductIds.length === paginated.length && paginated.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded accent-indigo-600 h-4 w-4 cursor-pointer"
                    />
                  </th>

                  {/* Product Details */}
                  <th className="py-4 px-6 min-w-[340px]">Product & Specifications</th>

                  {/* Pricing & MOQ */}
                  <th className="py-4 px-6 min-w-[200px]">Wholesale Pricing & MOQ</th>

                  {/* Stock & Warehouse Health */}
                  <th className="py-4 px-6 min-w-[220px]">Available Stock</th>

                  {/* Commercial Performance */}
                  <th className="py-4 px-6 min-w-[180px]">Sales & Performance</th>

                  {/* Catalog Status */}
                  <th className="py-4 px-6 min-w-[140px]">Catalog Status</th>

                  {/* Actions */}
                  <th className="py-4 px-6 min-w-[90px] text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.05]">
                {paginated.map((prod) => {
                  const isSelected = selectedProductIds.includes(prod.id);
                  const isMenuOpen = activeActionMenuId === prod.id;
                  const hasMultipleImages = prod.images && prod.images.length > 1;

                  return (
                    <tr
                      key={prod.id}
                      className={`hover:bg-white/[0.02] transition-colors group ${
                        isSelected ? "bg-indigo-500/10" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-5 px-5 text-center align-middle">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(prod.id)}
                          className="rounded accent-indigo-600 h-4 w-4 cursor-pointer"
                        />
                      </td>

                      {/* Product Details with Large Preview Thumbnail */}
                      <td className="py-5 px-6 align-middle">
                        <div className="flex items-center gap-4">
                          {/* Large Image Preview (h-20 w-20) */}
                          <div className="relative h-20 w-20 sm:h-22 sm:w-22 shrink-0 rounded-xl overflow-hidden border border-white/10 bg-black/40 shadow-sm group-hover:border-indigo-500/50 transition-all">
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {hasMultipleImages && (
                              <div className="absolute bottom-1 right-1 flex items-center gap-1 rounded bg-black/85 px-1.5 py-0.5 text-[9px] font-mono text-white border border-white/10">
                                <Images className="h-3 w-3 text-indigo-400" />
                                <span>{prod.images.length}</span>
                              </div>
                            )}
                          </div>

                          {/* Titles & Specs */}
                          <div className="space-y-1.5 min-w-0 max-w-sm">
                            <h3 className="font-bold text-white text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-indigo-300 transition-colors">
                              {prod.name}
                            </h3>

                            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                              <span className="font-mono rounded bg-white/[0.05] border border-white/10 px-2 py-0.5 text-[11px] text-zinc-300 font-medium">
                                {prod.sku}
                              </span>
                              <span className="rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 text-[11px] font-medium">
                                {prod.category}
                              </span>
                              {prod.grade && (
                                <span className="text-zinc-300 text-xs font-medium">
                                  {prod.grade}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Wholesale Pricing & MOQ */}
                      <td className="py-5 px-6 align-middle">
                        <div className="space-y-1">
                          <div className="font-mono font-bold text-emerald-400 text-sm sm:text-base">
                            ETB {prod.basePrice.toLocaleString()} / {prod.unit}
                          </div>

                          <div className="text-xs text-zinc-300 font-mono">
                            <span className="text-zinc-400">Min. Order (MOQ): </span>
                            <span className="font-semibold text-white">
                              {prod.moq.toLocaleString()} {prod.unit}
                            </span>
                          </div>

                          {prod.tierPricing && prod.tierPricing.length > 1 ? (
                            <span className="inline-block text-[11px] text-indigo-300 font-medium pt-0.5">
                              ✓ {prod.tierPricing.length} Wholesale Volume Tiers
                            </span>
                          ) : (
                            <span className="inline-block text-[11px] text-zinc-400 pt-0.5">
                              Standard Bulk Price
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock & Warehouse Health */}
                      <td className="py-5 px-6 align-middle">
                        <div className="space-y-2 max-w-[190px]">
                          <div className="flex items-baseline justify-between font-mono text-xs">
                            <span className="text-zinc-400">Available:</span>
                            <span className="font-bold text-white text-sm">
                              {prod.stock.toLocaleString()} {prod.unit}
                            </span>
                          </div>

                          {/* Visual Stock Meter */}
                          <div className="h-2 w-full rounded-full bg-white/[0.08] overflow-hidden">
                            <div
                              style={{ width: `${Math.min(100, (prod.stock / 250000) * 100)}%` }}
                              className={`h-full rounded-full transition-all duration-500 ${
                                prod.stock < 30000 ? "bg-amber-400" : "bg-emerald-400"
                              }`}
                            />
                          </div>

                          {prod.reservedStock > 0 && (
                            <div className="text-[11px] text-zinc-400 font-mono">
                              Reserved: {prod.reservedStock.toLocaleString()} {prod.unit}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Commercial Performance */}
                      <td className="py-5 px-6 align-middle">
                        <div className="space-y-1">
                          <div className="font-mono text-white font-semibold text-xs sm:text-sm">
                            {prod.salesCount.toLocaleString()} {prod.unit} sold
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-amber-400">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-bold">{prod.rating}</span>
                            <span className="text-zinc-400 text-[11px]">({prod.ratingCount} reviews)</span>
                          </div>

                          <div className="text-[11px] text-zinc-400">
                            {prod.views.toLocaleString()} verified buyer views
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-5 px-6 align-middle">
                        <div className="space-y-1">
                          <StatusBadge status={prod.status} size="sm" />
                          <div className="text-[11px] text-zinc-400 font-mono">
                            {prod.status === "published" ? "Live in B2B Catalog" : "Draft / Private"}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-5 px-6 align-middle text-right relative">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => setActiveActionMenuId(isMenuOpen ? null : prod.id)}
                            title="More Actions"
                            className={`rounded-lg border p-2 text-zinc-300 hover:text-white transition-all cursor-pointer ${
                              isMenuOpen
                                ? "bg-white/15 border-white/20 text-white shadow-sm"
                                : "border-white/10 bg-white/[0.03] hover:bg-white/10"
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
                            <div className="absolute right-6 mt-1 z-40 w-52 rounded-xl border border-white/10 bg-[#0d121f] p-1.5 text-left shadow-2xl animate-in fade-in zoom-in-95">
                              {/* Publish / Draft Toggle */}
                              <button
                                onClick={() => handleTogglePublish(prod)}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                              >
                                {prod.status === "published" ? (
                                  <>
                                    <XCircle className="h-4 w-4 text-amber-400 shrink-0" />
                                    <span>Unpublish (Move to Draft)</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                                    <span className="text-emerald-300">Publish to Catalog</span>
                                  </>
                                )}
                              </button>

                              {/* Copy / Duplicate */}
                              <button
                                onClick={() => handleDuplicate(prod)}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                              >
                                <Copy className="h-4 w-4 text-indigo-400 shrink-0" />
                                <span>Copy / Duplicate Draft</span>
                              </button>

                              {/* Edit Specifications */}
                              <button
                                onClick={() => {
                                  setActiveActionMenuId(null);
                                  setSubView("create-product");
                                  toast.info(`Opening edit specification template for ${prod.name}`);
                                }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                              >
                                <Edit className="h-4 w-4 text-zinc-400 shrink-0" />
                                <span>Edit Specifications</span>
                              </button>

                              {/* Archive */}
                              <button
                                onClick={() => handleArchive(prod.id)}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                              >
                                <Archive className="h-4 w-4 text-zinc-400 shrink-0" />
                                <span>Archive Product</span>
                              </button>

                              <div className="my-1 border-t border-white/10" />

                              {/* Delete */}
                              <button
                                onClick={() => {
                                  toast.error(`Product ${prod.sku} deleted from catalog`);
                                  setActiveActionMenuId(null);
                                }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4 shrink-0" />
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

          {/* 5. Pagination Footer */}
          <div className="border-t border-white/10 bg-white/[0.01] px-6 py-3">
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
    </div>
  );
}

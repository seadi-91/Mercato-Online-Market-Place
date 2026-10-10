"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  Store,
  Box,
  Eye,
  MoreVertical,
  CheckCircle2,
  Package,
  ShieldCheck,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteProductAdmin,
  fetchAllProducts,
  reactivateProduct,
  suspendProduct,
} from "@/lib/api/catalog";

interface ProductRowMeta {
  id: string;
  sellerId: string;
  title: string;
  seller: string;
  category: string;
  price: number;
  stock: number;
  status: "ACTIVE" | "OUT_OF_STOCK";
  submittedDate: string;
  image: string;
}

export function AdminCatalog() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductRowMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductRowMeta | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const result = await fetchAllProducts({ limit: 100, sortBy: "createdAt", sortOrder: "DESC" });

        const mapped: ProductRowMeta[] = result.products.map((product) => ({
          id: product.id,
          sellerId: product.sellerId || "",
          title: product.name,
          seller: product.shopName || "Verified Merchant",
          category: product.category || "General",
          price: product.price,
          stock: product.stock,
          status: product.stock > 0 ? "ACTIVE" : "OUT_OF_STOCK",
          submittedDate: new Date().toISOString().slice(0, 10),
          image: product.image || "",
        }));

        setProducts(mapped);
      } catch (error) {
        console.error("Failed to load product catalog:", error);
        toast.error("Product load failed", {
          description: "Could not fetch backend products for moderation.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((item) => {
      const searchText = `${item.title} ${item.seller} ${item.category}`.toLowerCase();
      const matchSearch = searchText.includes(search.toLowerCase());
      const matchStatus = filterStatus === "ALL" || item.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [products, search, filterStatus]);

  const activeCount = products.filter((p) => p.status === "ACTIVE").length;

  const handleViewDetails = (productId: string) => {
    setOpenMenuId(null);
    router.push(`/dashboard/admin/products/${encodeURIComponent(productId)}`);
  };

  const handleMerchantStore = (item: ProductRowMeta) => {
    if (!item.sellerId) {
      toast.info("Merchant store unavailable", {
        description: "This product does not include a seller reference.",
      });
      return;
    }

    setOpenMenuId(null);
    router.push(`/sellers?sellerId=${encodeURIComponent(item.sellerId)}`);
  };

  const handleProductSuspendToggle = async (item: ProductRowMeta, nextIsActive: boolean) => {
    setOpenMenuId(null);
    setUpdatingProductId(item.id);

    try {
      const result = nextIsActive ? await reactivateProduct(item.id) : await suspendProduct(item.id);
      setProducts((prev) =>
        prev.map((product) =>
          product.id === item.id
            ? {
                ...product,
                status: nextIsActive ? "ACTIVE" : "OUT_OF_STOCK",
              }
            : product,
        ),
      );

      toast.success(result.isActive ? "Product restored and visible to customers" : "Product suspended and hidden from customers");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update product moderation status.";
      toast.error("Moderation action failed", {
        description: message,
      });
    } finally {
      setUpdatingProductId(null);
    }
  };

  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    setUpdatingProductId(productToDelete.id);

    try {
      await deleteProductAdmin(productToDelete.id);
      setProducts((prev) => prev.filter((product) => product.id !== productToDelete.id));
      toast.success(`Deleted "${productToDelete.title}" permanently from the database`);
      setProductToDelete(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete product permanently.";
      toast.error("Permanent delete failed", {
        description: message,
      });
    } finally {
      setIsDeleting(false);
      setUpdatingProductId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-[#0d121f]/90 p-3 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product title, seller, category..."
            className="h-8 w-full rounded-lg border border-white/10 bg-white/[0.04] pl-8 pr-3 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center rounded-lg border border-white/5 bg-white/[0.04] p-0.5 text-[11px]">
          {[
            { id: "ALL", label: "All Products" },
            { id: "ACTIVE", label: `Active (${activeCount})` },
            { id: "OUT_OF_STOCK", label: "Out of Stock" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer ${filterStatus === tab.id ? "bg-indigo-600 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0d121f]/90 shadow-xl backdrop-blur-xl">
        <div className="min-h-[260px] overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold text-zinc-400">
                <th className="px-3 py-2.5">Product Listing</th>
                <th className="px-3 py-2.5">Merchant / Store</th>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5">Price (ETB)</th>
                <th className="px-3 py-2.5">Stock Units</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-zinc-400">
                    Loading products from backend...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-zinc-400">
                    No products found for the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-indigo-500/30 to-cyan-500/20 text-white">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.title}
                              width={36}
                              height={36}
                              className="h-full w-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <Box className="h-4 w-4" />
                          )}
                        </div>
                        <div className="max-w-xs truncate">
                          <p className="truncate font-semibold text-white">{item.title}</p>
                          <span className="font-mono text-[10px] text-zinc-500">ID: {item.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-2.5 text-zinc-300">
                      <div className="flex items-center gap-1.5">
                        <Store className="h-3 w-3 shrink-0 text-indigo-400" />
                        <span className="max-w-[160px] truncate">{item.seller}</span>
                      </div>
                    </td>

                    <td className="px-3 py-2.5 text-zinc-300">{item.category}</td>

                    <td className="px-3 py-2.5 font-mono font-bold text-emerald-400">
                      ETB {item.price.toLocaleString()}
                    </td>

                    <td className="px-3 py-2.5 font-mono text-zinc-300">{item.stock}</td>

                    <td className="px-3 py-2.5">
                      {item.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-rose-400">
                          <Package className="h-3.5 w-3.5 shrink-0" />
                          Out of Stock
                        </span>
                      )}
                    </td>

                    <td className="relative px-3 py-2.5 text-right">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                          title="Moderation Actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {openMenuId === item.id && (
                          <>
                            <div className="fixed inset-0 z-30 cursor-default" onClick={() => setOpenMenuId(null)} />
                            <div className="app-dropdown-panel absolute right-0 z-40 mt-1 w-48 space-y-0.5 rounded-xl border border-white/10 bg-[#0f172a] p-1.5 text-left shadow-2xl animate-in fade-in zoom-in-95 duration-100">
                              <button
                                type="button"
                                onClick={() => handleViewDetails(item.id)}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-300 transition-colors hover:bg-indigo-500/15 cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>View details</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleProductSuspendToggle(item, item.status !== "ACTIVE")}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                                disabled={updatingProductId === item.id}
                              >
                                <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                                <span>{item.status === "ACTIVE" ? "Suspend" : "Activate"}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setProductToDelete(item);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-300 transition-colors hover:bg-rose-500/10 hover:text-rose-200 cursor-pointer"
                                disabled={updatingProductId === item.id}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                                <span>Delete</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleMerchantStore(item)}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                              >
                                <Store className="h-3.5 w-3.5 text-cyan-400" />
                                <span>Merchant store</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Product Confirmation Pop-Up Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-rose-500/30 bg-[#0f172a] shadow-2xl">
            <div className="flex items-center gap-3 border-b border-white/10 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Are you sure you want to delete this product?
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-[280px]">
                  {productToDelete.title}
                </p>
              </div>
            </div>

            <div className="p-4 space-y-3 text-xs text-zinc-300">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Product:</span>
                  <span className="font-semibold text-white truncate max-w-[220px] text-right">{productToDelete.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Merchant / Seller:</span>
                  <span className="text-zinc-200">{productToDelete.seller}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Category:</span>
                  <span className="text-zinc-300">{productToDelete.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Price:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ETB {productToDelete.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Stock:</span>
                  <span className="font-mono text-zinc-300">{productToDelete.stock} units</span>
                </div>
              </div>
              <p className="text-rose-300/90 text-[11px] leading-relaxed">
                This action cannot be undone. This product will be permanently deleted from the catalog and database.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-white/10 bg-black/30 p-3.5">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="rounded-lg px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProduct}
                disabled={isDeleting}
                className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

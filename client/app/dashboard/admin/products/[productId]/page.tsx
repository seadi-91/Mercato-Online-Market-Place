"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Eye,
  Image as ImageIcon,
  Mail,
  MapPin,
  Package,
  Phone,
  Store,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api/client";
import type { BackendProduct } from "@/lib/api/catalog";
import { useAdminUIStore } from "@/store/ui-store";

interface AdminSellerProfile {
  id?: string;
  userId?: string;
  fullName?: string;
  email?: string;
  alternatePhone?: string;
  shopName?: string;
  marketZone?: string;
  city?: string;
  subCity?: string;
  specificLocation?: string;
  role?: string;
  isVerifiedMerchant?: boolean;
  merchantKycStatus?: string;
  isActive?: boolean;
  stats?: {
    postedProducts?: number;
    totalOrders?: number;
  };
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-white">
        {value === null || value === undefined || value === "" ? "Not provided" : value}
      </p>
    </div>
  );
}

function formatPrice(value: string | number | undefined) {
  if (value === undefined || value === "") return "Not provided";
  const amount = Number(value);
  return Number.isFinite(amount) ? `ETB ${amount.toLocaleString()}` : String(value);
}

function formatDate(value?: string) {
  if (!value) return "Not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function AdminProductDetailPage() {
  const params = useParams<{ productId: string }>();
  const router = useRouter();
  const setActiveTab = useAdminUIStore((state) => state.setActiveTab);
  const productId = Array.isArray(params.productId) ? params.productId[0] : params.productId;
  const [product, setProduct] = useState<BackendProduct | null>(null);
  const [seller, setSeller] = useState<AdminSellerProfile | null>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sellerError, setSellerError] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab("catalog");
  }, [setActiveTab]);

  useEffect(() => {
    let isCurrent = true;

    async function loadProductDetail() {
      if (!productId) {
        setError("Product ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setSellerError(null);
      try {
        const productDetail = await api.get<BackendProduct>(
          `/catalog/products/${encodeURIComponent(productId)}`,
        );
        if (!isCurrent) return;
        setProduct(productDetail);
        setSelectedImage(productDetail.images?.[0] || "");

        if (productDetail.sellerId) {
          try {
            const sellerDetail = await api.get<AdminSellerProfile>(
              `/admin/users/${encodeURIComponent(productDetail.sellerId)}/details`,
            );
            if (isCurrent) setSeller(sellerDetail);
          } catch (sellerLoadError) {
            console.error("Failed to load product seller details:", sellerLoadError);
            if (isCurrent) {
              setSellerError("Seller profile could not be loaded from the backend.");
            }
          }
        } else {
          setSeller(null);
          setSellerError("This product does not include a seller ID.");
        }
      } catch (loadError) {
        console.error("Failed to load admin product details:", loadError);
        if (isCurrent) {
          setError("Could not load this product from the backend.");
          toast.error("Product details unavailable", {
            description: "The backend could not return the requested product.",
          });
        }
      } finally {
        if (isCurrent) setLoading(false);
      }
    }

    loadProductDetail();
    return () => {
      isCurrent = false;
    };
  }, [productId]);

  const backToCatalog = () => {
    router.push("/dashboard/admin");
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="mt-3 text-sm text-zinc-400">Loading product and seller details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
        <Package className="h-8 w-8 text-rose-400" />
        <p className="mt-3 text-sm text-zinc-300">{error || "Product was not found."}</p>
        <button
          type="button"
          onClick={backToCatalog}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </button>
      </div>
    );
  }

  const images = product.images || [];
  const sellerName = seller?.fullName || seller?.shopName || "Seller profile unavailable";
  const status = product.isActive ? "Active" : "Inactive";
  const availability = product.isAvailable ? "Available" : "Unavailable";

  return (
    <div className="w-full space-y-5 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={backToCatalog}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Products
        </button>
        <p className="text-xs text-zinc-500">
          Product ID <span className="font-mono text-zinc-400">{product.id}</span>
        </p>
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/90 p-4 shadow-xl backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-300">
              Admin product detail
            </p>
            <h1 className="mt-1 break-words text-2xl font-bold text-white sm:text-3xl">
              {product.title}
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              {product.category?.name || "Category not provided"}
              <span className="px-2 text-zinc-600">·</span>
              SKU: {product.sku || "Not provided"}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${product.isActive ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-rose-500/30 bg-rose-500/10 text-rose-300"}`}>
              {status}
            </span>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${product.isAvailable ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300" : "border-zinc-500/30 bg-zinc-500/10 text-zinc-300"}`}>
              {availability}
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
          <div className="min-w-0 space-y-4">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_104px]">
              <div className="relative flex aspect-[4/3] min-h-64 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#090d16]">
                {selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt={product.title}
                    fill
                    unoptimized
                    className="object-contain"
                    sizes="(max-width: 1280px) 100vw, 60vw"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-zinc-500">
                    <ImageIcon className="h-10 w-10" />
                    <span className="text-xs">No product image available</span>
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto md:flex-col md:overflow-y-auto">
                  {images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      aria-label={`Show product image ${index + 1}`}
                      className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-[#090d16] md:h-24 md:w-full ${selectedImage === image ? "border-indigo-400 ring-2 ring-indigo-500/30" : "border-white/10"}`}
                    >
                      <Image
                        src={image}
                        alt={`${product.title} image ${index + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="100px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <h2 className="text-sm font-semibold text-white">Description</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                {product.description || "No description provided."}
              </p>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <h2 className="mb-3 text-sm font-semibold text-white">Product information</h2>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                <DetailField label="Brand" value={product.brand} />
                <DetailField label="Origin" value={product.origin} />
                <DetailField label="Quality grade" value={product.grade} />
                <DetailField label="Unit" value={product.unit} />
                <DetailField label="Minimum order quantity" value={product.minOrderQuantity} />
                <DetailField label="Low stock threshold" value={product.lowStockThreshold} />
                <DetailField label="Warehouse location" value={product.warehouseLocation} />
                <DetailField label="Branch" value={product.branchName || product.branchId} />
                <DetailField label="Lead time (days)" value={product.leadTimeDays} />
              </div>
              {!!product.certifications?.length && (
                <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    Certifications
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.certifications.map((certification) => (
                      <span key={certification} className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-200">
                        {certification}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {!!product.tieredPricing?.length && (
              <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                <h2 className="border-b border-white/10 px-4 py-3 text-sm font-semibold text-white">
                  Tiered pricing
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[420px] text-left text-xs">
                    <thead className="text-zinc-500">
                      <tr>
                        <th className="px-4 py-2 font-medium">Quantity range</th>
                        <th className="px-4 py-2 font-medium">Price per unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-zinc-300">
                      {product.tieredPricing.map((tier, index) => (
                        <tr key={tier.id || `${tier.minQuantity}-${index}`}>
                          <td className="px-4 py-2">
                            {tier.minQuantity}–{tier.maxQuantity ?? "∞"}
                          </td>
                          <td className="px-4 py-2 font-mono">
                            {formatPrice(tier.discountedPricePerUnit)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>

          <aside className="min-w-0 space-y-4">
            <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <h2 className="text-sm font-semibold text-white">Inventory and pricing</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <DetailField label="Retail price" value={formatPrice(product.retailPrice)} />
                <DetailField label="Wholesale price" value={formatPrice(product.wholesalePrice)} />
                <DetailField label="Stock quantity" value={`${product.stockQuantity} ${product.unit || ""}`.trim()} />
                <DetailField label="Status" value={product.status} />
                <DetailField label="Views" value={product.views} />
                <DetailField label="Sales count" value={product.salesCount} />
                <DetailField label="Rating" value={product.rating} />
                <DetailField label="Rating count" value={product.ratingCount} />
              </div>
            </section>

            <section className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.04] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
                  <UserRound className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-300">
                    Posted by seller
                  </p>
                  <h2 className="mt-1 break-words text-lg font-bold text-white">{sellerName}</h2>
                  {seller?.shopName && (
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-zinc-300">
                      <Store className="h-3.5 w-3.5 text-indigo-300" />
                      {seller.shopName}
                    </p>
                  )}
                </div>
                {seller?.isVerifiedMerchant && (
                  <BadgeCheck className="ml-auto h-5 w-5 shrink-0 text-emerald-400" aria-label="Verified seller" />
                )}
              </div>

              {sellerError && (
                <p role="status" className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2 text-xs text-amber-200">
                  {sellerError}
                </p>
              )}
              {seller && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <DetailField label="Seller ID" value={seller.userId || seller.id || product.sellerId} />
                  <DetailField label="Account role" value={seller.role} />
                  <DetailField label="Email" value={seller.email} />
                  <DetailField label="Phone" value={seller.alternatePhone} />
                  <DetailField label="Merchant verification" value={seller.merchantKycStatus || (seller.isVerifiedMerchant ? "Verified" : "Unverified")} />
                  <DetailField label="Account status" value={seller.isActive === undefined ? undefined : seller.isActive ? "Active" : "Inactive"} />
                  <DetailField label="Location" value={[seller.specificLocation, seller.subCity, seller.city].filter(Boolean).join(", ")} />
                  <DetailField label="Market zone" value={seller.marketZone} />
                  <DetailField label="Products posted" value={seller.stats?.postedProducts} />
                  <DetailField label="Orders" value={seller.stats?.totalOrders} />
                </div>
              )}

              {seller?.email && (
                <a
                  href={`mailto:${seller.email}`}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-indigo-400/20 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/20"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Contact seller
                </a>
              )}
              {seller?.alternatePhone && (
                <a
                  href={`tel:${seller.alternatePhone}`}
                  className="ml-2 mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/[0.08]"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Call seller
                </a>
              )}
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <h2 className="text-sm font-semibold text-white">Listing details</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <DetailField label="Created" value={formatDate(product.createdAt)} />
                <DetailField label="Last updated" value={formatDate(product.updatedAt)} />
                <DetailField label="Category ID" value={product.categoryId} />
                <DetailField label="Branch ID" value={product.branchId} />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-400">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-indigo-300" />
                  Listed {formatDate(product.createdAt)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-cyan-300" />
                  {product.views ?? 0} views
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-300" />
                  {seller?.marketZone || product.branchName || product.warehouseLocation || "Location not provided"}
                </span>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </div>
  );
}

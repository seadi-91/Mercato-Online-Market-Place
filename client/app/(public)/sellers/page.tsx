"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Star,
} from "lucide-react";
import { fetchProducts, fetchSellerProfile, type SellerProfile } from "@/lib/api/catalog";
import type { Product } from "@/constants/mock-data";

export default function SellersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sellerId = searchParams.get("sellerId");

  const [products, setProducts] = useState<Product[]>([]);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sellerId) {
      setProducts([]);
      setSellerProfile(null);
      setProductCount(0);
      return;
    }

    const loadSellerData = async () => {
      try {
        setLoading(true);
        const [profileResult, productsResult] = await Promise.all([
          fetchSellerProfile(sellerId),
          fetchProducts({
            sellerId,
            limit: 24,
            sortBy: "createdAt",
            sortOrder: "DESC",
          }),
        ]);

        setSellerProfile(profileResult);
        setProducts(productsResult.products);
        setProductCount(productsResult.total || productsResult.products.length);
      } catch (error) {
        console.error("Failed to load seller profile or products:", error);
        setProducts([]);
        setSellerProfile(null);
        setProductCount(0);
      } finally {
        setLoading(false);
      }
    };

    loadSellerData();
  }, [sellerId]);

  const sellerName = useMemo(
    () => sellerProfile?.shopName || sellerProfile?.fullName || products[0]?.shopName || "Merchant Store",
    [sellerProfile, products],
  );

  const sellerOwner = useMemo(
    () => sellerProfile?.fullName || products[0]?.shopName || "Verified merchant",
    [sellerProfile, products],
  );

  const sellerZone = useMemo(
    () =>
      sellerProfile?.marketZone ||
      sellerProfile?.city ||
      products[0]?.marketZone ||
      "Commercial Zone",
    [sellerProfile, products],
  );

  const sellerLocation = useMemo(() => {
    const parts = [sellerProfile?.city, sellerProfile?.subCity, sellerProfile?.specificLocation].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : sellerZone;
  }, [sellerProfile, sellerZone]);

  if (!sellerId) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-950/80 p-6 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-300">
            <StoreIcon />
          </div>
          <h1 className="text-2xl font-bold text-white">Merchant storefront</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Select a merchant from the admin catalog to view that storefront.
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 shadow-2xl">
        <div className="flex flex-col gap-6 border-b border-white/10 bg-gradient-to-r from-indigo-600/20 via-cyan-500/10 to-transparent p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                {sellerProfile?.isVerifiedMerchant || sellerProfile?.merchantKycStatus === "APPROVED"
                  ? "Verified Merchant"
                  : "Merchant Profile"}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white sm:text-3xl">{sellerName}</h1>
                <p className="mt-1 text-sm text-zinc-300">Owner: {sellerOwner}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  {sellerLocation}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5 text-emerald-400" />
                  {productCount} products posted
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/marketplace")}
              className="inline-flex items-center gap-2 self-start rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:bg-white/10"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Marketplace
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-500">Market Zone</p>
              <p className="mt-2 text-sm font-semibold text-white">{sellerZone}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-500">KYC Status</p>
              <p className="mt-2 text-sm font-semibold text-emerald-300">
                {sellerProfile?.merchantKycStatus || "PENDING"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-500">Business Contact</p>
              <p className="mt-2 text-sm font-semibold text-white">{sellerProfile?.email || "Not provided"}</p>
            </div>
          </div>

          {(sellerProfile?.alternatePhone || sellerProfile?.email) && (
            <div className="flex flex-wrap gap-3 text-xs text-zinc-300">
              {sellerProfile?.alternatePhone && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1.5">
                  <Phone className="h-3.5 w-3.5 text-amber-400" />
                  {sellerProfile.alternatePhone}
                </span>
              )}
              {sellerProfile?.email && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1.5">
                  <Mail className="h-3.5 w-3.5 text-sky-400" />
                  {sellerProfile.email}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="py-12 text-center text-sm text-zinc-400">Loading storefront products...</div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-400">
              This merchant currently has no public products available.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <div key={product.id} className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => router.push(`/products/${product.id}`)}
                    className="group w-full max-w-[240px] overflow-hidden rounded-xl border border-white/10 bg-[#0b1220] text-left transition hover:border-indigo-500/60 hover:bg-[#0f172a]"
                  >
                    <div className="relative h-28 overflow-hidden bg-slate-900 sm:h-32">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      {product.badge && (
                        <span className="absolute left-2 top-2 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.1em] text-emerald-300">
                          {product.badge}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 p-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] font-medium uppercase tracking-wider text-zinc-400">{product.category}</p>
                          <h2 className="mt-1 line-clamp-2 text-[11px] font-semibold text-white">{product.name}</h2>
                        </div>
                        <div className="flex items-center gap-1 rounded-full bg-white/5 px-1.5 py-0.5 text-[8px] text-amber-300">
                          <Star className="h-2.5 w-2.5 fill-current" />
                          {product.rating.toFixed(1)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-zinc-300">
                        <span className="font-mono text-[10px] font-bold text-emerald-400">ETB {product.price.toLocaleString()}</span>
                        <span>{product.stock} in stock</span>
                      </div>

                      <p className="line-clamp-2 text-[9px] leading-relaxed text-zinc-400">{product.description}</p>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StoreIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7">
      <path
        d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-4v-7H8v7H4a1 1 0 0 1-1-1v-9.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

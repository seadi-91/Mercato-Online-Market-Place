"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  Star,
  ShieldCheck,
  Truck,
  Heart,
  ShoppingCart,
  Plus,
  Minus,
  MapPin,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  ZoomIn,
  Maximize2,
  Award,
} from "lucide-react";
import { Product } from "@/constants/mock-data";
import { useCartStore } from "@/store";
import { useThemeStore } from "@/store/theme-store";
import { toast } from "sonner";
import { getProductTradeInfo } from "@/lib/product-classification";

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
}: ProductDetailModalProps) {
  const router = useRouter();
  const { theme } = useThemeStore();
  const isLight = theme === "light";
  const isDark = theme === "dark";
  const isSystem = theme === "system";
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState<number>(product?.rating || 5);
  const [isLoadingReviews, setIsLoadingReviews] = useState<boolean>(false);

  // Zoom Lens states
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [zoomScale, setZoomScale] = useState<number>(2.6);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setMousePos({ x, y });
  };

  const addItem = useCartStore((state) => state.addItem);
  const toggleFavorite = useCartStore((state) => state.toggleFavorite);
  const isFavorite = useCartStore((state) => state.isFavorite);

  const tradeInfo = product ? getProductTradeInfo(product) : null;

  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
      const minQty = product.minOrderQuantity || product.moq || 1;
      setQuantity(minQty);
      setAverageRating(product.rating || 5);

      // Fetch live reviews and rating from PostgreSQL Database
      setIsLoadingReviews(true);
      fetch(
        `/api/reviews?productId=${encodeURIComponent(product.id)}&title=${encodeURIComponent(
          product.name
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.reviews)) {
            setReviews(data.reviews);
            if (data.totalCount > 0) {
              setAverageRating(data.averageRating);
            }
          }
        })
        .catch((err) => console.warn("Failed to fetch product reviews:", err))
        .finally(() => setIsLoadingReviews(false));
    }
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const isFav = isFavorite(product.id);
  const gallery = product.gallery || [product.image];

  const handleAddToCart = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        shopName: product.shopName,
        marketZone: product.marketZone,
        category: product.category,
        stock: product.stock,
        rating: product.rating,
        sellerId: (product as any).sellerId,
      },
      quantity
    );
    toast.success(`Added ${quantity} unit(s) to cart`, {
      description: `${product.name} is ready in your cart.`,
    });
    onClose();
  };

  const handleBuyNow = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        shopName: product.shopName,
        marketZone: product.marketZone,
        category: product.category,
        stock: product.stock,
        rating: product.rating,
        sellerId: (product as any).sellerId,
      },
      quantity
    );
    onClose();
    router.push("/cart");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl rounded-3xl border border-app bg-app-card p-5 sm:p-7 shadow-2xl backdrop-blur-2xl text-app my-8 max-h-[90vh] overflow-y-auto app-modal-window"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-app bg-app-surface text-app-muted hover:text-app transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Left Column: Image Gallery with Precision Magnifier */}
          <div className="space-y-3">
            {/* Primary Large Image with Precision Zoom Lens */}
            <div
              ref={imageContainerRef}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onMouseMove={handleMouseMove}
              className="relative aspect-square w-full overflow-hidden rounded-2xl border border-app bg-app-surface shadow-xl cursor-crosshair select-none group"
            >
              <img
                src={selectedImage || product.image}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-transform duration-100 ease-out will-change-transform"
                style={{
                  transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                  transform: isHovered ? `scale(${zoomScale})` : "scale(1)",
                }}
              />

              {/* Escrow Tag */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-emerald-950/90 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md shadow-md pointer-events-none z-10">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Escrow Protected</span>
              </div>

              {/* Dynamic Zoom Loupe Ring */}
              {isHovered && (
                <div
                  className="absolute pointer-events-none w-24 h-24 -ml-12 -mt-12 rounded-full border-2 border-indigo-400/80 bg-indigo-500/10 backdrop-blur-[0.5px] shadow-2xl ring-4 ring-indigo-500/20 z-10"
                  style={{
                    left: `${mousePos.x}%`,
                    top: `${mousePos.y}%`,
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-indigo-300 bg-black/50 rounded-full scale-75">
                    {zoomScale}x
                  </div>
                </div>
              )}

              {/* Zoom Instruction Floating Pill */}
              <div
                className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-[11px] font-medium flex items-center gap-1.5 transition-all pointer-events-none z-10 ${
                  isHovered ? "text-indigo-300 border-indigo-500/40" : "text-zinc-300 opacity-80"
                }`}
              >
                <ZoomIn className="w-3 h-3 text-indigo-400" />
                <span>{isHovered ? `${zoomScale}x Zoom` : "Hover to Zoom"}</span>
              </div>
            </div>

            {/* Thumbnail Gallery & Zoom Presets Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              {gallery.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {gallery.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                        selectedImage === img
                          ? "border-indigo-500 ring-2 ring-indigo-500/30 scale-105"
                          : "border-app opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`View ${idx + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Quick Zoom Multiplier Buttons */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-app-surface border border-app text-xs ml-auto">
                {[2.0, 2.6, 3.5].map((scale) => (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => setZoomScale(scale)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      zoomScale === scale
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-app-muted hover:text-app"
                    }`}
                  >
                    {scale}x
                  </button>
                ))}
              </div>
            </div>

            {/* Buyer Protection Guarantee Highlight */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs space-y-1 text-app">
              <div className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>MercatoX 100% Buyer Protection Guarantee</span>
              </div>
              <p className="text-[11px] text-app-muted leading-relaxed">
                Money is held securely in protected custody. Inspect your item at delivery before handing over your 4-digit handover OTP.
              </p>
            </div>
          </div>

          {/* Right Column: Product Specs, Price, & Actions */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Category & Stock & Trade Badge */}
              <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-semibold uppercase tracking-wider text-indigo-400 text-[11px]">
                    {product.category}
                  </span>
                  {tradeInfo && tradeInfo.classification === "wholesale_only" && (
                    <span className="rounded bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      Wholesale Supply (B2B Bulk)
                    </span>
                  )}
                  {tradeInfo && tradeInfo.classification === "dual" && (
                    <span className="rounded bg-indigo-500/20 border border-indigo-500/40 px-2 py-0.5 text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                      Bulk & Retail Available
                    </span>
                  )}
                  {tradeInfo && tradeInfo.classification === "retail_only" && (
                    <span className="rounded bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                      Retail Direct (1 Unit MOQ)
                    </span>
                  )}
                </div>
                <span className="text-emerald-400 flex items-center gap-1 font-medium text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  In Stock ({product.stock} available)
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-app leading-snug">
                {product.name}
              </h2>

              {/* Merchant & Zone */}
              <div className="flex items-center gap-2 text-xs text-app-muted">
                <MapPin className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                <span className="text-app font-medium">{product.shopName}</span>
                <span>•</span>
                <span className="text-app-muted">{product.marketZone}</span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < Math.floor(averageRating)
                          ? "fill-amber-400 text-amber-500"
                          : "text-zinc-400 opacity-40"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-app">{averageRating}</span>
                <span className="text-app-muted">
                  ({reviews.length > 0 ? reviews.length : product.reviewCount} customer reviews)
                </span>
              </div>

              {/* Pricing Block: Wholesale & Retail Distinction */}
              <div className="pt-2 border-t border-app space-y-2">
                <div className="flex items-baseline gap-3 flex-wrap">
                  {tradeInfo?.wholesalePrice ? (
                    <>
                      <div>
                        <span className="text-xs text-amber-500 font-bold block">Wholesale Price (B2B):</span>
                        <span className="text-2xl sm:text-3xl font-extrabold text-amber-500 font-mono">
                          {tradeInfo.wholesalePrice.toLocaleString()}{" "}
                          <span className="text-xs font-normal text-amber-500 opacity-80">ETB / {tradeInfo.unit}</span>
                        </span>
                      </div>
                      <div className="pl-3 border-l border-app">
                        <span className="text-xs text-app-muted block">Retail Price:</span>
                        <span className="text-base text-app font-mono">
                          {tradeInfo.retailPrice.toLocaleString()} ETB
                        </span>
                        {tradeInfo.savingsPercent > 0 && (
                          <span className="ml-1.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            Save {tradeInfo.savingsPercent}% in bulk
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div>
                      <span className="text-xs text-app-muted block">Retail Price:</span>
                      <span className="text-2xl sm:text-3xl font-extrabold text-app font-mono">
                        {product.price.toLocaleString()}{" "}
                        <span className="text-sm font-normal text-cyan-500">ETB</span>
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="ml-2 text-sm text-app-muted line-through">
                          {product.originalPrice.toLocaleString()} ETB
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Minimum Order Quantity Alert for Wholesale */}
                {tradeInfo && tradeInfo.moq > 1 && (
                  <div className="inline-flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-xs text-amber-500 font-medium">
                    <span>Minimum Order Quantity (MOQ):</span>
                    <strong className="text-app font-mono">{tradeInfo.moq} {tradeInfo.unit}</strong>
                  </div>
                )}

                {/* Tiered Bulk Pricing Table if Available */}
                {product.tieredPricing && product.tieredPricing.length > 0 && (
                  <div className="rounded-xl border border-app bg-app-surface p-2.5 text-xs space-y-1.5">
                    <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wide block">
                      Tiered Volume Discounts
                    </span>
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10.5px]">
                      {product.tieredPricing.map((tier, idx) => (
                        <div key={idx} className="p-1.5 rounded-lg border border-app bg-app-card">
                          <span className="text-app-muted block">
                            {tier.minQuantity} {tier.maxQuantity ? `- ${tier.maxQuantity}` : "+"} {tradeInfo?.unit || "units"}
                          </span>
                          <span className="text-emerald-500 font-bold font-mono block">
                            {Number(tier.discountedPricePerUnit).toLocaleString()} ETB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-app-muted leading-relaxed pt-1">
                {product.description}
              </p>

              {/* Specifications Table */}
              {product.specifications && (
                <div className="rounded-xl border border-app bg-app-surface p-3 space-y-1.5 text-xs">
                  <h4 className="font-semibold text-app text-[11px] uppercase tracking-wider mb-1">
                    Key Specifications
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <div key={key}>
                        <span className="text-app-muted">{key}: </span>
                        <span className="text-app font-medium">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warranty */}
              {product.warranty && (
                <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <span>Warranty: {product.warranty}</span>
                </div>
              )}

              {/* Customer Reviews & Ratings Section (Live from PostgreSQL Database) */}
              <div className="rounded-2xl border border-app bg-app-surface p-3.5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-app pb-2">
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
                    <h4 className="font-bold text-app text-xs">
                      Customer Reviews & Ratings
                    </h4>
                  </div>
                  <span className="text-[10px] text-app-muted font-mono">
                    {reviews.length} Verified {reviews.length === 1 ? "Review" : "Reviews"}
                  </span>
                </div>

                {isLoadingReviews ? (
                  <div className="py-3 text-center text-app-muted text-xs">
                    Loading verified reviews...
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="py-2.5 text-center text-app-muted text-xs">
                    No customer reviews yet. Be the first to order and review this product!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-2.5 rounded-xl bg-app-card border border-app space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-app text-xs">
                              {rev.customerName}
                            </span>
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-semibold">
                              <ShieldCheck className="h-2.5 w-2.5" />
                              <span>Verified Purchase</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, si) => (
                              <Star
                                key={si}
                                className={`h-3 w-3 ${
                                  si < rev.rating
                                    ? "fill-amber-400 text-amber-500"
                                    : "text-zinc-400 opacity-30"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {rev.comment && (
                          <p className="text-app-muted text-[11px] leading-relaxed">
                            {rev.comment}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-app-muted">
                          {rev.tags && rev.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {rev.tags.map((t: string, ti: number) => (
                                <span
                                  key={ti}
                                  className="px-1.5 py-0.5 rounded bg-app-surface text-app-muted border border-app text-[9px]"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span />
                          )}
                          <span>
                            {new Date(rev.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-app">
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-app-muted">Quantity:</span>
                <div className="flex items-center gap-2 rounded-xl border border-app bg-app-surface p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(tradeInfo?.moq || 1, quantity - 1))}
                    className="h-7 w-7 rounded-lg bg-app-card hover:bg-app-surface border border-app flex items-center justify-center text-app transition-colors cursor-pointer shadow-xs"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-app font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="h-7 w-7 rounded-lg bg-app-card hover:bg-app-surface border border-app flex items-center justify-center text-app transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const isNow = toggleFavorite({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      shopName: product.shopName,
                      marketZone: product.marketZone,
                      category: product.category,
                      stock: product.stock,
                      rating: product.rating,
                    });
                    if (isNow) toast.success("Added to wishlist");
                    else toast.info("Removed from wishlist");
                  }}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${isFav
                    ? "border-rose-500/50 bg-rose-500/15 text-rose-500"
                    : "border-app bg-app-surface text-app-muted hover:text-app"
                    }`}
                  title="Bookmark to Wishlist"
                >
                  <Heart className={`h-4 w-4 ${isFav ? "fill-rose-500 text-rose-500" : ""}`} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="rounded-xl border border-indigo-600/30 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 py-3 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  <span>Buy Now</span>
                </button>
              </div>

              {/* View Full Product Page link */}
              <div className="pt-2 text-center">
                <Link
                  href={`/products/${product.id}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline transition-colors py-1 font-semibold"
                >
                  <span>Open Full Specifications & Warranty Page</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

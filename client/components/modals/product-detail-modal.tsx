"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Product } from "@/constants/mock-data";
import { useCartStore } from "@/store";
import { toast } from "sonner";

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
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState<number>(product?.rating || 5);
  const [isLoadingReviews, setIsLoadingReviews] = useState<boolean>(false);

  const addItem = useCartStore((state) => state.addItem);
  const toggleFavorite = useCartStore((state) => state.toggleFavorite);
  const isFavorite = useCartStore((state) => state.isFavorite);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
      setQuantity(1);
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
      },
      quantity
    );
    onClose();
    router.push("/cart");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-[#0d1222] p-5 sm:p-7 shadow-2xl backdrop-blur-2xl text-zinc-100 my-8 max-h-[90vh] overflow-y-auto app-modal-window"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-zinc-300 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Left Column: Image Gallery */}
          <div className="space-y-3">
            {/* Primary Large Image */}
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40">
              <img
                src={selectedImage || product.image}
                alt={product.name}
                className="h-full w-full object-cover object-center transition-transform hover:scale-105 duration-300"
              />
            </div>

            {/* Thumbnail Gallery */}
            {gallery.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${selectedImage === img ? "border-cyan-400 ring-2 ring-cyan-400/30" : "border-white/10 opacity-60 hover:opacity-100"
                      }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Buyer Protection Guarantee Highlight */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 text-xs space-y-1 text-zinc-300">
              <div className="flex items-center gap-2 font-semibold text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>MercatoX 100% Buyer Protection Guarantee</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Money is held securely in protected custody. Inspect your item at delivery before handing over your 4-digit handover OTP.
              </p>
            </div>
          </div>

          {/* Right Column: Product Specs, Price, & Actions */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Category & Verified Seller */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold uppercase tracking-wider text-indigo-400 text-[11px]">
                  {product.category}
                </span>
                <span className="text-emerald-400 flex items-center gap-1 font-medium text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  In Stock ({product.stock} available)
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                {product.name}
              </h2>

              {/* Merchant & Zone */}
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <MapPin className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span className="text-zinc-200 font-medium">{product.shopName}</span>
                <span>•</span>
                <span className="text-zinc-400">{product.marketZone}</span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < Math.floor(averageRating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-zinc-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-white">{averageRating}</span>
                <span className="text-zinc-400">
                  ({reviews.length > 0 ? reviews.length : product.reviewCount} customer reviews)
                </span>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 pt-2 border-t border-white/10">
                <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                  {product.price.toLocaleString()}{" "}
                  <span className="text-sm font-normal text-cyan-400">ETB</span>
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-zinc-500 line-through">
                    {product.originalPrice.toLocaleString()} ETB
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pt-1">
                {product.description}
              </p>

              {/* Specifications Table */}
              {product.specifications && (
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-1.5 text-xs">
                  <h4 className="font-semibold text-white text-[11px] uppercase tracking-wider text-zinc-400 mb-1">
                    Key Specifications
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <div key={key}>
                        <span className="text-zinc-500">{key}: </span>
                        <span className="text-zinc-200 font-medium">{val}</span>
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
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <h4 className="font-bold text-white text-xs">
                      Customer Reviews & Ratings
                    </h4>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {reviews.length} Verified {reviews.length === 1 ? "Review" : "Reviews"}
                  </span>
                </div>

                {isLoadingReviews ? (
                  <div className="py-3 text-center text-zinc-400 text-xs">
                    Loading verified reviews...
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="py-2.5 text-center text-zinc-400 text-xs">
                    No customer reviews yet. Be the first to order and review this product!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-2.5 rounded-xl bg-black/30 border border-white/5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-xs">
                              {rev.customerName}
                            </span>
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-semibold">
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
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-zinc-600"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {rev.comment && (
                          <p className="text-zinc-300 text-[11px] leading-relaxed">
                            {rev.comment}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-zinc-500">
                          {rev.tags && rev.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {rev.tags.map((t: string, ti: number) => (
                                <span
                                  key={ti}
                                  className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 text-[9px]"
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
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-zinc-400">Quantity:</span>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-white font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
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
                    ? "border-rose-500/50 bg-rose-500/20 text-rose-400"
                    : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                    }`}
                  title="Bookmark to Wishlist"
                >
                  <Heart className={`h-4 w-4 ${isFav ? "fill-rose-500" : ""}`} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 py-3 text-xs font-semibold text-white transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
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
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors py-1"
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

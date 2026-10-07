"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Heart,
  Star,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Lock,
  ChevronRight,
  ArrowLeft,
  Plus,
  Minus,
  Check,
  Share2,
  Store,
  Clock,
  Award,
  AlertCircle,
  Maximize2,
  X,
  Send,
  LogIn,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { CustomerHeader } from "@/components/layout/customer-header";
import { CustomerFooter } from "@/components/layout/footer";
import { ProductCard } from "@/components/products/product-card";
import { ProductDetailModal } from "@/components/modals/product-detail-modal";
import { Product } from "@/constants/mock-data";
import { useCartStore, useAuthStore } from "@/store";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ProductDetailClientProps {
  productId: string;
  initialProduct: Product | null;
  initialRelatedProducts: Product[];
}

export function ProductDetailClient({
  productId,
  initialProduct,
  initialRelatedProducts,
}: ProductDetailClientProps) {
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>(initialRelatedProducts);
  const [isLoading, setIsLoading] = useState<boolean>(!initialProduct);
  const [selectedImage, setSelectedImage] = useState<string>(
    initialProduct?.image || ""
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "escrow" | "reviews" | "seller">("description");
  const [isAdded, setIsAdded] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Zoom & Full Image Modal States
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Stores
  const addItem = useCartStore((state) => state.addItem);
  const toggleFavorite = useCartStore((state) => state.toggleFavorite);
  const isFavorite = useCartStore((state) => state.isFavorite);
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Reviews state with glassmorphic submission
  const [reviews, setReviews] = useState([
    {
      id: "rev-1",
      author: "Dawit G.",
      location: "Bole, Addis Ababa",
      rating: 5,
      date: "2 days ago",
      comment: "Item arrived in mint condition. Courier was on time and verified my OTP right at my gate. Very reliable service!",
    },
    {
      id: "rev-2",
      author: "Bethlehem T.",
      location: "Kazanchis, Addis Ababa",
      rating: 5,
      date: "1 week ago",
      comment: "Authentic quality just as advertised. Will order again from this merchant.",
    },
    {
      id: "rev-3",
      author: "Yared M.",
      location: "Mercato Zone, Addis Ababa",
      rating: 4.8,
      date: "2 weeks ago",
      comment: "Great communication and very fast dispatch from the store. Highly recommended!",
    },
  ]);

  const [newReviewAuthor, setNewReviewAuthor] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");

  const [dynamicRating, setDynamicRating] = useState<number>(initialProduct?.rating || 5);
  const [reviewCount, setReviewCount] = useState<number>(initialProduct?.reviewCount || 0);

  useEffect(() => {
    setMounted(true);
    if (initialProduct?.image) {
      setSelectedImage(initialProduct.image);
    }

    if (initialProduct?.id) {
      fetch(
        `/api/reviews?productId=${encodeURIComponent(initialProduct.id)}&title=${encodeURIComponent(
          initialProduct.name
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
            setReviews(
              data.reviews.map((r: any) => ({
                id: r.id,
                author: r.customerName || "Verified Buyer",
                location: "Addis Ababa",
                rating: r.rating,
                date: new Date(r.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
                comment: r.comment,
              }))
            );
            setDynamicRating(data.averageRating);
            setReviewCount(data.totalCount);
          }
        })
        .catch((err) => console.warn("Failed to fetch product reviews:", err));
    }
  }, [initialProduct]);

  // Handle image mouse move for smooth magnifying glass effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };
    if (isLightboxOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#070a12] text-zinc-100">
        <CustomerHeader />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-24">
          <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
          <p className="text-sm font-medium text-zinc-300">
            Loading verified product details from marketplace...
          </p>
        </div>
        <CustomerFooter />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#070a12] text-zinc-100">
        <CustomerHeader />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-24 text-center px-4">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Product Not Found</h2>
          <p className="text-xs text-zinc-400 max-w-sm">
            The product you requested might have been sold out, removed, or has an invalid ID.
          </p>
          <Link
            href="/marketplace"
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            Browse Marketplace Catalog
          </Link>
        </div>
        <CustomerFooter />
      </div>
    );
  }

  const isFav = mounted ? isFavorite(product.id) : false;

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

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
    setIsAdded(true);
    toast.success(`Added ${quantity} unit(s) to cart`, {
      description: `${product.name} is in your shopping cart.`,
    });
    setTimeout(() => setIsAdded(false), 2000);
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
    router.push("/checkout");
  };

  const handleToggleFavorite = () => {
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
    if (isNow) {
      toast.success("Saved to your wishlist!", { description: product.name });
    } else {
      toast.info("Removed from your wishlist", { description: product.name });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on MercatoX with 100% Escrow Protection!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) {
      toast.error("Please provide your review feedback");
      return;
    }

    const reviewerName = user?.name || newReviewAuthor.trim() || "Verified Buyer";

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: newReviewRating,
          comment: newReviewComment.trim(),
          tags: ["✨ High Quality Product", "🛡️ Escrow Protected"],
          customerName: reviewerName,
          customerId: user?.id,
          productId: product.id,
          productTitle: product.name,
        }),
      });

      const data = await res.json();
      if (data.success && data.review) {
        const reviewObj = {
          id: data.review.id,
          author: reviewerName,
          location: "Addis Ababa",
          rating: data.review.rating,
          date: "Just now",
          comment: data.review.comment,
        };
        setReviews([reviewObj, ...reviews]);
        setNewReviewComment("");
        setNewReviewAuthor("");
        toast.success("Review saved to database!", {
          description: "Thank you! Your verified review is now live.",
        });
      } else {
        toast.error("Failed to save review", {
          description: data.error || "Please try again later",
        });
      }
    } catch (err: any) {
      toast.error("Failed to save review", {
        description: err.message || "Network error",
      });
    }
  };

  const handleQuickView = (p: Product) => {
    setQuickViewProduct(p);
    setIsModalOpen(true);
  };

  const galleryImages = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  return (
    <div className="min-h-screen flex flex-col bg-[#070a12] text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <CustomerHeader />

      <main className="flex-1 mx-auto max-w-[1500px] w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-zinc-400 flex-wrap">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/marketplace" className="hover:text-white transition-colors">
            Marketplace
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            href={`/marketplace?category=${encodeURIComponent(product.categorySlug)}`}
            className="hover:text-white transition-colors capitalize"
          >
            {product.category}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-zinc-200 font-medium truncate max-w-xs sm:max-w-md">
            {product.name}
          </span>
        </nav>

        {/* Top Product Section: Left Gallery & Right Buy Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Image Gallery & Magnifier */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-4">
            {/* Main Interactive Stage with Magnifier */}
            <div
              ref={imageContainerRef}
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleMouseMove}
              className="relative aspect-square w-full rounded-3xl border border-white/10 bg-[#0d1222]/90 backdrop-blur-xl overflow-hidden shadow-2xl flex items-center justify-center cursor-crosshair group"
            >
              <img
                src={selectedImage || product.image}
                alt={product.name}
                className={`h-full w-full object-cover object-center transition-all duration-300 ${
                  isZooming ? "scale-125" : "scale-100"
                }`}
                style={
                  isZooming
                    ? {
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      }
                    : undefined
                }
              />

              {/* Magnifier HUD Hint */}
              <div className="absolute top-4 left-4 z-20 pointer-events-none">
                <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-white border border-white/10">
                  {isZooming ? "2.5x Zoom Active" : "Hover to Zoom"}
                </span>
              </div>

              {/* Fullscreen Lightbox Button */}
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="absolute top-4 right-4 z-20 h-9 w-9 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/15 text-zinc-300 hover:text-white flex items-center justify-center transition-colors shadow-lg cursor-pointer"
                title="Open Fullscreen Lightbox"
              >
                <Maximize2 className="h-4 w-4" />
              </button>

              {/* Verified Product Badge */}
              <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 px-3 py-1 text-[11px] font-bold text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>100% Escrow Inspected</span>
                </div>
              </div>
            </div>

            {/* Gallery Thumbnails Carousel */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                {galleryImages.map((img, idx) => {
                  const isSelected = selectedImage === img;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className={`relative h-20 w-20 shrink-0 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                        isSelected
                          ? "border-indigo-500 shadow-md shadow-indigo-500/30 scale-105"
                          : "border-white/10 opacity-70 hover:opacity-100 hover:border-white/25"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`View ${idx + 1}`}
                        className="h-full w-full object-cover object-center"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Pricing, Buy Box, Seller & Escrow Card */}
          <div className="lg:col-span-6 xl:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-3 py-0.5 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  {product.category}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleToggleFavorite}
                    className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      isFav
                        ? "border-rose-500/50 bg-rose-500/20 text-rose-400"
                        : "border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                    }`}
                    title={isFav ? "Saved in Wishlist" : "Save to Wishlist"}
                  >
                    <Heart className={`h-4 w-4 ${isFav ? "fill-rose-400" : ""}`} />
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
                    title="Share Deal"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                {product.name}
              </h1>

              {/* Rating & Stock Summary */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="h-4 w-4 fill-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-zinc-500 font-normal">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
                <span className="h-3 w-[1px] bg-white/10" />
                <span className="text-zinc-400 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-cyan-400" />
                  <span>{product.marketZone}</span>
                </span>
                <span className="h-3 w-[1px] bg-white/10" />
                <span
                  className={`font-semibold ${
                    product.stock > 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {product.stock > 0 ? `${product.stock} Units in Stock` : "Sold Out"}
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="rounded-2xl border border-white/10 bg-[#0d1222]/90 p-4 sm:p-5 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-white">
                  {product.price.toLocaleString()}
                  <span className="text-sm sm:text-base font-bold text-cyan-400 ml-1.5">
                    ETB
                  </span>
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-base text-zinc-500 line-through">
                      {product.originalPrice.toLocaleString()} ETB
                    </span>
                    <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                      Save {discountPercent}%
                    </span>
                  </>
                )}
              </div>

              {/* Quantity Picker & Action Buttons */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-zinc-400">Quantity:</span>
                  <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="h-7 w-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-zinc-300 disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs font-bold text-white font-mono">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                      disabled={quantity >= (product.stock || 99)}
                      className="h-7 w-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-zinc-300 disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className={`flex items-center justify-center gap-2 rounded-2xl border px-5 py-3.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      isAdded
                        ? "border-emerald-500/50 bg-emerald-600 text-white"
                        : "border-indigo-500/40 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={product.stock <= 0}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-5 py-3.5 text-xs sm:text-sm font-bold text-white shadow-xl shadow-indigo-600/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Instant Escrow Checkout</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Escrow Guarantee Pill Card */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 backdrop-blur-md space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <ShieldCheck className="h-4 w-4" />
                <span>MercatoX 100% Escrow Protection</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Your money remains locked in a protected vault. You share your 4-digit handover OTP only after inspecting this item at your doorstep in Addis Ababa.
              </p>
            </div>

            {/* Verified Seller Details Card */}
            <div className="rounded-2xl border border-white/10 bg-[#0d1222]/80 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{product.shopName}</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                    </h3>
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                      <MapPin className="h-2.5 w-2.5 text-indigo-400" />
                      <span>{product.marketZone}</span>
                    </span>
                  </div>
                </div>

                <span className="rounded-full bg-cyan-500/10 border border-cyan-500/25 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                  Verified Importer
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Specifications, Escrow & Customer Reviews */}
        <div className="rounded-3xl border border-white/10 bg-[#0d1222]/90 p-6 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex items-center gap-4 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar">
            {[
              { id: "description", label: "Description & Details" },
              { id: "escrow", label: "Escrow & Delivery Policy" },
              { id: "reviews", label: `Verified Reviews (${reviews.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-2 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? "text-cyan-400"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Description Tab */}
          {activeTab === "description" && (
            <div className="space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed">
              <p className="whitespace-pre-line">{product.description}</p>

              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Technical Specifications
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/5 px-3 py-2"
                      >
                        <span className="text-zinc-400">{key}</span>
                        <span className="font-semibold text-white font-mono">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Escrow Tab */}
          {activeTab === "escrow" && (
            <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-5 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="h-4 w-4 text-cyan-400" />
                  <span>How MercatoX Escrow Protects Your Money</span>
                </h4>
                <ol className="list-decimal pl-5 space-y-2 text-xs text-zinc-300">
                  <li>You place your order and authorize payment via Telebirr, Chapa, CBE, or Card.</li>
                  <li>Funds are immediately deposited into a locked fiduciary trust account.</li>
                  <li>The seller in Bole/Mercato packages your item and handovers to our licensed courier.</li>
                  <li>You receive an SMS with a unique 4-digit handover OTP.</li>
                  <li>When the courier arrives at your doorstep, you open and inspect the package physically.</li>
                  <li>If satisfied, you give the 4-digit OTP to the courier to release payment.</li>
                </ol>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              {/* Existing Reviews List */}
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{rev.author}</span>
                        <span className="text-[10px] text-zinc-400">• {rev.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400 text-xs">
                        <Star className="h-3 w-3 fill-amber-400" />
                        <span>{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-zinc-500 font-mono block">
                      Verified Escrow Purchase • {rev.date}
                    </span>
                  </div>
                ))}
              </div>

              {/* Submit Review Box */}
              <form
                onSubmit={handleReviewSubmit}
                className="rounded-2xl border border-white/10 bg-black/40 p-5 space-y-3"
              >
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Write a Customer Review
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Rating:</span>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewReviewRating(s)}
                      className="cursor-pointer"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          s <= newReviewRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-zinc-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Share your experience with this item and the OTP delivery handover..."
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-[#090d18] p-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Review</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Related Products from Same Department */}
        {relatedProducts.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Recommended Catalog Deals
                </span>
                <h3 className="text-lg font-bold text-white">
                  Customers Also Viewed
                </h3>
              </div>
              <Link
                href="/marketplace"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                View Marketplace
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} onQuickView={handleQuickView} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={selectedImage || product.image}
            alt={product.name}
            className="max-h-[85vh] max-w-[85vw] object-contain rounded-2xl shadow-2xl border border-white/10"
          />
        </div>
      )}

      {/* Quick View Modal */}
      <ProductDetailModal
        product={quickViewProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <CustomerFooter />
    </div>
  );
}

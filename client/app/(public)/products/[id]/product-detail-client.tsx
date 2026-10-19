"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Sparkles,
  ZoomIn,
  ZoomOut,
  BadgePercent,
  Layers,
  Scale,
  Shield,
  Loader2,
  MessageSquareQuote,
  Filter,
  Warehouse,
  FileText,
  Building2,
  TrendingDown,
  Calculator,
  Calendar,
  Package,
  HelpCircle,
  Tag,
  PhoneCall,
  Mail,
  LogIn,
  UserCheck,
  ThumbsUp,
} from "lucide-react";
import { CustomerHeader } from "@/components/layout/customer-header";
import { CustomerFooter } from "@/components/layout/footer";
import { ProductCard } from "@/components/products/product-card";
import { Product } from "@/constants/mock-data";
import { fetchProductById, fetchSellerProfile } from "@/lib/api/catalog";
import { useCartStore, useAuthStore } from "@/store";
import { useThemeStore } from "@/store/theme-store";
import { toast } from "sonner";

interface ProductDetailClientProps {
  productId: string;
  initialProduct: Product | null;
  initialRelatedProducts: Product[];
}

export interface ReviewDisplayItem {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  comment: string;
  tags?: string[];
}

export function ProductDetailClient({
  productId,
  initialProduct,
  initialRelatedProducts,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const addItem = useCartStore((state) => state.addItem);
  const toggleFavorite = useCartStore((state) => state.toggleFavorite);
  const isFavorite = useCartStore((state) => state.isFavorite);

  // Theme integration for System, Light, and Dark modes
  const { theme } = useThemeStore();
  const isLight = theme === "light";
  const isDark = theme === "dark";
  const isSystem = theme === "system";

  const themePageBg = isLight
    ? "bg-[#fafbfe] text-slate-900"
    : isDark
      ? "bg-[#09090b] text-white"
      : "bg-[#070d1e] text-slate-100";

  const themeCardBg = isLight
    ? "bg-white border-slate-200/90 shadow-xs"
    : isDark
      ? "bg-[#141418] border-white/10"
      : "bg-[#0d1222]/90 border-blue-500/20";

  const themeInnerCardBg = isLight
    ? "bg-slate-50/80 border-slate-200/80 text-slate-800"
    : isDark
      ? "bg-white/[0.03] border-white/8 text-zinc-200"
      : "bg-white/[0.03] border-blue-500/15 text-slate-200";

  const themeBorder = isLight
    ? "border-slate-200"
    : isDark
      ? "border-white/10"
      : "border-blue-500/20";

  const themeText = isLight ? "text-slate-900" : "text-white";
  const themeTextMuted = isLight ? "text-slate-500" : isDark ? "text-zinc-400" : "text-slate-400";
  const themeTextSubtle = isLight ? "text-slate-600" : isDark ? "text-zinc-300" : "text-slate-300";

  const themeInputBg = isLight
    ? "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
    : isDark
      ? "bg-[#101014] border-white/10 text-white placeholder:text-zinc-500"
      : "bg-[#090d18] border-blue-500/20 text-white placeholder:text-zinc-500";

  // Glassmorphism tokens for verified cards, badges, and review components
  const glassCard = isLight
    ? "backdrop-blur-xl bg-white/80 border border-slate-200/90 shadow-xl shadow-slate-200/50"
    : isDark
      ? "backdrop-blur-xl bg-[#141418]/80 border border-white/10 shadow-2xl shadow-black/50"
      : "backdrop-blur-xl bg-[#0d1222]/85 border border-blue-500/25 shadow-2xl shadow-blue-950/40";

  const glassVerifiedBadge = isLight
    ? "backdrop-blur-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 shadow-xs"
    : "backdrop-blur-md bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 shadow-xs";

  const glassSupplierBadge = isLight
    ? "backdrop-blur-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 shadow-xs"
    : "backdrop-blur-md bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 shadow-xs";

  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [relatedProducts] = useState<Product[]>(initialRelatedProducts);
  const [isLoading, setIsLoading] = useState(!initialProduct);

  const [selectedImage, setSelectedImage] = useState<string>(
    initialProduct?.gallery?.[0] || initialProduct?.image || ""
  );
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // MOQ initialized quantity
  const moq = product?.moq || product?.minOrderQuantity || 1;
  const [quantity, setQuantity] = useState(moq);
  const [isAdded, setIsAdded] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "overview" | "wholesale" | "supplier" | "logistics" | "escrow" | "reviews"
  >("overview");

  // Zoom Lens states
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [zoomScale, setZoomScale] = useState<number>(2.5);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);

  // Real Database Reviews State
  const [reviews, setReviews] = useState<ReviewDisplayItem[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState<boolean>(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewFilterRating, setReviewFilterRating] = useState<number | "all">("all");

  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");

  const [dynamicRating, setDynamicRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);

  // Fetch real live product data and reviews from backend PostgreSQL
  useEffect(() => {
    setMounted(true);
    let isSubscribed = true;

    async function loadLiveProduct() {
      if (!productId) return;
      try {
        const freshProduct = await fetchProductById(productId);
        if (isSubscribed && freshProduct) {
          setProduct(freshProduct);
          setSelectedImage(freshProduct.gallery?.[0] || freshProduct.image);
          if (freshProduct.moq && quantity < freshProduct.moq) {
            setQuantity(freshProduct.moq);
          }
          if (freshProduct.sellerId) {
            const seller = await fetchSellerProfile(freshProduct.sellerId);
            if (isSubscribed && seller?.shopName) {
              const shopName = seller.shopName;
              setProduct((prev) =>
                prev
                  ? {
                      ...prev,
                      shopName: shopName || prev.shopName,
                      marketZone: seller.marketZone || prev.marketZone,
                    }
                  : prev
              );
            }
          }
        }
      } catch (err) {
        console.warn("Could not fetch live product info:", err);
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    }

    loadLiveProduct();

    async function loadLiveReviews() {
      if (!productId) return;
      try {
        setIsLoadingReviews(true);
        const res = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`);
        const data = await res.json();
        if (isSubscribed && data.success && Array.isArray(data.reviews)) {
          setReviews(
            data.reviews.map((r: any) => {
              const nameParts = (r.customerName || "Verified Buyer").split(" • ");
              return {
                id: r.id,
                author: nameParts[0] || "Verified Buyer",
                location: nameParts[1] || "Addis Ababa",
                rating: Number(r.rating) || 5,
                date: r.createdAt
                  ? new Date(r.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Recent",
                comment: r.comment,
                tags: r.tags || [],
              };
            })
          );
          setDynamicRating(Number(data.averageRating) || 0);
          setReviewCount(Number(data.totalCount) || 0);
        }
      } catch (err) {
        console.warn("Could not fetch real product reviews:", err);
      } finally {
        if (isSubscribed) setIsLoadingReviews(false);
      }
    }

    loadLiveReviews();

    return () => {
      isSubscribed = false;
    };
  }, [productId]);

  // Handle precision mouse tracking for magnifying lens effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setMousePos({ x, y });
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

  // Calculate dynamic unit price based on tiered bulk wholesale volume
  const calculateEffectiveUnitPrice = (qty: number): number => {
    if (!product) return 0;
    if (product.tieredPricing && product.tieredPricing.length > 0) {
      const matchingTier = product.tieredPricing
        .filter((t) => qty >= t.minQuantity)
        .sort((a, b) => b.minQuantity - a.minQuantity)[0];
      if (matchingTier) return matchingTier.discountedPricePerUnit;
    }
    return product.price;
  };

  const effectiveUnitPrice = useMemo(() => {
    return calculateEffectiveUnitPrice(quantity);
  }, [product, quantity]);

  const effectiveTotalPrice = useMemo(() => {
    return effectiveUnitPrice * quantity;
  }, [effectiveUnitPrice, quantity]);

  const regularTotalPrice = useMemo(() => {
    if (!product) return 0;
    const baseRef = product.originalPrice || product.price;
    return baseRef * quantity;
  }, [product, quantity]);

  const totalWholesaleSavings = useMemo(() => {
    return Math.max(0, regularTotalPrice - effectiveTotalPrice);
  }, [regularTotalPrice, effectiveTotalPrice]);

  const discountPercent = useMemo(() => {
    if (!product) return 0;
    const baseRef = product.originalPrice || product.price;
    if (baseRef <= 0 || effectiveUnitPrice >= baseRef) return 0;
    return Math.round(((baseRef - effectiveUnitPrice) / baseRef) * 100);
  }, [product, effectiveUnitPrice]);

  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col ${themePageBg}`}>
        <CustomerHeader />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-24">
          <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
          <p className={`text-sm font-medium ${themeTextMuted}`}>
            Loading verified product details from marketplace...
          </p>
        </div>
        <CustomerFooter />
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`min-h-screen flex flex-col ${themePageBg}`}>
        <CustomerHeader />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-24 text-center px-4">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
          <h2 className={`text-xl font-bold ${themeText}`}>Product Not Found</h2>
          <p className={`text-xs ${themeTextMuted} max-w-sm`}>
            The product you requested might have been sold out, removed, or has an invalid ID.
          </p>
          <Link
            href="/marketplace"
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-md"
          >
            Browse Marketplace Catalog
          </Link>
        </div>
        <CustomerFooter />
      </div>
    );
  }

  const isFav = mounted ? isFavorite(product.id) : false;

  const handleAddToCart = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        price: effectiveUnitPrice,
        image: product.image,
        shopName: product.shopName,
        marketZone: product.marketZone,
        category: product.category,
        stock: product.stock,
        rating: dynamicRating,
        sellerId: (product as any).sellerId,
      },
      quantity
    );
    setIsAdded(true);
    toast.success(`Added ${quantity} ${product.unit || "unit(s)"} to cart`, {
      description: `${product.name} is now in your shopping cart.`,
    });
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        price: effectiveUnitPrice,
        image: product.image,
        shopName: product.shopName,
        marketZone: product.marketZone,
        category: product.category,
        stock: product.stock,
        rating: dynamicRating,
        sellerId: (product as any).sellerId,
      },
      quantity
    );
    router.push("/checkout");
  };

  const handleToggleFavorite = () => {
    if (!product) return;
    const isNowFav = toggleFavorite({
      id: product.id,
      name: product.name,
      price: effectiveUnitPrice,
      image: product.image,
      shopName: product.shopName,
      marketZone: product.marketZone,
      category: product.category,
      stock: product.stock,
      rating: dynamicRating,
    });
    if (isNowFav) {
      toast.success("Saved to Wishlist", {
        description: `${product.name} added to your favorites.`,
      });
    } else {
      toast.info("Removed from Wishlist");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on MercatoX`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to rate and write a review");
      return;
    }

    if (!newReviewComment.trim()) {
      toast.error("Please write your review comment");
      return;
    }

    const reviewerName = user?.name?.trim() || "Verified Buyer";

    try {
      setIsSubmittingReview(true);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: newReviewRating,
          comment: newReviewComment.trim(),
          tags: ["✨ Verified Buyer"],
          customerName: reviewerName,
          customerId: user?.id,
          productId: product.id,
          productTitle: product.name,
        }),
      });

      const data = await res.json();
      if (data.success && data.review) {
        const reviewObj: ReviewDisplayItem = {
          id: data.review.id,
          author: reviewerName,
          location: "Addis Ababa",
          rating: Number(data.review.rating),
          date: "Just now",
          comment: data.review.comment,
          tags: data.review.tags || ["✨ Verified Buyer"],
        };
        const updatedList = [reviewObj, ...reviews];
        setReviews(updatedList);
        setReviewCount(updatedList.length);
        const newAvg =
          updatedList.reduce((sum, r) => sum + r.rating, 0) / updatedList.length;
        setDynamicRating(Number(newAvg.toFixed(1)));
        setNewReviewComment("");
        toast.success("Review submitted successfully!");
      } else {
        toast.error("Failed to save review", {
          description: data.error || "Please try again later",
        });
      }
    } catch (err: any) {
      toast.error("Failed to save review", {
        description: err.message || "Network error",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleQuickView = (p: Product) => {
    router.push(`/products/${p.id}`);
  };

  const galleryImages =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.image];

  // Complete technical specifications map
  const displaySpecs: Record<string, string> = {
    "Product Title": product.name,
    ...(product.brand ? { "Brand / Manufacturer": product.brand } : {}),
    ...(product.origin ? { "Sourcing Region / Origin": product.origin } : {}),
    ...(product.grade ? { "Quality Grade": product.grade } : {}),
    "Unit of Measure": product.unit || "Piece",
    "Minimum Order Quantity (MOQ)": `${product.moq || product.minOrderQuantity || 1} ${product.unit || "units"}`,
    "Stock Inventory": `${product.stock > 0 ? product.stock : "0"} ${product.unit || "units"} Available`,
    "Warehouse Hub": product.warehouseLocation || product.branchName || "Addis Ababa Central Hub",
    "Dispatch Lead Time": `${product.leadTimeDays || 3} Business Days Express Dispatch`,
    "SKU / Identification": product.sku || product.id.slice(0, 13).toUpperCase(),
    "Buyer Protection": "100% Escrow Security - Locked Fiduciary Account",
    "Delivery Protocol": "4-Digit Secure Handover Inspection OTP",
    ...(product.certifications && product.certifications.length > 0
      ? { "Accreditations & Certifications": product.certifications.join(", ") }
      : {}),
    ...(product.specifications || {}),
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${themePageBg} selection:bg-indigo-500/30 selection:text-indigo-200`}>
      <CustomerHeader />

      <main className="flex-1 mx-auto max-w-[1600px] w-full px-3 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className={`flex items-center gap-2 text-xs flex-wrap ${themeTextMuted}`}>
          <Link href="/" className={`hover:${themeText} transition-colors`}>
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/marketplace" className={`hover:${themeText} transition-colors`}>
            Marketplace
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            href={`/marketplace?category=${encodeURIComponent(product.categorySlug)}`}
            className={`hover:${themeText} transition-colors capitalize`}
          >
            {product.category}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className={`font-medium truncate max-w-xs sm:max-w-md ${themeText}`}>
            {product.name}
          </span>
        </nav>

        {/* Top Product Section: Left Gallery & Right Buy Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Image Gallery with Precision Magnifier & Quick Highlights */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-5">
            {/* Main Interactive Stage with Precision Mouse Zoom Lens */}
            <div className="space-y-3">
              <div
                ref={imageContainerRef}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onMouseMove={handleMouseMove}
                className={`relative aspect-square sm:aspect-16/11 w-full rounded-3xl overflow-hidden border shadow-xl cursor-crosshair select-none group ${
                  isLight
                    ? "bg-slate-100/80 border-slate-200/90"
                    : isDark
                      ? "bg-[#101014] border-white/10"
                      : "bg-[#0a0f1d] border-blue-500/20"
                }`}
              >
                {/* Scaled Background Image */}
                <img
                  src={galleryImages[activeImageIdx] || selectedImage || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-center transition-transform duration-100 ease-out will-change-transform"
                  style={{
                    transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                    transform: isHovered ? `scale(${zoomScale})` : "scale(1)",
                  }}
                />

                {/* Escrow Guarantee Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-emerald-950/90 text-emerald-400 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-lg pointer-events-none z-10">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>100% Escrow Protected</span>
                </div>

                {/* Available Stock Indicator */}
                <div className={`absolute bottom-4 right-4 px-3 py-1.5 rounded-xl text-xs font-mono border pointer-events-none shadow-md z-10 ${
                  isLight
                    ? "bg-white/90 text-slate-800 border-slate-200 backdrop-blur-md"
                    : "bg-black/80 text-zinc-200 border-white/10 backdrop-blur-md"
                }`}>
                  {product.stock > 0 ? `${product.stock} ${product.unit || "Units"} In Stock` : "Sold Out"}
                </div>

                {/* Dynamic Zoom Loupe Ring Indicator */}
                {isHovered && (
                  <div
                    className="absolute pointer-events-none w-28 h-28 -ml-14 -mt-14 rounded-full border-2 border-indigo-400/80 bg-indigo-500/10 backdrop-blur-[0.5px] shadow-2xl transition-opacity duration-150 ring-4 ring-indigo-500/20 z-10"
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
                  className={`absolute top-4 right-4 px-3.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all duration-200 pointer-events-none z-10 ${
                    isLight
                      ? "bg-white/90 backdrop-blur-md border-slate-200 text-slate-700 shadow-sm"
                      : "bg-black/80 backdrop-blur-md border-white/15 text-zinc-300"
                  }`}
                >
                  <ZoomIn className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span>{isHovered ? `Precision Zoom: ${zoomScale}x` : "Hover to Magnify"}</span>
                </div>
              </div>

              {/* Gallery Thumbnails & Zoom Multiplier Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {/* Thumbnails */}
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                  {galleryImages.map((img, idx) => {
                    const isSelected =
                      activeImageIdx === idx || (selectedImage === img && activeImageIdx === 0);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setActiveImageIdx(idx);
                          setSelectedImage(img);
                        }}
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                          isSelected
                            ? "border-indigo-500 ring-4 ring-indigo-500/25 scale-105 shadow-lg shadow-indigo-500/20"
                            : isLight
                              ? "border-slate-200 bg-white opacity-70 hover:opacity-100 hover:border-slate-300"
                              : "border-white/10 opacity-60 hover:opacity-100 hover:border-white/30"
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover object-center" />
                      </button>
                    );
                  })}
                </div>

                {/* Zoom Scale Buttons & Fullscreen Trigger */}
                <div className={`flex items-center gap-1.5 p-1 rounded-2xl border text-xs shadow-inner ${
                  isLight ? "bg-slate-100/90 border-slate-200" : "bg-white/[0.04] border-white/10"
                }`}>
                  <span className={`text-[11px] px-2 font-medium ${themeTextMuted}`}>Zoom:</span>
                  {[1.5, 2.5, 4.0].map((scale) => (
                    <button
                      key={scale}
                      type="button"
                      onClick={() => setZoomScale(scale)}
                      className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                        zoomScale === scale
                          ? "bg-indigo-600 text-white shadow-xs shadow-indigo-600/40"
                          : isLight
                            ? "text-slate-600 hover:text-slate-900 hover:bg-white"
                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {scale}x
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(true)}
                    className={`p-1.5 rounded-xl transition-colors ml-1 cursor-pointer ${
                      isLight ? "text-slate-600 hover:text-slate-900 hover:bg-white" : "text-zinc-400 hover:text-white hover:bg-white/10"
                    }`}
                    title="Fullscreen High-Resolution Preview"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Supplier Metadata Highlights Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className={`p-3.5 rounded-2xl border shadow-xs space-y-1 ${themeInnerCardBg}`}>
                <div className={`text-[11px] flex items-center gap-1.5 ${themeTextMuted}`}>
                  <Award className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Quality Grade</span>
                </div>
                <div className={`text-xs font-bold truncate ${themeText}`}>
                  {product.grade || "Export Standard"}
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl border shadow-xs space-y-1 ${themeInnerCardBg}`}>
                <div className={`text-[11px] flex items-center gap-1.5 ${themeTextMuted}`}>
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Origin / Source</span>
                </div>
                <div className={`text-xs font-bold truncate ${themeText}`}>
                  {product.origin || product.marketZone || "Mercato Hub, Addis"}
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl border shadow-xs space-y-1 ${themeInnerCardBg}`}>
                <div className={`text-[11px] flex items-center gap-1.5 ${themeTextMuted}`}>
                  <Truck className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Dispatch SLA</span>
                </div>
                <div className={`text-xs font-bold truncate ${themeText}`}>
                  {product.leadTimeDays ? `${product.leadTimeDays} Days Express` : "24-48h Courier"}
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl border shadow-xs space-y-1 ${themeInnerCardBg}`}>
                <div className={`text-[11px] flex items-center gap-1.5 ${themeTextMuted}`}>
                  <Package className="w-3.5 h-3.5 text-amber-500" />
                  <span>MOQ / Unit</span>
                </div>
                <div className={`text-xs font-bold truncate ${themeText}`}>
                  {product.moq || product.minOrderQuantity || 1} {product.unit || "unit"}
                </div>
              </div>
            </div>

            {/* Certifications & Badges Row (if posted by supplier) */}
            {product.certifications && product.certifications.length > 0 && (
              <div className={`rounded-2xl border p-4 space-y-2 ${
                isLight ? "bg-emerald-50/70 border-emerald-200 text-emerald-950" : "bg-emerald-950/20 border-emerald-500/20 text-emerald-300"
              }`}>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Verified Supplier Certifications & Accreditations:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.certifications.map((cert, cIdx) => (
                    <span
                      key={cIdx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs font-medium"
                    >
                      <Check className="w-3 h-3 text-emerald-500" />
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Pricing, Buy Box, Seller & Escrow Card */}
          <div className="lg:col-span-6 xl:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-3 py-0.5 text-xs font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
                    {product.category}
                  </span>
                  {product.brand && (
                    <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-semibold text-cyan-600 dark:text-cyan-300">
                      {product.brand}
                    </span>
                  )}
                  {product.sku && (
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-mono border ${
                      isLight ? "bg-slate-100 border-slate-200 text-slate-600" : "bg-white/5 border-white/10 text-zinc-400"
                    }`}>
                      SKU: {product.sku}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleToggleFavorite}
                    className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      isFav
                        ? "border-rose-500/50 bg-rose-500/20 text-rose-500"
                        : isLight
                          ? "border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-xs"
                          : "border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                    }`}
                    title={isFav ? "Saved in Wishlist" : "Save to Wishlist"}
                  >
                    <Heart className={`h-4 w-4 ${isFav ? "fill-rose-500" : ""}`} />
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      isLight
                        ? "border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-xs"
                        : "border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                    }`}
                    title="Share Deal"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight ${themeText}`}>
                {product.name}
              </h1>

              {/* Rating & Stock Summary */}
              <div className="flex items-center gap-3 text-xs flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveTab("reviews")}
                  className="flex items-center gap-1.5 text-amber-500 font-bold hover:underline cursor-pointer transition-transform active:scale-95"
                >
                  {reviewCount > 0 ? (
                    <>
                      <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                      <span className={`font-mono text-sm ${themeText}`}>{dynamicRating.toFixed(1)}</span>
                      <span className={`font-normal ${themeTextMuted}`}>
                        ({reviewCount} verified {reviewCount === 1 ? "review" : "reviews"})
                      </span>
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 text-zinc-400 opacity-60" />
                      <span className={`font-normal ${themeTextMuted}`}>
                        No reviews yet &bull; Be the first to review
                      </span>
                    </>
                  )}
                </button>
                <span className={`h-3 w-[1px] ${isLight ? "bg-slate-200" : "bg-white/10"}`} />
                <span className={`flex items-center gap-1 ${themeTextMuted}`}>
                  <MapPin className="h-3 w-3 text-cyan-500" />
                  <span>{product.warehouseLocation || product.marketZone}</span>
                </span>
                <span className={`h-3 w-[1px] ${isLight ? "bg-slate-200" : "bg-white/10"}`} />
                <span
                  className={`font-semibold ${
                    product.stock > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
                  }`}
                >
                  {product.stock > 0
                    ? `${product.stock} ${product.unit || "Units"} in Stock`
                    : "Sold Out"}
                </span>
              </div>
            </div>

            {/* Price Box & Volume Tiers Calculator */}
            <div className={`rounded-2xl border p-4 sm:p-5 backdrop-blur-xl shadow-xl space-y-4 ${themeCardBg}`}>
              {/* Main Unit Price Display */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className={`text-3xl sm:text-4xl font-black ${themeText}`}>
                    {effectiveUnitPrice.toLocaleString()}
                    <span className="text-sm sm:text-base font-bold text-cyan-600 dark:text-cyan-400 ml-1.5">
                      ETB
                    </span>
                  </span>
                  <span className={`text-xs font-medium ${themeTextMuted}`}>
                    / {product.unit || "unit"}
                  </span>
                  {product.originalPrice && product.originalPrice > effectiveUnitPrice && (
                    <>
                      <span className="text-base text-zinc-400 line-through">
                        {product.originalPrice.toLocaleString()} ETB
                      </span>
                      <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        Save {discountPercent}%
                      </span>
                    </>
                  )}
                </div>

                {/* Volume Tier Pricing Matrix (if posted by supplier) */}
                {product.tieredPricing && product.tieredPricing.length > 0 && (
                  <div className={`pt-3 space-y-2 border-t mt-3 ${themeBorder}`}>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                        <TrendingDown className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                        Volume Pricing Tiers
                      </span>
                      <span className={`text-[11px] font-normal ${themeTextMuted}`}>
                        Click tier to select &bull; MOQ: {moq} {product.unit || "units"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {product.tieredPricing.map((tier, tIdx) => {
                        const isTierActive =
                          quantity >= tier.minQuantity &&
                          (!tier.maxQuantity || quantity <= tier.maxQuantity);
                        return (
                          <button
                            key={tIdx}
                            type="button"
                            onClick={() => {
                              setQuantity(tier.minQuantity);
                              toast.success(`Volume Tier: ${tier.minQuantity}+ units selected`, {
                                description: `ETB ${tier.discountedPricePerUnit.toLocaleString()} / ${product.unit || "unit"} applied.`,
                              });
                            }}
                            className={`p-2.5 rounded-xl border transition-all text-xs space-y-1 text-left cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                              isTierActive
                                ? isLight
                                  ? "bg-indigo-50 border-indigo-500 text-indigo-950 shadow-sm ring-2 ring-indigo-500/30"
                                  : isDark
                                    ? "bg-indigo-600/30 border-indigo-400 text-white shadow-md ring-2 ring-indigo-500/30"
                                    : "bg-indigo-600/25 border-indigo-500 text-white shadow-md ring-2 ring-indigo-500/20"
                                : isLight
                                  ? "bg-slate-50 border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70"
                                  : isDark
                                    ? "bg-white/[0.03] border-white/8 text-zinc-400 hover:border-white/20 hover:text-white"
                                    : "bg-white/[0.02] border-blue-500/15 text-slate-300 hover:border-blue-400/30 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center justify-between font-mono text-[11px]">
                              <span className="font-semibold">
                                {tier.minQuantity}
                                {tier.maxQuantity ? ` - ${tier.maxQuantity}` : "+"} {product.unit || "pcs"}
                              </span>
                              {isTierActive ? (
                                <span className="bg-indigo-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold flex items-center gap-0.5">
                                  <Check className="w-2.5 h-2.5" /> ACTIVE
                                </span>
                              ) : (
                                <span className={`text-[9px] font-medium opacity-60 ${themeTextMuted}`}>
                                  Select
                                </span>
                              )}
                            </div>
                            <div className={`font-bold text-sm font-mono ${isTierActive ? (isLight ? "text-indigo-700 font-black" : "text-white font-black") : themeText}`}>
                              ETB {tier.discountedPricePerUnit.toLocaleString()}
                            </div>
                            {tier.savingsPercentage && tier.savingsPercentage > 0 ? (
                              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                Save {tier.savingsPercentage}%
                              </div>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity Picker & Action Buttons */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium ${themeTextMuted}`}>Order Quantity:</span>
                    <div className={`flex items-center rounded-xl border p-1 ${
                      isLight ? "border-slate-200 bg-slate-100/80" : "border-white/10 bg-white/5"
                    }`}>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(moq, q - 1))}
                        disabled={quantity <= moq}
                        className={`h-7 w-7 rounded-lg flex items-center justify-center disabled:opacity-40 transition-colors cursor-pointer ${
                          isLight ? "hover:bg-white text-slate-700" : "hover:bg-white/10 text-zinc-300"
                        }`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className={`w-12 text-center text-xs font-bold font-mono ${themeText}`}>
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(product.stock || 9999, q + 1))}
                        disabled={quantity >= (product.stock || 9999)}
                        className={`h-7 w-7 rounded-lg flex items-center justify-center disabled:opacity-40 transition-colors cursor-pointer ${
                          isLight ? "hover:bg-white text-slate-700" : "hover:bg-white/10 text-zinc-300"
                        }`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Calculated Total Price */}
                  <div className="text-right">
                    <div className={`text-[10.5px] ${themeTextMuted}`}>Estimated Total:</div>
                    <div className="text-base sm:text-lg font-black text-cyan-600 dark:text-cyan-400 font-mono">
                      ETB {effectiveTotalPrice.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Quick Preset Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                  <span className={`text-[10.5px] font-medium mr-1 ${themeTextMuted}`}>Presets:</span>
                  {[moq, 25, 50, 100, 250, 500, 1000]
                    .filter((v, idx, arr) => arr.indexOf(v) === idx)
                    .map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setQuantity(preset)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                          quantity === preset
                            ? "bg-indigo-600 text-white font-bold"
                            : isLight
                              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className={`flex items-center justify-center gap-2 rounded-2xl border px-5 py-3.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      isAdded
                        ? "border-emerald-500/50 bg-emerald-600 text-white"
                        : isLight
                          ? "border-indigo-600/30 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white shadow-xs"
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

            {/* Escrow Guarantee Pill Card with Glassmorphism */}
            <div className={`rounded-2xl border p-4 backdrop-blur-xl space-y-2 shadow-lg transition-all ${
              isLight
                ? "bg-emerald-50/80 border-emerald-300/60 text-emerald-950 shadow-emerald-500/5"
                : "bg-emerald-950/30 border-emerald-500/30 text-emerald-200 shadow-emerald-950/20"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span>MercatoX 100% Escrow Protection</span>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase font-mono tracking-wider ${glassVerifiedBadge}`}>
                  Verified Vault
                </span>
              </div>
              <p className={`text-[11px] leading-relaxed ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                Your payment remains locked in a protected vault. You share your 4-digit handover OTP only after inspecting this item physically at your doorstep in Addis Ababa.
              </p>
            </div>

            {/* Verified Seller Details Card with Glassmorphism */}
            <div className={`rounded-2xl p-4 space-y-3 transition-all ${glassCard}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-indigo-500/20">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold flex items-center gap-1.5 ${themeText}`}>
                      <span>{product.shopName}</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-500" />
                    </h3>
                    <span className={`text-[10px] flex items-center gap-1 ${themeTextMuted}`}>
                      <MapPin className="h-2.5 w-2.5 text-indigo-500" />
                      <span>{product.warehouseLocation || product.marketZone}</span>
                    </span>
                  </div>
                </div>

                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${glassSupplierBadge}`}>
                  Verified Supplier
                </span>
              </div>

              <div className={`grid grid-cols-2 gap-2 pt-2 border-t text-[11px] ${
                isLight ? "border-slate-200/80 text-slate-600" : "border-white/5 text-zinc-400"
              }`}>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Response: &lt; 2 hours</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Warehouse className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Direct Warehouse Supply</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Specifications, Volume Pricing, Logistics, Escrow & Customer Reviews */}
        <div className={`rounded-3xl border p-6 backdrop-blur-xl shadow-2xl space-y-6 ${themeCardBg}`}>
          {/* Tab Navigation Header */}
          <div className={`flex items-center gap-4 border-b pb-3 overflow-x-auto no-scrollbar ${
            isLight ? "border-slate-200" : isDark ? "border-white/10" : "border-blue-500/20"
          }`}>
            {[
              { id: "overview", label: "Description & Specifications" },
              { id: "wholesale", label: "Volume Pricing" },
              { id: "supplier", label: "Supplier Profile" },
              { id: "logistics", label: "Logistics & Warehousing" },
              { id: "escrow", label: "Escrow & Buyer Guarantee" },
              { id: "reviews", label: `Verified Reviews (${reviewCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-2 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? "text-cyan-500 dark:text-cyan-400"
                    : isLight
                      ? "text-slate-500 hover:text-slate-900"
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

          {/* 1. Description & Specifications Tab */}
          {activeTab === "overview" && (
            <div className={`space-y-6 text-xs sm:text-sm leading-relaxed ${themeTextSubtle}`}>
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Product Overview</span>
                </h4>
                <p className={`whitespace-pre-line leading-relaxed text-sm p-4 rounded-2xl border ${
                  isLight
                    ? "bg-slate-50/80 border-slate-200 text-slate-800"
                    : isDark
                      ? "bg-white/[0.02] border-white/8 text-zinc-200"
                      : "bg-white/[0.02] border-blue-500/15 text-slate-200"
                }`}>
                  {product.description}
                </p>
              </div>

              {/* Complete Technical Specifications Grid */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>Technical & Commercial Specifications</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {Object.entries(displaySpecs).map(([key, val]) => (
                    <div
                      key={key}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 border ${
                        isLight
                          ? "bg-slate-50/70 border-slate-200 text-slate-800"
                          : isDark
                            ? "bg-white/[0.03] border-white/5 text-zinc-200"
                            : "bg-white/[0.03] border-blue-500/15 text-slate-200"
                      }`}
                    >
                      <span className={`${themeTextMuted} font-medium`}>{key}</span>
                      <span className={`font-semibold font-mono text-right max-w-[60%] truncate ${themeText}`}>
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. Volume Pricing Tab */}
          {activeTab === "wholesale" && (
            <div className={`space-y-6 text-xs sm:text-sm leading-relaxed ${themeTextSubtle}`}>
              <div className="space-y-2">
                <h4 className={`text-sm font-bold flex items-center gap-2 ${themeText}`}>
                  <TrendingDown className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                  <span>Volume Pricing Breakdown</span>
                </h4>
                <p className={`text-xs ${themeTextMuted}`}>
                  Click on any tier below to automatically apply that tier&apos;s minimum quantity and unlock commercial wholesale pricing.
                </p>
              </div>

              {product.tieredPricing && product.tieredPricing.length > 0 ? (
                <div className={`overflow-x-auto rounded-2xl border ${
                  isLight ? "border-slate-200" : isDark ? "border-white/10" : "border-blue-500/20"
                }`}>
                  <table className="w-full text-left text-xs">
                    <thead className={`${
                      isLight
                        ? "bg-slate-100/90 text-slate-700 border-slate-200"
                        : isDark
                          ? "bg-white/5 text-zinc-400 border-white/10"
                          : "bg-white/5 text-slate-400 border-blue-500/20"
                    } font-semibold border-b`}>
                      <tr>
                        <th className="p-3.5">Tier Volume Range</th>
                        <th className="p-3.5">Discounted Price / {product.unit || "Unit"}</th>
                        <th className="p-3.5">Commercial Savings</th>
                        <th className="p-3.5 text-right">Action / Status</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${
                      isLight ? "divide-slate-200" : isDark ? "divide-white/5" : "divide-blue-500/15"
                    }`}>
                      {product.tieredPricing.map((tier, idx) => {
                        const isMatch =
                          quantity >= tier.minQuantity &&
                          (!tier.maxQuantity || quantity <= tier.maxQuantity);
                        return (
                          <tr
                            key={idx}
                            onClick={() => {
                              setQuantity(tier.minQuantity);
                              toast.success(`Volume tier applied: ${tier.minQuantity}+ units`, {
                                description: `Unit price updated to ETB ${tier.discountedPricePerUnit.toLocaleString()}`,
                              });
                            }}
                            className={`transition-colors cursor-pointer ${
                              isMatch
                                ? isLight
                                  ? "bg-indigo-50/90 text-indigo-950 font-bold"
                                  : "bg-indigo-600/20 text-white font-bold"
                                : isLight
                                  ? "hover:bg-slate-50 text-slate-700"
                                  : isDark
                                    ? "hover:bg-white/[0.03] text-zinc-300"
                                    : "hover:bg-blue-500/[0.06] text-slate-300"
                            }`}
                          >
                            <td className="p-3.5 font-mono">
                              {tier.minQuantity} - {tier.maxQuantity ? tier.maxQuantity : "Unlimited"}{" "}
                              {product.unit || "units"}
                            </td>
                            <td className="p-3.5 font-mono text-cyan-600 dark:text-cyan-400 font-bold text-sm">
                              ETB {tier.discountedPricePerUnit.toLocaleString()}
                            </td>
                            <td className="p-3.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                              {tier.savingsPercentage ? `Save ${tier.savingsPercentage}%` : "Standard Bulk"}
                            </td>
                            <td className="p-3.5 text-right font-mono">
                              {isMatch ? (
                                <span className="bg-indigo-600 text-white text-[10px] px-2.5 py-1 rounded-full font-bold shadow-xs">
                                  Active Tier
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setQuantity(tier.minQuantity);
                                    toast.success(`Volume tier applied: ${tier.minQuantity}+ units`, {
                                      description: `Unit price updated to ETB ${tier.discountedPricePerUnit.toLocaleString()}`,
                                    });
                                  }}
                                  className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                                    isLight
                                      ? "border-indigo-300 bg-white text-indigo-700 hover:bg-indigo-50"
                                      : "border-indigo-500/40 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20"
                                  }`}
                                >
                                  Apply {tier.minQuantity}+
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={`p-6 rounded-2xl border text-center space-y-2 ${
                  isLight ? "bg-slate-50 border-slate-200" : isDark ? "bg-white/[0.02] border-white/5" : "bg-white/[0.02] border-blue-500/15"
                }`}>
                  <Package className="w-8 h-8 text-zinc-400 mx-auto" />
                  <p className={`text-xs font-semibold ${themeText}`}>
                    Standard Retail / Commercial Rate
                  </p>
                  <p className={`text-[11px] ${themeTextMuted}`}>
                    ETB {product.price.toLocaleString()} per {product.unit || "unit"} (MOQ: {moq} {product.unit || "units"}).
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 3. Supplier Profile Tab */}
          {activeTab === "supplier" && (
            <div className={`space-y-6 text-xs sm:text-sm leading-relaxed ${themeTextSubtle}`}>
              <div className={`rounded-2xl p-5 space-y-4 transition-all ${glassCard}`}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-indigo-500/20">
                      <Store className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold flex items-center gap-1.5 ${themeText}`}>
                        <span>{product.shopName}</span>
                        <CheckCircle2 className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                      </h3>
                      <span className={`text-xs flex items-center gap-1 ${themeTextMuted}`}>
                        <MapPin className="h-3 w-3 text-indigo-500" />
                        <span>{product.warehouseLocation || product.marketZone}</span>
                      </span>
                    </div>
                  </div>

                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${glassVerifiedBadge}`}>
                    Verified Merchant KYC
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className={`p-3 rounded-xl border space-y-1 backdrop-blur-md ${
                    isLight ? "bg-white/80 border-slate-200" : isDark ? "bg-white/[0.03] border-white/5" : "bg-white/[0.03] border-blue-500/15"
                  }`}>
                    <div className={`text-[11px] ${themeTextMuted}`}>Supplier Rating</div>
                    <div className={`text-sm font-bold font-mono flex items-center gap-1 ${themeText}`}>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{dynamicRating > 0 ? `${dynamicRating.toFixed(1)} / 5.0` : "No ratings yet"}</span>
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border space-y-1 backdrop-blur-md ${
                    isLight ? "bg-white/80 border-slate-200" : isDark ? "bg-white/[0.03] border-white/5" : "bg-white/[0.03] border-blue-500/15"
                  }`}>
                    <div className={`text-[11px] ${themeTextMuted}`}>Average Response Time</div>
                    <div className="text-sm font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                      &lt; 2 Hours
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border space-y-1 backdrop-blur-md ${
                    isLight ? "bg-white/80 border-slate-200" : isDark ? "bg-white/[0.03] border-white/5" : "bg-white/[0.03] border-blue-500/15"
                  }`}>
                    <div className={`text-[11px] ${themeTextMuted}`}>Escrow Compliance</div>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      100% Guaranteed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. Logistics & Warehousing Tab */}
          {activeTab === "logistics" && (
            <div className={`space-y-4 text-xs sm:text-sm leading-relaxed ${themeTextSubtle}`}>
              <div className={`rounded-2xl border p-5 space-y-4 ${
                isLight ? "bg-slate-50/80 border-slate-200" : isDark ? "border-white/10 bg-black/40" : "border-blue-500/20 bg-black/30"
              }`}>
                <h4 className={`text-sm font-bold flex items-center gap-2 ${themeText}`}>
                  <Truck className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                  <span>MercatoX Logistics & Dispatch Network</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className={`p-3.5 rounded-xl border space-y-1 ${
                    isLight ? "bg-white border-slate-200" : isDark ? "bg-white/[0.03] border-white/5" : "bg-white/[0.03] border-blue-500/15"
                  }`}>
                    <span className={themeTextMuted}>Origin / Warehouse Hub:</span>
                    <p className={`font-semibold font-mono ${themeText}`}>
                      {product.warehouseLocation || product.branchName || "Mercato Central Distribution Hub"}
                    </p>
                  </div>

                  <div className={`p-3.5 rounded-xl border space-y-1 ${
                    isLight ? "bg-white border-slate-200" : isDark ? "bg-white/[0.03] border-white/5" : "bg-white/[0.03] border-blue-500/15"
                  }`}>
                    <span className={themeTextMuted}>Dispatch Lead Time:</span>
                    <p className={`font-semibold font-mono ${themeText}`}>
                      {product.leadTimeDays || 3} Business Days Dispatch SLA
                    </p>
                  </div>
                </div>

                <ul className={`list-disc pl-5 space-y-1.5 text-xs ${themeTextSubtle}`}>
                  <li>Direct Doorstep delivery to all subcities in Addis Ababa (Bole, Kazanchis, Piassa, Merkato, Sarbet, Ayat, CMC, etc.).</li>
                  <li>Regional freight options available for bulk consignments with bill of lading documentation.</li>
                  <li>Real-time SMS courier dispatch tracking and 4-digit handover OTP verification.</li>
                </ul>
              </div>
            </div>
          )}

          {/* 5. Escrow & Buyer Guarantee Tab */}
          {activeTab === "escrow" && (
            <div className={`space-y-4 text-xs sm:text-sm leading-relaxed ${themeTextSubtle}`}>
              <div className={`rounded-2xl p-5 space-y-3 transition-all ${glassCard}`}>
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-bold flex items-center gap-2 ${themeText}`}>
                    <Lock className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                    <span>How MercatoX Escrow Protects Your Money</span>
                  </h4>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${glassVerifiedBadge}`}>
                    Verified Escrow
                  </span>
                </div>
                <ol className={`list-decimal pl-5 space-y-2 text-xs ${themeTextSubtle}`}>
                  <li>You place your order and authorize payment via Telebirr, Chapa, CBE, or Card.</li>
                  <li>Funds are immediately deposited into a locked fiduciary trust account.</li>
                  <li>The seller packages your item and handovers to our licensed courier.</li>
                  <li>You receive an SMS with a unique 4-digit handover OTP.</li>
                  <li>When the courier arrives at your doorstep, you open and inspect the package physically.</li>
                  <li>If satisfied, you give the 4-digit OTP to the courier to release payment.</li>
                </ol>
              </div>
            </div>
          )}

          {/* 6. Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="space-y-8">
              {/* Rating Overview Breakdown Grid with Glassmorphism */}
              <div className={`grid grid-cols-1 md:grid-cols-12 gap-6 p-5 sm:p-6 rounded-2xl border shadow-xl items-center transition-all ${glassCard}`}>
                {/* Score Summary */}
                <div className={`md:col-span-4 text-center md:text-left space-y-2 md:border-r md:pr-6 ${
                  isLight ? "md:border-slate-200" : isDark ? "md:border-white/10" : "md:border-blue-500/20"
                }`}>
                  <div className="flex items-baseline justify-center md:justify-start gap-2">
                    <span className={`text-4xl sm:text-5xl font-black font-mono ${themeText}`}>
                      {dynamicRating > 0 ? dynamicRating.toFixed(1) : "0.0"}
                    </span>
                    <span className={`font-bold text-sm ${themeTextMuted}`}>/ 5.0</span>
                  </div>

                  <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          dynamicRating > 0 && star <= Math.round(dynamicRating)
                            ? "fill-amber-400 text-amber-400"
                            : isLight
                              ? "text-slate-300"
                              : "text-zinc-700"
                        }`}
                      />
                    ))}
                  </div>

                  <p className={`text-xs ${themeTextMuted}`}>
                    {reviewCount > 0 ? (
                      <>
                        Based on <strong className={`font-mono ${themeText}`}>{reviewCount}</strong> verified customer purchase{reviewCount > 1 ? "s" : ""} in Addis Ababa.
                      </>
                    ) : (
                      "No customer ratings recorded in the database yet."
                    )}
                  </p>

                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-semibold ${glassVerifiedBadge}`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>100% Real OTP Verified</span>
                  </div>
                </div>

                {/* Rating Distribution Bars */}
                <div className="md:col-span-8 space-y-2">
                  {[5, 4, 3, 2, 1].map((ratingStar) => {
                    const count = reviews.filter((r) => Math.round(r.rating) === ratingStar).length;
                    const percent = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                    return (
                      <button
                        key={ratingStar}
                        type="button"
                        onClick={() =>
                          setReviewFilterRating((prev) => (prev === ratingStar ? "all" : ratingStar))
                        }
                        className="w-full flex items-center gap-3 text-xs group cursor-pointer text-left"
                      >
                        <span className={`w-12 font-medium flex items-center gap-1 shrink-0 ${themeTextMuted}`}>
                          {ratingStar} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        </span>
                        <div className={`flex-1 h-2 rounded-full overflow-hidden border ${
                          isLight
                            ? "bg-slate-200/80 border-slate-200"
                            : isDark
                              ? "bg-white/5 border-white/5"
                              : "bg-white/5 border-blue-500/20"
                        }`}>
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              ratingStar >= 4
                                ? "bg-gradient-to-r from-amber-400 to-emerald-400"
                                : "bg-gradient-to-r from-indigo-500 to-cyan-400"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className={`w-10 text-right font-mono text-[11px] shrink-0 ${themeTextMuted}`}>
                          {percent}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter Chips Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
                  <span className={`font-medium text-xs flex items-center gap-1 mr-1 ${themeTextMuted}`}>
                    <Filter className="w-3 h-3" /> Filter:
                  </span>
                  {(["all", 5, 4, 3, 2, 1] as const).map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewFilterRating(star)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                        reviewFilterRating === star
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                          : isLight
                            ? "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200"
                            : isDark
                              ? "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5"
                              : "bg-blue-900/20 text-slate-300 hover:text-white hover:bg-blue-900/40 border border-blue-500/20"
                      }`}
                    >
                      {star === "all"
                        ? `All (${reviews.length})`
                        : `${star} Stars (${reviews.filter((r) => Math.round(r.rating) === star).length})`}
                    </button>
                  ))}
                </div>

                <span className={`text-[11px] font-mono ${themeTextMuted}`}>
                  Showing{" "}
                  {reviewFilterRating === "all"
                    ? reviews.length
                    : reviews.filter((r) => Math.round(r.rating) === reviewFilterRating).length}{" "}
                  reviews
                </span>
              </div>

              {/* Reviews List from Live Database - Visible to ALL visitors */}
              <div className="space-y-3.5">
                {isLoadingReviews ? (
                  <div className={`p-8 text-center space-y-2 rounded-2xl border ${
                    isLight ? "bg-slate-50 border-slate-200" : isDark ? "bg-white/[0.02] border-white/5" : "bg-white/[0.02] border-blue-500/15"
                  }`}>
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-500 dark:text-cyan-400 mx-auto" />
                    <p className={`text-xs ${themeTextMuted}`}>Loading verified customer reviews from database...</p>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className={`p-8 text-center space-y-2 rounded-2xl border ${
                    isLight ? "bg-slate-50 border-slate-200" : isDark ? "bg-white/[0.02] border-white/5" : "bg-white/[0.02] border-blue-500/15"
                  }`}>
                    <MessageSquareQuote className="w-8 h-8 text-zinc-400 mx-auto" />
                    <p className={`text-xs font-semibold ${themeText}`}>No customer reviews yet</p>
                    <p className={`text-[11px] ${themeTextMuted}`}>Be the first verified customer to write a review below!</p>
                  </div>
                ) : (
                  (reviewFilterRating === "all"
                    ? reviews
                    : reviews.filter((r) => Math.round(r.rating) === reviewFilterRating)
                  ).map((rev) => (
                    <div
                      key={rev.id}
                      className={`rounded-2xl border p-4 sm:p-5 space-y-3 backdrop-blur-xl shadow-lg transition-all ${
                        isLight
                          ? "bg-white/80 border-slate-200/90 hover:border-indigo-400/50 hover:shadow-indigo-500/5"
                          : isDark
                            ? "bg-[#141418]/80 border-white/10 hover:border-indigo-500/40 hover:shadow-black/50"
                            : "bg-[#0d1222]/85 border-blue-500/20 hover:border-cyan-500/40 hover:shadow-cyan-950/40"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center font-bold text-white text-xs shadow-md shrink-0 ring-1 ring-white/20">
                            {rev.author.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-bold text-xs ${themeText}`}>{rev.author}</span>
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-semibold ${glassVerifiedBadge}`}>
                                <CheckCircle2 className="w-3 h-3" />
                                Verified Buyer
                              </span>
                            </div>
                            <span className={`text-[10.5px] ${themeTextMuted}`}>
                              {rev.location} • {rev.date}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-amber-400 bg-amber-400/10 border border-amber-400/25 px-2.5 py-1 rounded-lg shrink-0 w-fit backdrop-blur-sm">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= Math.round(rev.rating)
                                  ? "fill-amber-400 text-amber-400"
                                  : isLight
                                    ? "text-slate-300"
                                    : "text-zinc-700"
                              }`}
                            />
                          ))}
                          <span className={`font-mono text-[11px] font-bold ml-1 ${themeText}`}>
                            {rev.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      <p className={`text-xs leading-relaxed whitespace-pre-line ${themeTextSubtle}`}>{rev.comment}</p>

                      {rev.tags && rev.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {rev.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-medium backdrop-blur-sm ${
                                isLight
                                  ? "bg-slate-100/80 border-slate-200 text-slate-700"
                                  : isDark
                                    ? "bg-white/[0.04] border-white/10 text-zinc-300"
                                    : "bg-blue-500/[0.08] border-blue-500/20 text-slate-200"
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Compact 1-Input Rate & Review: Strictly for Logged-In Users */}
              {mounted && user && (
                <form
                  onSubmit={handleReviewSubmit}
                  className={`rounded-2xl border p-4 sm:p-5 space-y-3.5 max-w-xl transition-all ${glassCard}`}
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <span className={`text-xs font-bold flex items-center gap-1.5 ${themeText}`}>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>Rate & Review</span>
                    </span>

                    {/* Compact Star Rating Picker */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNewReviewRating(s)}
                          className="p-0.5 transition-transform hover:scale-110 cursor-pointer"
                          title={`${s} Star${s > 1 ? "s" : ""}`}
                        >
                          <Star
                            className={`h-5 w-5 transition-colors ${
                              s <= newReviewRating
                                ? "fill-amber-400 text-amber-400"
                                : isLight
                                  ? "text-slate-300 hover:text-slate-400"
                                  : "text-zinc-700 hover:text-zinc-500"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-[11px] font-bold font-mono text-amber-500 dark:text-amber-400 ml-1">
                        {newReviewRating}.0
                      </span>
                    </div>
                  </div>

                  {/* 1 Single Clean Input */}
                  <textarea
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    placeholder="Write your review here..."
                    rows={2}
                    className={`w-full rounded-xl border p-3 text-xs outline-none focus:border-indigo-500 transition-colors resize-none ${themeInputBg}`}
                    required
                  />

                  {/* Compact Submit Button */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[11px] ${themeTextMuted} truncate`}>
                      Reviewing as <strong className={themeText}>{user.name || "Buyer"}</strong>
                    </span>

                    <button
                      type="submit"
                      disabled={isSubmittingReview || !newReviewComment.trim()}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {isSubmittingReview ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          <span>Submit Review</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Related Products from Same Department */}
        {relatedProducts.length > 0 && (
          <div className={`space-y-3.5 pt-4 border-t ${
            isLight ? "border-slate-200" : isDark ? "border-white/10" : "border-blue-500/20"
          }`}>
            <div className="flex items-center justify-between pb-1">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                  Recommended Catalog Deals
                </span>
                <h3 className={`text-base sm:text-lg font-bold ${themeText}`}>
                  Customers Also Viewed
                </h3>
              </div>
              <Link
                href="/marketplace"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline transition-colors"
              >
                View Marketplace
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} onQuickView={handleQuickView} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Lightbox Modal (Ultra High-Resolution Preview) */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
        >
          <div className="absolute top-5 right-5 flex items-center gap-3 z-10">
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Close Fullscreen View"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div
            className="relative max-w-5xl max-h-[80vh] w-full flex items-center justify-center overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={galleryImages[activeImageIdx] || selectedImage || product.image}
              alt={product.name}
              className="w-auto h-auto max-h-[75vh] max-w-full object-contain rounded-xl"
            />
          </div>

          {/* Lightbox Thumbnails */}
          {galleryImages.length > 1 && (
            <div
              className="flex items-center gap-2 mt-4 overflow-x-auto py-2 px-4 rounded-2xl bg-black/50 border border-white/10 max-w-full no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActiveImageIdx(idx);
                    setSelectedImage(img);
                  }}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    activeImageIdx === idx
                      ? "border-indigo-500 scale-105 shadow-md shadow-indigo-500/30"
                      : "border-white/10 opacity-50 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <CustomerFooter />
    </div>
  );
}

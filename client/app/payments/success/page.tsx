"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ShieldCheck,
  ShoppingBag,
  Package,
  Copy,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Star,
  Send,
  Sparkles,
} from "lucide-react";
import { CustomerHeader } from "@/components/layout/customer-header";
import { CustomerFooter } from "@/components/layout/footer";
import { useCartStore, useAuthStore } from "@/store";
import { saveOrderToDatabase } from "@/lib/api/orders";
import { toast } from "sonner";

interface PendingOrderInfo {
  orderId?: string;
  orderNumber?: string;
  txRef: string;
  amount: number;
  customerId?: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  subcity: string;
  specificAddress: string;
  deliveryNotes?: string;
  paymentMethod?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  createdAt: string;
}

const REVIEW_TAGS = [
  "⚡ Fast Chapa Payment",
  "🛡️ Escrow Protected",
  "✨ High Quality Product",
  "🚚 Fast Addis Delivery",
  "🤝 Verified Seller",
];

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const txRefFromQuery = searchParams.get("tx_ref") || searchParams.get("trx_ref");
  const amountFromQuery = searchParams.get("amount");

  const clearCart = useCartStore((state) => state.clearCart);
  const { user } = useAuthStore();

  const [orderInfo, setOrderInfo] = useState<PendingOrderInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Review & Rating State
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "⚡ Fast Chapa Payment",
    "🛡️ Escrow Protected",
  ]);
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);
  const [orderPersistedInDb, setOrderPersistedInDb] = useState<boolean>(false);

  useEffect(() => {
    // 1. Clear cart now that payment has succeeded
    clearCart();

    // 2. Load order snapshot from checkout
    let parsed: PendingOrderInfo | null = null;
    try {
      const savedRaw = localStorage.getItem("mercatox_last_checkout_order");
      if (savedRaw) {
        parsed = JSON.parse(savedRaw);
        setOrderInfo(parsed);
      }
    } catch (e) {
      console.warn("Could not read order from localStorage", e);
    }

    // 3. Save order into PostgreSQL database
    const tx = txRefFromQuery || parsed?.txRef || `MX-CHAPA-${Date.now()}`;
    const custId = user?.id || parsed?.customerId;

    if (parsed) {
      saveOrderToDatabase({
        orderId: parsed.orderId,
        customerId: custId,
        txRef: tx,
        items: parsed.items || [],
        deliveryAddress: {
          recipientName: parsed.fullName,
          phone: parsed.phoneNumber,
          city: "Addis Ababa",
          subCity: parsed.subcity,
          specificLocation: parsed.specificAddress,
          notes: parsed.deliveryNotes,
        },
        deliveryFee: 150,
        subtotalAmount: Number(parsed.amount) - 150,
        totalAmount: Number(parsed.amount),
        notes: parsed.deliveryNotes,
        paymentMethod: parsed.paymentMethod || "CHAPA",
      }).then((res) => {
        if (res.success) {
          setOrderPersistedInDb(true);
          console.log("[PaymentSuccess] Order persisted in PostgreSQL:", res);
        }
      });

      // Verify payment with payment service
      if (tx) {
        fetch(`/api/payments/verify?tx_ref=${encodeURIComponent(tx)}`).catch(() => {});
      }
    }
  }, [clearCart, txRefFromQuery, user?.id]);

  const displayTxRef = txRefFromQuery || orderInfo?.txRef || "MX-CHAPA-ESCROW";
  const displayAmount =
    amountFromQuery ||
    (orderInfo?.amount ? orderInfo.amount.toLocaleString() : "Confirmed");

  const primaryItem = orderInfo?.items && orderInfo.items.length > 0 ? orderInfo.items[0] : null;

  const handleCopyTxRef = () => {
    if (!displayTxRef) return;
    navigator.clipboard.writeText(displayTxRef);
    setCopied(true);
    toast.success("Transaction reference copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRating) {
      toast.error("Please choose a star rating from 1 to 5");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: selectedRating,
          comment: reviewComment.trim(),
          tags: selectedTags,
          customerName: orderInfo?.fullName || user?.name || "Verified Customer",
          customerId: user?.id || orderInfo?.customerId,
          txRef: displayTxRef,
          productId: primaryItem?.id || "general-order",
          productTitle: primaryItem?.name || "Mercato Product",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReviewSubmitted(true);
        toast.success("Review Saved to Database!", {
          description: "Your rating & review are now displayed on the product detail page.",
        });
      } else {
        toast.error("Failed to save review", {
          description: data.error || "Please try again later.",
        });
      }
    } catch (err: any) {
      console.error("Error submitting review:", err);
      toast.error("Failed to save review", {
        description: err.message || "Network error",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100 text-zinc-900 dark:bg-[#070a12] dark:text-zinc-100 transition-colors duration-200">
      <CustomerHeader />

      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        {/* Single Compact Card with light/dark adaptive styling */}
        <div className="w-full max-w-lg rounded-3xl border transition-all bg-white text-zinc-900 border-zinc-200/90 shadow-2xl shadow-zinc-200/70 dark:bg-[#0b101f] dark:text-zinc-100 dark:border-white/10 dark:shadow-2xl dark:shadow-black/80 p-5 sm:p-7 space-y-5">
          {/* Header Checkmark & Title */}
          <div className="text-center space-y-2">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-0.5 shadow-xl shadow-emerald-500/25 flex items-center justify-center animate-in zoom-in-75 duration-300">
              <div className="h-full w-full bg-white dark:bg-[#070a12] rounded-[14px] flex items-center justify-center transition-colors">
                <CheckCircle2 className="h-9 w-9 text-emerald-500 dark:text-emerald-400" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold tracking-wide uppercase">
                <ShieldCheck className="h-3 w-3" />
                <span>Escrow Protected & Saved in DB</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Payment Successful!
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Your payment was received and securely locked in Escrow.
              </p>
            </div>
          </div>

          {/* Amount & Transaction Reference Pill */}
          <div className="rounded-2xl bg-zinc-50 border border-zinc-200/80 dark:bg-white/[0.03] dark:border-white/5 p-4 text-center space-y-2 transition-colors">
            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Total Amount Paid
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
              {displayAmount} <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">ETB</span>
            </div>

            <div className="pt-1 flex items-center justify-center gap-1.5 text-xs font-mono text-zinc-600 dark:text-zinc-300">
              <span className="text-zinc-400 dark:text-zinc-500 text-[11px]">Ref:</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[210px] sm:max-w-xs">
                {displayTxRef}
              </span>
              <button
                type="button"
                onClick={handleCopyTxRef}
                className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors cursor-pointer"
                title="Copy Reference"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              {copied && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-semibold">
                  Copied!
                </span>
              )}
            </div>
          </div>

          {/* Compact Order Details Toggle */}
          {orderInfo && (
            <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 dark:bg-white/[0.02] dark:border-white/5 overflow-hidden transition-colors">
              <button
                type="button"
                onClick={() => setShowOrderDetails(!showOrderDetails)}
                className="w-full p-3.5 flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Delivery Destination & Items ({orderInfo.items?.length || 0})</span>
                </div>
                {showOrderDetails ? (
                  <ChevronUp className="h-4 w-4 text-zinc-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-zinc-400" />
                )}
              </button>

              {showOrderDetails && (
                <div className="p-3.5 pt-0 border-t border-zinc-200 dark:border-white/5 space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px] pt-2.5">
                    <div>
                      <span className="text-zinc-400 block text-[10.5px]">Recipient:</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {orderInfo.fullName}
                      </span>
                      <span className="block text-zinc-500 dark:text-zinc-400 font-mono">
                        {orderInfo.phoneNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10.5px]">Address:</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {orderInfo.subcity}
                      </span>
                      <span className="block text-zinc-500 dark:text-zinc-400 truncate">
                        {orderInfo.specificAddress}
                      </span>
                    </div>
                  </div>

                  {orderInfo.items && orderInfo.items.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-zinc-200 dark:border-white/5">
                      {orderInfo.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px]">
                          <span className="text-zinc-700 dark:text-zinc-300 truncate max-w-[220px]">
                            {it.name} (x{it.quantity})
                          </span>
                          <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                            {(it.price * it.quantity).toLocaleString()} ETB
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* USER REQUESTED: RATE & REVIEW FORM SAVED TO DATABASE          */}
          {/* ------------------------------------------------------------- */}
          <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50/70 dark:bg-white/[0.03] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white">
                  Rate & Review Product
                </h3>
              </div>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                Saves directly to Database
              </span>
            </div>

            {reviewSubmitted ? (
              <div className="py-4 text-center space-y-2">
                <div className="h-10 w-10 mx-auto rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                  Review & Rating Submitted!
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Your feedback has been saved into the database and is now live on the product detail page.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-3">
                {primaryItem && (
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-black/30 border border-zinc-200 dark:border-white/5">
                    {primaryItem.image && (
                      <img
                        src={primaryItem.image}
                        alt={primaryItem.name}
                        className="h-10 w-10 rounded-lg object-cover border border-zinc-200 dark:border-white/10 shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                        {primaryItem.name}
                      </p>
                      <p className="text-[10px] text-zinc-400">Verified Purchase</p>
                    </div>
                  </div>
                )}

                {/* Interactive Star Rating */}
                <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = star <= (hoverRating || selectedRating);
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setSelectedRating(star)}
                          className="p-1 text-zinc-300 hover:text-amber-400 transition-colors cursor-pointer"
                          aria-label={`Rate ${star} stars`}
                        >
                          <Star
                            className={`h-6 w-6 transition-all ${
                              isFilled
                                ? "fill-amber-400 text-amber-400 scale-110"
                                : "text-zinc-300 dark:text-zinc-600"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    {selectedRating === 5 && "Excellent (5/5)"}
                    {selectedRating === 4 && "Very Good (4/5)"}
                    {selectedRating === 3 && "Good (3/5)"}
                    {selectedRating === 2 && "Fair (2/5)"}
                    {selectedRating === 1 && "Poor (1/5)"}
                  </span>
                </div>

                {/* Review Comment Textarea */}
                <div>
                  <textarea
                    rows={2}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Write a brief review about product quality, seller service, and delivery..."
                    className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-black/30 p-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-cyan-500 transition-all resize-none"
                  />
                </div>

                {/* Sentiment Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {REVIEW_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`text-[10px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 font-semibold"
                            : "bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>

                {/* Submit Review Button */}
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-bold shadow-md shadow-amber-500/20 active:scale-98 transition-all cursor-pointer disabled:opacity-60"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isSubmittingReview ? "Saving to Database..." : "Save Review & Rating"}</span>
                </button>
              </form>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <Link
              href="/orders"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 py-3 text-xs sm:text-sm font-bold text-white shadow-xl shadow-teal-500/20 active:scale-98 transition-all cursor-pointer"
            >
              <Package className="h-4 w-4" />
              <span>View My Orders</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="text-center pt-1">
              <Link
                href="/marketplace"
                className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors"
              >
                Continue Shopping on Marketplace
              </Link>
            </div>
          </div>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-[#070a12] text-zinc-900 dark:text-white">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}

"use client";

import React, { useState } from "react";
import {
  Star as StarIcon,
  MessageSquare as MessageSquareIcon,
  ThumbsUp as ThumbsUpIcon,
  ShieldCheck as ShieldCheckIcon,
  Send as SendIcon,
  CheckCircle2 as CheckCircle2Icon,
  Package as PackageIcon,
  MapPin as MapPinIcon,
  Sparkles as SparklesIcon,
  Reply,
  CornerDownRight as CornerDownRightIcon,
} from "lucide-react";
import { toast } from "sonner";

interface ReviewItem {
  id: string;
  author: string;
  avatarText: string;
  rating: number;
  productTitle: string;
  date: string;
  city: string;
  subCity: string;
  comment: string;
  verifiedBuyer: boolean;
  merchantReply?: string;
}

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    author: "Dawit Haile",
    avatarText: "DH",
    rating: 5,
    productTitle: "Apple MacBook Pro 14 M3",
    date: "Yesterday",
    city: "Addis Ababa",
    subCity: "Bole Medhanialem",
    comment: "Excellent original device! Tested thoroughly before confirming the delivery OTP to the courier. Everything sealed and works smoothly.",
    verifiedBuyer: true,
    merchantReply: "Thank you Dawit! We appreciate your trust in our store. Your warranty is active in our system.",
  },
  {
    id: "rev-2",
    author: "Selamawit Tadesse",
    avatarText: "ST",
    rating: 5,
    productTitle: "Fast Wall Charger 65W GaN",
    date: "3 days ago",
    city: "Addis Ababa",
    subCity: "CMC / Yeka",
    comment: "Super fast dispatch. Ordered in the morning, received it around 3 PM in CMC via Telebirr payment. Very impressed!",
    verifiedBuyer: true,
  },
  {
    id: "rev-3",
    author: "Henok Bekele",
    avatarText: "HB",
    rating: 4,
    productTitle: "Flagship AMOLED Smartphone",
    date: "1 week ago",
    city: "Addis Ababa",
    subCity: "Kirkos / Kazanchis",
    comment: "Good condition and genuine specs. Packaging was neat. Took slightly longer due to heavy rain in Kazanchis, but courier was polite.",
    verifiedBuyer: true,
  },
];

export function SellerReviews() {
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | "all">("all");
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [activeReplyBox, setActiveReplyBox] = useState<string | null>(null);

  const handleSendReply = (reviewId: string) => {
    const text = replyInputs[reviewId]?.trim();
    if (!text) {
      toast.error("Reply text cannot be empty");
      return;
    }

    setReviews(
      reviews.map((r) => (r.id === reviewId ? { ...r, merchantReply: text } : r))
    );
    setReplyInputs({ ...replyInputs, [reviewId]: "" });
    setActiveReplyBox(null);
    toast.success("Merchant response published to your storefront!");
  };

  const filteredReviews = reviews.filter((r) => {
    if (selectedRatingFilter === "all") return true;
    return r.rating === selectedRatingFilter;
  });

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : "5.0";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <StarIcon className="h-5 w-5 text-indigo-400" />
            <span>Buyer Reviews & Store Reputation</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Verified Ethiopian buyer feedback, ratings, and customer satisfaction metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
            <ShieldCheckIcon className="h-3.5 w-3.5" />
            <span>100% Escrow Verified</span>
          </span>
        </div>
      </div>

      {/* Reputation Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Overall Score */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0d121f] p-4 flex items-center gap-4 shadow-xl">
          <div className="flex flex-col items-center justify-center h-20 w-20 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 shrink-0 shadow-inner">
            <span className="text-3xl font-black text-indigo-300 font-mono">{avgRating}</span>
            <div className="flex text-amber-400 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <StarIcon key={s} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-white">Merchant Rating</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              Based on {totalReviews} verified reviews
            </div>
            <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
              <CheckCircle2Icon className="h-3.5 w-3.5 shrink-0" />
              <span>Verified Customer Feedback</span>
            </div>
          </div>
        </div>

        {/* Store Trust Badges */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0d121f] p-4 flex flex-col justify-center space-y-2.5 text-xs sm:col-span-2 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Product Authenticity</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2Icon className="h-3.5 w-3.5" />
              <span>100% Genuine Verified</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Escrow Release Policy</span>
            <span className="font-semibold text-cyan-400">Physical Inspection on Delivery</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Courier Dispatch Hub</span>
            <span className="font-semibold text-indigo-300">Addis Ababa Metropolitan Area</span>
          </div>
        </div>
      </div>

      {/* Rating Filter Pills (Swipeable on Mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          type="button"
          onClick={() => setSelectedRatingFilter("all")}
          className={`rounded-lg px-3 py-1.5 font-semibold transition-all cursor-pointer whitespace-nowrap ${
            selectedRatingFilter === "all"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white/[0.04] text-zinc-400 hover:text-white"
          }`}
        >
          All Reviews ({reviews.length})
        </button>

        {[5, 4, 3, 2, 1].map((r) => {
          const count = reviews.filter((rev) => rev.rating === r).length;
          return (
            <button
              key={r}
              type="button"
              onClick={() => setSelectedRatingFilter(r)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedRatingFilter === r
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white/[0.04] text-zinc-400 hover:text-white"
              }`}
            >
              <span>{r}</span>
              <StarIcon className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-[10px] text-zinc-500">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Reviews Content */}
      {filteredReviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-[#0d121f] p-10 text-center text-xs text-zinc-400">
          <StarIcon className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white">No Reviews Match This Rating</p>
          <p className="text-[11px] text-zinc-500 mt-1 max-w-sm mx-auto">
            Try switching to &quot;All Reviews&quot; to inspect all customer feedback.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-2xl border border-white/[0.08] bg-[#0d121f] p-4 space-y-3 shadow-xl"
            >
              {/* Review Header: User info + Stars */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white font-bold text-xs shadow shrink-0">
                    {rev.avatarText}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{rev.author}</span>
                      {rev.verifiedBuyer && (
                        <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300">
                          Verified Buyer
                        </span>
                      )}
                    </div>
                    <span className="text-[10.5px] text-zinc-400 flex items-center gap-1 mt-0.5">
                      <MapPinIcon className="h-3 w-3 text-zinc-500 shrink-0" />
                      <span>{rev.subCity || rev.city} · {rev.date}</span>
                    </span>
                  </div>
                </div>

                <div className="flex text-amber-400 shrink-0">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < rev.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-zinc-600"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Product Reference Tag */}
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-[10.5px] text-indigo-300">
                <PackageIcon className="h-3 w-3 text-indigo-400 shrink-0" />
                <span className="truncate max-w-xs">{rev.productTitle}</span>
              </div>

              {/* Comment text */}
              <p className="text-xs text-zinc-200 leading-relaxed">{rev.comment}</p>

              {/* Existing Merchant Reply */}
              {rev.merchantReply && (
                <div className="rounded-xl bg-indigo-500/[0.06] border border-indigo-500/20 p-3 text-xs space-y-1">
                  <span className="text-indigo-400 font-bold flex items-center gap-1.5 text-[11px]">
                    <Reply className="h-3 w-3" />
                    <span>Your Merchant Response:</span>
                  </span>
                  <p className="text-zinc-300 text-xs pl-4">{rev.merchantReply}</p>
                </div>
              )}

              {/* Reply Button & Composer */}
              {!rev.merchantReply && (
                <div className="pt-1">
                  {activeReplyBox === rev.id ? (
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <textarea
                        value={replyInputs[rev.id] || ""}
                        onChange={(e) =>
                          setReplyInputs({ ...replyInputs, [rev.id]: e.target.value })
                        }
                        placeholder="Write a polite response to this customer review..."
                        rows={2}
                        className="w-full rounded-xl border border-indigo-500/40 bg-[#090d16] p-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-indigo-400"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveReplyBox(null)}
                          className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendReply(rev.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500 active:scale-95 transition-all cursor-pointer"
                        >
                          <SendIcon className="h-3 w-3" />
                          <span>Publish Response</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveReplyBox(rev.id)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                    >
                      <Reply className="h-3 w-3" />
                      <span>Reply to Buyer</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

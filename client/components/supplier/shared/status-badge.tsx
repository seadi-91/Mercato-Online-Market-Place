import React from "react";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({ status, size = "md", className = "" }: StatusBadgeProps) {
  const normalized = status.toLowerCase().replace(/[\s-]/g, "_");

  // Determine variant styling with translucent dark-mode & light-mode support
  let style = "bg-white/10 text-zinc-300 border-white/15";

  switch (normalized) {
    // Success / Completed / Published / Verified / Paid
    case "published":
    case "completed":
    case "delivered":
    case "verified":
    case "paid":
    case "accepted":
    case "active":
    case "released":
    case "fulfilled":
    case "vip":
      style = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-semibold";
      break;

    // In Progress / In Transit / Shipped / Responded / Under Review / Escrow
    case "processing":
    case "in_transit":
    case "shipped":
    case "packed":
    case "dispatched":
    case "out_for_delivery":
    case "ready_for_dispatch":
    case "responded":
    case "under_review":
    case "escrow_secured":
    case "escrow_held":
    case "scheduled":
    case "buyer_turn":
      style = "bg-blue-500/15 text-blue-500 dark:text-blue-400 border-blue-500/30 font-semibold";
      break;

    // Warning / Pending / Negotiating / New / Delayed
    case "pending":
    case "pending_approval":
    case "negotiating":
    case "new":
    case "delayed":
    case "partially_paid":
    case "partially_fulfilled":
    case "preparing":
    case "picked_up":
    case "arrived":
    case "supplier_turn":
    case "requested":
    case "evidence_submitted":
      style = "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold";
      break;

    // Danger / Rejected / Cancelled / Overdue / Out of Stock / Returned
    case "rejected":
    case "cancelled":
    case "returned":
    case "overdue":
    case "out_of_stock":
    case "failed":
    case "declined":
    case "disputed":
    case "flagged":
      style = "bg-rose-500/15 text-rose-500 dark:text-rose-400 border-rose-500/30 font-semibold";
      break;

    // Neutral / Draft / Archived / Withdrawn / Expired
    case "draft":
    case "archived":
    case "withdrawn":
    case "expired":
    case "not_uploaded":
      style = "bg-white/10 text-zinc-300 border-white/15";
      break;
  }

  const formatText = (text: string) => {
    return text
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const sizeClasses =
    size === "sm"
      ? "text-[11px] px-2 py-0.5 rounded"
      : "text-xs px-2.5 py-1 rounded-md";

  return (
    <span
      className={`inline-flex items-center gap-1.5 border font-medium tracking-tight ${sizeClasses} ${style} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      <span>{formatText(status)}</span>
    </span>
  );
}

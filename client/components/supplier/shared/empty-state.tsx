import React from "react";
import { LucideIcon, Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-zinc-400 mb-4 border border-white/10">
        <Icon className="h-7 w-7 text-indigo-400" />
      </div>
      <h3 className="text-base font-bold text-white">{title}</h3>
      <p className="mt-1 text-xs sm:text-sm text-zinc-400 max-w-sm">{description}</p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-600/30 hover:bg-indigo-500 transition-colors cursor-pointer"
            >
              {actionLabel}
            </button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

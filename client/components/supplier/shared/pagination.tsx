"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useThemeStore } from "@/store/theme-store";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const { theme } = useThemeStore();
  const isLight = theme === "light";
  const isSystem = theme === "system";

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const containerClass = isLight
    ? "border-t border-slate-200 bg-white text-slate-500 rounded-xl shadow-xs"
    : isSystem
    ? "border-t border-blue-500/20 bg-[#0f1b3b] text-blue-200/80 rounded-xl shadow-md shadow-blue-950/20"
    : "border-t border-white/10 bg-[#141418] text-zinc-400 rounded-xl shadow-xs";

  const strongTextClass = isLight
    ? "text-slate-900 font-semibold"
    : isSystem
    ? "text-white font-semibold"
    : "text-white font-semibold";

  const navButtonClass = isLight
    ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
    : isSystem
    ? "border-blue-500/30 bg-blue-500/15 text-blue-200 hover:bg-blue-500/25 hover:text-white"
    : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] hover:text-white";

  const pageInactiveClass = isLight
    ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
    : isSystem
    ? "border-blue-500/30 bg-blue-500/15 text-blue-200 hover:bg-blue-500/25 hover:text-white"
    : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] hover:text-white";

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 text-xs transition-colors ${containerClass}`}>
      <div>
        Showing <span className={strongTextClass}>{startItem}</span> to{" "}
        <span className={strongTextClass}>{endItem}</span> of{" "}
        <span className={strongTextClass}>{totalItems}</span> results
      </div>

      <div className="flex items-center gap-1.5 self-end sm:self-auto">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`inline-flex h-8 items-center gap-1 rounded-md border px-2.5 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors ${navButtonClass}`}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const page = idx + 1;
            const isCurrent = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`h-8 w-8 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                  isCurrent
                    ? "bg-indigo-600 text-white shadow-xs"
                    : `border ${pageInactiveClass}`
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`inline-flex h-8 items-center gap-1 rounded-md border px-2.5 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors ${navButtonClass}`}
        >
          <span>Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

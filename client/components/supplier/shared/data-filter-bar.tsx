import React from "react";
import { Search, X, SlidersHorizontal, Download } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface DataFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  statusFilter?: string;
  onStatusChange?: (value: string) => void;
  statusOptions?: FilterOption[];
  categoryFilter?: string;
  onCategoryChange?: (value: string) => void;
  categoryOptions?: FilterOption[];
  sortOption?: string;
  onSortChange?: (value: string) => void;
  sortOptions?: FilterOption[];
  onReset?: () => void;
  onExport?: () => void;
  exportLabel?: string;
  additionalActions?: React.ReactNode;
}

export function DataFilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search records...",
  statusFilter,
  onStatusChange,
  statusOptions,
  categoryFilter,
  onCategoryChange,
  categoryOptions,
  sortOption,
  onSortChange,
  sortOptions,
  onReset,
  onExport,
  exportLabel = "Export CSV",
  additionalActions,
}: DataFilterBarProps) {
  const hasActiveFilters =
    Boolean(searchQuery) ||
    (statusFilter && statusFilter !== "all") ||
    (categoryFilter && categoryFilter !== "all");

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#0d121f] p-3.5 shadow-xs mb-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] pl-9 pr-9 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-indigo-600 focus:bg-white/[0.08] focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          {statusOptions && onStatusChange && (
            <select
              value={statusFilter || "all"}
              onChange={(e) => onStatusChange(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-zinc-300 hover:border-white/20 focus:border-indigo-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {/* Category Filter */}
          {categoryOptions && onCategoryChange && (
            <select
              value={categoryFilter || "all"}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-zinc-300 hover:border-white/20 focus:border-indigo-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {/* Sort Dropdown */}
          {sortOptions && onSortChange && (
            <select
              value={sortOption || "newest"}
              onChange={(e) => onSortChange(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-zinc-300 hover:border-white/20 focus:border-indigo-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {/* Reset Filters */}
          {hasActiveFilters && onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
              <span>Reset</span>
            </button>
          )}

          {/* Export Action */}
          {onExport && (
            <button
              onClick={onExport}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-zinc-400" />
              <span>{exportLabel}</span>
            </button>
          )}

          {additionalActions}
        </div>
      </div>
    </div>
  );
}

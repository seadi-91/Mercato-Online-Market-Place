"use client";

import React from "react";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useThemeStore } from "@/store/theme-store";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  change?: string;
  trend?: "up" | "down" | "neutral";
  badge?: string;
  badgeVariant?: "success" | "warning" | "info" | "neutral";
  compact?: boolean;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  change,
  trend,
  badge,
  badgeVariant = "info",
  compact = false,
  onClick,
}: StatCardProps) {
  const { theme } = useThemeStore();
  const isLight = theme === "light";
  const isSystem = theme === "system";

  const badgeStyles = {
    success: isLight
      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
      : isSystem
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
      : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    warning: isLight
      ? "bg-amber-100 text-amber-800 border-amber-300"
      : isSystem
      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
      : "bg-amber-500/15 text-amber-400 border-amber-500/30",
    info: isLight
      ? "bg-indigo-100 text-indigo-800 border-indigo-300"
      : isSystem
      ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
      : "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    neutral: isLight
      ? "bg-slate-100 text-slate-700 border-slate-200"
      : isSystem
      ? "bg-indigo-500/15 text-slate-200 border-indigo-500/30"
      : "bg-white/10 text-zinc-300 border-white/10",
  };

  // Compact minimized-height layout
  if (compact) {
    const compactContainerClass = isLight
      ? "rounded-xl border border-slate-200 bg-white p-3 shadow-xs hover:border-slate-300 transition-all"
      : isSystem
      ? "rounded-xl border border-indigo-500/20 bg-[#0f1b3b] p-3 shadow-xs hover:border-indigo-400/40 transition-all"
      : "rounded-xl border border-white/10 bg-[#141418] p-3 shadow-xs hover:border-white/20 transition-all";

    return (
      <div
        onClick={onClick}
        className={`group relative transition-all ${compactContainerClass} ${onClick ? "cursor-pointer" : ""}`}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10.5px] font-semibold tracking-wider text-slate-500 dark:text-zinc-400 uppercase truncate">
            {title}
          </p>
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <Icon className="h-3.5 w-3.5" />
          </div>
        </div>

        <p className="mt-1 text-lg font-bold font-mono tracking-tight text-slate-900 dark:text-white leading-tight">
          {value}
        </p>

        {(subtitle || change || badge) && (
          <div className="mt-1 flex items-center justify-between gap-1 text-[10.5px]">
            {change && (
              <span
                className={`inline-flex items-center gap-0.5 font-semibold ${
                  trend === "up"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : trend === "down"
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-slate-500 dark:text-zinc-400"
                }`}
              >
                {trend === "up" && <TrendingUp className="h-3 w-3" />}
                {trend === "down" && <TrendingDown className="h-3 w-3" />}
                {trend === "neutral" && <Minus className="h-3 w-3" />}
                {change}
              </span>
            )}

            {subtitle && (
              <span className="text-slate-400 dark:text-zinc-500 truncate">
                {subtitle}
              </span>
            )}

            {badge && (
              <span
                className={`inline-flex items-center rounded px-1.5 py-0.2 text-[9px] font-medium ${badgeStyles[badgeVariant]}`}
              >
                {badge}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Standard regular layout
  const cardContainerClass = isLight
    ? "rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-md"
    : isSystem
    ? "rounded-xl border border-indigo-500/25 bg-[#0f1b3b] p-5 shadow-md shadow-blue-950/20 hover:border-indigo-400/50 hover:shadow-lg"
    : "rounded-xl border border-white/10 bg-[#141418] p-5 shadow-xs hover:border-white/20 hover:shadow-md";

  const titleClass = isLight
    ? "text-xs font-semibold tracking-wide text-slate-500 uppercase"
    : isSystem
    ? "text-xs font-semibold tracking-wide text-blue-200/80 uppercase"
    : "text-xs font-semibold tracking-wide text-zinc-400 uppercase";

  const valueClass = isLight
    ? "text-2xl font-bold tracking-tight text-slate-900"
    : isSystem
    ? "text-2xl font-bold tracking-tight text-white drop-shadow-xs"
    : "text-2xl font-bold tracking-tight text-white";

  const iconClass = isLight
    ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 transition-colors group-hover:bg-indigo-600 group-hover:text-white"
    : isSystem
    ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/35 transition-colors group-hover:bg-indigo-600 group-hover:text-white"
    : "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 transition-colors group-hover:bg-indigo-600 group-hover:text-white";

  const subtitleClass = isLight
    ? "text-slate-500"
    : isSystem
    ? "text-blue-300/70"
    : "text-zinc-400";

  const dividerClass = isLight
    ? "border-t border-slate-100"
    : isSystem
    ? "border-t border-indigo-500/15"
    : "border-t border-white/5";

  return (
    <div
      onClick={onClick}
      className={`group relative transition-all ${cardContainerClass} ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className={titleClass}>{title}</p>
          <p className={valueClass}>{value}</p>
        </div>
        <div className={iconClass}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {(subtitle || change || badge) && (
        <div className={`mt-4 flex flex-wrap items-center gap-2 pt-3 ${dividerClass} text-xs`}>
          {change && (
            <span
              className={`inline-flex items-center gap-1 font-semibold ${
                trend === "up"
                  ? "text-emerald-500"
                  : trend === "down"
                  ? "text-rose-500"
                  : isLight
                  ? "text-slate-500"
                  : "text-zinc-400"
              }`}
            >
              {trend === "up" && <TrendingUp className="h-3.5 w-3.5" />}
              {trend === "down" && <TrendingDown className="h-3.5 w-3.5" />}
              {trend === "neutral" && <Minus className="h-3.5 w-3.5" />}
              {change}
            </span>
          )}

          {subtitle && <span className={subtitleClass}>{subtitle}</span>}

          {badge && (
            <span
              className={`ml-auto inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${badgeStyles[badgeVariant]}`}
            >
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}


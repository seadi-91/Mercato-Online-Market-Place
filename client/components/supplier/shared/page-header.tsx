import React from "react";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs = [{ label: "Supplier Console" }],
  badge,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-6 space-y-2">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-1.5 text-xs text-zinc-400 font-medium">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="h-3 w-3 text-zinc-500" />}
              {crumb.onClick ? (
                <button
                  onClick={crumb.onClick}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className={idx === breadcrumbs.length - 1 ? "text-zinc-200 font-semibold" : ""}>
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Title & Action Container */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {title}
            </h1>
            {badge && <div>{badge}</div>}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs sm:text-sm text-zinc-400 max-w-2xl">{subtitle}</p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import {
  MapPin,
  Building2,
  Store,
  Sparkles,
  Tv,
  Layers,
  Watch,
} from "lucide-react";

export interface MarketZoneOption {
  id: string;
  name: string;
  specialty: string;
  icon: React.ReactNode;
}

export const MARKET_ZONES: MarketZoneOption[] = [
  {
    id: "all",
    name: "All Commercial Zones",
    specialty: "All verified locations",
    icon: <Layers className="h-3.5 w-3.5" />,
  },
  {
    id: "Bole",
    name: "Bole Medhanialem",
    specialty: "Tech & Flagship",
    icon: <Tv className="h-3.5 w-3.5" />,
  },
  {
    id: "Mercato",
    name: "Mercato Central",
    specialty: "Wholesale & Importers",
    icon: <Store className="h-3.5 w-3.5" />,
  },
  {
    id: "Shiro Meda",
    name: "Shiro Meda",
    specialty: "Traditional Crafts",
    icon: <Sparkles className="h-3.5 w-3.5" />,
  },
  {
    id: "Piazza",
    name: "Piazza & Churchill",
    specialty: "Jewelry & Classic",
    icon: <Watch className="h-3.5 w-3.5" />,
  },
  {
    id: "CMC",
    name: "CMC & Megenagna",
    specialty: "Home & Appliances",
    icon: <Building2 className="h-3.5 w-3.5" />,
  },
];

interface MarketZonesBarProps {
  selectedZone: string;
  onSelectZone: (zoneId: string) => void;
  zoneCounts?: Record<string, number>;
}

export function MarketZonesBar({
  selectedZone,
  onSelectZone,
  zoneCounts = {},
}: MarketZonesBarProps) {
  return (
    <section className="mx-auto max-w-[1600px] px-3 sm:px-6 lg:px-8 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-black/5 dark:bg-white/10 text-app">
            <MapPin className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold tracking-tight text-app">
            Explore by Commercial Zone
          </h3>
        </div>

        <span className="text-[10.5px] font-mono text-app-muted hidden sm:inline">
          Addis Ababa Merchant Hubs
        </span>
      </div>

      {/* Zone Pills using CSS Theme Tokens */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-3 px-3 sm:mx-0 sm:px-0">
        {MARKET_ZONES.map((zone) => {
          const isSelected =
            selectedZone === zone.id || (zone.id === "all" && !selectedZone);
          const count =
            zone.id === "all"
              ? Object.values(zoneCounts).reduce((a, b) => a + b, 0)
              : zoneCounts[zone.id] ?? null;

          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => onSelectZone(zone.id === "all" ? "" : zone.id)}
              className={`group flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-left shrink-0 transition-all duration-150 cursor-pointer ${
                isSelected
                  ? "bg-app-card border-app text-app shadow-xs font-bold ring-1 ring-white/20 dark:ring-white/30"
                  : "border-app bg-app-card text-app-muted hover:text-app hover:border-app-hover"
              }`}
            >
              <div className="shrink-0 opacity-80">
                {zone.icon}
              </div>

              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold whitespace-nowrap">
                  {zone.name}
                </span>
                {count !== null && count > 0 && (
                  <span className="text-[9px] font-mono px-1 rounded bg-black/5 dark:bg-white/10 text-app opacity-80">
                    {count}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

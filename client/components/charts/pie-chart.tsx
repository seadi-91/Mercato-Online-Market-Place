"use client";

import React, { useState } from "react";
import { PieChart as PieIcon } from "lucide-react";

export interface ProviderSlice {
  provider?: string;
  name: string;
  share: number; // percentage 0 - 100
  amount?: number; // in ETB
  totalAmount?: number;
  count?: number;
  color: string;
  glowColor: string;
}

const DEFAULT_SLICES: ProviderSlice[] = [
  {
    provider: "TELEBIRR",
    name: "Telebirr SuperApp",
    share: 44.8,
    amount: 11132988,
    count: 24,
    color: "#06b6d4",
    glowColor: "rgba(6, 182, 212, 0.4)",
  },
  {
    provider: "CBE_BIRR",
    name: "CBE Birr / Bank Transfer",
    share: 32.6,
    amount: 8101236,
    count: 18,
    color: "#a855f7",
    glowColor: "rgba(168, 85, 247, 0.4)",
  },
  {
    provider: "CHAPA",
    name: "Chapa Gateway (Cards/Awash)",
    share: 17.2,
    amount: 4274272,
    count: 9,
    color: "#10b981",
    glowColor: "rgba(16, 185, 129, 0.4)",
  },
  {
    provider: "CASH_ON_DELIVERY",
    name: "Verified Cash on Delivery",
    share: 5.4,
    amount: 1341924,
    count: 3,
    color: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.4)",
  },
];

interface PaymentPieChartProps {
  providers?: ProviderSlice[];
  totalVolume?: number;
}

export function PaymentPieChart({
  providers,
  totalVolume: propTotalVolume,
}: PaymentPieChartProps) {
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

  // Safe currency formatting helper
  const formatAmount = (num?: number | null): string => {
    const val = Number(num ?? 0);
    if (isNaN(val)) return "ETB 0";
    if (val >= 1_000_000) return `ETB ${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `ETB ${(val / 1_000).toFixed(1)}K`;
    return `ETB ${val.toLocaleString()}`;
  };

  const rawSlices: ProviderSlice[] =
    providers && providers.length > 0
      ? providers.map((s) => ({
          ...s,
          amount: Number(s.amount ?? s.totalAmount ?? 0),
          share: Number(s.share ?? 0),
        }))
      : DEFAULT_SLICES;

  const totalCalculated = rawSlices.reduce(
    (acc, s) => acc + (Number(s.amount) || 0),
    0
  );
  const totalVolume = Number(propTotalVolume ?? totalCalculated ?? 0);

  const radius = 68;
  const innerRadius = 46;
  const cx = 85;
  const cy = 85;

  let cumulativeAngle = -90; // start at top

  const nonZeroSlices = rawSlices.filter((s) => (s.share || 0) > 0);

  const paths = rawSlices.map((slice, index) => {
    const isHovered = hoveredSlice === index;
    const currentRadius = isHovered ? radius + 4 : radius;
    const shareVal = Number(slice.share || 0);

    if (shareVal >= 99.9 || (nonZeroSlices.length === 1 && shareVal > 0)) {
      const d = `
        M ${cx} ${cy - currentRadius}
        A ${currentRadius} ${currentRadius} 0 1 1 ${cx} ${cy + currentRadius}
        A ${currentRadius} ${currentRadius} 0 1 1 ${cx} ${cy - currentRadius}
        M ${cx} ${cy - innerRadius}
        A ${innerRadius} ${innerRadius} 0 1 0 ${cx} ${cy + innerRadius}
        A ${innerRadius} ${innerRadius} 0 1 0 ${cx} ${cy - innerRadius}
        Z
      `;
      return { ...slice, d, isHovered, index, angle: 360 };
    }

    if (shareVal <= 0) {
      return { ...slice, d: "", isHovered, index, angle: 0 };
    }

    const angle = (shareVal / 100) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + currentRadius * Math.cos(startRad);
    const y1 = cy + currentRadius * Math.sin(startRad);
    const x2 = cx + currentRadius * Math.cos(endRad);
    const y2 = cy + currentRadius * Math.sin(endRad);

    const x3 = cx + innerRadius * Math.cos(endRad);
    const y3 = cy + innerRadius * Math.sin(endRad);
    const x4 = cx + innerRadius * Math.cos(startRad);
    const y4 = cy + innerRadius * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;

    const d = `
      M ${x1} ${y1}
      A ${currentRadius} ${currentRadius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;

    return { ...slice, d, isHovered, index, angle };
  });

  const activeSlice = hoveredSlice !== null ? rawSlices[hoveredSlice] : null;

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d121f]/90 p-3.5 shadow-xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <PieIcon className="h-3.5 w-3.5 text-cyan-400" />
          <h3 className="text-xs font-semibold text-white">
            Payment Provider Share
          </h3>
        </div>
        <span className="text-[10px] font-mono text-zinc-400">
          {formatAmount(totalVolume)} Total
        </span>
      </div>

      <div className="mt-3 flex flex-col sm:flex-row items-center gap-4">
        {/* SVG Donut Chart */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg
            width="170"
            height="170"
            viewBox="0 0 170 170"
            className="overflow-visible"
          >
            {paths
              .filter((p) => Boolean(p.d))
              .map((p) => (
                <path
                  key={p.index}
                  d={p.d}
                  fill={p.color}
                  stroke="#0d121f"
                  strokeWidth="2"
                  className="transition-all duration-200 cursor-pointer"
                  style={{
                    filter: p.isHovered
                      ? `drop-shadow(0 0 6px ${p.glowColor})`
                      : undefined,
                    opacity: hoveredSlice === null || p.isHovered ? 1 : 0.65,
                  }}
                  onMouseEnter={() => setHoveredSlice(p.index)}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              ))}
          </svg>

          {/* Center Info Text */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            {activeSlice ? (
              <>
                <span className="text-sm font-bold font-mono text-white">
                  {activeSlice.share ?? 0}%
                </span>
                <span className="text-[8.5px] font-medium text-zinc-400 max-w-[70px] truncate">
                  {activeSlice.name.split(" ")[0]}
                </span>
                <span className="text-[8px] font-mono text-cyan-400">
                  {activeSlice.count !== undefined
                    ? `${activeSlice.count} txns`
                    : formatAmount(activeSlice.amount)}
                </span>
              </>
            ) : (
              <>
                <span className="text-[9.5px] font-mono text-zinc-400">
                  VOLUME
                </span>
                <span className="text-xs font-bold font-mono text-white">
                  {formatAmount(totalVolume)}
                </span>
                <span className="text-[8px] font-mono text-emerald-400">
                  Verified
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend List */}
        <div className="flex-1 w-full space-y-2">
          {rawSlices.map((slice, i) => {
            const isHovered = hoveredSlice === i;
            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredSlice(i)}
                onMouseLeave={() => setHoveredSlice(null)}
                className={`flex items-center justify-between rounded-lg p-1.5 transition-colors cursor-pointer ${
                  isHovered ? "bg-white/[0.06]" : "hover:bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <div className="truncate">
                    <span className="text-[11px] font-medium text-zinc-200 block truncate">
                      {slice.name}
                    </span>
                    {slice.count !== undefined && (
                      <span className="text-[9px] text-zinc-400">
                        {slice.count} recorded transaction
                        {slice.count !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-xs font-semibold text-white">
                    {slice.share ?? 0}%
                  </span>
                  <p className="text-[9.5px] font-mono text-zinc-400">
                    {formatAmount(slice.amount)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

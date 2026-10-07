"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sun,
  Moon,
  Monitor,
  Check,
  Sparkles,
  SunMedium,
} from "lucide-react";
import { useThemeStore, ThemeMode } from "@/store/theme-store";
import { toast } from "sonner";

interface ThemeToggleProps {
  className?: string;
  variant?: "topbar" | "compact";
}

export function ThemeToggle({ className = "", variant = "topbar" }: ThemeToggleProps) {
  const { theme, setTheme, initTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  // Handle outside click & escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (mode: ThemeMode) => {
    setTheme(mode);
    setIsOpen(false);

    const labels: Record<ThemeMode, string> = {
      light: "Light mode enabled (Pure White on each card)",
      dark: "Dark mode enabled (Pitch Black canvas & charcoal cards)",
      system: "System mode enabled (Deep Dark Blue & navy sapphire cards)",
    };
    toast.success(labels[mode]);
  };

  const options: {
    id: ThemeMode;
    label: string;
    description: string;
    icon: React.ElementType;
    colorClass: string;
    swatchColor: string;
  }[] = [
      {
        id: "light",
        label: "Light",
        description: "Pure White on each card",
        icon: Sun,
        colorClass: "text-amber-400 group-hover:text-amber-300",
        swatchColor: "bg-white border-zinc-300 shadow-xs",
      },
      {
        id: "dark",
        label: "Dark",
        description: "Pitch Black canvas & charcoal cards",
        icon: Moon,
        colorClass: "text-zinc-300 group-hover:text-white",
        swatchColor: "bg-black border-zinc-700 shadow-xs",
      },
      {
        id: "system",
        label: "System",
        description: "Deep Dark Blue canvas & navy cards",
        icon: Monitor,
        colorClass: "text-blue-400 group-hover:text-blue-300",
        swatchColor: "bg-[#060e24] border-blue-400 shadow-xs",
      },
    ];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bright Light / Appearance Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={`Appearance: ${theme.toUpperCase()} (Click to change: White, Black, or Dark Blue)`}
        aria-label="Toggle appearance theme"
        className={`group relative flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer ${isOpen ? "ring-2 ring-amber-400/50 border-amber-400/60 bg-white/[0.08]" : ""
          }`}
      >
        {/* Glow aura */}
        <span className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-amber-500/20 via-blue-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 blur-xs transition-opacity pointer-events-none" />

        {/* Dynamic bright icon reflecting active theme mode */}
        {theme === "light" && (
          <SunMedium className="h-4 w-4 text-amber-400 drop-shadow-[0_0_7px_rgba(251,191,36,0.7)] animate-pulse" />
        )}
        {theme === "dark" && (
          <Moon className="h-3.5 w-3.5 text-zinc-200 drop-shadow-[0_0_5px_rgba(255,255,255,0.6)] group-hover:scale-110 transition-transform" />
        )}
        {theme === "system" && (
          <Monitor className="h-3.5 w-3.5 text-blue-400 drop-shadow-[0_0_6px_rgba(96,165,250,0.6)] group-hover:scale-110 transition-transform" />
        )}
      </button>

      {/* Floating Appearance Dropdown Menu */}
      {isOpen && (
        <div className="app-dropdown-panel absolute right-0 top-full mt-1.5 w-60 rounded-xl border border-white/10 bg-[#0d121f]/98 p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-white/[0.08] mb-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[11px] font-semibold text-white tracking-wide uppercase">
                Appearance
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 capitalize">
              {theme === "light" ? "White" : theme === "dark" ? "Black" : "Dark Blue"}
            </span>
          </div>

          <div className="space-y-1">
            {options.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelect(opt.id)}
                  className={`group flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-all cursor-pointer ${isSelected
                      ? "bg-indigo-600/20 text-white font-medium border border-indigo-500/40"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white border border-transparent"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Icon + Swatch */}
                    <div className="relative">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-md border ${isSelected
                            ? "border-indigo-500/50 bg-indigo-500/20"
                            : "border-white/10 bg-white/[0.03]"
                          }`}
                      >
                        <Icon className={`h-3.5 w-3.5 ${opt.colorClass}`} />
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border ${opt.swatchColor}`}
                        title={opt.label}
                      />
                    </div>

                    <div>
                      <div className="text-xs font-semibold leading-none text-white flex items-center gap-1.5">
                        <span>{opt.label}</span>
                        {opt.id === "light" && (
                          <span className="text-[9.5px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                            White
                          </span>
                        )}
                        {opt.id === "dark" && (
                          <span className="text-[9.5px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono">
                            Black
                          </span>
                        )}
                        {opt.id === "system" && (
                          <span className="text-[9.5px] px-1 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono">
                            Dark Blue
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {opt.description}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-cyan-400 stroke-[2.5]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

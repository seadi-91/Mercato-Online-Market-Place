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
      light: "Light Mode: Pure White Canvas with Indigo Accent",
      dark: "Dark Mode: Obsidian Pitch Black with Brand Glow",
      system: "System Mode: Deep Twilight Sapphire Navy Hub",
    };
    toast.success(labels[mode]);
  };

  const isLight = theme === "light";
  const isDark = theme === "dark";
  const isSystem = theme === "system";

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
      description: "Pure White canvas & crisp cards",
      icon: Sun,
      colorClass: "text-amber-500",
      swatchColor: "bg-white border-slate-300 shadow-xs",
    },
    {
      id: "dark",
      label: "Dark",
      description: "Obsidian Pitch Black & charcoal cards",
      icon: Moon,
      colorClass: "text-zinc-300",
      swatchColor: "bg-[#09090b] border-zinc-700 shadow-xs",
    },
    {
      id: "system",
      label: "System",
      description: "Deep Twilight Sapphire & navy cards",
      icon: Monitor,
      colorClass: "text-blue-400",
      swatchColor: "bg-[#070d1e] border-blue-400 shadow-xs",
    },
  ];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dynamic Appearance Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={`Theme Appearance: ${theme.toUpperCase()} (Light: White | Dark: Black | System: Navy)`}
        aria-label="Toggle appearance theme"
        className={`group relative flex h-8 w-8 items-center justify-center rounded-lg border transition-all cursor-pointer ${
          isLight
            ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-xs"
            : isDark
            ? "border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/10"
            : "border-blue-500/20 bg-blue-950/40 text-blue-200 hover:text-white hover:bg-blue-900/40"
        } ${
          isOpen
            ? "ring-2 ring-indigo-500/50 border-indigo-500/60"
            : ""
        }`}
      >
        {/* Glow aura */}
        <span className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-amber-500/20 via-blue-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 blur-xs transition-opacity pointer-events-none" />

        {/* Dynamic bright icon reflecting active theme mode */}
        {theme === "light" && (
          <SunMedium className="h-4 w-4 text-amber-500 drop-shadow-[0_0_7px_rgba(245,158,11,0.5)]" />
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
        <div
          className={`app-dropdown-panel absolute right-0 top-full mt-1.5 w-64 rounded-2xl p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-100 border ${
            isLight
              ? "bg-white border-slate-200 text-slate-800 shadow-slate-900/15"
              : isDark
              ? "bg-[#141418] border-white/10 text-white shadow-black/80"
              : "bg-[#0c1630] border-blue-500/30 text-white shadow-blue-950/80"
          }`}
        >
          <div
            className={`flex items-center justify-between px-2.5 py-1.5 border-b mb-1.5 ${
              isLight ? "border-slate-100" : isDark ? "border-white/5" : "border-blue-500/20"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span
                className={`text-[11px] font-bold tracking-wide uppercase ${
                  isLight ? "text-slate-900" : "text-white"
                }`}
              >
                Appearance Mode
              </span>
            </div>
            <span
              className={`text-[10px] font-mono capitalize px-1.5 py-0.5 rounded ${
                isLight
                  ? "bg-slate-100 text-slate-600 font-semibold"
                  : isDark
                  ? "bg-white/5 text-zinc-400"
                  : "bg-blue-900/40 text-blue-300"
              }`}
            >
              {theme === "light" ? "Pure White" : theme === "dark" ? "Obsidian" : "Sapphire"}
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
                  className={`group flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-all cursor-pointer border ${
                    isSelected
                      ? isLight
                        ? "bg-indigo-50 text-indigo-700 font-bold border-indigo-200 shadow-xs"
                        : isDark
                        ? "bg-indigo-950/60 text-white font-bold border-indigo-500/40"
                        : "bg-blue-950/80 text-cyan-300 font-bold border-blue-500/50"
                      : isLight
                      ? "text-slate-700 hover:bg-slate-100 hover:text-slate-900 border-transparent"
                      : isDark
                      ? "text-zinc-300 hover:bg-white/5 hover:text-white border-transparent"
                      : "text-blue-100/90 hover:bg-blue-900/30 hover:text-white border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Icon + Swatch */}
                    <div className="relative">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-lg border ${
                          isSelected
                            ? "border-indigo-500/50 bg-indigo-500/20"
                            : isLight
                            ? "border-slate-200 bg-slate-50"
                            : isDark
                            ? "border-white/10 bg-white/[0.04]"
                            : "border-blue-500/30 bg-blue-950/50"
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
                      <div
                        className={`text-xs font-semibold leading-none flex items-center gap-1.5 ${
                          isLight ? "text-slate-900" : "text-white"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {opt.id === "light" && (
                          <span
                            className={`text-[9.5px] px-1 py-0.2 rounded font-mono ${
                              isLight
                                ? "bg-amber-100 text-amber-800"
                                : "bg-amber-500/20 text-amber-300"
                            }`}
                          >
                            White
                          </span>
                        )}
                        {opt.id === "dark" && (
                          <span
                            className={`text-[9.5px] px-1 py-0.2 rounded font-mono ${
                              isLight
                                ? "bg-slate-200 text-slate-800"
                                : "bg-zinc-800 text-zinc-300"
                            }`}
                          >
                            Black
                          </span>
                        )}
                        {opt.id === "system" && (
                          <span
                            className={`text-[9.5px] px-1 py-0.2 rounded font-mono ${
                              isLight
                                ? "bg-blue-100 text-blue-800"
                                : "bg-blue-500/20 text-blue-300"
                            }`}
                          >
                            Navy
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-[10px] mt-0.5 ${
                          isLight ? "text-slate-500" : isDark ? "text-zinc-400" : "text-blue-300/80"
                        }`}
                      >
                        {opt.description}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <Check
                      className={`h-3.5 w-3.5 stroke-[2.5] ${
                        isLight ? "text-indigo-600" : "text-cyan-400"
                      }`}
                    />
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

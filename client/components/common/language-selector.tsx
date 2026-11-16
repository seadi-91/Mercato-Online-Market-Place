"use client";

import React, { useState, useEffect, useRef } from "react";
import { Globe, Check, ChevronDown, Languages } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { SUPPORTED_LANGUAGES, type LanguageCode, translations } from "@/lib/i18n/translations";
import { useThemeStore } from "@/store/theme-store";
import { toast } from "sonner";

interface LanguageSelectorProps {
  className?: string;
  variant?: "topbar" | "compact" | "drawer";
  showLabel?: boolean;
}

export function LanguageSelector({
  className = "",
  variant = "topbar",
  showLabel = false,
}: LanguageSelectorProps) {
  const { language, setLanguage, initLanguage, getLanguageInfo } = useLanguageStore();
  const { theme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initLanguage();
  }, [initLanguage]);

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

  const activeLang = getLanguageInfo();
  const isLight = theme === "light";
  const isDark = theme === "dark";

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
    const toastMsg = translations[code]?.toast?.languageChanged || `Language changed to ${code}`;
    toast.success(toastMsg);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={`Language: ${activeLang.nativeName} (${activeLang.name})`}
        aria-label="Select Language"
        className={`group relative flex h-8 items-center justify-center gap-1.5 px-2 rounded-lg border transition-all cursor-pointer ${
          isLight
            ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-xs"
            : isDark
            ? "border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/10"
            : "border-blue-500/20 bg-blue-950/40 text-blue-200 hover:text-white hover:bg-blue-900/40"
        } ${
          isOpen ? "ring-2 ring-indigo-500/50 border-indigo-500/60" : ""
        }`}
      >
        {/* Glow aura */}
        <span className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-emerald-500/20 via-indigo-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 blur-xs transition-opacity pointer-events-none" />

        {/* Globe icon */}
        <Globe className="h-3.5 w-3.5 text-indigo-400 group-hover:scale-110 transition-transform shrink-0" />

        {/* Short Label Badge (e.g. EN, አማ, OR, ትግ) */}
        <span className="text-[11px] font-bold tracking-tight">
          {activeLang.shortLabel}
        </span>

        {showLabel && (
          <span className="hidden sm:inline text-xs font-medium">
            {activeLang.nativeName}
          </span>
        )}

        <ChevronDown
          className={`h-3 w-3 opacity-60 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          className={`app-dropdown-panel absolute right-0 top-full mt-1.5 w-56 rounded-2xl p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-100 border ${
            isLight
              ? "bg-white border-slate-200 text-slate-800 shadow-slate-900/15"
              : isDark
              ? "bg-[#141418] border-white/10 text-white shadow-black/80"
              : "bg-[#0c1630] border-blue-500/30 text-white shadow-blue-950/80"
          }`}
        >
          {/* Menu Header */}
          <div
            className={`flex items-center justify-between px-2.5 py-1.5 border-b mb-1.5 ${
              isLight
                ? "border-slate-100"
                : isDark
                ? "border-white/5"
                : "border-blue-500/20"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Languages className="h-3.5 w-3.5 text-indigo-500" />
              <span
                className={`text-[11px] font-bold tracking-wide uppercase ${
                  isLight ? "text-slate-900" : "text-white"
                }`}
              >
                Language / ቋንቋ
              </span>
            </div>
            <span
              className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                isLight
                  ? "bg-slate-100 text-slate-600 font-semibold"
                  : isDark
                  ? "bg-white/5 text-zinc-400"
                  : "bg-blue-900/40 text-blue-300"
              }`}
            >
              {activeLang.code}
            </span>
          </div>

          {/* Languages List */}
          <div className="space-y-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = language === lang.code;

              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? isLight
                        ? "bg-indigo-50 border border-indigo-200 text-indigo-950 shadow-xs"
                        : "bg-indigo-500/15 border border-indigo-500/30 text-white shadow-xs"
                      : isLight
                      ? "hover:bg-slate-50 text-slate-700 hover:text-slate-950 border border-transparent"
                      : "hover:bg-white/5 text-zinc-300 hover:text-white border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0 leading-none" role="img" aria-label={lang.name}>
                      {lang.flag}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span
                        className={`text-xs font-bold leading-tight ${
                          isSelected
                            ? isLight
                              ? "text-indigo-900"
                              : "text-indigo-300"
                            : isLight
                            ? "text-slate-900"
                            : "text-zinc-100"
                        }`}
                      >
                        {lang.nativeName}
                      </span>
                      <span
                        className={`text-[10px] leading-tight ${
                          isSelected
                            ? isLight
                              ? "text-indigo-700/80"
                              : "text-indigo-300/80"
                            : isLight
                            ? "text-slate-500"
                            : "text-zinc-400"
                        }`}
                      >
                        {lang.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                        isSelected
                          ? isLight
                            ? "bg-indigo-200/60 text-indigo-900"
                            : "bg-indigo-500/30 text-indigo-200"
                          : isLight
                          ? "bg-slate-100 text-slate-500"
                          : "bg-white/5 text-zinc-500"
                      }`}
                    >
                      {lang.shortLabel}
                    </span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-indigo-500 stroke-[3]" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

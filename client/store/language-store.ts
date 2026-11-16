"use client";

import { create } from "zustand";
import {
  type LanguageCode,
  type LanguageInfo,
  SUPPORTED_LANGUAGES,
  getTranslation,
  translations,
} from "@/lib/i18n/translations";
import {
  translateCategory,
  translateZone,
} from "@/lib/i18n/category-translations";

interface LanguageState {
  language: LanguageCode;
  hasHydrated: boolean;
  setLanguage: (lang: LanguageCode) => void;
  initLanguage: () => void;
  t: (path: string, fallback?: string) => string;
  tCategory: (rawCategory: string | undefined | null) => string;
  tZone: (rawZone: string | undefined | null) => string;
  getLanguageInfo: () => LanguageInfo;
}

const STORAGE_KEY = "mercatox-language";

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: "en",
  hasHydrated: false,

  setLanguage: (newLang: LanguageCode) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, newLang);
        // Also persist cookie for SSR / next-intl
        document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
        document.documentElement.lang = newLang;
      } catch (err) {
        console.error("Failed to save language to localStorage", err);
      }
    }
    set({ language: newLang });
  },

  initLanguage: () => {
    if (typeof window === "undefined") return;

    let savedLang: LanguageCode = "en";
    try {
      const item = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
      if (item && (item === "en" || item === "am" || item === "om" || item === "ti")) {
        savedLang = item;
      } else {
        // Check cookie
        const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
        if (match && (match[1] === "en" || match[1] === "am" || match[1] === "om" || match[1] === "ti")) {
          savedLang = match[1] as LanguageCode;
        }
      }
    } catch (err) {
      console.error("Failed to read language from storage", err);
    }

    try {
      document.documentElement.lang = savedLang;
    } catch {
      // ignore
    }

    set({ language: savedLang, hasHydrated: true });
  },

  t: (path: string, fallback?: string) => {
    const currentLang = get().language;
    return getTranslation(currentLang, path, fallback);
  },

  tCategory: (rawCategory: string | undefined | null) => {
    const currentLang = get().language;
    return translateCategory(rawCategory, currentLang);
  },

  tZone: (rawZone: string | undefined | null) => {
    const currentLang = get().language;
    return translateZone(rawZone, currentLang);
  },

  getLanguageInfo: () => {
    const currentLang = get().language;
    return (
      SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) ||
      SUPPORTED_LANGUAGES[0]
    );
  },
}));

/**
 * Convenient React hook for component translations
 */
export function useTranslation() {
  const { language, setLanguage, t, tCategory, tZone, getLanguageInfo, hasHydrated } = useLanguageStore();
  return {
    t,
    tCategory,
    tZone,
    language,
    setLanguage,
    currentLanguage: getLanguageInfo(),
    supportedLanguages: SUPPORTED_LANGUAGES,
    hasHydrated,
  };
}

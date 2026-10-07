"use client";

import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemeMode) => void;
  initTheme: () => void;
}

const STORAGE_KEY = "mercatox-theme";

export function applyThemeToDOM(theme: ThemeMode): "light" | "dark" {
  if (typeof window === "undefined") return "dark";

  const root = document.documentElement;

  // Clear previous theme indicators
  root.classList.remove(
    "light",
    "dark",
    "theme-light",
    "theme-dark",
    "theme-system"
  );

  if (theme === "light") {
    // 1. LIGHT MODE -> WHITE BACKGROUND
    root.classList.add("light", "theme-light");
    root.setAttribute("data-theme", "light");
    root.style.colorScheme = "light";
    return "light";
  } else if (theme === "dark") {
    // 2. DARK MODE -> PURE BLACK BACKGROUND
    root.classList.add("dark", "theme-dark");
    root.setAttribute("data-theme", "dark");
    root.style.colorScheme = "dark";
    return "dark";
  } else {
    // 3. SYSTEM MODE -> DARK BLUE BACKGROUND
    root.classList.add("dark", "theme-system");
    root.setAttribute("data-theme", "system");
    root.style.colorScheme = "dark";
    return "dark";
  }
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "system",
  resolvedTheme: "dark",

  setTheme: (newTheme: ThemeMode) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, newTheme);
      } catch (err) {
        console.error("Failed to save theme to localStorage", err);
      }
    }
    const resolved = applyThemeToDOM(newTheme);
    set({ theme: newTheme, resolvedTheme: resolved });
  },

  initTheme: () => {
    if (typeof window === "undefined") return;

    let savedTheme: ThemeMode = "system";
    try {
      const item = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (item === "light" || item === "dark" || item === "system") {
        savedTheme = item;
      }
    } catch (err) {
      console.error("Failed to read theme from localStorage", err);
    }

    const resolved = applyThemeToDOM(savedTheme);
    set({ theme: savedTheme, resolvedTheme: resolved });
  },
}));

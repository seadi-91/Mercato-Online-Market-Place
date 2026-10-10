"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingCart,
  Heart,
  Search,
  User,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Settings,
  Sparkles,
  MapPin,
  LogIn,
  UserPlus,
  ChevronRight,
  Star,
  Package,
  Sun,
  Moon,
  Monitor,
  Baby,
  Shirt,
  Laptop,
  Wheat,
  Home,
  Layers,
} from "lucide-react";
import { useAuthStore, useCartStore, usePlatformStore } from "@/store";
import { useThemeStore, ThemeMode } from "@/store/theme-store";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { toast } from "sonner";

interface CustomerHeaderProps {
  transparentOverlay?: boolean;
}

export function CustomerHeader({ transparentOverlay = false }: CustomerHeaderProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { settings: platformSettings } = usePlatformStore();
  const { theme, setTheme } = useThemeStore();
  const cartItemsCount = useCartStore((state) => state.getItemCount());
  const favoritesCount = useCartStore((state) => state.favorites.length);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const authDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen to scroll position for transparent-to-page-background header transition
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      setIsScrolled(scrollPos > 15);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    document.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleScroll, { capture: true });
      document.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Auto-close mobile menu on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen && typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    } else if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = "";
      }
    };
  }, [mobileMenuOpen]);

  // Handle outside clicks and ESC key for dropdowns & mobile menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (authDropdownRef.current && !authDropdownRef.current.contains(target)) {
        setAuthDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(target)) {
        setProfileDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAuthDropdownOpen(false);
        setProfileDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    }

    if (authDropdownOpen || profileDropdownOpen || mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [authDropdownOpen, profileDropdownOpen, mobileMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const handleSignOut = () => {
    logout();
    setProfileDropdownOpen(false);
    toast.success("Signed out successfully");
    router.push("/login");
  };

  const displayName = user?.name || "Customer";

  const isHomePage = transparentOverlay || pathname === "/" || pathname === "";
  const useLightProfileDropdown = theme === "light" && !(isHomePage && !isScrolled);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Categories", href: "/categories" },
  ];

  // Header class configuration: completely transparent over hero at top, smoothly transitions to page background on scroll
  const headerClass = isHomePage
    ? isScrolled
      ? `fixed top-0 left-0 right-0 z-50 w-full header-scrolled border-b transition-all duration-300 ease-in-out shadow-xs ${theme === "light"
        ? "border-slate-200/90 bg-white/95 backdrop-blur-md text-slate-900"
        : theme === "dark"
          ? "border-white/10 bg-[#09090b]/95 backdrop-blur-md text-white"
          : "border-blue-500/20 bg-[#070d1e]/95 backdrop-blur-md text-white"
      }`
      : "fixed top-0 left-0 right-0 z-50 w-full header-transparent transition-all duration-300 ease-in-out bg-transparent border-b border-transparent text-white"
    : !isScrolled
      ? `header-page-top sticky top-0 z-50 w-full border-b border-transparent bg-transparent transition-all duration-300 ease-in-out ${
          theme === "light" ? "text-slate-900" : "text-white"
        }`
      : `header-scrolled sticky top-0 z-50 w-full border-b transition-all duration-300 ease-in-out shadow-xs ${theme === "light"
          ? "border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs text-slate-900"
          : theme === "dark"
            ? "border-white/10 bg-[#09090b]/95 backdrop-blur-md text-white shadow-xs"
            : "border-blue-500/20 bg-[#070d1e]/95 backdrop-blur-md text-white shadow-xs"
        }`;

  return (
    <header className={headerClass}>
      {/* Main Navbar */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2 sm:gap-4">
          {/* Left Side: Mobile 3-line Hamburger Menu Toggle + Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 1. Mobile Menu Toggle Button (3-Line Hamburger - Visible ONLY on Mobile/Tablet) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`flex lg:hidden h-9 w-9 items-center justify-center rounded-xl border transition-all cursor-pointer shadow-sm active:scale-95 shrink-0 ${mobileMenuOpen
                ? "border-cyan-500/50 bg-cyan-500/20 text-cyan-400"
                : isHomePage && !isScrolled
                  ? "border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
                  : theme === "light"
                    ? "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200"
                    : "border-white/15 bg-white/[0.06] text-white hover:bg-white/15"
                }`}
              aria-label="Toggle navigation menu"
              title="Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-cyan-400" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* 2. Brand Logo & Title */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-[#090d16] border border-white/10 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform overflow-hidden shrink-0">
                {platformSettings.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={platformSettings.logoUrl}
                    alt={platformSettings.platformName}
                    className="h-full w-full object-contain p-0.5"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white text-sm">
                    {platformSettings.platformName?.charAt(0) || "M"}
                  </div>
                )}
              </div>
              {/* Project title */}
              <div className="hidden sm:flex flex-col">
                <span
                  className={`text-lg font-bold tracking-tight leading-none transition-colors ${isHomePage && !isScrolled
                    ? "text-white drop-shadow-sm"
                    : theme === "light"
                      ? "text-slate-900"
                      : "text-white"
                    }`}
                >
                  {platformSettings.platformName}
                </span>
                <span
                  className={`text-[9px] uppercase tracking-wider font-semibold mt-0.5 transition-colors ${isHomePage && !isScrolled
                    ? "text-zinc-200 drop-shadow-sm"
                    : "text-zinc-400"
                    }`}
                >
                  Verified Commerce
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${isActive
                    ? isHomePage && !isScrolled
                      ? "bg-white/20 text-white border border-white/30 backdrop-blur-xs font-bold"
                      : "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                    : isHomePage && !isScrolled
                      ? "text-white/90 hover:text-white hover:bg-white/10 drop-shadow-sm"
                      : theme === "light"
                        ? "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
                        : "text-zinc-300 hover:text-white hover:bg-white/5"
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Center Search Input - Pill Shape with Indigo/Cyan Button */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md relative items-center"
          >
            <div
              className={`w-full rounded-full border flex items-center pl-3.5 pr-1.5 py-1 transition-all ${isHomePage && !isScrolled
                ? "border-white/20 bg-black/25 backdrop-blur-md text-white focus-within:border-cyan-400 focus-within:bg-black/40"
                : theme === "light"
                  ? "border-slate-300 bg-slate-100 text-slate-900 focus-within:border-cyan-500 focus-within:bg-white"
                  : "border-white/10 bg-white/[0.04] text-white focus-within:border-cyan-500 focus-within:bg-white/[0.07]"
                }`}
            >
              <Search
                className={`h-4 w-4 shrink-0 pointer-events-none mr-2 transition-colors ${isHomePage && !isScrolled ? "text-white/80" : "text-zinc-400"
                  }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Bole, Mercato, electronics, traditional..."
                className={`w-full text-xs outline-none bg-transparent transition-colors ${isHomePage && !isScrolled
                  ? "placeholder-white/70 text-white"
                  : "placeholder-zinc-400 text-inherit"
                  }`}
              />
              <button
                type="submit"
                className="h-7 px-3 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-semibold flex items-center gap-1 shrink-0 shadow-sm active:scale-95 transition-all cursor-pointer"
                title="Search"
                aria-label="Search"
              >
                <Star className="h-3 w-3 fill-cyan-300 text-cyan-300" />
                <span>Search</span>
              </button>
            </div>
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Favorites Icon - visible on sm+ */}
            <Link
              href="/favorites"
              className={`hidden sm:flex relative h-9 w-9 items-center justify-center rounded-xl border-0 transition-all ${isHomePage && !isScrolled
                ? "bg-transparent text-white hover:bg-transparent"
                : theme === "light"
                  ? "bg-transparent text-slate-700 hover:bg-transparent hover:text-slate-950"
                  : "bg-transparent text-zinc-300 hover:bg-transparent hover:text-white"
                }`}
              title="Saved Favorites"
            >
              <Heart className="h-4 w-4" />
              {mounted && favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* Bright Light / Appearance Theme Dropdown */}
            <div className="flex items-center">
              <ThemeToggle className="[&>button]:border-0 [&>button]:!bg-transparent [&>button]:hover:!bg-transparent [&>button>span]:hidden" />
            </div>

            {/* Wheeled Cart Icon & Count Badge */}
            <Link
              href="/cart"
              className={`cart-action-text flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-transparent bg-transparent transition-all font-bold group cursor-pointer hover:bg-transparent ${isHomePage && !isScrolled
                ? "text-white"
                : theme === "light"
                  ? "text-indigo-600"
                  : "text-indigo-400 hover:text-cyan-300"
                }`}
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <div className="relative flex items-center justify-center">
                <ShoppingCart className={`h-4.5 w-4.5 group-hover:scale-110 transition-transform ${isHomePage && !isScrolled ? "text-cyan-300" : "text-indigo-400"
                  }`} />
                {mounted && cartItemsCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-extrabold text-black shadow-sm">
                    {cartItemsCount}
                  </span>
                )}
              </div>
              <span className={`hidden sm:inline text-xs font-bold ${isHomePage && !isScrolled ? "text-white" : "text-indigo-400 group-hover:text-cyan-300"
                }`}>
                Cart {mounted && cartItemsCount > 0 ? `(${cartItemsCount})` : ""}
              </span>
            </Link>

            {/* Profile Dropdown / Login Sign In Dropdown - visible on sm+ */}
            {mounted && isAuthenticated ? (
              <div className="relative hidden sm:block" ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={`flex items-center gap-2 rounded-xl border-0 p-1.5 sm:px-2.5 sm:py-1.5 transition-colors cursor-pointer ${isHomePage && !isScrolled
                    ? "bg-transparent hover:bg-transparent text-white"
                    : theme === "light"
                      ? "bg-transparent hover:bg-transparent text-slate-800"
                      : theme === "dark"
                      ? "bg-transparent hover:bg-transparent text-white"
                      : "bg-transparent hover:bg-transparent text-white"
                    }`}
                >
                  <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                    {displayName.charAt(0)}
                  </div>
                  <span className={`hidden sm:inline text-xs font-medium truncate max-w-[90px] ${theme === "light" && !(isHomePage && !isScrolled) ? "text-slate-700" : "text-zinc-200"}`}>
                    {displayName}
                  </span>
                  <ChevronDown className={`h-3 w-3 ${theme === "light" && !(isHomePage && !isScrolled) ? "text-slate-400" : "text-zinc-400"}`} />
                </button>

                {profileDropdownOpen && (
                  <div
                    className={`customer-profile-dropdown app-dropdown-panel absolute right-0 mt-2 w-52 rounded-2xl border p-2 shadow-2xl backdrop-blur-2xl space-y-1 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                      useLightProfileDropdown
                        ? "bg-white border-slate-200 shadow-slate-900/15"
                        : theme === "dark"
                          ? "bg-[#141418] border-white/10 shadow-black/80"
                          : "bg-[#0d1a3a] border-blue-500/30 shadow-blue-950/80"
                    }`}
                  >
                    <div className={`px-3 py-2 border-b ${useLightProfileDropdown ? "border-slate-100" : theme === "dark" ? "border-white/5" : "border-blue-500/15"}` }>
                      <p className={`customer-profile-label text-xs font-semibold truncate ${useLightProfileDropdown ? "text-slate-900" : "text-white"}`}>{displayName}</p>
                      <p className={`customer-profile-label text-[10px] font-mono truncate ${useLightProfileDropdown ? "text-slate-500" : theme === "dark" ? "text-zinc-400" : "text-blue-200/80"}`}>{user?.email || "customer@mercatox.com"}</p>
                      <span className={`customer-profile-role inline-block mt-1 rounded px-1.5 py-0.5 text-[9px] font-semibold ${useLightProfileDropdown ? "bg-indigo-500/20 text-indigo-500" : "bg-indigo-500/20 text-indigo-200"}`}>
                        {user?.role || "CUSTOMER"}
                      </span>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs transition-colors ${
                        theme === "light"
                          ? isHomePage && !isScrolled
                            ? "bg-white/90 text-slate-950 hover:bg-white hover:text-black"
                            : "text-black hover:bg-slate-100 hover:text-black"
                          : theme === "dark"
                            ? "text-zinc-300 hover:bg-white/5 hover:text-white"
                            : "text-slate-200 hover:bg-blue-600/25 hover:text-white"
                      }`}
                    >
                      <User className="h-3.5 w-3.5 text-cyan-500" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      href="/orders"
                      onClick={() => setProfileDropdownOpen(false)}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs transition-colors ${
                        theme === "light"
                          ? isHomePage && !isScrolled
                            ? "bg-white/90 text-slate-950 hover:bg-white hover:text-black"
                            : "text-black hover:bg-slate-100 hover:text-black"
                          : theme === "dark"
                            ? "text-zinc-300 hover:bg-white/5 hover:text-white"
                            : "text-slate-200 hover:bg-blue-600/25 hover:text-white"
                      }`}
                    >
                      <Package className="h-3.5 w-3.5 text-emerald-500" />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs transition-colors ${
                        theme === "light"
                          ? isHomePage && !isScrolled
                            ? "bg-white/90 text-slate-950 hover:bg-white hover:text-black"
                            : "text-black hover:bg-slate-100 hover:text-black"
                          : theme === "dark"
                            ? "text-zinc-300 hover:bg-white/5 hover:text-white"
                            : "text-slate-200 hover:bg-blue-600/25 hover:text-white"
                      }`}
                    >
                      <Settings className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Account Settings</span>
                    </Link>

                    <div className={`border-t pt-1 ${useLightProfileDropdown ? "border-slate-100" : theme === "dark" ? "border-white/5" : "border-blue-500/15"}`}>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative hidden sm:block" ref={authDropdownRef}>
                <button
                  type="button"
                  onClick={() => setAuthDropdownOpen(!authDropdownOpen)}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  aria-expanded={authDropdownOpen}
                  aria-haspopup="true"
                >
                  <span>Sign In</span>
                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-200 ${authDropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {authDropdownOpen && (
                  <div
                    className={`auth-dropdown-panel app-dropdown-panel absolute right-0 mt-2 w-64 rounded-2xl p-1.5 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150 transition-all ${theme === "light"
                      ? "bg-white border border-slate-200 shadow-slate-900/15 text-slate-800"
                      : theme === "dark"
                        ? "bg-[#0d0d12] border border-zinc-800 shadow-black/95 text-zinc-100"
                        : "bg-[#0a142f] border border-blue-500/40 shadow-blue-950/90 text-white"
                      }`}
                  >
                    {/* Header */}
                    <div
                      className={`px-3 py-2 border-b rounded-t-xl mb-1 ${theme === "light"
                        ? "border-slate-100 bg-slate-50/80"
                        : theme === "dark"
                          ? "border-zinc-800/80 bg-zinc-900/40"
                          : "border-blue-500/20 bg-blue-950/40"
                        }`}
                    >
                      <p
                        className={`text-xs font-bold truncate ${theme === "light" ? "text-slate-900" : "text-white"
                          }`}
                      >
                        {platformSettings.platformName} Account
                      </p>
                      <p
                        className={`text-[10px] ${theme === "light"
                          ? "text-slate-500"
                          : theme === "dark"
                            ? "text-zinc-400"
                            : "text-blue-200/80"
                          }`}
                      >
                        Buyer-protected commerce in Ethiopia
                      </p>
                    </div>

                    {/* Links */}
                    <div className="space-y-1">
                      <Link
                        href="/login"
                        onClick={() => setAuthDropdownOpen(false)}
                        className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${theme === "light"
                          ? "text-slate-700 hover:text-indigo-600 hover:bg-slate-100/80"
                          : theme === "dark"
                            ? "text-zinc-200 hover:text-white hover:bg-zinc-800/70"
                            : "text-slate-200 hover:text-white hover:bg-blue-600/25"
                          }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-colors ${theme === "light"
                              ? "border-indigo-100 bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"
                              : theme === "dark"
                                ? "border-indigo-500/30 bg-indigo-500/15 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white"
                                : "border-blue-500/30 bg-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white"
                              }`}
                          >
                            <LogIn className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <div className="font-bold">Sign In</div>
                            <div
                              className={`text-[10px] font-normal ${theme === "light"
                                ? "text-slate-500"
                                : theme === "dark"
                                  ? "text-zinc-400"
                                  : "text-slate-400"
                                }`}
                            >
                              Existing account login
                            </div>
                          </div>
                        </div>
                        <ChevronRight
                          className={`h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all ${theme === "light"
                            ? "text-slate-400 group-hover:text-indigo-600"
                            : theme === "dark"
                              ? "text-zinc-400 group-hover:text-white"
                              : "text-blue-300 group-hover:text-cyan-300"
                            }`}
                        />
                      </Link>

                      <Link
                        href="/register"
                        onClick={() => setAuthDropdownOpen(false)}
                        className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${theme === "light"
                          ? "text-slate-700 hover:text-cyan-700 hover:bg-slate-100/80"
                          : theme === "dark"
                            ? "text-zinc-200 hover:text-white hover:bg-zinc-800/70"
                            : "text-slate-200 hover:text-white hover:bg-blue-600/25"
                          }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-colors ${theme === "light"
                              ? "border-cyan-100 bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white"
                              : theme === "dark"
                                ? "border-cyan-500/30 bg-cyan-500/15 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white"
                                : "border-cyan-400/30 bg-cyan-500/20 text-cyan-300 group-hover:bg-cyan-500 group-hover:text-white"
                              }`}
                          >
                            <UserPlus className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <div className="font-bold">Create Account</div>
                            <div
                              className={`text-[10px] font-normal ${theme === "light"
                                ? "text-slate-500"
                                : theme === "dark"
                                  ? "text-zinc-400"
                                  : "text-slate-400"
                                }`}
                            >
                              Join buyers & sellers
                            </div>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${theme === "light"
                            ? "bg-emerald-100 text-emerald-700"
                            : theme === "dark"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                            }`}
                        >
                          New
                        </span>
                      </Link>
                    </div>

                    {/* Protection Footer */}
                    <div
                      className={`mt-1 border-t px-3 py-1.5 rounded-b-xl flex items-center justify-between text-[10px] ${theme === "light"
                        ? "border-slate-100 bg-slate-50/60 text-slate-500"
                        : theme === "dark"
                          ? "border-zinc-800/80 bg-zinc-900/40 text-zinc-400"
                          : "border-blue-500/20 bg-blue-950/60 text-blue-200/80"
                        }`}
                    >
                      <span className="flex items-center gap-1.5 font-medium">
                        <ShieldCheck className="h-3 w-3 text-emerald-400" />
                        <span>100% Buyer Protected</span>
                      </span>
                      <span className="font-mono text-[9px] opacity-75">OTP Verified</span>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Mobile & Side Sheet Drawer via createPortal mounted directly to document.body */}
      {mounted && typeof document !== "undefined" && mobileMenuOpen && createPortal(
        <div className="fixed inset-0 z-[99999] isolate">
          {/* Full-Screen Backdrop Overlay */}
          <div
            className={`fixed inset-0 transition-opacity duration-300 ${theme === "light"
              ? "bg-slate-900/50 backdrop-blur-xs"
              : theme === "dark"
                ? "bg-black/80 backdrop-blur-xs"
                : "bg-slate-950/75 backdrop-blur-xs"
              }`}
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Side Sheet Drawer (Half Screen Width / Slide from Left) */}
          <div
            className={`fixed inset-y-0 left-0 h-[100dvh] w-[70vw] sm:w-[50vw] md:w-[380px] max-w-[420px] min-w-[280px] flex flex-col shadow-2xl transition-transform duration-300 ease-out z-[100000] ${theme === "light"
              ? "bg-white text-slate-900 border-r border-slate-200 shadow-slate-900/20"
              : theme === "dark"
                ? "bg-[#070a12] text-white border-r border-zinc-800/90 shadow-black"
                : "bg-[#060e24] text-white border-r border-blue-500/30 shadow-blue-950"
              }`}
          >
            {/* 1. Drawer Top Header: Logo + Project Title + Cancel Icon at Edge */}
            <div
              className={`px-4 py-3.5 border-b flex items-center justify-between gap-3 shrink-0 ${theme === "light"
                ? "border-slate-200 bg-slate-50 text-slate-900"
                : theme === "dark"
                  ? "border-zinc-800/80 bg-zinc-900/70 text-white"
                  : "border-blue-500/25 bg-blue-950/40 text-white"
                }`}
            >
              {/* Logo & Project Title */}
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 min-w-0 group"
              >
                <div className="h-9 w-9 rounded-xl bg-[#090d16] border border-white/10 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/25 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                  {platformSettings.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={platformSettings.logoUrl}
                      alt={platformSettings.platformName}
                      className="h-full w-full object-contain p-0.5"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white text-sm">
                      {platformSettings.platformName?.charAt(0) || "M"}
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span
                    className={`text-base font-bold tracking-tight truncate leading-tight ${theme === "light" ? "text-slate-900" : "text-white"
                      }`}
                  >
                    {platformSettings.platformName}
                  </span>
                  <span
                    className={`text-[9px] uppercase tracking-wider font-semibold ${theme === "light"
                      ? "text-slate-500"
                      : theme === "dark"
                        ? "text-zinc-400"
                        : "text-blue-300/80"
                      }`}
                  >
                    Verified Commerce
                  </span>
                </div>
              </Link>

              {/* Cancel (Close 'X') Icon at Edge / Chaf */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-all cursor-pointer shrink-0 active:scale-95 ${theme === "light"
                  ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                  : theme === "dark"
                    ? "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    : "border-blue-500/30 bg-blue-950/60 text-blue-200 hover:bg-blue-900/50 hover:text-white"
                  }`}
                aria-label="Close menu"
                title="Close menu"
              >
                <X className="h-4.5 w-4.5 text-cyan-400" />
              </button>
            </div>

            {/* 2. Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4">
              {/* Welcome User / Guest Card */}
              {mounted && isAuthenticated ? (
                <div
                  className={`p-3.5 rounded-2xl border transition-all ${theme === "light"
                    ? "border-indigo-100 bg-indigo-50/80 text-slate-900 shadow-xs"
                    : theme === "dark"
                      ? "border-zinc-800/90 bg-zinc-900/70 text-white shadow-md shadow-black/50"
                      : "border-blue-500/30 bg-blue-950/50 text-white shadow-md shadow-blue-950/50"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-md shadow-indigo-500/30">
                      {displayName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[11px] font-bold ${theme === "light"
                            ? "text-indigo-600"
                            : theme === "dark"
                              ? "text-cyan-400"
                              : "text-cyan-300"
                            }`}
                        >
                          Welcome,
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${theme === "light"
                            ? "bg-indigo-100 text-indigo-700"
                            : theme === "dark"
                              ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                              : "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                            }`}
                        >
                          {user?.role || "CUSTOMER"}
                        </span>
                      </div>
                      <h3
                        className={`text-sm font-bold truncate leading-snug ${theme === "light" ? "text-slate-900" : "text-white"
                          }`}
                      >
                        {displayName}
                      </h3>
                      <p
                        className={`text-[11px] truncate font-mono mt-0.5 ${theme === "light"
                          ? "text-slate-500"
                          : theme === "dark"
                            ? "text-zinc-400"
                            : "text-blue-300/80"
                          }`}
                      >
                        {user?.email || "customer@mercatox.com"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`p-3.5 rounded-2xl border ${theme === "light"
                    ? "border-slate-200 bg-slate-50 text-slate-900"
                    : theme === "dark"
                      ? "border-zinc-800/90 bg-zinc-900/60 text-white"
                      : "border-blue-500/30 bg-blue-950/40 text-white"
                    }`}
                >
                  <div className="mb-2.5">
                    <p
                      className={`text-xs font-bold ${theme === "light" ? "text-slate-900" : "text-white"
                        }`}
                    >
                      Welcome to {platformSettings.platformName}
                    </p>
                    <p
                      className={`text-[10px] ${theme === "light"
                        ? "text-slate-500"
                        : theme === "dark"
                          ? "text-zinc-400"
                          : "text-blue-300/70"
                        }`}
                    >
                      Sign in to manage orders & saved items
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition-colors ${theme === "light"
                        ? "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
                        : theme === "dark"
                          ? "border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
                          : "border-blue-500/40 bg-blue-900/40 text-white hover:bg-blue-800/50"
                        }`}
                    >
                      <LogIn className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 py-2 text-xs font-semibold text-white hover:brightness-110 shadow-sm"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Register</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative flex items-center">
                <Search
                  className={`absolute left-3 top-2.5 h-4 w-4 pointer-events-none ${theme === "light"
                    ? "text-slate-400"
                    : theme === "dark"
                      ? "text-zinc-500"
                      : "text-blue-400"
                    }`}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, zones..."
                  className={`w-full rounded-xl border py-2 pl-9 pr-14 text-xs outline-none transition-all ${theme === "light"
                    ? "border-slate-300 bg-slate-100/90 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:bg-white"
                    : theme === "dark"
                      ? "border-zinc-800 bg-zinc-900 text-white placeholder-zinc-500 focus:border-cyan-400 focus:bg-zinc-800"
                      : "border-blue-500/30 bg-[#0c1a3d] text-white placeholder-blue-300/40 focus:border-cyan-400 focus:bg-[#0f214d]"
                    }`}
                />
                <button
                  type="submit"
                  className="absolute right-1.5 h-7 px-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-[11px] font-semibold flex items-center justify-center shadow-sm active:scale-95 transition-transform cursor-pointer"
                  title="Search"
                  aria-label="Search"
                >
                  <span>Find</span>
                </button>
              </form>

              {/* Primary Nav Links */}
              <div className="space-y-1">
                {[
                  { name: "Home", href: "/", icon: Sparkles },
                  { name: "Marketplace", href: "/marketplace", icon: ShoppingCart },
                  { name: "Categories", href: "/categories", icon: Package },
                ].map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${isActive
                        ? "border-cyan-500/60 bg-cyan-500/15 text-cyan-400 shadow-sm"
                        : theme === "light"
                          ? "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                          : theme === "dark"
                            ? "border-zinc-800/80 bg-zinc-900/60 text-zinc-200 hover:bg-zinc-800 hover:text-white"
                            : "border-blue-500/20 bg-blue-950/40 text-blue-100 hover:bg-blue-900/40 hover:text-white"
                        }`}
                    >
                      <Icon
                        className={`h-4 w-4 ${isActive
                          ? "text-cyan-400"
                          : theme === "light"
                            ? "text-slate-400"
                            : theme === "dark"
                              ? "text-zinc-400"
                              : "text-blue-400"
                          }`}
                      />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Shop by Department (All 6 Categories) in Hamburger Drawer */}
              <div
                className={`p-3 rounded-xl border space-y-2 ${theme === "light"
                  ? "border-slate-200 bg-slate-50/80 text-slate-900"
                  : theme === "dark"
                    ? "border-zinc-800/80 bg-zinc-900/40 text-white"
                    : "border-blue-500/20 bg-blue-950/40 text-white"
                  }`}
              >
                <div className="flex items-center justify-between pb-1 border-b border-white/5 dark:border-white/5">
                  <div className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-cyan-400" />
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider block ${theme === "light"
                        ? "text-slate-500"
                        : theme === "dark"
                          ? "text-zinc-400"
                          : "text-blue-300/80"
                        }`}
                    >
                      Shop by Department
                    </span>
                  </div>
                  <Link
                    href="/categories"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[10px] font-bold text-cyan-400 hover:underline"
                  >
                    View All
                  </Link>
                </div>

                <div className="space-y-0.5">
                  {[
                    { name: "Kids & Children", slug: "kids-children", icon: Baby },
                    { name: "Cosmetics & Skincare", slug: "cosmetics-skincare", icon: Sparkles },
                    { name: "Fashion, Apparel & Shoes", slug: "fashion-apparel-shoes", icon: Shirt },
                    { name: "Electronics & Smart Devices", slug: "computers-electronics", icon: Laptop },
                    { name: "Grains, Cereals & Groceries", slug: "grains-cereals-groceries", icon: Wheat },
                    { name: "Home & Kitchen Appliances", slug: "home-kitchen-appliances", icon: Home },
                  ].map((cat) => {
                    const CatIcon = cat.icon;
                    return (
                      <Link
                        key={cat.slug}
                        href={`/marketplace?category=${encodeURIComponent(cat.slug)}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors group ${theme === "light"
                          ? "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                          : theme === "dark"
                            ? "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            : "text-blue-200 hover:bg-blue-900/40 hover:text-white"
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-black/5 dark:bg-white/10 text-cyan-400">
                            <CatIcon className="h-3 w-3" />
                          </span>
                          <span className="text-[11.5px] font-medium">{cat.name}</span>
                        </div>
                        <ChevronRight className="h-3 w-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-zinc-400" />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Cart & Favorites Quick Row */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${theme === "light"
                    ? "border-indigo-200 bg-indigo-50/70 text-indigo-900 hover:bg-indigo-100/70"
                    : theme === "dark"
                      ? "border-zinc-800 bg-zinc-900/80 text-indigo-300 hover:bg-zinc-800 hover:text-indigo-200"
                      : "border-blue-500/30 bg-blue-950/60 text-cyan-300 hover:bg-blue-900/50"
                    }`}
                >
                  <div className="flex items-center gap-1.5">
                    <ShoppingCart className="h-4 w-4 text-indigo-500" />
                    <span className="text-xs font-bold">Cart</span>
                  </div>
                  {cartItemsCount > 0 && (
                    <span className="flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-extrabold text-black">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>

                <Link
                  href="/favorites"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${theme === "light"
                    ? "border-rose-200 bg-rose-50/70 text-rose-900 hover:bg-rose-100/70"
                    : theme === "dark"
                      ? "border-zinc-800 bg-zinc-900/80 text-rose-300 hover:bg-zinc-800 hover:text-rose-200"
                      : "border-rose-500/25 bg-rose-950/30 text-rose-300 hover:bg-rose-900/40"
                    }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Heart className="h-4 w-4 text-rose-500" />
                    <span className="text-xs font-bold">Saved</span>
                  </div>
                  {favoritesCount > 0 && (
                    <span className="flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white">
                      {favoritesCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* Authenticated User Links */}
              {mounted && isAuthenticated && (
                <div
                  className={`space-y-1 pt-2 border-t ${theme === "light"
                    ? "border-slate-200"
                    : theme === "dark"
                      ? "border-zinc-800/80"
                      : "border-blue-500/20"
                    }`}
                >
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${theme === "light"
                      ? "text-slate-500"
                      : theme === "dark"
                        ? "text-zinc-400"
                        : "text-blue-300/70"
                      }`}
                  >
                    My Account
                  </span>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-xs transition-colors ${theme === "light"
                      ? "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      : theme === "dark"
                        ? "border-zinc-800/80 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        : "border-blue-500/20 bg-blue-950/40 text-blue-200 hover:bg-blue-900/40 hover:text-white"
                      }`}
                  >
                    <User className="h-3.5 w-3.5 text-cyan-400" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-xs transition-colors ${theme === "light"
                      ? "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      : theme === "dark"
                        ? "border-zinc-800/80 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        : "border-blue-500/20 bg-blue-950/40 text-blue-200 hover:bg-blue-900/40 hover:text-white"
                      }`}
                  >
                    <Package className="h-3.5 w-3.5 text-emerald-400" />
                    <span>My Orders</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-xs transition-colors ${theme === "light"
                      ? "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      : theme === "dark"
                        ? "border-zinc-800/80 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        : "border-blue-500/20 bg-blue-950/40 text-blue-200 hover:bg-blue-900/40 hover:text-white"
                      }`}
                  >
                    <Settings className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Account Settings</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition-colors cursor-pointer mt-1 ${theme === "light"
                      ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                      : theme === "dark"
                        ? "border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                        : "border-rose-500/30 bg-rose-950/40 text-rose-300 hover:bg-rose-900/50"
                      }`}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}

              {/* Market Zones Quick Access */}
              <div
                className={`p-3 rounded-xl border space-y-2 ${theme === "light"
                  ? "border-slate-200 bg-slate-50/80 text-slate-900"
                  : theme === "dark"
                    ? "border-zinc-800/80 bg-zinc-900/40 text-white"
                    : "border-blue-500/20 bg-blue-950/40 text-white"
                  }`}
              >
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider block ${theme === "light"
                      ? "text-slate-500"
                      : theme === "dark"
                        ? "text-zinc-400"
                        : "text-blue-300/80"
                      }`}
                  >
                    Addis Market Zones
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { name: "Bole", query: "Bole" },
                    { name: "Mercato", query: "Mercato" },
                    { name: "Shiro Meda", query: "Shiro Meda" },
                    { name: "Stadium", query: "Stadium" },
                    { name: "Piazza", query: "Piazza" },
                  ].map((zone) => (
                    <Link
                      key={zone.name}
                      href={`/marketplace?zone=${encodeURIComponent(zone.query)}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`rounded-lg border px-2 py-0.5 text-[11px] font-medium transition-colors ${theme === "light"
                        ? "border-slate-300 bg-white text-slate-700 hover:border-cyan-500 hover:text-cyan-600"
                        : theme === "dark"
                          ? "border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 hover:border-zinc-500"
                          : "border-blue-500/30 bg-blue-900/30 text-blue-200 hover:text-white hover:bg-blue-800/40 hover:border-cyan-400"
                        }`}
                    >
                      {zone.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Theme Quick Selector in Drawer */}
              <div
                className={`p-3 rounded-xl border space-y-2 ${theme === "light"
                  ? "border-slate-200 bg-slate-50/80"
                  : theme === "dark"
                    ? "border-zinc-800/80 bg-zinc-900/40"
                    : "border-blue-500/20 bg-blue-950/40"
                  }`}
              >
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span
                    className={`uppercase tracking-wider text-[10px] ${theme === "light"
                      ? "text-slate-500"
                      : theme === "dark"
                        ? "text-zinc-400"
                        : "text-blue-300/80"
                      }`}
                  >
                    Appearance
                  </span>
                  <span
                    className={`capitalize font-bold ${theme === "light"
                      ? "text-indigo-600"
                      : "text-cyan-400"
                      }`}
                  >
                    {theme}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "light" as ThemeMode, label: "Light", icon: Sun },
                    { id: "dark" as ThemeMode, label: "Dark", icon: Moon },
                    { id: "system" as ThemeMode, label: "System", icon: Monitor },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = theme === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setTheme(opt.id)}
                        className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${isSelected
                          ? theme === "light"
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-bold shadow-xs"
                            : "border-cyan-500 bg-cyan-500/15 text-cyan-400 font-bold shadow-xs"
                          : theme === "light"
                            ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            : theme === "dark"
                              ? "border-zinc-800 bg-zinc-800/70 text-zinc-400 hover:text-white hover:bg-zinc-700"
                              : "border-blue-500/20 bg-blue-900/30 text-blue-300 hover:text-white hover:bg-blue-800/50"
                          }`}
                      >
                        <Icon className="h-3 w-3" />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. Sticky Bottom Protection Footer */}
            <div
              className={`px-4 py-3 border-t shrink-0 flex items-center justify-between text-xs ${theme === "light"
                ? "border-slate-200 bg-slate-50/90 text-slate-500"
                : theme === "dark"
                  ? "border-zinc-800/80 bg-zinc-900/40 text-zinc-400"
                  : "border-blue-500/20 bg-blue-950/40 text-blue-200/80"
                }`}
            >
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
                <ShieldCheck className="h-4 w-4" />
                <span>100% Protected</span>
              </div>
              <span
                className={`font-mono text-[10px] ${theme === "light"
                  ? "text-slate-400"
                  : theme === "dark"
                    ? "text-zinc-500"
                    : "text-blue-300/60"
                  }`}
              >
                OTP Delivery
              </span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}

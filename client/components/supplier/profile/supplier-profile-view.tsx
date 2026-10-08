"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Award,
  Truck,
  Edit2,
  Save,
  CheckCircle2,
  ExternalLink,
  Share2,
  Check,
  X,
  Briefcase,
  Layers,
  UserCheck,
  CreditCard,
  Clock,
  Sparkles,
  Star,
  BadgeCheck,
  FileText,
  Package,
  Download,
  ArrowRight,
  Shield,
  Activity,
  FileCheck,
  Warehouse as WarehouseIcon,
  TrendingUp,
  Landmark,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useSupplierStore } from "@/store/supplier-store";
import { toast } from "sonner";

export function SupplierProfileView() {
  const {
    profile,
    fetchProfile,
    updateProfile,
    isLoadingProfile,
    warehouses,
    products,
    settlementAccounts,
    setActiveTab: setStoreActiveTab,
  } = useSupplierStore();

  const [activeTab, setActiveTab] = useState<"dossier" | "catalog" | "compliance" | "logistics" | "commercial">("dossier");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch real profile from backend on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const [editForm, setEditForm] = useState({
    businessName: profile?.businessName || "",
    tagline: profile?.tagline || "",
    description: profile?.description || "",
    legalEntity: profile?.legalEntity || "Private Limited Company (PLC)",
    tinNumber: profile?.tinNumber || "",
    licenseNumber: profile?.licenseNumber || "",
    phone: profile?.phone || "",
    email: profile?.email || "",
    website: profile?.website || "",
    address: profile?.address || "",
    city: profile?.city || "Addis Ababa",
    region: profile?.region || "Addis Ababa",
    minOrderValueETB: profile?.minOrderValueETB || 50000,
    executiveName: profile?.executiveName || "",
    executiveTitle: profile?.executiveTitle || "Managing Director",
    defaultLeadTimeDays: profile?.defaultLeadTimeDays || 3,
  });

  // Keep form in sync when profile finishes loading
  useEffect(() => {
    if (profile) {
      setEditForm({
        businessName: profile.businessName || "",
        tagline: profile.tagline || "",
        description: profile.description || "",
        legalEntity: profile.legalEntity || "Private Limited Company (PLC)",
        tinNumber: profile.tinNumber || "",
        licenseNumber: profile.licenseNumber || "",
        phone: profile.phone || "",
        email: profile.email || "",
        website: profile.website || "",
        address: profile.address || "",
        city: profile.city || "Addis Ababa",
        region: profile.region || "Addis Ababa",
        minOrderValueETB: profile.minOrderValueETB || 50000,
        executiveName: profile.executiveName || "",
        executiveTitle: profile.executiveTitle || "Managing Director",
        defaultLeadTimeDays: profile.defaultLeadTimeDays || 3,
      });
    }
  }, [profile]);

  const handleShare = () => {
    const slug = profile?.storeSlug || profile?.businessName?.toLowerCase().replace(/\s+/g, "-") || "supplier";
    navigator.clipboard.writeText(`https://mercatox.et/supplier/${slug}`);
    setCopiedLink(true);
    toast.success("Verified Storefront URL copied to clipboard");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        businessName: editForm.businessName.trim(),
        tagline: editForm.tagline.trim(),
        description: editForm.description.trim(),
        legalEntity: editForm.legalEntity.trim(),
        tinNumber: editForm.tinNumber.trim(),
        licenseNumber: editForm.licenseNumber.trim(),
        phone: editForm.phone.trim(),
        email: editForm.email.trim(),
        website: editForm.website.trim(),
        address: editForm.address.trim(),
        city: editForm.city.trim(),
        region: editForm.region.trim(),
        minOrderValueETB: Number(editForm.minOrderValueETB) || 50000,
        executiveName: editForm.executiveName.trim(),
        executiveTitle: editForm.executiveTitle.trim(),
        defaultLeadTimeDays: Number(editForm.defaultLeadTimeDays) || 3,
      });
      setIsEditModalOpen(false);
    } catch (err: any) {
      toast.error("Failed to update profile on backend");
    } finally {
      setIsSaving(false);
    }
  };

  const totalStockCount = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const primaryAccount = settlementAccounts.find((a) => a.isDefault) || settlementAccounts[0];

  return (
    <div className="max-w-[960px] mx-auto w-full space-y-3 px-2 sm:px-4">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. SLIGHTLY MORE COMPACT MODERN HERO BANNER                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c121e] overflow-hidden shadow-xs">
        {/* Cover backdrop */}
        <div className="relative h-28 sm:h-32 w-full bg-slate-900 overflow-hidden">
          <img
            src={profile?.coverUrl || "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=80"}
            alt="Storefront cover"
            className="h-full w-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c121e] via-[#0c121e]/50 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(46,125,50,0.22),transparent_60%)]" />

          {/* Top floating badges */}
          <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-500/20 text-emerald-300 backdrop-blur-md border border-emerald-400/40">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span>{profile?.verificationBadge || "Gold Verified B2B Supplier"}</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-medium bg-black/50 text-zinc-200 backdrop-blur-md border border-white/15">
              <Sparkles className="h-2.5 w-2.5 text-amber-400" />
              <span>Verified Merchant</span>
            </span>
          </div>
        </div>

        {/* Brand identity & Actions */}
        <div className="px-3.5 sm:px-4.5 pb-3 pt-0 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between -mt-9 sm:-mt-11 mb-2.5 gap-3">
            {/* Logo + Titles */}
            <div className="flex items-end gap-3">
              <div className="relative h-16 w-16 sm:h-18 sm:w-18 rounded-lg border-2 border-white dark:border-[#0c121e] bg-white p-0.5 shadow-sm overflow-hidden shrink-0 flex items-center justify-center">
                {profile?.logoUrl ? (
                  <img
                    src={profile.logoUrl}
                    alt={profile.businessName}
                    className="h-full w-full object-cover rounded-md"
                  />
                ) : (
                  <div className="h-full w-full rounded-md bg-emerald-800 text-white font-black text-xl flex items-center justify-center">
                    {profile?.businessName ? profile.businessName.slice(0, 2).toUpperCase() : "MX"}
                  </div>
                )}
                <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0c121e]" title="Active Online" />
              </div>

              <div className="pb-0.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[18px] sm:text-[20px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                    {profile?.businessName || "My Enterprise"}
                  </h1>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                    Live Database Connected
                  </span>
                </div>

                <p className="text-[11.5px] sm:text-[12px] text-slate-600 dark:text-zinc-300 font-medium mt-0.5 line-clamp-1">
                  {profile?.tagline || `${profile?.businessName || "Supplier"} — Verified B2B Enterprise on MercatoX`}
                </p>

                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10.5px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                  {profile?.tinNumber && (
                    <>
                      <span>TIN: <strong className="text-slate-700 dark:text-zinc-200">{profile.tinNumber}</strong></span>
                      <span>•</span>
                    </>
                  )}
                  {profile?.licenseNumber && (
                    <>
                      <span>Lic: <strong className="text-slate-700 dark:text-zinc-200">{profile.licenseNumber}</strong></span>
                      <span>•</span>
                    </>
                  )}
                  <span>{profile?.legalEntity || "Private Limited Company (PLC)"}</span>
                  <span>•</span>
                  <span>Est. {profile?.establishedYear || 2024}</span>
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  fetchProfile();
                  toast.success("Synchronized profile data from database.");
                }}
                disabled={isLoadingProfile}
                className="inline-flex items-center gap-1.5 h-[32px] sm:h-[34px] px-3 rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] text-[11.5px] font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                title="Refresh real-time data from backend"
              >
                <RefreshCw className={`h-3 w-3 text-slate-400 ${isLoadingProfile ? "animate-spin text-emerald-500" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 h-[32px] sm:h-[34px] px-3 rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] text-[11.5px] font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="h-3 w-3 text-emerald-500" /> : <Share2 className="h-3 w-3 text-slate-400" />}
                <span>{copiedLink ? "Copied" : "Share"}</span>
              </button>

              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-1.5 h-[32px] sm:h-[34px] px-3.5 rounded-md bg-[#2E7D32] hover:bg-[#256629] text-white text-[11.5px] font-semibold transition-all shadow-xs cursor-pointer"
              >
                <Edit2 className="h-3 w-3" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* 4 Micro-Stats Bar Derived from Live Store & Backend */}
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2 rounded-lg bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9.5px] text-slate-400 block uppercase tracking-wider font-semibold">Catalog Items</span>
                <span className="text-[13px] font-bold font-mono text-slate-900 dark:text-white leading-tight">
                  {products.length} Products
                </span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Package className="h-3.5 w-3.5 text-blue-500" />
              </div>
              <div className="min-w-0">
                <span className="text-[9.5px] text-slate-400 block uppercase tracking-wider font-semibold">Total Stock</span>
                <span className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">
                  {totalStockCount.toLocaleString()} Units
                </span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Building2 className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9.5px] text-slate-400 block uppercase tracking-wider font-semibold">Depot Network</span>
                <span className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">
                  {warehouses.length} Active Hubs
                </span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9.5px] text-slate-400 block uppercase tracking-wider font-semibold">Settlement Rail</span>
                <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400 leading-tight truncate">
                  {primaryAccount ? primaryAccount.bankName : "RTGS Escrow"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. COMPACT SEGMENTED NAVIGATION TABS                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/5 overflow-x-auto text-[11.5px]">
        {[
          { id: "dossier", label: "Company Dossier", icon: Building2 },
          { id: "catalog", label: "Commodities & Inventory", icon: Package },
          { id: "compliance", label: "Quality Seals & Tax", icon: Award },
          { id: "logistics", label: "Depots & Corridors", icon: Truck },
          { id: "commercial", label: "Wholesale Terms", icon: Briefcase },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 h-[30px] sm:h-[32px] px-3 rounded-md whitespace-nowrap font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs font-semibold"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/[0.02]"
              }`}
            >
              <Icon className={`h-3 w-3 ${isActive ? "text-[#2E7D32]" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. TAB 1: COMPANY DOSSIER                                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "dossier" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Left Column (7 cols): Narrative, Leadership & Escrow */}
          <div className="lg:col-span-7 space-y-3">
            {/* Corporate Narrative Card */}
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c121e] p-3.5 shadow-xs space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-white/5">
                <span className="text-[12.5px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-[#2E7D32]" />
                  Corporate Profile & Capabilities
                </span>
                <span className="text-[10px] text-slate-400 font-mono">B2B Aggregate</span>
              </div>

              <p className="text-[12px] text-slate-600 dark:text-zinc-300 leading-relaxed">
                {profile?.description || "Verified Ethiopian Commercial B2B Enterprise operating across national wholesale trade corridors."}
              </p>

              {/* Dynamic Category Badges */}
              <div className="pt-2">
                <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Verified Commodity Sectors:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {products.length > 0 ? (
                    Array.from(new Set(products.map((p) => p.category).filter(Boolean))).map((cat, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/10"
                      >
                        {cat}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-slate-500">Commodities added to catalog will automatically populate here.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Leadership & Authorized Managing Director Card */}
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c121e] p-3.5 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-white/5">
                <span className="text-[12.5px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-[#2E7D32]" />
                  Authorized Enterprise Signatory
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200/50">
                  Verified Contact
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-white/[0.02] gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-full bg-emerald-700 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                    {profile?.executiveName ? profile.executiveName.slice(0, 2).toUpperCase() : "MD"}
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">
                      {profile?.executiveName || "Enterprise Director"}
                    </h3>
                    <p className="text-[11.5px] text-slate-500 dark:text-zinc-400">
                      {profile?.executiveTitle || "Commercial Operations Director"}
                    </p>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                      <Shield className="h-2.5 w-2.5" />
                      Authorized Legal Representative
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end gap-0.5 text-[11px] font-mono">
                  <span className="text-slate-600 dark:text-zinc-300">{profile?.phone || "No phone linked"}</span>
                  <span className="text-slate-400 truncate max-w-[190px]">{profile?.email || "No email linked"}</span>
                </div>
              </div>
            </div>

            {/* Live Settlement Rail Card */}
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 shadow-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-emerald-200/60 dark:border-emerald-500/20 mb-2">
                <div className="flex items-center gap-1.5">
                  <Landmark className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                  <span className="text-[12.5px] font-bold text-emerald-900 dark:text-emerald-200">
                    Settlement & Treasury Rail
                  </span>
                </div>
                <span className="text-[9.5px] font-mono font-bold bg-emerald-600 text-white px-2 py-0.5 rounded">
                  RTGS ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11.5px]">
                <div>
                  <span className="text-[10.5px] text-emerald-700 dark:text-emerald-400 block">Primary Terminal:</span>
                  <span className="font-mono font-bold text-emerald-900 dark:text-emerald-100">
                    {primaryAccount ? `${primaryAccount.bankName}` : "Direct RTGS Bank"}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] text-emerald-700 dark:text-emerald-400 block">Account / Rail:</span>
                  <span className="font-semibold text-emerald-900 dark:text-emerald-100 font-mono">
                    {primaryAccount ? primaryAccount.accountNumber : "Configured via Payments Tab"}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] text-emerald-700 dark:text-emerald-400 block">Release Condition:</span>
                  <span className="font-semibold text-emerald-900 dark:text-emerald-100">Electronic Proof of Delivery (POD)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Physical HQ & Tax Credentials */}
          <div className="lg:col-span-5 space-y-3">
            {/* Headquarters & Contacts */}
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c121e] p-3.5 shadow-xs space-y-2.5">
              <h3 className="text-[12.5px] font-bold text-slate-900 dark:text-white pb-1.5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#2E7D32]" />
                  Headquarters & Office
                </span>
                <span className="text-[10.5px] font-mono text-slate-400">{profile?.city || "Addis Ababa"}</span>
              </h3>

              <div className="space-y-2 text-[11.5px]">
                <div className="p-2 rounded-lg border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium mb-0.5">Corporate Address</span>
                  <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                    {profile?.address || "Mercato Commercial Trade Zone"}
                  </p>
                  <p className="text-slate-500 dark:text-zinc-400 text-[10.5px] mt-0.5">
                    {profile?.city || "Addis Ababa"}, {profile?.region || "Ethiopia"}
                  </p>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-blue-500" />
                    <span>Telephone Desk</span>
                  </span>
                  <a href={`tel:${profile?.phone}`} className="font-mono font-semibold text-slate-800 dark:text-zinc-200 hover:text-[#2E7D32]">
                    {profile?.phone || "N/A"}
                  </a>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-amber-500" />
                    <span>Official Email</span>
                  </span>
                  <a href={`mailto:${profile?.email}`} className="font-mono font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[170px] hover:text-[#2E7D32]" title={profile?.email}>
                    {profile?.email || "N/A"}
                  </a>
                </div>

                {profile?.website && (
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-white/5">
                    <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <Globe className="h-3 w-3 text-indigo-500" />
                      <span>Web Portal</span>
                    </span>
                    <a href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`} target="_blank" rel="noreferrer" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 truncate max-w-[170px]">
                      <span className="truncate">{profile.website.replace(/^https?:\/\//, "")}</span>
                      <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                    </a>
                  </div>
                )}

                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>Working Hours</span>
                  </span>
                  <span className="font-medium text-slate-800 dark:text-zinc-200 text-right">
                    Mon–Fri (08:00–17:30 EAT)
                  </span>
                </div>
              </div>
            </div>

            {/* Tax & Commercial Registration Dossier */}
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c121e] p-3.5 shadow-xs space-y-2">
              <h3 className="text-[12.5px] font-bold text-slate-900 dark:text-white pb-1.5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileCheck className="h-3.5 w-3.5 text-[#2E7D32]" />
                  Tax & Commercial Registration
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">Active Database Record</span>
              </h3>

              <div className="space-y-1 text-[11.5px]">
                <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500 dark:text-zinc-400">TIN Number (የግብር ከፋይ ቁጥር)</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{profile?.tinNumber || "Pending Entry"}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500 dark:text-zinc-400">Principal Trade License</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{profile?.licenseNumber || "Pending Entry"}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500 dark:text-zinc-400">Legal Entity Structure</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-zinc-200">{profile?.legalEntity || "PLC"}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500 dark:text-zinc-400">Ministry of Trade Reg</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-zinc-200">MOTRI-ETH-VERIFIED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. TAB 2: COMMODITIES & PRODUCT INVENTORY CATALOG             */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "catalog" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">Active Wholesale Product Lines ({products.length})</h2>
              <p className="text-[11.5px] text-slate-500 dark:text-zinc-400">
                Live inventory lots aggregated from your catalog and available for B2B contract negotiation.
              </p>
            </div>
            <button
              onClick={() => setStoreActiveTab("products")}
              className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#2E7D32] hover:underline cursor-pointer"
            >
              <span>Manage Full Catalog</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/10 p-8 text-center space-y-3">
              <Package className="h-8 w-8 text-slate-400 mx-auto opacity-50" />
              <p className="text-xs text-slate-500">No products published in catalog yet.</p>
              <button
                onClick={() => setStoreActiveTab("products")}
                className="px-3 py-1.5 rounded-lg bg-[#2E7D32] text-white text-xs font-bold"
              >
                Add First Product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {products.slice(0, 6).map((product) => (
                <div
                  key={product.id}
                  className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c121e] overflow-hidden shadow-xs hover:border-[#2E7D32]/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-28 w-full bg-slate-100 dark:bg-white/[0.02]">
                      <img
                        src={product.images[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80"}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-black/60 text-white backdrop-blur-md">
                          {product.grade || "Standard"}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-emerald-600 text-white">
                          {product.stock.toLocaleString()} {product.unit} Available
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5">
                      <span className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wider block">{product.sku}</span>
                      <h3 className="text-[12.5px] font-bold text-slate-900 dark:text-white line-clamp-1 mt-0.5" title={product.name}>
                        {product.name}
                      </h3>
                      <p className="text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        Origin: {product.origin || "Ethiopia"} • MOQ: {product.moq} {product.unit}
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 pt-0 border-t border-slate-100 dark:border-white/5 flex items-center justify-between mt-1.5">
                    <div>
                      <span className="text-[9.5px] text-slate-400 block">Unit Price</span>
                      <span className="font-mono font-bold text-[13px] text-slate-900 dark:text-white">
                        {product.basePrice.toLocaleString()} ETB <span className="text-[10px] font-normal text-slate-400">/{product.unit}</span>
                      </span>
                    </div>
                    <button
                      onClick={() => setStoreActiveTab("orders")}
                      className="h-[28px] px-2.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-[#2E7D32] dark:text-emerald-300 text-[10.5px] font-semibold hover:bg-emerald-100 cursor-pointer"
                    >
                      Negotiate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. TAB 3: ACCREDITATIONS & QUALITY SEALS                      */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "compliance" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">Accreditations & Quality Compliance</h2>
              <p className="text-[11.5px] text-slate-500 dark:text-zinc-400">
                Verified compliance standards for Ethiopian trade and international commodity export.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                title: "Ministry of Trade & Regional Integration",
                desc: "Verified commercial merchant registration and business license standing in Ethiopia.",
                certNo: profile?.licenseNumber ? `LIC-${profile.licenseNumber}` : "MOTRI-ETH-VERIFIED",
                validity: "Active Standing",
                icon: ShieldCheck,
              },
              {
                title: "Ministry of Revenues Tax Registry",
                desc: `Standard VAT clearance and verified taxpayer identification (TIN: ${profile?.tinNumber || "Registered"}).`,
                certNo: profile?.tinNumber ? `TIN-${profile.tinNumber}` : "MOR-TIN-VERIFIED",
                validity: "Tax Compliant",
                icon: FileCheck,
              },
              {
                title: "Ethiopian Commodity Standards (ECAE)",
                desc: "Conformity assessment and quality threshold inspection guarantee for B2B orders.",
                certNo: "ECAE-CES-101",
                validity: "Standard Passed",
                icon: Award,
              },
            ].map((seal, idx) => {
              const Icon = seal.icon;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c121e] p-3 shadow-xs space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-[#2E7D32] flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                      VERIFIED
                    </span>
                  </div>

                  <div>
                    <h3 className="text-[12.5px] font-bold text-slate-900 dark:text-white leading-tight">{seal.title}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{seal.desc}</p>
                  </div>

                  <div className="pt-1.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10.5px] font-mono text-slate-600 dark:text-zinc-400">
                    <span>{seal.certNo}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{seal.validity}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 6. TAB 4: LOGISTICS CORRIDORS & DEPOT NETWORK                */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "logistics" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">Regional Warehouse Hubs & Freight Corridors ({warehouses.length})</h2>
              <p className="text-[11.5px] text-slate-500 dark:text-zinc-400">
                Operating distribution centers connected to your real backend inventory management.
              </p>
            </div>
            <button
              onClick={() => setStoreActiveTab("warehouse")}
              className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#2E7D32] hover:underline cursor-pointer"
            >
              <span>Manage Network</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {warehouses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/10 p-8 text-center space-y-3">
              <WarehouseIcon className="h-8 w-8 text-slate-400 mx-auto opacity-50" />
              <p className="text-xs text-slate-500">No regional warehouses registered yet.</p>
              <button
                onClick={() => setStoreActiveTab("warehouse")}
                className="px-3 py-1.5 rounded-lg bg-[#2E7D32] text-white text-xs font-bold"
              >
                Add First Warehouse
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {warehouses.map((wh) => (
                <div
                  key={wh.id}
                  className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c121e] p-3 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-zinc-300">
                      {wh.code}
                    </span>
                    <span className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Activity className="h-2.5 w-2.5" />
                      Active
                    </span>
                  </div>

                  <div>
                    <h3 className="text-[12.5px] font-bold text-slate-900 dark:text-white truncate" title={wh.name}>
                      {wh.name}
                    </h3>
                    <p className="text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                      {wh.address}, {wh.city}
                    </p>
                  </div>

                  <div className="p-1.5 rounded bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-1 text-[10.5px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Capacity:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                        {wh.usedCapacityM2.toLocaleString()} / {wh.totalCapacityM2.toLocaleString()} m³
                      </span>
                    </div>
                    <div className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2E7D32]"
                        style={{ width: `${Math.round((wh.usedCapacityM2 / wh.totalCapacityM2) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-0.5 text-[10.5px] text-slate-600 dark:text-zinc-400 flex justify-between font-mono">
                    <span>Lead: {wh.managerName.split(" ")[0]}</span>
                    <span>{wh.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 7. TAB 5: WHOLESALE COMMERCIAL TERMS & POLICIES               */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "commercial" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-8 space-y-3">
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c121e] p-3.5 shadow-xs space-y-2.5">
              <h3 className="text-[13px] font-bold text-slate-900 dark:text-white pb-1.5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <span>Wholesale Transaction & Settlement Terms</span>
                <span className="text-[10.5px] font-semibold text-emerald-600">MercatoX Protected</span>
              </h3>

              <div className="space-y-2 text-[12px]">
                <div className="p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/10 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-900 dark:text-emerald-200 text-[12.5px] block">
                      Minimum Order Value (MOV)
                    </span>
                    <span className="text-[10.5px] text-emerald-700 dark:text-emerald-400">
                      Wholesale purchase orders below this threshold require express supplier quotation approval.
                    </span>
                  </div>
                  <span className="font-mono font-bold text-[16px] text-emerald-700 dark:text-emerald-300 shrink-0">
                    ETB {(profile?.minOrderValueETB || 50000).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                  <div className="p-2.5 rounded-lg border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Escrow Settlement</span>
                    <p className="font-bold text-slate-900 dark:text-white text-[12.5px] mt-0.5">100% Escrow Protected</p>
                    <p className="text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      Funds securely held until electronic proof of delivery (POD) inspection.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Standard Lead Time</span>
                    <p className="font-bold text-slate-900 dark:text-white text-[12.5px] mt-0.5">
                      {profile?.defaultLeadTimeDays || 3} Business Days
                    </p>
                    <p className="text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      Average dispatch time from verified regional logistics depots.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-3">
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c121e] p-3.5 shadow-xs space-y-2">
              <h3 className="text-[12.5px] font-bold text-slate-900 dark:text-white pb-1.5 border-b border-slate-100 dark:border-white/5 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-[#2E7D32]" />
                Buyer Protection Guarantee
              </h3>
              <p className="text-[11.5px] text-slate-600 dark:text-zinc-300 leading-relaxed">
                All transactions entered with {profile?.businessName || "this supplier"} are shielded by the MercatoX B2B Mediation & Tripartite Escrow framework. Goods inspected for quality and moisture compliance before payout release.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 8. EDIT PROFILE MODAL WITH BACKEND DATABASE SYNC             */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c121e] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Edit2 className="h-3.5 w-3.5 text-[#2E7D32]" />
                <h3 className="text-[14px] font-bold text-slate-900 dark:text-white">
                  Edit Supplier Business Profile
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-4 space-y-3 overflow-y-auto text-[11.5px] flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Business Name */}
                <div className="sm:col-span-2">
                  <label className="block text-[11.5px] font-semibold text-slate-700 dark:text-zinc-200 mb-1">
                    Enterprise Legal Business Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.businessName}
                    onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                    className="w-full h-[34px] rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 text-[12px] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#2E7D32]"
                    required
                  />
                </div>

                {/* Legal Entity Structure */}
                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-700 dark:text-zinc-200 mb-1">
                    Legal Entity / Business Type
                  </label>
                  <input
                    type="text"
                    value={editForm.legalEntity}
                    onChange={(e) => setEditForm({ ...editForm, legalEntity: e.target.value })}
                    placeholder="e.g. Private Limited Company (PLC), Share Company"
                    className="w-full h-[34px] rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 text-[12px] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#2E7D32]"
                  />
                </div>

                {/* Tagline */}
                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-700 dark:text-zinc-200 mb-1">
                    Storefront Commercial Tagline
                  </label>
                  <input
                    type="text"
                    value={editForm.tagline}
                    onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
                    className="w-full h-[34px] rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 text-[12px] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#2E7D32]"
                  />
                </div>

                {/* TIN Number */}
                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-700 dark:text-zinc-200 mb-1">
                    TIN Number (የግብር ከፋይ ቁጥር)
                  </label>
                  <input
                    type="text"
                    value={editForm.tinNumber}
                    onChange={(e) => setEditForm({ ...editForm, tinNumber: e.target.value })}
                    className="w-full h-[34px] rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 font-mono text-[12px] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#2E7D32]"
                    placeholder="e.g. 0019283419"
                  />
                </div>

                {/* Trade License */}
                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-700 dark:text-zinc-200 mb-1">
                    Trade License Number
                  </label>
                  <input
                    type="text"
                    value={editForm.licenseNumber}
                    onChange={(e) => setEditForm({ ...editForm, licenseNumber: e.target.value })}
                    className="w-full h-[34px] rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 font-mono text-[12px] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#2E7D32]"
                    placeholder="e.g. ETH-TL-2024-9921"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-[11.5px] font-semibold text-slate-700 dark:text-zinc-200 mb-1">
                    Corporate Narrative & Description
                  </label>
                  <textarea
                    rows={2}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] p-2 text-[11.5px] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#2E7D32]"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-700 dark:text-zinc-200 mb-1">
                    Telephone Desk <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full h-[34px] rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 font-mono text-[12px] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#2E7D32]"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-700 dark:text-zinc-200 mb-1">
                    Official Procurement Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full h-[34px] rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 font-mono text-[12px] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#2E7D32]"
                    required
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-700 dark:text-zinc-200 mb-1">
                    Official Website URL
                  </label>
                  <input
                    type="text"
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                    className="w-full h-[34px] rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 text-[12px] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#2E7D32]"
                    placeholder="e.g. https://myenterprise.et"
                  />
                </div>

                {/* Executive Lead */}
                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-700 dark:text-zinc-200 mb-1">
                    Authorized Managing Director
                  </label>
                  <input
                    type="text"
                    value={editForm.executiveName}
                    onChange={(e) => setEditForm({ ...editForm, executiveName: e.target.value })}
                    className="w-full h-[34px] rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 text-[12px] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#2E7D32]"
                  />
                </div>

                {/* HQ Address */}
                <div className="sm:col-span-2">
                  <label className="block text-[11.5px] font-semibold text-slate-700 dark:text-zinc-200 mb-1">
                    Headquarters Physical Address / Location
                  </label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full h-[34px] rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 text-[12px] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#2E7D32]"
                    placeholder="e.g. Kirkos Sub-City, Debre Zeyit Road"
                  />
                </div>

                {/* MOV */}
                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-700 dark:text-zinc-200 mb-1">
                    Minimum Order Value (ETB)
                  </label>
                  <input
                    type="number"
                    value={editForm.minOrderValueETB}
                    onChange={(e) => setEditForm({ ...editForm, minOrderValueETB: Number(e.target.value) })}
                    className="w-full h-[34px] rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 font-mono text-[12px] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#2E7D32]"
                  />
                </div>

                {/* Lead Time */}
                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-700 dark:text-zinc-200 mb-1">
                    Lead Time (Days)
                  </label>
                  <input
                    type="number"
                    value={editForm.defaultLeadTimeDays}
                    onChange={(e) => setEditForm({ ...editForm, defaultLeadTimeDays: Number(e.target.value) })}
                    className="w-full h-[34px] rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 font-mono text-[12px] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#2E7D32]"
                  />
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSaving}
                  className="h-[32px] px-3.5 rounded-md border border-slate-200 dark:border-white/10 text-[11.5px] font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="h-[32px] px-4 rounded-md bg-[#2E7D32] hover:bg-[#256629] text-white text-[11.5px] font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  <span>{isSaving ? "Saving to Database..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

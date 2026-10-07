"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { useSupplierStore } from "@/store/supplier-store";
import { toast } from "sonner";

export function SupplierProfileView() {
  const { profile, updateProfile, setActiveTab: setStoreActiveTab, warehouses, products } = useSupplierStore();

  const [activeTab, setActiveTab] = useState<"dossier" | "catalog" | "compliance" | "logistics" | "commercial">("dossier");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    businessName: profile.businessName,
    tagline: profile.tagline || "Leading Ethiopian Agricultural Aggregator & ECX Registered Commodity Exporter",
    description: profile.description,
    phone: profile.phone,
    email: profile.email,
    website: profile.website,
    address: profile.address,
    city: profile.city,
    region: profile.region,
    minOrderValueETB: profile.minOrderValueETB,
    executiveName: profile.executiveName || "Ato Kassahun Tessema",
    executiveTitle: profile.executiveTitle || "Commercial Operations Director",
    defaultLeadTimeDays: profile.defaultLeadTimeDays || 3,
  });

  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(`https://mercatox.et/supplier/${profile.storeSlug || "abyssinia-commodities"}`);
    setCopiedLink(true);
    toast.success("Verified Storefront URL copied to clipboard");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      businessName: editForm.businessName,
      tagline: editForm.tagline,
      description: editForm.description,
      phone: editForm.phone,
      email: editForm.email,
      website: editForm.website,
      address: editForm.address,
      city: editForm.city,
      region: editForm.region,
      minOrderValueETB: Number(editForm.minOrderValueETB) || profile.minOrderValueETB,
      executiveName: editForm.executiveName,
      executiveTitle: editForm.executiveTitle,
      defaultLeadTimeDays: Number(editForm.defaultLeadTimeDays) || 3,
    });
    setIsEditModalOpen(false);
    toast.success("Enterprise profile updated successfully!");
  };

  return (
    <div className="max-w-[960px] mx-auto w-full space-y-3 px-2 sm:px-4">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. SLIGHTLY MORE COMPACT MODERN HERO BANNER                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c121e] overflow-hidden shadow-xs">
        {/* Cover backdrop (h-28 sm:h-32 - tuned down from h-44) */}
        <div className="relative h-28 sm:h-32 w-full bg-slate-900 overflow-hidden">
          <img
            src={profile.coverUrl}
            alt="Storefront cover"
            className="h-full w-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c121e] via-[#0c121e]/50 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(46,125,50,0.22),transparent_60%)]" />

          {/* Top floating badges */}
          <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-500/20 text-emerald-300 backdrop-blur-md border border-emerald-400/40">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span>{profile.verificationBadge}</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-medium bg-black/50 text-zinc-200 backdrop-blur-md border border-white/15">
              <Sparkles className="h-2.5 w-2.5 text-amber-400" />
              <span>ECX Seat #108</span>
            </span>
          </div>
        </div>

        {/* Brand identity & Actions (Tuned down sizes) */}
        <div className="px-3.5 sm:px-4.5 pb-3 pt-0 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between -mt-9 sm:-mt-11 mb-2.5 gap-3">
            {/* Logo + Titles */}
            <div className="flex items-end gap-3">
              <div className="relative h-16 w-16 sm:h-18 sm:w-18 rounded-lg border-2 border-white dark:border-[#0c121e] bg-white p-0.5 shadow-sm overflow-hidden shrink-0">
                <img
                  src={profile.logoUrl}
                  alt={profile.businessName}
                  className="h-full w-full object-cover rounded-md"
                />
                <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0c121e]" title="Active Online" />
              </div>

              <div className="pb-0.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[18px] sm:text-[20px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                    {profile.businessName}
                  </h1>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                    Tier 3 Verified
                  </span>
                </div>

                <p className="text-[11.5px] sm:text-[12px] text-slate-600 dark:text-zinc-300 font-medium mt-0.5 line-clamp-1">
                  {profile.tagline || "Leading Ethiopian Agricultural Aggregator & ECX Registered Commodity Exporter"}
                </p>

                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10.5px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                  <span>TIN: <strong className="text-slate-700 dark:text-zinc-200">{profile.tinNumber}</strong></span>
                  <span>•</span>
                  <span>Lic: <strong className="text-slate-700 dark:text-zinc-200">{profile.licenseNumber}</strong></span>
                  <span>•</span>
                  <span>{profile.legalEntity}</span>
                  <span>•</span>
                  <span>Est. {profile.establishedYear} ({2026 - profile.establishedYear} Yrs)</span>
                </div>
              </div>
            </div>

            {/* Header Action Buttons (h-32px to h-34px) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 h-[32px] sm:h-[34px] px-3 rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] text-[11.5px] font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="h-3 w-3 text-emerald-500" /> : <Share2 className="h-3 w-3 text-slate-400" />}
                <span>{copiedLink ? "Copied" : "Share"}</span>
              </button>

              <button
                onClick={() => toast.success("Generating verified enterprise factsheet PDF...")}
                className="inline-flex items-center gap-1.5 h-[32px] sm:h-[34px] px-3 rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] text-[11.5px] font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <Download className="h-3 w-3 text-slate-400" />
                <span className="hidden sm:inline">Factsheet</span>
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

          {/* 4 Micro-Stats Bar (Tuned down padding & icons) */}
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2 rounded-lg bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9.5px] text-slate-400 block uppercase tracking-wider font-semibold">Volume Settled</span>
                <span className="text-[13px] font-bold font-mono text-slate-900 dark:text-white leading-tight">48.5M ETB</span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              </div>
              <div className="min-w-0">
                <span className="text-[9.5px] text-slate-400 block uppercase tracking-wider font-semibold">Buyer Rating</span>
                <span className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">4.9 ★ <span className="text-[10px] font-normal text-slate-400">(140+)</span></span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Building2 className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9.5px] text-slate-400 block uppercase tracking-wider font-semibold">Hub Network</span>
                <span className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">{warehouses.length} Active Hubs</span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9.5px] text-slate-400 block uppercase tracking-wider font-semibold">CBE Escrow</span>
                <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400 leading-tight">100% Protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. COMPACT SEGMENTED NAVIGATION TABS (h-32px)                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/5 overflow-x-auto text-[11.5px]">
        {[
          { id: "dossier", label: "Company Dossier", icon: Building2 },
          { id: "catalog", label: "Commodities & Inventory", icon: Package },
          { id: "compliance", label: "Quality Seals", icon: Award },
          { id: "logistics", label: "Depots & Corridors", icon: Truck },
          { id: "commercial", label: "Wholesale Terms", icon: Briefcase },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 h-[30px] sm:h-[32px] px-3 rounded-md whitespace-nowrap font-medium transition-all cursor-pointer ${isActive
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
      {/* 3. TAB 1: COMPANY DOSSIER (Tuned down card padding p-3.5)      */}
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
                {profile.description}
              </p>

              {/* 3 Highlight Capability Badges (Compact) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div className="p-2.5 rounded-lg border border-slate-100 dark:border-white/5 bg-slate-50/60 dark:bg-white/[0.02]">
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white block">Coffee & Spices</span>
                  <span className="text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5 block">SCA certified 88+ cup lots with hermetic packaging.</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 dark:border-white/5 bg-slate-50/60 dark:bg-white/[0.02]">
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white block">Teff & Grain</span>
                  <span className="text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5 block">Machine laser cleaned 99.8% pure Magna grain.</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 dark:border-white/5 bg-slate-50/60 dark:bg-white/[0.02]">
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white block">Cold Storage</span>
                  <span className="text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5 block">Climate controlled silos across 4 regional hubs.</span>
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
                  Fayda Verified
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-white/[0.02] gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-full bg-emerald-700 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                    KT
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">
                      {profile.executiveName || "Ato Kassahun Tessema"}
                    </h3>
                    <p className="text-[11.5px] text-slate-500 dark:text-zinc-400">
                      {profile.executiveTitle || "Commercial Operations Director"}
                    </p>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                      <Shield className="h-2.5 w-2.5" />
                      Digital ID (FAN-9921-4821) Active
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end gap-0.5 text-[11px] font-mono">
                  <span className="text-slate-600 dark:text-zinc-300">{profile.phone}</span>
                  <span className="text-slate-400 truncate max-w-[190px]">{profile.email}</span>
                </div>
              </div>
            </div>

            {/* CBE Escrow Settlement Partner Card */}
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 shadow-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-emerald-200/60 dark:border-emerald-500/20 mb-2">
                <div className="flex items-center gap-1.5">
                  <Landmark className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                  <span className="text-[12.5px] font-bold text-emerald-900 dark:text-emerald-200">
                    Commercial Bank of Ethiopia (CBE) Escrow Trust Partner
                  </span>
                </div>
                <span className="text-[9.5px] font-mono font-bold bg-emerald-600 text-white px-2 py-0.5 rounded">
                  ESCROW ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11.5px]">
                <div>
                  <span className="text-[10.5px] text-emerald-700 dark:text-emerald-400 block">Trust Account No:</span>
                  <span className="font-mono font-bold text-emerald-900 dark:text-emerald-100">CBE-ESC-1000-4829-1920</span>
                </div>
                <div>
                  <span className="text-[10.5px] text-emerald-700 dark:text-emerald-400 block">Settlement Branch:</span>
                  <span className="font-semibold text-emerald-900 dark:text-emerald-100">CBE Finfine Main Branch</span>
                </div>
                <div>
                  <span className="text-[10.5px] text-emerald-700 dark:text-emerald-400 block">Release Condition:</span>
                  <span className="font-semibold text-emerald-900 dark:text-emerald-100">Signed POD Delivery Note</span>
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
                <span className="text-[10.5px] font-mono text-slate-400">Addis Ababa</span>
              </h3>

              <div className="space-y-2 text-[11.5px]">
                <div className="p-2 rounded-lg border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium mb-0.5">Corporate Address</span>
                  <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                    {profile.address}
                  </p>
                  <p className="text-slate-500 dark:text-zinc-400 text-[10.5px] mt-0.5">
                    {profile.city}, {profile.region}, {profile.country}
                  </p>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-blue-500" />
                    <span>Telephone Desk</span>
                  </span>
                  <a href={`tel:${profile.phone}`} className="font-mono font-semibold text-slate-800 dark:text-zinc-200 hover:text-[#2E7D32]">
                    {profile.phone}
                  </a>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-amber-500" />
                    <span>Official Email</span>
                  </span>
                  <a href={`mailto:${profile.email}`} className="font-mono font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[170px] hover:text-[#2E7D32]" title={profile.email}>
                    {profile.email}
                  </a>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Globe className="h-3 w-3 text-indigo-500" />
                    <span>Web Portal</span>
                  </span>
                  <a href={profile.website} target="_blank" rel="noreferrer" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                    <span>{profile.website.replace("https://", "")}</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>

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
                <span className="text-[10px] text-emerald-600 font-semibold">Active</span>
              </h3>

              <div className="space-y-1 text-[11.5px]">
                <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500 dark:text-zinc-400">TIN Number (የግብር ከፋይ ቁጥር)</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{profile.tinNumber}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500 dark:text-zinc-400">Principal Trade License</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{profile.licenseNumber}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500 dark:text-zinc-400">VAT Registration</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-zinc-200">15% Standard VAT</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500 dark:text-zinc-400">Commercial Registration</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-zinc-200">MOTRI-ETH-2014-9912</span>
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
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">Active Wholesale Product Lines</h2>
              <p className="text-[11.5px] text-slate-500 dark:text-zinc-400">
                Current inventory lots aggregated, graded, and available for contract negotiation.
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
                        {product.grade || "Grade 1"}
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
                      Origin: {product.origin} • MOQ: {product.moq} {product.unit}
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
                    Negotiate Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. TAB 3: ACCREDITATIONS & QUALITY SEALS (Tuned down padding)   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === "compliance" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">Accreditations & Quality Compliance Seals</h2>
              <p className="text-[11.5px] text-slate-500 dark:text-zinc-400">
                Verified inspection seals by Ministry of Trade, ECX, and international sustainability certifiers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                title: "Ethiopian Commodity Exchange (ECX)",
                desc: "Certified Member Seat #108 for coffee, sesame, pulses, and white teff contract clearing.",
                certNo: "ECX-SEAT-2026-00108",
                validity: "Valid through Dec 2026",
                icon: Award,
              },
              {
                title: "ISO 22000 Food Safety System",
                desc: "International food hygiene, moisture threshold testing, and hermetic warehouse grading.",
                certNo: "ISO-FSMS-992144",
                validity: "Audited Annual 2026",
                icon: ShieldCheck,
              },
              {
                title: "Fair Trade International Aggregator",
                desc: "Ethical farmer co-op aggregation, premium community floor pricing signoff.",
                certNo: "FT-AGR-ETH-8910",
                validity: "Certified Active",
                icon: CheckCircle2,
              },
              {
                title: "Rainforest Alliance Sustainable Agriculture",
                desc: "Environmental soil preservation and biodiverse shade-grown Arabica certification.",
                certNo: "RA-ETH-COF-3321",
                validity: "Verified Harvest 2026",
                icon: Sparkles,
              },
              {
                title: "Ethiopian Conformity Assessment (ECAE)",
                desc: "National compulsory quality standard for building materials, grain purity & testing.",
                certNo: "ECAE-STD-4402",
                validity: "CES 101 Standard",
                icon: FileCheck,
              },
              {
                title: "Customs Bonded Dry Port Operator",
                desc: "Authorized cross-border transit and multi-modal container stripping authorization.",
                certNo: "CUS-ETH-MODJO-882",
                validity: "Customs Verified",
                icon: Landmark,
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
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">Regional Warehouse Hubs & Freight Corridors</h2>
              <p className="text-[11.5px] text-slate-500 dark:text-zinc-400">
                Operating multi-hub distribution centers with live environmental telemetry and loading docks.
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

          {/* Shipping Corridors Banner */}
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c121e] p-3 shadow-xs">
            <span className="text-[12.5px] font-bold text-slate-900 dark:text-white block mb-1.5 flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-[#2E7D32]" />
              Covered Ethiopian Multi-Modal Corridors
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {profile.shippingRegions.map((region, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 p-1.5 rounded-lg border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] text-[11.5px] text-slate-700 dark:text-zinc-300"
                >
                  <MapPin className="h-3 w-3 text-indigo-500 shrink-0" />
                  <span>{region}</span>
                </div>
              ))}
            </div>
          </div>
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
                      Wholesale purchase orders below this threshold require express supplier exemption.
                    </span>
                  </div>
                  <span className="font-mono font-bold text-[16px] text-emerald-700 dark:text-emerald-300 shrink-0">
                    ETB {profile.minOrderValueETB.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                  <div className="p-2.5 rounded-lg border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Escrow Settlement</span>
                    <p className="font-bold text-slate-900 dark:text-white text-[12.5px] mt-0.5">100% CBE Escrow Protected</p>
                    <p className="text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      Funds held by CBE until physical weighbridge delivery signoff.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Lead Time</span>
                    <p className="font-bold text-slate-900 dark:text-white text-[12.5px] mt-0.5">2–4 Business Days</p>
                    <p className="text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      Fast-track road freight departure from our Addis and Modjo depots.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Standard Incoterms</span>
                    <p className="font-bold text-slate-900 dark:text-white text-[12.5px] mt-0.5">FCA Warehouse / DAP Site</p>
                    <p className="text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      Carrier coordination supported across all primary Ethiopian trade zones.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Tax Invoicing</span>
                    <p className="font-bold text-slate-900 dark:text-white text-[12.5px] mt-0.5">15% Standard VAT Invoice</p>
                    <p className="text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      Electronic tax clearance issued upon payment release.
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
                All transactions entered with {profile.businessName} are shielded by the MercatoX B2B Mediation & CBE Escrow framework. Goods inspected for moisture, purity, and grade compliance before payout release.
              </p>
              <div className="pt-1.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10.5px] font-medium text-emerald-600">
                <span>0% Historical Disputes</span>
                <span>100% Signed POD Rate</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 8. EDIT PROFILE MODAL (Compact Dialog)                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c121e] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Edit2 className="h-3.5 w-3.5 text-[#2E7D32]" />
                <h3 className="text-[14px] font-bold text-slate-900 dark:text-white">
                  Edit Supplier Storefront Profile
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
                    Enterprise Legal Business Name
                  </label>
                  <input
                    type="text"
                    value={editForm.businessName}
                    onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                    className="w-full h-[34px] rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 text-[12px] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#2E7D32]"
                    required
                  />
                </div>

                {/* Tagline */}
                <div className="sm:col-span-2">
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
                    Telephone Desk
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
                    Official Procurement Email
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
                    Headquarters Physical Address
                  </label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full h-[34px] rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] px-2.5 text-[12px] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#2E7D32]"
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
                  className="h-[32px] px-3.5 rounded-md border border-slate-200 dark:border-white/10 text-[11.5px] font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-[32px] px-4 rounded-md bg-[#2E7D32] hover:bg-[#256629] text-white text-[11.5px] font-semibold cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

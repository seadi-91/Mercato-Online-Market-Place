"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft,
  Building2,
  Truck,
  Users,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MapPin,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  ZoomIn,
  BadgeCheck,
  UserCheck,
  RefreshCw,
  X,
  Calendar,
  Clock,
  ShieldAlert,
  IdCard,
  CreditCard,
  Warehouse,
  Boxes,
  Eye,
  Check,
  Download,
  Info,
  ShoppingBag,
  Receipt,
  History,
  Sparkles,
  PackageCheck,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  adminSupplierService,
  type SupplierStaff,
} from "@/features/admin/services/admin.service";
import { useThemeStore } from "@/store/theme-store";

interface AdminSupplierDetailProps {
  supplierId: string;
  onBack: () => void;
}

type DetailTab = "overview" | "staff" | "catalog" | "orders" | "audit";

export function AdminSupplierDetail({
  supplierId,
  onBack,
}: AdminSupplierDetailProps) {
  const { theme } = useThemeStore();
  const isLight = theme === "light";
  const isSystem = theme === "system";
  const isDark = !isLight && !isSystem;

  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [profile, setProfile] = useState<any>(null);
  const [staffList, setStaffList] = useState<SupplierStaff[]>([]);
  const [loading, setLoading] = useState(true);

  // Lightbox modal for previewing rectangular document images
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    title: string;
  } | null>(null);

  // KYC modal state
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submittingKyc, setSubmittingKyc] = useState(false);

  // Status toggle modal state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [submittingStatus, setSubmittingStatus] = useState(false);

  // Theme-aware tokens strictly calibrated for System, Light, and Dark modes
  const cardBg = isLight
    ? "bg-white border-slate-200/90 shadow-sm"
    : isSystem
    ? "bg-[#0c1630] border-blue-500/25 shadow-xl shadow-blue-950/30"
    : "bg-[#141418] border-white/10 shadow-xl shadow-black/40";

  const subCardBg = isLight
    ? "bg-slate-50 border-slate-200 text-slate-800"
    : isSystem
    ? "bg-[#070e20] border-blue-500/20 text-blue-100"
    : "bg-black/40 border-white/10 text-zinc-200";

  const textHeading = isLight ? "text-slate-900" : isSystem ? "text-blue-50" : "text-white";
  const textSub = isLight ? "text-slate-700" : isSystem ? "text-blue-100/90" : "text-zinc-300";
  const textMuted = isLight ? "text-slate-500" : isSystem ? "text-blue-300/70" : "text-zinc-400";
  const borderDivider = isLight ? "border-slate-200" : isSystem ? "border-blue-500/20" : "border-white/10";
  const hoverRowBg = isLight ? "hover:bg-slate-100/70" : isSystem ? "hover:bg-blue-900/25" : "hover:bg-white/[0.04]";
  const neutralBtn = isLight
    ? "border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-xs"
    : isSystem
    ? "border-blue-500/30 bg-[#091330] hover:bg-blue-900/40 text-blue-200"
    : "border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300";

  // Load supplier details & staff from backend
  const loadSupplierData = async () => {
    try {
      setLoading(true);
      const [detailsData, staffData] = await Promise.all([
        adminSupplierService.getSupplierDetails(supplierId).catch((e) => {
          console.warn("Supplier details error:", e?.message);
          return null;
        }),
        adminSupplierService.getSupplierStaff(supplierId).catch((e) => {
          console.warn("Supplier staff error:", e?.message);
          return [];
        }),
      ]);
      if (detailsData) {
        setProfile(detailsData);
      }
      setStaffList(staffData || []);
    } catch (err: any) {
      console.warn("Failed to load supplier details:", err?.message || err);
      toast.error("Failed to load supplier profile from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupplierData();
  }, [supplierId]);

  // Handle KYC Moderation (Approve / Reject)
  const handleVerifyKyc = async (isVerified: boolean) => {
    if (!profile) return;
    setSubmittingKyc(true);
    try {
      await adminSupplierService.verifyMerchant(
        profile.userId,
        isVerified,
        !isVerified ? rejectionReason || "Incomplete documentation" : undefined
      );
      toast.success(
        isVerified
          ? `Verified & Activated ${profile.shopName || profile.fullName} successfully`
          : `Rejected application for ${profile.shopName || profile.fullName}. Account converted to Customer.`
      );
      setIsKycModalOpen(false);
      setRejectionReason("");
      loadSupplierData();
    } catch {
      toast.error("Failed to update merchant verification");
    } finally {
      setSubmittingKyc(false);
    }
  };

  // Handle Account Status Toggle (Suspend / Activate)
  const handleToggleStatus = async () => {
    if (!profile) return;
    setSubmittingStatus(true);
    const targetStatus = !profile.isActive;
    try {
      await adminSupplierService.setUserStatus(
        profile.userId,
        targetStatus,
        !targetStatus ? suspensionReason || "Admin manual suspension" : undefined
      );
      toast.success(
        targetStatus
          ? `Activated supplier ${profile.shopName || profile.fullName}`
          : `Suspended supplier ${profile.shopName || profile.fullName}`
      );
      setIsStatusModalOpen(false);
      setSuspensionReason("");
      loadSupplierData();
    } catch {
      toast.error("Failed to update supplier account status");
    } finally {
      setSubmittingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center py-28 rounded-2xl border ${cardBg} space-y-4`}>
        <RefreshCw className="h-9 w-9 animate-spin text-indigo-500" />
        <div className="text-center">
          <p className={`text-sm font-bold ${textHeading}`}>Loading Supplier Records...</p>
          <p className={`text-xs ${textMuted} mt-0.5`}>Querying PostgreSQL &amp; compliance storage for {supplierId}</p>
        </div>
      </div>
    );
  }

  if (!profile || profile.error) {
    return (
      <div className={`rounded-2xl border p-10 text-center space-y-4 ${cardBg}`}>
        <Building2 className={`mx-auto h-12 w-12 ${textMuted}`} />
        <h2 className={`text-lg font-bold ${textHeading}`}>Supplier Profile Not Found</h2>
        <p className={`text-xs ${textMuted} max-w-md mx-auto`}>
          The requested supplier record could not be found or has been deleted from the database.
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/25 transition-all cursor-pointer active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Suppliers List</span>
        </button>
      </div>
    );
  }

  // 4 Core Rectangular Compliance Documents
  const documents = [
    {
      title: "Trade / Business License",
      type: "Trade License",
      docNumber: profile.tradeLicenseNumber,
      url: profile.businessLicenseUrl,
      description: "Official renewed trade, import or manufacturing license issued by the Ministry of Trade",
      icon: Building2,
    },
    {
      title: "Tax Identification Certificate (TIN)",
      type: "TIN Certificate",
      docNumber: profile.tinNumber,
      url: profile.tinCertificateUrl,
      description: "Ministry of Revenue official taxpayer identification certificate (10 digits)",
      icon: CreditCard,
    },
    {
      title: "Commercial Registration (MOTRI)",
      type: "Commercial Registration",
      docNumber: profile.tradeLicenseNumber,
      url: profile.commercialRegistrationUrl,
      description: "Principal commercial registration certificate issued by MOTRI",
      icon: FileText,
    },
    {
      title: "Owner / Manager Fayda ID",
      type: "Owner ID",
      docNumber: profile.nationalIdNumber || profile.nationalIdOrFayda,
      url: profile.ownerIdUrl,
      description: "National biometric Fayda ID or passport of the authorized representative",
      icon: IdCard,
    },
  ];

  const totalDrivers = staffList.filter((s) => s.role === "driver").length;
  const totalManagers = staffList.filter((s) => s.role === "branch_manager").length;
  const isPendingKyc = profile.merchantKycStatus === "PENDING";
  const isApprovedKyc = profile.isVerifiedMerchant || profile.merchantKycStatus === "APPROVED";
  const isRejectedKyc = profile.merchantKycStatus === "REJECTED";

  const recentProducts = profile.stats?.recentProducts || [];
  const recentOrders = profile.stats?.recentOrders || [];
  const auditLogs = profile.auditLogs || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 1. TOP HEADER & BREADCRUMB NAVIGATION                                    */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b ${borderDivider} pb-4`}>
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-all cursor-pointer active:scale-95 shrink-0 ${neutralBtn}`}
            title="Return to Suppliers List"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <div className={`flex items-center gap-2 text-xs ${textMuted} truncate`}>
              <span className="cursor-pointer hover:underline" onClick={onBack}>
                Suppliers &amp; Fleet
              </span>
              <span>/</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold truncate max-w-[220px]">
                {profile.shopName || profile.fullName}
              </span>
            </div>
            <h1 className={`text-xl sm:text-2xl font-bold ${textHeading} flex items-center gap-2 mt-0.5 truncate`}>
              <span className="truncate">{profile.shopName || profile.fullName}</span>
              {isApprovedKyc && (
                <span title="Verified Wholesale Merchant" className="shrink-0">
                  <BadgeCheck className="h-5 w-5 text-emerald-500" />
                </span>
              )}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={loadSupplierData}
            title="Refresh Supplier Data"
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all cursor-pointer ${neutralBtn}`}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* KYC Moderate Button */}
          <button
            onClick={() => setIsKycModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-3.5 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-300 transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Moderate KYC</span>
          </button>

          {/* Account Status Toggle Button */}
          <button
            onClick={() => setIsStatusModalOpen(true)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm ${
              profile.isActive
                ? "border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300"
                : "border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300"
            }`}
          >
            {profile.isActive ? (
              <>
                <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                <span>Suspend Account</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Activate Account</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 2. COMPLIANCE STATUS ALERT BANNERS                                        */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {isPendingKyc && (
        <div className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md ${
          isLight
            ? "border-indigo-200 bg-indigo-50/80 shadow-indigo-500/5"
            : isSystem
            ? "border-indigo-500/30 bg-[#0d1738] shadow-indigo-500/10"
            : "border-indigo-500/30 bg-indigo-950/25 shadow-indigo-500/5"
        }`}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shrink-0">
              <ShieldAlert className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-bold ${textHeading}`}>
                  Registration Under Review (KYC Pending)
                </span>
                <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-300">
                  Awaiting Admin Audit
                </span>
              </div>
              <p className={`text-xs ${textMuted} mt-0.5`}>
                This supplier has uploaded official licenses and certificates. Inspect the documents below and make an approval determination.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => handleVerifyKyc(true)}
              disabled={submittingKyc}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-500 text-neutral-950 hover:bg-emerald-400 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Approve Now</span>
            </button>
            <button
              type="button"
              onClick={() => setIsKycModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 transition-all cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reject</span>
            </button>
          </div>
        </div>
      )}

      {isRejectedKyc && (
        <div className={`rounded-2xl border p-4 flex items-start gap-3 shadow-md ${
          isLight
            ? "border-rose-300 bg-rose-50/80 shadow-rose-500/5"
            : isSystem
            ? "border-rose-500/30 bg-[#20101b] shadow-rose-500/10"
            : "border-rose-500/30 bg-rose-500/10 shadow-rose-500/5"
        }`}>
          <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${textHeading}`}>Application Rejected</span>
              <span className="rounded-full bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-300">
                Converted to Customer
              </span>
            </div>
            <p className={`text-xs ${textMuted} mt-1`}>
              Reason recorded: <strong className="text-rose-600 dark:text-rose-300">{profile.merchantRejectionReason || "Criteria not met"}</strong>
            </p>
            <p className={`text-[11px] ${textMuted} mt-0.5`}>
              The user can sign in as a standard marketplace Customer. To restore supplier access, click Moderate KYC to approve.
            </p>
          </div>
        </div>
      )}

      {isApprovedKyc && (
        <div className={`rounded-2xl border p-3.5 flex items-center justify-between gap-3 shadow-xs ${
          isLight
            ? "border-emerald-300 bg-emerald-50/80"
            : isSystem
            ? "border-emerald-500/30 bg-[#091f24]"
            : "border-emerald-500/30 bg-emerald-500/10"
        }`}>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <div className="text-xs">
              <span className={`font-bold ${textHeading}`}>Verified Wholesale Enterprise:</span>{" "}
              <span className={textMuted}>
                Trade license and taxpayer credentials authenticated for B2B supplier trading.
              </span>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-300 shrink-0">
            Active Merchant
          </span>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 3. KEY METRICS STRIP                                                      */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {/* Metric 1: KYC Status */}
        <div className={`rounded-2xl border p-3.5 ${cardBg}`}>
          <div className={`text-[11px] font-semibold ${textMuted}`}>KYC Status</div>
          <div className="mt-1.5 flex items-center gap-1.5">
            {isApprovedKyc ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verified
              </span>
            ) : isPendingKyc ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-500 dark:text-indigo-400">
                <AlertTriangle className="h-3.5 w-3.5" /> Pending
              </span>
            ) : isRejectedKyc ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-500">
                <XCircle className="h-3.5 w-3.5" /> Rejected
              </span>
            ) : (
              <span className={`text-xs font-semibold ${textMuted}`}>None</span>
            )}
          </div>
        </div>

        {/* Metric 2: Account Status */}
        <div className={`rounded-2xl border p-3.5 ${cardBg}`}>
          <div className={`text-[11px] font-semibold ${textMuted}`}>Account Status</div>
          <div className="mt-1.5 flex items-center gap-1.5">
            {profile.isActive ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-500">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Suspended
              </span>
            )}
          </div>
        </div>

        {/* Metric 3: Business Type */}
        <div className={`rounded-2xl border p-3.5 ${cardBg}`}>
          <div className={`text-[11px] font-semibold ${textMuted}`}>Business Type</div>
          <div className={`mt-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate`}>
            {profile.businessType || "Wholesaler"}
          </div>
        </div>

        {/* Metric 4: Catalog Products */}
        <div
          onClick={() => setActiveTab("catalog")}
          className={`rounded-2xl border p-3.5 ${cardBg} cursor-pointer hover:border-indigo-500/50 hover:shadow-indigo-500/10 transition-all`}
        >
          <div className={`text-[11px] font-semibold ${textMuted}`}>Catalog Items</div>
          <div className={`mt-1 text-base font-bold ${textHeading}`}>
            {profile.stats?.postedProducts ?? 0}{" "}
            <span className={`text-xs font-normal ${textMuted}`}>products</span>
          </div>
        </div>

        {/* Metric 5: Total Orders */}
        <div
          onClick={() => setActiveTab("orders")}
          className={`rounded-2xl border p-3.5 ${cardBg} cursor-pointer hover:border-indigo-500/50 hover:shadow-indigo-500/10 transition-all`}
        >
          <div className={`text-[11px] font-semibold ${textMuted}`}>Total Orders</div>
          <div className="mt-1 text-base font-bold text-indigo-600 dark:text-indigo-400">
            {profile.stats?.totalOrders ?? 0}{" "}
            <span className={`text-xs font-normal ${textMuted}`}>orders</span>
          </div>
        </div>

        {/* Metric 6: Personnel & Drivers */}
        <div
          onClick={() => setActiveTab("staff")}
          className={`rounded-2xl border p-3.5 ${cardBg} cursor-pointer hover:border-cyan-400/50 hover:shadow-cyan-500/10 transition-all`}
        >
          <div className={`text-[11px] font-semibold ${textMuted}`}>Personnel &amp; Fleet</div>
          <div className="mt-1 text-base font-bold text-cyan-600 dark:text-cyan-300">
            {staffList.length}{" "}
            <span className={`text-xs font-normal ${textMuted}`}>({totalDrivers} Drv)</span>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 4. NAVIGATION TABS (ACTIVE CHOOSE BACKGROUND WITH MERCATOX BRAND COLOR)    */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <div className={`flex items-center gap-1.5 p-1.5 rounded-2xl border ${borderDivider} ${subCardBg} overflow-x-auto scrollbar-none`}>
        {[
          { id: "overview", label: "Overview & Legal Identity", icon: Building2 },
          { id: "staff", label: `Personnel & Fleet (${staffList.length})`, icon: Users },
          { id: "catalog", label: `Catalog Items (${profile.stats?.postedProducts ?? 0})`, icon: ShoppingBag },
          { id: "orders", label: `Wholesale Orders (${profile.stats?.totalOrders ?? 0})`, icon: Receipt },
          { id: "audit", label: `Audit Trail (${auditLogs.length})`, icon: History },
        ].map((t) => {
          const isActive = activeTab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as DetailTab)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40 ring-1 ring-indigo-500/30"
                  : isLight
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-transparent"
                  : isSystem
                  ? "text-blue-200/80 hover:text-white hover:bg-blue-900/30 border border-transparent"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-cyan-300" : "opacity-75"}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: OVERVIEW & LEGAL IDENTITY (3-CARD GRID + 4 COMPLIANCE DOCS)        */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* 3 Detailed Profile Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1: Enterprise Profile & Identification */}
            <div className={`rounded-2xl border p-5 space-y-4 ${cardBg}`}>
              <div className={`flex items-center gap-2 border-b ${borderDivider} pb-3`}>
                <Building2 className="h-4 w-4 text-indigo-500" />
                <h2 className={`text-xs font-bold ${textHeading} uppercase tracking-wider`}>
                  Enterprise &amp; Corporate Identity
                </h2>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-1.5">
                  <span className={textMuted}>Company / Store Name</span>
                  <span className={`font-bold ${textHeading}`}>{profile.shopName || "—"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-1.5">
                  <span className={textMuted}>Business Classification</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{profile.businessType || "Wholesale Merchant"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-1.5">
                  <span className={textMuted}>Trade License Number</span>
                  <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{profile.tradeLicenseNumber || "—"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-1.5">
                  <span className={textMuted}>Tax ID (TIN / VAT)</span>
                  <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{profile.tinNumber || "—"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-1.5">
                  <span className={textMuted}>National / Fayda ID</span>
                  <span className={`font-medium ${textHeading}`}>{profile.nationalIdNumber || profile.nationalIdOrFayda || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={textMuted}>System User UUID</span>
                  <span className="font-mono text-[10px] text-zinc-500 truncate max-w-[150px]" title={profile.userId}>
                    {profile.userId}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Legal Representative & Contacts */}
            <div className={`rounded-2xl border p-5 space-y-4 ${cardBg}`}>
              <div className={`flex items-center gap-2 border-b ${borderDivider} pb-3`}>
                <UserCheck className="h-4 w-4 text-emerald-500" />
                <h2 className={`text-xs font-bold ${textHeading} uppercase tracking-wider`}>
                  Representative &amp; Contact
                </h2>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-1.5">
                  <span className={textMuted}>Legal Representative</span>
                  <span className={`font-bold ${textHeading}`}>{profile.fullName || "—"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-1.5">
                  <span className={textMuted}>Account Role</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-300 uppercase">
                    {profile.accountRole || profile.role || "SELLER"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-1.5">
                  <span className={textMuted}>Contact Mobile</span>
                  <span className={`font-medium ${textHeading}`}>
                    {profile.phoneNumber || profile.alternatePhone || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-1.5">
                  <span className={textMuted}>Email Address</span>
                  <span className={`font-medium ${textHeading} truncate max-w-[160px]`} title={profile.email}>
                    {profile.email || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-1.5">
                  <span className={textMuted}>Registration Date</span>
                  <span className={`font-medium ${textHeading}`}>
                    {profile.accountCreatedAt || profile.createdAt
                      ? new Date(profile.accountCreatedAt || profile.createdAt).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={textMuted}>Last Profile Update</span>
                  <span className={textMuted}>
                    {profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Logistics Depot & Geographical Hub */}
            <div className={`rounded-2xl border p-5 space-y-4 md:col-span-2 lg:col-span-1 ${cardBg}`}>
              <div className={`flex items-center gap-2 border-b ${borderDivider} pb-3`}>
                <MapPin className="h-4 w-4 text-cyan-500" />
                <h2 className={`text-xs font-bold ${textHeading} uppercase tracking-wider`}>
                  Logistics Depot &amp; Location
                </h2>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-1.5">
                  <span className={textMuted}>Primary City / Region</span>
                  <span className={`font-semibold ${textHeading}`}>{profile.city || "Addis Ababa"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-1.5">
                  <span className={textMuted}>Sub-City / District</span>
                  <span className={`font-medium ${textHeading}`}>{profile.subCity || "—"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-1.5">
                  <span className={textMuted}>Commercial Market Zone</span>
                  <span className={`font-medium ${textHeading}`}>{profile.marketZone || "—"}</span>
                </div>
                <div className="space-y-1 pt-0.5">
                  <span className={`block text-[11px] font-semibold ${textMuted}`}>
                    PHYSICAL WAREHOUSE / HUB ADDRESS
                  </span>
                  <div className={`rounded-xl border p-2.5 ${subCardBg} font-medium leading-relaxed`}>
                    {profile.specificLocation || "No physical street address recorded in database"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Rectangular Compliance Documents Gallery */}
          <div className={`rounded-2xl border p-5 space-y-4 ${cardBg}`}>
            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b ${borderDivider} pb-3`}>
              <div>
                <h2 className={`text-sm font-bold ${textHeading} flex items-center gap-2`}>
                  <FileText className="h-4 w-4 text-indigo-500" />
                  <span>Official Regulatory &amp; Compliance Documents</span>
                  <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-300">
                    Rectangular Previews (16:10)
                  </span>
                </h2>
                <p className={`text-xs ${textMuted} mt-0.5`}>
                  Authentic trade permits, tax identification, and corporate charters uploaded during supplier onboarding.
                </p>
              </div>
            </div>

            {/* 4 Rectangular Document Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {documents.map((doc, idx) => {
                const hasUrl = Boolean(doc.url);
                const isImage =
                  (hasUrl && /\.(jpg|jpeg|png|webp|svg|gif)($|\?)/i.test(doc.url)) ||
                  (hasUrl && doc.url.startsWith("data:image/")) ||
                  (hasUrl && doc.url.includes("cloudinary.com") && !doc.url.endsWith(".pdf"));
                const isPdf = hasUrl && (/\.pdf($|\?)/i.test(doc.url) || doc.url.startsWith("data:application/pdf"));
                const DocIcon = doc.icon;

                return (
                  <div
                    key={idx}
                    className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-200 ${
                      isLight
                        ? "bg-slate-50/70 border-slate-200 hover:border-indigo-400 hover:shadow-md"
                        : isSystem
                        ? "bg-[#0b142c] border-blue-500/20 hover:border-indigo-400 shadow-sm"
                        : "bg-[#0d121f] border-white/10 hover:border-indigo-500/40 shadow-sm"
                    } p-3.5`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <DocIcon className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                          <h3 className={`font-bold ${textHeading} text-xs truncate`} title={doc.title}>
                            {doc.title}
                          </h3>
                        </div>
                        {doc.docNumber && (
                          <div className="mt-1 text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold truncate">
                            Doc #: {doc.docNumber}
                          </div>
                        )}
                      </div>

                      {hasUrl && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                            isLight
                              ? "border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 shadow-xs"
                              : isSystem
                              ? "border-blue-500/30 bg-[#091330] hover:bg-blue-900/40 text-blue-200"
                              : "border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white"
                          }`}
                          title="Open document in new browser tab"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>

                    {/* THE 16:10 RECTANGULAR PREVIEW CONTAINER */}
                    <div
                      className={`relative w-full aspect-[16/10] overflow-hidden rounded-xl border flex items-center justify-center transition-all ${
                        isLight
                          ? "border-slate-200 bg-white"
                          : isSystem
                          ? "border-blue-500/20 bg-[#070d1e]"
                          : "border-white/10 bg-black/60"
                      }`}
                    >
                      {hasUrl && isImage ? (
                        <>
                          <img
                            src={doc.url}
                            alt={doc.title}
                            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                            onClick={() => setLightboxImage({ url: doc.url, title: doc.title })}
                          />
                          {/* Zoom Overlay */}
                          <div
                            onClick={() => setLightboxImage({ url: doc.url, title: doc.title })}
                            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[1px]"
                          >
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/90 border border-white/20 px-2.5 py-1 text-[11px] font-semibold text-white shadow-xl">
                              <ZoomIn className="h-3.5 w-3.5 text-cyan-400" />
                              <span>Click to Zoom</span>
                            </span>
                          </div>
                        </>
                      ) : hasUrl && isPdf ? (
                        <div className="flex flex-col items-center justify-center p-3 text-center space-y-1.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-500 font-bold text-xs">
                            PDF
                          </div>
                          <span className={`text-[11px] font-semibold ${textHeading}`}>Digital Document</span>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 px-2.5 py-1 text-[10px] font-bold text-rose-500 transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>Inspect PDF</span>
                          </a>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-3 text-center space-y-1">
                          <FileText className={`h-7 w-7 ${textMuted} stroke-[1.5]`} />
                          <span className={`text-[11px] font-medium ${textMuted}`}>Not Uploaded</span>
                        </div>
                      )}
                    </div>

                    {/* Footer status pill */}
                    <div className={`mt-3 pt-2 border-t ${borderDivider} flex items-center justify-between text-[10.5px]`}>
                      <span className={textMuted}>{doc.type}</span>
                      {hasUrl ? (
                        <span className="inline-flex items-center gap-1 text-emerald-500 font-bold shrink-0">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Uploaded</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 font-semibold shrink-0">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>Missing</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: REGISTERED PERSONNEL & LOGISTICS FLEET ROSTER                      */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeTab === "staff" && (
        <div className={`rounded-2xl border p-5 space-y-4 ${cardBg}`}>
          <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b ${borderDivider} pb-3`}>
            <div>
              <h2 className={`text-sm font-bold ${textHeading} flex items-center gap-2`}>
                <Users className="h-4 w-4 text-cyan-500" />
                <span>Registered Personnel &amp; Logistics Fleet Roster</span>
                <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 text-[10px] font-bold text-cyan-600 dark:text-cyan-300">
                  {staffList.length} Staff Record{staffList.length === 1 ? "" : "s"} ({totalDrivers} Drivers, {totalManagers} Managers)
                </span>
              </h2>
              <p className={`text-xs ${textMuted} mt-0.5`}>
                Warehouse branch managers and heavy freight vehicle drivers operating under this supplier profile.
              </p>
            </div>
          </div>

          {staffList.length === 0 ? (
            <div className={`py-12 text-center rounded-xl border border-dashed ${borderDivider} ${subCardBg}`}>
              <Users className={`mx-auto h-9 w-9 ${textMuted} mb-2`} />
              <p className={`text-xs font-bold ${textHeading}`}>No registered personnel records</p>
              <p className={`text-[11px] ${textMuted} mt-0.5`}>
                This supplier has not added any branch managers or fleet drivers to their corporate roster yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {staffList.map((staff) => {
                const isManager = staff.role === "branch_manager";
                const isDriver = staff.role === "driver";

                return (
                  <div
                    key={staff.id}
                    className={`rounded-2xl border p-4 transition-all flex flex-col justify-between space-y-3 ${
                      isLight
                        ? "bg-slate-50/70 border-slate-200 hover:border-slate-300"
                        : isSystem
                        ? "bg-[#0b142c] border-blue-500/20 hover:border-blue-400"
                        : "bg-[#0d121f] border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border font-bold text-sm ${
                          isManager
                            ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-500 dark:text-indigo-300"
                            : "bg-cyan-500/15 border-cyan-500/30 text-cyan-500 dark:text-cyan-300"
                        }`}
                      >
                        {isManager ? <UserCheck className="h-5 w-5" /> : <Truck className="h-5 w-5" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-bold ${textHeading} text-xs truncate`}>{staff.fullName}</h3>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              isManager
                                ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30"
                                : "bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30"
                            }`}
                          >
                            {isManager ? "Branch Manager" : "Fleet Driver"}
                          </span>
                          {staff.employeeId && (
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${subCardBg}`}>
                              {staff.employeeId}
                            </span>
                          )}
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              staff.status === "active"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {staff.status === "active" ? "Active" : "Suspended"}
                          </span>
                        </div>

                        <div className={`mt-1.5 text-xs ${textMuted} space-y-1`}>
                          {staff.branchName && (
                            <div className={`flex items-center gap-1 font-semibold ${textHeading}`}>
                              <Building2 className="h-3 w-3 text-indigo-500" />
                              <span>{staff.branchName}</span>
                            </div>
                          )}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                            {staff.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{staff.email}</span>
                              </span>
                            )}
                            {staff.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{staff.phone}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Driver vehicle details */}
                        {isDriver && (
                          <div className={`mt-2.5 rounded-xl border p-2 text-xs space-y-1 ${subCardBg}`}>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              {staff.assignedVehicleType && (
                                <span className={`font-semibold ${textHeading} flex items-center gap-1`}>
                                  <Truck className="h-3 w-3 text-cyan-500" />
                                  <span>{staff.assignedVehicleType}</span>
                                </span>
                              )}
                              {staff.assignedVehiclePlate && (
                                <span className="font-mono text-cyan-500 font-bold text-[11px] bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/30">
                                  {staff.assignedVehiclePlate}
                                </span>
                              )}
                              {staff.driverLicenseNumber && (
                                <span className={textMuted}>
                                  License: <strong className={textHeading}>{staff.driverLicenseNumber}</strong>
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: CATALOG PRODUCTS (WHOLESALE INVENTORY)                             */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeTab === "catalog" && (
        <div className={`rounded-2xl border p-5 space-y-4 ${cardBg}`}>
          <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b ${borderDivider} pb-3`}>
            <div>
              <h2 className={`text-sm font-bold ${textHeading} flex items-center gap-2`}>
                <ShoppingBag className="h-4 w-4 text-indigo-500" />
                <span>Supplier Wholesale Catalog</span>
                <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-300">
                  {profile.stats?.postedProducts ?? 0} Listed Product{profile.stats?.postedProducts === 1 ? "" : "s"}
                </span>
              </h2>
              <p className={`text-xs ${textMuted} mt-0.5`}>
                Wholesale goods and bulk listings published by this merchant on the MercatoX platform.
              </p>
            </div>
          </div>

          {recentProducts.length === 0 ? (
            <div className={`py-12 text-center rounded-xl border border-dashed ${borderDivider} ${subCardBg}`}>
              <Boxes className={`mx-auto h-9 w-9 ${textMuted} mb-2`} />
              <p className={`text-xs font-bold ${textHeading}`}>No products cataloged yet</p>
              <p className={`text-[11px] ${textMuted} mt-0.5`}>
                This supplier has not created any product listings in their catalog workspace yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentProducts.map((p: any) => (
                <div
                  key={p.id}
                  className={`rounded-2xl border p-3.5 flex items-start gap-3 transition-all ${
                    isLight
                      ? "bg-slate-50/70 border-slate-200 hover:border-indigo-400"
                      : isSystem
                      ? "bg-[#0b142c] border-blue-500/20 hover:border-indigo-400"
                      : "bg-[#0d121f] border-white/10 hover:border-indigo-500/40"
                  }`}
                >
                  <div className={`h-14 w-14 shrink-0 rounded-xl overflow-hidden border ${borderDivider} bg-black/10 flex items-center justify-center`}>
                    {p.images && p.images[0] ? (
                      <img src={p.images[0]} alt={p.title || p.name} className="h-full w-full object-cover" />
                    ) : (
                      <Boxes className={`h-6 w-6 ${textMuted}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-xs font-bold ${textHeading} truncate`} title={p.title || p.name}>
                      {p.title || p.name}
                    </h4>
                    <div className="mt-1 flex items-center gap-2 text-[11px]">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {p.price ? `${Number(p.price).toLocaleString()} ETB` : "Price on request"}
                      </span>
                      <span className={textMuted}>•</span>
                      <span className={textMuted}>Stock: {p.stockQuantity ?? p.stock ?? "N/A"}</span>
                    </div>
                    {p.sku && (
                      <div className={`mt-1 font-mono text-[10px] ${textMuted}`}>
                        SKU: {p.sku}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* TAB 4: WHOLESALE ORDERS                                                   */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeTab === "orders" && (
        <div className={`rounded-2xl border p-5 space-y-4 ${cardBg}`}>
          <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b ${borderDivider} pb-3`}>
            <div>
              <h2 className={`text-sm font-bold ${textHeading} flex items-center gap-2`}>
                <Receipt className="h-4 w-4 text-indigo-500" />
                <span>Wholesale &amp; Escrow Orders</span>
                <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-300">
                  {profile.stats?.totalOrders ?? 0} Total Orders
                </span>
              </h2>
              <p className={`text-xs ${textMuted} mt-0.5`}>
                Buyer purchase transactions, bulk quotes, and escrow status fulfilled by this merchant.
              </p>
            </div>
          </div>

          {recentOrders.length === 0 ? (
            <div className={`py-12 text-center rounded-xl border border-dashed ${borderDivider} ${subCardBg}`}>
              <Receipt className={`mx-auto h-9 w-9 ${textMuted} mb-2`} />
              <p className={`text-xs font-bold ${textHeading}`}>No orders recorded yet</p>
              <p className={`text-[11px] ${textMuted} mt-0.5`}>
                No marketplace transactions have been processed through this supplier yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="sm:hidden mb-2 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10.5px] text-indigo-300 font-medium flex items-center justify-between">
                <span>← ወደ ጎን ያሸብልሉ (Swipe to scroll) →</span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-indigo-400">Horizontal</span>
              </div>
              <table className="w-full text-left text-xs min-w-[540px]">
                <thead>
                  <tr className={`border-b ${borderDivider} ${textMuted}`}>
                    <th className="py-2.5 px-3 font-semibold">Order ID</th>
                    <th className="py-2.5 px-3 font-semibold">Date</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${borderDivider}`}>
                  {recentOrders.map((ord: any) => (
                    <tr key={ord.id} className={hoverRowBg}>
                      <td className={`py-3 px-3 font-mono font-medium ${textHeading}`}>
                        #{ord.id.substring(0, 8)}
                      </td>
                      <td className={`py-3 px-3 ${textMuted}`}>
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3">
                        <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold text-indigo-500 uppercase">
                          {ord.status}
                        </span>
                      </td>
                      <td className={`py-3 px-3 font-bold ${textHeading}`}>
                        {ord.totalAmount ? `${Number(ord.totalAmount).toLocaleString()} ETB` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* TAB 5: AUDIT TRAIL & GOVERNANCE HISTORY                                   */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {activeTab === "audit" && (
        <div className={`rounded-2xl border p-5 space-y-4 ${cardBg}`}>
          <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b ${borderDivider} pb-3`}>
            <div>
              <h2 className={`text-sm font-bold ${textHeading} flex items-center gap-2`}>
                <History className="h-4 w-4 text-indigo-500" />
                <span>Security &amp; Moderation Audit Trail</span>
                <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-300">
                  {auditLogs.length} Events Logged
                </span>
              </h2>
              <p className={`text-xs ${textMuted} mt-0.5`}>
                Immutable record of compliance reviews, onboarding events, and account status updates for this user.
              </p>
            </div>
          </div>

          {auditLogs.length === 0 ? (
            <div className={`py-12 text-center rounded-xl border border-dashed ${borderDivider} ${subCardBg}`}>
              <History className={`mx-auto h-9 w-9 ${textMuted} mb-2`} />
              <p className={`text-xs font-bold ${textHeading}`}>No audit events found</p>
              <p className={`text-[11px] ${textMuted} mt-0.5`}>
                No administrative moderation actions or compliance events recorded for this account ID yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {auditLogs.map((log: any) => (
                <div
                  key={log.id}
                  className={`rounded-xl border p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                    isLight ? "bg-slate-50 border-slate-200" : isSystem ? "bg-[#0b142c] border-blue-500/20" : "bg-black/30 border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="rounded px-2 py-0.5 font-mono text-[10px] font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400">
                      {log.action}
                    </span>
                    <span className={`font-semibold ${textHeading}`}>
                      Target: {log.targetEntity || "User"}
                    </span>
                    {log.ipAddress && (
                      <span className={`font-mono text-[10px] ${textMuted}`}>
                        IP: {log.ipAddress}
                      </span>
                    )}
                  </div>
                  <div className={`text-[11px] ${textMuted}`}>
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 6. HIGH-RESOLUTION LIGHTBOX MODAL                                         */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div
            className={`relative max-w-5xl w-full max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
              isLight ? "bg-white border-slate-300" : isSystem ? "bg-[#0c142c] border-blue-500/40" : "bg-[#101420] border-white/20"
            }`}
          >
            <div className={`flex items-center justify-between border-b ${borderDivider} p-4 ${subCardBg}`}>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-500" />
                <h3 className={`font-bold text-sm ${textHeading}`}>{lightboxImage.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={lightboxImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white transition-colors shadow-md shadow-indigo-600/25 cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open Full Tab</span>
                </a>
                <button
                  onClick={() => setLightboxImage(null)}
                  className={`rounded-xl border p-1.5 transition-colors cursor-pointer ${
                    isLight
                      ? "border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
                      : "border-white/10 bg-white/5 hover:bg-white/10 text-white"
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/40">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-h-[76vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 7. MODAL: MODERATE KYC (APPROVE / REJECT)                                  */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {isKycModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3.5 sm:p-4">
          <div className={`relative w-[95%] sm:w-full max-w-md rounded-2xl sm:rounded-3xl border p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto ${
            isLight
              ? "bg-white border-slate-300 text-slate-900"
              : isSystem
              ? "bg-[#0d1838] border-blue-500/30 text-blue-50"
              : "bg-[#141418] border-white/10 text-white"
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${borderDivider}`}>
              <h3 className={`text-sm font-bold ${textHeading} flex items-center gap-2`}>
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <span>Moderate Supplier Verification</span>
              </h3>
              <button
                onClick={() => setIsKycModalOpen(false)}
                className={`${textMuted} hover:${textHeading} cursor-pointer`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className={`rounded-2xl border p-3.5 space-y-1 ${subCardBg}`}>
                <div className={`font-bold ${textHeading} text-sm`}>{profile.shopName || profile.fullName}</div>
                <div className={textMuted}>Trade License: <strong className={textHeading}>{profile.tradeLicenseNumber || "—"}</strong></div>
                <div className={textMuted}>TIN Number: <strong className={textHeading}>{profile.tinNumber || "—"}</strong></div>
              </div>

              <div>
                <label className={`block mb-1 font-semibold ${textHeading}`}>
                  Rejection Reason (if rejecting):
                </label>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Invalid trade license expiry or tax registration mismatch..."
                  className={`w-full rounded-xl border p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 ${
                    isLight
                      ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                      : isSystem
                      ? "bg-[#060e22] border-blue-500/30 text-blue-100 placeholder:text-blue-300/40"
                      : "bg-black/50 border-white/15 text-zinc-100 placeholder:text-zinc-500"
                  }`}
                />
              </div>

              <div className={`flex items-center justify-end gap-2 pt-3 border-t ${borderDivider}`}>
                <button
                  type="button"
                  onClick={() => setIsKycModalOpen(false)}
                  className={`rounded-xl border px-3.5 py-2 font-semibold transition-all cursor-pointer ${
                    isLight
                      ? "border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
                      : "border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submittingKyc}
                  onClick={() => handleVerifyKyc(false)}
                  className="rounded-xl border border-rose-500/40 bg-rose-500/15 hover:bg-rose-500/25 px-3.5 py-2 font-bold text-rose-500 dark:text-rose-300 disabled:opacity-50 cursor-pointer"
                >
                  Reject Application
                </button>
                <button
                  type="button"
                  disabled={submittingKyc}
                  onClick={() => handleVerifyKyc(true)}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 font-bold text-neutral-950 disabled:opacity-50 shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  {submittingKyc ? "Processing..." : "Approve & Activate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 8. MODAL: ACCOUNT SUSPEND / ACTIVATE CONFIRMATION                          */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3.5 sm:p-4">
          <div className={`relative w-[95%] sm:w-full max-w-md rounded-2xl sm:rounded-3xl border p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto ${
            isLight
              ? "bg-white border-slate-300 text-slate-900"
              : isSystem
              ? "bg-[#0d1838] border-blue-500/30 text-blue-50"
              : "bg-[#141418] border-white/10 text-white"
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${borderDivider}`}>
              <h3 className={`text-sm font-bold ${textHeading} flex items-center gap-2`}>
                <AlertTriangle className="h-5 w-5 text-indigo-500" />
                <span>{profile.isActive ? "Suspend Supplier Account" : "Activate Supplier Account"}</span>
              </h3>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className={`${textMuted} hover:${textHeading} cursor-pointer`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <p className={textSub}>
                Are you sure you want to{" "}
                <strong className={profile.isActive ? "text-rose-500" : "text-emerald-500"}>
                  {profile.isActive ? "SUSPEND" : "ACTIVATE"}
                </strong>{" "}
                the wholesale workspace for <strong className={textHeading}>{profile.shopName || profile.fullName}</strong>?
              </p>

              {profile.isActive && (
                <div>
                  <label className={`block mb-1 font-semibold ${textHeading}`}>Reason for suspension:</label>
                  <textarea
                    rows={2}
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                    placeholder="e.g. Failure to comply with platform wholesale service level agreement..."
                    className={`w-full rounded-xl border p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 ${
                      isLight
                        ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                        : isSystem
                        ? "bg-[#060e22] border-blue-500/30 text-blue-100 placeholder:text-blue-300/40"
                        : "bg-black/50 border-white/15 text-zinc-100 placeholder:text-zinc-500"
                    }`}
                  />
                </div>
              )}

              <div className={`flex items-center justify-end gap-2 pt-3 border-t ${borderDivider}`}>
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className={`rounded-xl border px-3.5 py-2 font-semibold transition-all cursor-pointer ${
                    isLight
                      ? "border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
                      : "border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submittingStatus}
                  onClick={handleToggleStatus}
                  className={`rounded-xl px-4 py-2 font-bold transition-all disabled:opacity-50 cursor-pointer ${
                    profile.isActive
                      ? "bg-rose-500 hover:bg-rose-400 text-white"
                      : "bg-emerald-500 hover:bg-emerald-400 text-neutral-950"
                  }`}
                >
                  {submittingStatus
                    ? "Updating..."
                    : profile.isActive
                    ? "Confirm Suspension"
                    : "Activate Supplier"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

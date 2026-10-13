"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Truck,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  RefreshCw,
  X,
  FileText,
  BadgeCheck,
  MoreVertical,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import {
  adminSupplierService,
  type SupplierItem,
  type SupplierStaff,
} from "@/features/admin/services/admin.service";
import { AdminSupplierDetail } from "./admin-supplier-detail";
import { useAdminUIStore } from "@/store/ui-store";
import { useThemeStore } from "@/store/theme-store";

export function AdminSuppliers() {
  const { theme } = useThemeStore();
  const isLight = theme === "light";
  const isSystem = theme === "system";
  const isDark = !isLight && !isSystem;

  // Theme-aware tokens calibrated for System, Light, and Dark modes
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

  const inputBg = isLight
    ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500"
    : isSystem
    ? "bg-[#070e20] border-blue-500/30 text-blue-100 placeholder-blue-300/40 focus:border-indigo-400"
    : "bg-black/50 border-white/10 text-white placeholder-zinc-500 focus:border-indigo-500";

  const selectBg = isLight
    ? "bg-white border-slate-200 text-slate-800 focus:border-indigo-500 shadow-xs"
    : isSystem
    ? "bg-[#091330] border-blue-500/30 text-blue-100 focus:border-indigo-400"
    : "bg-[#141418] border-white/10 text-zinc-200 focus:border-indigo-500";

  const tableHeaderBg = isLight
    ? "bg-slate-50 border-slate-200 text-slate-600"
    : isSystem
    ? "bg-[#070e20]/90 border-blue-500/20 text-blue-200/80"
    : "bg-black/40 border-white/10 text-zinc-400";

  const dropdownBg = isLight
    ? "bg-white border-slate-200 shadow-xl text-slate-800"
    : isSystem
    ? "bg-[#0c1630] border-blue-500/30 shadow-2xl shadow-blue-950/60 text-blue-100"
    : "bg-[#141418] border-white/10 shadow-2xl shadow-black/80 text-zinc-200";

  const modalBg = isLight
    ? "bg-white border-slate-200 shadow-2xl"
    : isSystem
    ? "bg-[#0c1630] border-blue-500/30 shadow-2xl shadow-blue-950/80"
    : "bg-[#141418] border-white/10 shadow-2xl shadow-black/80";

  const modalHeaderBg = isLight
    ? "bg-slate-50 border-slate-200"
    : isSystem
    ? "bg-[#070e20] border-blue-500/20"
    : "bg-black/40 border-white/10";

  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKyc, setSelectedKyc] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  // Selected supplier ID for Full-Screen Supplier Detail View (connected with store for notification 1-click navigation)
  const {
    selectedSupplierId: storeSupplierId,
    setSelectedSupplierId: setStoreSupplierId,
  } = useAdminUIStore();
  const [localSupplierId, setLocalSupplierId] = useState<string | null>(null);
  const selectedSupplierId = storeSupplierId || localSupplierId;
  const setSelectedSupplierId = (id: string | null) => {
    setLocalSupplierId(id);
    setStoreSupplierId(id);
  };

  // 3-Dots Dropdown menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Selected supplier for inspecting staff
  const [inspectingSupplier, setInspectingSupplier] = useState<SupplierItem | null>(null);
  const [staffList, setStaffList] = useState<SupplierStaff[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [staffRoleFilter, setStaffRoleFilter] = useState<"ALL" | "branch_manager" | "driver">("ALL");

  // KYC verification modal state
  const [kycModalSupplier, setKycModalSupplier] = useState<SupplierItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submittingKyc, setSubmittingKyc] = useState(false);

  // Status toggle confirmation modal
  const [statusModalSupplier, setStatusModalSupplier] = useState<SupplierItem | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [submittingStatus, setSubmittingStatus] = useState(false);

  // Load suppliers directly from DB via backend
  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const res = await adminSupplierService.getSuppliers({
        limit: 100,
        search: searchQuery.trim() || undefined,
        isActive: selectedStatus !== "ALL" ? selectedStatus === "ACTIVE" : undefined,
        kycStatus: selectedKyc !== "ALL" ? selectedKyc : undefined,
      });
      setSuppliers(res.data || []);
    } catch (err: any) {
      console.error("Failed to load suppliers from backend:", err);
      toast.error("Failed to load suppliers from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [selectedKyc, selectedStatus]);

  // Load staff for selected supplier
  const openStaffInspector = async (supplier: SupplierItem) => {
    setOpenMenuId(null);
    setInspectingSupplier(supplier);
    setLoadingStaff(true);
    try {
      const data = await adminSupplierService.getSupplierStaff(supplier.userId);
      setStaffList(data || []);
    } catch (err) {
      console.error("Failed to load supplier staff:", err);
      toast.error("Failed to load staff for " + (supplier.shopName || supplier.fullName));
      setStaffList([]);
    } finally {
      setLoadingStaff(false);
    }
  };

  // Handle verify merchant
  const handleVerifyKyc = async (isVerified: boolean) => {
    if (!kycModalSupplier) return;
    setSubmittingKyc(true);
    try {
      await adminSupplierService.verifyMerchant(
        kycModalSupplier.userId,
        isVerified,
        !isVerified ? rejectionReason || "Incomplete documentation" : undefined
      );
      toast.success(
        isVerified
          ? `Verified & Activated supplier ${kycModalSupplier.shopName || kycModalSupplier.fullName} successfully`
          : `Rejected KYC for ${kycModalSupplier.shopName || kycModalSupplier.fullName}. Account type converted to Customer.`
      );
      setKycModalSupplier(null);
      setRejectionReason("");
      loadSuppliers();
    } catch (err) {
      toast.error("Failed to update merchant verification");
    } finally {
      setSubmittingKyc(false);
    }
  };

  // Handle supplier account status toggle
  const handleToggleSupplierStatus = async () => {
    if (!statusModalSupplier) return;
    setSubmittingStatus(true);
    const targetStatus = !statusModalSupplier.isActive;
    try {
      await adminSupplierService.setUserStatus(
        statusModalSupplier.userId,
        targetStatus,
        !targetStatus ? suspensionReason || "Admin manual suspension" : undefined
      );
      toast.success(
        targetStatus
          ? `Activated supplier ${statusModalSupplier.shopName || statusModalSupplier.fullName}`
          : `Suspended supplier ${statusModalSupplier.shopName || statusModalSupplier.fullName}`
      );
      setStatusModalSupplier(null);
      setSuspensionReason("");
      loadSuppliers();
    } catch (err) {
      toast.error("Failed to update supplier status");
    } finally {
      setSubmittingStatus(false);
    }
  };

  // Filtered suppliers strictly based on DB values
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      if (selectedType !== "ALL") {
        if (!s.businessType || !s.businessType.toLowerCase().includes(selectedType.toLowerCase())) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          (s.shopName && s.shopName.toLowerCase().includes(q)) ||
          (s.fullName && s.fullName.toLowerCase().includes(q)) ||
          (s.email && s.email.toLowerCase().includes(q)) ||
          (s.businessType && s.businessType.toLowerCase().includes(q)) ||
          (s.city && s.city.toLowerCase().includes(q)) ||
          (s.subCity && s.subCity.toLowerCase().includes(q)) ||
          (s.tradeLicenseNumber && s.tradeLicenseNumber.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [suppliers, searchQuery, selectedType]);

  // Derived real DB metrics
  const stats = useMemo(() => {
    const total = suppliers.length;
    const verified = suppliers.filter((s) => s.isVerifiedMerchant || s.merchantKycStatus === "APPROVED").length;
    const pendingKyc = suppliers.filter((s) => s.merchantKycStatus === "PENDING").length;
    const totalStaff = suppliers.reduce((acc, s) => acc + (s.staffStats?.totalStaff || 0), 0);
    const totalDrivers = suppliers.reduce((acc, s) => acc + (s.staffStats?.driversCount || 0), 0);
    return { total, verified, pendingKyc, totalStaff, totalDrivers };
  }, [suppliers]);

  // Filtered staff list
  const filteredStaffList = useMemo(() => {
    if (staffRoleFilter === "ALL") return staffList;
    return staffList.filter((st) => st.role === staffRoleFilter);
  }, [staffList, staffRoleFilter]);

  // If a supplier is selected for full-screen inspection, render AdminSupplierDetail!
  if (selectedSupplierId) {
    return (
      <AdminSupplierDetail
        supplierId={selectedSupplierId}
        onBack={() => {
          setSelectedSupplierId(null);
          loadSuppliers();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                isLight
                  ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                  : "bg-gradient-to-tr from-indigo-600/20 to-cyan-500/20 border-indigo-500/30 text-indigo-400 shadow-sm shadow-indigo-500/10"
              }`}
            >
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${textHeading} flex items-center gap-2`}>
                Suppliers & Fleet Control
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                    isLight
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                      : "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
                  }`}
                >
                  PostgreSQL Data
                </span>
              </h1>
              <p className={`text-xs sm:text-sm ${textMuted}`}>
                Manage wholesale suppliers, bulk merchants, warehouse hubs, and their staff roster directly from the database.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadSuppliers()}
            disabled={loading}
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all active:scale-95 disabled:opacity-50 cursor-pointer ${neutralBtn}`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-indigo-500" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Real DB Overview Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        {/* Suppliers in DB */}
        <div className={`relative overflow-hidden rounded-2xl border ${cardBg} p-4 backdrop-blur-md group hover:border-indigo-500/40 transition-all`}>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-80" />
          <div className={`flex items-center justify-between ${textMuted} text-xs font-medium`}>
            <span>Suppliers in DB</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className={`mt-2 text-2xl font-bold font-mono ${textHeading} tracking-tight`}>{stats.total}</div>
          <p className={`mt-1 text-[11px] ${textMuted}`}>Live PostgreSQL merchant profiles</p>
        </div>

        {/* Verified Wholesalers */}
        <div className={`relative overflow-hidden rounded-2xl border ${cardBg} p-4 backdrop-blur-md group hover:border-emerald-500/40 transition-all`}>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-80" />
          <div className={`flex items-center justify-between ${textMuted} text-xs font-medium`}>
            <span>Verified Wholesalers</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400 tracking-tight">{stats.verified}</div>
          <p className={`mt-1 text-[11px] ${textMuted}`}>MOTRI &amp; TIN KYC verified</p>
        </div>

        {/* Total Staff */}
        <div className={`relative overflow-hidden rounded-2xl border ${cardBg} p-4 backdrop-blur-md group hover:border-cyan-500/40 transition-all`}>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-80" />
          <div className={`flex items-center justify-between ${textMuted} text-xs font-medium`}>
            <span>Total Staff &amp; Fleet</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/25">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-cyan-400 tracking-tight">{stats.totalStaff}</div>
          <p className={`mt-1 text-[11px] ${textMuted}`}>{stats.totalDrivers} drivers · {Math.max(0, stats.totalStaff - stats.totalDrivers)} managers</p>
        </div>

        {/* Pending Approvals */}
        <div className={`relative overflow-hidden rounded-2xl border ${cardBg} p-4 backdrop-blur-md group hover:border-amber-500/40 transition-all`}>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-80" />
          <div className={`flex items-center justify-between ${textMuted} text-xs font-medium`}>
            <span>Pending Approvals</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400 tracking-tight">{stats.pendingKyc}</div>
          <p className={`mt-1 text-[11px] ${textMuted}`}>Awaiting compliance review</p>
        </div>
      </div>

      {/* Pending Application Notification Banner */}
      {stats.pendingKyc > 0 && (
        <div
          className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg ${
            isLight
              ? "border-indigo-200 bg-indigo-50/70 shadow-indigo-500/5 text-slate-800"
              : isSystem
              ? "border-indigo-500/30 bg-gradient-to-r from-indigo-500/15 via-[#0c1630] to-transparent shadow-indigo-500/5 text-blue-50"
              : "border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent shadow-indigo-500/5 text-white"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl border shrink-0 ${
                isLight
                  ? "bg-indigo-100 border-indigo-200 text-indigo-600"
                  : "bg-indigo-500/20 border-indigo-500/30 text-indigo-400"
              }`}
            >
              <ShieldAlert className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${textHeading}`}>
                  {stats.pendingKyc} Supplier Application{stats.pendingKyc > 1 ? "s" : ""} Awaiting Review
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                    isLight
                      ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                      : "bg-indigo-500/20 border-indigo-500/30 text-indigo-300"
                  }`}
                >
                  Action Required
                </span>
              </div>
              <p className={`text-xs ${textMuted}`}>
                Newly registered wholesalers have submitted legal licenses, TIN certificates, and MOTRI documents.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedKyc("PENDING")}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Filter Pending Applications</span>
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className={`rounded-2xl border ${cardBg} p-4 backdrop-blur-md space-y-3`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${textMuted}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company name, owner, email, hub location, TIN, trade license..."
              className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-colors ${inputBg}`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${textMuted} hover:${textHeading}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* KYC Filter */}
            <select
              value={selectedKyc}
              onChange={(e) => setSelectedKyc(e.target.value)}
              className={`flex-1 sm:flex-none rounded-xl border px-3 py-2 text-xs focus:outline-none cursor-pointer ${selectBg}`}
            >
              <option value="ALL">All KYC Statuses</option>
              <option value="APPROVED">Verified Only</option>
              <option value="PENDING">Pending Review</option>
              <option value="REJECTED">Rejected</option>
              <option value="NONE">Unsubmitted</option>
            </select>

            {/* Account Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`flex-1 sm:flex-none rounded-xl border px-3 py-2 text-xs focus:outline-none cursor-pointer ${selectBg}`}
            >
              <option value="ALL">All Account Status</option>
              <option value="ACTIVE">Active Accounts</option>
              <option value="SUSPENDED">Suspended Accounts</option>
            </select>

            {/* Business Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={`flex-1 sm:flex-none rounded-xl border px-3 py-2 text-xs focus:outline-none cursor-pointer ${selectBg}`}
            >
              <option value="ALL">All Business Types</option>
              <option value="Importer">Bulk Importers</option>
              <option value="Wholesale">Wholesale Distributors</option>
              <option value="Manufacturer">Manufacturers</option>
            </select>
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className={`overflow-visible rounded-2xl border ${cardBg} backdrop-blur-md`}>
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead className={`border-b ${borderDivider} ${tableHeaderBg} text-[11px] font-semibold uppercase tracking-wider`}>
              <tr>
                <th className="py-3.5 pl-4 pr-3 sm:pl-6">Supplier & Company</th>
                <th className="px-3 py-3.5">Business Classification</th>
                <th className="px-3 py-3.5">Hub / Warehouse Location</th>
                <th className="px-3 py-3.5">Owner & Contact</th>
                <th className="px-3 py-3.5">Staff & Fleet</th>
                <th className="px-3 py-3.5">KYC Status</th>
                <th className="px-3 py-3.5">Status</th>
                <th className="py-3.5 pl-3 pr-4 sm:pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${borderDivider} ${textSub}`}>
              {loading ? (
                <tr>
                  <td colSpan={8} className={`py-12 text-center ${textMuted}`}>
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
                      <p className="text-sm">Loading suppliers directly from database...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/30 bg-gradient-to-tr from-indigo-500/20 to-cyan-500/10 text-indigo-400 shadow-xl shadow-indigo-500/10">
                        <Building2 className="h-7 w-7" />
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${textHeading}`}>
                          {suppliers.length === 0
                            ? "No Suppliers in Database (ምንም አቅራቢ አልተገኘም)"
                            : "No Suppliers Match Current Search Filters"}
                        </h4>
                        <p className={`text-xs ${textMuted} mt-1 leading-relaxed`}>
                          {suppliers.length === 0
                            ? "All wholesale merchant accounts and suppliers are loaded live from the PostgreSQL database. When merchants register or submit KYC documents, they will appear here."
                            : "Try clearing search keywords or resetting status and business type filters."}
                        </p>
                      </div>
                      {suppliers.length === 0 ? (
                        <button
                          type="button"
                          onClick={() => loadSuppliers()}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>Refresh Suppliers Database</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedKyc("ALL");
                            setSelectedStatus("ALL");
                            setSelectedType("ALL");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Reset Filters</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => {
                  const staffCount = supplier.staffStats?.totalStaff ?? 0;
                  const mgrCount = supplier.staffStats?.managersCount ?? 0;
                  const drvCount = supplier.staffStats?.driversCount ?? 0;

                  return (
                    <tr
                      key={supplier.id || supplier.userId}
                      className={`group transition-colors ${hoverRowBg}`}
                    >
                      {/* Supplier & Company */}
                      <td className="py-4 pl-4 pr-3 sm:pl-6">
                        <div
                          className="flex items-start gap-3 cursor-pointer group/supplier"
                          onClick={() => setSelectedSupplierId(supplier.userId)}
                          title="Click to view full supplier page & uploaded documents"
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border font-bold text-sm transition-all group-hover/supplier:scale-105 ${
                              isLight
                                ? "bg-indigo-50 border-indigo-200 text-indigo-700 group-hover/supplier:border-indigo-300"
                                : isSystem
                                ? "bg-gradient-to-tr from-indigo-600/20 to-cyan-500/20 border-indigo-500/30 text-indigo-300 group-hover/supplier:border-indigo-400"
                                : "bg-gradient-to-tr from-indigo-600/20 to-cyan-500/10 border-indigo-500/20 text-indigo-300 group-hover/supplier:border-indigo-400/50"
                            }`}
                          >
                            {(supplier.shopName || supplier.fullName || "S").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className={`font-semibold ${textHeading} group-hover/supplier:text-indigo-500 transition-colors flex items-center gap-1.5`}>
                              {supplier.shopName || supplier.fullName || "Unnamed Merchant"}
                              {supplier.isVerifiedMerchant && (
                                <span title="Verified Merchant">
                                  <BadgeCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                                </span>
                              )}
                            </div>
                            <div className={`text-[11px] ${textMuted}`}>
                              {supplier.fullName || "—"}
                            </div>
                            {supplier.tradeLicenseNumber && (
                              <div className={`text-[10px] ${textMuted} font-mono mt-0.5`}>
                                License: {supplier.tradeLicenseNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Business Classification */}
                      <td className="px-3 py-4">
                        {supplier.businessType ? (
                          <span
                            className={`inline-block rounded-lg px-2 py-1 text-[11px] font-medium max-w-[220px] truncate border ${
                              isLight
                                ? "bg-slate-100 border-slate-200 text-indigo-700"
                                : isSystem
                                ? "bg-[#070e20] border-blue-500/25 text-indigo-300"
                                : "bg-neutral-800/80 border-neutral-700/60 text-indigo-300/90"
                            }`}
                            title={supplier.businessType}
                          >
                            {supplier.businessType}
                          </span>
                        ) : (
                          <span className={`text-[11px] ${textMuted}`}>Not specified</span>
                        )}
                      </td>

                      {/* Hub Location */}
                      <td className="px-3 py-4">
                        <div className={`flex items-start gap-1.5 ${textSub}`}>
                          <MapPin className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                          <div>
                            <div className={`font-medium ${textHeading} text-xs`}>
                              {supplier.subCity ? `${supplier.subCity}, ` : ""}{supplier.city || "—"}
                            </div>
                            {supplier.specificLocation && (
                              <div className={`text-[11px] ${textMuted} line-clamp-1 max-w-[200px]`} title={supplier.specificLocation}>
                                {supplier.specificLocation}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Owner & Contact */}
                      <td className="px-3 py-4">
                        <div className="space-y-0.5">
                          <div className={`text-[11px] ${textSub} flex items-center gap-1`}>
                            <Mail className={`h-3 w-3 ${textMuted}`} />
                            <span className="truncate max-w-[150px]">{supplier.email || "—"}</span>
                          </div>
                          {supplier.alternatePhone && (
                            <div className={`text-[11px] ${textMuted} flex items-center gap-1`}>
                              <Phone className={`h-3 w-3 ${textMuted}`} />
                              <span>{supplier.alternatePhone}</span>
                            </div>
                          )}
                          {supplier.tinNumber && (
                            <div className={`text-[10px] ${textMuted} font-mono`}>
                              TIN: {supplier.tinNumber}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Staff & Fleet Counters */}
                      <td className="px-3 py-4">
                        <button
                          onClick={() => openStaffInspector(supplier)}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer ${neutralBtn} hover:border-indigo-500/40`}
                          title="Click to inspect staff roster"
                        >
                          <Users className="h-3.5 w-3.5 text-cyan-500" />
                          <span className={textHeading}>{staffCount} Staff</span>
                          {staffCount > 0 && (
                            <span className={`text-[10px] ${textMuted}`}>
                              ({mgrCount} Mgr, {drvCount} Drv)
                            </span>
                          )}
                        </button>
                      </td>

                      {/* KYC Status */}
                      <td className="px-3 py-4">
                        {supplier.isVerifiedMerchant || supplier.merchantKycStatus === "APPROVED" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-500">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </span>
                        ) : supplier.merchantKycStatus === "REJECTED" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-rose-500" title={supplier.merchantRejectionReason || undefined}>
                            <XCircle className="h-3 w-3" />
                            Rejected
                          </span>
                        ) : supplier.merchantKycStatus === "PENDING" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-500">
                            <Clock className="h-3.5 w-3.5" />
                            Pending Review
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] ${
                              isLight
                                ? "bg-slate-100 border-slate-200 text-slate-500"
                                : isSystem
                                ? "bg-[#070e20] border-blue-500/20 text-blue-300/70"
                                : "bg-white/5 border-white/10 text-zinc-400"
                            }`}
                          >
                            Unsubmitted
                          </span>
                        )}
                      </td>

                      {/* Account Status */}
                      <td className="px-3 py-4">
                        {supplier.isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            Suspended
                          </span>
                        )}
                      </td>

                      {/* Actions: 3-DOTS MENU BUTTON */}
                      <td className="py-4 pl-3 pr-4 sm:pr-6 text-right relative">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={() => setOpenMenuId(openMenuId === supplier.userId ? null : supplier.userId)}
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors cursor-pointer ${neutralBtn}`}
                            title="Actions menu"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {/* Dropdown Menu */}
                          {openMenuId === supplier.userId && (
                            <>
                              <div
                                className="fixed inset-0 z-30 cursor-default"
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div className={`absolute right-0 mt-1 w-56 rounded-xl border p-1.5 shadow-2xl z-40 space-y-0.5 text-left animate-in fade-in zoom-in-95 duration-100 ${dropdownBg}`}>
                                {/* Inspect Staff & Fleet */}
                                <button
                                  type="button"
                                  onClick={() => openStaffInspector(supplier)}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/15 transition-colors cursor-pointer"
                                >
                                  <Users className="h-3.5 w-3.5 text-cyan-500" />
                                  <span>Inspect Staff & Fleet ({staffCount})</span>
                                </button>

                                {/* View Full Supplier Page */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    setSelectedSupplierId(supplier.userId);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/15 transition-colors cursor-pointer"
                                >
                                  <FileText className="h-3.5 w-3.5 text-indigo-500" />
                                  <span>View Full Supplier Page</span>
                                </button>

                                {/* Moderate KYC */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    setKycModalSupplier(supplier);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/15 transition-colors cursor-pointer"
                                >
                                  <Shield className="h-3.5 w-3.5 text-emerald-500" />
                                  <span>Moderate KYC</span>
                                </button>

                                <div className={`my-1 border-t ${borderDivider}`} />

                                {/* Suspend / Activate Account */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    setStatusModalSupplier(supplier);
                                  }}
                                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                                    supplier.isActive
                                      ? "text-rose-600 dark:text-rose-300 hover:bg-rose-500/15"
                                      : "text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/15"
                                  }`}
                                >
                                  {supplier.isActive ? (
                                    <>
                                      <XCircle className="h-3.5 w-3.5 text-rose-500" />
                                      <span>Suspend Account</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                      <span>Activate Account</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL / DRAWER: INSPECT SUPPLIER STAFF & FLEET PERSONNEL */}
      {/* ======================================================== */}
      {inspectingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`relative w-full max-w-4xl rounded-2xl border ${modalBg} overflow-hidden my-8`}>
            {/* Modal Header */}
            <div className={`border-b ${borderDivider} ${modalHeaderBg} p-5 flex items-start justify-between`}>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-lg px-2 py-0.5 text-xs font-semibold border ${
                      isLight
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                        : "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
                    }`}
                  >
                    Supplier Staff & Fleet Roster
                  </span>
                  <span className={`text-xs ${textMuted} font-mono`}>
                    ID: {inspectingSupplier.userId.slice(0, 8)}...
                  </span>
                </div>
                <h2 className={`mt-1 text-xl font-bold ${textHeading} flex items-center gap-2`}>
                  {inspectingSupplier.shopName || inspectingSupplier.fullName}
                </h2>
                <p className={`text-xs ${textMuted} flex items-center gap-3 mt-1`}>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                    {inspectingSupplier.specificLocation || inspectingSupplier.city || "—"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className={`h-3.5 w-3.5 ${textMuted}`} />
                    {inspectingSupplier.email || "—"}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInspectingSupplier(null)}
                  className={`rounded-xl border p-2 cursor-pointer transition-colors ${neutralBtn}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Sub-header / Filters with Brand Active Background */}
            <div className={`border-b ${borderDivider} ${modalHeaderBg} px-5 py-3 flex flex-wrap items-center justify-between gap-3`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStaffRoleFilter("ALL")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    staffRoleFilter === "ALL"
                      ? "bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40 ring-1 ring-indigo-500/30"
                      : neutralBtn
                  }`}
                >
                  All ({staffList.length})
                </button>
                <button
                  onClick={() => setStaffRoleFilter("branch_manager")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    staffRoleFilter === "branch_manager"
                      ? "bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40 ring-1 ring-indigo-500/30"
                      : neutralBtn
                  }`}
                >
                  Branch Managers ({staffList.filter((s) => s.role === "branch_manager").length})
                </button>
                <button
                  onClick={() => setStaffRoleFilter("driver")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    staffRoleFilter === "driver"
                      ? "bg-gradient-to-r from-cyan-600 via-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30 border border-cyan-400/40 ring-1 ring-cyan-500/30"
                      : neutralBtn
                  }`}
                >
                  Fleet Drivers ({staffList.filter((s) => s.role === "driver").length})
                </button>
              </div>

              <div className={`text-xs ${textMuted}`}>
                Total Roster: <span className={`font-bold ${textHeading}`}>{staffList.length} personnel</span>
              </div>
            </div>

            {/* Staff Cards / List */}
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
              {loadingStaff ? (
                <div className={`py-12 text-center ${textMuted}`}>
                  <RefreshCw className="mx-auto h-6 w-6 animate-spin text-indigo-500 mb-2" />
                  <p className="text-sm">Fetching real-time staff records from database...</p>
                </div>
              ) : filteredStaffList.length === 0 ? (
                <div className={`py-12 text-center ${textMuted} rounded-xl border border-dashed ${borderDivider} ${subCardBg}`}>
                  <Users className={`mx-auto h-8 w-8 mb-2 ${textMuted}`} />
                  <p className={`text-sm font-medium ${textHeading}`}>No staff members in this role in DB</p>
                  <p className={`text-xs ${textMuted} mt-1`}>
                    No personnel or fleet drivers have been registered by this supplier in the database.
                  </p>
                </div>
              ) : (
                filteredStaffList.map((staff) => {
                  const isManager = staff.role === "branch_manager";
                  const isDriver = staff.role === "driver";

                  return (
                    <div
                      key={staff.id}
                      className={`rounded-xl border ${subCardBg} p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border font-bold text-sm ${
                            isManager
                              ? isLight
                                ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                                : "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
                              : isLight
                              ? "bg-cyan-50 border-cyan-200 text-cyan-600"
                              : "bg-cyan-500/15 border-cyan-500/30 text-cyan-300"
                          }`}
                        >
                          {isManager ? <UserCheck className="h-5 w-5" /> : <Truck className="h-5 w-5" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`font-bold ${textHeading} text-sm`}>{staff.fullName}</h3>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                isManager
                                  ? isLight
                                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                    : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                                  : isLight
                                  ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                                  : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                              }`}
                            >
                              {isManager ? "Branch Manager" : "Fleet Driver"}
                            </span>
                            {staff.employeeId && (
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-mono border ${
                                  isLight
                                    ? "bg-slate-100 border-slate-200 text-slate-700"
                                    : "bg-neutral-800 border-neutral-700 text-neutral-300"
                                }`}
                              >
                                {staff.employeeId}
                              </span>
                            )}
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                                staff.status === "active"
                                  ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                                  : "bg-rose-500/15 text-rose-500 border-rose-500/30"
                              }`}
                            >
                              {staff.status === "active" ? "Active" : "Suspended"}
                            </span>
                          </div>

                          {/* Branch & Contact Info */}
                          <div className={`mt-1 text-xs ${textMuted} flex flex-wrap items-center gap-x-4 gap-y-1`}>
                            {staff.branchName && (
                              <span className={`flex items-center gap-1 ${textSub} font-medium`}>
                                <Building2 className="h-3 w-3 text-indigo-500" />
                                {staff.branchName}
                              </span>
                            )}
                            {staff.email && (
                              <span className="flex items-center gap-1">
                                <Mail className={`h-3 w-3 ${textMuted}`} />
                                {staff.email}
                              </span>
                            )}
                            {staff.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className={`h-3 w-3 ${textMuted}`} />
                                {staff.phone}
                              </span>
                            )}
                          </div>

                          {/* Driver Specific Info */}
                          {isDriver && (
                            <div
                              className={`mt-2.5 rounded-lg border p-2 text-xs space-y-1 ${
                                isLight
                                  ? "bg-white border-slate-200 text-slate-700"
                                  : isSystem
                                  ? "bg-[#091330] border-blue-500/25 text-blue-100"
                                  : "bg-neutral-900/60 border-neutral-800/80 text-neutral-300"
                              }`}
                            >
                              <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 ${textSub}`}>
                                {staff.assignedVehicleType && (
                                  <span className={`font-semibold ${textHeading} flex items-center gap-1`}>
                                    <Truck className="h-3 w-3 text-cyan-500" />
                                    {staff.assignedVehicleType}
                                  </span>
                                )}
                                {staff.assignedVehiclePlate && (
                                  <span
                                    className={`font-mono text-cyan-600 dark:text-cyan-300 text-[11px] px-1.5 py-0.5 rounded border ${
                                      isLight
                                        ? "bg-cyan-50 border-cyan-200"
                                        : "bg-cyan-950/40 border-cyan-800/40"
                                    }`}
                                  >
                                    {staff.assignedVehiclePlate}
                                  </span>
                                )}
                                {staff.driverLicenseNumber && (
                                  <span className={`text-[11px] ${textMuted}`}>
                                    License: <span className={`font-mono ${textSub}`}>{staff.driverLicenseNumber}</span>
                                  </span>
                                )}
                              </div>
                              {staff.driverLicenseGrade && (
                                <div className={`text-[10px] ${textMuted}`}>
                                  Grade: {staff.driverLicenseGrade}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className={`border-t ${borderDivider} ${modalHeaderBg} p-4 flex items-center justify-between text-xs ${textMuted}`}>
              <div>
                Personnel and logistics roster is maintained directly by the supplier.
              </div>
              <button
                onClick={() => setInspectingSupplier(null)}
                className={`rounded-xl px-4 py-2 font-medium transition-all cursor-pointer ${neutralBtn}`}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: KYC VERIFY OR REJECT CONFIRMATION                 */}
      {/* ======================================================== */}
      {kycModalSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4">
          <div className={`relative w-full max-w-md rounded-2xl border ${modalBg} p-6`}>
            <div className={`flex items-center justify-between pb-3 border-b ${borderDivider}`}>
              <h3 className={`text-base font-bold ${textHeading} flex items-center gap-2`}>
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                Moderate Supplier Verification
              </h3>
              <button
                onClick={() => setKycModalSupplier(null)}
                className={`${textMuted} hover:${textHeading} cursor-pointer`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className={`rounded-xl border ${subCardBg} p-3`}>
                <div className={`font-bold ${textHeading} text-sm`}>{kycModalSupplier.shopName || kycModalSupplier.fullName}</div>
                <div className={`${textMuted} mt-0.5`}>Owner: {kycModalSupplier.fullName} ({kycModalSupplier.email || "—"})</div>
                <div className={`${textMuted} mt-0.5`}>Trade License: {kycModalSupplier.tradeLicenseNumber || "—"}</div>
                <div className={`${textMuted} mt-0.5`}>TIN: {kycModalSupplier.tinNumber || "—"}</div>
              </div>

              <div>
                <label className={`block ${textSub} mb-1 font-medium`}>Rejection Reason (if rejecting):</label>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Trade license expired or name mismatch..."
                  className={`w-full rounded-xl border p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 ${inputBg}`}
                />
              </div>

              <div className={`flex items-center justify-end gap-2 pt-3 border-t ${borderDivider}`}>
                <button
                  type="button"
                  onClick={() => setKycModalSupplier(null)}
                  className={`rounded-xl border px-3 py-2 cursor-pointer ${neutralBtn}`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submittingKyc}
                  onClick={() => handleVerifyKyc(false)}
                  className="rounded-xl border border-rose-500/40 bg-rose-500/15 hover:bg-rose-500/25 px-3 py-2 font-semibold text-rose-500 dark:text-rose-300 disabled:opacity-50 cursor-pointer"
                >
                  Reject KYC
                </button>
                <button
                  type="button"
                  disabled={submittingKyc}
                  onClick={() => handleVerifyKyc(true)}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 px-4 py-2 font-bold text-white disabled:opacity-50 shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  {submittingKyc ? "Processing..." : "Approve & Verify"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ACCOUNT SUSPEND / ACTIVATE CONFIRMATION           */}
      {/* ======================================================== */}
      {statusModalSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4">
          <div className={`relative w-full max-w-md rounded-2xl border ${modalBg} p-6`}>
            <div className={`flex items-center justify-between pb-3 border-b ${borderDivider}`}>
              <h3 className={`text-base font-bold ${textHeading} flex items-center gap-2`}>
                <AlertTriangle className="h-5 w-5 text-indigo-500" />
                {statusModalSupplier.isActive ? "Suspend Supplier Account" : "Activate Supplier Account"}
              </h3>
              <button
                onClick={() => setStatusModalSupplier(null)}
                className={`${textMuted} hover:${textHeading} cursor-pointer`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <p className={textSub}>
                Are you sure you want to{" "}
                <strong className={statusModalSupplier.isActive ? "text-rose-500" : "text-emerald-500"}>
                  {statusModalSupplier.isActive ? "SUSPEND" : "ACTIVATE"}
                </strong>{" "}
                the wholesale account for <strong className={textHeading}>{statusModalSupplier.shopName || statusModalSupplier.fullName}</strong>?
              </p>

              {statusModalSupplier.isActive && (
                <div>
                  <label className={`block ${textMuted} mb-1 font-medium`}>Reason for suspension:</label>
                  <textarea
                    rows={2}
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                    placeholder="e.g. Failure to maintain supply commitments or regulatory non-compliance..."
                    className={`w-full rounded-xl border p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 ${inputBg}`}
                  />
                </div>
              )}

              <div className={`flex items-center justify-end gap-2 pt-3 border-t ${borderDivider}`}>
                <button
                  type="button"
                  onClick={() => setStatusModalSupplier(null)}
                  className={`rounded-xl border px-3.5 py-2 cursor-pointer ${neutralBtn}`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submittingStatus}
                  onClick={handleToggleSupplierStatus}
                  className={`rounded-xl px-4 py-2 font-bold transition-all disabled:opacity-50 cursor-pointer ${
                    statusModalSupplier.isActive
                      ? "bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                  }`}
                >
                  {submittingStatus
                    ? "Updating..."
                    : statusModalSupplier.isActive
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

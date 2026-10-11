"use client";

import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import {
  adminSupplierService,
  type SupplierStaff,
} from "@/features/admin/services/admin.service";

interface AdminSupplierDetailProps {
  supplierId: string;
  onBack: () => void;
}

export function AdminSupplierDetail({
  supplierId,
  onBack,
}: AdminSupplierDetailProps) {
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

  // Load supplier details & staff from backend
  const loadSupplierData = async () => {
    try {
      setLoading(true);
      const [detailsData, staffData] = await Promise.all([
        adminSupplierService.getSupplierDetails(supplierId),
        adminSupplierService.getSupplierStaff(supplierId),
      ]);
      setProfile(detailsData);
      setStaffList(staffData || []);
    } catch (err: any) {
      console.error("Failed to load supplier details:", err);
      toast.error("Failed to load supplier profile from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupplierData();
  }, [supplierId]);

  // Handle KYC Moderation
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
          ? `Verified ${profile.shopName || profile.fullName} successfully`
          : `Rejected KYC for ${profile.shopName || profile.fullName}`
      );
      setIsKycModalOpen(false);
      setRejectionReason("");
      loadSupplierData();
    } catch (err) {
      toast.error("Failed to update merchant verification");
    } finally {
      setSubmittingKyc(false);
    }
  };

  // Handle Account Status Toggle
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
    } catch (err) {
      toast.error("Failed to update supplier account status");
    } finally {
      setSubmittingStatus(false);
    }
  };


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-neutral-400 space-y-3">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-400" />
        <p className="text-sm font-medium">Loading full supplier profile from database...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8 text-center space-y-4">
        <Building2 className="mx-auto h-10 w-10 text-neutral-600" />
        <h2 className="text-lg font-bold text-white">Supplier Profile Not Found</h2>
        <p className="text-xs text-neutral-400">The requested supplier could not be located in the database.</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-800 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Suppliers List
        </button>
      </div>
    );
  }

  // Documents list in rectangle form
  const documents = [
    {
      title: "Trade License / Business Permit",
      type: "Trade License",
      docNumber: profile.tradeLicenseNumber,
      url: profile.businessLicenseUrl,
      description: "Official municipal commercial trade license issued by Ethiopian Ministry of Trade",
    },
    {
      title: "Tax Identification Certificate (TIN)",
      type: "TIN Certificate",
      docNumber: profile.tinNumber,
      url: profile.tinCertificateUrl,
      description: "Ministry of Revenue official taxpayer identification certificate",
    },
    {
      title: "Commercial Registration Certificate (Motri)",
      type: "Commercial Registration",
      docNumber: profile.tradeLicenseNumber,
      url: profile.commercialRegistrationUrl,
      description: "Principal commercial registry certificate & corporate charter",
    },
    {
      title: "Owner National ID / Fayda ID",
      type: "Owner ID",
      docNumber: profile.nationalIdOrFayda,
      url: profile.ownerIdUrl,
      description: "National biometric Fayda ID or Ethiopian passport of the principal owner",
    },
  ];

  const totalDrivers = staffList.filter((s) => s.role === "driver").length;
  const totalManagers = staffList.filter((s) => s.role === "branch_manager").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-800/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all cursor-pointer active:scale-95"
            title="Return to Suppliers List"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="cursor-pointer hover:text-neutral-200" onClick={onBack}>
                Suppliers & Fleet
              </span>
              <span>/</span>
              <span className="text-amber-400 font-medium truncate max-w-[200px]">
                {profile.shopName || profile.fullName}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 mt-0.5">
              {profile.shopName || profile.fullName}
              {profile.isVerifiedMerchant && (
                <span title="Verified Wholesale Merchant">
                  <BadgeCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                </span>
              )}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* KYC Moderate Button */}
          <button
            onClick={() => setIsKycModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3.5 py-2 text-xs font-semibold text-emerald-300 transition-all cursor-pointer active:scale-95"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Moderate KYC
          </button>

          {/* Account Status Toggle Button */}
          <button
            onClick={() => setIsStatusModalOpen(true)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
              profile.isActive
                ? "border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300"
                : "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300"
            }`}
          >
            {profile.isActive ? (
              <>
                <XCircle className="h-4 w-4 text-rose-400" />
                Suspend Account
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Activate Account
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3.5 backdrop-blur-md">
          <div className="text-[11px] font-medium text-neutral-400">KYC Status</div>
          <div className="mt-1 flex items-center gap-1.5">
            {profile.isVerifiedMerchant || profile.merchantKycStatus === "APPROVED" ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verified
              </span>
            ) : profile.merchantKycStatus === "PENDING" ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5" /> Pending Review
              </span>
            ) : profile.merchantKycStatus === "REJECTED" ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400">
                <XCircle className="h-3.5 w-3.5" /> Rejected
              </span>
            ) : (
              <span className="text-xs font-semibold text-neutral-400">Unsubmitted</span>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3.5 backdrop-blur-md">
          <div className="text-[11px] font-medium text-neutral-400">Account Standing</div>
          <div className="mt-1 flex items-center gap-1.5">
            {profile.isActive ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400">
                <span className="h-2 w-2 rounded-full bg-rose-400" /> Suspended
              </span>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3.5 backdrop-blur-md">
          <div className="text-[11px] font-medium text-neutral-400">Logistics Staff</div>
          <div className="mt-1 text-base font-bold text-cyan-400">
            {staffList.length} <span className="text-xs font-normal text-neutral-400">({totalManagers} Mgr, {totalDrivers} Drv)</span>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3.5 backdrop-blur-md">
          <div className="text-[11px] font-medium text-neutral-400">Catalog Products</div>
          <div className="mt-1 text-base font-bold text-white">
            {profile.stats?.postedProducts ?? 0} <span className="text-xs font-normal text-neutral-400">items</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-4 lg:col-span-1 rounded-xl border border-neutral-800 bg-neutral-900/60 p-3.5 backdrop-blur-md">
          <div className="text-[11px] font-medium text-neutral-400">Total Fulfilled Orders</div>
          <div className="mt-1 text-base font-bold text-amber-400">
            {profile.stats?.totalOrders ?? 0} <span className="text-xs font-normal text-neutral-400">orders</span>
          </div>
        </div>
      </div>

      {/* Main Details Grid: Identification & Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Company Profile & Legal Identity */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 space-y-4 backdrop-blur-md">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Building2 className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Company & Legal Identification
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-neutral-500 block text-[11px] font-medium">COMPANY / STORE NAME</span>
              <span className="text-white font-semibold text-sm">{profile.shopName || "—"}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px] font-medium">PRINCIPAL OWNER</span>
              <span className="text-neutral-200 font-medium">{profile.fullName || "—"}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px] font-medium">BUSINESS CLASSIFICATION</span>
              <span className="text-amber-300 font-medium">{profile.businessType || "Not specified"}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px] font-medium">USER ID (UUID)</span>
              <span className="font-mono text-neutral-400 text-[11px] truncate block" title={profile.userId}>
                {profile.userId}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px] font-medium">TRADE LICENSE NUMBER</span>
              <span className="font-mono text-amber-300 font-semibold">{profile.tradeLicenseNumber || "—"}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px] font-medium">TAX IDENTIFICATION (TIN)</span>
              <span className="font-mono text-amber-300 font-semibold">{profile.tinNumber || "—"}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px] font-medium">CONTACT EMAIL</span>
              <span className="text-neutral-300 truncate block">{profile.email || "—"}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px] font-medium">PHONE NUMBER</span>
              <span className="text-neutral-300">{profile.alternatePhone || "—"}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Warehousing & Logistics Hub */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 space-y-4 backdrop-blur-md">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
            <MapPin className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Warehousing & Logistics Hub
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-neutral-500 block text-[11px] font-medium">PRIMARY CITY</span>
              <span className="text-white font-medium">{profile.city || "—"}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px] font-medium">SUB-CITY DISTRICT</span>
              <span className="text-white font-medium">{profile.subCity || "—"}</span>
            </div>
            <div className="col-span-2">
              <span className="text-neutral-500 block text-[11px] font-medium">MARKET ZONE / INDUSTRIAL CORRIDOR</span>
              <span className="text-neutral-300">{profile.marketZone || "—"}</span>
            </div>
            <div className="col-span-2">
              <span className="text-neutral-500 block text-[11px] font-medium">SPECIFIC WAREHOUSE / DEPOT ADDRESS</span>
              <div className="mt-1 rounded-xl border border-neutral-800 bg-neutral-950 p-2.5 text-neutral-200 font-medium">
                {profile.specificLocation || "No specific depot location specified in database"}
              </div>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px] font-medium">MEMBER REGISTERED DATE</span>
              <span className="text-neutral-400">
                {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px] font-medium">PROFILE UPDATED</span>
              <span className="text-neutral-400">
                {profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: UPLOADED COMPLIANCE & KYC DOCUMENTS DISPLAYED IN RECTANGLE FORM  */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 border-b border-neutral-800 pb-2.5">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-400" />
              Uploaded Compliance & Regulatory Documents
              <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                Rectangular Preview
              </span>
            </h2>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Official trade licenses, tax certificates, and identity cards uploaded by this supplier to the database.
            </p>
          </div>
        </div>

        {/* Minimized Rectangle Form Documents Grid: 4 columns on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {documents.map((doc, idx) => {
            const hasUrl = Boolean(doc.url);
            const isImage =
              (hasUrl && /\.(jpg|jpeg|png|webp|svg|gif)($|\?)/i.test(doc.url)) ||
              (hasUrl && doc.url.includes("cloudinary.com") && !doc.url.endsWith(".pdf"));
            const isPdf = hasUrl && /\.pdf($|\?)/i.test(doc.url);

            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/70 p-2.5 transition-all duration-200 hover:border-neutral-700 hover:shadow-md"
              >
                {/* Header of Rectangle Card */}
                <div className="flex items-start justify-between gap-1.5 mb-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white text-xs truncate" title={doc.title}>
                      {doc.title}
                    </h3>
                    <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1" title={doc.description}>
                      {doc.description}
                    </p>
                    {doc.docNumber && (
                      <div className="mt-0.5 text-[10px] text-neutral-400 font-mono truncate">
                        Doc #: <span className="text-amber-300 font-semibold">{doc.docNumber}</span>
                      </div>
                    )}
                  </div>

                  {hasUrl && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                      title="Open full document in new tab"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                {/* THE MINIMIZED RECTANGULAR PREVIEW CONTAINER (Strictly Rectangle Form) */}
                <div className="relative w-full aspect-[16/10] overflow-hidden rounded-lg border border-neutral-800/90 bg-neutral-900/90 flex items-center justify-center group-hover:border-neutral-700 transition-all">
                  {hasUrl && isImage ? (
                    <>
                      <img
                        src={doc.url}
                        alt={doc.title}
                        className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                        onClick={() => setLightboxImage({ url: doc.url, title: doc.title })}
                      />
                      {/* Hover Overlay with Zoom Icon */}
                      <div
                        onClick={() => setLightboxImage({ url: doc.url, title: doc.title })}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[1px]"
                      >
                        <span className="inline-flex items-center gap-1 rounded-lg bg-black/85 border border-white/20 px-2 py-1 text-[10px] font-semibold text-white shadow-lg">
                          <ZoomIn className="h-3 w-3 text-amber-400" /> Click to Enlarge
                        </span>
                      </div>
                    </>
                  ) : hasUrl && isPdf ? (
                    <div className="flex flex-col items-center justify-center p-3 text-center space-y-1.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold text-xs">
                        PDF
                      </div>
                      <div className="text-[11px] font-medium text-neutral-300">Electronic PDF</div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md bg-neutral-800 hover:bg-neutral-700 px-2 py-1 text-[10px] font-medium text-white transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" /> View PDF
                      </a>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-3 text-center space-y-1 text-neutral-500">
                      <FileText className="h-6 w-6 text-neutral-600 stroke-[1.5]" />
                      <div className="text-[11px] font-medium text-neutral-400">No Document</div>
                      <div className="text-[10px] text-neutral-600">Pending upload</div>
                    </div>
                  )}
                </div>

                {/* Footer status pill */}
                <div className="mt-2 pt-1.5 border-t border-neutral-900 flex items-center justify-between text-[10px]">
                  <span className="text-neutral-500 truncate">{doc.type}</span>
                  {hasUrl ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium shrink-0">
                      <CheckCircle2 className="h-3 w-3" /> Uploaded
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-400 font-medium shrink-0">
                      <AlertTriangle className="h-3 w-3" /> Missing
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: STAFF & LOGISTICS FLEET ROSTER (READ-ONLY AUDITING)              */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              Assigned Personnel & Logistics Fleet Roster
              <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300">
                {staffList.length} Personnel
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Branch managers and heavy freight vehicle drivers operating for this supplier (Read-only inspection).
            </p>
          </div>
        </div>

        {staffList.length === 0 ? (
          <div className="py-12 text-center text-neutral-400 rounded-xl border border-dashed border-neutral-800 bg-neutral-950/40">
            <Users className="mx-auto h-8 w-8 text-neutral-600 mb-2" />
            <p className="text-sm font-medium text-neutral-300">No staff records assigned to this supplier</p>
            <p className="text-xs text-neutral-500 mt-1">
              No personnel or fleet drivers have been registered by this supplier in the database.
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
                  className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-4 transition-all hover:border-neutral-700 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border font-bold text-sm ${
                        isManager
                          ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
                          : "bg-cyan-500/15 border-cyan-500/30 text-cyan-300"
                      }`}
                    >
                      {isManager ? <UserCheck className="h-5 w-5" /> : <Truck className="h-5 w-5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-white text-sm truncate">{staff.fullName}</h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            isManager
                              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                              : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                          }`}
                        >
                          {isManager ? "Branch Manager" : "Fleet Driver"}
                        </span>
                        {staff.employeeId && (
                          <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] font-mono text-neutral-300">
                            {staff.employeeId}
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            staff.status === "active"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {staff.status === "active" ? "Active" : "Suspended"}
                        </span>
                      </div>

                      <div className="mt-1 text-xs text-neutral-400 space-y-0.5">
                        {staff.branchName && (
                          <div className="flex items-center gap-1 text-neutral-300 font-medium">
                            <Building2 className="h-3 w-3 text-amber-400" />
                            {staff.branchName}
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                          {staff.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-neutral-500" />
                              {staff.email}
                            </span>
                          )}
                          {staff.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-neutral-500" />
                              {staff.phone}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Driver vehicle details from DB */}
                      {isDriver && (
                        <div className="mt-2.5 rounded-lg border border-neutral-800/80 bg-neutral-900/60 p-2 text-xs space-y-1">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-neutral-300">
                            {staff.assignedVehicleType && (
                              <span className="font-semibold text-white flex items-center gap-1">
                                <Truck className="h-3 w-3 text-cyan-400" />
                                {staff.assignedVehicleType}
                              </span>
                            )}
                            {staff.assignedVehiclePlate && (
                              <span className="font-mono text-cyan-300 text-[11px] bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40">
                                {staff.assignedVehiclePlate}
                              </span>
                            )}
                            {staff.driverLicenseNumber && (
                              <span className="text-[11px] text-neutral-400">
                                License: <span className="font-mono text-neutral-300">{staff.driverLicenseNumber}</span>
                              </span>
                            )}
                          </div>
                          {staff.driverLicenseGrade && (
                            <div className="text-[10px] text-neutral-400">
                              Grade: {staff.driverLicenseGrade}
                            </div>
                          )}
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

      {/* ======================================================== */}
      {/* LIGHTBOX MODAL: FULL RESOLUTION ENLARGED DOCUMENT VIEW   */}
      {/* ======================================================== */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 p-4 bg-neutral-900/80">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-400" />
                <h3 className="font-bold text-white text-sm">{lightboxImage.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={lightboxImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open in Full Tab
                </a>
                <button
                  onClick={() => setLightboxImage(null)}
                  className="rounded-lg border border-neutral-800 p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/60">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: KYC VERIFY OR REJECT CONFIRMATION                 */}
      {/* ======================================================== */}
      {isKycModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                Moderate Supplier Verification
              </h3>
              <button
                onClick={() => setIsKycModalOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 space-y-1">
                <div className="font-bold text-white text-sm">{profile.shopName || profile.fullName}</div>
                <div className="text-neutral-400">Trade License: {profile.tradeLicenseNumber || "—"}</div>
                <div className="text-neutral-400">TIN: {profile.tinNumber || "—"}</div>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-medium">Rejection Reason (if rejecting):</label>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Trade license expired or name mismatch..."
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 p-2.5 text-white placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsKycModalOpen(false)}
                  className="rounded-xl border border-neutral-800 bg-neutral-800 px-3 py-2 text-neutral-300 hover:bg-neutral-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submittingKyc}
                  onClick={() => handleVerifyKyc(false)}
                  className="rounded-xl border border-rose-500/40 bg-rose-500/15 hover:bg-rose-500/25 px-3 py-2 font-semibold text-rose-300 disabled:opacity-50 cursor-pointer"
                >
                  Reject KYC
                </button>
                <button
                  type="button"
                  disabled={submittingKyc}
                  onClick={() => handleVerifyKyc(true)}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 font-bold text-neutral-950 disabled:opacity-50 shadow-md shadow-emerald-500/20 cursor-pointer"
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
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                {profile.isActive ? "Suspend Supplier Account" : "Activate Supplier Account"}
              </h3>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <p className="text-neutral-300">
                Are you sure you want to{" "}
                <strong className={profile.isActive ? "text-rose-400" : "text-emerald-400"}>
                  {profile.isActive ? "SUSPEND" : "ACTIVATE"}
                </strong>{" "}
                the wholesale account for <strong className="text-white">{profile.shopName || profile.fullName}</strong>?
              </p>

              {profile.isActive && (
                <div>
                  <label className="block text-neutral-400 mb-1">Reason for suspension:</label>
                  <textarea
                    rows={2}
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                    placeholder="e.g. Failure to maintain supply commitments or regulatory non-compliance..."
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 p-2.5 text-white placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="rounded-xl border border-neutral-800 bg-neutral-800 px-3.5 py-2 text-neutral-300 hover:bg-neutral-700 cursor-pointer"
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

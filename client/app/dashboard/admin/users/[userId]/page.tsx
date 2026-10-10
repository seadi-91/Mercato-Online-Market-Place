"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  ExternalLink,
  FileText,
  Mail,
  Package,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { API_CONFIG } from "@/config/api.config";
import { api } from "@/services/api/client";
import { useAdminUIStore } from "@/store/ui-store";

interface AdminUserDocument {
  type?: string;
  docNumber?: string;
  url?: string | null;
}

interface AdminUserDetail {
  id?: string;
  userId?: string;
  role?: string;
  fullName?: string;
  email?: string | null;
  alternatePhone?: string | null;
  shopName?: string | null;
  marketZone?: string | null;
  tradeLicenseNumber?: string | null;
  tinNumber?: string | null;
  businessType?: string | null;
  isVerifiedMerchant?: boolean;
  merchantKycStatus?: string;
  merchantRejectionReason?: string | null;
  vehicleType?: string | null;
  plateNumber?: string | null;
  drivingLicenseNumber?: string | null;
  isAvailable?: boolean;
  isVerifiedDelivery?: boolean;
  deliveryKycStatus?: string;
  deliveryRejectionReason?: string | null;
  isActive?: boolean;
  city?: string | null;
  subCity?: string | null;
  specificLocation?: string | null;
  businessLicenseUrl?: string | null;
  tinCertificateUrl?: string | null;
  commercialRegistrationUrl?: string | null;
  ownerIdUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  stats?: {
    postedProducts?: number;
    totalOrders?: number;
  };
  documents?: AdminUserDocument[];
}

function formatDate(value?: string) {
  if (!value) return "Not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function resolveDocumentUrl(value?: string | null) {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim(), API_CONFIG.baseURL);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | number | boolean | null | undefined;
}) {
  let displayValue = "Not provided";
  if (typeof value === "boolean") displayValue = value ? "Yes" : "No";
  else if (value !== null && value !== undefined && value !== "") {
    displayValue = String(value);
  }

  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-zinc-100">
        {displayValue}
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0d121f]/90 p-4 shadow-xl backdrop-blur-xl sm:p-5">
      <h2 className="mb-4 text-sm font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}

export default function AdminUserDetailPage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const setActiveTab = useAdminUIStore((state) => state.setActiveTab);
  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId;
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab("users");
  }, [setActiveTab]);

  useEffect(() => {
    let isCurrent = true;

    async function loadUser() {
      if (!userId) {
        setError("User ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const details = await api.get<AdminUserDetail>(
          `/admin/users/${encodeURIComponent(userId)}/details`,
        );
        if (isCurrent) setUser(details);
      } catch (loadError) {
        console.error("Failed to load admin user details:", loadError);
        if (isCurrent) {
          setError("Could not load this user's information from the backend.");
          toast.error("User details unavailable", {
            description: "The backend could not return the requested user.",
          });
        }
      } finally {
        if (isCurrent) setLoading(false);
      }
    }

    loadUser();
    return () => {
      isCurrent = false;
    };
  }, [userId]);

  const backToUsers = () => {
    setActiveTab("users");
    router.push("/dashboard/admin");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="mt-3 text-sm text-zinc-400">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
        <UserRound className="h-8 w-8 text-rose-400" />
        <p className="mt-3 text-sm text-zinc-300">{error || "User was not found."}</p>
        <button
          type="button"
          onClick={backToUsers}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to users
        </button>
      </div>
    );
  }

  const role = user.role || "User";
  const documents: AdminUserDocument[] =
    user.documents?.length
      ? user.documents
      : [
          { type: "Business license", url: user.businessLicenseUrl },
          { type: "TIN certificate", url: user.tinCertificateUrl },
          { type: "Commercial registration", url: user.commercialRegistrationUrl },
          { type: "Owner ID", url: user.ownerIdUrl },
        ];
  const userDocuments = documents.flatMap((document) => {
    const url = resolveDocumentUrl(document.url);
    return url
      ? [{
          label: document.type || "User document",
          reference: document.docNumber,
          url,
        }]
      : [];
  });

  return (
    <div className="w-full space-y-5 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={backToUsers}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Users
        </button>
        <p className="break-all text-xs text-zinc-500">
          User ID <span className="font-mono text-zinc-400">{user.userId || user.id || userId}</span>
        </p>
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#0d121f]/90 p-4 shadow-xl backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/25 to-purple-500/25 text-xl font-bold text-indigo-200">
              {(user.fullName || "U").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-300">
                Admin user detail
              </p>
              <h1 className="mt-1 break-words text-2xl font-bold text-white sm:text-3xl">
                {user.fullName || "User profile"}
              </h1>
              <p className="mt-1 text-sm text-zinc-400">{role}</p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${user.isActive === false ? "border-rose-500/30 bg-rose-500/10 text-rose-300" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"}`}>
              {user.isActive === false ? "Inactive" : "Active"}
            </span>
            {(user.isVerifiedMerchant || user.isVerifiedDelivery) && (
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                <BadgeCheck className="h-3.5 w-3.5" />
                Verified
              </span>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <Mail className="h-4 w-4 shrink-0 text-indigo-300" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Email</p>
              <p className="break-words text-sm text-zinc-200">{user.email || "Not provided"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <Phone className="h-4 w-4 shrink-0 text-indigo-300" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Phone</p>
              <p className="break-words text-sm text-zinc-200">{user.alternatePhone || "Not provided"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <Package className="h-4 w-4 shrink-0 text-indigo-300" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Products posted</p>
              <p className="text-sm font-semibold text-zinc-100">{user.stats?.postedProducts ?? 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-300" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Total orders</p>
              <p className="text-sm font-semibold text-zinc-100">{user.stats?.totalOrders ?? 0}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <div className="space-y-5">
          <Section title="Personal and location information">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              <DetailField label="Full name" value={user.fullName} />
              <DetailField label="Email" value={user.email} />
              <DetailField label="Phone" value={user.alternatePhone} />
              <DetailField label="City" value={user.city} />
              <DetailField label="Sub-city" value={user.subCity} />
              <DetailField label="Specific location" value={user.specificLocation} />
            </div>
          </Section>

          <Section title="Seller information">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              <DetailField label="Shop name" value={user.shopName} />
              <DetailField label="Market zone" value={user.marketZone} />
              <DetailField label="Business type" value={user.businessType} />
              <DetailField label="Trade license number" value={user.tradeLicenseNumber} />
              <DetailField label="TIN number" value={user.tinNumber} />
              <DetailField label="Merchant verified" value={user.isVerifiedMerchant} />
              <DetailField label="Merchant KYC status" value={user.merchantKycStatus} />
              <DetailField label="Merchant rejection reason" value={user.merchantRejectionReason} />
            </div>
          </Section>

          <Section title="Delivery information">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              <DetailField label="Vehicle type" value={user.vehicleType} />
              <DetailField label="Plate number" value={user.plateNumber} />
              <DetailField label="Driving license number" value={user.drivingLicenseNumber} />
              <DetailField label="Currently available" value={user.isAvailable} />
              <DetailField label="Delivery verified" value={user.isVerifiedDelivery} />
              <DetailField label="Delivery KYC status" value={user.deliveryKycStatus} />
              <DetailField label="Delivery rejection reason" value={user.deliveryRejectionReason} />
            </div>
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="Account information">
            <div className="grid gap-2">
              <DetailField label="Role" value={role} />
              <DetailField label="Account active" value={user.isActive} />
              <DetailField label="User ID" value={user.userId || user.id || userId} />
              <DetailField label="Joined" value={formatDate(user.createdAt)} />
              <DetailField label="Last updated" value={formatDate(user.updatedAt)} />
            </div>
          </Section>

          <Section title="Uploaded documents">
            {userDocuments.length > 0 ? (
              <div className="space-y-2">
                {userDocuments.map((document, index) => (
                  <a
                    key={`${document.label}-${index}`}
                    href={document.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.05]"
                  >
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-indigo-300" />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-zinc-200">{document.label}</span>
                      <span className="block break-all text-xs text-zinc-500">
                        {document.reference || "Open the uploaded file in a new tab"}
                      </span>
                    </span>
                    <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-xs font-medium text-indigo-300">
                      Open
                      <ExternalLink className="h-3.5 w-3.5" />
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-sm text-zinc-500">
                No uploaded documents available.
              </div>
            )}
          </Section>

        </div>
      </div>
    </div>
  );
}

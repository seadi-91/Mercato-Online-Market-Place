"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Package,
  Settings,
  Edit2,
  CheckCircle2,
  X,
  Save,
  Loader2,
  LogOut,
  Star,
  RefreshCw,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { CustomerHeader } from "@/components/layout/customer-header";
import { CustomerFooter } from "@/components/layout/footer";
import { CustomerBottomNav } from "@/components/layout/customer-bottom-nav";
import { useAuthStore } from "@/store";
import {
  fetchCustomerProfile,
  updateCustomerAddress,
  CustomerProfile,
} from "@/lib/api/customer";
import { fetchCustomerOrders } from "@/lib/api/orders";
import { toast } from "sonner";

function ProfilePageContent() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [orderStats, setOrderStats] = useState({ total: 0, delivered: 0, inTransit: 0 });
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    alternatePhone: "",
    city: "",
    subCity: "",
    specificLocation: "",
  });

  const loadProfile = async () => {
    if (!token) { setIsLoadingProfile(false); return; }
    setIsLoadingProfile(true);
    setProfileError(null);
    try {
      const data = await fetchCustomerProfile(token);
      if (data) {
        setProfile(data);
        setForm({
          fullName: data.fullName || user?.name || "",
          email: data.email || user?.email || "",
          alternatePhone: data.alternatePhone || "",
          city: data.city || "",
          subCity: data.subCity || "",
          specificLocation: data.specificLocation || "",
        });
      } else {
        setForm({
          fullName: user?.name || "",
          email: user?.email || "",
          alternatePhone: "",
          city: "",
          subCity: "",
          specificLocation: "",
        });
      }
    } catch {
      setProfileError("Could not load profile data.");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const loadOrders = async () => {
    if (!token || !user?.id) return;
    setIsLoadingOrders(true);
    try {
      const orders = await fetchCustomerOrders(token, user.id);
      setOrderStats({
        total: orders.length,
        delivered: orders.filter((o) => o.status === "DELIVERED").length,
        inTransit: orders.filter((o) => o.status === "IN_TRANSIT").length,
      });
    } catch { /* silent */ } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => { loadProfile(); loadOrders(); }, [token, user?.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { toast.error("You must be logged in."); return; }
    setIsSaving(true);
    try {
      const result = await updateCustomerAddress(token, {
        fullName: form.fullName,
        email: form.email,
        alternatePhone: form.alternatePhone,
        city: form.city,
        subCity: form.subCity,
        specificLocation: form.specificLocation,
      });
      if (result.success) {
        if (result.data) setProfile(result.data);
        setIsEditing(false);
        toast.success("Profile updated!", { description: "Your details have been saved." });
      } else {
        toast.error("Update failed", { description: result.error });
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      fullName: profile?.fullName || user?.name || "",
      email: profile?.email || user?.email || "",
      alternatePhone: profile?.alternatePhone || "",
      city: profile?.city || "",
      subCity: profile?.subCity || "",
      specificLocation: profile?.specificLocation || "",
    });
    setIsEditing(false);
  };

  const displayName = form.fullName || user?.name || "Customer";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col bg-[#070a12] text-zinc-100 selection:bg-indigo-500/30">
      <CustomerHeader />

      <main className="flex-1 flex items-start justify-center px-3 sm:px-4 py-6 sm:py-8 pb-24 sm:pb-12">
        <div className="w-full max-w-md space-y-3">

          {/* ── Profile Header ── */}
          <div className="rounded-2xl border border-white/10 bg-[#0b101f] p-5">
            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-lg font-black text-white shadow-lg shadow-indigo-500/25 select-none">
                  {initials}
                </div>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-indigo-500 border-2 border-[#0b101f] flex items-center justify-center">
                  <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base font-bold text-white truncate leading-tight">{displayName}</h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 text-[9.5px] font-semibold text-indigo-400 shrink-0">
                    <ShieldCheck className="h-2.5 w-2.5" />
                    Verified
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {user?.phoneNumber || profile?.phoneNumber || "Customer"} · MercatoX
                </p>
              </div>
              <button
                type="button"
                onClick={() => { loadProfile(); loadOrders(); }}
                disabled={isLoadingProfile}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Refresh"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoadingProfile ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* ── Quick Stats ── */}
          <div className="rounded-2xl border border-white/10 bg-[#0b101f] p-4">
            <div className="grid grid-cols-3 divide-x divide-white/5">
              {[
                { label: "Total Orders", value: isLoadingOrders ? "…" : orderStats.total, color: "text-white" },
                { label: "Delivered", value: isLoadingOrders ? "…" : orderStats.delivered, color: "text-indigo-400" },
                { label: "In Transit", value: isLoadingOrders ? "…" : orderStats.inTransit, color: "text-cyan-400" },
              ].map((stat) => (
                <div key={stat.label} className="text-center px-3 first:pl-0 last:pr-0">
                  <p className={`text-xl font-black font-mono ${stat.color}`}>{stat.value}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Personal Info Form ── */}
          <div className="rounded-2xl border border-white/10 bg-[#0b101f] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-xs font-bold text-white">Personal Info</span>
              </div>
              <button
                type="button"
                onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                className="flex items-center gap-1 text-[11px] font-semibold cursor-pointer transition-colors"
                style={{ color: isEditing ? "#ef4444" : "#818cf8" }}
              >
                {isEditing ? <><X className="h-3 w-3" />Cancel</> : <><Edit2 className="h-3 w-3" />Edit</>}
              </button>
            </div>

            {profileError && (
              <div className="mx-4 mt-3 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 text-[11px] text-red-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            {isLoadingProfile ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 rounded-xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : (
              <form onSubmit={handleSave} className="p-4 space-y-2">
                <CompactField icon={<User className="h-3.5 w-3.5" />} label="Full Name" value={form.fullName} disabled={!isEditing} onChange={(v) => setForm((f) => ({ ...f, fullName: v }))} placeholder="Your full name" />
                <CompactField icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={form.email} disabled={!isEditing} type="email" onChange={(v) => setForm((f) => ({ ...f, email: v }))} placeholder="your@email.com" mono />

                <CompactField icon={<Phone className="h-3.5 w-3.5" />} label="Alt. Phone" value={form.alternatePhone} disabled={!isEditing} onChange={(v) => setForm((f) => ({ ...f, alternatePhone: v }))} placeholder="+251..." mono />

                {/* Section divider */}
                <div className="flex items-center gap-2 pt-1 pb-0.5">
                  <MapPin className="h-3 w-3 text-zinc-600" />
                  <span className="text-[9.5px] text-zinc-600 uppercase tracking-wider font-semibold">Delivery Address</span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>

                <CompactField icon={<MapPin className="h-3.5 w-3.5" />} label="City" value={form.city} disabled={!isEditing} onChange={(v) => setForm((f) => ({ ...f, city: v }))} placeholder="Addis Ababa" />
                <CompactField label="Subcity" value={form.subCity} disabled={!isEditing} onChange={(v) => setForm((f) => ({ ...f, subCity: v }))} placeholder="e.g. Bole" />
                <CompactField label="Landmark / Woreda" value={form.specificLocation} disabled={!isEditing} onChange={(v) => setForm((f) => ({ ...f, specificLocation: v }))} placeholder="e.g. Woreda 03, near ..." />

                {isEditing && (
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isSaving
                      ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving...</>
                      : <><Save className="h-3.5 w-3.5" />Save Changes</>
                    }
                  </button>
                )}
              </form>
            )}
          </div>

          {/* ── Protection Badge ── */}
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-indigo-300">Buyer Protected Account</p>
              <p className="text-[11px] text-indigo-400/70 mt-0.5 leading-relaxed">
                Funds held securely — released only after doorstep OTP confirmation.
              </p>
            </div>
          </div>

          {/* ── Quick Links — vertical list ── */}
          <div className="rounded-2xl border border-white/10 bg-[#0b101f] overflow-hidden divide-y divide-white/5">
            {[
              { href: "/orders",    icon: <Package  className="h-4 w-4 text-indigo-400" />,  label: "My Orders",  sub: "View all your purchases",  isLink: true  },
              { href: "/favorites", icon: <Star     className="h-4 w-4 text-amber-400" />,   label: "Favorites",  sub: "Saved products",            isLink: true  },
              { href: "/settings",  icon: <Settings className="h-4 w-4 text-zinc-400" />,    label: "Settings",   sub: "Account preferences",       isLink: true  },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.03] transition-colors group"
              >
                <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">{item.label}</p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">{item.sub}</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
              </Link>
            ))}

            {/* Sign Out — destructive row */}
            <button
              type="button"
              onClick={() => { logout(); toast.success("Signed out successfully"); router.push("/login"); }}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-500/5 transition-colors group cursor-pointer"
            >
              <div className="h-8 w-8 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <LogOut className="h-4 w-4 text-red-400" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-semibold text-red-400 group-hover:text-red-300 transition-colors">Sign Out</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">Log out of your account</p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-700 group-hover:text-red-500/50 transition-colors shrink-0" />
            </button>
          </div>

        </div>
      </main>

      {/* Floating Mobile Bottom Navigation Bar */}
      <CustomerBottomNav />

      <CustomerFooter />
    </div>
  );
}

/* Compact inline field component */
function CompactField({
  icon,
  label,
  value,
  disabled,
  onChange,
  type = "text",
  placeholder,
  mono,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  disabled: boolean;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-xs transition-colors ${disabled ? "border-white/5 bg-white/[0.03]" : "border-indigo-500/40 bg-indigo-500/5 ring-1 ring-indigo-500/20"}`}>
      {icon && <span className="text-zinc-500 shrink-0">{icon}</span>}
      <div className="flex-1 min-w-0">
        <p className="text-[9.5px] text-zinc-500 leading-none mb-0.5">{label}</p>
        <input
          type={type}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-transparent outline-none text-[11.5px] text-zinc-200 placeholder:text-zinc-600 disabled:text-zinc-400 ${mono ? "font-mono" : ""}`}
        />
      </div>
    </div>
  );
}

export default function CustomerProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#070a12]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      }
    >
      <ProfilePageContent />
    </Suspense>
  );
}


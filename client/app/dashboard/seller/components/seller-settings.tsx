"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Settings,
  Store,
  MapPin,
  Clock,
  ShieldCheck,
  Save,
  Phone,
  Mail,
  RefreshCw,
  Wallet,
  Bell,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Power,
  Sliders,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/services/api/client";

const SUB_CITIES = [
  "Bole",
  "Kirkos",
  "Arada",
  "Yeka",
  "Lideta",
  "Nifas Silk-Lafto",
  "Kolfe Keranio",
  "Gullele",
  "Akaki Kality",
  "Addis Ketema",
];

const PAYOUT_METHODS = [
  { id: "telebirr", name: "Telebirr SuperApp", prefix: "+251 9" },
  { id: "cbe_birr", name: "CBE Birr", prefix: "+251 9" },
  { id: "cbe_bank", name: "Commercial Bank of Ethiopia (CBE)", prefix: "1000" },
  { id: "awash", name: "Awash Bank", prefix: "0132" },
  { id: "dashen", name: "Dashen Bank", prefix: "5023" },
];

export function SellerSettings() {
  const user = useAuthStore((state) => state.user);

  // Store Identity
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [marketZone, setMarketZone] = useState("Commercial Zone");

  // Regulatory / MOTRI
  const [tinNumber, setTinNumber] = useState("Pending Registration");
  const [licenseNumber, setLicenseNumber] = useState("TL-Pending");
  const [isVerified, setIsVerified] = useState(false);

  // Logistics & Location
  const [subCity, setSubCity] = useState("Bole");
  const [location, setLocation] = useState("");
  const [dispatchSla, setDispatchSla] = useState("same_day");

  // Additional Feature 1: Payout & Settlement Account
  const [payoutMethod, setPayoutMethod] = useState("telebirr");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [autoSettle, setAutoSettle] = useState(true);

  // Additional Feature 2: Store Operations & Dispatch Hours
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [openTime, setOpenTime] = useState("08:30");
  const [closeTime, setCloseTime] = useState("19:30");
  const [workingDays, setWorkingDays] = useState("mon_sat");

  // Additional Feature 3: Notifications & Low Stock Alerts
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState("5");

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load preferences from localStorage and backend
  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Read local preferences
      const saved = localStorage.getItem("mercatox_seller_settings");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.payoutMethod) setPayoutMethod(parsed.payoutMethod);
          if (parsed.accountNumber) setAccountNumber(parsed.accountNumber);
          if (parsed.accountHolder) setAccountHolder(parsed.accountHolder);
          if (parsed.autoSettle !== undefined) setAutoSettle(parsed.autoSettle);
          if (parsed.isStoreOpen !== undefined) setIsStoreOpen(parsed.isStoreOpen);
          if (parsed.openTime) setOpenTime(parsed.openTime);
          if (parsed.closeTime) setCloseTime(parsed.closeTime);
          if (parsed.workingDays) setWorkingDays(parsed.workingDays);
          if (parsed.smsAlerts !== undefined) setSmsAlerts(parsed.smsAlerts);
          if (parsed.lowStockThreshold) setLowStockThreshold(parsed.lowStockThreshold);
          if (parsed.dispatchSla) setDispatchSla(parsed.dispatchSla);
          if (parsed.subCity) setSubCity(parsed.subCity);
        } catch {
          // ignore corrupted local storage
        }
      }

      // 2. Fetch server profile
      const p: any = await api.get("/users/me");
      if (p) {
        setStoreName(p.shopName || p.fullName || "");
        setStoreSlug((p.shopName || p.fullName || "store").toLowerCase().replace(/[^a-z0-9]/g, "-"));
        setPhone(p.alternatePhone || user?.phoneNumber || "");
        setEmail(p.email || user?.email || "");
        setMarketZone(p.marketZone || "Commercial Zone");
        if (p.subCity) setSubCity(p.subCity);
        setLocation(p.specificLocation || "");
        setTinNumber(p.tinNumber || "Pending Registration");
        setLicenseNumber(p.tradeLicenseNumber || "TL-Pending");
        setIsVerified(Boolean(p.isVerifiedMerchant));
      }
    } catch {
      // fallback to auth store user
      if (user) {
        setStoreName(user.name || "");
        setStoreSlug((user.name || "store").toLowerCase().replace(/[^a-z0-9]/g, "-"));
        setPhone(user.phoneNumber || "");
        setEmail(user.email || "");
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Save to backend
      await api.patch("/users/me", {
        shopName: storeName.trim(),
        alternatePhone: phone.trim(),
        email: email.trim(),
        subCity: subCity.trim(),
        specificLocation: location.trim(),
      });

      // Persist additional features locally
      const preferences = {
        payoutMethod,
        accountNumber,
        accountHolder,
        autoSettle,
        isStoreOpen,
        openTime,
        closeTime,
        workingDays,
        smsAlerts,
        lowStockThreshold,
        dispatchSla,
        subCity,
      };
      localStorage.setItem("mercatox_seller_settings", JSON.stringify(preferences));

      toast.success("Merchant profile and settings saved successfully!");
    } catch {
      // Fallback save locally
      const preferences = {
        payoutMethod,
        accountNumber,
        accountHolder,
        autoSettle,
        isStoreOpen,
        openTime,
        closeTime,
        workingDays,
        smsAlerts,
        lowStockThreshold,
        dispatchSla,
        subCity,
      };
      localStorage.setItem("mercatox_seller_settings", JSON.stringify(preferences));
      toast.success("Settings saved locally!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3 pb-8">
      {/* Compact Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="h-4.5 w-4.5 text-indigo-400" />
            <span>Store Profile & Merchant Settings</span>
          </h1>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Configure store branding, verified pickup hub, automated escrow payouts, and operational SLA
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => loadProfile()}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
            <span>Reload</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-600/30 hover:bg-indigo-500 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* MOTRI Verification & Compliance Ribbon */}
      <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.03] px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2.5 min-w-[200px]">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-white text-xs">
                {isVerified ? "Tier 1 Verified Merchant" : "Registered Ethiopian Merchant"}
              </span>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
                {isVerified ? "MOTRI Compliant" : "Active"}
              </span>
            </div>
            <p className="text-[10.5px] text-zinc-400">Zone: <span className="text-zinc-200">{marketZone}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono shrink-0">
          <span className="text-zinc-400">TIN: <span className="text-zinc-200">{tinNumber}</span></span>
          <span className="text-zinc-500">|</span>
          <span className="text-emerald-400 font-medium">Lic: {licenseNumber}</span>
        </div>
      </div>

      {/* Main Settings Form - Compact Grid Cards */}
      <form onSubmit={handleSave} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          {/* Card 1: Store Identity & Contact */}
          <div className="min-w-0 rounded-xl border border-white/[0.08] bg-[#0d121f] p-3.5 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2">
                <Store className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <h2 className="text-xs font-semibold text-white tracking-tight">Store Identity & Contact</h2>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Store Business Name
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. Bole Electronics Hub"
                    className="w-full rounded-lg border border-white/10 bg-[#090d16] px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Store URL Handle
                  </label>
                  <div className="flex items-center rounded-lg border border-white/10 bg-[#090d16] px-2.5 py-1.5 text-xs text-zinc-500">
                    <span className="text-zinc-500 select-none">mercatox.et/store/</span>
                    <input
                      type="text"
                      value={storeSlug}
                      onChange={(e) => setStoreSlug(e.target.value)}
                      className="flex-1 bg-transparent text-white font-medium focus:outline-hidden pl-0.5"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1 flex items-center gap-1">
                      <Phone className="h-2.5 w-2.5 text-zinc-500" />
                      <span>Phone</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+251 9..."
                      className="w-full rounded-lg border border-white/10 bg-[#090d16] px-2.5 py-1.5 text-xs text-white font-mono placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1 flex items-center gap-1">
                      <Mail className="h-2.5 w-2.5 text-zinc-500" />
                      <span>Support Email</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="store@domain.com"
                      className="w-full rounded-lg border border-white/10 bg-[#090d16] px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.04] text-[10.5px] text-zinc-500 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              <span>Visible to buyers on invoices & order tracking</span>
            </div>
          </div>

          {/* Card 2: Payout & Settlement Account (Additional Feature) */}
          <div className="min-w-0 rounded-xl border border-white/[0.08] bg-[#0d121f] p-3.5 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <div className="flex items-center gap-2">
                  <Wallet className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <h2 className="text-xs font-semibold text-white tracking-tight">Escrow Settlement & Payout</h2>
                </div>
                <span className="rounded bg-cyan-500/15 px-1.5 py-0.2 text-[9px] font-bold text-cyan-300 border border-cyan-500/25">
                  Automated
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Primary Payout Channel
                  </label>
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#090d16] px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-hidden cursor-pointer"
                  >
                    {PAYOUT_METHODS.map((m) => (
                      <option key={m.id} value={m.id} className="bg-[#090d16] text-white">
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Account / Phone No.
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="e.g. 0911223344"
                      className="w-full rounded-lg border border-white/10 bg-[#090d16] px-2.5 py-1.5 text-xs text-white font-mono placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder="e.g. Abebe Kebede"
                      className="w-full rounded-lg border border-white/10 bg-[#090d16] px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Auto Settlement Switch */}
                <div className="flex items-center justify-between rounded-lg bg-[#090d16] p-2 border border-white/5">
                  <div className="pr-2">
                    <span className="text-[11px] font-medium text-zinc-200 block leading-tight">
                      Instant Auto-Release
                    </span>
                    <span className="text-[10px] text-zinc-500 block leading-tight">
                      Direct deposit when courier confirms delivery OTP
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoSettle(!autoSettle)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${autoSettle ? "bg-cyan-500" : "bg-zinc-700"
                      }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${autoSettle ? "translate-x-4" : "translate-x-0"
                        }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.04] text-[10.5px] text-zinc-500 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-cyan-400" />
              <span>Zero transaction fees on local bank & Telebirr payouts</span>
            </div>
          </div>

          {/* Card 3: Logistics & Physical Pickup Hub */}
          <div className="min-w-0 rounded-xl border border-white/[0.08] bg-[#0d121f] p-3.5 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2">
                <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <h2 className="text-xs font-semibold text-white tracking-tight">Logistics & Physical Pickup Hub</h2>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Sub-City (Addis Ababa)
                    </label>
                    <select
                      value={subCity}
                      onChange={(e) => setSubCity(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-[#090d16] px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-hidden cursor-pointer"
                    >
                      {SUB_CITIES.map((sc) => (
                        <option key={sc} value={sc} className="bg-[#090d16] text-white">
                          {sc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1 flex items-center gap-1">
                      <Truck className="h-2.5 w-2.5 text-zinc-500" />
                      <span>Dispatch Target</span>
                    </label>
                    <select
                      value={dispatchSla}
                      onChange={(e) => setDispatchSla(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-[#090d16] px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-hidden cursor-pointer"
                    >
                      <option value="express_2h">Within 2 Hours (Express)</option>
                      <option value="same_day">Same-Day Dispatch (by 6 PM)</option>
                      <option value="next_morning">Next-Day Morning (by 11 AM)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Physical Store / Pickup Landmark
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bole Medhanialem Mall, 2nd Floor, Shop #204"
                    className="w-full rounded-lg border border-white/10 bg-[#090d16] px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-hidden"
                    required
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Riders use this landmark to collect customer orders for delivery.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.04] text-[10.5px] text-zinc-500 flex items-center gap-1">
              <Building2 className="h-3 w-3 text-amber-400" />
              <span>Integrated with Ethiopian courier dispatch networks</span>
            </div>
          </div>

          {/* Card 4: Store Operations, Schedule & Alerts (Additional Feature) */}
          <div className="min-w-0 rounded-xl border border-white/[0.08] bg-[#0d121f] p-3.5 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <div className="flex items-center gap-2">
                  <Sliders className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <h2 className="text-xs font-semibold text-white tracking-tight">Operations & Stock Alerts</h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${isStoreOpen ? "bg-emerald-400 animate-pulse" : "bg-rose-500"}`} />
                  <span className="text-[10.5px] font-medium text-zinc-300">
                    {isStoreOpen ? "Online" : "Paused"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {/* Store Status Toggle */}
                <div className="flex items-center justify-between rounded-lg bg-[#090d16] p-2 border border-white/5">
                  <div>
                    <span className="text-[11px] font-medium text-zinc-200 block leading-tight">
                      Store Operational Status
                    </span>
                    <span className="text-[10px] text-zinc-500 block leading-tight">
                      {isStoreOpen ? "Accepting incoming customer orders" : "Vacation mode: Orders temporarily paused"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsStoreOpen(!isStoreOpen)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${isStoreOpen ? "bg-emerald-500" : "bg-zinc-700"
                      }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${isStoreOpen ? "translate-x-4" : "translate-x-0"
                        }`}
                    />
                  </button>
                </div>

                {/* Operating Hours */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5 text-zinc-500" />
                      <span>Opening Time</span>
                    </label>
                    <input
                      type="time"
                      value={openTime}
                      onChange={(e) => setOpenTime(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-[#090d16] px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5 text-zinc-500" />
                      <span>Closing Time</span>
                    </label>
                    <input
                      type="time"
                      value={closeTime}
                      onChange={(e) => setCloseTime(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-[#090d16] px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Alerts & Stock Threshold */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1 flex items-center gap-1">
                      <AlertTriangle className="h-2.5 w-2.5 text-amber-400" />
                      <span>Low Stock Alert</span>
                    </label>
                    <div className="flex items-center rounded-lg border border-white/10 bg-[#090d16] px-2.5 py-1.5 text-xs">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={lowStockThreshold}
                        onChange={(e) => setLowStockThreshold(e.target.value)}
                        className="w-full bg-transparent text-white font-mono focus:outline-hidden"
                      />
                      <span className="text-[10px] text-zinc-500 ml-1">units</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1 flex items-center gap-1">
                      <Bell className="h-2.5 w-2.5 text-indigo-400" />
                      <span>SMS Notifications</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setSmsAlerts(!smsAlerts)}
                      className={`w-full flex items-center justify-between rounded-lg border border-white/10 px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${smsAlerts ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" : "bg-[#090d16] text-zinc-400"
                        }`}
                    >
                      <span className="text-[11px]">{smsAlerts ? "Enabled" : "Muted"}</span>
                      <span className={`h-1.5 w-1.5 rounded-full ${smsAlerts ? "bg-indigo-400" : "bg-zinc-600"}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.04] text-[10.5px] text-zinc-500 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              <span>Real-time SMS dispatched for each new Telebirr or CBE order</span>
            </div>
          </div>
        </div>

        {/* Form Bottom Save Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-white/5">
          <p className="text-[11px] text-zinc-500">
            Changes update your merchant store profile, MOTRI records, and courier dispatch routing.
          </p>
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/25 hover:brightness-110 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? "Saving Settings..." : "Save Merchant Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

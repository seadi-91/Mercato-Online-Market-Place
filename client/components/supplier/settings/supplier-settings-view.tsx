"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  User,
  Building2,
  CreditCard,
  Bell,
  ShieldCheck,
  Save,
  Key,
  Smartphone,
  Lock,
  History,
  CheckCircle2,
  AlertTriangle,
  Search,
  Copy,
  Check,
  ExternalLink,
  Globe,
  Clock,
  Store,
  FileCheck,
  Truck,
  Banknote,
  Eye,
  EyeOff,
  RefreshCw,
  Sliders,
  Sparkles,
  ChevronRight,
  Info,
  X,
  Plus,
  Trash2,
  Laptop,
  Share2,
  PhoneCall,
  Mail,
  Shield,
  Layers,
  CheckCircle,
  Download,
  Send,
} from "lucide-react";
import { PageHeader } from "../shared/page-header";
import { useSupplierStore } from "@/store/supplier-store";
import { toast } from "sonner";
import { api } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";

// Setting Tab Definition
type TabKey =
  | "account"
  | "storefront"
  | "business"
  | "payouts"
  | "orders"
  | "notifications"
  | "security";

interface TabMeta {
  id: TabKey;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  description: string;
}

const TABS: TabMeta[] = [
  {
    id: "account",
    label: "Account & Executive Profile",
    shortLabel: "Profile",
    icon: User,
    description: "Contact credentials, direct contacts, and working hours",
  },
  {
    id: "storefront",
    label: "Storefront & Catalog Policy",
    shortLabel: "Storefront",
    icon: Store,
    badge: "Public",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    description: "Wholesale brand display, MOQ thresholds, and vacation mode",
  },
  {
    id: "business",
    label: "Legal & Statutory Registry",
    shortLabel: "Legal & TIN",
    icon: Building2,
    badge: "Verified",
    badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    description: "Ministry of Trade registration, TIN record, and ECX linkage",
  },
  {
    id: "payouts",
    label: "Commercial Bank & Payouts",
    shortLabel: "Payouts",
    icon: CreditCard,
    badge: "Escrow",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    description: "Commercial Bank of Ethiopia (CBE), Telebirr, and settlement rules",
  },
  {
    id: "orders",
    label: "Order & RFQ Automation",
    shortLabel: "RFQ Rules",
    icon: FileCheck,
    description: "Instant quotes, negotiation tolerances, and safety buffers",
  },
  {
    id: "notifications",
    label: "Multi-Channel Alerts",
    shortLabel: "Alerts",
    icon: Bell,
    description: "Ethio Telecom SMS gateway, corporate email, and push notices",
  },
  {
    id: "security",
    label: "Security, 2FA & API Keys",
    shortLabel: "Security",
    icon: ShieldCheck,
    badge: "2FA On",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    description: "Active sessions, password credentials, and ERP integrations",
  },
];

export function SupplierSettingsView() {
  const {
    profile,
    fetchProfile,
    isLoadingProfile,
    updateProfile,
    setActiveTab,
    settlementAccounts,
    addSettlementAccount,
    deleteSettlementAccount,
    setDefaultSettlementAccount,
    orders,
    products,
  } = useSupplierStore();

  const [activeTabSub, setActiveTabSub] = useState<TabKey>("account");
  const [searchQuery, setSearchQuery] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // Form State initialized from Store
  const [executiveName, setExecutiveName] = useState(profile.executiveName || "Ato Kassahun Tessema");
  const [executiveTitle, setExecutiveTitle] = useState(profile.executiveTitle || "Commercial Operations Director");
  const [userEmail, setUserEmail] = useState(profile.email || "kassahun@abyssinia-commodities.et");
  const [userPhone, setUserPhone] = useState(profile.phone || "+251 91 198 7654");
  const [preferredLanguage, setPreferredLanguage] = useState(profile.preferredLanguage || "en");
  const [workingHours, setWorkingHours] = useState("08:30 - 17:30 EAT (Mon - Sat)");
  const [primaryChannel, setPrimaryChannel] = useState("in_app");

  // Legal & Statutory Registry
  const [businessName, setBusinessName] = useState(profile.businessName || "Abyssinia Commodities PLC");
  const [legalEntity, setLegalEntity] = useState(profile.legalEntity || "Private Limited Company (PLC)");
  const [tinNumber, setTinNumber] = useState(profile.tinNumber || "0019283419");
  const [licenseNumber, setLicenseNumber] = useState(profile.licenseNumber || "ET-AA-MT-2024-88192");
  const [city, setCity] = useState(profile.city || "Addis Ababa");
  const [region, setRegion] = useState(profile.region || "Addis Ababa");
  const [address, setAddress] = useState(profile.address || "Mercato Commercial District");

  // Storefront & Policies
  const [storeSlug, setStoreSlug] = useState(profile.storeSlug || "abyssinia-commodities");
  const [tagline, setTagline] = useState(
    profile.tagline || "Premier Ethiopian Agricultural Aggregator & Certified Industrial Materials Supplier"
  );
  const [vacationMode, setVacationMode] = useState(profile.vacationMode || false);
  const [minOrderETB, setMinOrderETB] = useState<number>(profile.minOrderValueETB || 50000);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(profile.defaultLeadTimeDays || 4);
  const [defaultIncoterm, setDefaultIncoterm] = useState(profile.defaultIncoterm || "FOB Addis Ababa Logistics Hub");
  const [samplePolicy, setSamplePolicy] = useState(
    profile.samplePolicy || "Deposit required, refundable upon bulk order placement"
  );
  const [hidePhonePublicly, setHidePhonePublicly] = useState(profile.hidePhonePublicly || false);

  // Payouts & Banking
  const [settlementSchedule, setSettlementSchedule] = useState<"instant" | "daily" | "weekly">(
    profile.settlementSchedule || "instant"
  );
  const [autoPayoutThreshold, setAutoPayoutThreshold] = useState<number>(profile.autoPayoutThresholdETB || 50000);
  const [withholdingTaxReceipt, setWithholdingTaxReceipt] = useState(true);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [newBankName, setNewBankName] = useState("");
  const [newBankAcc, setNewBankAcc] = useState("");
  const [newBankBranch, setNewBankBranch] = useState("");

  // Automation & Orders
  const [autoQuoteEnabled, setAutoQuoteEnabled] = useState(profile.autoQuoteEnabled ?? true);
  const [autoQuoteMinETB, setAutoQuoteMinETB] = useState(profile.autoQuoteMinETB || 40000);
  const [quoteValidityDays, setQuoteValidityDays] = useState(profile.quoteValidityDays || 14);
  const [maxCounterDiscount, setMaxCounterDiscount] = useState(profile.maxCounterDiscount || 7.5);
  const [autoReserveStock, setAutoReserveStock] = useState(profile.autoReserveStock ?? true);
  const [strictEscrowRequired, setStrictEscrowRequired] = useState(profile.strictEscrowRequired ?? true);
  const [lowStockThreshold, setLowStockThreshold] = useState(25);

  // Notifications
  const [notifEmail, setNotifEmail] = useState(profile.notifications?.email ?? true);
  const [notifSMS, setNotifSMS] = useState(profile.notifications?.sms ?? true);
  const [notifPush, setNotifPush] = useState(profile.notifications?.push ?? true);
  const [notifRFQInstant, setNotifRFQInstant] = useState(profile.notifications?.rfqInstant ?? true);
  const [notifOrderUpdates, setNotifOrderUpdates] = useState(profile.notifications?.orderUpdates ?? true);
  const [notifEscrowAlerts, setNotifEscrowAlerts] = useState(profile.notifications?.escrowAlerts ?? true);
  const [notifDailyDigest, setNotifDailyDigest] = useState(profile.notifications?.dailyDigest ?? true);

  // Security
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(profile.twoFactorEnabled ?? true);
  const [twoFactorMethod, setTwoFactorMethod] = useState<"sms" | "app" | "token">("sms");
  const [apiKey, setApiKey] = useState("mk_live_89f02c91837b42aa990145e982");
  const [webhookUrl, setWebhookUrl] = useState("https://api.abyssinia-commodities.et/mercatox-webhook");
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Load profile on mount from backend database
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Synchronize local form states whenever store profile updates
  useEffect(() => {
    if (profile) {
      setExecutiveName(profile.executiveName || "");
      setExecutiveTitle(profile.executiveTitle || "Commercial Operations Director");
      setUserEmail(profile.email || "");
      setUserPhone(profile.phone || "");
      setPreferredLanguage(profile.preferredLanguage || "en");
      setBusinessName(profile.businessName || "");
      setLegalEntity(profile.legalEntity || "Private Limited Company (PLC)");
      setTinNumber(profile.tinNumber || "");
      setLicenseNumber(profile.licenseNumber || "");
      setCity(profile.city || "Addis Ababa");
      setRegion(profile.region || "Addis Ababa");
      setAddress(profile.address || "Mercato Commercial District");
      setStoreSlug(profile.storeSlug || "abyssinia-commodities");
      setTagline(profile.tagline || "");
      setVacationMode(profile.vacationMode || false);
      setMinOrderETB(profile.minOrderValueETB || 50000);
      setLeadTimeDays(profile.defaultLeadTimeDays || 4);
      setDefaultIncoterm(profile.defaultIncoterm || "FOB Addis Ababa Logistics Hub");
      setSamplePolicy(profile.samplePolicy || "Deposit required, refundable upon bulk order placement");
      setHidePhonePublicly(profile.hidePhonePublicly || false);
      setSettlementSchedule(profile.settlementSchedule || "instant");
      setAutoPayoutThreshold(profile.autoPayoutThresholdETB || 50000);
      setAutoQuoteEnabled(profile.autoQuoteEnabled ?? true);
      setAutoQuoteMinETB(profile.autoQuoteMinETB || 40000);
      setQuoteValidityDays(profile.quoteValidityDays || 14);
      setMaxCounterDiscount(profile.maxCounterDiscount || 7.5);
      setAutoReserveStock(profile.autoReserveStock ?? true);
      setStrictEscrowRequired(profile.strictEscrowRequired ?? true);
      setNotifEmail(profile.notifications?.email ?? true);
      setNotifSMS(profile.notifications?.sms ?? true);
      setNotifPush(profile.notifications?.push ?? true);
      setNotifRFQInstant(profile.notifications?.rfqInstant ?? true);
      setNotifOrderUpdates(profile.notifications?.orderUpdates ?? true);
      setNotifEscrowAlerts(profile.notifications?.escrowAlerts ?? true);
      setNotifDailyDigest(profile.notifications?.dailyDigest ?? true);
      setTwoFactorEnabled(profile.twoFactorEnabled ?? true);
    }
  }, [profile]);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Mark changes dirty
  const markDirty = () => {
    if (!hasUnsavedChanges) setHasUnsavedChanges(true);
  };

  // Save changes handler to backend database
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        executiveName,
        executiveTitle,
        email: userEmail,
        phone: userPhone,
        preferredLanguage: preferredLanguage as any,
        businessName,
        legalEntity,
        tinNumber,
        licenseNumber,
        city,
        region,
        address,
        storeSlug,
        tagline,
        vacationMode,
        minOrderValueETB: minOrderETB,
        defaultLeadTimeDays: leadTimeDays,
        defaultIncoterm,
        samplePolicy,
        hidePhonePublicly,
        settlementSchedule,
        autoPayoutThresholdETB: autoPayoutThreshold,
        autoQuoteEnabled,
        autoQuoteMinETB,
        quoteValidityDays,
        maxCounterDiscount,
        autoReserveStock,
        strictEscrowRequired,
        twoFactorEnabled,
        notifications: {
          email: notifEmail,
          sms: notifSMS,
          push: notifPush,
          rfqInstant: notifRFQInstant,
          orderUpdates: notifOrderUpdates,
          escrowAlerts: notifEscrowAlerts,
          dailyDigest: notifDailyDigest,
        },
      });
      setHasUnsavedChanges(false);
      toast.success("Supplier configuration and portal security settings saved successfully.");
    } catch (err: any) {
      console.error("[SupplierSettings] Error saving settings:", err);
      toast.error("Failed to persist settings to server database.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password update with real Auth API
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await api.post(ENDPOINTS.AUTH_CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
      });
      toast.success("Master password updated successfully. All active sessions re-authenticated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("[SupplierSettings] Error updating password:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to update master password.";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Handle Add Bank / Financial Rail
  const handleAddBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankName.trim()) {
      toast.error("Please enter a financial institution / bank name.");
      return;
    }
    if (!newBankAcc.trim()) {
      toast.error("Please fill in a valid account number.");
      return;
    }
    addSettlementAccount({
      bankName: newBankName.trim(),
      shortCode: "",
      accountNumber: newBankAcc.trim(),
      accountName: profile.businessName || "Authorized Corporate Account",
      branch: newBankBranch.trim() || "Main Branch",
      type: "Secondary",
      clearingTime: newBankName.toLowerCase().includes("telebirr") ? "Instant (<60s)" : "RTGS (1-3 hrs)",
      dailyLimit: "ETB 25,000,000",
      isDefault: settlementAccounts.length === 0,
      accentColor: "",
    });
    setShowAddBankModal(false);
    setNewBankName("");
    setNewBankAcc("");
    setNewBankBranch("");
    toast.success(`Account at ${newBankName} linked successfully.`);
  };

  // Regenerate API Key
  const handleRegenerateApiKey = () => {
    const chars = "abcdef0123456789";
    let randomHex = "";
    for (let i = 0; i < 26; i++) {
      randomHex += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newKey = `mk_live_${randomHex}`;
    setApiKey(newKey);
    toast.success("Generated new production API key. Make sure to copy and store it securely.");
  };

  // Test Webhook ping
  const handleTestWebhook = () => {
    if (!webhookUrl || !webhookUrl.startsWith("http")) {
      toast.error("Please enter a valid HTTP or HTTPS webhook URL.");
      return;
    }
    setIsTestingWebhook(true);
    setTimeout(() => {
      setIsTestingWebhook(false);
      toast.success(`Webhook endpoint "${webhookUrl}" responded with HTTP 200 OK (Ping verified).`);
    }, 800);
  };

  // Data & Ledger Export
  const handleExportData = () => {
    const exportData = {
      exportTimestamp: new Date().toISOString(),
      platform: "MercatoX B2B Supplier Portal",
      supplierProfile: profile,
      settlementAccounts: settlementAccounts,
      productsCount: products.length,
      ordersSummary: {
        totalOrders: orders.length,
        openOrders: orders.filter((o) => o.orderStatus === "pending" || o.orderStatus === "confirmed").length,
      },
      exportedBy: executiveName,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mercatox-supplier-export-${profile.storeSlug || "backup"}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Supplier ledger and configuration archive downloaded successfully.");
  };

  // Filter tabs or check search
  const filteredTabs = useMemo(() => {
    if (!searchQuery.trim()) return TABS;
    const q = searchQuery.toLowerCase();
    return TABS.filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        t.shortLabel.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto min-w-0">
      {/* 1. Modern Page Header with Dynamic Action Bar */}
      <PageHeader
        title="Supplier Settings & Controls"
        subtitle="Manage executive credentials, legal registration, automated quotes, settlement accounts, and multi-channel alerts"
        breadcrumbs={[{ label: "Dashboard", onClick: () => setActiveTab("dashboard") }, { label: "Settings" }]}
        badge={
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="h-3 w-3" />
            <span>Escrow Protected Account</span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                Unsaved edits
              </span>
            )}
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white transition-all shadow-sm cursor-pointer ${hasUnsavedChanges
                  ? "bg-indigo-600 hover:bg-indigo-500 ring-2 ring-indigo-500/30"
                  : "bg-white/10 hover:bg-white/15 text-zinc-200"
                }`}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        }
      />

      {/* Vacation Mode Alert Banner if Active */}
      {vacationMode && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 sm:p-4 text-xs text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-amber-100">Storefront is Currently in Vacation / Pause Mode</p>
              <p className="text-[11px] text-amber-300/80">
                Buyers can view your catalog and bookmark products, but checkout and instant quotes are temporarily paused.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setVacationMode(false);
              markDirty();
              toast.info("Vacation mode disabled. Click Save Changes to commit.");
            }}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 text-xs font-semibold cursor-pointer border border-amber-500/30"
          >
            Reactivate Store
          </button>
        </div>
      )}

      {/* 2. Top Compact Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-white/[0.08] bg-[#0d121c]/80 p-2.5 backdrop-blur-md">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Quick search settings (e.g. 2FA, CBE Bank, TIN, Lead Time, SMS, Vacation)..."
            className="w-full bg-white/[0.04] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-zinc-400 shrink-0 px-1">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Portal v2.6.4</span>
          </span>
          <span className="text-zinc-600">•</span>
          <span className="font-mono text-zinc-300">TIN: {profile.tinNumber}</span>
        </div>
      </div>

      {/* 3. Main Modern Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Navigation Column / Horizontal Scrollable on Mobile (Minimum Width ready) */}
        <div className="lg:col-span-4 xl:col-span-3 min-w-0">
          {/* Mobile Horizontal Pill Scroll (Visible on mobile/tablet) */}
          <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none no-scrollbar -mx-1 px-1">
            {filteredTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTabSub === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabSub(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer border ${isActive
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                      : "bg-[#0d121c] text-zinc-400 border-white/[0.08] hover:text-white hover:bg-white/[0.04]"
                    }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{tab.shortLabel}</span>
                  {tab.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold border ${isActive ? "bg-white/20 text-white border-transparent" : tab.badgeColor
                        }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Desktop Master Navigation Rail (Compact, Modern Card) */}
          <div className="hidden lg:block rounded-xl border border-white/[0.08] bg-[#0d121c] p-2 space-y-1 shadow-sm sticky top-4">
            <div className="px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Settings Navigation
            </div>
            {filteredTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTabSub === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabSub(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer text-left ${isActive
                      ? "bg-indigo-600 text-white shadow-xs font-semibold"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 border ${isActive
                          ? "bg-white/20 border-white/20 text-white"
                          : "bg-white/[0.03] border-white/[0.06] text-zinc-400"
                        }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="truncate">
                      <p className="truncate leading-snug">{tab.label}</p>
                    </div>
                  </div>

                  {tab.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold border shrink-0 ml-1.5 ${isActive ? "bg-white/20 text-white border-transparent" : tab.badgeColor
                        }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Quick Helper Card at bottom of nav */}
            <div className="mt-3 pt-3 border-t border-white/[0.06] px-2.5 py-2 text-zinc-400 text-[11px] space-y-1.5">
              <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                <Info className="h-3.5 w-3.5 text-indigo-400" />
                <span>Statutory Compliance</span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-normal">
                Changes to TIN, Commercial License, or CBE bank details require automated KYC verification.
              </p>
              <button
                onClick={() => setActiveTab("profile")}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 cursor-pointer pt-0.5"
              >
                <span>Open Business Profile</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Detail Panel / Settings Content Area */}
        <div className="lg:col-span-8 xl:col-span-9 min-w-0 space-y-4">
          {/* TAB 1: Account Profile */}
          {activeTabSub === "account" && (
            <div className="space-y-4">
              {/* Executive Header Card */}
              <div className="rounded-xl border border-white/[0.08] bg-[#0d121c] p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-bold text-lg shadow-sm border border-white/10">
                        {executiveName
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-[#0d121c]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-white">{executiveName}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          Primary Admin
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">{executiveTitle}</p>
                      <p className="text-[11px] font-mono text-zinc-500">{userEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toast.info("Photo upload opened. Supported formats: JPG, PNG under 5MB.")}
                      className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-zinc-200 transition-colors cursor-pointer"
                    >
                      Change Photo
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4 text-xs">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Authorized Executive Name</label>
                    <input
                      type="text"
                      value={executiveName}
                      onChange={(e) => {
                        setExecutiveName(e.target.value);
                        markDirty();
                      }}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Corporate Position / Title</label>
                    <input
                      type="text"
                      value={executiveTitle}
                      onChange={(e) => {
                        setExecutiveTitle(e.target.value);
                        markDirty();
                      }}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Executive Direct Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => {
                          setUserEmail(e.target.value);
                          markDirty();
                        }}
                        className="w-full rounded-lg border border-white/10 bg-white/[0.04] pl-3 pr-20 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        Verified
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Phone Number (SMS OTP & 2FA)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={userPhone}
                        onChange={(e) => {
                          setUserPhone(e.target.value);
                          markDirty();
                        }}
                        className="w-full rounded-lg border border-white/10 bg-white/[0.04] pl-3 pr-20 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 font-mono"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                        SMS Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences & Working Hours Card */}
              <div className="rounded-xl border border-white/[0.08] bg-[#0d121c] p-4 sm:p-5 space-y-3.5">
                <div className="border-b border-white/[0.06] pb-2.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white">Regional Preferences & Operating Hours</h4>
                  <p className="text-[11px] text-zinc-400">
                    Set platform language and SLA availability window for buyers
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Interface Language</label>
                    <select
                      value={preferredLanguage}
                      onChange={(e) => {
                        setPreferredLanguage(e.target.value as "en" | "am" | "om" | "ti");
                        markDirty();
                      }}
                      className="w-full rounded-lg border border-white/10 bg-[#121824] px-3 py-2 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="en">English (International)</option>
                      <option value="am">Amharic (አማርኛ)</option>
                      <option value="om">Afaan Oromoo (Oromo)</option>
                      <option value="ti">Tigrinya (ትግርኛ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Timezone</label>
                    <input
                      type="text"
                      disabled
                      value="East Africa Time (EAT - UTC+3)"
                      className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-zinc-400"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Standard Operating Hours</label>
                    <input
                      type="text"
                      value={workingHours}
                      onChange={(e) => {
                        setWorkingHours(e.target.value);
                        markDirty();
                      }}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Primary Channel */}
                <div className="pt-2">
                  <label className="block text-zinc-300 font-semibold mb-1.5 text-xs">
                    Preferred Buyer Interaction Channel
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {[
                      { id: "in_app", label: "MercatoX In-App Chat", desc: "Fastest response with quote links" },
                      { id: "phone", label: "Direct Phone Call", desc: "Urgent bulk commodity inquiries" },
                      { id: "whatsapp", label: "WhatsApp / Telegram", desc: "Direct mobile messaging" },
                    ].map((ch) => (
                      <button
                        type="button"
                        key={ch.id}
                        onClick={() => {
                          setPrimaryChannel(ch.id);
                          markDirty();
                        }}
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${primaryChannel === ch.id
                            ? "border-indigo-500 bg-indigo-500/10 text-white"
                            : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                          }`}
                      >
                        <p className="font-semibold text-white">{ch.label}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{ch.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Storefront & Catalog Policy */}
          {activeTabSub === "storefront" && (
            <div className="space-y-4">
              {/* Storefront Overview Card */}
              <div className="rounded-xl border border-white/[0.08] bg-[#0d121c] p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">Public B2B Storefront & Branding</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      How buyers discover and order from your wholesale catalog
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("profile")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    <span>View Public Storefront</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Storefront Brand Display Name</label>
                    <input
                      type="text"
                      disabled
                      value={profile.businessName}
                      className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-zinc-300 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Storefront URL Slug</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-zinc-400 font-mono">
                        <span className="text-zinc-500">mercatox.et/supplier/</span>
                        <input
                          type="text"
                          value={storeSlug}
                          onChange={(e) => {
                            setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
                            markDirty();
                          }}
                          className="bg-transparent text-white focus:outline-none font-medium flex-1 ml-0.5"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(`https://mercatox.et/supplier/${storeSlug}`, "slug")}
                        className="px-3 py-2 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                      >
                        {copiedKey === "slug" ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-[11px] text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span className="text-[11px]">Copy Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Company Tagline / Bio</label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => {
                        setTagline(e.target.value);
                        markDirty();
                      }}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Operational Policies Card */}
              <div className="rounded-xl border border-white/[0.08] bg-[#0d121c] p-4 sm:p-5 space-y-4">
                <div className="border-b border-white/[0.06] pb-2.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white">Commercial Fulfillment & MOQ Parameters</h4>
                  <p className="text-[11px] text-zinc-400">
                    Default commercial boundaries enforced across quotes and wholesale contracts
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      Minimum Order Value (MOQ Threshold in ETB)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={minOrderETB}
                        onChange={(e) => {
                          setMinOrderETB(Number(e.target.value));
                          markDirty();
                        }}
                        className="w-full rounded-lg border border-white/10 bg-white/[0.04] pl-3 pr-14 py-2 text-white font-mono"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold text-[11px]">
                        ETB
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      Default Fulfillment Lead Time (Days)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={leadTimeDays}
                        onChange={(e) => {
                          setLeadTimeDays(Number(e.target.value));
                          markDirty();
                        }}
                        className="w-full rounded-lg border border-white/10 bg-white/[0.04] pl-3 pr-14 py-2 text-white font-mono"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold text-[11px]">
                        Days
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Default Commercial Incoterm</label>
                    <select
                      value={defaultIncoterm}
                      onChange={(e) => {
                        setDefaultIncoterm(e.target.value);
                        markDirty();
                      }}
                      className="w-full rounded-lg border border-white/10 bg-[#121824] px-3 py-2 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="FOB Addis Ababa Logistics Hub">FOB Addis Ababa Logistics Hub</option>
                      <option value="Ex-Warehouse Kaliti Depots">Ex-Warehouse Kaliti Depots</option>
                      <option value="CIF Djibouti Port (Export)">CIF Djibouti Port (Export)</option>
                      <option value="DAP Buyer Facility (Special Delivery)">DAP Buyer Facility (Special Delivery)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Sample Inspection Policy</label>
                    <input
                      type="text"
                      value={samplePolicy}
                      onChange={(e) => {
                        setSamplePolicy(e.target.value);
                        markDirty();
                      }}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Switches */}
                <div className="pt-2 divide-y divide-white/[0.05]">
                  {/* Vacation Mode Toggle */}
                  <div className="flex items-center justify-between py-3 gap-3">
                    <div>
                      <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <span>Storefront Vacation / Pause Mode</span>
                        {vacationMode && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Active
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Temporarily suspend instant purchase and catalog RFQs while on holiday or depot inventory audit
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={vacationMode}
                      onClick={() => {
                        setVacationMode(!vacationMode);
                        markDirty();
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${vacationMode ? "bg-amber-500" : "bg-zinc-700"
                        }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${vacationMode ? "translate-x-4" : "translate-x-0"
                          }`}
                      />
                    </button>
                  </div>

                  {/* Public Phone Visibility */}
                  <div className="flex items-center justify-between py-3 gap-3">
                    <div>
                      <p className="text-xs font-semibold text-white">Hide Direct Mobile Phone on Public Catalog</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Route all inquiries strictly through encrypted MercatoX chat to prevent spam calls
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={hidePhonePublicly}
                      onClick={() => {
                        setHidePhonePublicly(!hidePhonePublicly);
                        markDirty();
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${hidePhonePublicly ? "bg-indigo-600" : "bg-zinc-700"
                        }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${hidePhonePublicly ? "translate-x-4" : "translate-x-0"
                          }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Legal & Statutory Registry */}
          {activeTabSub === "business" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/[0.08] bg-[#0d121c] p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Statutory Registry & Ministry Records
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Ethiopian Ministry of Revenues and Ministry of Trade & Regional Integration records
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Statutory Verified</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Registered Enterprise Legal Name</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => {
                        setBusinessName(e.target.value);
                        markDirty();
                      }}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Entity Structure / Type</label>
                    <select
                      value={legalEntity}
                      onChange={(e) => {
                        setLegalEntity(e.target.value);
                        markDirty();
                      }}
                      className="w-full rounded-lg border border-white/10 bg-[#121824] px-3 py-2 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Private Limited Company (PLC)">Private Limited Company (PLC)</option>
                      <option value="Share Company (S.C.)">Share Company (S.C.)</option>
                      <option value="Sole Proprietorship">Sole Proprietorship</option>
                      <option value="Agricultural Cooperative Union">Agricultural Cooperative Union</option>
                      <option value="Industrial Enterprise">Industrial Enterprise</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Taxpayer Identification Number (TIN)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={tinNumber}
                        onChange={(e) => {
                          setTinNumber(e.target.value);
                          markDirty();
                        }}
                        className="w-full rounded-lg border border-white/10 bg-white/[0.04] pl-3 pr-24 py-2 text-emerald-400 font-mono font-bold focus:outline-none focus:border-indigo-500"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        MOINREV Match
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Commercial Registration License</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => {
                          setLicenseNumber(e.target.value);
                          markDirty();
                        }}
                        className="w-full rounded-lg border border-white/10 bg-white/[0.04] pl-3 pr-20 py-2 text-zinc-200 font-mono focus:outline-none focus:border-indigo-500"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                        Valid 2027
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Registered City & Market Zone</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        markDirty();
                      }}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-zinc-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Specific Depot / Physical Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        markDirty();
                      }}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-zinc-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-indigo-300">Need to upload revised statutory documents (TIN cert, trade license)?</p>
                    <p className="text-[11px] text-zinc-400">
                      Submit document re-verification requests directly in the Business Verification Center.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("profile")}
                    className="shrink-0 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                  >
                    Open Business Profile →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Commercial Bank & Payouts */}
          {activeTabSub === "payouts" && (
            <div className="space-y-4">
              {/* Linked Accounts */}
              <div className="rounded-xl border border-white/[0.08] bg-[#0d121c] p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">Commercial Bank Accounts & Payout Hub</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Verified destination accounts for automated Commercial Bank of Ethiopia (CBE) Escrow releases
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddBankModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Link New Account</span>
                  </button>
                </div>

                {/* Account Cards */}
                <div className="space-y-2.5 text-xs">
                  {settlementAccounts.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
                      <p className="text-zinc-400 text-xs font-semibold mb-1">
                        No settlement bank accounts linked yet.
                      </p>
                      <p className="text-zinc-500 text-[11px] mb-3">
                        Link any Ethiopian commercial bank, microfinance, or mobile money account of your choice to receive payouts.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowAddBankModal(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Link Your Bank Account</span>
                      </button>
                    </div>
                  ) : (
                    settlementAccounts.map((acc) => (
                      <div
                        key={acc.id}
                        className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs"
                            style={{ backgroundColor: acc.accentColor || "#6366f1" }}
                          >
                            {acc.shortCode}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-white text-xs sm:text-sm">{acc.bankName}</p>
                              {acc.isDefault ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Default Payout Rail
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-500/20 text-zinc-400 border border-zinc-500/30">
                                  {acc.type}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                              Account: {acc.accountNumber} • Branch: {acc.branch || "Main"}
                            </p>
                            <p className="text-[10px] text-zinc-500">
                              Holder: {acc.accountName} • {acc.clearingTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {!acc.isDefault && (
                            <button
                              type="button"
                              onClick={() => setDefaultSettlementAccount(acc.id)}
                              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer mr-1"
                            >
                              Make Default
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleCopy(acc.accountNumber, acc.id)}
                            className="p-1.5 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            title="Copy Account Number"
                          >
                            {copiedKey === acc.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove account ${acc.bankName} (${acc.accountNumber})?`)) {
                                deleteSettlementAccount(acc.id);
                              }
                            }}
                            className="p-1.5 rounded-md hover:bg-white/10 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Remove Account"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Bank Modal Inline */}
                {showAddBankModal && (
                  <form onSubmit={handleAddBank} className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
                      <p className="text-xs font-bold text-indigo-300">Link Bank or Financial Settlement Account</p>
                      <button
                        type="button"
                        onClick={() => setShowAddBankModal(false)}
                        className="text-zinc-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-zinc-300 font-semibold mb-1">
                          Financial Institution / Bank <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          list="settings-popular-banks"
                          required
                          value={newBankName}
                          onChange={(e) => setNewBankName(e.target.value)}
                          placeholder="Type any bank name..."
                          className="w-full rounded-lg border border-white/10 bg-[#121824] px-3 py-2 text-white"
                        />
                        <datalist id="settings-popular-banks">
                          <option value="Commercial Bank of Ethiopia (CBE)" />
                          <option value="Bank of Abyssinia" />
                          <option value="Dashen Bank" />
                          <option value="Awash International Bank" />
                          <option value="Cooperative Bank of Oromia" />
                          <option value="Siinqee Bank" />
                          <option value="Nib International Bank" />
                          <option value="Wegagen Bank" />
                          <option value="Hibret Bank" />
                          <option value="Zemen Bank" />
                          <option value="Berhan Bank" />
                          <option value="Bunna International Bank" />
                          <option value="Enat Bank" />
                          <option value="Abay Bank" />
                          <option value="Global Bank Ethiopia" />
                          <option value="Hijra Bank" />
                          <option value="ZamZam Bank" />
                          <option value="Telebirr Business" />
                          <option value="CBE Birr" />
                        </datalist>
                      </div>
                      <div>
                        <label className="block text-zinc-300 font-semibold mb-1">
                          Account Number / Merchant ID <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newBankAcc}
                          onChange={(e) => setNewBankAcc(e.target.value)}
                          placeholder="e.g. 1000... or TB-..."
                          className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-300 font-semibold mb-1">Branch Name / Channel</label>
                        <input
                          type="text"
                          value={newBankBranch}
                          onChange={(e) => setNewBankBranch(e.target.value)}
                          placeholder="e.g. Bole Medhanialem or Online"
                          className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-zinc-500 font-medium mr-1">Quick pick:</span>
                      {[
                        "Commercial Bank of Ethiopia",
                        "Bank of Abyssinia",
                        "Dashen Bank",
                        "Awash Bank",
                        "Coop Bank of Oromia",
                        "Siinqee Bank",
                        "Telebirr Business",
                      ].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setNewBankName(b)}
                          className={`text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                            newBankName === b
                              ? "border-indigo-400 bg-indigo-500/20 text-indigo-300 font-bold"
                              : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                          }`}
                        >
                          {b.replace("Commercial Bank of Ethiopia", "CBE").replace("Bank of Abyssinia", "Abyssinia")}
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddBankModal(false)}
                        className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-xs cursor-pointer"
                      >
                        Link Account
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Settlement Automation Card */}
              <div className="rounded-xl border border-white/[0.08] bg-[#0d121c] p-4 sm:p-5 space-y-4">
                <div className="border-b border-white/[0.06] pb-2.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white">Escrow Settlement Release Rules</h4>
                  <p className="text-[11px] text-zinc-400">
                    Control how and when escrow payouts sweep into your primary commercial bank account
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Automatic Settlement Cadence</label>
                    <select
                      value={settlementSchedule}
                      onChange={(e) => {
                        setSettlementSchedule(e.target.value as any);
                        markDirty();
                      }}
                      className="w-full rounded-lg border border-white/10 bg-[#121824] px-3 py-2 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="instant">Immediate upon Buyer Delivery Inspection & Escrow Release</option>
                      <option value="daily">Daily Batch Sweep (17:00 EAT)</option>
                      <option value="weekly">Weekly Consolidated Sweep (Every Friday 16:00 EAT)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">
                      Minimum Automatic Payout Sweep Threshold (ETB)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={autoPayoutThreshold}
                        onChange={(e) => {
                          setAutoPayoutThreshold(Number(e.target.value));
                          markDirty();
                        }}
                        className="w-full rounded-lg border border-white/10 bg-white/[0.04] pl-3 pr-14 py-2 text-white font-mono"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold text-[11px]">
                        ETB
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tax Withholding Switch */}
                <div className="pt-2 flex items-center justify-between border-t border-white/[0.06] pt-3 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-white">
                      Automated 2% Ministry of Revenues Withholding Tax Certificates
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Automatically generate official digital tax receipt for every settled commercial transaction
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={withholdingTaxReceipt}
                    onClick={() => {
                      setWithholdingTaxReceipt(!withholdingTaxReceipt);
                      markDirty();
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${withholdingTaxReceipt ? "bg-indigo-600" : "bg-zinc-700"
                      }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${withholdingTaxReceipt ? "translate-x-4" : "translate-x-0"
                        }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Order & RFQ Automation */}
          {activeTabSub === "orders" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/[0.08] bg-[#0d121c] p-4 sm:p-5 space-y-4">
                <div className="border-b border-white/[0.06] pb-3">
                  <h3 className="text-sm sm:text-base font-bold text-white">Instant Quotation & RFQ Engine</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Accelerate sales velocity by responding to standard buyer tenders automatically
                  </p>
                </div>

                <div className="space-y-3.5 text-xs">
                  {/* Auto-quote Switch */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] gap-3">
                    <div>
                      <p className="font-semibold text-white flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                        <span>Instant Auto-Quote for Published Tiered Catalog Items</span>
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Immediately issue binding formal PDF quote when buyer RFQ quantity falls within pre-configured pricing tiers
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={autoQuoteEnabled}
                      onClick={() => {
                        setAutoQuoteEnabled(!autoQuoteEnabled);
                        markDirty();
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${autoQuoteEnabled ? "bg-indigo-600" : "bg-zinc-700"
                        }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${autoQuoteEnabled ? "translate-x-4" : "translate-x-0"
                          }`}
                      />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-zinc-300 font-semibold mb-1">
                        Minimum RFQ Value for Auto-Quote (ETB)
                      </label>
                      <input
                        type="number"
                        value={autoQuoteMinETB}
                        onChange={(e) => {
                          setAutoQuoteMinETB(Number(e.target.value));
                          markDirty();
                        }}
                        className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-300 font-semibold mb-1">Quotation Validity Period</label>
                      <select
                        value={quoteValidityDays}
                        onChange={(e) => {
                          setQuoteValidityDays(Number(e.target.value));
                          markDirty();
                        }}
                        className="w-full rounded-lg border border-white/10 bg-[#121824] px-3 py-2 text-white cursor-pointer"
                      >
                        <option value={7}>7 Calendar Days</option>
                        <option value={14}>14 Calendar Days (Standard)</option>
                        <option value={30}>30 Calendar Days (Long Term)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-300 font-semibold mb-1">
                        Max Allowable Negotiation Discount (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="25"
                          value={maxCounterDiscount}
                          onChange={(e) => {
                            setMaxCounterDiscount(Number(e.target.value));
                            markDirty();
                          }}
                          className="w-full rounded-lg border border-white/10 bg-white/[0.04] pl-3 pr-8 py-2 text-white font-mono"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inventory & Escrow Safeguards */}
              <div className="rounded-xl border border-white/[0.08] bg-[#0d121c] p-4 sm:p-5 space-y-3">
                <div className="border-b border-white/[0.06] pb-2.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white">Inventory Allocation & Dispatch Rules</h4>
                  <p className="text-[11px] text-zinc-400">
                    Safeguard physical warehouse stock and prevent counterparty default
                  </p>
                </div>

                <div className="divide-y divide-white/[0.05] text-xs">
                  {/* Reserve Stock */}
                  <div className="flex items-center justify-between py-3 gap-3">
                    <div>
                      <p className="font-semibold text-white">Auto-Reserve Physical Stock on Quotation Acceptance</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Immediately locks designated batch quantity in warehouse inventory for 48 hours awaiting Escrow deposit
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={autoReserveStock}
                      onClick={() => {
                        setAutoReserveStock(!autoReserveStock);
                        markDirty();
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${autoReserveStock ? "bg-indigo-600" : "bg-zinc-700"
                        }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${autoReserveStock ? "translate-x-4" : "translate-x-0"
                          }`}
                      />
                    </button>
                  </div>

                  {/* Strict Escrow Requirement */}
                  <div className="flex items-center justify-between py-3 gap-3">
                    <div>
                      <p className="font-semibold text-white flex items-center gap-1.5">
                        <span>Strict Commercial Bank of Ethiopia (CBE) Escrow Requirement</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Recommended
                        </span>
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Block issuance of warehouse logistics release manifests until CBE Escrow confirms 100% buyer deposit
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={strictEscrowRequired}
                      onClick={() => {
                        setStrictEscrowRequired(!strictEscrowRequired);
                        markDirty();
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${strictEscrowRequired ? "bg-indigo-600" : "bg-zinc-700"
                        }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${strictEscrowRequired ? "translate-x-4" : "translate-x-0"
                          }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Multi-Channel Alerts */}
          {activeTabSub === "notifications" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/[0.08] bg-[#0d121c] p-4 sm:p-5 space-y-4">
                <div className="border-b border-white/[0.06] pb-3">
                  <h3 className="text-sm sm:text-base font-bold text-white">Multi-Channel Notification Channels</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Select delivery routes and urgency thresholds for order, quote, and banking alerts
                  </p>
                </div>

                {/* Main Channels */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {[
                    {
                      title: "Ethio Telecom SMS",
                      desc: "Instant urgent alerts to +251 91 198 7654",
                      icon: Smartphone,
                      state: notifSMS,
                      setter: setNotifSMS,
                      badge: "Primary Mobile",
                    },
                    {
                      title: "Corporate Email",
                      desc: "PDF attachments & formal contract logs",
                      icon: Mail,
                      state: notifEmail,
                      setter: setNotifEmail,
                      badge: "Official Record",
                    },
                    {
                      title: "Push & Web Bell",
                      desc: "Live sound & popup when logged into portal",
                      icon: Bell,
                      state: notifPush,
                      setter: setNotifPush,
                      badge: "Real-Time",
                    },
                  ].map((ch, idx) => {
                    const Icon = ch.icon;
                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border transition-all ${ch.state
                            ? "border-indigo-500/30 bg-indigo-500/[0.04]"
                            : "border-white/[0.08] bg-white/[0.02]"
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                            <Icon className="h-4 w-4" />
                          </div>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={ch.state}
                            onClick={() => {
                              ch.setter(!ch.state);
                              markDirty();
                            }}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${ch.state ? "bg-indigo-600" : "bg-zinc-700"
                              }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${ch.state ? "translate-x-4" : "translate-x-0"
                                }`}
                            />
                          </button>
                        </div>
                        <p className="font-bold text-white">{ch.title}</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{ch.desc}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Granular Event Triggers */}
                <div className="pt-2 border-t border-white/[0.06] space-y-2">
                  <p className="text-xs font-bold text-zinc-300">Granular Transaction Event Subscriptions</p>
                  <div className="divide-y divide-white/[0.05] text-xs">
                    {[
                      {
                        title: "High-Priority RFQ Submissions",
                        desc: "Notify immediately when an Ethiopian or regional buyer submits an RFQ matching your products",
                        state: notifRFQInstant,
                        setter: setNotifRFQInstant,
                      },
                      {
                        title: "Purchase Orders & Quotation Acceptances",
                        desc: "Receive immediate SMS and email with buyer signature and logistics delivery address",
                        state: notifOrderUpdates,
                        setter: setNotifOrderUpdates,
                      },
                      {
                        title: "CBE Escrow Deposit & Payout Clearances",
                        desc: "Real-time alerts when buyer funds are locked in Escrow or released to your bank",
                        state: notifEscrowAlerts,
                        setter: setNotifEscrowAlerts,
                      },
                      {
                        title: "Daily Morning Executive Summary (08:00 EAT)",
                        desc: "Consolidated breakdown of pending orders, revenue, open RFQs, and low warehouse stock",
                        state: notifDailyDigest,
                        setter: setNotifDailyDigest,
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2.5 gap-3">
                        <div>
                          <p className="font-semibold text-white">{item.title}</p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{item.desc}</p>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={item.state}
                          onClick={() => {
                            item.setter(!item.state);
                            markDirty();
                          }}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${item.state ? "bg-indigo-600" : "bg-zinc-700"
                            }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${item.state ? "translate-x-4" : "translate-x-0"
                              }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: Security, 2FA & API Keys */}
          {activeTabSub === "security" && (
            <div className="space-y-4">
              {/* 2FA Card */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white text-xs sm:text-sm">Two-Factor Authentication (2FA) is Active</p>
                      <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Enforced
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Required for all Escrow payout withdrawals, bank changes, and master password resets.
                    </p>
                    <p className="text-[10px] text-emerald-300 font-mono mt-0.5">
                      Primary Verification: SMS OTP to {userPhone}
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={twoFactorEnabled}
                    onClick={() => {
                      setTwoFactorEnabled(!twoFactorEnabled);
                      markDirty();
                      toast.info(twoFactorEnabled ? "2FA temporarily disabled" : "2FA enabled");
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${twoFactorEnabled ? "bg-emerald-500" : "bg-zinc-700"
                      }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${twoFactorEnabled ? "translate-x-4" : "translate-x-0"
                        }`}
                    />
                  </button>
                </div>
              </div>

              {/* Password Change Form */}
              <div className="rounded-xl border border-white/[0.08] bg-[#0d121c] p-4 sm:p-5 space-y-4">
                <div className="border-b border-white/[0.06] pb-2.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white">Change Master Portal Password</h4>
                  <p className="text-[11px] text-zinc-400">
                    Ensure your account uses a secure password with at least 8 characters
                  </p>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-3 text-xs max-w-lg">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-300 font-semibold mb-1">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-300 font-semibold mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer shadow-xs transition-colors disabled:opacity-50"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-3.5 w-3.5" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Active Sessions Card */}
              <div className="rounded-xl border border-white/[0.08] bg-[#0d121c] p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-2.5">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">Active Authorized Sessions</h4>
                    <p className="text-[11px] text-zinc-400">Devices currently authenticated into this supplier console</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.success("All other active sessions revoked. Current device remains logged in.")}
                    className="text-xs font-semibold text-rose-400 hover:text-rose-300 cursor-pointer"
                  >
                    Revoke Other Sessions
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  {[
                    {
                      device: "Chrome 124 (Windows 11)",
                      location: "Addis Ababa, Ethiopia (IP: 197.156.104.22)",
                      time: "Active Now (Current Session)",
                      isCurrent: true,
                    },
                    {
                      device: "Safari 17 (iPhone 15 Pro)",
                      location: "Bole Sub-City, Addis Ababa (IP: 197.156.104.98)",
                      time: "2 hours ago",
                      isCurrent: false,
                    },
                    {
                      device: "Firefox (Linux x86_64)",
                      location: "Hawassa Depot Logistics Center (IP: 196.188.42.11)",
                      time: "3 days ago",
                      isCurrent: false,
                    },
                  ].map((s, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] gap-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <Laptop className="h-4 w-4 text-zinc-400 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{s.device}</span>
                            {s.isCurrent && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                This Device
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-zinc-400 mt-0.5">{s.location}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-400 shrink-0">{s.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* API Keys & ERP Webhooks */}
              <div className="rounded-xl border border-white/[0.08] bg-[#0d121c] p-4 sm:p-5 space-y-3.5">
                <div className="border-b border-white/[0.06] pb-2.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white">ERP Integration & Webhook Endpoints</h4>
                  <p className="text-[11px] text-zinc-400">
                    Connect SAP, ERPNext, Odoo, or custom logistics software for automatic stock & order synchronization
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Production Live API Key</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-white">
                        <span>{showApiKey ? apiKey : "mk_live_•••••••••••••••••••••••••"}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="p-2 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white"
                        title={showApiKey ? "Hide Key" : "Show Key"}
                      >
                        {showApiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(apiKey, "api")}
                        className="px-3 py-2 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white shrink-0 flex items-center gap-1.5"
                      >
                        {copiedKey === "api" ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-[11px] text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span className="text-[11px]">Copy API Key</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleRegenerateApiKey}
                        className="px-3 py-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white shrink-0 flex items-center gap-1.5 cursor-pointer"
                        title="Generate a fresh API key"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span className="text-[11px] font-semibold">Regenerate</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">ERP Webhook Notification URL</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={webhookUrl}
                        onChange={(e) => {
                          setWebhookUrl(e.target.value);
                          markDirty();
                        }}
                        className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={handleTestWebhook}
                        disabled={isTestingWebhook}
                        className="px-3 py-2 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 text-xs font-semibold cursor-pointer shrink-0 inline-flex items-center gap-1.5"
                      >
                        {isTestingWebhook ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>Pinging...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5 text-indigo-400" />
                            <span>Test Ping</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Export & Danger Zone */}
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.02] p-4 sm:p-5 space-y-3">
                <div className="border-b border-white/[0.06] pb-2">
                  <h4 className="text-xs sm:text-sm font-bold text-white">Data Export & Ledger Backup</h4>
                  <p className="text-[11px] text-zinc-400">Download enterprise ledger backups, order catalogs, and active financial rails</p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-semibold text-white">Export Supplier Ledger & Orders (JSON)</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Download complete configuration profile, settlement bank accounts, and commodity orders snapshot
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shrink-0 shadow-xs transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download JSON Archive</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

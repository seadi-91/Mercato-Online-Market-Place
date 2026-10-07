"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  CreditCard,
  MapPin,
  Lock,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  User,
  Phone,
  Mail,
  Home,
  FileText,
  AlertCircle,
  Smartphone,
  Building2,
  Database,
  Sparkles,
  Check,
} from "lucide-react";
import { CustomerHeader } from "@/components/layout/customer-header";
import { CustomerFooter } from "@/components/layout/footer";
import { CustomerBottomNav } from "@/components/layout/customer-bottom-nav";
import { useCartStore, useAuthStore } from "@/store";
import {
  fetchCustomerProfile,
  updateCustomerAddress,
  CustomerProfile,
} from "@/lib/api/customer";
import { initializeChapaCheckout } from "@/lib/api/payment";
import { toast } from "sonner";

const ADDIS_SUBCITIES = [
  "Bole (Medhanialem, Rwanda, Atlas, Bulbula)",
  "Kirkos (Kazanchis, Meskel Flower, Olympia)",
  "Yeka (Megenagna, CMC, Signal, Kotebe)",
  "Arada (Piazza, 4 Kilo, 6 Kilo, Churchill)",
  "Lideta (Mexico, Balcha, Tor Hailoch)",
  "Addis Ketema (Mercato, Autobis Tera, Sebategna)",
  "Kolfe Keranio (18 Mazoriya, Total, Zenebework)",
  "Nefas Silk-Lafto (Sarbet, Gotera, Jomo, Lebu)",
  "Gulele (Shiro Meda, Addisu Gebeya, Semien)",
  "Akaky Kaliti (Kality, Gelan, Tulu Dimtu)",
  "Lemi Kura (Ayat, Tafo, Summit, Figa)",
];

function cleanPhoneForInput(rawPhone?: string): string {
  if (!rawPhone) return "";
  let p = rawPhone.trim();
  if (p.startsWith("+251")) p = p.slice(4);
  else if (p.startsWith("251")) p = p.slice(3);
  else if (p.startsWith("0")) p = p.slice(1);
  return p.trim();
}

function formatPhoneForBackend(phone: string): string {
  let p = phone.replace(/[\s-]/g, "");
  if (p.startsWith("+251")) return p;
  if (p.startsWith("251")) return `+${p}`;
  if (p.startsWith("0")) return `+251${p.slice(1)}`;
  return `+251${p}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const [mounted, setMounted] = useState(false);
  const [visibleSummaryCount, setVisibleSummaryCount] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);

  // Backend Profile & Address Loading State
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileLoadedFromDb, setProfileLoadedFromDb] = useState(false);
  const [savedDbProfile, setSavedDbProfile] = useState<CustomerProfile | null>(null);

  // Customer Contact & Delivery State
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [subcity, setSubcity] = useState(ADDIS_SUBCITIES[0]);
  const [specificAddress, setSpecificAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  // Future Save Checkbox & Database Action State
  const [saveForFuture, setSaveForFuture] = useState(true);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isAddressSavedInDb, setIsAddressSavedInDb] = useState(false);

  // Payment Method State (Chapa unified escrow gateway)
  const [paymentMethod, setPaymentMethod] = useState<"telebirr" | "chapa" | "cbe">("chapa");

  useEffect(() => {
    setMounted(true);

    async function loadCustomerInformation() {
      // 1. Initial pre-fill from cached auth store if available
      if (user) {
        if (user.name) setFullName(user.name);
        if (user.email) setEmail(user.email);
        if (user.phoneNumber) setPhoneNumber(cleanPhoneForInput(user.phoneNumber));
      }

      // 2. Fetch live customer profile & delivery address from backend database
      if (token) {
        setIsLoadingProfile(true);
        try {
          const profile = await fetchCustomerProfile(token);
          if (profile) {
            setSavedDbProfile(profile);
            if (profile.fullName) setFullName(profile.fullName);
            if (profile.email) setEmail(profile.email);
            if (profile.alternatePhone || profile.phoneNumber) {
              setPhoneNumber(
                cleanPhoneForInput(profile.alternatePhone || profile.phoneNumber)
              );
            }
            if (profile.subCity) {
              const matched = ADDIS_SUBCITIES.find((sc) =>
                sc.toLowerCase().includes(profile.subCity!.toLowerCase())
              );
              setSubcity(matched || profile.subCity);
            }
            if (profile.specificLocation) {
              setSpecificAddress(profile.specificLocation);
            }
            setProfileLoadedFromDb(true);
            setIsAddressSavedInDb(true);
          }
        } catch (err) {
          console.error("Failed to load customer profile from database:", err);
        } finally {
          setIsLoadingProfile(false);
        }
      }
    }

    loadCustomerInformation();
  }, [user, token]);

  const subtotal = mounted ? getTotalPrice() : 0;
  const deliveryFee = subtotal > 5000 || subtotal === 0 ? 0 : 150;
  const total = subtotal + deliveryFee;
  const displayedSummaryItems = items.slice(0, visibleSummaryCount);

  // Save / Update Address in Database handler
  const saveAddressToDatabase = async (silent = false): Promise<boolean> => {
    if (!token) {
      if (!silent) {
        toast.info("Please sign in to save your address in the database", {
          description: "Your address will still be used for this order.",
        });
      }
      return false;
    }

    if (!fullName.trim()) {
      if (!silent) toast.error("Please enter your recipient full name before saving");
      return false;
    }
    if (!phoneNumber.trim()) {
      if (!silent) toast.error("Please enter a valid phone number before saving");
      return false;
    }
    if (!specificAddress.trim()) {
      if (!silent) toast.error("Please enter your specific delivery address or landmark");
      return false;
    }

    setIsSavingAddress(true);
    try {
      const formattedPhone = formatPhoneForBackend(phoneNumber);
      const subCityShort = subcity.split(" ")[0] || subcity;

      const res = await updateCustomerAddress(token, {
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        alternatePhone: formattedPhone,
        city: "Addis Ababa",
        subCity: subCityShort,
        specificLocation: specificAddress.trim(),
      });

      if (res.success) {
        setIsAddressSavedInDb(true);
        if (!silent) {
          toast.success("Delivery address saved in database!", {
            description: `${fullName.trim()} • ${subCityShort} (${specificAddress.trim()})`,
          });
        }
        return true;
      } else {
        if (!silent) {
          toast.error("Could not save address to database", {
            description: res.error || "Please check connection and try again.",
          });
        }
        return false;
      }
    } catch (err: any) {
      if (!silent) {
        toast.error("Failed to save address", {
          description: err.message || "Network error",
        });
      }
      return false;
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleToggleSaveForFuture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSaveForFuture(checked);
    // When checked, if info is provided, immediately sync to database!
    if (checked && fullName.trim() && phoneNumber.trim() && specificAddress.trim()) {
      saveAddressToDatabase(false);
    }
  };

  const handleProcessToPay = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Please enter your full recipient name");
      return;
    }
    if (!phoneNumber.trim()) {
      toast.error("Please provide your phone number for SMS OTP delivery confirmation");
      return;
    }
    if (!specificAddress.trim()) {
      toast.error("Please enter your specific delivery address or landmark");
      return;
    }

    // If "save for future" is checked and user is logged in, ensure address is saved in database
    if (saveForFuture && token) {
      saveAddressToDatabase(true);
    }

    setIsProcessing(true);
    toast.loading("Connecting to Chapa Hosted Payment Gateway...", { id: "payment-process" });

    try {
      const res = await initializeChapaCheckout({
        amount: total,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        subcity,
        specificAddress: specificAddress.trim(),
        deliveryNotes: deliveryNotes.trim(),
        paymentMethod,
        customerId: user?.id,
        sellerId: (items[0] as any)?.sellerId,
        items: items.map((it) => ({
          id: it.id,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
          image: it.image,
          sellerId: (it as any).sellerId,
        })),
      });

      if (res.success && res.checkoutUrl) {
        // Persist order metadata in localStorage for order confirmation & receipt
        try {
          const orderSnapshot = {
            orderId: res.orderId,
            orderNumber: res.orderNumber,
            txRef: res.txRef || `MX-CHAPA-${Date.now()}`,
            amount: total,
            customerId: user?.id,
            fullName: fullName.trim(),
            phoneNumber: phoneNumber.trim(),
            email: email.trim() || undefined,
            subcity,
            specificAddress: specificAddress.trim(),
            deliveryNotes: deliveryNotes.trim(),
            paymentMethod,
            items: items.map((it) => ({
              id: it.id,
              name: it.name,
              price: it.price,
              quantity: it.quantity,
              image: it.image,
              sellerId: (it as any).sellerId,
            })),
            createdAt: new Date().toISOString(),
          };
          localStorage.setItem(
            "mercatox_last_checkout_order",
            JSON.stringify(orderSnapshot)
          );
        } catch (storageErr) {
          console.warn("Could not save order snapshot:", storageErr);
        }

        toast.success("Redirecting to Chapa Payment Gateway...", {
          id: "payment-process",
          description: "Complete your protected payment on Chapa (Telebirr, CBE Birr, Cards).",
          duration: 3000,
        });

        // NOTE: Cart items and stock are intentionally preserved until payment is successfully completed.
        // Cart will only be cleared on the payment success page after Chapa authorization!

        // Redirect directly to Chapa hosted payment checkout URL
        window.location.href = res.checkoutUrl;
      } else {
        setIsProcessing(false);
        toast.error("Payment Initialization Failed", {
          id: "payment-process",
          description: res.error || "Could not connect to Chapa payment gateway. Please try again.",
        });
      }
    } catch (err: any) {
      setIsProcessing(false);
      toast.error("Error", {
        id: "payment-process",
        description: err.message || "Failed to initiate payment.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070a12] text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <CustomerHeader />

      <main className="flex-1 mx-auto max-w-6xl w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 pb-28 sm:pb-12">
        {/* Navigation Breadcrumb & Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
              <Link href="/cart" className="hover:text-indigo-300 transition-colors flex items-center gap-1">
                <RotateCcw className="h-3 w-3" />
                <span>Cart</span>
              </Link>
              <span>/</span>
              <span className="text-zinc-200 font-medium">Checkout & Protected Payment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Lock className="h-6 w-6 text-cyan-400" />
              <span>Buyer Protected Checkout</span>
            </h1>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>100% Buyer Protection Guaranteed</span>
          </div>
        </div>

        {!mounted ? (
          <div className="py-24 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            <p className="mt-4 text-xs text-zinc-400">Loading checkout session...</p>
          </div>
        ) : items.length === 0 ? (
          /* Empty Cart Notice */
          <div className="rounded-3xl border border-white/10 bg-[#0b101f]/80 p-12 text-center space-y-4 max-w-xl mx-auto shadow-2xl">
            <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Your cart is currently empty</h2>
              <p className="text-xs text-zinc-400">
                Please add items to your cart before proceeding to checkout.
              </p>
            </div>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:brightness-110 active:scale-95 transition-all"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleProcessToPay} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Customer Information, Delivery Details, and Payment Methods */}
            <div className="w-full lg:col-span-7 space-y-6">
              {/* 1. Customer Contact Information */}
              <div className="rounded-2xl border border-white/10 bg-[#0b101f]/90 p-5 backdrop-blur-md space-y-4 shadow-xl">
                <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
                  <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-sm sm:text-base font-bold text-white">
                        1. Customer Information
                      </h2>
                      {profileLoadedFromDb ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10.5px] font-semibold">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Loaded from Database</span>
                        </span>
                      ) : isLoadingProfile ? (
                        <span className="inline-flex items-center gap-1.5 text-[10.5px] text-zinc-400">
                          <div className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
                          <span>Checking saved info...</span>
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Who should we deliver to and contact for SMS OTP release?
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Full Name */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-zinc-300 block">
                      Recipient Full Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Abebe Kebede"
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-indigo-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300 block">
                      Phone Number (for SMS OTP) <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 flex items-center gap-1.5 text-zinc-400 text-xs font-mono pointer-events-none">
                        <span>🇪🇹</span>
                        <span>+251</span>
                      </div>
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="911 234 567"
                        className="w-full rounded-xl border border-white/15 bg-white/5 pl-20 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-indigo-400 transition-colors font-mono"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300 block">
                      Email Address <span className="text-zinc-500 text-[10px]">(for digital receipt)</span>
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="abebe@example.com"
                        className="w-full rounded-xl border border-white/15 bg-white/5 pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-indigo-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Doorstep Delivery Details */}
              <div className="rounded-2xl border border-white/10 bg-[#0b101f]/90 p-5 backdrop-blur-md space-y-4 shadow-xl">
                <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
                  <div className="h-7 w-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-white">
                      2. Doorstep Delivery Details
                    </h2>
                    <p className="text-[11px] text-zinc-400">
                      Dispatched directly from verified local merchants in Addis Ababa.
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {/* City & Subcity */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="space-y-1.5 sm:col-span-1">
                      <label className="text-xs font-semibold text-zinc-300 block">
                        City
                      </label>
                      <input
                        type="text"
                        disabled
                        value="Addis Ababa"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-zinc-300 font-semibold cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-zinc-300 block">
                        Addis Ababa Subcity <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={subcity}
                        onChange={(e) => setSubcity(e.target.value)}
                        className="w-full rounded-xl border border-white/15 bg-[#0b101f] px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 cursor-pointer"
                      >
                        {ADDIS_SUBCITIES.map((sc) => (
                          <option key={sc} value={sc} className="bg-[#0b101f] text-white">
                            {sc}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Specific Delivery Address / Landmark */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300 block">
                      Specific Address / Building / Landmark / House No <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <MapPin className="absolute left-3 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={specificAddress}
                        onChange={(e) => setSpecificAddress(e.target.value)}
                        placeholder="e.g. Bole Rwanda, near Embassy, Villa 412, Gate 2"
                        className="w-full rounded-xl border border-white/15 bg-white/5 pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-cyan-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Delivery Notes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300 block">
                      Courier Delivery Instructions <span className="text-zinc-500 text-[10px]">(optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="e.g. Please call 10 minutes before arriving at the gate."
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-cyan-400 transition-colors resize-none"
                    />
                  </div>

                  {/* Save info for future checkout & Database persistence */}
                  <div className="rounded-xl border border-indigo-500/25 bg-gradient-to-r from-indigo-950/40 via-[#0d1224] to-cyan-950/30 p-4 space-y-3 shadow-lg">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center h-5 mt-0.5">
                        <input
                          id="save-future-address"
                          type="checkbox"
                          checked={saveForFuture}
                          onChange={handleToggleSaveForFuture}
                          className="h-4 w-4 rounded border-white/20 bg-[#0b101f] text-indigo-500 focus:ring-indigo-400 cursor-pointer accent-indigo-500"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor="save-future-address"
                          className="text-xs font-semibold text-white cursor-pointer select-none flex items-center gap-1.5 flex-wrap"
                        >
                          <span>Save this delivery address & contact info for future orders</span>
                          <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-1.5 py-0.2 text-[9.5px] font-mono text-cyan-300">
                            Database Sync
                          </span>
                        </label>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Stores your address securely in the PostgreSQL database and pre-fills it automatically on your next order.
                        </p>
                      </div>
                    </div>

                    {/* Instant Save to Database Button & Status Indicator */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-white/10 text-xs">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        {isAddressSavedInDb ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Address is saved & synced in database</span>
                          </span>
                        ) : profileLoadedFromDb ? (
                          <span className="text-cyan-400 font-medium flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Loaded from database (Edit & save if changed)</span>
                          </span>
                        ) : token ? (
                          <span className="text-zinc-400">
                            Check box or click button to save to your account
                          </span>
                        ) : (
                          <span className="text-zinc-500">
                            (Optional: Sign in to save across devices)
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          saveAddressToDatabase(false);
                        }}
                        disabled={isSavingAddress}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-md shadow-indigo-500/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                      >
                        {isSavingAddress ? (
                          <>
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Saving in Database...</span>
                          </>
                        ) : (
                          <>
                            <Database className="h-3.5 w-3.5" />
                            <span>Save Address to Database</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Protected Payment Method Selector */}
              <div className="rounded-2xl border border-white/10 bg-[#0b101f]/90 p-4 sm:p-5 backdrop-blur-md space-y-4 shadow-xl">
                <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
                  <div className="h-7 w-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-white">
                      3. Protected Payment Method
                    </h2>
                    <p className="text-[11px] text-zinc-400">
                      Choose your preferred payment service. Funds stay protected until OTP release.
                    </p>
                  </div>
                </div>

                {/* Payment Option Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Telebirr */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("telebirr")}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                      paymentMethod === "telebirr"
                        ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-cyan-300">Telebirr</span>
                      {paymentMethod === "telebirr" && (
                        <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-white">SuperApp / USSD</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Instant Birr mobile wallet</p>
                    </div>
                  </button>

                  {/* Chapa */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("chapa")}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                      paymentMethod === "chapa"
                        ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-indigo-300">Chapa</span>
                      {paymentMethod === "chapa" && (
                        <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-white">Cards & Banks</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Debit card, Visa, Awash, Dashen</p>
                    </div>
                  </button>

                  {/* CBE Birr */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cbe")}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                      paymentMethod === "cbe"
                        ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-purple-300">CBE Birr</span>
                      {paymentMethod === "cbe" && (
                        <CheckCircle2 className="h-4 w-4 text-purple-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-white">Commercial Bank</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">CBE mobile account direct</p>
                    </div>
                  </button>
                </div>

                {/* Buyer Protection Guarantee Notice Box */}
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3.5 flex items-start gap-3 text-xs text-zinc-300">
                  <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-white">
                      100% Buyer Protection Protocol
                    </p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Your payment will be securely held in MercatoX protected account. The seller does <strong className="text-zinc-200">not</strong> receive payment until you inspect the package at your doorstep and verbally provide your 4-digit SMS OTP to the delivery agent.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Reusable Order Summary & "Process to Pay" */}
            <div className="w-full lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-[#0b101f]/95 p-4 sm:p-5 backdrop-blur-md space-y-4 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h2 className="text-sm sm:text-base font-bold text-white">
                    Order Summary
                  </h2>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </span>
                </div>

                {/* Cart Products List with Image and Quantity x Price = Answer */}
                {items.length > 0 && (
                  <div className="space-y-2.5 pb-3 border-b border-white/10">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400">
                      <span>Products in Order</span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {Math.min(visibleSummaryCount, items.length)} of {items.length} shown
                      </span>
                    </div>

                    <div className="space-y-2">
                      {displayedSummaryItems.map((item) => {
                        const itemSubtotal = item.quantity * item.price;
                        return (
                          <div
                            key={`summary-${item.id}-${item.selectedSize || ""}-${item.selectedColor || ""}`}
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
                          >
                            {/* Product Thumbnail */}
                            <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden border border-white/10 bg-black/40">
                              <img
                                src={item.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80"}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                              <span className="absolute bottom-0.5 right-0.5 rounded bg-black/80 px-1 text-[9px] font-bold text-white font-mono">
                                x{item.quantity}
                              </span>
                            </div>

                            {/* Details and Calculation: Quantity x Price = Total */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-semibold text-white truncate" title={item.name}>
                                {item.name}
                              </h4>
                              {(item.selectedSize || item.selectedColor) && (
                                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                                  {item.selectedSize && (
                                    <span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                      {item.selectedSize}
                                    </span>
                                  )}
                                  {item.selectedColor && (
                                    <span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                      {item.selectedColor}
                                    </span>
                                  )}
                                </div>
                              )}
                              <div className="mt-1 text-[11px] font-mono">
                                <span className="text-zinc-400">
                                  {item.quantity} × {item.price.toLocaleString()} ETB ={" "}
                                </span>
                                <span className="text-cyan-300 font-bold">
                                  {itemSubtotal.toLocaleString()} ETB
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Step-by-step View More (+2) / View Less (-2) Controls */}
                    {items.length > 2 && (
                      <div className="flex items-center justify-between gap-2 pt-1">
                        {visibleSummaryCount < items.length ? (
                          <button
                            type="button"
                            onClick={() => setVisibleSummaryCount((prev) => prev + 2)}
                            className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/20 px-3 py-1.5 rounded-lg transition-all cursor-pointer active:scale-98"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                            <span>View More (+2)</span>
                          </button>
                        ) : (
                          <div />
                        )}

                        {visibleSummaryCount > 2 && (
                          <button
                            type="button"
                            onClick={() => setVisibleSummaryCount((prev) => Math.max(2, prev - 2))}
                            className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-zinc-400 hover:text-zinc-200 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-all cursor-pointer active:scale-98 ml-auto"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                            <span>View Less (-2)</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Costs Breakdown */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Items Subtotal</span>
                    <span className="text-white font-mono font-semibold">
                      {subtotal.toLocaleString()} ETB
                    </span>
                  </div>

                  <div className="flex justify-between text-zinc-400">
                    <span>Doorstep Courier Delivery</span>
                    <span className="text-white font-mono font-semibold">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-400 font-bold">FREE (Over 5,000 ETB)</span>
                      ) : (
                        `${deliveryFee} ETB`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-zinc-400">
                    <span>100% Buyer Protection</span>
                    <span className="text-emerald-400 font-bold">Covered (0 ETB)</span>
                  </div>

                  <div className="pt-2.5 border-t border-white/10 flex justify-between text-sm sm:text-base font-bold text-white">
                    <span>Total Amount</span>
                    <span className="font-mono text-cyan-300">
                      {total.toLocaleString()} ETB
                    </span>
                  </div>
                </div>

                {/* Selected Payment Summary Pill */}
                <div className="rounded-xl bg-white/[0.02] border border-white/10 p-2.5 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Payment Gateway:</span>
                  <span className="font-semibold text-white flex items-center gap-1.5 text-right">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span>
                      Chapa Protection (
                      {paymentMethod === "telebirr"
                        ? "Telebirr"
                        : paymentMethod === "cbe"
                        ? "CBE Birr"
                        : "Cards / Banks"}
                      )
                    </span>
                  </span>
                </div>

                {/* "Process to Pay" Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 py-3.5 text-xs sm:text-sm font-bold text-white shadow-xl shadow-teal-500/20 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Redirecting to Chapa Gateway...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Process to Pay with Chapa</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  <Link
                    href="/cart"
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Return to Shopping Cart</span>
                  </Link>
                </div>
              </div>

              {/* Delivery Confidence Card */}
              <div className="rounded-2xl border border-white/10 bg-[#0b101f]/60 p-4 backdrop-blur-sm space-y-2 text-xs">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Truck className="h-4 w-4 text-cyan-400" />
                  <span className="font-semibold">Courier Delivery Commitment</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Average delivery speed within Addis Ababa is 2 to 4 hours. You will receive real-time SMS updates with courier phone number and tracking.
                </p>
              </div>
            </div>
          </form>
        )}
      </main>

      {/* Mobile Floating Sticky Pay Bar */}
      {mounted && items.length > 0 && (
        <div className="sm:hidden fixed bottom-14 left-0 right-0 z-30 border-t border-white/10 bg-[#090d18]/95 backdrop-blur-2xl px-4 py-2.5 shadow-[0_-8px_25px_rgba(0,0,0,0.7)] flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-zinc-400 block uppercase font-medium">Total to Pay</span>
            <span className="text-sm font-black text-cyan-300 font-mono">
              {total.toLocaleString()} ETB
            </span>
          </div>
          <button
            type="button"
            onClick={handleProcessToPay as any}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-teal-500/25 active:scale-95 transition-all disabled:opacity-75 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5" />
                <span>Pay with Chapa</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Floating Mobile Bottom Navigation Bar */}
      <CustomerBottomNav />

      <CustomerFooter />
    </div>
  );
}

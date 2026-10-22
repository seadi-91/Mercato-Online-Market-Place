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
  KeyRound,
  Eye,
  EyeOff,
  X,
  ExternalLink,
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
import { getAccurateProductImage } from "@/lib/utils/product-image";
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

  // Payment Method State: Chapa (Cards & Banks) or MercatoX Card (0% Fee Loyalty & Wallet)
  const [paymentMethod, setPaymentMethod] = useState<"chapa" | "mercatox_card">("chapa");

  // MercatoX Card Live State
  const [userCard, setUserCard] = useState<any | null>(null);
  const [isLoadingCard, setIsLoadingCard] = useState(false);
  const [cardChecked, setCardChecked] = useState(false);

  // 8-Digit Security PIN Modal State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [cardPin, setCardPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isResendingPin, setIsResendingPin] = useState(false);

  const handleResendPin = async () => {
    const targetEmail =
      (user?.email && user.email.includes("@") && !user.email.includes("example.com"))
        ? user.email
        : (userCard?.email || email.trim() || user?.email);
    if (!targetEmail) {
      toast.error("No email address found for this card.");
      return;
    }
    setIsResendingPin(true);
    toast.loading("Sending 8-digit password to your email...", { id: "resend-pin-checkout" });
    try {
      const res = await fetch("/api/card/resend-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail,
          phoneNumber: userCard?.phoneNumber || phoneNumber || user?.phoneNumber,
          customerId: user?.id,
          cardNumber: userCard?.cardNumber,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Card Password Sent to Email!", {
          id: "resend-pin-checkout",
          description: `Your 8-digit card password has been sent to ${targetEmail}. Please check your inbox and spam folder.`,
        });
      } else {
        toast.error(data.error || "Failed to send email", { id: "resend-pin-checkout" });
      }
    } catch (err: any) {
      toast.error(err.message || "Network error", { id: "resend-pin-checkout" });
    } finally {
      setIsResendingPin(false);
    }
  };

  const loadUserCard = async () => {
    const queryEmail = email.trim() || user?.email || "";
    const queryPhone = phoneNumber.trim() || user?.phoneNumber || "";
    const queryCustomerId = user?.id || "";

    // Instant local cache check for fastest response
    try {
      const storageKey = `mercatox_card_${(queryEmail || queryCustomerId || "current").toLowerCase().trim()}`;
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.cardNumber) {
          setUserCard(parsed);
        }
      }
    } catch { }

    if (!queryEmail && !queryPhone && !queryCustomerId) {
      setUserCard(null);
      setCardChecked(true);
      return;
    }

    setIsLoadingCard(true);
    try {
      const res = await fetch(
        `/api/card/my-cards?email=${encodeURIComponent(queryEmail)}&phoneNumber=${encodeURIComponent(queryPhone)}&customerId=${encodeURIComponent(queryCustomerId)}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.cards) && data.cards.length > 0) {
        const activeCard = data.cards.find((c: any) => c.status === "ACTIVE") || data.cards[0];
        setUserCard(activeCard);
        try {
          const storageKey = `mercatox_card_${(queryEmail || queryCustomerId || "current").toLowerCase().trim()}`;
          localStorage.setItem(storageKey, JSON.stringify(activeCard));
        } catch { }
      } else {
        setUserCard(null);
      }
    } catch (err) {
      console.warn("Failed to load user card:", err);
    } finally {
      setIsLoadingCard(false);
      setCardChecked(true);
    }
  };

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

  useEffect(() => {
    if (mounted) {
      loadUserCard();
    }
  }, [mounted, user?.id, user?.email, user?.phoneNumber, paymentMethod]);

  const subtotal = mounted ? getTotalPrice() : 0;
  const deliveryFee = subtotal > 5000 || subtotal === 0 ? 0 : 150;
  const total = subtotal + deliveryFee;
  const displayedSummaryItems = items.slice(0, visibleSummaryCount);

  // MercatoX Card calculations & states
  const hasCard = !!userCard;
  const cardBalance = Number(userCard?.balance || 0);
  const hasSufficientBalance = hasCard && cardBalance >= total;
  const shortageAmount = Math.max(0, total - cardBalance);
  const balanceAfterOrder = Math.max(0, cardBalance - total);

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
    if (checked && fullName.trim() && phoneNumber.trim() && specificAddress.trim()) {
      saveAddressToDatabase(false);
    }
  };

  // Authorizes card payment with 8-digit password
  const executeCardPayment = async (enteredPin: string) => {
    const cleanPin = (enteredPin || "").trim();
    if (!cleanPin || cleanPin.length !== 8) {
      setPinError("Please enter your 8-digit card password");
      return;
    }

    setIsProcessing(true);
    setPinError("");
    toast.loading("Authorizing MercatoX Card zero-fee payment...", { id: "payment-process" });

    try {
      const targetSellerId =
        (items[0] as any)?.sellerId ||
        (user as any)?.sellerId ||
        "59972f9f-49ec-4592-9113-ba70a0aa3a52";

      const resolvedCustomerEmail =
        (email && email.trim().includes("@") && !email.includes("example.com"))
          ? email.trim()
          : (user?.email && user.email.includes("@") && !user.email.includes("example.com")
              ? user.email
              : (userCard?.email || email.trim() || user?.email || ""));

      const res = await initializeChapaCheckout({
        amount: total,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: resolvedCustomerEmail,
        subcity,
        specificAddress: specificAddress.trim(),
        deliveryNotes: deliveryNotes.trim(),
        paymentMethod: "mercatox_card",
        cardNumber: userCard?.cardNumber,
        cardPassword: cleanPin,
        customerId: user?.id,
        sellerId: targetSellerId,
        items: items.map((it) => ({
          id: it.id,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
          image: it.image,
          sellerId: (it as any).sellerId || targetSellerId,
        })),
      });

      if (res.success && res.checkoutUrl) {
        setIsPinModalOpen(false);
        clearCart();

        try {
          const orderSnapshot = {
            orderId: res.orderId,
            orderNumber: res.orderNumber,
            txRef: res.txRef || `MX-CARD-${Date.now()}`,
            amount: total,
            customerId: user?.id,
            sellerId: targetSellerId,
            fullName: fullName.trim(),
            phoneNumber: phoneNumber.trim(),
            email: resolvedCustomerEmail || undefined,
            subcity,
            specificAddress: specificAddress.trim(),
            deliveryNotes: deliveryNotes.trim(),
            paymentMethod: "mercatox_card",
            items: items.map((it) => ({
              id: it.id,
              name: it.name,
              price: it.price,
              quantity: it.quantity,
              image: it.image,
              sellerId: (it as any).sellerId || targetSellerId,
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

        toast.success("Payment Approved!", {
          id: "payment-process",
          description: `Order ${res.orderNumber || ""} confirmed with MercatoX Card.`,
        });

        window.location.href = res.checkoutUrl;
      } else {
        setIsProcessing(false);
        setPinError(res.error || "Payment failed. Please check your password and try again.");
        toast.error("Payment Failed", {
          id: "payment-process",
          description: res.error || "Could not authorize card payment.",
        });
      }
    } catch (err: any) {
      setIsProcessing(false);
      setPinError(err.message || "Network error");
      toast.error("Error", {
        id: "payment-process",
        description: err.message || "Failed to complete transaction",
      });
    }
  };

  const executeChapaPayment = async () => {
    setIsProcessing(true);
    toast.loading("Connecting to Chapa Hosted Payment Gateway...", { id: "payment-process" });

    try {
      const targetSellerId =
        (items[0] as any)?.sellerId ||
        (user as any)?.sellerId ||
        "59972f9f-49ec-4592-9113-ba70a0aa3a52";

      const resolvedCustomerEmail =
        (email && email.trim().includes("@") && !email.includes("example.com"))
          ? email.trim()
          : (user?.email && user.email.includes("@") && !user.email.includes("example.com")
              ? user.email
              : (userCard?.email || email.trim() || user?.email || ""));

      const res = await initializeChapaCheckout({
        amount: total,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: resolvedCustomerEmail,
        subcity,
        specificAddress: specificAddress.trim(),
        deliveryNotes: deliveryNotes.trim(),
        paymentMethod: "chapa",
        customerId: user?.id,
        sellerId: targetSellerId,
        items: items.map((it) => ({
          id: it.id,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
          image: it.image,
          sellerId: (it as any).sellerId || targetSellerId,
        })),
      });

      if (res.success && res.checkoutUrl) {
        try {
          const orderSnapshot = {
            orderId: res.orderId,
            orderNumber: res.orderNumber,
            txRef: res.txRef || `MX-CHAPA-${Date.now()}`,
            amount: total,
            customerId: user?.id,
            sellerId: targetSellerId,
            fullName: fullName.trim(),
            phoneNumber: phoneNumber.trim(),
            email: resolvedCustomerEmail || undefined,
            subcity,
            specificAddress: specificAddress.trim(),
            deliveryNotes: deliveryNotes.trim(),
            paymentMethod: "chapa",
            items: items.map((it) => ({
              id: it.id,
              name: it.name,
              price: it.price,
              quantity: it.quantity,
              image: it.image,
              sellerId: (it as any).sellerId || targetSellerId,
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
          description: "Complete your protected payment on Chapa (Cards & Banks).",
        });

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
        description: err.message || "Network error",
      });
    }
  };

  const handleProcessToPay = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

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

    if (saveForFuture && token) {
      saveAddressToDatabase(true);
    }

    // When MercatoX Card is selected, handle the 3 cases:
    if (paymentMethod === "mercatox_card") {
      if (!hasCard) {
        toast.error("You do not have an active MercatoX Card. Redirecting to card purchase...");
        router.push("/card");
        return;
      }
      if (!hasSufficientBalance) {
        toast.error(
          `Insufficient card balance! Available: ${cardBalance.toLocaleString()} ETB | Required: ${total.toLocaleString()} ETB (Shortage: ${shortageAmount.toLocaleString()} ETB)`
        );
        return;
      }

      // Has card and has sufficient balance: Ask for 8-digit Card Password!
      setCardPin("");
      setPinError("");
      setIsPinModalOpen(true);
      return;
    }

    // Default: Chapa Gateway
    await executeChapaPayment();
  }; return (
    <div className="min-h-screen flex flex-col bg-app-surface text-app transition-colors duration-200 selection:bg-indigo-500/30 selection:text-indigo-200">
      <CustomerHeader />

      <main className="flex-1 mx-auto max-w-6xl w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 pb-28 sm:pb-12">
        {/* Navigation Breadcrumb & Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-app pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-app-muted mb-1">
              <Link href="/cart" className="hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors flex items-center gap-1">
                <RotateCcw className="h-3 w-3" />
                <span>Cart</span>
              </Link>
              <span>/</span>
              <span className="text-app font-medium">Checkout &amp; Protected Payment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-app flex items-center gap-2.5">
              <Lock className="h-6 w-6 text-cyan-500 dark:text-cyan-400" />
              <span>Buyer Protected Checkout</span>
            </h1>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>100% Buyer Protection Guaranteed</span>
          </div>
        </div>

        {!mounted ? (
          <div className="py-24 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            <p className="mt-4 text-xs text-app-muted">Loading checkout session...</p>
          </div>
        ) : items.length === 0 ? (
          /* Empty Cart Notice */
          <div className="rounded-3xl border border-app bg-app-card p-12 text-center space-y-4 max-w-xl mx-auto shadow-xl dark:shadow-2xl">
            <div className="h-16 w-16 rounded-2xl bg-app-surface border border-app flex items-center justify-center mx-auto text-app-muted">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-app">Your cart is currently empty</h2>
              <p className="text-xs text-app-muted">
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
              <div className="rounded-2xl border border-app bg-app-card p-5 backdrop-blur-md space-y-4 shadow-lg dark:shadow-xl">
                <div className="flex items-center gap-2.5 border-b border-app pb-3">
                  <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-sm sm:text-base font-bold text-app">
                        1. Customer Information
                      </h2>
                      {profileLoadedFromDb ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10.5px] font-semibold">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Loaded from Database</span>
                        </span>
                      ) : isLoadingProfile ? (
                        <span className="inline-flex items-center gap-1.5 text-[10.5px] text-app-muted">
                          <div className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                          <span>Checking saved info...</span>
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-app-muted">
                      Who should we deliver to and contact for SMS OTP release?
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Full Name */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-app block">
                      Recipient Full Name <span className="text-rose-500 dark:text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Abebe Kebede"
                        className="w-full rounded-xl border border-app bg-app-surface px-3.5 py-2.5 text-xs text-app placeholder:text-app-muted/60 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-app block">
                      Phone Number (for SMS OTP) <span className="text-rose-500 dark:text-rose-400">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 flex items-center gap-1.5 text-app-muted text-xs font-mono pointer-events-none">
                        <span>🇪🇹</span>
                        <span>+251</span>
                      </div>
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="911 234 567"
                        className="w-full rounded-xl border border-app bg-app-surface pl-20 pr-3.5 py-2.5 text-xs text-app placeholder:text-app-muted/60 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors font-mono"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-app block">
                      Email Address <span className="text-app-muted text-[10px]">(for digital receipt)</span>
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 h-3.5 w-3.5 text-app-muted pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="abebe@example.com"
                        className="w-full rounded-xl border border-app bg-app-surface pl-9 pr-3.5 py-2.5 text-xs text-app placeholder:text-app-muted/60 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Doorstep Delivery Details */}
              <div className="rounded-2xl border border-app bg-app-card p-5 backdrop-blur-md space-y-4 shadow-lg dark:shadow-xl">
                <div className="flex items-center gap-2.5 border-b border-app pb-3">
                  <div className="h-7 w-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 dark:text-cyan-400">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-app">
                      2. Doorstep Delivery Details
                    </h2>
                    <p className="text-[11px] text-app-muted">
                      Dispatched directly from verified local merchants in Addis Ababa.
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {/* City & Subcity */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="space-y-1.5 sm:col-span-1">
                      <label className="text-xs font-semibold text-app block">
                        City
                      </label>
                      <input
                        type="text"
                        disabled
                        value="Addis Ababa"
                        className="w-full rounded-xl border border-app bg-app-surface/60 px-3.5 py-2.5 text-xs text-app-muted font-semibold cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-app block">
                        Addis Ababa Subcity <span className="text-rose-500 dark:text-rose-400">*</span>
                      </label>
                      <select
                        value={subcity}
                        onChange={(e) => setSubcity(e.target.value)}
                        className="w-full rounded-xl border border-app bg-app-surface px-3.5 py-2.5 text-xs text-app outline-none focus:border-cyan-500 dark:focus:border-cyan-400 cursor-pointer"
                      >
                        {ADDIS_SUBCITIES.map((sc) => (
                          <option key={sc} value={sc} className="bg-app-card text-app">
                            {sc}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Specific Delivery Address / Landmark */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-app block">
                      Specific Address / Building / Landmark / House No <span className="text-rose-500 dark:text-rose-400">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <MapPin className="absolute left-3 h-3.5 w-3.5 text-app-muted pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={specificAddress}
                        onChange={(e) => setSpecificAddress(e.target.value)}
                        placeholder="e.g. Bole Rwanda, near Embassy, Villa 412, Gate 2"
                        className="w-full rounded-xl border border-app bg-app-surface pl-9 pr-3.5 py-2.5 text-xs text-app placeholder:text-app-muted/60 outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Delivery Notes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-app block">
                      Courier Delivery Instructions <span className="text-app-muted text-[10px]">(optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="e.g. Please call 10 minutes before arriving at the gate."
                      className="w-full rounded-xl border border-app bg-app-surface px-3.5 py-2 text-xs text-app placeholder:text-app-muted/60 outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors resize-none"
                    />
                  </div>

                  {/* Save info for future checkout & Database persistence */}
                  <div className="rounded-xl border border-indigo-500/25 bg-indigo-500/5 dark:bg-gradient-to-r dark:from-indigo-950/40 dark:via-[#0d1224] dark:to-cyan-950/30 p-4 space-y-3 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center h-5 mt-0.5">
                        <input
                          id="save-future-address"
                          type="checkbox"
                          checked={saveForFuture}
                          onChange={handleToggleSaveForFuture}
                          className="h-4 w-4 rounded border-app bg-app-surface text-indigo-500 focus:ring-indigo-400 cursor-pointer accent-indigo-500"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor="save-future-address"
                          className="text-xs font-semibold text-app cursor-pointer select-none flex items-center gap-1.5 flex-wrap"
                        >
                          <span>Save this delivery address &amp; contact info for future orders</span>
                          <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-1.5 py-0.2 text-[9.5px] font-mono text-cyan-600 dark:text-cyan-300">
                            Database Sync
                          </span>
                        </label>
                        <p className="text-[11px] text-app-muted mt-0.5">
                          Stores your address securely in the PostgreSQL database and pre-fills it automatically on your next order.
                        </p>
                      </div>
                    </div>

                    {/* Instant Save to Database Button & Status Indicator */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-app text-xs">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        {isAddressSavedInDb ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Address is saved &amp; synced in database</span>
                          </span>
                        ) : profileLoadedFromDb ? (
                          <span className="text-cyan-600 dark:text-cyan-400 font-medium flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Loaded from database (Edit &amp; save if changed)</span>
                          </span>
                        ) : token ? (
                          <span className="text-app-muted">
                            Check box or click button to save to your account
                          </span>
                        ) : (
                          <span className="text-app-muted/80">
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
              <div className="rounded-2xl border border-app bg-app-card p-4 sm:p-5 backdrop-blur-md space-y-4 shadow-lg dark:shadow-xl">
                <div className="flex items-center gap-2.5 border-b border-app pb-3">
                  <div className="h-7 w-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 dark:text-purple-400">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-app">
                      3. Protected Payment Method
                    </h2>
                    <p className="text-[11px] text-app-muted">
                      Choose your preferred payment service. Funds stay protected until OTP release.
                    </p>
                  </div>
                </div>

                {/* Payment Option Buttons: Chapa & MercatoX Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Chapa Gateway */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("chapa")}
                    className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${paymentMethod === "chapa"
                        ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30"
                        : "border-app bg-app-surface/50 hover:bg-app-card hover:border-app-hover"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                          <CreditCard className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-indigo-600 dark:text-indigo-300">Chapa Gateway</span>
                        <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-600 dark:text-amber-300 tracking-wider">
                          2% BONUS
                        </span>
                      </div>
                      {paymentMethod === "chapa" && (
                        <CheckCircle2 className="h-4 w-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-app">Cards &amp; Mobile Banking</p>
                      <p className="text-[10px] text-app-muted mt-0.5">
                        Debit card, Visa, Mastercard, Awash &amp; Dashen
                      </p>
                    </div>
                  </button>

                  {/* MercatoX Card */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("mercatox_card")}
                    className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${paymentMethod === "mercatox_card"
                        ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30"
                        : "border-app bg-app-surface/50 hover:bg-app-card hover:border-app-hover"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-500 dark:text-cyan-400">
                          <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-cyan-600 dark:text-cyan-300">MercatoX Card</span>
                        <span className="rounded-full bg-cyan-500/20 border border-cyan-500/40 px-1.5 py-0.5 text-[9px] font-extrabold text-cyan-600 dark:text-cyan-300 tracking-wider">
                          0% FEE
                        </span>
                      </div>
                      {paymentMethod === "mercatox_card" && (
                        <CheckCircle2 className="h-4 w-4 text-cyan-500 dark:text-cyan-400 shrink-0" />
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-app">Digital Loyalty &amp; Wallet</p>
                      <p className="text-[10px] text-app-muted mt-0.5">
                        Zero-fee escrow pay, instant cashback &amp; reward points
                      </p>
                    </div>
                  </button>
                </div>

                {/* Dynamic 2% Card Cashback Reward Banner for Chapa */}
                {paymentMethod === "chapa" && (
                  <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-cyan-500/10 p-3.5 space-y-1.5 shadow-sm animate-in fade-in duration-200">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                          <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs font-bold text-app">
                          Chapa Payment 2% Card Cashback Reward
                        </span>
                      </div>
                      <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-extrabold text-amber-500 dark:text-amber-300 font-mono">
                        +{(total * 0.02).toFixed(2)} ETB Card Reward
                      </span>
                    </div>
                    <p className="text-[11px] text-app-muted leading-relaxed">
                      Pay with Chapa and get <strong className="text-amber-500 dark:text-amber-300 font-bold">2% ({(total * 0.02).toFixed(2)} ETB)</strong> of your total order amount automatically saved to your <strong className="text-cyan-500 dark:text-cyan-300 font-bold">MercatoX Card</strong> as a bonus reward!
                    </p>
                  </div>
                )}

                {/* Dynamic MercatoX Card Status & Guidance Box */}
                {paymentMethod === "mercatox_card" && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    {isLoadingCard ? (
                      <div className="rounded-xl border border-app bg-app-surface p-4 flex items-center justify-center gap-2.5 text-xs text-app-muted">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
                        <span>Checking MercatoX Card status...</span>
                      </div>
                    ) : !hasCard && cardChecked ? (
                      /* CASE 1: USER DOES NOT HAVE A CARD */
                      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 dark:bg-gradient-to-r dark:from-rose-950/40 dark:via-red-950/20 dark:to-black/50 p-4 space-y-3 shadow-lg">
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-500 dark:text-rose-400 shrink-0">
                            <AlertCircle className="h-5 w-5" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-app text-xs sm:text-sm">
                                No MercatoX Card Found
                              </h3>
                              <span className="rounded-full bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 text-[9px] font-extrabold text-rose-600 dark:text-rose-300">
                                Card Required
                              </span>
                            </div>
                            <p className="text-[11.5px] text-app-muted leading-relaxed">
                              To use MercatoX Card payment, you must first purchase a card. Enjoy 0% transaction fees and 5% automatic cashback by ordering your card now.
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 pt-1">
                          <Link
                            href="/card"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 text-white shadow-md shadow-rose-600/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Buy MercatoX Card Now</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setPaymentMethod("chapa")}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-app-muted hover:text-app bg-app-surface hover:bg-app-card border border-app transition-colors cursor-pointer"
                          >
                            <span>Switch to Chapa</span>
                          </button>
                        </div>
                      </div>
                    ) : hasCard && !hasSufficientBalance ? (
                      /* CASE 2: USER HAS A CARD BUT INSUFFICIENT BALANCE */
                      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-gradient-to-r dark:from-amber-950/40 dark:via-yellow-950/20 dark:to-black/50 p-4 space-y-3 shadow-lg">
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0">
                            <AlertCircle className="h-5 w-5" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-app text-xs sm:text-sm">
                                  Insufficient Card Balance
                                </h3>
                                <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[9px] font-extrabold text-amber-600 dark:text-amber-300 font-mono">
                                  {userCard?.cardNumber ? `•••• ${userCard.cardNumber.slice(-4)}` : "CARD"}
                                </span>
                              </div>
                            </div>
                            <p className="text-[11.5px] text-app-muted leading-relaxed">
                              You do not have enough card balance to cover this order. Please top up your card or switch to another payment method.
                            </p>
                          </div>
                        </div>

                        {/* Balance vs Requirement Comparison Grid */}
                        <div className="grid grid-cols-3 gap-2 pt-1 pb-1">
                          <div className="rounded-xl bg-app-surface border border-app p-2.5 text-center">
                            <span className="text-[10px] text-app-muted block font-medium">Card Balance</span>
                            <span className="font-mono font-bold text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                              {cardBalance.toLocaleString()} ETB
                            </span>
                          </div>

                          <div className="rounded-xl bg-app-surface border border-app p-2.5 text-center">
                            <span className="text-[10px] text-app-muted block font-medium">Order Total</span>
                            <span className="font-mono font-bold text-xs sm:text-sm text-app">
                              {total.toLocaleString()} ETB
                            </span>
                          </div>

                          <div className="rounded-xl bg-app-surface border border-rose-500/30 p-2.5 text-center">
                            <span className="text-[10px] text-rose-500 dark:text-rose-300 block font-medium">Shortage</span>
                            <span className="font-mono font-bold text-xs sm:text-sm text-rose-600 dark:text-rose-400">
                              -{shortageAmount.toLocaleString()} ETB
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 pt-1">
                          <Link
                            href="/card"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-md shadow-amber-600/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            <span>Top Up / Manage Card</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setPaymentMethod("chapa")}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-app-muted hover:text-app bg-app-surface hover:bg-app-card border border-app transition-colors cursor-pointer"
                          >
                            <span>Pay with Chapa</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* CASE 3: USER HAS CARD AND SUFFICIENT BALANCE */
                      <div className="rounded-2xl border border-cyan-500/40 bg-cyan-500/5 dark:bg-gradient-to-r dark:from-cyan-950/40 dark:via-indigo-950/30 dark:to-black/50 p-4 space-y-3 shadow-lg">
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-500 dark:text-cyan-400 shrink-0">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-app text-xs sm:text-sm">
                                  Sufficient Balance Available
                                </h3>
                                <span className="rounded-full bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 text-[9px] font-extrabold text-cyan-600 dark:text-cyan-300 font-mono">
                                  {userCard?.cardNumber ? `•••• ${userCard.cardNumber.slice(-4)}` : "CARD"}
                                </span>
                                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                                  Ready to Pay
                                </span>
                              </div>

                              <Link
                                href="/card"
                                className="hidden sm:inline-flex items-center gap-1 text-[11px] text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 hover:underline shrink-0 font-medium"
                              >
                                <span>Manage Card</span>
                                <ArrowRight className="h-3 w-3" />
                              </Link>
                            </div>
                            <p className="text-[11.5px] text-app-muted leading-relaxed">
                              You have sufficient card balance to complete this purchase with 0% transaction fees and instant escrow protection. Click 'Pay with MercatoX Card' and enter your 8-digit Card Password to authorize payment.
                            </p>
                          </div>
                        </div>

                        {/* Balance Breakdown Grid */}
                        <div className="grid grid-cols-3 gap-2 pt-1">
                          <div className="rounded-xl bg-app-surface border border-app p-2.5 text-center">
                            <span className="text-[10px] text-app-muted block font-medium">Card Balance</span>
                            <span className="font-mono font-bold text-xs sm:text-sm text-cyan-600 dark:text-cyan-300">
                              {cardBalance.toLocaleString()} ETB
                            </span>
                          </div>

                          <div className="rounded-xl bg-app-surface border border-app p-2.5 text-center">
                            <span className="text-[10px] text-app-muted block font-medium">Order Payment</span>
                            <span className="font-mono font-bold text-xs sm:text-sm text-app">
                              -{total.toLocaleString()} ETB
                            </span>
                          </div>

                          <div className="rounded-xl bg-app-surface border border-emerald-500/30 p-2.5 text-center">
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-300 block font-medium">Remaining Balance</span>
                            <span className="font-mono font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                              {balanceAfterOrder.toLocaleString()} ETB
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Buyer Protection Guarantee Notice Box */}
                <div className="rounded-xl bg-app-surface border border-app p-3.5 flex items-start gap-3 text-xs text-app-muted">
                  <ShieldCheck className="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-app">
                      100% Buyer Protection Protocol
                    </p>
                    <p className="text-[11px] text-app-muted leading-relaxed">
                      Your payment will be securely held in MercatoX protected account. The seller does <strong className="text-app font-bold">not</strong> receive payment until you inspect the package at your doorstep and verbally provide your 4-digit SMS OTP to the delivery agent.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & "Process to Pay" */}
            <div className="w-full lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-app bg-app-card p-4 sm:p-5 backdrop-blur-md space-y-4 shadow-xl dark:shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-app pb-3">
                  <h2 className="text-sm sm:text-base font-bold text-app">
                    Order Summary
                  </h2>
                  <span className="text-[11px] text-app-muted font-medium">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </span>
                </div>

                {/* Cart Products List with Image and Quantity x Price = Answer */}
                {items.length > 0 && (
                  <div className="space-y-2.5 pb-3 border-b border-app">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-app-muted">
                      <span>Products in Order</span>
                      <span className="text-[10px] text-app-muted/80 font-mono">
                        {Math.min(visibleSummaryCount, items.length)} of {items.length} shown
                      </span>
                    </div>

                    <div className="space-y-2">
                      {displayedSummaryItems.map((item) => {
                        const itemSubtotal = item.quantity * item.price;
                        return (
                          <div
                            key={`summary-${item.id}-${item.selectedSize || ""}-${item.selectedColor || ""}`}
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-app-surface border border-app hover:border-app-hover transition-colors"
                          >
                            {/* Product Thumbnail */}
                            <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden border border-app bg-app-surface">
                              <img
                                src={getAccurateProductImage(item.name, undefined, item.image)}
                                alt={item.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = getAccurateProductImage(item.name);
                                }}
                              />
                              <span className="absolute bottom-0.5 right-0.5 rounded bg-black/80 px-1 text-[9px] font-bold text-white font-mono">
                                x{item.quantity}
                              </span>
                            </div>

                            {/* Details and Calculation: Quantity x Price = Total */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-semibold text-app truncate" title={item.name}>
                                {item.name}
                              </h4>
                              {(item.selectedSize || item.selectedColor) && (
                                <div className="flex items-center gap-1.5 text-[10px] text-app-muted mt-0.5">
                                  {item.selectedSize && (
                                    <span className="bg-app-card px-1.5 py-0.5 rounded border border-app">
                                      {item.selectedSize}
                                    </span>
                                  )}
                                  {item.selectedColor && (
                                    <span className="bg-app-card px-1.5 py-0.5 rounded border border-app">
                                      {item.selectedColor}
                                    </span>
                                  )}
                                </div>
                              )}
                              <div className="mt-1 text-[11px] font-mono">
                                <span className="text-app-muted">
                                  {item.quantity} × {item.price.toLocaleString()} ETB ={" "}
                                </span>
                                <span className="text-cyan-600 dark:text-cyan-300 font-bold">
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
                            className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/20 px-3 py-1.5 rounded-lg transition-all cursor-pointer active:scale-98"
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
                            className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-app-muted hover:text-app bg-app-surface hover:bg-app-card border border-app px-3 py-1.5 rounded-lg transition-all cursor-pointer active:scale-98 ml-auto"
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
                  <div className="flex justify-between text-app-muted">
                    <span>Items Subtotal</span>
                    <span className="text-app font-mono font-semibold">
                      {subtotal.toLocaleString()} ETB
                    </span>
                  </div>

                  <div className="flex justify-between text-app-muted">
                    <span>Doorstep Courier Delivery</span>
                    <span className="text-app font-mono font-semibold">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE (Over 5,000 ETB)</span>
                      ) : (
                        `${deliveryFee} ETB`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-app-muted">
                    <span>100% Buyer Protection</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Covered (0 ETB)</span>
                  </div>

                  <div className="pt-2.5 border-t border-app flex justify-between text-sm sm:text-base font-bold text-app">
                    <span>Total Amount</span>
                    <span className="font-mono text-cyan-600 dark:text-cyan-300">
                      {total.toLocaleString()} ETB
                    </span>
                  </div>
                </div>

                {/* Selected Payment Summary Pill */}
                <div className="rounded-xl bg-app-surface border border-app p-2.5 flex items-center justify-between text-xs">
                  <span className="text-app-muted">Payment Gateway:</span>
                  <span className="font-semibold text-app flex items-center gap-1.5 text-right">
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${paymentMethod === "mercatox_card"
                          ? !hasCard
                            ? "bg-rose-500"
                            : !hasSufficientBalance
                              ? "bg-amber-500"
                              : "bg-cyan-500 animate-pulse"
                          : "bg-emerald-500 animate-pulse"
                        }`}
                    />
                    <span>
                      {paymentMethod === "mercatox_card"
                        ? !hasCard
                          ? "MercatoX Card (No Card)"
                          : !hasSufficientBalance
                            ? `MercatoX Card (${cardBalance.toLocaleString()} ETB)`
                            : "MercatoX Card (0% Fee)"
                        : "Chapa Gateway (Cards & Banks)"}
                    </span>
                  </span>
                </div>

                {/* "Process to Pay" Button with 3 Dynamic MercatoX Card States */}
                {paymentMethod === "mercatox_card" && !hasCard && cardChecked && !isLoadingCard ? (
                  /* Case 1: No card -> Direct redirect to buy card */
                  <Link
                    href="/card"
                    className="w-full rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 py-3.5 text-xs sm:text-sm font-bold text-white shadow-xl shadow-rose-600/20 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Buy MercatoX Card First</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : paymentMethod === "mercatox_card" && hasCard && !hasSufficientBalance ? (
                  /* Case 2: Insufficient balance -> Block and guide to top-up */
                  <button
                    type="button"
                    onClick={() => {
                      toast.error(
                        `Insufficient card balance! Available: ${cardBalance.toLocaleString()} ETB | Required: ${total.toLocaleString()} ETB (Shortage: ${shortageAmount.toLocaleString()} ETB)`
                      );
                      router.push("/card");
                    }}
                    className="w-full rounded-xl bg-amber-500/10 border border-amber-500/30 py-3.5 text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-300 hover:bg-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/5"
                  >
                    <AlertCircle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                    <span>
                      Insufficient Balance ({cardBalance.toLocaleString()} / {total.toLocaleString()} ETB)
                    </span>
                  </button>
                ) : (
                  /* Case 3: Sufficient balance (MercatoX Card) OR Chapa */
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 py-3.5 text-xs sm:text-sm font-bold text-white shadow-xl shadow-teal-500/20 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>
                          {paymentMethod === "mercatox_card"
                            ? "Authorizing MercatoX Card..."
                            : "Redirecting to Chapa Gateway..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        <span>
                          {paymentMethod === "mercatox_card"
                            ? `Pay with MercatoX Card (${total.toLocaleString()} ETB)`
                            : "Process to Pay with Chapa"}
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}

                <div className="text-center pt-1">
                  <Link
                    href="/cart"
                    className="inline-flex items-center gap-1.5 text-xs text-app-muted hover:text-app transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Return to Shopping Cart</span>
                  </Link>
                </div>
              </div>

              {/* Delivery Confidence Card */}
              <div className="rounded-2xl border border-app bg-app-card/60 p-4 backdrop-blur-sm space-y-2 text-xs">
                <div className="flex items-center gap-2 text-app">
                  <Truck className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                  <span className="font-semibold">Courier Delivery Commitment</span>
                </div>
                <p className="text-[11px] text-app-muted leading-relaxed">
                  Average delivery speed within Addis Ababa is 2 to 4 hours. You will receive real-time SMS updates with courier phone number and tracking.
                </p>
              </div>
            </div>
          </form>
        )}
      </main>

      {/* Mobile Floating Sticky Pay Bar */}
      {mounted && items.length > 0 && (
        <div className="sm:hidden fixed bottom-14 left-0 right-0 z-30 border-t border-app bg-app-card/95 backdrop-blur-2xl px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3 text-app">
          <div>
            <span className="text-[10px] text-app-muted block uppercase font-medium">Total to Pay</span>
            <span className="text-sm font-black text-cyan-600 dark:text-cyan-300 font-mono">
              {total.toLocaleString()} ETB
            </span>
          </div>

          {paymentMethod === "mercatox_card" && !hasCard && cardChecked && !isLoadingCard ? (
            <Link
              href="/card"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Buy Card First</span>
            </Link>
          ) : paymentMethod === "mercatox_card" && hasCard && !hasSufficientBalance ? (
            <button
              type="button"
              onClick={() => router.push("/card")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 px-3.5 py-2.5 text-xs font-bold text-amber-600 dark:text-amber-300 active:scale-95 transition-all cursor-pointer"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Top Up Card</span>
            </button>
          ) : (
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
                  <span>
                    {paymentMethod === "mercatox_card"
                      ? "Pay with Card"
                      : "Pay with Chapa"}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* ===================== 8-DIGIT MERCATOX CARD PASSWORD MODAL ===================== */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-cyan-500/30 bg-app-card p-5 sm:p-7 shadow-2xl space-y-5 text-app">
            {/* Top ambient glow */}
            <div className="absolute top-0 right-1/4 w-60 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-app pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-500 dark:text-cyan-400">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-app">
                    Card Security Password
                  </h3>
                  <p className="text-[11px] text-app-muted">
                    Enter your 8-digit Card Password to authorize payment
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isProcessing) {
                    setIsPinModalOpen(false);
                    setPinError("");
                  }
                }}
                disabled={isProcessing}
                className="h-7 w-7 rounded-lg bg-app-surface hover:bg-app-card text-app-muted hover:text-app flex items-center justify-center transition-colors cursor-pointer border border-app"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mini Card & Payment Summary */}
            <div className="rounded-2xl bg-app-surface border border-cyan-500/20 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-app-muted">Cardholder:</span>
                <span className="font-semibold text-app">
                  {userCard?.cardholderName || fullName || "Cardholder"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-app-muted">Card Number:</span>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-300">
                  {userCard?.cardNumber || "4892 •••• •••• ••••"}
                </span>
              </div>
              <div className="pt-2 border-t border-app flex items-center justify-between font-bold">
                <span className="text-app">Amount to Deduct:</span>
                <span className="font-mono text-sm text-cyan-600 dark:text-cyan-400">
                  {total.toLocaleString()} ETB
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-app-muted">
                <span>Balance after deduction:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  {balanceAfterOrder.toLocaleString()} ETB
                </span>
              </div>
            </div>

            {/* 8-Digit PIN Input Box */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-app">
                Enter 8-Digit Card Password <span className="text-rose-500 dark:text-rose-400">*</span>
              </label>

              <div className="relative flex items-center">
                <input
                  type={showPin ? "text" : "password"}
                  maxLength={8}
                  autoFocus
                  value={cardPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 8);
                    setCardPin(val);
                    if (pinError) setPinError("");
                  }}
                  placeholder="••••••••"
                  className="w-full text-center text-xl sm:text-2xl font-mono font-bold tracking-[0.35em] rounded-xl border border-cyan-500/40 bg-app-surface px-4 py-3 text-app placeholder:text-app-muted/40 outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
                />

                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 text-app-muted hover:text-app transition-colors p-1"
                  title={showPin ? "Hide Password" : "Show Password"}
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* 8-Digit Progress Indicators */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-150 ${idx < cardPin.length
                        ? "w-4 bg-cyan-500 dark:bg-cyan-400 shadow-sm shadow-cyan-400/50"
                        : "w-2 bg-app-muted/30"
                      }`}
                  />
                ))}
              </div>

              {pinError ? (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-2.5 text-center animate-in fade-in space-y-1">
                  <p className="text-xs text-rose-500 dark:text-rose-400 font-bold">
                    {pinError}
                  </p>
                  <button
                    type="button"
                    onClick={handleResendPin}
                    disabled={isResendingPin}
                    className="text-[11px] font-semibold text-cyan-500 dark:text-cyan-400 hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <Mail className="h-3 w-3" />
                    <span>{isResendingPin ? "Sending Email..." : "Resend 8-digit password to email"}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-1 pt-1 text-center">
                  <p className="text-[11px] text-app-muted">
                    Enter the 8-digit card password sent to your email ({userCard?.email || email || user?.email || "your registered email"})
                  </p>
                  <button
                    type="button"
                    onClick={handleResendPin}
                    disabled={isResendingPin}
                    className="text-[10.5px] font-medium text-cyan-500 hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <Mail className="h-3 w-3" />
                    <span>{isResendingPin ? "Sending..." : "Forgot password? Resend to email"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => executeCardPayment(cardPin)}
                disabled={cardPin.length !== 8 || isProcessing}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 py-3 text-xs sm:text-sm font-bold text-white shadow-xl shadow-teal-500/25 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Deducting &amp; Confirming Order...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Authorize &amp; Pay {total.toLocaleString()} ETB</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isProcessing) {
                    setIsPinModalOpen(false);
                    setPinError("");
                  }
                }}
                disabled={isProcessing}
                className="w-full py-2.5 rounded-xl border border-app hover:bg-app-surface text-app-muted hover:text-app text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-app-muted pt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>100% Escrow Protected · 0% Transaction Fee</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Mobile Bottom Navigation Bar */}
      <CustomerBottomNav />

      <CustomerFooter />
    </div>
  );
}


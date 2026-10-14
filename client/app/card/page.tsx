"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CreditCard,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Check,
  Gift,
  Percent,
  Phone,
  Mail,
  User,
  Wifi,
  Layers,
  CheckCircle2,
  X,
  Copy,
  ShoppingBag,
  ArrowLeft,
  Download,
  Share2,
  QrCode,
  Wallet,
  Smartphone,
  ChevronRight,
  ExternalLink,
  LogIn,
  UserPlus,
} from "lucide-react";
import { CustomerHeader } from "@/components/layout/customer-header";
import { CustomerFooter } from "@/components/layout/footer";
import { useAuthStore } from "@/store/auth-store";
import { usePlatformStore } from "@/store/platform-store";
import { API_CONFIG } from "@/config/api.config";
import { toast } from "sonner";

// 10 Luxury Card Color Themes with System Brand Color First
export interface CardTheme {
  id: string;
  name: string;
  badge: string;
  gradient: string;
  border: string;
  glow: string;
  chipColor: string;
  accentText: string;
  previewColor: string;
}

const CARD_THEMES: CardTheme[] = [
  {
    id: "mercatox-signature",
    name: "MercatoX Brand Signature",
    badge: "Official Signature",
    gradient: "from-[#070b19] via-[#0f1738] to-[#042137]",
    border: "border-cyan-400/40",
    glow: "bg-cyan-500/25",
    chipColor: "from-amber-200 via-amber-400 to-amber-600",
    accentText: "text-cyan-400",
    previewColor: "bg-gradient-to-r from-indigo-700 via-indigo-600 to-cyan-500",
  },
  {
    id: "obsidian",
    name: "Obsidian Titanium",
    badge: "Black Edition",
    gradient: "from-[#0a0f1d] via-[#11192e] to-[#060a14]",
    border: "border-white/20",
    glow: "bg-indigo-500/15",
    chipColor: "from-amber-200 via-amber-400 to-amber-600",
    accentText: "text-indigo-400",
    previewColor: "bg-gradient-to-r from-[#0f172a] to-[#1e293b]",
  },
  {
    id: "emerald",
    name: "Royal Emerald",
    badge: "Heritage Edition",
    gradient: "from-[#042f2e] via-[#064e3b] to-[#022c22]",
    border: "border-emerald-400/40",
    glow: "bg-emerald-500/20",
    chipColor: "from-amber-200 via-amber-400 to-amber-600",
    accentText: "text-emerald-400",
    previewColor: "bg-gradient-to-r from-[#042f2e] to-[#064e3b]",
  },
  {
    id: "sapphire",
    name: "Midnight Sapphire",
    badge: "Platinum Tier",
    gradient: "from-[#081f3d] via-[#0d315f] to-[#051428]",
    border: "border-blue-400/40",
    glow: "bg-blue-500/20",
    chipColor: "from-slate-200 via-cyan-300 to-slate-400",
    accentText: "text-cyan-400",
    previewColor: "bg-gradient-to-r from-[#081f3d] to-[#0d315f]",
  },
  {
    id: "amethyst",
    name: "Imperial Amethyst",
    badge: "VIP Exclusive",
    gradient: "from-[#280b54] via-[#3a0c78] to-[#1a0538]",
    border: "border-purple-400/40",
    glow: "bg-purple-500/20",
    chipColor: "from-amber-200 via-amber-400 to-amber-600",
    accentText: "text-purple-400",
    previewColor: "bg-gradient-to-r from-[#280b54] to-[#3a0c78]",
  },
  {
    id: "ruby",
    name: "Ruby Rose Gold",
    badge: "Limited Luxury",
    gradient: "from-[#380918] via-[#4d0f23] to-[#22040e]",
    border: "border-rose-400/40",
    glow: "bg-rose-500/20",
    chipColor: "from-rose-200 via-amber-300 to-rose-400",
    accentText: "text-rose-400",
    previewColor: "bg-gradient-to-r from-[#380918] to-[#4d0f23]",
  },
  {
    id: "champagne-gold",
    name: "Solar Champagne Gold",
    badge: "Gold Edition",
    gradient: "from-[#2b1b06] via-[#4d3209] to-[#1c1203]",
    border: "border-amber-400/50",
    glow: "bg-amber-500/25",
    chipColor: "from-amber-100 via-amber-300 to-amber-500",
    accentText: "text-amber-300",
    previewColor: "bg-gradient-to-r from-[#b45309] to-[#f59e0b]",
  },
  {
    id: "platinum-frost",
    name: "Platinum Titanium Frost",
    badge: "Platinum Tier",
    gradient: "from-[#111827] via-[#1f2937] to-[#0f172a]",
    border: "border-slate-300/40",
    glow: "bg-slate-400/20",
    chipColor: "from-slate-100 via-slate-300 to-slate-400",
    accentText: "text-slate-200",
    previewColor: "bg-gradient-to-r from-[#475569] to-[#94a3b8]",
  },
  {
    id: "neon-matrix",
    name: "Cyber Matrix Teal",
    badge: "Matrix Edition",
    gradient: "from-[#021f24] via-[#04333a] to-[#011417]",
    border: "border-teal-400/50",
    glow: "bg-teal-500/25",
    chipColor: "from-teal-100 via-cyan-300 to-teal-400",
    accentText: "text-teal-300",
    previewColor: "bg-gradient-to-r from-[#0d9488] to-[#14b8a6]",
  },
  {
    id: "cosmic-sunset",
    name: "Cosmic Sunset",
    badge: "Cosmic Edition",
    gradient: "from-[#290a2d] via-[#400e39] to-[#1c041f]",
    border: "border-fuchsia-400/40",
    glow: "bg-fuchsia-500/25",
    chipColor: "from-fuchsia-200 via-rose-300 to-amber-300",
    accentText: "text-fuchsia-300",
    previewColor: "bg-gradient-to-r from-[#701a75] to-[#f43f5e]",
  },
];

const DEFAULT_CARD_ISSUANCE_FEE = 150; // Fallback Card Issuance Fee if not configured by admin
const CARD_EXPIRY_DATE = "10/29";

// =========================================================================
// Real ATM / National ID Card Visual Component
// ISO/IEC 7810 ID-1 standard dimensions (aspect ratio 85.60 mm x 53.98 mm)
// =========================================================================
interface AtmCardVisualProps {
  theme: CardTheme;
  cardholderName: string;
  email: string;
  phoneNumber: string;
  loadedAmount: number;
  cardNumber: string;
  expiryDate: string;
  logoUrl?: string;
  platformName?: string;
  onCopyNumber?: () => void;
  isCopied?: boolean;
}

function AtmCardVisual({
  theme,
  cardholderName,
  email,
  phoneNumber,
  loadedAmount,
  cardNumber,
  expiryDate,
  logoUrl,
  platformName = "MercatoX",
  onCopyNumber,
  isCopied = false,
}: AtmCardVisualProps) {
  return (
    <div
      className={`relative w-full max-w-[420px] aspect-[85.6/53.98] rounded-[12px] p-4 sm:p-5 bg-gradient-to-br ${theme.gradient} ${theme.border} shadow-2xl shadow-black/60 text-white flex flex-col justify-between overflow-hidden select-none transition-all duration-300 border backdrop-blur-sm`}
    >
      {/* 1. Realistic Plastic Sheen & Metallic Specular Glare */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.08] to-transparent pointer-events-none" />
      <div className={`absolute -top-16 -right-16 w-40 h-40 ${theme.glow} rounded-full blur-2xl pointer-events-none`} />

      {/* 2. Top Header Row: Real MercatoX Logo + "MercatoX Card" in Brand Color + Hologram Seal */}
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Authentic Real MercatoX Logo - Compact Crisp Rectangle */}
          <div className="relative w-[44px] h-[30px] sm:w-[48px] sm:h-[32px] rounded-[5px] bg-[#090d16] border border-white/20 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0 overflow-hidden p-0 m-0">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={platformName}
                className="w-full h-full object-cover p-0 m-0 block"
              />
            ) : (
              <div className="relative w-full h-full bg-gradient-to-tr from-indigo-700 via-indigo-600 to-cyan-500 flex items-center justify-center p-0 m-0 overflow-hidden">
                {/* Subtle sheen */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />

                {/* Edge-to-Edge Emblem Filling the Full Width with No Gaps */}
                <svg
                  className="w-full h-full block"
                  viewBox="0 0 48 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="topFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#93c5fd" />
                    </linearGradient>
                  </defs>

                  {/* 3D Faceted Isometric MercatoX Cube spanning across the box */}
                  <polygon points="24 3 43 12 24 20 5 12" fill="url(#topFaceGrad)" />
                  <polygon points="5 12 24 20 24 29 5 20" fill="#312e81" />
                  <polygon points="24 20 43 12 43 20 24 29" fill="#0891b2" />

                  {/* Neon Cyan Circuit Core */}
                  <polyline points="5 12 24 20 43 12" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="24" y1="20" x2="24" y2="29" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
                  <polyline points="5 20 24 29 43 20" stroke="white" strokeWidth="1" strokeOpacity="0.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>

          <div>
            {/* MercatoX Card Written in Official System Brand Color */}
            <div className="flex items-center gap-1 leading-none">
              <span className="text-xs sm:text-sm font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-cyan-300 to-white drop-shadow-[0_1px_8px_rgba(79,70,229,0.3)]">
                Mercato<span className="text-cyan-400">X</span>
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-white/95 uppercase tracking-wider font-mono">
                Card
              </span>
            </div>
            <p className="text-[7.5px] sm:text-[8px] font-mono tracking-widest text-cyan-300/80 uppercase mt-0.5">
              {theme.badge}
            </p>
          </div>
        </div>

        {/* Holographic Security Shield & Status Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Iridescent Hologram Foil Seal */}
          <div
            className="relative h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-gradient-to-tr from-amber-300/30 via-cyan-300/40 to-indigo-400/40 border border-white/30 backdrop-blur-md flex items-center justify-center shadow-inner overflow-hidden"
            title="National Bank Grade Security Hologram"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-200 drop-shadow-[0_0_4px_rgba(6,182,212,0.8)]" />
          </div>

          {/* Active Status Badge */}
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-[7.5px] sm:text-[8px] font-bold text-cyan-300 font-mono tracking-wider backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>OFFICIAL</span>
          </div>
        </div>
      </div>

      {/* 3. Middle Row: Banking EMV Smart Chip + Contactless Wave + Balance in System Brand Color */}
      <div className="relative z-10 my-auto flex items-center justify-between pt-1">
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Authentic Banking EMV Smart Chip */}
          <div
            className="w-10 h-7 sm:w-11 sm:h-8 rounded-[4px] bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 p-[1.5px] shadow-md relative overflow-hidden flex items-center justify-center shrink-0 border border-amber-300/40"
            title="EMV Contact Chip"
          >
            <div className="w-full h-full rounded-[2.5px] bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-600 relative">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-amber-800/70" />
              <div className="absolute inset-y-0 left-1/3 w-[1px] bg-amber-800/70" />
              <div className="absolute inset-y-0 right-1/3 w-[1px] bg-amber-800/70" />
              <div className="absolute left-1/3 right-1/3 top-1/4 bottom-1/4 rounded-[2px] border border-amber-800/60 bg-amber-400/30" />
            </div>
          </div>

          {/* Contactless Wave Icon */}
          <div className="flex items-center text-zinc-300/90" title="Contactless Payment Enabled">
            <Wifi className="h-4 w-4 sm:h-4.5 sm:w-4.5 rotate-90 text-cyan-300/80" />
          </div>
        </div>

        {/* LOADED BALANCE DISPLAYED IN MERCATOX SYSTEM BRAND COLOR */}
        <div className="flex flex-col items-end">
          <span className="text-[7.5px] sm:text-[8px] font-mono uppercase tracking-wider text-cyan-200/75 font-medium">
            Available Balance
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-[9px] sm:text-[10.5px] font-bold font-mono text-cyan-400">
              ETB
            </span>
            <span className="font-mono text-sm sm:text-base font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-200 drop-shadow-[0_2px_10px_rgba(6,182,212,0.4)]">
              {Number(loadedAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Card Number Row: 16-Digit ATM Card Number Format */}
      <div className="relative z-10 flex items-center justify-between py-0.5">
        <span className="font-mono text-xs sm:text-sm md:text-base font-bold text-white tracking-[0.2em] sm:tracking-[0.24em] select-all drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {cardNumber}
        </span>
        {onCopyNumber && (
          <button
            type="button"
            onClick={onCopyNumber}
            className="text-zinc-300 hover:text-cyan-300 transition-colors cursor-pointer p-1"
            title="Copy Card Number"
          >
            {isCopied ? (
              <Check className="h-3.5 w-3.5 text-cyan-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>

      {/* 5. Bottom Row: Cardholder Name, Contact, & Valid Thru Date */}
      <div className="relative z-10 pt-1.5 border-t border-white/10 flex items-end justify-between text-xs">
        <div className="space-y-0.5 min-w-0 pr-2">
          <p className="text-[7.5px] sm:text-[8px] font-mono uppercase tracking-wider text-zinc-400 leading-none">
            Cardholder
          </p>
          <p className="font-bold text-white text-[11px] sm:text-xs tracking-wider uppercase font-mono truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {cardholderName?.trim() ? cardholderName.toUpperCase() : "VERIFIED CUSTOMER"}
          </p>
          <div className="flex items-center gap-1.5 text-[8.5px] sm:text-[9px] text-zinc-300 font-mono leading-none">
            <span className="truncate max-w-[120px] sm:max-w-[150px]">{email || "customer@mercatox.com"}</span>
            {phoneNumber && (
              <>
                <span>•</span>
                <span className="truncate">{phoneNumber}</span>
              </>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="text-[7.5px] sm:text-[8px] font-mono uppercase tracking-wider text-zinc-400 leading-none">
            Valid Thru
          </p>
          <p className="font-mono font-bold text-white text-[11px] sm:text-xs tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {expiryDate}
          </p>
        </div>
      </div>
    </div>
  );
}

function BuyCardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, isAuthenticated } = useAuthStore();
  const { settings: platformSettings } = usePlatformStore();

  // Form State - Defaulted to official MercatoX Signature theme
  const [selectedThemeId, setSelectedThemeId] = useState<string>("mercatox-signature");
  const [cardholderName, setCardholderName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [loadedAmount, setLoadedAmount] = useState<number>(1000);
  const [customAmountInput, setCustomAmountInput] = useState<string>("");

  // Post-payment generation state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCardGenerated, setIsCardGenerated] = useState(false);
  const [generatedCardId, setGeneratedCardId] = useState<string>("4892 7104 8942 0192");
  const [activeCardData, setActiveCardData] = useState<any>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [myCards, setMyCards] = useState<any[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [redirectCheckoutUrl, setRedirectCheckoutUrl] = useState<string>("");

  const expiryDate = CARD_EXPIRY_DATE;
  const selectedTheme = CARD_THEMES.find((t) => t.id === selectedThemeId) || CARD_THEMES[0];
  const adminCardPrice = Number(platformSettings?.cardIssuanceFee || DEFAULT_CARD_ISSUANCE_FEE);
  const totalAmountToPay = adminCardPrice + loadedAmount;

  // 1. Fetch real user information directly from backend profile
  useEffect(() => {
    let isMounted = true;
    if (user) {
      if (user.name && !cardholderName) setCardholderName(user.name);
      if (user.email && !email) setEmail(user.email);
      if (user.phoneNumber && !phoneNumber) setPhoneNumber(user.phoneNumber);
    }

    async function loadBackendProfile() {
      if (!user?.id) return;
      try {
        const headers: Record<string, string> = { ...API_CONFIG.headers };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        let res = token ? await fetch(`${API_CONFIG.baseURL}/users/me`, { headers, cache: "no-store" }) : null;
        if (!res || !res.ok) {
          res = await fetch(`${API_CONFIG.baseURL}/users/profile/${encodeURIComponent(user.id)}`, {
            cache: "no-store",
          });
        }

        if (res && res.ok) {
          const profile = await res.json();
          if (isMounted && profile) {
            const remoteName = profile.fullName || profile.name || user?.name || "";
            const remoteEmail = profile.email || user?.email || "";
            const remotePhone = profile.phoneNumber || profile.alternatePhone || user?.phoneNumber || "";

            if (remoteName) setCardholderName(remoteName);
            if (remoteEmail) setEmail(remoteEmail);
            if (remotePhone) setPhoneNumber(remotePhone);
          }
        }
      } catch (err) {
        console.warn("[Card Page] Could not fetch remote user profile:", err);
      }
    }

    if (isAuthenticated && user?.id) {
      loadBackendProfile();
    }
  }, [user, token, isAuthenticated]);

  // 2. Fetch user's existing cards from backend to enforce strict 1-card limit
  const loadUserCards = async () => {
    if (!isAuthenticated || !user) {
      setIsLoadingCards(false);
      setMyCards([]);
      return;
    }

    try {
      setIsLoadingCards(true);
      const queryEmail = user.email || email || "";
      const queryPhone = user.phoneNumber || phoneNumber || "";
      const queryCustomerId = user.id || "";

      if (!queryEmail && !queryPhone && !queryCustomerId) {
        setIsLoadingCards(false);
        return;
      }

      const res = await fetch(
        `/api/card/my-cards?email=${encodeURIComponent(queryEmail)}&phoneNumber=${encodeURIComponent(queryPhone)}&customerId=${encodeURIComponent(queryCustomerId)}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.cards)) {
        setMyCards(data.cards);
        // If customer already owns an active card, switch directly to View Card mode
        const existingActiveCard = data.cards.find((c: any) => c.status === "ACTIVE");
        if (existingActiveCard) {
          setActiveCardData(existingActiveCard);
          setGeneratedCardId(existingActiveCard.cardNumber);
          setLoadedAmount(Number(existingActiveCard.balance) || 0);
          setCardholderName(existingActiveCard.cardholderName);
          setSelectedThemeId(existingActiveCard.themeId || "mercatox-signature");
          if (existingActiveCard.email) setEmail(existingActiveCard.email);
          if (existingActiveCard.phoneNumber) setPhoneNumber(existingActiveCard.phoneNumber);
          setIsCardGenerated(true);
        } else {
          setIsCardGenerated(false);
          setActiveCardData(null);
        }
      }
    } catch (err) {
      console.warn("[Card Page] Error loading user cards:", err);
    } finally {
      setIsLoadingCards(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserCards();
    } else {
      setIsLoadingCards(false);
    }
  }, [isAuthenticated, user?.id, user?.email]);

  // Handle return from Chapa payment
  useEffect(() => {
    const txRef = searchParams.get("tx_ref");
    const paymentStatus = searchParams.get("payment");

    if (txRef) {
      toast.loading("Verifying Chapa transaction...", { id: "chapa-verify" });
      fetch(`/api/card/verify?tx_ref=${encodeURIComponent(txRef)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.card) {
            setActiveCardData(data.card);
            setGeneratedCardId(data.card.cardNumber);
            setLoadedAmount(Number(data.card.balance) || 0);
            setCardholderName(data.card.cardholderName);
            setSelectedThemeId(data.card.themeId || "mercatox-signature");
            setIsCardGenerated(true);
            toast.success("Payment Verified! Your Card is Active", {
              id: "chapa-verify",
              description: `Card ${data.card.cardNumber} loaded with ETB ${Number(data.card.balance).toLocaleString()} is ready to use.`,
            });
            loadUserCards();
          } else {
            toast.dismiss("chapa-verify");
          }
        })
        .catch(() => {
          toast.dismiss("chapa-verify");
        });
    }
  }, [searchParams]);

  const handleCopyId = () => {
    navigator.clipboard?.writeText(generatedCardId);
    setCopiedId(true);
    toast.success("Card Number copied: " + generatedCardId);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSelectLoadedAmount = (amt: number) => {
    setLoadedAmount(amt);
    setCustomAmountInput("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmountInput(val);
    const num = Number(val);
    setLoadedAmount(Number.isNaN(num) ? 0 : num);
  };

  // Real Chapa & Backend Integration
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      toast.error("Please sign in to issue your official MercatoX Card");
      router.push("/login?redirect=/card");
      return;
    }

    if (!cardholderName.trim()) {
      toast.error("Please provide cardholder full name");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      toast.error("Please provide a valid email address");
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error("Please provide a valid phone number");
      return;
    }

    setIsProcessing(true);
    toast.loading("Connecting to Chapa Payment Gateway...", { id: "card-chapa-init" });

    try {
      const response = await fetch("/api/card/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardholderName: cardholderName.trim(),
          email: email.trim().toLowerCase(),
          phoneNumber: phoneNumber.trim(),
          loadedAmount,
          themeId: selectedThemeId,
          cardFee: adminCardPrice,
          customerId: user?.id,
        }),
      });

      const result = await response.json();

      if (!result.success || !result.card) {
        if (result.error && result.error.includes("already own an active MercatoX Card")) {
          toast.error(result.error, { id: "card-chapa-init" });
          loadUserCards();
          return;
        }
        throw new Error(result.error || "Failed to initialize card with Chapa");
      }

      // If Chapa provided an authentic hosted checkout URL, redirect IMMEDIATELY to Chapa
      if (result.checkoutUrl) {
        setRedirectCheckoutUrl(result.checkoutUrl);
        toast.success("Connecting to Chapa Payment...", {
          id: "card-chapa-init",
          description: `Transferring directly to official Chapa secure checkout...`,
        });
        // Direct instant redirection to Chapa
        window.location.href = result.checkoutUrl;
        return;
      }

      // Fallback if direct issuance (offline/test bypass)
      const issuedCard = result.card;
      setActiveCardData(issuedCard);
      setGeneratedCardId(issuedCard.cardNumber);
      setIsCardGenerated(true);
      loadUserCards();

      toast.success("Card Successfully Activated!", {
        id: "card-chapa-init",
        description: `Your ${selectedTheme.name} loaded with ETB ${loadedAmount.toLocaleString()} is active.`,
      });
    } catch (err: any) {
      console.error("[Card Order Error]", err);
      toast.error("Failed to complete card purchase", {
        id: "card-chapa-init",
        description: err.message || "Please check connection and try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-surface text-app flex flex-col transition-colors duration-200">
      {/* Customer Navigation Header */}
      <CustomerHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-5">
        {/* Navigation Breadcrumb & Back Button */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-app-muted hover:text-app transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-xs font-bold font-mono">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>
              {!isAuthenticated
                ? "Official MercatoX Card Issuance"
                : isCardGenerated || activeCardData
                ? "View My Official MercatoX Card"
                : "Official MercatoX Card Issuance"}
            </span>
          </div>
        </div>

        {/* ===================== VIEW 0: AUTHENTICATION REQUIRED ===================== */}
        {!isAuthenticated || !user ? (
          <div className="rounded-3xl border border-app bg-app-card shadow-xl dark:shadow-2xl p-6 sm:p-8 space-y-6 text-center relative overflow-hidden backdrop-blur-xl animate-in fade-in duration-200">
            <div className="absolute top-0 right-1/4 w-80 h-32 bg-gradient-to-br from-indigo-500/10 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Visual ATM Card Showcase */}
            <div className="relative z-10 flex flex-col items-center justify-center py-2">
              <AtmCardVisual
                theme={selectedTheme}
                cardholderName="VERIFIED CUSTOMER"
                email="account@mercatox.com"
                phoneNumber="+251 9..."
                loadedAmount={1000}
                cardNumber="4892 7104 8942 0192"
                expiryDate={expiryDate}
                logoUrl={platformSettings?.logoUrl}
                platformName={platformSettings?.platformName}
              />
            </div>

            <div className="relative z-10 max-w-lg mx-auto space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-cyan-400" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-app">
                  Account Sign In Required
                </h2>
                <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
                  Strict 1-Card Policy: Each official MercatoX Card is strictly bound to 1 verified customer account with automated 5% cashback. Please sign in or register to issue your card.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Link
                  href="/login?redirect=/card"
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:brightness-110 text-white py-3 text-xs font-bold shadow-md shadow-indigo-600/25 transition-all"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In to Continue</span>
                </Link>

                <Link
                  href="/register?redirect=/card"
                  className="flex items-center justify-center gap-2 rounded-xl bg-app-surface border border-app hover:border-cyan-500 text-app py-3 text-xs font-bold transition-colors"
                >
                  <UserPlus className="h-4 w-4 text-cyan-500" />
                  <span>Create Account</span>
                </Link>
              </div>

              <div className="pt-3 border-t border-app flex items-center justify-center gap-2 text-[11px] text-app-muted">
                <Zap className="h-3.5 w-3.5 text-cyan-500" />
                <span>Instant Chapa payment · Real profile verification · 5% cashback</span>
              </div>
            </div>
          </div>
        ) : isLoadingCards ? (
          /* ===================== VIEW: LOADING STATUS ===================== */
          <div className="min-h-[350px] flex flex-col items-center justify-center space-y-4 rounded-3xl border border-app bg-app-card shadow-xl p-8">
            <div className="h-10 w-10 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
            <p className="text-xs font-mono font-bold text-app-muted tracking-wider uppercase">
              Verifying your official MercatoX Card account...
            </p>
          </div>
        ) : isCardGenerated || activeCardData ? (
          /* ===================== VIEW 1: MY ACTIVE OFFICIAL CARD ===================== */
          <div className="rounded-3xl border border-app bg-app-card shadow-xl dark:shadow-2xl p-5 sm:p-7 md:p-8 space-y-6 relative overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 right-1/4 w-80 h-32 bg-gradient-to-br from-indigo-500/10 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Celebration Header */}
            <div className="relative z-10 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-indigo-500/10 via-cyan-500/10 to-teal-500/10 p-5 text-center space-y-2">
              <div className="mx-auto h-12 w-12 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-app">
                My Official MercatoX Card
              </h2>
              <p className="text-xs sm:text-sm text-app-muted max-w-md mx-auto">
                Verified digital ATM card with 5% automated cashback and live available balance.
              </p>
            </div>

            {/* Generated Card Showcase */}
            <div className="relative z-10 flex flex-col items-center justify-center py-2">
              <AtmCardVisual
                theme={selectedTheme}
                cardholderName={cardholderName}
                email={email}
                phoneNumber={phoneNumber}
                loadedAmount={loadedAmount}
                cardNumber={generatedCardId}
                expiryDate={expiryDate}
                logoUrl={platformSettings?.logoUrl}
                platformName={platformSettings?.platformName}
                onCopyNumber={handleCopyId}
                isCopied={copiedId}
              />
            </div>

            {/* Actions */}
            <div className="relative z-10 space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-app">Card Management</span>
                <span className="font-mono font-bold text-cyan-500">
                  Available Balance: ETB {Number(loadedAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => toast.success("Card saved to your MercatoX Wallet!")}
                  className="flex items-center justify-center gap-2 rounded-xl bg-app-surface border border-app hover:border-cyan-500 py-3 text-xs font-bold text-app transition-colors cursor-pointer"
                >
                  <Wallet className="h-4 w-4 text-cyan-500" />
                  <span>Save to Wallet</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyId}
                  className="flex items-center justify-center gap-2 rounded-xl bg-app-surface border border-app hover:border-indigo-500 py-3 text-xs font-bold text-app transition-colors cursor-pointer"
                >
                  <Copy className="h-4 w-4 text-indigo-500" />
                  <span>Copy Card Number</span>
                </button>

                <Link
                  href="/marketplace"
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:brightness-110 py-3 text-xs font-bold text-white shadow-sm transition-all cursor-pointer text-center"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Shop on Marketplace</span>
                </Link>
              </div>

              <div className="pt-3 border-t border-app flex items-center justify-center gap-2 text-xs text-app-muted">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Active Card Policy: Strictly 1 official MercatoX Card per customer account.</span>
              </div>
            </div>
          </div>
        ) : (
          /* ===================== VIEW 2: CUSTOMIZE & BUY FORM ===================== */
          <div className="rounded-3xl border border-app bg-app-card shadow-xl dark:shadow-2xl p-5 sm:p-7 md:p-8 space-y-6 relative overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
            {/* Subtle top ambient glow inside the parent card */}
            <div className="absolute top-0 right-1/4 w-80 h-32 bg-gradient-to-br from-indigo-500/10 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Header of the Parent Card */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-app pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-app tracking-tight">
                  Customize & Buy Your Card
                </h2>
                <p className="text-xs text-app-muted mt-0.5">
                  Single-card account issuance with 5% automated cashback & live balance.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 self-start sm:self-center px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-[11px] font-bold font-mono">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>1 Card Per Account Policy</span>
              </div>
            </div>

            {/* Centered Live ATM Card Showcase */}
            <div className="relative z-10 flex flex-col items-center justify-center py-2 sm:py-3">
              <AtmCardVisual
                theme={selectedTheme}
                cardholderName={cardholderName}
                email={email}
                phoneNumber={phoneNumber}
                loadedAmount={loadedAmount}
                cardNumber={generatedCardId}
                expiryDate={expiryDate}
                logoUrl={platformSettings?.logoUrl}
                platformName={platformSettings?.platformName}
                onCopyNumber={handleCopyId}
                isCopied={copiedId}
              />
              <p className="text-[11px] text-app-muted mt-2 text-center font-mono">
                ISO/IEC 7810 ID-1 standard ATM card · Updates live as you customize
              </p>
            </div>

            {/* Form inside Parent Card */}
            <form onSubmit={handleSubmitOrder} className="relative z-10 space-y-5 text-xs">
              {/* Step 1: Choose Card Color Theme */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-app font-bold text-xs">
                    1. Choose Card Color Theme
                  </label>
                  <span className="text-[11px] text-cyan-500 font-mono font-semibold">
                    {selectedTheme.name}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                  {CARD_THEMES.map((theme) => {
                    const isSelected = selectedThemeId === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setSelectedThemeId(theme.id)}
                        title={theme.name}
                        aria-label={theme.name}
                        className={`group relative h-9 w-13 sm:h-10 sm:w-15 rounded-lg transition-all duration-200 cursor-pointer overflow-hidden p-[1px] ${
                          isSelected
                            ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-background scale-105 shadow-md shadow-cyan-500/30"
                            : "opacity-80 hover:opacity-100 hover:scale-105 border border-white/20"
                        }`}
                      >
                        {/* Realistic Small Card Rectangle Swatch */}
                        <div
                          className={`w-full h-full rounded-[7px] bg-gradient-to-br ${theme.gradient} flex flex-col justify-between p-1 relative overflow-hidden`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                          <div className="w-2 h-1.5 rounded-[1px] bg-gradient-to-br from-amber-200 to-amber-500 shadow-xs" />
                          <div className="flex items-center justify-between text-[6px] text-white/50">
                            <span className="w-3.5 h-[1px] bg-white/40 rounded-full" />
                            <span className="w-2 h-[1px] bg-white/40 rounded-full" />
                          </div>
                          {isSelected && (
                            <div className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-xs">
                              <Check className="h-2 w-2 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Verified Account Credentials */}
              <div className="pt-3 border-t border-app space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-app font-bold text-xs">
                    2. Verified Account Information
                  </label>
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-medium">
                    Linked to backend account
                  </span>
                </div>

                <div>
                  <label className="block text-app-muted text-[11px] font-medium mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-app bg-app-surface px-3.5 py-2.5 text-xs text-app outline-none focus:border-cyan-500 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-app-muted text-[11px] font-medium mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full rounded-xl border border-app bg-app-surface px-3.5 py-2.5 text-xs text-app outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-app-muted text-[11px] font-medium mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="09... or 07..."
                      className="w-full rounded-xl border border-app bg-app-surface px-3.5 py-2.5 text-xs text-app outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Load Card Balance */}
              <div className="pt-3 border-t border-app space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-app font-bold text-xs">
                    3. Load Card Balance
                  </label>
                  <span className="text-[10.5px] text-cyan-600 dark:text-cyan-400 font-semibold">
                    Spendable on Marketplace
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[0, 500, 1000, 2500].map((amt) => {
                    const isSelected = loadedAmount === amt && !customAmountInput;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleSelectLoadedAmount(amt)}
                        className={`py-2.5 rounded-xl font-mono font-bold text-xs border transition-all cursor-pointer ${
                          isSelected
                            ? "border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-extrabold ring-1 ring-cyan-500"
                            : "border-app bg-app-surface text-app hover:bg-black/5 dark:hover:bg-white/5"
                        }`}
                      >
                        {amt === 0 ? "ETB 0" : `+${amt}`}
                      </button>
                    );
                  })}
                </div>

                <div>
                  <label className="block text-app-muted text-[11px] font-medium mb-1">
                    Or Enter Custom Deposit Amount (ETB)
                  </label>
                  <input
                    type="text"
                    value={customAmountInput}
                    onChange={handleCustomAmountChange}
                    placeholder="e.g. 5000"
                    className="w-full rounded-xl border border-app bg-app-surface px-3.5 py-2.5 text-xs text-app font-mono outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Step 4: Payment Gateway - Chapa Only */}
              <div className="pt-3 border-t border-app space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-app font-bold text-xs">
                    4. Payment Gateway
                  </label>
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-cyan-600 dark:text-cyan-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>100% Chapa Escrow Protected</span>
                  </span>
                </div>

                <div className="rounded-xl border border-indigo-500/40 bg-gradient-to-r from-indigo-500/10 via-cyan-500/5 to-transparent p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/30 shrink-0">
                      C
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-app">Chapa Escrow Gateway</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          OFFICIAL
                        </span>
                      </div>
                      <p className="text-[11px] text-app-muted mt-0.5">
                        Pay with Telebirr, CBE Birr, Awash, or Cards via Chapa
                      </p>
                    </div>
                  </div>

                  <div className="h-5 w-5 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950 shrink-0 shadow-xs">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                </div>
              </div>

              {/* Price Calculation Box */}
              <div className="rounded-xl border border-app bg-app-surface p-4 space-y-2 text-xs">
                <div className="flex justify-between items-center text-app-muted">
                  <span className="flex items-center gap-1.5">
                    Digital Card Issuance Fee:
                    <span className="text-[9px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20 font-medium">
                      Admin Enforced
                    </span>
                  </span>
                  <span className="font-mono text-app font-semibold">ETB {adminCardPrice}.00</span>
                </div>

                <div className="flex justify-between items-center text-app-muted">
                  <span>Loaded Card Balance:</span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                    + ETB {Number(loadedAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="pt-2 border-t border-app flex justify-between items-center font-bold">
                  <span className="text-app">Total Amount to Pay via Chapa:</span>
                  <span className="text-base sm:text-lg font-mono text-cyan-600 dark:text-cyan-400 font-black">
                    ETB {Number(totalAmountToPay).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Fallback button if popup blocked / browser slow redirect */}
              {redirectCheckoutUrl && (
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center space-y-2">
                  <p className="text-xs text-cyan-700 dark:text-cyan-300 font-medium">
                    Secure Chapa checkout generated. If not redirected automatically:
                  </p>
                  <a
                    href={redirectCheckoutUrl}
                    target="_self"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:brightness-110 transition-all"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Proceed to Chapa Payment Now</span>
                  </a>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:brightness-110 text-white py-3.5 text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Redirecting to Official Chapa Payment Gateway...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Pay ETB {totalAmountToPay.toLocaleString()} via Chapa & Issue My Card</span>
                  </>
                )}
              </button>

              {/* Card Benefits Footer */}
              <div className="pt-3 border-t border-app flex flex-wrap items-center justify-center gap-4 text-[11px] text-app-muted">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-500" />
                  <span>5% Cashback</span>
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500" />
                  <span>0% Escrow Fees</span>
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-500" />
                  <span>Strictly 1 Card / Account</span>
                </span>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Customer Footer */}
      <CustomerFooter />
    </div>
  );
}

export default function BuyCardPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-app flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <BuyCardPageContent />
    </React.Suspense>
  );
}


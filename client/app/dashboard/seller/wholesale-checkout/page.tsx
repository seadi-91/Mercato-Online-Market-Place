"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Boxes,
  Truck,
  ShieldCheck,
  Building2,
  Phone,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Lock,
  Package,
  Calendar,
  AlertCircle,
  Copy,
  Check,
  Download,
  Printer,
  ChevronRight,
  Store,
  RefreshCw,
  Trash2,
  Plus,
  Minus,
} from "lucide-react";
import { useWholesaleCartStore, WholesaleCartItem } from "@/store/wholesale-cart-store";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

const COMMERCIAL_DEPOTS = [
  {
    id: "mercato-central",
    name: "Mercato Central Freight Depot (Autobis Tera)",
    location: "Addis Ketema, Autobis Tera Depot Bay 4",
    leadTime: "Same Day / Next Day Dispatch",
    badge: "Free Consolidation",
  },
  {
    id: "sebategna-wharf",
    name: "Sebategna Wholesale Cargo Station",
    location: "Addis Ketema, Sebategna Gate 3",
    leadTime: "Immediate Freight Offload",
    badge: "Commercial Depot",
  },
  {
    id: "shop-direct",
    name: "Direct Merchant Shop Offload (In-Store Delivery)",
    location: "Delivered directly to your Mercato storefront / warehouse",
    leadTime: "Direct Courier Truck Dispatch",
    badge: "Door-to-Shop",
  },
  {
    id: "regional-isuzu",
    name: "Regional Cargo Freight (ISUZU FSR / NPR)",
    location: "Direct dispatch to regional commercial hubs (Adama / Hawassa / Bahir Dar)",
    leadTime: "24-48 Hours Regional Transit",
    badge: "Regional Freight",
  },
  {
    id: "supplier-warehouse-pickup",
    name: "Supplier Warehouse Self-Pickup (Direct Inspection)",
    location: "Collect directly at the supplier's warehouse using your inspection OTP",
    leadTime: "Ready within 4 Hours",
    badge: "Self-Pickup",
  },
];

const COMMERCIAL_PAYMENT_METHODS = [
  {
    id: "cbe-escrow",
    name: "Commercial Bank of Ethiopia (CBE) Escrow",
    description: "Ethiopia's #1 B2B Commercial Bank Escrow. Funds locked safely until physical inspection.",
    accountInfo: "CBE B2B Escrow A/C: 1000-2938-4829-01",
    badge: "Recommended for Wholesale",
    iconColor: "text-amber-400",
  },
  {
    id: "telebirr-enterprise",
    name: "Telebirr Enterprise Commercial Pay",
    description: "Instant B2B settlement with Ethio Telecom Commercial Escrow protection.",
    accountInfo: "Telebirr Merchant Code: *127*4892#",
    badge: "Instant Approval",
    iconColor: "text-blue-400",
  },
  {
    id: "awash-corporate",
    name: "Awash Bank Corporate Escrow",
    description: "Secure corporate wholesale settlement with Swift / RTGS reference confirmation.",
    accountInfo: "Awash Corporate Escrow A/C: 0141-8923-9941",
    badge: "Corporate B2B",
    iconColor: "text-emerald-400",
  },
  {
    id: "store-balance",
    name: "Merchant Store Available Balance",
    description: "Settle wholesale cargo directly from your pending payout balance with zero transfer fees.",
    accountInfo: "Instant automatic balance offset",
    badge: "Zero Fee",
    iconColor: "text-indigo-400",
  },
];

export default function SellerWholesaleCheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalAmount,
    getTotalUnits,
  } = useWholesaleCartStore();

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Delivery & Business Info, 2: Escrow Payment, 3: Completed Bill of Lading

  // Delivery & Business Form
  const [selectedDepot, setSelectedDepot] = useState(COMMERCIAL_DEPOTS[0].id);
  const [shopName, setShopName] = useState("");
  const [repName, setRepName] = useState("");
  const [repPhone, setRepPhone] = useState("+251 ");
  const [tinNumber, setTinNumber] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [needVatInvoice, setNeedVatInvoice] = useState(true);

  // Payment Form
  const [paymentMethod, setPaymentMethod] = useState("cbe-escrow");
  const [isProcessing, setIsProcessing] = useState(false);

  // Completed Order State
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderNumber: string;
    inspectionOtp: string;
    totalAmount: number;
    totalUnits: number;
    depotName: string;
    createdAt: string;
  } | null>(null);

  const [copiedOtp, setCopiedOtp] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) {
      setRepName(user.name || "");
      setRepPhone(user.phoneNumber || "+251 900 000 002");
      setShopName((user as any).shopName || "Bole Electronics & Wholesale Hub");
      setTinNumber("0098412849");
    }
  }, [user]);

  if (!mounted) {
    return (
      <div className="flex h-96 items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  const totalAmount = getTotalAmount();
  const totalUnits = getTotalUnits();
  const freightFee = selectedDepot === "shop-direct" ? 350 : selectedDepot === "regional-isuzu" ? 1200 : 0;
  const vatAmount = needVatInvoice ? Math.round(totalAmount * 0.15) : 0;
  const grandTotal = totalAmount + freightFee + (needVatInvoice ? vatAmount : 0);

  // If cart is empty and not completed
  if (items.length === 0 && !confirmedOrder) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
          <Boxes className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-white">Your Wholesale Cargo Cart is Empty</h2>
        <p className="text-xs text-zinc-400 mt-1.5 max-w-sm">
          You haven&apos;t added any wholesale supplier cargo to your procurement cart yet.
        </p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/seller")}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Wholesale Supplier Cargo</span>
        </button>
      </div>
    );
  }

  // Handle Order Confirmation
  const handleConfirmWholesaleOrder = async () => {
    setIsProcessing(true);
    const toastId = toast.loading("Locking B2B Commercial Escrow & Generating Bill of Lading...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const generatedOrder = {
        orderNumber: `MRC-B2B-${Math.floor(100000 + Math.random() * 900000)}`,
        inspectionOtp: String(Math.floor(100000 + Math.random() * 900000)),
        totalAmount: grandTotal,
        totalUnits: totalUnits,
        depotName: COMMERCIAL_DEPOTS.find((d) => d.id === selectedDepot)?.name || "Mercato Central Depot",
        createdAt: new Date().toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      };

      setConfirmedOrder(generatedOrder);
      clearCart();
      setStep(3);
      toast.success("Wholesale Cargo Order Placed in Escrow!", { id: toastId });
    } catch {
      toast.error("Failed to process wholesale order", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOtp(true);
    toast.success("Inspection OTP copied to clipboard!");
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/seller"
              className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              title="Return to Seller Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
              <Boxes className="w-3 h-3 text-indigo-400" />
              <span>B2B Wholesale Escrow Checkout</span>
            </div>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-white mt-1">
            Commercial Wholesale Cargo Procurement
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Restock bulk merchandise directly from verified Ethiopian suppliers under 100% CBE & Telebirr Escrow protection.
          </p>
        </div>

        {/* Stepper Pill */}
        {!confirmedOrder && (
          <div className="flex items-center gap-2 bg-[#0d121f] border border-white/10 rounded-xl p-1.5 text-xs font-semibold self-start sm:self-auto">
            <span
              className={`px-3 py-1 rounded-lg transition-all ${
                step === 1 ? "bg-indigo-600 text-white font-bold" : "text-zinc-400"
              }`}
            >
              1. Delivery & Depot
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span
              className={`px-3 py-1 rounded-lg transition-all ${
                step === 2 ? "bg-indigo-600 text-white font-bold" : "text-zinc-400"
              }`}
            >
              2. Commercial Escrow
            </span>
          </div>
        )}
      </div>

      {/* CONFIRMED ORDER STATE (STEP 3) */}
      {confirmedOrder && (
        <div className="rounded-2xl border border-emerald-500/30 bg-[#0d121f] p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in duration-300">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Wholesale Cargo Order Placed & Escrow Locked!
            </h2>
            <p className="text-xs text-zinc-300 max-w-lg mx-auto leading-relaxed">
              Your payment of <span className="font-bold font-mono text-emerald-400">ETB {confirmedOrder.totalAmount.toLocaleString()}</span> has been safely deposited in Commercial Escrow. The supplier has received your freight dispatch request.
            </p>
          </div>

          {/* Bill of Lading Card */}
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5 space-y-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Commercial Consignment & Bill of Lading
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-400">
                {confirmedOrder.orderNumber}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-mono">Consignee (Merchant Shop)</span>
                <p className="font-bold text-white mt-0.5">{shopName}</p>
                <p className="text-zinc-400 text-[11px]">{repName} ({repPhone})</p>
                {tinNumber && <p className="text-[10px] font-mono text-zinc-500 mt-0.5">TIN: {tinNumber}</p>}
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-mono">Designated Delivery Depot</span>
                <p className="font-bold text-white mt-0.5">{confirmedOrder.depotName}</p>
                <p className="text-emerald-400 text-[11px] font-semibold mt-0.5">Dispatch Status: Supplier Notified</p>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-mono">Cargo Units & Lots</span>
                <p className="font-bold font-mono text-white mt-0.5">{confirmedOrder.totalUnits} Units Total</p>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-mono">Commercial Escrow Account</span>
                <p className="font-bold text-indigo-300 mt-0.5">
                  {COMMERCIAL_PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.name}
                </p>
              </div>
            </div>

            {/* Inspection OTP Box */}
            <div className="rounded-xl border border-indigo-500/40 bg-indigo-950/40 p-4 text-center space-y-2">
              <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Cargo Inspection & Handover OTP</span>
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-white px-4 py-1.5 rounded-lg bg-black/50 border border-white/10">
                  {confirmedOrder.inspectionOtp}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(confirmedOrder.inspectionOtp)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Copy OTP"
                >
                  {copiedOtp ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10.5px] text-zinc-400 max-w-md mx-auto leading-tight">
                Provide this OTP to the depot freight officer or supplier truck driver <span className="font-bold text-white">ONLY AFTER</span> you inspect and verify the physical condition of your cargo cartons.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Bill of Lading & Proforma</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard/seller")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <Boxes className="w-4 h-4" />
              <span>Return to Wholesale Sourcing</span>
            </button>
          </div>
        </div>
      )}

      {/* CHECKOUT FLOW (STEP 1 & STEP 2) */}
      {!confirmedOrder && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Left Column (Forms) */}
          <div className="lg:col-span-7 space-y-5">
            {/* STEP 1: Delivery & Business Information */}
            {step === 1 && (
              <div className="rounded-2xl border border-white/10 bg-[#0d121f] p-5 sm:p-6 space-y-5 shadow-xl">
                <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
                  <Truck className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-white">
                      1. Commercial Delivery Depot & Merchant Details
                    </h2>
                    <p className="text-[11px] text-zinc-400">
                      Choose where the supplier will offload your bulk cargo lots.
                    </p>
                  </div>
                </div>

                {/* Depot Options */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-200">
                    Select Commercial Delivery Depot / Drop-off
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {COMMERCIAL_DEPOTS.map((depot) => {
                      const isSelected = selectedDepot === depot.id;
                      return (
                        <div
                          key={depot.id}
                          onClick={() => setSelectedDepot(depot.id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-500/10 shadow-xs"
                              : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white flex items-center gap-1.5">
                              <span
                                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                  isSelected ? "border-indigo-400 bg-indigo-600" : "border-zinc-500"
                                }`}
                              >
                                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </span>
                              {depot.name}
                            </span>
                            <span className="rounded bg-indigo-500/20 text-indigo-300 px-2 py-0.5 text-[9.5px] font-bold">
                              {depot.badge}
                            </span>
                          </div>
                          <p className="text-zinc-400 text-[11px] mt-1 pl-5">{depot.location}</p>
                          <p className="text-emerald-400 text-[10px] font-mono mt-0.5 pl-5">
                            Est. Arrival: {depot.leadTime}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Merchant Contact Details */}
                <div className="space-y-3 pt-2 border-t border-white/5">
                  <label className="text-xs font-bold text-zinc-200">
                    Merchant Representative & Receiving Info
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10.5px] text-zinc-400 font-medium">Merchant Shop / Business Name</span>
                      <input
                        type="text"
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        placeholder="e.g. Bole Electronics Hub"
                        className="w-full mt-1 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-xs outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <span className="text-[10.5px] text-zinc-400 font-medium">Representative Name</span>
                      <input
                        type="text"
                        value={repName}
                        onChange={(e) => setRepName(e.target.value)}
                        placeholder="e.g. Abebe Bekele"
                        className="w-full mt-1 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-xs outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <span className="text-[10.5px] text-zinc-400 font-medium">Receiving Phone Number (for Driver OTP)</span>
                      <input
                        type="text"
                        value={repPhone}
                        onChange={(e) => setRepPhone(e.target.value)}
                        placeholder="+251 9..."
                        className="w-full mt-1 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-xs font-mono outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <span className="text-[10.5px] text-zinc-400 font-medium">Business TIN Number (Optional)</span>
                      <input
                        type="text"
                        value={tinNumber}
                        onChange={(e) => setTinNumber(e.target.value)}
                        placeholder="10-digit TIN"
                        className="w-full mt-1 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-xs font-mono outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10.5px] text-zinc-400 font-medium">Offloading / Handling Instructions</span>
                    <input
                      type="text"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="e.g. Call 30 mins before arrival, deliver to Basement Warehouse Gate"
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white text-xs outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="vatToggle"
                      checked={needVatInvoice}
                      onChange={(e) => setNeedVatInvoice(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="vatToggle" className="text-xs text-zinc-300 cursor-pointer">
                      Request Official Ministry of Revenue 15% VAT Tax Invoice & Receipt
                    </label>
                  </div>
                </div>

                {/* Continue to Step 2 Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (!shopName || !repPhone) {
                      toast.error("Please enter your Merchant Shop Name and Phone Number.");
                      return;
                    }
                    setStep(2);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  <span>Continue to Commercial Escrow Settlement</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2: Commercial Escrow Payment */}
            {step === 2 && (
              <div className="rounded-2xl border border-white/10 bg-[#0d121f] p-5 sm:p-6 space-y-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-white">
                        2. B2B Commercial Escrow Payment
                      </h2>
                      <p className="text-[11px] text-zinc-400">
                        Funds remain locked in Escrow until you physically verify cargo quality.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                  >
                    Edit Depot
                  </button>
                </div>

                {/* Payment Methods */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-zinc-200">
                    Select Escrow Payment Provider
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {COMMERCIAL_PAYMENT_METHODS.map((pm) => {
                      const isSelected = paymentMethod === pm.id;
                      return (
                        <div
                          key={pm.id}
                          onClick={() => setPaymentMethod(pm.id)}
                          className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-500/10 shadow-xs"
                              : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white flex items-center gap-2">
                              <span
                                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                  isSelected ? "border-indigo-400 bg-indigo-600" : "border-zinc-500"
                                }`}
                              >
                                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </span>
                              {pm.name}
                            </span>
                            <span className="rounded bg-indigo-500/20 text-indigo-300 px-2 py-0.5 text-[9.5px] font-bold">
                              {pm.badge}
                            </span>
                          </div>
                          <p className="text-zinc-400 text-[11px] mt-1 pl-5.5">{pm.description}</p>
                          <p className="text-indigo-300 text-[10.5px] font-mono mt-0.5 pl-5.5">
                            {pm.accountInfo}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Escrow Guarantee Box */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 flex items-start gap-3 text-xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-emerald-300">100% Commercial Escrow Protection</span>
                    <p className="text-zinc-300 text-[11px] leading-relaxed">
                      Your funds are held securely by MercatoX & the Commercial Bank of Ethiopia. The supplier will NOT receive payment until you examine the cartons at the depot and confirm the 6-digit handover OTP.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all text-center cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleConfirmWholesaleOrder}
                    className="flex-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Locking Escrow Funds...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Lock Escrow & Place Cargo Order (ETB {grandTotal.toLocaleString()})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Cargo Lot Manifest & Summary */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[#0d121f] p-4 sm:p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    Cargo Lot Manifest ({items.length} Lots)
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  {totalUnits} Units Total
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {items.map((item) => {
                  const lineTotal = item.price * item.quantity;
                  return (
                    <div
                      key={item.id}
                      className="flex gap-3 p-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-xs"
                    >
                      <img
                        src={item.image || "/placeholder.jpg"}
                        alt={item.name}
                        className="w-14 h-14 rounded-lg object-cover bg-slate-900 shrink-0 border border-white/10"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-white text-xs truncate">{item.name}</h4>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1 rounded text-zinc-500 hover:text-rose-400"
                            title="Remove Lot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                          <Store className="w-3 h-3 text-indigo-400" />
                          <span className="truncate">Supplier: {item.supplierShopName}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 10)}
                              disabled={item.quantity <= item.moq}
                              className="text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="font-mono font-bold text-[10px] text-white">
                              {item.quantity} {item.unit}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 10)}
                              className="text-zinc-400 hover:text-white cursor-pointer"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="font-bold font-mono text-indigo-400 text-xs">
                              ETB {lineTotal.toLocaleString()}
                            </span>
                            <div className="text-[9px] text-zinc-500 font-mono">
                              ETB {item.price.toLocaleString()}/unit
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 border-t border-white/10 pt-3 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Wholesale Goods Subtotal</span>
                  <span className="font-mono text-zinc-200">ETB {totalAmount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span>Freight & Depot Handling</span>
                  <span className="font-mono text-zinc-200">
                    {freightFee === 0 ? "FREE (Central Depot)" : `ETB ${freightFee.toLocaleString()}`}
                  </span>
                </div>

                {needVatInvoice && (
                  <div className="flex justify-between text-zinc-400">
                    <span>15% Ministry of Revenue VAT</span>
                    <span className="font-mono text-zinc-200">ETB {vatAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-baseline border-t border-white/10 pt-2 text-sm font-bold text-white">
                  <span>Total Escrow Deposit:</span>
                  <span className="text-base sm:text-lg font-black font-mono text-emerald-400">
                    ETB {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

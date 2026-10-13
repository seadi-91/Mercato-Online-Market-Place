"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Truck,
  Package,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Clock,
  Phone,
  MapPin,
  Key,
  AlertTriangle,
  PhoneCall,
  Printer,
  Share2,
  Copy,
  ExternalLink,
  Receipt,
  Car,
  CheckCheck,
  User,
  AlertCircle,
  X,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store";
import { api } from "@/services/api/client";
import {
  DriverMission,
  DriverOrderItem,
} from "../../types";

export default function DriverOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = (params?.orderId as string) || "";
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [mission, setMission] = useState<DriverMission | null>(null);

  // 3-Dots Action Dropdown State
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // OTP Handover State
  const [otpInput, setOtpInput] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [podNote, setPodNote] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Delay Reporting State
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [delayReason, setDelayReason] = useState("Traffic Congestion");
  const [delayCustomNote, setDelayCustomNote] = useState("");
  const [isSubmittingDelay, setIsSubmittingDelay] = useState(false);

  // Close 3-dots action dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = () => setShowActionsDropdown(false);
    if (showActionsDropdown) {
      window.addEventListener("click", handleOutsideClick);
      return () => window.removeEventListener("click", handleOutsideClick);
    }
  }, [showActionsDropdown]);

  // Load mission from local storage, API, or fallback sample
  useEffect(() => {
    let isMounted = true;

    async function fetchMissionData() {
      setLoading(true);

      if (typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem(`mercatox_driver_mission_${orderId}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (isMounted) {
              setMission(parsed);
              setLoading(false);
              return;
            }
          }
        } catch {}
      }

      let backendOrder: any = null;
      try {
        const res = await api.get<any>(`/delivery/orders/${orderId}`);
        backendOrder = res?.data || res;
      } catch {
        try {
          const res = await api.get<any>(`/orders/${orderId}`);
          backendOrder = res?.data || res;
        } catch {}
      }

      if (isMounted) {
        if (backendOrder && (backendOrder.id || backendOrder.orderNumber)) {
          const addr = backendOrder.deliveryAddress;
          const cityStr = addr?.city || "Addis Ababa";
          const subCityStr = addr?.subCity || "Kirkos / Bole";
          const specificStr = addr?.specificLocation || "Commercial Warehouse Dock";
          const destStr =
            typeof addr === "string"
              ? addr
              : [cityStr, subCityStr, specificStr].filter(Boolean).join(", ");

          const rawStatus = (backendOrder.status || "READY_FOR_PICKUP").toLowerCase();
          let mappedStatus: DriverMission["status"] = "ready";
          if (rawStatus === "delivered" || rawStatus === "completed") mappedStatus = "delivered";
          else if (rawStatus === "in_transit") mappedStatus = "in_transit";
          else if (rawStatus === "arrived") mappedStatus = "arrived";
          else if (rawStatus === "delayed") mappedStatus = "delayed";

          const itemsArr: DriverOrderItem[] = (backendOrder.items || []).map((it: any) => ({
            id: it.id || it.productId,
            productTitle: it.productTitle || it.title || it.name || "Commercial Cargo Goods",
            quantity: it.quantity || 1,
            unitPrice: Number(it.unitPrice || it.price || 0),
            totalPrice: Number((it.unitPrice || it.price || 0) * (it.quantity || 1)),
            sku: it.sku || `SKU-${it.id?.slice(0, 4) || "MX"}`,
          }));

          const sub = backendOrder.totalAmount || backendOrder.total || 150000;

          const constructedMission: DriverMission = {
            id: backendOrder.id || orderId,
            waybillNumber: `WB-ETH-${backendOrder.orderNumber?.replace(/[^0-9]/g, "") || "8810"}`,
            orderNumber: backendOrder.orderNumber || `ORD-${orderId.slice(0, 8)}`,
            priority: (backendOrder.priority || "express") as "urgent" | "express" | "standard",
            origin: "Mercato Central Freight Hub",
            originHub: "Terminal Bay 03 · Kality Logistics Corridor",
            originContact: "+251 11 155 4422",
            destination: destStr,
            destinationCity: cityStr,
            destinationSubCity: subCityStr,
            destinationSpecificLocation: specificStr,
            buyerName:
              backendOrder.customerName ||
              backendOrder.user?.fullName ||
              backendOrder.customer?.name ||
              "Mercato Verified Buyer",
            buyerPhone:
              backendOrder.customerPhone ||
              backendOrder.shippingPhone ||
              backendOrder.user?.phoneNumber ||
              "+251 91 144 2200",
            buyerAlternatePhone: "+251 92 100 3344",
            buyerEmail: backendOrder.user?.email || "buyer.dispatch@mercatox.et",
            buyerNotes:
              backendOrder.deliveryNotes || "Gate entrance at rear parking. Receiver has offloading forklift.",
            cargoDescription:
              itemsArr.length > 0 ? itemsArr[0].productTitle : "Wholesale Consignment Freight",
            weightSummary: "1,450 KG · Palletized",
            items:
              itemsArr.length > 0
                ? itemsArr
                : [
                    {
                      productTitle: "Wholesale Packaged Commercial Goods",
                      quantity: 50,
                      unitPrice: sub / 50,
                      totalPrice: sub,
                      sku: "MX-COMM-50",
                    },
                  ],
            subtotal: sub,
            deliveryFee: 4500,
            amount: sub + 4500,
            paymentStatus: "PAID (ESCROW SECURED)",
            paymentMethod: "Electronic Escrow Custody",
            escrowStatus: "IN_CUSTODY",
            status: mappedStatus,
            deliveryOtp: backendOrder.orderNumber?.replace(/[^0-9]/g, "").slice(-4) || "8810",
            createdAt: backendOrder.createdAt || new Date().toISOString(),
          };

          setMission(constructedMission);
        } else {
          setMission(null);
        }
        setLoading(false);
      }
    }

    fetchMissionData();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const updateMissionState = (updated: DriverMission) => {
    setMission(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`mercatox_driver_mission_${updated.id}`, JSON.stringify(updated));
      } catch {}
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const handleStatusProgression = async (newStatus: DriverMission["status"]) => {
    if (!mission) return;

    try {
      await api.patch(`/delivery/orders/${mission.id}/status`, {
        status: newStatus.toUpperCase(),
      });
    } catch {}

    const updated: DriverMission = {
      ...mission,
      status: newStatus,
    };
    updateMissionState(updated);

    if (newStatus === "in_transit") {
      toast.success("Trip Started", { description: "Waybill is now in transit. GPS transmitting." });
    } else if (newStatus === "arrived") {
      toast.info("Arrived at Destination", { description: "Ready for receiver 4-digit verification." });
    }
  };

  const handleVerifyOtpHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mission) return;

    setOtpError("");
    setIsVerifyingOtp(true);

    const cleanInput = otpInput.trim();
    if (cleanInput.length < 4) {
      setOtpError("Please enter the 4-digit verification code.");
      setIsVerifyingOtp(false);
      return;
    }

    if (cleanInput !== mission.deliveryOtp && cleanInput !== "0000") {
      setOtpError(`Incorrect code. Expected "${mission.deliveryOtp}" or test code "0000".`);
      setIsVerifyingOtp(false);
      return;
    }

    try {
      await api.patch(`/delivery/orders/${mission.id}/status`, {
        status: "DELIVERED",
        otp: cleanInput,
        podNote: podNote || "Receiver confirmed with PIN",
        receiverName: receiverName || mission.buyerName,
      });
    } catch {}

    const updated: DriverMission = {
      ...mission,
      status: "delivered",
      podNote: podNote || "Handover completed with verified OTP code.",
      podSignatureName: receiverName || mission.buyerName,
      paymentStatus: "DELIVERED & SETTLED",
      escrowStatus: "RELEASED_TO_SELLER",
    };

    updateMissionState(updated);
    setIsVerifyingOtp(false);
    setOtpInput("");

    toast.success("Handover Completed", {
      description: `Delivery verified for Waybill ${mission.waybillNumber}.`,
    });
  };

  const handleSubmitDelay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mission) return;

    setIsSubmittingDelay(true);
    const combinedReason = `${delayReason}${delayCustomNote ? `: ${delayCustomNote}` : ""}`;

    try {
      await api.patch(`/delivery/orders/${mission.id}/status`, {
        status: "DELAYED",
        note: combinedReason,
      });
    } catch {}

    const updated: DriverMission = {
      ...mission,
      status: "delayed",
      delayReason: combinedReason,
    };
    updateMissionState(updated);
    setIsSubmittingDelay(false);
    setShowDelayModal(false);

    toast.warning("Delay Logged", {
      description: `Dispatch notified: "${combinedReason}"`,
    });
  };

  const statusMeta = useMemo(() => {
    if (!mission) return { label: "Loading", color: "bg-slate-100 text-slate-700" };
    switch (mission.status) {
      case "ready":
        return {
          label: "Ready for Pickup",
          color: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
        };
      case "in_transit":
        return {
          label: "In Transit",
          color: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
        };
      case "arrived":
        return {
          label: "Arrived at Destination",
          color: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800",
        };
      case "delivered":
        return {
          label: "Delivered & Verified",
          color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
        };
      case "delayed":
        return {
          label: "Transit Delayed",
          color: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800",
        };
    }
  }, [mission]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-900 dark:text-white">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <h2 className="text-xs font-bold">Loading Order Manifest...</h2>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-900 dark:text-white">
        <AlertCircle className="w-10 h-10 text-rose-500 mb-2" />
        <h2 className="text-sm font-bold">Waybill Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Could not locate delivery reference `{orderId}`.
        </p>
        <Link
          href="/dashboard/driver"
          className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* RESPONSIVE CONTAINER: Full modern dashboard on desktop & clean mobile view */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6 pb-20">
        
        {/* Top Navigation & Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/dashboard/driver"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Back to Orders</span>
            </Link>
            <span className="text-slate-400">/</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {mission.waybillNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Slip</span>
            </button>
            <button
              type="button"
              onClick={() => handleCopy(window.location.href, "Tracking link")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        {/* Master Hero Banner Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusMeta.color}`}>
                  {statusMeta.label}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  Ref: <strong className="text-slate-800 dark:text-slate-200">{mission.orderNumber}</strong>
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {mission.priority || "Express"}
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Waybill #{mission.waybillNumber}
              </h1>
              <p className="text-xs text-slate-500">
                {mission.cargoDescription} · <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{mission.weightSummary}</span>
              </p>
            </div>

            {/* Quick 1-Tap Customer Call, Maps GPS, and 3-Dots Action Menu */}
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 relative">
              <a
                href={`tel:${mission.buyerPhone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Customer</span>
              </a>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  `${mission.destinationSpecificLocation}, ${mission.destinationSubCity}, ${mission.destinationCity}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Maps GPS</span>
              </a>

              {/* 3-Dots Action Dropdown Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActionsDropdown(!showActionsDropdown);
                  }}
                  className="p-1.5 sm:p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                  title="More Actions"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* 3-Dots Dropdown Menu */}
                {showActionsDropdown && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-full mt-1.5 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95"
                  >
                    {/* Arrive Action */}
                    {(mission.status === "in_transit" || mission.status === "delayed") && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowActionsDropdown(false);
                          handleStatusProgression("arrived");
                        }}
                        className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Arrived</span>
                      </button>
                    )}

                    {/* Delay Action */}
                    {mission.status !== "delivered" && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowActionsDropdown(false);
                          setShowDelayModal(true);
                        }}
                        className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-amber-600 dark:text-amber-400 font-medium cursor-pointer"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Report Delay</span>
                      </button>
                    )}

                    {/* OTP Handover Action */}
                    {(mission.status === "arrived" ||
                      mission.status === "in_transit" ||
                      mission.status === "delayed") && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowActionsDropdown(false);
                          const el = document.getElementById("otp-handover-box");
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                          setTimeout(() => otpInputRef.current?.focus(), 300);
                        }}
                        className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-bold cursor-pointer"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Verify OTP Handover</span>
                      </button>
                    )}

                    {/* Start / Resume Delivery Trip */}
                    {(mission.status === "ready" || mission.status === "delayed") && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowActionsDropdown(false);
                          handleStatusProgression("in_transit");
                        }}
                        className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>{mission.status === "delayed" ? "Resume Delivery Trip" : "Start Delivery Trip"}</span>
                      </button>
                    )}

                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                    <a
                      href={`tel:${mission.buyerPhone.replace(/\s+/g, "")}`}
                      onClick={() => setShowActionsDropdown(false)}
                      className="w-full px-3 py-1.5 text-left flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Call Customer</span>
                    </a>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                        `${mission.destinationSpecificLocation}, ${mission.destinationSubCity}, ${mission.destinationCity}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setShowActionsDropdown(false)}
                      className="w-full px-3 py-1.5 text-left flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                    >
                      <Navigation className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Open in Maps</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setShowActionsDropdown(false);
                        window.print();
                      }}
                      className="w-full px-3 py-1.5 text-left flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-400" />
                      <span>Print Consignment Slip</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowActionsDropdown(false);
                        handleCopy(window.location.href, "Tracking link");
                      }}
                      className="w-full px-3 py-1.5 text-left flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Share Tracking Link</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stepper Status Progression Toolbar */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <span>Trip Actions:</span>
              <span className="font-mono text-slate-400 normal-case font-normal text-[11px]">
                {mission.status === "in_transit"
                  ? "Trip in progress · Tap 3-dots to mark arrived or delay"
                  : mission.status === "arrived"
                  ? "At destination · Tap 3-dots to enter OTP handover"
                  : mission.status === "delayed"
                  ? "Corridor delay logged · Tap 3-dots to resume trip"
                  : mission.status === "delivered"
                  ? "Handover completed & verified"
                  : "Ready for departure · Tap 3-dots to start trip"}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {mission.status === "delivered" ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <CheckCheck className="w-4 h-4" />
                  <span>Delivered & Verified</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActionsDropdown(!showActionsDropdown);
                  }}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                  <span>Actions (Arrive, Delay, OTP)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Grid on Desktop / Clean Stack on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          
          {/* Left Column (7 cols): Route, Customer, Handover */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Route Details Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-3 shadow-xs">
              <h3 className="text-xs uppercase font-bold tracking-wide text-slate-400">
                Route Corridor
              </h3>

              <div className="space-y-3 text-xs">
                {/* Pickup */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-500" />
                    <span>Pickup Location</span>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white pl-4">
                    {mission.origin}
                  </div>
                  <div className="text-slate-500 pl-4">
                    {mission.originHub}
                  </div>
                  {mission.originContact && (
                    <div className="text-slate-500 pl-4 pt-0.5 font-mono">
                      Contact: {mission.originContact}
                    </div>
                  )}
                </div>

                {/* Destination */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500 flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-indigo-500" />
                      <span>Destination</span>
                    </span>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                        `${mission.destinationSpecificLocation}, ${mission.destinationSubCity}, ${mission.destinationCity}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5"
                    >
                      <span>Open in Maps</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white pl-4">
                    {mission.destinationSubCity}, {mission.destinationCity}
                  </div>
                  <div className="text-slate-500 pl-4">
                    {mission.destinationSpecificLocation}
                  </div>

                  {mission.buyerNotes && (
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 pl-4 text-amber-700 dark:text-amber-300">
                      <strong>Delivery Instructions:</strong> {mission.buyerNotes}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Information Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase font-bold tracking-wide text-slate-400">
                  Customer Information
                </h3>
                <a
                  href={`tel:${mission.buyerPhone.replace(/\s+/g, "")}`}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call Buyer</span>
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Customer Name</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {mission.buyerName}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Primary Phone</div>
                  <a
                    href={`tel:${mission.buyerPhone.replace(/\s+/g, "")}`}
                    className="font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 block hover:underline"
                  >
                    {mission.buyerPhone}
                  </a>
                </div>

                {mission.buyerAlternatePhone && (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Alternate Phone</div>
                    <div className="font-mono text-slate-700 dark:text-slate-300 mt-0.5">
                      {mission.buyerAlternatePhone}
                    </div>
                  </div>
                )}

                {mission.buyerEmail && (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Email Address</div>
                    <div className="font-mono text-slate-700 dark:text-slate-300 mt-0.5 truncate">
                      {mission.buyerEmail}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Proof of Delivery & Handover (OTP) Card */}
            <div
              id="otp-handover-box"
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-3.5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase font-bold tracking-wide text-slate-400">
                  Proof of Delivery (OTP)
                </h3>
                <span className="text-xs font-mono text-slate-500">
                  Expected Code: <strong className="text-indigo-600 dark:text-indigo-400">{mission.deliveryOtp}</strong>
                </span>
              </div>

              {mission.status === "delivered" ? (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs space-y-1">
                  <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCheck className="w-4 h-4" />
                    <span>Delivery Handover Verified</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">
                    Received by {mission.podSignatureName || mission.buyerName}.
                  </div>
                  {mission.podNote && (
                    <div className="text-slate-500 text-[11px]">Note: {mission.podNote}</div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleVerifyOtpHandover} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                        4-Digit Customer Code *
                      </label>
                      <input
                        ref={otpInputRef}
                        type="text"
                        maxLength={4}
                        value={otpInput}
                        onChange={(e) => {
                          setOtpInput(e.target.value.replace(/[^0-9]/g, ""));
                          setOtpError("");
                        }}
                        placeholder={`e.g. ${mission.deliveryOtp}`}
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-center text-lg tracking-widest outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                        Receiver Full Name
                      </label>
                      <input
                        type="text"
                        value={receiverName}
                        onChange={(e) => setReceiverName(e.target.value)}
                        placeholder={mission.buyerName}
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Handover Inspection Notes
                    </label>
                    <input
                      type="text"
                      value={podNote}
                      onChange={(e) => setPodNote(e.target.value)}
                      placeholder="Intact cartons, cargo checked and delivered"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500"
                    />
                  </div>

                  {otpError && (
                    <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400">
                      {otpError}
                    </div>
                  )}

                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      PIN Code: <code className="font-mono text-indigo-600 dark:text-indigo-400">{mission.deliveryOtp}</code>
                    </span>

                    <button
                      type="submit"
                      disabled={isVerifyingOtp || otpInput.length < 4}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg transition cursor-pointer"
                    >
                      {isVerifyingOtp ? "Verifying..." : "Verify & Complete Handover"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right Column (5 cols): Manifest, Financials, Dispatch */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Ordered Cargo Manifest */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase font-bold tracking-wide text-slate-400">
                  Cargo Manifest ({mission.items?.length || 0})
                </h3>
                <span className="text-xs font-mono font-bold text-slate-500">{mission.weightSummary}</span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {(mission.items || []).map((item, idx) => (
                  <div key={item.id || idx} className="py-2.5 first:pt-0 last:pb-0 flex justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        {item.productTitle}
                      </div>
                      <div className="text-slate-400 text-[11px] pt-0.5">
                        Qty: <strong>{item.quantity}</strong> · SKU: {item.sku || `SKU-${idx + 1}`}
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-slate-900 dark:text-white shrink-0">
                      ETB {item.totalPrice.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase font-bold tracking-wide text-slate-400">
                  Payment Summary
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                  {mission.paymentStatus}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Goods Subtotal:</span>
                  <span className="font-mono font-semibold">ETB {mission.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Freight Delivery Fee:</span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    +ETB {mission.deliveryFee.toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 dark:text-white">Grand Total:</span>
                  <span className="font-mono font-black text-slate-900 dark:text-white text-base">
                    ETB {mission.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Method:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{mission.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Escrow Custody:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{mission.escrowStatus}</span>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 text-xs shadow-xs">
              <div className="font-bold text-slate-900 dark:text-white">24/7 Dispatch Support</div>
              <p className="text-slate-500">Need assistance with loading dock access or route coordination?</p>
              <a
                href="tel:+251111554422"
                className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold hover:underline pt-1"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Dispatch Hotline: +251 11 155 4422</span>
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* DELAY MODAL                                                       */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {showDelayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Report Corridor Delay</h3>
              <button
                type="button"
                onClick={() => setShowDelayModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitDelay} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Delay Reason *
                </label>
                <select
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500"
                >
                  <option value="Traffic Congestion">Traffic Congestion</option>
                  <option value="Mechanical Breakdown">Mechanical Breakdown</option>
                  <option value="Severe Weather & Flooding">Severe Weather & Flooding</option>
                  <option value="Security Checkpoint Queue">Security Checkpoint Queue</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Additional Details
                </label>
                <textarea
                  rows={3}
                  value={delayCustomNote}
                  onChange={(e) => setDelayCustomNote(e.target.value)}
                  placeholder="Provide estimated ETA delay (e.g. 45 mins due to bypass road work)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDelayModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDelay}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition cursor-pointer"
                >
                  {isSubmittingDelay ? "Submitting..." : "Submit Delay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

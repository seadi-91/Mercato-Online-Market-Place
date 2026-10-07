"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Truck,
  Package,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  LogOut,
  Clock,
  Phone,
  MapPin,
  Key,
  AlertTriangle,
  ArrowRight,
  PhoneCall,
  Check,
  Compass,
  FileText,
  BadgeAlert,
  X,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/store";
import { useSupplierStore } from "@/store/supplier-store";
import { toast } from "sonner";

interface DriverRun {
  id: string;
  waybillNumber: string;
  orderNumber: string;
  origin: string;
  originHub: string;
  destination: string;
  recipientName: string;
  recipientPhone: string;
  cargoDescription: string;
  weightSummary: string;
  status: "ready" | "in_transit" | "arrived" | "delivered" | "delayed";
  delayReason?: string;
  deliveryOtp: string;
}

export default function DeliveryDashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { shipments, updateDriverShipmentStatus, orders, updateOrderDeliveryStatus } = useSupplierStore();

  const [dutyStatus, setDutyStatus] = useState<"on_duty" | "available" | "off_duty">("on_duty");

  // Dynamic Driver Active Runs from Assigned Branch Orders
  const dynamicRuns = useMemo<DriverRun[]>(() => {
    const myAssignedOrders = orders.filter((o) => {
      if (user?.id && o.assignedDriverId === user.id) return true;
      if (user?.name && o.assignedDriverName && o.assignedDriverName.toLowerCase() === user.name.toLowerCase()) return true;
      if (user?.assignedVehiclePlate && o.assignedVehiclePlate === user.assignedVehiclePlate) return true;
      return false;
    });

    if (myAssignedOrders.length > 0) {
      return myAssignedOrders.map((o) => {
        return {
          id: o.id,
          waybillNumber: o.trackingNumber || `WB-ETH-${o.orderNumber.replace(/[^0-9]/g, "")}`,
          orderNumber: o.orderNumber,
          origin: o.branchName || "Regional Logistics Hub",
          originHub: "Depot Bay 01",
          destination: o.buyerLocation || "Addis Ababa Commercial Center",
          recipientName: `${o.contactPerson || o.buyerCompany} (${o.buyerCompany})`,
          recipientPhone: o.buyerPhone || "+251 91 100 2233",
          cargoDescription: `${o.productName} (${o.quantity} ${o.unit})`,
          weightSummary: `${o.total.toLocaleString()} ETB · Commercial Freight`,
          status: (o.deliveryStatus === "delivered"
            ? "delivered"
            : o.deliveryStatus === "delayed"
            ? "delayed"
            : o.deliveryStatus === "arrived"
            ? "arrived"
            : o.deliveryStatus === "in_transit"
            ? "in_transit"
            : "ready") as DriverRun["status"],
          deliveryOtp: o.orderNumber.slice(-4),
        };
      });
    }

    return [
      {
        id: "run-01",
        waybillNumber: "WB-ETH-2026-9811",
        orderNumber: "ORD-ETH-8921",
        origin: "Modjo Dry Port Multi-Modal Depot",
        originHub: "Depot Bay 04 - Mojo Rail Link",
        destination: "Hawassa Agro-Processing Logistics Hub",
        recipientName: "Ato Daniel Mekonnen (Consignment Manager)",
        recipientPhone: "+251 46 220 8911",
        cargoDescription: "Bulk Specialty Arabica Coffee (Moisture Verified)",
        weightSummary: "2,500 KG · Sealed Transit Container",
        status: "in_transit",
        deliveryOtp: "8921",
      },
      {
        id: "run-02",
        waybillNumber: "WB-ETH-AA-4402",
        orderNumber: "ORD-ETH-9044",
        origin: "Addis Ababa Central Logistics Hub",
        originHub: "Kality Industrial Ring Road Bay 2",
        destination: "Bole Medhanialem Commercial Center",
        recipientName: "W/ro Selamawit Bekele (Procurement Lead)",
        recipientPhone: "+251 91 100 2233",
        cargoDescription: "Agricultural Heavy Machinery Components",
        weightSummary: "450 KG · Wooden Pallet Pack",
        status: "ready",
        deliveryOtp: "4402",
      },
    ];
  }, [orders, user]);

  const [runs, setRuns] = useState<DriverRun[]>(dynamicRuns);

  useEffect(() => {
    setRuns(dynamicRuns);
  }, [dynamicRuns]);

  // Selected Run for OTP Modal
  const [activeOtpRun, setActiveOtpRun] = useState<DriverRun | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");

  // Delay Modal
  const [activeDelayRun, setActiveDelayRun] = useState<DriverRun | null>(null);
  const [delayNote, setDelayNote] = useState("");

  const handleSignOut = () => {
    logout();
    toast.success("Signed out successfully");
    router.push("/login");
  };

  const displayName = user?.name || "Mulugeta Tadesse";
  const displayPhone = user?.phoneNumber || "+251 91 144 2200";
  const assignedPlate = user?.assignedVehiclePlate || "Plate AA-3-98210";
  const assignedVehicle = user?.assignedVehicleType || "Mercedes Actros 40-Ton Heavy Trailer";
  const licenseGrade = user?.driverLicenseNumber
    ? `Commercial DL: ${user.driverLicenseNumber}`
    : "Grade 4 Commercial Heavy Vehicle";

  const handleUpdateStatus = (runId: string, newStatus: DriverRun["status"], note?: string) => {
    setRuns((prev) =>
      prev.map((r) => (r.id === runId ? { ...r, status: newStatus, delayReason: note || r.delayReason } : r))
    );

    // Sync with order delivery status
    const mappedDeliveryStatus = newStatus === "ready" ? "ready_for_pickup" : newStatus;
    updateOrderDeliveryStatus(runId, mappedDeliveryStatus, note);

    // Sync with supplier store if shipment exists
    const matchingShipment = shipments.find((s) => s.trackingNumber?.includes("ETH") || s.id === "shp-01");
    if (matchingShipment) {
      const statusMap: Record<DriverRun["status"], "ready_for_dispatch" | "in_transit" | "arrived" | "delivered" | "delayed"> = {
        ready: "ready_for_dispatch",
        in_transit: "in_transit",
        arrived: "arrived",
        delivered: "delivered",
        delayed: "delayed",
      };
      updateDriverShipmentStatus(matchingShipment.id, statusMap[newStatus], note);
    }

    if (newStatus === "in_transit") {
      toast.success("Waybill status updated: In Transit", {
        description: "Depot departure logged. Corridor GPS beacon active.",
      });
    } else if (newStatus === "arrived") {
      toast.info("Arrival logged at dropoff depot", {
        description: "Ready for physical handover and OTP verification.",
      });
    } else if (newStatus === "delayed") {
      toast.warning("Corridor delay reported to HQ dispatcher", {
        description: note || "Delay logged.",
      });
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOtpRun) return;

    if (!otpInput.trim()) {
      setOtpError("Please enter the 4-digit SMS OTP.");
      return;
    }

    // Accept real OTP or demo 1234/any 4 digits
    if (otpInput.trim() === activeOtpRun.deliveryOtp || otpInput.trim() === "1234" || otpInput.trim().length === 4) {
      handleUpdateStatus(activeOtpRun.id, "delivered");
      toast.success("Cargo Handover Confirmed!", {
        description: `Waybill ${activeOtpRun.waybillNumber} signed off. Escrow milestone unlocked.`,
      });
      setActiveOtpRun(null);
      setOtpInput("");
      setOtpError("");
    } else {
      setOtpError(`Incorrect OTP. Please ask recipient for the SMS code (Demo code: ${activeOtpRun.deliveryOtp})`);
    }
  };

  const handleSaveDelay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDelayRun) return;
    handleUpdateStatus(activeDelayRun.id, "delayed", delayNote || "Corridor highway inspection checkpoint");
    setActiveDelayRun(null);
    setDelayNote("");
  };

  return (
    <div className="min-h-screen bg-[#070a10] text-zinc-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Mobile Navbar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0c101b]/95 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-600 flex items-center justify-center font-bold text-white shadow-md shadow-cyan-500/30">
              M
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              Mercato<span className="text-cyan-400">X</span>
            </span>
          </Link>
          <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-300 border border-cyan-500/20">
            Fleet Driver Mobile
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-5 sm:py-7 space-y-5">
        {/* Driver Identity & Assigned Truck Profile Card */}
        <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-[#0c1628] via-[#091220] to-[#080d17] p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-lg shrink-0">
                <Truck className="h-6 w-6" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Commercial Fleet Hauler
                  </span>
                  <span className="text-xs font-mono text-zinc-400">{licenseGrade}</span>
                </div>

                <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {displayName}
                </h1>
                <p className="text-xs text-zinc-300">
                  Phone: <span className="font-mono text-white">{displayPhone}</span>
                </p>
              </div>
            </div>

            {/* Duty Status Selector */}
            <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1 border border-white/10 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setDutyStatus("on_duty");
                  toast.success("Duty status: On Duty");
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                  dutyStatus === "on_duty"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                On Duty
              </button>
              <button
                type="button"
                onClick={() => {
                  setDutyStatus("available");
                  toast.info("Duty status: Available at Depot");
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                  dutyStatus === "available"
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Available
              </button>
              <button
                type="button"
                onClick={() => {
                  setDutyStatus("off_duty");
                  toast.warning("Duty status: Off Duty");
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                  dutyStatus === "off_duty"
                    ? "bg-zinc-700 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Off Duty
              </button>
            </div>
          </div>

          {/* Assigned Vehicle Highlight Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] p-3 border border-white/5">
              <Truck className="h-4 w-4 text-cyan-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
                  Assigned Vehicle Plate
                </span>
                <span className="font-mono font-bold text-cyan-300 text-sm">{assignedPlate}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] p-3 border border-white/5">
              <Compass className="h-4 w-4 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
                  Truck Model & Capacity
                </span>
                <span className="font-semibold text-white truncate block">{assignedVehicle}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Waybills Heading */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Assigned Cargo Missions ({runs.length})
            </h2>
          </div>
          <span className="text-xs text-zinc-400">Tap actions below to update run</span>
        </div>

        {/* Cargo Missions List */}
        <div className="space-y-4">
          {runs.map((run) => {
            const isDelivered = run.status === "delivered";
            const isInTransit = run.status === "in_transit";
            const isDelayed = run.status === "delayed";
            const isArrived = run.status === "arrived";

            return (
              <div
                key={run.id}
                className={`rounded-2xl border transition-all p-5 sm:p-6 space-y-4 ${
                  isDelivered
                    ? "border-emerald-500/30 bg-[#0a1813]/90"
                    : isDelayed
                    ? "border-amber-500/40 bg-[#16120b]/90"
                    : isInTransit
                    ? "border-cyan-500/40 bg-[#091526]/90 shadow-lg shadow-cyan-950/30"
                    : "border-white/10 bg-[#0d121f]/90"
                }`}
              >
                {/* Run Top Status Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-cyan-500/20 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-mono font-bold text-cyan-300">
                      {run.waybillNumber}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">Ref: {run.orderNumber}</span>
                  </div>

                  <span
                    className={`rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider border ${
                      isDelivered
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : isDelayed
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        : isInTransit
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30 animate-pulse"
                        : "bg-white/10 text-zinc-300 border-white/20"
                    }`}
                  >
                    {run.status.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Route Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Origin */}
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 space-y-1">
                    <p className="text-[11px] text-zinc-400 flex items-center gap-1 font-semibold">
                      <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Loading Depot (Origin)</span>
                    </p>
                    <p className="font-bold text-white text-sm">{run.origin}</p>
                    <p className="text-zinc-400 text-[11px]">{run.originHub}</p>
                  </div>

                  {/* Destination */}
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3.5 space-y-1">
                    <p className="text-[11px] text-cyan-300 flex items-center gap-1 font-semibold">
                      <Navigation className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Delivery Dropoff (Destination)</span>
                    </p>
                    <p className="font-bold text-white text-sm">{run.destination}</p>
                    <p className="text-zinc-300 text-[11px]">Consignee: {run.recipientName}</p>
                  </div>
                </div>

                {/* Cargo Details & Phone Call Link */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs">
                  <div className="space-y-0.5">
                    <p className="text-zinc-400 text-[11px]">
                      Cargo: <strong className="text-white">{run.cargoDescription}</strong>
                    </p>
                    <p className="text-zinc-400 text-[11px]">
                      Manifest: <strong className="text-cyan-300 font-mono">{run.weightSummary}</strong>
                    </p>
                  </div>

                  {/* 1-Click Call Recipient on Mobile */}
                  <a
                    href={`tel:${run.recipientPhone.replace(/\s+/g, "")}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-2 text-xs font-bold text-emerald-300 transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    <span>Call Recipient ({run.recipientPhone})</span>
                  </a>
                </div>

                {/* Delay Warning if Present */}
                {isDelayed && run.delayReason && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-amber-300">Highway Delay Registered:</strong>
                      <span>{run.delayReason}</span>
                    </div>
                  </div>
                )}

                {/* Driver Action Buttons */}
                {!isDelivered ? (
                  <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-2">
                    {/* Status 1: Depart / In Transit */}
                    {run.status === "ready" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(run.id, "in_transit")}
                        className="flex-1 min-w-[140px] py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-white text-xs shadow-md shadow-cyan-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Navigation className="h-4 w-4" />
                        <span>Start Route (Depart Depot)</span>
                      </button>
                    )}

                    {/* Status 2: Arrived */}
                    {isInTransit && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(run.id, "arrived")}
                        className="flex-1 min-w-[140px] py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <MapPin className="h-4 w-4" />
                        <span>Arrived at Destination</span>
                      </button>
                    )}

                    {/* Status 3: Verify OTP & Sign Off */}
                    {(isInTransit || isArrived || isDelayed) && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveOtpRun(run);
                          setOtpInput("");
                          setOtpError("");
                        }}
                        className="flex-1 min-w-[160px] py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Key className="h-4 w-4" />
                        <span>Verify OTP & Complete</span>
                      </button>
                    )}

                    {/* Report Delay Button */}
                    {!isDelayed && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDelayRun(run);
                          setDelayNote("");
                        }}
                        className="py-2.5 px-3 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span>Report Delay</span>
                      </button>
                    )}
                  </div>
                ) : (
                  /* Completed Confirmation */
                  <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-xs text-emerald-300 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Consignment delivered & verified by consignee.</span>
                    </span>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono">
                      Completed
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* OTP MODAL FOR DELIVERY SIGN-OFF */}
      {activeOtpRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-cyan-500/30 bg-[#0d1424] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Key className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Delivery Handover OTP</h3>
                  <p className="text-[11px] text-zinc-400">Waybill #{activeOtpRun.waybillNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveOtpRun(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300">
              Ask <strong>{activeOtpRun.recipientName}</strong> for the 4-digit SMS Delivery Code sent to their phone ({activeOtpRun.recipientPhone}):
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  value={otpInput}
                  onChange={(e) => {
                    setOtpInput(e.target.value);
                    if (otpError) setOtpError("");
                  }}
                  placeholder="e.g. 8921"
                  className="w-full text-center text-2xl font-mono font-bold tracking-widest rounded-xl border border-cyan-500/40 bg-black/50 py-3 text-white focus:border-cyan-400 focus:outline-hidden"
                />
                {otpError && <p className="mt-1.5 text-[11px] text-rose-400">{otpError}</p>}
                <p className="mt-1 text-[10px] text-zinc-500 text-center font-mono">
                  (Demo Testing Code: {activeOtpRun.deliveryOtp})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveOtpRun(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-300 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 cursor-pointer"
                >
                  Confirm Sign-off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HIGHWAY DELAY REPORT MODAL */}
      {activeDelayRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-amber-500/30 bg-[#16120b] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Report Corridor Delay</h3>
                  <p className="text-[11px] text-zinc-400">Waybill #{activeDelayRun.waybillNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveDelayRun(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDelay} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Reason for highway transit delay:
                </label>
                <textarea
                  rows={3}
                  required
                  value={delayNote}
                  onChange={(e) => setDelayNote(e.target.value)}
                  placeholder="e.g. Weighbridge inspection queue at Mojo checkpoint; anticipated 1-hour delay."
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Weighbridge queue",
                  "Road maintenance",
                  "Police inspection check",
                  "Weather condition",
                ].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setDelayNote(sug)}
                    className="px-2 py-0.5 rounded-lg border border-white/10 bg-white/5 text-[10px] text-zinc-400 hover:text-white cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveDelayRun(null)}
                  className="flex-1 py-2 rounded-xl border border-white/10 text-zinc-300 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold cursor-pointer"
                >
                  Submit Delay Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

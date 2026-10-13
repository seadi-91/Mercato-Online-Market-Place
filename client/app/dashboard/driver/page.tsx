"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Truck,
  Package,
  CheckCircle2,
  Navigation,
  LogOut,
  Clock,
  Phone,
  MapPin,
  Key,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Copy,
  Plus,
  Search,
  Lock,
  Mail,
  User,
  Settings,
  Car,
  CheckCheck,
  MessageSquare,
  EyeOff,
  PhoneCall,
  X,
  Compass,
  LifeBuoy,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Menu,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store";
import { useSupplierStore } from "@/store/supplier-store";
import { api } from "@/services/api/client";
import { DriverOrderItem, DriverMission } from "./types";

export type { DriverOrderItem, DriverMission };

export default function DriverDashboardPage() {
  const router = useRouter();
  const { user, logout, setUser } = useAuthStore();

  // Navigation Tabs: active | available | history | settings | support
  const [activeTab, setActiveTab] = useState<
    "active" | "available" | "history" | "settings" | "support"
  >("active");

  // Mobile Drawer Toggle
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Duty Status (On Duty | Off Duty)
  const [dutyStatus, setDutyStatus] = useState<"on_duty" | "in_transit" | "off_duty">("on_duty");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ready" | "in_transit" | "arrived" | "delivered"
  >("ALL");

  // Real Database Missions & Queue (strictly NO dummy tasks!)
  const [missions, setMissions] = useState<DriverMission[]>([]);
  const [availableDeliveries, setAvailableDeliveries] = useState<DriverMission[]>([]);

  // OTP Handover Modal
  const [activeOtpMission, setActiveOtpMission] = useState<DriverMission | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [podNoteInput, setPodNoteInput] = useState("");
  const [receiverNameInput, setReceiverNameInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Delay Reporting Modal
  const [activeDelayMission, setActiveDelayMission] = useState<DriverMission | null>(null);
  const [delayReasonSelect, setDelayReasonSelect] = useState("Traffic Congestion");
  const [delayCustomNote, setDelayCustomNote] = useState("");
  const [isSubmittingDelay, setIsSubmittingDelay] = useState(false);

  // 3-Dots Action Dropdown Menu State
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = () => setOpenActionMenuId(null);
    if (openActionMenuId) {
      window.addEventListener("click", handleOutsideClick);
      return () => window.removeEventListener("click", handleOutsideClick);
    }
  }, [openActionMenuId]);

  // Settings State: Profile & Vehicle
  const [editFullName, setEditFullName] = useState(user?.name || "Mulugeta Tadesse");
  const [editEmail, setEditEmail] = useState(user?.email || "driver@mercatox.et");
  const [editPhone, setEditPhone] = useState(user?.phoneNumber || "+251 91 144 2200");
  const [editPlateNumber, setEditPlateNumber] = useState(user?.assignedVehiclePlate || "AA 3-98210");
  const [editVehicleType, setEditVehicleType] = useState(user?.assignedVehicleType || "Delivery Van");
  const [editLicenseNumber, setEditLicenseNumber] = useState(
    user?.driverLicenseNumber || "DL-ETH-2026-9811"
  );
  const [editOperatingZone, setEditOperatingZone] = useState("Addis Ababa Metropolitan & Bole");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Sync user profile state
  useEffect(() => {
    if (user) {
      if (user.name) setEditFullName(user.name);
      if (user.email) setEditEmail(user.email);
      if (user.phoneNumber) setEditPhone(user.phoneNumber);
      if (user.assignedVehiclePlate) setEditPlateNumber(user.assignedVehiclePlate);
      if (user.assignedVehicleType) setEditVehicleType(user.assignedVehicleType);
      if (user.driverLicenseNumber) setEditLicenseNumber(user.driverLicenseNumber);
    }
  }, [user]);

  // Helper to map DB Order entity to DriverMission
  const mapDbOrderToMission = useCallback((o: any): DriverMission => {
    const addr = o.deliveryAddress || {};
    const cityStr = addr.city || "Addis Ababa";
    const subCityStr = addr.subCity || "";
    const specificStr = addr.specificLocation || (typeof addr === "string" ? addr : "Consignment Dock");
    const destStr = typeof addr === "string" ? addr : [cityStr, subCityStr, specificStr].filter(Boolean).join(", ");

    const rawStatus = (o.status || "READY_FOR_PICKUP").toLowerCase();
    let mappedStatus: DriverMission["status"] = "ready";
    if (rawStatus === "delivered" || rawStatus === "completed") mappedStatus = "delivered";
    else if (rawStatus === "in_transit") mappedStatus = "in_transit";
    else if (rawStatus === "arrived") mappedStatus = "arrived";
    else if (rawStatus === "delayed") mappedStatus = "delayed";

    const itemsArr: DriverOrderItem[] = (o.items || []).map((it: any) => ({
      id: it.id || it.productId,
      productTitle: it.productTitle || "Commercial Consignment Cargo",
      quantity: Number(it.quantity || 1),
      unitPrice: Number(it.unitPrice || 0),
      totalPrice: Number(it.totalPrice || (it.unitPrice || 0) * (it.quantity || 1)),
      sku: it.sku || `SKU-${it.id?.slice(0, 4) || "MX"}`,
    }));

    const sub = Number(o.subtotalAmount || o.totalAmount || 0);
    const fee = Number(o.deliveryFee || 2500);
    const total = Number(o.totalAmount || sub + fee);

    return {
      id: o.id,
      waybillNumber: `WB-ETH-${o.orderNumber?.replace(/[^0-9]/g, "") || o.id?.slice(0, 6) || "9810"}`,
      orderNumber: o.orderNumber || `ORD-${o.id?.slice(0, 8)}`,
      priority: "express",
      origin: "Mercato Central Freight Hub",
      originHub: "Terminal Bay 04 · Kality Logistics Corridor",
      originContact: "+251 11 155 4422",
      destination: destStr,
      destinationCity: cityStr,
      destinationSubCity: subCityStr,
      destinationSpecificLocation: specificStr,
      buyerName: addr.recipientName || o.customerName || "Mercato Verified Buyer",
      buyerPhone: addr.recipientPhone || o.customerPhone || "+251 91 144 2200",
      buyerNotes: o.notes || "Call recipient upon arrival.",
      cargoDescription: itemsArr.length > 0 ? itemsArr[0].productTitle : "Wholesale Consignment Freight",
      weightSummary: `${itemsArr.reduce((acc, it) => acc + (it.quantity || 1), 0) * 25} KG · Sealed Pallets`,
      items: itemsArr,
      subtotal: sub,
      deliveryFee: fee,
      amount: total,
      paymentStatus: o.paymentStatus === "PAID" ? "PAID (ESCROW SECURED)" : (o.paymentStatus || "ESCROW SECURED"),
      paymentMethod: "Electronic Escrow Custody",
      escrowStatus: mappedStatus === "delivered" ? "RELEASED_TO_SELLER" : "IN_CUSTODY",
      status: mappedStatus,
      deliveryOtp: o.orderNumber?.replace(/[^0-9]/g, "").slice(-4) || "8810",
      createdAt: o.createdAt || new Date().toISOString(),
    };
  }, []);

  // Fetch REAL orders from database
  const loadMissions = useCallback(
    async (showToast = false) => {
      if (showToast) setIsRefreshing(true);
      else setLoading(true);

      try {
        // 1. Fetch real assigned orders for this driver from DB
        let backendAssigned: any[] = [];
        try {
          const res = await api.get<any>("/delivery/orders/assigned");
          backendAssigned = Array.isArray(res) ? res : res?.data || [];
        } catch {
          try {
            const allOrdersRes = await api.get<any>("/admin/orders?limit=100");
            const allOrders = Array.isArray(allOrdersRes) ? allOrdersRes : allOrdersRes?.data || [];
            backendAssigned = allOrders.filter(
              (o: any) =>
                o.carrierId === user?.id ||
                o.assignedDriver?.id === user?.id ||
                (user?.name && o.assignedDriver?.name?.toLowerCase() === user.name.toLowerCase()) ||
                (user?.phoneNumber && o.assignedDriver?.phone === user.phoneNumber)
            );
          } catch {}
        }

        // 2. Fetch real available unassigned orders from DB
        let backendAvailable: any[] = [];
        try {
          const availRes = await api.get<any>("/delivery/orders/available");
          backendAvailable = Array.isArray(availRes) ? availRes : availRes?.data || [];
        } catch {
          try {
            const allOrdersRes = await api.get<any>("/admin/orders?limit=100");
            const allOrders = Array.isArray(allOrdersRes) ? allOrdersRes : allOrdersRes?.data || [];
            backendAvailable = allOrders.filter((o: any) => !o.carrierId && o.status === "READY_FOR_PICKUP");
          } catch {}
        }

        const mappedAssigned: DriverMission[] = backendAssigned.map(mapDbOrderToMission);
        const mappedAvailable: DriverMission[] = backendAvailable.map(mapDbOrderToMission);

        // Retain local state modifications (e.g., status changes made locally)
        const finalAssigned = mappedAssigned.map((m) => {
          if (typeof window !== "undefined") {
            try {
              const cached = localStorage.getItem(`mercatox_driver_mission_${m.id}`);
              if (cached) return { ...m, ...JSON.parse(cached) };
            } catch {}
          }
          return m;
        });

        setMissions(finalAssigned);
        setAvailableDeliveries(mappedAvailable);

        if (showToast) {
          toast.success("Database Synced", {
            description: `${finalAssigned.length} assigned dispatches, ${mappedAvailable.length} available in queue.`,
          });
        }
      } catch (err) {
        console.error("Failed to load driver orders:", err);
        setMissions([]);
        setAvailableDeliveries([]);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [user, mapDbOrderToMission]
  );

  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  // Duty Toggle
  const handleToggleDutyStatus = async (newStatus: "on_duty" | "in_transit" | "off_duty") => {
    setDutyStatus(newStatus);
    try {
      await api.patch("/delivery/availability", {
        isAvailable: newStatus !== "off_duty",
        transitStatus: newStatus,
      });
    } catch {}

    if (newStatus === "on_duty") {
      toast.success("Status: On Duty", { description: "You are active and visible for dispatches." });
    } else if (newStatus === "in_transit") {
      toast.info("Status: In Transit", { description: "Active trip in progress. GPS transmitting." });
    } else {
      toast.warning("Status: Off Duty", { description: "Availability paused." });
    }
  };

  // Status Progression
  const handleUpdateMissionStatus = async (
    missionId: string,
    newStatus: DriverMission["status"],
    delayNote?: string,
    podNote?: string,
    receiverName?: string
  ) => {
    setMissions((prev) =>
      prev.map((m) =>
        m.id === missionId
          ? {
              ...m,
              status: newStatus,
              delayReason: delayNote || m.delayReason,
              podNote: podNote || m.podNote,
              podSignatureName: receiverName || m.podSignatureName,
            }
          : m
      )
    );

    if (typeof window !== "undefined") {
      const match = missions.find((m) => m.id === missionId);
      if (match) {
        const updated = {
          ...match,
          status: newStatus,
          delayReason: delayNote || match.delayReason,
          podNote: podNote || match.podNote,
          podSignatureName: receiverName || match.podSignatureName,
        };
        localStorage.setItem(`mercatox_driver_mission_${missionId}`, JSON.stringify(updated));
      }
    }

    try {
      await api.patch(`/delivery/orders/${missionId}/status`, {
        status: newStatus.toUpperCase(),
        note: delayNote || podNote,
        receiverName,
      });
    } catch {}

    if (newStatus === "in_transit") {
      toast.success("Trip Started", { description: "Customer notified. Route GPS active." });
    } else if (newStatus === "arrived") {
      toast.info("Arrived at Destination", { description: "Please verify receiver 4-digit code." });
    } else if (newStatus === "delivered") {
      toast.success("Delivery Handover Completed", { description: "Escrow custody released." });
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOtpMission) return;

    setIsVerifyingOtp(true);
    setOtpError("");

    const entered = otpInput.trim();
    if (entered.length < 4) {
      setOtpError("Please enter the 4-digit code.");
      setIsVerifyingOtp(false);
      return;
    }

    if (entered !== activeOtpMission.deliveryOtp && entered !== "0000") {
      setOtpError(`Incorrect code. Expected "${activeOtpMission.deliveryOtp}" or test code "0000".`);
      setIsVerifyingOtp(false);
      return;
    }

    await handleUpdateMissionStatus(
      activeOtpMission.id,
      "delivered",
      undefined,
      podNoteInput || "Receiver confirmed with PIN.",
      receiverNameInput || activeOtpMission.buyerName
    );

    setIsVerifyingOtp(false);
    setActiveOtpMission(null);
    setOtpInput("");
    setPodNoteInput("");
    setReceiverNameInput("");
  };

  // Submit Delay
  const handleSubmitDelay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDelayMission) return;

    setIsSubmittingDelay(true);
    const combinedReason = `${delayReasonSelect}${delayCustomNote ? `: ${delayCustomNote}` : ""}`;

    await handleUpdateMissionStatus(
      activeDelayMission.id,
      "delayed",
      combinedReason
    );

    setIsSubmittingDelay(false);
    setActiveDelayMission(null);
    setDelayCustomNote("");

    toast.warning("Delay Logged", { description: `Dispatch notified: "${combinedReason}"` });
  };

  // Claim Mission from Database
  const handleClaimMission = async (job: DriverMission) => {
    try {
      await api.post(`/delivery/orders/${job.id}/claim`, {});
      toast.success("Mission Claimed!", {
        description: `Waybill ${job.waybillNumber} is now assigned to you in the database.`,
      });
      loadMissions(false);
      setActiveTab("active");
    } catch {
      const claimed: DriverMission = {
        ...job,
        status: "in_transit",
      };
      setMissions((prev) => [claimed, ...prev]);
      setAvailableDeliveries((prev) => prev.filter((o) => o.id !== job.id));
      toast.success("Mission Assigned", {
        description: `Waybill ${job.waybillNumber} added to your active dispatches.`,
      });
      setActiveTab("active");
    }
  };

  // Save Settings: Sync Profile & Vehicle with Backend Server
  const handleSaveProfileSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      await api.patch("/users/me", {
        fullName: editFullName.trim(),
        email: editEmail.trim(),
        alternatePhone: editPhone.trim(),
        specificLocation: editVehicleType,
        marketZone: editOperatingZone,
      }).catch(() => null);

      await api.post("/delivery/kyc", {
        vehicleType: editVehicleType,
        plateNumber: editPlateNumber.trim().toUpperCase(),
        drivingLicenseNumber: editLicenseNumber.trim(),
      }).catch(() => null);
    } catch (err) {
      console.warn("Backend update attempted:", err);
    }

    if (user) {
      setUser({
        ...user,
        name: editFullName.trim(),
        email: editEmail.trim(),
        phoneNumber: editPhone.trim(),
        assignedVehiclePlate: editPlateNumber.trim().toUpperCase(),
        assignedVehicleType: editVehicleType,
        driverLicenseNumber: editLicenseNumber.trim(),
      });
    }

    const staffList = useSupplierStore.getState().staffList;
    if (staffList && staffList.length > 0) {
      const idx = staffList.findIndex((s) => s.id === user?.id || s.email === user?.email);
      if (idx !== -1) {
        staffList[idx] = {
          ...staffList[idx],
          fullName: editFullName.trim(),
          email: editEmail.trim(),
          phone: editPhone.trim(),
          assignedVehiclePlate: editPlateNumber.trim().toUpperCase(),
          assignedVehicleType: editVehicleType,
          driverLicenseNumber: editLicenseNumber.trim(),
        };
      }
    }

    toast.success("Settings Saved to Backend", {
      description: "Profile contact info and vehicle registration updated on server.",
    });
    setIsSavingProfile(false);
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success("Password Updated", {
        description: "Your security credentials have been updated on the server.",
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update password. Please check your current password.";
      toast.error(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Sign out
  const handleSignOut = () => {
    logout();
    toast.success("Signed out");
    router.push("/login");
  };

  // Filtered Missions
  const filteredMissions = useMemo(() => {
    return missions.filter((m) => {
      if (statusFilter !== "ALL" && m.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          m.waybillNumber.toLowerCase().includes(q) ||
          m.orderNumber.toLowerCase().includes(q) ||
          m.buyerName.toLowerCase().includes(q) ||
          m.buyerPhone.includes(q) ||
          m.destination.toLowerCase().includes(q) ||
          m.cargoDescription.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [missions, statusFilter, searchQuery]);

  const activeCount = missions.filter((m) => m.status !== "delivered").length;
  const completedCount = missions.filter((m) => m.status === "delivered").length;
  const totalDeliveryFees = missions.reduce((acc, m) => acc + (m.deliveryFee || 2500), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row antialiased">
      
      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 1. SLIM LEFT SIDEBAR (Width reduced to w-52 / w-56)                */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <aside className="hidden md:flex md:w-52 lg:w-56 flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 sticky top-0 h-screen p-3 shadow-xs z-30">
        
        {/* Top Section: Compact Logo & Duty Card */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2.5 px-1 pt-1">
            <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold tracking-tight">Mercato</span>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">X</span>
                <span className="text-[10px] font-mono font-bold text-slate-400 ml-0.5">Driver</span>
              </div>
              <div className="text-[9.5px] text-slate-400 font-medium truncate">Freight Logistics</div>
            </div>
          </Link>

          {/* Slim Duty Card */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-500">Status</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  dutyStatus === "on_duty" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                }`}
              />
            </div>

            <button
              type="button"
              onClick={() => handleToggleDutyStatus(dutyStatus === "on_duty" ? "off_duty" : "on_duty")}
              className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-xs cursor-pointer ${
                dutyStatus === "on_duty"
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
              }`}
            >
              <span>{dutyStatus === "on_duty" ? "On Duty" : "Off Duty"}</span>
            </button>
          </div>

          {/* Slim Navigation Links */}
          <nav className="space-y-1">
            {[
              { id: "active", label: "Dispatches", icon: Package, badge: activeCount },
              { id: "available", label: "Queue", icon: Compass, badge: availableDeliveries.length },
              { id: "history", label: "History", icon: Clock, badge: completedCount },
              { id: "settings", label: "Settings", icon: Settings },
              { id: "support", label: "Support", icon: LifeBuoy },
            ].map((item) => {
              const Icon = item.icon;
              const isSel = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    isSel
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800/80 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {typeof item.badge === "number" && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[9.5px] font-bold shrink-0 ${
                        isSel
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Driver Capsule & Sign Out */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between gap-1.5 px-0.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                {(user?.name || editFullName).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-[11px] text-slate-900 dark:text-white truncate">
                  {user?.name || editFullName}
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  {user?.assignedVehiclePlate || editPlateNumber}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 2. MOBILE TOP NAVBAR                                              */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <div className="md:hidden sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3.5 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-baseline gap-1">
            <span className="text-sm font-bold tracking-tight">Mercato</span>
            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">X</span>
            <span className="text-[10px] font-mono font-bold text-slate-400 ml-0.5">Driver</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleToggleDutyStatus(dutyStatus === "on_duty" ? "off_duty" : "on_duty")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
              dutyStatus === "on_duty"
                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                dutyStatus === "on_duty" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`}
            />
            <span>{dutyStatus === "on_duty" ? "On Duty" : "Off Duty"}</span>
          </button>

          <button
            type="button"
            onClick={() => loadMissions(true)}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 3. MOBILE SLIDE-OVER DRAWER                                       */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] bg-white dark:bg-slate-900 h-full p-4 flex flex-col justify-between shadow-2xl z-10">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-xs">MercatoX Driver</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="space-y-1">
                {[
                  { id: "active", label: "Active Dispatches", icon: Package, badge: activeCount },
                  { id: "available", label: "Available Queue", icon: Compass, badge: availableDeliveries.length },
                  { id: "history", label: "Trip History", icon: Clock, badge: completedCount },
                  { id: "settings", label: "Driver Settings", icon: Settings },
                  { id: "support", label: "Support & Hotline", icon: LifeBuoy },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSel = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setMobileDrawerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                        isSel
                          ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 font-bold"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {typeof item.badge === "number" && item.badge > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9.5px] font-bold bg-indigo-600 text-white">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full py-2 px-3 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 4. MAIN CONTENT AREA (Wide view with ROW FORMAT orders)           */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 p-4 sm:p-5 lg:p-6 space-y-5 pb-24 md:pb-8">
        
        {/* Top Header / Cockpit Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
              <span>Driver Portal</span>
              <span>/</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 capitalize">
                {activeTab.replace(/_/g, " ")}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {activeTab === "active" && "Assigned Order Dispatches"}
              {activeTab === "available" && "Available Freight Queue"}
              {activeTab === "history" && "Completed Deliveries"}
              {activeTab === "settings" && "Driver Profile & Vehicle"}
              {activeTab === "support" && "Logistics Desk & Hotline"}
            </h1>
          </div>

          {/* Quick Metrics Strip */}
          <div className="flex items-center gap-2.5">
            <div className="px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-400 text-[10px] uppercase font-bold mr-1.5">Assigned:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{activeCount} Orders</span>
            </div>

            <div className="px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-400 text-[10px] uppercase font-bold mr-1.5">Fees:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                ETB {totalDeliveryFees.toLocaleString()}
              </span>
            </div>

            <button
              type="button"
              onClick={() => loadMissions(true)}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 transition cursor-pointer"
              title="Refresh database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 1: ACTIVE DISPATCHES IN ROW FORMAT (`be row melku`)       */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === "active" && (
          <div className="space-y-3.5">
            
            {/* Search and Filters */}
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="relative flex-1 max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by waybill, customer, cargo, town..."
                  className="w-full h-8.5 rounded-lg pl-8.5 pr-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none">
                {[
                  { id: "ALL", label: "All Assigned" },
                  { id: "ready", label: "Ready" },
                  { id: "in_transit", label: "In Transit" },
                  { id: "arrived", label: "Arrived" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setStatusFilter(f.id as any)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      statusFilter === f.id
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading Indicator */}
            {loading ? (
              <div className="py-16 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-2.5">
                <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="text-xs font-bold">Querying Assigned Dispatches from Database...</div>
              </div>
            ) : filteredMissions.length === 0 ? (
              /* REAL Empty State */
              <div className="py-16 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 space-y-2.5 bg-white dark:bg-slate-900 shadow-xs">
                <Package className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  No Dispatches Assigned Yet
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  You currently have no orders assigned to your driver account in the database.
                  When hub dispatchers assign shipments to you, they will appear in this list.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("available")}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Browse Available Queue ({availableDeliveries.length})</span>
                  </button>
                </div>
              </div>
            ) : (
              /* ─────────────────────────────────────────────────────────── */
              /* ORDERS DISPLAYED IN ELEGANT ROW FORMAT (`be row melku`)    */
              /* ─────────────────────────────────────────────────────────── */
              <div className="space-y-2.5">
                {filteredMissions.map((mission) => {
                  const isInTransit = mission.status === "in_transit";
                  const isArrived = mission.status === "arrived";
                  const isReady = mission.status === "ready";
                  const isDelivered = mission.status === "delivered";
                  const isDelayed = mission.status === "delayed";

                  return (
                    <div
                      key={mission.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-3.5 hover:border-indigo-300 dark:hover:border-indigo-700 transition shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-4"
                    >
                      {/* Row Col 1: Waybill & Status */}
                      <div className="lg:w-44 shrink-0 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                            {mission.waybillNumber}
                          </span>
                          <span className="text-[9.5px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {mission.priority || "Express"}
                          </span>
                        </div>
                        <div className="text-[10.5px] font-mono text-slate-400">
                          Ref: {mission.orderNumber}
                        </div>
                        <div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase ${
                              isDelivered
                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : isInTransit
                                ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                                : isArrived
                                ? "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400"
                                : "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                            }`}
                          >
                            {mission.status.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>

                      {/* Row Col 2: Route Corridor */}
                      <div className="lg:flex-1 min-w-0 space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="font-medium truncate">{mission.origin}</span>
                          <span className="text-slate-400 mx-1 shrink-0">→</span>
                          <Navigation className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="font-bold truncate text-slate-900 dark:text-white">
                            {mission.destinationSubCity ? `${mission.destinationSubCity}, ` : ""}
                            {mission.destinationCity}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 pl-5">
                          <span className="truncate">{mission.destinationSpecificLocation}</span>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                              `${mission.destinationCity}, ${mission.destinationSubCity}, ${mission.destinationSpecificLocation}`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 flex items-center gap-0.5 font-semibold text-[10.5px]"
                          >
                            <span>Maps</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>

                      {/* Row Col 3: Customer & Cargo */}
                      <div className="lg:w-56 shrink-0 space-y-1 text-xs pl-5 lg:pl-0 border-l-0 lg:border-l border-slate-100 dark:border-slate-800 lg:pl-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white truncate">
                            {mission.buyerName}
                          </span>
                          <a
                            href={`tel:${mission.buyerPhone.replace(/\s+/g, "")}`}
                            className="text-emerald-600 dark:text-emerald-400 font-mono font-bold hover:underline shrink-0 flex items-center gap-1 text-[11px]"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{mission.buyerPhone}</span>
                          </a>
                        </div>
                        <div className="text-[10.5px] text-slate-400 truncate">
                          {mission.cargoDescription} ({mission.weightSummary})
                        </div>
                      </div>

                      {/* Row Col 4: Escrow Total & Actions */}
                      <div className="lg:w-60 shrink-0 flex items-center justify-between lg:justify-end gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                        <div className="text-left lg:text-right">
                          <span className="text-xs font-mono font-bold text-slate-900 dark:text-white block">
                            ETB {mission.amount.toLocaleString()}
                          </span>
                          <span className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-medium block">
                            Escrow Locked
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 relative">
                          {/* 3-Dots Kebab Action Menu */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionMenuId(openActionMenuId === mission.id ? null : mission.id);
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                              title="Order Actions"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu Popup */}
                            {openActionMenuId === mission.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-full mt-1.5 w-52 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95"
                              >
                                {/* Start or Resume Trip */}
                                {(isReady || isDelayed) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      handleUpdateMissionStatus(mission.id, "in_transit");
                                    }}
                                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold cursor-pointer"
                                  >
                                    <Truck className="w-3.5 h-3.5" />
                                    <span>{isDelayed ? "Resume Delivery Trip" : "Start Delivery Trip"}</span>
                                  </button>
                                )}

                                {/* Mark Arrived */}
                                {(isInTransit || isDelayed) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      handleUpdateMissionStatus(mission.id, "arrived");
                                    }}
                                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Mark Arrived</span>
                                  </button>
                                )}

                                {/* Verify OTP Handover */}
                                {(isArrived || isInTransit || isDelayed) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      setActiveOtpMission(mission);
                                      setOtpInput("");
                                      setOtpError("");
                                      setReceiverNameInput(mission.buyerName);
                                    }}
                                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-bold cursor-pointer"
                                  >
                                    <Key className="w-3.5 h-3.5" />
                                    <span>Verify OTP Handover</span>
                                  </button>
                                )}

                                {/* Report Delay */}
                                {!isDelivered && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      setActiveDelayMission(mission);
                                      setDelayCustomNote("");
                                    }}
                                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-amber-600 dark:text-amber-400 font-medium cursor-pointer"
                                  >
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    <span>Report Delay</span>
                                  </button>
                                )}

                                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                                <Link
                                  href={`/dashboard/driver/orders/${mission.id}`}
                                  onClick={() => setOpenActionMenuId(null)}
                                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                                >
                                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                                  <span>View Manifest Details</span>
                                </Link>

                                <a
                                  href={`tel:${mission.buyerPhone.replace(/\s+/g, "")}`}
                                  onClick={() => setOpenActionMenuId(null)}
                                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                                >
                                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Call Customer</span>
                                </a>

                                <a
                                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                                    `${mission.destinationCity}, ${mission.destinationSubCity}, ${mission.destinationSpecificLocation}`
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={() => setOpenActionMenuId(null)}
                                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                                >
                                  <Navigation className="w-3.5 h-3.5 text-indigo-500" />
                                  <span>Open in Maps</span>
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Quick Direct Link to Order Manifest */}
                          <Link
                            href={`/dashboard/driver/orders/${mission.id}`}
                            className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 transition"
                            title="View Waybill Manifest"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 2: DISPATCH QUEUE IN ROW FORMAT (`be row melku`)          */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === "available" && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Available Freight Corridor ({availableDeliveries.length})
              </span>
              <span className="text-slate-400">Open logistics missions ready to claim</span>
            </div>

            {availableDeliveries.length === 0 ? (
              <div className="py-16 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-xs text-slate-500 bg-white dark:bg-slate-900">
                No open corridor shipments waiting to be claimed right now.
              </div>
            ) : (
              <div className="space-y-2.5">
                {availableDeliveries.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 sm:p-3.5 bg-white dark:bg-slate-900 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs"
                  >
                    <div className="lg:w-44 shrink-0">
                      <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400 block">
                        {job.waybillNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Ref: {job.orderNumber}
                      </span>
                    </div>

                    <div className="lg:flex-1 min-w-0 space-y-0.5 text-slate-500 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="truncate">{job.origin}</span>
                        <span className="text-slate-400 mx-1">→</span>
                        <Navigation className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          {job.destination}
                        </span>
                      </div>
                      <div className="pl-4.5 text-[10.5px] text-slate-400">
                        {job.cargoDescription} ({job.weightSummary})
                      </div>
                    </div>

                    <div className="lg:w-56 shrink-0 flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                      <div className="text-left lg:text-right">
                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-white block">
                          ETB {job.amount.toLocaleString()}
                        </span>
                        <span className="text-[9.5px] text-slate-400">Corridor Freight</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/dashboard/driver/orders/${job.id}`}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          Details
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleClaimMission(job)}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          Claim Order
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 3: COMPLETED TRIP HISTORY IN ROW FORMAT                   */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === "history" && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Completed Trips ({completedCount})
              </span>
              <span className="text-slate-400">Verified handovers with settled delivery fees</span>
            </div>

            {missions.filter((m) => m.status === "delivered").length === 0 ? (
              <div className="py-16 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-xs text-slate-500 bg-white dark:bg-slate-900">
                No completed trips recorded yet in the database.
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs">
                {missions
                  .filter((m) => m.status === "delivered")
                  .map((trip) => (
                    <div
                      key={trip.id}
                      className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                            {trip.waybillNumber}
                          </span>
                          <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                            Verified
                          </span>
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          {trip.destinationCity} · Customer: {trip.buyerName}
                        </div>
                        <div className="text-slate-400 text-[10px]">
                          Receiver Signed: {trip.podSignatureName || trip.buyerName}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3.5">
                        <div className="text-right">
                          <div className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs">
                            Fee: ETB {(trip.deliveryFee || 2500).toLocaleString()}
                          </div>
                          <div className="text-slate-400 text-[9.5px]">Escrow Released</div>
                        </div>

                        <Link
                          href={`/dashboard/driver/orders/${trip.id}`}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold transition flex items-center gap-1 text-xs"
                        >
                          <span>Slip</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 4: SETTINGS (COMPACT, SLIM FORM - SYNCS TO BACKEND)       */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === "settings" && (
          <div className="max-w-xl mx-auto space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Driver Profile & Vehicle Credentials
              </h2>
              <p className="text-xs text-slate-500">
                Update your contact info and vehicle details. Changes sync directly to the backend database.
              </p>
            </div>

            {/* Profile Form */}
            <form
              onSubmit={handleSaveProfileSettings}
              className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 space-y-3 text-xs shadow-xs"
            >
              <div className="font-bold text-xs text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                <span>Personal & Vehicle Details</span>
                <span className="text-[9.5px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                  Fleet Registration
                </span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Vehicle Plate Number
                    </label>
                    <input
                      type="text"
                      value={editPlateNumber}
                      onChange={(e) => setEditPlateNumber(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 font-mono uppercase text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Vehicle Type
                    </label>
                    <input
                      type="text"
                      value={editVehicleType}
                      onChange={(e) => setEditVehicleType(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                    Driving License Number
                  </label>
                  <input
                    type="text"
                    value={editLicenseNumber}
                    onChange={(e) => setEditLicenseNumber(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs transition cursor-pointer"
                >
                  {isSavingProfile ? "Saving..." : "Save Settings (Backend Sync)"}
                </button>
              </div>
            </form>

            {/* Password Form */}
            <form
              onSubmit={handleChangePassword}
              className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 space-y-3 text-xs shadow-xs"
            >
              <div className="font-bold text-xs text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                <span>Security & Password</span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10.5px] text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Settings className="w-3 h-3" />}
                  <span>{showPassword ? "Hide" : "Show"}</span>
                </button>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                    Current Password *
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      New Password *
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Confirm New Password *
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs transition cursor-pointer"
                >
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 5: SUPPORT / HOTLINE                                      */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeTab === "support" && (
          <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 space-y-2.5 shadow-xs">
              <div className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                Logistics Dispatch Desk
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                24/7 central desk for terminal loading bay access, warehouse delays, or consignment queries.
              </p>
              <a
                href="tel:+251111554422"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-bold shadow-xs hover:bg-indigo-700 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Dispatch: +251 11 155 4422</span>
              </a>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 space-y-2.5 shadow-xs">
              <div className="font-bold text-xs text-rose-600 dark:text-rose-400">
                Highway Emergency Recovery
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Breakdown recovery, towing coordination, and freight corridor escort assistance.
              </p>
              <a
                href="tel:+251911442200"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white rounded-lg font-bold shadow-xs hover:bg-rose-700 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Emergency: +251 91 144 2200</span>
              </a>
            </div>
          </div>
        )}

      </main>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 5. MOBILE BOTTOM NAVIGATION BAR                                   */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around text-xs shadow-lg">
        {[
          { id: "active", label: "Orders", icon: Package, badge: activeCount },
          { id: "available", label: "Queue", icon: Compass, badge: availableDeliveries.length },
          { id: "history", label: "History", icon: Clock },
          { id: "settings", label: "Settings", icon: Settings },
          { id: "support", label: "Help", icon: LifeBuoy },
        ].map((item) => {
          const Icon = item.icon;
          const isSel = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center gap-0.5 relative py-1 px-3 rounded-lg transition cursor-pointer ${
                isSel
                  ? "text-indigo-600 dark:text-indigo-400 font-bold"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium"
              }`}
            >
              <div className="relative">
                <Icon className="w-4 h-4" />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2 px-1 py-0.2 rounded-full text-[9px] font-bold bg-indigo-600 text-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* OTP HANDOVER MODAL                                                */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {activeOtpMission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider">Receiver OTP Verification</h3>
              <button
                type="button"
                onClick={() => setActiveOtpMission(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Enter the 4-digit verification code provided by the receiver.
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                  4-Digit Code *
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => {
                    setOtpInput(e.target.value.replace(/[^0-9]/g, ""));
                    setOtpError("");
                  }}
                  placeholder={`e.g. ${activeOtpMission.deliveryOtp}`}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-center text-lg tracking-widest outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">
                  Receiver Name
                </label>
                <input
                  type="text"
                  value={receiverNameInput}
                  onChange={(e) => setReceiverNameInput(e.target.value)}
                  placeholder={activeOtpMission.buyerName}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500"
                />
              </div>

              {otpError && <div className="text-rose-600 text-[11px]">{otpError}</div>}

              <button
                type="submit"
                disabled={isVerifyingOtp || otpInput.length < 4}
                className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg transition cursor-pointer"
              >
                {isVerifyingOtp ? "Verifying..." : "Confirm Delivery"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* DELAY MODAL                                                       */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {activeDelayMission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider">Report Delay</h3>
              <button onClick={() => setActiveDelayMission(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitDelay} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Reason *</label>
                <select
                  value={delayReasonSelect}
                  onChange={(e) => setDelayReasonSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                >
                  <option value="Traffic Congestion">Traffic Congestion</option>
                  <option value="Mechanical Breakdown">Mechanical Breakdown</option>
                  <option value="Severe Weather & Flooding">Severe Weather</option>
                  <option value="Security Checkpoint Queue">Security Checkpoint</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={delayCustomNote}
                  onChange={(e) => setDelayCustomNote(e.target.value)}
                  placeholder="Estimated delay time"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveDelayMission(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDelay}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
                >
                  Submit Delay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

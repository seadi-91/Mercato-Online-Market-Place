"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  UserPlus,
  Truck,
  Building,
  Phone,
  Mail,
  Shield,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  Filter,
  Trash2,
  Copy,
  Check,
  X,
  Plus,
  Sparkles,
  Navigation,
  RotateCcw,
  Smartphone,
  Info,
  Car,
  BadgeCheck,
  ExternalLink,
  MoreVertical,
  UserCheck,
  UserX,
} from "lucide-react";
import { PageHeader } from "../shared/page-header";
import { useSupplierStore } from "@/store/supplier-store";
import { useAuthStore } from "@/store/auth-store";
import { useThemeStore } from "@/store/theme-store";
import { SupplierStaff, StaffRole } from "@/types/supplier";
import { toast } from "sonner";

export function SupplierTeamView() {
  const {
    staffList,
    addStaff,
    updateStaff,
    deleteStaff,
    warehouses,
    setActiveTab,
    currentStaffUser,
  } = useSupplierStore();
  const { user } = useAuthStore();

  const isBranchManager = user?.staffRole === "branch_manager" || currentStaffUser?.role === "branch_manager";
  const userBranchId = user?.branchId || currentStaffUser?.branchId;
  const userBranchName = user?.branchName || currentStaffUser?.branchName;

  const { theme } = useThemeStore();
  const isLight = theme === "light";
  const isSystem = theme === "system";

  // Filter States
  const [activeRoleTab, setActiveRoleTab] = useState<"all" | "branch_manager" | "driver" | "warehouse_lead">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState<string>("all");

  // Modals & States
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Add Staff Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("staff123");
  const [phone, setPhone] = useState("+251 9");
  const [role, setRole] = useState<StaffRole>("branch_manager");
  const [branchId, setBranchId] = useState(warehouses[0]?.id || "wh-aa");
  const [employeeId, setEmployeeId] = useState(`EMP-${Math.floor(100 + Math.random() * 900)}`);
  const [nationalIdOrFayda, setNationalIdOrFayda] = useState("");
  const [notes, setNotes] = useState("");

  // Driver Specific Form State
  const [assignedVehicleType, setAssignedVehicleType] = useState("Mercedes Actros 40-Ton Heavy Trailer");
  const [assignedVehiclePlate, setAssignedVehiclePlate] = useState("Plate AA-3-98210");
  const [driverLicenseNumber, setDriverLicenseNumber] = useState("ETH-DL-COMM-8921");
  const [driverLicenseGrade, setDriverLicenseGrade] = useState("Grade 4 Commercial Heavy Vehicle");
  const [currentDriverStatus, setCurrentDriverStatus] = useState<"available" | "on_route" | "loading" | "off_duty">("available");

  // Strict Isolation: Branch managers ONLY see drivers assigned to their branch!
  const scopedStaffList = useMemo(() => {
    if (isBranchManager && userBranchId) {
      return staffList.filter((s) => s.role === "driver" && s.branchId === userBranchId);
    }
    return staffList;
  }, [staffList, isBranchManager, userBranchId]);

  // Summary Counters
  const totalStaff = scopedStaffList.length;
  const branchManagers = useMemo(() => isBranchManager ? [] : scopedStaffList.filter((s) => s.role === "branch_manager"), [scopedStaffList, isBranchManager]);
  const fleetDrivers = useMemo(() => scopedStaffList.filter((s) => s.role === "driver"), [scopedStaffList]);
  const warehouseLeads = useMemo(() => isBranchManager ? [] : scopedStaffList.filter((s) => s.role === "warehouse_lead" || s.role === "sales_officer"), [scopedStaffList, isBranchManager]);

  const driversOnRouteCount = useMemo(
    () => fleetDrivers.filter((d) => d.currentDriverStatus === "on_route").length,
    [fleetDrivers]
  );
  const driversAvailableCount = useMemo(
    () => fleetDrivers.filter((d) => d.currentDriverStatus === "available").length,
    [fleetDrivers]
  );

  // Filter list by search query and branch
  const filterList = (list: SupplierStaff[]) => {
    return list.filter((staff) => {
      const matchesSearch =
        !searchQuery.trim() ||
        staff.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.phone.includes(searchQuery) ||
        (staff.assignedVehiclePlate && staff.assignedVehiclePlate.toLowerCase().includes(searchQuery.toLowerCase())) ||
        staff.branchName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBranch = isBranchManager ? true : (branchFilter === "all" || staff.branchId === branchFilter);
      return matchesSearch && matchesBranch;
    });
  };

  const displayedBranchManagers = useMemo(() => filterList(branchManagers), [branchManagers, searchQuery, branchFilter]);
  const displayedDrivers = useMemo(() => filterList(fleetDrivers), [fleetDrivers, searchQuery, branchFilter]);
  const displayedWarehouseLeads = useMemo(() => filterList(warehouseLeads), [warehouseLeads, searchQuery, branchFilter]);

  const displayedAll = useMemo(() => {
    if (isBranchManager) return displayedDrivers;
    if (activeRoleTab === "branch_manager") return displayedBranchManagers;
    if (activeRoleTab === "driver") return displayedDrivers;
    if (activeRoleTab === "warehouse_lead") return displayedWarehouseLeads;
    return [...displayedBranchManagers, ...displayedDrivers, ...displayedWarehouseLeads];
  }, [isBranchManager, activeRoleTab, displayedBranchManagers, displayedDrivers, displayedWarehouseLeads]);

  const handleOpenAddStaff = (presetRole?: StaffRole) => {
    setFullName("");
    setEmail("");
    setPassword("driver123");
    setPhone("+251 9");
    const finalRole: StaffRole = isBranchManager ? "driver" : (presetRole || "branch_manager");
    const finalBranch = isBranchManager && userBranchId ? userBranchId : (warehouses[0]?.id || "wh-aa");
    setRole(finalRole);
    setBranchId(finalBranch);
    setEmployeeId(finalRole === "driver" ? `EMP-DRV-${Math.floor(100 + Math.random() * 900)}` : `EMP-MGR-${Math.floor(100 + Math.random() * 900)}`);
    setNationalIdOrFayda("");
    setNotes("");
    setIsAddStaffOpen(true);
  };

  const handleSaveNewStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error("Please enter the employee full name and email.");
      return;
    }

    // Security guard: Branch manager can ONLY add drivers for their branch
    const finalRole = isBranchManager ? "driver" : role;
    const finalBranchId = isBranchManager && userBranchId ? userBranchId : branchId;

    const assignedWarehouse = warehouses.find((w) => w.id === finalBranchId);
    const finalBranchName = assignedWarehouse ? assignedWarehouse.name : (userBranchName || "Central Logistics Hub");

    addStaff({
      fullName: fullName.trim(),
      email: email.trim(),
      password: password || "driver123",
      phone: phone.trim(),
      role: finalRole,
      branchId: finalBranchId,
      branchName: finalBranchName,
      status: "active",
      employeeId,
      nationalIdOrFayda,
      hireDate: new Date().toISOString().split("T")[0],
      notes,
      ...(finalRole === "driver"
        ? {
            assignedVehicleType,
            assignedVehiclePlate,
            driverLicenseNumber,
            driverLicenseGrade,
            currentDriverStatus,
          }
        : {}),
    });

    toast.success(`Staff member "${fullName}" added successfully.`);
    setIsAddStaffOpen(false);
  };

  const copyEmail = (staff: SupplierStaff) => {
    navigator.clipboard.writeText(staff.email);
    setCopiedEmailId(staff.id);
    toast.success(`Copied email: ${staff.email}`);
    setTimeout(() => setCopiedEmailId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* 1. Header with Breadcrumbs & Actions */}
      <PageHeader
        title={isBranchManager ? `${userBranchName || "Branch"} Fleet Drivers` : "Enterprise Staff & Fleet Management"}
        subtitle={
          isBranchManager
            ? `Manage commercial drivers assigned to ${userBranchName}. Branch managers can only view and register drivers under this branch.`
            : "Manage regional branch managers across Addis Ababa, Modjo, and Hawassa, and oversee commercial transport drivers."
        }
        breadcrumbs={[
          { label: "Dashboard", onClick: () => setActiveTab("dashboard") },
          { label: isBranchManager ? "Branch Drivers" : "Staff Directory" },
        ]}
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 text-xs font-bold text-indigo-300">
            <Users className="h-3.5 w-3.5 text-indigo-400" />
            <span>{totalStaff} {isBranchManager ? "Branch Drivers" : "Active Personnel"}</span>
          </span>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleOpenAddStaff("driver")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3.5 py-2 text-xs font-semibold text-emerald-300 transition-colors cursor-pointer"
            >
              <Truck className="h-4 w-4 text-emerald-400" />
              <span>+ Add Fleet Driver</span>
            </button>

            {!isBranchManager && (
              <button
                onClick={() => handleOpenAddStaff("branch_manager")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                <span>+ Add Branch Manager</span>
              </button>
            )}
          </div>
        }
      />

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Drivers / Personnel */}
        <div
          onClick={() => setActiveRoleTab("all")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeRoleTab === "all"
              ? "border-indigo-500/50 bg-indigo-500/10 shadow-md shadow-indigo-500/10"
              : isLight
              ? "bg-white border-slate-200 shadow-xs"
              : "bg-[#10131c] border-white/10 hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">
              {isBranchManager ? "Branch Drivers" : "Total Personnel"}
            </span>
            <div className="h-8 w-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              {isBranchManager ? <Truck className="h-4 w-4" /> : <Users className="h-4 w-4" />}
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {isBranchManager ? fleetDrivers.length : totalStaff}
            </span>
            <span className="text-[11px] text-indigo-400 font-medium">
              {isBranchManager ? userBranchName?.split(" ")[0] || "Hub" : "All Departments"}
            </span>
          </div>
        </div>

        {/* Available in Yard / Branch Managers */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isLight
              ? "bg-white border-slate-200 shadow-xs"
              : "bg-[#10131c] border-white/10 hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">
              {isBranchManager ? "Available in Depot" : "Branch Managers"}
            </span>
            <div className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              {isBranchManager ? <CheckCircle2 className="h-4 w-4" /> : <Building className="h-4 w-4" />}
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {isBranchManager ? driversAvailableCount : branchManagers.length}
            </span>
            <span className="text-[11px] text-blue-400 font-medium">
              {isBranchManager ? "Ready for Dispatch" : "3 Hubs Covered"}
            </span>
          </div>
        </div>

        {/* Fleet Drivers / Heavy Commercial */}
        <div
          onClick={() => setActiveRoleTab("driver")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeRoleTab === "driver"
              ? "border-emerald-500/50 bg-emerald-500/10 shadow-md shadow-emerald-500/10"
              : isLight
              ? "bg-white border-slate-200 shadow-xs"
              : "bg-[#10131c] border-white/10 hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Commercial Fleet</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {fleetDrivers.length}
            </span>
            <span className="text-[11px] text-emerald-400 font-medium">Assigned Vehicles</span>
          </div>
        </div>

        {/* Active On Route */}
        <div
          className={`p-4 rounded-2xl border ${
            isLight
              ? "bg-white border-slate-200 shadow-xs"
              : "bg-[#10131c] border-white/10"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Drivers On Route</span>
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Navigation className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {driversOnRouteCount}
            </span>
            <span className="text-[11px] text-amber-400 font-medium">Active Transit Runs</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div
        className={`p-4 rounded-2xl border space-y-3 ${
          isLight
            ? "bg-white border-slate-200 shadow-xs"
            : isSystem
            ? "bg-[#0b142c] border-blue-500/20"
            : "bg-[#10131c] border-white/10"
        }`}
      >
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Role Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {isBranchManager ? (
              <div className="flex items-center gap-1.5">
                <span className="rounded-xl px-3.5 py-2 text-xs font-bold bg-emerald-600 text-white shadow-sm flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-white" />
                  <span>Branch Drivers ({fleetDrivers.length})</span>
                </span>
                <span className="text-[11px] text-zinc-400 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                  Depot: <strong>{userBranchName}</strong>
                </span>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setActiveRoleTab("all")}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeRoleTab === "all"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  All Personnel ({totalStaff})
                </button>

                <button
                  onClick={() => setActiveRoleTab("branch_manager")}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeRoleTab === "branch_manager"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Building className="h-3.5 w-3.5 text-blue-400" />
                  <span>Branch Managers ({branchManagers.length})</span>
                </button>

                <button
                  onClick={() => setActiveRoleTab("driver")}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeRoleTab === "driver"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Truck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Fleet Drivers ({fleetDrivers.length})</span>
                </button>

                <button
                  onClick={() => setActiveRoleTab("warehouse_lead")}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeRoleTab === "warehouse_lead"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span>Warehouse Operations ({warehouseLeads.length})</span>
                </button>
              </>
            )}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone, or vehicle plate..."
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-10 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:bg-white/10 focus:outline-hidden transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Branch Filter Pills (Only for Super Supplier) */}
        {!isBranchManager && (
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-white/5 pb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3" />
              <span>Branch Depot:</span>
            </span>

            <button
              onClick={() => setBranchFilter("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                branchFilter === "all"
                  ? "bg-white/15 text-white font-semibold border border-white/20"
                  : "border border-transparent text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              All Regional Hubs (3)
            </button>

            {warehouses.map((wh) => (
              <button
                key={wh.id}
                onClick={() => setBranchFilter(wh.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  branchFilter === wh.id
                    ? "bg-white/15 text-white font-semibold border border-white/20"
                    : "border border-transparent text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {wh.name.split(" ")[0]} ({wh.code})
              </button>
            ))}

            {(searchQuery || branchFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setBranchFilter("all");
                }}
                className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 4. SLEEK HORIZONTAL STAFF DIRECTORY (Horizontal Rows List) */}
      <div className="space-y-3">
        {displayedAll.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-white/10 bg-[#10131c] space-y-3">
            <Users className="h-10 w-10 text-zinc-500 mx-auto" />
            <p className="text-sm font-bold text-white">No Personnel Found</p>
            <p className="text-xs text-zinc-400">
              Try adjusting your search query or role filter, or register a new team member.
            </p>
            <button
              onClick={() => handleOpenAddStaff()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add Staff Member</span>
            </button>
          </div>
        ) : (
          displayedAll.map((staff) => {
            const isManager = staff.role === "branch_manager";
            const isDriver = staff.role === "driver";
            const isCopied = copiedEmailId === staff.id;

            return (
              <div
                key={staff.id}
                className="group p-4 sm:p-5 rounded-2xl border border-white/10 bg-[#10131c] hover:border-indigo-500/40 hover:bg-[#121624] transition-all duration-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-sm"
              >
                {/* Left Column: Avatar, Name, Role Badge, ID */}
                <div className="flex items-center gap-3.5 min-w-[260px] max-w-sm">
                  <div className="relative shrink-0">
                    <img
                      src={
                        staff.avatarUrl ||
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
                      }
                      alt={staff.fullName}
                      className="h-12 w-12 rounded-xl object-cover border border-white/10"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[#10131c] ${
                        staff.status === "active" ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate">{staff.fullName}</h4>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                          isManager
                            ? "bg-blue-500/15 border border-blue-500/30 text-blue-300"
                            : isDriver
                            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                            : "bg-purple-500/15 border border-purple-500/30 text-purple-300"
                        }`}
                      >
                        {isManager ? "Branch Manager" : isDriver ? "Fleet Driver" : "Operations"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                      <span className="font-mono text-[11px] text-zinc-400">{staff.employeeId}</span>
                      {staff.nationalIdOrFayda && (
                        <>
                          <span className="text-zinc-600">•</span>
                          <span className="font-mono text-[11px] text-zinc-400 truncate">
                            {staff.nationalIdOrFayda}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Middle-Left Column: Branch Depot & Vehicle Info */}
                <div className="min-w-[220px] max-w-md space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-200">
                    <Building className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    <span className="font-semibold truncate">{staff.branchName}</span>
                  </div>

                  {isDriver && staff.assignedVehiclePlate ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-bold font-mono text-emerald-300">
                        <Truck className="h-3 w-3" />
                        <span>{staff.assignedVehiclePlate}</span>
                      </span>
                      <span className="text-[11px] text-zinc-400 truncate">
                        {staff.assignedVehicleType}
                      </span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-zinc-400 truncate">
                      {staff.notes || "Authorized for depot inventory manifests and operations."}
                    </p>
                  )}
                </div>

                {/* Middle-Right Column: Contact (Email & Phone) */}
                <div className="min-w-[190px] space-y-1 text-xs text-zinc-300">
                  <p className="flex items-center gap-1.5 truncate">
                    <Mail className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">{staff.email}</span>
                  </p>
                  <p className="flex items-center gap-1.5 font-mono text-zinc-400">
                    <Phone className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span>{staff.phone}</span>
                  </p>
                </div>

                {/* Status Column */}
                <div className="shrink-0">
                  {staff.status === "suspended" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 px-2.5 py-1 text-[11px] font-bold text-rose-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                      <span>Deactivated</span>
                    </span>
                  ) : isDriver ? (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border ${
                        staff.currentDriverStatus === "on_route"
                          ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                          : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          staff.currentDriverStatus === "on_route"
                            ? "bg-amber-400 animate-pulse"
                            : "bg-emerald-400"
                        }`}
                      />
                      <span>{staff.currentDriverStatus === "on_route" ? "On Route" : "Available"}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>Active</span>
                    </span>
                  )}
                </div>

                {/* Right Actions: 3-Dot Dropdown Menu */}
                <div className="relative self-end lg:self-auto shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5 w-full lg:w-auto flex justify-end">
                  <button
                    type="button"
                    onClick={() => setOpenDropdownId(openDropdownId === staff.id ? null : staff.id)}
                    className="h-8 w-8 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title="Actions"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {openDropdownId === staff.id && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpenDropdownId(null)}
                      />
                      <div className="absolute right-0 mt-2 top-full z-50 w-52 rounded-xl border border-white/10 bg-[#0d121f] p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 space-y-1">
                        {/* 1. Copy Email */}
                        <button
                          type="button"
                          onClick={() => {
                            copyEmail(staff);
                            setOpenDropdownId(null);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                        >
                          {isCopied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-indigo-400" />
                          )}
                          <span>{isCopied ? "Email Copied!" : "Copy Email"}</span>
                        </button>

                        {/* 2. Deactivate / Activate Account */}
                        <button
                          type="button"
                          onClick={() => {
                            const newStatus = staff.status === "active" ? "suspended" : "active";
                            updateStaff(staff.id, { status: newStatus });
                            toast.success(
                              newStatus === "active"
                                ? `Account for ${staff.fullName} activated`
                                : `Account for ${staff.fullName} deactivated`
                            );
                            setOpenDropdownId(null);
                          }}
                          className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                            staff.status === "active"
                              ? "text-amber-300 hover:bg-amber-500/10"
                              : "text-emerald-300 hover:bg-emerald-500/10"
                          }`}
                        >
                          {staff.status === "active" ? (
                            <>
                              <UserX className="h-3.5 w-3.5 text-amber-400" />
                              <span>Deactivate Account</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Activate Account</span>
                            </>
                          )}
                        </button>

                        <div className="my-1 border-t border-white/10" />

                        {/* 3. Delete Member */}
                        <button
                          type="button"
                          onClick={() => {
                            deleteStaff(staff.id);
                            setOpenDropdownId(null);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                          <span>Delete Member</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. MODAL: REGISTER STAFF MEMBER OR FLEET DRIVER */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div
            className={`w-full max-w-xl rounded-2xl border shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto ${
              isLight
                ? "bg-white border-slate-200"
                : isSystem
                ? "bg-[#0b142c] border-blue-500/30"
                : "bg-[#101322] border-white/15"
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Register Personnel or Fleet Driver</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Fill in employee credentials. The staff member can immediately sign in at the login page.
                </p>
              </div>
              <button
                onClick={() => setIsAddStaffOpen(false)}
                className="h-8 w-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveNewStaff} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Kassahun Tadesse"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                {/* Staff Role */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Role *</label>
                  {isBranchManager ? (
                    <div className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-xs font-semibold flex items-center gap-2">
                      <Truck className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Commercial Fleet Driver (Branch Locked)</span>
                    </div>
                  ) : (
                    <select
                      value={role}
                      onChange={(e) => {
                        const newRole = e.target.value as StaffRole;
                        setRole(newRole);
                        if (newRole === "driver") {
                          setPassword("driver123");
                        } else {
                          setPassword("manager123");
                        }
                      }}
                      className="w-full rounded-xl border border-white/10 bg-[#161a2b] px-3 py-2 text-white focus:border-indigo-500 focus:outline-hidden"
                    >
                      <option value="branch_manager">Branch Manager</option>
                      <option value="driver">Commercial Fleet Driver</option>
                      <option value="warehouse_lead">Warehouse Operations Lead</option>
                      <option value="sales_officer">Sales & Fulfillment Officer</option>
                    </select>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. kassahun.t@abyssiniasupply.et"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                {/* Password (Masked for Security) */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Initial Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-indigo-500 focus:outline-hidden font-mono"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+251 91 144 2200"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-indigo-500 focus:outline-hidden font-mono"
                  />
                </div>

                {/* Assigned Branch */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Assigned Branch Depot *
                  </label>
                  {isBranchManager ? (
                    <div className="p-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-200 text-xs font-semibold flex items-center gap-2">
                      <Building className="h-4 w-4 text-blue-400 shrink-0" />
                      <span>{userBranchName || "Branch Depot"}</span>
                    </div>
                  ) : (
                    <select
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#161a2b] px-3 py-2 text-white focus:border-indigo-500 focus:outline-hidden"
                    >
                      {warehouses.map((wh) => (
                        <option key={wh.id} value={wh.id}>
                          {wh.name} ({wh.region})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Driver-Specific Vehicle Assignment */}
              {role === "driver" && (
                <div className="p-3.5 rounded-xl border border-emerald-500/25 bg-emerald-500/5 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Truck className="h-4 w-4" />
                    <span>Vehicle Assignment</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-300 font-semibold mb-1">
                        Vehicle Plate Number *
                      </label>
                      <input
                        type="text"
                        value={assignedVehiclePlate}
                        onChange={(e) => setAssignedVehiclePlate(e.target.value)}
                        placeholder="e.g. Plate AA-3-98210"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-emerald-500 focus:outline-hidden font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-300 font-semibold mb-1">
                        Vehicle Model / Type
                      </label>
                      <input
                        type="text"
                        value={assignedVehicleType}
                        onChange={(e) => setAssignedVehicleType(e.target.value)}
                        placeholder="e.g. Mercedes Actros 40-Ton Heavy Trailer"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-300 font-semibold mb-1">
                        Commercial Driver License No.
                      </label>
                      <input
                        type="text"
                        value={driverLicenseNumber}
                        onChange={(e) => setDriverLicenseNumber(e.target.value)}
                        placeholder="e.g. ETH-DL-COMM-8921"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-emerald-500 focus:outline-hidden font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-300 font-semibold mb-1">License Grade</label>
                      <select
                        value={driverLicenseGrade}
                        onChange={(e) => setDriverLicenseGrade(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#161a2b] px-3 py-2 text-white focus:border-emerald-500 focus:outline-hidden"
                      >
                        <option value="Grade 4 Commercial Heavy Vehicle">Grade 4 Commercial Heavy Vehicle</option>
                        <option value="Grade 3 Commercial Medium Truck">Grade 3 Commercial Medium Truck</option>
                        <option value="Public Freight & Cargo Permit">Public Freight & Cargo Permit</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Employee ID & National ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-indigo-500 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">National ID / Fayda</label>
                  <input
                    type="text"
                    value={nationalIdOrFayda}
                    onChange={(e) => setNationalIdOrFayda(e.target.value)}
                    placeholder="e.g. FYD-9812-4412-09"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-indigo-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Responsibilities Notes */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Notes / Authority</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Authorized to verify inward shipments and release warehouse manifests."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-zinc-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2 font-bold text-white shadow-xs cursor-pointer"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

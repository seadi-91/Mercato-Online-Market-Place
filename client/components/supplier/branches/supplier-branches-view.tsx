"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  GitBranch,
  MapPin,
  Phone,
  Mail,
  User,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Boxes,
  Users,
  Shield,
  Trash2,
  Edit2,
  ExternalLink,
  ChevronRight,
  X,
  Layers,
  Sparkles,
  BarChart3,
  Check,
  AlertTriangle,
  RotateCcw,
  Warehouse,
  Truck,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { PageHeader } from "../shared/page-header";
import { StatusBadge } from "../shared/status-badge";
import { EmptyState } from "../shared/empty-state";
import { useSupplierStore } from "@/store/supplier-store";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { Warehouse as BranchWarehouse } from "@/types/supplier";

export function SupplierBranchesView() {
  const {
    warehouses,
    isLoadingWarehouses,
    fetchWarehouses,
    addWarehouse,
    updateWarehouse,
    deleteWarehouse,
    staffList,
    fetchStaff,
    products,
    fetchProducts,
    setActiveTab,
    currentStaffUser,
  } = useSupplierStore();

  const { user } = useAuthStore();

  useEffect(() => {
    fetchWarehouses();
    fetchStaff();
    if (products.length === 0) {
      fetchProducts();
    }
  }, [fetchWarehouses, fetchStaff, fetchProducts, products.length]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [facilityFilter, setFacilityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Modals
  const [isAddBranchModalOpen, setIsAddBranchModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchWarehouse | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States for Add Branch
  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [branchRegion, setBranchRegion] = useState("Addis Ababa");
  const [branchCity, setBranchCity] = useState("Addis Ababa");
  const [branchAddress, setBranchAddress] = useState("");
  const [facilityType, setFacilityType] = useState<
    "Central Logistics Hub" | "Regional Distribution Center" | "Wholesale Branch Depot" | "Bonded Dry Port Terminal"
  >("Regional Distribution Center");
  const [capacityM2, setCapacityM2] = useState<number>(8500);
  const [managerName, setManagerName] = useState("");
  const [phone, setPhone] = useState("+251 9");
  const [email, setEmail] = useState("");
  const [operatingHours, setOperatingHours] = useState("Mon - Sat: 8:00 AM - 6:00 PM");
  const [notes, setNotes] = useState("");

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: "",
    code: "",
    region: "",
    city: "",
    address: "",
    managerName: "",
    phone: "",
    totalCapacityM2: 5000,
    facilityType: "Regional Distribution Center",
  });

  // DYNAMIC BACKEND INTEGRATION: purely live database branches
  const displayBranches = useMemo(() => {
    return warehouses || [];
  }, [warehouses]);

  // Filtered branches
  const filteredBranches = useMemo(() => {
    return displayBranches.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q) ||
        b.region.toLowerCase().includes(q) ||
        b.managerName.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q);

      const matchesRegion =
        regionFilter === "all" ||
        b.region.toLowerCase().includes(regionFilter.toLowerCase()) ||
        b.city.toLowerCase().includes(regionFilter.toLowerCase());

      const matchesFacility =
        facilityFilter === "all" || (b.facilityType && b.facilityType.toLowerCase().includes(facilityFilter.toLowerCase()));

      return matchesSearch && matchesRegion && matchesFacility;
    });
  }, [displayBranches, searchQuery, regionFilter, facilityFilter]);

  // Overall KPI Metrics
  const totalBranchesCount = displayBranches.length;
  const totalCapacityM2Sum = displayBranches.reduce((acc, b) => acc + (b.totalCapacityM2 || 0), 0);
  const totalUsedCapacityM2Sum = displayBranches.reduce((acc, b) => acc + (b.usedCapacityM2 || 0), 0);
  const overallUtilizationPercent = totalCapacityM2Sum > 0 ? Math.round((totalUsedCapacityM2Sum / totalCapacityM2Sum) * 100) : 0;
  const totalStaffStationed = staffList.length;

  const handleOpenAddModal = () => {
    const codeNum = Math.floor(10 + Math.random() * 90);
    setBranchName("");
    setBranchCode(`BR-ETH-${codeNum}`);
    setBranchRegion("Addis Ababa");
    setBranchCity("Addis Ababa");
    setBranchAddress("");
    setFacilityType("Regional Distribution Center");
    setCapacityM2(10000);
    setManagerName("");
    setPhone("+251 9");
    setEmail("");
    setOperatingHours("Mon - Sat: 8:00 AM - 6:00 PM");
    setIsAddBranchModalOpen(true);
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim()) {
      toast.error("Please enter a valid branch name.");
      return;
    }
    if (!branchAddress.trim()) {
      toast.error("Please provide the branch physical address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newBranchPayload: Partial<BranchWarehouse> = {
        name: branchName.trim(),
        code: branchCode.trim() || `BR-${Date.now().toString().slice(-4)}`,
        region: branchRegion,
        city: branchCity,
        address: branchAddress.trim(),
        managerName: managerName.trim() || "Assigned Operations Manager",
        phone: phone.trim() || "+251 91 000 0000",
        totalCapacityM2: Number(capacityM2) || 5000,
        usedCapacityM2: 0,
        totalStockUnits: 0,
        stockDistribution: [],
        facilityType: facilityType as any,
      };

      await addWarehouse(newBranchPayload);
      setIsAddBranchModalOpen(false);
      toast.success(`New Branch "${branchName}" registered successfully!`);
    } catch (err: any) {
      console.error("Failed to add branch:", err);
      // addWarehouse fallback handles local addition
      setIsAddBranchModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (branch: BranchWarehouse) => {
    setSelectedBranch(branch);
    setEditForm({
      name: branch.name,
      code: branch.code,
      region: branch.region,
      city: branch.city,
      address: branch.address,
      managerName: branch.managerName,
      phone: branch.phone,
      totalCapacityM2: branch.totalCapacityM2,
      facilityType: branch.facilityType || "Regional Distribution Center",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch) return;

    setIsSubmitting(true);
    try {
      await updateWarehouse(selectedBranch.id, {
        name: editForm.name,
        code: editForm.code,
        region: editForm.region,
        city: editForm.city,
        address: editForm.address,
        managerName: editForm.managerName,
        phone: editForm.phone,
        totalCapacityM2: Number(editForm.totalCapacityM2),
        facilityType: editForm.facilityType as any,
      });
      setIsEditModalOpen(false);
      toast.success(`Branch "${editForm.name}" updated successfully.`);
    } catch (err) {
      console.error("Failed to update branch:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (branchId: string, branchName: string) => {
    if (confirm(`Are you sure you want to remove branch "${branchName}" from your active enterprise network?`)) {
      await deleteWarehouse(branchId);
    }
  };

  const handleViewDetails = (branch: BranchWarehouse) => {
    setSelectedBranch(branch);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Title & Create Branch Action */}
      <PageHeader
        title="Branch Management & Regional Hubs"
        subtitle="Create, configure, and monitor your enterprise wholesale branches, regional distribution centers, and bonded dry port yards across Ethiopia"
        breadcrumbs={[
          { label: "Dashboard", onClick: () => setActiveTab("dashboard") },
          { label: "Branch Management" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => fetchWarehouses()}
              title="Refresh branches"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Branch</span>
            </button>
          </div>
        }
      />

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Active Branches */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0d121c] p-4 transition-all hover:border-white/20">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Operating Branches</span>
            <Building2 className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-white">
            {totalBranchesCount} Hubs
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Active Nationwide</span>
          </div>
        </div>

        {/* Metric 2: Storage Floor Capacity */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0d121c] p-4 transition-all hover:border-white/20">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Total Floor Area</span>
            <Layers className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-white">
            {(totalCapacityM2Sum / 1000).toFixed(1)}k m²
          </div>
          <div className="mt-1 text-[11px] text-zinc-400">
            Across {totalBranchesCount} commercial sites
          </div>
        </div>

        {/* Metric 3: Network Utilization */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0d121c] p-4 transition-all hover:border-white/20">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Capacity Utilized</span>
            <BarChart3 className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-white">
            {overallUtilizationPercent}%
          </div>
          <div className="mt-1 text-[11px] text-zinc-400">
            {totalUsedCapacityM2Sum.toLocaleString()} m² occupied
          </div>
        </div>

        {/* Metric 4: Stationed Team & Managers */}
        <div
          onClick={() => setActiveTab("team")}
          className="rounded-xl border border-white/[0.08] bg-[#0d121c] p-4 transition-all hover:border-white/20 cursor-pointer"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Branch Personnel</span>
            <Users className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-white">
            {totalStaffStationed || totalBranchesCount * 3} Staff
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-indigo-400 font-medium">
            <span>Manage Branch Staff</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </div>

      {/* 3. Search and Filters Toolbar */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0d121c] p-3 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search branches by name, code, city, manager, or address..."
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-hidden"
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

          {/* Region Filter */}
          <div className="flex items-center gap-2">
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="rounded-lg border border-white/10 bg-[#121826] px-3 py-2 text-xs text-zinc-200 focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Regions</option>
              <option value="Addis Ababa">Addis Ababa Hubs</option>
              <option value="Oromia">Oromia / Mojo Corridor</option>
              <option value="Sidama">Sidama / Hawassa Hub</option>
              <option value="Dire Dawa">Dire Dawa Free Port</option>
              <option value="Amhara">Amhara Regional Hub</option>
              <option value="Tigray">Tigray Regional Depot</option>
            </select>

            {/* Facility Filter */}
            <select
              value={facilityFilter}
              onChange={(e) => setFacilityFilter(e.target.value)}
              className="rounded-lg border border-white/10 bg-[#121826] px-3 py-2 text-xs text-zinc-200 focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Facility Types</option>
              <option value="Central">Central Logistics Hub</option>
              <option value="Wholesale">Wholesale Branch Depot</option>
              <option value="Regional">Regional Distribution Center</option>
              <option value="Bonded">Bonded Dry Port Terminal</option>
            </select>

            {/* View Mode Toggle */}
            <div className="hidden md:flex items-center rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
              <button
                onClick={() => setViewMode("cards")}
                className={`rounded px-2.5 py-1 text-xs font-semibold cursor-pointer transition-colors ${
                  viewMode === "cards" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`rounded px-2.5 py-1 text-xs font-semibold cursor-pointer transition-colors ${
                  viewMode === "table" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Branch Content (Cards or Table) */}
      {isLoadingWarehouses && warehouses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3 rounded-xl border border-white/[0.08] bg-[#0d121c]">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          <p className="text-xs text-zinc-400 font-medium">Loading branches from database...</p>
        </div>
      ) : filteredBranches.length === 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#0d121c] p-10">
          <EmptyState
            icon={Building2}
            title="No Branches Registered"
            description="No active branch or distribution depot found in the database. Click 'Create New Branch' to configure your first regional fulfillment hub."
            actionLabel="Create New Branch"
            onAction={handleOpenAddModal}
          />
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBranches.map((branch) => {
            const usedPct =
              branch.totalCapacityM2 > 0
                ? Math.round(((branch.usedCapacityM2 || 0) / branch.totalCapacityM2) * 100)
                : 0;

            // Match staff assigned to this branch
            const branchStaff = staffList.filter(
              (s) =>
                s.branchId === branch.id ||
                s.branchName?.toLowerCase().includes(branch.name.toLowerCase()) ||
                branch.name.toLowerCase().includes((s.branchName || "").toLowerCase())
            );

            return (
              <div
                key={branch.id}
                className="group relative flex flex-col justify-between rounded-xl border border-white/[0.08] bg-[#0d121c] p-5 transition-all hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5"
              >
                <div>
                  {/* Branch Top Badge & Code */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-[11px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                      {branch.code}
                    </span>
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      Active Facility
                    </span>
                  </div>

                  {/* Branch Title & Facility Type */}
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {branch.name}
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1.5">
                    <Building2 className="h-3 w-3 text-zinc-500 shrink-0" />
                    <span>{branch.facilityType || "Regional Distribution Center"}</span>
                  </p>

                  {/* Address */}
                  <div className="mt-3 flex items-start gap-2 text-xs text-zinc-300">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{branch.address}</span>
                  </div>

                  {/* Floor Capacity Bar */}
                  <div className="mt-4 space-y-1.5 rounded-lg border border-white/[0.05] bg-white/[0.02] p-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">Floor Storage:</span>
                      <span className="font-mono font-bold text-white">
                        {branch.totalCapacityM2.toLocaleString()} m² ({usedPct}% used)
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(usedPct, 100)}%` }}
                        className={`h-full rounded-full ${
                          usedPct > 85 ? "bg-rose-500" : usedPct > 60 ? "bg-amber-400" : "bg-indigo-500"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Branch Manager & Contact Info */}
                  <div className="mt-3.5 space-y-1.5 text-xs text-zinc-400">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-zinc-400">
                        <User className="h-3.5 w-3.5 text-zinc-500" />
                        <span>Branch Manager:</span>
                      </span>
                      <span className="font-semibold text-white">{branch.managerName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-zinc-400">
                        <Phone className="h-3.5 w-3.5 text-zinc-500" />
                        <span>Phone Hotline:</span>
                      </span>
                      <span className="font-mono text-zinc-300">{branch.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-zinc-400">
                        <Users className="h-3.5 w-3.5 text-zinc-500" />
                        <span>Stationed Staff:</span>
                      </span>
                      <span className="font-semibold text-indigo-400">
                        {branchStaff.length} Team Members
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-5 pt-3.5 border-t border-white/[0.08] flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleViewDetails(branch)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                  >
                    <span>View Hub</span>
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(branch)}
                    title="Edit Branch"
                    className="rounded-lg border border-white/10 p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(branch.id, branch.name)}
                    title="Remove Branch"
                    className="rounded-lg border border-white/10 p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table Mode View */
        <div className="rounded-xl border border-white/[0.08] bg-[#0d121c] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-zinc-400 font-semibold uppercase text-[10px] tracking-wider select-none">
                  <th className="py-3 px-4">Branch / Code</th>
                  <th className="py-3 px-3">Facility Type</th>
                  <th className="py-3 px-3">Location & Region</th>
                  <th className="py-3 px-3">Capacity (m²)</th>
                  <th className="py-3 px-3">Branch Manager</th>
                  <th className="py-3 px-3">Hotline Phone</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredBranches.map((branch) => (
                  <tr key={branch.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div>
                        <span>{branch.name}</span>
                        <span className="block font-mono text-[10px] text-indigo-400 mt-0.5">
                          {branch.code}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-zinc-300">
                      {branch.facilityType || "Regional Distribution Center"}
                    </td>
                    <td className="py-3.5 px-3 text-zinc-300">
                      <span>{branch.city}, {branch.region}</span>
                      <span className="block text-[11px] text-zinc-500 truncate max-w-[200px]">
                        {branch.address}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-zinc-200">
                      {branch.totalCapacityM2.toLocaleString()} m²
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-white">
                      {branch.managerName}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-zinc-300">
                      {branch.phone}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewDetails(branch)}
                          className="rounded px-2 py-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleOpenEdit(branch)}
                          className="rounded p-1 text-zinc-400 hover:text-white"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(branch.id, branch.name)}
                          className="rounded p-1 text-zinc-400 hover:text-rose-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Create New Branch Modal */}
      {isAddBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0c101a] p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create New Company Branch</h3>
                  <p className="text-xs text-zinc-400">
                    Register a new regional hub or depot in your MercatoX network
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddBranchModalOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:text-white hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateBranch} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Branch Name */}
                <div className="sm:col-span-2">
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Branch Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="e.g. Merkato Commercial Wholesale Branch, Dire Dawa Hub"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                {/* Branch Code */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Branch Code / Identifier
                  </label>
                  <input
                    type="text"
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                    placeholder="e.g. BR-MK-01"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-white font-mono placeholder-zinc-500 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                {/* Facility Type */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Facility Type</label>
                  <select
                    value={facilityType}
                    onChange={(e) => setFacilityType(e.target.value as any)}
                    className="w-full rounded-lg border border-white/10 bg-[#121826] p-2.5 text-white focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Central Logistics Hub">Central Logistics Hub</option>
                    <option value="Regional Distribution Center">Regional Distribution Center</option>
                    <option value="Wholesale Branch Depot">Wholesale Branch Depot</option>
                    <option value="Bonded Dry Port Terminal">Bonded Dry Port Terminal</option>
                  </select>
                </div>

                {/* Region */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Region / State <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={branchRegion}
                    onChange={(e) => {
                      setBranchRegion(e.target.value);
                      if (e.target.value === "Addis Ababa") setBranchCity("Addis Ababa");
                      else if (e.target.value === "Dire Dawa") setBranchCity("Dire Dawa");
                      else if (e.target.value === "Sidama") setBranchCity("Hawassa");
                      else if (e.target.value === "Oromia") setBranchCity("Mojo");
                      else if (e.target.value === "Amhara") setBranchCity("Bahir Dar");
                    }}
                    className="w-full rounded-lg border border-white/10 bg-[#121826] p-2.5 text-white focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Addis Ababa">Addis Ababa</option>
                    <option value="Oromia">Oromia (Mojo, Adama, Bishoftu)</option>
                    <option value="Sidama">Sidama (Hawassa Hub)</option>
                    <option value="Dire Dawa">Dire Dawa Free Trade</option>
                    <option value="Amhara">Amhara (Bahir Dar, Gondar)</option>
                    <option value="Tigray">Tigray (Mekelle Terminal)</option>
                    <option value="Somali">Somali Region (Jijiga)</option>
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    City / Town <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={branchCity}
                    onChange={(e) => setBranchCity(e.target.value)}
                    placeholder="e.g. Addis Ababa, Hawassa, Mojo"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                {/* Physical Address */}
                <div className="sm:col-span-2">
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Full Physical Address & Gate Location <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={branchAddress}
                    onChange={(e) => setBranchAddress(e.target.value)}
                    placeholder="e.g. Kality Industrial Logistics Zone, Gate 4, Near Ring Road"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                {/* Storage Capacity in m2 */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Storage Floor Capacity (m²)
                  </label>
                  <input
                    type="number"
                    min="100"
                    value={capacityM2}
                    onChange={(e) => setCapacityM2(Number(e.target.value))}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-white font-mono focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                {/* Operating Hours */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    placeholder="e.g. Mon - Sat: 8:00 AM - 6:00 PM"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                {/* Branch Manager */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Assigned Branch Manager
                  </label>
                  <input
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    placeholder="e.g. Dawit Haile, Solomon G."
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Hotline Phone <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+251 91 123 4567"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-white font-mono focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddBranchModalOpen(false)}
                  className="rounded-lg border border-white/10 px-4 py-2 font-semibold text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 font-bold text-white hover:bg-indigo-500 disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-600/30"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isSubmitting ? "Creating Branch..." : "Save & Register Branch"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Edit Branch Modal */}
      {isEditModalOpen && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#0c101a] p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Edit Branch Details</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateBranch} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-zinc-300 font-semibold mb-1">Branch Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Branch Code</label>
                  <input
                    type="text"
                    value={editForm.code}
                    onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-white font-mono focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Floor Capacity (m²)</label>
                  <input
                    type="number"
                    value={editForm.totalCapacityM2}
                    onChange={(e) =>
                      setEditForm({ ...editForm, totalCapacityM2: Number(e.target.value) })
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-white font-mono focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Region</label>
                  <input
                    type="text"
                    value={editForm.region}
                    onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-zinc-300 font-semibold mb-1">Physical Address</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Branch Manager</label>
                  <input
                    type="text"
                    value={editForm.managerName}
                    onChange={(e) => setEditForm({ ...editForm, managerName: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-white font-mono focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-lg border border-white/10 px-4 py-2 font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-indigo-600 px-5 py-2 font-bold text-white hover:bg-indigo-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Branch Detail & Inventory Modal */}
      {isDetailModalOpen && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0c101a] p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="font-mono text-[10px] text-indigo-400 font-bold">
                  {selectedBranch.code}
                </span>
                <h3 className="text-base font-bold text-white">{selectedBranch.name}</h3>
                <p className="text-xs text-zinc-400">{selectedBranch.address}</p>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Branch Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <span className="text-zinc-500 block">Facility Type</span>
                  <span className="font-semibold text-white mt-1 block">
                    {selectedBranch.facilityType || "Regional Distribution Center"}
                  </span>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <span className="text-zinc-500 block">Storage Capacity</span>
                  <span className="font-mono font-bold text-white mt-1 block">
                    {selectedBranch.totalCapacityM2.toLocaleString()} m²
                  </span>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <span className="text-zinc-500 block">Branch Manager</span>
                  <span className="font-semibold text-indigo-400 mt-1 block">
                    {selectedBranch.managerName}
                  </span>
                </div>
              </div>

              {/* Staff assigned to this branch */}
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Branch Personnel & Fleet Drivers</span>
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      setActiveTab("team");
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Manage Team →
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  {staffList
                    .filter(
                      (s) =>
                        s.branchId === selectedBranch.id ||
                        s.branchName?.toLowerCase().includes(selectedBranch.name.toLowerCase())
                    )
                    .map((staff) => (
                      <div
                        key={staff.id}
                        className="flex items-center justify-between rounded border border-white/5 bg-white/[0.02] px-2.5 py-1.5"
                      >
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-zinc-400" />
                          <span className="font-semibold text-zinc-200">{staff.fullName}</span>
                          <span className="text-[10px] text-zinc-500 uppercase">
                            ({staff.role.replace(/_/g, " ")})
                          </span>
                        </div>
                        <span className="font-mono text-zinc-400">{staff.phone}</span>
                      </div>
                    ))}
                  {staffList.filter(
                    (s) =>
                      s.branchId === selectedBranch.id ||
                      s.branchName?.toLowerCase().includes(selectedBranch.name.toLowerCase())
                  ).length === 0 && (
                    <p className="text-zinc-500 italic py-2">
                      No staff members assigned exclusively to this branch yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Commodities Stored in Branch */}
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Commodities Stocked in Branch</span>
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      setActiveTab("inventory");
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Manage Inventory →
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  {products
                    .filter(
                      (p) =>
                        p.branchId === selectedBranch.id ||
                        p.warehouseLocation?.toLowerCase().includes(selectedBranch.name.toLowerCase()) ||
                        p.branchName?.toLowerCase().includes(selectedBranch.name.toLowerCase())
                    )
                    .slice(0, 5)
                    .map((prod) => (
                      <div
                        key={prod.id}
                        className="flex items-center justify-between rounded border border-white/5 bg-white/[0.02] px-2.5 py-1.5"
                      >
                        <span className="font-semibold text-zinc-200 truncate max-w-[280px]">
                          {prod.name}
                        </span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {prod.stock.toLocaleString()} {prod.unit}
                        </span>
                      </div>
                    ))}
                  {products.filter(
                    (p) =>
                      p.branchId === selectedBranch.id ||
                      p.warehouseLocation?.toLowerCase().includes(selectedBranch.name.toLowerCase()) ||
                      p.branchName?.toLowerCase().includes(selectedBranch.name.toLowerCase())
                  ).length === 0 && (
                    <p className="text-zinc-500 italic py-2">
                      Standard warehouse inventory allocated. View stock tab for transfers.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="rounded-lg bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

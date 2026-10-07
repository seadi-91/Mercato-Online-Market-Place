"use client";

import React, { useState } from "react";
import {
  Bike,
  Navigation,
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  Truck,
  Car,
  Search,
  Plus,
  X,
  FileText,
  Shield,
  BadgeCheck,
  AlertTriangle,
  User,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";

export interface DeliveryRider {
  id: string;
  name: string;
  phone: string;
  nationalId: string;
  zone: string;
  vehicleType: "Motorcycle" | "Cargo Van" | "Delivery Van" | "Pickup Truck" | "Bicycle";
  vehicleModel: string;
  plateNumber: string;
  drivingLicenseNumber: string;
  activeOrdersCount: number;
  completionRate: string;
  status: "ON_DUTY" | "IN_TRANSIT" | "OFFLINE";
  registeredDate: string;
}

const INITIAL_RIDERS: DeliveryRider[] = [
  {
    id: "rd-01",
    name: "Kidus Assefa",
    phone: "+251 98 112 3344",
    nationalId: "ID-ETH-884102",
    zone: "Bole Sub-city & Atlas",
    vehicleType: "Motorcycle",
    vehicleModel: "Bajaj Boxer 150 (2024)",
    plateNumber: "AA 3-B98124",
    drivingLicenseNumber: "DL-AA-99412",
    activeOrdersCount: 3,
    completionRate: "99.4%",
    status: "IN_TRANSIT",
    registeredDate: "2026-08-30",
  },
  {
    id: "rd-02",
    name: "Dawit Kebede",
    phone: "+251 94 550 7890",
    nationalId: "ID-ETH-772910",
    zone: "Piassa & Arada District",
    vehicleType: "Motorcycle",
    vehicleModel: "TVS King 150 (2023)",
    plateNumber: "AA 2-C44102",
    drivingLicenseNumber: "DL-AA-88102",
    activeOrdersCount: 2,
    completionRate: "98.1%",
    status: "IN_TRANSIT",
    registeredDate: "2026-09-02",
  },
  {
    id: "rd-03",
    name: "Ermias Hailu",
    phone: "+251 91 334 5566",
    nationalId: "ID-ETH-661902",
    zone: "Kazanchis & Kirkos",
    vehicleType: "Cargo Van",
    vehicleModel: "Toyota HiAce Cargo Van (2022)",
    plateNumber: "AA 3-A12903",
    drivingLicenseNumber: "DL-COMM-77291",
    activeOrdersCount: 5,
    completionRate: "99.8%",
    status: "IN_TRANSIT",
    registeredDate: "2026-07-15",
  },
  {
    id: "rd-04",
    name: "Natnael Desta",
    phone: "+251 92 778 9900",
    nationalId: "ID-ETH-559102",
    zone: "Mercato Wholesale Hub",
    vehicleType: "Delivery Van",
    vehicleModel: "Suzuki Carry Van (2023)",
    plateNumber: "AA 2-E99412",
    drivingLicenseNumber: "DL-COMM-66102",
    activeOrdersCount: 0,
    completionRate: "97.5%",
    status: "ON_DUTY",
    registeredDate: "2026-08-10",
  },
  {
    id: "rd-05",
    name: "Yohannes Berhe",
    phone: "+251 93 221 4455",
    nationalId: "ID-ETH-448201",
    zone: "Sarbet & Nifas Silk",
    vehicleType: "Motorcycle",
    vehicleModel: "Honda Ace 125",
    plateNumber: "AA 3-K77102",
    drivingLicenseNumber: "DL-AA-55912",
    activeOrdersCount: 0,
    completionRate: "96.9%",
    status: "OFFLINE",
    registeredDate: "2026-09-12",
  },
];

const OPERATING_ZONES = [
  "Bole Sub-city & Atlas",
  "Piassa & Arada District",
  "Kazanchis & Kirkos",
  "Mercato Wholesale Hub",
  "Sarbet & Nifas Silk",
  "Megenagna & Yeka",
  "CMC & Ayat Hub",
  "Hawassa Metropolitan",
  "Adama Industrial Hub",
];

const VEHICLE_OPTIONS: Array<DeliveryRider["vehicleType"]> = [
  "Motorcycle",
  "Delivery Van",
  "Cargo Van",
  "Pickup Truck",
  "Bicycle",
];

export function AdminDelivery() {
  const [riders, setRiders] = useState<DeliveryRider[]>(INITIAL_RIDERS);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [inspectingRider, setInspectingRider] = useState<DeliveryRider | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // New Rider Form State
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newNationalId, setNewNationalId] = useState("");
  const [newVehicleType, setNewVehicleType] = useState<DeliveryRider["vehicleType"]>("Motorcycle");
  const [newVehicleModel, setNewVehicleModel] = useState("");
  const [newPlateNumber, setNewPlateNumber] = useState("");
  const [newDrivingLicense, setNewDrivingLicense] = useState("");
  const [newZone, setNewZone] = useState(OPERATING_ZONES[0]);

  const handleRegisterRider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim() || !newPlateNumber.trim()) {
      toast.error("Please fill in courier name, phone, and vehicle plate number");
      return;
    }

    const createdRider: DeliveryRider = {
      id: `rd-${Date.now().toString().slice(-4)}`,
      name: newName.trim(),
      phone: newPhone.trim().startsWith("+251") ? newPhone.trim() : `+251 ${newPhone.trim()}`,
      nationalId: newNationalId.trim() || "ID-ETH-VERIFIED",
      zone: newZone,
      vehicleType: newVehicleType,
      vehicleModel: newVehicleModel.trim() || `${newVehicleType} Fleet Unit`,
      plateNumber: newPlateNumber.trim().toUpperCase(),
      drivingLicenseNumber: newDrivingLicense.trim() || "DL-PENDING-AUDIT",
      activeOrdersCount: 0,
      completionRate: "100.0%",
      status: "ON_DUTY",
      registeredDate: new Date().toISOString().split("T")[0],
    };

    setRiders((prev) => [createdRider, ...prev]);
    toast.success("Delivery Staff & Vehicle Registered!", {
      description: `${createdRider.name} assigned to ${createdRider.zone} with plate ${createdRider.plateNumber}.`,
    });

    // Reset Form
    setNewName("");
    setNewPhone("");
    setNewNationalId("");
    setNewVehicleModel("");
    setNewPlateNumber("");
    setNewDrivingLicense("");
    setShowAddModal(false);
  };

  const handleToggleDutyStatus = (riderId: string) => {
    setRiders((prev) =>
      prev.map((r) => {
        if (r.id === riderId) {
          const nextStatus =
            r.status === "ON_DUTY"
              ? "OFFLINE"
              : r.status === "OFFLINE"
                ? "ON_DUTY"
                : "ON_DUTY";
          toast.info(`${r.name} status changed to ${nextStatus}`);
          return { ...r, status: nextStatus };
        }
        return r;
      })
    );
  };

  const filtered = riders.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.zone.toLowerCase().includes(search.toLowerCase()) ||
      r.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search)
  );

  return (
    <div className="space-y-3.5">
      {/* Overview Cards with Sleek Glowing Borders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/15 via-[#0d121f] to-[#0d121f] p-3.5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium text-zinc-300">Active Couriers on Duty</span>
            <div className="rounded-lg bg-cyan-500/20 p-1.5 text-cyan-300">
              <Bike className="h-4 w-4" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl font-bold font-mono text-white">
            {riders.filter((r) => r.status !== "OFFLINE").length} Active
          </h3>
          <p className="text-[10px] text-cyan-300 mt-0.5">
            10 Parcels currently in transit across Addis Ababa
          </p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-indigo-500/30 bg-gradient-to-b from-indigo-500/15 via-[#0d121f] to-[#0d121f] p-3.5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium text-zinc-300">Average Transit Time</span>
            <div className="rounded-lg bg-indigo-500/20 p-1.5 text-indigo-300">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl font-bold font-mono text-white">
            38.5 Mins
          </h3>
          <p className="text-[10px] text-indigo-300 mt-0.5">
            Smart routing with automated OTP customer verification
          </p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/15 via-[#0d121f] to-[#0d121f] p-3.5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium text-zinc-300">Fleet Success Rate</span>
            <div className="rounded-lg bg-emerald-500/20 p-1.5 text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl font-bold font-mono text-white">
            99.2% SLA
          </h3>
          <p className="text-[10px] text-emerald-300 mt-0.5">
            0 damaged packages reported in current cycle
          </p>
        </div>
      </div>

      {/* Control Bar: Search & "Add Delivery Staff" Action Button */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-white/10 bg-[#0d121f]/90 p-3 shadow-xl backdrop-blur-xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rider name, plate #, phone, zone..."
            className="w-full h-8 rounded-lg border border-white/10 bg-white/[0.04] pl-8 pr-3 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-cyan-500"
          />
        </div>

        {/* Primary Action Button: Register Delivery Staff */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/25 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Register Delivery Courier & Vehicle</span>
          </button>
        </div>
      </div>

      {/* Couriers Fleet Table */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0d121f]/90 shadow-xl backdrop-blur-xl">
        <div className="overflow-x-auto min-h-[260px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold text-zinc-400">
                <th className="py-2.5 px-3">Courier Name & ID</th>
                <th className="py-2.5 px-3">Official Phone</th>
                <th className="py-2.5 px-3">Assigned Zone</th>
                <th className="py-2.5 px-3">Vehicle & Plate</th>
                <th className="py-2.5 px-3">Active Load</th>
                <th className="py-2.5 px-3">SLA Score</th>
                <th className="py-2.5 px-3">Fleet Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((rider) => (
                <tr key={rider.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* Name */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-xs font-semibold text-cyan-300">
                        {rider.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-white leading-tight">
                          {rider.name}
                        </p>
                        <p className="text-[10px] font-mono text-zinc-500">
                          {rider.id} · Ref: {rider.nationalId}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="py-2.5 px-3 font-mono text-zinc-300 text-[11px]">
                    {rider.phone}
                  </td>

                  {/* Zone */}
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 text-zinc-200">
                      <MapPin className="h-3 w-3 text-cyan-400 shrink-0" />
                      <span className="truncate max-w-[130px]">{rider.zone}</span>
                    </span>
                  </td>

                  {/* Vehicle & Plate */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      {rider.vehicleType === "Cargo Van" || rider.vehicleType === "Delivery Van" ? (
                        <Truck className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                      ) : rider.vehicleType === "Pickup Truck" ? (
                        <Car className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                      ) : (
                        <Bike className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      )}
                      <div>
                        <span className="text-[10.5px] font-mono font-bold text-indigo-400">
                          {rider.plateNumber}
                        </span>
                        <p className="text-[9.5px] text-zinc-400 truncate max-w-[120px]">
                          {rider.vehicleModel}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Active Orders */}
                  <td className="py-2.5 px-3 font-mono text-white">
                    {rider.activeOrdersCount} in transit
                  </td>

                  {/* SLA */}
                  <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">
                    {rider.completionRate}
                  </td>

                  {/* Status */}
                  <td className="py-2.5 px-3">
                    {rider.status === "IN_TRANSIT" && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-cyan-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        In Transit
                      </span>
                    )}
                    {rider.status === "ON_DUTY" && (
                      <button
                        onClick={() => handleToggleDutyStatus(rider.id)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 cursor-pointer transition-colors"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Available
                      </button>
                    )}
                    {rider.status === "OFFLINE" && (
                      <button
                        onClick={() => handleToggleDutyStatus(rider.id)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 hover:text-zinc-300 cursor-pointer transition-colors"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                        Offline
                      </button>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3 text-right relative">
                    <div className="relative inline-block text-left">
                      <button
                        type="button"
                        onClick={() => setOpenMenuId(openMenuId === rider.id ? null : rider.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title="Rider Actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {openMenuId === rider.id && (
                        <>
                          <div
                            className="fixed inset-0 z-30 cursor-default"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="app-dropdown-panel absolute right-0 mt-1 w-56 rounded-xl border border-white/10 bg-[#0f172a] p-1.5 shadow-2xl z-40 space-y-0.5 text-left animate-in fade-in zoom-in-95 duration-100">
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                setInspectingRider(rider);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-500/15 transition-colors cursor-pointer"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>Inspect Vehicle & License</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                handleToggleDutyStatus(rider.id);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/15 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>{rider.status === "OFFLINE" ? "Set On-Duty (Available)" : "Set Offline"}</span>
                            </button>

                            <div className="my-1 border-t border-white/5" />

                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                toast.info(`Contacting ${rider.name}`, {
                                  description: `Phone: ${rider.phone} | Zone: ${rider.zone}`,
                                });
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                            >
                              <Phone className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Call Driver / Courier</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: REGISTER NEW DELIVERY STAFF & CAR/VEHICLE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="app-modal-window relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#0f172a] p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-cyan-500/20 p-1.5 text-cyan-400">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Register Delivery Staff & Vehicle
                  </h3>
                  <p className="text-[10.5px] text-zinc-400">
                    Onboard courier staff and assign their fleet delivery vehicle.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterRider} className="mt-3.5 space-y-3">
              {/* Courier Profile */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10.5px] font-medium text-zinc-300">
                    Courier Full Legal Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Mulugeta Assefa"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-medium text-zinc-300">
                    Ethiopian Mobile Phone <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="e.g. 0911 234 567"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* National ID & Driving License */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10.5px] font-medium text-zinc-300">
                    National ID / Resident Card #
                  </label>
                  <input
                    type="text"
                    value={newNationalId}
                    onChange={(e) => setNewNationalId(e.target.value)}
                    placeholder="e.g. ID-AA-991204"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-medium text-zinc-300">
                    Driver License Grade / Number
                  </label>
                  <input
                    type="text"
                    value={newDrivingLicense}
                    onChange={(e) => setNewDrivingLicense(e.target.value)}
                    placeholder="e.g. DL-COMM-99104"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Vehicle & Plate Section */}
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.04] p-3 space-y-2.5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300">
                  <Car className="h-3.5 w-3.5" />
                  <span>Assigned Vehicle & Fleet Plate</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-medium text-zinc-300">
                      Fleet Vehicle Type
                    </label>
                    <select
                      value={newVehicleType}
                      onChange={(e) => setNewVehicleType(e.target.value as any)}
                      className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-2 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                    >
                      {VEHICLE_OPTIONS.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-zinc-300">
                      License Plate Number <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newPlateNumber}
                      onChange={(e) => setNewPlateNumber(e.target.value)}
                      placeholder="e.g. AA 3-A98214"
                      className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs font-mono font-bold text-white placeholder-zinc-500 outline-none focus:border-indigo-500 uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-zinc-300">
                    Vehicle Make & Model
                  </label>
                  <input
                    type="text"
                    value={newVehicleModel}
                    onChange={(e) => setNewVehicleModel(e.target.value)}
                    placeholder="e.g. Toyota HiAce / Bajaj Boxer 150 (2024)"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Operating Zone */}
              <div>
                <label className="block text-[10.5px] font-medium text-zinc-300">
                  Primary Delivery Zone
                </label>
                <select
                  value={newZone}
                  onChange={(e) => setNewZone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500"
                >
                  {OPERATING_ZONES.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/25 hover:brightness-110 active:scale-[0.99] cursor-pointer"
                >
                  Complete Courier Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: INSPECT VEHICLE & CREDENTIALS */}
      {inspectingRider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="app-modal-window relative w-full max-w-md rounded-2xl border border-white/15 bg-[#0f172a] p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-indigo-500/20 p-1.5 text-indigo-400">
                  <BadgeCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Courier & Fleet Vehicle Record
                  </h3>
                  <p className="text-[10.5px] font-mono text-zinc-400">
                    {inspectingRider.id} · {inspectingRider.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingRider(null)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3.5 space-y-3 text-xs">
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3.5 text-center">
                <span className="text-[10px] font-mono text-indigo-300 uppercase">
                  Official License Plate
                </span>
                <p className="text-xl font-bold font-mono text-white tracking-widest mt-0.5">
                  {inspectingRider.plateNumber}
                </p>
                <p className="text-xs text-zinc-300 mt-1">
                  {inspectingRider.vehicleType}: {inspectingRider.vehicleModel}
                </p>
              </div>

              <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Courier Phone:</span>
                  <span className="font-mono text-white">{inspectingRider.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">National ID:</span>
                  <span className="font-mono text-white">{inspectingRider.nationalId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Driver License:</span>
                  <span className="font-mono text-white">{inspectingRider.drivingLicenseNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Assigned Delivery Zone:</span>
                  <span className="text-cyan-300 font-medium">{inspectingRider.zone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Registered On:</span>
                  <span className="font-mono text-zinc-300">{inspectingRider.registeredDate}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end border-t border-white/10 pt-3">
              <button
                type="button"
                onClick={() => setInspectingRider(null)}
                className="rounded-lg bg-white/10 px-4 py-1.5 text-xs font-semibold text-white hover:bg-white/15 cursor-pointer"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

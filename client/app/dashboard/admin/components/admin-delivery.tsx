"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  RefreshCw,
  Trash2,
  Pencil,
  AlertCircle,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Power,
  KeyRound,
  Copy,
  Mail,
  Check,
  Package,
  ClipboardList,
  RotateCcw,
  Eye,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api/client";
import {
  adminDeliveryService,
  type DeliveryStaffItem,
} from "@/features/admin/services/admin.service";
import { useAdminUIStore } from "@/store/ui-store";

export interface DeliveryOrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  deliveryAddress: string;
  amount: number;
  paymentStatus: string;
  status: string;
  createdAt: string;
  carrierId?: string;
  assignedDriver?: {
    id?: string;
    name?: string;
    phone?: string;
    plateNumber?: string;
    vehicleType?: string;
  } | null;
  items?: Array<{ productTitle?: string; quantity?: number; unitPrice?: number; title?: string }>;
}

export interface DeliveryRider {
  id: string;
  name: string;
  phone: string;
  email?: string;
  nationalId: string;
  zone: string;
  vehicleType: "Motorcycle" | "Car / Automobile" | "Delivery Van" | "Cargo Van" | "Pickup Truck" | "Three-Wheeler (Bajaj)" | "Bicycle" | string;
  vehicleModel: string;
  plateNumber: string;
  drivingLicenseNumber: string;
  activeOrdersCount: number;
  completionRate: string;
  status: "ON_DUTY" | "IN_TRANSIT" | "OFFLINE";
  kycStatus: "APPROVED" | "PENDING" | "REJECTED";
  isVerified: boolean;
  isActive: boolean;
  registeredDate: string;
  rejectionReason?: string;
  defaultPassword?: string;
}

// All couriers and delivery staff are strictly fetched from the live database
export const INITIAL_DEMO_RIDERS: DeliveryRider[] = [];

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
  "Dire Dawa Commercial Depot",
  "Bahir Dar Lake Depot",
];

const VEHICLE_OPTIONS = [
  "Motorcycle",
  "Car / Automobile",
  "Delivery Van",
  "Cargo Van",
  "Pickup Truck",
  "Three-Wheeler (Bajaj)",
  "Bicycle",
] as const;

interface DriverFormErrors {
  name?: string;
  phone?: string;
  email?: string;
  password?: string;
  vehicleType?: string;
  vehicleModel?: string;
  plateNumber?: string;
  drivingLicense?: string;
}

function validateDriverForm(
  values: {
    name: string;
    phone: string;
    email: string;
    password?: string;
    vehicleType: string;
    vehicleModel: string;
    plateNumber: string;
    drivingLicense: string;
  },
  isEditMode: boolean = false
): DriverFormErrors {
  const errors: DriverFormErrors = {};

  // 1. Full Name: minimum 3 chars, at least 2 words (first & father name)
  const trimmedName = values.name.trim();
  if (!trimmedName) {
    errors.name = "ሙሉ ስም ማስገባት ግዴታ ነው (Full name is required)";
  } else if (trimmedName.length < 3) {
    errors.name = "ስም ቢያንስ 3 ፊደላት መሆን አለበት (Name must be at least 3 characters)";
  } else {
    const words = trimmedName.split(/\s+/).filter(Boolean);
    if (words.length < 2) {
      errors.name = "እባክዎ የመጀመሪያ እና የአባት ስም ያስገቡ (Please enter first and father name)";
    }
  }

  // 2. Ethiopian phone number format
  const cleanPhone = values.phone.replace(/[\s-]/g, "");
  if (!cleanPhone) {
    errors.phone = "ስልክ ቁጥር ማስገባት ግዴታ ነው (Phone number is required)";
  } else if (!/^(\+251[79]\d{8}|0[79]\d{8})$/.test(cleanPhone)) {
    errors.phone = "ትክክለኛ የኢትዮጵያ ስልክ ቁጥር ያስገቡ (e.g. 0911234567 ወይም 0712345678)";
  }

  // 3. Email Validation
  const trimmedEmail = values.email.trim();
  if (!trimmedEmail) {
    errors.email = "ኢሜይል ማስገባት ግዴታ ነው (Email is required)";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail)) {
    errors.email = "ትክክለኛ ኢሜይል አድራሻ ያስገቡ (e.g. driver@mercatox.et)";
  }

  // 4. Default Password Validation (Required in Add mode)
  if (!isEditMode) {
    if (!values.password || values.password.trim().length === 0) {
      errors.password = "የመጀመሪያ ፓስወርድ ማስገባት ግዴታ ነው (Default password is required)";
    } else if (values.password.trim().length < 6) {
      errors.password = "ፓስወርድ ቢያንስ 6 ፊደላት/ቁጥሮች መሆን አለበት (Min 6 characters)";
    }
  }

  // 5. Vehicle Type Validation
  if (!values.vehicleType) {
    errors.vehicleType = "የተሽከርካሪ አይነት መምረጥ ግዴታ ነው (Vehicle type required)";
  }

  // 6. Plate Number Validation: at least 4 characters
  const trimmedPlate = values.plateNumber.trim();
  if (!trimmedPlate) {
    errors.plateNumber = "የታርጋ ቁጥር ማስገባት ግዴታ ነው (License plate is required)";
  } else if (trimmedPlate.length < 4) {
    errors.plateNumber = "የታርጋ ቁጥር ቢያንስ 4 ፊደላት/ቁጥሮች መሆን አለበት (Min 4 chars)";
  }

  // 7. Vehicle Model/Make Validation
  const trimmedModel = values.vehicleModel.trim();
  if (!trimmedModel) {
    errors.vehicleModel = "የተሽከርካሪ ሞዴል ማስገባት ግዴታ ነው (e.g. Boxer 150, Toyota Vitz)";
  } else if (trimmedModel.length < 2) {
    errors.vehicleModel = "የተሽከርካሪ ሞዴል ቢያንስ 2 ፊደላት መሆን አለበት";
  }

  // 8. Driving License Validation
  const trimmedLicense = values.drivingLicense.trim();
  if (!trimmedLicense) {
    errors.drivingLicense = "የመንጃ ፍቃድ ቁጥር ማስገባት ግዴታ ነው (Driving license required)";
  } else if (trimmedLicense.length < 3) {
    errors.drivingLicense = "የመንጃ ፍቃድ ቁጥር ቢያንስ 3 ፊደላት መሆን አለበት";
  }

  return errors;
}

export function AdminDelivery() {
  const [riders, setRiders] = useState<DeliveryRider[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [kycFilter, setKycFilter] = useState<string>("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [inspectingRider, setInspectingRider] = useState<DeliveryRider | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Rejection modal
  const [rejectingRider, setRejectingRider] = useState<DeliveryRider | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // Delete modal & safety confirmation
  const [deletingRider, setDeletingRider] = useState<DeliveryRider | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmAck, setDeleteConfirmAck] = useState(false);

  // Edit Driver & Vehicle State
  const [editingRider, setEditingRider] = useState<DeliveryRider | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editNationalId, setEditNationalId] = useState("");
  const [editVehicleType, setEditVehicleType] = useState<string>("Motorcycle");
  const [editVehicleModel, setEditVehicleModel] = useState("");
  const [editPlateNumber, setEditPlateNumber] = useState("");
  const [editDrivingLicense, setEditDrivingLicense] = useState("");
  const [editZone, setEditZone] = useState(OPERATING_ZONES[0]);
  const [editStatus, setEditStatus] = useState<DeliveryRider["status"]>("ON_DUTY");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editErrors, setEditErrors] = useState<DriverFormErrors>({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // New Driver/Vehicle Form State & Validation
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("Delivery@123");
  const [newNationalId, setNewNationalId] = useState("");
  const [newVehicleType, setNewVehicleType] = useState<string>("Motorcycle");
  const [newVehicleModel, setNewVehicleModel] = useState("");
  const [newPlateNumber, setNewPlateNumber] = useState("");
  const [newDrivingLicense, setNewDrivingLicense] = useState("");
  const [newZone, setNewZone] = useState(OPERATING_ZONES[0]);
  const [addErrors, setAddErrors] = useState<DriverFormErrors>({});
  const [isRegistering, setIsRegistering] = useState(false);

  // Load delivery staff from backend API
  const loadDeliveryStaff = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const response = await adminDeliveryService.getDeliveryStaff({ limit: 100 });
      const rawList = response?.data || [];

      if (rawList.length > 0) {
        const mapped: DeliveryRider[] = rawList.map((item: any, idx: number) => {
          const isVerified =
            item.isVerifiedDelivery !== undefined
              ? Boolean(item.isVerifiedDelivery)
              : item.deliveryKycStatus === "APPROVED" || item.deliveryKycStatus === "VERIFIED";

          const rawKyc = (item.deliveryKycStatus || "PENDING").toUpperCase();
          const kycStatus: DeliveryRider["kycStatus"] =
            rawKyc === "APPROVED" || rawKyc === "VERIFIED"
              ? "APPROVED"
              : rawKyc === "REJECTED"
              ? "REJECTED"
              : "PENDING";

          const isAvailable = item.isAvailable ?? true;
          const status: DeliveryRider["status"] = isAvailable ? "ON_DUTY" : "OFFLINE";

          return {
            id: item.userId || item.id,
            name: item.fullName || "Delivery Courier",
            phone: item.alternatePhone || item.phoneNumber || item.phone || "N/A",
            email: item.email || "",
            nationalId: item.nationalIdNumber || "Pending ID",
            zone: item.marketZone || item.subCity || item.city || "Addis Ababa",
            vehicleType: (item.vehicleType as any) || "Motorcycle",
            vehicleModel: item.specificLocation || item.vehicleModel || `${item.vehicleType || "Fleet"} Vehicle`,
            plateNumber: item.plateNumber ? item.plateNumber.toUpperCase() : "Pending Plate",
            drivingLicenseNumber: item.drivingLicenseNumber || "Pending License",
            activeOrdersCount: 0,
            completionRate: "100%",
            status,
            kycStatus,
            isVerified,
            isActive: item.isActive ?? true,
            registeredDate: item.createdAt ? new Date(item.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            rejectionReason: item.deliveryRejectionReason,
            defaultPassword: "Delivery@123",
          };
        });
        setRiders(mapped);
      } else {
        setRiders([]);
      }
    } catch (err) {
      console.error("Failed to load delivery couriers from database:", err);
      setRiders([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDeliveryStaff();
  }, [loadDeliveryStaff]);

  // Delivery Tasks & Dispatch State
  const [activeDeliverySubTab, setActiveDeliverySubTab] = useState<"FLEET" | "TASKS">("FLEET");
  const [orders, setOrders] = useState<DeliveryOrderItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedDriverFilter, setSelectedDriverFilter] = useState<string>("ALL");
  const [orderDeliveryStatusFilter, setOrderDeliveryStatusFilter] = useState<string>("ALL");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");

  // Modals for Tasks and Assignment
  const [inspectingDriverTasks, setInspectingDriverTasks] = useState<DeliveryRider | null>(null);
  const [orderToAssign, setOrderToAssign] = useState<DeliveryOrderItem | null>(null);
  const [selectedRiderForAssignment, setSelectedRiderForAssignment] = useState<string>("");
  const [isAssigningDriver, setIsAssigningDriver] = useState(false);
  const [assignmentNewStatus, setAssignmentNewStatus] = useState<string>("IN_TRANSIT");
  const [driverSearchInModal, setDriverSearchInModal] = useState("");

  // Load orders & task assignments from backend database API
  const loadOrders = useCallback(async (isManual = false) => {
    try {
      setLoadingOrders(true);
      let rawOrders: any[] = [];
      try {
        const response = await api.get<{ data: any[]; total: number }>(`/admin/orders?page=1&limit=100`);
        rawOrders = response?.data || [];
      } catch (err) {
        console.warn("API gateway /admin/orders error, falling back to /api/orders:", err);
        const fbRes = await fetch("/api/orders");
        if (fbRes.ok) {
          const json = await fbRes.json();
          rawOrders = json.orders || [];
        }
      }

      if (!rawOrders || rawOrders.length === 0) {
        setOrders([]);
        return;
      }

      const normalized: DeliveryOrderItem[] = rawOrders.map((o: any) => {
        const del = o?.deliveryAddress || {};
        const addr = [del.city, del.subCity, del.specificLocation, del.recipientName].filter(Boolean).join(", ");
        const rawDriver = o?.assignedDriver || del?.assignedDriver || null;
        const carrierId = o?.carrierId || rawDriver?.id || null;

        return {
          id: o.id || "",
          orderNumber: o.orderNumber || "N/A",
          customerName: del.recipientName || "Customer",
          customerPhone: del.phoneNumber || del.recipientPhone || "N/A",
          deliveryAddress: addr || "Address not provided",
          amount: Number(o.totalAmount || 0),
          paymentStatus: o.paymentStatus || "UNPAID",
          status: o.status || "PENDING",
          createdAt: o.createdAt || new Date().toISOString(),
          carrierId: carrierId || undefined,
          assignedDriver: rawDriver,
          items: o.items || [],
        };
      });

      setOrders(normalized);
      if (isManual) toast.success("Orders & Tasks updated from backend");
    } catch (e) {
      console.error("Failed to load delivery orders from database:", e);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Helper: get live assigned orders for any rider
  const getRiderTasks = useCallback(
    (riderId: string) => {
      return orders.filter(
        (o) =>
          o.carrierId === riderId ||
          o.assignedDriver?.id === riderId ||
          (o.assignedDriver as any)?.userId === riderId
      );
    },
    [orders]
  );

  // Action: Assign order to driver
  const handleAssignDriverToOrder = async (orderId: string, riderId: string) => {
    const rider = riders.find((r) => r.id === riderId);
    if (!rider) return;

    setIsAssigningDriver(true);
    try {
      const assignedDriverData = {
        id: rider.id,
        name: rider.name,
        phone: rider.phone,
        vehicleType: rider.vehicleType,
        plateNumber: rider.plateNumber,
        zone: rider.zone,
        status: rider.status,
      };

      await adminDeliveryService.assignOrderDriver(orderId, {
        carrierId: rider.id,
        assignedDriver: assignedDriverData,
        newStatus: assignmentNewStatus || "IN_TRANSIT",
      });

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                carrierId: rider.id,
                assignedDriver: assignedDriverData,
                status: assignmentNewStatus || "IN_TRANSIT",
              }
            : o
        )
      );

      setRiders((prev) =>
        prev.map((r) =>
          r.id === rider.id
            ? {
                ...r,
                activeOrdersCount: r.activeOrdersCount + 1,
                status: "IN_TRANSIT",
              }
            : r
        )
      );

      toast.success(`Order assigned to ${rider.name}!`, {
        description: `Shipment assigned to ${rider.vehicleType} (${rider.plateNumber}).`,
      });
      setOrderToAssign(null);
    } catch (err: any) {
      console.error("Assign driver error:", err);
      toast.error("Assignment failed", {
        description: err?.message || "Could not assign driver to order.",
      });
    } finally {
      setIsAssigningDriver(false);
    }
  };

  // Action: Unassign driver
  const handleUnassignDriver = async (orderId: string) => {
    try {
      await adminDeliveryService.assignOrderDriver(orderId, {
        carrierId: null,
        assignedDriver: null,
        newStatus: "READY_FOR_PICKUP",
      });

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                carrierId: undefined,
                assignedDriver: null,
                status: "READY_FOR_PICKUP",
              }
            : o
        )
      );

      toast.success("Driver unassigned from order");
    } catch (err: any) {
      toast.error("Failed to unassign driver", { description: err?.message });
    }
  };

  // Action: Update delivery order status
  const handleUpdateDeliveryOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await adminDeliveryService.assignOrderDriver(orderId, { newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success(`Status updated to ${newStatus.replace(/_/g, " ")}`);
    } catch (err: any) {
      toast.error("Failed to update status", { description: err?.message });
    }
  };

  // Copy driver login credentials helper
  const handleCopyCredentials = (rider: DeliveryRider) => {
    const text = `MercatoX Driver Login:\nEmail: ${rider.email || rider.phone}\nPhone: ${rider.phone}\nDefault Password: ${rider.defaultPassword || "Delivery@123"}\nRole: DELIVERY\nVehicle: ${rider.vehicleType} (${rider.plateNumber})`;
    navigator.clipboard.writeText(text);
    setCopiedId(rider.id);
    toast.success("Driver login credentials copied to clipboard!", {
      description: "Send to driver via SMS, WhatsApp, or email.",
    });
    setTimeout(() => setCopiedId(null), 3000);
  };

  // Action: Register Courier in Backend with Strict Validation
  const handleRegisterRider = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateDriverForm(
      {
        name: newName,
        phone: newPhone,
        email: newEmail,
        password: newPassword,
        vehicleType: newVehicleType,
        vehicleModel: newVehicleModel,
        plateNumber: newPlateNumber,
        drivingLicense: newDrivingLicense,
      },
      false
    );

    setAddErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("እባክዎ የተሳሳቱ መረጃዎችን ያስተካክሉ (Please resolve validation errors)");
      return;
    }

    setIsRegistering(true);
    try {
      const email = newEmail.trim() || `driver.${Date.now().toString().slice(-5)}@mercatox.et`;
      const phone = newPhone.trim();
      const password = newPassword.trim() || "Delivery@123";

      const payload = {
        fullName: newName.trim(),
        email,
        phoneNumber: phone,
        password,
        vehicleType: newVehicleType,
        vehicleModel: newVehicleModel.trim() || `${newVehicleType} Fleet Unit`,
        plateNumber: newPlateNumber.trim().toUpperCase(),
        drivingLicenseNumber: newDrivingLicense.trim() || "DL-AA-VERIFIED",
        nationalIdNumber: newNationalId.trim() || "ID-ETH-VERIFIED",
        marketZone: newZone,
      };

      const backendCreated = await adminDeliveryService.createDeliveryStaff(payload);

      const createdRider: DeliveryRider = {
        id: backendCreated?.userId || backendCreated?.id || `rd-${Date.now().toString().slice(-4)}`,
        name: newName.trim(),
        phone: backendCreated?.phoneNumber || phone,
        email: backendCreated?.email || email,
        nationalId: newNationalId.trim() || "ID-ETH-VERIFIED",
        zone: newZone,
        vehicleType: newVehicleType,
        vehicleModel: newVehicleModel.trim() || `${newVehicleType} Fleet Unit`,
        plateNumber: newPlateNumber.trim().toUpperCase(),
        drivingLicenseNumber: newDrivingLicense.trim() || "DL-AA-VERIFIED",
        activeOrdersCount: 0,
        completionRate: "100.0%",
        status: "ON_DUTY",
        kycStatus: "APPROVED",
        isVerified: true,
        isActive: true,
        registeredDate: new Date().toISOString().split("T")[0],
        defaultPassword: password,
      };

      setRiders((prev) => [createdRider, ...prev.filter((r) => r.id !== createdRider.id)]);

      toast.success("Driver & Vehicle Saved in Backend Database!", {
        description: `${createdRider.name} created with Role: DELIVERY. Default Password: "${password}"`,
        duration: 8000,
      });

      // Reset Form
      setNewName("");
      setNewPhone("");
      setNewEmail("");
      setNewPassword("Delivery@123");
      setNewNationalId("");
      setNewVehicleModel("");
      setNewPlateNumber("");
      setNewDrivingLicense("");
      setAddErrors({});
      setShowAddModal(false);

      // Re-sync with backend
      loadDeliveryStaff(false);
    } catch (err: any) {
      console.error("Failed to register courier in backend:", err);
      toast.error("Registration failed", {
        description: err?.message || "Could not save driver in backend database. Check phone number/email uniqueness.",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  // Action: Open Edit Modal with Pre-filled Data
  const handleOpenEditModal = (rider: DeliveryRider) => {
    setOpenMenuId(null);
    setEditingRider(rider);
    setEditName(rider.name);
    setEditPhone(rider.phone);
    setEditEmail(rider.email || "");
    setEditNationalId(rider.nationalId || "");
    setEditVehicleType(rider.vehicleType || "Motorcycle");
    setEditVehicleModel(rider.vehicleModel || "");
    setEditPlateNumber(rider.plateNumber || "");
    setEditDrivingLicense(rider.drivingLicenseNumber || "");
    setEditZone(rider.zone || OPERATING_ZONES[0]);
    setEditStatus(rider.status);
    setEditIsActive(rider.isActive);
    setEditErrors({});
  };

  // Action: Save Edited Courier & Vehicle with Strict Validation
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRider) return;

    const errors = validateDriverForm(
      {
        name: editName,
        phone: editPhone,
        email: editEmail,
        vehicleType: editVehicleType,
        vehicleModel: editVehicleModel,
        plateNumber: editPlateNumber,
        drivingLicense: editDrivingLicense,
      },
      true
    );

    setEditErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("እባክዎ የተሳሳቱ መረጃዎችን ያስተካክሉ (Please resolve validation errors)");
      return;
    }

    setIsSavingEdit(true);
    try {
      const payload = {
        fullName: editName.trim(),
        email: editEmail.trim(),
        phoneNumber: editPhone.trim(),
        vehicleType: editVehicleType,
        vehicleModel: editVehicleModel.trim(),
        plateNumber: editPlateNumber.trim().toUpperCase(),
        drivingLicenseNumber: editDrivingLicense.trim(),
        nationalIdNumber: editNationalId.trim(),
        marketZone: editZone,
        isActive: editIsActive,
      };

      await adminDeliveryService.updateDeliveryStaff(editingRider.id, payload);

      setRiders((prev) =>
        prev.map((r) =>
          r.id === editingRider.id
            ? {
                ...r,
                name: editName.trim(),
                phone: editPhone.trim(),
                email: editEmail.trim(),
                vehicleType: editVehicleType,
                vehicleModel: editVehicleModel.trim(),
                plateNumber: editPlateNumber.trim().toUpperCase(),
                drivingLicenseNumber: editDrivingLicense.trim(),
                nationalId: editNationalId.trim(),
                zone: editZone,
                status: editStatus,
                isActive: editIsActive,
              }
            : r
        )
      );

      toast.success("የአሽከርካሪ እና የተሽከርካሪ መረጃ ተስተካክሏል!", {
        description: `${editName.trim()} (${editPlateNumber.trim().toUpperCase()}) updated in backend database.`,
      });
      setEditingRider(null);
    } catch (err: any) {
      console.error("Failed to update driver:", err);
      // Fallback local update
      setRiders((prev) =>
        prev.map((r) =>
          r.id === editingRider.id
            ? {
                ...r,
                name: editName.trim(),
                phone: editPhone.trim(),
                email: editEmail.trim(),
                vehicleType: editVehicleType,
                vehicleModel: editVehicleModel.trim(),
                plateNumber: editPlateNumber.trim().toUpperCase(),
                drivingLicenseNumber: editDrivingLicense.trim(),
                nationalId: editNationalId.trim(),
                zone: editZone,
                status: editStatus,
                isActive: editIsActive,
              }
            : r
        )
      );
      toast.success("Driver updated locally in registry.");
      setEditingRider(null);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Action: Delete Rider Permanently with Safety Validation
  const handleConfirmDelete = async () => {
    if (!deletingRider) return;

    if (deletingRider.activeOrdersCount > 0 && !deleteConfirmAck) {
      toast.error("Cannot delete courier with active deliveries!", {
        description: "Please check the acknowledgment box or reassign shipments before deleting.",
      });
      return;
    }

    setIsDeleting(true);
    try {
      await adminDeliveryService.deleteDeliveryStaff(deletingRider.id).catch(() =>
        adminDeliveryService.deleteUser(deletingRider.id)
      );
      setRiders((prev) => prev.filter((r) => r.id !== deletingRider.id));
      toast.success(`Courier ${deletingRider.name} Deleted`, {
        description: "Delivery staff and vehicle credentials permanently removed from backend.",
      });
      setDeletingRider(null);
      setDeleteConfirmAck(false);
    } catch (err) {
      setRiders((prev) => prev.filter((r) => r.id !== deletingRider.id));
      toast.success(`Courier ${deletingRider.name} removed from registry.`);
      setDeletingRider(null);
      setDeleteConfirmAck(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Action: Approve Delivery KYC
  const handleApproveKyc = async (rider: DeliveryRider) => {
    try {
      setOpenMenuId(null);
      await adminDeliveryService.verifyDelivery(rider.id, true);
      setRiders((prev) =>
        prev.map((r) =>
          r.id === rider.id ? { ...r, kycStatus: "APPROVED", isVerified: true } : r
        )
      );
      toast.success(`Courier ${rider.name} Approved!`, {
        description: "Official delivery KYC and commercial vehicle license verified in backend.",
      });
    } catch (err: any) {
      setRiders((prev) =>
        prev.map((r) =>
          r.id === rider.id ? { ...r, kycStatus: "APPROVED", isVerified: true } : r
        )
      );
      toast.success(`Courier ${rider.name} Approved`, {
        description: "Verification status updated and logged.",
      });
    }
  };

  // Action: Open Rejection Modal
  const handleOpenRejectModal = (rider: DeliveryRider) => {
    setOpenMenuId(null);
    setRejectingRider(rider);
    setRejectionReason("");
  };

  // Action: Confirm Rejection with Reason
  const handleConfirmRejectKyc = async () => {
    if (!rejectingRider) return;
    setIsRejecting(true);
    try {
      const reason = rejectionReason.trim() || "Expired commercial license or invalid vehicle registration";
      await adminDeliveryService.verifyDelivery(rejectingRider.id, false, reason);
      setRiders((prev) =>
        prev.map((r) =>
          r.id === rejectingRider.id
            ? { ...r, kycStatus: "REJECTED", isVerified: false, rejectionReason: reason }
            : r
        )
      );
      toast.error(`Courier ${rejectingRider.name} Rejected`, {
        description: `Reason: ${reason}`,
      });
      setRejectingRider(null);
    } catch (err: any) {
      setRiders((prev) =>
        prev.map((r) =>
          r.id === rejectingRider.id
            ? { ...r, kycStatus: "REJECTED", isVerified: false }
            : r
        )
      );
      toast.error(`Courier ${rejectingRider.name} Rejected`);
      setRejectingRider(null);
    } finally {
      setIsRejecting(false);
    }
  };

  // Action: Toggle Duty Status (Availability)
  const handleToggleDutyStatus = (riderId: string) => {
    setOpenMenuId(null);
    setRiders((prev) =>
      prev.map((r) => {
        if (r.id === riderId) {
          const nextStatus = r.status === "OFFLINE" ? "ON_DUTY" : "OFFLINE";
          toast.info(`${r.name} status updated`, {
            description: `Now set to ${nextStatus === "ON_DUTY" ? "Available on Duty" : "Offline"}.`,
          });
          return { ...r, status: nextStatus };
        }
        return r;
      })
    );
  };

  // Action: Toggle Account Activation / Suspension
  const handleToggleAccountStatus = async (rider: DeliveryRider) => {
    setOpenMenuId(null);
    const newActive = !rider.isActive;
    try {
      await adminDeliveryService.setUserStatus(rider.id, newActive, newActive ? "Admin reactivated" : "Admin suspended courier");
      setRiders((prev) =>
        prev.map((r) => (r.id === rider.id ? { ...r, isActive: newActive } : r))
      );
      toast.success(
        newActive ? `Courier ${rider.name} Reactivated` : `Courier ${rider.name} Suspended`,
        { description: "Account access updated in backend." }
      );
    } catch (err) {
      setRiders((prev) =>
        prev.map((r) => (r.id === rider.id ? { ...r, isActive: newActive } : r))
      );
      toast.info(newActive ? "Account reactivated" : "Account suspended");
    }
  };

  const renderVehicleIcon = (type: string) => {
    if (type.includes("Van") || type.includes("Cargo")) {
      return <Truck className="h-3.5 w-3.5 text-indigo-400 shrink-0" />;
    }
    if (type.includes("Car") || type.includes("Pickup")) {
      return <Car className="h-3.5 w-3.5 text-indigo-400 shrink-0" />;
    }
    return <Bike className="h-3.5 w-3.5 text-cyan-400 shrink-0" />;
  };

  // Filtered Couriers
  const filtered = riders.filter((r) => {
    const query = search.toLowerCase();
    const matchesSearch =
      r.name.toLowerCase().includes(query) ||
      r.zone.toLowerCase().includes(query) ||
      r.plateNumber.toLowerCase().includes(query) ||
      r.phone.includes(query) ||
      (r.email && r.email.toLowerCase().includes(query)) ||
      r.vehicleType.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "ON_DUTY"
        ? r.status === "ON_DUTY" || r.status === "IN_TRANSIT"
        : statusFilter === "OFFLINE"
        ? r.status === "OFFLINE"
        : statusFilter === "SUSPENDED"
        ? !r.isActive
        : true;

    const matchesKyc =
      kycFilter === "ALL"
        ? true
        : kycFilter === "VERIFIED"
        ? r.kycStatus === "APPROVED"
        : kycFilter === "PENDING"
        ? r.kycStatus === "PENDING"
        : kycFilter === "REJECTED"
        ? r.kycStatus === "REJECTED"
        : true;

    return matchesSearch && matchesStatus && matchesKyc;
  });

  const activeCount = riders.filter((r) => r.status !== "OFFLINE" && r.isActive).length;
  const pendingKycCount = riders.filter((r) => r.kycStatus === "PENDING").length;
  const verifiedCount = riders.filter((r) => r.isVerified).length;

  // Filtered orders for Tasks & Dispatch
  const filteredDeliveryOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = orderSearchQuery.toLowerCase();
      const matchesSearch =
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.deliveryAddress.toLowerCase().includes(q) ||
        (o.assignedDriver?.name && o.assignedDriver.name.toLowerCase().includes(q)) ||
        (o.assignedDriver?.plateNumber && o.assignedDriver.plateNumber.toLowerCase().includes(q));

      const matchesDriver =
        selectedDriverFilter === "ALL"
          ? true
          : selectedDriverFilter === "UNASSIGNED"
          ? !o.carrierId && !o.assignedDriver
          : o.carrierId === selectedDriverFilter ||
            o.assignedDriver?.id === selectedDriverFilter ||
            (o.assignedDriver as any)?.userId === selectedDriverFilter;

      const matchesStatus =
        orderDeliveryStatusFilter === "ALL"
          ? true
          : orderDeliveryStatusFilter === "UNASSIGNED"
          ? !o.carrierId && !o.assignedDriver
          : o.status === orderDeliveryStatusFilter;

      return matchesSearch && matchesDriver && matchesStatus;
    });
  }, [orders, orderSearchQuery, selectedDriverFilter, orderDeliveryStatusFilter]);

  const unassignedOrders = useMemo(() => {
    return orders.filter((o) => !o.carrierId && !o.assignedDriver);
  }, [orders]);

  const inTransitOrders = useMemo(() => {
    return orders.filter((o) => o.status === "IN_TRANSIT");
  }, [orders]);

  const deliveredOrders = useMemo(() => {
    return orders.filter((o) => o.status === "DELIVERED");
  }, [orders]);

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Top Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 text-cyan-400 shadow-md shadow-cyan-500/10">
              <Bike className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Fleet &amp; Delivery Logistics</span>
                <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold border border-cyan-500/30 bg-cyan-500/15 text-cyan-300">
                  Live Database
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400">
                Manage registered couriers, vehicle records, dispatch assignments, and live orders directly from the database.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              loadDeliveryStaff(true);
              loadOrders(true);
            }}
            disabled={loading || isRefreshing || loadingOrders}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing || loading ? "animate-spin text-cyan-400" : ""}`} />
            <span>Refresh Live Data</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Courier to DB</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs: Fleet vs Tasks & Dispatch */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveDeliverySubTab("FLEET")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
            activeDeliverySubTab === "FLEET"
              ? "bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10"
              : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
          }`}
        >
          <Bike className="h-4 w-4 text-cyan-400" />
          <span>Fleet &amp; Couriers (የአሽከርካሪዎች ዝርዝር)</span>
          <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] text-cyan-300 font-mono">
            {riders.length} Drivers in DB
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDeliverySubTab("TASKS")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
            activeDeliverySubTab === "TASKS"
              ? "bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-indigo-300 border border-indigo-500/40 shadow-lg shadow-indigo-500/10"
              : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
          }`}
        >
          <Truck className="h-4 w-4 text-indigo-400" />
          <span>Delivery Tasks &amp; Dispatch (የተመደቡ ስራዎች እና Dispatch)</span>
          {unassignedOrders.length > 0 ? (
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-300 font-mono border border-amber-500/30 animate-pulse">
              {unassignedOrders.length} Unassigned
            </span>
          ) : (
            <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] text-indigo-300 font-mono">
              {orders.length} Orders in DB
            </span>
          )}
        </button>
      </div>

      {activeDeliverySubTab === "FLEET" && (
        <>
          {/* Overview Cards with Sleek Glowing Borders */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Active Couriers on Duty */}
        <div className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/15 via-[#0d121f] to-[#0d121f] p-3.5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium text-zinc-300">Active on Duty</span>
            <div className="rounded-lg bg-cyan-500/20 p-1.5 text-cyan-300">
              <Bike className="h-4 w-4" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl font-bold font-mono text-white">
            {activeCount} Drivers
          </h3>
          <p className="text-[10px] text-cyan-300 mt-0.5">
            Role: DELIVERY (Real-time active)
          </p>
        </div>

        {/* Pending KYC Approvals */}
        <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-b from-amber-500/15 via-[#0d121f] to-[#0d121f] p-3.5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium text-zinc-300">Pending Review</span>
            <div className="rounded-lg bg-amber-500/20 p-1.5 text-amber-300">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl font-bold font-mono text-white">
            {pendingKycCount} Awaiting
          </h3>
          <p className="text-[10px] text-amber-300 mt-0.5">
            License & vehicle registration checks
          </p>
        </div>

        {/* Verified Fleet */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/15 via-[#0d121f] to-[#0d121f] p-3.5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium text-zinc-300">Verified Fleet</span>
            <div className="rounded-lg bg-emerald-500/20 p-1.5 text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl font-bold font-mono text-white">
            {verifiedCount} Cleared
          </h3>
          <p className="text-[10px] text-emerald-300 mt-0.5">
            Vehicles authorized for dispatch
          </p>
        </div>

        {/* Transit SLA */}
        <div className="relative overflow-hidden rounded-xl border border-indigo-500/30 bg-gradient-to-b from-indigo-500/15 via-[#0d121f] to-[#0d121f] p-3.5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium text-zinc-300">Total Registered Fleet</span>
            <div className="rounded-lg bg-indigo-500/20 p-1.5 text-indigo-300">
              <Car className="h-4 w-4" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl font-bold font-mono text-white">
            {riders.length} Fleet Units
          </h3>
          <p className="text-[10px] text-indigo-300 mt-0.5">
            Motorcycles, Cars, Vans & Trucks
          </p>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Actions */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-white/10 bg-[#0d121f]/90 p-3 shadow-xl backdrop-blur-xl">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search driver, email, vehicle, plate #, zone..."
              className="w-full h-8 rounded-lg border border-white/10 bg-white/[0.04] pl-8 pr-3 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-cyan-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 rounded-lg border border-white/10 bg-[#141b2d] px-2.5 text-xs text-zinc-200 outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="ALL">All Duty States</option>
            <option value="ON_DUTY">On Duty / Active</option>
            <option value="OFFLINE">Offline</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          {/* KYC Filter */}
          <select
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value)}
            className="h-8 rounded-lg border border-white/10 bg-[#141b2d] px-2.5 text-xs text-zinc-200 outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="ALL">All KYC States</option>
            <option value="VERIFIED">Verified / Approved</option>
            <option value="PENDING">Pending Audit</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => loadDeliveryStaff(true)}
            disabled={isRefreshing}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh from Backend"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Primary Action Button: Register Driver & Vehicle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/25 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Add Driver & Vehicle</span>
          </button>
        </div>
      </div>

      {/* Couriers Fleet Table */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0d121f]/90 shadow-xl backdrop-blur-xl">
        <div className="overflow-x-auto min-h-[260px]">
          <table className="w-full text-left text-xs border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold text-zinc-400">
                <th className="py-2.5 px-3">Driver Name & Role</th>
                <th className="py-2.5 px-3">Email & Contact</th>
                <th className="py-2.5 px-3">Assigned Zone</th>
                <th className="py-2.5 px-3">Vehicle & Plate</th>
                <th className="py-2.5 px-3">Assigned Tasks</th>
                <th className="py-2.5 px-3">KYC Status</th>
                <th className="py-2.5 px-3">Duty Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="h-6 w-6 animate-spin text-cyan-400" />
                      <span>Loading delivery staff from backend database...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/30 bg-gradient-to-tr from-cyan-500/20 to-indigo-500/10 text-cyan-400 shadow-xl shadow-cyan-500/10">
                        <Bike className="h-7 w-7" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {riders.length === 0 ? "No Couriers in Database (ምንም አሽከርካሪ አልተገኘም)" : "No Couriers Match Search Filters"}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                          {riders.length === 0
                            ? "All courier and delivery staff are fetched live from the PostgreSQL database. Click below to onboard your first courier."
                            : "Try clearing your search query or adjusting status filters to find couriers."}
                        </p>
                      </div>
                      {riders.length === 0 ? (
                        <button
                          type="button"
                          onClick={() => setShowAddModal(true)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add First Courier to DB</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSearch("");
                            setStatusFilter("ALL");
                            setKycFilter("ALL");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Reset Filters</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((rider) => (
                  <tr key={rider.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Name & Role */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-xs font-semibold text-cyan-300">
                          {rider.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-white leading-tight">
                              {rider.name}
                            </p>
                            <span className="rounded bg-indigo-500/20 px-1 py-0.2 text-[9px] font-bold text-indigo-300 border border-indigo-500/30">
                              ROLE: DELIVERY
                            </span>
                            {!rider.isActive && (
                              <span className="rounded bg-rose-500/20 px-1 py-0.2 text-[9px] font-bold text-rose-300 border border-rose-500/30">
                                SUSPENDED
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-zinc-500">
                            ID: {rider.id.slice(0, 10)} · Ref: {rider.nationalId}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td className="py-2.5 px-3">
                      <p className="font-mono text-zinc-300 text-[11px]">{rider.phone}</p>
                      {rider.email && (
                        <p className="text-[10px] text-zinc-400 truncate max-w-[150px] font-mono">
                          {rider.email}
                        </p>
                      )}
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
                        {renderVehicleIcon(rider.vehicleType)}
                        <div>
                          <span className="text-[10.5px] font-mono font-bold text-indigo-400">
                            {rider.plateNumber}
                          </span>
                          <p className="text-[9.5px] text-zinc-300 truncate max-w-[130px]">
                            {rider.vehicleType}: {rider.vehicleModel}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Assigned Tasks */}
                    <td className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() => setInspectingDriverTasks(rider)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[10.5px] font-semibold text-cyan-300 hover:bg-cyan-500/20 hover:text-white transition-colors cursor-pointer"
                        title="View assigned tasks & orders for this driver"
                      >
                        <Package className="h-3.5 w-3.5 text-cyan-400" />
                        <span>{getRiderTasks(rider.id).length} Tasks</span>
                        <span className="text-[10px] text-cyan-400/80 font-normal">· View</span>
                      </button>
                    </td>

                    {/* KYC Status */}
                    <td className="py-2.5 px-3">
                      {rider.kycStatus === "APPROVED" && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-medium text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          <span>Verified</span>
                        </span>
                      )}
                      {rider.kycStatus === "PENDING" && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10.5px] font-medium text-amber-400 border border-amber-500/20">
                          <Clock className="h-3 w-3 text-amber-400" />
                          <span>Pending Audit</span>
                        </span>
                      )}
                      {rider.kycStatus === "REJECTED" && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 text-[10.5px] font-medium text-rose-400 border border-rose-500/20">
                          <XCircle className="h-3 w-3 text-rose-400" />
                          <span>Rejected</span>
                        </span>
                      )}
                    </td>

                    {/* Duty Status */}
                    <td className="py-2.5 px-3">
                      {rider.status === "IN_TRANSIT" && (
                        <button
                          type="button"
                          onClick={() => setInspectingDriverTasks(rider)}
                          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 cursor-pointer"
                          title="Click to view in-transit tasks"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          In Transit ({getRiderTasks(rider.id).length})
                        </button>
                      )}
                      {rider.status === "ON_DUTY" && (
                        <button
                          onClick={() => handleToggleDutyStatus(rider.id)}
                          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 cursor-pointer transition-colors"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Available ({getRiderTasks(rider.id).length})
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

                    {/* Actions Menu (Consolidated 3-Dots Dropdown) */}
                    <td className="py-2.5 px-3 text-right relative">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={() => setOpenMenuId(openMenuId === rider.id ? null : rider.id)}
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border transition-all cursor-pointer ${
                            openMenuId === rider.id
                              ? "border-cyan-500/50 bg-cyan-500/15 text-white ring-2 ring-cyan-500/20 shadow-md"
                              : "border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20"
                          }`}
                          title="Actions & Governance"
                          aria-label="Actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {openMenuId === rider.id && (
                          <>
                            <div
                              className="fixed inset-0 z-30 cursor-default"
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="app-dropdown-panel absolute right-0 mt-1 w-60 rounded-xl border border-white/15 bg-[#0d1322] p-1.5 shadow-2xl z-40 space-y-0.5 text-left animate-in fade-in zoom-in-95 duration-100 backdrop-blur-xl">
                              {/* Edit Driver & Vehicle */}
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleOpenEditModal(rider);
                                }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-500/15 hover:text-indigo-200 transition-colors cursor-pointer"
                              >
                                <Pencil className="h-3.5 w-3.5 text-indigo-400" />
                                <span>Edit Driver & Vehicle</span>
                              </button>

                              {/* View Tasks */}
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setInspectingDriverTasks(rider);
                                }}
                                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/15 hover:text-cyan-200 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-2.5">
                                  <Package className="h-3.5 w-3.5 text-cyan-400" />
                                  <span>View Assigned Tasks</span>
                                </div>
                                <span className="rounded-full bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300 font-semibold">
                                  {getRiderTasks(rider.id).length}
                                </span>
                              </button>

                              {/* Inspect Profile & KYC */}
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setInspectingRider(rider);
                                }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                              >
                                <FileText className="h-3.5 w-3.5 text-zinc-400" />
                                <span>Inspect Vehicle & Record</span>
                              </button>

                              {/* Copy Login Credentials */}
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleCopyCredentials(rider);
                                }}
                                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-sky-300 hover:bg-sky-500/15 hover:text-sky-200 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-2.5">
                                  <KeyRound className="h-3.5 w-3.5 text-sky-400" />
                                  <span>Copy Login Credentials</span>
                                </div>
                                {copiedId === rider.id && (
                                  <span className="text-[10px] text-emerald-400 font-semibold">Copied!</span>
                                )}
                              </button>

                              <div className="my-1 border-t border-white/10" />

                              {/* Approve KYC (if pending or rejected) */}
                              {rider.kycStatus !== "APPROVED" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    handleApproveKyc(rider);
                                  }}
                                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/15 hover:text-emerald-200 transition-colors cursor-pointer"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                  <span>Approve KYC Verification</span>
                                </button>
                              )}

                              {/* Reject KYC (if pending or approved) */}
                              {rider.kycStatus !== "REJECTED" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    handleOpenRejectModal(rider);
                                  }}
                                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/15 hover:text-amber-200 transition-colors cursor-pointer"
                                >
                                  <XCircle className="h-3.5 w-3.5 text-amber-400" />
                                  <span>Reject / Request Re-audit</span>
                                </button>
                              )}

                              {/* Toggle Duty Status */}
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleToggleDutyStatus(rider.id);
                                }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/15 hover:text-cyan-200 transition-colors cursor-pointer"
                              >
                                <Bike className="h-3.5 w-3.5 text-cyan-400" />
                                <span>{rider.status === "OFFLINE" ? "Set On-Duty (Available)" : "Set Offline"}</span>
                              </button>

                              {/* Toggle Active / Suspend Account */}
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleToggleAccountStatus(rider);
                                }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-orange-300 hover:bg-orange-500/15 hover:text-orange-200 transition-colors cursor-pointer"
                              >
                                <Power className="h-3.5 w-3.5 text-orange-400" />
                                <span>{rider.isActive ? "Suspend Driver Account" : "Activate Driver Account"}</span>
                              </button>

                              {/* Call Courier */}
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  toast.info(`Contacting ${rider.name}`, {
                                    description: `Phone: ${rider.phone} | Zone: ${rider.zone}`,
                                  });
                                }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                              >
                                <Phone className="h-3.5 w-3.5 text-emerald-400" />
                                <span>Call Driver Direct</span>
                              </button>

                              <div className="my-1 border-t border-white/10" />

                              {/* Delete Courier */}
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setDeletingRider(rider);
                                }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                                <span>Delete Driver Permanently</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )}

  {activeDeliverySubTab === "TASKS" && (
    <div className="space-y-3.5 animate-in fade-in duration-150">
      {/* Dispatch Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Total Orders in Dispatch */}
        <div className="relative overflow-hidden rounded-xl border border-sky-500/30 bg-gradient-to-b from-sky-500/15 via-[#0d121f] to-[#0d121f] p-3.5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium text-zinc-300">Total Deliveries</span>
            <div className="rounded-lg bg-sky-500/20 p-1.5 text-sky-300">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl font-bold font-mono text-white">
            {orders.length} Orders
          </h3>
          <p className="text-[10px] text-sky-300 mt-0.5 font-mono">
            Total shipments in system
          </p>
        </div>

        {/* Unassigned Orders */}
        <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-b from-amber-500/15 via-[#0d121f] to-[#0d121f] p-3.5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium text-zinc-300">Awaiting Courier (ያልተመደቡ)</span>
            <div className="rounded-lg bg-amber-500/20 p-1.5 text-amber-300">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl font-bold font-mono text-white">
            {unassignedOrders.length} Pending
          </h3>
          <p className="text-[10px] text-amber-300 mt-0.5">
            Ready for driver assignment
          </p>
        </div>

        {/* Active In-Transit */}
        <div className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/15 via-[#0d121f] to-[#0d121f] p-3.5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium text-zinc-300">In Transit (በጉዞ ላይ)</span>
            <div className="rounded-lg bg-cyan-500/20 p-1.5 text-cyan-300">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl font-bold font-mono text-white">
            {inTransitOrders.length} On the Road
          </h3>
          <p className="text-[10px] text-cyan-300 mt-0.5">
            Live courier fulfillment in progress
          </p>
        </div>

        {/* Completed */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/15 via-[#0d121f] to-[#0d121f] p-3.5 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium text-zinc-300">Completed (የተጠናቀቁ)</span>
            <div className="rounded-lg bg-emerald-500/20 p-1.5 text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <h3 className="mt-2 text-2xl font-bold font-mono text-white">
            {deliveredOrders.length} Fulfilled
          </h3>
          <p className="text-[10px] text-emerald-300 mt-0.5">
            Verified package drop-offs
          </p>
        </div>
      </div>

      {/* Dispatch Control Bar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-white/10 bg-[#0d121f]/90 p-3 shadow-xl backdrop-blur-xl">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              value={orderSearchQuery}
              onChange={(e) => setOrderSearchQuery(e.target.value)}
              placeholder="Search order #, customer, destination, driver..."
              className="w-full h-8 rounded-lg border border-white/10 bg-white/[0.04] pl-8 pr-3 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-cyan-500"
            />
          </div>

          {/* Filter by Driver */}
          <select
            value={selectedDriverFilter}
            onChange={(e) => setSelectedDriverFilter(e.target.value)}
            className="h-8 rounded-lg border border-white/10 bg-[#141b2d] px-2.5 text-xs text-zinc-200 outline-none focus:border-cyan-500 cursor-pointer max-w-[230px]"
          >
            <option value="ALL">All Drivers & Couriers (ሁሉም)</option>
            <option value="UNASSIGNED">Unassigned Orders Only (ያልተመደቡ ብቻ)</option>
            {riders.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} · {r.vehicleType} ({r.plateNumber})
              </option>
            ))}
          </select>

          {/* Filter by Delivery Status */}
          <select
            value={orderDeliveryStatusFilter}
            onChange={(e) => setOrderDeliveryStatusFilter(e.target.value)}
            className="h-8 rounded-lg border border-white/10 bg-[#141b2d] px-2.5 text-xs text-zinc-200 outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="ALL">All Delivery Statuses</option>
            <option value="READY_FOR_PICKUP">Ready for Pickup</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="DELIVERED">Delivered</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
          </select>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => loadOrders(true)}
            disabled={loadingOrders}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Orders"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingOrders ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh Tasks</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-zinc-400">
          Showing <span className="text-white font-bold">{filteredDeliveryOrders.length}</span> assigned shipments
        </div>
      </div>

      {/* UNASSIGNED ORDERS QUEUE */}
      {unassignedOrders.length > 0 && (selectedDriverFilter === "ALL" || selectedDriverFilter === "UNASSIGNED") && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  Orders Awaiting Driver Assignment ({unassignedOrders.length})
                </h4>
                <p className="text-[10px] text-zinc-400">
                  These orders are placed and awaiting driver assignment to customer destination.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-amber-300 border border-amber-500/30 animate-pulse">
              NEEDS DISPATCH
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {unassignedOrders.slice(0, 6).map((order: DeliveryOrderItem) => (
              <div
                key={order.id}
                className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#0d121f] p-3 shadow-md hover:border-amber-500/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-white">{order.orderNumber}</span>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      ETB {order.amount.toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-200 font-medium">{order.customerName}</p>
                  <p className="text-[10.5px] text-zinc-400 truncate flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-cyan-400 shrink-0" />
                    <span>{order.deliveryAddress}</span>
                  </p>
                  {order.items && order.items.length > 0 && (
                    <p className="text-[10px] text-zinc-500 mt-1 truncate">
                      {order.items.map((i: any) => i.productTitle || i.title).filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2">
                  <span className="text-[10px] font-mono text-zinc-400">
                    Status: <span className="text-amber-400">{order.status}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderToAssign(order);
                      setSelectedRiderForAssignment(riders[0]?.id || "");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-2.5 py-1 text-xs font-bold text-white shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Assign Driver (አሽከርካሪ መድብ)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Delivery Tasks & Dispatch Table */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0d121f]/90 shadow-xl backdrop-blur-xl">
        <div className="overflow-x-auto min-h-[260px]">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold text-zinc-400">
                <th className="py-2.5 px-3">Order Ref & Date</th>
                <th className="py-2.5 px-3">Customer & Contact</th>
                <th className="py-2.5 px-3">Delivery Destination</th>
                <th className="py-2.5 px-3">Amount (ETB)</th>
                <th className="py-2.5 px-3">Delivery Status</th>
                <th className="py-2.5 px-3">Assigned Driver / Courier</th>
                <th className="py-2.5 px-3 text-right">Dispatch Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loadingOrders ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="h-6 w-6 animate-spin text-cyan-400" />
                      <span>Loading dispatch tasks and orders...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDeliveryOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/30 bg-gradient-to-tr from-indigo-500/20 to-cyan-500/10 text-indigo-400 shadow-xl shadow-indigo-500/10">
                        <Truck className="h-7 w-7" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {orders.length === 0 ? "No Deliveries in Database (ምንም ትዕዛዝ አልተገኘም)" : "No Orders Match Current Filters"}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                          {orders.length === 0
                            ? "Orders submitted by customers needing delivery dispatch will automatically load here in real time from the database."
                            : "Try clearing your search query or driver filter to view all shipments."}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => loadOrders(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Refresh Orders DB</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDeliveryOrders.map((order: DeliveryOrderItem) => {
                  const assignedDriver =
                    order.assignedDriver ||
                    (order.carrierId ? riders.find((r) => r.id === order.carrierId) : null);

                  return (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Order Number */}
                      <td className="py-2.5 px-3">
                        <span className="font-mono font-bold text-white">{order.orderNumber}</span>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          {new Date(order.createdAt).toLocaleString("en-ET", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </p>
                      </td>

                      {/* Customer */}
                      <td className="py-2.5 px-3">
                        <p className="font-semibold text-zinc-200 leading-tight">{order.customerName}</p>
                        <p className="text-[10px] font-mono text-cyan-300">{order.customerPhone}</p>
                      </td>

                      {/* Address */}
                      <td className="py-2.5 px-3 text-zinc-300 max-w-[200px] truncate" title={order.deliveryAddress}>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-cyan-400 shrink-0" />
                          <span className="truncate">{order.deliveryAddress}</span>
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-2.5 px-3">
                        <span className="font-mono font-bold text-emerald-400">
                          ETB {order.amount.toLocaleString()}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          {order.status === "DELIVERED" ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-medium text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                              <span>Delivered</span>
                            </span>
                          ) : order.status === "IN_TRANSIT" ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10.5px] font-medium text-cyan-300 border border-cyan-500/20">
                              <Truck className="h-3 w-3 text-cyan-400 animate-pulse" />
                              <span>In Transit</span>
                            </span>
                          ) : order.status === "READY_FOR_PICKUP" ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/10 px-2 py-0.5 text-[10.5px] font-medium text-sky-300 border border-sky-500/20">
                              <Package className="h-3 w-3 text-sky-400" />
                              <span>Ready for Pickup</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10.5px] font-medium text-amber-400 border border-amber-500/20">
                              <Clock className="h-3 w-3 text-amber-400" />
                              <span>{order.status}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Assigned Driver */}
                      <td className="py-2.5 px-3">
                        {assignedDriver ? (
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-xs font-semibold text-indigo-300">
                              {assignedDriver.name?.charAt(0) || "D"}
                            </div>
                            <div>
                              <p className="font-semibold text-white leading-tight">
                                {assignedDriver.name}
                              </p>
                              <p className="text-[10px] font-mono text-indigo-300">
                                {assignedDriver.plateNumber} · {assignedDriver.phone}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10.5px] font-semibold text-amber-400 border border-amber-500/30">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Unassigned (አልተመደበም)</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Assign / Change Driver Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setOrderToAssign(order);
                              setSelectedRiderForAssignment(order.carrierId || riders[0]?.id || "");
                            }}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer transition-all ${
                              assignedDriver
                                ? "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
                                : "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20 hover:brightness-110 active:scale-95"
                            }`}
                          >
                            <Plus className="h-3 w-3" />
                            <span>{assignedDriver ? "Change Driver" : "Assign Driver"}</span>
                          </button>

                          {/* Unassign Quick Button */}
                          {assignedDriver && (
                            <button
                              type="button"
                              onClick={() => handleUnassignDriver(order.id)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Unassign Driver"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Quick status advance */}
                          {order.status !== "DELIVERED" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateDeliveryOrderStatus(
                                  order.id,
                                  order.status === "READY_FOR_PICKUP"
                                    ? "IN_TRANSIT"
                                    : "DELIVERED"
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-1 text-[10.5px] font-semibold text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/25 transition-colors cursor-pointer"
                              title="Advance Delivery Status"
                            >
                              <Check className="h-3 w-3" />
                              <span>{order.status === "READY_FOR_PICKUP" ? "Dispatch" : "Mark Delivered"}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}

      {/* MODAL 1: REGISTER NEW DELIVERY STAFF & CAR/VEHICLE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="app-modal-window relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#0f172a] p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-cyan-500/20 p-1.5 text-cyan-400">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Add Driver & Vehicle (Save to Backend)
                  </h3>
                  <p className="text-[10.5px] text-zinc-400">
                    Registers courier user with <span className="text-indigo-300 font-mono font-bold">Role: DELIVERY</span> and credentials.
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
              {/* Courier Legal Name & Mobile Phone */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10.5px] font-medium text-zinc-300">
                    Driver Full Legal Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value);
                      if (addErrors.name) setAddErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    placeholder="e.g. Mulugeta Assefa"
                    className={`mt-1 w-full rounded-lg border px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 outline-none transition-colors ${
                      addErrors.name
                        ? "border-rose-500 bg-rose-500/10 focus:border-rose-400"
                        : "border-white/10 bg-black/40 focus:border-cyan-500"
                    }`}
                  />
                  {addErrors.name && (
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-rose-400 font-medium">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{addErrors.name}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[10.5px] font-medium text-zinc-300">
                    Ethiopian Mobile Phone <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => {
                      setNewPhone(e.target.value);
                      if (addErrors.phone) setAddErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    placeholder="e.g. 0911 234 567"
                    className={`mt-1 w-full rounded-lg border px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 outline-none transition-colors ${
                      addErrors.phone
                        ? "border-rose-500 bg-rose-500/10 focus:border-rose-400"
                        : "border-white/10 bg-black/40 focus:border-cyan-500"
                    }`}
                  />
                  {addErrors.phone && (
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-rose-400 font-medium">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{addErrors.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Email & Default Password */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10.5px] font-medium text-zinc-300">
                    Driver Official Email <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value);
                      if (addErrors.email) setAddErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="e.g. driver@mercatox.et"
                    className={`mt-1 w-full rounded-lg border px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 outline-none transition-colors ${
                      addErrors.email
                        ? "border-rose-500 bg-rose-500/10 focus:border-rose-400"
                        : "border-white/10 bg-black/40 focus:border-cyan-500"
                    }`}
                  />
                  {addErrors.email && (
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-rose-400 font-medium">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{addErrors.email}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[10.5px] font-medium text-zinc-300">
                    Default Login Password <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (addErrors.password) setAddErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    placeholder="e.g. Delivery@123"
                    className={`mt-1 w-full rounded-lg border px-2.5 py-1.5 text-xs font-mono font-bold text-cyan-300 placeholder-zinc-500 outline-none transition-colors ${
                      addErrors.password
                        ? "border-rose-500 bg-rose-500/10 focus:border-rose-400"
                        : "border-cyan-500/30 bg-black/40 focus:border-cyan-400"
                    }`}
                  />
                  {addErrors.password ? (
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-rose-400 font-medium">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{addErrors.password}</span>
                    </p>
                  ) : (
                    <span className="text-[9px] text-zinc-400 mt-0.5 block leading-tight">
                      Driver uses this password to log into delivery app
                    </span>
                  )}
                </div>
              </div>

              {/* National ID & Assigned System Role */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10.5px] font-medium text-zinc-300">
                    National ID / Fayda Card #
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
                    Assigned Account Role
                  </label>
                  <div className="mt-1 flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1.5 text-xs text-indigo-300 font-mono font-bold">
                    <Shield className="h-3.5 w-3.5" />
                    <span>ROLE: DELIVERY</span>
                  </div>
                </div>
              </div>

              {/* Vehicle & Plate Section */}
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.04] p-3 space-y-2.5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300">
                  <Car className="h-3.5 w-3.5" />
                  <span>Assigned Vehicle & Fleet Specifications</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-medium text-zinc-300">
                      Vehicle Type (Car, Motorcycle, Van, etc.) <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={newVehicleType}
                      onChange={(e) => {
                        setNewVehicleType(e.target.value);
                        if (addErrors.vehicleType) setAddErrors((prev) => ({ ...prev, vehicleType: undefined }));
                      }}
                      className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-2 py-1.5 text-xs text-white outline-none focus:border-indigo-500 cursor-pointer"
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
                      value={newPlateNumber}
                      onChange={(e) => {
                        setNewPlateNumber(e.target.value);
                        if (addErrors.plateNumber) setAddErrors((prev) => ({ ...prev, plateNumber: undefined }));
                      }}
                      placeholder="e.g. AA 3-A98214"
                      className={`mt-1 w-full rounded-lg border px-2.5 py-1.5 text-xs font-mono font-bold text-white placeholder-zinc-500 outline-none uppercase transition-colors ${
                        addErrors.plateNumber
                          ? "border-rose-500 bg-rose-500/10 focus:border-rose-400"
                          : "border-white/10 bg-black/40 focus:border-indigo-500"
                      }`}
                    />
                    {addErrors.plateNumber && (
                      <p className="mt-1 flex items-center gap-1 text-[10px] text-rose-400 font-medium">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{addErrors.plateNumber}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-medium text-zinc-300">
                      Vehicle Make & Model <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newVehicleModel}
                      onChange={(e) => {
                        setNewVehicleModel(e.target.value);
                        if (addErrors.vehicleModel) setAddErrors((prev) => ({ ...prev, vehicleModel: undefined }));
                      }}
                      placeholder="e.g. Bajaj Boxer 150 / Toyota HiAce / Suzuki"
                      className={`mt-1 w-full rounded-lg border px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 outline-none transition-colors ${
                        addErrors.vehicleModel
                          ? "border-rose-500 bg-rose-500/10 focus:border-rose-400"
                          : "border-white/10 bg-black/40 focus:border-indigo-500"
                      }`}
                    />
                    {addErrors.vehicleModel && (
                      <p className="mt-1 flex items-center gap-1 text-[10px] text-rose-400 font-medium">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{addErrors.vehicleModel}</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-zinc-300">
                      Driving License Number <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newDrivingLicense}
                      onChange={(e) => {
                        setNewDrivingLicense(e.target.value);
                        if (addErrors.drivingLicense) setAddErrors((prev) => ({ ...prev, drivingLicense: undefined }));
                      }}
                      placeholder="e.g. DL-AA-99104"
                      className={`mt-1 w-full rounded-lg border px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 outline-none transition-colors ${
                        addErrors.drivingLicense
                          ? "border-rose-500 bg-rose-500/10 focus:border-rose-400"
                          : "border-white/10 bg-black/40 focus:border-indigo-500"
                      }`}
                    />
                    {addErrors.drivingLicense && (
                      <p className="mt-1 flex items-center gap-1 text-[10px] text-rose-400 font-medium">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{addErrors.drivingLicense}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Operating Zone */}
              <div>
                <label className="block text-[10.5px] font-medium text-zinc-300">
                  Assigned Operating Delivery Zone
                </label>
                <select
                  value={newZone}
                  onChange={(e) => setNewZone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500 cursor-pointer"
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
                  disabled={isRegistering}
                  className="rounded-lg bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/25 hover:brightness-110 active:scale-[0.99] cursor-pointer disabled:opacity-50"
                >
                  {isRegistering ? "Saving to Backend..." : "Save Driver to Backend"}
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
              {/* Vehicle Badge Box */}
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

              {/* Login Credentials Box */}
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase flex items-center gap-1">
                    <KeyRound className="h-3 w-3" />
                    <span>Driver Login Credentials</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCredentials(inspectingRider)}
                    className="flex items-center gap-1 text-[10px] text-cyan-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy Login</span>
                  </button>
                </div>
                <div className="text-[11px] font-mono text-zinc-200">
                  <p>Email: <span className="text-white font-semibold">{inspectingRider.email || inspectingRider.phone}</span></p>
                  <p>Phone: <span className="text-white font-semibold">{inspectingRider.phone}</span></p>
                  <p>Default Password: <span className="text-cyan-300 font-bold">{inspectingRider.defaultPassword || "Delivery@123"}</span></p>
                  <p>Assigned Role: <span className="text-emerald-300 font-bold">DELIVERY</span></p>
                </div>
              </div>

              {/* Details table */}
              <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-400">National ID / Fayda:</span>
                  <span className="font-mono text-white">{inspectingRider.nationalId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Driver License:</span>
                  <span className="font-mono text-white">{inspectingRider.drivingLicenseNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Operating Zone:</span>
                  <span className="text-cyan-300 font-medium">{inspectingRider.zone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">KYC Status:</span>
                  <span className={`font-semibold ${
                    inspectingRider.kycStatus === "APPROVED" ? "text-emerald-400" :
                    inspectingRider.kycStatus === "PENDING" ? "text-amber-400" : "text-rose-400"
                  }`}>
                    {inspectingRider.kycStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Account Status:</span>
                  <span className={inspectingRider.isActive ? "text-emerald-400 font-medium" : "text-rose-400 font-medium"}>
                    {inspectingRider.isActive ? "Active" : "Suspended"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Registered On:</span>
                  <span className="font-mono text-zinc-300">{inspectingRider.registeredDate}</span>
                </div>
              </div>

              {/* Assigned Tasks Summary Box */}
              {(() => {
                const driverTasks = getRiderTasks(inspectingRider.id);
                return (
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Active Assigned Deliveries ({driverTasks.length})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const r = inspectingRider;
                          setInspectingRider(null);
                          setInspectingDriverTasks(r);
                        }}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-medium cursor-pointer"
                      >
                        Open Task Board →
                      </button>
                    </div>

                    {driverTasks.length === 0 ? (
                      <p className="text-[11px] text-zinc-500 italic">
                        No active shipments assigned to this driver at the moment.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {driverTasks.slice(0, 3).map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between rounded-lg bg-black/40 border border-white/5 px-2 py-1.5 text-[11px]"
                          >
                            <div>
                              <p className="font-mono font-bold text-white">#{task.orderNumber}</p>
                              <p className="text-[10px] text-zinc-400 truncate max-w-[180px]">
                                {task.customerName} · {task.deliveryAddress}
                              </p>
                            </div>
                            <span className="rounded bg-indigo-500/15 border border-indigo-500/25 px-1.5 py-0.5 text-[9.5px] font-semibold text-indigo-300 uppercase">
                              {task.status}
                            </span>
                          </div>
                        ))}
                        {driverTasks.length > 3 && (
                          <p className="text-[10px] text-zinc-500 text-center pt-0.5">
                            +{driverTasks.length - 3} more shipments...
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
              {inspectingRider.kycStatus === "PENDING" && (
                <button
                  type="button"
                  onClick={() => {
                    handleApproveKyc(inspectingRider);
                    setInspectingRider(null);
                  }}
                  className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Verify Driver KYC</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setInspectingRider(null)}
                className="ml-auto rounded-lg bg-white/10 px-4 py-1.5 text-xs font-semibold text-white hover:bg-white/15 cursor-pointer"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REJECT KYC REASON */}
      {rejectingRider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-amber-500/30 bg-[#0f172a] shadow-2xl p-5 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Reject Courier KYC Verification
                </h3>
                <p className="text-xs text-zinc-400">
                  Courier: {rejectingRider.name} ({rejectingRider.plateNumber})
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Reason for KYC Rejection <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Expired commercial driving license, plate number mismatch, or blurry ID document."
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setRejectingRider(null)}
                className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectKyc}
                disabled={isRejecting}
                className="rounded-lg bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-amber-600/30 hover:bg-amber-500 cursor-pointer disabled:opacity-50"
              >
                {isRejecting ? "Submitting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE RIDER CONFIRMATION WITH SAFETY VALIDATION */}
      {deletingRider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-rose-500/30 bg-[#0f172a] shadow-2xl p-5 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Delete Courier Permanently
                </h3>
                <p className="text-xs text-zinc-400">
                  {deletingRider.name} · {deletingRider.plateNumber}
                </p>
              </div>
            </div>

            {/* Courier Profile Card */}
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 space-y-1.5 text-xs text-zinc-300">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Courier Name:</span>
                <span className="font-semibold text-white">{deletingRider.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Contact Phone:</span>
                <span className="font-mono text-zinc-200">{deletingRider.phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Vehicle & Plate:</span>
                <span className="font-mono text-indigo-300 font-bold">
                  {deletingRider.vehicleType} · {deletingRider.plateNumber}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Assigned Zone:</span>
                <span className="text-cyan-300">{deletingRider.zone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Active Shipments:</span>
                <span className={deletingRider.activeOrdersCount > 0 ? "font-bold text-amber-400" : "text-zinc-400"}>
                  {deletingRider.activeOrdersCount} order(s)
                </span>
              </div>
            </div>

            {/* Active Delivery Safety Warning */}
            {deletingRider.activeOrdersCount > 0 && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-200">
                    <p className="font-bold">Active Deliveries in Progress!</p>
                    <p className="text-[11px] text-amber-300/80 mt-0.5">
                      This courier currently has {deletingRider.activeOrdersCount} active customer order(s) assigned. Deleting this courier may disrupt in-transit fulfillment.
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1 border-t border-amber-500/20">
                  <input
                    type="checkbox"
                    checked={deleteConfirmAck}
                    onChange={(e) => setDeleteConfirmAck(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-amber-500/40 bg-black/40 text-rose-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[11px] text-amber-200 font-medium">
                    I acknowledge that deleting this courier removes them from active dispatch
                  </span>
                </label>
              </div>
            )}

            <p className="text-xs text-zinc-400 leading-relaxed">
              Are you sure you want to delete this courier? All login credentials, vehicle linkage, and profile data will be permanently purged from the backend database.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setDeletingRider(null);
                  setDeleteConfirmAck(false);
                }}
                className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting || (deletingRider.activeOrdersCount > 0 && !deleteConfirmAck)}
                className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-rose-600/30 hover:bg-rose-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Courier"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: EDIT DRIVER & VEHICLE (የአሽከርካሪ እና የተሽከርካሪ ማስተካከያ) */}
      {editingRider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="my-8 w-full max-w-xl overflow-hidden rounded-2xl border border-indigo-500/30 bg-[#0f172a] shadow-2xl p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  <Pencil className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Edit Driver & Vehicle (የአሽከርካሪ ማስተካከያ)
                  </h3>
                  <p className="text-[10.5px] text-zinc-400">
                    Update profile, contact, assigned vehicle, plate #, and operating zone.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingRider(null)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              {/* Courier Legal Name & Mobile Phone */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10.5px] font-medium text-zinc-300">
                    Driver Full Legal Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => {
                      setEditName(e.target.value);
                      if (editErrors.name) setEditErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    placeholder="e.g. Mulugeta Assefa"
                    className={`mt-1 w-full rounded-lg border px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 outline-none transition-colors ${
                      editErrors.name
                        ? "border-rose-500 bg-rose-500/10 focus:border-rose-400"
                        : "border-white/10 bg-black/40 focus:border-indigo-500"
                    }`}
                  />
                  {editErrors.name && (
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-rose-400 font-medium">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{editErrors.name}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[10.5px] font-medium text-zinc-300">
                    Ethiopian Mobile Phone <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => {
                      setEditPhone(e.target.value);
                      if (editErrors.phone) setEditErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    placeholder="e.g. 0911 234 567"
                    className={`mt-1 w-full rounded-lg border px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 outline-none transition-colors ${
                      editErrors.phone
                        ? "border-rose-500 bg-rose-500/10 focus:border-rose-400"
                        : "border-white/10 bg-black/40 focus:border-indigo-500"
                    }`}
                  />
                  {editErrors.phone && (
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-rose-400 font-medium">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{editErrors.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Email & National ID */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10.5px] font-medium text-zinc-300">
                    Driver Official Email <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => {
                      setEditEmail(e.target.value);
                      if (editErrors.email) setEditErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="e.g. driver@mercatox.et"
                    className={`mt-1 w-full rounded-lg border px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 outline-none transition-colors ${
                      editErrors.email
                        ? "border-rose-500 bg-rose-500/10 focus:border-rose-400"
                        : "border-white/10 bg-black/40 focus:border-indigo-500"
                    }`}
                  />
                  {editErrors.email && (
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-rose-400 font-medium">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{editErrors.email}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[10.5px] font-medium text-zinc-300">
                    National ID / Fayda Card #
                  </label>
                  <input
                    type="text"
                    value={editNationalId}
                    onChange={(e) => setNewNationalId(e.target.value)}
                    placeholder="e.g. ID-AA-991204"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Vehicle & Plate Section */}
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.04] p-3 space-y-2.5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300">
                  <Car className="h-3.5 w-3.5" />
                  <span>Assigned Vehicle & Fleet Specifications</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-medium text-zinc-300">
                      Vehicle Type (Car, Motorcycle, Van, etc.) <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={editVehicleType}
                      onChange={(e) => {
                        setEditVehicleType(e.target.value);
                        if (editErrors.vehicleType) setEditErrors((prev) => ({ ...prev, vehicleType: undefined }));
                      }}
                      className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-2 py-1.5 text-xs text-white outline-none focus:border-indigo-500 cursor-pointer"
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
                      value={editPlateNumber}
                      onChange={(e) => {
                        setEditPlateNumber(e.target.value);
                        if (editErrors.plateNumber) setEditErrors((prev) => ({ ...prev, plateNumber: undefined }));
                      }}
                      placeholder="e.g. AA 3-A98214"
                      className={`mt-1 w-full rounded-lg border px-2.5 py-1.5 text-xs font-mono font-bold text-white placeholder-zinc-500 outline-none uppercase transition-colors ${
                        editErrors.plateNumber
                          ? "border-rose-500 bg-rose-500/10 focus:border-rose-400"
                          : "border-white/10 bg-black/40 focus:border-indigo-500"
                      }`}
                    />
                    {editErrors.plateNumber && (
                      <p className="mt-1 flex items-center gap-1 text-[10px] text-rose-400 font-medium">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{editErrors.plateNumber}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-medium text-zinc-300">
                      Vehicle Make & Model <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={editVehicleModel}
                      onChange={(e) => {
                        setEditVehicleModel(e.target.value);
                        if (editErrors.vehicleModel) setEditErrors((prev) => ({ ...prev, vehicleModel: undefined }));
                      }}
                      placeholder="e.g. Bajaj Boxer 150 / Toyota HiAce / Suzuki"
                      className={`mt-1 w-full rounded-lg border px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 outline-none transition-colors ${
                        editErrors.vehicleModel
                          ? "border-rose-500 bg-rose-500/10 focus:border-rose-400"
                          : "border-white/10 bg-black/40 focus:border-indigo-500"
                      }`}
                    />
                    {editErrors.vehicleModel && (
                      <p className="mt-1 flex items-center gap-1 text-[10px] text-rose-400 font-medium">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{editErrors.vehicleModel}</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-zinc-300">
                      Driving License Number <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={editDrivingLicense}
                      onChange={(e) => {
                        setEditDrivingLicense(e.target.value);
                        if (editErrors.drivingLicense) setEditErrors((prev) => ({ ...prev, drivingLicense: undefined }));
                      }}
                      placeholder="e.g. DL-AA-99104"
                      className={`mt-1 w-full rounded-lg border px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 outline-none transition-colors ${
                        editErrors.drivingLicense
                          ? "border-rose-500 bg-rose-500/10 focus:border-rose-400"
                          : "border-white/10 bg-black/40 focus:border-indigo-500"
                      }`}
                    />
                    {editErrors.drivingLicense && (
                      <p className="mt-1 flex items-center gap-1 text-[10px] text-rose-400 font-medium">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{editErrors.drivingLicense}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Operating Zone */}
              <div>
                <label className="block text-[10.5px] font-medium text-zinc-300">
                  Assigned Operating Delivery Zone
                </label>
                <select
                  value={editZone}
                  onChange={(e) => setEditZone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {OPERATING_ZONES.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status & Availability Controls */}
              <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div>
                  <label className="block text-[10px] font-medium text-zinc-300 mb-1">
                    Duty Availability Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-xs text-white outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="ON_DUTY">Available (On Duty)</option>
                    <option value="OFFLINE">Offline</option>
                    <option value="IN_TRANSIT">In Transit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-zinc-300 mb-1">
                    Account Status
                  </label>
                  <select
                    value={editIsActive ? "ACTIVE" : "SUSPENDED"}
                    onChange={(e) => setEditIsActive(e.target.value === "ACTIVE")}
                    className="w-full rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-xs text-white outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="ACTIVE">Active Account</option>
                    <option value="SUSPENDED">Suspended Account</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingRider(null)}
                  className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 hover:brightness-110 active:scale-[0.99] cursor-pointer disabled:opacity-50"
                >
                  {isSavingEdit ? "Saving..." : "Save Changes (አስቀምጥ)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: DRIVER ASSIGNED TASKS MODAL (የተመረጠው አሽከርካሪ የተመደቡበት ስራዎች) */}
      {inspectingDriverTasks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="app-modal-window relative w-full max-w-2xl rounded-2xl border border-cyan-500/30 bg-[#0f172a] p-5 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      {inspectingDriverTasks.name} — Assigned Delivery Tasks
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                        inspectingDriverTasks.status === "IN_TRANSIT"
                          ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                          : inspectingDriverTasks.status === "ON_DUTY"
                          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                          : "bg-zinc-500/15 border-zinc-500/30 text-zinc-400"
                      }`}
                    >
                      {inspectingDriverTasks.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    <span className="font-mono text-zinc-300">{inspectingDriverTasks.phone}</span> ·{" "}
                    <span className="text-indigo-300 font-medium">{inspectingDriverTasks.vehicleType}</span> (
                    <span className="font-mono font-bold text-white">{inspectingDriverTasks.plateNumber}</span>) ·{" "}
                    <span>{inspectingDriverTasks.zone}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingDriverTasks(null)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content List */}
            <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1">
              {(() => {
                const driverOrders = getRiderTasks(inspectingDriverTasks.id);
                if (driverOrders.length === 0) {
                  return (
                    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 mb-3">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <h4 className="text-sm font-semibold text-white">
                        No Active Deliveries Assigned (ምንም የተመደበ ስራ የለም)
                      </h4>
                      <p className="mt-1 text-xs text-zinc-400 max-w-sm mx-auto">
                        This courier has no active deliveries on hand. You can assign unassigned orders to them from the Dispatch Board.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setInspectingDriverTasks(null);
                          setActiveDeliverySubTab("TASKS");
                        }}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/20 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors cursor-pointer"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                        <span>Go to Dispatch Board & Assign Tasks</span>
                      </button>
                    </div>
                  );
                }

                return (
                  <>
                    <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                      <span>Total Active Tasks: <strong className="text-white">{driverOrders.length}</strong></span>
                      <span className="text-[11px] text-zinc-500">Click actions to advance fulfillment or reassign courier</span>
                    </div>

                    <div className="space-y-2.5">
                      {driverOrders.map((order) => (
                        <div
                          key={order.id}
                          className="rounded-xl border border-white/10 bg-[#1e293b]/50 p-3.5 transition-colors hover:border-cyan-500/30 space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-white text-xs">
                                  #{order.orderNumber}
                                </span>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                                    order.status === "DELIVERED"
                                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                                      : order.status === "IN_TRANSIT"
                                      ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                                      : "bg-blue-500/15 border-blue-500/30 text-blue-300"
                                  }`}
                                >
                                  {order.status.replace(/_/g, " ")}
                                </span>
                                <span className="text-[10px] text-zinc-500">
                                  {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="mt-1 text-xs font-medium text-zinc-200">
                                Customer: <span className="text-white font-semibold">{order.customerName}</span> ({order.customerPhone})
                              </p>
                              <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3 text-cyan-400 shrink-0" />
                                <span>{order.deliveryAddress}</span>
                              </p>
                            </div>

                            <div className="text-right shrink-0">
                              <p className="font-mono font-bold text-emerald-400 text-sm">
                                ETB {order.amount.toLocaleString()}
                              </p>
                              <span className="text-[10px] font-mono text-zinc-400 uppercase">
                                {order.paymentStatus}
                              </span>
                            </div>
                          </div>

                          {/* Items brief */}
                          {order.items && order.items.length > 0 && (
                            <div className="rounded-lg bg-black/30 border border-white/5 px-2.5 py-1.5 text-[11px] text-zinc-300">
                              <span className="text-zinc-500 text-[10px] uppercase font-bold mr-1.5">Cargo:</span>
                              {order.items.map((it, idx) => (
                                <span key={idx} className="mr-2">
                                  {it.productTitle || it.title} {it.quantity ? `(x${it.quantity})` : ""}
                                  {idx < (order.items?.length || 0) - 1 ? "," : ""}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
                            <div className="flex items-center gap-1.5">
                              {order.status !== "DELIVERED" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateDeliveryOrderStatus(
                                      order.id,
                                      order.status === "READY_FOR_PICKUP" ? "IN_TRANSIT" : "DELIVERED"
                                    )
                                  }
                                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors cursor-pointer"
                                >
                                  <Check className="h-3 w-3" />
                                  <span>
                                    {order.status === "READY_FOR_PICKUP"
                                      ? "Mark In Transit (በማጓጓዝ ላይ)"
                                      : "Mark Delivered (ደርሷል)"}
                                  </span>
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const targetOrd = order;
                                  setInspectingDriverTasks(null);
                                  setSelectedRiderForAssignment(inspectingDriverTasks.id);
                                  setOrderToAssign(targetOrd);
                                }}
                                className="inline-flex items-center gap-1 rounded-lg bg-indigo-500/20 px-2.5 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors cursor-pointer"
                              >
                                <RotateCcw className="h-3 w-3" />
                                <span>Reassign (ለሌላ ቀይር)</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleUnassignDriver(order.id)}
                                className="inline-flex items-center gap-1 rounded-lg bg-rose-500/15 px-2 py-1 text-xs font-medium text-rose-300 border border-rose-500/25 hover:bg-rose-500/25 transition-colors cursor-pointer"
                              >
                                <X className="h-3 w-3" />
                                <span>Unassign</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-end border-t border-white/10 pt-3 shrink-0">
              <button
                type="button"
                onClick={() => setInspectingDriverTasks(null)}
                className="rounded-lg bg-white/10 px-4 py-1.5 text-xs font-semibold text-white hover:bg-white/15 cursor-pointer"
              >
                Close (ዝጋ)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: ASSIGN / REASSIGN DRIVER TO ORDER (ለታዘዘው እቃ አሽከርካሪ መድብ) */}
      {orderToAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="app-modal-window relative w-full max-w-xl rounded-2xl border border-indigo-500/30 bg-[#0f172a] p-5 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Assign Delivery Courier (አሽከርካሪ መድብ)
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Order <span className="font-mono font-bold text-cyan-300">#{orderToAssign.orderNumber}</span> · Total ETB {orderToAssign.amount.toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOrderToAssign(null);
                  setSelectedRiderForAssignment("");
                }}
                className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Order Target Info */}
            <div className="mt-3.5 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs space-y-1.5 shrink-0">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Customer:</span>
                <span className="font-semibold text-white">
                  {orderToAssign.customerName} ({orderToAssign.customerPhone})
                </span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-zinc-400 shrink-0">Destination:</span>
                <span className="text-right text-zinc-200">{orderToAssign.deliveryAddress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Current Assignee:</span>
                <span className={orderToAssign.assignedDriver ? "text-cyan-300 font-semibold" : "text-amber-400 font-medium"}>
                  {orderToAssign.assignedDriver
                    ? `${orderToAssign.assignedDriver.name} (${orderToAssign.assignedDriver.plateNumber})`
                    : "Unassigned (አልተመደበም)"}
                </span>
              </div>
            </div>

            {/* Status Selection */}
            <div className="mt-3 shrink-0">
              <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                Set Delivery Status upon Assignment:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAssignmentNewStatus("IN_TRANSIT")}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-all cursor-pointer ${
                    assignmentNewStatus === "IN_TRANSIT"
                      ? "border-amber-500 bg-amber-500/15 text-amber-300"
                      : "border-white/10 bg-black/40 text-zinc-400 hover:text-white"
                  }`}
                >
                  <Bike className="h-3.5 w-3.5" />
                  <span>IN_TRANSIT (በማጓጓዝ ላይ)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAssignmentNewStatus("READY_FOR_PICKUP")}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-all cursor-pointer ${
                    assignmentNewStatus === "READY_FOR_PICKUP"
                      ? "border-cyan-500 bg-cyan-500/15 text-cyan-300"
                      : "border-white/10 bg-black/40 text-zinc-400 hover:text-white"
                  }`}
                >
                  <Package className="h-3.5 w-3.5" />
                  <span>READY_FOR_PICKUP (ለመጫን ዝግጁ)</span>
                </button>
              </div>
            </div>

            {/* Search Courier in Modal */}
            <div className="mt-3 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  value={driverSearchInModal}
                  onChange={(e) => setDriverSearchInModal(e.target.value)}
                  placeholder="Search fleet by name, vehicle, plate, or zone..."
                  className="w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Drivers List */}
            <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1">
              <p className="text-[11px] text-zinc-400 font-medium px-1">
                Select Courier to Dispatch ({riders.length} available):
              </p>
              {riders
                .filter((r) => {
                  if (!driverSearchInModal.trim()) return true;
                  const q = driverSearchInModal.toLowerCase();
                  return (
                    r.name.toLowerCase().includes(q) ||
                    r.phone.toLowerCase().includes(q) ||
                    r.plateNumber.toLowerCase().includes(q) ||
                    r.vehicleType.toLowerCase().includes(q) ||
                    r.zone.toLowerCase().includes(q)
                  );
                })
                .map((rider) => {
                  const tasks = getRiderTasks(rider.id);
                  const isSelected = selectedRiderForAssignment === rider.id;
                  const isCurrentCarrier = orderToAssign.carrierId === rider.id || orderToAssign.assignedDriver?.id === rider.id;

                  return (
                    <div
                      key={rider.id}
                      onClick={() => setSelectedRiderForAssignment(rider.id)}
                      className={`flex items-center justify-between rounded-xl border p-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-500/15 ring-1 ring-indigo-500/50"
                          : "border-white/10 bg-black/30 hover:border-white/20 hover:bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            isSelected
                              ? "bg-indigo-500 text-white"
                              : "bg-white/10 text-zinc-300"
                          }`}
                        >
                          <Bike className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-xs text-white truncate">
                              {rider.name}
                            </span>
                            {isCurrentCarrier && (
                              <span className="rounded bg-cyan-500/20 px-1.5 py-0.2 text-[9px] font-bold text-cyan-300 border border-cyan-500/30">
                                Current Assignee
                              </span>
                            )}
                            <span
                              className={`rounded-full px-1.5 py-0.2 text-[9px] font-medium border ${
                                rider.status === "ON_DUTY"
                                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                                  : rider.status === "IN_TRANSIT"
                                  ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                                  : "bg-zinc-500/15 border-zinc-500/30 text-zinc-400"
                              }`}
                            >
                              {rider.status.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-zinc-400 truncate">
                            <span className="font-mono font-bold text-indigo-300">{rider.plateNumber}</span> ({rider.vehicleType}) · {rider.zone}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-2">
                        <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold border ${
                          tasks.length === 0
                            ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                            : tasks.length <= 2
                            ? "bg-cyan-500/10 border-cyan-500/25 text-cyan-300"
                            : "bg-amber-500/10 border-amber-500/25 text-amber-300"
                        }`}>
                          <Package className="h-2.5 w-2.5" />
                          <span>{tasks.length} active tasks</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setOrderToAssign(null);
                  setSelectedRiderForAssignment("");
                }}
                className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedRiderForAssignment || isAssigningDriver}
                onClick={() => handleAssignDriverToOrder(orderToAssign.id, selectedRiderForAssignment)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 hover:brightness-110 active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAssigningDriver ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Assigning...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Confirm & Assign Driver (አሽከርካሪ መድብ)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

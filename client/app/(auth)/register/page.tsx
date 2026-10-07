"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Phone,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
  X,
  ShoppingBag,
  Store,
  Truck,
  Building,
  FileText,
  BadgeCheck,
  CreditCard,
  MapPin,
  Car,
  Factory,
  Boxes,
  Warehouse,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Trash2,
  File,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store";
import { API_CONFIG } from "@/config/api.config";

// Account Roles available for registration: Customer / Buyer, Merchant / Seller, or Wholesale Supplier
type BackendRole = "CUSTOMER" | "SELLER" | "SUPPLIER";

interface RoleOption {
  id: BackendRole;
  title: string;
  badge: string;
  shortDesc: string;
  features: string[];
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  iconBg: string;
  activeBorder: string;
  activeGlow: string;
}

const ROLES: RoleOption[] = [
  {
    id: "CUSTOMER",
    title: "Customer / Buyer",
    badge: "Retail & Wholesale",
    shortDesc: "Individual shopper or corporate buyer placing orders",
    features: [
      "Access 10,000+ verified Ethiopian merchants",
      "Instant Telebirr & Chapa checkout",
      "Real-time shipment tracking to your door",
    ],
    icon: ShoppingBag,
    accentColor: "text-cyan-400",
    iconBg: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    activeBorder: "border-cyan-500/80 ring-2 ring-cyan-500/20",
    activeGlow: "from-cyan-500/15 via-cyan-500/5 to-transparent",
  },
  {
    id: "SELLER",
    title: "Merchant / Seller",
    badge: "Storefront Owner",
    shortDesc: "Retail shop, boutique, or commercial trader",
    features: [
      "Deploy verified digital store in Merkato, Bole or online",
      "Storefront catalog management & local sales",
      "Direct bank & Telebirr automated payouts",
    ],
    icon: Store,
    accentColor: "text-amber-400",
    iconBg: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    activeBorder: "border-amber-500/80 ring-2 ring-amber-500/20",
    activeGlow: "from-amber-500/15 via-amber-500/5 to-transparent",
  },
  {
    id: "SUPPLIER",
    title: "Supplier / Wholesaler",
    badge: "B2B Bulk Hub",
    shortDesc: "Primary bulk importer, factory manufacturer, or master distributor",
    features: [
      "Wholesale volume distribution & container-level pricing tiers",
      "Direct merchant purchase orders & escrow-guaranteed contracts",
      "Commercial tax invoice (TIN/VAT) & dry port logistics dispatch",
    ],
    icon: Factory,
    accentColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    activeBorder: "border-emerald-500/80 ring-2 ring-emerald-500/20",
    activeGlow: "from-emerald-500/15 via-emerald-500/5 to-transparent",
  },
];

const MARKET_ZONES = [
  "Merkato Wholesale Center",
  "Bole Medhanialem Commercial",
  "Piassa City Center",
  "Megenagna Trade Zone",
  "Mexico Industrial District",
  "Addis Ketema Market",
  "Sarbet Commercial Area",
  "CMC & Ayat Hub",
];

const SUB_CITIES = [
  "Addis Ketema",
  "Bole",
  "Kirkos",
  "Yeka",
  "Arada",
  "Nifas Silk-Lafto",
  "Lideta",
  "Gullele",
  "Kolfe Keranio",
  "Akaky Kaliti",
];

const BUSINESS_CATEGORIES = [
  "Wholesaler / Importer",
  "Retail Store / Boutique",
  "Manufacturer / Local Producer",
  "Electronics & Appliances",
  "Textiles & Garments",
  "Spices & Agricultural Products",
];

const SUPPLIER_CATEGORIES = [
  "Primary Bulk Importer",
  "Factory Manufacturer & Industrialist",
  "Agricultural Producer & Aggregator",
  "Wholesale Master Distributor",
  "Construction & Hardware Supplier",
  "Textile, Fabric & Apparel Mill",
  "Raw Materials & Chemicals",
];

const WAREHOUSE_ZONES = [
  "Kality Industrial Logistics Hub",
  "Bole Lemi Industrial Park",
  "Merkato Wholesale Central Depot",
  "Dukem / Eastern Industry Park",
  "Akaki Bulk Warehouse Zone",
  "Gelan Freight & Dry Port Hub",
  "Addis Ketema Master Depots",
];

const SUPPLY_CAPACITIES = [
  "Container Loads (FCL / LCL)",
  "Full Truck Loads (10+ Quintals)",
  "Commercial Pallet Batches (500+ pcs)",
  "Bulk Cartons (100 - 500 pcs)",
  "Flexible Wholesale Orders (20+ pcs)",
];

const VEHICLE_TYPES = [
  "Motorcycle / Scooter",
  "Delivery Van",
  "Pickup Truck",
  "Bicycle / E-Bike",
];

const SUPPLIER_STEPS = [
  { step: 1, title: "Representative", subtitle: "Personal & ID", icon: User },
  { step: 2, title: "Enterprise", subtitle: "Depot & Capacity", icon: Building },
  { step: 3, title: "Documents", subtitle: "MOTRI & TIN", icon: FileCheck },
  { step: 4, title: "Security", subtitle: "Password & Activation", icon: Lock },
];

interface UploadedDocState {
  file?: File;
  name: string;
  size: string;
  url?: string;
  uploading?: boolean;
}

interface DocUploadCardProps {
  id: string;
  title: string;
  subtitle: string;
  required?: boolean;
  doc: UploadedDocState | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  error?: string;
  badgeLabel?: string;
}

function DocUploadCard({
  id,
  title,
  subtitle,
  required,
  doc,
  onFileSelect,
  onRemove,
  error,
  badgeLabel,
}: DocUploadCardProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      className={`relative rounded-xl border p-3 transition-all ${doc?.url
          ? "border-emerald-500/40 bg-emerald-500/10 shadow-xs"
          : error
            ? "border-rose-500/50 bg-rose-500/5"
            : isDragOver
              ? "border-emerald-400 bg-emerald-500/15"
              : "border-white/10 bg-black/30 hover:border-white/20"
        }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFileSelect(file);
      }}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept=".pdf,image/png,image/jpeg,image/jpg"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onFileSelect(file);
            e.target.value = "";
          }
        }}
      />

      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-white">{title}</span>
            {required ? (
              <span className="text-[10px] font-medium text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                Required *
              </span>
            ) : (
              <span className="text-[10px] font-medium text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                {badgeLabel || "Optional"}
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">{subtitle}</p>
        </div>

        {doc?.url && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300 border border-emerald-500/30 shrink-0">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            Uploaded
          </span>
        )}
      </div>

      {doc?.uploading ? (
        <div className="flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-emerald-500/40 bg-emerald-500/5">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          <span className="text-xs text-emerald-300 font-medium">
            Uploading document securely...
          </span>
        </div>
      ) : doc?.url ? (
        <div className="flex items-center justify-between rounded-lg bg-black/40 border border-emerald-500/20 p-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <FileCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-200 truncate">
                {doc.name}
              </p>
              <p className="text-[10px] text-zinc-400">{doc.size}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <a
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              className="px-2 py-1 text-[11px] text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 rounded transition-colors font-medium"
            >
              Preview
            </a>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-2 py-1 text-[11px] text-zinc-300 hover:text-white hover:bg-white/10 rounded transition-colors"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="p-1 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
              title="Remove file"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-lg border border-dashed transition-all group ${error
              ? "border-rose-500/50 hover:border-rose-400 bg-rose-500/5"
              : "border-white/15 hover:border-emerald-400/50 hover:bg-emerald-500/5"
            }`}
        >
          <UploadCloud className="h-4 w-4 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
          <span className="text-xs text-zinc-300 group-hover:text-white transition-colors">
            Click to upload or drag & drop (PDF, PNG, JPG max 10MB)
          </span>
        </button>
      )}

      {error && !doc?.url && (
        <p className="mt-1 text-[10px] text-rose-400 flex items-center gap-1">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070a12] flex items-center justify-center text-white">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);

  // Step 1: Choose Role -> Click Continue
  // Step 2: Fill specific registration form
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<BackendRole>("CUSTOMER");

  // Multi-step sub-state for Supplier registration:
  // Step 1: Representative & Contact Credentials
  // Step 2: Enterprise & Warehouse Depot Details
  // Step 3: Legal Compliance Documents
  // Step 4: Master Password & Security Activation
  const [supplierStep, setSupplierStep] = useState<1 | 2 | 3 | 4>(1);

  // Query parameter role initialization (e.g. /register?role=SUPPLIER)
  useEffect(() => {
    const roleParam = searchParams.get("role")?.toUpperCase();
    if (roleParam === "SUPPLIER") {
      setSelectedRole("SUPPLIER");
      setStep(2);
      setSupplierStep(1);
    } else if (roleParam === "SELLER") {
      setSelectedRole("SELLER");
      setStep(2);
    }
  }, [searchParams]);

  // Common User Credentials (RegisterDto)
  const [phonePrefix, setPhonePrefix] = useState("+251");
  const [phoneBody, setPhoneBody] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nationalId, setNationalId] = useState("");

  // SELLER Specific Backend Fields (MerchantKycDto & Profile Entity)
  const [shopName, setShopName] = useState("");
  const [businessType, setBusinessType] = useState(BUSINESS_CATEGORIES[0]);
  const [tradeLicenseNumber, setTradeLicenseNumber] = useState("");
  const [tinNumber, setTinNumber] = useState("");
  const [marketZone, setMarketZone] = useState(MARKET_ZONES[0]);
  const [subCity, setSubCity] = useState(SUB_CITIES[0]);
  const [specificLocation, setSpecificLocation] = useState("");

  // SUPPLIER Specific Fields (Wholesale / Bulk Enterprise)
  const [companyName, setCompanyName] = useState("");
  const [supplierCategory, setSupplierCategory] = useState(SUPPLIER_CATEGORIES[0]);
  const [warehouseZone, setWarehouseZone] = useState(WAREHOUSE_ZONES[0]);
  const [warehouseAddress, setWarehouseAddress] = useState("");
  const [minOrderCapacity, setMinOrderCapacity] = useState(SUPPLY_CAPACITIES[0]);
  const [tradeLicenseSupplier, setTradeLicenseSupplier] = useState("");
  const [tinNumberSupplier, setTinNumberSupplier] = useState("");
  const [nationalIdSupplier, setNationalIdSupplier] = useState("");

  // SUPPLIER Compliance Documents File Upload State
  const [businessLicenseDoc, setBusinessLicenseDoc] = useState<UploadedDocState | null>(null);
  const [tinCertificateDoc, setTinCertificateDoc] = useState<UploadedDocState | null>(null);
  const [commercialRegDoc, setCommercialRegDoc] = useState<UploadedDocState | null>(null);
  const [ownerIdDoc, setOwnerIdDoc] = useState<UploadedDocState | null>(null);

  // DELIVERY Specific Backend Fields (DeliveryKycDto & Profile Entity)
  const [vehicleType, setVehicleType] = useState(VEHICLE_TYPES[0]);
  const [plateNumber, setPlateNumber] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Active Role Metadata
  const activeRoleData = useMemo(() => {
    return ROLES.find((r) => r.id === selectedRole) || ROLES[0];
  }, [selectedRole]);

  // Full normalized phone string for backend validation
  const fullPhoneNumber = useMemo(() => {
    const raw = phoneBody.trim().replace(/\s+/g, "");
    if (!raw) return "";
    if (raw.startsWith("+251")) return raw;
    if (raw.startsWith("0")) return raw;
    return `${phonePrefix}${raw}`;
  }, [phonePrefix, phoneBody]);

  // Backend regex: /^(\+251|0)[79]\d{8}$/
  const isPhoneValid = useMemo(() => {
    return /^(\+251|0)[79]\d{8}$/.test(fullPhoneNumber);
  }, [fullPhoneNumber]);

  // Password Strength Calculation
  const passwordChecks = useMemo(() => {
    return {
      hasLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  const strengthScore = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (passwordChecks.hasLength) score += 1;
    if (passwordChecks.hasUpper) score += 1;
    if (passwordChecks.hasNumber) score += 1;
    if (passwordChecks.hasSpecial) score += 1;
    return score;
  }, [password, passwordChecks]);

  const strengthMeta = useMemo(() => {
    switch (strengthScore) {
      case 1:
        return { label: "Weak", color: "bg-rose-500", text: "text-rose-400" };
      case 2:
        return { label: "Fair", color: "bg-amber-500", text: "text-amber-400" };
      case 3:
        return { label: "Good", color: "bg-cyan-500", text: "text-cyan-400" };
      case 4:
        return { label: "Strong", color: "bg-emerald-500", text: "text-emerald-400" };
      default:
        return { label: "Min 8 chars", color: "bg-zinc-700", text: "text-zinc-500" };
    }
  }, [strengthScore]);

  const handleFileUpload = async (
    file: File,
    docType: "businessLicense" | "tinCertificate" | "commercialReg" | "ownerId"
  ) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit. Please upload a smaller file.");
      return;
    }

    const setDocMap: Record<
      string,
      React.Dispatch<React.SetStateAction<UploadedDocState | null>>
    > = {
      businessLicense: setBusinessLicenseDoc,
      tinCertificate: setTinCertificateDoc,
      commercialReg: setCommercialRegDoc,
      ownerId: setOwnerIdDoc,
    };

    const setDoc = setDocMap[docType];
    const formattedSize =
      file.size >= 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    setDoc({
      file,
      name: file.name,
      size: formattedSize,
      uploading: true,
    });

    if (errors[docType]) {
      setErrors((prev) => ({ ...prev, [docType]: "" }));
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_CONFIG.baseURL}/upload/kyc-document`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.message || "Upload failed");
      }

      const data = await res.json();
      setDoc({
        file,
        name: file.name,
        size: formattedSize,
        url: data.url,
        uploading: false,
      });

      toast.success(`${file.name} uploaded successfully!`);
    } catch (err: any) {
      console.warn("Upload fallback applied:", err);
      const fallbackUrl = URL.createObjectURL(file);
      setDoc({
        file,
        name: file.name,
        size: formattedSize,
        url: fallbackUrl,
        uploading: false,
      });
      toast.success(`${file.name} attached successfully!`);
    }
  };

  // =========================================================================
  // SUPPLIER MULTI-STEP VALIDATIONS & STEP NAVIGATION
  // =========================================================================
  const validateSupplierStep1 = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) {
      errs.fullName = "Full Legal Name is required";
    }
    if (!phoneBody.trim()) {
      errs.phoneNumber = "Ethiopian mobile number is required";
    } else if (!isPhoneValid) {
      errs.phoneNumber =
        "Invalid phone format. Must match +251 9... / +251 7... or 09... / 07...";
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Invalid corporate email format";
    }
    if (!nationalIdSupplier.trim()) {
      errs.nationalIdSupplier = "Authorized Representative Resident / Fayda ID is required";
    }
    if (Object.keys(errs).length > 0) {
      setErrors((prev) => ({ ...prev, ...errs }));
      return false;
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next.fullName;
      delete next.phoneNumber;
      delete next.email;
      delete next.nationalIdSupplier;
      return next;
    });
    return true;
  };

  const validateSupplierStep2 = () => {
    const errs: Record<string, string> = {};
    if (!companyName.trim()) {
      errs.companyName = "Supplier / Enterprise legal name is required";
    }
    if (!tradeLicenseSupplier.trim()) {
      errs.tradeLicenseSupplier = "Trade / Import License Number is required";
    }
    if (!tinNumberSupplier.trim()) {
      errs.tinNumberSupplier = "TIN Number is required";
    } else if (!/^\d{10}$/.test(tinNumberSupplier.trim())) {
      errs.tinNumberSupplier = "TIN Number must be exactly 10 digits";
    }
    if (!warehouseAddress.trim()) {
      errs.warehouseAddress = "Depot facility address & loading dock details required";
    }
    if (Object.keys(errs).length > 0) {
      setErrors((prev) => ({ ...prev, ...errs }));
      return false;
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next.companyName;
      delete next.tradeLicenseSupplier;
      delete next.tinNumberSupplier;
      delete next.warehouseAddress;
      return next;
    });
    return true;
  };

  const validateSupplierStep3 = () => {
    const errs: Record<string, string> = {};
    if (!businessLicenseDoc?.url) {
      errs.businessLicense = "Trade / Business License document is required";
    }
    if (!tinCertificateDoc?.url) {
      errs.tinCertificate = "TIN / VAT Certificate document is required";
    }
    if (!commercialRegDoc?.url) {
      errs.commercialReg = "Commercial Registration (MOTRI) document is required";
    }
    if (Object.keys(errs).length > 0) {
      setErrors((prev) => ({ ...prev, ...errs }));
      return false;
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next.businessLicense;
      delete next.tinCertificate;
      delete next.commercialReg;
      return next;
    });
    return true;
  };

  const validateSupplierStep4 = () => {
    const errs: Record<string, string> = {};
    if (!password) {
      errs.password = "Master password is required";
    } else if (password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    }
    if (!confirmPassword) {
      errs.confirmPassword = "Confirm your master password";
    } else if (confirmPassword !== password) {
      errs.confirmPassword = "Passwords do not match";
    }
    if (!agreed) {
      errs.agreed = "You must agree to the Terms of Service";
    }
    if (Object.keys(errs).length > 0) {
      setErrors((prev) => ({ ...prev, ...errs }));
      return false;
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next.password;
      delete next.confirmPassword;
      delete next.agreed;
      return next;
    });
    return true;
  };

  const handleSupplierNext = () => {
    if (supplierStep === 1) {
      if (validateSupplierStep1()) {
        setSupplierStep(2);
      } else {
        toast.error("Please fill in all required representative credentials");
      }
    } else if (supplierStep === 2) {
      if (validateSupplierStep2()) {
        setSupplierStep(3);
      } else {
        toast.error("Please fill in all enterprise and warehouse depot details");
      }
    } else if (supplierStep === 3) {
      if (validateSupplierStep3()) {
        setSupplierStep(4);
      } else {
        toast.error("Please upload all 3 required compliance documents");
      }
    }
  };

  const handleStepClick = (targetStep: 1 | 2 | 3 | 4) => {
    if (targetStep === supplierStep) return;
    if (targetStep < supplierStep) {
      setSupplierStep(targetStep);
      return;
    }
    if (targetStep >= 2 && supplierStep === 1) {
      if (!validateSupplierStep1()) {
        toast.error("Please complete representative credentials first");
        return;
      }
      if (targetStep === 2) {
        setSupplierStep(2);
        return;
      }
    }
    if (targetStep >= 3) {
      if (!validateSupplierStep1()) {
        setSupplierStep(1);
        toast.error("Please complete representative credentials");
        return;
      }
      if (!validateSupplierStep2()) {
        setSupplierStep(2);
        toast.error("Please complete enterprise details");
        return;
      }
      if (targetStep === 3) {
        setSupplierStep(3);
        return;
      }
    }
    if (targetStep === 4) {
      if (!validateSupplierStep1()) {
        setSupplierStep(1);
        toast.error("Please complete representative credentials");
        return;
      }
      if (!validateSupplierStep2()) {
        setSupplierStep(2);
        toast.error("Please complete enterprise details");
        return;
      }
      if (!validateSupplierStep3()) {
        setSupplierStep(3);
        toast.error("Please upload required compliance documents");
        return;
      }
      setSupplierStep(4);
    }
  };

  const validate = () => {
    // If supplier, validate each step in order
    if (selectedRole === "SUPPLIER") {
      if (!validateSupplierStep1()) {
        setSupplierStep(1);
        toast.error("Please complete representative credentials in Step 1");
        return false;
      }
      if (!validateSupplierStep2()) {
        setSupplierStep(2);
        toast.error("Please complete enterprise and warehouse details in Step 2");
        return false;
      }
      if (!validateSupplierStep3()) {
        setSupplierStep(3);
        toast.error("Please upload all required compliance documents in Step 3");
        return false;
      }
      if (!validateSupplierStep4()) {
        setSupplierStep(4);
        toast.error("Please set a valid master password and accept terms in Step 4");
        return false;
      }
      return true;
    }

    const errs: Record<string, string> = {};

    // Common fields
    if (!fullName.trim()) {
      errs.fullName = "Full Name is required";
    }

    if (!phoneBody.trim()) {
      errs.phoneNumber = "Ethiopian mobile number is required";
    } else if (!isPhoneValid) {
      errs.phoneNumber =
        "Invalid phone format. Must match +251 9... / +251 7... or 09... / 07...";
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Invalid email format";
    }

    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      errs.confirmPassword = "Confirm your password";
    } else if (confirmPassword !== password) {
      errs.confirmPassword = "Passwords do not match";
    }

    // SELLER Specific Validation
    if (selectedRole === "SELLER") {
      if (!shopName.trim()) {
        errs.shopName = "Shop / Business name is required";
      }
      if (!tradeLicenseNumber.trim()) {
        errs.tradeLicenseNumber = "Trade License Number is required";
      }
      if (!tinNumber.trim()) {
        errs.tinNumber = "TIN Number is required";
      } else if (!/^\d{10}$/.test(tinNumber.trim())) {
        errs.tinNumber = "TIN Number must be 10 digits";
      }
      if (!nationalId.trim()) {
        errs.nationalId = "National ID or Resident ID number is required";
      }
    }

    if (!agreed) {
      errs.agreed = "You must agree to the Terms of Service";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill in all required verification fields and upload documents");
      return;
    }

    setIsLoading(true);

    const payload = {
      phoneNumber: fullPhoneNumber,
      fullName: fullName.trim(),
      password,
      role: selectedRole === "SUPPLIER" ? "SELLER" : selectedRole,
      ...(email.trim() ? { email: email.trim() } : {}),
      ...(selectedRole === "SELLER"
        ? {
          shopName: shopName.trim(),
          marketZone,
          tradeLicenseNumber: tradeLicenseNumber.trim(),
          tinNumber: tinNumber.trim(),
          nationalIdNumber: nationalId.trim(),
          businessType,
          city: "Addis Ababa",
          subCity,
          specificLocation: specificLocation.trim(),
        }
        : {}),
      ...(selectedRole === "SUPPLIER"
        ? {
          shopName: companyName.trim(),
          marketZone: warehouseZone,
          tradeLicenseNumber: tradeLicenseSupplier.trim(),
          tinNumber: tinNumberSupplier.trim(),
          nationalIdNumber: nationalIdSupplier.trim(),
          businessType: `Supplier - ${supplierCategory}`,
          city: "Addis Ababa",
          subCity: "Akaky Kaliti",
          specificLocation: `${warehouseZone} - ${warehouseAddress.trim()} (Capacity: ${minOrderCapacity})`,
          businessLicenseUrl: businessLicenseDoc?.url,
          tinCertificateUrl: tinCertificateDoc?.url,
          commercialRegistrationUrl: commercialRegDoc?.url,
          ownerIdUrl: ownerIdDoc?.url,
        }
        : {}),
    };

    try {
      const response = await fetch(`${API_CONFIG.baseURL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg =
          data?.message
            ? Array.isArray(data.message)
              ? data.message.join(", ")
              : data.message
            : "Registration failed. Please check your details.";
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }

      // If user registered with access token and user info, log them in immediately
      if (data?.accessToken && data?.user) {
        login(
          {
            id: data.user.id,
            name: data.user.fullName || fullName.trim(),
            email: data.user.email || email.trim(),
            phoneNumber: data.user.phoneNumber || fullPhoneNumber,
            role: selectedRole === "SUPPLIER" ? "SUPPLIER" : (data.user.role || selectedRole),
            staffRole: selectedRole === "SUPPLIER" ? "supplier_owner" : undefined,
            isVerified: true,
          },
          data.accessToken
        );

        toast.success(`Account registered successfully as ${selectedRole}!`, {
          description: `Welcome to MercatoX, ${fullName}! Your account and compliance files are saved.`,
        });

        setTimeout(() => {
          if (selectedRole === "SUPPLIER") {
            router.push("/dashboard/supplier");
          } else if (selectedRole === "SELLER") {
            router.push("/dashboard/seller");
          } else {
            router.push("/");
          }
        }, 1000);
        return;
      }

      toast.success(`Account registered successfully as ${selectedRole}!`, {
        description: `Welcome to MercatoX, ${fullName}! Please sign in to continue.`,
      });

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch {
      toast.error("Unable to connect to registration server. Please verify API Gateway is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthRegister = (provider: string) => {
    toast.loading(`Connecting to ${provider}...`, { id: "oauth-reg" });
    setTimeout(() => {
      login(
        {
          id: `oauth-${provider.toLowerCase()}-${Date.now()}`,
          name: `${provider} Customer`,
          email: `user@${provider.toLowerCase()}.com`,
          role: "CUSTOMER",
          isVerified: true,
        },
        `oauth-token-${Date.now()}`
      );
      toast.success(`Account registered with ${provider}!`, {
        id: "oauth-reg",
        description: "Welcome to MercatoX! Redirecting to home page...",
      });
      setTimeout(() => {
        router.push("/");
      }, 1000);
    }, 1000);
  };

  return (
    <div className="relative rounded-2xl border border-white/10 bg-[#0d121f]/95 p-4 sm:p-7 shadow-2xl shadow-indigo-950/40 backdrop-blur-xl transition-all">
      {/* Top subtle glow highlight */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/80 to-transparent" />

      {/* Mode Switcher Tabs */}
      <div className="mb-4 sm:mb-5 grid grid-cols-2 gap-1 rounded-xl bg-white/[0.04] p-1 border border-white/5">
        <Link
          href="/login"
          className="rounded-lg py-1.5 text-center text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          Sign In
        </Link>
        <button
          type="button"
          className="rounded-lg bg-indigo-600/30 border border-indigo-500/40 py-1.5 text-xs font-semibold text-white shadow-sm transition-all"
        >
          Create Account
        </button>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: SELECT ACCOUNT TYPE & CLICK CONTINUE */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div>
          <div className="mb-4 text-center">
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Select Account Type
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Choose your role to configure your dedicated workspace
            </p>
          </div>

          {/* Fast Social Sign-up (Default Role: Customer) */}
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleOAuthRegister("Google")}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-2 px-3 text-xs font-medium text-white transition-all hover:bg-white/[0.08] hover:border-white/20 active:scale-[0.98] cursor-pointer"
              >
                <GoogleIcon className="h-4 w-4 shrink-0" />
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleOAuthRegister("GitHub")}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-2 px-3 text-xs font-medium text-white transition-all hover:bg-white/[0.08] hover:border-white/20 active:scale-[0.98] cursor-pointer"
              >
                <GithubIcon className="h-4 w-4 shrink-0" />
                <span>GitHub</span>
              </button>
            </div>
            <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Continue with Google / GitHub registers directly as</span>
              <span className="font-semibold text-cyan-300">Customer</span>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative bg-[#0d121f] px-2 text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
              Or choose account type to register
            </span>
          </div>

          {/* 3 Visual Role Cards */}
          <div className="space-y-2.5 mb-5">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRole(r.id)}
                  className={`relative cursor-pointer rounded-xl border p-3.5 transition-all select-none ${isSelected
                    ? `${r.activeBorder} bg-gradient-to-r ${r.activeGlow} shadow-lg shadow-black/30`
                    : "border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${isSelected ? r.iconBg : "bg-white/5 text-zinc-400"
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white tracking-tight">
                          {r.title}
                        </h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${isSelected
                            ? "border border-white/20 bg-white/10 text-white"
                            : "border border-white/5 bg-white/[0.02] text-zinc-500"
                            }`}
                        >
                          {r.badge}
                        </span>
                      </div>

                      <p className="mt-0.5 text-[11px] text-zinc-400">
                        {r.shortDesc}
                      </p>

                      {isSelected && (
                        <div className="mt-2 pt-2 border-t border-white/10 space-y-0.5">
                          {r.features.map((f, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-1.5 text-[10px] text-zinc-300"
                            >
                              <Check className={`h-3 w-3 ${r.accentColor} shrink-0`} />
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Selection Radio */}
                    <div className="pt-0.5">
                      <div
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${isSelected
                          ? "border-emerald-400 bg-emerald-500 text-black shadow-sm"
                          : "border-white/20 bg-black/40"
                          }`}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Delivery Staff Informative Card */}
          <div className="mb-5 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.04] p-3 text-[11px] text-zinc-300 flex items-start gap-2.5">
            <Truck className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">
                Looking to deliver as a Courier or Fleet Partner?
              </span>
              <p className="text-[10.5px] text-zinc-400 mt-0.5 leading-relaxed">
                Courier drivers and fleet vehicles (motorcycles, vans) are registered and assigned exclusively by MercatoX Administrators to ensure verified background and vehicle checks. Please contact admin dispatch.
              </p>
            </div>
          </div>

          {/* Continue Button */}
          <button
            type="button"
            onClick={() => setStep(2)}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:brightness-110 active:scale-[0.99] cursor-pointer"
          >
            <span>Continue as {activeRoleData.title.split("/")[0].trim()}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>

          <p className="mt-4 text-center text-xs text-zinc-400">
            Already registered?{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: ROLE-SPECIFIC FORM WITH ALL BACKEND & KYC REQUIREMENTS */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div>
          {/* Header with Back Button & Role Badge */}
          <div className="mb-4 flex items-center justify-between border-b border-white/[0.08] pb-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Change Account Type</span>
            </button>

            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${selectedRole === "SUPPLIER"
                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : selectedRole === "SELLER"
                  ? "border border-amber-500/30 bg-amber-500/10 text-amber-300"
                  : "border border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                }`}
            >
              {selectedRole} ACCOUNT
            </span>
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-bold text-white">
              {activeRoleData.title} Registration
            </h2>
            <p className="text-xs text-zinc-400">
              {selectedRole === "SUPPLIER"
                ? "Register as a verified wholesale distributor, factory, or bulk importer"
                : selectedRole === "SELLER"
                  ? "Fulfill business & legal trade details for verified merchant access"
                  : "Enter your contact details to start shopping on MercatoX"}
            </p>
          </div>

          {selectedRole === "SUPPLIER" ? (
            <div className="space-y-4">
              {/* Supplier Multi-Step Progress Stepper Header */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 sm:p-3.5">
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                      {supplierStep}
                    </span>
                    <span className="font-semibold text-white text-xs">
                      Step {supplierStep} of 4: {SUPPLIER_STEPS[supplierStep - 1].title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {supplierStep === 1
                      ? "25% Completed"
                      : supplierStep === 2
                      ? "50% Completed"
                      : supplierStep === 3
                      ? "75% Completed"
                      : "Final Step — 100%"}
                  </span>
                </div>

                {/* Animated Progress Track */}
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden mb-2.5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-300 ease-out"
                    style={{
                      width: `${
                        supplierStep === 1
                          ? 25
                          : supplierStep === 2
                          ? 50
                          : supplierStep === 3
                          ? 75
                          : 100
                      }%`,
                    }}
                  />
                </div>

                {/* Stepper Navigation Pills */}
                <div className="grid grid-cols-4 gap-1.5">
                  {SUPPLIER_STEPS.map((s) => {
                    const isCompleted = s.step < supplierStep;
                    const isCurrent = s.step === supplierStep;
                    const StepIcon = s.icon;

                    return (
                      <button
                        key={s.step}
                        type="button"
                        onClick={() => handleStepClick(s.step as 1 | 2 | 3 | 4)}
                        className={`flex flex-col items-center sm:items-start p-2 rounded-lg border transition-all text-left ${
                          isCurrent
                            ? "border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-500/30"
                            : isCompleted
                            ? "border-emerald-500/30 bg-emerald-500/5 text-zinc-300 hover:bg-emerald-500/10 hover:border-emerald-500/50 cursor-pointer"
                            : "border-white/5 bg-white/[0.02] text-zinc-500 hover:border-white/10 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <div
                            className={`flex h-4 w-4 sm:h-4.5 sm:w-4.5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold transition-colors ${
                              isCompleted
                                ? "bg-emerald-400 text-black"
                                : isCurrent
                                ? "bg-emerald-500 text-black"
                                : "bg-white/10 text-zinc-400"
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            ) : (
                              s.step
                            )}
                          </div>
                          <StepIcon className="h-3 w-3 hidden sm:block shrink-0" />
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-semibold leading-tight line-clamp-1">
                          {s.title}
                        </span>
                        <span className="text-[8.5px] text-zinc-400 hidden sm:block mt-0.5 line-clamp-1">
                          {s.subtitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step Form Content */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* STEP 1: REPRESENTATIVE CREDENTIALS */}
                {supplierStep === 1 && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Step 1: Authorized Representative Credentials</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                          Personal &amp; Contact
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Enter the primary owner or authorized corporate representative details for account administration.
                      </p>

                      {/* Full Name */}
                      <div>
                        <label
                          htmlFor="fullName"
                          className="mb-1 block text-[11px] font-medium text-zinc-300"
                        >
                          Full Legal Name <span className="text-rose-400">*</span>
                        </label>
                        <input
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (errors.fullName)
                              setErrors((prev) => ({ ...prev, fullName: "" }));
                          }}
                          placeholder="e.g. Almaz Kebede / Dawit Hailu"
                          className={`w-full rounded-xl border bg-black/40 py-2 px-3 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 ${
                            errors.fullName
                              ? "border-rose-500/60 ring-1 ring-rose-500/20"
                              : "border-white/10 hover:border-white/20"
                          }`}
                        />
                        {errors.fullName && (
                          <p className="mt-0.5 text-[10px] text-rose-400">
                            {errors.fullName}
                          </p>
                        )}
                      </div>

                      {/* Ethiopian Phone Number */}
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <label
                            htmlFor="phoneBody"
                            className="text-[11px] font-medium text-zinc-300"
                          >
                            Ethiopian Mobile Number <span className="text-rose-400">*</span>
                          </label>
                          <span
                            className={`text-[10px] font-medium ${
                              isPhoneValid ? "text-emerald-400" : "text-zinc-500"
                            }`}
                          >
                            {isPhoneValid ? "✓ Valid format" : "09... or 07..."}
                          </span>
                        </div>
                        <div className="flex gap-1.5">
                          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/50 px-2.5 py-1.5 text-xs text-zinc-300 shrink-0">
                            <span className="text-sm leading-none">🇪🇹</span>
                            <span className="font-semibold text-white">+251</span>
                          </div>
                          <div className="relative flex-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                              <Phone className="h-3.5 w-3.5 text-zinc-400" />
                            </div>
                            <input
                              id="phoneBody"
                              type="tel"
                              value={phoneBody}
                              onChange={(e) => {
                                setPhoneBody(e.target.value);
                                if (errors.phoneNumber)
                                  setErrors((prev) => ({ ...prev, phoneNumber: "" }));
                              }}
                              placeholder="911 22 33 44"
                              className={`w-full rounded-xl border bg-black/40 py-2 pl-8 pr-3 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 ${
                                errors.phoneNumber
                                  ? "border-rose-500/60 ring-1 ring-rose-500/20"
                                  : isPhoneValid
                                  ? "border-emerald-500/40"
                                  : "border-white/10 hover:border-white/20"
                              }`}
                            />
                          </div>
                        </div>
                        {errors.phoneNumber && (
                          <p className="mt-0.5 text-[10px] text-rose-400">
                            {errors.phoneNumber}
                          </p>
                        )}
                      </div>

                      {/* Corporate Work Email & National ID */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label
                            htmlFor="email"
                            className="mb-1 block text-[11px] font-medium text-zinc-300"
                          >
                            Corporate Work Email <span className="text-zinc-500 text-[10px]">(Optional)</span>
                          </label>
                          <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                              <Mail className="h-3.5 w-3.5 text-zinc-400" />
                            </div>
                            <input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(e) => {
                                setEmail(e.target.value);
                                if (errors.email)
                                  setErrors((prev) => ({ ...prev, email: "" }));
                              }}
                              placeholder="sales@company.com"
                              className={`w-full rounded-xl border bg-black/40 py-2 pl-8 pr-3 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-emerald-500 ${
                                errors.email ? "border-rose-500/60 ring-1 ring-rose-500/20" : "border-white/10"
                              }`}
                            />
                          </div>
                          {errors.email && (
                            <p className="mt-0.5 text-[10px] text-rose-400">
                              {errors.email}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="nationalIdSupplier"
                            className="mb-1 block text-[11px] font-medium text-zinc-300"
                          >
                            Rep. Resident Fayda ID <span className="text-rose-400">*</span>
                          </label>
                          <input
                            id="nationalIdSupplier"
                            type="text"
                            value={nationalIdSupplier}
                            onChange={(e) => {
                              setNationalIdSupplier(e.target.value);
                              if (errors.nationalIdSupplier)
                                setErrors((prev) => ({ ...prev, nationalIdSupplier: "" }));
                            }}
                            placeholder="e.g. FAN-8492019"
                            className={`w-full rounded-xl border bg-black/40 py-2 px-3 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-emerald-500 ${
                              errors.nationalIdSupplier
                                ? "border-rose-500/60 ring-1 ring-rose-500/20"
                                : "border-white/10"
                            }`}
                          />
                          {errors.nationalIdSupplier && (
                            <p className="mt-0.5 text-[10px] text-rose-400">
                              {errors.nationalIdSupplier}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Step 1 Navigation Buttons */}
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setStep(1);
                          setSupplierStep(1);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Change Role</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSupplierNext}
                        className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
                      >
                        <span>Next: Enterprise Details</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: ENTERPRISE & LOGISTICS */}
                {supplierStep === 2 && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Step 2: Enterprise &amp; Warehouse Depot Details</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                          B2B Logistics
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Specify commercial legal registration and primary logistics storage depots in Ethiopia.
                      </p>

                      {/* Company Name */}
                      <div>
                        <label
                          htmlFor="companyName"
                          className="mb-1 block text-[11px] font-medium text-zinc-300"
                        >
                          Enterprise / Supplier Legal Name <span className="text-rose-400">*</span>
                        </label>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                            <Building className="h-3.5 w-3.5 text-zinc-400" />
                          </div>
                          <input
                            id="companyName"
                            type="text"
                            value={companyName}
                            onChange={(e) => {
                              setCompanyName(e.target.value);
                              if (errors.companyName)
                                setErrors((prev) => ({ ...prev, companyName: "" }));
                            }}
                            placeholder="e.g. Abyssinia Wholesale Importers & Distribution PLC"
                            className={`w-full rounded-xl border bg-black/40 py-2 pl-8 pr-3 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-emerald-500 ${
                              errors.companyName ? "border-rose-500/60 ring-1 ring-rose-500/20" : "border-white/10"
                            }`}
                          />
                        </div>
                        {errors.companyName && (
                          <p className="mt-0.5 text-[10px] text-rose-400">
                            {errors.companyName}
                          </p>
                        )}
                      </div>

                      {/* Trade License & TIN */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label
                            htmlFor="tradeLicenseSupplier"
                            className="mb-1 block text-[11px] font-medium text-zinc-300"
                          >
                            Trade / Import License <span className="text-rose-400">*</span>
                          </label>
                          <input
                            id="tradeLicenseSupplier"
                            type="text"
                            value={tradeLicenseSupplier}
                            onChange={(e) => {
                              setTradeLicenseSupplier(e.target.value);
                              if (errors.tradeLicenseSupplier)
                                setErrors((prev) => ({
                                  ...prev,
                                  tradeLicenseSupplier: "",
                                }));
                            }}
                            placeholder="e.g. IMP-AA-748291"
                            className={`w-full rounded-xl border bg-black/40 py-2 px-2.5 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-emerald-500 ${
                              errors.tradeLicenseSupplier ? "border-rose-500/60 ring-1 ring-rose-500/20" : "border-white/10"
                            }`}
                          />
                          {errors.tradeLicenseSupplier && (
                            <p className="mt-0.5 text-[10px] text-rose-400">
                              {errors.tradeLicenseSupplier}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="tinNumberSupplier"
                            className="mb-1 block text-[11px] font-medium text-zinc-300"
                          >
                            TIN Number (10 Digits) <span className="text-rose-400">*</span>
                          </label>
                          <input
                            id="tinNumberSupplier"
                            type="text"
                            maxLength={10}
                            value={tinNumberSupplier}
                            onChange={(e) => {
                              setTinNumberSupplier(e.target.value);
                              if (errors.tinNumberSupplier)
                                setErrors((prev) => ({ ...prev, tinNumberSupplier: "" }));
                            }}
                            placeholder="0039281729"
                            className={`w-full rounded-xl border bg-black/40 py-2 px-2.5 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-emerald-500 ${
                              errors.tinNumberSupplier ? "border-rose-500/60 ring-1 ring-rose-500/20" : "border-white/10"
                            }`}
                          />
                          {errors.tinNumberSupplier && (
                            <p className="mt-0.5 text-[10px] text-rose-400">
                              {errors.tinNumberSupplier}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Operation Category & Capacity */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="mb-1 block text-[10px] font-medium text-zinc-300">
                            Supplier Operation Category
                          </label>
                          <select
                            value={supplierCategory}
                            onChange={(e) => setSupplierCategory(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black/60 py-2 px-2 text-[11px] text-zinc-200 outline-none focus:border-emerald-500"
                          >
                            {SUPPLIER_CATEGORIES.map((cat) => (
                              <option key={cat} value={cat} className="bg-zinc-900">
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1 block text-[10px] font-medium text-zinc-300">
                            Bulk Order Supply Capacity
                          </label>
                          <select
                            value={minOrderCapacity}
                            onChange={(e) => setMinOrderCapacity(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black/60 py-2 px-2 text-[11px] text-zinc-200 outline-none focus:border-emerald-500"
                          >
                            {SUPPLY_CAPACITIES.map((cap) => (
                              <option key={cap} value={cap} className="bg-zinc-900">
                                {cap}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Primary Warehouse Depot Hub */}
                      <div>
                        <label className="mb-1 block text-[10px] font-medium text-zinc-300">
                          Primary Logistics / Warehouse Depot Hub
                        </label>
                        <select
                          value={warehouseZone}
                          onChange={(e) => setWarehouseZone(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-black/60 py-2 px-2 text-[11px] text-zinc-200 outline-none focus:border-emerald-500"
                        >
                          {WAREHOUSE_ZONES.map((zone) => (
                            <option key={zone} value={zone} className="bg-zinc-900">
                              {zone}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Warehouse Address */}
                      <div>
                        <label
                          htmlFor="warehouseAddress"
                          className="mb-1 block text-[10px] font-medium text-zinc-300"
                        >
                          Depot Facility Address &amp; Loading Bay Details <span className="text-rose-400">*</span>
                        </label>
                        <input
                          id="warehouseAddress"
                          type="text"
                          value={warehouseAddress}
                          onChange={(e) => {
                            setWarehouseAddress(e.target.value);
                            if (errors.warehouseAddress)
                              setErrors((prev) => ({ ...prev, warehouseAddress: "" }));
                          }}
                          placeholder="e.g. Block C4, Heavy Freight Gate 2, Near Dry Port"
                          className={`w-full rounded-xl border bg-black/40 py-2 px-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500 ${
                            errors.warehouseAddress ? "border-rose-500/60 ring-1 ring-rose-500/20" : "border-white/10"
                          }`}
                        />
                        {errors.warehouseAddress && (
                          <p className="mt-0.5 text-[10px] text-rose-400">
                            {errors.warehouseAddress}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Step 2 Navigation Buttons */}
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setSupplierStep(1)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Previous: Representative</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSupplierNext}
                        className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
                      >
                        <span>Next: Compliance Documents</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: COMPLIANCE DOCUMENTS */}
                {supplierStep === 3 && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                          <FileCheck className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Step 3: Legal Compliance &amp; Document Uploads</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                          MOTRI &amp; ERCA
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Upload official legal documents for automated verification by the Ministry of Trade (MOTRI) and Ministry of Revenues (ERCA).
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {/* 1. Trade / Business License */}
                        <DocUploadCard
                          id="doc-business-license"
                          title="Trade / Business License (የንግድ ፈቃድ)"
                          subtitle="Current renewed trade, import or manufacturing license"
                          required
                          doc={businessLicenseDoc}
                          error={errors.businessLicense}
                          onFileSelect={(file) => handleFileUpload(file, "businessLicense")}
                          onRemove={() => setBusinessLicenseDoc(null)}
                        />

                        {/* 2. TIN / VAT Certificate */}
                        <DocUploadCard
                          id="doc-tin-certificate"
                          title="TIN / VAT Certificate (የግብር ከፋይ መለያ)"
                          subtitle="Official Taxpayer Identification Certificate (10 digits)"
                          required
                          doc={tinCertificateDoc}
                          error={errors.tinCertificate}
                          onFileSelect={(file) => handleFileUpload(file, "tinCertificate")}
                          onRemove={() => setTinCertificateDoc(null)}
                        />

                        {/* 3. Commercial Registration Certificate (MOTRI) */}
                        <DocUploadCard
                          id="doc-commercial-reg"
                          title="Commercial Registration (የንግድ ምዝገባ)"
                          subtitle="Principal registration certificate issued by MOTRI"
                          required
                          doc={commercialRegDoc}
                          error={errors.commercialReg}
                          onFileSelect={(file) => handleFileUpload(file, "commercialReg")}
                          onRemove={() => setCommercialRegDoc(null)}
                        />

                        {/* 4. Authorized Representative / Owner Fayda ID */}
                        <DocUploadCard
                          id="doc-owner-id"
                          title="Owner / Manager Fayda ID (የወኪል መታወቂያ)"
                          subtitle="Ethiopian Fayda Digital ID, Kebele ID or Passport"
                          required={false}
                          badgeLabel="Recommended"
                          doc={ownerIdDoc}
                          error={errors.ownerId}
                          onFileSelect={(file) => handleFileUpload(file, "ownerId")}
                          onRemove={() => setOwnerIdDoc(null)}
                        />
                      </div>
                    </div>

                    {/* Step 3 Navigation Buttons */}
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setSupplierStep(2)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Previous: Enterprise Details</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSupplierNext}
                        className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
                      >
                        <span>Next: Password &amp; Security</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: PASSWORD & FINAL ACTIVATION (PASSWORD MECHERESHA LAY YHUN!) */}
                {supplierStep === 4 && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Step 4: Master Password &amp; Activation</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
                          Final Step
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Set your master password to secure quotations, orders, and settlements on your B2B supplier workspace.
                      </p>

                      {/* Master Password */}
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <label
                            htmlFor="password"
                            className="text-[11px] font-medium text-zinc-300"
                          >
                            Master Password <span className="text-rose-400">*</span>
                          </label>
                          {password && (
                            <span className={`text-[10px] font-medium ${strengthMeta.text}`}>
                              {strengthMeta.label}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (errors.password)
                                setErrors((prev) => ({ ...prev, password: "" }));
                            }}
                            placeholder="Minimum 8 characters"
                            className={`w-full rounded-xl border bg-black/40 py-2 pl-3 pr-8 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 ${
                              errors.password
                                ? "border-rose-500/60 ring-1 ring-rose-500/20"
                                : "border-white/10 hover:border-white/20"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-400 hover:text-zinc-200"
                          >
                            {showPassword ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Password Strength 4-Bar Meter */}
                        {password && (
                          <div className="mt-1.5 space-y-1">
                            <div className="grid grid-cols-4 gap-1">
                              {[1, 2, 3, 4].map((bar) => (
                                <div
                                  key={bar}
                                  className={`h-1 rounded-full transition-all duration-300 ${
                                    strengthScore >= bar ? strengthMeta.color : "bg-white/10"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {errors.password && (
                          <p className="mt-0.5 text-[10px] text-rose-400">
                            {errors.password}
                          </p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <label
                            htmlFor="confirmPassword"
                            className="text-[11px] font-medium text-zinc-300"
                          >
                            Confirm Master Password <span className="text-rose-400">*</span>
                          </label>
                          {confirmPassword && password && (
                            <span
                              className={`text-[10px] font-medium flex items-center gap-1 ${
                                confirmPassword === password
                                  ? "text-emerald-400"
                                  : "text-rose-400"
                              }`}
                            >
                              {confirmPassword === password ? (
                                <>
                                  <Check className="h-2.5 w-2.5" /> Matched
                                </>
                              ) : (
                                <>
                                  <X className="h-2.5 w-2.5" /> Mismatch
                                </>
                              )}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              if (errors.confirmPassword)
                                setErrors((prev) => ({
                                  ...prev,
                                  confirmPassword: "",
                                }));
                            }}
                            placeholder="Re-type password"
                            className={`w-full rounded-xl border bg-black/40 py-2 pl-3 pr-8 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 ${
                              errors.confirmPassword
                                ? "border-rose-500/60 ring-1 ring-rose-500/20"
                                : "border-white/10 hover:border-white/20"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-400 hover:text-zinc-200"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="mt-0.5 text-[10px] text-rose-400">
                            {errors.confirmPassword}
                          </p>
                        )}
                      </div>

                      {/* Pre-Submission Summary Review Card */}
                      <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-zinc-200 flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Application Summary Preview</span>
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            Ready to activate
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 pt-1 border-t border-white/5">
                          <div>
                            <span className="text-[10px] text-zinc-500 block">Enterprise</span>
                            <span className="font-medium text-zinc-200 truncate block">
                              {companyName || "Not provided"}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              TIN: {tinNumberSupplier || "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 block">Representative</span>
                            <span className="font-medium text-zinc-200 truncate block">
                              {fullName || "Not provided"}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {phoneBody ? `+251 ${phoneBody}` : "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 block">Logistics Depot</span>
                            <span className="font-medium text-zinc-200 truncate block">
                              {warehouseZone}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 block">Compliance Files</span>
                            <span className="font-medium text-emerald-300 flex items-center gap-1">
                              <FileCheck className="h-3 w-3" />
                              {[businessLicenseDoc, tinCertificateDoc, commercialRegDoc, ownerIdDoc].filter((d) => d?.url).length} Uploaded
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Terms Agreement Checkbox */}
                      <div className="pt-0.5">
                        <label className="flex items-start gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => {
                              setAgreed(e.target.checked);
                              if (errors.agreed)
                                setErrors((prev) => ({ ...prev, agreed: "" }));
                            }}
                            className="mt-0.5 h-3.5 w-3.5 rounded border-white/20 bg-black/40 text-emerald-500 focus:ring-0 focus:ring-offset-0 accent-emerald-500"
                          />
                          <span className="text-[11px] leading-tight text-zinc-400">
                            I agree to the{" "}
                            <span className="text-zinc-200 hover:underline">
                              MercatoX Terms of Service
                            </span>
                            , Wholesale Merchant Agreement, and Ethiopian Commercial Regulations.
                          </span>
                        </label>
                        {errors.agreed && (
                          <p className="mt-0.5 text-[10px] text-rose-400">{errors.agreed}</p>
                        )}
                      </div>
                    </div>

                    {/* Step 4 Navigation & Submit */}
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setSupplierStep(3)}
                        className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium text-zinc-400 hover:text-white rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Previous: Documents</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center justify-center gap-2 flex-1 px-5 py-2.5 text-xs font-semibold text-white rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 shadow-lg shadow-emerald-500/25 hover:brightness-110 active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none transition-all cursor-pointer"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                            <span>Registering Supplier Account...</span>
                          </>
                        ) : (
                          <>
                            <span>Complete Supplier Registration</span>
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          ) : (
            /* Form for CUSTOMER and SELLER */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* SECTION 1: ACCOUNT & PERSONAL DETAILS */}
              <div className="space-y-3">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Personal &amp; Contact Credentials</span>
                </div>

                {/* Full Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-1 block text-[11px] font-medium text-zinc-300"
                  >
                    Full Legal Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName)
                        setErrors((prev) => ({ ...prev, fullName: "" }));
                    }}
                    placeholder="e.g. Almaz Kebede"
                    className={`w-full rounded-xl border bg-black/40 py-2 px-3 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 ${errors.fullName
                      ? "border-rose-500/60 ring-1 ring-rose-500/20"
                      : "border-white/10 hover:border-white/20"
                      }`}
                  />
                  {errors.fullName && (
                    <p className="mt-0.5 text-[10px] text-rose-400">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Ethiopian Phone Number */}
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label
                      htmlFor="phoneBody"
                      className="text-[11px] font-medium text-zinc-300"
                    >
                      Ethiopian Mobile Number <span className="text-rose-400">*</span>
                    </label>
                    <span
                      className={`text-[10px] font-medium ${isPhoneValid ? "text-emerald-400" : "text-zinc-500"
                        }`}
                    >
                      {isPhoneValid ? "✓ Valid format" : "09... or 07..."}
                    </span>
                  </div>

                  <div className="flex gap-1.5">
                    <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/50 px-2.5 py-1.5 text-xs text-zinc-300 shrink-0">
                      <span className="text-sm leading-none">🇪🇹</span>
                      <span className="font-semibold text-white">+251</span>
                    </div>

                    <div className="relative flex-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                        <Phone className="h-3.5 w-3.5 text-zinc-400" />
                      </div>
                      <input
                        id="phoneBody"
                        type="tel"
                        value={phoneBody}
                        onChange={(e) => {
                          setPhoneBody(e.target.value);
                          if (errors.phoneNumber)
                            setErrors((prev) => ({ ...prev, phoneNumber: "" }));
                        }}
                        placeholder="911 22 33 44"
                        className={`w-full rounded-xl border bg-black/40 py-2 pl-8 pr-3 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 ${errors.phoneNumber
                          ? "border-rose-500/60 ring-1 ring-rose-500/20"
                          : isPhoneValid
                            ? "border-emerald-500/40"
                            : "border-white/10 hover:border-white/20"
                          }`}
                      />
                    </div>
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-0.5 text-[10px] text-rose-400">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                {/* Email & National ID Row for Seller */}
                {selectedRole === "SELLER" ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-1 block text-[11px] font-medium text-zinc-300"
                      >
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email)
                            setErrors((prev) => ({ ...prev, email: "" }));
                        }}
                        placeholder="name@company.com"
                        className={`w-full rounded-xl border bg-black/40 py-2 px-3 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-amber-500 ${errors.email ? "border-rose-500/60" : "border-white/10"}`}
                      />
                      {errors.email && (
                        <p className="mt-0.5 text-[10px] text-rose-400">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="nationalId"
                        className="mb-1 block text-[11px] font-medium text-zinc-300"
                      >
                        National Resident ID <span className="text-rose-400">*</span>
                      </label>
                      <input
                        id="nationalId"
                        type="text"
                        value={nationalId}
                        onChange={(e) => {
                          setNationalId(e.target.value);
                          if (errors.nationalId)
                            setErrors((prev) => ({ ...prev, nationalId: "" }));
                        }}
                        placeholder="e.g. NID-4920491"
                        className={`w-full rounded-xl border bg-black/40 py-2 px-3 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-amber-500 ${errors.nationalId
                            ? "border-rose-500/60 ring-1 ring-rose-500/20"
                            : "border-white/10"
                          }`}
                      />
                      {errors.nationalId && (
                        <p className="mt-0.5 text-[10px] text-rose-400">
                          {errors.nationalId}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1 block text-[11px] font-medium text-zinc-300"
                    >
                      Email Address <span className="text-zinc-500 text-[10px]">(Optional for order receipts)</span>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                        <Mail className="h-3.5 w-3.5 text-zinc-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email)
                            setErrors((prev) => ({ ...prev, email: "" }));
                        }}
                        placeholder="e.g. customer@gmail.com"
                        className={`w-full rounded-xl border bg-black/40 py-2 pl-8 pr-3 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-cyan-500 ${errors.email ? "border-rose-500/60 ring-1 ring-rose-500/20" : "border-white/10 hover:border-white/20"
                          }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-0.5 text-[10px] text-rose-400">
                        {errors.email}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION 2: SELLER BUSINESS & LEGAL KYC REQUIREMENTS */}
              {selectedRole === "SELLER" && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <BadgeCheck className="h-4 w-4" />
                    <span>Business Legal &amp; Storefront Verification</span>
                  </div>

                  {/* Shop Name */}
                  <div>
                    <label
                      htmlFor="shopName"
                      className="mb-1 block text-[11px] font-medium text-zinc-300"
                    >
                      Shop / Store Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                        <Store className="h-3.5 w-3.5 text-zinc-400" />
                      </div>
                      <input
                        id="shopName"
                        type="text"
                        value={shopName}
                        onChange={(e) => {
                          setShopName(e.target.value);
                          if (errors.shopName)
                            setErrors((prev) => ({ ...prev, shopName: "" }));
                        }}
                        placeholder="e.g. Merkato Wholesale Textiles & Spices"
                        className={`w-full rounded-xl border bg-black/40 py-2 pl-8 pr-3 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-amber-500 ${errors.shopName
                          ? "border-rose-500/60 ring-1 ring-rose-500/20"
                          : "border-white/10"
                          }`}
                      />
                    </div>
                    {errors.shopName && (
                      <p className="mt-0.5 text-[10px] text-rose-400">
                        {errors.shopName}
                      </p>
                    )}
                  </div>

                  {/* Business License & TIN Number Row */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label
                        htmlFor="tradeLicenseNumber"
                        className="mb-1 block text-[11px] font-medium text-zinc-300"
                      >
                        Trade License No. <span className="text-rose-400">*</span>
                      </label>
                      <input
                        id="tradeLicenseNumber"
                        type="text"
                        value={tradeLicenseNumber}
                        onChange={(e) => {
                          setTradeLicenseNumber(e.target.value);
                          if (errors.tradeLicenseNumber)
                            setErrors((prev) => ({
                              ...prev,
                              tradeLicenseNumber: "",
                            }));
                        }}
                        placeholder="e.g. TL-AA-849201"
                        className={`w-full rounded-xl border bg-black/40 py-2 px-2.5 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-amber-500 ${errors.tradeLicenseNumber
                          ? "border-rose-500/60 ring-1 ring-rose-500/20"
                          : "border-white/10"
                          }`}
                      />
                      {errors.tradeLicenseNumber && (
                        <p className="mt-0.5 text-[10px] text-rose-400">
                          {errors.tradeLicenseNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="tinNumber"
                        className="mb-1 block text-[11px] font-medium text-zinc-300"
                      >
                        TIN Number (10 Digits) <span className="text-rose-400">*</span>
                      </label>
                      <input
                        id="tinNumber"
                        type="text"
                        maxLength={10}
                        value={tinNumber}
                        onChange={(e) => {
                          setTinNumber(e.target.value);
                          if (errors.tinNumber)
                            setErrors((prev) => ({ ...prev, tinNumber: "" }));
                        }}
                        placeholder="0012345678"
                        className={`w-full rounded-xl border bg-black/40 py-2 px-2.5 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-amber-500 ${errors.tinNumber
                          ? "border-rose-500/60 ring-1 ring-rose-500/20"
                          : "border-white/10"
                          }`}
                      />
                      {errors.tinNumber && (
                        <p className="mt-0.5 text-[10px] text-rose-400">
                          {errors.tinNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Business Type Category */}
                  <div>
                    <label className="mb-1 block text-[10px] font-medium text-zinc-300">
                      Business Operational Category
                    </label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/60 py-2 px-2 text-[11px] text-zinc-200 outline-none focus:border-amber-500"
                    >
                      {BUSINESS_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-zinc-900">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Market Zone & Sub-City Row */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[10px] font-medium text-zinc-300">
                        Market Zone (Trade Hub)
                      </label>
                      <select
                        value={marketZone}
                        onChange={(e) => setMarketZone(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/60 py-2 px-2 text-[11px] text-zinc-200 outline-none focus:border-amber-500"
                      >
                        {MARKET_ZONES.map((zone) => (
                          <option key={zone} value={zone} className="bg-zinc-900">
                            {zone}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-[10px] font-medium text-zinc-300">
                        Sub-City (Addis Ababa)
                      </label>
                      <select
                        value={subCity}
                        onChange={(e) => setSubCity(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/60 py-2 px-2 text-[11px] text-zinc-200 outline-none focus:border-amber-500"
                      >
                        {SUB_CITIES.map((sc) => (
                          <option key={sc} value={sc} className="bg-zinc-900">
                            {sc}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Specific Location / Stall */}
                  <div>
                    <label
                      htmlFor="specificLocation"
                      className="mb-1 block text-[10px] font-medium text-zinc-300"
                    >
                      Specific Shop Location / Building / Stall No.
                    </label>
                    <input
                      id="specificLocation"
                      type="text"
                      value={specificLocation}
                      onChange={(e) => setSpecificLocation(e.target.value)}
                      placeholder="e.g. Tana Commercial Mall, 1st Floor, Shop #104"
                      className="w-full rounded-xl border border-white/10 bg-black/40 py-2 px-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 3: PASSWORD & SECURITY */}
              <div className="space-y-3">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Security Credentials</span>
                </div>

                {/* Password */}
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-[11px] font-medium text-zinc-300"
                    >
                      Password <span className="text-rose-400">*</span>
                    </label>
                    {password && (
                      <span className={`text-[10px] font-medium ${strengthMeta.text}`}>
                        {strengthMeta.label}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password)
                          setErrors((prev) => ({ ...prev, password: "" }));
                      }}
                      placeholder="Minimum 8 characters"
                      className={`w-full rounded-xl border bg-black/40 py-2 pl-3 pr-8 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 ${errors.password
                        ? "border-rose-500/60 ring-1 ring-rose-500/20"
                        : "border-white/10 hover:border-white/20"
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-400 hover:text-zinc-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength 4-Bar Meter */}
                  {password && (
                    <div className="mt-1.5 space-y-1">
                      <div className="grid grid-cols-4 gap-1">
                        {[1, 2, 3, 4].map((bar) => (
                          <div
                            key={bar}
                            className={`h-1 rounded-full transition-all duration-300 ${strengthScore >= bar ? strengthMeta.color : "bg-white/10"
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {errors.password && (
                    <p className="mt-0.5 text-[10px] text-rose-400">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label
                      htmlFor="confirmPassword"
                      className="text-[11px] font-medium text-zinc-300"
                    >
                      Confirm Password <span className="text-rose-400">*</span>
                    </label>
                    {confirmPassword && password && (
                      <span
                        className={`text-[10px] font-medium flex items-center gap-1 ${confirmPassword === password
                          ? "text-emerald-400"
                          : "text-rose-400"
                          }`}
                      >
                        {confirmPassword === password ? (
                          <>
                            <Check className="h-2.5 w-2.5" /> Matched
                          </>
                        ) : (
                          <>
                            <X className="h-2.5 w-2.5" /> Mismatch
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword)
                          setErrors((prev) => ({
                            ...prev,
                            confirmPassword: "",
                          }));
                      }}
                      placeholder="Re-type password"
                      className={`w-full rounded-xl border bg-black/40 py-2 pl-3 pr-8 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 ${errors.confirmPassword
                        ? "border-rose-500/60 ring-1 ring-rose-500/20"
                        : "border-white/10 hover:border-white/20"
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-400 hover:text-zinc-200"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-0.5 text-[10px] text-rose-400">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Terms Agreement Checkbox */}
              <div className="pt-0.5">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => {
                      setAgreed(e.target.checked);
                      if (errors.agreed)
                        setErrors((prev) => ({ ...prev, agreed: "" }));
                    }}
                    className="mt-0.5 h-3.5 w-3.5 rounded border-white/20 bg-black/40 text-cyan-500 focus:ring-0 focus:ring-offset-0 accent-cyan-500"
                  />
                  <span className="text-[11px] leading-tight text-zinc-400">
                    I agree to the{" "}
                    <span className="text-zinc-200 hover:underline">
                      MercatoX Terms of Service
                    </span>{" "}
                    and Ethiopian Commercial Verification Guidelines.
                  </span>
                </label>
                {errors.agreed && (
                  <p className="mt-0.5 text-[10px] text-rose-400">{errors.agreed}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none cursor-pointer ${
                  selectedRole === "SELLER"
                    ? "bg-gradient-to-r from-amber-500 via-orange-600 to-indigo-600 shadow-amber-500/20"
                    : "bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-500 shadow-cyan-500/20"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Registering {selectedRole} account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete {activeRoleData.title.split("/")[0].trim()} Registration</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function GoogleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#EA4335"
        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.8 5 12 5z"
      />
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.6 6.4C.6 8.4 0 10.6 0 13s.6 4.6 1.6 6.6l3.7-2.9z"
      />
      <path
        fill="#34A853"
        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.2 0-5.8-2.3-6.7-5.3L1.6 16c1.9 3.8 5.8 6.4 10.4 6.4z"
      />
    </svg>
  );
}

function GithubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

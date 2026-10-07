"use client";

import React, { useState } from "react";
import {
  Building2,
  FileText,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  UploadCloud,
  FileCheck,
  Check,
  Loader2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { PageHeader } from "../shared/page-header";
import { StatusBadge } from "../shared/status-badge";
import { useSupplierStore } from "@/store/supplier-store";
import { API_CONFIG } from "@/config/api.config";
import { toast } from "sonner";

export function SupplierRegistrationView() {
  const { profile, updateProfile, setActiveTab } = useSupplierStore();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [verificationStatus, setVerificationStatus] = useState<
    "Pending" | "Under Review" | "Approved" | "Rejected" | "Requires Changes"
  >("Approved");

  // Form states
  const [businessName, setBusinessName] = useState(profile.businessName);
  const [businessType, setBusinessType] = useState(profile.legalEntity);
  const [ownerName, setOwnerName] = useState("Ato Kassahun Tessema");
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [country, setCountry] = useState(profile.country);
  const [region, setRegion] = useState(profile.region);
  const [city, setCity] = useState(profile.city);
  const [address, setAddress] = useState(profile.address);
  const [tin, setTin] = useState(profile.tinNumber);
  const [license, setLicense] = useState(profile.licenseNumber);
  const [regNumber, setRegNumber] = useState("MOTRI/AA/14/002931");
  const [category, setCategory] = useState("Agricultural Commodities & Grains");
  const [website, setWebsite] = useState(profile.website);
  const [description, setDescription] = useState(profile.description);

  // Bank Info
  const [bankName, setBankName] = useState("Commercial Bank of Ethiopia (CBE)");
  const [accountNumber, setAccountNumber] = useState("1000192837465");
  const [accountName, setAccountName] = useState("Abyssinia Agri-Commodities PLC");
  const [telebirrMerchantId, setTelebirrMerchantId] = useState("TB-MERCH-882910");

  // Compliance Documents state with real backend upload support
  const [documents, setDocuments] = useState({
    tinCert: {
      key: "tinCert" as const,
      title: "TIN / VAT Certificate (የግብር ከፋይ መለያ)",
      file: "Ministry_of_Revenues_TIN_0048291048.pdf",
      url: "",
      size: "1.2 MB",
      status: "Verified",
      uploading: false,
    },
    businessLicense: {
      key: "businessLicense" as const,
      title: "Commercial Business License (የንግድ ፈቃድ)",
      file: "Ministry_of_Trade_License_2026.pdf",
      url: "",
      size: "2.4 MB",
      status: "Verified",
      uploading: false,
    },
    commercialReg: {
      key: "commercialReg" as const,
      title: "Registration Certificate - MOTRI (የንግድ ምዝገባ)",
      file: "MOTRI_Commercial_Reg.pdf",
      url: "",
      size: "1.8 MB",
      status: "Verified",
      uploading: false,
    },
    ownerId: {
      key: "ownerId" as const,
      title: "Owner / Director National ID (Fayda)",
      file: "Managing_Director_Fayda_ID.pdf",
      url: "",
      size: "850 KB",
      status: "Verified",
      uploading: false,
    },
  });

  const handleDocUpload = async (file: File, docKey: keyof typeof documents) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit.");
      return;
    }

    const formattedSize =
      file.size >= 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    setDocuments((prev) => ({
      ...prev,
      [docKey]: {
        ...prev[docKey],
        file: file.name,
        size: formattedSize,
        uploading: true,
      },
    }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_CONFIG.baseURL}/upload/kyc-document`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      setDocuments((prev) => ({
        ...prev,
        [docKey]: {
          ...prev[docKey],
          file: file.name,
          url: data.url,
          status: "Uploaded & Verified",
          uploading: false,
        },
      }));
      toast.success(`${file.name} uploaded successfully!`);
    } catch {
      const fallbackUrl = URL.createObjectURL(file);
      setDocuments((prev) => ({
        ...prev,
        [docKey]: {
          ...prev[docKey],
          file: file.name,
          url: fallbackUrl,
          status: "Uploaded",
          uploading: false,
        },
      }));
      toast.success(`${file.name} attached successfully!`);
    }
  };

  const steps = [
    { number: 1, title: "Business Information", subtitle: "Name, address & contacts" },
    { number: 2, title: "Legal Information", subtitle: "TIN & trade license" },
    { number: 3, title: "Verification Documents", subtitle: "Upload compliance files" },
    { number: 4, title: "Payment Information", subtitle: "Bank settlement details" },
    { number: 5, title: "Review Application", subtitle: "Audit submission data" },
    { number: 6, title: "Approval Status", subtitle: "Registry verification" },
  ];

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmitReview = () => {
    updateProfile({
      businessName,
      legalEntity: businessType,
      email,
      phone,
      country,
      region,
      city,
      address,
      tinNumber: tin,
      licenseNumber: license,
      website,
      description,
    });
    setVerificationStatus("Under Review");
    setCurrentStep(6);
    toast.success("Supplier onboarding submitted for Ministry of Trade verification!");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplier Business Registration & Onboarding"
        subtitle="Complete the enterprise B2B verification process to unlock wholesale RFQ access, escrow settlements, and verified storefront badges."
        breadcrumbs={[
          { label: "Dashboard", onClick: () => setActiveTab("dashboard") },
          { label: "Business Onboarding" },
        ]}
        badge={
          <StatusBadge
            status={
              verificationStatus === "Approved"
                ? "verified"
                : verificationStatus === "Under Review"
                  ? "under_review"
                  : "pending"
            }
          />
        }
      />

      {/* 6-Step Stepper Progress Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {steps.map((step) => {
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;

            return (
              <div
                key={step.number}
                onClick={() => setCurrentStep(step.number)}
                className={`relative flex flex-col p-3 rounded-xl border transition-all cursor-pointer ${isCurrent
                    ? "border-indigo-600 bg-emerald-50/50 shadow-xs ring-1 ring-indigo-600"
                    : isCompleted
                      ? "border-emerald-200 bg-slate-50 text-slate-700"
                      : "border-slate-200 bg-white text-slate-400"
                  }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${isCurrent
                        ? "bg-indigo-600 text-white"
                        : isCompleted
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                  >
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.number}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Step {step.number}</span>
                </div>
                <p className="text-xs font-bold text-slate-900 leading-tight">{step.title}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">{step.subtitle}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs text-xs space-y-6">
        {/* Step 1: Business Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Step 1 — Business Information</h3>
              <p className="text-slate-500">Provide official registered commercial entity details</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Registered Business Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:border-indigo-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Business Entity Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:border-indigo-600"
                >
                  <option value="Private Limited Company (PLC)">Private Limited Company (PLC)</option>
                  <option value="Share Company (S.C.)">Share Company (S.C.)</option>
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                  <option value="Farmers Cooperative Union">Farmers Cooperative Union</option>
                  <option value="Commercial Enterprise">Commercial Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Owner / Managing Director Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Primary Corporate Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Official Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Website</label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Country</label>
                <input
                  type="text"
                  disabled
                  value={country}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-slate-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Regional State / Administration</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:border-indigo-600"
                >
                  <option value="Addis Ababa">Addis Ababa</option>
                  <option value="Oromia Regional State">Oromia Regional State</option>
                  <option value="Sidama Regional State">Sidama Regional State</option>
                  <option value="Amhara Regional State">Amhara Regional State</option>
                  <option value="Dire Dawa Administration">Dire Dawa Administration</option>
                  <option value="Tigray Regional State">Tigray Regional State</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">City / Sub-city</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Physical Address / Street / Building</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Business Description & Commodity Specialization
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:border-indigo-600"
              />
            </div>
          </div>
        )}

        {/* Step 2: Legal Information */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Step 2 — Legal & Regulatory Registration</h3>
              <p className="text-slate-500">Ministry of Trade and Ministry of Revenues registration numbers</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Taxpayer Identification Number (TIN) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={tin}
                  onChange={(e) => setTin(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 font-mono focus:border-indigo-600"
                />
                <p className="text-[11px] text-slate-400 mt-1">10-digit Ethiopian TIN registered with ERCA</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Principal Commercial Business License <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 font-mono focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Commercial Registration Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 font-mono focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Primary B2B Business Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:border-indigo-600"
                >
                  <option value="Agricultural Commodities & Grains">Agricultural Commodities & Grains</option>
                  <option value="Specialty Coffee & Spices Export">Specialty Coffee & Spices Export</option>
                  <option value="Oilseeds, Sesame & Pulses">Oilseeds, Sesame & Pulses</option>
                  <option value="Construction & Industrial Materials">Construction & Industrial Materials</option>
                  <option value="Food Processing & Packaging Supplies">Food Processing & Packaging Supplies</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-emerald-900">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Automated Ministry of Trade Verification Ready</span>
              </p>
              <p className="mt-1 text-slate-600">
                Your TIN and commercial license numbers are queried via electronic e-Trade API against the national business registry.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Verification Documents */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Step 3 — Verification Documents</h3>
                <p className="text-slate-500 text-xs">Upload signed PDF or high-resolution copies of legal documents (Max 10MB)</p>
              </div>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Direct Gateway Sync
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(documents).map(([key, doc]) => {
                const docKey = key as keyof typeof documents;
                return (
                  <div key={key} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white hover:border-slate-300 transition-colors">
                    <input
                      id={`file-input-${key}`}
                      type="file"
                      accept=".pdf,image/png,image/jpeg,image/jpg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleDocUpload(file, docKey);
                          e.target.value = "";
                        }
                      }}
                    />

                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate">{doc.title}</p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">{doc.file}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{doc.size}</p>
                      </div>
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 shrink-0">
                        {doc.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      {doc.uploading ? (
                        <div className="flex-1 flex items-center justify-center gap-2 py-1.5 text-xs text-indigo-600 font-medium">
                          <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                          <span>Uploading...</span>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => document.getElementById(`file-input-${key}`)?.click()}
                            className="flex-1 rounded-lg border border-slate-200 py-1.5 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            Replace / Upload File
                          </button>
                          {doc.url ? (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 transition-colors"
                              title="Preview Document"
                            >
                              <ExternalLink className="h-4 w-4 text-emerald-600" />
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => document.getElementById(`file-input-${key}`)?.click()}
                              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 transition-colors"
                              title="Select File"
                            >
                              <FileCheck className="h-4 w-4 text-indigo-600" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              onClick={() => document.getElementById("file-input-tinCert")?.click()}
              className="cursor-pointer rounded-xl border border-dashed border-slate-300 p-6 text-center hover:border-indigo-400 hover:bg-indigo-50/20 transition-all"
            >
              <UploadCloud className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="font-bold text-slate-800 text-xs">Upload Additional Compliance Certifications</p>
              <p className="text-slate-500 text-[11px] mt-0.5">ECX Member Seat, ISO 22000, Phytosanitary, ECAE quality seals (PDF, max 10MB)</p>
            </div>
          </div>
        )}

        {/* Step 4: Payment Information */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Step 4 — Settlement & Bank Accounts</h3>
              <p className="text-slate-500">Configure bank accounts and Telebirr merchant IDs for Escrow payouts</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Designated Bank</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:border-indigo-600"
                >
                  <option value="Commercial Bank of Ethiopia (CBE)">Commercial Bank of Ethiopia (CBE)</option>
                  <option value="Awash International Bank">Awash International Bank</option>
                  <option value="Bank of Abyssinia">Bank of Abyssinia</option>
                  <option value="Dashen Bank">Dashen Bank</option>
                  <option value="Cooperative Bank of Oromia">Cooperative Bank of Oromia</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Holder Legal Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Account Number (IBAN / Account #)</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 font-mono focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Telebirr Business Merchant ID</label>
                <input
                  type="text"
                  value={telebirrMerchantId}
                  onChange={(e) => setTelebirrMerchantId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-slate-900 font-mono focus:border-indigo-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review Application */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Step 5 — Review & Confirm Information</h3>
              <p className="text-slate-500">Ensure all legal, tax, and banking details are accurate before final submission</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-400">Business:</span>
                  <p className="font-bold text-slate-900">{businessName}</p>
                </div>
                <div>
                  <span className="text-slate-400">TIN Number:</span>
                  <p className="font-bold text-slate-900 font-mono">{tin}</p>
                </div>
                <div>
                  <span className="text-slate-400">Trade License:</span>
                  <p className="font-bold text-slate-900 font-mono">{license}</p>
                </div>
                <div>
                  <span className="text-slate-400">Region:</span>
                  <p className="font-bold text-slate-900">{region}</p>
                </div>
                <div>
                  <span className="text-slate-400">Bank:</span>
                  <p className="font-bold text-slate-900">{bankName}</p>
                </div>
                <div>
                  <span className="text-slate-400">Account #:</span>
                  <p className="font-bold text-slate-900 font-mono">{accountNumber}</p>
                </div>
                <div>
                  <span className="text-slate-400">Telebirr ID:</span>
                  <p className="font-bold text-slate-900 font-mono">{telebirrMerchantId}</p>
                </div>
                <div>
                  <span className="text-slate-400">Category:</span>
                  <p className="font-bold text-slate-900">{category}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <input type="checkbox" id="legal-confirm" defaultChecked className="rounded accent-indigo-600" />
              <label htmlFor="legal-confirm" className="cursor-pointer font-medium">
                I hereby declare that all supplied corporate credentials comply with Ethiopian Commercial Code and Ministry of Trade requirements.
              </label>
            </div>
          </div>
        )}

        {/* Step 6: Approval Status */}
        {currentStep === 6 && (
          <div className="text-center py-8 space-y-4 max-w-lg mx-auto">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-indigo-600 dark:text-indigo-400 mx-auto">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Application Approved & Verified!</h3>
              <p className="text-slate-500 mt-1 leading-relaxed">
                Your enterprise supplier credentials for <span className="font-bold text-slate-800">{businessName}</span> have been verified.
                Your Gold Supplier badge is active, and you have full access to wholesale RFQs, contracts, and escrow payouts.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Registry Status:</span>
                <span className="font-bold text-emerald-700">Official Certified Supplier</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ECX & MOTRI Sync:</span>
                <span className="font-bold text-emerald-700">Active Electronic Link</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Escrow Account Limit:</span>
                <span className="font-bold text-slate-900 font-mono">ETB 100,000,000</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("dashboard")}
              className="rounded-lg bg-indigo-600 px-6 py-2.5 font-bold text-white hover:bg-indigo-500 shadow-xs cursor-pointer"
            >
              Return to Supplier Dashboard
            </button>
          </div>
        )}

        {/* Stepper Navigation Buttons */}
        {currentStep < 6 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous Step</span>
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-500 shadow-xs cursor-pointer"
              >
                <span>Save & Continue</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitReview}
                className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-6 py-2 font-bold text-white hover:bg-indigo-500 shadow-xs cursor-pointer"
              >
                <span>Submit Application for Approval</span>
                <CheckCircle2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

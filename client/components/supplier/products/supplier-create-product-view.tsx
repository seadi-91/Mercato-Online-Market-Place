"use client";

import React, { useState, useRef } from "react";
import {
  Package,
  DollarSign,
  Boxes,
  Eye,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  Building,
  Image as ImageIcon,
  Star,
  Camera,
  Link as LinkIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useSupplierStore } from "@/store/supplier-store";
import { TierPrice } from "@/types/supplier";
import { useAuthStore } from "@/store/auth-store";
import { sellerService } from "@/services/seller/seller.service";
import { Category } from "@/types/product";
import { toast } from "sonner";

export function SupplierCreateProductView() {
  const {
    addProduct,
    updateProduct,
    setSubView,
    warehouses,
    currentStaffUser,
    editingProduct,
    setEditingProduct,
  } = useSupplierStore();
  const { user } = useAuthStore();

  // Wizard Step State (1: Basics, 2: Pricing, 3: Inventory, 4: Quality & Media)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Form State
  // Step 1: Basic Information
  const [name, setName] = useState("");
  const [sku, setSku] = useState(`ETH-B2B-${Math.floor(100 + Math.random() * 900)}`);
  const [category, setCategory] = useState("Agricultural Commodities");
  const [subcategory, setSubcategory] = useState("Specialty Washed Coffee");
  const [brand, setBrand] = useState("Abyssinia Gold Exporters");
  const [origin, setOrigin] = useState("Yirgacheffe, Gedeo Zone, Ethiopia");
  const [description, setDescription] = useState(
    "High-altitude Ethiopian specialty export commodity, processed under strict quality standards with ECX grading certification."
  );

  // Step 2: Pricing & Tiers
  const [basePrice, setBasePrice] = useState<number>(480);
  const [moq, setMoq] = useState<number>(500);
  const [unit, setUnit] = useState("KG");
  const [tierPricing, setTierPricing] = useState<TierPrice[]>([
    { id: "t-1", minQty: 500, maxQty: 1999, unitPrice: 480, discountPercentage: 0 },
    { id: "t-2", minQty: 2000, maxQty: 4999, unitPrice: 455, discountPercentage: 5.2 },
    { id: "t-3", minQty: 5000, maxQty: null, unitPrice: 425, discountPercentage: 11.45 },
  ]);

  // Step 3: Inventory & Warehouse
  const [initialStock, setInitialStock] = useState<number>(12000);
  const [warehouseLocation, setWarehouseLocation] = useState(
    (user?.staffRole === "branch_manager" && user.branchName)
      ? user.branchName
      : currentStaffUser?.role === "branch_manager"
      ? currentStaffUser.branchName
      : warehouses[0]?.name || "WH-AA (Addis Ababa Central Logistics Hub)"
  );
  const [minStock, setMinStock] = useState<number>(2000);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(3);

  // Step 4: Multi-Image State (Strictly EMPTY initially - NO default dummy images)
  const [images, setImages] = useState<string[]>([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [urlInput, setUrlInput] = useState("");
  const [isUrlInputOpen, setIsUrlInputOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [grade, setGrade] = useState("Grade 1 Export (SCA 88+)");
  const [shippingWeight, setShippingWeight] = useState("60 KG per Sack");
  const [certifications, setCertifications] = useState<string[]>([
    "ECX Grade 1 Certified",
    "Ethiopian Ministry of Agriculture Phytosanitary",
    "Fair Trade",
  ]);

  // Database categories and submitting state
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch backend categories
  React.useEffect(() => {
    let isMounted = true;
    sellerService
      .getCategories(false)
      .then((cats: Category[]) => {
        if (isMounted && cats && cats.length > 0) {
          setDbCategories(cats);
          if (editingProduct) {
            const matched = cats.find(
              (c: Category) => c.name.toLowerCase() === editingProduct.category.toLowerCase()
            );
            if (matched) setSelectedCategoryId(matched.id);
          } else if (!selectedCategoryId) {
            setSelectedCategoryId(cats[0].id);
            setCategory(cats[0].name);
          }
        }
      })
      .catch((err: unknown) => console.error("Failed to load categories from database:", err));
    return () => {
      isMounted = false;
    };
  }, [editingProduct]);

  // Prefill form when editing an existing product
  React.useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name || "");
      setSku(editingProduct.sku || "");
      setCategory(editingProduct.category || "Agricultural Commodities");
      setSubcategory(editingProduct.subcategory || "");
      setBrand(editingProduct.brand || "");
      setOrigin(editingProduct.origin || "");
      setDescription(editingProduct.description || "");
      setBasePrice(editingProduct.basePrice || 0);
      setMoq(editingProduct.moq || 1);
      setUnit(editingProduct.unit || "KG");
      if (editingProduct.tierPricing && editingProduct.tierPricing.length > 0) {
        setTierPricing(editingProduct.tierPricing);
      }
      setInitialStock(editingProduct.stock || 0);
      if (editingProduct.warehouseLocation) {
        setWarehouseLocation(editingProduct.warehouseLocation);
      }
      if (editingProduct.images && editingProduct.images.length > 0) {
        setImages(editingProduct.images);
      }
      if (editingProduct.grade) setGrade(editingProduct.grade);
      if (editingProduct.shippingWeight) setShippingWeight(editingProduct.shippingWeight);
      if (editingProduct.certifications && editingProduct.certifications.length > 0) {
        setCertifications(editingProduct.certifications);
      }
      if (editingProduct.leadTimeDays) setLeadTimeDays(editingProduct.leadTimeDays);
    }
  }, [editingProduct]);

  // Fast Client-Side Image Resizer & Optimizer to prevent huge payload transfers
  const compressImage = (file: File, maxDimension = 1200, quality = 0.82): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL("image/jpeg", quality);
            resolve(compressed);
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = () => {
          resolve(event.target?.result as string);
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  // Image Upload Processing
  const processFiles = async (files: File[]) => {
    const validFiles = files.filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) {
      toast.error("Please select valid image files (JPG, PNG, WebP).");
      return;
    }

    const availableSlots = 8 - images.length;
    if (availableSlots <= 0) {
      toast.warning("Maximum of 8 images reached. Remove an image to add more.");
      return;
    }

    const filesToRead = validFiles.slice(0, availableSlots);
    if (validFiles.length > availableSlots) {
      toast.info(`Adding first ${availableSlots} images (maximum 8 allowed).`);
    }

    const toastId = toast.loading("Optimizing product photos...");
    try {
      const compressedList = await Promise.all(
        filesToRead.map((f) => compressImage(f))
      );
      const validResults = compressedList.filter(Boolean);
      setImages((prev) => [...prev, ...validResults]);
      toast.success(`Successfully added ${validResults.length} photo${validResults.length > 1 ? "s" : ""}!`, {
        id: toastId,
      });
    } catch {
      toast.error("Failed to process some images.", { id: toastId });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleAddUrlImage = () => {
    if (!urlInput.trim()) return;
    try {
      new URL(urlInput.trim());
    } catch {
      toast.error("Please enter a valid image web URL.");
      return;
    }

    if (images.length >= 8) {
      toast.warning("Maximum 8 images allowed.");
      return;
    }

    setImages((prev) => [...prev, urlInput.trim()]);
    setUrlInput("");
    setIsUrlInputOpen(false);
    toast.success("Image added from URL!");
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, idx) => idx !== index);
    setImages(updated);
    if (activePreviewIndex >= updated.length) {
      setActivePreviewIndex(0);
    }
    toast.info("Image removed.");
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, idx) => idx !== index);
    setImages([target, ...rest]);
    setActivePreviewIndex(0);
    toast.success("Cover photo updated!");
  };

  // Sample Presets for Fast Demo Filling
  const fillSampleCommodity = (type: "coffee" | "teff" | "sesame" | "cement") => {
    if (type === "coffee") {
      setName("Yirgacheffe Grade 1 Speciality Washed Arabica Coffee");
      setSku("ETH-COF-YRG-001");
      setCategory("Agricultural Commodities");
      setSubcategory("Specialty Coffee");
      setBrand("Abyssinia Premium Exporters");
      setOrigin("Yirgacheffe, Gedeo Zone, SNNPR");
      setDescription(
        "SCA score 88.5 floral jasmine aroma with bright citric acidity, thoroughly washed and sun-dried on raised African beds."
      );
      setBasePrice(480);
      setMoq(500);
      setUnit("KG");
      setInitialStock(15000);
      setGrade("Grade 1 Export (SCA 88+)");
    } else if (type === "teff") {
      setName("Magna White Teff Super Premium Cleaned Grain");
      setSku("ETH-GRN-TEF-102");
      setCategory("Grains, Cereals & Teff");
      setSubcategory("White Teff");
      setBrand("Ada'a Agro Producers");
      setOrigin("Bishoftu / Ada'a Woreda, Oromia");
      setDescription(
        "Machine-cleaned 99.8% purity Magna white teff grain, packed in food-grade polypropylene export sacks."
      );
      setBasePrice(125);
      setMoq(1000);
      setUnit("KG");
      setInitialStock(45000);
      setGrade("ECX Grade A Super Clean");
    } else if (type === "sesame") {
      setName("Humera Grade A Whitish Sesame Seeds");
      setSku("ETH-OIL-SES-301");
      setCategory("Oilseeds & Pulses");
      setSubcategory("Sesame Seeds");
      setBrand("Tigray Agro Alliance");
      setOrigin("Humera, Tigray Region");
      setDescription(
        "World-renowned sweet aroma Humera sesame with 52% oil content and 99.5% minimum purity."
      );
      setBasePrice(210);
      setMoq(2000);
      setUnit("KG");
      setInitialStock(30000);
      setGrade("Grade A Humera Export Standard");
    } else {
      setName("Muger Ordinary Portland Cement 42.5R");
      setSku("ETH-CON-CMT-505");
      setCategory("Construction & Industrial Materials");
      setSubcategory("Portland Cement");
      setBrand("Muger Cement Enterprise");
      setOrigin("Muger, Oromia, Ethiopia");
      setDescription(
        "High early strength 42.5R Portland cement compliant with Ethiopian Standard ES 1177-1."
      );
      setBasePrice(850);
      setMoq(200);
      setUnit("Bags (50kg)");
      setInitialStock(5000);
      setGrade("ES 1177-1 Strength 42.5R");
    }
    toast.info("Sample product details populated!");
  };

  // Tier helpers
  const handleAddTier = () => {
    const lastTier = tierPricing[tierPricing.length - 1];
    const newMin = lastTier ? (lastTier.maxQty ? lastTier.maxQty + 1 : 10000) : 1000;
    setTierPricing([
      ...tierPricing,
      {
        id: `t-${Date.now()}`,
        minQty: newMin,
        maxQty: null,
        unitPrice: Math.round(basePrice * 0.9),
        discountPercentage: 10,
      },
    ]);
  };

  const handleRemoveTier = (id: string) => {
    if (tierPricing.length <= 1) return;
    setTierPricing(tierPricing.filter((t) => t.id !== id));
  };

  // Next / Previous step validations
  const handleGoNext = () => {
    if (currentStep === 1) {
      if (!name.trim()) {
        toast.error("Please enter the product commercial name.");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (basePrice <= 0 || moq <= 0) {
        toast.error("Please specify a valid base price and minimum order quantity.");
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (initialStock <= 0) {
        toast.error("Please specify initial bulk stock quantity.");
        return;
      }
      setCurrentStep(4);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please provide a product name.");
      setCurrentStep(1);
      return;
    }

    // MANDATORY PHOTO UPLOAD: Block publishing if user has not uploaded any image
    if (images.length === 0) {
      toast.error("Please upload at least one product photo before publishing.");
      setCurrentStep(4);
      return;
    }

    const isBranchManager = user?.staffRole === "branch_manager" || currentStaffUser?.role === "branch_manager";
    const userBranchId = user?.branchId || currentStaffUser?.branchId;
    const userBranchName = user?.branchName || currentStaffUser?.branchName;

    const finalBranchId = isBranchManager && userBranchId
      ? userBranchId
      : warehouses.find((w) => warehouseLocation.includes(w.code) || warehouseLocation.includes(w.name))?.id || "wh-aa";

    const finalBranchName = isBranchManager && userBranchName
      ? userBranchName
      : warehouseLocation;

    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct(
          editingProduct.id,
          {
            name,
            sku,
            category,
            subcategory,
            brand,
            origin,
            grade,
            unit,
            basePrice,
            currency: "ETB",
            moq,
            stock: initialStock,
            status: editingProduct.status || "published",
            images,
            tierPricing,
            description,
            certifications,
            warehouseLocation: finalBranchName,
            branchId: finalBranchId,
            branchName: finalBranchName,
            leadTimeDays,
          },
          selectedCategoryId || undefined
        );
      } else {
        await addProduct(
          {
            name,
            sku,
            category,
            subcategory,
            brand,
            origin,
            grade,
            unit,
            basePrice,
            currency: "ETB",
            moq,
            stock: initialStock,
            reservedStock: 0,
            status: "published",
            images,
            tierPricing,
            description,
            certifications,
            warehouseLocation: finalBranchName,
            branchId: finalBranchId,
            branchName: finalBranchName,
            leadTimeDays,
          },
          selectedCategoryId || undefined
        );
      }
      setEditingProduct(null);
      setSubView("default");
    } catch (err: any) {
      console.error("[SupplierCreateProduct] Save failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsMeta = [
    { number: 1, title: "Identity", subtitle: "Name & category" },
    { number: 2, title: "Pricing", subtitle: "Base & tiers" },
    { number: 3, title: "Stock", subtitle: "Depot inventory" },
    { number: 4, title: "Photos", subtitle: "Product images" },
  ];

  return (
    <div className="w-full flex justify-center py-2 sm:py-4 px-2 sm:px-4">
      {/* Hidden File and Camera Inputs (Used in Step 4 at the end) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* COMPACT & CENTERED CARD CONTAINER */}
      <div className="w-full max-w-xl mx-auto space-y-3.5">
        {/* Compact Clean Header */}
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setSubView("default");
              }}
              className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer mb-0.5"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Catalog</span>
            </button>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              {editingProduct ? "Edit Wholesale Commodity" : "Add Wholesale Product"}
            </h1>
          </div>

          {/* Action button: Live Buyer Preview */}
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer shadow-xs shrink-0"
          >
            <Eye className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Preview</span>
          </button>
        </div>

        {/* Compact Wizard Step Indicator Pills */}
        <div className="rounded-xl border border-white/10 bg-[#0d121f] p-2.5 sm:p-3 shadow-xs space-y-2">
          <div className="grid grid-cols-4 gap-1.5">
            {stepsMeta.map((s) => {
              const isDone = currentStep > s.number;
              const isCurrent = currentStep === s.number;

              return (
                <button
                  key={s.number}
                  type="button"
                  onClick={() => setCurrentStep(s.number)}
                  className={`flex items-center justify-center sm:justify-start gap-1.5 p-1.5 rounded-lg text-left transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-indigo-600/20 border border-indigo-500/50 text-white shadow-xs"
                      : isDone
                      ? "bg-white/[0.02] border border-emerald-500/30 text-emerald-400"
                      : "bg-white/[0.02] border border-white/5 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <span
                    className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      isCurrent
                        ? "bg-indigo-600 text-white"
                        : isDone
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-white/10 text-zinc-400"
                    }`}
                  >
                    {isDone ? "✓" : s.number}
                  </span>
                  <div className="truncate hidden sm:block">
                    <p className="text-[11px] font-semibold truncate leading-none">
                      {s.title}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300 rounded-full"
              style={{ width: `${currentStep * 25}%` }}
            />
          </div>
        </div>

        {/* Compact Centered Main Step Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0d121f] p-4 sm:p-5 shadow-xl">
          {/* ============================================================ */}
          {/* STEP 1: Basic Information ONLY (NO photo upload at beginning) */}
          {/* ============================================================ */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                    <Package className="h-4 w-4 text-indigo-400" />
                    <span>Commercial Identity</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400">Official catalog naming and sourcing</p>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
                  <span className="text-[10px] text-zinc-500 font-medium whitespace-nowrap">Fill:</span>
                  <button
                    type="button"
                    onClick={() => fillSampleCommodity("coffee")}
                    className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Coffee
                  </button>
                  <button
                    type="button"
                    onClick={() => fillSampleCommodity("teff")}
                    className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Teff
                  </button>
                  <button
                    type="button"
                    onClick={() => fillSampleCommodity("sesame")}
                    className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Sesame
                  </button>
                  <button
                    type="button"
                    onClick={() => fillSampleCommodity("cement")}
                    className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Cement
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Product Commercial Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Yirgacheffe Grade 1 Speciality Washed Arabica Coffee"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      SKU Code
                    </label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-white font-mono focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      Brand / Producer
                    </label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Abyssinia Agro PLC"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-white focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      Marketplace Category
                    </label>
                    <select
                      value={selectedCategoryId || category}
                      onChange={(e) => {
                        const val = e.target.value;
                        const matched = dbCategories.find(
                          (c) => c.id === val || c.name === val
                        );
                        if (matched) {
                          setSelectedCategoryId(matched.id);
                          setCategory(matched.name);
                        } else {
                          setCategory(val);
                        }
                      }}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-white focus:border-indigo-500 focus:outline-hidden cursor-pointer"
                    >
                      {dbCategories.length > 0 ? (
                        dbCategories.map((c) => (
                          <option key={c.id} value={c.id} className="bg-[#0d121f] text-white">
                            {c.name}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Agricultural Commodities" className="bg-[#0d121f] text-white">
                            Agricultural Commodities
                          </option>
                          <option value="Grains, Cereals & Teff" className="bg-[#0d121f] text-white">
                            Grains, Cereals & Teff
                          </option>
                          <option value="Oilseeds & Pulses" className="bg-[#0d121f] text-white">
                            Oilseeds & Pulses
                          </option>
                          <option value="Construction & Industrial Materials" className="bg-[#0d121f] text-white">
                            Construction & Industrial Materials
                          </option>
                          <option value="Textiles & Apparel" className="bg-[#0d121f] text-white">
                            Textiles & Apparel
                          </option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      Subcategory
                    </label>
                    <input
                      type="text"
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      placeholder="e.g. Specialty Washed Arabica"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-white focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Regional Origin & Sourcing
                  </label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="e.g. Yirgacheffe, Gedeo Zone, SNNPR, Ethiopia"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Commercial Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed specifications, processing method, moisture..."
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 2: Wholesale Pricing & Volume Tiers */}
          {/* ============================================================ */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-white/5 pb-2.5">
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-indigo-400" />
                  <span>Wholesale Pricing & Volume Tiers</span>
                </h3>
                <p className="text-[11px] text-zinc-400">Set base price and bulk order threshold</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Base Price (ETB) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500 font-mono">
                      ETB
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={basePrice}
                      onChange={(e) => setBasePrice(Number(e.target.value))}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] pl-10 pr-2 py-2 text-xs text-white font-mono font-bold focus:border-indigo-500 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    MOQ <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={moq}
                    onChange={(e) => setMoq(Number(e.target.value))}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-white font-mono font-bold focus:border-indigo-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Pricing Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-white focus:border-indigo-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="KG">KG (Kilograms)</option>
                    <option value="Metric Ton">Metric Ton</option>
                    <option value="Bags (60kg)">Bags (60kg Sacks)</option>
                    <option value="Quintal (100kg)">Quintal (100kg)</option>
                    <option value="Cartons">Cartons</option>
                  </select>
                </div>
              </div>

              {/* Volume Tiers */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Wholesale Volume Tiers</span>
                  <button
                    type="button"
                    onClick={handleAddTier}
                    className="inline-flex items-center gap-1 rounded border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[11px] font-semibold text-indigo-300 hover:bg-indigo-500/20 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Tier</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {tierPricing.map((tier, idx) => (
                    <div
                      key={tier.id}
                      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-2 text-xs"
                    >
                      <div className="flex items-center justify-between sm:justify-start gap-1.5">
                        <span className="font-mono text-indigo-400 font-bold text-[10px] bg-indigo-500/10 px-1.5 py-0.5 rounded">
                          #{idx + 1}
                        </span>
                        {tierPricing.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTier(tier.id)}
                            className="sm:hidden p-1 text-zinc-500 hover:text-rose-400"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-zinc-400">Min:</span>
                          <input
                            type="number"
                            value={tier.minQty}
                            onChange={(e) => {
                              const updated = [...tierPricing];
                              updated[idx].minQty = Number(e.target.value);
                              setTierPricing(updated);
                            }}
                            className="w-full rounded border border-white/10 bg-white/[0.04] px-1.5 py-1 text-xs text-white font-mono"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-zinc-400">Max:</span>
                          <input
                            type="number"
                            value={tier.maxQty || ""}
                            placeholder="No limit"
                            onChange={(e) => {
                              const updated = [...tierPricing];
                              updated[idx].maxQty = e.target.value ? Number(e.target.value) : null;
                              setTierPricing(updated);
                            }}
                            className="w-full rounded border border-white/10 bg-white/[0.04] px-1.5 py-1 text-xs text-white font-mono placeholder-zinc-600"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0 pt-1 sm:pt-0">
                        <span className="text-[10px] text-zinc-400">Price:</span>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] text-zinc-500 font-mono">
                            ETB
                          </span>
                          <input
                            type="number"
                            value={tier.unitPrice}
                            onChange={(e) => {
                              const updated = [...tierPricing];
                              updated[idx].unitPrice = Number(e.target.value);
                              setTierPricing(updated);
                            }}
                            className="w-24 rounded border border-white/10 bg-white/[0.04] pl-8 pr-1.5 py-1 text-xs text-white font-mono font-bold"
                          />
                        </div>

                        {tierPricing.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTier(tier.id)}
                            className="hidden sm:inline-flex p-1 text-zinc-500 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 3: Inventory & Warehouse Depot */}
          {/* ============================================================ */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-white/5 pb-2.5">
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <Boxes className="h-4 w-4 text-indigo-400" />
                  <span>Warehouse & Stock Allocation</span>
                </h3>
                <p className="text-[11px] text-zinc-400">Define available inventory and fulfillment depot</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Available Stock <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      value={initialStock}
                      onChange={(e) => setInitialStock(Number(e.target.value))}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-white font-mono font-bold focus:border-indigo-500 focus:outline-hidden"
                      required
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                      {unit}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Primary Depot
                  </label>
                  {(user?.staffRole === "branch_manager" || currentStaffUser?.role === "branch_manager") ? (
                    <div className="p-2.5 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-200 text-xs font-semibold flex items-center gap-2">
                      <Building className="h-4 w-4 text-blue-400 shrink-0" />
                      <span>{user?.branchName || currentStaffUser?.branchName || "Assigned Branch Hub"}</span>
                    </div>
                  ) : (
                    <select
                      value={warehouseLocation}
                      onChange={(e) => setWarehouseLocation(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-white focus:border-indigo-500 focus:outline-hidden cursor-pointer"
                    >
                      {warehouses.map((wh) => (
                        <option key={wh.id} value={`${wh.code} (${wh.name})`}>
                          {wh.code} — {wh.name} ({wh.city || wh.region})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-white font-mono focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Lead Time (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={leadTimeDays}
                    onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-white font-mono focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs text-zinc-300">Depot verified for buyer pickup & freight dispatch</span>
                </div>
                <span className="rounded bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 text-[10px] font-mono font-bold">
                  Active
                </span>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 4: Product Media (PHOTO UPLOAD AT THE END ONLY) & Quality */}
          {/* ============================================================ */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-white/5 pb-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-indigo-400" />
                    <span>Product Photos</span>
                  </h3>
                  <span className="rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-mono font-bold">
                    {images.length}/8 Photos
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Upload multiple photos of your commodity, packaging, and export sacks
                </p>
              </div>

              {/* Clean Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative rounded-xl border-2 border-dashed p-4 sm:p-5 text-center transition-all cursor-pointer ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-white/15 bg-white/[0.02] hover:border-indigo-500/40"
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-1.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">
                      Drop product images here, or <span className="text-indigo-400 underline">browse files</span>
                    </p>
                    <p className="text-[10px] text-zinc-400">JPG, PNG, WebP up to 10MB each</p>
                  </div>

                  <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded bg-indigo-600 hover:bg-indigo-500 px-3 py-1 text-xs font-semibold text-white shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Select Files</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="sm:hidden rounded border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:text-white cursor-pointer flex items-center gap-1"
                    >
                      <Camera className="h-3 w-3 text-cyan-400" />
                      <span>Take Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsUrlInputOpen(!isUrlInputOpen)}
                      className="rounded border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:text-white cursor-pointer flex items-center gap-1"
                    >
                      <LinkIcon className="h-3 w-3 text-indigo-400" />
                      <span>Add URL</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Web URL input */}
              {isUrlInputOpen && (
                <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/[0.05] p-2.5 flex items-center gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Paste image web link (https://...)"
                    className="w-full flex-1 rounded border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddUrlImage}
                    className="rounded bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-indigo-500 cursor-pointer"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsUrlInputOpen(false)}
                    className="rounded border border-white/10 px-2 py-1 text-xs text-zinc-400 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Uploaded Photos Grid */}
              {images.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Uploaded Photos ({images.length}/8)</span>
                    <span className="text-zinc-500">First photo is catalog cover</span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {images.map((imgSrc, idx) => {
                      const isCover = idx === 0;
                      return (
                        <div
                          key={idx}
                          className={`group relative rounded-lg border overflow-hidden aspect-4/3 bg-black/40 ${
                            isCover ? "border-indigo-500 ring-2 ring-indigo-500/30" : "border-white/10"
                          }`}
                        >
                          <img src={imgSrc} alt="" className="h-full w-full object-cover" />

                          {isCover ? (
                            <div className="absolute top-1 left-1 flex items-center gap-0.5 rounded bg-indigo-600/90 px-1.5 py-0.2 text-[8px] font-bold text-white shadow-xs">
                              <Star className="h-2.5 w-2.5 fill-amber-300 text-amber-300" />
                              <span>COVER</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(idx)}
                              title="Set as cover photo"
                              className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity rounded bg-black/80 px-1 py-0.2 text-[8px] font-medium text-white cursor-pointer"
                            >
                              Make Cover
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            title="Remove photo"
                            className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/75 text-zinc-300 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}

                    {images.length < 8 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-lg border-2 border-dashed border-white/10 hover:border-indigo-500/40 aspect-4/3 flex flex-col items-center justify-center gap-0.5 text-zinc-400 hover:text-white transition-all cursor-pointer"
                      >
                        <Plus className="h-4 w-4 text-indigo-400" />
                        <span className="text-[10px]">Add</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Quality & Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Quality Grade / Standard
                  </label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="e.g. Grade 1 Export (SCA 88+)"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Packaging Specification
                  </label>
                  <input
                    type="text"
                    value={shippingWeight}
                    onChange={(e) => setShippingWeight(e.target.value)}
                    placeholder="e.g. 60 KG Polypropylene Sacks"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Quality Certifications
                  </label>
                  <input
                    type="text"
                    value={certifications.join(", ")}
                    onChange={(e) =>
                      setCertifications(e.target.value.split(",").map((s) => s.trim()))
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Pre-Publish Checklist */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                  Publish Fulfillment Checklist
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-zinc-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">Name: {name || "Untitled"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Price: ETB {basePrice} / {unit}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Stock: {initialStock} {unit}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    <span>Photos: {images.length > 0 ? `${images.length} uploaded` : "Not added"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* Navigation Actions Bottom Row (Back / Next / Publish) */}
          {/* ============================================================ */}
          <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-2">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setSubView("default");
                }}
                className="text-xs text-zinc-500 hover:text-zinc-300 py-1.5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleGoNext}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
              >
                <span>Next Step</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePublish}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-white hover:brightness-110 disabled:opacity-60 shadow-md shadow-indigo-500/25 px-5 py-2 text-xs font-bold transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving to Database...</span>
                  </>
                ) : editingProduct ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Save Changes</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Publish to Catalog</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Buyer Preview Modal Drawer */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setIsPreviewOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
            <div className="w-screen max-w-md bg-[#0d121f] text-white shadow-2xl border-l border-white/10 flex flex-col p-4 sm:p-5 overflow-y-auto space-y-3.5">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-indigo-400" />
                  <span>Buyer Marketplace Preview</span>
                </span>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="rounded p-1 text-zinc-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Photo Display (Only user's images, NO fake default) */}
              <div className="space-y-2">
                <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center">
                  {images.length > 0 ? (
                    <>
                      <img
                        src={images[activePreviewIndex] || images[0]}
                        alt={name || "Product"}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 rounded bg-black/70 px-2 py-0.5 text-[9px] font-medium text-white flex items-center gap-1">
                        {activePreviewIndex === 0 && <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />}
                        <span>{activePreviewIndex === 0 ? "Cover Photo" : `Photo ${activePreviewIndex + 1}`}</span>
                      </div>
                      <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-mono text-zinc-300">
                        {activePreviewIndex + 1} / {images.length}
                      </div>

                      {images.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setActivePreviewIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                            }
                            className="absolute left-1.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 cursor-pointer"
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setActivePreviewIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                            }
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 cursor-pointer"
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-4 text-zinc-500">
                      <ImageIcon className="h-8 w-8 text-zinc-600 mb-1" />
                      <p className="text-xs text-zinc-400">No photos uploaded</p>
                    </div>
                  )}
                </div>

                {/* Thumbnail strip */}
                {images.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActivePreviewIndex(idx)}
                        className={`relative h-12 w-12 shrink-0 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                          activePreviewIndex === idx
                            ? "border-indigo-500 scale-105"
                            : "border-white/10 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={img} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <span className="text-[11px] font-mono text-indigo-400">{sku} • {category}</span>
                <h2 className="text-base font-bold text-white mt-0.5">{name || "Untitled Product"}</h2>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{description || "No description."}</p>
              </div>

              <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-300">Base Price:</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">
                    ETB {basePrice.toLocaleString()} / {unit}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">MOQ:</span>
                  <span className="font-bold text-white font-mono">
                    {moq.toLocaleString()} {unit}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-white mb-1.5">Bulk Volume Tiers:</h4>
                <div className="space-y-1">
                  {tierPricing.map((t, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center rounded border border-white/10 bg-white/[0.02] p-1.5 text-[11px]"
                    >
                      <span className="text-zinc-300">
                        {t.minQty.toLocaleString()} - {t.maxQty ? `${t.maxQty.toLocaleString()} ${unit}` : `${unit}+`}
                      </span>
                      <span className="font-mono text-white font-semibold">
                        ETB {t.unitPrice.toLocaleString()} / {unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

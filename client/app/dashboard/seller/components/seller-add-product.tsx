"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  Layers,
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Cpu,
  Calendar,
  DollarSign,
  ShieldCheck,
  X,
  CheckCircle2,
  AlertCircle,
  Tag,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useSellerUIStore } from "@/store/ui-store";
import { toast } from "sonner";
import { sellerService } from "@/services/seller/seller.service";
import { Category, ProductUnit } from "@/types/product";

export type ProductCategory =
  | "Computers & Electronics"
  | "Smartphones & Tablets"
  | "Fashion, Apparel & Shoes"
  | "Cosmetics, Skincare & Beauty"
  | "Grains, Cereals & Groceries"
  | "Home, Kitchen & Appliances"
  | "Automotive, Parts & Tools"
  | "Books & Stationery";

const CATEGORY_OPTIONS: { id: ProductCategory; label: string; desc: string }[] = [
  {
    id: "Computers & Electronics",
    label: "Computers & Electronics",
    desc: "CPU, Generation, RAM, SSD, Battery, GPU, Warranty",
  },
  {
    id: "Smartphones & Tablets",
    label: "Smartphones & Tablets",
    desc: "Chipset, Storage, Battery, SIM, Network",
  },
  {
    id: "Fashion, Apparel & Shoes",
    label: "Fashion, Apparel & Shoes",
    desc: "Sizes, Colors, Fabric, Gender, Fit",
  },
  {
    id: "Cosmetics, Skincare & Beauty",
    label: "Cosmetics, Skincare & Beauty",
    desc: "Manufacture & Expiry Dates, Net Volume, Ingredients",
  },
  {
    id: "Grains, Cereals & Groceries",
    label: "Grains, Cereals & Groceries",
    desc: "Per Kg / 100kg Quintal, Region, Quality Grade, Packaging",
  },
  {
    id: "Home, Kitchen & Appliances",
    label: "Home, Kitchen & Appliances",
    desc: "Dimensions, Net Weight, Material, Power",
  },
  {
    id: "Automotive, Parts & Tools",
    label: "Automotive, Parts & Tools",
    desc: "Vehicle Compatibility, Part Number, Condition",
  },
  {
    id: "Books & Stationery",
    label: "Books & Stationery",
    desc: "Author, Publisher, Format, Language",
  },
];

const PRESET_IMAGES: Record<ProductCategory, { title: string; url: string }[]> = {
  "Computers & Electronics": [
    {
      title: "MacBook Pro Laptop",
      url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    },
    {
      title: "Gaming Laptop",
      url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80",
    },
    {
      title: "Fast Wall Charger",
      url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80",
    },
  ],
  "Smartphones & Tablets": [
    {
      title: "Flagship Smartphone",
      url: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80",
    },
    {
      title: "Smartphone Display",
      url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&auto=format&fit=crop&q=80",
    },
  ],
  "Fashion, Apparel & Shoes": [
    {
      title: "Cotton Woven Outfit",
      url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
    },
    {
      title: "Quality Garment",
      url: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&auto=format&fit=crop&q=80",
    },
  ],
  "Cosmetics, Skincare & Beauty": [
    {
      title: "Moisturizing Cream & Serum",
      url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80",
    },
    {
      title: "Natural Facial Care",
      url: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&auto=format&fit=crop&q=80",
    },
  ],
  "Grains, Cereals & Groceries": [
    {
      title: "Grain Sacks (100kg Quintals)",
      url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80",
    },
    {
      title: "Clean Harvest Seed Grains",
      url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80",
    },
  ],
  "Home, Kitchen & Appliances": [
    {
      title: "Kitchen Mixer Appliance",
      url: "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=800&auto=format&fit=crop&q=80",
    },
  ],
  "Automotive, Parts & Tools": [
    {
      title: "Cordless Impact Drill",
      url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80",
    },
  ],
  "Books & Stationery": [
    {
      title: "Hardcover Book Set",
      url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
    },
  ],
};

const FASHION_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Custom"];
const FASHION_COLORS = [
  { name: "White & Gold", hex: "#fefefe" },
  { name: "Jet Black", hex: "#111111" },
  { name: "Navy Blue", hex: "#1e3a8a" },
  { name: "Emerald Green", hex: "#059669" },
  { name: "Burgundy Red", hex: "#881337" },
  { name: "Royal Gold", hex: "#eab308" },
];

export function SellerAddProduct() {
  const { setActiveTab } = useSellerUIStore();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Core
  const [category, setCategory] = useState<ProductCategory>("Computers & Electronics");
  const [title, setTitle] = useState("");
  const [sku, setSku] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");

  const [backendCategories, setBackendCategories] = useState<Category[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    sellerService
      .getCategories(false)
      .then((cats) => {
        if (Array.isArray(cats) && cats.length > 0) {
          setBackendCategories(cats);
        }
      })
      .catch(() => {});
  }, []);

  // Step 2: Adaptive Specs
  // Computers
  const [cpu, setCpu] = useState("Intel Core i7-13700H");
  const [cpuGen, setCpuGen] = useState("13th Generation");
  const [ram, setRam] = useState("16GB DDR5");
  const [storage, setStorage] = useState("512GB NVMe SSD");
  const [battery, setBattery] = useState("Up to 14 Hours");
  const [gpu, setGpuModel] = useState("NVIDIA RTX 4050 6GB");
  const [condition, setCondition] = useState("Brand New Sealed");
  const [warranty, setWarranty] = useState("1 Year Brand Warranty");

  // Mobile
  const [mobileChipset, setMobileChipset] = useState("Snapdragon 8 Gen 3");
  const [mobileStorage, setMobileStorage] = useState("12GB RAM / 256GB Storage");
  const [mobileBattery, setMobileBattery] = useState("5000 mAh (45W Fast Charge)");
  const [mobileSim, setMobileSim] = useState("Dual Physical SIM / 5G");

  // Fashion
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["M", "L", "XL"]);
  const [selectedColors, setSelectedColors] = useState<string[]>(["White & Gold"]);
  const [fabric, setFabric] = useState("100% Organic Cotton");
  const [fit, setFit] = useState("Regular Fit");
  const [gender, setGender] = useState("Unisex");

  // Cosmetics
  const [mfgDate, setMfgDate] = useState("2026-03-01");
  const [expDate, setExpDate] = useState("2028-03-01");
  const [netVolume, setNetVolume] = useState("250ml (8.4 fl oz)");
  const [skinType, setSkinType] = useState("All Skin Types / Sensitive");
  const [ingredients, setIngredients] = useState("Ceramides, Hyaluronic Acid, Herbal Extracts");

  // Grains & Groceries
  const [soldByUnit, setSoldByUnit] = useState("Per 100kg Quintal");
  const [qualityGrade, setQualityGrade] = useState("Grade 1 Premium Export");
  const [originRegion, setOriginRegion] = useState("Northern Highlands");
  const [harvestSeason, setHarvestSeason] = useState("2026 Main Harvest");
  const [packagingType, setPackagingType] = useState("Hermetic Vacuum Multi-Layer Bag");

  // Home & Kitchen
  const [dimensions, setDimensions] = useState("50 x 40 x 85 cm");
  const [weight, setWeight] = useState("12.5 kg");
  const [material, setMaterial] = useState("Stainless Steel & Tempered Glass");

  // Automotive & Tools
  const [vehicleCompatibility, setVehicleCompatibility] = useState("Universal / Compact SUV");
  const [partNumber, setPartNumber] = useState("OEM-88310-42330");

  // Books
  const [author, setAuthor] = useState("Oxford Academic Press");
  const [bookFormat, setBookFormat] = useState("Hardcover Edition");

  // Step 3: Pricing & Inventory
  const [priceETB, setPriceETB] = useState("");
  const [listPriceETB, setListPriceETB] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [lowStockWarning, setLowStockWarning] = useState("5");
  const [isVatIncluded, setIsVatIncluded] = useState(true);

  // Step 4: Images
  const [images, setImages] = useState<string[]>([
    PRESET_IMAGES["Computers & Electronics"][0].url,
  ]);
  const [imageUrlInput, setImageUrlInput] = useState("");

  const handleAutoSku = () => {
    const prefix = category.substring(0, 3).toUpperCase();
    const rand = Math.floor(1000 + Math.random() * 9000);
    setSku(`${prefix}-${rand}`);
  };

  const handleCategoryChange = (newCat: ProductCategory) => {
    setCategory(newCat);
    const presets = PRESET_IMAGES[newCat];
    if (presets && presets.length > 0) {
      setImages([presets[0].url]);
    }
  };

  const toggleSize = (s: string) => {
    setSelectedSizes((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const toggleColor = (c: string) => {
    setSelectedColors((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    const toastId = toast.loading(`Uploading "${file.name}" to Cloudinary...`);

    try {
      const uploadRes = await sellerService.uploadImage(file);
      if (uploadRes && uploadRes.url) {
        setImages((prev) => [...prev, uploadRes.url]);
        toast.success(`Photo uploaded to Cloudinary: ${file.name}`, { id: toastId });
        setIsUploadingPhoto(false);
        return;
      }
    } catch {
      // Backend upload service is offline / unreachable; fall back to local preview
      console.warn("Backend image upload unreachable, falling back to local preview");
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImages((prev) => [...prev, reader.result as string]);
        toast.success(`Photo added (local preview): ${file.name}`, { id: toastId });
      }
      setIsUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages([...images, imageUrlInput.trim()]);
    setImageUrlInput("");
    toast.success("Image URL added successfully");
  };

  const handleRemoveImage = (index: number) => {
    if (images.length <= 1) {
      toast.error("At least one product photo is required");
      return;
    }
    setImages(images.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!title.trim()) {
        toast.error("Please enter a product title");
        return;
      }
      if (!sku.trim()) {
        handleAutoSku();
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!priceETB || parseFloat(priceETB) <= 0) {
        toast.error("Please enter a valid price in ETB");
        return;
      }
      if (!stockQty || parseInt(stockQty, 10) < 0) {
        toast.error("Please enter initial stock quantity");
        return;
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (images.length === 0) {
        toast.error("Please add at least one product photo");
        return;
      }
      setCurrentStep(5);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4 | 5);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    const toastId = toast.loading("Publishing product to store catalog...");

    // Match live category or fallback
    const matchedCategory = backendCategories.find(
      (c) =>
        c.name.toLowerCase() === category.toLowerCase() ||
        c.slug.toLowerCase().includes(category.toLowerCase().slice(0, 5))
    );
    const categoryId = matchedCategory?.id || backendCategories[0]?.id;

    // Map unit string to valid ProductUnit enum
    let productUnit: ProductUnit = "PIECE";
    if (category === "Grains, Cereals & Groceries") {
      productUnit = "KUNTAL";
    }

    const payload = {
      title,
      description: `${title} - Category: ${category}. Brand: ${brand || "General"}. ${description || ""}`,
      sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
      categoryId: categoryId || "00000000-0000-0000-0000-000000000000",
      retailPrice: Number(priceETB) || 0,
      wholesalePrice: listPriceETB ? Number(listPriceETB) : Math.round((Number(priceETB) || 0) * 0.95),
      minOrderQuantity: 1,
      unit: productUnit,
      stockQuantity: Number(stockQty) || 0,
      lowStockThreshold: Number(lowStockWarning) || 5,
      images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"],
    };

    try {
      if (categoryId) {
        await sellerService.createProduct(payload);
        toast.success(`"${title}" published to catalog!`, {
          id: toastId,
          description: `SKU: ${payload.sku} • Price: ETB ${Number(priceETB).toLocaleString()} • Persisted in database`,
        });
        setTimeout(() => {
          setActiveTab("products");
        }, 500);
      } else {
        throw new Error("Category not found. Please ensure backend categories are loaded.");
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message
          ? Array.isArray(err.response.data.message)
            ? err.response.data.message.join(", ")
            : err.response.data.message
          : err?.message || "Failed to publish product to catalog";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setIsPublishing(false);
    }
  };

  const numericPrice = parseFloat(priceETB) || 0;
  const netEarnings = Math.round(numericPrice * 0.975); // 2.5% fee
  const discountPercent =
    listPriceETB && parseFloat(listPriceETB) > numericPrice
      ? Math.round(((parseFloat(listPriceETB) - numericPrice) / parseFloat(listPriceETB)) * 100)
      : null;

  const steps = [
    { num: 1, label: "Info" },
    { num: 2, label: "Specs" },
    { num: 3, label: "Price" },
    { num: 4, label: "Photos" },
    { num: 5, label: "Review" },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-2.5 pb-6">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Return to Catalog"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <Package className="h-4 w-4 text-indigo-400" />
              Add Product
            </h1>
          </div>
        </div>

        {/* Minimal Stepper Bar (Desktop) */}
        <div className="hidden sm:flex items-center gap-1 bg-[#0d121f] p-1 rounded-lg border border-white/[0.08]">
          {steps.map((s) => {
            const isCurrent = currentStep === s.num;
            const isDone = currentStep > s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (isDone) setCurrentStep(s.num as any);
                }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  isCurrent
                    ? "bg-indigo-600 text-white font-semibold shadow-xs"
                    : isDone
                    ? "text-cyan-300 hover:bg-white/5 cursor-pointer"
                    : "text-zinc-600 cursor-not-allowed"
                }`}
              >
                <span>{s.num}.</span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Stepper Indicator */}
        <div className="sm:hidden flex items-center gap-1">
          {steps.map((s) => {
            const isCurrent = currentStep === s.num;
            const isDone = currentStep > s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (isDone) setCurrentStep(s.num as any);
                }}
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                  isCurrent
                    ? "bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-1 ring-offset-[#070a10]"
                    : isDone
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-white/5 text-zinc-600"
                }`}
              >
                {s.num}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Step Title & Progress Bar */}
      <div className="sm:hidden space-y-1.5 px-0.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-zinc-400">Step {currentStep} of 5</span>
          <span className="font-bold text-white">{steps[currentStep - 1].label}</span>
        </div>
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* MINIMAL CARD CONTAINER */}
      <div className="rounded-xl border border-white/10 bg-[#0d121f] p-4 sm:p-5 shadow-2xl space-y-3.5">
        {/* STEP 1: CATEGORY & BASIC INFO */}
        {currentStep === 1 && (
          <div className="space-y-3">
            {/* Category Dropdown */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-indigo-300">
                  Select Category *
                </label>
                <span className="text-[10px] text-zinc-400">Adaptive Fields</span>
              </div>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as ProductCategory)}
                className="w-full h-8 rounded-lg border border-indigo-500/40 bg-[#090d16] px-2.5 text-xs text-white outline-none focus:border-indigo-400 cursor-pointer"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label} ({cat.desc})
                  </option>
                ))}
              </select>
            </div>

            {/* Product Title */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Apple MacBook Pro 14 M3 / Facial Cream / Organic White Grain"
                className="w-full h-8 rounded-lg border border-white/10 bg-[#090d16] px-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
              />
            </div>

            {/* Brand & SKU */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                  Brand / Manufacturer
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Apple / Samsung / CeraVe"
                  className="w-full h-8 rounded-lg border border-white/10 bg-[#090d16] px-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-zinc-300">SKU Code</label>
                  <button
                    type="button"
                    onClick={handleAutoSku}
                    className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
                  >
                    Auto Generate
                  </button>
                </div>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. ELE-8492"
                  className="w-full h-8 rounded-lg border border-white/10 bg-[#090d16] px-2.5 text-xs font-mono text-zinc-200 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                Description & Highlights
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Key highlights, warranty coverage, packaging, authentication..."
                className="w-full rounded-lg border border-white/10 bg-[#090d16] p-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* STEP 2: DYNAMIC ADAPTIVE SPECIFICATIONS */}
        {currentStep === 2 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5">
              <span className="text-[11px] font-semibold text-indigo-300">
                {category} Specifications
              </span>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-[10.5px] text-zinc-400 hover:text-white underline cursor-pointer"
              >
                Change Category
              </button>
            </div>

            {/* Computers & Electronics */}
            {category === "Computers & Electronics" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-[10.5px] text-zinc-400 mb-0.5">Processor / CPU</label>
                  <input
                    type="text"
                    value={cpu}
                    onChange={(e) => setCpu(e.target.value)}
                    placeholder="Intel Core i7-13700H"
                    className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] text-zinc-400 mb-0.5">Generation</label>
                  <input
                    type="text"
                    value={cpuGen}
                    onChange={(e) => setCpuGen(e.target.value)}
                    placeholder="13th Gen / M3"
                    className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] text-zinc-400 mb-0.5">RAM Memory</label>
                  <select
                    value={ram}
                    onChange={(e) => setRam(e.target.value)}
                    className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-1.5 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="8GB DDR5">8GB DDR5</option>
                    <option value="16GB DDR5">16GB DDR5</option>
                    <option value="18GB Unified RAM">18GB Unified RAM</option>
                    <option value="32GB LPDDR5X">32GB LPDDR5X</option>
                    <option value="64GB RAM">64GB RAM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10.5px] text-zinc-400 mb-0.5">Storage SSD</label>
                  <select
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                    className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-1.5 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="256GB NVMe SSD">256GB NVMe SSD</option>
                    <option value="512GB NVMe SSD">512GB NVMe SSD</option>
                    <option value="1TB PCIe 4.0 SSD">1TB PCIe 4.0 SSD</option>
                    <option value="2TB SSD">2TB SSD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10.5px] text-zinc-400 mb-0.5">Battery Life</label>
                  <input
                    type="text"
                    value={battery}
                    onChange={(e) => setBattery(e.target.value)}
                    placeholder="e.g. Up to 14 Hours"
                    className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] text-zinc-400 mb-0.5">Graphics / GPU</label>
                  <input
                    type="text"
                    value={gpu}
                    onChange={(e) => setGpuModel(e.target.value)}
                    placeholder="RTX 4050 6GB"
                    className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] text-zinc-400 mb-0.5">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-1.5 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="Brand New Sealed">Brand New Sealed</option>
                    <option value="Open Box Like New">Open Box Like New</option>
                    <option value="Certified Refurbished">Certified Refurbished</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10.5px] text-zinc-400 mb-0.5">Warranty</label>
                  <input
                    type="text"
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    placeholder="1 Year Official Brand Warranty"
                    className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Smartphones & Tablets */}
            {category === "Smartphones & Tablets" && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10.5px] text-zinc-400 mb-0.5">Chipset / Processor</label>
                  <input
                    type="text"
                    value={mobileChipset}
                    onChange={(e) => setMobileChipset(e.target.value)}
                    placeholder="Snapdragon 8 Gen 3"
                    className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] text-zinc-400 mb-0.5">Storage & RAM</label>
                  <input
                    type="text"
                    value={mobileStorage}
                    onChange={(e) => setMobileStorage(e.target.value)}
                    placeholder="12GB RAM / 256GB Storage"
                    className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] text-zinc-400 mb-0.5">Battery Capacity</label>
                  <input
                    type="text"
                    value={mobileBattery}
                    onChange={(e) => setMobileBattery(e.target.value)}
                    placeholder="5000 mAh (45W Fast Charging)"
                    className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] text-zinc-400 mb-0.5">SIM & Cellular</label>
                  <input
                    type="text"
                    value={mobileSim}
                    onChange={(e) => setMobileSim(e.target.value)}
                    placeholder="Dual Physical SIM / 5G"
                    className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Fashion, Apparel & Shoes */}
            {category === "Fashion, Apparel & Shoes" && (
              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-[10.5px] text-zinc-400 mb-1">Available Sizes</label>
                  <div className="flex flex-wrap gap-1">
                    {FASHION_SIZES.map((sz) => {
                      const isSel = selectedSizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => toggleSize(sz)}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                            isSel
                              ? "bg-indigo-600 border-indigo-500 text-white font-bold"
                              : "border-white/10 bg-[#090d16] text-zinc-400 hover:text-white"
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[10.5px] text-zinc-400 mb-1">Color Palette</label>
                  <div className="flex flex-wrap gap-1.5">
                    {FASHION_COLORS.map((col) => {
                      const isSel = selectedColors.includes(col.name);
                      return (
                        <button
                          key={col.name}
                          type="button"
                          onClick={() => toggleColor(col.name)}
                          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] border transition-all cursor-pointer ${
                            isSel
                              ? "border-cyan-400 bg-cyan-950/40 text-cyan-200"
                              : "border-white/10 bg-[#090d16] text-zinc-400 hover:text-white"
                          }`}
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full border border-white/30"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span>{col.name}</span>
                          {isSel && <Check className="h-3 w-3 text-cyan-400 ml-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10.5px] text-zinc-400 mb-0.5">Fabric</label>
                    <input
                      type="text"
                      value={fabric}
                      onChange={(e) => setFabric(e.target.value)}
                      placeholder="100% Organic Cotton"
                      className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-2 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] text-zinc-400 mb-0.5">Fit</label>
                    <select
                      value={fit}
                      onChange={(e) => setFit(e.target.value)}
                      className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-1.5 text-xs text-white outline-none focus:border-indigo-500"
                    >
                      <option value="Regular Fit">Regular Fit</option>
                      <option value="Slim Fit">Slim Fit</option>
                      <option value="Tailored Fit">Tailored Fit</option>
                      <option value="Relaxed Fit">Relaxed Fit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10.5px] text-zinc-400 mb-0.5">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-1.5 text-xs text-white outline-none focus:border-indigo-500"
                    >
                      <option value="Unisex">Unisex</option>
                      <option value="Women">Women</option>
                      <option value="Men">Men</option>
                      <option value="Kids">Kids</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Cosmetics, Skincare & Beauty */}
            {category === "Cosmetics, Skincare & Beauty" && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10.5px] text-zinc-400 mb-0.5">Manufacture Date</label>
                  <input
                    type="date"
                    value={mfgDate}
                    onChange={(e) => setMfgDate(e.target.value)}
                    className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] text-zinc-400 mb-0.5">Expiry Date</label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] text-zinc-400 mb-0.5">Net Volume / Size</label>
                  <input
                    type="text"
                    value={netVolume}
                    onChange={(e) => setNetVolume(e.target.value)}
                    placeholder="250ml (8.4 fl oz)"
                    className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] text-zinc-400 mb-0.5">Skin Type Suitability</label>
                  <input
                    type="text"
                    value={skinType}
                    onChange={(e) => setSkinType(e.target.value)}
                    placeholder="All Skin Types / Sensitive"
                    className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10.5px] text-zinc-400 mb-0.5">Active Ingredients</label>
                  <input
                    type="text"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    placeholder="Ceramides, Hyaluronic Acid, Herbal Extracts"
                    className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Grains, Cereals & Groceries */}
            {category === "Grains, Cereals & Groceries" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-[10.5px] text-zinc-400 mb-0.5">Unit Measurement</label>
                  <select
                    value={soldByUnit}
                    onChange={(e) => setSoldByUnit(e.target.value)}
                    className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-1.5 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="Per Kilogram (kg)">Per Kilogram (kg)</option>
                    <option value="Per 100kg Quintal">Per 100kg Quintal</option>
                    <option value="Per 50kg Sack">Per 50kg Sack</option>
                    <option value="Per Metric Ton">Per Metric Ton</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10.5px] text-zinc-400 mb-0.5">Quality Grade</label>
                  <select
                    value={qualityGrade}
                    onChange={(e) => setQualityGrade(e.target.value)}
                    className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-1.5 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="Grade 1 Premium Export">Grade 1 Premium Export</option>
                    <option value="Grade 1 Organic White">Grade 1 Organic White</option>
                    <option value="Grade 2 Standard Commercial">Grade 2 Standard Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10.5px] text-zinc-400 mb-0.5">Growing Region</label>
                  <select
                    value={originRegion}
                    onChange={(e) => setOriginRegion(e.target.value)}
                    className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-1.5 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="Northern Highlands">Northern Highlands</option>
                    <option value="Central Valley Basin">Central Valley Basin</option>
                    <option value="Rift Valley Plains">Rift Valley Plains</option>
                    <option value="Southern Fertile Basin">Southern Fertile Basin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10.5px] text-zinc-400 mb-0.5">Harvest Season</label>
                  <input
                    type="text"
                    value={harvestSeason}
                    onChange={(e) => setHarvestSeason(e.target.value)}
                    placeholder="2026 Main Harvest"
                    className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10.5px] text-zinc-400 mb-0.5">Packaging</label>
                  <input
                    type="text"
                    value={packagingType}
                    onChange={(e) => setPackagingType(e.target.value)}
                    placeholder="Hermetic Vacuum Multi-Layer Bag"
                    className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Home, Automotive & Books (General) */}
            {(category === "Home, Kitchen & Appliances" ||
              category === "Automotive, Parts & Tools" ||
              category === "Books & Stationery") && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                {category === "Home, Kitchen & Appliances" && (
                  <>
                    <div>
                      <label className="block text-[10.5px] text-zinc-400 mb-0.5">Dimensions (cm)</label>
                      <input
                        type="text"
                        value={dimensions}
                        onChange={(e) => setDimensions(e.target.value)}
                        placeholder="50 x 40 x 85 cm"
                        className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-2 text-xs text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] text-zinc-400 mb-0.5">Net Weight</label>
                      <input
                        type="text"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="12.5 kg"
                        className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-2 text-xs text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10.5px] text-zinc-400 mb-0.5">Material Composition</label>
                      <input
                        type="text"
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                        placeholder="Stainless Steel & Tempered Glass"
                        className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-2 text-xs text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </>
                )}

                {category === "Automotive, Parts & Tools" && (
                  <>
                    <div>
                      <label className="block text-[10.5px] text-zinc-400 mb-0.5">Vehicle Compatibility</label>
                      <input
                        type="text"
                        value={vehicleCompatibility}
                        onChange={(e) => setVehicleCompatibility(e.target.value)}
                        placeholder="Universal / Compact SUV"
                        className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-2 text-xs text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] text-zinc-400 mb-0.5">Part / OEM Number</label>
                      <input
                        type="text"
                        value={partNumber}
                        onChange={(e) => setPartNumber(e.target.value)}
                        placeholder="OEM-88310-42330"
                        className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-2 text-xs text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </>
                )}

                {category === "Books & Stationery" && (
                  <>
                    <div>
                      <label className="block text-[10.5px] text-zinc-400 mb-0.5">Author / Publisher</label>
                      <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Oxford Academic Press"
                        className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-2 text-xs text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10.5px] text-zinc-400 mb-0.5">Book Format</label>
                      <input
                        type="text"
                        value={bookFormat}
                        onChange={(e) => setBookFormat(e.target.value)}
                        placeholder="Hardcover Edition"
                        className="h-7.5 w-full rounded-lg border border-white/10 bg-[#090d16] px-2 text-xs text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: PRICING & INVENTORY */}
        {currentStep === 3 && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-200 mb-1">
                  Selling Price (ETB) *
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-indigo-400">
                    ETB
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={priceETB}
                    onChange={(e) => setPriceETB(e.target.value)}
                    placeholder="45000"
                    className="h-8 w-full rounded-lg border border-white/10 bg-[#090d16] pl-10 pr-2 text-xs font-mono font-bold text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-zinc-400">List Price</label>
                  {discountPercent !== null && discountPercent > 0 && (
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      -{discountPercent}%
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500">
                    ETB
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={listPriceETB}
                    onChange={(e) => setListPriceETB(e.target.value)}
                    placeholder="50000"
                    className="h-8 w-full rounded-lg border border-white/10 bg-[#090d16] pl-10 pr-2 text-xs font-mono text-zinc-400 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-200 mb-1">
                  Stock Units *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value)}
                  placeholder="20"
                  className="h-8 w-full rounded-lg border border-white/10 bg-[#090d16] px-2.5 text-xs font-mono font-bold text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="block text-[10.5px] text-zinc-400 mb-1">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  value={lowStockWarning}
                  onChange={(e) => setLowStockWarning(e.target.value)}
                  className="h-8 w-full rounded-lg border border-white/10 bg-[#090d16] px-2.5 text-xs font-mono text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg border border-white/10 bg-[#090d16]">
                <div>
                  <p className="text-xs font-semibold text-white">VAT Included (15%)</p>
                  <p className="text-[10px] text-zinc-500">Inclusive pricing</p>
                </div>
                <input
                  type="checkbox"
                  checked={isVatIncluded}
                  onChange={(e) => setIsVatIncluded(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/10 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Payout calculation pill */}
            {numericPrice > 0 && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-indigo-300">
                <span className="text-[11px]">Estimated Net Payout (97.5%):</span>
                <span className="font-mono font-bold text-cyan-300 text-xs">
                  ETB {netEarnings.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: COMPACT PHOTOS */}
        {currentStep === 4 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">
                Photos ({images.length})
              </span>
              <span className="text-[10px] text-zinc-400">First photo is cover</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative h-20 rounded-lg overflow-hidden border border-white/15 bg-black/40"
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} className="h-full w-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 rounded bg-indigo-600 px-1 py-0.2 text-[8px] font-bold text-white shadow">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/80 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}

              <label className="flex flex-col items-center justify-center h-20 rounded-lg border-2 border-dashed border-white/20 bg-white/[0.02] hover:bg-white/[0.05] hover:border-indigo-500/60 transition-all cursor-pointer text-center p-1">
                <Upload className="h-4 w-4 text-indigo-400 mb-0.5" />
                <span className="text-[10.5px] font-semibold text-zinc-300">Upload</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Direct URL input */}
            <div className="flex gap-1.5 pt-1">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Paste direct photo URL..."
                className="h-7.5 flex-1 rounded-lg border border-white/10 bg-[#090d16] px-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
              >
                Add URL
              </button>
            </div>

            {/* Quick Presets */}
            {PRESET_IMAGES[category] && (
              <div className="pt-1 border-t border-white/[0.06]">
                <span className="text-[10.5px] text-zinc-400 block mb-1">
                  1-Click Sample Photos:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_IMAGES[category].map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => {
                        if (!images.includes(preset.url)) {
                          setImages([...images, preset.url]);
                          toast.success(`Added sample: ${preset.title}`);
                        }
                      }}
                      className="px-2 py-0.5 rounded text-[10px] border border-white/10 bg-white/[0.03] text-zinc-300 hover:text-white hover:border-indigo-400 transition-colors cursor-pointer"
                    >
                      + {preset.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: COMPACT REVIEW & CONFIRM */}
        {currentStep === 5 && (
          <div className="space-y-3">
            <div className="rounded-lg border border-white/10 bg-[#090d16] p-3 space-y-2.5">
              <div className="flex gap-3">
                <img
                  src={images[0] || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"}
                  alt={title}
                  className="h-16 w-16 rounded-md object-cover border border-white/10"
                />
                <div className="flex-1 min-w-0">
                  <span className="inline-block px-1.5 py-0.5 rounded text-[9.5px] font-semibold bg-indigo-500/20 text-indigo-300 mb-0.5">
                    {category}
                  </span>
                  <h3 className="text-xs font-bold text-white truncate">{title || "Untitled Product"}</h3>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    SKU: {sku || "PENDING"} {brand && `• Brand: ${brand}`}
                  </p>
                  <p className="text-xs font-bold text-emerald-400 mt-0.5 font-mono">
                    ETB {numericPrice.toLocaleString()}{" "}
                    <span className="text-[10px] text-zinc-400 font-normal">
                      ({stockQty || 0} in stock)
                    </span>
                  </p>
                </div>
              </div>

              {/* Specs Pills */}
              <div className="pt-2 border-t border-white/[0.06] flex flex-wrap gap-1 text-[10px]">
                {category === "Computers & Electronics" && (
                  <>
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-300">{cpu}</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-300">{ram}</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-300">{storage}</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-300">{gpu}</span>
                  </>
                )}
                {category === "Fashion, Apparel & Shoes" && (
                  <>
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-300">
                      Sizes: {selectedSizes.join(", ")}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-300">
                      Colors: {selectedColors.join(", ")}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-300">{fabric}</span>
                  </>
                )}
                {category === "Cosmetics, Skincare & Beauty" && (
                  <>
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-300">Mfg: {mfgDate}</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-300">Exp: {expDate}</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-300">{netVolume}</span>
                  </>
                )}
                {category === "Grains, Cereals & Groceries" && (
                  <>
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-300">{soldByUnit}</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-300">{qualityGrade}</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-300">{originRegion}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-xs">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>Listing ready for instant verification and catalog deployment.</span>
            </div>
          </div>
        )}

        {/* CARD FOOTER: COMPACT NAVIGATION BUTTONS */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab("products")}
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-transparent text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md transition-all cursor-pointer"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-xs font-semibold text-white shadow-md shadow-emerald-900/30 transition-all cursor-pointer"
            >
              {isPublishing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              {isPublishing ? "Publishing..." : "Publish Product"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

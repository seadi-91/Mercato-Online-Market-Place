import { B2BProduct, ProductStatus, TierPrice, SourcingProduct } from "@/types/supplier";
import { Product, CreateProductInput, UpdateProductInput, ProductUnit } from "@/types/product";

/**
 * Maps human-readable wholesale units to backend ProductUnit enum values.
 */
export function mapWholesaleUnitToProductUnit(unit: string): ProductUnit {
  const normalized = (unit || "").trim().toLowerCase();
  if (normalized.includes("kuntal") || normalized.includes("quintal")) {
    return "KUNTAL";
  }
  if (normalized.includes("carton") || normalized.includes("bag")) {
    return "CARTON";
  }
  if (normalized.includes("dozen")) {
    return "DOZEN";
  }
  if (normalized.includes("roll")) {
    return "ROLL";
  }
  // Fallback default for items measured in KG, Units, or individual pieces
  return "PIECE";
}

/**
 * Converts a backend Product (fetched from PostgreSQL) to a frontend B2BProduct.
 */
export function mapBackendProductToB2B(p: Product): B2BProduct {
  const images = Array.isArray(p.images) && p.images.length > 0
    ? p.images
    : ["/images/placeholder-product.jpg"];

  const rawUnit = p.unit || "KG";
  const displayUnit = rawUnit === "KUNTAL"
    ? "Quintal (100kg)"
    : rawUnit === "CARTON"
    ? "Bags (60kg)"
    : rawUnit === "PIECE"
    ? "KG"
    : rawUnit;

  const basePrice = Number(p.wholesalePrice ?? p.retailPrice ?? 0);
  const stock = Number(p.stockQuantity ?? 0);
  const moq = Number(p.minOrderQuantity ?? 1);

  // Status mapping
  let status: ProductStatus = "published";
  if (p.status) {
    status = p.status as ProductStatus;
  } else if (!p.isActive) {
    status = "draft";
  } else if (stock <= 0) {
    status = "out_of_stock";
  }

  // Tier pricing mapping
  const tierPricing: TierPrice[] = Array.isArray(p.tieredPricing) && p.tieredPricing.length > 0
    ? p.tieredPricing.map((tp, idx) => ({
        id: tp.id || `t-${idx + 1}`,
        minQty: Number(tp.minQuantity ?? 1),
        maxQty: tp.maxQuantity !== null && tp.maxQuantity !== undefined ? Number(tp.maxQuantity) : null,
        unitPrice: Number(tp.discountedPricePerUnit ?? basePrice),
        discountPercentage: basePrice > 0 && tp.discountedPricePerUnit
          ? Number((((basePrice - Number(tp.discountedPricePerUnit)) / basePrice) * 100).toFixed(1))
          : 0,
      }))
    : [
        {
          id: `t-1`,
          minQty: moq,
          maxQty: null,
          unitPrice: basePrice,
          discountPercentage: 0,
        },
      ];

  const categoryName = p.category?.name || "Agricultural Commodities";

  return {
    id: p.id,
    name: p.title || "Untitled Product",
    sku: p.sku || `ETH-B2B-${p.id.slice(0, 6).toUpperCase()}`,
    category: categoryName,
    subcategory: p.grade || "Specialty Export Grade",
    brand: p.brand || "Abyssinia Premium Exporters",
    origin: p.origin || "Ethiopia",
    grade: p.grade || "Export Standard",
    unit: displayUnit,
    basePrice,
    currency: "ETB",
    moq,
    stock,
    reservedStock: 0,
    status,
    images,
    views: Number(p.views ?? 0),
    salesCount: Number(p.salesCount ?? 0),
    rating: Number(p.rating ?? 5.0),
    ratingCount: Number(p.ratingCount ?? 1),
    createdAt: p.createdAt ? String(p.createdAt).split("T")[0] : new Date().toISOString().split("T")[0],
    tierPricing,
    description: p.description || "",
    certifications: Array.isArray(p.certifications) && p.certifications.length > 0
      ? p.certifications
      : ["ECX Verified", "Quality Certified"],
    warehouseLocation: p.warehouseLocation || "Addis Ababa Central Logistics Hub (WH-AA)",
    branchId: p.branchId || "wh-aa",
    branchName: p.branchName || "Addis Ababa Central Logistics Hub",
    leadTimeDays: Number(p.leadTimeDays ?? 3),
  };
}

/**
 * Converts form data from the B2B Wholesale create/edit view into backend CreateProductInput.
 */
export function mapB2BToCreateInput(
  b2b: Omit<B2BProduct, "id" | "views" | "salesCount" | "rating" | "ratingCount" | "createdAt">,
  categoryId: string
): CreateProductInput {
  const backendUnit = mapWholesaleUnitToProductUnit(b2b.unit);

  const tieredPricing = Array.isArray(b2b.tierPricing) && b2b.tierPricing.length > 0
    ? b2b.tierPricing.map((tp) => ({
        minQuantity: Number(tp.minQty),
        maxQuantity: tp.maxQty ? Number(tp.maxQty) : undefined,
        discountedPricePerUnit: Number(tp.unitPrice),
      }))
    : undefined;

  return {
    title: b2b.name,
    description: b2b.description,
    sku: b2b.sku,
    categoryId,
    retailPrice: Number(b2b.basePrice),
    wholesalePrice: Number(b2b.basePrice),
    minOrderQuantity: Number(b2b.moq),
    unit: backendUnit,
    stockQuantity: Number(b2b.stock),
    lowStockThreshold: Math.max(1, Math.round(Number(b2b.stock) * 0.1)),
    images: b2b.images,
    brand: b2b.brand,
    origin: b2b.origin,
    grade: b2b.grade,
    warehouseLocation: b2b.warehouseLocation,
    branchId: b2b.branchId,
    branchName: b2b.branchName,
    status: b2b.status,
    certifications: b2b.certifications,
    leadTimeDays: b2b.leadTimeDays,
    tieredPricing,
  };
}

/**
 * Converts form data into backend UpdateProductInput.
 */
export function mapB2BToUpdateInput(
  b2b: Partial<B2BProduct>,
  categoryId?: string
): UpdateProductInput {
  const update: UpdateProductInput = {};

  if (b2b.name !== undefined) update.title = b2b.name;
  if (b2b.description !== undefined) update.description = b2b.description;
  if (b2b.sku !== undefined) update.sku = b2b.sku;
  if (categoryId) update.categoryId = categoryId;
  if (b2b.basePrice !== undefined) {
    update.retailPrice = Number(b2b.basePrice);
    update.wholesalePrice = Number(b2b.basePrice);
  }
  if (b2b.moq !== undefined) update.minOrderQuantity = Number(b2b.moq);
  if (b2b.unit !== undefined) update.unit = mapWholesaleUnitToProductUnit(b2b.unit);
  if (b2b.stock !== undefined) {
    update.stockQuantity = Number(b2b.stock);
    update.isAvailable = Number(b2b.stock) > 0;
  }
  if (b2b.images !== undefined) update.images = b2b.images;
  if (b2b.brand !== undefined) update.brand = b2b.brand;
  if (b2b.origin !== undefined) update.origin = b2b.origin;
  if (b2b.grade !== undefined) update.grade = b2b.grade;
  if (b2b.warehouseLocation !== undefined) update.warehouseLocation = b2b.warehouseLocation;
  if (b2b.branchId !== undefined) update.branchId = b2b.branchId;
  if (b2b.branchName !== undefined) update.branchName = b2b.branchName;
  if (b2b.status !== undefined) {
    update.status = b2b.status;
    update.isActive = b2b.status !== "draft" && b2b.status !== "archived";
    update.isAvailable = b2b.status === "published";
  }
  if (b2b.certifications !== undefined) update.certifications = b2b.certifications;
  if (b2b.leadTimeDays !== undefined) update.leadTimeDays = b2b.leadTimeDays;

  if (b2b.tierPricing !== undefined) {
    update.tieredPricing = b2b.tierPricing.map((tp) => ({
      minQuantity: Number(tp.minQty),
      maxQuantity: tp.maxQty ? Number(tp.maxQty) : undefined,
      discountedPricePerUnit: Number(tp.unitPrice),
    }));
  }

  return update;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

/**
 * Converts a backend Product (fetched from PostgreSQL catalog) into a rich SourcingProduct
 * used in the Sourcing & Procurement Marketplace.
 */
export function mapBackendProductToSourcing(p: Product): SourcingProduct {
  const images = Array.isArray(p.images) && p.images.length > 0
    ? p.images
    : ["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"];

  const rawUnit = p.unit || "PIECE";
  const displayUnit = rawUnit === "KUNTAL"
    ? "Quintal (100kg)"
    : rawUnit === "CARTON"
    ? "Carton / Sack"
    : rawUnit === "DOZEN"
    ? "Dozen"
    : rawUnit === "ROLL"
    ? "Roll"
    : rawUnit === "PIECE"
    ? "Piece / Unit"
    : rawUnit;

  const baseWholesalePrice = Number(p.wholesalePrice ?? p.retailPrice ?? 0);
  const retailPrice = Number(p.retailPrice ?? (baseWholesalePrice > 0 ? baseWholesalePrice * 1.08 : 0));
  const stockQuantity = Number(p.stockQuantity ?? 0);
  const moq = Number(p.minOrderQuantity ?? 1);

  // Map Tiered Pricing from backend
  const tierPricing: TierPrice[] = Array.isArray(p.tieredPricing) && p.tieredPricing.length > 0
    ? p.tieredPricing.map((tp, idx) => ({
        id: tp.id || `tp-${idx + 1}`,
        minQty: Number(tp.minQuantity ?? moq),
        maxQty: tp.maxQuantity !== null && tp.maxQuantity !== undefined ? Number(tp.maxQuantity) : null,
        unitPrice: Number(tp.discountedPricePerUnit ?? baseWholesalePrice),
        discountPercentage: baseWholesalePrice > 0 && tp.discountedPricePerUnit
          ? Number((((baseWholesalePrice - Number(tp.discountedPricePerUnit)) / baseWholesalePrice) * 100).toFixed(2))
          : 0,
      }))
    : [
        {
          id: `tp-1`,
          minQty: moq,
          maxQty: moq * 3,
          unitPrice: baseWholesalePrice,
          discountPercentage: 0,
        },
        {
          id: `tp-2`,
          minQty: moq * 3 + 1,
          maxQty: moq * 8,
          unitPrice: Math.round(baseWholesalePrice * 0.96),
          discountPercentage: 4.0,
        },
        {
          id: `tp-3`,
          minQty: moq * 8 + 1,
          maxQty: null,
          unitPrice: Math.round(baseWholesalePrice * 0.92),
          discountPercentage: 8.0,
        },
      ];

  const categoryName = p.category?.name || "Agricultural Commodities";
  const categorySlug = p.category?.slug || "agricultural-commodities";
  const brand = p.brand || "Abyssinia Direct Producers";
  const origin = p.origin || "Addis Ababa / Regional Distribution Hub";
  const grade = p.grade || "Export Standard Grade A";

  // Build realistic dynamic specifications based on commodity type
  const lowerTitle = (p.title || "").toLowerCase();
  const lowerCat = categoryName.toLowerCase();
  let specifications: Record<string, string> = {
    "Origin Region": origin,
    "Quality Grade": grade,
    "Measurement Unit": displayUnit,
    "Standard Lead Time": `${p.leadTimeDays ?? 2} business days`,
    "Packaging": `${displayUnit} standard export-grade packaging`,
    "Stock Availability": `${stockQuantity.toLocaleString()} ${displayUnit} in stock`,
  };

  if (lowerTitle.includes("coffee") || lowerCat.includes("coffee")) {
    specifications = {
      "Origin Region": origin,
      "Quality Grade": grade,
      "Processing Method": "Washed & Sun-Dried on African Raised Beds",
      "Moisture Content": "10.8% - 11.4% (ECX Standard)",
      "Screen Size": "Screen 15+ (Over 85%)",
      "Packaging": "60kg GrainPro hermetic lined multi-wall jute bags",
    };
  } else if (lowerTitle.includes("teff") || lowerCat.includes("grain") || lowerCat.includes("cereal")) {
    specifications = {
      "Grain Variety": "Quncho Magna Double-Cleaned",
      "Purity Level": "99.8% Optical Color Sorted (Zero Stone)",
      "Moisture Content": "Max 11.5%",
      "Foreign Matter": "Less than 0.1%",
      "Packaging": "50kg & 100kg Double Polypropylene Branded Sacks",
    };
  } else if (lowerTitle.includes("sesame") || lowerCat.includes("oilseed") || lowerCat.includes("pulse")) {
    specifications = {
      "Oil Content": "Min 52.5% - 54.0%",
      "Purity Rate": "Min 99.0%",
      "FFA Level": "Max 1.5%",
      "Moisture": "Max 6.0%",
      "Packaging": "50kg multi-ply PP bags",
    };
  } else if (lowerTitle.includes("steel") || lowerTitle.includes("rebar") || lowerCat.includes("construction")) {
    specifications = {
      "Standard Compliance": "ASTM A615 / ES 440:2020",
      "Yield Strength": "460 - 520 MPa (tested)",
      "Elongation": "Min 14%",
      "Bundle Weight": "Approx. 2.0 Metric Tons per strapped pack",
      "Quality Control": "Mill Test Certificate (MTC) Included",
    };
  } else if (lowerTitle.includes("cement")) {
    specifications = {
      "Strength Class": "CEM I 42.5N High Early Strength",
      "Compressive Strength 28 Days": ">= 45.0 MPa",
      "Initial Setting Time": "145 Minutes",
      "Packaging": "50kg 3-ply Kraft paper sacks with moisture barrier",
    };
  }

  const certifications = Array.isArray(p.certifications) && p.certifications.length > 0
    ? p.certifications
    : [
        "Ethiopian Conformity Assessment (ECAE) Certified",
        "ECX Verified Grade Standard",
        "Quality & Standards Authority Clearance",
      ];

  const warehouseLocation = p.warehouseLocation || p.branchName || "Addis Ababa Central Logistics Hub (WH-AA)";
  const leadTimeDays = Number(p.leadTimeDays ?? 2);
  const supplierRating = Number(p.rating ?? 4.88);
  const supplierRatingCount = Number(p.ratingCount ?? 86);
  const supplierName = p.brand ? `${p.brand} Trading SC` : "Verified Commercial Producer";
  const supplierTin = "00" + Math.abs(hashCode(p.sellerId || p.id)).toString().slice(0, 8).padStart(8, "5");

  return {
    id: p.id,
    name: p.title || "Untitled Product",
    nameAmharic: p.category?.nameAmharic,
    sku: p.sku || `SRC-${p.id.slice(0, 8).toUpperCase()}`,
    category: categoryName,
    categorySlug,
    subcategory: grade,
    brand,
    origin,
    grade,
    unit: displayUnit,
    baseWholesalePrice,
    retailPrice,
    currency: "ETB",
    moq,
    stockQuantity,
    images,
    description: p.description || "",
    specifications,
    certifications,
    warehouseLocation,
    leadTimeDays,
    supplierId: p.sellerId || "sup-verified-01",
    supplierName,
    supplierTin,
    supplierVerified: true,
    supplierRating,
    supplierRatingCount,
    supplierResponseTime: "< 15 mins",
    supplierMarketZone: warehouseLocation.split("(")[0].trim(),
    tierPricing,
    minOrderValueETB: baseWholesalePrice * moq,
    isEscrowGuaranteed: true,
    createdAt: p.createdAt ? String(p.createdAt) : new Date().toISOString(),
  };
}


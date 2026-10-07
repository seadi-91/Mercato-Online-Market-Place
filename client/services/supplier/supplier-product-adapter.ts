import { B2BProduct, ProductStatus, TierPrice } from "@/types/supplier";
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

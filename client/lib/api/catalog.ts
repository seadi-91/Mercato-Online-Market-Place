import { API_CONFIG } from "@/config/api.config";
import { Product, CategoryItem } from "@/constants/mock-data";
import { api } from "@/services/api/client";

export interface BackendCategory {
  id: string;
  name: string;
  nameAmharic?: string;
  slug: string;
  iconUrl?: string | null;
  parentCategoryId?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  subCategories?: BackendCategory[];
}

export interface BackendTieredPricing {
  id?: string;
  productId?: string;
  minQuantity: number;
  maxQuantity?: number | null;
  discountedPricePerUnit: number | string;
}

export interface BackendProduct {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  sku: string;
  categoryId: string;
  category?: BackendCategory;
  retailPrice: string | number;
  wholesalePrice: string | number;
  minOrderQuantity: number;
  unit: string;
  stockQuantity: number;
  lowStockThreshold?: number;
  images: string[];
  isAvailable: boolean;
  isActive: boolean;
  brand?: string;
  origin?: string;
  grade?: string;
  warehouseLocation?: string;
  branchId?: string;
  branchName?: string;
  status?: string;
  certifications?: string[];
  leadTimeDays?: number;
  views?: number;
  salesCount?: number;
  rating?: number | string;
  ratingCount?: number;
  tieredPricing?: BackendTieredPricing[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "createdAt" | "retailPrice" | "wholesalePrice" | "title" | "stockQuantity";
  sortOrder?: "ASC" | "DESC";
}

export interface SellerProfile {
  id?: string;
  userId?: string;
  fullName?: string;
  email?: string;
  alternatePhone?: string;
  shopName?: string;
  marketZone?: string;
  city?: string;
  subCity?: string;
  specificLocation?: string;
  role?: string;
  isVerifiedMerchant?: boolean;
  merchantKycStatus?: string;
  isActive?: boolean;
}

const CATEGORY_IMAGES: Record<string, string> = {
  "computers-electronics": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
  "smartphones-mobile": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
  "fashion-apparel-shoes": "/images/hero-cultural-fashion.jpg",
  "cosmetics-skincare": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80",
  "grains-cereals-groceries": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
  "home-kitchen-appliances": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80",
};

const CATEGORY_ICONS: Record<string, string> = {
  "computers-electronics": "Laptop",
  "smartphones-mobile": "Smartphone",
  "fashion-apparel-shoes": "Shirt",
  "cosmetics-skincare": "Sparkles",
  "grains-cereals-groceries": "Coffee",
  "home-kitchen-appliances": "Home",
};

const CATEGORY_ZONES: Record<string, string> = {
  "computers-electronics": "Bole Medhanialem",
  "smartphones-mobile": "Bole Medhanialem",
  "fashion-apparel-shoes": "Shiro Meda",
  "cosmetics-skincare": "Piazza Heritage",
  "grains-cereals-groceries": "Mercato Wholesale",
  "home-kitchen-appliances": "Mercato Wholesale",
};

export function adaptBackendCategory(c: BackendCategory): CategoryItem {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    iconName: CATEGORY_ICONS[c.slug] || "Layers",
    itemCount: 80,
    description: c.nameAmharic
      ? `${c.name} (${c.nameAmharic})`
      : `${c.name} commercial supply`,
    featuredZones: ["Bole Medhanialem", "Mercato Wholesale", "Shiro Meda"],
    image:
      CATEGORY_IMAGES[c.slug] ||
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80",
    subcategories: (c.subCategories || []).map((s) => s.name || s.slug),
    isActive: c.isActive,
    createdAt: c.createdAt,
  };
}

export function adaptBackendProduct(p: BackendProduct): Product {
  const retail =
    typeof p.retailPrice === "number"
      ? p.retailPrice
      : parseFloat(p.retailPrice as string) || 0;
  const wholesale =
    typeof p.wholesalePrice === "number"
      ? p.wholesalePrice
      : parseFloat(p.wholesalePrice as string) || 0;

  const catSlug = p.category?.slug || "computers-electronics";
  const catFallback =
    CATEGORY_IMAGES[catSlug] ||
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80";
  const images = p.images && p.images.length > 0 ? p.images : [catFallback];

  const marketZone = p.branchName || p.warehouseLocation || CATEGORY_ZONES[catSlug] || "Mercato Wholesale";

  const tiers = (p.tieredPricing || []).map((tp) => {
    const unitPrice =
      typeof tp.discountedPricePerUnit === "number"
        ? tp.discountedPricePerUnit
        : parseFloat(tp.discountedPricePerUnit as string) || wholesale || retail;
    const baseRef = wholesale > 0 ? wholesale : retail;
    const savings =
      baseRef > 0 && unitPrice < baseRef
        ? Math.round(((baseRef - unitPrice) / baseRef) * 100)
        : 0;
    return {
      id: tp.id,
      minQuantity: tp.minQuantity,
      maxQuantity: tp.maxQuantity,
      discountedPricePerUnit: unitPrice,
      savingsPercentage: savings,
    };
  });

  const parsedRating = p.rating ? Number(p.rating) : 4.8;
  const parsedRatingCount =
    p.ratingCount ?? (p.salesCount ? Math.max(1, Math.round(p.salesCount * 0.4)) : 12);

  const specifications: Record<string, string> = {
    "Unit": p.unit || "Piece",
    "SKU": p.sku || "N/A",
    "Brand": p.brand || "Authentic Origin",
    "Origin / Region": p.origin || "Ethiopia (Mercato Verified)",
    "Quality Grade": p.grade || "Export Standard",
    "Warehouse Hub": p.warehouseLocation || p.branchName || "Addis Ababa Central Hub",
    "Lead Time": `${p.leadTimeDays || 3} Business Days`,
    "Min Order Qty (MOQ)": `${p.minOrderQuantity || 1} ${p.unit || "unit"}`,
    "Stock Status": p.stockQuantity > 0 ? `${p.stockQuantity} ${p.unit || "units"} Available` : "Backorder",
    "Escrow Guarantee": "100% Funds Protected Until Inspection",
    "Delivery Verification": "4-Digit Secure OTP Handover",
  };

  if (p.certifications && p.certifications.length > 0) {
    specifications["Certifications"] = p.certifications.join(", ");
  }

  const tags = [
    p.category?.name || "General",
    p.brand || "",
    p.origin || "",
    p.grade || "",
    marketZone,
    "Escrow Protected",
  ].filter(Boolean) as string[];

  return {
    id: p.id,
    sellerId: p.sellerId,
    name: p.title,
    slug: p.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
    category: p.category?.name || "General Marketplace",
    categorySlug: catSlug,
    price: retail,
    originalPrice: wholesale && wholesale > retail ? wholesale : Math.round(retail * 1.15),
    wholesalePrice: wholesale,
    rating: isNaN(parsedRating) ? 4.8 : parsedRating,
    reviewCount: parsedRatingCount,
    shopName: `${marketZone} Verified Store`,
    marketZone,
    isVerifiedSeller: true,
    stock: p.stockQuantity ?? 10,
    badge: p.stockQuantity > 0 ? "Verified Merchant" : undefined,
    description: p.description || p.title,
    image: images[0],
    gallery: images,
    sku: p.sku,
    brand: p.brand,
    origin: p.origin,
    grade: p.grade,
    warehouseLocation: p.warehouseLocation,
    branchName: p.branchName,
    branchId: p.branchId,
    unit: p.unit || "Piece",
    moq: p.minOrderQuantity || 1,
    minOrderQuantity: p.minOrderQuantity || 1,
    leadTimeDays: p.leadTimeDays || 3,
    certifications: p.certifications || [],
    views: p.views || 0,
    salesCount: p.salesCount || 0,
    status: p.status || "published",
    tieredPricing: tiers,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    specifications,
    warranty: "30-Day Inspection & Escrow Window",
    tags: Array.from(new Set(tags)),
  };
}

/**
 * Fetch real categories from API Gateway
 */
export interface CreateCategoryInput {
  name: string;
  slug?: string;
  nameAmharic?: string;
  iconUrl?: string;
  parentCategoryId?: string | null;
  isActive?: boolean;
}

export async function fetchCategories(tree = true): Promise<CategoryItem[]> {
  try {
    const res = await fetch(
      `${API_CONFIG.baseURL}/catalog/categories?tree=${tree}`,
      { cache: "no-store" },
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch categories: ${res.statusText}`);
    }
    const data: BackendCategory[] = await res.json();
    return data.map(adaptBackendCategory);
  } catch (err) {
    console.error("fetchCategories error:", err);
    return [];
  }
}

export async function createCategoryAdmin(
  input: CreateCategoryInput,
): Promise<BackendCategory> {
  return api.post<BackendCategory>(`/catalog/categories`, input);
}

export async function updateCategoryAdmin(
  categoryId: string,
  input: Partial<CreateCategoryInput>,
): Promise<BackendCategory> {
  return api.patch<BackendCategory>(`/catalog/categories/${categoryId}`, input);
}

export async function deleteCategoryAdmin(categoryId: string): Promise<{ success: boolean }> {
  return api.delete<{ success: boolean }>(`/catalog/categories/${categoryId}`);
}

/**
 * Fetch real products with optional filters from API Gateway
 */
export async function fetchProducts(params: ProductFilterParams = {}): Promise<{
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const safeLimit = Math.min(Math.max(params.limit ?? 20, 1), 100);
  const safePage = Math.max(params.page ?? 1, 1);

  try {
    const query = new URLSearchParams();
    if (safePage) query.set("page", safePage.toString());
    query.set("limit", safeLimit.toString());
    if (params.search) query.set("search", params.search);
    if (params.categoryId) query.set("categoryId", params.categoryId);
    if (params.sellerId) query.set("sellerId", params.sellerId);
    if (params.minPrice !== undefined) query.set("minPrice", params.minPrice.toString());
    if (params.maxPrice !== undefined) query.set("maxPrice", params.maxPrice.toString());
    if (params.sortBy) query.set("sortBy", params.sortBy);
    if (params.sortOrder) query.set("sortOrder", params.sortOrder);

    const queryString = query.toString();
    const url = `${API_CONFIG.baseURL}/catalog/products${queryString ? `?${queryString}` : ""}`;

    const res = await fetch(url, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.statusText}`);
    }
    const result = await res.json();
    const backendItems: BackendProduct[] = result.data || [];

    return {
      products: backendItems.map(adaptBackendProduct),
      total: result.total || backendItems.length,
      page: result.page || safePage,
      totalPages: result.totalPages || 1,
    };
  } catch (err) {
    console.error("fetchProducts error:", err);
    return {
      products: [],
      total: 0,
      page: safePage,
      totalPages: 1,
    };
  }
}

export async function fetchAllProducts(
  params: ProductFilterParams = {},
): Promise<{ products: Product[]; total: number; page: number; totalPages: number }> {
  const safeLimit = Math.min(Math.max(params.limit ?? 100, 1), 100);
  const allProducts: Product[] = [];

  let page = Math.max(params.page ?? 1, 1);
  let totalPages = 1;
  let total = 0;

  do {
    const response = await fetchProducts({ ...params, page, limit: safeLimit });
    allProducts.push(...response.products);
    total = response.total;
    totalPages = response.totalPages;
    page += 1;
  } while (page <= totalPages && allProducts.length < total);

  return {
    products: allProducts,
    total,
    page: 1,
    totalPages: Math.max(totalPages, 1),
  };
}

export async function fetchSellerProfile(userId: string): Promise<SellerProfile | null> {
  if (!userId) return null;

  try {
    const res = await fetch(`${API_CONFIG.baseURL}/users/profile/${encodeURIComponent(userId)}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    return (await res.json()) as SellerProfile;
  } catch (err) {
    console.error(`fetchSellerProfile(${userId}) error:`, err);
    return null;
  }
}

/**
 * Fetch a single product by ID from API Gateway
 */
export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_CONFIG.baseURL}/catalog/products/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return null;
    }
    const data: BackendProduct = await res.json();
    return adaptBackendProduct(data);
  } catch (err) {
    console.error(`fetchProductById(${id}) error:`, err);
    return null;
  }
}

export async function suspendProduct(productId: string): Promise<{ success: boolean; isActive: boolean }> {
  return api.patch<{ success: boolean; isActive: boolean }>(`/catalog/products/${productId}/status`, {
    isActive: false,
  });
}

export async function reactivateProduct(productId: string): Promise<{ success: boolean; isActive: boolean }> {
  return api.patch<{ success: boolean; isActive: boolean }>(`/catalog/products/${productId}/status`, {
    isActive: true,
  });
}

export async function deleteProductAdmin(productId: string): Promise<{ success: boolean }> {
  return api.delete<{ success: boolean }>(`/catalog/products/${productId}/admin`);
}

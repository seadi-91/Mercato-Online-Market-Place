export type ProductUnit = "PIECE" | "CARTON" | "DOZEN" | "KUNTAL" | "ROLL";

export interface Category {
  id: string;
  name: string;
  nameAmharic?: string;
  slug: string;
  iconUrl?: string;
  parentCategoryId?: string | null;
  subCategories?: Category[];
  isActive?: boolean;
}

export interface Product {
  id: string;
  sellerId?: string;
  title: string;
  description: string;
  sku: string;
  categoryId: string;
  category?: Category;
  retailPrice: number;
  wholesalePrice: number;
  minOrderQuantity: number;
  unit: ProductUnit | string;
  stockQuantity: number;
  lowStockThreshold: number;
  images: string[];
  isAvailable: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductInput {
  title: string;
  description: string;
  sku: string;
  categoryId: string;
  retailPrice: number;
  wholesalePrice: number;
  minOrderQuantity: number;
  unit: ProductUnit | string;
  stockQuantity: number;
  lowStockThreshold?: number;
  images?: string[];
  tieredPricing?: Array<{
    minQuantity: number;
    maxQuantity?: number;
    unitPrice: number;
  }>;
}

export interface UpdateProductInput {
  title?: string;
  description?: string;
  categoryId?: string;
  retailPrice?: number;
  wholesalePrice?: number;
  minOrderQuantity?: number;
  unit?: ProductUnit | string;
  stockQuantity?: number;
  lowStockThreshold?: number;
  images?: string[];
  isAvailable?: boolean;
}

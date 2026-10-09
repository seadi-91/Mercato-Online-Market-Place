export interface ProductTierPrice {
  id?: string;
  minQuantity: number;
  maxQuantity?: number | null;
  discountedPricePerUnit: number;
  savingsPercentage?: number;
}

export interface Product {
  id: string;
  sellerId?: string;
  name: string;
  nameAmharic?: string;
  slug: string;
  category: string;
  categorySlug: string;
  price: number;
  originalPrice?: number;
  wholesalePrice?: number;
  rating: number;
  reviewCount: number;
  shopName: string;
  marketZone: string;
  isVerifiedSeller: boolean;
  stock: number;
  badge?: "Trending" | "Best Seller" | "Escrow Verified" | "Verified Merchant" | "New Arrival";
  description: string;
  image: string;
  gallery?: string[];
  specifications?: Record<string, string>;
  warranty?: string;
  tags: string[];
  // Complete Supplier Fields:
  sku?: string;
  brand?: string;
  origin?: string;
  grade?: string;
  warehouseLocation?: string;
  branchName?: string;
  branchId?: string;
  unit?: string;
  moq?: number;
  minOrderQuantity?: number;
  leadTimeDays?: number;
  certifications?: string[];
  views?: number;
  salesCount?: number;
  status?: string;
  tieredPricing?: ProductTierPrice[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  itemCount: number;
  description: string;
  featuredZones: string[];
  image: string;
  subcategories: string[];
  isActive?: boolean;
  createdAt?: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  accentColor: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "slide-1",
    title: "100% Protected Doorstep Delivery",
    subtitle: "Funds stay locked and secure until you physically inspect your package and share your 4-digit handover OTP.",
    badge: "Verified Buyer Guarantee",
    image: "/images/hero-escrow-delivery.jpg",
    ctaText: "Explore Protected Deals",
    ctaLink: "/marketplace",
    accentColor: "from-indigo-500 to-cyan-400",
  },
  {
    id: "slide-2",
    title: "Bole Tech Hub & Flagship Electronics",
    subtitle: "Direct importer warranties on genuine 4K TVs, M3 MacBooks, Sony ANC Headphones, and flagship smartphones.",
    badge: "Bole Medhanialem Commercial",
    image: "/images/hero-electronics.jpg",
    ctaText: "Shop Electronics",
    ctaLink: "/marketplace?category=computers-electronics",
    accentColor: "from-blue-500 to-indigo-400",
  },
  {
    id: "slide-3",
    title: "Handwoven Habesha Tibeb & Cultural Crafts",
    subtitle: "Handcrafted four-layer Ethiopian cotton gabis and traditional dresses direct from master cooperatives in Shiro Meda.",
    badge: "Shiro Meda Artisan Heritage",
    image: "/images/hero-cultural-fashion.jpg",
    ctaText: "Discover Fashion",
    ctaLink: "/marketplace?category=fashion-apparel-shoes",
    accentColor: "from-emerald-500 to-amber-400",
  },
];

// All hardcoded mock data has been removed. Products and Categories are strictly fetched from backend PostgreSQL.
export const CATEGORIES: CategoryItem[] = [];

export const PRODUCTS: Product[] = [];

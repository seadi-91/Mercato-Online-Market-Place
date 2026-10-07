import { Product, CategoryItem } from "@/constants/mock-data";

export const CURATED_HOME_CATEGORIES: CategoryItem[] = [
  {
    id: "cat-kids-children",
    name: "Kids & Children",
    slug: "kids-children",
    iconName: "Baby",
    itemCount: 6,
    description: "Quality clothing, baby essentials, toys, and care items for children",
    featuredZones: ["Bole Medhanialem", "Mercato", "CMC"],
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80",
    subcategories: ["Baby Clothing", "Kids Footwear", "Toys & Games", "Baby Care"],
  },
  {
    id: "cat-cosmetics",
    name: "Cosmetics & Skincare",
    slug: "cosmetics-skincare",
    iconName: "Sparkles",
    itemCount: 6,
    description: "Authentic skincare, natural beauty oils, organic cosmetics, and fragrances",
    featuredZones: ["Piazza", "Bole Medhanialem"],
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80",
    subcategories: ["Skincare", "Haircare", "Natural Oils", "Fragrances"],
  },
  {
    id: "cat-apparel",
    name: "Fashion, Apparel & Shoes",
    slug: "fashion-apparel-shoes",
    iconName: "Shirt",
    itemCount: 6,
    description: "Traditional Habesha Kemis, Ethiopian leather shoes, and modern apparel",
    featuredZones: ["Shiro Meda", "Piazza", "Bole"],
    image: "/images/hero-cultural-fashion.jpg",
    subcategories: ["Habesha Kemis", "Gabi & Netela", "Leather Shoes", "Accessories"],
  },
  {
    id: "cat-electronics",
    name: "Electronics & Smart Devices",
    slug: "computers-electronics",
    iconName: "Laptop",
    itemCount: 8,
    description: "Flagship smartphones, 4K TVs, laptops, and audio gear with warranties",
    featuredZones: ["Bole Medhanialem"],
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    subcategories: ["Smartphones", "Laptops", "Audio & Headphones", "Smart Watches"],
  },
  {
    id: "cat-grains",
    name: "Grains, Cereals & Groceries",
    slug: "grains-cereals-groceries",
    iconName: "Wheat",
    itemCount: 6,
    description: "Organic Magna Teff, Yirgacheffe specialty coffee, and traditional spices",
    featuredZones: ["Mercato Wholesale", "Addis Ketema"],
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
    subcategories: ["Magna Teff", "Specialty Coffee", "Traditional Spices", "Organic Honey"],
  },
  {
    id: "cat-home-kitchen",
    name: "Home & Kitchen Appliances",
    slug: "home-kitchen-appliances",
    iconName: "Home",
    itemCount: 6,
    description: "Clay Jebena ceremony sets, digital airfryers, traditional mesobs & appliances",
    featuredZones: ["Mercato Wholesale", "Bole Medhanialem"],
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80",
    subcategories: ["Clay Jebena Sets", "Airfryers", "Handcrafted Mesobs", "Kitchenware"],
  },
];

export const KIDS_PRODUCTS: Product[] = [
  {
    id: "kid-prod-01",
    name: "Traditional Handwoven Kids Habesha Kemis",
    slug: "traditional-handwoven-kids-habesha-kemis",
    category: "Kids & Children",
    categorySlug: "kids-children",
    price: 3400,
    originalPrice: 4200,
    rating: 4.9,
    reviewCount: 28,
    shopName: "Shiro Meda Artisan Kids",
    marketZone: "Shiro Meda",
    isVerifiedSeller: true,
    stock: 14,
    badge: "Trending",
    description: "Handcrafted pure cotton children's traditional dress with colorful gold tilf border embroidery.",
    image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800&auto=format&fit=crop&q=80",
    tags: ["kids", "kemis", "cultural", "habesha"],
  },
  {
    id: "kid-prod-02",
    name: "Organic Ethiopian Cotton Baby Gabi (Breathable Wrap)",
    slug: "organic-ethiopian-cotton-baby-gabi",
    category: "Kids & Children",
    categorySlug: "kids-children",
    price: 2600,
    originalPrice: 3100,
    rating: 5.0,
    reviewCount: 35,
    shopName: "Ethio Heritage Baby Wear",
    marketZone: "Shiro Meda",
    isVerifiedSeller: true,
    stock: 22,
    badge: "Best Seller",
    description: "Four-layer 100% organic soft cotton baby gabi, ideal for infant warmth and delicate baby skin.",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80",
    tags: ["baby", "gabi", "organic", "cotton"],
  },
  {
    id: "kid-prod-03",
    name: "Kids Learning Tablet & Digital LCD Drawing Pad",
    slug: "kids-learning-tablet-lcd-drawing-pad",
    category: "Kids & Children",
    categorySlug: "kids-children",
    price: 1850,
    originalPrice: 2400,
    rating: 4.8,
    reviewCount: 19,
    shopName: "Bole Kids Tech Hub",
    marketZone: "Bole Medhanialem",
    isVerifiedSeller: true,
    stock: 18,
    badge: "Trending",
    description: "10-inch eye-protection color LCD learning tablet with stylus, durable casing, and educational apps.",
    image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&auto=format&fit=crop&q=80",
    tags: ["kids", "tablet", "educational", "tech"],
  },
  {
    id: "kid-prod-04",
    name: "Soft Genuine Leather Baby Walking Shoes",
    slug: "soft-genuine-leather-baby-walking-shoes",
    category: "Kids & Children",
    categorySlug: "kids-children",
    price: 1950,
    originalPrice: 2500,
    rating: 4.9,
    reviewCount: 22,
    shopName: "Piazza Kids Leathercraft",
    marketZone: "Piazza",
    isVerifiedSeller: true,
    stock: 12,
    badge: "Verified Merchant",
    description: "Handcrafted Ethiopian calfskin leather first-step toddler shoes with flexible non-slip soles.",
    image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop&q=80",
    tags: ["kids", "shoes", "leather", "toddler"],
  },
  {
    id: "kid-prod-05",
    name: "Natural Wooden Educational Building Blocks Set",
    slug: "natural-wooden-educational-building-blocks",
    category: "Kids & Children",
    categorySlug: "kids-children",
    price: 1450,
    originalPrice: 1900,
    rating: 4.7,
    reviewCount: 16,
    shopName: "Mercato Toy Wholesale",
    marketZone: "Mercato",
    isVerifiedSeller: true,
    stock: 25,
    badge: "Trending",
    description: "Non-toxic organic wood 60-piece developmental puzzle and building set for toddlers and kids.",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80",
    tags: ["toys", "wooden", "kids", "puzzle"],
  },
  {
    id: "kid-prod-06",
    name: "Gentle Organic Chamomile Baby Bath & Skincare Set",
    slug: "gentle-organic-chamomile-baby-bath-skincare",
    category: "Kids & Children",
    categorySlug: "kids-children",
    price: 1650,
    originalPrice: 2100,
    rating: 4.8,
    reviewCount: 31,
    shopName: "Bole Pharmacy & Baby Care",
    marketZone: "Bole Medhanialem",
    isVerifiedSeller: true,
    stock: 30,
    badge: "Escrow Verified",
    description: "Pediatrician-tested hypoallergenic baby wash, organic chamomile lotion, and soothing diaper cream.",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80",
    tags: ["baby", "skincare", "lotion", "bath"],
  },
];

export const CURATED_COSMETICS: Product[] = [
  {
    id: "cosm-prod-01",
    name: "Pure Ethiopian Nilotica Shea Butter Face & Body Cream",
    slug: "pure-ethiopian-nilotica-shea-butter-cream",
    category: "Cosmetics & Skincare",
    categorySlug: "cosmetics-skincare",
    price: 1450,
    originalPrice: 1950,
    rating: 4.9,
    reviewCount: 44,
    shopName: "Addis Organic Naturals",
    marketZone: "Bole Medhanialem",
    isVerifiedSeller: true,
    stock: 28,
    badge: "Best Seller",
    description: "Unrefined cold-pressed East African Nilotica shea cream, deeply moisturizing and rich in vitamins A & E.",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80",
    tags: ["shea", "skincare", "organic", "moisturizer"],
  },
  {
    id: "cosm-prod-02",
    name: "Cold-Pressed Organic Castor Oil for Hair & Brows (250ml)",
    slug: "cold-pressed-organic-castor-oil-hair-brows",
    category: "Cosmetics & Skincare",
    categorySlug: "cosmetics-skincare",
    price: 1250,
    originalPrice: 1600,
    rating: 4.8,
    reviewCount: 52,
    shopName: "Mercato Natural Oils",
    marketZone: "Mercato",
    isVerifiedSeller: true,
    stock: 40,
    badge: "Trending",
    description: "100% pure ricinus communis seed oil for intensive hair growth, lash thickening, and scalp nourishment.",
    image: "https://images.unsplash.com/photo-1608248597359-5f2571e2c943?w=800&auto=format&fit=crop&q=80",
    tags: ["castor", "hair", "oil", "organic"],
  },
  {
    id: "cosm-prod-03",
    name: "Rosewater & Hyaluronic Acid Hydrating Face Mist (150ml)",
    slug: "rosewater-hyaluronic-acid-face-mist",
    category: "Cosmetics & Skincare",
    categorySlug: "cosmetics-skincare",
    price: 1750,
    originalPrice: 2200,
    rating: 4.9,
    reviewCount: 29,
    shopName: "Piazza Glow Boutique",
    marketZone: "Piazza",
    isVerifiedSeller: true,
    stock: 19,
    badge: "Trending",
    description: "Refreshing botanical damascena rosewater mist fortified with low-molecular hyaluronic acid for all-day dewiness.",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80",
    tags: ["rosewater", "mist", "glow", "skincare"],
  },
  {
    id: "cosm-prod-04",
    name: "Frankincense & Myrrh Youth Restorative Facial Serum",
    slug: "frankincense-myrrh-youth-restorative-serum",
    category: "Cosmetics & Skincare",
    categorySlug: "cosmetics-skincare",
    price: 2850,
    originalPrice: 3500,
    rating: 5.0,
    reviewCount: 38,
    shopName: "Tigray Botanical Apothecary",
    marketZone: "Bole Medhanialem",
    isVerifiedSeller: true,
    stock: 15,
    badge: "Escrow Verified",
    description: "Ancient botanical blend of Ethiopian Ogaden frankincense resin and myrrh essential oils for skin rejuvenation.",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80",
    tags: ["frankincense", "serum", "anti-aging", "botanical"],
  },
  {
    id: "cosm-prod-05",
    name: "Mineral Broad-Spectrum UV Sunscreen SPF 50+ (Matte Finish)",
    slug: "mineral-broad-spectrum-uv-sunscreen-spf50",
    category: "Cosmetics & Skincare",
    categorySlug: "cosmetics-skincare",
    price: 2150,
    originalPrice: 2700,
    rating: 4.8,
    reviewCount: 41,
    shopName: "Bole Derma Care",
    marketZone: "Bole Medhanialem",
    isVerifiedSeller: true,
    stock: 33,
    badge: "Verified Merchant",
    description: "Zinc oxide sheer sunscreen designed for high-altitude Addis sun protection with zero white cast.",
    image: "https://images.unsplash.com/photo-1556228722-d0b5de70b774?w=800&auto=format&fit=crop&q=80",
    tags: ["sunscreen", "spf50", "matte", "dermatology"],
  },
  {
    id: "cosm-prod-06",
    name: "Organic Ethiopian Coffee & Brown Sugar Body Scrub",
    slug: "organic-ethiopian-coffee-brown-sugar-body-scrub",
    category: "Cosmetics & Skincare",
    categorySlug: "cosmetics-skincare",
    price: 1350,
    originalPrice: 1750,
    rating: 4.9,
    reviewCount: 36,
    shopName: "Kaffa Heritage Spa Essentials",
    marketZone: "CMC",
    isVerifiedSeller: true,
    stock: 24,
    badge: "Trending",
    description: "Roasted Yirgacheffe ground coffee beans infused with raw cane sugar and sweet almond oil for silky skin.",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
    tags: ["coffee", "scrub", "bodycare", "exfoliant"],
  },
];

export const CURATED_APPAREL: Product[] = [
  {
    id: "apparel-prod-01",
    name: "Traditional Handwoven Habesha Kemis (Gold Tilf Embroidery)",
    slug: "traditional-handwoven-habesha-kemis-gold-tilf",
    category: "Fashion, Apparel & Shoes",
    categorySlug: "fashion-apparel-shoes",
    price: 6500,
    originalPrice: 7800,
    rating: 4.9,
    reviewCount: 48,
    shopName: "Shiro Meda Artisan Heritage",
    marketZone: "Shiro Meda",
    isVerifiedSeller: true,
    stock: 15,
    badge: "Best Seller",
    description: "Authentic four-layer Ethiopian cotton handwoven traditional dress with hand-embroidered gold tilf patterns.",
    image: "/images/hero-cultural-fashion.jpg",
    tags: ["kemis", "cultural", "habesha", "fashion"],
  },
  {
    id: "apparel-prod-02",
    name: "Addis Chelsea Leather Boots (Water-Resistant Sole)",
    slug: "addis-chelsea-leather-boots",
    category: "Fashion, Apparel & Shoes",
    categorySlug: "fashion-apparel-shoes",
    price: 3800,
    originalPrice: 4500,
    rating: 4.8,
    reviewCount: 39,
    shopName: "Piazza Heritage Leathercraft",
    marketZone: "Piazza",
    isVerifiedSeller: true,
    stock: 20,
    badge: "Trending",
    description: "Premium Ethiopian full-grain calf leather boots with flexible rubber lug soles and elastic side gussets.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
    tags: ["leather", "boots", "shoes", "menswear"],
  },
  {
    id: "apparel-prod-03",
    name: "Genuine Ethiopian Leather Executive Briefcase (Piazza Craft)",
    slug: "genuine-ethiopian-leather-executive-briefcase",
    category: "Fashion, Apparel & Shoes",
    categorySlug: "fashion-apparel-shoes",
    price: 5200,
    originalPrice: 6200,
    rating: 4.9,
    reviewCount: 32,
    shopName: "Piazza Heritage Leathercraft",
    marketZone: "Piazza",
    isVerifiedSeller: true,
    stock: 12,
    badge: "Verified Merchant",
    description: "Full-grain vegetable-tanned Ethiopian leather briefcase with padded laptop compartment and brass hardware.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    tags: ["leather", "briefcase", "bags", "executive"],
  },
  {
    id: "apparel-prod-04",
    name: "Pure Handspun Ethiopian Cotton Gabi & Netela Set",
    slug: "pure-handspun-ethiopian-cotton-gabi-netela-set",
    category: "Fashion, Apparel & Shoes",
    categorySlug: "fashion-apparel-shoes",
    price: 4200,
    originalPrice: 5000,
    rating: 5.0,
    reviewCount: 41,
    shopName: "Shiro Meda Master Weavers",
    marketZone: "Shiro Meda",
    isVerifiedSeller: true,
    stock: 18,
    badge: "Escrow Verified",
    description: "Traditional four-layer soft cotton gabi wrap paired with fine netela shawl, crafted by Shiro Meda master weavers.",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80",
    tags: ["gabi", "netela", "cotton", "shiro-meda"],
  },
  {
    id: "apparel-prod-05",
    name: "Handcrafted Men's Ethiopian Leather Oxford Dress Shoes",
    slug: "handcrafted-mens-ethiopian-leather-oxfords",
    category: "Fashion, Apparel & Shoes",
    categorySlug: "fashion-apparel-shoes",
    price: 3950,
    originalPrice: 4800,
    rating: 4.7,
    reviewCount: 26,
    shopName: "Mercato Footwear Guild",
    marketZone: "Mercato",
    isVerifiedSeller: true,
    stock: 16,
    badge: "Trending",
    description: "Classic cap-toe formal Oxford shoes in rich cognac Ethiopian leather with Blake-stitched leather soles.",
    image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop&q=80",
    tags: ["oxfords", "leather", "formal", "shoes"],
  },
  {
    id: "apparel-prod-06",
    name: "Modern Habesha Embroidered Linen Shirt & Trouser Set",
    slug: "modern-habesha-embroidered-linen-shirt-set",
    category: "Fashion, Apparel & Shoes",
    categorySlug: "fashion-apparel-shoes",
    price: 4600,
    originalPrice: 5500,
    rating: 4.8,
    reviewCount: 23,
    shopName: "Bole Contemporary Fashion House",
    marketZone: "Bole Medhanialem",
    isVerifiedSeller: true,
    stock: 14,
    badge: "Trending",
    description: "Tailored breathable linen shirt with minimalist Ethiopian tibeb embroidery on collar and cuffs.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
    tags: ["linen", "habesha", "menswear", "embroidery"],
  },
];

export const CURATED_ELECTRONICS: Product[] = [
  {
    id: "elec-prod-01",
    name: "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
    slug: "sony-wh-1000xm5-wireless-headphones",
    category: "Electronics & Smart Devices",
    categorySlug: "computers-electronics",
    price: 42000,
    originalPrice: 48000,
    rating: 4.9,
    reviewCount: 65,
    shopName: "Bole Tech Hub & Audio",
    marketZone: "Bole Medhanialem",
    isVerifiedSeller: true,
    stock: 8,
    badge: "Best Seller",
    description: "Industry-leading active noise cancellation with 8 microphones, 30-hour battery life, and LDAC high-res audio.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    tags: ["sony", "headphones", "anc", "audio"],
  },
  {
    id: "elec-prod-02",
    name: "Apple MacBook Pro 16\" (M3 Pro 36GB RAM / 512GB SSD)",
    slug: "apple-macbook-pro-16-m3-pro",
    category: "Electronics & Smart Devices",
    categorySlug: "computers-electronics",
    price: 245000,
    originalPrice: 265000,
    rating: 5.0,
    reviewCount: 42,
    shopName: "Bole Apple Authorized Reseller",
    marketZone: "Bole Medhanialem",
    isVerifiedSeller: true,
    stock: 5,
    badge: "Escrow Verified",
    description: "Liquid Retina XDR display, Apple M3 Pro 12-core CPU, 18-core GPU, 36GB unified memory for creative professionals.",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    tags: ["macbook", "apple", "laptop", "m3-pro"],
  },
  {
    id: "elec-prod-03",
    name: "Samsung Galaxy S24 Ultra (512GB Titanium Black)",
    slug: "samsung-galaxy-s24-ultra-512gb",
    category: "Electronics & Smart Devices",
    categorySlug: "smartphones-mobile",
    price: 138000,
    originalPrice: 152000,
    rating: 4.9,
    reviewCount: 58,
    shopName: "Bole Flagship Mobile",
    marketZone: "Bole Medhanialem",
    isVerifiedSeller: true,
    stock: 9,
    badge: "Trending",
    description: "200MP camera system, Galaxy AI features, Snapdragon 8 Gen 3, integrated S-Pen, and 6.8-inch Dynamic AMOLED 2X.",
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80",
    tags: ["samsung", "galaxy", "s24-ultra", "smartphone"],
  },
  {
    id: "elec-prod-04",
    name: "Apple iPhone 15 Pro Max (256GB Natural Titanium)",
    slug: "apple-iphone-15-pro-max-256gb",
    category: "Electronics & Smart Devices",
    categorySlug: "smartphones-mobile",
    price: 148000,
    originalPrice: 160000,
    rating: 4.9,
    reviewCount: 74,
    shopName: "Bole Flagship Mobile",
    marketZone: "Bole Medhanialem",
    isVerifiedSeller: true,
    stock: 7,
    badge: "Best Seller",
    description: "Aerospace-grade titanium design, A17 Pro chip, customizable Action button, and 5x optical telephoto zoom.",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
    tags: ["iphone", "apple", "titanium", "smartphone"],
  },
  {
    id: "elec-prod-05",
    name: "Dell XPS 15 9530 Core i9 13th Gen (32GB RAM / 1TB SSD)",
    slug: "dell-xps-15-9530-core-i9",
    category: "Electronics & Smart Devices",
    categorySlug: "computers-electronics",
    price: 165000,
    originalPrice: 182000,
    rating: 4.8,
    reviewCount: 29,
    shopName: "Bole Computer World",
    marketZone: "Bole Medhanialem",
    isVerifiedSeller: true,
    stock: 6,
    badge: "Verified Merchant",
    description: "15.6-inch 3.5K OLED touch display, Intel Core i9-13900H, NVIDIA GeForce RTX 4070, CNC aluminum chassis.",
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80",
    tags: ["dell", "xps", "laptop", "oled"],
  },
  {
    id: "elec-prod-06",
    name: "Xiaomi Redmi Note 13 Pro+ 5G (512GB / 12GB RAM)",
    slug: "xiaomi-redmi-note-13-pro-plus-5g",
    category: "Electronics & Smart Devices",
    categorySlug: "smartphones-mobile",
    price: 49500,
    originalPrice: 56000,
    rating: 4.8,
    reviewCount: 37,
    shopName: "Mercato Smart Devices",
    marketZone: "Mercato",
    isVerifiedSeller: true,
    stock: 14,
    badge: "Trending",
    description: "200MP OIS camera, 120W HyperCharge (0-100% in 19 min), 1.5K 120Hz curved AMOLED, IP68 water resistance.",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80",
    tags: ["xiaomi", "redmi", "5g", "smartphone"],
  },
];

export interface HomeCategorySection {
  id: string;
  categorySlug: string;
  order: number;
  title: string;
  titleAmharic: string;
  subtitle: string;
  badge: string;
  viewAllLink: string;
  products: Product[];
}

function deduplicateProducts(items: Product[]): Product[] {
  const seen = new Set<string>();
  const result: Product[] = [];
  for (const p of items) {
    const key = p.name.toLowerCase().trim();
    if (!seen.has(p.id) && !seen.has(key)) {
      seen.add(p.id);
      seen.add(key);
      result.push(p);
    }
  }
  return result;
}

export function getCuratedHomeSections(backendProducts: Product[] = []): HomeCategorySection[] {
  // 1. Kids (Child) Only - 1st Priority
  const dbKids = backendProducts.filter((p) => {
    const text = `${p.name} ${p.category} ${p.categorySlug} ${(p.tags || []).join(" ")}`.toLowerCase();
    return text.includes("kid") || text.includes("child") || text.includes("baby") || text.includes("toddler") || text.includes("ህፃን");
  });
  const kidsProducts = deduplicateProducts([...dbKids, ...KIDS_PRODUCTS]);

  // 2. Cosmetics Categories - 2nd Priority
  const dbCosmetics = backendProducts.filter((p) => {
    const text = `${p.name} ${p.category} ${p.categorySlug} ${(p.tags || []).join(" ")}`.toLowerCase();
    return (
      p.categorySlug === "cosmetics-skincare" ||
      text.includes("cosmetic") ||
      text.includes("skincare") ||
      text.includes("beauty") ||
      text.includes("serum") ||
      text.includes("cream") ||
      text.includes("lotion")
    );
  });
  const cosmeticsProducts = deduplicateProducts([...dbCosmetics, ...CURATED_COSMETICS]);

  // 3. Apparel (Albasat) Categories - 3rd Priority
  const dbApparel = backendProducts.filter((p) => {
    const text = `${p.name} ${p.category} ${p.categorySlug} ${(p.tags || []).join(" ")}`.toLowerCase();
    // Exclude kids products that might have clothing tags
    const isKid = text.includes("kid") || text.includes("child") || text.includes("baby");
    return (
      !isKid &&
      (p.categorySlug === "fashion-apparel-shoes" ||
        text.includes("apparel") ||
        text.includes("fashion") ||
        text.includes("clothing") ||
        text.includes("kemis") ||
        text.includes("shoe") ||
        text.includes("boot") ||
        text.includes("briefcase") ||
        text.includes("albasat") ||
        text.includes("አልባሳት"))
    );
  });
  const apparelProducts = deduplicateProducts([...dbApparel, ...CURATED_APPAREL]);

  // 4. Electronics Categories - 4th Priority
  const dbElectronics = backendProducts.filter((p) => {
    const text = `${p.name} ${p.category} ${p.categorySlug} ${(p.tags || []).join(" ")}`.toLowerCase();
    return (
      p.categorySlug === "computers-electronics" ||
      p.categorySlug === "smartphones-mobile" ||
      text.includes("electronics") ||
      text.includes("laptop") ||
      text.includes("phone") ||
      text.includes("macbook") ||
      text.includes("headphone") ||
      text.includes("sony") ||
      text.includes("samsung") ||
      text.includes("iphone") ||
      text.includes("dell") ||
      text.includes("xiaomi")
    );
  });
  const electronicsProducts = deduplicateProducts([...dbElectronics, ...CURATED_ELECTRONICS]);

  return [
    {
      id: "home-sec-1-kids",
      categorySlug: "kids-children",
      order: 1,
      title: "Kids & Children Collection",
      titleAmharic: "የህፃናት አልባሳትና እቃዎች",
      subtitle: "Handwoven children's dresses, baby organic wraps, educational toys & gentle infant care",
      badge: "1st • Kids Only",
      viewAllLink: "/marketplace?category=kids-children",
      products: kidsProducts,
    },
    {
      id: "home-sec-2-cosmetics",
      categorySlug: "cosmetics-skincare",
      order: 2,
      title: "Cosmetics & Skincare",
      titleAmharic: "ኮስሞቲክስና የውበት መጠበቂያዎች",
      subtitle: "Pure Nilotica shea butter, restorative frankincense serums, organic hair oils & sun care",
      badge: "2nd • Cosmetics",
      viewAllLink: "/marketplace?category=cosmetics-skincare",
      products: cosmeticsProducts,
    },
    {
      id: "home-sec-3-apparel",
      categorySlug: "fashion-apparel-shoes",
      order: 3,
      title: "Fashion, Apparel & Shoes (አልባሳት)",
      titleAmharic: "የባህልና ዘመናዊ አልባሳትና ጫማዎች",
      subtitle: "Master-crafted Habesha Kemis, Shiro Meda gabi wraps & genuine Ethiopian leather footwear",
      badge: "3rd • Apparel",
      viewAllLink: "/marketplace?category=fashion-apparel-shoes",
      products: apparelProducts,
    },
    {
      id: "home-sec-4-electronics",
      categorySlug: "computers-electronics",
      order: 4,
      title: "Electronics & Smart Devices",
      titleAmharic: "ኤሌክትሮኒክስና ስማርት እቃዎች",
      subtitle: "Flagship smartphones, pro laptops, ANC noise-cancelling audio & guaranteed warranties",
      badge: "4th • Electronics",
      viewAllLink: "/marketplace?category=computers-electronics",
      products: electronicsProducts,
    },
  ];
}

export const CURATED_GRAINS: Product[] = [
  {
    id: "grain-prod-01",
    name: "Organic Ethiopian Magna White Teff (25kg Sack)",
    slug: "organic-ethiopian-magna-white-teff-25kg",
    category: "Grains, Cereals & Groceries",
    categorySlug: "grains-cereals-groceries",
    price: 3600,
    originalPrice: 4200,
    rating: 4.9,
    reviewCount: 54,
    shopName: "Mercato Grain Wholesalers",
    marketZone: "Mercato",
    isVerifiedSeller: true,
    stock: 50,
    badge: "Best Seller",
    description: "Finest grade stone-milled organic Magna Teff from Ada'a Bishoftu, perfectly aged for soft, fluffy injera.",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
    tags: ["teff", "magna", "organic", "grain"],
  },
  {
    id: "grain-prod-02",
    name: "Yirgacheffe Grade 1 Specialty Roasted Coffee Beans (1kg Bag)",
    slug: "yirgacheffe-grade-1-roasted-coffee-1kg",
    category: "Grains, Cereals & Groceries",
    categorySlug: "grains-cereals-groceries",
    price: 1850,
    originalPrice: 2200,
    rating: 5.0,
    reviewCount: 68,
    shopName: "Kaffa Heritage Roasters",
    marketZone: "Bole Medhanialem",
    isVerifiedSeller: true,
    stock: 45,
    badge: "Trending",
    description: "Medium roast single-origin washed Yirgacheffe Arabica beans with floral jasmine aroma and bright citrus notes.",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80",
    tags: ["coffee", "yirgacheffe", "specialty", "arabica"],
  },
  {
    id: "grain-prod-03",
    name: "Traditional Mercato Berbere Signature Spice Blend (5kg Pack)",
    slug: "traditional-mercato-berbere-spice-blend-5kg",
    category: "Grains, Cereals & Groceries",
    categorySlug: "grains-cereals-groceries",
    price: 1650,
    originalPrice: 2000,
    rating: 4.8,
    reviewCount: 39,
    shopName: "Mercato Spice Guild",
    marketZone: "Mercato",
    isVerifiedSeller: true,
    stock: 60,
    badge: "Verified Merchant",
    description: "Sun-dried red chili pepper blend infused with korarima, ginger, garlic, cloves, and Ethiopian holy basil (besobila).",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80",
    tags: ["berbere", "spices", "traditional", "mercato"],
  },
  {
    id: "grain-prod-04",
    name: "Raw Organic Sidama Forest Wild Honey (1kg Glass Jar)",
    slug: "raw-organic-sidama-forest-wild-honey-1kg",
    category: "Grains, Cereals & Groceries",
    categorySlug: "grains-cereals-groceries",
    price: 1200,
    originalPrice: 1500,
    rating: 4.9,
    reviewCount: 42,
    shopName: "Rift Valley Naturals",
    marketZone: "Piazza",
    isVerifiedSeller: true,
    stock: 35,
    badge: "Escrow Verified",
    description: "Unfiltered, cold-extracted pure forest blossom honey harvested from indigenous hives in Sidama highland forests.",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80",
    tags: ["honey", "raw", "sidama", "organic"],
  },
];

export const CURATED_KITCHEN: Product[] = [
  {
    id: "kitchen-prod-01",
    name: "Traditional Clay Jebena Coffee Ceremony Set with Sini Cups",
    slug: "traditional-clay-jebena-coffee-ceremony-set",
    category: "Home & Kitchen Appliances",
    categorySlug: "home-kitchen-appliances",
    price: 2400,
    originalPrice: 2900,
    rating: 4.9,
    reviewCount: 37,
    shopName: "Shiro Meda Pottery Co-op",
    marketZone: "Shiro Meda",
    isVerifiedSeller: true,
    stock: 20,
    badge: "Best Seller",
    description: "Authentic hand-fired Ethiopian black clay jebena coffee kettle with 6 porcelain sini cups and rekebot holder tray.",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
    tags: ["jebena", "coffee", "traditional", "sini"],
  },
  {
    id: "kitchen-prod-02",
    name: "Philips Digital Airfryer XXL (7.2L Rapid Air Technology)",
    slug: "philips-digital-airfryer-xxl-7-2l",
    category: "Home & Kitchen Appliances",
    categorySlug: "home-kitchen-appliances",
    price: 28500,
    originalPrice: 32000,
    rating: 4.8,
    reviewCount: 31,
    shopName: "Bole Home Appliances",
    marketZone: "Bole Medhanialem",
    isVerifiedSeller: true,
    stock: 12,
    badge: "Trending",
    description: "Family size 7.2L capacity with smart sensing technology, digital touch presets, and fat removal technology.",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80",
    tags: ["airfryer", "philips", "appliance", "kitchen"],
  },
  {
    id: "kitchen-prod-03",
    name: "Handcrafted Ethiopian Cultural Mesob (Colorful Grass Weave)",
    slug: "handcrafted-ethiopian-cultural-mesob",
    category: "Home & Kitchen Appliances",
    categorySlug: "home-kitchen-appliances",
    price: 5800,
    originalPrice: 6800,
    rating: 5.0,
    reviewCount: 26,
    shopName: "Mercato Artisan Crafts",
    marketZone: "Mercato",
    isVerifiedSeller: true,
    stock: 10,
    badge: "Escrow Verified",
    description: "Vibrantly dyed sweetgrass handwoven large dining mesob table with fitted conical lid, handcrafted in Harar.",
    image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80",
    tags: ["mesob", "cultural", "handwoven", "dining"],
  },
  {
    id: "kitchen-prod-04",
    name: "Stainless Steel Electric Injera Mitad Baking Pan (High Output)",
    slug: "stainless-steel-electric-injera-mitad",
    category: "Home & Kitchen Appliances",
    categorySlug: "home-kitchen-appliances",
    price: 14500,
    originalPrice: 16500,
    rating: 4.9,
    reviewCount: 44,
    shopName: "Mercato Electrical Wholesale",
    marketZone: "Mercato",
    isVerifiedSeller: true,
    stock: 15,
    badge: "Verified Merchant",
    description: "Heavy-duty electric injera mitad with precision ceramic heating element, dual heat control, and tempered glass cover.",
    image: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800&auto=format&fit=crop&q=80",
    tags: ["mitad", "injera", "electric", "appliances"],
  },
];

export function getQuadProductsForCategory(
  categorySlug: string,
  sections: HomeCategorySection[],
  allProducts: Product[] = []
): (Product | null)[] {
  if (categorySlug === "grains-cereals-groceries") {
    const matching = allProducts.filter((p) => p.categorySlug === categorySlug);
    const combined = deduplicateProducts([...matching, ...CURATED_GRAINS]);
    return [combined[0] || null, combined[1] || null, combined[2] || null, combined[3] || null];
  }
  if (categorySlug === "home-kitchen-appliances") {
    const matching = allProducts.filter((p) => p.categorySlug === categorySlug);
    const combined = deduplicateProducts([...matching, ...CURATED_KITCHEN]);
    return [combined[0] || null, combined[1] || null, combined[2] || null, combined[3] || null];
  }

  const sec = sections.find((s) => s.categorySlug === categorySlug);
  const items = sec ? sec.products : [];
  return [items[0] || null, items[1] || null, items[2] || null, items[3] || null];
}

export function getAllCuratedHomeProducts(backendProducts: Product[] = []): Product[] {
  const sections = getCuratedHomeSections(backendProducts);
  const all: Product[] = [];
  for (const sec of sections) {
    all.push(...sec.products);
  }
  return deduplicateProducts(all);
}





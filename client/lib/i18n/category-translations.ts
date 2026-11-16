import type { LanguageCode } from "./translations";

export const CATEGORY_TRANSLATIONS: Record<
  string,
  { en: string; am: string; om: string; ti: string }
> = {
  "kids-children": {
    en: "Kids & Children",
    am: "የልጆች እና የህፃናት ዕቃዎች",
    om: "Meeshaalee Daa'immanii",
    ti: "ናይ ቆልዑ ኣቑሑት",
  },
  "cosmetics-skincare": {
    en: "Cosmetics & Skincare",
    am: "ኮስሞቲክስ እና የቆዳ እንክብካቤ",
    om: "Koomestiksii fi Qoricha Gogaa",
    ti: "ኮስሞቲክስን ክንክን ቆርበትን",
  },
  "fashion-apparel-shoes": {
    en: "Fashion, Apparel & Shoes",
    am: "ፋሽን፣ አልባሳት እና ጫማዎች",
    om: "Faashinii, Uffata fi Kophee",
    ti: "ፋሽን፣ ክዳውንቲን ሳእንን",
  },
  "computers-electronics": {
    en: "Electronics & Smart Devices",
    am: "ኤሌክትሮኒክስ እና ስማርት ዕቃዎች",
    om: "Elektirouniksii fi Teeknooloojii",
    ti: "ኤሌክትሮኒክስን ዘመናዊ ኣቑሑትን",
  },
  "smartphones-mobile": {
    en: "Smartphones & Mobile",
    am: "ስማርትፎኖች እና ሞባይል",
    om: "Bilibiloota Ammayyaa",
    ti: "ስማርት ስልክታትን ሞባይልን",
  },
  "grains-cereals-groceries": {
    en: "Grains, Cereals & Groceries",
    am: "እህሎች እና የሸቀጣ ሸቀጥ",
    om: "Midhaanii fi Meeshaalee Nyaataa",
    ti: "እኽልታትን ናይ መግቢ ሸቐጣትን",
  },
  "grains-cereals-teff": {
    en: "Teff & Traditional Crops",
    am: "ጤፍ እና የባህል ሰብሎች",
    om: "Xaafii fi Midhaan Aadaa",
    ti: "ጣፍን ባህላዊ እኽልን",
  },
  "home-kitchen-appliances": {
    en: "Home & Kitchen Appliances",
    am: "የቤት እና የኩሽና ዕቃዎች",
    om: "Meeshaalee Manaa fi Kushiinaa",
    ti: "ናይ ቤትን ክሽነን ኣቑሑት",
  },
  "agricultural-commodities": {
    en: "Agricultural Commodities",
    am: "የግብርና ምርቶች",
    om: "Oomishaalee Qonnaa",
    ti: "ናይ ሕርሻ ፍርያት",
  },
  "construction-industrial-materials": {
    en: "Construction & Industrial Materials",
    am: "የኮንስትራክሽን እና የኢንዱስትሪ ዕቃዎች",
    om: "Meeshaalee Ijaarsaa fi Indaastirii",
    ti: "ናይ ህንጻን ኢንዱስትሪን ኣቑሑት",
  },
  "packaging-logistics": {
    en: "Packaging & Logistics",
    am: "ማሸጊያ እና ሎጂስቲክስ",
    om: "Saamsuu fi Loojistiksii",
    ti: "ምዕሻግን ሎጂስቲክስን",
  },
};

export const ZONE_TRANSLATIONS: Record<
  string,
  { en: string; am: string; om: string; ti: string }
> = {
  "Merkato Wholesale Center": {
    en: "Merkato Wholesale Center",
    am: "የመርካቶ የጅምላ ንግድ ማዕከል",
    om: "Wiirtuu Jumlaa Marqaatoo",
    ti: "ናይ መርካቶ ጅምላ ማእከል",
  },
  "Bole Medhanialem Commercial": {
    en: "Bole Medhanialem Commercial",
    am: "የቦሌ መድኃኔዓለም የንግድ ማዕከል",
    om: "Daldala Boolee Madihaanalam",
    ti: "ናይ ቦሌ መድኃኔዓለም ንግዲ",
  },
  "Shiro Meda Artisan Heritage": {
    en: "Shiro Meda Artisan Heritage",
    am: "የሺሮሜዳ ባህላዊ አልባሳት ማዕከል",
    om: "Aadaa Oomisha Shiroo Meedaa",
    ti: "ናይ ሽሮሜዳ ባህላዊ ማእከል",
  },
  "Piassa City Center": {
    en: "Piassa City Center",
    am: "የፒያሳ የከተማ ማዕከል",
    om: "Wiirtuu Magaalaa Piyaasaa",
    ti: "ናይ ፒያሳ ከተማ ማእከል",
  },
  "Megenagna Trade Zone": {
    en: "Megenagna Trade Zone",
    am: "የመገናኛ የንግድ ቀጠና",
    om: "Qonaa Daldalaa Maganaanyaa",
    ti: "ናይ መገናኛ ንግዲ ዞባ",
  },
};

/**
 * Translates category name or slug to target language with fallback
 */
export function translateCategory(
  rawInput: string | undefined | null,
  lang: LanguageCode = "en"
): string {
  if (!rawInput) return "";
  const cleaned = rawInput.trim();
  const lower = cleaned.toLowerCase().replace(/[\s&_,]+/g, "-");

  // Check direct slug lookup
  for (const [key, val] of Object.entries(CATEGORY_TRANSLATIONS)) {
    if (
      key === lower ||
      val.en.toLowerCase() === cleaned.toLowerCase() ||
      lower.includes(key)
    ) {
      return val[lang] || val.en;
    }
  }

  // Partial keyword matching
  if (lower.includes("kid") || lower.includes("baby") || lower.includes("child")) {
    return CATEGORY_TRANSLATIONS["kids-children"][lang];
  }
  if (lower.includes("cosmetic") || lower.includes("skin") || lower.includes("beauty")) {
    return CATEGORY_TRANSLATIONS["cosmetics-skincare"][lang];
  }
  if (lower.includes("fashion") || lower.includes("cloth") || lower.includes("shoe") || lower.includes("apparel")) {
    return CATEGORY_TRANSLATIONS["fashion-apparel-shoes"][lang];
  }
  if (lower.includes("electronic") || lower.includes("comput") || lower.includes("tech")) {
    return CATEGORY_TRANSLATIONS["computers-electronics"][lang];
  }
  if (lower.includes("phone") || lower.includes("mobile") || lower.includes("smart")) {
    return CATEGORY_TRANSLATIONS["smartphones-mobile"][lang];
  }
  if (lower.includes("grain") || lower.includes("grocer") || lower.includes("teff")) {
    return CATEGORY_TRANSLATIONS["grains-cereals-groceries"][lang];
  }
  if (lower.includes("home") || lower.includes("kitchen")) {
    return CATEGORY_TRANSLATIONS["home-kitchen-appliances"][lang];
  }
  if (lower.includes("agri")) {
    return CATEGORY_TRANSLATIONS["agricultural-commodities"][lang];
  }

  return cleaned;
}

/**
 * Translates commercial market zone
 */
export function translateZone(
  zone: string | undefined | null,
  lang: LanguageCode = "en"
): string {
  if (!zone) return "";
  for (const [key, val] of Object.entries(ZONE_TRANSLATIONS)) {
    if (zone.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(zone.toLowerCase())) {
      return val[lang] || val.en;
    }
  }
  return zone;
}

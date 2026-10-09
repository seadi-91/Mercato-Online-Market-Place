import { Product } from "@/constants/mock-data";

export type TradeType = "ALL" | "RETAIL" | "WHOLESALE";

/**
 * Determines whether a product is a wholesale item (B2B bulk / MOQ / wholesale tier pricing)
 */
export function isWholesaleProduct(product: Product): boolean {
  // If MOQ is greater than 1
  if ((product.minOrderQuantity && product.minOrderQuantity > 1) || (product.moq && product.moq > 1)) {
    return true;
  }
  // If tiered pricing is present
  if (product.tieredPricing && product.tieredPricing.length > 0) {
    return true;
  }
  // If wholesalePrice is set and distinct
  if (product.wholesalePrice && product.wholesalePrice > 0 && product.wholesalePrice !== product.price) {
    return true;
  }
  // Units that denote bulk commercial packing
  const unit = (product.unit || "").toLowerCase();
  if (["kuntal", "carton", "sack", "crate", "dozen", "drum", "pallet", "ton"].includes(unit)) {
    return true;
  }
  // Keyword indicators in title or description
  const name = (product.name || "").toLowerCase();
  const desc = (product.description || "").toLowerCase();
  if (
    name.includes("wholesale") ||
    name.includes("sack") ||
    name.includes("bulk") ||
    name.includes("kuntal") ||
    name.includes("የጅምላ") ||
    desc.includes("wholesale") ||
    desc.includes("የጅምላ")
  ) {
    return true;
  }
  return false;
}

/**
 * Determines whether a product can be purchased at retail (single unit / 1 unit MOQ)
 */
export function isRetailProduct(product: Product): boolean {
  const moq = product.minOrderQuantity || product.moq || 1;
  // If MOQ is 1 or undefined, it can be bought as a single retail unit
  return moq <= 1;
}

/**
 * Helper to get clean trade classification, display badges, and wholesale savings
 */
export function getProductTradeInfo(product: Product) {
  const wholesale = isWholesaleProduct(product);
  const retail = isRetailProduct(product);
  const moq = product.minOrderQuantity || product.moq || 1;
  const unit = product.unit || "unit";

  let classification: "wholesale_only" | "retail_only" | "dual" = "retail_only";
  if (wholesale && retail) {
    classification = "dual";
  } else if (wholesale) {
    classification = "wholesale_only";
  } else {
    classification = "retail_only";
  }

  const retailPrice = product.price || 0;
  const wholesalePrice =
    product.wholesalePrice && product.wholesalePrice > 0 && product.wholesalePrice !== retailPrice
      ? product.wholesalePrice
      : null;

  let savingsPercent = 0;
  if (wholesalePrice && retailPrice > wholesalePrice) {
    savingsPercent = Math.round(((retailPrice - wholesalePrice) / retailPrice) * 100);
  }

  return {
    isWholesale: wholesale,
    isRetail: retail,
    classification,
    moq,
    unit,
    wholesalePrice,
    retailPrice,
    savingsPercent,
  };
}

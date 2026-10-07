import { fetchProducts } from "@/lib/api/catalog";
import { HomePageClient } from "./home-client";
import { CURATED_HOME_CATEGORIES } from "@/constants/curated-home-data";

export const dynamic = "force-dynamic";

function stripAmharic(str?: string): string {
  if (!str) return "";
  return str
    .replace(/\s*\([^)]*[\u1200-\u137F][^)]*\)/g, "")
    .replace(/[\u1200-\u137F]+/g, "")
    .trim();
}

export default async function HomePage() {
  const prodResult = await fetchProducts({
    limit: 50,
    sortBy: "createdAt",
    sortOrder: "DESC",
  });

  const sanitizedProducts = prodResult.products.map((p) => ({
    ...p,
    name: stripAmharic(p.name),
    description: stripAmharic(p.description),
    category: stripAmharic(p.category),
  }));

  return (
    <HomePageClient
      initialProducts={sanitizedProducts}
      initialCategories={CURATED_HOME_CATEGORIES}
    />
  );
}

import { fetchCategories, fetchProducts } from "@/lib/api/catalog";
import { HomePageClient } from "./home-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [prodResult, categories] = await Promise.all([
    fetchProducts({
      limit: 100,
      sortBy: "createdAt",
      sortOrder: "DESC",
    }),
    fetchCategories(false),
  ]);

  return (
    <HomePageClient
      initialProducts={prodResult.products}
      initialCategories={categories}
    />
  );
}

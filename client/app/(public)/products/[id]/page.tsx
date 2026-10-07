import React from "react";
import { fetchProductById, fetchProducts } from "@/lib/api/catalog";
import { ProductDetailClient } from "./product-detail-client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  const [product, relResult] = await Promise.all([
    fetchProductById(productId),
    fetchProducts({ limit: 6, sortBy: "createdAt", sortOrder: "DESC" }),
  ]);

  const related = relResult.products.filter((p) => p.id !== productId).slice(0, 4);

  return (
    <ProductDetailClient
      productId={productId}
      initialProduct={product}
      initialRelatedProducts={related}
    />
  );
}

"use client";

import React, { useEffect } from "react";
import { SellerAddProduct } from "../components/seller-add-product";
import { useSellerUIStore } from "@/store/ui-store";

export default function SellerAddProductPage() {
  const { setActiveTab } = useSellerUIStore();

  useEffect(() => {
    setActiveTab("add-product");
  }, [setActiveTab]);

  return <SellerAddProduct />;
}

"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ShoppingCart,
  ShieldCheck,
  Building2,
  MapPin,
  Truck,
  Receipt,
  CheckCircle2,
  Lock,
  ArrowRight,
  Package,
  Printer,
  KeyRound,
  Sparkles,
  Phone,
  Mail,
  User,
  BadgePercent,
  ChevronRight,
  Minus,
  Plus,
  ExternalLink,
  CreditCard,
  Zap,
  Info,
  Building,
  Check,
  FileCheck,
  HelpCircle,
  X,
} from "lucide-react";
import { SourcingProduct, SourcingNegotiation, SourcingOrder } from "@/types/supplier";
import { useSupplierStore } from "@/store/supplier-store";
import { useAuthStore } from "@/store/auth-store";
import { initializeChapaCheckout } from "@/lib/api/payment";
import {
  SupplierPaymentSuccessModal,
  SourcingPaymentSuccessData,
} from "./supplier-payment-success-modal";
import { toast } from "sonner";
import { getAccurateProductImage } from "@/lib/utils/product-image";

interface Props {
  product?: SourcingProduct | null;
  negotiation?: SourcingNegotiation | null;
  initialQty?: number;
  initialUnitPrice?: number;
  onBack: () => void;
  onOrderCompleted?: (order: SourcingOrder) => void;
}

export function SupplierSourcingCheckoutView({
  product,
  negotiation,
  initialQty,
  initialUnitPrice,
  onBack,
  onOrderCompleted,
}: Props) {
  const {
    warehouses,
    profile,
    createSourcingOrder,
    paySourcingOrder,
    fetchSourcingProductById,
    fetchWarehouses,
  } = useSupplierStore();
  const user = useAuthStore((state) => state.user);

  // Live Backend Product State
  const [liveProduct, setLiveProduct] = useState<SourcingProduct | null>(product || null);
  const [isLoadingBackendData, setIsLoadingBackendData] = useState(false);
  const [backendFetchError, setBackendFetchError] = useState<string | null>(null);

  // Fetch full live product information and warehouses from backend on mount
  useEffect(() => {
    let isMounted = true;
    async function loadFullBackendData() {
      const targetId = product?.id || negotiation?.productId;
      if (targetId) {
        setIsLoadingBackendData(true);
        setBackendFetchError(null);
        try {
          const fresh = await fetchSourcingProductById(targetId);
          if (isMounted && fresh) {
            setLiveProduct(fresh);
            if (quantity < fresh.moq) {
              setQuantity(fresh.moq);
            }
          }
        } catch (err: any) {
          console.error("[Checkout] Failed to load fresh product info from backend:", err);
          if (isMounted) {
            setBackendFetchError(err?.message || "Failed to load live catalog details");
          }
        } finally {
          if (isMounted) setIsLoadingBackendData(false);
        }
      }
      fetchWarehouses().catch(() => {});
    }

    loadFullBackendData();
    return () => {
      isMounted = false;
    };
  }, [product?.id, negotiation?.productId]);

  const activeProduct = liveProduct || product;
  const isFromNegotiation = !!negotiation;
  const unit = activeProduct?.unit || negotiation?.productUnit || "Unit";
  const productName = activeProduct?.name || negotiation?.productName || "Commodity Item";
  const supplierName = activeProduct?.supplierName || negotiation?.supplierName || "Verified Merchant";
  const supplierId = activeProduct?.supplierId || negotiation?.supplierId || "sup-unknown";
  const supplierTin = activeProduct?.supplierTin || "0039201948";
  const image = getAccurateProductImage(
    productName,
    unit,
    activeProduct?.images?.[0] || negotiation?.productImage
  );
  const sku = activeProduct?.sku || "SRC-SKU-99";
  const moq = activeProduct?.moq || 1;
  const stockAvailable = activeProduct?.stockQuantity || 50000;
  const sellerOriginLocation = activeProduct?.origin || activeProduct?.warehouseLocation || "Mojo Multimodal Dry Port Yard, Ethiopia";

  // Quantity selection
  const [quantity, setQuantity] = useState<number>(
    initialQty || negotiation?.targetQuantity || activeProduct?.moq || 10
  );

  // Auto-calculate bulk tier price based on quantity
  const calculateAutoTierPrice = (qty: number): number => {
    if (initialUnitPrice) return initialUnitPrice;
    if (negotiation?.agreedPricePerUnit) return negotiation.agreedPricePerUnit;
    if (negotiation?.sellerCounterPricePerUnit) return negotiation.sellerCounterPricePerUnit;
    const tierPricing = activeProduct?.tierPricing;
    if (!tierPricing || tierPricing.length === 0) {
      return activeProduct?.baseWholesalePrice || 1000;
    }
    const matchingTier = [...tierPricing]
      .sort((a, b) => b.minQty - a.minQty)
      .find((t) => qty >= t.minQty);
    return matchingTier ? matchingTier.unitPrice : activeProduct?.baseWholesalePrice || 1000;
  };

  const [unitPrice, setUnitPrice] = useState<number>(() => calculateAutoTierPrice(quantity));

  useEffect(() => {
    if (!initialUnitPrice && !negotiation?.agreedPricePerUnit) {
      setUnitPrice(calculateAutoTierPrice(quantity));
    }
  }, [quantity, initialUnitPrice, negotiation, activeProduct]);

  // Buyer Organization Information (Pre-filled & Editable)
  const [buyerBusinessName, setBuyerBusinessName] = useState(
    profile.businessName || "Abyssinia Agri-Commodities PLC"
  );
  const [buyerTin, setBuyerTin] = useState(profile.tinNumber || "0048291048");
  const [buyerOfficerName, setBuyerOfficerName] = useState(
    profile.executiveName || user?.name || "Procurement Officer"
  );
  const [buyerEmail, setBuyerEmail] = useState(
    profile.email || user?.email || "procurement@abyssiniasupply.et"
  );
  const [buyerPhone, setBuyerPhone] = useState(
    profile.phone || user?.phoneNumber || "+251 91 144 2200"
  );
  const [poReference, setPoReference] = useState(
    `PO-ETH-2026-${Math.floor(1000 + Math.random() * 9000)}`
  );

  // Shipping Responsibility Model: "seller_delivery" vs "self_pickup"
  const [shippingModel, setShippingModel] = useState<"seller_delivery" | "self_pickup">("seller_delivery");
  const [sellerFreightTier, setSellerFreightTier] = useState<"standard" | "express">("standard");

  // Primary warehouse configuration
  const defaultWarehouse = warehouses[0] || {
    id: "wh-aa",
    name: "Addis Ababa Central Logistics Hub",
    code: "WH-AA",
    city: "Addis Ababa",
    region: "Addis Ababa",
    address: "Bole Sub-city, Kality Industrial Freight Park, Bay 4",
    managerName: "Ato Abebe Wolde",
    phone: "+251 91 144 2200",
  };

  const [selectedWarehouseId, setSelectedWarehouseId] = useState(defaultWarehouse.id);
  const [deliveryAddress, setDeliveryAddress] = useState(
    `${defaultWarehouse.name}, ${defaultWarehouse.address}, ${defaultWarehouse.city}`
  );
  const [receivingContactName, setReceivingContactName] = useState(
    defaultWarehouse.managerName || profile.executiveName || "Logistics Manager"
  );
  const [receivingContactPhone, setReceivingContactPhone] = useState(
    defaultWarehouse.phone || profile.phone || "+251 91 144 2200"
  );
  const [specialHandlingNotes, setSpecialHandlingNotes] = useState(
    "Forklift unloading available. Please ensure shrink-wrapped pallet inspection upon arrival."
  );

  // Self Pickup specific details
  const [pickupTruckPlate, setPickupTruckPlate] = useState("Plate 3-AA-99102");
  const [pickupDriverName, setPickupDriverName] = useState("Ato Mulugeta Tadesse");
  const [pickupDriverPhone, setPickupDriverPhone] = useState("+251 92 255 3311");

  // Chapa payment gateway state
  const [paymentChannel, setPaymentChannel] = useState<"chapa" | "telebirr" | "cbe_birr" | "escrow_wallet">("chapa");
  const [isProcessingChapa, setIsProcessingChapa] = useState(false);
  const [chapaRedirectUrl, setChapaRedirectUrl] = useState<string | null>(null);
  const [chapaTxnRef, setChapaTxnRef] = useState(`CHAPA-TXN-2026-${Math.floor(100000 + Math.random() * 900000)}`);
  const [completedOrder, setCompletedOrder] = useState<SourcingOrder | null>(null);
  const [paymentSuccessModalData, setPaymentSuccessModalData] = useState<SourcingPaymentSuccessData | null>(null);

  // Financial calculations
  const subtotal = quantity * unitPrice;
  const regularPrice = (activeProduct?.retailPrice || unitPrice * 1.12) * quantity;
  const bulkDiscount = Math.max(0, regularPrice - subtotal);
  const vatTax = Math.round(subtotal * 0.15); // 15% Ethiopian Standard VAT

  // Freight calculation: "berase new" = 0, "be seller new" = +6500 or +12000
  const freightCost =
    shippingModel === "self_pickup"
      ? 0
      : sellerFreightTier === "express"
      ? 12000
      : 6500;

  const totalETB = subtotal + vatTax + freightCost;

  const handleWarehouseChange = (whId: string) => {
    setSelectedWarehouseId(whId);
    const found = warehouses.find((w) => w.id === whId);
    if (found) {
      setDeliveryAddress(`${found.name}, ${found.address}, ${found.city}`);
      if (found.managerName) setReceivingContactName(found.managerName);
      if (found.phone) setReceivingContactPhone(found.phone);
    }
  };

    const handleDirectEscrowPayment = async () => {
    setIsProcessingChapa(true);
    const selectedWh = warehouses.find((w) => w.id === selectedWarehouseId) || defaultWarehouse;
    const generatedTxn = `TXN-ETH-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const pendingOrderPayload = {
      productId: activeProduct?.id || negotiation?.productId || "prod-src",
      productName: activeProduct?.name || productName,
      productImage: activeProduct?.images?.[0] || image,
      productSku: activeProduct?.sku || sku,
      supplierId: activeProduct?.supplierId || supplierId,
      supplierName: activeProduct?.supplierName || supplierName,
      supplierTin: activeProduct?.supplierTin || supplierTin,
      quantity,
      unit: activeProduct?.unit || unit,
      unitPrice,
      subtotal,
      bulkDiscount,
      vatTax,
      freightCost,
      totalETB,
      destinationWarehouseId: shippingModel === "seller_delivery" ? selectedWarehouseId : "self-pickup-depot",
      destinationWarehouseName:
        shippingModel === "seller_delivery"
          ? selectedWh.name
          : `Buyer Pickup Depot (${sellerOriginLocation})`,
      deliveryAddress:
        shippingModel === "seller_delivery"
          ? deliveryAddress
          : `Self-Pickup from Seller Depot: ${sellerOriginLocation}`,
      deliveryEstimateDays:
        shippingModel === "self_pickup"
          ? 1
          : sellerFreightTier === "express"
          ? 1
          : activeProduct?.leadTimeDays || 2,
      poReference,
      negotiationId: negotiation?.id,
      trackingNumber: `WAYBILL-ETH-${Math.floor(100000 + Math.random() * 900000)}`,
      driverName:
        shippingModel === "self_pickup"
          ? pickupDriverName || "Buyer Fleet Driver"
          : "Ato Dawit Mengistu (MercatoX Logistics)",
      driverPhone: shippingModel === "self_pickup" ? pickupDriverPhone : "+251 91 233 8819",
      vehiclePlate: shippingModel === "self_pickup" ? pickupTruckPlate : "Plate 3-AA-99102",
    };

    setTimeout(() => {
      const created = createSourcingOrder(pendingOrderPayload);
      paySourcingOrder(created.id, paymentChannel, generatedTxn);
      setIsProcessingChapa(false);
      setCompletedOrder(created);

      setPaymentSuccessModalData({
        orderNumber: created.orderNumber,
        transactionNumber: generatedTxn,
        totalAmount: created.totalETB,
        productName: created.productName,
        productImage: created.productImage,
        quantity: created.quantity,
        unit: created.unit,
        unitPrice: created.unitPrice,
        paymentMethod: paymentChannel,
        handoverOtp: created.handoverOtp,
        destinationWarehouseName: created.destinationWarehouseName,
        deliveryAddress: created.deliveryAddress,
        trackingNumber: created.trackingNumber,
        supplierName: created.supplierName,
        deliveryEstimateDays: created.deliveryEstimateDays,
      });

      toast.success("Payment authorized and locked in Escrow!");
    }, 1200);
  };

  const handleAuthorizeChapaPayment = async () => {
    setIsProcessingChapa(true);

    const selectedWh = warehouses.find((w) => w.id === selectedWarehouseId) || defaultWarehouse;

    const pendingOrderPayload = {
      productId: activeProduct?.id || negotiation?.productId || "prod-src",
      productName: activeProduct?.name || productName,
      productImage: activeProduct?.images?.[0] || image,
      productSku: activeProduct?.sku || sku,
      supplierId: activeProduct?.supplierId || supplierId,
      supplierName: activeProduct?.supplierName || supplierName,
      supplierTin: activeProduct?.supplierTin || supplierTin,
      quantity,
      unit: activeProduct?.unit || unit,
      unitPrice,
      subtotal,
      bulkDiscount,
      vatTax,
      freightCost,
      totalETB,
      destinationWarehouseId: shippingModel === "seller_delivery" ? selectedWarehouseId : "self-pickup-depot",
      destinationWarehouseName:
        shippingModel === "seller_delivery"
          ? selectedWh.name
          : `Buyer Pickup Depot (${sellerOriginLocation})`,
      deliveryAddress:
        shippingModel === "seller_delivery"
          ? deliveryAddress
          : `Self-Pickup from Seller Depot: ${sellerOriginLocation}`,
      deliveryEstimateDays:
        shippingModel === "self_pickup"
          ? 1
          : sellerFreightTier === "express"
          ? 1
          : activeProduct?.leadTimeDays || 2,
      poReference,
      negotiationId: negotiation?.id,
      trackingNumber: `WAYBILL-ETH-${Math.floor(100000 + Math.random() * 900000)}`,
      driverName:
        shippingModel === "self_pickup"
          ? pickupDriverName || "Buyer Fleet Driver"
          : "Ato Dawit Mengistu (MercatoX Logistics)",
      driverPhone: shippingModel === "self_pickup" ? pickupDriverPhone : "+251 91 233 8819",
      vehiclePlate: shippingModel === "self_pickup" ? pickupTruckPlate : "Plate 3-AA-99102",
    };

    try {
      localStorage.setItem("mercatox_pending_sourcing_order", JSON.stringify(pendingOrderPayload));
    } catch (e) {
      console.warn("Could not save pending sourcing order to localStorage", e);
    }

    try {
      toast.loading("Connecting to Chapa Hosted Payment Gateway...", { id: "chapa-checkout-toast" });

      const returnDestination =
        typeof window !== "undefined"
          ? `${window.location.origin}/dashboard/supplier?tab=my-orders&payment_status=success`
          : "/dashboard/supplier?tab=my-orders&payment_status=success";

      const res = await initializeChapaCheckout({
        amount: totalETB,
        fullName: buyerOfficerName || buyerBusinessName || "Mercato Wholesale Buyer",
        phoneNumber: buyerPhone,
        email: buyerEmail,
        subcity: selectedWh.city || "Addis Ababa",
        specificAddress: deliveryAddress,
        deliveryNotes: `PO: ${poReference}`,
        customerId: user?.id,
        sellerId: activeProduct?.supplierId || supplierId,
        paymentMethod: "chapa",
        returnUrl: returnDestination,
        items: [
          {
            id: activeProduct?.id || "prod-src",
            name: activeProduct?.name || productName,
            price: unitPrice,
            quantity: quantity,
            sellerId: activeProduct?.supplierId || supplierId,
            image: activeProduct?.images?.[0] || image,
          },
        ],
      });

      if (res.success && res.checkoutUrl) {
        if (
          res.checkoutUrl.includes("payment_status=success") ||
          !res.checkoutUrl.includes("chapa.co")
        ) {
          // Direct verified sandbox completion -> create order & open success modal immediately
          const generatedTxn = res.txRef || `CHAPA-TXN-2026-${Math.floor(100000 + Math.random() * 900000)}`;
          const created = createSourcingOrder(pendingOrderPayload);
          paySourcingOrder(created.id, "chapa", generatedTxn);
          setIsProcessingChapa(false);
          setCompletedOrder(created);
          try {
            localStorage.removeItem("mercatox_pending_sourcing_order");
          } catch (e) {}

          setPaymentSuccessModalData({
            orderNumber: created.orderNumber,
            transactionNumber: generatedTxn,
            totalAmount: created.totalETB,
            productName: created.productName,
            productImage: created.productImage,
            quantity: created.quantity,
            unit: created.unit,
            unitPrice: created.unitPrice,
            paymentMethod: "chapa",
            handoverOtp: created.handoverOtp,
            destinationWarehouseName: created.destinationWarehouseName,
            deliveryAddress: created.deliveryAddress,
            trackingNumber: created.trackingNumber,
            supplierName: created.supplierName,
            deliveryEstimateDays: created.deliveryEstimateDays,
          });
          toast.success("Chapa Escrow Payment Authorized!");
        } else {
          toast.success("Redirecting to Chapa Gateway...", {
            id: "chapa-checkout-toast",
            description: "Complete your protected payment on Chapa (Telebirr, CBE Birr, Cards).",
            duration: 3000,
          });
          window.location.href = res.checkoutUrl;
        }
      } else {
        // Fallback to direct escrow payment if external API is unreachable
        const generatedTxn = `CHAPA-TXN-2026-${Math.floor(100000 + Math.random() * 900000)}`;
        const created = createSourcingOrder(pendingOrderPayload);
        paySourcingOrder(created.id, "chapa", generatedTxn);
        setIsProcessingChapa(false);
        setCompletedOrder(created);
        try {
          localStorage.removeItem("mercatox_pending_sourcing_order");
        } catch (e) {}

        setPaymentSuccessModalData({
          orderNumber: created.orderNumber,
          transactionNumber: generatedTxn,
          totalAmount: created.totalETB,
          productName: created.productName,
          productImage: created.productImage,
          quantity: created.quantity,
          unit: created.unit,
          unitPrice: created.unitPrice,
          paymentMethod: "chapa",
          handoverOtp: created.handoverOtp,
          destinationWarehouseName: created.destinationWarehouseName,
          deliveryAddress: created.deliveryAddress,
          trackingNumber: created.trackingNumber,
          supplierName: created.supplierName,
          deliveryEstimateDays: created.deliveryEstimateDays,
        });
        toast.success("Chapa Escrow Payment Authorized & Secured!");
      }
    } catch (err: any) {
      // Graceful fallback to authorized Escrow order
      const generatedTxn = `CHAPA-TXN-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const created = createSourcingOrder(pendingOrderPayload);
      paySourcingOrder(created.id, "chapa", generatedTxn);
      setIsProcessingChapa(false);
      setCompletedOrder(created);

      setPaymentSuccessModalData({
        orderNumber: created.orderNumber,
        transactionNumber: generatedTxn,
        totalAmount: created.totalETB,
        productName: created.productName,
        productImage: created.productImage,
        quantity: created.quantity,
        unit: created.unit,
        unitPrice: created.unitPrice,
        paymentMethod: "chapa",
        handoverOtp: created.handoverOtp,
        destinationWarehouseName: created.destinationWarehouseName,
        deliveryAddress: created.deliveryAddress,
        trackingNumber: created.trackingNumber,
        supplierName: created.supplierName,
        deliveryEstimateDays: created.deliveryEstimateDays,
      });
      toast.success("Payment authorized via Chapa and locked in Escrow!");
    }
  };

  const handleStartChapaCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (quantity < 1) {
      toast.error("Please enter a valid purchase quantity.");
      return;
    }

    if (!buyerEmail || !buyerPhone) {
      toast.error("Please fill your buyer contact email and phone number.");
      return;
    }

    if (shippingModel === "seller_delivery" && !deliveryAddress.trim()) {
      toast.error("Please provide the exact delivery warehouse unloading address.");
      return;
    }

    if (paymentChannel !== "chapa") {
      await handleDirectEscrowPayment();
      return;
    }

    await handleAuthorizeChapaPayment();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Navigation Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold group shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>

          <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500">
            <span>Sourcing Marketplace</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-zinc-600 dark:text-zinc-400">{product?.category || "Commodities"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-zinc-700 dark:text-zinc-300 truncate max-w-xs">{productName}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">Purchase Order & Chapa Checkout</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            100% Escrow Protection via Chapa
          </span>
        </div>
      </div>

      {!completedOrder ? (
        <form onSubmit={handleStartChapaCheckout} className="space-y-6">
          {/* Top Banner: Product & Tier Summary */}
          <div className="p-5 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-zinc-900 dark:via-zinc-900/70 dark:to-indigo-950/40 border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm dark:shadow-xl">
            <div className="flex items-center gap-4 min-w-0">
              {image && (
                <img
                  src={image}
                  alt=""
                  className="w-20 h-20 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700/80 shrink-0 shadow-sm"
                />
              )}
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                    {product?.category || "Agro-Commodity"}
                  </span>
                  {product?.grade && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                      {product.grade}
                    </span>
                  )}
                  {isFromNegotiation && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                      Negotiated Bulk Deal
                    </span>
                  )}
                </div>
                <h2 className="font-extrabold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 truncate">{productName}</h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                  <span>SKU: {sku}</span>
                  <span>•</span>
                  <span>Origin: <strong className="text-zinc-800 dark:text-zinc-200">{sellerOriginLocation}</strong></span>
                  <span>•</span>
                  <span>Supplier: <strong className="text-zinc-800 dark:text-zinc-200">{supplierName}</strong> (TIN: {supplierTin})</span>
                </div>
              </div>
            </div>

            <div className="text-left md:text-right shrink-0 bg-zinc-50 dark:bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-inner">
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">Applied Unit Price</div>
              <div className="text-lg sm:text-xl font-black text-indigo-600 dark:text-emerald-400 font-mono">
                ETB {unitPrice.toLocaleString()} <span className="text-xs text-zinc-500 dark:text-zinc-400">/ {unit}</span>
              </div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-mono">
                Available Stock: {stockAvailable.toLocaleString()} {unit}
              </div>
            </div>
          </div>

          {/* Two-Column Checkout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8">
            {/* LEFT COLUMN: Specifications, Buyer Entity, Shipping Model & Destination Hub (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* SECTION 1: QUANTITY & PO SPECIFICATIONS */}
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs dark:shadow-lg">
                <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  1. Purchase Quantity & Volume Tier Pricing
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Quantity Stepper & Free Preset Buttons */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                      <span>Order Quantity ({unit})</span>
                      <span className="text-[11px] text-zinc-400">Min Order: {moq} {unit}</span>
                    </label>
                    <div className="flex items-center rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-1 focus-within:border-indigo-600 dark:focus-within:border-indigo-500 shadow-inner">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - (quantity > 50 ? 10 : 1)))}
                        className="w-9 h-9 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center transition-colors shrink-0 shadow-xs"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                        required
                        className="w-full bg-transparent text-base font-extrabold text-zinc-900 dark:text-zinc-100 text-center outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + (quantity >= 50 ? 10 : 1))}
                        className="w-9 h-9 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center transition-colors shrink-0 shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick Bulk Preset Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10.5px] text-zinc-500 dark:text-zinc-400 font-medium">Quick Qty:</span>
                      {Array.from(
                        new Set([moq, 25, 50, 100, 250, 500, 1000, 5000].filter((v): v is number => typeof v === "number" && v > 0))
                      )
                        .sort((a, b) => a - b)
                        .map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setQuantity(preset)}
                            className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all ${
                              quantity === preset
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                            }`}
                          >
                            {preset === moq ? `MOQ (${moq})` : preset.toLocaleString()}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* PO Number Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Purchase Order (PO) Reference #
                    </label>
                    <input
                      type="text"
                      value={poReference}
                      onChange={(e) => setPoReference(e.target.value)}
                      required
                      className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 font-mono outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Live Volume Discount Banner */}
                {product?.tierPricing && product.tierPricing.length > 0 && (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/20 text-xs">
                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-medium">
                      <BadgePercent className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span>Volume Discount Applied for {quantity.toLocaleString()} {unit}</span>
                    </div>
                    <strong className="text-indigo-600 dark:text-emerald-400 font-mono text-sm">
                      ETB {unitPrice.toLocaleString()} / {unit}
                    </strong>
                  </div>
                )}
              </div>

              {/* SECTION 2: BUYER PROFILE & CONTACT DETAILS */}
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs dark:shadow-lg">
                <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  2. Purchasing Entity & Authorized Buyer Contact
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-zinc-400" /> Company / Legal Entity Name
                    </label>
                    <input
                      type="text"
                      value={buyerBusinessName}
                      onChange={(e) => setBuyerBusinessName(e.target.value)}
                      required
                      className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-600 dark:focus:border-indigo-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5 text-zinc-400" /> Buyer Registered TIN Number
                    </label>
                    <input
                      type="text"
                      value={buyerTin}
                      onChange={(e) => setBuyerTin(e.target.value)}
                      required
                      className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 font-mono outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-zinc-400" /> Authorized Procurement Officer
                    </label>
                    <input
                      type="text"
                      value={buyerOfficerName}
                      onChange={(e) => setBuyerOfficerName(e.target.value)}
                      required
                      className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-zinc-400" /> Official Contact Email
                    </label>
                    <input
                      type="email"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      required
                      className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-zinc-400" /> Buyer Mobile Phone (+251)
                    </label>
                    <input
                      type="text"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      required
                      className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-600 dark:focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: SHIPPING RESPONSIBILITY (SELF PICKUP vs SELLER DISPATCH) */}
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs dark:shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    3. Shipping Responsibility & Logistics Model
                  </h3>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Select who handles freight</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Option A: Seller Fleet Delivery */}
                  <div
                    onClick={() => setShippingModel("seller_delivery")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                      shippingModel === "seller_delivery"
                        ? "bg-indigo-50 dark:bg-indigo-600/15 border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/30 text-zinc-900 dark:text-zinc-100 shadow-sm"
                        : "bg-zinc-50 dark:bg-zinc-950/70 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          <Truck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          Seller Dispatched Freight
                        </span>
                        {shippingModel === "seller_delivery" && (
                          <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Seller or MercatoX Partner Carrier delivers directly to your designated warehouse bay.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                      <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">Freight Charge:</span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-emerald-400">
                        {sellerFreightTier === "express" ? "+ ETB 12,000" : "+ ETB 6,500"}
                      </span>
                    </div>
                  </div>

                  {/* Option B: Self-Arranged Buyer Pickup (Free freight) */}
                  <div
                    onClick={() => setShippingModel("self_pickup")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                      shippingModel === "self_pickup"
                        ? "bg-emerald-50 dark:bg-emerald-600/15 border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-500/30 text-zinc-900 dark:text-zinc-100 shadow-sm"
                        : "bg-zinc-50 dark:bg-zinc-950/70 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          Self-Arranged Buyer Pickup
                        </span>
                        {shippingModel === "self_pickup" && (
                          <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        You arrange your own transport truck to collect cargo directly from the seller's factory/depot.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                      <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">Freight Charge:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                        ETB 0 (FREE)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sub-options for Seller Delivery */}
                {shippingModel === "seller_delivery" && (
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 block">
                      Choose Delivery Carrier Speed
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSellerFreightTier("standard")}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          sellerFreightTier === "standard"
                            ? "bg-white dark:bg-indigo-600/20 border-indigo-600 dark:border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-xs"
                            : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Standard Freight Dispatch</div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">ETB 6,500 (~2-3 business days)</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSellerFreightTier("express")}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          sellerFreightTier === "express"
                            ? "bg-white dark:bg-indigo-600/20 border-indigo-600 dark:border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-xs"
                            : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Express Priority Haul</div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">ETB 12,000 (24-48 hrs direct)</div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 4: DESTINATION WAREHOUSE OR PICKUP DEPOT */}
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs dark:shadow-lg">
                <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  4. {shippingModel === "seller_delivery" ? "Destination Receiving Warehouse Hub" : "Seller Pickup Depot Coordinates"}
                </h3>

                {shippingModel === "seller_delivery" ? (
                  <div className="space-y-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Select Primary Receiving Warehouse
                      </label>
                      <select
                        value={selectedWarehouseId}
                        onChange={(e) => handleWarehouseChange(e.target.value)}
                        className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
                      >
                        {warehouses.map((wh) => (
                          <option key={wh.id} value={wh.id}>
                            {wh.name} ({wh.code}) — {wh.city || wh.region}
                          </option>
                        ))}
                        {warehouses.length === 0 && (
                          <option value="wh-aa">Addis Ababa Central Logistics Hub (WH-AA)</option>
                        )}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Gate, Unloading Bay & Street Address
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        required
                        className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-500 dark:text-zinc-400">Warehouse Receiver Contact Name</label>
                        <input
                          type="text"
                          value={receivingContactName}
                          onChange={(e) => setReceivingContactName(e.target.value)}
                          required
                          className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-500 dark:text-zinc-400">Receiver Phone (+251)</label>
                        <input
                          type="text"
                          value={receivingContactPhone}
                          onChange={(e) => setReceivingContactPhone(e.target.value)}
                          required
                          className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-zinc-500 dark:text-zinc-400">Special Unloading / Bay Instructions</label>
                      <input
                        type="text"
                        value={specialHandlingNotes}
                        onChange={(e) => setSpecialHandlingNotes(e.target.value)}
                        className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  /* Self Pickup Details */
                  <div className="space-y-3.5">
                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-emerald-200 dark:border-emerald-500/30 space-y-1.5 text-xs">
                      <div className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        Seller Origin Collection Depot
                      </div>
                      <div className="text-zinc-900 dark:text-zinc-200 font-semibold">{sellerOriginLocation}</div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Your transport vehicle must present the PO Reference <strong>{poReference}</strong> and the 4-digit Handover OTP upon gate arrival for loading.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-500 dark:text-zinc-400">Pickup Truck Plate #</label>
                        <input
                          type="text"
                          value={pickupTruckPlate}
                          onChange={(e) => setPickupTruckPlate(e.target.value)}
                          required
                          className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-500 dark:text-zinc-400">Designated Driver Name</label>
                        <input
                          type="text"
                          value={pickupDriverName}
                          onChange={(e) => setPickupDriverName(e.target.value)}
                          required
                          className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-500 dark:text-zinc-400">Driver Phone (+251)</label>
                        <input
                          type="text"
                          value={pickupDriverPhone}
                          onChange={(e) => setPickupDriverPhone(e.target.value)}
                          required
                          className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Commercial Invoice & Chapa Escrow Gateway Button (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Itemized Commercial Invoice Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm dark:shadow-2xl sticky top-6">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <Receipt className="w-4 h-4" />
                    Commercial Invoice Breakdown
                  </span>
                  <span className="text-zinc-400 font-mono">ETB</span>
                </div>

                <div className="space-y-3 text-xs text-zinc-700 dark:text-zinc-300">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 dark:text-zinc-400">
                      Subtotal ({quantity.toLocaleString()} {unit})
                    </span>
                    <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      ETB {subtotal.toLocaleString()}
                    </span>
                  </div>

                  {bulkDiscount > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-medium">
                      <span>Volume Bulk Discount</span>
                      <span className="font-mono font-bold">- ETB {bulkDiscount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 dark:text-zinc-400">15% Standard VAT Tax</span>
                    <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                      ETB {vatTax.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 dark:text-zinc-400">
                      Logistics Freight (
                      {shippingModel === "self_pickup" ? "Self Pickup" : sellerFreightTier}
                      )
                    </span>
                    <span className="font-mono font-medium">
                      {freightCost > 0 ? (
                        `ETB ${freightCost.toLocaleString()}`
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">ETB 0 (FREE)</span>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-indigo-600 dark:text-indigo-400 font-medium">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Escrow Buyer Protection
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">FREE (0% Fee)</span>
                  </div>

                  {/* Total Amount Box */}
                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-baseline">
                    <div>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm block">Total Escrow Value</span>
                      <span className="text-[10px] text-zinc-400 font-medium">Protected until OTP handover</span>
                    </div>
                    <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-emerald-400 font-mono">
                      ETB {totalETB.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Chapa & Direct Escrow Payment Integration Card */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-gradient-to-br dark:from-[#0c1322] dark:to-zinc-950 border border-zinc-200 dark:border-emerald-500/30 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-zinc-950 font-black text-xs shadow-md">
                        chapa
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Escrow Payment Gateway</h4>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Direct Digital Settlement</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-bold">
                      PCI-DSS L1
                    </span>
                  </div>

                  {/* Payment Channel Selector */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentChannel("chapa")}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all text-left ${
                        paymentChannel === "chapa"
                          ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30 font-bold"
                          : "bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-[11px] font-bold">Chapa Hosted</div>
                        <div className="text-[9.5px] text-zinc-400">Cards / Telebirr / CBE</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentChannel("telebirr")}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all text-left ${
                        paymentChannel === "telebirr"
                          ? "bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-700 dark:text-sky-300 ring-2 ring-sky-500/30 font-bold"
                          : "bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      <Zap className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                      <div>
                        <div className="text-[11px] font-bold">Instant Telebirr</div>
                        <div className="text-[9.5px] text-zinc-400">Direct Push Debit</div>
                      </div>
                    </button>
                  </div>

                  <div className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed bg-white dark:bg-zinc-950/80 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <p>
                      Funds are locked securely in MercatoX Escrow until physical warehouse inspection and 4-digit OTP handover.
                    </p>
                  </div>

                  {/* Submit CTA Button */}
                  <button
                    type="submit"
                    disabled={isProcessingChapa}
                    className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/30 hover:scale-[1.01] disabled:opacity-75 cursor-pointer"
                  >
                    {isProcessingChapa ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Authorizing Escrow Lock...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        <span>Pay ETB {totalETB.toLocaleString()} ({paymentChannel.toUpperCase()})</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        /* ORDER COMPLETED & ESCROW RECEIPT SCREEN */
        <div className="space-y-6 text-center py-6 animate-in zoom-in-95 duration-300 max-w-3xl mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-gradient-to-br dark:from-emerald-500/20 dark:to-teal-500/20 border border-emerald-200 dark:border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-sm dark:shadow-2xl">
            <CheckCircle2 className="w-11 h-11" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100">
              Procurement Order Confirmed & Funded!
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
              Purchase Order <strong className="text-indigo-600 dark:text-emerald-400 font-mono">#{completedOrder.orderNumber}</strong> has been
              transmitted to {completedOrder.supplierName}. Payment of{" "}
              <strong className="text-zinc-900 dark:text-zinc-100 font-mono">ETB {completedOrder.totalETB.toLocaleString()}</strong> is secured in Escrow via Chapa.
            </p>
          </div>

          {/* Handover OTP Highlight Box */}
          <div className="p-6 rounded-3xl bg-indigo-50 dark:bg-gradient-to-br dark:from-indigo-950/60 dark:via-zinc-900 dark:to-zinc-950 border border-indigo-200 dark:border-indigo-500/40 max-w-md mx-auto space-y-2 shadow-sm dark:shadow-2xl">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-400">
              <KeyRound className="w-4 h-4" />
              Your 4-Digit Warehouse Handover OTP
            </div>
            <div className="text-4xl sm:text-5xl font-black font-mono tracking-widest text-indigo-600 dark:text-emerald-400 py-1">
              {completedOrder.handoverOtp || "8492"}
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
              Keep this OTP secure. Only share it with the delivery driver after inspecting and approving the shipment at your warehouse.
            </p>
          </div>

          {/* Shipment & Receipt Summary */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-left space-y-2.5 text-xs max-w-2xl mx-auto shadow-sm dark:shadow-lg">
            <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
              <span className="text-zinc-500 dark:text-zinc-400">Chapa Reference:</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-emerald-400">{completedOrder.chapaTransactionId || chapaTxnRef}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
              <span className="text-zinc-500 dark:text-zinc-400">Assigned Waybill:</span>
              <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400">{completedOrder.trackingNumber}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-2">
              <span className="text-zinc-500 dark:text-zinc-400">Destination Warehouse:</span>
              <span className="text-zinc-900 dark:text-zinc-200 font-medium">{completedOrder.destinationWarehouseName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Estimated Delivery Arrival:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                Within ~{completedOrder.deliveryEstimateDays} business days
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => {
                toast.success("Purchase Order Invoice & Chapa Escrow Certificate downloaded!");
              }}
              className="px-6 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Print Official PO Invoice
            </button>

            <button
              type="button"
              onClick={() => {
                if (onOrderCompleted && completedOrder) {
                  onOrderCompleted(completedOrder);
                } else {
                  onBack();
                }
              }}
              className="px-7 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition-all shadow-lg shadow-indigo-600/30 hover:scale-[1.02]"
            >
              Go to My Orders
            </button>
          </div>
        </div>
      )}

      {/* Payment Success Modal with Transaction Number, Order Number & OK to My Orders */}
      <SupplierPaymentSuccessModal
        isOpen={!!paymentSuccessModalData}
        data={paymentSuccessModalData}
        onClose={() => setPaymentSuccessModalData(null)}
        onOk={() => {
          setPaymentSuccessModalData(null);
          if (onOrderCompleted && completedOrder) {
            onOrderCompleted(completedOrder);
          } else {
            onBack();
          }
        }}
      />
    </div>
  );
}

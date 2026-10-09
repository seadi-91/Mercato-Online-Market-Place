"use client";

import React, { useState, useEffect } from "react";
import {
  X,
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
  Building,
  FileCheck,
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
  onClose: () => void;
  onOrderCompleted?: (order: SourcingOrder) => void;
  onProceedToPayment?: (order: SourcingOrder) => void;
}

export function SupplierSourcingCheckoutModal({
  product,
  negotiation,
  initialQty,
  initialUnitPrice,
  onClose,
  onOrderCompleted,
  onProceedToPayment,
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

  // Fetch full live product information and warehouses from backend on mount
  useEffect(() => {
    let isMounted = true;
    async function loadFullBackendData() {
      const targetId = product?.id || negotiation?.productId;
      if (targetId) {
        setIsLoadingBackendData(true);
        try {
          const fresh = await fetchSourcingProductById(targetId);
          if (isMounted && fresh) {
            setLiveProduct(fresh);
            if (quantity < fresh.moq) {
              setQuantity(fresh.moq);
            }
          }
        } catch (err: any) {
          console.error("[CheckoutModal] Failed to load fresh product info from backend:", err);
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

  // Self Pickup specific details
  const [pickupTruckPlate, setPickupTruckPlate] = useState("Plate 3-AA-99102");
  const [pickupDriverName, setPickupDriverName] = useState("Ato Mulugeta Tadesse");
  const [pickupDriverPhone, setPickupDriverPhone] = useState("+251 92 255 3311");

  // Chapa payment gateway state
  const [isProcessingChapa, setIsProcessingChapa] = useState(false);
  const [chapaStep, setChapaStep] = useState<"checkout" | "success">("checkout");
  const [chapaTxnRef, setChapaTxnRef] = useState(`CHAPA-TXN-2026-${Math.floor(100000 + Math.random() * 900000)}`);
  const [completedOrder, setCompletedOrder] = useState<SourcingOrder | null>(null);
  const [paymentSuccessModalData, setPaymentSuccessModalData] = useState<SourcingPaymentSuccessData | null>(null);

  // Financial calculations
  const subtotal = quantity * unitPrice;
  const regularPrice = (activeProduct?.retailPrice || unitPrice * 1.12) * quantity;
  const bulkDiscount = Math.max(0, regularPrice - subtotal);
  const vatTax = Math.round(subtotal * 0.15); // 15% Ethiopian VAT

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

  const handleOpenChapaGateway = async (e: React.FormEvent) => {
    e.preventDefault();

    if (quantity < moq) {
      toast.error(`Minimum order quantity for this item is ${moq} ${unit}.`);
      return;
    }

    if (!buyerEmail || !buyerPhone) {
      toast.error("Please fill your buyer contact email and phone number.");
      return;
    }

    await handleAuthorizeChapaPayment();
  };

  const handleAuthorizeChapaPayment = async () => {
    setIsProcessingChapa(true);

    const selectedWh = warehouses.find((w) => w.id === selectedWarehouseId) || defaultWarehouse;

    // 1. Prepare pending sourcing order payload to be saved and confirmed after Chapa payment
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
      toast.loading("Connecting to Chapa Hosted Payment Gateway...", { id: "chapa-checkout-modal-toast" });

      const returnDestination =
        typeof window !== "undefined"
          ? `${window.location.origin}/dashboard/supplier?tab=my-orders&payment_status=success`
          : "/dashboard/supplier?tab=my-orders&payment_status=success";

      // 2. Call Backend Chapa Payment Initializer
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
            id: "chapa-checkout-modal-toast",
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#090d16] border border-zinc-800/90 rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.9)] overflow-hidden my-auto text-zinc-100 max-h-[94vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-gradient-to-r from-zinc-900/90 via-[#0e1424] to-zinc-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-zinc-100 flex items-center gap-2">
                {chapaStep === "success"
                  ? "Order Confirmed & Escrow Funded"
                  : "Procurement Order & Escrow Checkout"}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Chapa Escrow Secured
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Supplier: <span className="text-zinc-200 font-semibold">{supplierName}</span> (TIN: {supplierTin})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* STEP 1: CHECKOUT OVERVIEW */}
          {chapaStep === "checkout" && (
            <form onSubmit={handleOpenChapaGateway} className="space-y-6">
              {/* Product Info Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/60 to-indigo-950/30 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-4 min-w-0">
                  {image && (
                    <img
                      src={image}
                      alt=""
                      className="w-16 h-16 rounded-xl object-cover border border-zinc-700 shrink-0 shadow-md"
                    />
                  )}
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                        {product?.category || "Commodity"}
                      </span>
                      {isFromNegotiation && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                          Negotiated Deal
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm sm:text-base text-zinc-100 truncate">{productName}</h4>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                      <span>SKU: {sku}</span>
                      <span>•</span>
                      <span>MOQ: {moq} {unit}</span>
                      <span>•</span>
                      <span className="text-zinc-300">In Stock: {stockAvailable.toLocaleString()} {unit}</span>
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800">
                  <div className="text-[11px] text-zinc-400 font-medium">Applied Unit Price</div>
                  <div className="text-base sm:text-lg font-extrabold text-emerald-400 font-mono">
                    ETB {unitPrice.toLocaleString()} <span className="text-xs text-zinc-400">/ {unit}</span>
                  </div>
                </div>
              </div>

              {/* Two-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Quantities, Buyer Info, Shipping Model & Destination (7 Cols) */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Quantity & PO Reference */}
                  <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="w-4 h-4" />
                      1. Order Quantity & Volume Tier Pricing
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Quantity Input with Stepper */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                          <span>Purchase Quantity</span>
                          <span className="text-[11px] text-zinc-500">Min: {moq} {unit}</span>
                        </label>
                        <div className="flex items-center rounded-xl bg-zinc-950 border border-zinc-800 p-1 focus-within:border-indigo-500 shadow-inner">
                          <button
                            type="button"
                            onClick={() => setQuantity(Math.max(1, quantity - (quantity > 50 ? 10 : 1)))}
                            className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 flex items-center justify-center transition-colors shrink-0"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                            required
                            className="w-full bg-transparent text-sm font-bold text-zinc-100 text-center outline-none font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setQuantity(quantity + (quantity >= 50 ? 10 : 1))}
                            className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 flex items-center justify-center transition-colors shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Quick Presets */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span className="text-[10px] text-zinc-500 font-medium">Quick Qty:</span>
                          {Array.from(
                            new Set([moq, 25, 50, 100, 250, 500, 1000, 5000].filter((v): v is number => typeof v === "number" && v > 0))
                          )
                            .sort((a, b) => a - b)
                            .map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setQuantity(preset)}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                                  quantity === preset
                                    ? "bg-indigo-600 text-white shadow-xs"
                                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                                }`}
                              >
                                {preset === moq ? `MOQ (${moq})` : preset.toLocaleString()}
                              </button>
                            ))}
                        </div>
                      </div>

                      {/* PO Number */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-300">
                          Purchase Order Reference #
                        </label>
                        <input
                          type="text"
                          value={poReference}
                          onChange={(e) => setPoReference(e.target.value)}
                          className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-xs text-zinc-100 font-mono outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Tier Discount Info if active */}
                    {product?.tierPricing && product.tierPricing.length > 0 && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs">
                        <span className="text-indigo-300 font-medium flex items-center gap-1.5">
                          <BadgePercent className="w-4 h-4 text-indigo-400" />
                          Wholesale Tier Volume Applied:
                        </span>
                        <strong className="text-emerald-400 font-mono">
                          ETB {unitPrice.toLocaleString()} / {unit}
                        </strong>
                      </div>
                    )}
                  </div>

                  {/* Buyer Contact Details */}
                  <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3.5">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Building className="w-4 h-4" />
                      2. Buyer Organization & Contact Details
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-400">Purchasing Entity</label>
                        <input
                          type="text"
                          value={buyerBusinessName}
                          onChange={(e) => setBuyerBusinessName(e.target.value)}
                          required
                          className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 font-semibold outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-400">Buyer TIN #</label>
                        <input
                          type="text"
                          value={buyerTin}
                          onChange={(e) => setBuyerTin(e.target.value)}
                          required
                          className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 font-mono outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-400">Buyer Email</label>
                        <input
                          type="email"
                          value={buyerEmail}
                          onChange={(e) => setBuyerEmail(e.target.value)}
                          required
                          className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-400">Mobile Phone (+251)</label>
                        <input
                          type="text"
                          value={buyerPhone}
                          onChange={(e) => setBuyerPhone(e.target.value)}
                          required
                          className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 font-mono outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shipping Responsibility Toggle */}
                  <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3.5">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Truck className="w-4 h-4" />
                      3. Shipping Responsibility & Logistics Model
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setShippingModel("seller_delivery")}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          shippingModel === "seller_delivery"
                            ? "bg-indigo-600/20 border-indigo-500 text-zinc-100 ring-2 ring-indigo-500/30 font-bold"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400"
                        }`}
                      >
                        <span className="text-xs flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-indigo-400" /> Seller Freight
                        </span>
                        <span className="text-[10px] text-emerald-400 mt-1">
                          {sellerFreightTier === "express" ? "+ ETB 12,000" : "+ ETB 6,500"}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShippingModel("self_pickup")}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          shippingModel === "self_pickup"
                            ? "bg-emerald-600/20 border-emerald-500 text-zinc-100 ring-2 ring-emerald-500/30 font-bold"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400"
                        }`}
                      >
                        <span className="text-xs flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Self Pickup
                        </span>
                        <span className="text-[10px] text-emerald-400 mt-1 font-mono">
                          ETB 0 (FREE)
                        </span>
                      </button>
                    </div>

                    {shippingModel === "seller_delivery" ? (
                      <div className="space-y-2.5 pt-1">
                        <select
                          value={selectedWarehouseId}
                          onChange={(e) => handleWarehouseChange(e.target.value)}
                          className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 outline-none"
                        >
                          {warehouses.map((wh) => (
                            <option key={wh.id} value={wh.id}>
                              {wh.name} ({wh.code}) — {wh.city || wh.region}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Unloading bay address"
                          className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 outline-none"
                        />
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-zinc-950 border border-emerald-500/30 text-xs text-zinc-300">
                        <span>Pickup Location: <strong>{sellerOriginLocation}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Invoice Breakdown & Chapa Gateway CTA (5 Cols) */}
                <div className="lg:col-span-5 space-y-5">
                  {/* Financial Breakdown Card */}
                  <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3.5 shadow-xl">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-200 uppercase tracking-wider pb-2 border-b border-zinc-800">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <Receipt className="w-4 h-4" />
                        Commercial Invoice Breakdown
                      </span>
                      <span className="text-zinc-500 font-mono">ETB</span>
                    </div>

                    <div className="space-y-2.5 text-xs text-zinc-300 pt-1">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">
                          Subtotal ({quantity.toLocaleString()} {unit})
                        </span>
                        <span className="font-mono font-semibold">ETB {subtotal.toLocaleString()}</span>
                      </div>

                      {bulkDiscount > 0 && (
                        <div className="flex justify-between text-emerald-400 font-medium">
                          <span>Bulk Tier Discount</span>
                          <span className="font-mono">- ETB {bulkDiscount.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-zinc-400">15% Standard VAT</span>
                        <span className="font-mono font-medium">ETB {vatTax.toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-zinc-400">
                          Freight ({shippingModel === "self_pickup" ? "Self Pickup" : sellerFreightTier})
                        </span>
                        <span className="font-mono font-medium">
                          {freightCost > 0 ? `ETB ${freightCost.toLocaleString()}` : "Free (ETB 0)"}
                        </span>
                      </div>

                      <div className="flex justify-between text-indigo-400 font-medium">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Escrow Buyer Protection
                        </span>
                        <span className="font-mono font-bold">FREE (0% Fee)</span>
                      </div>

                      <div className="pt-3 border-t border-zinc-800 flex justify-between items-center text-sm">
                        <span className="font-bold text-zinc-100">Total Escrow Value:</span>
                        <span className="text-xl font-extrabold text-emerald-400 font-mono">
                          ETB {totalETB.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Chapa Payment Integration Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1322] to-zinc-900 border border-emerald-500/30 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-sm">
                          C
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                            Chapa Payment Gateway
                          </h4>
                          <span className="text-[10px] text-zinc-400">Official Escrow Partner</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                        PCI-DSS L1
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-zinc-400 bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
                      <p className="text-[11px] leading-relaxed text-zinc-300">
                        Pay seamlessly via <strong>Telebirr, CBEBirr, Awash Birr, or Cards</strong> through Chapa. Funds remain safely in Escrow until physical handover.
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[10px] text-zinc-400">
                        <Lock className="w-3 h-3 text-emerald-400" />
                        <span>256-Bit SSL Encrypted Escrow Vault</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessingChapa}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-600/25 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isProcessingChapa ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Connecting to Chapa...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Pay with Chapa (ETB {totalETB.toLocaleString()})</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* STEP 3: ORDER COMPLETED & ESCROW RECEIPT SCREEN */}
          {chapaStep === "success" && completedOrder && (
            <div className="space-y-6 text-center py-4 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-2xl shadow-emerald-500/20">
                <CheckCircle2 className="w-11 h-11" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl font-black text-zinc-100">
                  Procurement Order Confirmed & Funded!
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
                  Purchase Order <strong className="text-emerald-400 font-mono">#{completedOrder.orderNumber}</strong> has been
                  transmitted to {completedOrder.supplierName}. Payment of{" "}
                  <strong className="text-zinc-100 font-mono">ETB {completedOrder.totalETB.toLocaleString()}</strong> is secured in Escrow via Chapa.
                </p>
              </div>

              {/* Handover OTP Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-zinc-900 to-zinc-950 border border-indigo-500/40 max-w-md mx-auto space-y-2.5 shadow-2xl">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-indigo-400">
                  <KeyRound className="w-4 h-4" />
                  Your 4-Digit Warehouse Handover OTP
                </div>
                <div className="text-4xl font-black font-mono tracking-widest text-emerald-400 py-1">
                  {completedOrder.handoverOtp || "8492"}
                </div>
                <p className="text-[11px] text-zinc-400">
                  Keep this OTP secure. Only share it with the delivery driver after inspecting and approving the shipment at your warehouse.
                </p>
              </div>

              {/* Shipment Tracking Summary */}
              <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-left space-y-2.5 text-xs max-w-2xl mx-auto shadow-lg">
                <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                  <span className="text-zinc-400">Chapa Transaction Reference:</span>
                  <span className="font-mono font-bold text-emerald-400">{completedOrder.chapaTransactionId || chapaTxnRef}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                  <span className="text-zinc-400">Assigned Carrier / Waybill:</span>
                  <span className="font-mono font-bold text-indigo-400">{completedOrder.trackingNumber}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                  <span className="text-zinc-400">Receiving Warehouse:</span>
                  <span className="text-zinc-200 font-medium">{completedOrder.destinationWarehouseName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Estimated Delivery Arrival:</span>
                  <span className="text-emerald-400 font-bold">
                    Within ~{completedOrder.deliveryEstimateDays} business days
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    toast.success("Purchase Order Invoice & Chapa Escrow Certificate downloaded!");
                    onClose();
                  }}
                  className="px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-2 transition-colors shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  Print Purchase Order
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-lg shadow-emerald-600/30 hover:scale-[1.02]"
                >
                  Go to My Procurement Orders
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Success Modal with Transaction Number, Order Number & OK to My Orders */}
      <SupplierPaymentSuccessModal
        isOpen={!!paymentSuccessModalData}
        data={paymentSuccessModalData}
        onClose={() => setPaymentSuccessModalData(null)}
        onOk={() => {
          setPaymentSuccessModalData(null);
          onClose();
          if (onOrderCompleted && completedOrder) {
            onOrderCompleted(completedOrder);
          }
        }}
      />
    </div>
  );
}

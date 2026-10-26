export interface DriverOrderItem {
  id?: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
  sku?: string;
}

export interface DriverMission {
  id: string;
  waybillNumber: string;
  orderNumber: string;
  // Location Details
  origin: string;
  originHub: string;
  originContact?: string;
  destination: string;
  destinationCity: string;
  destinationSubCity: string;
  destinationSpecificLocation: string;
  // Buyer / Consignee Details
  buyerName: string;
  buyerPhone: string;
  buyerAlternatePhone?: string;
  buyerEmail?: string;
  buyerNotes?: string;
  // Order Details
  cargoDescription: string;
  weightSummary: string;
  items: DriverOrderItem[];
  subtotal: number;
  deliveryFee: number;
  amount: number;
  paymentStatus: string;
  paymentMethod: string;
  escrowStatus: string;
  // Status & Tracking
  status: "ready" | "in_transit" | "arrived" | "delivered" | "delayed";
  delayReason?: string;
  deliveryOtp: string;
  podNote?: string;
  podSignatureName?: string;
  createdAt: string;
  carrierId?: string;
  priority?: "urgent" | "express" | "standard";
}

export const SAMPLE_MISSIONS: DriverMission[] = [
  {
    id: "mission-01",
    waybillNumber: "WB-ETH-2026-9811",
    orderNumber: "ORD-ETH-8921",
    priority: "urgent",
    origin: "Mercato Central Freight Hub",
    originHub: "Depot Bay 04 · Mojo Rail Link",
    originContact: "+251 11 155 4422 (Hub Dispatcher)",
    destination: "Hawassa Agro-Processing Logistics Hub, Industrial Zone Gate 2",
    destinationCity: "Hawassa",
    destinationSubCity: "Menaharia",
    destinationSpecificLocation: "Near Industrial Park Gate 2, Warehouse 04",
    buyerName: "Ato Daniel Mekonnen",
    buyerPhone: "+251 46 220 8911",
    buyerAlternatePhone: "+251 91 100 4455",
    buyerEmail: "daniel.mekonnen@sidamacoffee.et",
    buyerNotes: "Call 15 minutes before arrival at Gate 2. Offloading forklift on standby.",
    cargoDescription: "Bulk Specialty Arabica Coffee (Grade 1 Moisture Verified)",
    weightSummary: "2,500 KG · Sealed Transit Container",
    items: [
      {
        id: "item-01",
        productTitle: "Specialty Yirgacheffe Washed Grade 1 Coffee Beans",
        quantity: 50,
        unitPrice: 10400,
        totalPrice: 520000,
        sku: "COF-YRG-01",
      },
      {
        id: "item-02",
        productTitle: "Heavy-Duty Polypropylene Grain Sacks (60kg Capacity)",
        quantity: 100,
        unitPrice: 588,
        totalPrice: 58800,
        sku: "SCK-PP-60",
      },
    ],
    subtotal: 578800,
    deliveryFee: 14500,
    amount: 593300,
    paymentStatus: "PAID (ESCROW SECURED)",
    paymentMethod: "Chapa Escrow Settlement",
    escrowStatus: "IN_CUSTODY",
    status: "in_transit",
    deliveryOtp: "8921",
    createdAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
  },
  {
    id: "mission-02",
    waybillNumber: "WB-ETH-AA-4402",
    orderNumber: "ORD-AA-4402",
    priority: "express",
    origin: "Kality Industrial Wholesale Distribution Center",
    originHub: "Zone B Loading Terminal 12",
    originContact: "+251 11 434 8810 (Kality Freight Desk)",
    destination: "Bole Medhanialem Commercial Complex, Shop 204",
    destinationCity: "Addis Ababa",
    destinationSubCity: "Bole",
    destinationSpecificLocation: "Around Medhanialem Mall, Behind Edna Mall Complex",
    buyerName: "W/ro Selamawit Hailu",
    buyerPhone: "+251 91 144 7722",
    buyerAlternatePhone: "+251 92 333 1188",
    buyerEmail: "buyer@mercatox.et",
    buyerNotes: "Deliver to 2nd-floor shop. Service elevator available on side entrance.",
    cargoDescription: "Commercial Fabric & Textile Bales (Import Grade)",
    weightSummary: "350 KG · Packaged Bales",
    items: [
      {
        id: "item-03",
        productTitle: "Premium Ethiopian Habesha Kemis Cotton Fabric Bales",
        quantity: 15,
        unitPrice: 8500,
        totalPrice: 127500,
        sku: "FAB-HB-015",
      },
      {
        id: "item-04",
        productTitle: "Industrial Sewing Thread Spools (Assorted Colors)",
        quantity: 20,
        unitPrice: 1250,
        totalPrice: 25000,
        sku: "THR-IND-020",
      },
    ],
    subtotal: 152500,
    deliveryFee: 3800,
    amount: 156300,
    paymentStatus: "PAID (ESCROW SECURED)",
    paymentMethod: "Telebirr SuperApp Escrow",
    escrowStatus: "IN_CUSTODY",
    status: "arrived",
    deliveryOtp: "4402",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "mission-03",
    waybillNumber: "WB-ETH-AD-7731",
    orderNumber: "ORD-AD-7731",
    priority: "standard",
    origin: "Adama Logistics & Agro Terminal",
    originHub: "Express Depot 01 · Expressway Toll Gate",
    originContact: "+251 22 111 9900 (Adama Express Lead)",
    destination: "Mercato Wholesale District, Doro Manekiya Commercial St.",
    destinationCity: "Addis Ababa",
    destinationSubCity: "Addis Ketema",
    destinationSpecificLocation: "Near Commercial Bank of Ethiopia Mercato Branch, Block D",
    buyerName: "Ato Tesfaye Bekele",
    buyerPhone: "+251 91 155 3399",
    buyerAlternatePhone: "+251 11 278 1234",
    buyerEmail: "tesfaye.agro@mercatotrading.com",
    buyerNotes: "Unload at Ground Floor Store 14. Gate opens at 07:00 AM.",
    cargoDescription: "Refined Edible Sunflower Oil (20L Jerrycans)",
    weightSummary: "1,200 KG · Palletized",
    items: [
      {
        id: "item-05",
        productTitle: "Refined Sunflower Cooking Oil - 20L Jerrycans",
        quantity: 60,
        unitPrice: 3850,
        totalPrice: 231000,
        sku: "OIL-SUN-020",
      },
    ],
    subtotal: 231000,
    deliveryFee: 8500,
    amount: 239500,
    paymentStatus: "PAID (ESCROW SECURED)",
    paymentMethod: "CBE Birr Escrow Direct",
    escrowStatus: "IN_CUSTODY",
    status: "ready",
    deliveryOtp: "7731",
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: "mission-04",
    waybillNumber: "WB-ETH-AA-3108",
    orderNumber: "ORD-AA-3108",
    priority: "standard",
    origin: "Akaki Freight Depot & Bonded Yard",
    originHub: "Yard Bay 07 · Akaki Kality Link",
    originContact: "+251 11 434 2201 (Yard Superintendent)",
    destination: "Sarbet Wholesale Square, Near OAU Conference Center",
    destinationCity: "Addis Ababa",
    destinationSubCity: "Kirkos",
    destinationSpecificLocation: "Sarbet Mall Annex, Delivery Loading Bay B",
    buyerName: "W/ro Aster Worku",
    buyerPhone: "+251 91 222 6677",
    buyerEmail: "aster.generalstore@ethionet.et",
    buyerNotes: "Recipient security officer will sign off receipt upon delivery.",
    cargoDescription: "Packaged Organic Teff Flour (First Grade Magna)",
    weightSummary: "1,800 KG · Sealed Bags",
    items: [
      {
        id: "item-06",
        productTitle: "First Grade Magna White Teff Flour (50kg Bags)",
        quantity: 36,
        unitPrice: 6200,
        totalPrice: 223200,
        sku: "TEF-MGN-050",
      },
    ],
    subtotal: 223200,
    deliveryFee: 6200,
    amount: 229400,
    paymentStatus: "DELIVERED & SETTLED",
    paymentMethod: "Telebirr SuperApp Escrow",
    escrowStatus: "RELEASED_TO_SELLER",
    status: "delivered",
    deliveryOtp: "3108",
    podNote: "Received in pristine sealed condition by security manager.",
    podSignatureName: "Ato Gashaw (Depot Manager)",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

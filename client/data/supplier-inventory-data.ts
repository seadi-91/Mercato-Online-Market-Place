export interface B2BInventoryItem {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  grade: string;
  origin: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  totalStock: number;
  reservedStock: number;
  damagedStock: number;
  availableStock: number;
  incomingStock: number;
  minimumLevel: number;
  maximumLevel: number;
  primaryWarehouse: string;
  status: "in_stock" | "low_stock" | "out_of_stock" | "reserved" | "overstock";
  images: string[];
  batchNumber: string;
  lastRestocked: string;
  supplier: string;
  warehouseDistribution: {
    warehouseId: string;
    warehouseName: string;
    total: number;
    available: number;
    reserved: number;
    damaged: number;
  }[];
}

export interface StockReservation {
  id: string;
  orderNumber: string;
  buyerCompany: string;
  buyerContact: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  reservedDate: string;
  expiryDate: string;
  status: "reserved" | "confirmed" | "released" | "converted_to_shipment";
  escrowAmount: number;
  warehouse: string;
}

export interface DamagedStockRecord {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  warehouse: string;
  quantity: number;
  unit: string;
  reason: string;
  date: string;
  reportedBy: string;
  status: "reported" | "approved" | "written_off" | "restored";
  lossValueETB: number;
}

export interface StockAdjustmentRecord {
  id: string;
  adjustmentNumber: string;
  productId: string;
  productName: string;
  warehouse: string;
  systemQty: number;
  physicalQty: number;
  difference: number;
  unit: string;
  reason: string;
  notes: string;
  date: string;
  auditor: string;
  status: "approved" | "pending_review";
}

export interface InventoryAlertItem {
  id: string;
  type: "low_stock" | "out_of_stock" | "overstock" | "expiring_soon" | "transfer_delayed" | "audit_mismatch";
  severity: "critical" | "warning" | "info";
  productName: string;
  sku?: string;
  warehouse: string;
  message: string;
  currentLevel: string;
  targetLevel: string;
  timestamp: string;
  actionLabel: string;
  read: boolean;
}

export interface WarehouseDetail {
  id: string;
  name: string;
  code: string;
  location: string;
  city: string;
  region: string;
  address: string;
  manager: string;
  phone: string;
  totalProducts: number;
  totalStock: number;
  inventoryValue: number;
  capacity: number;
  capacityUsedPercent: number;
  status: "operational" | "near_capacity" | "maintenance";
}

// Initial Comprehensive B2B Inventory Items
export const initialB2BInventory: B2BInventoryItem[] = [
  {
    id: "prod-1",
    name: "Yirgacheffe Grade 1 Speciality Washed Arabica Coffee",
    sku: "CAF-YIR-001",
    barcode: "600129841021",
    category: "Specialty Coffee & Spices",
    grade: "Grade 1 (SCA 88.5)",
    origin: "Gedeo Zone, Yirgacheffe",
    unit: "Quintal",
    costPrice: 42000,
    sellingPrice: 48000,
    totalStock: 500,
    reservedStock: 100,
    damagedStock: 10,
    availableStock: 390,
    incomingStock: 200,
    minimumLevel: 50,
    maximumLevel: 1000,
    primaryWarehouse: "Addis Ababa Central Logistics Hub (WH-AA)",
    status: "in_stock",
    images: ["https://images.unsplash.com/photo-1559525839-8f81ae7d3b5b?auto=format&fit=crop&w=600&q=80"],
    batchNumber: "ETH-YRG-2026-B1",
    lastRestocked: "2026-09-28",
    supplier: "Abyssinia Agri-Commodities PLC",
    warehouseDistribution: [
      { warehouseId: "wh-aa", warehouseName: "Addis Ababa Central Hub", total: 350, available: 270, reserved: 75, damaged: 5 },
      { warehouseId: "wh-hw", warehouseName: "Hawassa Agro Depot", total: 100, available: 80, reserved: 15, damaged: 5 },
      { warehouseId: "wh-dd", warehouseName: "Dire Dawa Logistics Hub", total: 50, available: 40, reserved: 10, damaged: 0 },
    ],
  },
  {
    id: "prod-2",
    name: "Magna White Teff Super Premium Grain",
    sku: "TEF-MAG-101",
    barcode: "600129841022",
    category: "Grains, Cereals & Teff",
    grade: "Magna (First Class White)",
    origin: "Ada'a Bishoftu, Oromia",
    unit: "Quintal",
    costPrice: 9200,
    sellingPrice: 11000,
    totalStock: 850,
    reservedStock: 120,
    damagedStock: 15,
    availableStock: 715,
    incomingStock: 300,
    minimumLevel: 100,
    maximumLevel: 1500,
    primaryWarehouse: "Addis Ababa Central Logistics Hub (WH-AA)",
    status: "in_stock",
    images: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80"],
    batchNumber: "ETH-TEF-2026-B4",
    lastRestocked: "2026-10-01",
    supplier: "Abyssinia Agri-Commodities PLC",
    warehouseDistribution: [
      { warehouseId: "wh-aa", warehouseName: "Addis Ababa Central Hub", total: 600, available: 510, reserved: 80, damaged: 10 },
      { warehouseId: "wh-hw", warehouseName: "Hawassa Agro Depot", total: 150, available: 125, reserved: 20, damaged: 5 },
      { warehouseId: "wh-mj", warehouseName: "Mojo Dry Port Depot", total: 100, available: 80, reserved: 20, damaged: 0 },
    ],
  },
  {
    id: "prod-3",
    name: "Humera Grade A Whitish Sesame Seeds",
    sku: "SES-HUM-301",
    barcode: "600129841023",
    category: "Oilseeds & Pulses",
    grade: "Grade A Whitish (>99% Purity)",
    origin: "Tigray / Amhara Borderlands",
    unit: "Quintal",
    costPrice: 22500,
    sellingPrice: 26000,
    totalStock: 310,
    reservedStock: 45,
    damagedStock: 5,
    availableStock: 260,
    incomingStock: 150,
    minimumLevel: 50,
    maximumLevel: 800,
    primaryWarehouse: "Hawassa Agro-Processing Logistics Depot (WH-HW)",
    status: "in_stock",
    images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80"],
    batchNumber: "ETH-SES-2026-B8",
    lastRestocked: "2026-09-22",
    supplier: "Abyssinia Agri-Commodities PLC",
    warehouseDistribution: [
      { warehouseId: "wh-hw", warehouseName: "Hawassa Agro Depot", total: 200, available: 165, reserved: 30, damaged: 5 },
      { warehouseId: "wh-dd", warehouseName: "Dire Dawa Logistics Hub", total: 80, available: 65, reserved: 15, damaged: 0 },
      { warehouseId: "wh-aa", warehouseName: "Addis Ababa Central Hub", total: 30, available: 30, reserved: 0, damaged: 0 },
    ],
  },
  {
    id: "prod-4",
    name: "Red Kidney Export Standard Beans",
    sku: "BEA-RKB-401",
    barcode: "600129841024",
    category: "Oilseeds & Pulses",
    grade: "Export Grade 1",
    origin: "Arsi / Bale Highlands",
    unit: "Quintal",
    costPrice: 12000,
    sellingPrice: 14500,
    totalStock: 45,
    reservedStock: 20,
    damagedStock: 5,
    availableStock: 20,
    incomingStock: 100,
    minimumLevel: 50,
    maximumLevel: 500,
    primaryWarehouse: "Hawassa Agro-Processing Logistics Depot (WH-HW)",
    status: "low_stock",
    images: ["https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=600&q=80"],
    batchNumber: "ETH-RKB-2026-B2",
    lastRestocked: "2026-09-10",
    supplier: "Abyssinia Agri-Commodities PLC",
    warehouseDistribution: [
      { warehouseId: "wh-hw", warehouseName: "Hawassa Agro Depot", total: 35, available: 15, reserved: 15, damaged: 5 },
      { warehouseId: "wh-aa", warehouseName: "Addis Ababa Central Hub", total: 10, available: 5, reserved: 5, damaged: 0 },
    ],
  },
  {
    id: "prod-5",
    name: "Muger Ordinary Portland Cement 42.5R",
    sku: "CEM-MUG-801",
    barcode: "600129841025",
    category: "Construction & Industrial Materials",
    grade: "Grade 42.5R High Early Strength",
    origin: "Muger, Oromia",
    unit: "Bags",
    costPrice: 1050,
    sellingPrice: 1280,
    totalStock: 2840,
    reservedStock: 700,
    damagedStock: 40,
    availableStock: 2100,
    incomingStock: 1000,
    minimumLevel: 500,
    maximumLevel: 5000,
    primaryWarehouse: "Addis Ababa Central Logistics Hub (WH-AA)",
    status: "in_stock",
    images: ["https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80"],
    batchNumber: "ETH-CEM-2026-B19",
    lastRestocked: "2026-10-02",
    supplier: "Abyssinia Agri-Commodities PLC",
    warehouseDistribution: [
      { warehouseId: "wh-aa", warehouseName: "Addis Ababa Central Hub", total: 2200, available: 1600, reserved: 570, damaged: 30 },
      { warehouseId: "wh-mj", warehouseName: "Mojo Dry Port Depot", total: 640, available: 500, reserved: 130, damaged: 10 },
    ],
  },
  {
    id: "prod-6",
    name: "Deformed High-Tensile Steel Rebar 16mm (Fe 500)",
    sku: "STL-RBR-601",
    barcode: "600129841026",
    category: "Construction & Industrial Materials",
    grade: "Fe 500 Grade Certified",
    origin: "Dukem Industrial Park",
    unit: "Tons",
    costPrice: 98000,
    sellingPrice: 115000,
    totalStock: 180,
    reservedStock: 45,
    damagedStock: 2,
    availableStock: 133,
    incomingStock: 60,
    minimumLevel: 25,
    maximumLevel: 400,
    primaryWarehouse: "Dire Dawa Free Trade Logistics Depot (WH-DD)",
    status: "in_stock",
    images: ["https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80"],
    batchNumber: "ETH-STL-2026-B11",
    lastRestocked: "2026-09-15",
    supplier: "Abyssinia Agri-Commodities PLC",
    warehouseDistribution: [
      { warehouseId: "wh-dd", warehouseName: "Dire Dawa Logistics Hub", total: 140, available: 100, reserved: 38, damaged: 2 },
      { warehouseId: "wh-mj", warehouseName: "Mojo Dry Port Depot", total: 40, available: 33, reserved: 7, damaged: 0 },
    ],
  },
  {
    id: "prod-7",
    name: "Red Harar Sesame Seeds Export Grade",
    sku: "SES-HAR-302",
    barcode: "600129841027",
    category: "Oilseeds & Pulses",
    grade: "Grade 1 Export Cleaned",
    origin: "East Hararghe Highlands",
    unit: "Quintal",
    costPrice: 20000,
    sellingPrice: 24000,
    totalStock: 165,
    reservedStock: 15,
    damagedStock: 0,
    availableStock: 150,
    incomingStock: 80,
    minimumLevel: 40,
    maximumLevel: 600,
    primaryWarehouse: "Dire Dawa Free Trade Logistics Depot (WH-DD)",
    status: "in_stock",
    images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80"],
    batchNumber: "ETH-HAR-2026-B5",
    lastRestocked: "2026-09-18",
    supplier: "Abyssinia Agri-Commodities PLC",
    warehouseDistribution: [
      { warehouseId: "wh-dd", warehouseName: "Dire Dawa Logistics Hub", total: 120, available: 110, reserved: 10, damaged: 0 },
      { warehouseId: "wh-hw", warehouseName: "Hawassa Agro Depot", total: 45, available: 40, reserved: 5, damaged: 0 },
    ],
  },
  {
    id: "prod-8",
    name: "Meki Greenhouse Fresh Ripe Tomatoes",
    sku: "VEG-TOM-501",
    barcode: "600129841028",
    category: "Agricultural Commodities",
    grade: "First Class Commercial",
    origin: "Meki Rift Valley Greenhouses",
    unit: "Box (25KG)",
    costPrice: 950,
    sellingPrice: 1350,
    totalStock: 0,
    reservedStock: 0,
    damagedStock: 0,
    availableStock: 0,
    incomingStock: 450,
    minimumLevel: 50,
    maximumLevel: 1000,
    primaryWarehouse: "Addis Ababa Central Logistics Hub (WH-AA)",
    status: "out_of_stock",
    images: ["https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=600&q=80"],
    batchNumber: "ETH-TOM-2026-B9",
    lastRestocked: "2026-09-01",
    supplier: "Abyssinia Agri-Commodities PLC",
    warehouseDistribution: [
      { warehouseId: "wh-aa", warehouseName: "Addis Ababa Central Hub", total: 0, available: 0, reserved: 0, damaged: 0 },
    ],
  },
  {
    id: "prod-9",
    name: "Premium Durum Wheat Grains",
    sku: "WHT-DUR-202",
    barcode: "600129841029",
    category: "Grains, Cereals & Teff",
    grade: "Grade 1 Milling Quality",
    origin: "Bale Agro-Plains",
    unit: "Quintal",
    costPrice: 5800,
    sellingPrice: 7200,
    totalStock: 1250,
    reservedStock: 50,
    damagedStock: 10,
    availableStock: 1190,
    incomingStock: 500,
    minimumLevel: 150,
    maximumLevel: 1000,
    primaryWarehouse: "Addis Ababa Central Logistics Hub (WH-AA)",
    status: "overstock",
    images: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80"],
    batchNumber: "ETH-WHT-2026-B3",
    lastRestocked: "2026-10-03",
    supplier: "Abyssinia Agri-Commodities PLC",
    warehouseDistribution: [
      { warehouseId: "wh-aa", warehouseName: "Addis Ababa Central Hub", total: 800, available: 760, reserved: 35, damaged: 5 },
      { warehouseId: "wh-mj", warehouseName: "Mojo Dry Port Depot", total: 450, available: 430, reserved: 15, damaged: 5 },
    ],
  },
];

// Initial B2B Reservations (Orders & Escrow)
export const initialReservations: StockReservation[] = [
  {
    id: "res-01",
    orderNumber: "ORD-ETH-8921",
    buyerCompany: "Midroc Construction Ethiopia PLC",
    buyerContact: "Dawit Bekele (+251 91 144 8899)",
    productId: "prod-6",
    productName: "Deformed High-Tensile Steel Rebar 16mm",
    quantity: 45,
    unit: "Tons",
    reservedDate: "2026-10-02",
    expiryDate: "2026-10-09",
    status: "confirmed",
    escrowAmount: 5175000,
    warehouse: "Dire Dawa Logistics Hub (WH-DD)",
  },
  {
    id: "res-02",
    orderNumber: "ORD-ETH-8840",
    buyerCompany: "Addis Continental Hotels Group",
    buyerContact: "Meron Tadesse (+251 91 123 4567)",
    productId: "prod-1",
    productName: "Yirgacheffe Grade 1 Speciality Washed Coffee",
    quantity: 75,
    unit: "Quintal",
    reservedDate: "2026-10-01",
    expiryDate: "2026-10-08",
    status: "reserved",
    escrowAmount: 3600000,
    warehouse: "Addis Ababa Central Logistics Hub (WH-AA)",
  },
  {
    id: "res-03",
    orderNumber: "ORD-ETH-8812",
    buyerCompany: "Hawassa Textile & Apparel Mill",
    buyerContact: "Fikadu Assefa (+251 92 987 6543)",
    productId: "prod-5",
    productName: "Muger Ordinary Portland Cement 42.5R",
    quantity: 700,
    unit: "Bags",
    reservedDate: "2026-09-28",
    expiryDate: "2026-10-05",
    status: "converted_to_shipment",
    escrowAmount: 896000,
    warehouse: "Addis Ababa Central Logistics Hub (WH-AA)",
  },
  {
    id: "res-04",
    orderNumber: "ORD-ETH-8790",
    buyerCompany: "Oromia Seeds & Grain Distributors",
    buyerContact: "Henok Mengistu (+251 91 345 6789)",
    productId: "prod-4",
    productName: "Red Kidney Export Standard Beans",
    quantity: 20,
    unit: "Quintal",
    reservedDate: "2026-10-04",
    expiryDate: "2026-10-11",
    status: "reserved",
    escrowAmount: 290000,
    warehouse: "Hawassa Agro Depot (WH-HW)",
  },
  {
    id: "res-05",
    orderNumber: "ORD-ETH-8650",
    buyerCompany: "Sheba Food & Milling Industries",
    buyerContact: "Yohannes Zeleke (+251 93 456 7890)",
    productId: "prod-2",
    productName: "Magna White Teff Super Premium Grain",
    quantity: 120,
    unit: "Quintal",
    reservedDate: "2026-09-29",
    expiryDate: "2026-10-06",
    status: "confirmed",
    escrowAmount: 1320000,
    warehouse: "Addis Ababa Central Logistics Hub (WH-AA)",
  },
];

// Initial Damaged Stock Records
export const initialDamagedStock: DamagedStockRecord[] = [
  {
    id: "dmg-01",
    productId: "prod-2",
    productName: "Magna White Teff Super Premium Grain",
    sku: "TEF-MAG-101",
    warehouse: "Addis Ababa Central Logistics Hub (WH-AA)",
    quantity: 15,
    unit: "Quintal",
    reason: "Moisture leakage during heavy downpour transport near Bishoftu toll gate",
    date: "2026-10-02",
    reportedBy: "Kassahun T. (Inbound Receiving Inspector)",
    status: "approved",
    lossValueETB: 138000,
  },
  {
    id: "dmg-02",
    productId: "prod-1",
    productName: "Yirgacheffe Grade 1 Speciality Washed Coffee",
    sku: "CAF-YIR-001",
    warehouse: "Hawassa Agro-Processing Logistics Depot (WH-HW)",
    quantity: 10,
    unit: "Quintal",
    reason: "Outer burlap bag torn by forklift tine puncture; inner GrainPro liner compromised",
    date: "2026-09-27",
    reportedBy: "Birtukan D. (Depot Yard Lead)",
    status: "written_off",
    lossValueETB: 420000,
  },
  {
    id: "dmg-03",
    productId: "prod-5",
    productName: "Muger Ordinary Portland Cement 42.5R",
    sku: "CEM-MUG-801",
    warehouse: "Addis Ababa Central Logistics Hub (WH-AA)",
    quantity: 40,
    unit: "Bags",
    reason: "Hardened blocks caused by high humidity in outdoor auxiliary bay 4",
    date: "2026-09-29",
    reportedBy: "Abebe W. (Warehouse Manager)",
    status: "reported",
    lossValueETB: 42000,
  },
  {
    id: "dmg-04",
    productId: "prod-4",
    productName: "Red Kidney Export Standard Beans",
    sku: "BEA-RKB-401",
    warehouse: "Hawassa Agro-Processing Logistics Depot (WH-HW)",
    quantity: 5,
    unit: "Quintal",
    reason: "Insect infestation discovered during routine 14-day silo trap inspection",
    date: "2026-10-03",
    reportedBy: "Dawit G. (QA Officer)",
    status: "reported",
    lossValueETB: 60000,
  },
];

// Initial Stock Adjustments Audit
export const initialAdjustments: StockAdjustmentRecord[] = [
  {
    id: "adj-01",
    adjustmentNumber: "ADJ-2026-092",
    productId: "prod-1",
    productName: "Yirgacheffe Grade 1 Speciality Washed Coffee",
    warehouse: "Addis Ababa Central Logistics Hub (WH-AA)",
    systemQty: 504,
    physicalQty: 500,
    difference: -4,
    unit: "Quintal",
    reason: "Q3 physical cycle count variance due to natural moisture loss drying in parchment",
    notes: "Approved by Head of Logistics following duplicate weighbridge verification.",
    date: "2026-10-01",
    auditor: "Internal Audit Team (Ephrem Negash)",
    status: "approved",
  },
  {
    id: "adj-02",
    adjustmentNumber: "ADJ-2026-088",
    productId: "prod-2",
    productName: "Magna White Teff Super Premium Grain",
    warehouse: "Addis Ababa Central Logistics Hub (WH-AA)",
    systemQty: 840,
    physicalQty: 850,
    difference: 10,
    unit: "Quintal",
    reason: "Supplier cooperative delivery reconciliation surplus from Ada'a union lot #401",
    notes: "Delivery note DN-9844 matched GRN record.",
    date: "2026-09-28",
    auditor: "Receiving Officer (Tadesse M.)",
    status: "approved",
  },
  {
    id: "adj-03",
    adjustmentNumber: "ADJ-2026-085",
    productId: "prod-6",
    productName: "Deformed High-Tensile Steel Rebar 16mm",
    warehouse: "Dire Dawa Free Trade Logistics Depot (WH-DD)",
    systemQty: 182,
    physicalQty: 180,
    difference: -2,
    unit: "Tons",
    reason: "Physical bundle scale recalibration adjustment at Djibouti railway dry port",
    notes: "Requires formal sign-off from Regional Controller.",
    date: "2026-09-22",
    auditor: "Jemal Mohammed (Dire Dawa Yard Lead)",
    status: "pending_review",
  },
];

// Initial Warehouses
export const initialWarehousesDetail: WarehouseDetail[] = [
  {
    id: "wh-aa",
    name: "Addis Ababa Central Logistics Hub",
    code: "WH-AA",
    location: "Kality Industrial Zone, Addis Ababa",
    city: "Addis Ababa",
    region: "Addis Ababa City Admin",
    address: "Kality Industrial Zone, Gate 3, Ring Road Expressway",
    manager: "Abebe Worku",
    phone: "+251 11 434 2210",
    totalProducts: 6,
    totalStock: 3990,
    inventoryValue: 124500000,
    capacity: 5000,
    capacityUsedPercent: 79.8,
    status: "operational",
  },
  {
    id: "wh-hw",
    name: "Hawassa Agro-Processing Logistics Depot",
    code: "WH-HW",
    location: "Hawassa Industrial Park Perimeter",
    city: "Hawassa",
    region: "Sidama Regional State",
    address: "Hawassa Industrial Park Perimeter, Shed C-4",
    manager: "Birtukan Dagne",
    phone: "+251 46 220 8911",
    totalProducts: 4,
    totalStock: 390,
    inventoryValue: 46200000,
    capacity: 1200,
    capacityUsedPercent: 32.5,
    status: "operational",
  },
  {
    id: "wh-dd",
    name: "Dire Dawa Free Trade Logistics Depot",
    code: "WH-DD",
    location: "Djibouti Railway Dry Port Zone",
    city: "Dire Dawa",
    region: "Dire Dawa Administration",
    address: "Djibouti Railway Dry Port Zone, Depot 9",
    manager: "Jemal Mohammed",
    phone: "+251 25 111 4455",
    totalProducts: 3,
    totalStock: 340,
    inventoryValue: 62400000,
    capacity: 800,
    capacityUsedPercent: 42.5,
    status: "operational",
  },
  {
    id: "wh-mj",
    name: "Mojo Dry Port Multimodal Terminal",
    code: "WH-MJ",
    location: "Mojo Multimodal Container Depot",
    city: "Mojo",
    region: "Oromia Regional State",
    address: "Mojo Dry Port Terminal, Express Freight Yard 2",
    manager: "Dawit Haile",
    phone: "+251 22 116 3390",
    totalProducts: 4,
    totalStock: 1230,
    inventoryValue: 15400000,
    capacity: 2500,
    capacityUsedPercent: 49.2,
    status: "operational",
  },
];

// Initial Alerts
export const initialInventoryAlerts: InventoryAlertItem[] = [
  {
    id: "alt-01",
    type: "out_of_stock",
    severity: "critical",
    productName: "Meki Greenhouse Fresh Ripe Tomatoes",
    sku: "VEG-TOM-501",
    warehouse: "Addis Ababa Central Logistics Hub (WH-AA)",
    message: "Zero available stock remaining. Active B2B commercial catering RFQs are waiting.",
    currentLevel: "0 Box",
    targetLevel: "50 Box min",
    timestamp: "10 mins ago",
    actionLabel: "Restock Now",
    read: false,
  },
  {
    id: "alt-02",
    type: "low_stock",
    severity: "warning",
    productName: "Red Kidney Export Standard Beans",
    sku: "BEA-RKB-401",
    warehouse: "Hawassa Agro-Processing Logistics Depot (WH-HW)",
    message: "Available inventory (20 Quintal) fell below safety buffer threshold (50 Quintal).",
    currentLevel: "20 Quintal",
    targetLevel: "50 Quintal min",
    timestamp: "2 hours ago",
    actionLabel: "Create Inbound PO",
    read: false,
  },
  {
    id: "alt-03",
    type: "overstock",
    severity: "info",
    productName: "Premium Durum Wheat Grains",
    sku: "WHT-DUR-202",
    warehouse: "Addis Ababa Central Logistics Hub (WH-AA)",
    message: "Stock level (1,250 Quintal) exceeds target maximum buffer (1,000 Quintal). Consider promotional wholesale discount.",
    currentLevel: "1,250 Quintal",
    targetLevel: "1,000 Quintal max",
    timestamp: "1 day ago",
    actionLabel: "Review Pricing",
    read: true,
  },
  {
    id: "alt-04",
    type: "audit_mismatch",
    severity: "warning",
    productName: "Deformed High-Tensile Steel Rebar 16mm",
    sku: "STL-RBR-601",
    warehouse: "Dire Dawa Free Trade Logistics Depot (WH-DD)",
    message: "Discrepancy of -2 Tons flagged in annual physical cycle count #ADJ-2026-085.",
    currentLevel: "180 Tons physical",
    targetLevel: "182 Tons system",
    timestamp: "2 days ago",
    actionLabel: "Review Audit",
    read: true,
  },
];

// Stock Movement Chart Datasets
export const stockMovementChartData = {
  "7d": [
    { label: "Mon", stockIn: 450, stockOut: 220, reserved: 180, adjustments: -4 },
    { label: "Tue", stockIn: 600, stockOut: 380, reserved: 210, adjustments: 0 },
    { label: "Wed", stockIn: 320, stockOut: 190, reserved: 150, adjustments: 10 },
    { label: "Thu", stockIn: 780, stockOut: 440, reserved: 320, adjustments: -2 },
    { label: "Fri", stockIn: 520, stockOut: 290, reserved: 240, adjustments: 0 },
    { label: "Sat", stockIn: 890, stockOut: 510, reserved: 390, adjustments: -5 },
    { label: "Sun", stockIn: 300, stockOut: 140, reserved: 110, adjustments: 0 },
  ],
  "30d": [
    { label: "Week 1", stockIn: 2800, stockOut: 1750, reserved: 1200, adjustments: -12 },
    { label: "Week 2", stockIn: 3450, stockOut: 2200, reserved: 1650, adjustments: 8 },
    { label: "Week 3", stockIn: 3900, stockOut: 2850, reserved: 2100, adjustments: -6 },
    { label: "Week 4", stockIn: 4200, stockOut: 3100, reserved: 2400, adjustments: -4 },
  ],
  "3m": [
    { label: "August", stockIn: 11200, stockOut: 8400, reserved: 5900, adjustments: -24 },
    { label: "September", stockIn: 14500, stockOut: 10800, reserved: 7800, adjustments: -15 },
    { label: "October", stockIn: 16800, stockOut: 12200, reserved: 9200, adjustments: -7 },
  ],
  "6m": [
    { label: "May", stockIn: 9800, stockOut: 7200, reserved: 4900, adjustments: -18 },
    { label: "Jun", stockIn: 10500, stockOut: 7900, reserved: 5400, adjustments: -12 },
    { label: "Jul", stockIn: 12100, stockOut: 8800, reserved: 6100, adjustments: -8 },
    { label: "Aug", stockIn: 11200, stockOut: 8400, reserved: 5900, adjustments: -24 },
    { label: "Sep", stockIn: 14500, stockOut: 10800, reserved: 7800, adjustments: -15 },
    { label: "Oct", stockIn: 16800, stockOut: 12200, reserved: 9200, adjustments: -7 },
  ],
  "1y": [
    { label: "Q4 25", stockIn: 28000, stockOut: 21000, reserved: 14000, adjustments: -45 },
    { label: "Q1 26", stockIn: 34000, stockOut: 26000, reserved: 18000, adjustments: -32 },
    { label: "Q2 26", stockIn: 38000, stockOut: 29500, reserved: 21000, adjustments: -28 },
    { label: "Q3 26", stockIn: 42500, stockOut: 31400, reserved: 22900, adjustments: -46 },
  ],
};

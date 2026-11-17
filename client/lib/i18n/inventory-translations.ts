import type { LanguageCode } from "./translations";

export interface InventoryTranslationDictionary {
  // Page Header
  inventoryTitle: string;
  inventorySubtitle: string;
  breadcrumbDashboard: string;
  breadcrumbInventory: string;
  liveLedgerLabel: string;
  synchronizedLabel: string;
  refreshBtn: string;
  exportCsvBtn: string;
  adjustStockBtn: string;
  transferStockBtn: string;
  addStockBtn: string;

  // KPI Cards
  kpiTotalStock: string;
  kpiUnitsUnit: string;
  kpiValuationPrefix: string;
  kpiAvailableStock: string;
  kpiAvailableDesc: string;
  kpiReservedStock: string;
  kpiReservedDesc: string;
  kpiLowStock: string;
  kpiLowStockDesc: string;
  kpiOutOfStock: string;
  kpiOutOfStockDesc: string;
  kpiWarehouses: string;
  kpiWarehousesDesc: string;
  itemsUnit: string;

  // Tabs
  tabOverview: string;
  tabProducts: string;
  tabWarehouses: string;
  tabMovements: string;
  tabTransfers: string;
  tabReservations: string;
  tabDamaged: string;
  tabAdjustments: string;
  tabAlerts: string;
  tabReports: string;

  // Search & Filters
  searchPlaceholder: string;
  allWarehouses: string;
  allCategories: string;
  allStatuses: string;
  statusInStock: string;
  statusLowStock: string;
  statusOutOfStock: string;
  clearFiltersBtn: string;

  // Chart
  chartTitle: string;
  chartSubtitle: string;
  chartNet: string;
  chartStockIn: string;
  chartStockOut: string;
  chartReserved: string;
  chartReconciliation: string;
  chartAudited: string;
  chartUnits: string;
  chartViewBars: string;
  chartViewTrend: string;
  chartViewBoth: string;
}

export const INVENTORY_TRANSLATIONS: Record<LanguageCode, InventoryTranslationDictionary> = {
  en: {
    inventoryTitle: "Inventory Management",
    inventorySubtitle: "",
    breadcrumbDashboard: "Dashboard",
    breadcrumbInventory: "Inventory",
    liveLedgerLabel: "Live Ledger:",
    synchronizedLabel: "Synchronized",
    refreshBtn: "Refresh",
    exportCsvBtn: "Export CSV",
    adjustStockBtn: "Adjust Stock",
    transferStockBtn: "Transfer Stock",
    addStockBtn: "+ Add Stock",

    kpiTotalStock: "Total Stock",
    kpiUnitsUnit: "Units",
    kpiValuationPrefix: "Val.",
    kpiAvailableStock: "Available Stock",
    kpiAvailableDesc: "Currently available for sale",
    kpiReservedStock: "Reserved Stock",
    kpiReservedDesc: "{count} Active Escrow Allocations",
    kpiLowStock: "Low Stock",
    kpiLowStockDesc: "Below safety buffer",
    kpiOutOfStock: "Out of Stock",
    kpiOutOfStockDesc: "Zero available inventory",
    kpiWarehouses: "Warehouses",
    kpiWarehousesDesc: "{count} Regional Depot Hubs",
    itemsUnit: "Items",

    tabOverview: "Overview",
    tabProducts: "Products",
    tabWarehouses: "Warehouses",
    tabMovements: "Movements",
    tabTransfers: "Transfers",
    tabReservations: "Reservations",
    tabDamaged: "Damaged Stock",
    tabAdjustments: "Audit Adjustments",
    tabAlerts: "Alerts",
    tabReports: "Reports",

    searchPlaceholder: "Search commodity name, SKU, barcode, category...",
    allWarehouses: "All Warehouses",
    allCategories: "All Categories",
    allStatuses: "All Statuses",
    statusInStock: "In Stock",
    statusLowStock: "Low Stock",
    statusOutOfStock: "Out of Stock",
    clearFiltersBtn: "Clear Filters",

    chartTitle: "Stock Movement & Velocity Overview",
    chartSubtitle: "",
    chartNet: "Net Movement:",
    chartStockIn: "Stock In",
    chartStockOut: "Stock Out",
    chartReserved: "Escrow Reserved",
    chartReconciliation: "Reconciliation",
    chartAudited: "Audited",
    chartUnits: "Units",
    chartViewBars: "Grouped Bars",
    chartViewTrend: "Velocity Trend",
    chartViewBoth: "Combined View",
  },

  am: {
    inventoryTitle: "የመጋዘን ክምችት አስተዳደር",
    inventorySubtitle: "",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbInventory: "ክምችት",
    liveLedgerLabel: "ቀጥታ መዝገብ፦",
    synchronizedLabel: "የተመሳሰለ",
    refreshBtn: "አድስ",
    exportCsvBtn: "በCSV አውርድ",
    adjustStockBtn: "ክምችት አስተካክል",
    transferStockBtn: "ክምችት አስተላልፍ",
    addStockBtn: "+ ክምችት ጨምር",

    kpiTotalStock: "አጠቃላይ ክምችት",
    kpiUnitsUnit: "መለኪያዎች",
    kpiValuationPrefix: "ግምት",
    kpiAvailableStock: "ለሽያጭ ዝግጁ ክምችት",
    kpiAvailableDesc: "በአሁኑ ሰዓት ለሽያጭ ዝግጁ",
    kpiReservedStock: "የተያዘ ክምችት",
    kpiReservedDesc: "{count} በእስክሮው የተያዙ ትዕዛዞች",
    kpiLowStock: "አነስተኛ ክምችት",
    kpiLowStockDesc: "ከደህንነት መጠኑ በታች",
    kpiOutOfStock: "ያለቀ ክምችት",
    kpiOutOfStockDesc: "በመጋዘን ውስጥ የሌለ",
    kpiWarehouses: "መጋዘኖች",
    kpiWarehousesDesc: "{count} የክልል መጋዘን ማዕከላት",
    itemsUnit: "ምርቶች",

    tabOverview: "አጠቃላይ እይታ",
    tabProducts: "ምርቶች",
    tabWarehouses: "መጋዘኖች",
    tabMovements: "እንቅስቃሴዎች",
    tabTransfers: "ዝውውሮች",
    tabReservations: "የተያዙ",
    tabDamaged: "የተበላሸ ክምችት",
    tabAdjustments: "የኦዲት ማስተካከያዎች",
    tabAlerts: "ማሳወቂያዎች",
    tabReports: "ሪፖርቶች",

    searchPlaceholder: "በምርት ስም፣ SKU፣ ባርኮድ፣ ምድብ ይፈልጉ...",
    allWarehouses: "ሁሉም መጋዘኖች",
    allCategories: "ሁሉም ምድቦች",
    allStatuses: "ሁሉም ሁኔታዎች",
    statusInStock: "በክምችት ያለ",
    statusLowStock: "አነስተኛ ክምችት",
    statusOutOfStock: "ያለቀ ክምችት",
    clearFiltersBtn: "ማጣሪያዎችን አጽዳ",

    chartTitle: "የክምችት እንቅስቃሴ እና የፍሰት ግራፍ",
    chartSubtitle: "",
    chartNet: "የተጣራ ለውጥ፦",
    chartStockIn: "የገባ ክምችት",
    chartStockOut: "የወጣ ክምችት",
    chartReserved: "በእስክሮው የተያዘ",
    chartReconciliation: "የኦዲት ማስታረቅ",
    chartAudited: "የተረጋገጠ",
    chartUnits: "መለኪያዎች",
    chartViewBars: "የአምድ ግራፍ",
    chartViewTrend: "የፍሰት መስመር",
    chartViewBoth: "የተቀናጀ እይታ",
  },

  om: {
    inventoryTitle: "Bulchiinsa Kuusaa",
    inventorySubtitle: "",
    breadcrumbDashboard: "Daashboordii",
    breadcrumbInventory: "Kuusaa",
    liveLedgerLabel: "Galmee Kallattii:",
    synchronizedLabel: "Walsimeera",
    refreshBtn: "Haaromsi",
    exportCsvBtn: "CSV Baasi",
    adjustStockBtn: "Kuusaa Sirreessi",
    transferStockBtn: "Kuusaa Dabarsi",
    addStockBtn: "+ Kuusaa Dabali",

    kpiTotalStock: "Kuusaa Waliigalaa",
    kpiUnitsUnit: "Safartuu",
    kpiValuationPrefix: "Tilmaama",
    kpiAvailableStock: "Kuusaa Gurgurtaaf Qophii",
    kpiAvailableDesc: "Amma gurgurtaaf kan qophaa'e",
    kpiReservedStock: "Kuusaa Qabame",
    kpiReservedDesc: "Qabiisa escrow ajajoota {count}",
    kpiLowStock: "Kuusaa Xiqqaate",
    kpiLowStockDesc: "Sadarkaa of eeggannoo gadi",
    kpiOutOfStock: "Kuusaa Dhumate",
    kpiOutOfStockDesc: "Kuusaan dhumateera",
    kpiWarehouses: "Manneen Kuusaa",
    kpiWarehousesDesc: "Wiirtuuwwan Naannoo {count}",
    itemsUnit: "Meeshaalee",

    tabOverview: "Waliigala",
    tabProducts: "Oomishaalee",
    tabWarehouses: "Manneen Kuusaa",
    tabMovements: "Sochiiwwan",
    tabTransfers: "Dabarsawwan",
    tabReservations: "Kan Qabaman",
    tabDamaged: "Kuusaa Miidhame",
    tabAdjustments: "Sirreeffama Ooditii",
    tabAlerts: "Akeekkachiisa",
    tabReports: "Gabaasota",

    searchPlaceholder: "Maqaa oomishaa, SKU, koodii, gareedhaan barbaadaa...",
    allWarehouses: "Manneen Kuusaa Hunda",
    allCategories: "Garee Hunda",
    allStatuses: "Haala Hunda",
    statusInStock: "Kuusaa Jira",
    statusLowStock: "Kuusaa Xiqqaate",
    statusOutOfStock: "Kuusaan Dhumate",
    clearFiltersBtn: "Calaltuuwwan Qulqulleessi",

    chartTitle: "Giraafii Sochii fi Dhangala'aa Kuusaa",
    chartSubtitle: "",
    chartNet: "Jijjiirama Qulqulluu:",
    chartStockIn: "Kuusaa Gale",
    chartStockOut: "Kuusaa Bahe",
    chartReserved: "Escrow Kan Qabame",
    chartReconciliation: "Walsimsiisa Ooditii",
    chartAudited: "Kan Mirkanaa'e",
    chartUnits: "Safartuu",
    chartViewBars: "Giraafii Tarree",
    chartViewTrend: "Adeemsa Dhangala'aa",
    chartViewBoth: "Ilaalcha Walmakaa",
  },

  ti: {
    inventoryTitle: "ምሕደራ ክምችት መኽዘን",
    inventorySubtitle: "",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbInventory: "ክምችት",
    liveLedgerLabel: "ቀጥታ መዝገብ፦",
    synchronizedLabel: "ዝተመሳሰለ",
    refreshBtn: "ሓድስ",
    exportCsvBtn: "ብ CSV ኣውርድ",
    adjustStockBtn: "ክምችት ኣዐሪ",
    transferStockBtn: "ክምችት ኣመሓላልፍ",
    addStockBtn: "+ ክምችት ወስኽ",

    kpiTotalStock: "ጠቕላላ ክምችት",
    kpiUnitsUnit: "መለክዒታት",
    kpiValuationPrefix: "ግምት",
    kpiAvailableStock: "ንምሻጥ ዝተዳለወ ክምችት",
    kpiAvailableDesc: "ሕዚ ንምሻጥ ዝተዳለወ",
    kpiReservedStock: "ዝተተሓዘ ክምችት",
    kpiReservedDesc: "{count} ብሕድሪ ዝተተሓዙ ትእዛዛት",
    kpiLowStock: "ትሑት ክምችት",
    kpiLowStockDesc: "ካብ መጠን ድሕንነት ንታሕቲ",
    kpiOutOfStock: "ዝተወደአ ክምችት",
    kpiOutOfStockDesc: "ኣብ መኽዘን ዘየለ",
    kpiWarehouses: "መኽዘናት",
    kpiWarehousesDesc: "{count} ናይ ክልል መኽዘን ማእከላት",
    itemsUnit: "ፍርያት",

    tabOverview: "ሓፈሻዊ ትሕዝቶ",
    tabProducts: "ፍርያት",
    tabWarehouses: "መኽዘናት",
    tabMovements: "ምንቅስቓሳት",
    tabTransfers: "ምትሕልላፋት",
    tabReservations: "ዝተተሓዙ",
    tabDamaged: "ዝተበላሸወ ክምችት",
    tabAdjustments: "ናይ ኦዲት ምዕራይ",
    tabAlerts: "መተሓሳሰቢታት",
    tabReports: "ጸብጻባት",

    searchPlaceholder: "ብሽም ፍርያት፣ SKU፣ ባርኮድ፣ ምድብ ድለዩ...",
    allWarehouses: "ኩሎም መኽዘናት",
    allCategories: "ኩሎም ምድባት",
    allStatuses: "ኩሎም ኩነታት",
    statusInStock: "ኣብ ክምችት ዘሎ",
    statusLowStock: "ትሑት ክምችት",
    statusOutOfStock: "ዝተወደአ ክምችት",
    clearFiltersBtn: "መፃረዪታት ኣጽሪ",

    chartTitle: "ሓፈሻዊ ግራፍ ምንቅስቓስ ክምችት",
    chartSubtitle: "",
    chartNet: "ዝተጻረየ ለውጢ፦",
    chartStockIn: "ዝኣተወ ክምችት",
    chartStockOut: "ዝወጸ ክምችት",
    chartReserved: "ብሕድሪ ዝተተሓዘ",
    chartReconciliation: "ምጽራይ ኦዲት",
    chartAudited: "ዝተረጋገጸ",
    chartUnits: "መለክዒታት",
    chartViewBars: "ናይ ዓንዲ ግራፍ",
    chartViewTrend: "መስመር ፍሰት",
    chartViewBoth: "ዝተዋደደ ምርኢት",
  },
};

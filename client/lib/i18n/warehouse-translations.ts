export interface WarehouseTranslationDictionary {
  title: string;
  badgeOperational: string;
  subtitle: string;
  depotNetworkActive: string;
  btnRefresh: string;
  btnAddWarehouse: string;
  btnReceiveAdjust: string;
  btnTransfer: string;
  btnExportCsv: string;

  // 6 KPIs
  kpiTotalWarehouses: string;
  kpiActiveDepots: string;
  kpiDepotCapacity: string;
  kpiUsed: string;
  kpiAvailable: string;
  kpiStockValue: string;
  kpiStockUnits: string;
  kpiLoadingDocks: string;
  kpiInUse: string;
  kpiOperationalBays: string;
  kpiTransfers: string;
  kpiInTransit: string;
  kpiStockAlerts: string;
  kpiItemsLow: string;
  kpiStockHealthy: string;

  // Warehouse Cards
  myWarehousesTitle: string;
  switchActiveDepotHint: string;
  loadingWarehouseNetwork: string;
  noDepotsTitle: string;
  noDepotsDesc: string;
  btnAddDepot: string;

  // 10 Tabs
  tabOverview: string;
  tabStock: string;
  tabLocations: string;
  tabReceiving: string;
  tabDispatch: string;
  tabTransfers: string;
  tabReturns: string;
  tabDamaged: string;
  tabActivity: string;
  tabReports: string;
}

export const WAREHOUSE_TRANSLATIONS: Record<
  "en" | "am" | "om" | "ti",
  WarehouseTranslationDictionary
> = {
  en: {
    title: "Warehouse Management",
    badgeOperational: "Operational",
    subtitle: "Manage registered hubs, inventory allocations, and inter-depot cargo transfers.",
    depotNetworkActive: "Depot Network: Active",
    btnRefresh: "Refresh",
    btnAddWarehouse: "+ Add Warehouse",
    btnReceiveAdjust: "Receive / Adjust",
    btnTransfer: "Transfer",
    btnExportCsv: "Export CSV",
    kpiTotalWarehouses: "Total Warehouses",
    kpiActiveDepots: "Active Depots",
    kpiDepotCapacity: "Depot Capacity",
    kpiUsed: "Used",
    kpiAvailable: "Available",
    kpiStockValue: "Stock Value",
    kpiStockUnits: "Stock Units",
    kpiLoadingDocks: "Loading Docks",
    kpiInUse: "In-Use",
    kpiOperationalBays: "Operational Bays",
    kpiTransfers: "Transfers",
    kpiInTransit: "In-Transit",
    kpiStockAlerts: "Stock Alerts",
    kpiItemsLow: "Items Low",
    kpiStockHealthy: "Stock Levels Healthy",
    myWarehousesTitle: "My Warehouses",
    switchActiveDepotHint: "Click card to switch active depot",
    loadingWarehouseNetwork: "Loading Warehouse Network...",
    noDepotsTitle: "No Warehouse Depots Found",
    noDepotsDesc: "You do not have any registered warehouse locations yet. Click below to register your first depot.",
    btnAddDepot: "+ Add Warehouse Depot",
    tabOverview: "Overview",
    tabStock: "Stock",
    tabLocations: "Locations",
    tabReceiving: "Receiving",
    tabDispatch: "Dispatch",
    tabTransfers: "Transfers",
    tabReturns: "Returns",
    tabDamaged: "Damaged",
    tabActivity: "Activity",
    tabReports: "Reports",
  },
  am: {
    title: "የመጋዘን አስተዳደር",
    badgeOperational: "ተግባራዊ",
    subtitle: "የተመዘገቡ ማዕከሎችን፣ የክምችት ምደባዎችን እና የመጋዘን ማጓጓዣዎችን ያስተዳድሩ።",
    depotNetworkActive: "የመጋዘን መረብ፡ ንቁ",
    btnRefresh: "አድስ",
    btnAddWarehouse: "+ መጋዘን ጨምር",
    btnReceiveAdjust: "ተቀበል / አስተካክል",
    btnTransfer: "አስተላልፍ",
    btnExportCsv: "CSV ላክ",
    kpiTotalWarehouses: "ጠቅላላ መጋዘኖች",
    kpiActiveDepots: "ንቁ መጋዘኖች",
    kpiDepotCapacity: "የመጋዘን አቅም",
    kpiUsed: "ጥቅም ላይ የዋለ",
    kpiAvailable: "ክፍት ቦታ",
    kpiStockValue: "የክምችት ዋጋ",
    kpiStockUnits: "የምርት ክፍሎች",
    kpiLoadingDocks: "የመጫኛ በሮች",
    kpiInUse: "በስራ ላይ ያሉ",
    kpiOperationalBays: "ተግባራዊ በሮች",
    kpiTransfers: "ዝውውሮች",
    kpiInTransit: "በመንገድ ላይ",
    kpiStockAlerts: "የክምችት ማስጠንቀቂያ",
    kpiItemsLow: "ያለቁ እቃዎች",
    kpiStockHealthy: "የክምችት ደረጃ ጤናማ ነው",
    myWarehousesTitle: "የእኔ መጋዘኖች",
    switchActiveDepotHint: "መጋዘኑን ለመቀየር ካርዱን ጠቅ ያድርጉ",
    loadingWarehouseNetwork: "የመጋዘን መረብ በመጫን ላይ...",
    noDepotsTitle: "ምንም የተመዘገበ መጋዘን አልተገኘም",
    noDepotsDesc: "እስካሁን ምንም የተመዘገበ መጋዘን የለዎትም። የመጀመሪያዎን መጋዘን ለመመዝገብ ከታች ያለውን ይጫኑ።",
    btnAddDepot: "+ መጋዘን መዝግብ",
    tabOverview: "አጠቃላይ እይታ",
    tabStock: "ክምችት",
    tabLocations: "ቦታዎች",
    tabReceiving: "ርክክብ",
    tabDispatch: "ጭነት መላኪያ",
    tabTransfers: "ዝውውሮች",
    tabReturns: "ተመላሾች",
    tabDamaged: "የተጎዱ እቃዎች",
    tabActivity: "እንቅስቃሴዎች",
    tabReports: "ሪፖርቶች",
  },
  om: {
    title: "Bulchiinsa Kuusaa",
    badgeOperational: "Hojii Irra Jira",
    subtitle: "Wiirtuulee galmaa'an, qoodiinsa meeshaa fi fe'iinsa kuusaa gidduu bulchaa.",
    depotNetworkActive: "Sarara Kuusaa: Hojjataa Jira",
    btnRefresh: "Haaromsi",
    btnAddWarehouse: "+ Kuusaa Dabali",
    btnReceiveAdjust: "Fudhadhu / Sirreessi",
    btnTransfer: "Dabarsi",
    btnExportCsv: "CSV Baasi",
    kpiTotalWarehouses: "Kuusaa Hundumaa",
    kpiActiveDepots: "Kuusaa Hojjetan",
    kpiDepotCapacity: "Dandeettii Kuusaa",
    kpiUsed: "Kan Itti Fayyadaman",
    kpiAvailable: "Banuu Kan Jiru",
    kpiStockValue: "Gatii Kuusaa",
    kpiStockUnits: "Kutaalee Meeshaa",
    kpiLoadingDocks: "Balbala Fe'iinsaa",
    kpiInUse: "Hojii Irra",
    kpiOperationalBays: "Balbaloota Hojjetan",
    kpiTransfers: "Dabarsawwan",
    kpiInTransit: "Karaarra Kan Jiran",
    kpiStockAlerts: "Akeekkachiisa Kuusaa",
    kpiItemsLow: "Meeshaalee Dhuman",
    kpiStockHealthy: "Sadarkaan Kuusaa Gaarii Dha",
    myWarehousesTitle: "Kuusawwan Koo",
    switchActiveDepotHint: "Kuusaa jijjiiruuf kaardii tuqaa",
    loadingWarehouseNetwork: "Sarara kuusaa fe'aa jira...",
    noDepotsTitle: "Kuusaan Galmaa'e Hin Argamne",
    noDepotsDesc: "Kuusaa galmaa'e hin qabdan. Kuusaa keessan isa jalqabaa galchuuf gadi tuqaa.",
    btnAddDepot: "+ Kuusaa Galchi",
    tabOverview: "Walii Gala",
    tabStock: "Kuusaa",
    tabLocations: "Bakkeewwan",
    tabReceiving: "Simannaa",
    tabDispatch: "Ergama",
    tabTransfers: "Dabarsawwan",
    tabReturns: "Kan Deebi'an",
    tabDamaged: "Kan Miidhame",
    tabActivity: "Sochiiwwan",
    tabReports: "Gabaasa",
  },
  ti: {
    title: "ምምሕዳር መኽዘን",
    badgeOperational: "ተግባራዊ",
    subtitle: "ዝተመዝገቡ ማእከላት፣ ምደባታት ንብረትን ናይ መኽዘናት ምምሕልላፍን የመሓድሩ።",
    depotNetworkActive: "መርበብ መኽዘናት: ንጡፍ",
    btnRefresh: "ሓድሽ",
    btnAddWarehouse: "+ መኽዘን ወስኽ",
    btnReceiveAdjust: "ተቐበል / ኣተዓራሪ",
    btnTransfer: "ኣመሓላልፍ",
    btnExportCsv: "CSV ኣውጽእ",
    kpiTotalWarehouses: "ጠቕላላ መኽዘናት",
    kpiActiveDepots: "ንጡፋት መኽዘናት",
    kpiDepotCapacity: "ዓቕሚ መኽዘን",
    kpiUsed: "ዝተጠቕመሉ",
    kpiAvailable: "ክፉት ቦታ",
    kpiStockValue: "ዋጋ ንብረት",
    kpiStockUnits: "ክፍልታት ፍርያት",
    kpiLoadingDocks: "መጽዓኒ ማዕጾታት",
    kpiInUse: "ኣብ ስራሕ ዘሎ",
    kpiOperationalBays: "ተግባራዊ ማዕጾታት",
    kpiTransfers: "ዝውውራት",
    kpiInTransit: "ኣብ መንገዲ ዘሎ",
    kpiStockAlerts: "ናይ ክምችት መጠንቀቕታ",
    kpiItemsLow: "ዝወድኡ ኣቑሑት",
    kpiStockHealthy: "ደረጃ ክምችት ጥዑይ እዩ",
    myWarehousesTitle: "ናተይ መኽዘናት",
    switchActiveDepotHint: "መኽዘን ንምቕያር ኣብታ ካርድ ጠውቑ",
    loadingWarehouseNetwork: "መርበብ መኽዘናት የጽዕን ኣሎ...",
    noDepotsTitle: "ዝተረኽበ መኽዘን የለን",
    noDepotsDesc: "ክሳብ ሕጂ ዝተመዝገበ መኽዘን የብልኩምን። ንመጀመሪያ ግዜ መኽዘንኩም ንምምዝጋብ ኣብ ታሕቲ ዘሎ ጠውቑ።",
    btnAddDepot: "+ መኽዘን መዝግብ",
    tabOverview: "ሓፈሻዊ ትሕዝቶ",
    tabStock: "ክምችት",
    tabLocations: "ቦታታት",
    tabReceiving: "ምቕባል",
    tabDispatch: "ምልኣኽ",
    tabTransfers: "ዝውውራት",
    tabReturns: "ዝተመለሱ",
    tabDamaged: "ዝተጎድኡ",
    tabActivity: "ምንቅስቓስ",
    tabReports: "ጸብጻባት",
  },
};

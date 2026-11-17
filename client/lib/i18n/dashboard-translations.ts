import type { LanguageCode } from "./translations";

export interface DashboardTranslationDictionary {
  // Page Header
  dashboardTitle: string;
  welcomeBack: string;
  breadcrumbMercatoX: string;
  breadcrumbOverview: string;
  addProductBtn: string;
  createQuoteBtn: string;
  reviewRfqsBtn: string;

  // Stat Cards
  statTotalRevenue: string;
  statRevenueSub: string;
  statAvailableBalance: string;
  statReadyPayout: string;
  statInEscrow: string;
  statOrdersSecured: string;
  statPendingOrders: string;
  statRequireDispatch: string;
  statBuyerRfqs: string;
  statAwaitingQuotes: string;

  // Chart Section
  wholesaleTradeVolume: string;
  tradeVolumeSub: string;
  timeframe7D: string;
  timeframe30D: string;
  timeframe12M: string;
  timeframeAll: string;
  avgOrderValue: string;
  settlementRate: string;
  fulfillmentSla: string;
  ordersCountUnit: string;

  // Pipeline Section
  orderPipelineTitle: string;
  orderPipelineSub: string;
  viewOrdersLink: string;
  stageNewConfirmed: string;
  stageProcessingQc: string;
  stagePackedReady: string;
  stageShippedTransit: string;
  stageDeliveredSettled: string;
  cbeEscrowProtection: string;
  secured100: string;

  // Top Products Section
  topItemsTitle: string;
  topItemsSub: string;
  allProductsBtn: string;
  colProduct: string;
  colStock: string;
  colWholesaleBase: string;
  colSold: string;
  colRating: string;
  noProductsInCatalog: string;

  // Recent Activity Feed
  recentActivityTitle: string;
  recentActivitySub: string;
  noRecentActivity: string;
  orderSecuredEvent: string;
  rfqInquiryEvent: string;
  quoteIssuedEvent: string;
  recently: string;
}

export const DASHBOARD_TRANSLATIONS: Record<LanguageCode, DashboardTranslationDictionary> = {
  en: {
    dashboardTitle: "Supplier Dashboard",
    welcomeBack: "Welcome back, {businessName}. Here is your commercial trade and escrow performance.",
    breadcrumbMercatoX: "MercatoX B2B",
    breadcrumbOverview: "Overview",
    addProductBtn: "Add Product",
    createQuoteBtn: "Create Quote",
    reviewRfqsBtn: "Review RFQs ({count})",

    statTotalRevenue: "Total Revenue",
    statRevenueSub: "Settled orders volume",
    statAvailableBalance: "Available Balance",
    statReadyPayout: "Ready for payout",
    statInEscrow: "In Escrow",
    statOrdersSecured: "{count} active orders secured",
    statPendingOrders: "Pending Orders",
    statRequireDispatch: "{count} require dispatch",
    statBuyerRfqs: "Buyer RFQs",
    statAwaitingQuotes: "Awaiting quotations",

    wholesaleTradeVolume: "Wholesale Trade Volume",
    tradeVolumeSub: "Billed trade across regional warehouses",
    timeframe7D: "7D",
    timeframe30D: "30D",
    timeframe12M: "12M",
    timeframeAll: "All",
    avgOrderValue: "Avg. Order Value",
    settlementRate: "Settlement Rate",
    fulfillmentSla: "Fulfillment SLA",
    ordersCountUnit: "orders",

    orderPipelineTitle: "Order Pipeline",
    orderPipelineSub: "Active fulfillment stages",
    viewOrdersLink: "View Orders",
    stageNewConfirmed: "New Confirmed",
    stageProcessingQc: "Processing & QC",
    stagePackedReady: "Packed & Ready",
    stageShippedTransit: "Shipped (In Transit)",
    stageDeliveredSettled: "Delivered & Settled",
    cbeEscrowProtection: "CBE Escrow Protection",
    secured100: "100% Secured",

    topItemsTitle: "Top Performing Catalog Items",
    topItemsSub: "Wholesale items with highest commercial order volume",
    allProductsBtn: "All Products ({count})",
    colProduct: "Product",
    colStock: "Stock",
    colWholesaleBase: "Wholesale Base",
    colSold: "Sold",
    colRating: "Rating",
    noProductsInCatalog: "No products found in catalog. Click \"Add Product\" to list your first item.",

    recentActivityTitle: "Recent Activity",
    recentActivitySub: "Commercial events & alerts",
    noRecentActivity: "No recent activity recorded yet.",
    orderSecuredEvent: "Order #{num} secured",
    rfqInquiryEvent: "New RFQ inquiry received",
    quoteIssuedEvent: "Quotation #{num} issued",
    recently: "Recently",
  },

  am: {
    dashboardTitle: "የአቅራቢ ዳሽቦርድ",
    welcomeBack: "እንኳን ደህና መጡ፣ {businessName}። የንግድ እና የእስክሮው እንቅስቃሴዎ አጠቃላይ መረጃ ከዚህ በታች ቀርቧል።",
    breadcrumbMercatoX: "መርካቶኤክስ B2B",
    breadcrumbOverview: "አጠቃላይ እይታ",
    addProductBtn: "ምርት ጨምር",
    createQuoteBtn: "የዋጋ ማቅረቢያ ፍጠር",
    reviewRfqsBtn: "የዋጋ ጥያቄዎችን መርምር ({count})",

    statTotalRevenue: "አጠቃላይ ገቢ",
    statRevenueSub: "የተጠናቀቁ ትዕዛዞች ድምር",
    statAvailableBalance: "ዝግጁ ቀሪ ሂሳብ",
    statReadyPayout: "ለውጪ ዝግጁ የሆነ",
    statInEscrow: "በእስክሮው የተያዘ",
    statOrdersSecured: "{count} ዋስትና የተሰጣቸው ትዕዛዞች",
    statPendingOrders: "በመጠባበቅ ላይ ያሉ ትዕዛዞች",
    statRequireDispatch: "{count} መላክ ያስፈልጋቸዋል",
    statBuyerRfqs: "የገዢዎች የዋጋ ጥያቄዎች",
    statAwaitingQuotes: "ዋጋ ማቅረቢያ የሚጠብቁ",

    wholesaleTradeVolume: "የጅምላ ንግድ ዝውውር መጠን",
    tradeVolumeSub: "በክልል መጋዘኖች የተከፈለ የንግድ እንቅስቃሴ",
    timeframe7D: "7 ቀናት",
    timeframe30D: "30 ቀናት",
    timeframe12M: "12 ወራት",
    timeframeAll: "ሁሉም",
    avgOrderValue: "አማካኝ የትዕዛዝ ዋጋ",
    settlementRate: "የክፍያ ማጠናቀቂያ ምጣኔ",
    fulfillmentSla: "የትዕዛዝ ማድረሻ ፍጥነት",
    ordersCountUnit: "ትዕዛዞች",

    orderPipelineTitle: "የትዕዛዝ ሂደት ደረጃዎች",
    orderPipelineSub: "ንቁ የማጠናቀቂያ ደረጃዎች",
    viewOrdersLink: "ትዕዛዞችን እይ",
    stageNewConfirmed: "አዲስ የተረጋገጠ",
    stageProcessingQc: "በዝግጅትና የጥራት ቁጥጥር ላይ",
    stagePackedReady: "የታሸገ እና ዝግጁ",
    stageShippedTransit: "በጉዞ ላይ ያለ",
    stageDeliveredSettled: "የደረሰና የተጠናቀቀ",
    cbeEscrowProtection: "የኢትዮጵያ ንግድ ባንክ የእስክሮው ጥበቃ",
    secured100: "100% አስተማማኝ ዋስትና",

    topItemsTitle: "ከፍተኛ ሽያጭ ያላቸው የካታሎግ ምርቶች",
    topItemsSub: "ከፍተኛ የጅምላ ትዕዛዝ ያላቸው ምርቶች ዝርዝር",
    allProductsBtn: "ሁሉም ምርቶች ({count})",
    colProduct: "ምርት",
    colStock: "ክምችት",
    colWholesaleBase: "የጅምላ መነሻ ዋጋ",
    colSold: "የተሸጠ መጠን",
    colRating: "ደረጃ",
    noProductsInCatalog: "በካታሎግ ውስጥ ምንም ምርት አልተገኘም። የመጀመሪያ ምርትዎን ለመመዝገብ \"ምርት ጨምር\" የሚለውን ይጫኑ።",

    recentActivityTitle: "የቅርብ ጊዜ እንቅስቃሴዎች",
    recentActivitySub: "የንግድ ሂደቶችና ማሳወቂያዎች",
    noRecentActivity: "እስካሁን የተመዘገበ እንቅስቃሴ የለም።",
    orderSecuredEvent: "ትዕዛዝ #{num} ዋስትና ተይዞለታል",
    rfqInquiryEvent: "አዲስ የዋጋ ጥያቄ ደርሷል",
    quoteIssuedEvent: "የዋጋ ማቅረቢያ #{num} ተልኳል",
    recently: "በቅርቡ",
  },

  om: {
    dashboardTitle: "Daashboordii Dhiyeessaa",
    welcomeBack: "Baga nagaan dhuftan, {businessName}. Raawwii daldalaa fi wabummaa kaffaltii keessan kan armaan gadiiti.",
    breadcrumbMercatoX: "MercatoX B2B",
    breadcrumbOverview: "Waliigala",
    addProductBtn: "Oomisha Dabali",
    createQuoteBtn: "Gatii Dhiyeessi",
    reviewRfqsBtn: "Gaaffii Gatii Ilaali ({count})",

    statTotalRevenue: "Galii Waliigalaa",
    statRevenueSub: "Gatii ajajoota xumuraman",
    statAvailableBalance: "Haftee Qophii Ta'e",
    statReadyPayout: "Baafachuuf qophii",
    statInEscrow: "Harka Qabiisa (Escrow)",
    statOrdersSecured: "Ajajoota {count} wabummaa qaban",
    statPendingOrders: "Ajajoota Eeggataa Jiran",
    statRequireDispatch: "{count} erguun barbaachisa",
    statBuyerRfqs: "Gaaffii Gatii Bittootaa",
    statAwaitingQuotes: "Gatii dhiyeessuu eeggataa jiru",

    wholesaleTradeVolume: "Hanga Daldala Jumlaa",
    tradeVolumeSub: "Daldala manneen kuusaa naannootiin herreegame",
    timeframe7D: "Guyyaa 7",
    timeframe30D: "Guyyaa 30",
    timeframe12M: "Ji'a 12",
    timeframeAll: "Hunda",
    avgOrderValue: "Gatii Ajajaa Giddu-galeessaa",
    settlementRate: "Reeshoo Kaffaltii Xumuruu",
    fulfillmentSla: "Saffisa Ajaja Raawwachuu",
    ordersCountUnit: "ajajoota",

    orderPipelineTitle: "Sadarkaalee Adeemsa Ajajaa",
    orderPipelineSub: "Sadarkaalee raawwii socho'aa jiran",
    viewOrdersLink: "Ajajoota Ilaali",
    stageNewConfirmed: "Haaraa Mirkanaa'e",
    stageProcessingQc: "Qophii fi Qulqullina To'achuu",
    stagePackedReady: "Saamsamee Qophaa'e",
    stageShippedTransit: "Karaa Irra Jira",
    stageDeliveredSettled: "Daqqabee Kaffaltiin Xumurame",
    cbeEscrowProtection: "Eegumsa Harka Qabiisa Baankii Daldala Itoophiyaa",
    secured100: "100% Wabummaa Qaba",

    topItemsTitle: "Oomishaalee Baay'ee Gurguraman",
    topItemsSub: "Meeshaalee jumlaa ajaja olaanaa qaban",
    allProductsBtn: "Oomishaalee Hunda ({count})",
    colProduct: "Oomisha",
    colStock: "Kuusaa",
    colWholesaleBase: "Gatii Ka'umsa Jumlaa",
    colSold: "Kan Gurgurame",
    colRating: "Sadarkaa",
    noProductsInCatalog: "Kaatalaagii keessatti oomishni hin argamne. Meeshaa keessan galchuuf \"Oomisha Dabali\" kan jedhu tuqaa.",

    recentActivityTitle: "Sochii Dhihoo",
    recentActivitySub: "Taateewwan daldalaa fi akeekkachiisa",
    noRecentActivity: "Hamma ammaatti sochiin galmaa'e hin jiru.",
    orderSecuredEvent: "Ajajni #{num} wabummaa argateera",
    rfqInquiryEvent: "Gaaffiin gatii haaraan dhufeera",
    quoteIssuedEvent: "Dhiyeessiin gatii #{num} kennameera",
    recently: "Dhihootti",
  },

  ti: {
    dashboardTitle: "ዳሽቦርድ ኣቕራቢ",
    welcomeBack: "እንቋዕ ብደሓን መጻእኹም፣ {businessName}። ናይ ንግድን ናይ ሕድሪ ውሕስናን ምንቅስቓስኩም ከምዚ ዝስዕብ ቀሪቡ ኣሎ።",
    breadcrumbMercatoX: "መርካቶኤክስ B2B",
    breadcrumbOverview: "ሓፈሻዊ ትሕዝቶ",
    addProductBtn: "ፍርያት ወስኽ",
    createQuoteBtn: "ናይ ዋጋ መቕረቢ ፍጠር",
    reviewRfqsBtn: "ናይ ዋጋ ሕቶታት መርምር ({count})",

    statTotalRevenue: "ጠቕላላ ኣታዊ",
    statRevenueSub: "ዝተዛዘሙ ትእዛዛት ድምር",
    statAvailableBalance: "ዝተዳለወ ዝተረፈ ሕሳብ",
    statReadyPayout: "ንምውፃእ ዝተዳለወ",
    statInEscrow: "ብሕድሪ ዝተተሓዘ (Escrow)",
    statOrdersSecured: "{count} ውሕስና ዝተውሃቦም ትእዛዛት",
    statPendingOrders: "ዝጽበዩ ዘለዉ ትእዛዛት",
    statRequireDispatch: "{count} ምስዳድ ዘድልዮም",
    statBuyerRfqs: "ናይ ዓደግቲ ናይ ዋጋ ሕቶታት",
    statAwaitingQuotes: "ዋጋ ምቕራብ ዝጽበዩ ዘለዉ",

    wholesaleTradeVolume: "ናይ ጅምላ ንግዲ መጠን",
    tradeVolumeSub: "ብናይ ክልል መኽዘናት ዝተኸፈለ ንግዲ",
    timeframe7D: "7 መዓልቲ",
    timeframe30D: "30 መዓልቲ",
    timeframe12M: "12 ኣዋርሕ",
    timeframeAll: "ኩሉ",
    avgOrderValue: "ማእከላይ ናይ ትእዛዝ ዋጋ",
    settlementRate: "ናይ ክፍሊት ምዝዛም መጠን",
    fulfillmentSla: "ናይ ምብጻሕ ቅልጣፈ",
    ordersCountUnit: "ትእዛዛት",

    orderPipelineTitle: "ደረጃታት ከይዲ ትእዛዝ",
    orderPipelineSub: "ንጡፋት ናይ ምብጻሕ ደረጃታት",
    viewOrdersLink: "ትእዛዛት ርአ",
    stageNewConfirmed: "ሓድሽ ዝተረጋገጸ",
    stageProcessingQc: "ኣብ ምድላውን ቁጽጽር ጽሬትን",
    stagePackedReady: "ዝተዓሸገን ዝተዳለወን",
    stageShippedTransit: "ኣብ ጉዕዞ ዘሎ",
    stageDeliveredSettled: "ዝበጽሐን ክፍሊቱ ዝተዛዘመን",
    cbeEscrowProtection: "ውሕስና ሕድሪ ንግዲ ባንኪ ኢትዮጵያ",
    secured100: "100% ውሑስ",

    topItemsTitle: "ብዝሒ ዝተሸጡ ፍርያት",
    topItemsSub: "ልዑል ናይ ጅምላ ትእዛዝ ዘለዎም ፍርያት",
    allProductsBtn: "ኩሎም ፍርያት ({count})",
    colProduct: "ፍርያት",
    colStock: "ክምችት",
    colWholesaleBase: "ናይ ጅምላ መበገሲ ዋጋ",
    colSold: "ዝተሸጠ",
    colRating: "ደረጃ",
    noProductsInCatalog: "ኣብ ካታሎግ ዝተረኽበ ፍርያት የለን። ናይ መጀመርያ ፍርያትኩም ንምምዝጋብ \"ፍርያት ወስኽ\" ዝብል ጠውቑ።",

    recentActivityTitle: "ናይ ቀረባ ግዜ ንጥፈታት",
    recentActivitySub: "ንግዳዊ ፍጻመታትን መተሓሳሰቢታትን",
    noRecentActivity: "ክሳብ ሕዚ ዝተመዝገበ ንጥፈት የለን።",
    orderSecuredEvent: "ትእዛዝ #{num} ውሕስና ተታሒዙሉ",
    rfqInquiryEvent: "ሓድሽ ናይ ዋጋ ሕቶ በጺሑ",
    quoteIssuedEvent: "ናይ ዋጋ መቕረቢ #{num} ተላኢኹ",
    recently: "ኣብ ቀረባ",
  },
};

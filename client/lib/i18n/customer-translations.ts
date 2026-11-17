export interface CustomerTranslationDictionary {
  title: string;
  subtitle: string;
  breadcrumbDashboard: string;
  breadcrumbCustomers: string;
  badgeEnterpriseClients: string;
  searchPlaceholder: string;
  filterAll: string;
  filterVip: string;
  filterActive: string;
  filterPendingCredit: string;
  thCompanyTin: string;
  thContactPerson: string;
  thLocationSector: string;
  thOrdersWithYou: string;
  thTotalSpend: string;
  thOutstanding: string;
  thCreditLimit: string;
  thStatus: string;
  thActions: string;
  emptyTitle: string;
  emptyDescription: string;
  btnView360: string;
  btnOpenChat: string;
  btnCreateQuote: string;
  btnBack: string;
  btnExport: string;
  detailTabOverview: string;
  detailTabOrders: string;
  detailTabIdentification: string;
  detailTabProfile: string;
  detailTabInvoices: string;
  cardLifetimeOrders: string;
  cardSupplierSpend: string;
  cardCreditLimit: string;
  cardPaymentRisk: string;
}

export const CUSTOMER_TRANSLATIONS: Record<
  "en" | "am" | "om" | "ti",
  CustomerTranslationDictionary
> = {
  en: {
    title: "B2B Customer CRM & Buyer Accounts",
    subtitle: "Manage verified enterprise buyers, trade credit facilities, purchase frequency, and cross-module 360 customer profiles",
    breadcrumbDashboard: "Dashboard",
    breadcrumbCustomers: "Customers",
    badgeEnterpriseClients: "Enterprise Clients",
    searchPlaceholder: "Search customer company, contact person, TIN number, Fayda ID, or sector...",
    filterAll: "All Clients",
    filterVip: "VIP High-Volume",
    filterActive: "Active Recurring",
    filterPendingCredit: "Pending Credit Review",
    thCompanyTin: "Company & TIN",
    thContactPerson: "Contact Person",
    thLocationSector: "Location & Sector",
    thOrdersWithYou: "Orders With You",
    thTotalSpend: "Total Spend (ETB)",
    thOutstanding: "Outstanding",
    thCreditLimit: "Credit Limit",
    thStatus: "Status",
    thActions: "Actions",
    emptyTitle: "No Customers Found",
    emptyDescription: "No buyer corporate accounts match your search filters.",
    btnView360: "View 360 Profile",
    btnOpenChat: "Open Chat Desk",
    btnCreateQuote: "Create Quotation",
    btnBack: "Back to All Customers",
    btnExport: "Export Buyers Directory",
    detailTabOverview: "Overview & Metrics",
    detailTabOrders: "Purchase Orders",
    detailTabIdentification: "Legal & Statutory ID",
    detailTabProfile: "Corporate Profile",
    detailTabInvoices: "VAT Invoices",
    cardLifetimeOrders: "Lifetime Orders",
    cardSupplierSpend: "Total B2B Spend",
    cardCreditLimit: "Trade Credit Facility",
    cardPaymentRisk: "Compliance & Risk Grade",
  },
  am: {
    title: "የጅምላ ደንበኞች CRM እና የገዢ መለያዎች",
    subtitle: "የተረጋገጡ የድርጅት ገዢዎችን፣ የንግድ ብድር አገልግሎቶችን፣ የግዢ ድግግሞሽን እና የ360 ደንበኛ መገለጫዎችን ያስተዳድሩ",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbCustomers: "ደንበኞች",
    badgeEnterpriseClients: "የድርጅት ደንበኞች",
    searchPlaceholder: "የደንበኛ ኩባንያ፣ የእውቂያ ሰው፣ የTIN ቁጥር፣ የፋይዳ መታወቂያ ወይም ዘርፍ ይፈልጉ...",
    filterAll: "ሁሉም ደንበኞች",
    filterVip: "ቪአይፒ ከፍተኛ-መጠን",
    filterActive: "ንቁ ተደጋጋሚ",
    filterPendingCredit: "የብድር ግምገማ በመጠባበቅ ላይ",
    thCompanyTin: "ኩባንያ እና TIN",
    thContactPerson: "የእውቂያ ሰው",
    thLocationSector: "አድራሻ እና ዘርፍ",
    thOrdersWithYou: "የእርስዎ ትዕዛዞች",
    thTotalSpend: "ጠቅላላ ወጪ (ብር)",
    thOutstanding: "ያልተከፈለ ቀሪ",
    thCreditLimit: "የብድር ጣሪያ",
    thStatus: "ሁኔታ",
    thActions: "እርምጃዎች",
    emptyTitle: "ምንም ደንበኞች አልተገኙም",
    emptyDescription: "ከፍለጋ ማጣሪያዎችዎ ጋር የሚዛመዱ የገዢ ድርጅት መለያዎች አልተገኙም።",
    btnView360: "360 መገለጫ ይመልከቱ",
    btnOpenChat: "የውይይት መስኮት ክፈት",
    btnCreateQuote: "ዋጋ ማቅረቢያ ፍጠር",
    btnBack: "ወደ ሁሉም ደንበኞች ተመለስ",
    btnExport: "የደንበኞች ማውጫ አውርድ",
    detailTabOverview: "አጠቃላይ እይታ እና መለኪያዎች",
    detailTabOrders: "የግዢ ትዕዛዞች",
    detailTabIdentification: "ህጋዊ እና የታክስ መታወቂያ",
    detailTabProfile: "የድርጅት መገለጫ",
    detailTabInvoices: "የተጨማሪ እሴት ታክስ ደረሰኞች",
    cardLifetimeOrders: "የዕድሜ ልክ ትዕዛዞች",
    cardSupplierSpend: "ጠቅላላ የB2B ወጪ",
    cardCreditLimit: "የንግድ ብድር አቅርቦት",
    cardPaymentRisk: "የተገዢነት እና የአደጋ ደረጃ",
  },
  om: {
    title: "CRM Maamiltoota B2B fi Herreega Bittootaa",
    subtitle: "Bittoota dhaabbataa mirkanaa'an, liqii daldalaa, deddeebii bittaa fi piroofaayilii maamiltootaa 360 bulchaa",
    breadcrumbDashboard: "Daashboordii",
    breadcrumbCustomers: "Maamiltoota",
    badgeEnterpriseClients: "Maamiltoota Dhaabbataa",
    searchPlaceholder: "Dhaabbata maamilaa, nama qunnamtii, lakkoofsa TIN, Fayda ID barbaadi...",
    filterAll: "Maamiltoota Hundaa",
    filterVip: "VIP Hamma Olaanaa",
    filterActive: "Hojii Irra Kan Jiru",
    filterPendingCredit: "Gamaaggama Liqii Eegaa Jira",
    thCompanyTin: "Dhaabbata fi TIN",
    thContactPerson: "Nama Qunnamtii",
    thLocationSector: "Bakka fi Damee",
    thOrdersWithYou: "Ajajoota Isin Biraa",
    thTotalSpend: "Waliigala Baasii (ETB)",
    thOutstanding: "Kan Hin Kaffalamne",
    thCreditLimit: "Daangaa Liqii",
    thStatus: "Haala",
    thActions: "Tarkaanfii",
    emptyTitle: "Maamiltoonni Hin Argamne",
    emptyDescription: "Herreegni dhaabbata bittaa qorannoo keessan wajjin walsimu hin jiru.",
    btnView360: "Piroofaayilii 360 Ilaali",
    btnOpenChat: "Marii Bani",
    btnCreateQuote: "Waraqaa Gatii Uumi",
    btnBack: "Gara Maamiltoota Hundaatti Deebi'i",
    btnExport: "Galmee Bittootaa Baasi",
    detailTabOverview: "Ibsa Waliigalaa",
    detailTabOrders: "Ajajoota Bittaa",
    detailTabIdentification: "Ragaalee Seeraa fi Gibiraa",
    detailTabProfile: "Piroofaayilii Dhaabbataa",
    detailTabInvoices: "Nagahee VAT",
    cardLifetimeOrders: "Waliigala Ajajootaa",
    cardSupplierSpend: "Baasii B2B Waliigalaa",
    cardCreditLimit: "Liqii Daldalaa",
    cardPaymentRisk: "Sadarkaa Balaa fi Seeraa",
  },
  ti: {
    title: "ናይ ጅምላ ዓደግቲ CRMን ሕሳባትን",
    subtitle: "ዝተረጋገጹ ናይ ትካል ዓደግቲ፣ ናይ ንግዲ ልቓሕ፣ ናይ ምዕዳግ ተደጋጋምነትን ናይ ዓደግቲ 360 መግለጺታትን የመሓድሩ",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbCustomers: "ዓደግቲ",
    badgeEnterpriseClients: "ናይ ትካል ዓደግቲ",
    searchPlaceholder: "ትካል ዓዳጊ፣ መራኸቢ ሰብ፣ ቁጽሪ TIN፣ መለለዪ ፋይዳ ድለዩ...",
    filterAll: "ኩሎም ዓደግቲ",
    filterVip: "VIP ላዕለዋይ መጠን",
    filterActive: "ንጡፍ ተደጋጋሚ",
    filterPendingCredit: "ናይ ልቓሕ ግምገማ ዝጽበ",
    thCompanyTin: "ትካልን TINን",
    thContactPerson: "ተራኻቢ ሰብ",
    thLocationSector: "ቦታን ዘፈርን",
    thOrdersWithYou: "ናታትኩም ትእዛዛት",
    thTotalSpend: "ጠቕላላ ወጻኢ (ETB)",
    thOutstanding: "ዘይተኸፍለ ተረፍ",
    thCreditLimit: "ደረት ልቓሕ",
    thStatus: "ኩነታት",
    thActions: "ተግባራት",
    emptyTitle: "ዋላ ሓደ ዓዳጊ ኣይተረኽበን",
    emptyDescription: "ምስ መምረጺኹም ዝሰማማዕ ናይ ትካል ሕሳብ ኣይተረኽበን።",
    btnView360: "መግለጺ 360 ርአ",
    btnOpenChat: "ናይ ዕላል መስኮት ኽፈት",
    btnCreateQuote: "ዋጋ መቕረቢ ፍጠር",
    btnBack: "ናብ ኩሎም ዓደግቲ ተመለስ",
    btnExport: "ናይ ዓደግቲ ማውጫ ኣውርድ",
    detailTabOverview: "ሓፈሻዊ ትሕዝቶ",
    detailTabOrders: "ናይ ምዕዳግ ትእዛዛት",
    detailTabIdentification: "ሕጋውን ናይ ግብሪ መለለዪን",
    detailTabProfile: "ናይ ትካል መግለጺ",
    detailTabInvoices: "ናይ VAT ደረሰኝታት",
    cardLifetimeOrders: "ናይ ሙሉእ ግዜ ትእዛዛት",
    cardSupplierSpend: "ጠቕላላ ናይ B2B ወጻኢ",
    cardCreditLimit: "ናይ ንግዲ ልቓሕ ኣገልግሎት",
    cardPaymentRisk: "ደረጃ ድሕንነትን ሓደጋን",
  },
};

export interface PricingTranslationDictionary {
  title: string;
  subtitle: string;
  breadcrumbDashboard: string;
  breadcrumbPricing: string;
  btnSavePricing: string;
  tabTiers: string;
  tabBuyerContracts: string;
  tabRegional: string;
  loadingCommodities: string;
  emptyTitle: string;
  emptyDescription: string;
  btnGoCatalog: string;
  lblSelectProduct: string;
  lblBasePrice: string;
  lblMoq: string;
  lblTier1: string;
  lblTier2: string;
  lblTier3: string;
}

export const PRICING_TRANSLATIONS: Record<
  "en" | "am" | "om" | "ti",
  PricingTranslationDictionary
> = {
  en: {
    title: "Wholesale Pricing Matrix & Contracts",
    subtitle: "Configure progressive volume tier discounts, minimum & maximum order quantities, corporate client contracts, and regional freight indexation",
    breadcrumbDashboard: "Dashboard",
    breadcrumbPricing: "Wholesale Pricing",
    btnSavePricing: "Save Pricing Changes",
    tabTiers: "Set MOQ & Volume Tier Matrix",
    tabBuyerContracts: "Buyer-Specific Contracts",
    tabRegional: "Regional Freight Differentials",
    loadingCommodities: "Loading catalog commodities...",
    emptyTitle: "No Catalog Commodities Found",
    emptyDescription: "Add commodities to your product catalog first to configure wholesale volume quantity tiers and contract rates.",
    btnGoCatalog: "Go to Product Catalog",
    lblSelectProduct: "Select Commodity to Price",
    lblBasePrice: "Standard Base Unit Price",
    lblMoq: "Minimum Order Quantity (MOQ)",
    lblTier1: "Tier 1: Standard Bulk",
    lblTier2: "Tier 2: Commercial Volume",
    lblTier3: "Tier 3: Enterprise Wholesale",
  },
  am: {
    title: "የጅምላ ዋጋ ማትሪክስ እና ውሎች",
    subtitle: "የብዛት ቅናሾችን፣ አነስተኛ እና ከፍተኛ የትዕዛዝ መጠኖችን፣ የድርጅት ደንበኞች ውሎችን እና የክልላዊ ትራንስፖርት ዋጋዎችን ያዋቅሩ",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbPricing: "የጅምላ ዋጋ",
    btnSavePricing: "የዋጋ ለውጦችን አስቀምጥ",
    tabTiers: "MOQ እና የደረጃ ማትሪክስ አዘጋጅ",
    tabBuyerContracts: "የተወሰኑ ገዢዎች ውል",
    tabRegional: "የክልላዊ ትራንስፖርት ልዩነቶች",
    loadingCommodities: "የካታሎግ ምርቶችን በመጫን ላይ...",
    emptyTitle: "ምንም የካታሎግ ምርቶች አልተገኙም",
    emptyDescription: "የጅምላ የዋጋ ደረጃዎችን እና የውል ተመኖችን ለማዋቀር መጀመሪያ ምርቶችን ወደ ካታሎግዎ ያክሉ።",
    btnGoCatalog: "ወደ ምርት ካታሎግ ሂድ",
    lblSelectProduct: "ዋጋ ለመወሰን ምርት ይምረጡ",
    lblBasePrice: "መደበኛ የአንዱ ዋጋ",
    lblMoq: "አነስተኛ የትዕዛዝ መጠን (MOQ)",
    lblTier1: "ደረጃ 1፡ መደበኛ ጅምላ",
    lblTier2: "ደረጃ 2፡ የንግድ ብዛት",
    lblTier3: "ደረጃ 3፡ የድርጅት ከፍተኛ ጅምላ",
  },
  om: {
    title: "Matrix Gatii Jumlaa fi Waliigaltee",
    subtitle: "Hir'ina gatii hammaa, ajaja xiqqaa fi guddaa, waliigaltee bittootaa fi geejjiba naannoo qindeessaa",
    breadcrumbDashboard: "Daashboordii",
    breadcrumbPricing: "Gatii Jumlaa",
    btnSavePricing: "Jijjiirama Gatii Olkaa'i",
    tabTiers: "MOQ fi Sadarkaa Hammaa Murteessi",
    tabBuyerContracts: "Waliigaltee Bittootaa Addaa",
    tabRegional: "Garaagarummaa Geejjiba Naannoo",
    loadingCommodities: "Oomishaalee fe'aa jira...",
    emptyTitle: "Oomishni Hin Argamne",
    emptyDescription: "Sadarkaa gatii jumlaa qindeessuuf dura oomishaalee kaataaloogiitti dabalaa.",
    btnGoCatalog: "Gara Kaataaloogiitti Deebi'i",
    lblSelectProduct: "Oomisha Gatiin Murtaa'u Filadhaa",
    lblBasePrice: "Gatii Tokkoo Idilee",
    lblMoq: "Hamma Ajaja Xiqqaa (MOQ)",
    lblTier1: "Sadarkaa 1: Jumlaa Idilee",
    lblTier2: "Sadarkaa 2: Hamma Daldalaa",
    lblTier3: "Sadarkaa 3: Jumlaa Dhaabbataa",
  },
  ti: {
    title: "ናይ ጅምላ ዋጋ ማትሪክስን ውዕላትን",
    subtitle: "ናይ ብዝሒ ቅናሻት፣ ዝተሓተን ዝለዓለን ናይ ትእዛዝ መጠን፣ ናይ ዓደግቲ ውዕላትን ናይ ዞባዊ ትራንስፖርት ዋጋታትን ኣዋድዱ",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbPricing: "ናይ ጅምላ ዋጋ",
    btnSavePricing: "ናይ ዋጋ ለውጥታት ዓቅብ",
    tabTiers: "MOQን ደረጃ ማትሪክስን ኣዳልው",
    tabBuyerContracts: "ናይ ፍሉያት ዓደግቲ ውዕላት",
    tabRegional: "ናይ ዞባዊ መጓዓዝያ ፍልልያት",
    loadingCommodities: "ፍርያት ይጽዕን ኣሎ...",
    emptyTitle: "ዋላ ሓደ ፍርያት ኣይተረኽበን",
    emptyDescription: "ናይ ጅምላ ዋጋ ደረጃታት ንምድላው መጀመርታ ፍርያት ናብ ካታሎግኩም ወስኹ።",
    btnGoCatalog: "ናብ ካታሎግ ፍርያት ኺድ",
    lblSelectProduct: "ዋጋ ዝውሰነሉ ፍርያት ምረጹ",
    lblBasePrice: "ስሩዕ ናይ ሓደ ዋጋ",
    lblMoq: "ዝተሓተ ናይ ትእዛዝ መጠን (MOQ)",
    lblTier1: "ደረጃ 1፡ ስሩዕ ጅምላ",
    lblTier2: "ደረጃ 2፡ ናይ ንግዲ መጠን",
    lblTier3: "ደረጃ 3፡ ናይ ትካል ጅምላ",
  },
};

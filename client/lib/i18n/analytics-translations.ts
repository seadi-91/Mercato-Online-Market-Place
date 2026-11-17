export interface AnalyticsTranslationDictionary {
  title: string;
  subtitle: string;
  breadcrumbDashboard: string;
  breadcrumbAnalytics: string;
  btnExportReport: string;

  // Periods
  periodDaily: string;
  periodWeekly: string;
  periodMonthly: string;
  periodQuarterly: string;
  periodYearly: string;

  // 6 KPIs
  kpiGrossRevenue: string;
  kpiTotalVolume: string;
  kpiAvgOrderValue: string;
  kpiPerOrder: string;
  kpiRfqWinRate: string;
  kpiTendersWon: string;
  kpiQuoteAcceptance: string;
  kpiAcceptedQuotes: string;
  kpiRepeatBuyerRate: string;
  kpiRecurringClients: string;
  kpiReturnRate: string;
  kpiDisputeFree: string;

  // Chart
  chartTradeVelocity: string;
  chartTradeSubtitle: string;
  chartRevenueLegend: string;
  chartOrdersLegend: string;
  regionalBreakdownTitle: string;
  regionalBreakdownSubtitle: string;
  categoryDistributionTitle: string;
  categoryDistributionSubtitle: string;
  periodTradeVolume: string;
  periodOrders: string;
  peakPerformance: string;
  fulfillmentSla: string;
  cbeEscrowVerified: string;
  activeRegions: string;
  noRegionalData: string;
  noCategoryData: string;
  purchaseOrdersCount: string;
}

export const ANALYTICS_TRANSLATIONS: Record<
  "en" | "am" | "om" | "ti",
  AnalyticsTranslationDictionary
> = {
  en: {
    title: "Enterprise B2B Business Analytics & Intelligence",
    subtitle: "In-depth gross sales trajectories, chronological trade graphs, quotation win rates, and regional logistics performance",
    breadcrumbDashboard: "Dashboard",
    breadcrumbAnalytics: "Analytics",
    btnExportReport: "Export Report",
    periodDaily: "Daily",
    periodWeekly: "Weekly",
    periodMonthly: "Monthly",
    periodQuarterly: "Quarterly",
    periodYearly: "Yearly",
    kpiGrossRevenue: "Gross Revenue",
    kpiTotalVolume: "Total volume",
    kpiAvgOrderValue: "Average Order Value",
    kpiPerOrder: "Per purchase order",
    kpiRfqWinRate: "RFQ Win Rate",
    kpiTendersWon: "Tenders won",
    kpiQuoteAcceptance: "Quote Acceptance",
    kpiAcceptedQuotes: "Accepted quotes",
    kpiRepeatBuyerRate: "Repeat Buyer Rate",
    kpiRecurringClients: "Recurring clients",
    kpiReturnRate: "Return Rate",
    kpiDisputeFree: "Dispute free",
    chartTradeVelocity: "Commercial Trade Velocity",
    chartTradeSubtitle: "Chronological gross sales volume and completed procurement transactions",
    chartRevenueLegend: "Revenue (ETB)",
    chartOrdersLegend: "Orders Placed",
    regionalBreakdownTitle: "Regional Hub Sales Breakdown",
    regionalBreakdownSubtitle: "Logistics corridor revenue distribution across Ethiopian regions",
    categoryDistributionTitle: "Catalog Category Distribution",
    categoryDistributionSubtitle: "Commodity inventory breakdown by active product categories",
    periodTradeVolume: "Period Trade Volume",
    periodOrders: "Period Orders",
    peakPerformance: "Peak Performance",
    fulfillmentSla: "Fulfillment SLA",
    cbeEscrowVerified: "CBE Escrow Verified",
    activeRegions: "Active Regions",
    noRegionalData: "No regional order distributions recorded yet. When orders are processed, geographic breakdown will appear here.",
    noCategoryData: "No catalog categories registered yet.",
    purchaseOrdersCount: "purchase orders",
  },
  am: {
    title: "የኮርፖሬት ንግድ ትንታኔ እና መረጃ (Analytics)",
    subtitle: "ጥልቅ የሽያጭ አዝማሚያዎች፣ የግብይት ግራፎች፣ የዋጋ ማቅረቢያ ስኬት ምጣኔ እና የክልል ሎጂስቲክስ አፈጻጸም",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbAnalytics: "ትንታኔ (Analytics)",
    btnExportReport: "ሪፖርት ላክ",
    periodDaily: "ዕለታዊ",
    periodWeekly: "ሳምንታዊ",
    periodMonthly: "ወርሃዊ",
    periodQuarterly: "ሩብ ዓመት",
    periodYearly: "ዓመታዊ",
    kpiGrossRevenue: "አጠቃላይ ሽያጭ",
    kpiTotalVolume: "ጠቅላላ የገንዘብ መጠን",
    kpiAvgOrderValue: "አማካይ የትዕዛዝ ዋጋ",
    kpiPerOrder: "በነጠላ ትዕዛዝ",
    kpiRfqWinRate: "የRFQ የማሸነፍ ምጣኔ",
    kpiTendersWon: "ያሸነፉ ጨረታዎች",
    kpiQuoteAcceptance: "የዋጋ ተቀባይነት ምጣኔ",
    kpiAcceptedQuotes: "ተቀባይነት ያገኙ",
    kpiRepeatBuyerRate: "ደጋጋሚ ገዢዎች",
    kpiRecurringClients: "ተመላላሽ ደንበኞች",
    kpiReturnRate: "የተመላሽ እቃ ምጣኔ",
    kpiDisputeFree: "ያለ ምንም አለመግባባት",
    chartTradeVelocity: "የንግድ ግብይት ፍጥነት",
    chartTradeSubtitle: "የሽያጭ መጠን እና የተጠናቀቁ የግዥ ግብይቶች የጊዜ ቅደም ተከተል ግራፍ",
    chartRevenueLegend: "ገቢ (ብር)",
    chartOrdersLegend: "የተሰጡ ትዕዛዞች",
    regionalBreakdownTitle: "የክልል ማዕከላት የሽያጭ ድርሻ",
    regionalBreakdownSubtitle: "በኢትዮጵያ ክልሎች የገቢ ክፍፍል እና ሎጂስቲክስ",
    categoryDistributionTitle: "የምርት ምድቦች ስርጭት",
    categoryDistributionSubtitle: "በአክቲቭ የምርት ምድቦች የተከፋፈለ የክምችት ዝርዝር",
    periodTradeVolume: "የወቅቱ የግብይት መጠን",
    periodOrders: "የወቅቱ ትዕዛዞች",
    peakPerformance: "ከፍተኛው አፈጻጸም",
    fulfillmentSla: "የትዕዛዝ ማድረስ SLA",
    cbeEscrowVerified: "በCBE ኤስክሮው የተረጋገጠ",
    activeRegions: "ንቁ ክልሎች",
    noRegionalData: "እስካሁን የተመዘገበ የክልል የትዕዛዝ ስርጭት የለም። ትዕዛዞች ሲሰሩ እዚህ ይዘረዘራሉ።",
    noCategoryData: "እስካሁን የተመዘገበ የምርት ምድብ የለም።",
    purchaseOrdersCount: "ትዕዛዞች",
  },
  om: {
    title: "Xiinxala Daldalaa fi Odeeffannoo Korporeetii",
    subtitle: "Adeemsa gurgurtaa gadi fageenyaan, giraafii daldalaa, milkaa'ina gatii fi raawwii loojistiksii naannoo",
    breadcrumbDashboard: "Daashboordii",
    breadcrumbAnalytics: "Xiinxala (Analytics)",
    btnExportReport: "Gabaasa Baasi",
    periodDaily: "Guyyaa",
    periodWeekly: "Torbee",
    periodMonthly: "Ji'a",
    periodQuarterly: "Kurmaana",
    periodYearly: "Waggaa",
    kpiGrossRevenue: "Galii Waliigalaa",
    kpiTotalVolume: "Hamma waliigalaa",
    kpiAvgOrderValue: "Gatii Ajajaa Giddu Galeessaa",
    kpiPerOrder: "Ajaja tokkoon",
    kpiRfqWinRate: "Milkaa'ina RFQ",
    kpiTendersWon: "Caalbaasii mo'atame",
    kpiQuoteAcceptance: "Fudhatama Gatii",
    kpiAcceptedQuotes: "Gatii fudhatame",
    kpiRepeatBuyerRate: "Bitattoota Irra Deebiin",
    kpiRecurringClients: "Maamiltoota deebi'an",
    kpiReturnRate: "Hamma Deebii",
    kpiDisputeFree: "Walmormii malee",
    chartTradeVelocity: "Saffisa Daldalaa",
    chartTradeSubtitle: "Hamma gurgurtaa fi daldala xumuramee yeroon ibsu",
    chartRevenueLegend: "Galii (ETB)",
    chartOrdersLegend: "Ajajawwan Dhiyaatan",
    regionalBreakdownTitle: "Qooda Gurgurtaa Wiirtuulee Naannoo",
    regionalBreakdownSubtitle: "Kutaalee Itoophiyaa keessatti qoodiinsa galii loojistiksii",
    categoryDistributionTitle: "Qoodiinsa Gosoota Oomishaa",
    categoryDistributionSubtitle: "Qoodiinsa kuusaa gosoota oomishaatiin",
    periodTradeVolume: "Hamma Daldala Yeroo",
    periodOrders: "Ajajawwan Yeroo",
    peakPerformance: "Raawwii Olaanaa",
    fulfillmentSla: "SLA Raawwii Ajajaa",
    cbeEscrowVerified: "Eskiroo CBEtiin Mirkanaa'e",
    activeRegions: "Naannolee Hojjataa Jiran",
    noRegionalData: "Hamma ammaatti qoodiinsi ajaja naannoo hin galmoofne.",
    noCategoryData: "Gosoonni oomishaa ammatti hin galmoofne.",
    purchaseOrdersCount: "ajajawwan",
  },
  ti: {
    title: "ትንታነ ንግድን ሓበሬታን ትካላት (Analytics)",
    subtitle: "ዕሙቕ ናይ መሸጣ ኣንፈታት፣ ናይ ንግዲ ግራፋት፣ ናይ ዋጋ መቕረቢ ዓወት መጠንን ናይ ዞባታት ሎጂስቲክስ ኣፈጻጽማን",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbAnalytics: "ትንታነ (Analytics)",
    btnExportReport: "ጸብጻብ ኣውጽእ",
    periodDaily: "መዓልታዊ",
    periodWeekly: "ሰሙናዊ",
    periodMonthly: "ወርሓዊ",
    periodQuarterly: "ርብዒ ዓመት",
    periodYearly: "ዓመታዊ",
    kpiGrossRevenue: "ሓፈሻዊ እቶት",
    kpiTotalVolume: "ጠቕላላ መጠን",
    kpiAvgOrderValue: "ማእከላይ ዋጋ ትእዛዝ",
    kpiPerOrder: "ኣብ ነፍሲ ወከፍ ትእዛዝ",
    kpiRfqWinRate: "ናይ RFQ ዓወት መጠን",
    kpiTendersWon: "ዝተዓወቱ ጨረታታት",
    kpiQuoteAcceptance: "ተቐባልነት ዋጋ",
    kpiAcceptedQuotes: "ተቐባልነት ዝረኸቡ",
    kpiRepeatBuyerRate: "ተመላሊሶም ዝገዝኡ",
    kpiRecurringClients: "ቀወምቲ ዓደግቲ",
    kpiReturnRate: "ናይ ተመላሲ መጠን",
    kpiDisputeFree: "ብዘይ ዝኾነ ምስሕሓብ",
    chartTradeVelocity: "ናይ ንግዲ ቅልጣፈ",
    chartTradeSubtitle: "ናይ መሸጣ መጠንን ዝተዛዘሙ ናይ ንግዲ ትእዛዛትን ብእዋናዊ ቅደም ተኸተል",
    chartRevenueLegend: "እቶት (ብር)",
    chartOrdersLegend: "ዝተዋህቡ ትእዛዛት",
    regionalBreakdownTitle: "ናይ ዞባታት ማእከላት መሸጣ",
    regionalBreakdownSubtitle: "ኣብ ክልላት ኢትዮጵያ ዘሎ ናይ እቶትን ሎጂስቲክስን ምደባ",
    categoryDistributionTitle: "ናይ ፍርያት ምድባት ክፍፍል",
    categoryDistributionSubtitle: "ንጡፋት ዝኾኑ ናይ ፍርያት ምድባት ዝርዝር ክምችት",
    periodTradeVolume: "ናይቲ እዋን ናይ ንግዲ መጠን",
    periodOrders: "ናይቲ እዋን ትእዛዛት",
    peakPerformance: "ዝለዓለ ኣፈጻጽማ",
    fulfillmentSla: "SLA ምብፃሕ ትእዛዝ",
    cbeEscrowVerified: "ብCBE ኤስክሮው ዝተረጋገጸ",
    activeRegions: "ንጡፋት ዞባታት",
    noRegionalData: "ክሳብ ሕዚ ዝተመዝገበ ናይ ዞባ ትእዛዝ ክፍፍል የለን።",
    noCategoryData: "ክሳብ ሕዚ ዝተመዝገበ ናይ ፍርያት ምድብ የለን።",
    purchaseOrdersCount: "ትእዛዛት",
  },
};

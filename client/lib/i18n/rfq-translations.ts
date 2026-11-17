export interface RFQTranslationDictionary {
  title: string;
  subtitle: string;
  breadcrumbDashboard: string;
  breadcrumbRfq: string;
  btnRefresh: string;
  newInquiries: string;
  branchNotice: string;
  searchPlaceholder: string;
  statusAll: string;
  statusNew: string;
  statusViewed: string;
  statusResponded: string;
  statusNegotiating: string;
  statusAccepted: string;
  statusRejected: string;
  statusExpired: string;
  colRfqId: string;
  colBuyerEnterprise: string;
  colCommodity: string;
  colTargetVolume: string;
  colTargetPrice: string;
  colLocation: string;
  colRequiredDate: string;
  colStatus: string;
  colAction: string;
  btnQuote: string;
  emptyTitle: string;
  emptyDesc: string;
  drawerReceivedOn: string;
  drawerBuyerOrg: string;
  drawerCompany: string;
  drawerProcurementLead: string;
  drawerSpecifications: string;
  drawerTargetQuantity: string;
  drawerTargetBudget: string;
  drawerDeliveryTerms: string;
  drawerDestination: string;
  drawerExpectedDate: string;
  drawerNotes: string;
  drawerBtnQuote: string;
  drawerBtnReject: string;
}

export const RFQ_TRANSLATIONS: Record<"en" | "am" | "om" | "ti", RFQTranslationDictionary> = {
  en: {
    title: "Request for Quotations (RFQ) Inbox",
    subtitle: "Review inbound commercial procurement tenders, custom specifications, and target pricing from verified corporate buyers",
    breadcrumbDashboard: "Dashboard",
    breadcrumbRfq: "RFQs",
    btnRefresh: "Refresh",
    newInquiries: "New Inquiries",
    branchNotice: "Executive Commercial Notice: Formal RFQ negotiations, commercial quotations, and contracts are managed exclusively by Super Supplier Enterprise HQ. Branch managers hold localized fulfillment oversight.",
    searchPlaceholder: "Filter RFQs by RFQ number, buyer company, commodity, or delivery location...",
    statusAll: "All Inquiries",
    statusNew: "New / Unread",
    statusViewed: "Viewed",
    statusResponded: "Responded",
    statusNegotiating: "In Negotiation",
    statusAccepted: "Accepted",
    statusRejected: "Rejected",
    statusExpired: "Expired",
    colRfqId: "RFQ ID",
    colBuyerEnterprise: "Buyer Enterprise",
    colCommodity: "Requested Commodity",
    colTargetVolume: "Target Volume",
    colTargetPrice: "Buyer Target Price",
    colLocation: "Delivery Location",
    colRequiredDate: "Required Date",
    colStatus: "Status",
    colAction: "Action",
    btnQuote: "Quote",
    emptyTitle: "No RFQs Found",
    emptyDesc: "There are currently no RFQ inquiries matching your search criteria.",
    drawerReceivedOn: "Received on",
    drawerBuyerOrg: "Buyer Organization",
    drawerCompany: "Company:",
    drawerProcurementLead: "Procurement Lead:",
    drawerSpecifications: "Requested Commodity Specifications",
    drawerTargetQuantity: "Target Quantity:",
    drawerTargetBudget: "Target Unit Price:",
    drawerDeliveryTerms: "Logistics & Delivery Destination",
    drawerDestination: "Target Warehouse / Site:",
    drawerExpectedDate: "Expected Arrival:",
    drawerNotes: "Buyer Comments / Specifications:",
    drawerBtnQuote: "Create Commercial Quotation",
    drawerBtnReject: "Decline Request",
  },
  am: {
    title: "የዋጋ መጠየቂያዎች (RFQ) ሳጥን",
    subtitle: "ከተረጋገጡ የኮርፖሬት ገዢዎች የቀረቡ የግዥ ጨረታዎችን፣ ዝርዝር መግለጫዎችን እና የታለመ ዋጋን ይገምግሙ",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbRfq: "የዋጋ መጠየቂያዎች (RFQ)",
    btnRefresh: "አድስ",
    newInquiries: "አዳዲስ ጥያቄዎች",
    branchNotice: "የስራ አመራር ማሳሰቢያ፡ ይፋዊ የዋጋ ድርድሮች፣ የዋጋ ማቅረቢያዎች እና ውሎች የሚመሩት በዋናው መስሪያ ቤት (Super Supplier HQ) ብቻ ነው። የቅርንጫፍ አስተዳዳሪዎች የአካባቢ ትዕዛዝ አፈጻጸምን ይከታተላሉ።",
    searchPlaceholder: "በRFQ ቁጥር፣ ገዢ ድርጅት፣ ምርት ወይም የመላኪያ ቦታ ይፈልጉ...",
    statusAll: "ሁሉም ጥያቄዎች",
    statusNew: "አዲስ / ያልተነበበ",
    statusViewed: "የታየ",
    statusResponded: "ምላሽ የተሰጠበት",
    statusNegotiating: "በድርድር ላይ ያለ",
    statusAccepted: "ተቀባይነት ያገኘ",
    statusRejected: "ውድቅ የተደረገ",
    statusExpired: "ጊዜው ያለፈበት",
    colRfqId: "የRFQ መለያ",
    colBuyerEnterprise: "ገዢ ድርጅት",
    colCommodity: "የተጠየቀው ምርት",
    colTargetVolume: "የተጠየቀ መጠን",
    colTargetPrice: "የገዢው የታለመ ዋጋ",
    colLocation: "የመላኪያ ቦታ",
    colRequiredDate: "የሚፈለግበት ቀን",
    colStatus: "ሁኔታ",
    colAction: "እርምጃ",
    btnQuote: "ዋጋ አቅርብ",
    emptyTitle: "ምንም የዋጋ መጠየቂያ አልተገኘም",
    emptyDesc: "ከፍለጋዎ ጋር የሚዛመድ ምንም አይነት የRFQ ጥያቄ የለም።",
    drawerReceivedOn: "የደረሰው በ",
    drawerBuyerOrg: "የገዢ ድርጅት",
    drawerCompany: "ኩባንያ፡",
    drawerProcurementLead: "የግዥ ኃላፊ፡",
    drawerSpecifications: "የተጠየቀው ምርት ዝርዝር መግለጫ",
    drawerTargetQuantity: "የሚፈለገው ብዛት፡",
    drawerTargetBudget: "የታለመ ነጠላ ዋጋ፡",
    drawerDeliveryTerms: "የሎጂስቲክስ እና የመላኪያ አድራሻ",
    drawerDestination: "መጋዘን / ቦታ፡",
    drawerExpectedDate: "የሚጠበቅበት ቀን፡",
    drawerNotes: "የገዢው አስተያየት / ዝርዝር፡",
    drawerBtnQuote: "ኦፊሴላዊ የዋጋ ማቅረቢያ ፍጠር",
    drawerBtnReject: "ጥያቄውን ውድቅ አድርግ",
  },
  om: {
    title: "Saanduqa Gaaffii Gatii (RFQ)",
    subtitle: "Caalbaasii bittaa korporeetotaa, ibsa dabalataa fi gatii karoorfame ilaalaa",
    breadcrumbDashboard: "Daashboordii",
    breadcrumbRfq: "Gaaffii Gatii (RFQ)",
    btnRefresh: "Haaromsi",
    newInquiries: "Gaaffilee Haaraa",
    branchNotice: "Hubachiisa Hojii Geggeessaa: Mariin daldalaa, dhiyeessiin gatii fi waliigalteewwan Waajjira Muummeetiin (Super Supplier HQ) qofa geggeeffamu. Hoggantoonni damee raawwii naannoo hordofu.",
    searchPlaceholder: "Lakkoofsa RFQ, dhaabbata bitataa, meeshaa ykn bakka geessuutiin barbaadaa...",
    statusAll: "Gaaffilee Hundumaa",
    statusNew: "Haaraa / Kan Hin Dubbifamne",
    statusViewed: "Kan Ilaalame",
    statusResponded: "Deebiin Kan Kennameef",
    statusNegotiating: "Marii Irra Kan Jiru",
    statusAccepted: "Kan Fudhatame",
    statusRejected: "Kan Kufaa Ta'e",
    statusExpired: "Yeroon Kan Dhumate",
    colRfqId: "ID RFQ",
    colBuyerEnterprise: "Dhaabbata Bitataa",
    colCommodity: "Gosa Oomishaa",
    colTargetVolume: "Hamma Barbaadame",
    colTargetPrice: "Gatii Bitataan Yaade",
    colLocation: "Bakka Geessuu",
    colRequiredDate: "Guyyaa Barbaadame",
    colStatus: "Haala",
    colAction: "Tarkaanfii",
    btnQuote: "Gatii Dhiyeessi",
    emptyTitle: "Gaaffiin RFQ Hin Argamne",
    emptyDesc: "Barbaacha keessan waliin kan walsimu gaaffiin RFQ hin jiru.",
    drawerReceivedOn: "Kan qaqqabe",
    drawerBuyerOrg: "Dhaabbata Bitataa",
    drawerCompany: "Dhaabbata:",
    drawerProcurementLead: "Itti Gaafatamaa Bittaa:",
    drawerSpecifications: "Ibsa Oomisha Barbaadamee",
    drawerTargetQuantity: "Hamma Barbaadame:",
    drawerTargetBudget: "Gatii Tokkoo:",
    drawerDeliveryTerms: "Loojistiksii fi Bakka Geessuu",
    drawerDestination: "Bakka / Kuusaa:",
    drawerExpectedDate: "Guyyaa Eegamu:",
    drawerNotes: "Yaada / Ibsa Bitataa:",
    drawerBtnQuote: "Waraqaa Gatii Daldalaa Uumi",
    drawerBtnReject: "Gaaffii Kufaa Godhi",
  },
  ti: {
    title: "ሳንዱቕ ሕቶ ዋጋ (RFQ)",
    subtitle: "ካብ ዝተረጋገጹ ትካላት ዝቐረቡ ናይ ምግዛእ ጨረታታት፣ ዝርዝር መግለጺታትን ናይ ዋጋ ገምጋምን መርምሩ",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbRfq: "ሕቶታት ዋጋ (RFQ)",
    btnRefresh: "ሓድሽ",
    newInquiries: "ሓደሽቲ ሕቶታት",
    branchNotice: "ናይ ምምሕዳር መተሓሳሰቢ፡ ወግዓዊ ናይ ዋጋ ድርድር፣ ናይ ዋጋ መቕረቢታትን ውዕላትን ብቐጥታ ብዋና ቤት ጽሕፈት (Super Supplier HQ) ጥራይ ይካየድ። ናይ ጨንፈር ሓለውቲ ከባብያዊ ትእዛዛት ይከታተሉ።",
    searchPlaceholder: "ብቁጽሪ RFQ፣ ትካል ዓዳጊ፣ ዓይነት ፍርያት ወይ መብጽሒ ቦታ ድለዩ...",
    statusAll: "ኩሎም ሕቶታት",
    statusNew: "ሓድሽ / ዘይተነበበ",
    statusViewed: "ዝተራእየ",
    statusResponded: "ምላሽ ዝተዋህቦ",
    statusNegotiating: "ኣብ ድርድር ዘሎ",
    statusAccepted: "ተቐባልነት ዝረኸበ",
    statusRejected: "ውድቂ ዝተገብረ",
    statusExpired: "ግዚኡ ዝሓለፈ",
    colRfqId: "መለለዪ RFQ",
    colBuyerEnterprise: "ትካል ዓዳጊ",
    colCommodity: "ዝተሓተተ ፍርያት",
    colTargetVolume: "ዝድለ መጠን",
    colTargetPrice: "ናይ ዓዳጊ ዕላማ ዋጋ",
    colLocation: "መብጽሒ ቦታ",
    colRequiredDate: "ዝድለየሉ ዕለት",
    colStatus: "ኩነታት",
    colAction: "ስጉምቲ",
    btnQuote: "ዋጋ ሃብ",
    emptyTitle: "ዝተረኽበ ናይ ዋጋ ሕቶ የለን",
    emptyDesc: "ምስቲ ድሌትኩም ዝሰማማዕ ናይ RFQ ሕቶ ኣይተረኽበን።",
    drawerReceivedOn: "ዝበጽሓሉ",
    drawerBuyerOrg: "ትካል ዓዳጊ",
    drawerCompany: "ትካል፡",
    drawerProcurementLead: "ሓላፊ ዕዳጋ፡",
    drawerSpecifications: "ዝርዝር መግለጺ ዝተሓተተ ፍርያት",
    drawerTargetQuantity: "ዝድለ መጠን፡",
    drawerTargetBudget: "ነፍሲ ወከፍ ዋጋ፡",
    drawerDeliveryTerms: "ሎጂስቲክስን መብጽሒ ቦታን",
    drawerDestination: "መኽዘን / ቦታ፡",
    drawerExpectedDate: "ዝጽበየሉ ዕለት፡",
    drawerNotes: "ናይቲ ዓዳጊ ርእይቶ / ዝርዝር፡",
    drawerBtnQuote: "ወግዓዊ ናይ ዋጋ መቕረቢ ፍጠር",
    drawerBtnReject: "ነቲ ሕቶ ውድቂ ግበሮ",
  },
};

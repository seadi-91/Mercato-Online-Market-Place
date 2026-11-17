export interface SourcingTranslationDictionary {
  verifiedBadge: string;
  title: string;
  subtitle: string;
  btnBroadcastRfq: string;
  cardCatalog: string;
  cardCatalogSub: string;
  cardNegotiations: string;
  cardNegotiationsSub: string;
  cardDeliveries: string;
  cardDeliveriesSub: string;
  cardEscrowVolume: string;
  cardEscrowSub: string;
  tabMarket: string;
  tabNegotiations: string;
  tabMyOrders: string;
  searchPlaceholder: string;
  allCategories: string;
  allRegions: string;
  sortBy: string;
  btnNegotiate: string;
  btnDirectBuy: string;
  moqLabel: string;
  myOrdersTitle: string;
  myOrdersSubtitle: string;
  btnBrowseMarketplace: string;
  lblTotalSpend: string;
  lblActiveTransit: string;
  lblAwaitingOtp: string;
  lblSettled: string;
  searchOrdersPlaceholder: string;
  statusAll: string;
  statusActive: string;
  statusAtHub: string;
  statusCompleted: string;
}

export const SOURCING_TRANSLATIONS: Record<
  "en" | "am" | "om" | "ti",
  SourcingTranslationDictionary
> = {
  en: {
    verifiedBadge: "MercatoX Verified Sourcing",
    title: "Sourcing & Procurement Marketplace",
    subtitle: "Discover bulk agro-commodities and industrial supplies directly from verified producers across Ethiopia, negotiate volume prices, and complete secure Escrow orders via Chapa.",
    btnBroadcastRfq: "Broadcast Custom RFQ",
    cardCatalog: "Marketplace Catalog",
    cardCatalogSub: "Direct Origin Guaranteed",
    cardNegotiations: "Price Negotiations",
    cardNegotiationsSub: "Counter-Offers Received",
    cardDeliveries: "In-Transit Deliveries",
    cardDeliveriesSub: "En Route to Receiving Hubs",
    cardEscrowVolume: "Protected Escrow Volume",
    cardEscrowSub: "100% Chapa Trust Vault",
    tabMarket: "Explore Wholesale Market",
    tabNegotiations: "Active Negotiations & Offers",
    tabMyOrders: "My Procurement Orders",
    searchPlaceholder: "Search crops, industrial commodities, SKU, origin, or supplier name...",
    allCategories: "All Categories",
    allRegions: "All Ethiopian Regions",
    sortBy: "Sort by",
    btnNegotiate: "Negotiate Price",
    btnDirectBuy: "Buy with Escrow",
    moqLabel: "Min Order (MOQ)",
    myOrdersTitle: "My Sourcing Purchases",
    myOrdersSubtitle: "Track bulk procurement orders, logistics waybills, and verify 4-digit Handover OTPs.",
    btnBrowseMarketplace: "Browse Marketplace",
    lblTotalSpend: "Total Spend",
    lblActiveTransit: "Active Transit",
    lblAwaitingOtp: "Awaiting OTP",
    lblSettled: "Settled",
    searchOrdersPlaceholder: "Search PO #, commodity, seller, waybill...",
    statusAll: "All",
    statusActive: "Active",
    statusAtHub: "At Hub (OTP)",
    statusCompleted: "Completed",
  },
  am: {
    verifiedBadge: "በመርካቶኤክስ የተረጋገጠ አቅርቦት",
    title: "የአቅርቦት እና የግዢ የገበያ ቦታ",
    subtitle: "ከመላው ኢትዮጵያ ከተረጋገጡ አምራቾች በቀጥታ የጅምላ የግብርና ምርቶችን እና የኢንዱስትሪ አቅርቦቶችን ያግኙ፣ የጅምላ ዋጋዎችን ይደራደሩ እና በቻፓ በኩል ደህንነቱ የተጠበቀ የኢስክሮው ትዕዛዞችን ያጠናቅቁ።",
    btnBroadcastRfq: "ብጁ የRFQ ጥያቄ አሰራጭ",
    cardCatalog: "የገበያ ቦታ ካታሎግ",
    cardCatalogSub: "ቀጥታ ከአምራች የተረጋገጠ",
    cardNegotiations: "የዋጋ ድርድሮች",
    cardNegotiationsSub: "የቀረቡ አጸፋዊ ዋጋዎች",
    cardDeliveries: "በጉዞ ላይ ያሉ ማጓጓዣዎች",
    cardDeliveriesSub: "ወደ መጋዘን በመጓዝ ላይ",
    cardEscrowVolume: "በኢስክሮው የተጠበቀ መጠን",
    cardEscrowSub: "100% በቻፓ የታመነ ካዝና",
    tabMarket: "የጅምላ ገበያውን ያስሱ",
    tabNegotiations: "ንቁ ድርድሮች እና የቀረቡ ዋጋዎች",
    tabMyOrders: "የእኔ የግዢ ትዕዛዞች",
    searchPlaceholder: "ሰብሎችን፣ የኢንዱስትሪ ምርቶችን፣ SKUን፣ መነሻን ወይም የአቅራቢ ስም ይፈልጉ...",
    allCategories: "ሁሉም ምድቦች",
    allRegions: "ሁሉም የኢትዮጵያ ክልሎች",
    sortBy: "አስተካክል በ",
    btnNegotiate: "ዋጋ ተደራደር",
    btnDirectBuy: "በኢስክሮው ይግዙ",
    moqLabel: "አነስተኛ ትዕዛዝ (MOQ)",
    myOrdersTitle: "የእኔ የአቅርቦት ግዢዎች",
    myOrdersSubtitle: "የጅምላ ግዢ ትዕዛዞችን፣ የሎጅስቲክስ ሰነዶችን ይከታተሉ እና ባለ 4 አሃዝ የማስረከቢያ OTP ያረጋግጡ።",
    btnBrowseMarketplace: "ገበያውን ያስሱ",
    lblTotalSpend: "ጠቅላላ ወጪ",
    lblActiveTransit: "በጉዞ ላይ ያለ",
    lblAwaitingOtp: "OTP በመጠባበቅ ላይ",
    lblSettled: "የተጠናቀቀ",
    searchOrdersPlaceholder: "የትዕዛዝ #፣ ምርት፣ ሻጭ፣ የጭነት ማዘዣ ይፈልጉ...",
    statusAll: "ሁሉም",
    statusActive: "ንቁ",
    statusAtHub: "መጋዘን የደረሰ (OTP)",
    statusCompleted: "የተጠናቀቀ",
  },
  om: {
    verifiedBadge: "Dhiyeessa Mirkanaa'aa MercatoX",
    title: "Gabaa Dhiyeessaa fi Bittaa",
    subtitle: "Oomishaalee qonnaa fi dhiyeessii warshaa oomishtoota mirkanaa'an irraa kallattiin argadhaa, gatii mari'adhaa, kaffaltii Eeskirawuu Chapaan xumuraa.",
    btnBroadcastRfq: "Gaaffii RFQ Addaa Tamsaasi",
    cardCatalog: "Kaataaloogii Gabaa",
    cardCatalogSub: "Madda Irraa Mirkanaa'e",
    cardNegotiations: "Marii Gatii",
    cardNegotiationsSub: "Gatii Deebii Argame",
    cardDeliveries: "Geejjiba Adeemsa Irra Jiru",
    cardDeliveriesSub: "Gara Wiirtuu Fudhatiitti",
    cardEscrowVolume: "Hamma Eeskirawuun Eegame",
    cardEscrowSub: "Kuusaa Amanamaa Chapa 100%",
    tabMarket: "Gabaa Jumlaa Daawwadhaa",
    tabNegotiations: "Marii fi Dhiyeessii Hojii Irra Jiru",
    tabMyOrders: "Ajajoota Bittaa Kiyya",
    searchPlaceholder: "Midhaan, oomisha daldalaa, SKU, bakka ykn dhiyeessaa barbaadaa...",
    allCategories: "Ramaddii Hundaa",
    allRegions: "Naannolee Itoophiyaa Hundaa",
    sortBy: "Tartiibsi",
    btnNegotiate: "Gatii Mari'adhaa",
    btnDirectBuy: "Eeskirawuudhaan Bitaa",
    moqLabel: "Ajaja Xiqqaa (MOQ)",
    myOrdersTitle: "Bittaa Dhiyeessa Kiyya",
    myOrdersSubtitle: "Ajajoota bittaa jumlaa, ragaalee geejjibaa hordofaa, koodii OTP mirkaneessaa.",
    btnBrowseMarketplace: "Gabaa Daawwadhaa",
    lblTotalSpend: "Baasii Waliigalaa",
    lblActiveTransit: "Geejjiba Irra Jiru",
    lblAwaitingOtp: "OTP Eegaa Jira",
    lblSettled: "Kan Xumurame",
    searchOrdersPlaceholder: "Lakkoofsa PO, oomisha, gurguraa barbaadi...",
    statusAll: "Hundaa",
    statusActive: "Hojii Irra",
    statusAtHub: "Wiirtuu Ga'e (OTP)",
    statusCompleted: "Xumurameera",
  },
  ti: {
    verifiedBadge: "ብመርካቶኤክስ ዝተረጋገጸ ቀረብ",
    title: "ናይ ቀረብን ምዕዳግን ዕዳጋ",
    subtitle: "ካብ መላእ ኢትዮጵያ ካብ ዝተረጋገጹ ኣፍረይቲ ቀጥታ ናይ ሕርሻ ፍርያትን ናይ ኢንዱስትሪ ቀረባትን ርኸቡ፣ ዋጋ ተዛተዩ፣ ብቻፓ ድማ ውሑስ ናይ ኢስክሮው ትእዛዛት ፈጽሙ።",
    btnBroadcastRfq: "ፍሉይ ናይ RFQ ሕቶ ዘርግሕ",
    cardCatalog: "ካታሎግ ዕዳጋ",
    cardCatalogSub: "ካብ መበገሲኡ ዝተረጋገጸ",
    cardNegotiations: "ናይ ዋጋ ድርድራት",
    cardNegotiationsSub: "ዝተቐበልካዮም ተጻረርቲ ዋጋታት",
    cardDeliveries: "ኣብ ጉዕዞ ዘለዉ መጓዓዝያታት",
    cardDeliveriesSub: "ናብ መቐበሊ ማእኸላት ዝጓዓዝ",
    cardEscrowVolume: "ብኢስክሮው ዝተሓለወ መጠን",
    cardEscrowSub: "100% ናይ ቻፓ ውሑስ ካዝና",
    tabMarket: "ናይ ጅምላ ዕዳጋ ዳህስሱ",
    tabNegotiations: "ንጡፋት ድርድራትን ዝቐረቡ ዋጋታትን",
    tabMyOrders: "ናተይ ናይ ምዕዳግ ትእዛዛት",
    searchPlaceholder: "ፍርያት፣ ናይ ንግዲ ኣቑሑት፣ SKU፣ መበገሲ ወይ ስም ኣቕራቢ ድለዩ...",
    allCategories: "ኩሎም ምድባት",
    allRegions: "ኩሎም ዞባታት ኢትዮጵያ",
    sortBy: "ኣሰሪዕ ብ",
    btnNegotiate: "ዋጋ ተዛተይ",
    btnDirectBuy: "ብኢስክሮው ዓድግ",
    moqLabel: "ዝተሓተ ትእዛዝ (MOQ)",
    myOrdersTitle: "ናተይ ናይ ቀረብ ዕድጊታት",
    myOrdersSubtitle: "ናይ ጅምላ ምዕዳግ ትእዛዛት፣ ሰነዳት መጓዓዝያ ተኸታተሉ፣ ናይ 4-ኣሃዝ ምርካብ OTP ኣረጋግጹ።",
    btnBrowseMarketplace: "ዕዳጋ ዳህስሱ",
    lblTotalSpend: "ጠቕላላ ወጻኢ",
    lblActiveTransit: "ኣብ ጉዕዞ ዘሎ",
    lblAwaitingOtp: "OTP ዝጽበ",
    lblSettled: "ዝተዛዘመ",
    searchOrdersPlaceholder: "ቁጽሪ PO፣ ፍርያት፣ ሸያጢ ድለዩ...",
    statusAll: "ኩሎም",
    statusActive: "ንጡፍ",
    statusAtHub: "ማእኸል ዝበጽሐ (OTP)",
    statusCompleted: "ዝተዛዘመ",
  },
};

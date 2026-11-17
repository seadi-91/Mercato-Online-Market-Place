export interface PromotionTranslationDictionary {
  title: string;
  subtitle: string;
  breadcrumbDashboard: string;
  breadcrumbPromotions: string;
  btnCreateCoupon: string;
  btnLaunchCampaign: string;
  tabAllCampaigns: string;
  tabCoupons: string;
  tabAnalytics: string;
  tabPreview: string;
  liveEngine: string;
  active: string;
  scheduled: string;
  paused: string;
  expired: string;
  totalSalesGenerated: string;
  conversionLift: string;
  heroDescription: string;
  views: string;
  conversions: string;
  discountsGiven: string;
  searchPlaceholder: string;
  allStatuses: string;
  allTypes: string;
  volumeDiscount: string;
  flashSale: string;
  couponCode: string;
  freeShipping: string;
  emptyTitle: string;
  emptyDescription: string;
}

export const PROMOTION_TRANSLATIONS: Record<
  "en" | "am" | "om" | "ti",
  PromotionTranslationDictionary
> = {
  en: {
    title: "Promotions & Wholesale Rebate Engine",
    subtitle: "Create volume tier rebates, harvest flash sales, buyer coupon codes, and logistics subsidies across MercatoX",
    breadcrumbDashboard: "Dashboard",
    breadcrumbPromotions: "Promotions & Rebates",
    btnCreateCoupon: "Create Coupon Code",
    btnLaunchCampaign: "Launch Promotion Campaign",
    tabAllCampaigns: "All Campaigns & Rebates",
    tabCoupons: "Coupons & Promo Codes",
    tabAnalytics: "Promotion ROI & Conversion",
    tabPreview: "Storefront Banner Preview",
    liveEngine: "Live Promotion Engine",
    active: "Active",
    scheduled: "Scheduled",
    paused: "Paused",
    expired: "Expired",
    totalSalesGenerated: "Total Promotional Sales Generated",
    conversionLift: "Conversion Lift",
    heroDescription: "Wholesale volume discounts, coupon codes, and harvest flash sales incentivize commercial buyers to place larger bulk purchase orders on MercatoX.",
    views: "Catalog Views",
    conversions: "Orders Placed",
    discountsGiven: "Total Discounts Given",
    searchPlaceholder: "Search campaigns by title, product, coupon code, or category...",
    allStatuses: "All Statuses",
    allTypes: "All Types",
    volumeDiscount: "Volume Tier Rebate",
    flashSale: "Harvest Flash Sale",
    couponCode: "Promo Coupon Code",
    freeShipping: "Freight Subsidy",
    emptyTitle: "No Promotions Found",
    emptyDescription: "No promotional campaigns match your current filters. Create a new campaign to increase bulk sales.",
  },
  am: {
    title: "የማስተዋወቂያዎች እና የጅምላ ቅናሾች አስተዳደር",
    subtitle: "በመካቶክስ ላይ የብዛት ቅናሾችን፣ የፈጣን ሽያጭ ዘመቻዎችን፣ የኩፖን ኮዶችን እና የትራንስፖርት ድጎማዎችን ይፍጠሩ",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbPromotions: "ማስተዋወቂያዎች እና ቅናሾች",
    btnCreateCoupon: "የኩፖን ኮድ ፍጠር",
    btnLaunchCampaign: "አዲስ ዘመቻ ጀምር",
    tabAllCampaigns: "ሁሉም ዘመቻዎች እና ቅናሾች",
    tabCoupons: "ኩፖኖች እና የማስተዋወቂያ ኮዶች",
    tabAnalytics: "የዘመቻ ትንታኔ እና ለውጥ",
    tabPreview: "የባነር ቅድመ እይታ",
    liveEngine: "ንቁ የማስተዋወቂያ ሞተር",
    active: "ንቁ",
    scheduled: "የተያዘለት",
    paused: "የቆመ",
    expired: "ጊዜው ያለፈበት",
    totalSalesGenerated: "በማስተዋወቂያ የተገኘ አጠቃላይ ሽያጭ",
    conversionLift: "የሽያጭ እድገት",
    heroDescription: "የጅምላ ብዛት ቅናሾች፣ የኩፖን ኮዶች እና ወቅታዊ ቅናሾች ገዢዎች በመርካቶኤክስ ላይ ትላልቅ ትዕዛዞችን እንዲሰጡ ያበረታታሉ።",
    views: "የታዩ እይታዎች",
    conversions: "የተሰጡ ትዕዛዞች",
    discountsGiven: "አጠቃላይ የተሰጠ ቅናሽ",
    searchPlaceholder: "ዘመቻዎችን በስም፣ በምርት፣ በኮድ ወይም በምድብ ይፈልጉ...",
    allStatuses: "ሁሉም ሁኔታዎች",
    allTypes: "ሁሉም አይነቶች",
    volumeDiscount: "የብዛት ቅናሽ",
    flashSale: "የወቅቱ ፈጣን ቅናሽ",
    couponCode: "የኩፖን ኮድ",
    freeShipping: "የትራንስፖርት ድጎማ",
    emptyTitle: "ምንም ማስተዋወቂያ አልተገኘም",
    emptyDescription: "ከአሁኑ ማጣሪያ ጋር የሚዛመድ ዘመቻ የለም። የጅምላ ሽያጭዎን ለማሳደግ አዲስ ዘመቻ ይፍጠሩ።",
  },
  om: {
    title: "Sirna Beeksisaa fi Hir'ina Gurgurtaa Jumlaa",
    subtitle: "Gurgurtaa baay'inaa, hir'ina yeroodhaa, koodii kuuppoonii fi gargaarsa geejjibaa MercatoX irratti uumaa",
    breadcrumbDashboard: "Daashboordii",
    breadcrumbPromotions: "Beeksisaa fi Hir'ina",
    btnCreateCoupon: "Koodii Kuuppoonii Uumi",
    btnLaunchCampaign: "Duula Haaraa Jalqabi",
    tabAllCampaigns: "Duulawwan Hundaa fi Hir'ina",
    tabCoupons: "Kuuppoonota fi Koodii Beeksisaa",
    tabAnalytics: "Xiinxala Duulaa fi Jijjiirama",
    tabPreview: "Fakkiitti Argisiisa",
    liveEngine: "Mootora Beeksisaa Hojii Irra Jiru",
    active: "Hojii Irra",
    scheduled: "Kan Saganteeffame",
    paused: "Kan Dhaabbate",
    expired: "Yeroon Kan Dhumate",
    totalSalesGenerated: "Gurgurtaa Beeksisaan Argame Waliigalaa",
    conversionLift: "Gudddina Gurgurtaa",
    heroDescription: "Hir'inni gurgurtaa baay'inaa fi koodiin kuuppoonii bitattoonni ajaja guddaa akka kennan gargaara.",
    views: "Ilaalcha Kaataaloogii",
    conversions: "Ajajawwan Kennaman",
    discountsGiven: "Hir'ina Waliigala Kenname",
    searchPlaceholder: "Duulawwan maqaadhaan, oomishaan, koodiidhaan barbaadaa...",
    allStatuses: "Haalawwan Hundaa",
    allTypes: "Gosoota Hundaa",
    volumeDiscount: "Hir'ina Baay'inaa",
    flashSale: "Gurgurtaa Saffisaa",
    couponCode: "Koodii Kuuppoonii",
    freeShipping: "Deeggarsa Geejjibaa",
    emptyTitle: "Beeksisni Hin Argamne",
    emptyDescription: "Duulli qorannoo keessan wajjin walsimu hin jiru. Gurgurtaa dabaluuf duula haaraa uumaa.",
  },
  ti: {
    title: "ምምሕዳር መወዓውዒታትን ናይ ጅምላ ቅናሳትን",
    subtitle: "ናይ ብዝሒ ቅናሳት፣ ቅልጡፍ መሸጣታት፣ ናይ ኩፖን ኮዳትን ናይ መጓዓዝያ ሓገዝን ኣብ መርካቶኤክስ ፍጠሩ",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbPromotions: "መወዓውዒታትን ቅናሳትን",
    btnCreateCoupon: "ናይ ኩፖን ኮድ ፍጠር",
    btnLaunchCampaign: "ሓድሽ ዘመተ ጀምር",
    tabAllCampaigns: "ኩሎም ዘመተታትን ቅናሳትን",
    tabCoupons: "ኩፖናትን ናይ ምልላይ ኮዳትን",
    tabAnalytics: "ትንተና ዘመተን ውጽኢትን",
    tabPreview: "ናይ ባነር ቅድመ-ርእይቶ",
    liveEngine: "ንጡፍ ናይ መወዓውዒ ሞተር",
    active: "ንጡፍ",
    scheduled: "ዝተመደበ",
    paused: "ዝተዓገተ",
    expired: "ግዜኡ ዝሓለፈ",
    totalSalesGenerated: "ብመወዓውዒ ዝተረኽበ ጠቕላላ መሸጣ",
    conversionLift: "ዕብየት መሸጣ",
    heroDescription: "ናይ ብዝሒ ቅናሳትን ናይ ኩፖን ኮዳትን ዓደግቲ ዓበይቲ ትእዛዛት ከቕርቡ የተባብዑ።",
    views: "ዝተራእየ ምርኢታት",
    conversions: "ዝተዋህቡ ትእዛዛት",
    discountsGiven: "ዝተዋህበ ጠቕላላ ቅናስ",
    searchPlaceholder: "ዘመተታት ብስም፣ ብፍርያት፣ ብኮድ ድለዩ...",
    allStatuses: "ኩሎም ኩነታት",
    allTypes: "ኩሎም ዓይነታት",
    volumeDiscount: "ናይ ብዝሒ ቅናስ",
    flashSale: "ናይ ወቕቲ ቅልጡፍ ቅናስ",
    couponCode: "ናይ ኩፖን ኮድ",
    freeShipping: "ናይ መጓዓዝያ ሓገዝ",
    emptyTitle: "ዋላ ሓደ መወዓውዒ ኣይተረኽበን",
    emptyDescription: "ምስ መምረጺኹም ዝሰማማዕ ዘመተ ኣይተረኽበን። ሓድሽ ዘመተ ብምፍጣር መሸጣኹም ኣዕብዩ።",
  },
};

export interface DisputeTranslationDictionary {
  title: string;
  subtitle: string;
  breadcrumbDashboard: string;
  breadcrumbDisputes: string;
  badgeActiveMediation: string;
  btnArbitrationGuidelines: string;
  searchPlaceholder: string;
  filterAll: string;
  filterUnderReview: string;
  filterEscalated: string;
  filterResolved: string;
  emptyTitle: string;
  emptyDescription: string;
}

export const DISPUTE_TRANSLATIONS: Record<
  "en" | "am" | "om" | "ti",
  DisputeTranslationDictionary
> = {
  en: {
    title: "Commercial Dispute Center & Escrow Arbitration",
    subtitle: "Manage buyer quality discrepancy claims, submit independent ECAE certificates, and resolve Commercial Bank of Ethiopia escrow hearings",
    breadcrumbDashboard: "Dashboard",
    breadcrumbDisputes: "Disputes & Mediation",
    badgeActiveMediation: "Active Mediation Hearings",
    btnArbitrationGuidelines: "Arbitration Guidelines",
    searchPlaceholder: "Search case #, buyer company, commodity, or claim reason...",
    filterAll: "All Dispute Cases",
    filterUnderReview: "Under Review",
    filterEscalated: "Escalated to Ministry",
    filterResolved: "Resolved & Closed",
    emptyTitle: "No Disputes Found",
    emptyDescription: "No commercial dispute cases match your filter criteria.",
  },
  am: {
    title: "የንግድ አለመግባባቶች ማዕከል እና የኢስክሮው ግልግል",
    subtitle: "የገዢ የጥራት ቅሬታዎችን ያስተዳድሩ፣ ገለልተኛ የECAE የምስክር ወረቀቶችን ያስገቡ እና የኢትዮጵያ ንግድ ባንክ የኢስክሮው ውይይቶችን ይፍቱ",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbDisputes: "አለመግባባቶች እና ሽምግልና",
    badgeActiveMediation: "ንቁ የሽምግልና ሂደቶች",
    btnArbitrationGuidelines: "የግልግል መመሪያዎች",
    searchPlaceholder: "የጉዳይ #፣ የገዢ ኩባንያ፣ ምርት ወይም የይገባኛል ምክንያት ይፈልጉ...",
    filterAll: "ሁሉም የአለመግባባት ጉዳዮች",
    filterUnderReview: "በግምገማ ላይ ያለ",
    filterEscalated: "ወደ ሚኒስቴር የተላከ",
    filterResolved: "የተፈታ እና የተዘጋ",
    emptyTitle: "ምንም አለመግባባቶች አልተገኙም",
    emptyDescription: "ከማጣሪያ መስፈርትዎ ጋር የሚዛመድ ምንም የንግድ አለመግባባት የለም።",
  },
  om: {
    title: "Wiirtuu Mormii Daldalaa fi Araara Eeskirawuu",
    subtitle: "Kompii qulqullinaa bittootaa bulchaa, waraqaa ragaa ECAE galchaa, dhaddacha Eeskirawuu CBE furaa",
    breadcrumbDashboard: "Daashboordii",
    breadcrumbDisputes: "Mormii fi Araara",
    badgeActiveMediation: "Dhaddacha Araaraa Hojii Irra Jiru",
    btnArbitrationGuidelines: "Qajeelfama Araaraa",
    searchPlaceholder: "Lakk. dhimmaa, dhaabbata bittaa, oomisha barbaadaa...",
    filterAll: "Dhimmoota Mormii Hundaa",
    filterUnderReview: "Gamaaggama Keessa Jira",
    filterEscalated: "Ministeeraaf Ergameera",
    filterResolved: "Furamee Cufame",
    emptyTitle: "Mormiin Hin Argamne",
    emptyDescription: "Dhimmi mormii daldalaa ulaagaa calallii wajjin walsimu hin jiru.",
  },
  ti: {
    title: "ማእኸል ናይ ንግዲ ምስሕሓብን ሽምግልና ኢስክሮውን",
    subtitle: "ናይ ዓደግቲ ናይ ጽሬት ጥርዓናት ኣመሓድሩ፣ ናይ ECAE ናይ ጽሬት መረጋገጺ ኣእትዉ፣ ናይ CBE ኢስክሮው ምስሕሓባት ፍትሑ",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbDisputes: "ምስሕሓብን ሽምግልናን",
    badgeActiveMediation: "ንጡፋት ናይ ዕርቂ መስርሓት",
    btnArbitrationGuidelines: "መምርሒታት ሽምግልና",
    searchPlaceholder: "ቁጽሪ ጉዳይ፣ ትካል ዓዳጊ፣ ፍርያት ድለዩ...",
    filterAll: "ኩሎም ናይ ምስሕሓብ ጉዳያት",
    filterUnderReview: "ኣብ ግምገማ ዘሎ",
    filterEscalated: "ናብ ሚኒስትሪ ዝተላእኸ",
    filterResolved: "ዝተፈትሐን ዝተዓጽወን",
    emptyTitle: "ዋላ ሓደ ምስሕሓብ ኣይተረኽበን",
    emptyDescription: "ምስ መምረጺኹም ዝሰማማዕ ናይ ንግዲ ምስሕሓብ የለን።",
  },
};

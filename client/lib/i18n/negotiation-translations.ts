export interface NegotiationTranslationDictionary {
  title: string;
  subtitle: string;
  breadcrumbDashboard: string;
  breadcrumbNegotiations: string;
  badgeActiveDeals: string;
  searchPlaceholder: string;
  filterAll: string;
  filterPending: string;
  filterAccepted: string;
  filterDeclined: string;
  emptyTitle: string;
  emptyDescription: string;
  btnAcceptOffer: string;
  btnSendCounter: string;
  btnDecline: string;
  lblBuyerTarget: string;
  lblYourOffer: string;
  lblPriceGap: string;
}

export const NEGOTIATION_TRANSLATIONS: Record<
  "en" | "am" | "om" | "ti",
  NegotiationTranslationDictionary
> = {
  en: {
    title: "Customer Price Negotiations",
    subtitle: "Real-time commercial discussions, counter-offers, and CBE Escrow agreements with your buyers",
    breadcrumbDashboard: "Dashboard",
    breadcrumbNegotiations: "Negotiations",
    badgeActiveDeals: "Active Deals",
    searchPlaceholder: "Search by buyer company, RFQ ref, or product...",
    filterAll: "All Deals",
    filterPending: "Active Negotiations",
    filterAccepted: "Agreed & Closed",
    filterDeclined: "Declined",
    emptyTitle: "No Negotiations Found",
    emptyDescription: "No negotiations match your search filter.",
    btnAcceptOffer: "Accept Buyer Offer",
    btnSendCounter: "Send Counter Offer",
    btnDecline: "Decline Offer",
    lblBuyerTarget: "Buyer Target Price",
    lblYourOffer: "Your Current Offer",
    lblPriceGap: "Price Gap",
  },
  am: {
    title: "የደንበኞች የዋጋ ድርድሮች",
    subtitle: "ከገዢዎችዎ ጋር የእውነተኛ ጊዜ የንግድ ውይይቶች፣ አጸፋዊ ቅናሾች እና የCBE ኢስክሮው ስምምነቶች",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbNegotiations: "ድርድሮች",
    badgeActiveDeals: "ንቁ ድርድሮች",
    searchPlaceholder: "በገዢ ኩባንያ፣ በRFQ ማጣቀሻ ወይም በምርት ይፈልጉ...",
    filterAll: "ሁሉም ድርድሮች",
    filterPending: "ንቁ ድርድሮች",
    filterAccepted: "ስምምነት የተደረሰባቸው",
    filterDeclined: "ውድቅ የተደረጉ",
    emptyTitle: "ምንም ድርድሮች አልተገኙም",
    emptyDescription: "ከፍለጋ ማጣሪያዎ ጋር የሚዛመድ ምንም ድርድር የለም።",
    btnAcceptOffer: "የገዢውን ዋጋ ተቀበል",
    btnSendCounter: "አጸፋዊ ዋጋ ላክ",
    btnDecline: "ውድቅ አድርግ",
    lblBuyerTarget: "የገዢው የታለመ ዋጋ",
    lblYourOffer: "የእርስዎ የአሁን ዋጋ",
    lblPriceGap: "የዋጋ ልዩነት",
  },
  om: {
    title: "Marii Gatii Maamiltootaa",
    subtitle: "Marii daldalaa yeroo qabatamaa, yaada dhiyeessaa fi waliigaltee Eeskirawuu CBE bittoota wajjin",
    breadcrumbDashboard: "Daashboordii",
    breadcrumbNegotiations: "Marii",
    badgeActiveDeals: "Daldala Hojii Irra Jiru",
    searchPlaceholder: "Dhaabbata bittaa, eeruu RFQ ykn oomishaan barbaadi...",
    filterAll: "Daldala Hundaa",
    filterPending: "Marii Hojii Irra Jiru",
    filterAccepted: "Walii Galamee Cufame",
    filterDeclined: "Kufaa Ta'e",
    emptyTitle: "Mariin Hin Argamne",
    emptyDescription: "Mariin qorannoo keessan wajjin walsimu hin jiru.",
    btnAcceptOffer: "Gatii Bittaa Fudhadhu",
    btnSendCounter: "Gatii Jijjiiramaa Ergi",
    btnDecline: "Kufaa Taasisi",
    lblBuyerTarget: "Gatii Bittaa Hawwame",
    lblYourOffer: "Gatii Keessan Ammaa",
    lblPriceGap: "Garaagarummaa Gatii",
  },
  ti: {
    title: "ናይ ዓደግቲ ናይ ዋጋ ድርድራት",
    subtitle: "ምስ ዓደግትኹም ናይ ቀጥታ ናይ ንግዲ ዘተታት፣ ተጻራሪ ዋጋታትን ናይ CBE ኢስክሮው ስምምዓትን",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbNegotiations: "ድርድራት",
    badgeActiveDeals: "ንጡፋት ውዕላት",
    searchPlaceholder: "ብትካል ዓዳጊ፣ ብመወከሲ RFQ ወይ ብፍርያት ድለዩ...",
    filterAll: "ኩሎም ድርድራት",
    filterPending: "ንጡፋት ድርድራት",
    filterAccepted: "ስምምዕ ዝተገብረሎም",
    filterDeclined: "ውድቂ ዝኾኑ",
    emptyTitle: "ዋላ ሓደ ድርድር ኣይተረኽበን",
    emptyDescription: "ምስ መምረጺኹም ዝሰማማዕ ድርድር የለን።",
    btnAcceptOffer: "ናይ ዓዳጊ ዋጋ ተቐበል",
    btnSendCounter: "ተጻራሪ ዋጋ ስደድ",
    btnDecline: "ውድቂ ግበር",
    lblBuyerTarget: "ናይ ዓዳጊ ዝተደለየ ዋጋ",
    lblYourOffer: "ናታትኩም ናይ ሕጂ ዋጋ",
    lblPriceGap: "ናይ ዋጋ ፍልልይ",
  },
};

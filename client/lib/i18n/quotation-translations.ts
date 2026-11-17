export interface QuotationTranslationDictionary {
  title: string;
  subtitle: string;
  breadcrumbDashboard: string;
  breadcrumbQuotations: string;
  badgeActiveProformas: string;
  btnCreateQuote: string;
  searchPlaceholder: string;
  filterAll: string;
  filterSent: string;
  filterAccepted: string;
  filterNegotiating: string;
  filterRejected: string;
  filterWithdrawn: string;
  thQuoteNumber: string;
  thBuyerCompany: string;
  thProductsVolume: string;
  thSubtotal: string;
  thTotal: string;
  thValidUntil: string;
  thStatus: string;
  thActions: string;
  emptyTitle: string;
  emptyDescription: string;
}

export const QUOTATION_TRANSLATIONS: Record<
  "en" | "am" | "om" | "ti",
  QuotationTranslationDictionary
> = {
  en: {
    title: "Formal Quotations & Proforma Invoices",
    subtitle: "Generate binding enterprise quotations with incoterms, payment milestones, tiered volume rates, and validity periods",
    breadcrumbDashboard: "Dashboard",
    breadcrumbQuotations: "Quotations",
    badgeActiveProformas: "Active Proformas",
    btnCreateQuote: "Create New Quotation",
    searchPlaceholder: "Filter quotes by number, buyer company, or product...",
    filterAll: "All Quotations",
    filterSent: "Sent / Pending",
    filterAccepted: "Accepted by Buyer",
    filterNegotiating: "Counter Negotiating",
    filterRejected: "Rejected",
    filterWithdrawn: "Withdrawn",
    thQuoteNumber: "Quote Number",
    thBuyerCompany: "Buyer Company",
    thProductsVolume: "Products & Volume",
    thSubtotal: "Subtotal",
    thTotal: "Total (inc. VAT)",
    thValidUntil: "Valid Until",
    thStatus: "Status",
    thActions: "Actions",
    emptyTitle: "No Quotations Found",
    emptyDescription: "You haven't issued any quotations matching your search criteria.",
  },
  am: {
    title: "መደበኛ የዋጋ ማቅረቢያዎች እና የፕሮፎርማ ደረሰኞች",
    subtitle: "የማስረከቢያ ውሎች፣ የክፍያ ምዕራፎች፣ የጅምላ ቅናሾች እና የማረጋገጫ ጊዜ ያላቸውን የድርጅት ዋጋ ማቅረቢያዎች ያመንጩ",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbQuotations: "የዋጋ ማቅረቢያዎች",
    badgeActiveProformas: "ንቁ ፕሮፎርማዎች",
    btnCreateQuote: "አዲስ የዋጋ ማቅረቢያ ፍጠር",
    searchPlaceholder: "የዋጋ ማቅረቢያዎችን በቁጥር፣ በገዢ ኩባንያ ወይም በምርት ይፈልጉ...",
    filterAll: "ሁሉም የዋጋ ማቅረቢያዎች",
    filterSent: "የተላከ / በመጠባበቅ ላይ",
    filterAccepted: "በገዢ ተቀባይነት ያገኘ",
    filterNegotiating: "በድርድር ላይ",
    filterRejected: "ውድቅ የተደረገ",
    filterWithdrawn: "የተነሳ",
    thQuoteNumber: "የዋጋ ማቅረቢያ ቁጥር",
    thBuyerCompany: "የገዢ ኩባንያ",
    thProductsVolume: "ምርቶች እና መጠን",
    thSubtotal: "ንዑስ ድምር",
    thTotal: "ጠቅላላ (ከተ.እ.ታ ጋር)",
    thValidUntil: "የሚያበቃበት ቀን",
    thStatus: "ሁኔታ",
    thActions: "እርምጃዎች",
    emptyTitle: "ምንም የዋጋ ማቅረቢያዎች አልተገኙም",
    emptyDescription: "ከፍለጋ መስፈርትዎ ጋር የሚዛመድ ምንም የዋጋ ማቅረቢያ አልተሰጠም።",
  },
  om: {
    title: "Waraqaa Gatii fi Nagahee Piroofoormaa",
    subtitle: "Waraqaa gatii dhaabbataa ulaagaa daldalaa, kaffaltii fi sadarkaa gatii wajjin baasaa",
    breadcrumbDashboard: "Daashboordii",
    breadcrumbQuotations: "Waraqaa Gatii",
    badgeActiveProformas: "Piroofoormaa Hojii Irra Jiru",
    btnCreateQuote: "Waraqaa Gatii Haaraa Uumi",
    searchPlaceholder: "Waraqaa gatii lakkoofsaan, dhaabbataan ykn oomishaan barbaadi...",
    filterAll: "Waraqaa Gatii Hundaa",
    filterSent: "Ergameera / Eegaa Jira",
    filterAccepted: "Bittaadhaan Fudhatame",
    filterNegotiating: "Marii Keessa Jira",
    filterRejected: "Kufaa Ta'e",
    filterWithdrawn: "Haqameera",
    thQuoteNumber: "Lakkoofsa Waraqaa Gatii",
    thBuyerCompany: "Dhaabbata Bittaa",
    thProductsVolume: "Oomishaalee fi Hamma",
    thSubtotal: "Ida'ama Xiqqaa",
    thTotal: "Waliigala (VAT Dabalatee)",
    thValidUntil: "Hamma Guyyaa",
    thStatus: "Haala",
    thActions: "Tarkaanfii",
    emptyTitle: "Waraqaan Gatii Hin Argamne",
    emptyDescription: "Ulaagaa barbaacha keessaniin waraqaan gatii hin argamne.",
  },
  ti: {
    title: "ስሩዕ ናይ ዋጋ መቕረብን ፕሮፎርማ ደረሰኝታትን",
    subtitle: "ናይ ንግዲ ውዕላት፣ ናይ ክፍሊት ብርክታት፣ ናይ ጅምላ ቅናሻትን ናይ ጽንዓት ግዜን ዘለዎም ናይ ትካል ዋጋ መቕረብቲ ኣውጽኡ",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbQuotations: "ናይ ዋጋ መቕረብቲ",
    badgeActiveProformas: "ንጡፋት ፕሮፎርማታት",
    btnCreateQuote: "ሓዱሽ ናይ ዋጋ መቕረቢ ፍጠር",
    searchPlaceholder: "ዋጋ መቕረብቲ ብቁጽሪ፣ ብትካል ዓዳጊ ወይ ብፍርያት ድለዩ...",
    filterAll: "ኩሎም ናይ ዋጋ መቕረብቲ",
    filterSent: "ዝተላእኸ / ዝጽበ",
    filterAccepted: "ብዓዳጊ ዝተቐበሎ",
    filterNegotiating: "ኣብ ድርድር ዘሎ",
    filterRejected: "ውድቂ ዝኾነ",
    filterWithdrawn: "ዝተሳሕበ",
    thQuoteNumber: "ቁጽሪ ዋጋ መቕረቢ",
    thBuyerCompany: "ትካል ዓዳጊ",
    thProductsVolume: "ፍርያትን መጠንን",
    thSubtotal: "ንኡስ ድምር",
    thTotal: "ጠቕላላ (ምስ VAT)",
    thValidUntil: "ዘብቅዓሉ ዕለት",
    thStatus: "ኩነታት",
    thActions: "ተግባራት",
    emptyTitle: "ዋላ ሓደ ዋጋ መቕረቢ ኣይተረኽበን",
    emptyDescription: "ምስ መምረጺኹም ዝሰማማዕ ዋላ ሓደ ዋጋ መቕረቢ ኣይተዋህበን።",
  },
};

export interface MessageTranslationDictionary {
  title: string;
  subtitle: string;
  breadcrumbDashboard: string;
  breadcrumbMessages: string;
  badgeUnread: string;
  searchPlaceholder: string;
  filterAll: string;
  filterUnread: string;
  filterOrders: string;
  filterQuotes: string;
  emptyTitle: string;
  emptyDescription: string;
  btnShareQuote: string;
  btnCallBuyer: string;
  inputPlaceholder: string;
  btnSend: string;
}

export const MESSAGE_TRANSLATIONS: Record<
  "en" | "am" | "om" | "ti",
  MessageTranslationDictionary
> = {
  en: {
    title: "Direct B2B Commercial Messaging",
    subtitle: "Real-time procurement communications with authenticated enterprise buyers, instant quotation sharing, and order milestone context",
    breadcrumbDashboard: "Dashboard",
    breadcrumbMessages: "Messages",
    badgeUnread: "Unread Inquiry Messages",
    searchPlaceholder: "Search buyers, RFQ discussions, or message contents...",
    filterAll: "All Inboxes",
    filterUnread: "Unread Messages",
    filterOrders: "Active PO Orders",
    filterQuotes: "Quotation Chats",
    emptyTitle: "No Conversations Yet",
    emptyDescription: "There are currently no active communication channels with buyers. When buyers message your sales desk or submit RFQs, real-time message channels will appear here.",
    btnShareQuote: "Share Formal Quotation",
    btnCallBuyer: "Direct Voice Call",
    inputPlaceholder: "Type your commercial response to buyer...",
    btnSend: "Send Message",
  },
  am: {
    title: "የቀጥታ B2B የንግድ መልእክቶች",
    subtitle: "ከተረጋገጡ የድርጅት ገዢዎች ጋር የእውነተኛ ጊዜ የግዢ ግንኙነቶች፣ ፈጣን የዋጋ ማጋራት እና የትዕዛዝ ደረጃዎችን መከታተል",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbMessages: "መልእክቶች",
    badgeUnread: "ያልተነበቡ የጥያቄ መልእክቶች",
    searchPlaceholder: "ገዢዎችን፣ የRFQ ውይይቶችን ወይም የመልእክት ይዘቶችን ይፈልጉ...",
    filterAll: "ሁሉም መልእክቶች",
    filterUnread: "ያልተነበቡ መልእክቶች",
    filterOrders: "ንቁ የግዢ ትዕዛዞች",
    filterQuotes: "የዋጋ ውይይቶች",
    emptyTitle: "እስካሁን ምንም ውይይቶች የሉም",
    emptyDescription: "በአሁኑ ጊዜ ከገዢዎች ጋር ምንም ንቁ የግንኙነት መስመሮች የሉም። ገዢዎች ሲጽፉ ወይም RFQ ሲያቀርቡ እዚህ ይታያሉ።",
    btnShareQuote: "መደበኛ የዋጋ ማቅረቢያ አጋራ",
    btnCallBuyer: "የቀጥታ የድምጽ ጥሪ",
    inputPlaceholder: "የንግድ ምላሽዎን እዚህ ይጻፉ...",
    btnSend: "መልእክት ላክ",
  },
  om: {
    title: "Ergaa Daldalaa B2B Kallattii",
    subtitle: "Bittoota dhaabbataa mirkanaa'an wajjin qunnamtii yeroo qabatamaa, qoodiinsa waraqaa gatii fi haala ajajaa",
    breadcrumbDashboard: "Daashboordii",
    breadcrumbMessages: "Ergaawwan",
    badgeUnread: "Ergaa Hin Dubbifamne",
    searchPlaceholder: "Bittoota, marii RFQ ykn qabiyyee ergaa barbaadaa...",
    filterAll: "Ergaawwan Hundaa",
    filterUnread: "Ergaa Hin Dubbifamne",
    filterOrders: "Ajajoota Bittaa Hojii Irra Jiran",
    filterQuotes: "Marii Waraqaa Gatii",
    emptyTitle: "Hanga Ammaatti Mariin Hin Jiru",
    emptyDescription: "Ammaaf sararri qunnamtii bittoota wajjin jiru hin jiru. Yeroo isaan barreessan asitti mul'ata.",
    btnShareQuote: "Waraqaa Gatii Qoodi",
    btnCallBuyer: "Waamicha Sagalee Kallattii",
    inputPlaceholder: "Deebii daldalaa keessan barreessaa...",
    btnSend: "Ergaa Ergi",
  },
  ti: {
    title: "ቀጥታዊ ናይ B2B ንግዲ መልእኽትታት",
    subtitle: "ምስ ዝተረጋገጹ ናይ ትካል ዓደግቲ ናይ ቀጥታ ናይ ምዕዳግ ርክባት፣ ቅልጡፍ ዋጋ ምክፋልን ደረጃ ትእዛዝ ምክትታልን",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbMessages: "መልእኽትታት",
    badgeUnread: "ዘይተነበቡ ናይ ሕቶ መልእኽትታት",
    searchPlaceholder: "ዓደግቲ፣ ናይ RFQ ዘተታት ወይ ትሕዝቶ መልእኽቲ ድለዩ...",
    filterAll: "ኩሎም መልእኽትታት",
    filterUnread: "ዘይተነበቡ መልእኽትታት",
    filterOrders: "ንጡፋት ናይ ምዕዳግ ትእዛዛት",
    filterQuotes: "ናይ ዋጋ ዕላላት",
    emptyTitle: "ክሳብ ሕጂ ዝኾነ ዕላል የለን",
    emptyDescription: "ኣብዚ እዋን ምስ ዓደግቲ ዝኾነ ንጡፍ ናይ ርክብ መስመር የለን። ዓደግቲ ክጽሕፉ እንከለዉ ኣብዚ ክረኣዩ እዮም።",
    btnShareQuote: "ስሩዕ ናይ ዋጋ መቕረቢ ኣካፍል",
    btnCallBuyer: "ቀጥታዊ ናይ ድምጺ ጻውዒት",
    inputPlaceholder: "ናይ ንግዲ መልስኹም ኣብዚ ጸሓፉ...",
    btnSend: "መልእኽቲ ስደድ",
  },
};

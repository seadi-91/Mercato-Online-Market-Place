export interface ShipmentTranslationDictionary {
  title: string;
  subtitle: string;
  btnFilters: string;
  btnExport: string;
  btnCreateShipment: string;
  kpiTotal: string;
  kpiPending: string;
  kpiPreparing: string;
  kpiInTransit: string;
  kpiDelivered: string;
  kpiDelayed: string;
  searchPlaceholder: string;
  thShipment: string;
  thOrder: string;
  thBuyer: string;
  thOrigin: string;
  thDestination: string;
  thItems: string;
  thCarrier: string;
  thExpectedDelivery: string;
  thStatus: string;
  thActions: string;
  emptyTitle: string;
  emptyDescription: string;
}

export const SHIPMENT_TRANSLATIONS: Record<
  "en" | "am" | "om" | "ti",
  ShipmentTranslationDictionary
> = {
  en: {
    title: "Shipment Management",
    subtitle: "Track deliveries, manage dispatches, and monitor shipment status.",
    btnFilters: "Filters",
    btnExport: "Export",
    btnCreateShipment: "+ Create Shipment",
    kpiTotal: "Total Shipments",
    kpiPending: "Pending",
    kpiPreparing: "Preparing",
    kpiInTransit: "In Transit",
    kpiDelivered: "Delivered",
    kpiDelayed: "Delayed",
    searchPlaceholder: "Search shipment, order, buyer, tracking...",
    thShipment: "Shipment",
    thOrder: "Order",
    thBuyer: "Buyer",
    thOrigin: "Origin",
    thDestination: "Destination",
    thItems: "Items",
    thCarrier: "Carrier",
    thExpectedDelivery: "Expected Delivery",
    thStatus: "Status",
    thActions: "Actions",
    emptyTitle: "No shipments yet",
    emptyDescription: "Shipments created from confirmed orders will appear here.",
  },
  am: {
    title: "የጭነት እና የማጓጓዣ አስተዳደር",
    subtitle: "ማድረሻዎችን ይከታተሉ፣ ስርጭቶችን ያስተዳድሩ እና የጭነት ሁኔታን ይቆጣጠሩ።",
    btnFilters: "ማጣሪያዎች",
    btnExport: "አውርድ",
    btnCreateShipment: "+ ጭነት ፍጠር",
    kpiTotal: "ጠቅላላ ጭነቶች",
    kpiPending: "በመጠባበቅ ላይ",
    kpiPreparing: "በመዘጋጀት ላይ",
    kpiInTransit: "በጉዞ ላይ",
    kpiDelivered: "የደረሰ",
    kpiDelayed: "የዘገየ",
    searchPlaceholder: "ጭነት፣ ትዕዛዝ፣ ገዢ፣ የመከታተያ ቁጥር ይፈልጉ...",
    thShipment: "የጭነት ቁጥር",
    thOrder: "ትዕዛዝ",
    thBuyer: "ገዢ",
    thOrigin: "መነሻ",
    thDestination: "መዳረሻ",
    thItems: "ዕቃዎች",
    thCarrier: "አጓጓዥ",
    thExpectedDelivery: "የሚደርስበት ቀን",
    thStatus: "ሁኔታ",
    thActions: "እርምጃዎች",
    emptyTitle: "እስካሁን ምንም ጭነት የለም",
    emptyDescription: "ከተረጋገጡ ትዕዛዞች የተፈጠሩ ጭነቶች እዚህ ይታያሉ።",
  },
  om: {
    title: "Bulchiinsa Geejjibaa",
    subtitle: "Geejjiba hordofaa, ergisaa bulchaa fi haala geejjibaa to'adhaa.",
    btnFilters: "Calaltuu",
    btnExport: "Baasi",
    btnCreateShipment: "+ Geejjiba Uumi",
    kpiTotal: "Waliigala Geejjibaa",
    kpiPending: "Eegaa Jira",
    kpiPreparing: "Qophaa'aa Jira",
    kpiInTransit: "Adeemsa Irra Jiru",
    kpiDelivered: "Ga'eera",
    kpiDelayed: "Tureera",
    searchPlaceholder: "Geejjiba, ajaja, bittaa, koodii hordoffii barbaadi...",
    thShipment: "Geejjiba",
    thOrder: "Ajaja",
    thBuyer: "Bittaa",
    thOrigin: "Madda",
    thDestination: "Bakka Ga'umsaa",
    thItems: "Meeshaalee",
    thCarrier: "Geejjibsiisaa",
    thExpectedDelivery: "Guyyaa Eegamu",
    thStatus: "Haala",
    thActions: "Tarkaanfii",
    emptyTitle: "Hanga ammaatti geejjibni hin jiru",
    emptyDescription: "Geejjibni ajaja mirkanaa'e irraa uumame asitti mul'ata.",
  },
  ti: {
    title: "ምምሕዳር መጓዓዝያ",
    subtitle: "ምብጻሕ ተኸታተሉ፣ ስርጭታት ኣመሓድሩ፣ ኩነታት መጓዓዝያ ተቘጻጸሩ።",
    btnFilters: "መጻረዪታት",
    btnExport: "ኣውርድ",
    btnCreateShipment: "+ መጓዓዝያ ፍጠር",
    kpiTotal: "ጠቕላላ መጓዓዝያታት",
    kpiPending: "ዝጽበ",
    kpiPreparing: "ይዳሎ ኣሎ",
    kpiInTransit: "ኣብ ጉዕዞ ዘሎ",
    kpiDelivered: "ዝበጽሐ",
    kpiDelayed: "ዝደንጐየ",
    searchPlaceholder: "መጓዓዝያ፣ ትእዛዝ፣ ዓዳጊ፣ መከታተሊ ቁጽሪ ድለዩ...",
    thShipment: "መጓዓዝያ",
    thOrder: "ትእዛዝ",
    thBuyer: "ዓዳጊ",
    thOrigin: "መበገሲ",
    thDestination: "መብጻሒ",
    thItems: "ኣቑሑት",
    thCarrier: "መጓዓዚ",
    thExpectedDelivery: "ዝጽበየሉ ዕለት",
    thStatus: "ኩነታት",
    thActions: "ተግባራት",
    emptyTitle: "ክሳብ ሕጂ ዝተላእኸ መጓዓዝያ የለን",
    emptyDescription: "ካብ ዝተረጋገጹ ትእዛዛት ዝተፈጥሩ መጓዓዝያታት ኣብዚ ክረኣዩ እዮም።",
  },
};

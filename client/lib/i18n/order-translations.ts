import type { LanguageCode } from "./translations";

export interface OrdersTranslationDictionary {
  // Page Header
  ordersTitle: string;
  ordersSubtitle: string;
  breadcrumbDashboard: string;
  breadcrumbOrders: string;
  refreshBtn: string;
  activeOrdersBadge: string;

  // Perspective Switcher
  perspectiveSales: string;
  perspectivePurchases: string;

  // Branch Scope / Hub Filter
  branchOpsView: string;
  loggedInAs: string;
  isolatedBranchScope: string;
  regionalHubFilter: string;
  allEnterpriseHubs: string;

  // Search & Filter Bar
  searchOrdersPlaceholder: string;
  filterAllStatuses: string;
  statusPending: string;
  statusConfirmed: string;
  statusProcessing: string;
  statusPacked: string;
  statusShipped: string;
  statusDelivered: string;
  statusCompleted: string;
  statusCancelled: string;
  exportRegisterSuccess: string;

  // Loading & Empty States
  loadingOrdersDb: string;
  unableToLoadOrders: string;
  retryBtn: string;
  noOrdersFoundTitle: string;
  noOrdersFoundDesc: string;

  // Table Columns
  colOrderId: string;
  colBuyerCustomer: string;
  colCommodityVolume: string;
  colOrderTotal: string;
  colBranchHub: string;
  colFleetDriver: string;
  colPaymentRef: string;
  colStatus: string;
  colDate: string;
  colActions: string;

  // Action Menu Items
  actionViewDetail: string;
  actionUpdateStatus: string;
  actionAssignDriver: string;
  actionPrintWaybill: string;
  actionContactBuyer: string;
  actionDeleteOrder: string;

  // Full Screen Order Detail View
  backToAllOrders: string;
  placedOn: string;
  printWaybillInvoice: string;
  updateFulfillment: string;
  customerBuyerInfo: string;
  commercialEnterprise: string;
  contactRepresentative: string;
  deliveryDestination: string;
  commodityOrdered: string;
  unitPriceLabel: string;
  lineTotalLabel: string;
  cbeEscrowDetails: string;
  escrowStatusLabel: string;
  securedByCbe: string;
  gatewayRefLabel: string;
  paymentChannelTerms: string;
  instrumentLabel: string;
  escrowGuaranteeNotice: string;
  freightLogisticsDriver: string;
  assignDriverNow: string;
  changeDriver: string;
  dispatchedOnRoute: string;
  assignedVehicleLabel: string;
  vehiclePlateLabel: string;
  driverMobileLabel: string;
  noDriverAssignedYet: string;
  assignDriverInstructions: string;
  carrierFleetLabel: string;
  pendingCarrierAssignment: string;
  waybillNumberLabel: string;
  pendingBooking: string;
  originDepotLabel: string;
  copiedToClipboard: string;

  // Driver Assignment Modal
  assignDriverModalTitle: string;
  assignDriverModalSubtitle: string;
  selectDriverLabel: string;
  selectDriverPlaceholder: string;
  noDriversRegisteredBranch: string;
  confirmAssignBtn: string;
  cancelBtn: string;
}

export const ORDERS_TRANSLATIONS: Record<LanguageCode, OrdersTranslationDictionary> = {
  en: {
    ordersTitle: "B2B Purchase Orders Management",
    ordersSubtitle: "Process commercial purchase orders, review Escrow fund guarantees, update packaging milestones, and dispatch freight carriers",
    breadcrumbDashboard: "Dashboard",
    breadcrumbOrders: "Orders",
    refreshBtn: "Refresh",
    activeOrdersBadge: "{count} Active Orders",

    perspectiveSales: "Customer Sales Orders ({count})",
    perspectivePurchases: "My Sourcing Purchases ({count})",

    branchOpsView: "Branch Operations View: Managing orders strictly scoped to",
    loggedInAs: "Logged in as",
    isolatedBranchScope: "Isolated Branch Scope",
    regionalHubFilter: "Regional Hub Filter:",
    allEnterpriseHubs: "All Enterprise Hubs ({count})",

    searchOrdersPlaceholder: "Search orders by Order ID, buyer enterprise, commodity, or contact person...",
    filterAllStatuses: "All Statuses",
    statusPending: "Pending Review",
    statusConfirmed: "Confirmed",
    statusProcessing: "Processing & Milling",
    statusPacked: "Packed & Weighed",
    statusShipped: "Shipped in Transit",
    statusDelivered: "Delivered",
    statusCompleted: "Completed",
    statusCancelled: "Cancelled / Rejected",
    exportRegisterSuccess: "Exporting purchase orders register...",

    loadingOrdersDb: "Fetching real purchase orders from database...",
    unableToLoadOrders: "Unable to load purchase orders",
    retryBtn: "Retry",
    noOrdersFoundTitle: "No Orders Found",
    noOrdersFoundDesc: "No purchase orders match your active filter parameters.",

    colOrderId: "Order ID",
    colBuyerCustomer: "Buyer / Customer",
    colCommodityVolume: "Commodity & Volume",
    colOrderTotal: "Order Total (ETB)",
    colBranchHub: "Branch Hub",
    colFleetDriver: "Fleet Driver",
    colPaymentRef: "Payment & Ref",
    colStatus: "Status",
    colDate: "Date",
    colActions: "Actions",

    actionViewDetail: "View Full Details",
    actionUpdateStatus: "Update Milestone",
    actionAssignDriver: "Assign Driver",
    actionPrintWaybill: "Print Waybill",
    actionContactBuyer: "Contact Buyer",
    actionDeleteOrder: "Delete Order",

    backToAllOrders: "Back to All Orders",
    placedOn: "Placed on",
    printWaybillInvoice: "Print Waybill / Invoice",
    updateFulfillment: "Update Fulfillment",
    customerBuyerInfo: "Customer & Buyer Information",
    commercialEnterprise: "Commercial Enterprise",
    contactRepresentative: "Contact Representative",
    deliveryDestination: "Delivery Destination / Hub",
    commodityOrdered: "Commodity Ordered & Volume",
    unitPriceLabel: "Unit Price",
    lineTotalLabel: "Line Total",
    cbeEscrowDetails: "CBE Escrow & Payment Guarantees",
    escrowStatusLabel: "Escrow Deposit Status:",
    securedByCbe: "100% Secured by CBE Commercial Escrow",
    gatewayRefLabel: "Gateway Ref:",
    paymentChannelTerms: "Payment Channel / Terms:",
    instrumentLabel: "Instrument:",
    escrowGuaranteeNotice: "Commercial Bank of Ethiopia holds full deposit in an irrevocable escrow account. Payout is automatically released to your supplier account upon destination delivery inspection signoff.",
    freightLogisticsDriver: "Freight Logistics & Assigned Driver",
    assignDriverNow: "Assign Driver Now",
    changeDriver: "Change Driver",
    dispatchedOnRoute: "Dispatched On-Route",
    assignedVehicleLabel: "Assigned Vehicle:",
    vehiclePlateLabel: "Vehicle Plate",
    driverMobileLabel: "Driver Mobile",
    noDriverAssignedYet: "No driver assigned to this order yet.",
    assignDriverInstructions: "Assign a fleet driver registered under this branch to generate waybill and begin shipment.",
    carrierFleetLabel: "Carrier / Fleet:",
    pendingCarrierAssignment: "Pending Carrier Assignment",
    waybillNumberLabel: "Waybill Number:",
    pendingBooking: "Pending Booking",
    originDepotLabel: "Origin Depot:",
    copiedToClipboard: "Copied {label} to clipboard!",

    assignDriverModalTitle: "Assign Fleet Driver & Vehicle",
    assignDriverModalSubtitle: "Select an active fleet driver registered at this warehouse hub to dispatch this shipment.",
    selectDriverLabel: "Choose Fleet Driver:",
    selectDriverPlaceholder: "-- Select Fleet Driver --",
    noDriversRegisteredBranch: "No active drivers registered at this branch. Register a driver in Staff Roster first.",
    confirmAssignBtn: "Confirm & Assign Driver",
    cancelBtn: "Cancel",
  },

  am: {
    ordersTitle: "የB2B የጅምላ ግዢ ትዕዛዞች አስተዳደር",
    ordersSubtitle: "የንግድ ግዢ ትዕዛዞችን ያከናውኑ፣ የእስክሮው ዋስትናን ያረጋግጡ፣ የማሸግ ደረጃዎችን ያዘምኑ እና አጓጓዦችን ያሰማሩ",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbOrders: "ትዕዛዞች",
    refreshBtn: "አድስ",
    activeOrdersBadge: "{count} ንቁ ትዕዛዞች",

    perspectiveSales: "የደንበኞች የሽያጭ ትዕዛዞች ({count})",
    perspectivePurchases: "የራሴ የጅምላ ግዢዎች ({count})",

    branchOpsView: "የቅርንጫፍ ስራዎች እይታ፡ ትዕዛዞችን የሚያስተዳድሩት ለ",
    loggedInAs: "የገቡበት መለያ",
    isolatedBranchScope: "የተለየ የቅርንጫፍ ክልል",
    regionalHubFilter: "የክልል መጋዘን ማጣሪያ፦",
    allEnterpriseHubs: "ሁሉም የድርጅቱ መጋዘኖች ({count})",

    searchOrdersPlaceholder: "በትዕዛዝ ቁጥር፣ በገዢ ድርጅት፣ በምርት ስም ወይም በተጠሪ ሰው ይፈልጉ...",
    filterAllStatuses: "ሁሉም ሁኔታዎች",
    statusPending: "ግምገማ የሚጠብቅ",
    statusConfirmed: "የተረጋገጠ",
    statusProcessing: "በዝግጅትና ማቀነባበሪያ ላይ",
    statusPacked: "የታሸገና የተመዘነ",
    statusShipped: "የተላከ / በጉዞ ላይ",
    statusDelivered: "የደረሰ",
    statusCompleted: "የተጠናቀቀ",
    statusCancelled: "የተሰረዘ / ውድቅ የተደረገ",
    exportRegisterSuccess: "የትዕዛዞች መዝገብ በመውረድ ላይ ነው...",

    loadingOrdersDb: "ትዕዛዞች ከዳታቤዝ እየተጫኑ ነው...",
    unableToLoadOrders: "ትዕዛዞችን መጫን አልተቻለም",
    retryBtn: "እንደገና ሞክር",
    noOrdersFoundTitle: "ምንም ትዕዛዝ አልተገኘም",
    noOrdersFoundDesc: "ከተመረጡት ማጣሪያዎች ጋር የሚዛመድ ምንም የጅምላ ትዕዛዝ አልተገኘም።",

    colOrderId: "የትዕዛዝ ቁጥር",
    colBuyerCustomer: "ገዢ / ደንበኛ",
    colCommodityVolume: "ምርት እና መጠን",
    colOrderTotal: "አጠቃላይ ዋጋ (ብር)",
    colBranchHub: "ቅርንጫፍ መጋዘን",
    colFleetDriver: "አሽከርካሪ",
    colPaymentRef: "ክፍያ እና ማጣቀሻ",
    colStatus: "ሁኔታ",
    colDate: "ቀን",
    colActions: "ተግባራት",

    actionViewDetail: "ሙሉ ዝርዝር እይ",
    actionUpdateStatus: "የሂደት ደረጃ ቀይር",
    actionAssignDriver: "አሽከርካሪ መድብ",
    actionPrintWaybill: "የመንገድ ወረቀት አትም",
    actionContactBuyer: "ገዢውን አግኝ",
    actionDeleteOrder: "ትዕዛዝ ሰርዝ",

    backToAllOrders: "ወደ ሁሉም ትዕዛዞች ተመለስ",
    placedOn: "የተሰጠበት ቀን",
    printWaybillInvoice: "የጭነት ዝርዝር / ደረሰኝ አትም",
    updateFulfillment: "የማድረስ ደረጃ አዘምን",
    customerBuyerInfo: "የገዢ እና የደንበኛ መረጃ",
    commercialEnterprise: "የንግድ ድርጅት",
    contactRepresentative: "ተጠሪ ተወካይ",
    deliveryDestination: "የማድረሻ ቦታ / መጋዘን",
    commodityOrdered: "የታዘዘው ምርት እና መጠን",
    unitPriceLabel: "የአንዱ ዋጋ",
    lineTotalLabel: "አጠቃላይ ዋጋ",
    cbeEscrowDetails: "የኢትዮጵያ ንግድ ባንክ የእስክሮውና ክፍያ ዋስትና",
    escrowStatusLabel: "የእስክሮው ተቀማጭ ሁኔታ፦",
    securedByCbe: "100% በኢትዮጵያ ንግድ ባንክ የተጠበቀ",
    gatewayRefLabel: "የጌትዌይ ማጣቀሻ፦",
    paymentChannelTerms: "የክፍያ ዘዴ / ውል፦",
    instrumentLabel: "መሳሪያ / ባንክ፦",
    escrowGuaranteeNotice: "የኢትዮጵያ ንግድ ባንክ ሙሉውን ክፍያ በማይቀለበስ የእስክሮው አካውንት ውስጥ ይይዛል። እቃው መድረሱ በገዢው ሲረጋገጥ ክፍያው በቀጥታ ወደ ሂሳብዎ ይለቀቃል።",
    freightLogisticsDriver: "የጭነት ሎጂስቲክስ እና የተመደበ አሽከርካሪ",
    assignDriverNow: "አሽከርካሪ አሁን መድብ",
    changeDriver: "አሽከርካሪ ቀይር",
    dispatchedOnRoute: "በጉዞ ላይ ያለ",
    assignedVehicleLabel: "የተመደበ ተሽከርካሪ፦",
    vehiclePlateLabel: "የሰሌዳ ቁጥር",
    driverMobileLabel: "የአሽከርካሪ ስልክ",
    noDriverAssignedYet: "ለዚህ ትዕዛዝ እስካሁን አሽከርካሪ አልተመደበም።",
    assignDriverInstructions: "የመንገድ ወረቀት ለማውጣት እና ጭነቱን ለመጀመር በዚህ ቅርንጫፍ ስር የተመዘገበ አሽከርካሪ ይመድቡ።",
    carrierFleetLabel: "አጓጓዥ / ተሽከርካሪ፦",
    pendingCarrierAssignment: "አጓጓዥ በመጠባበቅ ላይ",
    waybillNumberLabel: "የመንገድ ወረቀት ቁጥር፦",
    pendingBooking: "ያልተመዘገበ",
    originDepotLabel: "መነሻ መጋዘን፦",
    copiedToClipboard: "{label} በትክክል ተቀድቷል!",

    assignDriverModalTitle: "የጭነት አሽከርካሪ እና ተሽከርካሪ መድብ",
    assignDriverModalSubtitle: "ይህንን ጭነት ለማጓጓዝ በዚህ መጋዘን ውስጥ ከሚገኙ ንቁ አሽከርካሪዎች አንዱን ይምረጡ።",
    selectDriverLabel: "አሽከርካሪ ይምረጡ፦",
    selectDriverPlaceholder: "-- አሽከርካሪ ይምረጡ --",
    noDriversRegisteredBranch: "በዚህ ቅርንጫፍ የተመዘገበ አሽከርካሪ የለም። መጀመሪያ በሰራተኞች ዝርዝር ውስጥ አሽከርካሪ ይመዝግቡ።",
    confirmAssignBtn: "አረጋግጥና አሽከርካሪ መድብ",
    cancelBtn: "ሰርዝ",
  },

  om: {
    ordersTitle: "Bulchiinsa Ajaja Bittaa B2B",
    ordersSubtitle: "Ajajoota daldalaa raawwadhaa, wabummaa kaffaltii mirkaneessaa, sadarkaa saamsuu haaromsaa, konkolaachiftoota bobbaasaa",
    breadcrumbDashboard: "Daashboordii",
    breadcrumbOrders: "Ajajoota",
    refreshBtn: "Haaromsi",
    activeOrdersBadge: "Ajajoota Hojirra Jiran {count}",

    perspectiveSales: "Ajajoota Gurgurtaa Maamiltootaa ({count})",
    perspectivePurchases: "Bittaa Daldala Kootii ({count})",

    branchOpsView: "Ilaalcha Hojii Damee: Ajajoota qofa bulchaa kan jirtan",
    loggedInAs: "Kan seentan akka",
    isolatedBranchScope: "Daangaa Damee Qofa",
    regionalHubFilter: "Calaltuu Kuusaa Naannoo:",
    allEnterpriseHubs: "Manneen Kuusaa Hunda ({count})",

    searchOrdersPlaceholder: "Lakk. ajajaan, dhaabbata bittaatiin, oomishaan barbaadaa...",
    filterAllStatuses: "Sadarkaa Hunda",
    statusPending: "Eeggataa Jira",
    statusConfirmed: "Mirkanaa'eera",
    statusProcessing: "Qophii fi Miiccaa Irra",
    statusPacked: "Saamsamee Madaalame",
    statusShipped: "Ergameera / Karaarra Jira",
    statusDelivered: "Daqqabeera",
    statusCompleted: "Xumurameera",
    statusCancelled: "Haqameera / Kuffifame",
    exportRegisterSuccess: "Galmeen ajajoota bittaa gadi bu'aa jira...",

    loadingOrdersDb: "Ajajoonni kuusaa deetaa irraa fe'amaa jiru...",
    unableToLoadOrders: "Ajajoota fe'uun hin danda'amne",
    retryBtn: "Irra Deebi'i",
    noOrdersFoundTitle: "Ajajni Hin Argamne",
    noOrdersFoundDesc: "Ajajni ulaagaalee calallii keessaniin walsimu hin jiru.",

    colOrderId: "Lakk. Ajajaa",
    colBuyerCustomer: "Bitaa / Maamila",
    colCommodityVolume: "Oomisha fi Hanga",
    colOrderTotal: "Waliigala Ajajaa (ETB)",
    colBranchHub: "Damee Kuusaa",
    colFleetDriver: "Konkolaachisaa",
    colPaymentRef: "Kaffaltii fi Lakk.",
    colStatus: "Haala",
    colDate: "Guyyaa",
    colActions: "Gochaalee",

    actionViewDetail: "Bal'ina Guutuu Ilaali",
    actionUpdateStatus: "Sadarkaa Jijjiiri",
    actionAssignDriver: "Konkolaachisaa Ramadi",
    actionPrintWaybill: "Waraqaa Geejjibaa Maxxansi",
    actionContactBuyer: "Bitaa Qunnami",
    actionDeleteOrder: "Ajaja Haqi",

    backToAllOrders: "Gara Ajajoota Hundaatti Deebi'i",
    placedOn: "Guyyaa itti ajajame",
    printWaybillInvoice: "Waraqaa Geejjibaa / Nagahee Maxxansi",
    updateFulfillment: "Sadarkaa Raawwii Haaromsi",
    customerBuyerInfo: "Oodeeffannoo Bitaa fi Maamilaa",
    commercialEnterprise: "Dhaabbata Daldalaa",
    contactRepresentative: "Bakka Bu'aa Qunnamtii",
    deliveryDestination: "Bakka Geessituu / Kuusaa",
    commodityOrdered: "Oomisha Ajajame fi Hanga",
    unitPriceLabel: "Gatii Tokkoo",
    lineTotalLabel: "Waliigala",
    cbeEscrowDetails: "Wabummaa Kaffaltii fi Escrow Baankii Daldala Itoophiyaa",
    escrowStatusLabel: "Haala Kuusaa Escrow:",
    securedByCbe: "100% Baankii Daldala Itoophiyaatiin Kan Eegame",
    gatewayRefLabel: "Lakk. Geetweeyii:",
    paymentChannelTerms: "Mala Kaffaltii / Waliigaltee:",
    instrumentLabel: "Meeshaa / Baankii:",
    escrowGuaranteeNotice: "Baankiin Daldala Itoophiyaa kaffaltii guutuu herreega escrow hin dachaane keessatti qaba. Erga meeshaan qaqqabee mirkanaa'ee booda maallaqni gara herreega keessaniitti ni gadhiifama.",
    freightLogisticsDriver: "Geejjiba fi Konkolaachisaa Ramadame",
    assignDriverNow: "Konkolaachisaa Amma Ramadi",
    changeDriver: "Konkolaachisaa Jijjiiri",
    dispatchedOnRoute: "Karaa Irra Jira",
    assignedVehicleLabel: "Konkolaataa Ramadame:",
    vehiclePlateLabel: "Gabatee Konkolaataa",
    driverMobileLabel: "Bilbila Konkolaachisaa",
    noDriverAssignedYet: "Ajaja kanaaf ammatti konkolaachisaan hin ramadamne.",
    assignDriverInstructions: "Waraqaa geejjibaa baasuuf konkolaachisaa damee kana keessatti galmaa'e ramadaa.",
    carrierFleetLabel: "Geejjibsiisaa / Konkolaataa:",
    pendingCarrierAssignment: "Geejjibsiisaan eeggamaa jira",
    waybillNumberLabel: "Lakk. Waraqaa Geejjibaa:",
    pendingBooking: "Hin galmoofne",
    originDepotLabel: "Kuusaa Ka'umsaa:",
    copiedToClipboard: "{label} garagalfameera!",

    assignDriverModalTitle: "Konkolaachisaa fi Konkolaataa Ramadi",
    assignDriverModalSubtitle: "Ergisa kana geessuuf konkolaachiftoota hojiirra jiran keessaa filadhaa.",
    selectDriverLabel: "Konkolaachisaa Filadhaa:",
    selectDriverPlaceholder: "-- Konkolaachisaa Filadhaa --",
    noDriversRegisteredBranch: "Damee kana keessatti konkolaachisaan hin jiru. Dura galmeessaa.",
    confirmAssignBtn: "Mirkaneessi fi Ramadi",
    cancelBtn: "Dhiisi",
  },

  ti: {
    ordersTitle: "ምሕደራ ናይ B2B ጅምላ ዕድጊ ትእዛዛት",
    ordersSubtitle: "ንግዳዊ ትእዛዛት ፈጽሙ፣ ናይ ሕድሪ ውሕስና ኣረጋግጹ፣ ናይ ምዕሻግ ደረጃታት ሓድሱ፣ መጓዓዝያታት ኣዋፍሩ",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbOrders: "ትእዛዛት",
    refreshBtn: "ሓድስ",
    activeOrdersBadge: "{count} ንጡፋት ትእዛዛት",

    perspectiveSales: "ናይ ዓደግቲ መሸጣ ትእዛዛት ({count})",
    perspectivePurchases: "ናይ ባዕለይ ጅምላ ዕድጊታት ({count})",

    branchOpsView: "ናይ ጨንፈር ስራሕቲ ርእይቶ፡ ትእዛዛት ዘመሓድሩ ዘለዉ ን",
    loggedInAs: "ዝኣተዉሉ መንነት",
    isolatedBranchScope: "ዝተፈለየ ናይ ጨንፈር ደረት",
    regionalHubFilter: "ናይ ዞባ መኽዘን መፃረዪ፦",
    allEnterpriseHubs: "ኩሎም ናይ ትካል መኽዘናት ({count})",

    searchOrdersPlaceholder: "ብቁጽሪ ትእዛዝ፣ ብዓዳጊ ትካል፣ ብፍርያት ድለዩ...",
    filterAllStatuses: "ኩሎም ኩነታት",
    statusPending: "ምርመራ ዝጽበ",
    statusConfirmed: "ዝተረጋገጸ",
    statusProcessing: "ኣብ ምድላውን ምፍራይን",
    statusPacked: "ዝተዓሸገን ዝተመዘነን",
    statusShipped: "ዝተላእከ / ኣብ ጉዕዞ ዘሎ",
    statusDelivered: "ዝበጽሐ",
    statusCompleted: "ዝተዛዘመ",
    statusCancelled: "ዝተሰረዘ / ውድቂ ዝኾነ",
    exportRegisterSuccess: "መዝገብ ትእዛዛት ይወርድ ኣሎ...",

    loadingOrdersDb: "ትእዛዛት ካብ ዳታቤዝ ይጽዓኑ ኣለዉ...",
    unableToLoadOrders: "ትእዛዛት ምጽዓን ኣይተኻእለን",
    retryBtn: "ደጊምካ ፈትን",
    noOrdersFoundTitle: "ዝተረኽበ ትእዛዝ የለን",
    noOrdersFoundDesc: "ምስ ዝተመረጹ መፃረዪታት ዝሰማማዕ ትእዛዝ የለን።",

    colOrderId: "ቁጽሪ ትእዛዝ",
    colBuyerCustomer: "ዓዳጊ / ተጠቃሚ",
    colCommodityVolume: "ፍርያትን መጠንን",
    colOrderTotal: "ጠቕላላ ትእዛዝ (ብር)",
    colBranchHub: "ጨንፈር መኽዘን",
    colFleetDriver: "መዋፈሪ መራሒ",
    colPaymentRef: "ክፍሊትን መወከሲን",
    colStatus: "ኩነታት",
    colDate: "ዕለት",
    colActions: "ተግባራት",

    actionViewDetail: "ምሉእ ዝርዝር ርአ",
    actionUpdateStatus: "ደረጃ ከይዲ ቀይር",
    actionAssignDriver: "መዋፈሪ መድብ",
    actionPrintWaybill: "ናይ ጉዕዞ ወረቐት ሕተም",
    actionContactBuyer: "ዓዳጊ ርኸብ",
    actionDeleteOrder: "ትእዛዝ ሰርዝ",

    backToAllOrders: "ናብ ኩሎም ትእዛዛት ተመለስ",
    placedOn: "ዝተኣዘዘሉ ዕለት",
    printWaybillInvoice: "ናይ ጽዕነት ወረቐት / ደረሰኝ ሕተም",
    updateFulfillment: "ደረጃ ምብጻሕ ሓድስ",
    customerBuyerInfo: "ናይ ዓዳጊን ተጠቃምን ሓበሬታ",
    commercialEnterprise: "ንግዳዊ ትካል",
    contactRepresentative: "ተወካሊ ርክብ",
    deliveryDestination: "ዝበጽሓሉ ቦታ / መኽዘን",
    commodityOrdered: "ዝተኣዘዘ ፍርያትን መጠንን",
    unitPriceLabel: "ናይ ሓደ ዋጋ",
    lineTotalLabel: "ጠቕላላ ዋጋ",
    cbeEscrowDetails: "ናይ ንግዲ ባንኪ ኢትዮጵያ ናይ ሕድሪ ክፍሊት ውሕስና",
    escrowStatusLabel: "ኩነታት ዕቑር ሕድሪ፦",
    securedByCbe: "100% ብንግዲ ባንኪ ኢትዮጵያ ውሑስ ዝኾነ",
    gatewayRefLabel: "ናይ ጌትዌይ መወከሲ፦",
    paymentChannelTerms: "ናይ ክፍሊት መንገዲ / ውዕል፦",
    instrumentLabel: "መሳርሒ / ባንኪ፦",
    escrowGuaranteeNotice: "ንግዲ ባንኪ ኢትዮጵያ ምሉእ ክፍሊት ብዘይምለስ ናይ ሕድሪ ሕሳብ ይሕዞ። እቲ ፍርያት ምብጻሑ ብዓዳጊ ምስ ተረጋገጸ ክፍሊት ብቐጥታ ናብ ሕሳብኩም ይለቐቕ።",
    freightLogisticsDriver: "ናይ ጽዕነት ሎጂስቲክስን ዝተመደበ መራሕ መኪናን",
    assignDriverNow: "ሕዚ መራሕ መኪና መድብ",
    changeDriver: "መራሕ መኪና ቀይር",
    dispatchedOnRoute: "ኣብ ጉዕዞ ዘሎ",
    assignedVehicleLabel: "ዝተመደበ መኪና፦",
    vehiclePlateLabel: "ቁጽሪ ሰሌዳ",
    driverMobileLabel: "ተንቀሳቓሲ ስልኪ መራሒ",
    noDriverAssignedYet: "ንነዚ ትእዛዝ ክሳብ ሕዚ መራሕ መኪና ኣይተመደበን።",
    assignDriverInstructions: "ናይ መጓዓዝያ ወረቐት ንምውጻእ ኣብዚ ጨንፈር ዝተመዝገበ መራሒ መድቡ።",
    carrierFleetLabel: "መጓዓዝያ / መኪና፦",
    pendingCarrierAssignment: "መጓዓዝያ ይጽበ ኣሎ",
    waybillNumberLabel: "ቁጽሪ ናይ ጉዕዞ ወረቐት፦",
    pendingBooking: "ኣይተመዝገበን",
    originDepotLabel: "መበገሲ መኽዘን፦",
    copiedToClipboard: "{label} ብትኽክል ተቐዲሑ!",

    assignDriverModalTitle: "ናይ ጽዕነት መራሕ መኪናን መኪናን መድብ",
    assignDriverModalSubtitle: "ነዚ ጽዕነት ንምስዳድ ካብቶም ኣብዚ መኽዘን ዘለዉ መራሕቲ መኪና ምረጹ።",
    selectDriverLabel: "መራሕ መኪና ምረጹ፦",
    selectDriverPlaceholder: "-- መራሕ መኪና ምረጹ --",
    noDriversRegisteredBranch: "ኣብዚ ጨንፈር ዝተመዝገበ መራሕ መኪና የለን። መጀመርያ መዝግቡ።",
    confirmAssignBtn: "ኣረጋግጽን መራሕ መኪና መድብን",
    cancelBtn: "ሰርዝ",
  },
};

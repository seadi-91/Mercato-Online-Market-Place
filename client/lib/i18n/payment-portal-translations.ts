export interface PaymentPortalDictionary {
  // Page Header
  title: string;
  subtitle: string;
  breadcrumbDashboard: string;
  breadcrumbPayments: string;
  btnExport: string;
  btnHideBanks: string;
  btnShowBanks: string;
  btnWithdrawToBank: string;
  
  // Telemetry Ribbon
  nbeEngine: string;
  cbeVault: string;
  telebirrGateway: string;
  exchangeRateLabel: string;

  // Hero Card
  liveTreasuryBalance: string;
  tierBadge: string;
  availableForImmediate: string;
  settledNetDescription: string;
  btnWithdrawHero: string;
  btnViewLockedEscrow: string;
  btnHideTrends: string;
  btnShowTrends: string;
  btnSyncing: string;
  btnRefresh: string;

  // Micro KPI Cards
  cardSecuredEscrow: string;
  cardGuaranteed: string;
  cardGrossVolume: string;
  cardVsCycle: string;
  cardSettlementSla: string;
  cardRtgsSpeed: string;
  cardPaidOut: string;
  cardDisbursedVouchers: string;

  // Analytics Strip
  chartTitle: string;
  chartSubtitle: string;
  legendInflow: string;
  legendEscrow: string;
  platformFee: string;
  successRate: string;
  channelShareTitle: string;
  noChannelsRecorded: string;
  dailyRtgsSweep: string;
  dailyRtgsSchedule: string;

  // Banking Rails Shelf
  bankShelfTitle: string;
  bankShelfSubtitle: string;
  btnLinkBankRail: string;
  noBanksLinkedTitle: string;
  noBanksLinkedDesc: string;
  btnLinkAccount: string;
  defaultBadge: string;
  setDefaultAction: string;
  removeAccountAction: string;
  withdrawHere: string;

  // CBE Escrow Pipeline
  escrowPipelineTitle: string;
  escrowPipelineSubtitle: string;
  clearFilter: string;
  stage1Title: string;
  stage1Desc: string;
  stage2Title: string;
  stage2Desc: string;
  stage3Title: string;
  stage3Desc: string;
  stage4Title: string;
  stage4Desc: string;

  // Tabs & Filters
  tabAll: string;
  tabEscrow: string;
  tabCompleted: string;
  tabPending: string;
  tabRefunded: string;
  viewTable: string;
  viewCards: string;
  searchPlaceholder: string;
  allBankingRails: string;
  sortNewest: string;
  sortOldest: string;
  sortAmountHigh: string;
  sortAmountLow: string;
  sortBuyerAz: string;
  btnReset: string;

  // Table Headers
  colPaymentIdDate: string;
  colPayer: string;
  colOrderPurpose: string;
  colAmountPaid: string;
  colNetPayout: string;
  colChannel: string;
  colGatewayRef: string;
  colStatus: string;
  colActions: string;
  btnTrack: string;
  btnDetails: string;

  // Empty State
  emptyTitle: string;
  emptyDesc: string;
  btnResetFilters: string;

  // Modals
  modalWithdrawTitle: string;
  modalWithdrawSubtitle: string;
  modalVoucherTitle: string;
  modalEscrowTitle: string;
  modalLinkBankTitle: string;
  modalLinkBankSubtitle: string;
}

export const PAYMENT_PORTAL_TRANSLATIONS: Record<
  "en" | "am" | "om" | "ti",
  PaymentPortalDictionary
> = {
  en: {
    title: "Treasury Settlements & Escrow Engine",
    subtitle: "National Bank of Ethiopia (NBE) RTGS Integrated • CBE Corporate Tripartite Escrow • Telebirr SuperApp Rails",
    breadcrumbDashboard: "Dashboard",
    breadcrumbPayments: "Treasury & Payments",
    btnExport: "Export",
    btnHideBanks: "Hide Banks",
    btnShowBanks: "Bank Rails",
    btnWithdrawToBank: "Withdraw to Bank",
    nbeEngine: "NBE RTGS Clearing Engine: Operational (<140ms)",
    cbeVault: "CBE Tripartite Escrow Vault: Synchronized",
    telebirrGateway: "Telebirr B2B Direct Gateway: 99.98% SLA",
    exchangeRateLabel: "Exchange Rate: 1 USD ≈ 132.50 ETB",
    liveTreasuryBalance: "Live Treasury Balance",
    tierBadge: "Tax ID: 0019283419 • Corporate Tier A",
    availableForImmediate: "Available for Immediate Payout & RTGS Sweep",
    settledNetDescription: "Settled net revenues cleared via National Bank of Ethiopia interbank switch. Ready for instant Telebirr sweep or automated corporate wire.",
    btnWithdrawHero: "Withdraw to Bank Account",
    btnViewLockedEscrow: "View Locked Escrow",
    btnHideTrends: "Hide Trends",
    btnShowTrends: "Cashflow Trends",
    btnSyncing: "Syncing...",
    btnRefresh: "Refresh",
    cardSecuredEscrow: "Secured in Escrow",
    cardGuaranteed: "100% Guaranteed",
    cardGrossVolume: "30-Day Gross Volume",
    cardVsCycle: "vs previous cycle",
    cardSettlementSla: "Settlement SLA",
    cardRtgsSpeed: "RTGS on-time speed",
    cardPaidOut: "Paid Out & Settled",
    cardDisbursedVouchers: "Disbursed Vouchers",
    chartTitle: "Treasury Inflow & Escrow Velocity",
    chartSubtitle: "Daily settled disbursements vs active escrow reserves across Ethiopian banking rails",
    legendInflow: "Disbursed Inflow",
    legendEscrow: "Escrow Reserve",
    platformFee: "Platform Escrow Tech Fee: Fixed 1.5%",
    successRate: "Settlement Success Rate: 100%",
    channelShareTitle: "Settlement Channel Share",
    noChannelsRecorded: "No settlement volume recorded yet across banking rails.",
    dailyRtgsSweep: "Daily RTGS Sweep:",
    dailyRtgsSchedule: "Automated batch processing occurs every hour between 08:00 and 17:00 EAT.",
    bankShelfTitle: "Verified Ethiopian Settlement Terminals",
    bankShelfSubtitle: "Authorized corporate bank accounts linked for RTGS settlement and instant Telebirr disbursements",
    btnLinkBankRail: "Link Bank Rail",
    noBanksLinkedTitle: "No Settlement Accounts Linked",
    noBanksLinkedDesc: "Add your preferred commercial bank, microfinance account, or mobile money merchant ID to receive automated treasury payouts.",
    btnLinkAccount: "Link Bank / Account",
    defaultBadge: "Default",
    setDefaultAction: "Set as Default",
    removeAccountAction: "Remove Account",
    withdrawHere: "Withdraw Here →",
    escrowPipelineTitle: "CBE Tripartite Escrow Clearing Pipeline",
    escrowPipelineSubtitle: "Buyer deposits locked securely at Commercial Bank of Ethiopia Corporate Branch until verified delivery.",
    clearFilter: "Clear Milestone Filter",
    stage1Title: "Buyer Funds Escrow",
    stage1Desc: "Orders Awaiting Dispatch",
    stage2Title: "Dispatched & In Transit",
    stage2Desc: "Cargo Shipments Moving",
    stage3Title: "Buyer POD & Inspect",
    stage3Desc: "Awaiting Buyer Signoff",
    stage4Title: "Automated Release",
    stage4Desc: "Cleared to Available Balance",
    tabAll: "All Transactions",
    tabEscrow: "Secured in Escrow",
    tabCompleted: "Settled & Paid",
    tabPending: "Pending Clearance",
    tabRefunded: "Refunded",
    viewTable: "Table",
    viewCards: "Cards",
    searchPlaceholder: "Search by transaction ID, buyer enterprise, order #, TIN, or bank ref...",
    allBankingRails: "All Banking Rails",
    sortNewest: "Newest First",
    sortOldest: "Oldest First",
    sortAmountHigh: "Amount: High to Low",
    sortAmountLow: "Amount: Low to High",
    sortBuyerAz: "Buyer: A to Z",
    btnReset: "Reset",
    colPaymentIdDate: "Payment ID & Date",
    colPayer: "Who Paid (Payer)",
    colOrderPurpose: "Order & What Paid For",
    colAmountPaid: "Amount Paid",
    colNetPayout: "Net Payout (ETB)",
    colChannel: "Payment Channel",
    colGatewayRef: "Gateway / Tx Ref",
    colStatus: "Status",
    colActions: "Actions",
    btnTrack: "Track",
    btnDetails: "Details",
    emptyTitle: "No Transactions Found",
    emptyDesc: "No settlement records match your active search terms or selected filters.",
    btnResetFilters: "Reset All Filters",
    modalWithdrawTitle: "Withdraw Treasury Funds",
    modalWithdrawSubtitle: "Transfer settled balance directly to your verified Ethiopian corporate bank or Telebirr account",
    modalVoucherTitle: "Official Fiscal Settlement Voucher",
    modalEscrowTitle: "CBE Escrow Milestone Tracker",
    modalLinkBankTitle: "Link Verified Settlement Account",
    modalLinkBankSubtitle: "Connect an authorized Ethiopian commercial bank or mobile money terminal for automated treasury payouts",
  },
  am: {
    title: "የግምጃ ቤት ክፍያዎች እና የኢስክሮው ሞተር",
    subtitle: "የኢትዮጵያ ብሔራዊ ባንክ (NBE) RTGS የተሳሰረ • የኢትዮጵያ ንግድ ባንክ ኮርፖሬት ባለሦስት ወገን ኢስክሮው • የቴሌብር መረብ",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbPayments: "ግምጃ ቤት እና ክፍያዎች",
    btnExport: "ላክ (Export)",
    btnHideBanks: "ባንኮችን ደብቅ",
    btnShowBanks: "የባንክ መረቦች",
    btnWithdrawToBank: "ወደ ባንክ አውጣ",
    nbeEngine: "የብሔራዊ ባንክ RTGS ማጽጃ ሞተር፡ ንቁ (<140ms)",
    cbeVault: "የንግድ ባንክ ኢስክሮው ካዝና፡ የተመሳሰለ",
    telebirrGateway: "የቴሌብር B2B ቀጥተኛ ጌትዌይ፡ 99.98% SLA",
    exchangeRateLabel: "የምንዛሬ ተመን: 1 USD ≈ 132.50 ETB",
    liveTreasuryBalance: "የቀጥታ ግምጃ ቤት ሂሳብ",
    tierBadge: "የግብር ከፋይ ቁጥር: 0019283419 • ደረጃ A ኮርፖሬት",
    availableForImmediate: "ለአፋጣኝ ክፍያ እና RTGS ዝውውር የተዘጋጀ",
    settledNetDescription: "በኢትዮጵያ ብሔራዊ ባንክ አውታረ መረብ የተጣራ እና የጸደቀ ገቢ። ወደ ቴሌብር ወይም የባንክ ሂሳብ ወዲያውኑ ለማዘዋወር ዝግጁ።",
    btnWithdrawHero: "ወደ ባንክ ሂሳብ አውጣ",
    btnViewLockedEscrow: "የታገደ ኢስክሮው ተመልከት",
    btnHideTrends: "አዝማሚያዎችን ደብቅ",
    btnShowTrends: "የገንዘብ ፍሰት አዝማሚያ",
    btnSyncing: "በማመሳሰል ላይ...",
    btnRefresh: "አድስ",
    cardSecuredEscrow: "በኢስክሮው የተጠበቀ",
    cardGuaranteed: "100% የተረጋገጠ",
    cardGrossVolume: "የ30 ቀናት አጠቃላይ ግብይት",
    cardVsCycle: "ካለፈው ዑደት ጋር ሲነጻጸር",
    cardSettlementSla: "የክፍያ ፍጥነት SLA",
    cardRtgsSpeed: "የRTGS በሰዓቱ የማጽዳት ፍጥነት",
    cardPaidOut: "የተከፈለ እና የተጠናቀቀ",
    cardDisbursedVouchers: "የተላለፉ ደረሰኞች",
    chartTitle: "የግምጃ ቤት ገቢ እና የኢስክሮው ፍጥነት",
    chartSubtitle: "በኢትዮጵያ የባንክ መረቦች ዕለታዊ የጸደቁ ክፍያዎች እና ንቁ የኢስክሮው ክምችት",
    legendInflow: "የተላለፈ ገቢ",
    legendEscrow: "የኢስክሮው ክምችት",
    platformFee: "የፕላትፎርም ቴክኖሎጂ ክፍያ: ቋሚ 1.5%",
    successRate: "የክፍያ ስኬት ምጣኔ: 100%",
    channelShareTitle: "የክፍያ ቻናሎች ድርሻ",
    noChannelsRecorded: "እስካሁን ምንም የክፍያ መዝገብ አልተመዘገበም።",
    dailyRtgsSweep: "ዕለታዊ የRTGS ማጽጃ:",
    dailyRtgsSchedule: "ራስ-ሰር ክፍያ በየሰዓቱ ከጠዋቱ 02:00 እስከ 11:00 ሰዓት ይከናወናል።",
    bankShelfTitle: "የተረጋገጡ የኢትዮጵያ የክፍያ ተርሚናሎች",
    bankShelfSubtitle: "ለRTGS ዝውውር እና ፈጣን የቴሌብር ክፍያዎች የተገናኙ ህጋዊ የድርጅት የባንክ ሂሳቦች",
    btnLinkBankRail: "አዲስ ባንክ አገናኝ",
    noBanksLinkedTitle: "የተገናኘ የባንክ ሂሳብ የለም",
    noBanksLinkedDesc: "ራስ-ሰር ክፍያዎችን ለመቀበል የንግድ ባንክ ወይም የሞባይል ገንዘብ ሂሳብዎን ያገናኙ።",
    btnLinkAccount: "ባንክ / ሂሳብ አገናኝ",
    defaultBadge: "ዋና (Default)",
    setDefaultAction: "ዋና አድርግ",
    removeAccountAction: "ሂሳቡን ሰርዝ",
    withdrawHere: "እዚህ አውጣ →",
    escrowPipelineTitle: "የንግድ ባንክ ባለሦስት ወገን ኢስክሮው ሂደት",
    escrowPipelineSubtitle: "እቃው ደርሶ እስኪረጋገጥ ድረስ የገዢው ገንዘብ በኢትዮጵያ ንግድ ባንክ በአስተማማኝ ሁኔታ ተቆልፎ ይቆያል።",
    clearFilter: "ማጣሪያውን አስወግድ",
    stage1Title: "ገዢው በኢስክሮው አስቀምጧል",
    stage1Desc: "መላክን የሚጠብቁ ትዕዛዞች",
    stage2Title: "የተላከ እና በመጓጓዝ ላይ",
    stage2Desc: "በመንገድ ላይ ያሉ ጭነቶች",
    stage3Title: "የገዢ ርክክብ እና ፍተሻ",
    stage3Desc: "የገዢ ማረጋገጫ በመጠባበቅ ላይ",
    stage4Title: "ራስ-ሰር መልቀቅ",
    stage4Desc: "ወደ ዝግጁ ሂሳብ የጸደቀ",
    tabAll: "ሁሉም ግብይቶች",
    tabEscrow: "በኢስክሮው የተያዘ",
    tabCompleted: "የተጠናቀቀ እና የተከፈለ",
    tabPending: "ማጽደቅ በመጠባበቅ ላይ",
    tabRefunded: "የተመለሰ",
    viewTable: "ሰንጠረዥ",
    viewCards: "ካርዶች",
    searchPlaceholder: "በግብይት መለያ፣ ገዢ፣ የትዕዛዝ ቁጥር፣ TIN ወይም የባንክ ማመሳከሪያ ፈልግ...",
    allBankingRails: "ሁሉም የባንክ መረቦች",
    sortNewest: "አዳዲሶች መጀመሪያ",
    sortOldest: "የቆዩት መጀመሪያ",
    sortAmountHigh: "መጠን፡ ከከፍተኛ ወደ ዝቅተኛ",
    sortAmountLow: "መጠን፡ ከዝቅተኛ ወደ ከፍተኛ",
    sortBuyerAz: "ገዢ፡ ከሀ እስከ ፖ",
    btnReset: "ዳግም ጀምር",
    colPaymentIdDate: "የክፍያ መለያ እና ቀን",
    colPayer: "ከፋይ (ድርጅት)",
    colOrderPurpose: "የትዕዛዝ ቁጥር እና ዝርዝር",
    colAmountPaid: "የተከፈለው መጠን",
    colNetPayout: "የተጣራ ገቢ (ETB)",
    colChannel: "የክፍያ መስመር",
    colGatewayRef: "ማመሳከሪያ ቁጥር",
    colStatus: "ሁኔታ",
    colActions: "እርምጃዎች",
    btnTrack: "ተከታተል",
    btnDetails: "ዝርዝር",
    emptyTitle: "ምንም ግብይት አልተገኘም",
    emptyDesc: "ከፍለጋዎ ጋር የሚዛመድ ምንም አይነት የክፍያ መረጃ አልተገኘም።",
    btnResetFilters: "ማጣሪያዎችን አጽዳ",
    modalWithdrawTitle: "የግምጃ ቤት ገንዘብ ማውጫ",
    modalWithdrawSubtitle: "የተጣራ ገንዘብዎን ወደ ተረጋገጠው የኢትዮጵያ የባንክ ወይም ቴሌብር ሂሳብዎ ያስተላልፉ",
    modalVoucherTitle: "ኦፊሴላዊ የክፍያ ቫውቸር",
    modalEscrowTitle: "የኢስክሮው የደረጃ መከታተያ",
    modalLinkBankTitle: "የተረጋገጠ የባንክ ሂሳብ አገናኝ",
    modalLinkBankSubtitle: "ለራስ-ሰር ክፍያዎች የንግድ ባንክ ወይም የሞባይል ተርሚናል ያገናኙ",
  },
  om: {
    title: "Kaffaltii Baankii fi Tajaajila Eeskirawuu",
    subtitle: "Baankii Biyyooleessaa Itoophiyaa (NBE) RTGS • Baankii Daldala Itoophiyaa Eeskirawuu • Telebirr Rails",
    breadcrumbDashboard: "Daashboordii",
    breadcrumbPayments: "Baankii fi Kaffaltii",
    btnExport: "Gadu Galchi (Export)",
    btnHideBanks: "Baankota Dhoksi",
    btnShowBanks: "Sarara Baankii",
    btnWithdrawToBank: "Gara Baankiitti Baasi",
    nbeEngine: "Moora Qulqulleessaa NBE RTGS: Hojjechaa Jira (<140ms)",
    cbeVault: "Kuusaa Eeskirawuu CBE: Qindeeffameera",
    telebirrGateway: "Karaan Qajeeltoo Telebirr B2B: 99.98% SLA",
    exchangeRateLabel: "Gatii Jijjiirraa: 1 USD ≈ 132.50 ETB",
    liveTreasuryBalance: "Haftee Qabeenya Kallattii",
    tierBadge: "TIN: 0019283419 • Sadarkaa A Korporeetii",
    availableForImmediate: "Kaffaltii Hatattamaa fi RTGS'f Qophii Dha",
    settledNetDescription: "Galii qulqulluu karaa sarara baankii biyooleessaa qulqullaa'ee mirkanaa'e. Gara Telebirr ykn baankiitti dabarsuuf qophii dha.",
    btnWithdrawHero: "Gara Baankiitti Baasi",
    btnViewLockedEscrow: "Eeskirawuu Cufame Ilaali",
    btnHideTrends: "Adeemsa Dhoksi",
    btnShowTrends: "Adeemsa Maallaqaa",
    btnSyncing: "Qindeessaa jira...",
    btnRefresh: "Haaromsi",
    cardSecuredEscrow: "Eeskirawuudhaan Eegame",
    cardGuaranteed: "100% Wabii Qaba",
    cardGrossVolume: "Daldala Guyyoota 30",
    cardVsCycle: "Marsaa darbe waliin",
    cardSettlementSla: "Saffisa Kaffaltii SLA",
    cardRtgsSpeed: "Saffisa Qulqulleessaa RTGS",
    cardPaidOut: "Kan Kaffalamee Xumurame",
    cardDisbursedVouchers: "Nagahee Kaffalame",
    chartTitle: "Yaatu Maallaqaa fi Saffisa Eeskirawuu",
    chartSubtitle: "Kaffaltiiwwan guyyaa fi kuusaa eeskirawuu sarara baankota Itoophiyaa irratti",
    legendInflow: "Galii Dabarfame",
    legendEscrow: "Kuusaa Eeskirawuu",
    platformFee: "Kaffaltii Teeknooloojii: Dhaabbataa 1.5%",
    successRate: "Milkaa'ina Kaffaltii: 100%",
    channelShareTitle: "Qooda Sararoota Kaffaltii",
    noChannelsRecorded: "Hamma yoonaatti kaffaltiin galmaa'e hin jiru.",
    dailyRtgsSweep: "Qulqulleessaa RTGS Guyyaa:",
    dailyRtgsSchedule: "Kaffaltiin ofumaan sa'aatii 02:00 hanga 11:00 EAT keessatti raawwatama.",
    bankShelfTitle: "Sararoota Kaffaltii Itoophiyaa Mirkanaa'an",
    bankShelfSubtitle: "Herreega baankii korporeetii mirkanaa'an kaffaltii hatattamaa Telebirr fi RTGS'f qophaa'an",
    btnLinkBankRail: "Baankii Haaraa Walqabsiisi",
    noBanksLinkedTitle: "Herreegni Baankii Hin Jiru",
    noBanksLinkedDesc: "Kaffaltii ofumaan fudhachuuf herreega baankii daldalaa ykn maallaqa moobaayilaa galchaa.",
    btnLinkAccount: "Baankii / Herreega Galchi",
    defaultBadge: "Durtii (Default)",
    setDefaultAction: "Durtii Godhi",
    removeAccountAction: "Herreega Haqi",
    withdrawHere: "Asitti Baasi →",
    escrowPipelineTitle: "Adeemsa Eeskirawuu Baankii Daldala Itoophiyaa",
    escrowPipelineSubtitle: "Hanga mi'i qaqqabee mirkanaa'utti maallaqni bitataa Baankii Daldala Itoophiyaa keessatti cufamee tura.",
    clearFilter: "Gingilchaa Balleessi",
    stage1Title: "Bitataan Eeskirawuu Galcheera",
    stage1Desc: "Ajajawwan Ergama Eegan",
    stage2Title: "Ergameera fi Karaarra Jira",
    stage2Desc: "Fe'iinsi Karaarra Jira",
    stage3Title: "Qaqqabuu fi Qorannoo Bitataa",
    stage3Desc: "Mirkaneessa Bitataa Eegaa Jira",
    stage4Title: "Ofumaan Gadhiifame",
    stage4Desc: "Gara Haftee Qophiitti Qulqullaa'e",
    tabAll: "Kaffaltii Hundumaa",
    tabEscrow: "Eeskirawuu Keessa Kan Jiru",
    tabCompleted: "Kaffalamee Xumurame",
    tabPending: "Qulqullaa'uu Kan Eegu",
    tabRefunded: "Kan Deebi'e",
    viewTable: "Gabatee",
    viewCards: "Kaardota",
    searchPlaceholder: "Lakkoofsa kaffaltii, bitataa, ajaja, TIN ykn baankiin barbaadi...",
    allBankingRails: "Sarara Baankii Hundumaa",
    sortNewest: "Haaraa Dura",
    sortOldest: "Duraanii Dura",
    sortAmountHigh: "Hamma: Ol'aanaa gara Gadiitti",
    sortAmountLow: "Hamma: Gadii gara Ol'aanaatti",
    sortBuyerAz: "Bitataa: A hanga Z",
    btnReset: "Haaromsi",
    colPaymentIdDate: "ID Kaffaltii & Guyyaa",
    colPayer: "Kaffalaa (Dhaabbata)",
    colOrderPurpose: "Lakkoofsa Ajajaa & Sababa",
    colAmountPaid: "Hamma Kaffalame",
    colNetPayout: "Galii Qulqulluu (ETB)",
    colChannel: "Karaan Kaffaltii",
    colGatewayRef: "Lakkoofsa Wabiiti",
    colStatus: "Haala",
    colActions: "Tarkaanfii",
    btnTrack: "Hordofi",
    btnDetails: "Bal'ina",
    emptyTitle: "Kaffaltiin Hin Argamne",
    emptyDesc: "Barbaacha keessan waliin kaffaltiin walgitu hin jiru.",
    btnResetFilters: "Gingilchaa Qulqulleessi",
    modalWithdrawTitle: "Maallaqa Baankiitti Baasuu",
    modalWithdrawSubtitle: "Maallaqa keessan gara herreega baankii ykn Telebirr mirkanaa'etti dabarsaa",
    modalVoucherTitle: "Waraqaa Nagahee Kaffaltii",
    modalEscrowTitle: "Hordoffii Sadarkaa Eeskirawuu",
    modalLinkBankTitle: "Herreega Baankii Mirkanaa'e Walqabsiisi",
    modalLinkBankSubtitle: "Kaffaltiiwwan ofumaan fudhachuuf herreega baankii ykn moobaayilaa galchaa",
  },
  ti: {
    title: "ክፍሊታት ግምጃ ቤት ከምኡውን ሞተር ኢስክሮው",
    subtitle: "ናይ ኢትዮጵያ ብሄራዊ ባንክ (NBE) RTGS ዝተተሓሓዘ • ናይ ንግዲ ባንክ ትራይፓርታይት ኢስክሮው • ቴሌብር ረይልስ",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbPayments: "ግምጃ ቤት ከምኡውን ክፍሊታት",
    btnExport: "ሰደድ (Export)",
    btnHideBanks: "ባንክታት ሕባእ",
    btnShowBanks: "ናይ ባንክ መርበባት",
    btnWithdrawToBank: "ናብ ባንኪ ኣውጽእ",
    nbeEngine: "ናይ ብሄራዊ ባንክ RTGS ሞተር: ንጡፍ (<140ms)",
    cbeVault: "ናይ ንግዲ ባንኪ ኢስክሮው ሳንዱቕ: ዝተሰማምዐ",
    telebirrGateway: "ቀጥታዊ መስመር ቴሌብር B2B: 99.98% SLA",
    exchangeRateLabel: "ናይ ሸርፊ መጠን: 1 USD ≈ 132.50 ETB",
    liveTreasuryBalance: "ቀጥታዊ ዝተረፈ ገንዘብ ግምጃ ቤት",
    tierBadge: "መለለዪ ግብሪ (TIN): 0019283419 • ብርኪ A ኮርፖሬት",
    availableForImmediate: "ንቕልጡፍ ክፍሊት ከምኡውን RTGS ዝተዳለወ",
    settledNetDescription: "ብናይ ኢትዮጵያ ብሄራዊ ባንክ መርበብ ሓሊፉ ዝጸደቐ ጽሩይ እቶት። ብቐጥታ ናብ ቴሌብር ወይ ናይ ባንኪ ሕሳብ ንምዝዋር ድሉው እዩ።",
    btnWithdrawHero: "ናብ ባንኪ ኣውጽእ",
    btnViewLockedEscrow: "ዝተዓገተ ኢስክሮው ርአ",
    btnHideTrends: "ዝንባለታት ሕባእ",
    btnShowTrends: "ናይ ገንዘብ ፍሰት ዝንባለ",
    btnSyncing: "የተማስዕ ኣሎ...",
    btnRefresh: "ሓድሽ",
    cardSecuredEscrow: "ብኢስክሮው ዝተሓለወ",
    cardGuaranteed: "100% ዝተረጋገጸ",
    cardGrossVolume: "ናይ 30 መዓልታት ሓፈሻዊ ንግዲ",
    cardVsCycle: "ካብ ዝሓለፈ ዙርያ",
    cardSettlementSla: "ናይ ክፍሊት ቅልጣፈ SLA",
    cardRtgsSpeed: "ናይ RTGS ብእዋኑ ምጽዳቕ",
    cardPaidOut: "ዝተኸፍለን ዝተዛዘመን",
    cardDisbursedVouchers: "ዝተኸፍሉ ቅብሊታት",
    chartTitle: "እቶት ግምጃ ቤት ከምኡውን ቅልጣፈ ኢስክሮው",
    chartSubtitle: "መዓልታዊ ዝተኸፍሉ ክፍሊታትን ኣብ ናይ ኢትዮጵያ ባንክታት ዘሎ ናይ ኢስክሮው ተቐማጢ",
    legendInflow: "ዝተኸፍለ እቶት",
    legendEscrow: "ናይ ኢስክሮው ተቐማጢ",
    platformFee: "ናይ ቴክኖሎጂ ክፍሊት: ቀዋሚ 1.5%",
    successRate: "ናይ ክፍሊት ዓወት መጠን: 100%",
    channelShareTitle: "ናይ ክፍሊት መስመራት ግደ",
    noChannelsRecorded: "ክሳብ ሕጂ ዝተመዝገበ ናይ ክፍሊት መዝገብ የለን።",
    dailyRtgsSweep: "መዓልታዊ ናይ RTGS ጽሬት:",
    dailyRtgsSchedule: "ኣብ ሞንጎ ሰዓት 02:00 ክሳብ 11:00 EAT ኣብ ነፍሲ ወከፍ ሰዓት ብኣውቶማቲክ ይካየድ።",
    bankShelfTitle: "ዝተረጋገጹ ናይ ኢትዮጵያ ናይ ክፍሊት ተርሚናላት",
    bankShelfSubtitle: "ንRTGS ዝውውርን ንቕልጡፍ ናይ ቴሌብር ክፍሊትን ዝተኣሳሰሩ ሕጋዊ ናይ ባንኪ ሕሳባት",
    btnLinkBankRail: "ሓድሽ ባንኪ ኣተኣሳስር",
    noBanksLinkedTitle: "ዝተኣሳሰረ ናይ ባንኪ ሕሳብ የለን",
    noBanksLinkedDesc: "ኣውቶማቲክ ክፍሊታት ንምቕባል ናይ ንግዲ ባንኪ ወይ ናይ ሞባይል ገንዘብ ሕሳብኩም ኣእትዉ።",
    btnLinkAccount: "ባንኪ / ሕሳብ ኣተኣሳስር",
    defaultBadge: "ቀንዲ (Default)",
    setDefaultAction: "ቀንዲ ግበሮ",
    removeAccountAction: "ሕሳብ ሰርዝ",
    withdrawHere: "ኣብዚ ኣውጽእ →",
    escrowPipelineTitle: "ናይ ንግዲ ባንኪ ሰለስተኣዊ ኢስክሮው ከይዲ",
    escrowPipelineSubtitle: "እቲ ኣቑሑት በጺሑ ክሳብ ዝረጋገጽ ናይቲ ዓዳጊ ገንዘብ ኣብ ናይ ኢትዮጵያ ንግዲ ባንኪ ብውሑስ ተዓጽዩ ይጸንሕ።",
    clearFilter: "መጽረዪ ኣወግድ",
    stage1Title: "ዓዳጊ ኣብ ኢስክሮው ኣቐሚጡ",
    stage1Desc: "ምልኣኽ ዝጽበዩ ትእዛዛት",
    stage2Title: "ዝተላእከን ኣብ ጉዕዞ ዘሎን",
    stage2Desc: "ኣብ መንገዲ ዘለዉ ጽዕነታት",
    stage3Title: "ምርካብን ምፍታሽን ዓዳጊ",
    stage3Desc: "ምርግጋጽ ዓዳጊ ይጽበ ኣሎ",
    stage4Title: "ብኣውቶማቲክ ምልቃቕ",
    stage4Desc: "ናብ ቅሩብ ሕሳብ ዝጸደቐ",
    tabAll: "ኩሎም ክፍሊታት",
    tabEscrow: "ኣብ ኢስክሮው ዘሎ",
    tabCompleted: "ዝተኸፍለን ዝተዛዘመን",
    tabPending: "ምጽዳቕ ዝጽበ ዘሎ",
    tabRefunded: "ዝተመለሰ",
    viewTable: "ሰንጠረዥ",
    viewCards: "ካርድታት",
    searchPlaceholder: "ብመለለዪ ክፍሊት፣ ዓዳጊ፣ ቁጽሪ ትእዛዝ፣ TIN ወይ መወከሲ ባንኪ ድለ...",
    allBankingRails: "ኩሎም ናይ ባንኪ መስመራት",
    sortNewest: "ሓደሽቲ ቅድም",
    sortOldest: "ናይ ቀደም ቅድም",
    sortAmountHigh: "መጠን: ካብ ላዕሊ ናብ ታሕቲ",
    sortAmountLow: "መጠን: ካብ ታሕቲ ናብ ላዕሊ",
    sortBuyerAz: "ዓዳጊ: ካብ A ክሳብ Z",
    btnReset: "ዳግማይ ጀምር",
    colPaymentIdDate: "መለለዪ ክፍሊትን ዕለትን",
    colPayer: "ከፋሊ (ትካል)",
    colOrderPurpose: "ቁጽሪ ትእዛዝን መግለጺኡን",
    colAmountPaid: "ዝተኸፍለ መጠን",
    colNetPayout: "ጽሩይ እቶት (ETB)",
    colChannel: "ናይ ክፍሊት መስመር",
    colGatewayRef: "ናይ መወከሲ ቁጽሪ",
    colStatus: "ኩነታት",
    colActions: "ስጉምትታት",
    btnTrack: "ተኸታተል",
    btnDetails: "ዝርዝር",
    emptyTitle: "ዝተረኽበ ክፍሊት የለን",
    emptyDesc: "ምስቲ ድሌትኩም ዝሰማማዕ ናይ ክፍሊት መዝገብ ኣይተረኽበን።",
    btnResetFilters: "መጽረዪታት ኣጽሪ",
    modalWithdrawTitle: "ናይ ግምጃ ቤት ገንዘብ ምውጻእ",
    modalWithdrawSubtitle: "ጽሩይ ገንዘብኩም ናብ ዝተረጋገጸ ናይ ባንኪ ወይ ቴሌብር ሕሳብኩም ኣመሓላልፉ",
    modalVoucherTitle: "ወግዓዊ ቅብሊት ክፍሊት",
    modalEscrowTitle: "ናይ ኢስክሮው ብርኪ መከታተሊ",
    modalLinkBankTitle: "ዝተረጋገጸ ናይ ባንኪ ሕሳብ ኣተኣሳስር",
    modalLinkBankSubtitle: "ንኣውቶማቲክ ክፍሊታት ናይ ንግዲ ባንኪ ወይ ሞባይል ተርሚናል ኣተኣሳስሩ",
  },
};

import type { LanguageCode } from "./translations";

export interface PayoutsTranslationDictionary {
  pageTitle: string;
  pageSubtitle: string;
  refresh: string;
  totalRegisteredVendors: string;
  sellersCount: string;
  suppliersCount: string;
  liveMerchantsInDb: string;
  grossSalesDb: string;
  exactSubtotalProducts: string;
  commissionPaid: string;
  takeRateDeducted: string;
  netAvailableVault: string;
  readyToDisburse: string;
  searchPlaceholder: string;
  allVendors: string;
  sellers: string;
  suppliers: string;
  payoutReady: string;
  swipeTableHint: string;
  colMerchantShop: string;
  colRoleVerification: string;
  colListedProducts: string;
  colOrders: string;
  colSoldSales: string;
  colCommission: string;
  colNetBalance: string;
  colBankDestination: string;
  colActions: string;
  transferPayout: string;
  viewProfile: string;
  copyPhone: string;
  copyBank: string;
  copyTin: string;
  modalTransferTitle: string;
  modalTransferSubtitle: string;
  availableBalanceInDb: string;
  enterPayoutAmount: string;
  shortcut25: string;
  shortcut50: string;
  shortcut100: string;
  remainingBalanceAfter: string;
  willRemainInDb: string;
  disbursementMemo: string;
  memoPlaceholder: string;
  securityNoticeTitle: string;
  securityNoticeDesc: string;
  cancel: string;
  authorizeOnChapa: string;
  connectingToChapa: string;
  paymentSuccessfulTitle: string;
  paymentSuccessfulSubtitle: string;
  transferredPayoutAmount: string;
  beneficiaryMerchant: string;
  destinationAccount: string;
  previousAvailableBalance: string;
  deductedFromAccount: string;
  newRemainingBalance: string;
  officialPaymentId: string;
  copyId: string;
  idCopied: string;
  emailStatementsDispatched: string;
  emailToMerchant: string;
  emailToAdmin: string;
  backToPayouts: string;
  viewUpdatedBalances: string;
  verifyingWithChapa: string;
  checkingStatus: string;
  payoutCancelledTitle: string;
  payoutCancelledDesc: string;
  dismiss: string;
  profileDetailsTitle: string;
  contactPerson: string;
  phoneNumber: string;
  emailAddress: string;
  tinNumber: string;
  location: string;
  kycStatus: string;
  payoutDestination: string;
  listedProducts: string;
  soldSalesDb: string;
  availablePayout: string;
  close: string;
  initiatePayout: string;
  noMerchantsFound: string;
  tryDifferentSearch: string;
  loadingRecords: string;
}

export const PAYOUT_TRANSLATIONS: Record<LanguageCode, PayoutsTranslationDictionary> = {
  en: {
    pageTitle: "Sellers & Suppliers Payout Hub",
    pageSubtitle:
      "Track real merchant sales fetched directly from DB, view 3.5% commission paid, monitor net balance, and disburse payouts via the 3-dots action menu with automated email notifications.",
    refresh: "Refresh",
    totalRegisteredVendors: "Total Registered Vendors",
    sellersCount: "Sellers",
    suppliersCount: "Suppliers",
    liveMerchantsInDb: "Live active merchants in DB",
    grossSalesDb: "Own Products Sold Sales (DB)",
    exactSubtotalProducts: "Exact subtotal of products sold",
    commissionPaid: "Commission Paid (3.5%)",
    takeRateDeducted: "Platform revenue deducted",
    netAvailableVault: "Net Available Payout Vault",
    readyToDisburse: "Net balance ready for Chapa payout",
    searchPlaceholder: "Search by shop name, merchant, phone, email, TIN, or city...",
    allVendors: "All Vendors",
    sellers: "Sellers",
    suppliers: "Suppliers",
    payoutReady: "Payout Ready",
    swipeTableHint: "👉 Swipe horizontally to view all columns",
    colMerchantShop: "Merchant / Shop Info",
    colRoleVerification: "Role & Verification",
    colListedProducts: "Listed Products",
    colOrders: "Orders",
    colSoldSales: "Sold Products Sales (ETB)",
    colCommission: "Commission Paid (3.5%)",
    colNetBalance: "Net Available Balance",
    colBankDestination: "Bank Destination",
    colActions: "Actions",
    transferPayout: "Transfer Payout via Chapa",
    viewProfile: "View Full Profile",
    copyPhone: "Copy Phone Number",
    copyBank: "Copy Bank Account",
    copyTin: "Copy TIN Number",
    modalTransferTitle: "Disburse Vendor Payout via Chapa",
    modalTransferSubtitle: "Direct electronic payout settlement. Funds will be verified before deducting from balance.",
    availableBalanceInDb: "Available Balance in DB",
    enterPayoutAmount: "Enter Payout Amount to Disburse (ETB)",
    shortcut25: "25% Quarter",
    shortcut50: "50% Half",
    shortcut100: "100% Full Balance",
    remainingBalanceAfter: "Remaining Balance after this Payout:",
    willRemainInDb: "will remain in DB",
    disbursementMemo: "Disbursement Memo / Notes",
    memoPlaceholder: "e.g. Sales payout disbursement via Chapa...",
    securityNoticeTitle: "🛡️ Secure Payment Protection Notice",
    securityNoticeDesc:
      "Funds will only be deducted and statements sent once payment is verified successfully on Chapa. If cancelled, no money is deducted.",
    cancel: "Cancel",
    authorizeOnChapa: "Authorize on Chapa Gateway",
    connectingToChapa: "Connecting to Chapa Gateway...",
    paymentSuccessfulTitle: "Payment Successful!",
    paymentSuccessfulSubtitle: "The payout disbursement was confirmed and verified via Chapa Payment Gateway.",
    transferredPayoutAmount: "Transferred Payout Amount",
    beneficiaryMerchant: "Beneficiary Merchant:",
    destinationAccount: "Destination Account:",
    previousAvailableBalance: "Previous Available Balance:",
    deductedFromAccount: "Deducted from Account:",
    newRemainingBalance: "New Net Available Balance in DB:",
    officialPaymentId: "Official Payment ID / Transaction Ref",
    copyId: "Copy ID",
    idCopied: "Payment ID copied to clipboard!",
    emailStatementsDispatched: "English Financial Statements Dispatched:",
    emailToMerchant: "To Merchant (Official Statement in English)",
    emailToAdmin: "To Platform Admin (Financial Audit Record)",
    backToPayouts: "Back to Sellers & Suppliers Payouts",
    viewUpdatedBalances: "Done & View Updated Balances",
    verifyingWithChapa: "Verifying Payment with Chapa Gateway...",
    checkingStatus: "Checking authorization status. Balance will only be deducted upon confirmed success.",
    payoutCancelledTitle: "Payout Transfer Cancelled / Incomplete",
    payoutCancelledDesc: "No funds were deducted. Merchant balance remains completely intact.",
    dismiss: "Dismiss",
    profileDetailsTitle: "Vendor Profile & Legal Credentials",
    contactPerson: "Contact Person",
    phoneNumber: "Phone Number",
    emailAddress: "Email Address",
    tinNumber: "TIN Number",
    location: "Location",
    kycStatus: "KYC Status",
    payoutDestination: "Payout Destination",
    listedProducts: "Listed Products",
    soldSalesDb: "Sold Sales (DB)",
    availablePayout: "Available Payout",
    close: "Close",
    initiatePayout: "Initiate Payout",
    noMerchantsFound: "No merchants found matching your query",
    tryDifferentSearch: "Try modifying your search or filter options",
    loadingRecords: "Loading sellers and suppliers records...",
  },

  am: {
    pageTitle: "የሻጮች እና አቅራቢዎች የክፍያ ማዕከል",
    pageSubtitle:
      "በዳታቤዝ የተመዘገቡ የነጋዴዎችን ሽያጭ ይከታተሉ፣ 3.5% የፕላትፎርም ኮሚሽን እና የተጣራ ቀሪ ሂሳብን ይመልከቱ፣ በ 3-ነጥብ እርምጃ ሜኑ በኩል በቻፓ ክፍያ ይፈጽሙ።",
    refresh: "አድስ",
    totalRegisteredVendors: "ጠቅላላ የተመዘገቡ ነጋዴዎች",
    sellersCount: "ሻጮች",
    suppliersCount: "አቅራቢዎች",
    liveMerchantsInDb: "በዳታቤዝ ውስጥ ያሉ ንቁ ነጋዴዎች",
    grossSalesDb: "የተሸጡ ምርቶች ጠቅላላ ዋጋ (DB)",
    exactSubtotalProducts: "የተሸጡ ምርቶች የተጣራ ድምር",
    commissionPaid: "የተከፈለ ኮሚሽን (3.5%)",
    takeRateDeducted: "የፕላትፎርሙ ገቢ ተቀናሽ",
    netAvailableVault: "ለክፍያ ዝግጁ የሆነ የተጣራ ቀሪ ሂሳብ",
    readyToDisburse: "በቻፓ ለመክፈል ዝግጁ የሆነ የተጣራ ሂሳብ",
    searchPlaceholder: "በሱቅ ስም፣ ስልክ ቁጥር፣ ኢሜይል፣ ታክስ መለያ (TIN) ወይም ከተማ ይፈልጉ...",
    allVendors: "ሁሉም ነጋዴዎች",
    sellers: "የችርቻሮ ሻጮች",
    suppliers: "የጅምላ አቅራቢዎች",
    payoutReady: "ክፍያ ዝግጁ",
    swipeTableHint: "👉 ወደ ጎን በማንሸራተት ሙሉውን መረጃ ይመልከቱ",
    colMerchantShop: "የነጋዴ እና የሱቅ መረጃ",
    colRoleVerification: "ሚና እና ማረጋገጫ",
    colListedProducts: "የተመዘገቡ ምርቶች",
    colOrders: "ትዕዛዞች",
    colSoldSales: "የተሸጡ ምርቶች ዋጋ (ETB)",
    colCommission: "የተከፈለ ኮሚሽን (3.5%)",
    colNetBalance: "የተጣራ ቀሪ ሂሳብ",
    colBankDestination: "የባንክ መረጃ",
    colActions: "እርምጃዎች",
    transferPayout: "በቻፓ ገንዘብ አስተላልፍ (Payout)",
    viewProfile: "የነጋዴውን ሙሉ መረጃ ተመልከት",
    copyPhone: "ስልክ ቁጥር ቅዳ",
    copyBank: "የባንክ ሂሳብ ቁጥር ቅዳ",
    copyTin: "የታክስ መለያ (TIN) ቅዳ",
    modalTransferTitle: "ለነጋዴው በቻፓ ክፍያ ማስተላለፊያ",
    modalTransferSubtitle: "ቀጥታ የኤሌክትሮኒክ ክፍያ። ገንዘቡ የሚቀነሰው በቻፓ ሲረጋገጥ ብቻ ነው።",
    availableBalanceInDb: "በዳታቤዝ ያለ ቀሪ ሂሳብ",
    enterPayoutAmount: "የሚተላለፈውን የብር መጠን ያስገቡ (ETB)",
    shortcut25: "25% አንድ አራተኛ",
    shortcut50: "50% ግማሽ",
    shortcut100: "100% ሙሉ ቀሪ ሂሳብ",
    remainingBalanceAfter: "ከዚህ ክፍያ በኋላ የሚቀረው ቀሪ ሂሳብ፦",
    willRemainInDb: "በዳታቤዝ ውስጥ ይቀራል",
    disbursementMemo: "የክፍያ ማስታወሻ / ዝርዝር",
    memoPlaceholder: "ለምሳሌ፦ የወሩ የሽያጭ ክፍያ በቻፓ በኩል...",
    securityNoticeTitle: "🛡️ የክፍያ ጥበቃ እና ደህንነት ማስታወቂያ",
    securityNoticeDesc:
      "ገንዘቡ የሚቀነሰው እና የክፍያ ማረጋገጫ የሚላከው በቻፓ ላይ ክፍያው በተሳካ ሁኔታ ሲጠናቀቅ ብቻ ነው! ክፍያውን ከሰረዙት ምንም ገንዘብ አይቀነስም።",
    cancel: "ሰርዝ",
    authorizeOnChapa: "በቻፓ ጌትዌይ ፍቀድ (Authorize)",
    connectingToChapa: "ወደ ቻፓ ጌትዌይ በማገናኘት ላይ...",
    paymentSuccessfulTitle: "ክፍያው በተሳካ ሁኔታ ተጠናቋል!",
    paymentSuccessfulSubtitle: "የክፍያ ዝውውሩ በቻፓ የክፍያ መተላለፊያ በኩል ተረጋግጦ በተሳካ ሁኔታ ተፈጽሟል።",
    transferredPayoutAmount: "የተላለፈው የክፍያ መጠን",
    beneficiaryMerchant: "ተጠቃሚ ነጋዴ/ሱቅ፦",
    destinationAccount: "የተላለፈበት የባንክ ሂሳብ፦",
    previousAvailableBalance: "የቀድሞ ቀሪ ሂሳብ፦",
    deductedFromAccount: "ከሂሳቡ የተቀነሰ፦",
    newRemainingBalance: "አዲስ የቀረ የተጣራ ቀሪ ሂሳብ በዳታቤዝ፦",
    officialPaymentId: "የትራንዛክሽን መለያ ቁጥር (Payment ID / TxRef)",
    copyId: "ኮፒ አድርግ",
    idCopied: "የትራንዛክሽን መለያ ቁጥሩ ተቀድቷል!",
    emailStatementsDispatched: "የእንግሊዝኛ የክፍያ ደረሰኞች ተልከዋል፦",
    emailToMerchant: "ለነጋዴው (ኦፊሴላዊ የክፍያ ደረሰኝ በእንግሊዝኛ)",
    emailToAdmin: "ለፕላትፎርም አድሚን (የፋይናንስ ኦዲት መዝገብ)",
    backToPayouts: "ወደ ሻጮችና አቅራቢዎች ክፍያ ገጽ ተመለስ (ተመለስ)",
    viewUpdatedBalances: "ተጠናቋል & አዲሱን ሂሳብ ተመልከት",
    verifyingWithChapa: "ክፍያውን ከቻፓ ጌትዌይ ጋር በማረጋገጥ ላይ...",
    checkingStatus: "የፍቃድ ሁኔታን በመፈተሽ ላይ። ገንዘቡ የሚቀነሰው ክፍያው ሲረጋገጥ ብቻ ነው።",
    payoutCancelledTitle: "የክፍያ ዝውውሩ ተሰርዟል ወይም አልተጠናቀቀም",
    payoutCancelledDesc: "በቻፓ ላይ ክፍያ ስላልተፈጸመ ከነጋዴው ሂሳብ ምንም ገንዘብ አልተቀነሰም (ቀሪ ሂሳቡ አልተነካም)።",
    dismiss: "አስወግድ",
    profileDetailsTitle: "የነጋዴው ሙሉ መረጃ እና ህጋዊ ሰነዶች",
    contactPerson: "የእውቂያ ሰው",
    phoneNumber: "ስልክ ቁጥር",
    emailAddress: "ኢሜይል አድራሻ",
    tinNumber: "የታክስ መለያ (TIN)",
    location: "አድራሻ / ከተማ",
    kycStatus: "የKYC ማረጋገጫ ሁኔታ",
    payoutDestination: "የክፍያ መዳረሻ ባንክ",
    listedProducts: "የተመዘገቡ ምርቶች",
    soldSalesDb: "የተሸጡ ሽያጮች (DB)",
    availablePayout: "ዝግጁ ክፍያ",
    close: "ዝጋ",
    initiatePayout: "ክፍያ ጀምር",
    noMerchantsFound: "የተፈለገው ነጋዴ አልተገኘም",
    tryDifferentSearch: "እባክዎ የተለየ የፍለጋ ቃል ወይም ማጣሪያ ይሞክሩ",
    loadingRecords: "የሻጮች እና አቅራቢዎች መረጃ በመጫን ላይ...",
  },

  om: {
    pageTitle: "Wiirtuu Kaffaltii Daldaltootaa & Dhiyeessitootaa",
    pageSubtitle:
      "Gurgurtaa daldaltootaa DB irraa hordofaa, komishinii %3.5 fi hafna herregaa qulqulluu ilaalaa, qabduu tuqaa-3 fayyadamuun kaffaltii Chapa raawwadhaa.",
    refresh: "Haaromsi",
    totalRegisteredVendors: "Waliigala Daldaltoota Galmaa'an",
    sellersCount: "Daldaltoota",
    suppliersCount: "Dhiyeessitoota",
    liveMerchantsInDb: "Daldaltoota socho'oo DB keessatti",
    grossSalesDb: "Gurgurtaa Oomishaalee Dhuunfaa (DB)",
    exactSubtotalProducts: "Gurgurtaa oomishaalee sirrii",
    commissionPaid: "Komishinii Kaffalame (%3.5)",
    takeRateDeducted: "Galii waltajjii hir'ifame",
    netAvailableVault: "Kuusaa Kaffaltii Qulqulluu Qophii",
    readyToDisburse: "Hafna kaffaltii Chapaaf qophaa'e",
    searchPlaceholder: "Maqaa suuqii, bilbila, e-meelii, TIN ykn magaalaan barbaadi...",
    allVendors: "Daldaltoota Hunda",
    sellers: "Daldaltoota Qinxaaboo",
    suppliers: "Dhiyeessitoota Jumlaa",
    payoutReady: "Kaffaltiif Qophii",
    swipeTableHint: "👉 Odeeffannoo guutuu arguuf gara cinaatti daddabarsaa",
    colMerchantShop: "Oodeeffannoo Daldalaa & Suuqii",
    colRoleVerification: "Gahee & Mirkaneessa",
    colListedProducts: "Oomishaalee Galmaa'an",
    colOrders: "Ajajoota",
    colSoldSales: "Gurgurtaa Oomishaa (ETB)",
    colCommission: "Komishinii Kaffalame (%3.5)",
    colNetBalance: "Hafna Herrega Qulqulluu",
    colBankDestination: "Herrega Baankii",
    colActions: "Tarkaanfii",
    transferPayout: "Kaffaltii Chapaan Dabarsi",
    viewProfile: "Piroofaayilii Guutuu Ilaali",
    copyPhone: "Lakk. Bilbilaa Waraabi",
    copyBank: "Herrega Baankii Waraabi",
    copyTin: "Lakk. TIN Waraabi",
    modalTransferTitle: "Kaffaltii Daldalaa Chapaan Dabarsuu",
    modalTransferSubtitle: "Kaffaltii elektirooniksii kallattii. Hafna herregaa irraa kan hir'atu Chapaan yoo mirkanaaye qofa.",
    availableBalanceInDb: "Hafna Herregaa DB keessatti",
    enterPayoutAmount: "Hamma kaffaltii dabarfamu galchaa (ETB)",
    shortcut25: "%25 Kurmaana",
    shortcut50: "%50 Walakkaa",
    shortcut100: "%100 Hafna Guutuu",
    remainingBalanceAfter: "Kaffaltii kana booda kan hafu:",
    willRemainInDb: "DB keessatti hafa",
    disbursementMemo: "Yaadannoo Kaffaltii / Ibsa",
    memoPlaceholder: "Fkn: Kaffaltii gurgurtaa Chapaan...",
    securityNoticeTitle: "🛡️ Eegumsaafi Nageenya Kaffaltii",
    securityNoticeDesc:
      "Herregni kan hir'atu kaffaltiin Chapa irratti yoo milkaa'e qofaadha! Kaffaltichi yoo haqame herregni hin tuqamu.",
    cancel: "Dhiisi",
    authorizeOnChapa: "Chapa Gateway irratti Eeyyami",
    connectingToChapa: "Gara Chapa Gatewaytti walqunnamaa jira...",
    paymentSuccessfulTitle: "Kaffaltiin Milkaa'inaan Xumurameera!",
    paymentSuccessfulSubtitle: "Kaffaltiin karaa Chapa Payment Gateway mirkanaa'ee milkaa'inaan xumurameera.",
    transferredPayoutAmount: "Hamma Kaffaltii Dabarfame",
    beneficiaryMerchant: "Daldalaa Fayyadamaa:",
    destinationAccount: "Herrega Baankii Itti Dabarfame:",
    previousAvailableBalance: "Hafna Herregaa Duraanii:",
    deductedFromAccount: "Herrega irraa kan hir'ifame:",
    newRemainingBalance: "Hafna Qulqulluu Haaraa DB keessatti:",
    officialPaymentId: "Koodii Kaffaltii / TxRef",
    copyId: "Koodii Waraabi",
    idCopied: "Koodiin kaffaltii waraabameera!",
    emailStatementsDispatched: "Waraqaan Kaffaltii Afaan Ingiliffaan Ergameera:",
    emailToMerchant: "Gara Daldalaatti (Nagahee seeraa)",
    emailToAdmin: "Gara Bulchaa Waltajjiitti (Galmee oodiitii)",
    backToPayouts: "Gara Kaffaltii Daldaltootaatti Deebi'i (Deebi'i)",
    viewUpdatedBalances: "Xumurame & Hafna Haaraa Ilaali",
    verifyingWithChapa: "Kaffaltii Chapa Gateway waliin mirkaneessaa jira...",
    checkingStatus: "Haala eeyyamaa qorachaa jira. Mirkanaa'uun dura herregni hin hir'atu.",
    payoutCancelledTitle: "Kaffaltiin Haqameera ykn Hin Xumuramne",
    payoutCancelledDesc: "Chapa irratti kaffaltiin waan hin raawwatamneef herregni daldalaa hin tuqamne.",
    dismiss: "Dhiisi",
    profileDetailsTitle: "Piroofaayilii Daldalaafi Ragaa Seeraa",
    contactPerson: "Nama Qunnamtii",
    phoneNumber: "Lakk. Bilbilaa",
    emailAddress: "Teessoo E-meelii",
    tinNumber: "Lakk. TIN",
    location: "Bakka / Magaalaa",
    kycStatus: "Haala KYC",
    payoutDestination: "Baankii Kaffaltiin Itti Dhangala'u",
    listedProducts: "Oomishaalee Galmaa'an",
    soldSalesDb: "Gurgurtaa Gurgurame (DB)",
    availablePayout: "Kaffaltii Qophii",
    close: "Cufi",
    initiatePayout: "Kaffaltii Jalqabi",
    noMerchantsFound: "Daldalaan barbaaddan hin argamne",
    tryDifferentSearch: "Mee jecha biraatiin barbaadaa",
    loadingRecords: "Galmeen daldaltootaa fe'amaa jira...",
  },

  ti: {
    pageTitle: "ናይ ሸየጥትን ኣቕረብትን ናይ ክፍሊት ማእከል",
    pageSubtitle:
      "ካብ ዳታቤዝ ዝተረኽበ ናይ ነጋዶ ሽያጥ ተኸታተሉ፣ 3.5% ኮሚሽንን ዝተረፈ ጽሩይ ሚዛንን ርኣዩ፣ ብ 3-ነቑጣታት ሜኑ ኣቢልኩም ብቻፓ ክፍሊት ፈጽሙ።",
    refresh: "ሓድስ",
    totalRegisteredVendors: "ጠቕላላ ዝተመዝገቡ ነጋዶ",
    sellersCount: "ሸየጥቲ",
    suppliersCount: "ኣቕረብቲ",
    liveMerchantsInDb: "ንጡፋት ነጋዶ ኣብ ዳታቤዝ",
    grossSalesDb: "ጠቕላላ ዝተሸጡ ፍርያት (DB)",
    exactSubtotalProducts: "ትክክለኛ ድምር ናይ ዝተሸጡ ፍርያት",
    commissionPaid: "ዝተኸፍለ ኮሚሽን (3.5%)",
    takeRateDeducted: "ዝተቐነሰ እቶት ፕላትፎርም",
    netAvailableVault: "ንክፍሊት ድሉው ዝኾነ ጽሩይ ሚዛን",
    readyToDisburse: "ብቻፓ ንምኽፋል ድሉው ዝኾነ ሚዛን",
    searchPlaceholder: "ብሽም ዱኳን፣ ስልኪ፣ ኢመይል፣ ቲን (TIN) ወይ ከተማ ድለዩ...",
    allVendors: "ኩሎም ነጋዶ",
    sellers: "ሸየጥቲ ታክን",
    suppliers: "ኣቕረብቲ ጅምላ",
    payoutReady: "ንክፍሊት ድሉው",
    swipeTableHint: "👉 ሙሉእ ሓበሬታ ንምርኣይ ብጎኒ ኣንሸራትቱ",
    colMerchantShop: "ሓበሬታ ነጋዳይን ዱኳንን",
    colRoleVerification: "ተራን ምርግጋጽን",
    colListedProducts: "ዝተመዝገቡ ፍርያት",
    colOrders: "ትእዛዛት",
    colSoldSales: "ዋጋ ዝተሸጡ ፍርያት (ETB)",
    colCommission: "ዝተኸፍለ ኮሚሽን (3.5%)",
    colNetBalance: "ጽሩይ ዝተረፈ ሚዛን",
    colBankDestination: "ሓበሬታ ባንኪ",
    colActions: "ተግባራት",
    transferPayout: "ብቻፓ ክፍሊት ኣመሓላልፍ",
    viewProfile: "ናይ ነጋዳይ መገለጺ ርአ",
    copyPhone: "ቁጽሪ ስልኪ ቅዳሕ",
    copyBank: "ቁጽሪ ባንኪ ቅዳሕ",
    copyTin: "ቲን (TIN) ቅዳሕ",
    modalTransferTitle: "ንነጋዳይ ብቻፓ ክፍሊት ምምሕልላፍ",
    modalTransferSubtitle: "ቀጥታዊ ኤለክትሮኒካዊ ክፍሊት። ካብ ሚዛን ዝቕነስ ብቻፓ ምስ ዝረጋገጽ ጥራይ እዩ።",
    availableBalanceInDb: "ኣብ ዳታቤዝ ዘሎ ሚዛን",
    enterPayoutAmount: "ዝመሓላለፍ መጠን ገንዘብ ኣእትዉ (ETB)",
    shortcut25: "25% ርብዒ",
    shortcut50: "50% ፍርቂ",
    shortcut100: "100% ሙሉእ ሚዛን",
    remainingBalanceAfter: "ድሕሪ እዚ ክፍሊት ዝተርፍ ሚዛን፦",
    willRemainInDb: "ኣብ ዳታቤዝ ይተርፍ",
    disbursementMemo: "ናይ ክፍሊት መዘኻኸሪ / መግለጺ",
    memoPlaceholder: "ንኣብነት፦ ናይ ወርሒ ሽያጥ ብቻፓ...",
    securityNoticeTitle: "🛡️ ናይ ክፍሊት ድሕንነት መተሓሳሰቢ",
    securityNoticeDesc:
      "ገንዘብ ዝቕነስን መረጋገጺ ዝለኣኽን ክፍሊት ብቻፓ ብዓወት ምስ ዝዛዘም ጥራይ እዩ! እንተተሰሪዙ ገንዘብ ኣይቕነስን።",
    cancel: "ሰርዝ",
    authorizeOnChapa: "ብቻፓ ፍቐድ (Authorize)",
    connectingToChapa: "ናብ ቻፓ ይተኣሳሰር ኣሎ...",
    paymentSuccessfulTitle: "ክፍሊት ብዓወት ተዛዚሙ!",
    paymentSuccessfulSubtitle: "እቲ ዝውውር ብቻፓ ኣቢሉ ተረጋጊጹ ብዓወት ተፈጺሙ ኣሎ።",
    transferredPayoutAmount: "ዝተመሓላለፈ መጠን ክፍሊት",
    beneficiaryMerchant: "ተጠቃሚ ነጋዳይ፦",
    destinationAccount: "ዝተመሓላለፈሉ ሕሳብ ባንኪ፦",
    previousAvailableBalance: "ናይ ቀደም ዝነበረ ሚዛን፦",
    deductedFromAccount: "ካብ ሕሳብ ዝተቐነሰ፦",
    newRemainingBalance: "ሓድሽ ዝተረፈ ጽሩይ ሚዛን ኣብ ዳታቤዝ፦",
    officialPaymentId: "ናይ ትራንዛክሽን ቁጽሪ (Payment ID / TxRef)",
    copyId: "ቅዳሕ",
    idCopied: "ናይ ትራንዛክሽን ቁጽሪ ተቐዲሑ!",
    emailStatementsDispatched: "ናይ ክፍሊት ቅብሊት ብእንግሊዝኛ ተላኢኹ ኣሎ፦",
    emailToMerchant: "ንነጋዳይ (ሕጋዊ ቅብሊት ብእንግሊዝኛ)",
    emailToAdmin: "ንኣድሚን (ናይ ኦዲት መዝገብ)",
    backToPayouts: "ናብ ናይ ሸየጥትን ኣቕረብትን ክፍሊት ተመለስ (ተመለስ)",
    viewUpdatedBalances: "ተዛዚሙ & ዝተመዓራረየ ሚዛን ርአ",
    verifyingWithChapa: "ምስ ቻፓ ይረጋገጽ ኣሎ...",
    checkingStatus: "ኩነታት ፍቓድ ይምርምር ኣሎ።",
    payoutCancelledTitle: "ዝውውር ክፍሊት ተሰሪዙ ወይ ኣይተዛዘመን",
    payoutCancelledDesc: "ብቻፓ ክፍሊት ስለዘይተፈጸመ ካብ ሚዛን ነጋዳይ ዝተቐነሰ ገንዘብ የለን።",
    dismiss: "ኣወግድ",
    profileDetailsTitle: "ናይ ነጋዳይ መገለጺን ሕጋዊ ሰነዳትን",
    contactPerson: "ዝርከብ ሰብ",
    phoneNumber: "ቁጽሪ ስልኪ",
    emailAddress: "ኢመይል ኣድራሻ",
    tinNumber: "ቲን (TIN)",
    location: "ቦታ / ከተማ",
    kycStatus: "ኩነታት KYC",
    payoutDestination: "መቐበሊ ባንኪ",
    listedProducts: "ዝተመዝገቡ ፍርያት",
    soldSalesDb: "ዝተሸጡ (DB)",
    availablePayout: "ድሉው ክፍሊት",
    close: "ዕጾ",
    initiatePayout: "ክፍሊት ጀምር",
    noMerchantsFound: "ዝተደለየ ነጋዳይ ኣይተረኽበን",
    tryDifferentSearch: "ዝተፈልየ ቃል ፈትኑ",
    loadingRecords: "ናይ ሸየጥትን ኣቕረብትን መዝገብ ይጽዕን ኣሎ...",
  },
};

import type { LanguageCode } from "./translations";

export interface SettingsTranslationDictionary {
  // Top Header & Actions
  pageTitle: string;
  pageSubtitle: string;
  syncing: string;
  unsavedChanges: string;
  resetDefaults: string;
  resetDefaultsConfirm: string;
  saveToBackend: string;
  saving: string;
  save: string;
  saveConfiguration: string;
  universalRealtimeEnabled: string;

  // Maintenance Banner
  maintenanceActiveTitle: string;
  maintenanceActiveDesc: string;
  disable: string;
  enabled: string;
  enable: string;

  // Sidebar & Badges
  settingsNav: string;
  sectionsCount: string;
  universalSync: string;
  live: string;
  activeBadge: string;

  // Sidebar Tabs
  tabAllTitle: string;
  tabAllSub: string;
  tabAllBadge: string;
  tabBrandTitle: string;
  tabBrandSub: string;
  tabBrandBadge: string;
  tabContactTitle: string;
  tabContactSub: string;
  tabContactBadge: string;
  tabSecurityTitle: string;
  tabSecuritySub: string;
  tabSecurityBadge: string;
  tabEscrowTitle: string;
  tabEscrowSub: string;
  tabEscrowBadge: string;
  tabGatewaysTitle: string;
  tabGatewaysSub: string;
  tabGatewaysBadge: string;
  tabCardTitle: string;
  tabCardSub: string;
  tabCardBadge: string;
  tabKycTitle: string;
  tabKycSub: string;
  tabKycBadge: string;

  // Section 1: Brand & Identity
  brandSectionTitle: string;
  platformBrandName: string;
  platformNamePlaceholder: string;
  brandNameHint: string;
  taglineLabel: string;
  taglinePlaceholder: string;
  heroDescriptionLabel: string;
  heroDescriptionPlaceholder: string;
  logoUploadTitle: string;
  logoUploadDesc: string;
  customLogoActive: string;
  darkHeaderPreview: string;
  lightModePreview: string;
  uploadImageLogo: string;
  uploading: string;
  removeLogo: string;
  orPasteDirectUrl: string;
  fallbackMonograms: string;
  presetModernGradient: string;
  presetEscrowShield: string;
  presetBirrGreen: string;
  presetOnyxMinimal: string;
  baseCurrency: string;
  regionalTimezone: string;

  // Section 2: Footer & Contact
  footerSectionTitle: string;
  customerSupportEmail: string;
  supportEmailSyncHint: string;
  primaryContactPhone: string;
  emergencyHotline: string;
  headquartersAddress: string;
  headquartersPlaceholder: string;
  footerCopyrightNotice: string;
  telegramChannel: string;
  linkedInPage: string;

  // Section 3: Admin Credentials & Security
  securitySectionTitle: string;
  changeEmailTitle: string;
  activeStatus: string;
  newAdminEmail: string;
  confirmNewEmail: string;
  updateLoginEmail: string;
  updatingEmail: string;
  changePasswordTitle: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  updatePassword: string;
  updatingPassword: string;
  passwordWeak: string;
  passwordFair: string;
  passwordGood: string;
  passwordStrong: string;
  passwordTooShort: string;
  enforce2FA: string;
  disbursementProtection: string;
  autoLock: string;
  sessionTimeout: string;
  minutesUnit: string;
  bruteForceTitle: string;
  defenseBadge: string;
  bruteForceDesc: string;
  failedAttemptsLimit: string;
  failedAttemptsHint: string;
  triesUnit: string;
  cooldownCountdown: string;
  cooldownHint: string;
  secUnit: string;
  maxLockoutCycles: string;
  maxLockoutHint: string;
  roundsUnit: string;

  // Section 4: Escrow & Finance
  escrowSectionTitle: string;
  sellerCommissionRate: string;
  commissionBadge: string;
  commissionDesc: string;
  escrowAutoRelease: string;
  holdDurationBadge: string;
  escrowHoldDesc: string;
  hrsUnit: string;

  // Section 4B: MercatoX Card
  cardSectionTitle: string;
  adminPricingBadge: string;
  cardPurchasePriceTitle: string;
  cardPurchasePriceDesc: string;
  digitalCardPriceLabel: string;
  basePriceBadge: string;
  digitalCardPriceDesc: string;
  defaultBalanceLabel: string;
  loadBalanceBadge: string;
  defaultBalanceDesc: string;
  customerCheckoutTotal: string;
  feeLabel: string;
  balanceLabel: string;

  // Section 5: Gateways
  gatewaysSectionTitle: string;
  telebirrTitle: string;
  telebirrSub: string;
  cbeBirrTitle: string;
  cbeBirrSub: string;
  chapaTitle: string;
  chapaSub: string;

  // Section 6: Merchant KYC
  kycSectionTitle: string;
  tinVerificationTitle: string;
  tinVerificationDesc: string;
  tradeLicenseTitle: string;
  tradeLicenseDesc: string;
  riderOcrTitle: string;
  riderOcrDesc: string;
  clusterMaintenanceTitle: string;
  clusterMaintenanceDesc: string;
}

export const SETTINGS_TRANSLATIONS: Record<LanguageCode, SettingsTranslationDictionary> = {
  en: {
    pageTitle: "Platform & Security Settings",
    pageSubtitle: "Customize marketplace name, upload platform logo, configure contacts, and sync everywhere.",
    syncing: "Syncing...",
    unsavedChanges: "Unsaved Changes",
    resetDefaults: "Reset Defaults",
    resetDefaultsConfirm: "Reset all platform settings to default values?",
    saveToBackend: "Save to Backend",
    saving: "Saving...",
    save: "Save",
    saveConfiguration: "Save Configuration",
    universalRealtimeEnabled: "Universal realtime update enabled",

    maintenanceActiveTitle: "Cluster Maintenance Mode is Currently Active",
    maintenanceActiveDesc: "Storefront checkout is paused. Escrow balances and administrative functions remain intact.",
    disable: "Disable",
    enabled: "ENABLED",
    enable: "Enable",

    settingsNav: "Settings Navigation",
    sectionsCount: "7 Sections",
    universalSync: "Universal Sync",
    live: "LIVE",
    activeBadge: "ACTIVE",

    tabAllTitle: "Compact Grid",
    tabAllSub: "All settings overview",
    tabAllBadge: "ALL",
    tabBrandTitle: "Brand & Identity",
    tabBrandSub: "Name, logo & meta",
    tabBrandBadge: "CORE",
    tabContactTitle: "Footer & Contact",
    tabContactSub: "Email, phone & address",
    tabContactBadge: "PUBLIC",
    tabSecurityTitle: "Admin Credentials",
    tabSecuritySub: "Login email & password",
    tabSecurityBadge: "AUTH",
    tabEscrowTitle: "Escrow & Finance",
    tabEscrowSub: "Commission & release windows",
    tabEscrowBadge: "RULES",
    tabGatewaysTitle: "Gateways",
    tabGatewaysSub: "Telebirr, CBE & Chapa",
    tabGatewaysBadge: "PAYMENTS",
    tabCardTitle: "MercatoX Card",
    tabCardSub: "Issuance price & limits",
    tabCardBadge: "PRICING",
    tabKycTitle: "Merchant KYC",
    tabKycSub: "TIN, license & couriers",
    tabKycBadge: "GOVERNANCE",

    brandSectionTitle: "Brand & Identity",
    platformBrandName: "Platform Brand Name",
    platformNamePlaceholder: "e.g. MercatoX",
    brandNameHint: "⚡ Modifying this name immediately updates all headers, footers, sidebars, and customer pages!",
    taglineLabel: "Tagline / Subtitle",
    taglinePlaceholder: "e.g. Unified Commerce & Escrow Control Center",
    heroDescriptionLabel: "Hero Section Description",
    heroDescriptionPlaceholder: "Overview of platform for hero banner, SEO and customer showcase...",
    logoUploadTitle: "Platform Logo Image Upload",
    logoUploadDesc: "Upload your official logo to be displayed across all headers & footers",
    customLogoActive: "Custom Logo Active",
    darkHeaderPreview: "Dark Header",
    lightModePreview: "Light Mode",
    uploadImageLogo: "Upload Image Logo",
    uploading: "Uploading...",
    removeLogo: "Remove",
    orPasteDirectUrl: "Or Paste Direct Image URL (PNG/SVG/WebP)",
    fallbackMonograms: "Fallback Monogram Color Schemes:",
    presetModernGradient: "Modern Gradient",
    presetEscrowShield: "Escrow Shield",
    presetBirrGreen: "Birr Green",
    presetOnyxMinimal: "Onyx Minimal",
    baseCurrency: "Base Currency",
    regionalTimezone: "Regional Timezone",

    footerSectionTitle: "Footer & Public Contact Info",
    customerSupportEmail: "Customer Support Email (Footer)",
    supportEmailSyncHint: "Synchronized with the customer website footer in real time.",
    primaryContactPhone: "Primary Contact Phone",
    emergencyHotline: "Emergency Hotline",
    headquartersAddress: "Physical Headquarters Address",
    headquartersPlaceholder: "Bole Medhanialem Commercial Plaza, Addis Ababa",
    footerCopyrightNotice: "Footer Copyright Notice",
    telegramChannel: "Telegram Channel",
    linkedInPage: "LinkedIn Page",

    securitySectionTitle: "Administrator Credentials & Security",
    changeEmailTitle: "Change Login Administrator Email",
    activeStatus: "ACTIVE",
    newAdminEmail: "New Admin Email",
    confirmNewEmail: "Confirm New Email",
    updateLoginEmail: "Update Login Email",
    updatingEmail: "Updating Email...",
    changePasswordTitle: "Change Administrator Password",
    currentPassword: "Current Password",
    newPassword: "New Password (Min 8 chars)",
    confirmNewPassword: "Confirm New Password",
    updatePassword: "Update Password",
    updatingPassword: "Updating Password...",
    passwordWeak: "Weak",
    passwordFair: "Fair",
    passwordGood: "Good",
    passwordStrong: "Strong & Secure",
    passwordTooShort: "Too Short",
    enforce2FA: "Enforce 2FA",
    disbursementProtection: "Disbursement protection",
    autoLock: "Auto-Lock",
    sessionTimeout: "Session timeout",
    minutesUnit: "m",
    bruteForceTitle: "Brute-Force Defense & Security Lockout Policy",
    defenseBadge: "DEFENSE",
    bruteForceDesc: "Configure thresholds for consecutive failed login attempts, temporary countdown lockout cooldowns, and permanent block rounds.",
    failedAttemptsLimit: "Failed Attempts Limit",
    failedAttemptsHint: "Triggers temporary cooldown",
    triesUnit: "tries",
    cooldownCountdown: "Cooldown Countdown",
    cooldownHint: "Temporary inactive duration",
    secUnit: "sec",
    maxLockoutCycles: "Max Lockout Cycles",
    maxLockoutHint: "Permanently blocks user on 3rd",
    roundsUnit: "rounds",

    escrowSectionTitle: "Escrow & Commission Parameters",
    sellerCommissionRate: "Seller Sales Commission Rate (%)",
    commissionBadge: "COMMISSION",
    commissionDesc: "Platform commission percentage deducted from seller revenue upon successful product sale.",
    escrowAutoRelease: "Escrow Auto-Release Window",
    holdDurationBadge: "HOLD DURATION",
    escrowHoldDesc: "Duration the payment remains held in escrow after delivery before releasing to merchant.",
    hrsUnit: "HRS",

    cardSectionTitle: "MercatoX Digital Card Pricing & Issuance Controls",
    adminPricingBadge: "ADMIN PRICING",
    cardPurchasePriceTitle: "Admin-Enforced Card Purchase Price",
    cardPurchasePriceDesc: "Define the official fixed price customers must pay via Chapa to issue their digital MercatoX Card. Customers purchase the card at this exact admin-specified rate.",
    digitalCardPriceLabel: "Digital Card Issuance Price (ETB)",
    basePriceBadge: "BASE PRICE",
    digitalCardPriceDesc: "Fixed issuance fee charged to customer when ordering an official MercatoX digital card.",
    defaultBalanceLabel: "Recommended Default Balance (ETB)",
    loadBalanceBadge: "LOAD BALANCE",
    defaultBalanceDesc: "Default starting load balance preset on the card purchase interface.",
    customerCheckoutTotal: "Customer Chapa Checkout Total:",
    feeLabel: "Fee",
    balanceLabel: "Balance",

    gatewaysSectionTitle: "National Payment Gateways",
    telebirrTitle: "Ethio Telecom Telebirr SuperApp",
    telebirrSub: "Shortcode: {shortcode} · IPN Hook Active",
    cbeBirrTitle: "Commercial Bank of Ethiopia (CBE Birr API)",
    cbeBirrSub: "Direct Core Banking IPN",
    chapaTitle: "Chapa Card Gateway (Visa / Master)",
    chapaSub: "Live Production Key Configured",

    kycSectionTitle: "Merchant KYC & Compliance Rules",
    tinVerificationTitle: "Mandatory Tax ID (TIN) Verification",
    tinVerificationDesc: "Validated with Ministry of Revenues registry",
    tradeLicenseTitle: "Commercial Trade License Prerequisite",
    tradeLicenseDesc: "Merchants cannot publish products until verified",
    riderOcrTitle: "Automated Rider License OCR",
    riderOcrDesc: "Motorcycle and courier license validation",
    clusterMaintenanceTitle: "Cluster Maintenance Mode",
    clusterMaintenanceDesc: "Halts public checkout while securing escrow",
  },

  am: {
    pageTitle: "የፕላትፎርም እና የደህንነት ማስተካከያዎች",
    pageSubtitle: "የገበያ ቦታውን ስም ያብጁ፣ ይፋዊ ሎጎ ይጫኑ፣ አድራሻዎችን ያዋቅሩ እና በሁሉም ቦታዎች በቅጽበት ያመሳስሉ።",
    syncing: "በማመሳሰል ላይ...",
    unsavedChanges: "ያልተቀመጡ ለውጦች",
    resetDefaults: "ወደ ነባሪ መልስ",
    resetDefaultsConfirm: "ሁሉንም የፕላትፎርም ማስተካከያዎች ወደ ነባሪ እሴቶች መመለስ ይፈልጋሉ?",
    saveToBackend: "ወደ ሰርቨር አስቀምጥ",
    saving: "በማስቀመጥ ላይ...",
    save: "አስቀምጥ",
    saveConfiguration: "ማስተካከያውን አስቀምጥ",
    universalRealtimeEnabled: "ሁለንተናዊ ቅጽበታዊ ማመሳሰል ነቅቷል",

    maintenanceActiveTitle: "የሲስተም የጥገና ሁኔታ በአሁኑ ጊዜ በርቷል",
    maintenanceActiveDesc: "የደንበኞች ግዢ ለጊዜው ቆሟል። የኢስክሮው ሂሳብ እና የአድሚን ስራዎች እንደተጠበቁ ናቸው።",
    disable: "አጥፋ",
    enabled: "በርቷል",
    enable: "አብራ",

    settingsNav: "የማስተካከያ አሰሳ",
    sectionsCount: "7 ክፍሎች",
    universalSync: "ሁለንተናዊ ማመሳሰል",
    live: "በቀጥታ",
    activeBadge: "ንቁ",

    tabAllTitle: "ጥምር እይታ",
    tabAllSub: "የሁሉም ማስተካከያዎች አጠቃላይ እይታ",
    tabAllBadge: "ሁሉም",
    tabBrandTitle: "ብራንድ እና መለያ",
    tabBrandSub: "ስም፣ ሎጎ እና ሜታ",
    tabBrandBadge: "ዋና",
    tabContactTitle: "ግርጌ እና አድራሻ",
    tabContactSub: "ኢሜይል፣ ስልክ እና አድራሻ",
    tabContactBadge: "ይፋዊ",
    tabSecurityTitle: "የአድሚን መለያዎች",
    tabSecuritySub: "መግቢያ ኢሜይል እና የይለፍ ቃል",
    tabSecurityBadge: "ማረጋገጫ",
    tabEscrowTitle: "ኢስክሮው እና ፋይናንስ",
    tabEscrowSub: "ኮሚሽን እና የክፍያ መልቀቂያ ጊዜ",
    tabEscrowBadge: "ደንቦች",
    tabGatewaysTitle: "የክፍያ መንገዶች",
    tabGatewaysSub: "ቴሌብር፣ ንግድ ባንክ እና ቻፓ",
    tabGatewaysBadge: "ክፍያዎች",
    tabCardTitle: "መርካቶኤክስ ካርድ",
    tabCardSub: "የካርድ ማውጫ ክፍያ እና ገደቦች",
    tabCardBadge: "ዋጋ",
    tabKycTitle: "የነጋዴ KYC",
    tabKycSub: "የግብር ቁጥር (TIN)፣ ፍቃድ እና መልእክተኞች",
    tabKycBadge: "ቁጥጥር",

    brandSectionTitle: "ብራንድ እና መለያ",
    platformBrandName: "የፕላትፎርም የንግድ ስም",
    platformNamePlaceholder: "ምሳሌ፡ MercatoX",
    brandNameHint: "⚡ ይህን ስም መቀየር ወዲያውኑ ሁሉንም ራስጌዎች፣ ግርጌዎች፣ የጎን አሞሌዎችን እና የደንበኞች ገጾችን ያዘምናል!",
    taglineLabel: "መሪ ቃል / ንዑስ ርዕስ",
    taglinePlaceholder: "ምሳሌ፡ የተዋሃደ የንግድ እና የኢስክሮው ቁጥጥር ማዕከል",
    heroDescriptionLabel: "የዋናው ገጽ ማብራሪያ",
    heroDescriptionPlaceholder: "የገበያ ቦታው ዋና ማብራሪያ ለገጽ ባነር፣ SEO እና የደንበኞች ማሳያ...",
    logoUploadTitle: "የፕላትፎርም ሎጎ ምስል መጫኛ",
    logoUploadDesc: "በሁሉም ራስጌዎች እና ግርጌዎች ላይ የሚታየውን ይፋዊ ሎጎዎን ይጫኑ",
    customLogoActive: "ብጁ ሎጎ በርቷል",
    darkHeaderPreview: "ጥቁር ራስጌ",
    lightModePreview: "ነጭ ገጽታ",
    uploadImageLogo: "የሎጎ ምስል ጫን",
    uploading: "በመጫን ላይ...",
    removeLogo: "አስወግድ",
    orPasteDirectUrl: "ወይም የቀጥታ የምስል አድራሻ (URL) ያስገቡ (PNG/SVG/WebP)",
    fallbackMonograms: "አማራጭ የፊደል ቀለም ቅንብሮች፡",
    presetModernGradient: "ዘመናዊ ቅልመት",
    presetEscrowShield: "የኢስክሮው ጋሻ",
    presetBirrGreen: "የብር አረንጓዴ",
    presetOnyxMinimal: "አነስተኛ ጥቁር",
    baseCurrency: "መደበኛ የገንዘብ ምንዛሬ",
    regionalTimezone: "የክልል የሰዓት ሰቅ",

    footerSectionTitle: "የግርጌ እና ይፋዊ የመገናኛ መረጃ",
    customerSupportEmail: "የደንበኞች ድጋፍ ኢሜይል (ግርጌ)",
    supportEmailSyncHint: "በቅጽበት ከደንበኞች ድረ-ገጽ ግርጌ ጋር ይመሳሰላል።",
    primaryContactPhone: "ዋና የመገናኛ ስልክ",
    emergencyHotline: "የአደጋ ጊዜ ስልክ መስመር",
    headquartersAddress: "የዋናው ቢሮ ትክክለኛ አድራሻ",
    headquartersPlaceholder: "ቦሌ መድኃኔዓለም የንግድ ማዕከል፣ አዲስ አበባ",
    footerCopyrightNotice: "የግርጌ የቅጂ መብት ማስታወሻ",
    telegramChannel: "የቴሌግራም ቻናል",
    linkedInPage: "የሊንክድኢን ገጽ",

    securitySectionTitle: "የአድሚን መለያዎች እና ደህንነት",
    changeEmailTitle: "የአድሚን መግቢያ ኢሜይል ቀይር",
    activeStatus: "ንቁ",
    newAdminEmail: "አዲስ የአድሚን ኢሜይል",
    confirmNewEmail: "አዲሱን ኢሜይል አረጋግጥ",
    updateLoginEmail: "መግቢያ ኢሜይልን አዘምን",
    updatingEmail: "ኢሜይሉን በማዘመን ላይ...",
    changePasswordTitle: "የአድሚን የይለፍ ቃል ቀይር",
    currentPassword: "አሁን ያለው የይለፍ ቃል",
    newPassword: "አዲስ የይለፍ ቃል (ቢያንስ 8 ፊደላት)",
    confirmNewPassword: "አዲሱን የይለፍ ቃል አረጋግጥ",
    updatePassword: "የይለፍ ቃልን አዘምን",
    updatingPassword: "የይለፍ ቃልን በማዘመን ላይ...",
    passwordWeak: "ደካማ",
    passwordFair: "መካከለኛ",
    passwordGood: "ጥሩ",
    passwordStrong: "ጠንካራ እና አስተማማኝ",
    passwordTooShort: "በጣም አጭር",
    enforce2FA: "ባለሁለት ደረጃ ማረጋገጫ (2FA) አስገድድ",
    disbursementProtection: "የገንዘብ ክፍያ ደህንነት ጥበቃ",
    autoLock: "ራስ-ሰር መቆለፊያ",
    sessionTimeout: "የስራ ክፍለ ጊዜ ገደብ",
    minutesUnit: "ደቂቃ",
    bruteForceTitle: "የጥቃት መከላከያ እና የደህንነት መቆለፊያ ፖሊሲ",
    defenseBadge: "መከላከያ",
    bruteForceDesc: "ተከታታይ የተሳሳቱ የመግቢያ ሙከራዎችን ገደብ፣ ጊዜያዊ የእገዳ ቆይታ እና ዘላቂ እገዳን ያዋቅሩ።",
    failedAttemptsLimit: "የተሳሳቱ ሙከራዎች ገደብ",
    failedAttemptsHint: "ጊዜያዊ እገዳን ያስነሳል",
    triesUnit: "ሙከራዎች",
    cooldownCountdown: "የእገዳ ቆይታ ቆጣሪ",
    cooldownHint: "ጊዜያዊ የእገዳ ቆይታ",
    secUnit: "ሰከንድ",
    maxLockoutCycles: "ከፍተኛው የእገዳ ዙሮች",
    maxLockoutHint: "በ 3ኛው ላይ ተጠቃሚውን ሙሉ በሙሉ ያግዳል",
    roundsUnit: "ዙሮች",

    escrowSectionTitle: "የኢስክሮው እና የኮሚሽን መለኪያዎች",
    sellerCommissionRate: "የሻጭ ሽያጭ የኮሚሽን መጠን (%)",
    commissionBadge: "ኮሚሽን",
    commissionDesc: "ምርት በተሳካ ሁኔታ ሲሸጥ ከሻጩ ገቢ ላይ የሚቀነስ የፕላትፎርም ኮሚሽን መቶኛ።",
    escrowAutoRelease: "የኢስክሮው ራስ-ሰር መልቀቂያ ጊዜ",
    holdDurationBadge: "የማቆያ ቆይታ",
    escrowHoldDesc: "እቃው ከደረሰ በኋላ ክፍያው ለነጋዴው ከመለቀቁ በፊት በኢስክሮው ውስጥ የሚቆይበት ጊዜ።",
    hrsUnit: "ሰዓታት",

    cardSectionTitle: "የመርካቶኤክስ ዲጂታል ካርድ ዋጋ እና ማውጫ ቁጥጥሮች",
    adminPricingBadge: "የአድሚን ዋጋ",
    cardPurchasePriceTitle: "በአድሚን የተወሰነ የካርድ መግዣ ዋጋ",
    cardPurchasePriceDesc: "ደንበኞች የዲጂታል መርካቶኤክስ ካርዳቸውን ለማውጣት በቻፓ በኩል መክፈል ያለባቸውን ይፋዊ ቋሚ ዋጋ ይወስኑ። ደንበኞች በዚህ ትክክለኛ ዋጋ ካርዱን ይገዛሉ።",
    digitalCardPriceLabel: "የዲጂታል ካርድ ማውጫ ዋጋ (ብር)",
    basePriceBadge: "መነሻ ዋጋ",
    digitalCardPriceDesc: "ደንበኞች ይፋዊ የመርካቶኤክስ ዲጂታል ካርድ ሲያዙ የሚጠየቁት ቋሚ የማውጫ ክፍያ።",
    defaultBalanceLabel: "የሚመከር መነሻ ሂሳብ (ብር)",
    loadBalanceBadge: "የመነሻ ሂሳብ",
    defaultBalanceDesc: "በካርድ መግዣ ገጽ ላይ ቀድሞ የተቀመጠ የመነሻ ገንዘብ መጠን።",
    customerCheckoutTotal: "በቻፓ የደንበኞች አጠቃላይ ክፍያ፡",
    feeLabel: "ክፍያ",
    balanceLabel: "ሂሳብ",

    gatewaysSectionTitle: "የሀገር ውስጥ የክፍያ መንገዶች",
    telebirrTitle: "የኢትዮ ቴሌኮም ቴሌብር ሱፐርአፕ",
    telebirrSub: "አጭር ቁጥር: {shortcode} · IPN ግንኙነት ንቁ ነው",
    cbeBirrTitle: "የኢትዮጵያ ንግድ ባንክ (ንግድ ባንክ ብር API)",
    cbeBirrSub: "ቀጥተኛ የባንክ ስርዓት IPN",
    chapaTitle: "የቻፓ ካርድ ክፍያ (ቪዛ / ማስተርካርድ)",
    chapaSub: "የቀጥታ የፕሮዳክሽን ቁልፍ ተዋቅሯል",

    kycSectionTitle: "የነጋዴ KYC እና የተገዢነት ህጎች",
    tinVerificationTitle: "የግዴታ የታክስ መለያ ቁጥር (TIN) ማረጋገጫ",
    tinVerificationDesc: "ከገቢዎች ሚኒስቴር መዝገብ ጋር ይረጋገጣል",
    tradeLicenseTitle: "የንግድ ስራ ፍቃድ ቅድመ ሁኔታ",
    tradeLicenseDesc: "ነጋዴዎች እስኪረጋገጡ ድረስ ምርቶችን መለጠፍ አይችሉም",
    riderOcrTitle: "አውቶማቲክ የአሽከርካሪዎች መንጃ ፍቃድ OCR",
    riderOcrDesc: "የሞተር ሳይክል እና የመልእክተኛ መንጃ ፍቃድ ማረጋገጫ",
    clusterMaintenanceTitle: "የሲስተም ጥገና ሁኔታ",
    clusterMaintenanceDesc: "የኢስክሮው ደህንነትን እየጠበቀ የህዝብ ግዢን ያቆማል",
  },

  om: {
    pageTitle: "Qindaa'ina Sirnaa fi Nageenyaa",
    pageSubtitle: "Maqaa gabaa jijjiiri, asxaa olkaa'i, teessoo qindeessi, bakka hundattis yeroodhaan walsimsiisi.",
    syncing: "Walsimsiisaa jira...",
    unsavedChanges: "Jijjiirama Hin Olkaa'amne",
    resetDefaults: "Gara Jalqabaatti Deebisi",
    resetDefaultsConfirm: "Qindaa'ina hunda gara gatiiwwan jalqabaatti deebisuu barbaadduu?",
    saveToBackend: "Gara Seerveraatti Olkaa'i",
    saving: "Olkaa'aa jira...",
    save: "Olkaa'i",
    saveConfiguration: "Qindaa'ina Olkaa'i",
    universalRealtimeEnabled: "Walsimsiisni yerootoo guutuu hojiirra jira",

    maintenanceActiveTitle: "Haalli Suphaa Sirnaa Yeroo Ammaa Banaadha",
    maintenanceActiveDesc: "Bittaa fi gurgurtaan yeroof dhaabbateera. Herregni eeggannoo fi hojiin kutaalee bulchiinsaa eegamaadha.",
    disable: "Dhaamsi",
    enabled: "BANAADHA",
    enable: "Bani",

    settingsNav: "Baniinsa Qindaa'inaa",
    sectionsCount: "Kutaalee 7",
    universalSync: "Walsimsiisa Guutuu",
    live: "HOJIIRRA",
    activeBadge: "HOJII-IRRA",

    tabAllTitle: "Giddugala Cuunfaa",
    tabAllSub: "Ilaalcha qindaa'ina hunda",
    tabAllBadge: "HUNDA",
    tabBrandTitle: "Mallattoo fi Eenyummaa",
    tabBrandSub: "Maqaa, asxaa fi meetaa",
    tabBrandBadge: "BU'UURA",
    tabContactTitle: "Miiljalee fi Quunnamtii",
    tabContactSub: "Imeelii, bilbila fi teessoo",
    tabContactBadge: "HAWAASA",
    tabSecurityTitle: "Eenyummeessa Bulchaa",
    tabSecuritySub: "Imeelii seensaa fi jecha darbii",
    tabSecurityBadge: "MIRA",
    tabEscrowTitle: "Eeggannoo fi Faayinaansii",
    tabEscrowSub: "Koomishinii fi yeroo gadi-lakkisaa",
    tabEscrowBadge: "SEEROTA",
    tabGatewaysTitle: "Kallattiiwwan Kaffaltii",
    tabGatewaysSub: "Telebirr, CBE fi Chapa",
    tabGatewaysBadge: "KAFFALTIIWWAN",
    tabCardTitle: "Kaardii MercatoX",
    tabCardSub: "Gatii baasuu fi daangaawwan",
    tabCardBadge: "GATII",
    tabKycTitle: "Mirkaneessa Daldalaa (KYC)",
    tabKycSub: "TIN, heyyama daldalaa fi ergamtoota",
    tabKycBadge: "BULCHIINSA",

    brandSectionTitle: "Mallattoo fi Eenyummaa",
    platformBrandName: "Maqaa Daldala Sirnichaa",
    platformNamePlaceholder: "fk. MercatoX",
    brandNameHint: "⚡ Maqaa kana jijjiiruun battalumatti mata-dureewwan, miiljaleewwan fi fuulawwan maamilaa hunda haaromsa!",
    taglineLabel: "Mottoo / Jecha Dhaadannoo",
    taglinePlaceholder: "fk. Giddugala Daldalaa fi Eeggannoo Gamtaa",
    heroDescriptionLabel: "Ibsa Fuula Jalqabaa",
    heroDescriptionPlaceholder: "Ibsa gabaabaa sirnichaa fuula guddaaf, SEO fi beeksisaaf...",
    logoUploadTitle: "Asxaa Sirnichaa Olkaa'uu",
    logoUploadDesc: "Asxaa sirna keessanii fuulawwan hunda irratti mul'atu olkaa'aa",
    customLogoActive: "Asxaan Filatame Banaadha",
    darkHeaderPreview: "Mata-duree Gurraacha",
    lightModePreview: "Haala Ifaa",
    uploadImageLogo: "Suuraa Asxaa Olkaa'i",
    uploading: "Olkaa'aa jira...",
    removeLogo: "Balleessi",
    orPasteDirectUrl: "Yookiin Teessoo Suuraa Kallattiin Galchaa (PNG/SVG/WebP)",
    fallbackMonograms: "Filannoowwan Halluu Qubee:",
    presetModernGradient: "Kallattii Ammayyaa",
    presetEscrowShield: "Gaachana Eeggannoo",
    presetBirrGreen: "Magariisa Birrii",
    presetOnyxMinimal: "Gurraacha Salphaa",
    baseCurrency: "Gosa Maallaqaa Bu'uuraa",
    regionalTimezone: "Naannoo Sa'aatii",

    footerSectionTitle: "Miiljalee fi Odeeffannoo Quunnamtii",
    customerSupportEmail: "Imeelii Deeggarsa Maamilaa (Miiljalee)",
    supportEmailSyncHint: "Miiljalee weebsaayitii maamilaa wajjin battalumatti walsima.",
    primaryContactPhone: "Bilbila Quunnamtii Guddaa",
    emergencyHotline: "Sarara Balaa Ariifachiisaa",
    headquartersAddress: "Teessoo Waajjira Muummichaa",
    headquartersPlaceholder: "Giddugala Daldalaa Boolee Madhaanaalam, Finfinnee",
    footerCopyrightNotice: "Beeksisa Mirga Qopheessummaa",
    telegramChannel: "Chaanaalii Telegiraamii",
    linkedInPage: "Fuula LinkedIn",

    securitySectionTitle: "Eenyummeessa Bulchaa fi Nageenya",
    changeEmailTitle: "Imeelii Seensaa Bulchaa Jijjiiri",
    activeStatus: "HOJII-IRRA",
    newAdminEmail: "Imeelii Bulchaa Haaraa",
    confirmNewEmail: "Imeelii Haaraa Mirkaneessi",
    updateLoginEmail: "Imeelii Seensaa Haaromsi",
    updatingEmail: "Imeelii haaromsaa jira...",
    changePasswordTitle: "Jecha Darbii Bulchaa Jijjiiri",
    currentPassword: "Jecha Darbii Ammaa",
    newPassword: "Jecha Darbii Haaraa (Yoo xiqqaate qubee 8)",
    confirmNewPassword: "Jecha Darbii Haaraa Mirkaneessi",
    updatePassword: "Jecha Darbii Haaromsi",
    updatingPassword: "Jecha darbii haaromsaa jira...",
    passwordWeak: "Laafaa",
    passwordFair: "Giddu-galeessa",
    passwordGood: "Gaarii",
    passwordStrong: "Cimaa fi Amansiisaa",
    passwordTooShort: "Gabaabaadha",
    enforce2FA: "Mirkaneessa Sadarkaa Lammaffaa (2FA) Dirqisiisi",
    disbursementProtection: "Eegumsa kaffaltii maallaqaa",
    autoLock: "Ofiin Cufi",
    sessionTimeout: "Daangaa yeroo turtii",
    minutesUnit: "daq",
    bruteForceTitle: "Ittisa Humnaan Seenuu fi Poolisii Cufiinsaa",
    defenseBadge: "ITTISA",
    bruteForceDesc: "Daangaa yaalii seensaa kufanii, yeroo cufiinsa yeroo fi cufiinsa dhaabbataa qindeessi.",
    failedAttemptsLimit: "Daangaa Yaalii Kufanii",
    failedAttemptsHint: "Cufiinsa yeroo kaasisa",
    triesUnit: "yaalii",
    cooldownCountdown: "Lakkawwii Yeroo Cufiinsaa",
    cooldownHint: "Turtii socho'uu dhabuu yeroo",
    secUnit: "sek",
    maxLockoutCycles: "Marsaa Cufiinsaa Olaanaa",
    maxLockoutHint: "Marsaa 3ffaa irratti itti-fayyadamaa dhaabbataan cufa",
    roundsUnit: "marsaawwan",

    escrowSectionTitle: "Ulaagaalee Eeggannoo fi Koomishinii",
    sellerCommissionRate: "Hamma Koomishinii Gurgurtaa Gurguraa (%)",
    commissionBadge: "KOOMISHINII",
    commissionDesc: "Dhibbeentaa galii gurgurtaa milkaa'e irraa kaffalamu.",
    escrowAutoRelease: "Yeroo Eeggannoo Ofiin Gadi-lakkisuu",
    holdDurationBadge: "TURTII EEGGANNOO",
    escrowHoldDesc: "Erga oomishni ga'ee booda maallaqni gara daldalaatti darbuun dura yeroo turu.",
    hrsUnit: "SA'AATII",

    cardSectionTitle: "Gatii Kaardii Dijitaalaa MercatoX fi To'annoo Baasuu",
    adminPricingBadge: "GATII BULCHAA",
    cardPurchasePriceTitle: "Gatii Bittaa Kaardii Bulchaan Murtaa'e",
    cardPurchasePriceDesc: "Gatii dhaabbataa maamiltoonni kaardii dijitaalaa isaanii baasuuf Chapa dhaan kaffalan murteessi.",
    digitalCardPriceLabel: "Gatii Baasuu Kaardii Dijitaalaa (ETB)",
    basePriceBadge: "GATII BU'UURAA",
    digitalCardPriceDesc: "Kaffaltii dhaabbataa yeroo kaardiin dijitaalaa ajajamu maamila irraa fudhatamu.",
    defaultBalanceLabel: "Gatii Jalqabaa Yaadame (ETB)",
    loadBalanceBadge: "HAFAATA JALQABAA",
    defaultBalanceDesc: "Hamma maallaqa kaardichaa irratti dursamee qindaa'e.",
    customerCheckoutTotal: "Waliigala Kaffaltii Chapa Maamilaa:",
    feeLabel: "Kaffaltii",
    balanceLabel: "Hafaata",

    gatewaysSectionTitle: "Kallattiiwwan Kaffaltii Biyyaalessaa",
    telebirrTitle: "Ethio Telecom Telebirr SuperApp",
    telebirrSub: "Koodii Gabaabaa: {shortcode} · IPN Hojiirra Jira",
    cbeBirrTitle: "Baankii Daldala Itoophiyaa (CBE Birr API)",
    cbeBirrSub: "IPN Kallattii Baankii",
    chapaTitle: "Kallattii Kaardii Chapa (Visa / Master)",
    chapaSub: "Furtuun Kallattii Qindaa'eera",

    kycSectionTitle: "Mirkaneessa Daldalaa fi Seerota Hordoffii",
    tinVerificationTitle: "Mirkaneessa Lakkoofsa Gibiraa (TIN) Dirqamaa",
    tinVerificationDesc: "Galmee Ministeera Galiiwwanii wajjin mirkanaa'a",
    tradeLicenseTitle: "Heyyama Daldalaa Duraa",
    tradeLicenseDesc: "Hanga mirkanaa'utti daldaltoonni oomisha maxxansuu hin danda'an",
    riderOcrTitle: "OCR Heyyama Konkolaachisaa Ofiin",
    riderOcrDesc: "Heyyama mootarsaykilii fi ergamtootaa mirkaneessuu",
    clusterMaintenanceTitle: "Haala Suphaa Sirnaa",
    clusterMaintenanceDesc: "Eeggannoo maallaqaa eeguun bittaa maamilaa yeroof dhaaba",
  },

  ti: {
    pageTitle: "ቅጥዕታት ፕላትፎርምን ድሕንነትን",
    pageSubtitle: "ስም ዕዳጋ ኣመዓራሪ፣ ሎጎ ፅዓን፣ መራኸቢታት ኣዋድድ፣ ኣብ ኩሉ ቦታታት ድማ ብቕፅበት ኣመሳስል።",
    syncing: "የመሳስል ኣሎ...",
    unsavedChanges: "ዘይተዓቀቡ ለውጥታት",
    resetDefaults: "ናብ ናይ ቀደም ምለስ",
    resetDefaultsConfirm: "ኩሎም ቅጥዕታት ፕላትፎርም ናብ ናይ ቀደም ክምለሱ ትደልዩ ዶ?",
    saveToBackend: "ናብ ሰርቨር ዓቅብ",
    saving: "የዕቅብ ኣሎ...",
    save: "ዓቅብ",
    saveConfiguration: "ቅጥዒ ዓቅብ",
    universalRealtimeEnabled: "ኩለመዳያዊ ናይ ቅጽበት ምምሳሳል ነቒሑ ኣሎ",

    maintenanceActiveTitle: "ናይ ስርዓት ፅገና ኩነታት ኣብዚ እዋን በርሁ ኣሎ",
    maintenanceActiveDesc: "ዕድጊ ዓደግቲ ንግዚኡ ደው ኢሉ ኣሎ። ናይ ኢስክሮው ሕሳብን ናይ ኣድሚን ስራሕትን ተሓልዮም ኣለዉ።",
    disable: "ኣጥፍእ",
    enabled: "በርሁ ኣሎ",
    enable: "ኣብርህ",

    settingsNav: "መንገዲ ቅጥዕታት",
    sectionsCount: "7 ክፍልታት",
    universalSync: "ኩለመዳያዊ ምምሳሳል",
    live: "ብቐጥታ",
    activeBadge: "ንጡፍ",

    tabAllTitle: "ሕውስዋስ ርእይቶ",
    tabAllSub: "ሓፈሻዊ ርእይቶ ኩሎም ቅጥዕታት",
    tabAllBadge: "ኩሉ",
    tabBrandTitle: "ብራንድን መለልይን",
    tabBrandSub: "ስም፣ ሎጎን ሜታን",
    tabBrandBadge: "ቀንዲ",
    tabContactTitle: "መወድእታን መራኸብን",
    tabContactSub: "ኢመይል፣ ስልክን ኣድራሻን",
    tabContactBadge: "ህዝባዊ",
    tabSecurityTitle: "መለለዪታት ኣድሚን",
    tabSecuritySub: "መእተዊ ኢመይልን መሕለፊ ቃልን",
    tabSecurityBadge: "መረጋገፂ",
    tabEscrowTitle: "ኢስክሮውን ፋይናንስን",
    tabEscrowSub: "ኮሚሽንን ግዜ ምልቃቕን",
    tabEscrowBadge: "ሕግታት",
    tabGatewaysTitle: "መንገድታት ክፍሊት",
    tabGatewaysSub: "ቴሌብር፣ ንግዲ ባንክን ቻፓን",
    tabGatewaysBadge: "ክፍሊታት",
    tabCardTitle: "ካርድ መርካቶኤክስ",
    tabCardSub: "ዋጋ ምውፃእ ካርድን ደረታትን",
    tabCardBadge: "ዋጋ",
    tabKycTitle: "መረጋገፂ ነጋዳይ (KYC)",
    tabKycSub: "ቁፅሪ ግብሪ (TIN)፣ ፍቓድን ልኡኻትን",
    tabKycBadge: "ምሕደራ",

    brandSectionTitle: "ብራንድን መለልይን",
    platformBrandName: "ናይ ፕላትፎርም ናይ ንግዲ ስም",
    platformNamePlaceholder: "ንኣብነት፡ MercatoX",
    brandNameHint: "⚡ እዚ ስም ምቕያር ብቕፅበት ኩሎም ኣርእስታት፣ መወድእታታት፣ ጎድናዊ መስመራትን ናይ ዓደግቲ ገፃትን የሐድስ!",
    taglineLabel: "መሪሕ ቃል / ንኡስ ኣርእስቲ",
    taglinePlaceholder: "ንኣብነት፡ ዝተዋደደ ናይ ንግድን ኢስክሮውን ማእከል",
    heroDescriptionLabel: "ናይ ዋና ገፅ መግለፂ",
    heroDescriptionPlaceholder: "ሓፈሻዊ መግለፂ ፕላትፎርም ንባነር፣ SEOን ምርኢት ዓደግትን...",
    logoUploadTitle: "ምስሊ ሎጎ ፕላትፎርም ምፅዓን",
    logoUploadDesc: "ኣብ ኩሎም ኣርእስታትን መወድእታታትን ዝረአ ወግዓዊ ሎጎኻ ፅዓን",
    customLogoActive: "ብሕታዊ ሎጎ ነቒሑ ኣሎ",
    darkHeaderPreview: "ፀሊም ኣርእስቲ",
    lightModePreview: "ብሩህ ገፅታ",
    uploadImageLogo: "ምስሊ ሎጎ ፅዓን",
    uploading: "ይፅዕን ኣሎ...",
    removeLogo: "ኣወግድ",
    orPasteDirectUrl: "ወይ የቀጥታ ምስሊ ኣድራሻ (URL) ኣእቱ (PNG/SVG/WebP)",
    fallbackMonograms: "ኣማራፂ ናይ ፊደል ሕብርታት ቅጥዒ፡",
    presetModernGradient: "ዘመናዊ ቅልመት",
    presetEscrowShield: "ናይ ኢስክሮው ዋልታ",
    presetBirrGreen: "ናይ ብር ቀጠልያ",
    presetOnyxMinimal: "ውሑድ ፀሊም",
    baseCurrency: "ቀንዲ ዓይነት ገንዘብ",
    regionalTimezone: "ዞባዊ ናይ ሰዓት ዞባ",

    footerSectionTitle: "መወድእታን ህዝባዊ መራኸቢ ሓበሬታን",
    customerSupportEmail: "ናይ ደገፍ ዓደግቲ ኢመይል (መወድእታ)",
    supportEmailSyncHint: "ምስ ናይ ዓደግቲ መርበብ ሓበሬታ መወድእታ ብቕፅበት ይሰማማዕ።",
    primaryContactPhone: "ቀንዲ መራኸቢ ስልኪ",
    emergencyHotline: "ናይ ህፁፅ ሓደጋ ስልኪ መስመር",
    headquartersAddress: "ናይ ዋና ቤት ፅሕፈት ትክክለኛ ኣድራሻ",
    headquartersPlaceholder: "ቦሌ መድኃኔዓለም ንግዲ ማእከል፣ ኣዲስ ኣበባ",
    footerCopyrightNotice: "ናይ መወድእታ ናይ ቅዳሕ መሰል መተሓሳሰቢ",
    telegramChannel: "ናይ ቴሌግራም ቻናል",
    linkedInPage: "ናይ ሊንክድኢን ገፅ",

    securitySectionTitle: "ናይ ኣድሚን መለለዪታትን ድሕንነትን",
    changeEmailTitle: "መእተዊ ኢመይል ኣድሚን ቀይር",
    activeStatus: "ንጡፍ",
    newAdminEmail: "ሓዱሽ ኢመይል ኣድሚን",
    confirmNewEmail: "ሓዱሽ ኢመይል ኣረጋግፅ",
    updateLoginEmail: "መእተዊ ኢመይል ኣሐድስ",
    updatingEmail: "ኢመይል የሐድስ ኣሎ...",
    changePasswordTitle: "መሕለፊ ቃል ኣድሚን ቀይር",
    currentPassword: "ናይ ሕዚ መሕለፊ ቃል",
    newPassword: "ሓዱሽ መሕለፊ ቃል (ውሑዱ 8 ፊደላት)",
    confirmNewPassword: "ሓዱሽ መሕለፊ ቃል ኣረጋግፅ",
    updatePassword: "መሕለፊ ቃል ኣሐድስ",
    updatingPassword: "መሕለፊ ቃል የሐድስ ኣሎ...",
    passwordWeak: "ደካማ",
    passwordFair: "ማእከላይ",
    passwordGood: "ፅቡቕ",
    passwordStrong: "ጠንካራን ውሑስን",
    passwordTooShort: "ኣዝዩ ሓፂር",
    enforce2FA: "ክልተ ደረጃ መረጋገፂ (2FA) ኣገድድ",
    disbursementProtection: "ናይ ክፍሊት ገንዘብ ድሕንነት ምክልኻል",
    autoLock: "ባዕሉ ዝዓፁ",
    sessionTimeout: "ናይ ስራሕ ግዜ ደረት",
    minutesUnit: "ደቒቕ",
    bruteForceTitle: "ምክልኻል መጥቃዕትን ናይ ምዕፃው ፖሊሲን",
    defenseBadge: "ምክልኻል",
    bruteForceDesc: "ተኸታታሊ ናይ ጌጋ መእተዊ ፈተነታት ደረት፣ ግዝያዊ ምዕፃው ቆፀራን ነባሪ ዕፅዋን ኣዋድድ።",
    failedAttemptsLimit: "ናይ ዝተጋገዩ ፈተነታት ደረት",
    failedAttemptsHint: "ግዝያዊ ዕፅዋ የለዓዕል",
    triesUnit: "ፈተነታት",
    cooldownCountdown: "ናይ ዕፅዋ ቆፀራ",
    cooldownHint: "ግዝያዊ ዘይንጡፍ ግዜ",
    secUnit: "ሰከንድ",
    maxLockoutCycles: "ዝለዓለ ናይ ዕፅዋ ዙራት",
    maxLockoutHint: "ኣብ መበል 3ይ ንተጠቃሚ ምሉእ ብምሉእ ይዓፅዎ",
    roundsUnit: "ዙራት",

    escrowSectionTitle: "ናይ ኢስክሮውን ኮሚሽንን መለክዒታት",
    sellerCommissionRate: "ናይ ሸያጢ መሸጣ ኮሚሽን መጠን (%)",
    commissionBadge: "ኮሚሽን",
    commissionDesc: "ፍርያት ብዓወት ምስ ተሸጠ ካብ ናይ ሸያጢ ኣታዊ ዝቕነስ ናይ ፕላትፎርም ኮሚሽን ሚኢታዊ።",
    escrowAutoRelease: "ናይ ኢስክሮው ባዕሉ ዝለቅቐሉ ግዜ",
    holdDurationBadge: "ናይ ምፅናሕ ግዜ",
    escrowHoldDesc: "ዕቃ ምስ በፅሐ ክፍሊት ናብ ነጋዳይ ቅድሚ ምልቃቑ ኣብ ኢስክሮው ዝፀንሐሉ ግዜ።",
    hrsUnit: "ሰዓታት",

    cardSectionTitle: "ዋጋ ዲጂታል ካርድ መርካቶኤክስን ምውፃእ ምቁፅፃርን",
    adminPricingBadge: "ዋጋ ኣድሚን",
    cardPurchasePriceTitle: "ብኣድሚን ዝተወሰነ ናይ ካርድ መግዚኢ ዋጋ",
    cardPurchasePriceDesc: "ዓደግቲ ናይ ዲጂታል መርካቶኤክስ ካርዶም ንምውፃእ ብቻፓ ኣቢሎም ክኸፍልዎ ዝግብኦም ወግዓዊ ቀዋሚ ዋጋ ወስን። ዓደግቲ በዚ ትክክለኛ ዋጋ ይገዝኡ።",
    digitalCardPriceLabel: "ናይ ዲጂታል ካርድ ምውፃእ ዋጋ (ETB)",
    basePriceBadge: "መበገሲ ዋጋ",
    digitalCardPriceDesc: "ዓደግቲ ወግዓዊ ዲጂታል ካርድ መርካቶኤክስ ክእዝዙ እንከለዉ ዝኽፈል ቀዋሚ ናይ ምውፃእ ክፍሊት።",
    defaultBalanceLabel: "ዝምከር ናይ መበገሲ ሕሳብ (ETB)",
    loadBalanceBadge: "መበገሲ ሕሳብ",
    defaultBalanceDesc: "ኣብ ናይ ካርድ መግዚኢ ገፅ ኣስቀዲሙ ዝተቐመጠ ናይ ገንዘብ መጠን።",
    customerCheckoutTotal: "ብቻፓ ናይ ዓደግቲ ሓፈሻዊ ክፍሊት፡",
    feeLabel: "ክፍሊት",
    balanceLabel: "ሕሳብ",

    gatewaysSectionTitle: "ሃገራዊ ናይ ክፍሊት መንገድታት",
    telebirrTitle: "ኢትዮ ቴሌኮም ቴሌብር ሱፐርኣፕ",
    telebirrSub: "ሓፂር ቁፅሪ: {shortcode} · IPN ርክብ ንጡፍ እዩ",
    cbeBirrTitle: "ንግዲ ባንኪ ኢትዮጵያ (CBE Birr API)",
    cbeBirrSub: "ቀጥተኛ ናይ ባንኪ ስርዓት IPN",
    chapaTitle: "ቻፓ ናይ ካርድ ክፍሊት (ቪዛ / ማስተርካርድ)",
    chapaSub: "ናይ ቀጥታ ናይ ፕሮዳክሽን መፍትሕ ተዋዲዱ ኣሎ",

    kycSectionTitle: "ናይ ነጋዳይ KYCን ናይ ተገዛእነት ሕግታትን",
    tinVerificationTitle: "ናይ ግዲ ናይ ግብሪ መለለዪ ቁፅሪ (TIN) መረጋገፂ",
    tinVerificationDesc: "ምስ ናይ ሚኒስቴር ኣታዊታት መዝገብ ይረጋገፅ",
    tradeLicenseTitle: "ናይ ንግዲ ፍቓድ ቅድመ ኩነት",
    tradeLicenseDesc: "ነጋዶ ክሳብ ዝረጋገፁ ፍርያት ክልጥፉ ኣይክእሉን",
    riderOcrTitle: "ኣውቶማቲክ ናይ መራሒ ማኪና/ሞተር ፍቓድ OCR",
    riderOcrDesc: "ናይ ሞተር ሳይክልን መልእክተኛታትን መንጃ ፍቓድ መረጋገፂ",
    clusterMaintenanceTitle: "ናይ ስርዓት ፅገና ኩነታት",
    clusterMaintenanceDesc: "ናይ ኢስክሮው ድሕንነት እናሓለወ ናይ ህዝቢ ዕድጊ ደው የብል",
  },
};

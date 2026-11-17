export interface SupplierSettingsTranslationDictionary {
  title: string;
  subtitle: string;
  breadcrumbDashboard: string;
  breadcrumbSettings: string;
  badgeEscrowProtected: string;
  unsavedEdits: string;
  btnSaving: string;
  btnSaveChanges: string;
  searchPlaceholder: string;
  navTitle: string;
  statutoryCompliance: string;

  // 7 Tabs
  tabAccountTitle: string;
  tabAccountShort: string;
  tabAccountDesc: string;
  tabStorefrontTitle: string;
  tabStorefrontShort: string;
  tabStorefrontDesc: string;
  tabBusinessTitle: string;
  tabBusinessShort: string;
  tabBusinessDesc: string;
  tabPayoutsTitle: string;
  tabPayoutsShort: string;
  tabPayoutsDesc: string;
  tabOrdersTitle: string;
  tabOrdersShort: string;
  tabOrdersDesc: string;
  tabAlertsTitle: string;
  tabAlertsShort: string;
  tabAlertsDesc: string;
  tabSecurityTitle: string;
  tabSecurityShort: string;
  tabSecurityDesc: string;
}

export const SUPPLIER_SETTINGS_TRANSLATIONS: Record<
  "en" | "am" | "om" | "ti",
  SupplierSettingsTranslationDictionary
> = {
  en: {
    title: "Supplier Settings & Controls",
    subtitle: "Manage executive credentials, legal registration, automated quotes, settlement accounts, and multi-channel alerts",
    breadcrumbDashboard: "Dashboard",
    breadcrumbSettings: "Settings",
    badgeEscrowProtected: "Escrow Protected Account",
    unsavedEdits: "Unsaved edits",
    btnSaving: "Saving...",
    btnSaveChanges: "Save Changes",
    searchPlaceholder: "Quick search settings (e.g. 2FA, CBE Bank, TIN, Lead Time, SMS, Vacation)...",
    navTitle: "Settings Navigation",
    statutoryCompliance: "Statutory Compliance",
    tabAccountTitle: "Account & Executive Profile",
    tabAccountShort: "Profile",
    tabAccountDesc: "Contact credentials, direct contacts, and working hours",
    tabStorefrontTitle: "Storefront & Catalog Policy",
    tabStorefrontShort: "Storefront",
    tabStorefrontDesc: "Wholesale brand display, MOQ thresholds, and vacation mode",
    tabBusinessTitle: "Legal & Statutory Registry",
    tabBusinessShort: "Legal & TIN",
    tabBusinessDesc: "Ministry of Trade registration, TIN record, and ECX linkage",
    tabPayoutsTitle: "Commercial Bank & Payouts",
    tabPayoutsShort: "Payouts",
    tabPayoutsDesc: "Commercial Bank of Ethiopia (CBE), Telebirr, and settlement rules",
    tabOrdersTitle: "Order & RFQ Automation",
    tabOrdersShort: "RFQ Rules",
    tabOrdersDesc: "Instant quotes, negotiation tolerances, and safety buffers",
    tabAlertsTitle: "Multi-Channel Alerts",
    tabAlertsShort: "Alerts",
    tabAlertsDesc: "Ethio Telecom SMS gateway, corporate email, and push notices",
    tabSecurityTitle: "Security, 2FA & API Keys",
    tabSecurityShort: "Security",
    tabSecurityDesc: "Active sessions, password credentials, and ERP integrations",
  },
  am: {
    title: "የአቅራቢ ቅንብሮች እና መቆጣጠሪያዎች",
    subtitle: "የስራ አመራር ምስክር ወረቀቶችን፣ የህግ ምዝገባን፣ አውቶማቲክ ዋጋዎችን፣ የክፍያ ሂሳቦችን እና ማስጠንቀቂያዎችን ያስተዳድሩ",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbSettings: "ቅንብሮች",
    badgeEscrowProtected: "በኢስክሮው የተጠበቀ ሂሳብ",
    unsavedEdits: "ያልተቀመጡ ለውጦች",
    btnSaving: "በማስቀመጥ ላይ...",
    btnSaveChanges: "ለውጦችን አስቀምጥ",
    searchPlaceholder: "ቅንብሮችን በፍጥነት ፈልግ (ምሳሌ፡ 2FA፣ ንግድ ባንክ፣ TIN፣ SMS)...",
    navTitle: "የቅንብሮች ማውጫ",
    statutoryCompliance: "ህጋዊ ተገዢነት",
    tabAccountTitle: "የመለያ እና የአመራር መገለጫ",
    tabAccountShort: "መገለጫ",
    tabAccountDesc: "የመገኛ አድራሻ፣ የቀጥታ ግንኙነቶች እና የስራ ሰዓት",
    tabStorefrontTitle: "የሱቅ ፖሊሲ እና ካታሎግ",
    tabStorefrontShort: "የሱቅ ፖሊሲ",
    tabStorefrontDesc: "የጅምላ ብራንድ ማሳያ፣ አነስተኛ የትዕዛዝ መጠን (MOQ) እና የእረፍት ሁኔታ",
    tabBusinessTitle: "ህጋዊ እና የታክስ ምዝገባ",
    tabBusinessShort: "ህጋዊ እና TIN",
    tabBusinessDesc: "የንግድ ሚኒስቴር ምዝገባ፣ የግብር ከፋይ ቁጥር (TIN) እና የኢሲኤክስ ትስስር",
    tabPayoutsTitle: "የንግድ ባንክ እና ክፍያዎች",
    tabPayoutsShort: "ክፍያዎች",
    tabPayoutsDesc: "የኢትዮጵያ ንግድ ባንክ (CBE)፣ ቴሌብር እና የማጽጃ ደንቦች",
    tabOrdersTitle: "የትዕዛዝ እና የRFQ አውቶሜሽን",
    tabOrdersShort: "የRFQ ደንቦች",
    tabOrdersDesc: "ፈጣን ዋጋ ማቅረቢያ፣ የድርድር ገደቦች እና የደህንነት ማቋረጫዎች",
    tabAlertsTitle: "የባለብዙ ቻናል ማሳወቂያዎች",
    tabAlertsShort: "ማሳወቂያዎች",
    tabAlertsDesc: "የኢትዮ ቴሌኮም SMS፣ የድርጅት ኢሜይል እና የግፊት ማሳወቂያዎች",
    tabSecurityTitle: "ደህንነት፣ 2FA እና ኤፒአይ ቁልፎች",
    tabSecurityShort: "ደህንነት",
    tabSecurityDesc: "ንቁ ክፍለ-ጊዜዎች፣ የምስጢር ቃላት እና የኢአርፒ ውህደቶች",
  },
  om: {
    title: "Qindaa'ina Dhiyeessaa fi To'annoo",
    subtitle: "Ragaalee hogggansaa, galmee seeraa, gatii ofumaan dhiyaatu, herreega kaffaltii fi akeekkachiisota bulchaa",
    breadcrumbDashboard: "Daashboordii",
    breadcrumbSettings: "Qindaa'ina",
    badgeEscrowProtected: "Herreega Eeskirawuudhaan Eegame",
    unsavedEdits: "Jijjiirama Hin Qabamne",
    btnSaving: "Qabaa jira...",
    btnSaveChanges: "Jijjiirama Olkaa'i",
    searchPlaceholder: "Qindaa'inawwan saffisaan barbaadi (fkn: 2FA, CBE, TIN, SMS)...",
    navTitle: "Kallattii Qindaa'inaa",
    statutoryCompliance: "Hojii Seera Qabeessa",
    tabAccountTitle: "Herreega fi Piroofaayilii Hogggansaa",
    tabAccountShort: "Piroofaayilii",
    tabAccountDesc: "Ragaalee qunnamtii fi sa'aatii hojii",
    tabStorefrontTitle: "Imaammata Suuqii fi Kaataaloogii",
    tabStorefrontShort: "Suuqii",
    tabStorefrontDesc: "Agarsiisa daldalaa, hamma ajaja xiqqaa (MOQ) fi haala boqonnaa",
    tabBusinessTitle: "Galmee Seeraa fi Gibiraa",
    tabBusinessShort: "Seeraa fi TIN",
    tabBusinessDesc: "Galmee Ministeera Daldalaa, TIN fi walitti hidhamiinsa ECX",
    tabPayoutsTitle: "Baankii Daldalaa fi Kaffaltii",
    tabPayoutsShort: "Kaffaltii",
    tabPayoutsDesc: "Baankii Daldala Itoophiyaa (CBE), Telebirr fi seerota kaffaltii",
    tabOrdersTitle: "Ofumaan Raawwii Ajajaa fi RFQ",
    tabOrdersShort: "Seerota RFQ",
    tabOrdersDesc: "Gatii hatattamaa fi marii daldalaa",
    tabAlertsTitle: "Akeekkachiisota Sararoota Hedduu",
    tabAlertsShort: "Akeekkachiisota",
    tabAlertsDesc: "Ethio Telecom SMS, Imeeyilii dhaabbataa fi beeksisa",
    tabSecurityTitle: "Nageenya, 2FA fi Furtuu API",
    tabSecurityShort: "Nageenya",
    tabSecurityDesc: "Yeroo hojii nagaa, jecha icciitii fi walitti hidhamiinsa ERP",
  },
  ti: {
    title: "ምምሕዳር ቅጥዕታትን መቆጻጸሪታትን ኣቕራቢ",
    subtitle: "ናይ ምምሕዳር መንነት፣ ሕጋዊ ምዝገባ፣ ኣውቶማቲክ ዋጋታት፣ ናይ ክፍሊት ሕሳባትን ናይ መጠንቀቕታ መልእኽትታትን የመሓድሩ",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbSettings: "ቅጥዕታት",
    badgeEscrowProtected: "ብኢስክሮው ዝተሓለወ ሕሳብ",
    unsavedEdits: "ዘይተዓቀቡ ለውጥታት",
    btnSaving: "የዕቁብ ኣሎ...",
    btnSaveChanges: "ለውጥታት ዓቅብ",
    searchPlaceholder: "ቅጥዕታት ብቕልጡፍ ድለዩ (ንኣብነት፡ 2FA፣ ንግዲ ባንኪ፣ TIN፣ SMS)...",
    navTitle: "መምርሒ ቅጥዕታት",
    statutoryCompliance: "ሕጋዊ ተገዛእነት",
    tabAccountTitle: "መለያን መግለጺ ኣመራርሓን",
    tabAccountShort: "መግለጺ",
    tabAccountDesc: "መረዳእታ ርክብን ሰዓታት ስራሕን",
    tabStorefrontTitle: "ፖሊሲ ድኳንን ካታሎግን",
    tabStorefrontShort: "ድኳን",
    tabStorefrontDesc: "ናይ ጅምላ ብራንድ፣ ዝተሓተ መጠን ትእዛዝ (MOQ) ከምኡውን ናይ ዕረፍቲ ኩነታት",
    tabBusinessTitle: "ሕጋውን ናይ ግብሪ ምዝገባን",
    tabBusinessShort: "ሕጋውን TIN",
    tabBusinessDesc: "ምዝገባ ሚኒስትሪ ንግዲ፣ መለለዪ ግብሪ (TIN) ከምኡውን ምትእስሳር ECX",
    tabPayoutsTitle: "ናይ ንግዲ ባንክን ክፍሊታትን",
    tabPayoutsShort: "ክፍሊታት",
    tabPayoutsDesc: "ናይ ኢትዮጵያ ንግዲ ባንኪ (CBE)፣ ቴሌብርን ናይ ምጽዳቕ ደንብታትን",
    tabOrdersTitle: "ናይ ትእዛዝን RFQን ኣውቶሜሽን",
    tabOrdersShort: "ደንብታት RFQ",
    tabOrdersDesc: "ቕልጡፍ ዋጋ መቕረቢ፣ ናይ ድርድር ደረትን ውሑስ ደንብታትን",
    tabAlertsTitle: "ብዙሕ መተሓላለፊ ዘለዎም መጠንቀቕታታት",
    tabAlertsShort: "መጠንቀቕታታት",
    tabAlertsDesc: "ኢትዮ ቴሌኮም SMS፣ ናይ ትካል ኢመይልን ናይ ስልኪ መልእኽትታትን",
    tabSecurityTitle: "ድሕንነት፣ 2FA ከምኡውን ናይ ኤፒኣይ ቁልፍታት",
    tabSecurityShort: "ድሕንነት",
    tabSecurityDesc: "ንጡፋት ናይ ስራሕ እዋናት፣ መሕለፊ ቃላትን ናይ ERP ምትእስሳራትን",
  },
};

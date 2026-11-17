export interface SubscriptionTranslationDictionary {
  title: string;
  subtitle: string;
  badgeTier: string;
  activeLicense: string;
  membershipLicense: string;
  licenseStatus: string;
  verifiedActive: string;
  pendingVerification: string;
  subscribedOn: string;
  billingCycle: string;
  nextRenewal: string;
  wholesaleQuota: string;
  unlimitedCatalog: string;
  remaining: string;
  used: string;
  warehouseDepots: string;
  escrowDiscount: string;
  verifiedB2B: string;
  selectTier: string;
  tierSubtitle: string;
  monthlyCycle: string;
  annualLicense: string;
  save20: string;
  currentPlan: string;
  renewSubscribe: string;
  upgradeTier: string;
  month: string;
  year: string;
}

export const SUBSCRIPTION_TRANSLATIONS: Record<
  "en" | "am" | "om" | "ti",
  SubscriptionTranslationDictionary
> = {
  en: {
    title: "Wholesale Subscriptions & Enterprise Tiers",
    subtitle: "Manage your enterprise wholesale depot licenses, RFQ quotation priority, and escrow settlement commission discounts. Re-subscribe or renew at any time.",
    badgeTier: "B2B Enterprise Tier",
    activeLicense: "Active Supplier Wholesale License",
    membershipLicense: "Membership License",
    licenseStatus: "License Status:",
    verifiedActive: "Verified & Active",
    pendingVerification: "Pending Verification",
    subscribedOn: "Subscribed On:",
    billingCycle: "Billing Cycle:",
    nextRenewal: "Next Renewal:",
    wholesaleQuota: "Wholesale Item Quota",
    unlimitedCatalog: "Unlimited Catalog",
    remaining: "Remaining",
    used: "Used",
    warehouseDepots: "Warehouse Depots",
    escrowDiscount: "Escrow Fee Discount",
    verifiedB2B: "Verified B2B Status",
    selectTier: "Select Your Enterprise Tier",
    tierSubtitle: "Scale your warehouse branches, national quotations, and bulk trade privileges.",
    monthlyCycle: "Monthly Cycle",
    annualLicense: "Annual License",
    save20: "Save 20%",
    currentPlan: "Current Active Plan",
    renewSubscribe: "Renew / Re-subscribe",
    upgradeTier: "Upgrade Enterprise Tier",
    month: "month",
    year: "year",
  },
  am: {
    title: "የጅምላ አቅርቦት ምዝገባዎች እና ደረጃዎች",
    subtitle: "የጅምላ መጋዘን ፍቃዶችዎን፣ የዋጋ ማቅረቢያ ቅድሚያዎችን እና የኢስክሮው ክፍያ ቅናሾችን ያስተዳድሩ። በማንኛውም ጊዜ ማደስ ወይም መቀየር ይችላሉ።",
    badgeTier: "የቢ2ቢ የድርጅት ደረጃ",
    activeLicense: "ንቁ የጅምላ አቅራቢ ፍቃድ",
    membershipLicense: "የአባልነት ፍቃድ",
    licenseStatus: "የፍቃድ ሁኔታ:",
    verifiedActive: "የተረጋገጠ እና ንቁ",
    pendingVerification: "በማረጋገጥ ላይ ያለ",
    subscribedOn: "የተመዘገበበት ቀን:",
    billingCycle: "የክፍያ ጊዜ:",
    nextRenewal: "የሚቀጥለው እድሳት:",
    wholesaleQuota: "የጅምላ እቃዎች ኮታ",
    unlimitedCatalog: "ያልተገደበ ካታሎግ",
    remaining: "የቀረ",
    used: "ጥቅም ላይ የዋለ",
    warehouseDepots: "የመጋዘን ማዕከላት",
    escrowDiscount: "የኢስክሮው ኮሚሽን ቅናሽ",
    verifiedB2B: "የተረጋገጠ ቢ2ቢ ደረጃ",
    selectTier: "የድርጅት ደረጃዎን ይምረጡ",
    tierSubtitle: "የመጋዘን ቅርንጫፎችዎን፣ የሀገር አቀፍ ጨረታዎችን እና የጅምላ ንግድ መብቶችን ያስፋፉ።",
    monthlyCycle: "ወርሃዊ ክፍያ",
    annualLicense: "አመታዊ ፍቃድ",
    save20: "20% ቅናሽ",
    currentPlan: "የአሁኑ ንቁ እቅድ",
    renewSubscribe: "አድስ / እንደገና ተመዝገብ",
    upgradeTier: "ደረጃውን አሳድግ",
    month: "ወር",
    year: "አመት",
  },
  om: {
    title: "Miseensummaa fi Sadarkaa Daldala Jumlaa",
    subtitle: "Hayyama kuusaa daldala jumlaa, dursa dhiheessii gatii fi hir'ina komishinii eegumsa maallaqaa to'adhaa.",
    badgeTier: "Sadarkaa Dhaabbata B2B",
    activeLicense: "Hayyama Dhiheessaa Hojii Irra Jiru",
    membershipLicense: "Hayyama Miseensummaa",
    licenseStatus: "Haala Hayyamaa:",
    verifiedActive: "Kan Mirkanaa'ee fi Hojii Irra Jiru",
    pendingVerification: "Mirkaneessaa Irra Kan Jiru",
    subscribedOn: "Guyyaa Galmaa'e:",
    billingCycle: "Yeroo Kaffaltii:",
    nextRenewal: "Haareffama Itti Aanu:",
    wholesaleQuota: "Kootaa Meeshaalee Jumlaa",
    unlimitedCatalog: "Kaataaloogii Daangaa Hin Qabne",
    remaining: "Kan Hafe",
    used: "Kan Hojii Irra Oole",
    warehouseDepots: "Wiirtulee Kuusaa",
    escrowDiscount: "Hir'ina Komishinii Eegumsa Maallaqaa",
    verifiedB2B: "Sadarkaa B2B Mirkanaa'e",
    selectTier: "Sadarkaa Dhaabbata Keessanii Filadhaa",
    tierSubtitle: "Dameewwan kuusaa, dhiheessii gatii fi mirgoota daldalaa bal'ifadhaa.",
    monthlyCycle: "Kaffaltii Ji'aa",
    annualLicense: "Hayyama Waggaa",
    save20: "20% Qusadhaa",
    currentPlan: "Karoora Ammaa Hojii Irra Jiru",
    renewSubscribe: "Haaressee / Irra Deebi'ii Galmaa'i",
    upgradeTier: "Sadarkaa Guddisi",
    month: "ji'a",
    year: "waggaa",
  },
  ti: {
    title: "ምዝገባታትን ደረጃታትን ናይ ጅምላ ቀረብቲ",
    subtitle: "ናይ ጅምላ መኽዘናት ፍቓድኩም፣ ቀዳምነት ዋጋ መቕረቢን ናይ ኢስክሮው ኮሚሽን ቅናሳትን ኣመሓድሩ።",
    badgeTier: "ናይ ቢ2ቢ ትካል ደረጃ",
    activeLicense: "ንጡፍ ናይ ጅምላ ቀራቢ ፍቓድ",
    membershipLicense: "ናይ ኣባልነት ፍቓድ",
    licenseStatus: "ኩነታት ፍቓድ:",
    verifiedActive: "ዝተረጋገጸን ንጡፍን",
    pendingVerification: "ምጽራይ ዝጽበ",
    subscribedOn: "ዝተመዝገበሉ ዕለት:",
    billingCycle: "ናይ ክፍሊት እዋን:",
    nextRenewal: "ዝቕጽል ምሕዳስ:",
    wholesaleQuota: "ናይ ጅምላ ኣቑሑት ኮታ",
    unlimitedCatalog: "ወሰን ዘይብሉ ካታሎግ",
    remaining: "ዝተረፈ",
    used: "ጥቕሚ ዝወዓለ",
    warehouseDepots: "ናይ መኽዘን ማእከላት",
    escrowDiscount: "ናይ ኢስክሮው ኮሚሽን ቅናስ",
    verifiedB2B: "ዝተረጋገጸ ቢ2ቢ ደረጃ",
    selectTier: "ናይ ትካልኩም ደረጃ ምረጹ",
    tierSubtitle: "ናይ መኽዘን ጨንፈራትኩም፣ ሃገራዊ ናይ ዋጋ ውድድራትን ናይ ጅምላ ንግዲ መሰላትን ኣስፍሑ።",
    monthlyCycle: "ወርሓዊ ክፍሊት",
    annualLicense: "ዓመታዊ ፍቓድ",
    save20: "20% ቍጠቡ",
    currentPlan: "ናይ ሕጂ ንጡፍ መደብ",
    renewSubscribe: "ሓድስ / ደጊምካ ተመዝገብ",
    upgradeTier: "ደረጃ ኣዕቢ",
    month: "ወርሒ",
    year: "ዓመት",
  },
};

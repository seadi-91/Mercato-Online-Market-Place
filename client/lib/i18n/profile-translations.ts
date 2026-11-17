export interface ProfileTranslationDictionary {
  tabDossier: string;
  tabCatalog: string;
  tabCompliance: string;
  tabLogistics: string;
  tabCommercial: string;
  btnEditProfile: string;
  btnShareStorefront: string;
  btnCopied: string;
  verifiedMerchant: string;
  settlementRail: string;
  activeHubs: string;
  corporateNarrative: string;
  executiveLeadership: string;
}

export const PROFILE_TRANSLATIONS: Record<
  "en" | "am" | "om" | "ti",
  ProfileTranslationDictionary
> = {
  en: {
    tabDossier: "Company Dossier",
    tabCatalog: "Commodities & Inventory",
    tabCompliance: "Quality Seals & Tax",
    tabLogistics: "Depots & Corridors",
    tabCommercial: "Wholesale Terms",
    btnEditProfile: "Edit Profile",
    btnShareStorefront: "Share Storefront",
    btnCopied: "Copied Link!",
    verifiedMerchant: "Verified Merchant",
    settlementRail: "Settlement Rail",
    activeHubs: "Active Hubs",
    corporateNarrative: "Corporate Overview",
    executiveLeadership: "Executive Leadership",
  },
  am: {
    tabDossier: "የድርጅት መዝገብ",
    tabCatalog: "ምርቶች እና ክምችት",
    tabCompliance: "የጥራት ማህተሞች እና ታክስ",
    tabLogistics: "መጋዘኖች እና ኮሪደሮች",
    tabCommercial: "የጅምላ ውሎች",
    btnEditProfile: "መገለጫ አርትዕ",
    btnShareStorefront: "ሱቅ አጋራ",
    btnCopied: "ሊንክ ተቀድቷል!",
    verifiedMerchant: "የተረጋገጠ ነጋዴ",
    settlementRail: "የክፍያ መስመር",
    activeHubs: "ንቁ መጋዘኖች",
    corporateNarrative: "የድርጅት አጠቃላይ እይታ",
    executiveLeadership: "የስራ አመራር",
  },
  om: {
    tabDossier: "Ragaa Dhaabbataa",
    tabCatalog: "Oomishaalee fi Kuusaa",
    tabCompliance: "Chaappaa Qulqullinaa fi Gibira",
    tabLogistics: "Wiirtuu fi Sarara Geejjibaa",
    tabCommercial: "Ulaagaalee Jumlaa",
    btnEditProfile: "Piroofaayilii Gulaali",
    btnShareStorefront: "Suuqii Qoodi",
    btnCopied: "Liankiin Garagalffameera!",
    verifiedMerchant: "Daldalaa Mirkanaa'e",
    settlementRail: "Sarara Kaffaltii",
    activeHubs: "Wiirtuuwwan Hojii Irra Jiran",
    corporateNarrative: "Ibsa Dhaabbataa",
    executiveLeadership: "Hoggansa Dhaabbataa",
  },
  ti: {
    tabDossier: "ናይ ትካል መዝገብ",
    tabCatalog: "ፍርያትን ክምችትን",
    tabCompliance: "ናይ ጽሬት ማሕተምን ግብርን",
    tabLogistics: "መኽዘናትን መስመራትን",
    tabCommercial: "ናይ ጅምላ ውዕላት",
    btnEditProfile: "መግለጺ ኣዐሪ",
    btnShareStorefront: "ድኳን ኣካፍል",
    btnCopied: "ሊንክ ተቐዲሑ!",
    verifiedMerchant: "ዝተረጋገጸ ነጋዳይ",
    settlementRail: "መስመር ክፍሊት",
    activeHubs: "ንጡፋት መኽዘናት",
    corporateNarrative: "ሓፈሻዊ ትሕዝቶ ትካል",
    executiveLeadership: "ኣመራርሓ ትካል",
  },
};

export interface BranchesTranslationDictionary {
  title: string;
  subtitle: string;
  breadcrumbDashboard: string;
  breadcrumbBranches: string;
  btnRefresh: string;
  btnCreateBranch: string;

  // 4 KPIs
  kpiOperatingBranches: string;
  kpiActiveNationwide: string;
  kpiTotalFloorArea: string;
  kpiAcrossSites: string;
  kpiCapacityUtilized: string;
  kpiOccupied: string;
  kpiBranchPersonnel: string;
  kpiManageStaff: string;

  // Search & Filter
  searchPlaceholder: string;
  regionAll: string;
  facilityAll: string;
  viewGrid: string;
  viewTable: string;

  // Empty State
  emptyTitle: string;
  emptyDesc: string;
  emptyAction: string;

  // Card details
  cardFacilityType: string;
  cardLocation: string;
  cardManager: string;
  cardPhone: string;
  cardFloorArea: string;
  cardUtilization: string;
  btnViewDetails: string;
  btnEditBranch: string;
}

export const BRANCHES_TRANSLATIONS: Record<
  "en" | "am" | "om" | "ti",
  BranchesTranslationDictionary
> = {
  en: {
    title: "Branch Management & Regional Hubs",
    subtitle: "Create, configure, and monitor your enterprise wholesale branches, regional distribution centers, and bonded dry port yards across Ethiopia",
    breadcrumbDashboard: "Dashboard",
    breadcrumbBranches: "Branch Management",
    btnRefresh: "Refresh",
    btnCreateBranch: "Create New Branch",
    kpiOperatingBranches: "Operating Branches",
    kpiActiveNationwide: "Active Nationwide",
    kpiTotalFloorArea: "Total Floor Area",
    kpiAcrossSites: "commercial sites",
    kpiCapacityUtilized: "Capacity Utilized",
    kpiOccupied: "occupied",
    kpiBranchPersonnel: "Branch Personnel",
    kpiManageStaff: "Manage Branch Staff",
    searchPlaceholder: "Search branches by name, code, city, manager, or address...",
    regionAll: "All Regions",
    facilityAll: "All Facility Types",
    viewGrid: "Grid",
    viewTable: "Table",
    emptyTitle: "No Branches Registered",
    emptyDesc: "No active branch or distribution depot found in the database. Click 'Create New Branch' to configure your first regional fulfillment hub.",
    emptyAction: "Create New Branch",
    cardFacilityType: "Facility Type",
    cardLocation: "Location",
    cardManager: "Branch Lead",
    cardPhone: "Contact",
    cardFloorArea: "Floor Area",
    cardUtilization: "Occupancy Rate",
    btnViewDetails: "Inspect Hub",
    btnEditBranch: "Edit Hub",
  },
  am: {
    title: "የቅርንጫፍ እና የክልል ማዕከላት አስተዳደር",
    subtitle: "የጅምላ ቅርንጫፎችን፣ የክልል ማከፋፈያ ማዕከላትን እና የደረቅ ወደብ ተርሚናሎችን ያስተዳድሩ እና ይከታተሉ",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbBranches: "የቅርንጫፍ አስተዳደር",
    btnRefresh: "አድስ",
    btnCreateBranch: "አዲስ ቅርንጫፍ ፍጠር",
    kpiOperatingBranches: "ተግባራዊ ቅርንጫፎች",
    kpiActiveNationwide: "በመላ አገሪቱ ንቁ",
    kpiTotalFloorArea: "አጠቃላይ የመጋዘን ስፋት",
    kpiAcrossSites: "የንግድ ጣቢያዎች",
    kpiCapacityUtilized: "ጥቅም ላይ የዋለ አቅም",
    kpiOccupied: "የተያዘ ስፋት",
    kpiBranchPersonnel: "የቅርንጫፍ ሰራተኞች",
    kpiManageStaff: "ሰራተኞችን አስተዳድር",
    searchPlaceholder: "ቅርንጫፎችን በስም፣ ኮድ፣ ከተማ፣ ስራ አስኪያጅ ወይም አድራሻ ይፈልጉ...",
    regionAll: "ሁሉም ክልሎች",
    facilityAll: "ሁሉም የተቋም አይነቶች",
    viewGrid: "ካርዶች",
    viewTable: "ሰንጠረዥ",
    emptyTitle: "ምንም የተመዘገበ ቅርንጫፍ የለም",
    emptyDesc: "በዳታቤዝ ውስጥ ምንም አይነት ንቁ ቅርንጫፍ አልተገኘም። የመጀመሪያውን የክልል ማዕከል ለማዋቀር 'አዲስ ቅርንጫፍ ፍጠር' የሚለውን ይጫኑ።",
    emptyAction: "አዲስ ቅርንጫፍ ፍጠር",
    cardFacilityType: "የተቋም አይነት",
    cardLocation: "አድራሻ",
    cardManager: "የቅርንጫፍ ኃላፊ",
    cardPhone: "ስልክ ቁጥር",
    cardFloorArea: "የመጋዘን ስፋት",
    cardUtilization: "የአጠቃቀም ምጣኔ",
    btnViewDetails: "ዝርዝር ተመልከት",
    btnEditBranch: "ቅርንጫፍ አርትዕ",
  },
  om: {
    title: "Bulchiinsa Dameewwanii fi Wiirtuulee Naannoo",
    subtitle: "Dameewwan daldala jumlaa, wiirtuulee raabsaa naannoo fi buufata doonii gogaa Itoophiyaa hordofaa",
    breadcrumbDashboard: "Daashboordii",
    breadcrumbBranches: "Bulchiinsa Dameewwanii",
    btnRefresh: "Haaromsi",
    btnCreateBranch: "Damee Haaraa Uumi",
    kpiOperatingBranches: "Dameewwan Hojjetan",
    kpiActiveNationwide: "Biyya Guututti Hojjetan",
    kpiTotalFloorArea: "Bal'ina Kuusaa Waliigalaa",
    kpiAcrossSites: "wiirtuulee daldalaa",
    kpiCapacityUtilized: "Dandeettii Hojiirra Oole",
    kpiOccupied: "kan qabame",
    kpiBranchPersonnel: "Hojjetoota Damee",
    kpiManageStaff: "Hojjetoota Bulchi",
    searchPlaceholder: "Dameewwan maqaa, koodii, magaalaa, hogganaa ykn teessootiin barbaadaa...",
    regionAll: "Naannolee Hundumaa",
    facilityAll: "Gosa Wiirtuu Hundumaa",
    viewGrid: "Kaardota",
    viewTable: "Gabatee",
    emptyTitle: "Dameen Galmaa'e Hin Jiru",
    emptyDesc: "Kuusaa ykn dameen galmaa'e hin argamne. Damee keessan isa jalqabaa uumuuf 'Damee Haaraa Uumi' isa jedhu tuqaa.",
    emptyAction: "Damee Haaraa Uumi",
    cardFacilityType: "Gosa Wiirtuu",
    cardLocation: "Teessoo",
    cardManager: "Hogganaa Damee",
    cardPhone: "Bilbila",
    cardFloorArea: "Bal'ina Kuusaa",
    cardUtilization: "Qooda Itti Fayyadamaa",
    btnViewDetails: "Bal'ina Ilaali",
    btnEditBranch: "Damee Gulaali",
  },
  ti: {
    title: "ምምሕዳር ጨንፈራትን ዞባዊ ማእከላትን",
    subtitle: "ናይ ጅምላ ጨንፈራት፣ ዞባዊ መከፋፈሊ ማእከላትን ናይ ደረቕ ወደብ ተርሚናላትን የመሓድሩን ይከታተሉን",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbBranches: "ምምሕዳር ጨንፈራት",
    btnRefresh: "ሓድሽ",
    btnCreateBranch: "ሓድሽ ጨንፈር ፍጠር",
    kpiOperatingBranches: "ንጡፋት ጨንፈራት",
    kpiActiveNationwide: "ኣብ መላእ ሃገር ንጡፍ",
    kpiTotalFloorArea: "ሓፈሻዊ ስፍሓት መኽዘን",
    kpiAcrossSites: "ንግዳዊ ማእከላት",
    kpiCapacityUtilized: "ኣብ ጥቕሚ ዝወዓለ ዓቕሚ",
    kpiOccupied: "ዝተታሕዘ",
    kpiBranchPersonnel: "ሰራሕተኛታት ጨንፈር",
    kpiManageStaff: "ሰራሕተኛታት ምምሕዳር",
    searchPlaceholder: "ጨንፈራት ብስም፣ ኮድ፣ ከተማ፣ ሓላፊ ወይ ኣድራሻ ድለዩ...",
    regionAll: "ኩሎም ዞባታት",
    facilityAll: "ኩሎም ዓይነታት ትካላት",
    viewGrid: "ካርድታት",
    viewTable: "ሰንጠረዥ",
    emptyTitle: "ዝተመዝገበ ጨንፈር የለን",
    emptyDesc: "ኣብ ዳታቤዝ ዝኾነ ንጡፍ ጨንፈር ኣይተረኽበን። ንመጀመሪያ ግዜ ጨንፈር ንምምዝጋብ 'ሓድሽ ጨንፈር ፍጠር' ዝብል ጠውቑ።",
    emptyAction: "ሓድሽ ጨንፈር ፍጠር",
    cardFacilityType: "ዓይነት ትካል",
    cardLocation: "ኣድራሻ",
    cardManager: "ሓላፊ ጨንፈር",
    cardPhone: "ቁጽሪ ስልኪ",
    cardFloorArea: "ስፍሓት መኽዘን",
    cardUtilization: "ደረጃ ኣጠቓቕማ",
    btnViewDetails: "ዝርዝር ርአ",
    btnEditBranch: "ጨንፈር ኣመዓራሪ",
  },
};

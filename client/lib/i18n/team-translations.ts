export interface TeamTranslationDictionary {
  title: string;
  subtitle: string;
  breadcrumbDashboard: string;
  breadcrumbStaff: string;
  badgePersonnel: string;
  badgeBranchDrivers: string;
  btnAddDriver: string;
  btnAddManager: string;
  tabAll: string;
  tabBranchManagers: string;
  tabFleetDrivers: string;
  tabWarehouseLeads: string;
  searchPlaceholder: string;
  emptyTitle: string;
  emptyDescription: string;
  kpiTotalPersonnel: string;
  kpiBranchDrivers: string;
  kpiAvailableDepot: string;
  kpiBranchManagers: string;
  kpiCommercialFleet: string;
  kpiDriversOnRoute: string;
  readyDispatch: string;
  hubsCovered: string;
  assignedVehicles: string;
  activeTransit: string;
  branchDepot: string;
  allHubs: string;
  resetFilter: string;
  btnAddStaff: string;
}

export const TEAM_TRANSLATIONS: Record<
  "en" | "am" | "om" | "ti",
  TeamTranslationDictionary
> = {
  en: {
    title: "Enterprise Staff & Fleet Management",
    subtitle: "Manage regional branch managers across Addis Ababa, Modjo, and Hawassa, and oversee commercial transport drivers.",
    breadcrumbDashboard: "Dashboard",
    breadcrumbStaff: "Staff Directory",
    badgePersonnel: "Active Personnel",
    badgeBranchDrivers: "Branch Drivers",
    btnAddDriver: "+ Add Fleet Driver",
    btnAddManager: "+ Add Branch Manager",
    tabAll: "All Personnel",
    tabBranchManagers: "Branch Managers",
    tabFleetDrivers: "Fleet Drivers",
    tabWarehouseLeads: "Warehouse Leads",
    searchPlaceholder: "Search staff by full name, phone number, branch, or vehicle plate...",
    emptyTitle: "No Team Members Found",
    emptyDescription: "No staff records match your current search or branch filters.",
    kpiTotalPersonnel: "Total Personnel",
    kpiBranchDrivers: "Branch Drivers",
    kpiAvailableDepot: "Available in Depot",
    kpiBranchManagers: "Branch Managers",
    kpiCommercialFleet: "Commercial Fleet",
    kpiDriversOnRoute: "Drivers On Route",
    readyDispatch: "Ready for Dispatch",
    hubsCovered: "Hubs Covered",
    assignedVehicles: "Assigned Vehicles",
    activeTransit: "Active Transit Runs",
    branchDepot: "Branch Depot:",
    allHubs: "All Regional Hubs",
    resetFilter: "Reset",
    btnAddStaff: "Add Staff Member",
  },
  am: {
    title: "የድርጅት ሰራተኞች እና የትራንስፖርት አስተዳደር",
    subtitle: "በአዲስ አበባ፣ በሞጆ እና በሐዋሳ ያሉ የቅርንጫፍ ስራ አስኪያጆችን ያስተዳድሩ እና የንግድ አሽከርካሪዎችን ይቆጣጠሩ።",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbStaff: "የሰራተኞች ማውጫ",
    badgePersonnel: "ንቁ ሰራተኞች",
    badgeBranchDrivers: "የቅርንጫፍ አሽከርካሪዎች",
    btnAddDriver: "+ አሽከርካሪ አክል",
    btnAddManager: "+ የቅርንጫፍ ስራ አስኪያጅ አክል",
    tabAll: "ሁሉም ሰራተኞች",
    tabBranchManagers: "የቅርንጫፍ ስራ አስኪያጆች",
    tabFleetDrivers: "አሽከርካሪዎች",
    tabWarehouseLeads: "የመጋዘን ሃላፊዎች",
    searchPlaceholder: "ሰራተኞችን በስም፣ በስልክ፣ በቅርንጫፍ ወይም በሰሌዳ ቁጥር ይፈልጉ...",
    emptyTitle: "ምንም ሰራተኞች አልተገኙም",
    emptyDescription: "ከፍለጋዎ ወይም ከቅርንጫፍ ማጣሪያዎ ጋር የሚዛመድ ሰራተኛ የለም።",
    kpiTotalPersonnel: "ጠቅላላ ሰራተኞች",
    kpiBranchDrivers: "የቅርንጫፍ አሽከርካሪዎች",
    kpiAvailableDepot: "በመጋዘን ዝግጁ",
    kpiBranchManagers: "የቅርንጫፍ ስራ አስኪያጆች",
    kpiCommercialFleet: "የትራንስፖርት መኪኖች",
    kpiDriversOnRoute: "መንገድ ላይ ያሉ አሽከርካሪዎች",
    readyDispatch: "ለመነሳት ዝግጁ",
    hubsCovered: "የተሸፈኑ ቅርንጫፎች",
    assignedVehicles: "የተመደቡ ተሽከርካሪዎች",
    activeTransit: "በጉዞ ላይ",
    branchDepot: "የቅርንጫፍ መጋዘን:",
    allHubs: "ሁሉም የክልል ማዕከላት",
    resetFilter: "ዳግም ጀምር",
    btnAddStaff: "ሰራተኛ አክል",
  },
  om: {
    title: "Hoggansa Hojjettootaa fi Konkolaachistootaa",
    subtitle: "Hoggantoota damee Finfinnee, Modjo fi Hawaasaa bulchaa, konkolaachistoota daldalaa to'adhaa.",
    breadcrumbDashboard: "Daashboordii",
    breadcrumbStaff: "Galmee Hojjettootaa",
    badgePersonnel: "Hojjettoota Hojii Irra Jiran",
    badgeBranchDrivers: "Konkolaachistoota Damee",
    btnAddDriver: "+ Konkolaachisaa Dabali",
    btnAddManager: "+ Hogganaa Damee Dabali",
    tabAll: "Hojjettoota Hundaa",
    tabBranchManagers: "Hoggantoota Damee",
    tabFleetDrivers: "Konkolaachistoota",
    tabWarehouseLeads: "Hoggantoota Kuusaa",
    searchPlaceholder: "Hojjetaa maqaadhaan, bilbilaan, dameedhaan ykn gabateedhaan barbaadaa...",
    emptyTitle: "Hojjettoonni Hin Argamne",
    emptyDescription: "Hojjetaan qorannoo keessan wajjin walsimu hin jiru.",
    kpiTotalPersonnel: "Hojjettoota Waliigalaa",
    kpiBranchDrivers: "Konkolaachistoota Damee",
    kpiAvailableDepot: "Kuusaa Keessatti Qophii",
    kpiBranchManagers: "Hoggantoota Damee",
    kpiCommercialFleet: "Konkolaattota Daldalaa",
    kpiDriversOnRoute: "Karaa Irra Jiran",
    readyDispatch: "Bobbaaf Qophii",
    hubsCovered: "Wiirtulee Qabaman",
    assignedVehicles: "Konkolaattota Ramadaman",
    activeTransit: "Adeemsa Irra",
    branchDepot: "Kuusaa Damee:",
    allHubs: "Wiirtulee Naannoo Hundaa",
    resetFilter: "Dhaabi",
    btnAddStaff: "Hojjetaa Dabali",
  },
  ti: {
    title: "ምምሕዳር ሰራሕተኛታትን መጓዓዝያን",
    subtitle: "ኣብ ኣዲስ ኣበባ፣ ሞጆን ሃዋሳን ዘለዉ ናይ ጨንፈር ሓለውቲ ኣመሓድሩ፣ ናይ ንግዲ መራሕቲ መካይን ተቘጻጸሩ።",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbStaff: "ማውጫ ሰራሕተኛታት",
    badgePersonnel: "ንጡፋት ሰራሕተኛታት",
    badgeBranchDrivers: "ናይ ጨንፈር መራሕቲ መካይን",
    btnAddDriver: "+ መራሒ መኪና ወስኽ",
    btnAddManager: "+ ናይ ጨንፈር ሓላፊ ወስኽ",
    tabAll: "ኩሎም ሰራሕተኛታት",
    tabBranchManagers: "ሓለውቲ ጨንፈር",
    tabFleetDrivers: "መራሕቲ መካይን",
    tabWarehouseLeads: "ሓለውቲ መኽዘን",
    searchPlaceholder: "ሰራሕተኛታት ብስም፣ ብስልኪ፣ ብጨንፈር ወይ ብሰሌዳ ድለዩ...",
    emptyTitle: "ዋላ ሓደ ሰራሕተኛ ኣይተረኽበን",
    emptyDescription: "ምስ መምረጺኹም ዝሰማማዕ ሰራሕተኛ ኣይተረኽበን።",
    kpiTotalPersonnel: "ጠቕላላ ሰራሕተኛታት",
    kpiBranchDrivers: "ናይ ጨንፈር መራሕቲ መካይን",
    kpiAvailableDepot: "ኣብ መኽዘን ድሉዋት",
    kpiBranchManagers: "ሓለውቲ ጨንፈር",
    kpiCommercialFleet: "ናይ ንግዲ መካይን",
    kpiDriversOnRoute: "ኣብ ጉዕዞ ዘለዉ",
    readyDispatch: "ንጉዕዞ ድሉዋት",
    hubsCovered: "ዝተሸፈኑ ጨንፈራት",
    assignedVehicles: "ዝተመደቡ ተሽከርከርቲ",
    activeTransit: "ኣብ ምንቅስቓስ",
    branchDepot: "ናይ ጨንፈር መኽዘን:",
    allHubs: "ኩሎም ናይ ዞባ ማእከላት",
    resetFilter: "ባዶ ግበር",
    btnAddStaff: "ሰራሕተኛ ወስኽ",
  },
};

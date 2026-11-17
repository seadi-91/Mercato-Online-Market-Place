import type { LanguageCode } from "./translations";

export interface SupplierTranslationDictionary {
  // Page Header (Admin Suppliers)
  pageTitle: string;
  pageSubtitle: string;
  badgeDb: string;
  refresh: string;
  loading: string;

  // Overview Stats
  statAllSuppliers: string;
  statAllSuppliersSub: string;
  statVerified: string;
  statVerifiedSub: string;
  statTotalStaff: string;
  statDriversCount: string;
  statManagersCount: string;
  statPendingKyc: string;
  statPendingKycSub: string;

  // Pending Banner
  pendingBannerTitleSingular: string;
  pendingBannerTitlePlural: string;
  actionRequired: string;
  pendingBannerDesc: string;
  filterPendingBtn: string;

  // Search & Filters
  searchPlaceholder: string;
  allKyc: string;
  kycApproved: string;
  kycPending: string;
  kycRejected: string;
  kycUnsubmitted: string;

  allStatus: string;
  statusActive: string;
  statusSuspended: string;

  allTypes: string;
  typeImporter: string;
  typeWholesale: string;
  typeManufacturer: string;

  // Table
  swipeHint: string;
  wholesalersCount: string;
  colSupplierCompany: string;
  colClassification: string;
  colHubLocation: string;
  colOwnerContact: string;
  colStaffFleet: string;
  colKycStatus: string;
  colAccountStatus: string;
  colActions: string;

  // Table Rows & Cells
  unnamedMerchant: string;
  verifiedMerchant: string;
  licenseLabel: string;
  tinLabel: string;
  hubBadge: string;
  notSpecified: string;
  addressNotSet: string;
  staffBadge: string;
  mgrBadge: string;
  drvBadge: string;
  verifiedBadge: string;
  rejectedBadge: string;
  pendingReviewBadge: string;
  unsubmittedBadge: string;
  activeBadge: string;
  suspendedBadge: string;

  // Actions Dropdown
  actionInspectStaff: string;
  actionReviewKyc: string;
  actionSuspendAccount: string;
  actionActivateAccount: string;
  actionViewFullDetail: string;
  actionDeleteSupplier: string;
  deleteSupplierModalTitle: string;
  deleteSupplierModalDesc: string;
  confirmDeleteSupplierBtn: string;
  deletingSupplierBtn: string;

  // Empty State
  noSuppliersDb: string;
  noSuppliersFilter: string;
  noSuppliersDbDesc: string;
  noSuppliersFilterDesc: string;
  refreshDbBtn: string;
  resetFiltersBtn: string;

  // Staff Modal
  staffModalTitle: string;
  staffModalSubtitle: string;
  staffTabAll: string;
  staffTabManagers: string;
  staffTabDrivers: string;
  colStaffMember: string;
  colStaffRole: string;
  colStaffBranch: string;
  colStaffContact: string;
  colStaffStatus: string;
  noStaffFound: string;
  roleManager: string;
  roleDriver: string;
  closeBtn: string;
  doneBtn: string;
  staffRosterNote: string;

  // KYC Review Modal
  kycModalTitle: string;
  kycModalSubtitle: string;
  docsSectionTitle: string;
  docTradeLicense: string;
  docTinCertificate: string;
  docCommercialRegistration: string;
  docOwnerId: string;
  noDocImage: string;
  clickToInspectImage: string;
  businessDetailsTitle: string;
  labelCompanyName: string;
  labelContactPerson: string;
  labelWarehouseHub: string;
  labelTinNumber: string;
  labelTradeLicense: string;
  rejectionReasonLabel: string;
  rejectionReasonPlaceholder: string;
  rejectBtn: string;
  rejectingBtn: string;
  approveBtn: string;
  approvingBtn: string;

  // Status Toggle Modal
  suspendModalTitle: string;
  activateModalTitle: string;
  suspendModalDesc: string;
  activateModalDesc: string;
  suspensionReasonLabel: string;
  suspensionReasonPlaceholder: string;
  confirmSuspendBtn: string;
  confirmActivateBtn: string;
  submittingBtn: string;
  cancelBtn: string;

  // Detail Page
  backToListBtn: string;
  detailBreadcrumbRoot: string;
  detailTabOverview: string;
  detailTabStaff: string;
  detailTabCatalog: string;
  detailTabOrders: string;
  detailTabAudit: string;
  supplierNotFound: string;
  supplierNotFoundDesc: string;
  loadingSupplierDetails: string;
  queryingDatabase: string;
  verifiedWholesaleBadge: string;
  registeredOwner: string;
  contactInformation: string;
  hubWarehouseInfo: string;
  financialIdentifiers: string;
  submittedDocsTitle: string;
  lightboxTitle: string;
  downloadDocument: string;
  zoomInPrompt: string;

  // Supplier Portal Sidebar Nav
  navGroupCore: string;
  navDashboard: string;
  navProducts: string;
  navInventory: string;
  navPricing: string;

  navGroupB2B: string;
  navSourcing: string;
  navMyOrders: string;
  navRFQs: string;
  navQuotations: string;
  navNegotiations: string;
  navOrders: string;
  navCustomers: string;

  navGroupLogistics: string;
  navWarehouse: string;
  navBranches: string;
  navShipments: string;

  navGroupFinance: string;
  navInvoices: string;
  navPayments: string;
  navSubscriptions: string;
  navPromotions: string;

  navGroupSupport: string;
  navDisputes: string;
  navMessages: string;
  navNotifications: string;
  navAnalytics: string;

  navGroupBusiness: string;
  navTeam: string;
  navProfile: string;
  navSettings: string;
  navVerification: string;

  // Supplier Header & Quick Actions
  headerQuickAction: string;
  headerCreateManage: string;
  headerAddNewProduct: string;
  headerCreateQuotation: string;
  headerTransferStock: string;
  headerAdjustStock: string;
  headerViewRfqs: string;
  headerLiveBadge: string;
  headerSearchPlaceholder: string;
  headerRoleAuthority: string;
  headerBranchDepot: string;
  headerBusinessProfile: string;
  headerTeamFleet: string;
  headerBranchDrivers: string;
  headerDepotsWarehouses: string;
  headerPortalSettings: string;
  headerSignOut: string;
  headerBranchManager: string;
  headerSuperSupplierHq: string;
  bottomNavMenu: string;
  bottomNavAddItem: string;
}

export const SUPPLIER_TRANSLATIONS: Record<LanguageCode, SupplierTranslationDictionary> = {
  en: {
    pageTitle: "Suppliers & Fleet Control",
    pageSubtitle: "Manage wholesale suppliers, bulk merchants, warehouse hubs, and their staff roster directly from the database.",
    badgeDb: "PostgreSQL Data",
    refresh: "Refresh",
    loading: "Loading suppliers directly from database...",

    statAllSuppliers: "Suppliers in DB",
    statAllSuppliersSub: "Live PostgreSQL merchant profiles",
    statVerified: "Verified Wholesalers",
    statVerifiedSub: "MOTRI & TIN KYC verified",
    statTotalStaff: "Total Staff & Fleet",
    statDriversCount: "drivers",
    statManagersCount: "managers",
    statPendingKyc: "Pending Approvals",
    statPendingKycSub: "Awaiting compliance review",

    pendingBannerTitleSingular: "Supplier Application Awaiting Review",
    pendingBannerTitlePlural: "Supplier Applications Awaiting Review",
    actionRequired: "Action Required",
    pendingBannerDesc: "Newly registered wholesalers have submitted legal licenses, TIN certificates, and MOTRI documents.",
    filterPendingBtn: "Filter Pending Applications",

    searchPlaceholder: "Search by company name, owner, email, hub location, TIN, trade license...",
    allKyc: "All KYC Statuses",
    kycApproved: "Verified Only",
    kycPending: "Pending Review",
    kycRejected: "Rejected",
    kycUnsubmitted: "Unsubmitted",

    allStatus: "All Account Status",
    statusActive: "Active Accounts",
    statusSuspended: "Suspended Accounts",

    allTypes: "All Business Types",
    typeImporter: "Bulk Importers",
    typeWholesale: "Wholesale Distributors",
    typeManufacturer: "Manufacturers",

    swipeHint: "👉 Swipe horizontally to view full table",
    wholesalersCount: "Wholesalers",
    colSupplierCompany: "Supplier & Company",
    colClassification: "Business Classification",
    colHubLocation: "Hub / Warehouse Location",
    colOwnerContact: "Owner & Contact",
    colStaffFleet: "Staff & Fleet",
    colKycStatus: "KYC Status",
    colAccountStatus: "Status",
    colActions: "Actions",

    unnamedMerchant: "Unnamed Merchant",
    verifiedMerchant: "Verified Merchant",
    licenseLabel: "License:",
    tinLabel: "TIN:",
    hubBadge: "Hub",
    notSpecified: "Not specified",
    addressNotSet: "Warehouse address not set",
    staffBadge: "Staff",
    mgrBadge: "Mgr",
    drvBadge: "Drv",
    verifiedBadge: "Verified",
    rejectedBadge: "Rejected",
    pendingReviewBadge: "Pending Review",
    unsubmittedBadge: "Unsubmitted",
    activeBadge: "Active",
    suspendedBadge: "Suspended",

    actionInspectStaff: "Inspect Staff & Fleet Roster",
    actionReviewKyc: "Review Legal Documents & KYC",
    actionSuspendAccount: "Suspend Merchant Account",
    actionActivateAccount: "Activate Merchant Account",
    actionViewFullDetail: "View Full Supplier Page & Analytics",
    actionDeleteSupplier: "Delete Supplier Account",
    deleteSupplierModalTitle: "Permanently Delete Supplier",
    deleteSupplierModalDesc: "Are you sure you want to delete this supplier account? This will permanently remove the supplier from the database.",
    confirmDeleteSupplierBtn: "Delete Supplier",
    deletingSupplierBtn: "Deleting...",

    noSuppliersDb: "No Suppliers in Database",
    noSuppliersFilter: "No Suppliers Match Current Search Filters",
    noSuppliersDbDesc: "All wholesale merchant accounts and suppliers are loaded live from the PostgreSQL database. When merchants register or submit KYC documents, they will appear here.",
    noSuppliersFilterDesc: "Try clearing search keywords or resetting status and business type filters.",
    refreshDbBtn: "Refresh Suppliers Database",
    resetFiltersBtn: "Reset Filters",

    staffModalTitle: "Wholesale Staff & Fleet Roster",
    staffModalSubtitle: "Live staff registered under",
    staffTabAll: "All Staff",
    staffTabManagers: "Branch Managers",
    staffTabDrivers: "Drivers & Couriers",
    colStaffMember: "Staff Member",
    colStaffRole: "Role",
    colStaffBranch: "Assigned Hub / Branch",
    colStaffContact: "Contact",
    colStaffStatus: "Status",
    noStaffFound: "No staff members found for the selected filter.",
    roleManager: "Branch Manager",
    roleDriver: "Driver / Courier",
    closeBtn: "Close",
    doneBtn: "Done",
    staffRosterNote: "Personnel and logistics roster is maintained directly by the supplier.",

    kycModalTitle: "Review Wholesale Merchant KYC & Legal Documents",
    kycModalSubtitle: "Review legal registration certificates submitted by",
    docsSectionTitle: "Submitted Legal Verification Documents",
    docTradeLicense: "Commercial Trade License (MOTRI)",
    docTinCertificate: "Taxpayer Identification Certificate (TIN)",
    docCommercialRegistration: "Commercial Registration (MOTRI)",
    docOwnerId: "Owner / Manager Fayda ID",
    noDocImage: "No document image uploaded",
    clickToInspectImage: "Click to inspect high-resolution image",
    businessDetailsTitle: "Business Registration Particulars",
    labelCompanyName: "Registered Company Name:",
    labelContactPerson: "Primary Contact Person:",
    labelWarehouseHub: "Physical Warehouse Hub:",
    labelTinNumber: "TIN Number:",
    labelTradeLicense: "Trade License No:",
    rejectionReasonLabel: "Rejection Reason (Required if rejecting):",
    rejectionReasonPlaceholder: "Specify missing documents or verification discrepancy...",
    rejectBtn: "Reject Application",
    rejectingBtn: "Rejecting...",
    approveBtn: "Approve & Verify Wholesaler",
    approvingBtn: "Verifying...",

    suspendModalTitle: "Suspend Supplier Account",
    activateModalTitle: "Activate Supplier Account",
    suspendModalDesc: "Suspending this supplier will temporarily block product sales and wholesale listings.",
    activateModalDesc: "Activating this supplier will restore their catalog listings and platform access.",
    suspensionReasonLabel: "Reason for Suspension (Optional):",
    suspensionReasonPlaceholder: "State compliance or operational reason...",
    confirmSuspendBtn: "Confirm Suspension",
    confirmActivateBtn: "Confirm Activation",
    submittingBtn: "Processing...",
    cancelBtn: "Cancel",

    backToListBtn: "Back to Suppliers List",
    detailBreadcrumbRoot: "Suppliers & Fleet",
    detailTabOverview: "Overview & Profile",
    detailTabStaff: "Staff & Fleet Roster",
    detailTabCatalog: "Wholesale Catalog",
    detailTabOrders: "Orders & Fulfillment",
    detailTabAudit: "Audit & Activity Logs",
    supplierNotFound: "Supplier Profile Not Found",
    supplierNotFoundDesc: "The requested supplier record could not be found or has been deleted from the database.",
    loadingSupplierDetails: "Loading Supplier Records...",
    queryingDatabase: "Querying PostgreSQL & compliance storage for",
    verifiedWholesaleBadge: "Verified Wholesale Merchant",
    registeredOwner: "Registered Business Owner",
    contactInformation: "Contact Information",
    hubWarehouseInfo: "Hub & Warehouse Information",
    financialIdentifiers: "Financial & Legal Identifiers",
    submittedDocsTitle: "Submitted Legal Compliance Documents",
    lightboxTitle: "Official Legal Document Inspection",
    downloadDocument: "Download Original Document",
    zoomInPrompt: "Click to inspect in high resolution",

    navGroupCore: "Core Operations",
    navDashboard: "Dashboard",
    navProducts: "Products",
    navInventory: "Manage Inventory",
    navPricing: "Set MOQ & Wholesale Pricing",

    navGroupB2B: "B2B Trade & Sourcing",
    navSourcing: "Sourcing Marketplace",
    navMyOrders: "My Orders (Purchases)",
    navRFQs: "Receive RFQs",
    navQuotations: "Send Quotations",
    navNegotiations: "Negotiate Price",
    navOrders: "Orders",
    navCustomers: "Customers & Buyers (CRM)",

    navGroupLogistics: "Logistics & Fulfillment",
    navWarehouse: "Warehouses & Depots",
    navBranches: "Branch Management (Hubs)",
    navShipments: "Prepare Shipments",

    navGroupFinance: "Finance & Sales",
    navInvoices: "Create Invoices",
    navPayments: "Payments",
    navSubscriptions: "Subscriptions & Tiers",
    navPromotions: "Promotions",

    navGroupSupport: "Support & Mediation",
    navDisputes: "Disputes",
    navMessages: "Messages",
    navNotifications: "Notifications",
    navAnalytics: "Analytics",

    navGroupBusiness: "Business Management",
    navTeam: "Staff & Team (Create Staff)",
    navProfile: "Company Profile & Verification",
    navSettings: "Settings",
    navVerification: "Verification & Badges",

    headerQuickAction: "Quick Action",
    headerCreateManage: "Create / Manage",
    headerAddNewProduct: "Add New Product",
    headerCreateQuotation: "Create Quotation",
    headerTransferStock: "Transfer Warehouse Stock",
    headerAdjustStock: "Adjust Inventory Stock",
    headerViewRfqs: "View Pending RFQs",
    headerLiveBadge: "Live",
    headerSearchPlaceholder: "Search orders, RFQs, products, SKU (e.g. ETH-COF, Midroc)...",
    headerRoleAuthority: "Role Authority:",
    headerBranchDepot: "Branch Depot:",
    headerBusinessProfile: "Business Profile",
    headerTeamFleet: "Team & Fleet Drivers",
    headerBranchDrivers: "My Branch Drivers",
    headerDepotsWarehouses: "Depots & Warehouses",
    headerPortalSettings: "Portal Settings",
    headerSignOut: "Sign Out",
    headerBranchManager: "Branch Manager",
    headerSuperSupplierHq: "Super Supplier HQ",
    bottomNavMenu: "Menu",
    bottomNavAddItem: "Add Item",
  },

  am: {
    pageTitle: "የአቅራቢዎች እና የፍሊት ቁጥጥር",
    pageSubtitle: "የጅምላ አቅራቢዎችን፣ የጅምላ ነጋዴዎችን፣ የመጋዘን ማዕከላትን እና የሰራተኞች ዝርዝር በቀጥታ ከዳታቤዝ ያስተዳድሩ።",
    badgeDb: "የ PostgreSQL ዳታ",
    refresh: "አድስ",
    loading: "አቅራቢዎችን በቀጥታ ከዳታቤዝ በመጫን ላይ...",

    statAllSuppliers: "በዳታቤዝ ያሉ አቅራቢዎች",
    statAllSuppliersSub: "ቀጥታ የነጋዴዎች መገለጫዎች በዳታቤዝ",
    statVerified: "የተረጋገጡ የጅምላ ነጋዴዎች",
    statVerifiedSub: "በንግድ ሚኒስቴር እና TIN የተረጋገጡ",
    statTotalStaff: "አጠቃላይ ሰራተኞች እና አሽከርካሪዎች",
    statDriversCount: "አሽከርካሪዎች",
    statManagersCount: "ስራ አስኪያጆች",
    statPendingKyc: "የሚጠባበቁ ማረጋገጫዎች",
    statPendingKycSub: "የህግ ምርመራ በመጠባበቅ ላይ",

    pendingBannerTitleSingular: "የአቅራቢ ማመልከቻ ማረጋገጫ በመጠባበቅ ላይ ይገኛል",
    pendingBannerTitlePlural: "የአቅራቢ ማመልከቻዎች ማረጋገጫ በመጠባበቅ ላይ ይገኛሉ",
    actionRequired: "ውሳኔ ያስፈልገዋል",
    pendingBannerDesc: "አዲስ የተመዘገቡ የጅምላ ነጋዴዎች ህጋዊ የንግድ ፍቃድ፣ የ TIN ሰርተፍኬት እና ሌሎች ሰነዶችን አስገብተዋል።",
    filterPendingBtn: "የሚጠባበቁ ማመልከቻዎችን ለይ",

    searchPlaceholder: "በድርጅት ስም፣ ባለቤት፣ ኢሜይል፣ የመጋዘን አድራሻ፣ TIN፣ የንግድ ፍቃድ ይፈልጉ...",
    allKyc: "ሁሉም የ KYC ሁኔታዎች",
    kycApproved: "የተረጋገጡ ብቻ",
    kycPending: "በመጠባበቅ ላይ ያሉ",
    kycRejected: "ውድቅ የተደረጉ",
    kycUnsubmitted: "ያልገቡ ሰነዶች",

    allStatus: "ሁሉም የመለያ ሁኔታዎች",
    statusActive: "ንቁ መለያዎች",
    statusSuspended: "የታገዱ መለያዎች",

    allTypes: "ሁሉም የንግድ አይነቶች",
    typeImporter: "ጅምላ አስመጪዎች",
    typeWholesale: "የጅምላ አከፋፋዮች",
    typeManufacturer: "አምራቾች",

    swipeHint: "👉 ሙሉ ሰንጠረዡን ለማየት ወደ ጎን ያሸብልሉ",
    wholesalersCount: "የጅምላ ነጋዴዎች",
    colSupplierCompany: "አቅራቢ እና ድርጅት",
    colClassification: "የንግድ ምድብ",
    colHubLocation: "የመጋዘን / ማዕከል አድራሻ",
    colOwnerContact: "ባለቤት እና መገናኛ",
    colStaffFleet: "ሰራተኞች እና አሽከርካሪዎች",
    colKycStatus: "የ KYC ሁኔታ",
    colAccountStatus: "ሁኔታ",
    colActions: "እርምጃዎች",

    unnamedMerchant: "ያልተሰየመ ነጋዴ",
    verifiedMerchant: "የተረጋገጠ ነጋዴ",
    licenseLabel: "ፍቃድ፡",
    tinLabel: "TIN፡",
    hubBadge: "ማዕከል",
    notSpecified: "አልተገለጸም",
    addressNotSet: "የመጋዘን አድራሻ አልተመዘገበም",
    staffBadge: "ሰራተኞች",
    mgrBadge: "ስራ አስኪያጅ",
    drvBadge: "አሽከርካሪ",
    verifiedBadge: "የተረጋገጠ",
    rejectedBadge: "ውድቅ የተደረገ",
    pendingReviewBadge: "በመጠባበቅ ላይ",
    unsubmittedBadge: "ያልገባ",
    activeBadge: "ንቁ",
    suspendedBadge: "የታገደ",

    actionInspectStaff: "የሰራተኞች እና አሽከርካሪዎች ዝርዝር ተመልከት",
    actionReviewKyc: "ህጋዊ ሰነዶችን እና KYC መርምር",
    actionSuspendAccount: "የነጋዴውን መለያ እገድ",
    actionActivateAccount: "የነጋዴውን መለያ አንቃ",
    actionViewFullDetail: "ሙሉ የአቅራቢውን ገጽ እና ትንታኔ ተመልከት",
    actionDeleteSupplier: "አቅራቢውን ሰርዝ",
    deleteSupplierModalTitle: "አቅራቢውን በቋሚነት ሰርዝ",
    deleteSupplierModalDesc: "ይህን የአቅራቢ መለያ በቋሚነት መሰረዝ ይፈልጋሉ? ይህ እርምጃ አቅራቢውን ከዳታቤዝ ውስጥ ሙሉ በሙሉ ያስወግዳል፤ ሊመለስ አይችልም።",
    confirmDeleteSupplierBtn: "አቅራቢውን ሰርዝ",
    deletingSupplierBtn: "በመሰረዝ ላይ...",

    noSuppliersDb: "በዳታቤዝ ውስጥ ምንም አቅራቢ አልተገኘም",
    noSuppliersFilter: "ከፍለጋው ጋር የሚዛመድ አቅራቢ አልተገኘም",
    noSuppliersDbDesc: "ሁሉም የጅምላ ነጋዴዎች እና አቅራቢዎች በቀጥታ ከ PostgreSQL ዳታቤዝ ይጫናሉ። ነጋዴዎች ሲመዘገቡ ወይም ሰነዶችን ሲያስገቡ እዚህ ይታያሉ።",
    noSuppliersFilterDesc: "የፍለጋ ቃላትን በማጽዳት ወይም ማጣሪያዎችን ዳግም በማስጀመር ይሞክሩ።",
    refreshDbBtn: "የአቅራቢዎችን ዳታቤዝ አድስ",
    resetFiltersBtn: "ማጣሪያዎችን አጽዳ",

    staffModalTitle: "የጅምላ አቅራቢ ሰራተኞች እና አሽከርካሪዎች ዝርዝር",
    staffModalSubtitle: "የተመዘገቡ ሰራተኞች በ፡",
    staffTabAll: "ሁሉም ሰራተኞች",
    staffTabManagers: "የቅርንጫፍ ስራ አስኪያጆች",
    staffTabDrivers: "አሽከርካሪዎች እና መልእክተኞች",
    colStaffMember: "የሰራተኛ ስም",
    colStaffRole: "የስራ ድርሻ",
    colStaffBranch: "የተመደበበት ማዕከል / ቅርንጫፍ",
    colStaffContact: "የመገናኛ አድራሻ",
    colStaffStatus: "ሁኔታ",
    noStaffFound: "በተመረጠው ማጣሪያ ምንም ሰራተኛ አልተገኘም።",
    roleManager: "የቅርንጫፍ ስራ አስኪያጅ",
    roleDriver: "አሽከርካሪ / መልእክተኛ",
    closeBtn: "ዝጋ",
    doneBtn: "ተከናውኗል",
    staffRosterNote: "የሰራተኞች እና የሎጅስቲክስ ዝርዝር በቀጥታ በአቅራቢው ይያዛል።",

    kycModalTitle: "የጅምላ ነጋዴ ህጋዊ ሰነዶች እና KYC ምርመራ",
    kycModalSubtitle: "የተላኩ ህጋዊ የንግድ ሰነዶችን ይመርምሩ፡",
    docsSectionTitle: "የተላኩ ህጋዊ ማረጋገጫ ሰነዶች",
    docTradeLicense: "የንግድ ስራ ፍቃድ (ንግድ ሚኒስቴር)",
    docTinCertificate: "የግብር ከፋይ መለያ ሰርተፍኬት (TIN)",
    docCommercialRegistration: "ዋና የንግድ ምዝገባ ሰርተፍኬት (MOTRI)",
    docOwnerId: "የባለቤት / ስራ አስኪያጅ ፋይዳ መታወቂያ",
    noDocImage: "ምንም የተጫነ ሰነድ ምስል የለም",
    clickToInspectImage: "ምስሉን በትልቅ እይታ ለመመልከት ይጫኑ",
    businessDetailsTitle: "የድርጅት ምዝገባ ዝርዝር መረጃዎች",
    labelCompanyName: "የተመዘገበ የድርጅት ስም፡",
    labelContactPerson: "ዋና ተጠሪ ሰው፡",
    labelWarehouseHub: "ትክክለኛ የመጋዘን አድራሻ፡",
    labelTinNumber: "የታክስ መለያ ቁጥር (TIN)፡",
    labelTradeLicense: "የንግድ ፍቃድ ቁጥር፡",
    rejectionReasonLabel: "ውድቅ የተደረገበት ምክንያት (ውድቅ ሲደረግ የግዴታ ነው)፡",
    rejectionReasonPlaceholder: "ጎደሎ ሰነዶችን ወይም የተፈጠረውን ክፍተት ይግለጹ...",
    rejectBtn: "ማመልከቻውን ውድቅ አድርግ",
    rejectingBtn: "ውድቅ በማድረግ ላይ...",
    approveBtn: "አጽድቅ እና አቅራቢውን አረጋግጥ",
    approvingBtn: "በማረጋገጥ ላይ...",

    suspendModalTitle: "የአቅራቢውን መለያ እገድ",
    activateModalTitle: "የአቅራቢውን መለያ አንቃ",
    suspendModalDesc: "ይህን አቅራቢ ማገድ የምርቶቹን ሽያጭ እና የጅምላ ዝርዝሮችን ለጊዜው ያግዳል/ያቆማል።",
    activateModalDesc: "ይህን አቅራቢ ማንቃት የምርቶቹን ሽያጭ እና ወደ ፕላትፎርሙ ያለውን መዳረሻ ሙሉ በሙሉ ይመልሳል።",
    suspensionReasonLabel: "የእገዳው ምክንያት (አማራጭ)፡",
    suspensionReasonPlaceholder: "የህግ ጥሰት ወይም የስራ ምክንያት ያስገቡ...",
    confirmSuspendBtn: "እገዳውን አረጋግጥ",
    confirmActivateBtn: "ማንቃቱን አረጋግጥ",
    submittingBtn: "በማስኬድ ላይ...",
    cancelBtn: "ሰርዝ",

    backToListBtn: "ወደ አቅራቢዎች ዝርዝር ተመለስ",
    detailBreadcrumbRoot: "አቅራቢዎች እና ፍሊት",
    detailTabOverview: "አጠቃላይ እይታ እና መገለጫ",
    detailTabStaff: "የሰራተኞች እና አሽከርካሪዎች ዝርዝር",
    detailTabCatalog: "የጅምላ ምርቶች ካታሎግ",
    detailTabOrders: "ትዕዛዞች እና ስርጭት",
    detailTabAudit: "የኦዲት እና እንቅስቃሴዎች ታሪክ",
    supplierNotFound: "የአቅራቢው መገለጫ አልተገኘም",
    supplierNotFoundDesc: "የተጠየቀው የአቅራቢ መዝገብ አልተገኘም ወይም ከዳታቤዝ ተሰርዟል።",
    loadingSupplierDetails: "የአቅራቢውን ዝርዝር መረጃዎች በመጫን ላይ...",
    queryingDatabase: "PostgreSQL እና የሰነድ ማከማቻ በመመርመር ላይ ለ፡",
    verifiedWholesaleBadge: "የተረጋገጠ የጅምላ ነጋዴ",
    registeredOwner: "የተመዘገበ የንግድ ባለቤት",
    contactInformation: "የመገናኛ መረጃ",
    hubWarehouseInfo: "የማዕከል እና መጋዘን መረጃ",
    financialIdentifiers: "የፋይናንስ እና ህጋዊ መለያዎች",
    submittedDocsTitle: "የቀረቡ ህጋዊ ማረጋገጫ ሰነዶች",
    lightboxTitle: "ይፋዊ ህጋዊ ሰነድ ምርመራ",
    downloadDocument: "ዋናውን ሰነድ አውርድ",
    zoomInPrompt: "በትልቅ እይታ ለማየት ይጫኑ",

    navGroupCore: "ዋና ስራዎች",
    navDashboard: "ዳሽቦርድ",
    navProducts: "ምርቶች",
    navInventory: "እቃ ክምችት አስተዳድር",
    navPricing: "አነስተኛ ትዕዛዝ እና ጅምላ ዋጋ",

    navGroupB2B: "B2B ንግድ እና ግብይት",
    navSourcing: "የጅምላ ግብይት ገበያ",
    navMyOrders: "የእኔ ትዕዛዞች (ግዢዎች)",
    navRFQs: "የዋጋ ጥያቄዎችን ተቀበል (RFQ)",
    navQuotations: "የዋጋ ማቅረቢያ ላክ",
    navNegotiations: "በዋጋ ተደራደር",
    navOrders: "ትዕዛዞች",
    navCustomers: "ደንበኞች እና ገዢዎች (CRM)",

    navGroupLogistics: "ሎጅስቲክስ እና ስርጭት",
    navWarehouse: "መጋዘኖች እና ማከማቻዎች",
    navBranches: "የቅርንጫፍ አስተዳደር (ማዕከላት)",
    navShipments: "ጭነቶችን አዘጋጅ",

    navGroupFinance: "ፋይናንስ እና ሽያጭ",
    navInvoices: "ደረሰኞችን ፍጠር",
    navPayments: "ክፍያዎች",
    navSubscriptions: "የአባልነት እርከኖች",
    navPromotions: "ማስተዋወቂያዎች",

    navGroupSupport: "ድጋፍ እና እርቅ",
    navDisputes: "አለመግባባቶች",
    navMessages: "መልእክቶች",
    navNotifications: "ማሳወቂያዎች",
    navAnalytics: "ትንታኔዎች",

    navGroupBusiness: "የንግድ ስራ አመራር",
    navTeam: "ሰራተኞች እና ቡድን",
    navProfile: "የድርጅት መገለጫ እና ማረጋገጫ",
    navSettings: "ማስተካከያዎች",
    navVerification: "ማረጋገጫ እና ባጆች",

    headerQuickAction: "ፈጣን እርምጃ",
    headerCreateManage: "ፍጠር / አስተዳድር",
    headerAddNewProduct: "አዲስ ምርት ጨምር",
    headerCreateQuotation: "የዋጋ ማቅረቢያ ፍጠር",
    headerTransferStock: "የመጋዘን ክምችት አስተላልፍ",
    headerAdjustStock: "የክምችት መጠን አስተካክል",
    headerViewRfqs: "የዋጋ ጥያቄዎችን እይ",
    headerLiveBadge: "ቀጥታ",
    headerSearchPlaceholder: "ትዕዛዞችን፣ የዋጋ ጥያቄዎችን፣ ምርቶችን፣ SKU ይፈልጉ...",
    headerRoleAuthority: "የስራ ድርሻ ሃላፊነት፦",
    headerBranchDepot: "ቅርንጫፍ መጋዘን፦",
    headerBusinessProfile: "የድርጅት መገለጫ",
    headerTeamFleet: "የስራ ቡድን እና አሽከርካሪዎች",
    headerBranchDrivers: "የቅርንጫፉ አሽከርካሪዎች",
    headerDepotsWarehouses: "መጋዘኖች እና ማከማቻዎች",
    headerPortalSettings: "የፖርታል ማስተካከያዎች",
    headerSignOut: "ውጣ",
    headerBranchManager: "የቅርንጫፍ ስራ አስኪያጅ",
    headerSuperSupplierHq: "ዋና የአቅራቢ ማዕከል",
    bottomNavMenu: "ምናሌ",
    bottomNavAddItem: "ምርት ጨምር",
  },

  om: {
    pageTitle: "To'annoo Dhiheessitootaa fi Konkolaattotaa",
    pageSubtitle: "Dhiheessitoota jumlaa, daldaltoota bal'aa, buufataalee kuusaa fi hojjettoota kallattiin kuusaa deetaa irraa bulchaa.",
    badgeDb: "Deetaa PostgreSQL",
    refresh: "Haaromsi",
    loading: "Dhiheessitoota kallattiin kuusaa deetaa irraa fe'aa jira...",

    statAllSuppliers: "Dhiheessitoota Kuusaa Keessatti",
    statAllSuppliersSub: "Piroofaayilii daldaltootaa kallattii",
    statVerified: "Jumlaa Mirkanaa'an",
    statVerifiedSub: "MOTRI fi TIN KYC mirkanaa'e",
    statTotalStaff: "Waliigala Hojjettootaa fi Konkolaattota",
    statDriversCount: "konkolaachiftoota",
    statManagersCount: "hoggantoota",
    statPendingKyc: "Mirkaneessota Eeggatan",
    statPendingKycSub: "Qorannoo seeraa eeggachaa jiru",

    pendingBannerTitleSingular: "Iyyanni Dhiheessaa Mirkaneessa Eeggachaa Jira",
    pendingBannerTitlePlural: "Iyyannoowwan Dhiheessaa Mirkaneessa Eeggachaa Jiru",
    actionRequired: "Murtee Barbaada",
    pendingBannerDesc: "Daldaltoonni jumlaa haaraan galmaa'an heyyama seeraa, waraqaa ragaa TIN fi sanadoota MOTRI galchaniiru.",
    filterPendingBtn: "Iyyannoowwan Eeggatan Qulqulleessi",

    searchPlaceholder: "Maqaa dhaabbataa, abbaa, imeelii, bakka buufataa, TIN, heyyama daldalaan barbaadaa...",
    allKyc: "Haala KYC Hunda",
    kycApproved: "Mirkanaa'e Qofa",
    kycPending: "Eeggachaa Jira",
    kycRejected: "Kufaa Ta'e",
    kycUnsubmitted: "Hin Galfamne",

    allStatus: "Haala Herregaa Hunda",
    statusActive: "Herregawwan Hojiirra Jiran",
    statusSuspended: "Herregawwan Cufaman",

    allTypes: "Gosa Daldalaa Hunda",
    typeImporter: "Biyya Alaa Galchituu Jumlaa",
    typeWholesale: "Raabsitoota Jumlaa",
    typeManufacturer: "Oomishtoota",

    swipeHint: "👉 Gabatee guutuu arguuf gara cinaatti daddabarsaa",
    wholesalersCount: "Daldaltoota Jumlaa",
    colSupplierCompany: "Dhiheessaa fi Dhaabbata",
    colClassification: "Ramaddii Daldalaa",
    colHubLocation: "Bakka Kuusaa / Buufataa",
    colOwnerContact: "Abbaa fi Quunnamtii",
    colStaffFleet: "Hojjettoota fi Konkolaattota",
    colKycStatus: "Haala KYC",
    colAccountStatus: "Haala",
    colActions: "Tarkaanfiiwwan",

    unnamedMerchant: "Daldalaa Maqaan Hin Dhawamin",
    verifiedMerchant: "Daldalaa Mirkanaa'e",
    licenseLabel: "Heyyama:",
    tinLabel: "TIN:",
    hubBadge: "Buufata",
    notSpecified: "Hin ibsamne",
    addressNotSet: "Teessoon kuusaa hin galmoofne",
    staffBadge: "Hojjettoota",
    mgrBadge: "Hoggansa",
    drvBadge: "Konkolaachisaa",
    verifiedBadge: "Mirkanaa'eera",
    rejectedBadge: "Kufaa Ta'eera",
    pendingReviewBadge: "Eeggachaa Jira",
    unsubmittedBadge: "Hin Galfamne",
    activeBadge: "Hojiirra Jira",
    suspendedBadge: "Cufameera",

    actionInspectStaff: "Tarree Hojjettootaa fi Konkolaattotaa Ilaali",
    actionReviewKyc: "Sanadoota Seeraa fi KYC Qoradhu",
    actionSuspendAccount: "Herrega Daldalaa Cufi",
    actionActivateAccount: "Herrega Daldalaa Hojiirra Oolchi",
    actionViewFullDetail: "Fuula Dhiheessaa fi Xiinxala Guutuu Ilaali",
    actionDeleteSupplier: "Dhiheessaa Balleessi",
    deleteSupplierModalTitle: "Dhiheessaa Dhaabbatan Balleessi",
    deleteSupplierModalDesc: "Herrega dhiheessaa kana kuusaa deetaa keessaa dhaabbataan balleessuu barbaadduu? Gochi kun hin deebi'u.",
    confirmDeleteSupplierBtn: "Dhiheessaa Balleessi",
    deletingSupplierBtn: "Balleessaa jira...",

    noSuppliersDb: "Dhiheessaan Kuusaa Deetaa Keessatti Hin Argamne",
    noSuppliersFilter: "Dhiheessaan Ulaagaa Barbaachaa Wajjin Wal Simu Hin Argamne",
    noSuppliersDbDesc: "Herregawwan daldaltoota jumlaa hundi kallattiin kuusaa deetaa PostgreSQL irraa fe'amu. Yeroo galmaa'an ykn sanada galchan asitti mul'atu.",
    noSuppliersFilterDesc: "Jechoota barbaachaa balleessuun yookiin calaltuuwwan haaromsuun yaalaa.",
    refreshDbBtn: "Kuusaa Dhiheessitootaa Haaromsi",
    resetFiltersBtn: "Calaltuuwwan Deebisi",

    staffModalTitle: "Tarree Hojjettootaa fi Konkolaattota Jumlaa",
    staffModalSubtitle: "Hojjettoota galmaa'an kan:",
    staffTabAll: "Hojjettoota Hunda",
    staffTabManagers: "Hoggantoota Damee",
    staffTabDrivers: "Konkolaachiftoota fi Ergamtoota",
    colStaffMember: "Maqaa Hojjetaa",
    colStaffRole: "Gahee Hojii",
    colStaffBranch: "Buufata / Damee Ramadame",
    colStaffContact: "Quunnamtii",
    colStaffStatus: "Haala",
    noStaffFound: "Calaltuu filatameen hojjetaan homaayyuu hin argamne.",
    roleManager: "Hoggantoota Damee",
    roleDriver: "Konkolaachisaa / Ergaa",
    closeBtn: "Cufi",
    doneBtn: "Xumurameera",
    staffRosterNote: "Tarreen hojjettootaa fi lojistiksii kallattiin dhiheessaan qabama.",

    kycModalTitle: "Sanadoota Seeraa fi KYC Daldalaa Jumlaa Qorachuu",
    kycModalSubtitle: "Sanadoota galmee seeraa galfaman qoradhaa kan:",
    docsSectionTitle: "Sanadoota Mirkaneessa Seeraa Galfaman",
    docTradeLicense: "Heyyama Daldalaa (MOTRI)",
    docTinCertificate: "Waraqaa Ragaa Kaffalaa Gibiraa (TIN)",
    docCommercialRegistration: "Waraqaa Ragaa Galmee Daldalaa (MOTRI)",
    docOwnerId: "Waraqaa Eenyummaa Fayda Abbaa Qabeenyaa",
    noDocImage: "Suuraan sanadaa hin olkaafamne",
    clickToInspectImage: "Suuraa bal'inaan arguuf cuqaasaa",
    businessDetailsTitle: "Odeeffannoo Galmee Dhaabbataa",
    labelCompanyName: "Maqaa Dhaabbata Galmaa'ee:",
    labelContactPerson: "Nama Quunnamtii Guddaa:",
    labelWarehouseHub: "Bakka Kuusaa Kallattii:",
    labelTinNumber: "Lakkoofsa TIN:",
    labelTradeLicense: "Lakk. Heyyama Daldalaa:",
    rejectionReasonLabel: "Sababa Kufaa Ta'eef (Yoo kufaa ta'e dirqama):",
    rejectionReasonPlaceholder: "Sanada hanqate yookiin garaagarummaa jiru ibsaa...",
    rejectBtn: "Iyyannoo Kufaa Taasisi",
    rejectingBtn: "Kufaa gochaa jira...",
    approveBtn: "Mirkaneessi & Dhiheessaa Eeyyami",
    approvingBtn: "Mirkaneessaa jira...",

    suspendModalTitle: "Herrega Dhiheessaa Cufi",
    activateModalTitle: "Herrega Dhiheessaa Bani",
    suspendModalDesc: "Dhiheessaa kana cufuun gurgurtaa oomishaa fi tarree jumlaa yeroof dhaaba.",
    activateModalDesc: "Dhiheessaa kana banuun oomishaalee fi tajaajila sirnichaa hunda deebisa.",
    suspensionReasonLabel: "Sababa Cufiinsaa (Filannoo):",
    suspensionReasonPlaceholder: "Sababa seeraa yookiin hojii ibsaa...",
    confirmSuspendBtn: "Cufiinsa Mirkaneessi",
    confirmActivateBtn: "Baniinsa Mirkaneessi",
    submittingBtn: "Gaggeessaa jira...",
    cancelBtn: "Dhiisi",

    backToListBtn: "Gara Tarree Dhiheessitootaatti Deebi'i",
    detailBreadcrumbRoot: "Dhiheessitoota fi Konkolaattota",
    detailTabOverview: "Ilaalcha Waliigalaa & Piroofaayilii",
    detailTabStaff: "Tarree Hojjettootaa fi Konkolaattota",
    detailTabCatalog: "Kaatalaagii Oomisha Jumlaa",
    detailTabOrders: "Ajajawwan fi Raabsa",
    detailTabAudit: "Galmee Oodiitii fi Sochii",
    supplierNotFound: "Piroofaayiliin Dhiheessaa Hin Argamne",
    supplierNotFoundDesc: "Galmeen dhiheessaa barbaadame hin argamne yookiin kuusaa irraa haqameera.",
    loadingSupplierDetails: "Galmee Dhiheessaa Fe'aa Jira...",
    queryingDatabase: "Kuusaa PostgreSQL fi sanada qorachaa jira kan:",
    verifiedWholesaleBadge: "Daldalaa Jumlaa Mirkanaa'e",
    registeredOwner: "Abbaa Qabeenyaa Galmaa'e",
    contactInformation: "Odeeffannoo Quunnamtii",
    hubWarehouseInfo: "Odeeffannoo Buufataa fi Kuusaa",
    financialIdentifiers: "Eenyummeessitoota Faayinaansii fi Seeraa",
    submittedDocsTitle: "Sanadoota Mirkaneessa Seeraa Galfaman",
    lightboxTitle: "Qorannoo Sanada Seeraa Kallattii",
    downloadDocument: "Sanada Jalqabaa Buufadhu",
    zoomInPrompt: "Bal'inaan arguuf cuqaasaa",

    navGroupCore: "Hojiiwwan Bu'uuraa",
    navDashboard: "Daashboordii",
    navProducts: "Oomishaalee",
    navInventory: "Kuusaa Bulchi",
    navPricing: "Gatii Jumlaa fi MOQ",

    navGroupB2B: "Daldala B2B fi Bittaa",
    navSourcing: "Gabaa Jumlaa",
    navMyOrders: "Ajajawwan Koo (Bittaa)",
    navRFQs: "Gaaffii Gatii Fudhadhu (RFQ)",
    navQuotations: "Gatii Dhiheessi",
    navNegotiations: "Gatii Irratti Mari'adhu",
    navOrders: "Ajajawwan",
    navCustomers: "Maamiltoota fi Bittoota (CRM)",

    navGroupLogistics: "Lojistiksii fi Raabsa",
    navWarehouse: "Kuusawwan fi Buufataalee",
    navBranches: "Bulchiinsa Dameewwanii (Buufataalee)",
    navShipments: "Ergawwan Qopheessi",

    navGroupFinance: "Faayinaansii fi Gurgurtaa",
    navInvoices: "Nagahee Uumi",
    navPayments: "Kaffaltiiwwan",
    navSubscriptions: "Sadarkaa Miseensummaa",
    navPromotions: "Beeksisawwan",

    navGroupSupport: "Deeggarsa fi Araara",
    navDisputes: "Falmiilee",
    navMessages: "Ergawwan",
    navNotifications: "Beeksisawwan",
    navAnalytics: "Xiinxala",

    navGroupBusiness: "Bulchiinsa Daldalaa",
    navTeam: "Hojjettoota fi Garee",
    navProfile: "Piroofaayilii fi Mirkaneessa Dhaabbataa",
    navSettings: "Qindaa'inoota",
    navVerification: "Mirkaneessa fi Asxaawwan",

    headerQuickAction: "Tarkaanfii Saffisaa",
    headerCreateManage: "Uumi / Bulchi",
    headerAddNewProduct: "Oomisha Haaraa Dabali",
    headerCreateQuotation: "Gatii Dhiyeessi",
    headerTransferStock: "Kuusaa Manneen Gidduutti Dabarsi",
    headerAdjustStock: "Hanga Kuusaa Sirreessi",
    headerViewRfqs: "Gaaffii Gatii Ilaali",
    headerLiveBadge: "Kallattii",
    headerSearchPlaceholder: "Ajajoota, RFQ, oomishaalee, SKU barbaadi...",
    headerRoleAuthority: "Aangoo Hojii:",
    headerBranchDepot: "Buufata Damee:",
    headerBusinessProfile: "Piroofaayilii Dhaabbataa",
    headerTeamFleet: "Garee fi Konkolaachiftoota",
    headerBranchDrivers: "Konkolaachiftoota Damee",
    headerDepotsWarehouses: "Kuusawwan fi Buufataalee",
    headerPortalSettings: "Qindaa'inoota Poortaalii",
    headerSignOut: "Ba'i",
    headerBranchManager: "Hogganaa Damee",
    headerSuperSupplierHq: "Wiirtuu Dhiyeessaa Ol'aanaa",
    bottomNavMenu: "Gara Baafataa",
    bottomNavAddItem: "Oomisha Dabali",
  },

  ti: {
    pageTitle: "ናይ ኣቕረብትን ፍሊትን ምቁፅፃር",
    pageSubtitle: "ናይ ጅምላ ኣቕረብቲ፣ ናይ ጅምላ ነጋዶ፣ ናይ መኽዘን ማእከላትን ሰራሕተኛታትን ብቐጥታ ካብ ዳታቤዝ ኣመሓድር።",
    badgeDb: "ናይ PostgreSQL ዳታ",
    refresh: "ሓድሽ",
    loading: "ኣቕረብቲ ብቐጥታ ካብ ዳታቤዝ የፅዕን ኣሎ...",

    statAllSuppliers: "ኣብ ዳታቤዝ ዘለዉ ኣቕረብቲ",
    statAllSuppliersSub: "ናይ ቀጥታ ነጋዶ ፕሮፋይላት ኣብ ዳታቤዝ",
    statVerified: "ዝተረጋገፁ ጅምላ ነጋዶ",
    statVerifiedSub: "ብ MOTRIን TINን ዝተረጋገፁ",
    statTotalStaff: "ሓፈሻዊ ሰራሕተኛታትን ፍሊትን",
    statDriversCount: "መዋፈርቲ መኪና",
    statManagersCount: "ኣመሓደርቲ",
    statPendingKyc: "ዝፅበዩ መረጋገፂታት",
    statPendingKycSub: "ናይ ሕጊ ምርመራ ይፅበዩ ኣለዉ",

    pendingBannerTitleSingular: "ናይ ኣቕራቢ ማመልከቻ መረጋገፂ ይፅበ ኣሎ",
    pendingBannerTitlePlural: "ናይ ኣቕረብቲ ማመልከቻታት መረጋገፂ ይፅበዩ ኣለዉ",
    actionRequired: "ውሳነ የድሊ",
    pendingBannerDesc: "ሓደሽቲ ዝተመዝገቡ ጅምላ ነጋዶ ሕጋዊ ንግዲ ፍቓድ፣ ናይ TIN ሰርተፊኬትን ካልኦት ሰነዳትን ኣእትዮም ኣለዉ።",
    filterPendingBtn: "ዝፅበዩ ማመልከቻታት ፍለ",

    searchPlaceholder: "ብሽም ኩባንያ፣ ዋና፣ ኢመይል፣ ናይ መኽዘን ቦታ፣ TIN፣ ንግዲ ፍቓድ ድለ...",
    allKyc: "ኩሎም ናይ KYC ኩነታት",
    kycApproved: "ዝተረጋገፁ ጥራይ",
    kycPending: "ይፅበዩ ዘለዉ",
    kycRejected: "ውድቂ ዝተገብሩ",
    kycUnsubmitted: "ዘይተኣተዉ",

    allStatus: "ኩሎም ናይ ሕሳብ ኩነታት",
    statusActive: "ንጡፋት ሕሳባት",
    statusSuspended: "ዝተኣገዱ ሕሳባት",

    allTypes: "ኩሎም ናይ ንግዲ ዓይነታት",
    typeImporter: "ናይ ጅምላ ኣእተውቲ",
    typeWholesale: "ናይ ጅምላ መከፋፈልቲ",
    typeManufacturer: "ኣፍረይቲ",

    swipeHint: "👉 ምሉእ ሰሌዳ ንምርኣይ ናብ ጎኒ ኣንሸራትት",
    wholesalersCount: "ጅምላ ነጋዶ",
    colSupplierCompany: "ኣቕራብን ኩባንያን",
    colClassification: "ናይ ንግዲ ምድብ",
    colHubLocation: "ናይ መኽዘን / ማእኸል ቦታ",
    colOwnerContact: "ዋናን መራኸብን",
    colStaffFleet: "ሰራሕተኛታትን ፍሊትን",
    colKycStatus: "ናይ KYC ኩነታት",
    colAccountStatus: "ኩነታት",
    colActions: "ስጉምትታት",

    unnamedMerchant: "ሽም ዘይተወሃቦ ነጋዳይ",
    verifiedMerchant: "ዝተረጋገፀ ነጋዳይ",
    licenseLabel: "ፍቓድ፡",
    tinLabel: "TIN፡",
    hubBadge: "ማእኸል",
    notSpecified: "ኣይተገለፀን",
    addressNotSet: "ናይ መኽዘን ኣድራሻ ኣይተመዝገበን",
    staffBadge: "ሰራሕተኛታት",
    mgrBadge: "ኣመሓዳሪ",
    drvBadge: "ሾፌር",
    verifiedBadge: "ዝተረጋገፀ",
    rejectedBadge: "ውድቂ ዝተገበረ",
    pendingReviewBadge: "ይፅበ ኣሎ",
    unsubmittedBadge: "ዘይተኣተወ",
    activeBadge: "ንጡፍ",
    suspendedBadge: "ዝተኣገደ",

    actionInspectStaff: "ናይ ሰራሕተኛታትን ፍሊትን ዝርዝር ርአ",
    actionReviewKyc: "ሕጋዊ ሰነዳትን KYCን መርምር",
    actionSuspendAccount: "ናይ ነጋዳይ ሕሳብ ዕፀው",
    actionActivateAccount: "ናይ ነጋዳይ ሕሳብ ኣብርህ",
    actionViewFullDetail: "ምሉእ ናይ ኣቕራቢ ገፅን ትንተናን ርአ",
    actionDeleteSupplier: "ኣቕራቢ ሰርዝ",
    deleteSupplierModalTitle: "ኣቕራቢ ብቀዋምነት ሰርዝ",
    deleteSupplierModalDesc: "ነዚ ናይ ኣቕራቢ ሕሳብ ብቀዋምነት ክትሰርዞ ትደሊ ዲኻ? እዚ ስጉምቲ ካብ ዳታቤዝ ምሉእ ብምሉእ የውፅኦ፤ ክምለስ ኣይኽእልን።",
    confirmDeleteSupplierBtn: "ኣቕራቢ ሰርዝ",
    deletingSupplierBtn: "ይስረዝ ኣሎ...",

    noSuppliersDb: "ኣብ ዳታቤዝ ዝኾነ ኣቕራቢ ኣይተረኸበን",
    noSuppliersFilter: "ምስ ዝተመረፀ መፃረዪ ዝሰማማዕ ኣቕራቢ የለን",
    noSuppliersDbDesc: "ኩሎም ናይ ጅምላ ነጋዶን ኣቕረብትን ብቐጥታ ካብ PostgreSQL ዳታቤዝ ይፅዓኑ። ነጋዶ ምስ ተመዝገቡ ወይ ሰነዳት ምስ ኣእተዉ ኣብዚ ይረኣዩ።",
    noSuppliersFilterDesc: "ናይ ምድላይ ቃላት ብምፅራግ ወይ መፃረዪታት ብምምላስ ፈትን።",
    refreshDbBtn: "ናይ ኣቕረብቲ ዳታቤዝ ሓድሽ",
    resetFiltersBtn: "መፃረዪታት ኣፅሪ",

    staffModalTitle: "ናይ ጅምላ ኣቕራቢ ሰራሕተኛታትን ፍሊትን ዝርዝር",
    staffModalSubtitle: "ዝተመዝገቡ ሰራሕተኛታት ኣብ፡",
    staffTabAll: "ኩሎም ሰራሕተኛታት",
    staffTabManagers: "ናይ ጨንፈር ኣመሓደርቲ",
    staffTabDrivers: "መዋፈርቲ መኪናን ልኡኻትን",
    colStaffMember: "ሽም ሰራሕተኛ",
    colStaffRole: "ናይ ስራሕ ግደ",
    colStaffBranch: "ዝተመደበሉ ማእኸል / ጨንፈር",
    colStaffContact: "መራኸቢ",
    colStaffStatus: "ኩነታት",
    noStaffFound: "ብዝተመረፀ መፃረዪ ዝኾነ ሰራሕተኛ ኣይተረኸበን።",
    roleManager: "ናይ ጨንፈር ኣመሓዳሪ",
    roleDriver: "መዋፋሪ መኪና / ልኡኽ",
    closeBtn: "ዕፀው",
    doneBtn: "ተወዲኡ",
    staffRosterNote: "ናይ ሰራሕተኛታትን ሎጂስቲክስን ዝርዝር ብቐጥታ ብኣቕራቢ ይተሓዝ።",

    kycModalTitle: "ናይ ጅምላ ነጋዳይ ሕጋዊ ሰነዳትን KYCን ምርመራ",
    kycModalSubtitle: "ዝተኣተዉ ሕጋዊ ሰነዳት መርምር፡",
    docsSectionTitle: "ዝተኣተዉ ሕጋዊ መረጋገፂ ሰነዳት",
    docTradeLicense: "ናይ ንግዲ ስራሕ ፍቓድ (ንግዲ ሚኒስቴር)",
    docTinCertificate: "ናይ ግብሪ ከፋሊ መለለዪ ሰርተፊኬት (TIN)",
    docCommercialRegistration: "ዋና ናይ ንግዲ ምዝገባ ሰርተፊኬት (MOTRI)",
    docOwnerId: "ናይ ዋና / ኣመሓዳሪ ፋይዳ መፍለጢ",
    noDocImage: "ዝተሰቐለ ምስሊ ሰነድ የለን",
    clickToInspectImage: "ምስሊ ብዓቢዩ ንምርኣይ ጠውቕ",
    businessDetailsTitle: "ናይ ትካል ምዝገባ ዝርዝር ሓበሬታ",
    labelCompanyName: "ዝተመዝገበ ሽም ትካል፡",
    labelContactPerson: "ቀንዲ ተፀዋዒ ሰብ፡",
    labelWarehouseHub: "ትክክለኛ ናይ መኽዘን ኣድራሻ፡",
    labelTinNumber: "ቁፅሪ TIN፡",
    labelTradeLicense: "ቁፅሪ ንግዲ ፍቓድ፡",
    rejectionReasonLabel: "ውድቂ ዝተገበረሉ ምኽንያት (ውድቂ እንትግበር ናይ ግዲ እዩ)፡",
    rejectionReasonPlaceholder: "ዝጎደሉ ሰነዳት ወይ ዝተፈጠረ ክፍተት ግለፅ...",
    rejectBtn: "ማመልከቻ ውድቂ ግበር",
    rejectingBtn: "ውድቂ ይገብር ኣሎ...",
    approveBtn: "ኣፅድቕን ኣቕራቢ ኣረጋግፅን",
    approvingBtn: "የረጋግፅ ኣሎ...",

    suspendModalTitle: "ናይ ኣቕራቢ ሕሳብ ዕፀው",
    activateModalTitle: "ናይ ኣቕራቢ ሕሳብ ኣብርህ",
    suspendModalDesc: "እዚ ኣቕራቢ ምዕፃው ናይ ፍርያት መሸጣን ናይ ጅምላ ዝርዝራትን ንግዚኡ ደው የብሎ።",
    activateModalDesc: "እዚ ኣቕራቢ ምብራህ ናይ ፍርያት መሸጣን ናብ ፕላትፎርም ዘለዎ መእተዊን ምሉእ ብምሉእ ይመልሶ።",
    suspensionReasonLabel: "ናይ ምዕፃው ምኽንያት (ኣማራፂ)፡",
    suspensionReasonPlaceholder: "ናይ ሕጊ ጥሕሰት ወይ ናይ ስራሕ ምኽንያት ኣእቱ...",
    confirmSuspendBtn: "ምዕፃው ኣረጋግፅ",
    confirmActivateBtn: "ምብራህ ኣረጋግፅ",
    submittingBtn: "የካይድ ኣሎ...",
    cancelBtn: "ሰርዝ",

    backToListBtn: "ናብ ናይ ኣቕረብቲ ዝርዝር ተመለስ",
    detailBreadcrumbRoot: "ኣቕረብትን ፍሊትን",
    detailTabOverview: "ሓፈሻዊ ርእይቶን ፕሮፋይልን",
    detailTabStaff: "ናይ ሰራሕተኛታትን ፍሊትን ዝርዝር",
    detailTabCatalog: "ናይ ጅምላ ፍርያት ካታሎግ",
    detailTabOrders: "ትእዛዛትን ምዝርጋሕን",
    detailTabAudit: "ናይ ኦዲትን ንጥፈታትን ታሪኽ",
    supplierNotFound: "ናይ ኣቕራቢ ፕሮፋይል ኣይተረኸበን",
    supplierNotFoundDesc: "ዝተሓተተ ናይ ኣቕራቢ መዝገብ ኣይተረኸበን ወይ ካብ ዳታቤዝ ተደምሲሱ እዩ።",
    loadingSupplierDetails: "ናይ ኣቕራቢ ዝርዝር ሓበሬታ የፅዕን ኣሎ...",
    queryingDatabase: "PostgreSQLን ናይ ሰነድ መኽዘንን ይምርምር ኣሎ ን፡",
    verifiedWholesaleBadge: "ዝተረጋገፀ ጅምላ ነጋዳይ",
    registeredOwner: "ዝተመዝገበ ናይ ንግዲ ዋና",
    contactInformation: "ናይ መራኸቢ ሓበሬታ",
    hubWarehouseInfo: "ናይ ማእኸልን መኽዘንን ሓበሬታ",
    financialIdentifiers: "ናይ ፋይናንስን ሕግን መለለዪታት",
    submittedDocsTitle: "ዝቐረቡ ሕጋዊ መረጋገፂ ሰነዳት",
    lightboxTitle: "ወግዓዊ ሕጋዊ ሰነድ ምርመራ",
    downloadDocument: "ዋና ሰነድ ኣውርድ",
    zoomInPrompt: "ብዓቢዩ ንምርኣይ ጠውቕ",

    navGroupCore: "ቀንዲ ስራሕቲ",
    navDashboard: "ዳሽቦርድ",
    navProducts: "ፍርያት",
    navInventory: "መኽዘን ኣመሓድር",
    navPricing: "ዝተሓተ ትእዛዝን ናይ ጅምላ ዋጋን",

    navGroupB2B: "B2B ንግድን ምዕዳግን",
    navSourcing: "ናይ ጅምላ ዕዳጋ",
    navMyOrders: "ናተይ ትእዛዛት (ዕድጊታት)",
    navRFQs: "ናይ ዋጋ ሕቶ ተቐበል (RFQ)",
    navQuotations: "ናይ ዋጋ መቕረቢ ስደድ",
    navNegotiations: "ብዋጋ ተዛረብ",
    navOrders: "ትእዛዛት",
    navCustomers: "ዓደግትን ተጠቀምትን (CRM)",

    navGroupLogistics: "ሎጂስቲክስን ምዝርጋሕን",
    navWarehouse: "መኽዘናትን መዕቆቢታትን",
    navBranches: "ምሕደራ ጨናፍር (ማእከላት)",
    navShipments: "ፅዕነታት ኣዳሉ",

    navGroupFinance: "ፋይናንስን መሸጣን",
    navInvoices: "ደረሰኝ ፍጠር",
    navPayments: "ክፍሊታት",
    navSubscriptions: "ብርክታት ኣባልነት",
    navPromotions: "ምልላይ",

    navGroupSupport: "ደገፍን ዕርቅን",
    navDisputes: "ዘይምርድዳእ",
    navMessages: "መልእኽትታት",
    navNotifications: "መተሓሳሰቢታት",
    navAnalytics: "ትንተና",

    navGroupBusiness: "ናይ ንግዲ ምሕደራ",
    navTeam: "ሰራሕተኛታትን ጉጅለን",
    navProfile: "ናይ ትካል ፕሮፋይልን መረጋገፂን",
    navSettings: "ቅጥዕታት",
    navVerification: "መረጋገፂን ባጃትን",

    headerQuickAction: "ቕልጡፍ ስጉምቲ",
    headerCreateManage: "ፍጠር / ኣመሓድር",
    headerAddNewProduct: "ሓድሽ ፍርያት ወስኽ",
    headerCreateQuotation: "ናይ ዋጋ መቕረቢ ፍጠር",
    headerTransferStock: "ናይ መኽዘን ክምችት ኣመሓላልፍ",
    headerAdjustStock: "መጠን ክምችት ኣዐሪ",
    headerViewRfqs: "ናይ ዋጋ ሕቶታት ርአ",
    headerLiveBadge: "ቀጥታ",
    headerSearchPlaceholder: "ትእዛዛት፣ ናይ ዋጋ ሕቶታት፣ ፍርያት ድለዩ...",
    headerRoleAuthority: "ናይ ስራሕ ሓላፍነት፦",
    headerBranchDepot: "ጨንፈር መኽዘን፦",
    headerBusinessProfile: "ናይ ትካል መገለፂ",
    headerTeamFleet: "ሰራሕተኛታትን መዋፈርትን",
    headerBranchDrivers: "ናይ ጨንፈር መራሕቲ",
    headerDepotsWarehouses: "መኽዘናትን መዕቆቢታትን",
    headerPortalSettings: "ናይ ፖርታል ቅጥዕታት",
    headerSignOut: "ውጻእ",
    headerBranchManager: "ናይ ጨንፈር ኣመሓዳሪ",
    headerSuperSupplierHq: "ቀንዲ ናይ ኣቕራቢ ማእኸል",
    bottomNavMenu: "ዝርዝር",
    bottomNavAddItem: "ፍርያት ወስኽ",
  },
};

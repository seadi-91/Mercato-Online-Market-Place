import type { LanguageCode } from "./translations";

export interface ProductTranslationDictionary {
  // Products View Header & Stats
  pageTitle: string;
  pageSubtitle: string;
  addProductBtn: string;
  activeListingsCount: string;
  statTotalCatalog: string;
  statActiveStock: string;
  statInOrders: string;
  statAvgMargin: string;

  // View modes & filters
  searchPlaceholder: string;
  allStatus: string;
  statusPublished: string;
  statusDraft: string;
  statusPending: string;
  statusOutOfStock: string;
  statusArchived: string;
  allCategories: string;
  sortNewest: string;
  sortTopSales: string;
  sortPriceHigh: string;
  sortPriceLow: string;
  sortMaxStock: string;
  resetFilters: string;
  exportCsv: string;

  // Table Column Headers
  colProductSku: string;
  colPriceMoq: string;
  colStock: string;
  colSalesReviews: string;
  colStatus: string;
  colActions: string;

  // Table Row labels
  moqLabel: string;
  stockLabel: string;
  viewDetails: string;
  editProduct: string;
  moveToDraft: string;
  publishLive: string;
  duplicate: string;
  archiveProduct: string;
  deleteProduct: string;

  // Loading & Empty state
  loadingCatalog: string;
  loadingCatalogDesc: string;
  noProductsFound: string;
  noProductsDesc: string;
  addWholesaleProduct: string;

  // Create / Edit Product Form
  backToCatalog: string;
  titleAddProduct: string;
  titleEditProduct: string;
  btnPreview: string;

  // Wizard Steps
  stepIdentityTitle: string;
  stepIdentitySub: string;
  stepPricingTitle: string;
  stepPricingSub: string;
  stepStockTitle: string;
  stepStockSub: string;
  stepPhotosTitle: string;
  stepPhotosSub: string;

  // Step 1: Identity
  sectionIdentity: string;
  sectionIdentityDesc: string;
  fillSample: string;
  productNameLabel: string;
  productNamePlaceholder: string;
  skuLabel: string;
  brandLabel: string;
  brandPlaceholder: string;
  categoryLabel: string;
  subcategoryLabel: string;
  subcategoryPlaceholder: string;
  originLabel: string;
  originPlaceholder: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  hubLocationLabel: string;

  // Step 2: Pricing
  sectionPricing: string;
  sectionPricingDesc: string;
  basePriceLabel: string;
  moqInputLabel: string;
  unitLabel: string;
  tierPricingTitle: string;
  tierPricingDesc: string;
  addTierBtn: string;
  minQtyLabel: string;
  unitPriceLabel: string;
  discountLabel: string;

  // Step 3: Stock
  sectionStock: string;
  sectionStockDesc: string;
  initialStockLabel: string;
  minStockLabel: string;
  leadTimeDaysLabel: string;
  shippingWeightLabel: string;
  gradeLabel: string;

  // Step 4: Photos
  sectionPhotos: string;
  sectionPhotosDesc: string;
  dragDropTitle: string;
  dragDropSubtitle: string;
  browseFiles: string;
  takePhoto: string;
  addFromUrl: string;
  urlPlaceholder: string;
  coverImageBadge: string;
  setAsCover: string;
  removeImage: string;

  // Form Navigation Buttons
  btnNext: string;
  btnBack: string;
  btnPublish: string;
  btnPublishing: string;
  btnSaveChanges: string;
  btnSaving: string;

  // Common Navigation & Headers
  dashboardBreadcrumb: string;
  productsBreadcrumb: string;
  itemsLabel: string;
  refreshCatalog: string;
  compactTable: string;
  gridCards: string;
  syncingDb: string;
  cancelBtn: string;
  soldCount: string;
  volumeTiers: string;
  lowBadge: string;
  resLabel: string;
  branchScopedNotice: string;
  branchScopedDesc: string;
  branchScopedBadge: string;
  managingInventoryFor: string;
  addForBranch: string;
  statSkus: string;
  statLive: string;
  statLowStock: string;
  statDepotUnits: string;

  // Additional form helpers
  fulfillmentBranchLabel: string;
  branchManagerLocked: string;
  mainSupplierSelectBranch: string;
  autoAssigned: string;
  defaultTier: string;
  noLimit: string;
  depotVerified: string;
  activeStatus: string;
  certificationsLabel: string;
  checklistTitle: string;
  previewTitle: string;
  noPhotosUploaded: string;
  addTierNumbered: string;
}

export const PRODUCT_TRANSLATIONS: Record<LanguageCode, ProductTranslationDictionary> = {
  en: {
    pageTitle: "Commodities & Wholesale Products",
    pageSubtitle: "Manage wholesale commodity listings, tiered pricing, and inventory across logistics hubs.",
    addProductBtn: "Add Wholesale Product",
    activeListingsCount: "Active Listings",
    statTotalCatalog: "Total Catalog Items",
    statActiveStock: "Active B2B Stock",
    statInOrders: "In Orders & Escrow",
    statAvgMargin: "Average Unit Margin",

    searchPlaceholder: "Search by title, SKU, category, origin...",
    allStatus: "All Status",
    statusPublished: "Published",
    statusDraft: "Draft",
    statusPending: "Pending",
    statusOutOfStock: "Out of Stock",
    statusArchived: "Archived",
    allCategories: "All Categories",
    sortNewest: "Newest",
    sortTopSales: "Top Sales",
    sortPriceHigh: "Price: High",
    sortPriceLow: "Price: Low",
    sortMaxStock: "Max Stock",
    resetFilters: "Reset Filters",
    exportCsv: "Export",

    colProductSku: "Product & SKU",
    colPriceMoq: "Wholesale Price & MOQ",
    colStock: "Available Stock",
    colSalesReviews: "Sales & Reviews",
    colStatus: "Status",
    colActions: "Actions",

    moqLabel: "MOQ:",
    stockLabel: "Stock:",
    viewDetails: "View Product Details",
    editProduct: "Edit Product",
    moveToDraft: "Move to Draft",
    publishLive: "Publish Live",
    duplicate: "Duplicate",
    archiveProduct: "Archive Product",
    deleteProduct: "Delete Product",

    loadingCatalog: "Loading Products Catalog...",
    loadingCatalogDesc: "Fetching active wholesale commodities and inventory.",
    noProductsFound: "No Products Found",
    noProductsDesc: "No catalog items match your search and filter criteria. Adjust your filters or add a new wholesale product.",
    addWholesaleProduct: "Add New Wholesale Product",

    backToCatalog: "Back to Catalog",
    titleAddProduct: "Add Wholesale Product",
    titleEditProduct: "Edit Wholesale Commodity",
    btnPreview: "Preview",

    stepIdentityTitle: "Identity",
    stepIdentitySub: "Name & category",
    stepPricingTitle: "Pricing",
    stepPricingSub: "Base & tiers",
    stepStockTitle: "Stock",
    stepStockSub: "Depot inventory",
    stepPhotosTitle: "Photos",
    stepPhotosSub: "Product images",

    sectionIdentity: "Commercial Identity",
    sectionIdentityDesc: "Official catalog naming, SKU, and category classification",
    fillSample: "Fill:",
    productNameLabel: "Product Commercial Name",
    productNamePlaceholder: "e.g. Yirgacheffe Grade 1 Specialty Washed Arabica Coffee",
    skuLabel: "SKU Code",
    brandLabel: "Brand / Producer",
    brandPlaceholder: "e.g. Abyssinia Gold Exporters",
    categoryLabel: "Product Category",
    subcategoryLabel: "Subcategory / Commodity Grade",
    subcategoryPlaceholder: "e.g. Specialty Washed Coffee",
    originLabel: "Origin / Region",
    originPlaceholder: "e.g. Yirgacheffe, Gedeo Zone, Ethiopia",
    descriptionLabel: "Detailed Product Description",
    descriptionPlaceholder: "Detailed specifications, processing standards, grade certifications...",
    hubLocationLabel: "Fulfillment Branch / Warehouse Hub",

    sectionPricing: "B2B Wholesale Pricing & Tiers",
    sectionPricingDesc: "Base unit price and volume tier discount rules",
    basePriceLabel: "Base Wholesale Price (ETB)",
    moqInputLabel: "Minimum Order Quantity (MOQ)",
    unitLabel: "Unit of Measurement",
    tierPricingTitle: "Volume Tier Pricing Discounts",
    tierPricingDesc: "Incentivize bulk B2B purchases with automatic volume tier discounts",
    addTierBtn: "Add Price Tier",
    minQtyLabel: "Min Qty",
    unitPriceLabel: "Unit Price (ETB)",
    discountLabel: "Discount %",

    sectionStock: "Inventory & Fulfillment Warehouse",
    sectionStockDesc: "Stock quantities, minimum buffer, and lead times",
    initialStockLabel: "Initial Stock on Hand",
    minStockLabel: "Low Stock Alert Threshold",
    leadTimeDaysLabel: "Order Lead Time (Days)",
    shippingWeightLabel: "Unit Shipping Weight (KG)",
    gradeLabel: "Commodity Quality Grade",

    sectionPhotos: "Product Photos & Media",
    sectionPhotosDesc: "Upload high-quality photos of the actual wholesale commodity",
    dragDropTitle: "Drag & drop photos here, or click to browse",
    dragDropSubtitle: "High-resolution JPG, PNG, or WebP. Maximum 8 photos.",
    browseFiles: "Upload Photos",
    takePhoto: "Take Photo",
    addFromUrl: "Add Image URL",
    urlPlaceholder: "https://example.com/product-image.jpg",
    coverImageBadge: "Cover Photo",
    setAsCover: "Set as Cover",
    removeImage: "Remove",

    btnNext: "Next Step",
    btnBack: "Back",
    btnPublish: "Publish Product",
    btnPublishing: "Publishing...",
    btnSaveChanges: "Save Changes",
    btnSaving: "Saving...",

    // Common Navigation & Headers
    dashboardBreadcrumb: "Dashboard",
    productsBreadcrumb: "Products",
    itemsLabel: "items",
    refreshCatalog: "Refresh Product Catalog",
    compactTable: "Compact Table View",
    gridCards: "Grid Card View",
    syncingDb: "Syncing DB...",
    cancelBtn: "Cancel",
    soldCount: "sold",
    volumeTiers: "volume tiers",
    lowBadge: "Low",
    resLabel: "Res:",
    branchScopedNotice: "Branch Manager Scoped Catalog",
    branchScopedDesc: "Only products allocated and dispatched to your assigned branch depot are shown.",
    branchScopedBadge: "🔒 Branch Scoped",
    managingInventoryFor: "Managing inventory for",
    addForBranch: "Add for Branch",
    statSkus: "Catalog SKUs",
    statLive: "Live in B2B",
    statLowStock: "Low Stock",
    statDepotUnits: "Total Depot Units",

    // Additional form helpers
    fulfillmentBranchLabel: "Fulfillment Branch / Depot",
    branchManagerLocked: "Branch Manager Locked",
    mainSupplierSelectBranch: "👑 Main Supplier (Select Branch)",
    autoAssigned: "Auto-Assigned",
    defaultTier: "Default Tier",
    noLimit: "No limit (∞)",
    depotVerified: "Depot verified for buyer pickup & freight dispatch",
    activeStatus: "Active",
    certificationsLabel: "Quality Certifications",
    checklistTitle: "Publish Fulfillment Checklist",
    previewTitle: "Buyer Marketplace Preview",
    noPhotosUploaded: "No photos uploaded",
    addTierNumbered: "+ Add Volume Tier",
  },

  am: {
    pageTitle: "የጅምላ ምርቶች እና ሸቀጦች",
    pageSubtitle: "የጅምላ ምርት ዝርዝሮችን፣ የደረጃ ዋጋዎችን እና የመጋዘን ክምችትን ያስተዳድሩ።",
    addProductBtn: "አዲስ የጅምላ ምርት ጨምር",
    activeListingsCount: "ንቁ ምርቶች",
    statTotalCatalog: "አጠቃላይ የካታሎግ ምርቶች",
    statActiveStock: "በስራ ላይ ያለ የ B2B ክምችት",
    statInOrders: "በትዕዛዝ እና በኢስክሮው ውስጥ ያለ",
    statAvgMargin: "አማካይ የአንድ እቃ ትርፍ",

    searchPlaceholder: "በርዕስ፣ በ SKU፣ በምድብ፣ በመነሻ ቦታ ይፈልጉ...",
    allStatus: "ሁሉም ሁኔታዎች",
    statusPublished: "የታተመ (ቀጥታ)",
    statusDraft: "ረቂቅ",
    statusPending: "በመጠባበቅ ላይ",
    statusOutOfStock: "ያለቀ እቃ",
    statusArchived: "የተቀመጠ",
    allCategories: "ሁሉም ምድቦች",
    sortNewest: "አዳዲስ",
    sortTopSales: "ከፍተኛ ሽያጭ",
    sortPriceHigh: "ዋጋ፡ ከከፍተኛ ወደ ዝቅተኛ",
    sortPriceLow: "ዋጋ፡ ከዝቅተኛ ወደ ከፍተኛ",
    sortMaxStock: "ከፍተኛ ክምችት",
    resetFilters: "ማጣሪያዎችን አጽዳ",
    exportCsv: "አውርድ (Export)",

    colProductSku: "ምርት እና የኮድ ቁጥር (SKU)",
    colPriceMoq: "የጅምላ ዋጋ እና አነስተኛ ትዕዛዝ (MOQ)",
    colStock: "ዝግጁ የዕቃ ክምችት",
    colSalesReviews: "ሽያጭ እና ግምገማዎች",
    colStatus: "ሁኔታ",
    colActions: "እርምጃዎች",

    moqLabel: "አነስተኛ ትዕዛዝ (MOQ)፡",
    stockLabel: "ክምችት፡",
    viewDetails: "የምርቱን ዝርዝር ተመልከት",
    editProduct: "ምርቱን አርትዕ",
    moveToDraft: "ወደ ረቂቅ ቀይር",
    publishLive: "በቀጥታ አትም",
    duplicate: "ቅጂ ፍጠር",
    archiveProduct: "ምርቱን አከማች/ሰውር",
    deleteProduct: "ምርቱን ሰርዝ",

    loadingCatalog: "የምርቶች ካታሎግ በመጫን ላይ...",
    loadingCatalogDesc: "ንቁ የጅምላ ምርቶች እና የመጋዘን ክምችት መረጃ በመምጣት ላይ ነው።",
    noProductsFound: "ምንም ምርት አልተገኘም",
    noProductsDesc: "ከፍለጋዎ ወይም ከማጣሪያው ጋር የሚዛመድ ምርት የለም። እባክዎ ማጣሪያውን ያስተካክሉ ወይም አዲስ የጅምላ ምርት ያክሉ።",
    addWholesaleProduct: "አዲስ የጅምላ ምርት ጨምር",

    backToCatalog: "ወደ ካታሎግ ተመለስ",
    titleAddProduct: "አዲስ የጅምላ ምርት ጨምር",
    titleEditProduct: "የጅምላ ምርቱን አርትዕ",
    btnPreview: "ቅድመ እይታ",

    stepIdentityTitle: "መለያ",
    stepIdentitySub: "ስም እና ምድብ",
    stepPricingTitle: "ዋጋ",
    stepPricingSub: "መነሻ እና ደረጃዎች",
    stepStockTitle: "ክምችት",
    stepStockSub: "የመጋዘን ክምችት",
    stepPhotosTitle: "ፎቶዎች",
    stepPhotosSub: "የምርት ምስሎች",

    sectionIdentity: "የንግድ መለያ",
    sectionIdentityDesc: "ይፋዊ የካታሎግ ስያሜ፣ የ SKU መለያ እና የምድብ ምደባ",
    fillSample: "ምሳሌ ሙላ፡",
    productNameLabel: "የምርት ይፋዊ የንግድ ስም",
    productNamePlaceholder: "ምሳሌ፡ ይርጋጨፌ አንደኛ ደረጃ ታጥቦ የተዘጋጀ አረቢካ ቡና",
    skuLabel: "የ SKU መለያ ኮድ",
    brandLabel: "ብራንድ / አምራች",
    brandPlaceholder: "ምሳሌ፡ አቢሲኒያ ወርቅ ላኪዎች",
    categoryLabel: "የምርት ምድብ",
    subcategoryLabel: "ንዑስ ምድብ / የምርት ደረጃ",
    subcategoryPlaceholder: "ምሳሌ፡ ስፔሻሊቲ የታጠበ ቡና",
    originLabel: "መነሻ ክልል / ቦታ",
    originPlaceholder: "ምሳሌ፡ ይርጋጨፌ፣ ጌዴኦ ዞን፣ ኢትዮጵያ",
    descriptionLabel: "ዝርዝር የምርት ማብራሪያ",
    descriptionPlaceholder: "የጥራት ደረጃ፣ የማዘጋጃ ዘዴ፣ የ ECX ሰርተፍኬት እና ዝርዝር መረጃ...",
    hubLocationLabel: "የስርጭት ቅርንጫፍ / መጋዘን ማዕከል",

    sectionPricing: "የ B2B የጅምላ ዋጋ እና ደረጃዎች",
    sectionPricingDesc: "መነሻ የአንድ እቃ ዋጋ እና የብዛት ቅናሽ ደንቦች",
    basePriceLabel: "መነሻ የጅምላ ዋጋ (ብር)",
    moqInputLabel: "አነስተኛ የትዕዛዝ መጠን (MOQ)",
    unitLabel: "የመለኪያ አሃድ",
    tierPricingTitle: "የብዛት ቅናሽ የዋጋ ደረጃዎች",
    tierPricingDesc: "ለጅምላ ገዢዎች በብዛት ሲገዙ ራስ-ሰር የዋጋ ቅናሽ ደረጃዎችን ያዘጋጁ",
    addTierBtn: "አዲስ የዋጋ ደረጃ ጨምር",
    minQtyLabel: "አነስተኛ ብዛት",
    unitPriceLabel: "የአንድ እቃ ዋጋ (ብር)",
    discountLabel: "ቅናሽ %",

    sectionStock: "የዕቃ ክምችት እና የስርጭት መጋዘን",
    sectionStockDesc: "የክምችት መጠን፣ የአነስተኛ ክምችት ማስጠንቀቂያ እና የማዘጋጃ ቀናት",
    initialStockLabel: "በመጋዘን የሚገኝ የመጀመሪያ ክምችት",
    minStockLabel: "የአነስተኛ ክምችት ማስጠንቀቂያ መጠን",
    leadTimeDaysLabel: "የትዕዛዝ ማዘጋጃ ጊዜ (ቀናት)",
    shippingWeightLabel: "የአንድ እቃ የመላኪያ ክብደት (ኪ.ግ)",
    gradeLabel: "የጥራት ደረጃ",

    sectionPhotos: "የምርት ፎቶዎች እና ምስሎች",
    sectionPhotosDesc: "ትክክለኛውን የጅምላ ምርት የሚያሳዩ ጥራት ያላቸው ፎቶዎችን ይጫኑ",
    dragDropTitle: "ፎቶዎችን እዚህ ይጎትቱ ወይም ለመምረጥ ይጫኑ",
    dragDropSubtitle: "ጥራት ያለው JPG፣ PNG ወይም WebP። ቢበዛ 8 ፎቶዎች።",
    browseFiles: "ፎቶዎችን ጫን",
    takePhoto: "ፎቶ አንሳ",
    addFromUrl: "የምስል አድራሻ አስገባ",
    urlPlaceholder: "https://example.com/product-image.jpg",
    coverImageBadge: "ዋና ፎቶ",
    setAsCover: "ዋና ፎቶ አድርግ",
    removeImage: "አስወግድ",

    btnNext: "ቀጣይ እርምጃ",
    btnBack: "ተመለስ",
    btnPublish: "ምርቱን መዝግብ/አትም",
    btnPublishing: "በመመዝገብ ላይ...",
    btnSaveChanges: "ለውጦችን አስቀምጥ",
    btnSaving: "በማስቀመጥ ላይ...",

    // Common Navigation & Headers
    dashboardBreadcrumb: "ዳሽቦርድ",
    productsBreadcrumb: "ምርቶች",
    itemsLabel: "ዕቃዎች",
    refreshCatalog: "የምርት ካታሎግን አድስ",
    compactTable: "አነስተኛ የሰንጠረዥ እይታ",
    gridCards: "የካርድ እይታ",
    syncingDb: "ከመረጃ ቋት ጋር በማመሳሰል ላይ...",
    cancelBtn: "ሰርዝ",
    soldCount: "ተሽጧል",
    volumeTiers: "የጅምላ ቅናሽ ደረጃዎች",
    lowBadge: "አነስተኛ",
    resLabel: "የተያዘ:",
    branchScopedNotice: "የቅርንጫፍ አስተዳዳሪ ካታሎግ",
    branchScopedDesc: "ለእርስዎ ቅርንጫፍ የተመደቡ እና የተለቀቁ ምርቶች ብቻ ይታያሉ። የሌሎች ቅርንጫፎች ምርቶች ተደብቀዋል።",
    branchScopedBadge: "🔒 የቅርንጫፍ ወሰን",
    managingInventoryFor: "ክምችት የሚያስተዳድሩት ለ፡",
    addForBranch: "ለቅርንጫፍ ጨምር",
    statSkus: "የካታሎግ SKUዎች",
    statLive: "በB2B ላይ ንቁ",
    statLowStock: "አነስተኛ ክምችት",
    statDepotUnits: "ጠቅላላ የመጋዘን አሃዶች",

    // Additional form helpers
    fulfillmentBranchLabel: "የሚለጠፍበት ቅርንጫፍ / መጋዘን",
    branchManagerLocked: "የቅርንጫፍ አስተዳዳሪ ተቆልፏል",
    mainSupplierSelectBranch: "👑 ዋና አቅራቢ (ቅርንጫፍ ይምረጡ)",
    autoAssigned: "በራስ-ሰር የተመደበ",
    defaultTier: "መደበኛ ደረጃ",
    noLimit: "ወሰን የለውም (∞)",
    depotVerified: "መጋዘኑ ለደንበኛ ማንሻ እና ለጭነት ዝግጁ ሆኖ ተረጋግጧል",
    activeStatus: "ንቁ",
    certificationsLabel: "የጥራት ማረጋገጫ ምስክር ወረቀቶች",
    checklistTitle: "የማተሚያ ቅድመ-ዝግጅት ማረጋገጫ",
    previewTitle: "የገዢ የገበያ ቅድመ-እይታ",
    noPhotosUploaded: "ምንም ፎቶ አልተጫነም",
    addTierNumbered: "+ የጅምላ ዋጋ ደረጃ ጨምር",
  },

  om: {
    pageTitle: "Oomishaalee fi Meeshaalee Jumlaa",
    pageSubtitle: "Tarree oomishaalee jumlaa, gatii sadarkaalee fi kuusaa meeshaalee bulchaa.",
    addProductBtn: "Oomisha Jumlaa Haaraa Dabali",
    activeListingsCount: "Tarree Hojiirra Jiru",
    statTotalCatalog: "Waliigala Oomishaalee Kaatalaagii",
    statActiveStock: "Kuusaa B2B Hojiirra Jiru",
    statInOrders: "Ajaja fi Eeggannoo Keessatti",
    statAvgMargin: "Garaagarummaa Bu'aa Giddu-galeessaa",

    searchPlaceholder: "Mata-dureen, SKU, kutaadhaan, bakka dhalootaan barbaadi...",
    allStatus: "Haala Hunda",
    statusPublished: "Maxxanfame",
    statusDraft: "Wixinee",
    statusPending: "Eeggachaa Jira",
    statusOutOfStock: "Kan Dhumate",
    statusArchived: "Kuufame",
    allCategories: "Kutaalee Hunda",
    sortNewest: "Haaraa",
    sortTopSales: "Gurgurtaa Guddaa",
    sortPriceHigh: "Gatii: Ol'aanaa",
    sortPriceLow: "Gatii: Gadi'aanaa",
    sortMaxStock: "Kuusaa Guddaa",
    resetFilters: "Calaltuuwwan Deebisi",
    exportCsv: "Baasi (Export)",

    colProductSku: "Oomisha fi SKU",
    colPriceMoq: "Gatii Jumlaa fi MOQ",
    colStock: "Kuusaa Jiru",
    colSalesReviews: "Gurgurtaa fi Yaada",
    colStatus: "Haala",
    colActions: "Tarkaanfiiwwan",

    moqLabel: "MOQ:",
    stockLabel: "Kuusaa:",
    viewDetails: "Bal'ina Oomishaa Ilaali",
    editProduct: "Oomisha Gulaali",
    moveToDraft: "Gara Wixineetti Jijjiiri",
    publishLive: "Kallattiin Maxxansi",
    duplicate: "Koppii Hojiirra Oolchi",
    archiveProduct: "Oomisha Kuusi",
    deleteProduct: "Oomisha Balleessi",

    loadingCatalog: "Kaatalaagiin Oomishaa Fe'amaa Jira...",
    loadingCatalogDesc: "Oomishaaleen jumlaa fi kuusaan hojiirra jiru dhihaachaa jiru.",
    noProductsFound: "Oomishni Hin Argamne",
    noProductsDesc: "Oomishni ulaagaa barbaacha keessaniin wal simu hin argamne. Calaltuu sirreessaa ykn oomisha haaraa dabalaa.",
    addWholesaleProduct: "Oomisha Jumlaa Haaraa Dabali",

    backToCatalog: "Gara Kaatalaagiitti Deebi'i",
    titleAddProduct: "Oomisha Jumlaa Haaraa Dabali",
    titleEditProduct: "Oomisha Jumlaa Gulaali",
    btnPreview: "Dur-argii",

    stepIdentityTitle: "Eenyummaa",
    stepIdentitySub: "Maqaa fi kutaa",
    stepPricingTitle: "Gatii",
    stepPricingSub: "Bu'uura fi sadarkaalee",
    stepStockTitle: "Kuusaa",
    stepStockSub: "Kuusaa buufataa",
    stepPhotosTitle: "Suuraawwan",
    stepPhotosSub: "Suuraawwan oomishaa",

    sectionIdentity: "Eenyummaa Daldalaa",
    sectionIdentityDesc: "Maqaa kaatalaagii seeraa, koodii SKU fi ramaddii kutaa",
    fillSample: "Fakkeenya Guuti:",
    productNameLabel: "Maqaa Daldala Oomishaa",
    productNamePlaceholder: "fk. Buna Arabikaa Qulqulluu Sadarkaa 1ffaa Yirgacaffee",
    skuLabel: "Koodii SKU",
    brandLabel: "Asxaa / Oomishtuu",
    brandPlaceholder: "fk. Abisiiniyaa Warqee Ergituu",
    categoryLabel: "Kutaa Oomishaa",
    subcategoryLabel: "Kutaa Xiqqaa / Sadarkaa Qulqullinaa",
    subcategoryPlaceholder: "fk. Buna Dhiqamee Qophaa'e",
    originLabel: "Bakka Dhalootaa / Naannoo",
    originPlaceholder: "fk. Yirgacaffee, Zoonii Geediyoo, Itoophiyaa",
    descriptionLabel: "Ibsa Oomishaa Bal'aa",
    descriptionPlaceholder: "Qulqullina, haala qophii, waraqaa ragaa ECX fi ibsa gabaabaa...",
    hubLocationLabel: "Damee Raabsaa / Buufata Kuusaa",

    sectionPricing: "Gatii Jumlaa B2B fi Sadarkaalee",
    sectionPricingDesc: "Gatii tokkoon tokkoo fi seerota hir'ifama gatii",
    basePriceLabel: "Gatii Jumlaa Bu'uuraa (ETB)",
    moqInputLabel: "Hamma Ajaja Xiqqaa (MOQ)",
    unitLabel: "Safartuu",
    tierPricingTitle: "Hir'ifama Gatii Sadarkaalee Baay'inaa",
    tierPricingDesc: "Bittoota jumlaaf yeroo baay'inaan bitan hir'ifama gatii qindeessaa",
    addTierBtn: "Sadarkaa Gatii Dabali",
    minQtyLabel: "Hamma Xiqqaa",
    unitPriceLabel: "Gatii Tokkoo (ETB)",
    discountLabel: "Hir'ifama %",

    sectionStock: "Kuusaa fi Buufata Raabsaa",
    sectionStockDesc: "Hamma kuusaa, akeekkachiisa kuusaa xiqqaa fi guyyoota qophii",
    initialStockLabel: "Kuusaa Jalqabaa Harka Irra Jiru",
    minStockLabel: "Akeekkachiisa Kuusaa Xiqqaa",
    leadTimeDaysLabel: "Yeroo Ajaja Qopheessuu (Guyyoota)",
    shippingWeightLabel: "Ulfaatina Ergaa Tokkoo (KG)",
    gradeLabel: "Sadarkaa Qulqullina Oomishaa",

    sectionPhotos: "Suuraawwan fi Miidiyaa Oomishaa",
    sectionPhotosDesc: "Suuraawwan qulqullina qaban kan oomisha jumlaa sirrii olkaa'aa",
    dragDropTitle: "Suuraawwan asitti harkisaa, yookiin filachuuf cuqaasaa",
    dragDropSubtitle: "JPG, PNG ykn WebP qulqullina olaanaa. Hanga suuraawwan 8.",
    browseFiles: "Suuraawwan Olkaa'i",
    takePhoto: "Suuraa Kaasi",
    addFromUrl: "Teessoo Suuraa Galchi",
    urlPlaceholder: "https://example.com/product-image.jpg",
    coverImageBadge: "Suuraa Jalqabaa",
    setAsCover: "Suuraa Jalqabaa Taasisi",
    removeImage: "Balleessi",

    btnNext: "Tarkaanfii Itti Aanu",
    btnBack: "Duubatti",
    btnPublish: "Oomisha Maxxansi",
    btnPublishing: "Maxxansaa jira...",
    btnSaveChanges: "Jijjiirama Olkaa'i",
    btnSaving: "Olkaa'aa jira...",

    // Common Navigation & Headers
    dashboardBreadcrumb: "Daashboordii",
    productsBreadcrumb: "Oomishaalee",
    itemsLabel: "mi'oota",
    refreshCatalog: "Kaatalaagii Oomishaa Haaromsi",
    compactTable: "Ilaalcha Gabatee Qindaa'aa",
    gridCards: "Ilaalcha Kaardii",
    syncingDb: "Kuusaa deetaa waliin wal simsiisaa jira...",
    cancelBtn: "Haqi",
    soldCount: "gurgurame",
    volumeTiers: "sadarkaa gatii hedduminaa",
    lowBadge: "Xiqqaate",
    resLabel: "Qabame:",
    branchScopedNotice: "Kaatalaagii Daangaa Hogganaa Damee",
    branchScopedDesc: "Oomishaaleen damee keessaniif ramadamanii fi gadhiifaman qofti mul'atu.",
    branchScopedBadge: "🔒 Daangaa Damee",
    managingInventoryFor: "Kuusaa kan bulchaa jirtan:",
    addForBranch: "Dameef Dabali",
    statSkus: "SKUwwan Kaatalaagii",
    statLive: "B2B Keessatti Hojirra",
    statLowStock: "Kuusaa Xiqqaate",
    statDepotUnits: "Ida'ama Yuuniitii Kuusaa",

    // Additional form helpers
    fulfillmentBranchLabel: "Damee Raabsaa / Buufata Kuusaa",
    branchManagerLocked: "Hogganaa Dameen Cufameera",
    mainSupplierSelectBranch: "👑 Dhiheessaa Guddaa (Damee Filadhu)",
    autoAssigned: "Ofiin Ramadame",
    defaultTier: "Sadarkaa Idilee",
    noLimit: "Daangaa malee (∞)",
    depotVerified: "Buufanni kuusaa meeshaa fudhachuu fi fe'uuf qophaa'uun mirkanaa'eera",
    activeStatus: "Hojirra",
    certificationsLabel: "Waraqaa Ragaa Qulqullinaa",
    checklistTitle: "Ulaagaa Maxxansaa Duraa",
    previewTitle: "Dur-argii Gabaa Bitaa",
    noPhotosUploaded: "Suuraan hin fe'amne",
    addTierNumbered: "+ Sadarkaa Gatii Jumlaa Dabali",
  },

  ti: {
    pageTitle: "ናይ ጅምላ ፍርያትን ሸቐጣሸቐጥን",
    pageSubtitle: "ናይ ጅምላ ፍርያት ዝርዝራት፣ ናይ ብርኪ ዋጋታትን ናይ መኽዘን ዕቑርን ኣመሓድር።",
    addProductBtn: "ሓዱሽ ናይ ጅምላ ፍርያት ወስኽ",
    activeListingsCount: "ንጡፋት ፍርያት",
    statTotalCatalog: "ሓፈሻዊ ናይ ካታሎግ ፍርያት",
    statActiveStock: "ኣብ ስራሕ ዘሎ B2B ዕቑር",
    statInOrders: "ኣብ ትእዛዝን ኢስክሮውን ዘሎ",
    statAvgMargin: "ማእከላይ ናይ ሓደ እታው መኽሰብ",

    searchPlaceholder: "ብኣርእስቲ፣ SKU፣ ምድብ፣ መበቆል ድለ...",
    allStatus: "ኩሎም ኩነታት",
    statusPublished: "ዝተሓትመ (ቀጥታ)",
    statusDraft: "ረቒቕ",
    statusPending: "ይፅበ ኣሎ",
    statusOutOfStock: "ዝተወድአ",
    statusArchived: "ዝተዓቀበ",
    allCategories: "ኩሎም ምድባት",
    sortNewest: "ሓደሽቲ",
    sortTopSales: "ዝለዓለ መሸጣ",
    sortPriceHigh: "ዋጋ፡ ካብ ላዕሊ ናብ ታሕቲ",
    sortPriceLow: "ዋጋ፡ ካብ ታሕቲ ናብ ላዕሊ",
    sortMaxStock: "ዝለዓለ ዕቑር",
    resetFilters: "መፃረዪታት ኣፅሪ",
    exportCsv: "ኣውርድ (Export)",

    colProductSku: "ፍርያትን SKUን",
    colPriceMoq: "ናይ ጅምላ ዋጋን MOQን",
    colStock: "ዘሎ ናይ ዕቑር መጠን",
    colSalesReviews: "መሸጣን ገምጋማትን",
    colStatus: "ኩነታት",
    colActions: "ስጉምትታት",

    moqLabel: "ውሑድ ትእዛዝ (MOQ)፡",
    stockLabel: "ዕቑር፡",
    viewDetails: "ናይ ፍርያት ዝርዝር ርአ",
    editProduct: "ፍርያት ኣመዓራሪ",
    moveToDraft: "ናብ ረቒቕ ቀይር",
    publishLive: "ብቐጥታ ኣውፅእ",
    duplicate: "ቅዳሕ ፍጠር",
    archiveProduct: "ፍርያት ዓቅብ",
    deleteProduct: "ፍርያት ደምስስ",

    loadingCatalog: "ናይ ፍርያት ካታሎግ የፅዕን ኣሎ...",
    loadingCatalogDesc: "ንጡፋት ናይ ጅምላ ፍርያትን ናይ መኽዘን ዕቑርን ሓበሬታ ይመፅእ ኣሎ።",
    noProductsFound: "ዝኾነ ፍርያት ኣይተረኸበን",
    noProductsDesc: "ምስ ዝተመረፀ መፃረዪ ዝሰማማዕ ፍርያት የለን። መፃረዪኻ ኣመዓራሪ ወይ ሓዱሽ ፍርያት ወስኽ።",
    addWholesaleProduct: "ሓዱሽ ናይ ጅምላ ፍርያት ወስኽ",

    backToCatalog: "ናብ ካታሎግ ተመለስ",
    titleAddProduct: "ሓዱሽ ናይ ጅምላ ፍርያት ወስኽ",
    titleEditProduct: "ናይ ጅምላ ፍርያት ኣመዓራሪ",
    btnPreview: "ቅድመ ርእይቶ",

    stepIdentityTitle: "መለለዪ",
    stepIdentitySub: "ሽምን ምድብን",
    stepPricingTitle: "ዋጋ",
    stepPricingSub: "መበገሲን ብርክታትን",
    stepStockTitle: "ዕቑር",
    stepStockSub: "ናይ መኽዘን ዕቑር",
    stepPhotosTitle: "ስእልታት",
    stepPhotosSub: "ናይ ፍርያት ስእልታት",

    sectionIdentity: "ናይ ንግዲ መለለዪ",
    sectionIdentityDesc: "ወግዓዊ ስያመ ካታሎግ፣ መለለዪ SKUን ምደባ ምድብን",
    fillSample: "ኣብነት ምላእ፡",
    productNameLabel: "ናይ ፍርያት ወግዓዊ ንግዲ ሽም",
    productNamePlaceholder: "ንኣብነት፡ ይርጋጨፌ ቀዳማይ ብርኪ ዝተሓፀበ ቡን ዓረብ",
    skuLabel: "ናይ SKU መለለዪ ኮድ",
    brandLabel: "ብራንድ / ኣፍራዪ",
    brandPlaceholder: "ንኣብነት፡ ኣቢሲንያ ወርቂ ለኣኽቲ",
    categoryLabel: "ናይ ፍርያት ምድብ",
    subcategoryLabel: "ንኡስ ምድብ / ናይ ፍርያት ብርኪ",
    subcategoryPlaceholder: "ንኣብነት፡ ስፔሻሊቲ ዝተሓፀበ ቡን",
    originLabel: "መበቆል ዞባ / ቦታ",
    originPlaceholder: "ንኣብነት፡ ይርጋጨፌ፣ ጌዴኦ ዞባ፣ ኢትዮጵያ",
    descriptionLabel: "ዝርዝር ናይ ፍርያት መግለፂ",
    descriptionPlaceholder: "ናይ ፅሬት ብርኪ፣ ኣሰራርሓ፣ ናይ ECX መረጋገፂን ዝርዝር ሓበሬታን...",
    hubLocationLabel: "ናይ ምዝርጋሕ ጨንፈር / መኽዘን ማእኸል",

    sectionPricing: "B2B ናይ ጅምላ ዋጋን ብርክታትን",
    sectionPricingDesc: "መበገሲ ዋጋ ሓደ እታውን ናይ መጠን ቅናሽ ሕግታትን",
    basePriceLabel: "መበገሲ ናይ ጅምላ ዋጋ (ETB)",
    moqInputLabel: "ዝተሓተ ናይ ትእዛዝ መጠን (MOQ)",
    unitLabel: "ናይ መዐቀኒ ኣሃዱ",
    tierPricingTitle: "ናይ መጠን ቅናሽ ዋጋ ብርክታት",
    tierPricingDesc: "ዓደግቲ ብብዝሒ ክገዝኡ ንምትብባዕ ኣውቶማቲክ ናይ ዋጋ ቅናሽ ብርክታት ኣዋድድ",
    addTierBtn: "ሓዱሽ ናይ ዋጋ ብርኪ ወስኽ",
    minQtyLabel: "ዝተሓተ መጠን",
    unitPriceLabel: "ዋጋ ሓደ እታው (ETB)",
    discountLabel: "ቅናሽ %",

    sectionStock: "ናይ ዕቑርን ምዝርጋሕን መኽዘን",
    sectionStockDesc: "ናይ ዕቑር መጠን፣ መተሓሳሰቢ ዝተሓተ ዕቑርን ናይ ምድላው መዓልታትን",
    initialStockLabel: "ኣብ መኽዘን ዘሎ መበገሲ ዕቑር",
    minStockLabel: "ናይ ዝተሓተ ዕቑር መጠን መተሓሳሰቢ",
    leadTimeDaysLabel: "ትእዛዝ ናይ ምድላው ግዜ (መዓልታት)",
    shippingWeightLabel: "ናይ ሓደ እታው ክብደት (KG)",
    gradeLabel: "ናይ ፅሬት ብርኪ",

    sectionPhotos: "ናይ ፍርያት ስእልታትን ሚድያን",
    sectionPhotosDesc: "ትክክለኛ ናይ ጅምላ ፍርያት ዘርእዩ ፅሩያት ስእልታት ፅዓን",
    dragDropTitle: "ስእልታት ናብዚ ስሓብ፣ ወይ ንምምራፅ ጠውቕ",
    dragDropSubtitle: "ፅሩይ JPG፣ PNG ወይ WebP። ብዝበዝሐ 8 ስእልታት።",
    browseFiles: "ስእልታት ፅዓን",
    takePhoto: "ስእሊ ኣልዕል",
    addFromUrl: "ናይ ስእሊ ሊንክ (URL) ኣእቱ",
    urlPlaceholder: "https://example.com/product-image.jpg",
    coverImageBadge: "ዋና ስእሊ",
    setAsCover: "ዋና ስእሊ ግበር",
    removeImage: "ኣወግድ",

    btnNext: "ቀፃሊ ስጉምቲ",
    btnBack: "ተመለስ",
    btnPublish: "ፍርያት ኣውፅእ",
    btnPublishing: "የውፅእ ኣሎ...",
    btnSaveChanges: "ለውጥታት ዓቅብ",
    btnSaving: "የዕቅብ ኣሎ...",

    // Common Navigation & Headers
    dashboardBreadcrumb: "ዳሽቦርድ",
    productsBreadcrumb: "ፍርያት",
    itemsLabel: "ንብረታት",
    refreshCatalog: "ናይ ፍርያት ካታሎግ ኣሐድስ",
    compactTable: "ናይ ሰደቓ ርእይቶ",
    gridCards: "ናይ ካርድታት ርእይቶ",
    syncingDb: "ምስ ዳታቤዝ የዛምድ ኣሎ...",
    cancelBtn: "ሰርዝ",
    soldCount: "ተሸይጡ",
    volumeTiers: "ደረጃታት ቅናሽ ብዝሒ",
    lowBadge: "ውሑድ",
    resLabel: "ዝተታሕዘ:",
    branchScopedNotice: "ናይ ጨንፈር ኣመሓዳሪ ካታሎግ",
    branchScopedDesc: "ንጨንፈርኩም ዝተመደበን ዝተለቐቐን ፍርያት ጥራሕ ይርአ። ናይ ካልኦት ጨናፍር ፍርያት ተሓቢኡ ኣሎ።",
    branchScopedBadge: "🔒 ናይ ጨንፈር ወሰን",
    managingInventoryFor: "ዕቑር ተመሓድሩ ዘለኹም ን፡",
    addForBranch: "ንጨንፈር ወስኽ",
    statSkus: "ናይ ካታሎግ SKUs",
    statLive: "ኣብ B2B ንጡፍ",
    statLowStock: "ውሑድ ዕቑር",
    statDepotUnits: "ጠቕላላ ዩኒት መኽዘን",

    // Additional form helpers
    fulfillmentBranchLabel: "ዝዝርጋሓሉ ጨንፈር / መኽዘን",
    branchManagerLocked: "ናይ ጨንፈር ኣመሓዳሪ ተዓፅዩ",
    mainSupplierSelectBranch: "👑 ቀንዲ ኣቕራቢ (ጨንፈር ምረፁ)",
    autoAssigned: "ብባዕሉ ዝተመደበ",
    defaultTier: "ቀንዲ ብርኪ",
    noLimit: "ወሰን የብሉን (∞)",
    depotVerified: "መኽዘን ንዓደግቲ ምርካብን ንፅዕነትን ዝተረጋገፀ እዩ",
    activeStatus: "ንጡፍ",
    certificationsLabel: "ናይ ፅሬት መረጋገፂ ምስክር ወረቐት",
    checklistTitle: "ናይ ሕታም ቅድመ-ምድላው መረጋገፂ",
    previewTitle: "ናይ ዓዳጊ ዕዳጋ ቅድመ-ርእይቶ",
    noPhotosUploaded: "ስእሊ ኣይተፃዕነን",
    addTierNumbered: "+ ናይ ጅምላ ዋጋ ብርኪ ወስኽ",
  },
};

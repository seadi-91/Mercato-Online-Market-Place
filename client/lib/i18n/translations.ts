export type LanguageCode = "en" | "am" | "om" | "ti";

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  shortLabel: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    shortLabel: "EN",
    flag: "🇺🇸",
  },
  {
    code: "am",
    name: "Amharic",
    nativeName: "አማርኛ",
    shortLabel: "አማ",
    flag: "🇪🇹",
  },
  {
    code: "om",
    name: "Oromo",
    nativeName: "Afaan Oromoo",
    shortLabel: "OR",
    flag: "🇪🇹",
  },
  {
    code: "ti",
    name: "Tigrinya",
    nativeName: "ትግርኛ",
    shortLabel: "ትግ",
    flag: "🇪🇹",
  },
];

export interface TranslationSchema {
  nav: {
    home: string;
    marketplace: string;
    categories: string;
    adminDashboard: string;
    supplierDashboard: string;
    sellerDashboard: string;
    cart: string;
    favorites: string;
    saved: string;
    signIn: string;
    register: string;
    myAccount: string;
    orders: string;
    profile: string;
    settings: string;
    logout: string;
    rfq: string;
    wholesale: string;
    retail: string;
    explore: string;
  };
  header: {
    searchPlaceholder: string;
    allDepts: string;
    tradeBanner: string;
    language: string;
    selectLanguage: string;
    welcome: string;
    deals: string;
    zones: string;
    appearance: string;
    escrowBadge: string;
  };
  common: {
    save: string;
    cancel: string;
    clear: string;
    filter: string;
    apply: string;
    reset: string;
    viewAll: string;
    loading: string;
    addToCart: string;
    buyNow: string;
    inStock: string;
    outOfStock: string;
    price: string;
    rating: string;
    qty: string;
    total: string;
    subtotal: string;
    status: string;
    date: string;
    actions: string;
    close: string;
    back: string;
    remove: string;
    edit: string;
    share: string;
  };
  auth: {
    signInTitle: string;
    signInSubtitle: string;
    identifierLabel: string;
    identifierPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    rememberMe: string;
    forgotPassword: string;
    signInBtn: string;
    orContinueWith: string;
    googleBtn: string;
    githubBtn: string;
    noAccount: string;
    createAccount: string;
    returnHome: string;
    registerTitle: string;
    registerSubtitle: string;
    selectRole: string;
    customerRole: string;
    sellerRole: string;
    supplierRole: string;
    fullName: string;
    phone: string;
    email: string;
    confirmPassword: string;
    agreeTerms: string;
    registerBtn: string;
    haveAccount: string;
    capsLock: string;
    cooldown: string;
    accountBlocked: string;
    contactAdmin: string;
    valIdentifier: string;
    valPassword: string;
    valPasswordLen: string;
    customerRoleTitle: string;
    customerRoleBadge: string;
    customerRoleDesc: string;
    customerFeat1: string;
    customerFeat2: string;
    customerFeat3: string;
    sellerRoleTitle: string;
    sellerRoleBadge: string;
    sellerRoleDesc: string;
    sellerFeat1: string;
    sellerFeat2: string;
    sellerFeat3: string;
    supplierRoleTitle: string;
    supplierRoleBadge: string;
    supplierRoleDesc: string;
    supplierFeat1: string;
    supplierFeat2: string;
    supplierFeat3: string;
    socialRegistersAs: string;
    orChooseAccountType: string;
    courierPartnerNotice: string;
    courierPartnerDesc: string;
    continueAs: string;
    changeAccountType: string;
    accountTypeSuffix: string;
    customerRegDesc: string;
    sellerRegDesc: string;
    supplierRegDesc: string;
  };
  marketplace: {
    title: string;
    subtitle: string;
    all: string;
    wholesaleOnly: string;
    retailOnly: string;
    sortBy: string;
    featured: string;
    priceLowHigh: string;
    priceHighLow: string;
    topRated: string;
    filters: string;
    clearAll: string;
    showingResults: string;
    escrowProtected: string;
    noProductsFound: string;
    customerReviews: string;
    departments: string;
    sourcingMode: string;
    moqLabel: string;
    customPrice: string;
    min: string;
    max: string;
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    shopMarketplace: string;
    browseCategories: string;
    featuredProducts: string;
    topSuppliers: string;
    dailyDeals: string;
    viewAll: string;
    whyChooseUs: string;
    fastDelivery: string;
    safeEscrow: string;
    authenticGuaranteed: string;
    popularDepartments: string;
    youMayAlsoLike: string;
    seeAll: string;
    viewProduct: string;
    exploreStore: string;
    scrollDown: string;
    localPayments: string;
    localPaymentsDesc: string;
    latestProducts: string;
    latestProductsSub: string;
    exploreAll: string;
    acrossAddis: string;
    fromSuppliers: string;
    escrowGuarantee: string;
  };
  categories: {
    title: string;
    subtitle: string;
    allCategories: string;
    viewProducts: string;
    itemsCount: string;
    trendingInAddis: string;
    exploreCollections: string;
    exploreVerified: string;
  };
  cart: {
    title: string;
    empty: string;
    emptySub: string;
    checkout: string;
    continueShopping: string;
    orderSummary: string;
    deliveryFee: string;
    freeDeliveryNotice: string;
    freeBadge: string;
    itemsCount: string;
    browseMarketplace: string;
    clearCart: string;
    youMayAlsoLike: string;
    productsInOrder: string;
    deliveringTo: string;
    unitPrice: string;
    color: string;
    size: string;
    viewMore: string;
    viewLess: string;
    escrowGuaranteeNotice: string;
    curatedPicks: string;
  };
  favorites: {
    title: string;
    subtitle: string;
    empty: string;
    emptySub: string;
    clearAll: string;
    moveToCart: string;
    browseMarketplace: string;
    personalWishlist: string;
    savedCount: string;
    exploreMarketplace: string;
    addAllToCart: string;
    quickView: string;
    showingFavorites: string;
    loadDemoItems: string;
    recommendedForYou: string;
    trendingWishlist: string;
  };
  orders: {
    title: string;
    subtitle: string;
    empty: string;
    emptySub: string;
    orderId: string;
    orderDate: string;
    items: string;
    paymentStatus: string;
    deliveryStatus: string;
    totalAmount: string;
    viewDetails: string;
    trackOrder: string;
    statusDelivered: string;
    statusProcessing: string;
    statusPending: string;
    statusShipped: string;
    statusCancelled: string;
    paymentId: string;
    totalPrice: string;
    detailsTitle: string;
    buyerProtected: string;
    orderedOn: string;
    paymentIdentification: string;
    paidInEscrow: string;
    doorstepDelivery: string;
    recipientName: string;
    phoneForOtp: string;
    city: string;
    subcity: string;
    specificAddress: string;
    orderedProducts: string;
    quantity: string;
    subtotalPrice: string;
    courierFee: string;
    freeBadge: string;
    escrowProtocol: string;
    totalPaid: string;
    printReceipt: string;
    deleteOrder: string;
    closeModal: string;
    copyTx: string;
    copiedTx: string;
    confirmedPaid: string;
    inTransit: string;
  };
  card: {
    title: string;
    subtitle: string;
    balance: string;
    topUp: string;
    cardNumber: string;
    validThru: string;
    cardHolder: string;
    recentTransactions: string;
    benefits: string;
    cashback: string;
    freezeCard: string;
    unfreezeCard: string;
    applyCard: string;
  };
  product: {
    addToCart: string;
    buyNow: string;
    outOfStock: string;
    inStock: string;
    verifiedMerchant: string;
    escrowProtected: string;
    reviews: string;
    rating: string;
    description: string;
    specifications: string;
    relatedProducts: string;
    minOrder: string;
    directEthioTrade: string;
    soldOut: string;
    quickView: string;
    onlyLeft: string;
  };
  footer: {
    newsletterTitle: string;
    newsletterSubtitle: string;
    subscribeBtn: string;
    placeholderEmail: string;
    aboutPlatform: string;
    company: string;
    aboutUs: string;
    careers: string;
    press: string;
    customerService: string;
    helpCenter: string;
    contactUs: string;
    shippingInfo: string;
    returnsRefunds: string;
    legal: string;
    termsOfService: string;
    privacyPolicy: string;
    security: string;
    allRightsReserved: string;
    tagline: string;
  };
  toast: {
    languageChanged: string;
  };
  checkout: {
    title: string;
    breadcrumbCart: string;
    breadcrumbCheckout: string;
    protectionGuarantee: string;
    loadingSession: string;
    cartEmptyTitle: string;
    cartEmptySub: string;
    exploreMarketplace: string;
    customerInfo: string;
    loadedFromDb: string;
    checkingSaved: string;
    contactSub: string;
    recipientName: string;
    phoneForOtp: string;
    emailReceipt: string;
    emailReceiptSub: string;
    deliveryDetails: string;
    dispatchedFrom: string;
    city: string;
    subcity: string;
    specificAddress: string;
    deliveryInstructions: string;
    optional: string;
    saveAddressCheckbox: string;
    dbSync: string;
    dbSyncSub: string;
    addressSavedSynced: string;
    loadedFromDbHint: string;
    checkBoxToSave: string;
    signInToSave: string;
    saveAddressBtn: string;
    savingInDb: string;
    paymentMethod: string;
    paymentMethodSub: string;
    chapaGateway: string;
    cardsAndMobile: string;
    chapaDesc: string;
    mercatoxCard: string;
    digitalWallet: string;
    mercatoxCardDesc: string;
    cashbackRewardTitle: string;
    cashbackRewardDesc: string;
    checkingCard: string;
    noCardTitle: string;
    cardRequired: string;
    noCardDesc: string;
    buyCardNow: string;
    switchToChapa: string;
    insufficientBalanceTitle: string;
    insufficientBalanceDesc: string;
    cardBalance: string;
    orderTotal: string;
    shortage: string;
    topUpCard: string;
    payWithChapa: string;
    sufficientBalanceTitle: string;
    readyToPay: string;
    manageCard: string;
    sufficientBalanceDesc: string;
    orderPayment: string;
    remainingBalance: string;
    escrowProtocolTitle: string;
    escrowProtocolDesc: string;
    orderSummary: string;
    items: string;
    item: string;
    productsInOrder: string;
    shown: string;
    of: string;
    viewMore: string;
    viewLess: string;
    subtotal: string;
    courierDelivery: string;
    freeOver5000: string;
    buyerProtectionCovered: string;
    totalAmount: string;
    paymentGatewayLabel: string;
    authorizingCard: string;
    redirectingChapa: string;
    payWithCardBtn: string;
    processToPayChapa: string;
    returnToCart: string;
    deliveryCommitment: string;
    deliveryCommitmentSub: string;
    totalToPay: string;
    cardPinTitle: string;
    cardPinSub: string;
    cardholder: string;
    cardNumber: string;
    amountToDeduct: string;
    balanceAfterDeduction: string;
    enter8DigitPin: string;
    pinSentToEmail: string;
    resendPinEmail: string;
    sendingEmail: string;
    authorizingOrder: string;
    authorizeAndPay: string;
    escrowBadge: string;
  };
  profile: {
    title: string;
    verified: string;
    totalOrders: string;
    delivered: string;
    inTransit: string;
    personalInfo: string;
    edit: string;
    cancel: string;
    saveChanges: string;
    saving: string;
    fullName: string;
    email: string;
    altPhone: string;
    deliveryAddress: string;
    city: string;
    subcity: string;
    landmark: string;
    buyerProtected: string;
    buyerProtectedSub: string;
    myOrders: string;
    myOrdersSub: string;
    favorites: string;
    favoritesSub: string;
    settings: string;
    settingsSub: string;
    signOut: string;
    signOutSub: string;
    verifyingAccess: string;
  };
  settings: {
    title: string;
    security: string;
    alerts: string;
    appearance: string;
    about: string;
    mode: string;
    passwordSecurity: string;
    passwordSecuritySub: string;
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
    updatePassword: string;
    updating: string;
    passwordUpdated: string;
    editProfile: string;
    editProfileSub: string;
    myOrders: string;
    myOrdersSub: string;
    signOut: string;
    signOutSub: string;
    notifications: string;
    notificationsSub: string;
    smsOtp: string;
    smsOtpSub: string;
    requiredBadge: string;
    emailInvoice: string;
    emailInvoiceSub: string;
    marketPromos: string;
    marketPromosSub: string;
    escrowOtpTitle: string;
    escrowOtpSub: string;
    themeTitle: string;
    themeSub: string;
    modeLight: string;
    modeLightSub: string;
    modeDark: string;
    modeDarkSub: string;
    modeSystem: string;
    modeSystemSub: string;
    platformInfo: string;
    platformInfoSub: string;
    platform: string;
    currency: string;
    deliveryRegion: string;
    escrowSystem: string;
    paymentGateway: string;
    accountId: string;
    escrowProtectedTitle: string;
    escrowProtectedSub: string;
    secureBadge: string;
    otpVerifiedBadge: string;
    escrowBadge: string;
    verifyingAccess: string;
  };
  admin: {
    nav: {
      overview: string;
      catalog: string;
      categories: string;
      users: string;
      suppliers: string;
      orders: string;
      slips: string;
      subscriptions: string;
      delivery: string;
      disputes: string;
      audit: string;
      settings: string;
      coreMonitoring: string;
      commerceCatalog: string;
      logisticsCare: string;
      governanceSystem: string;
      clusterActive: string;
      superAdmin: string;
      signOut: string;
      searchPlaceholder: string;
      complianceApprovals: string;
      pendingBadge: string;
      allCaughtUp: string;
      noSupplierAlerts: string;
      refresh: string;
      refreshing: string;
      reviewApplication: string;
      adminConsole: string;
      masterSuperAdmin: string;
      verifiedActive: string;
      accountStatus: string;
      verifyingClearance: string;
    };
    overview: {
      title: string;
      subtitle: string;
      backendSynced: string;
      updated: string;
      totalProducts: string;
      activeInStock: string;
      totalOrders: string;
      ordersProcessed: string;
      totalUsers: string;
      regularBuyers: string;
      registeredCustomers: string;
      totalSellers: string;
      verifiedMerchants: string;
      registeredMerchants: string;
      orderFulfillmentPipeline: string;
      viewAllOrders: string;
      confirmedOrders: string;
      inProcessing: string;
      inTransit: string;
      deliveredCleared: string;
      cancelledReturned: string;
      volume: string;
      clusterFleetHealth: string;
      operationalHealthy: string;
      connectedMicroservices: string;
      metricsUpdated: string;
    };
    catalog: {
      title: string;
      subtitle: string;
      searchPlaceholder: string;
      filterAll: string;
      filterActive: string;
      filterOutOfStock: string;
      colProduct: string;
      colMerchant: string;
      colCategory: string;
      colPrice: string;
      colStock: string;
      colStatus: string;
      colAction: string;
      loadingProducts: string;
      noProducts: string;
      viewDetails: string;
      suspend: string;
      activate: string;
      delete: string;
      merchantStore: string;
      confirmDelete: string;
      confirmDeleteDesc: string;
      cancel: string;
      deleting: string;
      activeStatus: string;
      outOfStockStatus: string;
    };
    categories: {
      title: string;
      subtitle: string;
      addCategory: string;
      editCategory: string;
      categoryName: string;
      categorySlug: string;
      categoryDesc: string;
      categoryIcon: string;
      searchPlaceholder: string;
      colName: string;
      colSlug: string;
      colProductsCount: string;
      colCreated: string;
      colAction: string;
      saving: string;
      save: string;
      noCategories: string;
      loadingCategories: string;
      deleteCategory: string;
      confirmDeleteCat: string;
    };
    users: {
      title: string;
      subtitle: string;
      searchPlaceholder: string;
      roleAll: string;
      roleCustomer: string;
      roleSeller: string;
      roleDelivery: string;
      roleSupplier: string;
      roleAdmin: string;
      statusAll: string;
      statusVerified: string;
      statusPending: string;
      statusRejected: string;
      colUser: string;
      colRole: string;
      colContact: string;
      colKyc: string;
      colAccountStatus: string;
      colJoined: string;
      colAction: string;
      active: string;
      blocked: string;
      locked: string;
      approveKyc: string;
      rejectKyc: string;
      blockUser: string;
      unblockUser: string;
      unlockUser: string;
      deleteUser: string;
      viewUserDetail: string;
      noUsers: string;
      loadingUsers: string;
      kycModalTitle: string;
      kycModalSub: string;
    };
    suppliers: {
      title: string;
      subtitle: string;
      searchPlaceholder: string;
      allSuppliers: string;
      pendingReview: string;
      verifiedSuppliers: string;
      rejectedSuppliers: string;
      colSupplier: string;
      colLocation: string;
      colContact: string;
      colFleet: string;
      colVerification: string;
      colAction: string;
      reviewDocuments: string;
      tradeLicense: string;
      tinNumber: string;
      approveSupplier: string;
      rejectSupplier: string;
      rejectionReason: string;
      loadingSuppliers: string;
      noSuppliers: string;
    };
    orders: {
      title: string;
      subtitle: string;
      searchPlaceholder: string;
      escrowBalance: string;
      escrowFundsProtected: string;
      statusAll: string;
      statusConfirmed: string;
      statusProcessing: string;
      statusInTransit: string;
      statusDelivered: string;
      statusCancelled: string;
      colOrder: string;
      colCustomer: string;
      colAddress: string;
      colAmount: string;
      colPayment: string;
      colStatus: string;
      colRider: string;
      colAction: string;
      assignRider: string;
      releaseEscrow: string;
      refundOrder: string;
      viewOrderDetails: string;
      escrowReleased: string;
      escrowHeld: string;
      loadingOrders: string;
      noOrders: string;
    };
    slips: {
      title: string;
      subtitle: string;
      searchPlaceholder: string;
      pendingSlips: string;
      approvedSlips: string;
      rejectedSlips: string;
      colReference: string;
      colPayer: string;
      colBank: string;
      colAmount: string;
      colDate: string;
      colStatus: string;
      colAction: string;
      viewSlip: string;
      approveSlip: string;
      rejectSlip: string;
      slipReceiptTitle: string;
      noSlips: string;
      loadingSlips: string;
    };
    delivery: {
      title: string;
      subtitle: string;
      searchPlaceholder: string;
      allRiders: string;
      activeRiders: string;
      busyRiders: string;
      offlineRiders: string;
      addRider: string;
      colRider: string;
      colVehicle: string;
      colZone: string;
      colActiveOrders: string;
      colStatus: string;
      colAction: string;
      dispatchOrder: string;
      vehicleMotorcycle: string;
      vehicleVan: string;
      vehicleBicycle: string;
      loadingRiders: string;
      noRiders: string;
    };
    disputes: {
      title: string;
      subtitle: string;
      searchPlaceholder: string;
      allDisputes: string;
      openDisputes: string;
      resolvedDisputes: string;
      colDispute: string;
      colOrder: string;
      colParties: string;
      colReason: string;
      colAmount: string;
      colStatus: string;
      colAction: string;
      inspectEvidence: string;
      refundCustomer: string;
      releaseSeller: string;
      loadingDisputes: string;
      noDisputes: string;
    };
    subscriptions: {
      title: string;
      subtitle: string;
      tabPlans: string;
      tabSubscribers: string;
      addPlan: string;
      planName: string;
      planPrice: string;
      commissionRate: string;
      productLimit: string;
      targetRole: string;
      features: string;
      savePlan: string;
      activePlan: string;
      loadingPlans: string;
      noPlans: string;
    };
    settings: {
      title: string;
      subtitle: string;
      platformName: string;
      platformTagline: string;
      platformFee: string;
      escrowHoldHours: string;
      maintenanceMode: string;
      maintenanceDesc: string;
      saveChanges: string;
      saving: string;
      settingsSaved: string;
      resetDefaults: string;
      brandingSettings: string;
      escrowSettings: string;
    };
    audit: {
      title: string;
      subtitle: string;
      searchPlaceholder: string;
      filterAll: string;
      filterAuth: string;
      filterUsers: string;
      filterKyc: string;
      filterProducts: string;
      filterOrders: string;
      filterPayments: string;
      colTimestamp: string;
      colActor: string;
      colAction: string;
      colSeverity: string;
      colDetails: string;
      exportLogs: string;
      loadingLogs: string;
      noLogs: string;
    };
    details: {
      backToAdmin: string;
      orderDetails: string;
      productDetails: string;
      userDetails: string;
      supplierDetails: string;
      loadingDetails: string;
      saveChanges: string;
      status: string;
      information: string;
      documents: string;
    };
  };
}

export const translations: Record<LanguageCode, TranslationSchema> = {
  en: {
    nav: {
      home: "Home",
      marketplace: "Marketplace",
      categories: "Categories",
      adminDashboard: "Admin Dashboard",
      supplierDashboard: "Supplier Dashboard",
      sellerDashboard: "Seller Dashboard",
      cart: "Cart",
      favorites: "Favorites",
      saved: "Saved",
      signIn: "Sign In",
      register: "Register",
      myAccount: "My Account",
      orders: "My Orders",
      profile: "Profile",
      settings: "Settings",
      logout: "Sign Out",
      rfq: "RFQ / Bulk Sourcing",
      wholesale: "Wholesale",
      retail: "Retail",
      explore: "Explore",
    },
    header: {
      searchPlaceholder: "Search authentic Ethiopian coffee, textiles, teff, spices & bulk products...",
      allDepts: "All Departments",
      tradeBanner: "Direct Ethiopian Trade · Authentic Brands & Safe Escrow Checkout",
      language: "Language",
      selectLanguage: "Select Language",
      welcome: "Welcome",
      deals: "Daily Deals",
      zones: "Market Zones",
      appearance: "Appearance",
      escrowBadge: "Escrow Protected",
    },
    common: {
      save: "Save",
      cancel: "Cancel",
      clear: "Clear",
      filter: "Filter",
      apply: "Apply",
      reset: "Reset",
      viewAll: "View All",
      loading: "Loading...",
      addToCart: "Add to Cart",
      buyNow: "Buy Now",
      inStock: "In Stock",
      outOfStock: "Out of Stock",
      price: "Price",
      rating: "Rating",
      qty: "Quantity",
      total: "Total",
      subtotal: "Subtotal",
      status: "Status",
      date: "Date",
      actions: "Actions",
      close: "Close",
      back: "Back",
      remove: "Remove",
      edit: "Edit",
      share: "Share",
    },
    auth: {
      signInTitle: "Sign in to your account",
      signInSubtitle: "Access your orders, favorites, and Ethiopian marketplace trade hub",
      identifierLabel: "Phone Number or Email",
      identifierPlaceholder: "09... or name@example.com",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter your password",
      rememberMe: "Remember this device for 30 days",
      forgotPassword: "Forgot password?",
      signInBtn: "Sign In to Account",
      orContinueWith: "or continue with",
      googleBtn: "Continue with Google account",
      githubBtn: "Continue with GitHub account",
      noAccount: "Don't have an account yet?",
      createAccount: "Create account",
      returnHome: "Return to Home page",
      registerTitle: "Create your MercatoX account",
      registerSubtitle: "Join Ethiopia's verified digital commerce ecosystem",
      selectRole: "Select your account role",
      customerRole: "Customer / Buyer",
      sellerRole: "Merchant / Seller",
      supplierRole: "Supplier / Wholesaler",
      fullName: "Full Name",
      phone: "Phone Number",
      email: "Email Address",
      confirmPassword: "Confirm Password",
      agreeTerms: "I agree to the MercatoX Terms of Service and Verification Guidelines",
      registerBtn: "Complete Registration",
      haveAccount: "Already have an account?",
      capsLock: "Caps Lock is active",
      cooldown: "Cooldown Active",
      accountBlocked: "Account Permanently Blocked",
      contactAdmin: "Please contact an administrator to unblock your account.",
      valIdentifier: "Please enter your phone number or email",
      valPassword: "Password is required",
      valPasswordLen: "Password must be at least 6 characters",
      customerRoleTitle: "Customer / Buyer",
      customerRoleBadge: "Retail & Wholesale",
      customerRoleDesc: "Individual shopper or corporate buyer placing orders",
      customerFeat1: "Access 10,000+ verified Ethiopian merchants",
      customerFeat2: "Instant Telebirr & Chapa checkout",
      customerFeat3: "Real-time shipment tracking to your door",
      sellerRoleTitle: "Merchant / Seller",
      sellerRoleBadge: "Storefront Owner",
      sellerRoleDesc: "Retail shop, boutique, or commercial trader",
      sellerFeat1: "Deploy verified digital store in Merkato, Bole or online",
      sellerFeat2: "Storefront catalog management & local sales",
      sellerFeat3: "Direct bank & Telebirr automated payouts",
      supplierRoleTitle: "Supplier / Wholesaler",
      supplierRoleBadge: "B2B Bulk Hub",
      supplierRoleDesc: "Primary bulk importer, factory manufacturer, or master distributor",
      supplierFeat1: "Wholesale volume distribution & container-level pricing tiers",
      supplierFeat2: "Direct merchant purchase orders & escrow-guaranteed contracts",
      supplierFeat3: "Commercial tax invoice (TIN/VAT) & dry port logistics dispatch",
      socialRegistersAs: "Registers directly with Google or GitHub as",
      orChooseAccountType: "Or choose account type to register",
      courierPartnerNotice: "Looking to deliver as a Courier or Fleet Partner?",
      courierPartnerDesc: "Courier drivers and fleet vehicles (motorcycles, vans) are registered and assigned exclusively by MercatoX Administrators to ensure verified background and vehicle checks. Please contact admin dispatch.",
      continueAs: "Continue as",
      changeAccountType: "Change Account Type",
      accountTypeSuffix: "ACCOUNT",
      customerRegDesc: "Enter your contact details to start shopping on MercatoX",
      sellerRegDesc: "Fulfill business & legal trade details for verified merchant access",
      supplierRegDesc: "Register as a verified wholesale distributor, factory, or bulk importer",
    },
    marketplace: {
      title: "Marketplace",
      subtitle: "Source directly from verified Ethiopian merchants, farmers & manufacturers",
      all: "All Items",
      wholesaleOnly: "Wholesale",
      retailOnly: "Retail",
      sortBy: "Sort By",
      featured: "Featured",
      priceLowHigh: "Price: Low to High",
      priceHighLow: "Price: High to Low",
      topRated: "Top Rated",
      filters: "Filters",
      clearAll: "Clear All",
      showingResults: "Showing products",
      escrowProtected: "Escrow Protected",
      noProductsFound: "No products found matching your filters",
      customerReviews: "Customer Reviews",
      departments: "Departments",
      sourcingMode: "Sourcing Type",
      moqLabel: "MOQ (Minimum Order)",
      customPrice: "Custom Price",
      min: "Min",
      max: "Max",
    },
    home: {
      heroTitle: "Source Directly from Ethiopia's Best Producers & Merchants",
      heroSubtitle: "Enjoy transparent prices, verified product authenticity, fast delivery across Addis Ababa, and safe escrow checkout.",
      shopMarketplace: "Shop Marketplace",
      browseCategories: "Browse Categories",
      featuredProducts: "Featured Products",
      topSuppliers: "Verified Ethiopian Suppliers",
      dailyDeals: "Daily Deals & Flash Sales",
      viewAll: "View All",
      whyChooseUs: "Why Choose MercatoX",
      fastDelivery: "Fast Addis Ababa Delivery",
      safeEscrow: "100% Escrow Secured Payment",
      authenticGuaranteed: "Verified Authentic Ethiopian Brands",
      popularDepartments: "Popular Departments",
      youMayAlsoLike: "You May Also Like",
      seeAll: "See All",
      viewProduct: "View Product",
      exploreStore: "Explore Store",
      scrollDown: "Scroll to browse store",
      localPayments: "Local Payments",
      localPaymentsDesc: "Telebirr, CBE & Cards",
      latestProducts: "Latest Products & Department Feeds",
      latestProductsSub: "Fresh arrivals, top sellers, and authentic products updated daily",
      exploreAll: "Explore All",
      acrossAddis: "Across Addis Ababa & beyond",
      fromSuppliers: "Direct from vetted suppliers",
      escrowGuarantee: "Escrow & buyer guarantee",
    },
    categories: {
      title: "Browse Categories",
      subtitle: "Explore authentic Ethiopian agricultural, artisanal, and manufactured goods",
      allCategories: "All Categories",
      viewProducts: "View Products",
      itemsCount: "products",
      trendingInAddis: "Trending in Addis",
      exploreCollections: "Explore Collections",
      exploreVerified: "Explore verified collection",
    },
    cart: {
      title: "Shopping Cart",
      empty: "Your cart is empty",
      emptySub: "Browse our marketplace to find authentic Ethiopian products",
      checkout: "Proceed to Checkout",
      continueShopping: "Continue Shopping",
      orderSummary: "Order Summary",
      deliveryFee: "Delivery Fee",
      freeDeliveryNotice: "Free delivery on orders over 5,000 ETB",
      freeBadge: "Free",
      itemsCount: "items",
      browseMarketplace: "Browse Marketplace",
      clearCart: "Clear Cart",
      youMayAlsoLike: "You May Also Like",
      productsInOrder: "Products in Order",
      deliveringTo: "Delivering to",
      unitPrice: "Unit",
      color: "Color",
      size: "Size",
      viewMore: "View More",
      viewLess: "View Less",
      escrowGuaranteeNotice: "Funds remain securely locked until you inspect the parcel and share your 4-digit SMS OTP with courier.",
      curatedPicks: "Curated Marketplace Picks",
    },
    favorites: {
      title: "Saved Favorites",
      subtitle: "Products you've saved for future orders and procurement",
      empty: "No saved items yet",
      emptySub: "Click the heart icon on any product to save it here for later",
      clearAll: "Clear All",
      moveToCart: "Move to Cart",
      browseMarketplace: "Browse Marketplace",
      personalWishlist: "Personal Wishlist",
      savedCount: "saved items",
      exploreMarketplace: "Explore Marketplace",
      addAllToCart: "Add All to Cart",
      quickView: "Quick View",
      showingFavorites: "favorite items",
      loadDemoItems: "Load Demo Items",
      recommendedForYou: "Recommended For You",
      trendingWishlist: "Trending Items to Add to Wishlist",
    },
    orders: {
      title: "My Orders",
      subtitle: "Track your orders, delivery status, and escrow releases",
      empty: "No orders placed yet",
      emptySub: "Your order history and receipts will appear here once you make a purchase.",
      orderId: "Order ID",
      orderDate: "Date",
      items: "Items",
      paymentStatus: "Payment",
      deliveryStatus: "Delivery",
      totalAmount: "Total Amount",
      viewDetails: "View Details",
      trackOrder: "Track Order",
      statusDelivered: "Delivered",
      statusProcessing: "Processing",
      statusPending: "Pending",
      statusShipped: "Shipped",
      statusCancelled: "Cancelled",
      paymentId: "Payment ID",
      totalPrice: "Total Price",
      detailsTitle: "Order Details",
      buyerProtected: "100% Buyer Protected",
      orderedOn: "Ordered on",
      paymentIdentification: "Payment & Transaction Identification",
      paidInEscrow: "Paid & Secured in Escrow",
      doorstepDelivery: "Doorstep Delivery Information",
      recipientName: "Recipient Full Name",
      phoneForOtp: "Phone Number (for SMS OTP)",
      city: "City",
      subcity: "Addis Ababa Subcity",
      specificAddress: "Specific Address / Building / Landmark",
      orderedProducts: "Ordered Products",
      quantity: "Quantity",
      subtotalPrice: "Subtotal",
      courierFee: "Doorstep Courier Delivery",
      freeBadge: "FREE",
      escrowProtocol: "Escrow Protection Protocol",
      totalPaid: "Total Amount Paid",
      printReceipt: "Print Receipt",
      deleteOrder: "Delete Order",
      closeModal: "Close",
      copyTx: "Copy",
      copiedTx: "Copied!",
      confirmedPaid: "Confirmed & Paid",
      inTransit: "In Transit",
    },
    card: {
      title: "MercatoX Digital Card",
      subtitle: "Fast digital payments, instant cashbacks, and seamless marketplace settlements",
      balance: "Available Balance",
      topUp: "Top Up Card",
      cardNumber: "Card Number",
      validThru: "Valid Thru",
      cardHolder: "Card Holder",
      recentTransactions: "Recent Transactions",
      benefits: "Cardholder Benefits",
      cashback: "Cashback Rewards",
      freezeCard: "Freeze Card",
      unfreezeCard: "Unfreeze Card",
      applyCard: "Apply for Card",
    },
    product: {
      addToCart: "Add to Cart",
      buyNow: "Buy Now",
      outOfStock: "Out of Stock",
      inStock: "In Stock",
      verifiedMerchant: "Verified Merchant",
      escrowProtected: "Escrow Protected",
      reviews: "Reviews",
      rating: "Rating",
      description: "Product Description",
      specifications: "Specifications",
      relatedProducts: "Related Products",
      minOrder: "Min Order",
      directEthioTrade: "Direct Ethio Trade",
      soldOut: "Sold Out",
      quickView: "Quick View",
      onlyLeft: "Only left",
    },
    footer: {
      newsletterTitle: "Subscribe to MercatoX Marketplace Deals",
      newsletterSubtitle: "Get notified of exclusive Bole tech discounts, Shiro Meda cultural drops, and verified merchant promotions.",
      subscribeBtn: "Subscribe",
      placeholderEmail: "Enter your email address...",
      aboutPlatform: "About MercatoX",
      company: "Company",
      aboutUs: "About Us",
      careers: "Careers",
      press: "Press & News",
      customerService: "Customer Service",
      helpCenter: "Help Center",
      contactUs: "Contact Us",
      shippingInfo: "Delivery & Shipping",
      returnsRefunds: "Returns & Refunds",
      legal: "Legal",
      termsOfService: "Terms of Service",
      privacyPolicy: "Privacy Policy",
      security: "Escrow Security",
      allRightsReserved: "All rights reserved. Ethiopian Protected Commerce.",
      tagline: "Next-generation unified commerce platform connecting Ethiopian merchants, producers, and global buyers.",
    },
    toast: {
      languageChanged: "Language changed to English",
    },
    checkout: {
      title: "Buyer Protected Checkout",
      breadcrumbCart: "Cart",
      breadcrumbCheckout: "Checkout & Protected Payment",
      protectionGuarantee: "100% Buyer Protection Guaranteed",
      loadingSession: "Loading checkout session...",
      cartEmptyTitle: "Your cart is currently empty",
      cartEmptySub: "Please add items to your cart before proceeding to checkout.",
      exploreMarketplace: "Explore Marketplace",
      customerInfo: "1. Customer Information",
      loadedFromDb: "Loaded from Database",
      checkingSaved: "Checking saved info...",
      contactSub: "Who should we deliver to and contact for SMS OTP release?",
      recipientName: "Recipient Full Name",
      phoneForOtp: "Phone Number (for SMS OTP)",
      emailReceipt: "Email Address",
      emailReceiptSub: "(for digital receipt)",
      deliveryDetails: "2. Doorstep Delivery Details",
      dispatchedFrom: "Dispatched directly from verified local merchants in Addis Ababa.",
      city: "City",
      subcity: "Addis Ababa Subcity",
      specificAddress: "Specific Address / Building / Landmark / House No",
      deliveryInstructions: "Courier Delivery Instructions",
      optional: "(optional)",
      saveAddressCheckbox: "Save this delivery address & contact info for future orders",
      dbSync: "Database Sync",
      dbSyncSub: "Stores your address securely in the PostgreSQL database and pre-fills it automatically on your next order.",
      addressSavedSynced: "Address is saved & synced in database",
      loadedFromDbHint: "Loaded from database (Edit & save if changed)",
      checkBoxToSave: "Check box or click button to save to your account",
      signInToSave: "(Optional: Sign in to save across devices)",
      saveAddressBtn: "Save Address to Database",
      savingInDb: "Saving in Database...",
      paymentMethod: "3. Protected Payment Method",
      paymentMethodSub: "Choose your preferred payment service. Funds stay protected until OTP release.",
      chapaGateway: "Chapa Gateway",
      cardsAndMobile: "Cards & Mobile Banking",
      chapaDesc: "Debit card, Visa, Mastercard, Awash & Dashen",
      mercatoxCard: "MercatoX Card",
      digitalWallet: "Digital Loyalty & Wallet",
      mercatoxCardDesc: "Zero-fee escrow pay, instant cashback & reward points",
      cashbackRewardTitle: "Chapa Payment 2% Card Cashback Reward",
      cashbackRewardDesc: "Pay with Chapa and get 2% of your total order amount automatically saved to your MercatoX Card as a bonus reward!",
      checkingCard: "Checking MercatoX Card status...",
      noCardTitle: "No MercatoX Card Found",
      cardRequired: "Card Required",
      noCardDesc: "To use MercatoX Card payment, you must first purchase a card. Enjoy 0% transaction fees and 5% automatic cashback by ordering your card now.",
      buyCardNow: "Buy MercatoX Card Now",
      switchToChapa: "Switch to Chapa",
      insufficientBalanceTitle: "Insufficient Card Balance",
      insufficientBalanceDesc: "You do not have enough card balance to cover this order. Please top up your card or switch to another payment method.",
      cardBalance: "Card Balance",
      orderTotal: "Order Total",
      shortage: "Shortage",
      topUpCard: "Top Up / Manage Card",
      payWithChapa: "Pay with Chapa",
      sufficientBalanceTitle: "Sufficient Balance Available",
      readyToPay: "Ready to Pay",
      manageCard: "Manage Card",
      sufficientBalanceDesc: "You have sufficient card balance to complete this purchase with 0% transaction fees and instant escrow protection. Click 'Pay with MercatoX Card' and enter your 8-digit Card Password to authorize payment.",
      orderPayment: "Order Payment",
      remainingBalance: "Remaining Balance",
      escrowProtocolTitle: "100% Buyer Protection Protocol",
      escrowProtocolDesc: "Your payment will be securely held in MercatoX protected account. The seller does not receive payment until you inspect the package at your doorstep and verbally provide your 4-digit SMS OTP to the delivery agent.",
      orderSummary: "Order Summary",
      items: "items",
      item: "item",
      productsInOrder: "Products in Order",
      shown: "shown",
      of: "of",
      viewMore: "View More",
      viewLess: "View Less",
      subtotal: "Items Subtotal",
      courierDelivery: "Doorstep Courier Delivery",
      freeOver5000: "FREE (Over 5,000 ETB)",
      buyerProtectionCovered: "Covered (0 ETB)",
      totalAmount: "Total Amount",
      paymentGatewayLabel: "Payment Gateway:",
      authorizingCard: "Authorizing MercatoX Card...",
      redirectingChapa: "Redirecting to Chapa Gateway...",
      payWithCardBtn: "Pay with MercatoX Card",
      processToPayChapa: "Process to Pay with Chapa",
      returnToCart: "Return to Shopping Cart",
      deliveryCommitment: "Courier Delivery Commitment",
      deliveryCommitmentSub: "Average delivery speed within Addis Ababa is 2 to 4 hours. You will receive real-time SMS updates with courier phone number and tracking.",
      totalToPay: "Total to Pay",
      cardPinTitle: "Card Security Password",
      cardPinSub: "Enter your 8-digit Card Password to authorize payment",
      cardholder: "Cardholder:",
      cardNumber: "Card Number:",
      amountToDeduct: "Amount to Deduct:",
      balanceAfterDeduction: "Balance after deduction:",
      enter8DigitPin: "Enter 8-Digit Card Password",
      pinSentToEmail: "Enter the 8-digit card password sent to your email",
      resendPinEmail: "Forgot password? Resend to email",
      sendingEmail: "Sending...",
      authorizingOrder: "Deducting & Confirming Order...",
      authorizeAndPay: "Authorize & Pay",
      escrowBadge: "100% Escrow Protected · 0% Transaction Fee",
    },
    profile: {
      title: "My Profile",
      verified: "Verified",
      totalOrders: "Total Orders",
      delivered: "Delivered",
      inTransit: "In Transit",
      personalInfo: "Personal Info",
      edit: "Edit",
      cancel: "Cancel",
      saveChanges: "Save Changes",
      saving: "Saving...",
      fullName: "Full Name",
      email: "Email",
      altPhone: "Alt. Phone",
      deliveryAddress: "Delivery Address",
      city: "City",
      subcity: "Subcity",
      landmark: "Landmark / Woreda",
      buyerProtected: "Buyer Protected Account",
      buyerProtectedSub: "Funds held securely — released only after doorstep OTP confirmation.",
      myOrders: "My Orders",
      myOrdersSub: "View all your purchases",
      favorites: "Favorites",
      favoritesSub: "Saved products",
      settings: "Settings",
      settingsSub: "Account preferences",
      signOut: "Sign Out",
      signOutSub: "Log out of your account",
      verifyingAccess: "Verifying profile access...",
    },
    settings: {
      title: "Account Settings",
      security: "Security",
      alerts: "Alerts",
      appearance: "Appearance",
      about: "About",
      mode: "Mode",
      passwordSecurity: "Password & Security",
      passwordSecuritySub: "Update your account credentials",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmNewPassword: "Confirm Password",
      updatePassword: "Update Password",
      updating: "Updating...",
      passwordUpdated: "Password Updated!",
      editProfile: "Edit Profile",
      editProfileSub: "Name, email, shipping address",
      myOrders: "My Orders",
      myOrdersSub: "Track & manage your orders",
      signOut: "Sign Out",
      signOutSub: "Log out of MercatoX",
      notifications: "Notification Preferences",
      notificationsSub: "Manage alerts & communications",
      smsOtp: "SMS Handover OTP",
      smsOtpSub: "4-digit OTP alert sent when courier arrives at your door",
      requiredBadge: "Required",
      emailInvoice: "Order & Invoice Emails",
      emailInvoiceSub: "Escrow settlements & official receipts sent to your email",
      marketPromos: "Marketplace Deals",
      marketPromosSub: "Highlights from Bole, Mercato & verified local sellers",
      escrowOtpTitle: "Escrow OTP Protection",
      escrowOtpSub: "Your SMS OTP is the final step in MercatoX's doorstep handover protocol. The courier cannot mark the order delivered without your verbal confirmation code.",
      themeTitle: "Interface Theme",
      themeSub: "Choose your preferred card and canvas color scheme",
      modeLight: "Light",
      modeLightSub: "Pure White Cards",
      modeDark: "Dark",
      modeDarkSub: "Charcoal Black Cards",
      modeSystem: "System",
      modeSystemSub: "Sapphire Blue Cards",
      platformInfo: "Platform Information",
      platformInfoSub: "MercatoX marketplace system details",
      platform: "Platform",
      currency: "Currency",
      deliveryRegion: "Delivery Region",
      escrowSystem: "Escrow System",
      paymentGateway: "Payment Gateway",
      accountId: "Your Account ID",
      escrowProtectedTitle: "Escrow Protected",
      escrowProtectedSub: "All transactions on MercatoX are protected by our escrow system. Funds are held securely and released to sellers only after you confirm receipt via a unique doorstep OTP code.",
      secureBadge: "Secure",
      otpVerifiedBadge: "OTP Verified",
      escrowBadge: "Escrow",
      verifyingAccess: "Verifying account settings access...",
    },
    admin: {
      nav: {
        overview: "Overview & Analytics",
        catalog: "Products",
        categories: "Categories",
        users: "Users",
        suppliers: "Suppliers & Fleet",
        orders: "Orders & Escrow",
        slips: "Payments & Slips Audit",
        subscriptions: "Subscriptions & Plans",
        delivery: "Delivery & Riders",
        disputes: "Disputes & Refunds",
        audit: "Security Audit Logs",
        settings: "Platform Settings",
        coreMonitoring: "Core Monitoring",
        commerceCatalog: "Commerce & Catalog",
        logisticsCare: "Logistics & Care",
        governanceSystem: "Governance & System",
        clusterActive: "Cluster: Active",
        superAdmin: "SUPER_ADMIN",
        signOut: "Sign Out",
        searchPlaceholder: "Quick search merchants, orders, slips... (Ctrl+K)",
        complianceApprovals: "Compliance & Approvals",
        pendingBadge: "Pending",
        allCaughtUp: "All Caught Up",
        noSupplierAlerts: "No new supplier applications awaiting verification.",
        refresh: "Refresh",
        refreshing: "Refreshing...",
        reviewApplication: "Review Application",
        adminConsole: "Enterprise Admin Console",
        masterSuperAdmin: "Master Super Admin",
        verifiedActive: "Verified & Active",
        accountStatus: "Account Status",
        verifyingClearance: "Initializing administrator security clearance...",
      },
      overview: {
        title: "Platform Analytics & Overview",
        subtitle: "Real-time transaction volume, order pipelines, and marketplace metrics.",
        backendSynced: "Backend Synced",
        updated: "Updated",
        totalProducts: "Total Products",
        activeInStock: "Active in store",
        totalOrders: "Total Orders",
        ordersProcessed: "Customer orders processed",
        totalUsers: "Total Users",
        regularBuyers: "Regular Buyers",
        registeredCustomers: "Registered customers (excl. admin)",
        totalSellers: "Total Sellers",
        verifiedMerchants: "Verified Merchants",
        registeredMerchants: "Registered store merchants",
        orderFulfillmentPipeline: "Order Fulfillment Pipeline",
        viewAllOrders: "View All Orders",
        confirmedOrders: "Confirmed Orders",
        inProcessing: "In Processing / Prep",
        inTransit: "In Transit / Delivery",
        deliveredCleared: "Delivered & Cleared",
        cancelledReturned: "Cancelled / Returned",
        volume: "Volume",
        clusterFleetHealth: "Cluster Microservices Fleet Health",
        operationalHealthy: "5 of 5 Operational · All Services Healthy",
        connectedMicroservices: "Connected to backend microservices",
        metricsUpdated: "Metrics updated from backend",
      },
      catalog: {
        title: "Products Management",
        subtitle: "Review, moderate, suspend, or reactivate marketplace catalog listings.",
        searchPlaceholder: "Search by title, seller, or category...",
        filterAll: "All Statuses",
        filterActive: "Active",
        filterOutOfStock: "Out of Stock",
        colProduct: "Product Listing",
        colMerchant: "Merchant / Store",
        colCategory: "Category",
        colPrice: "Price (ETB)",
        colStock: "Stock Units",
        colStatus: "Status",
        colAction: "Action",
        loadingProducts: "Loading products from backend...",
        noProducts: "No products found for the current filters.",
        viewDetails: "View details",
        suspend: "Suspend",
        activate: "Activate",
        delete: "Delete",
        merchantStore: "Merchant store",
        confirmDelete: "Delete Product",
        confirmDeleteDesc: "Are you sure you want to permanently delete this product? This action cannot be undone.",
        cancel: "Cancel",
        deleting: "Deleting...",
        activeStatus: "Active",
        outOfStockStatus: "Out of Stock",
      },
      categories: {
        title: "Category Management",
        subtitle: "Organize marketplace taxonomy, categories, and hierarchical navigation.",
        addCategory: "Add Category",
        editCategory: "Edit Category",
        categoryName: "Category Name",
        categorySlug: "URL Slug",
        categoryDesc: "Description",
        categoryIcon: "Icon Name",
        searchPlaceholder: "Search categories...",
        colName: "Category Name",
        colSlug: "Slug",
        colProductsCount: "Products",
        colCreated: "Created",
        colAction: "Action",
        saving: "Saving...",
        save: "Save Category",
        noCategories: "No categories found.",
        loadingCategories: "Loading categories...",
        deleteCategory: "Delete Category",
        confirmDeleteCat: "Are you sure you want to delete this category?",
      },
      users: {
        title: "User Management & KYC",
        subtitle: "Manage registered customers, merchants, fleet couriers, and administrators.",
        searchPlaceholder: "Search users by name, email, phone, or business...",
        roleAll: "All Roles",
        roleCustomer: "Customers",
        roleSeller: "Sellers",
        roleDelivery: "Delivery Riders",
        roleSupplier: "Suppliers",
        roleAdmin: "Admins",
        statusAll: "All Status",
        statusVerified: "Verified",
        statusPending: "Pending KYC",
        statusRejected: "Rejected",
        colUser: "User Profile",
        colRole: "Role",
        colContact: "Contact Info",
        colKyc: "KYC Status",
        colAccountStatus: "Account Status",
        colJoined: "Joined Date",
        colAction: "Action",
        active: "Active",
        blocked: "Blocked",
        locked: "Locked",
        approveKyc: "Approve KYC",
        rejectKyc: "Reject KYC",
        blockUser: "Block User",
        unblockUser: "Unblock User",
        unlockUser: "Unlock Account",
        deleteUser: "Delete User",
        viewUserDetail: "View Full Details",
        noUsers: "No users match your criteria.",
        loadingUsers: "Loading users from database...",
        kycModalTitle: "KYC Verification Dossier",
        kycModalSub: "Review government IDs, trade licenses, and tax documents.",
      },
      suppliers: {
        title: "Suppliers & Fleet Directory",
        subtitle: "Verify merchant applications, trade licenses, TIN numbers, and fleet vehicles.",
        searchPlaceholder: "Search suppliers by name, shop, or location...",
        allSuppliers: "All Suppliers",
        pendingReview: "Pending Review",
        verifiedSuppliers: "Verified",
        rejectedSuppliers: "Rejected",
        colSupplier: "Supplier / Shop",
        colLocation: "Market Zone",
        colContact: "Phone & Email",
        colFleet: "Fleet Size",
        colVerification: "Verification",
        colAction: "Action",
        reviewDocuments: "Review Documents",
        tradeLicense: "Trade License",
        tinNumber: "TIN Number",
        approveSupplier: "Approve Supplier",
        rejectSupplier: "Reject Application",
        rejectionReason: "Rejection Reason",
        loadingSuppliers: "Loading suppliers and fleet...",
        noSuppliers: "No supplier records found.",
      },
      orders: {
        title: "Orders & Escrow Management",
        subtitle: "Monitor payments held in escrow, dispatch couriers, and arbitrate releases.",
        searchPlaceholder: "Search order #, customer name, phone, or merchant...",
        escrowBalance: "Escrow Balance",
        escrowFundsProtected: "Buyer funds securely held until delivery confirmation",
        statusAll: "All Orders",
        statusConfirmed: "Confirmed",
        statusProcessing: "Processing",
        statusInTransit: "In Transit",
        statusDelivered: "Delivered",
        statusCancelled: "Cancelled",
        colOrder: "Order #",
        colCustomer: "Customer",
        colAddress: "Delivery Address",
        colAmount: "Amount (ETB)",
        colPayment: "Payment",
        colStatus: "Fulfillment",
        colRider: "Assigned Rider",
        colAction: "Action",
        assignRider: "Assign Rider",
        releaseEscrow: "Release Escrow",
        refundOrder: "Refund Buyer",
        viewOrderDetails: "View Order",
        escrowReleased: "Released",
        escrowHeld: "Held in Escrow",
        loadingOrders: "Loading orders and escrow state...",
        noOrders: "No orders match the current criteria.",
      },
      slips: {
        title: "Bank Slips & Payment Verification",
        subtitle: "Audit manual CBE, Awash, Telebirr bank deposit receipts and slips.",
        searchPlaceholder: "Search reference #, payer name, bank, or phone...",
        pendingSlips: "Pending Slips",
        approvedSlips: "Approved",
        rejectedSlips: "Rejected",
        colReference: "Reference #",
        colPayer: "Payer",
        colBank: "Bank / Method",
        colAmount: "Deposit Amount",
        colDate: "Submitted At",
        colStatus: "Verification",
        colAction: "Action",
        viewSlip: "View Slip Receipt",
        approveSlip: "Approve Slip",
        rejectSlip: "Reject Slip",
        slipReceiptTitle: "Bank Deposit Slip Verification",
        noSlips: "No bank transfer slips pending verification.",
        loadingSlips: "Loading payment receipts...",
      },
      delivery: {
        title: "Delivery Network & Courier Dispatch",
        subtitle: "Coordinate motorcycle couriers, vans, delivery zones, and real-time status.",
        searchPlaceholder: "Search rider by name, phone, plate, or zone...",
        allRiders: "All Riders",
        activeRiders: "Active / On Duty",
        busyRiders: "On Delivery",
        offlineRiders: "Offline",
        addRider: "Add Rider",
        colRider: "Rider",
        colVehicle: "Vehicle & Plate",
        colZone: "Assigned Zone",
        colActiveOrders: "Active Tasks",
        colStatus: "Duty Status",
        colAction: "Action",
        dispatchOrder: "Dispatch Order",
        vehicleMotorcycle: "Motorcycle",
        vehicleVan: "Van / Truck",
        vehicleBicycle: "Bicycle",
        loadingRiders: "Loading fleet riders...",
        noRiders: "No delivery riders found.",
      },
      disputes: {
        title: "Disputes & Arbitrage",
        subtitle: "Mediate customer-seller conflicts, inspect evidence, and decide escrow outcomes.",
        searchPlaceholder: "Search dispute by order #, customer, or reason...",
        allDisputes: "All Disputes",
        openDisputes: "Open Disputes",
        resolvedDisputes: "Resolved",
        colDispute: "Dispute ID",
        colOrder: "Order Ref",
        colParties: "Customer vs Seller",
        colReason: "Dispute Reason",
        colAmount: "Disputed Amount",
        colStatus: "Status",
        colAction: "Action",
        inspectEvidence: "Inspect Evidence",
        refundCustomer: "Resolve: Refund Customer",
        releaseSeller: "Resolve: Release to Seller",
        loadingDisputes: "Loading dispute cases...",
        noDisputes: "No active dispute cases.",
      },
      subscriptions: {
        title: "Subscriptions & Merchant Plans",
        subtitle: "Configure seller and supplier tiers, commission rates, and feature limits.",
        tabPlans: "Subscription Plans",
        tabSubscribers: "Subscribed Merchants",
        addPlan: "Create New Plan",
        planName: "Plan Name",
        planPrice: "Monthly Price (ETB)",
        commissionRate: "Commission Rate (%)",
        productLimit: "Product Limit",
        targetRole: "Target Role",
        features: "Included Features",
        savePlan: "Save Plan",
        activePlan: "Active",
        loadingPlans: "Loading subscription packages...",
        noPlans: "No subscription plans configured.",
      },
      settings: {
        title: "System Settings & Governance",
        subtitle: "Configure platform fees, escrow release delays, maintenance mode, and branding.",
        platformName: "Platform Name",
        platformTagline: "Platform Tagline",
        platformFee: "Platform Commission Fee (%)",
        escrowHoldHours: "Escrow Hold Duration (Hours)",
        maintenanceMode: "Maintenance Mode",
        maintenanceDesc: "Temporarily disable public customer shopping for planned maintenance.",
        saveChanges: "Save Configuration",
        saving: "Saving...",
        settingsSaved: "Platform settings successfully updated!",
        resetDefaults: "Reset Defaults",
        brandingSettings: "Branding & Visual Identity",
        escrowSettings: "Escrow & Governance Rules",
      },
      audit: {
        title: "Security Audit & Activity Logs",
        subtitle: "Track all administrative actions, KYC updates, order changes, and login attempts.",
        searchPlaceholder: "Search audit logs by actor, action, IP, or details...",
        filterAll: "All Events",
        filterAuth: "Authentication",
        filterUsers: "User Management",
        filterKyc: "KYC Governance",
        filterProducts: "Catalog & Products",
        filterOrders: "Orders & Escrow",
        filterPayments: "Payments & Slips",
        colTimestamp: "Timestamp",
        colActor: "Actor / Admin",
        colAction: "Action Taken",
        colSeverity: "Severity",
        colDetails: "Details & IP",
        exportLogs: "Export CSV",
        loadingLogs: "Loading security audit trail...",
        noLogs: "No audit logs found matching criteria.",
      },
      details: {
        backToAdmin: "Back to Admin Dashboard",
        orderDetails: "Order Details & Escrow Tracking",
        productDetails: "Product Catalog Details",
        userDetails: "User & Merchant KYC Dossier",
        supplierDetails: "Supplier Profile & Documents",
        loadingDetails: "Loading details from database...",
        saveChanges: "Save Changes",
        status: "Status",
        information: "Information",
        documents: "Official Documents",
      },
    },
  },

  am: {
    nav: {
      home: "መነሻ",
      marketplace: "ገበያ",
      categories: "ምድቦች",
      adminDashboard: "የአድሚን ዳሽቦርድ",
      supplierDashboard: "የአቅራቢ ዳሽቦርድ",
      sellerDashboard: "የሻጭ ዳሽቦርድ",
      cart: "ጋሪ",
      favorites: "የተወደዱ",
      saved: "የተቀመጡ",
      signIn: "ግባ",
      register: "ተመዝገብ",
      myAccount: "የእኔ መለያ",
      orders: "ትዕዛዞቼ",
      profile: "መገለጫ",
      settings: "ቅንብሮች",
      logout: "ውጣ",
      rfq: "የጅምላ ጥያቄ (RFQ)",
      wholesale: "የጅምላ ንግድ",
      retail: "ችርቻሮ",
      explore: "አስስ",
    },
    header: {
      searchPlaceholder: "ትክክለኛ የኢትዮጵያ ቡና፣ ጨርቃጨርቅ፣ ጤፍ፣ ቅመማቅመም እና የጅምላ እቃዎችን ፈልግ...",
      allDepts: "ሁሉም ምድቦች",
      tradeBanner: "ቀጥተኛ የኢትዮጵያ ንግድ · ትክክለኛ ምርቶች እና አስተማማኝ የኤስክሮው ክፍያ",
      language: "ቋንቋ",
      selectLanguage: "ቋንቋ ይምረጡ",
      welcome: "እንኳን ደህና መጡ",
      deals: "የቀኑ ቅናሾች",
      zones: "የገበያ ቀጠናዎች",
      appearance: "ገጽታ",
      escrowBadge: "በኤስክሮው የተጠበቀ",
    },
    common: {
      save: "አስቀምጥ",
      cancel: "ሰርዝ",
      clear: "አጽዳ",
      filter: "አጣራ",
      apply: "ተግብር",
      reset: "ዳግም አስጀምር",
      viewAll: "ሁሉንም እይ",
      loading: "በመጫን ላይ...",
      addToCart: "ወደ ጋሪ ጨምር",
      buyNow: "አሁን ግዛ",
      inStock: "በክምችት ላይ ያለ",
      outOfStock: "ያለቀ",
      price: "ዋጋ",
      rating: "ደረጃ",
      qty: "ብዛት",
      total: "ጠቅላላ",
      subtotal: "ንዑስ ጠቅላላ",
      status: "ሁኔታ",
      date: "ቀን",
      actions: "እርምጃዎች",
      close: "ዝጋ",
      back: "ተመለስ",
      remove: "አስወግድ",
      edit: "አስተካክል",
      share: "አጋራ",
    },
    auth: {
      signInTitle: "ወደ መለያዎ ይግቡ",
      signInSubtitle: "ትዕዛዞችዎን፣ የተቀመጡ ዕቃዎችን እና የኢትዮጵያ የንግድ ማዕከልን ይጎብኙ",
      identifierLabel: "ስልክ ቁጥር ወይም ኢሜይል",
      identifierPlaceholder: "09... ወይም name@example.com",
      passwordLabel: "የይለፍ ቃል",
      passwordPlaceholder: "የይለፍ ቃልዎን ያስገቡ",
      rememberMe: "ይህን መሣሪያ ለ30 ቀናት አስታውስ",
      forgotPassword: "የይለፍ ቃል ረሱ?",
      signInBtn: "ግባ",
      orContinueWith: "ወይም በዚህ ይቀጥሉ",
      googleBtn: "በGoogle መለያ ይቀጥሉ",
      githubBtn: "በGitHub መለያ ይቀጥሉ",
      noAccount: "መለያ የለዎትም?",
      createAccount: "አዲስ መለያ ይክፈቱ",
      returnHome: "ወደ መነሻ ገጽ ይመለሱ",
      registerTitle: "የ MercatoX መለያ ይክፈቱ",
      registerSubtitle: "ትክክለኛ የኢትዮጵያ የንግድ ስነ-ምህዳርን ይቀላቀሉ",
      selectRole: "የመለያ አይነት ይምረጡ",
      customerRole: "ደንበኛ / ገዢ",
      sellerRole: "ነጋዴ / ቸርቻሪ",
      supplierRole: "አቅራቢ / የጅምላ አከፋፋይ",
      fullName: "ሙሉ ስም",
      phone: "ስልክ ቁጥር",
      email: "ኢሜይል አድራሻ",
      confirmPassword: "የይለፍ ቃል ያረጋግጡ",
      agreeTerms: "የ MercatoX የአገልግሎት ውሎችን እና የንግድ ደንቦችን እስማማለሁ",
      registerBtn: "ምዝገባን ያጠናቁ",
      haveAccount: "ቀደም ሲል መለያ አለዎት?",
      capsLock: "የካፕስ ሎክ (Caps Lock) በርቷል",
      cooldown: "የደህንነት እረፍት ገቢር ነው",
      accountBlocked: "መለያዎ ሙሉ በሙሉ ታግዷል",
      contactAdmin: "መለያዎን ለማስከፈት እባክዎን አስተዳዳሪ ያነጋግሩ።",
      valIdentifier: "እባክዎን ስልክ ቁጥር ወይም ኢሜይል ያስገቡ",
      valPassword: "የይለፍ ቃል ያስፈልጋል",
      valPasswordLen: "የይለፍ ቃል ቢያንስ 6 ፊደላት መሆን አለበት",
      customerRoleTitle: "ደንበኛ / ገዢ",
      customerRoleBadge: "ችርቻሮ እና ጅምላ",
      customerRoleDesc: "የግል ሸማች ወይም የድርጅት ግዢዎችን የሚያከናውኑ",
      customerFeat1: "ከ10,000+ በላይ የተረጋገጡ የኢትዮጵያ ነጋዴዎችን ያግኙ",
      customerFeat2: "ቀጥተኛ የቴሌብር እና የቻፓ ፈጣን ክፍያ",
      customerFeat3: "እስከ በርዎ ድረስ ቀጥተኛ የትዕዛዝ ክትትል",
      sellerRoleTitle: "ነጋዴ / ሻጭ",
      sellerRoleBadge: "የመደብር ባለቤት",
      sellerRoleDesc: "የችርቻሮ ሱቅ፣ ቡቲክ ወይም የንግድ ነጋዴ",
      sellerFeat1: "በመርካቶ፣ ቦሌ ወይም በድረ-ገጽ የተረጋገጠ ዲጂታል ሱቅ ይክፈቱ",
      sellerFeat2: "የካታሎግ አስተዳደር እና የሀገር ውስጥ ሽያጭ",
      sellerFeat3: "ቀጥተኛ የባንክ እና የቴሌብር አውቶማቲክ ክፍያዎች",
      supplierRoleTitle: "አቅራቢ / ጅምላ ሻጭ",
      supplierRoleBadge: "የ B2B ጅምላ ማዕከል",
      supplierRoleDesc: "ዋና የጅምላ አስመጪ፣ ፋብሪካ አምራች ወይም ዋና አከፋፋይ",
      supplierFeat1: "የጅምላ ስርጭት እና የኮንቴይነር ደረጃ የዋጋ ቅናሾች",
      supplierFeat2: "ቀጥተኛ የነጋዴ ግዢ ትዕዛዞች እና በኤስክሮው የተረጋገጡ ውሎች",
      supplierFeat3: "የንግድ ግብር ደረሰኝ (TIN/VAT) እና የደረቅ ወደብ ሎጅስቲክስ",
      socialRegistersAs: "በቀጥታ በ Google ወይም GitHub ይመዘገባል እንደ",
      orChooseAccountType: "ወይም ለመመዝገብ የመለያ አይነት ይምረጡ",
      courierPartnerNotice: "እንደ አጓጓዥ ወይም የትራንስፖርት አጋር መስራት ይፈልጋሉ?",
      courierPartnerDesc: "የሞተር እና የተሸከርካሪ አጓጓዦች ህጋዊ ማረጋገጫ ከተደረገ በኋላ በ MercatoX አድሚኖች ብቻ ይመዘገባሉ። እባክዎ የአድሚን አገልግሎትን ያነጋግሩ።",
      continueAs: "ቀጥል እንደ",
      changeAccountType: "የመለያ አይነት ቀይር",
      accountTypeSuffix: "መለያ",
      customerRegDesc: "በ MercatoX ላይ ግብይት ለመጀመር መረጃዎን ያስገቡ",
      sellerRegDesc: "የተረጋገጠ የነጋዴ ፈቃድ ለማግኘት የንግድ ዝርዝሮችን ያሟሉ",
      supplierRegDesc: "እንደ ተረጋገጠ የጅምላ አከፋፋይ፣ ፋብሪካ ወይም አስመጪ ይመዝገቡ",
    },
    marketplace: {
      title: "የገበያ ቦታ",
      subtitle: "ከተረጋገጡ የኢትዮጵያ ነጋዴዎች፣ አምራቾች እና ገበሬዎች በቀጥታ ይሸምቱ",
      all: "ሁሉም እቃዎች",
      wholesaleOnly: "የጅምላ",
      retailOnly: "ችርቻሮ",
      sortBy: "ደርድር",
      featured: "ተመራጭ",
      priceLowHigh: "ዋጋ: ከዝቅተኛ ወደ ከፍተኛ",
      priceHighLow: "ዋጋ: ከከፍተኛ ወደ ዝቅተኛ",
      topRated: "ከፍተኛ ደረጃ",
      filters: "ማጣሪያዎች",
      clearAll: "ሁሉንም አጽዳ",
      showingResults: "የሚታዩ ምርቶች",
      escrowProtected: "በኤስክሮው የተጠበቀ",
      noProductsFound: "ከማጣሪያው ጋር የሚዛመድ ምርት አልተገኘም",
      customerReviews: "የደንበኞች አስተያየት",
      departments: "ምድቦች",
      sourcingMode: "የንግድ አይነት",
      moqLabel: "ዝቅተኛ የትዕዛዝ መጠን (MOQ)",
      customPrice: "የተመረጠ ዋጋ",
      min: "ዝቅተኛ",
      max: "ከፍተኛ",
    },
    home: {
      heroTitle: "ከምርጥ የኢትዮጵያ አምራቾች እና ነጋዴዎች በቀጥታ ይሸምቱ",
      heroSubtitle: "ግልጽ ዋጋ፣ ትክክለኛ ምርቶች፣ ፈጣን ማድረስ እና አስተማማኝ የኤስክሮው ክፍያ ይደሰቱ።",
      shopMarketplace: "ገበያውን ይጎብኙ",
      browseCategories: "ምድቦችን ያስሱ",
      featuredProducts: "ተለይተው የቀረቡ ምርቶች",
      topSuppliers: "የተረጋገጡ የኢትዮጵያ አቅራቢዎች",
      dailyDeals: "የቀኑ ቅናሾች እና ሽያጮች",
      viewAll: "ሁሉንም እይ",
      whyChooseUs: "ለምን MercatoXን መረጡ?",
      fastDelivery: "ፈጣን የአዲስ አበባ ማድረስ",
      safeEscrow: "100% አስተማማኝ የኤስክሮው ክፍያ",
      authenticGuaranteed: "ትክክለኛ የኢትዮጵያ ምርቶች ዋስትና",
      popularDepartments: "ተወዳጅ የምርት ክፍሎች",
      youMayAlsoLike: "ሊወዷቸው የሚችሉ ሌሎች ምርቶች",
      seeAll: "ሁሉንም እይ",
      viewProduct: "ምርቱን እይ",
      exploreStore: "ሱቁን ጎብኝ",
      scrollDown: "ወደ ታች ይሸብልሉ",
      localPayments: "የሀገር ውስጥ ክፍያዎች",
      localPaymentsDesc: "ቴሌብር፣ ንግድ ባንክ እና ካርዶች",
      latestProducts: "አዳዲስ ምርቶች እና የምድብ ዝርዝሮች",
      latestProductsSub: "በየቀኑ የሚታደሱ አዳዲስ እና ጥራት ያላቸው ምርቶች",
      exploreAll: "ሁሉንም አስስ",
      acrossAddis: "በአዲስ አበባ እና በመላው ሀገሪቱ",
      fromSuppliers: "ከተረጋገጡ አቅራቢዎች በቀጥታ",
      escrowGuarantee: "የኤስክሮው እና የገዢ ዋስትና",
    },
    categories: {
      title: "ምድቦችን ያስሱ",
      subtitle: "ትክክለኛ የኢትዮጵያ ግብርና፣ የዕደ ጥበብ እና የፋብሪካ ምርቶችን ያግኙ",
      allCategories: "ሁሉም ምድቦች",
      viewProducts: "ምርቶችን እይ",
      itemsCount: "ምርቶች",
      trendingInAddis: "በአዲስ አበባ ተፈላጊ",
      exploreCollections: "ስብስቦችን ያስሱ",
      exploreVerified: "የተረጋገጡ ምርቶችን አስስ",
    },
    cart: {
      title: "የግዢ ጋሪ",
      empty: "ጋሪዎ ባዶ ነው",
      emptySub: "ትክክለኛ የኢትዮጵያ ምርቶችን ለማግኘት ገበያችንን ይጎብኙ",
      checkout: "ወደ ክፍያ ይቀጥሉ",
      continueShopping: "ግዢዎን ይቀጥሉ",
      orderSummary: "የትዕዛዝ ማጠቃለያ",
      deliveryFee: "የማድረሻ ክፍያ",
      freeDeliveryNotice: "ከ 5,000 ብር በላይ ለሆኑ ትዕዛዞች ነፃ ማድረሻ",
      freeBadge: "ነፃ",
      itemsCount: "እቃዎች",
      browseMarketplace: "ገበያውን ያስሱ",
      clearCart: "ጋሪን አጽዳ",
      youMayAlsoLike: "ሊወዷቸው የሚችሉ ሌሎች ምርቶች",
      productsInOrder: "በትዕዛዙ ውስጥ ያሉ ዕቃዎች",
      deliveringTo: "የሚደርስበት ሰው",
      unitPrice: "የአንዱ ዋጋ",
      color: "ቀለም",
      size: "መጠን",
      viewMore: "ተጨማሪ እይ",
      viewLess: "አሳንስ",
      escrowGuaranteeNotice: "ዕቃውን ተረክበው የ 4-አሃዝ የይለፍ ቃል እስኪያረጋግጡ ድረስ ገንዘብዎ በኤስክሮው ተቆልፎ ይቆያል።",
      curatedPicks: "ልዩ የተመረጡ ምርቶች",
    },
    favorites: {
      title: "የተወደዱ ምርቶች",
      subtitle: "ለወደፊት ግዢ ያስቀመጧቸው ተወዳጅ እቃዎች",
      empty: "ምንም የተቀመጠ እቃ የለም",
      emptySub: "ምርቶችን በልብ ምልክት ሲነኩ እዚህ ይቀመጣሉ",
      clearAll: "ሁሉንም አስወግድ",
      moveToCart: "ወደ ጋሪ ውሰድ",
      browseMarketplace: "ገበያውን ያስሱ",
      personalWishlist: "የግል የተወደዱ ዕቃዎች",
      savedCount: "የተቀመጡ እቃዎች",
      exploreMarketplace: "ገበያውን ያስሱ",
      addAllToCart: "ሁሉንም ወደ ጋሪ ጨምር",
      quickView: "ፈጣን እይታ",
      showingFavorites: "የተወደዱ ዕቃዎች",
      loadDemoItems: "የሙከራ ዕቃዎችን ጫን",
      recommendedForYou: "ለእርስዎ የተመረጡ",
      trendingWishlist: "ተወዳጅ የሆኑ ተፈላጊ ዕቃዎች",
    },
    orders: {
      title: "ትዕዛዞቼ",
      subtitle: "የትዕዛዝዎን ሁኔታ፣ የማድረስ ሂደት እና የክፍያ ሁኔታ ይከታተሉ",
      empty: "ምንም ትዕዛዝ አልተገኘም",
      emptySub: "እስካሁን ያዘዙት እቃ የለም። የመጀመሪያ ትዕዛዝዎን ዛሬ ይጀምሩ!",
      orderId: "የትዕዛዝ ቁጥር",
      orderDate: "ቀን",
      items: "ዕቃዎች",
      paymentStatus: "ክፍያ",
      deliveryStatus: "ማድረስ",
      totalAmount: "ጠቅላላ ዋጋ",
      viewDetails: "ዝርዝር እይ",
      trackOrder: "ትዕዛዝ ተከታተል",
      statusDelivered: "ደርሷል",
      statusProcessing: "በዝግጅት ላይ",
      statusPending: "በመጠባበቅ ላይ",
      statusShipped: "መንገድ ላይ",
      statusCancelled: "ተሰርዟል",
      paymentId: "የክፍያ መለያ",
      totalPrice: "ጠቅላላ ዋጋ",
      detailsTitle: "የትዕዛዝ ዝርዝሮች",
      buyerProtected: "100% የገዢ ጥበቃ ያለው",
      orderedOn: "የታዘዘበት ቀን",
      paymentIdentification: "የክፍያ እና የግብይት መረጃ",
      paidInEscrow: "ተከፍሎ በኤስክሮው የተያዘ",
      doorstepDelivery: "የማድረሻ መረጃ",
      recipientName: "የተቀባይ ሙሉ ስም",
      phoneForOtp: "ስልክ ቁጥር (ለ SMS OTP)",
      city: "ከተማ",
      subcity: "ክፍለ ከተማ",
      specificAddress: "ልዩ አድራሻ / ህንፃ / ምልክት",
      orderedProducts: "የታዘዙ ምርቶች",
      quantity: "ብዛት",
      subtotalPrice: "ንዑስ ድምር",
      courierFee: "የፖስታ ማድረሻ ክፍያ",
      freeBadge: "ነፃ",
      escrowProtocol: "የኤስክሮው ጥበቃ ዋስትና",
      totalPaid: "የተከፈለው ጠቅላላ ድምር",
      printReceipt: "ደረሰኝ አትም",
      deleteOrder: "ትዕዛዝ ሰርዝ",
      closeModal: "ዝጋ",
      copyTx: "ኮፒ",
      copiedTx: "ተገልብጧል!",
      confirmedPaid: "ተረጋግጦ ተከፍሏል",
      inTransit: "በመንገድ ላይ ነው",
    },
    card: {
      title: "MercatoX ዲጂታል ካርድ",
      subtitle: "ለፈጣን ግብይት፣ ቅናሾች እና የገበያ ክፍያዎች የተዘጋጀ ዲጂታል ካርድ",
      balance: "ቀሪ ሂሳብ",
      topUp: "ሒሳብ ሙላ",
      cardNumber: "የካርድ ቁጥር",
      validThru: "የሚያበቃበት",
      cardHolder: "የካርድ ባለቤት",
      recentTransactions: "የቅርብ ጊዜ እንቅስቃሴዎች",
      benefits: "የካርዱ ጥቅሞች",
      cashback: "የካሽባክ ቅናሾች",
      freezeCard: "ካርዱን አግድ",
      unfreezeCard: "ካርዱን ክፈት",
      applyCard: "ካርድ ያመልክቱ",
    },
    product: {
      addToCart: "ወደ ጋሪ ጨምር",
      buyNow: "አሁን ግዛ",
      outOfStock: "ያለቀ",
      inStock: "በክምችት ላይ ያለ",
      verifiedMerchant: "የተረጋገጠ ነጋዴ",
      escrowProtected: "በኤስክሮው የተጠበቀ",
      reviews: "አስተያየቶች",
      rating: "ደረጃ",
      description: "የምርት ዝርዝር",
      specifications: "ዝርዝር መግለጫ",
      relatedProducts: "ተመሳሳይ ምርቶች",
      minOrder: "ዝቅተኛ ትዕዛዝ",
      directEthioTrade: "ቀጥተኛ የኢትዮጵያ ንግድ",
      soldOut: "ተሽጦ ያለቀ",
      quickView: "ፈጣን እይታ",
      onlyLeft: "ብቻ ቀርተዋል",
    },
    footer: {
      newsletterTitle: "የ MercatoX ልዩ ቅናሾችን ያግኙ",
      newsletterSubtitle: "የቦሌ የቴክኖሎጂ ቅናሾች፣ የሺሮሜዳ ባህላዊ አልባሳት እና ልዩ የነጋዴ ማስተዋወቂያዎችን በኢሜይልዎ ያግኙ።",
      subscribeBtn: "ይመዝገቡ",
      placeholderEmail: "የኢሜይል አድራሻዎን ያስገቡ...",
      aboutPlatform: "ስለ MercatoX",
      company: "ድርጅት",
      aboutUs: "ስለ እኛ",
      careers: "ስራ እድሎች",
      press: "ዜና እና መግለጫዎች",
      customerService: "የደንበኞች አገልግሎት",
      helpCenter: "የእርዳታ ማዕከል",
      contactUs: "ያግኙን",
      shippingInfo: "የማድረሻ መረጃ",
      returnsRefunds: "የእቃ መመለሻ እና ተመላሽ ክፍያ",
      legal: "ህጋዊ መረጃዎች",
      termsOfService: "የአገልግሎት ውሎች",
      privacyPolicy: "የግላዊነት ፖሊሲ",
      security: "የኤስክሮው ደህንነት",
      allRightsReserved: "መብቱ በህግ የተጠበቀ ነው። የኢትዮጵያ የተጠበቀ ንግድ።",
      tagline: "የኢትዮጵያ ነጋዴዎችን፣ አምራቾችን እና ደንበኞችን የሚያስተሳስር ዘመናዊ የንግድ መድረክ።",
    },
    toast: {
      languageChanged: "ቋንቋ ወደ አማርኛ ተቀይሯል",
    },
    checkout: {
      title: "በገዢ ጥበቃ የተረጋገጠ ክፍያ",
      breadcrumbCart: "ጋሪ",
      breadcrumbCheckout: "ክፍያ እና የተጠበቀ ማረጋገጫ",
      protectionGuarantee: "100% የገዢ ጥበቃ ዋስትና",
      loadingSession: "የክፍያ ክፍለ ጊዜ በመጫን ላይ...",
      cartEmptyTitle: "ጋሪዎ በአሁኑ ጊዜ ባዶ ነው",
      cartEmptySub: "ወደ ክፍያ ከመሄድዎ በፊት እባክዎ እቃዎችን ወደ ጋሪዎ ያክሉ።",
      exploreMarketplace: "ገበያውን አስስ",
      customerInfo: "1. የደንበኛ መረጃ",
      loadedFromDb: "ከዳታቤዝ ተጭኗል",
      checkingSaved: "የተቀመጠ መረጃ በመፈተሽ ላይ...",
      contactSub: "ትዕዛዙ ለማን ይድረስ እና በ SMS OTP ለማን እናረጋግጥ?",
      recipientName: "የተቀባይ ሙሉ ስም",
      phoneForOtp: "ስልክ ቁጥር (ለ SMS OTP ማረጋገጫ)",
      emailReceipt: "ኢሜይል አድራሻ",
      emailReceiptSub: "(ለዲጂታል ደረሰኝ)",
      deliveryDetails: "2. የበር ላይ አቅርቦት ዝርዝሮች",
      dispatchedFrom: "በአዲስ አበባ ካሉ ከተረጋገጡ የሀገር ውስጥ ነጋዴዎች በቀጥታ የሚላክ።",
      city: "ከተማ",
      subcity: "የአዲስ አበባ ክፍለ ከተማ",
      specificAddress: "ልዩ አድራሻ / ህንፃ / መለያ ቦታ / የቤት ቁጥር",
      deliveryInstructions: "ለአጓጓዡ የሚሰጥ መመሪያ",
      optional: "(አስገዳጅ ያልሆነ)",
      saveAddressCheckbox: "ይህን የአድራሻ እና የእውቂያ መረጃ ለቀጣይ ትዕዛዞች አስቀምጥ",
      dbSync: "የዳታቤዝ ማመሳሰል",
      dbSyncSub: "አድራሻዎን በ PostgreSQL ዳታቤዝ ውስጥ በጥንቃቄ ያስቀምጣል እና በቀጣይ ትዕዛዝዎ በራስ-ሰር ይሞላል።",
      addressSavedSynced: "አድራሻው በዳታቤዝ ተቀምጧል እና ተመሳስሏል",
      loadedFromDbHint: "ከዳታቤዝ ተጭኗል (ከተቀየረ አርመው ያስቀምጡ)",
      checkBoxToSave: "ወደ መለያዎ ለማስቀመጥ ሳጥኑን ይምረጡ ወይም ቁልፉን ይጫኑ",
      signInToSave: "(አማራጭ፡ በሁሉም መሳሪያዎች ለማስቀመጥ ይግቡ)",
      saveAddressBtn: "አድራሻውን በዳታቤዝ አስቀምጥ",
      savingInDb: "በዳታቤዝ ላይ በማስቀመጥ ላይ...",
      paymentMethod: "3. የተጠበቀ የክፍያ ዘዴ",
      paymentMethodSub: "የሚመርጡትን የክፍያ አገልግሎት ይምረጡ። ገንዘብዎ በ OTP እስኪረጋገጥ ድረስ በጥንቃቄ ይጠበቃል።",
      chapaGateway: "የቻፓ ጌትዌይ",
      cardsAndMobile: "ካርዶች እና የሞባይል ባንኪንግ",
      chapaDesc: "ዴቢት ካርድ፣ ቪዛ፣ ማስተርካርድ፣ አዋሽ እና ዳሽን",
      mercatoxCard: "የ MercatoX ካርድ",
      digitalWallet: "ዲጂታል ቦርሳ እና የሽልማት ካርድ",
      mercatoxCardDesc: "ያለ ምንም የአገልግሎት ክፍያ (0% Fee)፣ ፈጣን ካሽባክ እና ነጥቦች",
      cashbackRewardTitle: "የቻፓ ክፍያ 2% የካርድ ካሽባክ ሽልማት",
      cashbackRewardDesc: "በቻፓ ይክፈሉ እና ከጠቅላላ ትዕዛዝዎ 2% በ MercatoX ካርድዎ ላይ እንደ ጉርሻ ሽልማት በራስ-ሰር ያግኙ!",
      checkingCard: "የ MercatoX ካርድ ሁኔታን በመፈተሽ ላይ...",
      noCardTitle: "የ MercatoX ካርድ አልተገኘም",
      cardRequired: "ካርድ ያስፈልጋል",
      noCardDesc: "በ MercatoX ካርድ ለመክፈል መጀመሪያ ካርድ መግዛት አለብዎት። አሁኑኑ ካርድዎን በመግዛት 0% የአገልግሎት ክፍያ እና 5% አውቶማቲክ ካሽባክ ያግኙ።",
      buyCardNow: "የ MercatoX ካርድ አሁኑኑ ይግዙ",
      switchToChapa: "ወደ ቻፓ ቀይር",
      insufficientBalanceTitle: "በቂ ያልሆነ የካርድ ሂሳብ",
      insufficientBalanceDesc: "ይህንን ትዕዛዝ ለመክፈል በቂ የካርድ ሂሳብ የለዎትም። እባክዎ ካርድዎን ይሙሉ ወይም ወደ ሌላ የክፍያ ዘዴ ይቀይሩ።",
      cardBalance: "የካርድ ሂሳብ",
      orderTotal: "የትዕዛዝ ጠቅላላ",
      shortage: "ጉድለት",
      topUpCard: "ካርድ ይሙሉ / ያስተዳድሩ",
      payWithChapa: "በቻፓ ይክፈሉ",
      sufficientBalanceTitle: "በቂ ሂሳብ አለ",
      readyToPay: "ለመክፈል ዝግጁ",
      manageCard: "ካርድ አስተዳድር",
      sufficientBalanceDesc: "ይህንን ግዢ በ 0% የአገልግሎት ክፍያ እና ፈጣን የኤስክሮው ጥበቃ ለመፈጸም በቂ የካርድ ሂሳብ አለዎት። 'በ MercatoX ካርድ ክፈል' የሚለውን ይጫኑ እና ባለ 8-ዲጂት የይለፍ ቃልዎን ያስገቡ።",
      orderPayment: "የትዕዛዝ ክፍያ",
      remainingBalance: "ቀሪ ሂሳብ",
      escrowProtocolTitle: "100% የገዢ ጥበቃ ፕሮቶኮል",
      escrowProtocolDesc: "ክፍያዎ በ MercatoX የተጠበቀ የኤስክሮው ሂሳብ ውስጥ ይቆያል። እቃውን በበርዎ ላይ ተመልክተው ባለ 4-ዲጂት SMS OTP ለአጓጓዡ እስካልሰጡ ድረስ ሻጩ ክፍያውን አይቀበልም።",
      orderSummary: "የትዕዛዝ ማጠቃለያ",
      items: "እቃዎች",
      item: "እቃ",
      productsInOrder: "በትዕዛዙ ውስጥ ያሉ ምርቶች",
      shown: "የታዩት",
      of: "ከ",
      viewMore: "ተጨማሪ አሳይ",
      viewLess: "ቀንስ",
      subtotal: "የእቃዎች ንዑስ ድምር",
      courierDelivery: "የበር ላይ አቅርቦት",
      freeOver5000: "ነፃ (ከ 5,000 ብር በላይ)",
      buyerProtectionCovered: "የተሸፈነ (0 ብር)",
      totalAmount: "ጠቅላላ ድምር",
      paymentGatewayLabel: "የክፍያ ጌትዌይ፦",
      authorizingCard: "የ MercatoX ካርድን በማረጋገጥ ላይ...",
      redirectingChapa: "ወደ ቻፓ ጌትዌይ በማስተላለፍ ላይ...",
      payWithCardBtn: "በ MercatoX ካርድ ክፈል",
      processToPayChapa: "በቻፓ ለመክፈል ቀጥል",
      returnToCart: "ወደ ግዢ ጋሪ ተመለስ",
      deliveryCommitment: "የአቅርቦት ዋስትና",
      deliveryCommitmentSub: "በአዲስ አበባ ውስጥ አማካይ የማድረሻ ጊዜ ከ 2 እስከ 4 ሰዓታት ነው። የአጓጓዡ ስልክ ቁጥር እና የመከታተያ መረጃ በ SMS ይደርስዎታል።",
      totalToPay: "የሚከፈለው ጠቅላላ",
      cardPinTitle: "የካርድ የደህንነት የይለፍ ቃል",
      cardPinSub: "ክፍያውን ለማረጋገጥ ባለ 8-ዲጂት የካርድ የይለፍ ቃልዎን ያስገቡ",
      cardholder: "የካርድ ባለቤት፦",
      cardNumber: "የካርድ ቁጥር፦",
      amountToDeduct: "የሚቀነሰው መጠን፦",
      balanceAfterDeduction: "ከክፍያ በኋላ የሚቀረው ሂሳብ፦",
      enter8DigitPin: "ባለ 8-ዲጂት የካርድ የይለፍ ቃል ያስገቡ",
      pinSentToEmail: "ወደ ኢሜይልዎ የተላከውን ባለ 8-ዲጂት የካርድ የይለፍ ቃል ያስገቡ",
      resendPinEmail: "የይለፍ ቃል ረሱ? ወደ ኢሜይል እንደገና ይላክ",
      sendingEmail: "በመላክ ላይ...",
      authorizingOrder: "ትዕዛዙን በማረጋገጥ እና በመቀነስ ላይ...",
      authorizeAndPay: "አረጋግጥ እና ክፈል",
      escrowBadge: "100% በኤስክሮው የተጠበቀ · 0% የአገልግሎት ክፍያ",
    },
    profile: {
      title: "የእኔ መገለጫ",
      verified: "የተረጋገጠ",
      totalOrders: "ጠቅላላ ትዕዛዞች",
      delivered: "የደረሱ",
      inTransit: "በመንገድ ላይ",
      personalInfo: "የግል መረጃ",
      edit: "አስተካክል",
      cancel: "ሰርዝ",
      saveChanges: "ለውጦችን አስቀምጥ",
      saving: "በማስቀመጥ ላይ...",
      fullName: "ሙሉ ስም",
      email: "ኢሜይል",
      altPhone: "ተጨማሪ ስልክ",
      deliveryAddress: "የመላኪያ አድራሻ",
      city: "ከተማ",
      subcity: "ክፍለ ከተማ",
      landmark: "መለያ ቦታ / ወረዳ",
      buyerProtected: "በገዢ ጥበቃ የተረጋገጠ መለያ",
      buyerProtectedSub: "ገንዘብዎ በጥንቃቄ ይጠበቃል — የሚለቀቀው በበር ላይ የ OTP ማረጋገጫ ከተሰጠ በኋላ ብቻ ነው።",
      myOrders: "ትዕዛዞቼ",
      myOrdersSub: "ሁሉንም ግዢዎችዎን ይመልከቱ",
      favorites: "የተወደዱ",
      favoritesSub: "የተቀመጡ ምርቶች",
      settings: "ቅንብሮች",
      settingsSub: "የመለያ ምርጫዎች",
      signOut: "ውጣ",
      signOutSub: "ከመለያዎ ይውጡ",
      verifyingAccess: "የመገለጫ መዳረሻን በማረጋገጥ ላይ...",
    },
    settings: {
      title: "የመለያ ቅንብሮች",
      security: "ደህንነት",
      alerts: "ማሳወቂያዎች",
      appearance: "ገጽታ",
      about: "ስለ ስርዓቱ",
      mode: "ሁነታ",
      passwordSecurity: "የይለፍ ቃል እና ደህንነት",
      passwordSecuritySub: "የመለያዎን ሚስጥራዊ መረጃ ያዘምኑ",
      currentPassword: "የአሁኑ የይለፍ ቃል",
      newPassword: "አዲስ የይለፍ ቃል",
      confirmNewPassword: "የይለፍ ቃል አረጋግጥ",
      updatePassword: "የይለፍ ቃል አዘምን",
      updating: "በማዘመን ላይ...",
      passwordUpdated: "የይለፍ ቃል ተዘምኗል!",
      editProfile: "መገለጫ አስተካክል",
      editProfileSub: "ስም፣ ኢሜይል፣ የመላኪያ አድራሻ",
      myOrders: "ትዕዛዞቼ",
      myOrdersSub: "ትዕዛዞችዎን ይከታተሉ እና ያስተዳድሩ",
      signOut: "ውጣ",
      signOutSub: "ከ MercatoX ይውጡ",
      notifications: "የማሳወቂያ ምርጫዎች",
      notificationsSub: "ማንቂያዎችን እና ግንኙነቶችን ያስተዳድሩ",
      smsOtp: "የበር ላይ SMS OTP",
      smsOtpSub: "አጓጓዡ በርዎ ላይ ሲደርስ የሚላክ ባለ 4-ዲጂት OTP",
      requiredBadge: "አስፈላጊ",
      emailInvoice: "የትዕዛዝ እና የደረሰኝ ኢሜይሎች",
      emailInvoiceSub: "የኤስክሮው ማረጋገጫዎች እና ህጋዊ ደረሰኞች ወደ ኢሜይልዎ ይላካሉ",
      marketPromos: "የገበያ ቅናሾች",
      marketPromosSub: "ከቦሌ፣ መርካቶ እና ከተረጋገጡ ነጋዴዎች የሚወጡ ልዩ ቅናሾች",
      escrowOtpTitle: "የኤስክሮው OTP ጥበቃ",
      escrowOtpSub: "የ SMS OTP ኮድዎ በ MercatoX የበር ላይ ርክክብ የመጨረሻው ማረጋገጫ ነው። አጓጓዡ የእርስዎን ቃል ኮድ ሳያገኝ ትዕዛዙን ደርሷል ማለት አይችልም።",
      themeTitle: "የስርዓቱ ገጽታ",
      themeSub: "የሚመርጡትን የቀለም እና የካርድ ገጽታ ይምረጡ",
      modeLight: "ብሩህ (Light)",
      modeLightSub: "ንጹህ ነጭ ካርዶች",
      modeDark: "ጨለማ (Dark)",
      modeDarkSub: "ጥቁር ከሰል ካርዶች",
      modeSystem: "ሰማያዊ (System)",
      modeSystemSub: "ሳፋየር ሰማያዊ ካርዶች",
      platformInfo: "የመድረኩ መረጃ",
      platformInfoSub: "የ MercatoX ገበያ ስርዓት ዝርዝሮች",
      platform: "መድረክ",
      currency: "የገንዘብ አይነት",
      deliveryRegion: "የአቅርቦት ክልል",
      escrowSystem: "የኤስክሮው ስርዓት",
      paymentGateway: "የክፍያ ጌትዌይ",
      accountId: "የእርስዎ መለያ መለያ ቁጥር",
      escrowProtectedTitle: "በኤስክሮው የተጠበቀ",
      escrowProtectedSub: "በ MercatoX ላይ የሚደረጉ ሁሉም ግብይቶች በኤስክሮው ስርዓታችን የተጠበቁ ናቸው። ገንዘብ በጥንቃቄ ተይዞ ለሻጮች የሚለቀቀው በበር ላይ የ OTP ኮድ ሲያረጋግጡ ብቻ ነው።",
      secureBadge: "ደህንነቱ የተጠበቀ",
      otpVerifiedBadge: "በ OTP የተረጋገጠ",
      escrowBadge: "ኤስክሮው",
      verifyingAccess: "የቅንብሮች መዳረሻን በማረጋገጥ ላይ...",
    },
    admin: {
      nav: {
        overview: "አጠቃላይ እይታ እና ትንተና",
        catalog: "ምርቶች",
        categories: "ምድቦች",
        users: "ተጠቃሚዎች",
        suppliers: "አቅራቢዎች እና መርከቦች",
        orders: "ትዕዛዞች እና ኤስክሮው",
        slips: "ደረሰኞች እና ክፍያዎች ኦዲት",
        subscriptions: "የደንበኝነት ምዝገባዎች",
        delivery: "ማጓጓዣ እና አሽከርካሪዎች",
        disputes: "ክርክሮች እና ተመላሾች",
        audit: "የደህንነት ኦዲት መዝገብ",
        settings: "የስርዓቱ ማስተካከያዎች",
        coreMonitoring: "ዋና ቁጥጥር",
        commerceCatalog: "ንግድ እና ካታሎግ",
        logisticsCare: "ሎጅስቲክስ እና ድጋፍ",
        governanceSystem: "አስተዳደር እና ስርዓት",
        clusterActive: "ክላስተር፦ ንቁ",
        superAdmin: "ዋና የበላይ አስተዳዳሪ",
        signOut: "ውጣ",
        searchPlaceholder: "ነጋዴዎችን፣ ትዕዛዞችን፣ ደረሰኞችን ፈጥነው ይፈልጉ... (Ctrl+K)",
        complianceApprovals: "ተገዢነት እና ማጽደቆች",
        pendingBadge: "በመጠባበቅ ላይ",
        allCaughtUp: "ሁሉም የተጣራ ነው",
        noSupplierAlerts: "ምንም ማረጋገጫ የሚጠብቁ አዳዲስ የአቅራቢ ማመልከቻዎች የሉም።",
        refresh: "አድስ",
        refreshing: "በማደስ ላይ...",
        reviewApplication: "ማመልከቻውን ይገምግሙ",
        adminConsole: "የድርጅት አስተዳዳሪ ኮንሶል",
        masterSuperAdmin: "ዋና የበላይ አስተዳዳሪ",
        verifiedActive: "የተረጋገጠ እና ንቁ",
        accountStatus: "የመለያ ሁኔታ",
        verifyingClearance: "የአድሚን የደህንነት ፈቃድ በመፈተሽ ላይ...",
      },
      overview: {
        title: "የመድረክ ትንተና እና አጠቃላይ እይታ",
        subtitle: "የቀጥታ የግብይት መጠን፣ የትዕዛዝ ፍሰት እና የገበያ መለኪያዎች።",
        backendSynced: "ከዋናው ዳታቤዝ ጋር የተገናኘ",
        updated: "የታደሰበት ሰዓት",
        totalProducts: "ጠቅላላ ምርቶች",
        activeInStock: "በመደብር ውስጥ ያሉ",
        totalOrders: "ጠቅላላ ትዕዛዞች",
        ordersProcessed: "የተከናወኑ የደንበኛ ትዕዛዞች",
        totalUsers: "ጠቅላላ ተጠቃሚዎች",
        regularBuyers: "መደበኛ ገዢዎች",
        registeredCustomers: "የተመዘገቡ ደንበኞች (ከአድሚን ውጭ)",
        totalSellers: "ጠቅላላ ሻጮች",
        verifiedMerchants: "የተረጋገጡ ነጋዴዎች",
        registeredMerchants: "የተመዘገቡ የመደብር ነጋዴዎች",
        orderFulfillmentPipeline: "የትዕዛዝ ማድረሻ ሂደት",
        viewAllOrders: "ሁሉንም ትዕዛዞች ይመልከቱ",
        confirmedOrders: "የተረጋገጡ ትዕዛዞች",
        inProcessing: "በዝግጅት ላይ",
        inTransit: "በመጓጓዝ ላይ",
        deliveredCleared: "የደረሱ እና የተጠናቀቁ",
        cancelledReturned: "የተሰረዙ / የተመለሱ",
        volume: "መጠን",
        clusterFleetHealth: "የማይክሮ ሰርቪስ ክላስተር ጤና ሁኔታ",
        operationalHealthy: "5 ከ 5 ሙሉ በሙሉ የሚሰሩ · ሁሉም አገልግሎቶች ጤናማ ናቸው",
        connectedMicroservices: "ከዋናው የማይክሮ ሰርቪስ ጋር ተገናኝቷል",
        metricsUpdated: "መለኪያዎች ከዳታቤዝ ታድሰዋል",
      },
      catalog: {
        title: "የምርቶች አስተዳደር",
        subtitle: "የገበያ ካታሎግ ምርቶችን ይገምግሙ፣ ያግዱ፣ ወይም መልሰው ያንቁ።",
        searchPlaceholder: "በምርት ስም፣ በሻጭ ወይም በምድብ ይፈልጉ...",
        filterAll: "ሁሉም ሁኔታዎች",
        filterActive: "ንቁ",
        filterOutOfStock: "ያለቀ",
        colProduct: "የምርት ዝርዝር",
        colMerchant: "ነጋዴ / ሱቅ",
        colCategory: "ምድብ",
        colPrice: "ዋጋ (ብር)",
        colStock: "የእቃ ብዛት",
        colStatus: "ሁኔታ",
        colAction: "ተግባር",
        loadingProducts: "ምርቶችን ከዳታቤዝ በመጫን ላይ...",
        noProducts: "በተመረጠው ማጣሪያ ምንም ምርት አልተገኘም።",
        viewDetails: "ዝርዝር እይ",
        suspend: "አግድ",
        activate: "አንቃ",
        delete: "ሰርዝ",
        merchantStore: "የነጋዴ ሱቅ",
        confirmDelete: "ምርቱን ሰርዝ",
        confirmDeleteDesc: "ይህን ምርት በቋሚነት ለመሰረዝ እርግጠኛ ነዎት? ይህ እርምጃ ሊቀለበስ አይችልም።",
        cancel: "ተመለስ",
        deleting: "በመሰረዝ ላይ...",
        activeStatus: "ንቁ",
        outOfStockStatus: "ያለቀ",
      },
      categories: {
        title: "የምድቦች አስተዳደር",
        subtitle: "የገበያውን የምድብ ተዋረድ እና አሰሳ ያደራጁ።",
        addCategory: "ምድብ ጨምር",
        editCategory: "ምድብ አርትዕ",
        categoryName: "የምድብ ስም",
        categorySlug: "የዩአርኤል ስም (Slug)",
        categoryDesc: "መግለጫ",
        categoryIcon: "የአይኮን ስም",
        searchPlaceholder: "ምድቦችን ፈልግ...",
        colName: "የምድብ ስም",
        colSlug: "ስላግ",
        colProductsCount: "ምርቶች",
        colCreated: "የተፈጠረበት",
        colAction: "ተግባር",
        saving: "በማስቀመጥ ላይ...",
        save: "ምድቡን መዝግብ",
        noCategories: "ምንም ምድቦች አልተገኙም።",
        loadingCategories: "ምድቦችን በመጫን ላይ...",
        deleteCategory: "ምድቡን ሰርዝ",
        confirmDeleteCat: "ይህን ምድብ ለመሰረዝ እርግጠኛ ነዎት?",
      },
      users: {
        title: "የተጠቃሚዎች አስተዳደር እና KYC",
        subtitle: "ደንበኞችን፣ ነጋዴዎችን፣ አሽከርካሪዎችን እና አስተዳዳሪዎችን ይቆጣጠሩ።",
        searchPlaceholder: "ተጠቃሚዎችን በስም፣ ኢሜይል፣ ስልክ ወይም ንግድ ፈልግ...",
        roleAll: "ሁሉም ሚናዎች",
        roleCustomer: "ደንበኞች",
        roleSeller: "ሻጮች",
        roleDelivery: "አሽከርካሪዎች",
        roleSupplier: "አቅራቢዎች",
        roleAdmin: "አስተዳዳሪዎች",
        statusAll: "ሁሉም ሁኔታዎች",
        statusVerified: "የተረጋገጠ",
        statusPending: "KYC በመጠባበቅ ላይ",
        statusRejected: "ውድቅ የተደረገ",
        colUser: "የተጠቃሚ መገለጫ",
        colRole: "ሚና",
        colContact: "የመገናኛ መረጃ",
        colKyc: "የKYC ሁኔታ",
        colAccountStatus: "የመለያ ሁኔታ",
        colJoined: "የተመዘገበበት ቀን",
        colAction: "ተግባር",
        active: "ንቁ",
        blocked: "የታገደ",
        locked: "የተቆለፈ",
        approveKyc: "KYC አጽድቅ",
        rejectKyc: "KYC ውድቅ አድርግ",
        blockUser: "ተጠቃሚን አግድ",
        unblockUser: "ዕገዳ አንሳ",
        unlockUser: "መለያውን ክፈት",
        deleteUser: "ተጠቃሚውን ሰርዝ",
        viewUserDetail: "ሙሉ ዝርዝር ይመልከቱ",
        noUsers: "ከተመረጡት መስፈርቶች ጋር የሚዛመድ ተጠቃሚ የለም።",
        loadingUsers: "ተጠቃሚዎችን ከዳታቤዝ በመጫን ላይ...",
        kycModalTitle: "የKYC ማረጋገጫ ሰነዶች",
        kycModalSub: "የመንግስት መታወቂያ፣ የንግድ ፈቃድ እና የግብር ሰነዶችን ይመርምሩ።",
      },
      suppliers: {
        title: "የአቅራቢዎች እና መርከቦች ማውጫ",
        subtitle: "የነጋዴ ማመልከቻዎችን፣ የንግድ ፈቃዶችን፣ የቲን ቁጥሮችን እና ተሽከርካሪዎችን ያረጋግጡ።",
        searchPlaceholder: "አቅራቢዎችን በስም፣ ሱቅ ወይም አካባቢ ፈልግ...",
        allSuppliers: "ሁሉም አቅራቢዎች",
        pendingReview: "ግምገማ የሚጠብቁ",
        verifiedSuppliers: "የተረጋገጡ",
        rejectedSuppliers: "ውድቅ የተደረጉ",
        colSupplier: "አቅራቢ / ሱቅ",
        colLocation: "የገበያ ዞን",
        colContact: "ስልክ እና ኢሜይል",
        colFleet: "የተሽከርካሪ ብዛት",
        colVerification: "ማረጋገጫ",
        colAction: "ተግባር",
        reviewDocuments: "ሰነዶችን መርምር",
        tradeLicense: "የንግድ ፈቃድ",
        tinNumber: "የቲን ቁጥር (TIN)",
        approveSupplier: "አቅራቢውን አጽድቅ",
        rejectSupplier: "ማመልከቻውን ውድቅ አድርግ",
        rejectionReason: "የውድቅ የተደረገበት ምክንያት",
        loadingSuppliers: "አቅራቢዎችን እና ተሽከርካሪዎችን በመጫን ላይ...",
        noSuppliers: "ምንም የአቅራቢ መረጃ አልተገኘም።",
      },
      orders: {
        title: "የትዕዛዞች እና የኤስክሮው አስተዳደር",
        subtitle: "በኤስክሮው የተያዙ ክፍያዎችን ይከታተሉ፣ አሽከርካሪዎችን ይመድቡ እና ገንዘብ ይልቀቁ።",
        searchPlaceholder: "በትዕዛዝ ቁጥር፣ በደንበኛ ስም፣ በስልክ ወይም በነጋዴ ፈልግ...",
        escrowBalance: "የኤስክሮው ቀሪ ሂሳብ",
        escrowFundsProtected: "የደንበኛው ገንዘብ እቃው ደጃፍ እስኪደርስ ድረስ በታማኝነት የተያዘ ነው",
        statusAll: "ሁሉም ትዕዛዞች",
        statusConfirmed: "የተረጋገጡ",
        statusProcessing: "በዝግጅት ላይ",
        statusInTransit: "በመጓጓዝ ላይ",
        statusDelivered: "የደረሱ",
        statusCancelled: "የተሰረዙ",
        colOrder: "ትዕዛዝ ቁጥር",
        colCustomer: "ደንበኛ",
        colAddress: "የማድረሻ አድራሻ",
        colAmount: "መጠን (ብር)",
        colPayment: "ክፍያ",
        colStatus: "ሁኔታ",
        colRider: "የተመደበው አሽከርካሪ",
        colAction: "ተግባር",
        assignRider: "አሽከርካሪ መድብ",
        releaseEscrow: "ኤስክሮው ልቀቅ",
        refundOrder: "ገንዘቡን ለገዢ መልስ",
        viewOrderDetails: "ትዕዛዙን እይ",
        escrowReleased: "የተለቀቀ",
        escrowHeld: "በኤስክሮው የተያዘ",
        loadingOrders: "ትዕዛዞችን እና የኤስክሮው ሁኔታን በመጫን ላይ...",
        noOrders: "ምንም ትዕዛዞች አልተገኙም።",
      },
      slips: {
        title: "የባንክ ደረሰኞች እና የክፍያ ማረጋገጫ",
        subtitle: "የCBE፣ አዋሽ፣ ቴሌብር የባንክ ተቀማጭ ደረሰኞችን ይመርምሩ እና ያረጋግጡ።",
        searchPlaceholder: "በማመሳከሪያ ቁጥር፣ በከፋይ ስም፣ በባንክ ወይም በስልክ ፈልግ...",
        pendingSlips: "በመጠባበቅ ላይ ያሉ ደረሰኞች",
        approvedSlips: "የጸደቁ",
        rejectedSlips: "ውድቅ የተደረጉ",
        colReference: "ማመሳከሪያ ቁጥር",
        colPayer: "ከፋይ",
        colBank: "ባንክ / መንገድ",
        colAmount: "የተከፈለው መጠን",
        colDate: "የገባበት ቀን",
        colStatus: "ማረጋገጫ",
        colAction: "ተግባር",
        viewSlip: "ደረሰኙን እይ",
        approveSlip: "ደረሰኙን አጽድቅ",
        rejectSlip: "ደረሰኙን ውድቅ አድርግ",
        slipReceiptTitle: "የባንክ ተቀማጭ ደረሰኝ ማረጋገጫ",
        noSlips: "ምንም ማረጋገጫ የሚጠብቁ የባንክ ደረሰኞች የሉም።",
        loadingSlips: "የክፍያ ደረሰኞችን በመጫን ላይ...",
      },
      delivery: {
        title: "የማጓጓዣ አውታረ መረብ እና መላኪያ",
        subtitle: "የሞተር ሳይክል፣ የቫን አሽከርካሪዎችን፣ ዞኖችን እና የቀጥታ ሁኔታን ያስተባብሩ።",
        searchPlaceholder: "አሽከርካሪዎችን በስም፣ በስልክ፣ በሰሌዳ ወይም በዞን ፈልግ...",
        allRiders: "ሁሉም አሽከርካሪዎች",
        activeRiders: "ንቁ / በስራ ላይ",
        busyRiders: "እቃ በማድረስ ላይ",
        offlineRiders: "ከስራ ውጭ",
        addRider: "አሽከርካሪ ጨምር",
        colRider: "አሽከርካሪ",
        colVehicle: "ተሽከርካሪ እና ሰሌዳ",
        colZone: "የተመደበበት ዞን",
        colActiveOrders: "ንቁ ስራዎች",
        colStatus: "የስራ ሁኔታ",
        colAction: "ተግባር",
        dispatchOrder: "ትዕዛዙን ላክ",
        vehicleMotorcycle: "ሞተር ሳይክል",
        vehicleVan: "ቫን / አይሱዙ",
        vehicleBicycle: "ብስክሌት",
        loadingRiders: "አሽከርካሪዎችን በመጫን ላይ...",
        noRiders: "ምንም የተመዘገቡ አሽከርካሪዎች የሉም።",
      },
      disputes: {
        title: "ክርክሮች እና የዳኝነት ውሳኔዎች",
        subtitle: "የደንበኛ እና ሻጭ አለመግባባቶችን ይፍቱ፣ ማስረጃዎችን ይመርምሩ እና ውሳኔ ይስጡ።",
        searchPlaceholder: "ክርክሮችን በትዕዛዝ ቁጥር፣ በደንበኛ ወይም በምክንያት ፈልግ...",
        allDisputes: "ሁሉም ክርክሮች",
        openDisputes: "ክፍት ክርክሮች",
        resolvedDisputes: "የተፈቱ",
        colDispute: "የክርክር መለያ",
        colOrder: "የትዕዛዝ ቁጥር",
        colParties: "ደንበኛ ከ ሻጭ",
        colReason: "የክርክር ምክንያት",
        colAmount: "የተከራከሩበት መጠን",
        colStatus: "ሁኔታ",
        colAction: "ተግባር",
        inspectEvidence: "ማስረጃዎችን መርምር",
        refundCustomer: "ውሳኔ፦ ለደንበኛው መልስ",
        releaseSeller: "ውሳኔ፦ ለሻጩ ልቀቅ",
        loadingDisputes: "የክርክር ጉዳዮችን በመጫን ላይ...",
        noDisputes: "ምንም ክፍት የክርክር ጉዳዮች የሉም።",
      },
      subscriptions: {
        title: "የደንበኝነት ምዝገባዎች እና የነጋዴ ጥቅሎች",
        subtitle: "የሻጮች እና አቅራቢዎች ጥቅሎችን፣ የኮሚሽን መጠኖችን እና ገደቦችን ያዋቅሩ።",
        tabPlans: "የደንበኝነት ጥቅሎች",
        tabSubscribers: "የተመዘገቡ ነጋዴዎች",
        addPlan: "አዲስ ጥቅል ፍጠር",
        planName: "የጥቅል ስም",
        planPrice: "ወርሃዊ ዋጋ (ብር)",
        commissionRate: "የኮሚሽን መጠን (%)",
        productLimit: "የምርት ገደብ",
        targetRole: "ዒላማ ሚና",
        features: "የተካተቱ ጥቅሞች",
        savePlan: "ጥቅሉን መዝግብ",
        activePlan: "ንቁ",
        loadingPlans: "የጥቅል መረጃዎችን በመጫን ላይ...",
        noPlans: "ምንም የተዘጋጁ ጥቅሎች የሉም።",
      },
      settings: {
        title: "የስርዓቱ ማስተካከያዎች እና ህጎች",
        subtitle: "የመድረኩን ኮሚሽን፣ የኤስክሮው ማቆያ ሰዓት፣ የጥገና ሁነታ እና ብራንዲንግ ያዋቅሩ።",
        platformName: "የመድረክ ስም",
        platformTagline: "የመድረክ መሪ ቃል",
        platformFee: "የመድረክ ኮሚሽን ክፍያ (%)",
        escrowHoldHours: "የኤስክሮው ማቆያ ጊዜ (በሰዓታት)",
        maintenanceMode: "የጥገና ሁነታ",
        maintenanceDesc: "ለእድሳት እና ለጥገና ሲባል ለተጠቃሚዎች ግዢን ለጊዜው ያግዱ።",
        saveChanges: "ለውጦችን መዝግብ",
        saving: "በማስቀመጥ ላይ...",
        settingsSaved: "የስርዓቱ ማስተካከያዎች በተሳካ ሁኔታ ተመዝግበዋል!",
        resetDefaults: "ወደ መደበኛ መልስ",
        brandingSettings: "የብራንድ እና የእይታ ማንነት",
        escrowSettings: "የኤስክሮው እና አስተዳደራዊ ህጎች",
      },
      audit: {
        title: "የደህንነት ኦዲት እና የተግባር መዝገብ",
        subtitle: "ሁሉንም የአስተዳዳሪ እርምጃዎች፣ የKYC ለውጦች፣ የትዕዛዝ ማስተካከያዎች እና የመግቢያ ሙከራዎችን ይከታተሉ።",
        searchPlaceholder: "የኦዲት መዝገቦችን በፈጻሚ፣ ተግባር፣ አይፒ ወይም ዝርዝር ፈልግ...",
        filterAll: "ሁሉም ክስተቶች",
        filterAuth: "ማረጋገጫ እና መግባት",
        filterUsers: "የተጠቃሚ አስተዳደር",
        filterKyc: "የKYC አስተዳደር",
        filterProducts: "ምርቶች እና ካታሎግ",
        filterOrders: "ትዕዛዞች እና ኤስክሮው",
        filterPayments: "ክፍያዎች እና ደረሰኞች",
        colTimestamp: "ሰዓት እና ቀን",
        colActor: "ፈጻሚ / አድሚን",
        colAction: "የተወሰደ እርምጃ",
        colSeverity: "ደረጃ",
        colDetails: "ዝርዝር እና አይፒ",
        exportLogs: "በ CSV አውርድ",
        loadingLogs: "የደህንነት መዝገቦችን በመጫን ላይ...",
        noLogs: "ምንም የኦዲት መዝገብ አልተገኘም።",
      },
      details: {
        backToAdmin: "ወደ አድሚን ዳሽቦርድ ተመለስ",
        orderDetails: "የትዕዛዝ ዝርዝር እና የኤስክሮው ክትትል",
        productDetails: "የምርት ካታሎግ ዝርዝር",
        userDetails: "የተጠቃሚ እና ነጋዴ የKYC ማህደር",
        supplierDetails: "የአቅራቢ መገለጫ እና ሰነዶች",
        loadingDetails: "ዝርዝሮችን ከዳታቤዝ በመጫን ላይ...",
        saveChanges: "ለውጦችን መዝግብ",
        status: "ሁኔታ",
        information: "መረጃ",
        documents: "ህጋዊ ሰነዶች",
      },
    },
  },

  om: {
    nav: {
      home: "Mana",
      marketplace: "Gabaa",
      categories: "Ramaddiiwwan",
      adminDashboard: "Daashboordii Bulchiinsaa",
      supplierDashboard: "Daashboordii Dhiyeessaa",
      sellerDashboard: "Daashboordii Gurguraa",
      cart: "Gaarii",
      favorites: "Jaallataman",
      saved: "Qusataman",
      signIn: "Seeni",
      register: "Galmaa'i",
      myAccount: "Herrega Koo",
      orders: "Ajajawwan Koo",
      profile: "Piroofaayilii",
      settings: "Qindaa'inoota",
      logout: "Ba'i",
      rfq: "Gaaffii Jumlaa (RFQ)",
      wholesale: "Daldala Jumlaa",
      retail: "Qinxaa",
      explore: "Daawwadhaa",
    },
    header: {
      searchPlaceholder: "Buna Itoophiyaa dhugaa, uffata, xaafii, mi'eessituu fi meeshaalee jumlaa barbaadi...",
      allDepts: "Kutaalee Hunda",
      tradeBanner: "Daldala Qajeeltoo Itoophiyaa · Oomisha Dhugaa fi Kaffaltii Amansiisaa",
      language: "Afaan",
      selectLanguage: "Afaan Filadhaa",
      welcome: "Baga Nagaan Dhuftan",
      deals: "Gurgurtaa Har'aa",
      zones: "Zooniiwwan Gabaa",
      appearance: "Bifa",
      escrowBadge: "Eskiroowtiin Kan Eegame",
    },
    common: {
      save: "Olkaawi",
      cancel: "Haqi",
      clear: "Qulqulleessi",
      filter: "Gingilchi",
      apply: "Hojiirra Oolchi",
      reset: "Deebisi",
      viewAll: "Hunda Ilaali",
      loading: "Fe'amaa jira...",
      addToCart: "Gara Gaariitti Galchi",
      buyNow: "Amma Biti",
      inStock: "Kuusaa Keessa Jira",
      outOfStock: "Dhumateera",
      price: "Gatii",
      rating: "Sadarkaa",
      qty: "Baay'ina",
      total: "Ida'ama",
      subtotal: "Ida'ama Xiqqaa",
      status: "Haala",
      date: "Guyyaa",
      actions: "Tarkaanfiiwwan",
      close: "Cufi",
      back: "Duubatti",
      remove: "Balleessi",
      edit: "Gulaali",
      share: "Qoodi",
    },
    auth: {
      signInTitle: "Gara herrega keessaniitti seenaa",
      signInSubtitle: "Ajajawwan, meeshaalee jaallataman fi gabaa Itoophiyaa keessan daawwadhaa",
      identifierLabel: "Lakk Bilbilaa ykn Imeelii",
      identifierPlaceholder: "09... ykn maqaa@example.com",
      passwordLabel: "Jechama Darbiinsa",
      passwordPlaceholder: "Jechama darbiinsaa galchaa",
      rememberMe: "Meeshaa kana guyyoota 30f yaadadhu",
      forgotPassword: "Jechama darbiinsaa irraanfattanii?",
      signInBtn: "Gara Herregaatti Seeni",
      orContinueWith: "ykn kanaan itti fufaa",
      googleBtn: "Herrega Google'n itti fufaa",
      githubBtn: "Herrega GitHub'n itti fufaa",
      noAccount: "Herrega hin qabdanii?",
      createAccount: "Herrega banaa",
      returnHome: "Gara Fuula Manatti Deebi'aa",
      registerTitle: "Herrega MercatoX banaa",
      registerSubtitle: "Sirna daldala dijitaalaa Itoophiyaa mirkanaa'etti makamaa",
      selectRole: "Gahee herregaa filadhaa",
      customerRole: "Maamila / Bitaa",
      sellerRole: "Daldalaa / Gurguraa",
      supplierRole: "Dhiyeessaa / Jumlaa",
      fullName: "Maqaa Guutuu",
      phone: "Lakk Bilbilaa",
      email: "Teessoo Imeelii",
      confirmPassword: "Jechama darbiinsaa mirkaneessaa",
      agreeTerms: "Waliigaltee tajaajila MercatoX fi qajeelfamoota daldalaan walii gala",
      registerBtn: "Galmee Xumuri",
      haveAccount: "Kanaan dura herrega qabduu?",
      capsLock: "Caps Lock hojjachaa jira",
      cooldown: "Yeroon boqonnaa nageenyaa eegalameera",
      accountBlocked: "Herregni keessan guutummaatti cufameera",
      contactAdmin: "Herrega keessan banuuf bulchaa qunnamaa.",
      valIdentifier: "Lakk bilbilaa ykn imeelii galchaa",
      valPassword: "Jechama darbiinsaa barbaachisaadha",
      valPasswordLen: "Jechamni darbiinsaa qubee 6 gadi ta'uu hin qabu",
      customerRoleTitle: "Maamiltoota / Bitaa",
      customerRoleBadge: "Qinxaa fi Jumlaa",
      customerRoleDesc: "Bitaa dhuunfaa ykn daldalaa ajaja kennu",
      customerFeat1: "Daldaltoota Itoophiyaa mirkanaa'an 10,000+ argadhaa",
      customerFeat2: "Kaffaltii saffisaa Telebirr fi Chapa",
      customerFeat3: "Hordooffii ajaja gara balbala keessaniitti",
      sellerRoleTitle: "Daldalaa / Gurguraa",
      sellerRoleBadge: "Abbaa Suuqii",
      sellerRoleDesc: "Suuqii qinxaa, buutikii ykn daldalaa naannoo",
      sellerFeat1: "Markaatoo, Boolee ykn toora interneetiirratti suuqii banaa",
      sellerFeat2: "Bulchiinsa oomishaa fi gurgurtaa naannoo",
      sellerFeat3: "Kaffaltii kallattii baankii fi Telebirr",
      supplierRoleTitle: "Dhiyeessaa / Jumlaa",
      supplierRoleBadge: "Wiirtuu B2B Jumlaa",
      supplierRoleDesc: "Galgala galaana irraa galchu, warshaa ykn raabsaa guddaa",
      supplierFeat1: "Raabsa jumlaa fi gatii konteenaraa gadi aanaa",
      supplierFeat2: "Waliigaltee ajaja daldaltootaa fi eegumsa eskiroow",
      supplierFeat3: "Nagahee gibiraa (TIN/VAT) fi lojistiksii buufata gogaa",
      socialRegistersAs: "Kallattiin Google ykn GitHub dhaan galmaa'a akka",
      orChooseAccountType: "Yookiin gosa herregaa filachuun galmaa'aa",
      courierPartnerNotice: "Akka geejjibsiisaa ykn michuu tiraanispoortiitti hojjechuu barbaadduu?",
      courierPartnerDesc: "Konkolaachiftoonni fi motoraan geessitootni qorannoo booda qofa bulchitoota MercatoX tiin galmaa'u. Maaloo bulchiinsa qunnamaa.",
      continueAs: "Itti fufi akka",
      changeAccountType: "Gosa Herregaa Jijjiiri",
      accountTypeSuffix: "HERREGA",
      customerRegDesc: "MercatoX irratti bittaa eegaluuf odeeffannoo keessan galchaa",
      sellerRegDesc: "Eeyyama daldalaa mirkanaa'e argachuuf bal'ina guutaa",
      supplierRegDesc: "Akka raabsaa jumlaa, warshaa ykn galchaa mirkanaa'etti galmaa'aa",
    },
    marketplace: {
      title: "Bakka Gabaa",
      subtitle: "Daldaltoota, oomishtootaa fi qonnaan bultoota Itoophiyaa mirkanaa'an irraa qajeelatti bitaa",
      all: "Meeshaalee Hunda",
      wholesaleOnly: "Jumlaa",
      retailOnly: "Qinxaa",
      sortBy: "Tartiibessi",
      featured: "Filatamaa",
      priceLowHigh: "Gatii: Gadi aanaa gara Ol'aanaatti",
      priceHighLow: "Gatii: Ol'aanaa gara Gadi aanaatti",
      topRated: "Sadarkaa Ol'aanaa",
      filters: "Gingilchituuwwan",
      clearAll: "Hunda Qulqulleessi",
      showingResults: "Oomishaalee mul'atan",
      escrowProtected: "Eskiroowtiin Kan Eegame",
      noProductsFound: "Oomishni gingilchituu keessaniin walgitu hin argamne",
      customerReviews: "Yaada Maamiltootaa",
      departments: "Kutaalee",
      sourcingMode: "Gosa Daldalaa",
      moqLabel: "Hangi Ajaja Xiqqaa (MOQ)",
      customPrice: "Gatii Murtaa'aa",
      min: "Gadi aanaa",
      max: "Ol'aanaa",
    },
    home: {
      heroTitle: "Oomishtoota fi Daldaltoota Itoophiyaa Gaarii Irraa Qajeelatti Bitaa",
      heroSubtitle: "Gatii ifa ta'e, oomisha dhugaa, dhiyeessii saffisaa Finfinnee keessatti fi kaffaltii amansiisaa argadhaa.",
      shopMarketplace: "Gabaa Daawwadhaa",
      browseCategories: "Ramaddiiwwan Daawwadhaa",
      featuredProducts: "Oomishaalee Filataman",
      topSuppliers: "Dhiyeessitoota Itoophiyaa Mirkanaa'an",
      dailyDeals: "Gurgurtaa Har'aa fi Hir'ina Gatii",
      viewAll: "Hunda Ilaali",
      whyChooseUs: "Maaliif MercatoX Filattu?",
      fastDelivery: "Dhiyeessii Saffisaa Finfinnee",
      safeEscrow: "100% Kaffaltii Amansiisaa",
      authenticGuaranteed: "Wabii Oomisha Dhugaa Itoophiyaa",
      popularDepartments: "Kutaalee Beekamoo",
      youMayAlsoLike: "Isinis Jaallachuu Dandeessu",
      seeAll: "Hunda Ilaali",
      viewProduct: "Oomisha Ilaali",
      exploreStore: "Kuusaa Daawwadhaa",
      scrollDown: "Gadi Siqaa",
      localPayments: "Kaffaltii Biyya Keessaa",
      localPaymentsDesc: "Telebirr, CBE fi Kaardiiwwan",
      latestProducts: "Oomishaalee Haaraa fi Kutaalee",
      latestProductsSub: "Oomishaalee qulqulluu guyyaa guyyaan haaromfaman",
      exploreAll: "Hunda Daawwadhaa",
      acrossAddis: "Finfinnee fi guutuu biyyattiitti",
      fromSuppliers: "Kallattiin dhiyeessitoota mirkanaa'an irraa",
      escrowGuarantee: "Wabii Eskiroow fi maamilaa",
    },
    categories: {
      title: "Ramaddiiwwan Daawwadhaa",
      subtitle: "Oomishaalee qonnaa, aartii fi faabrikaa Itoophiyaa qulqulluu argadhaa",
      allCategories: "Ramaddiiwwan Hunda",
      viewProducts: "Oomishaalee Ilaali",
      itemsCount: "oomishaalee",
      trendingInAddis: "Finfinnee Keessatti Kan Barbaadaman",
      exploreCollections: "Kuusaa Ilaalaa",
      exploreVerified: "Kuusaa mirkanaa'e daawwadhaa",
    },
    cart: {
      title: "Gaarii Bittaa",
      empty: "Gaariin keessan duwwaadha",
      emptySub: "Oomishaalee Itoophiyaa qulqulluu argachuuf gabaa keenya daawwadhaa",
      checkout: "Gara Kaffaltiitti Dabrbaa",
      continueShopping: "Bittaa Itti Fufaa",
      orderSummary: "Cuunfaa Ajajaa",
      deliveryFee: "Kaffaltii Dhiyeessii",
      freeDeliveryNotice: "Ajajawwan 5,000 ETB ol ta'aniif dhiyeessiin bilisa",
      freeBadge: "Bilisa",
      itemsCount: "meeshaalee",
      browseMarketplace: "Gabaa Daawwadhaa",
      clearCart: "Gaarii Qulqulleessi",
      youMayAlsoLike: "Isinis Jaallachuu Dandeessu",
      productsInOrder: "Meeshaalee Ajaja Keessaa",
      deliveringTo: "Kan Geessamuuf",
      unitPrice: "Gatii Tokkoo",
      color: "Bifti",
      size: "Hammamtaa",
      viewMore: "Dabalataan Ilaali",
      viewLess: "Xiqqummaan Ilaali",
      escrowGuaranteeNotice: "Hanga meeshaa qorattanii koodii 4-digit SMS ergitanitti maallaqni keessan amansiisummaan qabama.",
      curatedPicks: "Oomishaalee Filataman",
    },
    favorites: {
      title: "Meeshaalee Jaallataman",
      subtitle: "Meeshaalee gara fuulduraatti bitachuuf olkaawwatan",
      empty: "Meeshaan olkaawwate hin jiru",
      emptySub: "Mallattoo onnee cuqaasuun meeshaalee asitti kuufachuu dandeessu",
      clearAll: "Hunda Balleessi",
      moveToCart: "Gara Gaariitti Dabarsi",
      browseMarketplace: "Gabaa Daawwadhaa",
      personalWishlist: "Meeshaalee Jaallataman Koo",
      savedCount: "meeshaalee olkaawwatan",
      exploreMarketplace: "Gabaa Daawwadhaa",
      addAllToCart: "Hunda Gara Gaariitti Galchi",
      quickView: "Ilaalcha Saffisaa",
      showingFavorites: "meeshaalee jaallataman",
      loadDemoItems: "Meeshaalee Yaalii Fe'i",
      recommendedForYou: "Siif Kan Filataman",
      trendingWishlist: "Meeshaalee Jaallataman Kan Haarawaa",
    },
    orders: {
      title: "Ajajawwan Koo",
      subtitle: "Haala ajaja keessanii, dhiyeessii fi kaffaltii to'adhaa",
      empty: "Ajajni hanga ammaatti hin jiru",
      emptySub: "Seenaan ajaja keessanii yeroo bittaa raawwatan asitti mul'ata.",
      orderId: "Lakk Ajajaa",
      orderDate: "Guyyaa",
      items: "Meeshaalee",
      paymentStatus: "Kaffaltii",
      deliveryStatus: "Dhiyeessii",
      totalAmount: "Gatii Waliigalaa",
      viewDetails: "Bal'ina Ilaali",
      trackOrder: "Ajaja Hordofi",
      statusDelivered: "Dhaqqabeera",
      statusProcessing: "Qophii Keessa Jira",
      statusPending: "Eegamaa Jira",
      statusShipped: "Ergameera",
      statusCancelled: "Haqameera",
      paymentId: "Lakk Kaffaltii",
      totalPrice: "Gatii Waliigalaa",
      detailsTitle: "Bal'ina Ajajaa",
      buyerProtected: "100% Eegumsa Maamilaa",
      orderedOn: "Kan ajajame",
      paymentIdentification: "Oodeeffannoo Kaffaltii fi Daldalaa",
      paidInEscrow: "Kaffalamee Eskiroowtiin Eegame",
      doorstepDelivery: "Oodeeffannoo Dhiyeessii",
      recipientName: "Maqaa Fudhataa",
      phoneForOtp: "Lakk Bilbilaa (SMS OTP)",
      city: "Magaalaa",
      subcity: "Kutaa Magaalaa",
      specificAddress: "Teessoo Addaa / Ijaarsa / Mallattoo",
      orderedProducts: "Meeshaalee Ajajaman",
      quantity: "Baay'ina",
      subtotalPrice: "Gatii Xiqqaa",
      courierFee: "Kaffaltii Dhiyeessaa",
      freeBadge: "BILISA",
      escrowProtocol: "Wabii Nageenya Eskiroow",
      totalPaid: "Waliigala Kaffalame",
      printReceipt: "Nagahee Maxxansi",
      deleteOrder: "Ajaja Haqaa",
      closeModal: "Cufi",
      copyTx: "Waraabi",
      copiedTx: "Waraabameera!",
      confirmedPaid: "Mirkanaa'ee Kaffalame",
      inTransit: "Karaarra Jira",
    },
    card: {
      title: "Kaardii Dijitaalaa MercatoX",
      subtitle: "Kaffaltii dijitaalaa saffisaa, deebii maallaqaa fi bittaa mijataa",
      balance: "Hafee Maallaqaa",
      topUp: "Maallaqa Guuti",
      cardNumber: "Lakk Kaardii",
      validThru: "Yeroo Itti Dhuma",
      cardHolder: "Abbaa Kaardii",
      recentTransactions: "Sochii Dhihoo",
      benefits: "Faayidaa Kaardichaa",
      cashback: "Hir'ina Gatii",
      freezeCard: "Kaardii Cufi",
      unfreezeCard: "Kaardii Bani",
      applyCard: "Kaardiif Iyyadhu",
    },
    product: {
      addToCart: "Gara Gaariitti Galchi",
      buyNow: "Amma Biti",
      outOfStock: "Dhumateera",
      inStock: "Kuusaa Keessa Jira",
      verifiedMerchant: "Daldalaa Mirkanaa'e",
      escrowProtected: "Eskiroowtiin Kan Eegame",
      reviews: "Yaada Maamiltootaa",
      rating: "Sadarkaa",
      description: "Ibsa Oomishaa",
      specifications: "Bal'ina Oomishaa",
      relatedProducts: "Oomishaalee Walfakkaatan",
      minOrder: "Ajaja Xiqqaa",
      directEthioTrade: "Daldala Qajeeltoo Itoophiyaa",
      soldOut: "Gurguramee Dhumate",
      quickView: "Ilaalcha Saffisaa",
      onlyLeft: "qofatu hafe",
    },
    footer: {
      newsletterTitle: "Gurgurtaa Addaa MercatoX Hordofaa",
      newsletterSubtitle: "Hir'ina gatii teeknooloojii Boolee fi uffata aadaa Shiroo Meedaa imeelii keessaniin argadhaa.",
      subscribeBtn: "Galmaa'aa",
      placeholderEmail: "Teessoo imeelii keessanii galchaa...",
      aboutPlatform: "Waa'ee MercatoX",
      company: "Dhaabbata",
      aboutUs: "Waa'ee Keenya",
      careers: "Carraa Hojii",
      press: "Oduu fi Labsiiwwan",
      customerService: "Tajaajila Maamilaa",
      helpCenter: "Wiirtuu Gargaarsaa",
      contactUs: "Nu Qunnamaa",
      shippingInfo: "Oodeeffannoo Dhiyeessii",
      returnsRefunds: "Meeshaa Deebisuu fi Kaffaltii",
      legal: "Seera Qabeessummaa",
      termsOfService: "Waliigaltee Tajaajilaa",
      privacyPolicy: "Imaammata Dhuunfaa",
      security: "Nageenya Eskiroow",
      allRightsReserved: "Mirgi hundi seeraan kan eegameedha. Daldala Eegamaa Itoophiyaa.",
      tagline: "Daldaltoota, oomishtootaa fi maamiltoota Itoophiyaa kan walqunnamsiisu waltajjii daldala ammayyaa.",
    },
    toast: {
      languageChanged: "Afaan gara Afaan Oromootti jijjiirameera",
    },
    checkout: {
      title: "Kaffaltii Eegumsa Bitaa Qabu",
      breadcrumbCart: "Gaarii",
      breadcrumbCheckout: "Kaffaltii fi Mirkaneessa Eegumsaa",
      protectionGuarantee: "Wabii Eegumsa Bitaa 100%",
      loadingSession: "Kaffaltii fe'aa jira...",
      cartEmptyTitle: "Gaariin keessan duwwaadha",
      cartEmptySub: "Gara kaffaltiitti darbuun dura maaloo meeshaalee gara gaariitti galchaa.",
      exploreMarketplace: "Gabaa Daawwadhaa",
      customerInfo: "1. Odeeffannoo Maamilaa",
      loadedFromDb: "Kuusaa Deetaa irraa Fe'ame",
      checkingSaved: "Odeeffannoo qulqulleessaa jira...",
      contactSub: "Ajajni eenyuuf haa dhiyaatu fi koodii SMS OTP eenyuuf haa ergamu?",
      recipientName: "Maqaa Guutuu Fudhataa",
      phoneForOtp: "Lakkoofsa Bilbilaa (SMS OTP tiif)",
      emailReceipt: "Teessoo Imeelii",
      emailReceiptSub: "(Nagahee dijitaalaaf)",
      deliveryDetails: "2. Bal'ina Dhiyeessa Balbalaa",
      dispatchedFrom: "Daldaltoota mirkanaa'an Finfinnee irraa kallattiin kan ergamu.",
      city: "Magaalaa",
      subcity: "Kutaa Magaalaa Finfinnee",
      specificAddress: "Teessoo Addaa / Ijaarsa / Mallattoo / Lakkoofsa Manaa",
      deliveryInstructions: "Qajeelfama Geessituuf Kennamu",
      optional: "(dirqama miti)",
      saveAddressCheckbox: "Teessoo fi odeeffannoo kana ajaja dhufuuf olkaawi",
      dbSync: "Walsimsiisa Kuusaa Deetaa",
      dbSyncSub: "Teessoo keessan kuusaa PostgreSQL keessatti eegumsaan olkaaya fi ajaja itti aanu irratti ofumaan guuta.",
      addressSavedSynced: "Teessoon kuusaa keessatti olkaawamee walsimeera",
      loadedFromDbHint: "Kuusaa irraa fe'ameera (jijjiiramee yoo jiraate sirreessaa)",
      checkBoxToSave: "Herrega keessanitti olkaawuuf saanduqa filadhaa ykn cuqqaalaa",
      signInToSave: "(Filannoo: Meeshaalee hunda irratti argachuuf seenaa)",
      saveAddressBtn: "Teessoo Kuusaa Deetaatti Olkaawi",
      savingInDb: "Kuusaa keessatti olkaawaa jira...",
      paymentMethod: "3. Mala Kaffaltii Eegame",
      paymentMethodSub: "Tajaajila kaffaltii filadhaa. Maallaqni keessan koodii OTP hanga mirkaneessitanitti eegama.",
      chapaGateway: "Geetweeyii Chapa",
      cardsAndMobile: "Kaardiiwwan fi Baankii Moobaayilaa",
      chapaDesc: "Kaardii Deebiitii, Visa, Mastercard, Awaash fi Daashan",
      mercatoxCard: "Kaardii MercatoX",
      digitalWallet: "Waleettii Dijitaalaa fi Badhaasa",
      mercatoxCardDesc: "Kaffaltii tajaajilaa 0%, deebii maallaqaa battalaa fi qabxiiwwan",
      cashbackRewardTitle: "Badhaasa Kaashbaakii Kaardii 2% Chapa",
      cashbackRewardDesc: "Chapa dhaan kaffalaa fi ajaja keessan irraa 2% kaardii MercatoX keessan irratti akka badhaasaatti argadhaa!",
      checkingCard: "Haala kaardii MercatoX qorachaa jira...",
      noCardTitle: "Kaardiin MercatoX Hin Argamne",
      cardRequired: "Kaardiin Ni Barbaachisa",
      noCardDesc: "Kaardii MercatoX tiin kaffaluuf jalqaba kaardii bitachuu qabdu. Amma bitachuun kaffaltii tajaajilaa 0% fi kaashbaakii 5% argadhaa.",
      buyCardNow: "Amma Kaardii MercatoX Bitaa",
      switchToChapa: "Gara Chapaatti Jijjiiri",
      insufficientBalanceTitle: "Hangi Maallaqaa Hin Geenyu",
      insufficientBalanceDesc: "Ajaja kana kaffaluuf maallaqni kaardii keessan gahaa miti. Maaloo kaardii guutaa ykn mala biraa filadhaa.",
      cardBalance: "Haftee Kaardii",
      orderTotal: "Waliigala Ajajaa",
      shortage: "Hankaana",
      topUpCard: "Kaardii Guutaa / Bulchaa",
      payWithChapa: "Chapa dhaan Kaffalaa",
      sufficientBalanceTitle: "Hangi Gahaan Ni Jira",
      readyToPay: "Kaffaltiif Qophii",
      manageCard: "Kaardii Bulchi",
      sufficientBalanceDesc: "Bittaa kana kaffaltii tajaajilaa 0% fi eegumsa eskiroow battalaatiin xumuruuf maallaqni gahaan jira. 'Kaardii MercatoX dhaan Kaffali' cuqqaaluun jecha icciitii dijiitii 8 galchaa.",
      orderPayment: "Kaffaltii Ajajaa",
      remainingBalance: "Haftee Maallaqaa",
      escrowProtocolTitle: "Pirootokoolii Eegumsa Bitaa 100%",
      escrowProtocolDesc: "Kaffaltiin keessan herrega eegame MercatoX keessa tura. Meeshaa balbala keessan irratti ilaaltanii koodii SMS OTP dijiitii 4 geessituuf hanga hin kenninitti gurguraan maallaqa hin fudhatu.",
      orderSummary: "Cuunfaa Ajajaa",
      items: "meeshaalee",
      item: "meeshaa",
      productsInOrder: "Meeshaalee Ajaja Keessa Jiran",
      shown: "kan mul'ate",
      of: "keessaa",
      viewMore: "Dabalata Ilaali",
      viewLess: "Xiqqeessi",
      subtotal: "Waliigala Meeshaalee",
      courierDelivery: "Dhiyeessa Balbalaa",
      freeOver5000: "Bilisa (Qarshii 5,000 ol)",
      buyerProtectionCovered: "Kan Uwwifame (0 ETB)",
      totalAmount: "Ida'ama Waliigalaa",
      paymentGatewayLabel: "Geetweeyii Kaffaltii:",
      authorizingCard: "Kaardii MercatoX mirkaneessaa jira...",
      redirectingChapa: "Gara Geetweeyii Chapatti ergaa jira...",
      payWithCardBtn: "Kaardii MercatoX dhaan Kaffali",
      processToPayChapa: "Chapa dhaan Kaffaluuf Itti Fufi",
      returnToCart: "Gara Gaariitti Deebi'i",
      deliveryCommitment: "Waadaa Dhiyeessa Geessituu",
      deliveryCommitmentSub: "Saffisni dhiyeessa giddu galeessaa Finfinnee keessatti sa'aatii 2 hanga 4 dha. Lakkoofsa bilbilaa fi odeeffannoo geessituu SMS dhaan ni argattu.",
      totalToPay: "Waliigala Kaffalamu",
      cardPinTitle: "Jecha Icciitii Eegumsa Kaardii",
      cardPinSub: "Kaffaltii mirkaneessuuf jecha icciitii dijiitii 8 galchaa",
      cardholder: "Abbaa Kaardii:",
      cardNumber: "Lakkoofsa Kaardii:",
      amountToDeduct: "Hanga Hir'ifamu:",
      balanceAfterDeduction: "Haftee Kaffaltii Boodaa:",
      enter8DigitPin: "Jecha Icciitii Kaardii Dijiitii 8 Galchaa",
      pinSentToEmail: "Jecha icciitii dijiitii 8 imeelii keessanitti ergame galchaa",
      resendPinEmail: "Jecha icciitii irranfattanii? Irra deebiin imeelitti ergaa",
      sendingEmail: "Ergaa jira...",
      authorizingOrder: "Ajaja mirkaneessaa fi hir'isaa jira...",
      authorizeAndPay: "Mirkaneessi fi Kaffali",
      escrowBadge: "Eskiroowtiin 100% Kan Eegame · Kaffaltii Tajaajilaa 0%",
    },
    profile: {
      title: "Piroofaayilii Koo",
      verified: "Kan Mirkanaa'e",
      totalOrders: "Ajajawwan Waliigalaa",
      delivered: "Kan Dhiyaatan",
      inTransit: "Karaarra Kan Jiran",
      personalInfo: "Odeeffannoo Dhuunfaa",
      edit: "Gulaali",
      cancel: "Haqi",
      saveChanges: "Jijjiirama Olkaawi",
      saving: "Olkaawaa jira...",
      fullName: "Maqaa Guutuu",
      email: "Imeelii",
      altPhone: "Bilbila Dabalataa",
      deliveryAddress: "Teessoo Dhiyeessaa",
      city: "Magaalaa",
      subcity: "Kutaa Magaalaa",
      landmark: "Mallattoo / Aanaa",
      buyerProtected: "Herrega Eegumsa Bitaa Qabu",
      buyerProtectedSub: "Maallaqni eegumsaan qabama — kan gadhiifamu mirkaneessa OTP balbalaa booda qofa.",
      myOrders: "Ajajawwan Koo",
      myOrdersSub: "Bittaa keessan hunda ilaalaa",
      favorites: "Jaallataman",
      favoritesSub: "Meeshaalee olkaawaman",
      settings: "Qindaa'inoota",
      settingsSub: "Filannoo herregaa",
      signOut: "Ba'i",
      signOutSub: "Herrega keessan keessaa ba'aa",
      verifyingAccess: "Eeyyama piroofaayilii mirkaneessaa jira...",
    },
    settings: {
      title: "Qindaa'inoota Herregaa",
      security: "Nageenya",
      alerts: "Beeksisa",
      appearance: "Bifa",
      about: "Waa'ee Sirnichaa",
      mode: "Haala",
      passwordSecurity: "Jecha Icciitii fi Nageenya",
      passwordSecuritySub: "Odeeffannoo herrega keessanii haaromsaa",
      currentPassword: "Jecha Icciitii Ammaa",
      newPassword: "Jecha Icciitii Haaraa",
      confirmNewPassword: "Jecha Icciitii Mirkaneessi",
      updatePassword: "Jecha Icciitii Haaromsi",
      updating: "Haaromsaa jira...",
      passwordUpdated: "Jechi icciitii haaromeera!",
      editProfile: "Piroofaayilii Gulaali",
      editProfileSub: "Maqaa, imeelii, teessoo dhiyeessaa",
      myOrders: "Ajajawwan Koo",
      myOrdersSub: "Ajajawwan keessan hordofaa fi bulchaa",
      signOut: "Ba'i",
      signOutSub: "MercatoX keessaa ba'aa",
      notifications: "Filannoo Beeksisaa",
      notificationsSub: "Akeekkachiisaa fi qunnamtii bulchaa",
      smsOtp: "SMS OTP Balbalaa",
      smsOtpSub: "Geessituun balbala keessan ga'uun koodii OTP ergamu",
      requiredBadge: "Barbaachisaa",
      emailInvoice: "Imeelii Ajajaa fi Nagahee",
      emailInvoiceSub: "Mirkaneessi eskiroow fi nagaheen imeelii keessanitti ergama",
      marketPromos: "Gurgurtaa Addaa Gabaa",
      marketPromosSub: "Boolee, Markaatoo fi daldaltoota mirkanaa'an irraa dhiyeessii addaa",
      escrowOtpTitle: "Eegumsa Eskiroow OTP",
      escrowOtpSub: "Koodiin SMS OTP keessan waliigaltee dhiyeessa balbalaa MercatoX keessatti mirkaneessa dhumaati. Geessituun koodii keessan malee ajaja dhiyaate jechuu hin danda'u.",
      themeTitle: "Bifa Mul'ataa",
      themeSub: "Bifa halluu fi kaardii filadhaa",
      modeLight: "Ifaa (Light)",
      modeLightSub: "Kaardii Adii Qulqulluu",
      modeDark: "Dukkana (Dark)",
      modeDarkSub: "Kaardii Gurraacha Cilaattii",
      modeSystem: "Sirna (System)",
      modeSystemSub: "Kaardii Saafaayirii Samii",
      platformInfo: "Odeeffannoo Waltajjichaa",
      platformInfoSub: "Bal'ina sirna gabaa MercatoX",
      platform: "Waltajjii",
      currency: "Gosa Maallaqaa",
      deliveryRegion: "Naannoo Dhiyeessaa",
      escrowSystem: "Sirna Eskiroow",
      paymentGateway: "Geetweeyii Kaffaltii",
      accountId: "Waraqaa Eenyummaa Herrega Keessanii",
      escrowProtectedTitle: "Eskiroowtiin Kan Eegame",
      escrowProtectedSub: "Daldalli MercatoX irratti raawwatamu hundi sirna eskiroow keenyaan kan eegamedha. Maallaqni eegamee gurgurtootaaf kan gadhiifamu koodii OTP balbalaa yoo mirkaneessitan qofa.",
      secureBadge: "Nageenyi Kan Eegame",
      otpVerifiedBadge: "OTP dhaan Kan Mirkanaa'e",
      escrowBadge: "Eskiroow",
      verifyingAccess: "Qindaa'ina herregaa mirkaneessaa jira...",
    },
    admin: {
      nav: {
        overview: "Waliigala & Xiinxala",
        catalog: "Oomishaalee",
        categories: "Gareewwan",
        users: "Fayyadamtoota",
        suppliers: "Dhiyeessitoota & Konkolaattota",
        orders: "Ajajoota & Eeskiroo",
        slips: "Nagaheewwan & Oodiitii Kaffaltii",
        subscriptions: "Miseensummaa & Karoorota",
        delivery: "Geejjibaa & Konkolaachistoota",
        disputes: "Walmormii & Deebisii",
        audit: "Galmee Oodiitii Nageenyaa",
        settings: "Qindaa'ina Sirnichaa",
        coreMonitoring: "Hordoffii Ijoo",
        commerceCatalog: "Daldala & Kaatalaagii",
        logisticsCare: "Lojistiksii & Deeggarsa",
        governanceSystem: "Bulchiinsa & Sirna",
        clusterActive: "Kilaastarii: Hojiirra Jira",
        superAdmin: "BULCHAA_OLAANAA",
        signOut: "Ba'i",
        searchPlaceholder: "Daldaltoota, ajajoota, nagaheewwan saffisaan barbaadi... (Ctrl+K)",
        complianceApprovals: "Heeyyama & Mirkaneessuu",
        pendingBadge: "Eeggachaa Jira",
        allCaughtUp: "Hundi Qulqullaa'eera",
        noSupplierAlerts: "Iyyannoon dhiyeessaa haaraa mirkaneessa eeggatu hin jiru.",
        refresh: "Haaromsi",
        refreshing: "Haaromsamaa jira...",
        reviewApplication: "Iyyannoo Sakatta'i",
        adminConsole: "Koonsolii Bulchiinsaa Dhaabbataa",
        masterSuperAdmin: "Bulchaa Olaanaa Sirnichaa",
        verifiedActive: "Mirkanaa'e & Hojiirra Jira",
        accountStatus: "Haala Herregaa",
        verifyingClearance: "Hayyama nageenyaa bulchaa mirkaneessaa jira...",
      },
      overview: {
        title: "Xiinxala & Waliigala Sirnichaa",
        subtitle: "Hamma daldalaa yeroo ammaa, adeemsa ajajaafi madaalliiwwan gabaa.",
        backendSynced: "Kuusaa Deetaa Waliin Qindaa'eera",
        updated: "Yeroo Haaromfame",
        totalProducts: "Waliigala Oomishaalee",
        activeInStock: "Suuqii Keessatti Hojiirra Jiru",
        totalOrders: "Waliigala Ajajootaa",
        ordersProcessed: "Ajajoota maamilaa raawwataman",
        totalUsers: "Waliigala Fayyadamtootaa",
        regularBuyers: "Bittaa Yeroo Maraa",
        registeredCustomers: "Maamiltoota galmaa'an (bulchaa malee)",
        totalSellers: "Waliigala Gurgurtootaa",
        verifiedMerchants: "Daldaltoota Mirkanaa'an",
        registeredMerchants: "Daldaltoota suuqii galmaa'an",
        orderFulfillmentPipeline: "Adeemsa Geessituu Ajajaa",
        viewAllOrders: "Ajajoota Hunda Ilaali",
        confirmedOrders: "Ajajoota Mirkanaa'an",
        inProcessing: "Qophii Keessa Jira",
        inTransit: "Adeemsa Imalaa Keessa",
        deliveredCleared: "Qaqqabanii Xumuraman",
        cancelledReturned: "Haqamaniiru / Deebi'aniiru",
        volume: "Hamma",
        clusterFleetHealth: "Fayyaa Tajaajila Maayikiroo Kilaastarii",
        operationalHealthy: "5 keessaa 5 Guutummaatti Hojjechaa Jiru · Tajaajilli Hundi Gaariidha",
        connectedMicroservices: "Tajaajila maayikiroo duubaa waliin walqabateera",
        metricsUpdated: "Safartuuleen kuusaa deetaa irraa haaromfaman",
      },
      catalog: {
        title: "Bulchiinsa Oomishaalee",
        subtitle: "Oomishaalee kaatalaagii gabaa sakatta'i, ugguri ykn deebisii eeyyami.",
        searchPlaceholder: "Mata duree, gurguraa ykn gareedhaan barbaadi...",
        filterAll: "Haalota Hunda",
        filterActive: "Hojiirra Jira",
        filterOutOfStock: "Dhumateera",
        colProduct: "Tarree Oomishaa",
        colMerchant: "Daldalaa / Suuqii",
        colCategory: "Garee",
        colPrice: "Gatii (ETB)",
        colStock: "Baay'ina",
        colStatus: "Haala",
        colAction: "Tarkaanfii",
        loadingProducts: "Oomishaalee fe'aa jira...",
        noProducts: "Filtarii kanaan oomishni hin argamne.",
        viewDetails: "Bal'ina Ilaali",
        suspend: "Ugguri",
        activate: "Eeyyami",
        delete: "Haqi",
        merchantStore: "Suuqii Daldalaa",
        confirmDelete: "Oomisha Haqi",
        confirmDeleteDesc: "Oomisha kana dhaabbataatti haquuf mirkanaa'aadhaa? Tarkaanfiin kun hin deebi'u.",
        cancel: "Dhiisi",
        deleting: "Haqaa jira...",
        activeStatus: "Hojiirra Jira",
        outOfStockStatus: "Dhumateera",
      },
      categories: {
        title: "Bulchiinsa Gareewwanii",
        subtitle: "Gareewwan gabaafi qindoomina sirna daldalaa to'adhu.",
        addCategory: "Garee Dabali",
        editCategory: "Garee Gulaali",
        categoryName: "Maqaa Garee",
        categorySlug: "URL Slug",
        categoryDesc: "Ibsa",
        categoryIcon: "Maqaa Mallattoo",
        searchPlaceholder: "Gareewwan barbaadi...",
        colName: "Maqaa Garee",
        colSlug: "Ibsituu URL",
        colProductsCount: "Oomishaalee",
        colCreated: "Guyyaa Uumame",
        colAction: "Tarkaanfii",
        saving: "Olkaa'aa jira...",
        save: "Garee Olkaayi",
        noCategories: "Gareen hin argamne.",
        loadingCategories: "Gareewwan fe'aa jira...",
        deleteCategory: "Garee Haqi",
        confirmDeleteCat: "Garee kana haquuf mirkanaa'aadhaa?",
      },
      users: {
        title: "Bulchiinsa Fayyadamtootaa & KYC",
        subtitle: "Maamiltoota, gurgurtoota, konkolaachistootaafi bulchitoota to'adhu.",
        searchPlaceholder: "Maqaa, imeelii, bilbila ykn daldalaan barbaadi...",
        roleAll: "Gahee Hunda",
        roleCustomer: "Maamiltoota",
        roleSeller: "Gurgurtoota",
        roleDelivery: "Konkolaachistoota",
        roleSupplier: "Dhiyeessitoota",
        roleAdmin: "Bulchitoota",
        statusAll: "Haala Hunda",
        statusVerified: "Mirkanaa'e",
        statusPending: "KYC Eeggachaa Jira",
        statusRejected: "Kufaa Ta'e",
        colUser: "Piroofaayilii",
        colRole: "Gahee",
        colContact: "Quunnamtii",
        colKyc: "Haala KYC",
        colAccountStatus: "Haala Herregaa",
        colJoined: "Guyyaa Makame",
        colAction: "Tarkaanfii",
        active: "Hojiirra Jira",
        blocked: "Uggurameera",
        locked: "Cufameera",
        approveKyc: "KYC Mirkaneessi",
        rejectKyc: "KYC Kufaa Taasisi",
        blockUser: "Fayyadamaa Ugguri",
        unblockUser: "Uggura Kaasi",
        unlockUser: "Herrega Bani",
        deleteUser: "Fayyadamaa Haqi",
        viewUserDetail: "Bal'ina Guutuu Ilaali",
        noUsers: "Ulaagaa kanaan fayyadamaan hin argamne.",
        loadingUsers: "Fayyadamtoota fe'aa jira...",
        kycModalTitle: "Sanadoota Mirkaneessa KYC",
        kycModalSub: "Waraqaa eenyummaa, eeyyama daldalaafi gibiraa sakatta'i.",
      },
      suppliers: {
        title: "Galmee Dhiyeessitootaa & Konkolaattotaa",
        subtitle: "Iyyannoowwan daldalaa, eeyyama, lakkoofsa TIN fi konkolaattota mirkaneessi.",
        searchPlaceholder: "Maqaa, suuqii ykn bakkaan barbaadi...",
        allSuppliers: "Dhiyeessitoota Hunda",
        pendingReview: "Mirkaneessa Eeggatan",
        verifiedSuppliers: "Mirkanaa'an",
        rejectedSuppliers: "Kufaa Ta'an",
        colSupplier: "Dhiyeessaa / Suuqii",
        colLocation: "Kutaalee Gabaa",
        colContact: "Bilbila & Imeelii",
        colFleet: "Hamma Konkolaattotaa",
        colVerification: "Mirkaneessa",
        colAction: "Tarkaanfii",
        reviewDocuments: "Sanadoota Sakatta'i",
        tradeLicense: "Eeyyama Daldalaa",
        tinNumber: "Lakkoofsa TIN",
        approveSupplier: "Dhiyeessaa Mirkaneessi",
        rejectSupplier: "Iyyannoo Kufaa Taasisi",
        rejectionReason: "Sababa Kufaa Itti Ta'e",
        loadingSuppliers: "Dhiyeessitoota fe'aa jira...",
        noSuppliers: "Galmeen dhiyeessaa hin argamne.",
      },
      orders: {
        title: "Bulchiinsa Ajajootaa & Eeskiroo",
        subtitle: "Kaffaltiiwwan eeskirootti qabaman hordofi, konkolaachistoota ramadii qarshii gadhiisi.",
        searchPlaceholder: "Lakk. ajajaan, maqaa maamilaan, bilbilaan barbaadi...",
        escrowBalance: "Haftee Qarshii Eeskiroo",
        escrowFundsProtected: "Qarshiin maamilaa hanga oomishni qaqqabutti eegumsa cimaa jala jira",
        statusAll: "Ajajoota Hunda",
        statusConfirmed: "Mirkanaa'an",
        statusProcessing: "Qophii Irra Jiru",
        statusInTransit: "Imala Keessa",
        statusDelivered: "Qaqqaban",
        statusCancelled: "Haqaman",
        colOrder: "Lakk. Ajajaa",
        colCustomer: "Maamila",
        colAddress: "Teessoo Geessituu",
        colAmount: "Gatii (ETB)",
        colPayment: "Kaffaltii",
        colStatus: "Adeemsa",
        colRider: "Konkolaachisaa Ramadame",
        colAction: "Tarkaanfii",
        assignRider: "Konkolaachisaa Ramadi",
        releaseEscrow: "Eeskiroo Gadhiisi",
        refundOrder: "Qarshii Maamilaaf Deebisi",
        viewOrderDetails: "Ajaja Ilaali",
        escrowReleased: "Gadhiifameera",
        escrowHeld: "Eeskirootti Qabameera",
        loadingOrders: "Ajajoota fe'aa jira...",
        noOrders: "Ajajni hin argamne.",
      },
      slips: {
        title: "Nagaheewwan Baankii & Mirkaneessa Kaffaltii",
        subtitle: "Nagaheewwan kaffaltii baankii CBE, Awash, Telebirr sakatta'i.",
        searchPlaceholder: "Lakkoofsa nagaheen, kaffalaan, baankiin barbaadi...",
        pendingSlips: "Nagaheewwan Eeggachaa Jiran",
        approvedSlips: "Mirkanaa'an",
        rejectedSlips: "Kufaa Ta'an",
        colReference: "Lakk. Nagahee",
        colPayer: "Kaffalaa",
        colBank: "Baankii / Mala",
        colAmount: "Gatii Kaffalame",
        colDate: "Guyyaa Galmeeffame",
        colStatus: "Mirkaneessa",
        colAction: "Tarkaanfii",
        viewSlip: "Nagahee Ilaali",
        approveSlip: "Nagahee Mirkaneessi",
        rejectSlip: "Nagahee Kufaa Taasisi",
        slipReceiptTitle: "Mirkaneessa Nagahee Kaffaltii Baankii",
        noSlips: "Nagaheen baankii eeggachaa jiru hin jiru.",
        loadingSlips: "Nagaheewwan fe'aa jira...",
      },
      delivery: {
        title: "Sirna Geejjibaa & Ergamtoota",
        subtitle: "Konkolaachistoota mootoraa, vaaniifi kutaalee geessituu qindeessi.",
        searchPlaceholder: "Konkolaachisaa maqaan, bilbilaan, gabateen barbaadi...",
        allRiders: "Konkolaachistoota Hunda",
        activeRiders: "Hojiirra Jiru",
        busyRiders: "Geessaa Jira",
        offlineRiders: "Hojii Hin Jirre",
        addRider: "Konkolaachisaa Dabali",
        colRider: "Konkolaachisaa",
        colVehicle: "Konkolaataa & Gabatee",
        colZone: "Kutaa Ramadame",
        colActiveOrders: "Hojii Yeroo Ammaa",
        colStatus: "Haala Hojii",
        colAction: "Tarkaanfii",
        dispatchOrder: "Ajaja Ergi",
        vehicleMotorcycle: "Mootorsayikilii",
        vehicleVan: "Vaanii / Isuzu",
        vehicleBicycle: "Biskileetii",
        loadingRiders: "Konkolaachistoota fe'aa jira...",
        noRiders: "Konkolaachisaan hin argamne.",
      },
      disputes: {
        title: "Walmormii & Murtiiwwan Daldalaa",
        subtitle: "Wal dhabdee maamilaafi gurguraa furii, ragaa sakatta'iitii murteessi.",
        searchPlaceholder: "Lakk. ajajaan, maamilaan ykn sababaan barbaadi...",
        allDisputes: "Walmormii Hunda",
        openDisputes: "Walmormii Banaa",
        resolvedDisputes: "Furmaata Argatan",
        colDispute: "Lakk. Walmormii",
        colOrder: "Lakk. Ajajaa",
        colParties: "Maamila vs Gurguraa",
        colReason: "Sababa Walmormii",
        colAmount: "Hamma Qarshii",
        colStatus: "Haala",
        colAction: "Tarkaanfii",
        inspectEvidence: "Ragaa Sakatta'i",
        refundCustomer: "Murtii: Maamilaaf Deebisi",
        releaseSeller: "Murtii: Gurguraaf Gadhiisi",
        loadingDisputes: "Dhimmoota walmormii fe'aa jira...",
        noDisputes: "Walmormiin hojiirra jiru hin jiru.",
      },
      subscriptions: {
        title: "Miseensummaa & Karoorota Daldalaa",
        subtitle: "Gurgurtootaafi dhiyeessitootaaf sadarkaa, komishiniifi daangaa qindeessi.",
        tabPlans: "Karoorota Miseensummaa",
        tabSubscribers: "Daldaltoota Galmaa'an",
        addPlan: "Karoora Haaraa Uumi",
        planName: "Maqaa Karooraa",
        planPrice: "Gatii Ji'aa (ETB)",
        commissionRate: "Hamma Komishinii (%)",
        productLimit: "Daangaa Oomishaa",
        targetRole: "Gahee Qiyyaafannoo",
        features: "Faayidaalee Dabalaman",
        savePlan: "Karoora Olkaayi",
        activePlan: "Hojiirra Jira",
        loadingPlans: "Karoorota fe'aa jira...",
        noPlans: "Karoorri qindaa'e hin jiru.",
      },
      settings: {
        title: "Qindaa'ina Sirnichaa & Seerota",
        subtitle: "Komishinii, sa'aatii qabiinsa eeskiroo, haala suphaafi mallattoo sirnaa qindeessi.",
        platformName: "Maqaa Sirnichaa",
        platformTagline: "Dhaadannoo Sirnichaa",
        platformFee: "Kaffaltii Komishinii Sirnichaa (%)",
        escrowHoldHours: "Yeroo Qabiinsa Eeskiroo (Sa'aatii)",
        maintenanceMode: "Haala Suphaa",
        maintenanceDesc: "Yeroo suphaa fi fooyyessaatiif bittaa maamiltootaa yeroof dhaabi.",
        saveChanges: "Jijjiirama Olkaayi",
        saving: "Olkaa'aa jira...",
        settingsSaved: "Qindaa'inni sirnichaa milkaa'inaan olkaa'ameera!",
        resetDefaults: "Gara Jalqabaatti Deebisi",
        brandingSettings: "Eenyummaa Mallattoo & Bifa",
        escrowSettings: "Seerota Eeskiroo & Bulchiinsaa",
      },
      audit: {
        title: "Oodiitii Nageenyaa & Galmee Hojii",
        subtitle: "Tarkaanfiiwwan bulchaa, fooyyessa KYC, jijjiirama ajajaafi seensa hordofi.",
        searchPlaceholder: "Raawwataan, gochaan, IPn ykn bal'inaan barbaadi...",
        filterAll: "Taateewwan Hunda",
        filterAuth: "Seensa & Eenyummaa",
        filterUsers: "Bulchiinsa Fayyadamtootaa",
        filterKyc: "Bulchiinsa KYC",
        filterProducts: "Oomishaalee & Kaatalaagii",
        filterOrders: "Ajajoota & Eeskiroo",
        filterPayments: "Kaffaltii & Nagaheewwan",
        colTimestamp: "Sa'aatii & Guyyaa",
        colActor: "Raawwataa / Bulchaa",
        colAction: "Tarkaanfii Fudhatame",
        colSeverity: "Sadarkaa",
        colDetails: "Bal'ina & IP",
        exportLogs: "CSV Baasi",
        loadingLogs: "Galmee oodiitii fe'aa jira...",
        noLogs: "Galmeen oodiitii hin argamne.",
      },
      details: {
        backToAdmin: "Gara Daashboordii Bulchiinsaatti Deebi'i",
        orderDetails: "Bal'ina Ajajaafi Hordoffii Eeskiroo",
        productDetails: "Bal'ina Kaatalaagii Oomishaa",
        userDetails: "Galmee KYC Fayyadamaafi Daldalaa",
        supplierDetails: "Piroofaayilii Dhiyeessaafi Sanadoota",
        loadingDetails: "Bal'ina fe'aa jira...",
        saveChanges: "Jijjiirama Olkaayi",
        status: "Haala",
        information: "Oodeeffannoo",
        documents: "Sanadoota Seeraa",
      },
    },
  },

  ti: {
    nav: {
      home: "መበገሲ",
      marketplace: "ዕዳጋ",
      categories: "ምድባት",
      adminDashboard: "ናይ ኣድሚን ዳሽቦርድ",
      supplierDashboard: "ናይ ኣቕራቢ ዳሽቦርድ",
      sellerDashboard: "ናይ ሸያጢ ዳሽቦርድ",
      cart: "ዓረብያ",
      favorites: "ዝተፈተዉ",
      saved: "ዝተዓቀቡ",
      signIn: "እቶ",
      register: "ተመዝገብ",
      myAccount: "ናተይ ኣካውንት",
      orders: "ትእዛዛተይ",
      profile: "ፕሮፋይል",
      settings: "ቅጥዕታት",
      logout: "ውጻእ",
      rfq: "ናይ ጅምላ ሕቶ (RFQ)",
      wholesale: "ጅምላ ንግዲ",
      retail: "ታክ ንግዲ",
      explore: "ዳህስስ",
    },
    header: {
      searchPlaceholder: "ትክክለኛ ናይ ኢትዮጵያ ቡን፣ ጨርቃጨርቂ፣ ጣፍ፣ ቀመማት ከምኡ'ውን ጅምላ ኣቑሑ ድለዩ...",
      allDepts: "ኩሎም ምድባት",
      tradeBanner: "ቀጥታዊ ናይ ኢትዮጵያ ንግዲ · ትክክለኛ ፍርያትን ውሑስ ናይ ኤስክሮው ክፍሊትን",
      language: "ቋንቋ",
      selectLanguage: "ቋንቋ ምረጹ",
      welcome: "እንቋዕ ብደሓን መጻኹም",
      deals: "ናይ መዓልቲ ቅናሻት",
      zones: "ዞባታት ዕዳጋ",
      appearance: "ትርኢት",
      escrowBadge: "ብኤስክሮው ዝተሓለወ",
    },
    common: {
      save: "ኣቐምጥ",
      cancel: "ሰርዝ",
      clear: "ኣጽርይ",
      filter: "ኣጻሪ",
      apply: "ተግብር",
      reset: "ዳግማይ ጀምር",
      viewAll: "ኩሉ ርአ",
      loading: "ይጽዕን ኣሎ...",
      addToCart: "ናብ ዓረብያ ወስኽ",
      buyNow: "ሕጂ ግዛእ",
      inStock: "ኣብ መኽዘን ኣሎ",
      outOfStock: "ተወዲኡ",
      price: "ዋጋ",
      rating: "ደረጃ",
      qty: "ብዝሒ",
      total: "ጠቕላላ",
      subtotal: "ንኡስ ጠቕላላ",
      status: "ኩነታት",
      date: "ዕለት",
      actions: "ስጉምትታት",
      close: "ዕጸው",
      back: "ተመለስ",
      remove: "ኣውጽእ",
      edit: "ኣዐሪ",
      share: "ኣካፍል",
    },
    auth: {
      signInTitle: "ናብ ኣካውንትኩም እተዉ",
      signInSubtitle: "ትእዛዛትኩም፣ ዝተዓቀቡ ኣቑሑትን ማእከል ንግዲ ኢትዮጵያን ርኸቡ",
      identifierLabel: "ቁጽሪ ስልኪ ወይ ኢመይል",
      identifierPlaceholder: "09... ወይ name@example.com",
      passwordLabel: "መሕለፊ ቃል",
      passwordPlaceholder: "መሕለፊ ቃልኩም ኣእትዉ",
      rememberMe: "ነዚ መሳርሒ ን30 መዓልታት ዘክሮ",
      forgotPassword: "መሕለፊ ቃል ረሲዕኩም?",
      signInBtn: "እቶ",
      orContinueWith: "ወይ ብእዚ ቀጽሉ",
      googleBtn: "ብGoogle ኣካውንት ቀጽሉ",
      githubBtn: "ብGitHub ኣካውንት ቀጽሉ",
      noAccount: "ኣካውንት የብልኩምን?",
      createAccount: "ሓዱሽ ኣካውንት ክፈቱ",
      returnHome: "ናብ መበገሲ ገጽ ተመለሱ",
      registerTitle: "ናይ MercatoX ኣካውንት ክፈቱ",
      registerSubtitle: "ዝተረጋገጸ ዲጂታል ናይ ንግዲ ስርዓት ኢትዮጵያ ተጸምበሩ",
      selectRole: "ዓይነት ኣካውንት ምረጹ",
      customerRole: "ዓሚል / ገዛኢ",
      sellerRole: "ነጋዳይ / ሸያጢ",
      supplierRole: "ኣቕራቢ / ናይ ጅምላ ነጋዳይ",
      fullName: "ምሉእ ስም",
      phone: "ቁጽሪ ስልኪ",
      email: "ናይ ኢመይል ኣድራሻ",
      confirmPassword: "መሕለፊ ቃል ኣረጋግጹ",
      agreeTerms: "ውዕላት ኣገልግሎት MercatoXን ሕግታትን እስማማዕ",
      registerBtn: "ምዝገባ ወደእ",
      haveAccount: "ድሮ ኣካውንት ኣለኩም?",
      capsLock: "Caps Lock ወሊዑ ኣሎ",
      cooldown: "ናይ ድሕንነት ዕረፍቲ ተኸፊቱ ኣሎ",
      accountBlocked: "ኣካውንትኩም ብሙሉኡ ተዓጽዩ",
      contactAdmin: "ኣካውንትኩም ንምኽፋት ንኣድሚን ርኸቡ።",
      valIdentifier: "በጃኹም ቁጽሪ ስልኪ ወይ ኢመይል ኣእትዉ",
      valPassword: "መሕለፊ ቃል የድሊ እዩ",
      valPasswordLen: "መሕለፊ ቃል ካብ 6 ፊደላት ክውሕድ የብሉን",
      customerRoleTitle: "ዓሚል / ገዛኢ",
      customerRoleBadge: "ታክን ጅምላን",
      customerRoleDesc: "ውልቀ ዓሚል ወይ ናይ ትካል ግዝኢታት ዘካይዱ",
      customerFeat1: "ልዕሊ 10,000+ ዝተረጋገጹ ናይ ኢትዮጵያ ነጋዶ ርኸቡ",
      customerFeat2: "ቀጥታዊ ናይ ቴሌብርን ቻፓን ቅልጡፍ ክፍሊት",
      customerFeat3: "ክሳብ ማዕጾኹም ቀጥታዊ ምክትታል ትእዛዝ",
      sellerRoleTitle: "ነጋዳይ / ሸያጢ",
      sellerRoleBadge: "ዋና ድኳን",
      sellerRoleDesc: "ናይ ታክ ድኳን፣ ቡቲክ ወይ ናይ ንግዲ ነጋዳይ",
      sellerFeat1: "ኣብ መርካቶ፣ ቦሌ ወይ ብኢንተርነት ዝተረጋገጸ ዲጂታል ድኳን ክፈቱ",
      sellerFeat2: "ምሕደራ ካታሎግን ናይ ውሽጢ ዓዲ ሽያጥን",
      sellerFeat3: "ቀጥታዊ ናይ ባንክን ቴሌብርን ኣውቶማቲክ ክፍሊታት",
      supplierRoleTitle: "ኣቕራቢ / ጅምላ ሸያጢ",
      supplierRoleBadge: "ናይ B2B ጅምላ ማእከል",
      supplierRoleDesc: "ቀንዲ ኣእታዊ ጅምላ፣ ኣፍራዪ ፋብሪካ ወይ ዋና መከፋፈሊ",
      supplierFeat1: "ናይ ጅምላ ምዝርጋሕን ናይ ኮንተይነር ደረጃ ሕሳስ መደብን",
      supplierFeat2: "ቀጥታዊ ናይ ነጋዶ ትእዛዛት ግዝኢትን ብኤስክሮው ዝተረጋገጹ ውዕላትን",
      supplierFeat3: "ናይ ንግዲ ግብሪ ቅብሊት (TIN/VAT)ን ናይ ደረቕ ወደብ ሎጂስቲክስን",
      socialRegistersAs: "ቀጥታ ብ Google ወይ GitHub ይምዝገብ ከም",
      orChooseAccountType: "ወይ ንምምዝጋብ ዓይነት ኣካውንት ምረጹ",
      courierPartnerNotice: "ከም መጓዓዝያ ወይ ናይ ትራንስፖርት መሻርኽቲ ክትሰርሑ ትደልዩ ዶ?",
      courierPartnerDesc: "ናይ ሞተርን መካይንን መጓዓዝቲ ድሕሪ ሕጋዊ ምርመራ ብኣድሚናት MercatoX ጥራይ ይምዝገቡ። በጃኹም ምስ ኣድሚን ተወከሱ።",
      continueAs: "ቀጽል ከም",
      changeAccountType: "ዓይነት ኣካውንት ቀይር",
      accountTypeSuffix: "ኣካውንት",
      customerRegDesc: "ኣብ MercatoX ዕዳጋ ንምጅማር ሓበሬታኹም የእትዉ",
      sellerRegDesc: "ዝተረጋገጸ ናይ ንግዲ ፍቓድ ንምርካብ ናይ ንግዲ ዝርዝራት ኣማልኡ",
      supplierRegDesc: "ከም ዝተረጋገጸ ናይ ጅምላ መከፋፈሊ፣ ፋብሪካ ወይ ኣእታዊ ተመዝገቡ",
    },
    marketplace: {
      title: "ቦታ ዕዳጋ",
      subtitle: "ካብ ዝተረጋገጹ ናይ ኢትዮጵያ ነጋዶ፣ ኣፍረይቲን ሓረስቶትን ብቐጥታ ግዝኡ",
      all: "ኩሎም ኣቑሑ",
      wholesaleOnly: "ጅምላ",
      retailOnly: "ታክ",
      sortBy: "ሰርዕ",
      featured: "ፍሉይ",
      priceLowHigh: "ዋጋ: ካብ ትሑት ናብ ላዕለዋይ",
      priceHighLow: "ዋጋ: ካብ ላዕለዋይ ናብ ትሑት",
      topRated: "ዝለዓለ ደረጃ",
      filters: "መጻረዪታት",
      clearAll: "ኩሉ ኣጽርይ",
      showingResults: "ዝርኣዩ ፍርያት",
      escrowProtected: "ብኤስክሮው ዝተሓለወ",
      noProductsFound: "ምስ መጻረዪኹም ዝሰማማዕ ፍርያት ኣይተረኽበን",
      customerReviews: "ርእይቶ ዓማዊል",
      departments: "ምድባት",
      sourcingMode: "ዓይነት ንግዲ",
      moqLabel: "ዝተሓተ መጠን ትእዛዝ (MOQ)",
      customPrice: "ዝተመርጸ ዋጋ",
      min: "ዝተሓተ",
      max: "ዝለዓለ",
    },
    home: {
      heroTitle: "ካብ ምርጣት ናይ ኢትዮጵያ ኣፍረይቲን ነጋዶን ብቐጥታ ግዝኡ",
      heroSubtitle: "ግሉጽ ዋጋ፣ ትክክለኛ ፍርያት፣ ቅልጡፍ ምብጻሕ ኣብ ኣዲስ ኣበባን ውሑስ ክፍሊትን ተሓጐሱ።",
      shopMarketplace: "ዕዳጋ ዑደት",
      browseCategories: "ምድባት ኣስስ",
      featuredProducts: "ፍሉያት ፍርያት",
      topSuppliers: "ዝተረጋገጹ ናይ ኢትዮጵያ ኣቕረብቲ",
      dailyDeals: "ናይ መዓልቲ ቅናሻትን መሸጣን",
      viewAll: "ኩሉ ርአ",
      whyChooseUs: "ስለምንታይ ንMercatoX ትመርጹ?",
      fastDelivery: "ቅልጡፍ ምብጻሕ ኣብ ኣዲስ ኣበባ",
      safeEscrow: "100% ውሑስ ናይ ኤስክሮው ክፍሊት",
      authenticGuaranteed: "ናይ ትክክለኛ ፍርያት ኢትዮጵያ ውሕስነት",
      popularDepartments: "ተፈተውቲ ምድባት ፍርያት",
      youMayAlsoLike: "ክትፈትዉዎም እትኽእሉ ካልኦት ፍርያት",
      seeAll: "ኩሉ ርአ",
      viewProduct: "ፍርያት ርአ",
      exploreStore: "ዱካን ዑደት",
      scrollDown: "ናብ ታሕቲ ውረድ",
      localPayments: "ናይ ውሽጢ ዓዲ ክፍሊታት",
      localPaymentsDesc: "ቴሌብር፣ ንግዲ ባንክን ካርድታትን",
      latestProducts: "ሓደሽቲ ፍርያትን ምድባትን",
      latestProductsSub: "መዓልታዊ ዝሕደሱ ፍርያት",
      exploreAll: "ኩሉ ዳህስስ",
      acrossAddis: "ኣብ ኣዲስ ኣበባን መላእ ሃገርን",
      fromSuppliers: "ብቐጥታ ካብ ዝተረጋገጹ ኣቕረብቲ",
      escrowGuarantee: "ናይ ኤስክሮውን ዓሚልን ውሕስነት",
    },
    categories: {
      title: "ምድባት ኣስስ",
      subtitle: "ትክክለኛ ናይ ኢትዮጵያ ሕርሻ፣ ኢደ-ጥበብን ፋብሪካን ፍርያት ርኸቡ",
      allCategories: "ኩሎም ምድባት",
      viewProducts: "ፍርያት ርአ",
      itemsCount: "ፍርያት",
      trendingInAddis: "ኣብ ኣዲስ ኣበባ ተደላይነት ዘለዎም",
      exploreCollections: "ስብስባት ዳህስሱ",
      exploreVerified: "ዝተረጋገጹ ፍርያት ዳህስሱ",
    },
    cart: {
      title: "ናይ ዕዳጋ ዓረብያ",
      empty: "ዓረብያኹም ጥራዩ እዩ",
      emptySub: "ትክክለኛ ናይ ኢትዮጵያ ፍርያት ንምርካብ ዕዳጋና ዑደት",
      checkout: "ናብ ክፍሊት ቀጽሉ",
      continueShopping: "ዕዳጋኹም ቀጽሉ",
      orderSummary: "ጽማቝ ትእዛዝ",
      deliveryFee: "ክፍሊት ምብጻሕ",
      freeDeliveryNotice: "ካብ 5,000 ብር ንላዕሊ ንዝኾኑ ትእዛዛት ብነጻ ምብጻሕ",
      freeBadge: "ነጻ",
      itemsCount: "ኣቑሑ",
      browseMarketplace: "ዕዳጋ ዑደት",
      clearCart: "ዓረብያ ኣጽርይ",
      youMayAlsoLike: "ክትፈትዉዎም እትኽእሉ ካልኦት ፍርያት",
      productsInOrder: "ኣብ ትእዛዝ ዘለዉ ኣቑሑ",
      deliveringTo: "ዝበጽሖ ሰብ",
      unitPrice: "ዋጋ ሓደ",
      color: "ሕብሪ",
      size: "መጠን",
      viewMore: "ተወሳኺ ርአ",
      viewLess: "ኣጉድል",
      escrowGuaranteeNotice: "ኣቕሓ ተረኪብኩም ናይ 4-ኣሃዝ ኮድ ክሳብ እተረጋግጹ ገንዘብኩም ብኤስክሮው ተዓቂቡ ይጸንሕ።",
      curatedPicks: "ፍሉያት ዝተመርጹ ፍርያት",
    },
    favorites: {
      title: "ዝተፈተዉ ፍርያት",
      subtitle: "ንቀጻሊ ግዜ ዘቀመጥኩምዎም ፍርያት",
      empty: "ዝተዓቀበ ኣቕሓ የለን",
      emptySub: "ናይ ልቢ ምልክት ብምጥዋቕ ፍርያት ኣብዚ ኣቐምጡ",
      clearAll: "ኩሉ ኣውጽእ",
      moveToCart: "ናብ ዓረብያ ኣመሓላልፍ",
      browseMarketplace: "ዕዳጋ ዑደት",
      personalWishlist: "ናተይ ዝተፈተዉ",
      savedCount: "ዝተዓቀቡ ኣቑሑ",
      exploreMarketplace: "ዕዳጋ ዑደት",
      addAllToCart: "ኩሉ ናብ ዓረብያ ወስኽ",
      quickView: "ቅልጡፍ ርእይቶ",
      showingFavorites: "ዝተፈተዉ ኣቑሑ",
      loadDemoItems: "ናይ ፈተነ ኣቑሑት ጽዓን",
      recommendedForYou: "ንዓኻ ዝተመርጹ",
      trendingWishlist: "ተፈተውቲ ዝኾኑ ኣቑሑት",
    },
    orders: {
      title: "ትእዛዛተይ",
      subtitle: "ኩነታት ትእዛዝኩም፣ ምብጻሕን ክፍሊትን ተኸታተሉ",
      empty: "ዝተገብረ ትእዛዝ የለን",
      emptySub: "ዝገበርኩምዎም ትእዛዛት ኣብዚ ክረኣዩ እዮም። ናይ መጀመርታ ትእዛዝኩም ሎሚ ጀምሩ!",
      orderId: "ቁጽሪ ትእዛዝ",
      orderDate: "ዕለት",
      items: "ኣቑሑ",
      paymentStatus: "ክፍሊት",
      deliveryStatus: "ምብጻሕ",
      totalAmount: "ጠቕላላ ዋጋ",
      viewDetails: "ዝርዝር ርአ",
      trackOrder: "ትእዛዝ ተኸታተል",
      statusDelivered: "በጺሑ",
      statusProcessing: "ኣብ ምድላው ኣሎ",
      statusPending: "ኣብ ምጽባይ ኣሎ",
      statusShipped: "ኣብ መንገዲ ኣሎ",
      statusCancelled: "ተሰሪዙ",
      paymentId: "ቁጽሪ ክፍሊት",
      totalPrice: "ጠቕላላ ዋጋ",
      detailsTitle: "ዝርዝር ትእዛዝ",
      buyerProtected: "100% ናይ ዓሚል ውሕስነት",
      orderedOn: "ዝተኣዘዘሉ ዕለት",
      paymentIdentification: "ሓበሬታ ክፍሊትን ንግድን",
      paidInEscrow: "ተኸፊሉ ብኤስክሮው ዝተታሕዘ",
      doorstepDelivery: "ሓበሬታ ምብጻሕ",
      recipientName: "ምሉእ ስም ተቐባሊ",
      phoneForOtp: "ቁጽሪ ስልኪ (SMS OTP)",
      city: "ከተማ",
      subcity: "ክፍለ ከተማ",
      specificAddress: "ፍሉይ ኣድራሻ / ህንጻ / ምልክት",
      orderedProducts: "ዝተኣዘዙ ፍርያት",
      quantity: "ብዝሒ",
      subtotalPrice: "ንኡስ ድምር",
      courierFee: "ክፍሊት ምብጻሕ",
      freeBadge: "ነጻ",
      escrowProtocol: "ውሕስነት ኤስክሮው",
      totalPaid: "ዝተኸፍለ ጠቕላላ ድምር",
      printReceipt: "ረሲት ኣሕትም",
      deleteOrder: "ትእዛዝ ሰርዝ",
      closeModal: "ዕጾ",
      copyTx: "ቅዳሕ",
      copiedTx: "ተቐዲሑ!",
      confirmedPaid: "ተረጋጊጹ ዝተኸፍለ",
      inTransit: "ኣብ መንገዲ ኣሎ",
    },
    card: {
      title: "ዲጂታል ካርድ MercatoX",
      subtitle: "ንቅልጡፍ ዲጂታል ክፍሊት፣ ቅናሻትን መሸጣን",
      balance: "ዝተረፈ ገንዘብ",
      topUp: "ገንዘብ ምላእ",
      cardNumber: "ቁጽሪ ካርድ",
      validThru: "ዘብቅዓሉ",
      cardHolder: "ዋና ካርድ",
      recentTransactions: "ናይ ቀረባ ንጥፈታት",
      benefits: "ጥቕምታት ካርድ",
      cashback: "ናይ ካሽባክ ቅናሻት",
      freezeCard: "ካርድ ዕጾ",
      unfreezeCard: "ካርድ ክፈት",
      applyCard: "ካርድ ሕተት",
    },
    product: {
      addToCart: "ናብ ዓረብያ ወስኽ",
      buyNow: "ሕጂ ግዛእ",
      outOfStock: "ተወዲኡ",
      inStock: "ኣብ መኽዘን ኣሎ",
      verifiedMerchant: "ዝተረጋገጸ ነጋዳይ",
      escrowProtected: "ብኤስክሮው ዝተሓለወ",
      reviews: "ርእይቶታት",
      rating: "ደረጃ",
      description: "መግለጺ ፍርያት",
      specifications: "ዝርዝር መግለጺ",
      relatedProducts: "ተመሳሰልቲ ፍርያት",
      minOrder: "ዝተሓተ ትእዛዝ",
      directEthioTrade: "ቀጥታዊ ናይ ኢትዮጵያ ንግዲ",
      soldOut: "ተሸይጡ ተወዲኡ",
      quickView: "ቅልጡፍ ርእይቶ",
      onlyLeft: "ጥራይ ተሪፉ",
    },
    footer: {
      newsletterTitle: "ናይ MercatoX ፍሉይ ቅናሻት ርኸቡ",
      newsletterSubtitle: "ናይ ቦሌ ናይ ቴክኖሎጂ ቅናሻት፣ ናይ ሽሮሜዳ ባህላዊ ክዳውንቲን ፍሉይ ማስታወቂያታትን ብኢመይልኩም ርኸቡ።",
      subscribeBtn: "ተመዝገቡ",
      placeholderEmail: "ናይ ኢመይል ኣድራሻኹም ኣእትዉ...",
      aboutPlatform: "ብዛዕባ MercatoX",
      company: "ትካል",
      aboutUs: "ብዛዕባና",
      careers: "ናይ ስራሕ ዕድላት",
      press: "ዜናን መግለጺታትን",
      customerService: "ናይ ዓማዊል ኣገልግሎት",
      helpCenter: "ማእከል ሓገዝ",
      contactUs: "ርኸቡና",
      shippingInfo: "ናይ ምብጻሕ ሓበሬታ",
      returnsRefunds: "ምምላስ ኣቑሑትን ክፍሊትን",
      legal: "ሕጋዊ ሓበሬታ",
      termsOfService: "ውዕላት ኣገልግሎት",
      privacyPolicy: "ፖሊሲ ውልቃውነት",
      security: "ውሕስነት ኤስክሮው",
      allRightsReserved: "መሰሉ ብሕጊ ዝተሓለወ እዩ። ዝተሓለወ ንግዲ ኢትዮጵያ።",
      tagline: "ናይ ኢትዮጵያ ነጋዶ፣ ኣፍረይቲን ዓማዊልን ዘራኽብ ዘመናዊ መድረኽ ንግዲ።",
    },
    toast: {
      languageChanged: "ቋንቋ ናብ ትግርኛ ተቐይሩ",
    },
    checkout: {
      title: "ብውሕስነት ዓዳጊ ዝተረጋገጸ ክፍሊት",
      breadcrumbCart: "ዓረብያ",
      breadcrumbCheckout: "ክፍሊትን ውሑስ ምርግጋጽን",
      protectionGuarantee: "100% ናይ ዓዳጊ ውሕስነት ዝተረጋገጸ",
      loadingSession: "ናይ ክፍሊት እዋን ይጽዕን ኣሎ...",
      cartEmptyTitle: "ዓረብያኹም ኣብዚ እዋን ጥራዩ እዩ",
      cartEmptySub: "ናብ ክፍሊት ቅድሚ ምኻድኩም በጃኹም ኣቑሑ ናብ ዓረብያኹም ወስኹ።",
      exploreMarketplace: "ዕዳጋ ዳህስሱ",
      customerInfo: "1. ሓበሬታ ዓሚል",
      loadedFromDb: "ካብ ዳታቤዝ ዝተጻዕነ",
      checkingSaved: "ዝተዓቀበ ሓበሬታ ይምርምር ኣሎ...",
      contactSub: "እቲ ትእዛዝ ንመን ይብጻሕን ብ SMS OTP ንመን ነረጋግጽ?",
      recipientName: "ሙሉእ ስም ተቐባሊ",
      phoneForOtp: "ቑጽሪ ስልኪ (ን SMS OTP መረጋገጺ)",
      emailReceipt: "ኣድራሻ ኢመይል",
      emailReceiptSub: "(ንዲጂታል ቅብሊት)",
      deliveryDetails: "2. ናይ ማዕጾ ምብጻሕ ዝርዝራት",
      dispatchedFrom: "ኣብ ኣዲስ ኣበባ ካብ ዝርከቡ ዝተረጋገጹ ናይ ውሽጢ ዓዲ ነጋዶ ብቐጥታ ዝለኣኽ።",
      city: "ከተማ",
      subcity: "ክፍለ ከተማ ኣዲስ ኣበባ",
      specificAddress: "ፍሉይ ኣድራሻ / ህንጻ / መፍለዪ ቦታ / ቑጽሪ ገዛ",
      deliveryInstructions: "ንመጓዓዚ ዝወሃብ መምርሒ",
      optional: "(ግዴታ ዘይኮነ)",
      saveAddressCheckbox: "ነዚ ናይ ኣድራሻን ርክብን ሓበሬታ ንቐጻሊ ትእዛዛት ኣቐምጥ",
      dbSync: "ናይ ዳታቤዝ ምምዕርራይ",
      dbSyncSub: "ኣድራሻኹም ኣብ PostgreSQL ዳታቤዝ ብጥንቃቐ ይዕቅቦን ኣብ ዝቕጽል ትእዛዝኩም ብባዕሉ ይምላእን።",
      addressSavedSynced: "ኣድራሻ ኣብ ዳታቤዝ ተዓቂቡን ተሰማሚዑን ኣሎ",
      loadedFromDbHint: "ካብ ዳታቤዝ ዝተጻዕነ (እንተተቐይሩ ኣዐሪኹም ኣቐምጡ)",
      checkBoxToSave: "ናብ ኣካውንትኩም ንምዕቃብ ሳንዱቕ ምረጹ ወይ ጠውቑ",
      signInToSave: "(ኣማራጺ፦ ኣብ ኩሉ መሳርሒታት ንምዕቃብ እተዉ)",
      saveAddressBtn: "ኣድራሻ ኣብ ዳታቤዝ ኣቐምጥ",
      savingInDb: "ኣብ ዳታቤዝ ይዕቅብ ኣሎ...",
      paymentMethod: "3. ውሑስ ናይ ክፍሊት ኣገባብ",
      paymentMethodSub: "ዝመረጽኩምዎ ናይ ክፍሊት ኣገልግሎት ምረጹ። ገንዘብኩም ብ OTP ክሳብ ዝረጋገጽ ብጥንቃቐ ይሕሎ።",
      chapaGateway: "ናይ ቻፓ ጌትወይ",
      cardsAndMobile: "ካርድታትን ሞባይል ባንኪንግን",
      chapaDesc: "ዴቢት ካርድ፣ ቪዛ፣ ማስተርካርድ፣ ኣዋሽን ዳሸንን",
      mercatoxCard: "ናይ MercatoX ካርድ",
      digitalWallet: "ዲጂታል ቦርሳን ናይ ሽልማት ካርድን",
      mercatoxCardDesc: "ብዘይ ዝኾነ ናይ ኣገልግሎት ክፍሊት (0% Fee)፣ ቅልጡፍ ካሽባክን ነጥብታትን",
      cashbackRewardTitle: "ናይ ቻፓ ክፍሊት 2% ናይ ካርድ ካሽባክ ሽልማት",
      cashbackRewardDesc: "ብቻፓ ክፈሉ እሞ ካብ ጠቕላላ ትእዛዝኩም 2% ኣብ MercatoX ካርድኹም ከም ናይ ቦነስ ሽልማት ብቐጥታ ርኸቡ!",
      checkingCard: "ኩነታት ካርድ MercatoX ይምርምር ኣሎ...",
      noCardTitle: "ናይ MercatoX ካርድ ኣይተረኽበን",
      cardRequired: "ካርድ የድሊ",
      noCardDesc: "ብ MercatoX ካርድ ንምኽፋል መጀመርታ ካርድ ክትገዝኡ ኣለኩም። ሕጂ ብምግዛእ 0% ናይ ኣገልግሎት ክፍሊትን 5% ኣውቶማቲክ ካሽባክን ርኸቡ።",
      buyCardNow: "ናይ MercatoX ካርድ ሕጂ ግዝኡ",
      switchToChapa: "ናብ ቻፓ ቀይር",
      insufficientBalanceTitle: "ዘይኣክል ናይ ካርድ ሕሳብ",
      insufficientBalanceDesc: "ነዚ ትእዛዝ ንምኽፋል እኹል ናይ ካርድ ሕሳብ የብልኩምን። በጃኹም ካርድኹም ምልኡ ወይ ናብ ካልእ ናይ ክፍሊት ኣገባብ ቀይሩ።",
      cardBalance: "ናይ ካርድ ሕሳብ",
      orderTotal: "ጠቕላላ ትእዛዝ",
      shortage: "ጎደሎ",
      topUpCard: "ካርድ ምላእ / ኣመሓድር",
      payWithChapa: "ብቻፓ ክፈል",
      sufficientBalanceTitle: "እኹል ሕሳብ ኣሎ",
      readyToPay: "ንምኽፋል ድሉው",
      manageCard: "ካርድ ኣመሓድር",
      sufficientBalanceDesc: "ነዚ ግዝኢት ብ 0% ናይ ኣገልግሎት ክፍሊትን ቅልጡፍ ናይ ኤስክሮው ሓለዋን ንምፍጻም እኹል ናይ ካርድ ሕሳብ ኣለኩም። 'ብ MercatoX ካርድ ክፈል' ጠውቑ እሞ ናይ 8-ዲጂት ናይ ሕልፊ ቓልኩም የእትዉ።",
      orderPayment: "ክፍሊት ትእዛዝ",
      remainingBalance: "ዝተረፈ ሕሳብ",
      escrowProtocolTitle: "100% ናይ ዓዳጊ ውሕስነት ፕሮቶኮል",
      escrowProtocolDesc: "ክፍሊትኩም ኣብ MercatoX ውሑስ ናይ ኤስክሮው ሕሳብ ይጸንሕ። ነቲ ኣቕሓ ኣብ ማዕጾኹም ርኢኹም ናይ 4-ዲጂት SMS OTP ንመጓዓዚ ክሳብ ዘይሃብኩምዎ ሸያጢ ነቲ ክፍሊት ኣይወስዶን።",
      orderSummary: "ጽማረ ትእዛዝ",
      items: "ኣቑሑ",
      item: "ኣቕሓ",
      productsInOrder: "ኣብቲ ትእዛዝ ዘለዉ ፍርያት",
      shown: "ዝተራእዩ",
      of: "ካብ",
      viewMore: "ተወሳኺ ርአ",
      viewLess: "ኣጉድል",
      subtotal: "ንኡስ ድምር ኣቑሑ",
      courierDelivery: "ናይ ማዕጾ ምብጻሕ",
      freeOver5000: "ብነጻ (ልዕሊ 5,000 ብር)",
      buyerProtectionCovered: "ዝተሸፈነ (0 ብር)",
      totalAmount: "ጠቕላላ ድምር",
      paymentGatewayLabel: "ናይ ክፍሊት ጌትወይ፦",
      authorizingCard: "ካርድ MercatoX የረጋግጽ ኣሎ...",
      redirectingChapa: "ናብ ቻፓ ጌትወይ የመሓላልፍ ኣሎ...",
      payWithCardBtn: "ብ MercatoX ካርድ ክፈል",
      processToPayChapa: "ብቻፓ ንምኽፋል ቀጽል",
      returnToCart: "ናብ ዓረብያ ዕዳጋ ተመለስ",
      deliveryCommitment: "ናይ ምብጻሕ ውሕስነት",
      deliveryCommitmentSub: "ኣብ ውሽጢ ኣዲስ ኣበባ ማእከላይ ናይ ምብጻሕ ግዜ ካብ 2 ክሳብ 4 ሰዓታት እዩ። ናይቲ መጓዓዚ ስልኪ ቑጽርን ናይ ምክትታል ሓበሬታን ብ SMS ክበጽሓኩም እዩ።",
      totalToPay: "ዝኽፈል ጠቕላላ",
      cardPinTitle: "ናይ ካርድ ድሕንነት ናይ ሕልፊ ቓል",
      cardPinSub: "ነቲ ክፍሊት ንምርግጋጽ ናይ 8-ዲጂት ናይ ካርድ ናይ ሕልፊ ቓልኩም የእትዉ",
      cardholder: "ዋና ካርድ፦",
      cardNumber: "ቑጽሪ ካርድ፦",
      amountToDeduct: "ዝቕነስ መጠን፦",
      balanceAfterDeduction: "ድሕሪ ክፍሊት ዝተርፍ ሕሳብ፦",
      enter8DigitPin: "ናይ 8-ዲጂት ናይ ካርድ ናይ ሕልፊ ቓል የእትዉ",
      pinSentToEmail: "ናብ ኢመይልኩም ዝተላእከ ናይ 8-ዲጂት ናይ ካርድ ናይ ሕልፊ ቓል የእትዉ",
      resendPinEmail: "ናይ ሕልፊ ቓል ረሲዕኩም? ናብ ኢመይል ዳግማይ ይለኣኽ",
      sendingEmail: "ይልእኽ ኣሎ...",
      authorizingOrder: "ነቲ ትእዛዝ የረጋግጽን ይቕንስን ኣሎ...",
      authorizeAndPay: "ኣረጋግጽን ክፈልን",
      escrowBadge: "100% ብኤስክሮው ዝተሓለወ · 0% ናይ ኣገልግሎት ክፍሊት",
    },
    profile: {
      title: "ናተይ ፕሮፋይል",
      verified: "ዝተረጋገጸ",
      totalOrders: "ጠቕላላ ትእዛዛት",
      delivered: "ዝበጽሑ",
      inTransit: "ኣብ መንገዲ ዘለዉ",
      personalInfo: "ውልቃዊ ሓበሬታ",
      edit: "ኣዐሪ",
      cancel: "ሰርዝ",
      saveChanges: "ለውጥታት ኣቐምጥ",
      saving: "የቐምጥ ኣሎ...",
      fullName: "ሙሉእ ስም",
      email: "ኢመይል",
      altPhone: "ተወሳኺ ስልኪ",
      deliveryAddress: "ናይ ምብጻሕ ኣድራሻ",
      city: "ከተማ",
      subcity: "ክፍለ ከተማ",
      landmark: "መፍለዪ ቦታ / ወረዳ",
      buyerProtected: "ብውሕስነት ዓዳጊ ዝተረጋገጸ ኣካውንት",
      buyerProtectedSub: "ገንዘብኩም ብጥንቃቐ ይተሓዝ — ዝልቀቕ ድሕሪ ናይ ማዕጾ OTP ምርግጋጽ ጥራይ እዩ።",
      myOrders: "ትእዛዛተይ",
      myOrdersSub: "ኩሎም ግዝኢታትኩም ርኣዩ",
      favorites: "ዝተፈተዉ",
      favoritesSub: "ዝተዓቀቡ ፍርያት",
      settings: "ቅጥዕታት",
      settingsSub: "ናይ ኣካውንት ምርጫታት",
      signOut: "ውጻእ",
      signOutSub: "ካብ ኣካውንትኩም ውጹ",
      verifyingAccess: "ናይ ፕሮፋይል ፍቓድ ይምርምር ኣሎ...",
    },
    settings: {
      title: "ናይ ኣካውንት ቅጥዕታት",
      security: "ድሕንነት",
      alerts: "መተሓሳሰቢታት",
      appearance: "ትርኢት",
      about: "ብዛዕባ እቲ ስርዓት",
      mode: "ኩነታት",
      passwordSecurity: "ናይ ሕልፊ ቓልን ድሕንነትን",
      passwordSecuritySub: "ናይ ኣካውንትኩም ምስጢራዊ ሓበሬታ ኣሐድሱ",
      currentPassword: "ናይ ሕጂ ናይ ሕልፊ ቓል",
      newPassword: "ሓዱሽ ናይ ሕልፊ ቓል",
      confirmNewPassword: "ናይ ሕልፊ ቓል ኣረጋግጽ",
      updatePassword: "ናይ ሕልፊ ቓል ኣሐድስ",
      updating: "የሐድስ ኣሎ...",
      passwordUpdated: "ናይ ሕልፊ ቓል ተሓዲሱ!",
      editProfile: "ፕሮፋይል ኣዐሪ",
      editProfileSub: "ስም፣ ኢመይል፣ ናይ ምብጻሕ ኣድራሻ",
      myOrders: "ትእዛዛተይ",
      myOrdersSub: "ትእዛዛትኩም ተኸታተሉን ኣመሓድሩን",
      signOut: "ውጻእ",
      signOutSub: "ካብ MercatoX ውጹ",
      notifications: "ናይ መተሓሳሰቢ ምርጫታት",
      notificationsSub: "መተሓሳሰቢታትን ርክባትን ኣመሓድሩ",
      smsOtp: "ናይ ማዕጾ SMS OTP",
      smsOtpSub: "መጓዓዚ ማዕጾኹም ምስ በጽሐ ዝለኣኽ ናይ 4-ዲጂት OTP",
      requiredBadge: "ኣድላዪ",
      emailInvoice: "ናይ ትእዛዝን ቅብሊትን ኢመይላት",
      emailInvoiceSub: "ናይ ኤስክሮው ምርግጋጽን ሕጋዊ ቅብሊታትን ናብ ኢመይልኩም ይለኣኽ",
      marketPromos: "ናይ ዕዳጋ ቅናሻት",
      marketPromosSub: "ካብ ቦሌ፣ መርካቶን ካብ ዝተረጋገጹ ነጋዶን ዝወጹ ፍሉያት ቅናሻት",
      escrowOtpTitle: "ናይ ኤስክሮው OTP ሓለዋ",
      escrowOtpSub: "ናይ SMS OTP ኮድኩም ኣብ MercatoX ናይ ማዕጾ ርክክብ ናይ መወዳእታ ምርጋጽ እዩ። እቲ መጓዓዚ ናትኩም ቃል ኮድ ከይረኸበ እቲ ትእዛዝ በጺሑ ክብል ኣይኽእልን።",
      themeTitle: "ናይቲ ስርዓት ትርኢት",
      themeSub: "ዝመረጽኩምዎ ናይ ሕብርን ካርድን ትርኢት ምረጹ",
      modeLight: "ብሩህ (Light)",
      modeLightSub: "ጽሩይ ጻዕዳ ካርድታት",
      modeDark: "ጸልማት (Dark)",
      modeDarkSub: "ጸሊም ካርድታት",
      modeSystem: "ሰማያዊ (System)",
      modeSystemSub: "ሳፋየር ሰማያዊ ካርድታት",
      platformInfo: "ሓበሬታ መድረኽ",
      platformInfoSub: "ዝርዝር ስርዓት ዕዳጋ MercatoX",
      platform: "መድረኽ",
      currency: "ዓይነት ገንዘብ",
      deliveryRegion: "ዞባ ምብጻሕ",
      escrowSystem: "ስርዓት ኤስክሮው",
      paymentGateway: "ናይ ክፍሊት ጌትወይ",
      accountId: "ናይ ኣካውንትኩም መለለዪ ቑጽሪ",
      escrowProtectedTitle: "ብኤስክሮው ዝተሓለወ",
      escrowProtectedSub: "ኣብ MercatoX ዝግበሩ ኩሎም ንግድታት ብስርዓት ኤስክሮው ዝተሓለዉ እዮም። ገንዘብ ብጥንቃቐ ተታሒዙ ንሸየጥቲ ዝልቀቕ ኣብ ማዕጾ ናይ OTP ኮድ ምስ ኣረጋገጽኩም ጥራይ እዩ።",
      secureBadge: "ውሑስ",
      otpVerifiedBadge: "ብ OTP ዝተረጋገጸ",
      escrowBadge: "ኤስክሮው",
      verifyingAccess: "ናይ ቅጥዕታት ፍቓድ ይምርምር ኣሎ...",
    },
    admin: {
      nav: {
        overview: "ሓፈሻዊ ርእይቶን ትንተናን",
        catalog: "ፍርያታት",
        categories: "ምድባት",
        users: "ተጠቀምቲ",
        suppliers: "ኣቕረብትን መጓዓዝያን",
        orders: "ትእዛዛትን ኤስክሮውን",
        slips: "ቅብሊታትን ኦዲት ክፍሊትን",
        subscriptions: "ምዝገባታትን ትልምታትን",
        delivery: "ምብጻሕን ዘወርትን",
        disputes: "ጎንጽታትን ምምላስ ገንዘብን",
        audit: "ናይ ሓለዋ ኦዲት መዝገብ",
        settings: "ናይ ስርዓት ምምዕራይ",
        coreMonitoring: "ቐንዲ ምክትታል",
        commerceCatalog: "ንግድን ካታሎግን",
        logisticsCare: "ሎጂስቲክስን ደገፍን",
        governanceSystem: "ምሕደራን ስርዓትን",
        clusterActive: "ክላስተር፦ ንጡፍ",
        superAdmin: "ላዕለዋይ ኣመሓዳሪ",
        signOut: "ውጻእ",
        searchPlaceholder: "ነጋዶ፣ ትእዛዛት፣ ቅብሊታት ብቕልጡፍ ድለ... (Ctrl+K)",
        complianceApprovals: "ሕጋውነትን ምጽዳቕን",
        pendingBadge: "ይጽበ ኣሎ",
        allCaughtUp: "ኩሉ ተጸራርዩ እዩ",
        noSupplierAlerts: "ምርግጋጽ ዝጽበ ሓድሽ ናይ ኣቕራቢ መመልከቲ የለን።",
        refresh: "ኣሐድስ",
        refreshing: "የሐድስ ኣሎ...",
        reviewApplication: "መመልከቲ መርምር",
        adminConsole: "ናይ ትካል ኣመሓዳሪ ኮንሶል",
        masterSuperAdmin: "ዋና ላዕለዋይ ኣመሓዳሪ",
        verifiedActive: "ዝተረጋገጸን ንጡፍን",
        accountStatus: "ኩነታት ኣካውንት",
        verifyingClearance: "ናይ ኣድሚን ድሕንነት ፍቓድ ይምርምር ኣሎ...",
      },
      overview: {
        title: "ሓፈሻዊ ትንተናን ርእይቶን መድረኽ",
        subtitle: "ናይ ቀጥታ ንግዲ መጠን፣ ናይ ትእዛዝ ፍሰትን ናይ ዕዳጋ መለክዒታትን።",
        backendSynced: "ምስ ማእከላይ ዳታቤዝ ዝተተሓሓዘ",
        updated: "ዝተሓደሰሉ እዋን",
        totalProducts: "ጠቕላላ ፍርያታት",
        activeInStock: "ኣብ ድኳን ዘለዉ",
        totalOrders: "ጠቕላላ ትእዛዛት",
        ordersProcessed: "ዝተፈጸሙ ናይ ዓማዊል ትእዛዛት",
        totalUsers: "ጠቕላላ ተጠቀምቲ",
        regularBuyers: "ቀወምቲ ዓደግቲ",
        registeredCustomers: "ዝተመዝገቡ ዓማዊል (ካብ ኣድሚን ወጻኢ)",
        totalSellers: "ጠቕላላ ሸየጥቲ",
        verifiedMerchants: "ዝተረጋገጹ ነጋዶ",
        registeredMerchants: "ዝተመዝገቡ ናይ ድኳን ነጋዶ",
        orderFulfillmentPipeline: "ናይ ምብጻሕ ትእዛዝ መስርሕ",
        viewAllOrders: "ኩሎም ትእዛዛት ርአ",
        confirmedOrders: "ዝተረጋገጹ ትእዛዛት",
        inProcessing: "ኣብ ምድላው ዘሎ",
        inTransit: "ኣብ መገዲ ዘሎ",
        deliveredCleared: "ዝበጽሑን ዝተዛዘሙን",
        cancelledReturned: "ዝተሰረዙ / ዝተመለሱ",
        volume: "መጠን",
        clusterFleetHealth: "ናይ ማይክሮሰርቪስ ክላስተር ጥዕና",
        operationalHealthy: "5 ካብ 5 ብሙሉእ ዓቕሚ ይሰርሑ ኣለዉ · ኩሎም ጥዑያት እዮም",
        connectedMicroservices: "ምስ ማእከላይ ማይክሮሰርቪስ ተራኺቡ",
        metricsUpdated: "መለክዒታት ካብ ዳታቤዝ ተሓዲሶም",
      },
      catalog: {
        title: "ምሕደራ ፍርያታት",
        subtitle: "ናይ ዕዳጋ ካታሎግ ፍርያታት መርምር፣ ኣግድ ወይ መልስካ ኣንቅሕ።",
        searchPlaceholder: "ብሽም ፍርያት፣ ብሸያጢ ወይ ብምድብ ድለ...",
        filterAll: "ኩሎም ኩነታት",
        filterActive: "ንጡፍ",
        filterOutOfStock: "ዝተወድአ",
        colProduct: "ዝርዝር ፍርያት",
        colMerchant: "ነጋዳይ / ድኳን",
        colCategory: "ምድብ",
        colPrice: "ዋጋ (ብር)",
        colStock: "ብዝሒ ፍርያት",
        colStatus: "ኩነታት",
        colAction: "ተግባር",
        loadingProducts: "ፍርያታት ይጽዕን ኣሎ...",
        noProducts: "በዚ መጽረዪ ዝተረኽበ ፍርያት የለን።",
        viewDetails: "ዝርዝር ርአ",
        suspend: "ኣግድ",
        activate: "ኣንቅሕ",
        delete: "ሰርዝ",
        merchantStore: "ናይ ነጋዳይ ድኳን",
        confirmDelete: "ፍርያት ሰርዝ",
        confirmDeleteDesc: "ነዚ ፍርያት ንሓዋሩ ንምድምሳስ ርግጸኛ ዲኻ? እዚ ተግባር ኣይዕጸፍን እዩ።",
        cancel: "ተመለስ",
        deleting: "ይድምስስ ኣሎ...",
        activeStatus: "ንጡፍ",
        outOfStockStatus: "ዝተወድአ",
      },
      categories: {
        title: "ምሕደራ ምድባት",
        subtitle: "ናይ ዕዳጋ ምድባትን ተዋረድን ኣተሓሕዛን ኣተሓባብር።",
        addCategory: "ምድብ ወስኽ",
        editCategory: "ምድብ ኣዐሪ",
        categoryName: "ሽም ምድብ",
        categorySlug: "URL Slug",
        categoryDesc: "መግለጺ",
        categoryIcon: "ሽም ኣይኮን",
        searchPlaceholder: "ምድባት ድለ...",
        colName: "ሽም ምድብ",
        colSlug: "ስላግ",
        colProductsCount: "ፍርያታት",
        colCreated: "ዝተፈጥረሉ",
        colAction: "ተግባር",
        saving: "ይዕቅብ ኣሎ...",
        save: "ምድብ ዓቅብ",
        noCategories: "ምንም ምድባት ኣይተረኽበን።",
        loadingCategories: "ምድባት ይጽዕን ኣሎ...",
        deleteCategory: "ምድብ ሰርዝ",
        confirmDeleteCat: "ነዚ ምድብ ንምድምሳስ ርግጸኛ ዲኻ?",
      },
      users: {
        title: "ምሕደራ ተጠቀምትን KYC",
        subtitle: "ዓማዊል፣ ነጋዶ፣ ዘወርትን ኣመሓደርትን ተቖጻጸር።",
        searchPlaceholder: "ተጠቀምቲ ብሽም፣ ኢመይል፣ ስልኪ ወይ ንግዲ ድለ...",
        roleAll: "ኩሎም ተራታት",
        roleCustomer: "ዓማዊል",
        roleSeller: "ሸየጥቲ",
        roleDelivery: "ዘወርቲ",
        roleSupplier: "ኣቕረብቲ",
        roleAdmin: "ኣመሓደርቲ",
        statusAll: "ኩሎም ኩነታት",
        statusVerified: "ዝተረጋገጸ",
        statusPending: "KYC ይጽበ ኣሎ",
        statusRejected: "ውድቂ ዝተገብረ",
        colUser: "መገለጺ ተጠቃሚ",
        colRole: "ተራ",
        colContact: "ርክብ",
        colKyc: "ኩነታት KYC",
        colAccountStatus: "ኩነታት ኣካውንት",
        colJoined: "ዝተመዝገበሉ",
        colAction: "ተግባር",
        active: "ንጡፍ",
        blocked: "ዝተኣገደ",
        locked: "ዝተዓጽወ",
        approveKyc: "KYC ኣጽድቕ",
        rejectKyc: "KYC ውድቂ ግበር",
        blockUser: "ተጠቃሚ ኣግድ",
        unblockUser: "ዕገዳ ኣልዕል",
        unlockUser: "ኣካውንት ክፈት",
        deleteUser: "ተጠቃሚ ሰርዝ",
        viewUserDetail: "ምሉእ ዝርዝር ርአ",
        noUsers: "በዚ መምዘኒ ዝተረኽበ ተጠቃሚ የለን።",
        loadingUsers: "ተጠቀምቲ ይጽዕን ኣሎ...",
        kycModalTitle: "ናይ KYC መረጋገጺ ሰነዳት",
        kycModalSub: "ናይ መንግስቲ መታወቒ፣ ናይ ንግዲ ፍቓድን ናይ ግብሪ ሰነዳትን መርምር።",
      },
      suppliers: {
        title: "ማውጫ ኣቕረብትን መጓዓዝያን",
        subtitle: "ናይ ንግዲ መመልከቲታት፣ ፍቓድ፣ ቁጽሪ TINን መጓዓዝያን ኣረጋግጽ።",
        searchPlaceholder: "ኣቕረብቲ ብሽም፣ ድኳን ወይ ቦታ ድለ...",
        allSuppliers: "ኩሎም ኣቕረብቲ",
        pendingReview: "ምጽዳቕ ዝጽበዩ",
        verifiedSuppliers: "ዝተረጋገጹ",
        rejectedSuppliers: "ውድቂ ዝተገብሩ",
        colSupplier: "ኣቕራቢ / ድኳን",
        colLocation: "ዞባ ዕዳጋ",
        colContact: "ስልክን ኢመይልን",
        colFleet: "ብዝሒ መጓዓዝያ",
        colVerification: "ምርግጋጽ",
        colAction: "ተግባር",
        reviewDocuments: "ሰነዳት መርምር",
        tradeLicense: "ናይ ንግዲ ፍቓድ",
        tinNumber: "ቁጽሪ ቲን (TIN)",
        approveSupplier: "ኣቕራቢ ኣጽድቕ",
        rejectSupplier: "መመልከቲ ውድቂ ግበር",
        rejectionReason: "ናይ ውድቂ ምኽንያት",
        loadingSuppliers: "ኣቕረብቲ ይጽዕን ኣሎ...",
        noSuppliers: "ናይ ኣቕራቢ መዝገብ ኣይተረኽበን።",
      },
      orders: {
        title: "ምሕደራ ትእዛዛትን ኤስክሮውን",
        subtitle: "ብኤስክሮው ዝተታሕዙ ክፍሊታት ተኸታተል፣ ዘወርቲ መድብ፣ ገንዘብ ልቀቕ።",
        searchPlaceholder: "ብቁጽሪ ትእዛዝ፣ ሽም ዓሚል፣ ስልኪ ወይ ነጋዳይ ድለ...",
        escrowBalance: "ናይ ኤስክሮው ተረፍ ሕሳብ",
        escrowFundsProtected: "ገንዘብ ዓሚል እቲ ፍርያት ኣብ ኢዱ ክሳብ ዝበጽሕ ብውሕስነት ተታሒዙ ኣሎ",
        statusAll: "ኩሎም ትእዛዛት",
        statusConfirmed: "ዝተረጋገጹ",
        statusProcessing: "ኣብ ምድላው ዘለዉ",
        statusInTransit: "ኣብ መገዲ ዘለዉ",
        statusDelivered: "ዝበጽሑ",
        statusCancelled: "ዝተሰረዙ",
        colOrder: "ቁጽሪ ትእዛዝ",
        colCustomer: "ዓሚል",
        colAddress: "ኣድራሻ ምብጻሕ",
        colAmount: "መጠን (ብር)",
        colPayment: "ክፍሊት",
        colStatus: "ኩነታት",
        colRider: "ዝተመደበ ዘዋሪ",
        colAction: "ተግባር",
        assignRider: "ዘዋሪ መድብ",
        releaseEscrow: "ኤስክሮው ልቀቕ",
        refundOrder: "ገንዘብ ንዓሚል መልስ",
        viewOrderDetails: "ትእዛዝ ርአ",
        escrowReleased: "ዝተለቐቐ",
        escrowHeld: "ብኤስክሮው ዝተታሕዘ",
        loadingOrders: "ትእዛዛት ይጽዕን ኣሎ...",
        noOrders: "ምንም ትእዛዝ ኣይተረኽበን።",
      },
      slips: {
        title: "ናይ ባንኪ ቅብሊታትን ምርግጋጽ ክፍሊትን",
        subtitle: "ናይ CBE፣ ኣዋሽ፣ ቴሌብር ናይ ባንኪ ቅብሊታት መርምርን ኣረጋግጽን።",
        searchPlaceholder: "ብቁጽሪ መወከሲ፣ ከፋሊ፣ ባንኪ ወይ ስልኪ ድለ...",
        pendingSlips: "ይጽበዩ ዘለዉ ቅብሊታት",
        approvedSlips: "ዝጸደቑ",
        rejectedSlips: "ውድቂ ዝተገብሩ",
        colReference: "ቁጽሪ መወከሲ",
        colPayer: "ከፋሊ",
        colBank: "ባንኪ / መንገዲ",
        colAmount: "መጠን ክፍሊት",
        colDate: "ዝተመዝገበሉ",
        colStatus: "ምርግጋጽ",
        colAction: "ተግባር",
        viewSlip: "ቅብሊት ርአ",
        approveSlip: "ቅብሊት ኣጽድቕ",
        rejectSlip: "ቅብሊት ውድቂ ግበር",
        slipReceiptTitle: "ምርግጋጽ ናይ ባንኪ ቅብሊት",
        noSlips: "ምርግጋጽ ዝጽበ ቅብሊት ባንኪ የለን።",
        loadingSlips: "ቅብሊታት ይጽዕን ኣሎ...",
      },
      delivery: {
        title: "መርበብ ምብጻሕን ምልኣኽን",
        subtitle: "ዘወርቲ ሞተር፣ ቫንን ዞባታትን ኣብ ናይ ቀጥታ ኩነታት ኣተሓባብር።",
        searchPlaceholder: "ዘዋሪ ብሽም፣ ስልኪ፣ ሰሌዳ ወይ ዞባ ድለ...",
        allRiders: "ኩሎም ዘወርቲ",
        activeRiders: "ንጡፍ / ኣብ ስራሕ",
        busyRiders: "ኣብ ምብጻሕ ዘሎ",
        offlineRiders: "ካብ ስራሕ ወጻኢ",
        addRider: "ዘዋሪ ወስኽ",
        colRider: "ዘዋሪ",
        colVehicle: "ተሽከርካሪን ሰሌዳን",
        colZone: "ዝተመደበሉ ዞባ",
        colActiveOrders: "ንጡፍ ዕዮታት",
        colStatus: "ኩነታት ስራሕ",
        colAction: "ተግባር",
        dispatchOrder: "ትእዛዝ ልኣኽ",
        vehicleMotorcycle: "ሞተር ሳይክል",
        vehicleVan: "ቫን / ኣይሱዙ",
        vehicleBicycle: "ብሽክለታ",
        loadingRiders: "ዘወርቲ ይጽዕን ኣሎ...",
        noRiders: "ምንም ዘወርቲ ኣይተረኽቡን።",
      },
      disputes: {
        title: "ጎንጽታትን ዳይነትን",
        subtitle: "ናይ ዓሚልን ሸያጥን ዘይምርድዳእ ፍታሕ፣ መርትዖታት መርምር፣ ውሳነ ሃብ።",
        searchPlaceholder: "ጎንጺ ብቁጽሪ ትእዛዝ፣ ዓሚል ወይ ምኽንያት ድለ...",
        allDisputes: "ኩሎም ጎንጽታት",
        openDisputes: "ክፉታት ጎንጽታት",
        resolvedDisputes: "ዝተፈትሑ",
        colDispute: "መለለዪ ጎንጺ",
        colOrder: "መወከሲ ትእዛዝ",
        colParties: "ዓሚል ምስ ሸያጢ",
        colReason: "ምኽንያት ጎንጺ",
        colAmount: "ዝተኸራኸሩሉ መጠን",
        colStatus: "ኩነታት",
        colAction: "ተግባር",
        inspectEvidence: "መርትዖታት መርምር",
        refundCustomer: "ውሳነ፦ ንዓሚል መልስ",
        releaseSeller: "ውሳነ፦ ንሸያጢ ልቀቕ",
        loadingDisputes: "ጉዳያት ጎንጺ ይጽዕን ኣሎ...",
        noDisputes: "ምንም ንጡፍ ናይ ጎንጺ ጉዳይ የለን።",
      },
      subscriptions: {
        title: "ምዝገባታትን ትልምታት ነጋዶን",
        subtitle: "ናይ ሸየጥትን ኣቕረብትን ደረጃታት፣ ኮሚሽንን ደረትን ኣዳልው።",
        tabPlans: "ትልምታት ምዝገባ",
        tabSubscribers: "ዝተመዝገቡ ነጋዶ",
        addPlan: "ሓድሽ ትልሚ ፍጠር",
        planName: "ሽም ትልሚ",
        planPrice: "ወርሓዊ ዋጋ (ብር)",
        commissionRate: "መጠን ኮሚሽን (%)",
        productLimit: "ደረት ፍርያት",
        targetRole: "ዒላማ ተራ",
        features: "ዝተኻተቱ ረብሓታት",
        savePlan: "ትልሚ ዓቅብ",
        activePlan: "ንጡፍ",
        loadingPlans: "ትልምታት ይጽዕን ኣሎ...",
        noPlans: "ዝተዳለወ ትልሚ የለን።",
      },
      settings: {
        title: "ናይ ስርዓት ምምዕራይን ሕግታትን",
        subtitle: "ናይ መድረኽ ኮሚሽን፣ ናይ ኤስክሮው ምጽናሕ ሰዓታት፣ ጽገናን ብራንዲንግን ኣዳልው።",
        platformName: "ሽም መድረኽ",
        platformTagline: "ጭርሖ መድረኽ",
        platformFee: "ናይ መድረኽ ኮሚሽን ክፍሊት (%)",
        escrowHoldHours: "ናይ ኤስክሮው ምጽናሕ ግዜ (ብሰዓታት)",
        maintenanceMode: "ናይ ጽገና ኩነታት",
        maintenanceDesc: "ንጽገናን ምዕባለን ተባሂሉ ንዓደግቲ ግዝያዊ ዕዳጋ ኣቋርጽ።",
        saveChanges: "ለውጥታት ዓቅብ",
        saving: "ይዕቅብ ኣሎ...",
        settingsSaved: "ናይ ስርዓት ምምዕራይ ብዓወት ተዓቒቡ!",
        resetDefaults: "ናብ ናይ መጀመርታ መልስ",
        brandingSettings: "ናይ ብራንድን ትርኢትን መለለዪ",
        escrowSettings: "ናይ ኤስክሮውን ምሕደራን ሕግታት",
      },
      audit: {
        title: "ናይ ሓለዋ ኦዲትን መዝገብ ንጥፈታትን",
        subtitle: "ኩሎም ናይ ኣመሓዳሪ ስጉምትታት፣ ለውጥታት KYC፣ ምዕራይ ትእዛዛትን ፈተነታት ምእታውን ተኸታተል።",
        searchPlaceholder: "ናይ ኦዲት መዝገብ ብፈጻሚ፣ ስጉምቲ፣ IP ወይ ዝርዝር ድለ...",
        filterAll: "ኩሎም ፍጻመታት",
        filterAuth: "ምርግጋጽን ምእታውን",
        filterUsers: "ምሕደራ ተጠቀምቲ",
        filterKyc: "ምሕደራ KYC",
        filterProducts: "ፍርያታትን ካታሎግን",
        filterOrders: "ትእዛዛትን ኤስክሮውን",
        filterPayments: "ክፍሊታትን ቅብሊታትን",
        colTimestamp: "ሰዓትን ዕለትን",
        colActor: "ፈጻሚ / ኣድሚን",
        colAction: "ዝተወሰደ ስጉምቲ",
        colSeverity: "ደረጃ",
        colDetails: "ዝርዝርን IPን",
        exportLogs: "ብ CSV ኣውርድ",
        loadingLogs: "ናይ ሓለዋ መዝገብ ይጽዕን ኣሎ...",
        noLogs: "ምንም ናይ ኦዲት መዝገብ ኣይተረኽበን።",
      },
      details: {
        backToAdmin: "ናብ ዳሽቦርድ ኣድሚን ተመለስ",
        orderDetails: "ዝርዝር ትእዛዝን ምክትታል ኤስክሮውን",
        productDetails: "ዝርዝር ካታሎግ ፍርያት",
        userDetails: "ናይ ተጠቃሚን ነጋዳይን KYC ሰነዳት",
        supplierDetails: "መገለጺ ኣቕራቢን ሰነዳትን",
        loadingDetails: "ዝርዝር ይጽዕን ኣሎ...",
        saveChanges: "ለውጥታት ዓቅብ",
        status: "ኩነታት",
        information: "ሓበሬታ",
        documents: "ሕጋዊ ሰነዳት",
      },
    },
  },
};

/**
 * Helper to get a nested translated value safely via a dot-path (e.g. "nav.home")
 */
export function getTranslation(
  lang: LanguageCode,
  path: string,
  fallback?: string
): string {
  const dict = translations[lang] || translations.en;
  const parts = path.split(".");
  let current: any = dict;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      // Fallback to English
      let fallbackCurrent: any = translations.en;
      for (const fbPart of parts) {
        if (fallbackCurrent && typeof fallbackCurrent === "object" && fbPart in fallbackCurrent) {
          fallbackCurrent = fallbackCurrent[fbPart];
        } else {
          return fallback || path;
        }
      }
      return typeof fallbackCurrent === "string" ? fallbackCurrent : fallback || path;
    }
  }

  return typeof current === "string" ? current : fallback || path;
}

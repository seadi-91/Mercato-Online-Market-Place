export const ENDPOINTS = {
  // Seller Analytics
  SELLER_OVERVIEW: "/seller/analytics/overview",
  SELLER_SALES_TRENDS: "/seller/analytics/sales-trends",
  SELLER_TOP_PRODUCTS: "/seller/analytics/top-products",
  SELLER_INVENTORY_ALERTS: "/seller/analytics/inventory-alerts",

  // Seller Products
  SELLER_PRODUCTS: "/seller/products",
  SELLER_PRODUCT_BY_ID: (id: string) => `/seller/products/${id}`,
  SELLER_PRODUCT_STOCK: (id: string) => `/seller/products/${id}/stock`,
  SELLER_PRODUCT_AVAILABILITY: (id: string) => `/seller/products/${id}/availability`,

  // Catalog & Categories
  CATEGORIES: "/catalog/categories",
  CATEGORY_BY_ID: (id: string) => `/catalog/categories/${id}`,
  CATALOG_PRODUCTS: "/catalog/products",
  CATALOG_PRODUCT_BY_ID: (id: string) => `/catalog/products/${id}`,

  // Seller Orders
  SELLER_ORDERS: "/seller/orders",
  SELLER_ORDER_STATUS: (id: string) => `/seller/orders/${id}/status`,

  // Warehouses & Logistics Depots
  SELLER_WAREHOUSES: "/seller/warehouses",
  SELLER_WAREHOUSE_BY_ID: (id: string) => `/seller/warehouses/${id}`,
  SELLER_WAREHOUSE_TRANSFERS: "/seller/warehouse-transfers",
  SELLER_WAREHOUSE_TRANSFER_STATUS: (id: string) => `/seller/warehouse-transfers/${id}/status`,

  // RFQs & B2B Commercial Tenders
  SELLER_RFQS: "/seller/rfqs",
  SELLER_RFQ_STATUS: (id: string) => `/seller/rfqs/${id}/status`,

  // Quotations
  SELLER_QUOTATIONS: "/seller/quotations",

  // Price Negotiations & CBE Escrow Deals
  SELLER_NEGOTIATIONS: "/seller/negotiations",
  SELLER_NEGOTIATION_COUNTER: (id: string) => `/seller/negotiations/${id}/counter`,
  SELLER_NEGOTIATION_ACCEPT: (id: string) => `/seller/negotiations/${id}/accept`,
  SELLER_NEGOTIATION_DECLINE: (id: string) => `/seller/negotiations/${id}/decline`,
  SELLER_NEGOTIATION_MESSAGES: (id: string) => `/seller/negotiations/${id}/messages`,

  // Seller Payouts & Finance
  SELLER_PAYOUTS: "/seller/payouts",
  SELLER_PROFILE: "/seller/profile",

  // Staff & Fleet Management (Branch Managers & Fleet Drivers)
  SELLER_STAFF: "/seller/staff",
  SELLER_STAFF_ID: (id: string) => `/seller/staff/${id}`,

  // Auth & Security
  AUTH_CHANGE_PASSWORD: "/auth/change-password",

  // Uploads
  UPLOAD_IMAGE: "/upload/image",
  UPLOAD_IMAGES: "/upload/images",

  // Admin
  ADMIN_AUDIT_LOGS: "/admin/audit-logs",
  ADMIN_USERS: "/admin/users",
  ADMIN_USER_DETAILS: (id: string) => `/admin/users/${id}/details`,
  ADMIN_USER_STATUS: (id: string) => `/admin/users/${id}/status`,
  ADMIN_VERIFY_MERCHANT: (id: string) => `/admin/merchants/${id}/verify`,
  ADMIN_VERIFY_DELIVERY: (id: string) => `/admin/delivery/${id}/verify`,
  ADMIN_ANALYTICS_OVERVIEW: "/admin/analytics/overview",
} as const;


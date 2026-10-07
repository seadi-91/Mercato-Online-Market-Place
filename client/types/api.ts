export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SellerOverviewMetrics {
  orders: {
    totalOrders: number;
    statusBreakdown: Record<string, number>;
    totalSales: number;
  };
  finances: {
    grossSales: number;
    pendingEscrowBalance: number;
    totalPayoutsReceived: number;
    totalPlatformFeesPaid: number;
  };
  inventoryAlerts: Array<{
    id: string;
    title: string;
    sku: string;
    stockQuantity: number;
    lowStockThreshold: number;
    unit: string;
    isOutOfStock: boolean;
  }>;
  timestamp: string;
}

export interface SalesTrendPoint {
  date: string;
  totalSales?: number;
  revenue?: number;
  orderCount: number;
}

export interface TopProductMetric {
  productId: string;
  title: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface PayoutRecord {
  id: string;
  sellerId: string;
  amount: number;
  netPayoutAmount: number;
  platformFee: number;
  bankName?: string;
  accountNumber?: string;
  paymentMethod?: string;
  status: "PENDING" | "PROCESSING" | "PROCESSED" | "FAILED";
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface UploadImageResult {
  url: string;
  publicId: string;
  format?: string;
  width?: number;
  height?: number;
}

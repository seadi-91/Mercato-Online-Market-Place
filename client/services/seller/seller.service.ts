import { api } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import {
  Category,
  Product,
  CreateProductInput,
  UpdateProductInput,
} from "@/types/product";
import { Order, UpdateOrderStatusInput } from "@/types/order";
import {
  PaginatedResponse,
  SellerOverviewMetrics,
  SalesTrendPoint,
  TopProductMetric,
  PayoutRecord,
  UploadImageResult,
} from "@/types/api";
import { Warehouse, WarehouseTransfer } from "@/types/supplier";

export interface FilterProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isAvailable?: boolean;
  isLowStock?: boolean;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface FilterOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
}

export const sellerService = {
  // --- Analytics ---
  getOverview: (): Promise<SellerOverviewMetrics> => {
    return api.get<SellerOverviewMetrics>(ENDPOINTS.SELLER_OVERVIEW);
  },

  getSalesTrends: (
    period: "day" | "week" | "month" | "year" = "month"
  ): Promise<SalesTrendPoint[]> => {
    return api.get<SalesTrendPoint[]>(
      `${ENDPOINTS.SELLER_SALES_TRENDS}?period=${period}`
    );
  },

  getTopProducts: (limit: number = 10): Promise<TopProductMetric[]> => {
    return api.get<TopProductMetric[]>(
      `${ENDPOINTS.SELLER_TOP_PRODUCTS}?limit=${limit}`
    );
  },

  getInventoryAlerts: (): Promise<
    Array<{
      id: string;
      title: string;
      sku: string;
      stockQuantity: number;
      lowStockThreshold: number;
      unit: string;
      isOutOfStock: boolean;
    }>
  > => {
    return api.get(ENDPOINTS.SELLER_INVENTORY_ALERTS);
  },

  // --- Products ---
  getProducts: (
    params?: FilterProductsParams
  ): Promise<PaginatedResponse<Product>> => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.search) query.append("search", params.search);
    if (params?.categoryId) query.append("categoryId", params.categoryId);
    if (params?.isAvailable !== undefined)
      query.append("isAvailable", String(params.isAvailable));
    if (params?.isLowStock) query.append("isLowStock", "true");

    const qs = query.toString();
    const url = qs
      ? `${ENDPOINTS.SELLER_PRODUCTS}?${qs}`
      : ENDPOINTS.SELLER_PRODUCTS;
    return api.get<PaginatedResponse<Product>>(url);
  },

  getProductById: (id: string): Promise<Product> => {
    return api.get<Product>(ENDPOINTS.SELLER_PRODUCT_BY_ID(id));
  },

  createProduct: (data: CreateProductInput): Promise<Product> => {
    return api.post<Product>(ENDPOINTS.SELLER_PRODUCTS, data);
  },

  updateProduct: (id: string, data: UpdateProductInput): Promise<Product> => {
    return api.patch<Product>(ENDPOINTS.SELLER_PRODUCT_BY_ID(id), data);
  },

  deleteProduct: (id: string): Promise<{ success: boolean; message?: string }> => {
    return api.delete(ENDPOINTS.SELLER_PRODUCT_BY_ID(id));
  },

  updateStock: (
    id: string,
    action: "REPLENISH" | "DEDUCT" | "RESERVE" | "RELEASE",
    quantity: number
  ): Promise<Product> => {
    return api.patch<Product>(ENDPOINTS.SELLER_PRODUCT_STOCK(id), {
      action,
      quantity,
    });
  },

  toggleAvailability: (
    id: string,
    isAvailable: boolean
  ): Promise<Product> => {
    return api.patch<Product>(ENDPOINTS.SELLER_PRODUCT_AVAILABILITY(id), {
      isAvailable,
    });
  },

  // --- Categories ---
  getCategories: (tree: boolean = true): Promise<Category[]> => {
    return api.get<Category[]>(`${ENDPOINTS.CATEGORIES}?tree=${tree}`);
  },

  // --- Orders ---
  getOrders: (
    params?: FilterOrdersParams
  ): Promise<PaginatedResponse<Order>> => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.status && params.status !== "ALL")
      query.append("status", params.status);
    if (params?.paymentStatus)
      query.append("paymentStatus", params.paymentStatus);

    const qs = query.toString();
    const url = qs
      ? `${ENDPOINTS.SELLER_ORDERS}?${qs}`
      : ENDPOINTS.SELLER_ORDERS;
    return api.get<PaginatedResponse<Order>>(url);
  },

  updateOrderStatus: (
    orderId: string,
    dto: UpdateOrderStatusInput
  ): Promise<Order> => {
    return api.patch<Order>(ENDPOINTS.SELLER_ORDER_STATUS(orderId), dto);
  },

  // --- Payouts ---
  getPayouts: (
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<PayoutRecord>> => {
    return api.get<PaginatedResponse<PayoutRecord>>(
      `${ENDPOINTS.SELLER_PAYOUTS}?page=${page}&limit=${limit}`
    );
  },

  // --- Uploads ---
  uploadImage: (file: File): Promise<UploadImageResult> => {
    const formData = new FormData();
    formData.append("file", file);
    return api.upload<UploadImageResult>(ENDPOINTS.UPLOAD_IMAGE, formData);
  },

  // --- Warehouses & Logistics Depots ---
  getWarehouses: (): Promise<Warehouse[]> => {
    return api.get<Warehouse[]>(ENDPOINTS.SELLER_WAREHOUSES);
  },

  getWarehouseById: (id: string): Promise<Warehouse> => {
    return api.get<Warehouse>(ENDPOINTS.SELLER_WAREHOUSE_BY_ID(id));
  },

  createWarehouse: (data: Partial<Warehouse>): Promise<Warehouse> => {
    return api.post<Warehouse>(ENDPOINTS.SELLER_WAREHOUSES, data);
  },

  updateWarehouse: (
    id: string,
    data: Partial<Warehouse>
  ): Promise<Warehouse> => {
    return api.patch<Warehouse>(ENDPOINTS.SELLER_WAREHOUSE_BY_ID(id), data);
  },

  deleteWarehouse: (
    id: string
  ): Promise<{ success: boolean; message?: string }> => {
    return api.delete(ENDPOINTS.SELLER_WAREHOUSE_BY_ID(id));
  },

  // --- Warehouse Transfers ---
  getWarehouseTransfers: (): Promise<WarehouseTransfer[]> => {
    return api.get<WarehouseTransfer[]>(ENDPOINTS.SELLER_WAREHOUSE_TRANSFERS);
  },

  createWarehouseTransfer: (
    data: Partial<WarehouseTransfer>
  ): Promise<WarehouseTransfer> => {
    return api.post<WarehouseTransfer>(
      ENDPOINTS.SELLER_WAREHOUSE_TRANSFERS,
      data
    );
  },

  updateWarehouseTransferStatus: (
    id: string,
    status: string
  ): Promise<WarehouseTransfer> => {
    return api.patch<WarehouseTransfer>(
      ENDPOINTS.SELLER_WAREHOUSE_TRANSFER_STATUS(id),
      { status }
    );
  },
};

export default sellerService;

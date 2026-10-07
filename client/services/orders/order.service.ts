import { sellerService } from "@/services/seller/seller.service";

export const orderService = {
  getOrders: sellerService.getOrders,
  updateOrderStatus: sellerService.updateOrderStatus,
};

export default orderService;

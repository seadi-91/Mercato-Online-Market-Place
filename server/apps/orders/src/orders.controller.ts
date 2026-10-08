import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import {
  CreateOrderDto,
  CreateQuotationDto,
  DeclineNegotiationDto,
  FilterAvailableDeliveriesDto,
  FilterOrdersDto,
  NegotiationMessageDto,
  SendCounterOfferDto,
  UpdateOrderStatusDto,
  UpdateRfqStatusDto,
  UserRole,
} from '@app/common';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('create_order')
  createOrder(
    @Payload() payload: { customerId: string; dto: CreateOrderDto },
  ) {
    return this.ordersService.createOrder(payload.customerId, payload.dto);
  }

  @MessagePattern('update_order_status')
  updateOrderStatus(
    @Payload()
    payload: {
      orderId: string;
      actorId: string;
      actorRole: UserRole;
      dto: UpdateOrderStatusDto;
    },
  ) {
    return this.ordersService.updateOrderStatus(
      payload.orderId,
      payload.actorId,
      payload.actorRole,
      payload.dto,
    );
  }

  @MessagePattern('cancel_order')
  cancelOrder(
    @Payload()
    payload: {
      orderId: string;
      customerId: string;
      reason?: string;
    },
  ) {
    return this.ordersService.cancelOrder(
      payload.orderId,
      payload.customerId,
      payload.reason,
    );
  }

  @MessagePattern('get_order_by_id')
  getOrderById(
    @Payload()
    payload: {
      orderId: string;
      requesterId?: string;
      requesterRole?: UserRole;
    },
  ) {
    return this.ordersService.getOrderById(
      payload.orderId,
      payload.requesterId,
      payload.requesterRole,
    );
  }

  @MessagePattern('get_customer_orders')
  getCustomerOrders(
    @Payload() payload: { customerId: string; dto: FilterOrdersDto },
  ) {
    return this.ordersService.getCustomerOrders(
      payload.customerId,
      payload.dto,
    );
  }

  @MessagePattern('get_seller_orders')
  getSellerOrders(
    @Payload() payload: { sellerId: string; dto: FilterOrdersDto },
  ) {
    return this.ordersService.getSellerOrders(payload.sellerId, payload.dto);
  }

  @MessagePattern('get_order_metrics')
  getOrderMetrics() {
    return this.ordersService.getOrderMetrics();
  }

  @MessagePattern('get_sales_trends')
  getSalesTrends(
    @Payload()
    payload?: {
      period?: 'day' | 'week' | 'month' | 'year';
      sellerId?: string;
    },
  ) {
    return this.ordersService.getSalesTrends(
      payload?.period ?? 'month',
      payload?.sellerId,
    );
  }

  @MessagePattern('get_top_selling_products')
  getTopSellingProducts(
    @Payload() payload?: { limit?: number; sellerId?: string },
  ) {
    return this.ordersService.getTopSellingProducts(
      payload?.limit ?? 10,
      payload?.sellerId,
    );
  }

  @MessagePattern('get_top_merchants')
  getTopMerchants(@Payload() payload?: { limit?: number }) {
    return this.ordersService.getTopMerchants(payload?.limit ?? 10);
  }

  @MessagePattern('get_seller_order_metrics')
  getSellerOrderMetrics(@Payload() payload: { sellerId: string }) {
    return this.ordersService.getSellerOrderMetrics(payload.sellerId);
  }

  @MessagePattern('get_all_orders_admin')
  getAllOrdersForAdmin(@Payload() dto: FilterOrdersDto) {
    return this.ordersService.getAllOrdersForAdmin(dto);
  }

  @MessagePattern('delete_order_admin')
  deleteOrderAdmin(@Payload() payload: { id: string }) {
    return this.ordersService.deleteOrderAdmin(payload.id);
  }

  @MessagePattern('update_order_payment_status')
  updateOrderPaymentStatus(
    @Payload() payload: { orderId: string; paymentStatus: any },
  ) {
    return this.ordersService.updateOrderPaymentStatus(
      payload.orderId,
      payload.paymentStatus,
    );
  }

  @MessagePattern('get_customer_overview')
  getCustomerOverview(@Payload() payload: { customerId: string }) {
    return this.ordersService.getCustomerOverview(payload.customerId);
  }

  @MessagePattern('get_available_deliveries')
  getAvailableDeliveries(@Payload() dto: FilterAvailableDeliveriesDto) {
    return this.ordersService.getAvailableDeliveries(dto);
  }

  @MessagePattern('claim_delivery')
  claimDelivery(
    @Payload() payload: { orderId: string; deliveryStaffId: string },
  ) {
    return this.ordersService.claimDelivery(
      payload.orderId,
      payload.deliveryStaffId,
    );
  }

  @MessagePattern('get_delivery_staff_orders')
  getDeliveryStaffOrders(
    @Payload() payload: { deliveryStaffId: string; dto: FilterOrdersDto },
  ) {
    return this.ordersService.getDeliveryStaffOrders(
      payload.deliveryStaffId,
      payload.dto,
    );
  }

  @MessagePattern('get_delivery_metrics')
  getDeliveryMetrics(@Payload() payload: { deliveryStaffId: string }) {
    return this.ordersService.getDeliveryMetrics(payload.deliveryStaffId);
  }

  // --- RFQs ---

  @MessagePattern('get_seller_rfqs')
  getSellerRfqs(@Payload() payload?: { sellerId?: string }) {
    return this.ordersService.getSellerRfqs(payload?.sellerId);
  }

  @MessagePattern('update_rfq_status')
  updateRfqStatus(
    @Payload() payload: { id: string; status: string },
  ) {
    return this.ordersService.updateRfqStatus(payload.id, payload.status);
  }

  // --- Quotations ---

  @MessagePattern('get_seller_quotations')
  getSellerQuotations(@Payload() payload: { sellerId: string }) {
    return this.ordersService.getSellerQuotations(payload.sellerId);
  }

  @MessagePattern('create_quotation')
  createQuotation(
    @Payload() payload: { sellerId: string; dto: CreateQuotationDto },
  ) {
    return this.ordersService.createQuotation(payload.sellerId, payload.dto);
  }

  // --- Negotiations ---

  @MessagePattern('get_seller_negotiations')
  getSellerNegotiations(@Payload() payload: { sellerId: string }) {
    return this.ordersService.getSellerNegotiations(payload.sellerId);
  }

  @MessagePattern('send_counter_offer')
  sendCounterOffer(
    @Payload()
    payload: {
      sellerId: string;
      sessionId: string;
      dto: SendCounterOfferDto;
    },
  ) {
    return this.ordersService.sendCounterOffer(
      payload.sellerId,
      payload.sessionId,
      payload.dto,
    );
  }

  @MessagePattern('accept_negotiation')
  acceptNegotiation(
    @Payload() payload: { sellerId: string; sessionId: string },
  ) {
    return this.ordersService.acceptNegotiation(
      payload.sellerId,
      payload.sessionId,
    );
  }

  @MessagePattern('decline_negotiation')
  declineNegotiation(
    @Payload()
    payload: {
      sellerId: string;
      sessionId: string;
      dto?: DeclineNegotiationDto;
    },
  ) {
    return this.ordersService.declineNegotiation(
      payload.sellerId,
      payload.sessionId,
      payload.dto,
    );
  }

  @MessagePattern('send_negotiation_message')
  sendNegotiationMessage(
    @Payload()
    payload: {
      sellerId: string;
      sessionId: string;
      message: string;
    },
  ) {
    return this.ordersService.sendNegotiationMessage(
      payload.sellerId,
      payload.sessionId,
      payload.message,
    );
  }
}




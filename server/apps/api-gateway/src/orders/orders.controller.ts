import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  AuthGuard,
  CreateOrderDto,
  CurrentUser,
  FilterOrdersDto,
  MailService,
  OrderItemEmailInfo,
  RateLimit,
  Roles,
  RolesGuard,
  UpdateOrderStatusDto,
  UserRole,
} from '@app/common';

@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);
  private readonly sentNotificationKeys = new Set<string>();

  constructor(
    @Inject('ORDERS_SERVICE') private readonly ordersClient: ClientProxy,
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    private readonly mailService: MailService,
  ) {}

  @Post('notify-new-order')
  async notifyNewOrder(@Body() body: any) {
    this.logger.log(`Received notify-new-order request for: ${body?.orderNumber || body?.id || 'Unknown'}`);
    const result = await this.dispatchOrderNotifications(body);
    return {
      success: true,
      message: 'Order email notifications dispatched to customer, admin, and sellers',
      dispatched: result,
    };
  }

  @RateLimit({ limit: 20, ttlMs: 60000 })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN)
  @Post()
  async createOrder(
    @CurrentUser('id') customerId: string,
    @Body() dto: CreateOrderDto,
  ) {
    const order = await firstValueFrom(
      this.ordersClient.send('create_order', { customerId, dto }),
    );
    this.dispatchOrderNotifications(order).catch((err) =>
      this.logger.error('Error dispatching notifications for created order:', err),
    );
    return order;
  }

  async dispatchOrderNotifications(orderData: any): Promise<boolean> {
    if (!orderData) return false;

    const key = orderData.orderNumber || orderData.id || orderData.orderId || orderData.txRef;
    if (key && this.sentNotificationKeys.has(key)) {
      this.logger.log(`Order notification for ${key} already dispatched. Skipping duplicate.`);
      return true;
    }
    if (key) {
      this.sentNotificationKeys.add(key);
    }

    try {
      // 1. Normalize items list
      const rawItems = Array.isArray(orderData.items) && orderData.items.length > 0
        ? orderData.items
        : (Array.isArray(orderData.deliveryAddress?.itemsSnapshot) ? orderData.deliveryAddress.itemsSnapshot : []);

      const normalizedItems: OrderItemEmailInfo[] = rawItems.map((it: any) => {
        const unitPrice = Number(it.unitPrice || it.price || 0);
        const quantity = Number(it.quantity || 1);
        const totalPrice = Number(it.totalPrice || unitPrice * quantity);
        return {
          productTitle: it.productTitle || it.title || it.name || 'Mercato Product',
          quantity,
          unitPrice,
          totalPrice,
          unitOfMeasure: it.unitOfMeasure || 'PIECE',
          sellerId: it.sellerId || orderData.sellerId,
          sellerName: it.sellerName,
          image: it.image,
        };
      });

      // 2. Financial calculation
      const deliveryFee = Number(orderData.deliveryFee || 0);
      let subtotal = Number(orderData.subtotalAmount || orderData.subtotal || 0);
      if (subtotal <= 0 && normalizedItems.length > 0) {
        subtotal = normalizedItems.reduce((acc, it) => acc + it.totalPrice, 0);
      }
      let totalAmount = Number(orderData.totalAmount || 0);
      if (totalAmount <= 0) {
        totalAmount = subtotal + deliveryFee;
      }

      // 3. Resolve customer details
      let customerEmail =
        orderData.deliveryAddress?.buyerEmail ||
        orderData.deliveryAddress?.email ||
        orderData.email ||
        orderData.customerEmail;
      let customerName =
        orderData.deliveryAddress?.buyerName ||
        orderData.deliveryAddress?.recipientName ||
        orderData.fullName ||
        orderData.customerName;
      let customerPhone =
        orderData.deliveryAddress?.buyerPhone ||
        orderData.deliveryAddress?.phone ||
        orderData.phoneNumber ||
        orderData.customerPhone;

      if ((!customerEmail || !customerName) && orderData.customerId) {
        try {
          const profile = await firstValueFrom(
            this.usersClient.send('get_profile', { userId: orderData.customerId }),
          ).catch(() => null);
          if (profile) {
            customerEmail = customerEmail || profile.email;
            customerName = customerName || profile.fullName;
            customerPhone = customerPhone || profile.phoneNumber;
          }
        } catch {
          // fallback
        }

        if (!customerEmail) {
          try {
            const authUser = await firstValueFrom(
              this.authClient.send('get_user_by_id', { userId: orderData.customerId }),
            ).catch(() => null);
            if (authUser) {
              customerEmail = customerEmail || authUser.email;
              customerName = customerName || authUser.fullName;
              customerPhone = customerPhone || authUser.phoneNumber;
            }
          } catch {
            // fallback
          }
        }
      }

      customerName = customerName || 'Valued Customer';
      customerPhone = customerPhone || 'Not provided';
      const orderNumber = orderData.orderNumber || key || `MX-${Date.now()}`;
      const paymentMethod = orderData.paymentMethod || 'Chapa Escrow (Telebirr / CBE / Card)';
      const paymentStatus = orderData.paymentStatus || 'PAID';

      const deliveryInfo = {
        recipientName: orderData.deliveryAddress?.recipientName || customerName,
        phone: orderData.deliveryAddress?.phone || customerPhone,
        city: orderData.deliveryAddress?.city || 'Addis Ababa',
        subCity: orderData.deliveryAddress?.subCity || 'Bole',
        specificLocation: orderData.deliveryAddress?.specificLocation || '',
        notes: orderData.deliveryAddress?.notes || orderData.notes,
      };

      // 4. Send Customer Order Confirmation Email
      if (customerEmail) {
        this.mailService
          .sendCustomerOrderPlacedEmail({
            toEmail: customerEmail,
            customerName,
            orderNumber,
            orderDate: orderData.createdAt,
            paymentMethod,
            paymentStatus,
            deliveryAddress: deliveryInfo,
            items: normalizedItems,
            subtotal,
            deliveryFee,
            totalAmount,
          })
          .catch((err) => this.logger.error('Failed to send customer order email:', err));
      }

      // 5. Send Admin New Order Notification Email
      this.mailService
        .sendAdminNewOrderNotificationEmail({
          orderNumber,
          orderId: orderData.id || orderData.orderId,
          orderDate: orderData.createdAt,
          customerName,
          customerPhone,
          customerEmail,
          paymentMethod,
          paymentStatus,
          deliveryAddress: deliveryInfo,
          items: normalizedItems,
          subtotal,
          deliveryFee,
          totalAmount,
        })
        .catch((err) => this.logger.error('Failed to send admin order email:', err));

      // 6. Group items by Seller and send distinct emails to each seller
      const sellerItemMap = new Map<string, OrderItemEmailInfo[]>();
      for (const it of normalizedItems) {
        const sId = it.sellerId || orderData.sellerId || 'default-seller';
        if (!sellerItemMap.has(sId)) {
          sellerItemMap.set(sId, []);
        }
        sellerItemMap.get(sId)!.push(it);
      }

      for (const [sellerId, sellerItems] of sellerItemMap.entries()) {
        let sellerEmail: string | undefined;
        let sellerName: string | undefined;
        let shopName: string | undefined;
        let isSupplier = false;

        if (sellerId && sellerId !== 'default-seller') {
          try {
            const sellerProfile = await firstValueFrom(
              this.usersClient.send('get_profile', { userId: sellerId }),
            ).catch(() => null);
            if (sellerProfile) {
              sellerEmail = sellerProfile.email;
              sellerName = sellerProfile.fullName;
              shopName = sellerProfile.shopName;
              isSupplier =
                sellerProfile.role === UserRole.SUPPLIER ||
                Boolean(sellerProfile.businessType?.toLowerCase().includes('supplier'));
            }
          } catch {
            // fallback
          }

          if (!sellerEmail) {
            try {
              const sellerAuth = await firstValueFrom(
                this.authClient.send('get_user_by_id', { userId: sellerId }),
              ).catch(() => null);
              if (sellerAuth) {
                sellerEmail = sellerEmail || sellerAuth.email;
                sellerName = sellerName || sellerAuth.fullName;
                isSupplier = isSupplier || sellerAuth.role === UserRole.SUPPLIER;
              }
            } catch {
              // fallback
            }
          }
        }

        const recipientSellerEmail = sellerEmail || 'muradsada8@gmail.com';
        const resolvedSellerName = shopName || sellerName || 'Mercato Merchant Partner';
        const sellerSubtotal = sellerItems.reduce((acc, it) => acc + it.totalPrice, 0);

        this.mailService
          .sendSellerOrderReceivedEmail({
            toEmail: recipientSellerEmail,
            sellerName: resolvedSellerName,
            shopName,
            orderNumber,
            orderId: orderData.id || orderData.orderId,
            orderDate: orderData.createdAt,
            buyerName: customerName,
            buyerPhone: customerPhone,
            buyerEmail: customerEmail,
            deliveryCity: deliveryInfo.city,
            deliverySubCity: deliveryInfo.subCity,
            deliveryLocation: deliveryInfo.specificLocation,
            paymentMethod,
            paymentStatus,
            sellerItems,
            sellerSubtotal,
            isSupplier,
          })
          .catch((err) =>
            this.logger.error(`Failed to send seller order email to ${recipientSellerEmail}:`, err),
          );
      }

      return true;
    } catch (err: any) {
      this.logger.error('Error in dispatchOrderNotifications:', err);
      return false;
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN)
  @Get('my-orders')
  getMyOrders(
    @CurrentUser('id') customerId: string,
    @Query() query: FilterOrdersDto,
  ) {
    return this.ordersClient.send('get_customer_orders', {
      customerId,
      dto: query,
    });
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SELLER, UserRole.SUPPLIER)
  @Get('seller-orders')
  getSellerOrders(
    @CurrentUser('id') sellerId: string,
    @Query() query: FilterOrdersDto,
  ) {
    return this.ordersClient.send('get_seller_orders', {
      sellerId,
      dto: query,
    });
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.SELLER, UserRole.SUPPLIER)
  @Post(':id/cancel')
  cancelOrder(
    @Param('id') id: string,
    @CurrentUser('id') customerId: string,
    @Body('reason') reason?: string,
  ) {
    return this.ordersClient.send('cancel_order', {
      orderId: id,
      customerId,
      reason,
    });
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SELLER, UserRole.SUPPLIER, UserRole.ADMIN, UserRole.DELIVERY)
  @Patch(':id/status')
  updateOrderStatus(
    @Param('id') id: string,
    @CurrentUser('id') actorId: string,
    @CurrentUser('role') actorRole: UserRole,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersClient.send('update_order_status', {
      orderId: id,
      actorId,
      actorRole,
      dto,
    });
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  getOrderById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser('id') requesterId: string,
    @CurrentUser('role') requesterRole: UserRole,
  ) {
    return this.ordersClient.send('get_order_by_id', {
      orderId: id,
      requesterId,
      requesterRole,
    });
  }
}


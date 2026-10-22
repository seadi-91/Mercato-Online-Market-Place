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
    await this.dispatchOrderNotifications(order).catch((err) =>
      this.logger.error('Error dispatching notifications for created order:', err),
    );
    return order;
  }

  async dispatchOrderNotifications(orderData: any): Promise<boolean> {
    if (!orderData) return false;

    const key = orderData.orderNumber || orderData.id || orderData.orderId || orderData.txRef;

    // Parse deliveryAddress if string
    let deliv = orderData.deliveryAddress;
    if (typeof deliv === 'string') {
      try {
        deliv = JSON.parse(deliv);
      } catch {
        deliv = {};
      }
    }
    if (!deliv || typeof deliv !== 'object') {
      deliv = {};
    }

    // 1. Resolve customer details
    let customerEmail =
      deliv.buyerEmail ||
      deliv.email ||
      orderData.email ||
      orderData.customerEmail ||
      orderData.buyerEmail;

    let customerName =
      deliv.buyerName ||
      deliv.recipientName ||
      orderData.fullName ||
      orderData.customerName ||
      orderData.buyerName;

    let customerPhone =
      deliv.buyerPhone ||
      deliv.recipientPhone ||
      deliv.phone ||
      orderData.phoneNumber ||
      orderData.customerPhone ||
      orderData.buyerPhone;

    // If key already sent AND customerEmail was already served, skip
    if (key && this.sentNotificationKeys.has(key) && customerEmail) {
      this.logger.log(`Order notification for ${key} already dispatched. Skipping duplicate.`);
      return true;
    }

    try {
      // 1. Normalize items list
      const rawItems = Array.isArray(orderData.items) && orderData.items.length > 0
        ? orderData.items
        : (Array.isArray(deliv.itemsSnapshot) ? deliv.itemsSnapshot : []);

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

      // If customerEmail is missing, synthetic, or example address, resolve from Profile or Auth service
      const candidateCustomerId = orderData.customerId || deliv.buyerId;
      const isInvalidCustomerEmail =
        !customerEmail ||
        customerEmail.includes('.mercatox@gmail.com') ||
        customerEmail.includes('example.com');

      if ((isInvalidCustomerEmail || !customerName) && candidateCustomerId) {
        try {
          const profile = await firstValueFrom(
            this.usersClient.send('get_profile', { userId: candidateCustomerId }),
          ).catch(() => null);
          if (profile && profile.email && !profile.email.includes('example.com')) {
            customerEmail = profile.email;
            customerName = customerName || profile.fullName;
            customerPhone = customerPhone || profile.phoneNumber;
          }
        } catch {
          // fallback
        }

        if (!customerEmail || customerEmail.includes('example.com')) {
          try {
            const authUser = await firstValueFrom(
              this.authClient.send('get_user_by_id', { userId: candidateCustomerId }),
            ).catch(() => null);
            if (authUser && authUser.email && !authUser.email.includes('example.com')) {
              customerEmail = authUser.email;
              customerName = customerName || authUser.fullName;
              customerPhone = customerPhone || authUser.phoneNumber;
            }
          } catch {
            // fallback
          }
        }
      }

      // Final fallback for email if still missing
      if (
        (!customerEmail || customerEmail.includes('.mercatox@gmail.com') || customerEmail.includes('example.com')) &&
        (candidateCustomerId || orderData.id)
      ) {
        // Look up by customer email if order has an associated user
        try {
          const allUsers = await firstValueFrom(
            this.usersClient.send('get_users', { page: 1, limit: 100 }),
          ).catch(() => null);
          if (allUsers?.users) {
            const matched = allUsers.users.find(
              (u: any) =>
                (u.id === candidateCustomerId || u.userId === candidateCustomerId) &&
                u.email &&
                !u.email.includes('example.com'),
            );
            if (matched?.email) {
              customerEmail = matched.email;
              customerName = customerName || matched.fullName;
            }
          }
        } catch {
          // fallback
        }
      }

      customerName = customerName || 'Valued Customer';
      customerPhone = customerPhone || 'Not provided';
      const orderNumber = orderData.orderNumber || key || `MX-${Date.now()}`;
      const paymentMethod = orderData.paymentMethod || 'Chapa Escrow (Telebirr / CBE / Card)';
      const paymentStatus = orderData.paymentStatus || 'PAID';

      const deliveryInfo = {
        recipientName: deliv.recipientName || customerName,
        phone: deliv.phone || customerPhone,
        city: deliv.city || 'Addis Ababa',
        subCity: deliv.subCity || 'Bole',
        specificLocation: deliv.specificLocation || '',
        notes: deliv.notes || orderData.notes,
      };

      const emailTasks: Promise<any>[] = [];

      // 4. Send Customer Order Confirmation Email
      if (
        customerEmail &&
        customerEmail.includes('@') &&
        !customerEmail.includes('.mercatox@gmail.com') &&
        !customerEmail.includes('example.com')
      ) {
        this.logger.log(`Dispatching customer order placed email to ${customerEmail} for order ${orderNumber}`);
        emailTasks.push(
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
            .then((sent) => {
              this.logger.log(`Customer order email result for ${customerEmail}: ${sent}`);
              return sent;
            })
            .catch((err) => {
              this.logger.error(`Failed to send customer order email to ${customerEmail}:`, err);
              return false;
            }),
        );
      } else {
        this.logger.warn(`No valid customer email resolved for order ${orderNumber}. Customer email skipped.`);
      }

      // 5. Send Admin New Order Notification Email
      emailTasks.push(
        this.mailService
          .sendAdminNewOrderNotificationEmail({
            orderNumber,
            orderId: orderData.id || orderData.orderId,
            orderDate: orderData.createdAt,
            customerName,
            customerPhone,
            customerEmail: customerEmail || 'Not provided',
            paymentMethod,
            paymentStatus,
            deliveryAddress: deliveryInfo,
            items: normalizedItems,
            subtotal,
            deliveryFee,
            totalAmount,
          })
          .then((sent) => {
            this.logger.log(`Admin order notification email result for order ${orderNumber}: ${sent}`);
            return sent;
          })
          .catch((err) => {
            this.logger.error('Failed to send admin order email:', err);
            return false;
          }),
      );

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

        emailTasks.push(
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
            .then((sent) => {
              this.logger.log(`Seller order email result for ${recipientSellerEmail}: ${sent}`);
              return sent;
            })
            .catch((err) => {
              this.logger.error(`Failed to send seller order email to ${recipientSellerEmail}:`, err);
              return false;
            }),
        );
      }

      await Promise.allSettled(emailTasks);

      if (key && customerEmail) {
        this.sentNotificationKeys.add(key);
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


import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import {
  AuditAction,
  AuthGuard,
  CreateOrderDto,
  CurrentUser,
  FilterOrdersDto,
  InitializePaymentDto,
  RateLimit,
  Roles,
  RolesGuard,
  UpdateProfileDto,
  UploadBankSlipDto,
  UserRole,
} from '@app/common';

@Controller('customer')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
export class CustomerController {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
    @Inject('ORDERS_SERVICE') private readonly ordersClient: ClientProxy,
    @Inject('PAYMENTS_SERVICE') private readonly paymentsClient: ClientProxy,
  ) {}

  private auditLog(
    data: {
      actorId: string;
      action: AuditAction;
      targetEntity: string;
      targetId: string;
      details?: Record<string, any>;
    },
    req: Request,
  ) {
    this.usersClient
      .send('create_audit_log', {
        ...data,
        actorRole: UserRole.CUSTOMER,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      })
      .subscribe({ error: () => null });
  }

  @Get('profile')
  getProfile(@CurrentUser('id') customerId: string) {
    return this.usersClient.send('get_profile', { userId: customerId });
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUser('id') customerId: string,
    @Body() dto: UpdateProfileDto,
    @Req() req: Request,
  ) {
    const result = await firstValueFrom(
      this.usersClient.send('update_profile', { userId: customerId, dto }),
    );

    this.auditLog(
      {
        actorId: customerId,
        action: AuditAction.PROFILE_UPDATED,
        targetEntity: 'Profile',
        targetId: customerId,
        details: { updatedFields: Object.keys(dto) },
      },
      req,
    );

    return result;
  }

  @Get('overview')
  getOverview(@CurrentUser('id') customerId: string) {
    return this.ordersClient.send('get_customer_overview', { customerId });
  }

  @RateLimit({ limit: 20, ttlMs: 60000 })
  @Post('orders')
  async createOrder(
    @CurrentUser('id') customerId: string,
    @Body() dto: CreateOrderDto,
    @Req() req: Request,
  ) {
    const order = await firstValueFrom(
      this.ordersClient.send('create_order', { customerId, dto }),
    );

    this.auditLog(
      {
        actorId: customerId,
        action: AuditAction.ORDER_PLACED,
        targetEntity: 'Order',
        targetId: order.id ?? 'unknown',
        details: {
          orderNumber: order.orderNumber,
          itemCount: dto.items?.length ?? 0,
          totalAmount: order.totalAmount,
        },
      },
      req,
    );

    return order;
  }

  @Get('orders')
  getOrders(
    @CurrentUser('id') customerId: string,
    @Query() query: FilterOrdersDto,
  ) {
    return this.ordersClient.send('get_customer_orders', {
      customerId,
      dto: query,
    });
  }

  @Get('orders/:id')
  getOrderById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser('id') customerId: string,
  ) {
    return this.ordersClient.send('get_order_by_id', {
      orderId: id,
      requesterId: customerId,
      requesterRole: UserRole.CUSTOMER,
    });
  }

  @Post('orders/:id/cancel')
  async cancelOrder(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser('id') customerId: string,
    @Body('reason') reason?: string,
    @Req() req?: Request,
  ) {
    const result = await firstValueFrom(
      this.ordersClient.send('cancel_order', {
        orderId: id,
        customerId,
        reason,
      }),
    );

    this.auditLog(
      {
        actorId: customerId,
        action: AuditAction.ORDER_CANCELLED,
        targetEntity: 'Order',
        targetId: id,
        details: { reason: reason ?? 'No reason provided' },
      },
      req,
    );

    return result;
  }

  @Get('orders/:id/track')
  async trackOrder(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser('id') customerId: string,
  ) {
    const order = await firstValueFrom(
      this.ordersClient.send('get_order_by_id', {
        orderId: id,
        requesterId: customerId,
        requesterRole: UserRole.CUSTOMER,
      }),
    );

    let carrier: any = null;
    if (order.carrierId) {
      try {
        const carrierProfile = await firstValueFrom(
          this.usersClient.send('get_profile', { userId: order.carrierId }),
        );
        carrier = {
          id: carrierProfile.userId,
          fullName: carrierProfile.fullName,
          phone: carrierProfile.alternatePhone || 'N/A',
          vehicleType: carrierProfile.vehicleType,
          plateNumber: carrierProfile.plateNumber,
        };
      } catch {
        carrier = { id: order.carrierId };
      }
    }

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      deliveryAddress: order.deliveryAddress,
      carrier,
      updatedAt: order.updatedAt,
      createdAt: order.createdAt,
    };
  }

  @RateLimit({ limit: 15, ttlMs: 60000 })
  @Post('payments/checkout')
  async checkout(
    @CurrentUser('id') customerId: string,
    @Body() dto: InitializePaymentDto,
    @Req() req: Request,
  ) {
    const result = await firstValueFrom(
      this.paymentsClient.send('initialize_payment', { customerId, dto }),
    );

    this.auditLog(
      {
        actorId: customerId,
        action: AuditAction.PAYMENT_INITIATED,
        targetEntity: 'Payment',
        targetId: result.transactionReference ?? result.id ?? dto.orderId,
        details: {
          orderId: dto.orderId,
          provider: dto.provider,
          amount: dto.amount,
        },
      },
      req,
    );

    return result;
  }

  @RateLimit({ limit: 15, ttlMs: 60000 })
  @Post('payments/bank-slip')
  async uploadBankSlip(
    @CurrentUser('id') customerId: string,
    @Body() dto: UploadBankSlipDto,
    @Req() req: Request,
  ) {
    const result = await firstValueFrom(
      this.paymentsClient.send('upload_bank_slip', { customerId, dto }),
    );

    this.auditLog(
      {
        actorId: customerId,
        action: AuditAction.BANK_SLIP_UPLOADED,
        targetEntity: 'Payment',
        targetId: dto.orderId,
        details: { orderId: dto.orderId, receiptUrl: dto.receiptUrl },
      },
      req,
    );

    return result;
  }

  @Get('payments/order/:orderId')
  getPaymentByOrderId(
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
    @CurrentUser('id') customerId: string,
  ) {
    return this.paymentsClient.send('get_payment_by_order_id', {
      orderId,
      requesterId: customerId,
      requesterRole: UserRole.CUSTOMER,
    });
  }
}

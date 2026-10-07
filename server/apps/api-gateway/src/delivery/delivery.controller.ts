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
  CurrentUser,
  DeliveryKycDto,
  FilterAvailableDeliveriesDto,
  FilterOrdersDto,
  Roles,
  RolesGuard,
  ToggleDeliveryAvailabilityDto,
  UpdateOrderStatusDto,
  UserRole,
} from '@app/common';

@Controller('delivery')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.DELIVERY)
export class DeliveryController {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
    @Inject('ORDERS_SERVICE') private readonly ordersClient: ClientProxy,
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
        actorRole: UserRole.DELIVERY,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      })
      .subscribe({ error: () => null });
  }

  @Get('profile')
  getProfile(@CurrentUser('id') deliveryStaffId: string) {
    return this.usersClient.send('get_profile', { userId: deliveryStaffId });
  }

  @Post('kyc')
  async submitKyc(
    @CurrentUser('id') deliveryStaffId: string,
    @Body() dto: DeliveryKycDto,
    @Req() req: Request,
  ) {
    const result = await firstValueFrom(
      this.usersClient.send('submit_delivery_kyc', {
        userId: deliveryStaffId,
        dto,
      }),
    );

    this.auditLog(
      {
        actorId: deliveryStaffId,
        action: AuditAction.KYC_SUBMITTED,
        targetEntity: 'Profile',
        targetId: deliveryStaffId,
        details: {
          role: UserRole.DELIVERY,
          vehicleType: dto.vehicleType,
          plateNumber: dto.plateNumber,
        },
      },
      req,
    );

    return result;
  }

  @Patch('availability')
  toggleAvailability(
    @CurrentUser('id') deliveryStaffId: string,
    @Body() dto: ToggleDeliveryAvailabilityDto,
  ) {
    return this.usersClient.send('toggle_delivery_availability', {
      userId: deliveryStaffId,
      isAvailable: dto.isAvailable,
    });
  }

  @Get('metrics')
  async getMetrics(@CurrentUser('id') deliveryStaffId: string) {
    const [profile, metrics] = await Promise.all([
      firstValueFrom(
        this.usersClient.send('get_profile', { userId: deliveryStaffId }),
      ),
      firstValueFrom(
        this.ordersClient.send('get_delivery_metrics', { deliveryStaffId }),
      ),
    ]);

    return {
      isAvailable: profile.isAvailable,
      isVerified: profile.isVerifiedDelivery,
      kycStatus: profile.deliveryKycStatus,
      vehicleType: profile.vehicleType,
      plateNumber: profile.plateNumber,
      metrics,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('orders/available')
  getAvailableDeliveries(@Query() query: FilterAvailableDeliveriesDto) {
    return this.ordersClient.send('get_available_deliveries', query);
  }

  @Post('orders/:id/claim')
  async claimDelivery(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser('id') deliveryStaffId: string,
    @Req() req: Request,
  ) {
    const result = await firstValueFrom(
      this.ordersClient.send('claim_delivery', {
        orderId: id,
        deliveryStaffId,
      }),
    );

    this.auditLog(
      {
        actorId: deliveryStaffId,
        action: AuditAction.ORDER_DELIVERY_CLAIMED,
        targetEntity: 'Order',
        targetId: id,
      },
      req,
    );

    return result;
  }

  @Get('orders/assigned')
  getAssignedOrders(
    @CurrentUser('id') deliveryStaffId: string,
    @Query() query: FilterOrdersDto,
  ) {
    return this.ordersClient.send('get_delivery_staff_orders', {
      deliveryStaffId,
      dto: query,
    });
  }

  @Get('orders/:id')
  getOrderById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser('id') deliveryStaffId: string,
  ) {
    return this.ordersClient.send('get_order_by_id', {
      orderId: id,
      requesterId: deliveryStaffId,
      requesterRole: UserRole.DELIVERY,
    });
  }

  @Patch('orders/:id/status')
  async updateOrderStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser('id') deliveryStaffId: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: Request,
  ) {
    const result = await firstValueFrom(
      this.ordersClient.send('update_order_status', {
        orderId: id,
        actorId: deliveryStaffId,
        actorRole: UserRole.DELIVERY,
        dto,
      }),
    );

    this.auditLog(
      {
        actorId: deliveryStaffId,
        action: AuditAction.ORDER_STATUS_UPDATED,
        targetEntity: 'Order',
        targetId: id,
        details: { newStatus: dto.newStatus },
      },
      req,
    );

    return result;
  }
}

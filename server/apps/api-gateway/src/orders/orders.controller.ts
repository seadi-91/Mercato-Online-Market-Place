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
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  AuthGuard,
  CreateOrderDto,
  CurrentUser,
  FilterOrdersDto,
  RateLimit,
  Roles,
  RolesGuard,
  UpdateOrderStatusDto,
  UserRole,
} from '@app/common';

@Controller('orders')
export class OrdersController {
  constructor(
    @Inject('ORDERS_SERVICE') private readonly ordersClient: ClientProxy,
  ) {}

  @RateLimit({ limit: 20, ttlMs: 60000 })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Post()
  createOrder(
    @CurrentUser('id') customerId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersClient.send('create_order', { customerId, dto });
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
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
  @Roles(UserRole.SELLER)
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
  @Roles(UserRole.CUSTOMER)
  @Post(':id/cancel')
  cancelOrder(
    @Param('id', new ParseUUIDPipe()) id: string,
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
  @Roles(UserRole.SELLER, UserRole.ADMIN, UserRole.DELIVERY)
  @Patch(':id/status')
  updateOrderStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
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


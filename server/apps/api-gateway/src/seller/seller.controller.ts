import {
  Body,
  Controller,
  Delete,
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
  AnalyticsTimeRangeDto,
  AuditAction,
  AuthGuard,
  CreateProductDto,
  CurrentUser,
  FilterOrdersDto,
  FilterSellerProductsDto,
  Roles,
  RolesGuard,
  ToggleProductAvailabilityDto,
  UpdateOrderStatusDto,
  UpdateProductDto,
  UpdateStockDto,
  UserRole,
} from '@app/common';

@Controller('seller')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.SELLER)
export class SellerController {
  constructor(
    @Inject('CATALOG_SERVICE') private readonly catalogClient: ClientProxy,
    @Inject('ORDERS_SERVICE') private readonly ordersClient: ClientProxy,
    @Inject('PAYMENTS_SERVICE') private readonly paymentsClient: ClientProxy,
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
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
        actorRole: UserRole.SELLER,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      })
      .subscribe({ error: () => null });
  }

  @Get('analytics/overview')
  async getOverview(@CurrentUser('id') sellerId: string) {
    const [orders, finances, inventoryAlerts] = await Promise.all([
      firstValueFrom(
        this.ordersClient.send('get_seller_order_metrics', { sellerId }),
      ),
      firstValueFrom(
        this.paymentsClient.send('get_seller_financial_metrics', {
          sellerId,
        }),
      ),
      firstValueFrom(
        this.catalogClient.send('get_seller_inventory_alerts', { sellerId }),
      ),
    ]);

    return {
      orders,
      finances,
      inventoryAlerts,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('analytics/sales-trends')
  getSalesTrends(
    @CurrentUser('id') sellerId: string,
    @Query() query: AnalyticsTimeRangeDto,
  ) {
    return this.ordersClient.send('get_sales_trends', {
      period: query.period || 'month',
      sellerId,
    });
  }

  @Get('analytics/top-products')
  getTopProducts(
    @CurrentUser('id') sellerId: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersClient.send('get_top_selling_products', {
      limit: limit ? parseInt(limit, 10) : 10,
      sellerId,
    });
  }

  @Get('analytics/inventory-alerts')
  getInventoryAlerts(@CurrentUser('id') sellerId: string) {
    return this.catalogClient.send('get_seller_inventory_alerts', {
      sellerId,
    });
  }

  @Get('products')
  getProducts(
    @CurrentUser('id') sellerId: string,
    @Query() query: FilterSellerProductsDto,
  ) {
    return this.catalogClient.send('get_seller_products', {
      sellerId,
      dto: query,
    });
  }

  @Post('products')
  async createProduct(
    @CurrentUser('id') sellerId: string,
    @Body() dto: CreateProductDto,
    @Req() req: Request,
  ) {
    const product = await firstValueFrom(
      this.catalogClient.send('create_product', { sellerId, dto }),
    );

    this.auditLog(
      {
        actorId: sellerId,
        action: AuditAction.PRODUCT_CREATED,
        targetEntity: 'Product',
        targetId: product.id ?? 'unknown',
        details: { title: dto.title, categoryId: dto.categoryId },
      },
      req,
    );

    return product;
  }

  @Get('products/:id')
  getProductById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.catalogClient.send('get_product_by_id', { id });
  }

  @Patch('products/:id')
  async updateProduct(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser('id') sellerId: string,
    @Body() dto: UpdateProductDto,
    @Req() req: Request,
  ) {
    const product = await firstValueFrom(
      this.catalogClient.send('update_product', { id, sellerId, dto }),
    );

    this.auditLog(
      {
        actorId: sellerId,
        action: AuditAction.PRODUCT_UPDATED,
        targetEntity: 'Product',
        targetId: id,
        details: { updatedFields: Object.keys(dto) },
      },
      req,
    );

    return product;
  }

  @Delete('products/:id')
  async deleteProduct(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser('id') sellerId: string,
    @Req() req: Request,
  ) {
    const result = await firstValueFrom(
      this.catalogClient.send('delete_product', { id, sellerId }),
    );

    this.auditLog(
      {
        actorId: sellerId,
        action: AuditAction.PRODUCT_DELETED,
        targetEntity: 'Product',
        targetId: id,
      },
      req,
    );

    return result;
  }

  @Patch('products/:id/stock')
  async updateStock(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser('id') sellerId: string,
    @Body() dto: UpdateStockDto,
    @Req() req: Request,
  ) {
    const result = await firstValueFrom(
      this.catalogClient.send('update_stock', {
        id,
        sellerId,
        role: UserRole.SELLER,
        action: dto.action,
        quantity: dto.quantity,
      }),
    );

    this.auditLog(
      {
        actorId: sellerId,
        action: AuditAction.STOCK_UPDATED,
        targetEntity: 'Product',
        targetId: id,
        details: { stockAction: dto.action, quantity: dto.quantity },
      },
      req,
    );

    return result;
  }

  @Patch('products/:id/availability')
  async toggleAvailability(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser('id') sellerId: string,
    @Body() dto: ToggleProductAvailabilityDto,
    @Req() req: Request,
  ) {
    const result = await firstValueFrom(
      this.catalogClient.send('toggle_product_availability', {
        id,
        sellerId,
        isAvailable: dto.isAvailable,
      }),
    );

    this.auditLog(
      {
        actorId: sellerId,
        action: AuditAction.PRODUCT_AVAILABILITY_TOGGLED,
        targetEntity: 'Product',
        targetId: id,
        details: { isAvailable: dto.isAvailable },
      },
      req,
    );

    return result;
  }

  @Get('orders')
  getOrders(
    @CurrentUser('id') sellerId: string,
    @Query() query: FilterOrdersDto,
  ) {
    return this.ordersClient.send('get_seller_orders', {
      sellerId,
      dto: query,
    });
  }

  @Patch('orders/:id/status')
  async updateOrderStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser('id') sellerId: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: Request,
  ) {
    const result = await firstValueFrom(
      this.ordersClient.send('update_order_status', {
        orderId: id,
        actorId: sellerId,
        actorRole: UserRole.SELLER,
        dto,
      }),
    );

    this.auditLog(
      {
        actorId: sellerId,
        action: AuditAction.ORDER_STATUS_UPDATED,
        targetEntity: 'Order',
        targetId: id,
        details: { newStatus: dto.newStatus },
      },
      req,
    );

    return result;
  }

  @Get('payouts')
  getPayouts(
    @CurrentUser('id') sellerId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.paymentsClient.send('get_seller_payouts', {
      sellerId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }
}

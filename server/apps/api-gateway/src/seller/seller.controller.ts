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
  CreateQuotationDto,
  CreateStaffDto,
  CreateWarehouseDto,
  CreateWarehouseTransferDto,
  CurrentUser,
  DeclineNegotiationDto,
  FilterOrdersDto,
  FilterSellerProductsDto,
  NegotiationMessageDto,
  Roles,
  RolesGuard,
  SendCounterOfferDto,
  ToggleProductAvailabilityDto,
  UpdateOrderStatusDto,
  UpdateProductDto,
  UpdateProfileDto,
  UpdateRfqStatusDto,
  UpdateStaffDto,
  UpdateStockDto,
  UpdateTransferStatusDto,
  UpdateWarehouseDto,
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
  ) { }

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
    @CurrentUser() user: any,
    @Query() query: FilterSellerProductsDto,
  ) {
    const targetSellerId = user?.sellerId || sellerId;
    const effectiveQuery = { ...query };
    if (user?.staffRole === 'branch_manager') {
      if (user?.branchName) {
        effectiveQuery.branchName = user.branchName;
      }
      if (user?.branchId) {
        effectiveQuery.branchId = user.branchId;
      }
    }
    return this.catalogClient.send('get_seller_products', {
      sellerId: targetSellerId,
      dto: effectiveQuery,
    });
  }

  @Post('products')
  async createProduct(
    @CurrentUser('id') sellerId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateProductDto,
    @Req() req: Request,
  ) {
    const targetSellerId = user?.sellerId || sellerId;
    const product = await firstValueFrom(
      this.catalogClient.send('create_product', { sellerId: targetSellerId, dto }),
    );

    this.auditLog(
      {
        actorId: sellerId,
        action: AuditAction.PRODUCT_CREATED,
        targetEntity: 'Product',
        targetId: product?.id ?? 'unknown',
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
    @CurrentUser() user: any,
    @Body() dto: UpdateProductDto,
    @Req() req: Request,
  ) {
    const targetSellerId = user?.sellerId || sellerId;
    const product = await firstValueFrom(
      this.catalogClient.send('update_product', { id, sellerId: targetSellerId, dto }),
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
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const targetSellerId = user?.sellerId || sellerId;
    const result = await firstValueFrom(
      this.catalogClient.send('delete_product', { id, sellerId: targetSellerId }),
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

  // --- Warehouse Logistics & Depots ---

  @Get('warehouses')
  getWarehouses(@CurrentUser('id') sellerId: string) {
    return this.catalogClient.send('get_seller_warehouses', { sellerId });
  }

  @Get('warehouses/:id')
  getWarehouseById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.catalogClient.send('get_seller_warehouse_by_id', {
      sellerId,
      id,
    });
  }

  @Post('warehouses')
  async createWarehouse(
    @CurrentUser('id') sellerId: string,
    @Body() dto: CreateWarehouseDto,
    @Req() req: Request,
  ) {
    const warehouse = await firstValueFrom(
      this.catalogClient.send('create_seller_warehouse', { sellerId, dto }),
    );

    this.auditLog(
      {
        actorId: sellerId,
        action: AuditAction.PRODUCT_CREATED,
        targetEntity: 'Warehouse',
        targetId: warehouse.id ?? 'unknown',
        details: { name: dto.name, code: dto.code },
      },
      req,
    );

    return warehouse;
  }

  @Patch('warehouses/:id')
  async updateWarehouse(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser('id') sellerId: string,
    @Body() dto: UpdateWarehouseDto,
    @Req() req: Request,
  ) {
    const warehouse = await firstValueFrom(
      this.catalogClient.send('update_seller_warehouse', {
        sellerId,
        id,
        dto,
      }),
    );

    this.auditLog(
      {
        actorId: sellerId,
        action: AuditAction.PRODUCT_UPDATED,
        targetEntity: 'Warehouse',
        targetId: id,
        details: { updatedFields: Object.keys(dto) },
      },
      req,
    );

    return warehouse;
  }

  @Delete('warehouses/:id')
  async deleteWarehouse(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser('id') sellerId: string,
    @Req() req: Request,
  ) {
    const result = await firstValueFrom(
      this.catalogClient.send('delete_seller_warehouse', { sellerId, id }),
    );

    this.auditLog(
      {
        actorId: sellerId,
        action: AuditAction.PRODUCT_DELETED,
        targetEntity: 'Warehouse',
        targetId: id,
      },
      req,
    );

    return result;
  }

  // --- Warehouse Transfers ---

  @Get('warehouse-transfers')
  getWarehouseTransfers(@CurrentUser('id') sellerId: string) {
    return this.catalogClient.send('get_warehouse_transfers', { sellerId });
  }

  @Post('warehouse-transfers')
  createWarehouseTransfer(
    @CurrentUser('id') sellerId: string,
    @Body() dto: CreateWarehouseTransferDto,
  ) {
    return this.catalogClient.send('create_warehouse_transfer', {
      sellerId,
      dto,
    });
  }

  @Patch('warehouse-transfers/:id/status')
  updateWarehouseTransferStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser('id') sellerId: string,
    @Body() body: UpdateTransferStatusDto,
  ) {
    return this.catalogClient.send('update_warehouse_transfer_status', {
      sellerId,
      id,
      status: body.status,
    });
  }

  // --- RFQs (Request for Quotations) ---

  @Get('rfqs')
  getRfqs(@CurrentUser('id') sellerId: string) {
    return this.ordersClient.send('get_seller_rfqs', { sellerId });
  }

  @Patch('rfqs/:id/status')
  updateRfqStatus(
    @Param('id') id: string,
    @Body() body: UpdateRfqStatusDto,
  ) {
    return this.ordersClient.send('update_rfq_status', {
      id,
      status: body.status,
    });
  }

  // --- Quotations ---

  @Get('quotations')
  getQuotations(@CurrentUser('id') sellerId: string) {
    return this.ordersClient.send('get_seller_quotations', { sellerId });
  }

  @Post('quotations')
  createQuotation(
    @CurrentUser('id') sellerId: string,
    @Body() dto: CreateQuotationDto,
  ) {
    return this.ordersClient.send('create_quotation', { sellerId, dto });
  }

  // --- Negotiations ---

  @Get('negotiations')
  getNegotiations(@CurrentUser('id') sellerId: string) {
    return this.ordersClient.send('get_seller_negotiations', { sellerId });
  }

  @Post('negotiations/:id/counter')
  sendCounterOffer(
    @Param('id') id: string,
    @CurrentUser('id') sellerId: string,
    @Body() dto: SendCounterOfferDto,
  ) {
    return this.ordersClient.send('send_counter_offer', {
      sellerId,
      sessionId: id,
      dto,
    });
  }

  @Patch('negotiations/:id/accept')
  acceptNegotiation(
    @Param('id') id: string,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.ordersClient.send('accept_negotiation', {
      sellerId,
      sessionId: id,
    });
  }

  @Patch('negotiations/:id/decline')
  declineNegotiation(
    @Param('id') id: string,
    @CurrentUser('id') sellerId: string,
    @Body() dto: DeclineNegotiationDto,
  ) {
    return this.ordersClient.send('decline_negotiation', {
      sellerId,
      sessionId: id,
      dto,
    });
  }

  @Post('negotiations/:id/messages')
  sendNegotiationMessage(
    @Param('id') id: string,
    @CurrentUser('id') sellerId: string,
    @Body() body: NegotiationMessageDto,
  ) {
    return this.ordersClient.send('send_negotiation_message', {
      sellerId,
      sessionId: id,
      message: body.message,
    });
  }

  @Get('profile')
  getSellerProfile(@CurrentUser('id') sellerId: string) {
    return this.usersClient.send('get_profile', { userId: sellerId });
  }

  @Patch('profile')
  async updateSellerProfile(
    @CurrentUser('id') sellerId: string,
    @Body() dto: UpdateProfileDto,
    @Req() req: Request,
  ) {
    const result = await firstValueFrom(
      this.usersClient.send('update_profile', { userId: sellerId, dto }),
    );

    this.auditLog(
      {
        actorId: sellerId,
        action: AuditAction.PROFILE_UPDATED,
        targetEntity: 'Profile',
        targetId: sellerId,
        details: { updatedFields: Object.keys(dto) },
      },
      req,
    );

    return result;
  }

  // --- Staff & Fleet Personnel Management ---

  @Get('staff')
  getStaff(@CurrentUser('id') sellerId: string) {
    return this.usersClient.send('get_seller_staff', { sellerId });
  }

  @Post('staff')
  async createStaff(
    @CurrentUser('id') sellerId: string,
    @Body() dto: CreateStaffDto,
    @Req() req: Request,
  ) {
    const staff = await firstValueFrom(
      this.usersClient.send('create_staff', { sellerId, dto }),
    );

    this.auditLog(
      {
        actorId: sellerId,
        action: AuditAction.USER_REGISTERED,
        targetEntity: 'Staff',
        targetId: staff.id ?? 'unknown',
        details: { fullName: dto.fullName, role: dto.role },
      },
      req,
    );

    return staff;
  }

  @Patch('staff/:id')
  async updateStaff(
    @Param('id') id: string,
    @CurrentUser('id') sellerId: string,
    @Body() dto: UpdateStaffDto,
    @Req() req: Request,
  ) {
    const staff = await firstValueFrom(
      this.usersClient.send('update_staff', {
        sellerId,
        staffId: id,
        dto,
      }),
    );

    this.auditLog(
      {
        actorId: sellerId,
        action: AuditAction.PROFILE_UPDATED,
        targetEntity: 'Staff',
        targetId: id,
        details: { updatedFields: Object.keys(dto) },
      },
      req,
    );

    return staff;
  }

  @Delete('staff/:id')
  async deleteStaff(
    @Param('id') id: string,
    @CurrentUser('id') sellerId: string,
    @Req() req: Request,
  ) {
    const result = await firstValueFrom(
      this.usersClient.send('delete_staff', { sellerId, staffId: id }),
    );

    this.auditLog(
      {
        actorId: sellerId,
        action: AuditAction.USER_DELETED,
        targetEntity: 'Staff',
        targetId: id,
      },
      req,
    );

    return result;
  }
}


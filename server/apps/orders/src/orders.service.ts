import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import {
  CreateOrderDto,
  FilterAvailableDeliveriesDto,
  FilterOrdersDto,
  OrderStatus,
  PaymentStatus,
  ProductUnit,
  StockAction,
  UpdateOrderStatusDto,
  UserRole,
} from '@app/common';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly dataSource: DataSource,
    @Inject('CATALOG_SERVICE')
    private readonly catalogClient: ClientProxy,
  ) {}

  async createOrder(customerId: string, dto: CreateOrderDto): Promise<Order> {
    if (!dto.items || dto.items.length === 0) {
      throw new RpcException(new BadRequestException('Order must contain at least one item'));
    }

    // Server-side price calculation and product validation
    let calculatedSubtotal = 0;
    const validatedItems: Array<{
      productId: string;
      productTitle: string;
      unitOfMeasure: ProductUnit;
      unitPrice: number;
      quantity: number;
      totalPrice: number;
    }> = [];

    for (const item of dto.items) {
      if (!item.quantity || item.quantity <= 0) {
        throw new RpcException(
          new BadRequestException(`Invalid quantity for item ${item.productId}`),
        );
      }

      let product: any;
      try {
        product = await firstValueFrom(
          this.catalogClient.send('get_product_by_id', { id: item.productId }),
        );
      } catch {
        throw new RpcException(
          new NotFoundException(`Product not found: ${item.productId}`),
        );
      }

      if (!product || !product.isActive) {
        throw new RpcException(
          new BadRequestException(`Product ${product?.title || item.productId} is no longer available`),
        );
      }

      if (product.sellerId !== dto.sellerId) {
        throw new RpcException(
          new BadRequestException(
            `Product ${product.title} does not belong to the specified seller`,
          ),
        );
      }

      const minQty = product.minOrderQuantity || 1;
      if (item.quantity < minQty) {
        throw new RpcException(
          new BadRequestException(
            `Minimum order quantity for ${product.title} is ${minQty}`,
          ),
        );
      }

      if (product.stockQuantity < item.quantity) {
        throw new RpcException(
          new BadRequestException(
            `Insufficient stock for product ${product.title}. Available: ${product.stockQuantity}`,
          ),
        );
      }

      // Determine canonical price server-side
      let canonicalPrice = Number(product.wholesalePrice || product.retailPrice || 0);
      if (product.tieredPricing && Array.isArray(product.tieredPricing) && product.tieredPricing.length > 0) {
        const matchingTier = product.tieredPricing.find(
          (t: any) =>
            item.quantity >= t.minQuantity &&
            (!t.maxQuantity || item.quantity <= t.maxQuantity),
        );
        if (matchingTier) {
          canonicalPrice = Number(matchingTier.discountedPricePerUnit);
        }
      }

      const lineTotal = canonicalPrice * item.quantity;
      calculatedSubtotal += lineTotal;

      validatedItems.push({
        productId: product.id,
        productTitle: product.title,
        unitOfMeasure: (product.unit || item.unitOfMeasure || ProductUnit.PIECE) as ProductUnit,
        unitPrice: canonicalPrice,
        quantity: item.quantity,
        totalPrice: lineTotal,
      });
    }

    const deliveryFee = Math.max(0, Number(dto.deliveryFee) || 0);
    const totalAmount = calculatedSubtotal + deliveryFee;
    const orderNumber = `MX-${new Date().getFullYear()}-${Math.floor(
      100000 + Math.random() * 900000,
    )}`;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = queryRunner.manager.create(Order, {
        orderNumber,
        customerId,
        sellerId: dto.sellerId,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.UNPAID,
        subtotalAmount: calculatedSubtotal,
        deliveryFee,
        totalAmount,
        deliveryAddress: dto.deliveryAddress,
        notes: dto.notes,
      });

      const savedOrder = await queryRunner.manager.save(order);

      const orderItems = validatedItems.map((item) =>
        queryRunner.manager.create(OrderItem, {
          orderId: savedOrder.id,
          productId: item.productId,
          productTitle: item.productTitle,
          unitOfMeasure: item.unitOfMeasure,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
        }),
      );

      await queryRunner.manager.save(orderItems);

      for (const item of validatedItems) {
        await firstValueFrom(
          this.catalogClient.send('update_stock', {
            id: item.productId,
            action: StockAction.DEDUCT,
            quantity: item.quantity,
          }),
        );
      }

      await queryRunner.commitTransaction();

      savedOrder.items = orderItems;
      return savedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new RpcException(
        new BadRequestException(error.message || 'Failed to create order'),
      );
    } finally {
      await queryRunner.release();
    }
  }

  async updateOrderStatus(
    orderId: string,
    actorId: string,
    actorRole: UserRole,
    dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });

    if (!order) {
      throw new RpcException(new NotFoundException('Order not found'));
    }

    if (actorRole === UserRole.SELLER && order.sellerId !== actorId) {
      throw new RpcException(
        new ForbiddenException('You are not authorized to update this order'),
      );
    }

    if (
      actorRole === UserRole.DELIVERY &&
      order.carrierId &&
      order.carrierId !== actorId
    ) {
      throw new RpcException(
        new ForbiddenException(
          'You are not the assigned delivery partner for this order',
        ),
      );
    }

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [
        OrderStatus.READY_FOR_PICKUP,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.READY_FOR_PICKUP]: [
        OrderStatus.IN_TRANSIT,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.IN_TRANSIT]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!validTransitions[order.status]?.includes(dto.newStatus)) {
      throw new RpcException(
        new BadRequestException(
          `Invalid order status transition from ${order.status} to ${dto.newStatus}`,
        ),
      );
    }

    if (dto.newStatus === OrderStatus.CANCELLED) {
      order.cancelReason = dto.cancelReason || 'Order cancelled';
      for (const item of order.items) {
        await firstValueFrom(
          this.catalogClient.send('update_stock', {
            id: item.productId,
            action: StockAction.REPLENISH,
            quantity: item.quantity,
          }),
        );
      }
    }

    if (dto.carrierId) {
      order.carrierId = dto.carrierId;
    }

    order.status = dto.newStatus;
    return this.orderRepository.save(order);
  }

  async cancelOrder(
    orderId: string,
    customerId: string,
    reason?: string,
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });

    if (!order) {
      throw new RpcException(new NotFoundException('Order not found'));
    }

    if (order.customerId !== customerId) {
      throw new RpcException(
        new ForbiddenException('You are not authorized to cancel this order'),
      );
    }

    const cancellableStatuses = [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
      OrderStatus.READY_FOR_PICKUP,
    ];

    if (!cancellableStatuses.includes(order.status)) {
      throw new RpcException(
        new BadRequestException(
          `Order cannot be cancelled in its current status: ${order.status}`,
        ),
      );
    }

    return this.updateOrderStatus(orderId, customerId, UserRole.CUSTOMER, {
      newStatus: OrderStatus.CANCELLED,
      cancelReason: reason || 'Cancelled by customer',
    });
  }

  async getOrderById(
    orderId: string,
    requesterId?: string,
    requesterRole?: UserRole,
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });

    if (!order) {
      throw new RpcException(new NotFoundException('Order not found'));
    }

    if (
      requesterRole === UserRole.CUSTOMER &&
      order.customerId !== requesterId
    ) {
      throw new RpcException(
        new ForbiddenException('You are not authorized to view this order'),
      );
    }

    if (
      requesterRole === UserRole.SELLER &&
      order.sellerId !== requesterId
    ) {
      throw new RpcException(
        new ForbiddenException('You are not authorized to view this order'),
      );
    }

    if (
      requesterRole === UserRole.DELIVERY &&
      order.carrierId &&
      order.carrierId !== requesterId
    ) {
      throw new RpcException(
        new ForbiddenException('You are not authorized to view this order'),
      );
    }

    return order;
  }

  async getCustomerOrders(customerId: string, dto: FilterOrdersDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.customerId = :customerId', { customerId });

    if (dto.status) {
      queryBuilder.andWhere('order.status = :status', { status: dto.status });
    }

    if (dto.paymentStatus) {
      queryBuilder.andWhere('order.paymentStatus = :paymentStatus', {
        paymentStatus: dto.paymentStatus,
      });
    }

    if (dto.startDate) {
      queryBuilder.andWhere('order.createdAt >= :startDate', {
        startDate: dto.startDate,
      });
    }

    if (dto.endDate) {
      queryBuilder.andWhere('order.createdAt <= :endDate', {
        endDate: dto.endDate,
      });
    }

    queryBuilder.orderBy('order.createdAt', 'DESC');
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSellerOrders(sellerId: string, dto: FilterOrdersDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.sellerId = :sellerId', { sellerId });

    if (dto.status) {
      queryBuilder.andWhere('order.status = :status', { status: dto.status });
    }

    if (dto.paymentStatus) {
      queryBuilder.andWhere('order.paymentStatus = :paymentStatus', {
        paymentStatus: dto.paymentStatus,
      });
    }

    if (dto.startDate) {
      queryBuilder.andWhere('order.createdAt >= :startDate', {
        startDate: dto.startDate,
      });
    }

    if (dto.endDate) {
      queryBuilder.andWhere('order.createdAt <= :endDate', {
        endDate: dto.endDate,
      });
    }

    queryBuilder.orderBy('order.createdAt', 'DESC');
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOrderMetrics() {
    const totalOrders = await this.orderRepository.count();

    const statusCountsRaw = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(order.id)', 'count')
      .groupBy('order.status')
      .getRawMany();

    const statusBreakdown: Record<string, number> = {
      [OrderStatus.PENDING]: 0,
      [OrderStatus.CONFIRMED]: 0,
      [OrderStatus.PROCESSING]: 0,
      [OrderStatus.READY_FOR_PICKUP]: 0,
      [OrderStatus.IN_TRANSIT]: 0,
      [OrderStatus.DELIVERED]: 0,
      [OrderStatus.CANCELLED]: 0,
    };

    statusCountsRaw.forEach((row) => {
      statusBreakdown[row.status] = parseInt(row.count, 10);
    });

    const gmvRaw = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'totalGmv')
      .where('order.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .getRawOne();

    const deliveredGmvRaw = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'deliveredGmv')
      .where('order.status = :delivered', { delivered: OrderStatus.DELIVERED })
      .getRawOne();

    return {
      totalOrders,
      statusBreakdown,
      totalGmv: parseFloat(gmvRaw?.totalGmv || '0'),
      deliveredGmv: parseFloat(deliveredGmvRaw?.deliveredGmv || '0'),
      deliveredOrders: statusBreakdown[OrderStatus.DELIVERED],
    };
  }

  async getSalesTrends(
    period: 'day' | 'week' | 'month' | 'year' = 'month',
    sellerId?: string,
  ) {
    const allowedPeriods = ['day', 'week', 'month', 'year'] as const;
    const safePeriod = allowedPeriods.includes(period as any) ? period : 'month';

    const qb = this.orderRepository
      .createQueryBuilder('order')
      .select(`DATE_TRUNC('${safePeriod}', order.createdAt)`, 'date')
      .addSelect('COUNT(order.id)', 'orderCount')
      .addSelect('SUM(order.totalAmount)', 'revenue')
      .where('order.status != :cancelled', { cancelled: OrderStatus.CANCELLED });

    if (sellerId) {
      qb.andWhere('order.sellerId = :sellerId', { sellerId });
    }

    qb.groupBy(`DATE_TRUNC('${safePeriod}', order.createdAt)`)
      .orderBy(`DATE_TRUNC('${safePeriod}', order.createdAt)`, 'ASC');

    const rawTrends = await qb.getRawMany();

    return rawTrends.map((row) => ({
      date: row.date,
      orderCount: parseInt(row.orderCount, 10),
      revenue: parseFloat(row.revenue || '0'),
    }));
  }

  async getTopSellingProducts(limit: number = 10, sellerId?: string) {
    const qb = this.orderItemRepository
      .createQueryBuilder('item')
      .innerJoin('item.order', 'order')
      .select('item.productId', 'productId')
      .addSelect('item.productTitle', 'title')
      .addSelect('SUM(item.quantity)', 'unitsSold')
      .addSelect('SUM(item.totalPrice)', 'totalRevenue')
      .where('order.status != :cancelled', { cancelled: OrderStatus.CANCELLED });

    if (sellerId) {
      qb.andWhere('order.sellerId = :sellerId', { sellerId });
    }

    qb.groupBy('item.productId')
      .addGroupBy('item.productTitle')
      .orderBy('"totalRevenue"', 'DESC')
      .limit(limit);

    const rawProducts = await qb.getRawMany();

    return rawProducts.map((row) => ({
      productId: row.productId,
      title: row.title,
      totalQuantitySold: parseInt(row.unitsSold || '0', 10),
      totalRevenue: parseFloat(row.totalRevenue || '0'),
    }));
  }

  async getTopMerchants(limit: number = 10) {
    const qb = this.orderRepository
      .createQueryBuilder('order')
      .select('order.sellerId', 'sellerId')
      .addSelect('COUNT(order.id)', 'totalOrders')
      .addSelect('SUM(order.totalAmount)', 'totalRevenue')
      .addSelect(
        `COUNT(CASE WHEN order.status = '${OrderStatus.DELIVERED}' THEN 1 END)`,
        'deliveredOrders',
      )
      .where('order.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .groupBy('order.sellerId')
      .orderBy('"totalRevenue"', 'DESC')
      .limit(limit);

    const rawMerchants = await qb.getRawMany();

    return rawMerchants.map((row) => ({
      sellerId: row.sellerId,
      totalOrders: parseInt(row.totalOrders, 10),
      deliveredOrders: parseInt(row.deliveredOrders, 10),
      totalRevenue: parseFloat(row.totalRevenue || '0'),
    }));
  }

  async getSellerOrderMetrics(sellerId: string) {
    const totalOrders = await this.orderRepository.count({
      where: { sellerId },
    });

    const statusCountsRaw = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(order.id)', 'count')
      .where('order.sellerId = :sellerId', { sellerId })
      .groupBy('order.status')
      .getRawMany();

    const statusBreakdown: Record<string, number> = {
      [OrderStatus.PENDING]: 0,
      [OrderStatus.CONFIRMED]: 0,
      [OrderStatus.PROCESSING]: 0,
      [OrderStatus.READY_FOR_PICKUP]: 0,
      [OrderStatus.IN_TRANSIT]: 0,
      [OrderStatus.DELIVERED]: 0,
      [OrderStatus.CANCELLED]: 0,
    };

    statusCountsRaw.forEach((row) => {
      statusBreakdown[row.status] = parseInt(row.count, 10);
    });

    const gmvRaw = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'totalSales')
      .where('order.sellerId = :sellerId', { sellerId })
      .andWhere('order.status != :cancelled', {
        cancelled: OrderStatus.CANCELLED,
      })
      .getRawOne();

    return {
      totalOrders,
      statusBreakdown,
      totalSales: parseFloat(gmvRaw?.totalSales || '0'),
      deliveredOrders: statusBreakdown[OrderStatus.DELIVERED],
    };
  }

  async getAllOrdersForAdmin(dto: FilterOrdersDto) {
    const page = dto.page && dto.page > 0 ? dto.page : 1;
    const limit = dto.limit && dto.limit > 0 ? dto.limit : 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items');

    if (dto.status) {
      queryBuilder.andWhere('order.status = :status', { status: dto.status });
    }

    if (dto.paymentStatus) {
      queryBuilder.andWhere('order.paymentStatus = :paymentStatus', {
        paymentStatus: dto.paymentStatus,
      });
    }

    if (dto.startDate) {
      queryBuilder.andWhere('order.createdAt >= :startDate', {
        startDate: dto.startDate,
      });
    }

    if (dto.endDate) {
      queryBuilder.andWhere('order.createdAt <= :endDate', {
        endDate: dto.endDate,
      });
    }

    queryBuilder.orderBy('order.createdAt', 'DESC');
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deleteOrderAdmin(orderId: string): Promise<{ success: boolean; orderId: string }> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new RpcException(new NotFoundException('Order not found'));
    }

    await this.orderRepository.remove(order);

    return {
      success: true,
      orderId,
    };
  }

  async updateOrderPaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });
    if (!order) {
      throw new RpcException(new NotFoundException('Order not found'));
    }
    order.paymentStatus = paymentStatus;
    return this.orderRepository.save(order);
  }

  async getCustomerOverview(customerId: string) {
    const totalOrders = await this.orderRepository.count({
      where: { customerId },
    });

    const activeOrders = await this.orderRepository.count({
      where: {
        customerId,
        status: In([
          OrderStatus.PENDING,
          OrderStatus.CONFIRMED,
          OrderStatus.PROCESSING,
          OrderStatus.READY_FOR_PICKUP,
          OrderStatus.IN_TRANSIT,
        ]),
      },
    });

    const deliveredOrders = await this.orderRepository.count({
      where: {
        customerId,
        status: OrderStatus.DELIVERED,
      },
    });

    const spentRaw = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'totalSpent')
      .where('order.customerId = :customerId', { customerId })
      .andWhere('order.status != :cancelled', {
        cancelled: OrderStatus.CANCELLED,
      })
      .getRawOne();

    const recentOrders = await this.orderRepository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      totalOrders,
      activeOrders,
      deliveredOrders,
      totalSpent: parseFloat(spentRaw?.totalSpent || '0'),
      recentOrders,
    };
  }

  async getAvailableDeliveries(dto: FilterAvailableDeliveriesDto) {
    const page = dto.page && dto.page > 0 ? dto.page : 1;
    const limit = dto.limit && dto.limit > 0 ? dto.limit : 20;
    const skip = (page - 1) * limit;

    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.status = :status', {
        status: OrderStatus.READY_FOR_PICKUP,
      })
      .andWhere('order.carrierId IS NULL');

    if (dto.city) {
      qb.andWhere("order.deliveryAddress->>'city' ILIKE :city", {
        city: `%${dto.city.replace(/[%_\\]/g, '\\$&')}%`,
      });
    }

    if (dto.subCity) {
      qb.andWhere("order.deliveryAddress->>'subCity' ILIKE :subCity", {
        subCity: `%${dto.subCity.replace(/[%_\\]/g, '\\$&')}%`,
      });
    }

    qb.orderBy('order.createdAt', 'ASC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async claimDelivery(orderId: string, deliveryStaffId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });

    if (!order) {
      throw new RpcException(new NotFoundException('Order not found'));
    }

    if (order.status !== OrderStatus.READY_FOR_PICKUP) {
      throw new RpcException(
        new BadRequestException(
          `Order cannot be claimed because its status is ${order.status}`,
        ),
      );
    }

    if (order.carrierId) {
      throw new RpcException(
        new ConflictException(
          'Order has already been claimed by another delivery partner',
        ),
      );
    }

    order.carrierId = deliveryStaffId;
    order.status = OrderStatus.IN_TRANSIT;
    return this.orderRepository.save(order);
  }

  async getDeliveryStaffOrders(deliveryStaffId: string, dto: FilterOrdersDto) {
    const page = dto.page && dto.page > 0 ? dto.page : 1;
    const limit = dto.limit && dto.limit > 0 ? dto.limit : 20;
    const skip = (page - 1) * limit;

    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.carrierId = :deliveryStaffId', { deliveryStaffId });

    if (dto.status) {
      qb.andWhere('order.status = :status', { status: dto.status });
    }

    if (dto.startDate) {
      qb.andWhere('order.createdAt >= :startDate', {
        startDate: dto.startDate,
      });
    }

    if (dto.endDate) {
      qb.andWhere('order.createdAt <= :endDate', {
        endDate: dto.endDate,
      });
    }

    qb.orderBy('order.updatedAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getDeliveryMetrics(deliveryStaffId: string) {
    const [totalAssigned, activeDeliveries, completedDeliveries] =
      await Promise.all([
        this.orderRepository.count({
          where: { carrierId: deliveryStaffId },
        }),
        this.orderRepository.count({
          where: {
            carrierId: deliveryStaffId,
            status: In([OrderStatus.READY_FOR_PICKUP, OrderStatus.IN_TRANSIT]),
          },
        }),
        this.orderRepository.count({
          where: {
            carrierId: deliveryStaffId,
            status: OrderStatus.DELIVERED,
          },
        }),
      ]);

    const feesRaw = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.deliveryFee)', 'earnedDeliveryFees')
      .where('order.carrierId = :deliveryStaffId', { deliveryStaffId })
      .andWhere('order.status = :delivered', {
        delivered: OrderStatus.DELIVERED,
      })
      .getRawOne();

    return {
      totalAssigned,
      activeDeliveries,
      completedDeliveries,
      earnedDeliveryFees: parseFloat(feesRaw?.earnedDeliveryFees || '0'),
    };
  }
}
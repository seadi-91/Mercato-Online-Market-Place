import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderStatus, ProductUnit, UserRole } from '@app/common';

describe('OrdersController', () => {
  let ordersController: OrdersController;
  let ordersService: OrdersService;

  const mockOrdersService = {
    createOrder: jest.fn(),
    updateOrderStatus: jest.fn(),
    cancelOrder: jest.fn(),
    getOrderById: jest.fn(),
    getCustomerOrders: jest.fn(),
    getSellerOrders: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    ordersController = module.get<OrdersController>(OrdersController);
    ordersService = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(ordersController).toBeDefined();
  });

  it('should create an order', async () => {
    const payload = {
      customerId: 'cust-uuid',
      dto: {
        sellerId: 'seller-uuid',
        items: [
          {
            productId: 'prod-uuid',
            productTitle: 'Bulk Fabric',
            unitOfMeasure: ProductUnit.ROLL,
            unitPrice: 350,
            quantity: 10,
          },
        ],
        deliveryAddress: {
          recipientName: 'Abebe Bikila',
          recipientPhone: '+251911223344',
          city: 'Addis Ababa',
          subCity: 'Addis Ketema',
          specificLocation: 'Shema Tera Block B',
        },
      },
    };
    const result = { id: 'order-uuid', orderNumber: 'MX-2026-123456' };
    mockOrdersService.createOrder.mockResolvedValue(result);

    expect(await ordersController.createOrder(payload)).toBe(result);
    expect(mockOrdersService.createOrder).toHaveBeenCalledWith(
      payload.customerId,
      payload.dto,
    );
  });

  it('should update order status', async () => {
    const payload = {
      orderId: 'order-uuid',
      actorId: 'seller-uuid',
      actorRole: UserRole.SELLER,
      dto: {
        newStatus: OrderStatus.CONFIRMED,
      },
    };
    const result = { id: 'order-uuid', status: OrderStatus.CONFIRMED };
    mockOrdersService.updateOrderStatus.mockResolvedValue(result);

    expect(await ordersController.updateOrderStatus(payload)).toBe(result);
    expect(mockOrdersService.updateOrderStatus).toHaveBeenCalledWith(
      payload.orderId,
      payload.actorId,
      payload.actorRole,
      payload.dto,
    );
  });

  it('should cancel an order', async () => {
    const payload = {
      orderId: 'order-uuid',
      customerId: 'cust-uuid',
      reason: 'Changed mind',
    };
    const result = { id: 'order-uuid', status: OrderStatus.CANCELLED };
    mockOrdersService.cancelOrder.mockResolvedValue(result);

    expect(await ordersController.cancelOrder(payload)).toBe(result);
    expect(mockOrdersService.cancelOrder).toHaveBeenCalledWith(
      payload.orderId,
      payload.customerId,
      payload.reason,
    );
  });

  it('should get order by id', async () => {
    const payload = {
      orderId: 'order-uuid',
      requesterId: 'cust-uuid',
      requesterRole: UserRole.CUSTOMER,
    };
    const result = { id: 'order-uuid', orderNumber: 'MX-2026-123456' };
    mockOrdersService.getOrderById.mockResolvedValue(result);

    expect(await ordersController.getOrderById(payload)).toBe(result);
    expect(mockOrdersService.getOrderById).toHaveBeenCalledWith(
      payload.orderId,
      payload.requesterId,
      payload.requesterRole,
    );
  });
});

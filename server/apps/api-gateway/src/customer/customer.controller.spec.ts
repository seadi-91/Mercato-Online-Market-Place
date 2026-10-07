import { Test, TestingModule } from '@nestjs/testing';
import { CustomerController } from './customer.controller';
import { of } from 'rxjs';
import {
  AuthGuard,
  OrderStatus,
  ProductUnit,
  RolesGuard,
  UserRole,
} from '@app/common';

describe('CustomerController', () => {
  let controller: CustomerController;

  const mockUsersClient = {
    send: jest.fn(),
  };

  const mockOrdersClient = {
    send: jest.fn(),
  };

  const mockPaymentsClient = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        { provide: 'USERS_SERVICE', useValue: mockUsersClient },
        { provide: 'ORDERS_SERVICE', useValue: mockOrdersClient },
        { provide: 'PAYMENTS_SERVICE', useValue: mockPaymentsClient },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CustomerController>(CustomerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get customer profile', async () => {
    const customerId = 'cust-123';
    const profile = { userId: customerId, fullName: 'Test Customer' };
    mockUsersClient.send.mockReturnValue(of(profile));

    const result = await controller.getProfile(customerId);
    expect(result).toBeDefined();
    expect(mockUsersClient.send).toHaveBeenCalledWith('get_profile', {
      userId: customerId,
    });
  });

  it('should get customer overview', async () => {
    const customerId = 'cust-123';
    const overview = { totalOrders: 5, activeOrders: 1, deliveredOrders: 4 };
    mockOrdersClient.send.mockReturnValue(of(overview));

    const result = await controller.getOverview(customerId);
    expect(result).toBeDefined();
    expect(mockOrdersClient.send).toHaveBeenCalledWith('get_customer_overview', {
      customerId,
    });
  });

  it('should create an order', async () => {
    const customerId = 'cust-123';
    const dto = {
      sellerId: 'seller-123',
      items: [
        {
          productId: 'prod-123',
          productTitle: 'Item',
          unitOfMeasure: ProductUnit.PIECE,
          unitPrice: 100,
          quantity: 2,
        },
      ],
      deliveryAddress: {
        recipientName: 'Abebe',
        recipientPhone: '+251911223344',
        city: 'Addis Ababa',
        subCity: 'Bole',
        specificLocation: 'Near Atlas',
      },
    };
    mockOrdersClient.send.mockReturnValue(of({ id: 'order-123' }));

    const result = await controller.createOrder(customerId, dto);
    expect(result).toBeDefined();
    expect(mockOrdersClient.send).toHaveBeenCalledWith('create_order', {
      customerId,
      dto,
    });
  });
});

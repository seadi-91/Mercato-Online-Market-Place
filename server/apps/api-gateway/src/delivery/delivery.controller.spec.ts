import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryController } from './delivery.controller';
import { of } from 'rxjs';
import { AuthGuard, RolesGuard } from '@app/common';

describe('DeliveryController', () => {
  let controller: DeliveryController;

  const mockUsersClient = {
    send: jest.fn(),
  };

  const mockOrdersClient = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryController],
      providers: [
        { provide: 'USERS_SERVICE', useValue: mockUsersClient },
        { provide: 'ORDERS_SERVICE', useValue: mockOrdersClient },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DeliveryController>(DeliveryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get delivery profile', async () => {
    const deliveryStaffId = 'del-123';
    const profile = { userId: deliveryStaffId, fullName: 'Delivery Driver' };
    mockUsersClient.send.mockReturnValue(of(profile));

    const result = await controller.getProfile(deliveryStaffId);
    expect(result).toBeDefined();
    expect(mockUsersClient.send).toHaveBeenCalledWith('get_profile', {
      userId: deliveryStaffId,
    });
  });

  it('should toggle availability', async () => {
    const deliveryStaffId = 'del-123';
    mockUsersClient.send.mockReturnValue(of({ isAvailable: true }));

    const result = await controller.toggleAvailability(deliveryStaffId, {
      isAvailable: true,
    });
    expect(result).toBeDefined();
    expect(mockUsersClient.send).toHaveBeenCalledWith(
      'toggle_delivery_availability',
      {
        userId: deliveryStaffId,
        isAvailable: true,
      },
    );
  });

  it('should claim delivery', async () => {
    const deliveryStaffId = 'del-123';
    const orderId = 'order-123';
    mockOrdersClient.send.mockReturnValue(of({ id: orderId, carrierId: deliveryStaffId }));

    const result = await controller.claimDelivery(orderId, deliveryStaffId);
    expect(result).toBeDefined();
    expect(mockOrdersClient.send).toHaveBeenCalledWith('claim_delivery', {
      orderId,
      deliveryStaffId,
    });
  });
});

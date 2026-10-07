import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from '@app/common';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    createProfile: jest.fn(),
    getProfileByUserId: jest.fn(),
    updateProfile: jest.fn(),
    submitMerchantKyc: jest.fn(),
    submitDeliveryKyc: jest.fn(),
    verifyMerchant: jest.fn(),
    verifyDelivery: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  it('should create a profile', async () => {
    const createProfileDto = {
      userId: 'uuid-1',
      role: UserRole.CUSTOMER,
      fullName: 'Test User',
    };
    const result = {
      id: 'profile-uuid',
      ...createProfileDto,
    };
    mockUsersService.createProfile.mockResolvedValue(result);

    expect(await usersController.createProfile(createProfileDto)).toBe(result);
    expect(mockUsersService.createProfile).toHaveBeenCalledWith(createProfileDto);
  });

  it('should get a profile by userId', async () => {
    const payload = { userId: 'uuid-1' };
    const result = {
      id: 'profile-uuid',
      userId: 'uuid-1',
      fullName: 'Test User',
    };
    mockUsersService.getProfileByUserId.mockResolvedValue(result);

    expect(await usersController.getProfile(payload)).toBe(result);
    expect(mockUsersService.getProfileByUserId).toHaveBeenCalledWith(payload.userId);
  });

  it('should update profile', async () => {
    const payload = {
      userId: 'uuid-1',
      dto: { fullName: 'Updated Name' },
    };
    const result = {
      id: 'profile-uuid',
      userId: 'uuid-1',
      fullName: 'Updated Name',
    };
    mockUsersService.updateProfile.mockResolvedValue(result);

    expect(await usersController.updateProfile(payload)).toBe(result);
    expect(mockUsersService.updateProfile).toHaveBeenCalledWith(
      payload.userId,
      payload.dto,
    );
  });

  it('should submit merchant kyc', async () => {
    const payload = {
      userId: 'uuid-1',
      dto: {
        shopName: 'Abebe Shop',
        marketZone: 'Shema Tera',
        tradeLicenseNumber: 'TL-12345',
        tinNumber: 'TIN-12345',
      },
    };
    const result = {
      id: 'profile-uuid',
      userId: 'uuid-1',
      ...payload.dto,
      isVerifiedMerchant: false,
    };
    mockUsersService.submitMerchantKyc.mockResolvedValue(result);

    expect(await usersController.submitMerchantKyc(payload)).toBe(result);
    expect(mockUsersService.submitMerchantKyc).toHaveBeenCalledWith(
      payload.userId,
      payload.dto,
    );
  });

  it('should submit delivery kyc', async () => {
    const payload = {
      userId: 'uuid-1',
      dto: {
        vehicleType: 'Motorcycle',
        plateNumber: 'AA-12345',
        drivingLicenseNumber: 'DL-12345',
        isAvailable: true,
      },
    };
    const result = {
      id: 'profile-uuid',
      userId: 'uuid-1',
      ...payload.dto,
      isVerifiedDelivery: false,
    };
    mockUsersService.submitDeliveryKyc.mockResolvedValue(result);

    expect(await usersController.submitDeliveryKyc(payload)).toBe(result);
    expect(mockUsersService.submitDeliveryKyc).toHaveBeenCalledWith(
      payload.userId,
      payload.dto,
    );
  });

  it('should verify merchant', async () => {
    const payload = {
      userId: 'uuid-1',
      isVerified: true,
    };
    const result = {
      id: 'profile-uuid',
      userId: 'uuid-1',
      isVerifiedMerchant: true,
    };
    mockUsersService.verifyMerchant.mockResolvedValue(result);

    expect(await usersController.verifyMerchant(payload)).toBe(result);
    expect(mockUsersService.verifyMerchant).toHaveBeenCalledWith(
      payload.userId,
      payload.isVerified,
    );
  });

  it('should verify delivery', async () => {
    const payload = {
      userId: 'uuid-1',
      isVerified: true,
    };
    const result = {
      id: 'profile-uuid',
      userId: 'uuid-1',
      isVerifiedDelivery: true,
    };
    mockUsersService.verifyDelivery.mockResolvedValue(result);

    expect(await usersController.verifyDelivery(payload)).toBe(result);
    expect(mockUsersService.verifyDelivery).toHaveBeenCalledWith(
      payload.userId,
      payload.isVerified,
    );
  });
});

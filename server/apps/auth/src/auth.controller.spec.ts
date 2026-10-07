import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRole } from '@app/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    changePassword: jest.fn(),
    validateToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('should register a user', async () => {
    const registerDto = {
      phoneNumber: '+251911223344',
      password: 'password123',
      fullName: 'Test User',
      role: UserRole.CUSTOMER,
    };
    const result = {
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      user: {
        id: 'uuid-1',
        phoneNumber: '+251911223344',
        role: UserRole.CUSTOMER,
      },
    };
    mockAuthService.register.mockResolvedValue(result);

    expect(await authController.register(registerDto)).toBe(result);
    expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
  });

  it('should login a user', async () => {
    const loginDto = {
      phoneNumber: '+251911223344',
      password: 'password123',
    };
    const result = {
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      user: {
        id: 'uuid-1',
        phoneNumber: '+251911223344',
        role: UserRole.CUSTOMER,
      },
    };
    mockAuthService.login.mockResolvedValue(result);

    expect(await authController.login(loginDto)).toBe(result);
    expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
  });

  it('should refresh token', async () => {
    const refreshTokenDto = {
      userId: 'uuid-1',
      refreshToken: 'refresh_token',
    };
    const result = {
      accessToken: 'new_access_token',
      refreshToken: 'new_refresh_token',
    };
    mockAuthService.refreshToken.mockResolvedValue(result);

    expect(await authController.refreshToken(refreshTokenDto)).toBe(result);
    expect(mockAuthService.refreshToken).toHaveBeenCalledWith(refreshTokenDto);
  });

  it('should logout a user', async () => {
    const payload = { userId: 'uuid-1' };
    const result = { success: true };
    mockAuthService.logout.mockResolvedValue(result);

    expect(await authController.logout(payload)).toBe(result);
    expect(mockAuthService.logout).toHaveBeenCalledWith(payload.userId);
  });

  it('should change password', async () => {
    const changePasswordDto = {
      userId: 'uuid-1',
      currentPassword: 'oldPassword123',
      newPassword: 'newPassword123',
    };
    const result = { success: true };
    mockAuthService.changePassword.mockResolvedValue(result);

    expect(await authController.changePassword(changePasswordDto)).toBe(result);
    expect(mockAuthService.changePassword).toHaveBeenCalledWith(changePasswordDto);
  });

  it('should validate token', async () => {
    const payload = { token: 'jwt_token' };
    const result = {
      id: 'uuid-1',
      phoneNumber: '+251911223344',
      role: UserRole.CUSTOMER,
    };
    mockAuthService.validateToken.mockResolvedValue(result);

    expect(await authController.validateToken(payload)).toBe(result);
    expect(mockAuthService.validateToken).toHaveBeenCalledWith(payload.token);
  });
});

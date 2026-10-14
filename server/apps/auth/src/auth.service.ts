import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtPayload, UserRole, KycStatus, AuditAction } from '@app/common';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientProxy,
  ) { }

  private readonly failedLoginAttemptsMap = new Map<string, number>();

  private getMaxLoginAttempts(): number {
    try {
      const filePath = path.resolve(process.cwd(), 'platform-settings.json');
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.maxLoginAttempts) {
          const num = parseInt(parsed.maxLoginAttempts, 10);
          if (!isNaN(num) && num > 0) return num;
        }
      }
    } catch {
      // fallback
    }
    return 5;
  }

  private normalizePhoneNumber(phone: string): string {
    const cleaned = (phone || '').replace(/[\s\-\(\)]/g, '');
    if (cleaned.startsWith('0')) {
      return `+251${cleaned.slice(1)}`;
    }
    if (cleaned.startsWith('251')) {
      return `+${cleaned}`;
    }
    if (!cleaned.startsWith('+') && (cleaned.length === 9 || cleaned.length === 10)) {
      return cleaned.startsWith('0') ? `+251${cleaned.slice(1)}` : `+251${cleaned}`;
    }
    return cleaned;
  }

  async register(dto: RegisterDto) {
    const normalizedPhone = this.normalizePhoneNumber(dto.phoneNumber);
    const existingUser = await this.userRepository.findOne({
      where: [
        { phoneNumber: normalizedPhone },
        ...(dto.email ? [{ email: dto.email.toLowerCase().trim() }] : []),
      ],
    });
    if (existingUser) {
      throw new RpcException(
        new ConflictException('Phone number or email is already registered'),
      );
    }

    if (dto.role === UserRole.ADMIN) {
      throw new RpcException(
        new BadRequestException('Registration as administrator is not permitted'),
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);
    const role = dto.role || UserRole.CUSTOMER;

    const user = this.userRepository.create({
      phoneNumber: normalizedPhone,
      email: dto.email ? dto.email.toLowerCase().trim() : null,
      passwordHash,
      role,
      isActive: true,
    });

    const savedUser = await this.userRepository.save(user);

    console.log('[AuthService] register forwarding to create_profile dto:', JSON.stringify(dto));

    const isSupplier = Boolean(
      role === UserRole.SUPPLIER ||
      (dto.role as any) === 'SUPPLIER' ||
      (dto.businessType && dto.businessType.toLowerCase().includes('supplier'))
    );

    const profileResult = await firstValueFrom(
      this.usersClient.send('create_profile', {
        userId: savedUser.id,
        role: savedUser.role,
        fullName: dto.fullName,
        phoneNumber: savedUser.phoneNumber,
        alternatePhone: (dto as any).alternatePhone || savedUser.phoneNumber,
        email: savedUser.email,
        shopName: dto.shopName,
        marketZone: dto.marketZone,
        tradeLicenseNumber: dto.tradeLicenseNumber,
        tinNumber: dto.tinNumber,
        nationalIdNumber: dto.nationalIdNumber,
        businessType: dto.businessType,
        city: dto.city || 'Addis Ababa',
        subCity: dto.subCity,
        specificLocation: dto.specificLocation,
        businessLicenseUrl: dto.businessLicenseUrl,
        tinCertificateUrl: dto.tinCertificateUrl,
        commercialRegistrationUrl: dto.commercialRegistrationUrl,
        ownerIdUrl: dto.ownerIdUrl,
        isSupplier,
      }),
    ).catch(() => null);

    if (isSupplier || role === UserRole.SELLER || role === UserRole.SUPPLIER) {
      firstValueFrom(
        this.usersClient.send('create_audit_log', {
          actorId: savedUser.id,
          actorRole: savedUser.role,
          action: AuditAction.KYC_SUBMITTED,
          targetEntity: 'Profile',
          targetId: savedUser.id,
          details: {
            shopName: dto.shopName,
            fullName: dto.fullName,
            phoneNumber: savedUser.phoneNumber,
            email: savedUser.email,
            tradeLicenseNumber: dto.tradeLicenseNumber,
            tinNumber: dto.tinNumber,
            marketZone: dto.marketZone,
            businessType: dto.businessType,
            specificLocation: dto.specificLocation,
            isSupplier,
            action: 'NEW_SUPPLIER_REGISTRATION_SUBMITTED',
          },
        }),
      ).catch(() => null);
    }

    const tokens = await this.generateTokens(
      savedUser.id,
      savedUser.phoneNumber,
      savedUser.role,
      savedUser.email,
    );

    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, salt);
    await this.userRepository.update(savedUser.id, { refreshTokenHash });

    return {
      ...tokens,
      user: {
        id: savedUser.id,
        phoneNumber: savedUser.phoneNumber,
        email: savedUser.email,
        fullName: dto.fullName,
        role: savedUser.role,
        actualRole: savedUser.role,
        businessType: dto.businessType,
        shopName: dto.shopName,
        isSupplier,
        merchantKycStatus: isSupplier ? 'PENDING' : 'NONE',
        isVerifiedMerchant: false,
      },
    };
  }

  async login(dto: LoginDto) {
    const identifier = (dto.phoneNumber || '').trim();
    const isEmail = identifier.includes('@');
    const normalizedPhone = this.normalizePhoneNumber(identifier);

    const qb = this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash');

    if (isEmail) {
      qb.where('LOWER(user.email) = :email', { email: identifier.toLowerCase() });
    } else {
      qb.where('(user.phoneNumber = :normPhone OR user.phoneNumber = :rawPhone)', {
        normPhone: normalizedPhone,
        rawPhone: identifier,
      });
    }

    const user = await qb.getOne();

    if (!user) {
      // Check if it is a staff personnel (Branch Manager, Fleet Driver, Warehouse Lead)
      try {
        const staff: any = await firstValueFrom(
          this.usersClient.send('authenticate_staff', {
            identifier,
            password: dto.password,
          }),
        );

        if (staff) {
          const role = staff.role === 'driver' ? UserRole.DELIVERY : UserRole.SELLER;
          const tokens = await this.generateTokens(
            staff.id,
            staff.phone,
            role,
            staff.email,
            staff.role,
            staff.branchId,
            staff.branchName,
            staff.sellerId,
          );

          return {
            ...tokens,
            user: {
              id: staff.id,
              sellerId: staff.sellerId,
              phoneNumber: staff.phone,
              email: staff.email,
              fullName: staff.fullName,
              role: staff.role === 'driver' ? 'DELIVERY' : 'SUPPLIER',
              actualRole: role,
              staffRole: staff.role,
              branchId: staff.branchId,
              branchName: staff.branchName,
              assignedVehiclePlate: staff.assignedVehiclePlate,
              assignedVehicleType: staff.assignedVehicleType,
              driverLicenseNumber: staff.driverLicenseNumber,
              isSupplier: staff.role !== 'driver',
              isVerified: true,
            },
          };
        }
      } catch (err: any) {
        if (err?.message && !err.message.includes('pattern')) {
          throw new RpcException(new UnauthorizedException(err.message));
        }
      }

      throw new RpcException(
        new UnauthorizedException('Invalid credentials. Please verify your phone/email and password.'),
      );
    }

    if (!user.isActive) {
      throw new RpcException(
        new UnauthorizedException(
          'Your account has been blocked because you exceeded the allowed login attempt limit. Please submit a system report to the administrator.',
        ),
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      const maxAttempts = this.getMaxLoginAttempts();
      const currentAttempts = (this.failedLoginAttemptsMap.get(user.id) || 0) + 1;
      this.failedLoginAttemptsMap.set(user.id, currentAttempts);

      if (currentAttempts >= maxAttempts) {
        // Block user account upon reaching lockout threshold
        await this.userRepository.update(user.id, { isActive: false });
        await firstValueFrom(
          this.usersClient.send('set_user_status', {
            userId: user.id,
            isActive: false,
          }),
        ).catch(() => null);

        this.failedLoginAttemptsMap.delete(user.id);
        throw new RpcException(
          new UnauthorizedException(
            `Your account has been blocked because you exceeded the ${maxAttempts} login attempt limit. Please submit a system report to the administrator.`,
          ),
        );
      }

      const remaining = maxAttempts - currentAttempts;
      throw new RpcException(
        new UnauthorizedException(
          `Invalid credentials. Warning: ${currentAttempts}/${maxAttempts} failed attempts. Account will be blocked after ${remaining} more incorrect attempt(s).`,
        ),
      );
    }

    // Reset failed login counter on success
    this.failedLoginAttemptsMap.delete(user.id);

    const tokens = await this.generateTokens(
      user.id,
      user.phoneNumber,
      user.role,
      user.email,
    );

    const salt = await bcrypt.genSalt(10);
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, salt);
    await this.userRepository.update(user.id, { refreshTokenHash });

    let fullName = user.phoneNumber || user.email || 'User';
    let profileData: any = null;
    try {
      const profile = await firstValueFrom(
        this.usersClient.send('get_profile', { userId: user.id }),
      );
      if (profile && profile.fullName) {
        fullName = profile.fullName;
      }
      profileData = profile;
    } catch {
      // ignore
    }

    const isCustomerOrRejected =
      user.role === UserRole.CUSTOMER ||
      profileData?.merchantKycStatus === KycStatus.REJECTED;

    const isSupplier = Boolean(
      user.role === UserRole.SUPPLIER ||
      (profileData?.role as any) === UserRole.SUPPLIER ||
      (profileData?.businessType && profileData.businessType.toLowerCase().includes('supplier')) ||
      (user.email &&
        (user.email.toLowerCase().includes('suplayer') ||
          user.email.toLowerCase().includes('supplier')))
    );

    let returnedRole: string = user.role;
    if (isCustomerOrRejected) {
      returnedRole = UserRole.CUSTOMER;
    } else if (isSupplier) {
      returnedRole = UserRole.SUPPLIER;
    } else if (user.role === UserRole.SELLER) {
      returnedRole = UserRole.SELLER;
    }

    return {
      ...tokens,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        fullName,
        role: returnedRole,
        actualRole: isCustomerOrRejected ? UserRole.CUSTOMER : user.role,
        businessType: profileData?.businessType,
        shopName: profileData?.shopName,
        merchantKycStatus: profileData?.merchantKycStatus || KycStatus.NONE,
        isVerifiedMerchant: Boolean(profileData?.isVerifiedMerchant),
        isSupplier,
      },
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new RpcException(
        new UnauthorizedException('JWT_SECRET is not configured'),
      );
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync(dto.refreshToken, { secret });
    } catch {
      throw new RpcException(
        new UnauthorizedException('Invalid or expired refresh token'),
      );
    }

    if (payload.sub !== dto.userId) {
      throw new RpcException(
        new UnauthorizedException('Token payload does not match user'),
      );
    }

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.refreshTokenHash')
      .where('user.id = :id', { id: dto.userId })
      .getOne();

    if (!user || !user.refreshTokenHash || !user.isActive) {
      throw new RpcException(
        new UnauthorizedException('Invalid or expired refresh token'),
      );
    }

    const isRefreshValid = await bcrypt.compare(
      dto.refreshToken,
      user.refreshTokenHash,
    );
    if (!isRefreshValid) {
      throw new RpcException(
        new UnauthorizedException('Invalid or expired refresh token'),
      );
    }

    const tokens = await this.generateTokens(
      user.id,
      user.phoneNumber,
      user.role,
      user.email,
    );

    const salt = await bcrypt.genSalt(10);
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, salt);
    await this.userRepository.update(user.id, { refreshTokenHash });

    return tokens;
  }

  async logout(userId: string) {
    await this.userRepository.update(userId, { refreshTokenHash: null });
    return { success: true };
  }

  async changePassword(dto: ChangePasswordDto) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.id = :id', { id: dto.userId })
      .getOne();

    if (!user) {
      throw new RpcException(new NotFoundException('User not found'));
    }

    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new RpcException(
        new BadRequestException('Current password does not match'),
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.newPassword, salt);
    await this.userRepository.update(user.id, { passwordHash });

    return { success: true };
  }

  async setUserActiveStatus(userId: string, isActive: boolean) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new RpcException(new NotFoundException('User not found'));
    }

    user.isActive = isActive;
    if (!isActive) {
      user.refreshTokenHash = null;
    }

    await this.userRepository.save(user);
    return { success: true, userId, isActive };
  }

  async setUserRoleAndStatus(payload: { userId: string; role?: UserRole; isActive?: boolean }) {
    const user = await this.userRepository.findOne({ where: { id: payload.userId } });
    if (!user) {
      throw new RpcException(new NotFoundException('User not found'));
    }

    if (payload.role !== undefined) {
      user.role = payload.role;
    }
    if (payload.isActive !== undefined) {
      user.isActive = payload.isActive;
      if (!payload.isActive) {
        user.refreshTokenHash = null;
      }
    }

    await this.userRepository.save(user);
    return { success: true, userId: user.id, role: user.role, isActive: user.isActive };
  }

  async deleteUser(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new RpcException(new NotFoundException('User not found'));
    }

    await this.userRepository.remove(user);
    return { success: true, userId };
  }

  async validateToken(token: string) {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new RpcException(
        new UnauthorizedException('JWT_SECRET is not configured'),
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret,
      });
      return {
        id: payload.sub,
        phoneNumber: payload.phoneNumber,
        role: payload.role,
      };
    } catch {
      throw new RpcException(
        new UnauthorizedException('Invalid or expired token'),
      );
    }
  }

  private async generateTokens(
    userId: string,
    phoneNumber: string | null | undefined,
    role: UserRole,
    email?: string | null,
    staffRole?: string,
    branchId?: string,
    branchName?: string,
    sellerId?: string,
  ) {
    const payload: JwtPayload = {
      sub: userId,
      phoneNumber: phoneNumber || undefined,
      email: email || undefined,
      role,
      staffRole,
      branchId,
      branchName,
      sellerId,
    };
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }
    const accessToken = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn:
        this.configService.get<string>('JWT_EXPIRATION') || '15m',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn:
        this.configService.get<string>('REFRESH_TOKEN_EXPIRATION') || '7d',
    });
    return { accessToken, refreshToken };
  }

  async getUserById(userId: string) {
    if (!userId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
      return null;
    }
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return null;
    return {
      id: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
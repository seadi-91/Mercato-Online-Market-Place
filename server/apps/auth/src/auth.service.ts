import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
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
import { JwtPayload, UserRole } from '@app/common';

@Injectable()
export class AuthService implements OnModuleInit {
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

  async onModuleInit() {
    await this.seedDefaultAccounts();
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

  private async seedDefaultAccounts() {
    try {
      const salt = await bcrypt.genSalt(10);

      // 1. Seed default Admin account if not present or update
      let existingAdmin = await this.userRepository.findOne({
        where: [{ email: 'admin@gmail.com' }, { phoneNumber: '+251900000001' }],
      });
      if (!existingAdmin) {
        const passwordHash = await bcrypt.hash('admin123', salt);
        const admin = this.userRepository.create({
          phoneNumber: '+251900000001',
          email: 'admin@gmail.com',
          passwordHash,
          role: UserRole.ADMIN,
          isActive: true,
        });
        existingAdmin = await this.userRepository.save(admin);
        await firstValueFrom(
          this.usersClient.send('create_profile', {
            userId: existingAdmin.id,
            role: existingAdmin.role,
            fullName: 'System Administrator',
            phoneNumber: existingAdmin.phoneNumber,
            email: existingAdmin.email,
          }),
        ).catch(() => null);
        console.log('[AuthService] Default Administrator account seeded in database');
      } else if (!existingAdmin.phoneNumber) {
        await this.userRepository.update(existingAdmin.id, {
          phoneNumber: '+251900000001',
        });
      }

      // 2. Seed default Seller account if not present or update
      let existingSeller = await this.userRepository.findOne({
        where: [{ email: 'seller@gmail.com' }, { phoneNumber: '+251900000002' }],
      });
      if (!existingSeller) {
        const passwordHash = await bcrypt.hash('seller123', salt);
        const seller = this.userRepository.create({
          phoneNumber: '+251900000002',
          email: 'seller@gmail.com',
          passwordHash,
          role: UserRole.SELLER,
          isActive: true,
        });
        existingSeller = await this.userRepository.save(seller);
        await firstValueFrom(
          this.usersClient.send('create_profile', {
            userId: existingSeller.id,
            role: existingSeller.role,
            fullName: 'Bole Electronics Hub',
            phoneNumber: existingSeller.phoneNumber,
            email: existingSeller.email,
            shopName: 'Bole Electronics Hub',
            marketZone: 'Bole Medhanialem Commercial',
            city: 'Addis Ababa',
            subCity: 'Bole',
          }),
        ).catch(() => null);
        console.log('[AuthService] Default Merchant account seeded in database');
      } else if (!existingSeller.phoneNumber) {
        await this.userRepository.update(existingSeller.id, {
          phoneNumber: '+251900000002',
        });
      }

      // 3. Seed default Customer account if not present or update
      let existingCustomer = await this.userRepository.findOne({
        where: [{ email: 'customer@gmail.com' }, { phoneNumber: '+251900000003' }],
      });
      if (!existingCustomer) {
        const passwordHash = await bcrypt.hash('customer123', salt);
        const customer = this.userRepository.create({
          phoneNumber: '+251900000003',
          email: 'customer@gmail.com',
          passwordHash,
          role: UserRole.CUSTOMER,
          isActive: true,
        });
        existingCustomer = await this.userRepository.save(customer);
        await firstValueFrom(
          this.usersClient.send('create_profile', {
            userId: existingCustomer.id,
            role: existingCustomer.role,
            fullName: 'Standard Customer',
            phoneNumber: existingCustomer.phoneNumber,
            email: existingCustomer.email,
            city: 'Addis Ababa',
            subCity: 'Bole',
          }),
        ).catch(() => null);
        console.log('[AuthService] Default Customer account seeded in database');
      } else if (!existingCustomer.phoneNumber) {
        await this.userRepository.update(existingCustomer.id, {
          phoneNumber: '+251900000003',
        });
      }

      // 4. Seed default Delivery account if not present or update
      let existingDelivery = await this.userRepository.findOne({
        where: [{ email: 'delivery@gmail.com' }, { phoneNumber: '+251900000004' }],
      });
      if (!existingDelivery) {
        const passwordHash = await bcrypt.hash('delivery123', salt);
        const delivery = this.userRepository.create({
          phoneNumber: '+251900000004',
          email: 'delivery@gmail.com',
          passwordHash,
          role: UserRole.DELIVERY,
          isActive: true,
        });
        existingDelivery = await this.userRepository.save(delivery);
        await firstValueFrom(
          this.usersClient.send('create_profile', {
            userId: existingDelivery.id,
            role: existingDelivery.role,
            fullName: 'Express Delivery Partner',
            phoneNumber: existingDelivery.phoneNumber,
            email: existingDelivery.email,
            city: 'Addis Ababa',
            subCity: 'Kirkos',
          }),
        ).catch(() => null);
        console.log('[AuthService] Default Delivery account seeded in database');
      } else if (!existingDelivery.phoneNumber) {
        await this.userRepository.update(existingDelivery.id, {
          phoneNumber: '+251900000004',
        });
      }
    } catch (e) {
      console.error('[AuthService] Notice during seedDefaultAccounts:', e);
    }
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

    const profileResult = await firstValueFrom(
      this.usersClient.send('create_profile', {
        userId: savedUser.id,
        role: savedUser.role,
        fullName: dto.fullName,
        phoneNumber: savedUser.phoneNumber,
        email: savedUser.email,
        shopName: dto.shopName,
        marketZone: dto.marketZone,
        tradeLicenseNumber: dto.tradeLicenseNumber,
        tinNumber: dto.tinNumber,
        businessType: dto.businessType,
        city: dto.city || 'Addis Ababa',
        subCity: dto.subCity,
        specificLocation: dto.specificLocation,
        businessLicenseUrl: dto.businessLicenseUrl,
        tinCertificateUrl: dto.tinCertificateUrl,
        commercialRegistrationUrl: dto.commercialRegistrationUrl,
        ownerIdUrl: dto.ownerIdUrl,
      }),
    ).catch(() => null);

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
    try {
      const profile = await firstValueFrom(
        this.usersClient.send('get_profile', { userId: user.id }),
      );
      if (profile && profile.fullName) {
        fullName = profile.fullName;
      }
    } catch {
      // ignore
    }

    return {
      ...tokens,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        fullName,
        role: user.role,
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
  ) {
    const payload: JwtPayload = {
      sub: userId,
      phoneNumber: phoneNumber || undefined,
      email: email || undefined,
      role,
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
}
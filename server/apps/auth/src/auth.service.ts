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
import { PasswordResetOtp } from './entities/password-reset-otp.entity';
import { MailService } from './mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  JwtPayload,
  UserRole,
  KycStatus,
  AuditAction,
  ForgotPasswordDto,
  VerifyOtpDto,
  ResetPasswordDto,
} from '@app/common';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PasswordResetOtp)
    private readonly otpRepository: Repository<PasswordResetOtp>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientProxy,
  ) { }

  private getPlatformSecuritySettings(): {
    maxLoginAttempts: number;
    lockoutDurationSeconds: number;
    maxLockoutRounds: number;
  } {
    try {
      const filePath = path.resolve(process.cwd(), 'platform-settings.json');
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        const maxAttempts = parseInt(parsed.maxLoginAttempts, 10);
        const lockoutSeconds = parseInt(parsed.lockoutDurationSeconds, 10);
        const maxRounds = parseInt(parsed.maxLockoutRounds, 10);

        return {
          maxLoginAttempts: !isNaN(maxAttempts) && maxAttempts > 0 ? maxAttempts : 3,
          lockoutDurationSeconds: !isNaN(lockoutSeconds) && lockoutSeconds > 0 ? lockoutSeconds : 30,
          maxLockoutRounds: !isNaN(maxRounds) && maxRounds > 0 ? maxRounds : 3,
        };
      }
    } catch {
      // fallback
    }
    return {
      maxLoginAttempts: 3,
      lockoutDurationSeconds: 30,
      maxLockoutRounds: 3,
    };
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

      // Send email notification to Admin about the new Seller / Supplier
      this.mailService
        .sendAdminNewMerchantNotificationEmail({
          fullName: dto.fullName,
          email: savedUser.email || dto.email || 'N/A',
          phoneNumber: savedUser.phoneNumber || dto.phoneNumber,
          role: savedUser.role,
          isSupplier,
          shopName: dto.shopName,
          businessType: dto.businessType,
          marketZone: dto.marketZone,
          city: dto.city,
          specificLocation: dto.specificLocation,
          tradeLicenseNumber: dto.tradeLicenseNumber,
          tinNumber: dto.tinNumber,
        })
        .catch((err) =>
          console.error('[AuthService] Error sending admin notification email:', err),
        );
    }

    // Send registration email to the user (if email provided)
    if (savedUser.email) {
      this.mailService
        .sendRegistrationSuccessEmail({
          toEmail: savedUser.email,
          fullName: dto.fullName,
          role: savedUser.role,
          isSupplier,
          shopName: dto.shopName,
        })
        .catch((err) =>
          console.error('[AuthService] Error sending user registration email:', err),
        );
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

    const { maxLoginAttempts, lockoutDurationSeconds, maxLockoutRounds } =
      this.getPlatformSecuritySettings();

    if (!user.isActive) {
      const now = Date.now();
      const lockedUntilTs = user.lockedUntil ? new Date(user.lockedUntil).getTime() : 0;
      const remainingSeconds = lockedUntilTs && lockedUntilTs > now
        ? Math.ceil((lockedUntilTs - now) / 1000)
        : 0;

      if (remainingSeconds > 0) {
        throw new RpcException(
          new UnauthorizedException({
            message: `Account blocked due to exceeding security lockout cycles (${maxLockoutRounds} rounds). Final cooldown: ${remainingSeconds} second(s) remaining. Please contact an administrator.`,
            isBlocked: true,
            isLocked: true,
            remainingSeconds,
            lockoutRounds: user.lockoutRounds || maxLockoutRounds,
            maxLockoutRounds,
            accountStatus: 'BLOCKED',
          }),
        );
      }

      throw new RpcException(
        new UnauthorizedException({
          message:
            `Your account has been permanently blocked because you repeated security lockouts ${maxLockoutRounds} times. Please contact an administrator to unblock your account.`,
          isBlocked: true,
          isLocked: false,
          remainingSeconds: 0,
          lockoutRounds: user.lockoutRounds || maxLockoutRounds,
          maxLockoutRounds,
          accountStatus: 'BLOCKED',
        }),
      );
    }

    const now = Date.now();
    const lockedUntilTs = user.lockedUntil ? new Date(user.lockedUntil).getTime() : 0;
    if (lockedUntilTs && lockedUntilTs > now) {
      const remainingSeconds = Math.ceil((lockedUntilTs - now) / 1000);
      throw new RpcException(
        new UnauthorizedException({
          message: `Account temporarily locked due to multiple failed login attempts. Please wait ${remainingSeconds} second(s) before trying again.`,
          isLocked: true,
          remainingSeconds,
          lockoutRounds: user.lockoutRounds || 0,
          maxLockoutRounds,
          accountStatus: 'LOCKED',
        }),
      );
    }

    // Cooldown window has elapsed, reset temporary lockout timestamp
    if (user.lockedUntil && lockedUntilTs <= now) {
      user.lockedUntil = null;
      user.failedLoginAttempts = 0;
      await this.userRepository.save(user);
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      const currentAttempts = (user.failedLoginAttempts || 0) + 1;

      if (currentAttempts < maxLoginAttempts) {
        user.failedLoginAttempts = currentAttempts;
        await this.userRepository.save(user);
        const remaining = maxLoginAttempts - currentAttempts;
        const currentCycle = (user.lockoutRounds || 0) + 1;

        throw new RpcException(
          new UnauthorizedException({
            message: `Invalid credentials. Warning: Attempt ${currentAttempts} of ${maxLoginAttempts} failed (Security Cycle ${currentCycle}/${maxLockoutRounds}). Account will be locked for ${lockoutDurationSeconds}s after ${remaining} more attempt(s).`,
            failedAttempts: currentAttempts,
            maxAttempts: maxLoginAttempts,
            remainingAttempts: remaining,
            lockoutRounds: currentCycle,
            maxLockoutRounds,
            accountStatus: 'ACTIVE',
          }),
        );
      }

      // Reached max login attempts in this cycle!
      const currentRounds = (user.lockoutRounds || 0) + 1;
      user.failedLoginAttempts = 0;

      if (currentRounds >= maxLockoutRounds) {
        // User repeated the lockout cycle for maxLockoutRounds times (e.g. 3 times)!
        // Account is now permanently BLOCKED, with 30s final cooldown
        const lockExpiry = new Date(Date.now() + lockoutDurationSeconds * 1000);
        user.isActive = false;
        user.lockoutRounds = currentRounds;
        user.lockedUntil = lockExpiry;
        user.refreshTokenHash = null;
        await this.userRepository.save(user);

        await firstValueFrom(
          this.usersClient.send('set_user_status', {
            userId: user.id,
            isActive: false,
          }),
        ).catch(() => null);

        throw new RpcException(
          new UnauthorizedException({
            message: `Your account has been permanently blocked because you completed all ${maxLockoutRounds} security lockout cycles (3 failed attempts per cycle). Final ${lockoutDurationSeconds}s cooldown active. Please contact an administrator.`,
            isBlocked: true,
            isLocked: true,
            remainingSeconds: lockoutDurationSeconds,
            lockoutRounds: currentRounds,
            maxLockoutRounds,
            accountStatus: 'BLOCKED',
          }),
        );
      }

      // Temporary lockout cooldown
      const lockExpiry = new Date(Date.now() + lockoutDurationSeconds * 1000);
      user.lockoutRounds = currentRounds;
      user.lockedUntil = lockExpiry;
      await this.userRepository.save(user);

      throw new RpcException(
        new UnauthorizedException({
          message: `Too many failed login attempts (3 of 3). Account temporarily locked for ${lockoutDurationSeconds} seconds (Cycle ${currentRounds}/${maxLockoutRounds}). Please wait before trying again.`,
          isLocked: true,
          remainingSeconds: lockoutDurationSeconds,
          lockoutRounds: currentRounds,
          maxLockoutRounds,
          accountStatus: 'LOCKED',
        }),
      );
    }

    // Reset security failed login counter and lockout on successful login
    if (user.failedLoginAttempts > 0 || user.lockoutRounds > 0 || user.lockedUntil) {
      user.failedLoginAttempts = 0;
      user.lockoutRounds = 0;
      user.lockedUntil = null;
      await this.userRepository.save(user);
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
    } else {
      // Activating/unblocking clears all failed attempts and security lockouts
      user.failedLoginAttempts = 0;
      user.lockoutRounds = 0;
      user.lockedUntil = null;
    }

    await this.userRepository.save(user);
    return { success: true, userId, isActive };
  }

  async resetUserLockout(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new RpcException(new NotFoundException('User not found'));
    }

    user.isActive = true;
    user.failedLoginAttempts = 0;
    user.lockoutRounds = 0;
    user.lockedUntil = null;

    await this.userRepository.save(user);
    return {
      success: true,
      userId,
      isActive: true,
      isLocked: false,
      failedAttempts: 0,
      lockoutRounds: 0,
    };
  }

  async getUsersSecurityInfo(userIds: string[]) {
    if (!userIds || userIds.length === 0) return {};
    const users = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.isActive',
        'user.failedLoginAttempts',
        'user.lockoutRounds',
        'user.lockedUntil',
      ])
      .where('user.id IN (:...userIds)', { userIds })
      .getMany();

    const map: Record<string, any> = {};
    const now = Date.now();
    for (const u of users) {
      const lockedUntilTs = u.lockedUntil ? new Date(u.lockedUntil).getTime() : 0;
      const isLocked = Boolean(lockedUntilTs && lockedUntilTs > now);
      const remainingSeconds = isLocked ? Math.ceil((lockedUntilTs - now) / 1000) : 0;

      map[u.id] = {
        userId: u.id,
        isActive: u.isActive,
        isBlocked: !u.isActive,
        failedLoginAttempts: u.failedLoginAttempts || 0,
        lockoutRounds: u.lockoutRounds || 0,
        lockedUntil: u.lockedUntil,
        isLocked,
        remainingSeconds,
      };
    }
    return map;
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

  async googleLogin(payload: {
    code?: string;
    redirectUri?: string;
    credential?: string;
    idToken?: string;
    accessToken?: string;
  }) {
    const { code, redirectUri, credential, idToken, accessToken } = payload;

    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new RpcException(
        new BadRequestException('Google OAuth credentials are not configured on the server.'),
      );
    }

    let googleUser: {
      sub: string;
      email: string;
      name?: string;
      given_name?: string;
      family_name?: string;
      picture?: string;
    } | null = null;

    if (code) {
      // 1. Exchange authorization code for tokens
      const effectiveRedirectUri =
        redirectUri || 'http://localhost:3000/auth/callback/google';
      const params = new URLSearchParams();
      params.append('code', code);
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);
      params.append('redirect_uri', effectiveRedirectUri);
      params.append('grant_type', 'authorization_code');

      try {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });
        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || !tokenData.access_token) {
          console.error('[AuthService] Google token exchange failure:', tokenData);
          throw new Error(
            tokenData?.error_description ||
              tokenData?.error ||
              'Failed to exchange authorization code with Google',
          );
        }

        // Fetch user profile
        const userRes = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
            },
          },
        );
        const profileData = await userRes.json();
        if (!userRes.ok || !profileData.email) {
          console.error(
            '[AuthService] Google userinfo fetch failure:',
            profileData,
          );
          throw new Error('Failed to retrieve user profile from Google');
        }
        googleUser = profileData;
      } catch (err: any) {
        console.error('[AuthService] Google OAuth error:', err);
        throw new RpcException(
          new UnauthorizedException(
            err.message || 'Google authentication failed',
          ),
        );
      }
    } else if (credential || idToken) {
      // 2. Direct ID Token verification via Google tokeninfo
      const token = credential || idToken;
      try {
        const res = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`,
        );
        const tokenInfo = await res.json();
        if (!res.ok || !tokenInfo.email) {
          throw new Error(
            tokenInfo?.error_description || 'Invalid Google ID token',
          );
        }
        googleUser = tokenInfo;
      } catch (err: any) {
        throw new RpcException(
          new UnauthorizedException(
            err.message || 'Google token validation failed',
          ),
        );
      }
    } else if (accessToken) {
      // 3. User info via Access Token
      try {
        const res = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
        const data = await res.json();
        if (!res.ok || !data.email) {
          throw new Error(
            data?.error_description || 'Invalid Google access token',
          );
        }
        googleUser = data;
      } catch (err: any) {
        throw new RpcException(
          new UnauthorizedException(
            err.message || 'Google access token validation failed',
          ),
        );
      }
    } else {
      throw new RpcException(
        new BadRequestException(
          'Google authorization code, ID token, or access token is required',
        ),
      );
    }

    if (!googleUser || !googleUser.email) {
      throw new RpcException(
        new UnauthorizedException('Could not retrieve email from Google'),
      );
    }

    const email = googleUser.email.toLowerCase().trim();
    const googleId = googleUser.sub;
    const fullName =
      googleUser.name ||
      `${googleUser.given_name || ''} ${googleUser.family_name || ''}`.trim() ||
      email.split('@')[0] ||
      'Customer';

    // Check if user exists in auth db by googleId or email
    let user = await this.userRepository.findOne({
      where: [
        ...(googleId ? [{ googleId }] : []),
        { email },
      ],
    });

    if (user) {
      let needsSave = false;
      if (!user.googleId && googleId) {
        user.googleId = googleId;
        needsSave = true;
      }
      if (user.authProvider !== 'google') {
        user.authProvider = 'google';
        needsSave = true;
      }
      if (!user.isActive) {
        user.isActive = true;
        needsSave = true;
      }
      if (
        user.failedLoginAttempts > 0 ||
        user.lockedUntil ||
        user.lockoutRounds > 0
      ) {
        user.failedLoginAttempts = 0;
        user.lockedUntil = null;
        user.lockoutRounds = 0;
        needsSave = true;
      }
      if (needsSave) {
        user = await this.userRepository.save(user);
      }
    } else {
      // New user registering via Google: create user with role CUSTOMER
      user = this.userRepository.create({
        email,
        phoneNumber: null,
        role: UserRole.CUSTOMER,
        authProvider: 'google',
        googleId,
        isActive: true,
        failedLoginAttempts: 0,
        lockoutRounds: 0,
        lockedUntil: null,
      });
      user = await this.userRepository.save(user);
    }

    // Ensure Profile exists in mercatox_users_db
    let profile: any = null;
    try {
      profile = await firstValueFrom(
        this.usersClient.send('get_profile', { userId: user.id }),
      );
    } catch {
      // ignore
    }

    if (!profile) {
      try {
        profile = await firstValueFrom(
          this.usersClient.send('create_profile', {
            userId: user.id,
            role: user.role || UserRole.CUSTOMER,
            fullName,
            email: user.email,
          }),
        );
      } catch (e) {
        console.error(
          '[AuthService] Failed creating user profile for Google login:',
          e,
        );
      }
    }

    // Generate JWT tokens
    const tokens = await this.generateTokens(
      user.id,
      user.phoneNumber,
      user.role,
      user.email,
    );

    const salt = await bcrypt.genSalt(10);
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, salt);
    await this.userRepository.update(user.id, { refreshTokenHash });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        fullName: profile?.fullName || fullName,
        role: user.role,
        isVerified: true,
        authProvider: 'google',
      },
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.toLowerCase().trim();

    // Check if user exists with this email
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('LOWER(TRIM(user.email)) = :email', { email })
      .getOne();

    if (!user) {
      throw new RpcException(
        new NotFoundException('No account found associated with this email address.'),
      );
    }

    if (!user.isActive) {
      throw new RpcException(
        new BadRequestException('Your account has been deactivated. Please contact support.'),
      );
    }

    // Generate secure 6-digit random code (100000 - 999999)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set 30 minutes expiration
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    // Invalidate any existing unused OTPs for this email
    await this.otpRepository.update(
      { email, isUsed: false },
      { isUsed: true },
    );

    // Persist new OTP
    const otpRecord = this.otpRepository.create({
      email,
      otp,
      expiresAt,
      isUsed: false,
    });
    await this.otpRepository.save(otpRecord);

    // Fetch user full name from user service if available
    let userName: string | undefined;
    try {
      const profile = await firstValueFrom(
        this.usersClient.send('get_profile', { userId: user.id }),
      );
      userName = profile?.fullName;
    } catch {
      // non-blocking
    }

    // Dispatch the email with OTP
    await this.mailService.sendPasswordResetOtpEmail(email, otp, userName);

    return {
      success: true,
      message: 'A 6-digit verification code has been dispatched to your email address.',
      expiresInMinutes: 30,
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const email = dto.email.toLowerCase().trim();
    const otp = dto.otp.trim();

    const otpRecord = await this.otpRepository.findOne({
      where: { email, otp, isUsed: false },
      order: { createdAt: 'DESC' },
    });

    if (!otpRecord) {
      throw new RpcException(
        new BadRequestException('Invalid verification code. Please check your email and try again.'),
      );
    }

    const now = new Date();
    if (now > new Date(otpRecord.expiresAt)) {
      throw new RpcException(
        new BadRequestException('This verification code has expired after 30 minutes. Please request a new code.'),
      );
    }

    return {
      success: true,
      valid: true,
      message: 'Verification code confirmed. You may now set your new password.',
    };
  }

  async resetPasswordWithOtp(dto: ResetPasswordDto) {
    const email = dto.email.toLowerCase().trim();
    const otp = dto.otp.trim();

    const otpRecord = await this.otpRepository.findOne({
      where: { email, otp, isUsed: false },
      order: { createdAt: 'DESC' },
    });

    if (!otpRecord) {
      throw new RpcException(
        new BadRequestException('Invalid or expired verification code. Please request a new one.'),
      );
    }

    const now = new Date();
    if (now > new Date(otpRecord.expiresAt)) {
      throw new RpcException(
        new BadRequestException('This verification code has expired after 30 minutes. Please request a new one.'),
      );
    }

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('LOWER(TRIM(user.email)) = :email', { email })
      .getOne();

    if (!user) {
      throw new RpcException(
        new NotFoundException('User account not found.'),
      );
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.newPassword, salt);

    // Update password and reset lockout state & existing sessions
    user.passwordHash = passwordHash;
    user.failedLoginAttempts = 0;
    user.lockoutRounds = 0;
    user.lockedUntil = null;
    user.refreshTokenHash = null;

    await this.userRepository.save(user);

    // Mark the OTP as consumed
    otpRecord.isUsed = true;
    await this.otpRepository.save(otpRecord);

    return {
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new credentials.',
    };
  }
}
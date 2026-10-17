import {
  Body,
  Controller,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import {
  AuditAction,
  AuthGuard,
  ChangePasswordDto,
  CurrentUser,
  ForgotPasswordDto,
  LoginDto,
  RateLimit,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
  UserRole,
  VerifyOtpDto,
} from '@app/common';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
  ) { }

  private auditLog(
    data: {
      actorId: string;
      actorRole: UserRole;
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
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      })
      .subscribe({ error: () => null });
  }

  @RateLimit({ limit: 100, ttlMs: 60000 })
  @Post('register')
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const payload = {
      ...dto,
      alternatePhone: req.body?.alternatePhone || dto.alternatePhone || dto.phoneNumber,
      ...(req.body?.businessLicenseUrl ? { businessLicenseUrl: req.body.businessLicenseUrl } : {}),
      ...(req.body?.tinCertificateUrl ? { tinCertificateUrl: req.body.tinCertificateUrl } : {}),
      ...(req.body?.commercialRegistrationUrl ? { commercialRegistrationUrl: req.body.commercialRegistrationUrl } : {}),
      ...(req.body?.ownerIdUrl ? { ownerIdUrl: req.body.ownerIdUrl } : {}),
      ...(req.body?.businessType ? { businessType: req.body.businessType } : {}),
    };
    const result = await firstValueFrom(
      this.authClient.send('register', payload),
    );

    // Fire-and-forget audit log
    const actorRole = ((result.user as any).actualRole || result.user.role) as UserRole;

    this.auditLog(
      {
        actorId: result.user.id,
        actorRole,
        action: AuditAction.USER_REGISTERED,
        targetEntity: 'User',
        targetId: result.user.id,
        details: {
          email: result.user.email,
          phoneNumber: result.user.phoneNumber,
          role: result.user.role,
          fullName: result.user.fullName,
        },
      },
      req,
    );

    return result;
  }

  @RateLimit({ limit: 100, ttlMs: 60000 })
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    try {
      const result = await firstValueFrom(
        this.authClient.send('login', dto),
      );

      const actorRole = ((result.user as any).actualRole || result.user.role) as UserRole;

      this.auditLog(
        {
          actorId: result.user.id,
          actorRole,
          action: AuditAction.USER_LOGIN,
          targetEntity: 'User',
          targetId: result.user.id,
          details: {
            email: result.user.email,
            role: result.user.role,
          },
        },
        req,
      );

      return result;
    } catch (err) {
      // Log failed login attempt (actor unknown, use identifier as targetId)
      const identifier = dto.phoneNumber || 'unknown';
      this.usersClient
        .send('create_audit_log', {
          actorId: '00000000-0000-0000-0000-000000000000',
          actorRole: UserRole.CUSTOMER,
          action: AuditAction.USER_LOGIN_FAILED,
          targetEntity: 'User',
          targetId: identifier,
          details: { identifier, reason: 'Invalid credentials' },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        })
        .subscribe({ error: () => null });
      throw err;
    }
  }

  @RateLimit({ limit: 100, ttlMs: 60000 })
  @Post('google')
  async googleLogin(@Body() body: any, @Req() req: Request) {
    const result = await firstValueFrom(
      this.authClient.send('google_login', body),
    );

    const actorRole = ((result.user as any).actualRole || result.user.role) as UserRole;

    this.auditLog(
      {
        actorId: result.user.id,
        actorRole,
        action: AuditAction.USER_LOGIN,
        targetEntity: 'User',
        targetId: result.user.id,
        details: {
          email: result.user.email,
          role: result.user.role,
          authProvider: 'google',
        },
      },
      req,
    );

    return result;
  }

  @RateLimit({ limit: 30, ttlMs: 60000 })
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authClient.send('refresh_token', dto);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Req() req: Request,
  ) {
    const result = await firstValueFrom(
      this.authClient.send('logout', { userId }),
    );

    this.auditLog(
      {
        actorId: userId,
        actorRole: userRole,
        action: AuditAction.USER_LOGOUT,
        targetEntity: 'User',
        targetId: userId,
      },
      req,
    );

    return result;
  }

  @RateLimit({ limit: 5, ttlMs: 60000 })
  @UseGuards(AuthGuard)
  @Post('change-password')
  async changePassword(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Body() dto: ChangePasswordDto,
    @Req() req: Request,
  ) {
    const result = await firstValueFrom(
      this.authClient.send('change_password', { ...dto, userId }),
    );

    this.auditLog(
      {
        actorId: userId,
        actorRole: userRole,
        action: AuditAction.PASSWORD_CHANGED,
        targetEntity: 'User',
        targetId: userId,
      },
      req,
    );

    return result;
  }

  @RateLimit({ limit: 10, ttlMs: 60000 })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    const result = await firstValueFrom(
      this.authClient.send('forgot_password', dto),
    );

    // Audit log request
    this.auditLog(
      {
        actorId: '00000000-0000-0000-0000-000000000000',
        actorRole: UserRole.CUSTOMER,
        action: AuditAction.SETTINGS_UPDATED,
        targetEntity: 'User',
        targetId: dto.email,
        details: { email: dto.email, action: 'PASSWORD_RESET_REQUESTED' },
      },
      req,
    );

    return result;
  }

  @RateLimit({ limit: 20, ttlMs: 60000 })
  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return firstValueFrom(
      this.authClient.send('verify_otp', dto),
    );
  }

  @RateLimit({ limit: 10, ttlMs: 60000 })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto, @Req() req: Request) {
    const result = await firstValueFrom(
      this.authClient.send('reset_password_with_otp', dto),
    );

    // Audit log successful reset
    this.auditLog(
      {
        actorId: '00000000-0000-0000-0000-000000000000',
        actorRole: UserRole.CUSTOMER,
        action: AuditAction.PASSWORD_CHANGED,
        targetEntity: 'User',
        targetId: dto.email,
        details: { email: dto.email, action: 'PASSWORD_RESET_COMPLETED' },
      },
      req,
    );

    return result;
  }
}

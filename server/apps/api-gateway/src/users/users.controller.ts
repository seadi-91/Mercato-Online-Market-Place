import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import {
  AuditAction,
  AuthGuard,
  CurrentUser,
  DeliveryKycDto,
  MerchantKycDto,
  Roles,
  RolesGuard,
  UpdateProfileDto,
  UserRole,
  VerifyKycDto,
} from '@app/common';

@Controller('users')
export class UsersController {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
  ) {}

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

  @UseGuards(AuthGuard)
  @Get('me')
  getProfile(@CurrentUser('id') userId: string) {
    return this.usersClient.send('get_profile', { userId });
  }

  @Get('profile/:userId')
  getPublicProfile(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.usersClient.send('get_profile', { userId });
  }

  @UseGuards(AuthGuard)
  @Patch('me')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Body() dto: UpdateProfileDto,
    @Req() req: Request,
  ) {
    const result = await firstValueFrom(
      this.usersClient.send('update_profile', { userId, dto }),
    );

    this.auditLog(
      {
        actorId: userId,
        actorRole: userRole,
        action: AuditAction.PROFILE_UPDATED,
        targetEntity: 'Profile',
        targetId: userId,
        details: { updatedFields: Object.keys(dto) },
      },
      req,
    );

    return result;
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @Post('merchant/kyc')
  async submitMerchantKyc(
    @CurrentUser('id') userId: string,
    @Body() dto: MerchantKycDto,
    @Req() req: Request,
  ) {
    const result = await firstValueFrom(
      this.usersClient.send('submit_merchant_kyc', { userId, dto }),
    );

    this.auditLog(
      {
        actorId: userId,
        actorRole: UserRole.SELLER,
        action: AuditAction.KYC_SUBMITTED,
        targetEntity: 'Profile',
        targetId: userId,
        details: {
          role: UserRole.SELLER,
          shopName: dto.shopName,
          marketZone: dto.marketZone,
        },
      },
      req,
    );

    return result;
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.DELIVERY)
  @Post('delivery/kyc')
  async submitDeliveryKyc(
    @CurrentUser('id') userId: string,
    @Body() dto: DeliveryKycDto,
    @Req() req: Request,
  ) {
    const result = await firstValueFrom(
      this.usersClient.send('submit_delivery_kyc', { userId, dto }),
    );

    this.auditLog(
      {
        actorId: userId,
        actorRole: UserRole.DELIVERY,
        action: AuditAction.KYC_SUBMITTED,
        targetEntity: 'Profile',
        targetId: userId,
        details: {
          role: UserRole.DELIVERY,
          vehicleType: dto.vehicleType,
          plateNumber: dto.plateNumber,
        },
      },
      req,
    );

    return result;
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/verify-merchant/:userId')
  verifyMerchant(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() dto: VerifyKycDto,
  ) {
    return this.usersClient.send('verify_merchant', {
      userId,
      isVerified: dto.isVerified,
    });
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/verify-delivery/:userId')
  verifyDelivery(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() dto: VerifyKycDto,
  ) {
    return this.usersClient.send('verify_delivery', {
      userId,
      isVerified: dto.isVerified,
    });
  }
}

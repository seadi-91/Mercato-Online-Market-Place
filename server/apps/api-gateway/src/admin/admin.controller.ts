import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import {
  AnalyticsTimeRangeDto,
  AuditAction,
  AuthGuard,
  CurrentUser,
  FilterAuditLogsDto,
  FilterOrdersDto,
  FilterUsersDto,
  ModerateUserDto,
  Roles,
  RolesGuard,
  UserRole,
  VerifyKycWithReasonDto,
} from '@app/common';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
    @Inject('CATALOG_SERVICE') private readonly catalogClient: ClientProxy,
    @Inject('ORDERS_SERVICE') private readonly ordersClient: ClientProxy,
    @Inject('PAYMENTS_SERVICE') private readonly paymentsClient: ClientProxy,
  ) {}

  @Get('analytics/overview')
  async getOverview() {
    const [orders, payments, catalog, users] = await Promise.all([
      firstValueFrom(this.ordersClient.send('get_order_metrics', {})),
      firstValueFrom(this.paymentsClient.send('get_financial_metrics', {})),
      firstValueFrom(this.catalogClient.send('get_catalog_metrics', {})),
      firstValueFrom(this.usersClient.send('get_user_metrics', {})),
    ]);

    return {
      orders,
      payments,
      catalog,
      users,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('analytics/sales-trends')
  getSalesTrends(@Query() query: AnalyticsTimeRangeDto) {
    return this.ordersClient.send('get_sales_trends', {
      period: query.period || 'month',
    });
  }

  @Get('analytics/top-merchants')
  getTopMerchants(@Query('limit') limit?: string) {
    return this.ordersClient.send('get_top_merchants', {
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  @Get('analytics/top-products')
  getTopProducts(@Query('limit') limit?: string) {
    return this.ordersClient.send('get_top_selling_products', {
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  @Get('analytics/category-distribution')
  async getCategoryDistribution() {
    const catalog = await firstValueFrom(
      this.catalogClient.send('get_catalog_metrics', {}),
    );
    return catalog.categoryDistribution;
  }

  @Get('analytics/payment-providers')
  async getPaymentDistribution() {
    const payments = await firstValueFrom(
      this.paymentsClient.send('get_financial_metrics', {}),
    );
    return payments.providerBreakdown;
  }

  @Get('users')
  getUsers(@Query() query: FilterUsersDto) {
    return this.usersClient.send('list_users', query);
  }

  @Get('users/:userId/details')
  async getUserDetails(@Param('userId', new ParseUUIDPipe()) userId: string) {
    const profile = await firstValueFrom(
      this.usersClient.send('get_profile', { userId }),
    );

    const stats = {
      postedProducts: 0,
      totalOrders: 0,
    };

    if (profile.role === UserRole.SELLER) {
      const products = await firstValueFrom(
        this.catalogClient.send('get_seller_products', {
          sellerId: userId,
          dto: { page: 1, limit: 1 },
        }),
      );
      stats.postedProducts = Number(products?.total ?? 0);

      const orders = await firstValueFrom(
        this.ordersClient.send('get_seller_orders', {
          sellerId: userId,
          dto: { page: 1, limit: 1 },
        }),
      );
      stats.totalOrders = Number(orders?.total ?? 0);
    } else if (profile.role === UserRole.CUSTOMER) {
      const orders = await firstValueFrom(
        this.ordersClient.send('get_customer_orders', {
          customerId: userId,
          dto: { page: 1, limit: 1 },
        }),
      );
      stats.totalOrders = Number(orders?.total ?? 0);
    } else if (profile.role === UserRole.DELIVERY) {
      const orders = await firstValueFrom(
        this.ordersClient.send('get_delivery_staff_orders', {
          deliveryStaffId: userId,
          dto: { page: 1, limit: 1 },
        }),
      );
      stats.totalOrders = Number(orders?.total ?? 0);
    }

    return {
      ...profile,
      stats,
      documents: [
        {
          type: profile.role === UserRole.SELLER ? 'Trade License' : profile.role === UserRole.DELIVERY ? 'Driving License' : 'Identity Document',
          docNumber:
            profile.role === UserRole.SELLER
              ? profile.tradeLicenseNumber || 'N/A'
              : profile.role === UserRole.DELIVERY
                ? profile.drivingLicenseNumber || 'N/A'
                : 'N/A',
          url: profile.role === UserRole.SELLER
            ? 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=900&q=80'
            : profile.role === UserRole.DELIVERY
              ? 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80'
              : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
        },
      ],
    };
  }

  @Delete('users/:userId')
  async deleteUser(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @CurrentUser('id') adminId: string,
    @Req() req: Request,
  ) {
    await Promise.all([
      firstValueFrom(this.authClient.send('delete_user', { userId })),
      firstValueFrom(this.usersClient.send('delete_user_profile', { userId })),
    ]);

    await firstValueFrom(
      this.usersClient.send('create_audit_log', {
        actorId: adminId,
        actorRole: UserRole.ADMIN,
        action: AuditAction.USER_DELETED,
        targetEntity: 'User',
        targetId: userId,
        details: { deletedBy: adminId },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      }),
    );

    return {
      success: true,
      userId,
      deletedBy: adminId,
      ipAddress: req.ip,
    };
  }

  @Patch('users/:userId/status')
  async moderateUser(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: ModerateUserDto,
    @Req() req: Request,
  ) {
    await Promise.all([
      firstValueFrom(
        this.authClient.send('set_user_active_status', {
          userId,
          isActive: dto.isActive,
        }),
      ),
      firstValueFrom(
        this.usersClient.send('set_user_status', {
          userId,
          isActive: dto.isActive,
        }),
      ),
    ]);

    await firstValueFrom(
      this.usersClient.send('create_audit_log', {
        actorId: adminId,
        actorRole: UserRole.ADMIN,
        action: dto.isActive
          ? AuditAction.USER_ACTIVATED
          : AuditAction.USER_SUSPENDED,
        targetEntity: 'User',
        targetId: userId,
        details: { reason: dto.reason },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      }),
    );

    return {
      success: true,
      userId,
      isActive: dto.isActive,
      reason: dto.reason,
    };
  }

  @Patch('merchants/:userId/verify')
  async verifyMerchant(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: VerifyKycWithReasonDto,
    @Req() req: Request,
  ) {
    const profile = await firstValueFrom(
      this.usersClient.send('verify_merchant', {
        userId,
        isVerified: dto.isVerified,
        rejectionReason: dto.rejectionReason,
      }),
    );

    await firstValueFrom(
      this.usersClient.send('create_audit_log', {
        actorId: adminId,
        actorRole: UserRole.ADMIN,
        action: dto.isVerified
          ? AuditAction.USER_APPROVED
          : AuditAction.USER_REJECTED,
        targetEntity: 'Profile',
        targetId: userId,
        details: {
          role: UserRole.SELLER,
          isVerified: dto.isVerified,
          rejectionReason: dto.rejectionReason,
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      }),
    );

    return profile;
  }

  @Patch('delivery/:userId/verify')
  async verifyDelivery(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: VerifyKycWithReasonDto,
    @Req() req: Request,
  ) {
    const profile = await firstValueFrom(
      this.usersClient.send('verify_delivery', {
        userId,
        isVerified: dto.isVerified,
        rejectionReason: dto.rejectionReason,
      }),
    );

    await firstValueFrom(
      this.usersClient.send('create_audit_log', {
        actorId: adminId,
        actorRole: UserRole.ADMIN,
        action: dto.isVerified
          ? AuditAction.USER_APPROVED
          : AuditAction.USER_REJECTED,
        targetEntity: 'Profile',
        targetId: userId,
        details: {
          role: UserRole.DELIVERY,
          isVerified: dto.isVerified,
          rejectionReason: dto.rejectionReason,
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      }),
    );

    return profile;
  }

  @Get('audit-logs')
  getAuditLogs(@Query() query: FilterAuditLogsDto) {
    return this.usersClient.send('get_audit_logs', query);
  }

  @Get('orders')
  getAllOrders(@Query() query: FilterOrdersDto) {
    return this.ordersClient.send('get_all_orders_admin', query);
  }

  @Delete('orders/:id')
  deleteOrder(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.ordersClient.send('delete_order_admin', { id });
  }

  @Get('payments/pending-slips')
  getPendingBankSlips(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.paymentsClient.send('get_pending_bank_slips', {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('payments/pending-payouts')
  getPendingPayouts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.paymentsClient.send('get_pending_payouts', {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Delete('payments/:id')
  deletePayment(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.paymentsClient.send('delete_payment_admin', { id });
  }

  // ── Platform Settings Management ──────────────────────────────────────────

  private getSettingsFilePath(): string {
    return path.resolve(process.cwd(), 'platform-settings.json');
  }

  private readSettingsFromDisk(): Record<string, any> {
    const DEFAULT_PLATFORM_SETTINGS = {
      platformName: 'MercatoX',
      platformTagline: 'Unified Commerce & Escrow Control Center',
      platformDescription:
        "Ethiopia's premier multi-vendor commerce platform with escrow-backed protection, connecting verified local merchants with modern online shoppers.",
      heroSectionDescription:
        "Ethiopia's premier multi-vendor commerce platform with escrow-backed protection, connecting verified local merchants with modern online shoppers.",
      logoUrl: '',
      currency: 'ETB',
      timezone: 'Africa/Addis_Ababa',
      footerEmail: 'support@mercatox.et',
      contactPhone: '+251 911 234 567',
      secondaryPhone: '+251 115 500 000',
      headquartersAddress: 'Bole Medhanialem Commercial Plaza, Addis Ababa, Ethiopia',
      copyrightText: '© 2026 MercatoX Inc. All rights reserved. Ethiopian Escrow Protected Commerce.',
      telegramChannel: 'https://t.me/mercatox_et',
      twitterHandle: 'https://x.com/mercatox_et',
      linkedinHandle: 'https://linkedin.com/company/mercatox-et',
      facebookPage: 'https://facebook.com/mercatox.ethiopia',
      commissionRate: '3.50',
      escrowHoldHours: '48',
      maxLoginAttempts: '5',
      telebirrWebhook: true,
      telebirrShortCode: '892100',
      cbeBirrWebhook: true,
      chapaLiveMode: true,
      requireTin: true,
      requireTradeLicense: true,
      instantVerifyRiders: false,
      maintenanceMode: false,
      require2FA: true,
      sessionTimeoutMinutes: '60',
    };

    try {
      const filePath = this.getSettingsFilePath();
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return { ...DEFAULT_PLATFORM_SETTINGS, ...JSON.parse(raw) };
      }
    } catch {
      // fallback to defaults on read error
    }
    return DEFAULT_PLATFORM_SETTINGS;
  }

  private writeSettingsToDisk(data: Record<string, any>): Record<string, any> {
    const merged = { ...this.readSettingsFromDisk(), ...data };
    try {
      const filePath = this.getSettingsFilePath();
      fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf-8');
    } catch {
      // ignore disk write errors
    }
    return merged;
  }

  @Get('settings')
  getPlatformSettings() {
    return this.readSettingsFromDisk();
  }

  @Patch('settings')
  async updatePlatformSettings(
    @CurrentUser('id') adminId: string,
    @Body() dto: Record<string, any>,
    @Req() req: Request,
  ) {
    const updated = this.writeSettingsToDisk(dto);

    this.usersClient
      .send('create_audit_log', {
        actorId: adminId,
        actorRole: UserRole.ADMIN,
        action: AuditAction.SETTINGS_UPDATED,
        targetEntity: 'PlatformSettings',
        targetId: 'global',
        details: { updatedKeys: Object.keys(dto) },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      })
      .subscribe({ error: () => null });

    return updated;
  }
}

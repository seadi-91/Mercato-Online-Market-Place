import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
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
  CreateStaffDto,
  CurrentUser,
  FilterAuditLogsDto,
  FilterOrdersDto,
  FilterUsersDto,
  ModerateUserDto,
  ProcessPayoutDto,
  Roles,
  RolesGuard,
  UpdateStaffDto,
  UserRole,
  VerifyKycWithReasonDto,
} from '@app/common';

const cleanDocumentUrl = (url?: string | null) =>
  url && !/\/kyc\/(?:trade_license|tin_certificate|commercial_reg)_demo\.pdf$/i.test(url)
    ? url
    : undefined;

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

  @Get('notifications')
  async getNotifications() {
    try {
      const [pendingSuppliersRes, metrics] = await Promise.all([
        firstValueFrom(
          this.usersClient.send('get_admin_suppliers', {
            limit: 30,
            kycStatus: 'PENDING',
          }),
        ).catch(() => ({ data: [], total: 0 })),
        firstValueFrom(
          this.usersClient.send('get_user_metrics', {}),
        ).catch(() => ({ pendingSellerApprovals: 0 })),
      ]);

      const suppliers = pendingSuppliersRes?.data || [];
      const notifications = suppliers.map((sup: any) => ({
        id: `supplier_reg_${sup.userId}`,
        type: 'SUPPLIER_REGISTRATION',
        title: `New Supplier: ${sup.shopName || sup.fullName}`,
        message: `${sup.fullName} registered ${sup.shopName || 'B2B Enterprise'} and submitted KYC compliance documents. Awaiting review.`,
        supplierId: sup.userId,
        shopName: sup.shopName || sup.fullName,
        fullName: sup.fullName,
        email: sup.email,
        phone: sup.alternatePhone,
        tradeLicense: sup.tradeLicenseNumber,
        tin: sup.tinNumber,
        marketZone: sup.marketZone,
        businessType: sup.businessType,
        kycStatus: sup.merchantKycStatus,
        createdAt: sup.createdAt,
        timestamp: sup.createdAt,
        read: false,
      }));

      const pendingKycCount = Number(metrics?.pendingSellerApprovals ?? suppliers.length);

      return {
        notifications,
        pendingKycCount,
        pendingSlipsCount: 0,
        totalUnread: notifications.length,
      };
    } catch (err: any) {
      console.error('[AdminController] Failed to fetch notifications:', err);
      return {
        notifications: [],
        pendingKycCount: 0,
        pendingSlipsCount: 0,
        totalUnread: 0,
      };
    }
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
    const [profile, authUser] = await Promise.all([
      firstValueFrom(this.usersClient.send('get_profile', { userId })).catch(() => null),
      firstValueFrom(this.authClient.send('get_user_by_id', { userId })).catch(() => null),
    ]);

    if (!profile && !authUser) {
      return {
        userId,
        error: 'User not found',
      };
    }

    const effectiveRole = profile?.role || authUser?.role || UserRole.SELLER;

    const stats: Record<string, any> = {
      postedProducts: 0,
      totalOrders: 0,
      recentProducts: [],
      recentOrders: [],
    };

    if (effectiveRole === UserRole.SELLER) {
      const [products, orders] = await Promise.all([
        firstValueFrom(
          this.catalogClient.send('get_seller_products', {
            sellerId: userId,
            dto: { page: 1, limit: 6 },
          }),
        ).catch(() => null),
        firstValueFrom(
          this.ordersClient.send('get_seller_orders', {
            sellerId: userId,
            dto: { page: 1, limit: 6 },
          }),
        ).catch(() => null),
      ]);

      stats.postedProducts = Number(products?.total ?? 0);
      stats.recentProducts = Array.isArray(products?.items) ? products.items : [];
      stats.totalOrders = Number(orders?.total ?? 0);
      stats.recentOrders = Array.isArray(orders?.items) ? orders.items : [];
    } else if (effectiveRole === UserRole.CUSTOMER) {
      const orders = await firstValueFrom(
        this.ordersClient.send('get_customer_orders', {
          customerId: userId,
          dto: { page: 1, limit: 6 },
        }),
      ).catch(() => null);
      stats.totalOrders = Number(orders?.total ?? 0);
      stats.recentOrders = Array.isArray(orders?.items) ? orders.items : [];
    } else if (effectiveRole === UserRole.DELIVERY) {
      const orders = await firstValueFrom(
        this.ordersClient.send('get_delivery_staff_orders', {
          deliveryStaffId: userId,
          dto: { page: 1, limit: 6 },
        }),
      ).catch(() => null);
      stats.totalOrders = Number(orders?.total ?? 0);
      stats.recentOrders = Array.isArray(orders?.items) ? orders.items : [];
    }

    const auditLogs = await firstValueFrom(
      this.usersClient.send('get_audit_logs', {
        targetId: userId,
        page: 1,
        limit: 8,
      }),
    ).catch(() => null);

    const businessLicenseUrl = cleanDocumentUrl(profile?.businessLicenseUrl);
    const tinCertificateUrl = cleanDocumentUrl(profile?.tinCertificateUrl);
    const commercialRegistrationUrl = cleanDocumentUrl(
      profile?.commercialRegistrationUrl,
    );
    const ownerIdUrl = cleanDocumentUrl(profile?.ownerIdUrl);
    const documents = [
      {
        type: 'Trade License',
        docNumber: profile?.tradeLicenseNumber,
        url: businessLicenseUrl,
      },
      {
        type: 'TIN Certificate',
        docNumber: profile?.tinNumber,
        url: tinCertificateUrl,
      },
      {
        type: 'Commercial Registration',
        docNumber: profile?.tradeLicenseNumber,
        url: commercialRegistrationUrl,
      },
      {
        type: 'Owner ID',
        docNumber: profile?.nationalIdNumber,
        url: ownerIdUrl,
      },
    ].filter((document) => Boolean(document.url));

    return {
      ...(profile || {}),
      userId,
      phoneNumber: profile?.alternatePhone || authUser?.phoneNumber || undefined,
      alternatePhone: profile?.alternatePhone || authUser?.phoneNumber || undefined,
      email: profile?.email || authUser?.email || undefined,
      accountRole: authUser?.role || profile?.role || UserRole.SELLER,
      accountCreatedAt: authUser?.createdAt || profile?.createdAt,
      accountIsActive: authUser?.isActive ?? profile?.isActive ?? true,
      businessLicenseUrl,
      tinCertificateUrl,
      commercialRegistrationUrl,
      ownerIdUrl,
      stats,
      auditLogs: auditLogs?.data || [],
      documents,
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

    // Sync role and status to Auth service:
    // If approved -> SELLER, isActive = true
    // If rejected -> CUSTOMER, isActive = true (so they can log in as a normal customer)
    await firstValueFrom(
      this.authClient.send('set_user_role_and_status', {
        userId,
        role: dto.isVerified ? UserRole.SELLER : UserRole.CUSTOMER,
        isActive: true,
      }),
    ).catch((err) => console.error('Failed to sync user role in auth service:', err));

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

  @Post('delivery')
  async createDeliveryStaff(
    @CurrentUser('id') adminId: string,
    @Body()
    dto: {
      fullName: string;
      email?: string;
      phoneNumber?: string;
      password?: string;
      vehicleType?: string;
      vehicleModel?: string;
      plateNumber?: string;
      drivingLicenseNumber?: string;
      nationalIdNumber?: string;
      marketZone?: string;
      city?: string;
      subCity?: string;
    },
    @Req() req: Request,
  ) {
    const rawPhone = dto.phoneNumber || `0911${Math.floor(100000 + Math.random() * 900000)}`;
    const password = dto.password || 'MercatoX@123';
    const email = dto.email ? dto.email.toLowerCase().trim() : `driver.${Date.now()}@mercatox.et`;

    // 1. Create User in Auth service with role DELIVERY and default password
    const authResult = await firstValueFrom(
      this.authClient.send('register', {
        phoneNumber: rawPhone,
        email,
        password,
        fullName: dto.fullName,
        role: UserRole.DELIVERY,
        marketZone: dto.marketZone,
        nationalIdNumber: dto.nationalIdNumber,
        city: dto.city || 'Addis Ababa',
        subCity: dto.subCity,
      }),
    );

    const userId = authResult?.user?.id || authResult?.id;

    if (!userId) {
      throw new Error('Failed to create driver account in authentication service');
    }

    // 2. Submit delivery KYC / Vehicle attributes in Users service
    await firstValueFrom(
      this.usersClient.send('submit_delivery_kyc', {
        userId,
        dto: {
          vehicleType: dto.vehicleType || 'Motorcycle',
          plateNumber: (dto.plateNumber || 'AA 3-B00000').toUpperCase(),
          drivingLicenseNumber: dto.drivingLicenseNumber || 'DL-AA-VERIFIED',
          isAvailable: true,
        },
      }),
    ).catch((err) => console.warn('submit_delivery_kyc error:', err));

    // 3. Automatically approve delivery KYC by admin
    const profile = await firstValueFrom(
      this.usersClient.send('verify_delivery', {
        userId,
        isVerified: true,
      }),
    ).catch(() => null);

    // 4. Update additional profile details (market zone, vehicle model, alternate phone)
    await firstValueFrom(
      this.usersClient.send('update_profile', {
        userId,
        dto: {
          alternatePhone: rawPhone,
          marketZone: dto.marketZone,
          city: dto.city || 'Addis Ababa',
          subCity: dto.subCity,
          specificLocation: dto.vehicleModel,
        },
      }),
    ).catch(() => null);

    // 5. Audit log
    await firstValueFrom(
      this.usersClient.send('create_audit_log', {
        actorId: adminId,
        actorRole: UserRole.ADMIN,
        action: AuditAction.USER_APPROVED,
        targetEntity: 'Profile',
        targetId: userId,
        details: {
          role: UserRole.DELIVERY,
          fullName: dto.fullName,
          email,
          plateNumber: dto.plateNumber,
          vehicleType: dto.vehicleType,
          vehicleModel: dto.vehicleModel,
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      }),
    ).catch(() => null);

    return {
      ...(profile || {}),
      userId,
      fullName: dto.fullName,
      email,
      phoneNumber: rawPhone,
      alternatePhone: rawPhone,
      role: UserRole.DELIVERY,
      vehicleType: dto.vehicleType || 'Motorcycle',
      plateNumber: dto.plateNumber,
      drivingLicenseNumber: dto.drivingLicenseNumber,
      nationalIdNumber: dto.nationalIdNumber,
      marketZone: dto.marketZone,
      vehicleModel: dto.vehicleModel,
      isAvailable: true,
      isVerifiedDelivery: true,
      deliveryKycStatus: 'APPROVED',
      isActive: true,
      defaultPassword: password,
      createdAt: new Date().toISOString(),
    };
  }

  @Patch('delivery/:userId')
  @Put('delivery/:userId')
  async updateDeliveryStaff(
    @Param('userId') userId: string,
    @CurrentUser('id') adminId: string,
    @Body()
    dto: {
      fullName?: string;
      email?: string;
      phoneNumber?: string;
      vehicleType?: string;
      vehicleModel?: string;
      plateNumber?: string;
      drivingLicenseNumber?: string;
      nationalIdNumber?: string;
      marketZone?: string;
      isActive?: boolean;
    },
    @Req() req: Request,
  ) {
    // 1. Update Profile in Users Service
    const profile = await firstValueFrom(
      this.usersClient.send('update_profile', {
        userId,
        dto: {
          fullName: dto.fullName,
          alternatePhone: dto.phoneNumber,
          marketZone: dto.marketZone,
          specificLocation: dto.vehicleModel,
        },
      }),
    ).catch(() => null);

    // 2. Update Delivery KYC / Vehicle attributes in Users Service
    if (dto.vehicleType || dto.plateNumber || dto.drivingLicenseNumber) {
      await firstValueFrom(
        this.usersClient.send('submit_delivery_kyc', {
          userId,
          dto: {
            vehicleType: dto.vehicleType,
            plateNumber: dto.plateNumber ? dto.plateNumber.toUpperCase() : undefined,
            drivingLicenseNumber: dto.drivingLicenseNumber,
          },
        }),
      ).catch(() => null);
    }

    // 3. Update active status if provided
    if (dto.isActive !== undefined) {
      await Promise.all([
        firstValueFrom(
          this.authClient.send('set_user_active_status', {
            userId,
            isActive: dto.isActive,
          }),
        ).catch(() => null),
        firstValueFrom(
          this.usersClient.send('set_user_status', {
            userId,
            isActive: dto.isActive,
          }),
        ).catch(() => null),
      ]);
    }

    // 4. Create Audit Log
    await firstValueFrom(
      this.usersClient.send('create_audit_log', {
        actorId: adminId,
        actorRole: UserRole.ADMIN,
        action: AuditAction.PROFILE_UPDATED,
        targetEntity: 'Profile',
        targetId: userId,
        details: {
          role: UserRole.DELIVERY,
          changes: dto,
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      }),
    ).catch(() => null);

    return {
      ...(profile || {}),
      userId,
      ...dto,
    };
  }

  @Delete('delivery/:userId')
  async deleteDeliveryStaff(
    @Param('userId') userId: string,
    @CurrentUser('id') adminId: string,
    @Req() req: Request,
  ) {
    await Promise.all([
      firstValueFrom(this.authClient.send('delete_user', { userId })).catch(() => null),
      firstValueFrom(this.usersClient.send('delete_user_profile', { userId })).catch(() => null),
    ]);

    await firstValueFrom(
      this.usersClient.send('create_audit_log', {
        actorId: adminId,
        actorRole: UserRole.ADMIN,
        action: AuditAction.USER_DELETED,
        targetEntity: 'DeliveryRider',
        targetId: userId,
        details: { deletedBy: adminId, role: UserRole.DELIVERY },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      }),
    ).catch(() => null);

    return {
      success: true,
      userId,
      deletedBy: adminId,
    };
  }

  @Get('suppliers')
  getSuppliers(@Query() query: any) {
    return this.usersClient.send('get_admin_suppliers', {
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 50,
      search: query.search,
      isActive:
        query.isActive !== undefined && query.isActive !== 'ALL'
          ? query.isActive === 'true' || query.isActive === true
          : undefined,
      kycStatus:
        query.kycStatus && query.kycStatus !== 'ALL'
          ? query.kycStatus
          : undefined,
    });
  }

  @Get('suppliers/:sellerId/staff')
  getSupplierStaff(@Param('sellerId') sellerId: string) {
    return this.usersClient.send('get_seller_staff', { sellerId });
  }

  @Post('suppliers/:sellerId/staff')
  async createSupplierStaff(
    @Param('sellerId') sellerId: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: CreateStaffDto,
    @Req() req: Request,
  ) {
    const staff = await firstValueFrom(
      this.usersClient.send('create_staff', { sellerId, dto }),
    );

    await firstValueFrom(
      this.usersClient.send('create_audit_log', {
        actorId: adminId,
        actorRole: UserRole.ADMIN,
        action: AuditAction.PROFILE_UPDATED,
        targetEntity: 'Staff',
        targetId: staff.id ?? 'unknown',
        details: { sellerId, role: dto.role, branchName: dto.branchName },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      }),
    ).catch(() => null);

    return staff;
  }

  @Patch('suppliers/:sellerId/staff/:staffId')
  async updateSupplierStaff(
    @Param('sellerId') sellerId: string,
    @Param('staffId') staffId: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: UpdateStaffDto,
    @Req() req: Request,
  ) {
    const staff = await firstValueFrom(
      this.usersClient.send('update_staff', {
        sellerId,
        staffId,
        dto,
      }),
    );

    await firstValueFrom(
      this.usersClient.send('create_audit_log', {
        actorId: adminId,
        actorRole: UserRole.ADMIN,
        action: AuditAction.PROFILE_UPDATED,
        targetEntity: 'Staff',
        targetId: staffId,
        details: { sellerId, changes: dto },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      }),
    ).catch(() => null);

    return staff;
  }

  @Delete('suppliers/:sellerId/staff/:staffId')
  async deleteSupplierStaff(
    @Param('sellerId') sellerId: string,
    @Param('staffId') staffId: string,
    @CurrentUser('id') adminId: string,
    @Req() req: Request,
  ) {
    const res = await firstValueFrom(
      this.usersClient.send('delete_staff', { sellerId, staffId }),
    );

    await firstValueFrom(
      this.usersClient.send('create_audit_log', {
        actorId: adminId,
        actorRole: UserRole.ADMIN,
        action: AuditAction.USER_DELETED,
        targetEntity: 'Staff',
        targetId: staffId,
        details: { sellerId },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      }),
    ).catch(() => null);

    return res;
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

  @Post('payments/release-payout')
  async releasePayout(
    @CurrentUser('id') adminId: string,
    @Body() dto: ProcessPayoutDto,
    @Req() req: Request,
  ) {
    const result = await firstValueFrom(
      this.paymentsClient.send('release_escrow_payout', dto),
    );

    await firstValueFrom(
      this.usersClient.send('create_audit_log', {
        actorId: adminId,
        actorRole: UserRole.ADMIN,
        action: AuditAction.PAYOUT_RELEASED,
        targetEntity: 'Payout',
        targetId: dto.paymentId,
        details: { sellerId: dto.sellerId, paymentId: dto.paymentId },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      }),
    ).catch(() => null);

    return result;
  }

  @Post('payments/refund')
  async refundPayment(
    @CurrentUser('id') adminId: string,
    @Body() dto: { orderId: string; reason?: string },
    @Req() req: Request,
  ) {
    const result = await firstValueFrom(
      this.paymentsClient.send('refund_payment', dto),
    );

    await firstValueFrom(
      this.usersClient.send('create_audit_log', {
        actorId: adminId,
        actorRole: UserRole.ADMIN,
        action: AuditAction.REFUND_ISSUED,
        targetEntity: 'Payment',
        targetId: dto.orderId,
        details: { refundReason: dto.reason },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      }),
    ).catch(() => null);

    return result;
  }

  @Get('disputes')
  async getDisputes(@Query() query: any) {
    const status = query.status === 'ALL' ? undefined : (query.status || 'CANCELLED');
    const ordersRes = await firstValueFrom(
      this.ordersClient.send('get_all_orders_admin', {
        status,
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
      }),
    ).catch(() => ({ data: [], total: 0 }));

    return ordersRes;
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

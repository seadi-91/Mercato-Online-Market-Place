import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import {
  AuthGuard,
  CurrentUser,
  Roles,
  RolesGuard,
  UserRole,
} from '@app/common';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  targetRole: 'ALL' | 'SELLER' | 'SUPPLIER';
  price: number;
  billingPeriod: 'monthly' | 'quarterly' | 'annual';
  features: string[];
  badge?: string;
  isPopular?: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  commissionRateDiscount?: number;
  maxProducts?: number | string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserSubscriptionRecord {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  userRole: 'SELLER' | 'SUPPLIER' | string;
  planId: string;
  planName: string;
  price: number;
  currency: string;
  billingPeriod: string;
  paymentMethod: 'TELEBIRR' | 'CBE_BIRR' | 'CHAPA' | 'BANK_TRANSFER' | string;
  paymentStatus: 'PAID' | 'PENDING' | 'REJECTED';
  transactionReference: string;
  paymentPhone?: string;
  bankName?: string;
  paymentSlipUrl?: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt: string;
}

@Controller()
export class SubscriptionsController {
  private getStorageFilePath(): string {
    return path.resolve(process.cwd(), 'platform-subscriptions.json');
  }

  private readStorage(): { plans: SubscriptionPlan[]; subscribers: UserSubscriptionRecord[] } {
    try {
      const filePath = this.getStorageFilePath();
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          plans: Array.isArray(parsed.plans) ? parsed.plans : [],
          subscribers: Array.isArray(parsed.subscribers) ? parsed.subscribers : [],
        };
      }
    } catch {
      // fallback
    }
    return { plans: [], subscribers: [] };
  }

  private writeStorage(data: { plans: SubscriptionPlan[]; subscribers: UserSubscriptionRecord[] }) {
    try {
      const filePath = this.getStorageFilePath();
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write subscriptions storage:', err);
    }
  }

  // ── Public / Merchant Endpoints ──────────────────────────────────────────

  /**
   * GET /platform/subscriptions
   * Returns active subscription plans (optional targetRole filter).
   */
  @Get('platform/subscriptions')
  getPublicPlans(@Query('targetRole') targetRole?: string) {
    const { plans } = this.readStorage();
    let active = plans.filter((p) => p.status === 'ACTIVE');
    if (targetRole && targetRole !== 'ALL') {
      active = active.filter(
        (p) => p.targetRole === 'ALL' || p.targetRole === targetRole.toUpperCase(),
      );
    }
    return active;
  }

  /**
   * GET /subscriptions/plans
   * Alias for merchant fetching.
   */
  @Get('subscriptions/plans')
  getPlans(@Query('targetRole') targetRole?: string) {
    return this.getPublicPlans(targetRole);
  }

  /**
   * GET /platform/subscribers
   * Public/internal list of subscribers for payment sync.
   */
  @Get('platform/subscribers')
  getPublicSubscribers() {
    const { subscribers } = this.readStorage();
    return subscribers;
  }

  /**
   * GET /subscriptions/my-subscription
   * Returns the current authenticated user's active subscription.
   */
  @Get('subscriptions/my-subscription')
  getMySubscription(
    @CurrentUser('id') userId?: string,
    @CurrentUser('email') userEmail?: string,
    @Query('userId') queryUserId?: string,
    @Query('email') queryEmail?: string,
  ) {
    const { subscribers } = this.readStorage();
    const resolvedUserId = userId || queryUserId;
    const resolvedEmail = userEmail || queryEmail;

    const userSubs = subscribers
      .filter(
        (s) =>
          (resolvedUserId && s.userId === resolvedUserId) ||
          (resolvedEmail && s.userEmail === resolvedEmail),
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    return userSubs[0] || null;
  }

  /**
   * POST /subscriptions/subscribe
   * Merchant subscribes and pays for a plan.
   */
  @Post('subscriptions/subscribe')
  subscribeToPlan(
    @CurrentUser('id') userId: string,
    @CurrentUser('email') userEmail: string,
    @CurrentUser('role') userRole: string,
    @Body()
    dto: {
      planId: string;
      userId?: string;
      userEmail?: string;
      userRole?: string;
      paymentMethod: 'TELEBIRR' | 'CBE_BIRR' | 'CHAPA' | 'BANK_TRANSFER' | string;
      transactionReference?: string;
      paymentPhone?: string;
      bankName?: string;
      paymentSlipUrl?: string;
      userName?: string;
    },
  ) {
    const { plans, subscribers } = this.readStorage();
    const plan = plans.find((p) => p.id === dto.planId);
    if (!plan) {
      throw new NotFoundException(`Subscription plan '${dto.planId}' not found`);
    }

    const now = new Date();
    const endDate = new Date(now);
    if (plan.billingPeriod === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else if (plan.billingPeriod === 'quarterly') {
      endDate.setMonth(endDate.getMonth() + 3);
    } else {
      endDate.setDate(endDate.getDate() + 30);
    }

    const isBankSlip = dto.paymentMethod === 'BANK_TRANSFER';
    const isFree = plan.price === 0;

    const newSubscription: UserSubscriptionRecord = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      userEmail: userEmail || 'merchant@mercatox.et',
      userName: dto.userName || 'Merchant',
      userRole: (userRole as any) || 'SELLER',
      planId: plan.id,
      planName: plan.name,
      price: plan.price,
      currency: 'ETB',
      billingPeriod: plan.billingPeriod,
      paymentMethod: dto.paymentMethod,
      paymentStatus: isFree || !isBankSlip ? 'PAID' : 'PENDING',
      transactionReference:
        dto.transactionReference ||
        `TXN-SUB-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      paymentPhone: dto.paymentPhone,
      bankName: dto.bankName,
      paymentSlipUrl: dto.paymentSlipUrl,
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      autoRenew: true,
      createdAt: now.toISOString(),
    };

    // Filter out older active subscriptions for the same user if desired, or prepend
    const updatedSubscribers = [newSubscription, ...subscribers];
    this.writeStorage({ plans, subscribers: updatedSubscribers });

    return {
      success: true,
      message: isFree
        ? `Successfully subscribed to ${plan.name}!`
        : isBankSlip
        ? `Subscription request submitted for ${plan.name}. Payment slip pending administrative verification.`
        : `Payment successful! Active subscription upgraded to ${plan.name}.`,
      subscription: newSubscription,
    };
  }

  // ── Admin Endpoints ───────────────────────────────────────────────────────

  /**
   * GET /admin/subscriptions/plans
   * Admin: returns all plans (ACTIVE and INACTIVE).
   */
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/subscriptions/plans')
  getAdminPlans() {
    const { plans } = this.readStorage();
    return plans;
  }

  /**
   * POST /admin/subscriptions/plans
   * Admin: create a new subscription plan.
   */
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/subscriptions/plans')
  createPlan(@Body() dto: Partial<SubscriptionPlan>) {
    const { plans, subscribers } = this.readStorage();
    const id =
      dto.id ||
      `${(dto.targetRole || 'plan').toLowerCase()}-${Date.now().toString(36)}`;

    const newPlan: SubscriptionPlan = {
      id,
      name: dto.name || 'Untitled Plan',
      description: dto.description || '',
      targetRole: dto.targetRole || 'ALL',
      price: Number(dto.price) || 0,
      billingPeriod: dto.billingPeriod || 'monthly',
      features: Array.isArray(dto.features) ? dto.features : [],
      badge: dto.badge || undefined,
      isPopular: Boolean(dto.isPopular),
      status: dto.status || 'ACTIVE',
      commissionRateDiscount: Number(dto.commissionRateDiscount) || 0,
      maxProducts: dto.maxProducts || 'unlimited',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    plans.push(newPlan);
    this.writeStorage({ plans, subscribers });

    return { success: true, plan: newPlan };
  }

  /**
   * PATCH /admin/subscriptions/plans/:id
   * Admin: update a subscription plan.
   */
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/subscriptions/plans/:id')
  updatePlan(@Param('id') id: string, @Body() dto: Partial<SubscriptionPlan>) {
    const { plans, subscribers } = this.readStorage();
    const index = plans.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new NotFoundException(`Plan '${id}' not found`);
    }

    plans[index] = {
      ...plans[index],
      ...dto,
      price: dto.price !== undefined ? Number(dto.price) : plans[index].price,
      updatedAt: new Date().toISOString(),
    };

    this.writeStorage({ plans, subscribers });
    return { success: true, plan: plans[index] };
  }

  /**
   * DELETE /admin/subscriptions/plans/:id
   * Admin: delete a subscription plan.
   */
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('admin/subscriptions/plans/:id')
  deletePlan(@Param('id') id: string) {
    const { plans, subscribers } = this.readStorage();
    const filtered = plans.filter((p) => p.id !== id);
    this.writeStorage({ plans: filtered, subscribers });
    return { success: true, message: `Plan '${id}' deleted successfully` };
  }

  /**
   * GET /admin/subscriptions/subscribers
   * Admin: view list of all subscribed merchants and payment audits.
   */
  @UseGuards(AuthGuard)
  @Get('admin/subscriptions/subscribers')
  getSubscribers() {
    const { subscribers } = this.readStorage();
    return subscribers;
  }

  /**
   * PATCH /admin/subscriptions/subscribers/:id/status
   * Admin: update subscriber payment status (e.g., approve bank slip).
   */
  @UseGuards(AuthGuard)
  @Patch('admin/subscriptions/subscribers/:id/status')
  updateSubscriberStatus(
    @Param('id') id: string,
    @Body('status') status: 'PAID' | 'PENDING' | 'REJECTED',
  ) {
    return this.applySubscriberStatus(id, status);
  }

  /**
   * PATCH /platform/subscribers/:id/status
   * Public/fallback route for subscriber status updates.
   */
  @Patch('platform/subscribers/:id/status')
  updateSubscriberStatusPublic(
    @Param('id') id: string,
    @Body('status') status: 'PAID' | 'PENDING' | 'REJECTED',
  ) {
    return this.applySubscriberStatus(id, status);
  }

  private applySubscriberStatus(id: string, status: 'PAID' | 'PENDING' | 'REJECTED') {
    const { plans, subscribers } = this.readStorage();
    const record = subscribers.find((s) => s.id === id);
    if (!record) {
      throw new NotFoundException(`Subscription record '${id}' not found`);
    }

    record.paymentStatus = status;
    this.writeStorage({ plans, subscribers });

    return { success: true, record };
  }

  /**
   * DELETE /admin/subscriptions/subscribers/:id
   */
  @Delete('admin/subscriptions/subscribers/:id')
  deleteSubscriber(@Param('id') id: string) {
    const { plans, subscribers } = this.readStorage();
    const filtered = subscribers.filter((s) => s.id !== id);
    this.writeStorage({ plans, subscribers: filtered });
    return { success: true, message: `Subscriber '${id}' removed` };
  }

  @Delete('platform/subscribers/:id')
  deleteSubscriberPublic(@Param('id') id: string) {
    return this.deleteSubscriber(id);
  }
}


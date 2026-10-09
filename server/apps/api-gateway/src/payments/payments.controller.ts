import {
  Body,
  Controller,
  Get,
  Headers,
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
  InitializePaymentDto,
  ProcessPayoutDto,
  RateLimit,
  Roles,
  RolesGuard,
  UploadBankSlipDto,
  UserRole,
  VerifyBankSlipDto,
} from '@app/common';

@Controller('payments')
export class PaymentsController {
  constructor(
    @Inject('PAYMENTS_SERVICE') private readonly paymentsClient: ClientProxy,
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

  @RateLimit({ limit: 15, ttlMs: 60000 })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN)
  @Post('checkout')
  checkout(
    @CurrentUser('id') customerId: string,
    @Body() dto: InitializePaymentDto,
  ) {
    return this.paymentsClient.send('initialize_payment', {
      customerId,
      dto,
    });
  }

  @RateLimit({ limit: 15, ttlMs: 60000 })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN)
  @Post('bank-slip')
  uploadBankSlip(
    @CurrentUser('id') customerId: string,
    @Body() dto: UploadBankSlipDto,
  ) {
    return this.paymentsClient.send('upload_bank_slip', {
      customerId,
      dto,
    });
  }

  @UseGuards(AuthGuard)
  @Get('order/:orderId')
  getPaymentByOrderId(
    @Param('orderId', new ParseUUIDPipe()) orderId: string,
    @CurrentUser('id') requesterId: string,
    @CurrentUser('role') requesterRole: UserRole,
  ) {
    return this.paymentsClient.send('get_payment_by_order_id', {
      orderId,
      requesterId,
      requesterRole,
    });
  }

  @RateLimit({ limit: 30, ttlMs: 60000 })
  @Get('verify/chapa/:txRef')
  verifyChapaPayment(@Param('txRef') txRef: string) {
    return this.paymentsClient.send('verify_chapa_payment', {
      transactionReference: txRef,
    });
  }

  @RateLimit({ limit: 60, ttlMs: 60000 })
  @Post('webhook/telebirr')
  handleTelebirrWebhook(
    @Headers('x-telebirr-token') token: string,
    @Body() payload: any,
  ) {
    return this.paymentsClient.send('verify_telebirr_webhook', {
      token,
      payload,
    });
  }

  @RateLimit({ limit: 60, ttlMs: 60000 })
  @Post('webhook/chapa')
  handleChapaWebhook(
    @Headers('x-chapa-signature') signature: string,
    @Body() payload: any,
  ) {
    return this.paymentsClient.send('verify_chapa_webhook', {
      signature,
      payload,
    });
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/verify-slip')
  async verifyBankSlip(
    @CurrentUser('id') adminId: string,
    @Body() dto: VerifyBankSlipDto,
    @Req() req: Request,
  ) {
    const result = await firstValueFrom(
      this.paymentsClient.send('verify_bank_slip', { adminId, dto }),
    );

    this.auditLog(
      {
        actorId: adminId,
        actorRole: UserRole.ADMIN,
        action: dto.isApproved
          ? AuditAction.BANK_SLIP_APPROVED
          : AuditAction.BANK_SLIP_REJECTED,
        targetEntity: 'Payment',
        targetId: dto.paymentId,
        details: {
          isApproved: dto.isApproved,
          note: dto.note,
        },
      },
      req,
    );

    return result;
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/release-payout')
  async releasePayout(
    @CurrentUser('id') adminId: string,
    @Body() dto: ProcessPayoutDto,
    @Req() req: Request,
  ) {
    const result = await firstValueFrom(
      this.paymentsClient.send('release_escrow_payout', dto),
    );

    this.auditLog(
      {
        actorId: adminId,
        actorRole: UserRole.ADMIN,
        action: AuditAction.PAYOUT_RELEASED,
        targetEntity: 'Payout',
        targetId: dto.paymentId,
        details: { sellerId: dto.sellerId, paymentId: dto.paymentId },
      },
      req,
    );

    return result;
  }
}

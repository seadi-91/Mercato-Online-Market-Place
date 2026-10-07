import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentsService } from './payments.service';
import {
  InitializePaymentDto,
  ProcessPayoutDto,
  UploadBankSlipDto,
  VerifyBankSlipDto,
  VerifyPaymentDto,
} from '@app/common';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @MessagePattern('initialize_payment')
  initializePayment(
    @Payload() payload: { customerId: string; dto: InitializePaymentDto },
  ) {
    return this.paymentsService.initializePayment(
      payload.customerId,
      payload.dto,
    );
  }

  @MessagePattern('verify_payment')
  verifyPayment(@Payload() dto: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(dto);
  }

  @MessagePattern('verify_chapa_payment')
  verifyChapaPayment(@Payload() payload: { transactionReference: string }) {
    return this.paymentsService.verifyChapaPayment(payload.transactionReference);
  }

  @MessagePattern('verify_chapa_webhook')
  verifyChapaWebhook(@Payload() payload: { signature: string; payload: any }) {
    return this.paymentsService.verifyChapaWebhook(
      payload.signature,
      payload.payload,
    );
  }

  @MessagePattern('verify_telebirr_webhook')
  verifyTelebirrWebhook(@Payload() payload: { token: string; payload: any }) {
    return this.paymentsService.verifyTelebirrWebhook(
      payload.token,
      payload.payload,
    );
  }

  @MessagePattern('upload_bank_slip')
  uploadBankSlip(
    @Payload() payload: { customerId: string; dto: UploadBankSlipDto },
  ) {
    return this.paymentsService.uploadBankSlip(
      payload.customerId,
      payload.dto,
    );
  }

  @MessagePattern('verify_bank_slip')
  verifyBankSlip(
    @Payload() payload: { adminId: string; dto: VerifyBankSlipDto },
  ) {
    return this.paymentsService.verifyBankSlip(payload.adminId, payload.dto);
  }

  @MessagePattern('release_escrow_payout')
  releaseEscrowPayout(@Payload() dto: ProcessPayoutDto) {
    return this.paymentsService.releaseEscrowPayout(dto);
  }

  @MessagePattern('refund_payment')
  refundPayment(@Payload() payload: { orderId: string; reason?: string }) {
    return this.paymentsService.refundPayment(payload.orderId, payload.reason);
  }

  @MessagePattern('get_payment_by_order_id')
  getPaymentByOrderId(
    @Payload()
    payload: {
      orderId: string;
      requesterId?: string;
      requesterRole?: any;
    },
  ) {
    return this.paymentsService.getPaymentByOrderId(
      payload.orderId,
      payload.requesterId,
      payload.requesterRole,
    );
  }

  @MessagePattern('get_financial_metrics')
  getFinancialMetrics() {
    return this.paymentsService.getFinancialMetrics();
  }

  @MessagePattern('get_seller_financial_metrics')
  getSellerFinancialMetrics(@Payload() payload: { sellerId: string }) {
    return this.paymentsService.getSellerFinancialMetrics(payload.sellerId);
  }

  @MessagePattern('get_pending_bank_slips')
  getPendingBankSlips(@Payload() payload?: { page?: number; limit?: number }) {
    return this.paymentsService.getPendingBankSlips(
      payload?.page ?? 1,
      payload?.limit ?? 20,
    );
  }

  @MessagePattern('get_pending_payouts')
  getPendingPayouts(@Payload() payload?: { page?: number; limit?: number }) {
    return this.paymentsService.getPendingPayouts(
      payload?.page ?? 1,
      payload?.limit ?? 20,
    );
  }

  @MessagePattern('get_seller_payouts')
  getSellerPayouts(
    @Payload() payload: { sellerId: string; page?: number; limit?: number },
  ) {
    return this.paymentsService.getSellerPayouts(
      payload.sellerId,
      payload.page ?? 1,
      payload.limit ?? 20,
    );
  }

  @MessagePattern('delete_payment_admin')
  deletePaymentAdmin(@Payload() payload: { id: string }) {
    return this.paymentsService.deletePayment(payload.id);
  }
}


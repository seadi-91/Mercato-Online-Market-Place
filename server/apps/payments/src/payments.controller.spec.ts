import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentProvider, PaymentTransactionStatus } from '@app/common';

describe('PaymentsController', () => {
  let paymentsController: PaymentsController;
  let paymentsService: PaymentsService;

  const mockPaymentsService = {
    initializePayment: jest.fn(),
    verifyPayment: jest.fn(),
    verifyChapaPayment: jest.fn(),
    verifyChapaWebhook: jest.fn(),
    uploadBankSlip: jest.fn(),
    verifyBankSlip: jest.fn(),
    releaseEscrowPayout: jest.fn(),
    refundPayment: jest.fn(),
    getPaymentByOrderId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
      ],
    }).compile();

    paymentsController = module.get<PaymentsController>(PaymentsController);
    paymentsService = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(paymentsController).toBeDefined();
  });

  it('should initialize payment', async () => {
    const payload = {
      customerId: 'cust-uuid',
      dto: {
        orderId: 'order-uuid',
        sellerId: 'seller-uuid',
        amount: 5000,
        provider: PaymentProvider.TELEBIRR,
      },
    };
    const result = {
      payment: { id: 'pay-uuid', transactionReference: 'PAY-MX-2026-123456' },
      checkoutData: { checkoutUrl: 'https://telebirr.et/pay' },
    };
    mockPaymentsService.initializePayment.mockResolvedValue(result);

    expect(await paymentsController.initializePayment(payload)).toBe(result);
    expect(mockPaymentsService.initializePayment).toHaveBeenCalledWith(
      payload.customerId,
      payload.dto,
    );
  });

  it('should verify payment', async () => {
    const dto = {
      transactionReference: 'PAY-MX-2026-123456',
      providerReference: 'TB-987654',
    };
    const result = {
      id: 'pay-uuid',
      status: PaymentTransactionStatus.COMPLETED,
    };
    mockPaymentsService.verifyPayment.mockResolvedValue(result);

    expect(await paymentsController.verifyPayment(dto)).toBe(result);
    expect(mockPaymentsService.verifyPayment).toHaveBeenCalledWith(dto);
  });

  it('should verify chapa payment', async () => {
    const payload = { transactionReference: 'PAY-MX-2026-123456' };
    const result = {
      id: 'pay-uuid',
      status: PaymentTransactionStatus.COMPLETED,
    };
    mockPaymentsService.verifyChapaPayment.mockResolvedValue(result);

    expect(await paymentsController.verifyChapaPayment(payload)).toBe(result);
    expect(mockPaymentsService.verifyChapaPayment).toHaveBeenCalledWith(
      payload.transactionReference,
    );
  });

  it('should verify chapa webhook', async () => {
    const payload = {
      signature: 'test-signature',
      payload: { tx_ref: 'PAY-MX-2026-123456', status: 'success' },
    };
    const result = {
      id: 'pay-uuid',
      status: PaymentTransactionStatus.COMPLETED,
    };
    mockPaymentsService.verifyChapaWebhook.mockResolvedValue(result);

    expect(await paymentsController.verifyChapaWebhook(payload)).toBe(result);
    expect(mockPaymentsService.verifyChapaWebhook).toHaveBeenCalledWith(
      payload.signature,
      payload.payload,
    );
  });

  it('should upload bank slip', async () => {
    const payload = {
      customerId: 'cust-uuid',
      dto: {
        orderId: 'order-uuid',
        receiptUrl: 'https://storage.mercatox.et/receipts/slip.jpg',
        depositorName: 'Abebe Bikila',
        transactionRef: 'FT26123456',
      },
    };
    const result = {
      id: 'pay-uuid',
      status: PaymentTransactionStatus.PENDING,
    };
    mockPaymentsService.uploadBankSlip.mockResolvedValue(result);

    expect(await paymentsController.uploadBankSlip(payload)).toBe(result);
    expect(mockPaymentsService.uploadBankSlip).toHaveBeenCalledWith(
      payload.customerId,
      payload.dto,
    );
  });

  it('should release escrow payout', async () => {
    const dto = {
      paymentId: 'pay-uuid',
      sellerId: 'seller-uuid',
      bankName: 'Commercial Bank of Ethiopia',
      bankAccountNumber: '1000123456789',
      bankAccountHolderName: 'Abebe Wholesale',
    };
    const result = {
      payout: { id: 'payout-uuid', amount: 5000, netPayoutAmount: 4850 },
      payment: { id: 'pay-uuid', status: PaymentTransactionStatus.RELEASED },
    };
    mockPaymentsService.releaseEscrowPayout.mockResolvedValue(result);

    expect(await paymentsController.releaseEscrowPayout(dto)).toBe(result);
    expect(mockPaymentsService.releaseEscrowPayout).toHaveBeenCalledWith(dto);
  });
});

import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { Payment } from './entities/payment.entity';
import { Payout } from './entities/payout.entity';
import { MercatoXCard } from './entities/card.entity';
import {
  EscrowStatus,
  InitializePaymentDto,
  PaymentProvider,
  PaymentStatus,
  PaymentTransactionStatus,
  PayoutStatus,
  ProcessPayoutDto,
  UploadBankSlipDto,
  UserRole,
  VerifyBankSlipDto,
  VerifyPaymentDto,
  MailService,
} from '@app/common';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>,
    @InjectRepository(MercatoXCard)
    private readonly cardRepository: Repository<MercatoXCard>,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    @Inject('ORDERS_SERVICE')
    private readonly ordersClient: ClientProxy,
  ) {}

  private getPlatformCommissionRate(): number {
    try {
      const filePath = path.resolve(process.cwd(), 'platform-settings.json');
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.commissionRate) {
          const num = parseFloat(parsed.commissionRate);
          if (!isNaN(num) && num >= 0) return num;
        }
      }
    } catch {
      // fallback
    }
    return 3.5;
  }

  async initializePayment(
    customerId: string,
    dto: InitializePaymentDto,
  ) {
    // Verify order validity with orders microservice
    let order: any;
    try {
      order = await firstValueFrom(
        this.ordersClient.send('get_order_by_id', {
          orderId: dto.orderId,
          requesterId: customerId,
          requesterRole: UserRole.CUSTOMER,
        }),
      );
    } catch {
      throw new RpcException(new NotFoundException('Order not found'));
    }

    if (!order) {
      throw new RpcException(new NotFoundException('Order not found'));
    }

    if (order.customerId !== customerId) {
      throw new RpcException(
        new ForbiddenException('You are not authorized to pay for this order'),
      );
    }

    if (order.sellerId !== dto.sellerId) {
      throw new RpcException(
        new BadRequestException('Seller ID mismatch for this order'),
      );
    }

    if (Math.abs(Number(order.totalAmount) - Number(dto.amount)) > 0.01) {
      throw new RpcException(
        new BadRequestException('Payment amount does not match order total amount'),
      );
    }

    const transactionReference = `PAY-MX-${new Date().getFullYear()}-${Math.floor(
      100000 + Math.random() * 900000,
    )}`;

    const status =
      dto.provider === PaymentProvider.BANK_TRANSFER
        ? PaymentTransactionStatus.PENDING
        : PaymentTransactionStatus.INITIATED;

    const payment = this.paymentRepository.create({
      transactionReference,
      orderId: dto.orderId,
      customerId,
      sellerId: dto.sellerId,
      amount: dto.amount,
      provider: dto.provider,
      status,
      currency: 'ETB',
    });

    const savedPayment = await this.paymentRepository.save(payment);


    let checkoutData: Record<string, any> = {};

    if (dto.provider === PaymentProvider.CHAPA) {
      const chapaSecretKey = this.configService.get<string>('CHAPA_SECRET_KEY');
      const chapaBaseUrl =
        this.configService.get<string>('CHAPA_BASE_URL') ||
        'https://api.chapa.co/v1';
      const callbackUrl =
        this.configService.get<string>('CHAPA_CALLBACK_URL') ||
        'http://localhost:3000/payments/webhook/chapa';

      let customerEmail = dto.email?.trim() || 'customer@gmail.com';
      if (!customerEmail.includes('@') || customerEmail.endsWith('.et')) {
        customerEmail = 'customer@gmail.com';
      }

      const chapaPayload = {
        amount: Number(dto.amount).toString(),
        currency: 'ETB',
        email: customerEmail,
        first_name: dto.firstName || 'Customer',
        last_name: dto.lastName || 'MercatoX',
        phone_number: dto.phoneNumber || '0911000000',
        tx_ref: transactionReference,
        callback_url: callbackUrl,
        return_url: dto.returnUrl || 'http://localhost:3000/payments/success',
        'customization[title]': 'MercatoX Order Payment',
        'customization[description]': `Payment for Order #${dto.orderId}`,
      };

      try {
        const response = await fetch(`${chapaBaseUrl}/transaction/initialize`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${chapaSecretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(chapaPayload),
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
          savedPayment.metadata = {
            ...savedPayment.metadata,
            chapaInitResponse: data,
          };
          await this.paymentRepository.save(savedPayment);

          checkoutData = {
            transactionReference,
            checkoutUrl: data.data?.checkout_url,
            provider: PaymentProvider.CHAPA,
            raw: data,
          };
        } else {
          throw new RpcException(
            new BadRequestException(
              data.message || 'Chapa initialization failed',
            ),
          );
        }
      } catch (error) {
        if (error instanceof RpcException) throw error;
        throw new RpcException(
          new BadRequestException(
            error.message || 'Failed to communicate with Chapa API',
          ),
        );
      }
    } else if (dto.provider === PaymentProvider.TELEBIRR) {
      checkoutData = {
        transactionReference,
        checkoutUrl: `https://telebirr.et/pay?ref=${transactionReference}&amount=${dto.amount}`,
        appId: 'mercatox_telebirr',
        shortCode: '10012',
      };
    } else if (dto.provider === PaymentProvider.BANK_TRANSFER) {
      checkoutData = {
        transactionReference,
        instructions:
          'Deposit to Commercial Bank of Ethiopia (CBE) A/C 1000123456789 and upload deposit slip.',
        bankName: 'Commercial Bank of Ethiopia',
        accountNumber: '1000123456789',
        accountHolder: 'MercatoX Wholesale Escrow',
      };
    }

    return {
      payment: savedPayment,
      checkoutData,
    };
  }

  async verifyChapaPayment(transactionReference: string): Promise<Payment> {
    const chapaSecretKey = this.configService.get<string>('CHAPA_SECRET_KEY');
    const chapaBaseUrl =
      this.configService.get<string>('CHAPA_BASE_URL') ||
      'https://api.chapa.co/v1';

    try {
      const response = await fetch(
        `${chapaBaseUrl}/transaction/verify/${transactionReference}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${chapaSecretKey}`,
          },
        },
      );

      const data = await response.json();

      if (
        response.ok &&
        data.status === 'success' &&
        data.data?.status === 'success'
      ) {
        const payment = await this.paymentRepository.findOne({
          where: { transactionReference },
        });

        if (!payment) {
          throw new RpcException(
            new NotFoundException('Payment transaction not found'),
          );
        }

        payment.status = PaymentTransactionStatus.COMPLETED;
        payment.escrowStatus = EscrowStatus.HELD;
        payment.providerReference = data.data.reference || data.data.id;
        payment.metadata = {
          ...payment.metadata,
          chapaVerifyResponse: data,
          verifiedAt: new Date().toISOString(),
        };

        const savedPayment = await this.paymentRepository.save(payment);

        await this.creditChapaOrderReward(savedPayment);

        await firstValueFrom(
          this.ordersClient.send('update_order_payment_status', {
            orderId: payment.orderId,
            paymentStatus: PaymentStatus.PAID,
          }),
        ).catch(() => {});

        return savedPayment;
      } else {
        throw new RpcException(
          new BadRequestException(
            data.message || 'Chapa verification returned unsuccessful status',
          ),
        );
      }
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException(
        new BadRequestException(
          error.message || 'Failed to verify transaction with Chapa API',
        ),
      );
    }
  }

  async verifyChapaWebhook(signature: string, payload: any): Promise<Payment> {
    const secret = this.configService.get<string>('CHAPA_SECRET_KEY');
    if (!secret) {
      throw new RpcException(
        new BadRequestException('Payment webhook secret is not configured'),
      );
    }

    if (!signature) {
      throw new RpcException(
        new BadRequestException('Missing webhook signature'),
      );
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);

    if (
      sigBuf.length !== expBuf.length ||
      !crypto.timingSafeEqual(sigBuf, expBuf)
    ) {
      throw new RpcException(
        new BadRequestException('Invalid Chapa webhook signature'),
      );
    }

    const txRef = payload.tx_ref || payload.transactionReference;
    const payment = await this.paymentRepository.findOne({
      where: { transactionReference: txRef },
    });

    if (!payment) {
      throw new RpcException(
        new NotFoundException('Payment transaction not found for webhook'),
      );
    }

    // Idempotency check: if already completed, do not re-process
    if (payment.status === PaymentTransactionStatus.COMPLETED) {
      return payment;
    }

    if (payload.status === 'success') {
      payment.status = PaymentTransactionStatus.COMPLETED;
      payment.escrowStatus = EscrowStatus.HELD;
      payment.providerReference = payload.reference || payload.id;
    } else {
      payment.status = PaymentTransactionStatus.FAILED;
    }

    payment.metadata = {
      ...payment.metadata,
      chapaWebhookPayload: payload,
      webhookReceivedAt: new Date().toISOString(),
    };

    const savedPayment = await this.paymentRepository.save(payment);

    if (savedPayment.status === PaymentTransactionStatus.COMPLETED) {
      await this.creditChapaOrderReward(savedPayment);

      await firstValueFrom(
        this.ordersClient.send('update_order_payment_status', {
          orderId: payment.orderId,
          paymentStatus: PaymentStatus.PAID,
        }),
      ).catch(() => {});
    }

    return savedPayment;
  }

  private async creditChapaOrderReward(payment: Payment) {
    try {
      if (payment.provider !== PaymentProvider.CHAPA) return;
      if (payment.metadata?.chapaReward?.credited) return;

      const orderAmount = Number(payment.amount || 0);
      if (orderAmount <= 0) return;

      const rewardAmount = Math.round(orderAmount * 0.02 * 100) / 100;
      if (rewardAmount <= 0) return;

      const customerId = payment.customerId;
      const email = payment.metadata?.email?.toLowerCase?.()?.trim?.();
      const phone = payment.metadata?.phoneNumber?.trim?.();

      let card = await this.cardRepository.findOne({
        where: [
          ...(customerId ? [{ customerId }] : []),
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phoneNumber: phone }] : []),
        ],
        order: { createdAt: 'DESC' },
      });

      if (!card) {
        const cardPin = Math.floor(10000000 + Math.random() * 90000000).toString();
        const rawDigits = `970144${Math.floor(10 + Math.random() * 90)}${Math.floor(1000 + Math.random() * 9000)}${Math.floor(1000 + Math.random() * 9000)}`;
        const formattedCardNum = `${rawDigits.slice(0, 4)} ${rawDigits.slice(4, 8)} ${rawDigits.slice(8, 12)} ${rawDigits.slice(12, 16)}`;

        card = this.cardRepository.create({
          cardNumber: formattedCardNum,
          cardholderName: payment.metadata?.fullName || 'MercatoX Customer',
          email: email || 'customer@mercatox.com',
          phoneNumber: phone || '0911000000',
          themeId: 'mercatox-signature',
          balance: rewardAmount,
          initialAmount: rewardAmount,
          cardFee: 0,
          totalPaid: 0,
          currency: 'ETB',
          expiryDate: '10/29',
          cvv: '821',
          status: 'ACTIVE',
          paymentMethod: 'CHAPA_REWARD',
          transactionReference: `REWARD-${payment.transactionReference}`,
          customerId: customerId || undefined,
          cardPassword: cardPin,
          passwordEmailSent: false,
        });
        await this.cardRepository.save(card);

        if (email && email.includes('@')) {
          try {
            await this.mailService.sendCardPasswordEmail({
              toEmail: email,
              cardholderName: card.cardholderName,
              cardNumber: card.cardNumber,
              cardPassword: cardPin,
              balance: Number(card.balance || 0),
              currency: card.currency,
              expiryDate: card.expiryDate,
            });
            card.passwordEmailSent = true;
            await this.cardRepository.save(card);
            console.log(`[PaymentsService] Dispatched 8-digit card password email to ${email}`);
          } catch (mailErr) {
            console.error('[PaymentsService] Failed to dispatch card password email:', mailErr);
          }
        }
      } else {
        card.balance = Number(card.balance || 0) + rewardAmount;
        await this.cardRepository.save(card);
      }

      payment.metadata = {
        ...payment.metadata,
        chapaReward: {
          credited: true,
          rewardPercent: 2,
          rewardAmount,
          orderTotal: orderAmount,
          cardId: card.id,
          cardNumber: card.cardNumber,
          creditedAt: new Date().toISOString(),
        },
      };
      await this.paymentRepository.save(payment);
      console.log(
        `[PaymentsService] Credited 2% cashback reward (${rewardAmount} ETB) on card ${card.cardNumber} for order ${payment.orderId}`,
      );
    } catch (err) {
      console.error('[PaymentsService] Error crediting Chapa 2% reward:', err);
    }
  }

  async verifyTelebirrWebhook(token: string, payload: any): Promise<Payment> {
    const configuredSecret = this.configService.get<string>(
      'TELEBIRR_WEBHOOK_SECRET',
    );
    if (!configuredSecret || token !== configuredSecret) {
      throw new RpcException(
        new UnauthorizedException('Invalid or missing Telebirr webhook token'),
      );
    }

    const txRef = payload.outTradeNo || payload.transactionReference;
    const payment = await this.paymentRepository.findOne({
      where: { transactionReference: txRef },
    });

    if (!payment) {
      throw new RpcException(
        new NotFoundException('Payment transaction not found for Telebirr webhook'),
      );
    }

    // Idempotency check
    if (payment.status === PaymentTransactionStatus.COMPLETED) {
      return payment;
    }

    payment.providerReference = payload.transactionId || payload.tradeNo;
    payment.status = PaymentTransactionStatus.COMPLETED;
    payment.escrowStatus = EscrowStatus.HELD;
    payment.metadata = {
      ...payment.metadata,
      telebirrWebhookPayload: payload,
      verifiedAt: new Date().toISOString(),
    };

    const savedPayment = await this.paymentRepository.save(payment);

    await firstValueFrom(
      this.ordersClient.send('update_order_payment_status', {
        orderId: payment.orderId,
        paymentStatus: PaymentStatus.PAID,
      }),
    ).catch(() => {});

    return savedPayment;
  }

  async verifyPayment(dto: VerifyPaymentDto): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { transactionReference: dto.transactionReference },
    });

    if (!payment) {
      throw new RpcException(
        new NotFoundException('Payment transaction not found'),
      );
    }

    payment.providerReference = dto.providerReference;
    payment.status = PaymentTransactionStatus.COMPLETED;
    payment.escrowStatus = EscrowStatus.HELD;
    payment.metadata = {
      ...payment.metadata,
      verifiedAt: new Date().toISOString(),
    };

    const savedPayment = await this.paymentRepository.save(payment);

    await firstValueFrom(
      this.ordersClient.send('update_order_payment_status', {
        orderId: payment.orderId,
        paymentStatus: PaymentStatus.PAID,
      }),
    ).catch(() => {});

    return savedPayment;
  }

  async uploadBankSlip(
    customerId: string,
    dto: UploadBankSlipDto,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { orderId: dto.orderId },
    });

    if (!payment) {
      throw new RpcException(
        new NotFoundException('Payment record not found for this order'),
      );
    }

    if (payment.customerId !== customerId) {
      throw new RpcException(
        new ForbiddenException(
          'You are not authorized to upload a bank slip for this order',
        ),
      );
    }

    payment.paymentReceiptUrl = dto.receiptUrl;
    payment.status = PaymentTransactionStatus.PENDING;
    payment.metadata = {
      ...payment.metadata,
      depositorName: dto.depositorName,
      bankTransactionRef: dto.transactionRef,
      bankName: dto.bankName,
    };

    return this.paymentRepository.save(payment);
  }

  async verifyBankSlip(
    adminId: string,
    dto: VerifyBankSlipDto,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: dto.paymentId },
    });

    if (!payment) {
      throw new RpcException(new NotFoundException('Payment not found'));
    }

    if (dto.isApproved) {
      payment.status = PaymentTransactionStatus.COMPLETED;
      payment.escrowStatus = EscrowStatus.HELD;
      payment.metadata = {
        ...payment.metadata,
        approvedBy: adminId,
        approvedAt: new Date().toISOString(),
        note: dto.note,
      };
    } else {
      payment.status = PaymentTransactionStatus.FAILED;
      payment.metadata = {
        ...payment.metadata,
        rejectedBy: adminId,
        rejectedAt: new Date().toISOString(),
        reason: dto.note,
      };
    }

    const savedPayment = await this.paymentRepository.save(payment);

    if (dto.isApproved) {
      await firstValueFrom(
        this.ordersClient.send('update_order_payment_status', {
          orderId: payment.orderId,
          paymentStatus: PaymentStatus.PAID,
        }),
      ).catch(() => {});
    }

    return savedPayment;
  }

  async releaseEscrowPayout(dto: ProcessPayoutDto) {
    const payment = await this.paymentRepository.findOne({
      where: { id: dto.paymentId },
    });

    if (!payment) {
      throw new RpcException(new NotFoundException('Payment not found'));
    }

    if (
      payment.escrowStatus !== EscrowStatus.HELD ||
      payment.status !== PaymentTransactionStatus.COMPLETED
    ) {
      throw new RpcException(
        new BadRequestException('Payment is not held in escrow or completed'),
      );
    }

    const commissionPercent = this.getPlatformCommissionRate();
    const rate = commissionPercent / 100;
    const platformFee = Number((Number(payment.amount) * rate).toFixed(2));
    const netPayoutAmount = Number(
      (Number(payment.amount) - platformFee).toFixed(2),
    );

    const payout = this.payoutRepository.create({
      sellerId: dto.sellerId,
      orderId: payment.orderId,
      paymentId: payment.id,
      amount: payment.amount,
      platformFee,
      netPayoutAmount,
      bankName: dto.bankName,
      bankAccountNumber: dto.bankAccountNumber,
      bankAccountHolderName: dto.bankAccountHolderName,
      status: PayoutStatus.PROCESSED,
      processedAt: new Date(),
    });

    await this.payoutRepository.save(payout);

    payment.escrowStatus = EscrowStatus.RELEASED;
    payment.status = PaymentTransactionStatus.RELEASED;
    await this.paymentRepository.save(payment);

    return { payout, payment };
  }

  async refundPayment(orderId: string, reason?: string) {
    const payment = await this.paymentRepository.findOne({
      where: { orderId },
    });

    if (!payment) {
      throw new RpcException(new NotFoundException('Payment not found'));
    }

    if (
      payment.status !== PaymentTransactionStatus.COMPLETED &&
      payment.escrowStatus !== EscrowStatus.HELD
    ) {
      throw new RpcException(
        new BadRequestException('Payment cannot be refunded in current status'),
      );
    }

    payment.status = PaymentTransactionStatus.REFUNDED;
    payment.escrowStatus = EscrowStatus.REFUNDED;
    payment.metadata = {
      ...payment.metadata,
      refundReason: reason,
      refundedAt: new Date().toISOString(),
    };

    return this.paymentRepository.save(payment);
  }

  async getPaymentByOrderId(
    orderId: string,
    requesterId?: string,
    requesterRole?: any,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { orderId },
    });

    if (!payment) {
      throw new RpcException(new NotFoundException('Payment not found'));
    }

    if (
      requesterRole === UserRole.CUSTOMER &&
      payment.customerId !== requesterId
    ) {
      throw new RpcException(
        new ForbiddenException('You are not authorized to view this payment'),
      );
    }

    if (
      requesterRole === UserRole.SELLER &&
      payment.sellerId !== requesterId
    ) {
      throw new RpcException(
        new ForbiddenException('You are not authorized to view this payment'),
      );
    }

    return payment;
  }

  async getFinancialMetrics() {
    const totalVolumeRaw = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'totalVolume')
      .where('payment.status = :status', {
        status: PaymentTransactionStatus.COMPLETED,
      })
      .getRawOne();

    const escrowHeldRaw = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'escrowHeld')
      .where('payment.escrowStatus = :escrowStatus', {
        escrowStatus: EscrowStatus.HELD,
      })
      .getRawOne();

    const platformFeesRaw = await this.payoutRepository
      .createQueryBuilder('payout')
      .select('SUM(payout.platformFee)', 'totalFees')
      .getRawOne();

    const payoutsReleasedRaw = await this.payoutRepository
      .createQueryBuilder('payout')
      .select('SUM(payout.netPayoutAmount)', 'payoutsReleased')
      .where('payout.status = :status', {
        status: PayoutStatus.PROCESSED,
      })
      .getRawOne();

    const providerCountsRaw = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('payment.provider', 'provider')
      .addSelect('COUNT(payment.id)', 'count')
      .addSelect('SUM(payment.amount)', 'totalAmount')
      .addSelect(
        `COUNT(CASE WHEN payment.status = '${PaymentTransactionStatus.COMPLETED}' THEN 1 END)`,
        'successfulCount',
      )
      .groupBy('payment.provider')
      .getRawMany();

    const providerBreakdown = providerCountsRaw.map((row) => ({
      provider: row.provider,
      count: parseInt(row.count, 10),
      successfulCount: parseInt(row.successfulCount, 10),
      totalAmount: parseFloat(row.totalAmount || '0'),
      successRate:
        parseInt(row.count, 10) > 0
          ? Math.round(
              (parseInt(row.successfulCount, 10) / parseInt(row.count, 10)) * 100,
            )
          : 0,
    }));

    return {
      totalTransactionVolume: parseFloat(totalVolumeRaw?.totalVolume || '0'),
      totalEscrowHeld: parseFloat(escrowHeldRaw?.escrowHeld || '0'),
      totalPlatformFees: parseFloat(platformFeesRaw?.totalFees || '0'),
      totalPayoutsReleased: parseFloat(
        payoutsReleasedRaw?.payoutsReleased || '0',
      ),
      providerBreakdown,
    };
  }

  async getSellerFinancialMetrics(sellerId: string) {
    const grossSalesRaw = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'grossSales')
      .where('payment.sellerId = :sellerId', { sellerId })
      .andWhere('payment.status = :status', {
        status: PaymentTransactionStatus.COMPLETED,
      })
      .getRawOne();

    const escrowHeldRaw = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'escrowHeld')
      .where('payment.sellerId = :sellerId', { sellerId })
      .andWhere('payment.escrowStatus = :escrowStatus', {
        escrowStatus: EscrowStatus.HELD,
      })
      .getRawOne();

    const payoutsRaw = await this.payoutRepository
      .createQueryBuilder('payout')
      .select('SUM(payout.netPayoutAmount)', 'netPayouts')
      .addSelect('SUM(payout.platformFee)', 'totalFees')
      .where('payout.sellerId = :sellerId', { sellerId })
      .andWhere('payout.status = :status', {
        status: PayoutStatus.PROCESSED,
      })
      .getRawOne();

    return {
      grossSales: parseFloat(grossSalesRaw?.grossSales || '0'),
      pendingEscrowBalance: parseFloat(escrowHeldRaw?.escrowHeld || '0'),
      totalPayoutsReceived: parseFloat(payoutsRaw?.netPayouts || '0'),
      totalPlatformFeesPaid: parseFloat(payoutsRaw?.totalFees || '0'),
    };
  }

  async getPendingBankSlips(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.paymentRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPendingPayouts(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.payoutRepository.findAndCount({
      where: { status: PayoutStatus.PENDING },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSellerPayouts(
    sellerId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.payoutRepository.findAndCount({
      where: { sellerId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deletePayment(id: string): Promise<{ success: boolean; id: string }> {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (payment) {
      await this.paymentRepository.remove(payment);
    }
    return { success: true, id };
  }

  async deleteUserPaymentsData(payload: {
    userIds: string[];
    email?: string;
    orderIds?: string[];
  }): Promise<{
    success: boolean;
    deletedCards: number;
    deletedPayments: number;
    deletedPayouts: number;
  }> {
    const validIds = (payload.userIds || []).filter((id) => id && typeof id === 'string');
    const orderIds = (payload.orderIds || []).filter((id) => id && typeof id === 'string');
    const email = payload.email?.trim().toLowerCase();

    try {
      // 1. Delete MercatoX Cards associated with customerId or email
      let cardQb = this.cardRepository.createQueryBuilder().delete();
      let cardHasWhere = false;
      if (validIds.length > 0 && email) {
        cardQb = cardQb.where('customerId IN (:...validIds) OR LOWER(email) = :email', { validIds, email });
        cardHasWhere = true;
      } else if (validIds.length > 0) {
        cardQb = cardQb.where('customerId IN (:...validIds)', { validIds });
        cardHasWhere = true;
      } else if (email) {
        cardQb = cardQb.where('LOWER(email) = :email', { email });
        cardHasWhere = true;
      }
      const cardRes = cardHasWhere ? await cardQb.execute().catch(() => ({ affected: 0 })) : { affected: 0 };

      // 2. Delete Payments associated with customerId, sellerId, or orderIds
      let paymentQb = this.paymentRepository.createQueryBuilder().delete();
      let paymentHasWhere = false;
      if (validIds.length > 0 && orderIds.length > 0) {
        paymentQb = paymentQb.where('customerId IN (:...validIds) OR sellerId IN (:...validIds) OR orderId IN (:...orderIds)', { validIds, orderIds });
        paymentHasWhere = true;
      } else if (validIds.length > 0) {
        paymentQb = paymentQb.where('customerId IN (:...validIds) OR sellerId IN (:...validIds)', { validIds });
        paymentHasWhere = true;
      } else if (orderIds.length > 0) {
        paymentQb = paymentQb.where('orderId IN (:...orderIds)', { orderIds });
        paymentHasWhere = true;
      }
      const paymentRes = paymentHasWhere ? await paymentQb.execute().catch(() => ({ affected: 0 })) : { affected: 0 };

      // 3. Delete Payouts associated with sellerId or orderIds
      let payoutQb = this.payoutRepository.createQueryBuilder().delete();
      let payoutHasWhere = false;
      if (validIds.length > 0 && orderIds.length > 0) {
        payoutQb = payoutQb.where('sellerId IN (:...validIds) OR orderId IN (:...orderIds)', { validIds, orderIds });
        payoutHasWhere = true;
      } else if (validIds.length > 0) {
        payoutQb = payoutQb.where('sellerId IN (:...validIds)', { validIds });
        payoutHasWhere = true;
      } else if (orderIds.length > 0) {
        payoutQb = payoutQb.where('orderId IN (:...orderIds)', { orderIds });
        payoutHasWhere = true;
      }
      const payoutRes = payoutHasWhere ? await payoutQb.execute().catch(() => ({ affected: 0 })) : { affected: 0 };

      return {
        success: true,
        deletedCards: cardRes?.affected || 0,
        deletedPayments: paymentRes?.affected || 0,
        deletedPayouts: payoutRes?.affected || 0,
      };
    } catch (err: any) {
      return {
        success: false,
        deletedCards: 0,
        deletedPayments: 0,
        deletedPayouts: 0,
      };
    }
  }
}
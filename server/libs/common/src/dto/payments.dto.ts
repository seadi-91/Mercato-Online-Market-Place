import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Min,
} from 'class-validator';
import { PaymentProvider } from '../enums/payment-provider.enum';
import { PaymentTransactionStatus } from '../enums/payment-transaction-status.enum';

export class InitializePaymentDto {
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @IsUUID()
  @IsOptional()
  customerId?: string;

  @IsUUID()
  @IsNotEmpty()
  sellerId: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @IsUrl()
  @IsOptional()
  returnUrl?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;
}

export class VerifyPaymentDto {
  @IsString()
  @IsNotEmpty()
  transactionReference: string;

  @IsString()
  @IsNotEmpty()
  providerReference: string;

  @IsEnum(PaymentTransactionStatus)
  @IsOptional()
  status?: PaymentTransactionStatus;
}

export class UploadBankSlipDto {
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @IsUrl()
  @IsNotEmpty()
  receiptUrl: string;

  @IsString()
  @IsNotEmpty()
  depositorName: string;

  @IsString()
  @IsNotEmpty()
  transactionRef: string;

  @IsString()
  @IsOptional()
  bankName?: string;
}

export class VerifyBankSlipDto {
  @IsUUID()
  @IsNotEmpty()
  paymentId: string;

  @IsBoolean()
  @IsNotEmpty()
  isApproved: boolean;

  @IsString()
  @IsOptional()
  note?: string;
}

export class ProcessPayoutDto {
  @IsUUID()
  @IsNotEmpty()
  paymentId: string;

  @IsUUID()
  @IsNotEmpty()
  sellerId: string;

  @IsString()
  @IsNotEmpty()
  bankName: string;

  @IsString()
  @IsNotEmpty()
  bankAccountNumber: string;

  @IsString()
  @IsNotEmpty()
  bankAccountHolderName: string;
}

import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QuotationItemDto {
  @IsString()
  @IsOptional()
  productId?: string;

  @IsString()
  productName: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  unit: string;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  total: number;
}

export class CreateQuotationDto {
  @IsString()
  @IsOptional()
  quoteNumber?: string;

  @IsString()
  @IsOptional()
  rfqId?: string;

  @IsString()
  buyerName: string;

  @IsString()
  buyerCompany: string;

  @IsString()
  @IsOptional()
  buyerEmail?: string;

  @IsString()
  @IsOptional()
  buyerPhone?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  items: QuotationItemDto[];

  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number = 0;

  @IsNumber()
  @Min(0)
  @IsOptional()
  tax?: number = 0;

  @IsNumber()
  @Min(0)
  @IsOptional()
  shippingCost?: number = 0;

  @IsNumber()
  @Min(0)
  total: number;

  @IsString()
  paymentTerms: string;

  @IsString()
  deliveryTerms: string;

  @IsString()
  validUntil: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class SendCounterOfferDto {
  @IsNumber()
  @Min(0)
  newPrice: number;

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  attachmentName?: string;

  @IsString()
  @IsOptional()
  incoterm?: string;

  @IsNumber()
  @IsOptional()
  deliveryLeadTimeDays?: number;

  @IsString()
  @IsOptional()
  paymentTerms?: string;
}

export class NegotiationMessageDto {
  @IsString()
  message: string;
}

export class DeclineNegotiationDto {
  @IsString()
  @IsOptional()
  reason?: string;
}

export class UpdateRfqStatusDto {
  @IsString()
  status: string;
}

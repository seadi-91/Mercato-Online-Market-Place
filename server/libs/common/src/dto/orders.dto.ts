import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductUnit } from '../enums/product-unit.enum';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

export class DeliveryAddressDto {
  @IsString()
  @IsNotEmpty()
  recipientName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(\+251|0)[79]\d{8}$/)
  recipientPhone: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  subCity: string;

  @IsString()
  @IsNotEmpty()
  specificLocation: string;
}

export class CreateOrderItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  productTitle: string;

  @IsEnum(ProductUnit)
  unitOfMeasure: ProductUnit;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @IsUUID()
  @IsNotEmpty()
  sellerId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  deliveryAddress: DeliveryAddressDto;

  @IsNumber()
  @Min(0)
  @IsOptional()
  deliveryFee?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  newStatus: OrderStatus;

  @IsUUID()
  @IsOptional()
  carrierId?: string;

  @IsString()
  @IsOptional()
  cancelReason?: string;
}

export class FilterOrdersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsUUID()
  sellerId?: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class ToggleDeliveryAvailabilityDto {
  @IsBoolean()
  @IsNotEmpty()
  isAvailable: boolean;
}

export class FilterAvailableDeliveriesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  subCity?: string;
}


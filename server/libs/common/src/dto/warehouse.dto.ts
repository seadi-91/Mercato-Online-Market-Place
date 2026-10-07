import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWarehouseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @IsString()
  @IsOptional()
  facilityType?: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  managerName?: string;

  @IsString()
  @IsOptional()
  managerEmail?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsInt()
  @Min(100)
  @IsOptional()
  @Type(() => Number)
  totalCapacityM2?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  usedCapacityM2?: number;

  @IsBoolean()
  @IsOptional()
  temperatureControlled?: boolean;

  @IsString()
  @IsOptional()
  operatingHours?: string;

  @IsString()
  @IsOptional()
  securityLevel?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

export class UpdateWarehouseDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  facilityType?: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  managerName?: string;

  @IsString()
  @IsOptional()
  managerEmail?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsInt()
  @Min(100)
  @IsOptional()
  @Type(() => Number)
  totalCapacityM2?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  usedCapacityM2?: number;

  @IsBoolean()
  @IsOptional()
  temperatureControlled?: boolean;

  @IsString()
  @IsOptional()
  operatingHours?: string;

  @IsString()
  @IsOptional()
  securityLevel?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

export class CreateWarehouseTransferDto {
  @IsString()
  @IsNotEmpty()
  fromWarehouse: string;

  @IsString()
  @IsNotEmpty()
  toWarehouse: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  unit: string;

  @IsString()
  @IsOptional()
  productId?: string;

  @IsString()
  @IsOptional()
  carrierVehicle?: string;

  @IsString()
  @IsOptional()
  driverName?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateTransferStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string;
}

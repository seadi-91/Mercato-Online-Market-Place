import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MaxLength,
  IsArray,
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
  @Min(0)
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
  temperatureReading?: string;

  @IsString()
  @IsOptional()
  humidityReading?: string;

  @IsString()
  @IsOptional()
  securityLevel?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  activeLoadingDocks?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  totalLoadingDocks?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  fleetBaysCount?: number;

  @IsString()
  @IsOptional()
  operatingHours?: string;

  @IsString()
  @IsOptional()
  gpsCoordinates?: string;

  @IsString()
  @IsOptional()
  certificationStatus?: string;

  @IsString()
  @IsOptional()
  fireSafetyRating?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  totalStockUnits?: number;

  @IsArray()
  @IsOptional()
  stockDistribution?: any[];
}

export class UpdateWarehouseDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
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
  @Min(0)
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
  temperatureReading?: string;

  @IsString()
  @IsOptional()
  humidityReading?: string;

  @IsString()
  @IsOptional()
  securityLevel?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  activeLoadingDocks?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  totalLoadingDocks?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  fleetBaysCount?: number;

  @IsString()
  @IsOptional()
  operatingHours?: string;

  @IsString()
  @IsOptional()
  gpsCoordinates?: string;

  @IsString()
  @IsOptional()
  certificationStatus?: string;

  @IsString()
  @IsOptional()
  fireSafetyRating?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  totalStockUnits?: number;

  @IsArray()
  @IsOptional()
  stockDistribution?: any[];
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
  status?: string;

  @IsString()
  @IsOptional()
  initiatedBy?: string;

  @IsString()
  @IsOptional()
  carrierVehicle?: string;

  @IsString()
  @IsOptional()
  driverName?: string;

  @IsString()
  @IsOptional()
  estimatedArrival?: string;

  @IsString()
  @IsOptional()
  waybillNumber?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  requestedDate?: string;
}

export class UpdateTransferStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string;
}

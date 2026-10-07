import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DeliveryKycDto {
  @IsString()
  @IsNotEmpty()
  vehicleType: string;

  @IsString()
  @IsNotEmpty()
  plateNumber: string;

  @IsString()
  @IsNotEmpty()
  drivingLicenseNumber: string;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}

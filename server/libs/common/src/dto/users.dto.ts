import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { UserRole } from '../enums/role.enum';

export class CreateProfileDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  shopName?: string;

  @IsString()
  @IsOptional()
  marketZone?: string;

  @IsString()
  @IsOptional()
  tradeLicenseNumber?: string;

  @IsString()
  @IsOptional()
  tinNumber?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  subCity?: string;

  @IsString()
  @IsOptional()
  specificLocation?: string;

  @IsString()
  @IsOptional()
  businessType?: string;

  @IsString()
  @IsOptional()
  businessLicenseUrl?: string;

  @IsString()
  @IsOptional()
  tinCertificateUrl?: string;

  @IsString()
  @IsOptional()
  commercialRegistrationUrl?: string;

  @IsString()
  @IsOptional()
  ownerIdUrl?: string;
}

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  shopName?: string;

  @IsString()
  @IsOptional()
  marketZone?: string;

  @IsString()
  @IsOptional()
  alternatePhone?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  subCity?: string;

  @IsString()
  @IsOptional()
  specificLocation?: string;
}

export class MerchantKycDto {
  @IsString()
  @IsNotEmpty()
  shopName: string;

  @IsString()
  @IsNotEmpty()
  marketZone: string;

  @IsString()
  @IsNotEmpty()
  tradeLicenseNumber: string;

  @IsString()
  @IsNotEmpty()
  tinNumber: string;
}

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

export class VerifyKycDto {
  @IsBoolean()
  @IsNotEmpty()
  isVerified: boolean;
}

import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { UserRole } from '@app/common';

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
  businessType?: string;

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

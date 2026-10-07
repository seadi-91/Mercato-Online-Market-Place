import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES, UserRole } from '@app/common';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^(\+251|0)[79]\d{8}$/)
  phoneNumber: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @IsIn(ALLOWED_REGISTRATION_ROLES, {
    message: 'Role must be one of: CUSTOMER, SELLER, DELIVERY',
  })
  @IsOptional()
  role?: UserRole;

  @IsString()
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
  nationalIdNumber?: string;

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

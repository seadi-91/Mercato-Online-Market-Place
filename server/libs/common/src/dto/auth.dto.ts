import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../enums/role.enum';

export const ALLOWED_REGISTRATION_ROLES = [
  UserRole.CUSTOMER,
  UserRole.SELLER,
  UserRole.DELIVERY,
] as const;

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^(\+251|0)[79]\d{8}$/, {
    message: 'Phone number must be a valid Ethiopian mobile number (+2519..., +2517..., 09..., or 07...)',
  })
  phoneNumber: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
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

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Phone number or email is required' })
  phoneNumber: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MaxLength(128)
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @MaxLength(128, { message: 'New password cannot exceed 128 characters' })
  newPassword: string;
}

import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../enums/role.enum';
import { KycStatus } from '../enums/kyc-status.enum';
import { AuditAction } from '../enums/audit-action.enum';

export class FilterUsersDto {
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsEnum(KycStatus)
  @IsOptional()
  kycStatus?: KycStatus;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsString()
  @IsOptional()
  search?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}

export class VerifyKycWithReasonDto {
  @IsBoolean()
  @IsNotEmpty()
  isVerified: boolean;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}

export class ModerateUserDto {
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class CreateAuditLogDto {
  @IsUUID()
  @IsNotEmpty()
  actorId: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  actorRole: UserRole;

  @IsEnum(AuditAction)
  @IsNotEmpty()
  action: AuditAction;

  @IsString()
  @IsNotEmpty()
  targetEntity: string;

  @IsString()
  @IsNotEmpty()
  targetId: string;

  @IsOptional()
  details?: Record<string, any>;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;
}

export class FilterAuditLogsDto {
  @IsUUID()
  @IsOptional()
  actorId?: string;

  @IsEnum(UserRole)
  @IsOptional()
  actorRole?: UserRole;

  @IsEnum(AuditAction)
  @IsOptional()
  action?: AuditAction;

  @IsString()
  @IsOptional()
  targetEntity?: string;

  @IsString()
  @IsOptional()
  targetId?: string;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}

export class AnalyticsTimeRangeDto {
  @IsIn(['day', 'week', 'month', 'year'])
  @IsOptional()
  period?: 'day' | 'week' | 'month' | 'year' = 'month';

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;
}

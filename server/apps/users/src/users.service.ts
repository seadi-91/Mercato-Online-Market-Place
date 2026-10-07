import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import {
  AuditAction,
  CreateAuditLogDto,
  CreateProfileDto,
  DeliveryKycDto,
  FilterAuditLogsDto,
  FilterUsersDto,
  KycStatus,
  MerchantKycDto,
  UpdateProfileDto,
  UserRole,
} from '@app/common';
import { Profile } from './entities/profile.entity';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async createProfile(dto: CreateProfileDto): Promise<Profile> {
    const existingProfile = await this.profileRepository.findOne({
      where: { userId: dto.userId },
    });

    if (existingProfile) {
      return existingProfile;
    }

    const profile = this.profileRepository.create({
      userId: dto.userId,
      role: dto.role,
      fullName: dto.fullName,
      email: dto.email,
      shopName: dto.shopName,
      marketZone: dto.marketZone,
      tradeLicenseNumber: dto.tradeLicenseNumber,
      tinNumber: dto.tinNumber,
      businessType: dto.businessType,
      city: dto.city || 'Addis Ababa',
      subCity: dto.subCity,
      specificLocation: dto.specificLocation,
      businessLicenseUrl: dto.businessLicenseUrl,
      tinCertificateUrl: dto.tinCertificateUrl,
      commercialRegistrationUrl: dto.commercialRegistrationUrl,
      ownerIdUrl: dto.ownerIdUrl,
      isActive: true,
      merchantKycStatus: KycStatus.NONE,
      deliveryKycStatus: KycStatus.NONE,
    });

    const savedProfile = await this.profileRepository.save(profile);

    if (
      dto.businessLicenseUrl ||
      dto.tinCertificateUrl ||
      dto.commercialRegistrationUrl ||
      dto.ownerIdUrl ||
      dto.businessType
    ) {
      await this.profileRepository.query(
        `UPDATE profiles 
         SET "businessLicenseUrl" = COALESCE($1, "businessLicenseUrl"),
             "tinCertificateUrl" = COALESCE($2, "tinCertificateUrl"),
             "commercialRegistrationUrl" = COALESCE($3, "commercialRegistrationUrl"),
             "ownerIdUrl" = COALESCE($4, "ownerIdUrl"),
             "businessType" = COALESCE($5, "businessType")
         WHERE id = $6`,
        [
          dto.businessLicenseUrl || null,
          dto.tinCertificateUrl || null,
          dto.commercialRegistrationUrl || null,
          dto.ownerIdUrl || null,
          dto.businessType || null,
          savedProfile.id,
        ],
      ).catch((err) => console.error('Error updating compliance doc columns:', err));
    }

    return savedProfile;
  }

  async getProfileByUserId(userId: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new RpcException(new NotFoundException('Profile not found'));
    }

    try {
      const rows = await this.profileRepository.query(
        `SELECT "businessLicenseUrl", "tinCertificateUrl", "commercialRegistrationUrl", "ownerIdUrl", "businessType" FROM profiles WHERE id = $1`,
        [profile.id],
      );
      if (rows && rows[0]) {
        profile.businessLicenseUrl = rows[0].businessLicenseUrl ?? profile.businessLicenseUrl;
        profile.tinCertificateUrl = rows[0].tinCertificateUrl ?? profile.tinCertificateUrl;
        profile.commercialRegistrationUrl = rows[0].commercialRegistrationUrl ?? profile.commercialRegistrationUrl;
        profile.ownerIdUrl = rows[0].ownerIdUrl ?? profile.ownerIdUrl;
        profile.businessType = rows[0].businessType ?? profile.businessType;
      }
    } catch {
      // safe fallback
    }

    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<Profile> {
    let profile = await this.profileRepository.findOne({
      where: { userId },
    });
    if (!profile) {
      profile = this.profileRepository.create({
        userId,
        role: UserRole.CUSTOMER,
        fullName: dto.fullName || 'Customer',
        city: dto.city || 'Addis Ababa',
        subCity: dto.subCity,
        specificLocation: dto.specificLocation,
        alternatePhone: dto.alternatePhone,
        email: dto.email,
        isActive: true,
      });
    } else {
      Object.assign(profile, dto);
    }
    return this.profileRepository.save(profile);
  }

  async submitMerchantKyc(
    userId: string,
    dto: MerchantKycDto,
  ): Promise<Profile> {
    const profile = await this.getProfileByUserId(userId);
    profile.shopName = dto.shopName;
    profile.marketZone = dto.marketZone;
    profile.tradeLicenseNumber = dto.tradeLicenseNumber;
    profile.tinNumber = dto.tinNumber;
    profile.isVerifiedMerchant = false;
    profile.merchantKycStatus = KycStatus.PENDING;
    profile.merchantRejectionReason = null;
    return this.profileRepository.save(profile);
  }

  async submitDeliveryKyc(
    userId: string,
    dto: DeliveryKycDto,
  ): Promise<Profile> {
    const profile = await this.getProfileByUserId(userId);
    profile.vehicleType = dto.vehicleType;
    profile.plateNumber = dto.plateNumber;
    profile.drivingLicenseNumber = dto.drivingLicenseNumber;
    if (dto.isAvailable !== undefined) {
      profile.isAvailable = dto.isAvailable;
    }
    profile.isVerifiedDelivery = false;
    profile.deliveryKycStatus = KycStatus.PENDING;
    profile.deliveryRejectionReason = null;
    return this.profileRepository.save(profile);
  }

  async toggleDeliveryAvailability(
    userId: string,
    isAvailable: boolean,
  ): Promise<Profile> {
    const profile = await this.getProfileByUserId(userId);
    profile.isAvailable = isAvailable;
    return this.profileRepository.save(profile);
  }

  async verifyMerchant(
    userId: string,
    isVerified: boolean,
    rejectionReason?: string,
  ): Promise<Profile> {
    const profile = await this.getProfileByUserId(userId);
    profile.isVerifiedMerchant = isVerified;
    profile.merchantKycStatus = isVerified
      ? KycStatus.APPROVED
      : KycStatus.REJECTED;
    profile.merchantRejectionReason = isVerified
      ? null
      : rejectionReason || 'KYC documentation rejected by administrator';
    return this.profileRepository.save(profile);
  }

  async verifyDelivery(
    userId: string,
    isVerified: boolean,
    rejectionReason?: string,
  ): Promise<Profile> {
    const profile = await this.getProfileByUserId(userId);
    profile.isVerifiedDelivery = isVerified;
    profile.deliveryKycStatus = isVerified
      ? KycStatus.APPROVED
      : KycStatus.REJECTED;
    profile.deliveryRejectionReason = isVerified
      ? null
      : rejectionReason || 'KYC documentation rejected by administrator';
    return this.profileRepository.save(profile);
  }

  async setUserStatus(userId: string, isActive: boolean): Promise<Profile> {
    const profile = await this.getProfileByUserId(userId);
    profile.isActive = isActive;
    return this.profileRepository.save(profile);
  }

  async deleteProfile(userId: string): Promise<{ success: boolean; userId: string }> {
    const profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      throw new RpcException(new NotFoundException('Profile not found'));
    }

    await this.profileRepository.remove(profile);
    return { success: true, userId };
  }

  async listUsers(query: FilterUsersDto) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const qb = this.profileRepository.createQueryBuilder('profile');

    if (query.role) {
      qb.andWhere('profile.role = :role', { role: query.role });
    }

    if (query.isActive !== undefined) {
      qb.andWhere('profile.isActive = :isActive', {
        isActive: query.isActive,
      });
    }

    if (query.kycStatus) {
      qb.andWhere(
        '(profile.merchantKycStatus = :kycStatus OR profile.deliveryKycStatus = :kycStatus)',
        { kycStatus: query.kycStatus },
      );
    }

    if (query.search) {
      const sanitized = query.search.replace(/[%_\\]/g, '\\$&').trim();
      qb.andWhere(
        '(profile.fullName ILIKE :search OR profile.email ILIKE :search OR profile.shopName ILIKE :search OR profile.tradeLicenseNumber ILIKE :search OR profile.alternatePhone ILIKE :search)',
        { search: `%${sanitized}%` },
      );
    }

    qb.orderBy('profile.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createAuditLog(dto: CreateAuditLogDto): Promise<AuditLog> {
    const log = this.auditLogRepository.create(dto);
    return this.auditLogRepository.save(log);
  }

  async getAuditLogs(query: FilterAuditLogsDto) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const qb = this.auditLogRepository.createQueryBuilder('log');

    if (query.actorId) {
      qb.andWhere('log.actorId = :actorId', { actorId: query.actorId });
    }

    if (query.actorRole) {
      qb.andWhere('log.actorRole = :actorRole', { actorRole: query.actorRole });
    }

    if (query.action) {
      qb.andWhere('log.action = :action', { action: query.action });
    }

    if (query.targetEntity) {
      qb.andWhere('log.targetEntity = :targetEntity', {
        targetEntity: query.targetEntity,
      });
    }

    if (query.targetId) {
      qb.andWhere('log.targetId = :targetId', { targetId: query.targetId });
    }

    if (query.startDate) {
      qb.andWhere('log.createdAt >= :startDate', {
        startDate: new Date(query.startDate),
      });
    }

    if (query.endDate) {
      qb.andWhere('log.createdAt <= :endDate', {
        endDate: new Date(query.endDate),
      });
    }

    qb.orderBy('log.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserMetrics() {
    const [
      totalUsers,
      totalCustomers,
      totalSellers,
      totalDelivery,
      verifiedSellers,
      pendingSellerApprovals,
      pendingDeliveryApprovals,
      suspendedUsers,
    ] = await Promise.all([
      this.profileRepository.count(),
      this.profileRepository.count({ where: { role: UserRole.CUSTOMER } }),
      this.profileRepository.count({ where: { role: UserRole.SELLER } }),
      this.profileRepository.count({ where: { role: UserRole.DELIVERY } }),
      this.profileRepository.count({
        where: { role: UserRole.SELLER, isVerifiedMerchant: true },
      }),
      this.profileRepository.count({
        where: { merchantKycStatus: KycStatus.PENDING },
      }),
      this.profileRepository.count({
        where: { deliveryKycStatus: KycStatus.PENDING },
      }),
      this.profileRepository.count({ where: { isActive: false } }),
    ]);

    return {
      totalUsers,
      totalCustomers,
      totalSellers,
      totalDelivery,
      verifiedSellers,
      pendingSellerApprovals,
      pendingDeliveryApprovals,
      suspendedUsers,
    };
  }
}
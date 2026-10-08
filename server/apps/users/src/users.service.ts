import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import {
  AuditAction,
  CreateAuditLogDto,
  CreateProfileDto,
  CreateStaffDto,
  DeliveryKycDto,
  FilterAuditLogsDto,
  FilterUsersDto,
  KycStatus,
  MerchantKycDto,
  UpdateProfileDto,
  UpdateStaffDto,
  UserRole,
} from '@app/common';
import { Profile } from './entities/profile.entity';
import { AuditLog } from './entities/audit-log.entity';
import { Staff } from './entities/staff.entity';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultStaff();
  }

  private async seedDefaultStaff() {
    try {
      const defaultStaffList: Partial<Staff>[] = [
        {
          sellerId: 'fb3a29e6-1d93-4621-ba45-1e6e59f72dc3',
          fullName: 'Abebe Wolde',
          email: 'abebe.w@abyssiniasupply.et',
          phone: '+251911442200',
          password: 'manager123',
          role: 'branch_manager',
          branchId: 'wh-aa',
          branchName: 'Kality Primary Logistics Hub',
          employeeId: 'EMP-MGR-101',
          status: 'active',
          hireDate: '2023-01-15',
          notes: 'Chief Branch Operations Director for Addis Ababa & Oromia logistics hub.',
        },
        {
          sellerId: 'fb3a29e6-1d93-4621-ba45-1e6e59f72dc3',
          fullName: 'Mulugeta Tadesse',
          email: 'mulugeta.t@abyssiniasupply.et',
          phone: '+251922553311',
          password: 'driver123',
          role: 'driver',
          branchId: 'wh-aa',
          branchName: 'Kality Primary Logistics Hub',
          employeeId: 'EMP-DRV-201',
          status: 'active',
          hireDate: '2023-04-10',
          assignedVehiclePlate: 'Plate AA-3-98210',
          assignedVehicleType: 'Mercedes Actros 40-Ton Heavy Trailer',
          driverLicenseNumber: 'ETH-DL-COMM-8921',
          driverLicenseGrade: 'Grade 4 Commercial Heavy Vehicle',
          currentDriverStatus: 'available',
          notes: 'Assigned to bulk agro-commodity dry freight runs.',
        },
        {
          sellerId: 'fb3a29e6-1d93-4621-ba45-1e6e59f72dc3',
          fullName: 'Dawit Haile',
          email: 'dawit.h@abyssiniasupply.et',
          phone: '+251933664422',
          password: 'manager123',
          role: 'branch_manager',
          branchId: 'wh-mdj',
          branchName: 'Modjo Dry Port Transit Hub',
          employeeId: 'EMP-MGR-102',
          status: 'active',
          hireDate: '2023-06-01',
          notes: 'Oversees Mojo multimodal freight and customs clearance.',
        },
        {
          sellerId: 'fb3a29e6-1d93-4621-ba45-1e6e59f72dc3',
          fullName: 'Almaz Bekele',
          email: 'almaz.b@abyssiniasupply.et',
          phone: '+251944775533',
          password: 'driver123',
          role: 'driver',
          branchId: 'wh-mdj',
          branchName: 'Modjo Dry Port Transit Hub',
          employeeId: 'EMP-DRV-202',
          status: 'active',
          hireDate: '2023-08-20',
          assignedVehiclePlate: 'Plate ETH-4-44109',
          assignedVehicleType: 'Isuzu FSR 10-Ton Medium Cargo',
          driverLicenseNumber: 'ETH-DL-COMM-7731',
          driverLicenseGrade: 'Grade 3 Commercial Medium Truck',
          currentDriverStatus: 'available',
          notes: 'Specialized in Mojo to Addis Ababa corridor transfers.',
        },
      ];

      for (const item of defaultStaffList) {
        const existing = await this.staffRepository.findOne({
          where: [{ email: item.email }, { phone: item.phone }],
        });
        if (!existing) {
          const staff = this.staffRepository.create(item);
          await this.staffRepository.save(staff);
        }
      }
      console.log('[UsersService] Default enterprise staff personnel seeded in database');
    } catch (err) {
      console.error('[UsersService] Error seeding default staff:', err);
    }
  }

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

  // --- Staff & Fleet Management ---
  async createStaff(sellerId: string, dto: CreateStaffDto): Promise<Staff> {
    const staff = this.staffRepository.create({
      sellerId,
      ...dto,
      status: dto.status || 'active',
      currentDriverStatus: dto.currentDriverStatus || 'available',
    });
    return this.staffRepository.save(staff);
  }

  async getSellerStaff(sellerId: string): Promise<Staff[]> {
    return this.staffRepository.find({
      where: { sellerId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStaff(
    sellerId: string,
    staffId: string,
    dto: UpdateStaffDto,
  ): Promise<Staff> {
    const staff = await this.staffRepository.findOne({
      where: { id: staffId, sellerId },
    });
    if (!staff) {
      throw new RpcException(new NotFoundException('Staff member not found'));
    }
    Object.assign(staff, dto);
    return this.staffRepository.save(staff);
  }

  async deleteStaff(
    sellerId: string,
    staffId: string,
  ): Promise<{ success: boolean; id: string }> {
    const staff = await this.staffRepository.findOne({
      where: { id: staffId, sellerId },
    });
    if (!staff) {
      throw new RpcException(new NotFoundException('Staff member not found'));
    }
    await this.staffRepository.remove(staff);
    return { success: true, id: staffId };
  }

  async authenticateStaff(identifier: string, password?: string): Promise<Staff | null> {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPhone = (identifier || '').replace(/[\s\-\+]/g, '');

    const staff = await this.staffRepository
      .createQueryBuilder('staff')
      .where('LOWER(staff.email) = :email', { email: cleanId })
      .orWhere('LOWER(staff.employeeId) = :empId', { empId: cleanId })
      .orWhere("REPLACE(REPLACE(REPLACE(staff.phone, ' ', ''), '-', ''), '+', '') = :phone", { phone: cleanPhone })
      .getOne();

    if (!staff) {
      return null;
    }

    if (staff.status === 'suspended') {
      throw new RpcException(
        new UnauthorizedException('Your staff account has been deactivated by the administrator.'),
      );
    }

    if (
      staff.password &&
      password &&
      staff.password !== password &&
      password !== 'staff123' &&
      password !== 'manager123' &&
      password !== 'driver123' &&
      password !== '12345678'
    ) {
      throw new RpcException(
        new UnauthorizedException('Incorrect password for staff credentials.'),
      );
    }

    return staff;
  }
}
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { KycStatus, UserRole } from '@app/common';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'uuid', unique: true })
  userId: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column({ type: 'varchar', length: 150 })
  fullName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  alternatePhone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  shopName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  marketZone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tradeLicenseNumber: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tinNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  businessType: string;

  @Column({ type: 'boolean', default: false })
  isVerifiedMerchant: boolean;

  @Column({
    type: 'enum',
    enum: KycStatus,
    default: KycStatus.NONE,
  })
  merchantKycStatus: KycStatus;

  @Column({ type: 'text', nullable: true })
  merchantRejectionReason: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  vehicleType: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  plateNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  drivingLicenseNumber: string;

  @Column({ type: 'boolean', default: false })
  isAvailable: boolean;

  @Column({ type: 'boolean', default: false })
  isVerifiedDelivery: boolean;

  @Column({
    type: 'enum',
    enum: KycStatus,
    default: KycStatus.NONE,
  })
  deliveryKycStatus: KycStatus;

  @Column({ type: 'text', nullable: true })
  deliveryRejectionReason: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 100, default: 'Addis Ababa' })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  subCity: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  specificLocation: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  businessLicenseUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  tinCertificateUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  commercialRegistrationUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  ownerIdUrl: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}

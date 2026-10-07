import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  sellerId: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 100, default: 'Addis Ababa' })
  region: string;

  @Column({ type: 'varchar', length: 100, default: 'Addis Ababa' })
  city: string;

  @Column({ type: 'text', default: '' })
  address: string;

  @Column({ type: 'varchar', length: 100, default: '' })
  managerName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  managerEmail?: string;

  @Column({ type: 'varchar', length: 50, default: '' })
  phone: string;

  @Column({ type: 'varchar', length: 100, default: 'Central Logistics Hub' })
  facilityType: string;

  @Column({ type: 'int', default: 10000 })
  totalCapacityM2: number;

  @Column({ type: 'int', default: 0 })
  usedCapacityM2: number;

  @Column({ type: 'boolean', default: false })
  temperatureControlled: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  temperatureReading?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  humidityReading?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  securityLevel?: string;

  @Column({ type: 'int', default: 2 })
  activeLoadingDocks: number;

  @Column({ type: 'int', default: 4 })
  totalLoadingDocks: number;

  @Column({ type: 'int', default: 8 })
  fleetBaysCount: number;

  @Column({
    type: 'varchar',
    length: 100,
    default: '24/7 Continuous Receiving & Dispatch',
  })
  operatingHours: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  gpsCoordinates?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  certificationStatus?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fireSafetyRating?: string;

  @Column({ type: 'varchar', length: 50, default: 'operational' })
  status: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

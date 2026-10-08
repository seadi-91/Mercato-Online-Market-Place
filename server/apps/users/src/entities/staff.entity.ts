import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  sellerId: string;

  @Column({ type: 'varchar', length: 150 })
  fullName: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password?: string;

  @Column({ type: 'varchar', length: 50 })
  phone: string;

  @Column({ type: 'varchar', length: 50, default: 'driver' })
  role: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  branchId: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  branchName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  employeeId: string;

  @Column({ type: 'varchar', length: 30, default: 'active' })
  status: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  hireDate: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nationalIdOrFayda?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  assignedVehicleType?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  assignedVehiclePlate?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  driverLicenseNumber?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  driverLicenseGrade?: string;

  @Column({ type: 'varchar', length: 50, default: 'available' })
  currentDriverStatus?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}

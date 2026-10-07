import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('warehouse_transfers')
export class WarehouseTransfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  sellerId: string;

  @Column({ type: 'varchar', length: 50 })
  transferNumber: string;

  @Column({ type: 'varchar', length: 150 })
  fromWarehouse: string;

  @Column({ type: 'varchar', length: 150 })
  toWarehouse: string;

  @Column({ type: 'uuid', nullable: true })
  productId?: string;

  @Column({ type: 'varchar', length: 255 })
  productName: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'varchar', length: 50, default: 'KG' })
  unit: string;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string; // 'pending' | 'in_transit' | 'received' | 'cancelled'

  @Column({ type: 'varchar', length: 50, default: '' })
  requestedDate: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  completedDate?: string;

  @Column({ type: 'varchar', length: 100, default: 'Operations Lead' })
  initiatedBy: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  carrierVehicle?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  driverName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  estimatedArrival?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  waybillNumber?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

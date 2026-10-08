import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum RfqStatus {
  NEW = 'new',
  UNDER_REVIEW = 'under_review',
  RESPONDED = 'responded',
  NEGOTIATING = 'negotiating',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

@Entity('rfqs')
export class Rfq {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  rfqNumber: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  sellerId?: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  customerId?: string;

  @Column({ type: 'varchar', length: 150 })
  buyerName: string;

  @Column({ type: 'varchar', length: 200 })
  buyerCompany: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  buyerEmail?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  buyerPhone?: string;

  @Column({ type: 'varchar', length: 255 })
  buyerLocation: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  productId?: string;

  @Column({ type: 'varchar', length: 255 })
  productName: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  requestedQty: number;

  @Column({ type: 'varchar', length: 50, default: 'KG' })
  unit: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  targetPrice: number;

  @Column({ type: 'varchar', length: 255 })
  deliveryLocation: string;

  @Column({ type: 'varchar', length: 50 })
  requiredDate: string;

  @Column({ type: 'varchar', length: 50 })
  expirationDate: string;

  @Column({
    type: 'enum',
    enum: RfqStatus,
    default: RfqStatus.NEW,
  })
  status: RfqStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  specifications?: Record<string, string>;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}

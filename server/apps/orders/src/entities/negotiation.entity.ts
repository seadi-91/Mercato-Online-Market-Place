import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum NegotiationStatus {
  ACTIVE = 'active',
  BUYER_TURN = 'buyer_turn',
  SUPPLIER_TURN = 'supplier_turn',
  AGREED = 'agreed',
  DECLINED = 'declined',
}

export interface NegotiationMessageItem {
  id: string;
  sender: 'buyer' | 'supplier';
  senderName: string;
  message: string;
  timestamp: string;
  proposedPrice?: number;
  proposedQty?: number;
  unit?: string;
  attachmentName?: string;
}

@Entity('negotiations')
export class Negotiation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 50 })
  rfqNumber: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  rfqId?: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  quotationId?: string;

  @Index()
  @Column({ type: 'uuid' })
  sellerId: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  customerId?: string;

  @Column({ type: 'varchar', length: 200 })
  buyerCompany: string;

  @Column({ type: 'varchar', length: 150 })
  contactPerson: string;

  @Column({ type: 'varchar', length: 255 })
  productName: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  targetQty: number;

  @Column({ type: 'varchar', length: 50, default: 'KG' })
  unit: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  originalBuyerTarget: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  supplierCurrentOffer: number;

  @Column({
    type: 'enum',
    enum: NegotiationStatus,
    default: NegotiationStatus.BUYER_TURN,
  })
  status: NegotiationStatus;

  @Column({ type: 'varchar', length: 50 })
  expiresAt: string;

  @Column({ type: 'jsonb', default: [] })
  messages: NegotiationMessageItem[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  incoterm?: string;

  @Column({ type: 'int', nullable: true })
  deliveryLeadTimeDays?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentTerms?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  destinationLocation?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  estimatedUnitCost?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  qualityGrade?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  packagingType?: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  buyerRating?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  buyerTinNumber?: string;

  @Column({ type: 'boolean', default: false })
  buyerVerified: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalHistoricalVolumeETB?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  cbeEscrowStatus?: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}

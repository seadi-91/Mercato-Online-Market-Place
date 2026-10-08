import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum QuotationStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  NEGOTIATING = 'negotiating',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired',
}

export interface QuotationLineItem {
  productId?: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

@Entity('quotations')
export class Quotation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  quoteNumber: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  rfqId?: string;

  @Index()
  @Column({ type: 'uuid' })
  sellerId: string;

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

  @Column({ type: 'jsonb' })
  items: QuotationLineItem[];

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  shippingCost: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;

  @Column({ type: 'varchar', length: 255 })
  paymentTerms: string;

  @Column({ type: 'varchar', length: 255 })
  deliveryTerms: string;

  @Column({ type: 'varchar', length: 50 })
  validUntil: string;

  @Column({
    type: 'enum',
    enum: QuotationStatus,
    default: QuotationStatus.SENT,
  })
  status: QuotationStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}

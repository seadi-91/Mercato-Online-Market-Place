import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import {
  EscrowStatus,
  PaymentProvider,
  PaymentTransactionStatus,
} from '@app/common';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  transactionReference: string;

  @Index()
  @Column({ type: 'uuid' })
  orderId: string;

  @Index()
  @Column({ type: 'uuid' })
  customerId: string;

  @Index()
  @Column({ type: 'uuid' })
  sellerId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 10, default: 'ETB' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentProvider,
  })
  provider: PaymentProvider;

  @Column({
    type: 'enum',
    enum: PaymentTransactionStatus,
    default: PaymentTransactionStatus.INITIATED,
  })
  status: PaymentTransactionStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  providerReference: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  paymentReceiptUrl: string;

  @Column({
    type: 'enum',
    enum: EscrowStatus,
    nullable: true,
  })
  escrowStatus: EscrowStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}

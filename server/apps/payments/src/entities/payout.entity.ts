import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { PayoutStatus } from '@app/common';

@Entity('payouts')
export class Payout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  sellerId: string;

  @Index()
  @Column({ type: 'uuid' })
  orderId: string;

  @Index()
  @Column({ type: 'uuid' })
  paymentId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  platformFee: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  netPayoutAmount: number;

  @Column({ type: 'varchar', length: 100 })
  bankName: string;

  @Column({ type: 'varchar', length: 50 })
  bankAccountNumber: string;

  @Column({ type: 'varchar', length: 150 })
  bankAccountHolderName: string;

  @Column({
    type: 'enum',
    enum: PayoutStatus,
    default: PayoutStatus.PENDING,
  })
  status: PayoutStatus;

  @Column({ type: 'timestamp with time zone', nullable: true })
  processedAt: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}

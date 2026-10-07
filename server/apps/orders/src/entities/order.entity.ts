import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { OrderStatus, PaymentStatus } from '@app/common';
import { OrderItem } from './order-item.entity';

export interface DeliveryAddress {
  recipientName: string;
  recipientPhone: string;
  city: string;
  subCity: string;
  specificLocation: string;
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  orderNumber: string;

  @Index()
  @Column({ type: 'uuid' })
  customerId: string;

  @Index()
  @Column({ type: 'uuid' })
  sellerId: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  carrierId: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.UNPAID,
  })
  paymentStatus: PaymentStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotalAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  deliveryFee: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ type: 'jsonb' })
  deliveryAddress: DeliveryAddress;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  cancelReason: string;

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  txRef?: string;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}

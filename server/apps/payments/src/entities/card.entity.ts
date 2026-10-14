import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('mercatox_cards')
export class MercatoXCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  cardNumber: string;

  @Column({ type: 'varchar', length: 255 })
  cardholderName: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 50 })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 50 })
  themeId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  initialAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 150 })
  cardFee: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 150 })
  totalPaid: number;

  @Column({ type: 'varchar', length: 10, default: 'ETB' })
  currency: string;

  @Column({ type: 'varchar', length: 10, default: '10/29' })
  expiryDate: string;

  @Column({ type: 'varchar', length: 10, default: '821' })
  cvv: string;

  @Column({ type: 'varchar', length: 30, default: 'ACTIVE' })
  status: string;

  @Column({ type: 'varchar', length: 50, default: 'CHAPA' })
  paymentMethod: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transactionReference: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  chapaCheckoutUrl: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  customerId: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}

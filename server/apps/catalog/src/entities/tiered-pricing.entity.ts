import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('tiered_pricing')
export class TieredPricing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.tieredPricing, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'int' })
  minQuantity: number;

  @Column({ type: 'int', nullable: true })
  maxQuantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  discountedPricePerUnit: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}

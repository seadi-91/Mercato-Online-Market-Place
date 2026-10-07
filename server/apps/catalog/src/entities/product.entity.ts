import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ProductUnit } from '@app/common';
import { Category } from './category.entity';
import { TieredPricing } from './tiered-pricing.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  sellerId: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100, unique: true })
  sku: string;

  @Index()
  @Column({ type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  retailPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  wholesalePrice: number;

  @Column({ type: 'int', default: 1 })
  minOrderQuantity: number;

  @Column({
    type: 'enum',
    enum: ProductUnit,
    default: ProductUnit.PIECE,
  })
  unit: ProductUnit;

  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ type: 'int', default: 10 })
  lowStockThreshold: number;

  @Column({ type: 'text', array: true, default: '{}' })
  images: string[];

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 150, nullable: true })
  brand?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  origin?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  grade?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  warehouseLocation?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  branchId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  branchName?: string;

  @Column({ type: 'varchar', length: 50, default: 'published' })
  status: string;

  @Column({ type: 'text', array: true, default: '{}' })
  certifications: string[];

  @Column({ type: 'int', default: 3 })
  leadTimeDays: number;

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'int', default: 0 })
  salesCount: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 5.0 })
  rating: number;

  @Column({ type: 'int', default: 1 })
  ratingCount: number;

  @OneToMany(() => TieredPricing, (tiered) => tiered.product, {
    cascade: true,
    eager: true,
  })
  tieredPricing: TieredPricing[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deletedAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  nameAmharic: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 150, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  iconUrl: string;

  @Column({ type: 'uuid', nullable: true })
  parentCategoryId: string;

  @ManyToOne(() => Category, (category) => category.subCategories, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parentCategoryId' })
  parentCategory: Category;

  @OneToMany(() => Category, (category) => category.parentCategory)
  subCategories: Category[];

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}

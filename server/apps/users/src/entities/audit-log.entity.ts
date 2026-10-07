import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { AuditAction, UserRole } from '@app/common';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  actorId: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  actorRole: UserRole;

  @Index()
  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  targetEntity: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  targetId: string;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}

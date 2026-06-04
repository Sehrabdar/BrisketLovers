import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { AuditAction, Role } from '../../core/global.constraints';

@Entity('menu_audit_logs')
export class MenuAuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  menuItemId: string;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ type: 'jsonb', nullable: true })
  previousData: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newData: Record<string, any>;

  @Column({ type: 'uuid' })
  changedBy: string;

  @Column({ type: 'varchar', length: 50 })
  changedByRole: Role;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}

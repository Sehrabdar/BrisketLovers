import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { OrderItemEntity } from './order-item.entity';
import { OrderStatus } from '../../core/global.constraints';

@Entity('orders')
export class OrderEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @OneToMany(() => OrderItemEntity, (item) => item.order, { cascade: true })
  items: OrderItemEntity[];
}

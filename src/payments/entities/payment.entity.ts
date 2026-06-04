import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { OrderEntity } from '../../orders/entities/order.entity';
import { PaymentStatus } from '../../core/global.constraints';

@Entity('payments')
export class PaymentEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  orderId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 256, nullable: true })
  transactionId: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @OneToOne(() => OrderEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'orderId' })
  order: OrderEntity;
}

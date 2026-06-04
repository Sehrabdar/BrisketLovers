import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { OrderEntity } from './order.entity';
import { MenuEntity } from '../../menu/entities/menu.entity';

@Entity('order_items')
export class OrderItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  orderId: string;

  @Column({ type: 'uuid', nullable: true })
  menuItemId: string;

  @Column({ type: 'varchar', length: 256 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int' })
  quantity: number;

  @ManyToOne(() => OrderEntity, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: OrderEntity;

  @ManyToOne(() => MenuEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'menuItemId' })
  menuItem: MenuEntity;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CartEntity } from './cart.entity';
import { MenuEntity } from '../../menu/entities/menu.entity';

@Entity('cart_items')
export class CartItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  cartId: string;

  @Column({ type: 'uuid' })
  menuItemId: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @ManyToOne(() => CartEntity, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart: CartEntity;

  @ManyToOne(() => MenuEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menuItemId' })
  menuItem: MenuEntity;
}

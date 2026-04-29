import { Column, Entity } from 'typeorm';

import { Category } from '../../core/global.constraints';
import { BaseEntity } from '../../core/entities/base.entity';

@Entity('menu')
export class MenuEntity extends BaseEntity {
  @Column({ length: 256 })
  name!: string;

  @Column({ length: 500, nullable: true })
  description!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'enum', enum: Category })
  category!: Category;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ default: true })
  available!: boolean;
}

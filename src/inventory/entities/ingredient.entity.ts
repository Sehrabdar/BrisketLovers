import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { RecipeIngredientEntity } from './recipe-ingredient.entity';

@Entity('ingredients')
export class IngredientEntity extends BaseEntity {
  @Column({ length: 256 })
  name: string;

  @Column({ length: 64 })
  unit: string;

  @Column('decimal', { precision: 10, scale: 3, default: 0 })
  currentStock: number;

  @Column('decimal', { precision: 10, scale: 3, default: 0 })
  minimumThreshold: number;

  @OneToMany(() => RecipeIngredientEntity, (ri) => ri.ingredient, { cascade: false })
  recipeIngredients: RecipeIngredientEntity[];
}

import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MenuEntity } from '../../menu/entities/menu.entity';
import { IngredientEntity } from './ingredient.entity';

@Entity('recipe_ingredients')
export class RecipeIngredientEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  menuItemId: string;

  @Column({ type: 'uuid' })
  ingredientId: string;

  @Column('decimal', { precision: 10, scale: 3 })
  quantityRequired: number;

  @ManyToOne(() => MenuEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'menuItemId' })
  menuItem: MenuEntity;

  @ManyToOne(() => IngredientEntity, (ing) => ing.recipeIngredients, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'ingredientId' })
  ingredient: IngredientEntity;
}

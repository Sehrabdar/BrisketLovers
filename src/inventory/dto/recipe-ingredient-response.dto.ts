import { ApiProperty } from '@nestjs/swagger';

export class RecipeIngredientResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  ingredientId: string;

  @ApiProperty()
  ingredientName: string;

  @ApiProperty()
  unit: string;

  @ApiProperty()
  quantityRequired: number;

  @ApiProperty()
  currentStock: number;
}

export class RecipeResponseDto {
  @ApiProperty()
  menuItemId: string;

  @ApiProperty()
  menuItemName: string;

  @ApiProperty({ type: [RecipeIngredientResponseDto] })
  ingredients: RecipeIngredientResponseDto[];

  @ApiProperty()
  availableServings: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNumber, IsUUID, Min, ValidateNested } from 'class-validator';

export class RecipeIngredientItemDto {
  @IsUUID()
  @ApiProperty({ example: 'uuid-of-ingredient' })
  ingredientId: string;

  @IsNumber()
  @Min(0.001)
  @ApiProperty({ example: 1, description: 'Quantity of this ingredient required per serving' })
  quantityRequired: number;
}

export class UpsertRecipeDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientItemDto)
  @ApiProperty({ type: [RecipeIngredientItemDto] })
  ingredients: RecipeIngredientItemDto[];
}

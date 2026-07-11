import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateIngredientDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  @ApiProperty({ example: 'Burger Bun' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  @ApiProperty({ example: 'pcs' })
  unit: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiProperty({ example: 100 })
  currentStock?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiProperty({ example: 10, description: 'Alert when stock falls below this value' })
  minimumThreshold?: number;
}

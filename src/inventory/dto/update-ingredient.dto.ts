import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateIngredientDto {
  @IsString()
  @IsOptional()
  @MaxLength(256)
  @ApiProperty({ example: 'Sesame Bun', required: false })
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(64)
  @ApiProperty({ example: 'pcs', required: false })
  unit?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiProperty({ example: 15, required: false })
  minimumThreshold?: number;
}

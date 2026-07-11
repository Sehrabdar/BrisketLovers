import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateStockDto {
  @IsNumber()
  @ApiProperty({
    example: 50,
    description: 'Amount to add (positive) or subtract (negative) from current stock',
  })
  delta: number;

  @IsString()
  @IsOptional()
  @MaxLength(512)
  @ApiProperty({ example: 'Received delivery of 50 buns', required: false })
  note?: string;
}

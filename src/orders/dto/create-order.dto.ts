import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ required: false, example: '123 Main St, Springfield' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  deliveryAddress?: string;

  @ApiProperty({ required: false, example: 'Please leave at the door' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

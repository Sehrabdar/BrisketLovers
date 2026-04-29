import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsString, IsUrl } from 'class-validator';

import { BaseDto } from '../../core/dto/base.dto';
import { Category } from '../../core/global.constraints';

export class MenuResponseDto extends BaseDto {
  @IsString()
  @ApiProperty({ example: 'Brisket 007' })
  name: string;

  @IsString()
  @ApiProperty({ example: 'Medium Rare Steak' })
  description?: string;

  @IsNumber()
  @ApiProperty({ example: '3.99' })
  price: number;

  @IsEnum(Category)
  @ApiProperty({ example: 'Non-veg/Veg' })
  category: Category;

  @IsBoolean()
  @ApiProperty({ example: 'true/false' })
  available?: boolean;

  @IsUrl()
  @ApiProperty({ example: 'uploads/img1.jpg' })
  imageUrl?: string;
}

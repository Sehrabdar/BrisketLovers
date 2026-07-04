import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsString, IsUrl } from 'class-validator';

import { BaseDto } from '../../core/dto/base.dto';
import { Category } from '../../core/global.constraints';
import { Expose } from 'class-transformer';

export class MenuResponseDto extends BaseDto {
  @Expose()
  @IsString()
  @ApiProperty({ example: 'Brisket 007' })
  name: string;

  @Expose()
  @IsString()
  @ApiProperty({ example: 'Medium Rare Steak' })
  description?: string;

  @Expose()
  @IsNumber()
  @ApiProperty({ example: '3.99' })
  price: number;

  @Expose()
  @IsEnum(Category)
  @ApiProperty({ example: 'Non-veg/Veg' })
  category: Category;

  @Expose()
  @IsBoolean()
  @ApiProperty({ example: 'true/false' })
  available?: boolean;

  @Expose()
  @IsUrl()
  @ApiProperty({ example: 'uploads/img1.jpg' })
  imageUrl?: string;
}

import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, MaxLength, Min } from "class-validator";

import { Category } from "../../core/global.constraints";
import { ApiProperty } from "@nestjs/swagger";

export class CreateMenuDto {
  
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ maxLength: 256, example: 'Red Velvet Cake' })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ maxLength: 500, example: 'Aromatic desert with rose flavoured crust' })
  description?: string;

  @IsNumber()
  @Min(0)
  @ApiProperty({ example: '5.99' })
  price: number;

  @IsEnum(Category)
  @ApiProperty({ maxLength: 256, example: "starter" })
  category: Category;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ example: true })
  available?: boolean;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}
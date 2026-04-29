import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, MaxLength, Min } from "class-validator";

import { Category } from "../../core/global.constraints";

export class CreateMenuDto {
  
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsEnum(Category)
  category: Category;

  @IsBoolean()
  @IsOptional()
  available?: boolean;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}
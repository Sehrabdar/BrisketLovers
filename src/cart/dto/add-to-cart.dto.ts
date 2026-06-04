import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min, IsOptional } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ example: 'f6230f7c-4f93-4072-9853-b185ad5c5932' })
  @IsUUID()
  menuItemId: string;

  @ApiProperty({ example: 1, required: false, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number = 1;
}

import { ApiProperty } from '@nestjs/swagger';

export class CartItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  menuItemId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  imageUrl?: string;

  @ApiProperty({ example: 9.99 })
  price: number;

  @ApiProperty({ example: 1 })
  quantity: number;

  @ApiProperty({ example: 9.99 })
  subtotal: number;
}

export class CartResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ type: [CartItemResponseDto] })
  items: CartItemResponseDto[];

  @ApiProperty({ example: 19.98 })
  totalPrice: number;

  @ApiProperty({ example: 2 })
  totalItems: number;
}

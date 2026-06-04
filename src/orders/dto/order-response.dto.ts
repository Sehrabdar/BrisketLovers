import { ApiProperty } from '@nestjs/swagger';

export class OrderItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  menuItemId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ example: 12.99 })
  price: number;

  @ApiProperty({ example: 2 })
  quantity: number;
}

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  userName: string;

  @ApiProperty()
  userEmail: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ example: 25.98 })
  totalAmount: number;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class OrderListDto {
  @ApiProperty({ type: [OrderResponseDto] })
  orders: OrderResponseDto[];

  @ApiProperty()
  count: number;
}

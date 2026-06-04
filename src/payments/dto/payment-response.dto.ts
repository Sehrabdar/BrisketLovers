import { ApiProperty } from '@nestjs/swagger';

export class PaymentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false })
  transactionId?: string;

  @ApiProperty({ required: false, description: 'Stripe client secret for frontend checkout' })
  clientSecret?: string;

  @ApiProperty()
  createdAt: Date;
}

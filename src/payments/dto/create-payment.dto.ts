import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 'f6230f7c-4f93-4072-9853-b185ad5c5932' })
  @IsUUID()
  orderId: string;
}

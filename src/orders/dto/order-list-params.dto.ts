import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ListParamDto } from '../../core/dto/list-param.dto';
import { OrderStatus } from '../../core/global.constraints';

export class OrderListParamsDto extends ListParamDto {
  @ApiProperty({ enum: OrderStatus, required: false })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}

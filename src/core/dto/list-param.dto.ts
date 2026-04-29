import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, Min, IsEnum, IsOptional } from 'class-validator';

import { OrderDirection } from '../global.constraints';

export class ListParamDto {
    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(0)
    @ApiProperty({ minimum: 0, example: 0, required: false })
    offset: number = 0;

    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(-1)
    @ApiProperty({ minimum: -1, example: 10, required: false })
    limit: number = 10;

    @IsEnum(OrderDirection)
    @IsOptional()
    @ApiProperty({ enum: OrderDirection, default: OrderDirection.Desc, required: false })
    orderDirection?: OrderDirection = OrderDirection.Desc;
}

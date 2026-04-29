import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { MenuResponseDto } from './menu-response.dto';

export class MenuCountResponseDto {
    @ApiProperty({ type: [MenuResponseDto] })
    @Expose()
    dishes: MenuResponseDto[];

    @ApiProperty({ description: 'Total dishes' })
    @Expose()
    count: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { MenuResponseDto } from './menu-response.dto';
import { Expose } from 'class-transformer';

export class MenuListDto {
  @ApiProperty({ type: [MenuResponseDto] })
  @Expose()
  dishes!: MenuResponseDto[];

  @ApiProperty({ description: 'total dishes' })
  @Expose()
  count!: number;
}

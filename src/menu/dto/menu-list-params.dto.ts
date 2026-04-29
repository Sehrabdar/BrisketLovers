import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { ListParamDto } from '../../core/dto/list-param.dto';
import { Availability, MenuOrderBy } from 'src/core/global.constraints';

export class MenuListParamsDto extends ListParamDto {
  @IsEnum(MenuOrderBy)
  @ApiProperty({
    enum: MenuOrderBy,
    default: MenuOrderBy.CreatedAt,
    required: false,
  })
  orderBy: MenuOrderBy = MenuOrderBy.CreatedAt;

  @IsEnum(Availability)
  @IsOptional()
  @ApiProperty({ enum: Availability, required: false })
  available?: Availability;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Search dish by name',
    required: false,
  })
  query?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsEnum, IsString } from 'class-validator';

import { BaseDto } from '../../core/dto/base.dto';
import { AccountStatus } from '../../core/global.constraints';

export class UserResponseDto extends BaseDto {
    @IsString()
    @Expose()
    @ApiProperty({ example: 'John Doe' })
    readonly name: string;

    @IsString()
    @Expose()
    @ApiProperty({ example: 'john-doe' })
    readonly username: string;

    @IsString()
    @Expose()
    @ApiProperty({ example: 'johndoe@email.com' })
    readonly email: string;

    @IsString()
    @Expose()
    @ApiProperty({ example: '700612345678' })
    readonly phone: string;

    @Expose()
    @IsEnum(AccountStatus)
    @ApiProperty({ enum: AccountStatus, example: AccountStatus.Active })
    readonly status: AccountStatus;
}

import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class BaseDto {
    @IsString()
    @Expose()
    @ApiProperty({ format: 'uuid', example: 'f6230f7c-4f93-4072-9853-b185ad5c5932' })
    readonly id: string;

    @IsString()
    @Expose()
    @ApiProperty({ example: '2023-12-26T02:07:12.195Z' })
    readonly createdAt: Date;

    @IsString()
    @Expose()
    @ApiProperty({ example: '2023-12-26T02:07:12.195Z' })
    readonly updatedAt: Date;

    @IsString()
    @Expose()
    @ApiProperty({ example: '2023-12-26T02:07:12.195Z' })
    readonly deletedAt: Date;

    @IsString()
    @Expose()
    @ApiProperty({ format: 'uuid', example: 'f6230f7c-4f93-4072-9853-b185ad5c5932' })
    readonly createdBy: string;

    @IsString()
    @Expose()
    @ApiProperty({ format: 'uuid', example: 'f6230f7c-4f93-4072-9853-b185ad5c5932' })
    readonly updatedBy: string;
}

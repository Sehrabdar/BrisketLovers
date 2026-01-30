import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class LoginDto {
    @IsEmail()
    @ApiProperty({ maxLength: 256, example: 'johndoe@gmail.com' })
    @Transform(({ value }) => value.toLowerCase(), { toClassOnly: true })
    readonly email: string;

    @IsString()
    @MaxLength(256)
    @ApiProperty()
    readonly password: string;
}

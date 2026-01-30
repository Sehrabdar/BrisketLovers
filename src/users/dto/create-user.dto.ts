import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, MaxLength, IsEmail, MinLength, IsBoolean, IsOptional } from 'class-validator';

export class RegisterUserDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(256)
    @Transform(({ value }) => value.trim())
    @ApiProperty({ maxLength: 256, example: 'John Doe' })
    readonly name: string;

    @IsEmail()
    @IsNotEmpty()
    @MaxLength(256)
    @Transform(({ value }) => value.toLowerCase(), { toClassOnly: true })
    @ApiProperty({ maxLength: 256, example: 'johndoe@gmail.com' })
    readonly email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(512)
    @ApiProperty({ minLength: 8, maxLength: 512 })
    readonly password: string;

    @IsString()
    @MaxLength(16)
    @Transform(({ value }) => value.trim())
    @ApiProperty({ maxLength: 16, example: '7006123456', required: false })
    readonly phone: string;
}

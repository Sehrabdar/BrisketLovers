import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, MaxLength, IsEmail, MinLength, IsOptional } from 'class-validator';

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  @Transform(({ value }) => value.trim())
  @ApiProperty({ maxLength: 256, example: 'Jane Staff' })
  readonly name: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(256)
  @Transform(({ value }) => value.toLowerCase(), { toClassOnly: true })
  @ApiProperty({ maxLength: 256, example: 'staff@brisketlovers.com' })
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(512)
  @ApiProperty({ minLength: 8, maxLength: 512 })
  readonly password: string;

  @IsString()
  @IsOptional()
  @MaxLength(16)
  @Transform(({ value }) => value?.trim())
  @ApiProperty({ maxLength: 16, example: '7006123456', required: false })
  readonly phone?: string;
}

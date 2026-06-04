import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  accessTokenExpiresIn: number;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  refreshTokenExpiresIn: number;
}
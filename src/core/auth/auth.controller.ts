import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { UsersService } from '../../users/users.service';
import { UserType } from '../global.constraints';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, type: TokenResponseDto })
  async refresh(@Body() body: RefreshTokenDto): Promise<TokenResponseDto> {
    const payload = this.authService.refreshTokens(body.refreshToken);
    const user = await this.usersService.findOneEntity(payload.sub);
    return this.authService.getTokens({
      user,
      userType: UserType.AppUser,
    });
  }
}

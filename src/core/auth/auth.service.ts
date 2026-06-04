import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { EncodeDataArgs, TokenResponse } from './auth.type';
import { Role, TokenType } from '../global.constraints';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public getTokens(data: EncodeDataArgs): TokenResponse {
    const accessSecret = this.configService.get('jwt.jwtAccessSecret');
    const accessExpiresIn = this.configService.get('jwt.jwtAccessExpiresIn');
    const refreshSecret = this.configService.get('jwt.jwtRefreshSecret');
    const refreshExpiresIn = this.configService.get('jwt.jwtRefreshExpiresIn');

    if (!accessSecret || !accessExpiresIn) {
      throw new Error('Invalid JWT configuration: Access secret or expiresIn is missing');
    }
    if (!refreshSecret || !refreshExpiresIn) {
      throw new Error('Invalid JWT configuration: Refresh secret or expiresIn is missing');
    }

    const payload = {
      sub: data.user.id,
      email: data.user.email,
      userType: data.userType,
      role: data.user.role,
    };

    const accessToken = this.jwtService.sign(
      { ...payload, tokenType: TokenType.Access },
      { secret: accessSecret, expiresIn: accessExpiresIn },
    );

    const refreshToken = this.jwtService.sign(
      { ...payload, tokenType: TokenType.Refresh },
      { secret: refreshSecret, expiresIn: refreshExpiresIn },
    );

    const decodedAccess: any = this.jwtService.decode(accessToken);
    const decodedRefresh: any = this.jwtService.decode(refreshToken);

    return {
      accessToken,
      accessTokenExpiresIn: decodedAccess.exp,
      refreshToken,
      refreshTokenExpiresIn: decodedRefresh.exp,
    };
  }

  // Keep backward compat alias
  public getAccessToken(data: EncodeDataArgs): TokenResponse {
    return this.getTokens(data);
  }

  public refreshTokens(refreshToken: string): { sub: string; email: string; role: Role } {
    const refreshSecret = this.configService.get('jwt.jwtRefreshSecret');
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: refreshSecret });
      if (payload.tokenType !== TokenType.Refresh) {
        throw new UnauthorizedException('Invalid token type');
      }
      return { sub: payload.sub, email: payload.email, role: payload.role };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from './auth.type';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('jwt.jwtAccessSecret'),
    });
  }
  async validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      email: payload.email,
    };
  }
}

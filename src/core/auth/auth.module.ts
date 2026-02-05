import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { AccessTokenStrategy } from './user-token.strategy';

@Module({
  imports:[UsersModule, PassportModule.register({defaultStrategy: 'jwt'}), JwtModule.register({}), ConfigModule.forRoot({isGlobal: true}), forwardRef(() => UsersModule)],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy],
  exports: [AuthService]
})
export class AuthModule {}

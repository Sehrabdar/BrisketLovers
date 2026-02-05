import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserMapper } from './mapper/user.mapper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { CryptoModule } from '../core/crypto/crypto.module';
import { CryptoService } from '../core/crypto/crypto.service';
import { AuthModule } from '../core/auth/auth.module';

@Module({
  imports: [  
    TypeOrmModule.forFeature([UserEntity]), CryptoModule, forwardRef(() => AuthModule)
  ],
  controllers: [UsersController],
  providers: [UsersService, UserMapper, CryptoService],
  exports:[UsersService]
})
export class UsersModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { SeedService } from './seed.service';
import { UserEntity } from '../../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), ConfigModule],
  providers: [SeedService],
})
export class SeedModule {}

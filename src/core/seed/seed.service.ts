import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { UserEntity } from '../../users/entities/user.entity';
import { Role, AccountStatus } from '../global.constraints';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedSuperAdmin();
  }

  private async seedSuperAdmin() {
    const email = this.configService.get<string>('SUPERADMIN_EMAIL');
    const password = this.configService.get<string>('SUPERADMIN_PASSWORD');
    const name = this.configService.get<string>('SUPERADMIN_NAME') || 'Super Admin';

    if (!email || !password) {
      this.logger.warn('SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD not set. Skipping seed.');
      return;
    }

    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      this.logger.log('Superadmin account already exists. Skipping seed.');
      return;
    }

    const admin = this.userRepository.create({
      name,
      email,
      password,
      role: Role.SUPERADMIN,
      status: AccountStatus.Active,
    });

    await this.userRepository.save(admin);
    this.logger.log(`Superadmin account created: ${email}`);
  }
}

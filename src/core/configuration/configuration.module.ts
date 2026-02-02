import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import postgresConfiguration from './postgres.configuration';
import jwtConfiguration from './jwt.configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [postgresConfiguration, jwtConfiguration],
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
})
export class ConfigurationModule {}

import { Module } from "@nestjs/common";

import { ConfigurationModule } from "./configuration/configuration.module";
import { AuthModule } from './auth/auth.module';
import { CryptoModule } from "./crypto/crypto.module";
import { SeedModule } from "./seed/seed.module";

@Module({
    imports: [ConfigurationModule, AuthModule, CryptoModule, SeedModule],
})
export class CoreModule{}
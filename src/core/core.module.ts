import { Module } from "@nestjs/common";

import { ConfigurationModule } from "./configuration/configuration.module";
import { AuthModule } from './auth/auth.module';
import { CryptoModule } from "./crypto/crypto.module";

@Module({
    imports: [ConfigurationModule, AuthModule, CryptoModule],
})
export class CoreModule{}
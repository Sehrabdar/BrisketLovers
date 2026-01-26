import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import postgresConfiguration from "./postgres.configuration";

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [
                postgresConfiguration
            ],
            isGlobal: true,
            envFilePath: '.env',
        }),
    ],
})

export class ConfigurationModule{}
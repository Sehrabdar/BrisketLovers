import { registerAs } from '@nestjs/config';

export default registerAs('postgres', () => ({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    password: process.env.POSTGRES_PASSWORD,
    dbName: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USERNAME,
    synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
    sslEnabled: process.env.DATABASE_SSL_ENABLED === 'true',
    rejectUnauthorized: process.env.DATABASE_REJECT_UNAUTHORIZED === 'true'
}));

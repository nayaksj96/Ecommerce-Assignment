import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { loadEnv } from '../common/env';
import { CustomerOrder } from '../customers/customer-order.entity';
import { Customer } from '../customers/customer.entity';

export function getTypeOrmOptions(): TypeOrmModuleOptions {
  loadEnv();

  return {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'customer_db',
    entities: [Customer, CustomerOrder],
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    migrationsRun: process.env.DB_RUN_MIGRATIONS === 'true',
    autoLoadEntities: false,
    logging: process.env.DB_LOGGING === 'true',
  };
}

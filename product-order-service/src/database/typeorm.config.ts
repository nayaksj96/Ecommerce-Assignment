import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { loadEnv } from '../common/env';
import { Order } from '../orders/order.entity';
import { OrderItem } from '../orders/order-item.entity';
import { Product } from '../products/product.entity';

export function getTypeOrmOptions(): TypeOrmModuleOptions {
  loadEnv();

  return {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'product_order_db',
    entities: [Product, Order, OrderItem],
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    migrationsRun: process.env.DB_RUN_MIGRATIONS === 'true',
    autoLoadEntities: false,
    logging: process.env.DB_LOGGING === 'true',
  };
}

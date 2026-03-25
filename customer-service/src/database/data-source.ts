import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { loadEnv } from '../common/env';
import { CustomerOrder } from '../customers/customer-order.entity';
import { Customer } from '../customers/customer.entity';

loadEnv();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'customer_db',
  entities: [Customer, CustomerOrder],
  migrations: ['src/database/migrations/*.ts'],
});

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomerSchema1710000000001 implements MigrationInterface {
  name = 'CreateCustomerSchema1710000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(20),
        address TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS customer_orders (
        id SERIAL PRIMARY KEY,
        external_order_id INTEGER NOT NULL UNIQUE,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        status VARCHAR(30) NOT NULL,
        total_amount NUMERIC(10,2) NOT NULL,
        items JSONB NOT NULL,
        ordered_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS customer_orders`);
    await queryRunner.query(`DROP TABLE IF EXISTS customers`);
  }
}

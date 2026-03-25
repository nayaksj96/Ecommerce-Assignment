import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from './customer.entity';

@Entity({ name: 'customer_orders' })
export class CustomerOrder {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'external_order_id', type: 'int', unique: true })
  externalOrderId!: number;

  @ManyToOne(() => Customer, (customer) => customer.orders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;

  @Column({ type: 'varchar', length: 30 })
  status!: string;

  @Column({
    name: 'total_amount',
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  totalAmount!: number;

  @Column({ type: 'jsonb' })
  items!: Array<{
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;

  @Column({ name: 'ordered_at', type: 'timestamptz' })
  orderedAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

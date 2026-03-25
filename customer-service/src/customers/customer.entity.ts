import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CustomerOrder } from './customer-order.entity';

@Entity({ name: 'customers' })
export class Customer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 120 })
  name!: string;

  @Column({ length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string | null;

  @Column({ type: 'text', nullable: true })
  address?: string | null;

  @OneToMany(() => CustomerOrder, (order) => order.customer, {
    cascade: true,
    eager: true,
  })
  orders!: CustomerOrder[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

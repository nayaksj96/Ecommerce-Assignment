import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  asEmail,
  asPositiveInteger,
  asTrimmedText,
} from '../common/validation';
import { CustomerOrder } from './customer-order.entity';
import { Customer } from './customer.entity';

interface CustomerPayload {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  address?: unknown;
}

export interface OrderCreatedEvent {
  orderId: number;
  customer: {
    id: number;
    name: string;
    email: string;
  };
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  totalAmount: number;
  status: string;
  createdAt: string;
}

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customersRepository: Repository<Customer>,
    @InjectRepository(CustomerOrder)
    private readonly customerOrdersRepository: Repository<CustomerOrder>,
  ) {}

  async findAll(): Promise<Customer[]> {
    return this.customersRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customersRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer ${id} was not found.`);
    }

    return customer;
  }

  async findOrderHistory(id: number): Promise<CustomerOrder[]> {
    const customer = await this.findOne(id);
    return [...customer.orders].sort(
      (left, right) => right.orderedAt.getTime() - left.orderedAt.getTime(),
    );
  }

  async create(payload: unknown): Promise<Customer> {
    const body = this.validateCreatePayload(payload);
    const existing = await this.customersRepository.findOne({
      where: { email: body.email },
    });

    if (existing) {
      throw new BadRequestException(
        `A customer with email ${body.email} already exists.`,
      );
    }

    return this.customersRepository.save(this.customersRepository.create(body));
  }

  async update(id: number, payload: unknown): Promise<Customer> {
    const customer = await this.findOne(id);
    const updates = this.validateUpdatePayload(payload);

    if (updates.email && updates.email !== customer.email) {
      const existing = await this.customersRepository.findOne({
        where: { email: updates.email },
      });

      if (existing) {
        throw new BadRequestException(
          `A customer with email ${updates.email} already exists.`,
        );
      }
    }

    Object.assign(customer, updates);
    return this.customersRepository.save(customer);
  }

  async syncOrderFromEvent(event: OrderCreatedEvent): Promise<void> {
    const customerId = asPositiveInteger(event.customer.id, 'customer.id');
    const customerName = asTrimmedText(
      event.customer.name,
      'customer.name',
      120,
    );
    const customerEmail = asEmail(event.customer.email, 'customer.email');

    let customer = await this.customersRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      customer = this.customersRepository.create({
        id: customerId,
        name: customerName,
        email: customerEmail,
      });
      customer = await this.customersRepository.save(customer);
    }

    const existingOrder = await this.customerOrdersRepository.findOne({
      where: { externalOrderId: event.orderId },
    });

    if (existingOrder) {
      return;
    }

    const order = this.customerOrdersRepository.create({
      externalOrderId: event.orderId,
      customer,
      status: event.status,
      totalAmount: Number(event.totalAmount.toFixed(2)),
      items: event.items,
      orderedAt: new Date(event.createdAt),
    });

    await this.customerOrdersRepository.save(order);
  }

  private validateCreatePayload(payload: unknown): {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  } {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('A valid customer payload is required.');
    }

    const body = payload as CustomerPayload;
    const result: {
      name: string;
      email: string;
      phone?: string;
      address?: string;
    } = {
      name: asTrimmedText(body.name, 'name', 120),
      email: asEmail(body.email, 'email'),
    };

    if (body.phone !== undefined) {
      result.phone = asTrimmedText(body.phone, 'phone', 20);
    }

    if (body.address !== undefined) {
      result.address = asTrimmedText(body.address, 'address', 500);
    }

    return result;
  }

  private validateUpdatePayload(payload: unknown): Partial<Customer> {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('A valid update payload is required.');
    }

    const body = payload as CustomerPayload;
    const updates: Partial<Customer> = {};

    if (body.name !== undefined) {
      updates.name = asTrimmedText(body.name, 'name', 120);
    }

    if (body.email !== undefined) {
      updates.email = asEmail(body.email, 'email');
    }

    if (body.phone !== undefined) {
      updates.phone = asTrimmedText(body.phone, 'phone', 20);
    }

    if (body.address !== undefined) {
      updates.address = asTrimmedText(body.address, 'address', 500);
    }

    return updates;
  }
}

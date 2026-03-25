import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  asEmail,
  asPositiveInteger,
  asTrimmedText,
} from '../common/validation';
import { RabbitMqPublisher } from '../messaging/rabbitmq.publisher';
import { Product } from '../products/product.entity';
import { OrderItem } from './order-item.entity';
import { Order, OrderStatus } from './order.entity';

interface CheckoutPayload {
  customerId: unknown;
  customerName: unknown;
  customerEmail: unknown;
  items: unknown;
}

interface CheckoutItem {
  productId: number;
  quantity: number;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly rabbitMqPublisher: RabbitMqPublisher,
  ) {}

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order ${id} was not found.`);
    }

    return order;
  }

  async create(payload: unknown): Promise<Order> {
    const body = this.validatePayload(payload);

    const products = await this.productsRepository.find({
      where: {
        id: In(body.items.map((item) => item.productId)),
      },
    });

    if (products.length !== body.items.length) {
      throw new BadRequestException(
        'One or more selected products do not exist.',
      );
    }

    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    const orderItems = body.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new BadRequestException(
          `Product ${item.productId} does not exist anymore.`,
        );
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${product.name}. Available stock: ${product.stock}.`,
        );
      }

      product.stock -= item.quantity;
      const lineTotal = Number((product.price * item.quantity).toFixed(2));

      return this.orderItemsRepository.create({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        lineTotal,
      });
    });

    const totalAmount = Number(
      orderItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2),
    );

    await this.productsRepository.save(products);

    const order = this.ordersRepository.create({
      customerId: body.customerId,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      status: OrderStatus.CONFIRMED,
      totalAmount,
      items: orderItems,
    });

    const savedOrder = await this.ordersRepository.save(order);

    await this.rabbitMqPublisher.publishOrderCreated({
      orderId: savedOrder.id,
      customer: {
        id: savedOrder.customerId,
        name: savedOrder.customerName,
        email: savedOrder.customerEmail,
      },
      items: savedOrder.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      })),
      totalAmount: savedOrder.totalAmount,
      status: savedOrder.status,
      createdAt: savedOrder.createdAt.toISOString(),
    });

    return savedOrder;
  }

  private validatePayload(payload: unknown): {
    customerId: number;
    customerName: string;
    customerEmail: string;
    items: CheckoutItem[];
  } {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('A valid checkout payload is required.');
    }

    const body = payload as CheckoutPayload;
    if (!Array.isArray(body.items) || body.items.length === 0) {
      throw new BadRequestException('At least one order item is required.');
    }

    return {
      customerId: asPositiveInteger(body.customerId, 'customerId'),
      customerName: asTrimmedText(body.customerName, 'customerName', 120),
      customerEmail: asEmail(body.customerEmail, 'customerEmail'),
      items: body.items.map((item, index) => {
        if (!item || typeof item !== 'object') {
          throw new BadRequestException(
            `Order item at index ${index} is invalid.`,
          );
        }

        const value = item as Record<string, unknown>;
        return {
          productId: asPositiveInteger(value.productId, 'productId'),
          quantity: asPositiveInteger(value.quantity, 'quantity'),
        };
      }),
    };
  }
}

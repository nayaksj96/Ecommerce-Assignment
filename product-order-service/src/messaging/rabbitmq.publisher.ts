import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import {
  AmqpConnectionManager,
  ChannelWrapper,
  connect,
} from 'amqp-connection-manager';

interface ExchangeSetupChannel {
  assertExchange(
    exchange: string,
    type: 'topic',
    options: { durable: boolean },
  ): Promise<unknown>;
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
export class RabbitMqPublisher implements OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqPublisher.name);
  private readonly url = process.env.RABBITMQ_URL ?? 'amqp://localhost:5672';
  private readonly exchange =
    process.env.RABBITMQ_EXCHANGE ?? 'ecommerce.events';
  private connection?: AmqpConnectionManager;
  private channel?: ChannelWrapper;

  private ensureChannel(): ChannelWrapper {
    if (this.channel) {
      return this.channel;
    }

    this.connection = connect([this.url]);
    this.channel = this.connection.createChannel({
      setup: async (channel: ExchangeSetupChannel) => {
        await channel.assertExchange(this.exchange, 'topic', { durable: true });
      },
    });

    return this.channel;
  }

  async publishOrderCreated(event: OrderCreatedEvent): Promise<void> {
    try {
      const channel = this.ensureChannel();
      await channel.publish(
        this.exchange,
        'order.created',
        Buffer.from(JSON.stringify(event)),
        { deliveryMode: 2, contentType: 'application/json' } as never,
      );
    } catch (error) {
      this.logger.error('Failed to publish order.created event.', error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}

import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  AmqpConnectionManager,
  ChannelWrapper,
  connect,
} from 'amqp-connection-manager';
import {
  CustomersService,
  OrderCreatedEvent,
} from '../customers/customers.service';

interface ConsumeMessageLike {
  content: Buffer;
}

interface ConsumerSetupChannel {
  assertExchange(
    exchange: string,
    type: 'topic',
    options: { durable: boolean },
  ): Promise<unknown>;
  assertQueue(queue: string, options: { durable: boolean }): Promise<unknown>;
  bindQueue(
    queue: string,
    exchange: string,
    routingKey: string,
  ): Promise<unknown>;
  consume(
    queue: string,
    onMessage: (message: ConsumeMessageLike | null) => Promise<void>,
  ): Promise<unknown>;
  ack(message: ConsumeMessageLike): void;
  nack(message: ConsumeMessageLike, allUpTo?: boolean, requeue?: boolean): void;
}

@Injectable()
export class RabbitMqConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqConsumer.name);
  private readonly url = process.env.RABBITMQ_URL ?? 'amqp://localhost:5672';
  private readonly exchange =
    process.env.RABBITMQ_EXCHANGE ?? 'ecommerce.events';
  private readonly queue =
    process.env.RABBITMQ_CUSTOMER_QUEUE ?? 'customer.order.created';
  private connection?: AmqpConnectionManager;
  private channel?: ChannelWrapper;

  constructor(private readonly customersService: CustomersService) {}

  onModuleInit(): void {
    this.connection = connect([this.url]);
    this.channel = this.connection.createChannel({
      setup: async (channel: ConsumerSetupChannel) => {
        await channel.assertExchange(this.exchange, 'topic', { durable: true });
        await channel.assertQueue(this.queue, { durable: true });
        await channel.bindQueue(this.queue, this.exchange, 'order.created');
        await channel.consume(this.queue, async (message) => {
          await this.handleMessage(channel, message);
        });
      },
    });
  }

  private async handleMessage(
    channel: ConsumerSetupChannel,
    message: ConsumeMessageLike | null,
  ): Promise<void> {
    if (!message) {
      return;
    }

    try {
      const payload = JSON.parse(
        message.content.toString(),
      ) as OrderCreatedEvent;
      await this.customersService.syncOrderFromEvent(payload);
      channel.ack(message);
    } catch (error) {
      const details = error instanceof Error ? error.stack : String(error);
      this.logger.error('Failed to process RabbitMQ event.', details);
      channel.nack(message, false, false);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}

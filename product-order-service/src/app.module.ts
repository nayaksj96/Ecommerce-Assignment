import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health/health.controller';
import { RabbitMqPublisher } from './messaging/rabbitmq.publisher';
import { Order } from './orders/order.entity';
import { OrderItem } from './orders/order-item.entity';
import { OrdersController } from './orders/orders.controller';
import { OrdersService } from './orders/orders.service';
import { Product } from './products/product.entity';
import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';
import { getTypeOrmOptions } from './database/typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(getTypeOrmOptions()),
    TypeOrmModule.forFeature([Product, Order, OrderItem]),
  ],
  controllers: [HealthController, ProductsController, OrdersController],
  providers: [ProductsService, OrdersService, RabbitMqPublisher],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerOrder } from './customers/customer-order.entity';
import { Customer } from './customers/customer.entity';
import { CustomersController } from './customers/customers.controller';
import { CustomersService } from './customers/customers.service';
import { getTypeOrmOptions } from './database/typeorm.config';
import { HealthController } from './health/health.controller';
import { RabbitMqConsumer } from './messaging/rabbitmq.consumer';

@Module({
  imports: [
    TypeOrmModule.forRoot(getTypeOrmOptions()),
    TypeOrmModule.forFeature([Customer, CustomerOrder]),
  ],
  controllers: [HealthController, CustomersController],
  providers: [CustomersService, RabbitMqConsumer],
})
export class AppModule {}

import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.findOne(id);
  }

  @Get(':id/orders')
  findOrderHistory(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.findOrderHistory(id);
  }

  @Post()
  create(@Body() payload: unknown) {
    return this.customersService.create(payload);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() payload: unknown) {
    return this.customersService.update(id, payload);
  }
}

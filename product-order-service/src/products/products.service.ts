import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  asNonNegativeNumber,
  asPositiveInteger,
  asTrimmedText,
} from '../common/validation';
import { Product } from './product.entity';

interface ProductPayload {
  name?: unknown;
  description?: unknown;
  price?: unknown;
  stock?: unknown;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product ${id} was not found.`);
    }

    return product;
  }

  async create(payload: unknown): Promise<Product> {
    const body = this.validateCreatePayload(payload);
    const product = this.productsRepository.create(body);
    return this.productsRepository.save(product);
  }

  async update(id: number, payload: unknown): Promise<Product> {
    const product = await this.findOne(id);
    const body = this.validateUpdatePayload(payload);

    Object.assign(product, body);
    return this.productsRepository.save(product);
  }

  async remove(id: number): Promise<{ deleted: true }> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
    return { deleted: true };
  }

  private validateCreatePayload(payload: unknown): {
    name: string;
    description: string;
    price: number;
    stock: number;
  } {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('A valid product payload is required.');
    }

    const body = payload as ProductPayload;
    return {
      name: asTrimmedText(body.name, 'name', 150),
      description: asTrimmedText(body.description, 'description', 1000),
      price: asNonNegativeNumber(body.price, 'price'),
      stock: asPositiveInteger(body.stock, 'stock'),
    };
  }

  private validateUpdatePayload(payload: unknown): Partial<Product> {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('A valid update payload is required.');
    }

    const body = payload as ProductPayload;
    const updates: Partial<Product> = {};

    if (body.name !== undefined) {
      updates.name = asTrimmedText(body.name, 'name', 150);
    }

    if (body.description !== undefined) {
      updates.description = asTrimmedText(
        body.description,
        'description',
        1000,
      );
    }

    if (body.price !== undefined) {
      updates.price = asNonNegativeNumber(body.price, 'price');
    }

    if (body.stock !== undefined) {
      if (
        typeof body.stock !== 'number' ||
        !Number.isInteger(body.stock) ||
        body.stock < 0
      ) {
        throw new BadRequestException('stock must be a non-negative integer.');
      }

      updates.stock = body.stock;
    }

    return updates;
  }
}

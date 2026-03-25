import dataSource from '../data-source';
import { Product } from '../../products/product.entity';

async function seed(): Promise<void> {
  await dataSource.initialize();
  const repository = dataSource.getRepository(Product);

  const existingProducts = await repository.count();
  if (existingProducts > 0) {
    await dataSource.destroy();
    return;
  }

  await repository.save([
    repository.create({
      name: 'Minimal Desk Lamp',
      description: 'Warm light desk lamp with adjustable metal arm.',
      price: 49.99,
      stock: 20,
    }),
    repository.create({
      name: 'Canvas Tote Bag',
      description: 'Reusable canvas tote bag for daily essentials.',
      price: 19.5,
      stock: 40,
    }),
    repository.create({
      name: 'Mechanical Keyboard',
      description: 'Compact mechanical keyboard with tactile switches.',
      price: 129.0,
      stock: 15,
    }),
  ]);

  await dataSource.destroy();
}

void seed();

import dataSource from '../data-source';
import { Customer } from '../../customers/customer.entity';

async function seed(): Promise<void> {
  await dataSource.initialize();
  const repository = dataSource.getRepository(Customer);

  const existingCustomers = await repository.count();
  if (existingCustomers > 0) {
    await dataSource.destroy();
    return;
  }

  await repository.save([
    repository.create({
      name: 'Sara Johnson',
      email: 'sara.johnson@example.com',
      phone: '+1-555-1010',
      address: '245 Market Street, San Francisco, CA',
    }),
    repository.create({
      name: 'Daniel Reed',
      email: 'daniel.reed@example.com',
      phone: '+1-555-8801',
      address: '118 River Road, Austin, TX',
    }),
  ]);

  await dataSource.destroy();
}

void seed();
